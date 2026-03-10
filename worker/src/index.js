/**
 * Orchestra API — Cloudflare Worker
 * Direct API keys (stored in KV via app UI) + agentic Claude
 * Integrations: Intercom, Stripe, Mailchimp, Slack, PlanetScale
 */

import { connect } from "@planetscale/database";

// ─── CF-compatible fetch for PlanetScale (strips unsupported `cache` option) ─
function cfFetch(url, init) {
  if (init) {
    const { cache, ...rest } = init;
    return fetch(url, rest);
  }
  return fetch(url);
}

function psConnect(opts) {
  return connect({ ...opts, fetch: cfFetch });
}

// ─── CORS ────────────────────────────────────────────────────────────────────

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function corsJson(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

function jsonError(message, status) {
  return corsJson({ error: message }, status);
}

// ─── Router ──────────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Integration status
    if (path === "/integrations" && request.method === "GET")
      return handleIntegrations(env);

    // Configure integration (save/delete keys)
    if (path === "/integrations/configure" && request.method === "POST")
      return handleConfigure(request, env);
    if (path === "/integrations/configure" && request.method === "DELETE")
      return handleDisconnect(request, env);

    // Chat
    if (path === "/chat" && request.method === "POST")
      return handleChat(request, env);

    // Digest — AI-generated homescreen briefing
    if (path === "/digest" && request.method === "POST")
      return handleDigest(request, env);

    return jsonError("Not found", 404);
  },
};

// ─── Integration Status ──────────────────────────────────────────────────────

async function handleIntegrations(env) {
  const [intercomToken, mailchimpKey, stripeKey, slackToken] = await Promise.all([
    env.ORCHESTRA_KV.get("intercom_token"),
    env.ORCHESTRA_KV.get("mailchimp_api_key"),
    env.ORCHESTRA_KV.get("stripe_api_key"),
    env.ORCHESTRA_KV.get("slack_bot_token"),
  ]);

  // Check database connectivity
  let dbConnected = false;
  const dbHost = await env.ORCHESTRA_KV.get("db_host");
  const dbUser = await env.ORCHESTRA_KV.get("db_username");
  const dbPass = await env.ORCHESTRA_KV.get("db_password");
  if (dbHost && dbUser) {
    try {
      const conn = psConnect({ host: dbHost, username: dbUser, password: dbPass });
      await conn.execute("SELECT 1");
      dbConnected = true;
    } catch {
      dbConnected = false;
    }
  }

  return corsJson({
    intercom: !!intercomToken,
    mailchimp: !!mailchimpKey,
    stripe: !!stripeKey,
    slack: !!slackToken,
    database: dbConnected,
  });
}

// ─── Configure Integration (Save Keys to KV) ────────────────────────────────

async function handleConfigure(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const { provider, credentials } = body;
  if (!provider || !credentials) return jsonError("provider and credentials required", 400);

  switch (provider) {
    case "intercom":
      if (!credentials.access_token) return jsonError("access_token required", 400);
      // Validate token
      try {
        const res = await fetch("https://api.intercom.io/me", {
          headers: { Authorization: `Bearer ${credentials.access_token}`, Accept: "application/json", "Intercom-Version": "2.11" },
        });
        if (!res.ok) return jsonError("Invalid Intercom access token", 400);
      } catch (e) {
        return jsonError(`Failed to validate: ${e.message}`, 400);
      }
      await env.ORCHESTRA_KV.put("intercom_token", credentials.access_token);
      break;

    case "mailchimp":
      if (!credentials.api_key) return jsonError("api_key required", 400);
      // Extract datacenter from key (format: xxx-us21)
      const dcMatch = credentials.api_key.match(/-(\w+)$/);
      if (!dcMatch) return jsonError("Invalid Mailchimp API key format (expected xxx-us21)", 400);
      // Validate
      try {
        const res = await fetch(`https://${dcMatch[1]}.api.mailchimp.com/3.0/`, {
          headers: { Authorization: `Bearer ${credentials.api_key}` },
        });
        if (!res.ok) return jsonError("Invalid Mailchimp API key", 400);
      } catch (e) {
        return jsonError(`Failed to validate: ${e.message}`, 400);
      }
      await env.ORCHESTRA_KV.put("mailchimp_api_key", credentials.api_key);
      await env.ORCHESTRA_KV.put("mailchimp_dc", dcMatch[1]);
      break;

    case "stripe":
      if (!credentials.api_key) return jsonError("api_key required", 400);
      // Validate
      try {
        const res = await fetch("https://api.stripe.com/v1/balance", {
          headers: { Authorization: `Bearer ${credentials.api_key}` },
        });
        if (!res.ok) return jsonError("Invalid Stripe API key", 400);
      } catch (e) {
        return jsonError(`Failed to validate: ${e.message}`, 400);
      }
      await env.ORCHESTRA_KV.put("stripe_api_key", credentials.api_key);
      break;

    case "slack":
      if (!credentials.bot_token) return jsonError("bot_token required", 400);
      // Validate
      try {
        const res = await fetch("https://slack.com/api/auth.test", {
          headers: { Authorization: `Bearer ${credentials.bot_token}` },
        });
        const data = await res.json();
        if (!data.ok) return jsonError(`Invalid Slack token: ${data.error}`, 400);
      } catch (e) {
        return jsonError(`Failed to validate: ${e.message}`, 400);
      }
      await env.ORCHESTRA_KV.put("slack_bot_token", credentials.bot_token);
      break;

    case "database":
      if (!credentials.host || !credentials.username) return jsonError("host and username required", 400);
      // Validate
      try {
        const conn = psConnect({ host: credentials.host, username: credentials.username, password: credentials.password || "" });
        await conn.execute("SELECT 1");
      } catch (e) {
        return jsonError(`Database connection failed: ${e.message}`, 400);
      }
      await env.ORCHESTRA_KV.put("db_host", credentials.host);
      await env.ORCHESTRA_KV.put("db_username", credentials.username);
      if (credentials.password) await env.ORCHESTRA_KV.put("db_password", credentials.password);
      break;

    default:
      return jsonError(`Unknown provider: ${provider}`, 400);
  }

  return corsJson({ ok: true, connected: provider });
}

