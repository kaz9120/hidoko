import { useId } from "react";

type Props = {
	size?: number;
	color?: string;
	color2?: string;
	/**
	 * 読み上げ名。省略時は「ふたつの月」。装飾的に置く場合 (ブランド名の
	 * テキストと並ぶ等) は親側で `aria-hidden` を当ててこの SVG を読み上げ
	 * 対象から外す方が自然。
	 */
	label?: string;
};

/**
 * 「ふたりのよてい」のブランドマーク。2 つの三日月が重なり合って 1 つの月の
 * 形をつくる。色は片方が accent (はる)、片方が moon 寄り (けい) のミックス。
 *
 * gradient と `<title>` の id がページ内で衝突しないように useId() で一意化
 * している (複数表示する画面のため)。
 */
export function PairMoon({
	size = 36,
	color = "var(--accent)",
	color2,
	label = "ふたつの月",
}: Props) {
	const id = useId();
	const glowId = `pairmoon-glow-${id}`;
	const titleId = `pairmoon-title-${id}`;
	const c2 = color2 ?? "color-mix(in oklab, var(--accent) 60%, var(--moon))";
	return (
		<svg
			role="img"
			aria-labelledby={titleId}
			width={size}
			height={size}
			viewBox="0 0 48 48"
			fill="none"
		>
			<title id={titleId}>{label}</title>
			<defs>
				<radialGradient id={glowId} cx="50%" cy="50%" r="50%">
					<stop offset="0%" stopColor={color} stopOpacity="0.18" />
					<stop offset="100%" stopColor={color} stopOpacity="0" />
				</radialGradient>
			</defs>
			<circle cx="24" cy="24" r="22" fill={`url(#${glowId})`} />
			<path
				d="M22 8a16 16 0 1 0 0 32 12 12 0 0 1 0-32z"
				fill={color}
				opacity="0.92"
			/>
			<path
				d="M26 8a16 16 0 1 1 0 32 12 12 0 0 0 0-32z"
				fill={c2}
				opacity="0.55"
				style={{ mixBlendMode: "multiply" }}
			/>
		</svg>
	);
}
