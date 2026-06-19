import { zodResolver } from "@hookform/resolvers/zod";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "./button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./form";
import { Input } from "./input";

/**
 * `react-hook-form` + `zod` 前提のフォーム部品集。`Form` は FormProvider の
 * 別名で、内側の `FormField` が `Controller` を返す。ラベル・補助テキスト・
 * エラーメッセージの結線（`aria-describedby` / `aria-invalid`）は
 * `FormItem` から下の hook が自動で組む。
 *
 * @summary react-hook-form 連携のフォーム部品集
 */
const meta: Meta<typeof Form> = {
	title: "shadcn-ui/Form",
	component: Form,
	parameters: {
		layout: "centered",
	},
};

export default meta;

type Story = StoryObj<typeof Form>;

const schema = z.object({
	displayName: z
		.string()
		.min(2, "2 文字以上にしてください")
		.max(20, "20 文字以内にしてください"),
});

/**
 * 1 フィールドの最小フォーム。`useForm` を立てて `Form` で provide し、
 * `FormField` の中で `FormItem` → `FormLabel` → `FormControl` → `FormMessage`
 * の順に組む。
 * @summary 1 フィールドの最小フォーム
 */
export const Default: Story = {
	render: () => {
		const form = useForm<z.infer<typeof schema>>({
			resolver: zodResolver(schema),
			defaultValues: { displayName: "" },
			mode: "onBlur",
		});

		return (
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(() => {})}
					className="flex w-72 flex-col gap-4"
				>
					<FormField
						control={form.control}
						name="displayName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>表示名</FormLabel>
								<FormControl>
									<Input placeholder="例: 三軒茶屋の焚き火人" {...field} />
								</FormControl>
								<FormDescription>他のメンバーから見える名前。</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit">保存</Button>
				</form>
			</Form>
		);
	},
};

/**
 * バリデーション失敗時の表示。マウント直後にエラーを立てて、`FormLabel` が
 * destructive 色に振れ、`FormMessage` に zod のメッセージが出ることを示す。
 * @summary バリデーション失敗時
 */
export const WithError: Story = {
	render: () => {
		const form = useForm<z.infer<typeof schema>>({
			resolver: zodResolver(schema),
			defaultValues: { displayName: "x" },
			mode: "onChange",
		});

		// マウント直後にバリデーションを 1 回走らせて、message を確定させる。
		useEffect(() => {
			form.trigger("displayName", { shouldFocus: false });
		}, [form]);

		return (
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(() => {})}
					className="flex w-72 flex-col gap-4"
				>
					<FormField
						control={form.control}
						name="displayName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>表示名</FormLabel>
								<FormControl>
									<Input placeholder="例: 三軒茶屋の焚き火人" {...field} />
								</FormControl>
								<FormDescription>他のメンバーから見える名前。</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit">保存</Button>
				</form>
			</Form>
		);
	},
};
