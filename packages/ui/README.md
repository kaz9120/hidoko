# packages/ui

Hidoko の `apps/*` で共有する shadcn/ui コンポーネント群。

> shadcn/ui は「インストールするライブラリ」ではなく「自分のリポジトリにコピーして自由に編集できるソース」が思想。だが Hidoko では複数アプリでブレを出したくないため、shadcn 由来のコードは **このパッケージに一元化** している。`apps/*` 側に shadcn 由来のコンポーネントを書かないこと。

## 位置づけ

- [packages/design-system](../design-system) は **ブランド層** (色・タイポ・ロゴ・トーン)
- このパッケージは **コンポーネント層** (React 実装、shadcn の写経)
- 橋渡し: [`src/styles.css`](src/styles.css) が design-system のセマンティックトークン (`--bg` / `--text` / `--accent` 等) を shadcn の CSS 変数 (`--background` / `--foreground` / `--primary` 等) にマッピングする

## 使い方

アプリ側の `package.json` に `"ui": "workspace:*"` を追加し、`app/globals.css` で次を読み込む:

```css
@import "tailwindcss" source(".");
@source "../../../packages/ui/src";
@import "design-system/tokens.css";
@import "ui/styles.css";
```

`@source` で Tailwind のスキャン範囲を packages/ui まで広げるのを忘れない。

コンポーネントは subpath で import するのが基本:

```tsx
import { Button } from "ui/components/button";
import { Dialog, DialogContent, DialogTrigger } from "ui/components/dialog";
import { cn } from "ui/lib/utils";
```

`Button` / `Toaster` / `Tooltip` 系 / `Toggle` 系 / `cn` だけは互換のため `ui` 直下からも import できる:

```tsx
import { Button, TooltipProvider } from "ui";
```

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
- design-system のトークンに対応しない shadcn 変数 (例: `--sidebar-*`) は shadcn デフォルトのまま仮置きしている。本格的に使うときは design-system 側にトークンを足して [src/styles.css](src/styles.css) で紐付け直す

## 既知の制約

- **react-day-picker は v9 系に固定**。shadcn の `calendar` コードが v10 の API に追従しておらず、`bunx shadcn add` が `react-day-picker@latest` (v10) を入れると typecheck が壊れる。`bun run ui:sync` で `react-day-picker` の版が `latest` に戻されたら、再度 `bun add react-day-picker@^9 --cwd packages/ui` で固定し直す
- `chart` / `sidebar` / `form` 等の依存が重いコンポーネントを使わないなら、それぞれの依存ライブラリ (`recharts` / `react-hook-form` / `zod` 等) は tree-shake で落ちる前提 (実 import がなければバンドルに乗らない)
