import { authRouter } from "./auth-router";
import { localAuthRouter } from "./local-auth-router";
import { userRouter } from "./user-router";
import { decisionRouter } from "./decision-router";
import { analysisRouter } from "./analysis-router";
import { goalRouter } from "./goal-router";
import { chatRouter } from "./chat-router";
import { contactRouter } from "./contact-router";
import { forumRouter } from "./forum-router";
import { progressRouter } from "./progress-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  localAuth: localAuthRouter,
  user: userRouter,
  decision: decisionRouter,
  analysis: analysisRouter,
  goal: goalRouter,
  chat: chatRouter,
  contact: contactRouter,
  forum: forumRouter,
  progress: progressRouter,
});

export type AppRouter = typeof appRouter;
