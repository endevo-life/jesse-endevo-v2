# Jesse by ENDevo — Hackathon Build Guide

**Project:** Jesse Digital Readiness Scanner
**Started:** March 6
**Target:** Fully working MVP in 24–48 hours
**Vibe Coded:** Yes — use Claude Code or GitHub Copilot to generate every file

---

## What We Are Building

A single-page web assessment tool called **Jesse**. Users answer 10 questions about their digital readiness, enter their name and email, then receive a personalised PDF report (7-Day Action Plan) via email. The AI (Claude) scores their answers, writes the plan, generates the PDF, and sends the email automatically.

Flow: Landing → Quiz (10 Qs) → Capture (name + email) → Loading → Confirmation
Simultaneously on the backend: Score → AI Plan → PDF → Email

---

## Team Roles

### Frontend Developer
Responsible for:
- All React screens (5 screens)
- All CSS styling (exact colours, fonts, animations)
- State management and screen flow in `App.tsx`
- Questions data file and scoring utility
- API call to backend endpoint
- Public assets setup

### Backend Developer
Responsible for:
- Express server with single `POST /api/assess` endpoint
- Scoring algorithm (`services/scoring.ts`)
- Anthropic Claude AI integration (`services/ai.ts`)
- PDF generation with `pdf-lib` (`services/pdf.ts`)
- Email send via Resend API (`services/email.ts`)
- Error handling middleware
- Vercel serverless deployment config

---

## Assets Required from Product

Before any coding begins, collect these files from the product team (Niki):

| File | Where Used | Notes |
|------|-----------|-------|
| `logo_v2_with_white_text.png` | Frontend navbar (all screens) + Email header | White text version on dark bg |
| `jesse.png` | Landing avatar, Capture screen, Loading screen | Square/circle crop photo |
| `jesse-intro.mp4` | Landing screen hero video (right column) | Autoplay, looped, muted by default |
| `logo_resized.png` | PDF page headers and footer | Sized to ~170px wide |
| `Jesse-image.png` | PDF score page (circular portrait) | Crisp PNG, will be circle-clipped |

**Frontend assets** go in `frontend/public/` (served at `/`)
**Backend assets** go in `backend/` root (read by fs at runtime)

---

## Design System

Copy these exactly. Do not invent colours or fonts.

### Colours

```
Primary background:  #0f172a  (dark navy)
Secondary bg:        #172554  (blue-navy)
Brand blue:          #1e3a8a  (accent blue for gradients)
Orange primary:      #f97316  (ENDevo brand orange — CTAs, highlights)
Orange dark:         #ea580c  (button gradient end)
Orange glow:         #e8651a  (email / PDF orange)
Amber/yellow:        #fbbf24  (headline accent gradient end)
Green success:       #22c55e  (Peace Champion tier, checkmark)
Blue link:           #2563eb  (Jesse avatar bg, blue elements)
Light grey:          #eceeef  (progress bars, dividers in PDF)
Mid grey:            #8e9aa6  (secondary text in PDF)
```

### Fonts

Import in `index.css` from Google Fonts:

```css
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
```

- **Sora** — headings, CTAs, bold labels, question text, brand labels
- **Inter** — body copy, answer text, sub-headings, captions

### Screen Background Gradients

```css
/* Landing */
background: linear-gradient(145deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%);

/* Quiz, Capture, Loading, Confirmation */
background: linear-gradient(160deg, #0f172a 0%, #172554 60%, #0f172a 100%);
```

### Noise Overlay (on every screen)

```css
.noise-overlay {
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  opacity: 0.35;
  pointer-events: none;
  z-index: 0;
}
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 18 + TypeScript |
| Frontend bundler | Vite 5 |
| Frontend deploy | Vercel (static) |
| Backend runtime | Node.js + Express + TypeScript |
| Backend deploy | Vercel (serverless function) |
| AI | Anthropic SDK (`@anthropic-ai/sdk`) — model: `claude-sonnet-4-6` |
| Email | Resend (`resend`) |
| PDF | `pdf-lib` + `axios` (QuickChart for doughnut chart) |
| HTTP requests | `axios` |

---

## Project Structure

```
project-root/
├── frontend/
│   ├── public/
│   │   ├── logo_v2_with_white_text.png
│   │   ├── jesse.png
│   │   └── jesse-intro.mp4
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── vite-env.d.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── api/
│   │   │   └── config.ts
│   │   ├── data/
│   │   │   └── questions.ts
│   │   ├── utils/
│   │   │   └── scoring.ts
│   │   └── pages/
│   │       ├── LandingScreen.tsx
│   │       ├── LandingScreen.css
│   │       ├── QuizScreen.tsx
│   │       ├── QuizScreen.css
│   │       ├── CaptureScreen.tsx
│   │       ├── CaptureScreen.css
│   │       ├── LoadingScreen.tsx
│   │       ├── LoadingScreen.css
│   │       ├── ConfirmationScreen.tsx
│   │       └── ConfirmationScreen.css
│   ├── .env.example
│   ├── vercel.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
└── backend/
    ├── server.ts               (Express app + /api/assess route)
    ├── vercel.json
    ├── tsconfig.json
    ├── package.json
    ├── .env.example
    ├── logo_resized.png        (PDF asset — put here)
    ├── Jesse-image.png         (PDF asset — put here)
    ├── types/
    │   └── index.ts
    ├── middleware/
    │   └── errorHandler.ts
    └── services/
        ├── scoring.ts
        ├── ai.ts
        ├── pdf.ts
        └── email.ts
