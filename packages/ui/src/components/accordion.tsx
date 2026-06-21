import { ChevronDownIcon } from "lucide-react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "ui/lib/utils";

function Accordion({
	...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
	return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
	className,
	...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
	return (
		<AccordionPrimitive.Item
			data-slot="accordion-item"
			style={{ borderBottom: "1px solid var(--border-subtle)" }}
			className={cn("last:border-b-0", className)}
			{...props}
		/>
	);
}

function AccordionTrigger({
	className,
	children,
	...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
	return (
		<AccordionPrimitive.Header className="flex">
			<AccordionPrimitive.Trigger
				data-slot="accordion-trigger"
				className={cn("hi-focus-ring", className)}
				style={{
					display: "flex",
					flex: 1,
					alignItems: "center",
					justifyContent: "space-between",
					gap: "var(--space-4)",
					padding: "var(--space-4) 0",
					minHeight: "var(--a11y-target-min)",
					fontSize: "var(--text-sm)",
					fontWeight: 500,
					color: "var(--text-strong)",
					textAlign: "left",
					background: "none",
					border: "none",
					cursor: "pointer",
					borderRadius: "var(--radius-md)",
				}}
				{...props}
			>
				{children}
				<ChevronDownIcon
					style={{
						width: 16,
						height: 16,
						flexShrink: 0,
						color: "var(--text-muted)",
						transition: `transform var(--duration) var(--ease)`,
					}}
					className="[&[data-state=open]_&]:rotate-180 data-[state=open]:rotate-180"
				/>
			</AccordionPrimitive.Trigger>
		</AccordionPrimitive.Header>
	);
}

function AccordionContent({
	className,
	children,
	...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
	return (
		<AccordionPrimitive.Content
			data-slot="accordion-content"
			className="hi-motion-fold"
			{...props}
		>
			<div
				className={cn(className)}
				style={{ paddingBottom: "var(--space-4)" }}
			>
				{children}
			</div>
		</AccordionPrimitive.Content>
	);
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
