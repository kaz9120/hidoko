import { ME, PARTNER } from "~/lib/data/sample";
import type { Whose } from "~/lib/types";
import { Avatar } from "./Avatar";

type Props = {
	whose: Whose;
};

/**
 * 予定の主体が誰かを 1 つのチップで示す。
 *   - self / partner はアバター 1 つ
 *   - both は「は + け」を並べた幅広チップ
 *   - 上記以外の自由ラベルはテキストでフォールバック
 */
export function WhoseChip({ whose }: Props) {
	if (whose === "self") return <Avatar user={ME} size={18} />;
	if (whose === "partner") return <Avatar user={PARTNER} size={18} />;
	if (whose === "both") {
		return (
			<span className="inline-flex h-[18px] items-center gap-[3px] rounded-sm border border-border bg-bg-overlay px-1.5">
				<span className="font-semibold text-[9px]" style={{ color: ME.tone }}>
					{ME.initial}
				</span>
				<span className="text-[9px] text-text-faint">＋</span>
				<span
					className="font-semibold text-[9px]"
					style={{ color: PARTNER.tone }}
				>
					{PARTNER.initial}
				</span>
			</span>
		);
	}
	return (
		<span className="px-1 text-[10px] text-text-faint">{String(whose)}</span>
	);
}
