type Props = {
	message?: string;
};

export function EmptyState({ message = "準備中" }: Props) {
	return (
		<div className="rounded-lg border border-dashed border-line-subtle px-8 py-12 text-center">
			<p className="m-0 text-sm text-fg-subtle">{message}</p>
		</div>
	);
}
