# packages/ui

Hidoko の `apps/*` で共有する UI 基盤。design tokens、shadcn/ui コンポーネント、ロゴアセット、火の粉アニメーションを 1 つの workspace パッケージに束ねている。

ブランドの「どう見えるべきか」を仕様化したのは [DESIGN.md](../../DESIGN.md)。このパッケージはその実装。

## 中身

```
packages/ui/
├── assets/logo/
│   ├── mark-cream.svg     # 紙 / クリーム背景用 (favicon / ライト UI)
│   └── mark-dark.svg      # 夜 / ダーク背景用
└── src/
    ├── tokens.css         # 全 CSS 変数 (色 / タイポ / 余白 / 角丸 / 影 / chart)
    ├── fonts.css          # Inter / LINE Seed JP / JetBrains Mono の @font-face
    ├── styles.css         # tokens.css → shadcn CSS 変数のブリッジ
    ├── embers.js          # <hi-embers> Web Component (火の粉アニメ)
    ├── embers.d.ts
    ├── components/        # shadcn/ui の React コンポーネント
    ├── hooks/             # shadcn 付属の hooks
    └── lib/utils.ts       # cn() ユーティリティ
```

`tokens.css` が単一の真実源。`:root` がダーク基準、`.light` がライト。shadcn の `--background` / `--foreground` / `--primary` / `--sidebar-*` / `--chart-*` は `styles.css` 経由でこのトークンに紐付く。

## 使い方

アプリ側の `package.json` に `"ui": "workspace:*"` を追加し、`app/globals.css` で次を読み込む:

```css
@import "tailwindcss" source(".");
@source "../../../packages/ui/src";
@import "ui/tokens.css";
@import "ui/styles.css";
```

`@source` で Tailwind のスキャン範囲を packages/ui まで広げるのを忘れない。

### コンポーネント

subpath で import するのが基本:

```tsx
import { Button } from "ui/components/button";
import { Dialog, DialogContent, DialogTrigger } from "ui/components/dialog";
import { cn } from "ui/lib/utils";
```

`Button` / `Toaster` / `Tooltip` 系 / `Toggle` 系 / `cn` だけは互換のため `ui` 直下からも import できる:

```tsx
import { Button, TooltipProvider } from "ui";
```

### ロゴ

```tsx
import markCreamUrl from "ui/assets/logo/mark-cream.svg?url";
import markDarkUrl from "ui/assets/logo/mark-dark.svg?url";
```

### 火の粉アニメーション

`import "ui/embers"` の副作用で `<hi-embers>` が `customElements` に登録される:

```tsx
import "ui/embers";

<hi-embers density={36} wind="0.04" />;
```

属性: `density` (粒数, デフォルト 50) / `wind` (横流れ, デフォルト 0) / `hue` (色相シフト, デフォルト 0) / `glow` (背景グロー on/off)。

親に `position: relative` 必須。1 画面 1 つまで。詳細運用は [DESIGN.md](../../DESIGN.md) の Depth & Elevation 節。

## コンポーネント追加

新しい shadcn コンポーネントが必要になったら、リポジトリルートで:

```sh
bunx shadcn@latest add <name> --cwd packages/ui
```

`apps/*` 配下では絶対に add しない (再び分散する)。

## 最新化

shadcn は package ではないので Renovate では追えない。手動で同期する。

```sh
bun run ui:diff   # 何が変わるか確認 (dry-run)
bun run ui:sync   # 全コンポーネントを最新版で上書き
```

上書きで困らないよう、**packages/ui 配下のコンポーネントを手で編集しない**。挙動を変えたいときは:

1. shadcn 本家の議論 / PR をウォッチして取り込まれるのを待つ
2. それでも必要なら app 側で wrap して差分を吸収する

## ルール

- shadcn registry にあるコンポーネントは必ずこのパッケージから取る (自前で書かない)
- `packages/ui/src/components/**` と `packages/ui/src/hooks/**` は **Biome 対象外**。shadcn 公式の lint 違反を毎回直したくないため
- shadcn 変数で tokens.css 側に対応するセマンティックトークンが無いもの (例: 新たに登場した `--sidebar-*` の派生) は shadcn デフォルトのまま仮置きしてよい。本格的に使うときは tokens.css にトークンを足して [src/styles.css](src/styles.css) で紐付け直す

## 既知の制約

- **react-day-picker は v9 系に固定**。shadcn の `calendar` コードが v10 の API に追従しておらず、`bunx shadcn add` が `react-day-picker@latest` (v10) を入れると typecheck が壊れる。`bun run ui:sync` で `react-day-picker` の版が `latest` に戻されたら、再度 `bun add react-day-picker@^9 --cwd packages/ui` で固定し直す
- `chart` / `sidebar` / `form` 等の依存が重いコンポーネントを使わないなら、それぞれの依存ライブラリ (`recharts` / `react-hook-form` / `zod` 等) は tree-shake で落ちる前提 (実 import がなければバンドルに乗らない)
