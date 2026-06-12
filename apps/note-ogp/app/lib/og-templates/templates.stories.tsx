import type { Meta, StoryObj } from "@storybook/react-vite";
import { PALETTES } from "./palettes";
import { FOCAL_POINTS, PHOTO_FILTERS, TEXT_GUARDS } from "./photo";
import { TplCover, TplEdition, TplQuiet } from "./templates";
import type {
	Fields,
	FocalPoint,
	FontMode,
	JumpRate,
	PaletteId,
	PhotoFilter,
	PhotoLayout,
	Spacing,
	TextGuard,
	TextureId,
	ThemeMode,
	TitleDecoration,
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
	titleDecoration: "none",
	photoLayout: "full",
	focalPoint: "center",
	photoMirror: false,
	photoFilter: "none",
	textGuard: "scrim",
	spacing: "normal",
	jumpRate: "normal",
};

/**
 * 配置・注視点の確認用サンプル写真（外部リソースなしの SVG データ URI）。
 * 「主役」が左上に寄った構図 — 注視点やミラーの効果が見た目に出る。
 */
const SAMPLE_PHOTO =
	"data:image/svg+xml;utf8," +
	encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000">` +
			`<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
			`<stop offset="0" stop-color="#41311f"/><stop offset="1" stop-color="#0e0a06"/>` +
			`</linearGradient></defs>` +
			`<rect width="1600" height="1000" fill="url(#g)"/>` +
			`<circle cx="430" cy="300" r="170" fill="#d9a05c"/>` +
			`<circle cx="430" cy="300" r="240" fill="none" stroke="#d9a05c" stroke-opacity="0.35" stroke-width="3"/>` +
			`<rect y="760" width="1600" height="240" fill="#241a10"/>` +
			`</svg>`,
	);

/**
 * 明るい写真のサンプル（外部リソースなしの SVG データ URI）。
 * テキスト保護方式が「明るい写真でも読めるか」を見るために使う。
 */
const SAMPLE_PHOTO_BRIGHT =
	"data:image/svg+xml;utf8," +
	encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000">` +
			`<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">` +
			`<stop offset="0" stop-color="#e9ddc8"/><stop offset="1" stop-color="#cdbb9b"/>` +
			`</linearGradient></defs>` +
			`<rect width="1600" height="1000" fill="url(#g)"/>` +
			`<circle cx="1150" cy="260" r="150" fill="#f4ead4"/>` +
			`<rect y="700" width="1600" height="300" fill="#b9a27c"/>` +
			`<rect x="180" y="430" width="420" height="270" fill="#d8c5a2"/>` +
			`</svg>`,
	);

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
		texture: {
			control: { type: "inline-radio" },
			options: ["none", "paper", "gradient", "shape"] satisfies TextureId[],
		},
		paperStrength: {
			control: { type: "inline-radio" },
			options: ["weak", "medium"],
		},
		titleDecoration: {
			control: { type: "inline-radio" },
			options: [
				"none",
				"merihari",
				"zurashi",
				"hanzure",
			] satisfies TitleDecoration[],
		},
		spacing: {
			control: { type: "inline-radio" },
			options: ["tight", "normal", "loose"] satisfies Spacing[],
		},
		jumpRate: {
			control: { type: "inline-radio" },
			options: ["low", "normal", "high"] satisfies JumpRate[],
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

/** Cover 片寄せ: 写真を左 2/3 に裁ち落とし、右はテーマ base のテキスト面。 */
export const CoverEdge: Story = {
	args: { templateId: "cover", photoLayout: "edge", image: SAMPLE_PHOTO },
	argTypes: {
		photoLayout: {
			control: { type: "inline-radio" },
			options: ["full", "edge", "kakuhan"] satisfies PhotoLayout[],
		},
		focalPoint: {
			control: { type: "select" },
			options: FOCAL_POINTS as unknown as FocalPoint[],
		},
		photoMirror: { control: "boolean" },
	},
	render: (args) => (
		<div style={FRAME_STYLE}>
			<TplCover f={withDefaults(args)} />
		</div>
	),
};

/** Cover 片寄せのミラー: 写真が右、テキスト面が左にくる。 */
export const CoverEdgeMirror: Story = {
	...CoverEdge,
	args: { ...CoverEdge.args, photoMirror: true },
};

/** Cover 角版: 四周に地余白を残した額縁構図。ダーク面で確認。 */
export const CoverKakuhan: Story = {
	...CoverEdge,
	args: {
		templateId: "cover",
		photoLayout: "kakuhan",
		image: SAMPLE_PHOTO,
		theme: "dark",
	},
};

/** 注視点 9 点の見比べ。主役（左上の円）にクロップが追従する。 */
export const FocalPointGallery: Story = {
	render: (args) => (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(3, 1280px)",
				gap: "16px 16px",
				transform: "scale(0.16)",
				transformOrigin: "top left",
				marginBottom: -(670 * 3 + 16 * 2) * 0.84,
				marginRight: -(1280 * 3 + 16 * 2) * 0.84,
			}}
		>
			{FOCAL_POINTS.map((focalPoint) => (
				<div key={focalPoint} style={{ width: 1280, height: 670 }}>
					<TplCover
						f={withDefaults({
							...args,
							templateId: "cover",
							photoLayout: "kakuhan",
							image: SAMPLE_PHOTO,
							focalPoint,
						})}
					/>
				</div>
			))}
		</div>
	),
};

