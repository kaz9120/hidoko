-- 「ふたりのよてい」初期スキーマ。詳細は apps/futari-no-yotei/ARCHITECTURE.md 参照。

-- LINE ユーザー (ペア解消後も users 行は残す)
-- pairs から FK で参照するため、こちらを先に作る。
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  picture_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ペア (2 名の組)
-- `user_low_id < user_high_id` を強制することで `(A, B)` と `(B, A)` が
-- 別レコードとして並ぶのを防ぐ。pair 解決ロジックが「user_id がどちらに
-- 入っているか不明」になることもなくなる。
-- メンバー列を users(id) で参照することで、存在しないユーザー ID のペアが
-- 作られて孤児データになるのを防ぐ。
CREATE TABLE pairs (
  id TEXT PRIMARY KEY,
  user_low_id TEXT NOT NULL REFERENCES users(id),
  user_high_id TEXT NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'dissolved')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (user_low_id < user_high_id),
  UNIQUE (user_low_id, user_high_id)
);

-- ステータス項目 (家庭ごとに完全可変)
-- options / weekday_defaults の `json_valid()` チェックは、API バリデーションを
-- すり抜けた値 (手動 INSERT / 将来の admin RPC 等) が混入したときに JSON.parse 側で
-- 500 を誘発するのを DB レイヤで防ぐ。
CREATE TABLE status_items (
  id TEXT PRIMARY KEY,
  pair_id TEXT NOT NULL REFERENCES pairs(id),
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  color TEXT NOT NULL,
  assignee TEXT NOT NULL CHECK (assignee IN ('me', 'partner', 'both')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  options TEXT NOT NULL CHECK (json_valid(options)),
  weekday_defaults TEXT CHECK (weekday_defaults IS NULL OR json_valid(weekday_defaults)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_status_items_pair ON status_items (pair_id, sort_order);

-- 日次ステータス確定値。推定値は保存せず、weekday_defaults から導出する。
CREATE TABLE day_statuses (
  pair_id TEXT NOT NULL REFERENCES pairs(id),
  date TEXT NOT NULL,               -- YYYY-MM-DD
  status_item_id TEXT NOT NULL REFERENCES status_items(id),
  option_id TEXT NOT NULL,
  confirmed INTEGER NOT NULL DEFAULT 1 CHECK (confirmed IN (0, 1)),
  updated_by TEXT NOT NULL REFERENCES users(id),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (pair_id, date, status_item_id)
);
CREATE INDEX idx_day_statuses_pair_date ON day_statuses (pair_id, date);

-- 予定エントリ
CREATE TABLE schedule_entries (
  id TEXT PRIMARY KEY,
  pair_id TEXT NOT NULL REFERENCES pairs(id),
  title TEXT NOT NULL,
  start_at TEXT NOT NULL,           -- ISO datetime (allDay=1 のときは YYYY-MM-DD)
  end_at TEXT,
  all_day INTEGER NOT NULL DEFAULT 0 CHECK (all_day IN (0, 1)),
  whose TEXT NOT NULL,              -- 'both' / <user_id> / 自由ラベル
  location TEXT,                    -- JSON: {name, address, lat, lng, map_url}
  url TEXT,
  notes TEXT,
  rrule TEXT,                       -- iCal RRULE 形式
  from_line INTEGER NOT NULL DEFAULT 0 CHECK (from_line IN (0, 1)),
  anniversary INTEGER NOT NULL DEFAULT 0 CHECK (anniversary IN (0, 1)),
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_schedule_entries_pair_start ON schedule_entries (pair_id, start_at);
