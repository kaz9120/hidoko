import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";

const meta = {
	title: "shadcn-ui/Button",
	component: Button,
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		children: "Button",
	},
};

export const Variants: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-2">
			<Button variant="default">Default</Button>
			<Button variant="destructive">Destructive</Button>
			<Button variant="outline">Outline</Button>
			<Button variant="secondary">Secondary</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="link">Link</Button>
		</div>
	),
};

export const Sizes: Story = {
	render: () => (
		<div className="flex items-center gap-2">
			<Button size="xs">XS</Button>
			<Button size="sm">SM</Button>
			<Button size="default">Default</Button>
			<Button size="lg">LG</Button>
		</div>
	),
};

export const Disabled: Story = {
	args: {
		children: "Disabled",
		disabled: true,
	},
};
