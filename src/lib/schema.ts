import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  index,
  uniqueIndex,
  uuid,
  jsonb,
} from "drizzle-orm/pg-core";

// IMPORTANT! ID fields should ALWAYS use UUID types, EXCEPT the BetterAuth tables.

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    // Better Auth admin plugin columns.
    role: text("role").default("user"),
    banned: boolean("banned").default(false),
    banReason: text("ban_reason"),
    banExpires: timestamp("ban_expires"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("user_email_idx").on(table.email)]
);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // Better Auth admin plugin: set during active impersonation.
    impersonatedBy: text("impersonated_by"),
  },
  (table) => [
    index("session_user_id_idx").on(table.userId),
    index("session_token_idx").on(table.token),
  ]
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("account_user_id_idx").on(table.userId),
    index("account_provider_account_idx").on(table.providerId, table.accountId),
  ]
);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const apikey = pgTable(
  "apikey",
  {
    id: text("id").primaryKey(),
    configId: text("config_id").default("default").notNull(),
    name: text("name"),
    start: text("start"),
    referenceId: text("reference_id").notNull(),
    prefix: text("prefix"),
    key: text("key").notNull(),
    refillInterval: integer("refill_interval"),
    refillAmount: integer("refill_amount"),
    lastRefillAt: timestamp("last_refill_at"),
    enabled: boolean("enabled").default(true),
    rateLimitEnabled: boolean("rate_limit_enabled").default(true),
    rateLimitTimeWindow: integer("rate_limit_time_window").default(60_000),
    rateLimitMax: integer("rate_limit_max").default(60),
    requestCount: integer("request_count").default(0),
    remaining: integer("remaining"),
    lastRequest: timestamp("last_request"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    permissions: text("permissions"),
    metadata: text("metadata"),
  },
  (table) => [
    index("apikey_config_id_idx").on(table.configId),
    index("apikey_reference_id_idx").on(table.referenceId),
    index("apikey_key_idx").on(table.key),
  ]
);

export const generation = pgTable(
  "generation",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    prompt: text("prompt").notNull(),
    modelId: text("model_id").notNull(),
    providerId: text("provider_id").notNull(),
    aspectRatio: text("aspect_ratio").notNull(),
    style: text("style"),
    // Legacy column — image models don't accept seed; kept nullable for backfill.
    seed: integer("seed"),
    // "default" or "deep" — only populated for thinking-capable models.
    thinkingLevel: text("thinking_level"),
    imageUrl: text("image_url").notNull(),
    mediaType: text("media_type").notNull(),
    creditCost: integer("credit_cost"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("generation_user_id_idx").on(table.userId),
    index("generation_created_at_idx").on(table.createdAt),
  ]
);

export const creditBalance = pgTable(
  "credit_balance",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    balance: integer("balance").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("credit_balance_user_id_idx").on(table.userId)]
);

export const creditTransaction = pgTable(
  "credit_transaction",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    type: text("type").notNull(),
    description: text("description"),
    referenceId: text("reference_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("credit_transaction_user_id_idx").on(table.userId),
    index("credit_transaction_created_at_idx").on(table.createdAt),
    index("credit_transaction_type_idx").on(table.type),
  ]
);

export const model = pgTable(
  "model",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // Composite identifier, e.g. `openai:gpt-image-1.5`. Stable, unique.
    modelId: text("model_id").notNull(),
    // Provider key validated by Zod allowlist (see SUPPORTED_PROVIDERS).
    providerId: text("provider_id").notNull(),
    // SDK-facing identifier, e.g. `gpt-image-1.5`.
    providerModelId: text("provider_model_id").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    // Aspect ratios this model accepts, in display order.
    aspectRatios: text("aspect_ratios").array().notNull(),
    // Mapping from UI "default" to the provider value (minimal | low). When
    // null, the model has no thinking support and the UI hides the toggle.
    thinkingDefault: text("thinking_default"),
    // Mapping from UI "deep" to the provider value (high). Must be set iff
    // thinkingDefault is set — enforced by CHECK + Zod.
    thinkingHigh: text("thinking_high"),
    creditCost: integer("credit_cost").notNull(),
    // Cost charged when the user picks "deep" thinking. Null = same as base.
    thinkingHighCreditCost: integer("thinking_high_credit_cost"),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("model_model_id_idx").on(table.modelId),
    index("model_is_active_sort_idx").on(table.isActive, table.sortOrder),
  ]
);

export const adminAuditLog = pgTable(
  "admin_audit_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // Nullable so audit history survives if the actor user row is deleted.
    actorId: text("actor_id").references(() => user.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    targetType: text("target_type"),
    targetId: text("target_id"),
    before: jsonb("before"),
    after: jsonb("after"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("admin_audit_log_actor_id_idx").on(table.actorId),
    index("admin_audit_log_action_idx").on(table.action),
    index("admin_audit_log_target_idx").on(table.targetType, table.targetId),
    index("admin_audit_log_created_at_idx").on(table.createdAt),
  ]
);
