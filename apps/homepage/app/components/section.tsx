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
		<section id={id} className="ykz-section">
			<div className="ykz-section__inner">
				<header className="ykz-section__head">
					{eyebrow && <span className="ykz-eyebrow">{eyebrow}</span>}
					<h2 className="ykz-section__title">{title}</h2>
					{lede && <p className="ykz-section__lede">{lede}</p>}
				</header>
				<div className="ykz-section__body">{children}</div>
				{more && <div className="ykz-section__more">{more}</div>}
			</div>
		</section>
	);
}
