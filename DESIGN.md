---
version: alpha
name: Hidoko
description: >
  Dark-first design language for indie products. Bonfire warmth meets quiet,
  code-like minimalism. A single ember accent anchors the brand; deep ink
  neutrals recede into night; muted earth tones (smoke / moss / moon / rust)
  carry status meaning without competing with the accent.

colors:
  # Brand fingerprint — used for primary CTAs, links, focus rings, logo only.
  primary: "#f47d3a"   # ember-400
  # Slate neutral — used for borders, captions, metadata.
  secondary: "#7c8590" # smoke
  # Soft moss green — used for success / supplemental accent.
  tertiary: "#7a8c5e"  # moss
  # Page foundation. Dark by default; never pure black.
  neutral: "#13110e"   # ink-50
  # Card / raised surface.
  surface: "#1a1814"   # ink-100
  # Primary text on dark backgrounds. Warm off-white, never pure white.
  on-surface: "#ebe5d8" # ink-800
  # Destructive / error.
  error: "#b8503a"     # rust
  # Informational / moonlit blue-grey.
  info: "#c8d4e0"      # moon

typography:
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.7
    fontFeature: '"palt", "cv11", "ss01"'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.55
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.5
  headline-sm:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.02em
  headline-display:
    fontFamily: Inter
    fontSize: 88px
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: -0.02em
  mono-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55

rounded:
  sm: 4px
  md: 6px      # standard for buttons, inputs, badges
  lg: 10px     # cards
  xl: 16px     # modals, large panels
  full: 9999px # only for circular badges / avatars

spacing:
  xs: 4px
  sm: 8px
  md: 16px     # element gap baseline
  lg: 24px
  xl: 32px
  "2xl": 48px  # section padding lower bound
  "3xl": 96px  # section gap baseline

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#1a0d05"
    rounded: "{rounded.md}"
    padding: 10px
  button-primary-hover:
    backgroundColor: "#f8a05c"
    textColor: "#1a0d05"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: 10px
  button-destructive:
    # Darker than `error` (#b8503a) so on-surface text stays AA-compliant.
    # Implementation maps shadcn's --destructive to --rust; consider
    # darkening on the impl side too if destructive buttons land in product.
    backgroundColor: "#9a3210" # ember-700
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: 10px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: 24px
  input:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: 12px
  badge-info:
    backgroundColor: "{colors.info}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.md}"
    padding: 4px
  badge-success:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.md}"
    padding: 4px
  badge-muted:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.md}"
    padding: 4px
  # Inline form validation error text (no background → contrast not checked).
  field-error-text:
    textColor: "{colors.error}"
---

# Hidoko Design System

