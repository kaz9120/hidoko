import { LegalSection } from "~/components/layout/legal-page";

export const TERMS_LAST_UPDATED = "2026-06-10";

/**
 * 利用規約の本文。単独ページ (`/terms`) とフッターから開く Dialog の両方で
 * 同じ DOM を共有する。外側のレイアウト (LegalPage / Dialog) は呼び出し側で
 * wrap する。
 */
export function TermsContent() {
	return (
		<>
			<LegalSection heading="第1条（適用）">
				<p>
					本規約は、運営者（@kyamamoto9120）が個人として無償で提供する画像編集ツール「snapcrop」（以下「本サービス」）の利用条件を定めるものです。利用者は、本サービスを利用した時点で本規約に同意したものとみなします。
				</p>
			</LegalSection>

			<LegalSection heading="第2条（禁止事項）">
				<p>利用者は、本サービスの利用にあたり、次の行為をしてはなりません。</p>
				<ul className="list-disc space-y-1 pl-5">
					<li>法令または公序良俗に違反する行為</li>
					<li>
						第三者の著作権・肖像権・プライバシーその他の権利を侵害する画像の加工・利用
					</li>
					<li>本サービスの運営を妨害する行為</li>
				</ul>
			</LegalSection>

			<LegalSection heading="第3条（知的財産権）">
				<p>
					利用者が本サービスで処理する画像の権利は利用者（または正当な権利者）に帰属し、その取り扱いに関する責任も利用者が負います。本サービス自体に関する著作権その他の権利は運営者に帰属します。
				</p>
			</LegalSection>

			<LegalSection heading="第4条（無保証・免責）">
				<p>
					本サービスは現状有姿で提供され、運営者はその動作・正確性・特定目的への適合性を保証しません。本サービスの利用または利用不能により利用者に生じた損害について、運営者の故意または重過失による場合を除き、運営者は責任を負いません。
				</p>
			</LegalSection>

			<LegalSection heading="第5条（サービスの変更・終了）">
				<p>
					運営者は、利用者への事前の通知なく、本サービスの内容を変更し、または提供を中断・終了することがあります。
				</p>
			</LegalSection>

			<LegalSection heading="第6条（規約の変更）">
				<p>
					運営者は、必要に応じて本規約を変更することがあります。変更後の規約は本ページに掲載した時点で効力を持ちます。
				</p>
			</LegalSection>

			<LegalSection heading="第7条（準拠法）">
				<p>本規約の解釈にあたっては、日本法を準拠法とします。</p>
			</LegalSection>
		</>
	);
}
