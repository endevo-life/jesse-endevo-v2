# Jesse v2 by ENDevo
### Full Life Readiness Assessment — AI-Powered, RAG-Guided, Personalized Action Plans

> *"Know where you stand in every part of your life — and know exactly what to do next."*

---

## What is Jesse v2?

Jesse is a full-stack AI-powered life readiness platform. Users sign in with Google, choose from 4 life domains, complete a 10-question assessment per domain, and receive a personalized scored action plan via email. Throughout the entire journey, a RAG-powered Jesse AI agent is available to answer questions in warm, plain language. All data is stored and tied to the user's account so they can return, resume, and track progress over time.

---

## The 4 Life Readiness Domains

Users choose which domain to assess. Each domain has 10 questions. Domains can be taken individually or all together.

---

### 1. Digital Readiness
*"Is your digital life protected and accessible to the right people?"*

| Area | What it Measures |
|------|-----------------|
| Access & Ownership | Password managers, device access, account recovery |
| Data Loss Risk | Backups, cloud storage, photo preservation |
| Platform Limitations | Social media legacy settings, account transferability |
| Stewardship | Who can access your accounts if something happens to you |

**Score Range:** 0–100 | **Tiers:** Starting Fresh → Getting Clarity → On Your Way → Peace Champion

---

### 2. Legal Readiness
*"Are your legal wishes documented and accessible?"*

| Area | What it Measures |
|------|-----------------|
| Will & Testament | Whether a will exists and is current |
| Power of Attorney | Financial and healthcare POA designation |
| Beneficiary Designations | Life insurance, retirement accounts, bank accounts |
| Healthcare Directives | Living will, DNR, advance directive documentation |

**Score Range:** 0–100 | **Tiers:** Legally Exposed → Partially Protected → Well Prepared → Fully Covered

---

### 3. Financial Readiness
*"Could your family navigate your finances without you?"*

| Area | What it Measures |
|------|-----------------|
| Account Access | Joint accounts, login documentation, emergency funds |
| Debt Awareness | Outstanding loans, credit cards, liabilities documented |
| Insurance Coverage | Life, disability, property insurance in place |
| Asset Inventory | Real estate, investments, valuables catalogued |

**Score Range:** 0–100 | **Tiers:** Financially Exposed → Partially Ready → Largely Secure → Fully Prepared

---

### 4. Physical Readiness
*"Are your medical and emergency wishes known and documented?"*

| Area | What it Measures |
|------|-----------------|
| Medical Information | Conditions, medications, allergies documented |
| Emergency Contacts | Designated contacts with correct up-to-date info |
| Healthcare Wishes | Medical power of attorney, organ donation preferences |
| Physical Asset Planning | Home, vehicles, personal property plans |

**Score Range:** 0–100 | **Tiers:** Unprepared → Aware → Taking Action → Fully Prepared

---

## User Journey

```
Google Sign-In
      │
      ▼
Dashboard — choose a domain (Digital / Legal / Financial / Physical)
      │
      ▼
10 Questions (auto-advance, ABCD, progress bar)
  ← RAG Jesse Agent available at any question →
      │
      ▼
Backend: Score → AI Plan → PDF → Email
      │
      ▼
Results stored to database (tied to user account)
      │
      ▼
Confirmation screen — plan on its way!
  ← RAG Jesse Agent available for follow-up questions →
      │
      ▼
Sign Out (session cleared, data persisted in DB for next visit)
```

---

## Authentication — Google OAuth

| Feature | Detail |
|---------|--------|
| Provider | Google OAuth 2.0 |
| Library | Supabase Auth (built-in Google provider) |
| What is stored | UID, name, email, profile photo, created_at |
| Session | JWT token, httpOnly cookie |
| Sign out | Clears session — data remains in DB for next visit |
| No passwords | Google handles all credential management |

Users are recognized on return visits. Past domain scores load into their dashboard automatically.

---

## RAG Agent — Jesse AI at Every Step

The RAG (Retrieval-Augmented Generation) agent gives users personalized, contextual answers throughout the assessment — not generic chatbot responses.

### How RAG Works

