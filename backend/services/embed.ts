import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';

const REGION = process.env.AWS_REGION || 'us-east-1';

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
    const embedModel = process.env.BEDROCK_EMBED_MODEL || 'amazon.titan-embed-text-v2:0';
    const body = JSON.stringify({
      inputText: text.slice(0, 8192),
    });
    const response = await client.send(new InvokeModelCommand({
      modelId:     embedModel,
      body:        Buffer.from(body),
      contentType: 'application/json',
      accept:      'application/json',
    }));

    const result = JSON.parse(Buffer.from(response.body).toString()) as {
      embedding: number[];
    };
    console.log(`[embed] model=${embedModel} dims=${result.embedding.length}`);
    return result.embedding;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[embed] failed: ${msg}`);
    return null;
  }
}
