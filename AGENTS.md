# Orchestra — AI Business Orchestration Hub

## What is Orchestra?

Orchestra is an AI-powered business copilot that connects all the tools a company uses into one conversational interface. Think of it as a remarkably capable coworker who has access to everything — your store, your support tickets, your team conversations — and can take action across all of them.

The name comes from the idea of orchestrating multiple business tools in harmony, like instruments in an orchestra.

## Product Vision

**The problem:** Business operators juggle dozens of SaaS tools daily. Getting a holistic view of what's happening requires logging into Shopify, then Gorgias, then Slack, then back to Shopify. Running cross-tool workflows (like correlating a support spike with a specific product issue and alerting the team) is manual and painful.

**The solution:** One hub where you can:
1. **Ask anything** about your business in natural language and get answers that span all your tools
2. **Take actions** directly — fix a promo code in Shopify, draft a customer response, post a digest to Slack
3. **Set up agents** that run on autopilot — morning CX digests, weekly sales reports, refund monitors

**The feel:** It should feel like delegating work to a brilliant coworker, not typing into a chatbot. Inspired by Claude Cowork's task-oriented interface with visible progress steps, actionable cards, and a sense that real work is being done.

## Design Principles

1. **Minimal and clean** — Notion/Linear-level polish. White backgrounds, generous whitespace, no unnecessary color. The only color comes from integration logos and status indicators.
2. **Actionable over informational** — Every response should end with concrete next steps the user can click to execute. The empty state shows task cards, not a blank chat.
3. **Trust through transparency** — Show which tools are being accessed (tool pills), show progress steps as work happens, and always require confirmation for destructive actions.
4. **Simple onboarding** — No OAuth jargon. "Here's what your agent can do" in plain English. Capabilities, not permissions.
5. **Venture-backed quality** — This should look like a product with $10M+ in funding. Every pixel matters.

## Tech Stack

### Current (MVP Prototype)
- **Frontend:** React (single-file JSX artifact)
- **Fonts:** Sora (body, logo — geometric, OpenAI-style) + Newsreader (serif headings)
- **AI:** Claude Sonnet via Anthropic API (direct fetch, no SDK)
- **Integrations:** Simulated connections (Shopify, Slack, Gorgias)

### Target Architecture
- **Frontend:** Next.js or Vite + React
- **Backend:** Node.js / Cloudflare Workers
- **AI Layer:** Claude API with tool use / function calling
- **Integrations:** MCP (Model Context Protocol) servers for each tool
  - Shopify Admin API via MCP
  - Slack API via MCP
  - Gorgias API via MCP
- **Auth:** OAuth 2.0 for each integration, managed per-workspace
- **Database:** Postgres (workspaces, agents, connection configs, audit logs)
- **Queue:** For scheduled agent runs (cron-based)

## Current Features

### 1. Onboarding Flow
- Step 0: Company name input
- Step 1: Connect tools — shows real SVG logos (Shopify, Slack, Gorgias), expandable capability lists in plain English, simulated OAuth connection
- Step 2: Confirmation screen

### 2. Chat Tab (Cowork-style)
- **Empty state:** 2-column grid of task cards — "CX Health Check," "Sales Overview," "Team Pulse," "Fire Drill," "Draft Customer Response," "Weekly Report." Each card shows which tools it uses and populates a detailed prompt on click.
- **Thinking steps:** When processing, shows animated step-by-step progress — "Understanding your request" → "Pulling data from Gorgias" → "Analyzing and preparing response." Spinner on active step, green check on completed.
- **Structured responses:** Full-width response cards (not chat bubbles) with tool pills, body text with bold metrics, and clickable action cards at the bottom.
- **Action cards:** Each suggested action is a clickable button. Click it and Orchestra executes that specific action. Completed actions get checked off.
- **Real API:** Chat is wired to Claude Sonnet API with a system prompt that structures responses with → actions.

### 3. Agents Tab
- **Agent list:** Cards showing name, status dot (active/paused), description, schedule, and tool pills
- **Agent detail:** Full view with schedule, last run time, tools, latest output, and buttons to run now / pause / delete
- **New agent flow:** Two-step creation — (1) name + plain English instructions, (2) select tools from connected integrations + pick schedule from pill-style options

### 4. Integrations Tab
- Shows all available integrations with connect/disconnect toggles
- Expandable capability lists
- Status dots for connected tools
- "Coming soon" section (Salesforce, HubSpot, Zendesk, Stripe)
- Changes propagate across the whole app (chat system prompt, agent tool picker, header icons)