```
User asks a question at Q4 of Legal domain
          │
          ▼
Question embedded → vector search on knowledge base
          │
          ▼
Retrieve relevant chunks:
  - ENDevo educational content
  - Domain-specific guidance
  - User's current answers + partial score
          │
          ▼
Inject into Claude prompt → Jesse responds
  Warm, plain, non-legal, non-clinical language
```

### Knowledge Base Contents

| Source | Content |
|--------|---------|
| ENDevo guides | Domain explanations, action steps, examples |
| FAQ library | Common questions per domain |
| Glossary | Plain-English definitions (no jargon) |
| User context | Their answers so far, their score, their tier |

### RAG Available At
- Every quiz question screen (floating Jesse button)
- Loading screen ("What will my score mean?")
- Confirmation screen ("What should I do first?")
- Dashboard (cross-domain questions)

---

## Scoring & AI Pipeline

```
Answers array (10 per domain)
        │
        ▼
Scoring Engine (pure algorithm — no AI)
  A = 10pts | B = 6pts | C = 3pts | D = 0pts
  Domain weights applied → Total score 0–100 → Tier assigned
        │
        ▼
Calculated payload:
  { name, email, domain, score, tier, domain_scores, gaps, signals }
        │
        ▼
Claude AI → 7-day personalized action plan
  (Fallback: static tier plan if API fails — demo never breaks)
        │
        ▼
PDF generated (pdf-lib)
  Page 1: Score profile, donut chart, tier badge
  Page 2: 7-day action plan
        │
        ▼
Email sent via Resend (PDF attached)
        │
        ▼
Results written to database (score, tier, plan, timestamp — linked to user UID)
```

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | React + Vite + TypeScript | Fast, type-safe, same as v1 |
| Styling | Tailwind CSS | Mobile-first, utility classes |
| Auth | Google OAuth via Supabase Auth | Zero credential management |
| Backend | Node.js + Express | Lightweight, proven in v1 |
| AI — Plan Generation | Anthropic Claude API (claude-haiku-4-5) | Fast, cheap, high quality |
| AI — RAG Agent | Anthropic Claude API + pgvector | Contextual, personalized answers |
| Vector Store | Supabase pgvector | Free tier, no extra service needed |
| Database | Supabase (PostgreSQL) — 500MB free | Auth + DB + vector in one service |
| PDF Generation | pdf-lib | Lightweight, server-side |
| Email | Resend API | Reliable, simple, free tier |
| File Storage | AWS S3 | PDF storage, scalable |
| CDN + Hosting | AWS CloudFront + S3 | Global CDN, fast loads |
| Backend Hosting | Railway or AWS Elastic Beanstalk | Scalable Node.js |

---

## Database Schema (Supabase / PostgreSQL)

```sql
-- Users (auto-populated from Google OAuth)
users
  id          uuid PRIMARY KEY
  email       text UNIQUE
  name        text
  avatar_url  text
  created_at  timestamp

-- Assessments (one row per domain per attempt)
assessments
  id            uuid PRIMARY KEY
  user_id       uuid REFERENCES users(id)
  domain        text  -- 'digital' | 'legal' | 'financial' | 'physical'
  score         integer
  tier          text
  domain_scores jsonb
  critical_gaps jsonb
  signals       jsonb
  plan_text     text
  pdf_s3_url    text
  email_sent    boolean
  created_at    timestamp

-- RAG knowledge base chunks
knowledge_chunks
  id          uuid PRIMARY KEY
  domain      text
  content     text
  embedding   vector(1536)
  source      text
```

---

## Cost Estimates

### Anthropic Claude API (Direct)

| Model | Input | Output | Per Assessment* | Per RAG Query |
|-------|-------|--------|----------------|---------------|
| claude-haiku-4-5 | $0.80/MTok | $4.00/MTok | ~$0.01 | ~$0.003 |
| claude-sonnet-4-6 | $3.00/MTok | $15.00/MTok | ~$0.04 | ~$0.012 |

\* Per assessment = ~3,000 input tokens + 2,000 output tokens (7-day plan)
\* Per RAG query = ~1,500 input tokens + 400 output tokens

**Cost per user completing all 4 domains + 10 RAG queries:**

