/**
 * 既存の pending ステータスの kinemoji レコードを completed に更新するスクリプト
 *
 * 実行方法:
 *   npx tsx src/scripts/update-pending-to-completed.ts
 */

import "dotenv/config";
import { db } from "@/lib/turso/db";
import { kinemojis } from "@/db/schema";
import { eq, and } from "drizzle-orm";

async function main() {
  console.log("pending ステータスのレコードを検索中...");

  // pending のレコードを取得
  const pendingRecords = await db
    .select()
    .from(kinemojis)
    .where(eq(kinemojis.status, "pending"));

  console.log(`見つかった pending レコード数：${pendingRecords.length}`);

  if (pendingRecords.length === 0) {
    console.log("更新対象のレコードはありませんでした。");
    return;
  }

  // 各レコードを更新
  let updatedCount = 0;
  for (const record of pendingRecords) {
    // imageUrl がある場合は completed、ない場合はそのまま pending にする
    if (record.imageUrl) {
      await db
        .update(kinemojis)
        .set({
          status: "completed",
          progress: 100,
          updatedAt: new Date(),
        })
        .where(eq(kinemojis.id, record.id));

      console.log(`更新：${record.shortId} (imageUrl: ${record.imageUrl})`);
      updatedCount++;
    } else {
      console.log(`スキップ（imageUrl なし）: ${record.shortId}`);
    }
  }

  console.log(
    `\n更新完了：${updatedCount}件のレコードを completed に更新しました。`,
  );
}

main().catch((error) => {
  console.error("エラーが発生しました:", error);
  process.exit(1);
});
