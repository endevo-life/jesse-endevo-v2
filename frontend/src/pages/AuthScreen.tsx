import React, { useState } from "react";
import { signInWithGoogle } from "../lib/firebase";
import "./AuthScreen.css";

interface AuthScreenProps {
  onAuth: (uid: string, email: string, name: string, photoURL: string | null) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuth }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithGoogle();
      const user   = result.user;
      onAuth(
        user.uid,
        user.email ?? "",
        user.displayName ?? "Friend",
        user.photoURL,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign-in failed";
      // Ignore user-cancelled popup
      if (!msg.includes("popup-closed-by-user") && !msg.includes("cancelled-popup-request")) {
        setError("Something went wrong. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="noise-overlay" />

      <nav className="screen-nav">
        <img src="/logo_v2_with_white_text.png" alt="ENDevo" className="screen-nav-logo" />
      </nav>

      <div className="auth-card">
        {/* Jesse avatar */}
        <div className="auth-avatar">
          <div className="auth-avatar-ring" />
          <div className="auth-avatar-inner">
            <img src="/jesse.png" alt="Jesse" className="auth-avatar-photo" />
          </div>
        </div>

        <h2 className="auth-heading">Save your progress<br />with Google</h2>
        <p className="auth-sub">
          Jesse will remember your results across all four domains so you can track your improvement over time.
        </p>

        <div className="auth-benefits">
          <div className="auth-benefit">
            <span className="auth-benefit-icon">📊</span>
            <span>Track scores across sessions</span>
          </div>
          <div className="auth-benefit">
            <span className="auth-benefit-icon">🤖</span>
            <span>Personalised AI recommendations</span>
          </div>
          <div className="auth-benefit">
            <span className="auth-benefit-icon">📈</span>
            <span>See your improvement over time</span>
          </div>
        </div>

        <button
          className="google-signin-btn"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          {loading ? (
            <span className="auth-spinner" />
          ) : (
            <>
              <svg className="google-icon" viewBox="0 0 48 48" width="20" height="20">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        {error && <p className="auth-error">{error}</p>}

        <p className="auth-privacy">
          We only use your Google account to save your results. No posting, no spamming.
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
