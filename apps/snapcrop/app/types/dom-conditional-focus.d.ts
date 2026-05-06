/**
 * Conditional Focus API (https://wicg.github.io/conditional-focus/) は
 * 比較的新しい仕様で、TypeScript 6 系の lib.dom.d.ts にはまだ含まれていない。
 * 必要なメンバーだけ ambient で宣言して使用箇所 (screen-capture.ts) を満たす。
 *
 * 対応ブラウザの範囲は MDN を参照。実行時に prototype 検出してから呼ぶこと。
 */
declare global {
	class CaptureController {
		constructor();
		setFocusBehavior(
			behavior: "focus-captured-surface" | "no-focus-change",
		): void;
	}

	interface DisplayMediaStreamOptions {
		controller?: CaptureController;
	}
}

export type {};
