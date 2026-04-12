import { NextResponse } from "next/server";
import { db } from "@/lib/turso/db";
import { kinemojis } from "@/db/schema";
import { eq } from "drizzle-orm";
import { kinemojiService } from "@/service/kinemoji-service";

const EXTERNAL_API_URL =
  process.env.EXTERNAL_API_URL ||
  "https://kinemoji-api-431415447049.asia-northeast1.run.app";

/**
 * ID (UUID または shortId) で Kinemoji を取得する API
 * ポーリング用エンドポイント
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // 1. UUID で検索
    let kinemoji: any = await db.query.kinemojis.findFirst({
      where: eq(kinemojis.id, id),
    });

    // 2. 見つからない場合は shortId で検索
    if (!kinemoji) {
      kinemoji = await db.query.kinemojis.findFirst({
        where: eq(kinemojis.shortId, id),
      });
    }

    if (!kinemoji) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // 3. 完了・失敗していない場合は外部 API に問い合わせて同期を試みる
    if (kinemoji.status === "pending" || kinemoji.status === "processing") {
      try {
        const externalResponse = await fetch(
          `${EXTERNAL_API_URL}/api/kinemoji/status/${kinemoji.id}`,
        );
        if (externalResponse.ok) {
          const externalData = await externalResponse.json();
          const updated = await kinemojiService.updateStatus(
            kinemoji.id,
            externalData.status,
            externalData.progress,
            externalData.image_url,
            externalData.error,
          );
          if (updated) {
            kinemoji = updated;
          }
        }
      } catch (err) {
        console.error("Failed to sync status from external API:", err);
      }
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
