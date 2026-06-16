-- ============================================================
-- アカウント設定（#204 phase 1）。
-- sessions に端末情報・最終アクセス時刻を足してセッション一覧で表示できるように。
-- users にプロフィール表示用の表示名・アバター URL を足す。どちらも NULL 許容で、
-- 既存ユーザーは何も埋まらない状態のままで動く。
-- ============================================================

ALTER TABLE sessions ADD COLUMN user_agent  TEXT;
ALTER TABLE sessions ADD COLUMN ip          TEXT;
ALTER TABLE sessions ADD COLUMN last_seen_at INTEGER;

ALTER TABLE users ADD COLUMN display_name TEXT;
ALTER TABLE users ADD COLUMN avatar_url   TEXT;
