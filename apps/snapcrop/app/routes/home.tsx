import { AspectToolbar } from "~/components/layout/aspect-toolbar";
import { EditorCanvas } from "~/components/layout/editor-canvas";
import { ExportSidebar } from "~/components/layout/export-sidebar";
import { InputSidebar } from "~/components/layout/input-sidebar";
import { MobileTabs } from "~/components/layout/mobile-tabs";
import { SiteHeader } from "~/components/layout/site-header";

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
	return (
		<div className="flex h-screen flex-col">
			<SiteHeader />
			<div className="flex flex-1 overflow-hidden">
				<InputSidebar />
				<main className="flex flex-1 flex-col overflow-hidden">
					<EditorCanvas />
					<AspectToolbar />
				</main>
				<ExportSidebar />
			</div>
			<MobileTabs />
		</div>
	);
}
