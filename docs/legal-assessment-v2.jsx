import { useState, useEffect, useRef } from "react";

// ─── LEGAL DOMAIN DATA — urgency-first order ─────────────────────────────────
// Developer note: this file exports the Legal domain only.
// Wire together with financial-assessment-v2.jsx and physical-assessment-v2.jsx
// using the shared transition + results pattern in your parent component.

export const LEGAL_QUESTIONS = [
  {
    id: "l1_financial_poa",
    num: 1,
    domain: "poa",
    text: "Do you have a Durable Power of Attorney for financial decisions?",
    subtext: "If you were in an accident tomorrow and couldn't manage your accounts, who pays your mortgage? Without this document, even a spouse can be blocked from your bank accounts.",
    answers: [
      { id: "A", label: "Yes — signed, valid, and my agent knows they're named and where it is.", score: 10 },
      { id: "B", label: "Yes — but I'm not sure if it's durable or whether it's current.", score: 6 },
      { id: "C", label: "No — but I know I need one.", score: 3 },
      { id: "D", label: "No — I didn't know this was something I needed.", score: 0 },
    ],
    jesse: {
      A: "Solid. Confirm your agent knows what financial institutions require to honor this — some have their own forms.",
      B: "'Durable' is the critical word. A non-durable POA expires the moment you're incapacitated — the exact opposite of when you need it.",
      C: "Planning is step one. Without this, a loved one may need court approval just to pay your bills during a crisis. That takes months.",
      D: "This is a priority gap. Without it, even your spouse may be blocked from accounts. One document, one attorney visit, fixes this permanently.",
    },
  },
  {
    id: "l2_healthcare_poa",
    num: 2,
    domain: "poa",
    text: "Do you have a Healthcare Power of Attorney naming someone to make medical decisions if you can't?",
    subtext: "This is separate from a Living Will. The POA names your decision-maker. Without it, hospitals default to their own protocols — or your family argues about what you'd want.",
    answers: [
      { id: "A", label: "Yes — signed, and my proxy has a copy and knows their role.", score: 10 },
      { id: "B", label: "I have something but I'm not sure it's current or that my proxy has a copy.", score: 6 },
      { id: "C", label: "No — but I've thought about who I'd want.", score: 3 },
      { id: "D", label: "No — I haven't addressed this at all.", score: 0 },
    ],
    jesse: {
      A: "Make sure it's also in your medical records with your primary care physician. Digital storage via a vault like Prisidio helps too.",
      B: "Both current and accessible are required. An old document with the wrong person named is a liability, not protection.",
      C: "Having someone in mind and naming them legally are two different things. In a medical crisis, only the document speaks.",
      D: "Without this, medical staff default to their own protocols — or family members disagree while you can't speak. This is your most urgent legal gap.",
    },
  },
  {
    id: "l3_key_people",
    num: 3,
    domain: "decision_making",
    text: "Have you formally named — and briefed — the people who will manage your estate and carry out your wishes?",
    subtext: "Executor, trustee, decision-makers. Naming them in a document is step one. Briefing them on where everything is and what you want is step two. Most people stop at step one.",
    answers: [
      { id: "A", label: "Yes — all roles are formally named, those people know, and they've been briefed.", score: 10 },
      { id: "B", label: "Named in documents, but we've never walked through the details together.", score: 6 },
      { id: "C", label: "I have people in mind but nothing is formally documented.", score: 3 },
      { id: "D", label: "No — I haven't thought through who these people would be.", score: 0 },
    ],
    jesse: {
      A: "A briefed executor is a gift to your family. Make sure everyone named has a copy of the documents and knows where originals live.",
      B: "Being named without being briefed puts your executor in an impossible position under grief. One 60-minute conversation changes that completely.",
      C: "Having someone in mind has zero legal weight. One document changes everything — and protects both of you.",
      D: "Without named decision-makers, courts decide for you. That process is public, slow, and expensive. This is the foundation.",
    },
  },
  {
    id: "l4_will",
    num: 4,
    domain: "will_trust",
    text: "Do you have a legally valid, signed will?",
    subtext: "A will directs how your assets are distributed and names your executor. Without one, your state decides — and it almost certainly won't match what you'd want.",
    answers: [
      { id: "A", label: "Yes — signed, witnessed, and stored securely where my executor can find it.", score: 10 },
      { id: "B", label: "I have a draft but it's not finalized or signed.", score: 6 },
      { id: "C", label: "No — but I know I need one.", score: 3 },
      { id: "D", label: "No — and I'm not sure I need one.", score: 0 },
    ],
    jesse: {
      A: "Strong foundation. When was it last reviewed? Life moves fast — your will should keep up.",
      B: "A draft protects no one. The gap between draft and signed is smaller than you think — one attorney visit closes it.",
      C: "Knowing you need one is the first step. It's simpler and less expensive than most people expect. Let's close that gap.",
      D: "If you own anything — a car, a bank account, a phone — you need a will. Without one, your state writes it for you.",
    },
  },
  {
    id: "l5_will_updated",
    num: 5,
    domain: "will_trust",
    text: "When was your will last reviewed and updated?",
    subtext: "Marriage, divorce, new children, new assets, death of a named beneficiary — any of these can make an outdated will actively harmful to your family.",
    answers: [
      { id: "A", label: "Within the last 3 years.", score: 10 },
      { id: "B", label: "3 to 7 years ago.", score: 6 },
      { id: "C", label: "More than 7 years ago, or after a major life change I didn't follow up on.", score: 3 },
      { id: "D", label: "I don't have a will, or I genuinely don't know when it was last updated.", score: 0 },
    ],
    jesse: {
      A: "Good cadence. Set a calendar reminder — every 3 years or after any major life change.",
      B: "A lot changes in 3–7 years. A review doesn't mean starting over — it means making sure it still reflects your life.",
      C: "An outdated will can be as damaging as no will. Laws change, relationships change, assets change. This needs attention now.",
      D: "Either situation is fixable. A current, valid will is the foundation — everything else builds on it.",
    },
  },
  {
    id: "l6_guardianship",
    num: 6,
    domain: "guardianship",
    text: "If you have minor children or dependents with disabilities, have you legally named their guardian?",
    subtext: "Without documented guardianship, a court appoints someone — often not who you'd choose. A verbal agreement has zero legal standing.",
    answers: [
      { id: "A", label: "Yes — named in my will, and the guardian knows and has agreed.", score: 10 },
      { id: "B", label: "Verbally agreed with someone but it's not documented legally.", score: 6 },
      { id: "C", label: "I have someone in mind but nothing is documented.", score: 3 },
      { id: "D", label: "This doesn't apply to me — or I haven't addressed it.", score: 0 },
    ],
    jesse: {
      A: "The most important gift you can give your children. Make sure the guardian also knows the financial support structure that comes with that role.",
      B: "A verbal agreement has zero legal standing. One paragraph in your will changes that permanently.",
      C: "Courts don't ask who you had in mind. They appoint based on what's documented. This is the single most urgent legal gap for parents.",
      D: "If it doesn't apply, great. If you have dependents and haven't documented this — it's your most urgent legal action.",
    },
  },
  {
    id: "l7_trust",
    num: 7,
    domain: "will_trust",
    text: "Do you have — or have you determined whether you need — a trust?",
    subtext: "Trusts avoid probate, protect assets, and can provide for minor children or dependents with special needs. Not everyone needs one — but everyone should know if they do.",
    answers: [
      { id: "A", label: "Yes — I have a trust that's funded and up to date.", score: 10 },
      { id: "B", label: "I have a trust but it's not fully funded or hasn't been reviewed recently.", score: 6 },
      { id: "C", label: "I've been told I might need one but haven't acted on it.", score: 3 },
      { id: "D", label: "I don't know if I need a trust or what it would do for me.", score: 0 },
    ],
    jesse: {
      A: "A funded, current trust is a real gift to your family. Make sure your successor trustee knows their role and where the document is.",
      B: "An unfunded trust doesn't protect anything. Getting assets titled correctly into the trust is the critical next step.",
      C: "If someone knowledgeable told you this, take it seriously. A trust can save your family months and tens of thousands in probate costs.",
      D: "Not everyone needs one — but everyone should find out. One conversation with an estate attorney answers this question permanently.",
    },
  },
  {
    id: "l8_probate",
    num: 8,
    domain: "probate",
    text: "Do you understand what assets in your estate would go through probate — and have you taken steps to minimize it?",
    subtext: "Probate is public, slow, and expensive — often 1–3 years. Most of it is preventable. Bank accounts, real estate, and investments can all bypass it with the right setup.",
    answers: [
      { id: "A", label: "Yes — I've mapped my estate and structured assets to minimize probate.", score: 10 },
      { id: "B", label: "I have some knowledge but haven't fully mapped everything.", score: 6 },
      { id: "C", label: "I've heard of probate but don't fully understand what it means for my estate.", score: 3 },
      { id: "D", label: "I didn't know probate was something I needed to think about.", score: 0 },
    ],
    jesse: {
      A: "Probate planning is advanced-level work. Your family will feel the difference — less court, less time, less money lost.",
      B: "The unmapped parts of your estate are your family's headaches. A full audit with an estate attorney is worth every dollar.",
      C: "Probate is where estates go to stall. The good news: most of it is preventable with simple planning steps you can take today.",
      D: "Probate can freeze assets for years and cost thousands in fees. Let's make sure your family doesn't face that.",
    },
  },
  {
    id: "l9_letter_of_instruction",
    num: 9,
    domain: "letter_of_instruction",
    text: "Have you written a Letter of Instruction — the practical roadmap that tells your executor exactly what to do, who to call, and where everything is?",
    subtext: "Not a legal document — but often more useful than a will. Covers funeral wishes, account locations, passwords, pet care, and personal messages. It's what your family actually reaches for first.",
    answers: [
      { id: "A", label: "Yes — complete, up to date, and stored where my executor can find it.", score: 10 },
      { id: "B", label: "I've started one but it's incomplete or out of date.", score: 6 },
      { id: "C", label: "I know what it is but haven't written one yet.", score: 3 },
      { id: "D", label: "I've never heard of a Letter of Instruction.", score: 0 },
    ],
    jesse: {
      A: "This is the document most attorneys never mention — and the one families reach for first. Review it annually.",
      B: "An incomplete letter creates partial clarity, which can cause almost as much confusion as no letter. Let's finish it.",
      C: "This is ENDevo's core deliverable. A Letter of Instruction is the most practical gift you can leave — and Jesse helps you build it step by step.",
      D: "Your will tells courts what you owned. A Letter of Instruction tells your family how to handle everything. It's the human side of estate planning.",
    },
  },
  {
    id: "l10_maid",
    num: 10,
    domain: "end_of_life_choices",
    text: "Have you documented your wishes around end-of-life choices — including Medical Aid in Dying if legal in your state — and do the right people know your position?",
    subtext: "Currently legal in 10+ states. Whether you want it or not, documenting your position removes an impossible burden from your family at the worst possible moment.",
    answers: [
      { id: "A", label: "Yes — my wishes are documented and shared with my healthcare proxy and physician.", score: 10 },
      { id: "B", label: "I know my wishes but they're not formally documented anywhere.", score: 6 },
      { id: "C", label: "I'm not sure what's available in my state or what I'd want.", score: 3 },
      { id: "D", label: "I had no idea this was something to document.", score: 0 },
    ],
    jesse: {
      A: "Documenting this removes an impossible burden from your family. That's an act of love — and one of the most courageous things you can do.",
      B: "Your wishes only count if they're documented. In a medical crisis, memory fails and families disagree. One page changes that.",
      C: "Knowing what's available in your state is step one. This doesn't require a decision — just awareness of your options.",
      D: "Whether or not it applies to you, knowing your options is part of complete end-of-life planning. ENDevo walks you through every one.",
    },
  },
];

