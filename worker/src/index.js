/**
 * Orchestra API — Cloudflare Worker
 * Direct API keys (stored in KV via app UI) + agentic Claude
 * Integrations: Intercom, Stripe, Mailchimp, Slack, PlanetScale
 */

import { connect } from "@planetscale/database";

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
      const conn = connect({ host: dbHost, username: dbUser, password: dbPass });
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
        const conn = connect({ host: credentials.host, username: credentials.username, password: credentials.password || "" });
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

  const allMessages = [...messages];
  let response;

  for (let i = 0; i < 8; i++) {
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

  return corsJson(response);
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
        return { type: "tool_result", tool_use_id: block.id, content: JSON.stringify(result) };
      })
  );
  return results;
}

async function runTool(name, input, env) {
  switch (name) {
    // ── Intercom ───────────────────────────────────────────────────────────────
    case "intercom_search_conversations":
      return intercom(env, "POST", "conversations/search", {
        query: { operator: "AND", value: [...(input.state ? [{ field: "state", operator: "=", value: input.state }] : [])] },
        pagination: { per_page: input.limit ?? 20 },
      });
    case "intercom_get_conversation":
      return intercom(env, "GET", `conversations/${input.conversation_id}`);
    case "intercom_search_contacts":
      return intercom(env, "POST", "contacts/search", {
        query: { operator: "AND", value: [...(input.email ? [{ field: "email", operator: "=", value: input.email }] : []), ...(input.name ? [{ field: "name", operator: "~", value: input.name }] : [])] },
        pagination: { per_page: input.limit ?? 10 },
      });
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
      const conn = getDb(env);
      const rows = await conn.execute("SELECT table_name, table_type FROM information_schema.tables WHERE table_schema = DATABASE() ORDER BY table_name");
      return { tables: rows.rows };
    }
    case "db_describe_table": {
      const conn = getDb(env);
      const rows = await conn.execute(`SELECT column_name, data_type, is_nullable, column_key, column_default, extra FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = '${escapeSql(input.table_name)}' ORDER BY ordinal_position`);
      return { table: input.table_name, columns: rows.rows };
    }
    case "db_query": {
      const query = input.query.trim();
      if (!/^SELECT\s/i.test(query)) throw new Error("Only SELECT queries allowed via db_query.");
      const conn = getDb(env);
      const result = await conn.execute(query);
      return { rows: result.rows, rowCount: result.rows.length };
    }
    case "db_insert": {
      const conn = getDb(env);
      const cols = Object.keys(input.data);
      const vals = Object.values(input.data);
      const sql = `INSERT INTO ${escapeSql(input.table_name)} (${cols.map(escapeSql).join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`;
      const result = await conn.execute(sql, vals);
      return { ok: true, insertId: result.insertId, rowsAffected: result.rowsAffected };
    }
    case "db_update": {
      const conn = getDb(env);
      const setClauses = Object.keys(input.data).map((k) => `${escapeSql(k)} = ?`).join(", ");
      const vals = [...Object.values(input.data), ...Object.values(input.where || {})];
      const whereClauses = Object.keys(input.where || {}).map((k) => `${escapeSql(k)} = ?`).join(" AND ");
      if (!whereClauses) throw new Error("WHERE clause required");
      const result = await conn.execute(`UPDATE ${escapeSql(input.table_name)} SET ${setClauses} WHERE ${whereClauses}`, vals);
      return { ok: true, rowsAffected: result.rowsAffected };
    }
    case "db_delete": {
      const conn = getDb(env);
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
  return connect({ host, username, password: password || "" });
}

// ─── Tool Definitions ────────────────────────────────────────────────────────

function buildTools(connectedTools) {
  const tools = [];

  if (connectedTools.includes("intercom")) {
    tools.push(
      { name: "intercom_search_conversations", description: "Search conversations in Intercom. Filter by state (open/closed/snoozed).", input_schema: { type: "object", properties: { state: { type: "string", enum: ["open", "closed", "snoozed"] }, limit: { type: "number" } } } },
      { name: "intercom_get_conversation", description: "Get full details and messages for a specific conversation.", input_schema: { type: "object", properties: { conversation_id: { type: "string" } }, required: ["conversation_id"] } },
      { name: "intercom_search_contacts", description: "Search contacts by email or name.", input_schema: { type: "object", properties: { email: { type: "string" }, name: { type: "string" }, limit: { type: "number" } } } },
      { name: "intercom_get_contact", description: "Get full contact details.", input_schema: { type: "object", properties: { contact_id: { type: "string" } }, required: ["contact_id"] } },
      { name: "intercom_list_tags", description: "List all tags.", input_schema: { type: "object", properties: {} } },
      { name: "intercom_list_teams", description: "List all teams.", input_schema: { type: "object", properties: {} } },
      { name: "intercom_reply_conversation", description: "Send a reply to a conversation.", input_schema: { type: "object", properties: { conversation_id: { type: "string" }, admin_id: { type: "string" }, body: { type: "string" } }, required: ["conversation_id", "admin_id", "body"] } },
      { name: "intercom_note_conversation", description: "Add an internal note (not visible to customer).", input_schema: { type: "object", properties: { conversation_id: { type: "string" }, admin_id: { type: "string" }, body: { type: "string" } }, required: ["conversation_id", "admin_id", "body"] } },
      { name: "intercom_close_conversation", description: "Close a conversation.", input_schema: { type: "object", properties: { conversation_id: { type: "string" }, admin_id: { type: "string" }, body: { type: "string" } }, required: ["conversation_id", "admin_id"] } },
      { name: "intercom_snooze_conversation", description: "Snooze a conversation until a specific time.", input_schema: { type: "object", properties: { conversation_id: { type: "string" }, admin_id: { type: "string" }, snoozed_until: { type: "number" } }, required: ["conversation_id", "admin_id", "snoozed_until"] } },
      { name: "intercom_assign_conversation", description: "Assign a conversation to a team member.", input_schema: { type: "object", properties: { conversation_id: { type: "string" }, admin_id: { type: "string" }, assignee_id: { type: "string" }, body: { type: "string" } }, required: ["conversation_id", "admin_id", "assignee_id"] } },
      { name: "intercom_tag_conversation", description: "Tag a conversation.", input_schema: { type: "object", properties: { conversation_id: { type: "string" }, tag_id: { type: "string" } }, required: ["conversation_id", "tag_id"] } },
      { name: "intercom_create_contact", description: "Create a new contact.", input_schema: { type: "object", properties: { email: { type: "string" }, name: { type: "string" }, phone: { type: "string" }, role: { type: "string", enum: ["user", "lead"] }, custom_attributes: { type: "object" } }, required: ["email"] } },
      { name: "intercom_update_contact", description: "Update an existing contact.", input_schema: { type: "object", properties: { contact_id: { type: "string" }, name: { type: "string" }, email: { type: "string" }, phone: { type: "string" }, custom_attributes: { type: "object" } }, required: ["contact_id"] } },
      { name: "intercom_merge_contacts", description: "Merge two contacts. 'from' is merged into 'into'.", input_schema: { type: "object", properties: { from_contact_id: { type: "string" }, into_contact_id: { type: "string" } }, required: ["from_contact_id", "into_contact_id"] } },
    );
  }

  if (connectedTools.includes("stripe")) {
    tools.push(
      { name: "stripe_list_customers", description: "List Stripe customers. Optionally filter by email.", input_schema: { type: "object", properties: { limit: { type: "number" }, email: { type: "string" } } } },
      { name: "stripe_get_customer", description: "Get full details for a Stripe customer.", input_schema: { type: "object", properties: { customer_id: { type: "string" } }, required: ["customer_id"] } },
      { name: "stripe_search_customers", description: "Search customers using Stripe's search query syntax.", input_schema: { type: "object", properties: { query: { type: "string", description: "Search query, e.g. email:'user@example.com' or name:'John'" } }, required: ["query"] } },
      { name: "stripe_list_charges", description: "List recent charges. Optionally filter by customer.", input_schema: { type: "object", properties: { limit: { type: "number" }, customer: { type: "string" } } } },
      { name: "stripe_list_subscriptions", description: "List subscriptions. Filter by status or customer.", input_schema: { type: "object", properties: { limit: { type: "number" }, status: { type: "string", enum: ["active", "past_due", "canceled", "unpaid", "trialing", "all"] }, customer: { type: "string" } } } },
      { name: "stripe_get_subscription", description: "Get full subscription details.", input_schema: { type: "object", properties: { subscription_id: { type: "string" } }, required: ["subscription_id"] } },
      { name: "stripe_list_invoices", description: "List invoices. Filter by customer or status.", input_schema: { type: "object", properties: { limit: { type: "number" }, customer: { type: "string" }, status: { type: "string", enum: ["draft", "open", "paid", "uncollectible", "void"] } } } },
      { name: "stripe_get_balance", description: "Get current Stripe balance (available and pending funds).", input_schema: { type: "object", properties: {} } },
      { name: "stripe_list_payment_intents", description: "List recent payment intents.", input_schema: { type: "object", properties: { limit: { type: "number" }, customer: { type: "string" } } } },
      { name: "stripe_list_products", description: "List products in your Stripe catalog.", input_schema: { type: "object", properties: { limit: { type: "number" }, active: { type: "boolean" } } } },
      { name: "stripe_list_prices", description: "List prices. Optionally filter by product.", input_schema: { type: "object", properties: { limit: { type: "number" }, product: { type: "string" } } } },
    );
  }

  if (connectedTools.includes("mailchimp")) {
    tools.push(
      { name: "mailchimp_list_audiences", description: "List email audiences with subscriber counts.", input_schema: { type: "object", properties: { limit: { type: "number" } } } },
      { name: "mailchimp_get_audience", description: "Get detailed audience info.", input_schema: { type: "object", properties: { list_id: { type: "string" } }, required: ["list_id"] } },
      { name: "mailchimp_list_campaigns", description: "List email campaigns. Filter by status.", input_schema: { type: "object", properties: { limit: { type: "number" }, status: { type: "string", enum: ["save", "paused", "schedule", "sending", "sent"] } } } },
      { name: "mailchimp_get_campaign", description: "Get campaign details.", input_schema: { type: "object", properties: { campaign_id: { type: "string" } }, required: ["campaign_id"] } },
      { name: "mailchimp_get_campaign_report", description: "Get campaign performance — opens, clicks, bounces.", input_schema: { type: "object", properties: { campaign_id: { type: "string" } }, required: ["campaign_id"] } },
      { name: "mailchimp_search_members", description: "Search subscribers by email or name.", input_schema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } },
      { name: "mailchimp_list_segments", description: "List segments for an audience.", input_schema: { type: "object", properties: { list_id: { type: "string" }, limit: { type: "number" } }, required: ["list_id"] } },
      { name: "mailchimp_add_member", description: "Add a subscriber.", input_schema: { type: "object", properties: { list_id: { type: "string" }, email: { type: "string" }, status: { type: "string", enum: ["subscribed", "pending", "unsubscribed"] }, merge_fields: { type: "object" } }, required: ["list_id", "email"] } },
      { name: "mailchimp_update_member", description: "Update a subscriber.", input_schema: { type: "object", properties: { list_id: { type: "string" }, email: { type: "string" }, status: { type: "string" }, merge_fields: { type: "object" } }, required: ["list_id", "email"] } },
      { name: "mailchimp_create_campaign", description: "Create a campaign draft.", input_schema: { type: "object", properties: { list_id: { type: "string" }, subject: { type: "string" }, from_name: { type: "string" }, reply_to: { type: "string" }, type: { type: "string" } }, required: ["list_id", "subject", "from_name", "reply_to"] } },
      { name: "mailchimp_set_campaign_content", description: "Set campaign HTML content.", input_schema: { type: "object", properties: { campaign_id: { type: "string" }, html: { type: "string" } }, required: ["campaign_id", "html"] } },
      { name: "mailchimp_send_campaign", description: "Send a campaign. Irreversible — only when user confirms.", input_schema: { type: "object", properties: { campaign_id: { type: "string" } }, required: ["campaign_id"] } },
      { name: "mailchimp_create_segment", description: "Create a new segment.", input_schema: { type: "object", properties: { list_id: { type: "string" }, name: { type: "string" }, emails: { type: "array", items: { type: "string" } } }, required: ["list_id", "name"] } },
      { name: "mailchimp_tag_member", description: "Add tags to a subscriber.", input_schema: { type: "object", properties: { list_id: { type: "string" }, email: { type: "string" }, tags: { type: "array", items: { type: "string" } } }, required: ["list_id", "email", "tags"] } },
    );
  }

  if (connectedTools.includes("slack")) {
    tools.push(
      { name: "slack_list_channels", description: "List Slack channels.", input_schema: { type: "object", properties: { limit: { type: "number" } } } },
      { name: "slack_post_message", description: "Post a message to a Slack channel. Only when user explicitly asks.", input_schema: { type: "object", properties: { channel: { type: "string", description: "Channel ID or name" }, text: { type: "string" }, blocks: { type: "array", description: "Slack Block Kit blocks" } }, required: ["channel", "text"] } },
      { name: "slack_list_messages", description: "Get recent messages from a channel.", input_schema: { type: "object", properties: { channel: { type: "string" }, limit: { type: "number" } }, required: ["channel"] } },
      { name: "slack_search_messages", description: "Search messages across Slack.", input_schema: { type: "object", properties: { query: { type: "string" }, limit: { type: "number" } }, required: ["query"] } },
      { name: "slack_get_user", description: "Get info about a Slack user.", input_schema: { type: "object", properties: { user_id: { type: "string" } }, required: ["user_id"] } },
      { name: "slack_list_users", description: "List all Slack workspace members.", input_schema: { type: "object", properties: { limit: { type: "number" } } } },
    );
  }

  if (connectedTools.includes("database")) {
    tools.push(
      { name: "db_list_tables", description: "List all tables in the database.", input_schema: { type: "object", properties: {} } },
      { name: "db_describe_table", description: "Get column schema for a table.", input_schema: { type: "object", properties: { table_name: { type: "string" } }, required: ["table_name"] } },
      { name: "db_query", description: "Execute a read-only SELECT query.", input_schema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } },
      { name: "db_insert", description: "Insert a row.", input_schema: { type: "object", properties: { table_name: { type: "string" }, data: { type: "object" } }, required: ["table_name", "data"] } },
      { name: "db_update", description: "Update rows. Requires WHERE clause.", input_schema: { type: "object", properties: { table_name: { type: "string" }, data: { type: "object" }, where: { type: "object" } }, required: ["table_name", "data", "where"] } },
      { name: "db_delete", description: "Delete rows. Requires WHERE clause. Only when user confirms.", input_schema: { type: "object", properties: { table_name: { type: "string" }, where: { type: "object" } }, required: ["table_name", "where"] } },
    );
  }

  return tools;
}

// ─── System Prompt ───────────────────────────────────────────────────────────

function buildSystemPrompt(companyName, connectedTools) {
  const toolList = connectedTools.join(", ") || "no tools connected";
  return `You are Orchestra, an AI business copilot for ${companyName || "this company"}.

You have access to real business data via tool calls. Always fetch real data — never make up numbers.

Connected integrations: ${toolList}

## How to use tools
- Intercom: Search conversations for support health, get conversation details, search/manage contacts.
- Stripe: List customers/charges/subscriptions/invoices, check balance, search customers. Read-only for now.
- Mailchimp: List audiences/campaigns, get reports, search subscribers, create/send campaigns.
- Slack: List channels/users, read messages, post messages (only when user asks).
- Database: Use db_list_tables → db_describe_table → db_query to discover and query data.

## Response format
- Lead with the key insight or answer
- Use **bold** for metrics and important values
- End with 2-3 suggested next actions prefixed with → on their own lines
- Be concise and actionable

## Write actions
- For destructive/high-impact actions, always confirm with the user first.
- Read operations are always safe to execute without asking.`;
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function escapeSql(str) {
  return str.replace(/[^a-zA-Z0-9_]/g, "");
}

async function md5(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("MD5", data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
