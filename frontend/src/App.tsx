import { useState, useEffect } from "react";
import { AppScreen, UserAnswers, GoogleUser, DomainProgress } from "./types";
import { QUESTIONS_BY_DOMAIN, DomainKey } from "./data/questions";
import { API_ENDPOINTS } from "./api/config";
import { onAuthChange, signOutUser } from "./lib/firebase";

import LandingScreen       from "./pages/LandingScreen";
import AuthScreen          from "./pages/AuthScreen";
import DashboardScreen     from "./pages/DashboardScreen";
import DomainResultScreen  from "./pages/DomainResultScreen";
import QuizScreen          from "./pages/QuizScreen";
import LoadingScreen       from "./pages/LoadingScreen";
import ConfirmationScreen  from "./pages/ConfirmationScreen";

function App() {
  const [screen, setScreen]                   = useState<AppScreen>("landing");
  const [user, setUser]                       = useState<GoogleUser | null>(null);
  const [sessions, setSessions]               = useState<DomainProgress[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Quiz state
  const [selectedDomain, setSelectedDomain]   = useState<DomainKey | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers]                 = useState<UserAnswers>({});

  // Loading state
  const [isLongWait, setIsLongWait]           = useState(false);
  const [userName]                            = useState("");

  // Domain result state
  const [lastResult, setLastResult] = useState<{ pctScore: number; tier: string } | null>(null);

  // ── Firebase auth listener ──────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        const u: GoogleUser = {
          uid:         firebaseUser.uid,
          email:       firebaseUser.email ?? "",
          displayName: firebaseUser.displayName ?? "Friend",
          photoURL:    firebaseUser.photoURL,
        };
        setUser(u);
      } else {
        setUser(null);
      }
    });
    return unsub;
  }, []);

  // ── Load sessions when user is set and on dashboard ────────────────────────
  useEffect(() => {
    if (!user) return;
    loadSessions(user.uid);
    // Upsert user meta in background
    fetch(API_ENDPOINTS.userMeta(user.uid), {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        email:       user.email,
        displayName: user.displayName,
        photoURL:    user.photoURL,
      }),
    }).catch(() => {/* non-critical */});
  }, [user?.uid]);

  // ── Long-wait toast ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== "loading") { setIsLongWait(false); return; }
    const t = setTimeout(() => setIsLongWait(true), 15000);
    return () => clearTimeout(t);
  }, [screen]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  async function loadSessions(uid: string) {
    setSessionsLoading(true);
    try {
      const res  = await fetch(API_ENDPOINTS.user(uid));
      const data = await res.json();
      if (data.success && Array.isArray(data.sessions)) {
        setSessions(data.sessions as DomainProgress[]);
      }
    } catch {
      // non-critical — dashboard still works with empty state
    } finally {
      setSessionsLoading(false);
    }
  }

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleStart = () => setScreen("auth");

  const handleAuth = (uid: string, email: string, name: string, photoURL: string | null) => {
    setUser({ uid, email, displayName: name, photoURL });
    setScreen("dashboard");
  };

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
    setSessions([]);
    setSelectedDomain(null);
    setAnswers({});
    setCurrentQuestion(0);
    setScreen("landing");
  };

  const handleDomainStart = (domainKey: DomainKey) => {
    setSelectedDomain(domainKey);
    setAnswers({});
    setCurrentQuestion(0);
    setScreen("quiz");
  };

  const activeQuestions = selectedDomain ? QUESTIONS_BY_DOMAIN[selectedDomain] : [];

  const handleAnswer = (questionId: string, answer: string, score: number, domain: string) => {
    const newAnswers = { ...answers, [questionId]: { answer, score, domain } };
    setAnswers(newAnswers);

    if (currentQuestion < activeQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      // Domain quiz complete — submit to backend
      handleDomainComplete(newAnswers);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    } else {
      setScreen("dashboard");
      setCurrentQuestion(0);
    }
  };

  const handleDomainComplete = async (finalAnswers: UserAnswers) => {
    if (!user || !selectedDomain) return;
    setScreen("loading");

    const answersArray = activeQuestions.map((q) => ({
      q:      q.number,
      domain: selectedDomain,
      answer: finalAnswers[q.id]?.answer ?? "A",
    }));

    try {
      const res  = await fetch(API_ENDPOINTS.assessDomain, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          userId:    user.uid,
          name:      user.displayName.split(" ")[0],
          email:     user.email,
          domainKey: selectedDomain,
          answers:   answersArray,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const newSession: DomainProgress = {
          domainKey:    data.domainKey,
          pctScore:     data.pctScore,
          tier:         data.tier,
          aiPlan:       data.aiPlan,
          criticalGaps: data.criticalGaps,
          completedAt:  data.completedAt,
        };
        setSessions((prev) => {
          const filtered = prev.filter(s => s.domainKey !== data.domainKey);
          return [...filtered, newSession];
        });
      }
    } catch (err) {
      console.warn("Domain assess failed:", err);
    }

    setLastResult(data.success ? { pctScore: data.pctScore, tier: data.tier } : null);
    setScreen("domain-result");
  };

  return (
    <>
      {screen === "landing" && <LandingScreen onStart={handleStart} />}

      {screen === "auth" && <AuthScreen onAuth={handleAuth} />}

      {screen === "dashboard" && user && (
        <DashboardScreen
          user={user}
          sessions={sessions}
          loading={sessionsLoading}
          onStart={handleDomainStart}
          onSignOut={handleSignOut}
        />
      )}

      {screen === "quiz" && selectedDomain && (
        <QuizScreen
          questions={activeQuestions}
          currentQuestion={currentQuestion}
          answers={answers}
          onAnswer={handleAnswer}
          onBack={handleBack}
        />
      )}

      {screen === "loading" && <LoadingScreen isLongWait={isLongWait} />}

      {screen === "domain-result" && selectedDomain && lastResult && (
        <DomainResultScreen
          domainKey={selectedDomain}
          pctScore={lastResult.pctScore}
          tier={lastResult.tier}
          onContinue={() => { setSelectedDomain(null); setScreen("dashboard"); }}
        />
      )}

      {screen === "confirmation" && <ConfirmationScreen name={userName} />}
    </>
  );
}

export default App;
