import type { Env } from "./types";

interface VerificationEmail {
	to: string;
	verifyUrl: string;
}

/**
 * dev では sender が未設定なケースが多いので、その場合は console に出して呼び出し側に
 * URL を返せるようにする（/verify-email 画面に表示）。prod は Cloudflare Email Service
 * バインディング EMAIL を使う。Email Service 周りの DNS/Routes 設定は別 PR で。
 */
export async function sendVerificationEmail(
	env: Env,
	mail: VerificationEmail,
): Promise<{ sent: boolean; devUrl?: string }> {
	if (env.EMAIL && typeof env.EMAIL.send === "function") {
		// MIME を作る。EmailMessage 相当のオブジェクトは Email Service ランタイムが提供する
		// グローバルだが、型を絞ると依存が増えるので緩く渡す。
		const message = buildMimeMessage({
			from: "no-reply@id.y-kaz.com",
			to: mail.to,
			subject: "アカウント確認のご案内",
			body: verificationBody(mail.verifyUrl),
		});
		await env.EMAIL.send(message);
		return { sent: true };
	}
	if (env.EMAIL_DEV_LOG === "true") {
		console.warn(
			"[hidoko-id] EMAIL binding が未設定。検証 URL を SPA に返してフォールバックする",
			{ to: mail.to, verifyUrl: mail.verifyUrl },
		);
		return { sent: false, devUrl: mail.verifyUrl };
	}
	throw new Error("EMAIL binding がなく EMAIL_DEV_LOG も無効");
}

function verificationBody(verifyUrl: string): string {
	return [
		"アカウント作成リクエストを受け付けた",
		"",
		"以下のリンクを開くと、メールアドレスの確認が完了する。",
		"リンクは 24 時間で失効する",
		"",
		verifyUrl,
		"",
		"このメールに心当たりがない場合は、無視して問題ない",
	].join("\n");
}

function buildMimeMessage(args: {
	from: string;
	to: string;
	subject: string;
	body: string;
}): string {
	const boundary = `boundary-${crypto.randomUUID()}`;
	return [
		`From: ${args.from}`,
		`To: ${args.to}`,
		`Subject: ${encodeRfc2047(args.subject)}`,
		"MIME-Version: 1.0",
		`Content-Type: multipart/alternative; boundary="${boundary}"`,
		"",
		`--${boundary}`,
		"Content-Type: text/plain; charset=UTF-8",
		"Content-Transfer-Encoding: 8bit",
		"",
		args.body,
		"",
		`--${boundary}--`,
		"",
	].join("\r\n");
}

function encodeRfc2047(value: string): string {
	// 単純な UTF-8 base64 エンコード。subject 内の非 ASCII を扱うため。
	const encoder = new TextEncoder();
	const bytes = encoder.encode(value);
	let binary = "";
	for (const b of bytes) binary += String.fromCharCode(b);
	return `=?UTF-8?B?${btoa(binary)}?=`;
}
