import { useState, useEffect, useRef } from "react";

// ─── FINANCIAL DOMAIN DATA — urgency-first order ──────────────────────────────
// Developer note: this file exports the Financial domain only.
// Wire together with legal-assessment-v2.jsx and physical-assessment-v2.jsx
// using the shared transition + results pattern in your parent component.
//
// Urgency-first reorder rationale for 40-year-old:
// Q1: Executor briefed — the human side of financial access (most urgent, least done)
// Q2: POD/TOD designations — single highest-impact action, one phone call
// Q3: Account access — could family find everything today?
// Q4: Life insurance / cash flow — incapacitation + unexpected death scenarios
// Q5: Financial inventory — documented, not just in your head
// Q6: Beneficiary review — outdated designations cause real damage
// Q7: Debt documentation — executor needs this on day one
// Q8: Financial team — advisor + broker aligned with plan
// Q9: Secure storage — Crucial Doc Box, fireproof + digital
// Q10: Tax / estate planning — advanced but important

export const FINANCIAL_QUESTIONS = [
  {
    id: "f1_executor_briefed",
    num: 1,
    domain: "executor_communication",
    text: "Have you had a direct, detailed conversation with your executor about your financial wishes — where everything is and what to do first?",
    subtext: "Naming someone is step one. Briefing them is step two. Most people stop at step one — leaving their executor to figure everything out while they're grieving.",
    answers: [
      { id: "A", label: "Yes — fully briefed, they know where everything is and understand what to do first.", score: 10 },
      { id: "B", label: "They know they're named but we've never walked through the details.", score: 6 },
      { id: "C", label: "I've mentioned it casually — no real planning conversation has happened.", score: 3 },
      { id: "D", label: "I've named someone but we haven't talked about any of this.", score: 0 },
    ],
    jesse: {
      A: "A briefed executor is a gift — to them and to your family. This is the step most estates skip entirely.",
      B: "Being named without being briefed puts your executor in an impossible position. One 60-minute conversation changes that completely.",
      C: "Casual mentions don't count in a crisis. Your executor needs a clear picture — accounts, contacts, first steps, and where the documents live.",
      D: "This is the most important conversation in your financial legacy plan. It doesn't have to be long — it just has to happen.",
    },
  },
  {
    id: "f2_pod_tod",
    num: 2,
    domain: "beneficiary_designations",
    text: "Do your bank and investment accounts have named POD or TOD beneficiary designations?",
    subtext: "POD (Payable on Death) and TOD (Transfer on Death) transfer assets directly — bypassing probate entirely. Without them, accounts can be frozen for months while your family waits.",
    answers: [
      { id: "A", label: "Yes — all accounts have current designations and I've verified them recently.", score: 10 },
      { id: "B", label: "Some accounts are designated, but I haven't confirmed all of them.", score: 6 },
      { id: "C", label: "I'm aware of POD/TOD but haven't set them up yet.", score: 3 },
      { id: "D", label: "I had no idea this was something I needed to do.", score: 0 },
    ],
    jesse: {
      A: "This is one of the simplest and highest-impact moves in estate planning. Your family avoids court and gets access fast.",
      B: "The accounts without designations are the ones that will stall. Each one needs to be confirmed — not assumed.",
      C: "This is a one-phone-call fix per account. The script: 'Can you confirm my beneficiaries and help me add POD/TOD designations?' That's it.",
      D: "Matthew Perry's estate lost millions because one account wasn't designated. This is the most commonly missed step — and one of the easiest to fix.",
    },
  },
  {
    id: "f3_access",
    num: 3,
    domain: "financial_inventory",
    text: "If you died tomorrow, could your loved ones locate all your accounts and access funds within days — not months?",
    subtext: "This isn't just about having a will. It's about whether the right people know where everything is and how to access it when they need it most.",
    answers: [
      { id: "A", label: "Yes — everything is documented, stored securely, and at least one trusted person knows exactly where.", score: 10 },
      { id: "B", label: "They could figure it out, but it would take time and involve a lot of searching.", score: 6 },
      { id: "C", label: "Probably not — I haven't set this up in a way they could navigate without me.", score: 3 },
      { id: "D", label: "No — this would be a costly, confusing scavenger hunt.", score: 0 },
    ],
    jesse: {
      A: "That's peace of mind — for you and for them. The goal is simple: your loved ones grieve, not search.",
      B: "Time spent searching is money spent on attorneys, court fees, and delays. A documented inventory eliminates most of that.",
      C: "The structure exists — it just needs to be shared. One conversation with your executor about where things are changes everything.",
      D: "This is the most common and most preventable crisis families face. Let's build the roadmap that makes it impossible.",
    },
  },
  {
    id: "f4_cashflow",
    num: 4,
    domain: "insurance_cashflow",
    text: "Do you have sufficient life insurance or liquid assets to cover final expenses and provide immediate cash flow for your dependents?",
    subtext: "Three scenarios need coverage: unexpected death, terminal diagnosis, and long-term care incapacitation. Each creates different cash flow needs — most people only plan for one.",
    answers: [
      { id: "A", label: "Yes — coverage and liquid assets are in place for all three scenarios.", score: 10 },
      { id: "B", label: "I have some coverage but I'm not sure it's adequate for all three scenarios.", score: 6 },
      { id: "C", label: "I have minimal or no life insurance and haven't planned for these scenarios.", score: 3 },
      { id: "D", label: "I haven't thought through how my family would be financially supported if something happened.", score: 0 },
    ],
    jesse: {
      A: "Planning for all three scenarios is sophisticated work. Most people only think about death — you've covered incapacitation too.",
      B: "'Not sure' is a real risk. A 30-minute conversation with an insurance broker will tell you exactly where the gaps are.",
      C: "Without liquidity, your family may have to sell assets under pressure. Insurance is one of the most affordable ways to prevent that.",
      D: "This is the question most people avoid — and the one that matters most to the people you love. Start with one scenario: unexpected death.",
    },
  },
  {
    id: "f5_inventory",
    num: 5,
    domain: "financial_inventory",
    text: "Do you have a written inventory of all your financial accounts — bank, investment, retirement, and insurance?",
    subtext: "Not just information in your head. A documented list someone else could find, understand, and act on — without you there to explain it.",
    answers: [
      { id: "A", label: "Yes — complete, up to date, and stored where my trusted people can find it.", score: 10 },
      { id: "B", label: "I have a partial list but it's incomplete or hasn't been updated recently.", score: 6 },
      { id: "C", label: "It's all in my head — I haven't written it down.", score: 3 },
      { id: "D", label: "No — I haven't started and I'm not sure where to begin.", score: 0 },
    ],
    jesse: {
      A: "That's the foundation — a single document your family can act on immediately. Make sure someone actually knows where it lives.",
      B: "A partial list creates partial clarity — which can cause almost as much confusion as no list. One complete document is the goal.",
      C: "When you're gone, what's in your head goes with you. A one-page written inventory can save your family months of searching.",
      D: "Start with one category: bank accounts. List the institution, account type, and account number. Then build from there.",
    },
  },
  {
    id: "f6_beneficiary_review",
    num: 6,
    domain: "beneficiary_designations",
    text: "When did you last review and confirm your beneficiary designations across all accounts?",
    subtext: "Divorce, remarriage, the death of a named beneficiary, or a new child — any of these can make outdated designations send money to the wrong person. Legally.",
    answers: [
      { id: "A", label: "Within the last 12 months — I do this annually.", score: 10 },
      { id: "B", label: "Within the last 3 years — but not recently.", score: 6 },
      { id: "C", label: "More than 3 years ago, or after a major life change I didn't follow up on.", score: 3 },
      { id: "D", label: "I've never reviewed them — or I'm not sure who is currently named.", score: 0 },
    ],
    jesse: {
      A: "Annual review is the right cadence. Tie it to tax prep and it becomes automatic.",
      B: "Three years is a long time. A divorce, a death, a new child — any of those can mean the wrong person inherits. A quick review fixes this.",
      C: "This is where estates go sideways. Life changes fast — beneficiary designations don't update themselves. This is urgent.",
      D: "Not knowing who is named means not knowing where your money goes. This is a one-hour fix that could prevent years of family conflict.",
    },
  },
  {
    id: "f7_debt",
    num: 7,
    domain: "debt_estate",
    text: "Are your significant debts documented — mortgage, loans, credit cards — with clear guidance for your executor on how to handle each one?",
    subtext: "Debts don't disappear at death. Your executor needs to know what exists, who to contact, and in what order to settle obligations from the estate.",
    answers: [
      { id: "A", label: "Yes — debts are fully documented and my executor has been briefed on each one.", score: 10 },
      { id: "B", label: "My major debts are known, but nothing is formally documented for my executor.", score: 6 },
      { id: "C", label: "Partially — I've documented some things but not all.", score: 3 },
      { id: "D", label: "No — my debts aren't documented and my executor doesn't know what to expect.", score: 0 },
    ],
    jesse: {
      A: "Your executor will thank you. Most estates stall because creditors show up after assets are already distributed.",
      B: "Knowledge in your head isn't transferable. A simple debt list attached to your financial inventory takes 20 minutes to build.",
      C: "Partial documentation means partial protection. The missing pieces are usually where the expensive surprises hide.",
      D: "Without this, your executor may pay the wrong debts first, trigger penalties, or miss creditor deadlines. One document prevents all of that.",
    },
  },
  {
    id: "f8_financial_team",
    num: 8,
    domain: "financial_team",
    text: "Do you have a financial advisor and insurance broker who are part of your end-of-life planning?",
    subtext: "These professionals ensure assets transfer efficiently, coverage is adequate, and your estate isn't unnecessarily taxed or delayed. Most people have one without the other.",
    answers: [
      { id: "A", label: "Yes — I have both, they know my end-of-life wishes, and we review things regularly.", score: 10 },
      { id: "B", label: "I have one or both but we've never discussed end-of-life planning specifically.", score: 6 },
      { id: "C", label: "I don't have these professionals in place but I know I should.", score: 3 },
      { id: "D", label: "No — and I don't know where to start finding the right people.", score: 0 },
    ],
    jesse: {
      A: "Having a team that knows your wishes is rare and powerful. Make sure they're aligned with your legal documents too.",
      B: "A financial advisor who doesn't know your end-of-life plan is only doing half the job. One focused conversation changes that.",
      C: "These professionals reduce probate delays, minimize taxes, and ensure cash flow for your family when they need it most.",
      D: "Start with a referral from someone you trust. Bring your financial inventory to the first meeting. That single conversation can save your family tens of thousands.",
    },
  },
  {
    id: "f9_storage",
    num: 9,
    domain: "financial_inventory",
    text: "Do you have a secure, organized storage system — physical and digital — where all your financial documents can be found?",
    subtext: "A safe deposit box is not the answer — access after death can take months. A fireproof home safe plus a digital vault is the modern standard.",
    answers: [
      { id: "A", label: "Yes — fireproof home safe and/or digital vault, organized, and my trusted people know how to access it.", score: 10 },
      { id: "B", label: "Documents exist but are scattered across different locations and hard to navigate.", score: 6 },
      { id: "C", label: "I use a safe deposit box — I wasn't aware of the access limitations after death.", score: 3 },
      { id: "D", label: "No organized system — documents are wherever they ended up.", score: 0 },
    ],
    jesse: {
      A: "Organized, accessible, known by the right people — that's the trifecta. Most families get one out of three.",
      B: "Scattered documents are a scavenger hunt waiting to happen. A single afternoon to consolidate can save your family weeks of searching.",
      C: "Safe deposit boxes are one of the most common estate planning traps. After death, banks often freeze access until probate clears — which can take months. Time to move to a home safe.",
      D: "The Crucial Doc Box is ENDevo's starting point. Fireproof safe, organized folders, one document that tells people where to look.",
    },
  },
  {
    id: "f10_tax",
    num: 10,
    domain: "tax_estate",
    text: "Have you addressed the potential tax implications of your estate on your beneficiaries?",
    subtext: "State inheritance taxes can apply at much lower thresholds than federal estate tax. Not knowing whether this applies to you is the risk — a single professional review answers the question permanently.",
    answers: [
      { id: "A", label: "Yes — I've worked with a professional to understand and minimize tax exposure.", score: 10 },
      { id: "B", label: "I know this exists but haven't formally reviewed my exposure with a professional.", score: 6 },
      { id: "C", label: "I'm aware it's a thing but don't know if it applies to my estate.", score: 3 },
      { id: "D", label: "I had no idea estate or inheritance taxes were something I needed to consider.", score: 0 },
    ],
    jesse: {
      A: "Tax planning at the estate level is where significant wealth is protected or lost. You've done the work most families skip.",
      B: "Knowing and not reviewing is still a gap. State inheritance taxes can kick in at much lower thresholds than most people expect.",
      C: "Not knowing if it applies is the risk. A single conversation with a CPA or estate attorney gives you that answer — often in under an hour.",
      D: "Depending on your state, assets can be taxed before beneficiaries receive them. Worth a one-time professional review to either confirm you're fine or catch something that needs fixing.",
    },
  },
];

