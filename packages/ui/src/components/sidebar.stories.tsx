import type { Meta, StoryObj } from "@storybook/react-vite";
import { CalendarIcon, FlameIcon, HomeIcon, SettingsIcon } from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
} from "./sidebar";

/**
 * 大型 composite。`SidebarProvider` で外側を包み、`Sidebar` を左右の柱として、
 * `SidebarInset` を本文領域として配置する。トグルは `SidebarTrigger` か Cmd/Ctrl + B。
 * mobile 幅では Sheet として開く。
 *
 * @summary アプリケーションの常設サイドバー
 */
const meta = {
	title: "shadcn-ui/Sidebar",
	component: Sidebar,
	parameters: {
		layout: "fullscreen",
	},
} satisfies Meta<typeof Sidebar>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Provider + Sidebar + Inset の最小構成。グループ見出しの下に 4 つの導線を並べる。
 * @summary 標準のサイドバー構成
 */
export const Default: Story = {
	render: () => (
		<SidebarProvider>
			<Sidebar>
				<SidebarHeader>
					<div className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium">
						<FlameIcon className="size-4" /> 火床
					</div>
				</SidebarHeader>
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupLabel>メイン</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								<SidebarMenuItem>
									<SidebarMenuButton isActive>
										<HomeIcon /> ホーム
									</SidebarMenuButton>
								</SidebarMenuItem>
								<SidebarMenuItem>
									<SidebarMenuButton>
										<CalendarIcon /> ふたりのよてい
									</SidebarMenuButton>
								</SidebarMenuItem>
								<SidebarMenuItem>
									<SidebarMenuButton>
										<FlameIcon /> snapcrop
									</SidebarMenuButton>
								</SidebarMenuItem>
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
				<SidebarFooter>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton>
								<SettingsIcon /> 設定
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarFooter>
			</Sidebar>
			<SidebarInset>
				<header className="flex items-center gap-2 border-b px-4 py-2">
					<SidebarTrigger />
					<span className="text-sm font-medium">ホーム</span>
				</header>
				<div className="p-4 text-sm text-muted-foreground">
					本文領域。SidebarInset の中に画面の中身を置く。
				</div>
			</SidebarInset>
		</SidebarProvider>
	),
};
