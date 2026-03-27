import React, { useState, useEffect, useRef } from "react";
import { API_ENDPOINTS } from "../api/config";
import "./JesseChatWindow.css";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ChatMessage {
  id:         string;
  role:       "user" | "assistant";
  content:    string;
  created_at: string;
}

interface Props {
  userId:      string;
  displayName: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
const JesseChatWindow: React.FC<Props> = ({ userId, displayName }) => {
  const [isOpen, setIsOpen]         = useState(false);
  const [messages, setMessages]     = useState<ChatMessage[]>([]);
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLTextAreaElement>(null);

  const firstName = displayName.split(" ")[0];

  // ── Load history on first open ────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || historyLoaded) return;

    fetch(API_ENDPOINTS.chatHistory(userId))
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.history)) {
          setMessages(data.history);
        }
        setHistoryLoaded(true);
      })
      .catch(() => setHistoryLoaded(true));
  }, [isOpen, userId, historyLoaded]);

  // ── Auto-scroll on new messages ───────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // ── Focus input when opened ───────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    // Optimistic UI: show user message immediately
    const tempUserMsg: ChatMessage = {
      id:         `temp-${Date.now()}`,
      role:       "user",
      content:    text,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setInput("");
    setLoading(true);

    try {
      const res  = await fetch(API_ENDPOINTS.chat, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ userId, message: text }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.history) && data.history.length > 0) {
        setMessages(data.history);
      } else if (data.success && data.reply) {
        // Aurora unavailable — keep optimistic user msg and append the reply
        const assistantMsg: ChatMessage = {
          id:         `reply-${Date.now()}`,
          role:       "assistant",
          content:    data.reply,
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMsg]);
      }
    } catch {
      const errMsg: ChatMessage = {
        id:         `err-${Date.now()}`,
        role:       "assistant",
        content:    "Sorry, I couldn't reach the server. Please try again.",
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Markdown-lite renderer ─────────────────────────────────────────────────
  const renderLine = (line: string, key: number) => {
    if (!line.trim()) return <br key={key} />;

    // Parse inline **bold** and *italic*
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
    let last = 0, m: RegExpExecArray | null;
    while ((m = regex.exec(line)) !== null) {
      if (m.index > last) parts.push(line.slice(last, m.index));
      if (m[2]) parts.push(<strong key={m.index}>{m[2]}</strong>);
      else if (m[3]) parts.push(<em key={m.index}>{m[3]}</em>);
      last = m.index + m[0].length;
    }
    if (last < line.length) parts.push(line.slice(last));

    const isBullet = /^[-•*]\s/.test(line.trim());
    if (isBullet) {
      const content = parts.length ? parts : [line.trim().slice(2)];
      return <div key={key} className="jcw-bullet">{content}</div>;
    }
    return <div key={key}>{parts.length ? parts : line}</div>;
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Floating toggle button */}
      <button
        className={`jcw-fab${isOpen ? " jcw-fab--open" : ""}`}
        onClick={() => setIsOpen(o => !o)}
        aria-label={isOpen ? "Close Jesse chat" : "Chat with Jesse"}
      >
        {isOpen ? (
          <span className="jcw-fab-icon">✕</span>
        ) : (
          <img src="/jesse.png" alt="Jesse" className="jcw-fab-avatar" />
        )}
      </button>

      {/* Chat panel */}
      <div className={`jcw-panel${isOpen ? " jcw-panel--open" : ""}`} role="dialog" aria-label="Jesse chat">

        {/* Header */}
        <div className="jcw-header">
          <img src="/jesse.png" alt="Jesse" className="jcw-header-avatar" />
          <div className="jcw-header-info">
            <span className="jcw-header-name">Jesse</span>
            <span className="jcw-header-sub">Your Life Readiness Coach</span>
          </div>
          <button className="jcw-close-btn" onClick={() => setIsOpen(false)} aria-label="Close">✕</button>
        </div>

        {/* Messages */}
        <div className="jcw-messages">
          {messages.length === 0 && historyLoaded && (
            <div className="jcw-welcome">
              <p>Hi {firstName}! I'm Jesse, your life readiness coach.</p>
              <p>Ask me anything about legal, financial, physical, or digital readiness — or take your POMA assessment so I can give you personalised guidance.</p>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`jcw-msg jcw-msg--${msg.role}`}>
              {msg.role === "assistant" && (
                <img src="/jesse.png" alt="Jesse" className="jcw-msg-avatar" />
              )}
              <div className="jcw-msg-bubble">
                {msg.content.split("\n").map((line, i) => renderLine(line, i))}
              </div>
            </div>
          ))}

          {loading && (
            <div className="jcw-msg jcw-msg--assistant">
              <img src="/jesse.png" alt="Jesse" className="jcw-msg-avatar" />
              <div className="jcw-msg-bubble jcw-msg-bubble--typing">
                <span /><span /><span />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="jcw-input-row">
          <textarea
            ref={inputRef}
            className="jcw-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Jesse anything…"
            rows={1}
            disabled={loading}
          />
          <button
            className="jcw-send-btn"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            aria-label="Send"
          >
            ↑
          </button>
        </div>
      </div>
    </>
  );
};

export default JesseChatWindow;
