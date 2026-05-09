import type { ReactNode } from "react";

type Props = {
	id: string;
	eyebrow?: string;
	title: string;
	lede?: string;
	children: ReactNode;
	more?: ReactNode;
};

export function Section({ id, eyebrow, title, lede, children, more }: Props) {
	return (
		<section
			id={id}
			className="relative border-t border-border-subtle px-[var(--ykz-pad)] py-[clamp(72px,9vh,112px)]"
		>
			<div className="relative mx-auto max-w-[1080px]">
				<header className="mb-12 flex max-w-[720px] flex-col gap-2">
					{eyebrow && (
						<span className="mb-1 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
							{eyebrow}
						</span>
					)}
					<h2 className="m-0 text-[clamp(28px,3vw,38px)] font-semibold leading-[1.2] tracking-[-0.02em] text-text-strong">
						{title}
					</h2>
					{lede && (
						<p className="mt-1.5 text-[15px] leading-[1.7] text-muted-foreground">
							{lede}
						</p>
					)}
				</header>
				<div>{children}</div>
				{more && (
					<div className="mt-8 flex flex-wrap justify-end gap-7">{more}</div>
				)}
			</div>
		</section>
	);
}
