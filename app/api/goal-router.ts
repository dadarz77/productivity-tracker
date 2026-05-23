import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { goals } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export const goalRouter = createRouter({
  create: authedQuery
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        category: z.string().optional(),
        targetDate: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.authType === "local" ? ctx.user.id - 100000 : ctx.user.id;

      const result = await db.insert(goals).values({
        userId,
        userType: ctx.user.authType,
        title: input.title,
        description: input.description || null,
        category: input.category || "general",
        targetDate: input.targetDate ? new Date(input.targetDate) : null,
        status: "active",
        progress: 0,
      });

      return { id: Number(result[0].insertId), success: true };
    }),

  list: authedQuery
    .input(
      z
        .object({
          status: z.string().optional(),
          page: z.number().default(1),
          limit: z.number().default(10),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.authType === "local" ? ctx.user.id - 100000 : ctx.user.id;
      const conditions = [eq(goals.userId, userId), eq(goals.userType, ctx.user.authType)];

      if (input?.status) {
        conditions.push(eq(goals.status, input.status));
      }

      const list = await db
        .select()
        .from(goals)
        .where(and(...conditions))
        .orderBy(desc(goals.createdAt))
        .limit(input?.limit || 10)
        .offset(((input?.page || 1) - 1) * (input?.limit || 10));

      return { goals: list };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.string().optional(),
        progress: z.number().min(0).max(100).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const updateData: Record<string, unknown> = {};
      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.progress !== undefined) updateData.progress = input.progress;

      await db.update(goals).set(updateData).where(eq(goals.id, input.id));
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(goals).where(eq(goals.id, input.id));
      return { success: true };
    }),

  getStats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.authType === "local" ? ctx.user.id - 100000 : ctx.user.id;

    const allGoals = await db
      .select()
      .from(goals)
      .where(and(eq(goals.userId, userId), eq(goals.userType, ctx.user.authType)));

    const total = allGoals.length;
    const completed = allGoals.filter((g) => g.status === "completed").length;
    const active = allGoals.filter((g) => g.status === "active").length;
    const avgProgress =
      total > 0 ? Math.round(allGoals.reduce((s, g) => s + (g.progress || 0), 0) / total) : 0;

    return { total, completed, active, avgProgress };
  }),
});