// ─── Disconnect ──────────────────────────────────────────────────────────────

async function handleDisconnect(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const { provider } = body;
  const keysMap = {
    intercom: ["intercom_token"],
    mailchimp: ["mailchimp_api_key", "mailchimp_dc"],
    stripe: ["stripe_api_key"],
    slack: ["slack_bot_token"],
    database: ["db_host", "db_username", "db_password"],
  };

  const keys = keysMap[provider];
  if (!keys) return jsonError(`Unknown provider: ${provider}`, 400);

  await Promise.all(keys.map((k) => env.ORCHESTRA_KV.delete(k)));
  return corsJson({ ok: true, disconnected: provider });
}

// ─── /chat ───────────────────────────────────────────────────────────────────

async function handleChat(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const { messages, connectedTools = [], companyName = "" } = body;
  if (!messages?.length) return jsonError("messages required", 400);

  const liveTools = await resolveLiveTools(connectedTools, env);
  const tools = buildTools(liveTools);
  const systemPrompt = buildSystemPrompt(companyName, liveTools);

  // Keep only last 10 messages to stay within token limits
  const trimmed = messages.slice(-10);
  const allMessages = [...trimmed];
  let response;

  for (let i = 0; i < 4; i++) {
    const llmRes = await callLLM(env, {
      provider: "anthropic",
      model: "claude-sonnet-4-6",
      system: systemPrompt,
      messages: allMessages,
      tools,
    });

    if (!llmRes.ok) {
      const err = await llmRes.text();
      return jsonError(`LLM error: ${err}`, 502);
    }

    response = await llmRes.json();
    if (response.stop_reason !== "tool_use") break;

    const toolResults = await executeTools(response.content, env);
    allMessages.push({ role: "assistant", content: response.content });
    allMessages.push({ role: "user", content: toolResults });
  }

  return corsJson({ ...response, _model: "claude-sonnet-4-6" });
}

// ─── /digest — AI-generated homescreen briefing ─────────────────────────────
// Fetches data DIRECTLY from APIs first, then one lean LLM call (no tools).

async function handleDigest(request, env) {
  let body;
  try { body = await request.json(); } catch { return jsonError("Invalid JSON", 400); }

  const { connectedTools = [], companyName = "" } = body;
  const liveTools = await resolveLiveTools(connectedTools, env);
  if (!liveTools.length) return corsJson({ alerts: [], headline: "Connect your tools to see your daily digest." });

  // Step 1: Fetch snapshots directly from each connected API (no AI involved)
  const snapshots = {};
  for (const tool of liveTools) {
    try {
      if (tool === "intercom") {
        const data = await intercom(env, "POST", "conversations/search", {
          query: { field: "state", operator: "=", value: "open" },
          pagination: { per_page: 5 },
        });
        snapshots.intercom = JSON.stringify(data).slice(0, 2000);
      } else if (tool === "stripe") {
        const data = await stripe(env, "GET", "charges?limit=5");
        snapshots.stripe = JSON.stringify(data).slice(0, 2000);
      } else if (tool === "mailchimp") {
        const data = await mailchimp(env, "GET", "campaigns?count=3&sort_field=send_time&sort_dir=DESC");
        snapshots.mailchimp = JSON.stringify(data).slice(0, 2000);
      }
    } catch (e) {
      snapshots[tool] = `Error fetching: ${e.message}`;
    }
  }

  if (!Object.keys(snapshots).length) {
    return corsJson({ alerts: [], headline: "No data available right now." });
  }

  // Step 2: One LLM call with the raw data — NO tools, no agentic loop
  const dataStr = Object.entries(snapshots).map(([k, v]) => `[${k}]: ${v}`).join("\n\n");
  const digestPrompt = `Data from ${companyName || "this company"}'s tools:\n\n${dataStr}\n\nReturn ONLY JSON (no markdown):\n{"headline":"one-line summary","alerts":[{"severity":"high|medium|low","title":"short title","body":"1-2 sentences with real numbers","sources":["toolname"],"actions":[{"label":"button text","prompt":"chat prompt"}]}]}\n1-3 alerts by severity.`;

  const llmRes = await callLLM(env, {
    provider: "anthropic",
    model: "claude-sonnet-4-6",
    system: "Concise business analyst. Return only valid JSON.",
    messages: [{ role: "user", content: digestPrompt }],
    tools: [],
  });

  if (!llmRes.ok) {
    const err = await llmRes.text();
    return jsonError(`LLM error: ${err}`, 502);
  }

  const response = await llmRes.json();
  const text = response.content?.map(b => b.text || "").join("") || "";
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return corsJson(JSON.parse(jsonMatch[0]));
    return corsJson({ alerts: [], headline: "Couldn't parse digest. Try refreshing." });
  } catch {
    return corsJson({ alerts: [], headline: "Couldn't parse digest. Try refreshing." });
  }
}