export const FINANCIAL_DOMAINS = {
  executor_communication:  { label: "Executor Communication", color: "#2BBFC5" },
  beneficiary_designations: { label: "Beneficiary Designations", color: "#E8612A" },
  financial_inventory:     { label: "Financial Inventory", color: "#4A90D9" },
  insurance_cashflow:      { label: "Insurance & Cash Flow", color: "#27AE60" },
  debt_estate:             { label: "Debt & Estate", color: "#8E44AD" },
  financial_team:          { label: "Your Financial Team", color: "#E67E22" },
  tax_estate:              { label: "Tax Planning", color: "#9B59B6" },
};

export const FINANCIAL_META = {
  id: "financial",
  label: "Financial Readiness",
  eyebrow: "ENDEVO • FINANCIAL READINESS",
  headline: "Is Your Financial House\nIn Order?",
  description: "10 questions. Under 2 minutes. Jesse will assess where your financial legacy plan stands — and what your family would face if something happened today.",
  covers: "Covers: Executor Readiness • POD/TOD • Cash Flow • Inventory • Beneficiaries • Tax Planning",
  tags: ["Executor", "POD / TOD", "Inventory", "Cash Flow", "Tax Planning"],
  avatar: "💰",
  disclaimer: "No login required · No data stored · Not financial advice",
  readinessLabel: "FINANCIAL READINESS SCORE",
  levels: [
    { min: 85, label: "Financially Protected", emoji: "🏆", color: "#27AE60", opening: "You've built a financial legacy plan most families never complete. Your people won't be left searching — they'll be supported." },
    { min: 60, label: "On Solid Ground", emoji: "✅", color: "#2BBFC5", opening: "You've done the foundational work. A few focused steps will close the gaps before a life event forces your hand." },
    { min: 35, label: "Getting Organized", emoji: "💡", color: "#E8612A", opening: "You're aware of what needs to happen — now let's turn that awareness into a plan your family can actually use." },
    { min: 0,  label: "Starting Fresh", emoji: "🌱", color: "#4A90D9", opening: "No judgment — this is exactly where most people are. Jesse will walk you through every step, one account at a time." },
  ],
  transition: {
    nextDomain: "physical",
    nextLabel: "Physical Readiness",
    nextDescription: "Next up: 10 questions on your physical end-of-life plan — healthcare proxy, advance directive, hospice preferences, and final disposition.",
  },
};

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
// Developer note: extract to a shared file in the combined app.

