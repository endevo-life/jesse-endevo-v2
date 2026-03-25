import React, { useState } from "react";
import { DOMAINS, DomainKey } from "../data/questions";
import { GoogleUser, DomainProgress } from "../types";
import { signInWithGoogleDrive } from "../lib/firebase";
import { API_ENDPOINTS } from "../api/config";
import "./DashboardScreen.css";

interface DashboardScreenProps {
  user:      GoogleUser;
  sessions:  DomainProgress[];
  loading:   boolean;
  onStart:   (domainKey: DomainKey) => void;
  onSignOut: () => void;
}

// ── Radar chart ───────────────────────────────────────────────────────────────
const RADAR_AXES = [
  { key: "legal",     label: "Legal",     angle: -Math.PI / 2 },
  { key: "financial", label: "Financial", angle: 0 },
  { key: "physical",  label: "Physical",  angle: Math.PI / 2 },
  { key: "digital",   label: "Digital",   angle: Math.PI },
] as const;

const RCX = 80, RCY = 80, R_MAX = 52;

function radarPt(angle: number, pct: number): [number, number] {
  const r = (pct / 100) * R_MAX;
  return [RCX + r * Math.cos(angle), RCY + r * Math.sin(angle)];
}

interface RadarChartProps { sessionMap: Record<string, DomainProgress>; }

const RadarChart: React.FC<RadarChartProps> = ({ sessionMap }) => {
  const gridLevels = [25, 50, 75, 100];
  const scorePts = RADAR_AXES.map(a => radarPt(a.angle, sessionMap[a.key]?.pctScore ?? 0));
  const scoreStr = scorePts.map(([x, y]) => `${x},${y}`).join(" ");

  return (
    <svg width="160" height="160" viewBox="0 0 160 160" className="radar-svg">
      {/* Grid */}
      {gridLevels.map(lvl => (
        <polygon key={lvl}
          points={RADAR_AXES.map(a => radarPt(a.angle, lvl).join(",")).join(" ")}
          fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      ))}
      {/* Axes */}
      {RADAR_AXES.map(a => {
        const [x2, y2] = radarPt(a.angle, 100);
        return <line key={a.key} x1={RCX} y1={RCY} x2={x2} y2={y2}
          stroke="rgba(255,255,255,0.1)" strokeWidth="1" />;
      })}
      {/* Score fill */}
      <polygon points={scoreStr}
        fill="rgba(249,115,22,0.15)" stroke="#f97316" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Score dots */}
      {RADAR_AXES.map(a => {
        const pct = sessionMap[a.key]?.pctScore ?? 0;
        if (!pct) return null;
        const [x, y] = radarPt(a.angle, pct);
        const col = TIER_COLORS[sessionMap[a.key]?.tier ?? ""] ?? "#f97316";
        return <circle key={a.key} cx={x} cy={y} r="3.5" fill={col} />;
      })}
      {/* Labels */}
      {RADAR_AXES.map(a => {
        const [lx, ly] = radarPt(a.angle, 130);
        const hasDone = !!sessionMap[a.key];
        return (
          <text key={a.key} x={lx} y={ly}
            textAnchor="middle" dominantBaseline="central"
            fill={hasDone ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.3)"}
            fontSize="9" fontFamily="Inter" fontWeight={hasDone ? "600" : "400"}>
            {a.label}
          </text>
        );
      })}
    </svg>
  );
};

// ── Tier colours ──────────────────────────────────────────────────────────────
const TIER_COLORS: Record<string, string> = {
  "Peace Champion":  "#22c55e",
  "On Your Way":     "#3b82f6",
  "Getting Clarity": "#f59e0b",
  "Starting Fresh":  "#ef4444",
};

// ── Plan parser ───────────────────────────────────────────────────────────────
interface ActionItem  { id: string; title: string; desc: string; }
interface PlanSection { header: string; items: ActionItem[]; note?: string; }

