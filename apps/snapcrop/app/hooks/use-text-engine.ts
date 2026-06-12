import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	type TextEngineHandle,
	useSnapcrop,
} from "~/contexts/snapcrop-context";
import {
	clampPointInImage,
	cloneTextAnnotation,
	createTextAnnotation,
	duplicateTextAnnotation,
	type ImageMetrics,
	moveText,
	type TextAnnotation,
} from "~/lib/text-engine";

type ImagePoint = { x: number; y: number };

/**
 * 進行中のドラッグ操作。テキストはドラッグ描画がない (クリックで編集開始) ので
 * moving と duplicating (Alt+ドラッグ複製) だけ。use-arrow-engine.ts と同じ構造。
 */
type Interaction =
	| {
			kind: "moving";
			id: string;
			startImg: ImagePoint;
			startText: TextAnnotation;
			currentImg: ImagePoint;
	  }
	| {
			kind: "duplicating";
			/** 元と同位置に採番済みのコピー。pointerup まで context には入れない */
			copy: TextAnnotation;
			startImg: ImagePoint;
			currentImg: ImagePoint;
	  };

/**
 * インライン編集の状態。id === null は「空クリックからの新規作成」で、
 * x / y がアンカーになる。id 付きは既存テキストの再編集 (ダブルクリック)。
 * テキストの中身は TextEditorOverlay の textarea がローカルに持ち、
 * commitEdit で初めて context (= 単一履歴) に入る。
 */
export type TextEditingState = {
	id: string | null;
	x: number;
	y: number;
};

export type UseTextEngineResult = {
	/** 表示用 text 配列。moving 中はそのテキストだけ delta 反映済 */
	renderedTexts: readonly TextAnnotation[];
	/** moving 進行中か (編集中は含まない) */
	isInteracting: boolean;
	/** インライン編集中の状態。null なら編集していない */
	editing: TextEditingState | null;
	/**
	 * 移動を開始する。id でなく annotation そのものを受け取る — commit 直後の
	 * テキストは context 反映前で id 検索できないため、interaction layer が
	 * hit test の結果をそのまま渡す。
	 */
	beginMove: (target: TextAnnotation, startImg: ImagePoint) => void;
	/**
	 * Alt+ドラッグ複製を開始する。source のコピーをその場に作り、以後の
	 * ドラッグはコピー側を動かす (元は動かない)。endInteraction で初めて
	 * コピーを context に commit するので、複製は undo 1 回で取り消せる。
	 */
	beginDuplicate: (source: TextAnnotation, startImg: ImagePoint) => void;
	updateInteraction: (currentImg: ImagePoint) => void;
	endInteraction: () => void;
	cancelInteraction: () => void;
	/** 空クリックから新規テキストの編集を開始する */
	beginCreate: (pt: ImagePoint) => void;
	/** 既存テキストの再編集を開始する (ダブルクリック) */
	beginEdit: (id: string) => void;
	/**
	 * 編集を確定する。新規で空文字なら何も作らず、既存で空文字なら削除する
	 * (issue #50 の仕様)。確定後の annotation を返す (作らない / 削除した
	 * ときは null)。
	 */
	commitEdit: (value: string) => TextAnnotation | null;
	/**
	 * 編集中なら textarea の現在値で即時 commit し、確定後の annotation を
	 * 返す。interaction layer が pointerdown で「確定 → そのままドラッグ」を
	 * 1 ジェスチャに繋ぐために使う (issue #80)。編集していなければ null。
	 */
	flushEdit: () => TextAnnotation | null;
	/** TextEditorOverlay が flushEdit の実体を mount 中だけ登録する */
	registerEditorFlush: (flush: (() => TextAnnotation | null) | null) => void;
	/** 編集を破棄する (新規は捨て、既存は元のまま) */
	cancelEdit: () => void;
	/** context にぶら下げる用の安定ハンドル。useEffect で ref へ差し込む */
	handle: TextEngineHandle;
};

/**
 * テキストアノテーションの interaction 状態を管理。use-arrow-engine.ts と同様、
 * ドラッグ中の中間状態は state + ref で扱い、endInteraction / commitEdit で
 * 初めて context (= rect / arrow と共有の単一履歴) に commit する。
 */
