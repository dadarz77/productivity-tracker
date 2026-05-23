import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users, localUsers, userProfiles } from "@db/schema";
import { eq, like, or, desc } from "drizzle-orm";

export const userRouter = createRouter({
  getProfile: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;
    const userType = ctx.user.authType;

    const realId = userType === "local" ? userId - 100000 : userId;

    const profile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, realId))
      .limit(1);

    if (profile.length > 0) return profile[0];

    // Create default profile
    await db.insert(userProfiles).values({
      userId: realId,
      userType,
      profession: "Custom",
    });

    return (
      await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, realId))
        .limit(1)
    )[0];
  }),

  updateProfile: authedQuery
    .input(
      z.object({
        profession: z.string().optional(),
        bio: z.string().optional(),
        preferences: z.any().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.authType === "local" ? ctx.user.id - 100000 : ctx.user.id;

      await db
        .update(userProfiles)
        .set({
          profession: input.profession,
          bio: input.bio,
          preferences: input.preferences,
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.userId, userId));

      return { success: true };
    }),

  list: adminQuery
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        search: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const db = getDb();
      const offset = (input.page - 1) * input.limit;

      let oauthUsers = await db.select().from(users).orderBy(desc(users.createdAt));
      let localUsersList = await db.select().from(localUsers).orderBy(desc(localUsers.createdAt));

      if (input.search) {
        const s = `%${input.search}%`;
        oauthUsers = await db
          .select()
          .from(users)
          .where(or(like(users.name, s), like(users.email, s)))
          .orderBy(desc(users.createdAt));
        localUsersList = await db
          .select()
          .from(localUsers)
          .where(or(like(localUsers.username, s), like(localUsers.email, s)))
          .orderBy(desc(localUsers.createdAt));
      }

      const allUsers = [
        ...oauthUsers.map((u) => ({
          id: u.id,
          name: u.name || "User",
          email: u.email,
          role: u.role,
          authType: "oauth" as const,
          createdAt: u.createdAt,
        })),
        ...localUsersList.map((u) => ({
          id: u.id + 100000,
          name: u.displayName || u.username,
          email: u.email,
          role: u.role,
          authType: "local" as const,
          createdAt: u.createdAt,
        })),
      ];

      const paginated = allUsers.slice(offset, offset + input.limit);

      return {
        users: paginated,
        total: allUsers.length,
        page: input.page,
        totalPages: Math.ceil(allUsers.length / input.limit),
      };
    }),

  updateRole: adminQuery
    .input(
      z.object({
        userId: z.number(),
        authType: z.enum(["oauth", "local"]),
        role: z.enum(["user", "admin"]),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      if (input.authType === "oauth") {
        await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
      } else {
        await db
          .update(localUsers)
          .set({ role: input.role })
          .where(eq(localUsers.id, input.userId - 100000));
      }

      return { success: true };
    }),
});
