import type { ReactNode } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "ui/components/dialog";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	/** 最終更新日 (例: "2026-06-10") */
	lastUpdated: string;
	children: ReactNode;
};

/**
 * プライバシーポリシー / 利用規約をフッターから開くための Dialog。
 * 単独ページ (`/privacy` / `/terms`) と同じ本文 (Content) を内側に流し込んで、
 * 編集中の画像状態を保ったまま読めるようにする。閲覧専用で編集状態を持たない
 * ので、外タップ / Esc / × でそのまま閉じてよい (HelpDialog と同じ振る舞い)。
 */
export function LegalDialog({
	open,
	onOpenChange,
	title,
	lastUpdated,
	children,
}: Props) {
	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent className="max-h-[85dvh] max-w-2xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription className="font-mono text-[var(--text-faint)] text-xs">
						最終更新日: {lastUpdated}
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-8">{children}</div>
			</DialogContent>
		</Dialog>
	);
}
