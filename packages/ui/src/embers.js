/* ============================================================
   <hi-embers> — 炎・火の粉のCanvasアニメーション
   ------------------------------------------------------------
   使い方:
     <script src="components/embers.js"></script>
     <hi-embers density="60" wind="0.2"></hi-embers>

   属性:
     density  火の粉の数（既定 50）
     wind     横方向の風（-1 〜 1、既定 0）
     hue      色相シフト（既定 0、橙が基準）
     glow     下からのほのかなグロー（"on" / "off"、既定 "on"）

   親要素は position: relative にしておくこと。
   z-index は背景として使うことを想定（pointer-events なし）。
   ============================================================ */

class HiEmbers extends HTMLElement {
  constructor() {
    super();
    this._raf = null;
    this._particles = [];
    this._last = 0;
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
    this._spawnInitial();
    this._tick = this._tick.bind(this);
    this._raf = requestAnimationFrame(this._tick);
    this._reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  disconnectedCallback() {
    cancelAnimationFrame(this._raf);
    this._ro?.disconnect();
  }

  _resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = this.clientWidth, h = this.clientHeight;
    this._w = w; this._h = h;
    this._canvas.width = w * dpr;
    this._canvas.height = h * dpr;
    this._ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  _density() { return parseFloat(this.getAttribute("density")) || 50; }
  _wind()    { return parseFloat(this.getAttribute("wind")) || 0; }
  _hue()     { return parseFloat(this.getAttribute("hue")) || 0; }

  _spawnInitial() {
    const n = this._density();
    for (let i = 0; i < n; i++) {
      this._particles.push(this._make(true));
    }
  }

  _make(initial = false) {
    const w = this._w, h = this._h;
    return {
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + Math.random() * 20,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(0.3 + Math.random() * 0.7),
      r: 0.6 + Math.random() * 1.6,
      life: 0,
      max: 4 + Math.random() * 6, // 秒
      hueShift: (Math.random() - 0.5) * 20,
      flicker: Math.random() * Math.PI * 2,
    };
  }

  _tick(t) {
    const dt = Math.min(0.05, (t - this._last) / 1000 || 0.016);
    this._last = t;
    const ctx = this._ctx;
    const w = this._w, h = this._h;
    const wind = this._wind();
    const baseHue = 22 + this._hue(); // 22 = 橙

    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";

    const targetN = this._density();
    while (this._particles.length < targetN) this._particles.push(this._make());

    for (let i = this._particles.length - 1; i >= 0; i--) {
      const p = this._particles[i];
      p.life += dt;
      const k = p.life / p.max;
      if (k >= 1) {
        this._particles.splice(i, 1);
        continue;
      }
      // 物理
      p.x += (p.vx + wind) * 60 * dt + Math.sin(p.life * 1.6 + p.flicker) * 0.4;
      p.y += p.vy * 60 * dt;
      p.vy -= 0.02 * dt * 60; // ふわっと上昇加速

      // 色：橙 → 赤 → 灰へ
      const hue = baseHue - k * 18 + p.hueShift;
      const sat = 90 - k * 50;
      const lig = 62 - k * 35;
      const alpha = (1 - k) * 0.85;

      const flick = 0.7 + Math.sin(p.life * 18 + p.flicker) * 0.3;

      ctx.beginPath();
      const r = p.r * (1 + k * 0.6);
      ctx.fillStyle = `hsla(${hue}, ${sat}%, ${lig}%, ${alpha * flick})`;
      ctx.shadowColor = `hsla(${hue}, ${sat}%, ${lig}%, ${alpha * 0.8})`;
      ctx.shadowBlur = 8;
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = "source-over";

    this._raf = requestAnimationFrame(this._tick);
  }
}

customElements.define("hi-embers", HiEmbers);
