import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { decisions } from "@db/schema";
import { eq, and, desc, count } from "drizzle-orm";

export const decisionRouter = createRouter({
  create: authedQuery
    .input(
      z.object({
        title: z.string().min(1),
        goal: z.string().optional(),
        situation: z.string().optional(),
        availableTime: z.string().optional(),
        resources: z.array(z.string()).optional(),
        priorities: z.array(z.string()).optional(),
        deadline: z.string().nullable().optional(),
        stressLevel: z.number().min(1).max(10).optional(),
        confidenceLevel: z.number().min(1).max(10).optional(),
        options: z.array(z.string()).optional(),
        constraints: z.string().optional(),
        preferences: z.any().optional(),
        category: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.authType === "local" ? ctx.user.id - 100000 : ctx.user.id;

      const result = await db.insert(decisions).values({
        userId,
        userType: ctx.user.authType,
        title: input.title,
        goal: input.goal || null,
        situation: input.situation || null,
        availableTime: input.availableTime || null,
        resources: input.resources || [],
        priorities: input.priorities || [],
        deadline: input.deadline ? new Date(input.deadline) : null,
        stressLevel: input.stressLevel || 5,
        confidenceLevel: input.confidenceLevel || 5,
        options: input.options || ["Option A", "Option B"],
        constraints: input.constraints || null,
        preferences: input.preferences || {},
        status: "pending",
        category: input.category || "general",
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
      const page = input?.page || 1;
      const limit = input?.limit || 10;
      const offset = (page - 1) * limit;

      const conditions = [eq(decisions.userId, userId), eq(decisions.userType, ctx.user.authType)];
      if (input?.status) {
        conditions.push(eq(decisions.status, input.status));
      }

      const list = await db
        .select()
        .from(decisions)
        .where(and(...conditions))
        .orderBy(desc(decisions.createdAt))
        .limit(limit)
        .offset(offset);

      const totalResult = await db
        .select({ count: count() })
        .from(decisions)
        .where(and(...conditions));

      return {
        decisions: list,
        total: totalResult[0].count,
        page,
        totalPages: Math.ceil(totalResult[0].count / limit),
      };
    }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(decisions)
        .where(eq(decisions.id, input.id))
        .limit(1);

      return result[0] || null;
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        status: z.string().optional(),
        goal: z.string().optional(),
        situation: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const updateData: Record<string, unknown> = {};
      if (input.title) updateData.title = input.title;
      if (input.status) updateData.status = input.status;
      if (input.goal) updateData.goal = input.goal;
      if (input.situation) updateData.situation = input.situation;

      await db.update(decisions).set(updateData).where(eq(decisions.id, input.id));
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(decisions).where(eq(decisions.id, input.id));
      return { success: true };
    }),

  getStats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.authType === "local" ? ctx.user.id - 100000 : ctx.user.id;

    const allDecisions = await db
      .select()
      .from(decisions)
      .where(and(eq(decisions.userId, userId), eq(decisions.userType, ctx.user.authType)));

    const total = allDecisions.length;
    const completed = allDecisions.filter((d) => d.status === "completed" || d.status === "accepted").length;
    const pending = allDecisions.filter((d) => d.status === "pending" || d.status === "analyzing").length;

    const byCategory: Record<string, number> = {};
    for (const d of allDecisions) {
      const cat = d.category || "general";
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    }

    return {
      total,
      completed,
      pending,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      byCategory,
    };
  }),
});
