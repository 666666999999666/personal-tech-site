import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

// ==================== Blog ====================

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    title: varchar("title", { length: 500 }).notNull(),
    contentMd: text("content_md"),
    excerpt: text("excerpt"),
    tags: jsonb("tags").$type<string[]>().default([]),
    category: varchar("category", { length: 100 }),
    status: varchar("status", { length: 20 }).notNull().default("draft"), // draft | published
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    coverImageUrl: text("cover_image_url"),
    readingTimeMinutes: integer("reading_time_minutes"),
  },
  (table) => [
    index("idx_posts_status").on(table.status),
    index("idx_posts_category").on(table.category),
    index("idx_posts_published_at").on(table.publishedAt),
    index("idx_posts_search").on(table.title, table.contentMd),
  ]
);

// ==================== Projects ====================

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    contentMd: text("content_md"),
    repoUrl: text("repo_url"),
    demoUrl: text("demo_url"),
    tags: jsonb("tags").$type<string[]>().default([]),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    coverImageUrl: text("cover_image_url"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_projects_status").on(table.status),
    index("idx_projects_sort").on(table.sortOrder),
    index("idx_projects_search").on(table.title, table.description),
  ]
);

// ==================== Users ====================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ==================== Workspace Todo Groups ====================

export const todoGroups = pgTable(
  "todo_groups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_todo_groups_sort").on(table.sortOrder)]
);

// ==================== Workspace Todos ====================

export const todos = pgTable(
  "todos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .references(() => todoGroups.id, { onDelete: "cascade" })
      .notNull(),
    text: text("text").notNull(),
    done: boolean("done").notNull().default(false),
    sortOrder: integer("sort_order").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_todos_group").on(table.groupId),
    index("idx_todos_sort").on(table.sortOrder),
  ]
);

// ==================== Agent Sessions ====================

export const agentSessions = pgTable("agent_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
});

// ==================== Agent Messages ====================

export const agentMessages = pgTable(
  "agent_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .references(() => agentSessions.id)
      .notNull(),
    role: varchar("role", { length: 20 }).notNull(), // user | assistant | tool
    content: text("content"),
    toolCallId: text("tool_call_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_agent_messages_session").on(table.sessionId)]
);
