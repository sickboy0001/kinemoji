import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  index,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
  role: text("role", { enum: ["user", "admin"] }).default("user"),
  // Google OAuth 用カラム（仕様書に基づく）
  googleId: text("google_id").unique(), // Google 固有 ID（sub クレーム）
  displayName: text("display_name"), // 表示名（Google 名または自動生成）
  isAdmin: integer("is_admin", { mode: "boolean" }).default(false), // 管理者フラグ
});

export const accounts = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    pk: primaryKey({ columns: [account.provider, account.providerAccountId] }),
  }),
);

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const kinemojis = sqliteTable(
  "kinemojis",
  {
    id: text("id").notNull().primaryKey(),
    shortId: text("short_id").notNull().unique(),
    text: text("text").notNull(),
    parameters: text("parameters").notNull(),
    imageUrl: text("image_url"),
    status: text("status").notNull().default("pending"),
    progress: integer("progress").notNull().default(0),
    error: text("error"),
    creatorId: text("creator_id"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
    type: text("type"),
    action: text("action"),
  },
  (table) => ({
    idxKinemojisShortId: index("idx_kinemojis_short_id").on(table.shortId),
  }),
);
