import type { Env } from "./types";

interface VerificationEmail {
	to: string;
	verifyUrl: string;
}

interface PasswordResetEmail {
	to: string;
	resetUrl: string;
}

interface EmailChangeEmail {
	to: string;
	verifyUrl: string;
	currentEmail: string;
}

interface EmailChangeNoticeEmail {
	to: string;
	newEmail: string;
}

const FROM_ADDRESS = "no-reply@id.y-kaz.com";
const SUBJECT = "アカウント確認のご案内";
const PASSWORD_RESET_SUBJECT = "アカウントパスワードの再設定";
const EMAIL_CHANGE_SUBJECT = "メールアドレス変更の確認";
const EMAIL_CHANGE_NOTICE_SUBJECT = "メールアドレス変更の申請";

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

/**
 * パスワード再設定リンクを送る。dev fallback の挙動は検証メールと同じ。
 */
export async function sendPasswordResetEmail(
	env: Env,
	mail: PasswordResetEmail,
): Promise<{ sent: boolean; devUrl?: string }> {
	if (env.EMAIL_DEV_LOG === "true") {
		console.warn(
			"[hidoko-id] EMAIL_DEV_LOG=true: 再設定 URL を SPA に返してフォールバックする",
			{ to: mail.to, resetUrl: mail.resetUrl },
		);
		return { sent: false, devUrl: mail.resetUrl };
	}

	await env.EMAIL.send({
		to: mail.to,
		from: FROM_ADDRESS,
		subject: PASSWORD_RESET_SUBJECT,
		text: passwordResetText(mail.resetUrl),
		html: passwordResetHtml(mail.resetUrl),
	});
	return { sent: true };
}

function passwordResetText(resetUrl: string): string {
	return [
		"パスワード再設定の申請を受け付けた。",
		"",
		"以下のリンクを開くと、新しいパスワードを設定できる。",
		"リンクは 24 時間で失効する。",
		"",
		resetUrl,
		"",
		"このメールに心当たりがない場合は、無視して問題ない。",
		"申請者がそのまま諦めれば、パスワードは変わらないまま。",
	].join("\n");
}

function passwordResetHtml(resetUrl: string): string {
	const safeUrl = escapeHtml(resetUrl);
	return [
		"<!doctype html>",
		'<html lang="ja"><body>',
		"<p>パスワード再設定の申請を受け付けた。</p>",
		"<p>以下のリンクを開くと、新しいパスワードを設定できる。リンクは 24 時間で失効する。</p>",
		`<p><a href="${safeUrl}">${safeUrl}</a></p>`,
		"<p>このメールに心当たりがない場合は、無視して問題ない。申請者がそのまま諦めれば、パスワードは変わらないまま。</p>",
		"</body></html>",
	].join("\n");
}

/**
 * メールアドレス変更の確認リンクを「新しいメール」宛に送る。リンクを踏むと
 * users.email が新しい値に切り替わる。
 */
export async function sendEmailChangeVerification(
	env: Env,
	mail: EmailChangeEmail,
): Promise<{ sent: boolean; devUrl?: string }> {
	if (env.EMAIL_DEV_LOG === "true") {
		console.warn(
			"[hidoko-id] EMAIL_DEV_LOG=true: メール変更 URL を SPA に返してフォールバックする",
			{ to: mail.to, verifyUrl: mail.verifyUrl },
		);
		return { sent: false, devUrl: mail.verifyUrl };
	}

	await env.EMAIL.send({
		to: mail.to,
		from: FROM_ADDRESS,
		subject: EMAIL_CHANGE_SUBJECT,
		text: emailChangeText(mail.verifyUrl, mail.currentEmail),
		html: emailChangeHtml(mail.verifyUrl, mail.currentEmail),
	});
	return { sent: true };
}

/**
 * メールアドレス変更が「旧メール宛」にも届ける通知。心当たりがないユーザーが
 * 気づけるように、リンクは付けず通知のみ。
 */
export async function sendEmailChangeNotice(
	env: Env,
	mail: EmailChangeNoticeEmail,
): Promise<{ sent: boolean }> {
	if (env.EMAIL_DEV_LOG === "true") {
		console.warn(
			"[hidoko-id] EMAIL_DEV_LOG=true: 旧メール通知を console に出すだけ",
			{ to: mail.to, newEmail: mail.newEmail },
		);
		return { sent: false };
	}

	await env.EMAIL.send({
		to: mail.to,
		from: FROM_ADDRESS,
		subject: EMAIL_CHANGE_NOTICE_SUBJECT,
		text: emailChangeNoticeText(mail.newEmail),
		html: emailChangeNoticeHtml(mail.newEmail),
	});
	return { sent: true };
}

function emailChangeText(verifyUrl: string, currentEmail: string): string {
	return [
		`現在のメールアドレス（${currentEmail}）を、こちらのアドレスに変える申請を受け付けた。`,
		"",
		"以下のリンクを開くと、新しいメールアドレスへの切り替えが完了する。",
		"リンクは 24 時間で失効する。",
		"",
		verifyUrl,
		"",
		"このメールに心当たりがない場合は、無視して問題ない。",
	].join("\n");
}

function emailChangeHtml(verifyUrl: string, currentEmail: string): string {
	const safeUrl = escapeHtml(verifyUrl);
	const safeCurrent = escapeHtml(currentEmail);
	return [
		"<!doctype html>",
		'<html lang="ja"><body>',
		`<p>現在のメールアドレス（${safeCurrent}）を、こちらのアドレスに変える申請を受け付けた。</p>`,
		"<p>以下のリンクを開くと、新しいメールアドレスへの切り替えが完了する。リンクは 24 時間で失効する。</p>",
		`<p><a href="${safeUrl}">${safeUrl}</a></p>`,
		"<p>このメールに心当たりがない場合は、無視して問題ない。</p>",
		"</body></html>",
	].join("\n");
}

function emailChangeNoticeText(newEmail: string): string {
	return [
		`このアカウントのメールアドレスを ${newEmail} に変えたいという申請を受け付けた。`,
		"",
		"新しいメールアドレス宛に確認リンクを送った。リンクが踏まれるまで、このメールアドレスは有効。",
		"",
		"心当たりがない場合は、パスワードを再設定して他端末をすべてサインアウトする。",
	].join("\n");
}

function emailChangeNoticeHtml(newEmail: string): string {
	const safeNew = escapeHtml(newEmail);
	return [
		"<!doctype html>",
		'<html lang="ja"><body>',
		`<p>このアカウントのメールアドレスを ${safeNew} に変えたいという申請を受け付けた。</p>`,
		"<p>新しいメールアドレス宛に確認リンクを送った。リンクが踏まれるまで、このメールアドレスは有効。</p>",
		"<p>心当たりがない場合は、パスワードを再設定して他端末をすべてサインアウトする。</p>",
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
