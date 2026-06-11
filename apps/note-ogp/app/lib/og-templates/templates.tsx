import {
	AutoFitTitle,
	Brand,
	FRAME_BASE,
	Kicker,
	M,
	markUrlFor,
	PhotoPlaceholder,
	renderLines,
	styleFrom,
	titleFamily,
	UI_JP,
	UI_LATIN,
} from "./helpers";
import type { Fields } from "./types";

// ─────────────────────────────────────────────────────────
// 01 Edition — 写真なし。マストヘッド＋大きな号数＋大見出し
// ─────────────────────────────────────────────────────────
export function TplEdition({ f }: { f: Fields }) {
	const { t, ft } = styleFrom(f);
	const issue = String(f.issue || "001").padStart(3, "0");
	const markUrl = markUrlFor(f.theme);
	return (
		<div style={{ ...FRAME_BASE, background: t.bg, color: t.text }}>
			{/* マストヘッド：左ブランド／右カテゴリ */}
			<div
				style={{
					position: "absolute",
					top: 62,
					left: M,
					right: M,
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<Brand
					color={t.text}
					text={f.brand}
					showMark={f.showMark !== false}
					markUrl={markUrl}
				/>
				<Kicker color={t.muted}>{f.category || "ESSAY"}</Kicker>
			</div>

			{/* 大きな号数（右下の図像）— 号数はここだけ */}
			<div
				style={{
					position: "absolute",
					right: M - 4,
					bottom: 150,
					fontFamily: UI_LATIN,
					fontSize: 150,
					lineHeight: 0.78,
					fontWeight: 800,
					color: t.accent,
					letterSpacing: "-0.03em",
					textAlign: "right",
				}}
			>
				{issue}
				<span
					style={{
						display: "block",
						fontFamily: UI_LATIN,
						fontSize: 13,
						fontWeight: 600,
						letterSpacing: "0.22em",
						textTransform: "uppercase",
						color: t.faint,
						marginTop: 14,
					}}
				>
					Vol.
				</span>
			</div>

			{/* タイトル */}
			<div style={{ position: "absolute", left: M, top: 232, right: M }}>
				<AutoFitTitle
					lines={renderLines(f.title)}
					width={1280 - M * 2}
					maxH={196}
					max={104}
					min={28}
					style={{
						fontFamily: titleFamily(ft),
						fontWeight: ft.titleWeight,
						lineHeight: ft.titleLeading,
						letterSpacing: ft.titleTrack,
						color: t.text,
					}}
				/>
				{f.lead && (
					<div
						style={{
							marginTop: 22,
							maxWidth: 660,
							fontFamily: UI_JP,
							fontSize: 27,
							lineHeight: 1.7,
							fontWeight: 400,
							color: t.muted,
							whiteSpace: "pre-wrap",
						}}
					>
						{f.lead}
					</div>
				)}
			</div>

			{/* フッター：左に著者、右下に日付 */}
			<div
				style={{
					position: "absolute",
					left: M,
					bottom: 56,
					display: "flex",
					alignItems: "baseline",
					gap: 14,
				}}
			>
				<span
					style={{
						fontFamily: UI_JP,
						fontSize: 18,
						fontWeight: 700,
						color: t.text,
					}}
				>
					{f.author}
				</span>
				{f.account && (
					<span
						style={{
							fontFamily: UI_LATIN,
							fontSize: 14,
							color: t.faint,
							letterSpacing: "0.01em",
						}}
					>
						{f.account}
					</span>
				)}
			</div>
			<Kicker
				color={t.muted}
				style={{ position: "absolute", right: M, bottom: 58, fontSize: 12 }}
			>
				{f.date}
			</Kicker>
		</div>
	);
}

// ─────────────────────────────────────────────────────────
// 02 Cover — 写真フルブリード。文字色トグル＋強スクリムで可読性確保
// ─────────────────────────────────────────────────────────
export function TplCover({ f }: { f: Fields }) {
	const { ft } = styleFrom(f);
	const issue = String(f.issue || "001").padStart(3, "0");
	const hasImg = !!f.image;
	const darkText = f.coverText === "dark"; // 明るい画像向け

	// 文字色とスクリム
	const ink = darkText ? "#1b1610" : "#fff8ee";
	const sub = darkText ? "rgba(27,22,16,0.66)" : "rgba(255,248,238,0.74)";
	const kicker = darkText ? "#a23a14" : "#f8a05c";
	const shadow = darkText
		? "0 1px 10px rgba(255,250,242,0.55)"
		: "0 2px 16px rgba(0,0,0,0.5)";
	// 下スクリム（どんな画像でも下段が読めるよう、高め＆強め）
	const bottomScrim = darkText
		? "linear-gradient(0deg, rgba(247,242,232,0.94) 0%, rgba(247,242,232,0.86) 16%, rgba(247,242,232,0.45) 38%, rgba(247,242,232,0) 56%)"
		: "linear-gradient(0deg, rgba(8,6,4,0.92) 0%, rgba(8,6,4,0.80) 16%, rgba(8,6,4,0.42) 38%, rgba(8,6,4,0) 56%)";
	const topScrim = darkText
		? "linear-gradient(180deg, rgba(247,242,232,0.85) 0%, rgba(247,242,232,0) 100%)"
		: "linear-gradient(180deg, rgba(8,6,4,0.6) 0%, rgba(8,6,4,0) 100%)";

	// 文字色が暗い = 明るい背景想定 → cream マーク。snapcrop と同じ規則
	const markUrl = markUrlFor(darkText ? "light" : "dark");

	return (
		<div style={{ ...FRAME_BASE, background: "#13100c", color: ink }}>
			{hasImg && f.image ? (
				<img
					src={f.image}
					alt=""
					crossOrigin="anonymous"
					style={{
						position: "absolute",
						inset: 0,
						width: "100%",
						height: "100%",
						objectFit: "cover",
					}}
				/>
			) : (
				<PhotoPlaceholder dark={!darkText} label="表紙写真を追加" />
			)}

			<div
				style={{
					position: "absolute",
					inset: 0,
					background: topScrim,
					height: 170,
				}}
			/>
			<div
				style={{
					position: "absolute",
					left: 0,
					right: 0,
					bottom: 0,
					height: "62%",
					background: bottomScrim,
				}}
			/>

			{/* マストヘッド */}
			<div
				style={{
					position: "absolute",
					top: 58,
					left: M,
					right: M,
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<Brand
					color={ink}
					text={f.brand}
					showMark={f.showMark !== false}
					markUrl={markUrl}
					size={16}
				/>
				<Kicker color={sub} style={{ textShadow: shadow }}>
					Vol.{issue}
				</Kicker>
			</div>

			{/* タイトル（下段） */}
			<div style={{ position: "absolute", left: M, right: M, bottom: 64 }}>
				<Kicker
					color={kicker}
					style={{
						display: "inline-flex",
						alignItems: "center",
						gap: 12,
						textShadow: shadow,
					}}
				>
					<span
						style={{
							width: 22,
							height: 1,
							background: kicker,
							display: "inline-block",
						}}
					/>
					{f.category || "ESSAY"}
				</Kicker>
				<AutoFitTitle
					lines={renderLines(f.title)}
					width={1280 - M * 2}
					maxH={208}
					max={100}
					min={28}
					style={{
						marginTop: 18,
						fontFamily: titleFamily(ft),
						fontWeight: ft.titleWeight,
						lineHeight: ft.titleLeading - 0.06,
						letterSpacing: ft.titleTrack,
						color: ink,
						textShadow: shadow,
					}}
				/>
				{f.lead && (
					<div
						style={{
							marginTop: 16,
							maxWidth: 800,
							fontFamily: UI_JP,
							fontSize: 22,
							lineHeight: 1.6,
							fontWeight: 400,
							color: ink,
							opacity: 0.9,
							whiteSpace: "pre-wrap",
							textShadow: shadow,
						}}
					>
						{f.lead}
					</div>
				)}
				<div
					style={{
						marginTop: 24,
						display: "flex",
						alignItems: "baseline",
						gap: 13,
					}}
				>
					<span
						style={{
							fontFamily: UI_JP,
							fontSize: 17,
							fontWeight: 700,
							color: ink,
							textShadow: shadow,
						}}
					>
						{f.author}
					</span>
					{f.account && (
						<span
							style={{
								fontFamily: UI_LATIN,
								fontSize: 14,
								color: sub,
								textShadow: shadow,
							}}
						>
							{f.account}
						</span>
					)}
					<span style={{ flex: 1 }} />
					<Kicker color={sub} style={{ fontSize: 12, textShadow: shadow }}>
						{f.date}
					</Kicker>
				</div>
			</div>
		</div>
	);
}

// ─────────────────────────────────────────────────────────
// 03 Quiet — 余白多めの和モダン。明朝が映える。
// ─────────────────────────────────────────────────────────
export function TplQuiet({ f }: { f: Fields }) {
	const { t, ft } = styleFrom(f);
	const issue = String(f.issue || "001").padStart(3, "0");
	const hasImg = !!f.image;
	const markUrl = markUrlFor(f.theme);
	return (
		<div style={{ ...FRAME_BASE, background: t.bg, color: t.text }}>
			{/* マストヘッド（中央・ブランド） */}
			<div
				style={{
					position: "absolute",
					top: 56,
					left: 0,
					right: 0,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<Brand
					color={t.muted}
					text={f.brand}
					showMark={f.showMark !== false}
					markUrl={markUrl}
					size={16}
					markSize={22}
				/>
			</div>

			{/* 中央：本体（上下にたっぷり余白を取って中央揃え） */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					textAlign: "center",
					padding: "108px 150px 124px",
				}}
			>
				{hasImg && f.image && (
					<img
						src={f.image}
						alt=""
						crossOrigin="anonymous"
						style={{
							width: 320,
							height: 196,
							objectFit: "cover",
							marginBottom: 30,
							filter: "saturate(0.96)",
						}}
					/>
				)}
				<Kicker color={t.accent} style={{ marginBottom: 22 }}>
					{f.category || "ESSAY"}&nbsp;&nbsp;·&nbsp;&nbsp;Vol.{issue}
				</Kicker>
				<AutoFitTitle
					lines={renderLines(f.title)}
					width={1280 - 150 * 2}
					maxH={236}
					max={hasImg ? 62 : 78}
					min={26}
					style={{
						fontFamily: titleFamily(ft),
						fontWeight: ft.titleWeight,
						lineHeight: ft.titleLeading,
						letterSpacing: ft.titleTrack,
						color: t.text,
						textAlign: "center",
					}}
				/>
				{f.lead && (
					<div
						style={{
							marginTop: 20,
							maxWidth: 580,
							fontFamily: UI_JP,
							fontSize: 23,
							lineHeight: 1.75,
							fontWeight: 400,
							color: t.muted,
							whiteSpace: "pre-wrap",
						}}
					>
						{f.lead}
					</div>
				)}
			</div>

			{/* 下：著者・日付（段組み・余白め） */}
			<div
				style={{
					position: "absolute",
					bottom: 52,
					left: 0,
					right: 0,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 9,
				}}
			>
				<span style={{ fontFamily: UI_JP, fontSize: 15, color: t.text }}>
					<span style={{ fontWeight: 700 }}>{f.author}</span>
					{f.account && (
						<span
							style={{
								fontFamily: UI_LATIN,
								color: t.faint,
								marginLeft: 10,
							}}
						>
							{f.account}
						</span>
					)}
				</span>
				<Kicker color={t.faint} style={{ fontSize: 11 }}>
					{f.date}
				</Kicker>
			</div>
		</div>
	);
}
