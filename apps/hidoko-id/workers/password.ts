// Workers の Web Crypto で動くパスワードハッシュ。PBKDF2-SHA256。
// workerd ランタイムは CPU 時間圧迫 / DoS 対策で PBKDF2 iterations を 100,000 に
// 上限制限しているため、OWASP 2024 推奨（600,000）はそのまま使えない。
// 100,000 は OWASP 2021 推奨（120,000）も下回るため、argon2id / scrypt への
// 移行を別 issue で追跡する。
//
// 保存形式: `pbkdf2$<iterations>$<base64url salt>$<base64url hash>`

const ITERATIONS = 100_000;
const SALT_BYTES = 16;
const KEY_BITS = 256;

function toBase64Url(bytes: Uint8Array): string {
	let str = "";
	for (const b of bytes) str += String.fromCharCode(b);
	return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array {
	const padded =
		s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
	const bin = atob(padded);
	const out = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
	return out;
}

async function deriveBits(
	password: string,
	salt: Uint8Array,
	iterations: number,
): Promise<Uint8Array> {
	const encoder = new TextEncoder();
	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		encoder.encode(password),
		{ name: "PBKDF2" },
		false,
		["deriveBits"],
	);
	const bits = await crypto.subtle.deriveBits(
		{
			name: "PBKDF2",
			salt: salt as BufferSource,
			iterations,
			hash: "SHA-256",
		},
		keyMaterial,
		KEY_BITS,
	);
	return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
	const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
	const hash = await deriveBits(password, salt, ITERATIONS);
	return `pbkdf2$${ITERATIONS}$${toBase64Url(salt)}$${toBase64Url(hash)}`;
}

/**
 * 定数時間で比較する。length が違うときは false を返すが、それ自体はタイミング差を生まない。
 */
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) {
		const av = a[i] ?? 0;
		const bv = b[i] ?? 0;
		diff |= av ^ bv;
	}
	return diff === 0;
}

export async function verifyPassword(
	password: string,
	stored: string,
): Promise<boolean> {
	const parts = stored.split("$");
	if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
	const iters = Number(parts[1]);
	if (!Number.isFinite(iters) || iters < 1000) return false;
	const salt = fromBase64Url(parts[2] ?? "");
	const expected = fromBase64Url(parts[3] ?? "");
	const actual = await deriveBits(password, salt, iters);
	return constantTimeEqual(expected, actual);
}
