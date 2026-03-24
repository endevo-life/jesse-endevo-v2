import { useState, useEffect, useRef } from "react";

// ─── PHYSICAL DOMAIN DATA — urgency-first order ───────────────────────────────
// Developer note: this file exports the Physical domain only.
// Wire together with legal-assessment-v2.jsx and financial-assessment-v2.jsx
// using the shared transition + results pattern in your parent component.
//
// Urgency-first order (design thinking — 40-year-old user):
// Q1: Healthcare proxy named + briefed (most likely scenario: accident, not death)
// Q2: Advance directive completed + notarized
// Q3: Quality vs quantity of life documented
// Q4: Palliative vs hospice — know the difference + documented
// Q5: Long-term care setting preferences
// Q6: Caregiver + technology preferences
// Q7: Final disposition decided + documented (shift to after-death)
// Q8: Funeral pre-planning
// Q9: Remains instructions
// Q10: Documents accessible — does anyone know where everything is?

export const PHYSICAL_QUESTIONS = [
  {
    id: "p1_proxy",
    num: 1,
    domain: "advance_care",
    text: "Have you named a healthcare proxy and had a real conversation with them about your wishes?",
    subtext: "If you were in an accident tomorrow and couldn't speak, who makes your medical decisions? Naming someone is step one. Briefing them is step two. Most people stop at step one.",
    answers: [
      { id: "A", label: "Yes — named, documented, and we've had a detailed conversation about what I'd want.", score: 10 },
      { id: "B", label: "I've named someone but we've never really talked about what I'd actually want.", score: 6 },
      { id: "C", label: "I have someone in mind but haven't formally named or briefed them.", score: 3 },
      { id: "D", label: "No one is designated — I haven't done either.", score: 0 },
    ],
    jesse: {
      A: "A briefed proxy is the difference between a family that's supported and a family that's paralyzed. You've done the full job.",
      B: "Being named without being briefed puts your proxy in an impossible position. One real conversation — what matters to you, what you'd refuse — changes everything.",
      C: "The conversation is harder than the paperwork. But the paperwork makes the conversation official. Do both.",
      D: "Without a named proxy, a hospital or a court may decide who speaks for you. Name someone you trust — then tell them what you want.",
    },
  },
  {
    id: "p2_advance_directive",
    num: 2,
    domain: "advance_care",
    text: "Do you have a completed Medical Advance Directive or Living Will?",
    subtext: "This document tells your medical team exactly what to do if you can't speak for yourself. Without it, decisions get made by default — or by whoever speaks loudest in the room.",
    answers: [
      { id: "A", label: "Yes — completed, notarized, and my healthcare proxy has a copy.", score: 10 },
      { id: "B", label: "Started but not completed or notarized.", score: 6 },
      { id: "C", label: "I know I need one but haven't started.", score: 3 },
      { id: "D", label: "I'm not sure what this is or whether I need one.", score: 0 },
    ],
    jesse: {
      A: "A notarized advance directive is one of the most powerful acts of protection you can give your family. They never have to guess — and they never have to carry that weight.",
      B: "An incomplete directive is almost as risky as none. Get it notarized. Five Wishes at fivewishes.org is legally valid in almost every state and takes under an hour.",
      C: "This is the document that prevents family conflict, hospital standoffs, and decisions made in crisis. Start with Five Wishes — it's the clearest format out there.",
      D: "If you couldn't speak right now, who would decide your medical care? That's why this document exists. It's not about dying — it's about staying in control.",
    },
  },
  {
    id: "p3_quality_quantity",
    num: 3,
    domain: "advance_care",
    text: "Have you documented your quality vs. quantity of life preferences — ventilators, feeding tubes, CPR, life support?",
    subtext: "This is the hardest question to answer when you're healthy — and the most critical one to have answered before you're not. Your family shouldn't have to make this call under pressure.",
    answers: [
      { id: "A", label: "Yes — documented with specific language about what I do and don't want.", score: 10 },
      { id: "B", label: "I've thought about it and have general preferences but nothing is written down.", score: 6 },
      { id: "C", label: "I find this topic hard to engage with and have avoided it.", score: 3 },
      { id: "D", label: "I've never considered this and don't know where to start.", score: 0 },
    ],
    jesse: {
      A: "Clear language — 'no CPR,' 'no feeding tube,' 'no ventilator if no recovery is expected' — gives your team permission to honor you. That's real power.",
      B: "General preferences don't hold up in an ICU. Your medical team needs specific documented instructions. Five Wishes walks you through every scenario.",
      C: "Here's the reframe: answering this question now is an act of protection for the people you love. They deserve not to carry this decision alone.",
      D: "Start with one question: 'If I were in a coma with no chance of recovery, would I want to be kept alive artificially?' Your gut answer is your starting point.",
    },
  },
  {
    id: "p4_palliative_hospice",
    num: 4,
    domain: "palliative_hospice",
    text: "Do you understand the difference between palliative care and hospice — and have you documented your preferences for each?",
    subtext: "Palliative care = comfort management at any stage, even alongside treatment. Hospice = comfort care when cure is no longer the goal. Most people wait too long for both — and their families pay for it.",
    answers: [
      { id: "A", label: "Yes — I understand both, know when I'd want each, and it's documented.", score: 10 },
      { id: "B", label: "I have a general sense but haven't documented preferences for either.", score: 6 },
      { id: "C", label: "I've heard the terms but I'm fuzzy on the difference.", score: 3 },
      { id: "D", label: "I'm not familiar with these options at all.", score: 0 },
    ],
    jesse: {
      A: "Most people don't learn the difference until they're in crisis. You've got this — and your family won't have to fight a system they don't understand.",
      B: "Knowing isn't the same as documenting. One sentence in your advance directive: 'I want palliative care introduced as early as possible during serious illness.' That's enough to start.",
      C: "Key distinction: palliative care doesn't mean giving up — it means managing symptoms while pursuing treatment. Hospice comes later, when cure is no longer the goal. Starting earlier gives you more benefit, not less.",
      D: "Jimmy Carter was on hospice for almost two years. Hospice isn't the end — it's what gives people quality of life until the end. Worth understanding before you need it.",
    },
  },
  {
    id: "p5_longterm_setting",
    num: 5,
    domain: "long_term_care",
    text: "Do you have documented preferences for where and how you'd receive care if you could no longer fully care for yourself?",
    subtext: "Home with modifications? In-home professional care? Assisted living? Memory care? Without your preferences on paper, your family makes this call under pressure, guilt, and incomplete information.",
    answers: [
      { id: "A", label: "Yes — preferences documented, family informed, and financial implications considered.", score: 10 },
      { id: "B", label: "I've thought about it but nothing is written down or discussed with family.", score: 6 },
      { id: "C", label: "I assume my family will figure it out — I haven't engaged with the specifics.", score: 3 },
      { id: "D", label: "I haven't considered this scenario at all.", score: 0 },
    ],
    jesse: {
      A: "Long-term care decisions get made dozens of times, often under pressure. You've given your family a roadmap instead of a crisis.",
      B: "Assumptions become the source of family conflict. The question isn't just where — it's what matters most to you about how you're cared for. Write that down.",
      C: "'Family will figure it out' is how family members burn out and make decisions based on guilt instead of your actual wishes. Give them your preferences — not a problem.",
      D: "Start simple: if you couldn't live alone safely tomorrow, where would you want to go? That one answer starts the whole conversation.",
    },
  },
  {
    id: "p6_caregiver_tech",
    num: 6,
    domain: "long_term_care",
    text: "Have you documented your preferences around who provides your care — family vs. professional — and what role technology plays?",
    subtext: "Family caregivers bring love but face real burnout. Professional care brings expertise. Technology can extend independence — but it's not for everyone. Your call. Document it.",
    answers: [
      { id: "A", label: "Yes — I've thought through both and documented my values clearly.", score: 10 },
      { id: "B", label: "I have preferences but they're not written down.", score: 6 },
      { id: "C", label: "I've never thought about it at this level of detail.", score: 3 },
      { id: "D", label: "No — I wouldn't know how to even start thinking about this.", score: 0 },
    ],
    jesse: {
      A: "Family caregivers who know your preferences burn out less. Facilities that get your documented values provide better care. This specificity matters more than people realize.",
      B: "One sentence changes everything: 'I want professional care so my family can stay present without being exhausted.' Write it. That's a complete instruction.",
      C: "Six dilemmas show up in nearly every long-term care situation — who provides care, where, finances, proxy flexibility, quality vs. quantity, and technology. ENDevo walks through all six.",
      D: "The ENDevo workbook surfaces your values through questions, not forms. One section at a time — built for people who've never thought about this before.",
    },
  },
  {
    id: "p7_disposition",
    num: 7,
    domain: "funeral_arrangements",
    text: "Have you decided how you want your body handled after death — and documented it?",
    subtext: "Burial, cremation, green burial, human composting — all valid. The problem isn't the choice. It's leaving your family to guess and disagree at the worst possible moment.",
    answers: [
      { id: "A", label: "Yes — I've chosen my final disposition method, it's documented, and my people know.", score: 10 },
      { id: "B", label: "I've thought about it but haven't put it in writing anywhere.", score: 6 },
      { id: "C", label: "I have a vague preference but haven't made a real decision.", score: 3 },
      { id: "D", label: "I haven't thought about this at all.", score: 0 },
    ],
    jesse: {
      A: "That decision — documented and shared — removes one of the most emotionally loaded choices a family faces. That's a real gift.",
      B: "A preference in your head doesn't protect your family. One written page changes everything for the people making decisions at the worst moment of their lives.",
      C: "Vague is the enemy. Families fight over vague. Pick the direction that feels right — you can always refine it. Done is better than perfect.",
      D: "You don't need to plan a funeral today. Start one sentence: 'When I die, I want...' Everything else builds from there.",
    },
  },
  {
    id: "p8_preplanning",
    num: 8,
    domain: "funeral_arrangements",
    text: "Have you done any funeral pre-planning with a funeral home or disposition provider?",
    subtext: "Pre-planning removes one of the most emotionally paralyzing decisions your family will ever face — made at the worst possible time, with no roadmap. You can remove that burden entirely.",
    answers: [
      { id: "A", label: "Yes — pre-planned and pre-paid, with documents stored and family informed.", score: 10 },
      { id: "B", label: "I've had the conversation with a provider but haven't formalized or paid.", score: 6 },
      { id: "C", label: "I know I should but haven't taken any steps yet.", score: 3 },
      { id: "D", label: "I had no idea this was something I could do in advance.", score: 0 },
    ],
    jesse: {
      A: "Pre-planning is one of the highest-impact gifts you can give. You've removed the decision burden and given your family one less impossible thing to navigate.",
      B: "The conversation is the hard part — you've done it. Formalizing takes one more appointment. Don't let it sit.",
      C: "Any age is the right age. A single pre-planning meeting takes about an hour and gives your family complete clarity instead of an impossible decision under grief.",
      D: "Every funeral home offers pre-planning. You pick your preferences, they document everything on a settlement sheet, and your family simply executes your wishes. No guessing.",
    },
  },
  {
    id: "p9_remains",
    num: 9,
    domain: "funeral_arrangements",
    text: "Do you have documented instructions for what should happen to your remains after disposition?",
    subtext: "Where ashes go. Whether there's a burial plot. What kind of ceremony — or none. Specific instructions prevent conflict and give your family permission to honor you instead of argue about you.",
    answers: [
      { id: "A", label: "Yes — specific instructions are written down and at least one person knows where they are.", score: 10 },
      { id: "B", label: "I have preferences but they're not documented anywhere findable.", score: 6 },
      { id: "C", label: "I've mentioned it to someone but it's never been written down.", score: 3 },
      { id: "D", label: "No instructions exist — I haven't thought it through this far.", score: 0 },
    ],
    jesse: {
      A: "Documented and shared — that's your family honoring you instead of debating you. Well done.",
      B: "Preferences without documentation are stories people will argue about. One written paragraph ends that risk entirely.",
      C: "Verbal wishes are the source of more family conflict than almost anything else in end-of-life planning. One written document changes all of that.",
      D: "Start here: where do you want your final resting place to be? That one answer anchors everything else.",
    },
  },
  {
    id: "p10_document_access",
    num: 10,
    domain: "advance_care",
    text: "Does at least one trusted person know where all your physical planning documents are stored — and could they act on them today?",
    subtext: "An advance directive locked in a drawer no one knows about is the same as no advance directive. A plan no one can find isn't a plan.",
    answers: [
      { id: "A", label: "Yes — organized, stored securely, and at least one person knows exactly where and how to access everything.", score: 10 },
      { id: "B", label: "Documents exist but I haven't told anyone where they are.", score: 6 },
      { id: "C", label: "Documents are scattered — I'm not sure I could find them all quickly myself.", score: 3 },
      { id: "D", label: "Nothing is organized or accessible — this has never been set up.", score: 0 },
    ],
    jesse: {
      A: "Organized, accessible, known by the right people. That's the full job. Most families get one out of three.",
      B: "One conversation — 'here's where my advance directive is, here's where my funeral instructions are' — solves this entirely. That's it.",
      C: "If you can't find them under pressure, no one can. One afternoon to consolidate is one of the highest-leverage hours you can spend.",
      D: "The Crucial Doc Box is your starting point. Fireproof safe, organized folders, one trusted person who knows the combination. That's the whole system.",
    },
  },
];

