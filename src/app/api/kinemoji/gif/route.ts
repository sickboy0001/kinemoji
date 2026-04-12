import { NextResponse } from "next/server";

const EXTERNAL_API_URL =
  process.env.EXTERNAL_API_URL ||
  "https://kinemoji-api-431415447049.asia-northeast1.run.app";

/**
 * GIF 生成リクエストを外部 API サーバーに転送します。
 * データの登録は外部 API 側で行われるため、ここでは転送のみ行います。
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text } = body;
    // UI から parameters がフラットに送られてくる場合と、
    // オブジェクトとして送られてくる場合の両方に対応
    const parameters = body.parameters || body;

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // 仕様書に合わせたパラメータのマッピング
    let finalType = parameters?.type || "opacity";
    let finalAction = parameters?.action || "fade";

    // 1. UI 特有の組み合わせを仕様書に合わせる
    if (finalType === "lupin") {
      finalAction = "fade"; // 仕様書では (任意)
    } else if (finalAction === "typewriter") {
      finalType = "typewriter";
      finalAction = "fade"; // 仕様書では (任意)
    } else if (finalType === "opacity") {
      finalAction = "fade";
    } else if (finalType === "direction") {
      if (!["up", "down", "left", "right"].includes(finalAction)) {
        finalAction = "down";
      }
    } else if (finalType === "zoom") {
      if (!["in", "out"].includes(finalAction)) {
        finalAction = "in";
      }
    }

    const mappedParameters = {
      type: finalType,
      action: finalAction,
      backColor: parameters?.backColor || "white",
      textColor: parameters?.foreColor || parameters?.textColor || "black",
      fontSize: parameters?.fontSize || 48,
    };

    const requestBody = { text, parameters: mappedParameters };
    console.log(
      "External API request body:",
      JSON.stringify(requestBody, null, 2),
    );

    // 外部 API サーバーを叩く
    const externalUrl = `${EXTERNAL_API_URL}/api/kinemoji/gif`;
    console.log("Calling external API:", externalUrl);

    const externalResponse = await fetch(externalUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    console.log("External API response status:", externalResponse.status);

    if (!externalResponse.ok) {
      const errorText = await externalResponse.text();
      console.error("External API error response:", errorText);
      return NextResponse.json(
        { error: "External API error" },
        { status: externalResponse.status },
      );
    }

    const externalData = await externalResponse.json();
    console.log("External API success data:", externalData);

    // 外部 API のレスポンスをそのまま返す
    // { id, status }
    return NextResponse.json(externalData);
  } catch (error) {
    console.error("GIF generation API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
