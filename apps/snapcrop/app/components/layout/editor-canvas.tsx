import {
	type ReactNode,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
} from "react";
import { toast } from "sonner";
import { ImageStage } from "~/components/canvas/image-stage";
import { Viewport } from "~/components/canvas/viewport";
import { EmptyHero } from "~/components/layout/empty-hero";
import { SelectionToolbar } from "~/components/layout/selection-toolbar";
import { ToolRail } from "~/components/layout/tool-rail";
import { type LoadedImage, useSnapcrop } from "~/contexts/snapcrop-context";
import { useArrowShortcuts } from "~/hooks/use-arrow-shortcuts";
import { useCanvasShortcuts } from "~/hooks/use-canvas-shortcuts";
import { useClipboardPaste } from "~/hooks/use-clipboard-paste";
import { useCopyShortcut } from "~/hooks/use-copy-shortcut";
import { type CropRect, useCropEngine } from "~/hooks/use-crop-engine";
import { useCropShortcuts } from "~/hooks/use-crop-shortcuts";
import { useDuplicateShortcut } from "~/hooks/use-duplicate-shortcut";
import { useFileDrop } from "~/hooks/use-file-drop";
import { useHighlightShortcuts } from "~/hooks/use-highlight-shortcuts";
import { useRectShortcuts } from "~/hooks/use-rect-shortcuts";
import { useSelectAllShortcut } from "~/hooks/use-select-all-shortcut";
import { useStylePresetShortcuts } from "~/hooks/use-style-preset-shortcuts";
import { useTextShortcuts } from "~/hooks/use-text-shortcuts";
import { useZOrderShortcuts } from "~/hooks/use-z-order-shortcuts";

export function EditorCanvas() {
	const {
		image,
		loadImageFromBlob,
		cropperRef,
		activeTool,
		crop,
		cropEditing,
		commitCrop,
		annotations,
		arrows,
		texts,
		highlights,
	} = useSnapcrop();
	const isDragging = useFileDrop(loadImageFromBlob);
	useClipboardPaste((blob) => void loadImageFromBlob(blob, "clipboard"));
	useCopyShortcut({
		cropperRef,
		hasImage: image !== null,
		crop,
		cropEditing,
		commitCrop,
		annotations,
		arrows,
		texts,
		highlights,
		onSuccess: () => toast.success("クリップボードにコピーしました"),
		onFailure: () => toast.error("クリップボードへのコピーに失敗しました"),
	});
	useSelectAllShortcut({
		cropperRef,
		enabled: image !== null && activeTool === "crop" && cropEditing,
	});
	useCropShortcuts();
	useRectShortcuts();
	useArrowShortcuts();
	useTextShortcuts();
	useHighlightShortcuts();
	useDuplicateShortcut();
	useZOrderShortcuts();
	useStylePresetShortcuts();

	if (image) {
		// 画像 src が変わったら engine を作り直すために key を付ける。
		return (
			<ImageCanvas image={image} isDragging={isDragging} key={image.src} />
		);
	}

	return <EmptyHero isDragging={isDragging} />;
}

function ImageCanvas({
	image,
	isDragging,
}: {
	image: LoadedImage;
	isDragging: boolean;
}) {
	// zoom / viewportRef は context 持ち。ヘッダーの ZoomControl が % 表示と
	// fit / 拡縮の操作で参照するため、ここで Viewport と結線する。
	const {
		cropperRef,
		setCropData,
		zoom,
		setZoom,
		viewportRef,
		crop,
		cropEditing,
	} = useSnapcrop();
	const imgRef = useRef<HTMLImageElement | null>(null);

	const imageMetrics = useMemo(
		() => ({ naturalWidth: image.width, naturalHeight: image.height }),
		[image.width, image.height],
	);

	const engine = useCropEngine({
		image: imageMetrics,
		imgElementRef: imgRef,
		onChange: setCropData,
	});

	// engine の imperative ハンドルを context に張る。site-header / hooks は
	// cropperRef 経由で setAspectRatio / setData / selectAll などを呼ぶ。
	useEffect(() => {
		cropperRef.current = engine.handle;
		return () => {
			cropperRef.current = null;
		};
	}, [cropperRef, engine.handle]);

	// この ImageCanvas が unmount される時 (画像クリア時) は cropData も落とす。
	useEffect(() => {
		return () => setCropData(null);
	}, [setCropData]);

	useCanvasShortcuts(viewportRef);

	// 確定済みクロップがあり、かつ枠を編集していないときだけ切り取り表示にする。
	// クロップツールに戻ると元画像の全体が返ってくる。
	const croppedView = !cropEditing && crop !== null ? crop : null;
	const viewSize = croppedView
		? { width: croppedView.width, height: croppedView.height }
		: { width: image.width, height: image.height };

	// engine の枠は書き出し範囲そのもの。確定済みクロップが枠のドラッグ以外
	// (⌘Z / 全体に戻す) で変わったときは engine 側も追従させないと、表示と
	// 出力が食い違う。枠のドラッグでは crop は変わらないので、ここは走らない。
	useEffect(() => {
		const handle = cropperRef.current;
		if (!handle) return;
		handle.setData(
			crop ?? { x: 0, y: 0, width: image.width, height: image.height },
		);
	}, [crop, cropperRef, image.width, image.height]);

	// 表示範囲が切り替わったら fit し直す。切り取った結果が描画領域より大きくても
	// 全体が一度で見えるようにする。
	// biome-ignore lint/correctness/useExhaustiveDependencies: refit on view-size change only
	useEffect(() => {
		viewportRef.current?.fitToContainer();
	}, [viewportRef, viewSize.width, viewSize.height]);

	return (
		<section className="relative flex flex-1 overflow-hidden bg-[var(--ink-0)]">
			<ToolRail />
			<div className="relative min-w-0 flex-1">
				<Viewport
					image={viewSize}
					onZoomChange={setZoom}
					ref={viewportRef}
					zoom={zoom}
				>
					<CropWindow crop={croppedView} image={image} zoom={zoom}>
						<ImageStage
							cropEngine={engine}
							image={image}
							imgRef={imgRef}
							zoom={zoom}
						/>
					</CropWindow>
				</Viewport>
				<SelectionToolbar />
				{isDragging && <DropOverlay />}
			</div>
		</section>
	);
}

