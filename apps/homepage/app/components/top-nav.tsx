import { SendIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { HidokoMark } from "~/components/hidoko-mark";
import { X_PROFILE_URL } from "~/data/profile";

const NAV_ITEMS = [
	{ href: "#about", label: "About" },
	{ href: "#tools", label: "Tools" },
] as const;

export function TopNav() {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 24);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<nav className={`ykz-nav ${scrolled ? "is-scrolled" : ""}`}>
			<a className="ykz-nav__logo" href="#top">
				<HidokoMark size={26} />
				<span className="ykz-nav__logo-text hi-mono">y-kaz.com</span>
			</a>
			<div className="ykz-nav__items">
				{NAV_ITEMS.map((item) => (
					<a key={item.href} href={item.href} className="ykz-nav__item">
						{item.label}
					</a>
				))}
			</div>
			<div className="ykz-nav__cta">
				<a
					className="ykz-nav__contact"
					href={X_PROFILE_URL}
					target="_blank"
					rel="noreferrer"
				>
					<SendIcon className="hi-icon-sm" aria-hidden="true" />
					<span>X DM</span>
				</a>
			</div>
		</nav>
	);
}
