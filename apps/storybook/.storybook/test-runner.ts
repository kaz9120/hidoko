import { mkdir } from "node:fs/promises";
import path from "node:path";
import {
	type TestRunnerConfig,
	waitForPageReady,
} from "@storybook/test-runner";

// `bun --filter hidoko-storybook test-storybook` は apps/storybook を cwd として実行される。
// reg-suit が actualDir として参照する場所 (regconfig.json) と合わせる。
const SCREENSHOT_DIR = path.resolve("__screenshots__");

// 撮影タイミングで見た目が変わる要素を止める (#65)。
// transition は `none` にすると最終状態へ即ジャンプするので、
// 遷移途中のフレームを撮ってしまう事故を防げる。
const FREEZE_CSS = `
	*,
	*::before,
	*::after {
		animation: none !important;
		transition: none !important;
		caret-color: transparent !important;
	}
`;

const config: TestRunnerConfig = {
	async preVisit(page) {
		await page.setViewportSize({ width: 1280, height: 800 });
		// <hi-embers> など prefers-reduced-motion を尊重する実装を静止状態に倒す。
		await page.emulateMedia({ reducedMotion: "reduce" });
	},
	async postVisit(page, context) {
		await waitForPageReady(page);
		await page.addStyleTag({ content: FREEZE_CSS });
		// Web フォント (LINE Seed JP / Inter 等) と画像のロード完了を待ってから撮る。
		await page.evaluate(async () => {
			await document.fonts.ready;
			await Promise.all(
				Array.from(document.images).map((img) =>
					img.decode().catch(() => undefined),
				),
			);
		});
		// スタイル反映と再レイアウトが描画に乗るのを 2 フレーム待つ。
		await page.evaluate(
			() =>
				new Promise((resolve) =>
					requestAnimationFrame(() => requestAnimationFrame(resolve)),
				),
		);
		await mkdir(SCREENSHOT_DIR, { recursive: true });
		await page.screenshot({
			path: path.join(SCREENSHOT_DIR, `${context.id}.png`),
			fullPage: false,
		});
	},
};

export default config;
