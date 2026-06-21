#!/usr/bin/env bun
/**
 * shadcn 公式 registry との差分を確認する。
 *
 * 背景:
 *   packages/ui の shadcn コンポーネントは直接編集を許可する方針 (PR #363) に
 *   切り替わった。全件上書きの sync スクリプトは使えなくなったため、代わりに
 *   このスクリプトで「shadcn 公式に更新があるか」だけを定期確認し、必要な
 *   fix は個別に手で cherry-pick する運用に変えている。
 *
 * 使い方:
 *   bun --filter ui check-updates    # ローカルで diff を見る
 *   bun run ui:check-updates         # ルートから同じ動作
 */

import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(here, "..");

const result = spawnSync("bunx", ["--bun", "shadcn@latest", "diff"], {
	stdio: "inherit",
	cwd: pkgRoot,
});

process.exit(result.status ?? 0);
