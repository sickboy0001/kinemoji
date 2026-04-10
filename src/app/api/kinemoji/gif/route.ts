import { NextResponse } from "next/server";

/**
 * GIF 生成 API は Background Function を使用するため、このエンドポイントは非推奨です。
 * Netlify 環境では 501 Not Implemented を返します。
 * ローカル環境でのみ同期処理を有効にします。
 */
export async function POST(req: Request) {
  const isNetlify = process.env.NETLIFY === "true";

  if (isNetlify) {
    return NextResponse.json(
      {
        error:
          "This endpoint is deprecated. Please use Background Function instead.",
        suggestion: "Call /.netlify/functions/kinemoji-gif-background",
      },
      { status: 501 }, // Not Implemented
    );
  }

  // ローカル環境でのみ同期処理を有効
  try {
    const { generateAndUploadGif } =
      await import("@/service/kinemoji-gif-service");
    const params = await req.json();
    const result = await generateAndUploadGif(params);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error("GIF generation API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