```

---

## Environment Variables

### Backend `.env`

```env
PORT=5000
NODE_ENV=development

ANTHROPIC_API_KEY=your_anthropic_api_key_here
AI_MODEL=claude-sonnet-4-6
AI_TIMEOUT_MS=10000

RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=hello@endevo.life
EMAIL_REPLY_TO=hello@endevo.life

FRONTEND_URLS=http://localhost:3000,http://localhost:5173
```

### Frontend `.env.local`

```env
VITE_API_URL=http://localhost:5000
```

On Vercel, set `VITE_API_URL` to your backend Vercel URL.

---

## API Keys Required

1. **Anthropic API key** — from console.anthropic.com — for Claude AI plan generation
2. **Resend API key** — from resend.com — for sending emails with PDF attachment
3. Both must be set as environment variables in the Vercel backend project settings

---

## Commit Strategy

Only one branch: `main`
Admin (Nermeen) created the repo. Both devs push to `main` directly during the hackathon.

```bash
# Start of session
git pull origin main

# After completing each feature
git add .
git commit -m "feat: [short description]"
git push origin main
```

**Commit message prefixes:**
- `feat:` — new screen, new feature, new endpoint
- `fix:` — bug fix
- `style:` — CSS changes only
- `chore:` — setup, config, env files

**Never commit:**
- `.env` files
- `node_modules/`

**Suggested checkpoints:**

```
chore: init frontend vite project
chore: init backend express project
feat: add questions data and types
feat: add scoring algorithm
feat: landing screen and CSS
feat: quiz screen with progress bar
feat: capture screen form
feat: loading screen with Jesse animation
feat: confirmation screen with share button
feat: POST /api/assess endpoint scaffold
feat: scoring service complete
feat: AI plan generation with Claude
feat: PDF generation with pdf-lib
feat: email send via Resend
fix: CORS and env config
style: phase 2 UI polish - landing
style: phase 2 UI polish - quiz
style: phase 2 UI polish - all screens
feat: vercel deployment config
```

---

# PHASE 1 — Build Everything (Functional First)

Target: ~16 hours

---

## PHASE 1A — Backend Developer Tasks

### Step 1 — Project Setup (~30 min)

```bash
mkdir backend && cd backend
npm init -y
npm install express cors dotenv @anthropic-ai/sdk resend pdf-lib axios
npm install -D typescript @types/node @types/express @types/cors ts-node nodemon
npx tsc --init
```

`tsconfig.json` settings:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["./**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

`package.json` scripts:
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

Copy `.env.example` → `.env` and fill in real API keys.

### Step 2 — Types (`backend/types/index.ts`) (~15 min)

Create these TypeScript interfaces:

```typescript
export type AnswerLetter = 'A' | 'B' | 'C' | 'D';

export interface Answer {
  q: number;
  answer: AnswerLetter;
}

export interface DomainScores {
  access_ownership:    number;
  data_loss:           number;
  platform_limitation: number;
  stewardship:         number;
}

export interface ScoringResult {
  readiness_score: number;
  tier:            string;
  domain_scores:   DomainScores;
  critical_gaps:   string[];
  jesse_signals:   string[];
  lowest_domain:   string;
}

export interface AssessmentPayload extends ScoringResult {
  name:  string;
  email: string;
}

export interface PlanResult {
  plan:   string;
  source: 'ai' | 'static';
}

export interface EmailSendParams {
  name:      string;
  email:     string;
  score:     number;
  tier:      string;
  pdfBuffer: Buffer;
}

export type EmailSendResult = { skipped: true } | { id?: string };

