<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 🤖 Kinemoji - Agent Guidelines

このドキュメントは、AI エージェント（Roo など）が Kinemoji プロジェクトで作業する際に参照する**実行ルール**と**ガードレール**を定義します。

## 🎯 目的

AI エージェントが正確に作業できるよう、プロジェクト固有のルール、実行コマンド、検証手順、よくあるエラーを記載します。

## 📋 プロジェクト概要

- **フレームワーク**: Next.js 15 (App Router)
- **UI**: React 19, Framer Motion, shadcn/ui
- **データベース**: Turso (libSQL) + Drizzle ORM
- **GIF 生成**: Playwright + chromium (サーバーサイド)
- **認証**: Auth.js (NextAuth) - **現在は無効化**
- **分析**: GA4

## ⚠️ 最重要ルール：Server Component vs Client Component

### 判断基準

| コンポーネント種類 | 使用条件 | 例 |
|-------------------|----------|-----|
| **Server Component** | データ取得、SEO メタデータ、静的レンダリング | `page.tsx`, `layout.tsx` (基本) |
| **Client Component** | `onClick` イベント、ステート管理、ブラウザ API | `Navigations.tsx`, `kinemoji-copy-buttons.tsx` |

### Client Component が必要な場合

- `onClick`, `onChange`, `onSubmit` などのイベントハンドラを使用する場合
- `useState`, `useEffect`, `useContext` などのフックを使用する場合
- ブラウザ API (`window`, `localStorage` など) にアクセスする場合

### 実装パターン

```typescript
// Client Component の場合
"use client"; // ファイルの先頭に必ず記述

import React, { useState } from "react";

export default function MyComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### よくあるエラーと解決策

| エラー | 原因 | 解決策 |
|--------|------|--------|
| `Event handlers cannot be passed to Client Component props` | Server Component から Client Component にイベントハンドラを渡している | Client Component に `"use client"` を追加 |
| `auth is not a function` | `auth()` を不適切に呼び出している | サーバーコンポーネントでのみ呼び出す、またはダミー値を使用 |
| `no such column: xxx` | スキーマが同期されていない | `npx drizzle-kit push` を実行 |
| `Module not found: xxx` | インストールされていない | `npm install xxx` を実行 |

## 🗄️ データベース操作ルール

### Drizzle ORM の使用パターン

```typescript
import { db } from "@/lib/turso/db";
import { kinemojis } from "@/db/schema";
import { eq } from "drizzle-orm";

// 全件取得
const all = await db.query.kinemojis.findMany();

// 単一取得
const item = await db.query.kinemojis.findFirst({
  where: eq(kinemojis.shortId, shortId),
});

// 作成
await db.insert(kinemojis).values({
  id: crypto.randomUUID(),
  shortId: generateShortId(),
  text: "Hello",
  createdAt: Date.now(),
  status: "pending",
});

// 更新
await db.update(kinemojis)
  .set({ status: "completed", imageUrl: url })
  .where(eq(kinemojis.id, id));
```

### スキーマ変更時の手順

1. `src/db/schema/index.ts` を編集
2. **必須**: `npx drizzle-kit push` を実行してデータベースを同期
3. エラーが出た場合は、データベースに列が存在しないことを確認

## 🔐 認証状態の扱い

### 現状

認証機能は実装済みだが**無効化**されている。

```typescript
// src/app/layout.tsx (現在の状態)
const session = null; // ダミー値

// 将来的に有効化する際:
import { auth } from "@/auth";
const session = await auth();
```

### 注意点

- `auth()` はサーバーコンポーネントでのみ呼び出し可能
- Client Component には `session` を props として渡す
- 現在 `signInAction`/`signOutAction` はオプションとして扱われている

## 🎬 GIF 生成フロー

### 非同期処理のモデル

```typescript
// 1. リクエスト受信
const record = await db.insert(kinemojis).values({
  status: "pending",
  progress: 0,
});