export const PHYSICAL_DOMAINS = {
  advance_care:         { label: "Advance Care Planning", color: "#E8612A" },
  palliative_hospice:   { label: "Palliative & Hospice Care", color: "#27AE60" },
  long_term_care:       { label: "Long-Term Care", color: "#9B59B6" },
  funeral_arrangements: { label: "Funeral & Final Disposition", color: "#2BBFC5" },
};

export const PHYSICAL_META = {
  id: "physical",
  label: "Physical Readiness",
  eyebrow: "ENDEVO • PHYSICAL READINESS",
  headline: "Does Your Body Have\nA Plan?",
  description: "10 questions. Under 2 minutes. Jesse will assess where your physical end-of-life plan stands — and what your family would face if something happened today.",
  covers: "Covers: Healthcare Proxy • Living Will • Hospice & Palliative Care • Long-Term Care • Final Disposition",
  tags: ["Healthcare Proxy", "Living Will", "Hospice", "Long-Term Care", "Burial / Cremation"],
  avatar: "🕊️",
  disclaimer: "No login required · No data stored · Not medical advice",
  readinessLabel: "PHYSICAL READINESS SCORE",
  levels: [
    { min: 85, label: "Physically Protected", emoji: "🏆", color: "#27AE60", opening: "You've done the work most families never do. Your wishes are documented, your people are informed, and no one will have to guess when it matters most." },
    { min: 60, label: "On Solid Ground", emoji: "✅", color: "#2BBFC5", opening: "The foundation is there. A few focused steps will close the remaining gaps before a health event forces someone else's hand." },
    { min: 35, label: "Getting Organized", emoji: "💡", color: "#E8612A", opening: "You're aware of what needs to happen — now let's turn that awareness into a plan your family can actually use when they need it." },
    { min: 0,  label: "Starting Fresh", emoji: "🌱", color: "#4A90D9", opening: "No judgment — this is where most people are. The physical domain feels heavy, but every step forward is a gift to the people you love." },
  ],
  transition: {
    nextDomain: "digital",
    nextLabel: "Digital Readiness",
    nextDescription: "Final domain: 10 questions on your digital legacy — accounts, passwords, digital assets, and what happens to your online life.",
    nextUrl: "https://jesse-endevo-mvp.vercel.app/",
  },
};

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
// Developer note: extract to a shared file in the combined app.

