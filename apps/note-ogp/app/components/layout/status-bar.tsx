import { TriangleAlertIcon } from "lucide-react";
import type { Fields } from "~/lib/og-templates";
import { FRAME_HEIGHT, FRAME_WIDTH } from "~/lib/og-templates";
import {
	getTitleReadability,
	type TitleReadability,
} from "~/lib/title-readability";

/**
 * 画面下端 24px のステータスバー。snapcrop の `status-bar.tsx` と同じ
 * 「下端 24px / `bg-card/50` の地・`text-muted-foreground` の文字色」を踏襲し、
 * note-ogp 用に並び順を組み替えたもの。
 *
 * 左から：出力寸法（1280 × 670 固定）·  表示倍率 %
 * 右から：自動保存時刻 · 可読性インジケータ · タイトル文字数
 *
 * レイアウト名は出さない。タイルが名前を見せていないので、ここで名前を言っても
 * 指す先が無い。可読性はタイムライン実寸での「タイトルが読める大きさか」だけを見る。
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
	const readability = fields.title ? getTitleReadability(titleFontSize) : null;

	return (
		<footer className="flex h-6 shrink-0 items-center gap-3 border-border border-t bg-card/50 px-3 font-mono text-[11px] text-muted-foreground">
			<span className="text-foreground/80">
				{FRAME_WIDTH} × {FRAME_HEIGHT}
			</span>
			<Sep />
			<span>{Math.round(scale * 100)}%</span>

			<span className="ml-auto" />

			<span>{titleLength}文字</span>
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

function ReadabilityChip({ status }: { status: TitleReadability | null }) {
	if (!status) {
		return <span className="text-(--text-faint)">—</span>;
	}
	if (status.level === "ok") {
		return (
			<span className="flex items-center gap-1">
				<span aria-hidden="true" className="text-[var(--moss)]">
					●
				</span>
				<span className="hidden lg:inline">{status.message}</span>
			</span>
		);
	}
	return (
		<span
			className="flex items-center gap-1 text-(--warning)"
			title={status.message}
		>
			<TriangleAlertIcon
				aria-hidden="true"
				className="size-3 flex-shrink-0"
				strokeWidth={1.75}
			/>
			<span className="hidden lg:inline">{status.message}</span>
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