export interface PDFGenerationParams {
  name:            string;
  readiness_score: number;
  tier:            string;
  domain_scores:   DomainScores;
  plan:            string;
}
```

### Step 3 — Error Handler Middleware (`backend/middleware/errorHandler.ts`) (~20 min)

Create custom error classes and middleware:
- `AppError` (base class with `statusCode`, `code`, `isOperational`)
- `ValidationError extends AppError` (400)
- `NotFoundError extends AppError` (404)
- `ServiceError extends AppError` (502)
- `asyncHandler(fn)` — wraps async routes, catches errors and passes to `next()`
- `notFoundHandler` — 404 response
- `errorHandler` — global error handler (4 args, must be last middleware)

### Step 4 — Scoring Service (`backend/services/scoring.ts`) (~45 min)

The scoring algorithm. This is the core logic.

**Point values:** A=10, B=6, C=3, D=0

**Domain mapping (question → domain):**
```
Q1  → access_ownership    (phone access)
Q2  → access_ownership    (password count)
Q3  → data_loss           (social media fate)
Q4  → platform_limitation (digital legacy manager)
Q5  → stewardship         (wishes shared)
Q6  → access_ownership    (password manager)
Q7  → stewardship         (document storage)
Q8  → data_loss           (cloud backup)
Q9  → platform_limitation (2FA)
Q10 → access_ownership    (handover speed)
```

**Domain max scores:** access_ownership=40, data_loss=20, platform_limitation=20, stewardship=20

**Tier thresholds:**
- 85–100 = "Peace Champion"
- 60–84  = "On Your Way"
- 35–59  = "Getting Clarity"
- 0–34   = "Starting Fresh"

**Function `score(answers: Answer[]): ScoringResult`:**
1. Loop through answers, add points, track domain raw scores
2. For C or D answers, push to `criticalGaps` and look up a human-readable signal string
3. Find the tier from thresholds
4. Find the lowest domain by pct (raw / max)
5. Return full `ScoringResult`

**Jesse signals (human-readable gap descriptions) for C and D per question:**

| Q | D | C |
|---|---|---|
| 1 | No legacy contact set up — loved ones cannot access your phone | Phone access is informal — needs a formal Legacy Contact |
| 2 | Password volume completely unmanaged — no system in place | High password count with no central system — manager needed |
| 3 | No idea what happens to social media accounts after death | Aware of the social media issue but no action taken |
| 4 | No digital legacy manager designated — accounts have no backup plan | Digital legacy not yet assigned — still on the to-do list |
| 5 | Wishes unknown to family — creates burden and guesswork | Wishes not yet clearly defined or documented |
| 6 | No password manager — digital security has no foundation | Password manager unused or outdated — needs attention |
| 7 | Important documents unknown or inaccessible | Documents scattered across formats — no unified system |
| 8 | No cloud backup — data loss risk is critical | Cloud backup partial — critical files still at risk |
| 9 | 2FA not set up — accounts are vulnerable | 2FA only partially configured — key accounts still exposed |
| 10 | Digital handover would be nearly impossible — highest urgency | Handover would require a full day of serious effort |

### Step 5 — AI Service (`backend/services/ai.ts`) (~60 min)

**Responsibilities:**
1. Build a prompt for Claude using the assessment data
2. Call `@anthropic-ai/sdk` with model `claude-sonnet-4-6`, max_tokens 1200
3. Apply a 10-second timeout using `Promise.race`
4. On any failure (no key, timeout, error) → silently fall back to static plans

**Claude system prompt:**
```
You are Jesse, ENDevo's warm and trusted digital readiness guide.
You help people feel prepared and clear — not scared or overwhelmed.
Your tone is: warm, direct, practical, encouraging. Never legal or clinical.
No estate planning language. No medical or financial advice. Educational only.
```

**User prompt format:**
```
Generate a 7-day action plan for {name}.
Their Readiness Score is {score}/100. Their tier is: {tier}.
Their critical gaps are:
- {signal 1}
- {signal 2}
Their weakest domain is: {domain}.

Format output as plain text:
Day 1: Short Day Title
- Bold Action Title | One sentence warm explanation.
- Bold Action Title | One sentence warm explanation.
NOTE: Day 1 done. Encouragement. Tomorrow: [next focus].

...continue for Day 2 through Day 7.

Rules:
- Plain text only. No markdown. No #, **, __, >, or extra symbols.
- Each day header: "Day N: Title" on its own line.
- Each action item starts with "- " then Bold Title | Description (pipe separator).
- 2-3 action items per day.
- Each NOTE line starts with "NOTE: " and is one sentence.
- Do not mention legal documents, attorneys, or financial advisors.
```

**Static fallback plans** — create one for each of the 4 tiers (Peace Champion, On Your Way, Getting Clarity, Starting Fresh). Each must follow the same Day 1–7 plain text format above. These are used when the AI call fails or no API key is set.

Fallback for "Peace Champion" focuses on: reviewing legacy contacts, auditing vault, verifying 2FA, reviewing social media, refreshing documents, briefing contact, setting 6-month review.

Fallback for "On Your Way" focuses on: setting up legacy contact, choosing a password manager, enabling 2FA on email/bank, building account list, setting social media memorialization, telling someone where things are, backing up irreplaceable files.

Fallback for "Getting Clarity" focuses on: writing down 3 critical accounts, setting up password manager, setting up legacy contact, sharing email access, enabling 2FA on email, backing up photos, having the conversation.

Fallback for "Starting Fresh" focuses on: writing 3 things down, choosing a trusted person, setting up password manager, giving someone phone passcode, finding important documents, turning on photo backup, telling your person everything.

**Export:** `async function generatePlan(payload: AssessmentPayload): Promise<PlanResult>`

### Step 6 — PDF Service (`backend/services/pdf.ts`) (~120 min)

This is the most complex service. Use `pdf-lib`.

**Dependencies:** `pdf-lib`, `axios` (for QuickChart doughnut), `fs`, `path`

**PDF Brand Colours (use `rgb()` from pdf-lib):**
```
NAVY    = rgb(0.106, 0.165, 0.290)  // #1B2A4A
ORANGE  = rgb(0.910, 0.396, 0.102)  // #E8651A
WHITE   = rgb(1, 1, 1)
LGREY   = rgb(0.925, 0.929, 0.937)  // #ECEEF0
MGREY   = rgb(0.557, 0.604, 0.651)  // #8E9AA6
LORANGE = rgb(0.996, 0.949, 0.929)  // light orange tint for NOTE backgrounds
```

**Domain colours for chart:**
```
access_ownership:    rgb(0.290, 0.565, 0.851)  // blue
data_loss:           rgb(0.176, 0.831, 0.745)  // teal
platform_limitation: rgb(0.910, 0.396, 0.102)  // orange
stewardship:         rgb(0.133, 0.773, 0.369)  // green
```

**Domain labels for PDF:**
```
access_ownership:    "Getting Into Your Accounts"
data_loss:           "Protecting Files & Memories"
platform_limitation: "App & Online Safety"
stewardship:         "Family & Future Planning"
```

**Tier colours:**
```
"Peace Champion":  rgb(0.133, 0.773, 0.369)  // green
"On Your Way":     rgb(0.290, 0.565, 0.851)  // blue
"Getting Clarity": rgb(0.910, 0.396, 0.102)  // orange
"Starting Fresh":  rgb(0.659, 0.333, 0.969)  // purple
```

**Assets loaded from filesystem:**
```typescript
const LOGO_PATH  = path.resolve(process.cwd(), 'logo_resized.png');
const JESSE_PATH = path.resolve(process.cwd(), 'Jesse-image.png');
```

**PDF Structure — Page 1 (Score Profile):**
- White header bar (88px) with orange accent strip (4px) below it
- Logo in header (left), report label + name/date (right)
- Large score number (72pt bold) in NAVY, "/100" in MGREY
- Tier badge rectangle (coloured by tier) with tier label in white
- Opening line (1 sentence, based on tier)
- Jesse circular portrait (right side, 38px radius, ORANGE border, clipped from `Jesse-image.png`)
- "Your Score Breakdown" section:
  - LEFT column (215px wide): 4 domain progress bars with % labels
  - RIGHT column: doughnut chart fetched from QuickChart API (220x220, `https://quickchart.io/chart?c=...`) + 2x2 legend grid below it
