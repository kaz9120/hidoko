import markDarkUrl from "ui/assets/logo/mark-dark.svg?url";

type Props = {
	size?: number;
};

export function HidokoMark({ size = 22 }: Props) {
	return (
		<img
			src={markDarkUrl}
			alt=""
			width={size}
			height={size}
			className="block rounded-md"
			aria-hidden="true"
		/>
	);
}
