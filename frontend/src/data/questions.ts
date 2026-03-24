export interface Answer {
  label: string;
  text: string;
  score: number;
}

export interface Question {
  id: string;
  number: number;
  domain: string;
  weight: number;
  text: string;
  answers: Answer[];
}

// ── Domain definitions ────────────────────────────────────────────────────────
export const DOMAINS = [
  { key: "legal",     label: "Legal Readiness",     icon: "⚖️",  desc: "Will, POA, guardianship, probate, letter of instruction" },
  { key: "financial", label: "Financial Readiness", icon: "💰",  desc: "Executor, POD/TOD, inventory, insurance, tax planning" },
  { key: "physical",  label: "Physical Readiness",  icon: "🕊️", desc: "Healthcare proxy, living will, hospice, final disposition" },
  { key: "digital",   label: "Digital Readiness",   icon: "🔐",  desc: "Passwords, backups, accounts, platform legacy" },
] as const;

export type DomainKey = typeof DOMAINS[number]["key"];

// ── All questions grouped by domain ──────────────────────────────────────────
export const QUESTIONS_BY_DOMAIN: Record<DomainKey, Question[]> = {

  // ── LEGAL (10 questions) ──────────────────────────────────────────────────
  legal: [
    {
      id: "l1_financial_poa", number: 1, domain: "Legal Readiness", weight: 10,
      text: "Do you have a Durable Power of Attorney for financial decisions?",
      answers: [
        { label: "A", text: "Yes — signed, valid, and my agent knows they're named and where it is.", score: 10 },
        { label: "B", text: "Yes — but I'm not sure if it's durable or whether it's current.", score: 6 },
        { label: "C", text: "No — but I know I need one.", score: 3 },
        { label: "D", text: "No — I didn't know this was something I needed.", score: 0 },
      ],
    },
    {
      id: "l2_healthcare_poa", number: 2, domain: "Legal Readiness", weight: 10,
      text: "Do you have a Healthcare Power of Attorney naming someone to make medical decisions if you can't?",
      answers: [
        { label: "A", text: "Yes — signed, and my proxy has a copy and knows their role.", score: 10 },
        { label: "B", text: "I have something but I'm not sure it's current or that my proxy has a copy.", score: 6 },
        { label: "C", text: "No — but I've thought about who I'd want.", score: 3 },
        { label: "D", text: "No — I haven't addressed this at all.", score: 0 },
      ],
    },
    {
      id: "l3_key_people", number: 3, domain: "Legal Readiness", weight: 10,
      text: "Have you formally named — and briefed — the people who will manage your estate and carry out your wishes?",
      answers: [
        { label: "A", text: "Yes — all roles are formally named, those people know, and they've been briefed.", score: 10 },
        { label: "B", text: "Named in documents, but we've never walked through the details together.", score: 6 },
        { label: "C", text: "I have people in mind but nothing is formally documented.", score: 3 },
        { label: "D", text: "No — I haven't thought through who these people would be.", score: 0 },
      ],
    },
    {
      id: "l4_will", number: 4, domain: "Legal Readiness", weight: 10,
      text: "Do you have a legally valid, signed will?",
      answers: [
        { label: "A", text: "Yes — signed, witnessed, and stored securely where my executor can find it.", score: 10 },
        { label: "B", text: "I have a draft but it's not finalized or signed.", score: 6 },
        { label: "C", text: "No — but I know I need one.", score: 3 },
        { label: "D", text: "No — and I'm not sure I need one.", score: 0 },
      ],
    },
    {
      id: "l5_will_updated", number: 5, domain: "Legal Readiness", weight: 10,
      text: "When was your will last reviewed and updated?",
      answers: [
        { label: "A", text: "Within the last 3 years.", score: 10 },
        { label: "B", text: "3 to 7 years ago.", score: 6 },
        { label: "C", text: "More than 7 years ago, or after a major life change I didn't follow up on.", score: 3 },
        { label: "D", text: "I don't have a will, or I genuinely don't know when it was last updated.", score: 0 },
      ],
    },
    {
      id: "l6_guardianship", number: 6, domain: "Legal Readiness", weight: 10,
      text: "If you have minor children or dependents with disabilities, have you legally named their guardian?",
      answers: [
        { label: "A", text: "Yes — named in my will, and the guardian knows and has agreed.", score: 10 },
        { label: "B", text: "Verbally agreed with someone but it's not documented legally.", score: 6 },
        { label: "C", text: "I have someone in mind but nothing is documented.", score: 3 },
        { label: "D", text: "This doesn't apply to me — or I haven't addressed it.", score: 0 },
      ],
    },
    {
      id: "l7_trust", number: 7, domain: "Legal Readiness", weight: 10,
      text: "Do you have — or have you determined whether you need — a trust?",
      answers: [
        { label: "A", text: "Yes — I have a trust that's funded and up to date.", score: 10 },
        { label: "B", text: "I have a trust but it's not fully funded or hasn't been reviewed recently.", score: 6 },
        { label: "C", text: "I've been told I might need one but haven't acted on it.", score: 3 },
        { label: "D", text: "I don't know if I need a trust or what it would do for me.", score: 0 },
      ],
    },
    {
      id: "l8_probate", number: 8, domain: "Legal Readiness", weight: 10,
      text: "Do you understand what assets in your estate would go through probate — and have you taken steps to minimize it?",
      answers: [
        { label: "A", text: "Yes — I've mapped my estate and structured assets to minimize probate.", score: 10 },
        { label: "B", text: "I have some knowledge but haven't fully mapped everything.", score: 6 },
        { label: "C", text: "I've heard of probate but don't fully understand what it means for my estate.", score: 3 },
        { label: "D", text: "I didn't know probate was something I needed to think about.", score: 0 },
      ],
    },
    {
      id: "l9_letter_of_instruction", number: 9, domain: "Legal Readiness", weight: 10,
      text: "Have you written a Letter of Instruction — the practical roadmap that tells your executor exactly what to do, who to call, and where everything is?",
      answers: [
        { label: "A", text: "Yes — complete, up to date, and stored where my executor can find it.", score: 10 },
        { label: "B", text: "I've started one but it's incomplete or out of date.", score: 6 },
        { label: "C", text: "I know what it is but haven't written one yet.", score: 3 },
        { label: "D", text: "I've never heard of a Letter of Instruction.", score: 0 },
      ],
    },
    {
      id: "l10_maid", number: 10, domain: "Legal Readiness", weight: 10,
      text: "Have you documented your wishes around end-of-life choices — including Medical Aid in Dying if legal in your state — and do the right people know your position?",
      answers: [
        { label: "A", text: "Yes — my wishes are documented and shared with my healthcare proxy and physician.", score: 10 },
        { label: "B", text: "I know my wishes but they're not formally documented anywhere.", score: 6 },
        { label: "C", text: "I'm not sure what's available in my state or what I'd want.", score: 3 },
        { label: "D", text: "I had no idea this was something to document.", score: 0 },
      ],
    },
  ],

  // ── FINANCIAL (10 questions) ──────────────────────────────────────────────
  financial: [
    {
      id: "f1_executor_briefed", number: 1, domain: "Financial Readiness", weight: 10,
      text: "Have you had a direct, detailed conversation with your executor about your financial wishes — where everything is and what to do first?",
      answers: [
        { label: "A", text: "Yes — fully briefed, they know where everything is and understand what to do first.", score: 10 },
        { label: "B", text: "They know they're named but we've never walked through the details.", score: 6 },
        { label: "C", text: "I've mentioned it casually — no real planning conversation has happened.", score: 3 },
        { label: "D", text: "I've named someone but we haven't talked about any of this.", score: 0 },
      ],
    },
    {
      id: "f2_pod_tod", number: 2, domain: "Financial Readiness", weight: 10,
      text: "Do your bank and investment accounts have named POD or TOD beneficiary designations?",
      answers: [
        { label: "A", text: "Yes — all accounts have current designations and I've verified them recently.", score: 10 },
        { label: "B", text: "Some accounts are designated, but I haven't confirmed all of them.", score: 6 },
        { label: "C", text: "I'm aware of POD/TOD but haven't set them up yet.", score: 3 },
        { label: "D", text: "I had no idea this was something I needed to do.", score: 0 },
      ],
    },
    {
      id: "f3_access", number: 3, domain: "Financial Readiness", weight: 10,
      text: "If you died tomorrow, could your loved ones locate all your accounts and access funds within days — not months?",
      answers: [
        { label: "A", text: "Yes — everything is documented, stored securely, and at least one trusted person knows exactly where.", score: 10 },
        { label: "B", text: "They could figure it out, but it would take time and involve a lot of searching.", score: 6 },
        { label: "C", text: "Probably not — I haven't set this up in a way they could navigate without me.", score: 3 },
        { label: "D", text: "No — this would be a costly, confusing scavenger hunt.", score: 0 },
      ],
    },
    {
      id: "f4_cashflow", number: 4, domain: "Financial Readiness", weight: 10,
      text: "Do you have sufficient life insurance or liquid assets to cover final expenses and provide immediate cash flow for your dependents?",
      answers: [
        { label: "A", text: "Yes — coverage and liquid assets are in place for all three scenarios.", score: 10 },
        { label: "B", text: "I have some coverage but I'm not sure it's adequate for all three scenarios.", score: 6 },
        { label: "C", text: "I have minimal or no life insurance and haven't planned for these scenarios.", score: 3 },
        { label: "D", text: "I haven't thought through how my family would be financially supported if something happened.", score: 0 },
      ],
    },
    {
      id: "f5_inventory", number: 5, domain: "Financial Readiness", weight: 10,
      text: "Do you have a written inventory of all your financial accounts — bank, investment, retirement, and insurance?",
      answers: [
        { label: "A", text: "Yes — complete, up to date, and stored where my trusted people can find it.", score: 10 },
        { label: "B", text: "I have a partial list but it's incomplete or hasn't been updated recently.", score: 6 },
        { label: "C", text: "It's all in my head — I haven't written it down.", score: 3 },
        { label: "D", text: "No — I haven't started and I'm not sure where to begin.", score: 0 },
      ],
    },
    {
      id: "f6_beneficiary_review", number: 6, domain: "Financial Readiness", weight: 10,
      text: "When did you last review and confirm your beneficiary designations across all accounts?",
      answers: [
        { label: "A", text: "Within the last 12 months — I do this annually.", score: 10 },
        { label: "B", text: "Within the last 3 years — but not recently.", score: 6 },
        { label: "C", text: "More than 3 years ago, or after a major life change I didn't follow up on.", score: 3 },
        { label: "D", text: "I've never reviewed them — or I'm not sure who is currently named.", score: 0 },
      ],
    },
    {
      id: "f7_debt", number: 7, domain: "Financial Readiness", weight: 10,
      text: "Are your significant debts documented — mortgage, loans, credit cards — with clear guidance for your executor on how to handle each one?",
      answers: [
        { label: "A", text: "Yes — debts are fully documented and my executor has been briefed on each one.", score: 10 },
        { label: "B", text: "My major debts are known, but nothing is formally documented for my executor.", score: 6 },
        { label: "C", text: "Partially — I've documented some things but not all.", score: 3 },
        { label: "D", text: "No — my debts aren't documented and my executor doesn't know what to expect.", score: 0 },
      ],
    },
    {
      id: "f8_financial_team", number: 8, domain: "Financial Readiness", weight: 10,
      text: "Do you have a financial advisor and insurance broker who are part of your end-of-life planning?",
      answers: [
        { label: "A", text: "Yes — I have both, they know my end-of-life wishes, and we review things regularly.", score: 10 },
        { label: "B", text: "I have one or both but we've never discussed end-of-life planning specifically.", score: 6 },
        { label: "C", text: "I don't have these professionals in place but I know I should.", score: 3 },
        { label: "D", text: "No — and I don't know where to start finding the right people.", score: 0 },
      ],
    },
    {
      id: "f9_storage", number: 9, domain: "Financial Readiness", weight: 10,
      text: "Do you have a secure, organized storage system — physical and digital — where all your financial documents can be found?",
      answers: [
        { label: "A", text: "Yes — fireproof home safe and/or digital vault, organized, and my trusted people know how to access it.", score: 10 },
        { label: "B", text: "Documents exist but are scattered across different locations and hard to navigate.", score: 6 },
        { label: "C", text: "I use a safe deposit box — I wasn't aware of the access limitations after death.", score: 3 },
        { label: "D", text: "No organized system — documents are wherever they ended up.", score: 0 },
      ],
    },
    {
      id: "f10_tax", number: 10, domain: "Financial Readiness", weight: 10,
      text: "Have you addressed the potential tax implications of your estate on your beneficiaries?",
      answers: [
        { label: "A", text: "Yes — I've worked with a professional to understand and minimize tax exposure.", score: 10 },
        { label: "B", text: "I know this exists but haven't formally reviewed my exposure with a professional.", score: 6 },
        { label: "C", text: "I'm aware it's a thing but don't know if it applies to my estate.", score: 3 },
        { label: "D", text: "I had no idea estate or inheritance taxes were something I needed to consider.", score: 0 },
      ],
    },
  ],

  // ── PHYSICAL (10 questions) ───────────────────────────────────────────────
  physical: [
    {
      id: "p1_proxy", number: 1, domain: "Physical Readiness", weight: 10,
      text: "Have you named a healthcare proxy and had a real conversation with them about your wishes?",
      answers: [
        { label: "A", text: "Yes — named, documented, and we've had a detailed conversation about what I'd want.", score: 10 },
        { label: "B", text: "I've named someone but we've never really talked about what I'd actually want.", score: 6 },
        { label: "C", text: "I have someone in mind but haven't formally named or briefed them.", score: 3 },
        { label: "D", text: "No one is designated — I haven't done either.", score: 0 },
      ],
    },
    {
      id: "p2_advance_directive", number: 2, domain: "Physical Readiness", weight: 10,
      text: "Do you have a completed Medical Advance Directive or Living Will?",
      answers: [
        { label: "A", text: "Yes — completed, notarized, and my healthcare proxy has a copy.", score: 10 },
        { label: "B", text: "Started but not completed or notarized.", score: 6 },
        { label: "C", text: "I know I need one but haven't started.", score: 3 },
        { label: "D", text: "I'm not sure what this is or whether I need one.", score: 0 },
      ],
    },
    {
      id: "p3_quality_quantity", number: 3, domain: "Physical Readiness", weight: 10,
      text: "Have you documented your quality vs. quantity of life preferences — ventilators, feeding tubes, CPR, life support?",
      answers: [
        { label: "A", text: "Yes — documented with specific language about what I do and don't want.", score: 10 },
        { label: "B", text: "I've thought about it and have general preferences but nothing is written down.", score: 6 },
        { label: "C", text: "I find this topic hard to engage with and have avoided it.", score: 3 },
        { label: "D", text: "I've never considered this and don't know where to start.", score: 0 },
      ],
    },
    {
      id: "p4_palliative_hospice", number: 4, domain: "Physical Readiness", weight: 10,
      text: "Do you understand the difference between palliative care and hospice — and have you documented your preferences for each?",
      answers: [
        { label: "A", text: "Yes — I understand both, know when I'd want each, and it's documented.", score: 10 },
        { label: "B", text: "I have a general sense but haven't documented preferences for either.", score: 6 },
        { label: "C", text: "I've heard the terms but I'm fuzzy on the difference.", score: 3 },
        { label: "D", text: "I'm not familiar with these options at all.", score: 0 },
      ],
    },
    {
      id: "p5_longterm_setting", number: 5, domain: "Physical Readiness", weight: 10,
      text: "Do you have documented preferences for where and how you'd receive care if you could no longer fully care for yourself?",
      answers: [
        { label: "A", text: "Yes — preferences documented, family informed, and financial implications considered.", score: 10 },
        { label: "B", text: "I've thought about it but nothing is written down or discussed with family.", score: 6 },
        { label: "C", text: "I assume my family will figure it out — I haven't engaged with the specifics.", score: 3 },
        { label: "D", text: "I haven't considered this scenario at all.", score: 0 },
      ],
    },
    {
      id: "p6_caregiver_tech", number: 6, domain: "Physical Readiness", weight: 10,
      text: "Have you documented your preferences around who provides your care — family vs. professional — and what role technology plays?",
      answers: [
        { label: "A", text: "Yes — I've thought through both and documented my values clearly.", score: 10 },
        { label: "B", text: "I have preferences but they're not written down.", score: 6 },
        { label: "C", text: "I've never thought about it at this level of detail.", score: 3 },
        { label: "D", text: "No — I wouldn't know how to even start thinking about this.", score: 0 },
      ],
    },
    {
      id: "p7_disposition", number: 7, domain: "Physical Readiness", weight: 10,
      text: "Have you decided how you want your body handled after death — and documented it?",
      answers: [
        { label: "A", text: "Yes — I've chosen my final disposition method, it's documented, and my people know.", score: 10 },
        { label: "B", text: "I've thought about it but haven't put it in writing anywhere.", score: 6 },
        { label: "C", text: "I have a vague preference but haven't made a real decision.", score: 3 },
        { label: "D", text: "I haven't thought about this at all.", score: 0 },
      ],
    },
    {
      id: "p8_preplanning", number: 8, domain: "Physical Readiness", weight: 10,
      text: "Have you done any funeral pre-planning with a funeral home or disposition provider?",
      answers: [
        { label: "A", text: "Yes — pre-planned and pre-paid, with documents stored and family informed.", score: 10 },
        { label: "B", text: "I've had the conversation with a provider but haven't formalized or paid.", score: 6 },
        { label: "C", text: "I know I should but haven't taken any steps yet.", score: 3 },
        { label: "D", text: "I had no idea this was something I could do in advance.", score: 0 },
      ],
    },
    {
      id: "p9_remains", number: 9, domain: "Physical Readiness", weight: 10,
      text: "Do you have documented instructions for what should happen to your remains after disposition?",
      answers: [
        { label: "A", text: "Yes — specific instructions are written down and at least one person knows where they are.", score: 10 },
        { label: "B", text: "I have preferences but they're not documented anywhere findable.", score: 6 },
        { label: "C", text: "I've mentioned it to someone but it's never been written down.", score: 3 },
        { label: "D", text: "No instructions exist — I haven't thought it through this far.", score: 0 },
      ],
    },
    {
      id: "p10_document_access", number: 10, domain: "Physical Readiness", weight: 10,
      text: "Does at least one trusted person know where all your physical planning documents are stored — and could they act on them today?",
      answers: [
        { label: "A", text: "Yes — organized, stored securely, and at least one person knows exactly where and how to access everything.", score: 10 },
        { label: "B", text: "Documents exist but I haven't told anyone where they are.", score: 6 },
        { label: "C", text: "Documents are scattered — I'm not sure I could find them all quickly myself.", score: 3 },
        { label: "D", text: "Nothing is organized or accessible — this has never been set up.", score: 0 },
      ],
    },
  ],

  // ── DIGITAL (40 questions — access, data loss, platform, stewardship) ─────
  digital: [
    // ── Access & Ownership (1–10) ──
    {
      id: "a1_phone_access", number: 1, domain: "Digital Readiness", weight: 10,
      text: "If you died tomorrow, could your loved ones access the data on your phone?",
      answers: [
        { label: "A", text: "Yes — I have Legacy Contacts set up with multiple people identified.", score: 10 },
        { label: "B", text: "Yes — I have one Legacy Contact set up.", score: 6 },
        { label: "C", text: "Maybe — they know my password but nothing is formally set up.", score: 3 },
        { label: "D", text: "No — no one knows my password and I use biometrics only.", score: 0 },
      ],
    },
    {
      id: "a2_password_count", number: 2, domain: "Digital Readiness", weight: 10,
      text: "How many logins and passwords do you have across all your accounts?",
      answers: [
        { label: "A", text: "Under 25 — I keep things streamlined.", score: 10 },
        { label: "B", text: "Around 25–100 — a manageable mix.", score: 6 },
        { label: "C", text: "Over 100 — I've lost count.", score: 3 },
        { label: "D", text: "Way too many to count — it's genuinely overwhelming.", score: 0 },
      ],
    },
    {
      id: "a3_password_manager", number: 3, domain: "Digital Readiness", weight: 10,
      text: "Do you currently use a password manager to store your logins and credentials?",
      answers: [
        { label: "A", text: "Yes — I use one consistently and it's up to date.", score: 10 },
        { label: "B", text: "Yes — but I don't use it consistently or it's out of date.", score: 6 },
        { label: "C", text: "No — I rely on my browser or memory.", score: 3 },
        { label: "D", text: "No — I've never used one and don't know where to start.", score: 0 },
      ],
    },
    {
      id: "a4_handover_speed", number: 4, domain: "Digital Readiness", weight: 10,
      text: "If you had to hand over access to all your digital accounts to a trusted person right now, how long would it take?",
      answers: [
        { label: "A", text: "Under an hour — everything is documented and ready to share securely.", score: 10 },
        { label: "B", text: "A few hours — I'd need to gather and organise things first.", score: 6 },
        { label: "C", text: "A full day or more — it would take serious effort.", score: 3 },
        { label: "D", text: "It would be nearly impossible — I don't know where to start.", score: 0 },
      ],
    },
    {
      id: "a5_email_access", number: 5, domain: "Digital Readiness", weight: 10,
      text: "Does anyone you trust have access to your primary email account in case of emergency?",
      answers: [
        { label: "A", text: "Yes — credentials are securely shared and documented.", score: 10 },
        { label: "B", text: "Sort of — someone knows the password but it's not formalised.", score: 6 },
        { label: "C", text: "No — but I've been meaning to sort this.", score: 3 },
        { label: "D", text: "No — and I haven't thought about it.", score: 0 },
      ],
    },
    {
      id: "a6_financial_accounts", number: 6, domain: "Digital Readiness", weight: 10,
      text: "Are your banking and investment account credentials accessible by someone you trust if needed?",
      answers: [
        { label: "A", text: "Yes — everything is documented and securely stored.", score: 10 },
        { label: "B", text: "Partially — some accounts are covered but not all.", score: 6 },
        { label: "C", text: "Not really — it's scattered and disorganised.", score: 3 },
        { label: "D", text: "No — no one has any financial access details.", score: 0 },
      ],
    },
    {
      id: "a7_master_password", number: 7, domain: "Digital Readiness", weight: 10,
      text: "If you use a password manager, is the master password or recovery key stored securely somewhere a trusted person can find?",
      answers: [
        { label: "A", text: "Yes — it's in a physical safe or secure document known to my executor.", score: 10 },
        { label: "B", text: "It exists but only I know where it is.", score: 6 },
        { label: "C", text: "I haven't set up a recovery key.", score: 3 },
        { label: "D", text: "I don't use a password manager.", score: 0 },
      ],
    },
    {
      id: "a8_device_inventory", number: 8, domain: "Digital Readiness", weight: 10,
      text: "Do you have an up-to-date list of all your devices — phones, laptops, tablets — and how to access them?",
      answers: [
        { label: "A", text: "Yes — documented and accessible to someone I trust.", score: 10 },
        { label: "B", text: "Informally — someone knows roughly what I have.", score: 6 },
        { label: "C", text: "Not really — I'd need to create this from scratch.", score: 3 },
        { label: "D", text: "No list exists at all.", score: 0 },
      ],
    },
    {
      id: "a9_subscription_list", number: 9, domain: "Digital Readiness", weight: 10,
      text: "Do you have a list of all your recurring subscriptions and memberships so they can be cancelled if needed?",
      answers: [
        { label: "A", text: "Yes — a complete list including payment methods.", score: 10 },
        { label: "B", text: "A partial list — I know the main ones.", score: 6 },
        { label: "C", text: "Not written down — I'd have to check my bank statements.", score: 3 },
        { label: "D", text: "No idea how many I even have.", score: 0 },
      ],
    },
    {
      id: "a10_emergency_protocol", number: 10, domain: "Digital Readiness", weight: 10,
      text: "Is there a written emergency access protocol — a single document someone can follow step-by-step to access everything important?",
      answers: [
        { label: "A", text: "Yes — it's written, stored securely, and at least one person knows where it is.", score: 10 },
        { label: "B", text: "It's mostly there but incomplete or out of date.", score: 6 },
        { label: "C", text: "Nothing formal — they'd have to piece it together.", score: 3 },
        { label: "D", text: "Nothing like this exists.", score: 0 },
      ],
    },
    // ── Data Loss (11–20) ──
    {
      id: "d1_social_media_fate", number: 11, domain: "Digital Readiness", weight: 10,
      text: "What do you think happens to your social media accounts after you die?",
      answers: [
        { label: "A", text: "I know exactly — I've set my account memorialization preferences already.", score: 10 },
        { label: "B", text: "They'll probably become ghost accounts, frozen in time.", score: 6 },
        { label: "C", text: "They could become zombie accounts living on the dark web forever.", score: 3 },
        { label: "D", text: "Honestly, I have no idea — I've never thought about it.", score: 0 },
      ],
    },
    {
      id: "d2_cloud_backup", number: 2, domain: "Data Loss Risk", weight: 10,
      text: "Do you use cloud storage (like iCloud, Google Drive, or Dropbox) to back up important personal files and photos?",
      answers: [
        { label: "A", text: "Yes — everything important is backed up and organised in the cloud.", score: 10 },
        { label: "B", text: "Yes — I have cloud storage but it's disorganised.", score: 6 },
        { label: "C", text: "Partially — some things are backed up but not everything critical.", score: 3 },
        { label: "D", text: "No — I rely on local storage only (my phone or hard drive).", score: 0 },
      ],
    },
    {
      id: "d3_photo_backup", number: 3, domain: "Data Loss Risk", weight: 10,
      text: "Are your irreplaceable photos and videos backed up in at least two separate locations?",
      answers: [
        { label: "A", text: "Yes — cloud + external drive, organised and labelled.", score: 10 },
        { label: "B", text: "Cloud only — one location.", score: 6 },
        { label: "C", text: "Only on my phone or a single hard drive.", score: 3 },
        { label: "D", text: "I haven't thought about backing up photos.", score: 0 },
      ],
    },
    {
      id: "d4_email_archive", number: 4, domain: "Data Loss Risk", weight: 10,
      text: "If your email account was deleted tomorrow, would you lose anything critical — contracts, receipts, confirmations?",
      answers: [
        { label: "A", text: "No — important emails are archived or downloaded regularly.", score: 10 },
        { label: "B", text: "Some things — but I can reconstruct most of it.", score: 6 },
        { label: "C", text: "Yes — losing email would be a serious problem.", score: 3 },
        { label: "D", text: "Catastrophic — my email holds everything important.", score: 0 },
      ],
    },
    {
      id: "d5_device_loss", number: 5, domain: "Data Loss Risk", weight: 10,
      text: "If your phone was lost or stolen today, what percentage of your important data would you lose permanently?",
      answers: [
        { label: "A", text: "0% — everything syncs automatically to the cloud.", score: 10 },
        { label: "B", text: "Under 10% — mostly backed up.", score: 6 },
        { label: "C", text: "25–50% — I'd lose a meaningful amount.", score: 3 },
        { label: "D", text: "Over 50% — it would be devastating.", score: 0 },
      ],
    },
    {
      id: "d6_account_memorialization", number: 6, domain: "Data Loss Risk", weight: 10,
      text: "Have you set memorialization or legacy preferences on Facebook, Instagram, or Google?",
      answers: [
        { label: "A", text: "Yes — all major platforms are configured.", score: 10 },
        { label: "B", text: "One or two platforms, not all.", score: 6 },
        { label: "C", text: "I know this is possible but haven't done it.", score: 3 },
        { label: "D", text: "I didn't know this was an option.", score: 0 },
      ],
    },
    {
      id: "d7_creative_work", number: 7, domain: "Data Loss Risk", weight: 10,
      text: "If you create content — writing, music, art, videos — is it backed up in a way that others could access after your death?",
      answers: [
        { label: "A", text: "Yes — backed up, organised, and someone knows where to find it.", score: 10 },
        { label: "B", text: "Backed up but only I know where.", score: 6 },
        { label: "C", text: "Partially backed up — not organised.", score: 3 },
        { label: "D", text: "Not backed up or I don't create anything.", score: 0 },
      ],
    },
    {
      id: "d8_old_accounts", number: 8, domain: "Data Loss Risk", weight: 10,
      text: "Do you have old accounts — forums, old emails, early social profiles — that contain data you'd want preserved or deleted?",
      answers: [
        { label: "A", text: "I've audited and handled all old accounts.", score: 10 },
        { label: "B", text: "I know most of them and have a rough plan.", score: 6 },
        { label: "C", text: "Probably many — I've never audited them.", score: 3 },
        { label: "D", text: "I have no idea what old accounts exist.", score: 0 },
      ],
    },
    {
      id: "d9_important_files", number: 9, domain: "Data Loss Risk", weight: 10,
      text: "Are your most important files — tax records, contracts, medical records — digitised and backed up?",
      answers: [
        { label: "A", text: "Yes — digitised, organised, and backed up in multiple places.", score: 10 },
        { label: "B", text: "Mostly — some gaps.", score: 6 },
        { label: "C", text: "Physical copies only — nothing digitised.", score: 3 },
        { label: "D", text: "I don't know where most of my important files are.", score: 0 },
      ],
    },
    {
      id: "d10_google_inactive", number: 10, domain: "Data Loss Risk", weight: 10,
      text: "Have you set up Google's Inactive Account Manager to decide what happens to your Google data after death?",
      answers: [
        { label: "A", text: "Yes — configured with trusted contacts and instructions.", score: 10 },
        { label: "B", text: "I've started it but not finished.", score: 6 },
        { label: "C", text: "I know about it but haven't done it.", score: 3 },
        { label: "D", text: "I didn't know this existed.", score: 0 },
      ],
    },
    // --- Platform Limitation (21�30) --
    
    {
      id: "p1_digital_legacy_mgr", number: 21, domain: "Digital Readiness", weight: 10,
      text: "Have you designated someone to manage your digital legacy — logins, social media, memberships, subscriptions — if something happens to you?",
      answers: [
        { label: "A", text: "Yes — it's documented and the right person already has access.", score: 10 },
        { label: "B", text: "I have a document with all my logins but no one else has it.", score: 6 },
        { label: "C", text: "I've been meaning to do this — it's on my list.", score: 3 },
        { label: "D", text: "I wouldn't even know where to start.", score: 0 },
      ],
    },
    {
      id: "p2_2fa_enabled", number: 22, domain: "Digital Readiness", weight: 10,
      text: "Have you enabled two-factor authentication (2FA) on your most important accounts?",
      answers: [
        { label: "A", text: "Yes — 2FA is enabled on all critical accounts (banking, email, social).", score: 10 },
        { label: "B", text: "Yes — on some accounts, but not all.", score: 6 },
        { label: "C", text: "I've heard of it but haven't set it up.", score: 3 },
        { label: "D", text: "No — I didn't know this was something I should do.", score: 0 },
      ],
    },
    {
      id: "p3_platform_tos", number: 23, domain: "Digital Readiness", weight: 10,
      text: "Do you know which platforms allow account transfer and which delete everything upon death?",
      answers: [
        { label: "A", text: "Yes — I've read the terms and know my platform policies.", score: 10 },
        { label: "B", text: "I have a rough idea but haven't read the fine print.", score: 6 },
        { label: "C", text: "Not really — I assume they can be transferred.", score: 3 },
        { label: "D", text: "I had no idea this varied by platform.", score: 0 },
      ],
    },
    {
      id: "p4_apple_legacy", number: 24, domain: "Digital Readiness", weight: 10,
      text: "Have you set up Apple's Legacy Contact feature (or equivalent on your device) to grant someone access to your Apple account?",
      answers: [
        { label: "A", text: "Yes — legacy contact is set up and they know about it.", score: 10 },
        { label: "B", text: "I've heard about it but haven't done it yet.", score: 6 },
        { label: "C", text: "I didn't know Apple had this feature.", score: 3 },
        { label: "D", text: "I don't use Apple devices.", score: 0 },
      ],
    },
    {
      id: "p5_crypto_keys", number: 25, domain: "Digital Readiness", weight: 10,
      text: "If you hold cryptocurrency or NFTs, are the private keys or seed phrases stored where a trusted person can find them?",
      answers: [
        { label: "A", text: "Yes — securely stored offline and known to my executor.", score: 10 },
        { label: "B", text: "Stored somewhere safe but only I know where.", score: 6 },
        { label: "C", text: "Only in my head or on a device — risky.", score: 3 },
        { label: "D", text: "I don't hold crypto.", score: 0 },
      ],
    },
    {
      id: "p6_account_recovery", number: 26, domain: "Digital Readiness", weight: 10,
      text: "If you lost access to your main email account today, how quickly could you recover it?",
      answers: [
        { label: "A", text: "Immediately — I have backup codes and recovery methods ready.", score: 10 },
        { label: "B", text: "Within a day — I have a recovery email or phone set up.", score: 6 },
        { label: "C", text: "It would take a while — I'm not sure of the process.", score: 3 },
        { label: "D", text: "I'd probably lose it — no recovery method is set up.", score: 0 },
      ],
    },
    {
      id: "p7_domain_names", number: 27, domain: "Digital Readiness", weight: 10,
      text: "If you own domain names or websites, is there a plan for what happens to them after your death?",
      answers: [
        { label: "A", text: "Yes — documented with login info and renewal instructions.", score: 10 },
        { label: "B", text: "Someone knows I own them but no formal plan.", score: 6 },
        { label: "C", text: "They'd probably just expire.", score: 3 },
        { label: "D", text: "I don't own any domains.", score: 0 },
      ],
    },
    {
      id: "p8_linked_accounts", number: 28, domain: "Digital Readiness", weight: 10,
      text: "Are you aware of how many services are linked to 'Sign in with Google/Apple/Facebook'?",
      answers: [
        { label: "A", text: "Yes — I've audited linked accounts and documented them.", score: 10 },
        { label: "B", text: "I know some but haven't done a full audit.", score: 6 },
        { label: "C", text: "I use it but have never checked how many are linked.", score: 3 },
        { label: "D", text: "I had no idea this creates dependency risk.", score: 0 },
      ],
    },
    {
      id: "p9_streaming_gifting", number: 29, domain: "Digital Readiness", weight: 10,
      text: "Do you know that most digital purchases (movies, music, ebooks) cannot be inherited and are lost upon death?",
      answers: [
        { label: "A", text: "Yes — I've planned accordingly and focused on physical or transferable assets.", score: 10 },
        { label: "B", text: "I knew some platforms were like this but not all.", score: 6 },
        { label: "C", text: "I assumed they could be passed on like physical media.", score: 3 },
        { label: "D", text: "I had no idea — this is alarming.", score: 0 },
      ],
    },
    {
      id: "p10_banking_notifications", number: 30, domain: "Digital Readiness", weight: 10,
      text: "Does your bank or financial institution have an emergency contact or beneficiary designation on file?",
      answers: [
        { label: "A", text: "Yes — all accounts have up-to-date beneficiary/emergency contact info.", score: 10 },
        { label: "B", text: "Some do, not all.", score: 6 },
        { label: "C", text: "I'm not sure — I haven't checked.", score: 3 },
        { label: "D", text: "No — I've never set this up.", score: 0 },
      ],
    },
    // --- Stewardship (31�40) --
    
    {
      id: "s1_wishes_shared", number: 31, domain: "Digital Readiness", weight: 10,
      text: "Do the significant people in your life know what you want to happen upon your death or incapacitation?",
      answers: [
        { label: "A", text: "Yes — my wishes are recorded in a document and shared with them.", score: 10 },
        { label: "B", text: "Yes — I've shared my wishes verbally but nothing is written down.", score: 6 },
        { label: "C", text: "Not really — I'm not sure what my wishes are yet.", score: 3 },
        { label: "D", text: "No — we're all uncomfortable talking about it.", score: 0 },
      ],
    },
    {
      id: "s2_document_storage", number: 32, domain: "Digital Readiness", weight: 10,
      text: "Where do you store your most important documents — insurance policies, financial account details, key instructions?",
      answers: [
        { label: "A", text: "In a secure digital vault or encrypted folder, organised and accessible.", score: 10 },
        { label: "B", text: "Across a mix of places — some digital, some physical, not well organised.", score: 6 },
        { label: "C", text: "Mostly in physical files at home — no real digital backup.", score: 3 },
        { label: "D", text: "Honestly, I'm not sure where everything is.", score: 0 },
      ],
    },
    {
      id: "s3_will_exists", number: 33, domain: "Digital Readiness", weight: 10,
      text: "Do you have a current, legally valid will?",
      answers: [
        { label: "A", text: "Yes — up to date, witnessed, and my executor knows where it is.", score: 10 },
        { label: "B", text: "Yes — but it's old and probably needs updating.", score: 6 },
        { label: "C", text: "No — but I've thought about getting one.", score: 3 },
        { label: "D", text: "No will and I haven't prioritised it.", score: 0 },
      ],
    },
    {
      id: "s4_executor", number: 34, domain: "Digital Readiness", weight: 10,
      text: "Have you nominated an executor — someone legally empowered to handle your estate?",
      answers: [
        { label: "A", text: "Yes — named in my will and they've accepted the role.", score: 10 },
        { label: "B", text: "I have someone in mind but it's not formalised.", score: 6 },
        { label: "C", text: "No — I don't know enough about executors to decide.", score: 3 },
        { label: "D", text: "No executor named — this hasn't been thought about.", score: 0 },
      ],
    },
    {
      id: "s5_poa", number: 35, domain: "Digital Readiness", weight: 10,
      text: "Do you have a Power of Attorney in place for someone to manage your affairs if you become incapacitated?",
      answers: [
        { label: "A", text: "Yes — both financial and medical POA are in place.", score: 10 },
        { label: "B", text: "One or the other — not both.", score: 6 },
        { label: "C", text: "No — but I understand why I need it.", score: 3 },
        { label: "D", text: "No — I didn't know this was important.", score: 0 },
      ],
    },
    {
      id: "s6_insurance_docs", number: 36, domain: "Digital Readiness", weight: 10,
      text: "Are your life insurance policy details documented and accessible to your beneficiaries?",
      answers: [
        { label: "A", text: "Yes — policy number, insurer, and contact info are all documented.", score: 10 },
        { label: "B", text: "The policy exists but finding it would take effort.", score: 6 },
        { label: "C", text: "I have life insurance but honestly can't locate the details easily.", score: 3 },
        { label: "D", text: "I don't have life insurance.", score: 0 },
      ],
    },
    {
      id: "s7_trusted_contact", number: 37, domain: "Digital Readiness", weight: 10,
      text: "Is there one person who knows the full picture of your digital and financial life?",
      answers: [
        { label: "A", text: "Yes — a trusted person is fully briefed and knows where everything is.", score: 10 },
        { label: "B", text: "Mostly — they know the basics but not the full picture.", score: 6 },
        { label: "C", text: "No one has the full picture — it's split across multiple people.", score: 3 },
        { label: "D", text: "Nobody knows anything — I handle everything alone.", score: 0 },
      ],
    },
    {
      id: "s8_minor_children", number: 38, domain: "Digital Readiness", weight: 10,
      text: "If you have minor children, have you legally named a guardian in the event of your death?",
      answers: [
        { label: "A", text: "Yes — named in my will and the guardian is aware.", score: 10 },
        { label: "B", text: "Discussed informally but not formalised in a will.", score: 6 },
        { label: "C", text: "I have children but haven't nominated a guardian.", score: 3 },
        { label: "D", text: "No minor children.", score: 0 },
      ],
    },
    {
      id: "s9_funeral_wishes", number: 39, domain: "Digital Readiness", weight: 10,
      text: "Have you documented your funeral or end-of-life wishes — burial vs cremation, service preferences, digital memorial?",
      answers: [
        { label: "A", text: "Yes — written down, shared, and pre-arranged where possible.", score: 10 },
        { label: "B", text: "Verbally expressed to someone close.", score: 6 },
        { label: "C", text: "I have preferences but haven't communicated them.", score: 3 },
        { label: "D", text: "Never thought about it.", score: 0 },
      ],
    },
    {
      id: "s10_review_cadence", number: 40, domain: "Digital Readiness", weight: 10,
      text: "How often do you review and update your estate plan, digital legacy documents, and key account details?",
      answers: [
        { label: "A", text: "Annually or after major life events.", score: 10 },
        { label: "B", text: "Every few years.", score: 6 },
        { label: "C", text: "Set it up once and never reviewed.", score: 3 },
        { label: "D", text: "I haven't set anything up to review.", score: 0 },
      ],
    },
  ],
};