export const LEGAL_DOMAINS = {
  poa:                 { label: "Power of Attorney", color: "#2BBFC5" },
  decision_making:     { label: "Decision Makers", color: "#4A90D9" },
  will_trust:          { label: "Will & Trust", color: "#E8612A" },
  guardianship:        { label: "Guardianship", color: "#8E44AD" },
  probate:             { label: "Probate Planning", color: "#E67E22" },
  letter_of_instruction: { label: "Letter of Instruction", color: "#9B59B6" },
  end_of_life_choices: { label: "End-of-Life Choices", color: "#27AE60" },
};

export const LEGAL_META = {
  id: "legal",
  label: "Legal Readiness",
  eyebrow: "ENDEVO • LEGAL READINESS",
  headline: "Is Your Legal House\nIn Order?",
  description: "10 questions. Under 2 minutes. Jesse will assess where your legal legacy plan stands — and what your family would face if something happened today.",
  covers: "Covers: Power of Attorney • Will & Trust • Guardianship • Probate • Letter of Instruction",
  tags: ["Financial POA", "Healthcare POA", "Will", "Guardianship", "Probate"],
  avatar: "⚖️",
  disclaimer: "No login required · No data stored · Not legal advice",
  readinessLabel: "LEGAL READINESS SCORE",
  levels: [
    { min: 85, label: "Legally Protected", emoji: "🏆", color: "#27AE60", opening: "You've done the legal work most families never complete. Your people won't be left guessing — they'll have a clear roadmap." },
    { min: 60, label: "On Solid Ground", emoji: "✅", color: "#2BBFC5", opening: "You've built a foundation. A few focused steps will close the gaps before a life event forces your hand." },
    { min: 35, label: "Getting Clarity", emoji: "💡", color: "#E8612A", opening: "You're more aware than most. Let's turn that awareness into documents your family can actually use." },
    { min: 0,  label: "Starting Fresh", emoji: "🌱", color: "#4A90D9", opening: "No judgment — this is exactly where most people start. Jesse will walk you through every step." },
  ],
  transition: {
    nextDomain: "financial",
    nextLabel: "Financial Readiness",
    nextDescription: "Next up: 10 questions on your financial legacy plan — inventory, beneficiaries, insurance, and executor readiness.",
  },
};

