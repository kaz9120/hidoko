---
name: agentation-feedback
description: Agentation が出力する Page Feedback 形式の UI フィードバック（`## Page Feedback: <path>` で始まり、項目ごとに DOM パス・Source・Issue 説明が並ぶテキスト）を受け取り、URL から本番／プレビュー環境を判別して GitHub Issue または PR コメントを作成する。本番 (`hidoko-<app>.kaz9120.workers.dev`) のフィードバックは項目ごとに 1 Issue ずつ作る。プレビュー (`<slug>-hidoko-<app>.kaz9120.workers.dev`) のフィードバックは該当 PR に 1 コメントへ集約する。ユーザーが Agentation 出力を貼って「Issue にして」「PR に貼って」「フィードバック処理して」「Page Feedback を進めて」「これを起票して」と言ったら、明示されなくても使う。出力フォーマット内に `## Page Feedback:` の文字列を見つけたら、このスキルを最優先で検討する。
argument-hint: <Agentation 出力テキスト | 出力を含むファイルパス>
---

# Agentation Feedback — UI フィードバックを Issue / PR コメントに変換する

このスキルは Agentation（ブラウザ上で各要素にコメントを残せる注釈ツール）の出力を、hidoko の開発フローに沿って GitHub に流し込む。

Agentation の出力には URL・DOM パス・Source（`file:line:col`）・React ツリー・該当要素の位置とスタイル・ユーザーが書いた `Issue` テキストが、項目ごとに整理されている。これを以下の 2 通りに振り分ける。

- 本番 URL（`hidoko-<app>.kaz9120.workers.dev`）に対するフィードバック → 項目ごとに Issue を 1 件ずつ作る
- プレビュー URL（`<slug>-hidoko-<app>.kaz9120.workers.dev`）に対するフィードバック → 該当 PR に 1 コメントで集約

前提: `gh` がインストール・認証済みであること。リポジトリの作業ディレクトリ内で実行されること。

---

## ワークフロー

### Step 1: 入力を取得して解析する

入力は次のいずれか。

- 引数にテキスト本体がそのまま渡されている
- 引数にファイルパスが渡されている → `Read` で読む
- 引数なし → ユーザーに「Agentation の出力を貼ってください」と聞く

入力を読んだら、次を抽出する。

- **環境ブロック**: `**Environment:**` セクションから `URL` / `Viewport` / `User Agent` / `Timestamp` / `Device Pixel Ratio`
- **対象パス**: 先頭行 `## Page Feedback: <path>` の `<path>`
- **項目リスト**: `### <番号>. <selector>` で始まる各ブロック。番号は最終出力には含めない（後述）

各項目から拾うのは次の情報。

- DOM セレクタ（見出し行の `<selector>`）
- Full DOM Path
- Source（`file:line:col`）
- React コンポーネントツリー
- CSS Classes / Position / Computed Styles / Accessibility（補足情報。Issue 本文では「環境情報」に畳む）
- **Issue 行**（`**Issue:** <text>`）— これがユーザーの本意。最重要

### Step 2: URL から本番／プレビューを判別する

`Environment` の `URL` のホスト名を見る。

- ホスト名が `hidoko-<app>.kaz9120.workers.dev` の形（サブドメインなし）→ **本番モード**
- ホスト名が `<slug>-hidoko-<app>.kaz9120.workers.dev` の形（先頭にハイフン区切りで何か付く）→ **プレビューモード**
- `localhost` / `127.0.0.1` → どちらでもないので確認する（「ローカル開発の出力ですか？ どの PR か Issue 化を希望されますか？」）
- 上記いずれにも当てはまらない → ユーザーに確認

`<app>` はサブドメイン部分から取り出して、リポジトリ内のアプリ名と照合する。hidoko の app は `apps/` 配下に並んでいる。実在しない app 名が出てきたら、推測せずユーザーに確認する。

### Step 3a: 本番モード — 項目ごとに Issue を作る

各項目につき 1 Issue を作る。複数項目あれば、まとめて並列に作って良い（ただしユーザーに「N 件作ります、よろしいですか？」と一度だけ確認する。これは取り消しにコストがかかるため）。

Issue タイトルは次の形にする。

```
<app>: <Issue 行を要約した 1 行>
```

- `<app>` はアプリ名（`snapcrop` / `homepage` 等）
- 要約は **Agentation の Issue 行を素直に短くする**。意訳しすぎない。元が日本語なら日本語、英語なら英語のまま要約する
- 末尾の句点は付けない（タイトルなので）

