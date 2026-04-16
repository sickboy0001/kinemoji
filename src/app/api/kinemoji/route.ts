import { NextResponse } from "next/server";
import { kinemojiService } from "@/service/kinemoji-service";

export async function DELETE(req: Request) {
  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid IDs provided" },
        { status: 400 },
      );
    }

    await kinemojiService.deleteMany(ids);

    return NextResponse.json({ success: true, count: ids.length });
  } catch (error) {
    console.error("DELETE /api/kinemoji error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
