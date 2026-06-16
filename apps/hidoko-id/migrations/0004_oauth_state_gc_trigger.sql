-- ============================================================
-- oauth_state テーブルのピギーバック GC（#202 ハードニング）。
-- 認可フローが途中で破棄されると callback に辿り着かない state 行が残るので、
-- 新規 INSERT のタイミングで失効済みをまとめて掃除する。0003 ですでに
-- 作成済みの oauth_state テーブルに対するトリガー追加。
-- ============================================================

CREATE TRIGGER IF NOT EXISTS trg_oauth_state_gc_before_insert
BEFORE INSERT ON oauth_state
BEGIN
  DELETE FROM oauth_state WHERE expires_at < NEW.created_at;
END;
