import { NextRequest, NextResponse } from "next/server";

/**
 * 外部URLの画像をプロキシしてダウンロードを強制するAPI
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const filename = searchParams.get("filename") || "kinemoji.gif";

  if (!url) {
    return new NextResponse("Missing URL", { status: 400 });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const blob = await response.blob();
    const headers = new Headers();

    // Content-Disposition を設定してダウンロードを強制する
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    headers.set(
      "Content-Type",
      response.headers.get("Content-Type") || "image/gif",
    );

    return new NextResponse(blob, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Download proxy error:", error);
    return new NextResponse("Failed to download image", { status: 500 });
  }
}
