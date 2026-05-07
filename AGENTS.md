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
- `scope`: 影響範囲（例: `snapcrop`、`design-system`）。リポジトリ全体に及ぶときは省略可。
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

## デザインシステム

[packages/design-system](packages/design-system) は Hidoko のブランド言語そのもの。UI を作るときは:

- まず [packages/design-system/README.md](packages/design-system/README.md) のトーン・カラー・タイポを確認する。
- 守るべき原則は [packages/design-system/SKILL.md](packages/design-system/SKILL.md) にまとめてある。
- ロゴ・マークは [packages/design-system/assets/logo/](packages/design-system/assets/logo) にある。`mark-cream` がライト背景用、`mark-dark` がダーク背景用。

純粋な白（`#ffffff`）は使わない、彩度の高い緑・青は避ける、絵文字は控えめに、といったブランドの「らしくないもの」も SKILL.md / README.md に書いてある。新しい画面を作る前に必ず一読する。

## AI エージェント向けの注意

- 上記のルールは人間にもエージェントにも等しく適用される。
- ルールが曖昧・矛盾していると感じたら、推測で進めずに本ファイルを更新する PR を出す。
- 自動投稿のコメントには末尾に `_🤖 by Claude Code_` を付け、人間のコメントと区別できるようにする。
