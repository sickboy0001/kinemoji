# 📘 Kinemoji (キネ文字)

ブラウザ上でリアルタイムに動かす「インタラクティブな文字演出」を生成・共有するプラットフォームです。

## 🚀 特徴

- **多彩なアニメーション**: ルパン三世風、フェード、ズームなど、Framer Motion を活用した高品質な演出。
- **GIF 保存機能**: ブラウザ上のアニメーションをサーバーサイド（Playwright）でレンダリングし、GIF として保存・共有可能。
- **マルチデバイス対応**: レスポンシブデザインにより、PC・スマホどちらからでも作成・閲覧が可能。
- **X (Twitter) 投稿**: 生成したキネ文字を X に直接投稿可能。OGP 対応でリッチなプレビューカードを表示。
- **GA4 統合**: ユーザー行動分析に対応。

## 🛠️ 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | Next.js 15 (App Router) |
| UI ライブラリ | React 19, Framer Motion, shadcn/ui |
| データベース | Turso (libSQL) + Drizzle ORM |
| GIF 生成 | Playwright + chromium (サーバーサイド) |
| 画像処理 | Sharp |
| 認証 | Auth.js (NextAuth) - 現在は無効化 |
| 分析 | GA4 (Google Analytics 4) |
| デプロイ | Netlify |

## 🏁 クイックスタート

### 前提条件

- Node.js 18 以上
- npm または pnpm

### インストール

```bash
# クローン
git clone <repository-url>
cd kinemoji

# 依存関係のインストール
npm install
```

### 環境変数の設定

`.env` ファイルを作成し、以下の環境変数を設定してください。

```env
TURSO_DATABASE_URL=<turso-database-url>
TURSO_AUTH_TOKEN=<turso-auth-token>
```

### データベースセットアップ

```bash
# スキーマをデータベースに適用
npx drizzle-kit push
```

### 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアクセスできます。

## 📖 使用方法

### 1. キネ文字の作成

1. トップページから「新規作成」を選択
2. 表示したいテキストを入力
3. アニメーション設定を調整
4. 「プレビュー」で確認

### 2. GIF の生成

1. 作成画面で「GIF 生成」ボタンをクリック
2. 処理が完了するまで待機（進捗が表示されます）
3. 完了後、GIF をダウンロードまたは共有

### 3. X (Twitter) への投稿

1. 生成されたキネ文字の「X に投稿」ボタンをクリック
2. 新規タブで X の投稿画面が開く
3. 内容を確認して投稿

## 📂 ディレクトリ構造

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 全体レイアウト
│   ├── page.tsx                  # ホームページ
│   ├── api/                      # API ルート
│   │   ├── kinemoji/gif/         # GIF 生成エンドポイント
│   │   └── posts/                # 投稿管理
│   └── kinemoji/                 # メイン機能
│       ├── [id]/                 # 詳細ページ
│       ├── list/                 # 一覧ページ
│       ├── new/                  # 新規作成
│       └── render/               # GIF 描画用
├── components/                   # React コンポーネント
│   ├── layout/                   # レイアウトコンポーネント
│   ├── organisms/                # 複合コンポーネント
│   ├── pages/                    # ページロジックコンポーネント
│   └── ui/                       # shadcn/ui
├── service/                      # ビジネスロジック層
├── db/                           # データベース
│   └── schema/                   # Drizzle スキーマ定義
└── lib/                          # 共通ライブラリ
```

詳細な構造については [`DESIGN.md`](DESIGN.md) を参照してください。

## 🧪 テスト

```bash
# ユニットテスト
npm run test

# E2E テスト
npm run test:e2e
```

## 🤝 コントリビューション

コントリビューションを歓迎します！以下の手順に従ってください。

1. リポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを開く

## 📜 変更履歴

| 日付 | 変更内容 |
|------|----------|
| 2026-04-11 | CloudRun利用開始・・・Functionではやっぱり無理の模様 |
| 2026-04-10 | Pro-mode 課金開始１０＄　Netlify |
| 2026-04-09 | GA4 対応、テーブル調整、X 投稿 OGP 対応 |
| 2026-04-08 | Lupin アニメーションの GIF 生成精度向上、動的録画時間導入 |

## 📝 TODO
 
## todo
- [ ] スタートページのデザイン
  - [ ] スタート画面の再設計
  - [ ] OP可能かどうかの検討、なしの場合も想定した動き
  - [ ] 回るイメージのスタートだとよき認識
- [ ] 投稿画面のデザイン
- [ ] 一覧画面のデザイン
  - [ ] タイプごとの一覧必要
- [ ] バックグランドAPI実行中のダミー映像
  - [ ] 見せられないヨ！
    - https://ameblo.jp/sweetspot211/entry-10096008057.html
- [ ] OG対応　Xとの連携用
  - [ ] OG用の設定をNextで可能かの確認、それ用のGIFは有効、プレビュー画面
  - [ ] OG：左下にはアプリ名
  - [ ] POSTの中身はテキスト＋OGで、テキストは手直ししてもらう想定で。
  - [ ] XPostCard kinemoji/docs/20260409_xpostcard/
- [ ] 管理者機能調整
  - [ ] Lookerの画面
- [ ] ヘルプコンテンツ作成
- [ ] 削除機能
- [ ] ヘイルメアリーバージョン
  - [ ] これただしいこと。質問
  - [ ] ４０さい、こども。おどろき、おどろき、おどろき
  - [ ] 宇宙、放射線、怖い、怖い、怖い
  - [ ] 「しあわせ、しあわせ、しあわせ！」
  - [ ] 「なぜ船に名前が必要なんだ、質問？」
  - [ ] 「数学は思考じゃない。数学は手順。記憶は思考じゃない。記憶は保存。思考は思考。問題、解決。お前と俺は同じ速度で考える。なぜ、疑問？」
- [ ] カイジバージョン　→文字大事かと　ざわざわざわ・・　想定
- [ ] タイポライター風s
  - [ ] https://zenn.dev/kg_lens/articles/cdb7a85fac25f1
- [ ] 認証機能の有効化
- [x] デザインmd,agents.md検討
- [x] バックグランドAPIの動きソース -> cloudrunで実装
- [x] バックグランドAPIの動き列更新周り -> cloudrunで実装
- [x] バックグランドAPI、キック後の反応、現行時間かかるので、調整したい 
  - →Pendingで帰ってきているので、非同期では実行できている。
- [ ] 公開
  - [ ] LB作成
  - [ ] Zenn検討
  - [ ] Wai検討
  - [ ] Choitame検討
  
## 📚 参考リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Turso DB](https://turso.tech/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [shadcn/ui](https://ui.shadcn.com/)

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下でライセンスされています。

---

**デプロイ先**: [https://kinemoji.netlify.app](https://kinemoji.netlify.app)