// ─── SHARED COMPONENTS (Legal domain standalone render) ───────────────────────
// Developer note: these components are duplicated across all three domain files
// for standalone use. In your combined app, extract to a shared components file
// and import from there.

function JesseAvatar({ size = 40, emoji = "⚖️" }) {
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
        <div style={{
          height: "100%", width: `${pct}%`, borderRadius: 99,
          background: "linear-gradient(90deg, #2BBFC5, #E8612A)",
          transition: "width 0.4s ease"
        }} />
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

function JesseMessage({ text, animate, emoji = "⚖️" }) {
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

// ─── SCREENS ─────────────────────────────────────────────────────────────────

function IntroScreen({ meta, onStart }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      <div style={{
        width: 80, height: 80, borderRadius: "50%", margin: "0 auto 28px",
        background: "linear-gradient(135deg, #2BBFC5, #1B2A4A)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 36, boxShadow: "0 4px 24px rgba(43,191,197,0.35)"
      }}>{meta.avatar}</div>
      <div style={{ fontSize: 11, letterSpacing: 3, color: "#2BBFC5", fontWeight: 700, marginBottom: 12, fontFamily: "'DM Mono', monospace" }}>
        {meta.eyebrow}
      </div>
      <h1 style={{ fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 800, margin: "0 0 16px", fontFamily: "'Playfair Display', serif", color: "#FFFFFF", lineHeight: 1.2 }}>
        {meta.headline.split("\n").map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.7, color: "#8899AA", maxWidth: 420, margin: "0 auto 12px", fontFamily: "'DM Sans', sans-serif" }}>
        {meta.description}
      </p>
      <p style={{ fontSize: 13, color: "#556677", fontFamily: "'DM Sans', sans-serif", marginBottom: 36 }}>{meta.covers}</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 40 }}>
        {meta.tags.map(tag => (
          <span key={tag} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 99, background: "rgba(43,191,197,0.08)", border: "1px solid rgba(43,191,197,0.2)", color: "#2BBFC5", fontFamily: "'DM Mono', monospace" }}>{tag}</span>
        ))}
      </div>
      <button onClick={onStart} style={{
        padding: "16px 48px", borderRadius: 99, border: "none", cursor: "pointer",
        background: "linear-gradient(135deg, #2BBFC5, #1d9ea3)", color: "#0D1825",
        fontSize: 17, fontWeight: 800, fontFamily: "'DM Sans', sans-serif", letterSpacing: 0.3,
        boxShadow: "0 4px 20px rgba(43,191,197,0.4)", transition: "transform 0.15s"
      }}
        onMouseOver={e => { e.target.style.transform = "scale(1.03)"; }}
        onMouseOut={e => { e.target.style.transform = "scale(1)"; }}
      >Start My Assessment →</button>
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
        <h2 style={{ fontSize: "clamp(17px, 3.5vw, 22px)", fontWeight: 700, color: "#FFFFFF", margin: "0 0 10px", lineHeight: 1.4, fontFamily: "'Playfair Display', serif" }}>
          {question.text}
        </h2>
        {question.subtext && (
          <p style={{ fontSize: 13, color: "#667788", margin: 0, lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>{question.subtext}</p>
        )}
      </div>
      <div>
        {question.answers.map(ans => (
          <AnswerOption key={ans.id} answer={ans} selected={localAnswer} onSelect={handleSelect} revealed={!!localAnswer} />
        ))}
      </div>
      {showJesse && localAnswer && <JesseMessage text={question.jesse[localAnswer]} animate={true} emoji={meta.avatar} />}
      {localAnswer && (
        <button onClick={onNext} style={{
          marginTop: 24, width: "100%", padding: "15px 24px",
          background: "linear-gradient(135deg, #E8612A, #c94d1a)", border: "none", borderRadius: 12,
          cursor: "pointer", color: "#fff", fontSize: 16, fontWeight: 700,
          fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 16px rgba(232,97,42,0.35)", transition: "transform 0.15s"
        }}
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
      <div style={{
        width: 64, height: 64, borderRadius: "50%", margin: "0 auto 24px",
        background: "rgba(43,191,197,0.1)", border: "1px solid rgba(43,191,197,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28
      }}>✓</div>
      <div style={{ fontSize: 11, letterSpacing: 3, color: "#27AE60", fontWeight: 700, marginBottom: 12, fontFamily: "'DM Mono', monospace" }}>
        {meta.label.toUpperCase()} COMPLETE
      </div>
      <h2 style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 800, margin: "0 0 16px", fontFamily: "'Playfair Display', serif", color: "#FFFFFF", lineHeight: 1.3 }}>
        Up Next: {t.nextLabel}
      </h2>
      <p style={{ fontSize: 15, lineHeight: 1.7, color: "#8899AA", maxWidth: 380, margin: "0 auto 36px", fontFamily: "'DM Sans', sans-serif" }}>
        {t.nextDescription}
      </p>
      <button onClick={onContinue} style={{
        padding: "16px 48px", borderRadius: 99, border: "none", cursor: "pointer",
        background: "linear-gradient(135deg, #2BBFC5, #1d9ea3)", color: "#0D1825",
        fontSize: 17, fontWeight: 800, fontFamily: "'DM Sans', sans-serif",
        boxShadow: "0 4px 20px rgba(43,191,197,0.4)", transition: "transform 0.15s"
      }}
        onMouseOver={e => { e.target.style.transform = "scale(1.03)"; }}
        onMouseOut={e => { e.target.style.transform = "scale(1)"; }}
      >Start {t.nextLabel} →</button>
    </div>
  );
}

