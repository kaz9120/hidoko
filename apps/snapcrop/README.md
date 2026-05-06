# snapcrop

ブラウザで動く画像エディタ。

## 開発

```sh
bun --filter snapcrop dev      # ローカル開発サーバ
bun --filter snapcrop build    # 本番ビルド
bun --filter snapcrop deploy   # Cloudflare Workers にデプロイ
```

## 構成

- React Router 7 (SPA mode, `ssr: false`)
- Vite 7 + Tailwind 4
- Cloudflare Workers (Static Assets only, no Worker code)

`build/client` を Static Assets として配信し、未知のパスは `index.html` に
フォールバック (`assets.not_found_handling: "single-page-application"`) する
ことでクライアントサイドルーティングが効く。