async function resolveLiveTools(requested, env) {
  const live = [];
  for (const tool of requested) {
    if (tool === "intercom" && (await env.ORCHESTRA_KV.get("intercom_token"))) live.push("intercom");
    else if (tool === "mailchimp" && (await env.ORCHESTRA_KV.get("mailchimp_api_key"))) live.push("mailchimp");
    else if (tool === "stripe" && (await env.ORCHESTRA_KV.get("stripe_api_key"))) live.push("stripe");
    else if (tool === "slack" && (await env.ORCHESTRA_KV.get("slack_bot_token"))) live.push("slack");
    else if (tool === "database" && (await env.ORCHESTRA_KV.get("db_host"))) live.push("database");
  }
  return live;
}

// ─── LLM Router ──────────────────────────────────────────────────────────────

function callLLM(env, { provider, model, system, messages, tools }) {
  if (provider === "anthropic") {
    return fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        system,
        messages,
        tools: tools.length ? tools : undefined,
      }),
    });
  }
  throw new Error(`Unsupported LLM provider: ${provider}`);
}

// ─── Tool Execution ──────────────────────────────────────────────────────────

const MAX_TOOL_RESULT_CHARS = 3000;

function truncateResult(str) {
  if (str.length <= MAX_TOOL_RESULT_CHARS) return str;
  return str.slice(0, MAX_TOOL_RESULT_CHARS) + "\n...[truncated — result too large]";
}

async function executeTools(contentBlocks, env) {
  const results = await Promise.all(
    contentBlocks
      .filter((b) => b.type === "tool_use")
      .map(async (block) => {
        let result;
        try {
          result = await runTool(block.name, block.input, env);
        } catch (err) {
          result = { error: err.message };
        }
        return { type: "tool_result", tool_use_id: block.id, content: truncateResult(JSON.stringify(result)) };
      })
  );
  return results;
}

