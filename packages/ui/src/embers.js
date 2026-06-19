/* ============================================================
   <hi-embers> — 炎・火の粉のCanvasアニメーション v2
   ------------------------------------------------------------
   使い方:
     <script src="components/embers.js"></script>
     <hi-embers density="45" wind="0.2"></hi-embers>

   属性:
     density  火の粉の数（既定 45）
     wind     横方向の風（-1 〜 1、既定 0）
     hue      色相シフト（既定 0、橙が基準）
     glow     下からのほのかなグロー（"on" / "off"、既定 "on"）

   親要素は position: relative にしておくこと。
   z-index は背景として使うことを想定（pointer-events なし）。

   v2 変更点:
   - 爆ぜ（pop）: クラスター発生、短命、速い上昇、放物線軌道
   - 揺らぎ上昇（drift）: サイン波ガイドで有機的に揺れながら上昇
   - 不規則明滅: ノイズベースのフリッカー（sine → hash noise）
   - 白熱フラッシュ: 生まれた瞬間だけ明るいコア
   - radialGradient 描画: shadowBlur → ソフトグローで統一
   ============================================================ */

class HiEmbers extends HTMLElement {
	constructor() {
		super();
		this._raf = null;
		this._particles = [];
		this._last = 0;
		this._nextSpawn = 0;
	}

	connectedCallback() {
		const root = this.attachShadow({ mode: "open" });
		root.innerHTML = `
      <style>
        :host {
          position: absolute;
          inset: 0;
          display: block;
          pointer-events: none;
          overflow: hidden;
        }
        canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
        .glow {
          position: absolute;
          left: 0; right: 0; bottom: -40%;
          height: 80%;
          background: radial-gradient(
            ellipse at 50% 100%,
            rgba(244, 125, 58, 0.22) 0%,
            rgba(232, 93, 32, 0.10) 30%,
            transparent 65%
          );
          filter: blur(20px);
        }
      </style>
      <div class="glow"></div>
      <canvas></canvas>
    `;
		this._canvas = root.querySelector("canvas");
		this._glow = root.querySelector(".glow");
		if (this.getAttribute("glow") === "off") this._glow.style.display = "none";
		this._ctx = this._canvas.getContext("2d");
		this._ro = new ResizeObserver(() => this._resize());
		this._ro.observe(this);
		this._resize();
		this._reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		// reduced motion 環境では火の粉を描かず、静的なグローだけ残す。
		// アクセシビリティ対応であると同時に、VRT の撮影を決定的にする (#65)。
		if (this._reduce) return;
		this._spawnInitial();
		this._tick = this._tick.bind(this);
		this._raf = requestAnimationFrame(this._tick);
	}

	disconnectedCallback() {
		cancelAnimationFrame(this._raf);
		this._ro?.disconnect();
	}

	_resize() {
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const w = this.clientWidth;
		const h = this.clientHeight;
		this._w = w;
		this._h = h;
		this._canvas.width = w * dpr;
		this._canvas.height = h * dpr;
		this._ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	}

	_density() {
		return parseFloat(this.getAttribute("density")) || 45;
	}
	_wind() {
		return parseFloat(this.getAttribute("wind")) || 0;
	}
	_hue() {
		return parseFloat(this.getAttribute("hue")) || 0;
	}

	/* ── Hash noise for irregular flicker ── */
	static _noise(s, t) {
		const a = Math.sin(s * 127.1 + t * 311.7) * 43758.5453;
		const b = Math.sin(s * 269.5 + t * 183.3) * 28001.8384;
		return (a - Math.floor(a)) * 0.6 + (b - Math.floor(b)) * 0.4;
	}

	/* ── Spawn origin: bottom zone of the canvas ── */
	_spawnOrigin() {
		const w = this._w;
		const h = this._h;
		return {
			x: w * 0.12 + Math.random() * w * 0.76,
			y: h * 0.78 + Math.random() * h * 0.18,
		};
	}

	/* ── Create a pop spark (fast, short-lived burst) ── */
	_makePop(origin) {
		const R = Math.random;
		const angle = -Math.PI / 2 + (R() - 0.5) * 1.0;
		const speed = 1.8 + R() * 2.5;
		return {
			x: origin.x + (R() - 0.5) * 10,
			y: origin.y + (R() - 0.5) * 6,
			originX: origin.x,
			originY: origin.y,
			vx: Math.cos(angle) * speed * 0.3,
			vy: -speed,
			r: 0.8 + R() * 1.6,
			life: 0,
			max: 0.6 + R() * 1.2,
			type: "pop",
			seed: R() * 999,
			popDur: 0.05 + R() * 0.08,
			hueShift: (R() - 0.5) * 24,
			gravity: 0.02 + R() * 0.015,
			drag: 0.985,
		};
	}

	/* ── Create a drift spark (slow wave-guided rise) ── */
	_makeDrift(origin) {
		const R = Math.random;
		const w = this._w;
		return {
			x: origin.x + (R() - 0.5) * 8,
			y: origin.y + (R() - 0.5) * 6,
			originX: origin.x,
			originY: origin.y,
			vy: -(0.5 + R() * 1.0),
			freq: 0.008 + R() * 0.012,
			amp: 30 + R() * 50,
			phase: R() * Math.PI * 2,
			targetX: origin.x + (R() - 0.5) * w * 0.4,
			r: 1.0 + R() * 2.2,
			life: 0,
			max: 2.0 + R() * 3.5,
			type: "drift",
			seed: R() * 999,
			popDur: 0.06 + R() * 0.1,
			hueShift: (R() - 0.5) * 24,
		};
	}

