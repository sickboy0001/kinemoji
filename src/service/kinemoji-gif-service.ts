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

  // サーバーレス環境とローカル環境で起動設定を切り替える
  const isServerless = !!(process.env.NETLIFY || process.env.VERCEL);

  let browser;
  if (isServerless) {
    browser = await chromium.launch({
      args: chromiumServerless.args,
      executablePath: await (chromiumServerless as any).executablePath(),
      headless: true,
    });
  } else {
    // ローカル環境（playwrightが必要な場合があるが、playwright-coreでもパスが通れば動く）
    // もしローカルで動かない場合は、環境に合わせて調整が必要
    try {
      browser = await chromium.launch({ headless: true });
    } catch (e) {
      console.warn("Standard launch failed, trying with sparticuz path");
      browser = await chromium.launch({
        args: chromiumServerless.args,
        executablePath: await (chromiumServerless as any).executablePath(),
        headless: true,
      });
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

    await page.goto(`${baseUrl}/kinemoji/render?${queryParams.toString()}`);

    // コンポーネントの読み込み待ち
    await page.waitForSelector(".kinemoji-container");

    const frames: Buffer[] = [];
    const fps = 20;
    const duration = 3; // 3秒間キャプチャ
    const totalFrames = fps * duration;
    const interval = 1000 / fps;

    // キャプチャループ
    for (let i = 0; i < totalFrames; i++) {
      const screenshot = await page.screenshot({
        type: "png",
        clip: { x: 0, y: 0, width, height },
      });
      frames.push(screenshot);
      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    // GIF生成
    const encoder = new GIFEncoder(width, height);
    encoder.start();
    encoder.setRepeat(0); // 0 = ループ
    encoder.setDelay(interval);
    encoder.setQuality(10);

    for (const frame of frames) {
      // sharpを使ってピクセルデータを取得
      const { data, info } = await sharp(frame)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      // GIFEncoderにピクセルデータを追加（Uint8ClampedArrayが必要な場合があるが、Bufferでも動作することが多い）
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
