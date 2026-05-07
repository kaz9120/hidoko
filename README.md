<p align="center">
  <img src="packages/design-system/assets/logo/mark-cream.svg" alt="Hidoko" width="120" />
</p>

<h1 align="center">Hidoko</h1>

## Hidoko とは

焚き火を楽しむためには良い火床が不可欠です。
いかに熱を閉じ込め酸素を効率よく送るかを意識することで思い通りに焚き火が操れるようになります。

私は個人開発も火床つくりに通づるところがあると考えています。
アイデアをすぐに形にできる良い基盤を作ることで、思い通りに個人開発をすることができるようになります。

Hidoko（火床）は「焚き火を愛するエンジニア」が個人開発を楽しむために整備するリポジトリです。

## リポジトリ構造

bun workspaces で構成されたモノレポ。

```
hidoko/
├── apps/
│   └── snapcrop/          # ブラウザで動く画像エディタ
└── packages/
    └── design-system/     # Hidoko ブランドのデザインシステム
```

- [apps/snapcrop](apps/snapcrop) — React Router 7 + Vite + Cloudflare Workers の SPA。
- [packages/design-system](packages/design-system) — トークン・フォント・UI キット・ロゴをまとめたデザイン言語。

## 開発

開発時のルール・コマンド・規約は [AGENTS.md](AGENTS.md) を参照。