Hidoko の UI を作るときに参照する、ブランドと視覚言語の単一仕様。実装は [packages/ui](packages/ui)、コードを書くときの規約は [AGENTS.md](AGENTS.md)。本ドキュメントは [Stitch DESIGN.md spec (alpha)](https://stitch.withgoogle.com/docs/design-md/specification/) に準拠する。

`bun run design:lint` (= `bunx design.md lint DESIGN.md`) で検証できる。

## Overview

「火床（ひどこ）」とは、焚き火の中心にある熾火（おきび）が静かに燃え続ける場所。派手な炎ではなく、長く・深く・静かに熱を保ち続けるもの。Hidoko の UI もそうあってほしい。

ダークモードを基調に、深い夜のような落ち着きと、焚き火のオレンジ・赤の暖かさを共存させる。過剰な装飾はせず、コードのように引き算で整える。

| | |
|---|---|
| **名前** | 火床（Hidoko / ひどこ） |
| **由来** | 焚き火の燃料が積まれ、熾火が眠る土台。静かに熱を保ち続ける場所。 |
| **役割** | 個人プロジェクトの傘ブランド・デザインシステムの名前。複数のプロダクトを束ねる。アプリ表面に出すブランド名ではない。 |
| **対象** | 開発者本人、および同じ温度感を共有するユーザー。 |
| **核となる感情** | 静かな熱量、夜の安心感、手仕事の精度、長く続く灯。 |

キーワード: 焚き火 / 熾火 / 夜 / 暖 / 静けさ / 精度 / コード / 引き算 / 長く灯る。

> Hidoko は基盤・デザインシステムの名前であって、アプリ表面のブランド名ではない。アプリのユーザーに見える表記（UI / ページタイトル / OGP / フッター等）に「ひどこ／HIDOKO／火床」を出さない。アプリのブランドは個別アプリ名（snapcrop / note-ogp 等）と作者。詳細は [AGENTS.md](AGENTS.md) の「ひどことアプリの関係」を見る。

## Colors

ダークが基準。「夜の焚き火」が初期状態。ライトモードも `<html class="light">` で提供するが、Hidoko らしさはダークで最も強く出る。

frontmatter の値が単一の真実源。実装側のセマンティック層（`--bg` / `--text` / `--accent` 等）は [packages/ui/src/tokens.css](packages/ui/src/tokens.css) を参照。

- **Primary (`#f47d3a` / Bonfire Orange)** — ブランドの指紋。主要 CTA、リンク、フォーカスリング、ロゴだけに使う。「強調っぽいから」とむやみに広げない。
- **Secondary (`#7c8590` / Smoke)** — 煙のグレー。`--ink` だけだと寒くなる場面で。
- **Tertiary (`#7a8c5e` / Moss)** — 苔・成功状態。鮮やかな緑は使わない。
- **Neutral (`#13110e` / Ink Night)** — ページ背景の闇。純黒 `#000000` は使わない。焚き火の光はわずかに黄色みを帯びるから。
- **Surface (`#1a1814` / Charcoal)** — カード・raised パネルの面。
- **On-Surface (`#ebe5d8` / Warm Cream)** — 暗背景の上のテキスト。純白 `#ffffff` は使わない。
- **Error (`#b8503a` / Rust)** — 鉄錆色。エラー・破壊操作。
- **Info (`#c8d4e0` / Moonlit)** — 月の青白。情報メッセージ。

実装側には原始トークン (`--ink-{0..900}` / `--ember-{50..900}`) と、それを束ねたセマンティック層 (`--bg` / `--bg-raised` / `--accent` / `--accent-soft` / `--text` / `--text-muted` ...) がある。UI からは原則セマンティック側を参照し、原始トークンは「セマンティックを定義する側」だけが触る。詳細は [tokens.css](packages/ui/src/tokens.css)。

## Typography

- **和文**: LINE Seed JP（400 / 700）
- **欧文**: Inter（400 / 500 / 600 / 700）
- **等幅**: JetBrains Mono（400 / 500）

`font-family` スタックは Inter を先頭に、LINE Seed JP にフォールバックする一本の `--font-sans` にまとめる。これで和欧混植時の見た目を揃える。

スケールは 1.250 (Major Third) で 12px → 88px まで 10 段。本文は `body-md` (16px / line-height 1.7)。

`body` で `font-feature-settings: "palt", "cv11", "ss01"` を適用済み:

- `"palt"` — 約物詰め。括弧や句読点が間延びしない（和文）。
- `"cv11"`, `"ss01"` — Inter の代替字形（欧文）。`a` `g` のかたちが手書きに近づく。

行頭・行末禁則はブラウザデフォルトに任せる。本文の最大行幅は `68ch`（和文では約 32 文字）。タイトル等の太字は `fontWeight: 700`、本文は `400`、補助は `400` でフォントサイズを下げる。

## Layout

4px ベースのスペーシングスケール。

- セクション間: `3xl` (96px) 以上
- 要素間: `md`〜`lg` (16〜24px)
- 行内ガター: `xs`〜`sm` (4〜8px)

幅:

- マーケサイトの最大幅: 1240px (`--width-wide`)
- アプリの最大幅: 1440px (`--width-app`)
- 本文の最大行幅: 68ch (`--width-prose`)

レイアウトの「画面幅に追従させたい余白」は `clamp(min, vw, max)` で書く。`apps/homepage` の `--ykz-pad: clamp(20px, 4vw, 56px)` がその例。

## Elevation & Depth

ダーク UI で `box-shadow` の黒は効かない。代わりに「わずかに上から差す光」と「炎のグロー」で立体感を出す。

| トークン | 役割 |
|---|---|
| `--shadow-rim` | リム光。カード上端の 1px ハイライト。 |
| `--shadow-card` | カードの基本影。黒の落ち影 + リム光。 |
| `--shadow-pop` | ポップオーバー / メニューの強い影。 |
| `--glow-ember-soft` | ヒーロー周辺の柔らかいグロー。 |
| `--glow-ember` | フォーカスリング。 |
| `--glow-ember-strong` | 主要 CTA フォーカス時。 |

純黒 `rgba(0, 0, 0, 1)` を直書きしない。トークンを必ず経由する。

火の粉アニメーション `<hi-embers>` は `import "ui/embers"` で `customElements` に登録される。親に `position: relative` 必須、1 画面 1 つまで。属性: `density`（粒数）/ `wind`（横流れ）/ `hue`（色相シフト）/ `glow`（背景グロー on/off）。

## Shapes

派手にしない。焚き火台のように、少しだけ角を落とす。

- `sm` (4px) — 細かいバッジ
- `md` (6px) — 標準（ボタン、入力、バッジ）
- `lg` (10px) — カード
- `xl` (16px) — モーダル、大きなパネル
- `full` (9999px) — 円形バッジ・アバターのみ。**ボタンには使わない**

## Components

実装は shadcn/ui ベース、[packages/ui/src/components/](packages/ui/src/components/) に揃っている。新規コンポーネントを作る前に、shadcn registry にあるものは必ずこのパッケージから取る。

frontmatter に main variant の token を定義済み。それ以外の派生（hover / disabled / icon-only 等）は実装側 (shadcn `Button` の variant prop 等) に従う。

- **Buttons**: 角丸 `md`、主要 CTA は `button-primary`、副次は `button-secondary` / ghost、破壊操作は `button-destructive`。`full` で丸めない。
- **Forms & Inputs**: ラベルは要素の上、補助テキストは下。両方とも `<Field>` でグルーピング。フォーカスリングは `--accent` のグロー (`--glow-ember`)。バリデーションエラー時のみボーダーを `error` に。
- **Cards & Surfaces**: カード背景は `surface`、ボーダーは `--border-subtle`、影は `--shadow-card`。上に重なる面（メニュー / ポップオーバー）は `--bg-overlay` + `--shadow-pop`。
- **Badges**: セマンティック色 (`badge-info` / `badge-success` / `badge-muted`) を用意。実装側では `color-mix` で透過を効かせて柔らかく出す。`<kbd>` は等幅フォント + `--bg-sunken` 背景。
- **Iconography**: [Lucide](https://lucide.dev) を採用。線画・細め・モダン。`stroke-width: 1.75` を標準に（Lucide のデフォルト 2 だと和文と並べたとき少し太い）。装飾的乱用はしない。意味のあるところに、1 セクションに 1 つ。絵文字 🔥 の代わりに Lucide の `flame` をアクセント色で。

## Do's and Don'ts

### Do

- ダーク基準で組み、ライトは依頼時のみ
- `primary` をブランドの指紋として、CTA / リンク / フォーカス / ロゴに集中させる
- セマンティックトークン (`--bg` / `--text` / `--accent` ...) 越しに色を参照する
- `gap` で要素間隔を取る（`margin` で詰めない）
- 視覚で意味を伝えたら、`aria-*` で非視覚チャネルにも届くか確認する

### Don't

- 純白 `#ffffff` / 純黒 `#000000` を直書きしない（`on-surface` / `neutral` を使う）
- 鮮やかな緑・青を `tertiary` / `info` 以外で使わない
- グラデーションを乱用しない（`primary` 内の控えめなグラデは OK）
- 影に `rgba(0, 0, 0, 1)` を直書きしない
- ボタンを `full` で丸めない
- 絵文字を装飾で使わない（火モチーフでも 🔥 は禁則）
- `<div onClick>` で操作要素を作らない（`<button>` を使うか `role` / `tabIndex` / キーハンドラを補う）
- 「〜です！」「最高」「革命的」「あなたの〜」のコピーを使わない
- アプリのユーザーに見える箇所に「ひどこ／HIDOKO／火床」を出さない（基盤の名前であって、アプリ表面に出すブランド名ではない）

### Voice & content

- 短文・体言止めを多用。装飾語を削る。
- 一人称は不要。プロダクトに語らせる。
- 句点は半分くらい省く。
- 数字は半角、単位は詰める（`12 件` ではなく `12件`）。

❌ 革命的なタスク管理ツールが登場！ → ✅ 静かに燃える、タスク管理

❌ 私たちは、開発者の皆様のために、最高の体験を提供することを目指しています。 → ✅ 開発者の手元に置く道具。長く使える、薄い体験を作る。

## Responsive Behavior

(Stitch 仕様外の拡張セクション。)

- ブレークポイントは Tailwind デフォルト（`sm` 640 / `md` 768 / `lg` 1024 / `xl` 1280 / `2xl` 1536）に従う。専用トークンは持たない。
- ヒーローやセクションパディングのような「画面幅に追従させたい余白」は `clamp(min, vw, max)` で書く。
- 画像・SVG は `width: 100%; height: auto` を基本に。`<hi-embers>` のような absolute 要素は親側に `position: relative` を明示する。
- タッチ環境では `:hover` を当てにしない。`:focus-visible` と `:active` で状態を出す。

## Agent Prompt Guide

(Stitch 仕様外の拡張セクション。)

エージェントが Hidoko の UI を作るときに、最低限プロンプトに織り込んでほしい指示:

> Hidoko のブランドに合わせる:
>
> - ダーク基準（`<html class="dark">`）。ライトは指定がなければ作らない。
> - 配色は [packages/ui/src/tokens.css](packages/ui/src/tokens.css) のセマンティックトークン（`--bg` / `--text` / `--accent` / `--border` / `--moss` / `--rust` 等）越しに指定する。原始トークン（`--ink-*` / `--ember-*`）は基本触らない。
> - 主要 CTA / リンク / フォーカスリング / ロゴだけに `--accent` (`primary` = `#f47d3a`) を使う。それ以外には広げない。
> - shadcn/ui コンポーネントは [packages/ui](packages/ui) から `import { Button } from "ui/components/button"` の形で取る。自前で書かない。
> - 角丸は `rounded.md` (6px) 標準。ボタンを `rounded.full` で丸めない。
> - 絵文字は使わず、Lucide アイコンを `--accent` で。1 セクションに 1 つまで。
> - 純白 / 純黒は使わない。`on-surface` / `neutral` を使う。
> - コピーは体言止め・短文。「最高」「革命的」「〜です！」「あなたの〜」は禁句。

新しい画面を作る前に、隣接画面（同じ apps/* 内の他ページ）を一度開いて、エラー表示・空状態・ローディング・遷移パターンの既存の約束事を引き継ぐ。違う挙動を入れるなら「なぜ違うか」を言語化する。
