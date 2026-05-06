import { useState } from "react";
import { AspectToolbar } from "~/components/layout/aspect-toolbar";
import { EditorCanvas } from "~/components/layout/editor-canvas";
import { ExportSidebar } from "~/components/layout/export-sidebar";
import { InputSidebar } from "~/components/layout/input-sidebar";
import { SiteHeader } from "~/components/layout/site-header";
import { SnapcropProvider } from "~/contexts/snapcrop-context";

export function meta() {
	return [
		{ title: "snapcrop" },
		{
			name: "description",
			content:
				"画面キャプチャから画像の切り抜きまで、ブラウザひとつで完結する画像エディタ",
		},
	];
}

export default function Home() {
	// モバイルでのみ意味のある state。md 以上では SidebarShell が常時 aside を
	// 表示するので open フラグは無視される。Sheet を閉じる責務はサイドバー側
	// (input/export sidebar) が onOpenChange と各アクション完了時に持つ。
	const [inputOpen, setInputOpen] = useState(false);
	const [exportOpen, setExportOpen] = useState(false);

	return (
		<SnapcropProvider>
			<div className="flex h-screen flex-col">
				<SiteHeader
					onOpenExportSidebar={() => setExportOpen(true)}
					onOpenInputSidebar={() => setInputOpen(true)}
				/>
				<div className="flex flex-1 overflow-hidden">
					<InputSidebar onOpenChange={setInputOpen} open={inputOpen} />
					<main className="flex flex-1 flex-col overflow-hidden">
						<EditorCanvas />
						<AspectToolbar />
					</main>
					<ExportSidebar onOpenChange={setExportOpen} open={exportOpen} />
				</div>
			</div>
		</SnapcropProvider>
	);
}
