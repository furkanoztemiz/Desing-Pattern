/*
 * Decorator — animasyon sahneleri.
 *   DC.Lattice : "Sorun" — kombinasyon sınıflarının ağacı. Her yeni seçenek sınıf sayısını ikiye katlar;
 *                zamda unutulan sınıf kırmızıyla işaretlenir.
 *   DC.Layers  : "Canlı Akış", "Tezgâh", "Genişlet" — çekirdek gönderi ve onu saran katmanlar (matruşka).
 *                ucret() çağrısı soldan içeri iner; değer sağdan dışarı çıkarken her katman kendi payını ekler.
 *
 * Durum tabanlı çizim: render(state, prevState, {animate}) — geri/ileri adımlarda tutarlı.
 */
(function () {
  'use strict';
  const DC = DP.dc;
  const esc = DP.esc;
  const md = (t) => DP.md(t, DC.roleOf);
  let uidCounter = 0;

  /** CSS dönüşümünü uygular; animasyon yoksa geçişi o an için kapatır. */
  function setTransform(el, value, anim) {
    if (!anim) el.style.transition = 'none';
    el.style.transform = value;
    if (!anim) {
      void el.getBoundingClientRect();
      el.style.transition = '';
    }
  }

  function banner(fo, b) {
    const div = fo.firstElementChild;
    if (b) {
      const html = md(b.text);
      if (div.innerHTML !== html) {
        div.innerHTML = html;
        DP.flash(div, 'is-pop');
      }
      div.classList.toggle('is-ok', b.tone === 'ok');
      div.classList.toggle('is-bad', b.tone === 'bad');
    }
    fo.classList.toggle('is-on', !!b);
  }

  // ================================================================== Sorun: sınıf ağacı
  const NODE = { w: 296, h: 66 };
  const POS = {
    StandartKargo: [480, 24],
    EkspresKargo: [160, 150],
    SigortaliKargo: [480, 150],
    SogukZincirliKargo: [800, 150],
    SigortaliEkspresKargo: [160, 276],
    SogukZincirliEkspresKargo: [480, 276],
    SigortaliSogukZincirliKargo: [800, 276],
    SigortaliSogukZincirliEkspresKargo: [480, 402],
  };
  const WIDE = { SigortaliSogukZincirliEkspresKargo: 400 }; // tek başına duran en uzun ad
  const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';

  /** Sağ altta: seçenek sayısı → sınıf sayısı (2ⁿ) çubukları; n = şu anki seçenek sayısı */
  function growth(n) {
    const rows = [1, 2, 3, 4, 5, 6]
      .map((k, i) => {
        const c = Math.pow(2, k);
        const y = 20 + i * 18;
        const w = Math.max(5, (c / 64) * 190);
        return `<g class="dl-gr${k === n ? ' is-on' : ''}${k > n ? ' is-future' : ''}"><text class="dl-gr-k" x="0" y="${y + 10}">${k}</text><rect x="16" y="${y}" width="${w}" height="12" rx="6"/><text class="dl-gr-v" x="${22 + w}" y="${y + 10}">${c}</text></g>`;
      })
      .join('');
    return `<text class="dl-gr-t" x="0" y="8">seçenek → sınıf</text>${rows}`;
  }

  class Lattice {
    constructor(root) {
      this.el = DP.h('div', { class: 'fm-stage dc-lattice' });
      root.appendChild(this.el);
      this.el.innerHTML = `
<svg class="fm-svg dc-svg" viewBox="0 0 960 548" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Kombinasyon sınıflarının kalıtım ağacı">
  <rect class="dc-bg" x="-1500" y="-1500" width="4000" height="4000"/>
  <g class="dl-count"><text class="dl-count-n" x="24" y="66" data-k="count-n">2</text><text class="dl-count-t" x="24" y="92">sınıf</text><text class="dl-count-f" x="24" y="116" data-k="count-f"></text></g>
  <g class="dl-growth" data-k="growth" transform="translate(706,362)"></g>
  <g data-k="edges"></g>
  <g data-k="nodes"></g>
  <foreignObject class="bubble-fo" data-k="b-banner" x="120" y="490" width="720" height="48"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble dc-banner"></div></foreignObject>
</svg>`;
      this.k = {};
      DP.$$('[data-k]', this.el).forEach((n) => (this.k[n.getAttribute('data-k')] = n));
    }

    /**
     * st: {v: 'v1'..'v4', hl: {cls: 'dup'|'ok'|'bad'}, banner}
     */
    render(st, prev, o) {
      const anim = !!(o && o.animate);
      prev = prev || {};
      const out = DC.naiveOutput(st.v);
      const list = DC.NAIVE.slice(0, DC.naiveCount[st.v]);
      const had = new Set(prev.v ? DC.NAIVE.slice(0, DC.naiveCount[prev.v]).map((n) => n.cls) : []);
      const flag = (x, y, w, cls, text) => `<g class="dl-flag${cls}"><rect x="${x + w - text.length * 7.2 - 26}" y="${y - 13}" width="${text.length * 7.2 + 22}" height="24" rx="12"/><text x="${x + w - text.length * 3.6 - 15}" y="${y + 3.5}" text-anchor="middle">${esc(text)}</text></g>`;
      const nodes = list
        .map((n, i) => {
          const [cx, y] = POS[n.cls];
          const w = WIDE[n.cls] || NODE.w;
          const x = cx - w / 2;
          const hl = (st.hl || {})[n.cls];
          const fresh = anim && !had.has(n.cls);
          const price = out[i].t.split(' = ')[1];
          const chips = n.opts.map((k) => `<tspan class="dl-chip dl-${k}">${DC.ADDONS[k].icon}</tspan>`).join(' ');
          return `<g class="dl-node${n.parent ? '' : ' is-root'}${hl ? ' is-' + hl : ''}${fresh ? ' is-new' : ''}" style="animation-delay:${fresh ? (i % 4) * 0.12 : 0}s">
            <rect class="dl-box" x="${x}" y="${y}" width="${w}" height="${NODE.h}" rx="11"/>
            <text class="dl-name" x="${x + 14}" y="${y + 27}">${esc(n.cls)}</text>
            <text class="dl-chips" x="${x + 14}" y="${y + 53}">${chips || '—'}</text>
            <text class="dl-price" x="${x + w - 14}" y="${y + 53}" text-anchor="end">${esc(price)}</text>
            ${hl === 'bad' ? flag(x, y, w, ' is-bad', '30 kaldı!') : ''}
            ${hl === 'ok' ? flag(x, y, w, ' is-ok', 'zam ✓ 35') : ''}
            ${hl === 'dup' ? flag(x, y, w, ' is-dup', 'sigorta kodu') : ''}
          </g>`;
        })
        .join('');
      const edges = list
        .filter((n) => n.parent)
        .map((n) => {
          const [cx, y] = POS[n.cls];
          const [px, py] = POS[n.parent];
          const y2 = py + NODE.h;
          const fresh = anim && !had.has(n.cls);
          return `<path class="dl-edge${fresh ? ' is-new' : ''}" d="M${cx} ${y} C ${cx} ${y - 34}, ${px} ${y2 + 36}, ${px} ${y2 + 10}" pathLength="100"/><polygon class="dl-tri" points="${px},${y2} ${px - 8},${y2 + 13} ${px + 8},${y2 + 13}"/>`;
        })
        .join('');
      this.k.nodes.innerHTML = nodes;
      this.k.edges.innerHTML = edges;
      const n = list.length;
      const opts = Math.round(Math.log2(n));
      this.k['count-n'].textContent = String(n);
      if (anim && prev.v && prev.v !== st.v) DP.flash(this.k['count-n'], 'is-bump');
      this.k['count-f'].textContent = `${opts} seçenek → 2${SUP[opts]}`;
      this.k.growth.innerHTML = growth(opts);
      banner(this.k['b-banner'], st.banner);
    }

    destroy() {
      this.el.remove();
    }
  }
  DC.Lattice = Lattice;

  // ================================================================== Katmanlar (matruşka)
  /**
   * Geometri: çekirdek kutusu (w×h, merkezi cx,cy), her katmanın kalınlığı (px yatay, py dikey),
   * görünüm kutusu ve bilgi balonunun yeri. Sahneler kendine göre ayarlar (DC.LAYOUT):
   * Canlı Akış iki katmanı büyük çizer, tezgâh beş katmanı sığdırır.
   */
  const GEOM = { w: 236, h: 110, cx: 480, cy: 250, px: 36, py: 30, view: '0 0 960 470', banner: 430, bx: 110, big: false };
  DC.LAYOUT = {
    flow: { w: 320, h: 140, cx: 520, cy: 250, px: 58, py: 48, view: '0 60 860 480', banner: 444, bx: 60, big: true },
    extend: { w: 280, h: 120, cx: 520, cy: 236, px: 52, py: 42, view: '0 44 880 486', banner: 438, bx: 70, big: true },
    counter: { w: 236, h: 116, cx: 520, cy: 250, px: 34, py: 28, view: '0 44 900 412', banner: 470, bx: 80, big: false },
  };

  class Layers {
    /** o: {geom: DC.LAYOUT.x, varName, cls} */
    constructor(root, o) {
      o = o || {};
      const G = (this.G = Object.assign({}, GEOM, o.geom || {}));
      this.uid = 'dly' + ++uidCounter;
      this.el = DP.h('div', { class: 'fm-stage dc-layers' + (G.big ? ' is-big' : '') + (o.cls ? ' ' + o.cls : '') });
      root.appendChild(this.el);
      const u = this.uid;
      this.varName = o.varName || 'hizmet';
      this.el.innerHTML = `
<svg class="fm-svg dc-svg" viewBox="${G.view}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Çekirdek gönderi ve onu saran dekoratör katmanları">
  <defs>
    <marker id="${u}-a" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="dk-mk" d="M0 0 L10 5 L0 10 z"/></marker>
  </defs>
  <rect class="dc-bg" x="-1500" y="-1500" width="4000" height="4000"/>
  <g data-k="rings"></g>
  <g data-k="core"></g>
  <g class="dk-var" data-k="var"><rect x="20" y="${G.cy - 18}" width="124" height="36" rx="18"/><text x="82" y="${G.cy + 6}" text-anchor="middle" data-k="var-t">${esc(this.varName)}</text></g>
  <path class="dk-var-arrow" data-k="var-arrow" d="" pathLength="100" marker-end="url(#${u}-a)"/>
  <g class="dk-probe is-call" data-k="call"><g class="dk-probe-in"><rect x="-60" y="-14" width="120" height="28" rx="14"/><text x="0" y="5" text-anchor="middle" data-k="call-t">ucret() ⟶</text></g></g>
  <g class="dk-probe is-ret" data-k="ret"><g class="dk-probe-in" data-k="ret-in"><rect x="-48" y="-14" width="96" height="28" rx="14"/><text x="0" y="5" text-anchor="middle" data-k="ret-t"></text></g></g>
  <foreignObject class="bubble-fo" data-k="b-banner" x="${G.bx}" y="${G.banner}" width="740" height="48"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble dc-banner"></div></foreignObject>
</svg>`;
      this.k = {};
      DP.$$('[data-k]', this.el).forEach((n) => (this.k[n.getAttribute('data-k')] = n));
    }

    /** i. katmanın dikdörtgeni (1 = çekirdeğe en yakın; 0 = çekirdeğin kendisi) */
    ringRect(i) {
      const G = this.G;
      return { x: G.cx - G.w / 2 - G.px * i, y: G.cy - G.h / 2 - G.py * i, w: G.w + G.px * 2 * i, h: G.h + G.py * 2 * i };
    }

    /** Katmanın sol üstündeki etiket: simge, sınıf adı, ücret etkisi */
    _tab(r, a, fee) {
      const big = this.G.big;
      const cw = big ? 9.1 : 8.4; // eş aralıklı yazıda karakter genişliği
      const th = big ? 26 : 22;
      const w = a.cls.length * cw + (big ? 86 : 76);
      const ty = r.y + (big ? 7 : 5);
      return `<g class="dk-tab"><rect x="${r.x + 14}" y="${ty}" width="${w}" height="${th}" rx="${th / 2}"/>
        <text x="${r.x + 26}" y="${ty + th / 2 + 5}">${a.icon} ${esc(a.cls)}</text>
        <text class="dk-fee" x="${r.x + 4 + w}" y="${ty + th / 2 + 5}" text-anchor="end">${esc(fee)}</text></g>`;
    }

    /** Çekirdeğin çizimi: koli ya da zarf */
    _coreArt(core) {
      const G = this.G;
      const x = G.cx - G.w / 2;
      const y = G.cy - G.h / 2;
      const my = G.cy - G.h * 0.1; // simge ve yazının dikey ortası (alt bant jetona kalır)
      const c = DC.CORES[core];
      const icon =
        core === 'zarf'
          ? `<g class="dk-zarf" transform="translate(${x + 20},${my - 20})"><rect x="0" y="0" width="58" height="40" rx="4"/><path d="M1 2 L29 22 L57 2"/></g>`
          : `<g class="dk-koli" transform="translate(${x + 20},${my - 28})"><path class="bx-top" d="M0 12 L10 2 H60 L50 12 Z"/><path class="bx-side" d="M50 12 L60 2 V44 L50 54 Z"/><rect class="bx-front" x="0" y="12" width="50" height="42" rx="2"/><path class="bx-tape-v" d="M21 12 H29 V54 H21 Z"/></g>`;
      return `<g class="dk-core">
      <rect class="dk-core-bg" x="${x}" y="${y}" width="${G.w}" height="${G.h}" rx="12"/>
      ${icon}
      <text class="dk-core-t" x="${x + 96}" y="${my - 4}">${esc(c.cls)}</text>
      <text class="dk-core-s" x="${x + 96}" y="${my + 19}">çekirdek · ${c.fee} TL</text>
    </g>`;
    }

    /**
     * st: {core, layers: [içten dışa], active: katman sırası (0 = çekirdek), probe: {at, phase:'call'|'return', value, text},
     *      ghost: henüz yazılmamış dış katman (ek hizmet anahtarı), banner, varName}
     */
    render(st, prev, o) {
      const anim = !!(o && o.animate);
      const G = this.G;
      prev = prev || {};
      const L = st.layers || [];
      const PL = prev.layers || [];
      const n = L.length;
      const trace = DC.trace(st.core, L);

      // ---- katmanlar: en dıştaki önce çizilir (içtekiler üstte kalsın)
      let rings = '';
      if (st.ghost) {
        // henüz yazılmamış katman: kesik çizgili, soru işaretli
        const r = this.ringRect(n + 1);
        rings += `<g class="dk-ring dl-${st.ghost} is-ghost">
          <rect class="dk-ring-bg" x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="${14 + (n + 1) * 4}"/>
          ${this._tab(r, DC.ADDONS[st.ghost], '?')}
        </g>`;
      }
      for (let i = n; i >= 1; i--) {
        const k = L[i - 1];
        const a = DC.ADDONS[k];
        const r = this.ringRect(i);
        // yeni ya da yeri değişen katman belirsin (içten dışa, sırayla)
        const fresh = anim && (PL[i - 1] !== k || prev.core !== st.core);
        const passing = st.probe && st.probe.phase === 'return' && st.probe.at === i;
        rings += `<g class="dk-ring dl-${k}${st.active === i ? ' is-active' : ''}${fresh ? ' is-new' : ''}${passing ? ' is-pass' : ''}" style="animation-delay:${fresh ? (i - 1) * 0.14 : 0}s">
          <rect class="dk-ring-bg" x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="${14 + i * 4}"/>
          ${this._tab(r, a, a.pct ? '× 0,9' : '+' + a.fee)}
        </g>`;
      }
      this.k.rings.innerHTML = rings;
      this.k.core.innerHTML = this._coreArt(st.core);
      this.k.core.classList.toggle('is-active', st.active === 0);
      if (anim && prev.core !== st.core) DP.flash(this.k.core, 'is-new');

      // ---- değişken: en dıştaki katmanı gösterir (etiket hep onun solunda durur)
      const outer = this.ringRect(n);
      const tagX = Math.max(20, outer.x - 190);
      this.k.var.setAttribute('transform', `translate(${tagX - 20},0)`);
      this.k['var-t'].textContent = st.varName || this.varName;
      this.k['var-arrow'].setAttribute('d', `M${tagX + 124} ${G.cy} H${outer.x - 4}`);
      if (anim && PL.length !== n) DP.flash(this.k['var-arrow'], 'is-draw');

      // ---- çağrı ve dönüş jetonları: ikisi de katmanın sol alt bandında durur.
      // Çağrı içeri (sağa-yukarı), değer dışarı, değişkene doğru (sola-aşağı) ilerler.
      const p = st.probe;
      const call = this.k.call;
      const ret = this.k.ret;
      call.classList.toggle('is-on', !!p && p.phase === 'call');
      ret.classList.toggle('is-on', !!p && p.phase === 'return');
      if (p) {
        const r = this.ringRect(p.at);
        const y = p.at === 0 ? G.cy + G.h / 2 - 19 : r.y + r.h - G.py / 2;
        if (p.phase === 'call') {
          this._move(call, `translate(${r.x + 74}px, ${y}px)`, anim, 'call');
          this.k['call-t'].textContent = p.text || 'ucret() ⟶';
        } else {
          const value = p.value != null ? p.value : trace[p.at];
          this._move(ret, `translate(${r.x + 62}px, ${y}px)`, anim, 'ret');
          this.k['ret-t'].textContent = '⟵ ' + value;
          if (anim) DP.flash(this.k['ret-in'], 'is-bump');
        }
      } else {
        this.lastPos = {};
      }
      banner(this.k['b-banner'], st.banner);
    }

    _move(el, pos, anim, key) {
      this.lastPos = this.lastPos || {};
      const was = this.lastPos[key];
      const moving = anim && was && was !== pos;
      if (moving) setTransform(el, was, false);
      setTransform(el, pos, moving);
      this.lastPos[key] = pos;
    }

    destroy() {
      this.el.remove();
    }
  }
  DC.Layers = Layers;
})();
