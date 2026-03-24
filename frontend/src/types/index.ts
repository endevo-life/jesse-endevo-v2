export type AppScreen =
  | "landing"
  | "auth"
  | "domain-select"
  | "quiz"
  | "capture"
  | "loading"
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
