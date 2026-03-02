import React, { useState } from "react";
import "./CaptureScreen.css";

interface CaptureScreenProps {
  onSubmit: (name: string, email: string) => void;
}

const CaptureScreen: React.FC<CaptureScreenProps> = ({ onSubmit }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs: { name?: string; email?: string } = {};
    if (!name.trim()) errs.name = "Please enter your first name.";
    if (!email.trim()) {
      errs.email = "Please enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Please enter a valid email address.";
    }
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    onSubmit(name.trim(), email.trim());
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

        <h2 className="capture-heading">
          Great — your plan is almost ready.
        </h2>
        <p className="capture-sub">
          Where should Jesse send it?
        </p>

        <div className="capture-form">
          <div className="form-group">
            <label className="form-label" htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              className={`form-input ${errors.name ? "input-error" : ""}`}
              placeholder="Your first name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              autoFocus
            />
            {errors.name && <span className="error-msg">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className={`form-input ${errors.email ? "input-error" : ""}`}
              placeholder="your@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>

          <button
            className="send-btn"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <span>Sending…</span>
            ) : (
              <>
                <span>Send My 7-Day Plan</span>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>

          <p className="capture-micro">
            We'll send your personalised PDF to this email. No spam, ever.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CaptureScreen;
