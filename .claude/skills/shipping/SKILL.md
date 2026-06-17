---
name: shipping
description: GitHub Issue URL / PR URL / タスク要件テキストのいずれかを受け取り、PR を完走（CI 通過・description 最新・全コメント解消・Draft 解除・マージ・ブランチ削除）まで自律で届け切る。取り消し不能アクションも自分で実行する。新規着手・継続開発・レビュー対応・プレビューフィードバック対応を自動判別する。冪等。ユーザーが「Issue を進めて」「PR を完走させて」「マージして」「このフィードバックを直して」と言ったら、明示されなくても使う。AI 駆動開発の最先端を hidoko で試すためのスキル。
argument-hint: <Issue URL | PR URL | タスク要件テキスト>
---

# Shipping — PR を最後まで届け切る

このスキルは、起点（Issue / PR URL / 自由テキスト）から PR をマージまで自律で届ける。hidoko は個人開発であり、AI 駆動開発の最先端を試す実験場。業務リポジトリで安全側に倒すべきだった判断を、ここではあえて自律側に倒す。判断待ちで止まる時間を限界まで削るのがこのスキルの存在意義。

新規着手・継続開発・レビュー対応・プレビューフィードバック対応を入力から自動判別する。冪等なので、途中で止まっても再実行で続きから動く。

前提: `gh` がインストール・認証済みであること。

---

## 自律性の原則

確認を取るのは 1 つだけ。新規実装で What/Done が確定できないとき。What の取り違えが下流の全実装を無駄にするので、ここだけは聞く。

それ以外は全部自分で実行する。取り消し不能アクションも含めて。

- `git push --force` / `git push -f` — リベース・履歴整理で必要なら自分で実行する
- `git reset --hard` — ローカルの不要な状態を捨てるとき自分で実行する
- ブランチ削除 — マージ済みの head ブランチは自分で削除する
- PR の close — スコープを取り違えて作り直すなら自分で close する
- PR の merge — CI が緑で Done を満たしたら自分でマージする
- 依存追加 / 削除 — 必要だと判断したら自分で `bun add` / `bun remove` する
- スコープを広げる変更 — 自分の判断で実装し、PR description に明記する
- 命名・設計判断・コミット分割 — 自分で決める
- 既存コードの削除・大胆なリファクタ — 残す方が良いと言える根拠がなければ削る

例外として触らないのは 2 つだけ。

- main への直接 push — 必ず PR 経由
- release-please のリリース PR — auto-merge の仕組みに任せる（手で merge しない）

「業務ならユーザーに確認すべき」と感じても hidoko では聞かない。それが個人開発でこのスキルを使う意味。安全側に倒したいなら、それは別のリポジトリでやる仕事。

---

## 過激な方針

hidoko は「業務ならやらない判断」を試す場として運用する。具体的な振る舞いの違いは次のとおり。

- コミット分割: 1 コミット 1 目的の縛りは緩める。レビュアーが追える単位なら、まとめて 1 つにしてよい。後で `git rebase -i` で整理する選択肢も持つ
- テスト: カバレッジでなく実利で書く。Web Worker 越しの境界・複雑な状態遷移・回帰しやすい計算ロジックには書く。CRUD の薄いラッパーには書かない。「テストを書かない選択」も自律で取って良い
- リファクタ: 既存コードを思い切って削る。「使われていそうな気がする」だけで残さない。grep で利用箇所を確認して、なければ消す
- 新ライブラリ・新パターン: 試して良い。ただし `packages/ui` の shadcn 体系・トークン体系・Cloudflare Workers の構造は破壊しない（共有基盤は破壊コストが大きい）
- 進化性 > 保守性: 「半年後の自分が変えやすいか」を優先する。今の慎重さで将来の選択肢を狭めるなら、慎重さを捨てる

何が hidoko らしい過激さで、何が雑なだけかの線引き。

- OK: 大胆な API 変更、思い切ったコンポーネント差し替え、依存の入れ替え、コミットをまとめる、テストを省く判断
- NG: 動作確認しないまま push、CI を緑にせず merge、明らかな a11y 違反、トークン体系の破壊、ユーザー向け表記の「ひどこ」露出

---

## ワークフロー

### Step 0: 入力を判別する

引数（または会話文脈）を見て、起点を 3 つに分類する。

- GitHub PR URL（`github.com/.../pull/<N>`）→ 既存 PR への継続作業。継続モードへ
- GitHub Issue URL（`github.com/.../issues/<N>`）または Issue 番号 → 新規着手。新規モードへ
- それ以外のテキスト + リンク → 新規着手。新規モードへ

判別に迷ったら、まず `gh pr view` で PR として解釈できるか試し、できなければ新規モードに倒す。

