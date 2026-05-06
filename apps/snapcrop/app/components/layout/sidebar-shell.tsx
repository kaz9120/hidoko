import type { ReactNode } from "react";
import { useIsMobile } from "~/components/shadcn-ui/hooks/use-mobile";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "~/components/shadcn-ui/sheet";
import { cn } from "~/components/shadcn-ui/utils";

type SidebarShellProps = {
	side: "left" | "right";
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	children: ReactNode;
};

/**
 * サイドバーの開閉責務を吸収するシェル。
 * - md 以上: 静的な <aside> として常時表示
 * - md 未満: shadcn Sheet (Radix Dialog) で drawer 表示。focus trap / ESC /
 *   role="dialog" などのアクセシビリティが Sheet に内包される
 *
 * useIsMobile は md ブレークポイント (768px) で切り替わるので、Tailwind の
 * md: 条件と一致する。リサイズで一方からもう一方へ遷移する際はマウントし直し
 * になる点に注意 (現状この遷移をまたぐ持続 state は無いので問題なし)。
 */
export function SidebarShell({
	side,
	open,
	onOpenChange,
	title,
	description,
	children,
}: SidebarShellProps) {
	const isMobile = useIsMobile();

	if (isMobile) {
		return (
			<Sheet onOpenChange={onOpenChange} open={open}>
				<SheetContent
					className="flex w-80 flex-col overflow-y-auto p-0"
					side={side}
				>
					<SheetHeader className="sr-only">
						<SheetTitle>{title}</SheetTitle>
						<SheetDescription>{description}</SheetDescription>
					</SheetHeader>
					{children}
				</SheetContent>
			</Sheet>
		);
	}

	return (
		<aside
			aria-label={title}
			className={cn(
				"flex w-72 shrink-0 flex-col overflow-y-auto bg-card",
				side === "left" ? "border-border border-r" : "border-border border-l",
			)}
		>
			{children}
		</aside>
	);
}
