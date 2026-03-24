// ── Answer / Assessment ───────────────────────────────────────────────────────

export type AnswerLetter = 'A' | 'B' | 'C' | 'D';

export type DomainKey = 'legal' | 'financial' | 'physical' | 'digital';

export interface Answer {
  q:      number;
  domain: string;    // domain key: 'legal' | 'financial' | 'physical' | 'digital'
  answer: AnswerLetter;
}

// Stores percentage score (0–100) per assessed domain
export type DomainScores = Partial<Record<DomainKey, number>>;

export interface ScoringResult {
  readiness_score:   number;
  tier:              string;
  domain_scores:     DomainScores;
  critical_gaps:     string[];
  jesse_signals:     string[];
  lowest_domain:     string;
  completed_domains: DomainKey[];
}

export interface AssessmentPayload extends ScoringResult {
  name:  string;
  email: string;
}

// ── AI ────────────────────────────────────────────────────────────────────────

export interface PlanResult {
  plan:   string;
  source: 'ai' | 'static';
}

// ── Email ─────────────────────────────────────────────────────────────────────

export interface EmailSendParams {
  name:      string;
  email:     string;
  score:     number;
  tier:      string;
  pdfBuffer: Buffer;
}

export type EmailSendResult =
  | { skipped: true }
  | { id?: string };

// ── PDF ───────────────────────────────────────────────────────────────────────

export interface PDFGenerationParams {
  name:            string;
  readiness_score: number;
  tier:            string;
  domain_scores:   DomainScores;
  plan:            string;
}

// ── API Responses ─────────────────────────────────────────────────────────────

export interface ApiSuccessResponse {
  success: true;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code:    string;
  errors?: Record<string, string>;
}
