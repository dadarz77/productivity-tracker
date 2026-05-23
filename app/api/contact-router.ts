import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { contacts } from "@db/schema";
import { eq, desc, count } from "drizzle-orm";

export const contactRouter = createRouter({
  create: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        subject: z.string().min(1),
        message: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(contacts).values({
        name: input.name,
        email: input.email,
        subject: input.subject,
        message: input.message,
        status: "new",
      });
      return { success: true };
    }),

  list: adminQuery
    .input(
      z
        .object({
          page: z.number().default(1),
          limit: z.number().default(20),
          status: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page || 1;
      const limit = input?.limit || 20;
      const offset = (page - 1) * limit;

      const conditions = [];
      if (input?.status) {
        conditions.push(eq(contacts.status, input.status));
      }

      const list =
        conditions.length > 0
          ? await db
              .select()
              .from(contacts)
              .where(eq(contacts.status, input!.status!))
              .orderBy(desc(contacts.createdAt))
              .limit(limit)
              .offset(offset)
          : await db
              .select()
              .from(contacts)
              .orderBy(desc(contacts.createdAt))
              .limit(limit)
              .offset(offset);

      const totalResult = await db.select({ count: count() }).from(contacts);

      return {
        contacts: list,
        total: totalResult[0].count,
        page,
        totalPages: Math.ceil(totalResult[0].count / limit),
      };
    }),

  updateStatus: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["new", "read", "replied"]),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(contacts)
        .set({ status: input.status })
        .where(eq(contacts.id, input.id));
      return { success: true };
    }),
});
