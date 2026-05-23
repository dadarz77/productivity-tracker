import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { forumPosts, forumComments } from "@db/schema";
import { eq, desc, count } from "drizzle-orm";

export const forumRouter = createRouter({
  createPost: authedQuery
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.authType === "local" ? ctx.user.id - 100000 : ctx.user.id;

      const result = await db.insert(forumPosts).values({
        authorId: userId,
        authorType: ctx.user.authType,
        authorName: ctx.user.name,
        title: input.title,
        content: input.content,
        category: input.category || "general",
        tags: input.tags || [],
        likes: 0,
        views: 0,
      });

      return { id: Number(result[0].insertId), success: true };
    }),

  listPosts: publicQuery
    .input(
      z
        .object({
          page: z.number().default(1),
          limit: z.number().default(10),
          category: z.string().optional(),
          sort: z.string().default("latest"),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page || 1;
      const limit = input?.limit || 10;
      const offset = (page - 1) * limit;

      const conditions = [];
      if (input?.category) {
        conditions.push(eq(forumPosts.category, input.category));
      }

      const list =
        conditions.length > 0
          ? await db
              .select()
              .from(forumPosts)
              .where(eq(forumPosts.category, input!.category!))
              .orderBy(desc(forumPosts.createdAt))
              .limit(limit)
              .offset(offset)
          : await db
              .select()
              .from(forumPosts)
              .orderBy(desc(forumPosts.createdAt))
              .limit(limit)
              .offset(offset);

      const totalResult = await db.select({ count: count() }).from(forumPosts);

      // Get comment counts for each post
      const postsWithComments = await Promise.all(
        list.map(async (post) => {
          const commentCount = await db
            .select({ count: count() })
            .from(forumComments)
            .where(eq(forumComments.postId, post.id));
          return { ...post, commentCount: commentCount[0].count };
        }),
      );

      return {
        posts: postsWithComments,
        total: totalResult[0].count,
        page,
        totalPages: Math.ceil(totalResult[0].count / limit),
      };
    }),

  getPost: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();

      const post = await db
        .select()
        .from(forumPosts)
        .where(eq(forumPosts.id, input.id))
        .limit(1);

      if (post.length === 0) return null;

      // Increment views
      await db
        .update(forumPosts)
        .set({ views: (post[0].views || 0) + 1 })
        .where(eq(forumPosts.id, input.id));

      // Get comments
      const comments = await db
        .select()
        .from(forumComments)
        .where(eq(forumComments.postId, input.id))
        .orderBy(desc(forumComments.createdAt));

      return { ...post[0], views: (post[0].views || 0) + 1, comments };
    }),

  createComment: authedQuery
    .input(
      z.object({
        postId: z.number(),
        content: z.string().min(1),
        parentId: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.authType === "local" ? ctx.user.id - 100000 : ctx.user.id;

      await db.insert(forumComments).values({
        postId: input.postId,
        authorId: userId,
        authorType: ctx.user.authType,
        authorName: ctx.user.name,
        content: input.content,
        parentId: input.parentId || null,
        likes: 0,
      });

      return { success: true };
    }),

  likePost: authedQuery
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      const post = await db
        .select()
        .from(forumPosts)
        .where(eq(forumPosts.id, input.postId))
        .limit(1);

      if (post.length > 0) {
        await db
          .update(forumPosts)
          .set({ likes: (post[0].likes || 0) + 1 })
          .where(eq(forumPosts.id, input.postId));
      }

      return { success: true };
    }),
});
