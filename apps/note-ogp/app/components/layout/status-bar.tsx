import { TriangleAlertIcon } from "lucide-react";
import type { Fields, TemplateDef } from "~/lib/og-templates";
import {
	FRAME_HEIGHT,
	FRAME_WIDTH,
	getReadabilityStatus,
	type ReadabilityStatus,
} from "~/lib/readability";

/**
 * 画面下端 24px のステータスバー。snapcrop の `status-bar.tsx` と同じ
 * 「下端 24px / `bg-card/50` の地・`text-muted-foreground` の文字色」を踏襲し、
 * note-ogp 用に並び順を組み替えたもの。
 *
 * 左から: 出力寸法（1280 × 670 固定） · 表示倍率 % · テンプレ名 · 特徴
 * 右から: 自動保存時刻 · 可読性インジケータ · タイトル文字数 / 行数
 *
 * 寸法は固定 (Issue #134) なので表示は定数。倍率は Stage が
 * `onScaleChange` で親に通知した値を受ける。
 */
export function StatusBar({
	tpl,
	fields,
	scale,
	titleFontSize,
	lastSavedAt,
}: {
	tpl: TemplateDef;
	fields: Fields;
	/** Stage の縮小プレビューが今描いている倍率（0-1）。 */
	scale: number;
	/** AutoFitTitle が確定したフォントサイズ（1280px 基準）。未確定なら null */
	titleFontSize: number | null;
	/** 直近の自動保存時刻。初回マウント中は null。 */
	lastSavedAt: Date | null;
}) {
	const titleLength = fields.title.length;
	const lineCount = fields.title.split("\n").length;
	const readability = fields.title
		? getReadabilityStatus(fields, titleFontSize)
		: null;

	return (
		<footer className="flex h-6 shrink-0 items-center gap-3 border-border border-t bg-card/50 px-3 font-mono text-[11px] text-muted-foreground">
			<span className="text-foreground/80">
				{FRAME_WIDTH} × {FRAME_HEIGHT}
			</span>
			<Sep />
			<span>{Math.round(scale * 100)}%</span>
			<Sep />
			<span className="text-foreground/80">{tpl.label}</span>
			<span className="hidden md:inline">· {tpl.note}</span>

			<span className="ml-auto" />

			<span>
				{titleLength} 文字 · {lineCount} 行
			</span>
			<Sep />
			<ReadabilityChip status={readability} />
			<Sep />
			<span>
				{lastSavedAt ? `保存 ${formatTime(lastSavedAt)}` : "保存待ち"}
			</span>
		</footer>
	);
}

/**
 * 可読性インジケータ。タイトルが空のとき (`status === null`) は中立。
 * ok = moss のドット、warn / bad = 警告色のアイコン。
 */
function ReadabilityChip({ status }: { status: ReadabilityStatus | null }) {
	if (!status) {
		return <span className="text-(--text-faint)">—</span>;
	}
	if (status.level === "ok") {
		return (
			<span className="flex items-center gap-1">
				<span aria-hidden="true" className="text-[var(--moss)]">
					●
				</span>
				<span className="hidden lg:inline">{status.reason}</span>
			</span>
		);
	}
	return (
		<span
			className="flex items-center gap-1 text-(--warning)"
			title={status.reason}
		>
			<TriangleAlertIcon
				aria-hidden="true"
				className="size-3 flex-shrink-0"
				strokeWidth={1.75}
			/>
			<span className="hidden lg:inline">{status.reason}</span>
		</span>
	);
}

function formatTime(d: Date): string {
	const pad = (n: number) => n.toString().padStart(2, "0");
	return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function Sep() {
	return (
		<span aria-hidden="true" className="text-[var(--text-faint)]">
			·
		</span>
	);
}
