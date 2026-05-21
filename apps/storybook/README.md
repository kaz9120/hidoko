# hidoko-storybook

hidoko モノレポの全 workspace を横断する集約 Storybook。`packages/ui` の shadcn コンポーネントと、各 app (`snapcrop` / `futari-no-yotei` / `homepage`) の組み合わせ UI を 1 つの場所で確認する。

Cloudflare Workers Builds で PR ごとに preview URL が自動コメントされるので、デザイン確認・レビューはその URL を共有して行う。

## コマンド

リポジトリルートから:

```sh
bun --filter hidoko-storybook dev              # ローカル Storybook (http://localhost:6006)
bun --filter hidoko-storybook build            # storybook-static/ に静的書き出し
bun --filter hidoko-storybook test-storybook   # Playwright で全 story の screenshot を撮る (VRT 用)
```

`dev` を立てた状態で別ターミナルから `test-storybook` を呼ぶ。

## 開発フロー

> 「コンポーネントは story を先に書く」のがこのリポジトリのルール。

1. `packages/ui` の shadcn コンポーネント、または `apps/*/app/components` の組み合わせ UI を新規追加するときは、まず隣接する `*.stories.tsx` を書く。
2. Storybook 上でインタラクション・variants・edge case を一通り確認してから、ページ実装や API 結合に進む。
3. PR を出すと CI の `vrt` ジョブが reg-suit で差分検出し、差分があれば PR コメントで通知される (差分の採否は人間)。
4. Cloudflare Workers Builds が preview URL を自動コメントするので、レビュアはその URL で実物を触る。

## stories の置き場所

新しい story は **コンポーネント本体と同じディレクトリ** に置く (例: `packages/ui/src/components/button.stories.tsx`)。
`.storybook/main.ts` の `stories` glob が次の全パスを拾う:

- `packages/ui/src/**/*.stories.@(ts|tsx)`
- `apps/snapcrop/app/**/*.stories.@(ts|tsx)`
- `apps/futari-no-yotei/app/**/*.stories.@(ts|tsx)`
- `apps/homepage/app/**/*.stories.@(ts|tsx)`
- `apps/storybook/stories/**/*.stories.@(ts|tsx)` (Storybook 自身のドキュメント・ガイドページ用)

app コンポーネントが `react-router` の hook や `<Link>` を使っているときは、story 側で `MemoryRouter` 等の decorator を当てる。

## デプロイ

Cloudflare Workers Builds が GitHub 連携で自動ビルド・デプロイする。手動で deploy したい場合は:

```sh
bun --filter hidoko-storybook deploy        # 本番デプロイ
bun --filter hidoko-storybook deploy:dry    # ドライラン
```
