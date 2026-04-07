import { NextResponse } from "next/server";
import { kinemojiService } from "@/service/kinemoji-service";

export async function POST(req: Request) {
  const userId = null;

  try {
    const { text, parameters, imageUrl } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Invalid text" }, { status: 400 });
    }

    const kinemoji = await kinemojiService.create(
      userId,
      text.substring(0, 100),
      parameters,
      imageUrl,
    );
    console.log("Post created:", kinemoji); // デバッグログ追加
    return NextResponse.json(kinemoji);
  } catch (error) {
    console.error("POST /api/posts error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const kinemojis = await kinemojiService.getAll();
    return NextResponse.json(kinemojis);
  } catch (error) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
