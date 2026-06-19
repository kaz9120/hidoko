/**
 * GA4 (Google Analytics 4) と Microsoft Clarity の計測スニペットを共通化した
 * コンポーネント (Issue #79)。ID が未設定 (空文字 / null / undefined) のときは
 * 何もレンダリングしないので、dev サーバや preview デプロイでは自動的に
 * 計測が走らない (env が未設定だから)。
 *
 * SSR / SSG 環境でも安全に <script> タグだけ吐き出せるよう、`dangerouslySetInnerHTML`
 * で原文を埋め込む形にしている。React Router v7 の <Scripts /> より前に置く
 * ことで、ページの早い段階で計測が始まる。
 *
 * - GA4: `gtag.js` をロードし、`dataLayer` を初期化して `config` を発行
 * - Clarity: 公式の最小スニペットを埋め込み (mask 設定は `clarityMask` で切替)
 */

type ClarityMaskMode = "off" | "balanced" | "strict";

export type AnalyticsProps = {
	/**
	 * GA4 の測定 ID (`G-XXXXXXXXXX`)。未設定なら GA4 タグは出力されない。
	 * Vite の env で言えば `import.meta.env.VITE_GA_ID` を渡す想定。
	 */
	gaId?: string | null;
	/**
	 * Microsoft Clarity のプロジェクト ID。未設定なら Clarity タグは出力されない。
	 * Vite の env で言えば `import.meta.env.VITE_CLARITY_ID` を渡す想定。
	 */
	clarityId?: string | null;
	/**
	 * Clarity のマスキング強度 (画像 / 入力フォームの伏字レベル)。
	 * - `off`: マスクなし (Clarity の標準動作)
	 * - `balanced`: 標準の伏字 (Clarity の既定)
	 * - `strict`: フォーム + 画像も含めて伏字。snapcrop のように
	 *   「セッション記録に編集中の画像を含めない」要件がある app で使う。
	 *
	 * snapcrop は `"strict"` 固定で使う前提 (Issue #79 の Done 条件)。
	 */
	clarityMask?: ClarityMaskMode;
};

export function Analytics({
	gaId,
	clarityId,
	clarityMask = "balanced",
}: AnalyticsProps) {
	return (
		<>
			{gaId ? <Ga4Scripts gaId={gaId} /> : null}
			{clarityId ? (
				<ClarityScript clarityId={clarityId} mask={clarityMask} />
			) : null}
		</>
	);
}

function Ga4Scripts({ gaId }: { gaId: string }) {
	const inline = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`;
	return (
		<>
			<script
				async
				src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
			/>
			<script dangerouslySetInnerHTML={{ __html: inline }} />
		</>
	);
}

function ClarityScript({
	clarityId,
	mask,
}: {
	clarityId: string;
	mask: ClarityMaskMode;
}) {
	// Clarity 公式のロードスニペット。`mask` は別 API (`clarity('set', ...)`) で
	// 後付けする (snippet のロード直後に呼んで反映する)。
	const loader = `(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${clarityId}");`;
	const maskCall =
		mask === "strict"
			? `window.clarity && window.clarity('set', 'mask', 'all');`
			: mask === "off"
				? `window.clarity && window.clarity('set', 'mask', 'none');`
				: "";
	const inline = maskCall ? `${loader}\n${maskCall}` : loader;
	return <script dangerouslySetInnerHTML={{ __html: inline }} />;
}
