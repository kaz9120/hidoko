// 後続 PR で D1 + LIFF 認証経由のフェッチに差し替える前提のサンプルデータ。
// 「今日」は 2026-05-18 (月) 固定。共働き・子なしの夫婦を想定。

import type { DayStatus, Schedule, StatusItem, User } from "../types";

/**
 * プロトタイプから引き継ぐ「今日」の固定日付。
 *
 * **Why:** 表示が日替わりで変わると、レビュー時にスクリーンショットと
 * 比較しづらい。後続 PR で API を生やしたら、サーバ時刻を信頼するため
 * この定数は撤去する。
 */
export const TODAY = new Date(2026, 4, 18);

/** 月始まり・日本語表記の曜日一覧（getDay() のインデックス順）。 */
export const WEEKDAYS_JP = ["日", "月", "火", "水", "木", "金", "土"] as const;

/** WeekdayDefaults / dayStatus のキーに使う英語短縮形（getDay() のインデックス順）。 */
export const WEEKDAYS_KEY = [
	"sun",
	"mon",
	"tue",
	"wed",
	"thu",
	"fri",
	"sat",
] as const;

export const ME: User = {
	id: "u_me",
	name: "はる",
	initial: "は",
	tone: "#f47d3a",
};

export const PARTNER: User = {
	id: "u_partner",
	name: "けい",
	initial: "け",
	tone: "#c8d4e0",
};

export const STATUS_ITEMS: StatusItem[] = [
	{
		id: "work-h",
		name: "夫の勤務",
		emoji: "👔",
		color: "#f47d3a",
		assignee: "partner",
		options: [
			{ id: "office", label: "出社", emoji: "🏢" },
			{ id: "remote", label: "リモート", emoji: "🏠" },
			{ id: "off", label: "休日", emoji: "🌙" },
		],
		weekdayDefaults: {
			mon: "office",
			tue: "remote",
			wed: "office",
			thu: "remote",
			fri: "remote",
			sat: "off",
			sun: "off",
		},
	},
	{
		id: "work-w",
		name: "妻の勤務",
		emoji: "💻",
		color: "#c8d4e0",
		assignee: "me",
		options: [
			{ id: "office", label: "出社", emoji: "🏢" },
			{ id: "remote", label: "リモート", emoji: "🏠" },
			{ id: "off", label: "休日", emoji: "🌙" },
		],
		weekdayDefaults: {
			mon: "remote",
			tue: "remote",
			wed: "office",
			thu: "remote",
			fri: "office",
			sat: "off",
			sun: "off",
		},
	},
	{
		id: "bento",
		name: "弁当",
		emoji: "🍱",
		color: "#7a8c5e",
		assignee: "me",
		options: [
			{ id: "yes", label: "必要", emoji: "🍱" },
			{ id: "no", label: "不要", emoji: "✕" },
		],
		weekdayDefaults: {
			mon: "yes",
			tue: "no",
			wed: "yes",
			thu: "no",
			fri: "no",
			sat: "no",
			sun: "no",
		},
	},
	{
		id: "dinner",
		name: "晩御飯",
		emoji: "🍚",
		color: "#e85d20",
		assignee: "both",
		options: [
			{ id: "home", label: "ふたり家", emoji: "🍚" },
			{ id: "eatout", label: "ふたり外", emoji: "🍻" },
			{ id: "apart", label: "別行動", emoji: "↔︎" },
			{ id: "none", label: "不要", emoji: "✕" },
		],
		weekdayDefaults: {
			mon: "home",
			tue: "home",
			wed: "home",
			thu: "home",
			fri: "home",
			sat: "home",
			sun: "home",
		},
	},
];

/**
 * 日付 → ステータス項目 ID → 確定値。
 * 載っていない (date, item) は推定 (weekdayDefaults 由来) または未回答に
 * フォールバックする。dayStatus() の解決ロジックを参照。
 */
