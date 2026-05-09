import { ArrowUpRightIcon, XIcon } from "lucide-react";

import { HidokoMark } from "~/components/hidoko-mark";
import { PROFILE, X_HANDLE, X_PROFILE_URL } from "~/data/profile";

export function Footer() {
	return (
		<footer className="ykz-footer">
			<div className="ykz-footer__inner">
				<div className="ykz-footer__brand">
					<HidokoMark size={20} />
					<div>
						<div className="ykz-footer__logo hi-mono">y-kaz.com</div>
						<div className="ykz-footer__catch">
							{PROFILE.name} / {PROFILE.nameRoman}
						</div>
					</div>
				</div>
				<a
					className="ykz-footer__x"
					href={X_PROFILE_URL}
					target="_blank"
					rel="noreferrer"
				>
					<XIcon className="hi-icon-sm" aria-hidden="true" />
					<span>{X_HANDLE}</span>
					<ArrowUpRightIcon className="hi-icon-sm" aria-hidden="true" />
				</a>
				<div className="ykz-footer__meta hi-mono">© 2026 {PROFILE.name}</div>
			</div>
		</footer>
	);
}
