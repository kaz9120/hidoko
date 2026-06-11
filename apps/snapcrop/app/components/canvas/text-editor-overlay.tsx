import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TextEditingState } from "~/hooks/use-text-engine";
import {
	measureLineWidth,
	TEXT_BG_PADDING_RATIO,
	TEXT_LINE_HEIGHT,
	type TextAnnotation,
	type TextDefaults,
	textBackgroundColor,
	textFontString,
} from "~/lib/text-engine";

type Props = {
	editing: TextEditingState;
	texts: readonly TextAnnotation[];
	defaults: TextDefaults;
	zoom: number;
	onCommit: (value: string) => TextAnnotation | null;
	onCancel: () => void;
	/**
	 * 「現在の入力値で即時 commit する」関数の登録先 (engine の
	 * registerEditorFlush)。interaction layer が pointerdown で
	 * 「確定 → そのままドラッグ」を 1 ジェスチャに繋ぐために呼ぶ。
	 */
	registerFlush: (flush: (() => TextAnnotation | null) | null) => void;
};

/**
 * インライン編集用の textarea オーバーレイ。新規 (editing.id === null) は
 * 空の textarea を、再編集 (ダブルクリック) は既存テキストの内容を、
 * アンカー位置にそのままの見た目 (フォント / サイズ / 色 / 背景 / 寄せ) で
 * 重ねる。確定は blur か ⌘/Ctrl+Enter、破棄は Esc。Enter は改行 (複数行対応)。
 * stage 内の外側クリックは AnnotationInteractionLayer が registerFlush 経由で即時
 * commit する (確定クリックをそのままドラッグ開始に繋ぐため。issue #80)。
 * blur 確定は、ツールバー操作やタブ切替などレイヤー外へフォーカスが移る
 * ケースの受け皿として残す。
 *
 * 矢印ツールの preview-overlay 相当の位置づけ — テキストはドラッグ描画の
 * preview を持たない代わりに、この編集 UI が「まだ commit されていない状態」
 * を担う。IME 入力との衝突は、(1) フォーカスが textarea にある間は document
 * レベルのショートカットが入力欄ガードで全て無効になること、(2) 変換中の
 * Esc / Enter は isComposing を見て素通しすること、の 2 段で避ける。
 */
export function TextEditorOverlay({
	editing,
	texts,
	defaults,
	zoom,
	onCommit,
	onCancel,
	registerFlush,
}: Props) {
	const source = editing.id
		? (texts.find((t) => t.id === editing.id) ?? null)
		: null;
	const style: TextDefaults = source
		? {
				fontFamily: source.fontFamily,
				fontSize: source.fontSize,
				align: source.align,
				bold: source.bold,
				italic: source.italic,
				color: source.color,
				background: source.background,
			}
		: defaults;

	const [value, setValue] = useState(source?.text ?? "");
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	// commit / cancel 済みフラグ。Esc 直後の unmount に伴う blur で
	// 二重 commit しないための保険。
	const doneRef = useRef(false);
	// flush (interaction layer 起点の即時 commit) からも最新値で確定できる
	// よう、value と onCommit は ref でミラーする
	const valueRef = useRef(value);
	valueRef.current = value;
	const onCommitRef = useRef(onCommit);
	onCommitRef.current = onCommit;

	useEffect(() => {
		const el = textareaRef.current;
		if (!el) return;
		el.focus();
		// 再編集は全選択で「打ち直し」をすぐ始められるように
		el.select();
	}, []);

	const commit = useCallback((): TextAnnotation | null => {
		if (doneRef.current) return null;
		doneRef.current = true;
		return onCommitRef.current(valueRef.current);
	}, []);

	// mount 中だけ、engine 経由の即時 commit (flushEdit) に実体を提供する
	useEffect(() => {
		registerFlush(commit);
		return () => registerFlush(null);
	}, [registerFlush, commit]);

	// 画面 px でのフォント指定。寸法は全て fontSize × zoom 基準で揃える
	const screenFontSize = style.fontSize * zoom;
	const screenFont = textFontString({
		fontFamily: style.fontFamily,
		fontSize: screenFontSize,
		bold: style.bold,
		italic: style.italic,
	});

	const lines = useMemo(() => value.split("\n"), [value]);
	const contentWidth = useMemo(() => {
		const max = lines.reduce(
			(acc, line) =>
				Math.max(acc, measureLineWidth(line, screenFont, screenFontSize)),
			0,
		);
		// caret ぶんの余白 + 最低幅 (空でもクリックできる大きさ)
		return Math.max(max + screenFontSize * 0.5, screenFontSize * 2);
	}, [lines, screenFont, screenFontSize]);

	const bg = textBackgroundColor(style.background);
	const padX = bg ? screenFontSize * TEXT_BG_PADDING_RATIO : 0;
	const padY = padX * 0.6;
	const boxWidth = contentWidth + padX * 2;
	const boxHeight = lines.length * screenFontSize * TEXT_LINE_HEIGHT + padY * 2;

	const anchorX = editing.x * zoom;
	const left =
		style.align === "left"
			? anchorX - padX
			: style.align === "center"
				? anchorX - boxWidth / 2
				: anchorX - boxWidth + padX;
	const top = editing.y * zoom - padY;

	const cancel = () => {
		if (doneRef.current) return;
		doneRef.current = true;
		onCancel();
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		// IME 変換中の Esc / Enter は IME 自身の操作なので素通しする
		if (e.nativeEvent.isComposing || e.keyCode === 229) return;
		if (e.key === "Escape") {
			e.preventDefault();
			e.stopPropagation();
			cancel();
			return;
		}
		if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			commit();
		}
	};

	return (
		<textarea
			aria-label="テキストを入力"
			className="absolute resize-none overflow-hidden outline-1 outline-dashed outline-[var(--ember-400)]"
			onBlur={commit}
			onChange={(e) => setValue(e.target.value)}
			onKeyDown={onKeyDown}
			ref={textareaRef}
			rows={lines.length}
			spellCheck={false}
			style={{
				left,
				top,
				width: boxWidth,
				height: boxHeight,
				padding: `${padY}px ${padX}px`,
				font: screenFont,
				lineHeight: TEXT_LINE_HEIGHT,
				textAlign: style.align,
				color: style.color,
				caretColor: style.color,
				background: bg ?? "transparent",
				borderRadius: bg ? Math.max(2, screenFontSize * 0.12) : 0,
				whiteSpace: "pre",
			}}
			value={value}
			wrap="off"
		/>
	);
}
