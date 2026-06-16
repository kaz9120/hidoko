-- ============================================================
-- メール変更（#204 phase 2）用のトークンテーブル。
-- 新しいメールアドレス宛にワンタイムリンクを送り、踏まれたら users.email を
-- 差し替える。トークンは 24h で失効、ワンタイム。
-- ============================================================

CREATE TABLE IF NOT EXISTS email_change_tokens (
  token_hash  TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  new_email   TEXT NOT NULL,
  created_at  INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL,
  used_at     INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_email_change_tokens_user
  ON email_change_tokens (user_id);

-- 1 ユーザーにつき有効な未使用トークンは最大 1 件。並行で 2 回申請しても
-- 古いものが弾かれる。
CREATE UNIQUE INDEX IF NOT EXISTS uq_email_change_tokens_user_active
  ON email_change_tokens (user_id)
  WHERE used_at IS NULL;
