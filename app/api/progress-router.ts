import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { decisions, goals, achievements } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export const progressRouter = createRouter({
  getDashboard: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.authType === "local" ? ctx.user.id - 100000 : ctx.user.id;
    const userType = ctx.user.authType;

    // Decision stats
    const allDecisions = await db
      .select()
      .from(decisions)
      .where(and(eq(decisions.userId, userId), eq(decisions.userType, userType)));

    const totalDecisions = allDecisions.length;
    const completedDecisions = allDecisions.filter(
      (d) => d.status === "completed" || d.status === "accepted",
    ).length;

    // Goal stats
    const allGoals = await db
      .select()
      .from(goals)
      .where(and(eq(goals.userId, userId), eq(goals.userType, userType)));

    const totalGoals = allGoals.length;
    const completedGoals = allGoals.filter((g) => g.status === "completed").length;
    const activeGoals = allGoals.filter((g) => g.status === "active");

    // Recent decisions
    const recentDecisions = allDecisions.slice(0, 5);

    // Achievements
    const userAchievements = await db
      .select()
      .from(achievements)
      .where(and(eq(achievements.userId, userId), eq(achievements.userType, userType)));

    // Streak calculation (simplified)
    const streak = Math.min(completedDecisions, 30); // Simplified streak

    return {
      stats: {
        totalDecisions,
        completedDecisions,
        completionRate: totalDecisions > 0 ? Math.round((completedDecisions / totalDecisions) * 100) : 0,
        totalGoals,
        completedGoals,
        activeGoals: activeGoals.length,
        goalProgress: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0,
        currentStreak: streak,
      },
      recentDecisions,
      activeGoals,
      achievements: userAchievements.map((a) => a.badge),
    };
  }),

  getChartData: authedQuery
    .input(z.object({ range: z.enum(["7d", "30d", "90d", "all"]).default("30d") }).optional())
    .query(async ({ ctx, input }) => {
      void input; // range parameter available for future filtering
    const db = getDb();
    const userId = ctx.user.authType === "local" ? ctx.user.id - 100000 : ctx.user.id;
    const userType = ctx.user.authType;

    const allDecisions = await db
      .select()
      .from(decisions)
      .where(and(eq(decisions.userId, userId), eq(decisions.userType, userType)))
      .orderBy(desc(decisions.createdAt));

    // Activity by day (last 30 days)
    const days: Record<string, number> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days[d.toISOString().split("T")[0]] = 0;
    }

    for (const decision of allDecisions) {
      const date = decision.createdAt.toISOString().split("T")[0];
      if (days[date] !== undefined) {
        days[date]++;
      }
    }

    const activityData = Object.entries(days).map(([date, count]) => ({
      date,
      decisions: count,
    }));

    // Outcome distribution
    const outcomes = {
      accepted: allDecisions.filter((d) => d.status === "accepted").length,
      completed: allDecisions.filter((d) => d.status === "completed").length,
      pending: allDecisions.filter((d) => d.status === "pending" || d.status === "analyzing").length,
      saved: allDecisions.filter((d) => d.status === "saved").length,
    };

    // Category breakdown
    const categories: Record<string, number> = {};
    for (const d of allDecisions) {
      const cat = d.category || "general";
      categories[cat] = (categories[cat] || 0) + 1;
    }

    return {
      activity: activityData,
      outcomes: Object.entries(outcomes).map(([name, value]) => ({ name, value })),
      categories: Object.entries(categories).map(([name, value]) => ({ name, value })),
    };
  }),

  getAchievements: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.authType === "local" ? ctx.user.id - 100000 : ctx.user.id;
    const userType = ctx.user.authType;

    const userAchievements = await db
      .select()
      .from(achievements)
      .where(and(eq(achievements.userId, userId), eq(achievements.userType, userType)));

    const allBadges = [
      { id: "first_decision", name: "First Decision", description: "Made your first decision analysis" },
      { id: "seven_streak", name: "7-Day Streak", description: "Completed decisions 7 days in a row" },
      { id: "deep_analyzer", name: "Deep Analyzer", description: "Created 10+ detailed analyses" },
      { id: "goal_crusher", name: "Goal Crusher", description: "Completed 5 goals" },
      { id: "ai_explorer", name: "AI Explorer", description: "Had 20+ AI advisor conversations" },
      { id: "community_voice", name: "Community Voice", description: "Posted in the public forum" },
    ];

    const unlocked = userAchievements.map((a) => a.badge);

    return allBadges.map((badge) => ({
      ...badge,
      unlocked: unlocked.includes(badge.id),
    }));
  }),
});
