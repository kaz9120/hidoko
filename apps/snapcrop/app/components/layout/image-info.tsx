import { useSnapcrop } from "~/contexts/snapcrop-context";
import { formatBytes, formatMimeType } from "~/lib/format";

export function ImageInfo() {
	const { image } = useSnapcrop();

	const dimensions = image ? `${image.width} × ${image.height}` : "—";
	const fileSize = image ? formatBytes(image.fileSize) : "—";
	const format = image ? formatMimeType(image.format) : "—";

	return (
		<div className="p-5">
			<h2 className="mb-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
				画像情報
			</h2>
			<dl className="flex flex-col gap-2 text-sm">
				<InfoRow label="サイズ:" value={dimensions} />
				<InfoRow label="ファイルサイズ:" value={fileSize} />
				<InfoRow label="形式:" value={format} />
			</dl>
		</div>
	);
}

function InfoRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-baseline justify-between gap-4">
			<dt className="text-muted-foreground">{label}</dt>
			<dd className="font-mono text-foreground/80">{value}</dd>
		</div>
	);
}
