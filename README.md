# Orchestra

Your business, one conversation away.

Orchestra is an AI orchestration hub that connects your business tools (Shopify, Slack, Gorgias, and more) into a single conversational interface. Ask questions across your entire business, take actions, and set up automations that run on autopilot.

## Quick Start

The current MVP is a single-file React component (`orchestra.jsx`) that can be run in any React environment.

### Running locally

```bash
# Create a new Vite + React project
npm create vite@latest orchestra-app -- --template react
cd orchestra-app

# Replace src/App.jsx with orchestra.jsx
cp ../orchestra.jsx src/App.jsx

# Install dependencies
npm install

# Start dev server
npm run dev
```

### Running in Claude

You can also paste `orchestra.jsx` directly as a React artifact in Claude.ai — it's a self-contained component with no external dependencies beyond React and two Google Fonts (Sora + Newsreader).

## How It Works

1. **Onboard** — Enter your company name and connect your tools
2. **Chat** — Pick a task card or type what you need. Orchestra pulls data from your connected tools and responds with structured insights and actionable next steps.
3. **Agents** — Create automations that run on a schedule (e.g., "Every weekday at 7 AM, scan support tickets and post a digest to Slack")
4. **Integrations** — Manage which tools Orchestra can access

## Architecture

See `AGENTS.md` for full product context, architecture decisions, and development roadmap.

## Stack

- React (single-file JSX)
- Sora + Newsreader fonts
- Claude Sonnet API (Anthropic)
- MCP integrations (target architecture)
