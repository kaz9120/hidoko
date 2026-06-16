-- ============================================================
-- Google OIDC（#202）のための identity 紐付けと一時 state 保管。
-- identities: ユーザーに連携した外部プロバイダ ID（Google / 将来 GitHub 等）。
--   provider + provider_user_id で一意。同じ Google アカウントが
--   別ユーザーに紐付くことはない。
-- oauth_state: /oauth/start から /oauth/callback まで持ち回す
--   state / nonce / return_to の一時保管。10 分で失効・ワンタイム。
-- ============================================================

CREATE TABLE IF NOT EXISTS identities (
  id                  TEXT PRIMARY KEY,
  user_id             TEXT NOT NULL,
  provider            TEXT NOT NULL,
  provider_user_id    TEXT NOT NULL,
  created_at          INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_identities_provider_user
  ON identities (provider, provider_user_id);

CREATE INDEX IF NOT EXISTS idx_identities_user
  ON identities (user_id);

CREATE TABLE IF NOT EXISTS oauth_state (
  state       TEXT PRIMARY KEY,
  provider    TEXT NOT NULL,
  nonce       TEXT NOT NULL,
  return_to   TEXT,
  created_at  INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_oauth_state_expires
  ON oauth_state (expires_at);
