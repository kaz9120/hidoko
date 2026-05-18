-- dev / preview 用のシードデータ。本番 D1 で実行しないこと。
-- `X-Dev-User: u_me` ヘッダで認証バイパスしたときに引かれる pair / users / status_items。
--
-- pairs の `user_low_id < user_high_id` CHECK 制約に合わせて 'u_me' < 'u_partner'
-- (辞書順) の並びで投入する。
--
-- NOTE: D1 / Workers 環境では SQL の `BEGIN`/`COMMIT` が使えない
-- (Durable Objects は state.storage.transaction() API を要求する)。
-- そのため本ファイルはトランザクション無しの逐次実行。途中失敗時は
-- `bun run db:reset:local` で .wrangler/state を丸ごと消して再投入する。

-- 既存をクリア (再実行可能にする)
DELETE FROM day_statuses;
DELETE FROM schedule_entries;
DELETE FROM status_items;
DELETE FROM pairs;
DELETE FROM users;

-- ユーザー
INSERT INTO users (id, display_name) VALUES
  ('u_me',      'はる'),
  ('u_partner', 'けい');

-- ペア (アクティブ)
INSERT INTO pairs (id, user_low_id, user_high_id, status) VALUES
  ('p_dev', 'u_me', 'u_partner', 'active');

-- ステータス項目 (プロトタイプ sample.ts と同じ 4 項目)
INSERT INTO status_items (id, pair_id, name, emoji, color, assignee, sort_order, options, weekday_defaults) VALUES
  ('si_work_h', 'p_dev', '夫の勤務', '👔', 'var(--ember-400)', 'partner', 0,
    '[{"id":"office","label":"出社","emoji":"🏢"},{"id":"remote","label":"リモート","emoji":"🏠"},{"id":"off","label":"休日","emoji":"🌙"}]',
    '{"mon":"office","tue":"remote","wed":"office","thu":"remote","fri":"remote","sat":"off","sun":"off"}'),
  ('si_work_w', 'p_dev', '妻の勤務', '💻', 'var(--moon)', 'me', 1,
    '[{"id":"office","label":"出社","emoji":"🏢"},{"id":"remote","label":"リモート","emoji":"🏠"},{"id":"off","label":"休日","emoji":"🌙"}]',
    '{"mon":"remote","tue":"remote","wed":"office","thu":"remote","fri":"office","sat":"off","sun":"off"}'),
  ('si_bento', 'p_dev', '弁当', '🍱', 'var(--moss)', 'me', 2,
    '[{"id":"yes","label":"必要","emoji":"🍱"},{"id":"no","label":"不要","emoji":"✕"}]',
    '{"mon":"yes","tue":"no","wed":"yes","thu":"no","fri":"no","sat":"no","sun":"no"}'),
  ('si_dinner', 'p_dev', '晩御飯', '🍚', 'var(--ember-500)', 'both', 3,
    '[{"id":"home","label":"ふたり家","emoji":"🍚"},{"id":"eatout","label":"ふたり外","emoji":"🍻"},{"id":"apart","label":"別行動","emoji":"↔︎"},{"id":"none","label":"不要","emoji":"✕"}]',
    '{"mon":"home","tue":"home","wed":"home","thu":"home","fri":"home","sat":"home","sun":"home"}');