/** 写真フィルタ 5 種の見比べ（全面配置・暗い写真）。 */
export const PhotoFilterGallery: Story = {
	render: (args) => (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(3, 1280px)",
				gap: "16px 16px",
				transform: "scale(0.25)",
				transformOrigin: "top left",
				marginBottom: -(670 * 2 + 16) * 0.75,
				marginRight: -(1280 * 3 + 16 * 2) * 0.75,
			}}
		>
			{PHOTO_FILTERS.map((p) => (
				<div key={p.id} style={{ width: 1280, height: 670 }}>
					<TplCover
						f={withDefaults({
							...args,
							templateId: "cover",
							image: SAMPLE_PHOTO,
							photoFilter: p.id satisfies PhotoFilter,
							title: p.label,
						})}
					/>
				</div>
			))}
		</div>
	),
};

/** 写真フィルタ 5 種 × 角版配置。色面の上でもフィルタが効く。 */
export const PhotoFilterKakuhan: Story = {
	render: (args) => (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(3, 1280px)",
				gap: "16px 16px",
				transform: "scale(0.25)",
				transformOrigin: "top left",
				marginBottom: -(670 * 2 + 16) * 0.75,
				marginRight: -(1280 * 3 + 16 * 2) * 0.75,
			}}
		>
			{PHOTO_FILTERS.map((p) => (
				<div key={p.id} style={{ width: 1280, height: 670 }}>
					<TplCover
						f={withDefaults({
							...args,
							templateId: "cover",
							photoLayout: "kakuhan",
							image: SAMPLE_PHOTO,
							photoFilter: p.id satisfies PhotoFilter,
							title: p.label,
						})}
					/>
				</div>
			))}
		</div>
	),
};

/** テキスト保護 4 方式 × 明るい写真（黒文字）。読めるかを見る。 */
export const TextGuardGalleryBright: Story = {
	render: (args) => (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(2, 1280px)",
				gap: "16px 16px",
				transform: "scale(0.25)",
				transformOrigin: "top left",
				marginBottom: -(670 * 2 + 16) * 0.75,
				marginRight: -(1280 * 2 + 16) * 0.75,
			}}
		>
			{TEXT_GUARDS.map((g) => (
				<div key={g.id} style={{ width: 1280, height: 670 }}>
					<TplCover
						f={withDefaults({
							...args,
							templateId: "cover",
							image: SAMPLE_PHOTO_BRIGHT,
							coverText: "dark",
							textGuard: g.id satisfies TextGuard,
							title: g.label,
						})}
					/>
				</div>
			))}
		</div>
	),
};

/** テキスト保護 4 方式 × 暗い写真（白文字）。 */
export const TextGuardGalleryDark: Story = {
	render: (args) => (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(2, 1280px)",
				gap: "16px 16px",
				transform: "scale(0.25)",
				transformOrigin: "top left",
				marginBottom: -(670 * 2 + 16) * 0.75,
				marginRight: -(1280 * 2 + 16) * 0.75,
			}}
		>
			{TEXT_GUARDS.map((g) => (
				<div key={g.id} style={{ width: 1280, height: 670 }}>
					<TplCover
						f={withDefaults({
							...args,
							templateId: "cover",
							image: SAMPLE_PHOTO,
							coverText: "light",
							textGuard: g.id satisfies TextGuard,
							title: g.label,
						})}
					/>
				</div>
			))}
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

/** 背景の質感 4 種（なし / 紙・中 / 微グラデ / 図形）の見比べ。 */
export const TextureGallery: Story = {
	render: (args) => (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(2, 1280px)",
				gap: "16px 16px",
				transform: "scale(0.25)",
				transformOrigin: "top left",
				marginBottom: -(670 * 2 + 16) * 0.75,
				marginRight: -(1280 * 2 + 16) * 0.75,
			}}
		>
			{(["none", "paper", "gradient", "shape"] satisfies TextureId[]).map(
				(texture) => (
					<div key={texture} style={{ width: 1280, height: 670 }}>
						<TplEdition
							f={withDefaults({ ...args, texture, paperStrength: "medium" })}
						/>
					</div>
				),
			)}
		</div>
	),
};