/**
 * 確定済みクロップの内側だけを映す窓。stage は切り取り後のサイズになるので、
 * 中身 (画像と全レイヤー) を元画像サイズのまま負のオフセットでずらして重ねる。
 * こうすると各レイヤーの座標系は元画像のまま変わらず、注釈の平行移動も
 * 焼き込みもいらない。
 *
 * 切り替えのたびに DESIGN.md の settle を掛け直す。キャンバスの中身が丸ごと
 * 入れ替わる操作なので、静止したまま差し替わると何が起きたか分からない。
 */
function CropWindow({
	crop,
	image,
	zoom,
	children,
}: {
	crop: CropRect | null;
	image: LoadedImage;
	zoom: number;
	children: ReactNode;
}) {
	const frameRef = useRef<HTMLDivElement | null>(null);

	// 表示範囲が切り替わるたびに settle を掛け直す。
	//
	// CSS クラスの付け外しでは 2 回目以降が再生されなかった (remove → reflow →
	// add が同じフレームにまとまり、ブラウザが同一の animation とみなす)。
	// クラスを JSX に固定しても、終わった animation は getAnimations() から
	// 消えるので再生し直せない。そのため WAAPI で明示的に回す。
	// biome-ignore lint/correctness/useExhaustiveDependencies: replay on view-mode change
	useLayoutEffect(() => {
		const el = frameRef.current;
		if (!el) return;
		playSettle(el);
	}, [crop === null, crop?.x, crop?.y, crop?.width, crop?.height]);

	if (!crop) {
		return (
			<div className="absolute inset-0" ref={frameRef}>
				{children}
			</div>
		);
	}

	return (
		<div className="absolute inset-0 overflow-hidden" ref={frameRef}>
			<div
				className="absolute"
				style={{
					left: -crop.x * zoom,
					top: -crop.y * zoom,
					width: image.width * zoom,
					height: image.height * zoom,
				}}
			>
				{children}
			</div>
		</div>
	);
}

/**
 * 着地 (settle) を 1 回再生する。keyframes は packages/ui の motion.css が持つ
 * `hi-settle` と同じ内容で、duration と easing は DESIGN.md のトークンから読む。
 * `prefers-reduced-motion` 下では動かさない (motion.css の方針と同じ)。
 */
function playSettle(el: HTMLElement): void {
	if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
	// 前の再生が残っていたら畳む。連続で切り替えたときに重ならないように。
	for (const running of el.getAnimations()) {
		running.cancel();
	}
	const styles = getComputedStyle(el);
	const duration = parseDurationMs(
		styles.getPropertyValue("--duration-relax"),
		560,
	);
	const easing =
		styles.getPropertyValue("--ease-settle").trim() ||
		"cubic-bezier(0.34, 1.12, 0.32, 1)";
	el.animate(
		[
			{
				opacity: 0,
				transform: "translateY(14px) scale(0.992)",
				filter: "blur(2px)",
			},
			{ opacity: 1, transform: "translateY(0) scale(1)", filter: "blur(0)" },
		],
		{ duration, easing },
	);
}

/** `560ms` / `0.56s` のどちらの表記でも ms に揃える。 */
function parseDurationMs(raw: string, fallback: number): number {
	const value = Number.parseFloat(raw);
	if (!Number.isFinite(value)) return fallback;
	return raw.trim().endsWith("ms") ? value : value * 1000;
}

function DropOverlay() {
	return (
		<div className="pointer-events-none absolute inset-5 flex items-center justify-center rounded-xl border-2 border-primary border-dashed bg-primary/10">
			<p className="font-medium text-foreground text-lg">
				ここにドロップして差し替え
			</p>
		</div>
	);
}