function JesseAvatar({ size = 40, emoji = "💰" }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg, #2BBFC5, #1B2A4A)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.45, flexShrink: 0,
      boxShadow: "0 2px 12px rgba(43,191,197,0.4)"
    }}>{emoji}</div>
  );
}

function ProgressBar({ current, total, domainLabel }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: "#8899AA", fontFamily: "'DM Sans', sans-serif" }}>
          {domainLabel} · Question {current} of {total}
        </span>
        <span style={{ fontSize: 13, color: "#2BBFC5", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{pct}%</span>
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: "linear-gradient(90deg, #2BBFC5, #E8612A)", transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

function AnswerOption({ answer, selected, onSelect, revealed }) {
  const isSelected = selected === answer.id;
  const scoreColor = answer.score === 10 ? "#27AE60" : answer.score === 6 ? "#2BBFC5" : answer.score === 3 ? "#E8612A" : "#C0392B";
  return (
    <button onClick={() => onSelect(answer.id)} style={{
      width: "100%", textAlign: "left", padding: "16px 20px",
      background: isSelected ? "rgba(43,191,197,0.12)" : "rgba(255,255,255,0.04)",
      border: isSelected ? "1px solid #2BBFC5" : "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12, cursor: "pointer", marginBottom: 10,
      display: "flex", alignItems: "center", gap: 14,
      transition: "all 0.2s ease", transform: isSelected ? "translateX(4px)" : "none",
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
        background: isSelected ? "#2BBFC5" : "rgba(255,255,255,0.08)",
        border: isSelected ? "none" : "1px solid rgba(255,255,255,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 700, color: isSelected ? "#0D1825" : "#8899AA",
        fontFamily: "'DM Mono', monospace", transition: "all 0.2s ease"
      }}>{answer.id}</div>
      <span style={{ fontSize: 15, lineHeight: 1.5, color: isSelected ? "#FFFFFF" : "#B0C4D8", fontFamily: "'DM Sans', sans-serif", flex: 1 }}>
        {answer.label}
      </span>
      {revealed && (
        <span style={{ fontSize: 12, fontWeight: 700, color: scoreColor, fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>
          {answer.score}pts
        </span>
      )}
    </button>
  );
}

function JesseMessage({ text, animate, emoji = "💰" }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { animate ? setTimeout(() => setVisible(true), 100) : setVisible(true); }, [animate]);
  return (
    <div style={{
      display: "flex", gap: 12, alignItems: "flex-start",
      background: "rgba(43,191,197,0.06)", border: "1px solid rgba(43,191,197,0.2)",
      borderRadius: 16, padding: "16px 18px", marginTop: 20,
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(8px)",
      transition: "all 0.4s ease"
    }}>
      <JesseAvatar size={32} emoji={emoji} />
      <div>
        <div style={{ fontSize: 11, color: "#2BBFC5", fontWeight: 600, marginBottom: 4, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>JESSE</div>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#C8D8E8", fontFamily: "'DM Sans', sans-serif" }}>{text}</p>
      </div>
    </div>
  );
}

function DomainBar({ domain, raw, max, domains }) {
  const pct = max > 0 ? Math.round((raw / max) * 100) : 0;
  const d = domains[domain];
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: "#B0C4D8", fontFamily: "'DM Sans', sans-serif" }}>{d?.label || domain}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: d?.color || "#fff", fontFamily: "'DM Mono', monospace" }}>{pct}%</span>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: d?.color || "#2BBFC5", transition: "width 1s ease 0.3s" }} />
      </div>
    </div>
  );
}