async function runTool(name, input, env) {
  switch (name) {
    // ── Intercom ───────────────────────────────────────────────────────────────
    case "intercom_search_conversations": {
      const filters = [
        ...(input.state ? [{ field: "state", operator: "=", value: input.state }] : []),
        ...(input.query ? [{ field: "source.body", operator: "~", value: input.query }] : []),
      ];
      // If no filters, default to listing open conversations
      if (!filters.length) filters.push({ field: "state", operator: "=", value: "open" });
      return intercom(env, "POST", "conversations/search", {
        query: filters.length === 1 ? filters[0] : { operator: "AND", value: filters },
        pagination: { per_page: input.limit ?? 20 },
      });
    }
    case "intercom_get_conversation":
      return intercom(env, "GET", `conversations/${input.conversation_id}`);
    case "intercom_search_contacts": {
      const cFilters = [
        ...(input.email ? [{ field: "email", operator: "=", value: input.email }] : []),
        ...(input.name ? [{ field: "name", operator: "~", value: input.name }] : []),
      ];
      if (!cFilters.length) cFilters.push({ field: "role", operator: "=", value: "user" });
      return intercom(env, "POST", "contacts/search", {
        query: cFilters.length === 1 ? cFilters[0] : { operator: "AND", value: cFilters },
        pagination: { per_page: input.limit ?? 10 },
      });
    }
    case "intercom_get_contact":
      return intercom(env, "GET", `contacts/${input.contact_id}`);
    case "intercom_list_tags":
      return intercom(env, "GET", "tags");
    case "intercom_list_teams":
      return intercom(env, "GET", "teams");
    case "intercom_reply_conversation":
      return intercom(env, "POST", `conversations/${input.conversation_id}/reply`, { message_type: "comment", type: "admin", admin_id: input.admin_id, body: input.body });
    case "intercom_note_conversation":
      return intercom(env, "POST", `conversations/${input.conversation_id}/reply`, { message_type: "note", type: "admin", admin_id: input.admin_id, body: input.body });
    case "intercom_close_conversation":
      return intercom(env, "POST", `conversations/${input.conversation_id}/parts`, { message_type: "close", type: "admin", admin_id: input.admin_id, body: input.body || "Closed by Orchestra" });
    case "intercom_snooze_conversation":
      return intercom(env, "POST", `conversations/${input.conversation_id}/reply`, { message_type: "snoozed", type: "admin", admin_id: input.admin_id, snoozed_until: input.snoozed_until });
    case "intercom_assign_conversation":
      return intercom(env, "POST", `conversations/${input.conversation_id}/parts`, { message_type: "assignment", type: "admin", admin_id: input.admin_id, assignee_id: input.assignee_id, body: input.body || "" });
    case "intercom_tag_conversation":
      return intercom(env, "POST", `conversations/${input.conversation_id}/tags`, { id: input.tag_id });
    case "intercom_create_contact":
      return intercom(env, "POST", "contacts", { role: input.role || "user", email: input.email, name: input.name, ...(input.phone ? { phone: input.phone } : {}), ...(input.custom_attributes ? { custom_attributes: input.custom_attributes } : {}) });
    case "intercom_update_contact":
      return intercom(env, "PUT", `contacts/${input.contact_id}`, { ...(input.name ? { name: input.name } : {}), ...(input.email ? { email: input.email } : {}), ...(input.phone ? { phone: input.phone } : {}), ...(input.custom_attributes ? { custom_attributes: input.custom_attributes } : {}) });
    case "intercom_merge_contacts":
      return intercom(env, "POST", "contacts/merge", { from: input.from_contact_id, into: input.into_contact_id });

    // ── Stripe ─────────────────────────────────────────────────────────────────
    case "stripe_list_customers":
      return stripe(env, "GET", "customers", { limit: input.limit ?? 20, ...(input.email ? { email: input.email } : {}) });
    case "stripe_get_customer":
      return stripe(env, "GET", `customers/${input.customer_id}`);
    case "stripe_list_charges":
      return stripe(env, "GET", "charges", { limit: input.limit ?? 20, ...(input.customer ? { customer: input.customer } : {}) });
    case "stripe_list_subscriptions":
      return stripe(env, "GET", "subscriptions", { limit: input.limit ?? 20, ...(input.status ? { status: input.status } : {}), ...(input.customer ? { customer: input.customer } : {}) });
    case "stripe_get_subscription":
      return stripe(env, "GET", `subscriptions/${input.subscription_id}`);
    case "stripe_list_invoices":
      return stripe(env, "GET", "invoices", { limit: input.limit ?? 20, ...(input.customer ? { customer: input.customer } : {}), ...(input.status ? { status: input.status } : {}) });
    case "stripe_get_balance":
      return stripe(env, "GET", "balance");
    case "stripe_list_payment_intents":
      return stripe(env, "GET", "payment_intents", { limit: input.limit ?? 20, ...(input.customer ? { customer: input.customer } : {}) });
    case "stripe_search_customers":
      return stripe(env, "GET", "customers/search", { query: input.query });
    case "stripe_list_products":
      return stripe(env, "GET", "products", { limit: input.limit ?? 20, active: input.active ?? true });
    case "stripe_list_prices":
      return stripe(env, "GET", "prices", { limit: input.limit ?? 20, ...(input.product ? { product: input.product } : {}) });

    // ── Mailchimp ──────────────────────────────────────────────────────────────
    case "mailchimp_list_audiences":
      return mailchimp(env, "GET", "lists", { count: input.limit ?? 10 });
    case "mailchimp_get_audience":
      return mailchimp(env, "GET", `lists/${input.list_id}`);
    case "mailchimp_list_campaigns":
      return mailchimp(env, "GET", "campaigns", { count: input.limit ?? 20, ...(input.status ? { status: input.status } : {}) });
    case "mailchimp_get_campaign":
      return mailchimp(env, "GET", `campaigns/${input.campaign_id}`);
    case "mailchimp_get_campaign_report":
      return mailchimp(env, "GET", `reports/${input.campaign_id}`);
    case "mailchimp_search_members":
      return mailchimp(env, "GET", "search-members", { query: input.query });
    case "mailchimp_list_segments":
      return mailchimp(env, "GET", `lists/${input.list_id}/segments`, { count: input.limit ?? 20 });
    case "mailchimp_add_member":
      return mailchimp(env, "POST", `lists/${input.list_id}/members`, null, { email_address: input.email, status: input.status || "subscribed", ...(input.merge_fields ? { merge_fields: input.merge_fields } : {}) });
    case "mailchimp_update_member": {
      const hash = await md5(input.email.toLowerCase());
      return mailchimp(env, "PATCH", `lists/${input.list_id}/members/${hash}`, null, { ...(input.merge_fields ? { merge_fields: input.merge_fields } : {}), ...(input.status ? { status: input.status } : {}) });
    }
    case "mailchimp_create_campaign":
      return mailchimp(env, "POST", "campaigns", null, { type: input.type || "regular", recipients: { list_id: input.list_id }, settings: { subject_line: input.subject, from_name: input.from_name, reply_to: input.reply_to } });
    case "mailchimp_set_campaign_content":
      return mailchimp(env, "PUT", `campaigns/${input.campaign_id}/content`, null, { html: input.html });
    case "mailchimp_send_campaign":
      return mailchimp(env, "POST", `campaigns/${input.campaign_id}/actions/send`);
    case "mailchimp_create_segment":
      return mailchimp(env, "POST", `lists/${input.list_id}/segments`, null, { name: input.name, static_segment: input.emails || [] });
    case "mailchimp_tag_member": {
      const hash = await md5(input.email.toLowerCase());
      return mailchimp(env, "POST", `lists/${input.list_id}/members/${hash}/tags`, null, { tags: input.tags.map((t) => ({ name: t, status: "active" })) });
    }

    // ── Slack ──────────────────────────────────────────────────────────────────
    case "slack_list_channels":
      return slack(env, "conversations.list", { types: "public_channel,private_channel", limit: input.limit ?? 50 });
    case "slack_post_message":
      return slack(env, "chat.postMessage", null, { channel: input.channel, text: input.text, ...(input.blocks ? { blocks: input.blocks } : {}) });
    case "slack_list_messages":
      return slack(env, "conversations.history", { channel: input.channel, limit: input.limit ?? 20 });
    case "slack_search_messages":
      return slack(env, "search.messages", { query: input.query, count: input.limit ?? 20 });
    case "slack_get_user":
      return slack(env, "users.info", { user: input.user_id });
    case "slack_list_users":
      return slack(env, "users.list", { limit: input.limit ?? 100 });

    // ── Database ───────────────────────────────────────────────────────────────
    case "db_list_tables": {
      const conn = await getDb(env);
      const rows = await conn.execute("SELECT table_name, table_type FROM information_schema.tables WHERE table_schema = DATABASE() ORDER BY table_name");
      return { tables: rows.rows };
    }
    case "db_describe_table": {
      const conn = await getDb(env);
      const rows = await conn.execute(`SELECT column_name, data_type, is_nullable, column_key, column_default, extra FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = '${escapeSql(input.table_name)}' ORDER BY ordinal_position`);
      return { table: input.table_name, columns: rows.rows };
    }
    case "db_query": {
      const query = input.query.trim();
      if (!/^SELECT\s/i.test(query)) throw new Error("Only SELECT queries allowed via db_query.");
      const conn = await getDb(env);
      const result = await conn.execute(query);
      return { rows: result.rows, rowCount: result.rows.length };
    }
    case "db_insert": {
      const conn = await getDb(env);
      const cols = Object.keys(input.data);
      const vals = Object.values(input.data);
      const sql = `INSERT INTO ${escapeSql(input.table_name)} (${cols.map(escapeSql).join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`;
      const result = await conn.execute(sql, vals);
      return { ok: true, insertId: result.insertId, rowsAffected: result.rowsAffected };
    }
    case "db_update": {
      const conn = await getDb(env);
      const setClauses = Object.keys(input.data).map((k) => `${escapeSql(k)} = ?`).join(", ");
      const vals = [...Object.values(input.data), ...Object.values(input.where || {})];
      const whereClauses = Object.keys(input.where || {}).map((k) => `${escapeSql(k)} = ?`).join(" AND ");
      if (!whereClauses) throw new Error("WHERE clause required");
      const result = await conn.execute(`UPDATE ${escapeSql(input.table_name)} SET ${setClauses} WHERE ${whereClauses}`, vals);
      return { ok: true, rowsAffected: result.rowsAffected };
    }
    case "db_delete": {
      const conn = await getDb(env);
      const vals = Object.values(input.where || {});
      const whereClauses = Object.keys(input.where || {}).map((k) => `${escapeSql(k)} = ?`).join(" AND ");
      if (!whereClauses) throw new Error("WHERE clause required");
      const result = await conn.execute(`DELETE FROM ${escapeSql(input.table_name)} WHERE ${whereClauses}`, vals);
      return { ok: true, rowsAffected: result.rowsAffected };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ─── API Helpers ─────────────────────────────────────────────────────────────

async function intercom(env, method, path, body = null) {
  const token = await env.ORCHESTRA_KV.get("intercom_token");
  if (!token) throw new Error("Intercom not connected");
  const res = await fetch(`https://api.intercom.io/${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json", "Intercom-Version": "2.11" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) { const err = await res.text(); throw new Error(`Intercom ${res.status}: ${err}`); }
  return res.json();
}

async function stripe(env, method, path, params = null) {
  const key = await env.ORCHESTRA_KV.get("stripe_api_key");
  if (!key) throw new Error("Stripe not connected");
  let url = `https://api.stripe.com/v1/${path}`;
  if (params) {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)])));
    if (qs.toString()) url += `?${qs}`;
  }
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
  });
  if (!res.ok) { const err = await res.text(); throw new Error(`Stripe ${res.status}: ${err}`); }
  return res.json();
}

