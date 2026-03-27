import React, { useEffect, useState } from "react";
import "./ConfirmationScreen.css";

interface ConfirmationScreenProps {
  name: string;
}

const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({ name }) => {
  const [checkVisible, setCheckVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setCheckVisible(true), 100);
  }, []);

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(window.location.origin);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="confirm-screen">
      <div className="noise-overlay" />

      <nav className="screen-nav">
        <img src="/logo_v2_with_white_text.png" alt="ENDevo" className="screen-nav-logo" />
      </nav>

      <div className="confirm-content">
        {/* Animated checkmark */}
        <div className={`checkmark-wrap ${checkVisible ? "check-animate" : ""}`}>
          <div className="checkmark-circle">
            <svg viewBox="0 0 52 52" className="checkmark-svg">
              <circle cx="26" cy="26" r="24" fill="none" stroke="#22c55e" strokeWidth="3" className="check-circle" />
              <path fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M14 26l8 8 16-16" className="check-path" />
            </svg>
          </div>
          <div className="check-sparkles">
            {[...Array(6)].map((_, i) => (
              <span key={i} className={`sparkle sparkle-${i + 1}`} />
            ))}
          </div>
        </div>

        <h1 className="confirm-heading">
          Your plan is on its way,<br />
          <span className="confirm-name">{name}!</span>
        </h1>

        <div className="confirm-card">
          <div className="confirm-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="4" width="20" height="16" rx="3" stroke="#f97316" strokeWidth="2" />
              <path d="M2 8l10 6 10-6" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <p className="confirm-body">
            Check your inbox — Jesse has built your personalised{" "}
            <strong>Personalised Legacy Readiness Plan.</strong>
          </p>
          <p className="confirm-spam">
            Don't see it within 2 minutes? Check your spam folder.
          </p>
        </div>

        <div className="confirm-actions">
          <button className="share-btn" onClick={handleShareLinkedIn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Share on LinkedIn
          </button>

          <a
            href="https://endevo.life"
            target="_blank"
            rel="noopener noreferrer"
            className="endevo-link"
          >
            Learn more about ENDevo →
          </a>
        </div>

        {/* Jesse sign-off */}
        <div className="jesse-signoff">
          <div className="signoff-avatar">J</div>
          <div>
            <p className="signoff-quote">
              "Every step you take today protects the people you love tomorrow."
            </p>
            <p className="signoff-name">— Jesse, ENDevo</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationScreen;
