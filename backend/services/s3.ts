import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const REGION     = process.env.AWS_REGION      || 'us-east-1';
const PDF_BUCKET = process.env.S3_PDF_BUCKET   || 'jesse-endevo-pdfs';

let _client: S3Client | null = null;

function getClient(): S3Client | null {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) return null;
  if (!_client) {
    _client = new S3Client({
      region: REGION,
      credentials: {
        accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return _client;
}

export const isS3Enabled = (): boolean =>
  !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

// Upload a PDF buffer and return the S3 key
export async function uploadPDF(userId: string, sessionId: string, pdfBuffer: Buffer): Promise<string | null> {
  const client = getClient();
  if (!client) {
    console.warn('[s3] skipped — AWS credentials not configured');
    return null;
  }
  const key = `${userId}/${sessionId}.pdf`;
  await client.send(new PutObjectCommand({
    Bucket:      PDF_BUCKET,
    Key:         key,
    Body:        pdfBuffer,
    ContentType: 'application/pdf',
    Metadata: { userId, sessionId },
  }));
  console.log(`[s3] uploaded  key=${key}  size=${Math.round(pdfBuffer.length / 1024)}KB`);
  return key;
}

// Generate a presigned URL valid for 1 hour — safe to share, works in browser
export async function getPresignedUrl(s3Key: string, expiresIn = 3600): Promise<string | null> {
  const client = getClient();
  if (!client) return null;
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: PDF_BUCKET, Key: s3Key }),
    { expiresIn }
  );
}

// Delete a stored PDF (e.g. user resets their data)
export async function deletePDF(s3Key: string): Promise<void> {
  const client = getClient();
  if (!client) return;
  await client.send(new DeleteObjectCommand({ Bucket: PDF_BUCKET, Key: s3Key }));
  console.log(`[s3] deleted  key=${s3Key}`);
}