| Model | 4 Assessments | 10 RAG queries | Total per user |
|-------|--------------|----------------|----------------|
| Haiku | ~$0.04 | ~$0.03 | **~$0.07/user** |
| Sonnet | ~$0.16 | ~$0.12 | **~$0.28/user** |

**Monthly projection (Haiku):**

| Users/month | AI cost |
|-------------|---------|
| 100 | ~$7 |
| 500 | ~$35 |
| 1,000 | ~$70 |
| 10,000 | ~$700 |

---

### AWS Bedrock (Alternative AI Provider)

AWS Bedrock hosts Claude models within the AWS ecosystem.

| Model on Bedrock | Input | Output |
|-----------------|-------|--------|
| Claude 3 Haiku | $0.25/MTok | $1.25/MTok |
| Claude 3.5 Haiku | $0.80/MTok | $4.00/MTok |
| Claude 3.5 Sonnet | $3.00/MTok | $15.00/MTok |

**Bedrock RAG (Knowledge Base service):**

| Service | Cost | Note |
|---------|------|------|
| Retrieval queries | $0.10 / 1,000 queries | |
| Titan Embeddings | $0.02 / 1M tokens | |
| OpenSearch Serverless | ~$700/month minimum | **Not recommended for MVP** |

> **Recommendation:** Use Supabase pgvector for RAG at MVP scale. Avoid Bedrock Knowledge Base until you exceed 10,000 users — the OpenSearch minimum cost ($700/mo) makes it expensive early. Switch to Bedrock when you need AWS-native compliance or enterprise scale.

**Cost per user comparison:**

| Option | Cost per user |
|--------|--------------|
| Direct Anthropic Haiku | ~$0.07 |
| Bedrock Claude 3 Haiku | ~$0.03 |
| Bedrock + Knowledge Base (managed RAG) | ~$0.10 + $700/mo fixed |

---

### AWS S3 + CloudFront

#### S3 (PDF + frontend assets)

| Resource | Cost |
|----------|------|
| Storage | $0.023 per GB/month |
| PUT requests | $0.005 per 1,000 |
| GET requests | $0.0004 per 1,000 |
| 1,000 PDFs at 500KB each | ~$0.012/month |

#### CloudFront (CDN)

| Resource | Cost |
|----------|------|
| Data transfer (US/EU) | $0.0085–$0.012 per GB |
| HTTPS requests | $0.01 per 10,000 |
| 1,000 users (~5MB React app) | ~$0.05/month |
| 10,000 users | ~$0.50/month |

**Free Tier (first 12 months):** S3: 5GB storage + 20K GET requests free. CloudFront: 1TB transfer + 10M requests free. **At MVP scale this is effectively $0.**

---

### Total Monthly Cost Summary

| Scale | Anthropic Haiku | Supabase | S3 + CloudFront | Resend | **Total** |
|-------|----------------|----------|-----------------|--------|-----------|
| MVP (100 users) | $7 | Free | Free | Free | **~$7/mo** |
| Growth (1,000 users) | $70 | Free (500MB) | ~$2 | ~$5 | **~$77/mo** |
| Scale (10,000 users) | $700 | $25 (Pro) | ~$15 | ~$20 | **~$760/mo** |

---

## Environment Variables

```env
# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Resend
RESEND_API_KEY=

# AWS
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
S3_BUCKET_NAME=

# App
VITE_API_URL=
FRONTEND_URL=
```

---

## Getting Started

```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && npm install && npm run dev
```

Copy `.env.example` → `.env` and fill in values. Never commit `.env` files.

---

## Branch Rules

- `main` → production (protected, PR + approval required)
- `dev` → integration (merge here first)
- `feature/your-task` → your work

---

## Team

| Role | Person |
|------|--------|
| PM | Niki |
| QA / PO | Brooke |

| Architect & DevOps | FrontEnd | Nermeen|
| Backend (Node.js)/ RAG/ AI | Aryan |
---

## Out of Scope (v2 MVP)

- Real-time streaming Jesse chat
- Multi-language support
- Mobile native app
- HR / employer dashboard
- Document vault or uploads
- Payment / subscription flow
- Admin analytics portal

---

*ENDevo — Plan. Protect. Peace. | endevo.life*
