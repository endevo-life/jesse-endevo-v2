# Jesse v2 by ENDevo
### Full Life Readiness Assessment — AI-Powered, RAG-Guided, Personalized Action Plans

> *"Know where you stand in every part of your life — and know exactly what to do next."*

---

## What is Jesse v2?

Jesse is a full-stack AI-powered life readiness platform. Users sign in with Google, choose from 4 life domains, complete a 10-question assessment per domain, and receive a personalized scored action plan. Results are stored to their account so they can return, see past scores, and track progress over time.

---

## The 4 Life Readiness Domains

Each domain has 10 questions. Domains can be taken individually or all together.

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
Google Sign-In (Firebase Auth)
      │
      ▼
Dashboard — choose a domain (Digital / Legal / Financial / Physical)
  (completed domains shown with score badge)
      │
      ▼
10 Questions (auto-advance, ABCD, progress bar)
      │
      ▼
POST /api/assess/domain
  Score → RAG context (Bedrock KB if configured) → Claude AI Plan
  → Session saved to DynamoDB → 200 returned to frontend
      │
      ▼
Domain Result screen — score, tier, AI plan displayed
      │
      ▼
Download Full Report (PDF — all completed domains combined)
      │
      ▼
Sign Out (session cleared, data persisted in DynamoDB for next visit)
```

---

## Authentication — Firebase Google OAuth

| Feature | Detail |
|---------|--------|
| Provider | Google OAuth 2.0 |
| Library | Firebase Auth SDK |
| What is stored | Firebase UID, name, email, profile photo  |
| Session | Firebase ID token (client-managed) |
| Sign out | Clears local session — all domain data persists in DynamoDB |
| No passwords | Google handles all credential management |

Users are recognized on return visits. Past domain scores and tiers load into the dashboard automatically via `GET /api/user/:uid`.

---

## Scoring & AI Pipeline

```
Answers array (up to 15 per domain)
        │
        ▼
Scoring Engine (pure algorithm — no AI)
  A = 10pts | B = 6pts | C = 3pts | D = 0pts
  Domain weights applied → score 0–100 → tier assigned
        │
        ▼
Payload: { name, email, domain, score, tier, domain_scores, critical_gaps, jesse_signals }
        │
        ▼
(Optional) AWS Bedrock Knowledge Base query
  → retrieve relevant ENDevo content chunks for this domain + gap profile
        │
        ▼
Anthropic Claude (claude-haiku-4-5 default) → 7-day personalized action plan
  Fallback: static tier plan if API key missing — demo never breaks
        │
        ▼
Session saved to DynamoDB (jesse-users table)
  PK: userId (Firebase UID) | SK: SESSION#<ISO timestamp>
        │
        ▼
200 → frontend renders Domain Result screen
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/assess` | Legacy full-assessment (all domains in one request) |
| `POST` | `/api/assess/domain` | Single-domain assessment — scores, generates plan, saves to DB |
| `POST` | `/api/report/pdf` | Generate combined PDF report for all completed domains |
| `GET`  | `/api/user/:uid` | Fetch all domain sessions for a user (dashboard load) |
| `PUT`  | `/api/user/:uid/meta` | Upsert user profile on sign-in |
| `DELETE` | `/api/user/:uid/reset` | Wipe all domain sessions for a user |
| `GET`  | `/api/health` | Service health + env check |

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React 18 + Vite + TypeScript |
| Auth | Firebase Auth — Google OAuth 2.0 |
| Backend | Node.js + Express (TypeScript) |
| AI — Plan Generation | Anthropic Claude API (`claude-haiku-4-5` default) |
| AI — RAG (optional) | AWS Bedrock Knowledge Base |
| Database | AWS DynamoDB (`jesse-users` table) |
| PDF Generation | pdf-lib |
| Email | Resend API |
| File Storage | AWS S3 (optional — PDF storage) |
| Hosting — Frontend | Vercel (Vite — `frontend/`) |
| Hosting — Backend | Vercel Serverless (Express — `backend/`) |

---

## DynamoDB Schema

**Table:** `jesse-users` | **Region:** `us-east-2` (default)

| PK (`userId`) | SK (`sessionId`) | Description |
|---------------|-----------------|-------------|
| Firebase UID | `PROFILE` | User profile row (email, displayName, photoURL) |
| Firebase UID | `SESSION#<ISO>` | Completed domain assessment session |
| Firebase UID | `ASSESSMENT_PROGRESS` | In-progress assessment state |

**Session row fields:** `userId`, `domainKey`, `email`, `displayName`, `answers[]`, `pctScore`, `tier`, `aiPlan`, `criticalGaps[]`, `completedAt`

---

## Deployment — Vercel

Two separate Vercel projects from the same repo:

### Backend (`backend/`)

- Root directory: `backend`
- Build command: `npm run vercel-build` (`tsc`)
- `vercel.json` already configured — routes all traffic to `server.ts`

### Frontend (`frontend/`)

- Root directory: `frontend`
- Framework: Vite (auto-detected)
- `vercel.json` already configured — SPA rewrites to `index.html`

---

## Environment Variables

### Backend (Vercel project)

```env
# Required
ANTHROPIC_API_KEY=
RESEND_API_KEY=
GHL_API_KEY=

# AWS DynamoDB (optional — sessions disabled without this)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-2
DYNAMO_TABLE=jesse-users

# AWS Bedrock RAG (optional — AI plans work without it)
BEDROCK_KNOWLEDGE_BASE_ID=
BEDROCK_MODEL_ARN=

# AWS S3 (optional — PDF downloads still work without it)
S3_BUCKET_NAME=

# CORS — add your frontend Vercel URL
FRONTEND_URLS=https://your-frontend.vercel.app
```

### Frontend (Vercel project)

```env
VITE_API_URL=https://your-backend.vercel.app

# Firebase Auth
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## Getting Started (Local Dev)

```bash
# Backend
cd backend
cp .env.example .env    # fill in keys
npm install
npm run dev             # http://localhost:5000

# Frontend (new terminal)
cd frontend
cp .env.example .env.local    # set VITE_API_URL + Firebase vars
npm install
npm run dev             # http://localhost:5173
```

### Firebase setup
1. Create project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication → Google** sign-in provider
3. Add your Vercel frontend URL to **Authorized domains**
4. Copy the config into `frontend/.env.local` (6 `VITE_FIREBASE_*` vars)

---

## Branch Rules

- `main` → production (Vercel auto-deploys on push)
- `dev` → integration (merge here first)
- `feature/your-task` → your work

---

## Team

| Role | Person |
|------|--------|
| PM | Niki |
| QA / PO | Brooke |
| Architect, DevOps & Frontend | Nermeen |
| Backend, RAG & AI | Aryan |

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
