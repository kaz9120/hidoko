import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
	namespace JSX {
		interface IntrinsicElements {
			"hi-embers": DetailedHTMLProps<
				HTMLAttributes<HTMLElement> & {
					density?: number | string;
					wind?: number | string;
					hue?: number | string;
					glow?: "on" | "off";
				},
				HTMLElement
			>;
		}
	}
}