Issue 本文は次のテンプレートを使う（次節「テンプレート」を参照）。

ラベルは Agentation の Issue 行の内容から推定する。

- 「typo」「動かない」「壊れている」「エラー」 → `bug`
- 「こうしたい」「追加してほしい」「変えたい」 → `enhancement`
- 「リファクタ」「整理」「依存更新」 → `maintenance`
- 判断できなければラベルなしで作成する（後から付け直せる）

作成は `gh issue create` を使う。本文は HEREDOC で渡す。

```sh
gh issue create \
  --title "<title>" \
  --label "<label>" \
  --body "$(cat <<'EOF'
<本文>
EOF
)"
```

作成後、各 Issue の URL を最後にまとめてユーザーに返す。

### Step 3b: プレビューモード — PR に 1 コメントで集約する

PR 番号の特定は次の順で試す。

1. URL の `<slug>` を取り出す（`<slug>-hidoko-<app>.kaz9120.workers.dev` の `<slug>` 部）
2. `gh pr list --state open --limit 50 --json number,title,headRefName` で全 PR の `headRefName` を取得
3. `headRefName` をブランチ slug 化（`/` → `-`、英大文字 → 小文字）して `<slug>` と一致するものを探す
4. 一致する PR が 1 件あればそれを採用。0 件または 2 件以上ならユーザーに確認

ブランチ slug 化は Cloudflare 側で長さ制限・特殊文字置換が入ることがあるため、完全一致しない場合は前方一致でも探す。それでも特定できなければ「PR 番号を教えてください」と聞く。

PR 番号が決まったら、`gh pr comment <PR_NUMBER> --body "$(cat <<'EOF' ... EOF)"` で 1 コメントを投稿する。本文は次節「テンプレート」のプレビュー用フォーマットを使う。

### Step 4: 不足情報のヒアリング

次の状況では作成前に確認する。聞く回数は最小限に絞る。

- URL が判別不能（本番でもプレビューでもない、localhost 等）→ どう扱うか
- PR 候補が複数または 0 → PR 番号
- アプリ名がリポジトリに存在しない → どの app として扱うか
- Agentation の Issue 行が空 or 意味不明 → ユーザーの意図
- 本番モードで 3 件以上の Issue を一度に作ろうとしている → 「N 件作ります、よろしいですか？」と一度だけ確認

それ以外（ラベル選択・タイトル要約・期待挙動の補完など）は自分で判断する。間違っていればユーザーが直すので、止めずに進める。

### Step 5: 完了報告

ユーザーに次を返す。

- 作成した Issue の URL 一覧（本番モード）または PR コメントの URL（プレビューモード）
- 環境判別の根拠（「URL が `hidoko-snapcrop.kaz9120.workers.dev` だったため本番モードで処理しました」など 1 行）

---

## テンプレート

### 本番モード: Issue 本文

各項目につき 1 Issue。本文は次の構造。

````markdown
## 概要

<Agentation の Issue 行を 1-2 文で展開した説明。ユーザーが何を求めているかを言語化する>

## 該当箇所

- 画面: `<path>`（例: `/dashboard`）
- コンポーネント: `<React の最深ノード>` （`<Source の file:line:col>`）
- DOM: `<セレクタ>`

## 期待する状態

- <Agentation の Issue 行から読み取れる「こうあってほしい」を箇条書きに分解する。読み取れなければ「Agentation の指摘どおりに修正する」と書く>

## 環境情報

- URL: `<URL>`
- Viewport: `<Viewport>` / DPR `<Device Pixel Ratio>`
- User Agent: `<User Agent>`
- 計測日時: `<Timestamp>`

## Agentation 原文

<details>
<summary>展開</summary>

```
<該当項目の原文をコードブロックに貼る。### <番号>. の番号部分は削除して
### <セレクタ> で書き直す。それ以外は改変しない>
```

</details>

_🤖 by Claude Code_
````

注意点:

- 本文中に `#数字` を書かない（GitHub が他 Issue と誤リンクする）。原文を含めるときも `Feedback #1` のような表記が出てきたら `Feedback No.1` に書き換える
- Agentation 出力の `### 1. button.submit-btn` の `1.` は、原文ブロックでも見出しから削って `### button.submit-btn` に直してから貼る（番号は文脈の意味を持たないため）
- 末尾の `_🤖 by Claude Code_` は hidoko の自動投稿コメントの慣例（[AGENTS.md](../../../AGENTS.md) 参照）

