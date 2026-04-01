# Jesse AI — RAG Pipeline Documentation

> This document covers the full AI pipeline behind Jesse, ENDevo's life readiness coach. It is written for a developer picking this up for the first time.

---

## Table of Contents

1. [What is Jesse?](#1-what-is-jesse)
2. [Tech Stack & Why](#2-tech-stack--why)
3. [Architecture Overview](#3-architecture-overview)
4. [Data Flow — End to End](#4-data-flow--end-to-end)
5. [Aurora PostgreSQL Schema](#5-aurora-postgresql-schema)
6. [DynamoDB Schema](#6-dynamodb-schema)
7. [Local Setup](#7-local-setup)
8. [Ingestion Scripts](#8-ingestion-scripts)
9. [Environment Variables Reference](#9-environment-variables-reference)
10. [Failure Modes & Fallbacks](#10-failure-modes--fallbacks)
11. [Adding New Knowledge](#11-adding-new-knowledge)

---

## 1. What is Jesse?

Jesse is a floating AI chat assistant embedded in the ENDevo platform. It appears on every screen after login as a persistent panel in the bottom-right corner.

Jesse's job is to:
- Answer questions about life readiness (Legal, Financial, Physical, Digital domains)
- Give **educational** context — never legal, medical, or financial advice
- Personalise responses using the user's Peace of Mind Assessment (POMA) results
- Draw from a curated knowledge base of ENDevo content (podcasts, books, transcripts)

---

## 2. Tech Stack & Why

| Layer | Technology | Why |
|---|---|---|
| LLM (chat) | AWS Bedrock — Claude Haiku (primary), Anthropic SDK (fallback) | Bedrock keeps everything within AWS infrastructure; Anthropic SDK is the safety net if a Bedrock model requires approval |
| Embeddings | AWS Bedrock — Amazon Titan Embed V2 (`amazon.titan-embed-text-v2:0`) | 1024-dim vectors, fast, cheap, no separate API key — same AWS credentials as the rest |
| Vector DB | Aurora PostgreSQL + pgvector extension | Already a managed AWS service; pgvector adds cosine-similarity search directly in SQL — no extra infra |
| Chat history | Aurora PostgreSQL (`chat_history` table) | Co-located with the vector DB; sliding window of 10 messages per user |
| User / session data | AWS DynamoDB (`jesse-users` table) | Single-table design; stores POMA assessment results per user which Jesse reads for personalisation |
| Auth | Firebase Google Auth | Frontend only; the Firebase UID becomes the `userId` key in both DynamoDB and Aurora |
| Backend | Express + TypeScript (`ts-node`) | REST API, runs on port 5000 |
| Frontend | React + Vite + TypeScript | Chat window is a floating FAB that expands to a glassmorphism panel |

**Why RAG instead of just prompting?**

The ENDevo knowledge base (podcasts, books, client transcripts) is too large to fit in a context window, and it changes over time. RAG lets Jesse retrieve only the 5 most relevant chunks for each question, keeping prompts lean and answers grounded in ENDevo's actual content.

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                     │
│   JesseChatWindow.tsx  ──►  POST /api/chat           │
└────────────────────────────┬────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────┐
│               Express Backend (port 5000)            │
│                                                      │
│  POST /api/chat                                      │
│    └── services/chat.ts → processChat()              │
│           │                                          │
│           ├─ 1. Save user msg   → Aurora             │
│           ├─ 2. POMA context    → DynamoDB           │
│           ├─ 3. Embed query     → Bedrock Titan V2   │
│           ├─ 4. Vector search   → Aurora pgvector    │
│           ├─ 5. Build prompt    → system prompt      │
│           ├─ 6. Call LLM        → Bedrock Claude     │
│           └─ 7. Save reply      → Aurora             │
└─────────────────────────────────────────────────────┘
                    │               │
        ┌───────────┘               └────────────┐
        ▼                                        ▼
┌──────────────────┐              ┌──────────────────────┐
│ Aurora PostgreSQL│              │   AWS DynamoDB        │
│                  │              │   jesse-users table   │
│  knowledge_base  │              │                       │
│  chat_history    │              │  SESSION# rows        │
│  (pgvector)      │              │  PROFILE rows         │
└──────────────────┘              └──────────────────────┘
```

---

## 4. Data Flow — End to End

### Chat Request Flow

```
User types a message in the Jesse chat window
        │
        ▼
Frontend: POST /api/chat  { userId, message }
        │
        ▼
backend/services/chat.ts → processChat(userId, message)
        │
        ├── [Step 1] Save user message to Aurora chat_history
        │           saveChatMessage(userId, 'user', message)
        │           Also writes a CHAT# row to DynamoDB (secondary)
        │
        ├── [Step 2] Load POMA assessment from DynamoDB
        │           getUserSessions(userId)
        │           → Returns completed domains + scores + gaps
        │
        ├── [Step 3] Embed the user's message
        │           embedText(message) → Bedrock Titan V2
        │           → Returns float32[1024]
        │
        ├── [Step 4] Vector similarity search
        │           searchKnowledge(embedding, topK=5)
        │           → SQL: ORDER BY embedding <=> $1::vector LIMIT 5
        │           → Returns top-5 relevant chunks from knowledge_base
        │
        ├── [Step 5] Build system prompt
        │           buildSystemPrompt(assessmentContext, knowledgeContext, completedDomains)
        │           → Injects: ENDevo knowledge chunks + POMA results + missing domain nudges
        │           → Enforces: educational-only tone, disclaimer rules, opinion labelling
        │
        ├── [Step 6] Call Claude
        │           Primary:  Bedrock InvokeModelCommand (claude-3-5-haiku)
        │           Fallback: Anthropic SDK (if Bedrock model needs approval)
        │
        ├── [Step 7] Save assistant reply to Aurora chat_history
        │           saveChatMessage(userId, 'assistant', reply)
        │           Also writes to DynamoDB CHAT# row
        │
        └── [Step 8] Return { reply, history } to frontend
```

### Ingestion Flow (one-time / incremental)

```
Documents (PDF / DOCX / VTT / TXT)
        │
        ▼
scripts/ingest-folder.ts
        │
        ├── Scan folder recursively for supported file types
        ├── Query Aurora: SELECT DISTINCT source_file FROM knowledge_base
        ├── Skip any file already in the DB
        │
        └── For each new file:
                │
                ├── Extract text (pdf-parse / mammoth / VTT stripper / raw)
                ├── Chunk text (800 chars, 150 char overlap, min 100 chars)
                │
                └── For each chunk:
                        ├── embedText(chunk) → Bedrock Titan V2 → float32[1024]
                        └── INSERT INTO knowledge_base (content, source_file,
                                chunk_index, embedding, metadata)
```

---

## 5. Aurora PostgreSQL Schema

Aurora is the primary data store for both the knowledge base and chat history.

### knowledge_base

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE knowledge_base (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  content     TEXT        NOT NULL,           -- raw text chunk
  source_file TEXT        NOT NULL,           -- relative path from ingestion folder root
  chunk_index INTEGER     NOT NULL,           -- position within the source file
  embedding   vector(1024),                  -- Titan V2 embedding (1024-dim)
  metadata    JSONB       DEFAULT '{}',       -- arbitrary metadata (folder, zip, etc.)
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- IVFFlat index for fast approximate cosine similarity search
CREATE INDEX ON knowledge_base
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);
```

**Important:** The embedding dimension **must** match the model output. Titan V2 defaults to 1024. If you ever switch embedding models, drop and recreate the table — pgvector enforces dimension at insert time.

### chat_history

```sql
CREATE TABLE chat_history (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    TEXT        NOT NULL,     -- Firebase UID
  role       TEXT        NOT NULL CHECK (role IN ('user', 'assistant')),
  content    TEXT        NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON chat_history (user_id, created_at DESC);
```

Only the **last 10 messages per user** are kept. Every insert automatically prunes older rows. This sliding window keeps the context tight and costs low.

### How to run these SQL statements

Use AWS CloudShell (no local PostgreSQL needed):

```bash
psql -h <AURORA_HOST> -U <AURORA_USER> -d postgres
```

Then paste the SQL above. The `vector` extension must be installed before creating the `knowledge_base` table.

---

## 6. DynamoDB Schema

Single table: **`jesse-users`**

| Attribute | Type | Description |
|---|---|---|
| `userId` | String (PK) | Firebase UID |
| `sessionId` | String (SK) | Row type prefix (see below) |

### Row types (SK prefix patterns)

| sessionId value | Contains |
|---|---|
| `PROFILE` | User name, email, photoURL, lastSeen |
| `SESSION#<ISO timestamp>` | One completed POMA domain result (score, tier, gaps, AI plan) |
| `ASSESSMENT_PROGRESS` | In-progress multi-domain assessment state |
| `CHAT#<ISO timestamp>` | Chat message (secondary store — Aurora is primary) |

Jesse reads `SESSION#` rows to build the POMA context it injects into every prompt. If a domain is missing from the rows, Jesse nudges the user to complete it.

---

## 7. Local Setup

### Prerequisites

- Node.js 18+
- An AWS account with:
  - DynamoDB table (`jesse-users`) created
  - Aurora PostgreSQL cluster running with pgvector enabled
  - Bedrock model access for `amazon.titan-embed-text-v2:0` and a Claude model
- Firebase project with Google Auth enabled

### Step 1 — Clone and install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 2 — Configure environment

Copy the example and fill in your values:

```bash
cp backend/.env.example backend/.env
```

See [Section 9](#9-environment-variables-reference) for what each variable does.

### Step 3 — Create Aurora tables

In AWS CloudShell, connect to your Aurora cluster and run:

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  source_file TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding vector(1024),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON knowledge_base USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON chat_history (user_id, created_at DESC);
```

### Step 4 — Ingest your knowledge base

```bash
cd backend
npx ts-node scripts/ingest-folder.ts ../your-content-folder
```

See [Section 8](#8-ingestion-scripts) for full ingestion details.

### Step 5 — Run locally

```bash
# Terminal 1 — backend
cd backend
npm run dev
# → http://localhost:5000

# Terminal 2 — frontend
cd frontend
npm run dev
# → http://localhost:5173
```

Open the app, log in with Google, and the Jesse chat panel appears in the bottom-right corner.

**Verify the backend is healthy:**

```
GET http://localhost:5000/api/health
```

The response includes `aurora`, `dynamo`, and `bedrock_kb` status fields.

---

## 8. Ingestion Scripts

There are two scripts. Use `ingest-folder.ts` for all new content going forward.

---

### `ingest-folder.ts` — Incremental (recommended)

**File:** `backend/scripts/ingest-folder.ts`

This is the everyday ingestion script. It is safe to run repeatedly — it will never insert a file twice.

```bash
cd backend

# Ingest a specific folder
npx ts-node scripts/ingest-folder.ts ../my-content-folder

# Default: looks for ../uploads/ at the project root
npx ts-node scripts/ingest-folder.ts
```

**Supported file types:** `.pdf`, `.docx`, `.vtt`, `.txt`

**Folder structure:** Any. Files can be nested arbitrarily deep. The relative path from the folder root is used as the `source_file` key for deduplication.

**What it does:**
1. Scans the folder recursively
2. Queries `SELECT DISTINCT source_file FROM knowledge_base`
3. Skips files already present
4. For new files: extracts text → chunks (800 chars, 150 overlap) → embeds via Titan V2 → inserts

**Deduplication key:** The relative file path (e.g. `subfolder/transcript.docx`). If you rename or move a file it will be treated as new. If you want to re-ingest a file that already exists, manually delete its rows from `knowledge_base` first:

```sql
DELETE FROM knowledge_base WHERE source_file = 'subfolder/transcript.docx';
```

---

### `ingest-pdfs.ts` — Original batch script

**File:** `backend/scripts/ingest-pdfs.ts`

This was used for the initial bulk load from the ENDevo zip archive. It reads a specific zip file (`Aryan AI Folder*.zip`) at the project root.

```bash
cd backend
npx ts-node scripts/ingest-pdfs.ts
```

You generally **do not need this script** unless you are re-ingesting from that original zip from scratch. Use `ingest-folder.ts` for all new content.

---

### Chunking strategy

Both scripts use the same chunking logic:

| Parameter | Value | Rationale |
|---|---|---|
| Chunk size | 800 characters | Fits comfortably within Titan's 8192 token limit; large enough to carry meaning |
| Overlap | 150 characters | Prevents a concept that spans a chunk boundary from being lost |
| Minimum chunk | 100 characters | Skips headers, page numbers, and other noise |

---

## 9. Environment Variables Reference

All variables live in `backend/.env`.

```bash
# ── Server ───────────────────────────────────────────────
PORT=5000
NODE_ENV=development

# ── AI / Claude ──────────────────────────────────────────
ANTHROPIC_API_KEY=         # Anthropic SDK key — fallback if Bedrock Claude is unavailable
AI_MODEL=                  # Model for the /api/assess AI plan (e.g. claude-sonnet-4-6)

# ── AWS (shared credentials for DynamoDB + Bedrock) ──────
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-2       # Must match where your Aurora cluster and DynamoDB table live

# ── DynamoDB ─────────────────────────────────────────────
DYNAMO_TABLE=jesse-users   # Table name — PK: userId, SK: sessionId

# ── Bedrock ──────────────────────────────────────────────
BEDROCK_CHAT_MODEL=anthropic.claude-3-5-haiku-20241022-v1:0
BEDROCK_EMBED_MODEL=amazon.titan-embed-text-v2:0
# Note: BEDROCK_EMBED_MODEL must produce vectors whose dimension matches
# the vector(N) column in knowledge_base. Titan V2 defaults to 1024.

# ── Aurora PostgreSQL ────────────────────────────────────
AURORA_HOST=               # Cluster endpoint (not instance endpoint)
AURORA_PORT=5432
AURORA_DB=postgres         # Database name within the cluster
AURORA_USER=
AURORA_PASSWORD=

# ── Email / Resend ───────────────────────────────────────
RESEND_API_KEY=
EMAIL_FROM=

# ── CORS ─────────────────────────────────────────────────
FRONTEND_URLS=http://localhost:5173  # Comma-separated allowed origins
```

### Common mistakes

| Mistake | Symptom | Fix |
|---|---|---|
| `BEDROCK_EMBED_MODEL` not set | Defaults to Titan V1 (1536-dim), mismatches 1024-dim table | Set it explicitly in `.env` |
| Wrong `AWS_REGION` | Embed or DynamoDB calls fail | Must match the region your resources are actually in |
| `VITE_API_URL` has multiple values | Frontend posts to a malformed URL, chat never reaches backend | Set to a single URL, e.g. `http://localhost:5000` |
| Aurora security group blocks local IP | Connection timeout on every Aurora call | Add your IP (or `0.0.0.0/0` temporarily) to inbound rules on port 5432 |

---

## 10. Failure Modes & Fallbacks

The pipeline is designed to degrade gracefully. Jesse will always reply, even if parts of the stack are unavailable.

| Component fails | Effect | Fallback |
|---|---|---|
| Aurora unreachable | No chat history, no RAG context | Chat continues; Jesse replies without knowledge context |
| Bedrock embed fails | No RAG context | `embedText` returns null; knowledge search is skipped |
| Bedrock Claude denied/legacy | Model access error | Falls back to Anthropic SDK using `ANTHROPIC_API_KEY` |
| Anthropic SDK fails | No LLM response | Returns "I'm having trouble connecting right now" |
| DynamoDB unreachable | No POMA context | Jesse replies without personalisation |

---

## 11. Adding New Knowledge

This is the everyday workflow when new ENDevo content needs to be added to Jesse's knowledge base.

**Step 1 — Prepare your files**

Place your documents (`.pdf`, `.docx`, `.vtt`, or `.txt`) in a folder anywhere on your machine. Any folder structure works — the script scans recursively.

**Step 2 — Run the incremental ingest**

```bash
cd backend
npx ts-node scripts/ingest-folder.ts /path/to/your/folder
```

The script will print a summary like:

```
══════════════════════════════════════════════
 Jesse Knowledge Base — Incremental Ingestion
══════════════════════════════════════════════
[ingest] Folder : /path/to/your/folder
[ingest] Found  : 12 supported file(s)

[ingest] Checking knowledge_base for previously ingested files...
[ingest] Already in DB: 6887 unique file(s)

[ingest] SKIP (already in DB)  old-doc.pdf
[ingest] NEW  new-podcast.docx → 14 chunks → 14/14 embedded ✓
...

══════════════════════════════════════════════
 DONE
   new files ingested  : 1
   files skipped (dup) : 1
   chunks embedded     : 14
   chunks skipped      : 0
══════════════════════════════════════════════
```

**Step 3 — Verify**

```bash
psql -h <AURORA_HOST> -U <AURORA_USER> -d postgres \
  -c "SELECT COUNT(*), MAX(created_at) FROM knowledge_base;"
```

The count should have gone up by the number of new chunks. Jesse will use the new content immediately on the next chat request — no restart required.

---

*Last updated: April 2026*
