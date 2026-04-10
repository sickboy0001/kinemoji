import { NextResponse } from "next/server";
import { kinemojiService } from "@/service/kinemoji-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const kinemoji = await kinemojiService.getByShortId(id);

    if (!kinemoji) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(kinemoji);
  } catch (error) {
    console.error("Error fetching kinemoji:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
