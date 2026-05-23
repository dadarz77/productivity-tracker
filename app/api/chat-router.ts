import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { messages } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM_PROMPT = `You are DecisionPilot AI, an expert decision intelligence assistant. You help users analyze decisions from multiple perspectives: time efficiency, risk level, productivity impact, mental stress, cost/resources, long-term benefits, difficulty, and opportunity cost.

Always provide:
1. A clear, structured response
2. Multiple options when relevant with pros/cons
3. Explainable reasoning for recommendations
4. Specific, actionable next steps

Be concise but thorough. Use markdown formatting for readability. Be encouraging and supportive.`;

export const chatRouter = createRouter({
  send: authedQuery
    .input(
      z.object({
        message: z.string().min(1),
        sessionId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.authType === "local" ? ctx.user.id - 100000 : ctx.user.id;
      const sessionId = input.sessionId || `session_${Date.now()}`;

      // Save user message
      await db.insert(messages).values({
        userId,
        userType: ctx.user.authType,
        role: "user",
        content: input.message,
        sessionId,
      });

      // Fetch recent history
      const history = await db
        .select()
        .from(messages)
        .where(and(eq(messages.userId, userId), eq(messages.userType, ctx.user.authType)))
        .orderBy(desc(messages.createdAt))
        .limit(10);

      const chatHistory = history.reverse().map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      }));

      // Call OpenRouter API
      let aiResponse = "";

      try {
        const response = await fetch(OPENROUTER_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": "https://decisionpilot.ai",
            "X-Title": "DecisionPilot AI",
          },
          body: JSON.stringify({
            model: "anthropic/claude-3.5-sonnet",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              ...chatHistory,
              { role: "user", content: input.message },
            ],
            temperature: 0.7,
            max_tokens: 2000,
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
          };
          aiResponse = data.choices?.[0]?.message?.content || "";
        }
      } catch {
        // Fallback response if API fails
      }

      // If API failed or no response, provide a thoughtful fallback
      if (!aiResponse) {
        aiResponse = `I've analyzed your question about "${input.message.substring(0, 50)}..." 

**Key Considerations:**
- **Time Efficiency**: Consider how this impacts your immediate timeline
- **Risk Assessment**: Weigh the potential downsides against the benefits
- **Long-term Impact**: Think about how this decision affects your future goals

**Recommended Next Steps:**
1. Break down the decision into smaller components
2. Use the Decision Analysis tool for a detailed comparison
3. Set a deadline to avoid overthinking

Would you like me to help you create a structured decision analysis?`;
      }

      // Save AI response
      await db.insert(messages).values({
        userId,
        userType: ctx.user.authType,
        role: "assistant",
        content: aiResponse,
        sessionId,
      });

      return {
        response: aiResponse,
        sessionId,
      };
    }),

  getHistory: authedQuery
    .input(
      z
        .object({
          sessionId: z.string().optional(),
          limit: z.number().default(50),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user.authType === "local" ? ctx.user.id - 100000 : ctx.user.id;

      const conditions = [eq(messages.userId, userId), eq(messages.userType, ctx.user.authType)];
      if (input?.sessionId) {
        conditions.push(eq(messages.sessionId, input.sessionId));
      }

      const result = await db
        .select()
        .from(messages)
        .where(and(...conditions))
        .orderBy(desc(messages.createdAt))
        .limit(input?.limit || 50);

      return result.reverse();
    }),
});