export const DAY_STATUSES: Record<string, Record<string, DayStatus>> = {
	// 先週の金 5/15
	"2026-05-15": {
		"work-h": { option: "remote", confirmed: true },
		"work-w": { option: "office", confirmed: true },
		bento: { option: "no", confirmed: true },
		dinner: { option: "eatout", confirmed: true },
	},
	// 土 5/16
	"2026-05-16": {
		"work-h": { option: "off", confirmed: true },
		"work-w": { option: "off", confirmed: true },
		dinner: { option: "eatout", confirmed: true },
	},
	// 日 5/17
	"2026-05-17": {
		"work-h": { option: "off", confirmed: true },
		"work-w": { option: "off", confirmed: true },
		bento: { option: "no", confirmed: true },
		dinner: { option: "home", confirmed: true },
	},
	// 月 5/18 — 今日。多く確定、晩御飯だけ未確定で推定 home
	"2026-05-18": {
		"work-h": { option: "office", confirmed: true },
		"work-w": { option: "office", confirmed: true },
		bento: { option: "yes", confirmed: true },
	},
	// 火 5/19 — 妻だけ出社確定、他デフォ推定
	"2026-05-19": {
		"work-w": { option: "office", confirmed: true },
	},
	// 水 5/20 — 夫出張で出社確定、晩御飯不要確定、弁当不要確定
	"2026-05-20": {
		"work-h": { option: "office", confirmed: true },
		bento: { option: "no", confirmed: true },
		dinner: { option: "none", confirmed: true },
	},
	// 木 5/21 — 未確定
	"2026-05-21": {},
	// 金 5/22 — 結婚記念日、晩御飯は外食予約済み、他未確定
	"2026-05-22": {
		dinner: { option: "eatout", confirmed: true },
	},
	// 土 5/23
	"2026-05-23": {},
	// 日 5/24
	"2026-05-24": {},
};

export const SCHEDULES: Schedule[] = [
	{
		id: "s1",
		date: "2026-05-15",
		time: "19:30",
		allDay: false,
		endTime: "21:30",
		title: "タイ料理屋 ガパオ",
		whose: "both",
		location: {
			name: "ソイ・ナナ 三軒茶屋",
			address: "世田谷区太子堂2-13",
			mapUrl: "#",
		},
		fromLine: true,
	},
	{
		id: "s2",
		date: "2026-05-15",
		time: "14:00",
		allDay: false,
		endTime: "15:00",
		title: "歯医者",
		whose: "self",
	},
	{
		id: "s3",
		date: "2026-05-16",
		allDay: true,
		title: "実家 (夫)",
		whose: "partner",
		notes: "日帰り",
	},
	{
		id: "s4",
		date: "2026-05-16",
		time: "11:00",
		allDay: false,
		title: "ヨガ",
		whose: "self",
	},
	{
		id: "s5",
		date: "2026-05-17",
		time: "15:00",
		allDay: false,
		title: "カフェで作業",
		whose: "self",
	},
	{
		id: "s6",
		date: "2026-05-18",
		time: "20:00",
		allDay: false,
		endTime: "23:00",
		title: "同僚と飲み",
		whose: "partner",
		location: {
			name: "新橋 駒八",
			address: "港区新橋3-16-3",
			mapUrl: "#",
		},
		notes: "多分帰宅 23時ぐらい",
	},
	{
		id: "s7",
		date: "2026-05-20",
		time: "08:00",
		allDay: false,
		title: "名古屋出張",
		whose: "partner",
		notes: "日帰り",
	},
	{
		id: "s8",
		date: "2026-05-22",
		allDay: true,
		title: "結婚記念日",
		whose: "both",
		anniversary: true,
		notes: "7年目",
	},
	{
		id: "s9",
		date: "2026-05-22",
		time: "19:00",
		allDay: false,
		endTime: "21:30",
		title: "丈子寿司",
		whose: "both",
		location: {
			name: "丈子寿司 三軒茶屋",
			address: "世田谷区太子堂2-13-1",
			mapUrl: "#",
		},
		url: "https://tabelog.com/...",
		notes: "コース ¥18,000/人 予約済み",
		fromLine: true,
	},
	{
		id: "s10",
		date: "2026-05-18",
		time: "12:30",
		allDay: false,
		endTime: "13:30",
		title: "ランチMTG (長谷川)",
		whose: "self",
		location: {
			name: "スタバ ミッドタウン",
			address: "六本木",
		},
		notes: "新規案件のキックオフ",
	},
	{
		id: "s11",
		date: "2026-05-21",
		time: "19:30",
		allDay: false,
		title: "ジム",
		whose: "self",
	},
	{
		id: "s12",
		date: "2026-05-23",
		allDay: true,
		title: "長野へ (1泊)",
		whose: "both",
	},
];
