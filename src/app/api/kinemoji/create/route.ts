import { NextResponse } from "next/server";
import { kinemojiService } from "@/service/kinemoji-service";

export async function POST(req: Request) {
  const userId = null; // 将来的に認証を実装する際に使用

  try {
    const { text, parameters } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Invalid text" }, { status: 400 });
    }

    // GIF 生成前のレコードを作成（status: "processing"）
    const kinemoji = await kinemojiService.create(
      userId,
      text.substring(0, 100),
      parameters,
      undefined, // imageUrl は後で更新
    );

    // status を "processing" に更新
    await kinemojiService.updateStatus(kinemoji.id, "processing", 0);

    console.log("Kinemoji created with processing status:", kinemoji);

    // Background Function を非同期で起動（Netlify 環境でのみ有効）
    const isNetlify = process.env.NETLIFY === "true";
    if (isNetlify) {
      const backgroundFunctionUrl = `${process.env.CONTEXT === "production" ? "https://kinemoji.netlify.app" : "http://localhost:8888"}/.netlify/functions/kinemoji-gif-background`;

      // fire-and-forget で Background Function を起動
      fetch(backgroundFunctionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: kinemoji.id,
          text,
          type: parameters?.type,
          action: parameters?.action,
          width: parameters?.width,
          height: parameters?.height,
          foreColor: parameters?.foreColor,
          backColor: parameters?.backColor,
        }),
      }).catch((err) => {
        console.error("Background function trigger failed:", err);
        // Background Function の起動に失敗しても、メイン処理は継続
      });
    }

    console.log("Background function triggered (Netlify environment)");

    // すぐに 202 Accepted を返す
    return NextResponse.json(
      {
        id: kinemoji.id,
        shortId: kinemoji.shortId,
        status: "processing",
        message: isNetlify
          ? "GIF 生成をバックグラウンドで開始しました"
          : "ローカル環境：同期処理で GIF 生成が必要",
      },
      { status: 202 },
    );
  } catch (error) {
    console.error("POST /api/kinemoji/create error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
