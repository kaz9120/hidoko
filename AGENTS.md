# AGENTS.md

Hidoko で開発するときに知っておくべきルールをまとめる。人間も AI エージェントもここを起点にする。

## このリポジトリの位置づけ

- 「焚き火を愛するエンジニア」が個人開発を楽しむための火床（基盤）。コンセプトは [README.md](README.md) を参照。
- 個人プロジェクト群を束ねるモノレポで、`apps/*` がプロダクト、`packages/*` が共通基盤。

## ツールチェーン

| 用途 | ツール |
|---|---|
| パッケージマネージャ / ランタイム | [Bun](https://bun.sh) (`>=1.3.9`) |
| 言語 | TypeScript |
| Lint / Format | [Biome](https://biomejs.dev) |
| Git hook | Husky + lint-staged |
| Commit lint | commitlint (`@commitlint/config-conventional`) |
| 依存更新 | Renovate |
| CI | GitHub Actions |
| デプロイ | Cloudflare Workers Builds（PR ごとに preview URL を自動コメント） |

`npm` / `yarn` / `pnpm` は使わない。すべて `bun` 経由。

## よく使うコマンド

リポジトリルートから:

```sh
bun install              # 依存インストール（lockfile は bun.lock）
bun run check            # Biome で format + lint + 自動修正
bun run check:ci         # CI と同じ（読み取りのみ、修正なし）
bun run typecheck        # 全 workspace で tsc --noEmit
```

特定の workspace に絞るとき:

```sh
bun --filter snapcrop dev      # apps/snapcrop の dev サーバ
bun --filter snapcrop build    # apps/snapcrop のビルド
```

各 workspace の固有コマンドは、その配下の `README.md` / `package.json` を見る。

## 開発フロー

1. `main` から feature ブランチを切る。
2. 実装する。`bun run check` と `bun run typecheck` をローカルで通す。
3. コミットする（Conventional Commits 準拠。後述）。
4. PR を出す。CI（lint / typecheck / build / commitlint）と Cloudflare Workers Builds の preview を確認する。
5. preview URL は Cloudflare Workers Builds が自動で sticky コメントしてくれるので、GitHub Actions 側で自前実装しない。

## コミット規約

`@commitlint/config-conventional` を使う。

形式:

```
<type>(<scope>): <subject>
```

- `type`: `feat` / `fix` / `chore` / `docs` / `refactor` / `test` / `ci` / `build` / `perf` / `style` / `revert`。
- `scope`: 影響範囲（例: `snapcrop`、`homepage`、`ui`）。リポジトリ全体に及ぶときは省略可。
- `subject`: 何をしたかを 1 行で。**先頭は lowercase Latin か日本語**にする（`Capital` 始まりの英文は reject される）。

例:

```
feat(snapcrop): クロップ画像を Cmd/Ctrl+C でクリップボードへコピー
fix(snapcrop): favicon をライト用 mark-cream に差し替え
ci: PR ベースで lint / typecheck / build / commitlint を回す
```

`commit-msg` フックで commitlint が走る。CI でも PR 範囲のコミットを検証する。`--no-verify` でフックを飛ばさない。

## コードスタイル

- フォーマット・lint は Biome に従う（設定は [biome.json](biome.json)）。手で整形しない。
- `pre-commit` フックで lint-staged が変更ファイルにだけ Biome をかける。
- TypeScript は各 workspace の `tsconfig.json` が [tsconfig.base.json](tsconfig.base.json) を継承する。strict は base 側で有効化。

## デザイン

ブランドと視覚言語の単一仕様は [DESIGN.md](DESIGN.md)。新しい画面を作る前に必ず一読する。色・タイポ・レイアウト・コンポーネント方針・Do/Don't・エージェント向け指示プロンプトまで、ここに集約している。

ブランドの「らしくないもの」(純白 `#ffffff` を使わない、彩度の高い緑・青は避ける、絵文字を装飾で使わない 等) も DESIGN.md に書いてある。

## UI 実装

実装は全て [packages/ui](packages/ui) に集約されている: design tokens (`tokens.css`)、shadcn/ui コンポーネント、ロゴアセット、火の粉アニメーション (`<hi-embers>`)。`apps/*` からは workspace dep `ui` 経由で取る。詳細な使い方・更新方法は [packages/ui/README.md](packages/ui/README.md) を参照。

- **shadcn の写経を app 側に置かない** — `bunx shadcn add` は必ず `--cwd packages/ui` で実行する。`apps/*/app/components/` 配下に shadcn 由来のコードを置かない。
- **packages/ui のコンポーネントを手で編集しない** — shadcn の最新化フロー (`bun run ui:sync`) で上書きされる前提のコード。直したくなったら、まず「shadcn 本家を直してもらう」か「app 側で wrap する」を検討する。
- **shadcn registry にあるものは自前で作らない** — `Button` / `Dialog` / `Form` などは全て packages/ui に揃っている。同等品を自前で書かない。
- **app 固有の組み合わせ UI は app 側に置いてよい** — `<TopNav>` のような「shadcn コンポーネントを組み合わせた業務 UI」は `apps/*/app/components/` に置く。
- **最新化は `bun run ui:diff` → `bun run ui:sync`** — 定期的に diff を確認し、適用したいときに sync を走らせる。両方ともリポジトリルートから実行できる。

## AI エージェント向けの注意

- 上記のルールは人間にもエージェントにも等しく適用される。
- ルールが曖昧・矛盾していると感じたら、推測で進めずに本ファイルを更新する PR を出す。
- 自動投稿のコメントには末尾に `_🤖 by Claude Code_` を付け、人間のコメントと区別できるようにする。
