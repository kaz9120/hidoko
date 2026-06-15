import { useEffect, useRef } from "react";

interface EmbersProps {
	density?: number;
	wind?: number;
	className?: string;
}

interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	r: number;
	life: number;
	max: number;
	hueShift: number;
	flicker: number;
}

/**
 * design の `<hi-embers>` Web Component を React 化したもの。
 * 親要素に対して absolute / inset-0 / pointer-events-none で被さる canvas を描画する。
 * prefers-reduced-motion が立っていれば描画を止める。
 */
export function Embers({ density = 24, wind = 0.03, className }: EmbersProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const wrapperRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const wrapper = wrapperRef.current;
		const canvas = canvasRef.current;
		if (!wrapper || !canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const reduce = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (reduce) return;

		let raf = 0;
		let last = 0;
		const particles: Particle[] = [];

		const makeParticle = (initial: boolean): Particle => ({
			x: Math.random() * wrapper.clientWidth,
			y: initial
				? Math.random() * wrapper.clientHeight
				: wrapper.clientHeight + Math.random() * 20,
			vx: (Math.random() - 0.5) * 0.3,
			vy: -(0.3 + Math.random() * 0.7),
			r: 0.6 + Math.random() * 1.6,
			life: 0,
			max: 4 + Math.random() * 6,
			hueShift: (Math.random() - 0.5) * 20,
			flicker: Math.random() * Math.PI * 2,
		});

		const resize = () => {
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			const w = wrapper.clientWidth;
			const h = wrapper.clientHeight;
			canvas.width = w * dpr;
			canvas.height = h * dpr;
			canvas.style.width = `${w}px`;
			canvas.style.height = `${h}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};

		resize();
		const ro = new ResizeObserver(resize);
		ro.observe(wrapper);

		for (let i = 0; i < density; i++) particles.push(makeParticle(true));

		const tick = (t: number) => {
			const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
			last = t;
			const w = wrapper.clientWidth;
			const h = wrapper.clientHeight;
			const baseHue = 22;

			ctx.clearRect(0, 0, w, h);
			ctx.globalCompositeOperation = "lighter";

			while (particles.length < density) particles.push(makeParticle(false));

			for (let i = particles.length - 1; i >= 0; i--) {
				const p = particles[i];
				if (!p) continue;
				p.life += dt;
				const k = p.life / p.max;
				if (k >= 1) {
					particles.splice(i, 1);
					continue;
				}
				p.x +=
					(p.vx + wind) * 60 * dt + Math.sin(p.life * 1.6 + p.flicker) * 0.4;
				p.y += p.vy * 60 * dt;
				p.vy -= 0.02 * dt * 60;

				const hue = baseHue - k * 18 + p.hueShift;
				const sat = 90 - k * 50;
				const lig = 62 - k * 35;
				const alpha = (1 - k) * 0.85;
				const flick = 0.7 + Math.sin(p.life * 18 + p.flicker) * 0.3;
				const r = p.r * (1 + k * 0.6);

				ctx.beginPath();
				ctx.fillStyle = `hsla(${hue}, ${sat}%, ${lig}%, ${alpha * flick})`;
				ctx.shadowColor = `hsla(${hue}, ${sat}%, ${lig}%, ${alpha * 0.8})`;
				ctx.shadowBlur = 8;
				ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
				ctx.fill();
			}

			ctx.shadowBlur = 0;
			ctx.globalCompositeOperation = "source-over";

			raf = requestAnimationFrame(tick);
		};

		raf = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
		};
	}, [density, wind]);

	return (
		<div
			ref={wrapperRef}
			aria-hidden
			className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
		>
			<div
				className="absolute inset-x-0 -bottom-[40%] h-[80%] blur-[20px]"
				style={{
					background:
						"radial-gradient(ellipse at 50% 100%, rgba(244,125,58,0.22) 0%, rgba(232,93,32,0.10) 30%, transparent 65%)",
				}}
			/>
			<canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
		</div>
	);
}
