# AGENTS.md

Hidoko で開発するときに知っておくべきルールをまとめる。人間も AI エージェントもここを起点にする。

## このリポジトリの位置づけ

- 「焚き火を愛するエンジニア」が個人開発を楽しむための火床（基盤）。コンセプトは [README.md](README.md) を参照。
- 個人プロジェクト群を束ねるモノレポで、`apps/*` がプロダクト、`packages/*` が共通基盤。
- AI 駆動開発を前提に整備している。タスクの整理から PR・レビュー対応までの流れは後述の「開発フロー」を見る。

## ひどことアプリの関係

「ひどこ／HIDOKO／火床」はアプリを素早く作るための基盤（プラットフォーム）の名前。アプリのユーザーに見せるブランドではない。エンドユーザーから見たブランドは「焚き火を愛するエンジニア（作者）」と、個別アプリの名前（snapcrop / note-ogp / futari-no-yotei / homepage 等）。

- アプリのユーザーに見える箇所には「ひどこ／HIDOKO／火床」を出さない
  - UI テキスト・ヘッダーやフッターのコピー・ページタイトル・OGP・ヘルプやプライバシーポリシー本文・シェア文面など
- 内部識別子に `hidoko-` 接頭辞を使うのは問題ない（基盤側の命名として推奨）
  - Worker 名・パッケージ名・コンポーネント名・ストレージのキー（localStorage / D1 / KV 等）・テスト ID など
  - これらはエンドユーザーには露出しない
- Storybook やリポジトリ内ドキュメントの説明文・サンプルテキストは内部用なので「火床」「Hidoko」を使ってよい

新しい画面・アプリを作るときは、このルールを当てはめてから装飾文言を考える。違反を見つけたら直す（先行対応の例: PR #116 で note-ogp のひどこ表記を除去）。

## 作者の公開 URL

フッターやヘルプの作者リンク、シェア文面などで使う正式な URL。これ以外の表記（`kyamamoto.dev` 等）は誤りなので、見つけたら修正する。

| 用途 | URL |
|---|---|
| 個人サイト（ホームページ） | https://y-kaz.com/ （表記は `y-kaz.com`） |
| X | https://x.com/kyamamoto9120 （handle は `@kyamamoto9120`） |
| 各アプリの本番 | `https://<app>.y-kaz.com/`（例: https://snapcrop.y-kaz.com/ ） |

## ドキュメントマップ

| 知りたいこと | 場所 |
|---|---|
| コンセプト・リポジトリ構成 | [README.md](README.md) |
| 作者のパーソナルブランド定義 | [BRAND.md](BRAND.md) |
| ブランド・視覚言語の仕様 | [DESIGN.md](DESIGN.md) |
| UI 実装のルール | [.claude/rules/ui.md](.claude/rules/ui.md) |
| Storybook / VRT のルール | [.claude/rules/storybook.md](.claude/rules/storybook.md) |
| デザイントークンと DESIGN.md の運用 | [.claude/rules/design.md](.claude/rules/design.md) |
| GitHub Actions のルール | [.claude/rules/github-workflows.md](.claude/rules/github-workflows.md) |
| 開発ワークフローのスキル | [.claude/skills/](.claude/skills/) |

