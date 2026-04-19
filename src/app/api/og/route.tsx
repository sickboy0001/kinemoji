import { kinemojiService } from "@/service/kinemoji-service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response("Missing id", { status: 400 });
    }

    const kinemoji = await kinemojiService.getByShortId(id);

    if (!kinemoji || !kinemoji.imageUrl) {
      return new Response("Kinemoji not found", { status: 404 });
    }

    // 1. 外部保存されているGIFを取得
    const response = await fetch(kinemoji.imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();

    // 2. ImageResponseを使わず、直接ResponseでGIFを返す
    return new Response(buffer, {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "public, max-age=31536000, s-maxage=31536000",
      },
    });
  } catch (e: any) {
    console.error(`OGP generation error: ${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
