# **📘 システム概要**
## **タイトル***

Kinemoji


## **目的**

ブラウザ上でリアルタイムに動かす「インタラクティブな演出」として実装、
GIFとしても保存可能にしておく。
APIの引数として文字列「へのへのもへじ」などのもらえれば、それで動的な結果を表示できる状態がゴールです。
DBにはショートURL用の識別枝を持つようにする。
ログインした作成者または、管理者についてはデータの削除が可能
ランダムに表示ではなく、引数に応じた文字を再現性のある仕組みを想定


## **要件**
### **作成**

- Step1)ログイン（ログイン必須）
- Step2)文字列の入力（２０文字程度）
- Step3)作成押下
- Step4)結果表示

### **参照**
- Step1)作成済み一覧
- Step2)選択
- Step3)結果表示



## 非機能要件

### **システムアーキテクチャ**

言語：NextJS
ホスト：Vercel
データベース：SQLite（Turso）
ログインAuth：Google

### 認証・ユーザー管理関連

| 機能 | 実装場所 | 説明 |
|------|----------|------|
| メール認証付きログイン | [`src/app/api/auth/verify/route.ts`](src/app/api/auth/verify/route.ts:1) | メールアドレス確認用のトークン発行・検証 |
| パスワードリセット | [`src/app/api/auth/password-reset/route.ts`](src/app/api/auth/password-reset/route.ts:1) | パスワード再設定用メール送信・リセット処理 |
| ユーザー登録 | [`src/app/api/auth/signup/route.ts`](src/app/api/auth/signup/route.ts:1) | 新規ユーザー登録（メール認証付き） |
| メール送信共通関数 | [`src/lib/mail.ts`](src/lib/mail.ts:8) | Resend API を使用したメール送信（開発環境ではコンソール出力） |
| 管理者判定ユーティリティ | [`src/lib/user.ts`](src/lib/user.ts:7) | セッションまたはメールアドレスから管理者権限を判定 |
| 管理者用ダッシュボード | [`src/app/admini/page.tsx`](src/app/admini/page.tsx:1) | Looker Studio 連携による統計表示、Vercel OG プレビュー機能 |
| Google OAuth 認証 | [`src/auth.ts`](src/auth.ts:26) | NextAuth を使用した Google 認証連携 |
| メールアドレス・パスワード認証 | [`src/auth.ts`](src/auth.ts:30) | クレデンシャルプロバイダーによる認証 |

### データ操作・サービス層

| 機能 | 実装場所 | 説明 |
|------|----------|------|
| kinemoji CRUD | [`src/service/kinemoji-service.ts`](src/service/history-service.ts:4) | kinemojiの作成・更新・取得・削除 |
| ユーザープロフィール取得 | [`src/service/user-service.ts`](src/service/user-service.ts:1) | ユーザー情報の取得・更新 |

### ユーティリティ・共通コンポーネント

| 機能 | 実装場所 | 説明 |
|------|----------|------|
| 日付フォーマット | [`src/lib/date.ts`](src/lib/date.ts:1) | 日付のローカライズ・フォーマット |
| ユーザーツールチップ | [`src/components/organize/user_tooltip.tsx`](src/components/organize/user_tooltip.tsx:1) | ユーザー情報をホバーで表示 |
| 汎用ダイアログ | [`src/components/ui/dialog.tsx`](src/components/ui/dialog.tsx:1) | shadcn/ui のダイアログコンポーネント |
| 汎用シート | [`src/components/ui/sheet.tsx`](src/components/ui/sheet.tsx:1) | shadcn/ui のサイドシートコンポーネント |
| 汎用ドラワー | [`src/components/ui/drawer.tsx`](src/components/ui/drawer.tsx:1) | shadcn/ui のドラワーコンポーネント |
| 動的ページタイトル設定 | [`src/app/layout.tsx`](src/app/layout.tsx:1) | 各ページで `Metadata` を使用したタイトル設定 |

### API・インフラ連携

| 機能 | 実装場所 | 説明 |
|------|----------|------|
| ヘルプコンテンツ API | [`src/app/api/help/[slug]/route.ts`](src/app/api/help/[slug]/route.ts:1) | Markdown ヘルプファイルを動的に提供 |
| Resend メール API 連携 | [`src/lib/mail.ts`](src/lib/mail.ts:3) | 開発/本番環境対応のメール送信 |
| Turso (libSQL) 接続 | [`src/lib/db.ts`](src/lib/db.ts:1) | SQLite 互換のデータベース接続・クエリ実行 |