function ResultsScreen({ answers, meta, domains, questions, onRestart }) {
  const totalRaw = questions.reduce((sum, q) => {
    const a = answers[q.id];
    if (!a) return sum;
    const ans = q.answers.find(x => x.id === a);
    return sum + (ans?.score || 0);
  }, 0);
  const score = Math.round(totalRaw);
  const level = meta.levels.find(l => score >= l.min);

  const domainData = {};
  questions.forEach(q => {
    if (!domainData[q.domain]) domainData[q.domain] = { raw: 0, max: 0 };
    domainData[q.domain].max += 10;
    const a = answers[q.id];
    if (a) { const ans = q.answers.find(x => x.id === a); if (ans) domainData[q.domain].raw += ans.score; }
  });

  const gaps = questions.filter(q => {
    const a = answers[q.id];
    if (!a) return false;
    const ans = q.answers.find(x => x.id === a);
    return ans && ans.score <= 3;
  }).slice(0, 3);

  const [scoreVisible, setScoreVisible] = useState(false);
  useEffect(() => { setTimeout(() => setScoreVisible(true), 200); }, []);

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#2BBFC5", fontWeight: 700, marginBottom: 16, fontFamily: "'DM Mono', monospace" }}>
          {meta.readinessLabel}
        </div>
        <div style={{
          fontSize: "clamp(72px, 18vw, 100px)", fontWeight: 900, lineHeight: 1,
          fontFamily: "'DM Mono', monospace",
          background: `linear-gradient(135deg, ${level.color}, #FFFFFF)`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          opacity: scoreVisible ? 1 : 0, transform: scoreVisible ? "scale(1)" : "scale(0.8)",
          transition: "all 0.6s cubic-bezier(0.34,1.56,0.64,1)"
        }}>{score}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: level.color, fontFamily: "'DM Sans', sans-serif", marginTop: 8 }}>
          {level.emoji} {level.label}
        </div>
      </div>

      <JesseMessage text={level.opening} animate={false} emoji={meta.avatar} />

      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24, marginTop: 28, marginBottom: 28 }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: "#8899AA", fontWeight: 700, marginBottom: 20, fontFamily: "'DM Mono', monospace" }}>DOMAIN BREAKDOWN</div>
        {Object.entries(domainData).map(([domain, { raw, max }]) => (
          <DomainBar key={domain} domain={domain} raw={raw} max={max} domains={domains} />
        ))}
      </div>

      {gaps.length > 0 && (
        <div style={{ background: "rgba(232,97,42,0.06)", border: "1px solid rgba(232,97,42,0.2)", borderRadius: 16, padding: 24, marginBottom: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "#E8612A", fontWeight: 700, marginBottom: 16, fontFamily: "'DM Mono', monospace" }}>CRITICAL GAPS — ACT FIRST</div>
          {gaps.map(q => (
            <div key={q.id} style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ color: "#E8612A", fontSize: 16, flexShrink: 0 }}>⚠</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#FFFFFF", fontFamily: "'DM Sans', sans-serif", marginBottom: 3 }}>
                  {q.text.length > 70 ? q.text.slice(0, 70) + "…" : q.text}
                </div>
                <div style={{ fontSize: 12, color: "#667788", fontFamily: "'DM Sans', sans-serif" }}>{domains[q.domain]?.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: "linear-gradient(135deg, rgba(43,191,197,0.1), rgba(232,97,42,0.05))", border: "1px solid rgba(43,191,197,0.2)", borderRadius: 16, padding: 28, textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#FFFFFF", fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>Ready to Close These Gaps?</div>
        <p style={{ fontSize: 14, color: "#8899AA", fontFamily: "'DM Sans', sans-serif", margin: "0 0 20px" }}>
          ENDevo's My Final Playbook guides you through every step — legal, financial, physical, and digital.
        </p>
        <button style={{
          padding: "14px 40px", borderRadius: 99, border: "none", cursor: "pointer",
          background: "linear-gradient(135deg, #E8612A, #c94d1a)", color: "#fff",
          fontSize: 16, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 16px rgba(232,97,42,0.35)"
        }}>Start My Playbook at ENDevo →</button>
      </div>

      <button onClick={onRestart} style={{
        width: "100%", padding: "12px", borderRadius: 12, background: "transparent",
        border: "1px solid rgba(255,255,255,0.1)", color: "#667788", fontSize: 14,
        cursor: "pointer", fontFamily: "'DM Sans', sans-serif"
      }}>Retake Assessment</button>
    </div>
  );
}

// ─── APP (standalone Legal domain) ───────────────────────────────────────────
// Developer note: in the combined 3-domain app, replace this App with your
// parent controller that sequences Legal → Financial → Physical, passing
// onComplete(domainId, answers) to move to the next domain or transition screen.

export default function LegalAssessment({ onComplete }) {
  const [screen, setScreen] = useState("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const scrollRef = useRef(null);

  function scrollTop() {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    else window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleAnswer(id, value) { setAnswers(prev => ({ ...prev, [id]: value })); }

  function handleNext() {
    scrollTop();
    if (currentQ < LEGAL_QUESTIONS.length - 1) { setCurrentQ(q => q + 1); }
    else { setScreen("results"); }
  }

  function handleRestart() { setAnswers({}); setCurrentQ(0); setScreen("intro"); scrollTop(); }

  function handleTransitionContinue() {
    if (onComplete) onComplete("legal", answers);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;600;700;800&family=DM+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #0D1825; }
        button { outline: none; }
      `}</style>
      <div ref={scrollRef} style={{
        minHeight: "100vh", background: "linear-gradient(160deg, #0D1825 0%, #111E2E 60%, #0E1F1E 100%)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "40px 16px 60px", fontFamily: "'DM Sans', sans-serif"
      }}>
        <div style={{ position: "fixed", top: "10%", left: "50%", transform: "translateX(-50%)", width: 500, height: 300, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(43,191,197,0.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{
          width: "100%", maxWidth: 560, position: "relative", zIndex: 1,
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 24, padding: "clamp(24px, 5vw, 48px)", backdropFilter: "blur(20px)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.4)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: screen === "intro" ? 32 : 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <JesseAvatar size={28} emoji={LEGAL_META.avatar} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#2BBFC5", fontFamily: "'DM Mono', monospace" }}>Jesse</span>
              <span style={{ fontSize: 11, color: "#445566", fontFamily: "'DM Mono', monospace" }}>by ENDevo</span>
            </div>
            <span style={{ fontSize: 10, letterSpacing: 2, color: "#334455", fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>LEGAL READINESS</span>
          </div>

          {screen === "intro" && <IntroScreen meta={LEGAL_META} onStart={() => setScreen("question")} />}
          {screen === "question" && (
            <QuestionScreen
              question={LEGAL_QUESTIONS[currentQ]}
              currentAnswer={answers[LEGAL_QUESTIONS[currentQ].id]}
              onAnswer={handleAnswer}
              onNext={handleNext}
              qIndex={currentQ}
              total={LEGAL_QUESTIONS.length}
              meta={LEGAL_META}
              domains={LEGAL_DOMAINS}
            />
          )}
          {screen === "transition" && <TransitionScreen meta={LEGAL_META} onContinue={handleTransitionContinue} />}
          {screen === "results" && (
            <ResultsScreen
              answers={answers}
              meta={LEGAL_META}
              domains={LEGAL_DOMAINS}
              questions={LEGAL_QUESTIONS}
              onRestart={handleRestart}
            />
          )}
        </div>
      </div>
    </>
  );
}
