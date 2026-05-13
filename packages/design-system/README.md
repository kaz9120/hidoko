# design-system

Hidoko の **ブランド層**。色・タイポ・余白・影などの CSS 変数、Web フォント、火床マーク、火の粉アニメーションを束ねる。

「火床（ひどこ）」は焚き火の中心で熾火（おきび）が静かに燃え続ける場所。派手な炎ではなく、長く・深く・静かに熱を保つもの。このパッケージは、その温度感を CSS とアセットに落とし込んだもの。

実 React コンポーネントは [packages/ui](../ui) に分けてある。ここはトークンとアセット**だけ**。

## このパッケージに入っているもの

| ファイル | 役割 |
|---|---|
| [`tokens.css`](tokens.css) | 全ての CSS 変数。色 / タイポ / 余白 / 角丸 / 影 / chart 系列 / レイアウト / トランジション。`:root` がダーク基準、`.light` で反転。`fonts.css` を内部で `@import` する。 |
| [`fonts.css`](fonts.css) | Inter / LINE Seed JP / JetBrains Mono の `@font-face` 宣言。`tokens.css` 経由で読み込まれるので、利用側で個別に import する必要はない。 |
| [`components.css`](components.css) | 素の HTML 用のスタイルキット (`.hi-btn` / `.hi-card` / `.hi-input` 等の BEM クラス)。React + shadcn を使うアプリでは不要。Web Component やプレーン HTML を組むときだけ使う。 |
| [`components/embers.js`](components/embers.js) | `<hi-embers>` Web Component。火の粉が舞うキャンバスアニメーション。`import "design-system/embers"` の副作用で `customElements` に登録される。 |
| [`assets/logo/mark-cream.svg`](assets/logo/mark-cream.svg) | 紙 / クリーム背景用のフルカラーマーク。favicon / ライト UI 用。 |
| [`assets/logo/mark-dark.svg`](assets/logo/mark-dark.svg) | 夜 / ダーク背景用のフルカラーマーク。 |

## 使い方

`workspace:*` で依存に入れる:

```json
{ "dependencies": { "design-system": "workspace:*" } }
```

CSS から:

```css
@import "design-system/tokens.css";
/* 必要なら */
@import "design-system/components.css";
```

ロゴ / 火の粉:

```ts
import markCreamUrl from "design-system/assets/logo/mark-cream.svg?url";
import markDarkUrl  from "design-system/assets/logo/mark-dark.svg?url";
import "design-system/embers"; // <hi-embers> を登録
```

`<hi-embers>` は `density` (粒数) / `wind` (横流れ) / `hue` (色相シフト) / `glow` (背景グロー on/off) を属性で受ける:

```html
<hi-embers density="36" wind="0.04"></hi-embers>
```

親は `position: relative` 必須。装飾なので 1 画面 1 つまで。

## ブランドの根っこ

| | |
|---|---|
| **名前** | 火床（Hidoko / ひどこ） |
| **由来** | 焚き火の燃料が積まれ、熾火が眠る土台。静かに熱を保ち続ける場所。 |
| **役割** | 個人プロジェクトの傘ブランド。複数のプロダクトを束ねる。 |
| **核となる感情** | 静かな熱量、夜の安心感、手仕事の精度、長く続く灯。 |

### Hidoko らしくないもの

- 過剰な笑顔の絵文字、「ワクワク」を煽るマーケコピー
- 鮮やかすぎるネオン、純粋なホワイト背景の眩しい UI
- 太く重い display フォント、装飾だけのイラスト
- AI っぽい多色グラデーション、丸いカードに左ボーダー、モヤッとしたガラス効果

## 守るべき原則

このトークン群を呼び出して何かを作るときは、以下を守る。

1. **ダークが基準** — 何もなければ `tokens.css` のダーク設定をそのまま使う。ライトは依頼時のみ。
2. **`--ember-400` (#f47d3a) はブランドの指紋** — 主要 CTA、リンク、フォーカス、ロゴで使う。「強調っぽいから」とむやみに広げない。
3. **純白・純黒は使わない** — `--ink-900` / `--ink-0` を使う。焚き火の光はわずかに黄色い。
4. **影より光** — `box-shadow` の黒で立体を作らない。`--shadow-rim` のリム光と `--glow-ember-soft` のグローを使う。
5. **角丸は控えめ** — 標準は `--radius-md` (6px)。大きなパネルでも `--radius-xl` (16px) まで。ボタンを `--radius-full` で丸めない。
6. **絵文字は禁則** — 火モチーフでも 🔥 は使わない。アイコンは [Lucide](https://lucide.dev) の `flame` をアクセント色で。意味のあるところに 1 つだけ。
7. **コピーは体言止め・短文** — 「〜です！」「最高」「革命的」「あなたの〜」は禁句。
8. **彩度の高い緑・青を使わない** — 緑は `--moss`、青は `--moon` だけ。鮮やかな原色は焚き火の温度感に合わない。

## トークンの構造

### 色

`--ink-{0..900}` (中性 / 炭・夜) と `--ember-{50..900}` (焚き火) の 2 系統が原始トークン。`--smoke` / `--moss` / `--moon` / `--rust` が補助色。

これらをセマンティックトークンに束ねる:

- 背景: `--bg-0` / `--bg` / `--bg-raised` / `--bg-overlay` / `--bg-sunken`
- ボーダー: `--border` / `--border-strong` / `--border-subtle`
- テキスト: `--text` / `--text-strong` / `--text-muted` / `--text-faint` / `--text-on-ember`
- アクセント: `--accent` / `--accent-hover` / `--accent-active` / `--accent-soft`
- 状態: `--success` / `--info` / `--warning` / `--danger`
- chart: `--chart-{1..5}` (recharts categorical 用、`--ember-400` を chart-1 に固定)

UI は基本セマンティック側を参照し、原始トークンは「セマンティックを定義する側」だけが触る。

### タイポ

- `--font-sans` (Inter + LINE Seed JP) / `--font-mono` (JetBrains Mono)
- スケール `--text-xs` (12) → `--text-6xl` (88)、1.250 (Major Third)
- `font-feature-settings: "palt", "cv11", "ss01"` を `body` で適用済み (約物詰め + Inter 代替字形)

### 余白 / 角丸 / 影

- 余白は 4px ベース `--space-{0..10}`
- 角丸は `--radius-{xs|sm|md|lg|xl|2xl|full}`
- 影は黒の落ち影ではなく、リム光 (`--shadow-rim`) と炎のグロー (`--glow-ember-soft` / `--glow-ember` / `--glow-ember-strong`) で立体を作る

具体値は [`tokens.css`](tokens.css) が単一の真実源。ここでは複製しない。

## ライト / ダーク切り替え

`:root` がダーク。ライトモードは `<html class="light">` または `<html data-theme="light">` で有効化される。`.light` 側では:

- 背景 / ボーダー / テキストを紙の温度感 (`#fbf8f0` 系) に差し替え
- アクセントを `--ember-500` (やや深め) にシフト
- chart-1 を `--ember-500`、chart-2 を `--moon` と `--ink-900` の color-mix に置換 (`--moon` がライト背景に埋没するため)
- 影を黒の薄い落ち影と白のリム光に置換

[packages/ui](../ui) の `Button` / `Card` 等は、shadcn の `--background` / `--foreground` 等をこのセマンティック層に紐付けて解決している。