function IntroScreen({ meta, onStart }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", margin: "0 auto 28px", background: "linear-gradient(135deg, #2BBFC5, #1B2A4A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, boxShadow: "0 4px 24px rgba(43,191,197,0.35)" }}>{meta.avatar}</div>
      <div style={{ fontSize: 11, letterSpacing: 3, color: "#2BBFC5", fontWeight: 700, marginBottom: 12, fontFamily: "'DM Mono', monospace" }}>{meta.eyebrow}</div>
      <h1 style={{ fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 800, margin: "0 0 16px", fontFamily: "'Playfair Display', serif", color: "#FFFFFF", lineHeight: 1.2 }}>
        {meta.headline.split("\n").map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.7, color: "#8899AA", maxWidth: 420, margin: "0 auto 12px", fontFamily: "'DM Sans', sans-serif" }}>{meta.description}</p>
      <p style={{ fontSize: 13, color: "#556677", fontFamily: "'DM Sans', sans-serif", marginBottom: 36 }}>{meta.covers}</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 40 }}>
        {meta.tags.map(tag => (
          <span key={tag} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 99, background: "rgba(43,191,197,0.08)", border: "1px solid rgba(43,191,197,0.2)", color: "#2BBFC5", fontFamily: "'DM Mono', monospace" }}>{tag}</span>
        ))}
      </div>
      <button onClick={onStart} style={{ padding: "16px 48px", borderRadius: 99, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #2BBFC5, #1d9ea3)", color: "#0D1825", fontSize: 17, fontWeight: 800, fontFamily: "'DM Sans', sans-serif", letterSpacing: 0.3, boxShadow: "0 4px 20px rgba(43,191,197,0.4)", transition: "transform 0.15s" }}
        onMouseOver={e => { e.target.style.transform = "scale(1.03)"; }}
        onMouseOut={e => { e.target.style.transform = "scale(1)"; }}>Start My Assessment →</button>
      <p style={{ fontSize: 12, color: "#445566", marginTop: 20, fontFamily: "'DM Sans', sans-serif" }}>{meta.disclaimer}</p>
    </div>
  );
}

