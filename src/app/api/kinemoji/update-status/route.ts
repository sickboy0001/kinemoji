import { NextResponse } from "next/server";
import { kinemojiService } from "@/service/kinemoji-service";
import { eq } from "drizzle-orm";
import { kinemojis } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const {
      id,
      imageUrl,
      status = "completed",
      progress = 100,
      error,
    } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // ステータスと imageUrl を更新
    const result = await kinemojiService.updateStatus(
      id,
      status as "pending" | "processing" | "completed" | "failed",
      progress,
      imageUrl,
      error,
    );

    console.log("Kinemoji status updated:", result);
    return NextResponse.json({
      success: true,
      kinemoji: result[0],
    });
  } catch (error) {
    console.error("POST /api/kinemoji/update-status error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
