# DESIGN.md

Hidoko の UI を作るときに参照する、ブランドと視覚言語の単一仕様。実装は [packages/ui](packages/ui)、コードを書くときの規約は [AGENTS.md](AGENTS.md)。ここはその「どう見えるべきか」を定義する。

## Visual Theme & Atmosphere

「火床（ひどこ）」とは、焚き火の中心にある熾火（おきび）が静かに燃え続ける場所。派手な炎ではなく、長く・深く・静かに熱を保ち続けるもの。

Hidoko の UI もそうあってほしい。ダークモードを基調に、深い夜のような落ち着きと、焚き火のオレンジ・赤の暖かさを共存させる。過剰な装飾はせず、コードのように引き算で整える。

### Brand identity

| | |
|---|---|
| **名前** | 火床（Hidoko / ひどこ） |
| **由来** | 焚き火の燃料が積まれ、熾火が眠る土台。静かに熱を保ち続ける場所。 |
| **役割** | 個人プロジェクトの傘ブランド。複数のプロダクトを束ねる。 |
| **対象** | 開発者本人、および同じ温度感を共有するユーザー。 |
| **核となる感情** | 静かな熱量、夜の安心感、手仕事の精度、長く続く灯。 |

### Keywords

焚き火 / 熾火 / 夜 / 暖 / 静けさ / 精度 / コード / 引き算 / 長く灯る

## Color Palette & Roles

ダークが基準。「夜の焚き火」が初期状態。ライトモードも `<html class="light">` で提供するが、Hidoko らしさはダークで最も強く出る。

具体値は [packages/ui/src/tokens.css](packages/ui/src/tokens.css) が単一の真実源。ここでは命名と役割だけ示す。

### Primitive: 中性色（炭・夜）

`--ink-{0..900}`。`--ink-0` が最も深い闇、`--ink-900` がオフホワイト。純白 `#ffffff` は使わない。焚き火の光はわずかに黄色みを帯びるから。

### Primitive: 焚き火色（炎・熾火）

