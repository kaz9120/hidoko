export type BioKind = "role" | "comm" | "fact" | "hobby";

export type BioPart = {
	kind: BioKind;
	icon: BioIconName;
	text: string;
	tag?: string;
};

export type BioIconName =
	| "briefcase"
	| "megaphone"
	| "users"
	| "trophy"
	| "crown"
	| "tent"
	| "gamepad-2"
	| "plane"
	| "puzzle"
	| "heart";

export type Profile = {
	name: string;
	nameRoman: string;
	org: string;
	catch: string;
	bioParts: BioPart[];
};

export const PROFILE: Profile = {
	name: "山本 一将",
	nameRoman: "Yamamoto Kazumasa",
	org: "MOSH 株式会社 / Engineering Manager",
	catch: "焚き火を愛するエンジニア。",
	bioParts: [
		{
			kind: "role",
			icon: "briefcase",
			text: "MOSH 株式会社 Engineering Manager",
		},
		{
			kind: "comm",
			icon: "megaphone",
			text: "LINE API Platform Evangelist",
			tag: "#LINEDC",
		},
		{ kind: "comm", icon: "users", text: "EM Oasis 運営", tag: "#emoasis" },
		{
			kind: "fact",
			icon: "trophy",
			text: "2015年 世界コンピュータ将棋選手権 9位",
		},
		{ kind: "hobby", icon: "heart", text: "ヤクルトスワローズ" },
		{ kind: "hobby", icon: "crown", text: "将棋" },
		{ kind: "hobby", icon: "tent", text: "キャンプ" },
		{ kind: "hobby", icon: "gamepad-2", text: "DQW" },
		{ kind: "hobby", icon: "plane", text: "旅行" },
		{ kind: "hobby", icon: "puzzle", text: "謎解き" },
	],
};

export const X_PROFILE_URL = "https://x.com/kyamamoto9120";
export const X_HANDLE = "@kyamamoto9120";
