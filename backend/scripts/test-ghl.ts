/**
 * GHL API Test Script
 * Run this BEFORE going live to verify your API key works and grab your IDs.
 *
 * Usage:
 *   cd backend
 *   npx ts-node scripts/test-ghl.ts
 *
 * What this does:
 *   1. Verifies your API key is valid
 *   2. Fetches your pipelines + stage IDs (copy these into .env)
 *   3. Creates a test contact called "Jesse Test Lead"
 *   4. Reads the contact back to confirm it exists
 *   5. Deletes the test contact (clean up)
 */

import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env') });

const GHL_BASE = 'https://rest.gohighlevel.com/v1';

const API_KEY     = process.env.GHL_API_KEY;
const LOCATION_ID = process.env.GHL_LOCATION_ID;

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type':  'application/json',
  'Version':       '2021-07-28',
};

function pass(msg: string) { console.log(`  ✅ ${msg}`); }
function fail(msg: string) { console.log(`  ❌ ${msg}`); }
function info(msg: string) { console.log(`  ℹ️  ${msg}`); }
function sep()             { console.log('\n' + '─'.repeat(60)); }

// ─────────────────────────────────────────────────────────────────────────────
async function testApiKey() {
  sep();
  console.log('TEST 1 — API Key & Location');
  sep();

  if (!API_KEY)     { fail('GHL_API_KEY is not set in .env'); process.exit(1); }
  if (!LOCATION_ID) { fail('GHL_LOCATION_ID is not set in .env'); process.exit(1); }

  pass(`GHL_API_KEY found (length: ${API_KEY.length})`);
  pass(`GHL_LOCATION_ID: ${LOCATION_ID}`);
}

// ─────────────────────────────────────────────────────────────────────────────
async function testPipelines() {
  sep();
  console.log('TEST 2 — Fetch Pipelines (copy IDs into .env)');
  sep();

  const res  = await fetch(`${GHL_BASE}/pipelines/?locationId=${LOCATION_ID}`, { headers });
  const data = await res.json() as { pipelines?: { id: string; name: string; stages: { id: string; name: string }[] }[] };

  if (!res.ok) {
    fail(`HTTP ${res.status} — ${JSON.stringify(data)}`);
    return;
  }

  const pipelines = data.pipelines ?? [];
  if (pipelines.length === 0) {
    info('No pipelines found — create one in GHL > Opportunities first');
    return;
  }

  console.log(`\n  Found ${pipelines.length} pipeline(s):\n`);
  for (const p of pipelines) {
    console.log(`  Pipeline: "${p.name}"`);
    console.log(`    GHL_PIPELINE_ID=${p.id}`);
    console.log('    Stages:');
    for (const s of p.stages) {
      console.log(`      ${s.name.padEnd(25)} → GHL_STAGE_ID=${s.id}`);
    }
    console.log('');
  }

  pass('Pipelines fetched — copy the IDs above into your .env');
}

// ─────────────────────────────────────────────────────────────────────────────
async function testCreateContact(): Promise<string | null> {
  sep();
  console.log('TEST 3 — Create Test Contact');
  sep();

  const body = {
    firstName:  'Jesse',
    lastName:   'TestLead',
    email:      `test-lead-${Date.now()}@endevo-test.invalid`,
    locationId: LOCATION_ID,
    tags:       ['Jesse Tier: Getting Clarity', 'Score: 35-59', 'Jesse Quiz Completed', 'TEST — DELETE ME'],
    source:     'Jesse Quiz — ENDevo (TEST)',
  };

  info(`Creating contact: ${body.firstName} ${body.lastName} <${body.email}>`);

  const res  = await fetch(`${GHL_BASE}/contacts/`, {
    method: 'POST', headers, body: JSON.stringify(body),
  });
  const data = await res.json() as { contact?: { id?: string; email?: string; firstName?: string } };

  if (!res.ok) {
    fail(`HTTP ${res.status} — ${JSON.stringify(data)}`);
    return null;
  }

  const contactId = data.contact?.id;
  if (!contactId) { fail('No contact ID returned'); return null; }

  pass(`Contact created — id: ${contactId}`);
  pass(`Name: ${data.contact?.firstName}, Email: ${data.contact?.email}`);
  return contactId;
}

// ─────────────────────────────────────────────────────────────────────────────
async function testFetchContact(contactId: string) {
  sep();
  console.log('TEST 4 — Read Contact Back');
  sep();

  const res  = await fetch(`${GHL_BASE}/contacts/${contactId}`, { headers });
  const data = await res.json() as { contact?: { id?: string; tags?: string[] } };

  if (!res.ok) {
    fail(`HTTP ${res.status}`);
    return;
  }

  pass(`Contact readable — id: ${data.contact?.id}`);
  pass(`Tags: ${(data.contact?.tags ?? []).join(', ')}`);
}

// ─────────────────────────────────────────────────────────────────────────────
async function testDeleteContact(contactId: string) {
  sep();
  console.log('TEST 5 — Delete Test Contact (cleanup)');
  sep();

  const res = await fetch(`${GHL_BASE}/contacts/${contactId}`, {
    method: 'DELETE', headers,
  });

  if (res.ok || res.status === 200) {
    pass(`Test contact ${contactId} deleted — GHL is clean`);
  } else {
    fail(`Delete failed HTTP ${res.status} — delete manually in GHL > Contacts`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
async function testCustomFields() {
  sep();
  console.log('TEST 6 — List Existing Custom Fields');
  sep();

  const res  = await fetch(`${GHL_BASE}/custom-fields/?locationId=${LOCATION_ID}`, { headers });
  const data = await res.json() as { customFields?: { id: string; name: string; dataType: string }[] };

  if (!res.ok) {
    fail(`HTTP ${res.status} — ${JSON.stringify(data)}`);
    return;
  }

  const fields = data.customFields ?? [];
  if (fields.length === 0) {
    info('No custom fields yet — create them in GHL > Settings > Custom Fields');
    info('Then run this script again to get their IDs for your .env');
    return;
  }

  console.log(`\n  Found ${fields.length} custom field(s):\n`);
  for (const f of fields) {
    console.log(`  "${f.name.padEnd(30)}" type: ${f.dataType.padEnd(10)} → GHL_FIELD_ID=${f.id}`);
  }
  console.log('');
  pass('Copy the relevant field IDs into GHL_FIELD_* in your .env');
}

// ─────────────────────────────────────────────────────────────────────────────
(async () => {
  console.log('\n🧪 GoHighLevel API Test Suite — Jesse by ENDevo');
  console.log(`   Calling: ${GHL_BASE}`);

  try {
    await testApiKey();
    await testPipelines();
    const contactId = await testCreateContact();
    if (contactId) {
      await testFetchContact(contactId);
      await testDeleteContact(contactId);
    }
    await testCustomFields();

    sep();
    console.log('\n🎉 All tests complete!\n');
    console.log('Next steps:');
    console.log('  1. Copy pipeline + stage IDs above into backend/.env');
    console.log('  2. Create custom fields in GHL > Settings > Custom Fields');
    console.log('  3. Run this script again to get custom field IDs');
    console.log('  4. Add field IDs to GHL_FIELD_* in backend/.env');
    console.log('  5. Run quiz end-to-end — check GHL > Contacts\n');

  } catch (err) {
    sep();
    fail(`Unexpected error: ${(err as Error).message}`);
    console.log('\n  Check your GHL_API_KEY and GHL_LOCATION_ID in backend/.env\n');
    process.exit(1);
  }
})();
