---
name: implementing-pull-request
description: hidoko 用。PR の URL を受け取り、現在の状態（初回実装・継続開発・レビュー対応）を判別して実装を進め、セルフレビュー・コミット・プッシュ・CI 通過・description 最新化・CodeRabbit 対応まで完走する。冪等。
argument-hint: <PR URL>
---

# PR ベースの自律開発（hidoko 版）

What は PR の description に書かれている。自分が担うのは How — どう実装するかの判断と実行。何度実行しても安全。初回実装・継続開発・レビュー対応を自動判別して、PR を前に進める。

前提: `gh` がインストール・認証済みであること。

## Step 1: PR の現在状態を読み取る

```bash
gh pr view <PR_URL> --json title,body,url,number,headRefName,isDraft
gh pr checks <PR_URL>
gh pr diff <PR_URL>
```

description から Why / What / Done / 制約を把握し、CI の状態・既存の実装進捗・未対応のレビューコメントを確認する。未対応の CodeRabbit コメントの検出方法は [responding-to-coderabbit](../responding-to-coderabbit/SKILL.md) を参照。

## Step 2: リポジトリルールを読み込む

実装方針を立てる前に必ず読む。

- [AGENTS.md](../../../AGENTS.md) と [CLAUDE.md](../../../CLAUDE.md)
- 編集対象に該当する [.claude/rules/](../../rules/) のファイル
- UI を触るなら [DESIGN.md](../../../DESIGN.md)

ここに書かれた規約に違反した状態で push しない。

## Step 3: 今やるべきことを判断・実装する

- **初回実装**: What に対してコードがまだない → 既存の類似実装・再利用できる共通コンポーネントを探索してから計画を立てる
- **継続開発**: 途中まで実装済み → description と現在の diff を比較して残作業を特定する
- **レビュー対応**: 未対応コメントがある → [responding-to-coderabbit](../responding-to-coderabbit/SKILL.md) の手順で対応する

実装の進め方:

- 1 つの論理的変更を 1 コミットにする。典型は「リファクタ（準備）→ 機能実装 → テスト・story 追加」の順。計画の粒度がそのままコミット分割になり、レビュアーが上から読んで変更のストーリーを追える順序にする。
- 各コミット前に `bun run preflight` を通す。UI コンポーネントを足したら story も書く（[.claude/rules/storybook.md](../../rules/storybook.md)）。
- スコープの逸脱に気づいたら立ち止まる。影響範囲内の小さい改善は実装して「やったこと」に記載、大きい変更（新 API・データモデル変更・別画面への影響）はユーザーに確認してから。

## Step 4: セルフレビューを通す（push 前）

push 前に code-review スキル（または同等の観点での自己点検）で自分の差分をレビューし、リポジトリ規約違反・バグ・a11y・セキュリティに該当する指摘を 0 にしてから push する。命名・設計論などの non-blocker は、修正するか「やらなかったこと」に明記するかを判断する。

typo 修正や 1〜2 行の変更ではスキップしてよい。

## Step 5: 終了条件を満たす

以下のすべてを満たすまで完了しない。

1. **コミット・プッシュ** — 未コミットの変更を残さない。diverged していたら `git pull --no-rebase` → 再 push。
2. **CI 通過** — `gh pr checks <PR_URL> --watch`。落ちたら、自分の変更由来かをローカル再現で切り分けて修正する。main 由来と確定したらユーザーに報告して判断を仰ぐ。
3. **description 最新化** — `gh pr edit` で「やったこと」「やらなかったこと」「確認方法」を現状に合わせて上書きする（履歴は積まない）。UI 変更があればキャプチャの Before/After を埋める。Why は基本変えない。
4. **レビューコメント対応済み** — CodeRabbit を含む全コメントに修正または返信が済んでいる。
5. **Draft 解除** — Done 条件を満たし CI が緑なら `gh pr ready <PR_URL>` で Ready for review にする。

## 取り消し不能アクションの取り扱い

`git push --force` / `git reset --hard` / ブランチ削除 / PR の merge・close・approve はユーザー実行が原則。必要そうな状況ではコマンド文字列を提示して「ご自身で実行してください」と返す。

GitHub に投稿するコメントの末尾には `_🤖 by Claude Code_` を付ける。
