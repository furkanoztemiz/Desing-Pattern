/*
 * Görsel efektler: bildirim (toast), konfeti ve ekran üzerine çizim kalemi.
 */
(function () {
  'use strict';
  const { h } = DP;
  const fx = (DP.fx = {});

  // ------------------------------------------------------------------ bildirim
  let toastEl = null;
  let toastTimer = 0;
  fx.toast = function (text, ms) {
    if (!toastEl) {
      toastEl = h('div', { class: 'toast', role: 'status', 'aria-live': 'polite' });
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = text;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), ms || 1800);
  };

  // ------------------------------------------------------------------ konfeti
  fx.confetti = function (o) {
    if (DP.reducedMotion) return;
    o = o || {};
    const cv = h('canvas', { class: 'confetti' });
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = window.innerWidth;
    const H = window.innerHeight;
    cv.width = W * dpr;
    cv.height = H * dpr;
    ctx.scale(dpr, dpr);
    const css = getComputedStyle(document.documentElement);
    const colors = ['--r2', '--r3', '--r4', '--r5', '--r6', '--spot'].map((v) => css.getPropertyValue(v).trim() || '#4f46e5');
    const ox = o.x != null ? o.x : W / 2;
    const oy = o.y != null ? o.y : H * 0.35;
    const parts = Array.from({ length: o.count || 140 }, () => {
      const a = Math.random() * Math.PI * 2;
      const v = 4 + Math.random() * 9;
      return {
        x: ox,
        y: oy,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - 6,
        w: 6 + Math.random() * 7,
        h: 4 + Math.random() * 6,
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        c: colors[(Math.random() * colors.length) | 0],
      };
    });
    const t0 = performance.now();
    const frame = (t) => {
      const el = t - t0;
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.vy += 0.32;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - el / 2600);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (el < 2600) requestAnimationFrame(frame);
      else cv.remove();
    };
    requestAnimationFrame(frame);
  };

  // ------------------------------------------------------------------ çizim kalemi
  const pen = (fx.pen = { on: false, color: '#e11d48', width: 4 });
  let canvas = null;
  let ctx = null;
  let bar = null;
  let drawing = false;
  let last = null;

  function ensure() {
    if (canvas) return;
    canvas = h('canvas', { class: 'pen-canvas', 'aria-hidden': 'true' });
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('pointerdown', (e) => {
      if (!pen.on) return;
      drawing = true;
      last = { x: e.clientX, y: e.clientY };
      canvas.setPointerCapture(e.pointerId);
      dot(last);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!drawing) return;
      const p = { x: e.clientX, y: e.clientY };
      ctx.strokeStyle = pen.color;
      ctx.lineWidth = pen.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      last = p;
    });
    const stop = () => (drawing = false);
    canvas.addEventListener('pointerup', stop);
    canvas.addEventListener('pointercancel', stop);

    const colors = ['#e11d48', '#f59e0b', '#2563eb', '#059669', '#111827', '#ffffff'];
    bar = h('div', { class: 'pen-bar', role: 'toolbar', 'aria-label': 'Çizim araçları' });
    bar.appendChild(h('span', { class: 'pen-title' }, 'Kalem'));
    colors.forEach((c) => {
      const b = h('button', { class: 'pen-color', type: 'button', title: 'Renk', style: { background: c } });
      b.addEventListener('click', () => {
        pen.color = c;
        DP.$$('.pen-color', bar).forEach((x) => x.classList.toggle('is-on', x === b));
      });
      if (c === pen.color) b.classList.add('is-on');
      bar.appendChild(b);
    });
    const clr = h('button', { class: 'btn btn-ghost btn-sm', type: 'button', title: 'Temizle (X)' }, 'Temizle');
    clr.addEventListener('click', () => pen.clear());
    const close = h('button', { class: 'btn btn-primary btn-sm', type: 'button', title: 'Kalemi kapat (K)' }, 'Kapat');
    close.addEventListener('click', () => pen.toggle(false));
    bar.append(clr, close);
    document.body.appendChild(bar);
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function dot(p) {
    ctx.fillStyle = pen.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, pen.width / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  pen.toggle = function (force) {
    ensure();
    pen.on = force != null ? !!force : !pen.on;
    document.body.classList.toggle('pen-on', pen.on);
    DP.emit('pen', pen.on);
  };

  pen.clear = function () {
    if (!canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
})();