## File Structure

```
orchestra/
├── AGENTS.md          ← This file. Product context and instructions.
├── orchestra.jsx      ← Complete MVP prototype (single-file React component)
└── README.md          ← Setup and development guide
```

## Integration Architecture (Target)

Each integration connects via MCP (Model Context Protocol). The pattern for each:

### Shopify
- **Connection:** OAuth 2.0 → Shopify Admin API
- **Read:** Orders, products, customers, inventory, analytics
- **Write:** Create discount codes, update products/pricing, process refunds
- **Guardrail:** Refunds, bulk updates, and publishing changes require user confirmation

### Slack
- **Connection:** OAuth 2.0 → Slack API (bot token)
- **Read:** Messages, channels, threads, users
- **Write:** Send messages, create channels, post to threads
- **Guardrail:** Sending messages and creating channels require user confirmation

### Gorgias
- **Connection:** API key + subdomain
- **Read:** Tickets, customers, satisfaction scores, macros
- **Write:** Reply to tickets, assign tickets, add tags, close tickets
- **Guardrail:** Sending customer-facing replies requires user confirmation

### Future Integrations
- Salesforce (CRM)
- HubSpot (Marketing)
- Zendesk (Support alternative)
- Stripe (Payments)
- Google Workspace (Docs, Sheets, Calendar)
- Notion (Knowledge base)

## Agent System (Target Architecture)

Agents are scheduled automations defined in natural language:

```
Agent {
  id: string
  name: string
  description: string        // Plain English instructions
  schedule: CronExpression
  tools: IntegrationId[]     // Which integrations this agent can use
  active: boolean
  system_prompt: string      // Auto-generated from description + tool context
  output_destination: string // Where results go (Slack channel, email, dashboard)
  last_run: timestamp
  last_output: string
}
```

**Execution flow:**
1. Cron triggers agent at scheduled time
2. System builds a prompt from agent description + tool context
3. Claude executes with MCP tool access
4. Output is stored and delivered to destination
5. User can view output, re-run, or modify agent

## UI/UX Reference

- **Layout inspiration:** Claude.ai (minimal top bar with tabs), Notion (clean card layouts), Linear (precise typography)
- **Empty state inspiration:** Claude Cowork (big actionable task cards, not a blank chat)
- **Response format inspiration:** Cowork's step-by-step progress + actionable outputs
- **Typography:** Sora for body and logo (geometric, modern), Newsreader for headings (editorial warmth)
- **Color:** Almost entirely monochrome. Black text, white backgrounds, light gray borders. Color only from integration logos and green status indicators.

## Key Decisions

1. **No chat bubbles for AI responses** — Full-width response cards feel more like a work tool, less like a chatbot
2. **Task cards over suggestion chips** — Bigger, more descriptive, with tool attribution. Feels like delegating work.
3. **Steps are always visible** — Users should see what Orchestra is doing, not just get a response after a delay
4. **Actions are first-class** — Every response should end with things the user can click to move forward
5. **Plain English capabilities** — Never show "read:orders write:orders" — instead "View and search all orders, customers, and products"
6. **Confirmation on destructive actions** — Read is free, write needs approval. This is stated explicitly in the UI.

## Development Priorities

### Phase 1: Working MVP (Current)
- [x] Onboarding flow with tool connection
- [x] Chat with real Claude API
- [x] Cowork-style task cards and thinking steps
- [x] Action cards in responses
- [x] Agent creation, listing, detail view
- [x] Integrations management page

### Phase 2: Real Integrations
- [ ] Shopify MCP server (read orders, products, customers)
- [ ] Slack MCP server (read/send messages)
- [ ] Gorgias MCP server (read tickets, draft responses)
- [ ] OAuth flow for each integration
- [ ] Real data in chat responses

### Phase 3: Agent Execution
- [ ] Cron-based agent scheduling
- [ ] Agent execution with MCP tools
- [ ] Output storage and delivery
- [ ] Agent edit/versioning

### Phase 4: Polish & Scale
- [ ] Multi-workspace support
- [ ] Team/role permissions
- [ ] Audit log for all actions
- [ ] More integrations (Salesforce, Stripe, etc.)
- [ ] Model selection (Claude, GPT, etc.)
- [ ] Local computer access (future)
