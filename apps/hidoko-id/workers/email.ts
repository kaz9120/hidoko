import type { Env } from "./types";

interface VerificationEmail {
	to: string;
	verifyUrl: string;
}

const FROM_ADDRESS = "no-reply@id.y-kaz.com";
const SUBJECT = "アカウント確認のご案内";

/**
 * 本番では Cloudflare Email Service の send_email binding で送信する。
 * dev は EMAIL_DEV_LOG=true で console + SPA フォールバック（/verify-email
 * の DEV ONLY ブロックに検証 URL を返す）に切り替える。
 */
export async function sendVerificationEmail(
	env: Env,
	mail: VerificationEmail,
): Promise<{ sent: boolean; devUrl?: string }> {
	if (env.EMAIL_DEV_LOG === "true") {
		console.warn(
			"[hidoko-id] EMAIL_DEV_LOG=true: 検証 URL を SPA に返してフォールバックする",
			{ to: mail.to, verifyUrl: mail.verifyUrl },
		);
		return { sent: false, devUrl: mail.verifyUrl };
	}

	await env.EMAIL.send({
		to: mail.to,
		from: FROM_ADDRESS,
		subject: SUBJECT,
		text: verificationText(mail.verifyUrl),
		html: verificationHtml(mail.verifyUrl),
	});
	return { sent: true };
}

function verificationText(verifyUrl: string): string {
	return [
		"アカウント作成リクエストを受け付けた。",
		"",
		"以下のリンクを開くと、メールアドレスの確認が完了する。",
		"リンクは 24 時間で失効する。",
		"",
		verifyUrl,
		"",
		"このメールに心当たりがない場合は、無視して問題ない。",
	].join("\n");
}

function verificationHtml(verifyUrl: string): string {
	const safeUrl = escapeHtml(verifyUrl);
	return [
		"<!doctype html>",
		'<html lang="ja"><body>',
		"<p>アカウント作成リクエストを受け付けた。</p>",
		"<p>以下のリンクを開くと、メールアドレスの確認が完了する。リンクは 24 時間で失効する。</p>",
		`<p><a href="${safeUrl}">${safeUrl}</a></p>`,
		"<p>このメールに心当たりがない場合は、無視して問題ない。</p>",
		"</body></html>",
	].join("\n");
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}
