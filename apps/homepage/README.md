# homepage

`y-kaz.com` 向けの個人ホームページ。山本 一将 / Yamamoto Kazumasa の自己紹介 + 書いたもの・登壇資料・メディア露出・自作ツールへのハブ。

## 開発

```sh
bun --filter homepage dev               # ローカル開発サーバ
bun --filter homepage build             # 本番ビルド (prerender 含む)
bun --filter homepage deploy            # Cloudflare Workers にデプロイ
bun --filter homepage preview           # ビルド成果物をローカルで確認
```

## 構成

- React Router 7 (SPA mode, `ssr: false`, `/` を prerender)
- Vite 7
- Cloudflare Workers (Static Assets only, no Worker code)
- スタイリングはデザイン同梱の生 CSS。Tailwind は使わない (snapcrop と異なる方針)
- 共通トークン・mark・火の粉アニメは [`design-system`](../../packages/design-system) workspace dep から import

`/` の HTML を build 時に prerender し、`build/client` を Static Assets として配信。
未知のパスは `index.html` にフォールバック (`assets.not_found_handling: "single-page-application"`)。

## カスタムドメイン

Cloudflare Workers Builds の Git 連携で `hidoko-homepage` Worker をデプロイし、ダッシュボード上で apex `y-kaz.com` を Custom Domain として割り当てる。`wrangler.jsonc` に `routes` は書かない (snapcrop と同じ運用)。
