<p align="center">
  <img src="packages/ui/assets/logo/mark-cream.svg" alt="Hidoko" width="120" />
</p>

<h1 align="center">Hidoko</h1>

## Hidoko とは

焚き火を楽しむためには良い火床が不可欠です。  
いかに熱を閉じ込め酸素を効率よく送るかを意識することで思い通りに焚き火が操れるようになります。

私は個人開発も火床つくりに通ずるところがあると考えています。  
アイデアをすぐに形にできる良い基盤を作ることで、思い通りに個人開発をすることができるようになります。

Hidoko（火床）は「焚き火を愛するエンジニア」が個人開発を楽しむために整備するリポジトリです。

## リポジトリ構造

bun workspaces で構成されたモノレポ。

```
hidoko/
├── apps/
│   ├── homepage/          # y-kaz.com — 自己紹介とアウトプットのハブ
│   ├── snapcrop/          # ブラウザで動く画像エディタ
│   └── futari-no-yotei/   # 同居夫婦専用カレンダーの LINE ミニアプリ
└── packages/
    └── ui/                # トークン・shadcn/ui・ロゴ・火の粉を束ねた共通基盤
```

- [apps/homepage](apps/homepage) — React Router 7 (SPA, prerender) + Cloudflare Workers。
- [apps/snapcrop](apps/snapcrop) — React Router 7 + Cloudflare Workers。Storybook + reg-suit で VRT。
- [apps/futari-no-yotei](apps/futari-no-yotei) — React Router 7 + Cloudflare Workers。LIFF + D1 で動かす予定（現在は scaffold + 準備中ページ）。
- [packages/ui](packages/ui) — design tokens / shadcn/ui コンポーネント / ロゴ / `<hi-embers>` をひとつの workspace パッケージで提供。

## ドキュメント

- [AGENTS.md](AGENTS.md) — 開発時のルール・コマンド・コミット規約
- [DESIGN.md](DESIGN.md) — ブランドと視覚言語の単一仕様（色・タイポ・レイアウト・原則）
