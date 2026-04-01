/**
 * ingest-folder.ts
 * ─────────────────
 * Incrementally ingests a folder of documents into Aurora pgvector.
 *
 * - Scans the target folder recursively for .pdf, .docx, .vtt, .txt files
 * - Checks knowledge_base for files already ingested (by source_file path)
 * - Skips any file that already has rows in the DB — no duplicates ever
 * - Chunks, embeds, and appends only new files
 *
 * Usage:
 *   cd backend
 *   npx ts-node scripts/ingest-folder.ts ../my-folder
 *   npx ts-node scripts/ingest-folder.ts            # defaults to ../uploads/
 */

import path   from 'path';
import fs     from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../.env') });

import pdfParse from 'pdf-parse';
import mammoth  from 'mammoth';
import { embedText }                        from '../services/embed';
import { upsertKnowledgeChunk, getIngestedFiles } from '../services/aurora';

// ── Config ────────────────────────────────────────────────────────────────────
const SUPPORTED  = ['.pdf', '.docx', '.vtt', '.txt'];
const CHUNK_SIZE = 800;
const OVERLAP    = 150;
const MIN_CHUNK  = 100;

// ── Text extraction ───────────────────────────────────────────────────────────
async function extractText(filePath: string): Promise<string | null> {
  const ext  = path.extname(filePath).toLowerCase();
  const data = fs.readFileSync(filePath);

  try {
    if (ext === '.pdf') {
      const parsed = await pdfParse(data);
      return parsed.text;
    }
    if (ext === '.docx') {
      const result = await mammoth.extractRawText({ buffer: data });
      return result.value;
    }
    if (ext === '.vtt') {
      return data.toString('utf-8')
        .split('\n')
        .filter(line => {
          const t = line.trim();
          if (!t || t === 'WEBVTT') return false;
          if (/^\d{2}:\d{2}/.test(t)) return false;
          if (/^NOTE/.test(t))        return false;
          if (/^\d+$/.test(t))        return false;
          return true;
        })
        .join(' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
    }
    if (ext === '.txt') {
      return data.toString('utf-8');
    }
  } catch (err) {
    console.warn(`[ingest] extract error (${path.basename(filePath)}): ${
      err instanceof Error ? err.message : err
    }`);
  }
  return null;
}

// ── Chunking ──────────────────────────────────────────────────────────────────
function chunkText(text: string): string[] {
  const clean = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
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

// ── Recursive file scanner ────────────────────────────────────────────────────
function scanFolder(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...scanFolder(full));
    } else if (SUPPORTED.includes(path.extname(entry.name).toLowerCase())) {
      results.push(full);
    }
  }
  return results;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const folderArg  = process.argv[2];
  const targetDir  = folderArg
    ? path.resolve(folderArg)
    : path.resolve(__dirname, '../../uploads');

  console.log('══════════════════════════════════════════════');
  console.log(' Jesse Knowledge Base — Incremental Ingestion');
  console.log('══════════════════════════════════════════════');
  console.log(`[ingest] Folder : ${targetDir}`);

  if (!fs.existsSync(targetDir)) {
    console.error(`[ingest] Folder not found: ${targetDir}`);
    process.exit(1);
  }

  // 1. Scan folder
  const allFiles = scanFolder(targetDir);
  console.log(`[ingest] Found  : ${allFiles.length} supported file(s)\n`);

  if (allFiles.length === 0) {
    console.log('[ingest] Nothing to do.');
    process.exit(0);
  }

  // 2. Fetch already-ingested source_file keys from Aurora
  console.log('[ingest] Checking knowledge_base for previously ingested files...');
  const ingested = await getIngestedFiles();
  console.log(`[ingest] Already in DB: ${ingested.size} unique file(s)\n`);

  let skippedFiles  = 0;
  let newFiles      = 0;
  let totalChunks   = 0;
  let skippedChunks = 0;

  for (const filePath of allFiles) {
    // Use a consistent key: relative path from the target folder
    const sourceKey = path.relative(targetDir, filePath);

    if (ingested.has(sourceKey)) {
      console.log(`[ingest] SKIP (already in DB)  ${sourceKey}`);
      skippedFiles++;
      continue;
    }

    process.stdout.write(`[ingest] NEW  ${sourceKey} `);

    // 3. Extract text
    const text = await extractText(filePath);
    if (!text || text.trim().length < MIN_CHUNK) {
      console.log('→ SKIP (empty/unreadable)');
      skippedChunks++;
      continue;
    }

    // 4. Chunk
    const chunks = chunkText(text);
    process.stdout.write(`→ ${chunks.length} chunks `);

    // 5. Embed + insert each chunk
    let fileEmbedded = 0;
    for (let i = 0; i < chunks.length; i++) {
      try {
        const embedding = await embedText(chunks[i]);
        if (!embedding) {
          console.warn(`\n[ingest]   chunk ${i}: embedText returned null — check AWS creds/region`);
          skippedChunks++;
          continue;
        }
        await upsertKnowledgeChunk(
          chunks[i],
          sourceKey,
          i,
          embedding,
          { folder: path.dirname(sourceKey) },
        );
        fileEmbedded++;
        totalChunks++;
      } catch (err) {
        console.warn(`\n[ingest]   chunk ${i} error: ${err instanceof Error ? err.message : err}`);
        skippedChunks++;
      }
    }

    console.log(`→ ${fileEmbedded}/${chunks.length} embedded ✓`);
    newFiles++;
  }

  console.log();
  console.log('══════════════════════════════════════════════');
  console.log(' DONE');
  console.log(`   new files ingested  : ${newFiles}`);
  console.log(`   files skipped (dup) : ${skippedFiles}`);
  console.log(`   chunks embedded     : ${totalChunks}`);
  console.log(`   chunks skipped      : ${skippedChunks}`);
  console.log('══════════════════════════════════════════════');
  process.exit(0);
}

main().catch(err => {
  console.error('[ingest] Fatal:', err);
  process.exit(1);
});
