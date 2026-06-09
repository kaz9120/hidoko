import type { Meta, StoryObj } from "@storybook/react-vite";
import { TplCover, TplEdition, TplQuiet } from "./templates";
import type { Fields, FontMode, ThemeMode } from "./types";

const DEFAULT_FIELDS: Fields = {
	templateId: "edition",
	theme: "light",
	fontMode: "serif",
	coverText: "light",
	title: "夜更けにコードを書く理由",
	lead: "焚き火と同じ温度で、コードに向き合う。",
	category: "ESSAY",
	issue: "013",
	date: "2026.05",
	brand: "焚き火を愛するエンジニア",
	author: "山本一将",
	account: "@kyamamoto9120",
	showMark: true,
	image: null,
};

const FRAME_STYLE: React.CSSProperties = {
	width: 1280,
	height: 670,
	boxShadow:
		"0 24px 80px rgba(0,0,0,0.6), 0 2px 0 rgba(0,0,0,0.4), 0 0 0 1px var(--border)",
	borderRadius: 4,
	overflow: "hidden",
	transform: "scale(0.5)",
	transformOrigin: "top left",
	marginBottom: -670 * 0.5,
};

/**
 * note OGP のテンプレ本体（1280×670 のキャンバス）。表示倍率は 50%。
 * テーマ × タイトル書体の 6 通り（dark/light × serif/gothic/hand）を切り替えて
 * 確認できる。
 *
 * @summary 1280×670 の OGP テンプレ本体
 */
const meta: Meta = {
	title: "note-ogp/Templates",
	parameters: {
		layout: "padded",
	},
	args: {
		theme: "light",
		fontMode: "serif",
		title: "夜更けにコードを書く理由",
		lead: "焚き火と同じ温度で、コードに向き合う。",
	} satisfies Partial<Fields>,
	argTypes: {
		theme: {
			control: { type: "inline-radio" },
			options: ["light", "dark"] satisfies ThemeMode[],
		},
		fontMode: {
			control: { type: "inline-radio" },
			options: ["serif", "gothic", "hand"] satisfies FontMode[],
		},
		title: { control: "text" },
		lead: { control: "text" },
	},
};

export default meta;

type TplArgs = Partial<Fields>;
type Story = StoryObj<TplArgs>;

function withDefaults(args: TplArgs): Fields {
	return { ...DEFAULT_FIELDS, ...args };
}

/** Edition: 写真なしテンプレ。号数を大きく見せる構成。 */
export const Edition: Story = {
	render: (args) => (
		<div style={FRAME_STYLE}>
			<TplEdition f={withDefaults(args)} />
		</div>
	),
};

/** Cover: 写真フルブリードの表紙テンプレ。文字色を白／黒で切替可能。 */
export const Cover: Story = {
	args: { templateId: "cover" },
	argTypes: {
		coverText: {
			control: { type: "inline-radio" },
			options: ["light", "dark"],
		},
	},
	render: (args) => (
		<div style={FRAME_STYLE}>
			<TplCover f={withDefaults({ coverText: "light", ...args })} />
		</div>
	),
};

/** Cover に手元の画像を入れた状態（ストーリー内では描画されない placeholder）。 */
export const CoverWithImage: Story = {
	args: {
		templateId: "cover",
		image:
			"data:image/svg+xml;utf8," +
			encodeURIComponent(
				`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 670"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a2a1a"/><stop offset="1" stop-color="#0e0a06"/></linearGradient></defs><rect width="1280" height="670" fill="url(#g)"/></svg>`,
			),
	},
	render: (args) => (
		<div style={FRAME_STYLE}>
			<TplCover f={withDefaults(args)} />
		</div>
	),
};

/** Quiet: 余白多めの和モダンテンプレ。明朝が映える。 */
export const Quiet: Story = {
	args: { templateId: "quiet" },
	render: (args) => (
		<div style={FRAME_STYLE}>
			<TplQuiet f={withDefaults(args)} />
		</div>
	),
};

/** 長文タイトルの自動縮小（AutoFitTitle）。右余白が必ず残る。 */
export const EditionLongTitle: Story = {
	args: { title: "夜更けにコードを書きながら考えていたこと、いくつか" },
	render: (args) => (
		<div style={FRAME_STYLE}>
			<TplEdition f={withDefaults(args)} />
		</div>
	),
};

/** 手動改行（2 行）。自動折り返しは効かないので、改行位置だけが効く。 */
export const EditionManualBreak: Story = {
	args: { title: "夜更けに\nコードを書く理由" },
	render: (args) => (
		<div style={FRAME_STYLE}>
			<TplEdition f={withDefaults(args)} />
		</div>
	),
};
