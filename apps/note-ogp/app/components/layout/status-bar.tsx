import { TriangleAlertIcon } from "lucide-react";
import type { Fields, TitleSlot } from "~/lib/og-templates";
import { FRAME_HEIGHT, FRAME_WIDTH } from "~/lib/og-templates";

/**
 * 画面下端 24px のステータスバー。snapcrop の `status-bar.tsx` と同じ
 * 「下端 24px / `bg-card/50` の地・`text-muted-foreground` の文字色」を踏襲し、
 * note-ogp 用に並び順を組み替えたもの。
 *
 * 左から：出力寸法（1280 × 670 固定）·  表示倍率 % · 身振り（タイトル位置 + 号数）
 * 右から：自動保存時刻 · 可読性インジケータ · タイトル文字数 / 行数
 *
 * v3 では palette が廃止されたため、可読性はタイムライン実寸での「タイトルが
 * 読める大きさか」だけを見る。コントラスト判定はもう行わない。
 */
export function StatusBar({
	fields,
	scale,
	titleFontSize,
	lastSavedAt,
	sidebarCollapsed = false,
}: {
	fields: Fields;
	/** Stage の縮小プレビューが今描いている倍率（0-1）。 */
	scale: number;
	/** AutoFitTitle が確定したフォントサイズ（1280px 基準）。未確定なら null */
	titleFontSize: number | null;
	/** 直近の自動保存時刻。初回マウント中は null。 */
	lastSavedAt: Date | null;
	/**
	 * サイドパネルが折りたたまれているか (Issue #138)。true のときは右端に
	 * 「⌘\\ でパネルを開く」のヒントを足す。
	 */
	sidebarCollapsed?: boolean;
}) {
	const titleLength = fields.title.length;
	const lineCount = fields.title.split("\n").length;
	const readability = fields.title ? getReadabilityStatus(titleFontSize) : null;

	return (
		<footer className="flex h-6 shrink-0 items-center gap-3 border-border border-t bg-card/50 px-3 font-mono text-[11px] text-muted-foreground">
			<span className="text-foreground/80">
				{FRAME_WIDTH} × {FRAME_HEIGHT}
			</span>
			<Sep />
			<span>{Math.round(scale * 100)}%</span>
			<Sep />
			<span className="text-foreground/80">
				{SLOT_LABEL[fields.titleSlot]} · {NUMBER_LABEL[fields.numberTreatment]}
			</span>

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
			{sidebarCollapsed && (
				<>
					<Sep />
					<span className="hidden text-(--text-faint) md:inline">
						⌘\ でパネルを開く
					</span>
				</>
			)}
		</footer>
	);
}

// ─────────────────────────────────────────────────────────
// 可読性（タイムライン実寸でタイトルが読める大きさか）
// ─────────────────────────────────────────────────────────
const TIMELINE_CARD_WIDTH = 343;
const TIMELINE_SCALE = TIMELINE_CARD_WIDTH / FRAME_WIDTH;
const MIN_READABLE_PX = 10;
const TITLE_FONT_WARN_PX = Math.ceil(MIN_READABLE_PX / TIMELINE_SCALE);

type ReadabilityStatus = { level: "ok" | "warn" | "bad"; reason: string };

function getReadabilityStatus(titleFontSize: number | null): ReadabilityStatus {
	if (titleFontSize !== null && titleFontSize < TITLE_FONT_WARN_PX) {
		const onTimeline = Math.round(titleFontSize * TIMELINE_SCALE);
		const level = onTimeline <= 8 ? "bad" : "warn";
		return {
			level,
			reason: `タイムラインで小さい — 1 行を短くする（${onTimeline}px）`,
		};
	}
	return { level: "ok", reason: "タイムラインで読める" };
}

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

const SLOT_LABEL: Record<TitleSlot, string> = {
	bl: "S1 左下",
	br: "S2 右下",
	tl: "S3 左上",
	center: "S4 中央",
	rcol: "S5 右コラム",
	topwide: "S6 横長",
};

const NUMBER_LABEL: Record<Fields["numberTreatment"], string> = {
	corner: "N1 Corner",
	vertical: "N2 Vertical",
	written: "N3 Written",
	plate: "N4 Plate",
	watermark: "N5 Watermark",
};

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
