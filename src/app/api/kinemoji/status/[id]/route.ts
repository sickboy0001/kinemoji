import { NextResponse } from "next/server";
import { kinemojiService } from "@/service/kinemoji-service";

const EXTERNAL_API_URL =
  process.env.EXTERNAL_API_URL ||
  "https://kinemoji-api-431415447049.asia-northeast1.run.app";

/**
 * GIF 生成ステータス確認 API
 * ローカル DB の情報を返しつつ、必要に応じて外部 API サーバーと同期します。
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    // 1. ローカル DB で検索
    let kinemoji = await kinemojiService.getById(id);
    if (!kinemoji) {
      kinemoji = await kinemojiService.getByShortId(id);
    }

    if (!kinemoji) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    // 2. 完了・失敗していない場合は外部 API に問い合わせて同期を試みる
    if (kinemoji.status === "pending" || kinemoji.status === "processing") {
      try {
        console.log(
          "Syncing status from external API:",
          `${EXTERNAL_API_URL}/api/kinemoji/status/${kinemoji.id}`,
        );
        const externalResponse = await fetch(
          `${EXTERNAL_API_URL}/api/kinemoji/status/${kinemoji.id}`,
        );
        console.log(
          "External API status sync response:",
          externalResponse.status,
        );

        if (externalResponse.ok) {
          const externalData = await externalResponse.json();
          console.log("External API status data:", externalData);
          // 外部のデータでローカル DB を更新
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

    return formatResponse(kinemoji);
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

function formatResponse(kinemoji: any) {
  const parameters = kinemoji.parameters
    ? typeof kinemoji.parameters === "string"
      ? JSON.parse(kinemoji.parameters)
      : kinemoji.parameters
    : {};

  return NextResponse.json({
    id: kinemoji.id,
    status: kinemoji.status,
    progress: kinemoji.progress,
    type: parameters.type || "standard",
    action: parameters.action || "fade",
    image_url: kinemoji.imageUrl,
    error: kinemoji.error,
  });
}
