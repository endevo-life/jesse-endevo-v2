export type AppScreen =
  | "landing"
  | "auth"
  | "dashboard"
  | "quiz"
  | "loading"
  | "domain-result"
  | "confirmation";

export interface UserAnswers {
  [questionId: string]: {
    answer: string;
    score: number;
    domain: string;
  };
}

export interface AssessmentPayload {
  name: string;
  email: string;
  answers: UserAnswers;
}

export interface GoogleUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
}

export interface DomainProgress {
  domainKey:    string;
  pctScore:     number;
  tier:         string;
  aiPlan:       string;
  criticalGaps: string[];
  completedAt:  string;
}
