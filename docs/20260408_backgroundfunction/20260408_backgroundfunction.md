# 20260408 - Background Functions 実装ガイド

## 概要

Netlify Background Functions を利用した非同期 GIF 生成フローの実装ガイド。現在のプロジェクト状態に基づき、実装済みの機能と今後の移行方針を記載する。

## 現状の実装状況 (2026-04-10 時点)

### ✅ 実装済み機能

1. **データベーススキーマ**
   - `kinemojis` テーブルに以下の列を追加済み：
     - `gif_status`: `text` ("pending" | "processing" | "completed" | "failed")
     - `gif_progress`: `integer` (0-100)
     - `gif_error`: `text`

2. **サービス層**
   - [`kinemojiService.create()`](../../src/service/kinemoji-service.ts:32): `imageUrl` に応じて自動で `status` を設定
   - [`kinemojiService.updateStatus()`](../../src/service/kinemoji-service.ts:59): ステータス更新用メソッド

3. **API エンドポイント**
   - `POST /api/kinemoji/create`: レコード作成（`status: "processing"`）
   - `POST /api/kinemoji/update-status`: ステータス更新（`completed`/`failed`）
   - `POST /api/kinemoji/gif`: GIF 生成（同期処理）

4. **フロントエンド**
   - [`kinemoji-new-page.tsx`](../../src/components/pages/kinemoji-new-page.tsx:120): 2 段階フロー（作成 → GIF 生成 → 更新）
   - [`kinemoji-list-page.tsx`](../../src/components/pages/kinemoji-list-page.tsx:1): ポーリング機能実装
   - [`kinemoji-detail-content.tsx`](../../src/app/kinemoji/[id]/kinemoji-detail-content.tsx:1): 詳細ページのポーリング

5. **UI 表示**
   - `status === "processing"`: 進捗バー表示
   - `status === "pending"`: "GIF 生成待ち..."表示
   - `status === "completed"`: GIF 画像表示
   - `status === "failed"`: エラーメッセージと再試行ボタン

### ⚠️ 現在の制限事項

- **同期処理**: GIF 生成は現在、同期処理で実行されている（最大 30 秒の制限あり）
- **タイムアウト**: 重い GIF 生成（高 FPS、長時間）はタイムアウトする可能性
- **Netlify 制限**: 通常の Functions は 30 秒のタイムアウト制限あり

## Netlify Background Functions への移行

### 移行の必要性

以下のケースで Background Functions への移行が推奨される：

- **高品質 GIF**: FPS を 20~30 に上げたい場合
- **長時間 GIF**: 録画時間を 6 秒以上に延長したい場合
- **複雑なアニメーション**: 処理時間が 30 秒を超える可能性のある機能

### 移行後のアーキテクチャ

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────────────┐
│   Client    │─────▶│ /api/kinemoji    │─────▶│ Background Function │
│             │      │ /create          │      │ (netlify/functions) │
└─────────────┘      └──────────────────┘      └─────────────────────┘
       │                       │                        │
       │                       ▼                        ▼
       │              ┌──────────────────┐      ┌─────────────────────┐
       │◀─────────────│ DB: status=      │      │ GIF 生成処理         │
       │   202 Accepted│  "processing"    │      │ (最大 15 分)          │
       │               └──────────────────┘      └─────────────────────┘
       │                                                   │
       ▼                                                   ▼
┌─────────────┐                                  ┌─────────────────────┐
│ ポーリング   │◀─────────────────────────────────│ DB: status=         │
│ (2 秒ごと)   │                                  │  "completed"        │
└─────────────┘                                  └─────────────────────┘
```

### 実装手順

#### 1. Background Function の作成

`netlify/functions/kinemoji-gif-background.ts` を作成：

```typescript
import { Handler } from "@netlify/functions";
import { generateAndUploadGif } from "../src/service/kinemoji-gif-service";
import { db } from "../src/lib/turso/db";
import { kinemojis } from "../src/db/schema";
import { eq } from "drizzle-orm";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { id, text, type, action, width, height, foreColor, backColor } = JSON.parse(event.body || "{}");

  if (!id) {
    return { statusCode: 400, body: "id is required" };
  }

  try {
    // GIF 生成処理（最大 15 分まで実行可能）
    const result = await generateAndUploadGif({
      text,
      type,
      action,
      width,
      height,
      foreColor,
      backColor,
    });

    if (result.success) {
      // DB を更新
      await db
        .update(kinemojis)
        .set({
          status: "completed",
          progress: 100,
          imageUrl: result.url,
          updatedAt: new Date(),
        })
        .where(eq(kinemojis.id, id));
    } else {
      // エラー処理
      await db
        .update(kinemojis)
        .set({
          status: "failed",
          progress: 0,
          error: result.error,
          updatedAt: new Date(),
        })
        .where(eq(kinemojis.id, id));
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error("Background function error:", error);
    
    await db
      .update(kinemojis)
      .set({
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
        updatedAt: new Date(),
      })
      .where(eq(kinemojis.id, id));

    return { statusCode: 500, body: JSON.stringify({ error: "Internal error" }) };
  }
};
```

#### 2. 主要 API の変更

`POST /api/kinemoji/create` を変更し、Background Function をトリガー：

```typescript
// 既存の処理に追加：
// Background Function を非同期で起動
fetch(`${process.env.NETLIFY_FUNCTION_URL}/kinemoji-gif-background`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    id,
    text,
    type,
    action,
    width,
    height,
    foreColor,
    backColor,
  }),
}).catch((err) => console.error("Background function trigger failed:", err));

// すぐに 202 を返す
return NextResponse.json({ id, shortId, status: "processing" }, { status: 202 });
```

#### 3. Netlify 設定

`netlify.toml` に Background Functions の設定を追加：

```toml
[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

[[functions]]
  name = "kinemoji-gif-background"
  background = true
  timeout = 900 # 15 分（900 秒）
```

### UX 設計の変更点

1. **即時レスポンス**: ユーザーは「作成リクエストを受け付けました」のメッセージを即座に受け取る
2. **待機画面**: リスト画面または詳細画面で「生成中...」を表示
3. **ポーリング**: 2 秒ごとに DB をチェックし、完了時に自動的に GIF を表示
4. **エラー処理**: 失敗時は再試行ボタンを表示

## 実装チェックリスト

- [x] データベーススキーマに `status`, `progress`, `error` を追加
- [x] `kinemojiService.updateStatus()` メソッドを実装
- [x] `POST /api/kinemoji/create` エンドポイントを作成
- [x] `POST /api/kinemoji/update-status` エンドポイントを作成
- [x] フロントエンドでポーリングロジックを実装
- [x] UI に進捗表示を実装
- [ ] Background Function (`netlify/functions/kinemoji-gif-background.ts`) を作成
- [ ] `POST /api/kinemoji/create` を Background Function 起動用に修正
- [ ] `netlify.toml` に Background Functions 設定を追加
- [ ] 負荷テストで 15 分処理を確認
- [ ] エラーハンドリングとリトライロジックを検証

## 参考資料

- [Netlify Background Functions ドキュメント](https://docs.netlify.com/functions/background-functions/)
- [プロジェクト AGENTS.md](../../AGENTS.md)
- [GIF 生成サービス](../../src/service/kinemoji-gif-service.ts)

---

**最終更新**: 2026-04-10  
**ステータス**: 基本フロー実装完了、Background Functions 移行準備中
