import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════
   ORCHESTRA — AI Business Orchestration Hub
   Cowork-style actionable interface
   ═══════════════════════════════════════════ */

/* ── SVG Logos ─────────────────────────── */
const ShopifyLogo = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 109 124" fill="none">
    <path d="M95.6 28.2c-.1-.6-.6-1-1.1-1-.5-.1-10.3-1.6-10.3-1.6s-6.9-6.7-7.6-7.4c-.7-.7-2.1-.5-2.6-.3-.1 0-1.4.4-3.6 1.1-2.1-6.2-5.9-11.8-12.5-11.8h-.6C55.5 4.6 53.2 3 51.3 3c-15.8 0-23.4 19.7-25.8 29.7-6.1 1.9-10.5 3.2-11 3.4-3.4 1.1-3.5 1.2-4 4.4-.3 2.4-9.3 71.5-9.3 71.5l69.4 13 37.7-8.2S95.7 28.8 95.6 28.2zM67.3 21.6l-5.7 1.8c0-3-.4-7.2-1.7-10.8 4.3.8 6.4 5.7 7.4 9zM56.8 24.9l-12.3 3.8c1.2-4.6 3.4-9.1 7.8-12.1 1.7-1.1 4-2.4 5.7-3 1.1 2.6 1.8 6.3 1.8 11.3h-3zM51.4 7.5c1.9 0 3.4.6 4.8 2-5.5 2.6-11.4 9.1-13.2 22.1l-9.8 3c2.7-9.3 9.1-27.1 18.2-27.1z" fill="#95BF47"/>
    <path d="M94.5 27.2c-.5-.1-10.3-1.6-10.3-1.6s-6.9-6.7-7.6-7.4c-.3-.3-.6-.4-1-.4l-5.3 108.2 37.7-8.2S95.7 28.8 95.6 28.2c-.1-.6-.6-1-1.1-1z" fill="#5E8E3E"/>
    <path d="M60.2 42.7l-4.9 14.5s-4.3-2.3-9.6-2.3c-7.7 0-8.1 4.8-8.1 6.1 0 6.6 17.4 9.2 17.4 24.7 0 12.2-7.8 20.1-18.3 20.1-12.6 0-19-7.8-19-7.8l3.4-11.1s6.6 5.7 12.2 5.7c3.7 0 5.2-2.9 5.2-5 0-8.7-14.3-9.1-14.3-23.3C24.2 51.4 34 38.2 50 38.2c6.2 0 10.2 2.5 10.2 2.5v2z" fill="#FFF"/>
  </svg>
);

const SlackLogo = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 127 127" fill="none">
    <path d="M27.2 80c0 7.3-5.9 13.2-13.2 13.2C6.7 93.2.8 87.3.8 80c0-7.3 5.9-13.2 13.2-13.2h13.2V80z" fill="#E01E5A"/>
    <path d="M33.9 80c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2v33c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V80z" fill="#E01E5A"/>
    <path d="M47.1 27.2c-7.3 0-13.2-5.9-13.2-13.2C33.9 6.7 39.8.8 47.1.8c7.3 0 13.2 5.9 13.2 13.2v13.2H47.1z" fill="#36C5F0"/>
    <path d="M47.1 33.9c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H14c-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h33.1z" fill="#36C5F0"/>
    <path d="M99.9 47.1c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H99.9V47.1z" fill="#2EB67D"/>
    <path d="M93.2 47.1c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V14c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2v33.1z" fill="#2EB67D"/>
    <path d="M80 99.9c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V99.9H80z" fill="#ECB22E"/>
    <path d="M80 93.2c-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h33.1c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H80z" fill="#ECB22E"/>
  </svg>
);

const GorgiasLogo = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="7" fill="#1F3D99"/>
    <path d="M8 12.5C8 10.567 9.567 9 11.5 9h9c1.933 0 3.5 1.567 3.5 3.5v4c0 1.933-1.567 3.5-3.5 3.5H13l-3 3v-3h-.5A1.5 1.5 0 018 18.5v-6z" fill="#fff"/>
  </svg>
);

const INTEGRATIONS_DATA = [
  { id: "shopify", name: "Shopify", Logo: ShopifyLogo, tagline: "Your storefront, orders, customers, and products", capabilities: ["Search and view all orders, customers, and products", "Create discount codes and run promotions", "Update pricing, inventory, and product details", "Analyze sales trends and customer behavior", "Process refunds and manage fulfillment"] },
  { id: "slack", name: "Slack", Logo: SlackLogo, tagline: "Team messages, channels, and conversations", capabilities: ["Search across all channels and DMs", "Send messages and post updates to channels", "Summarize threads and key conversations", "Create channels and manage workflows", "Post automated reports and digests"] },
  { id: "gorgias", name: "Gorgias", Logo: GorgiasLogo, tagline: "Support tickets, customer issues, and CX insights", capabilities: ["View and search all support tickets", "Draft and send customer responses", "Analyze ticket trends and common issues", "Escalate and reassign tickets to team", "Generate satisfaction reports and CX insights"] },
];

