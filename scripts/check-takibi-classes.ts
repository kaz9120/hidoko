/**
 * アプリのコードに、Takibi Design System が定義していないユーティリティクラスが残っていないかを調べる。
 *
 * Takibi は Tailwind の既定パレット・角丸・影・文字の大きさなどを消しているので、
 * 定義のないクラス（`bg-card`、`text-white`、`rounded-2xl` など）を書いても CSS が出ないだけで、
 * ビルドも型検査も通ってしまう。それをここで落とす。
 *
 * 使い方: bun scripts/check-takibi-classes.ts [対象ディレクトリ...]
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = join(import.meta.dir, "..");
const args = process.argv.slice(2);
const targets = args.length
	? args
	: readdirSync(join(root, "apps"))
			.map((d) => join("apps", d))
			.filter((d) =>
				statSync(join(root, d, "package.json"), { throwIfNoEntry: false }),
			);

const COLORS = new Set([
	"surface",
	"surface-raised",
	"surface-overlay",
	"surface-sunken",
	"surface-hover",
	"fg",
	"fg-strong",
	"fg-muted",
	"fg-subtle",
	"fg-on-brand",
	"fg-on-danger",
	"line",
	"line-subtle",
	"line-strong",
	"line-hover",
	"brand",
	"brand-hover",
	"brand-active",
	"brand-soft",
	"focus",
	"thumb",
	"success",
	"success-soft",
	"warning",
	"warning-soft",
	"danger",
	"danger-soft",
	"danger-solid",
	"info",
	"info-soft",
	"chart-1",
	"chart-2",
	"chart-3",
	"chart-4",
	"chart-5",
	"transparent",
	"current",
	"inherit",
]);

/** 色を取るプレフィックスと、色以外の意味を持つ値（幅・位置・スタイルなど） */
const NON_COLOR: Record<string, RegExp> = {
	text: /^(xs|sm|base|lg|xl|[2-6]xl|left|right|center|justify|start|end|wrap|nowrap|balance|pretty|ellipsis|clip)$/,
	bg: /^(none|fixed|local|scroll|clip-.+|origin-.+|repeat.*|no-repeat|cover|contain|auto|center|top|bottom|left|right|left-.+|right-.+|blend-.+|linear-.+|radial.*|conic.*|gradient-.+)$/,
	border:
		/^(\d+|solid|dashed|dotted|double|hidden|none|collapse|separate|spacing.*)$/,
	divide:
		/^(x|y|x-\d+|y-\d+|x-reverse|y-reverse|solid|dashed|dotted|double|none)$/,
	outline: /^(\d+|none|hidden|solid|dashed|dotted|double|offset-\d+)$/,
	ring: /^(\d+|inset)$/,
	"ring-offset": /^\d+$/,
	"inset-ring": /^\d+$/,
	"inset-shadow": /^none$/,
	stroke: /^(\d+|none)$/,
	fill: /^none$/,
	decoration:
		/^(solid|double|dotted|dashed|wavy|auto|from-font|clone|slice|\d+)$/,
	from: /^\d+%$/,
	via: /^\d+%$/,
	to: /^\d+%$/,
	placeholder: /^$/,
	caret: /^$/,
	accent: /^$/,
};

/** 色以外で、Takibi が既定の値を消して入れ替えている名前空間 */
const SCALES: Record<string, RegExp> = {
	rounded: /^(none|sm|md|lg|xl|full)$/,
	shadow: /^(rim|card|pop|glow|glow-soft|glow-strong|ember|none)$/,
	font: /^(sans|mono|thin|extralight|light|normal|medium|semibold|bold|extrabold|black|stretch-.+|features-.+)$/,
	tracking: /^(tight|snug|normal|mark)$/,
	ease: /^(standard|ember|out-expo|breath|settle|spring-snappy|spring-press|spring-soft|spring-glide|linear|initial)$/,
	animate: /^(spin|breath|ember-pulse|none)$/,
};

/**
 * 旧デザインシステム（packages/ui）にだけあった CSS 変数。Takibi には同じ名前がないので、
 * `var(--border)` や `bg-[var(--bg-sunken)]` のように参照すると、値が空になる。
 */
