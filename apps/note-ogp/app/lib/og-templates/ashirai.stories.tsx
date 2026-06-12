import type { Meta, StoryObj } from "@storybook/react-vite";
import { TplCover, TplEdition, TplQuiet } from "./templates";
import type {
	BadgeShape,
	BandPosition,
	Fields,
	PaletteId,
	ThemeMode,
} from "./types";

const DEFAULT_FIELDS: Fields = {
	templateId: "edition",
	theme: "light",
	palette: "takibi",
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
	texture: "none",
	paperStrength: "weak",
	photoPalettes: null,
	watermark: false,
	watermarkText: "",
	band: "none",
	bandText: "",
	badge: "none",
	badgeText: "",
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

const SAMPLE_PHOTO =
	"data:image/svg+xml;utf8," +
	encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 670"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a2a1a"/><stop offset="1" stop-color="#0e0a06"/></linearGradient></defs><rect width="1280" height="670" fill="url(#g)"/></svg>`,
	);

/**
 * あしらい部品（英字ウォーターマーク・リピート帯・バッジ）をテンプレに
 * 重ねた状態。各部品は on / off と文言入力のみで、不透明度・サイズ・配置は
 * 固定プリセット。全部 off にすると現行と同じ見た目になる。
 *
 * @summary あしらい部品をテンプレに重ねた状態
 */
const meta: Meta = {
	title: "note-ogp/Ashirai",
	parameters: {
		layout: "padded",
	},
	args: {
		theme: "light",
		palette: "takibi",
		watermark: true,
		watermarkText: "",
		band: "none",
		bandText: "",
		badge: "none",
		badgeText: "",
	} satisfies Partial<Fields>,
	argTypes: {
		theme: {
			control: { type: "inline-radio" },
			options: ["light", "dark"] satisfies ThemeMode[],
		},
		palette: {
			control: { type: "select" },
			options: [
				"takibi",
				"koke",
				"geppaku",
				"tetsusabi",
				"suna",
				"sumi",
				"aikin",
				"budou",
			] satisfies PaletteId[],
		},
		watermark: { control: "boolean" },
		watermarkText: { control: "text" },
		band: {
			control: { type: "inline-radio" },
			options: ["none", "top", "bottom"] satisfies BandPosition[],
		},
		bandText: { control: "text" },
		badge: {
			control: { type: "inline-radio" },
			options: ["none", "circle", "stamp"] satisfies BadgeShape[],
		},
		badgeText: { control: "text" },
	},
};

export default meta;

type TplArgs = Partial<Fields>;
type Story = StoryObj<TplArgs>;

function withDefaults(args: TplArgs): Fields {
	return { ...DEFAULT_FIELDS, ...args };
}

/** 英字ウォーターマークのみ。下端で見切れる極薄の大英字。 */
export const WatermarkEdition: Story = {
	args: { watermark: true, watermarkText: "MIDNIGHT" },
	render: (args) => (
		<div style={FRAME_STYLE}>
			<TplEdition f={withDefaults(args)} />
		</div>
	),
};

/** リピート帯（下端）のみ。accent 塗りの細帯に単語を連続配置。 */
export const BandBottomEdition: Story = {
	args: { watermark: false, band: "bottom", bandText: "ESSAY" },
	render: (args) => (
		<div style={FRAME_STYLE}>
			<TplEdition f={withDefaults(args)} />
		</div>
	),
};

/** バッジ 2 形状（丸 / スタンプ）の見比べ。 */
export const BadgeShapes: Story = {
	render: (args) => (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(2, 1280px)",
				gap: "16px 16px",
				transform: "scale(0.25)",
				transformOrigin: "top left",
				marginBottom: -670 * 0.75,
				marginRight: -(1280 * 2 + 16) * 0.75,
			}}
		>
			<div style={{ width: 1280, height: 670 }}>
				<TplEdition
					f={withDefaults({
						...args,
						watermark: false,
						badge: "circle",
						badgeText: "NEW",
					})}
				/>
			</div>
			<div style={{ width: 1280, height: 670 }}>
				<TplEdition
					f={withDefaults({
						...args,
						watermark: false,
						badge: "stamp",
						badgeText: "保存版",
					})}
				/>
			</div>
		</div>
	),
};

/** 3 部品をすべて on（盛りの上限）。固定プリセットでも破綻しないこと。 */
export const AllOnEdition: Story = {
	args: {
		watermark: true,
		watermarkText: "MIDNIGHT",
		band: "bottom",
		bandText: "ESSAY",
		badge: "stamp",
		badgeText: "連載",
	},
	render: (args) => (
		<div style={FRAME_STYLE}>
			<TplEdition f={withDefaults(args)} />
		</div>
	),
};

/** 写真あり Cover ＋ウォーターマーク・帯・バッジ。上端に逃がした英字の可読性を見る。 */
export const CoverWithPhoto: Story = {
	args: {
		templateId: "cover",
		image: SAMPLE_PHOTO,
		watermark: true,
		watermarkText: "CAMPFIRE",
		band: "bottom",
		bandText: "ESSAY",
		badge: "circle",
		badgeText: "NEW",
	},
	render: (args) => (
		<div style={FRAME_STYLE}>
			<TplCover f={withDefaults(args)} />
		</div>
	),
};

/** ダーク × Quiet。中央組みの紙面でも左下のウォーターマークが邪魔しないこと。 */
export const QuietDark: Story = {
	args: {
		templateId: "quiet",
		theme: "dark",
		watermark: true,
		watermarkText: "ESSAY",
		band: "top",
		bandText: "ESSAY",
	},
	render: (args) => (
		<div style={FRAME_STYLE}>
			<TplQuiet f={withDefaults(args)} />
		</div>
	),
};
