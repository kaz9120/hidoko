// クライアント側のパスワード強度判定。サーバー側（workers/password.ts）と同じルール:
// 12 文字以上、英字と数字を最低 1 つずつ。記号は任意。

export interface PasswordCheck {
	ok: boolean;
	reason?: "too_short" | "missing_letter" | "missing_digit";
}

export function checkPassword(password: string): PasswordCheck {
	if (password.length < 12) return { ok: false, reason: "too_short" };
	if (!/[A-Za-z]/.test(password))
		return { ok: false, reason: "missing_letter" };
	if (!/\d/.test(password)) return { ok: false, reason: "missing_digit" };
	return { ok: true };
}

export function passwordHint(check: PasswordCheck): string {
	if (check.ok) return "";
	switch (check.reason) {
		case "too_short":
			return "12 文字以上が必要";
		case "missing_letter":
			return "英字を最低 1 つ含める";
		case "missing_digit":
			return "数字を最低 1 つ含める";
		default:
			return "";
	}
}
