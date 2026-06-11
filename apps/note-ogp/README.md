# note-ogp

note のアイキャッチ画像（OGP, 1280×670 PNG）を作るブラウザ完結のテンプレートエディタ。

3 テンプレ（Edition / Cover / Quiet）× テーマ（ライト / ダーク）× タイトル書体（明朝 / ゴシック / 手書き）の組み合わせで、入力を差し替えるだけで書き出せる。入力は localStorage に保存されてリロードしても残る。

## 開発

```sh
bun --filter note-ogp dev               # ローカル開発サーバ
bun --filter note-ogp build             # 本番ビルド
bun --filter note-ogp deploy            # Cloudflare Workers にデプロイ
bun --filter note-ogp typecheck         # tsc --noEmit
```

Storybook は [apps/storybook](../storybook) に集約されている。

## 構成

- React Router 7 (SPA mode, `ssr: false`)
- Vite 7 + Tailwind 4
- [html-to-image](https://github.com/bubkoo/html-to-image) で `pixelRatio: 2` の 1280×670 PNG を書き出す
- Cloudflare Workers (Static Assets のみ、Worker コードなし)

`build/client` を Static Assets として配信し、未知のパスは `index.html` にフォールバックする。
