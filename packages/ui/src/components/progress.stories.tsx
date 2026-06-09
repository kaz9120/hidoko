import type { Meta, StoryObj } from "@storybook/react-vite";

import { Progress } from "./progress";

/**
 * 進捗バー。`value` (0-100) で進み具合を示す。終わりが見える処理に使い、
 * 終わりが見えない待ちには [Spinner](?path=/docs/shadcn-ui-spinner--docs) を
 * 使う。
 *
 * @summary 進捗を表す細い横バー
 */
const meta = {
	title: "shadcn-ui/Progress",
	component: Progress,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof Progress>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 半分まで進んだ状態。`value=50` を渡したときに、見た目が中央で止まることを
 * 確認するための story。
 * @summary 50% 進行
 */
export const Default: Story = {
	render: () => <Progress className="w-[280px]" value={50} />,
};

/**
 * 進捗が分からない不定状態。`value` を渡さないと内部のインジケータが左端まで
 * 引っ込む。終わりが見えない処理では使わず、Spinner に倒す方が伝わりやすい。
 * @summary 不定状態の見え方
 */
export const Indeterminate: Story = {
	render: () => <Progress className="w-[280px]" />,
};
