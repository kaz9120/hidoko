// セッション ID / メール検証トークンの生成・ハッシュ化用ユーティリティ。

function toBase64Url(bytes: Uint8Array): string {
	let str = "";
	for (const b of bytes) str += String.fromCharCode(b);
	return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function toHex(bytes: Uint8Array): string {
	const hex: string[] = [];
	for (const b of bytes) hex.push(b.toString(16).padStart(2, "0"));
	return hex.join("");
}

/** ランダムな base64url 文字列（n バイトの乱数を元に）。デフォルト 32 バイト = 約 43 文字。 */
export function randomToken(n = 32): string {
	const bytes = crypto.getRandomValues(new Uint8Array(n));
	return toBase64Url(bytes);
}

/** SHA-256 ハッシュ（16 進）。トークンは平文を返してハッシュだけ DB に保存する。 */
export async function sha256Hex(input: string): Promise<string> {
	const encoder = new TextEncoder();
	const buf = await crypto.subtle.digest("SHA-256", encoder.encode(input));
	return toHex(new Uint8Array(buf));
}

/** UUID v4。ID 列に使う。Workers の crypto.randomUUID は標準で使える。 */
export function newId(): string {
	return crypto.randomUUID();
}

/** 現在時刻を ms で返す（DB は INTEGER で保存する）。 */
export function now(): number {
	return Date.now();
}
