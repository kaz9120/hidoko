import type { Meta, StoryObj } from "@storybook/react-vite";

import { Label } from "./label";
import { Switch } from "./switch";

const meta = {
	title: "ui/Switch",
	component: Switch,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = {
	args: {
		defaultChecked: true,
	},
};

export const Disabled: Story = {
	args: {
		disabled: true,
	},
};

export const WithLabel: Story = {
	render: () => (
		<div className="flex items-center gap-2">
			<Switch id="night-mode" />
			<Label htmlFor="night-mode">夜の配色にする</Label>
		</div>
	),
};
