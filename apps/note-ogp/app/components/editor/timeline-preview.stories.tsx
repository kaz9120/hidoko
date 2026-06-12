import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Fields, PhotoPalette } from "~/lib/og-templates";
import { TEMPLATES } from "~/lib/og-templates";
import { TimelinePreview } from "./timeline-preview";

const DEFAULT_FIELDS: Fields = {
	templateId: "edition",
	theme: "light",
	palette: "takibi",
	fontMode: "serif",
	coverText: "light",
	title: "夜更けに\nコードを書く理由",
	lead: "焚き火と同じ温度で、コードに向き合う。",
	category: "ESSAY",
	issue: "013",
	date: "2026.05",
	brand: "焚き火を愛するエンジニア",
	author: "山本一将",
	account: "@kyamamoto9120",
	showMark: true,
	image: null,
	texture: "none",
	paperStrength: "weak",
	photoPalettes: null,
	titleDecoration: "none",
	photoLayout: "full",
	focalPoint: "center",
	photoMirror: false,
	photoFilter: "none",
	textGuard: "scrim",
};

// 淡い背景 × 淡い文字色の低コントラストなパレット（コントラスト警告の確認用）。
// 実フローでは写真抽出が補正をかけるが、保存済みの古いデータ等で起こりうる。
const PALE_PHOTO_PALETTES: PhotoPalette[] = [
	{
		id: "photo-najimase",
		label: "馴染ませ",
		light: { base: "#ece4d2", sub: "#c4b894", accent: "#b89a6a" },
		dark: { base: "#3a3426", sub: "#5d543d", accent: "#8a734a" },
	},
];

const EDITION = TEMPLATES[0];

/**
 * note タイムライン実寸相当（モバイル 343px 幅）の縮小プレビューと可読性の
 * 警告。タイトルの確定フォントサイズがタイムライン換算で 10px を割るとき、
 * またはタイトル文字色×背景のコントラスト比が 4.5:1 未満のときに、警告色の
 * テキストで知らせる。自動では直さない（判断は作る人に残す）。
 *
 * @summary タイムライン実寸プレビューと可読性警告
 */
const meta = {
	title: "note-ogp/Editor/TimelinePreview",
	component: TimelinePreview,
	parameters: { layout: "centered" },
	args: {
		tpl: EDITION,
		fields: DEFAULT_FIELDS,
		titleFontSize: 104,
	},
} satisfies Meta<typeof TimelinePreview>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 警告なし。改行ありの標準タイトルはタイムラインでも読める */
export const Default: Story = {};

/** 長いタイトルを 1 行で入れてフォントが縮みすぎた状態（38px 未満で警告） */
export const FontTooSmall: Story = {
	args: {
		fields: {
			...DEFAULT_FIELDS,
			title: "夜更けにコードを書く理由とその先にある焚き火のような熱量について",
		},
		titleFontSize: 34,
	},
};

/** 淡い背景 × 淡い文字色（コントラスト比 4.5:1 未満で警告） */
export const LowContrast: Story = {
	args: {
		fields: {
			...DEFAULT_FIELDS,
			palette: "photo-najimase",
			photoPalettes: PALE_PHOTO_PALETTES,
		},
	},
};

/** フォントサイズとコントラストの警告が同時に出た状態 */
export const BothWarnings: Story = {
	args: {
		fields: {
			...DEFAULT_FIELDS,
			title: "夜更けにコードを書く理由とその先にある焚き火のような熱量について",
			palette: "photo-najimase",
			photoPalettes: PALE_PHOTO_PALETTES,
		},
		titleFontSize: 34,
	},
};
