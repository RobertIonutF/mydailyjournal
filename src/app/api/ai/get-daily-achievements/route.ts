import { getDailyAchievements } from "@/actions/ai/get-daily-achievements";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const achievements = await getDailyAchievements();
    return NextResponse.json(achievements);
  } catch (error) {
    console.error("Error getting daily achievements:", error);
    return NextResponse.json(
      { error: "Failed to get daily achievements" },
      { status: 500 }
    );
  }
} 