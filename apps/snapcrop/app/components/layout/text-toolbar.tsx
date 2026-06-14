import {
	AlignCenterIcon,
	AlignLeftIcon,
	AlignRightIcon,
	BanIcon,
	BoldIcon,
	ItalicIcon,
} from "lucide-react";
import {
	type ChangeEvent,
	type KeyboardEvent,
	type ReactNode,
	useEffect,
	useRef,
	useState,
} from "react";
import { ToggleGroup, ToggleGroupItem } from "ui";
import { ColorSwatches } from "~/components/layout/color-swatches";
import { useSnapcrop } from "~/contexts/snapcrop-context";
import {
	clampFontSize,
	MAX_TEXT_FONT_SIZE,
	MIN_TEXT_FONT_SIZE,
	TEXT_FONT_STACKS,
	type TextAlign,
	type TextBackground,
	type TextDefaults,
	type TextFontFamily,
} from "~/lib/text-engine";

const FONT_OPTIONS: ReadonlyArray<{
	id: TextFontFamily;
	label: string;
}> = [
	{ id: "sans", label: "ゴシック" },
	{ id: "serif", label: "明朝" },
	{ id: "mono", label: "等幅" },
];

const ALIGN_OPTIONS: ReadonlyArray<{
	id: TextAlign;
	label: string;
	icon: typeof AlignLeftIcon;
}> = [
	{ id: "left", label: "左寄せ", icon: AlignLeftIcon },
	{ id: "center", label: "中央寄せ", icon: AlignCenterIcon },
	{ id: "right", label: "右寄せ", icon: AlignRightIcon },
];

const BACKGROUND_OPTIONS: ReadonlyArray<{
	id: TextBackground;
	label: string;
}> = [
	{ id: "none", label: "背景なし" },
	{ id: "white", label: "背景 白" },
	{ id: "black", label: "背景 黒" },
];

/**
 * テキストツール選択中だけ現れる 38px の context row。「次に作るテキストの
 * デフォルト」を編集する。選択中のテキストのプロパティ編集は bbox 近傍の
 * フローティング (TextFloatingToolbar / #147 Phase 3) に集約されているので
 * こちらには出てこない。
 *
 * コントロールは「フォント (ゴシック / 明朝 / 等幅)・サイズ (px 入力)・寄せ
 * (左 / 中央 / 右)・太字 / 斜体・色・背景 (なし / 白 / 黒)」。色は矩形・矢印と
 * 共通のプリセット 6 色 (ColorSwatches)。
 */
