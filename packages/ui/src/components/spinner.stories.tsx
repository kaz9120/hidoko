import type { Meta, StoryObj } from "@storybook/react-vite";

import { Spinner } from "./spinner";

/**
 * 終わりの見えない待ちを示す回転インジケータ。Lucide の `Loader2Icon` を
 * `animate-spin` で回している。役割は `role="status"` 固定。サイズは
 * Tailwind の `size-*` クラスで調整する。
 *
 * @summary 終わりが見えない待ち
 */
const meta = {
	title: "shadcn-ui/Spinner",
	component: Spinner,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 既定サイズ (`size-4`)。本文の行高に揃って収まる。
 * @summary 既定サイズ
 */
export const Default: Story = {};

/**
 * 小さめ。Button 内に置きたいときなどの細い余白に合わせる。
 * @summary 小サイズ
 */
export const Small: Story = {
	args: {
		className: "size-3",
	},
};

/**
 * 大きめ。ページ全体の読み込み中など、中央に 1 つ置いて見せる用途。
 * @summary 大サイズ
 */
export const Large: Story = {
	args: {
		className: "size-8",
	},
};
