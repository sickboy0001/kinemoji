import { NextResponse } from "next/server";
import { db } from "@/lib/turso/db";
import { kinemojis } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * UUID で Kinemoji を取得する API
 * ポーリング用エンドポイント
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // UUID で検索（shortId ではなく id を使用）
    const kinemoji = await db.query.kinemojis.findFirst({
      where: eq(kinemojis.id, id),
    });

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
