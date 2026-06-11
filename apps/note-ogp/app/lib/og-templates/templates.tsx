import {
	AutoFitTitle,
	Brand,
	FRAME_BASE,
	Kicker,
	M,
	markUrlFor,
	PhotoPlaceholder,
	paletteById,
	renderLines,
	rgbaFromHex,
	styleFrom,
	titleFamily,
	UI_JP,
	UI_LATIN,
} from "./helpers";
import { mixHex, resolveOgTheme } from "./palettes";
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
	const pal = paletteById(f.palette);
	const issue = String(f.issue || "001").padStart(3, "0");
	const hasImg = !!f.image;
	const darkText = f.coverText === "dark"; // 明るい画像向け

	// 文字色とスクリム。暗い文字 = 明るい画像想定なのでライト面のロール、
	// 明るい文字 = 暗い画像想定なのでダーク面のロールを使う。
	const inkRoles = darkText ? pal.light : pal.dark;
	const ink = inkRoles.sub;
	const sub = rgbaFromHex(ink, darkText ? 0.66 : 0.74);
	const kicker = inkRoles.accent;
	// スクリムと文字ハロは「文字と逆の明るさ」= inkRoles.base で敷く
	const scrim = inkRoles.base;
	const shadow = darkText
		? `0 1px 10px ${rgbaFromHex(scrim, 0.55)}`
		: `0 2px 16px ${rgbaFromHex(scrim, 0.5)}`;
	// 下スクリム（どんな画像でも下段が読めるよう、高め＆強め）
	const bottomScrim = darkText
		? `linear-gradient(0deg, ${rgbaFromHex(scrim, 0.94)} 0%, ${rgbaFromHex(scrim, 0.86)} 16%, ${rgbaFromHex(scrim, 0.45)} 38%, ${rgbaFromHex(scrim, 0)} 56%)`
		: `linear-gradient(0deg, ${rgbaFromHex(scrim, 0.92)} 0%, ${rgbaFromHex(scrim, 0.8)} 16%, ${rgbaFromHex(scrim, 0.42)} 38%, ${rgbaFromHex(scrim, 0)} 56%)`;
	const topScrim = darkText
		? `linear-gradient(180deg, ${rgbaFromHex(scrim, 0.85)} 0%, ${rgbaFromHex(scrim, 0)} 100%)`
		: `linear-gradient(180deg, ${rgbaFromHex(scrim, 0.6)} 0%, ${rgbaFromHex(scrim, 0)} 100%)`;

	// 文字色が暗い = 明るい背景想定 → cream マーク。snapcrop と同じ規則
	const markUrl = markUrlFor(darkText ? "light" : "dark");

	return (
		<div style={{ ...FRAME_BASE, background: pal.dark.base, color: ink }}>
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
				<PhotoPlaceholder
					roles={darkText ? pal.light : pal.dark}
					label="表紙写真を追加"
				/>
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

// ─────────────────────────────────────────────────────────
// 04 Frame — 全面写真の中央に枠ボックス。視線が枠内に集中する。
//   写真がないときは反対面（光⇄闇）の色面にして、枠が浮く構図を保つ。
// ─────────────────────────────────────────────────────────
export function TplFrame({ f }: { f: Fields }) {
	const { t, ft } = styleFrom(f);
	const pal = paletteById(f.palette);
	const issue = String(f.issue || "001").padStart(3, "0");
	const hasImg = !!f.image;
	const markUrl = markUrlFor(f.theme);
	// 写真なしの色面はテーマと逆の面を使う（ライト→闇の面、ダーク→光の面）
	const opp = f.theme === "light" ? pal.dark : pal.light;
	return (
		<div style={{ ...FRAME_BASE, background: t.bg, color: t.text }}>
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
				<div
					style={{
						position: "absolute",
						inset: 0,
						background: `linear-gradient(160deg, ${mixHex(opp.sub, opp.base, 0.08)} 0%, ${opp.base} 72%)`,
					}}
				/>
			)}

			{/* 中央の枠ボックス（不透明・細罫） */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<div
					style={{
						width: 880,
						background: rgbaFromHex(t.bg, 0.96),
						border: `1px solid ${t.ruleStrong}`,
						boxShadow: hasImg
							? `0 28px 80px ${rgbaFromHex(pal.dark.base, 0.4)}`
							: "none",
						padding: "44px 56px 36px",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						textAlign: "center",
					}}
				>
					<Brand
						color={t.muted}
						text={f.brand}
						showMark={f.showMark !== false}
						markUrl={markUrl}
						size={14}
						markSize={20}
						center
					/>
					<Kicker color={t.accent} style={{ marginTop: 22 }}>
						{f.category || "ESSAY"}&nbsp;&nbsp;·&nbsp;&nbsp;Vol.{issue}
					</Kicker>
					<AutoFitTitle
						lines={renderLines(f.title)}
						width={880 - 56 * 2}
						maxH={156}
						max={62}
						min={24}
						style={{
							marginTop: 16,
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
								marginTop: 14,
								maxWidth: 620,
								fontFamily: UI_JP,
								fontSize: 19,
								lineHeight: 1.7,
								fontWeight: 400,
								color: t.muted,
								whiteSpace: "pre-wrap",
							}}
						>
							{f.lead}
						</div>
					)}
					{/* 枠内フッター：細罫で区切って著者と日付 */}
					<div
						style={{
							marginTop: 26,
							paddingTop: 18,
							borderTop: `1px solid ${t.rule}`,
							width: "100%",
							display: "flex",
							alignItems: "baseline",
						}}
					>
						<span
							style={{
								fontFamily: UI_JP,
								fontSize: 16,
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
									fontSize: 13,
									color: t.faint,
									marginLeft: 12,
								}}
							>
								{f.account}
							</span>
						)}
						<span style={{ flex: 1 }} />
						<Kicker color={t.faint} style={{ fontSize: 11 }}>
							{f.date}
						</Kicker>
					</div>
				</div>
			</div>
		</div>
	);
}

