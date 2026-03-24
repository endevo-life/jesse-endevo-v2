import path from 'path';
import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

import { score }          from './services/scoring';
import { generatePlan }   from './services/ai';
import { generatePDF }    from './services/pdf';
import { sendPlanEmail }  from './services/email';
import { pushToGoHighLevel } from './services/ghl';
import {
  asyncHandler,
  errorHandler,
  notFoundHandler,
  ValidationError,
} from './middleware/errorHandler';
import type { Answer, AssessmentPayload, DomainKey } from './types/index';

dotenv.config({ path: path.join(__dirname, '.env') });

const ENV_CHECK = [
  `NODE_ENV=${process.env.NODE_ENV || 'production'}`,
  `VERCEL=${process.env.VERCEL ? 'yes' : 'no'}`,
  `RESEND=${process.env.RESEND_API_KEY ? '✓' : '✗ MISSING'}`,
  `ANTHROPIC=${process.env.ANTHROPIC_API_KEY ? '✓' : '✗ MISSING'}`,
  `GHL_KEY=${process.env.GHL_API_KEY ? '✓' : '✗ MISSING'}`,
  `GHL_LOC=${process.env.GHL_LOCATION_ID || '✗ MISSING'}`,
  `AI_MODEL=${process.env.AI_MODEL || 'default(haiku)'}`,
  `AI_TIMEOUT=${process.env.AI_TIMEOUT_MS || 'default(25000)'}ms`,
];
console.log('[boot] Jesse backend starting —', ENV_CHECK.join(' | '));

