import type { Meta, StoryObj } from "@storybook/react-vite";

import { SnapcropProvider } from "~/contexts/snapcrop-context";
import type { UseArrowEngineResult } from "~/hooks/use-arrow-engine";
import type { UseHighlightEngineResult } from "~/hooks/use-highlight-engine";
import type { UseRectEngineResult } from "~/hooks/use-rect-engine";
import type { UseTextEngineResult } from "~/hooks/use-text-engine";
import type { ArrowAnnotation } from "~/lib/arrow-engine";
import type { HighlightAnnotation } from "~/lib/highlight-engine";
import type { RectAnnotation } from "~/lib/rect-engine";
import type { TextAnnotation } from "~/lib/text-engine";

import { AnnotationInteractionLayer } from "./annotation-interaction-layer";

/**
 * 描画系ツール (rect / arrow / text / highlight) 選択中に stage を覆う透明な
 * hit layer。pointerdown で全種別横断の hit test (#103) を行い、どのツール中
 * でも既存注釈を掴んで選択 + 移動できる。ヒット時は activeTool を注釈の
 * 種別へ追従させる。空クリック / 空ドラッグは従来どおり activeTool の新規
 * 作成になる。
 *
 * 見た目は `cursor` 付きの透明 div だけなので、Storybook では境界が分かる
 * よう枠付きコンテナで囲み、各種別の注釈リストを inline fixture で渡す。
 * 実 UI では `useSnapcrop` の `spacePressedRef` 等も参照するため、
 * `SnapcropProvider` で wrap している (画像なし初期状態のまま story 上は
 * 操作されない)。
 *
 * @summary 全ツール共通の透明 hit レイヤー
 */
const meta = {
	title: "snapcrop/Canvas/AnnotationInteractionLayer",
	component: AnnotationInteractionLayer,
	parameters: {
		layout: "padded",
	},
	decorators: [
		(Story) => (
			<SnapcropProvider>
				<div className="relative h-[260px] w-[480px] overflow-hidden rounded-md border border-dashed border-border bg-bg-raised">
					<Story />
				</div>
			</SnapcropProvider>
		),
	],
} satisfies Meta<typeof AnnotationInteractionLayer>;

export default meta;

type Story = StoryObj<typeof meta>;

const STUB_RECT_ENGINE: UseRectEngineResult = {
	renderedAnnotations: [],
	previewRect: null,
	isInteracting: false,
	beginDraw: () => {},
	beginMove: () => {},
	beginDuplicate: () => {},
	beginResize: () => {},
	updateInteraction: () => {},
	endInteraction: () => {},
	cancelInteraction: () => {},
	handle: {
		isInteracting: () => false,
		cancelInteraction: () => {},
	},
};

const STUB_ARROW_ENGINE: UseArrowEngineResult = {
	renderedArrows: [],
	previewArrow: null,
	isInteracting: false,
	beginDraw: () => {},
	beginMove: () => {},
	beginDuplicate: () => {},
	beginEndpointDrag: () => {},
	updateInteraction: () => {},
	endInteraction: () => {},
	cancelInteraction: () => {},
	handle: {
		isInteracting: () => false,
		cancelInteraction: () => {},
	},
};

const STUB_TEXT_ENGINE: UseTextEngineResult = {
	renderedTexts: [],
	isInteracting: false,
	editing: null,
	beginMove: () => {},
	beginDuplicate: () => {},
	updateInteraction: () => {},
	endInteraction: () => {},
	cancelInteraction: () => {},
	beginCreate: () => {},
	beginEdit: () => {},
	commitEdit: () => null,
	flushEdit: () => null,
	registerEditorFlush: () => {},
	cancelEdit: () => {},
	handle: {
		isInteracting: () => false,
		cancelInteraction: () => {},
	},
};

