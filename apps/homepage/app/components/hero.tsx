import { ArrowDownIcon } from "lucide-react";
import { PROFILE } from "~/data/profile";
import { useEmbers } from "~/lib/use-embers";

export function Hero() {
	useEmbers();

	return (
		<header className="ykz-hero">
			<hi-embers className="ykz-hero__embers" density={36} wind="0.04" />
			<div className="ykz-hero__inner">
				<div className="ykz-hero__name-roman hi-mono">
					{PROFILE.nameRoman.toUpperCase()}
				</div>
				<h1 className="ykz-hero__h1">
					<span className="ykz-hero__name">{PROFILE.name}</span>
					<span className="ykz-hero__catch">{PROFILE.catch}</span>
				</h1>
				<p className="ykz-hero__role">{PROFILE.org}</p>
				<p className="ykz-hero__lede">
					登壇資料・記事・自作ツールを、ここに置いています。
				</p>
				<div className="ykz-hero__cta">
					<a className="hi-link" href="#about">
						自己紹介
						<ArrowDownIcon className="hi-icon-sm" aria-hidden="true" />
					</a>
				</div>
			</div>
		</header>
	);
}
