import React from "react";
import { DOMAINS, DomainKey } from "../data/questions";
import { GoogleUser } from "../types";
import "./DomainSelectScreen.css";

interface DomainSelectScreenProps {
  user: GoogleUser;
  onSelect: (domainKey: DomainKey) => void;
  onSignOut: () => void;
  completedDomains: DomainKey[];
  onSubmit: () => void;
}

const DomainSelectScreen: React.FC<DomainSelectScreenProps> = ({
  user,
  onSelect,
  onSignOut,
  completedDomains,
  onSubmit,
}) => {
  const firstName = user.displayName.split(" ")[0];
  const doneCount = completedDomains.length;
  const allDone = doneCount === DOMAINS.length;

  const jesseMessage = doneCount === 0
    ? `Hey ${firstName}! Pick a domain to assess below. Each takes about 3 minutes and gives you a personalised action plan. You can do one now and come back for the rest — your progress is saved.`
    : allDone
    ? `Amazing work, ${firstName}! You've completed all four domains. Hit the button below to get your full end-of-life readiness report delivered to your inbox.`
    : `Great job, ${firstName}! You've completed ${doneCount} of 4 domain${doneCount > 1 ? "s" : ""}. Pick another to keep going — or submit now to get your report so far.`;

  return (
    <div className="domain-screen">
      <div className="noise-overlay" />

      <nav className="screen-nav">
        <img src="/logo_v2_with_white_text.png" alt="ENDevo" className="screen-nav-logo" />
        <div className="domain-nav-user">
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="domain-nav-avatar"
              referrerPolicy="no-referrer"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <span className="domain-nav-name">{firstName}</span>
          <button className="domain-signout-btn" onClick={onSignOut}>Sign out</button>
        </div>
      </nav>

      <div className="domain-content">
        {/* Jesse intro */}
        <div className="domain-jesse">
          <div className="domain-jesse-avatar">
            <img src="/jesse.png" alt="Jesse" className="domain-jesse-photo" />
          </div>
          <div className="domain-jesse-bubble">
            <p>{jesseMessage}</p>
          </div>
        </div>

        <h2 className="domain-heading">
          {doneCount === 0 ? "Which area do you want to assess?" : "Pick your next domain"}
        </h2>
        {doneCount > 0 && (
          <p className="domain-progress-label">{doneCount} of {DOMAINS.length} completed</p>
        )}
        <p className="domain-sub">10 questions per domain · Full planner delivered by email</p>

        <div className="domain-grid">
          {DOMAINS.map((d) => {
            const isDone = completedDomains.includes(d.key);
            return (
              <button
                key={d.key}
                className={`domain-card${isDone ? " done" : ""}`}
                onClick={isDone ? undefined : () => onSelect(d.key)}
                disabled={isDone}
                aria-label={isDone ? `${d.label} — completed` : `Start ${d.label}`}
              >
                <span className="domain-card-icon">{d.icon}</span>
                <div className="domain-card-body">
                  <span className="domain-card-label">{d.label}</span>
                  <span className="domain-card-desc">{d.desc}</span>
                </div>
                {isDone ? (
                  <svg className="domain-card-check" width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <circle cx="11" cy="11" r="10" fill="#22c55e" />
                    <path d="M6.5 11.5l3 3 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg className="domain-card-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {doneCount > 0 && (
          <button className="submit-report-btn" onClick={onSubmit}>
            Get My Full Report →
          </button>
        )}

        {doneCount === 0 && (
          <p className="domain-footer">
            Want to do all four? Start with any domain — Jesse will prompt you to complete the others after each assessment.
          </p>
        )}
      </div>
    </div>
  );
};

export default DomainSelectScreen;
