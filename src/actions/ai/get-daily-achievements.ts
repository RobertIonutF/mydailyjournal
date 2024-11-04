import { generateObject } from "ai";
import openai from "@/lib/openai";
import { z } from "zod";
import { db } from "@/db";
import { entries } from "@/db/schema";
import { eq, desc, gte, and, or } from "drizzle-orm";

const dailyAchievementsResponse = z.object({
  majorAchievements: z.string(),
  smallWins: z.string(),
  personalGrowth: z.string(),
  positivePatterns: z.string(),
});

export const getDailyAchievements = async () => {
  // Get today's date at the start of the day
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get both activities and thoughts from today
  const dailyEntries = await db
    .select()
    .from(entries)
    .where(
      and(
        or(
          eq(entries.type, "activity"),
          eq(entries.type, "thoughts")
        ),
        gte(entries.createdAt, today)
      )
    )
    .orderBy(desc(entries.createdAt));

  if (dailyEntries.length === 0) {
    return {
      majorAchievements: "Nu există înregistrări pentru ziua de azi.",
      smallWins: "",
      personalGrowth: "",
      positivePatterns: "",
    };
  }

  const entriesContext = dailyEntries
    .map(
      (entry) =>
        `Type: ${entry.type}, Time: ${entry.time}, Content: ${entry.content}, Mood: ${entry.mood}`
    )
    .join("\n");

  const result = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: dailyAchievementsResponse,
    prompt: `Analyze the following daily activities and thoughts with an emphasis on identifying and celebrating achievements, no matter how small. Take a very positive, encouraging perspective, and help counter any negative self-talk. Consider both explicit accomplishments and implicit wins.

Daily entries:
${entriesContext}

Please provide your analysis in Romanian, in these specific sections:
1. Realizări Importante: Identifică și subliniază realizările majore ale zilei
2. Micile Victorii: Evidențiază progresele mici dar semnificative și momentele pozitive
3. Creștere Personală: Identifică aspectele care demonstrează dezvoltare personală sau auto-îmbunătățire
4. Tipare Pozitive: Subliniază comportamentele și gândurile constructive observate

Focus on being encouraging and supportive, while maintaining honesty. Help reframe challenges as opportunities for growth. Provide ALL responses in Romanian.`,
  });

  return result.object;
}; 