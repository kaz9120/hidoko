-- ============================================================
-- hidoko-id 初回マイグレーション。
-- vertical slice 用に最小テーブルだけ用意する。
-- v1 拡張時に sessions に user_agent / ip / revoked_at、
-- oauth_clients / oauth_grants 等を別マイグレーションで足す。
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id              TEXT PRIMARY KEY,
  email           TEXT NOT NULL UNIQUE,
  email_verified  INTEGER NOT NULL DEFAULT 0,
  password_hash   TEXT NOT NULL,
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  created_at  INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id);

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  token_hash  TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  created_at  INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL,
  used_at     INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user ON email_verification_tokens (user_id);
