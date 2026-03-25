import Anthropic from '@anthropic-ai/sdk';
import type { AssessmentPayload, PlanResult, DomainKey } from '../types/index';

// ── Domain display labels ─────────────────────────────────────────────────────
const DOMAIN_LABELS: Record<DomainKey, string> = {
  legal:     'Legal Readiness',
  financial: 'Financial Readiness',
  physical:  'Physical Readiness',
  digital:   'Digital Readiness',
};

// ── Readiness level per domain score ─────────────────────────────────────────
function domainTier(pct: number): string {
  if (pct >= 85) return 'Protected';
  if (pct >= 60) return 'On Solid Ground';
  if (pct >= 35) return 'Getting Organised';
  return 'Needs Attention';
}

// ── Dynamic fallback plan builder (used when no API key) ─────────────────────
const DOMAIN_FALLBACK: Record<DomainKey, Record<string, string>> = {
  legal: {
    low: `- Name Your Financial POA Today | Contact a solicitor or use an online service — this single document prevents court involvement.
- Finalise or Sign Your Will | A will that is not signed is not valid — this week, fix that one thing.
- Brief Your Executor | Sit down with the person responsible and walk them through where everything lives.
NOTE: Your legal foundation protects your family from years of uncertainty. One document changes everything.`,
    high: `- Review Your POA and Will Annually | Schedule a 30-minute annual review — update after any major life change.
- Store All Documents Centrally | Every executor, proxy, and guardian should know where to find the originals.
- Brief Everyone Named | A trusted person who has never read their role cannot fulfil it — close that gap now.
NOTE: You have solid legal foundations. Maintenance keeps them effective as your life evolves.`,
  },
  financial: {
    low: `- Build Your Asset Inventory This Week | List every account, policy, and property — your executor needs this list to do their job.
- Add POD/TOD to Your Main Accounts | Visit your bank and investment accounts — add a beneficiary designation to each.
- Brief Your Executor on Access | Tell them where you bank, which accounts exist, and how to reach your financial advisor.
NOTE: A financial plan your family cannot find is no plan at all. Getting organised this week saves years of court process.`,
    high: `- Review Beneficiary Designations Annually | Check every account and policy — outdated designations overrule your will.
- Coordinate Your Financial and Legal Team | Your accountant and solicitor should know each other's role in your estate.
- Stress-Test Your Cash Flow Plan | Confirm surviving family members could cover 6 months of expenses without your income.
NOTE: Your financial plan is solid. Annual reviews and coordination keep it current as your assets grow.`,
  },
  physical: {
    low: `- Name a Healthcare Proxy This Week | Choose someone who will advocate for your wishes — tell them and write it down formally.
- Document Your End-of-Life Wishes | Even a signed letter explaining your quality-of-life preferences is better than silence.
- Research Advance Directive Options | Your country or state has standard forms — download one and complete it today.
NOTE: One documented conversation protects your family from impossible decisions. Start there.`,
    high: `- Ensure Your Proxy Has a Current Copy | Outdated or inaccessible documents cannot be acted upon in a crisis.
- Review Palliative and Hospice Preferences | Confirming these wishes annually means no guesswork later.
- Share Your Plan With Your Healthcare Provider | Your GP or primary physician should have your wishes on file.
NOTE: You have strong physical readiness. Keeping your documents current and accessible is all that remains.`,
  },
  digital: {
    low: `- Set Up a Password Manager This Week | Bitwarden is free — add your five most critical logins as your first step.
- Assign a Legacy Contact on Your Phone | iPhone: Settings > [Your Name] > Legacy Contact. Android: Google Inactive Account Manager.
- Tell One Person Where Your Digital Life Lives | A trusted person who knows nothing cannot help — one conversation changes that.
NOTE: Your digital life is the most invisible part of your estate. Starting with a password manager unlocks everything else.`,
    high: `- Review Your Password Manager for Stale Logins | Remove accounts you no longer use — a lean vault is a safe vault.
- Confirm Your Legacy Contact Is Still the Right Person | Relationships change — check this once a year.
- Back Up Your Three Most Irreplaceable Files | Photos, personal recordings, key documents — confirm they are in the cloud today.
NOTE: Your digital life is well organised. Annual reviews and a current legacy contact keep it that way.`,
  },
};

function buildFallbackPlan(payload: AssessmentPayload): string {
  const { completed_domains, domain_scores } = payload;

  const sorted = [...completed_domains].sort(
    (a, b) => (domain_scores[a] ?? 0) - (domain_scores[b] ?? 0)
  );

  let plan = '';
  let day  = 0;

  for (const dk of sorted) {
    day++;
    const pct     = domain_scores[dk] ?? 0;
    const label   = DOMAIN_LABELS[dk];
    const variant = pct >= 60 ? 'high' : 'low';
    const content = DOMAIN_FALLBACK[dk]?.[variant] ?? DOMAIN_FALLBACK[dk]?.low ?? '';

    const titleSuffix = pct >= 85 ? 'Maintain Your Advantage'
      : pct >= 60 ? 'Close the Remaining Gaps'
      : pct >= 35 ? 'Build Your Foundation'
      : 'Start From Scratch — You Can Do This';

    plan += `Day ${day}: ${label} — ${titleSuffix}\n${content}\n\n`;
  }

  day++;
  plan += `Day ${day}: Your Quick Wins — Start Here This Week
- Schedule One Review Session | Block 45 minutes this week — tackle the highest-priority domain first.
- Tell One Trusted Person | Let them know you're getting organised and where the important documents live.
- Save and Share This Plan | Store this PDF somewhere you'll find it in 6 months — and send a copy to your executor.
NOTE: You've taken the most important step by getting your assessment done. Now act on the top priority — one step at a time.\n`;

  return plan;
}

