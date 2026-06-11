---
name: preparing-dev-task
description: hidoko 用。タスク要件（テキスト・GitHub Issue・リンク）から Why/What/Done を整理し、ブランチ作成・Draft PR 作成・PR description 設定までを一気通貫で実行する。
disable-model-invocation: true
---

# 開発タスク準備（hidoko 版）

What / Why / Done の言語化と開発環境の準備を担う。How には踏み込まない。曖昧な What からは曖昧な実装しか生まれないので、ここでの言語化の質が下流の実装品質を決める。

グローバル版と違い、worktree は作らずこのリポジトリ内でブランチを切る。並列で複数タスクを進めたいときだけ `git worktree add` を使う。

前提: `gh` がインストール・認証済みであること。

## Step 1: タスク要件を把握する

- GitHub Issue なら `gh issue view <番号>` で取得する。「機能・改善」テンプレートの Issue は Why / What / Done が既に構造化されているので、それをベースに精緻化する。ゼロから再抽出しない。
- テキストなら Why / What / Done / 制約 / 参照リンクを抽出する。不足は `[要確認: ...]` プレースホルダを入れる。
- 複数タスクが混在していそうなら（「A も B もやりたい」「ついでに C も」）、スコープを確認して 1 つに絞る。

## Step 2: ブランチ名と PR description を生成する

ブランチ名は `feature/` `fix/` `refactor/` `docs/` `style/` `perf/` + 英語 kebab-case 3〜5 単語（例: `feature/add-user-profile-page`）。

PR description は [.github/PULL_REQUEST_TEMPLATE.md](../../../.github/PULL_REQUEST_TEMPLATE.md) の構造で生成する。書き方の基準は次のとおり。

- **What** は implementing-pull-request が読んで実装計画を立てられる具体性で書く。変更の境界（何を変えて何を変えないか）を明示する。「UI を改善する」「必要に応じてリファクタする」は不可。
- **Done** はユーザー操作と期待結果のペアで書く。「正しく動作する」は不可。
- **確認方法** は Done をレビュアーが検証できる手順に落とし込む。
- 「やったこと」「やらなかったこと」は空のまま残す（implementing-pull-request が実装時に更新する）。

## Step 3: ブランチと Draft PR を作る

description をユーザーに提示して確認を取ってから実行する。冪等に進める（ブランチ・PR が既にあればスキップして続きから）。

```bash
# 未コミット変更が残っていないか確認してから
git fetch origin main
git switch -c <ブランチ名> origin/main

git commit --allow-empty -m "chore: start development"
git push -u origin <ブランチ名>

gh pr create --draft --base main \
  --title "<PR タイトル>" \
  --body-file <descriptionを書き出したファイル> \
  --assignee @me
```

Issue から始めたタスクは description の関連リンクに `closes #<番号>` を入れる。

## Step 4: 完了報告

PR URL を提示し、次を案内する。

```text
/implementing-pull-request <PR_URL>
```