export function useTextEngine(image: ImageMetrics): UseTextEngineResult {
	const {
		activeTool,
		texts,
		textDefaults,
		createText,
		updateText,
		deleteText,
	} = useSnapcrop();

	// interaction は表示にも使うので state で持ち、副作用は endInteraction で
	// ref を読んでから処理する (StrictMode の二重実行回避。arrow 側と同じ理由)。
	const [interaction, setInteraction] = useState<Interaction | null>(null);
	const interactionRef = useRef<Interaction | null>(null);
	interactionRef.current = interaction;

	const [editing, setEditing] = useState<TextEditingState | null>(null);
	const editingRef = useRef<TextEditingState | null>(null);
	editingRef.current = editing;

	const imageRef = useRef(image);
	imageRef.current = image;
	const textDefaultsRef = useRef(textDefaults);
	textDefaultsRef.current = textDefaults;
	const textsRef = useRef(texts);
	textsRef.current = texts;

	// ツールがテキスト以外に切り替わったら、進行中の操作・編集を破棄する
	// (通常はツール切替前に textarea の blur が commit 済み。これは保険)。
	useEffect(() => {
		if (activeTool !== "text") {
			interactionRef.current = null;
			setInteraction(null);
			editingRef.current = null;
			setEditing(null);
		}
	}, [activeTool]);

	const beginMove = useCallback(
		(target: TextAnnotation, startImg: ImagePoint) => {
			setInteraction({
				kind: "moving",
				id: target.id,
				startImg,
				startText: target,
				currentImg: startImg,
			});
		},
		[],
	);

	const beginDuplicate = useCallback(
		(source: TextAnnotation, startImg: ImagePoint) => {
			setInteraction({
				kind: "duplicating",
				copy: cloneTextAnnotation(source),
				startImg,
				currentImg: startImg,
			});
		},
		[],
	);

	const updateInteraction = useCallback((currentImg: ImagePoint) => {
		setInteraction((prev) => (prev ? { ...prev, currentImg } : null));
	}, []);

	const cancelInteraction = useCallback(() => {
		interactionRef.current = null;
		setInteraction(null);
	}, []);

	const endInteraction = useCallback(() => {
		const prev = interactionRef.current;
		if (!prev) return;
		const img = imageRef.current;
		// 副作用を setState の外で先に処理してから state クリア
		const dx = prev.currentImg.x - prev.startImg.x;
		const dy = prev.currentImg.y - prev.startImg.y;
		if (prev.kind === "duplicating") {
			// 動かさず放したときは元と完全に重なって気づけないため、⌘D と同じ
			// オフセット配置にフォールバックする
			createText(
				dx === 0 && dy === 0
					? duplicateTextAnnotation(prev.copy, img)
					: moveText(prev.copy, { dx, dy }, img),
			);
		} else {
			const next = moveText(prev.startText, { dx, dy }, img);
			updateText(prev.id, { x: next.x, y: next.y });
		}
		interactionRef.current = null;
		setInteraction(null);
	}, [createText, updateText]);

	const beginCreate = useCallback((pt: ImagePoint) => {
		const clamped = clampPointInImage(pt, imageRef.current);
		setEditing({ id: null, x: clamped.x, y: clamped.y });
	}, []);

	const beginEdit = useCallback((id: string) => {
		const target = textsRef.current.find((t) => t.id === id);
		if (!target) return;
		setEditing({ id, x: target.x, y: target.y });
	}, []);

	const commitEdit = useCallback(
		(value: string): TextAnnotation | null => {
			const ed = editingRef.current;
			if (!ed) return null;
			editingRef.current = null;
			setEditing(null);
			const isEmpty = value.trim() === "";
			if (ed.id === null) {
				// 空文字で確定したら注釈を作らない (issue #50)
				if (isEmpty) return null;
				const created = createTextAnnotation({
					x: ed.x,
					y: ed.y,
					text: value,
					defaults: textDefaultsRef.current,
				});
				createText(created);
				return created;
			}
			if (isEmpty) {
				deleteText(ed.id);
				return null;
			}
			updateText(ed.id, { text: value });
			const target = textsRef.current.find((t) => t.id === ed.id);
			return target ? { ...target, text: value } : null;
		},
		[createText, deleteText, updateText],
	);

	// TextEditorOverlay が登録する「現在の入力値で即時 commit する」関数。
	// blur 経由の commit を待つと、編集中の pointerdown が確定に消費される
	// だけで「確定 → そのままドラッグ」が繋がらない (issue #80)。
	const editorFlushRef = useRef<(() => TextAnnotation | null) | null>(null);

	const registerEditorFlush = useCallback(
		(flush: (() => TextAnnotation | null) | null) => {
			editorFlushRef.current = flush;
		},
		[],
	);

	const flushEdit = useCallback(() => editorFlushRef.current?.() ?? null, []);

	const cancelEdit = useCallback(() => {
		editingRef.current = null;
		setEditing(null);
	}, []);

	// rendered = text list + moving / duplicating の delta を視覚的に反映
	const renderedTexts = useMemo(() => {
		if (!interaction) return texts;
		const dx = interaction.currentImg.x - interaction.startImg.x;
		const dy = interaction.currentImg.y - interaction.startImg.y;
		const img = imageRef.current;
		if (interaction.kind === "duplicating") {
			// commit 前のコピーを末尾 (= 同種内で最前面) に足して見せる
			return [...texts, moveText(interaction.copy, { dx, dy }, img)];
		}
		return texts.map((t) =>
			t.id === interaction.id
				? moveText(interaction.startText, { dx, dy }, img)
				: t,
		);
	}, [texts, interaction]);

	// handle: 上で持っている ref を参照するだけの安定関数を返す。編集中も
	// isInteracting=true 扱いにして、rect 側 Esc の「選択解除」を抑制する。
	const handle = useMemo<TextEngineHandle>(
		() => ({
			isInteracting: () =>
				interactionRef.current !== null || editingRef.current !== null,
			cancelInteraction: () => {
				interactionRef.current = null;
				setInteraction(null);
				editingRef.current = null;
				setEditing(null);
			},
		}),
		[],
	);

	return {
		renderedTexts,
		isInteracting: interaction !== null,
		editing,
		beginMove,
		beginDuplicate,
		updateInteraction,
		endInteraction,
		cancelInteraction,
		beginCreate,
		beginEdit,
		commitEdit,
		flushEdit,
		registerEditorFlush,
		cancelEdit,
		handle,
	};
}
