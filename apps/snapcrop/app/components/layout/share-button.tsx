import { Button } from "ui";

const APP_URL = "https://snapcrop.y-kaz.com/?ref=share";

const SHARE_TEXT = `snapcrop — 撮って、書いて、すぐ共有
${APP_URL}`;

const TWEET_INTENT_URL = "https://twitter.com/intent/tweet";

/**
 * X の web intent を新規タブで開くシェアチップ。事前入力テキストは
 * 「体験のシェア」構文 (本文に作者 mention、URL に ?ref=share) で固定。
 */
export function ShareButton() {
	const handleClick = () => {
		const url = new URL(TWEET_INTENT_URL);
		url.searchParams.set("text", SHARE_TEXT);
		window.open(url.toString(), "_blank", "noopener,noreferrer");
	};

	return (
		<Button
			className="rounded-full"
			onClick={handleClick}
			size="sm"
			variant="outline"
		>
			<XLogoIcon />
			シェア
		</Button>
	);
}

// X (旧 Twitter) のロゴは lucide に無いため SVG を直書きする。
function XLogoIcon() {
	return (
		<svg
			aria-hidden="true"
			className="size-3.5"
			fill="currentColor"
			viewBox="0 0 24 24"
		>
			<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
		</svg>
	);
}
