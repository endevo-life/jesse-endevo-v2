import type { Answer, AnswerLetter, DomainKey, DomainScores, ScoringResult } from '../types/index';

// ── Point values per answer ───────────────────────────────────────────────────
const POINTS: Record<AnswerLetter, number> = { A: 10, B: 6, C: 3, D: 0 };

// ── Domain question counts (max possible raw points = count × 10) ─────────────
const DOMAIN_Q_COUNT: Record<DomainKey, number> = {
  legal:     10,
  financial: 10,
  physical:  10,
  digital:   40,
};

// ── Human-readable signal map: domain → question → {C?, D?} ──────────────────
type SignalMap = Record<string, Record<number, Partial<Record<'C' | 'D', string>>>>;

const SIGNALS: SignalMap = {
  legal: {
    1:  { D: 'No Durable POA — court must appoint someone to manage your finances',
          C: 'POA may not be durable or current — urgent to review' },
    2:  { D: 'No Healthcare POA — medical decisions default to law, not your wishes',
          C: 'Healthcare proxy may be outdated or proxy is unaware of their role' },
    3:  { D: 'Estate roles not named or briefed — administration at serious risk',
          C: 'Key people named in documents but never walked through their duties' },
    4:  { D: 'No valid will — estate distributed by intestacy laws, not your wishes',
          C: 'Will drafted but not signed or finalized — not legally valid' },
    5:  { D: 'No will or last review date unknown — reflects a completely different life',
          C: 'Will over 7 years old — likely does not reflect current wishes or assets' },
    6:  { D: 'No guardian named for dependents — courts decide in a crisis',
          C: 'Guardianship preference exists in mind but is not formally documented' },
    7:  { D: 'No trust in place — full estate faces probate, delays, and public record',
          C: 'Trust exists but may be underfunded or more than 3 years out of date' },
    8:  { D: 'No understanding of probate — assets not structured to avoid it',
          C: 'Probate exposure identified but no concrete steps taken to address it' },
    9:  { D: 'No letter of instruction — executor has no roadmap for the estate',
          C: 'Informal notes exist but no formal accessible letter of instruction' },
    10: { D: 'No documented end-of-life wishes — family must make guesses in a crisis',
          C: 'Wishes discussed verbally but never formally recorded or stored' },
  },
  financial: {
    1:  { D: 'Executor not named or briefed — estate administration will stall',
          C: 'Executor named but has never been walked through their duties' },
    2:  { D: 'No POD/TOD designations — most financial assets face full probate',
          C: 'Beneficiary designations exist but have not been reviewed recently' },
    3:  { D: 'No one can access financial accounts — complete blackout for surviving family',
          C: 'Access arrangements are informal and have not been tested' },
    4:  { D: 'No plan for immediate cash needs after death — family may face financial stress',
          C: 'Gaps remain in the short-term cash flow plan' },
    5:  { D: 'No asset inventory — executor cannot locate accounts, policies, or property',
          C: 'Partial inventory — significant assets are likely undocumented' },
    6:  { D: 'Beneficiary designations never reviewed — may name deceased or wrong people',
          C: 'Designations not reviewed in 3+ years and are likely out of date' },
    7:  { D: 'Debts undocumented — estate settlement will be chaotic',
          C: 'Major debts known informally but not formally documented anywhere' },
    8:  { D: 'No financial or legal professionals engaged for estate planning',
          C: 'Advisors exist but have not coordinated on the estate plan together' },
    9:  { D: 'Financial documents scattered or completely inaccessible',
          C: 'Documents exist but not organised or easy for executor to locate' },
    10: { D: 'No estate tax awareness or proactive planning',
          C: 'Some awareness exists but no concrete planning steps have been taken' },
  },
  physical: {
    1:  { D: 'No healthcare proxy — medical decisions revert to default legal hierarchy',
          C: 'Healthcare proxy named verbally but not formally documented' },
    2:  { D: 'No advance directive — family faces impossible decisions without guidance',
          C: 'Advance directive may be outdated or family cannot locate it' },
    3:  { D: 'No documented preference on quality vs quantity of life',
          C: 'Preferences discussed informally but never formally recorded' },
    4:  { D: 'No awareness or plan around palliative care or hospice',
          C: 'Aware of options but no documented wishes or plan in place' },
    5:  { D: 'No long-term care setting preferences documented',
          C: 'Care setting preferences discussed but never formally recorded' },
    6:  { D: 'No plan for caregiver coordination or assistive technology',
          C: 'Informal arrangements exist but no formal caregiving plan' },
    7:  { D: 'No final disposition instructions — full burden placed on grieving family',
          C: 'General wishes known but have never been formally documented' },
    8:  { D: 'No pre-planning for final arrangements — family carries the full burden',
          C: 'Some pre-planning thoughts exist but nothing has been finalized' },
    9:  { D: 'No documented wishes for remains or memorial service',
          C: 'Informal discussions only — nothing in writing or formally recorded' },
    10: { D: 'Physical care documents are inaccessible to family and healthcare team',
          C: 'Documents exist but family or care team cannot easily locate them' },
  },
  digital: {
    1:  { D: 'No legacy contact — loved ones cannot access your phone',
          C: 'Phone access informal — no formal digital legacy contact set up' },
    2:  { D: 'Password volume completely unmanaged — no central system in place',
          C: 'High password count with no password manager' },
    3:  { D: 'No awareness or plan for social media accounts after death',
          C: 'Aware of the social media issue but no action taken' },
    4:  { D: 'No digital legacy manager designated — accounts have no backup plan',
          C: 'Digital legacy manager not yet formally assigned' },
    5:  { D: 'Digital wishes completely unknown to family',
          C: 'Digital wishes discussed but not clearly defined or recorded' },
    6:  { D: 'No password manager — digital security has no foundation',
          C: 'Password manager unused or significantly out of date' },
    7:  { D: 'Important documents unknown or completely inaccessible',
          C: 'Documents scattered — no unified digital storage system' },
    8:  { D: 'No cloud backup — risk of permanent data loss is critical',
          C: 'Cloud backup partial — important files still at risk' },
    9:  { D: '2FA not enabled — all accounts are exposed',
          C: '2FA only partially configured — key accounts still exposed' },
    10: { D: 'Digital handover to family would be nearly impossible',
          C: 'Digital handover would require a full day of intensive work' },
  },
};

