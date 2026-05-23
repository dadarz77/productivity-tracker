import { relations } from "drizzle-orm";
import {
  users,
  localUsers,
  
  decisions,
  decisionAnalyses,
  goals,
  messages,
  forumPosts,
  forumComments,
  achievements,
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  decisions: many(decisions),
  goals: many(goals),
  messages: many(messages),
  achievements: many(achievements),
}));

export const localUsersRelations = relations(localUsers, ({ many }) => ({
  decisions: many(decisions),
  goals: many(goals),
  messages: many(messages),
  achievements: many(achievements),
}));

export const decisionsRelations = relations(decisions, ({ one }) => ({
  analysis: one(decisionAnalyses, {
    fields: [decisions.id],
    references: [decisionAnalyses.decisionId],
  }),
}));

export const forumPostsRelations = relations(forumPosts, ({ many }) => ({
  comments: many(forumComments),
}));

export const forumCommentsRelations = relations(forumComments, ({ one, many }) => ({
  post: one(forumPosts, {
    fields: [forumComments.postId],
    references: [forumPosts.id],
  }),
  replies: many(forumComments, { relationName: "replies" }),
  parent: one(forumComments, {
    fields: [forumComments.parentId],
    references: [forumComments.id],
    relationName: "replies",
  }),
}));
