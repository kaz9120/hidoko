/**
 * 数字キー 1〜4 でスタイルプリセット (きっちり / 手書き / 強調 / やわらか) を
 * 切り替えるショートカット。tool-rail からの選択と同じく、切替時に
 * sonner トーストで「スタイル: XX — 以降の図形に適用」を 2.2s 出す。
 *
 * - フォーム要素 (INPUT / TEXTAREA / contenteditable) にフォーカスがあるとき
 *   は何もしない (テキスト入力中の誤発火を避ける)
 * - 修飾キー (Cmd / Ctrl / Alt / Meta) が押されているときも無視 (ブラウザの
 *   タブ切替・他ショートカットに譲る)
 * - 画像未ロード時は計測しても意味がないので何もしない
 *
 * tool-rail.tsx の `handleStylePresetChange` と同じ挙動を hook 内に複製
 * (副作用が小さく、共有のために共通ヘルパーを切り出すほどでもない)。
 */

import { useEffect } from "react";
import { toast } from "sonner";
import { useSnapcrop } from "~/contexts/snapcrop-context";
import { STYLE_PRESET_ORDER, STYLE_PRESETS } from "~/lib/style-presets";

export function useStylePresetShortcuts() {
	const { image, setStylePreset } = useSnapcrop();

	useEffect(() => {
		if (!image) return;
		const onKey = (event: KeyboardEvent) => {
			if (event.metaKey || event.ctrlKey || event.altKey) return;
			const target = event.target;
			if (
				target instanceof HTMLElement &&
				(target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.isContentEditable)
			) {
				return;
			}
			// "1" / "2" / "3" / "4" を STYLE_PRESET_ORDER のインデックスに対応させる
			const index = "1234".indexOf(event.key);
			if (index < 0) return;
			const id = STYLE_PRESET_ORDER[index];
			if (!id) return;
			event.preventDefault();
			setStylePreset(id);
			const preset = STYLE_PRESETS[id];
			toast.success(`スタイル: ${preset.label}`, {
				description: `${preset.hint} — 以降の図形に適用`,
				duration: 2200,
			});
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [image, setStylePreset]);
}
