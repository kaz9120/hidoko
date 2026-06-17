@AGENTS.md

# Claude Code 向けの追加指示

## 実装タスクは shipping で完走させる

実装を頼まれたら、コードを書いて終わりにしない。PR を CI 緑・description 最新・全コメント解消・Draft 解除・マージ・ブランチ削除まで届ける。手順は `/shipping` に集約しているので、Issue URL / PR URL / タスク要件テキストを引数に投げ込むだけで完走まで進む。

明示されなくても、実装タスクは `/shipping` の流れで進める。「PR を作っていいですか」「マージしていいですか」とは聞かない。確認するのは新規実装で What/Done が確定できないときだけ。それ以外は取り消し不能アクション（force push / reset --hard / branch 削除 / PR の close / merge）も含めて自分で実行する。

hidoko は AI 駆動開発の最先端を試す実験場であり、業務リポジトリと同じ慎重さで動かさない。安全側に倒したい仕事は別のリポジトリでやる。

## Claude が触らない 2 つだけ

- `main` への直接 push（必ず PR 経由）
- release-please のリリース PR の merge / 編集（auto-merge の仕組みに任せる）

これ以外は全部自分で実行する。`--no-verify` で hook をスキップするのは禁止（hook が落ちたら原因を直す）。

## プロジェクトスキル

- `/shipping` — GitHub Issue / PR URL / タスク要件テキストを受け取り、PR をマージまで自律で届け切る。新規着手・継続開発・レビュー対応・Agentation のプレビューフィードバック対応を自動判別する
- `/autonomous-development` — ローカル常駐ループで Issue をポーリングし、AI が着手して良い Issue を 1 つ取って `/shipping` を回す。完走したら次の Issue を探す

`/shipping` は単発実行、`/autonomous-development` はそれをループで回すラッパー、という役割分担。普段の実装タスクは `/shipping` を使う。常駐運用したいときだけ `/autonomous-development` を起動する。
