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
保存された actual 画像を [reg-suit](https://github.com/reg-viz/reg-suit) が
Cloudflare R2 上の expected 画像と比較し、差分があれば検知する。CI 連携と PR
通知は後続 PR で組み込む。

### 1. actual 画像を撮る

初回のみ Chromium のダウンロードが必要:

```sh
bunx playwright install chromium                         # 初回のみ
bun --filter snapcrop build-storybook                    # 静的ビルド
python3 -m http.server 6006 --directory apps/snapcrop/storybook-static &
bun --filter snapcrop test-storybook
```

### 2. R2 と比較する

[regconfig.json](../../regconfig.json) はリポジトリルートに置いている。R2 の
S3 互換 API トークンを発行し、[.env.example](../../.env.example) を `.env.local`
にコピーして実値を埋める (`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` は AWS
SDK v3 が拾う標準名)。

`R2_PUBLIC_URL` には R2 ダッシュボードでバケットの「Public R2 dev URL」を有効化
して得られるホスト `pub-<hash>.r2.dev` を **プロトコル (`https://`) を付けずに**
入れる。reg-publish-s3-plugin は customDomain を `https://<customDomain>/...` の
形で組み立てるので、`https://` を含めると `https://https://...` になってリンクが
壊れる。これがないと reg-suit が出すレポート URL が AWS S3 のホスト
(`https://<bucket>.s3.amazonaws.com/...`) で組まれてしまい、ブラウザからアクセス
できない。

リポジトリルートで:

```bash
set -a; source .env.local; set +a
bun run vrt:run                                          # = reg-suit run
```

reg-suit が:

1. `reg-keygen-git-hash-plugin` で base コミット (= main の HEAD) の hash を算出
2. R2 から base コミットの expected 画像を fetch
3. `__screenshots__/` の actual 画像と比較し、`thresholdRate: 0` で 1 ピクセルでも
   差分があれば failure として扱う
4. 比較結果と HTML レポートを R2 に publish

初回はベース画像が R2 に無いため、4 枚すべてが新規追加 (New items: 4) として
扱われる。次回以降の比較から差分検知が機能する。

## 構成

- React Router 7 (SPA mode, `ssr: false`)
- Vite 7 + Tailwind 4
- Cloudflare Workers (Static Assets only, no Worker code)

`build/client` を Static Assets として配信し、未知のパスは `index.html` に
フォールバック (`assets.not_found_handling: "single-page-application"`) する
ことでクライアントサイドルーティングが効く。
