---
name: responding-to-coderabbit
description: PR に付いた CodeRabbit のレビューコメントを取得し、妥当性を検証したうえで修正・返信・スレッド resolve まで行う。implementing-pull-request のレビュー対応フェーズからも使う。
argument-hint: <PR URL または番号>
---

# CodeRabbit レビュー対応

hidoko の CodeRabbit は assertive profile で、nitpick 込みで多めに指摘を出す設定（[.coderabbit.yaml](../../../.coderabbit.yaml)）。これは「AI が都度妥当性を検証してから直す」前提の運用なので、指摘を鵜呑みにして機械的に全部直さない。逆に、採用しない指摘を黙殺もしない — 理由を返信すれば CodeRabbit の learnings に蓄積され、次回以降の指摘が変わる。

## Step 1: 未解決スレッドを取得する

```bash
gh api graphql -f query='
  query($owner: String!, $repo: String!, $pr: Int!) {
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $pr) {
        reviewThreads(first: 100) {
          nodes {
            id
            isResolved
            path
            line
            comments(first: 20) {
              nodes { databaseId author { login } body url }
            }
          }
        }
      }
    }
  }' -f owner=<owner> -f repo=<repo> -F pr=<番号>
```

`isResolved: false` かつ最後のコメントが `coderabbitai` のスレッドが対応対象。PR 本文へのコメント（walkthrough 等）は `gh pr view --json comments` で見る。

## Step 2: 指摘を分類する

各指摘を妥当性検証してから 3 つに分類する。判断基準はリポジトリ規約（AGENTS.md / DESIGN.md / .claude/rules/）>「一般論のベストプラクティス」。

- **採用** — 指摘が妥当。修正する。
- **不採用** — hidoko の方針と合わない、誤検知、またはこの PR のスコープ外。理由を返信する。スコープ外のものは Issue 化を提案する。
- **質問・確認** — CodeRabbit からの問いかけ。コードの意図を答える。

## Step 3: 修正して push する

採用分をまとめて修正し、論理単位でコミットする。`bun run preflight` を通してから push する。

## Step 4: 返信と resolve

各スレッドに返信する。末尾に `_🤖 by Claude Code_` を付ける。

```bash
gh api repos/{owner}/{repo}/pulls/<番号>/comments/<comment databaseId>/replies \
  -f body='<コミットハッシュ> で修正しました。

_🤖 by Claude Code_'
```

返信したスレッドは resolve する（議論を続けたいものだけ open のまま残す）。

```bash
gh api graphql -f query='
  mutation($threadId: ID!) {
    resolveReviewThread(input: { threadId: $threadId }) {
      thread { id isResolved }
    }
  }' -f threadId=<thread id>
```

CodeRabbit に今後の方針を学習させたいときは、返信に「今後は〜という方針でレビューしてください」と書く。

## 補助コマンド（PR コメントとして投稿する）

- `@coderabbitai review` — 再レビューを依頼する
- `@coderabbitai resolve` — CodeRabbit のコメントを一括 resolve する
- `@coderabbitai pause` / `@coderabbitai resume` — レビューを一時停止 / 再開する
