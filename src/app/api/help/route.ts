import { NextRequest, NextResponse } from "next/server";
import { HELP_TOPICS } from "@/contents/help/help-topics";

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json(HELP_TOPICS);
  } catch (error) {
    console.error("Help topics API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
