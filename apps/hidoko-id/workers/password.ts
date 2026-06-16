// パスワードハッシュは scrypt (RFC 7914) を使う。Workers ランタイムは PBKDF2 の
// iterations を 100,000 に上限制限しており、OWASP 2024 推奨（600,000）の 1/6 しか
// 出せない。scrypt は memory-hard で、Workers の純 JS でも OWASP 最小推奨を満たせる。
//
// 既存ユーザーの PBKDF2 ハッシュも検証できるよう、保存形式の prefix で分岐する。
// signin で PBKDF2 ユーザーが認証成功したら、呼び出し側が `needsRehash` を見て
// scrypt に rehash して上書きする（透過マイグレーション）。
//
// scrypt パラメータ: N = 2^15, r = 8, p = 1, dkLen = 32。
// メモリは約 32 MB（≒ 128 * r * N バイト）で、Workers の 128 MB メモリ制限に余裕
// あり。OWASP 最小推奨（N >= 2^15）も満たす。
//
// 保存形式:
//   scrypt$<N>$<r>$<p>$<base64url salt>$<base64url hash>
//   pbkdf2$<iterations>$<base64url salt>$<base64url hash>   （旧形式・読み取り専用）

import { scrypt } from "@noble/hashes/scrypt.js";

const SCRYPT_N = 2 ** 15;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_DK_LEN = 32;
const SALT_BYTES = 16;
const PBKDF2_KEY_BITS = 256;

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

async function pbkdf2DeriveBits(
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
		PBKDF2_KEY_BITS,
	);
	return new Uint8Array(bits);
}

function scryptDeriveBits(
	password: string,
	salt: Uint8Array,
	N: number,
	r: number,
	p: number,
): Uint8Array {
	return scrypt(password, salt, { N, r, p, dkLen: SCRYPT_DK_LEN });
}

export async function hashPassword(password: string): Promise<string> {
	const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
	const hash = scryptDeriveBits(password, salt, SCRYPT_N, SCRYPT_R, SCRYPT_P);
	return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${toBase64Url(salt)}$${toBase64Url(hash)}`;
}

export async function verifyPassword(
	password: string,
	stored: string,
): Promise<boolean> {
	const parts = stored.split("$");
	const algo = parts[0];

	if (algo === "scrypt") {
		if (parts.length !== 6) return false;
		const N = Number(parts[1]);
		const r = Number(parts[2]);
		const p = Number(parts[3]);
		if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) {
			return false;
		}
		// N は 2 のべき乗であること（RFC 7914）。
		if (N < 2 || (N & (N - 1)) !== 0) return false;
		if (r < 1 || p < 1) return false;
		const salt = fromBase64Url(parts[4] ?? "");
		const expected = fromBase64Url(parts[5] ?? "");
		const actual = scryptDeriveBits(password, salt, N, r, p);
		return constantTimeEqual(expected, actual);
	}

	if (algo === "pbkdf2") {
		if (parts.length !== 4) return false;
		const iters = Number(parts[1]);
		if (!Number.isFinite(iters) || iters < 1000) return false;
		const salt = fromBase64Url(parts[2] ?? "");
		const expected = fromBase64Url(parts[3] ?? "");
		const actual = await pbkdf2DeriveBits(password, salt, iters);
		return constantTimeEqual(expected, actual);
	}

	return false;
}

/**
 * 保存形式が現行アルゴリズム・現行パラメータかを判定する。
 * 旧 pbkdf2、scrypt でも N/r/p が今より弱い場合、フォーマット異常の場合に true を返す。
 * signin 成功時に呼び出して、true なら hashPassword で再生成して上書きする。
 */
export function needsRehash(stored: string): boolean {
	const parts = stored.split("$");
	if (parts[0] !== "scrypt" || parts.length !== 6) return true;
	const N = Number(parts[1]);
	const r = Number(parts[2]);
	const p = Number(parts[3]);
	if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) {
		return true;
	}
	return N < SCRYPT_N || r < SCRYPT_R || p < SCRYPT_P;
}

/**
 * 認証失敗時のタイミング攻撃対策に使うダミーハッシュ。
 * 現行アルゴリズムの prefix で書かれているので、verifyPassword は 1 回 scrypt を
 * 走らせてから length 不一致で false を返す。ユーザーが存在しないケースでも
 * 応答時間が揃う。
 */
export const DUMMY_PASSWORD_HASH = `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$AAAA$AAAA`;
