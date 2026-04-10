import puppeteer, { Browser, Page } from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";
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

  const isServerless =
    !!(process.env.NETLIFY || process.env.VERCEL) &&
    process.platform !== "win32";

  let browser: Browser | undefined;
  let page: Page | undefined;

  try {
    if (isServerless) {
      console.log("Running in serverless mode, launching chromium...");
      // Netlify 環境では @sparticuz/chromium-min を使用
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: true as boolean,
      });
    } else {
      console.log("Running in local mode, launching standard chromium...");
      // ローカル環境では標準の Chromium を使用
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }

    page = await browser.newPage();
    await page.setViewport({ width, height });

    // レンダリング用の URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const renderUrl = `${baseUrl}/kinemoji/render?text=${encodeURIComponent(
      text,
    )}&type=${type}&action=${action}&width=${width}&height=${height}&foreColor=${foreColor}&backColor=${backColor}`;

    console.log("Navigating to:", renderUrl);
    await page.goto(renderUrl, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // GIF 生成
    const encoder = new GIFEncoder(width, height);
    encoder.start();
    encoder.setRepeat(0); // 無限ループ
    encoder.setDelay(type === "animation" ? 100 : 0);
    encoder.setQuality(10);

    // フレームをキャプチャ
    const frameCount = type === "animation" ? 30 : 1;
    for (let i = 0; i < frameCount; i++) {
      if (type === "animation") {
        // アニメーションの場合は少し待機
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

    // 画像を圧縮（オプション）
    let finalBuffer = gifBuffer;
    if (gifBuffer.length > 2 * 1024 * 1024) {
      console.log("Compressing GIF...");
      finalBuffer = await sharp(gifBuffer)
        .resize({ width: Math.min(width, 800), fit: "inside" })
        .toFormat("gif")
        .toBuffer();
    }

    // R2 にアップロード
    const formData = new FormData();
    const blob = new Blob([finalBuffer.buffer as ArrayBuffer], {
      type: "image/gif",
    });
    formData.append("file", blob, "output.gif");

    const result = await uploadKinemojiImage(formData);

    if (!result.success || !result.url) {
      throw new Error(result.error || "Failed to upload GIF");
    }

    return {
      success: true,
      url: result.url,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
