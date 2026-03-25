import React from "react";
import { DomainKey, DOMAINS } from "../data/questions";
import "./DomainResultScreen.css";

const TIER_COLORS: Record<string, string> = {
  "Peace Champion":  "#22c55e",
  "On Your Way":     "#3b82f6",
  "Getting Clarity": "#f59e0b",
  "Starting Fresh":  "#ef4444",
};

const TIER_MSG: Record<string, string> = {
  "Peace Champion":  "Outstanding — you're well prepared in this area.",
  "On Your Way":     "Solid progress. A few focused steps will close the gaps.",
  "Getting Clarity": "You're more aware than most. Action now will change everything.",
  "Starting Fresh":  "This is your starting point — and that's perfectly okay.",
};

const REMAINING_DOMAINS: DomainKey[] = ["legal", "financial", "physical", "digital"];

interface DomainResultScreenProps {
  domainKey:  DomainKey;
  pctScore:   number;
  tier:       string;
  onContinue: () => void;  // go to dashboard (pick next domain or get report)
}

const DomainResultScreen: React.FC<DomainResultScreenProps> = ({
  domainKey, pctScore, tier, onContinue,
}) => {
  const domain = DOMAINS.find(d => d.key === domainKey);
  const color  = TIER_COLORS[tier] ?? "#f97316";
  const msg    = TIER_MSG[tier]    ?? "";
  const circumference = 2 * Math.PI * 54;

  return (
    <div className="result-screen">
      <div className="noise-overlay" />
      <div className="result-card">

        <div className="result-domain-badge">
          <span>{domain?.icon}</span>
          <span>{domain?.label}</span>
        </div>

        {/* Animated donut */}
        <div className="result-donut-wrap">
          <svg className="result-donut" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" className="result-donut-bg" />
            <circle cx="60" cy="60" r="54" className="result-donut-arc"
              stroke={color}
              strokeDasharray={`${(pctScore / 100) * circumference} ${circumference}`}
              strokeDashoffset={circumference * 0.25}
            />
          </svg>
          <div className="result-donut-inner">
            <span className="result-score-num">{pctScore}</span>
            <span className="result-score-denom">/100</span>
          </div>
        </div>

        <span className="result-tier-chip" style={{ background: color + "22", color }}>
          {tier}
        </span>

        <p className="result-msg">{msg}</p>

        <p className="result-hint">Your personalised action plan is ready on your dashboard.</p>

        <button className="result-cta" onClick={onContinue}>
          Continue →
        </button>

      </div>
    </div>
  );
};

export default DomainResultScreen;