### Step 1: 起点情報の取得とコードベース探索を並行で走らせる

What/Done を整理する前にコードの現状を読み始める。コードの現状を踏まえると、What/Done が具体的になる。タスク取得とコード探索は依存しないので並行で走らせる。

#### 並行タスク A: 起点情報の取得

継続モード:

```sh
gh pr view <PR_URL> --json title,body,url,number,headRefName,isDraft
gh pr view <PR_URL> --json comments,reviews,reviewRequests
gh pr checks <PR_URL>
gh pr diff <PR_URL>
```

description から Why / What / Done / 制約 / 参照リソースを読み取る。未対応の PR コメント・CI 状態・既存 diff も把握する。

未対応 PR コメントの判定（CodeRabbit / Agentation / 人間レビュアー共通）:

- スレッドが `isResolved: false`
- 最後のコメントが自分（viewer login）ではない
- 「対応します」と返信しただけで実コードに反映していないものも、自分の手で反映する責任として扱う

Agentation のコメント識別: bot 名（`author.login` で確認）。プレビュー環境で動作確認したユーザーからのフィードバックを bot 経由で投稿する。CodeRabbit と並列で扱うが、出典が「実機の動作確認」なので、内容は UI / 振る舞いの指摘になりやすい。

新規モード:

- Issue URL / 番号 → `gh issue view <番号> --json title,body,labels,comments`
- 自由テキスト → そのまま起点情報。リンクがあれば `gh` / WebFetch / MCP で内容を取得
- Figma リンクがあれば Figma MCP で取得して UI 要件を把握

#### 並行タスク B: コードベース探索

`code-explorer` または `Explore` サブエージェントを起動し、タスクの主題を渡して次を調べさせる。

- 関連する既存ファイル・モジュール
- 参考にすべき類似実装・パターン
- 再利用できる共通コンポーネント・ユーティリティ・型（特に `packages/ui` の shadcn 系）
- 既存テスト・story の書き方
- 影響範囲

継続モードでは、既存の diff も探索の手がかりとして渡す。

### Step 2: 状態を判定する

このセッションでやるべきことを判別する。

- 新規実装: 新規モードで Draft PR がまだない → Step 3 へ
- 初回実装: 継続モードで description はあるがコードがまだ → Step 5 へ
- 継続開発: 継続モードで途中まで実装済 → Step 5 へ
- レビュー / プレビューフィードバック対応: 継続モードで未対応コメントあり → Step 5 へ

複数モードが同時に該当することもある。両方を計画に含める。

### Step 3: What / Why / Done を精緻化する（新規実装のみ）

Step 1 で得たタスク情報とコード探索結果を踏まえて、Why / What / Done を書く。

- Why: 背景・目的・ユーザー価値
- What: 具体的に何を作る・変える・直すのか。変更対象ファイル・既存実装との関係まで含める
- Done: 完成条件。ユーザー操作と期待結果のペアで書く
- 制約・注意点: 既存コードへの影響、パフォーマンス要件、デザイン制約
- 参照情報: Issue / Figma / 関連 PR などのリンク

情報が不足している箇所は `[要確認: ...]` プレースホルダーを残す。複数タスクが混在している場合はスコープを 1 つに絞る。

良い What の書き方の例: 「サイドバーの開閉状態に応じて、トグルボタンのアイコンを切り替える。SidebarTrigger は変更せず、AppHeader 側で対応する」

良い Done の書き方の例: 「サイドバーが開いた状態でトグルボタンに ← アイコンが表示される。閉じた状態で → アイコンが表示される」

確認方法は Done を検証手順に落としたもの。レビュアーがこの手順で PR を検証できる状態にする。

新規実装で What/Done が確定できないときだけ、ここでユーザーに 1 回確認する。description 全文を貼って「異論あればこの時点で言ってください、なければ進めます」と伝え、止まらずに進む。確定できるなら聞かない。

### Step 4: ブランチと Draft PR を作る（新規実装のみ）

ブランチ名は機械的に決める。

- Issue 起点 → `ai/issue-<番号>`
- フリーテキスト起点 → `ai/task-$(date -u +%Y%m%dT%H%M%S)`

prefix の使い分け（feature/fix/refactor 等）は廃止。可読性は PR タイトルで担保する。同名ブランチが既にあるなら末尾にサフィックスを足して衝突を避ける。

PR description は [.github/PULL_REQUEST_TEMPLATE.md](../../../.github/PULL_REQUEST_TEMPLATE.md) の構造で書く。「やったこと」「やらなかったこと」「確認方法」「キャプチャ」は実装後（Step 8）に更新する。

