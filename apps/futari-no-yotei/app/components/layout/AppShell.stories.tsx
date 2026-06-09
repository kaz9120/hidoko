import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";

import { AppShell } from "./AppShell";

/**
 * アプリ共通の縦長コンテナと下タブを束ねる薄いラッパ。LIFF 上では LINE 側が
 * タイトルバーや戻る操作を出すので、shell 内には擬似ヘッダーを作らない。
 *
 * BottomNav を内包するので MemoryRouter が必要。`showNav={false}` でナビを
 * 隠す形 (オンボーディング / LINE 取り込みフォーム想定) は別 story で出す。
 *
 * @summary 共通の縦長レイアウト
 */
const meta: Meta<typeof AppShell> = {
	title: "futari-no-yotei/Layout/AppShell",
	component: AppShell,
	parameters: {
		layout: "fullscreen",
	},
	decorators: [
		(Story) => (
			<MemoryRouter initialEntries={["/"]}>
				<Story />
			</MemoryRouter>
		),
	],
};

export default meta;

type Story = StoryObj<typeof AppShell>;

/**
 * 既定の構成。下に BottomNav、上にコンテンツ。max-w-md で中央寄せされる。
 * @summary 既定のシェル
 */
export const Default: Story = {
	render: () => (
		<AppShell>
			<div className="flex flex-col gap-3 px-4 py-6">
				<h1 className="font-bold text-2xl text-text-strong">ホーム</h1>
				<p className="text-sm text-text-muted leading-relaxed">
					ふたりのよていの中身がここに入る。BottomNav は画面下に sticky で
					貼り付く。
				</p>
				<div className="rounded-md border border-border-subtle bg-bg-raised p-4 text-text-strong text-sm">
					ダミーカード。コンテンツ領域の見え方を確認するための器。
				</div>
			</div>
		</AppShell>
	),
};

/**
 * `showNav={false}` でナビを隠した状態。LINE 取り込みフォームのような
 * 中断したくないフロー専用。
 * @summary ナビを隠した状態
 */
export const NoNav: Story = {
	render: () => (
		<AppShell showNav={false}>
			<div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
				<h1 className="font-bold text-xl text-text-strong">ようこそ</h1>
				<p className="text-sm text-text-muted leading-relaxed">
					ふたりのよていを始めるには、まず LINE で連携してください。
				</p>
			</div>
		</AppShell>
	),
};