const DEFAULT_AGENTS = [
  { id: "a1", name: "Morning CX Digest", schedule: "Weekdays · 7:00 AM", tools: ["gorgias", "slack"], desc: "Scans overnight tickets, surfaces top issues, and posts a digest to Slack.", active: true, lastRun: "Today, 7:00 AM", lastOutput: "23 new tickets overnight (↑12%). Top: shipping delays on spring collection (14 tickets). 3 urgent flagged. Rec: proactive shipping update to affected customers." },
  { id: "a2", name: "Weekly Sales Pulse", schedule: "Mondays · 8:00 AM", tools: ["shopify", "slack"], desc: "Compiles revenue, top products, and conversion metrics from the past week.", active: true, lastRun: "Monday, 8:00 AM", lastOutput: "Revenue: $47.2K (↑8% WoW). Top seller: Summer Linen Set (142 units). Conversion: 3.2%. New customers: 89. Repeat rate: 34%." },
  { id: "a3", name: "Refund Monitor", schedule: "Every 2 hours", tools: ["shopify", "gorgias"], desc: "Watches for refund volume spikes and pulls related support context.", active: false, lastRun: "2 hours ago", lastOutput: "No anomalies. Current refund rate: 2.1% (within normal range)." },
];

const SCHEDULE_OPTIONS = ["Every hour", "Every 2 hours", "Every 6 hours", "Daily · 7:00 AM", "Daily · 9:00 AM", "Weekdays · 7:00 AM", "Weekdays · 9:00 AM", "Mondays · 8:00 AM", "Weekly · Friday 5:00 PM"];

/* ── Task Cards for Empty State ────────── */
const TASK_CARDS = [
  { icon: "📊", title: "CX Health Check", desc: "Scan support tickets, surface trends, and get actionable recommendations", prompt: "Give me a full CX health check. Scan Gorgias for this week's ticket trends, surface the biggest issues, and recommend specific actions I can take right now.", tools: ["gorgias"] },
  { icon: "💰", title: "Sales Overview", desc: "Pull revenue, top products, and conversion data from your store", prompt: "Pull a sales overview from Shopify. Show me this week's revenue, top-selling products, conversion rate, and any notable changes compared to last week.", tools: ["shopify"] },
  { icon: "📣", title: "Team Pulse", desc: "Summarize what's happening across Slack channels", prompt: "Summarize what's happening across our main Slack channels today. Surface any blockers, decisions made, and things that need my attention.", tools: ["slack"] },
  { icon: "🔥", title: "Fire Drill", desc: "Cross-check support spikes against orders and team chatter", prompt: "Run a fire drill check: are there any spikes in Gorgias tickets that correlate with specific Shopify orders or product issues? Cross-reference with Slack to see if the team is aware.", tools: ["gorgias", "shopify", "slack"] },
  { icon: "✉️", title: "Draft Customer Response", desc: "Write a reply to a tricky support ticket with full context", prompt: "Find the most urgent unresolved Gorgias ticket and draft a thoughtful customer response. Pull in any relevant order data from Shopify to give context.", tools: ["gorgias", "shopify"] },
  { icon: "📈", title: "Weekly Report", desc: "Generate a full business report for leadership", prompt: "Generate a weekly business report covering: Shopify revenue and top products, Gorgias ticket volume and resolution time, and any notable Slack discussions. Format it for leadership.", tools: ["shopify", "gorgias", "slack"] },
];

/* ── Shared Components ─────────────────── */
function ToolPill({ id, small }) {
  const t = INTEGRATIONS_DATA.find(i => i.id === id);
  if (!t) return null;
  return (
    <span className={small ? "tool-pill-sm" : "tool-pill"}>
      <t.Logo size={small ? 11 : 13} /> {t.name}
    </span>
  );
}

function StatusDot({ active, size = 6 }) {
  return <div style={{ width: size, height: size, borderRadius: 99, background: active ? "#22c55e" : "#ddd", flexShrink: 0 }} />;
}

