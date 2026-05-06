# SKILL — 火床（Hidoko）デザインシステムを使うとき

このシステムを呼び出して何かを作るときは、以下を守る。

## 原則

1. **ダークが基準** — 何もなければ `tokens.css` のダーク設定をそのまま使う。ライトは依頼時のみ。
2. **`--ember-400` (#f47d3a) はブランドの指紋** — 主要 CTA、リンク、フォーカス、ロゴで使う。「強調っぽいから」とむやみに広げない。
3. **純白・純黒は使わない** — `--ink-900` / `--ink-0` を使う。焚き火の光はわずかに黄色い。
4. **影より光** — `box-shadow` の黒で立体を作らない。`--shadow-rim` のリム光と `--glow-ember-soft` のグローを使う。
5. **角丸は控えめ** — 標準は `--radius-md` (6px)。大きなパネルでも `--radius-xl` (16px) まで。
6. **絵文字は禁則** — 火モチーフでも絵文字 🔥 は使わない。Lucide の `flame` をアクセント色で。
7. **コピーは体言止め・短文** — 「〜です！」「最高」「革命的」「あなたの〜」は禁句。

## 必ず読み込むファイル

```html
<link rel="stylesheet" href="<root>/tokens.css"/>
<link rel="stylesheet" href="<root>/components.css"/>

<!-- アイコン -->
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
<script>lucide.createIcons();</script>

<!-- 火の粉（必要時のみ） -->
<script src="<root>/components/embers.js"></script>
```

`tokens.css` は内部で `fonts.css` を読み込むので、フォント import は不要。

## クラス命名

すべて `hi-` プレフィックス。コンポーネントは `hi-card`、修飾子は `hi-card--accent`、子要素は `hi-card__title`（BEM）。

## 火の粉アニメーション `<hi-embers>`

- 親に `position: relative` が必須。
- 装飾。意味のあるところだけに。LP ヒーロー、扉スライド、待機画面が標準。
- `density="60"` 程度から。それ以上はうるさい。
- 連続で複数並べない。1 画面 1 つ。

## やってはいけないこと

- グラデーション乱用（`--ember` 内のごく控えめなグラデは OK）
- 鮮やかな緑・青を `--moss` / `--moon` 以外で使う
- 影に純黒 `rgba(0,0,0,1)` を直書きする
- `display: flex` の代わりに余白で位置合わせする（`gap` を使う）
- アイコンの装飾的乱用（1 セクションに 1 つ）
- ボタンを丸くする（`--radius-full` のボタンは使わない）

## 推奨フロー

1. `previews/colors.html` `previews/type.html` を眺めて温度感を掴む
2. `previews/components.html` で使う部品を確認
3. `kits/landing.html` `kits/dashboard.html` を**コピーして改造**するのが最短
4. 新規パターンが必要なときだけ、新規にコンポーネントを作る

## index

- [`README.md`](README.md) — 全体ドキュメント（CONTENT FUNDAMENTALS / VISUAL FOUNDATIONS / ICONOGRAPHY）
- [`tokens.css`](tokens.css) / [`components.css`](components.css) / [`fonts.css`](fonts.css)
- `previews/` — Design System タブで確認する 5 枚
- `kits/` — 実用例（landing / dashboard / slides）
- `components/embers.js` — 火の粉
- `assets/logo-mark.svg` — ロゴマーク