// ── Tier thresholds (based on average domain percentage 0–100) ────────────────
const TIERS = [
  { min: 85, max: 100, label: 'Peace Champion'  },
  { min: 60, max: 84,  label: 'On Your Way'     },
  { min: 35, max: 59,  label: 'Getting Clarity' },
  { min: 0,  max: 34,  label: 'Starting Fresh'  },
];

// ── Score a completed multi-domain assessment ─────────────────────────────────
export function score(answers: Answer[], completedDomains: DomainKey[]): ScoringResult {
  console.log(`[Scoring] ${answers.length} answers across domains: [${completedDomains.join(', ')}]`);

  // Group answers by domain
  const byDomain: Partial<Record<DomainKey, Answer[]>> = {};
  for (const ans of answers) {
    const dk = ans.domain as DomainKey;
    if (!byDomain[dk]) byDomain[dk] = [];
    byDomain[dk]!.push(ans);
  }

  const domainScores: DomainScores  = {};
  const criticalGaps: string[]      = [];
  const jesseSignals: string[]      = [];
  let totalPct   = 0;
  let domainCount = 0;

  for (const dk of completedDomains) {
    const dAnswers = byDomain[dk] ?? [];
    if (dAnswers.length === 0) continue;

    const maxPossible = dAnswers.length * 10;
    let raw = 0;

    for (const { q, answer } of dAnswers) {
      raw += POINTS[answer] ?? 0;
      if (answer === 'C' || answer === 'D') {
        const sig = SIGNALS[dk]?.[q]?.[answer as 'C' | 'D'];
        if (sig) {
          criticalGaps.push(sig);
          jesseSignals.push(sig);
        }
      }
    }

    const pct = Math.round((raw / maxPossible) * 100);
    domainScores[dk] = pct;
    totalPct  += pct;
    domainCount++;
  }

  const overallScore = domainCount > 0 ? Math.round(totalPct / domainCount) : 0;
  const tierObj = TIERS.find(t => overallScore >= t.min && overallScore <= t.max)
    ?? TIERS[TIERS.length - 1];

  // Weakest completed domain
  let lowestDomain: DomainKey = completedDomains[0] ?? 'legal';
  let lowestPct = 101;
  for (const dk of completedDomains) {
    const pct = domainScores[dk] ?? 0;
    if (pct < lowestPct) { lowestPct = pct; lowestDomain = dk; }
  }

  console.log(`[Scoring] Overall: ${overallScore}/100 | Tier: "${tierObj.label}" | Gaps: ${criticalGaps.length} | Weakest: ${lowestDomain}`);
  console.log(`[Scoring] Domain scores:`, JSON.stringify(domainScores));

  // suppress unused-var warning — kept for future domain-cap logic
  void DOMAIN_Q_COUNT;

  return {
    readiness_score:   overallScore,
    tier:              tierObj.label,
    domain_scores:     domainScores,
    critical_gaps:     criticalGaps,
    jesse_signals:     jesseSignals,
    lowest_domain:     lowestDomain,
    completed_domains: completedDomains,
  };
}
