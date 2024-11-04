import { generateObject } from "ai";
import openai from "@/lib/openai";
import { z } from "zod";
import { db } from "@/db";
import { entries } from "@/db/schema";
import { eq, desc, gte, and } from "drizzle-orm";

const activityAiFeedbackResponse = z.object({
  activityPatterns: z.string(),
  timeManagement: z.string(),
  suggestions: z.string(),
  trends: z.string(),
});

export const getActivityAiFeedback = async () => {
  // Get today's date at the start of the day
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all activities from today
  const activities = await db
    .select()
    .from(entries)
    .where(
      and(
        eq(entries.type, "activity"),
        gte(entries.createdAt, today)
      )
    )
    .orderBy(desc(entries.createdAt));

  if (activities.length === 0) {
    return {
      activityPatterns: "Nu există activități de analizat pentru ziua de azi.",
      timeManagement: "",
      suggestions: "",
      trends: "",
    };
  }

  const activitiesContext = activities
    .map(
      (activity) =>
        `Date: ${activity.date}, Time: ${activity.time}, Content: ${activity.content}, Mood: ${activity.mood}`
    )
    .join("\n");

  const result = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: activityAiFeedbackResponse,
    prompt: `Analyze the following recent activities and provide structured feedback in Romanian about patterns, trends, and suggestions for improvement. Consider the timing, mood patterns, and nature of activities.

Recent activities:
${activitiesContext}

Please provide your analysis in Romanian, in these specific sections:
1. Tipare de Activitate și Relația cu Starea de Spirit: Analizează cum diferitele activități se corelează cu starea de spirit
2. Observații privind Managementul Timpului: Analizează tiparele de timp și programare
3. Sugestii pentru Optimizare: Oferă idei practice de îmbunătățire
4. Tendințe Notabile: Identifică orice tipare sau corelații semnificative

Keep each section concise but insightful, focusing on the most important observations. Provide ALL responses in Romanian.`,
  });

  return result.object;
};
