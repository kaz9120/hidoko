// wrangler types が生成する Cloudflare.Env を土台に拡張する。
// - `vars` は wrangler.jsonc の文字列をリテラル型として出してしまうので（dev では
//   `.dev.vars` で値が変わる）、string に広げて比較できるようにする。
// - Email Service の send binding は wrangler.jsonc にはまだ書いていないので
//   optional で足す。本番で binding を有効化したらここの拡張は外す。
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
	EMAIL?: { send: (message: unknown) => Promise<void> };
}
