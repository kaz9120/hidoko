# hidoko-id

火床（hidoko）上のアプリ群で共有する、薄いログイン基盤。各 first-party アプリは「サインイン」操作でこの Worker に遷移し、サインアップ／サインインのあと `?return_to` で指定した URL へ静かに戻る。

> 開発中の vertical slice。OAuth 2.1 + PKCE（サードパーティ・MCP 向け）と Google OIDC・パスワード再設定・アカウント設定画面は別 PR で順に積む。

## このアプリの責務

- メールアドレス＋パスワードでのサインアップ／サインイン
- メール確認（24 時間有効・ワンタイムトークン）
- ファーストパーティアプリへの silent redirect（同意画面なし）
- セッション cookie の発行・破棄（D1 ルックアップ）

## 構成

- React Router 7 SPA + Tailwind 4 + `packages/ui`（shadcn 系）
- Cloudflare Workers + D1（永続化）
- `workers/app.ts` が `/api/*` と `/verify` を捌き、それ以外は SPA assets にフォールスルー
- dev は `react-router dev`（Vite, 5173）と `wrangler dev`（8787）を `concurrently` で並走し、Vite 側の `server.proxy` で `/api/*` と `/verify` を Wrangler に流す

## 開発

```sh
bun --filter hidoko-id dev          # Vite + wrangler dev を並走（D1/KV はローカル）
bun --filter hidoko-id typecheck    # tsc -b
bun --filter hidoko-id build        # react-router build
bun --filter hidoko-id deploy:dry   # wrangler deploy --dry-run
```

初回だけ、ローカル D1 にスキーマを当てる:

```sh
cd apps/hidoko-id
bunx wrangler d1 migrations apply hidoko-id --local
```

### 環境変数

`wrangler.jsonc` の `vars` は本番値（`id.y-kaz.com` 前提）。dev では `.dev.vars`（gitignore 済み）で上書きする。

```sh
cd apps/hidoko-id
cp .dev.vars.example .dev.vars
```

`.dev.vars.example` には localhost オリジン群と `EMAIL_DEV_LOG=true`、空の `SESSION_COOKIE_DOMAIN` / `PUBLIC_BASE_URL` が入っている。本番運用に新しい first-party アプリを足したいときは `wrangler.jsonc` の `FIRST_PARTY_ORIGINS` を更新する PR を出す（Dashboard で手で上書きしない）。

## デプロイ

1. `bunx wrangler d1 create hidoko-id` を実行し、返ってきた UUID を `wrangler.jsonc` の `database_id` に書き込む
2. `bunx wrangler d1 migrations apply hidoko-id` で本番にスキーマを当てる
3. `bun --filter hidoko-id deploy`

## デザイン仕様

`design_handoff_hidoko_id/README.md` を参照。ユーザー可視のコピーでは「Hidoko」「火床」は出さず、「アカウント」「共通アカウント」など中立な語に置換している（AGENTS.md のブランドルール）。
