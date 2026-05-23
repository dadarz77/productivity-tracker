import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  bigint,
  json,
  date,
  
} from "drizzle-orm/mysql-core";

// OAuth users (managed by auth system)
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

// Local auth users (username/password)
export const localUsers = mysqlTable("local_users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  displayName: varchar("display_name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// Extended user profiles
export const userProfiles = mysqlTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  userType: varchar("user_type", { length: 20 }).notNull(), // oauth | local
  profession: varchar("profession", { length: 100 }),
  bio: text("bio"),
  preferences: json("preferences"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// Decisions
export const decisions = mysqlTable("decisions", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  userType: varchar("user_type", { length: 20 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  goal: text("goal"),
  situation: text("situation"),
  availableTime: varchar("available_time", { length: 100 }),
  resources: json("resources"),
  priorities: json("priorities"),
  deadline: date("deadline"),
  stressLevel: int("stress_level"),
  confidenceLevel: int("confidence_level"),
  options: json("options"),
  constraints: text("constraints"),
  preferences: json("preferences"),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  category: varchar("category", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// Decision Analyses (AI-generated)
export const decisionAnalyses = mysqlTable("decision_analyses", {
  id: serial("id").primaryKey(),
  decisionId: bigint("decision_id", { mode: "number", unsigned: true }).notNull(),
  summary: text("summary"),
  confidence: int("confidence"),
  recommendation: varchar("recommendation", { length: 500 }),
  reasoning: text("reasoning"),
  optionsAnalysis: json("options_analysis"),
  tradeOffMatrix: json("trade_off_matrix"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Goals
export const goals = mysqlTable("goals", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  userType: varchar("user_type", { length: 20 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  progress: int("progress").default(0),
  category: varchar("category", { length: 100 }),
  targetDate: date("target_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// AI Chat Messages
export const messages = mysqlTable("messages", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  userType: varchar("user_type", { length: 20 }).notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  sessionId: varchar("session_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Contact Messages
export const contacts = mysqlTable("contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  status: varchar("status", { length: 50 }).default("new").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Forum Posts
export const forumPosts = mysqlTable("forum_posts", {
  id: serial("id").primaryKey(),
  authorId: bigint("author_id", { mode: "number", unsigned: true }).notNull(),
  authorType: varchar("author_type", { length: 20 }).notNull(),
  authorName: varchar("author_name", { length: 255 }),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }),
  tags: json("tags"),
  likes: int("likes").default(0),
  views: int("views").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// Forum Comments
export const forumComments = mysqlTable("forum_comments", {
  id: serial("id").primaryKey(),
  postId: bigint("post_id", { mode: "number", unsigned: true }).notNull(),
  authorId: bigint("author_id", { mode: "number", unsigned: true }).notNull(),
  authorType: varchar("author_type", { length: 20 }).notNull(),
  authorName: varchar("author_name", { length: 255 }),
  content: text("content").notNull(),
  parentId: bigint("parent_id", { mode: "number", unsigned: true }),
  likes: int("likes").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Achievements
export const achievements = mysqlTable("achievements", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  userType: varchar("user_type", { length: 20 }).notNull(),
  badge: varchar("badge", { length: 100 }).notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type LocalUser = typeof localUsers.$inferSelect;
export type InsertLocalUser = typeof localUsers.$inferInsert;
export type Decision = typeof decisions.$inferSelect;
export type InsertDecision = typeof decisions.$inferInsert;
export type DecisionAnalysis = typeof decisionAnalyses.$inferSelect;
export type Goal = typeof goals.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type ForumPost = typeof forumPosts.$inferSelect;
export type ForumComment = typeof forumComments.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
