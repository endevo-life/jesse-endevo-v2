import {
  BedrockAgentRuntimeClient,
  RetrieveCommand,
} from '@aws-sdk/client-bedrock-agent-runtime';

const REGION = process.env.AWS_REGION                  || 'us-east-1';
const KB_ID  = process.env.BEDROCK_KNOWLEDGE_BASE_ID   || '';

let _client: BedrockAgentRuntimeClient | null = null;

function getClient(): BedrockAgentRuntimeClient | null {
  if (!KB_ID || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) return null;
  if (!_client) {
    _client = new BedrockAgentRuntimeClient({
      region: REGION,
      credentials: {
        accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return _client;
}

export const isBedrockEnabled = (): boolean =>
  !!(KB_ID && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

/**
 * Query the Bedrock Knowledge Base and return the most relevant text chunks.
 * These are injected into the Claude prompt as RAG context.
 *
 * @param query   Natural-language query describing what to retrieve
 * @param topK    Number of chunks to retrieve (default 5)
 * @returns       Concatenated chunk text, or empty string if KB not configured
 */
export async function retrieveKnowledge(query: string, topK = 5): Promise<string> {
  const client = getClient();
  if (!client) {
    console.warn('[bedrock] KB not configured — skipping retrieval');
    return '';
  }

  try {
    const t0     = Date.now();
    const result = await client.send(new RetrieveCommand({
      knowledgeBaseId: KB_ID,
      retrievalQuery:  { text: query },
      retrievalConfiguration: {
        vectorSearchConfiguration: { numberOfResults: topK },
      },
    }));

    const chunks = (result.retrievalResults ?? [])
      .map(r => r.content?.text ?? '')
      .filter(Boolean);

    const combined = chunks.join('\n\n---\n\n');
    console.log(`[bedrock] retrieved ${chunks.length} chunks  (${Date.now() - t0}ms)`);
    return combined;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[bedrock] retrieval failed: ${msg}`);
    return ''; // graceful fallback — Claude will still generate a plan without KB context
  }
}

/**
 * Build a RAG-enhanced query string from a user's assessment payload.
 * Used to retrieve domain-specific knowledge from the KB.
 */
export function buildKBQuery(domainKey: string, criticalGaps: string[], pctScore: number): string {
  const gaps = criticalGaps.slice(0, 3).join('; ');
  return `${domainKey} readiness planning. User score: ${pctScore}%. Key gaps: ${gaps || 'general readiness improvement'}.`;
}
