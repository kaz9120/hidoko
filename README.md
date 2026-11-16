<p align="center">
  <img src="https://raw.githubusercontent.com/kaz9120/takibi-design-system/main/packages/takibi/assets/logo/mark-cream.svg" alt="Hidoko" width="120" />
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
│   ├── note-ogp/          # note のアイキャッチ画像を作るテンプレートエディタ
│   ├── hidoko-id/         # 各アプリ共通のサインイン
│   └── storybook/         # 各アプリのストーリーを集めた Storybook
└── packages/
    └── app-kit/           # 計測タグなど、見た目を持たない共通部品
```

- [apps/homepage](apps/homepage) — React Router 7 (SPA, prerender) + Cloudflare Workers。
- [apps/snapcrop](apps/snapcrop) — React Router 7 + Cloudflare Workers。Storybook + reg-suit で VRT。
- [apps/note-ogp](apps/note-ogp) — React Router 7 (SPA) + Cloudflare Workers (Static Assets)。html-to-image で OGP 画像を書き出す。
- [packages/app-kit](packages/app-kit) — 計測タグ（GA4 / Clarity）などの、見た目を持たない共通部品。

見た目（トークン、コンポーネント、ロゴ、火の粉のアニメーション）は [Takibi Design System](https://design-system.y-kaz.com)（npm の `takibi-design-system`）を使う。

## ドキュメント

- [AGENTS.md](AGENTS.md) — 開発時のルール・コマンド・コミット規約
- [BRAND.md](BRAND.md) — 作者「焚き火を愛するエンジニア」のパーソナルブランド定義（核・声・物語）
- [Takibi Design System](https://design-system.y-kaz.com) — 色・文字・動き・コンポーネントの仕様
