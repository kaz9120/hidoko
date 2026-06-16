// /oauth/callback/google から /signin?oauth_error=… で戻ってきたときに、
// SPA 側で表示する日本語メッセージ。Worker 側のエラーコードと 1:1 で対応する。

const MESSAGES: Record<string, string> = {
	oidc_not_configured: "Google でのサインインは準備中",
	missing_params: "Google からの戻りが不完全。もう一度やり直す",
	state_expired:
		"サインインの有効期限が切れた。もう一度 Google ボタンから始める",
	token_exchange_failed: "Google との連携に失敗した。時間をおいてやり直す",
	missing_id_token: "Google からの情報が足りなかった。もう一度やり直す",
	invalid_id_token: "Google からの情報を解釈できなかった",
	invalid_issuer: "Google からの情報の発行元を確認できなかった",
	invalid_audience: "Google からの情報の宛先が一致しなかった",
	id_token_expired: "Google からの情報の有効期限が切れていた。やり直す",
	nonce_mismatch: "サインイン情報が一致しなかった。最初からやり直す",
	email_not_verified:
		"Google でメールアドレスの確認が済んでいない。Google で確認してから戻る",
	oauth_access_denied: "Google でのサインインがキャンセルされた",
};

export function oauthErrorMessage(code: string): string {
	const direct = MESSAGES[code];
	if (direct) return direct;
	// `oauth_<provider error>` 形のフォールバック。
	if (code.startsWith("oauth_"))
		return "Google でのサインインがキャンセルされた、または失敗した";
	return "Google でのサインインに失敗した";
}
