import { cn } from "ui/lib/utils";

// 火床のハート形フィールド（142x142、142 circles）。
// 親要素の color を currentColor で拾うので、color で色を切り替えられる。
// design 側 `designs/logo-mark.svg` と同じデータ。
const CIRCLES: Array<[cx: number, cy: number, r: number, opacity: number]> = [
	[26, 26, 3.37, 0.33],
	[44, 26, 4.41, 0.43],
	[98, 26, 4.41, 0.43],
	[116, 26, 3.37, 0.33],
	[8, 44, 3.04, 0.3],
	[26, 44, 4.59, 0.45],
	[44, 44, 5.92, 0.58],
	[62, 44, 6.78, 0.67],
	[80, 44, 6.78, 0.67],
	[98, 44, 5.92, 0.58],
	[116, 44, 4.59, 0.45],
	[134, 44, 3.04, 0.3],
	[8, 62, 3.66, 0.36],
	[26, 62, 5.41, 0.53],
	[44, 62, 7.08, 0.7],
	[62, 62, 8.45, 0.83],
	[80, 62, 8.45, 0.83],
	[98, 62, 7.08, 0.7],
	[116, 62, 5.41, 0.53],
	[134, 62, 3.66, 0.36],
	[26, 80, 5.62, 0.55],
	[44, 80, 7.42, 0.73],
	[62, 80, 9.19, 0.9],
	[80, 80, 9.19, 0.9],
	[98, 80, 7.42, 0.73],
	[116, 80, 5.62, 0.55],
	[26, 98, 5.14, 0.5],
	[44, 98, 6.68, 0.66],
	[62, 98, 7.81, 0.77],
	[80, 98, 7.81, 0.77],
	[98, 98, 6.68, 0.66],
	[116, 98, 5.14, 0.5],
	[44, 116, 5.34, 0.52],
	[62, 116, 6.08, 0.6],
	[80, 116, 6.08, 0.6],
	[98, 116, 5.34, 0.52],
	[62, 134, 4.3, 0.42],
	[80, 134, 4.3, 0.42],
];

interface LogoMarkProps {
	size?: number;
	className?: string;
	title?: string;
}

export function LogoMark({ size = 28, className, title }: LogoMarkProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 142 142"
			className={cn("block text-[var(--accent)]", className)}
			role={title ? "img" : "presentation"}
			aria-label={title}
			aria-hidden={title ? undefined : true}
		>
			{title ? <title>{title}</title> : null}
			{CIRCLES.map(([cx, cy, r, opacity]) => (
				<circle
					// circles の座標自体が安定キー
					key={`${cx}-${cy}`}
					cx={cx}
					cy={cy}
					r={r}
					fill="currentColor"
					opacity={opacity}
				/>
			))}
		</svg>
	);
}
