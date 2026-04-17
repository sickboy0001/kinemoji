import { ImageResponse } from "next/og";
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

    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000",
          position: "relative",
        }}
      >
        {/* 背景画像 */}
        <img
          src={kinemoji.imageUrl}
          alt={kinemoji.text}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />

        {/* 右下の GIF バッジ */}
        <div
          style={{
            position: "absolute",
            bottom: 30,
            right: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            color: "#000",
            padding: "8px 16px",
            borderRadius: "12px",
            fontWeight: "900",
            fontSize: 32,
            letterSpacing: "0.05em",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            border: "2px solid #000",
          }}
        >
          GIF
        </div>

        {/* 左上のサービスロゴ風テキスト */}
        <div
          style={{
            position: "absolute",
            top: 30,
            left: 30,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "#f97316", // orange-500
              display: "flex",
            }}
          />
          <span
            style={{
              color: "white",
              fontSize: 32,
              fontWeight: "900",
              letterSpacing: "-0.05em",
              textShadow: "0 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            Kinemoji
          </span>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: any) {
    console.error(`OGP generation error: ${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
