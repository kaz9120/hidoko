import { mkdir } from "node:fs/promises";
import path from "node:path";
import {
	type TestRunnerConfig,
	waitForPageReady,
} from "@storybook/test-runner";

// `bun --filter snapcrop test-storybook` は apps/snapcrop を cwd として実行される。
// reg-suit が actualDir として参照する場所と合わせる。
const SCREENSHOT_DIR = path.resolve("__screenshots__");

const config: TestRunnerConfig = {
	async preVisit(page) {
		await page.setViewportSize({ width: 1280, height: 800 });
	},
	async postVisit(page, context) {
		await waitForPageReady(page);
		await mkdir(SCREENSHOT_DIR, { recursive: true });
		await page.screenshot({
			path: path.join(SCREENSHOT_DIR, `${context.id}.png`),
			fullPage: false,
		});
	},
};

export default config;
