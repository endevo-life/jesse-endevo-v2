import React, { useState } from "react";
import "./CaptureScreen.css";

const DOMAIN_LABELS: Record<string, string> = {
  legal:     "Legal Readiness",
  financial: "Financial Readiness",
  physical:  "Physical Readiness",
  digital:   "Digital Readiness",
};

interface CaptureScreenProps {
  name:             string;
  email:            string;
  photoURL:         string | null;
  completedDomains: string[];
  onSubmit:         () => void;
}

const CaptureScreen: React.FC<CaptureScreenProps> = ({
  name,
  email,
  photoURL,
  completedDomains,
  onSubmit,
}) => {
  const [submitting, setSubmitting] = useState(false);

  const handleSend = () => {
    setSubmitting(true);
    onSubmit();
  };

  return (
    <div className="capture-screen">
      <div className="noise-overlay" />

      <nav className="screen-nav">
        <img src="/logo_v2_with_white_text.png" alt="ENDevo" className="screen-nav-logo" />
      </nav>

      <div className="capture-card">
        {/* Jesse avatar */}
        <div className="capture-avatar">
          <div className="capture-avatar-ring" />
          <div className="capture-avatar-inner">
            <img src="/jesse.png" alt="Jesse" className="capture-avatar-photo" />
          </div>
        </div>

        <h2 className="capture-heading">Your report is ready, {name}!</h2>
        <p className="capture-sub">We'll send your personalised plan to:</p>

        {/* Google account confirmation */}
        <div className="capture-email-confirm">
          {photoURL && (
            <img
              src={photoURL}
              alt={name}
              className="capture-google-avatar"
              referrerPolicy="no-referrer"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <div className="capture-email-details">
            <span className="capture-email-name">{name}</span>
            <span className="capture-email-address">{email}</span>
          </div>
          <svg className="capture-email-verified" width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="10" fill="#22c55e" />
            <path d="M6.5 11.5l3 3 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Domains included */}
        {completedDomains.length > 0 && (
          <div className="capture-domains">
            <p className="capture-domains-label">Domains in your report:</p>
            <div className="capture-domains-list">
              {completedDomains.map((dk) => (
                <span key={dk} className="capture-domain-pill">
                  {DOMAIN_LABELS[dk] ?? dk}
                </span>
              ))}
            </div>
          </div>
        )}

        <button className="send-btn" onClick={handleSend} disabled={submitting}>
          {submitting ? (
            <span>Sending…</span>
          ) : (
            <>
              <span>Send My Full Report</span>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
        </button>

        <p className="capture-micro">
          Your personalised PDF readiness plan will arrive in your inbox within minutes. No spam, ever.
        </p>
      </div>
    </div>
  );
};

export default CaptureScreen;
