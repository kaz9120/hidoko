type Props = {
	message?: string;
};

export function EmptyState({ message = "準備中" }: Props) {
	return (
		<div className="rounded-lg border border-dashed border-border-subtle px-8 py-12 text-center">
			<p className="m-0 text-sm text-text-faint">{message}</p>
		</div>
	);
}
