import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';

const REGION      = process.env.AWS_REGION        || 'us-east-1';
const EMBED_MODEL = process.env.BEDROCK_EMBED_MODEL || 'amazon.titan-embed-text-v1'; // 1536 dims

let _client: BedrockRuntimeClient | null = null;

function getClient(): BedrockRuntimeClient | null {
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

export const isEmbedEnabled = (): boolean =>
  !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

/**
 * Embed text using Amazon Titan Embed via Bedrock.
 * Returns a 1536-dimensional vector, or null if Bedrock is not configured.
 */
export async function embedText(text: string): Promise<number[] | null> {
  const client = getClient();
  if (!client) {
    console.warn('[embed] Bedrock credentials not configured — skipping');
    return null;
  }

  try {
    // Titan V2 body — dimensions + normalize are V2-only fields; V1 ignores them
    const body = JSON.stringify({
      inputText:  text.slice(0, 8192),
      dimensions: 1024,
      normalize:  true,
    });
    const response = await client.send(new InvokeModelCommand({
      modelId:     EMBED_MODEL,
      body:        Buffer.from(body),
      contentType: 'application/json',
      accept:      'application/json',
    }));

    const result = JSON.parse(Buffer.from(response.body).toString()) as {
      embedding: number[];
    };
    return result.embedding;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[embed] failed: ${msg}`);
    return null;
  }
}
