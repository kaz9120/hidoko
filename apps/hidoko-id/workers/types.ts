// wrangler types が生成する Cloudflare.Env を土台に拡張する。
// `vars` は wrangler.jsonc の文字列をリテラル型として出してしまうので（dev では
// `.dev.vars` で値が変わる）、string に広げて比較できるようにする。
// `EMAIL` は wrangler.jsonc の send_email バインディング由来で
// `SendEmail` として生成済み。本番では必ず存在する。dev では実機接続せず
// `EMAIL_DEV_LOG=true` でフォールバックさせる前提。
type VarKeys =
	| "FIRST_PARTY_ORIGINS"
	| "SESSION_COOKIE_DOMAIN"
	| "PUBLIC_BASE_URL"
	| "EMAIL_DEV_LOG";

export interface Env extends Omit<Cloudflare.Env, VarKeys> {
	FIRST_PARTY_ORIGINS: string;
	SESSION_COOKIE_DOMAIN: string;
	PUBLIC_BASE_URL: string;
	EMAIL_DEV_LOG: string;
}
