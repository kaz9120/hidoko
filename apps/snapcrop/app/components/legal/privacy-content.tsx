import { LegalSection } from "~/components/layout/legal-page";

export const PRIVACY_LAST_UPDATED = "2026-06-16";

/**
 * プライバシーポリシーの本文。単独ページ (`/privacy`) とフッターから開く
 * Dialog の両方で同じ DOM を共有する。外側のレイアウト (LegalPage / Dialog)
 * は呼び出し側で wrap する。
 */
export function PrivacyContent() {
	return (
		<>
			<LegalSection heading="基本方針">
				<p>
					snapcrop（以下「本サービス」）は、画像の切り抜き・加工をブラウザだけで完結させることを目的としたツールです。運営者（@kyamamoto9120）は、利用者の情報を集めること自体を目的とせず、本サービスの提供と改善に必要な最小限の範囲でのみ情報を扱います。
				</p>
			</LegalSection>

			<LegalSection heading="画像の取り扱い">
				<p>
					本サービスで読み込んだ画像（スクリーンショット・クリップボード・ファイル）は、すべて利用者のブラウザ内（Canvas
					API）で処理されます。画像データが運営者のサーバーや第三者に送信されることはありません。また、画像をブラウザの外部に保存することもありません。タブを閉じれば編集中の画像は破棄されます。
				</p>
				<p>
					スクリーンキャプチャやクリップボードの読み取りは、利用者自身の操作とブラウザの許可があった場合にのみ行います。
				</p>
				<p>
					後述の Microsoft Clarity
					によるセッション記録についても、マスキング強度を最大設定（strict）で動作させており、編集中の画像や注釈テキストは記録に含まれません。
				</p>
			</LegalSection>

			<LegalSection heading="ブラウザに保存する情報">
				<p>
					本サービスは、操作性のために次の設定情報をブラウザの localStorage
					に保存します。これらは利用者の端末内にのみ保存され、外部へ送信されません。
				</p>
				<ul className="list-disc space-y-1 pl-5">
					<li>矩形ツールの既定値（スタイル・色・太さ）</li>
					<li>テーマ設定（ダーク / ライト）</li>
				</ul>
				<p>これらはブラウザのサイトデータ削除機能でいつでも削除できます。</p>
			</LegalSection>

			<LegalSection heading="外部サービスへの情報送信">
				<p>
					本サービスは、提供と改善のために以下の外部サービスを利用します。改正電気通信事業法の外部送信規律にもとづき、送信先・送信される情報・利用目的を一覧します。
				</p>
				<div className="space-y-5">
					<ServiceDisclosure
						info="閲覧したページの URL とタイトル、リファラー、ブラウザ情報（User Agent・言語・画面サイズ）、IP アドレス（Google 側で匿名化処理されます）、ページ滞在時間などの操作情報"
						name="Google Analytics 4（GA4）"
						policyHref="https://policies.google.com/privacy"
						purpose="サイト全体の利用状況の把握とサービス改善"
						recipient="Google LLC（米国）"
					/>
					<ServiceDisclosure
						info="閲覧したページの URL とタイトル、リファラー、ブラウザ情報（User Agent・言語・画面サイズ）、IP アドレス、クリックやスクロールなどの操作情報、セッション記録（ただし strict マスキング設定により、編集中の画像や入力テキストは伏字となり記録されません）"
						name="Microsoft Clarity"
						policyHref="https://privacy.microsoft.com/ja-jp/privacystatement"
						purpose="画面内の操作パターンの把握と UI 改善"
						recipient="Microsoft Corporation（米国）"
					/>
					<ServiceDisclosure
						info="ページ表示時のフォントリクエスト（IP アドレス・User Agent を含む）"
						name="Google Fonts"
						policyHref="https://policies.google.com/privacy"
						purpose="Web フォント（Inter・LINE Seed JP・JetBrains Mono）の配信"
						recipient="Google LLC（米国）"
					/>
					<ServiceDisclosure
						info="配信に伴うアクセスログ（IP アドレス・User Agent・リクエストパス）"
						name="Cloudflare"
						policyHref="https://www.cloudflare.com/ja-jp/privacypolicy/"
						purpose="本サービスのホスティングおよび配信"
						recipient="Cloudflare, Inc.（米国）"
					/>
				</div>
			</LegalSection>

			<LegalSection heading="Cookie">
				<p>
					本サービス自身が独自の Cookie
					を発行することはありません。ただし、上記のうち Google Analytics 4 と
					Microsoft Clarity が、利用状況の計測のためにブラウザへ次の Cookie
					を保存します。
				</p>
				<ul className="list-disc space-y-1 pl-5">
					<li>
						<code className="font-mono text-xs">_ga</code>,{" "}
						<code className="font-mono text-xs">_ga_*</code> ─ Google Analytics
						4 の利用者識別とセッション状態（保存期間は最長 2 年）
					</li>
					<li>
						<code className="font-mono text-xs">_clck</code>,{" "}
						<code className="font-mono text-xs">_clsk</code> ほか ─ Microsoft
						Clarity の利用者識別とセッション情報（保存期間は最長 1 年）
					</li>
				</ul>
				<p>これらはブラウザのサイトデータ削除機能でいつでも削除できます。</p>
			</LegalSection>

			<LegalSection heading="オプトアウト">
				<p>
					Google Analytics 4 による計測を停止したい場合は、Google が提供する{" "}
					<a
						className="underline underline-offset-2"
						href="https://tools.google.com/dlpage/gaoptout"
						rel="noreferrer"
						target="_blank"
					>
						Google アナリティクス オプトアウト アドオン
					</a>{" "}
					をブラウザにインストールしてください。Microsoft Clarity
					の計測を停止したい場合は、ブラウザの「トラッキング防止」機能を有効にするか、上記の
					Cookie をブロックしてください。
				</p>
			</LegalSection>

			<LegalSection heading="お問い合わせ">
				<p>
					本ポリシーに関するお問い合わせは、X（
					<a
						className="underline underline-offset-2"
						href="https://x.com/kyamamoto9120"
						rel="noreferrer"
						target="_blank"
					>
						@kyamamoto9120
					</a>
					）までお願いします。
				</p>
			</LegalSection>

			<LegalSection heading="改定">
				<p>
					本ポリシーは予告なく改定することがあります。改定後の内容は本ページに掲載した時点で効力を持ちます。
				</p>
			</LegalSection>
		</>
	);
}

function ServiceDisclosure({
	name,
	recipient,
	info,
	purpose,
	policyHref,
}: {
	name: string;
	recipient: string;
	info: string;
	purpose: string;
	policyHref: string;
}) {
	return (
		<div>
			<h3 className="font-semibold text-text">{name}</h3>
			<dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
				<dt className="font-medium text-text">送信先</dt>
				<dd>{recipient}</dd>
				<dt className="font-medium text-text">送信される情報</dt>
				<dd>{info}</dd>
				<dt className="font-medium text-text">利用目的</dt>
				<dd>{purpose}</dd>
				<dt className="font-medium text-text">プライバシーポリシー</dt>
				<dd className="break-all">
					<a
						className="underline underline-offset-2"
						href={policyHref}
						rel="noreferrer"
						target="_blank"
					>
						{policyHref}
					</a>
				</dd>
			</dl>
		</div>
	);
}
