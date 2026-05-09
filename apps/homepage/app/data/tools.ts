export type Tool = {
	id: string;
	name: string;
	href: string;
	desc: string;
	tags: string[];
	accent?: boolean;
};

export const TOOLS: Tool[] = [
	{
		id: "snapcrop",
		name: "SnapCrop",
		href: "https://snapcrop.y-kaz.com/",
		desc: "ブラウザだけで完結する、軽量なスクリーンショット加工ツール。",
		tags: ["Web", "Image"],
		accent: true,
	},
];