```sh
PR_BODY_FILE="/tmp/pr-body-$(echo '<ブランチ名>' | tr '/' '-').md"
cat <<'EOF' > "$PR_BODY_FILE"
<生成した PR description>
EOF

git fetch origin main
git switch -c <ブランチ名> origin/main
git commit --allow-empty -m "chore: start development"
git push -u origin <ブランチ名>

gh pr create --draft --base main \
  --title "<PR タイトル>" \
  --body-file "$PR_BODY_FILE" \
  --assignee @me
```

Issue から始めたタスクは description の関連リンクに `closes #<番号>` を入れる。

### Step 5: リポジトリルールを読み込む

実装方針を立てる前に、規約を読む。Step 7 のセルフレビューの判定基準にもなる。

- [AGENTS.md](../../../AGENTS.md) / [CLAUDE.md](../../../CLAUDE.md)
- 編集対象に該当する [.claude/rules/](../../rules/) のファイル
- UI を触るなら [DESIGN.md](../../../DESIGN.md)
- 対象 workspace の README.md / CLAUDE.md

レビュー対応や継続開発で PR の head ブランチが現在の作業ツリーと一致していない場合は、先に対象 PR の head にチェックアウトする。

```sh
gh pr checkout <PR_URL>
```

### Step 6: 計画して実装する

Step 1 のコード探索結果と Step 5 のリポジトリルールを踏まえて計画を組む。

計画の指針:

- 再利用: `packages/ui` の shadcn コンポーネントを使う。同等品を自前で書かない。app 側に shadcn の写経を置かない（[.claude/rules/ui.md](../../rules/ui.md)）
- 一貫性: 類似実装の命名・構造に揃える
- 進化性: 半年後の自分が変えやすいか。撤退ラインを言えない設計は採用しない
- 過激な方針（前述）を適用する: 思い切って削る、まとめて変える、新パターンを試す

各コミット前に `bun run preflight` を通す（Biome check + typecheck + design:lint）。落ちたまま push しない。

コミットメッセージは Conventional Commits（[AGENTS.md の「コミット規約」](../../../AGENTS.md) 参照）。subject 先頭は lowercase Latin か日本語。commitlint で reject されるパターンだけ守れば、それ以外は自由。

#### UI 実装

- 新規 UI コンポーネントは story を先に書く（[.claude/rules/storybook.md](../../rules/storybook.md)）
- 色は `tokens.css` のトークン経由で参照する（[.claude/rules/design.md](../../rules/design.md)）
- 純白 `#ffffff` を使わない・装飾絵文字を使わないなどの Do/Don't は [DESIGN.md](../../../DESIGN.md) 参照
- Dialog の外側タップでの誤破棄抑止 / dirty 編集の破棄確認 / 日時はピッカー、を「動くだけ」で終わらせず実装段階でチェック

#### ブランド表記

UI 上のテキスト・OGP・シェア文面・タイトル・ヘルプに「ひどこ／HIDOKO／火床」を出さない。内部識別子の `hidoko-` 接頭辞は問題ない。詳細は [AGENTS.md の「ひどことアプリの関係」](../../../AGENTS.md)。

#### PR コメント対応

未対応の PR コメントを処理する。

1. 妥当性を検証する。判断基準は AGENTS.md / DESIGN.md / .claude/rules/ > 一般論のベストプラクティス。CodeRabbit は assertive profile で多めに指摘を出す前提なので鵜呑みにしない
2. 採用 / 不採用 / 質問の 3 つに分類する
3. 採用分は修正してコミットする
4. 不採用は理由を返信する（CodeRabbit の learnings に蓄積される）
5. 質問は意図を答える
6. 各スレッドに返信したら、議論を続けたいもの以外は resolve する

CodeRabbit と Agentation を同じ入口で扱う。Agentation はプレビュー環境からの実機フィードバックなので、内容は UI / 振る舞いに偏る。修正後はプレビュー URL でユーザーが再確認できるよう、PR description の「確認方法」を最新化しておく。

返信スレッドの resolve は GraphQL で行う。

```sh
gh api graphql -f query='
  mutation($threadId: ID!) {
    resolveReviewThread(input: { threadId: $threadId }) {
      thread { id isResolved }
    }
  }' -f threadId=<thread id>
```

未対応スレッドの取得:

```sh
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

返信例:

```sh
gh api repos/{owner}/{repo}/pulls/<番号>/comments/<comment databaseId>/replies \
  -f body='<コミットハッシュ> で修正しました。

