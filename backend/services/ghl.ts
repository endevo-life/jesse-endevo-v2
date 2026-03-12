/**
 * GoHighLevel CRM Integration
 *
 * Uses GHL v2 upsert endpoint — single API call that:
 *   - Creates the contact if email is not found in GHL
 *   - Updates ALL fields (name, tags, custom fields) if email already exists
 *   → No duplicate contacts ever. No separate PUT needed.
 *
 * Endpoint: POST https://services.leadconnectorhq.com/contacts/upsert
 * Auth:     Bearer <Location API Key>  (same key as v1)
 * Header:   Version: 2021-07-28
 *
 * ── How to get your IDs ────────────────────────────────────────────────────
 *   API Key      → GHL > Settings > Business Profile > API Key
 *   Location ID  → GHL > Settings > Business Profile > Location ID
 *   Pipeline ID  → GHL > Opportunities > your pipeline URL contains the ID
 *                  OR call GET https://rest.gohighlevel.com/v1/pipelines/
 *   Stage IDs    → same GET /v1/pipelines/ response — each stage has an "id"
 *   Field IDs    → run: cd backend && npx ts-node scripts/test-ghl.ts
 * ──────────────────────────────────────────────────────────────────────────
 */

import type { AssessmentPayload } from '../types/index';

const GHL_V1_BASE    = 'https://rest.gohighlevel.com/v1';
const GHL_TIMEOUT_MS = 12_000; // 12 s — well inside Vercel's 30 s limit

/** Fetch with an AbortController timeout. Throws on network error with cause. */
async function ghlFetch(url: string, init: RequestInit): Promise<Response> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), GHL_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: ac.signal });
  } catch (err) {
    const cause = (err as { cause?: unknown }).cause;
    const label = ac.signal.aborted ? `timeout (>${GHL_TIMEOUT_MS}ms)` : String(cause ?? err);
    throw new Error(`GHL fetch failed [${url}]: ${label}`);
  } finally {
    clearTimeout(timer);
  }
}

// ── Tier → pipeline stage mapping ────────────────────────────────────────────
const TIER_STAGE_ID: Record<string, string> = {
  'Peace Champion':  process.env.GHL_STAGE_PEACE_CHAMPION  || '',
  'On Your Way':     process.env.GHL_STAGE_ON_YOUR_WAY     || '',
  'Getting Clarity': process.env.GHL_STAGE_GETTING_CLARITY || '',
  'Starting Fresh':  process.env.GHL_STAGE_STARTING_FRESH  || '',
};

// ── Score bucket tag ──────────────────────────────────────────────────────────
function scoreBucketTag(score: number): string {
  if (score >= 85) return 'Score: 85-100';
  if (score >= 60) return 'Score: 60-84';
  if (score >= 35) return 'Score: 35-59';
  return 'Score: 0-34';
}

// ── Domain label map ─────────────────────────────────────────────────────────
const DOMAIN_LABELS: Record<string, string> = {
  access_ownership:    'Access & Ownership',
  data_loss:           'Data Loss',
  platform_limitation: 'Platform Limitation',
  stewardship:         'Stewardship',
};