// ─────────────────────────────────────────────────────────
// 05 Split — 上 2/3 を写真または色面、下 1/3 を濃色の情報バンドに分割。
//   バンドは常にパレットの闇面ベース。重要情報がコントラストで浮く。
// ─────────────────────────────────────────────────────────
const SPLIT_BAND_H = 224;

export function TplSplit({ f }: { f: Fields }) {
	const { t, ft } = styleFrom(f);
	const pal = paletteById(f.palette);
	const issue = String(f.issue || "001").padStart(3, "0");
	const hasImg = !!f.image;
	// バンドは闇面の 6 トークンで塗る。ダークテーマでは背景と見分くため少し持ち上げる
	const band = resolveOgTheme(pal.dark, "dark");
	const bandBg =
		f.theme === "light"
			? pal.dark.base
			: mixHex(pal.dark.sub, pal.dark.base, 0.07);
	// 上段のブランド表記：写真の上は明文字（上端スクリム併用）、色面の上はテーマ準拠
	const topInk = hasImg ? pal.dark.sub : t.text;
	const markUrl = hasImg ? markUrlFor("dark") : markUrlFor(f.theme);
	return (
		<div style={{ ...FRAME_BASE, background: t.bg, color: band.text }}>
			{/* 上段：写真 or 色面 */}
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					height: 670 - SPLIT_BAND_H,
					overflow: "hidden",
				}}
			>
				{hasImg && f.image ? (
					<img
						src={f.image}
						alt=""
						crossOrigin="anonymous"
						style={{ width: "100%", height: "100%", objectFit: "cover" }}
					/>
				) : (
					<div
						style={{
							position: "absolute",
							inset: 0,
							background: `linear-gradient(160deg, ${mixHex(t.text, t.bg, 0.07)} 0%, ${t.bg} 72%)`,
						}}
					/>
				)}
				{hasImg && (
					<div
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							height: 150,
							background: `linear-gradient(180deg, ${rgbaFromHex(pal.dark.base, 0.6)} 0%, ${rgbaFromHex(pal.dark.base, 0)} 100%)`,
						}}
					/>
				)}
				<div style={{ position: "absolute", top: 54, left: M }}>
					<Brand
						color={topInk}
						text={f.brand}
						showMark={f.showMark !== false}
						markUrl={markUrl}
						size={15}
						markSize={21}
					/>
				</div>
			</div>

			{/* 下段：濃色の情報バンド */}
			<div
				style={{
					position: "absolute",
					left: 0,
					right: 0,
					bottom: 0,
					height: SPLIT_BAND_H,
					background: bandBg,
					borderTop: `2px solid ${band.accent}`,
					padding: `26px ${M}px 30px`,
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					overflow: "hidden",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "baseline",
						justifyContent: "space-between",
					}}
				>
					<Kicker color={band.accent}>
						{f.category || "ESSAY"}&nbsp;&nbsp;·&nbsp;&nbsp;Vol.{issue}
					</Kicker>
					<Kicker color={band.faint} style={{ fontSize: 12 }}>
						{f.date}
					</Kicker>
				</div>
				<div>
					<AutoFitTitle
						lines={renderLines(f.title)}
						width={1280 - M * 2}
						maxH={f.lead ? 60 : 92}
						max={f.lead ? 48 : 58}
						min={24}
						style={{
							fontFamily: titleFamily(ft),
							fontWeight: ft.titleWeight,
							lineHeight: ft.titleLeading - 0.1,
							letterSpacing: ft.titleTrack,
							color: band.text,
						}}
					/>
					{f.lead && (
						<div
							style={{
								marginTop: 10,
								maxWidth: 900,
								fontFamily: UI_JP,
								fontSize: 17,
								lineHeight: 1.55,
								fontWeight: 400,
								color: band.muted,
								whiteSpace: "pre-wrap",
							}}
						>
							{f.lead}
						</div>
					)}
				</div>
				<div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
					<span
						style={{
							fontFamily: UI_JP,
							fontSize: 16,
							fontWeight: 700,
							color: band.text,
						}}
					>
						{f.author}
					</span>
					{f.account && (
						<span
							style={{
								fontFamily: UI_LATIN,
								fontSize: 13,
								color: band.faint,
							}}
						>
							{f.account}
						</span>
					)}
				</div>
			</div>
		</div>
	);
}