	/* ── Pre-populate with mid-flight drifters ── */
	_spawnInitial() {
		const R = Math.random;
		const count = Math.min(8, Math.floor(this._density() * 0.2));
		for (let i = 0; i < count; i++) {
			const o = this._spawnOrigin();
			const p = this._makeDrift(o);
			p.life = R() * p.max * 0.5;
			p.y = o.y + p.vy * 60 * p.life * 0.3;
			p.x = o.x + Math.sin(p.y * p.freq + p.phase) * p.amp * 0.5;
			this._particles.push(p);
		}
	}

	/* ── Spawn a cluster ── */
	_spawnCluster() {
		const R = Math.random;
		const ps = this._particles;
		const max = this._density();
		const origin = this._spawnOrigin();
		const count = 1 + Math.floor(R() * 3);
		for (let i = 0; i < count && ps.length < max; i++) {
			if (i === 0 && R() < 0.3) {
				ps.push(this._makePop(origin));
			} else {
				const o = {
					x: origin.x + (R() - 0.5) * 8,
					y: origin.y + (R() - 0.5) * 6,
				};
				ps.push(this._makeDrift(o));
			}
		}
	}

	/* ── Update pop particle ── */
	_updatePop(p, dt, time) {
		const noise = HiEmbers._noise;
		p.vy += p.gravity * 60 * dt;
		p.vx *= p.drag;
		p.vy *= p.drag;
		p.vx += (noise(p.seed, time * 4) - 0.5) * 0.06 * 60 * dt;
		p.x += (p.vx + this._wind()) * 60 * dt;
		p.y += p.vy * 60 * dt;
	}

	/* ── Update drift particle ── */
	_updateDrift(p, dt, time) {
		const noise = HiEmbers._noise;
		p.vy *= 0.9995;
		p.y += p.vy * 60 * dt;
		const k = p.life / p.max;
		const waveX = Math.sin(p.y * p.freq + p.phase) * p.amp;
		const driftProgress = Math.min(1, k * 2);
		const baseX = p.originX + (p.targetX - p.originX) * k;
		p.x = baseX + waveX * driftProgress + this._wind() * 30 * k;
		p.x += (noise(p.seed, time * 4) - 0.5) * 0.6;
	}

	/* ── Draw a single particle ── */
	_drawParticle(ctx, p, time, baseHue) {
		const noise = HiEmbers._noise;
		const k = p.life / p.max;
		const hue = baseHue - k * 20 + p.hueShift;
		const sat = 92 - k * 45;
		const lig = 65 - k * 38;

		const popK = Math.min(1, p.life / p.popDur);
		const popBoost = popK < 1 ? 1.4 - popK * 0.4 : 1.0;
		const flicker = 0.6 + noise(p.seed, time * 7 + p.seed) * 0.4;
		const fadeIn = Math.min(1, p.life / 0.04);
		const fadeOut = k > 0.6 ? ((1 - k) / 0.4) ** 1.3 : 1;
		const alpha = fadeIn * fadeOut * flicker * popBoost;

		if (alpha < 0.01) return;
		const r = p.r * (1 - k * 0.45);
		const PI2 = Math.PI * 2;

		// Soft glow
		const glowR = r * 3.5;
		const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
		grd.addColorStop(0, `hsla(${hue},${sat}%,${lig}%,${alpha * 0.65})`);
		grd.addColorStop(0.3, `hsla(${hue},${sat}%,${lig}%,${alpha * 0.25})`);
		grd.addColorStop(1, `hsla(${hue},${sat}%,${lig}%,0)`);
		ctx.beginPath();
		ctx.fillStyle = grd;
		ctx.arc(p.x, p.y, glowR, 0, PI2);
		ctx.fill();

		// Bright core at birth
		const coreAge = p.type === "pop" ? 0.3 : 0.15;
		if (k < coreAge) {
			const ci = 1 - k / coreAge;
			const coreLig = Math.min(92, lig + 30 * ci);
			const coreR = r * (0.35 + ci * 0.45);
			ctx.beginPath();
			ctx.fillStyle = `hsla(${hue + 10},${sat - 15}%,${coreLig}%,${alpha * 0.85 * ci})`;
			ctx.arc(p.x, p.y, coreR, 0, PI2);
			ctx.fill();
		}
	}

	/* ── Main animation loop ── */
	_tick(t) {
		const dt = Math.min(0.05, (t - this._last) / 1000 || 0.016);
		this._last = t;
		const time = t / 1000;
		const ctx = this._ctx;
		const w = this._w;
		const h = this._h;
		const baseHue = 22 + this._hue();

		ctx.clearRect(0, 0, w, h);
		ctx.globalCompositeOperation = "lighter";

		// Spawn clusters at irregular intervals
		this._nextSpawn -= dt;
		if (this._nextSpawn <= 0) {
			this._spawnCluster();
			this._nextSpawn = 0.15 + Math.random() * 0.5;
		}

		// Update & draw
		const ps = this._particles;
		for (let i = ps.length - 1; i >= 0; i--) {
			const p = ps[i];
			p.life += dt;
			if (p.life / p.max >= 1) {
				ps.splice(i, 1);
				continue;
			}

			if (p.type === "pop") this._updatePop(p, dt, time);
			else this._updateDrift(p, dt, time);

			this._drawParticle(ctx, p, time, baseHue);
		}

		ctx.globalCompositeOperation = "source-over";
		this._raf = requestAnimationFrame(this._tick);
	}
}

customElements.define("hi-embers", HiEmbers);
