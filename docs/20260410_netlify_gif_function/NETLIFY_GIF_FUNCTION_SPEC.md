# Netlify Background Function - GIF 生成機能仕様書

## 1. 概要

Netlify Functions を使用して、非同期で GIF アニメーションを生成するバックグラウンド処理の実装仕様を定義します。

## 2. 目的

- ユーザーが GIF 生成リクエストを送信後、バックグラウンドで非同期処理を実行
- 処理中は「処理中」ステータスを表示し、完了後に結果を返す
- サーバーのタイムアウト問題を回避するため、Netlify Background Functions を使用

## 3. システム構成

### 3.1 主要コンポーネント

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│   Client App    │────▶│  API Route       │────▶│  Database (Turso)   │
│  (Next.js)      │     │  /api/kinemoji   │     │  - Status: pending  │
└─────────────────┘     │  /gif            │     │  - Progress: 0      │
                        └──────────────────┘     └─────────────────────┘
                                │
                                │ (トリガー)
                                ▼
                        ┌──────────────────┐
                        │ Background Func  │
                        │ kinemoji-gif-    │
                        │ background.ts    │
                        └──────────────────┘
                                │
                                │ (Puppeteer + Chromium)
                                ▼
                        ┌──────────────────┐
                        │  GIF Generation  │
                        │  - gif-encoder-2 │
                        │  - 30 frames     │
                        └──────────────────┘
                                │
                                │ (アップロード)
                                ▼
                        ┌──────────────────┐
                        │  R2 Storage      │
                        │  (Cloudflare)    │
                        └──────────────────┘
                                │
                                │ (更新)
                                ▼
                        ┌──────────────────┐
                        │  Database (Turso)│
                        │  - Status:       │
                        │    completed     │
                        │  - imageUrl:     │
                        │    [R2 URL]      │
                        └──────────────────┘
```

## 4. 機能要件

### 4.1 入力パラメータ

Background Function へ渡すパラメータ：

| パラメータ名 | 型 | 必須 | 説明 |
|-------------|-----|------|------|
| `id` | string | 必須 | kinemoji レコードの UUID |
| `text` | string | 必須 | 表示するテキスト |
| `type` | string | 必須 | アニメーションタイプ（`lupin` / `standard`） |
| `action` | string | 必須 | アニメーション動作（`typewriter` / `animation` / `static`） |
| `width` | number | 必須 | 画像幅（px） |
| `height` | number | 必須 | 画像高さ（px） |
| `foreColor` | string | 必須 | 文字色（HEX 形式：`#ffffff`） |
| `backColor` | string | 必須 | 背景色（HEX 形式：`#000000`） |

### 4.2 処理フロー

```
1. リクエスト受信
   ├─ パラメータ検証
   └─ DB ステータスを "processing" に更新（progress: 10）

2. Chromium 起動
   ├─ @sparticuz/chromium を使用（serverless 環境対応）
   └─ Headless モードで起動

3. レンダリングページへ移動
   ├─ URL: ${NEXT_PUBLIC_APP_URL}/kinemoji/render?params...
   ├─ waitUntil: networkidle0
   └─ タイムアウト：30 秒

4. フレームキャプチャ
   ├─ アニメーションの場合：30 フレーム
   ├─ 静止画の場合：1 フレーム
   ├─ 各フレーム間隔：100ms
   └─ フォーマット：PNG

5. GIF 生成
   ├─ gif-encoder-2 ライブラリ使用
   ├─ 設定：
   │   ├─ 幅/高さ：パラメータ通り
   │   ├─ リピート：0（無限ループ）
   │   ├─ 遅延：100ms（10fps）
   │   └─ アルゴリズム：neuquant
   └─ 各フレームを RGB 変換（背景色適用）

6. R2 アップロード
   ├─ FormData 形式でアップロード
   ├─ ファイル名：{shortId}.gif
   └─ コンテンツタイプ：image/gif

7. DB 更新
   ├─ ステータス： "completed"
   ├─ imageUrl: [R2 URL]
   ├─ progress: 100
   └─ updatedAt: 現在時刻

8. レスポンス返却
   └─ { success: true, url: "[R2 URL]" }
```

### 4.3 エラーハンドリング

| エラータイプ | 対応処理 |
|-------------|----------|
| パラメータ不足 | 400 Bad Request + エラーメッセージ |
| Chromium 起動失敗 | 500 Internal Server Error + DB ステータス "failed" |
| レンダリングタイムアウト | 500 Internal Server Error + DB ステータス "failed" |
| GIF 生成失敗 | 500 Internal Server Error + DB ステータス "failed" |
| アップロード失敗 | 500 Internal Server Error + DB ステータス "failed" |

## 5. 技術仕様

### 5.1 使用ライブラリ

```json
{
  "dependencies": {
    "@sparticuz/chromium": "^122.0.0",
    "gif-encoder-2": "^1.0.5",
    "puppeteer-core": "^22.0.0",
    "drizzle-orm": "^0.45.2",
    "@libsql/client": "^0.17.2"
  },
  "devDependencies": {
    "@netlify/functions": "^5.2.0"
  }
}
```

### 5.2 環境変数

```env
# 必須
NEXT_PUBLIC_APP_URL=https://kinemoji.netlify.app
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...

# R2 アップロード用
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_ENDPOINT=https://...
R2_BUCKET_NAME=gif-lupin
R2_PUBLIC_URL=https://pub-...

# Netlify 設定
NETLIFY=true
```

### 5.3 ファイル構造

```
netlify/
└── functions/
    └── kinemoji-gif-background.ts  # Background Function
src/
├── lib/
│   └── turso/
│       └── db.ts                   # DB 接続設定
├── db/
│   └── schema/
│       └── index.ts                # データベーススキーマ
└── service/
    └── kinemoji-upload-service.ts  # R2 アップロード処理
```

