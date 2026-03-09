/**
 * Orchestra — Drizzle ORM Schema
 * PlanetScale MySQL
 */

import {
  mysqlTable,
  varchar,
  text,
  int,
  boolean,
  timestamp,
  json,
  bigint,
  mysqlEnum,
} from "drizzle-orm/mysql-core";

// ─── Users ──────────────────────────────────────────────────────────────────

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ─── Workspaces ─────────────────────────────────────────────────────────────

export const workspaces = mysqlTable("workspaces", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  plan: mysqlEnum("plan", ["starter", "pro", "enterprise"]).default("starter").notNull(),
  companySize: varchar("company_size", { length: 50 }),
  industry: varchar("industry", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ─── Workspace Members ──────────────────────────────────────────────────────

export const workspaceMembers = mysqlTable("workspace_members", {
  id: varchar("id", { length: 36 }).primaryKey(),
  workspaceId: varchar("workspace_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  role: mysqlEnum("role", ["owner", "admin", "member"]).default("member").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Integration Credentials (per workspace) ────────────────────────────────

export const integrations = mysqlTable("integrations", {
  id: varchar("id", { length: 36 }).primaryKey(),
  workspaceId: varchar("workspace_id", { length: 36 }).notNull(),
  provider: varchar("provider", { length: 50 }).notNull(), // intercom, stripe, mailchimp, slack, database
  credentials: text("credentials").notNull(), // encrypted JSON
  isActive: boolean("is_active").default(true).notNull(),
  connectedAt: timestamp("connected_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ─── Credits ────────────────────────────────────────────────────────────────

export const credits = mysqlTable("credits", {
  id: varchar("id", { length: 36 }).primaryKey(),
  workspaceId: varchar("workspace_id", { length: 36 }).notNull(),
  balance: int("balance").default(1000).notNull(), // credits remaining
  monthlyAllocation: int("monthly_allocation").default(1000).notNull(),
  resetAt: timestamp("reset_at").notNull(), // next monthly reset
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ─── Credit Usage Log ───────────────────────────────────────────────────────

export const creditUsage = mysqlTable("credit_usage", {
  id: varchar("id", { length: 36 }).primaryKey(),
  workspaceId: varchar("workspace_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 36 }),
  action: varchar("action", { length: 100 }).notNull(), // e.g. "chat", "agent_run", "cross_tool_report"
  creditsUsed: int("credits_used").notNull(),
  provider: varchar("provider", { length: 50 }), // which integration was used
  metadata: json("metadata"), // extra context
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Agents (scheduled tasks) ───────────────────────────────────────────────

export const agents = mysqlTable("agents", {
  id: varchar("id", { length: 36 }).primaryKey(),
  workspaceId: varchar("workspace_id", { length: 36 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  schedule: varchar("schedule", { length: 100 }), // cron or human-readable
  tools: json("tools").notNull(), // array of provider IDs
  isActive: boolean("is_active").default(true).notNull(),
  lastRunAt: timestamp("last_run_at"),
  lastOutput: text("last_output"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ─── Chat History ───────────────────────────────────────────────────────────

export const chatMessages = mysqlTable("chat_messages", {
  id: varchar("id", { length: 36 }).primaryKey(),
  workspaceId: varchar("workspace_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 36 }),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  toolsUsed: json("tools_used"),
  creditsUsed: int("credits_used").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Audit Log ──────────────────────────────────────────────────────────────

export const auditLog = mysqlTable("audit_log", {
  id: varchar("id", { length: 36 }).primaryKey(),
  workspaceId: varchar("workspace_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 36 }),
  action: varchar("action", { length: 100 }).notNull(),
  resource: varchar("resource", { length: 100 }),
  details: json("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