export function TextToolbar() {
	const { image, activeTool, texts, textDefaults, setTextDefaults } =
		useSnapcrop();

	if (!image || activeTool !== "text") {
		return null;
	}

	const commit = (patch: Partial<TextDefaults>) => {
		setTextDefaults({ ...textDefaults, ...patch });
	};

	const styleValue: string[] = [
		...(textDefaults.bold ? ["bold"] : []),
		...(textDefaults.italic ? ["italic"] : []),
	];

	return (
		<div
			aria-label="テキストツールのプロパティ"
			className="flex h-[38px] shrink-0 items-center gap-2.5 border-border border-b bg-[var(--bg-overlay)] px-3.5"
			role="toolbar"
		>
			<span className="font-mono text-[10px] text-muted-foreground tracking-[0.08em] uppercase">
				テキスト
			</span>
			<Divider />

			<ToggleGroup
				aria-label="フォント"
				onValueChange={(next) => {
					if (next) commit({ fontFamily: next as TextFontFamily });
				}}
				type="single"
				value={textDefaults.fontFamily}
				variant="outline"
			>
				{FONT_OPTIONS.map((opt) => (
					<ToggleGroupItem
						key={opt.id}
						size="sm"
						title={opt.label}
						value={opt.id}
					>
						<span style={{ fontFamily: TEXT_FONT_STACKS[opt.id] }}>Aa</span>
					</ToggleGroupItem>
				))}
			</ToggleGroup>

			<Label>サイズ</Label>
			<FontSizeField
				onCommit={(size) => commit({ fontSize: size })}
				value={textDefaults.fontSize}
			/>

			<Divider />

			<ToggleGroup
				aria-label="寄せ"
				onValueChange={(next) => {
					if (next) commit({ align: next as TextAlign });
				}}
				type="single"
				value={textDefaults.align}
				variant="outline"
			>
				{ALIGN_OPTIONS.map((opt) => {
					const Icon = opt.icon;
					return (
						<ToggleGroupItem
							key={opt.id}
							size="sm"
							title={opt.label}
							value={opt.id}
						>
							<Icon strokeWidth={1.75} />
						</ToggleGroupItem>
					);
				})}
			</ToggleGroup>

			<ToggleGroup
				aria-label="スタイル"
				onValueChange={(next: string[]) => {
					commit({
						bold: next.includes("bold"),
						italic: next.includes("italic"),
					});
				}}
				type="multiple"
				value={styleValue}
				variant="outline"
			>
				<ToggleGroupItem size="sm" title="太字" value="bold">
					<BoldIcon strokeWidth={1.75} />
				</ToggleGroupItem>
				<ToggleGroupItem size="sm" title="斜体" value="italic">
					<ItalicIcon strokeWidth={1.75} />
				</ToggleGroupItem>
			</ToggleGroup>

			<Divider />

			<Label>色</Label>
			<ColorSwatches
				onChange={(color) => commit({ color })}
				value={textDefaults.color}
			/>

			<Divider />

			<Label>背景</Label>
			<ToggleGroup
				aria-label="背景"
				onValueChange={(next) => {
					if (next) commit({ background: next as TextBackground });
				}}
				type="single"
				value={textDefaults.background}
				variant="outline"
			>
				{BACKGROUND_OPTIONS.map((opt) => (
					<ToggleGroupItem
						key={opt.id}
						size="sm"
						title={opt.label}
						value={opt.id}
					>
						{opt.id === "none" ? (
							<BanIcon strokeWidth={1.75} />
						) : (
							<span
								className="block size-3 rounded-full border border-border"
								style={{
									// 画像へ焼き込む注釈の機能色なので純白 / 純黒で良い
									background: opt.id === "white" ? "#ffffff" : "#000000",
								}}
							/>
						)}
					</ToggleGroupItem>
				))}
			</ToggleGroup>

			<div className="flex-1" />

			<span className="font-mono text-[10px] text-muted-foreground tracking-[0.04em]">
				{texts.length} 個のテキスト
			</span>
		</div>
	);
}

/**
 * フォーカス中はユーザーの入力をそのまま保持し、blur / Enter で確定する
 * フォントサイズ入力。crop-toolbar.tsx の NumberField と同じ規約で、
 * フォーカスが外れているときだけ親から渡された value で同期する。
 */
function FontSizeField({
	value,
	onCommit,
}: {
	value: number;
	onCommit: (next: number) => void;
}) {
	const [draft, setDraft] = useState(String(value));
	const ref = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (document.activeElement !== ref.current) {
			setDraft(String(value));
		}
	}, [value]);

	const commit = () => {
		const n = Number.parseInt(draft, 10);
		if (Number.isFinite(n) && n > 0) {
			const clamped = clampFontSize(n);
			setDraft(String(clamped));
			onCommit(clamped);
		} else {
			setDraft(String(value));
		}
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter") {
			event.currentTarget.blur();
		} else if (event.key === "Escape") {
			setDraft(String(value));
			event.currentTarget.blur();
		}
	};

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setDraft(e.target.value);
	};

	return (
		<input
			aria-label={`フォントサイズ (${MIN_TEXT_FONT_SIZE}〜${MAX_TEXT_FONT_SIZE}px)`}
			className="h-7 w-14 rounded-sm border border-border bg-input/30 px-2 text-right font-mono text-foreground text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50"
			inputMode="numeric"
			onBlur={commit}
			onChange={handleChange}
			onKeyDown={handleKeyDown}
			ref={ref}
			type="text"
			value={draft}
		/>
	);
}

function Divider() {
	return (
		<span aria-hidden="true" className="h-[18px] w-px shrink-0 bg-border" />
	);
}

function Label({ children }: { children: ReactNode }) {
	return (
		<span className="font-mono text-[11px] text-muted-foreground">
			{children}
		</span>
	);
}
