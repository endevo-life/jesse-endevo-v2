import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';

import { embedText }                                        from './embed';
import { searchKnowledge, saveChatMessage, getChatHistory,
         isAuroraEnabled, ChatMessage }                     from './aurora';
import { getUserSessions, saveChatMessageDynamo }           from './dynamo';

// ── Bedrock client for Claude Haiku ──────────────────────────────────────────
const REGION     = process.env.AWS_REGION          || 'us-east-1';
const CHAT_MODEL = process.env.BEDROCK_CHAT_MODEL  || 'anthropic.claude-3-haiku-20240307-v1:0';

let _client: BedrockRuntimeClient | null = null;

function getBedrockClient(): BedrockRuntimeClient | null {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) return null;
  if (!_client) {
    _client = new BedrockRuntimeClient({
      region: REGION,
      credentials: {
        accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return _client;
}

// ── Public API ────────────────────────────────────────────────────────────────
export interface ChatResponse {
  reply:   string;
  history: ChatMessage[];
}

/**
 * Main chat handler:
 *  1. Saves user message to Aurora chat_history
 *  2. Retrieves RAG context from Aurora knowledge_base (pgvector)
 *  3. Loads user assessment data from DynamoDB
 *  4. Builds context-enriched prompt
 *  5. Calls Claude Haiku via Bedrock (falls back to Anthropic SDK)
 *  6. Saves assistant reply to Aurora chat_history
 *  7. Returns reply + full history
 */
export async function processChat(
  userId:  string,
  message: string,
): Promise<ChatResponse> {
  // 1. Persist user message (Aurora primary + DynamoDB for schema compliance)
  await saveChatMessage(userId, 'user', message);
  saveChatMessageDynamo(userId, 'user', message).catch(() => {});

  // 2. Assessment context from DynamoDB
  const sessions = await getUserSessions(userId).catch(() => []);
  const assessmentContext = sessions.length > 0
    ? sessions.map(s =>
        `${s.domainKey.toUpperCase()}: ${s.pctScore}% (${s.tier})\nGaps: ${
          (s.criticalGaps ?? []).join(', ') || 'none'
        }`,
      ).join('\n\n')
    : '';

  // 3. RAG context from Aurora knowledge_base
  let knowledgeContext = '';
  if (isAuroraEnabled()) {
    try {
      const embedding = await embedText(message);
      if (embedding) {
        const chunks = await searchKnowledge(embedding, 5);
        if (chunks.length > 0) {
          knowledgeContext = chunks.map(c => c.content).join('\n\n---\n\n');
          console.log(`[chat] RAG: ${chunks.length} chunks retrieved`);
        }
      }
    } catch (err) {
      console.warn('[chat] RAG retrieval failed:', err instanceof Error ? err.message : err);
    }
  }

  // 4. Recent chat history (last 10 messages — enforced by storage layer)
  const history = await getChatHistory(userId);

  // 5. Build Claude messages (history + new user message)
  const completedDomains = sessions.map(s => s.domainKey);
  const systemPrompt = buildSystemPrompt(assessmentContext, knowledgeContext, completedDomains);
  const messages: { role: 'user' | 'assistant'; content: string }[] = [
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: message },
  ];

  // 6. Call Claude Haiku
  const reply = await callClaude(systemPrompt, messages);

  // 7. Persist assistant reply (Aurora primary + DynamoDB for schema compliance)
  await saveChatMessage(userId, 'assistant', reply);
  saveChatMessageDynamo(userId, 'assistant', reply).catch(() => {});

  // 8. Return updated history (last 10 messages)
  const updatedHistory = await getChatHistory(userId);
  return { reply, history: updatedHistory };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildSystemPrompt(
  assessmentContext: string,
  knowledgeContext:  string,
  completedDomains:  string[],
): string {
  const ALL_DOMAINS = ['legal', 'financial', 'physical', 'digital'];
  const missingDomains = ALL_DOMAINS.filter(d => !completedDomains.includes(d));

  let prompt =
    'You are Jesse, an AI life readiness coach from ENDevo. ' +
    'You help users understand their life readiness across four domains: Legal, Financial, Physical, and Digital.\n\n' +

    '## CRITICAL RULES — follow these without exception:\n' +
    '1. You are STRICTLY an educational resource. You do NOT provide legal, financial, medical, or any other professional advice — ever. Not even implicitly.\n' +
    '2. On any topic that touches law, finance, health, or estate planning, you MUST include a disclaimer such as: "Disclaimer: I\'m an educational AI, not a licensed professional. Please consult a qualified [lawyer/financial advisor/doctor] for advice specific to your situation."\n' +
    '3. You may share your perspective or opinion, but you MUST clearly label it as your opinion (e.g. "In my opinion…" or "My take is…") and follow it with a reminder to seek a relevant professional.\n' +
    '4. Be warm, encouraging, and concise. Keep answers under 200 words unless the user asks for more detail.\n' +
    '5. Never claim certainty on legal, financial, or medical outcomes — these vary by jurisdiction, personal situation, and professional judgement.';

  if (knowledgeContext) {
    prompt += `\n\n--- ENDevo Knowledge Base ---\n${knowledgeContext}`;
  }

  if (assessmentContext) {
    prompt +=
      '\n\n--- User\'s Peace of Mind Assessment (POMA) Results ---\n' +
      assessmentContext + '\n' +
      'Use these results to personalise your educational guidance.';
  }

  if (missingDomains.length > 0) {
    const formatted = missingDomains.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ');
    prompt +=
      `\n\n--- Missing POMA Domains ---\n` +
      `The user has not yet completed the following domain(s) of the Peace of Mind Assessment (POMA): ${formatted}. ` +
      'Whenever relevant, softly encourage them to complete these assessments so you can give them a fuller, more personalised picture. ' +
      'Do not pressure them — just weave it in naturally.';
  }

  if (!assessmentContext && missingDomains.length === ALL_DOMAINS.length) {
    prompt +=
      '\n\nThis user has not started their Peace of Mind Assessment (POMA) yet. ' +
      'Gently encourage them to take it — it covers Legal, Financial, Physical, and Digital readiness and only takes a few minutes per domain.';
  }

  return prompt;
}

async function callClaude(
  system:   string,
  messages: { role: 'user' | 'assistant'; content: string }[],
): Promise<string> {
  // Primary: Bedrock Claude Haiku
  const client = getBedrockClient();
  if (client) {
    try {
      const body = JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 1024,
        system,
        messages,
      });
      const response = await client.send(new InvokeModelCommand({
        modelId:     CHAT_MODEL,
        body:        Buffer.from(body),
        contentType: 'application/json',
        accept:      'application/json',
      }));
      const result = JSON.parse(Buffer.from(response.body).toString()) as {
        content?: { type: string; text: string }[];
      };
      const text = result.content?.find(c => c.type === 'text')?.text;
      if (text) return text;
    } catch (err) {
      console.warn('[chat] Bedrock Claude call failed:', err instanceof Error ? err.message : err);
    }
  }

  // Fallback: Anthropic SDK (claude-haiku)
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      // Dynamic import to avoid loading Anthropic SDK when Bedrock handles it
      const { default: Anthropic } = await import('@anthropic-ai/sdk') as {
        default: typeof import('@anthropic-ai/sdk').default;
      };
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const res = await anthropic.messages.create({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system,
        messages,
      });
      if (res.content[0].type === 'text') return res.content[0].text;
    } catch (err) {
      console.warn('[chat] Anthropic SDK fallback failed:', err instanceof Error ? err.message : err);
    }
  }

  return "I'm having trouble connecting right now. Please try again shortly.";
}