const OLD_VARS = new Set(
	`a11y-focus-color a11y-focus-offset a11y-focus-width a11y-target-comfortable a11y-target-min
	accent accent-active accent-foreground accent-hover accent-soft background bg bg-0 bg-overlay bg-raised
	bg-sunken border border-strong border-subtle brand brand-active brand-hover brand-soft card card-foreground
	chart-1 chart-2 chart-3 chart-4 chart-5 color-accent color-accent-foreground color-background color-border
	color-card color-card-foreground color-destructive color-destructive-foreground color-foreground color-input
	color-muted color-muted-foreground color-popover color-popover-foreground color-primary
	color-primary-foreground color-ring color-secondary color-secondary-foreground danger destructive
	destructive-foreground duration ease error-bg error-border error-text foreground glow-ember glow-ember-soft
	glow-ember-strong info info-bg info-border info-text input leading-relax muted muted-foreground normal-bg
	normal-border normal-text popover popover-foreground primary primary-foreground radius radius-2xl radius-xs
	ring secondary secondary-foreground success success-bg success-border success-text text text-faint text-min
	text-muted text-on-ember text-strong tracking-wide warning warning-bg warning-border warning-text width-app
	width-content width-narrow width-prose width-wide`.split(/\s+/),
);
const VAR_RE = /var\(--([a-z0-9-]+)/g;

const PREFIXES = [...Object.keys(NON_COLOR), ...Object.keys(SCALES)].sort(
	(a, b) => b.length - a.length,
);
const DIRECTIONAL = new Set(["border", "rounded"]);
const DIRS = [
	"t",
	"b",
	"l",
	"r",
	"x",
	"y",
	"s",
	"e",
	"tl",
	"tr",
	"bl",
	"br",
	"ss",
	"se",
	"es",
	"ee",
];
const CLASS_RE =
	/(?<![\w\-/.[])(?:[a-z0-9-]+:)*!?(-?[a-z]+(?:-[a-z0-9]+)+)(?:\/[\w.]+)?!?(?![\w\-[(=])/g;

/** true: 定義あり、false: 定義なし、undefined: 調べる対象外 */
function check(cls: string): boolean | undefined {
	for (const p of PREFIXES) {
		if (!cls.startsWith(`${p}-`)) continue;
		let value = cls.slice(p.length + 1);
		if (DIRECTIONAL.has(p)) {
			const dir = DIRS.find((d) => value === d || value.startsWith(`${d}-`));
			if (dir) {
				if (value === dir) return true;
				value = value.slice(dir.length + 1);
			}
		}
		if (p in SCALES) {
			if (SCALES[p].test(value)) return true;
			// shadow は色も取る
			if (p === "shadow" && COLORS.has(value)) return true;
			// ease-in / ease-out などの Tailwind 既定も消えている
			return false;
		}
		if (NON_COLOR[p].test(value)) return true;
		return COLORS.has(value);
	}
	return undefined;
}

function walk(dir: string, out: string[]) {
	for (const entry of readdirSync(dir)) {
		if (
			[
				"node_modules",
				"build",
				"storybook-static",
				".react-router",
				"__screenshots__",
				"public",
				"migrations",
			].includes(entry)
		)
			continue;
		const p = join(dir, entry);
		if (statSync(p).isDirectory()) walk(p, out);
		else if (/\.(tsx|css)$/.test(entry)) out.push(p);
	}
}

const files: string[] = [];
for (const t of targets) walk(join(root, t), files);

let problems = 0;
for (const file of files) {
	const lines = readFileSync(file, "utf8").split("\n");
	lines.forEach((line, i) => {
		// import 文と CSS の宣言・変数は見ない
		if (/^\s*(import|export) .* from /.test(line)) return;
		// コメントは見ない
		if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
		// 識別子の文字列（id: "text-1" など）は見ない
		if (/^\s*id: /.test(line)) return;
		for (const m of line.matchAll(VAR_RE)) {
			if (OLD_VARS.has(m[1])) {
				problems++;
				console.log(`${relative(root, file)}:${i + 1}  var(--${m[1]})`);
			}
		}
		if (file.endsWith(".css") && !/@apply/.test(line)) return;
		for (const m of line.matchAll(CLASS_RE)) {
			if (check(m[1].replace(/^-/, "")) === false) {
				problems++;
				console.log(`${relative(root, file)}:${i + 1}  ${m[0]}`);
			}
		}
	});
}

if (problems) {
	console.error(`\nTakibi に定義のないクラスが ${problems} 件あります。`);
	process.exit(1);
}
console.log("Takibi に定義のないクラスはありません。");