function parsePlan(plan: string, domainKey: string): PlanSection[] {
  const lines    = plan.split("\n").filter(l => l.trim());
  const sections: PlanSection[] = [];
  let current: PlanSection | null = null;
  let idx = 0;

  for (const line of lines) {
    if (/^Day \d+:/.test(line) || /^===/.test(line)) {
      if (current) sections.push(current);
      current = { header: line.replace(/^===\s*|\s*===$/g, "").trim(), items: [] };
      idx = 0;
    } else if (line.startsWith("- ")) {
      if (!current) current = { header: "", items: [] };
      const content = line.slice(2);
      const pipe    = content.indexOf(" | ");
      const title   = pipe !== -1 ? content.slice(0, pipe) : content;
      const desc    = pipe !== -1 ? content.slice(pipe + 3) : "";
      current.items.push({ id: `${domainKey}_${sections.length}_${idx++}`, title, desc });
    } else if (line.startsWith("NOTE: ")) {
      if (current) current.note = line.slice(6);
    }
  }
  if (current) sections.push(current);
  return sections.filter(s => s.items.length > 0 || s.note);
}

const CHECKS_KEY = (uid: string) => `jesse_checks_${uid}`;

// ── Component ─────────────────────────────────────────────────────────────────
const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user, sessions, loading, onStart, onSignOut,
}) => {
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading]         = useState(false);
  const [pdfError, setPdfError]             = useState<string | null>(null);

  // Checklist state — persisted in localStorage
  const [checks, setChecks] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem(CHECKS_KEY(user.uid)) ?? "{}"); }
    catch { return {}; }
  });

  const toggleCheck = (itemId: string) => {
    const next = { ...checks, [itemId]: !checks[itemId] };
    setChecks(next);
    localStorage.setItem(CHECKS_KEY(user.uid), JSON.stringify(next));
  };

  const firstName    = user.displayName.split(" ")[0];
  const doneCount    = sessions.length;
  const totalDomains = DOMAINS.length;
  const overallPct   = doneCount > 0
    ? Math.round(sessions.reduce((s, d) => s + d.pctScore, 0) / doneCount)
    : 0;

  const sessionMap = Object.fromEntries(sessions.map(s => [s.domainKey, s]));

  // Action item progress across all domains
  const actionProgress = sessions.reduce((acc, s) => {
    const all  = parsePlan(s.aiPlan, s.domainKey).flatMap(sec => sec.items);
    const done = all.filter(item => checks[item.id]).length;
    acc[s.domainKey] = { total: all.length, done };
    return acc;
  }, {} as Record<string, { total: number; done: number }>);

  const totalActions = Object.values(actionProgress).reduce((s, v) => s + v.total, 0);
  const doneActions  = Object.values(actionProgress).reduce((s, v) => s + v.done, 0);
  const actionPct    = totalActions > 0 ? Math.round((doneActions / totalActions) * 100) : 0;

  // ── PDF helpers ───────────────────────────────────────────────────────────
  async function fetchPdfBlob(domainFilter?: string): Promise<Blob | null> {
    setPdfLoading(true); setPdfError(null);
    try {
      const res = await fetch(API_ENDPOINTS.reportPdf, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          userId:   user.uid,
          name:     firstName,
          sessions: domainFilter ? sessions.filter(s => s.domainKey === domainFilter) : sessions,
        }),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      return await res.blob();
    } catch {
      setPdfError("Could not generate PDF. Please try again.");
      return null;
    } finally { setPdfLoading(false); }
  }

  const handleDownloadPdf = async (domainFilter?: string) => {
    const blob = await fetchPdfBlob(domainFilter);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a   = document.createElement("a");
    a.href = url;
    a.download = `${firstName}_${domainFilter ?? "full"}_report_${new Date().toISOString().slice(0, 10)}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToDrive = async (domainFilter?: string) => {
    const blob = await fetchPdfBlob(domainFilter);
    if (!blob) return;
    try {
      const accessToken = await signInWithGoogleDrive();
      if (!accessToken) throw new Error("No Drive access");
      const name = `${firstName}_${domainFilter ?? "full"}_report_${new Date().toISOString().slice(0, 10)}.pdf`;
      const form = new FormData();
      form.append("metadata", new Blob([JSON.stringify({ name, mimeType: "application/pdf" })], { type: "application/json" }));
      form.append("file", blob);
      const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
        method: "POST", headers: { Authorization: `Bearer ${accessToken}` }, body: form,
      });
      if (!res.ok) throw new Error("Drive upload failed");
      alert("Saved to Google Drive!");
    } catch { setPdfError("Could not save to Drive. Please try again."); }
  };

  const handleShare = async (domainFilter?: string) => {
    const blob = await fetchPdfBlob(domainFilter);
    if (!blob) return;
    const name = `${firstName}_${domainFilter ?? "full"}_report_${new Date().toISOString().slice(0, 10)}.pdf`;
    const file = new File([blob], name, { type: "application/pdf" });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: "My Readiness Report" });
    } else {
      handleDownloadPdf(domainFilter);
    }
  };

  const jesseMsg = doneCount === 0
    ? `Hey ${firstName}! Choose any domain below to begin your assessment. Each takes about 3 minutes.`
    : doneCount === totalDomains
    ? `Incredible work, ${firstName}! All four domains complete. ${actionPct > 0 ? `You've completed ${actionPct}% of your action items — keep going!` : "Start working through your action plan below."}`
    : `Good progress, ${firstName}! ${doneCount} of ${totalDomains} domains assessed. Keep going or export a partial report now.`;

  return (
    <div className="dash-screen">
      <div className="noise-overlay" />

      {/* Nav */}
      <nav className="dash-nav">
        <img src="/logo_v2_with_white_text.png" alt="ENDevo" className="dash-nav-logo" />
        <div className="dash-nav-user">
          {user.photoURL && (
            <img src={user.photoURL} alt={user.displayName} className="dash-nav-avatar"
              referrerPolicy="no-referrer"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          )}
          <span className="dash-nav-name">{firstName}</span>
          <button className="dash-signout-btn" onClick={onSignOut}>Sign out</button>
        </div>
      </nav>

      <div className="dash-content">

        {/* Jesse bubble */}
        <div className="dash-jesse">
          <div className="dash-jesse-avatar">
            <img src="/jesse.png" alt="Jesse" className="dash-jesse-photo" />
          </div>
          <div className="dash-jesse-bubble"><p>{jesseMsg}</p></div>
        </div>

        {/* Overall progress + radar chart */}
        {doneCount > 0 && (
          <div className="dash-overall">
            <div className="dash-overall-row">
              <div className="dash-overall-stats">
                <div className="dash-overall-col">
                  <span className="dash-overall-label">Readiness Score</span>
                  <span className="dash-overall-pct">{overallPct}%</span>
                  <div className="dash-overall-track">
                    <div className="dash-overall-fill" style={{ width: `${overallPct}%` }} />
                  </div>
                  <span className="dash-overall-sub">{doneCount} of {totalDomains} domains assessed</span>
                </div>
                {totalActions > 0 && (
                  <div className="dash-overall-col">
                    <span className="dash-overall-label">Action Items</span>
                    <span className="dash-overall-pct dash-overall-pct--green">{actionPct}%</span>
                    <div className="dash-overall-track">
                      <div className="dash-overall-fill dash-overall-fill--green" style={{ width: `${actionPct}%` }} />
                    </div>
                    <span className="dash-overall-sub">{doneActions} of {totalActions} actions done</span>
                  </div>
                )}
              </div>
              <RadarChart sessionMap={sessionMap} />
            </div>
          </div>
        )}

        {/* Domain cards */}
        <div className="dash-grid">
          {loading ? (
            <div className="dash-loading">Loading your progress...</div>
          ) : (
            DOMAINS.map((d) => {
              const session = sessionMap[d.key];
              const isDone  = !!session;
              const isOpen  = expandedDomain === d.key;
              const color   = isDone ? (TIER_COLORS[session.tier] ?? "#f97316") : "rgba(255,255,255,0.2)";
              const prog    = actionProgress[d.key];
              const parsed  = isDone ? parsePlan(session.aiPlan, d.key) : [];
              const circumference = 2 * Math.PI * 18; // r=18

              return (
                <div key={d.key} className={`dash-card${isDone ? " done" : ""}`}>
                  <div className="dash-card-top">

                    {/* SVG donut score / domain icon */}
                    <div className="dash-donut-wrap">
                      {isDone ? (
                        <svg className="dash-donut" viewBox="0 0 44 44">
                          <circle cx="22" cy="22" r="18" className="dash-donut-bg" />
                          <circle cx="22" cy="22" r="18" className="dash-donut-arc"
                            stroke={color}
                            strokeDasharray={`${(session.pctScore / 100) * circumference} ${circumference}`}
                            strokeDashoffset={circumference * 0.25}
                          />
                          <text x="22" y="22" className="dash-donut-label" dominantBaseline="central">
                            {session.pctScore}%
                          </text>
                        </svg>
                      ) : (
                        <span className="dash-card-icon">{d.icon}</span>
                      )}
                    </div>

                    <div className="dash-card-info">
                      <span className="dash-card-label">{d.label}</span>
                      <span className="dash-card-desc">{d.desc}</span>
                      {isDone && prog && prog.total > 0 && (
                        <div className="dash-action-mini">
                          <div className="dash-action-mini-bar">
                            <div className="dash-action-mini-fill"
                              style={{ width: `${Math.round((prog.done / prog.total) * 100)}%` }} />
                          </div>
                          <span className="dash-action-mini-label">{prog.done}/{prog.total} actions done</span>
                        </div>
                      )}
                    </div>

                    <div className="dash-card-right">
                      {isDone ? (
                        <>
                          <span className="dash-tier-chip" style={{ background: color + "22", color }}>
                            {session.tier}
                          </span>
                          <button className="dash-view-plan-btn"
                            onClick={() => setExpandedDomain(isOpen ? null : d.key)}>
                            {isOpen ? "Hide Plan ↑" : "View Plan ↓"}
                          </button>
                        </>
                      ) : (
                        <button className="dash-start-btn" onClick={() => onStart(d.key)}>
                          Start →
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable checklist plan */}
                  {isDone && isOpen && (
                    <div className="dash-plan-panel">

                      {session.criticalGaps.length > 0 && (
                        <div className="dash-gaps">
                          <p className="dash-gaps-label">Critical gaps</p>
                          <ul className="dash-gaps-list">
                            {session.criticalGaps.map((g, i) => <li key={i}>{g}</li>)}
                          </ul>
                        </div>
                      )}

                      {parsed.map((section, si) => (
                        <div key={si} className="dash-section">
                          {section.header && (
                            <p className="dash-section-header">{section.header}</p>
                          )}
                          <ul className="dash-checklist">
                            {section.items.map((item) => (
                              <li key={item.id}
                                className={`dash-check-item${checks[item.id] ? " checked" : ""}`}
                                onClick={() => toggleCheck(item.id)}>
                                <span className="dash-checkbox">
                                  {checks[item.id] ? "✓" : ""}
                                </span>
                                <div className="dash-check-body">
                                  <span className="dash-check-title">{item.title}</span>
                                  {item.desc && <span className="dash-check-desc">{item.desc}</span>}
                                </div>
                              </li>
                            ))}
                          </ul>
                          {section.note && (
                            <p className="dash-note">{section.note}</p>
                          )}
                        </div>
                      ))}

                      <div className="dash-plan-footer">
                        <p className="dash-plan-date">
                          Assessed {new Date(session.completedAt).toLocaleDateString("en-AU", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </p>
                        <div className="dash-plan-actions">
                          <button className="dash-plan-export-btn"
                            onClick={() => handleDownloadPdf(d.key)} disabled={pdfLoading}>
                            Export PDF
                          </button>
                          <button className="dash-retake-btn" onClick={() => onStart(d.key)}>
                            Retake
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Full report export panel */}
        {doneCount > 0 && (
          <div className="dash-actions">
            <p className="dash-actions-label">
              {doneCount === totalDomains
                ? "All domains complete — export your full readiness report:"
                : `${doneCount} domain${doneCount > 1 ? "s" : ""} assessed — export your report so far:`}
            </p>
            {pdfError && <p className="dash-pdf-error">{pdfError}</p>}
            <div className="dash-export-btns">
              <button className="dash-export-btn primary"
                onClick={() => handleDownloadPdf()} disabled={pdfLoading}>
                {pdfLoading ? "Generating..." : "Download PDF"}
              </button>
              <button className="dash-export-btn"
                onClick={() => handleSaveToDrive()} disabled={pdfLoading}>
                Save to Drive
              </button>
              <button className="dash-export-btn"
                onClick={() => handleShare()} disabled={pdfLoading}>
                Share
              </button>
            </div>
            <p className="dash-actions-sub">Charts, domain scores, and your full personalised plan in one PDF.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardScreen;
