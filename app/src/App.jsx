import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════
   ORCHESTRA — AI Business Orchestration Hub
   Profound-style dashboard UI
   ═══════════════════════════════════════════ */

const WORKER_URL = import.meta.env.VITE_WORKER_URL || "http://localhost:8787";

/* ── SVG Logos (Simple Icons — https://simpleicons.org) ─── */
const IntercomLogo = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M21 0H3C1.343 0 0 1.343 0 3v18c0 1.658 1.343 3 3 3h18c1.658 0 3-1.342 3-3V3c0-1.657-1.342-3-3-3zm-5.801 4.399c0-.44.36-.8.802-.8.44 0 .8.36.8.8v10.688c0 .442-.36.801-.8.801-.443 0-.802-.359-.802-.801V4.399zM11.2 3.994c0-.44.357-.799.8-.799s.8.359.8.799v11.602c0 .44-.357.8-.8.8s-.8-.36-.8-.8V3.994zm-4 .405c0-.44.359-.8.799-.8.443 0 .802.36.802.8v10.688c0 .442-.36.801-.802.801-.44 0-.799-.359-.799-.801V4.399zM3.199 6c0-.442.36-.8.802-.8.44 0 .799.358.799.8v7.195c0 .441-.359.8-.799.8-.443 0-.802-.36-.802-.8V6zM20.52 18.202c-.123.105-3.086 2.593-8.52 2.593-5.433 0-8.397-2.486-8.521-2.593-.335-.288-.375-.792-.086-1.128.285-.334.79-.375 1.125-.09.047.041 2.693 2.211 7.481 2.211 4.848 0 7.456-2.186 7.479-2.207.334-.289.839-.25 1.128.086.289.336.25.84-.086 1.128zm.281-5.007c0 .441-.36.8-.801.8-.441 0-.801-.36-.801-.8V6c0-.442.361-.8.801-.8.441 0 .801.357.801.8v7.195z" fill="#286EFA"/>
  </svg>
);

