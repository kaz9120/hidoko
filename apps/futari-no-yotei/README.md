# ふたりのよてい

同居夫婦・カップル専用のカレンダー LINE ミニアプリです。

## コンセプト

> 決まった瞬間に、夫婦のどちらかがアプリで状態を更新できている状態を目指します。
> LINE で「今日弁当いる?」と聞かれた瞬間、すでに敗北しています。

汎用カレンダーが苦手とする「家庭の日々のステータス」(誰が在宅か、晩御飯はどこか、送り迎えは誰か等) を一級市民として扱います。LINE 上で完結する体験で、夫婦の連絡コストを削減します。

設計の出発点は Claude Design で詰めたプロトタイプです。原典は外部リソースのため、画面仕様の「答え」は本リポジトリのコード自身です。意思決定の経緯はコミット履歴を参照してください。

## 開発

```sh
bun --filter futari-no-yotei dev         # ローカル開発サーバ
bun --filter futari-no-yotei build       # 本番ビルド
bun --filter futari-no-yotei deploy      # Cloudflare Workers にデプロイ
```

## 構成

- React Router 7 (SPA mode, `ssr: false`)
- Vite 7 + Tailwind 4
- Cloudflare Workers (Static Assets + 後続 PR で `/api/*` / `/webhook/line` を生やす予定)
- 認証: LIFF (LINE Login) ※後続 PR
- DB: Cloudflare D1 ※後続 PR
- LINE 連携: Messaging API (URL 取り込み Bot) ※後続 PR

`build/client` を Static Assets として配信し、未知のパスは `index.html` にフォールバックします (`assets.not_found_handling: "single-page-application"`)。

## デザイン

ライトモードがデフォルトで、ダークも提供します (LINE Mini App の体裁的に屋外昼間で開くことが多いという想定です)。トークンは [packages/ui](../../packages/ui) の `tokens.css` を参照しています。新規トークンは追加していません (既存の `--ember-*` / `--moon` / `--moss` / `--ink-*` で全画面カバー可能なため)。
