import { MonitorIcon } from "lucide-react";
import logoCreamUrl from "takibi-design-system/assets/logo/mark-cream.svg?url";
import logoDarkUrl from "takibi-design-system/assets/logo/mark-dark.svg?url";
import { useEmbers } from "~/lib/use-embers";

const X_PROFILE_URL = "https://x.com/kyamamoto9120";

/**
 * 画像未ロード時に editor 全面へ出すヒーロー。ロゴ + キャッチコピー +
 * ユースケース + スクショ撮影への導線 + created by 表記をまとめる。
 *
 * 主役は「スクリーンショットを撮る」体験。⌘V のショートカット表記は
 * 習熟ユーザー向けでノイズになるためファーストビューには出さず、
 * ヘルプダイアログで確認できるようにしている。
 *
 * ドロップの実体 (document レベルの drop 監視) は useFileDrop 側にあり、
 * ここは isDragging を受けて点線枠と案内文を反応させるだけ。
 */
export function EmptyHero({ isDragging }: { isDragging: boolean }) {
	useEmbers();
	return (
		<section className="snapcrop-hero-glow relative flex flex-1 items-center justify-center overflow-hidden p-5">
			<takibi-embers density={28} wind="0" glow="off" />
			<div
				className={`absolute inset-5 flex flex-col items-center justify-center gap-8 rounded-xl border-2 border-dashed px-6 text-center transition-colors ${
					isDragging ? "border-brand bg-brand/10" : "border-line"
				}`}
			>
				<div className="flex flex-col items-center gap-3">
					{/* 夜と昼でロゴを替える。data-theme を CSS で見るので、描く前に当てたテーマとずれない */}
					<img
						alt=""
						aria-hidden="true"
						className="size-16 light:hidden"
						src={logoDarkUrl}
					/>
					<img
						alt=""
						aria-hidden="true"
						className="hidden size-16 light:block"
						src={logoCreamUrl}
					/>
					<h2 className="font-bold text-2xl text-fg tracking-tight">
						撮って、書いて、すぐ共有
					</h2>
					{/* 見出しと併走するユースケース。snapcrop の典型動作と使い道を
					    1 行で示す。「便利」のような評価語を避け、動詞で「何が起きるか」を出す。 */}
					<p className="text-fg-muted text-sm">
						矢印を 1 本足したスクショを、そのまま Slack へ
					</p>
				</div>

				<div className="flex flex-col items-center gap-2">
					{/* 主役: スクリーンショットを起点にした最初の一歩。MonitorIcon で
					    「画面を撮る」体験を示し、isDragging で D&D 受け入れに切り替える。 */}
					<p
						className={`flex items-center gap-2 text-base transition-colors sm:text-lg ${
							isDragging ? "text-brand" : "text-fg"
						}`}
					>
						<MonitorIcon aria-hidden="true" size={20} strokeWidth={1.75} />
						{isDragging
							? "ここにドロップして取り込み"
							: "画面を撮って、ここに貼る"}
					</p>
					{/* 補助: ファイル D&D も受け入れていることを小さく伝える。
					    ショートカット表記 (⌘V) はヘルプダイアログに分離。 */}
					<p className="text-fg-muted text-xs">
						ファイルのドラッグ&ドロップも対応
					</p>
				</div>

				<a
					className="absolute bottom-4 text-fg-muted text-xs transition-colors hover:text-brand"
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
