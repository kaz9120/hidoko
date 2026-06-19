@AGENTS.md

# Claude Code 向けの追加指示

## Claude が触らない 2 つだけ

- `main` への直接 push（必ず PR 経由）
- release-please のリリース PR の merge / 編集（auto-merge の仕組みに任せる）

これ以外は全部自分で実行する。`--no-verify` で hook をスキップするのは禁止（hook が落ちたら原因を直す）。
