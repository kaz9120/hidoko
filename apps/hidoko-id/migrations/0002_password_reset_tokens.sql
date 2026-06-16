-- ============================================================
-- パスワード再設定（#203）のためのトークンテーブル。
-- メール内リンクで届くワンタイムトークン。24h で失効、
-- 使ったら used_at が立って二度と使えない。
-- ============================================================

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  token_hash  TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  created_at  INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL,
  used_at     INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user
  ON password_reset_tokens (user_id);
