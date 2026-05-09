import { ArrowUpRightIcon } from "lucide-react";

import { TOOLS } from "~/data/tools";

export function Tools() {
	return (
		<div className="ykz-tools">
			{TOOLS.map((tool) => (
				<a
					key={tool.id}
					className={`ykz-tool ${tool.accent ? "ykz-tool--accent" : ""}`}
					href={tool.href}
					target="_blank"
					rel="noreferrer"
				>
					<div className="ykz-tool__head">
						<h3 className="ykz-tool__name">{tool.name}</h3>
						<span className="ykz-tool__url hi-mono">
							{tool.href.replace(/^https?:\/\//, "").replace(/\/$/, "")}
							<ArrowUpRightIcon className="hi-icon-sm" aria-hidden="true" />
						</span>
					</div>
					<p className="ykz-tool__desc">{tool.desc}</p>
					<div className="ykz-tool__tags">
						{tool.tags.map((tag) => (
							<span key={tag} className="hi-tag">
								{tag}
							</span>
						))}
					</div>
				</a>
			))}
		</div>
	);
}