const MailchimpLogo = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="7" fill="#FFE01B" />
    <svg x="4" y="4" width="24" height="24" viewBox="0 0 24 24">
      <path d="M11.267 0C6.791-.015-1.82 10.246 1.397 12.964l.79.669a3.88 3.88 0 0 0-.22 1.792c.084.84.518 1.644 1.22 2.266.666.59 1.542.964 2.392.964 1.406 3.24 4.62 5.228 8.386 5.34 4.04.12 7.433-1.776 8.854-5.182.093-.24.488-1.316.488-2.267 0-.956-.54-1.352-.885-1.352-.01-.037-.078-.286-.172-.586-.093-.3-.19-.51-.19-.51.375-.563.382-1.065.332-1.35-.053-.353-.2-.653-.496-.964-.296-.311-.902-.63-1.753-.868l-.446-.124c-.002-.019-.024-1.053-.043-1.497-.014-.32-.042-.822-.197-1.315-.186-.668-.508-1.253-.911-1.627 1.112-1.152 1.806-2.422 1.804-3.511-.003-2.095-2.576-2.729-5.746-1.416l-.672.285A678.22 678.22 0 0 0 12.7.504C12.304.159 11.817.002 11.267 0zm.073.873c.166 0 .322.019.465.058.297.084 1.28 1.224 1.28 1.224s-1.826 1.013-3.52 2.426c-2.28 1.757-4.005 4.311-5.037 7.082-.811.158-1.526.618-1.963 1.253-.261-.218-.748-.64-.834-.804-.698-1.326.761-3.902 1.781-5.357C5.834 3.44 9.37.867 11.34.873zm3.286 3.273c.04-.002.06.05.028.074-.143.11-.299.26-.413.414a.04.04 0 0 0 .031.064c.659.004 1.587.235 2.192.574.041.023.012.103-.034.092-.915-.21-2.414-.369-3.97.01-1.39.34-2.45.863-3.224 1.426-.04.028-.086-.023-.055-.06.896-1.035 1.999-1.935 2.987-2.44.034-.018.07.019.052.052-.079.143-.23.447-.278.678-.007.035.032.063.062.042.615-.42 1.684-.868 2.622-.926zm3.023 3.205l.056.001a.896.896 0 0 1 .456.146c.534.355.61 1.216.638 1.845.015.36.059 1.229.074 1.478.034.571.184.651.487.751.17.057.33.098.563.164.706.198 1.125.4 1.39.658.157.162.23.333.253.497.083.608-.472 1.36-1.942 2.041-1.607.746-3.557.935-4.904.785l-.471-.053c-1.078-.145-1.693 1.247-1.046 2.201.417.615 1.552 1.015 2.688 1.015 2.604 0 4.605-1.111 5.35-2.072a.987.987 0 0 0 .06-.085c.036-.055.006-.085-.04-.054-.608.416-3.31 2.069-6.2 1.571 0 0-.351-.057-.672-.182-.255-.1-.788-.344-.853-.891 2.333.72 3.801.039 3.801.039a.072.072 0 0 0 .042-.072.067.067 0 0 0-.074-.06s-1.911.283-3.718-.378c.197-.64.72-.408 1.51-.345a11.045 11.045 0 0 0 3.647-.394c.818-.234 1.892-.697 2.727-1.356.281.618.38 1.299.38 1.299s.219-.04.4.073c.173.106.299.326.213.895-.176 1.063-.628 1.926-1.387 2.72a5.714 5.714 0 0 1-1.666 1.244c-.34.18-.704.334-1.087.46-2.863.935-5.794-.093-6.739-2.3a3.545 3.545 0 0 1-.189-.522c-.403-1.455-.06-3.2 1.008-4.299.065-.07.132-.153.132-.256 0-.087-.055-.179-.102-.243-.374-.543-1.669-1.466-1.409-3.254.187-1.284 1.31-2.189 2.357-2.135.089.004.177.01.266.015.453.027.85.085 1.223.1.625.028 1.187-.063 1.853-.618.225-.187.405-.35.71-.401.028-.005.092-.028.215-.028zm.022 2.18a.42.42 0 0 0-.06.005c-.335.054-.347.468-.228 1.04.068.32.187.595.32.765.175-.02.343-.022.498 0 .089-.205.104-.557.024-.942-.112-.535-.261-.872-.554-.868zm-3.66 1.546a1.724 1.724 0 0 0-1.016.326c-.16.117-.311.28-.29.378.008.032.031.056.088.063.131.015.592-.217 1.122-.25.374-.023.684.094.923.2.239.104.386.173.443.113.037-.038.026-.11-.031-.204-.118-.192-.36-.387-.618-.497a1.601 1.601 0 0 0-.621-.129zm4.082.81c-.171-.003-.313.186-.317.42-.004.236.131.43.303.432.172.003.314-.185.318-.42.004-.236-.132-.429-.304-.432zm-3.58.172c-.05 0-.102.002-.155.008-.311.05-.483.152-.593.247-.094.082-.152.173-.152.237a.075.075 0 0 0 .075.076c.07 0 .228-.063.228-.063a1.98 1.98 0 0 1 1.001-.104c.157.018.23.027.265-.026.01-.016.022-.049-.01-.1-.063-.103-.311-.269-.66-.275zm2.26.4c-.127 0-.235.051-.283.148-.075.154.035.363.246.466.21.104.443.063.52-.09.075-.155-.035-.364-.246-.467a.542.542 0 0 0-.237-.058zm-11.635.024c.048 0 .098 0 .149.003.73.04 1.806.6 2.052 2.19.217 1.41-.128 2.843-1.449 3.069-.123.02-.248.029-.374.026-1.22-.033-2.539-1.132-2.67-2.435-.145-1.44.591-2.548 1.894-2.811.117-.024.252-.04.398-.042zm-.07.927a1.144 1.144 0 0 0-.847.364c-.38.418-.439.988-.366 1.19.027.073.07.094.1.098.064.008.16-.039.22-.2a1.2 1.2 0 0 0 .017-.052 1.58 1.58 0 0 1 .157-.37.689.689 0 0 1 .955-.199c.266.174.369.5.255.81-.058.161-.154.469-.133.721.043.511.357.717.64.738.274.01.466-.143.515-.256.029-.067.005-.107-.011-.125-.043-.053-.113-.037-.18-.021a.638.638 0 0 1-.16.022.347.347 0 0 1-.294-.148c-.078-.12-.073-.3.013-.504.011-.028.025-.058.04-.092.138-.308.368-.825.11-1.317-.195-.37-.513-.602-.894-.65a1.135 1.135 0 0 0-.138-.01z" fill="#241C15"/>
    </svg>
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
    <svg x="4" y="4" width="24" height="24" viewBox="0 0 24 24">
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" fill="#fff"/>
    </svg>
  </svg>
);

const SlackLogo = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="7" fill="#4A154B" />
    <svg x="4" y="4" width="24" height="24" viewBox="0 0 24 24">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#fff"/>
    </svg>
  </svg>
);

