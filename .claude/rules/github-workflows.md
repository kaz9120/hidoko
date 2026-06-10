---
paths:
  - ".github/workflows/**"
---

# GitHub Actions のルール

- action は必ず commit SHA で pin し、コメントにバージョンを書く（例: `actions/checkout@de0fac... # v6.0.2`）。既存の [ci.yml](workflows/ci.yml) に倣う。
- Bun のバージョンは `env.BUN_VERSION` で一元管理する。`bun install` は `--frozen-lockfile` を付ける。
- preview URL の PR コメントは Cloudflare Workers Builds の責務。GitHub Actions 側で preview URL を投稿するワークフローを追加しない。
- VRT (reg-suit) は差分があってもジョブを fail させない（`continue-on-error: true`）。差分の採否は人間が PR コメントで判断する。
- `permissions` は必要最小限にする（既定は `contents: read`）。