const app  = express();
const PORT = process.env.PORT ?? 5000;

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:3000',
  'https://jesse-endevo-mvp.vercel.app',
  'https://*.vercel.app',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ...(process.env.FRONTEND_URLS ? process.env.FRONTEND_URLS.split(',').map(s => s.trim()) : []),
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // curl / Postman
    if (allowedOrigins.some(o => o.includes('*')
      ? new RegExp('^' + o.replace('*', '.*') + '$').test(origin)
      : o === origin
    )) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Request logging ───────────────────────────────────────────────────────────
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const safe = req.body && Object.keys(req.body).length > 0 ? { ...req.body } : null;
  if (safe?.email) safe.email = safe.email.replace(/(?<=.).(?=.*@)/g, '*');
  if (safe?.answers) safe.answers = `[${(safe.answers as unknown[]).length} answers]`;
  console.log(`[req] ${req.method} ${req.path}${safe ? ' body=' + JSON.stringify(safe) : ''}`);
  res.on('finish', () => {
    console.log(`[res] ${req.method} ${req.path} → ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

// ── POST /api/assess ──────────────────────────────────────────────────────────
// Body: { name: string, email: string, answers: [{q: number, answer: 'A'|'B'|'C'|'D'}] }
app.post('/api/assess', asyncHandler(async (req: Request, res: Response) => {
  const { name, email, answers, userId, domains } = req.body as {
    name?:    unknown;
    email?:   unknown;
    answers?: unknown;
    userId?:  string;
    domains?: unknown;
  };

  // ── Input validation ───────────────────────────────────────────────────────
  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new ValidationError('name is required');
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError('A valid email address is required');
  }
  if (!Array.isArray(answers) || answers.length < 1 || answers.length > 70) {
    throw new ValidationError('answers must be an array of 1–70 items');
  }
  const validDomainKeys = ['legal', 'financial', 'physical', 'digital'];
  for (const item of answers as Record<string, unknown>[]) {
    if (!item.q || !['A', 'B', 'C', 'D'].includes(item.answer as string)) {
      throw new ValidationError('Each answer must have q (number) and answer (A/B/C/D)');
    }
    if (!item.domain || !validDomainKeys.includes(item.domain as string)) {
      throw new ValidationError('Each answer must include a valid domain key');
    }
  }

  // Extract completed domains (preserve order from request; deduplicate)
  const completedDomains: DomainKey[] = [];
  if (Array.isArray(domains)) {
    for (const d of domains as string[]) {
      if (validDomainKeys.includes(d) && !completedDomains.includes(d as DomainKey)) {
        completedDomains.push(d as DomainKey);
      }
    }
  }
  // Fallback: infer from answers if domains array not provided
  if (completedDomains.length === 0) {
    for (const item of answers as Record<string, unknown>[]) {
      const dk = item.domain as DomainKey;
      if (!completedDomains.includes(dk)) completedDomains.push(dk);
    }
  }

  const cleanName = (name as string).trim();

  // ── Step 1: Score ──────────────────────────────────────────────────────
  const pipelineStart = Date.now();
  console.log(`\n${'─'.repeat(56)}`);
  console.log(`[assess] ▶ START  name="${cleanName}"  answers=${(answers as Answer[]).length}`);

  // ── Step 1: Score ──────────────────────────────────────────────────────
  const t1 = Date.now();
  const scored = score(answers as Answer[], completedDomains);
  console.log(`[assess] 1/5 SCORE  ${scored.readiness_score}/100  tier="${scored.tier}"  gaps=${scored.critical_gaps.length}  weakest=${scored.lowest_domain}  domains=[${completedDomains.join(',')}]  (${Date.now()-t1}ms)`);

  if (userId) console.log(`[assess] userId=${userId} domains=[${completedDomains.join(',')}]`);

  const payload: AssessmentPayload = {
    name:              cleanName,
    email:             email as string,
    readiness_score:   scored.readiness_score,
    tier:              scored.tier,
    domain_scores:     scored.domain_scores,
    critical_gaps:     scored.critical_gaps,
    jesse_signals:     scored.jesse_signals,
    lowest_domain:     scored.lowest_domain,
    completed_domains: scored.completed_domains,
  };

  // ── Step 2: Generate AI plan (silent fallback on failure) ──────────────
  const t2 = Date.now();
  const { plan, source } = await generatePlan(payload);
  console.log(`[assess] 2/5 AI     source=${source}  chars=${plan.length}  (${Date.now()-t2}ms)`);

  // ── Step 3: Generate branded PDF ──────────────────────────────────────
  const t3 = Date.now();
  const pdfBuffer = await generatePDF({
    name:            cleanName,
    readiness_score: payload.readiness_score,
    tier:            payload.tier,
    domain_scores:   payload.domain_scores,
    plan,
  });
  console.log(`[assess] 3/5 PDF    size=${Math.round(pdfBuffer.length/1024)}KB  (${Date.now()-t3}ms)`);

  // ── Step 4: Send email via Resend with PDF attached ────────────────────
  const t4 = Date.now();
  const emailResult = await sendPlanEmail({
    name:      cleanName,
    email:     email as string,
    score:     payload.readiness_score,
    tier:      payload.tier,
    pdfBuffer,
  });
  const emailStatus = 'skipped' in emailResult ? 'SKIPPED(no key)' : `sent id=${(emailResult as {id?:string}).id ?? 'unknown'}`;
  console.log(`[assess] 4/5 EMAIL  ${emailStatus}  (${Date.now()-t4}ms)`);

  // ── Step 5: Push lead to GoHighLevel CRM (non-blocking) ───────────────
  const t5 = Date.now();
  pushToGoHighLevel(payload)
    .then(() => console.log(`[assess] 5/5 GHL    pushed contact  (${Date.now()-t5}ms)`))
    .catch((err: unknown) => {
      const msg   = err instanceof Error ? err.message : String(err);
      const cause = err instanceof Error && (err as NodeJS.ErrnoException & { cause?: unknown }).cause;
      console.warn(`[assess] 5/5 GHL    FAILED: ${msg}${cause ? ` | cause: ${cause}` : ''}`);
    });

  // ── Done: 200 → frontend shows confirmation screen ────────────────────
  console.log(`[assess] ✓ DONE   total=${Date.now()-pipelineStart}ms`);
  console.log(`${'─'.repeat(56)}\n`);
  res.status(200).json({ success: true, message: 'Plan sent successfully' });
}));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status:      'ok',
    service:     'Jesse by ENDevo',
    timestamp:   new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    vercel:      !!process.env.VERCEL,
    resend:      !!process.env.RESEND_API_KEY,
    anthropic:   !!process.env.ANTHROPIC_API_KEY,
    ghl:         !!process.env.GHL_API_KEY,
  });
});

// ── Silence browser noise — favicon and root hits on the API domain ────────────
app.get('/favicon.ico', (_req, res) => res.status(204).end());
app.get('/favicon.png', (_req, res) => res.status(204).end());
app.get('/', (_req: Request, res: Response) => {
  res.json({ service: 'Jesse by ENDevo API', status: 'ok', health: '/api/health' });
});

// ── 404 — must come BEFORE the error handler ─────────────────────────────────
app.use(notFoundHandler);

// ── Global error handler — must be LAST ──────────────────────────────────────
app.use(errorHandler);

// ── Start (local dev) / Export (Vercel serverless) ───────────────────────────
// Always export for Vercel — the listen() call is skipped when VERCEL is set
module.exports = app;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log('─────────────────────────────────────────');
    console.log(`🚀 Jesse Backend running on http://localhost:${PORT}`);
    console.log(`📋 Assess:  POST http://localhost:${PORT}/api/assess`);
    console.log(`🔍 Health:  GET  http://localhost:${PORT}/api/health`);
    console.log(`⚙️  Env:     ${process.env.NODE_ENV || 'development'}`);
    console.log('─────────────────────────────────────────');
  });
}
