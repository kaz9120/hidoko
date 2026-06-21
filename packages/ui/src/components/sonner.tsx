"use client";

import {
	CircleCheckIcon,
	InfoIcon,
	Loader2Icon,
	OctagonXIcon,
	TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme();

	return (
		<Sonner
			theme={theme as ToasterProps["theme"]}
			className="toaster group"
			icons={{
				success: <CircleCheckIcon className="size-4" />,
				info: <InfoIcon className="size-4" />,
				warning: <TriangleAlertIcon className="size-4" />,
				error: <OctagonXIcon className="size-4" />,
				loading: <Loader2Icon className="size-4 animate-spin" />,
			}}
			style={
				{
					"--normal-bg": "var(--bg-raised)",
					"--normal-text": "var(--text)",
					"--normal-border": "var(--border)",
					"--border-radius": "var(--radius-md)",
				} as React.CSSProperties
			}
			{...props}
			toastOptions={{
				...props.toastOptions,
				classNames: {
					toast: "hi-motion-settle",
					...props.toastOptions?.classNames,
				},
				style: {
					boxShadow: "var(--shadow-card)",
					border: "1px solid var(--border)",
					background: "var(--bg-raised)",
					color: "var(--text)",
					borderRadius: "var(--radius-md)",
					padding: "12px 16px",
					fontSize: "var(--text-sm)",
					gap: "10px",
					...props.toastOptions?.style,
				},
			}}
		/>
	);
};

export { Toaster };
