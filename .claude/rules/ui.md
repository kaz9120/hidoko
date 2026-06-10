---
paths:
  - "packages/ui/**"
  - "apps/*/app/**"
---

# UI 実装ルール

UI の実装は全て [packages/ui](../../packages/ui) に集約する: design tokens (`tokens.css`)、shadcn/ui コンポーネント、ロゴアセット、火の粉アニメーション (`<hi-embers>`)。`apps/*` からは workspace dep `ui` 経由で取る。詳細な使い方・更新方法は [packages/ui/README.md](../../packages/ui/README.md) を参照。

- **shadcn の写経を app 側に置かない** — `bunx shadcn add` は必ず `--cwd packages/ui` で実行する。`apps/*/app/components/` 配下に shadcn 由来のコードを置かない。
- **packages/ui のコンポーネントを手で編集しない** — shadcn の最新化フロー (`bun run ui:sync`) で上書きされる前提のコード。直したくなったら、まず「shadcn 本家を直してもらう」か「app 側で wrap する」を検討する。
- **shadcn registry にあるものは自前で作らない** — `Button` / `Dialog` / `Form` などは全て packages/ui に揃っている。同等品を自前で書かない。
- **app 固有の組み合わせ UI は app 側に置いてよい** — `<TopNav>` のような「shadcn コンポーネントを組み合わせた業務 UI」は `apps/*/app/components/` に置く。
- **最新化は `bun run ui:diff` → `bun run ui:sync`** — 定期的に diff を確認し、適用したいときに sync を走らせる。両方ともリポジトリルートから実行できる。

新しい画面・コンポーネントを作る前に [DESIGN.md](../../DESIGN.md) を一読する。色は生のカラーコードを直書きせず、`tokens.css` のトークン経由で参照する。

UX の作り込みでは「動くだけ」で終わらせない。Dialog の外側タップでの誤破棄を抑止する、dirty な編集内容を捨てる前に確認を挟む、日時などの構造化された値は自由入力でなくピッカーで受ける、を実装段階でチェックする。
