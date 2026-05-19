# アーキテクチャ

「ふたりのよてい」の最終形と、そこまでの組み立てメモ。

## システム全体図

```text
            ┌──────────────────────────┐
            │  LINE app (LIFF browser) │
            └──────────────┬───────────┘
                           │ LIFF SDK で
                           │ ID トークン取得
                           ▼
                  ┌────────────────────┐
                  │  React Router SPA  │  Cloudflare Workers (assets)
                  │  (build/client)    │  でホスティング
                  └─────┬──────────────┘
                        │ fetch w/ Bearer <ID token>
                        ▼
            ┌──────────────────────────┐
            │  Hono on Cloudflare Worker│
            │  - /api/*    (アプリ)     │
            │  - /webhook/line (Bot)    │
            │  - /* assets fallback     │
            └─────┬──────────────┬──────┘
                  │              │
                  ▼              ▼
            ┌────────┐      ┌─────────────────┐
            │ D1     │      │ LINE Messaging  │
            │ (SQLite)│      │ API             │
            └────────┘      └─────────────────┘
```

すべてのリクエストは **1 つの Cloudflare Worker** に入る。`/api/*` と `/webhook/line` を Hono で受け、それ以外は `env.ASSETS.fetch()` で SPA assets にフォールバックさせる。

## 認証境界

- 認証は **Worker の `/api/*` ルートに入ったところでのみ** 検証する
- 経路:
  1. LIFF SDK が `liff.getIDToken()` で ID トークン (JWT) を返す
  2. クライアントが `Authorization: Bearer <id_token>` を載せて API を叩く
  3. Worker が LINE の JWK で署名検証 → `sub` (LINE user ID) を取り出す
  4. `users` テーブルで `id = sub` の行を解決し、`pairs` テーブルでアクティブなペアを引く
  5. 以降のクエリは **必ず `pair_id` でスコープ** される
- **データ所有モデル**: 全データ (status_items / day_statuses / schedule_entries) は `pair_id` に紐付く。ペア解消後もデータは保持し、再ペア時に過去ペアを再活性化する (要件 3.3)
- **dev での認証バイパス**: 本物の LIFF 連携が入るまで `X-Dev-User` ヘッダで `users.id` を直接指定できる。これは `wrangler.jsonc` の `vars.ALLOW_DEV_AUTH === "true"` のときのみ受理される。LIFF 化時に `"false"` に切り替え (or 削除) して経路を塞ぐ。本番では LIFF JWK 検証が通らなければ 401

## データモデル

```text
pairs                       1 ペア = 同居夫婦の単位
  id PK
  user_low_id  ─┐
  user_high_id  ┴── 2 LINE user ID をソートして格納、UNIQUE
  status          active / dissolved
  created_at, updated_at

users                       LINE 認証で識別
  id PK                     LINE user ID をそのまま PK に
  display_name
  picture_url

status_items                家庭ごとのステータス項目 (夫の勤務、弁当 等)
  id PK
  pair_id FK
  name, emoji, color
  assignee                  me / partner / both (誰が決める項目か)
  sort_order
  options JSON              [{id, label, emoji}, ...]
  weekday_defaults JSON     {mon: option_id, tue: ..., ...} | null

day_statuses                日付 × 項目 の確定値 (推定は保存しない)
  (pair_id, date, status_item_id) PK
  option_id
  confirmed                 ユーザーが明示確定したかどうか
  updated_by, updated_at

schedule_entries            予定エントリ
  id PK
  pair_id FK
  title, start_at, end_at, all_day
  whose                     self / partner / both / 自由ラベル
  location JSON             {name, address, lat, lng, map_url}
  url, notes
  rrule                     iCal RRULE (繰り返し)
  from_line, anniversary
  created_by, updated_at
```

「未確定 / 推定」は **保存しない**。曜日デフォルトから client / server のロジックで導出する (`dayStatus()` helper 担当)。これで「決まった瞬間に更新する」哲学を支える。

### 時刻と日付

- **`created_at` / `updated_at` は UTC で保存する**。SQLite の `datetime('now')` を全テーブルで一貫して使い、タイムゾーン依存の `'localtime'` 修飾は使わない
- **`day_statuses.date` / `schedule_entries.start_at` (allDay 時) は `YYYY-MM-DD` ローカル日付**。これらは「ユーザーの生活上の日付」であり、UTC で扱うと日付境界がずれる (例: JST の 5/19 朝が UTC では 5/18 後半に見える) ため、文字列として保存
- 表示時、UTC タイムスタンプはクライアントが JST に変換する責任を持つ (Worker は変換しない)
- 「今日」を取る箇所はルート毎の `getToday()` (現状 `new Date()` を返すだけ) 経由に集約し、テスト / 開発で固定したいときの差し替え点を 1 箇所に閉じる

## 状態の境界

3 層に分かれる:

| 層 | 場所 | 例 |
|---|---|---|
| Source of truth | D1 | status_items, day_statuses, schedule_entries |
| 導出値 (server-side) | API レスポンス | 推定値の埋め込み、未確定リストの集計 |
| Client transient | React state | フォームドラフト、開いている dialog、選択中の日付 |

**書き込みパスは必ず `/api/*` を経由** し、Client 側はそのレスポンスを SoT として再描画する。書いたあとに楽観更新する場合も、サーバから返った値で上書きする。

## API 契約 (v1)

| Method | Path | 用途 |
|---|---|---|
| GET | `/api/pair` | アクティブなペア + 自分 + 相手の情報 |
| GET | `/api/status-items` | ペアのステータス項目一覧 |
| POST | `/api/status-items` | 項目追加 |
| PATCH | `/api/status-items/:id` | 項目編集 (name / emoji / color / options / weekday_defaults / assignee) |
| DELETE | `/api/status-items/:id` | 項目削除 (関連 day_statuses も実削除) |
| GET | `/api/day-statuses?from=...&to=...` | 範囲内の確定値 + 各日のステータス計算結果 |
| PUT | `/api/day-statuses/:date/:itemId` | 確定値の upsert |
| GET | `/api/schedules?from=...&to=...` | 範囲内の予定 |
| POST | `/api/schedules` | 予定追加 |
| PATCH | `/api/schedules/:id` | 予定編集 |
| DELETE | `/api/schedules/:id` | 予定削除 |

すべて `pair_id` で自動スコープ。クエリ・ボディに `pair_id` を含めない。

### 型の境界 (Worker / Client の分離方針)

Worker (`worker/routes/*.ts`) と Client (`app/lib/api/types.ts`) は **同じ API 契約を別ファイルで二重に持つ**。共有しない。

理由:

- Worker は **`DbRow` (snake_case) → API レスポンス (camelCase) への正規化** を API 契約として明示的に持つ層。クライアント型を直接 import すると、DB スキーマ変更時に「クライアントが欲しい形が変わったから DB ↔ クライアントの間を勝手に詰める」方向に流れやすく、契約の境界が曖昧になる
- 将来 Worker を別 package 化する / 別言語に置き換える余地を残す
- Client 側はサーバの内部実装 (DB スキーマ) を知らずに済む

二重化のずれは**コードでなくテストで吸収する**。後続 PR で、worker のレスポンスをパースして client 型として通す対比テストを `bun test` に組み込む予定。

## 残りの組み立て計画

これまで:
- PR 1-3: SPA scaffold / 共通プリミティブ / Settings 画面 / 週ビュー。**静的データのみ**

これから (順):

| # | 内容 | 何を証明するか |
|---|---|---|
| **動くスライス (今回)** | D1 + Hono Worker + Settings の CRUD インタラクション化 | データモデルが round trip すること、API 境界が UI と矛盾しないこと |
| ホーム本実装 | UnconfirmedPrompt / WeekMatrix / 今日ヘッダ + API 接続 | day_statuses の確定パスが UI で書ける |
| 日詳細 | EventCard / PresenceStrip / 予定 CRUD | schedules の rich データ (location / url) が API で取れる |
| オンボーディング | ようこそ / 招待 / 待機 / 成立演出 / 初期セットアップ | LIFF ログイン後の最短経路で「項目セット完了」まで |
| LINE 取り込み | Bot 会話画面 (LINE 上) + プリフィル予定追加 | Messaging API webhook → Flex Message → LIFF URL の往復 |
| LIFF 認証本実装 | dev ヘッダを破棄し、LINE JWK 検証で本物のユーザーを resolve | 本番で動く |
| LINE Bot webhook | URL 取り込み Bot | OG パース → Flex Message → LIFF へのプリフィル |

## ローカル開発

```sh
# 初回
wrangler d1 create hidoko-futari-no-yotei                       # D1 作成
bun --filter futari-no-yotei db:migrate:local                   # ローカル D1 に schema 適用
bun --filter futari-no-yotei db:seed:local                      # サンプル pair / users を投入

# 日常
bun --filter futari-no-yotei dev                                # vite + worker 統合 dev サーバ
```

dev 環境では `X-Dev-User: u_me` ヘッダを fetch ラッパが自動で付ける。本番では LIFF ID トークン経由になる。

## 守りたい原則

- **API レスポンスを Single Source of Truth に**: client 側で D1 のミラー state を持たない。`clientLoader` / `useFetcher` で都度引く
- **`pair_id` を URL や body に乗せない**: 認証で確定するので、自動スコープに任せる
- **「未確定」は保存しない**: weekday_defaults からの導出ロジックは `lib/data/helpers.ts` 1 箇所に集約
- **見た目層を増やす前に CRUD を 1 周させる**: 「動かないモックを 3-4 本」より「動くスライスを 1 本」を優先する