`.claude/rules/` は Claude Code が対象パスの編集時に自動で読み込む path-scoped ルール。中身はただの Markdown なので、人間も対象領域を触る前に読む。

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
| コードレビュー | CodeRabbit（設定は [.coderabbit.yaml](.coderabbit.yaml)） |
| デプロイ | Cloudflare Workers Builds（PR ごとに preview URL を自動コメント） |
| コンポーネントカタログ | [Storybook](https://storybook.js.org) v10 (`apps/storybook` に集約) |
| VRT | [reg-suit](https://github.com/reg-viz/reg-suit) + `@storybook/test-runner` (PR コメントで差分通知) |

`npm` / `yarn` / `pnpm` は使わない。すべて `bun` 経由。

## よく使うコマンド

リポジトリルートから:

```sh
bun install              # 依存インストール（lockfile は bun.lock）
bun run check            # Biome で format + lint + 自動修正
bun run typecheck        # 全 workspace で tsc --noEmit
bun run preflight        # push 前の一括チェック（check + typecheck + design:lint）
```

特定の workspace に絞るとき:

```sh
bun --filter snapcrop dev      # apps/snapcrop の dev サーバ
bun --filter snapcrop build    # apps/snapcrop のビルド
```

各 workspace の固有コマンドは、その配下の `README.md` / `package.json` を見る。

## 開発フロー

タスクは「Issue → ブランチ → Draft PR → 実装 → レビュー対応 → マージ」で進める。

1. タスクを Issue にする（[テンプレート](.github/ISSUE_TEMPLATE/): 機能・改善 / バグ / 整備）。Why / What / Done を埋めた Issue は、そのまま AI に開発を依頼できる粒度になる。軽微な変更は Issue を省略してよい。
2. `main` から feature ブランチを切る。prefix は `feature/` `fix/` `refactor/` `docs/` `style/` `perf/`、本体は英語 kebab-case（例: `feature/add-user-profile-page`）。
3. 実装する。push 前に `bun run preflight` を通す。
4. コミットする（Conventional Commits 準拠。後述）。
5. PR を出す。description は [PR テンプレート](.github/PULL_REQUEST_TEMPLATE.md) の構造（Why / What / Done / 確認方法）で書き、実装の進行に合わせて最新化し続ける。
6. CI（lint / design-lint / typecheck / build / commitlint / vrt）と Cloudflare Workers Builds の preview を確認する。preview URL は Cloudflare 側が sticky コメントするので GitHub Actions で自前実装しない。
7. CodeRabbit のレビューに対応する。指摘は鵜呑みにせず妥当性を検証し、採用しない場合も理由を返信する。
8. マージするかどうかは人間が判断する。

## Cloudflare Workers Builds の監視パス

モノレポなので、各 Worker のビルドは関係するパスが変わったときだけ走らせたい。この「監視パス (build watch paths)」はダッシュボードで手入力せず、スクリプトで同期する。

```sh
bun run cf:watch-paths --dry-run   # 差分の確認だけ
bun run cf:watch-paths             # Cloudflare に反映
```

- 監視パスは各 app の `package.json` の workspace 依存から自動導出する（app 自身 + 依存 package + `bun.lock` / `package.json` / `tsconfig.base.json`）。
- 導出で足りない app は、その `package.json` に `workersBuilds.watchPaths` を書いて全置換する（例: `apps/storybook` は全 workspace の story を集約するので全体を監視する）。
- 認証は `CLOUDFLARE_API_TOKEN` と `CLOUDFLARE_ACCOUNT_ID`。[.env.example](.env.example) をコピーしてルートに `.env.local`（gitignore 済み）を作れば Bun が自動で読む。トークンの権限は example 内のコメント参照。
- 新しい app を追加したら、初回デプロイと Git 連携のあとにこのスクリプトを 1 回実行する。

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

## バージョン運用ルール

各 app と `packages/ui` のバージョンは [release-please](https://github.com/googleapis/release-please) の manifest モードで管理する。設定は [release-please-config.json](release-please-config.json)、現在のバージョンは [.release-please-manifest.json](.release-please-manifest.json) を見る。

- semver に従い、bump は Conventional Commits から自動算出する。`feat` は minor、`fix` は patch、`BREAKING CHANGE` は major。PR 著者がバージョンのために行う追加作業はない。
- 1.0 未満の間は `BREAKING CHANGE` も minor 扱いになる（`bump-minor-pre-major`）。`1.0.0` を切る判断は自動化せず、人間がコミット footer に `Release-As: 1.0.0` を書いて明示する。
- `packages/ui` に release 対象の変更が入ると、`node-workspace` plugin が依存する app にも patch bump を波及させる。
- main にコミットが積まれるたび、[release-please.yml](.github/workflows/release-please.yml) がリリース PR を作成・更新し、auto-merge を有効化する。required checks（lint / typecheck）の通過後に自動でマージされ、`package.json` の version と `CHANGELOG.md` が更新され、タグ（`<package>-v<version>`）と GitHub Release が作られる。人間によるマージ判断は不要（バージョン表記を本番デプロイに追従させるため）。
- npm への publish はしない。バージョンはフッター表示と変更履歴のためのもの。

## コードスタイル

- フォーマット・lint は Biome に従う（設定は [biome.json](biome.json)）。手で整形しない。
- `pre-commit` フックで lint-staged が変更ファイルにだけ Biome をかける。
- TypeScript は各 workspace の `tsconfig.json` が [tsconfig.base.json](tsconfig.base.json) を継承する。strict は base 側で有効化。

## デザインと UI

- ブランドと視覚言語の単一仕様は [DESIGN.md](DESIGN.md)。新しい画面を作る前に必ず一読する。「らしくないもの」（純白 `#ffffff` を使わない、彩度の高い緑・青は避ける、絵文字を装飾で使わない 等）もここにある。
- UI 実装は [packages/ui](packages/ui) に集約する。shadcn/ui の扱い・トークンの参照方法は [.claude/rules/ui.md](.claude/rules/ui.md)、Storybook と VRT の運用は [.claude/rules/storybook.md](.claude/rules/storybook.md) に従う。

## AI エージェント向けの注意

- 上記のルールは人間にもエージェントにも等しく適用される。
- 実装タスクはコードを書いて終わりにせず、PR 作成・CI 通過・レビュー対応まで完走する（Claude Code 向けの詳細は [CLAUDE.md](CLAUDE.md)）。
- ルールが曖昧・矛盾していると感じたら、推測で進めずに本ファイルか `.claude/rules/` を更新する PR を出す。
- 自動投稿のコメントには末尾に `_🤖 by Claude Code_` を付け、人間のコメントと区別できるようにする。