/** ダークテーマ × 紙テクスチャ（中）。Quiet で文字の可読性を見る。 */
export const QuietPaperDark: Story = {
	args: {
		templateId: "quiet",
		theme: "dark",
		texture: "paper",
		paperStrength: "medium",
	},
	render: (args) => (
		<div style={FRAME_STYLE}>
			<TplQuiet f={withDefaults(args)} />
		</div>
	),
};

/** タイトル装飾 4 種（なし / メリハリ / 行ずらし / 版ずれ）の見比べ。 */
export const TitleDecorationGallery: Story = {
	args: { title: "夜更けに\nコードを書く理由" },
	render: (args) => (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(2, 1280px)",
				gap: "16px 16px",
				transform: "scale(0.25)",
				transformOrigin: "top left",
				marginBottom: -(670 * 2 + 16) * 0.75,
				marginRight: -(1280 * 2 + 16) * 0.75,
			}}
		>
			{(
				["none", "merihari", "zurashi", "hanzure"] satisfies TitleDecoration[]
			).map((titleDecoration) => (
				<div key={titleDecoration} style={{ width: 1280, height: 670 }}>
					<TplEdition f={withDefaults({ ...args, titleDecoration })} />
				</div>
			))}
		</div>
	),
};

/** 中央揃え（Quiet）× 版ずれ。フチが文字に正しく重なるかを見る。 */
export const QuietHanzureDark: Story = {
	args: {
		templateId: "quiet",
		theme: "dark",
		titleDecoration: "hanzure",
		title: "夜更けに\nコードを書く理由",
	},
	render: (args) => (
		<div style={FRAME_STYLE}>
			<TplQuiet f={withDefaults(args)} />
		</div>
	),
};

const SPACINGS = ["tight", "normal", "loose"] satisfies Spacing[];
const JUMP_RATES = ["low", "normal", "high"] satisfies JumpRate[];

/**
 * 余白 × ジャンプ率の 9 組み合わせ（Edition）。カテゴリ表記が組み合わせ名。
 * 「タイト × 強め＝勢い」「ゆったり × 控えめ＝上品」の対比を一覧で見る。
 */
export const ExpressionGallery: Story = {
	render: (args) => (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(3, 1280px)",
				gap: "16px 16px",
				transform: "scale(0.16)",
				transformOrigin: "top left",
				marginBottom: -(670 * 3 + 16 * 2) * 0.84,
				marginRight: -(1280 * 3 + 16 * 2) * 0.84,
			}}
		>
			{SPACINGS.flatMap((spacing) =>
				JUMP_RATES.map((jumpRate) => (
					<div
						key={`${spacing}-${jumpRate}`}
						style={{ width: 1280, height: 670 }}
					>
						<TplEdition
							f={withDefaults({
								...args,
								spacing,
								jumpRate,
								category: `${spacing} × ${jumpRate}`,
							})}
						/>
					</div>
				)),
			)}
		</div>
	),
};

/** 余白 × ジャンプ率の 9 組み合わせ（Cover 角版）。いちばん縦に密な構図で破綻を見る。 */
export const ExpressionGalleryKakuhan: Story = {
	render: (args) => (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(3, 1280px)",
				gap: "16px 16px",
				transform: "scale(0.16)",
				transformOrigin: "top left",
				marginBottom: -(670 * 3 + 16 * 2) * 0.84,
				marginRight: -(1280 * 3 + 16 * 2) * 0.84,
			}}
		>
			{SPACINGS.flatMap((spacing) =>
				JUMP_RATES.map((jumpRate) => (
					<div
						key={`${spacing}-${jumpRate}`}
						style={{ width: 1280, height: 670 }}
					>
						<TplCover
							f={withDefaults({
								...args,
								templateId: "cover",
								photoLayout: "kakuhan",
								image: SAMPLE_PHOTO,
								spacing,
								jumpRate,
								category: `${spacing} × ${jumpRate}`,
							})}
						/>
					</div>
				)),
			)}
		</div>
	),
};

/** タイト × 強め（Edition）。詰めた余白と大きなタイトルで勢いを出す。 */
export const EditionTightHigh: Story = {
	args: { spacing: "tight", jumpRate: "high" },
	render: (args) => (
		<div style={FRAME_STYLE}>
			<TplEdition f={withDefaults(args)} />
		</div>
	),
};

/** ゆったり × 控えめ（Edition）。広い余白と抑えたタイトルで上品に。 */
export const EditionLooseLow: Story = {
	args: { spacing: "loose", jumpRate: "low" },
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
