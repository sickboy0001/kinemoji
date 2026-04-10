import { chromium } from "playwright-core";
import GIFEncoder from "gif-encoder-2";
import sharp from "sharp";
import { uploadKinemojiImage } from "./kinemoji-upload-service";
import * as path from "path";
import chromiumServerless from "@sparticuz/chromium";

interface GifParameters {
  text: string;
  type: string;
  action: string;
  width: number;
  height: number;
  foreColor: string;
  backColor: string;
}

export async function generateAndUploadGif(params: GifParameters) {
  const { text, type, action, width, height, foreColor, backColor } = params;

  // サーバーレス環境（Netlify/Vercel）かどうかを判定
  // ローカル Windows 環境で誤検知されないよう、OS のチェックも追加
  const isServerless =
    !!(process.env.NETLIFY || process.env.VERCEL) &&
    process.platform !== "win32";

  let browser;
  if (isServerless) {
    console.log("Running in serverless mode, launching sparticuz-chromium...");
    try {
      // Netlify 環境では @sparticuz/chromium を使用
      // サーバーレス環境向けに最適化された Chromium の実行パスを取得
      const executablePath = await chromiumServerless.executablePath();
      console.log("Chromium executable path:", executablePath);

      // Playwright で指定された実行パスの Chromium を起動
      // @sparticuz/chromium の args プロパティは配列を返す
      browser = await chromium.launch({
        executablePath,
        headless: true,
        args: [
          ...chromiumServerless.args,
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--single-process",
          "--disable-gpu",
          "--font-render-hinting=none",
          "--disable-blink-features=FontRendering",
        ],
      });
    } catch (error) {
      console.error("Serverless chromium launch failed:", error);
      throw error;
    }
  } else {
    // ローカル環境（Windows/Mac/Linux）
    console.log("Running in local mode, launching standard chromium...");
    try {
      // ローカルでは環境パスにインストールされたブラウザを使用する
      browser = await chromium.launch({ headless: true });
    } catch (e) {
      console.warn(
        "Standard playwright-core launch failed, trying with dynamic import of 'playwright'...",
        e,
      );
      try {
        const playwright = await import("playwright");
        browser = await playwright.chromium.launch({ headless: true });
      } catch (e2) {
        console.error("All local browser launch attempts failed:", e2);
        throw new Error(
          "Failed to launch browser. Please ensure playwright is installed (npx playwright install chromium)",
        );
      }
    }
  }

  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width, height });

    // レンダリング用の URL（開発環境または本番環境のベース URL が必要）
    // ここでは、特殊なレンダリング用ページ /kinemoji/render を想定
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const renderUrl = `${baseUrl}/kinemoji/render?text=${encodeURIComponent(
      text,
    )}&type=${type}&action=${action}&width=${width}&height=${height}&foreColor=${foreColor}&backColor=${backColor}`;

    console.log("Navigating to:", renderUrl);
    await page.goto(renderUrl, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // GIF 生成
    const encoder = new GIFEncoder(width, height);
    const chunks: Buffer[] = [];

    // フレームをキャプチャ（アニメーションの場合は複数回）
    const frameCount = type === "animation" ? 30 : 1;
    const frameDelay = type === "animation" ? 100 : 0;

    for (let i = 0; i < frameCount; i++) {
      if (type === "animation") {
        // アニメーションの場合は少し待機
        await new Promise((resolve) => setTimeout(resolve, frameDelay));
      }

      const screenshot = await page.screenshot({
        type: "png",
        fullPage: false,
      });
      encoder.addFrame(screenshot);
    }

    encoder.finish();
    let gifBuffer = encoder.out.getData();

    // 画像を圧縮（オプション）
    if (gifBuffer.length > 2 * 1024 * 1024) {
      console.log("Compressing GIF...");
      gifBuffer = await sharp(gifBuffer)
        .resize({ width: Math.min(width, 800), fit: "inside" })
        .toFormat("gif")
        .toBuffer();
    }

    // R2 にアップロード
    const formData = new FormData();
    const blob = new Blob([gifBuffer.buffer as ArrayBuffer], {
      type: "image/gif",
    });
    formData.append("file", blob, "output.gif");

    const result = await uploadKinemojiImage(formData);

    if (!result.success) {
      throw new Error(result.error || "Failed to upload GIF");
    }

    return {
      success: true,
      url: result.url,
    };
  } finally {
    await browser.close();
  }
}