function JesseAvatar({ size = 40, emoji = "🕊️" }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg, #2BBFC5, #1B2A4A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.45, flexShrink: 0, boxShadow: "0 2px 12px rgba(43,191,197,0.4)" }}>{emoji}</div>
  );
}

function ProgressBar({ current, total, domainLabel }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: "#8899AA", fontFamily: "'DM Sans', sans-serif" }}>{domainLabel} · Question {current} of {total}</span>
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
    <button onClick={() => onSelect(answer.id)} style={{ width: "100%", textAlign: "left", padding: "16px 20px", background: isSelected ? "rgba(43,191,197,0.12)" : "rgba(255,255,255,0.04)", border: isSelected ? "1px solid #2BBFC5" : "1px solid rgba(255,255,255,0.08)", borderRadius: 12, cursor: "pointer", marginBottom: 10, display: "flex", alignItems: "center", gap: 14, transition: "all 0.2s ease", transform: isSelected ? "translateX(4px)" : "none" }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: isSelected ? "#2BBFC5" : "rgba(255,255,255,0.08)", border: isSelected ? "none" : "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: isSelected ? "#0D1825" : "#8899AA", fontFamily: "'DM Mono', monospace", transition: "all 0.2s ease" }}>{answer.id}</div>
      <span style={{ fontSize: 15, lineHeight: 1.5, color: isSelected ? "#FFFFFF" : "#B0C4D8", fontFamily: "'DM Sans', sans-serif", flex: 1 }}>{answer.label}</span>
      {revealed && <span style={{ fontSize: 12, fontWeight: 700, color: scoreColor, fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>{answer.score}pts</span>}
    </button>
  );
}

function JesseMessage({ text, animate, emoji = "🕊️" }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { animate ? setTimeout(() => setVisible(true), 100) : setVisible(true); }, [animate]);
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "rgba(43,191,197,0.06)", border: "1px solid rgba(43,191,197,0.2)", borderRadius: 16, padding: "16px 18px", marginTop: 20, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(8px)", transition: "all 0.4s ease" }}>
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
        {meta.tags.map(tag => <span key={tag} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 99, background: "rgba(43,191,197,0.08)", border: "1px solid rgba(43,191,197,0.2)", color: "#2BBFC5", fontFamily: "'DM Mono', monospace" }}>{tag}</span>)}
      </div>
      <button onClick={onStart} style={{ padding: "16px 48px", borderRadius: 99, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #2BBFC5, #1d9ea3)", color: "#0D1825", fontSize: 17, fontWeight: 800, fontFamily: "'DM Sans', sans-serif", letterSpacing: 0.3, boxShadow: "0 4px 20px rgba(43,191,197,0.4)", transition: "transform 0.15s" }}
        onMouseOver={e => { e.target.style.transform = "scale(1.03)"; }} onMouseOut={e => { e.target.style.transform = "scale(1)"; }}>Start My Assessment →</button>
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
        <div style={{ fontSize: 11, color: domains[question.domain]?.color || "#2BBFC5", fontWeight: 700, marginBottom: 8, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>{domains[question.domain]?.label?.toUpperCase()}</div>
        <h2 style={{ fontSize: "clamp(17px, 3.5vw, 22px)", fontWeight: 700, color: "#FFFFFF", margin: "0 0 10px", lineHeight: 1.4, fontFamily: "'Playfair Display', serif" }}>{question.text}</h2>
        {question.subtext && <p style={{ fontSize: 13, color: "#667788", margin: 0, lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>{question.subtext}</p>}
      </div>
      <div>{question.answers.map(ans => <AnswerOption key={ans.id} answer={ans} selected={localAnswer} onSelect={handleSelect} revealed={!!localAnswer} />)}</div>
      {showJesse && localAnswer && <JesseMessage text={question.jesse[localAnswer]} animate={true} emoji={meta.avatar} />}
      {localAnswer && (
        <button onClick={onNext} style={{ marginTop: 24, width: "100%", padding: "15px 24px", background: "linear-gradient(135deg, #E8612A, #c94d1a)", border: "none", borderRadius: 12, cursor: "pointer", color: "#fff", fontSize: 16, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 16px rgba(232,97,42,0.35)", transition: "transform 0.15s" }}
          onMouseOver={e => e.target.style.transform = "scale(1.02)"} onMouseOut={e => e.target.style.transform = "scale(1)"}
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
        onMouseOver={e => { e.target.style.transform = "scale(1.03)"; }} onMouseOut={e => { e.target.style.transform = "scale(1)"; }}>Start {t.nextLabel} →</button>
    </div>
  );
}

function ResultsScreen({ answers, meta, domains, questions, onRestart, onContinueToDigital }) {
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

      {/* CTA — Digital domain (4th domain) */}
      <div style={{ background: "linear-gradient(135deg, rgba(43,191,197,0.1), rgba(232,97,42,0.05))", border: "1px solid rgba(43,191,197,0.2)", borderRadius: 16, padding: 28, textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: "#2BBFC5", fontWeight: 700, marginBottom: 8, fontFamily: "'DM Mono', monospace" }}>ONE MORE DOMAIN</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#FFFFFF", fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>Complete Your Digital Readiness</div>
        <p style={{ fontSize: 14, color: "#8899AA", fontFamily: "'DM Sans', sans-serif", margin: "0 0 20px" }}>
          You've covered Legal, Financial, and Physical. The 4th domain — Digital — covers your accounts, passwords, and digital legacy. Take 2 more minutes to complete your full picture.
        </p>
        <button onClick={() => window.open(meta.transition.nextUrl, "_blank")} style={{ padding: "14px 40px", borderRadius: 99, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #2BBFC5, #1d9ea3)", color: "#0D1825", fontSize: 16, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 16px rgba(43,191,197,0.3)", marginBottom: 12 }}>
          Start Digital Readiness →
        </button>
        <br />
        <button onClick={() => window.open("https://endevo.life", "_blank")} style={{ padding: "10px 28px", borderRadius: 99, border: "1px solid rgba(232,97,42,0.4)", cursor: "pointer", background: "transparent", color: "#E8612A", fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
          Start My Full Playbook at ENDevo →
        </button>
      </div>

      <button onClick={onRestart} style={{ width: "100%", padding: "12px", borderRadius: 12, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#667788", fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Retake Physical Assessment</button>
    </div>
  );
}

// ─── APP (standalone Physical domain) ────────────────────────────────────────

export default function PhysicalAssessment({ onComplete }) {
  const [screen, setScreen] = useState("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const scrollRef = useRef(null);

  function scrollTop() { if (scrollRef.current) scrollRef.current.scrollTop = 0; else window.scrollTo({ top: 0, behavior: "smooth" }); }
  function handleAnswer(id, value) { setAnswers(prev => ({ ...prev, [id]: value })); }
  function handleNext() { scrollTop(); if (currentQ < PHYSICAL_QUESTIONS.length - 1) { setCurrentQ(q => q + 1); } else { setScreen("results"); } }
  function handleRestart() { setAnswers({}); setCurrentQ(0); setScreen("intro"); scrollTop(); }

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
              <JesseAvatar size={28} emoji={PHYSICAL_META.avatar} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#2BBFC5", fontFamily: "'DM Mono', monospace" }}>Jesse</span>
              <span style={{ fontSize: 11, color: "#445566", fontFamily: "'DM Mono', monospace" }}>by ENDevo</span>
            </div>
            <span style={{ fontSize: 10, letterSpacing: 2, color: "#334455", fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>PHYSICAL READINESS</span>
          </div>
          {screen === "intro" && <IntroScreen meta={PHYSICAL_META} onStart={() => setScreen("question")} />}
          {screen === "question" && <QuestionScreen question={PHYSICAL_QUESTIONS[currentQ]} currentAnswer={answers[PHYSICAL_QUESTIONS[currentQ].id]} onAnswer={handleAnswer} onNext={handleNext} qIndex={currentQ} total={PHYSICAL_QUESTIONS.length} meta={PHYSICAL_META} domains={PHYSICAL_DOMAINS} />}
          {screen === "transition" && <TransitionScreen meta={PHYSICAL_META} onContinue={() => window.open(PHYSICAL_META.transition.nextUrl, "_blank")} />}
          {screen === "results" && <ResultsScreen answers={answers} meta={PHYSICAL_META} domains={PHYSICAL_DOMAINS} questions={PHYSICAL_QUESTIONS} onRestart={handleRestart} />}
        </div>
      </div>
    </>
  );
}
