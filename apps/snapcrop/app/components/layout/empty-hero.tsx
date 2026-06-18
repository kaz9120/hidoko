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
 * ショートカット案内、ドラッグ＆ドロップ案内、powered by 表記をまとめる。
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
		<section className="relative flex flex-1 items-center justify-center overflow-hidden p-5">
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

				<div className="grid grid-cols-[auto_auto] items-center gap-x-3 gap-y-2 text-sm">
					<KbdGroup className="justify-self-end">
						{captureKeys.map((key) => (
							<Kbd key={key}>{key}</Kbd>
						))}
					</KbdGroup>
					<span className="justify-self-start text-muted-foreground">
						で画面をキャプチャ
					</span>
					<KbdGroup className="justify-self-end">
						{pasteKeys.map((key) => (
							<Kbd key={key}>{key}</Kbd>
						))}
					</KbdGroup>
					<span className="justify-self-start text-muted-foreground">
						でここに貼り付け
					</span>
				</div>

				<p
					className={`flex items-center gap-2 text-sm transition-colors ${
						isDragging ? "text-primary" : "text-muted-foreground"
					}`}
				>
					<ImageIcon aria-hidden="true" size={16} strokeWidth={1.75} />
					{isDragging
						? "ここにドロップして取り込み"
						: "画像ファイルのドラッグ＆ドロップにも対応"}
				</p>

				<a
					className="absolute bottom-4 text-muted-foreground text-xs transition-colors hover:text-primary"
					href={X_PROFILE_URL}
					rel="noreferrer"
					target="_blank"
				>
					powered by @kyamamoto9120
				</a>
			</div>
		</section>
	);
}