/* ── Sidebar Icons ───────────────────── */
const IconDigest = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M5 5.5h6M5 8h4M5 10.5h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
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
function ThinkingSteps({ steps, done, tools }) {
  // Compact mode: just show tool circles in a row with a one-liner
  const toolSteps = steps.filter(s => s.tool);
  const uniqueTools = [...new Set(toolSteps.map(s => s.tool))];

  if (done) {
    // Completed: show as a single compact row of tool circles + summary
    if (!uniqueTools.length) return null;
    return (
      <div className="steps-compact">
        <div className="steps-circles">
          {uniqueTools.map(t => {
            const tool = INTEGRATIONS_DATA.find(i => i.id === t);
            if (!tool) return null;
            return <div key={t} className="step-circle" title={tool.name}><tool.Logo size={16} /></div>;
          })}
        </div>
        <span className="steps-summary">Searched {uniqueTools.map(t => INTEGRATIONS_DATA.find(i => i.id === t)?.name).filter(Boolean).join(", ")}</span>
      </div>
    );
  }

  // Streaming: show active state with spinner
  const lastStep = steps[steps.length - 1];
  const completedTools = uniqueTools.slice(0, -1);
  const activeToolId = lastStep?.tool;
  const activeTool = activeToolId ? INTEGRATIONS_DATA.find(i => i.id === activeToolId) : null;

  return (
    <div className="steps-compact">
      <div className="steps-circles">
        {completedTools.map(t => {
          const tool = INTEGRATIONS_DATA.find(i => i.id === t);
          if (!tool) return null;
          return <div key={t} className="step-circle step-circle-done" title={tool.name}><tool.Logo size={16} /></div>;
        })}
        {activeTool && (
          <div className="step-circle step-circle-active" title={activeTool.name}><activeTool.Logo size={16} /></div>
        )}
        {!activeToolId && <div className="step-circle step-circle-active"><span className="step-spinner" /></div>}
      </div>
      <span className="steps-summary steps-summary-active">{lastStep?.label || "Thinking…"}</span>
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
    { id: "digest", label: "Digest", icon: IconDigest, section: "workspace" },
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

/* ═══════════ ONBOARDING (Profound-style split screen) ═══════════ */
const ONBOARD_TESTIMONIALS = [
  { quote: "Orchestra replaced our morning standup with an AI digest. We save 30 minutes a day across the team.", name: "Sarah Chen", title: "Head of CX, ScaleUp", company: "scaleup" },
  { quote: "I just ask 'how are we doing?' and get a full business report pulling from Stripe, Intercom, and our database. Magical.", name: "James Rodriguez", title: "CEO, LaunchPad", company: "launchpad" },
  { quote: "Connecting our tools took 5 minutes. The first conversation saved us 3 hours of manual reporting.", name: "Priya Patel", title: "Operations Lead, GrowthCo", company: "growthco" },
];

const COMPANY_SIZES = ["1-10 employees", "11-50 employees", "51-200 employees", "201-1000 employees", "1001+ employees"];
const INDUSTRIES = ["SaaS / Software", "E-commerce", "Fintech", "Healthcare", "Agency", "Education", "Other"];

function OnboardRightPanel({ testimonialIdx = 0 }) {
  const t = ONBOARD_TESTIMONIALS[testimonialIdx % ONBOARD_TESTIMONIALS.length];
  return (
    <div className="ob-right">
      <div className="ob-right-bg" />
      <div className="ob-testimonial-card fade-in" key={testimonialIdx}>
        <div className="ob-testimonial-quote">"{t.quote}"</div>
        <div className="ob-testimonial-author">
          <div className="ob-testimonial-avatar">{t.name[0]}</div>
          <div>
            <div className="ob-testimonial-name">{t.name}</div>
            <div className="ob-testimonial-title">{t.title}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OnboardProgress({ current, total }) {
  return (
    <div className="ob-progress">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={`ob-dot ${i < current ? "ob-dot-done" : ""} ${i === current ? "ob-dot-active" : ""}`} />
      ))}
    </div>
  );
}

function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [org, setOrg] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [industry, setIndustry] = useState("");
  const { status, refresh } = useIntegrationStatus();
  const [configuring, setConfiguring] = useState(null);
  const [fieldValues, setFieldValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const connectedIds = Object.entries(status).filter(([, v]) => v).map(([k]) => k);
  const count = connectedIds.length;
  const TOTAL_STEPS = 5;

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

  // Credential entry sub-screen (within step 3)
  if (configuring) {
    const tool = INTEGRATIONS_DATA.find(t => t.id === configuring);
    return (
      <div className="ob-shell">
        <div className="ob-left">
          <div className="ob-left-header">
            <div className="ob-brand"><span className="ob-brand-icon">🎵</span> <span className="ob-brand-name">Orchestra</span></div>
          </div>
          <div className="ob-left-body fade-in">
            <button onClick={() => { setConfiguring(null); setError(null); setFieldValues({}); }} className="ob-back-btn">‹ Back</button>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
              <div className="logo-box"><tool.Logo size={24} /></div>
              <div>
                <h1 className="ob-title" style={{ marginBottom: 2 }}>Connect {tool.name}</h1>
              </div>
            </div>
            <p className="ob-subtitle">{tool.tagline}</p>

            <div className="setup-card" style={{ marginTop: 24 }}>
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
              className="ob-continue-btn"
              style={{ opacity: saving || tool.fields.some(f => !fieldValues[f.key]?.trim()) ? 0.4 : 1 }}
            >
              {saving ? "Validating & connecting..." : `Connect ${tool.name}`}
            </button>
            <p className="footnote" style={{ marginTop: 12 }}>Credentials are validated against the live API before saving.</p>
          </div>
          <div className="ob-left-footer">
            <OnboardProgress current={3} total={TOTAL_STEPS} />
          </div>
        </div>
        <OnboardRightPanel testimonialIdx={2} />
      </div>
    );
  }

  return (
    <div className="ob-shell">
      <div className="ob-left">
        <div className="ob-left-header">
          <div className="ob-brand"><span className="ob-brand-icon">🎵</span> <span className="ob-brand-name">Orchestra</span></div>
        </div>

        <div className="ob-left-body">
          {/* Step 0: Welcome + Company Name */}
          {step === 0 && (
            <div className="fade-in">
              <h1 className="ob-title">Welcome to Orchestra</h1>
              <p className="ob-subtitle">Your AI-powered business command center. Let's get you set up in under 5 minutes.</p>
              <div className="form-group" style={{ marginTop: 32 }}>
                <label className="field-label">Company name</label>
                <input
                  value={org}
                  onChange={e => setOrg(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && org.trim() && setStep(1)}
                  placeholder="e.g. Acme Inc."
                  className="field-input"
                  autoFocus
                />
              </div>
              <button
                disabled={!org.trim()}
                onClick={() => setStep(1)}
                className="ob-continue-btn"
                style={{ opacity: org.trim() ? 1 : 0.15 }}
              >Continue</button>
            </div>
          )}

          {/* Step 1: Company Size */}
          {step === 1 && (
            <div className="fade-in">
              <button onClick={() => setStep(0)} className="ob-back-btn">‹ Back</button>
              <h1 className="ob-title">Tell us about {org}</h1>
              <p className="ob-subtitle">This helps us personalize your experience.</p>

              <div className="form-group" style={{ marginTop: 28 }}>
                <label className="field-label">What's your company size?</label>
                <div className="ob-choice-grid">
                  {COMPANY_SIZES.map(s => (
                    <button key={s} onClick={() => setCompanySize(s)} className={`ob-choice-btn ${companySize === s ? "ob-choice-active" : ""}`}>{s}</button>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ marginTop: 24 }}>
                <label className="field-label">Industry</label>
                <div className="ob-choice-grid">
                  {INDUSTRIES.map(s => (
                    <button key={s} onClick={() => setIndustry(s)} className={`ob-choice-btn ${industry === s ? "ob-choice-active" : ""}`}>{s}</button>
                  ))}
                </div>
              </div>

              <button
                disabled={!companySize}
                onClick={() => setStep(2)}
                className="ob-continue-btn"
                style={{ opacity: companySize ? 1 : 0.15 }}
              >Continue</button>
            </div>
          )}

          {/* Step 2: Product Preview / Value Prop */}
          {step === 2 && (
            <div className="fade-in">
              <button onClick={() => setStep(1)} className="ob-back-btn">‹ Back</button>
              <div className="ob-integrations-preview">
                {INTEGRATIONS_DATA.slice(0, 5).map(t => <t.Logo key={t.id} size={24} />)}
              </div>
              <h1 className="ob-title">One AI agent for all your tools</h1>
              <p className="ob-subtitle">
                Orchestra connects to your Intercom, Stripe, Mailchimp, Slack, and database.
                Ask anything in plain English — pull reports, reply to conversations, check revenue, and more.
              </p>
              <div className="ob-value-list">
                <div className="ob-value-item"><span className="ob-value-icon">⚡</span><div><strong>Instant answers</strong><br /><span className="ob-value-desc">Ask "how are we doing?" and get a full business report in seconds</span></div></div>
                <div className="ob-value-item"><span className="ob-value-icon">🤖</span><div><strong>Scheduled agents</strong><br /><span className="ob-value-desc">Morning CX digests, weekly reports, and fire drills on autopilot</span></div></div>
                <div className="ob-value-item"><span className="ob-value-icon">🛡️</span><div><strong>Safety guardrails</strong><br /><span className="ob-value-desc">Destructive actions always require your explicit approval</span></div></div>
              </div>
              <button onClick={() => setStep(3)} className="ob-continue-btn">Continue</button>
            </div>
          )}

          {/* Step 3: Connect Tools */}
          {step === 3 && (
            <div className="fade-in">
              <button onClick={() => setStep(2)} className="ob-back-btn">‹ Back</button>
              <h1 className="ob-title">Connect your tools</h1>
              <p className="ob-subtitle">Paste API keys to give Orchestra access. You can always add or remove tools later.</p>

              <div className="ob-tool-list">
                {INTEGRATIONS_DATA.map(tool => {
                  const done = status[tool.id];
                  return (
                    <div key={tool.id} className="ob-tool-row">
                      <div className="logo-box" style={{ width: 36, height: 36 }}><tool.Logo size={18} /></div>
                      <div style={{ flex: 1 }}>
                        <div className="ob-tool-name">{tool.name}</div>
                        <div className="ob-tool-tagline">{tool.tagline}</div>
                      </div>
                      {done ? (
                        <span className="ob-tool-connected">✓ Connected</span>
                      ) : (
                        <button onClick={() => setConfiguring(tool.id)} className="ob-tool-connect-btn">Connect</button>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setStep(4)}
                className="ob-continue-btn"
              >
                {count > 0 ? `Continue with ${count} tool${count !== 1 ? "s" : ""}` : "Skip for now"}
              </button>
              <p className="footnote" style={{ marginTop: 12 }}>You can always add more later in Settings → Integrations</p>
            </div>
          )}

          {/* Step 4: Ready */}
          {step === 4 && (
            <div className="fade-in">
              <button onClick={() => setStep(3)} className="ob-back-btn">‹ Back</button>
              <div className="ob-ready-check">✓</div>
              <h1 className="ob-title">{org} is ready</h1>
              <p className="ob-subtitle">
                {connectedIds.length > 0
                  ? `Connected to ${connectedIds.map(id => INTEGRATIONS_DATA.find(i => i.id === id)?.name).filter(Boolean).join(", ")}. Start your first conversation.`
                  : "No tools connected yet — you can add them later in settings. Let's explore the dashboard."}
              </p>
              <button onClick={() => onComplete(connectedIds, org)} className="ob-continue-btn">Open Orchestra →</button>
            </div>
          )}
        </div>

        <div className="ob-left-footer">
          {step > 0 && <button onClick={() => setStep(s => s - 1)} className="ob-back-link">‹ Back</button>}
          <OnboardProgress current={step} total={TOTAL_STEPS} />
        </div>
      </div>
      <OnboardRightPanel testimonialIdx={step} />
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

/* ═══════════ DIGEST TAB ═══════════ */

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function DigestTab({ connected, companyName, onAction }) {
  // Persistent state — cached in localStorage so tab switches / refreshes show data instantly
  const [digest, setDigest] = useState(() => {
    try { return JSON.parse(localStorage.getItem("orch_digest")); } catch { return null; }
  });
  const [lastFetched, setLastFetched] = useState(() => localStorage.getItem("orch_digest_ts") || null);
  const [dismissed, setDismissed] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("orch_digest_dismissed") || "[]");
      // Auto-expire dismissals older than 7 days
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return raw.filter(d => new Date(d.dismissedAt).getTime() > weekAgo);
    } catch { return []; }
  });

  // Loading = first load with no cache. Refreshing = background update while showing cache.
  const [loading, setLoading] = useState(() => !localStorage.getItem("orch_digest"));
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDigest = useCallback(async (isBackground = false) => {
    if (isBackground) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${WORKER_URL}/digest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectedTools: connected, companyName }),
      });
      const data = await res.json();
      if (data.error) {
        if (!isBackground) setError(data.error);
      } else {
        const now = new Date().toISOString();
        setDigest(data);
        setLastFetched(now);
        try {
          localStorage.setItem("orch_digest", JSON.stringify(data));
          localStorage.setItem("orch_digest_ts", now);
        } catch {}
      }
    } catch (err) {
      if (!isBackground) setError(err.message);
    }
    setLoading(false);
    setRefreshing(false);
  }, [connected, companyName]);

  useEffect(() => {
    if (!connected.length) { setLoading(false); return; }
    // Have cache? Show it and refresh in background. No cache? Full load.
    if (digest) fetchDigest(true); else fetchDigest(false);
  }, []);

  const dismissAlert = useCallback((alertId) => {
    setDismissed(prev => {
      const next = [...prev, { id: alertId, dismissedAt: new Date().toISOString() }];
      try { localStorage.setItem("orch_digest_dismissed", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const clearDismissed = useCallback(() => {
    setDismissed([]);
    try { localStorage.removeItem("orch_digest_dismissed"); } catch {}
  }, []);

  const dismissedIds = new Set(dismissed.map(d => d.id));
  const visibleAlerts = (digest?.alerts || []).filter(a => !dismissedIds.has(a.id));
  const hasDismissed = dismissed.length > 0;

  const severityColor = { high: "#EF4444", medium: "#F59E0B", low: "#6366F1" };
  const severityBg = { high: "rgba(239,68,68,0.06)", medium: "rgba(245,158,11,0.06)", low: "rgba(99,102,241,0.04)" };
  const severityLabel = { high: "Urgent", medium: "Heads up", low: "FYI" };

  if (!connected.length) {
    return (
      <div className="main-content fade-in">
        <div className="content-header"><div><h1 className="page-title">Digest</h1><p className="page-subtitle">Connect your tools to see your daily briefing.</p></div></div>
        <div className="empty-state" style={{ padding: "60px 20px", textAlign: "center" }}>
          <p style={{ color: "var(--text-tertiary)", fontSize: 14 }}>No tools connected yet. Head to Integrations to get started.</p>
        </div>
      </div>
    );
  }

  const subtitle = digest?.headline
    ? digest.headline
    : loading ? "Loading your daily briefing…" : "Your daily briefing";

  return (
    <div className="main-content fade-in">
      <div className="content-header">
        <div>
          <h1 className="page-title">Digest</h1>
          <p className="page-subtitle">
            {subtitle}
            {lastFetched && !loading && (
              <span style={{ marginLeft: 8, fontSize: 11, color: "var(--text-tertiary)", fontWeight: 400 }}>
                Updated {timeAgo(lastFetched)}
              </span>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {hasDismissed && (
            <button onClick={clearDismissed} className="btn-secondary" style={{ fontSize: 11, padding: "5px 10px" }}>
              Show {dismissed.length} dismissed
            </button>
          )}
          <button onClick={() => fetchDigest(!!digest)} className="btn-secondary" disabled={loading || refreshing} style={{ opacity: (loading || refreshing) ? 0.5 : 1 }}>
            {loading ? "Loading…" : refreshing ? "Updating…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Background refresh indicator — subtle, doesn't replace content */}
      {refreshing && digest && (
        <div style={{ padding: "6px 20px", display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-tertiary)" }}>
          <div className="digest-loader" style={{ width: 14, height: 14, borderWidth: 2 }} />
          Checking for updates across {connected.map(id => INTEGRATIONS_DATA.find(i => i.id === id)?.name).filter(Boolean).join(", ")}…
        </div>
      )}

      {/* First load spinner — only when no cached data */}
      {loading && !digest && (
        <div style={{ padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div className="digest-loader" />
          <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
            Cross-referencing data from {connected.map(id => INTEGRATIONS_DATA.find(i => i.id === id)?.name).filter(Boolean).join(", ")}…
          </span>
        </div>
      )}

      {error && (
        <div style={{ padding: 20 }}>
          <div style={{ padding: "14px 18px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 10, color: "#EF4444", fontSize: 13 }}>
            {error}
          </div>
        </div>
      )}

      {visibleAlerts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 20px 20px" }}>
          {visibleAlerts.map((alert) => (
            <div key={alert.id || alert.title} className="digest-card" style={{ borderLeft: `3px solid ${severityColor[alert.severity] || severityColor.low}`, background: severityBg[alert.severity] || severityBg.low }}>
              <div className="digest-card-header">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="digest-severity" style={{ color: severityColor[alert.severity] }}>{severityLabel[alert.severity] || "Info"}</span>
                  {alert.timestamp && (
                    <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 400 }}>{timeAgo(alert.timestamp)}</span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div className="digest-sources">
                    {(alert.sources || []).map(s => {
                      const tool = INTEGRATIONS_DATA.find(t => t.id === s);
                      return tool ? <div key={s} className="digest-source-circle" title={tool.name}><tool.Logo size={14} /></div> : null;
                    })}
                  </div>
                  {alert.id && (
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      title="Dismiss"
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 6px", color: "var(--text-tertiary)", fontSize: 16, lineHeight: 1, borderRadius: 4, opacity: 0.5, transition: "opacity 0.15s" }}
                      onMouseEnter={e => e.target.style.opacity = 1}
                      onMouseLeave={e => e.target.style.opacity = 0.5}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              <div className="digest-card-title">{alert.title}</div>
              <div className="digest-card-body">{alert.body}</div>
              {alert.actions?.length > 0 && (
                <div className="digest-actions">
                  {alert.actions.map((a, ai) => (
                    <button key={ai} className="digest-action-btn" onClick={() => onAction(a.prompt)}>
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && digest && visibleAlerts.length === 0 && !error && (
        <div className="empty-state" style={{ padding: "60px 20px", textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "var(--text-tertiary)" }}>
            {hasDismissed ? "All alerts dismissed. Click \"Show dismissed\" to restore them." : "All clear — nothing urgent right now."}
          </p>
        </div>
      )}
    </div>
  );
}

/* ═══════════ CHAT TAB ═══════════ */
function ChatTab({ connected, companyName, initialPrompt, onPromptConsumed }) {
  const { messages, streaming, send, steps } = useChat(connected, companyName);
  const [input, setInput] = useState("");
  const [completedActions, setCompletedActions] = useState({});
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, streaming, steps]);

  // Handle initialPrompt from Digest action buttons
  useEffect(() => {
    if (initialPrompt && !streaming) {
      send(initialPrompt);
      onPromptConsumed?.();
    }
  }, [initialPrompt]);

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
                {m.steps?.length > 0 && <ThinkingSteps steps={m.steps} done={true} tools={m.tools} />}
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
        <div className="input-hint" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span className="model-pill">Claude Sonnet 4</span>
          <span>·</span>
          <span>{connected.map(id => INTEGRATIONS_DATA.find(i => i.id === id)?.name).filter(Boolean).join(", ")}</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════ MAIN APP ═══════════ */
function MainApp({ initialConnected, companyName }) {
  const [tab, setTab] = useState("digest");
  const [pendingChatPrompt, setPendingChatPrompt] = useState(null);
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
          {tab === "digest" && <DigestTab connected={connected} companyName={companyName} onAction={(prompt) => { setPendingChatPrompt(prompt); setTab("chat"); }} />}
          {tab === "chat" && <ChatTab connected={connected} companyName={companyName} initialPrompt={pendingChatPrompt} onPromptConsumed={() => setPendingChatPrompt(null)} />}
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
  const [view, setView] = useState(() => localStorage.getItem("orch_view") || "landing");
  const [connected, setConnected] = useState(() => {
    try { return JSON.parse(localStorage.getItem("orch_connected") || "[]"); } catch { return []; }
  });
  const [companyName, setCompanyName] = useState(() => localStorage.getItem("orch_company") || "");

  // Persist state changes to localStorage
  useEffect(() => { localStorage.setItem("orch_view", view); }, [view]);
  useEffect(() => { localStorage.setItem("orch_connected", JSON.stringify(connected)); }, [connected]);
  useEffect(() => { localStorage.setItem("orch_company", companyName); }, [companyName]);

  // On app load, sync connected tools from the worker (source of truth)
  useEffect(() => {
    if (view !== "app") return;
    fetch(`${WORKER_URL}/integrations`).then(r => r.json()).then(data => {
      if (data && typeof data === "object" && !data.error) {
        const live = Object.entries(data).filter(([, v]) => v).map(([k]) => k);
        if (live.length > 0) setConnected(live);
      }
    }).catch(() => {});
  }, [view]);

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

  /* ═══ ONBOARDING — Profound split-screen ═══ */
  .ob-shell {
    display: flex;
    min-height: 100vh;
    background: #fff;
  }
  .ob-left {
    flex: 1;
    max-width: 560px;
    display: flex;
    flex-direction: column;
    padding: 0;
  }
  .ob-left-header {
    padding: 24px 40px 0;
    flex-shrink: 0;
  }
  .ob-brand {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .ob-brand-icon { font-size: 18px; }
  .ob-brand-name {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: lowercase;
    color: var(--text-primary);
  }
  .ob-left-body {
    flex: 1;
    padding: 40px 40px 20px;
    overflow-y: auto;
  }
  .ob-left-footer {
    padding: 20px 40px 28px;
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
  }
  .ob-back-link {
    background: none;
    border: none;
    font-size: 13px;
    color: var(--text-tertiary);
    cursor: pointer;
    font-family: var(--sans);
    font-weight: 500;
    padding: 0;
  }
  .ob-back-link:hover { color: var(--text-secondary); }
  .ob-back-btn {
    background: none;
    border: none;
    font-size: 14px;
    color: var(--text-tertiary);
    cursor: pointer;
    font-family: var(--sans);
    font-weight: 500;
    padding: 0;
    margin-bottom: 24px;
    display: block;
  }
  .ob-back-btn:hover { color: var(--text-secondary); }
  .ob-title {
    font-size: 26px;
    font-weight: 800;
    color: var(--text-primary);
    line-height: 1.25;
    letter-spacing: -0.5px;
    margin-bottom: 10px;
  }
  .ob-subtitle {
    font-size: 15px;
    color: var(--text-tertiary);
    line-height: 1.6;
    margin-bottom: 8px;
  }
  .ob-continue-btn {
    width: 100%;
    padding: 14px;
    border-radius: 10px;
    background: var(--text-primary);
    color: #fff;
    border: none;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--sans);
    transition: opacity 0.15s;
    margin-top: 28px;
  }
  .ob-continue-btn:hover { opacity: 0.88; }

  /* Progress dots */
  .ob-progress {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .ob-dot {
    width: 8px;
    height: 8px;
    border-radius: 99px;
    background: var(--border);
    transition: all 0.2s;
  }
  .ob-dot-done { background: var(--text-primary); }
  .ob-dot-active { background: var(--text-primary); width: 20px; }

  /* Choice grid (company size, industry) */
  .ob-choice-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
  }
  .ob-choice-btn {
    padding: 10px 18px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: #fff;
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    font-family: var(--sans);
    transition: all 0.12s;
  }
  .ob-choice-btn:hover { border-color: var(--text-primary); color: var(--text-primary); }
  .ob-choice-active {
    border-color: var(--text-primary);
    background: var(--text-primary);
    color: #fff;
  }
  .ob-choice-active:hover { background: var(--text-primary); color: #fff; }

  /* Value prop list */
  .ob-integrations-preview {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
  }
  .ob-value-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 28px;
  }
  .ob-value-item {
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }
  .ob-value-icon {
    font-size: 20px;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .ob-value-item strong {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    display: block;
    margin-bottom: 2px;
  }
  .ob-value-desc {
    font-size: 13px;
    color: var(--text-tertiary);
    line-height: 1.5;
  }

  /* Tool list (connect step) */
  .ob-tool-list {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    margin-top: 20px;
  }
  .ob-tool-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 18px;
    border-top: 1px solid var(--border-light);
  }
  .ob-tool-row:first-child { border-top: none; }
  .ob-tool-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
  .ob-tool-tagline { font-size: 12px; color: var(--text-tertiary); margin-top: 1px; }
  .ob-tool-connected {
    font-size: 13px;
    font-weight: 600;
    color: var(--success);
    white-space: nowrap;
  }
  .ob-tool-connect-btn {
    padding: 7px 18px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: #fff;
    color: var(--text-primary);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--sans);
    white-space: nowrap;
    transition: all 0.12s;
  }
  .ob-tool-connect-btn:hover { background: var(--text-primary); color: #fff; border-color: var(--text-primary); }

  /* Ready step */
  .ob-ready-check {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    background: #f0fdf4;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--success);
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 24px;
  }

  /* Right panel */
  .ob-right {
    flex: 1;
    background: #fafafa;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
  }
  .ob-right-bg {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, #e2e8f0 1px, transparent 1px);
    background-size: 24px 24px;
    opacity: 0.5;
  }
  .ob-testimonial-card {
    position: relative;
    z-index: 1;
    background: #fff;
    border-radius: 16px;
    padding: 36px 32px;
    max-width: 400px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  }
  .ob-testimonial-quote {
    font-size: 16px;
    line-height: 1.7;
    color: var(--text-primary);
    font-weight: 450;
    margin-bottom: 24px;
  }
  .ob-testimonial-author {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .ob-testimonial-avatar {
    width: 38px;
    height: 38px;
    border-radius: 99px;
    background: var(--text-primary);
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .ob-testimonial-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }
  .ob-testimonial-title {
    font-size: 13px;
    color: var(--text-tertiary);
  }

  /* Responsive: stack on mobile */
  @media (max-width: 800px) {
    .ob-shell { flex-direction: column; }
    .ob-left { max-width: 100%; }
    .ob-right { display: none; }
    .ob-left-body { padding: 24px 24px 16px; }
    .ob-left-header { padding: 20px 24px 0; }
    .ob-left-footer { padding: 16px 24px 24px; }
  }

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
  .steps-compact { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid var(--border-light); }
  .steps-circles { display: flex; align-items: center; gap: -4px; }
  .step-circle { width: 28px; height: 28px; border-radius: 99px; display: flex; align-items: center; justify-content: center; background: var(--bg-page); border: 2px solid var(--bg-card); margin-left: -6px; position: relative; flex-shrink: 0; overflow: hidden; }
  .step-circle:first-child { margin-left: 0; }
  .step-circle-done { opacity: 1; }
  .step-circle-active { box-shadow: 0 0 0 2px rgba(99,102,241,0.25); }
  .steps-summary { font-size: 12px; color: var(--text-tertiary); font-weight: 450; }
  .steps-summary-active { color: var(--text-secondary); }
  .step-spinner { width: 12px; height: 12px; border: 2px solid var(--border); border-top-color: var(--text-secondary); border-radius: 99px; animation: spin 0.8s linear infinite; display: block; }

  /* Digest */
  .digest-card { padding: 18px 20px; border-radius: var(--radius); transition: all 0.15s; }
  .digest-card:hover { filter: brightness(0.98); }
  .digest-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .digest-severity { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; }
  .digest-sources { display: flex; align-items: center; }
  .digest-source-circle { width: 24px; height: 24px; border-radius: 99px; display: flex; align-items: center; justify-content: center; background: var(--bg-card); border: 2px solid rgba(255,255,255,0.8); margin-left: -6px; flex-shrink: 0; overflow: hidden; }
  .digest-source-circle:first-child { margin-left: 0; }
  .digest-card-title { font-size: 15px; font-weight: 650; color: var(--text-primary); margin-bottom: 6px; line-height: 1.4; }
  .digest-card-body { font-size: 13.5px; color: var(--text-secondary); line-height: 1.6; }
  .digest-actions { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
  .digest-action-btn {
    padding: 7px 14px; font-size: 12px; font-weight: 600; font-family: var(--sans);
    background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px;
    color: var(--text-primary); cursor: pointer; transition: all 0.12s;
  }
  .digest-action-btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(59,130,246,0.04); }
  .digest-loader { width: 28px; height: 28px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 99px; animation: spin 0.8s linear infinite; }

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
  .model-pill { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; background: rgba(99,102,241,0.08); color: #6366f1; border-radius: 6px; font-weight: 600; font-size: 10px; letter-spacing: 0.3px; }
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