- "Your 7-Day Journey" tracker: 7 circles (Day 1 is ORANGE filled, others outlined), day labels below
- Footer disclaimer line

**PDF Structure — Page 2+ (7-Day Action Plan):**
- NAVY header bar (76px): "Your 7-Day Digital Readiness Plan" + "Prepared for {name} · {tier}" + logo
- Two-column layout: LEFT column (148px) = Day title, RIGHT column = checkboxes + content
- For each day:
  - "DAY 0N" in ORANGE (8pt), day title in NAVY (16pt bold) — LEFT column
  - Checkbox items (interactive AcroForm checkboxes via `form.createCheckBox()`) — RIGHT column
  - Each item: Bold title (11pt NAVY) + description (10pt MGREY)
  - NOTE: light orange background block with left ORANGE bar, NOTE text in ORANGE (9pt)
  - Grey divider line between days
- "MY NOTES" section at end: interactive multi-line text field
- NAVY footer on every plan page: website URL + tagline + logo

**Text utilities:**
- `sanitize(text)` — strip markdown symbols (#, **, __, etc.), convert smart quotes/dashes
- `wrapText(text, font, size, maxWidth)` — word-wrap to array of lines
- `drawCircleImage(page, image, cx, cy, r, borderColor?)` — bezier curve clip for circular image

**Export:** `async function generatePDF(params: PDFGenerationParams): Promise<Buffer>`

### Step 7 — Email Service (`backend/services/email.ts`) (~45 min)

Use the `resend` npm package.

**Logo in email:** use a public HTTPS URL. Read from env var `PUBLIC_LOGO_URL`, fallback to `https://[your-vercel-frontend-url]/logo_v2_with_white_text.png`. Email clients block base64/data-URI images — must be a real URL.

**Email HTML structure (table-based for email client compatibility):**
- Background: `#F0F4F8`
- Container: 600px wide, white, rounded, shadow
- Header: `#1B2A4A` background, logo centered, "Jesse" h1 in white, subtitle in `#94A3B8`
- Orange accent bar: `#E8651A`, 4px height
- Body section:
  - "Hi {name}," in bold `#1B2A4A`
  - Score card: `#F8FAFC` background, score in large `#1B2A4A` number, tier badge coloured by tier
  - Instruction to open PDF attachment
  - Warm sign-off from Jesse
- CTA button: `#E8651A` background, "Visit ENDevo →"
- Footer: `#F8FAFC`, ENDevo name, "Plan. Protect. Peace.", website link, disclaimer

**Tier colours in email:**
```javascript
"Peace Champion":  "#22C55E"
"On Your Way":     "#4A90D9"
"Getting Clarity": "#E8651A"
"Starting Fresh":  "#A855F7"
```

**PDF filename format:** `{SafeName}-7DayReadinessPlan-{MM}-{DD}-{YYYY}.pdf`

**Send via Resend:**
```typescript
resend.emails.send({
  from:        "hello@endevo.life",
  to:          email,
  reply_to:    "hello@endevo.life",
  subject:     "Your 7-Day Digital Readiness Plan from Jesse",
  html:        buildEmailHtml(...),
  attachments: [{ filename, content: pdfBuffer.toString('base64'), content_type: 'application/pdf' }]
})
```

If `RESEND_API_KEY` is missing or is the placeholder value → skip silently and return `{ skipped: true }`.

**Export:** `async function sendPlanEmail(params: EmailSendParams): Promise<EmailSendResult>`

### Step 8 — Main Server (`backend/server.ts`) (~45 min)

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
```

**CORS allowed origins:**
- `http://localhost:5173`
- `http://localhost:5174`
- `http://localhost:3000`
- `https://[your-frontend-vercel-url].vercel.app`
- `https://*.vercel.app`
- Any URLs in `FRONTEND_URLS` env var (comma-separated)

**Single route:** `POST /api/assess`

**Validation:**
- `name` — non-empty string
- `email` — valid email format regex
- `answers` — array of exactly 10 items, each with `q` and `answer` in A/B/C/D

**Pipeline (in order):**
1. `score(answers)` — sync
2. `generatePlan(payload)` — async, never throws (has silent fallback)
3. `generatePDF({...})` — async
4. `sendPlanEmail({...})` — async
5. Return `{ success: true, message: "Plan sent successfully" }` with 200

**Health check:** `GET /api/health` — returns status, keys present (boolean), env

**Last two middleware:** `notFoundHandler`, then `errorHandler`

**Vercel export:** `if (process.env.VERCEL) { module.exports = app; } else { app.listen(PORT) }`

### Step 9 — Backend `vercel.json`

```json
{
  "version": 2,
  "functions": {
    "server.ts": {
      "includeFiles": "*.png"
    }
  },
  "routes": [
    { "src": "/(.*)", "dest": "server.ts" }
  ]
}
```

The `includeFiles: "*.png"` is critical — it bundles the logo and Jesse image assets into the serverless function so `fs.readFileSync` can find them at runtime on Vercel.

---

## PHASE 1B — Frontend Developer Tasks

### Step 1 — Project Setup (~20 min)

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

No additional npm packages needed. React 18 + TypeScript is sufficient.

Create `.env.local`:
```
VITE_API_URL=http://localhost:5000
```

### Step 2 — Global Styles (`frontend/src/index.css`) (~15 min)

- Import Sora + Inter from Google Fonts
- CSS reset (`*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }`)
- Body: `font-family: 'Inter', sans-serif; background: #0f172a; color: white;`
- Shared `.noise-overlay` class
- Shared `.screen-nav` class (top nav with logo, used on Quiz/Capture/Loading/Confirmation)
- Shared `.screen-nav-logo` class: `width: 170px; height: auto;`
- Custom scrollbar: thin, `rgba(249,115,22,0.4)` thumb
- Selection: `rgba(249,115,22,0.3)` background

### Step 3 — Types (`frontend/src/types/index.ts`) (~10 min)

```typescript
export type AppScreen = "landing" | "quiz" | "capture" | "loading" | "confirmation";

export interface UserAnswers {
  [questionId: string]: {
    answer: string;
    score: number;
    domain: string;
  };
}

export interface AssessmentPayload {
  name: string;
  email: string;
  answers: UserAnswers;
}
```

### Step 4 — API Config (`frontend/src/api/config.ts`) (~5 min)

```typescript
const raw = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE_URL = raw.startsWith("http") ? raw : `https://${raw}`;

export const API_ENDPOINTS = {
  assess: `${API_BASE_URL}/api/assess`,
};
```

### Step 5 — Questions Data (`frontend/src/data/questions.ts`) (~30 min)

Define `Question` and `Answer` interfaces. Export `QUESTIONS` array (10 questions).

**Question structure:**
```typescript
interface Question {
  id: string;
  number: number;
  domain: string;
  weight: number;
  text: string;
  answers: Array<{ label: string; text: string; score: number }>;
}
```

**The 10 questions with exact answer text and scores (A=10, B=6, C=3, D=0):**

**Q1 — Access & Ownership Risk**
"If you died tomorrow, could your loved ones access the data on your phone?"
A: "Yes — I have Legacy Contacts set up with multiple people identified."
B: "Yes — I have one Legacy Contact set up."
C: "Maybe — they know my password but nothing is formally set up."
D: "No — no one knows my password and I use biometrics only."

**Q2 — Access & Ownership Risk**
"How many logins and passwords do you have across all your accounts?"
A: "Under 25 — I keep things streamlined."
B: "Around 25–100 — a manageable mix."
C: "Over 100 — I've lost count."
D: "Way too many to count — it's genuinely overwhelming."

**Q3 — Data Loss Risk**
"What do you think happens to your social media accounts after you die?"
A: "I know exactly — I've set my account memorialization preferences already."
B: "They'll probably become ghost accounts, frozen in time."
C: "They could become zombie accounts living on the dark web forever."
D: "Honestly, I have no idea — I've never thought about it."

**Q4 — Platform Limitation Risk**
"Have you designated someone to manage your digital legacy — logins, social media, memberships, subscriptions — if something happens to you?"
A: "Yes — it's documented and the right person already has access."
B: "I have a document with all my logins but no one else has it."
C: "I've been meaning to do this — it's on my list."
D: "I wouldn't even know where to start."

**Q5 — Stewardship Risk**
"Do the significant people in your life know what you want to happen upon your death or incapacitation?"
A: "Yes — my wishes are recorded in a document and shared with them."
B: "Yes — I've shared my wishes verbally but nothing is written down."
C: "Not really — I'm not sure what my wishes are yet."
D: "No — we're all uncomfortable talking about it."

**Q6 — Access & Ownership Risk**
"Do you currently use a password manager to store your logins and credentials?"
A: "Yes — I use one consistently and it's up to date."
B: "Yes — but I don't use it consistently or it's out of date."
C: "No — I rely on my browser or memory."
D: "No — I've never used one and don't know where to start."

**Q7 — Stewardship Risk**
"Where do you store your most important documents — insurance policies, financial account details, key instructions?"
A: "In a secure digital vault or encrypted folder, organised and accessible."
B: "Across a mix of places — some digital, some physical, not well organised."
C: "Mostly in physical files at home — no real digital backup."
D: "Honestly, I'm not sure where everything is."

**Q8 — Data Loss Risk**
"Do you use cloud storage (like iCloud, Google Drive, or Dropbox) to back up important personal files and photos?"
A: "Yes — everything important is backed up and organised in the cloud."
B: "Yes — I have cloud storage but it's disorganised."
C: "Partially — some things are backed up but not everything critical."
D: "No — I rely on local storage only (my phone or hard drive)."

**Q9 — Platform Limitation Risk**
"Have you enabled two-factor authentication (2FA) on your most important accounts?"
A: "Yes — 2FA is enabled on all critical accounts (banking, email, social)."
B: "Yes — on some accounts, but not all."
C: "I've heard of it but haven't set it up."
D: "No — I didn't know this was something I should do."

**Q10 — Access & Ownership Risk**
"If you had to hand over access to all your digital accounts to a trusted person right now, how long would it take?"
A: "Under an hour — everything is documented and ready to share securely."
B: "A few hours — I'd need to gather and organise things first."
C: "A full day or more — it would take serious effort."
D: "It would be nearly impossible — I don't know where to start."

**Also export readiness tiers:**
```typescript
export const READINESS_TIERS = {
  champion: { label: "Peace Champion", emoji: "🏆", color: "#22c55e",
    opening: "You're genuinely ahead of most people. Let's make sure it stays that way.",
    priority: "Quarterly review + legacy contact verification" },
  onway: { label: "On Your Way", emoji: "✅", color: "#3b82f6",
    opening: "You've started — now let's close the gaps before they become problems.",
    priority: "Address lowest-scoring domain first" },
  clarity: { label: "Getting Clarity", emoji: "💡", color: "#f59e0b",
    opening: "You're more aware than most. A few focused steps will change everything.",
    priority: "Build digital vault + designate legacy contact" },
  fresh: { label: "Starting Fresh", emoji: "🌱", color: "#ef4444",
    opening: "No worries — this is exactly the right place to start. Jesse will guide you.",
    priority: "Full onboarding — flag as highest-priority lead" },
};

export function getTier(score: number) {
  if (score >= 85) return READINESS_TIERS.champion;
  if (score >= 60) return READINESS_TIERS.onway;
  if (score >= 35) return READINESS_TIERS.clarity;
  return READINESS_TIERS.fresh;
}
```

### Step 6 — Scoring Utility (`frontend/src/utils/scoring.ts`) (~20 min)

```typescript
export function calculateScore(answers: UserAnswers): number {
  return Object.values(answers).reduce((sum, a) => sum + a.score, 0);
}

export function getDomainBreakdown(answers: UserAnswers) {
  // Track raw score + max per domain
  // Calculate pct = raw / max * 100
  // Return: { "Domain Name": { raw, max, pct } }
}

export function getLowestDomain(breakdown): string {
  // Return the domain key with lowest pct
}
```

Domains to track: `"Access & Ownership Risk"`, `"Data Loss Risk"`, `"Platform Limitation Risk"`, `"Stewardship Risk"`

### Step 7 — App State Manager (`frontend/src/App.tsx`) (~30 min)

Single `App` component manages all screen state:

**State:**
- `screen` — current screen (`AppScreen` type)
- `currentQuestion` — index 0–9
- `answers` — object keyed by question ID
- `userName` — captured from CaptureScreen
- `isLongWait` — true if loading takes >15 seconds

**Handlers:**
- `handleStart()` — sets screen to "quiz"
- `handleAnswer(questionId, answerLabel, score, domain)` — stores answer, advances question or moves to "capture"
- `handleBack()` — goes to previous question or back to landing
- `handleCapture(name, email)` — stores name, sets screen to "loading", calls API, then sets screen to "confirmation"

**API call in `handleCapture`:**
Transform `answers` object into array format: `[{ q: 1, answer: "A" }, ...]`

POST to `API_ENDPOINTS.assess` with `{ name, email, answers: answersArray }`

On success OR failure → always show confirmation screen (graceful fallback).

**Long-wait timer:** `useEffect` watches `screen === "loading"`, sets `isLongWait = true` after 15 seconds, cleans up on unmount.

### Step 8 — Landing Screen (~45 min)

**File:** `frontend/src/pages/LandingScreen.tsx` + `LandingScreen.css`

**Layout:**
- Full viewport, navy-to-blue gradient background + noise overlay
- Top nav: logo left (`logo_v2_with_white_text.png`, 170px wide)
- Hero section: two-column grid (1fr 1fr, gap 3rem, stacks to 1 col on mobile)
  - **LEFT column:**
    - Jesse badge row: circular `jesse.png` photo (52px, orange border) + "Jesse · Your Digital Guide" label
    - H1: "Find out if your **digital life is ready** in 90 seconds." (accent on middle line in orange-to-amber gradient)
    - Subtitle: "Jesse will ask you 10 questions and build your personal 7-day Digital Readiness Plan, sent straight to your inbox."
    - Stats pills row: "10 Questions" | dot | "90 Seconds" | dot | "Free PDF Report"
    - Jesse intro bubble: `background: rgba(255,255,255,0.08); border-radius: 14px` with text "Jesse: I'll guide you..."
  - **RIGHT column:**
    - Video player: `<video src="/jesse-intro.mp4" autoPlay loop muted playsInline />`
    - Mute/unmute toggle button (bottom right of video, 34px circle)
- CTA button (below both columns, centered): "Start My Assessment →" — orange gradient pill button
- Disclaimer: "Not legal or financial advice. Free educational program. We do not store your data."
- Decorative wave SVG at bottom

**Animations:** All elements use `slideUp` keyframe (opacity 0→1, translateY 20px→0) with staggered delays (0.1s, 0.2s, 0.3s...). Jesse avatar uses `floatIn`. Avatar glow uses `pulse`.

### Step 9 — Quiz Screen (~60 min)

**File:** `frontend/src/pages/QuizScreen.tsx` + `QuizScreen.css`

**State:** `selected` (answer label), `animating`, `visible` (for slide animation)

**Layout:**
- Top bar: left side (logo + back chevron button), center (Q{N} of 10 counter with orange N), right empty spacer
- Progress bar: thin 3px bar below topbar, orange-to-amber gradient fill, smooth CSS transition on width change
- Question card: max 660px centered, with `slide-in` / `slide-out` CSS animation classes
  - Domain tag pill (orange tint, uppercase small caps)
  - Question text (Sora bold, clamp 1.3–1.7rem)
  - 4 answer buttons (full width, dark transparent bg, rounded 14px):
    - Default: subtle border
    - Hover: slight orange tint, border orange, `translateX(4px)` shift
    - Selected: orange gradient background, orange border, check SVG icon on right
    - Answer label (A/B/C/D) in orange left side
  - Jesse hint: small avatar circle (J letter, blue gradient bg) + italic "Take your time — there are no wrong answers."

**Answer selection flow:**
1. User clicks answer → `setSelected(label)`
2. 400ms delay → start exit animation (`slide-out`)
3. 350ms later → call `onAnswer(...)` (this advances to next question or capture screen)

**Back button:** Goes to previous question (decrement index) or to landing if on Q1.

### Step 10 — Capture Screen (~30 min)

**File:** `frontend/src/pages/CaptureScreen.tsx` + `CaptureScreen.css`

**State:** `name`, `email`, `errors`, `submitting`

**Layout:**
- Top nav with logo
- Centered card (max 500px, frosted glass: `rgba(255,255,255,0.04)`, `backdrop-filter: blur(12px)`, border 1px `rgba(255,255,255,0.1)`, rounded 24px)
  - Jesse avatar: 92px circle with 3px orange border, `object-position: top center`, animated orange glow ring behind it
  - Heading: "Great — your plan is almost ready."
  - Sub: "Where should Jesse send it?"
  - Form fields:
    - First Name input (dark translucent bg, orange focus ring)
    - Email input
    - Inline validation error messages in `#f87171`
  - Submit button: "Send My 7-Day Plan →" (full width, orange gradient)
  - Micro copy: "We'll send your personalised PDF to this email. No spam, ever."

**Validation:**
- Name: non-empty
- Email: regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

### Step 11 — Loading Screen (~20 min)

**File:** `frontend/src/pages/LoadingScreen.tsx` + `LoadingScreen.css`

**Props:** `isLongWait: boolean`

**Layout:**
- Top nav with logo
- Centered content:
  - Jesse avatar (80px circle, orange border, `breathe` scale animation)
  - 3 concentric pulsing rings (100/130/160px, orange border, staggered `ringPulse` animation)
  - 3 thinking dots (8px orange circles, `dotBounce` animation, staggered 0s / 0.2s / 0.4s)
  - Heading: "Jesse is working on your plan"
  - Rotating copy lines (4 messages, swap every 2.5 seconds with fade transition):
    1. "Jesse is reviewing your answers..."
    2. "Calculating your Readiness Score..."
    3. "Building your personalised 7-day plan..."
    4. "Almost ready — this is going to be good."
  - Pulse progress bar: 40% wide bar sliding left-to-right in loop
  - If `isLongWait`: show "Still working on your plan... almost there." in italic grey

### Step 12 — Confirmation Screen (~30 min)

**File:** `frontend/src/pages/ConfirmationScreen.tsx` + `ConfirmationScreen.css`

**Props:** `name: string`

**Layout:**
- Top nav with logo
- Centered content (max 520px, `fadeUp` entrance animation):
  - Animated checkmark: SVG circle + path drawing animation (stroke-dashoffset transition), 6 orange sparkle dots burst outward on entrance
  - Heading: "Your plan is on its way, **{name}!**" (name in orange-to-amber gradient)
  - Info card (frosted glass): email icon + "Check your inbox — Jesse has built your personalised 7-Day Digital Readiness Plan." + spam note
  - Actions:
    - Share button: "Share with someone you love" — uses `navigator.share()` API, fallback to clipboard copy
    - Link: "Learn more about ENDevo →" in orange
  - Jesse sign-off block (blue-tinted background):
    - J avatar circle (blue gradient, orange border)
    - Quote: "Every step you take today protects the people you love tomorrow."
    - "— Jesse, ENDevo"

---

# PHASE 2 — UI Polish and Integration

Target: ~8 hours (after Phase 1 is fully functional)

### Goals of Phase 2:
1. Both devs merge their work and test the full flow end-to-end
2. Polish CSS to match the reference design exactly
3. Fix any visual inconsistencies
4. Test on mobile (responsive breakpoints)
5. Verify deployment to Vercel

### Phase 2 Checklist

#### Integration
- [ ] Backend deployed to Vercel, health check URL confirmed
- [ ] Frontend `VITE_API_URL` env var set to backend Vercel URL in Vercel project settings
- [ ] Full flow tested: answer all 10 questions → submit email → receive email with PDF
- [ ] Test with missing API keys — confirm graceful fallback (still shows confirmation)
- [ ] Test CORS: frontend Vercel URL added to backend allowed origins

#### Frontend Polish
- [ ] All 5 screens match the design system colours and fonts exactly
- [ ] All entrance animations working (slideUp, fadeScaleIn, fadeUp, floatIn)
- [ ] Quiz card slide-in/slide-out transitions smooth
- [ ] Progress bar fills correctly (0% on Q1, 90% on Q10)
- [ ] Loading screen rotating copy messages cycle correctly
- [ ] Confirmation checkmark SVG draws on entrance
- [ ] Confirmation sparkles animate on entrance
- [ ] Logo renders correctly on all screens (170px wide, no distortion)
- [ ] Jesse photo renders correctly (circular crop, no stretching)
- [ ] Video on landing plays, mute toggle works
- [ ] Mobile responsive: all screens usable on 375px wide viewport
- [ ] Tablet responsive: 768px breakpoint — landing hero stacks to 1 column
- [ ] No layout overflow or horizontal scroll on any screen

#### Backend Polish
- [ ] PDF renders correctly: logo, Jesse photo, score number, tier badge, domain bars, doughnut chart
- [ ] PDF 2x2 legend below doughnut does not overlap chart
- [ ] All 7 days render with correct checkboxes, bold titles, descriptions, NOTE blocks
- [ ] Interactive checkboxes and notes field work in PDF viewer
- [ ] Email renders in Gmail, Apple Mail — logo shows (not blocked)
- [ ] PDF filename uses safe characters (no special chars from user name)
- [ ] Error handling: ValidationError returns 400, service errors don't crash server

#### Responsive Breakpoints to Test
- 480px: mobile — full width CTA, single column landing, smaller fonts
- 768px: tablet — landing hero stacks, stats center-aligned
- 1100px+: desktop — full two-column hero layout

---

## Deployment

### Frontend on Vercel

1. Import `frontend/` folder as a Vercel project
2. Framework: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment variable: `VITE_API_URL=https://[backend-vercel-url]`
6. `vercel.json` handles SPA routing (rewrites all paths to `/index.html`)

### Backend on Vercel

1. Import `backend/` folder as a separate Vercel project
2. No framework preset — Vercel detects `vercel.json` with `server.ts` route
3. Environment variables (set in Vercel dashboard — never in code):
   - `ANTHROPIC_API_KEY`
   - `RESEND_API_KEY`
   - `EMAIL_FROM`
   - `EMAIL_REPLY_TO`
   - `FRONTEND_URLS` (comma-separated frontend URLs including Vercel preview URLs)
   - `NODE_ENV=production`
4. `vercel.json` `includeFiles: "*.png"` bundles logo and Jesse assets
5. Place `logo_resized.png` and `Jesse-image.png` in `backend/` root before deploying

### CORS Update After Deployment

After getting your Vercel URLs, add them to backend CORS:
- Update `FRONTEND_URLS` env var in Vercel backend to include your frontend URL
- Or hardcode in `server.ts` `allowedOrigins` array

---

## Hour Estimates (Vibe Coding with AI Assistant)

| Task | Developer | Est. Hours |
|------|-----------|-----------|
| Backend setup + types + middleware | Backend | 1h |
| Scoring algorithm | Backend | 1h |
| AI service (Claude integration + static fallbacks) | Backend | 1.5h |
| PDF service (full layout) | Backend | 3h |
| Email service (HTML template + Resend) | Backend | 1h |
| Express server + route + validation | Backend | 1h |
| Backend deploy + env setup | Backend | 0.5h |
| **Backend Phase 1 Total** | | **~9h** |
| | | |
| Frontend setup + global CSS + types | Frontend | 0.5h |
| Questions data + scoring utility + API config | Frontend | 1h |
| App.tsx state machine | Frontend | 0.5h |
| Landing screen (layout + video + CSS) | Frontend | 1.5h |
| Quiz screen (animations + answer flow + CSS) | Frontend | 1.5h |
| Capture screen (form + validation + CSS) | Frontend | 1h |
| Loading screen (animations + CSS) | Frontend | 0.5h |
| Confirmation screen (checkmark + share + CSS) | Frontend | 1h |
| Frontend deploy + env setup | Frontend | 0.5h |
| **Frontend Phase 1 Total** | | **~8h** |
| | | |
| Integration + end-to-end testing | Both | 2h |
| Phase 2 UI polish + responsive fixes | Both | 4h |
| PDF + email QA | Backend | 1h |
| Final deploy + smoke test | Both | 1h |
| **Phase 2 Total** | | **~8h** |
| | | |
| **Grand Total** | | **~25h** |

Both Phase 1 tracks (frontend + backend) can run in parallel. Target: Phase 1 done in 10–12 hours, Phase 2 done in another 6–8 hours.

---

## Quick Reference — Key Rules

1. Plain text only from Claude AI — no markdown in the plan output
2. Backend always falls back gracefully — never returns an error to the user for AI/email/PDF failures
3. Frontend always shows confirmation screen — even if the API call fails
4. PDF assets (`logo_resized.png`, `Jesse-image.png`) must be in `backend/` root
5. Logo in emails must be a public HTTPS URL — not base64 or local path
6. `vercel.json` `includeFiles: "*.png"` is required for Vercel to bundle PNG assets
7. Never commit `.env` files
8. Test the health endpoint (`GET /api/health`) first whenever debugging backend

---

## Final Smoke Test Checklist

Before calling it done, walk through this checklist:

- [ ] Landing screen loads, video plays, CTA visible
- [ ] "Start My Assessment" button transitions to Quiz
- [ ] All 10 questions display with correct text
- [ ] Back button works on Q1 (returns to landing) and Q2+ (returns to previous question)
- [ ] After Q10, Capture screen appears
- [ ] Name + email validation works (blocks empty/invalid)
- [ ] "Send My 7-Day Plan" triggers loading screen
- [ ] Loading screen shows rotating messages
- [ ] Confirmation screen shows with correct name
- [ ] Share button works
- [ ] User receives email within ~30 seconds
- [ ] Email shows correct score and tier
- [ ] PDF attachment opens correctly
- [ ] PDF shows score, tier badge, domain breakdown with chart
- [ ] PDF pages 2+ show 7 daily action items with interactive checkboxes
- [ ] PDF notes field is editable
- [ ] All screens work on mobile (375px)
