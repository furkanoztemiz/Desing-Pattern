/*
 * Tasarım Kalıpları Atölyesi — çekirdek yardımcılar
 * Tüm modüller global `DP` ad alanını kullanır (derleme adımı yok, file:// ile çalışır).
 */
(function () {
  'use strict';

  const DP = (window.DP = window.DP || {});
  DP.version = '1.0.0';
  DP.patterns = {};
  DP.ui = {};
  DP.speed = 1; // animasyon hız çarpanı (Stepper değiştirir)

  /** Kalıp tanımını kaydeder. */
  DP.register = function (def) {
    DP.patterns[def.id] = def;
  };

  // ---------------------------------------------------------------- DOM
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function setAttrs(el, attrs) {
    if (!attrs) return;
    for (const key of Object.keys(attrs)) {
      const val = attrs[key];
      if (val == null || val === false) continue;
      if (key === 'class') el.setAttribute('class', val);
      else if (key === 'html') el.innerHTML = val;
      else if (key === 'text') el.textContent = val;
      else if (key === 'style' && typeof val === 'object') Object.assign(el.style, val);
      else if (key === 'dataset') Object.assign(el.dataset, val);
      else if (key.startsWith('on') && typeof val === 'function') el.addEventListener(key.slice(2).toLowerCase(), val);
      else el.setAttribute(key, val === true ? '' : val);
    }
  }

  function addKids(el, kids) {
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false) continue;
      el.appendChild(typeof kid === 'string' || typeof kid === 'number' ? document.createTextNode(String(kid)) : kid);
    }
  }

  /** HTML elemanı oluşturur: h('div', {class:'x'}, 'metin', çocuk) */
  DP.h = function (tag, attrs, ...kids) {
    const el = document.createElement(tag);
    setAttrs(el, attrs);
    addKids(el, kids);
    return el;
  };

  /** SVG elemanı oluşturur. */
  DP.s = function (tag, attrs, ...kids) {
    const el = document.createElementNS(SVG_NS, tag);
    setAttrs(el, attrs);
    addKids(el, kids);
    return el;
  };

  DP.$ = (sel, root) => (root || document).querySelector(sel);
  DP.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  DP.esc = (str) => String(str).replace(/[&<>"']/g, (ch) => ESC[ch]);

  /**
   * Mini işaretleme: **kalın**, `kod`, [[SinifAdi]] (rol rengiyle), ::vurgu::
   * roleOf(isim) → renk numarası (1..6) ya da null
   */
  DP.md = function (text, roleOf) {
    let out = DP.esc(text);
    out = out.replace(/\[\[([^\]]+)\]\]/g, (m, name) => {
      const r = roleOf ? roleOf(name) : null;
      return `<span class="cls${r ? ' rc rc-' + r : ''}">${name}</span>`;
    });
    out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
    out = out.replace(/::([^:]+)::/g, '<mark>$1</mark>');
    out = out.replace(/\n/g, '<br>');
    return out;
  };

  // ---------------------------------------------------------------- zaman ve animasyon
  DP.reducedMotion = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  /** Hız çarpanına göre süre (ms). */
  DP.dur = (ms) => (DP.reducedMotion ? 1 : ms / DP.speed);

  DP.setSpeed = function (v) {
    DP.speed = v;
    document.documentElement.style.setProperty('--speed', String(v));
  };

  DP.ease = {
    linear: (t) => t,
    inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    out: (t) => 1 - Math.pow(1 - t, 3),
  };

  /** requestAnimationFrame tabanlı ara değerleme; iptal fonksiyonu döndürür. */
  DP.tween = function ({ duration, ease, update, done }) {
    const fn = ease || DP.ease.inOut;
    let start = null;
    let raf = 0;
    let stopped = false;
    if (duration <= 1) {
      update(1);
      if (done) done();
      return () => {};
    }
    const frame = (ts) => {
      if (stopped) return;
      if (start === null) start = ts;
      const t = Math.min(1, (ts - start) / duration);
      update(fn(t));
      if (t < 1) raf = requestAnimationFrame(frame);
      else if (done) done();
    };
    raf = requestAnimationFrame(frame);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };
  };

  /** Bir elemana tek seferlik CSS animasyon sınıfı ekler (yeniden tetiklenebilir). */
  DP.flash = function (el, cls) {
    if (!el) return;
    el.classList.remove(cls);
    void el.getBoundingClientRect(); // reflow → animasyon yeniden başlar
    el.classList.add(cls);
  };

  // ---------------------------------------------------------------- depolama
  DP.store = {
    get(key, def) {
      try {
        const raw = localStorage.getItem('dp.' + key);
        return raw === null ? def : JSON.parse(raw);
      } catch (e) {
        return def;
      }
    },
    set(key, val) {
      try {
        localStorage.setItem('dp.' + key, JSON.stringify(val));
      } catch (e) {
        /* gizli pencere vb. */
      }
    },
  };

  // ---------------------------------------------------------------- olay yolu
  const listeners = {};
  DP.on = function (ev, fn) {
    (listeners[ev] = listeners[ev] || []).push(fn);
    return () => DP.off(ev, fn);
  };
  DP.off = function (ev, fn) {
    if (listeners[ev]) listeners[ev] = listeners[ev].filter((f) => f !== fn);
  };
  DP.emit = function (ev, data) {
    (listeners[ev] || []).slice().forEach((fn) => fn(data));
  };

  // ---------------------------------------------------------------- satır farkı (LCS)
  /**
   * İki metin arasındaki satır farkı.
   * Dönen öğeler: {type:'same'|'add'|'del', text, na (eski satır no, 0 tabanlı), nb (yeni satır no)}
   */
  DP.diffLines = function (oldText, newText) {
    const a = oldText.split('\n');
    const b = newText.split('\n');
    const n = a.length;
    const m = b.length;
    const dp = [];
    for (let i = 0; i <= n; i++) dp.push(new Int32Array(m + 1));
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    const out = [];
    let i = 0;
    let j = 0;
    while (i < n && j < m) {
      if (a[i] === b[j]) {
        out.push({ type: 'same', text: b[j], na: i, nb: j });
        i++;
        j++;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        out.push({ type: 'del', text: a[i], na: i });
        i++;
      } else {
        out.push({ type: 'add', text: b[j], nb: j });
        j++;
      }
    }
    while (i < n) out.push({ type: 'del', text: a[i], na: i++ });
    while (j < m) out.push({ type: 'add', text: b[j], nb: j++ });
    return out;
  };

  // ---------------------------------------------------------------- pano
  DP.copyText = async function (text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      const ta = DP.h('textarea', { style: { position: 'fixed', opacity: '0' } });
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try {
        ok = document.execCommand('copy');
      } catch (err) {
        ok = false;
      }
      ta.remove();
      return ok;
    }
  };

  /** Bir kapsayıcıyı belirli en-boy oranında, içine sığacak şekilde boyutlandırır. */
  DP.fitBox = function (outer, inner, ratio) {
    const apply = () => {
      const w = outer.clientWidth;
      const hgt = outer.clientHeight;
      if (!w || !hgt) return;
      let fw = w;
      let fh = w / ratio;
      if (fh > hgt) {
        fh = hgt;
        fw = hgt * ratio;
      }
      inner.style.width = Math.floor(fw) + 'px';
      inner.style.height = Math.floor(fh) + 'px';
    };
    const ro = new ResizeObserver(apply);
    ro.observe(outer);
    apply();
    return () => ro.disconnect();
  };
})();