### プレビューモード: PR コメント本文

1 セッション分を 1 コメントにまとめる。

````markdown
## Agentation フィードバック: `<path>`

プレビュー環境で確認したフィードバックです。

**環境情報**

- URL: `<URL>`
- Viewport: `<Viewport>` / DPR `<Device Pixel Ratio>`
- User Agent: `<User Agent>`
- 計測日時: `<Timestamp>`

---

### <セレクタ>

- 該当: `<React 最深ノード>` （`<Source>`）
- DOM: `<DOM パス>`

**指摘**: <Agentation の Issue 行をそのまま、または軽く整える>

**期待**: <読み取れる期待挙動。読み取れなければ省略>

---

### <セレクタ>

...（項目ごとに繰り返し）

---

<details>
<summary>Agentation 原文</summary>

```
<セッション全体の原文をコードブロックに貼る。番号は削っても残してもよい
（PR コメントは Issue リンク誤爆のリスクが Issue 本文より低いが、
安全側に倒して削るのを推奨）>
```

</details>

_🤖 by Claude Code_
````

---

## 詳細ルール

### `#数字` を本文に書かない

GitHub は本文中の `#42` を Issue/PR 番号として自動リンクする。Agentation の項番（`Feedback #1` や `### 1.`）をそのまま貼ると、関係ない Issue にリンクが飛び、リポジトリ全体のノイズになる。

対策:

- 出力テンプレートで連番を一切使わない（項目見出しは「セレクタ」を使う）
- 原文を `<details>` + コードブロックで貼ることで、markdown としての展開を抑える
- それでも文字としての `#1` が原文に混じる場合は `No.1` に書き換える

### 「ひどこ」表記をユーザー向け文面に出さない

Issue タイトル・本文・PR コメントは Claude が書く内部文書だが、最終的に PR や Issue として hidoko リポジトリで公開される。「Hidoko」「火床」「ひどこ」をユーザー向けの装飾文言として使わない（[AGENTS.md](../../../AGENTS.md) の「ひどことアプリの関係」参照）。内部識別子としての `hidoko-<app>`（Worker 名）は使ってよい。

### ラベルは推測で良い、迷ったら無印で作る

hidoko のラベルは `bug` / `enhancement` / `maintenance` / `documentation` / `question` などがある。推測の判定軸は前述のとおり。判断に迷う時間がもったいないので、迷ったら無印で作って次に進む。

### 1 Issue 1 件で作る理由

メモリ `stack_issues_over_inline_fixes.md` に「気になりは Issue にどんどん積む」とある。1 項目 1 Issue は次の利点がある。

- 個別に close / 担当者割り当て / 優先度付けができる
- 修正コミットから Issue を 1 件参照できる（`fix(snapcrop): ... (#42)`）
- 後で「あれどうなったっけ」を Issue 単位で追える

セッション全体を 1 Issue にまとめると、修正の進捗が追いにくくなる。

### プレビューフィードバックを 1 コメントにまとめる理由

PR コメントは Issue と違い「会話のスナップショット」として扱われる。レビュー目線で 1 PR = 1 セッションのフィードバックを 1 つの塊で見られるほうが、PR 著者（多くの場合 Claude 自身）が `/shipping` で取りこぼしなく拾える。複数コメントに散らすと「最新のレビューを全部拾ったか」の確認コストが上がる。

### 冪等性

同じ Agentation 出力を 2 回投げると、Issue / PR コメントは普通に 2 重に作られる。重複検知はこのスキルでは行わない（誤検知のコストのほうが高い）。ユーザーが「もう一度作って」と言ったら素直に作る。「重複してるか確認して」と言われたら `gh issue list --search` / `gh pr view --comments` で見に行く。

---

## アプリ一覧（参考）

hidoko の app と Worker 名の対応。新しい app が増えたら `apps/` を見て更新する。

| app | Worker 名（= 本番ホストの先頭） |
|---|---|
| snapcrop | `hidoko-snapcrop` |
| note-ogp | `hidoko-note-ogp` |
| homepage | `hidoko-homepage` |
| futari-no-yotei | `hidoko-futari-no-yotei` |
| hidoko-id | `hidoko-id`（接頭辞重複なし） |
| storybook | `hidoko-storybook` |

`hidoko-id` だけは Worker 名自体が `hidoko-id` で、`hidoko-<app>` パターンの app 名部分が `id` になる。ホスト名解析時は最長一致で `hidoko-id` を先に試す。
