import { db } from "@/lib/turso/db";
import { kinemojis } from "@/db/schema";
import { eq, and } from "drizzle-orm";

async function main() {
  console.log("Pending records を completed に更新します...");

  // pending かつ imageUrl があるレコードを取得
  const pendingRecords = await db.query.kinemojis.findMany({
    where: and(
      eq(kinemojis.status, "pending"),
      // imageUrl が NULL でない
    ),
  });

  let updatedCount = 0;
  for (const record of pendingRecords) {
    // imageUrl がある場合は completed、ない場合はそのまま pending にする
    if (record.imageUrl) {
      await db
        .update(kinemojis)
        .set({
          status: "completed",
          progress: 100,
          updatedAt: Date.now(),
        })
        .where(eq(kinemojis.id, record.id));

      console.log(`更新：${record.shortId} (imageUrl: ${record.imageUrl})`);
      updatedCount++;
    } else {
      console.log(`スキップ（imageUrl なし）: ${record.shortId}`);
    }
  }

  console.log(`完了：${updatedCount}レコードを更新しました。`);
}

main()
  .catch((error) => {
    console.error("エラー:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
