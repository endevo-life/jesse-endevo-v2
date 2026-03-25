import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import type { DomainSession } from '../types/index';

// ── Table schema ───────────────────────────────────────────────────────────────
// Table:  jesse-users
// PK:     userId     (Firebase UID — String)
// SK:     sk         (String — prefix pattern)
//
// SK values:
//   PROFILE                  — user profile row
//   SESSION#<ISO timestamp>  — completed assessment session
//   ASSESSMENT_PROGRESS      — in-progress assessment state across domains
//   CHAT#<ISO timestamp>     — chat message (future)
// ─────────────────────────────────────────────────────────────────────────────

const TABLE  = process.env.DYNAMO_TABLE || 'jesse-users';
const REGION = process.env.AWS_REGION   || 'us-east-2';

let _client: DynamoDBDocumentClient | null = null;

function getClient(): DynamoDBDocumentClient | null {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) return null;
  if (!_client) {
    const raw = new DynamoDBClient({
      region: REGION,
      credentials: {
        accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    _client = DynamoDBDocumentClient.from(raw, {
      marshallOptions: { removeUndefinedValues: true },
    });
  }
  return _client;
}

export const isDynamoEnabled = (): boolean =>
  !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

// ── User profile (PROFILE row) ────────────────────────────────────────────────
export async function upsertUserMeta(meta: {
  userId:      string;
  email:       string;
  displayName: string;
  photoURL?:   string | null;
}): Promise<void> {
  const client = getClient();
  if (!client) return;
  const now = new Date().toISOString();
  await client.send(new UpdateCommand({
    TableName:                 TABLE,
    Key:                       { userId: meta.userId, sk: 'PROFILE' },
    UpdateExpression:          'SET #name = :name, email = :email, photoURL = :photo, lastSeen = :now, createdAt = if_not_exists(createdAt, :now)',
    ExpressionAttributeNames:  { '#name': 'name' },
    ExpressionAttributeValues: {
      ':name':  meta.displayName,
      ':email': meta.email,
      ':photo': meta.photoURL ?? null,
      ':now':   now,
    },
  }));
  console.log(`[dynamo] upserted PROFILE  userId=${meta.userId}`);
}

// ── Save completed domain session (SESSION#<ISO> row) ─────────────────────────
export async function saveSession(session: DomainSession): Promise<void> {
  const client = getClient();
  if (!client) {
    console.warn('[dynamo] skipped — AWS credentials not configured');
    return;
  }
  const sk  = `SESSION#${session.completedAt}`;
  await client.send(new PutCommand({
    TableName: TABLE,
    Item: {
      userId:     session.userId,
      sk,
      sessionId:  session.sessionId,
      domainKey:  session.domainKey,
      email:      session.email,
      name:       session.displayName,
      domains:    [session.domainKey],
      domain_scores: { [session.domainKey]: session.pctScore },
      readiness_score: session.pctScore,
      tier:           session.tier,
      critical_gaps:  session.criticalGaps,
      aiPlan:         session.aiPlan,
      answers:        session.answers,
      lowest_domain:  session.domainKey,
      completedAt:    session.completedAt,
      updatedAt:      new Date().toISOString(),
    },
  }));
  console.log(`[dynamo] saved SESSION#  userId=${session.userId}  domain=${session.domainKey}  score=${session.pctScore}%`);
}

// ── Fetch all completed sessions for a user ───────────────────────────────────
export async function getUserSessions(userId: string): Promise<DomainSession[]> {
  const client = getClient();
  if (!client) return [];
  const result = await client.send(new QueryCommand({
    TableName:                 TABLE,
    KeyConditionExpression:    'userId = :uid AND begins_with(sk, :prefix)',
    ExpressionAttributeValues: { ':uid': userId, ':prefix': 'SESSION#' },
  }));
  // Return only the latest session per domain (last completed wins)
  const byDomain = new Map<string, DomainSession>();
  for (const item of (result.Items ?? []) as DomainSession[]) {
    const existing = byDomain.get(item.domainKey);
    if (!existing || item.completedAt > existing.completedAt) {
      byDomain.set(item.domainKey, item);
    }
  }
  return Array.from(byDomain.values());
}

// ── Save in-progress assessment state (ASSESSMENT_PROGRESS row) ───────────────
export async function saveAssessmentProgress(
  userId: string,
  completedDomains: string[],
  domainScores: Record<string, number>,
  allAnswers:   Record<string, unknown>,
  overallScore?: number,
  tier?:         string,
  status:        'in_progress' | 'completed' = 'in_progress',
): Promise<void> {
  const client = getClient();
  if (!client) return;
  await client.send(new PutCommand({
    TableName: TABLE,
    Item: {
      userId,
      sk:               'ASSESSMENT_PROGRESS',
      completedDomains,
      domainScores,
      allAnswers,
      overallScore:     overallScore ?? null,
      tier:             tier ?? null,
      status,
      updatedAt:        new Date().toISOString(),
    },
  }));
  console.log(`[dynamo] saved ASSESSMENT_PROGRESS  userId=${userId}  domains=[${completedDomains.join(',')}]  status=${status}`);
}

// ── Get in-progress assessment state ─────────────────────────────────────────
export async function getAssessmentProgress(userId: string): Promise<Record<string, unknown> | null> {
  const client = getClient();
  if (!client) return null;
  const result = await client.send(new GetCommand({
    TableName: TABLE,
    Key:       { userId, sk: 'ASSESSMENT_PROGRESS' },
  }));
  return result.Item ?? null;
}

// ── Delete a specific domain session ─────────────────────────────────────────
export async function deleteSession(userId: string, sk: string): Promise<void> {
  const client = getClient();
  if (!client) return;
  await client.send(new DeleteCommand({ TableName: TABLE, Key: { userId, sk } }));
  console.log(`[dynamo] deleted  userId=${userId}  sk=${sk}`);
}

// ── Delete all sessions for a user (full reset) ───────────────────────────────
export async function deleteAllUserSessions(userId: string): Promise<void> {
  const client = getClient();
  if (!client) return;

  // Query all SESSION# rows first
  const result = await client.send(new QueryCommand({
    TableName:                 TABLE,
    KeyConditionExpression:    'userId = :uid AND begins_with(sk, :prefix)',
    ExpressionAttributeValues: { ':uid': userId, ':prefix': 'SESSION#' },
    ProjectionExpression:      'sk',
  })).catch(() => ({ Items: [] }));

  const sks = [
    ...((result.Items ?? []).map((i: Record<string, unknown>) => i['sk'] as string)),
    'ASSESSMENT_PROGRESS',
  ];

  await Promise.all(
    sks.map(sk =>
      client.send(new DeleteCommand({ TableName: TABLE, Key: { userId, sk } }))
        .catch(() => {})
    )
  );
  console.log(`[dynamo] reset all  userId=${userId}`);
}
