---
paths:
  - "**/*.stories.ts"
  - "**/*.stories.tsx"
  - "apps/storybook/**"
---

# Storybook と VRT のルール

集約 Storybook は [apps/storybook](../../apps/storybook) に置く。全 workspace の `*.stories.@(ts|tsx)` を 1 つの Storybook で見れる。Cloudflare Workers Builds 経由で PR ごとに preview URL が貼られるので、レビューはその URL を共有して行う。

```sh
bun --filter hidoko-storybook dev              # ローカル起動 (http://localhost:6006)
bun --filter hidoko-storybook build            # 静的書き出し (storybook-static/)
bun --filter hidoko-storybook test-storybook   # VRT 用 screenshot を撮る (dev を立てた状態で)
```

- **新規 UI コンポーネントは story を先に書く** — API 結合に進む前に、Storybook 上で variants / 状態 / インタラクション (disabled, loading, empty, error 等) を story で並べて確認する。
- **story の置き場所** — `packages/ui` のものは隣接 (`button.tsx` の隣に `button.stories.tsx`)。`apps/*` の組み合わせ UI は当該 app 内 (`apps/*/app/components/*.stories.tsx`)。Storybook 自身のドキュメント・ガイドページは `apps/storybook/stories/`。
- **react-router 依存の app コンポーネント** — `useNavigate` / `<Link>` 等を使う component の story では、`MemoryRouter` 等の decorator でラップする。
- **VRT は reg-suit が PR コメントで通知する** — 差分があってもジョブは fail にしない (差分の採否は人間)。`actualDir` / `pathPrefix` は [regconfig.json](../../regconfig.json) 参照。pathPrefix を切り替えたタイミングで expected はリセットされる。
