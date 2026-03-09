import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════
   ORCHESTRA — AI Business Orchestration Hub
   Profound-style dashboard UI
   ═══════════════════════════════════════════ */

const WORKER_URL = import.meta.env.VITE_WORKER_URL || "http://localhost:8787";

/* ── SVG Logos ─────────────────────────── */
const IntercomLogo = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="7" fill="#286EFA" />
    <path d="M10 12v6M13 10v10M16 9v12M19 10v10M22 12v6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M9 22s3 2 7 2 7-2 7-2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none" />
  </svg>
);

const MailchimpLogo = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="7" fill="#FFE01B" />
    <text x="16" y="22" textAnchor="middle" fontSize="16" fontWeight="700" fill="#241C15">M</text>
  </svg>
);

const DatabaseLogo = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="7" fill="#6366F1" />
    <ellipse cx="16" cy="11" rx="7" ry="3" stroke="#fff" strokeWidth="1.8" fill="none" />
    <path d="M9 11v10c0 1.66 3.13 3 7 3s7-1.34 7-3V11" stroke="#fff" strokeWidth="1.8" fill="none" />
    <path d="M9 16c0 1.66 3.13 3 7 3s7-1.34 7-3" stroke="#fff" strokeWidth="1.8" fill="none" />
  </svg>
);

const StripeLogo = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="7" fill="#635BFF" />
    <path d="M15.2 12.8c0-.84.7-1.2 1.8-1.2 1.6 0 3.6.5 5.2 1.4V8.2C20.6 7.6 19 7.2 17.4 7.2c-3.8 0-6.4 2-6.4 5.4 0 5.2 7.2 4.4 7.2 6.6 0 1-.8 1.3-2 1.3-1.7 0-3.9-.7-5.6-1.7v4.8c1.9.8 3.8 1.2 5.6 1.2 3.9 0 6.6-1.9 6.6-5.4 0-5.6-7.2-4.6-7.2-6.6h-.4z" fill="#fff" />
  </svg>
);

const SlackLogo = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="7" fill="#4A154B" />
    <path d="M11 18.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm1 0a1.5 1.5 0 013 0v4a1.5 1.5 0 01-3 0v-4z" fill="#E01E5A" />
    <path d="M13.5 11a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 1a1.5 1.5 0 100 3h4a1.5 1.5 0 100-3h-4z" fill="#36C5F0" />
    <path d="M21 13.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm-1 0a1.5 1.5 0 10-3 0v4a1.5 1.5 0 103 0v-4z" fill="#2EB67D" />
    <path d="M18.5 21a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0-1a1.5 1.5 0 100-3h-4a1.5 1.5 0 100 3h4z" fill="#ECB22E" />
  </svg>
);

/* ── Sidebar Icons ───────────────────── */
const IconChat = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3.5A1.5 1.5 0 013.5 2h9A1.5 1.5 0 0114 3.5v7a1.5 1.5 0 01-1.5 1.5H5l-3 2v-2H3.5A1.5 1.5 0 012 10.5v-7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>;
const IconAgent = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M8 4v4l2.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconIntegration = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 2v4H2M10 14v-4h4M2 6l4-4M14 10l-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 2v4h4M6 14v-4H2M14 6l-4-4M2 10l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconSettings = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
const IconSearch = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4"/><path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
const IconChevron = () => <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3 1l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconMenu = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;

const INTEGRATIONS_DATA = [
  {
    id: "intercom",
    name: "Intercom",
    Logo: IntercomLogo,
    tagline: "Customer conversations, contacts, and support insights",
    capabilities: [
      "Search and view all conversations and their messages",
      "Look up contacts and companies by email or name",
      "Reply to conversations and add internal notes",
      "Close, snooze, assign, and tag conversations",
      "Create, update, and merge contacts",
    ],
    setupUrl: "https://app.intercom.com/a/apps/_/developer-hub",
    setupSteps: [
      "Go to Settings → Integrations → Developer Hub",
      "Click your app (or create one) → Authentication tab",
      "Copy the Access Token",
    ],
    fields: [
      { key: "access_token", label: "Access Token", placeholder: "dG9rOk1yX0pv..." },
    ],
  },
  {
    id: "stripe",
    name: "Stripe",
    Logo: StripeLogo,
    tagline: "Payments, subscriptions, invoices, and customer billing",
    capabilities: [
      "List and search customers by email or name",
      "View charges, payment intents, and balance",
      "List subscriptions and filter by status",
      "View invoices and billing history",
      "Browse products and pricing catalog",
    ],
    setupUrl: "https://dashboard.stripe.com/apikeys",
    setupSteps: [
      "Go to Stripe Dashboard → Developers → API keys",
      "Copy your Secret key (starts with sk_live_ or sk_test_)",
      "Use test mode key for testing, live key for production",
    ],
    fields: [
      { key: "api_key", label: "Secret Key", placeholder: "sk_live_..." },
    ],
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    Logo: MailchimpLogo,
    tagline: "Email campaigns, audiences, and marketing analytics",
    capabilities: [
      "View audiences and subscriber lists",
      "List and analyze campaign performance",
      "Search for subscribers by email or name",
      "Create and send email campaigns",
      "Manage segments and subscriber tags",
    ],
    setupUrl: "https://us1.admin.mailchimp.com/account/api/",
    setupSteps: [
      "Go to Account → Extras → API keys",
      "Click Create A Key",
      "Copy the full key (includes datacenter, e.g. abc123-us21)",
    ],
    fields: [
      { key: "api_key", label: "API Key", placeholder: "abc123def456-us21" },
    ],
  },
  {
    id: "slack",
    name: "Slack",
    Logo: SlackLogo,
    tagline: "Team messaging, channels, and notifications",
    capabilities: [
      "List channels and read recent messages",
      "Post messages and reports to channels",
      "Search across all messages",
      "Look up team members and their info",
      "Send agent reports and alerts",
    ],
    setupUrl: "https://api.slack.com/apps",
    setupSteps: [
      "Go to api.slack.com/apps → Create New App → From scratch",
      "Add Bot Token Scopes: channels:read, chat:write, search:read, users:read",
      "Install to workspace → copy the Bot User OAuth Token (xoxb-...)",
    ],
    fields: [
      { key: "bot_token", label: "Bot Token", placeholder: "xoxb-..." },
    ],
  },
  {
    id: "database",
    name: "Database",
    Logo: DatabaseLogo,
    tagline: "Your business data — customers, orders, and products",
    capabilities: [
      "Query any table in your database with natural language",
      "Browse table schemas and discover available data",
      "Insert, update, and delete records",
      "Pull reports, aggregations, and filtered views",
      "Cross-reference data across all integrations",
    ],
    setupUrl: "https://app.planetscale.com",
    setupSteps: [
      "Go to PlanetScale Dashboard → your database → Connect",
      "Select 'General' connection string",
      "Copy the Host, Username, and Password",
    ],
    fields: [
      { key: "host", label: "Host", placeholder: "aws.connect.psdb.cloud" },
      { key: "username", label: "Username", placeholder: "your_username" },
      { key: "password", label: "Password", placeholder: "pscale_pw_...", isPassword: true },
    ],
  },
];

const DEFAULT_AGENTS = [
  { id: "a1", name: "Morning CX Digest", schedule: "Weekdays · 7:00 AM", tools: ["intercom", "mailchimp"], desc: "Scans overnight conversations, surfaces top issues, and compiles engagement data.", active: true, lastRun: "Today, 7:00 AM", lastOutput: "18 new conversations overnight. Top issue: billing questions (7 threads). 3 urgent unresolved. Email campaign 'Spring Sale' at 24% open rate." },
  { id: "a2", name: "Weekly Business Pulse", schedule: "Mondays · 8:00 AM", tools: ["database", "mailchimp"], desc: "Compiles revenue, customer growth, and campaign metrics from the past week.", active: true, lastRun: "Monday, 8:00 AM", lastOutput: "Revenue: $47.2K (+8% WoW). 89 new customers. Campaign 'March Newsletter': 32% open, 4.2% click. Top product: Summer Linen Set." },
  { id: "a3", name: "Conversation Monitor", schedule: "Every 2 hours", tools: ["intercom", "database"], desc: "Watches for conversation volume spikes and cross-references with customer data.", active: false, lastRun: "2 hours ago", lastOutput: "No anomalies. Current conversation rate within normal range." },
];

const SCHEDULE_OPTIONS = ["Every hour", "Every 2 hours", "Every 6 hours", "Daily · 7:00 AM", "Daily · 9:00 AM", "Weekdays · 7:00 AM", "Weekdays · 9:00 AM", "Mondays · 8:00 AM", "Weekly · Friday 5:00 PM"];

