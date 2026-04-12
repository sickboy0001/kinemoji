import puppeteer, { Browser, Page } from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import GIFEncoder from "gif-encoder-2";
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

export async function generateAndUploadGif(
  params: GifParameters,
  shortId: string,
) {
  const { text, type, action, width, height, foreColor, backColor } = params;

  const isServerless =
    !!(process.env.NETLIFY || process.env.VERCEL) &&
    process.platform !== "win32";

  let browser: Browser | undefined;
  let page: Page | undefined;

  try {
    if (isServerless) {
      console.log("Running in serverless mode, launching chromium...");
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: true as boolean,
      });
    } else {
      console.log("Running in local mode, launching standard chromium...");
      const executablePath =
        process.env.CHROME_PATH ||
        (process.platform === "win32"
          ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
          : undefined);

      browser = await puppeteer.launch({
        executablePath,
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

    // アニメーションかどうかを action で判定
    const isAnimation = action === "typewriter" || action === "animation";

    console.log(`GIF dimensions: width=${width}, height=${height}`);

    // アニメーションの場合は、開始前に少し待機
    if (isAnimation) {
      console.log("Waiting for animation to start...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // GIF エンジン初期化
    const frameCount = isAnimation ? 30 : 1;
    const encoder = new GIFEncoder(width, height);
    encoder.setRepeat(0); // 0 for infinite loop
    encoder.setDelay(100); // 100ms per frame (10fps)
    encoder.start();

    for (let i = 0; i < frameCount; i++) {
      if (isAnimation) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const screenshot = await page.screenshot({
        type: "png",
        fullPage: false,
      });

      // GIF エンジンにフレームを追加
      const pngData = Buffer.from(screenshot);
      const rgbaData = new Uint8ClampedArray(pngData);

      // RGBA から RGB に変換（アルファチャンネルを無視、背景色を適用）
      const rgbData = new Buffer(width * height * 3);
      for (let j = 0; j < width * height; j++) {
        const alpha = rgbaData[j * 4 + 3];
        if (alpha === 0) {
          // 透明なピクセルは背景色で埋める
          const backR = parseInt(backColor.slice(1, 3), 16);
          const backG = parseInt(backColor.slice(3, 5), 16);
          const backB = parseInt(backColor.slice(5, 7), 16);
          rgbData[j * 3] = backR;
          rgbData[j * 3 + 1] = backG;
          rgbData[j * 3 + 2] = backB;
        } else {
          rgbData[j * 3] = rgbaData[j * 4];
          rgbData[j * 3 + 1] = rgbaData[j * 4 + 1];
          rgbData[j * 3 + 2] = rgbaData[j * 4 + 2];
        }
      }

      encoder.addFrame(rgbData);
      console.log(`Frame ${i} added to GIF encoder`);
    }

    encoder.finish();
    const gifBuffer = encoder.out.getData();

    console.log(`GIF generated: ${gifBuffer.length} bytes`);

    // GIF をアップロード
    console.log("Uploading GIF to Netlify storage...");
    const formData = new FormData();
    const gifBlob = new Blob([gifBuffer.buffer as ArrayBuffer], {
      type: "image/gif",
    });
    formData.append("file", gifBlob, `${shortId}.gif`);
    formData.append("text", text);
    formData.append("type", type);
    formData.append("action", action);
    formData.append("width", width.toString());
    formData.append("height", height.toString());
    formData.append("foreColor", foreColor);
    formData.append("backColor", backColor);

    const imageUrl = await uploadKinemojiImage(formData);

    console.log(`GIF uploaded: ${imageUrl}`);

    return {
      success: true,
      url: imageUrl,
    };
  } catch (error) {
    console.error("GIF generation error:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
