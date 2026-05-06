import { useState } from "react";
import { AspectToolbar } from "~/components/layout/aspect-toolbar";
import { EditorCanvas } from "~/components/layout/editor-canvas";
import { ExportSidebar } from "~/components/layout/export-sidebar";
import { InputSidebar } from "~/components/layout/input-sidebar";
import { type MobileTabId, MobileTabs } from "~/components/layout/mobile-tabs";
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
	const [activeTab, setActiveTab] = useState<MobileTabId>("editor");

	return (
		<SnapcropProvider>
			<div className="flex h-screen flex-col">
				<SiteHeader />
				<div className="flex flex-1 overflow-hidden">
					<InputSidebar mobileVisible={activeTab === "input"} />
					<main
						className={`${activeTab === "editor" ? "flex" : "hidden"} flex-1 flex-col overflow-hidden md:flex`}
					>
						<EditorCanvas />
						<AspectToolbar />
					</main>
					<ExportSidebar mobileVisible={activeTab === "export"} />
				</div>
				<MobileTabs active={activeTab} onChange={setActiveTab} />
			</div>
		</SnapcropProvider>
	);
}
