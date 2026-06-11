/**
 * Cloudflare Workers Builds の build watch paths を同期するスクリプト。
 *
 * 各 app の監視パスは「app 自身 + workspace 依存（推移的）+ ルートの共有ファイル」
 * から導出する。導出で足りない app（例: storybook は全 workspace の story を集約する）は
 * package.json の `workersBuilds.watchPaths` で全置換できる。
 *
 * 使い方:
 *   bun run cf:watch-paths --dry-run        # 差分の確認だけ
 *   bun run cf:watch-paths                  # 実際に PATCH する
 *   bun run cf:watch-paths --app snapcrop   # 特定 app に絞る
 *
 * 認証は環境変数（.env でも可）で渡す。
 *   CLOUDFLARE_API_TOKEN  … user-scoped トークン。Account 所有トークンは Builds API が受け付けない
 *                           権限: Workers Builds Configuration: Edit / Workers Scripts: Read
 *   CLOUDFLARE_ACCOUNT_ID … 対象アカウントの ID
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const ROOT_WATCH_FILES = ["bun.lock", "package.json", "tsconfig.base.json"];
const API_BASE = "https://api.cloudflare.com/client/v4";

interface PackageJson {
	name: string;
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	workersBuilds?: { watchPaths?: string[] };
}

interface Workspace {
	pkg: PackageJson;
	/** リポジトリルートからの相対パス（例: "apps/snapcrop"） */
	dir: string;
	/** workspace: プロトコルで参照している依存の名前 */
	workspaceDeps: string[];
}

interface App extends Workspace {
	/** wrangler.jsonc の name（= Cloudflare 上の Worker 名） */
	workerName: string;
}

/** wrangler.jsonc 向けの素朴な JSONC パーサ。文字列内を保護しつつコメントと末尾カンマを落とす */
function parseJsonc(text: string): unknown {
	let out = "";
	let i = 0;
	while (i < text.length) {
		const c = text[i];
		if (c === '"') {
			out += c;
			i++;
			while (i < text.length && text[i] !== '"') {
				if (text[i] === "\\") {
					out += text[i];
					i++;
				}
				out += text[i];
				i++;
			}
			out += text[i] ?? "";
			i++;
		} else if (c === "/" && text[i + 1] === "/") {
			while (i < text.length && text[i] !== "\n") i++;
		} else if (c === "/" && text[i + 1] === "*") {
			i += 2;
			while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i++;
			i += 2;
		} else {
			out += c;
			i++;
		}
	}
	return JSON.parse(out.replace(/,\s*([}\]])/g, "$1"));
}

function readWorkspace(dir: string): Workspace | null {
	const pkgPath = join(ROOT, dir, "package.json");
	if (!existsSync(pkgPath)) return null;
	const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as PackageJson;
	const deps = { ...pkg.dependencies, ...pkg.devDependencies };
	const workspaceDeps = Object.keys(deps).filter((name) =>
		deps[name]?.startsWith("workspace:"),
	);
	return { pkg, dir, workspaceDeps };
}

function collectWorkspaces(): Map<string, Workspace> {
	const byName = new Map<string, Workspace>();
	for (const group of ["apps", "packages"]) {
		for (const entry of readdirSync(join(ROOT, group), {
			withFileTypes: true,
		})) {
			if (!entry.isDirectory()) continue;
			const ws = readWorkspace(join(group, entry.name));
			if (ws) byName.set(ws.pkg.name, ws);
		}
	}
	return byName;
}

function collectApps(workspaces: Map<string, Workspace>): App[] {
	const apps: App[] = [];
	for (const ws of workspaces.values()) {
		const wranglerPath = join(ROOT, ws.dir, "wrangler.jsonc");
		if (!existsSync(wranglerPath)) continue;
		const wrangler = parseJsonc(readFileSync(wranglerPath, "utf8")) as {
			name?: string;
		};
		if (!wrangler.name) {
			console.warn(`skip: ${ws.dir}/wrangler.jsonc に name がない`);
			continue;
		}
		apps.push({ ...ws, workerName: wrangler.name });
	}
	return apps;
}