`--ember-{50..900}`。`--ember-400` (#f47d3a) がブランドの指紋。リンク・主要 CTA・フォーカスリング・ロゴで使う。「強調っぽいから」とむやみに広げない。

### Primitive: 補助色

| トークン | 役割 |
|---|---|
| `--smoke` | 煙のグレー。`--ink` だけだと寒くなる場面で。 |
| `--moss` | 苔・成功状態。鮮やかな緑は使わない。 |
| `--moon` | 月の青白。情報メッセージ。 |
| `--rust` | 鉄錆色。エラー・破壊操作。 |

すべて彩度を抑え、ダーク背景に乗せても刺さらないよう調整済み。鮮やかな原色は焚き火の温度感に合わない。

### Semantic roles

UI から触るのは原則こちらのセマンティック層。原始トークンは「セマンティックを定義する側」だけが触る。

- 背景: `--bg-0` / `--bg` / `--bg-raised` / `--bg-overlay` / `--bg-sunken`
- ボーダー: `--border` / `--border-strong` / `--border-subtle`
- テキスト: `--text` / `--text-strong` / `--text-muted` / `--text-faint` / `--text-on-ember`
- アクセント: `--accent` / `--accent-hover` / `--accent-active` / `--accent-soft`
- 状態: `--success` / `--info` / `--warning` / `--danger`
- chart: `--chart-{1..5}` (recharts categorical 用、`--ember-400` を chart-1 に固定)

### shadcn variable mapping

[packages/ui/src/styles.css](packages/ui/src/styles.css) が shadcn の `--background` / `--foreground` / `--primary` / `--sidebar-*` / `--chart-*` 等を上記セマンティック層にブリッジする。`<html class="dark|light">` の切替だけで shadcn コンポーネントの配色も追従する。

## Typography Rules

### 和文フォント

LINE Seed JP（400 / 700）。本文の標準ウェイトは 400、見出しは 700。

### 欧文フォント

Inter（400 / 500 / 600 / 700）。代替字形 `cv11` `ss01` を有効化して `a` `g` のかたちを手書きに近づける。

### 等幅フォント

JetBrains Mono（400 / 500）。コード・数値・キーボードショートカット・`.hi-mark` ラベルで使う。

### Font-family stack

```css
--font-sans:
  "Inter", "LINE Seed JP",
  system-ui, -apple-system, "Segoe UI",
  "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic UI", "Meiryo",
  sans-serif;
--font-mono:
  "JetBrains Mono", "SF Mono", ui-monospace, Menlo, Consolas, monospace;
```

Inter を先頭に置いて欧文を Inter で描画させ、和文は LINE Seed JP にフォールバック。これで和欧混植時の見た目を揃える。

### Scale

1.250 (Major Third) で 12px → 88px までの 10 段。`--text-xs` (12) / `--text-sm` (14) / `--text-base` (16) / `--text-lg` (18) / `--text-xl` (22) / `--text-2xl` (28) / `--text-3xl` (36) / `--text-4xl` (48) / `--text-5xl` (64) / `--text-6xl` (88)。

本文は `--text-base` (16px / line-height 1.7)。和文の標準。

### Kinsoku & font-feature-settings

`body` で `font-feature-settings: "palt", "cv11", "ss01"` を適用。

- `"palt"` — 約物詰め。括弧や句読点が間延びしない（和文）。
- `"cv11"`, `"ss01"` — Inter の代替字形（欧文）。

行頭・行末禁則はブラウザデフォルトに任せる。本文の最大行幅は `--width-prose` (`68ch`、和文では約 32 文字)。

## Component Stylings

実装は shadcn/ui ベース。[packages/ui/src/components/](packages/ui/src/components/) に揃っている。新規コンポーネントを作る前に、shadcn registry にあるものは必ず [packages/ui](packages/ui) から取る。

### Buttons

- 主要 CTA は `<Button>` の `variant="default"`（`--accent` 背景）。1 画面に 1 つを基本に。
- 副次は `variant="outline"` か `variant="ghost"`。
- 破壊操作は `variant="destructive"`（`--danger`）。
- 角丸は `--radius-md` (6px) 標準。`--radius-full` でボタンを丸めない。

### Forms & Inputs

- ラベルは要素の上、補助テキストは下。両方とも `<Field>` でグルーピング。
- フォーカスリングは `--accent` のグロー (`--glow-ember`)。アウトラインの色付き枠は使わない。
- バリデーションエラー時のみボーダーを `--danger` に。

### Cards & Surfaces

- カード背景は `--bg-raised`、ボーダーは `--border-subtle`、影は `--shadow-card`。
- 上に重なる面（メニュー / ポップオーバー）は `--bg-overlay` + `--shadow-pop`。

### Badges, Tags, Kbd

- セマンティック色（`--accent` / `--moss` / `--moon` / `--rust`）に `color-mix` で透過を効かせて柔らかく出す。
- `<kbd>` は等幅フォント + `--bg-sunken` 背景。

### Iconography

[Lucide](https://lucide.dev) を採用。線画・細め・モダン。和の温度感に合うのは、太い塗りつぶしより、燃えさしのような細い線。

- 線の太さは `stroke-width: 1.75` を標準に。Lucide のデフォルト 2 だと、和文と並べたとき少し太い。
- 装飾的乱用はしない。意味のあるところに、1 セクションに 1 つ。
- 絵文字 🔥 の代わりに Lucide の `flame` をアクセント色で。

頻出: `flame` `sparkles` `hexagon` `terminal` `code` `git-branch` `folder` `book-open` `compass` `moon` `sun-dim` `clock` `arrow-up-right` `arrow-right` `chevron-right` `plus` `check` `x`

## Layout Principles

### Spacing

4px ベースのスケール `--space-{0..10}`（0 → 128px）。

- セクション間: `--space-9` (96px) 以上
- 要素間: `--space-4`〜`--space-6` (16〜32px)
- 行内ガター: `--space-2`〜`--space-3` (8〜12px)

### Radius

派手にしない。焚き火台のように、少しだけ角を落とす。

| トークン | サイズ | 用途 |
|---|---|---|
| `--radius-md` | 6px | 標準（ボタン、入力、バッジ） |
| `--radius-lg` | 10px | カード |
| `--radius-xl` | 16px | モーダル、大きなパネル |
| `--radius-full` | 9999px | 円形バッジ・アバターのみ。ボタンには使わない。 |

### Grid & widths

- マーケサイトの最大幅: `--width-wide` (1240px)
- アプリの最大幅: `--width-app` (1440px)
- 本文の最大行幅: `--width-prose` (68ch)

## Depth & Elevation

ダーク UI で `box-shadow` の黒は効かない。代わりに「わずかに上から差す光」と「炎のグロー」で立体感を出す。

| トークン | 役割 |
|---|---|
| `--shadow-rim` | リム光。カード上端の 1px ハイライト。 |
| `--shadow-card` | カードの基本影。黒の落ち影 + リム光。 |
| `--shadow-pop` | ポップオーバー / メニューの強い影。 |
| `--glow-ember-soft` | ヒーロー周辺の柔らかいグロー。 |
| `--glow-ember` | フォーカスリング。 |
| `--glow-ember-strong` | 主要 CTA フォーカス時。 |

純黒 `rgba(0,0,0,1)` を直書きしない。トークンを必ず経由する。

### Embers — `<hi-embers>`

火の粉アニメーションの Web Component。`import "ui/embers"` で `customElements` に登録される。

```html
<hi-embers density="36" wind="0.04"></hi-embers>
```

- 親に `position: relative` 必須。
- 装飾。意味のあるところだけに（LP ヒーロー、扉スライド、待機画面など）。
- `density="60"` 程度から。それ以上はうるさい。
- 1 画面 1 つまで。連続で並べない。

## Do's and Don'ts

### Do

- ダーク基準で組み、ライトは依頼時のみ
- `--ember-400` をブランドの指紋として、CTA / リンク / フォーカス / ロゴに集中させる
- セマンティックトークン（`--bg` / `--text` / `--accent` ...）越しに色を参照する
- `gap` で要素間隔を取る（margin で詰めない）
- 視覚で意味を伝えたら、`aria-*` で非視覚チャネルにも届くか確認する

### Don't

- 純白 `#ffffff` / 純黒 `#000000` を直書きしない（`--ink-900` / `--ink-0` を使う）
- 鮮やかな緑・青を `--moss` / `--moon` 以外で使わない
- グラデーションを乱用しない（`--ember` 内の控えめなグラデは OK）
- 影に `rgba(0,0,0,1)` を直書きしない
- ボタンを `--radius-full` で丸めない
- 絵文字を装飾で使わない（火モチーフでも 🔥 は禁則）
- `<div onClick>` で操作要素を作らない（`<button>` を使うか `role` / `tabIndex` / キーハンドラを補う）
- 「〜です！」「最高」「革命的」「あなたの〜」のコピーを使わない

### Voice & content

- 短文・体言止めを多用。装飾語を削る。
- 一人称は不要。プロダクトに語らせる。
- 句点は半分くらい省く。
- 数字は半角、単位は詰める（`12 件` ではなく `12件`）。

❌ 革命的なタスク管理ツールが登場！
✅ 静かに燃える、タスク管理

❌ 私たちは、開発者の皆様のために、最高の体験を提供することを目指しています。
✅ 開発者の手元に置く道具。長く使える、薄い体験を作る。

## Responsive Behavior

- ブレークポイントは Tailwind デフォルト（`sm` 640 / `md` 768 / `lg` 1024 / `xl` 1280 / `2xl` 1536）に従う。専用トークンは持たない。
- ヒーローやセクションパディングのような「画面幅に追従させたい余白」は `clamp(min, vw, max)` で書く（例: `apps/homepage` の `--ykz-pad: clamp(20px, 4vw, 56px)`）。
- 画像・SVG は `width: 100%; height: auto` を基本に。`<hi-embers>` のような absolute 要素は親側に `position: relative` を明示する。
- タッチ環境では `:hover` を当てにしない。`:focus-visible` と `:active` で状態を出す。

## Agent Prompt Guide

エージェントが Hidoko の UI を作るときに、最低限プロンプトに織り込んでほしい指示:

> Hidoko のブランドに合わせる:
> - ダーク基準（`<html class="dark">`）。ライトは指定がなければ作らない。
> - 配色は [packages/ui/src/tokens.css](packages/ui/src/tokens.css) のセマンティックトークン（`--bg` / `--text` / `--accent` / `--border` / `--moss` / `--rust` 等）越しに指定する。原始トークン（`--ink-*` / `--ember-*`）は基本触らない。
> - 主要 CTA / リンク / フォーカスリング / ロゴだけに `--accent` (`--ember-400`) を使う。それ以外には広げない。
> - shadcn/ui コンポーネントは [packages/ui](packages/ui) から `import { Button } from "ui/components/button"` の形で取る。自前で書かない。
> - 角丸は `--radius-md` (6px) 標準。ボタンを `--radius-full` で丸めない。
> - 絵文字は使わず、Lucide アイコンを `--accent` で。1 セクションに 1 つまで。
> - 純白 / 純黒は使わない。`--ink-900` / `--ink-0` を使う。
> - コピーは体言止め・短文。「最高」「革命的」「〜です！」「あなたの〜」は禁句。

新しい画面を作る前に、隣接画面（同じ apps/* 内の他ページ）を一度開いて、エラー表示・空状態・ローディング・遷移パターンの既存の約束事を引き継ぐ。違う挙動を入れるなら「なぜ違うか」を言語化する。
