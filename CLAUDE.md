@AGENTS.md

# Claude Code 向けの追加指示

## 実装タスクは PR まで完走する

実装を頼まれたら、コードを書いて終わりにしない。PR が CI を通過し、レビューに対応できる状態までを 1 つの仕事とする。

1. `main` から feature ブランチを切る。`main` に直接コミットしない。
2. 実装し、`bun run preflight` を通す。
3. 論理的変更ごとにコミットする（1 コミット 1 目的）。
4. push して `gh pr create` で PR を作る。description は [.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md) の構造で書く。
5. `gh pr checks <PR_URL> --watch` で CI を見届け、落ちたら直す。
6. CodeRabbit のレビューが付いたら `/responding-to-coderabbit` で対応する。

「PR を作っていいですか」とは聞かない。ユーザーに確認するのは、スコープが変わるとき・破壊的な操作が必要なときだけ。

## ユーザーが実行する操作

以下は提案にとどめ、Claude は実行しない。

- `git push --force` / `git reset --hard` / ブランチ削除
- PR の merge / close / approve
- `--no-verify` によるフックのスキップ

## プロジェクトスキル

- `/preparing-dev-task` — タスクを Why / What / Done に整理し、ブランチと Draft PR を作る
- `/implementing-pull-request` — PR の状態（初回実装・継続・レビュー対応）を判別して完走させる
- `/responding-to-coderabbit` — CodeRabbit の未解決コメントに修正・返信・resolve で対応する

スキルを明示されなくても、上の開発フローは常に適用する。
