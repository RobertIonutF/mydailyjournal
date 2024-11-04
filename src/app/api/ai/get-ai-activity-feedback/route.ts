import { getActivityAiFeedback } from "@/actions/ai/get-activity-ai-feedback";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const feedback = await getActivityAiFeedback();
    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("AI Feedback Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate AI feedback",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 