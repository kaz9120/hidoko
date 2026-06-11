import { LegalPage, LegalSection } from "~/components/layout/legal-page";

export function meta() {
	return [
		{ title: "プライバシーポリシー | snapcrop" },
		{
			name: "description",
			content: "snapcrop のプライバシーポリシー",
		},
	];
}

export default function Privacy() {
	return (
		<LegalPage lastUpdated="2026-06-10" title="プライバシーポリシー">
			<LegalSection heading="基本方針">
				<p>
					snapcrop（以下「本サービス」）は、画像の切り抜き・加工をブラウザだけで完結させることを目的としたツールです。運営者（@kyamamoto9120）は、利用者の情報を集めること自体を目的とせず、本サービスの提供に必要な最小限の範囲でのみ情報を扱います。
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

			<LegalSection heading="外部サービス">
				<p>
					本サービスは Web フォントを Google Fonts
					から読み込みます。このため、ページ表示時に利用者のブラウザから Google
					のサーバーへリクエスト（IP アドレス等を含む）が送信されます。詳細は
					Google のプライバシーポリシーを参照してください。
				</p>
				<p>
					本サービスは Cloudflare
					上でホスティングされています。配信基盤の性質上、Cloudflare
					側でアクセスに関する技術的なログが記録されることがありますが、運営者がこれを個人の特定に利用することはありません。
				</p>
				<p>
					現時点でアクセス解析ツールは導入していません。将来導入する場合は、本ポリシーを更新してお知らせします。
				</p>
			</LegalSection>

			<LegalSection heading="Cookie">
				<p>本サービス自身が Cookie を発行・利用することはありません。</p>
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
		</LegalPage>
	);
}
