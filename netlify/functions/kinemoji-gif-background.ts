import { Handler } from "@netlify/functions";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";
import { db } from "../../src/lib/turso/db";
import { kinemojis } from "../../src/db/schema";
import { eq } from "drizzle-orm";

export const handler: Handler = async (event) => {
  // CORS 対応（必要に応じて）
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: "Method Not Allowed" };
  }

  let id: string | undefined;
  try {
    const {
      id: inputId,
      text,
      type,
      action,
      width,
      height,
      foreColor,
      backColor,
    } = JSON.parse(event.body || "{}");
    id = inputId;

    if (!id || !text) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing required parameters" }),
      };
    }

    console.log(`[Background Function] Starting GIF generation for id: ${id}`);

    // 状態を "processing" に更新
    await db
      .update(kinemojis)
      .set({
        status: "processing",
        progress: 10,
        updatedAt: new Date(),
      })
      .where(eq(kinemojis.id, id));

    // GIF 生成処理
    let browser;
    try {
      console.log("[Background Function] Generating GIF...");

      // Netlify 環境では @sparticuz/chromium-min を使用
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: true,
      });

      const page = await browser.newPage();
      await page.setViewport({ width, height });

      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "https://kinemoji.netlify.app";
      const renderUrl = `${baseUrl}/kinemoji/render?text=${encodeURIComponent(
        text,
      )}&type=${type}&action=${action}&width=${width}&height=${height}&foreColor=${foreColor}&backColor=${backColor}`;

      console.log("Navigating to:", renderUrl);
      await page.goto(renderUrl, {
        waitUntil: "networkidle0",
        timeout: 30000,
      });

      // GIF 生成
      const encoder = new (await import("gif-encoder-2")).default(
        width,
        height,
      );
      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(type === "animation" ? 100 : 0);
      encoder.setQuality(10);

      const frameCount = type === "animation" ? 30 : 1;
      for (let i = 0; i < frameCount; i++) {
        if (type === "animation") {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        const screenshot = await page.screenshot({
          type: "png",
          fullPage: false,
        });
        encoder.addFrame(screenshot);
      }

      encoder.finish();
      const gifBuffer = encoder.out.getData();

      if (!gifBuffer) {
        throw new Error("Failed to generate GIF buffer");
      }

      // R2 にアップロード
      const { uploadKinemojiImage } =
        await import("../../src/service/kinemoji-upload-service");
      const formData = new FormData();
      const blob = new Blob([gifBuffer.buffer as ArrayBuffer], {
        type: "image/gif",
      });
      formData.append("file", blob, "output.gif");

      const uploadResult = await uploadKinemojiImage(formData);

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || "Failed to upload GIF");
      }

      // 状態を "completed" に更新
      await db
        .update(kinemojis)
        .set({
          status: "completed",
          imageUrl: uploadResult.url,
          progress: 100,
          updatedAt: new Date(),
        })
        .where(eq(kinemojis.id, id));

      console.log(
        `[Background Function] GIF generation completed for id: ${id}`,
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, url: uploadResult.url }),
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(
      `[Background Function] GIF generation failed: ${errorMessage}`,
    );

    try {
      if (id) {
        await db
          .update(kinemojis)
          .set({
            status: "failed",
            progress: 0,
            error: errorMessage,
            updatedAt: new Date(),
          })
          .where(eq(kinemojis.id, id));
      }
    } catch (dbError) {
      console.error("Failed to update database with error:", dbError);
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: errorMessage }),
    };
  }
};
