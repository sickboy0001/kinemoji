import { chromium } from "playwright-core";
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
  // ローカル Windows 環境で誤検知されないよう、OS のチェックも追加
  const isServerless =
    !!(process.env.NETLIFY || process.env.VERCEL) &&
    process.platform !== "win32";

  let browser;
  if (isServerless) {
    console.log("Running in serverless mode, launching playwright chromium...");
    try {
      // Netlify 環境では playwright の chromium を直接使用
      browser = await chromium.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--single-process",
          "--disable-gpu",
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
      timeout: 20000, // 10 秒→20 秒に増加（文字数が多い場合の描画時間確保）
    });

    console.log("Waiting for .kinemoji-container...");
    // コンポーネントの読み込み待ち（タイムアウトを短くして原因を切り分け）
    await page.waitForSelector(".kinemoji-container", { timeout: 5000 });
    console.log(".kinemoji-container found, starting capture...");

    const isLupin = type === "lupin";
    const textLength = text.replace(/\n/g, "").length;

    const frames: { data: Buffer; delay: number }[] = [];
    const fps = 10; // 8 から 10 に引き上げ、滑らかさを向上
    const interval = 1000 / fps;

    // アニメーションに合わせて時間を計算
    // サーバーレスのタイムアウト (30s) を考慮し、最大時間を制限
    let duration = 3;
    if (isLupin) {
      // Lupin: 文字数に応じて 3-10 秒
      duration = Math.min(10, Math.max(3, textLength * 0.5 + 2));
    } else {
      // 他：文字数に応じて 3-6 秒
      duration = Math.min(6, Math.max(3, textLength * 0.3 + 1.5));
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
        quality: 85, // 60 から 85 に引き上げ、画質を向上
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

    // GIF 生成
    const encoder = new GIFEncoder(width, height);
    encoder.start();
    encoder.setRepeat(0);
    encoder.setQuality(5); // 10→5 に減少（色数を増やす、1-10 の範囲で 5 が推奨）

    // 並列で画像をデコード（CPU リソースを活用しつつ、メモリを抑えるため順次ではなく一括処理を試みる）
    console.log(`Processing ${frames.length} frames with sharp...`);
    const processedFrames = await Promise.all(
      frames.map(async (frame) => {
        const { data } = await sharp(frame.data)
          .ensureAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true });
        return { data, delay: frame.delay };
      }),
    );

    for (const frame of processedFrames) {
      encoder.setDelay(frame.delay);
      // @ts-ignore
      encoder.addFrame(frame.data);
    }

    encoder.finish();
    const gifBuffer = encoder.out.getData();

    // デバッグログ
    console.log("GIF Generated, size:", gifBuffer.length);

    // FormData を作成してアップロードサービスを呼び出す
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
