// Google ブランドガイドラインに沿った "G" マーク（簡易版）。
// 公式アセットを画像で持つ代わりに、CTA ボタンの内部に置きやすい SVG 形式で再現する。

interface GoogleGIconProps {
	className?: string;
	size?: number;
}

export function GoogleGIcon({ className, size = 16 }: GoogleGIconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			width={size}
			height={size}
			role="img"
			aria-label="Google"
			className={className}
		>
			<title>Google</title>
			<path
				fill="#EA4335"
				d="M12 5c1.617 0 3.06.553 4.198 1.625l3.123-3.123C17.398 1.625 14.864 0.7 12 0.7 7.392 0.7 3.397 3.34 1.386 7.18l3.643 2.83C5.99 7.06 8.74 5 12 5z"
			/>
			<path
				fill="#FBBC05"
				d="M5.5 12c0-.967.166-1.892.471-2.755L2.328 6.415A11.34 11.34 0 0 0 .7 12c0 1.967.49 3.826 1.358 5.5l3.643-2.83A6.46 6.46 0 0 1 5.5 12z"
			/>
			<path
				fill="#34A853"
				d="M12 19c-3.26 0-6.01-2.06-7.029-4.91L1.328 17.5C3.398 21.34 7.392 23.3 12 23.3c2.864 0 5.398-.925 7.321-2.802L15.5 17.7c-.97.7-2.193 1.3-3.5 1.3z"
			/>
			<path
				fill="#4285F4"
				d="M23.3 12c0-.77-.07-1.51-.2-2.25H12v4.5h6.36c-.27 1.41-1.08 2.61-2.31 3.45l3.821 2.798C22.122 18.49 23.3 15.46 23.3 12z"
			/>
		</svg>
	);
}
