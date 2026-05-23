import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { localUsers } from "@db/schema";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyLocalToken,
} from "./local-auth-utils";

export const localAuthRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        username: z.string().min(3).max(50),
        password: z.string().min(6),
        displayName: z.string().optional(),
        email: z.string().email().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Check if username already exists
      const existing = await db
        .select()
        .from(localUsers)
        .where(eq(localUsers.username, input.username))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username already exists",
        });
      }

      const passwordHash = await hashPassword(input.password);

      const result = await db.insert(localUsers).values({
        username: input.username,
        displayName: input.displayName || input.username,
        email: input.email || null,
        passwordHash,
        role: "user",
      });

      const userId = Number(result[0].insertId);
      const token = generateToken(userId);

      return {
        token,
        user: {
          id: userId,
          username: input.username,
          displayName: input.displayName || input.username,
          name: input.displayName || input.username,
          role: "user" as const,
        },
      };
    }),

  login: publicQuery
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const users = await db
        .select()
        .from(localUsers)
        .where(eq(localUsers.username, input.username))
        .limit(1);

      if (users.length === 0) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid username or password",
        });
      }

      const user = users[0];
      const valid = await comparePassword(input.password, user.passwordHash);

      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid username or password",
        });
      }

      const token = generateToken(user.id);

      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          name: user.displayName || user.username,
          role: user.role,
        },
      };
    }),

  me: publicQuery.query(async ({ ctx }) => {
    const token = ctx.req.headers.get("x-local-auth-token");
    if (!token) return null;

    const user = await verifyLocalToken(token);
    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      name: user.displayName || user.username,
      role: user.role,
      avatar: user.avatar,
    };
  }),
});