const STUB_HIGHLIGHT_ENGINE: UseHighlightEngineResult = {
	renderedHighlights: [],
	previewHighlight: null,
	isInteracting: false,
	beginDraw: () => {},
	beginMove: () => {},
	beginDuplicate: () => {},
	beginEndpointDrag: () => {},
	updateInteraction: () => {},
	endInteraction: () => {},
	cancelInteraction: () => {},
	handle: {
		isInteracting: () => false,
		cancelInteraction: () => {},
	},
};

const RECT_FIXTURE: RectAnnotation = {
	id: "rect-1",
	kind: "rect",
	x: 40,
	y: 30,
	width: 160,
	height: 100,
	style: "outline",
	color: "#ef4444",
	thickness: "md",
	createdAt: 0,
	zIndex: 0,
};

const ARROW_FIXTURE: ArrowAnnotation = {
	id: "arrow-1",
	kind: "arrow",
	x1: 120,
	y1: 180,
	x2: 360,
	y2: 80,
	line: "straight",
	startCap: "none",
	endCap: "arrow",
	color: "#ef4444",
	thickness: "md",
	style: "clean",
	seed: 1,
	createdAt: 1,
	zIndex: 1,
};

const TEXT_FIXTURE: TextAnnotation = {
	id: "text-1",
	kind: "text",
	x: 280,
	y: 160,
	text: "ここに注釈",
	fontFamily: "sans",
	fontSize: 24,
	align: "left",
	bold: false,
	italic: false,
	color: "#ef4444",
	background: "none",
	createdAt: 2,
	zIndex: 2,
};

const HIGHLIGHT_FIXTURE: HighlightAnnotation = {
	id: "highlight-1",
	kind: "highlight",
	x1: 60,
	y1: 220,
	x2: 300,
	y2: 220,
	color: "#facc15",
	opacity: 0.4,
	thickness: "md",
	createdAt: 3,
	zIndex: 3,
};

const baseArgs = {
	rectEngine: STUB_RECT_ENGINE,
	arrowEngine: STUB_ARROW_ENGINE,
	textEngine: STUB_TEXT_ENGINE,
	highlightEngine: STUB_HIGHLIGHT_ENGINE,
	annotations: [] as readonly RectAnnotation[],
	arrows: [] as readonly ArrowAnnotation[],
	texts: [] as readonly TextAnnotation[],
	highlights: [] as readonly HighlightAnnotation[],
	zoom: 1,
	getImagePoint: () => null,
};

/**
 * 既存注釈がない空状態 (矩形ツール)。stage 全体が「次のドラッグで描画開始」
 * になる。視覚的には透明なので、外側のコンテナだけが見える。
 * @summary 空状態 (描画待ち)
 */
export const Empty: Story = {
	args: {
		...baseArgs,
		activeTool: "rect",
	},
};

/**
 * 全種別の注釈が混在する状態 (矢印ツール)。pointerdown は最前面の種別から
 * 順 (highlight → text → arrow → rect) に hit test し、ヒットした注釈の
 * 種別へ activeTool を追従させて選択 + 移動を開始する想定。Storybook では
 * 実際のインタラクションは起こらないが、hit 領域そのものは透明レイヤーが覆う。
 * @summary 全種別の注釈と共存
 */
export const WithMixedAnnotations: Story = {
	args: {
		...baseArgs,
		activeTool: "arrow",
		annotations: [RECT_FIXTURE],
		arrows: [ARROW_FIXTURE],
		texts: [TEXT_FIXTURE],
		highlights: [HIGHLIGHT_FIXTURE],
	},
};

/**
 * テキストツール中はカーソルが `text` になり、空クリック (= 動かさず
 * pointerup) で新規テキスト入力を開始する。既存注釈の上ならテキスト以外の
 * 種別でも掴める。
 * @summary テキストツール (text カーソル)
 */
export const TextTool: Story = {
	args: {
		...baseArgs,
		activeTool: "text",
		texts: [TEXT_FIXTURE],
	},
};
