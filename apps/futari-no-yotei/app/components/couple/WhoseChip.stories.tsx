import type { Meta, StoryObj } from "@storybook/react-vite";

import { WhoseChip } from "./WhoseChip";

/**
 * 予定の主体が誰かを 1 つのチップで示す。"self" / "partner" はアバター 1 つ、
 * "both" は「は + け」を並べた幅広チップ、それ以外の自由ラベルはテキストで
 * フォールバックする。
 *
 * 予定行 (DayCard など) の先頭で、後続の時刻 / タイトルより前に置いて視線の
 * 出だしに使う。
 *
 * @summary 予定主体の小型チップ
 */
const meta = {
	title: "futari-no-yotei/Couple/WhoseChip",
	component: WhoseChip,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof WhoseChip>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 自分の予定。ember 系の差し色で 1 文字を表示する。
 * @summary 自分の予定
 */
export const Self: Story = {
	args: {
		whose: "self",
	},
};

/**
 * 相手の予定。moon 系の差し色で 1 文字を表示する。
 * @summary 相手の予定
 */
export const Partner: Story = {
	args: {
		whose: "partner",
	},
};

/**
 * ふたりの予定。横長 chip に「は + け」を並べ、相互参加が一目で分かるように
 * する。記念日や外食予約などで使う。
 * @summary ふたりの予定
 */
export const Both: Story = {
	args: {
		whose: "both",
	},
};

/**
 * 列挙にない自由ラベル。"子供" のような将来拡張を想定したフォールバック表示で、
 * テキストとして素直に出る。
 * @summary 自由ラベル
 */
export const FreeLabel: Story = {
	args: {
		whose: "子供",
	},
};
