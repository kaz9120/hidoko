import type { CSSProperties } from "react";
import { spacingPx, subPx, titlePx } from "./expression";
import {
	AutoFitTitle,
	Brand,
	FRAME_BASE,
	Kicker,
	M,
	markUrlFor,
	PhotoPlaceholder,
	PhotoVignette,
	paletteForSelection,
	rgbaFromHex,
	styleFrom,
	TextureLayer,
	titleFamily,
	UI_JP,
	UI_LATIN,
} from "./helpers";
import { focalObjectPosition, photoFilterCss } from "./photo";
import { renderTitleLines } from "./title-decoration";
import type { Fields } from "./types";

// ─────────────────────────────────────────────────────────
// 01 Edition — 写真なし。マストヘッド＋大きな号数＋大見出し
// ─────────────────────────────────────────────────────────
export function TplEdition({ f }: { f: Fields }) {
	const { t, ft } = styleFrom(f);
	const issue = String(f.issue || "001").padStart(3, "0");
	const markUrl = markUrlFor(f.theme);
	// 余白プリセットは外余白系（左右マージン・マストヘッド・フッター）だけに
	// 効かせる。タイトル帯の top など骨格の絶対座標は動かさない。
	const m = spacingPx(M, f.spacing);
	return (
		<div style={{ ...FRAME_BASE, background: t.bg, color: t.text }}>
			<TextureLayer f={f} />
			{/* マストヘッド：左ブランド／右カテゴリ */}
			<div
				style={{
					position: "absolute",
					top: spacingPx(62, f.spacing),
					left: m,
					right: m,
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
					right: m - 4,
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
			<div style={{ position: "absolute", left: m, top: 232, right: m }}>
				<AutoFitTitle
					lines={renderTitleLines(f.title, f.titleDecoration, t.accent)}
					width={1280 - m * 2}
					maxH={196}
					max={titlePx(104, f.jumpRate)}
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
							fontSize: subPx(27, f.jumpRate),
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
					left: m,
					bottom: spacingPx(56, f.spacing),
					display: "flex",
					alignItems: "baseline",
					gap: 14,
				}}
			>
				<span
					style={{
						fontFamily: UI_JP,
						fontSize: subPx(18, f.jumpRate),
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
							fontSize: subPx(14, f.jumpRate),
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
				style={{
					position: "absolute",
					right: m,
					bottom: spacingPx(58, f.spacing),
					fontSize: 12,
				}}
			>
				{f.date}
			</Kicker>
		</div>
	);
}

// ─────────────────────────────────────────────────────────
// 02 Cover — 写真が主役。配置型（全面 / 片寄せ / 角版）で構図を切り替える
// ─────────────────────────────────────────────────────────
export function TplCover({ f }: { f: Fields }) {
	if (f.photoLayout === "edge") return <CoverEdge f={f} />;
	if (f.photoLayout === "kakuhan") return <CoverKakuhan f={f} />;
	return <CoverFull f={f} />;
}

// 全面（現行）— フルブリード。文字色トグル＋保護方式（スクリム / 帯 /
// ボックス / 全面オーバーレイ）で可読性確保
function CoverFull({ f }: { f: Fields }) {
	const { ft } = styleFrom(f);
	const pal = paletteForSelection(f.palette, f.photoPalettes);
	const issue = String(f.issue || "001").padStart(3, "0");
	const hasImg = !!f.image;
	const darkText = f.coverText === "dark"; // 明るい画像向け
	const m = spacingPx(M, f.spacing);

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

	// テキスト保護方式。帯・ボックスは下段の背面に面が立つので
	// 文字ハロ（textShadow）を消し、スクリム・全面オーバーレイでは残す。
	const guard = f.textGuard;
	const onPanel = guard === "band" || guard === "box";
	const textShadow = onPanel ? undefined : shadow;
	// ボックスは左右に内側余白（40px）を取るぶんタイトル幅が縮む
	const BOX_PAD_X = 40;
	const contentW =
		guard === "box" ? 1280 - m * 2 - BOX_PAD_X * 2 : 1280 - m * 2;
	const bottomStyle: CSSProperties =
		guard === "band"
			? {
					// 帯はキャンバスの三辺（左右・下）まで届かせ、完全な不透明にする
					// —『デザインのミカタ』の「半透明の帯・中途半端な長さ」の禁則
					position: "absolute",
					left: 0,
					right: 0,
					bottom: 0,
					background: scrim,
					padding: `40px ${m}px ${spacingPx(56, f.spacing)}px`,
				}
			: guard === "box"
				? {
						position: "absolute",
						left: m,
						right: m,
						bottom: spacingPx(56, f.spacing),
						background: rgbaFromHex(scrim, 0.86),
						padding: `34px ${BOX_PAD_X}px 38px`,
					}
				: {
						position: "absolute",
						left: m,
						right: m,
						bottom: spacingPx(64, f.spacing),
					};

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
						objectPosition: focalObjectPosition(f.focalPoint),
						filter: photoFilterCss(f.photoFilter),
					}}
				/>
			) : (
				<PhotoPlaceholder
					roles={darkText ? pal.light : pal.dark}
					label="表紙写真を追加"
				/>
			)}
			{hasImg && <PhotoVignette filter={f.photoFilter} />}

			{/* 全面オーバーレイ：写真全体にテーマの base 色を薄く重ねて沈める */}
			{guard === "overlay" && (
				<div
					style={{
						position: "absolute",
						inset: 0,
						background: rgbaFromHex(scrim, 0.5),
					}}
				/>
			)}

			{/* 上スクリムはマストヘッド用。方式によらず共通で敷く */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					background: topScrim,
					height: 170,
				}}
			/>
			{guard === "scrim" && (
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
			)}

			{/* マストヘッド */}
			<div
				style={{
					position: "absolute",
					top: spacingPx(58, f.spacing),
					left: m,
					right: m,
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

			{/* タイトル（下段）— 保護方式によって背面（帯 / ボックス）が変わる */}
			<div style={bottomStyle}>
				<Kicker
					color={kicker}
					style={{
						display: "inline-flex",
						alignItems: "center",
						gap: 12,
						textShadow,
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
					lines={renderTitleLines(f.title, f.titleDecoration, kicker)}
					width={contentW}
					maxH={208}
					max={titlePx(100, f.jumpRate)}
					min={28}
					style={{
						marginTop: 18,
						fontFamily: titleFamily(ft),
						fontWeight: ft.titleWeight,
						lineHeight: ft.titleLeading - 0.06,
						letterSpacing: ft.titleTrack,
						color: ink,
						textShadow,
					}}
				/>
				{f.lead && (
					<div
						style={{
							marginTop: 16,
							maxWidth: 800,
							fontFamily: UI_JP,
							fontSize: subPx(22, f.jumpRate),
							lineHeight: 1.6,
							fontWeight: 400,
							color: ink,
							opacity: 0.9,
							whiteSpace: "pre-wrap",
							textShadow,
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
							fontSize: subPx(17, f.jumpRate),
							fontWeight: 700,
							color: ink,
							textShadow,
						}}
					>
						{f.author}
					</span>
					{f.account && (
						<span
							style={{
								fontFamily: UI_LATIN,
								fontSize: subPx(14, f.jumpRate),
								color: sub,
								textShadow,
							}}
						>
							{f.account}
						</span>
					)}
					<span style={{ flex: 1 }} />
					<Kicker color={sub} style={{ fontSize: 12, textShadow }}>
						{f.date}
					</Kicker>
				</div>
			</div>
		</div>
	);
}

// 片寄せ — 写真を片側 2/3 に三方裁ち落とし、反対側はテーマの base 色面。
// テキスト面は写真と干渉しないので、可読性が写真に依存しない。
function CoverEdge({ f }: { f: Fields }) {
	const { t, ft } = styleFrom(f);
	const pal = paletteForSelection(f.palette, f.photoPalettes);
	const issue = String(f.issue || "001").padStart(3, "0");
	const markUrl = markUrlFor(f.theme);
	const mirror = !!f.photoMirror;
	const photoW = 768; // 写真 60% / テキスト面 40%
	const panelW = 1280 - photoW;
	const PAD_X = spacingPx(60, f.spacing);

	return (
		<div style={{ ...FRAME_BASE, background: t.bg, color: t.text }}>
			<TextureLayer f={f} />
			{/* 写真（上下と外側の三辺を裁ち落とし） */}
			<div
				style={{
					position: "absolute",
					top: 0,
					bottom: 0,
					width: photoW,
					...(mirror ? { right: 0 } : { left: 0 }),
					overflow: "hidden",
				}}
			>
				{f.image ? (
					<img
						src={f.image}
						alt=""
						crossOrigin="anonymous"
						style={{
							width: "100%",
							height: "100%",
							objectFit: "cover",
							objectPosition: focalObjectPosition(f.focalPoint),
							filter: photoFilterCss(f.photoFilter),
						}}
					/>
				) : (
					<PhotoPlaceholder roles={pal[f.theme]} label="表紙写真を追加" />
				)}
				{f.image && <PhotoVignette filter={f.photoFilter} />}
			</div>

			{/* テキスト面（base 色） */}
			<div
				style={{
					position: "absolute",
					top: 0,
					bottom: 0,
					width: panelW,
					...(mirror ? { left: 0 } : { right: 0 }),
					display: "flex",
					flexDirection: "column",
					padding: `${spacingPx(54, f.spacing)}px ${PAD_X}px ${spacingPx(50, f.spacing)}px`,
				}}
			>
				<Brand
					color={t.muted}
					text={f.brand}
					showMark={f.showMark !== false}
					markUrl={markUrl}
					size={15}
					markSize={21}
				/>

				<div
					style={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
					}}
				>
					<Kicker
						color={t.accent}
						style={{ display: "inline-flex", alignItems: "center", gap: 12 }}
					>
						<span
							style={{
								width: 22,
								height: 1,
								background: t.accent,
								display: "inline-block",
							}}
						/>
						{f.category || "ESSAY"}&nbsp;&nbsp;·&nbsp;&nbsp;Vol.{issue}
					</Kicker>
					<AutoFitTitle
						lines={renderTitleLines(f.title, f.titleDecoration, t.accent)}
						width={panelW - PAD_X * 2}
						maxH={300}
						max={titlePx(58, f.jumpRate)}
						min={24}
						style={{
							marginTop: 22,
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
								marginTop: 18,
								fontFamily: UI_JP,
								fontSize: subPx(19, f.jumpRate),
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

				<div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
					<span
						style={{
							fontFamily: UI_JP,
							fontSize: subPx(16, f.jumpRate),
							fontWeight: 700,
							color: t.text,
						}}
					>
						{f.author}
						{f.account && (
							<span
								style={{
									fontFamily: UI_LATIN,
									fontSize: subPx(13, f.jumpRate),
									fontWeight: 400,
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
		</div>
	);
}

// 角版 — 写真を四周の地余白で囲む（額縁効果）。下に見出しと脚注。
function CoverKakuhan({ f }: { f: Fields }) {
	const { t, ft } = styleFrom(f);
	const pal = paletteForSelection(f.palette, f.photoPalettes);
	const issue = String(f.issue || "001").padStart(3, "0");
	const markUrl = markUrlFor(f.theme);
	// 角版は縦に密な構図（写真 110-424 / タイトル 458- / フッター）なので、
	// 縦方向はマストヘッドだけ動かし、フッターの bottom は固定のまま。
	// 余白の印象は左右の地余白（額縁の幅）で出す。
	const m = spacingPx(M, f.spacing);

	return (
		<div style={{ ...FRAME_BASE, background: t.bg, color: t.text }}>
			<TextureLayer f={f} />
			{/* マストヘッド：左ブランド／右カテゴリ・号数 */}
			<div
				style={{
					position: "absolute",
					top: spacingPx(52, f.spacing),
					left: m,
					right: m,
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<Brand
					color={t.muted}
					text={f.brand}
					showMark={f.showMark !== false}
					markUrl={markUrl}
					size={15}
					markSize={21}
				/>
				<Kicker color={t.muted}>
					{f.category || "ESSAY"}&nbsp;&nbsp;·&nbsp;&nbsp;Vol.{issue}
				</Kicker>
			</div>

			{/* 角版写真（四周に地余白） */}
			<div
				style={{
					position: "absolute",
					top: 110,
					left: m,
					right: m,
					height: 314,
					overflow: "hidden",
				}}
			>
				{f.image ? (
					<img
						src={f.image}
						alt=""
						crossOrigin="anonymous"
						style={{
							width: "100%",
							height: "100%",
							objectFit: "cover",
							objectPosition: focalObjectPosition(f.focalPoint),
							filter: photoFilterCss(f.photoFilter),
						}}
					/>
				) : (
					<PhotoPlaceholder roles={pal[f.theme]} label="表紙写真を追加" />
				)}
				{f.image && <PhotoVignette filter={f.photoFilter} />}
			</div>

			{/* タイトル＋リード */}
			<div style={{ position: "absolute", left: m, right: m, top: 458 }}>
				<AutoFitTitle
					lines={renderTitleLines(f.title, f.titleDecoration, t.accent)}
					width={1280 - m * 2}
					maxH={96}
					max={titlePx(52, f.jumpRate)}
					min={24}
					style={{
						fontFamily: titleFamily(ft),
						fontWeight: ft.titleWeight,
						lineHeight: ft.titleLeading - 0.08,
						letterSpacing: ft.titleTrack,
						color: t.text,
					}}
				/>
				{f.lead && (
					<div
						style={{
							marginTop: 12,
							maxWidth: 760,
							fontFamily: UI_JP,
							fontSize: subPx(19, f.jumpRate),
							lineHeight: 1.6,
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
					left: m,
					bottom: 48,
					display: "flex",
					alignItems: "baseline",
					gap: 13,
				}}
			>
				<span
					style={{
						fontFamily: UI_JP,
						fontSize: subPx(16, f.jumpRate),
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
							fontSize: subPx(13, f.jumpRate),
							color: t.faint,
							letterSpacing: "0.01em",
						}}
					>
						{f.account}
					</span>
				)}
			</div>
			<Kicker
				color={t.faint}
				style={{ position: "absolute", right: m, bottom: 50, fontSize: 11 }}
			>
				{f.date}
			</Kicker>
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
	// Quiet の外余白は左右の内側パディング（基準 150px）で出す。
	// 上下のパディングはマストヘッド・フッターの逃しなので据え置き。
	const padX = spacingPx(150, f.spacing);
	return (
		<div style={{ ...FRAME_BASE, background: t.bg, color: t.text }}>
			<TextureLayer f={f} />
			{/* マストヘッド（中央・ブランド） */}
			<div
				style={{
					position: "absolute",
					top: spacingPx(56, f.spacing),
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
					padding: `108px ${padX}px 124px`,
				}}
			>
				{hasImg && f.image && (
					<div
						style={{
							position: "relative",
							width: 320,
							height: 196,
							marginBottom: 30,
							overflow: "hidden",
						}}
					>
						<img
							src={f.image}
							alt=""
							crossOrigin="anonymous"
							style={{
								width: "100%",
								height: "100%",
								objectFit: "cover",
								objectPosition: focalObjectPosition(f.focalPoint),
								// Quiet の素の状態はわずかに彩度を落とすのが既定
								filter: photoFilterCss(f.photoFilter) ?? "saturate(0.96)",
							}}
						/>
						<PhotoVignette filter={f.photoFilter} />
					</div>
				)}
				<Kicker color={t.accent} style={{ marginBottom: 22 }}>
					{f.category || "ESSAY"}&nbsp;&nbsp;·&nbsp;&nbsp;Vol.{issue}
				</Kicker>
				<AutoFitTitle
					lines={renderTitleLines(f.title, f.titleDecoration, t.accent)}
					width={1280 - padX * 2}
					maxH={236}
					max={titlePx(hasImg ? 62 : 78, f.jumpRate)}
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
							fontSize: subPx(23, f.jumpRate),
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
					bottom: spacingPx(52, f.spacing),
					left: 0,
					right: 0,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 9,
				}}
			>
				<span
					style={{
						fontFamily: UI_JP,
						fontSize: subPx(15, f.jumpRate),
						color: t.text,
					}}
				>
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