// ── Build the Claude prompt payload ──────────────────────────────────────────
interface PromptPayload {
  system: string;
  user:   string;
}

function buildPrompt(payload: AssessmentPayload, knowledgeContext?: string): PromptPayload {
  const { name, readiness_score, tier, jesse_signals, lowest_domain, domain_scores, completed_domains } = payload;

  const domainScoreLines = completed_domains
    .map(dk => `- ${DOMAIN_LABELS[dk]}: ${domain_scores[dk] ?? 0}/100 (${domainTier(domain_scores[dk] ?? 0)})`)
    .join('\n');

  const orderedDomains = [...completed_domains].sort(
    (a, b) => (domain_scores[a] ?? 0) - (domain_scores[b] ?? 0)
  );

  const domainOrder = orderedDomains
    .map((dk, i) => `${i + 1}. ${DOMAIN_LABELS[dk]} (${domain_scores[dk] ?? 0}/100)`)
    .join('\n');

  const signalsList = jesse_signals.length > 0
    ? jesse_signals.map(s => `- ${s}`).join('\n')
    : '- No critical gaps — focus on maintenance and advanced preparation';

  const lowestLabel = DOMAIN_LABELS[lowest_domain as DomainKey] ?? lowest_domain;

  return {
    system: `You are Jesse, ENDevo's warm and trusted end-of-life readiness guide.
You help people feel prepared, clear, and in control — not scared or overwhelmed.
Your tone is: warm, direct, practical, and encouraging. Never clinical or legal.
This is educational planning guidance only — no legal advice, medical advice, or financial product recommendations.`,

    user: `Generate a comprehensive End-of-Life Readiness Plan for ${name}.

OVERALL SCORE: ${readiness_score}/100 — ${tier}
PRIORITY AREA: ${lowestLabel} (their weakest domain)

ASSESSED DOMAINS (ordered weakest to strongest):
${domainScoreLines}

PLAN ORDER (address weakest domain first):
${domainOrder}

CRITICAL GAPS TO ADDRESS:
${signalsList}

---

Format the plan as plain text with one section per domain (ordered exactly as listed above), then a Quick Wins closer.

Each section uses this EXACT format:

Day N: [Domain Label] — [Short Action-Oriented Title]
- Bold Action Title | One warm sentence explaining what to do and why it matters.
- Bold Action Title | One warm sentence.
- Bold Action Title | One warm sentence.
NOTE: One sentence of encouragement about this domain. Next: [preview of next section].

Final section (after all domains):
Day N: Your Quick Wins — Start Here This Week
- [2–3 universal first-step actions]
NOTE: One closing sentence of real encouragement.

---

${knowledgeContext ? `---\n\nRELEVANT KNOWLEDGE BASE CONTEXT (use to enrich your advice):\n${knowledgeContext}\n\n---\n\n` : ''}RULES:
Plain text only. No markdown. No #, **, __, >, or extra symbols.
Each day header: "Day N: Title" on its own line.
Each action: "- Bold Title | Description" using pipe separator.
Each day: 3–4 actions directly tied to the gaps identified above.
NOTE line: starts with "NOTE: " — one sentence, warm and specific.
Bold Title: 3–6 words, imperative, concrete.
Description: 12–20 words, warm, motivating, practical. Say WHY or HOW.
For domains scoring 85+: focus on 2 maintenance actions + 1 upcoming life-change tip.
For domains scoring below 35: focus on first steps that feel achievable today.
Never name specific products, firms, or attorneys. Keep it actionable and warm.`,
  };
}

// ── Call Claude, fall back silently on any failure ────────────────────────────
export async function generatePlan(payload: AssessmentPayload, knowledgeContext?: string): Promise<PlanResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const hasKey = apiKey && apiKey !== 'your_anthropic_api_key_here';

  if (!hasKey) {
    console.log('[AI] No API key — using dynamic fallback plan');
    return { plan: buildFallbackPlan(payload), source: 'static' };
  }

  try {
    const client    = new Anthropic({ apiKey });
    const { system, user } = buildPrompt(payload, knowledgeContext);
    const timeoutMs = parseInt(process.env.AI_TIMEOUT_MS ?? '25000', 10);
    const model     = process.env.AI_MODEL || 'claude-haiku-4-5-20251001';

    console.log(`[AI] Calling Claude (model: ${model}, timeout: ${timeoutMs}ms, tier: ${payload.tier}, domains: ${payload.completed_domains.join(',')})`);

    const response = await Promise.race([
      client.messages.create({
        model,
        max_tokens: 2500,
        system,
        messages: [{ role: 'user', content: user }],
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI timeout')), timeoutMs)
      ),
    ]);

    const plan = response.content?.[0]?.type === 'text' ? response.content[0].text : '';
    console.log(`[AI] Plan generated (${plan.length} chars)`);
    return { plan, source: 'ai' };

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[AI] Claude call failed — using dynamic fallback:', message);
    return { plan: buildFallbackPlan(payload), source: 'static' };
  }
}