async function mailchimp(env, method, path, params = null, body = null) {
  const apiKey = await env.ORCHESTRA_KV.get("mailchimp_api_key");
  const dc = await env.ORCHESTRA_KV.get("mailchimp_dc");
  if (!apiKey || !dc) throw new Error("Mailchimp not connected");
  let url = `https://${dc}.api.mailchimp.com/3.0/${path}`;
  if (params) {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v != null)));
    if (qs.toString()) url += `?${qs}`;
  }
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) { const err = await res.text(); throw new Error(`Mailchimp ${res.status}: ${err}`); }
  if (res.status === 204) return { ok: true };
  return res.json();
}

async function slack(env, method, params = null, body = null) {
  const token = await env.ORCHESTRA_KV.get("slack_bot_token");
  if (!token) throw new Error("Slack not connected");
  let url = `https://slack.com/api/${method}`;
  const opts = { headers: { Authorization: `Bearer ${token}` } };
  if (body) {
    opts.method = "POST";
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  } else {
    opts.method = "GET";
    if (params) {
      const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)])));
      if (qs.toString()) url += `?${qs}`;
    }
  }
  const res = await fetch(url, opts);
  return res.json();
}

async function getDb(env) {
  const host = await env.ORCHESTRA_KV.get("db_host");
  const username = await env.ORCHESTRA_KV.get("db_username");
  const password = await env.ORCHESTRA_KV.get("db_password");
  if (!host) throw new Error("Database not connected");
  return psConnect({ host, username, password: password || "" });
}

// ─── Tool Definitions ────────────────────────────────────────────────────────

