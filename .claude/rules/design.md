---
paths:
  - "DESIGN.md"
  - "**/*.css"
---

# デザイントークンと DESIGN.md の運用

ブランドと視覚言語の単一仕様は [DESIGN.md](../../DESIGN.md)。色・タイポ・レイアウト・コンポーネント方針・Do/Don't・エージェント向け指示プロンプトまで、ここに集約している。

- DESIGN.md は [Stitch DESIGN.md spec (alpha)](https://stitch.withgoogle.com/docs/design-md/specification/) に準拠する。YAML frontmatter にトークン (colors / typography / rounded / spacing / components) を、本文に人間向けの理屈を書く。
- `bun run design:lint` で構造的妥当性 (token reference 解決 / WCAG コントラスト / セクション順序 等) を検証でき、CI でも自動チェックされる。新しいトークンを足すときは必ず lint を通す。
- CSS では生のカラーコードを直書きせず、`packages/ui/src/tokens.css` のトークン経由で参照する。
- ブランドの「らしくないもの」を持ち込まない: 純白 `#ffffff` を使わない、彩度の高い緑・青は避ける、絵文字を装飾で使わない。詳細は DESIGN.md の Do/Don't を参照。