// ─────────────────────────────────────────────────────────
// 06 Tate — タイトルを縦書き（vertical-rl）にした和モダン構図。
//   右にタイトルの段、左下に情報ブロック。明朝と好相性。
// ─────────────────────────────────────────────────────────
export function TplTate({ f }: { f: Fields }) {
	const { t, ft } = styleFrom(f);
	const issue = String(f.issue || "001").padStart(3, "0");
	const markUrl = markUrlFor(f.theme);
	return (
		<div style={{ ...FRAME_BASE, background: t.bg, color: t.text }}>
			{/* 右端の界線（掛け軸の趣） */}
			<div
				style={{
					position: "absolute",
					top: 70,
					bottom: 70,
					right: 54,
					width: 1,
					background: t.ruleStrong,
				}}
			/>

			{/* タイトル（縦書き・右から左へ段を組む。高さ基準でフィット） */}
			<AutoFitTitle
				vertical
				lines={renderLines(f.title)}
				width={560}
				maxH={476}
				max={84}
				min={36}
				style={{
					position: "absolute",
					top: 84,
					right: 86,
					fontFamily: titleFamily(ft),
					fontWeight: ft.titleWeight,
					lineHeight: ft.titleLeading,
					letterSpacing: ft.titleTrack,
					color: t.text,
				}}
			/>

			{/* 落款風の差し色（タイトル段の下） */}
			<div
				style={{
					position: "absolute",
					right: 86,
					bottom: 70,
					width: 13,
					height: 13,
					background: t.accent,
				}}
			/>

			{/* 左上：ブランド */}
			<div style={{ position: "absolute", top: 62, left: M }}>
				<Brand
					color={t.muted}
					text={f.brand}
					showMark={f.showMark !== false}
					markUrl={markUrl}
					size={15}
					markSize={21}
				/>
			</div>

			{/* 左下：情報ブロック */}
			<div
				style={{
					position: "absolute",
					left: M,
					bottom: 56,
					display: "flex",
					flexDirection: "column",
					alignItems: "flex-start",
					gap: 13,
				}}
			>
				<Kicker color={t.accent}>
					{f.category || "ESSAY"}&nbsp;&nbsp;·&nbsp;&nbsp;Vol.{issue}
				</Kicker>
				{f.lead && (
					<div
						style={{
							maxWidth: 420,
							fontFamily: UI_JP,
							fontSize: 19,
							lineHeight: 1.75,
							fontWeight: 400,
							color: t.muted,
							whiteSpace: "pre-wrap",
						}}
					>
						{f.lead}
					</div>
				)}
				<span style={{ display: "flex", alignItems: "baseline", gap: 11 }}>
					<span
						style={{
							fontFamily: UI_JP,
							fontSize: 17,
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
								fontSize: 13,
								color: t.faint,
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
