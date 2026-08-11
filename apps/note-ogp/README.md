# note-ogp

note のアイキャッチ画像（OGP, 1280×670 PNG）を作るブラウザ完結のエディタ。

写真 → タイトル → 組み の 3 手で完成する。文字色・スクリム・ハロ（黒淵の白）は写真の輝度から自動で決まるので、ユーザーは意匠の判断をしない。入力は localStorage に保存されてリロードしても残る。

## 中心概念

### 組み（kumi）

「タイトルの居場所」と「号数の身振り」をセットにした名前付きレイアウト。この 2 つを独立した軸として選ばせず、成立する 12 種だけを提供する。

UI では「レイアウト」と呼ぶ。`kumi` / `KUMI` / `KumiId` は内部識別子として残し、画面には出さない。下の表の `A1` `B1` のような記号も設計時の符牒なので、ユーザーには見せない（タイルは矩形だけを並べ、読み上げ名は `KUMI[id].name` を使う）。

| id | 名前 | タイトル | 号数 |
|---|---|---|---|
| a1 | A1 定番 | 左下 | 右上コーナー |
| b1 | B1 見出し | 上に横長 | 右下プレート |
| b7 | B7 上段右 | 右上・右揃え | 左下コーナー |
| c1 | C1 右柱 | 右に縦組み | 左端フィルム縁 |
| c11 | C11 中柱・判上 | 中央に縦組み | 柱の真上に判 |
| d5 | D5 扉 | 中央（マストヘッドも中央） | 下部中央の判 |
| d6 | D6 中央大判 | 中央 | 背景に巨大数字 |
| e7 | E7 重心外し | 中央左 | 右端フィルム縁 |
| f7 | F7 浮き帯 | 下部の半透明帯の中 | 帯の中の右側 |
| g7 | G7 目次風 | 左下一行 | 点線リーダーの先 |
| g10 | G10 対角巨大 | 左上 | 右下奥に巨大数字 |
| h1 | H1 静けさ | 写真の静かな面へ自動配置 | タイトルの尻に添える |

### 節目号（milestone）

10・25・50 のような節目のための別族。号数が主役になり、タイトルは左下に回る。M1 透かし / M2 主役 / M4 漢数字の 3 変奏。

### 自動インク計画

タイトル領域の平均輝度で 3 分岐する。0.45 未満はオフ白のまま、0.62 未満はスクリムを敷く、それ以上はハロ（黒淵の白）で浮かせる。輝度は写真を 64×34 に縮小した輝度マップから領域平均で取る。ユーザーが触るのは「スクリム: 自動 / 強制」だけ。

### 詰め

Google Fonts の Shippori Mincho は `palt` / `halt` が効かず、和文がすべて 1em のベタ組みになる。そのため詰めは CSS の機能指定に任せず、文字クラス（開き括弧・閉じ括弧・句読点・中点・小書き仮名・かな）ごとの負マージンをコード側で持つ。既定はポスター詰め。改行はユーザーが入れない。禁則つきの自動折り返しと、面積ベースの二分探索によるフォントサイズのフィットを台紙が持つ。

## 開発

```sh
bun --filter note-ogp dev               # ローカル開発サーバ
bun --filter note-ogp build             # 本番ビルド
bun --filter note-ogp deploy            # Cloudflare Workers にデプロイ
bun --filter note-ogp typecheck         # tsc --noEmit
```

Storybook は [apps/storybook](../storybook) に集約されている。台紙のカタログは `note-ogp/Templates/CoverV10`、組みセレクタは `note-ogp/Editor/KumiTiles`。

## 構成

- React Router 7 (SPA mode, `ssr: false`)
- Vite 7 + Tailwind 4
- [html-to-image](https://github.com/bubkoo/html-to-image) で `pixelRatio: 2` の 1280×670 PNG を書き出す
- Cloudflare Workers (Static Assets のみ、Worker コードなし)

`build/client` を Static Assets として配信し、未知のパスは `index.html` にフォールバックする。

### app/lib/og-templates

台紙まわりはこのディレクトリに閉じている。外から参照するときは必ず `index.ts` のバレル経由。

| ファイル | 役割 |
|---|---|
| `types.ts` | `Fields` と列挙値（組み 12 種・節目号 3 変奏・号の種類）。const 配列を単一ソースに型と runtime validator を派生させる |
| `cover-v10.tsx` | 台紙本体。組みの設計図 `KUMI`、自動インク計画、写真の背景、マストヘッド、号数部品、タイトルのフィット |
| `tsume.ts` | 文字クラス別の負マージンで詰めを組む。`TSUME` の 4 段階と `tsumeSpans` |
| `image-stats.ts` | 写真を 64×34 に縮小した輝度マップと平均色。領域平均と「静かな面」の探索 |
| `kanji-number.ts` | 節目号 M4 の漢数字変換（50 → 五十） |

状態の保存は [app/lib/storage.ts](app/lib/storage.ts)。shape が大きく変わったら保存キーを切る運用で、v10 は `hidoko-note-ogp:v4`。旧キーが残っていればテキストとプロフィールだけを引き継ぐ。
