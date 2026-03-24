# ENDevo — SaaS Employee Dashboard Integration Spec
## Assessment Engine · Module Assignment · Content Delivery · Data Architecture

**Version:** 1.0 · **Date:** March 2026  
**Purpose:** Drop-in spec for integrating the Jesse end-of-life readiness assessment into an employee dashboard SaaS, including DB schema, module assignment logic, 6-week program structure, and S3 content delivery.

---

## Table of Contents

1. [Assessment: 4 Domains × 40 Questions](#1-assessment-4-domains--40-questions)
2. [Scoring Logic](#2-scoring-logic)
3. [Tier Assignment](#3-tier-assignment)
4. [Module Framework: 6-Category Program](#4-module-framework-6-category-program)
5. [Module-to-Score Assignment Logic](#5-module-to-score-assignment-logic)
6. [Database Schema](#6-database-schema)
7. [S3 Content Architecture](#7-s3-content-architecture)
8. [API Contracts](#8-api-contracts)
9. [Business Logic Rules](#9-business-logic-rules)

---

## 1. Assessment: 4 Domains × 40 Questions

> **Scoring key — same for every question:**  
> A = 10 pts · B = 6 pts · C = 3 pts · D = 0 pts

---

### DOMAIN 1 — Legal Readiness (Questions L1–L10)

**Purpose:** Establish whether the employee has legally protected their estate, named key people, and documented end-of-life decisions.

---

**L1. Do you have a Durable Power of Attorney for financial decisions?**
- A — Yes — signed, valid, and my agent knows they're named and where it is.
- B — Yes — but I'm not sure if it's durable or whether it's current.
- C — No — but I know I need one.
- D — No — I didn't know this was something I needed.

**L2. Do you have a Healthcare Power of Attorney naming someone to make medical decisions if you can't?**
- A — Yes — signed, and my proxy has a copy and knows their role.
- B — I have something but I'm not sure it's current or that my proxy has a copy.
- C — No — but I've thought about who I'd want.
- D — No — I haven't addressed this at all.

**L3. Have you formally named — and briefed — the people who will manage your estate and carry out your wishes?**
- A — Yes — all roles are formally named, those people know, and they've been briefed.
- B — Named in documents, but we've never walked through the details together.
- C — I have people in mind but nothing is formally documented.
- D — No — I haven't thought through who these people would be.

**L4. Do you have a legally valid, signed will?**
- A — Yes — signed, witnessed, and stored securely where my executor can find it.
- B — I have a draft but it's not finalized or signed.
- C — No — but I know I need one.
- D — No — and I'm not sure I need one.

**L5. When was your will last reviewed and updated?**
- A — Within the last 3 years.
- B — 3 to 7 years ago.
- C — More than 7 years ago, or after a major life change I didn't follow up on.
- D — I don't have a will, or I genuinely don't know when it was last updated.

**L6. If you have minor children or dependents with disabilities, have you legally named their guardian?**
- A — Yes — named in my will, and the guardian knows and has agreed.
- B — Verbally agreed with someone but it's not documented legally.
- C — I have someone in mind but nothing is documented.
- D — This doesn't apply to me — or I haven't addressed it.

**L7. Do you have — or have you determined whether you need — a trust?**
- A — Yes — I have a trust that's funded and up to date.
- B — I have a trust but it's not fully funded or hasn't been reviewed recently.
- C — I've been told I might need one but haven't acted on it.
- D — I don't know if I need a trust or what it would do for me.

**L8. Do you understand what assets in your estate would go through probate — and have you taken steps to minimize it?**
- A — Yes — I've mapped my estate and structured assets to minimize probate.
- B — I have some knowledge but haven't fully mapped everything.
- C — I've heard of probate but don't fully understand what it means for my estate.
- D — I didn't know probate was something I needed to think about.

**L9. Have you written a Letter of Instruction — the practical roadmap that tells your executor exactly what to do, who to call, and where everything is?**
- A — Yes — complete, up to date, and stored where my executor can find it.
- B — I've started one but it's incomplete or out of date.
- C — I know what it is but haven't written one yet.
- D — I've never heard of a Letter of Instruction.

**L10. Have you documented your wishes around end-of-life choices — including Medical Aid in Dying if legal in your state — and do the right people know your position?**
- A — Yes — my wishes are documented and shared with my healthcare proxy and physician.
- B — I know my wishes but they're not formally documented anywhere.
- C — I'm not sure what's available in my state or what I'd want.
- D — I had no idea this was something to document.

---

### DOMAIN 2 — Financial Readiness (Questions F1–F10)

**Purpose:** Ensure the employee's financial estate is organized, accessible to survivors, and protected against probate and tax exposure.

---

**F1. Have you had a direct, detailed conversation with your executor about your financial wishes — where everything is and what to do first?**
- A — Yes — fully briefed, they know where everything is and understand what to do first.
- B — They know they're named but we've never walked through the details.
- C — I've mentioned it casually — no real planning conversation has happened.
- D — I've named someone but we haven't talked about any of this.

**F2. Do your bank and investment accounts have named POD or TOD beneficiary designations?**
- A — Yes — all accounts have current designations and I've verified them recently.
- B — Some accounts are designated, but I haven't confirmed all of them.
- C — I'm aware of POD/TOD but haven't set them up yet.
- D — I had no idea this was something I needed to do.

**F3. If you died tomorrow, could your loved ones locate all your accounts and access funds within days — not months?**
- A — Yes — everything is documented, stored securely, and at least one trusted person knows exactly where.
- B — They could figure it out, but it would take time and involve a lot of searching.
- C — Probably not — I haven't set this up in a way they could navigate without me.
- D — No — this would be a costly, confusing scavenger hunt.

**F4. Do you have sufficient life insurance or liquid assets to cover final expenses and provide immediate cash flow for your dependents?**
- A — Yes — coverage and liquid assets are in place for all three scenarios.
- B — I have some coverage but I'm not sure it's adequate for all three scenarios.
- C — I have minimal or no life insurance and haven't planned for these scenarios.
- D — I haven't thought through how my family would be financially supported if something happened.

**F5. Do you have a written inventory of all your financial accounts — bank, investment, retirement, and insurance?**
- A — Yes — complete, up to date, and stored where my trusted people can find it.
- B — I have a partial list but it's incomplete or hasn't been updated recently.
- C — It's all in my head — I haven't written it down.
- D — No — I haven't started and I'm not sure where to begin.

**F6. When did you last review and confirm your beneficiary designations across all accounts?**
- A — Within the last 12 months — I do this annually.
- B — Within the last 3 years — but not recently.
- C — More than 3 years ago, or after a major life change I didn't follow up on.
- D — I've never reviewed them — or I'm not sure who is currently named.

**F7. Are your significant debts documented — mortgage, loans, credit cards — with clear guidance for your executor on how to handle each one?**
- A — Yes — debts are fully documented and my executor has been briefed on each one.
- B — My major debts are known, but nothing is formally documented for my executor.
- C — Partially — I've documented some things but not all.
- D — No — my debts aren't documented and my executor doesn't know what to expect.

**F8. Do you have a financial advisor and insurance broker who are part of your end-of-life planning?**
- A — Yes — I have both, they know my end-of-life wishes, and we review things regularly.
- B — I have one or both but we've never discussed end-of-life planning specifically.
- C — I don't have these professionals in place but I know I should.
- D — No — and I don't know where to start finding the right people.

**F9. Do you have a secure, organized storage system — physical and digital — where all your financial documents can be found?**
- A — Yes — fireproof home safe and/or digital vault, organized, and my trusted people know how to access it.
- B — Documents exist but are scattered across different locations and hard to navigate.
- C — I use a safe deposit box — I wasn't aware of the access limitations after death.
- D — No organized system — documents are wherever they ended up.

**F10. Have you addressed the potential tax implications of your estate on your beneficiaries?**
- A — Yes — I've worked with a professional to understand and minimize tax exposure.
- B — I know this exists but haven't formally reviewed my exposure with a professional.
- C — I'm aware it's a thing but don't know if it applies to my estate.
- D — I had no idea estate or inheritance taxes were something I needed to consider.

---

### DOMAIN 3 — Physical Readiness (Questions P1–P10)

**Purpose:** Ensure the employee has documented healthcare, end-of-life medical, and final disposition wishes so family never has to guess.

---

**P1. Have you named a healthcare proxy and had a real conversation with them about your wishes?**
- A — Yes — named, documented, and we've had a detailed conversation about what I'd want.
- B — I've named someone but we've never really talked about what I'd actually want.
- C — I have someone in mind but haven't formally named or briefed them.
- D — No one is designated — I haven't done either.

**P2. Do you have a completed Medical Advance Directive or Living Will?**
- A — Yes — completed, notarized, and my healthcare proxy has a copy.
- B — Started but not completed or notarized.
- C — I know I need one but haven't started.
- D — I'm not sure what this is or whether I need one.

**P3. Have you documented your quality vs. quantity of life preferences — ventilators, feeding tubes, CPR, life support?**
- A — Yes — documented with specific language about what I do and don't want.
- B — I've thought about it and have general preferences but nothing is written down.
- C — I find this topic hard to engage with and have avoided it.
- D — I've never considered this and don't know where to start.

**P4. Do you understand the difference between palliative care and hospice — and have you documented your preferences for each?**
- A — Yes — I understand both, know when I'd want each, and it's documented.
- B — I have a general sense but haven't documented preferences for either.
- C — I've heard the terms but I'm fuzzy on the difference.
- D — I'm not familiar with these options at all.

**P5. Do you have documented preferences for where and how you'd receive care if you could no longer fully care for yourself?**
- A — Yes — preferences documented, family informed, and financial implications considered.
- B — I've thought about it but nothing is written down or discussed with family.
- C — I assume my family will figure it out — I haven't engaged with the specifics.
- D — I haven't considered this scenario at all.

**P6. Have you documented your preferences around who provides your care — family vs. professional — and what role technology plays?**
- A — Yes — I've thought through both and documented my values clearly.
- B — I have preferences but they're not written down.
- C — I've never thought about it at this level of detail.
- D — No — I wouldn't know how to even start thinking about this.

**P7. Have you decided how you want your body handled after death — and documented it?**
- A — Yes — I've chosen my final disposition method, it's documented, and my people know.
- B — I've thought about it but haven't put it in writing anywhere.
- C — I have a vague preference but haven't made a real decision.
- D — I haven't thought about this at all.

**P8. Have you done any funeral pre-planning with a funeral home or disposition provider?**
- A — Yes — pre-planned and pre-paid, with documents stored and family informed.
- B — I've had the conversation with a provider but haven't formalized or paid.
- C — I know I should but haven't taken any steps yet.
- D — I had no idea this was something I could do in advance.

**P9. Do you have documented instructions for what should happen to your remains after disposition?**
- A — Yes — specific instructions are written down and at least one person knows where they are.
- B — I have preferences but they're not documented anywhere findable.
- C — I've mentioned it to someone but it's never been written down.
- D — No instructions exist — I haven't thought it through this far.

**P10. Does at least one trusted person know where all your physical planning documents are stored — and could they act on them today?**
- A — Yes — organized, stored securely, and at least one person knows exactly where and how to access everything.
- B — Documents exist but I haven't told anyone where they are.
- C — Documents are scattered — I'm not sure I could find them all quickly myself.
- D — Nothing is organized or accessible — this has never been set up.

---

### DOMAIN 4 — Digital Readiness (Questions D1–D10)

**Purpose:** Ensure the employee's digital life — passwords, accounts, assets, and legacy preferences — is documented and accessible to a trusted person.

---

**D1. If you died tomorrow, could your loved ones access the data on your phone?**
- A — Yes — I have Legacy Contacts set up with multiple people identified.
- B — Yes — I have one Legacy Contact set up.
- C — Maybe — they know my password but nothing is formally set up.
- D — No — no one knows my password and I use biometrics only.

**D2. Do you currently use a password manager to store your logins and credentials?**
- A — Yes — I use one consistently and it's up to date.
- B — Yes — but I don't use it consistently or it's out of date.
- C — No — I rely on my browser or memory.
- D — No — I've never used one and don't know where to start.

**D3. If you had to hand over access to all your digital accounts to a trusted person right now, how long would it take?**
- A — Under an hour — everything is documented and ready to share securely.
- B — A few hours — I'd need to gather and organise things first.
- C — A full day or more — it would take serious effort.
- D — It would be nearly impossible — I don't know where to start.

**D4. Does anyone you trust have access to your primary email account in case of emergency?**
- A — Yes — credentials are securely shared and documented.
- B — Sort of — someone knows the password but it's not formalised.
- C — No — but I've been meaning to sort this.
- D — No — and I haven't thought about it.

**D5. Do you have a list of all your recurring subscriptions and memberships so they can be cancelled if needed?**
- A — Yes — a complete list including payment methods.
- B — A partial list — I know the main ones.
- C — Not written down — I'd have to check my bank statements.
- D — No idea how many I even have.

**D6. Have you set memorialization or legacy preferences on Facebook, Instagram, or Google?**
- A — Yes — all major platforms are configured.
- B — One or two platforms, not all.
- C — I know this is possible but haven't done it.
- D — I didn't know this was an option.

**D7. Are your most important files — tax records, contracts, medical records — digitised and backed up in at least two locations?**
- A — Yes — digitised, organised, and backed up in multiple places.
- B — Mostly — some gaps remain.
- C — Physical copies only — nothing digitised.
- D — I don't know where most of my important files are.

**D8. Have you designated someone to manage your digital legacy — logins, social media, memberships, subscriptions — if something happens to you?**
- A — Yes — it's documented and the right person already has access.
- B — I have a document with all my logins but no one else has it.
- C — I've been meaning to do this — it's on my list.
- D — I wouldn't even know where to start.

**D9. Do you have an is there a written emergency access protocol — a single document someone can follow step-by-step to access everything important?**
- A — Yes — it's written, stored securely, and at least one person knows where it is.
- B — It's mostly there but incomplete or out of date.
- C — Nothing formal — they'd have to piece it together.
- D — Nothing like this exists.

**D10. How often do you review and update your estate plan, digital legacy documents, and key account details?**
- A — Annually or after major life events.
- B — Every few years.
- C — Set it up once and never reviewed.
- D — I haven't set anything up to review.

---

## 2. Scoring Logic

```
Per answer:   A = 10 pts  |  B = 6 pts  |  C = 3 pts  |  D = 0 pts

Per domain:   domain_score (%) = (sum of raw points / (questions_answered × 10)) × 100
              Rounded to nearest integer. Range: 0–100.

Overall score: average of all completed domain percentages
               overall_score = sum(domain_scores) / number_of_completed_domains

Maximum raw per domain (10 questions): 100 pts → 100%
```

### Domain Score Bands (used for module assignment)

| Band | % Range | Label               | Urgency       |
|------|---------|---------------------|---------------|
| 4    | 85–100  | Peace Champion      | Maintenance   |
| 3    | 60–84   | On Solid Ground     | Improvement   |
| 2    | 35–59   | Getting Organised   | Priority      |
| 1    | 0–34    | Needs Attention     | Critical      |

---

## 3. Tier Assignment

Each employee gets a **per-domain tier** (1–4) and an **overall tier** based on the average score across all domains they completed.

```typescript
function getTier(score: number): 1 | 2 | 3 | 4 {
  if (score >= 85) return 4; // Peace Champion
  if (score >= 60) return 3; // On Solid Ground
  if (score >= 35) return 2; // Getting Organised
  return 1;                  // Needs Attention
}
```

**Overall tier label (for dashboard badge):**

| Score | Badge              | Color   | Description                                    |
|-------|--------------------|---------|------------------------------------------------|
| 85–100 | Peace Champion    | Green   | Exceptional preparedness across all domains    |
| 60–84  | On Solid Ground   | Blue    | Good base with clear gaps to close             |
| 35–59  | Getting Organised | Amber   | Meaningful gaps, focused action plan needed    |
| 0–34   | Needs Attention   | Red     | Critical gaps — escalate to manager/HR         |

---

## 4. Module Framework: 6-Category Program

Each employee is assigned a **personalised 6-week readiness program** based on their domain scores. Weeks are ordered so the weakest domain is addressed first.

### The 6 Categories

| # | Category     | Domain Link              | Icon | Focus                                                        |
|---|--------------|--------------------------|------|--------------------------------------------------------------|
| 1 | **Belief**   | Cross-domain (mindset)   | 🧠   | Why end-of-life planning matters — overcoming avoidance      |
| 2 | **Legal**    | Legal Readiness domain   | ⚖️  | Wills, POA, guardianship, trusts, probate, LOI               |
| 3 | **Financial**| Financial Readiness domain| 💰  | Executor briefing, asset inventory, insurance, beneficiaries |
| 4 | **Physical** | Physical Readiness domain | 🕊️ | Healthcare proxy, advance directive, hospice, disposition    |
| 5 | **Digital**  | Digital Readiness domain  | 🔐  | Password vault, legacy contacts, account access, 2FA         |
| 6 | **Relationships** | Cross-domain (people) | ❤️ | Naming key people, briefing them, family conversations       |

> **Note:** "Belief" (week 1) and "Relationships" (week 6) are always included regardless of scores.  
> Weeks 2–5 are ordered by **ascending domain score** (lowest score = first week).

### Weekly Module Structure (per category)

Each week contains:

```
Week N — [Category Name]
├── Welcome Video (2–3 min) — Jesse intro for this category
├── Education Video (8–12 min) — Core concepts
├── Worksheet PDF — Fill-in action template
├── Resource PDF — Reference guide / checklists
├── Action Steps (3–5 items) — Specific tasks to complete this week
└── Completion Quiz (3 questions) — Confirms understanding, unlocks next week
```

### Example: Week Assignment for Score Profile
```
Employee: John Smith
Scores: Legal 28% | Financial 55% | Physical 72% | Digital 41%

Week 1: Belief         (always first — mindset foundation)
Week 2: Legal          (score 28% — Needs Attention → highest priority)
Week 3: Digital        (score 41% — Getting Organised)
Week 4: Financial      (score 55% — Getting Organised)
Week 5: Physical       (score 72% — On Solid Ground)
Week 6: Relationships  (always last — putting people in the picture)
```

---

## 5. Module-to-Score Assignment Logic

```typescript
type DomainKey = 'legal' | 'financial' | 'physical' | 'digital';
type CategoryKey = 'belief' | 'legal' | 'financial' | 'physical' | 'digital' | 'relationships';

interface ModuleWeek {
  week:     number;
  category: CategoryKey;
  tier:     1 | 2 | 3 | 4;  // determines which content variant is served
}

function buildProgram(domainScores: Partial<Record<DomainKey, number>>): ModuleWeek[] {
  // Fixed bookends
  const program: ModuleWeek[] = [];

  // Week 1: Belief always first
  program.push({ week: 1, category: 'belief', tier: getOverallTier(domainScores) });

  // Middle 4 weeks: order by ascending score (Needs Attention first)
  const ordered = (Object.keys(domainScores) as DomainKey[])
    .sort((a, b) => (domainScores[a] ?? 100) - (domainScores[b] ?? 100));

  ordered.forEach((domain, i) => {
    const score = domainScores[domain] ?? 0;
    program.push({ week: i + 2, category: domain, tier: getTier(score) });
  });

  // Week 6: Relationships always last
  program.push({ week: 6, category: 'relationships', tier: getOverallTier(domainScores) });

  return program;
}
```

### Content Variants per Tier

Each category has **4 content variants** stored separately in S3, served based on the employee's tier for that domain:

| Tier | Variant Key | Tone                         | Content Focus                            |
|------|-------------|------------------------------|------------------------------------------|
| 1    | `critical`  | Urgent, protective           | "You need to act now — here's step one" |
| 2    | `priority`  | Action-oriented, clear       | "You've started — close these gaps"      |
| 3    | `improve`   | Encouraging, additive        | "Strong foundation — here's what's next" |
| 4    | `maintain`  | Light, review-focused        | "You're ahead — here's how to stay there"|

---

## 6. Database Schema

> Designed for PostgreSQL (Supabase / Neon / RDS). Adapt column types for MongoDB or DynamoDB as needed.

### Tables

```sql
-- ── Users / Employees ────────────────────────────────────────────────────────
CREATE TABLE users (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID          NOT NULL REFERENCES organisations(id),
  email           TEXT          NOT NULL UNIQUE,
  display_name    TEXT          NOT NULL,
  photo_url       TEXT,
  role            TEXT          NOT NULL DEFAULT 'employee',  -- 'employee' | 'manager' | 'admin'
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ── Organisations (for multi-tenant SaaS) ────────────────────────────────────
CREATE TABLE organisations (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT          NOT NULL,
  plan            TEXT          NOT NULL DEFAULT 'basic',    -- 'basic' | 'pro' | 'enterprise'
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ── Assessment Sessions ───────────────────────────────────────────────────────
-- One row per time an employee starts an assessment
CREATE TABLE assessment_sessions (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ,                                -- null = in progress
  status          TEXT          NOT NULL DEFAULT 'in_progress',  -- 'in_progress' | 'completed'
  completed_domains TEXT[]      NOT NULL DEFAULT '{}',        -- ['legal','financial',...]
  -- Scores (percentages 0–100, null if domain not assessed)
  score_legal     SMALLINT,
  score_financial SMALLINT,
  score_physical  SMALLINT,
  score_digital   SMALLINT,
  score_overall   SMALLINT,
  tier_overall    SMALLINT,                                   -- 1 | 2 | 3 | 4
  -- AI-generated report
  report_text     TEXT,
  pdf_s3_key      TEXT,                                      -- S3 key for the PDF
  email_sent_at   TIMESTAMPTZ
);

-- ── Individual Answers ────────────────────────────────────────────────────────
-- One row per question answered, linked to a session
CREATE TABLE assessment_answers (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID          NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  user_id         UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  domain          TEXT          NOT NULL,    -- 'legal' | 'financial' | 'physical' | 'digital'
  question_id     TEXT          NOT NULL,    -- e.g. 'l1_financial_poa'
  question_number SMALLINT      NOT NULL,    -- 1–10 within domain
  answer_label    CHAR(1)       NOT NULL,    -- 'A' | 'B' | 'C' | 'D'
  points          SMALLINT      NOT NULL,    -- 0 | 3 | 6 | 10
  answered_at     TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ── Module Programs ───────────────────────────────────────────────────────────
-- Generated once per completed assessment session
CREATE TABLE module_programs (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id      UUID          NOT NULL REFERENCES assessment_sessions(id),
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  -- Week assignments (category + content tier)
  week1_category  TEXT          NOT NULL,   -- always 'belief'
  week1_tier      SMALLINT      NOT NULL,
  week2_category  TEXT          NOT NULL,
  week2_tier      SMALLINT      NOT NULL,
  week3_category  TEXT          NOT NULL,
  week3_tier      SMALLINT      NOT NULL,
  week4_category  TEXT          NOT NULL,
  week4_tier      SMALLINT      NOT NULL,
  week5_category  TEXT          NOT NULL,
  week5_tier      SMALLINT      NOT NULL,
  week6_category  TEXT          NOT NULL,   -- always 'relationships'
  week6_tier      SMALLINT      NOT NULL
);

-- ── Module Progress ───────────────────────────────────────────────────────────
-- Tracks what the employee has accessed / completed per week
CREATE TABLE module_progress (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  program_id      UUID          NOT NULL REFERENCES module_programs(id) ON DELETE CASCADE,
  week_number     SMALLINT      NOT NULL,   -- 1–6
  category        TEXT          NOT NULL,
  -- Content engagement
  video_welcome_watched   BOOLEAN NOT NULL DEFAULT false,
  video_education_watched BOOLEAN NOT NULL DEFAULT false,
  worksheet_downloaded    BOOLEAN NOT NULL DEFAULT false,
  resource_pdf_downloaded BOOLEAN NOT NULL DEFAULT false,
  action_steps_completed  SMALLINT NOT NULL DEFAULT 0,   -- 0–5
  quiz_passed             BOOLEAN NOT NULL DEFAULT false,
  week_completed          BOOLEAN NOT NULL DEFAULT false,
  -- Timestamps
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  last_activity   TIMESTAMPTZ   NOT NULL DEFAULT now(),
  UNIQUE(program_id, week_number)
);

-- ── Content Items (S3 references) ────────────────────────────────────────────
-- Master catalogue of all content assets
CREATE TABLE content_items (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  category        TEXT          NOT NULL,   -- 'belief' | 'legal' | 'financial' | 'physical' | 'digital' | 'relationships'
  tier            SMALLINT      NOT NULL,   -- 1 | 2 | 3 | 4
  content_type    TEXT          NOT NULL,   -- 'video_welcome' | 'video_education' | 'worksheet_pdf' | 'resource_pdf'
  title           TEXT          NOT NULL,
  description     TEXT,
  s3_bucket       TEXT          NOT NULL,
  s3_key          TEXT          NOT NULL,
  duration_seconds INT,                     -- for videos
  version         INT           NOT NULL DEFAULT 1,
  is_active       BOOLEAN       NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  UNIQUE(category, tier, content_type, version)
);

-- ── Action Steps ─────────────────────────────────────────────────────────────
CREATE TABLE action_steps (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  category        TEXT          NOT NULL,
  tier            SMALLINT      NOT NULL,
  step_number     SMALLINT      NOT NULL,   -- 1–5
  title           TEXT          NOT NULL,
  description     TEXT          NOT NULL,
  cta_label       TEXT,                     -- optional button label
  cta_url         TEXT,                     -- optional link
  UNIQUE(category, tier, step_number)
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_sessions_user        ON assessment_sessions(user_id);
CREATE INDEX idx_answers_session      ON assessment_answers(session_id);
CREATE INDEX idx_answers_user_domain  ON assessment_answers(user_id, domain);
CREATE INDEX idx_progress_user        ON module_progress(user_id);
CREATE INDEX idx_progress_program     ON module_progress(program_id);
CREATE INDEX idx_content_category_tier ON content_items(category, tier, content_type);
```

---

## 7. S3 Content Architecture

### Bucket Structure

```
s3://endevo-content/
│
├── assessments/
│   └── reports/
│       └── {user_id}/
│           └── {session_id}/
│               └── {firstName}-ReadinessPlan-MM-DD-YYYY.pdf
│
├── modules/
│   ├── belief/
│   │   ├── tier1/          ← Needs Attention variant
│   │   │   ├── welcome.mp4
│   │   │   ├── education.mp4
│   │   │   ├── worksheet.pdf
│   │   │   └── resource.pdf
│   │   ├── tier2/          ← Getting Organised variant
│   │   ├── tier3/          ← On Solid Ground variant
│   │   └── tier4/          ← Peace Champion variant
│   │
│   ├── legal/
│   │   ├── tier1/
│   │   ├── tier2/
│   │   ├── tier3/
│   │   └── tier4/
│   │
│   ├── financial/
│   │   ├── tier1/ … tier4/
│   │
│   ├── physical/
│   │   ├── tier1/ … tier4/
│   │
│   ├── digital/
│   │   ├── tier1/ … tier4/
│   │
│   └── relationships/
│       ├── tier1/ … tier4/
│
└── shared/
    ├── jesse-intro.mp4        ← Used across all weeks
    └── brand-assets/
```

### Access Control

- **Bucket policy:** Private. No public access.
- **Access method:** Pre-signed URLs with TTL (recommended: 1 hour for video, 24 hours for PDF downloads).
- **Per-user scoping:** The app server generates a pre-signed URL only after confirming `module_progress` shows the employee has unlocked that week.

### Pre-Signed URL Generation (Node.js example)

```typescript
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({ region: 'us-east-1' });

async function getContentUrl(
  category: string,
  tier: number,
  contentType: 'video_welcome' | 'video_education' | 'worksheet_pdf' | 'resource_pdf',
  expiresInSeconds = 3600
): Promise<string> {
  const extMap = {
    video_welcome:     'welcome.mp4',
    video_education:   'education.mp4',
    worksheet_pdf:     'worksheet.pdf',
    resource_pdf:      'resource.pdf',
  };

  const command = new GetObjectCommand({
    Bucket: process.env.S3_CONTENT_BUCKET,
    Key:    `modules/${category}/tier${tier}/${extMap[contentType]}`,
  });

  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}
```

---

## 8. API Contracts

### POST /api/assessment/submit
Submit completed answers, calculate scores, generate program.

**Request:**
```json
{
  "userId":   "uuid",
  "domains":  ["legal", "financial", "physical", "digital"],
  "answers": [
    { "domain": "legal",   "question_id": "l1_financial_poa", "q": 1, "answer": "B" },
    { "domain": "legal",   "question_id": "l2_healthcare_poa","q": 2, "answer": "A" },
    "..."
  ]
}
```

**Response:**
```json
{
  "session_id":   "uuid",
  "scores": {
    "legal":     42,
    "financial": 68,
    "physical":  75,
    "digital":   29,
    "overall":   54
  },
  "tier_overall": 2,
  "tier_label":   "Getting Organised",
  "program": [
    { "week": 1, "category": "belief",        "tier": 2 },
    { "week": 2, "category": "digital",       "tier": 1 },
    { "week": 3, "category": "legal",         "tier": 2 },
    { "week": 4, "category": "financial",     "tier": 3 },
    { "week": 5, "category": "physical",      "tier": 3 },
    { "week": 6, "category": "relationships", "tier": 2 }
  ],
  "pdf_url":      "https://...",  // pre-signed S3 URL, 24h TTL
  "report_sent":  true
}
```

### GET /api/modules/week/:weekNumber/content
Fetch content URLs for a specific week. Validates employee has unlocked it.

**Response:**
```json
{
  "week":      2,
  "category":  "digital",
  "tier":      1,
  "content": {
    "video_welcome":   "https://s3-presigned-url...",
    "video_education": "https://s3-presigned-url...",
    "worksheet_pdf":   "https://s3-presigned-url...",
    "resource_pdf":    "https://s3-presigned-url..."
  },
  "action_steps": [
    { "step": 1, "title": "Install a password manager", "description": "..." },
    "..."
  ],
  "progress": {
    "video_welcome_watched":   false,
    "video_education_watched": false,
    "worksheet_downloaded":    false,
    "action_steps_completed":  0,
    "quiz_passed":             false,
    "week_completed":          false
  }
}
```

### POST /api/modules/progress
Update progress for a content item.

**Request:**
```json
{
  "program_id":  "uuid",
  "week_number": 2,
  "event":       "video_welcome_watched" 
  // events: "video_welcome_watched" | "video_education_watched" |
  //         "worksheet_downloaded" | "resource_pdf_downloaded" |
  //         "action_step_completed" | "quiz_passed"
}
```

---

## 9. Business Logic Rules

### Assessment Rules
- An employee can take the assessment multiple times (each creates a new `assessment_session`).
- Only the **most recent completed session** drives the active module program.
- Partial sessions (abandoned mid-domain) are saved and can be resumed within 48 hours; after that, they expire and a new session is started.
- Minimum: employee must complete **at least 1 domain** to receive a partial program.
- A new assessment can be triggered after **90 days** from the previous completion date (configurable per org plan).

### Module Unlock Rules
- **Week 1 (Belief):** Always unlocked immediately on program creation.
- **Weeks 2–5:** Unlocked sequentially — each week unlocks only after the previous week is marked `week_completed = true`.
- `week_completed` = `quiz_passed = true` AND `action_steps_completed >= 3` (configurable).
- A manager with `role = 'manager'` can manually unlock any week for an employee in their org.
- **Week 6 (Relationships):** Unlocked after Week 5 is complete.

### Score Visibility Rules
- Employees see their own scores in full on their dashboard.
- Managers see: overall score, tier, program completion %, and current active week — **not** individual question answers (privacy).
- Admins see full data for reporting and cohort analysis.

### Re-Assessment & Score History
- Store all historical sessions — never overwrite.
- Dashboard shows a **score trend chart** comparing last 3 assessments per domain.
- If score improves by ≥ 15 points in any domain between re-assessments, trigger a congratulatory email/notification.

### Employer HR Integration Notes
- **Critical flag:** If `score_overall < 34` at completion, fire a webhook to HR system (configurable): `{ userId, email, overallScore, tier: 'Needs Attention', triggeredAt }`.
- **Completion certificate:** On week 6 completion, generate a PDF certificate (stored in S3 under `assessments/certificates/{userId}/`) and email to employee + HR.
- **Anonymized cohort report** (admin): monthly export showing org-level domain averages without identifying individuals.

### Content Delivery Notes
- Videos should be served via CloudFront CDN in front of the S3 bucket for performance — pre-signed URLs still work with CloudFront signed URLs or use OAC.
- Maximum pre-signed URL TTL: 4 hours for video streaming, 48 hours for PDF downloads.
- Log every content access event to `module_progress` and a separate audit table for compliance.

---

## Quick Reference: Domain → Module Category Mapping

| Assessment Domain | Module Category | Week Position         |
|-------------------|-----------------|-----------------------|
| (All domains)     | Belief          | Week 1 (fixed)        |
| Legal             | Legal           | Ordered by score ↑   |
| Financial         | Financial       | Ordered by score ↑   |
| Physical          | Physical        | Ordered by score ↑   |
| Digital           | Digital         | Ordered by score ↑   |
| (All domains)     | Relationships   | Week 6 (fixed)        |

---

*ENDevo · SaaS Integration Spec · For internal use and partner development teams*
