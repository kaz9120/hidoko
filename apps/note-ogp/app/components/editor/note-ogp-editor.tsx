import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { SiteFooter } from "~/components/layout/site-footer";
import { SiteHeader } from "~/components/layout/site-header";
import { useNoteOgpState } from "~/hooks/use-note-ogp-state";
import { buildFileName, downloadPng } from "~/lib/download-png";
import { TEMPLATES } from "~/lib/og-templates";
import { ControlPanel } from "./control-panel";
import { Stage } from "./stage";

export function NoteOgpEditor() {
	const { state, update, reset } = useNoteOgpState();
	const frameRef = useRef<HTMLDivElement | null>(null);
	const [busy, setBusy] = useState(false);

	const tpl = TEMPLATES.find((t) => t.id === state.templateId) ?? TEMPLATES[0];

	const handleDownload = useCallback(async () => {
		if (!frameRef.current || busy) return;
		setBusy(true);
		try {
			const fileName = buildFileName(state.title, state.issue);
			await downloadPng(frameRef.current, fileName);
			toast.success("PNG をダウンロードしました", { description: fileName });
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			toast.error("書き出しに失敗しました", { description: message });
		} finally {
			setBusy(false);
		}
	}, [busy, state.title, state.issue]);

	return (
		<div className="flex min-h-screen flex-col bg-background md:h-screen">
			<SiteHeader />
			<div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(0,1fr)_420px]">
				<Stage tpl={tpl} fields={state} frameRef={frameRef} />
				<ControlPanel
					state={state}
					update={update}
					reset={reset}
					tpl={tpl}
					onDownload={handleDownload}
					busy={busy}
				/>
			</div>
			<SiteFooter />
		</div>
	);
}