function buildTools(connectedTools) {
  const tools = [];

  if (connectedTools.includes("intercom")) {
    tools.push(
      { name: "intercom_search_conversations", description: "Search conversations. Filter by state.", input_schema: { type: "object", properties: { state: { type: "string", enum: ["open", "closed", "snoozed"] }, query: { type: "string" }, limit: { type: "number" } } } },
      { name: "intercom_get_conversation", description: "Get conversation details.", input_schema: { type: "object", properties: { conversation_id: { type: "string" } }, required: ["conversation_id"] } },
      { name: "intercom_search_contacts", description: "Search contacts.", input_schema: { type: "object", properties: { email: { type: "string" }, name: { type: "string" }, limit: { type: "number" } } } },
      { name: "intercom_get_contact", description: "Get contact details.", input_schema: { type: "object", properties: { contact_id: { type: "string" } }, required: ["contact_id"] } },
      { name: "intercom_list_tags", description: "List tags.", input_schema: { type: "object", properties: {} } },
      { name: "intercom_reply_conversation", description: "Reply to a conversation.", input_schema: { type: "object", properties: { conversation_id: { type: "string" }, admin_id: { type: "string" }, body: { type: "string" } }, required: ["conversation_id", "admin_id", "body"] } },
      { name: "intercom_note_conversation", description: "Add internal note.", input_schema: { type: "object", properties: { conversation_id: { type: "string" }, admin_id: { type: "string" }, body: { type: "string" } }, required: ["conversation_id", "admin_id", "body"] } },
      { name: "intercom_close_conversation", description: "Close conversation.", input_schema: { type: "object", properties: { conversation_id: { type: "string" }, admin_id: { type: "string" } }, required: ["conversation_id", "admin_id"] } },
      { name: "intercom_assign_conversation", description: "Assign conversation.", input_schema: { type: "object", properties: { conversation_id: { type: "string" }, admin_id: { type: "string" }, assignee_id: { type: "string" } }, required: ["conversation_id", "admin_id", "assignee_id"] } },
      { name: "intercom_tag_conversation", description: "Tag conversation.", input_schema: { type: "object", properties: { conversation_id: { type: "string" }, tag_id: { type: "string" } }, required: ["conversation_id", "tag_id"] } },
      { name: "intercom_create_contact", description: "Create contact.", input_schema: { type: "object", properties: { email: { type: "string" }, name: { type: "string" }, role: { type: "string", enum: ["user", "lead"] } }, required: ["email"] } },
      { name: "intercom_update_contact", description: "Update contact.", input_schema: { type: "object", properties: { contact_id: { type: "string" }, name: { type: "string" }, email: { type: "string" } }, required: ["contact_id"] } },
    );
  }

  if (connectedTools.includes("stripe")) {
    tools.push(
      { name: "stripe_list_customers", description: "List customers.", input_schema: { type: "object", properties: { limit: { type: "number" }, email: { type: "string" } } } },
      { name: "stripe_get_customer", description: "Get customer details.", input_schema: { type: "object", properties: { customer_id: { type: "string" } }, required: ["customer_id"] } },
      { name: "stripe_search_customers", description: "Search customers.", input_schema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } },
      { name: "stripe_list_charges", description: "List charges.", input_schema: { type: "object", properties: { limit: { type: "number" }, customer: { type: "string" } } } },
      { name: "stripe_list_subscriptions", description: "List subscriptions.", input_schema: { type: "object", properties: { limit: { type: "number" }, status: { type: "string" }, customer: { type: "string" } } } },
      { name: "stripe_list_invoices", description: "List invoices.", input_schema: { type: "object", properties: { limit: { type: "number" }, customer: { type: "string" }, status: { type: "string" } } } },
      { name: "stripe_get_balance", description: "Get balance.", input_schema: { type: "object", properties: {} } },
      { name: "stripe_list_products", description: "List products.", input_schema: { type: "object", properties: { limit: { type: "number" } } } },
    );
  }

  if (connectedTools.includes("mailchimp")) {
    tools.push(
      { name: "mailchimp_list_audiences", description: "List audiences.", input_schema: { type: "object", properties: { limit: { type: "number" } } } },
      { name: "mailchimp_list_campaigns", description: "List campaigns.", input_schema: { type: "object", properties: { limit: { type: "number" }, status: { type: "string" } } } },
      { name: "mailchimp_get_campaign_report", description: "Get campaign stats.", input_schema: { type: "object", properties: { campaign_id: { type: "string" } }, required: ["campaign_id"] } },
      { name: "mailchimp_search_members", description: "Search subscribers.", input_schema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } },
      { name: "mailchimp_add_member", description: "Add subscriber.", input_schema: { type: "object", properties: { list_id: { type: "string" }, email: { type: "string" }, status: { type: "string" } }, required: ["list_id", "email"] } },
      { name: "mailchimp_update_member", description: "Update subscriber.", input_schema: { type: "object", properties: { list_id: { type: "string" }, email: { type: "string" }, status: { type: "string" }, merge_fields: { type: "object" } }, required: ["list_id", "email"] } },
      { name: "mailchimp_create_campaign", description: "Create campaign draft.", input_schema: { type: "object", properties: { list_id: { type: "string" }, subject: { type: "string" }, from_name: { type: "string" }, reply_to: { type: "string" } }, required: ["list_id", "subject", "from_name", "reply_to"] } },
      { name: "mailchimp_send_campaign", description: "Send campaign (confirm first).", input_schema: { type: "object", properties: { campaign_id: { type: "string" } }, required: ["campaign_id"] } },
      { name: "mailchimp_tag_member", description: "Tag subscriber.", input_schema: { type: "object", properties: { list_id: { type: "string" }, email: { type: "string" }, tags: { type: "array", items: { type: "string" } } }, required: ["list_id", "email", "tags"] } },
    );
  }

  if (connectedTools.includes("slack")) {
    tools.push(
      { name: "slack_list_channels", description: "List channels.", input_schema: { type: "object", properties: { limit: { type: "number" } } } },
      { name: "slack_post_message", description: "Post message (confirm first).", input_schema: { type: "object", properties: { channel: { type: "string" }, text: { type: "string" } }, required: ["channel", "text"] } },
      { name: "slack_list_messages", description: "Read channel messages.", input_schema: { type: "object", properties: { channel: { type: "string" }, limit: { type: "number" } }, required: ["channel"] } },
      { name: "slack_search_messages", description: "Search messages.", input_schema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } },
    );
  }

  if (connectedTools.includes("database")) {
    tools.push(
      { name: "db_list_tables", description: "List tables.", input_schema: { type: "object", properties: {} } },
      { name: "db_describe_table", description: "Get table schema.", input_schema: { type: "object", properties: { table_name: { type: "string" } }, required: ["table_name"] } },
      { name: "db_query", description: "Run SELECT query.", input_schema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } },
      { name: "db_insert", description: "Insert row.", input_schema: { type: "object", properties: { table_name: { type: "string" }, data: { type: "object" } }, required: ["table_name", "data"] } },
      { name: "db_update", description: "Update rows.", input_schema: { type: "object", properties: { table_name: { type: "string" }, data: { type: "object" }, where: { type: "object" } }, required: ["table_name", "data", "where"] } },
      { name: "db_delete", description: "Delete rows (confirm first).", input_schema: { type: "object", properties: { table_name: { type: "string" }, where: { type: "object" } }, required: ["table_name", "where"] } },
    );
  }

  return tools;
}

