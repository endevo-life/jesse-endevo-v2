/**
 * ingest-pdfs.ts
 * ──────────────
 * Ingests the ENDevo knowledge base into Aurora PostgreSQL (pgvector).
 *
 * Knowledge source — ONE zip file only:
 *   ../Aryan AI Folder-*.zip
 *
 *   Contents (191 entries):
 *     Book - Before I Ghost You/  → 37 .docx  (book chapters)
 *     Client Transcripts/         → 36 .pdf   (Otter.ai coaching session transcripts)
 *     Podcast Transcripts/        → 57 .docx  (podcast episode transcripts)
 *     Podcast blog transcripts/   → 56 .docx  (blog-style podcast transcripts)
 *     + 3 .mp4, 2 .vtt, 1 .xlsx  (skipped except .vtt)
 *
 * The "6 Week Challenge" zip contains only .mp4 videos + .png thumbnails — skipped.
 *
 * Supported formats:
 *   .pdf   → pdf-parse
 *   .docx  → mammoth (plain text extraction)
 *   .vtt   → strip WebVTT timestamps, keep spoken text
 *
 * Usage:
 *   cd backend
 *   npx ts-node scripts/ingest-pdfs.ts
 */

import path     from 'path';
import fs       from 'fs';
import dotenv   from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../.env') });

import AdmZip       from 'adm-zip';
import pdfParse     from 'pdf-parse';
import mammoth      from 'mammoth';
import { embedText }            from '../services/embed';
import { upsertKnowledgeChunk } from '../services/aurora';

// ── Config ────────────────────────────────────────────────────────────────────
const PROJECT_ROOT  = path.join(__dirname, '../../');
const TARGET_ZIP    = 'Aryan AI Folder';   // only this zip has text content
const CHUNK_SIZE    = 800;                 // characters per chunk
const OVERLAP       = 150;                 // overlap between consecutive chunks
const MIN_CHUNK     = 100;                 // skip chunks shorter than this

// ── Text extraction ───────────────────────────────────────────────────────────

async function extractPdf(data: Buffer): Promise<string> {
  const parsed = await pdfParse(data);
  return parsed.text;
}

async function extractDocx(data: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer: data });
  return result.value;
}

function extractVtt(data: Buffer): string {
  const raw = data.toString('utf-8');
  // Strip WebVTT header, cue timestamps (00:00:00.000 --> 00:00:00.000), NOTE lines
  return raw
    .split('\n')
    .filter(line => {
      const t = line.trim();
      if (!t || t === 'WEBVTT') return false;
      if (/^\d{2}:\d{2}/.test(t)) return false;      // timestamp line
      if (/^NOTE/.test(t))         return false;
      if (/^\d+$/.test(t))         return false;      // cue sequence number
      return true;
    })
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

async function extractText(entry: AdmZip.IZipEntry): Promise<string | null> {
  const name = entry.entryName.toLowerCase();
  const data  = entry.getData();

  try {
    if (name.endsWith('.pdf'))  return await extractPdf(data);
    if (name.endsWith('.docx')) return await extractDocx(data);
    if (name.endsWith('.vtt'))  return extractVtt(data);
  } catch (err) {
    console.warn(`\n[ingest]   extract error (${entry.entryName}): ${
      err instanceof Error ? err.message : err
    }`);
  }
  return null;
}

// ── Chunking ──────────────────────────────────────────────────────────────────
function chunkText(text: string): string[] {
  const clean = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')   // collapse excessive blank lines
    .replace(/[ \t]{2,}/g, ' ')   // collapse horizontal whitespace
    .trim();

  const chunks: string[] = [];
  let start = 0;

  while (start < clean.length) {
    const end   = Math.min(start + CHUNK_SIZE, clean.length);
    const chunk = clean.slice(start, end).trim();
    if (chunk.length >= MIN_CHUNK) chunks.push(chunk);
    if (end >= clean.length) break;
    start = end - OVERLAP;
  }

  return chunks;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('══════════════════════════════════════════════');
  console.log(' Jesse Knowledge Base — PDF Ingestion Pipeline');
  console.log('══════════════════════════════════════════════');

  // Find the target zip
  const allZips = fs.readdirSync(PROJECT_ROOT).filter(f => f.endsWith('.zip'));
  const zipFile = allZips.find(f => f.startsWith(TARGET_ZIP));

  if (!zipFile) {
    console.error(`[ingest] Could not find "${TARGET_ZIP}*.zip" at: ${PROJECT_ROOT}`);
    console.error(`[ingest] Available zips: ${allZips.join(', ') || 'none'}`);
    process.exit(1);
  }

  console.log(`[ingest] Source: ${zipFile}`);
  const zip = new AdmZip(path.join(PROJECT_ROOT, zipFile));

  // Filter to text-extractable entries only
  const SUPPORTED = ['.pdf', '.docx', '.vtt'];
  const entries = zip.getEntries().filter(e =>
    !e.isDirectory &&
    SUPPORTED.some(ext => e.entryName.toLowerCase().endsWith(ext)),
  );

  // Log breakdown by subfolder
  const folderCounts: Record<string, number> = {};
  for (const e of entries) {
    const folder = e.entryName.split('/')[1] || 'root';
    folderCounts[folder] = (folderCounts[folder] ?? 0) + 1;
  }
  console.log(`[ingest] ${entries.length} text files to process:`);
  for (const [folder, count] of Object.entries(folderCounts)) {
    console.log(`         ${folder}: ${count}`);
  }
  console.log();

  let totalFiles    = 0;
  let totalChunks   = 0;
  let totalEmbedded = 0;
  let totalSkipped  = 0;

  for (const entry of entries) {
    const shortName = entry.entryName.replace('Aryan AI Folder/', '');
    process.stdout.write(`[ingest] ${shortName} `);

    // 1. Extract text
    const text = await extractText(entry);
    if (!text || text.trim().length < MIN_CHUNK) {
      console.log(`→ SKIP (empty/unreadable)`);
      totalSkipped++;
      continue;
    }

    // 2. Chunk
    const chunks = chunkText(text);
    process.stdout.write(`→ ${chunks.length} chunks `);

    // 3. Embed + upsert each chunk
    let fileEmbedded = 0;
    for (let i = 0; i < chunks.length; i++) {
      try {
        const embedding = await embedText(chunks[i]);
        if (!embedding) {
          console.warn(`\n[ingest]   chunk ${i}: embedText returned null — check AWS creds`);
          totalSkipped++;
          continue;
        }
        await upsertKnowledgeChunk(
          chunks[i],
          entry.entryName,
          i,
          embedding,
          {
            zip:    zipFile,
            folder: shortName.split('/')[0],
          },
        );
        fileEmbedded++;
        totalEmbedded++;
        totalChunks++;
      } catch (err) {
        console.warn(`\n[ingest]   chunk ${i} error: ${err instanceof Error ? err.message : err}`);
        totalSkipped++;
      }
    }

    console.log(`→ ${fileEmbedded}/${chunks.length} embedded ✓`);
    totalFiles++;
  }

  console.log();
  console.log('══════════════════════════════════════════════');
  console.log(` DONE`);
  console.log(`   files processed : ${totalFiles}`);
  console.log(`   chunks embedded : ${totalEmbedded}`);
  console.log(`   chunks skipped  : ${totalSkipped}`);
  console.log('══════════════════════════════════════════════');
  process.exit(0);
}

main().catch(err => {
  console.error('[ingest] Fatal:', err);
  process.exit(1);
});