/* ── Thinking / Steps Component ────────── */
function ThinkingSteps({ steps, done }) {
  return (
    <div className="steps-wrap">
      {steps.map((s, i) => {
        const isLast = i === steps.length - 1;
        const isActive = isLast && !done;
        return (
          <div key={i} className="step-row">
            <div className={`step-dot ${isActive ? "step-dot-active" : "step-dot-done"}`}>
              {isActive ? <span className="step-spinner" /> : "✓"}
            </div>
            <div className="step-text">
              <span className="step-label">{s.label}</span>
              {s.tool && <ToolPill id={s.tool} small />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Action Card in Response ───────────── */
function ActionCard({ icon, text, subtext, onClick, done }) {
  return (
    <button className={`action-card ${done ? "action-card-done" : ""}`} onClick={onClick}>
      <div className="action-card-left">
        <span className="action-card-icon">{done ? "✓" : icon}</span>
        <div>
          <div className="action-card-text">{text}</div>
          {subtext && <div className="action-card-sub">{subtext}</div>}
        </div>
      </div>
      {!done && <span className="action-card-arrow">→</span>}
    </button>
  );
}

/* ── API Chat Hook ─────────────────────── */
function useChat(connectedTools) {
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [steps, setSteps] = useState([]);

  const toolNames = connectedTools.map(id => INTEGRATIONS_DATA.find(i => i.id === id)?.name).filter(Boolean).join(", ");

  const send = useCallback(async (text) => {
    const userMsg = { role: "user", content: text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setStreaming(true);

    // Simulate tool steps
    const mentionedTools = connectedTools.filter(id => {
      const name = INTEGRATIONS_DATA.find(i => i.id === id)?.name.toLowerCase() || "";
      return text.toLowerCase().includes(name) || text.toLowerCase().includes("cx") || text.toLowerCase().includes("sales") || text.toLowerCase().includes("support") || text.toLowerCase().includes("team") || text.toLowerCase().includes("report") || text.toLowerCase().includes("check") || text.toLowerCase().includes("overview") || text.toLowerCase().includes("fire") || text.toLowerCase().includes("draft");
    });
    const toolsToUse = mentionedTools.length > 0 ? mentionedTools : connectedTools;

    const stepSequence = [
      { label: "Understanding your request", tool: null },
      ...toolsToUse.map(t => ({ label: `Pulling data from ${INTEGRATIONS_DATA.find(i => i.id === t)?.name}`, tool: t })),
      { label: "Analyzing and preparing response", tool: null },
    ];

    setSteps([stepSequence[0]]);
    for (let i = 1; i < stepSequence.length; i++) {
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
      setSteps(prev => [...prev, stepSequence[i]]);
    }

    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are Orchestra, an AI business copilot. Connected tools: ${toolNames}. 

Your responses should be structured and actionable. Use this format:
- Start with a brief summary paragraph
- Use **bold** for key metrics and findings
- End with 2-4 specific, concrete actions you can take, each starting with → 

Be concise and direct. Sound like a sharp coworker giving a briefing, not a chatbot. If you reference data you'd pull from tools, present it as if you have it with realistic example numbers.`,
          messages: newHistory.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await resp.json();
      const responseText = data.content?.map(b => b.text || "").join("") || "Something went wrong. Please try again.";

      // Parse actions from response (lines starting with →)
      const lines = responseText.split("\n");
      const bodyLines = [];
      const actions = [];
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith("→")) {
          actions.push(trimmed.replace(/^→\s*/, ""));
        } else {
          bodyLines.push(line);
        }
      });

      setMessages([...newHistory, {
        role: "assistant",
        content: bodyLines.join("\n").trim(),
        tools: toolsToUse,
        actions,
        steps: stepSequence,
      }]);
    } catch (err) {
      setMessages([...newHistory, { role: "assistant", content: "Connection error. Please try again.", tools: [], actions: [], steps: [] }]);
    }
    setStreaming(false);
    setSteps([]);
  }, [messages, connectedTools, toolNames]);

  return { messages, streaming, send, steps, setMessages };
}

/* ═══════════ ONBOARDING ═══════════ */
function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [connected, setConnected] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const [org, setOrg] = useState("");

  const doConnect = (id) => { setConnecting(id); setTimeout(() => { setConnected(p => ({ ...p, [id]: true })); setConnecting(null); }, 1100); };
  const count = Object.keys(connected).length;

  return (
    <div className="page-center">
      {step === 0 && (
        <div className="fade-in" style={{ maxWidth: 380, width: "100%", textAlign: "center" }}>
          <div className="logo-mark">orchestra</div>
          <h1 className="hero-title" style={{ marginTop: 0 }}>Your business,<br/>one conversation away.</h1>
          <p className="hero-sub">Connect your tools. Delegate work. Get answers.</p>
          <input value={org} onChange={e => setOrg(e.target.value)} onKeyDown={e => e.key === "Enter" && org.trim() && setStep(1)} placeholder="Your company name" className="line-input" />
          <button disabled={!org.trim()} onClick={() => setStep(1)} className="btn-primary" style={{ width: "100%", opacity: org.trim() ? 1 : 0.12 }}>Continue</button>
        </div>
      )}
      {step === 1 && (
        <div className="fade-in" style={{ maxWidth: 480, width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <p className="step-tag">Step 1 of 2</p>
            <h1 className="hero-title" style={{ fontSize: 22, marginTop: 0 }}>Connect your tools</h1>
            <p className="hero-sub" style={{ fontSize: 14 }}>Orchestra gets read & write access with guardrails on destructive actions.</p>
          </div>
          <div className="card-list">
            {INTEGRATIONS_DATA.map((tool, i) => {
              const done = connected[tool.id]; const loading = connecting === tool.id; const open = expanded === tool.id;
              return (
                <div key={tool.id} className="card-list-item" style={{ borderTop: i ? "1px solid #f3f3f3" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 4 }}>
                    <div className="logo-box"><tool.Logo size={20} /></div>
                    <div style={{ flex: 1 }}><div className="tool-name">{tool.name}</div><div className="tool-desc">{tool.tagline}</div></div>
                    {done ? <span className="connected-badge">Connected</span> : <button onClick={() => doConnect(tool.id)} disabled={loading} className="btn-outline-sm" style={{ opacity: loading ? 0.4 : 1 }}>{loading ? "Connecting…" : "Connect"}</button>}
                  </div>
                  <button onClick={() => setExpanded(open ? null : tool.id)} className="cap-toggle">{open ? "Hide capabilities ↑" : "What can your agent do? →"}</button>
                  {open && (<div className="fade-in" style={{ paddingBottom: 10 }}>{tool.capabilities.map((c, j) => <div key={j} className="cap-line">{c}</div>)}<div className="cap-note">Anything that modifies data requires your confirmation.</div></div>)}
                </div>
              );
            })}
          </div>
          <button disabled={!count} onClick={() => setStep(2)} className="btn-primary" style={{ width: "100%", marginTop: 24, opacity: count ? 1 : 0.12 }}>Continue with {count} tool{count !== 1 ? "s" : ""}</button>
          <p className="footnote">You can always add more later</p>
        </div>
      )}
      {step === 2 && (
        <div className="fade-in" style={{ maxWidth: 380, width: "100%", textAlign: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#22c55e", fontSize: 20, fontWeight: 700 }}>✓</div>
          <h1 className="hero-title" style={{ fontSize: 22, marginTop: 0 }}>{org} is ready</h1>
          <p className="hero-sub">Connected to {Object.keys(connected).map(id => INTEGRATIONS_DATA.find(i => i.id === id)?.name).join(", ")}.</p>
          <button onClick={() => onComplete(Object.keys(connected))} className="btn-primary" style={{ width: "100%" }}>Open Orchestra</button>
        </div>
      )}
    </div>
  );
}

/* ═══════════ INTEGRATIONS TAB ═══════════ */
function IntegrationsTab({ connected, setConnected }) {
  const [expanded, setExpanded] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const toggle = (id) => { if (connected.includes(id)) { setConnected(connected.filter(x => x !== id)); } else { setConnecting(id); setTimeout(() => { setConnected([...connected, id]); setConnecting(null); }, 1100); } };

  return (
    <div className="content-area fade-in">
      <div style={{ marginBottom: 32 }}><h2 className="section-title">Integrations</h2><p className="section-sub">Manage which tools Orchestra can access.</p></div>
      <div className="card-list">
        {INTEGRATIONS_DATA.map((tool, i) => {
          const isConn = connected.includes(tool.id); const loading = connecting === tool.id; const open = expanded === tool.id;
          return (
            <div key={tool.id} className="card-list-item" style={{ borderTop: i ? "1px solid #f3f3f3" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
                <div className="logo-box"><tool.Logo size={20} /></div>
                <div style={{ flex: 1 }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="tool-name">{tool.name}</span>{isConn && <StatusDot active size={7} />}</div><div className="tool-desc">{tool.tagline}</div></div>
                {isConn ? <button onClick={() => toggle(tool.id)} className="btn-outline-sm" style={{ color: "#ccc", borderColor: "#eee" }}>Disconnect</button> : <button onClick={() => toggle(tool.id)} disabled={loading} className="btn-primary-sm" style={{ opacity: loading ? 0.4 : 1 }}>{loading ? "Connecting…" : "Connect"}</button>}
              </div>
              <button onClick={() => setExpanded(open ? null : tool.id)} className="cap-toggle">{open ? "Hide details ↑" : "View capabilities →"}</button>
              {open && (<div className="fade-in" style={{ paddingBottom: 10 }}>{tool.capabilities.map((c, j) => <div key={j} className="cap-line">{c}</div>)}<div className="cap-note">Destructive actions always require your confirmation first.</div></div>)}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 40, padding: "20px 0", borderTop: "1px solid #f3f3f3" }}><p className="section-sub" style={{ fontSize: 13 }}>More integrations coming soon — Salesforce, HubSpot, Zendesk, Stripe, and more.</p></div>
    </div>
  );
}

/* ═══════════ NEW AGENT FLOW ═══════════ */
function NewAgentFlow({ connected, onSave, onCancel }) {
  const [name, setName] = useState(""); const [desc, setDesc] = useState(""); const [schedule, setSchedule] = useState(""); const [tools, setTools] = useState([]); const [step, setStep] = useState(0);
  const toggleTool = (id) => setTools(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const avail = INTEGRATIONS_DATA.filter(t => connected.includes(t.id));

  if (step === 0) return (
    <div className="content-area fade-in" style={{ maxWidth: 480 }}>
      <button onClick={onCancel} className="back-btn">← Back</button>
      <h2 className="section-title">New agent</h2>
      <p className="section-sub" style={{ marginBottom: 28 }}>Describe what this agent should do. It'll run on a schedule and report back.</p>
      <div style={{ marginBottom: 20 }}><label className="field-label">Name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Morning CX Digest" className="field-input" /></div>
      <div style={{ marginBottom: 20 }}><label className="field-label">Instructions</label><textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe in plain English what you want this agent to do…" className="field-textarea" rows={4} /></div>
      <button disabled={!name.trim() || !desc.trim()} onClick={() => setStep(1)} className="btn-primary" style={{ opacity: name.trim() && desc.trim() ? 1 : 0.12 }}>Next</button>
    </div>
  );

  return (
    <div className="content-area fade-in" style={{ maxWidth: 480 }}>
      <button onClick={() => setStep(0)} className="back-btn">← Back</button>
      <h2 className="section-title">Configure {name}</h2>
      <div style={{ marginBottom: 24 }}>
        <label className="field-label">Tools</label>
        <div className="card-list" style={{ marginTop: 8 }}>
          {avail.map((tool, i) => { const sel = tools.includes(tool.id); return (
            <div key={tool.id} onClick={() => toggleTool(tool.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer", background: sel ? "#fafffe" : "#fff", borderTop: i ? "1px solid #f5f5f5" : "none" }}>
              <div style={{ width: 18, height: 18, borderRadius: 5, border: sel ? "none" : "1.5px solid #ddd", background: sel ? "#111" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{sel && "✓"}</div>
              <div className="logo-box" style={{ width: 30, height: 30 }}><tool.Logo size={16} /></div>
              <span style={{ fontSize: 14, fontWeight: 550, color: "#111" }}>{tool.name}</span>
            </div>
          ); })}
        </div>
      </div>
      <div style={{ marginBottom: 28 }}>
        <label className="field-label">Schedule</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {SCHEDULE_OPTIONS.map(s => <button key={s} onClick={() => setSchedule(s)} className={`schedule-chip ${schedule === s ? "schedule-chip-active" : ""}`}>{s}</button>)}
        </div>
      </div>
      <button disabled={!tools.length || !schedule} onClick={() => onSave({ id: "a" + Date.now(), name, desc, schedule, tools, active: true, lastRun: "Not yet", lastOutput: "Agent created. Will run on next scheduled time." })} className="btn-primary" style={{ opacity: tools.length && schedule ? 1 : 0.12 }}>Create agent</button>
    </div>
  );
}

/* ═══════════ AGENTS TAB ═══════════ */
function AgentsTab({ connected, agents, setAgents }) {
  const [view, setView] = useState("list"); const [selected, setSelected] = useState(null);

  if (view === "new") return <NewAgentFlow connected={connected} onCancel={() => setView("list")} onSave={(a) => { setAgents(p => [a, ...p]); setView("list"); }} />;

  if (view === "detail" && selected) return (
    <div className="content-area fade-in" style={{ maxWidth: 520 }}>
      <button onClick={() => { setView("list"); setSelected(null); }} className="back-btn">← Back</button>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>{selected.name}</h2>
        <span className={selected.active ? "status-active" : "status-paused"}>{selected.active ? "Active" : "Paused"}</span>
      </div>
      <p style={{ fontSize: 14, color: "#999", lineHeight: 1.6, margin: "0 0 24px" }}>{selected.desc}</p>
      <div className="meta-row">
        <div><div className="meta-label">Schedule</div><div className="meta-val">{selected.schedule}</div></div>
        <div><div className="meta-label">Last run</div><div className="meta-val">{selected.lastRun}</div></div>
        <div><div className="meta-label">Tools</div><div style={{ display: "flex", gap: 4, marginTop: 5 }}>{selected.tools.map(t => <ToolPill key={t} id={t} small />)}</div></div>
      </div>
      <div style={{ marginTop: 24 }}><div className="meta-label">Latest output</div><div className="output-box">{selected.lastOutput}</div></div>
      <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
        <button className="btn-primary">Run now</button>
        <button onClick={() => { setAgents(p => p.map(a => a.id === selected.id ? { ...a, active: !a.active } : a)); setSelected(s => ({ ...s, active: !s.active })); }} className="btn-outline">{selected.active ? "Pause" : "Activate"}</button>
        <button onClick={() => { setAgents(p => p.filter(a => a.id !== selected.id)); setView("list"); setSelected(null); }} className="btn-outline" style={{ color: "#e55", borderColor: "#fdd" }}>Delete</button>
      </div>
    </div>
  );

  return (
    <div className="content-area fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div><h2 className="section-title">Agents</h2><p className="section-sub">Automations that run on autopilot.</p></div>
        <button onClick={() => setView("new")} className="btn-primary">New agent</button>
      </div>
      {agents.length === 0 ? <div style={{ textAlign: "center", padding: "60px 0", color: "#ccc" }}><p style={{ fontSize: 14 }}>No agents yet.</p></div> : (
        <div className="card-list">{agents.map((a, i) => (
          <div key={a.id} onClick={() => { setSelected(a); setView("detail"); }} className="card-list-item" style={{ borderTop: i ? "1px solid #f3f3f3" : "none", cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}><StatusDot active={a.active} /><span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{a.name}</span></div>
              <span style={{ fontSize: 12, color: "#d5d5d5" }}>{a.schedule}</span>
            </div>
            <p style={{ fontSize: 13, color: "#aaa", margin: "0 0 8px", lineHeight: 1.5, paddingLeft: 15 }}>{a.desc}</p>
            <div style={{ display: "flex", gap: 4, paddingLeft: 15 }}>{a.tools.map(t => <ToolPill key={t} id={t} small />)}</div>
          </div>
        ))}</div>
      )}
    </div>
  );
}

/* ═══════════ CHAT TAB — COWORK STYLE ═══════════ */
function ChatTab({ connected }) {
  const { messages, streaming, send, steps } = useChat(connected);
  const [input, setInput] = useState("");
  const [completedActions, setCompletedActions] = useState({});
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, streaming, steps]);

  const submit = () => { if (input.trim() && !streaming) { send(input.trim()); setInput(""); } };

  const markAction = (msgIdx, actIdx) => {
    setCompletedActions(p => ({ ...p, [`${msgIdx}-${actIdx}`]: true }));
  };

  return (
    <div className="chat-wrap">
      <div className="chat-scroll">
        {/* ── EMPTY STATE: Cowork-style task cards ── */}
        {!messages.length && !streaming && (
          <div className="fade-in" style={{ paddingTop: "6vh" }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <h2 style={{ fontSize: 22, fontWeight: 400, color: "#111", margin: "0 0 6px", fontFamily: "var(--serif)" }}>What should we work on?</h2>
              <p style={{ color: "#c0c0c0", fontSize: 14, margin: 0 }}>Pick a task or describe what you need.</p>
            </div>

            <div className="task-grid">
              {TASK_CARDS.filter(tc => tc.tools.some(t => connected.includes(t))).map((tc, i) => (
                <button key={i} className="task-card" onClick={() => { setInput(tc.prompt); }}>
                  <div className="task-card-icon">{tc.icon}</div>
                  <div className="task-card-title">{tc.title}</div>
                  <div className="task-card-desc">{tc.desc}</div>
                  <div className="task-card-tools">
                    {tc.tools.filter(t => connected.includes(t)).map(t => <ToolPill key={t} id={t} small />)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── MESSAGES ── */}
        {messages.map((m, i) => (
          <div key={i} className={`msg-row ${m.role === "user" ? "msg-row-user" : "msg-row-ai"}`}>
            {m.role === "user" ? (
              <div className="bubble-user">{m.content}</div>
            ) : (
              <div className="response-block fade-in">
                {/* Steps taken */}
                {m.steps?.length > 0 && (
                  <ThinkingSteps steps={m.steps} done={true} />
                )}

                {/* Tool pills */}
                {m.tools?.length > 0 && (
                  <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
                    {m.tools.map(t => <ToolPill key={t} id={t} small />)}
                  </div>
                )}

                {/* Body text */}
                <div className="response-body">
                  {m.content.split(/(\*\*.*?\*\*)/g).map((p, j) =>
                    p.startsWith("**") && p.endsWith("**")
                      ? <strong key={j} style={{ fontWeight: 650, color: "#111" }}>{p.slice(2, -2)}</strong>
                      : <span key={j}>{p}</span>
                  )}
                </div>

                {/* Action cards */}
                {m.actions?.length > 0 && (
                  <div className="actions-section">
                    <div className="actions-label">Suggested actions</div>
                    {m.actions.map((a, ai) => (
                      <ActionCard
                        key={ai}
                        icon="⚡"
                        text={a}
                        done={completedActions[`${i}-${ai}`]}
                        onClick={() => {
                          if (!completedActions[`${i}-${ai}`]) {
                            markAction(i, ai);
                            send(`Do this: ${a}`);
                          }
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* ── STREAMING / THINKING STATE ── */}
        {streaming && (
          <div className="msg-row msg-row-ai fade-in">
            <div className="response-block">
              <ThinkingSteps steps={steps} done={false} />
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* ── INPUT ── */}
      <div className="input-area">
        <div className="input-row">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} placeholder="Describe what you need…" className="text-input" disabled={streaming} />
          <button onClick={submit} className="send-btn" style={{ opacity: input.trim() && !streaming ? 1 : 0.1 }}>↑</button>
        </div>
        <p className="input-hint">
          {connected.map(id => INTEGRATIONS_DATA.find(i => i.id === id)?.name).join(" · ")} connected — destructive actions require approval
        </p>
      </div>
    </div>
  );
}

/* ═══════════ MAIN APP ═══════════ */
function MainApp({ initialConnected }) {
  const [tab, setTab] = useState("chat");
  const [connected, setConnected] = useState(initialConnected);
  const [agents, setAgents] = useState(DEFAULT_AGENTS);
  const tabs = ["Chat", "Agents", "Integrations"];

  return (
    <div className="app-shell">
      <header className="app-header">
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span className="header-logo">orchestra</span>
          <nav className="header-nav">
            {tabs.map(t => { const k = t.toLowerCase(); return <button key={k} onClick={() => setTab(k)} className={`nav-btn ${tab === k ? "nav-active" : ""}`}>{t}</button>; })}
          </nav>
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {connected.map(id => { const t = INTEGRATIONS_DATA.find(i => i.id === id); return t ? <div key={id} title={t.name} className="header-icon"><t.Logo size={14} /></div> : null; })}
        </div>
      </header>
      {tab === "chat" && <ChatTab connected={connected} />}
      {tab === "agents" && <AgentsTab connected={connected} agents={agents} setAgents={setAgents} />}
      {tab === "integrations" && <IntegrationsTab connected={connected} setConnected={setConnected} />}
    </div>
  );
}

/* ═══════════ ROOT ═══════════ */
export default function App() {
  const [ready, setReady] = useState(false);
  const [connected, setConnected] = useState([]);
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      {ready ? <MainApp initialConnected={connected} /> : <Onboarding onComplete={(c) => { setConnected(c); setReady(true); }} />}
    </>
  );
}

/* ═══════════ GLOBAL CSS ═══════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Newsreader:ital,wght@0,400;0,500;0,600;1,400&display=swap');
  :root { --sans: 'Sora', -apple-system, BlinkMacSystemFont, sans-serif; --serif: 'Newsreader', Georgia, serif; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: var(--sans); -webkit-font-smoothing: antialiased; background: #fff; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%,80%,100% { opacity: 0.18; } 40% { opacity: 0.65; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  .fade-in { animation: fadeIn 0.35s ease; }
  input::placeholder, textarea::placeholder { color: #ccc; }

  /* Page */
  .page-center { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #fff; font-family: var(--sans); padding: 24px; }
  .app-shell { min-height: 100vh; background: #fff; display: flex; flex-direction: column; font-family: var(--sans); }
  .content-area { max-width: 640px; width: 100%; margin: 0 auto; padding: 28px 20px; }

  /* Logo */
  .logo-mark { font-size: 14px; letter-spacing: 5px; color: #111; font-weight: 600; text-transform: lowercase; margin-bottom: 36px; font-family: var(--sans); }
  .header-logo { font-size: 12px; font-weight: 600; letter-spacing: 4px; color: #111; text-transform: lowercase; font-family: var(--sans); }

  /* Typography */
  .hero-title { font-size: 26px; font-weight: 400; color: #111; font-family: var(--serif); line-height: 1.3; margin-bottom: 10px; }
  .hero-sub { font-size: 14.5px; color: #aaa; line-height: 1.55; margin-bottom: 32px; }
  .step-tag { font-size: 10px; font-weight: 600; color: #ccc; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 14px; }
  .section-title { font-size: 20px; font-weight: 400; font-family: var(--serif); color: #111; margin-bottom: 4px; }
  .section-sub { color: #c0c0c0; font-size: 13.5px; margin-top: 2px; }
  .footnote { font-size: 12px; color: #d5d5d5; text-align: center; margin-top: 10px; }

  /* Inputs */
  .line-input { width: 100%; padding: 13px 0; border: none; border-bottom: 1.5px solid #eee; font-size: 15px; font-family: var(--sans); outline: none; text-align: center; color: #111; background: transparent; margin-bottom: 24px; }
  .field-label { font-size: 11px; font-weight: 600; color: #bbb; text-transform: uppercase; letter-spacing: 0.8px; display: block; margin-bottom: 8px; }
  .field-input { width: 100%; padding: 11px 14px; border: 1px solid #eee; border-radius: 9px; font-size: 14px; font-family: var(--sans); outline: none; color: #111; }
  .field-input:focus { border-color: #ccc; }
  .field-textarea { width: 100%; padding: 11px 14px; border: 1px solid #eee; border-radius: 9px; font-size: 14px; font-family: var(--sans); outline: none; color: #111; resize: vertical; line-height: 1.55; }

  /* Buttons */
  .btn-primary { padding: 11px 22px; border-radius: 9px; background: #111; color: #fff; border: none; font-size: 13px; font-weight: 600; cursor: pointer; font-family: var(--sans); transition: opacity 0.15s; }
  .btn-primary:hover { opacity: 0.85; }
  .btn-primary-sm { padding: 7px 16px; border-radius: 8px; background: #111; color: #fff; border: none; font-size: 12.5px; font-weight: 600; cursor: pointer; font-family: var(--sans); }
  .btn-outline { padding: 11px 22px; border-radius: 9px; background: #fff; color: #555; border: 1px solid #e0e0e0; font-size: 13px; font-weight: 550; cursor: pointer; font-family: var(--sans); }
  .btn-outline:hover { border-color: #ccc; }
  .btn-outline-sm { padding: 7px 16px; border-radius: 8px; background: transparent; color: #111; border: 1px solid #ddd; font-size: 12.5px; font-weight: 550; cursor: pointer; font-family: var(--sans); }
  .back-btn { background: none; border: none; color: #ccc; font-size: 13px; cursor: pointer; font-family: var(--sans); padding: 0; margin-bottom: 20px; font-weight: 450; }
  .back-btn:hover { color: #999; }
  .schedule-chip { padding: 7px 14px; border-radius: 99px; border: 1px solid #eee; background: #fff; color: #888; font-size: 12.5px; font-weight: 500; cursor: pointer; font-family: var(--sans); transition: all 0.12s; }
  .schedule-chip-active { border: 1.5px solid #111; background: #111; color: #fff; }

  /* Cards */
  .card-list { border: 1px solid #eee; border-radius: 12px; overflow: hidden; background: #fff; }
  .card-list-item { padding: 16px 20px; }
  .logo-box { width: 36px; height: 36px; border-radius: 9px; background: #fafafa; border: 1px solid #f0f0f0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .tool-name { font-size: 14px; font-weight: 600; color: #111; }
  .tool-desc { font-size: 12.5px; color: #aaa; margin-top: 1px; }
  .connected-badge { font-size: 12px; font-weight: 600; color: #22c55e; }
  .cap-toggle { background: none; border: none; font-size: 11.5px; color: #ccc; cursor: pointer; font-family: var(--sans); padding: 2px 0 6px; font-weight: 500; }
  .cap-toggle:hover { color: #999; }
  .cap-line { font-size: 12.5px; color: #777; padding: 3px 0 3px 12px; border-left: 2px solid #f0f0f0; margin-bottom: 3px; line-height: 1.45; }
  .cap-note { font-size: 11.5px; color: #ccc; margin-top: 8px; font-style: italic; padding-left: 12px; }

  /* Status */
  .status-active { font-size: 11px; font-weight: 600; padding: 2px 9px; border-radius: 99px; background: #f0fdf4; color: #16a34a; }
  .status-paused { font-size: 11px; font-weight: 600; padding: 2px 9px; border-radius: 99px; background: #f5f5f5; color: #bbb; }

  /* Meta */
  .meta-row { display: flex; gap: 32px; padding: 18px 0; border-top: 1px solid #f3f3f3; border-bottom: 1px solid #f3f3f3; }
  .meta-label { font-size: 10.5px; font-weight: 600; color: #ccc; text-transform: uppercase; letter-spacing: 0.8px; }
  .meta-val { font-size: 13.5px; color: #555; font-weight: 500; margin-top: 5px; }
  .output-box { background: #fafafa; border: 1px solid #f0f0f0; border-radius: 10px; padding: 14px 16px; font-size: 13.5px; color: #666; line-height: 1.6; margin-top: 8px; }

  /* Tool pills */
  .tool-pill { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; padding: 3px 10px 3px 7px; border-radius: 6px; background: rgba(0,0,0,0.04); color: #666; font-weight: 550; }
  .tool-pill-sm { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; padding: 2px 7px 2px 5px; border-radius: 5px; background: rgba(0,0,0,0.04); color: #666; font-weight: 550; }

  /* Header */
  .app-header { display: flex; align-items: center; justify-content: space-between; padding: 0 24px; height: 50px; border-bottom: 1px solid #f3f3f3; flex-shrink: 0; }
  .header-nav { display: flex; gap: 2px; }
  .nav-btn { padding: 5px 13px; border-radius: 7px; border: none; font-size: 12.5px; font-weight: 450; color: #bbb; background: transparent; cursor: pointer; font-family: var(--sans); transition: all 0.12s; }
  .nav-btn:hover { color: #888; }
  .nav-active { color: #111 !important; background: #f5f5f5; font-weight: 600; }
  .header-icon { width: 28px; height: 28px; border-radius: 7px; border: 1px solid #f0f0f0; display: flex; align-items: center; justify-content: center; cursor: pointer; }
  .header-icon:hover { border-color: #ddd; }

  /* ── TASK CARDS (Cowork-style empty state) ── */
  .task-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    max-width: 560px;
    margin: 0 auto;
    padding: 0 8px;
  }
  .task-card {
    background: #fff;
    border: 1px solid #eeeceb;
    border-radius: 14px;
    padding: 20px 18px;
    text-align: left;
    cursor: pointer;
    font-family: var(--sans);
    transition: all 0.15s;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .task-card:hover {
    border-color: #d5d3d0;
    background: #fdfcfb;
  }
  .task-card-icon { font-size: 22px; margin-bottom: 6px; }
  .task-card-title { font-size: 14px; font-weight: 600; color: #111; }
  .task-card-desc { font-size: 12.5px; color: #aaa; line-height: 1.45; margin-bottom: 8px; }
  .task-card-tools { display: flex; gap: 4px; flex-wrap: wrap; }

  /* ── CHAT ── */
  .chat-wrap { flex: 1; display: flex; flex-direction: column; max-width: 700px; width: 100%; margin: 0 auto; }
  .chat-scroll { flex: 1; overflow-y: auto; padding: 24px 16px 16px; }

  .msg-row { margin-bottom: 20px; }
  .msg-row-user { display: flex; justify-content: flex-end; }
  .msg-row-ai { display: flex; justify-content: flex-start; }

  .bubble-user {
    max-width: 80%;
    font-size: 14px;
    line-height: 1.6;
    color: #fff;
    background: #111;
    padding: 12px 16px;
    border-radius: 16px 16px 4px 16px;
  }

  /* AI Response: full-width card, not a bubble */
  .response-block {
    width: 100%;
    background: #fafafa;
    border: 1px solid #f0f0f0;
    border-radius: 14px;
    padding: 20px;
  }
  .response-body {
    font-size: 14px;
    line-height: 1.7;
    color: #444;
    white-space: pre-wrap;
  }

  /* Steps / Thinking */
  .steps-wrap {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
    padding-bottom: 14px;
    border-bottom: 1px solid #f0f0f0;
  }
  .step-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .step-dot {
    width: 20px;
    height: 20px;
    border-radius: 99px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    flex-shrink: 0;
  }
  .step-dot-done {
    background: #f0fdf4;
    color: #22c55e;
  }
  .step-dot-active {
    background: #f5f5f5;
    color: transparent;
    position: relative;
  }
  .step-spinner {
    width: 12px;
    height: 12px;
    border: 2px solid #e0e0e0;
    border-top-color: #888;
    border-radius: 99px;
    animation: spin 0.8s linear infinite;
    display: block;
  }
  .step-text {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .step-label {
    font-size: 12.5px;
    color: #888;
    font-weight: 450;
  }

  /* Action cards */
  .actions-section {
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid #f0f0f0;
  }
  .actions-label {
    font-size: 10.5px;
    font-weight: 600;
    color: #ccc;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 10px;
  }
  .action-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 12px 14px;
    background: #fff;
    border: 1px solid #eee;
    border-radius: 10px;
    cursor: pointer;
    font-family: var(--sans);
    margin-bottom: 6px;
    transition: all 0.12s;
    text-align: left;
  }
  .action-card:hover { border-color: #d0d0d0; background: #fefefe; }
  .action-card-done { opacity: 0.5; pointer-events: none; background: #f9fef9; border-color: #e0f0e0; }
  .action-card-left { display: flex; align-items: flex-start; gap: 10px; }
  .action-card-icon { font-size: 14px; margin-top: 1px; flex-shrink: 0; }
  .action-card-text { font-size: 13px; color: #333; font-weight: 500; line-height: 1.45; }
  .action-card-sub { font-size: 11.5px; color: #aaa; margin-top: 2px; }
  .action-card-arrow { font-size: 14px; color: #ccc; flex-shrink: 0; }

  /* Input */
  .input-area { padding: 0 16px 20px; }
  .input-row { display: flex; align-items: center; border: 1px solid #e8e8e8; border-radius: 12px; padding: 3px 5px 3px 16px; transition: border-color 0.15s; }
  .input-row:focus-within { border-color: #ccc; }
  .text-input { flex: 1; border: none; outline: none; font-size: 14px; font-family: var(--sans); padding: 11px 0; background: transparent; color: #111; }
  .send-btn { width: 32px; height: 32px; border-radius: 9px; background: #111; color: #fff; border: none; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: opacity 0.12s; }
  .input-hint { font-size: 11px; color: #d0d0d0; text-align: center; margin-top: 8px; }
`;
