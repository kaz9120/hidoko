// wrangler types が生成する Cloudflare.Env を土台に、wrangler.jsonc には書いていない
// Email Service の send binding をオプションで足す。本番で binding を有効化したら
// wrangler.jsonc に書き足し、ここの拡張は外す。
export interface Env extends Cloudflare.Env {
	EMAIL?: { send: (message: unknown) => Promise<void> };
}