// Flat list (legacy support — used by scoring when all domains are completed)
export const QUESTIONS: Question[] = [
  ...QUESTIONS_BY_DOMAIN.legal,
  ...QUESTIONS_BY_DOMAIN.financial,
  ...QUESTIONS_BY_DOMAIN.physical,
  ...QUESTIONS_BY_DOMAIN.digital,
];

export interface ReadinessTier {
  label: string;
  emoji: string;
  opening: string;
  priority: string;
  color: string;
}

export const READINESS_TIERS: Record<string, ReadinessTier> = {
  champion: {
    label: "Peace Champion",
    emoji: "🏆",
    opening: "You're genuinely ahead of most people. Let's make sure it stays that way.",
    priority: "Quarterly review + legacy contact verification",
    color: "#22c55e",
  },
  onway: {
    label: "On Your Way",
    emoji: "✅",
    opening: "You've started — now let's close the gaps before they become problems.",
    priority: "Address lowest-scoring domain first",
    color: "#3b82f6",
  },
  clarity: {
    label: "Getting Clarity",
    emoji: "💡",
    opening: "You're more aware than most. A few focused steps will change everything.",
    priority: "Build digital vault + designate legacy contact",
    color: "#f59e0b",
  },
  fresh: {
    label: "Starting Fresh",
    emoji: "🌱",
    opening: "No worries — this is exactly the right place to start. Jesse will guide you.",
    priority: "Full onboarding — flag as highest-priority lead",
    color: "#ef4444",
  },
};

export function getTier(score: number): ReadinessTier {
  if (score >= 85) return READINESS_TIERS.champion;
  if (score >= 60) return READINESS_TIERS.onway;
  if (score >= 35) return READINESS_TIERS.clarity;
  return READINESS_TIERS.fresh;
}

export function getTierKey(score: number): string {
  if (score >= 85) return "champion";
  if (score >= 60) return "onway";
  if (score >= 35) return "clarity";
  return "fresh";
}
