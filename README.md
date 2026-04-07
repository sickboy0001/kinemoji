# **📘 Kinemoji (キネ文字)**

ブラウザ上でリアルタイムに動かす「インタラクティブな文字演出」を生成・共有するプラットフォームです。

## **🚀 特徴**
- **多彩なアニメーション**: ルパン三世風、フェード、ズームなど、Framer Motion を活用した高品質な演出。
- **GIF保存機能**: ブラウザ上のアニメーションをサーバーサイド（Playwright）でレンダリングし、GIFとして保存・共有可能。
- **マルチデバイス対応**: レスポンシブデザインにより、PC・スマホどちらからでも作成・閲覧が可能。
- **認証システム**: Google 認証およびメール・パスワード認証に対応。

---

## **🛠️ 実装済み・再利用可能な機能リスト**

### **1. アニメーションエンジン**
- **LupinDisplay**: ルパン三世のタイトルのように、一文字ずつ表示した後に全文が表示される演出。
- **StandardDisplay**: 方向（上下左右）、ズーム、フェードなどの標準的なテキストアニメーション。
- **レンダリング最適化**: GIF生成時にはアニメーションのタイミングや透明度を自動調整し、静止画キャプチャ漏れを防止。

### **2. GIF生成・画像処理**
- **Serverless Chromium**: `playwright-core` と `@sparticuz/chromium` を使用し、Netlify などのサーバーレス環境でブラウザを起動。
- **GIF Encoding**: `gif-encoder-2` による高速なGIF生成。
- **Sharp 連携**: 画像のリサイズ、透過処理、バッファ操作。
- **Dynamic Duration**: テキストの長さに応じて録画時間を自動調整。

### **3. データ・バックエンド**
- **Turso (SQLite)**: エッジ環境に最適化されたデータベース。
- **Drizzle ORM**: 型安全なデータベース操作。
- **認証 (Auth.js)**: Google OAuth および Credentials プロバイダー。
- **ストレージ連携**: 生成されたGIFを外部ストレージにアップロードするサービス層。

### **4. UI/UX (shadcn/ui ベース)**
- **共通コンポーネント**: Button, Card, Dialog, Drawer, Input, Label, Sheet, Sonner (Toast) 等。
- **デザイン**: 濃色を基調としたモダンなUI。

---

## **📂 ディレクトリ構造**
```
src/
├── app/                       # Next.js App Router (各ページの定義)
│   ├── (auth)/               # 認証グループ（ログイン、サインアップ、パスワードリセット）
│   ├── (user)/               # ユーザー固有機能（プロフィール等）
│   ├── admini/               # 管理者用ダッシュボード、統計表示
│   ├── api/                  # APIルート
│   │   ├── auth/             # 認証API（検証、パスワードリセット）
│   │   ├── kinemoji/gif/      # 【重要】サーバーサイドGIF生成エンドポイント
│   │   └── posts/            # 投稿データ操作
│   ├── kinemoji/             # Kinemoji メイン機能
│   │   ├── [id]/             # 個別表示ページ
│   │   ├── list/             # 投稿一覧ページ
│   │   ├── new/              # 新規作成フォーム
│   │   └── render/           # 【重要】GIF生成用のクリーンな描画ページ
│   └── layout.tsx            # 全体レイアウト、フォント・メタデータ設定
├── components/
│   ├── atomic/               # 原子レベルのUIコンポーネント
│   ├── organisms/            # 複合コンポーネント（表示ロジック含む）
│   │   └── kinemoji/         # アニメーション実装（LupinDisplay, StandardDisplay）
│   ├── pages/                # 各 page.tsx から呼び出される画面全体の実装
│   └── ui/                   # shadcn/ui (汎用コンポーネント群)
├── service/                   # 【心臓部】ビジネスロジック層
│   ├── kinemoji-service.ts        # DB操作（CRUD）
│   ├── kinemoji-gif-service.ts    # PlaywrightによるGIF生成エンジンの核心
│   └── kinemoji-upload-service.ts # 画像アップロード・ファイル管理
├── db/                        # データベース関連
│   └── schema/               # Drizzle ORM スキーマ定義
├── lib/                       # 共通ライブラリ・ユーティリティ
│   ├── turso/                # Turso (libSQL) クライアント初期化
│   └── utils/                # 共通ユーティリティ関数
├── types/                     # TypeScript 型定義ファイル群
├── auth.ts                    # NextAuth (Auth.js) 設定・プロバイダー定義
└── middleware.ts              # ルーティング保護、認証ミドルウェア
```

---

## **🏁 クイックスタート**

### 開発サーバーの起動:
```bash
npm install
npm run dev
```
[http://localhost:3000](http://localhost:3000) で確認できます。

### データベースセットアップ:
`.env` ファイルに `TURSO_DATABASE_URL` と `TURSO_AUTH_TOKEN` を設定し、
```bash
npx drizzle-kit push
```

---

## **📜 History**
- **2026-04-08**
  - [deploy](https://kinemoji.netlify.app/)
  - Lupin アニメーションの GIF 生成時における表示タイミングと速度の精度向上。
  - 動的な GIF 録画時間の導入。

---

## **Learn More**

- [Next.js Documentation](https://nextjs.org/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Turso DB](https://turso.tech/)