### UI コンポーネント（shadcn/ui ベース）

| コンポーネント | 実装場所 |
|---------------|----------|
| Button | [`src/components/ui/button.tsx`](src/components/ui/button.tsx:1) |
| Card | [`src/components/ui/card.tsx`](src/components/ui/card.tsx:1) |
| Toast | [`src/components/ui/toast.tsx`](src/components/ui/toast.tsx:1) |



## **Directory Structure**

```
src/
├── app/
│   ├── api/                   # 外部連携・公開用API
│   │   └── posts/route.ts     # GET: 一覧取得, POST: 外部からの投稿など
│   ├── (auth)/                # 認証グループ
│   ├── (user)/                # ログイン後グループ
│   └── kinemoji/              # 
│       └── new/              # 新規登録
│       └── list/             # 投稿一覧
├── components/
│   ├── ui/                    # shadcn/ui 等の低レイヤーコンポーネント
│   ├── atomic/                # Atoms, Molecules
│   ├── organisms/             # 複数の部品を組み合わせた塊
│   └── pages/                 # 各画面のメイン実装（page.tsxから呼ばれる）
├── service/                   # 【心臓部】ビジネスロジック
│   ├── kinemoji-service.ts        # getPosts, createPost などの関数
├── lib/
│   ├── turso/
│   │   └── db.ts              # Tursoクライアント初期化
│   └── utils/                 # utilDate.ts などをまとめるディレクトリ
├── constants/
└── middleware.ts
```


# MVP

ひとまず、画面上での確認をStep1
Step2をGif化
Step3をログイン処理想定しての実装ですが、
ログイン処理も想定したフォルダ構成は必要です。

## 🛠️ 実装に必要なツール
Next.js単体というより、アニメーションに特化したライブラリを組み合わせるのが近道です。

1.  **Framer Motion**: React向けのアニメーションライブラリ。これが本命です。
2.  **Tailwind CSS**: レイアウトや文字のデザインを整えるのに最適。
3.  **Google Fonts (Noto Sans JP / Shippori Mincho)**: アニメ風にするなら、フォント選びが命です。

---

## 💡 実装のアイデアとコードの骨組み

「漢字がバラバラに降りてきて、最後にタイトルになる」演出の簡易的な仕組みを紹介します。

### 1. 文字を1文字ずつ分割する
一気に表示するのではなく、文字列を `split('')` で配列にして、1文字ずつ `<span>` で囲みます。

### 2. アニメーションの設定
Framer Motionの `variants` を使って、各文字に時間差（delay）をつけます。

```tsx
// イメージ的な実装コード
import { motion } from 'framer-motion';

const TitleAnimation = () => {
  const title = "境界線上の物語";
  const characters = title.split("");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0, // 定位置
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: -50, // 上から降ってくる
      filter: "blur(10px)",
    },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="text-6xl font-bold flex">
      {characters.map((char, index) => (
        <motion.span variants={child} key={index}>
          {char}
        </motion.span>
      ))}
    </motion.div>
  );
};
```

---

## 🚀 さらに「アニメっぽく」するコツ

* **イージング（緩急）**: 物理的な動きではなく、一瞬速く動いてピタッと止まる `easeOut` や、少し行き過ぎて戻る `backOut` を使うと「それっぽく」なります。
* **ランダム性**: 全ての文字が同じ高さから落ちるのではなく、`y: Math.random() * 100 - 50` のように初期値をバラけさせると、より複雑でプロっぽい演出になります。
* **ブレ（Blur）**: 移動中に少し `filter: blur()` をかけると、残像感が出てアニメのOPのような質感が生まれます。

## ⚠️ 注意点
もしこれを「GIF画像」として生成して保存したい（ブラウザで見せるだけじゃない）場合は、Next.js側で **Canvas API** や **Puppeteer** を使ってスクリーンショットを連続撮影し、サーバーサイドでエンコードする必要があります。これは少し難易度が上がります。

Webサイトの演出として作りたいのであれば、Framer Motionを使うのが最もスマートで、パフォーマンスも良いですよ！

具体的に「こんな感じのタイトルの動き」という参考のアニメ作品などはありますか？それに基づいた具体的なパラメータを提案することもできます。