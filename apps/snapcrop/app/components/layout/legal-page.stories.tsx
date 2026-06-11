import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";

import { LegalPage, LegalSection } from "./legal-page";

/**
 * プライバシーポリシー / 利用規約のような静的文書ページの共通レイアウト。
 * 上部にエディタへの戻り導線、中央に 68ch 幅の本文、下部に静的フッターを
 * 置く。`<Link>` を含むので、story では MemoryRouter で wrap する。
 *
 * @summary 法務文書ページの共通レイアウト
 */
const meta = {
	title: "snapcrop/Layout/LegalPage",
	component: LegalPage,
	parameters: {
		layout: "fullscreen",
	},
	decorators: [
		(Story) => (
			<MemoryRouter>
				<Story />
			</MemoryRouter>
		),
	],
} satisfies Meta<typeof LegalPage>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 見出し・最終更新日・複数セクション (本文 / 箇条書き) を持つ文書の例。
 * 実際の `/privacy` `/terms` ページはこのレイアウトに本文を流し込む。
 * @summary サンプル文書
 */
export const Default: Story = {
	args: {
		title: "サンプル文書",
		lastUpdated: "2026-06-10",
		children: (
			<>
				<LegalSection heading="第1条（サンプル）">
					<p>
						これはレイアウト確認用のサンプル本文です。68ch 幅に収まり、
						セクション間に十分な余白が入ることを確認します。
					</p>
				</LegalSection>
				<LegalSection heading="第2条（箇条書き）">
					<p>箇条書きを含むセクションの例です。</p>
					<ul className="list-disc space-y-1 pl-5">
						<li>1 つ目の項目</li>
						<li>2 つ目の項目</li>
						<li>3 つ目の項目</li>
					</ul>
				</LegalSection>
			</>
		),
	},
};
