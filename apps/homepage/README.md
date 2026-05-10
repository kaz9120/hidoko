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
- Vite 7 + Tailwind 4 + shadcn/ui (snapcrop と揃えたスタック)
- Cloudflare Workers (Static Assets only, no Worker code)
- 共通トークン・mark・火の粉アニメは [`design-system`](../../packages/design-system) workspace dep から import

`/` の HTML を build 時に prerender し、`build/client` を Static Assets として配信。
未知のパスは `index.html` にフォールバック (`assets.not_found_handling: "single-page-application"`)。

## カスタムドメイン

Cloudflare Workers Builds の Git 連携で `hidoko-homepage` Worker をデプロイし、ダッシュボード上で apex `y-kaz.com` を Custom Domain として割り当てる。`wrangler.jsonc` に `routes` は書かない (snapcrop と同じ運用)。

## コンテンツの追加フロー

Notes (書いたもの) / Decks (登壇資料) / Media (出ているもの) はそれぞれ `app/data/*.ts` の配列にデータを足すだけで反映される。配列が空のときはセクション本体は「準備中」プレースホルダになり、外部リンク (note 一覧 / Docswell 一覧) は出続ける。

本人が手元で覚えていることだけを起点として、エージェント (Claude Code) 側でメタ情報を補完する役割分担:

- **本人が決める / 渡す**
  - URL
  - featured フラグ (各カテゴリ 1 件まで)
  - 一言コメント (`excerpt` / `comment` / `note`) — 本人視点の言葉
  - Decks の `event` (イベント名)、Media の `outlet` / `type` (媒体名・種別)
- **エージェントが補完する**
  - title / date / platform — URL から取得
  - data ファイルへの追加 (`apps/homepage/app/data/*.ts`)
  - コミット・push・PR 起票

受け渡しフォーマット例 (チャットに投げてもらえれば 1 メッセージから 1 PR を起こす):

```
書いたもの:
- https://note.com/.../article-1  ← featured
  「日々の更新を続けるためのやり方を言葉にしてみた」
- https://note.com/.../article-2
  「EM Oasis を 1 年続けて見えてきたこと」

登壇:
- EM Oasis Meetup #6 / https://www.docswell.com/...  ← featured
  「EM の役割を、自分の言葉で言い直してみた回」

メディア:
- インタビュー / Findy Engineer Lab / https://example.com
  「EM の役割と自分のキャリアについて聞いてもらった」
```
