import { Pool } from 'pg';

// ── Connection ────────────────────────────────────────────────────────────────
let _pool: Pool | null = null;

function getPool(): Pool | null {
  if (
    !process.env.AURORA_HOST ||
    !process.env.AURORA_USER ||
    !process.env.AURORA_PASSWORD
  ) return null;

  if (!_pool) {
    _pool = new Pool({
      host:               process.env.AURORA_HOST,
      port:               parseInt(process.env.AURORA_PORT || '5432'),
      database:           process.env.AURORA_DB       || 'jesse_kb',
      user:               process.env.AURORA_USER,
      password:           process.env.AURORA_PASSWORD,
      ssl:                process.env.NODE_ENV === 'production'
                            ? { rejectUnauthorized: false }
                            : false,
      max:                5,
      idleTimeoutMillis:  30000,
      connectionTimeoutMillis: 5000,
    });
    _pool.on('error', (err) => {
      console.error('[aurora] pool error:', err.message);
    });
  }
  return _pool;
}

export const isAuroraEnabled = (): boolean =>
  !!(process.env.AURORA_HOST && process.env.AURORA_USER && process.env.AURORA_PASSWORD);

// ── Types ─────────────────────────────────────────────────────────────────────
export interface KnowledgeChunk {
  id:          string;
  content:     string;
  source_file: string;
  chunk_index: number;
  metadata:    Record<string, unknown>;
}

export interface ChatMessage {
  id:         string;
  user_id:    string;
  role:       'user' | 'assistant';
  content:    string;
  created_at: string;
}

// ── Knowledge base ────────────────────────────────────────────────────────────

/**
 * Insert a knowledge chunk with its embedding into Aurora.
 * Used by the ingest-pdfs script.
 */
export async function upsertKnowledgeChunk(
  content:     string,
  sourceFile:  string,
  chunkIndex:  number,
  embedding:   number[],
  metadata:    Record<string, unknown> = {},
): Promise<void> {
  const pool = getPool();
  if (!pool) throw new Error('[aurora] not configured');

  const vectorStr = `[${embedding.join(',')}]`;
  await pool.query(
    `INSERT INTO knowledge_base (content, source_file, chunk_index, embedding, metadata)
     VALUES ($1, $2, $3, $4::vector, $5)`,
    [content, sourceFile, chunkIndex, vectorStr, JSON.stringify(metadata)],
  );
}

/**
 * Find the topK most relevant knowledge chunks for a query embedding.
 * Uses pgvector cosine distance (<=>).
 */
export async function searchKnowledge(
  embedding: number[],
  topK = 5,
): Promise<KnowledgeChunk[]> {
  const pool = getPool();
  if (!pool) return [];

  try {
    const vectorStr = `[${embedding.join(',')}]`;
    const result = await pool.query<KnowledgeChunk>(
      `SELECT id, content, source_file, chunk_index, metadata
       FROM knowledge_base
       ORDER BY embedding <=> $1::vector
       LIMIT $2`,
      [vectorStr, topK],
    );
    return result.rows;
  } catch (err) {
    console.warn('[aurora] searchKnowledge failed:', err instanceof Error ? err.message : err);
    return [];
  }
}

// ── Chat history ──────────────────────────────────────────────────────────────

const MAX_CHAT_MESSAGES = 10; // sliding window per user

/**
 * Insert a chat message and prune so only the last 10 are kept.
 */
export async function saveChatMessage(
  userId:  string,
  role:    'user' | 'assistant',
  content: string,
): Promise<void> {
  const pool = getPool();
  if (!pool) return;

  try {
    await pool.query(
      'INSERT INTO chat_history (user_id, role, content) VALUES ($1, $2, $3)',
      [userId, role, content],
    );
    // Prune: keep only the most recent MAX_CHAT_MESSAGES rows for this user
    await pool.query(
      `DELETE FROM chat_history
       WHERE user_id = $1
         AND id NOT IN (
           SELECT id FROM chat_history
           WHERE user_id = $1
           ORDER BY created_at DESC
           LIMIT $2
         )`,
      [userId, MAX_CHAT_MESSAGES],
    );
  } catch (err) {
    console.warn('[aurora] saveChatMessage failed:', err instanceof Error ? err.message : err);
  }
}

/**
 * Fetch the last 10 messages for a user, oldest first.
 */
export async function getChatHistory(userId: string): Promise<ChatMessage[]> {
  const pool = getPool();
  if (!pool) return [];

  try {
    const result = await pool.query<ChatMessage>(
      `SELECT id, user_id, role, content, created_at
       FROM chat_history
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, MAX_CHAT_MESSAGES],
    );
    return result.rows.reverse(); // oldest → newest
  } catch (err) {
    console.warn('[aurora] getChatHistory failed:', err instanceof Error ? err.message : err);
    return [];
  }
}

export async function deleteChatHistory(userId: string): Promise<void> {
  const pool = getPool();
  if (!pool) return;
  await pool.query('DELETE FROM chat_history WHERE user_id = $1', [userId]);
}
