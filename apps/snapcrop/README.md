# snapcrop

ブラウザで動く画像エディタ。

## 開発

```sh
bun --filter snapcrop dev               # ローカル開発サーバ
bun --filter snapcrop build             # 本番ビルド
bun --filter snapcrop deploy            # Cloudflare Workers にデプロイ
bun --filter snapcrop storybook         # Storybook (port 6006)
bun --filter snapcrop build-storybook   # Storybook の静的ビルド
bun --filter snapcrop test-storybook    # Storybook のスモークテスト + スクリーンショット撮影
```

## VRT (visual regression testing)

`test-storybook` は各ストーリーを Playwright (Chromium) で開いて 1280x800 の
スクリーンショットを `apps/snapcrop/__screenshots__/<storyId>.png` に保存する。
後続で reg-suit + Cloudflare R2 に繋いで、PR で expected と差分が出たら CI が
止まる運用にする。

ローカルで動かす場合 (初回のみ Chromium のダウンロードが必要):

```sh
bunx playwright install chromium                         # 初回のみ
bun --filter snapcrop build-storybook                    # 静的ビルド
python3 -m http.server 6006 --directory apps/snapcrop/storybook-static &
bun --filter snapcrop test-storybook
```

## 構成

- React Router 7 (SPA mode, `ssr: false`)
- Vite 7 + Tailwind 4
- Cloudflare Workers (Static Assets only, no Worker code)

`build/client` を Static Assets として配信し、未知のパスは `index.html` に
フォールバック (`assets.not_found_handling: "single-page-application"`) する
ことでクライアントサイドルーティングが効く。
