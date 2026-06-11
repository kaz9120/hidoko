import type { Meta, StoryObj } from "@storybook/react-vite";
import { PALETTES } from "./palettes";
import {
	TplCover,
	TplEdition,
	TplFrame,
	TplQuiet,
	TplSplit,
	TplTate,
} from "./templates";
import type { Fields, FontMode, PaletteId, ThemeMode } from "./types";

// 写真の代わりに使うダミー画像（焚き火の暗がり風グラデーション）
const SAMPLE_IMAGE =
	"data:image/svg+xml;utf8," +
	encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 670"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a2a1a"/><stop offset="1" stop-color="#0e0a06"/></linearGradient></defs><rect width="1280" height="670" fill="url(#g)"/></svg>`,
	);

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
 * テーマ × カラーパレット × タイトル書体を切り替えて確認できる。
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
		palette: "takibi",
		fontMode: "serif",
		title: "夜更けにコードを書く理由",
		lead: "焚き火と同じ温度で、コードに向き合う。",
	} satisfies Partial<Fields>,
	argTypes: {
		theme: {
			control: { type: "inline-radio" },
			options: ["light", "dark"] satisfies ThemeMode[],
		},
		palette: {
			control: { type: "select" },
			options: PALETTES.map((p) => p.id) satisfies PaletteId[],
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
		image: SAMPLE_IMAGE,
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

/** Frame: 全面写真の中央に枠ボックス。写真なしは反対面の色面になる。 */
export const Frame: Story = {
	args: { templateId: "frame" },
	render: (args) => (
		<div style={FRAME_STYLE}>
			<TplFrame f={withDefaults(args)} />
		</div>
	),
};

/** Frame に画像を入れた状態。枠ボックスが写真の上に浮く。 */
export const FrameWithImage: Story = {
	args: { templateId: "frame", image: SAMPLE_IMAGE },
	render: (args) => (
		<div style={FRAME_STYLE}>
			<TplFrame f={withDefaults(args)} />
		</div>
	),
};

/** Split: 上 2/3 を写真または色面、下 1/3 を濃色の情報バンドにする分割構図。 */
export const Split: Story = {
	args: { templateId: "split" },
	render: (args) => (
		<div style={FRAME_STYLE}>
			<TplSplit f={withDefaults(args)} />
		</div>
	),
};

/** Split に画像を入れた状態。バンドの濃色とのコントラストが出る。 */
export const SplitWithImage: Story = {
	args: { templateId: "split", image: SAMPLE_IMAGE },
	render: (args) => (
		<div style={FRAME_STYLE}>
			<TplSplit f={withDefaults(args)} />
		</div>
	),
};

/** Tate: タイトルを縦書きにした和モダン構図。明朝と好相性。 */
export const Tate: Story = {
	args: { templateId: "tate" },
	render: (args) => (
		<div style={FRAME_STYLE}>
			<TplTate f={withDefaults(args)} />
		</div>
	),
};

/** Tate の長文タイトル。高さ基準の AutoFitTitle で縮小され、段が左へ伸びる。 */
export const TateLongTitle: Story = {
	args: {
		templateId: "tate",
		title: "夜更けにコードを書きながら考えていたこと、いくつか",
	},
	render: (args) => (
		<div style={FRAME_STYLE}>
			<TplTate f={withDefaults(args)} />
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

/** 8 パレットの一覧。theme arg でライト / ダークを切り替えて見比べる。 */
export const PaletteGallery: Story = {
	render: (args) => (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(2, 1280px)",
				gap: "16px 16px",
				transform: "scale(0.25)",
				transformOrigin: "top left",
				marginBottom: -(670 * 4 + 16 * 3) * 0.75,
				marginRight: -(1280 * 2 + 16) * 0.75,
			}}
		>
			{PALETTES.map((p) => (
				<div key={p.id} style={{ width: 1280, height: 670 }}>
					<TplEdition f={withDefaults({ ...args, palette: p.id })} />
				</div>
			))}
		</div>
	),
};
