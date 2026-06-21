import type { Meta, StoryObj } from "@storybook/react-vite";
import { toast } from "sonner";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "ui/components/accordion";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "ui/components/alert-dialog";
import { Button } from "ui/components/button";
import { Checkbox } from "ui/components/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "ui/components/dialog";
import { Input } from "ui/components/input";
import { Label } from "ui/components/label";
import { Popover, PopoverContent, PopoverTrigger } from "ui/components/popover";
import { RadioGroup, RadioGroupItem } from "ui/components/radio-group";
import { Skeleton } from "ui/components/skeleton";
import { Toaster } from "ui/components/sonner";
import { Switch } from "ui/components/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "ui/components/tabs";
import { Textarea } from "ui/components/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "ui/components/tooltip";

const meta = {
	title: "Brand/Coverage",
	parameters: {
		layout: "fullscreen",
	},
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section className="rounded-lg border bg-bg-raised p-6">
			<h2 className="mb-4 font-mono text-xs uppercase tracking-wide text-text-muted">
				{title}
			</h2>
			<div className="flex flex-wrap items-center gap-3">{children}</div>
		</section>
	);
}

/**
 * @summary 12 の motion 語彙を 1 ページで体感確認する。各 section に語彙が 1〜2 個。
 */
export const All: Story = {
	render: () => (
		<TooltipProvider delayDuration={0}>
			<div className="mx-auto grid max-w-5xl gap-6 bg-bg p-12">
				<header>
					<p className="font-mono text-xs uppercase tracking-wide text-accent">
						Brand Coverage
					</p>
					<h1 className="mt-2 text-3xl font-medium tracking-tight text-text">
						12 の motion 語彙を一画面で確認
					</h1>
					<p className="mt-2 max-w-prose text-sm leading-relaxed text-text-muted">
						ブランドの motion / focus ring / glow が shadcn
						ベースコンポーネントに 乗っているかを目視で確認する。各 section
						で語彙が 1〜2 個。
					</p>
				</header>

				<Section title="霧の対話 (overlay + dialog)">
					<Dialog>
						<DialogTrigger asChild>
							<Button>Dialog を開く</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>霧が晴れる対話</DialogTitle>
								<DialogDescription>
									backdrop の blur と暗転が ease-ember で 700ms 補間される。
								</DialogDescription>
							</DialogHeader>
						</DialogContent>
					</Dialog>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant="outline">確認ダイアログを開く</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>本当に削除しますか</AlertDialogTitle>
								<AlertDialogDescription>
									この操作は取り消せません。
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>キャンセル</AlertDialogCancel>
								<AlertDialogAction>削除する</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</Section>

				<Section title="浮上 (rise) — Tooltip / Popover">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button variant="ghost">tooltip 付きボタン</Button>
						</TooltipTrigger>
						<TooltipContent>そっと寄り添う tooltip</TooltipContent>
					</Tooltip>
					<Popover>
						<PopoverTrigger asChild>
							<Button variant="outline">popover を開く</Button>
						</PopoverTrigger>
						<PopoverContent>
							<p className="text-sm">下から軽く浮上して現れる popover。</p>
						</PopoverContent>
					</Popover>
				</Section>

				<Section title="場面 (tab-enter) と 折り (fold)">
					<Tabs defaultValue="overview" className="w-full">
						<TabsList className="grid w-full max-w-md grid-cols-3">
							<TabsTrigger value="overview">概要</TabsTrigger>
							<TabsTrigger value="settings">設定</TabsTrigger>
							<TabsTrigger value="log">ログ</TabsTrigger>
						</TabsList>
						<TabsContent value="overview">
							<p className="py-4 text-sm">
								概要パネル。タブ切替時に静かに浮かび上がる。
							</p>
						</TabsContent>
						<TabsContent value="settings">
							<p className="py-4 text-sm">設定パネル。</p>
						</TabsContent>
						<TabsContent value="log">
							<p className="py-4 text-sm">ログパネル。</p>
						</TabsContent>
					</Tabs>
					<Accordion type="single" collapsible className="w-full">
						<AccordionItem value="item-1">
							<AccordionTrigger>焚き火の熾し方は?</AccordionTrigger>
							<AccordionContent>
								薪を組み、空気の通り道を確保し、火を下から上へ。
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="item-2">
							<AccordionTrigger>薪の選び方は?</AccordionTrigger>
							<AccordionContent>
								広葉樹は火持ちが良く、針葉樹は着火しやすい。
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</Section>

				<Section title="熾火 glow と統一 focus ring (Button)">
					<Button>default</Button>
					<Button variant="outline">outline</Button>
					<Button variant="secondary">secondary</Button>
					<Button variant="ghost">ghost</Button>
					<Button variant="destructive">destructive</Button>
					<Button variant="link">link</Button>
				</Section>

				<Section title="入力系 focus ring">
					<div className="flex w-full flex-col gap-3">
						<div className="grid gap-2">
							<Label htmlFor="name">ニックネーム</Label>
							<Input id="name" placeholder="焚き火の番人" />
						</div>
						<div className="grid gap-2">
							<Label htmlFor="memo">メモ</Label>
							<Textarea id="memo" placeholder="ここに何か書く" />
						</div>
						<div className="flex items-center gap-3">
							<Switch id="notify" />
							<Label htmlFor="notify">通知を受け取る</Label>
						</div>
						<div className="flex items-center gap-3">
							<Checkbox id="agree" />
							<Label htmlFor="agree">規約に同意する</Label>
						</div>
						<RadioGroup defaultValue="dark" className="flex gap-4">
							<div className="flex items-center gap-2">
								<RadioGroupItem id="theme-dark" value="dark" />
								<Label htmlFor="theme-dark">ダーク</Label>
							</div>
							<div className="flex items-center gap-2">
								<RadioGroupItem id="theme-light" value="light" />
								<Label htmlFor="theme-light">ライト</Label>
							</div>
						</RadioGroup>
					</div>
				</Section>

				<Section title="待つ温度 (ember-pulse)">
					<div className="grid w-full gap-3">
						<Skeleton className="h-4 w-1/3" />
						<Skeleton className="h-4 w-2/3" />
						<Skeleton className="h-4 w-1/2" />
					</div>
				</Section>

				<Section title="知らせ (Sonner toast)">
					<Button
						onClick={() =>
							toast.success("保存しました", {
								description: "ブランドの shadow と背景に揃っている",
							})
						}
					>
						toast を出す
					</Button>
					<Toaster />
				</Section>
			</div>
		</TooltipProvider>
	),
};