const TASK_CARDS = [
  { icon: "📊", title: "CX Health Check", desc: "Scan conversations, surface trends, and get actionable recommendations", prompt: "Give me a full CX health check. Search Intercom for recent conversation trends, surface the biggest issues, and recommend specific actions I can take right now.", tools: ["intercom"] },
  { icon: "💰", title: "Business Overview", desc: "Pull revenue, top customers, and key metrics from your database", prompt: "Pull a business overview from the database. Show me recent revenue, top customers, order trends, and any notable changes.", tools: ["database"] },
  { icon: "📣", title: "Campaign Pulse", desc: "Check how your email campaigns are performing", prompt: "Give me a pulse on our Mailchimp campaigns. Show recent campaign performance, open rates, click rates, and any campaigns that need attention.", tools: ["mailchimp"] },
  { icon: "🔥", title: "Fire Drill", desc: "Cross-check conversation spikes against customer data and campaigns", prompt: "Run a fire drill check: are there spikes in Intercom conversations that correlate with specific customer segments or recent Mailchimp campaigns? Cross-reference with database records.", tools: ["intercom", "database", "mailchimp"] },
  { icon: "✉️", title: "Draft Customer Response", desc: "Write a reply to a tricky conversation with full context", prompt: "Find the most urgent unresolved Intercom conversation and draft a thoughtful response. Pull in any relevant customer data from the database.", tools: ["intercom", "database"] },
  { icon: "📈", title: "Weekly Report", desc: "Generate a full business report for leadership", prompt: "Generate a weekly business report covering: database revenue and top products, Intercom conversation volume and resolution trends, and Mailchimp campaign performance. Format it for leadership.", tools: ["database", "intercom", "mailchimp"] },
  { icon: "💳", title: "Revenue Check", desc: "Check Stripe balance, recent charges, and subscription health", prompt: "Give me a revenue check from Stripe. Show current balance, recent charges, active subscription count, and any failed payments or past-due subscriptions.", tools: ["stripe"] },
  { icon: "🔔", title: "Team Update", desc: "Post a daily summary to your Slack channel", prompt: "Compile a daily business summary from all connected tools and draft a message I can post to our team Slack channel.", tools: ["slack", "intercom", "stripe"] },
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

/* ── API Chat Hook ── */
function useChat(connectedTools, companyName) {
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [steps, setSteps] = useState([]);

  const send = useCallback(async (text) => {
    const userMsg = { role: "user", content: text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setStreaming(true);

    const mentionedTools = connectedTools.filter(id => {
      const name = INTEGRATIONS_DATA.find(i => i.id === id)?.name.toLowerCase() || "";
      return text.toLowerCase().includes(name) || text.toLowerCase().includes("cx") || text.toLowerCase().includes("sales") || text.toLowerCase().includes("support") || text.toLowerCase().includes("campaign") || text.toLowerCase().includes("report") || text.toLowerCase().includes("check") || text.toLowerCase().includes("overview") || text.toLowerCase().includes("fire") || text.toLowerCase().includes("draft") || text.toLowerCase().includes("customer") || text.toLowerCase().includes("subscriber") || text.toLowerCase().includes("audience") || text.toLowerCase().includes("conversation") || text.toLowerCase().includes("database") || text.toLowerCase().includes("query") || text.toLowerCase().includes("revenue");
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
      const resp = await fetch(`${WORKER_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory.map(m => ({ role: m.role, content: m.content })),
          connectedTools,
          companyName: companyName || "",
        }),
      });
      const data = await resp.json();

      if (data.error) {
        setMessages([...newHistory, { role: "assistant", content: `Error: ${data.error}`, tools: [], actions: [], steps: [] }]);
        setStreaming(false);
        setSteps([]);
        return;
      }

      const responseText = data.content?.map(b => b.text || "").join("") || "Something went wrong. Please try again.";

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
      setMessages([...newHistory, { role: "assistant", content: `Connection error: ${err.message}. Make sure the worker is running.`, tools: [], actions: [], steps: [] }]);
    }
    setStreaming(false);
    setSteps([]);
  }, [messages, connectedTools, companyName]);

  return { messages, streaming, send, steps, setMessages };
}

/* ── Integration Status Hook ── */
function useIntegrationStatus() {
  const [status, setStatus] = useState({ intercom: false, mailchimp: false, database: false });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${WORKER_URL}/integrations`);
      const data = await res.json();
      setStatus(data);
    } catch {
      // Worker not running
    }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { status, loading, refresh };
}

/* ═══════════ SIDEBAR ═══════════ */
function Sidebar({ tab, setTab, connected, companyName, collapsed, setCollapsed }) {
  const navItems = [
    { id: "chat", label: "Chat", icon: IconChat, section: "workspace" },
    { id: "agents", label: "Agents", icon: IconAgent, section: "workspace" },
    { id: "integrations", label: "Integrations", icon: IconIntegration, section: "workspace" },
    { id: "settings", label: "Settings", icon: IconSettings, section: "settings" },
  ];

  const workspaceItems = navItems.filter(n => n.section === "workspace");
  const settingsItems = navItems.filter(n => n.section === "settings");

  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo-row">
          <span className="sidebar-logo">🎵</span>
          {!collapsed && <span className="sidebar-logo-text">orchestra</span>}
        </div>
        <button className="sidebar-collapse-btn" onClick={() => setCollapsed(!collapsed)} title={collapsed ? "Expand" : "Collapse"}>
          <IconChevron />
        </button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="sidebar-search">
          <IconSearch />
          <span className="sidebar-search-text">Search</span>
          <kbd className="sidebar-kbd">⌘K</kbd>
        </div>
      )}

      {/* Nav */}
      <div className="sidebar-section">
        {!collapsed && <div className="sidebar-section-label">Workspace</div>}
        {workspaceItems.map(item => (
          <button key={item.id} onClick={() => setTab(item.id)} className={`sidebar-nav-item ${tab === item.id ? "sidebar-nav-active" : ""}`}>
            <item.icon />
            {!collapsed && <span>{item.label}</span>}
            {!collapsed && item.id === "integrations" && connected.length > 0 && (
              <span className="sidebar-badge">{connected.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Connected integrations */}
      {!collapsed && connected.length > 0 && (
        <div className="sidebar-section">
          <div className="sidebar-section-label">Connected</div>
          {connected.map(id => {
            const t = INTEGRATIONS_DATA.find(i => i.id === id);
            if (!t) return null;
            return (
              <div key={id} className="sidebar-integration-row">
                <t.Logo size={14} />
                <span className="sidebar-integration-name">{t.name}</span>
                <StatusDot active size={6} />
              </div>
            );
          })}
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Footer */}
      <div className="sidebar-footer">
        {settingsItems.map(item => (
          <button key={item.id} onClick={() => setTab(item.id)} className={`sidebar-nav-item ${tab === item.id ? "sidebar-nav-active" : ""}`}>
            <item.icon />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
        {!collapsed && (
          <div className="sidebar-user">
            <div className="sidebar-avatar">{(companyName || "O")[0].toUpperCase()}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{companyName || "Orchestra"}</div>
              <div className="sidebar-user-plan">Starter Plan</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

/* ═══════════ ONBOARDING ═══════════ */
function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const [org, setOrg] = useState("");
  const { status, refresh } = useIntegrationStatus();
  const [configuring, setConfiguring] = useState(null);
  const [fieldValues, setFieldValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const connectedIds = Object.entries(status).filter(([, v]) => v).map(([k]) => k);
  const count = connectedIds.length;

  const doSave = async (tool) => {
    setSaving(true);
    setError(null);
    try {
      const credentials = {};
      tool.fields.forEach(f => { credentials[f.key] = fieldValues[f.key] || ""; });
      const res = await fetch(`${WORKER_URL}/integrations/configure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: tool.id, credentials }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setSaving(false); return; }
      await refresh();
      setConfiguring(null);
      setFieldValues({});
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  };

  // Configure view for a specific tool during onboarding
  if (configuring && step === 1) {
    const tool = INTEGRATIONS_DATA.find(t => t.id === configuring);
    return (
      <div className="onboard-page">
        <div className="onboard-container">
          <div className="fade-in" style={{ maxWidth: 480, width: "100%" }}>
            <button onClick={() => { setConfiguring(null); setError(null); setFieldValues({}); }} className="back-btn">← Back to integrations</button>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <div className="logo-box"><tool.Logo size={24} /></div>
              <div>
                <h1 className="page-title" style={{ marginBottom: 2 }}>Connect {tool.name}</h1>
                <p className="page-subtitle">{tool.tagline}</p>
              </div>
            </div>

            <div className="setup-card">
              <div className="setup-card-header">How to get your credentials</div>
              <ol className="setup-steps">
                {tool.setupSteps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
              <a href={tool.setupUrl} target="_blank" rel="noopener noreferrer" className="setup-link">
                Open {tool.name} Dashboard →
              </a>
            </div>

            <div style={{ marginTop: 24 }}>
              {tool.fields.map(f => (
                <div key={f.key} className="form-group">
                  <label className="field-label">{f.label}</label>
                  <input
                    type={f.isPassword ? "password" : "text"}
                    value={fieldValues[f.key] || ""}
                    onChange={e => setFieldValues(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="field-input"
                    style={{ fontFamily: "monospace", fontSize: 13 }}
                  />
                </div>
              ))}
            </div>

            {error && <div className="error-msg">{error}</div>}

            <button
              onClick={() => doSave(tool)}
              disabled={saving || tool.fields.some(f => !fieldValues[f.key]?.trim())}
              className="btn-primary btn-full"
              style={{ marginTop: 8, opacity: saving || tool.fields.some(f => !fieldValues[f.key]?.trim()) ? 0.4 : 1 }}
            >
              {saving ? "Validating & connecting..." : `Connect ${tool.name}`}
            </button>
            <p className="footnote" style={{ marginTop: 12 }}>Your credentials are validated before saving and stored securely.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="onboard-page">
      <div className="onboard-container">
        {step === 0 && (
          <div className="fade-in onboard-step">
            <div className="onboard-logo">🎵</div>
            <h1 className="onboard-title">Your business,<br />one conversation away.</h1>
            <p className="onboard-sub">Connect your tools. Delegate work. Get answers.</p>
            <input value={org} onChange={e => setOrg(e.target.value)} onKeyDown={e => e.key === "Enter" && org.trim() && setStep(1)} placeholder="Your company name" className="onboard-input" />
            <button disabled={!org.trim()} onClick={() => setStep(1)} className="btn-primary btn-full" style={{ opacity: org.trim() ? 1 : 0.12 }}>Continue</button>
          </div>
        )}
        {step === 1 && (
          <div className="fade-in" style={{ maxWidth: 480, width: "100%" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <p className="step-tag">Step 1 of 2</p>
              <h1 className="onboard-title" style={{ fontSize: 22 }}>Connect your tools</h1>
              <p className="onboard-sub" style={{ fontSize: 14 }}>Paste your API keys — Orchestra validates and stores them securely.</p>
            </div>
            <div className="card-list">
              {INTEGRATIONS_DATA.map((tool, i) => {
                const done = status[tool.id]; const open = expanded === tool.id;
                return (
                  <div key={tool.id} className="card-list-item" style={{ borderTop: i ? "1px solid var(--border)" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 4 }}>
                      <div className="logo-box"><tool.Logo size={20} /></div>
                      <div style={{ flex: 1 }}><div className="tool-name">{tool.name}</div><div className="tool-desc">{tool.tagline}</div></div>
                      {done ? <span className="connected-badge">✓ Connected</span> : <button onClick={() => setConfiguring(tool.id)} className="btn-outline-sm">Connect</button>}
                    </div>
                    <button onClick={() => setExpanded(open ? null : tool.id)} className="cap-toggle">{open ? "Hide capabilities ↑" : "What can your agent do? →"}</button>
                    {open && (<div className="fade-in" style={{ paddingBottom: 10 }}>{tool.capabilities.map((c, j) => <div key={j} className="cap-line">{c}</div>)}<div className="cap-note">Anything that modifies data requires your confirmation.</div></div>)}
                  </div>
                );
              })}
            </div>
            <button onClick={() => setStep(2)} className="btn-primary btn-full" style={{ marginTop: 24 }}>Continue{count > 0 ? ` with ${count} tool${count !== 1 ? "s" : ""}` : ""}</button>
            <p className="footnote">You can always add more later in Integrations</p>
          </div>
        )}
        {step === 2 && (
          <div className="fade-in onboard-step">
            <div className="onboard-check">✓</div>
            <h1 className="onboard-title" style={{ fontSize: 22 }}>{org} is ready</h1>
            <p className="onboard-sub">{connectedIds.length > 0 ? `Connected to ${connectedIds.map(id => INTEGRATIONS_DATA.find(i => i.id === id)?.name).filter(Boolean).join(", ")}.` : "No tools connected yet — you can add them later in Integrations."}</p>
            <button onClick={() => onComplete(connectedIds, org)} className="btn-primary btn-full">Open Orchestra</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════ INTEGRATIONS TAB ═══════════ */
function IntegrationsTab({ connected, setConnected }) {
  const [configuring, setConfiguring] = useState(null);
  const [disconnecting, setDisconnecting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldValues, setFieldValues] = useState({});
  const { status, refresh } = useIntegrationStatus();

  useEffect(() => {
    const live = Object.entries(status).filter(([, v]) => v).map(([k]) => k);
    if (JSON.stringify(live.sort()) !== JSON.stringify([...connected].sort())) {
      setConnected(live);
    }
  }, [status, connected, setConnected]);

  const doSave = async (tool) => {
    setSaving(true);
    setError(null);
    try {
      const credentials = {};
      tool.fields.forEach(f => { credentials[f.key] = fieldValues[f.key] || ""; });
      const res = await fetch(`${WORKER_URL}/integrations/configure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: tool.id, credentials }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setSaving(false); return; }
      await refresh();
      setConfiguring(null);
      setFieldValues({});
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  };

  const doDisconnect = async (id) => {
    setDisconnecting(id);
    try {
      await fetch(`${WORKER_URL}/integrations/configure`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: id }),
      });
      await refresh();
      setConnected(prev => prev.filter(x => x !== id));
    } catch { /* noop */ }
    setDisconnecting(null);
  };

  // Setup/configure view for a specific tool
  if (configuring) {
    const tool = INTEGRATIONS_DATA.find(t => t.id === configuring);
    return (
      <div className="main-content fade-in" style={{ maxWidth: 520 }}>
        <button onClick={() => { setConfiguring(null); setError(null); setFieldValues({}); }} className="back-btn">← Back to integrations</button>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <div className="logo-box"><tool.Logo size={24} /></div>
          <div>
            <h1 className="page-title" style={{ marginBottom: 2 }}>Connect {tool.name}</h1>
            <p className="page-subtitle">{tool.tagline}</p>
          </div>
        </div>

        {/* Setup instructions */}
        <div className="setup-card">
          <div className="setup-card-header">How to get your credentials</div>
          <ol className="setup-steps">
            {tool.setupSteps.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
          <a href={tool.setupUrl} target="_blank" rel="noopener noreferrer" className="setup-link">
            Open {tool.name} Dashboard →
          </a>
        </div>

        {/* Credential fields */}
        <div style={{ marginTop: 24 }}>
          {tool.fields.map(f => (
            <div key={f.key} className="form-group">
              <label className="field-label">{f.label}</label>
              <input
                type={f.isPassword ? "password" : "text"}
                value={fieldValues[f.key] || ""}
                onChange={e => setFieldValues(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="field-input"
                style={{ fontFamily: "monospace", fontSize: 13 }}
              />
            </div>
          ))}
        </div>

        {error && <div className="error-msg">{error}</div>}

        <button
          onClick={() => doSave(tool)}
          disabled={saving || tool.fields.some(f => !fieldValues[f.key]?.trim())}
          className="btn-primary btn-full"
          style={{ marginTop: 8, opacity: saving || tool.fields.some(f => !fieldValues[f.key]?.trim()) ? 0.4 : 1 }}
        >
          {saving ? "Validating & connecting..." : `Connect ${tool.name}`}
        </button>
        <p className="footnote" style={{ marginTop: 12 }}>Your credentials are validated before saving and stored encrypted.</p>
      </div>
    );
  }

  return (
    <div className="main-content fade-in">
      <div className="content-header">
        <div>
          <h1 className="page-title">Integrations</h1>
          <p className="page-subtitle">Connect your tools so Orchestra can access your business data.</p>
        </div>
      </div>
      <div className="card-list">
        {INTEGRATIONS_DATA.map((tool, i) => {
          const isConn = status[tool.id];
          return (
            <div key={tool.id} className="card-list-item" style={{ borderTop: i ? "1px solid var(--border)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
                <div className="logo-box"><tool.Logo size={20} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="tool-name">{tool.name}</span>
                    {isConn && <StatusDot active size={7} />}
                    {isConn && <span className="connected-badge">Connected</span>}
                  </div>
                  <div className="tool-desc">{tool.tagline}</div>
                </div>
                {isConn ? (
                  <button onClick={() => doDisconnect(tool.id)} disabled={disconnecting === tool.id} className="btn-outline-sm btn-disconnect">
                    {disconnecting === tool.id ? "…" : "Disconnect"}
                  </button>
                ) : (
                  <button onClick={() => setConfiguring(tool.id)} className="btn-primary-sm">Connect</button>
                )}
              </div>
              <div className="cap-line-row">
                {tool.capabilities.slice(0, 2).map((c, j) => <span key={j} className="cap-pill">{c}</span>)}
                {tool.capabilities.length > 2 && <span className="cap-pill cap-pill-more">+{tool.capabilities.length - 2} more</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════ NEW AGENT FLOW ═══════════ */
function NewAgentFlow({ connected, onSave, onCancel }) {
  const [name, setName] = useState(""); const [desc, setDesc] = useState(""); const [schedule, setSchedule] = useState(""); const [tools, setTools] = useState([]); const [step, setStep] = useState(0);
  const toggleTool = (id) => setTools(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const avail = INTEGRATIONS_DATA.filter(t => connected.includes(t.id));

  if (step === 0) return (
    <div className="main-content fade-in" style={{ maxWidth: 520 }}>
      <button onClick={onCancel} className="back-btn">← Back</button>
      <h1 className="page-title">New agent</h1>
      <p className="page-subtitle" style={{ marginBottom: 28 }}>Describe what this agent should do. It will run on a schedule and report back.</p>
      <div className="form-group"><label className="field-label">Name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Morning CX Digest" className="field-input" /></div>
      <div className="form-group"><label className="field-label">Instructions</label><textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe in plain English what you want this agent to do…" className="field-textarea" rows={4} /></div>
      <button disabled={!name.trim() || !desc.trim()} onClick={() => setStep(1)} className="btn-primary" style={{ opacity: name.trim() && desc.trim() ? 1 : 0.12 }}>Next</button>
    </div>
  );

  return (
    <div className="main-content fade-in" style={{ maxWidth: 520 }}>
      <button onClick={() => setStep(0)} className="back-btn">← Back</button>
      <h1 className="page-title">Configure {name}</h1>
      <div className="form-group">
        <label className="field-label">Tools</label>
        <div className="card-list" style={{ marginTop: 8 }}>
          {avail.map((tool, i) => { const sel = tools.includes(tool.id); return (
            <div key={tool.id} onClick={() => toggleTool(tool.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer", background: sel ? "#fafffe" : "#fff", borderTop: i ? "1px solid var(--border-light)" : "none" }}>
              <div className={`checkbox ${sel ? "checkbox-active" : ""}`}>{sel && "✓"}</div>
              <div className="logo-box" style={{ width: 30, height: 30 }}><tool.Logo size={16} /></div>
              <span style={{ fontSize: 14, fontWeight: 550, color: "var(--text-primary)" }}>{tool.name}</span>
            </div>
          ); })}
        </div>
      </div>
      <div className="form-group">
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
    <div className="main-content fade-in" style={{ maxWidth: 600 }}>
      <button onClick={() => { setView("list"); setSelected(null); }} className="back-btn">← Back</button>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>{selected.name}</h1>
        <span className={selected.active ? "status-active" : "status-paused"}>{selected.active ? "Active" : "Paused"}</span>
      </div>
      <p className="page-subtitle" style={{ marginBottom: 24 }}>{selected.desc}</p>
      <div className="meta-row">
        <div><div className="meta-label">Schedule</div><div className="meta-val">{selected.schedule}</div></div>
        <div><div className="meta-label">Last run</div><div className="meta-val">{selected.lastRun}</div></div>
        <div><div className="meta-label">Tools</div><div style={{ display: "flex", gap: 4, marginTop: 5 }}>{selected.tools.map(t => <ToolPill key={t} id={t} small />)}</div></div>
      </div>
      <div style={{ marginTop: 24 }}><div className="meta-label">Latest output</div><div className="output-box">{selected.lastOutput}</div></div>
      <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
        <button className="btn-primary">Run now</button>
        <button onClick={() => { setAgents(p => p.map(a => a.id === selected.id ? { ...a, active: !a.active } : a)); setSelected(s => ({ ...s, active: !s.active })); }} className="btn-outline">{selected.active ? "Pause" : "Activate"}</button>
        <button onClick={() => { setAgents(p => p.filter(a => a.id !== selected.id)); setView("list"); setSelected(null); }} className="btn-outline btn-danger">Delete</button>
      </div>
    </div>
  );

  return (
    <div className="main-content fade-in">
      <div className="content-header">
        <div>
          <h1 className="page-title">Agents</h1>
          <p className="page-subtitle">Automations that run on autopilot.</p>
        </div>
        <button onClick={() => setView("new")} className="btn-primary">New agent</button>
      </div>
      {agents.length === 0 ? <div className="empty-state"><p>No agents yet.</p></div> : (
        <div className="card-list">{agents.map((a, i) => (
          <div key={a.id} onClick={() => { setSelected(a); setView("detail"); }} className="card-list-item card-list-item-hover" style={{ borderTop: i ? "1px solid var(--border)" : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}><StatusDot active={a.active} /><span className="agent-name">{a.name}</span></div>
              <span className="agent-schedule">{a.schedule}</span>
            </div>
            <p className="agent-desc">{a.desc}</p>
            <div style={{ display: "flex", gap: 4, paddingLeft: 15 }}>{a.tools.map(t => <ToolPill key={t} id={t} small />)}</div>
          </div>
        ))}</div>
      )}
    </div>
  );
}

/* ═══════════ SETTINGS TAB ═══════════ */
function SettingsTab({ companyName }) {
  return (
    <div className="main-content fade-in">
      <div className="content-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your workspace preferences.</p>
        </div>
      </div>
      <div className="card-list">
        <div className="card-list-item">
          <div className="tool-name">Workspace</div>
          <div className="tool-desc" style={{ marginTop: 4 }}>{companyName || "Orchestra"}</div>
        </div>
        <div className="card-list-item" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="tool-name">Plan</div>
          <div className="tool-desc" style={{ marginTop: 4 }}>Starter · $49/mo · 1,000 credits included</div>
        </div>
        <div className="card-list-item" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="tool-name">AI Model</div>
          <div className="tool-desc" style={{ marginTop: 4 }}>Claude Sonnet 4 (default)</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════ CHAT TAB ═══════════ */
function ChatTab({ connected, companyName }) {
  const { messages, streaming, send, steps } = useChat(connected, companyName);
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
        {/* Empty state */}
        {!messages.length && !streaming && (
          <div className="fade-in chat-empty">
            <div className="chat-empty-header">
              <h2 className="chat-empty-title">What should we work on?</h2>
              <p className="chat-empty-sub">Pick a task or describe what you need.</p>
            </div>
            <div className="task-grid">
              {(connected.length > 0 ? TASK_CARDS.filter(tc => tc.tools.some(t => connected.includes(t))) : TASK_CARDS).map((tc, i) => {
                const available = connected.length === 0 || tc.tools.some(t => connected.includes(t));
                return (
                  <button key={i} className="task-card" style={!available ? { opacity: 0.45 } : {}} onClick={() => setInput(tc.prompt)}>
                    <div className="task-card-icon">{tc.icon}</div>
                    <div className="task-card-title">{tc.title}</div>
                    <div className="task-card-desc">{tc.desc}</div>
                    <div className="task-card-tools">{tc.tools.map(t => <ToolPill key={t} id={t} small />)}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((m, i) => (
          <div key={i} className={`msg-row ${m.role === "user" ? "msg-row-user" : "msg-row-ai"}`}>
            {m.role === "user" ? (
              <div className="bubble-user">{m.content}</div>
            ) : (
              <div className="response-block fade-in">
                {m.steps?.length > 0 && <ThinkingSteps steps={m.steps} done={true} />}
                {m.tools?.length > 0 && (
                  <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
                    {m.tools.map(t => <ToolPill key={t} id={t} small />)}
                  </div>
                )}
                <div className="response-body">
                  {m.content.split(/(\*\*.*?\*\*)/g).map((p, j) =>
                    p.startsWith("**") && p.endsWith("**")
                      ? <strong key={j} style={{ fontWeight: 650, color: "var(--text-primary)" }}>{p.slice(2, -2)}</strong>
                      : <span key={j}>{p}</span>
                  )}
                </div>
                {m.actions?.length > 0 && (
                  <div className="actions-section">
                    <div className="actions-label">Suggested actions</div>
                    {m.actions.map((a, ai) => (
                      <ActionCard key={ai} icon="⚡" text={a} done={completedActions[`${i}-${ai}`]}
                        onClick={() => { if (!completedActions[`${i}-${ai}`]) { markAction(i, ai); send(`Do this: ${a}`); } }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Streaming */}
        {streaming && (
          <div className="msg-row msg-row-ai fade-in">
            <div className="response-block">
              <ThinkingSteps steps={steps} done={false} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="input-area">
        <div className="input-row">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} placeholder="Describe what you need…" className="text-input" disabled={streaming} />
          <button onClick={submit} className="send-btn" style={{ opacity: input.trim() && !streaming ? 1 : 0.1 }}>↑</button>
        </div>
        <p className="input-hint">
          {connected.map(id => INTEGRATIONS_DATA.find(i => i.id === id)?.name).filter(Boolean).join(" · ")} connected — destructive actions require approval
        </p>
      </div>
    </div>
  );
}

/* ═══════════ MAIN APP ═══════════ */
function MainApp({ initialConnected, companyName }) {
  const [tab, setTab] = useState("chat");
  const [connected, setConnected] = useState(initialConnected);
  const [agents, setAgents] = useState(DEFAULT_AGENTS);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      {/* Mobile header */}
      <header className="mobile-header">
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <IconMenu />
        </button>
        <span className="mobile-logo">🎵 orchestra</span>
        <div style={{ width: 20 }} />
      </header>

      {/* Sidebar overlay for mobile */}
      {mobileMenuOpen && <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)} />}

      <div className="app-body">
        <Sidebar
          tab={tab}
          setTab={(t) => { setTab(t); setMobileMenuOpen(false); }}
          connected={connected}
          companyName={companyName}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
        <main className={`app-main ${mobileMenuOpen ? "app-main-blur" : ""}`}>
          {tab === "chat" && <ChatTab connected={connected} companyName={companyName} />}
          {tab === "agents" && <AgentsTab connected={connected} agents={agents} setAgents={setAgents} />}
          {tab === "integrations" && <IntegrationsTab connected={connected} setConnected={setConnected} />}
          {tab === "settings" && <SettingsTab companyName={companyName} />}
        </main>
      </div>
    </div>
  );
}

/* ═══════════ LANDING PAGE ═══════════ */
function LandingPage({ onGetStarted }) {
  const [annual, setAnnual] = useState(true);

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-brand">
            <span className="landing-brand-icon">🎵</span>
            <span className="landing-brand-text">orchestra</span>
          </div>
          <div className="landing-nav-links">
            <a href="#features" className="landing-link">Features</a>
            <a href="#pricing" className="landing-link">Pricing</a>
          </div>
          <button onClick={onGetStarted} className="landing-cta-nav">Get started →</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-pill">AI-powered business orchestration</div>
          <h1 className="landing-hero-title">
            Your entire business,<br />
            <span className="landing-hero-gradient">one conversation away.</span>
          </h1>
          <p className="landing-hero-sub">
            Connect Intercom, Stripe, Mailchimp, Slack, and your database.
            Ask questions, pull reports, and take action — all through a single AI interface.
          </p>
          <div className="landing-hero-actions">
            <button onClick={onGetStarted} className="landing-cta-primary">Get started free →</button>
            <a href="#features" className="landing-cta-secondary">See how it works</a>
          </div>
          <p className="landing-hero-note">No credit card required · 5-minute setup</p>
        </div>
      </section>

      {/* Integrations strip */}
      <section className="landing-logos">
        <p className="landing-logos-label">Works with the tools you already use</p>
        <div className="landing-logos-row">
          {INTEGRATIONS_DATA.map(t => (
            <div key={t.id} className="landing-logo-item">
              <t.Logo size={28} />
              <span>{t.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="landing-section">
        <div className="landing-section-inner">
          <h2 className="landing-section-title">Everything your startup needs</h2>
          <p className="landing-section-sub">One AI assistant that understands all your tools and acts on your behalf.</p>
          <div className="landing-features-grid">
            {[
              { icon: "💬", title: "Conversational Interface", desc: "Ask questions in plain English. Get data from any connected tool instantly." },
              { icon: "🔗", title: "5-Minute Integration", desc: "Paste your API keys and go. No OAuth apps, no developer setup, no code." },
              { icon: "🤖", title: "AI Agents", desc: "Schedule recurring tasks — morning CX digests, weekly reports, fire drills — all on autopilot." },
              { icon: "🛡️", title: "Safety Guardrails", desc: "Read operations are instant. Destructive actions always require your explicit approval." },
              { icon: "⚡", title: "Cross-Tool Intelligence", desc: "Correlate Intercom conversations with Stripe payments and database records in one query." },
              { icon: "📊", title: "Action Cards", desc: "AI suggests next steps as clickable cards. One click to reply, close, tag, or escalate." },
            ].map((f, i) => (
              <div key={i} className="landing-feature-card">
                <div className="landing-feature-icon">{f.icon}</div>
                <h3 className="landing-feature-title">{f.title}</h3>
                <p className="landing-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="landing-section landing-section-alt">
        <div className="landing-section-inner">
          <h2 className="landing-section-title">Simple, transparent pricing</h2>
          <p className="landing-section-sub">Start free. Scale as you grow. Credits power every AI action.</p>

          <div className="landing-toggle-row">
            <span className={!annual ? "landing-toggle-active" : "landing-toggle-label"}>Monthly</span>
            <button className="landing-toggle-btn" onClick={() => setAnnual(!annual)}>
              <div className={`landing-toggle-thumb ${annual ? "landing-toggle-on" : ""}`} />
            </button>
            <span className={annual ? "landing-toggle-active" : "landing-toggle-label"}>
              Annual <span className="landing-save-badge">Save 20%</span>
            </span>
          </div>

          <div className="landing-pricing-grid">
            {/* Starter */}
            <div className="landing-price-card">
              <div className="landing-price-tier">Starter</div>
              <div className="landing-price-amount">
                <span className="landing-price-dollar">$</span>
                <span className="landing-price-number">{annual ? "39" : "49"}</span>
                <span className="landing-price-period">/user/mo</span>
              </div>
              <p className="landing-price-desc">For early-stage startups getting started with AI operations.</p>
              <button onClick={onGetStarted} className="landing-price-btn">Get started</button>
              <ul className="landing-price-features">
                <li>Up to 5 integrations</li>
                <li>1,000 credits/month included</li>
                <li>3 scheduled agents</li>
                <li>1 workspace</li>
                <li>Claude Sonnet 4</li>
                <li>Email support</li>
              </ul>
            </div>

            {/* Pro */}
            <div className="landing-price-card landing-price-card-pop">
              <div className="landing-price-popular">Most popular</div>
              <div className="landing-price-tier">Pro</div>
              <div className="landing-price-amount">
                <span className="landing-price-dollar">$</span>
                <span className="landing-price-number">{annual ? "79" : "99"}</span>
                <span className="landing-price-period">/user/mo</span>
              </div>
              <p className="landing-price-desc">For growing teams that need more power and flexibility.</p>
              <button onClick={onGetStarted} className="landing-price-btn landing-price-btn-pop">Get started</button>
              <ul className="landing-price-features">
                <li>Unlimited integrations</li>
                <li>5,000 credits/month included</li>
                <li>Unlimited agents</li>
                <li>3 workspaces</li>
                <li>All AI models (GPT-4o, Gemini, Claude)</li>
                <li>Priority support</li>
                <li>BYOK (bring your own key)</li>
              </ul>
            </div>

            {/* Enterprise */}
            <div className="landing-price-card">
              <div className="landing-price-tier">Enterprise</div>
              <div className="landing-price-amount">
                <span className="landing-price-number" style={{ fontSize: 28 }}>Custom</span>
              </div>
              <p className="landing-price-desc">For organizations with advanced security and compliance needs.</p>
              <button className="landing-price-btn" style={{ opacity: 0.7, cursor: "default" }}>Contact sales</button>
              <ul className="landing-price-features">
                <li>Everything in Pro</li>
                <li>Unlimited credits</li>
                <li>Unlimited workspaces</li>
                <li>SSO & SAML</li>
                <li>Custom SLA</li>
                <li>Dedicated support</li>
                <li>Audit logs</li>
              </ul>
            </div>
          </div>

          <div className="landing-credits-info">
            <h3 className="landing-credits-title">How credits work</h3>
            <p className="landing-credits-sub">Every AI action uses credits based on complexity. Need more? Add credits at $10/1,000.</p>
            <div className="landing-credits-grid">
              {[
                { action: "Simple question", credits: "1 credit", example: "\"How many open conversations?\"" },
                { action: "Data pull + analysis", credits: "3 credits", example: "\"Show me Stripe revenue this month\"" },
                { action: "Cross-tool report", credits: "5 credits", example: "\"Weekly report across all tools\"" },
                { action: "Write action", credits: "5 credits", example: "\"Reply to this Intercom conversation\"" },
                { action: "Agent run", credits: "10 credits", example: "\"Morning CX Digest\" scheduled agent" },
              ].map((c, i) => (
                <div key={i} className="landing-credit-row">
                  <div className="landing-credit-action">{c.action}</div>
                  <div className="landing-credit-amount">{c.credits}</div>
                  <div className="landing-credit-example">{c.example}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-section">
        <div className="landing-section-inner" style={{ textAlign: "center", padding: "80px 24px" }}>
          <h2 className="landing-section-title">Ready to orchestrate your business?</h2>
          <p className="landing-section-sub" style={{ marginBottom: 32 }}>Connect your tools in 5 minutes and start your first conversation.</p>
          <button onClick={onGetStarted} className="landing-cta-primary">Get started free →</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <span>🎵</span>
            <span className="landing-footer-name">orchestra</span>
          </div>
          <p className="landing-footer-copy">© 2026 Orchestra. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════ ROOT ═══════════ */
export default function App() {
  const [view, setView] = useState("landing"); // landing | onboarding | app
  const [connected, setConnected] = useState([]);
  const [companyName, setCompanyName] = useState("");

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <style>{LANDING_CSS}</style>
      {view === "landing" && <LandingPage onGetStarted={() => setView("onboarding")} />}
      {view === "onboarding" && (
        <Onboarding onComplete={(c, org) => { setConnected(c); setCompanyName(org); setView("app"); }} />
      )}
      {view === "app" && <MainApp initialConnected={connected} companyName={companyName} />}
    </>
  );
}

/* ═══════════ GLOBAL CSS ═══════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;450;500;550;600;700&display=swap');

  :root {
    --sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --text-primary: #1a1a2e;
    --text-secondary: #64748b;
    --text-tertiary: #94a3b8;
    --bg-page: #f8fafc;
    --bg-sidebar: #ffffff;
    --bg-card: #ffffff;
    --border: #e2e8f0;
    --border-light: #f1f5f9;
    --accent: #3b82f6;
    --accent-hover: #2563eb;
    --success: #22c55e;
    --danger: #ef4444;
    --sidebar-w: 240px;
    --sidebar-w-collapsed: 56px;
    --radius: 10px;
    --radius-lg: 14px;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: var(--sans); -webkit-font-smoothing: antialiased; background: var(--bg-page); color: var(--text-primary); }
  html, body, #root { height: 100%; width: 100%; }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  .fade-in { animation: fadeIn 0.3s ease; }
  input::placeholder, textarea::placeholder { color: var(--text-tertiary); }

  /* ═══ APP SHELL ═══ */
  .app-shell { height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
  .app-body { flex: 1; display: flex; overflow: hidden; }
  .app-main { flex: 1; overflow-y: auto; background: var(--bg-page); display: flex; flex-direction: column; }

  /* ═══ MOBILE HEADER ═══ */
  .mobile-header { display: none; height: 52px; padding: 0 16px; background: var(--bg-card); border-bottom: 1px solid var(--border); align-items: center; justify-content: space-between; flex-shrink: 0; }
  .mobile-menu-btn { background: none; border: none; cursor: pointer; color: var(--text-primary); padding: 4px; }
  .mobile-logo { font-size: 13px; font-weight: 600; letter-spacing: 2px; text-transform: lowercase; color: var(--text-primary); }

  @media (max-width: 768px) {
    .mobile-header { display: flex; }
    .sidebar { position: fixed; left: -280px; top: 0; bottom: 0; z-index: 200; width: 260px !important; transition: left 0.25s ease; box-shadow: 4px 0 24px rgba(0,0,0,0.08); }
    .sidebar-collapsed { left: -280px !important; }
    .sidebar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 199; }
    .sidebar-collapse-btn { display: none !important; }
    .app-main-blur { filter: blur(2px); pointer-events: none; }
  }
  @media (max-width: 768px) {
    .sidebar-overlay ~ .app-body .sidebar { left: 0 !important; }
  }

  /* ═══ SIDEBAR ═══ */
  .sidebar {
    width: var(--sidebar-w);
    background: var(--bg-sidebar);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    overflow-y: auto;
    transition: width 0.2s ease;
  }
  .sidebar-collapsed { width: var(--sidebar-w-collapsed); }
  .sidebar-collapsed .sidebar-section-label,
  .sidebar-collapsed .sidebar-search,
  .sidebar-collapsed .sidebar-user,
  .sidebar-collapsed .sidebar-integration-row,
  .sidebar-collapsed .sidebar-badge { display: none; }
  .sidebar-collapsed .sidebar-nav-item { justify-content: center; padding: 9px; }
  .sidebar-collapsed .sidebar-nav-item span { display: none; }
  .sidebar-collapsed .sidebar-brand { justify-content: center; padding: 16px 8px; }
  .sidebar-collapsed .sidebar-logo-row { justify-content: center; }

  .sidebar-brand {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 16px 12px;
    border-bottom: 1px solid var(--border-light);
    flex-shrink: 0;
  }
  .sidebar-logo-row { display: flex; align-items: center; gap: 8px; }
  .sidebar-logo { font-size: 18px; }
  .sidebar-logo-text { font-size: 13px; font-weight: 650; letter-spacing: 3px; text-transform: lowercase; color: var(--text-primary); }
  .sidebar-collapse-btn {
    background: none; border: none; cursor: pointer; color: var(--text-tertiary); padding: 4px;
    transition: transform 0.2s, color 0.15s; border-radius: 4px;
  }
  .sidebar-collapse-btn:hover { color: var(--text-secondary); }
  .sidebar-collapsed .sidebar-collapse-btn { transform: rotate(180deg); }

  .sidebar-search {
    display: flex; align-items: center; gap: 8px; margin: 12px 12px 4px;
    padding: 8px 10px; border-radius: 8px; background: var(--bg-page); color: var(--text-tertiary);
    font-size: 13px; cursor: pointer; border: 1px solid transparent; transition: border-color 0.15s;
  }
  .sidebar-search:hover { border-color: var(--border); }
  .sidebar-search-text { flex: 1; }
  .sidebar-kbd { font-size: 11px; background: var(--bg-card); border: 1px solid var(--border); padding: 1px 5px; border-radius: 4px; color: var(--text-tertiary); font-family: var(--sans); }

  .sidebar-section { padding: 8px 0; }
  .sidebar-section-label { font-size: 11px; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.8px; padding: 8px 16px 4px; }

  .sidebar-nav-item {
    display: flex; align-items: center; gap: 10px; width: 100%;
    padding: 8px 16px; border: none; background: none; cursor: pointer;
    font-size: 13px; font-weight: 500; color: var(--text-secondary); font-family: var(--sans);
    transition: all 0.12s; border-radius: 0; text-align: left;
  }
  .sidebar-nav-item:hover { background: var(--bg-page); color: var(--text-primary); }
  .sidebar-nav-active { background: var(--bg-page); color: var(--text-primary); font-weight: 600; }
  .sidebar-badge { font-size: 11px; background: var(--accent); color: #fff; padding: 1px 7px; border-radius: 99px; margin-left: auto; font-weight: 600; }

  .sidebar-integration-row {
    display: flex; align-items: center; gap: 8px; padding: 5px 16px; font-size: 13px; color: var(--text-secondary);
  }
  .sidebar-integration-name { flex: 1; font-weight: 450; }

  .sidebar-footer { padding: 8px 0; border-top: 1px solid var(--border-light); flex-shrink: 0; }
  .sidebar-user { display: flex; align-items: center; gap: 10px; padding: 12px 16px; }
  .sidebar-avatar {
    width: 30px; height: 30px; border-radius: 8px; background: var(--accent);
    color: #fff; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .sidebar-user-info { min-width: 0; }
  .sidebar-user-name { font-size: 13px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sidebar-user-plan { font-size: 11px; color: var(--text-tertiary); }

  /* ═══ MAIN CONTENT ═══ */
  .main-content { max-width: 720px; width: 100%; margin: 0 auto; padding: 32px 24px; }
  @media (max-width: 768px) { .main-content { padding: 20px 16px; } }

  .content-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
  .page-title { font-size: 22px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; letter-spacing: -0.3px; }
  .page-subtitle { font-size: 14px; color: var(--text-tertiary); }

  /* ═══ ONBOARDING ═══ */
  .onboard-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-page); padding: 24px; }
  .onboard-container { width: 100%; max-width: 480px; display: flex; flex-direction: column; align-items: center; }
  .onboard-step { max-width: 400px; width: 100%; text-align: center; }
  .onboard-logo { font-size: 32px; margin-bottom: 24px; }
  .onboard-title { font-size: 28px; font-weight: 700; color: var(--text-primary); line-height: 1.3; margin-bottom: 12px; letter-spacing: -0.5px; }
  .onboard-sub { font-size: 15px; color: var(--text-tertiary); line-height: 1.55; margin-bottom: 32px; }
  .onboard-input { width: 100%; padding: 14px 0; border: none; border-bottom: 2px solid var(--border); font-size: 16px; font-family: var(--sans); outline: none; text-align: center; color: var(--text-primary); background: transparent; margin-bottom: 24px; transition: border-color 0.2s; }
  .onboard-input:focus { border-bottom-color: var(--accent); }
  .onboard-check { width: 48px; height: 48px; border-radius: 14px; background: #f0fdf4; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: var(--success); font-size: 22px; font-weight: 700; }
  .step-tag { font-size: 11px; font-weight: 600; color: var(--text-tertiary); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 14px; }
  .footnote { font-size: 12px; color: var(--text-tertiary); text-align: center; margin-top: 12px; }

  /* ═══ BUTTONS ═══ */
  .btn-primary { padding: 10px 20px; border-radius: var(--radius); background: var(--text-primary); color: #fff; border: none; font-size: 13px; font-weight: 600; cursor: pointer; font-family: var(--sans); transition: opacity 0.15s; }
  .btn-primary:hover { opacity: 0.85; }
  .btn-primary-sm { padding: 7px 16px; border-radius: 8px; background: var(--text-primary); color: #fff; border: none; font-size: 12.5px; font-weight: 600; cursor: pointer; font-family: var(--sans); }
  .btn-outline { padding: 10px 20px; border-radius: var(--radius); background: var(--bg-card); color: var(--text-secondary); border: 1px solid var(--border); font-size: 13px; font-weight: 550; cursor: pointer; font-family: var(--sans); transition: border-color 0.15s; }
  .btn-outline:hover { border-color: #cbd5e1; }
  .btn-outline-sm { padding: 7px 16px; border-radius: 8px; background: transparent; color: var(--text-primary); border: 1px solid var(--border); font-size: 12.5px; font-weight: 550; cursor: pointer; font-family: var(--sans); }
  .btn-disconnect { color: var(--text-tertiary); border-color: var(--border-light); }
  .btn-danger { color: var(--danger); border-color: #fecaca; }
  .btn-danger:hover { border-color: var(--danger); }
  .btn-full { width: 100%; }
  .back-btn { background: none; border: none; color: var(--text-tertiary); font-size: 13px; cursor: pointer; font-family: var(--sans); padding: 0; margin-bottom: 20px; font-weight: 500; }
  .back-btn:hover { color: var(--text-secondary); }

  .schedule-chip { padding: 7px 14px; border-radius: 99px; border: 1px solid var(--border); background: var(--bg-card); color: var(--text-secondary); font-size: 12.5px; font-weight: 500; cursor: pointer; font-family: var(--sans); transition: all 0.12s; }
  .schedule-chip-active { border-color: var(--text-primary); background: var(--text-primary); color: #fff; }

  /* ═══ CARDS ═══ */
  .card-list { border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; background: var(--bg-card); }
  .card-list-item { padding: 16px 20px; }
  .card-list-item-hover { cursor: pointer; transition: background 0.12s; }
  .card-list-item-hover:hover { background: var(--bg-page); }
  .logo-box { width: 38px; height: 38px; border-radius: 10px; background: var(--bg-page); border: 1px solid var(--border-light); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .tool-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
  .tool-desc { font-size: 13px; color: var(--text-tertiary); margin-top: 2px; }
  .connected-badge { font-size: 12px; font-weight: 600; color: var(--success); }
  .cap-toggle { background: none; border: none; font-size: 12px; color: var(--text-tertiary); cursor: pointer; font-family: var(--sans); padding: 4px 0; font-weight: 500; }
  .cap-toggle:hover { color: var(--text-secondary); }
  .cap-line { font-size: 13px; color: var(--text-secondary); padding: 4px 0 4px 14px; border-left: 2px solid var(--border-light); margin-bottom: 2px; line-height: 1.5; }
  .cap-note { font-size: 12px; color: var(--text-tertiary); margin-top: 8px; font-style: italic; padding-left: 14px; }
  .coming-soon-bar { margin-top: 32px; padding: 16px 0; border-top: 1px solid var(--border-light); }
  .coming-soon-bar p { font-size: 13px; color: var(--text-tertiary); }

  /* Setup card */
  .setup-card { background: var(--bg-page); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; }
  .setup-card-header { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px; }
  .setup-steps { padding-left: 18px; margin: 0; }
  .setup-steps li { font-size: 13px; color: var(--text-secondary); line-height: 1.7; margin-bottom: 4px; }
  .setup-link { display: inline-block; margin-top: 12px; font-size: 13px; font-weight: 600; color: var(--accent); text-decoration: none; }
  .setup-link:hover { text-decoration: underline; }
  .error-msg { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; border-radius: var(--radius); padding: 10px 14px; font-size: 13px; margin-top: 12px; }

  /* Capability pills */
  .cap-line-row { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px; }
  .cap-pill { font-size: 11px; color: var(--text-tertiary); background: var(--bg-page); border: 1px solid var(--border-light); padding: 3px 10px; border-radius: 99px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 240px; }
  .cap-pill-more { color: var(--accent); border-color: transparent; background: rgba(59,130,246,0.06); font-weight: 600; }

  .checkbox { width: 18px; height: 18px; border-radius: 5px; border: 1.5px solid var(--border); background: var(--bg-card); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 11px; font-weight: 700; flex-shrink: 0; }
  .checkbox-active { border: none; background: var(--text-primary); }

  /* ═══ STATUS ═══ */
  .status-active { font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 99px; background: #f0fdf4; color: #16a34a; }
  .status-paused { font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 99px; background: var(--bg-page); color: var(--text-tertiary); }

  /* ═══ AGENTS ═══ */
  .agent-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
  .agent-schedule { font-size: 12px; color: var(--text-tertiary); }
  .agent-desc { font-size: 13px; color: var(--text-tertiary); margin: 0 0 8px; line-height: 1.5; padding-left: 15px; }
  .empty-state { text-align: center; padding: 60px 0; color: var(--text-tertiary); font-size: 14px; }

  /* ═══ META ═══ */
  .meta-row { display: flex; gap: 32px; padding: 18px 0; border-top: 1px solid var(--border-light); border-bottom: 1px solid var(--border-light); flex-wrap: wrap; }
  .meta-label { font-size: 11px; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.8px; }
  .meta-val { font-size: 14px; color: var(--text-secondary); font-weight: 500; margin-top: 5px; }
  .output-box { background: var(--bg-page); border: 1px solid var(--border-light); border-radius: var(--radius); padding: 14px 16px; font-size: 14px; color: var(--text-secondary); line-height: 1.65; margin-top: 8px; }

  /* ═══ FORMS ═══ */
  .form-group { margin-bottom: 22px; }
  .field-label { font-size: 12px; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.6px; display: block; margin-bottom: 8px; }
  .field-input { width: 100%; padding: 11px 14px; border: 1px solid var(--border); border-radius: var(--radius); font-size: 14px; font-family: var(--sans); outline: none; color: var(--text-primary); background: var(--bg-card); transition: border-color 0.15s; }
  .field-input:focus { border-color: var(--accent); }
  .field-textarea { width: 100%; padding: 11px 14px; border: 1px solid var(--border); border-radius: var(--radius); font-size: 14px; font-family: var(--sans); outline: none; color: var(--text-primary); resize: vertical; line-height: 1.55; background: var(--bg-card); transition: border-color 0.15s; }
  .field-textarea:focus { border-color: var(--accent); }

  /* ═══ TOOL PILLS ═══ */
  .tool-pill { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; padding: 3px 10px 3px 7px; border-radius: 6px; background: var(--bg-page); color: var(--text-secondary); font-weight: 550; border: 1px solid var(--border-light); }
  .tool-pill-sm { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; padding: 2px 7px 2px 5px; border-radius: 5px; background: var(--bg-page); color: var(--text-secondary); font-weight: 550; }

  /* ═══ TASK CARDS ═══ */
  .task-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    max-width: 580px;
    margin: 0 auto;
    padding: 0 8px;
  }
  @media (max-width: 600px) { .task-grid { grid-template-columns: 1fr; } }
  .task-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 20px 18px;
    text-align: left;
    cursor: pointer;
    font-family: var(--sans);
    transition: all 0.15s;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .task-card:hover { border-color: #cbd5e1; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
  .task-card-icon { font-size: 22px; margin-bottom: 6px; }
  .task-card-title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
  .task-card-desc { font-size: 13px; color: var(--text-tertiary); line-height: 1.45; margin-bottom: 8px; }
  .task-card-tools { display: flex; gap: 4px; flex-wrap: wrap; }

  /* ═══ CHAT ═══ */
  .chat-wrap { flex: 1; display: flex; flex-direction: column; max-width: 740px; width: 100%; margin: 0 auto; padding: 0 8px; }
  .chat-scroll { flex: 1; overflow-y: auto; padding: 24px 16px 16px; }
  .chat-empty { padding-top: 6vh; }
  .chat-empty-header { text-align: center; margin-bottom: 36px; }
  .chat-empty-title { font-size: 24px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px; letter-spacing: -0.3px; }
  .chat-empty-sub { color: var(--text-tertiary); font-size: 14px; margin: 0; }

  .msg-row { margin-bottom: 20px; }
  .msg-row-user { display: flex; justify-content: flex-end; }
  .msg-row-ai { display: flex; justify-content: flex-start; }

  .bubble-user {
    max-width: 80%;
    font-size: 14px; line-height: 1.6; color: #fff;
    background: var(--text-primary);
    padding: 12px 16px;
    border-radius: 18px 18px 4px 18px;
  }

  .response-block {
    width: 100%;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 20px;
  }
  .response-body { font-size: 14px; line-height: 1.75; color: var(--text-secondary); white-space: pre-wrap; }

  /* Steps */
  .steps-wrap { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; padding-bottom: 14px; border-bottom: 1px solid var(--border-light); }
  .step-row { display: flex; align-items: center; gap: 10px; }
  .step-dot { width: 20px; height: 20px; border-radius: 99px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; }
  .step-dot-done { background: #f0fdf4; color: var(--success); }
  .step-dot-active { background: var(--bg-page); color: transparent; position: relative; }
  .step-spinner { width: 12px; height: 12px; border: 2px solid var(--border); border-top-color: var(--text-secondary); border-radius: 99px; animation: spin 0.8s linear infinite; display: block; }
  .step-text { display: flex; align-items: center; gap: 8px; }
  .step-label { font-size: 13px; color: var(--text-tertiary); font-weight: 450; }

  /* Actions */
  .actions-section { margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border-light); }
  .actions-label { font-size: 11px; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px; }
  .action-card {
    display: flex; align-items: center; justify-content: space-between; width: 100%;
    padding: 12px 14px; background: var(--bg-page); border: 1px solid var(--border);
    border-radius: var(--radius); cursor: pointer; font-family: var(--sans); margin-bottom: 6px;
    transition: all 0.12s; text-align: left;
  }
  .action-card:hover { border-color: #cbd5e1; background: var(--bg-card); }
  .action-card-done { opacity: 0.5; pointer-events: none; background: #f0fdf4; border-color: #bbf7d0; }
  .action-card-left { display: flex; align-items: flex-start; gap: 10px; }
  .action-card-icon { font-size: 14px; margin-top: 1px; flex-shrink: 0; }
  .action-card-text { font-size: 13px; color: var(--text-primary); font-weight: 500; line-height: 1.45; }
  .action-card-sub { font-size: 12px; color: var(--text-tertiary); margin-top: 2px; }
  .action-card-arrow { font-size: 14px; color: var(--text-tertiary); flex-shrink: 0; }

  /* Input */
  .input-area { padding: 0 16px 20px; }
  .input-row { display: flex; align-items: center; background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; padding: 4px 6px 4px 16px; transition: border-color 0.15s; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
  .input-row:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(59,130,246,0.08); }
  .text-input { flex: 1; border: none; outline: none; font-size: 14px; font-family: var(--sans); padding: 12px 0; background: transparent; color: var(--text-primary); }
  .send-btn { width: 34px; height: 34px; border-radius: 10px; background: var(--text-primary); color: #fff; border: none; font-size: 16px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: opacity 0.12s; }
  .input-hint { font-size: 11px; color: var(--text-tertiary); text-align: center; margin-top: 8px; }
`;

const LANDING_CSS = `
  /* ═══ LANDING PAGE ═══ */
  .landing {
    min-height: 100vh;
    background: #ffffff;
    font-family: var(--sans);
    -webkit-font-smoothing: antialiased;
  }

  /* Nav */
  .landing-nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(255,255,255,0.85);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(0,0,0,0.06);
  }
  .landing-nav-inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 24px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .landing-brand {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .landing-brand-icon { font-size: 20px; }
  .landing-brand-text {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: lowercase;
    color: var(--text-primary);
  }
  .landing-nav-links {
    display: flex;
    gap: 32px;
  }
  .landing-link {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 0.15s;
  }
  .landing-link:hover { color: var(--text-primary); }
  .landing-cta-nav {
    padding: 8px 20px;
    border-radius: 8px;
    background: var(--text-primary);
    color: #fff;
    border: none;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--sans);
    transition: opacity 0.15s;
  }
  .landing-cta-nav:hover { opacity: 0.85; }

  @media (max-width: 640px) {
    .landing-nav-links { display: none; }
  }

  /* Hero */
  .landing-hero {
    padding: 100px 24px 60px;
    text-align: center;
  }
  .landing-hero-inner {
    max-width: 720px;
    margin: 0 auto;
  }
  .landing-pill {
    display: inline-block;
    padding: 6px 16px;
    border-radius: 99px;
    background: rgba(59,130,246,0.06);
    color: var(--accent);
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 24px;
  }
  .landing-hero-title {
    font-size: 52px;
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -1.5px;
    color: var(--text-primary);
    margin-bottom: 20px;
  }
  .landing-hero-gradient {
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .landing-hero-sub {
    font-size: 18px;
    line-height: 1.65;
    color: var(--text-secondary);
    max-width: 520px;
    margin: 0 auto 36px;
  }
  .landing-hero-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
  }
  .landing-cta-primary {
    padding: 14px 32px;
    border-radius: 12px;
    background: var(--text-primary);
    color: #fff;
    border: none;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--sans);
    transition: all 0.15s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  }
  .landing-cta-primary:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
  .landing-cta-secondary {
    padding: 14px 24px;
    font-size: 15px;
    font-weight: 500;
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 0.15s;
  }
  .landing-cta-secondary:hover { color: var(--text-primary); }
  .landing-hero-note {
    font-size: 13px;
    color: var(--text-tertiary);
    margin-top: 16px;
  }

  @media (max-width: 640px) {
    .landing-hero { padding: 60px 20px 40px; }
    .landing-hero-title { font-size: 34px; letter-spacing: -0.8px; }
    .landing-hero-sub { font-size: 16px; }
  }

  /* Logos strip */
  .landing-logos {
    padding: 48px 24px;
    text-align: center;
    border-top: 1px solid rgba(0,0,0,0.04);
    border-bottom: 1px solid rgba(0,0,0,0.04);
    background: var(--bg-page);
  }
  .landing-logos-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 24px;
  }
  .landing-logos-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 40px;
    flex-wrap: wrap;
  }
  .landing-logo-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  /* Sections */
  .landing-section {
    padding: 80px 24px;
  }
  .landing-section-alt {
    background: var(--bg-page);
  }
  .landing-section-inner {
    max-width: 1100px;
    margin: 0 auto;
  }
  .landing-section-title {
    font-size: 36px;
    font-weight: 800;
    letter-spacing: -0.8px;
    color: var(--text-primary);
    text-align: center;
    margin-bottom: 12px;
  }
  .landing-section-sub {
    font-size: 16px;
    color: var(--text-secondary);
    text-align: center;
    margin-bottom: 48px;
    max-width: 520px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;
  }

  /* Features grid */
  .landing-features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  @media (max-width: 800px) { .landing-features-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 520px) { .landing-features-grid { grid-template-columns: 1fr; } }

  .landing-feature-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 28px 24px;
    transition: all 0.2s;
  }
  .landing-feature-card:hover {
    border-color: #cbd5e1;
    box-shadow: 0 4px 16px rgba(0,0,0,0.05);
    transform: translateY(-2px);
  }
  .landing-feature-icon { font-size: 28px; margin-bottom: 16px; }
  .landing-feature-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
  }
  .landing-feature-desc {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.6;
  }

  /* Pricing toggle */
  .landing-toggle-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 40px;
  }
  .landing-toggle-label { font-size: 14px; color: var(--text-tertiary); font-weight: 500; }
  .landing-toggle-active { font-size: 14px; color: var(--text-primary); font-weight: 600; }
  .landing-toggle-btn {
    width: 44px;
    height: 24px;
    border-radius: 99px;
    background: var(--border);
    border: none;
    cursor: pointer;
    position: relative;
    transition: background 0.2s;
    padding: 0;
  }
  .landing-toggle-thumb {
    width: 20px;
    height: 20px;
    border-radius: 99px;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    position: absolute;
    top: 2px;
    left: 2px;
    transition: transform 0.2s;
  }
  .landing-toggle-on { transform: translateX(20px); }
  .landing-save-badge {
    font-size: 11px;
    font-weight: 700;
    color: #16a34a;
    background: #f0fdf4;
    padding: 2px 8px;
    border-radius: 99px;
    margin-left: 6px;
  }

  /* Pricing grid */
  .landing-pricing-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 60px;
  }
  @media (max-width: 800px) { .landing-pricing-grid { grid-template-columns: 1fr; max-width: 400px; margin-left: auto; margin-right: auto; } }

  .landing-price-card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 32px 28px;
    position: relative;
  }
  .landing-price-card-pop {
    border-color: var(--text-primary);
    border-width: 2px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.08);
    transform: scale(1.03);
  }
  .landing-price-popular {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--text-primary);
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    padding: 4px 14px;
    border-radius: 99px;
    letter-spacing: 0.5px;
  }
  .landing-price-tier {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
  }
  .landing-price-amount {
    display: flex;
    align-items: baseline;
    gap: 2px;
    margin-bottom: 12px;
  }
  .landing-price-dollar { font-size: 20px; font-weight: 700; color: var(--text-primary); }
  .landing-price-number { font-size: 48px; font-weight: 800; color: var(--text-primary); letter-spacing: -2px; line-height: 1; }
  .landing-price-period { font-size: 14px; color: var(--text-tertiary); font-weight: 500; margin-left: 4px; }
  .landing-price-desc {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.5;
    margin-bottom: 20px;
    min-height: 42px;
  }
  .landing-price-btn {
    width: 100%;
    padding: 12px;
    border-radius: 10px;
    background: var(--bg-page);
    color: var(--text-primary);
    border: 1px solid var(--border);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--sans);
    transition: all 0.15s;
    margin-bottom: 24px;
  }
  .landing-price-btn:hover { background: var(--text-primary); color: #fff; }
  .landing-price-btn-pop {
    background: var(--text-primary);
    color: #fff;
    border-color: var(--text-primary);
  }
  .landing-price-btn-pop:hover { opacity: 0.9; }
  .landing-price-features {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .landing-price-features li {
    font-size: 14px;
    color: var(--text-secondary);
    padding: 7px 0;
    border-top: 1px solid var(--border-light);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .landing-price-features li::before {
    content: "✓";
    color: var(--success);
    font-weight: 700;
    font-size: 12px;
    flex-shrink: 0;
  }

  /* Credits section */
  .landing-credits-info {
    text-align: center;
  }
  .landing-credits-title {
    font-size: 22px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
  }
  .landing-credits-sub {
    font-size: 15px;
    color: var(--text-secondary);
    margin-bottom: 28px;
  }
  .landing-credits-grid {
    max-width: 600px;
    margin: 0 auto;
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    background: #fff;
  }
  .landing-credit-row {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 16px;
    padding: 14px 20px;
    border-top: 1px solid var(--border-light);
    align-items: center;
    text-align: left;
  }
  .landing-credit-row:first-child { border-top: none; }
  .landing-credit-action { font-size: 14px; font-weight: 600; color: var(--text-primary); }
  .landing-credit-amount {
    font-size: 13px;
    font-weight: 700;
    color: var(--accent);
    background: rgba(59,130,246,0.06);
    padding: 3px 12px;
    border-radius: 99px;
    white-space: nowrap;
  }
  .landing-credit-example {
    font-size: 13px;
    color: var(--text-tertiary);
    text-align: right;
  }
  @media (max-width: 600px) {
    .landing-credit-row { grid-template-columns: 1fr auto; gap: 8px; }
    .landing-credit-example { display: none; }
  }

  /* Footer */
  .landing-footer {
    border-top: 1px solid var(--border);
    padding: 32px 24px;
  }
  .landing-footer-inner {
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .landing-footer-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
  }
  .landing-footer-name {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: lowercase;
    color: var(--text-primary);
  }
  .landing-footer-copy {
    font-size: 13px;
    color: var(--text-tertiary);
  }
  @media (max-width: 520px) {
    .landing-footer-inner { flex-direction: column; gap: 12px; }
  }
`;
