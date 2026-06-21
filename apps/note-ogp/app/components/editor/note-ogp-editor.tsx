import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { SiteFooter } from "~/components/layout/site-footer";
import { SiteHeader } from "~/components/layout/site-header";
import { StatusBar } from "~/components/layout/status-bar";
import {
	ProfileDialog,
	type ProfileValues,
} from "~/components/profile/profile-dialog";
import { useNoteOgpState } from "~/hooks/use-note-ogp-state";
import { buildFileName, downloadPng } from "~/lib/download-png";
import {
	isProfileBootstrapped,
	markProfileBootstrapped,
} from "~/lib/profile-storage";
import {
	loadSidebarCollapsed,
	saveSidebarCollapsed,
} from "~/lib/ui-state-storage";
import { ControlPanel } from "./control-panel";
import { Stage } from "./stage";

export function NoteOgpEditor() {
	const { state, update, reset, recordExport, lastSavedAt } = useNoteOgpState();
	const frameRef = useRef<HTMLDivElement | null>(null);
	const [busy, setBusy] = useState(false);
	// Stage から通知される表示倍率と AutoFitTitle の確定フォントサイズ。
	// StatusBar に集約して出すための受け皿。
	const [stageScale, setStageScale] = useState(0.5);
	const [titleFontSize, setTitleFontSize] = useState<number | null>(null);
	// プロフィール編集ダイアログの開閉 (Issue #135)。`intro` が立っているときは
	// 初回起動の文言を出す。チップから開いた時は intro = false。
	const [profileDialogOpen, setProfileDialogOpen] = useState(false);
	const [profileDialogIntro, setProfileDialogIntro] = useState(false);
	// サイドパネル折りたたみ (Issue #138)。初回マウント後に localStorage から復元、
	// ⌘\ で開閉、ステージ右端のハンドルでも開閉できる。
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

	// 初回マウントでプロフィール未確定なら、ダイアログを開いて intro を出す。
	useEffect(() => {
		if (!isProfileBootstrapped()) {
			setProfileDialogIntro(true);
			setProfileDialogOpen(true);
		}
		setSidebarCollapsed(loadSidebarCollapsed());
	}, []);

	useEffect(() => {
		saveSidebarCollapsed(sidebarCollapsed);
	}, [sidebarCollapsed]);

	// ⌘\ または Ctrl+\ で開閉。フォーム要素にフォーカスがあるときは無視する。
	useEffect(() => {
		const onKey = (event: KeyboardEvent) => {
			if (!(event.metaKey || event.ctrlKey)) return;
			if (event.key !== "\\") return;
			const target = event.target;
			if (
				target instanceof HTMLElement &&
				(target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.isContentEditable)
			) {
				return;
			}
			event.preventDefault();
			setSidebarCollapsed((c) => !c);
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, []);

	const handleDownload = useCallback(async () => {
		if (!frameRef.current || busy) return;
		setBusy(true);
		try {
			const fileName = buildFileName(state.title, state.issue);
			await downloadPng(frameRef.current, fileName);
			recordExport(state.issue);
			toast.success("PNG をダウンロードしました", { description: fileName });
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			toast.error("書き出しに失敗しました", { description: message });
		} finally {
			setBusy(false);
		}
	}, [busy, state.title, state.issue, recordExport]);

	const handleProfileChipClick = () => {
		setProfileDialogIntro(false);
		setProfileDialogOpen(true);
	};

	const handleProfileSave = (values: ProfileValues) => {
		update(values);
		markProfileBootstrapped();
		setProfileDialogOpen(false);
	};

	const handleProfileCancel = () => {
		markProfileBootstrapped();
		setProfileDialogOpen(false);
	};

	const profileValues: ProfileValues = {
		brand: state.brand,
		author: state.author,
		account: state.account,
		showMark: state.showMark,
	};

	return (
		<div className="flex min-h-screen flex-col bg-bg md:h-screen">
			<SiteHeader
				profile={{ brand: state.brand, author: state.author }}
				onProfileClick={handleProfileChipClick}
			/>
			<div
				className={`grid min-h-0 flex-1 grid-cols-1 ${
					sidebarCollapsed
						? "md:grid-cols-[minmax(0,1fr)]"
						: "md:grid-cols-[minmax(0,1fr)_440px]"
				}`}
			>
				<div className="relative flex min-h-0 flex-col">
					<Stage
						fields={state}
						frameRef={frameRef}
						onScaleChange={setStageScale}
						onTitleFontSizeChange={setTitleFontSize}
					/>
					<button
						type="button"
						onClick={() => setSidebarCollapsed((c) => !c)}
						className="absolute top-1/2 right-0 z-10 hidden h-12 w-3.5 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-border bg-bg-raised text-text-muted shadow-sm transition-colors hover:border-primary/40 hover:text-text md:flex"
						aria-label={
							sidebarCollapsed ? "サイドパネルを開く" : "サイドパネルを閉じる"
						}
						title={`${sidebarCollapsed ? "開く" : "閉じる"} (⌘\\)`}
					>
						{sidebarCollapsed ? (
							<ChevronLeftIcon
								aria-hidden="true"
								className="size-3"
								strokeWidth={1.75}
							/>
						) : (
							<ChevronRightIcon
								aria-hidden="true"
								className="size-3"
								strokeWidth={1.75}
							/>
						)}
					</button>
				</div>
				{!sidebarCollapsed && (
					<ControlPanel
						state={state}
						update={update}
						reset={reset}
						onDownload={handleDownload}
						busy={busy}
					/>
				)}
			</div>
			<StatusBar
				fields={state}
				scale={stageScale}
				titleFontSize={titleFontSize}
				lastSavedAt={lastSavedAt}
				sidebarCollapsed={sidebarCollapsed}
			/>
			<SiteFooter />
			<ProfileDialog
				open={profileDialogOpen}
				initialValues={profileValues}
				intro={profileDialogIntro}
				onSave={handleProfileSave}
				onCancel={handleProfileCancel}
			/>
		</div>
	);
}
