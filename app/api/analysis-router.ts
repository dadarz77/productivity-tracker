import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { decisions, decisionAnalyses } from "@db/schema";
import { eq } from "drizzle-orm";
import { analyzeDecision } from "./decision-engine";

export const analysisRouter = createRouter({
  create: authedQuery
    .input(z.object({ decisionId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const startTime = Date.now();

      // Fetch the decision
      const decisionList = await db
        .select()
        .from(decisions)
        .where(eq(decisions.id, input.decisionId))
        .limit(1);

      if (decisionList.length === 0) {
        throw new Error("Decision not found");
      }

      const decision = decisionList[0];

      // Update status to analyzing
      await db
        .update(decisions)
        .set({ status: "analyzing" })
        .where(eq(decisions.id, input.decisionId));

      // Run the decision engine
      const engineInput = {
        title: decision.title,
        goal: decision.goal || "",
        situation: decision.situation || "",
        availableTime: decision.availableTime || "1 week",
        resources: (decision.resources as string[]) || [],
        priorities: (decision.priorities as string[]) || [],
        deadline: decision.deadline ? decision.deadline.toISOString().split("T")[0] : null,
        stressLevel: decision.stressLevel || 5,
        confidenceLevel: decision.confidenceLevel || 5,
        options: (decision.options as string[]) || ["Option A", "Option B"],
        constraints: decision.constraints || "",
        preferences: (decision.preferences as Record<string, boolean>) || {},
        profession: (decision.category as string) || "",
      };

      const result = analyzeDecision(engineInput);

      // Save the analysis
      await db.insert(decisionAnalyses).values({
        decisionId: input.decisionId,
        summary: result.summary,
        confidence: result.confidence,
        recommendation: result.recommendation,
        reasoning: result.reasoning,
        optionsAnalysis: result.optionsAnalysis,
        tradeOffMatrix: result.tradeOffMatrix,
      });

      // Update decision status
      await db
        .update(decisions)
        .set({ status: "completed" })
        .where(eq(decisions.id, input.decisionId));

      const processingTime = Date.now() - startTime;

      return {
        analysis: result,
        processingTime,
      };
    }),

  getByDecisionId: authedQuery
    .input(z.object({ decisionId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(decisionAnalyses)
        .where(eq(decisionAnalyses.decisionId, input.decisionId))
        .limit(1);

      return result[0] || null;
    }),
});
