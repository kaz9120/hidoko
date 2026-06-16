// パスワード強度スコア（0〜3 の 4 段階）。
// zxcvbn は SPA バンドルに重いので軽量ヒューリスティクスで代替する。
// サーバー側ルール（12 文字以上、英字・数字を含む）の baseline を満たしていない
// 間は 0 を返す。baseline を満たしたあとは、長さと文字種の多様性で +1 ずつ加算する。

import { checkPassword } from "./password";

export type StrengthLabel = "弱い" | "並" | "熾火" | "強い";

export interface StrengthScore {
	/** 0〜3 の 4 段階。 */
	score: 0 | 1 | 2 | 3;
	/** UI 表示用ラベル。 */
	label: StrengthLabel;
}

const LABELS: readonly StrengthLabel[] = ["弱い", "並", "熾火", "強い"];

export function scorePassword(password: string): StrengthScore {
	if (!password) return { score: 0, label: LABELS[0] };

	const baseline = checkPassword(password).ok;
	if (!baseline) return { score: 0, label: LABELS[0] };

	let bonus = 0;
	const hasUpper = /[A-Z]/.test(password);
	const hasLower = /[a-z]/.test(password);
	const hasSymbol = /[^A-Za-z0-9]/.test(password);

	if ((hasUpper && hasLower) || hasSymbol) bonus++;
	if (password.length >= 16) bonus++;

	const score = Math.min(3, 1 + bonus) as 1 | 2 | 3;
	return { score, label: LABELS[score] };
}
