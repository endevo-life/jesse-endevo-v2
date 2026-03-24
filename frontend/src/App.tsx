import { useState, useEffect } from "react";
import { AppScreen, UserAnswers, GoogleUser } from "./types";
import { QUESTIONS_BY_DOMAIN, DomainKey } from "./data/questions";
import { API_ENDPOINTS } from "./api/config";
import { onAuthChange, signOutUser } from "./lib/firebase";

import LandingScreen from "./pages/LandingScreen";
import AuthScreen from "./pages/AuthScreen";
import DomainSelectScreen from "./pages/DomainSelectScreen";
import QuizScreen from "./pages/QuizScreen";
import CaptureScreen from "./pages/CaptureScreen";
import LoadingScreen from "./pages/LoadingScreen";
import ConfirmationScreen from "./pages/ConfirmationScreen";

function App() {
  const [screen, setScreen]                   = useState<AppScreen>("landing");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers]                 = useState<UserAnswers>({});
  const [allAnswers, setAllAnswers]           = useState<UserAnswers>({});
  const [completedDomains, setCompletedDomains] = useState<DomainKey[]>([]);
  const [userName, setUserName]               = useState("");
  const [isLongWait, setIsLongWait]           = useState(false);
  const [user, setUser]                       = useState<GoogleUser | null>(null);
  const [selectedDomain, setSelectedDomain]   = useState<DomainKey | null>(null);

  // Listen for Firebase auth state
  useEffect(() => {
    const unsub = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid:         firebaseUser.uid,
          email:       firebaseUser.email ?? "",
          displayName: firebaseUser.displayName ?? "Friend",
          photoURL:    firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
    });
    return unsub;
  }, []);

  // Long-wait timeout handler
  useEffect(() => {
    if (screen !== "loading") {
      setIsLongWait(false);
      return;
    }
    const timer = setTimeout(() => setIsLongWait(true), 15000);
    return () => clearTimeout(timer);
  }, [screen]);

  const handleStart = () => setScreen("auth");

  const handleAuth = (uid: string, email: string, name: string, photoURL: string | null) => {
    setUser({ uid, email, displayName: name, photoURL });
    setScreen("domain-select");
  };

  const handleDomainSelect = (domainKey: DomainKey) => {
    setSelectedDomain(domainKey);
    setAnswers({});
    setCurrentQuestion(0);
    setScreen("quiz");
  };

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
    setSelectedDomain(null);
    setAnswers({});
    setAllAnswers({});
    setCompletedDomains([]);
    setCurrentQuestion(0);
    setScreen("landing");
  };

  const activeQuestions = selectedDomain ? QUESTIONS_BY_DOMAIN[selectedDomain] : [];

  const handleAnswer = (questionId: string, answer: string, score: number, domain: string) => {
    const newAnswers = {
      ...answers,
      [questionId]: { answer, score, domain },
    };
    setAnswers(newAnswers);

    if (currentQuestion < activeQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      // Domain complete — merge into allAnswers, mark done, return to domain select
      setAllAnswers((prev) => ({ ...prev, ...newAnswers }));
      setCompletedDomains((prev) => [...prev, selectedDomain!]);
      setAnswers({});
      setCurrentQuestion(0);
      setScreen("domain-select");
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    } else {
      setScreen("domain-select");
      setCurrentQuestion(0);
    }
  };

  const handleSubmitReport = () => setScreen("capture");

  const handleCapture = async (name: string, email: string) => {
    setUserName(name);
    setScreen("loading");

    // Build a flat answers array from ALL completed domains in order
    const answersArray = completedDomains.flatMap((dk) =>
      QUESTIONS_BY_DOMAIN[dk].map((q) => ({
        q:      q.number,
        domain: dk,
        answer: allAnswers[q.id]?.answer ?? "A",
      }))
    );

    const payload = {
      name,
      email,
      userId:  user?.uid ?? null,
      domains: completedDomains,
      answers: answersArray,
    };

    try {
      const response = await fetch(API_ENDPOINTS.assess, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("API error");
    } catch (err) {
      console.warn("API call failed — showing confirmation anyway", err);
    }

    setScreen("confirmation");
  };

  return (
    <>
      {screen === "landing" && <LandingScreen onStart={handleStart} />}

      {screen === "auth" && <AuthScreen onAuth={handleAuth} />}

      {screen === "domain-select" && user && (
        <DomainSelectScreen
          user={user}
          onSelect={handleDomainSelect}
          onSignOut={handleSignOut}
          completedDomains={completedDomains}
          onSubmit={handleSubmitReport}
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

      {screen === "capture" && user && (
        <CaptureScreen
          name={user.displayName.split(" ")[0]}
          email={user.email}
          photoURL={user.photoURL}
          completedDomains={completedDomains}
          onSubmit={() => handleCapture(
            user!.displayName.split(" ")[0],
            user!.email
          )}
        />
      )}

      {screen === "loading" && <LoadingScreen isLongWait={isLongWait} />}

      {screen === "confirmation" && <ConfirmationScreen name={userName} />}
    </>
  );
}

export default App;