// ── Main export ───────────────────────────────────────────────────────────────
export async function pushToGoHighLevel(payload: AssessmentPayload): Promise<void> {
  const apiKey     = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;
  const pipelineId = process.env.GHL_PIPELINE_ID;

  if (!apiKey || !locationId) {
    console.log('[GHL] Skipped — GHL_API_KEY or GHL_LOCATION_ID not set');
    return;
  }

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type':  'application/json',
  };

  // ── Name split ───────────────────────────────────────────────────────────
  const nameParts = payload.name.trim().split(/\s+/);
  const firstName = nameParts[0];
  const lastName  = nameParts.slice(1).join(' ');

  // ── Tags ─────────────────────────────────────────────────────────────────
  const tags = [
    `Jesse Tier: ${payload.tier}`,
    scoreBucketTag(payload.readiness_score),
    `Weakest: ${DOMAIN_LABELS[payload.lowest_domain] ?? payload.lowest_domain}`,
    'Jesse Quiz Completed',
  ];

  // ── Custom fields (v1 format — id + value as string) ─────────────────────
  const customField: { id: string; value: string }[] = [];

  if (process.env.GHL_FIELD_SCORE)
    customField.push({ id: process.env.GHL_FIELD_SCORE,         value: String(payload.readiness_score) });
  if (process.env.GHL_FIELD_TIER)
    customField.push({ id: process.env.GHL_FIELD_TIER,          value: payload.tier });
  if (process.env.GHL_FIELD_GAPS)
    customField.push({ id: process.env.GHL_FIELD_GAPS,          value: payload.critical_gaps.join(', ') });
  if (process.env.GHL_FIELD_LOWEST_DOMAIN)
    customField.push({ id: process.env.GHL_FIELD_LOWEST_DOMAIN, value: DOMAIN_LABELS[payload.lowest_domain] ?? payload.lowest_domain });
  if (process.env.GHL_FIELD_SIGNALS)
    customField.push({ id: process.env.GHL_FIELD_SIGNALS,       value: payload.jesse_signals.join(' | ') });

  // ── Step 1: POST /v1/contacts/ — creates OR returns existing contact by email
  console.log(`[GHL] POST contact — email: ${payload.email}, score: ${payload.readiness_score}, tier: ${payload.tier}`);

  const createBody: Record<string, unknown> = {
    firstName,
    ...(lastName ? { lastName } : {}),
    email:      payload.email,
    locationId,
    source:     'Jesse Quiz — ENDevo',
    tags,
  };
  if (customField.length > 0) createBody.customField = customField;

  const createRes = await ghlFetch(`${GHL_V1_BASE}/contacts/`, {
    method:  'POST',
    headers,
    body:    JSON.stringify(createBody),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`GHL contacts POST failed ${createRes.status}: ${err}`);
  }

  const createData = await createRes.json() as { contact?: { id?: string } };
  const contactId  = createData?.contact?.id;
  if (!contactId) throw new Error('GHL: no contact ID in response');

  console.log(`[GHL] Contact ready — id: ${contactId} (tags: ${tags.length}, customFields: ${customField.length})`);

  // ── Step 2: PUT /v1/contacts/:id — force-overwrite tags + custom fields ──
  const updateBody: Record<string, unknown> = { tags };
  if (customField.length > 0) updateBody.customField = customField;

  const updateRes = await ghlFetch(`${GHL_V1_BASE}/contacts/${contactId}`, {
    method:  'PUT',
    headers,
    body:    JSON.stringify(updateBody),
  });

  if (!updateRes.ok) {
    const err = await updateRes.text();
    console.warn(`[GHL] PUT tags/fields failed ${updateRes.status}: ${err} (contact still created)`);
  } else {
    console.log(`[GHL] Tags + custom fields written — id: ${contactId}`);
  }

  // ── Step 3: Opportunity (only when pipeline is configured) ───────────────
  if (!pipelineId) {
    console.log('[GHL] No GHL_PIPELINE_ID — skipping opportunity');
    return;
  }

  const stageId = TIER_STAGE_ID[payload.tier];
  if (!stageId) {
    console.warn(`[GHL] No stage ID for tier "${payload.tier}" — skipping opportunity`);
    return;
  }

  const oppRes = await ghlFetch(`${GHL_V1_BASE}/opportunities/`, {
    method:  'POST',
    headers,
    body:    JSON.stringify({
      pipelineId,
      locationId,
      name:            `${payload.name} — Jesse Quiz (${payload.readiness_score}/100)`,
      contactId,
      pipelineStageId: stageId,
      monetaryValue:   0,
      status:          'open',
    }),
  });

  if (!oppRes.ok) {
    const errText = await oppRes.text();
    console.warn(`[GHL] Opportunity create failed ${oppRes.status}: ${errText}`);
    return;
  }

  const oppData = await oppRes.json() as { opportunity?: { id?: string } };
  console.log(`[GHL] Opportunity created — id: ${oppData?.opportunity?.id ?? 'unknown'}`);
}
