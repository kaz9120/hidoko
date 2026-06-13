/**
 * きっちり / 手書きの違いを線そのもので見せるミニアイコン。lucide に
 * 「同じモチーフの直線版 / 揺らぎ版」のペアがないため自前 SVG で描く。
 *
 * 矢印 / 矩形 / マーカー の StrokeStyle トグルで共通利用する。
 */
export function StrokeStyleIcon({ style }: { style: "clean" | "sketchy" }) {
	return (
		<svg
			aria-hidden="true"
			className="size-4"
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeWidth={1.75}
			viewBox="0 0 16 16"
		>
			{style === "clean" ? (
				<path d="M2 8 H14" />
			) : (
				<path d="M2 8.5 C 4 6, 5.5 10.5, 8 8 S 12 6, 14 8.5" />
			)}
		</svg>
	);
}