function QuestionScreen({ question, currentAnswer, onAnswer, onNext, qIndex, total, meta, domains }) {
  const [localAnswer, setLocalAnswer] = useState(currentAnswer || null);
  const [showJesse, setShowJesse] = useState(!!currentAnswer);
  const isLast = qIndex === total - 1;
  function handleSelect(id) { setLocalAnswer(id); setShowJesse(true); onAnswer(question.id, id); }
  return (
    <div>
      <ProgressBar current={qIndex + 1} total={total} domainLabel={meta.label} />
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: domains[question.domain]?.color || "#2BBFC5", fontWeight: 700, marginBottom: 8, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
          {domains[question.domain]?.label?.toUpperCase()}
        </div>
        <h2 style={{ fontSize: "clamp(17px, 3.5vw, 22px)", fontWeight: 700, color: "#FFFFFF", margin: "0 0 10px", lineHeight: 1.4, fontFamily: "'Playfair Display', serif" }}>{question.text}</h2>
        {question.subtext && <p style={{ fontSize: 13, color: "#667788", margin: 0, lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>{question.subtext}</p>}
      </div>
      <div>{question.answers.map(ans => <AnswerOption key={ans.id} answer={ans} selected={localAnswer} onSelect={handleSelect} revealed={!!localAnswer} />)}</div>
      {showJesse && localAnswer && <JesseMessage text={question.jesse[localAnswer]} animate={true} emoji={meta.avatar} />}
      {localAnswer && (
        <button onClick={onNext} style={{ marginTop: 24, width: "100%", padding: "15px 24px", background: "linear-gradient(135deg, #E8612A, #c94d1a)", border: "none", borderRadius: 12, cursor: "pointer", color: "#fff", fontSize: 16, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 16px rgba(232,97,42,0.35)", transition: "transform 0.15s" }}
          onMouseOver={e => e.target.style.transform = "scale(1.02)"}
          onMouseOut={e => e.target.style.transform = "scale(1)"}
        >{isLast ? "See My Results →" : "Next Question →"}</button>
      )}
    </div>
  );
}

function TransitionScreen({ meta, onContinue }) {
  const t = meta.transition;
  return (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", margin: "0 auto 24px", background: "rgba(43,191,197,0.1)", border: "1px solid rgba(43,191,197,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>✓</div>
      <div style={{ fontSize: 11, letterSpacing: 3, color: "#27AE60", fontWeight: 700, marginBottom: 12, fontFamily: "'DM Mono', monospace" }}>{meta.label.toUpperCase()} COMPLETE</div>
      <h2 style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 800, margin: "0 0 16px", fontFamily: "'Playfair Display', serif", color: "#FFFFFF", lineHeight: 1.3 }}>Up Next: {t.nextLabel}</h2>
      <p style={{ fontSize: 15, lineHeight: 1.7, color: "#8899AA", maxWidth: 380, margin: "0 auto 36px", fontFamily: "'DM Sans', sans-serif" }}>{t.nextDescription}</p>
      <button onClick={onContinue} style={{ padding: "16px 48px", borderRadius: 99, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #2BBFC5, #1d9ea3)", color: "#0D1825", fontSize: 17, fontWeight: 800, fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 20px rgba(43,191,197,0.4)", transition: "transform 0.15s" }}
        onMouseOver={e => { e.target.style.transform = "scale(1.03)"; }}
        onMouseOut={e => { e.target.style.transform = "scale(1)"; }}>Start {t.nextLabel} →</button>
    </div>
  );
}

function ResultsScreen({ answers, meta, domains, questions, onRestart }) {
  const totalRaw = questions.reduce((sum, q) => {
    const a = answers[q.id]; if (!a) return sum;
    const ans = q.answers.find(x => x.id === a); return sum + (ans?.score || 0);
  }, 0);
  const score = Math.round(totalRaw);
  const level = meta.levels.find(l => score >= l.min);
  const domainData = {};
  questions.forEach(q => {
    if (!domainData[q.domain]) domainData[q.domain] = { raw: 0, max: 0 };
    domainData[q.domain].max += 10;
    const a = answers[q.id]; if (a) { const ans = q.answers.find(x => x.id === a); if (ans) domainData[q.domain].raw += ans.score; }
  });
  const gaps = questions.filter(q => { const a = answers[q.id]; if (!a) return false; const ans = q.answers.find(x => x.id === a); return ans && ans.score <= 3; }).slice(0, 3);
  const [scoreVisible, setScoreVisible] = useState(false);
  useEffect(() => { setTimeout(() => setScoreVisible(true), 200); }, []);

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#2BBFC5", fontWeight: 700, marginBottom: 16, fontFamily: "'DM Mono', monospace" }}>{meta.readinessLabel}</div>
        <div style={{ fontSize: "clamp(72px, 18vw, 100px)", fontWeight: 900, lineHeight: 1, fontFamily: "'DM Mono', monospace", background: `linear-gradient(135deg, ${level.color}, #FFFFFF)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", opacity: scoreVisible ? 1 : 0, transform: scoreVisible ? "scale(1)" : "scale(0.8)", transition: "all 0.6s cubic-bezier(0.34,1.56,0.64,1)" }}>{score}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: level.color, fontFamily: "'DM Sans', sans-serif", marginTop: 8 }}>{level.emoji} {level.label}</div>
      </div>
      <JesseMessage text={level.opening} animate={false} emoji={meta.avatar} />
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24, marginTop: 28, marginBottom: 28 }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: "#8899AA", fontWeight: 700, marginBottom: 20, fontFamily: "'DM Mono', monospace" }}>DOMAIN BREAKDOWN</div>
        {Object.entries(domainData).map(([domain, { raw, max }]) => <DomainBar key={domain} domain={domain} raw={raw} max={max} domains={domains} />)}
      </div>
      {gaps.length > 0 && (
        <div style={{ background: "rgba(232,97,42,0.06)", border: "1px solid rgba(232,97,42,0.2)", borderRadius: 16, padding: 24, marginBottom: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "#E8612A", fontWeight: 700, marginBottom: 16, fontFamily: "'DM Mono', monospace" }}>CRITICAL GAPS — ACT FIRST</div>
          {gaps.map(q => (
            <div key={q.id} style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ color: "#E8612A", fontSize: 16, flexShrink: 0 }}>⚠</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#FFFFFF", fontFamily: "'DM Sans', sans-serif", marginBottom: 3 }}>{q.text.length > 70 ? q.text.slice(0, 70) + "…" : q.text}</div>
                <div style={{ fontSize: 12, color: "#667788", fontFamily: "'DM Sans', sans-serif" }}>{domains[q.domain]?.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ background: "linear-gradient(135deg, rgba(43,191,197,0.1), rgba(232,97,42,0.05))", border: "1px solid rgba(43,191,197,0.2)", borderRadius: 16, padding: 28, textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#FFFFFF", fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>Ready to Close These Gaps?</div>
        <p style={{ fontSize: 14, color: "#8899AA", fontFamily: "'DM Sans', sans-serif", margin: "0 0 20px" }}>ENDevo's My Final Playbook guides you through every step — legal, financial, physical, and digital.</p>
        <button style={{ padding: "14px 40px", borderRadius: 99, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #E8612A, #c94d1a)", color: "#fff", fontSize: 16, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 16px rgba(232,97,42,0.35)" }}>
          Start My Playbook at ENDevo →
        </button>
      </div>
      <button onClick={onRestart} style={{ width: "100%", padding: "12px", borderRadius: 12, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#667788", fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Retake Assessment</button>
    </div>
  );
}

// ─── APP (standalone Financial domain) ───────────────────────────────────────

export default function FinancialAssessment({ onComplete }) {
  const [screen, setScreen] = useState("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const scrollRef = useRef(null);

  function scrollTop() { if (scrollRef.current) scrollRef.current.scrollTop = 0; else window.scrollTo({ top: 0, behavior: "smooth" }); }
  function handleAnswer(id, value) { setAnswers(prev => ({ ...prev, [id]: value })); }
  function handleNext() { scrollTop(); if (currentQ < FINANCIAL_QUESTIONS.length - 1) { setCurrentQ(q => q + 1); } else { setScreen("results"); } }
  function handleRestart() { setAnswers({}); setCurrentQ(0); setScreen("intro"); scrollTop(); }
  function handleTransitionContinue() { if (onComplete) onComplete("financial", answers); }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;600;700;800&family=DM+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; } body { margin: 0; background: #0D1825; } button { outline: none; }
      `}</style>
      <div ref={scrollRef} style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0D1825 0%, #111E2E 60%, #0E1F1E 100%)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px 60px", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ position: "fixed", top: "10%", left: "50%", transform: "translateX(-50%)", width: 500, height: 300, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(43,191,197,0.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ width: "100%", maxWidth: 560, position: "relative", zIndex: 1, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 24, padding: "clamp(24px, 5vw, 48px)", backdropFilter: "blur(20px)", boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: screen === "intro" ? 32 : 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <JesseAvatar size={28} emoji={FINANCIAL_META.avatar} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#2BBFC5", fontFamily: "'DM Mono', monospace" }}>Jesse</span>
              <span style={{ fontSize: 11, color: "#445566", fontFamily: "'DM Mono', monospace" }}>by ENDevo</span>
            </div>
            <span style={{ fontSize: 10, letterSpacing: 2, color: "#334455", fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>FINANCIAL READINESS</span>
          </div>
          {screen === "intro" && <IntroScreen meta={FINANCIAL_META} onStart={() => setScreen("question")} />}
          {screen === "question" && <QuestionScreen question={FINANCIAL_QUESTIONS[currentQ]} currentAnswer={answers[FINANCIAL_QUESTIONS[currentQ].id]} onAnswer={handleAnswer} onNext={handleNext} qIndex={currentQ} total={FINANCIAL_QUESTIONS.length} meta={FINANCIAL_META} domains={FINANCIAL_DOMAINS} />}
          {screen === "transition" && <TransitionScreen meta={FINANCIAL_META} onContinue={handleTransitionContinue} />}
          {screen === "results" && <ResultsScreen answers={answers} meta={FINANCIAL_META} domains={FINANCIAL_DOMAINS} questions={FINANCIAL_QUESTIONS} onRestart={handleRestart} />}
        </div>
      </div>
    </>
  );
}
