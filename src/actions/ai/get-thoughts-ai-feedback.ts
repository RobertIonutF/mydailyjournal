import { generateObject } from "ai";
import openai from "@/lib/openai";
import { z } from "zod";
import { db } from "@/db";
import { entries } from "@/db/schema";
import { eq, desc, gte, and } from "drizzle-orm";

const thoughtsAiFeedbackResponse = z.object({
  thoughtPatterns: z.string(),
  emotionalInsights: z.string(),
  suggestions: z.string(),
  trends: z.string(),
});

export const getThoughtsAiFeedback = async () => {
  // Get today's date at the start of the day
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all thoughts from today
  const thoughts = await db
    .select()
    .from(entries)
    .where(
      and(
        eq(entries.type, "thoughts"),
        gte(entries.createdAt, today)
      )
    )
    .orderBy(desc(entries.createdAt));

  if (thoughts.length === 0) {
    return {
      thoughtPatterns: "Nu există gânduri de analizat pentru ziua de azi.",
      emotionalInsights: "",
      suggestions: "",
      trends: "",
    };
  }

  const thoughtsContext = thoughts
    .map(
      (thought) =>
        `Date: ${thought.date}, Time: ${thought.time}, Content: ${thought.content}, Mood: ${thought.mood}`
    )
    .join("\n");

  const result = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: thoughtsAiFeedbackResponse,
    prompt: `Analyze the following recent thoughts and provide structured feedback in Romanian about patterns, emotional states, and insights. Consider the timing, mood patterns, and content of thoughts.

Recent thoughts:
${thoughtsContext}

Please provide your analysis in Romanian, in these specific sections:
1. Tipare de Gândire: Analizează temele recurente și tiparele de gândire
2. Perspective Emoționale: Analizează stările emoționale și factorii lor declanșatori
3. Sugestii: Oferă idei practice pentru bunăstarea emoțională
4. Tendințe Notabile: Identifică orice tipare sau corelații semnificative

Keep each section concise but insightful, focusing on the most important observations. Provide ALL responses in Romanian.`,
  });

  return result.object;
}; 