_🤖 by Claude Code_'
```

CodeRabbit 補助コマンド: `@coderabbitai review` / `resolve` / `pause` / `resume`。

### Step 7: セルフレビューを通す（push 前必須）

push する前に `/code-review high` で自分の差分をレビューする。観点として AGENTS.md / DESIGN.md / .claude/rules/ への準拠も含めるよう指示する。

指摘は宛先で分類して処理する。

- 自分で塞げる修正 → この場で全部修正してから push
- 仕様・設計の判断 → 自分で決めて進める。判断根拠を PR description に書く
- この PR のスコープ外 → description の「やらなかったこと」に明記。継続改善の Issue 候補として残す
- 標準・ナレッジへの還元 → AGENTS.md か .claude/rules/ への追記を別 PR で出す

修正したらコミットを積み直し、もう一度セルフレビューする。自分で塞げる指摘が 0 件になるまでループする。

typo 修正・lint fix・1〜2 行の変更ではスキップしてよい。

### Step 8: 完走させる

以下を全部満たすまで完了しない。

#### 8-1. コミット・プッシュ

すべての変更がコミット・プッシュされていること。

```sh
git push
```

- diverged している場合は `git pull --no-rebase` → 再 push、または `git push --force-with-lease`（自分の判断で選ぶ）
- pre-commit hook が落ちたら原因を直す（`--no-verify` は使わない）

#### 8-2. CI 通過

```sh
gh pr checks <PR_URL> --watch
```

CI が失敗したら以下の順で切り分ける。

1. 自分の変更由来か → ローカル再現 → 修正 → 再 push
2. main 由来の可能性 → `gh run list --branch main --limit 3` で main の状態を確認
3. main 由来と確定したら、`git merge origin/main` で main を取り込んで再 push する（main の修正待ちが必要な場合のみユーザーに報告する）

VRT（reg-suit）の差分は fail にならない。差分があった場合は採否を自分で判断する（既存テストが意図的に変わっているなら採用、想定外なら差分の原因を直す）。Cloudflare Workers Builds の preview URL は Cloudflare 側が sticky コメントで自動投稿する。

通るまで繰り返す。

#### 8-3. PR description の最新化

description は PR の現状を映す唯一の情報源。コミット・プッシュのたびに更新する。

```sh
gh pr edit <PR_URL> --body-file <最新の description ファイル>
```

- title: 実装内容を端的に表すものに更新
- What: 実装を通じてスコープが変わった場合は精緻化（Why / 意図は保持）
- やったこと: 現時点のサマリで上書き（履歴は積まない）
- やらなかったこと: スコープ外と判断したこと
- 確認方法: 実装に合わせて具体化
- キャプチャ: UI 変更があれば Before/After を更新
- Why などの他セクション: 基本的に変更しない

#### 8-4. PR コメントがすべて対応済み

CodeRabbit / Agentation / 人間レビュアーのコメントが、修正または返信で全部解消されていること。議論を続けたいものだけ resolve せずに残してよい。

#### 8-5. Draft を外す

8-1 〜 8-4 を満たし、Done 条件を満たしているなら、Draft を外して Ready for review にする。

```sh
gh pr ready <PR_URL>
```

#### 8-6. マージ

CI が緑で Done を満たしているなら、自分で squash merge する。

```sh
gh pr merge <PR_URL> --squash --delete-branch
```

マージのコミットメッセージは PR タイトルを base にする（必要なら `--subject` で上書き）。`--delete-branch` で head ブランチを削除する。

main 由来の問題でブロックされている場合だけ、マージを止めてユーザーに報告する。

#### 8-7. 完了報告

PR URL とマージ済みコミットの SHA、リリース見通し（release-please が次のリリース PR でこの変更を拾う）を報告する。

ユーザーがプレビューで動作確認した結果、後から Agentation 経由のフィードバックが付いたら、それを起点にこのスキルを再起動するとレビュー対応モードで再開する。

---

## マージ後の運用

マージしたら、リリースは release-please が拾う。リリース PR は required checks 通過後に auto-merge されるので触らない。手で merge しない。手で title / body を編集しない。

---

## 触らない 2 つだけ

- main への直接 push — 必ず PR 経由
- release-please のリリース PR の merge / 編集 — auto-merge の仕組みに任せる

これ以外は全部自律で実行する。

---

## 重要原則

1. 自律性の原則を守る。確認は新規実装の What/Done だけ
2. 取り消し不能アクションも自分で実行する。例外は main への直接 push と release-please のリリース PR
3. セルフレビューを通す。`/code-review high` で自分で塞げる指摘を 0 件にしてから push
4. テスト失敗は切り分けて自分で直す
5. bot であることを隠さない。GitHub に投稿するコメントの末尾に `_🤖 by Claude Code_` を付ける
6. 冪等。途中で止まっても続きから動く
7. 日本語の文章は `writing-clearly-ja` スキルを使う
8. 過激な方針（コミットまとめる / テストは実利で / 思い切って削る / 新パターン試す / 進化性 > 保守性）を適用する。「業務ならやらない」を hidoko で試す
9. 継続的な進化の視座を持つ。やらなかったことは次の Issue 候補として PR description に残す
