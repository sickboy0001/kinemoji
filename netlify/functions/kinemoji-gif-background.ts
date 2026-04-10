import { Handler } from "@netlify/functions";
import { generateAndUploadGif } from "../../src/service/kinemoji-gif-service";
import { db } from "../../src/lib/turso/db";
import { kinemojis } from "../../src/db/schema";
import { eq } from "drizzle-orm";

/**
 * Background Function for GIF generation
 * 最大 15 分まで実行可能（Netlify Background Functions）
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  let params: {
    id: string;
    text: string;
    type: string;
    action: string;
    width: number;
    height: number;
    foreColor: string;
    backColor: string;
  };

  try {
    params = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { id, text, type, action, width, height, foreColor, backColor } =
    params;

  if (
    !id ||
    !text ||
    !type ||
    !action ||
    !width ||
    !height ||
    !foreColor ||
    !backColor
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required parameters" }),
    };
  }

  console.log(`[Background Function] Starting GIF generation for id: ${id}`);

  try {
    // GIF 生成処理（最大 15 分まで実行可能）
    console.log(`[Background Function] Generating GIF...`);
    const result = await generateAndUploadGif({
      text,
      type: type as "direction" | "zoom" | "opacity" | "lupin",
      action: action as
        | "down"
        | "up"
        | "left"
        | "right"
        | "in"
        | "out"
        | "fade"
        | "blur"
        | "typewriter"
        | "random",
      width,
      height,
      foreColor,
      backColor,
    });

    if (result.success && result.url) {
      // DB を更新（completed）
      console.log(
        `[Background Function] GIF generated successfully: ${result.url}`,
      );
      await db
        .update(kinemojis)
        .set({
          status: "completed",
          progress: 100,
          imageUrl: result.url,
          updatedAt: new Date(),
        })
        .where(eq(kinemojis.id, id));

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, url: result.url }),
      };
    } else {
      // エラー処理（failed）
      const errorMessage =
        result.error || "Unknown error during GIF generation";
      console.error(
        `[Background Function] GIF generation failed: ${errorMessage}`,
      );

      await db
        .update(kinemojis)
        .set({
          status: "failed",
          progress: 0,
          error: errorMessage,
          updatedAt: new Date(),
        })
        .where(eq(kinemojis.id, id));

      return { statusCode: 500, body: JSON.stringify({ error: errorMessage }) };
    }
  } catch (error) {
    // 予期せぬエラー処理（failed）
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`[Background Function] Unexpected error:`, error);

    try {
      await db
        .update(kinemojis)
        .set({
          status: "failed",
          error: errorMessage,
          updatedAt: new Date(),
        })
        .where(eq(kinemojis.id, id));
    } catch (dbError) {
      console.error(`[Background Function] Failed to update DB:`, dbError);
    }

    return { statusCode: 500, body: JSON.stringify({ error: errorMessage }) };
  }
};
