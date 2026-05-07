import type { TestRunnerConfig } from "@storybook/test-runner";

// 後続 PR で reg-suit による VRT に繋げるため、ストーリーを撮る前提条件を
// 揃える。撮影本体（postVisit でのスクリーンショット保存）は別コミットで足す。
const config: TestRunnerConfig = {
	async preVisit(page) {
		await page.setViewportSize({ width: 1280, height: 800 });
	},
};

export default config;
