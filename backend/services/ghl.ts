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

const GHL_V2_BASE = 'https://services.leadconnectorhq.com';
const GHL_V1_BASE = 'https://rest.gohighlevel.com/v1';

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
    'Version':       '2021-07-28',
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

  // ── Custom fields (v2 format — field_value, not value) ───────────────────
  const customFields: { id: string; field_value: string | number }[] = [];

  if (process.env.GHL_FIELD_SCORE)
    customFields.push({ id: process.env.GHL_FIELD_SCORE,         field_value: payload.readiness_score });

  if (process.env.GHL_FIELD_TIER)
    customFields.push({ id: process.env.GHL_FIELD_TIER,          field_value: payload.tier });

  if (process.env.GHL_FIELD_GAPS)
    customFields.push({ id: process.env.GHL_FIELD_GAPS,          field_value: payload.critical_gaps.join(', ') });

  if (process.env.GHL_FIELD_LOWEST_DOMAIN)
    customFields.push({ id: process.env.GHL_FIELD_LOWEST_DOMAIN, field_value: DOMAIN_LABELS[payload.lowest_domain] ?? payload.lowest_domain });

  if (process.env.GHL_FIELD_SIGNALS)
    customFields.push({ id: process.env.GHL_FIELD_SIGNALS,       field_value: payload.jesse_signals.join(' | ') });

  // ──────────────────────────────────────────────────────────────────────────
  // SINGLE UPSERT CALL — v2 endpoint
  // Creates contact if email not found, updates ALL fields if email exists.
  // No separate PUT. No duplicate contacts.
  // ──────────────────────────────────────────────────────────────────────────
  console.log(`[GHL] Upserting contact for ${payload.email} (score: ${payload.readiness_score}, tier: ${payload.tier})`);

  const upsertBody: Record<string, unknown> = {
    firstName,
    ...(lastName ? { lastName } : {}),
    email:      payload.email,
    locationId,
    tags,
    source:     'Jesse Quiz — ENDevo',
  };

  if (customFields.length > 0) upsertBody.customFields = customFields;

  const upsertRes = await fetch(`${GHL_V2_BASE}/contacts/upsert`, {
    method:  'POST',
    headers,
    body:    JSON.stringify(upsertBody),
  });

  // ── Fallback to v1 POST+PUT if v2 upsert is rejected ─────────────────────
  if (!upsertRes.ok) {
    const errText = await upsertRes.text();
    console.warn(`[GHL] v2 upsert returned ${upsertRes.status}: ${errText} — falling back to v1`);
    await v1FallbackUpsert({
      headers,
      firstName,
      lastName,
      payload,
      tags,
      locationId,
      customFieldsV1: customFields.map(f => ({ id: f.id, value: String(f.field_value) })),
    });
    return;
  }

  const upsertData = await upsertRes.json() as {
    contact?: { id?: string };
    new?:     boolean;
  };

  const contactId = upsertData?.contact?.id;
  const isNew     = upsertData?.new ?? false;

  console.log(`[GHL] Contact ${isNew ? 'CREATED' : 'UPDATED'} — id: ${contactId}, tier: ${payload.tier}`);

  // ── Opportunity (only when pipeline is configured) ────────────────────────
  if (!pipelineId || !contactId) {
    console.log('[GHL] Skipping opportunity — GHL_PIPELINE_ID not set');
    return;
  }

  const stageId = TIER_STAGE_ID[payload.tier];
  if (!stageId) {
    console.warn(`[GHL] No stage ID for tier "${payload.tier}" — skipping opportunity`);
    return;
  }

  console.log(`[GHL] Creating opportunity: ${payload.tier}`);

  const oppRes = await fetch(`${GHL_V1_BASE}/opportunities/`, {
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

// ── v1 fallback: POST to create/find → PUT to force-overwrite fields ─────────
async function v1FallbackUpsert(opts: {
  headers:        Record<string, string>;
  firstName:      string;
  lastName:       string;
  payload:        AssessmentPayload;
  tags:           string[];
  locationId:     string;
  customFieldsV1: { id: string; value: string }[];
}): Promise<void> {
  const { headers, firstName, lastName, payload, tags, locationId, customFieldsV1 } = opts;

  console.log('[GHL] v1 fallback — POST to create/find contact');

  const createRes = await fetch(`${GHL_V1_BASE}/contacts/`, {
    method:  'POST',
    headers,
    body:    JSON.stringify({
      firstName,
      ...(lastName ? { lastName } : {}),
      email:      payload.email,
      locationId,
      source:     'Jesse Quiz — ENDevo',
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`[GHL] v1 contact create failed ${createRes.status}: ${err}`);
  }

  const createData = await createRes.json() as { contact?: { id?: string } };
  const contactId  = createData?.contact?.id;
  if (!contactId) throw new Error('[GHL] v1: no contact ID returned');

  const updateBody: Record<string, unknown> = { firstName, tags };
  if (lastName) updateBody.lastName = lastName;
  if (customFieldsV1.length > 0) updateBody.customField = customFieldsV1;

  await fetch(`${GHL_V1_BASE}/contacts/${contactId}`, {
    method:  'PUT',
    headers,
    body:    JSON.stringify(updateBody),
  });

  console.log(`[GHL] v1 fallback complete — id: ${contactId}, tier: ${payload.tier}`);
}
