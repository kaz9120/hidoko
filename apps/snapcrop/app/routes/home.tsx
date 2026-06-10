import { ArrowToolbar } from "~/components/layout/arrow-toolbar";
import { CropToolbar } from "~/components/layout/crop-toolbar";
import { EditorCanvas } from "~/components/layout/editor-canvas";
import { RectToolbar } from "~/components/layout/rect-toolbar";
import { SiteHeader } from "~/components/layout/site-header";
import { StatusBar } from "~/components/layout/status-bar";
import { TextToolbar } from "~/components/layout/text-toolbar";
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
	return (
		<SnapcropProvider>
			<div className="flex h-screen flex-col">
				<SiteHeader />
				<CropToolbar />
				<RectToolbar />
				<ArrowToolbar />
				<TextToolbar />
				<EditorCanvas />
				<StatusBar />
			</div>
		</SnapcropProvider>
	);
}