### 5.4 データベーススキーマ

```typescript
// src/db/schema/index.ts
const kinemojis = sqliteTable("kinemojis", {
  id: text("id").primaryKey(),
  shortId: text("short_id").notNull().unique(),
  text: text("text").notNull(),
  parameters: text("parameters").notNull(), // JSON 形式
  imageUrl: text("image_url"),
  status: text("status", { enum: ["pending", "processing", "completed", "failed"] })
    .notNull()
    .default("pending"),
  progress: integer("progress").notNull().default(0), // 0-100
  error: text("error"),
  creatorId: text("creator_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
```

## 6. 実装詳細

### 6.1 Background Function 実装パターン

```typescript
import { Handler } from "@netlify/functions";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import GIFEncoder from "gif-encoder-2";
import { db } from "../../src/lib/turso/db";
import { kinemojis } from "../../src/db/schema";
import { eq } from "drizzle-orm";
import { uploadKinemojiImage } from "../../src/service/kinemoji-upload-service";

export const handler: Handler = async (event) => {
  const headers = { "Access-Control-Allow-Origin": "*" };

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: "Method Not Allowed" };
  }

  const { id, text, type, action, width, height, foreColor, backColor } = 
    JSON.parse(event.body || "{}");

  if (!id || !text) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing parameters" }) };
  }

  try {
    // ステータス更新
    await db.update(kinemojis)
      .set({ status: "processing", progress: 10, updatedAt: new Date() })
      .where(eq(kinemojis.id, id));

    // Chromium 起動
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    await page.setViewport({ width, height });

    // レンダリング
    const renderUrl = `${process.env.NEXT_PUBLIC_APP_URL}/kinemoji/render?text=${encodeURIComponent(text)}&type=${type}&action=${action}&width=${width}&height=${height}&foreColor=${foreColor}&backColor=${backColor}`;
    await page.goto(renderUrl, { waitUntil: "networkidle0", timeout: 30000 });

    // GIF 生成
    const isAnimation = action === "typewriter" || action === "animation";
    const frameCount = isAnimation ? 30 : 1;
    
    const encoder = new GIFEncoder(width, height);
    encoder.setRepeat(0);
    encoder.setDelay(100);
    encoder.start();

    for (let i = 0; i < frameCount; i++) {
      if (isAnimation) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const screenshot = await page.screenshot({ type: "png", fullPage: false });
      const pngData = Buffer.from(screenshot);
      const rgbaData = new Uint8ClampedArray(pngData);

      // RGB 変換（背景色適用）
      const rgbData = Buffer.alloc(width * height * 3);
      for (let j = 0; j < width * height; j++) {
        const alpha = rgbaData[j * 4 + 3];
        if (alpha === 0) {
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

      // 進捗更新
      const progress = 10 + Math.floor((i + 1) / frameCount * 80);
      await db.update(kinemojis)
        .set({ progress, updatedAt: new Date() })
        .where(eq(kinemojis.id, id));
    }

    encoder.finish();
    const gifBuffer = encoder.out.getData();

    // アップロード
    const formData = new FormData();
    const gifBlob = new Blob([gifBuffer.buffer as ArrayBuffer], { type: "image/gif" });
    formData.append("file", gifBlob, `${shortId}.gif`);
    formData.append("text", text);
    // ... 他のパラメータ

    const imageUrl = await uploadKinemojiImage(formData);

    // 完了更新
    await db.update(kinemojis)
      .set({ status: "completed", imageUrl, progress: 100, updatedAt: new Date() })
      .where(eq(kinemojis.id, id));

    await browser.close();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, url: imageUrl }),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    await db.update(kinemojis)
      .set({ status: "failed", error: errorMessage, progress: 0, updatedAt: new Date() })
      .where(eq(kinemojis.id, id));

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: errorMessage }),
    };
  }
};
```

## 7. 制約事項

### 7.1 Netlify 制限

- **実行時間制限**: Background Functions は最大 15 分まで実行可能
- **メモリ制限**: 最大 3008MB
- **同時実行**: プランにより制限あり（無料プラン：1 同時実行）

### 7.2 パフォーマンス目標

- **GIF 生成時間**: 30 フレームで 30 秒以内
- **メモリ使用量**: 2GB 以下
- **成功率**: 95% 以上

## 8. テスト手順

### 8.1 ローカルテスト

```bash
# 1. Netlify Dev サーバー起動
npx netlify dev

# 2. Background Function をトリガー
# ブラウザから GIF 生成リクエストを送信

# 3. ログ確認
# Netlify Dev コンソールで関数のログを確認
```

### 8.2 本番環境テスト

```bash
# 1. デプロイ
netlify deploy --prod

# 2. 本番環境で GIF 生成リクエストを送信

# 3. Netlify Functions ログ確認
# Netlify Dashboard > Functions > kinemoji-gif-background
```

## 9. トラブルシューティング

| 問題 | 原因 | 解決策 |
|------|------|--------|
| Chromium 起動失敗 | @sparticuz/chromium のバージョン不一致 | バージョンを `^122.0.0` に固定 |
| メモリ不足 | フレーム数が多すぎる | フレーム数を 30 に制限 |
| タイムアウト | レンダリングに時間がかかる | `waitUntil: networkidle0` を使用 |
| アップロード失敗 | R2 設定ミス | 環境変数を再確認 |

## 10. 参考リソース

- [Netlify Background Functions](https://docs.netlify.com/functions/background-functions/)
- [@sparticuz/chromium](https://github.com/Sparticuz/chromium)
- [gif-encoder-2](https://www.npmjs.com/package/gif-encoder-2)
- [Puppeteer](https://pptr.dev/)