// ─── System Prompt ───────────────────────────────────────────────────────────

function buildSystemPrompt(companyName, connectedTools) {
  const toolList = connectedTools.join(", ") || "none";
  return `You are Orchestra, an assistant for ${companyName || "this company"}. Connected: ${toolList}.

Be concise and direct. Lead with the answer, not the process. Use **bold** for key numbers.
Fetch real data via tools — never guess. Confirm before destructive actions (delete, send, cancel).
For customer lookups, check all connected tools. For database, use db_list_tables first to discover schema.
End with 1-2 actionable next steps using → prefix when relevant.`;
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function escapeSql(str) {
  return str.replace(/[^a-zA-Z0-9_]/g, "");
}

async function md5(str) {
  // Mailchimp requires MD5 of lowercase email for subscriber hash.
  // CF Workers don't support crypto.subtle.digest("MD5"), so we use a simple JS implementation.
  function md5impl(s) {
    function L(k,d){return(k<<d)|(k>>>(32-d));}
    function K(G,k){var I,d,F,H,x;F=(G&2147483648);H=(k&2147483648);I=(G&1073741824);d=(k&1073741824);x=(G&1073741823)+(k&1073741823);if(I&d)return(x^2147483648^F^H);if(I|d){if(x&1073741824)return(x^3221225472^F^H);else return(x^1073741824^F^H);}else return(x^F^H);}
    function t(x,k,d){return(x&k)|((~x)&d);}
    function q(x,k,d){return(x&d)|(k&(~d));}
    function p(x,k,d){return(x^k^d);}
    function n(x,k,d){return(k^(x|(~d)));}
    function u(a,b,c,d,x,s,ac){a=K(a,K(K(t(b,c,d),x),ac));return K(L(a,s),b);}
    function f(a,b,c,d,x,s,ac){a=K(a,K(K(q(b,c,d),x),ac));return K(L(a,s),b);}
    function D(a,b,c,d,x,s,ac){a=K(a,K(K(p(b,c,d),x),ac));return K(L(a,s),b);}
    function E(a,b,c,d,x,s,ac){a=K(a,K(K(n(b,c,d),x),ac));return K(L(a,s),b);}
    function J(st){var r="",i,h;for(i=0;i<=3;i++){h=(st>>>(i*8))&255;r+="0123456789abcdef".charAt((h>>>4)&15)+"0123456789abcdef".charAt(h&15);}return r;}
    var C=[],P,h,E2,v,g,Y,X,W,V,S=7,Q=12,N=17,M=22,A=5,z=9,y=14,w=20,o=4,m=11,l=16,j=23,e=6,B=10,g2=15,U=21;
    var a8=s;var i;a8=a8.replace(/\r\n/g,"\n");var a7="";for(i=0;i<a8.length;i++){var a6=a8.charCodeAt(i);if(a6<128)a7+=String.fromCharCode(a6);else if(a6>127&&a6<2048){a7+=String.fromCharCode((a6>>6)|192);a7+=String.fromCharCode((a6&63)|128);}else{a7+=String.fromCharCode((a6>>12)|224);a7+=String.fromCharCode(((a6>>6)&63)|128);a7+=String.fromCharCode((a6&63)|128);}}
    a8=a7;var a=a8.length;var R=a+8;var T=(R-(R%64))/64;var I=(T+1)*16;var Z=new Array(I-1);var d2=0;var c2=0;while(c2<a){var a0=(c2-(c2%4))/4;var a1=(c2%4)*8;Z[a0]=(Z[a0]|(a8.charCodeAt(c2)<<a1));c2++;}d2=(c2-(c2%4))/4;a1=(c2%4)*8;Z[d2]=Z[d2]|(128<<a1);Z[I-2]=a<<3;Z[I-1]=a>>>29;
    var a2=1732584193,b2=4023233417,c3=2562383102,d3=271733878;
    for(var k=0;k<I;k+=16){var AA=a2,BB=b2,CC=c3,DD=d3;
    a2=u(a2,b2,c3,d3,Z[k+0],S,3614090360);d3=u(d3,a2,b2,c3,Z[k+1],Q,3905402710);c3=u(c3,d3,a2,b2,Z[k+2],N,606105819);b2=u(b2,c3,d3,a2,Z[k+3],M,3250441966);a2=u(a2,b2,c3,d3,Z[k+4],S,4118548399);d3=u(d3,a2,b2,c3,Z[k+5],Q,1200080426);c3=u(c3,d3,a2,b2,Z[k+6],N,2821735955);b2=u(b2,c3,d3,a2,Z[k+7],M,4249261313);a2=u(a2,b2,c3,d3,Z[k+8],S,1770035416);d3=u(d3,a2,b2,c3,Z[k+9],Q,2336552879);c3=u(c3,d3,a2,b2,Z[k+10],N,4294925233);b2=u(b2,c3,d3,a2,Z[k+11],M,2304563134);a2=u(a2,b2,c3,d3,Z[k+12],S,1804603682);d3=u(d3,a2,b2,c3,Z[k+13],Q,4254626195);c3=u(c3,d3,a2,b2,Z[k+14],N,2792965006);b2=u(b2,c3,d3,a2,Z[k+15],M,1236535329);
    a2=f(a2,b2,c3,d3,Z[k+1],A,4129170786);d3=f(d3,a2,b2,c3,Z[k+6],z,3225465664);c3=f(c3,d3,a2,b2,Z[k+11],y,643717713);b2=f(b2,c3,d3,a2,Z[k+0],w,3921069994);a2=f(a2,b2,c3,d3,Z[k+5],A,3593408605);d3=f(d3,a2,b2,c3,Z[k+10],z,38016083);c3=f(c3,d3,a2,b2,Z[k+15],y,3634488961);b2=f(b2,c3,d3,a2,Z[k+4],w,3889429448);a2=f(a2,b2,c3,d3,Z[k+9],A,568446438);d3=f(d3,a2,b2,c3,Z[k+14],z,3275163606);c3=f(c3,d3,a2,b2,Z[k+3],y,4107603335);b2=f(b2,c3,d3,a2,Z[k+8],w,1163531501);a2=f(a2,b2,c3,d3,Z[k+13],A,2850285829);d3=f(d3,a2,b2,c3,Z[k+2],z,4243563512);c3=f(c3,d3,a2,b2,Z[k+7],y,1735328473);b2=f(b2,c3,d3,a2,Z[k+12],w,2368359562);
    a2=D(a2,b2,c3,d3,Z[k+5],o,4294588738);d3=D(d3,a2,b2,c3,Z[k+8],m,2272392833);c3=D(c3,d3,a2,b2,Z[k+11],l,1839030562);b2=D(b2,c3,d3,a2,Z[k+14],j,4259657740);a2=D(a2,b2,c3,d3,Z[k+1],o,2763975236);d3=D(d3,a2,b2,c3,Z[k+4],m,1272893353);c3=D(c3,d3,a2,b2,Z[k+7],l,4139469664);b2=D(b2,c3,d3,a2,Z[k+10],j,3200236656);a2=D(a2,b2,c3,d3,Z[k+13],o,681279174);d3=D(d3,a2,b2,c3,Z[k+0],m,3936430074);c3=D(c3,d3,a2,b2,Z[k+3],l,3572445317);b2=D(b2,c3,d3,a2,Z[k+6],j,76029189);a2=D(a2,b2,c3,d3,Z[k+9],o,3654602809);d3=D(d3,a2,b2,c3,Z[k+12],m,3873151461);c3=D(c3,d3,a2,b2,Z[k+15],l,530742520);b2=D(b2,c3,d3,a2,Z[k+2],j,3299628645);
    a2=E(a2,b2,c3,d3,Z[k+0],e,4096336452);d3=E(d3,a2,b2,c3,Z[k+7],B,1126891415);c3=E(c3,d3,a2,b2,Z[k+14],g2,2878612391);b2=E(b2,c3,d3,a2,Z[k+5],U,4237533241);a2=E(a2,b2,c3,d3,Z[k+12],e,1700485571);d3=E(d3,a2,b2,c3,Z[k+3],B,2399980690);c3=E(c3,d3,a2,b2,Z[k+10],g2,4293915773);b2=E(b2,c3,d3,a2,Z[k+1],U,2240044497);a2=E(a2,b2,c3,d3,Z[k+8],e,1873313359);d3=E(d3,a2,b2,c3,Z[k+15],B,4264355552);c3=E(c3,d3,a2,b2,Z[k+6],g2,2734768916);b2=E(b2,c3,d3,a2,Z[k+13],U,1309151649);a2=E(a2,b2,c3,d3,Z[k+4],e,4149444226);d3=E(d3,a2,b2,c3,Z[k+11],B,3174756917);c3=E(c3,d3,a2,b2,Z[k+2],g2,718787259);b2=E(b2,c3,d3,a2,Z[k+9],U,3951481745);
    a2=K(a2,AA);b2=K(b2,BB);c3=K(c3,CC);d3=K(d3,DD);}
    return(J(a2)+J(b2)+J(c3)+J(d3)).toLowerCase();
  }
  return md5impl(str);
}
