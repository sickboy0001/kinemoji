import { chromium } from "playwright-core";
import chromiumServerless from "@sparticuz/chromium";
import GIFEncoder from "gif-encoder-2";
import sharp from "sharp";
import { uploadKinemojiImage } from "./kinemoji-upload-service";

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
  // ローカルWindows環境で誤検知されないよう、OSのチェックも追加
  const isServerless =
    !!(process.env.NETLIFY || process.env.VERCEL) &&
    process.platform !== "win32";

  let browser;
  if (isServerless) {
    console.log("Running in serverless mode, launching sparticuz-chromium...");
    try {
      browser = await chromium.launch({
        args: chromiumServerless.args,
        executablePath: await chromiumServerless.executablePath(),
        headless: true,
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

    // レンダリング用のURL（開発環境または本番環境のベースURLが必要）
    // ここでは、特殊なレンダリング用ページ /kinemoji/render を想定
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const queryParams = new URLSearchParams({
      text,
      type,
      action,
      width: width.toString(),
      height: height.toString(),
      foreColor,
      backColor,
      render: "true",
    });

    const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
    const renderUrl = `${normalizedBaseUrl}/kinemoji/render?${queryParams.toString()}`;

    console.log(`Navigating to: ${renderUrl}`);
    await page.goto(renderUrl, {
      waitUntil: "networkidle", // ネットワークが落ち着くまで待機
      timeout: 10000,
    });

    console.log("Waiting for .kinemoji-container...");
    // コンポーネントの読み込み待ち（タイムアウトを短くして原因を切り分け）
    await page.waitForSelector(".kinemoji-container", { timeout: 5000 });
    console.log(".kinemoji-container found, starting capture...");

    const isLupin = type === "lupin";
    const textLength = text.replace(/\n/g, "").length;

    const frames: { data: Buffer; delay: number }[] = [];
    const fps = 15;
    const interval = 1000 / fps;

    // アニメーションに合わせて時間を計算
    // ルパンの場合: 文字数 * 0.3s + 1s (余裕)
    // 通常の場合: 3s
    let duration = 3;
    if (isLupin) {
      duration = Math.max(3, textLength * 0.3 + 1.5);
    }

    const totalFrames = Math.floor(fps * duration);
    console.log(
      `Starting capture: fps=${fps}, duration=${duration}, totalFrames=${totalFrames}`,
    );

    // キャプチャループ
    for (let i = 0; i < totalFrames; i++) {
      const frameStart = Date.now();
      const screenshot = await page.screenshot({
        type: "jpeg",
        quality: 90,
        clip: { x: 0, y: 0, width, height },
      });

      const elapsed = Date.now() - frameStart;
      const wait = Math.max(0, interval - elapsed);
      if (wait > 0) {
        await new Promise((resolve) => setTimeout(resolve, wait));
      }

      // 次のフレームまでの実際の経過時間を計算
      const actualDelay = Date.now() - frameStart;
      frames.push({ data: screenshot, delay: actualDelay });
    }

    // GIF生成
    const encoder = new GIFEncoder(width, height);
    encoder.start();
    encoder.setRepeat(0);
    encoder.setQuality(10);

    for (const frame of frames) {
      const { data, info } = await sharp(frame.data)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      encoder.setDelay(frame.delay); // 各フレームの実際のキャプチャ間隔をセット
      // @ts-ignore
      encoder.addFrame(data);
    }

    encoder.finish();
    const gifBuffer = encoder.out.getData();

    // デバッグログ
    console.log("GIF Generated, size:", gifBuffer.length);

    // FormDataを作成してアップロードサービスを呼び出す
    const formData = new FormData();
    const base64Gif = `data:image/gif;base64,${gifBuffer.toString("base64")}`;
    formData.append("image", base64Gif);

    const result = await uploadKinemojiImage(formData);
    return result;
  } catch (error) {
    console.error("GIF generation error detail:", error);
    throw error;
  } finally {
    await browser.close();
  }
}
