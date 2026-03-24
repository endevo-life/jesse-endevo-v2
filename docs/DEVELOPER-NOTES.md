# Jesse Assessment — Developer Integration Notes
## ENDevo | 3-Domain Peace of Mind Assessment

---

## Files

| File | Domain | Questions | Avatar |
|------|--------|-----------|--------|
| `legal-assessment-v2.jsx` | Legal | 10 (L1–L10) | ⚖️ |
| `financial-assessment-v2.jsx` | Financial | 10 (F1–F10) | 💰 |
| `physical-assessment-v2.jsx` | Physical | 10 (P1–P10) | 🕊️ |
| Digital (4th domain, existing) | Digital | — | Live at jesse-endevo-mvp.vercel.app |

---

## Flow

```
Legal Intro → Legal Q1–Q10 → Legal Results → [Transition: "Up Next: Financial"] →
Financial Intro → Financial Q1–Q10 → Financial Results → [Transition: "Up Next: Physical"] →
Physical Intro → Physical Q1–Q10 → Physical Results → CTA to Digital (jesse-endevo-mvp.vercel.app)
```

---

## How to wire in a parent controller

Each domain file exports:
- A default component (`LegalAssessment`, `FinancialAssessment`, `PhysicalAssessment`)
- A `META` object (`LEGAL_META`, `FINANCIAL_META`, `PHYSICAL_META`)
- A `QUESTIONS` array (`LEGAL_QUESTIONS`, etc.)
- A `DOMAINS` object (`LEGAL_DOMAINS`, etc.)

Each default component accepts an optional `onComplete(domainId, answers)` prop.
Call this from your parent to advance to the next domain.

### Example parent controller (simplified)

```jsx
import LegalAssessment from './legal-assessment-v2';
import FinancialAssessment from './financial-assessment-v2';
import PhysicalAssessment from './physical-assessment-v2';

export default function JesseAssessment() {
  const [activeDomain, setActiveDomain] = useState('legal');
  const [allAnswers, setAllAnswers] = useState({});

  function handleDomainComplete(domainId, answers) {
    setAllAnswers(prev => ({ ...prev, [domainId]: answers }));
    if (domainId === 'legal') setActiveDomain('financial');
    if (domainId === 'financial') setActiveDomain('physical');
    // Physical domain handles its own CTA to Digital externally
  }

  return (
    <>
      {activeDomain === 'legal' && <LegalAssessment onComplete={handleDomainComplete} />}
      {activeDomain === 'financial' && <FinancialAssessment onComplete={handleDomainComplete} />}
      {activeDomain === 'physical' && <PhysicalAssessment onComplete={handleDomainComplete} />}
    </>
  );
}
```

---

## Shared components

Each file currently contains its own copy of these shared components:
- `JesseAvatar`
- `ProgressBar`
- `AnswerOption`
- `JesseMessage`
- `DomainBar`
- `IntroScreen`
- `QuestionScreen`
- `TransitionScreen`
- `ResultsScreen`

**Recommended:** extract these to a single `jesse-shared.jsx` file and import from there.
This eliminates duplication and makes future design changes a single-file update.

---

## Transition screens

Each domain has a `transition` key in its META object:

```js
// Legal META transition
transition: {
  nextDomain: "financial",
  nextLabel: "Financial Readiness",
  nextDescription: "Next up: 10 questions on your financial legacy plan..."
}

// Financial META transition
transition: {
  nextDomain: "physical",
  nextLabel: "Physical Readiness",
  nextDescription: "Next up: 10 questions on your physical end-of-life plan..."
}

// Physical META transition (external URL — Digital domain)
transition: {
  nextDomain: "digital",
  nextLabel: "Digital Readiness",
  nextDescription: "Final domain: 10 questions on your digital legacy...",
  nextUrl: "https://jesse-endevo-mvp.vercel.app/"
}
```

Transition screens render after each domain's results screen if you advance the flow.
In standalone mode (no `onComplete` prop), each domain shows its own results + CTA independently.

---

## Scoring

Each answer is scored 0 / 3 / 6 / 10.
Domain scores are calculated as `(raw / max) * 100` rounded to nearest integer.
No combined total score — each domain shows its own score independently.

Readiness levels (per domain):
- 85–100: Top tier (Protected / Champion)
- 60–84: On Solid Ground
- 35–59: Getting Organized
- 0–34: Starting Fresh

---

## Digital domain (4th)

The Digital domain is already live at:
`https://jesse-endevo-mvp.vercel.app/`

The Physical assessment results screen links directly to this URL.
No integration work needed unless you want to embed it in the same app shell.

---

## Fonts

All three files import from Google Fonts:
```
Playfair Display (700, 800) — headings
DM Sans (400, 600, 700, 800) — body
DM Mono (400, 500, 700) — labels, scores, tags
```

In a combined app, move the `@import` to your global CSS file to avoid duplicate loads.

---

## ENDevo brand colors used

| Token | Hex | Usage |
|-------|-----|-------|
| ENDevo Teal | `#2BBFC5` | Jesse badge, progress bar start, selected states |
| ENDevo Orange | `#E8612A` | Next button, critical gaps, progress bar end |
| Success Green | `#27AE60` | Score 10 answers, top readiness level |
| Warning Orange | `#E8612A` | Score 3 answers |
| Danger Red | `#C0392B` | Score 0 answers |
| Dark Navy | `#0D1825` | Background |
