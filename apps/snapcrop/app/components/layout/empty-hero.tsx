import { ImageIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import logoCreamUrl from "ui/assets/logo/mark-cream.svg?url";
import logoDarkUrl from "ui/assets/logo/mark-dark.svg?url";
import { Kbd, KbdGroup } from "ui/components/kbd";
import { isApplePlatform } from "~/lib/platform";
import { useEmbers } from "~/lib/use-embers";

const X_PROFILE_URL = "https://x.com/kyamamoto9120";

/**
 * 画像未ロード時に editor 全面へ出すヒーロー。ロゴ + 1 行コピー、主要
 * ショートカット案内、ドラッグ＆ドロップ案内、created by 表記をまとめる。
 *
 * ドロップの実体 (document レベルの drop 監視) は useFileDrop 側にあり、
 * ここは isDragging を受けて点線枠と案内文を反応させるだけ。
 */
export function EmptyHero({ isDragging }: { isDragging: boolean }) {
	useEmbers();
	const { resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// hydration 前は dark 想定で描画。tokens.css は dark が初期状態。
	const logoUrl =
		mounted && resolvedTheme === "light" ? logoCreamUrl : logoDarkUrl;

	// prerender との hydration mismatch を避けるため、mounted までは
	// 既存 UI のデフォルトに合わせて ⌘ 表記で描画する。
	const apple = mounted ? isApplePlatform() : true;
	const captureKeys = apple ? ["⌘", "⇧", "4"] : ["Win", "Shift", "S"];
	const pasteKeys = apple ? ["⌘", "V"] : ["Ctrl", "V"];

	return (
		<section className="snapcrop-hero-glow relative flex flex-1 items-center justify-center overflow-hidden p-5">
			<hi-embers density={28} wind="0" glow="off" />
			<div
				className={`absolute inset-5 flex flex-col items-center justify-center gap-8 rounded-xl border-2 border-dashed px-6 text-center transition-colors ${
					isDragging ? "border-primary bg-primary/10" : "border-border"
				}`}
			>
				<div className="flex flex-col items-center gap-4">
					<img alt="" aria-hidden="true" className="size-16" src={logoUrl} />
					<h2 className="font-bold text-2xl text-foreground tracking-tight">
						撮ってすぐ、書き込んで、共有まで
					</h2>
				</div>

				<div className="flex flex-col items-center gap-3">
					{/* 主役: D&D を最初の一歩として点線枠と一致した文言で見せる。
					    isDragging で色とコピーを切り替えて受け入れ状態を強調する。 */}
					<p
						className={`flex items-center gap-2 text-base transition-colors sm:text-lg ${
							isDragging ? "text-primary" : "text-foreground"
						}`}
					>
						<ImageIcon aria-hidden="true" size={20} strokeWidth={1.75} />
						{isDragging ? "ここにドロップして取り込み" : "ここに画像をドラッグ"}
					</p>
					{/* 補助: ⌘V と ⌘⇧4 (Win: Ctrl+V / Win+Shift+S) を 1 行に圧縮。
					    KbdGroup を inline で並べて補助情報の密度を緩める。 */}
					<p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-muted-foreground text-xs">
						<span className="inline-flex items-center gap-1.5">
							または
							<KbdGroup>
								{pasteKeys.map((key) => (
									<Kbd key={key}>{key}</Kbd>
								))}
							</KbdGroup>
							で貼り付け
						</span>
						<span className="inline-flex items-center gap-1.5">
							<KbdGroup>
								{captureKeys.map((key) => (
									<Kbd key={key}>{key}</Kbd>
								))}
							</KbdGroup>
							でキャプチャ
						</span>
					</p>
				</div>

				<a
					className="absolute bottom-4 text-muted-foreground text-xs transition-colors hover:text-primary"
					href={X_PROFILE_URL}
					rel="noreferrer"
					target="_blank"
				>
					created by 焚き火を愛するエンジニア
				</a>
			</div>
		</section>
	);
}