// 2. 非同期処理開始（fire-and-forget）
setImmediate(async () => {
  await db.update(kinemojis)
    .set({ status: "processing", progress: 10 })
    .where(eq(kinemojis.id, id));

  // GIF 生成処理...
  await db.update(kinemojis)
    .set({ status: "completed", imageUrl: url, progress: 100 })
    .where(eq(kinemojis.id, id));
});

// 3. クライアントはポーリングで進捗確認
```

### ステータス値

| 値 | 意味 |
|----|------|
| `pending` | 処理待ち |
| `processing` | 処理中 (progress: 0-99) |
| `completed` | 完了 (imageUrl が設定) |
| `failed` | エラー (error にメッセージ) |

## 🐦 X (Twitter) 投稿ルール

### OGP 対応の設計

```typescript
// 画像 URL ではなくページ URL を使用
const xUrl = encodeURIComponent(shareUrl); // e.g., https://kinemoji.netlify.app/kinemoji/[id]
const xText = encodeURIComponent(`${text} #キネ文字 #kinemoji`);

window.open(`https://x.com/intent/post?text=${xText}&url=${xUrl}`, "_blank");
```

**理由**: X は OGP メタデータから画像を抽出し、リッチなプレビューカードを表示します。直接画像 URL を渡すよりも、ページ URL を使用した方が優れた体験を提供できます。

## 🛠️ 作業チェックリスト

### 新規コンポーネント作成時

- [ ] Server Component か Client Component かを明確にする
- [ ] Client Component の場合は `"use client"` を先頭に追加
- [ ] Props の型定義を明示的に記述
- [ ] shadcn/ui のコンポーネントを優先的に使用
- [ ] 日本語コメントで意図を説明

### データベース変更時

- [ ] スキーマを `src/db/schema/index.ts` に追加
- [ ] `npx drizzle-kit push` を実行
- [ ] エラーが出た場合は列名・型を確認

### API エンドポイント作成時

- [ ] `src/app/api/.../route.ts` に作成
- [ ] `POST`, `GET` などのメソッドを適切に実装
- [ ] エラーハンドリングを適切に行う
- [ ] 型安全なレスポンスを返す

### 認証関連の変更時

- [ ] 現在はダミー値 (`session = null`) が使用されていることを認識
- [ ] 本番環境では `auth()` を適切に呼び出す
- [ ] Client Component には props として渡す

## 🚀 実行コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# スキーマ同期
npx drizzle-kit push

# リント
npm run lint
```

## 📁 主要ファイル参照

| ファイル | 役割 |
|----------|------|
| [`src/app/layout.tsx`](src/app/layout.tsx) | ルートレイアウト (Navigation, Footer, GA4) |
| [`src/db/schema/index.ts`](src/db/schema/index.ts) | Drizzle スキーマ定義 |
| [`src/components/layout/Navigations.tsx`](src/components/layout/Navigations.tsx) | ナビゲーション (Client Component) |
| [`src/components/organisms/kinemoji-copy-buttons.tsx`](src/components/organisms/kinemoji-copy-buttons.tsx) | 共有・投稿ボタン (Client Component) |
| [`src/service/kinemoji-service.ts`](src/service/kinemoji-service.ts) | CRUD 操作 |
| [`src/service/kinemoji-gif-service.ts`](src/service/kinemoji-gif-service.ts) | GIF 生成エンジン |

## 📚 参考ドキュメント

- [`README.md`](README.md) - プロジェクト概要（人間向け）
- [`DESIGN.md`](DESIGN.md) - システム設計の詳細
- [Next.js Documentation](https://nextjs.org/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Drizzle ORM](https://orm.drizzle.team/)

## 🔄 現在の開発ステータス

- **認証**: 実装済みだが無効化 (`session = null`)
- **GIF 生成**: 非同期処理の基盤整備完了
- **X 投稿**: OGP 対応済み
- **GA4**: 統合済み (`G-J2G39C7PZZ`)
- **レイアウト**: Navigation, Footer, Toast 実装済み

