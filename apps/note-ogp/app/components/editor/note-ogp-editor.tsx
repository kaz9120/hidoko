import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
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
		<div className="grid h-screen grid-cols-[1fr_420px] bg-background">
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
	);
}