function desiredWatchPaths(
	app: App,
	workspaces: Map<string, Workspace>,
): string[] {
	const override = app.pkg.workersBuilds?.watchPaths;
	if (override) return [...override].sort();

	const dirs = new Set([app.dir]);
	const queue = [...app.workspaceDeps];
	while (queue.length > 0) {
		const name = queue.shift();
		const dep = name ? workspaces.get(name) : undefined;
		if (!dep || dirs.has(dep.dir)) continue;
		dirs.add(dep.dir);
		queue.push(...dep.workspaceDeps);
	}
	return [...[...dirs].map((dir) => `${dir}/*`), ...ROOT_WATCH_FILES].sort();
}

async function cf<T>(
	token: string,
	path: string,
	init?: RequestInit,
): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`, {
		...init,
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
	});
	const body = (await res.json()) as {
		success?: boolean;
		errors?: unknown;
		result: T;
	};
	if (!res.ok || body.success === false) {
		throw new Error(
			`${path} -> ${res.status}: ${JSON.stringify(body.errors ?? body)}`,
		);
	}
	return body.result;
}

const { values: args } = parseArgs({
	options: {
		"dry-run": { type: "boolean", default: false },
		app: { type: "string" },
	},
});

const token = process.env.CLOUDFLARE_API_TOKEN;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
if (!token || !accountId) {
	console.error(
		"CLOUDFLARE_API_TOKEN と CLOUDFLARE_ACCOUNT_ID を環境変数（.env でも可）で渡してください。",
	);
	console.error(
		"トークンは user-scoped で、Workers Builds Configuration: Edit / Workers Scripts: Read の権限が必要です。",
	);
	process.exit(1);
}

const workspaces = collectWorkspaces();
let apps = collectApps(workspaces);
if (args.app) {
	apps = apps.filter(
		(a) => a.pkg.name === args.app || a.workerName === args.app,
	);
	if (apps.length === 0) {
		console.error(`app が見つからない: ${args.app}`);
		process.exit(1);
	}
}

// Worker 名 -> tag (Builds API が使う external_script_id) の対応表
const scripts = await cf<{ id: string; tag: string }[]>(
	token,
	`/accounts/${accountId}/workers/scripts`,
);
const tagByName = new Map(scripts.map((s) => [s.id, s.tag]));

let failed = false;
for (const app of apps) {
	const desired = desiredWatchPaths(app, workspaces);
	const tag = tagByName.get(app.workerName);
	if (!tag) {
		console.warn(
			`skip: ${app.workerName} が Cloudflare 上にない（初回デプロイ前なら、デプロイ後に再実行する）`,
		);
		continue;
	}

	const triggers = await cf<
		{ trigger_uuid: string; trigger_name: string; path_includes?: string[] }[]
	>(token, `/accounts/${accountId}/builds/workers/${tag}/triggers`);
	if (triggers.length === 0) {
		console.warn(
			`skip: ${app.workerName} に build trigger がない（Git 連携が未設定）`,
		);
		continue;
	}

	for (const trigger of triggers) {
		const current = [...(trigger.path_includes ?? [])].sort();
		const label = `${app.workerName} / ${trigger.trigger_name}`;
		if (JSON.stringify(current) === JSON.stringify(desired)) {
			console.log(`ok: ${label} は同期済み`);
			continue;
		}
		console.log(`update: ${label}`);
		console.log(`  current: ${current.join(", ") || "(なし)"}`);
		console.log(`  desired: ${desired.join(", ")}`);
		if (args["dry-run"]) continue;
		try {
			await cf(
				token,
				`/accounts/${accountId}/builds/triggers/${trigger.trigger_uuid}`,
				{
					method: "PATCH",
					body: JSON.stringify({ path_includes: desired }),
				},
			);
			console.log(`  -> 更新した`);
		} catch (err) {
			failed = true;
			console.error(`  -> 失敗: ${err instanceof Error ? err.message : err}`);
		}
	}
}

if (args["dry-run"]) console.log("(dry-run のため変更していない)");
if (failed) process.exit(1);
