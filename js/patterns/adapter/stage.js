/*
 * Adapter — "Bağlantı tezgâhı" animasyon sahnesi (Sorun, Canlı Akış, Genişlet).
 *
 * Görsel dil: her arayüz bir yapboz bağlantısıdır.
 *   KargoFirmasi (Target)   → yuvarlak   · GlobalShipApi (Adaptee) → kare · EuroCargoClient → üçgen
 * İstemcinin sağ kenarında hedef arayüzün yuvası vardır; uyan parça "oturur", uymayan geri sekar.
 * Adaptör: solu yuvarlak (hedefe uyar), sağı kare (uyarlananı içine alır) bir ara parçadır.
 * Mesaj kartları parçaların üstünden geçer; adaptörde "çevrilir" (TR/kg ↔ EN/lb).
 *
 * Durum tabanlı çizim: render(state, prevState, {animate}) — geri/ileri adımlarda tutarlı.
 */
(function () {
  'use strict';
  const AD = DP.ad;
  const esc = DP.esc;
  const md = (t) => DP.md(t, AD.roleOf);
  const art = (AD.art = AD.art || {});
  let uidCounter = 0;

  // ================================================================== yapboz parçası
  /** Sağ kenar boyunca (yukarıdan aşağı) içe doğru bir yuva. */
  function notch(shape, x, ym, s) {
    if (shape === 'round') return ` V${ym - s} A${s} ${s} 0 0 0 ${x} ${ym + s}`;
    if (shape === 'tri') return ` V${ym - s} L${x - s - 8} ${ym} L${x} ${ym + s}`;
    if (shape === 'square') return ` V${ym - s} H${x - s - 4} V${ym + s} H${x}`;
    return '';
  }
  /** Sol kenar boyunca (aşağıdan yukarı) dışa doğru bir çıkıntı. */
  function tab(shape, x, ym, s) {
    if (shape === 'round') return ` V${ym + s} A${s} ${s} 0 0 1 ${x} ${ym - s}`;
    if (shape === 'tri') return ` V${ym + s} L${x - s - 8} ${ym} L${x} ${ym - s}`;
    if (shape === 'square') return ` V${ym + s} H${x - s - 4} V${ym - s} H${x}`;
    return '';
  }

  /**
   * Parçanın dış hattı. left/right: bağlantı şekli ('round' | 'square' | 'tri') ya da null.
   * conns: birden çok satıra yayılan parçada her satırın merkez y'si (soldaki çıkıntılar için).
   */
  art.piecePath = function (x, y, w, h, left, right, s, conns) {
    const r = 12;
    const x1 = x + w;
    const y1 = y + h;
    const centers = conns || [y + h / 2];
    let d = `M${x + r} ${y} H${x1 - r} Q${x1} ${y} ${x1} ${y + r}`;
    if (right) centers.forEach((ym) => (d += notch(right, x1, ym, s)));
    d += ` V${y1 - r} Q${x1} ${y1} ${x1 - r} ${y1} H${x + r} Q${x} ${y1} ${x} ${y1 - r}`;
    if (left) centers.slice().reverse().forEach((ym) => (d += tab(left, x, ym, s)));
    d += ` V${y + r} Q${x} ${y} ${x + r} ${y} Z`;
    return d;
  };

  /** Bağlantı şekli: arayüz → şekil */
  AD.SHAPE = { target: 'round', global: 'square', euro: 'tri' };

  /** Arayüz rozetleri (dil + birim) */
  const LANG = {
    tr: { text: 'TR · kg', cls: 'is-tr' },
    gs: { text: 'EN · lb', cls: 'is-en' },
    ec: { text: 'EN · g', cls: 'is-en' },
    trgs: { text: 'TR ⇄ EN', cls: 'is-mix' },
  };

  /**
   * Bir parça (SVG metni). o: {x, y, w, h, left, right, s, conns, role, title, sub, lines, lang, state, cls, ghost, patch}
   */
  art.piece = function (o) {
    const d = art.piecePath(o.x, o.y, o.w, o.h, o.left, o.right, o.s, o.conns);
    const lang = o.lang ? LANG[o.lang] : null;
    const big = o.h >= 220;
    const lines = (o.lines || [])
      .map((l, i) => `<text class="ap-line${l.cls ? ' ' + l.cls : ''}" x="${o.x + 16}" y="${o.y + (big ? 84 + i * 22 : 72 + i * 19)}">${esc(l.t)}</text>`)
      .join('');
    const cls = ['ap', 'rc', 'rc-' + AD.roles[o.role].color];
    if (o.state) cls.push('is-' + o.state);
    if (o.ghost) cls.push('is-ghost');
    if (o.cls) cls.push(o.cls);
    return `<g class="${cls.join(' ')}"${o.style ? ` style="${o.style}"` : ''}><g class="ap-in">
      <path class="ap-body" d="${d}"/>
      <path class="ap-head" d="M${o.x + 12} ${o.y} H${o.x + o.w - 12} Q${o.x + o.w} ${o.y} ${o.x + o.w} ${o.y + 12} V${o.y + 34} H${o.x} V${o.y + 12} Q${o.x} ${o.y} ${o.x + 12} ${o.y} Z"/>
      <text class="ap-title" x="${o.x + 16}" y="${o.y + 23}">${esc(o.title)}</text>
      ${o.sub ? `<text class="ap-sub" x="${o.x + 16}" y="${o.y + (big ? 56 : 52)}">${esc(o.sub)}</text>` : ''}
      ${lang ? `<g class="ap-lang ${lang.cls}"><rect x="${o.x + o.w - 22 - lang.text.length * 7.4}" y="${o.y + 8}" width="${lang.text.length * 7.4 + 12}" height="19" rx="9.5"/><text x="${o.x + o.w - 16 - (lang.text.length * 7.4) / 2}" y="${o.y + 22}" text-anchor="middle">${esc(lang.text)}</text></g>` : ''}
      ${lines}
      ${o.extra || ''}
    </g></g>`;
  };

  // ================================================================== sahne
  const X = { client: 24, cw: 240, aw: 370, pw: 270 };
  X.c1 = X.client + X.cw; // istemcinin sağ kenarı (yuva)
  X.a1 = X.c1 + X.aw; // adaptörün sağ kenarı
  AD.STAGE_X = X;

  /** Satır düzeni: N satır için merkez y ve yükseklik */
  function layout(n) {
    if (n <= 1) return [{ cy: 262, h: 236 }];
    if (n === 2) return [{ cy: 140, h: 132 }, { cy: 318, h: 132 }];
    return [{ cy: 112, h: 104 }, { cy: 246, h: 104 }, { cy: 380, h: 104 }];
  }
  AD.stageLayout = layout;

  const KIND = {
    native: { role: 'native', shape: 'round', lang: 'tr' },
    global: { role: 'adaptee', shape: 'square', lang: 'gs' },
    euro: { role: 'adaptee', shape: 'tri', lang: 'ec' },
  };

  /** Satırdaki parçaların x konumları (bağlantı kipine göre). */
  function xs(row) {
    const hasAd = row.link === 'adapter' || row.link === 'gap';
    const px = hasAd ? X.a1 : row.link === 'reject' ? X.c1 + 70 : X.c1;
    return { ax: X.c1, px, pc: px + X.pw / 2, ac: X.c1 + X.aw / 2, cc: X.client + X.cw / 2 };
  }

  class AdStage {
    constructor(root, o) {
      o = o || {};
      this.uid = 'ads' + ++uidCounter;
      this.el = DP.h('div', { class: 'fm-stage ad-stage' + (o.cls ? ' ' + o.cls : '') });
      root.appendChild(this.el);
      const u = this.uid;
      this.el.innerHTML = `
<svg class="fm-svg ad-svg" viewBox="${o.view || '0 0 960 470'}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Bağlantı tezgâhı: istemci, adaptör ve uyarlanan kütüphane">
  <defs>
    <pattern id="${u}-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path class="ad-grid" d="M24 0 H0 V24"/></pattern>
  </defs>
  <rect class="ad-bg" x="-1500" y="-1500" width="4000" height="4000"/>
  <rect x="-1500" y="-1500" width="4000" height="4000" fill="url(#${u}-grid)"/>
  <g class="ad-world" data-k="world">
    <g data-k="pieces"></g>
    <g data-k="marks"></g>
    <g class="ad-msg" data-k="msg"><g class="ad-msg-in" data-k="msg-in"><rect data-k="msg-bg" x="0" y="-15" width="100" height="30" rx="15"/><text data-k="msg-t" x="50" y="5" text-anchor="middle"></text></g></g>
  </g>
  <foreignObject class="bubble-fo" data-k="b-banner" x="120" y="396" width="720" height="70"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble ad-banner"></div></foreignObject>
</svg>`;
      this.k = {};
      DP.$$('[data-k]', this.el).forEach((n) => (this.k[n.getAttribute('data-k')] = n));
      this.prevMsgPos = null;
    }

    /**
     * st: {rows: [{client, link, adapter, provider, active, patch}], msg: {row, at, text, lang, back}, banner: {text, tone}}
     *   link    : 'snap' (uyuyor) · 'reject' (uymuyor) · 'patch' (istemci yamalandı) · 'gap' (adaptör yeri boş) · 'adapter'
     *   client  : {name, sub, lines}
     *   adapter : {name, sub, display: [{a, b, state:'on'|'done'}], line}
     *   provider: {id, kind:'native'|'global'|'euro', name, sub, lines}
     *   patch   : {ok, text} — istemcinin üstüne yapıştırılmış çeviri kodu (kalıpsız çözüm)
     */
    render(st, prev, o) {
      const anim = !!(o && o.animate);
      prev = prev || {};
      const rows = st.rows || [];
      const L = layout(rows.length);
      const prevRows = new Map((prev.rows || []).map((r) => [r.id, r]));
      const parts = [];
      const marks = [];

      // ---- istemciler, adaptörler
      rows.forEach((row, i) => {
        const g = L[i];
        const top = g.cy - g.h / 2;
        const s = g.h >= 180 ? 22 : g.h >= 120 ? 18 : 15;
        const p = xs(row);
        const was = prevRows.get(row.id);
        const kind = KIND[row.provider.kind];
        const rightShape = row.link === 'patch' ? kind.shape : AD.SHAPE.target;
        const big = g.h >= 180;
        const patch = row.patch
          ? `<g class="ap-patch${row.patch.ok ? '' : ' is-bad'}"><rect x="${X.client + 12}" y="${top + g.h - 38}" width="${X.cw - 48}" height="28" rx="4"/><text x="${X.client + 20}" y="${top + g.h - 19}">${esc(row.patch.text)}</text></g>
             <path class="ap-tape" d="M${X.c1 - 34} ${g.cy - s - 12} L${X.c1 + 6} ${g.cy - s + 2} M${X.c1 - 34} ${g.cy + s + 12} L${X.c1 + 6} ${g.cy + s - 2}"/>`
          : '';
        parts.push(
          art.piece({
            x: X.client,
            y: top,
            w: X.cw,
            h: g.h,
            right: rightShape,
            s,
            role: 'client',
            title: row.client.name,
            sub: row.client.sub || (row.link === 'patch' ? 'İstemci · yabancı API’yi öğrendi' : 'İstemci'),
            lines: big ? row.client.lines || [] : [],
            lang: 'tr',
            ghost: !!row.ghostClient,
            state: row.active === 'c' ? 'active' : row.link === 'patch' ? 'patched' : null,
            cls: anim && (!was || was.ghostClient) && !row.ghostClient ? 'is-entering' : '',
            extra: patch + (row.link === 'patch' ? '' : `<text class="ap-port" x="${X.c1 - 10}" y="${g.cy + s + 17}" text-anchor="end">KargoFirmasi</text>`),
          })
        );
        if (row.link === 'adapter' || row.link === 'gap') {
          const ad = row.adapter || {};
          const ghost = row.link === 'gap';
          const disp = big && ad.display ? displaySvg(ad.display, X.c1 + 16, top + 76, g.h >= 220) : ad.line ? `<text class="ap-line" x="${X.c1 + 16}" y="${top + g.h - 18}">${esc(ad.line)}</text>` : '';
          const fresh = anim && (!was || was.link !== 'adapter') && !ghost;
          parts.push(
            art.piece({
              x: X.c1,
              y: top,
              w: X.aw,
              h: g.h,
              left: AD.SHAPE.target,
              right: kind.shape,
              s,
              role: 'adapter',
              title: ghost ? '?' : ad.name,
              sub: ghost ? 'burada ne olmalı?' : ad.sub || 'Adaptör',
              lang: ghost ? null : row.provider.kind === 'euro' ? null : 'trgs',
              ghost,
              state: row.active === 'a' ? 'active' : null,
              cls: fresh ? 'is-dropping' : '',
              extra: ghost ? '' : disp,
            })
          );
        }
        if (row.link === 'reject') {
          marks.push(`<g class="ad-reject"><circle cx="${X.c1 + 34}" cy="${g.cy}" r="22"/><path d="M${X.c1 + 24} ${g.cy - 10} L${X.c1 + 44} ${g.cy + 10} M${X.c1 + 44} ${g.cy - 10} L${X.c1 + 24} ${g.cy + 10}"/>
            <text x="${X.c1 + 34}" y="${top - 12}" text-anchor="middle">uyumsuz arayüz!</text></g>`);
        }
      });

      // ---- sağlayıcılar (aynı nesneyi kullanan ardışık satırlar tek, uzun parça olur)
      for (let i = 0; i < rows.length; ) {
        let j = i;
        const px = xs(rows[i]).px;
        while (j + 1 < rows.length && rows[j + 1].provider.id === rows[i].provider.id && xs(rows[j + 1]).px === px) j++;
        const row = rows[i];
        const kind = KIND[row.provider.kind];
        const top = L[i].cy - L[i].h / 2;
        const bottom = L[j].cy + L[j].h / 2;
        const s = L[i].h >= 180 ? 22 : L[i].h >= 120 ? 18 : 15;
        const was = prevRows.get(row.id);
        const reject = row.link === 'reject';
        const fresh = anim && (!was || was.provider.id !== row.provider.id);
        parts.push(
          art.piece({
            x: px,
            y: top,
            w: X.pw,
            h: bottom - top,
            left: kind.shape,
            s,
            conns: rows.slice(i, j + 1).map((r, k) => L[i + k].cy),
            role: kind.role,
            title: row.provider.name,
            sub: row.provider.sub,
            lines: L[i].h >= 180 || j > i ? row.provider.lines || [] : [],
            lang: kind.lang,
            ghost: rows.slice(i, j + 1).every((r) => r.ghostProvider),
            state: rows.slice(i, j + 1).some((r) => r.active === 'p') ? 'active' : null,
            cls: (reject && anim && !(was && was.link === 'reject') ? 'is-bumping' : '') + ((fresh || (anim && was && was.ghostProvider && !row.ghostProvider)) && !reject && !row.ghostProvider ? ' is-entering' : ''),
          })
        );
        i = j + 1;
      }
      this.el.classList.toggle('is-one', rows.length === 1);
      this.k.pieces.innerHTML = parts.join('');
      this.k.marks.innerHTML = marks.join('');
      // Adaptör yoksa (istemci + sağlayıcı) kompozisyonu yatayda ortala
      const anyAdapter = rows.some((r) => r.link === 'adapter' || r.link === 'gap');
      const usedW = X.cw + X.pw + (rows.some((r) => r.link === 'reject') ? 70 : 0);
      const shift = anyAdapter ? 0 : Math.round((960 - usedW) / 2 - X.client);
      setTransform(this.k.world, `translate(${shift}px, 0px)`, anim && this.shift != null && this.shift !== shift);
      this.shift = shift;

      // ---- mesaj kartı
      this._renderMsg(st.msg, rows, L, anim);
      // ---- alt bant
      const fo = this.k['b-banner'];
      const b = st.banner;
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

    _renderMsg(m, rows, L, anim) {
      const k = this.k;
      k.msg.classList.toggle('is-on', !!m);
      if (!m) {
        this.prevMsgPos = null;
        return;
      }
      const row = rows[m.row || 0];
      const g = L[m.row || 0];
      const p = xs(row);
      const cx = m.at === 'c' ? p.cc : m.at === 'a' ? p.ac : p.pc;
      const text = (m.back ? '⟵ ' : '') + m.text + (m.back ? '' : ' ⟶');
      const w = Math.max(90, text.length * (rows.length === 1 ? 8.4 : 7.7) + 30);
      const y = g.cy - g.h / 2 - (rows.length >= 3 ? 15 : 24); // üç satırda iki satırın arasındaki boşluğa otursun
      k['msg-t'].textContent = text;
      k['msg-t'].setAttribute('x', String(w / 2));
      k['msg-bg'].setAttribute('width', String(w));
      k.msg.setAttribute('class', 'ad-msg is-on ' + (m.lang === 'en' ? 'is-en' : 'is-tr') + (m.tone ? ' is-' + m.tone : ''));
      const pos = `translate(${Math.round(cx - w / 2)}px, ${Math.round(y)}px)`;
      const moved = anim && this.prevMsgPos && this.prevMsgPos !== pos;
      if (moved) {
        setTransform(k.msg, this.prevMsgPos, false);
        void k.msg.getBoundingClientRect();
      }
      setTransform(k.msg, pos, moved);
      if (anim && (!this.prevMsgPos || moved)) DP.flash(k['msg-in'], 'is-pop');
      this.prevMsgPos = pos;
    }

    destroy() {
      this.el.remove();
    }
  }

  /** Adaptörün çeviri tablosu: [{a, b, state}] */
  function displaySvg(rows, x, y, big) {
    const step = big ? 31 : 27;
    const rh = big ? 27 : 23;
    const ax = big ? 152 : 138;
    const bx = big ? 168 : 152;
    return (
      `<text class="ad-disp-h" x="${x}" y="${y}">çeviri tablosu</text>` +
      rows
        .map(
          (r, i) => `<g class="ad-disp${r.state ? ' is-' + r.state : ''}">
            <rect x="${x - 6}" y="${y + 8 + i * step}" width="${X.aw - 40}" height="${rh}" rx="6"/>
            <text class="ad-disp-a" x="${x}" y="${y + 8 + rh - 8 + i * step}">${esc(r.a)}</text>
            <text class="ad-disp-arr" x="${x + ax}" y="${y + 8 + rh - 8 + i * step}" text-anchor="middle">${r.dir || '→'}</text>
            <text class="ad-disp-b" x="${x + bx}" y="${y + 8 + rh - 8 + i * step}">${esc(r.b)}</text></g>`
        )
        .join('')
    );
  }
  AD.displaySvg = displaySvg;

  /** CSS dönüşümünü uygular; animasyon yoksa geçişi o an için kapatır. */
  function setTransform(el, value, anim) {
    if (!anim) el.style.transition = 'none';
    el.style.transform = value;
    if (!anim) {
      void el.getBoundingClientRect();
      el.style.transition = '';
    }
  }

  AD.Stage = AdStage;

  // ================================================================== hazır parçalar (sahneler ortak kullanır)
  AD.P = {
    hizli: { id: 'hk', kind: 'native', name: 'HizliKargo', sub: 'Yurt içi · arayüze uyar', lines: [{ t: 'gonderiOlustur(…)', cls: 'is-tgt' }, { t: 'durumSorgula(…)', cls: 'is-tgt' }] },
    global: { id: 'gs', kind: 'global', name: 'GlobalShipApi', sub: 'Uyarlanan · üçüncü parti', lines: [{ t: 'createShipment(req): long', cls: 'is-ade' }, { t: 'trackStatus(id): int', cls: 'is-ade' }] },
    euro: { id: 'ec', kind: 'euro', name: 'EuroCargoClient', sub: 'Uyarlanan · üçüncü parti', lines: [{ t: 'book(route, grams)', cls: 'is-ade' }, { t: 'isDelivered(code)', cls: 'is-ade' }] },
  };
  AD.C = {
    gonderi: { name: 'GonderiServisi', lines: [{ t: 'firma.gonderiOlustur(…)', cls: 'is-tgt' }, { t: 'firma.durumSorgula(…)', cls: 'is-tgt' }] },
    iade: { name: 'IadeServisi', lines: [{ t: 'firma.gonderiOlustur(…)', cls: 'is-tgt' }] },
  };
  // Sol sütun bizim dilimiz (hedef arayüz), sağ sütun onların; ok çevirinin yönünü gösterir.
  AD.DISPLAY = [
    { a: 'gonderiOlustur(…)', b: 'createShipment(req)', dir: '→' },
    { a: '12 kg', b: '26.46 lb', dir: '→' },
    { a: '"GS-48213"', b: '48213', dir: '←' },
    { a: '"Yolda"', b: '2', dir: '←' },
  ];
  /** Çeviri tablosu: on → o satır şimdi çalışıyor; done → önceki satırlar tamamlandı */
  AD.display = (on, doneUpTo) => AD.DISPLAY.map((r, i) => Object.assign({}, r, { state: i === on ? 'on' : i <= (doneUpTo == null ? -1 : doneUpTo) ? 'done' : null }));
})();
