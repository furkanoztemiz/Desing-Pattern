/*
 * Bridge — animasyon sahneleri.
 *   BR.Matrix : "Sorun" — her (etiket türü × yazıcı) eşleşmesi bir sınıf. Yeni bir etiket türü bir satır,
 *               yeni bir yazıcı bir sütun dolusu sınıf demek; Zebra'nın ^CI28 düzeltmesi bir hücrede unutulur.
 *   BR.Bridge : "Canlı Akış", "Tezgâh", "Genişlet" — solda soyutlama (etiket nesnesi), sağda gerçekleştirici
 *               (yazıcı nesnesi), arada köprü (yazici alanı). İlkel çağrılar köprüden geçer, cihazın diline çevrilir
 *               ve basılan etiket adım adım oluşur.
 *
 * Durum tabanlı çizim: render(state, prevState, {animate}) — geri/ileri adımlarda tutarlı.
 */
(function () {
  'use strict';
  const BR = DP.br;
  const esc = DP.esc;
  const md = (t) => DP.md(t, BR.roleOf);

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

  // ------------------------------------------------------------------ küçük simgeler
  /** Yazıcı simgesi (sol üst köşe x, y; yaklaşık 40 × 34) */
  BR.icon = function (printer, x, y) {
    const t = `transform="translate(${x},${y})"`;
    if (printer === 'zebra')
      return `<g class="bri bri-zebra" ${t}><rect class="bri-body" x="0" y="8" width="40" height="22" rx="4"/><rect class="bri-slot" x="6" y="13" width="28" height="3" rx="1.5"/><path class="bri-paper" d="M9 30 H31 V38 H9 Z"/><path class="bri-lid" d="M4 8 L10 1 H30 L36 8 Z"/></g>`;
    if (printer === 'pdf')
      return `<g class="bri bri-pdf" ${t}><path class="bri-paper" d="M6 0 H26 L36 10 V38 H6 Z"/><path class="bri-fold" d="M26 0 V10 H36"/><rect class="bri-badge" x="0" y="20" width="30" height="13" rx="3"/><text x="15" y="30.5" text-anchor="middle">PDF</text></g>`;
    if (printer === 'termal')
      return `<g class="bri bri-termal" ${t}><rect class="bri-body" x="9" y="0" width="22" height="38" rx="5"/><rect class="bri-screen" x="13" y="5" width="14" height="10" rx="2"/><path class="bri-paper" d="M13 -6 H27 V0 H13 Z"/><circle class="bri-key" cx="16" cy="22" r="2"/><circle class="bri-key" cx="24" cy="22" r="2"/><circle class="bri-key" cx="16" cy="30" r="2"/><circle class="bri-key" cx="24" cy="30" r="2"/></g>`;
    return `<g class="bri bri-html" ${t}><rect class="bri-body" x="0" y="4" width="40" height="30" rx="4"/><path class="bri-bar" d="M0 12 H40"/><circle cx="5" cy="8" r="1.6"/><circle cx="10" cy="8" r="1.6"/><path class="bri-code" d="M14 18 L9 23 L14 28 M26 18 L31 23 L26 28"/></g>`;
  };

  // ================================================================== Sorun: eşleşme matrisi
  const MCOL = { zebra: 214, pdf: 462, termal: 710 };
  const MROW = { standart: 140, kirilacak: 244, iade: 348 };
  const CW = 236;
  const CH = 84;

  class Matrix {
    constructor(root) {
      this.el = DP.h('div', { class: 'fm-stage br-matrix' });
      root.appendChild(this.el);
      this.el.innerHTML = `
<svg class="fm-svg br-svg" viewBox="0 0 960 548" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Etiket türü ile yazıcının her eşleşmesi için ayrı bir sınıf">
  <rect class="br-bg" x="-1500" y="-1500" width="4000" height="4000"/>
  <g class="bm-count"><text class="bm-count-n" x="24" y="66" data-k="count-n">2</text><text class="bm-count-t" x="24" y="92">sınıf</text><text class="bm-count-f" x="24" y="116" data-k="count-f"></text></g>
  <g data-k="heads"></g>
  <g data-k="cells"></g>
  <foreignObject class="bubble-fo" data-k="b-banner" x="120" y="470" width="720" height="52"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble br-banner"></div></foreignObject>
</svg>`;
      this.k = {};
      DP.$$('[data-k]', this.el).forEach((n) => (this.k[n.getAttribute('data-k')] = n));
    }

    /** st: {v: 'v1'..'v4', hl: {'etiket.yazıcı': 'dup'|'ok'|'bad'}, banner} */
    render(st, prev, o) {
      const anim = !!(o && o.animate);
      prev = prev || {};
      const V = BR.NV[st.v];
      const PV = prev.v ? BR.NV[prev.v] : { cols: [], rows: [] };
      const flag = (x, y, w, cls, text) => `<g class="bm-flag${cls}"><rect x="${x + w - text.length * 7.2 - 24}" y="${y - 13}" width="${text.length * 7.2 + 20}" height="24" rx="12"/><text x="${x + w - text.length * 3.6 - 14}" y="${y + 3.5}" text-anchor="middle">${esc(text)}</text></g>`;

      let heads = '';
      V.cols.forEach((p) => {
        const P = BR.PRINTERS[p];
        const x = MCOL[p];
        const fresh = anim && !PV.cols.includes(p);
        heads += `<g class="bm-head is-col${fresh ? ' is-new' : ''}">
          ${BR.icon(p, x + 10, 52)}
          <text class="bm-head-t" x="${x + 62}" y="${70}">${esc(P.name)}</text>
          <text class="bm-head-s" x="${x + 62}" y="${92}">${esc(P.dialect)} · ${esc(P.where)}</text>
        </g>`;
      });
      V.rows.forEach((l) => {
        const L = BR.LABELS[l];
        const y = MROW[l];
        const fresh = anim && !PV.rows.includes(l);
        heads += `<g class="bm-head is-row${fresh ? ' is-new' : ''}">
          <path class="bm-tag" d="M24 ${y + 22} L36 ${y + 10} H186 V${y + 74} H36 L24 ${y + 62} Z"/>
          <circle class="bm-tag-hole" cx="38" cy="${y + 42}" r="4"/>
          <text class="bm-head-t" x="52" y="${y + 40}">${esc(L.name)}</text>
          <text class="bm-head-s" x="52" y="${y + 61}">etiket</text>
        </g>`;
      });
      this.k.heads.innerHTML = heads;

      let cells = '';
      let i = 0;
      V.rows.forEach((l) => {
        V.cols.forEach((p) => {
          const name = BR.naiveName(st.v, l, p);
          const had = PV.rows.includes(l) && PV.cols.includes(p);
          const renamed = anim && had && BR.naiveName(prev.v, l, p) !== name;
          const fresh = anim && !had;
          const hl = (st.hl || {})[l + '.' + p];
          const x = MCOL[p];
          const y = MROW[l];
          const sub =
            hl === 'bad'
              ? `<text class="bm-sub is-bad" x="${x + 14}" y="${y + 62}">basılan: ${esc(BR.MOJIBAKE[BR.G[BR.LABELS[l].g].alici] || '?')}</text>`
              : `<g class="bm-chips"><rect class="bm-chip is-abs" x="${x + 12}" y="${y + 46}" width="${BR.LABELS[l].name.length * 7.6 + 18}" height="22" rx="11"/><text class="bm-chip-t is-abs" x="${x + 21}" y="${y + 61}">${esc(BR.LABELS[l].name)}</text>
                 <rect class="bm-chip is-imp" x="${x + 36 + BR.LABELS[l].name.length * 7.6}" y="${y + 46}" width="${BR.PRINTERS[p].dialect.length * 7.6 + 18}" height="22" rx="11"/><text class="bm-chip-t is-imp" x="${x + 45 + BR.LABELS[l].name.length * 7.6}" y="${y + 61}">${esc(BR.PRINTERS[p].dialect)}</text></g>`;
          cells += `<g class="bm-cell${hl ? ' is-' + hl : ''}${fresh ? ' is-new' : ''}${renamed ? ' is-renamed' : ''}" style="animation-delay:${fresh ? (i % 5) * 0.1 : 0}s">
            <rect class="bm-box" x="${x}" y="${y}" width="${CW}" height="${CH}" rx="11"/>
            <text class="bm-name" x="${x + 14}" y="${y + 31}">${esc(name)}</text>
            ${sub}
            ${hl === 'bad' ? flag(x, y, CW, ' is-bad', '^CI28 yok!') : ''}
            ${hl === 'ok' ? flag(x, y, CW, ' is-ok', '^CI28 ✓') : ''}
            ${hl === 'dup' ? flag(x, y, CW, ' is-dup', 'uyarı kodu') : ''}
          </g>`;
          i++;
        });
      });
      this.k.cells.innerHTML = cells;

      const n = V.rows.length * V.cols.length;
      this.k['count-n'].textContent = String(n);
      if (anim && prev.v && prev.v !== st.v) DP.flash(this.k['count-n'], 'is-bump');
      this.k['count-f'].textContent = `${V.rows.length} etiket × ${V.cols.length} yazıcı`;
      banner(this.k['b-banner'], st.banner);
    }

    destroy() {
      this.el.remove();
    }
  }
  BR.Matrix = Matrix;

  // ================================================================== Köprü sahnesi
  const AX = 14; // soyutlama kartı
  const AW = 302;
  const DX = 676; // gerçekleştirici kartı
  const DW = 270;
  const ROW0 = 188;
  const ROWH = 28;
  const PS = 2.5; // önizleme: 1 mm = 2,5 px
  const PV = { x: 683, y: 262, w: 250, h: 150 }; // basılan etiketin yeri

  /** Barkod çubukları: veriden belirlenimli (her seferinde aynı desen) */
  function bars(x, y, w, h, data) {
    let s = 0;
    for (const ch of data) s = (s * 31 + ch.charCodeAt(0)) % 9973;
    let out = '';
    let cx = x;
    let i = 0;
    while (cx < x + w - 3) {
      s = (s * 7 + 13 + i) % 9973;
      const bw = 1 + (s % 3);
      out += `<rect x="${cx.toFixed(1)}" y="${y}" width="${bw}" height="${h}"/>`;
      cx += bw + 1 + ((s >> 3) % 3);
      i++;
    }
    return `<g class="bp-bars">${out}</g>`;
  }

  const resolve = (x, g) => (typeof x === 'string' ? x : typeof x === 'number' ? x : g[x.f]);

  /** Basılan çıktı: ilk n ilkel çağrının cihazdaki görünümü */
  function preview(printer, label, n, finished, newest) {
    const g = BR.G[BR.LABELS[label].g];
    const prims = BR.prims(label).slice(0, n);
    if (!prims.length) return '';
    const isNew = (i) => (i === newest ? ' is-new' : '');
    const els = [];
    if (printer === 'termal') {
      // fiş: konum yok, satır satır
      const x = PV.x + 55;
      let y = PV.y + 16;
      prims.forEach((r, i) => {
        if (r.p === 'yazi') {
          els.push(`<text class="bp-txt${r.a[2] === 'KIRILACAK' ? ' is-strong' : ''}${isNew(i)}" x="${x + 10}" y="${y + 12}">${esc(resolve(r.a[2], g))}</text>`);
          y += 20;
        } else if (r.p === 'barkod') {
          els.push(`<g class="bp-code${isNew(i)}">${bars(x + 10, y + 2, 118, 24, resolve(r.a[2], g))}<text class="bp-small" x="${x + 69}" y="${y + 38}" text-anchor="middle">${esc(resolve(r.a[2], g))}</text></g>`);
          y += 44;
        } else if (r.p === 'cerceve') {
          els.push(`<path class="bp-dash${isNew(i)}" d="M${x + 8} ${y + 6} H${x + 132}"/>`);
          y += 14;
        }
      });
      const bottom = Math.max(y + 10, PV.y + 120);
      const edge = finished ? `L${x + 140} ${bottom} ` + Array.from({ length: 10 }, (_, k) => `L${x + 140 - 14 * k - 7} ${bottom + 6} L${x + 140 - 14 * (k + 1)} ${bottom}`).join(' ') : `L${x + 140} ${bottom} L${x} ${bottom}`;
      return `<g class="bp bp-termal${finished ? ' is-done' : ''}"><path class="bp-paper" d="M${x} ${PV.y} H${x + 140} ${edge} Z"/>${els.join('')}</g>`;
    }
    const ox = PV.x;
    const oy = printer === 'html' ? PV.y + 22 : PV.y;
    prims.forEach((r, i) => {
      if (r.p === 'cerceve') els.push(`<rect class="bp-frame${isNew(i)}" x="${ox + r.a[0] * PS}" y="${oy + r.a[1] * PS}" width="${r.a[2] * PS}" height="${r.a[3] * PS}" rx="3"/>`);
      if (r.p === 'yazi') els.push(`<text class="bp-txt${r.a[2] === 'KIRILACAK' ? ' is-strong' : ''}${isNew(i)}" x="${ox + r.a[0] * PS}" y="${oy + r.a[1] * PS + 13}">${esc(resolve(r.a[2], g))}</text>`);
      if (r.p === 'barkod') els.push(`<g class="bp-code${isNew(i)}">${bars(ox + r.a[0] * PS, oy + r.a[1] * PS + 3, 104, 24, resolve(r.a[2], g))}<text class="bp-small" x="${ox + r.a[0] * PS + 52}" y="${oy + r.a[1] * PS + 40}" text-anchor="middle">${esc(resolve(r.a[2], g))}</text></g>`);
    });
    let paper;
    if (printer === 'zebra') paper = `<rect class="bp-roll" x="${PV.x - 6}" y="${PV.y - 8}" width="${PV.w + 12}" height="${PV.h + 16}" rx="4"/><rect class="bp-paper" x="${PV.x}" y="${PV.y}" width="${PV.w}" height="${PV.h}" rx="9"/>`;
    else if (printer === 'pdf') paper = `<path class="bp-paper" d="M${PV.x} ${PV.y} H${PV.x + PV.w - 18} L${PV.x + PV.w} ${PV.y + 18} V${PV.y + PV.h} H${PV.x} Z"/><path class="bp-fold" d="M${PV.x + PV.w - 18} ${PV.y} V${PV.y + 18} H${PV.x + PV.w}"/><rect class="bp-pdf" x="${PV.x + PV.w - 46}" y="${PV.y + PV.h - 24}" width="38" height="16" rx="3"/><text class="bp-pdf-t" x="${PV.x + PV.w - 27}" y="${PV.y + PV.h - 12}" text-anchor="middle">PDF</text>`;
    else paper = `<rect class="bp-paper" x="${PV.x}" y="${PV.y}" width="${PV.w}" height="${PV.h + 22}" rx="7"/><path class="bp-chrome" d="M${PV.x} ${PV.y + 18} H${PV.x + PV.w}"/><circle class="bp-dot" cx="${PV.x + 10}" cy="${PV.y + 9}" r="3"/><circle class="bp-dot" cx="${PV.x + 20}" cy="${PV.y + 9}" r="3"/><rect class="bp-url" x="${PV.x + 32}" y="${PV.y + 3}" width="150" height="12" rx="6"/><text class="bp-url-t" x="${PV.x + 40}" y="${PV.y + 12.5}">panel/${esc(g.takipNo)}</text>`;
    return `<g class="bp bp-${printer}${finished ? ' is-done' : ''}">${paper}${els.join('')}</g>`;
  }
  BR.preview = preview;

  class Bridge {
    constructor(root, o) {
      o = o || {};
      this.el = DP.h('div', { class: 'fm-stage br-bridge' + (o.cls ? ' ' + o.cls : '') });
      root.appendChild(this.el);
      const waves = [300, 350, 400, 450]
        .map((y, i) => `<path class="br-wave" d="M${316 + (i % 2) * 18} ${y} q 14 -8 28 0 t 28 0 t 28 0 t 28 0 t 28 0 t 28 0 t 28 0 t 28 0 t 28 0 t 28 0 t 28 0"/>`)
        .join('');
      const posts = Array.from({ length: 13 }, (_, i) => 320 + i * 29).map((x) => `<path class="br-post" d="M${x} 110 V122"/>`).join('');
      const hangers = Array.from({ length: 9 }, (_, i) => 342 + i * 37)
        .map((x) => {
          const t = (x - 330) / 320;
          const ya = 250 - 4 * 104 * t * (1 - t); // kemerin yüksekliği (parabol)
          return `<path class="br-hanger" d="M${x} 134 V${ya.toFixed(1)}"/>`;
        })
        .join('');
      this.el.innerHTML = `
<svg class="fm-svg br-svg" viewBox="0 0 960 520" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Soyutlama ile gerçekleştirici arasındaki köprü">
  <rect class="br-bg" x="-1500" y="-1500" width="4000" height="4000"/>
  <rect class="br-water-bg" x="310" y="150" width="372" height="900"/>
  <g class="br-water">${waves}</g>
  <rect class="br-land is-abs" x="-300" y="34" width="616" height="900" rx="26"/>
  <rect class="br-land is-imp" x="664" y="34" width="616" height="900" rx="26"/>
  <text class="br-side-t is-abs" x="162" y="58" text-anchor="middle">SOYUTLAMA · ne basılacak?</text>
  <text class="br-side-t is-imp" x="808" y="58" text-anchor="middle">GERÇEKLEŞTİRİM · nasıl basılacak?</text>
  <g class="br-span" data-k="span">
    <g class="br-span-in">
      <path class="br-arch" d="M330 250 Q490 42 650 250"/>
      ${hangers}
      <path class="br-pier" d="M318 250 H342 V300 H318 Z M638 250 H662 V300 H638 Z"/>
      <rect class="br-deck" x="314" y="122" width="364" height="12" rx="3"/>
      <path class="br-rail" d="M318 110 H674"/>${posts}
      <text class="br-span-t" x="490" y="214" text-anchor="middle">köprü: <tspan class="br-span-f">yazici</tspan></text>
    </g>
  </g>
  <g data-k="abs"></g>
  <g data-k="dev"></g>
  <g data-k="prev"></g>
  <g class="br-token" data-k="tok"><g class="br-token-in" data-k="tok-in"><rect data-k="tok-bg" x="-60" y="-15" width="120" height="30" rx="15"/><text data-k="tok-t" x="0" y="5" text-anchor="middle"></text></g></g>
  <foreignObject class="bubble-fo" data-k="b-banner" x="110" y="458" width="740" height="52"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble br-banner"></div></foreignObject>
</svg>`;
      this.k = {};
      DP.$$('[data-k]', this.el).forEach((n) => (this.k[n.getAttribute('data-k')] = n));
    }

    /** Soyutlama kartı: etiket nesnesi, köprü alanı ve yazdir() adımları */
    _abs(st) {
      if (!st.label) return '';
      const L = BR.LABELS[st.label];
      const role = st.label === 'standart' ? 2 : 3;
      const rows = BR.rows(st.label);
      const h = ROW0 - 54 + (rows.length - 1) * ROWH; // son satırın altında 16 px boşluk
      const g = BR.G[L.g];
      const rowEls = rows
        .map((r, i) => {
          const y = ROW0 + i * ROWH;
          const state = i === st.row ? ' is-active' : st.finished || (st.row != null && i < st.row) ? ' is-done' : '';
          const text = BR.callText(r);
          return `<g class="ba-row${r.sub ? ' is-sub' : ''}${r.hl ? ' is-hl' : ''}${state}">
            <rect x="${AX + 8}" y="${y - 19}" width="${AW - 16}" height="26" rx="7"/>
            <text class="ba-mark" x="${AX + 20}" y="${y}">${state === ' is-done' ? '✓' : state === ' is-active' ? '▶' : '·'}</text>
            <text class="ba-call" x="${AX + (r.sub ? 52 : 36)}" y="${y}">${esc(text)}</text>
          </g>`;
        })
        .join('');
      return `<g class="ba rc rc-${role}${st.absNew ? ' is-new' : ''}">
        <rect class="ba-card" x="${AX}" y="70" width="${AW}" height="${h}" rx="12"/>
        <path class="ba-head" d="M${AX} 82 Q${AX} 70 ${AX + 12} 70 H${AX + AW - 12} Q${AX + AW} 70 ${AX + AW} 82 V106 H${AX} Z"/>
        <text class="ba-title" x="${AX + 14}" y="94">etiket : <tspan class="ba-cls">${esc(L.cls)}</tspan></text>
        <g class="ba-field${st.bridge ? ' is-on' : ''}"><rect x="${AX + 8}" y="113" width="${AW - 16}" height="28" rx="7"/>
          <text x="${AX + 20}" y="132"><tspan class="ba-f">yazici</tspan> = ${st.bridge && st.printer ? esc(BR.PRINTERS[st.printer].cls) : 'null'}</text>
          <circle class="ba-knot" cx="${AX + AW}" cy="128" r="6"/></g>
        <text class="ba-method${st.calling || st.finished ? ' is-on' : ''}" x="${AX + 14}" y="165">yazdir(${esc(L.g)})</text>
        ${rowEls}
      </g>
      <g class="ba-data${st.calling || st.finished ? ' is-on' : ''}"><rect x="${AX}" y="${70 + h + 18}" width="${AW}" height="40" rx="10"/>
        <text x="${AX + 14}" y="${70 + h + 43}"><tspan class="ba-data-k">${esc(L.g)}</tspan> = "${esc(g.takipNo)}", "${esc(g.alici)}"</text></g>`;
    }

    /** Gerçekleştirici kartı: yazıcı nesnesi ve son komutlar */
    _dev(st, newestLine) {
      const p = st.printer || st.ghostPrinter;
      if (!p) return '';
      const P = BR.PRINTERS[p];
      const dw = P.dialect.length * 7.6 + 20; // lehçe rozetinin genişliği
      const ghost = !st.printer;
      const lines = st.label && st.printer ? BR.lines(st.label, st.printer).slice(0, st.n || 0) : [];
      const shown = lines.slice(-4);
      const cut = (s) => (s.length > 31 ? s.slice(0, 30) + '…' : s);
      const term = shown
        .map((t, i) => {
          const isLast = i === shown.length - 1 && newestLine;
          return `<text class="bd-line${isLast ? ' is-new' : ''}" x="${DX + 16}" y="${142 + i * 21}">${esc(cut(t.replace(/^\[[^\]]+\] /, '')))}</text>`;
        })
        .join('');
      return `<g class="bd rc rc-5${ghost ? ' is-ghost' : ''}${st.devNew ? ' is-new' : ''}">
        <rect class="bd-card" x="${DX}" y="70" width="${DW}" height="172" rx="12"/>
        <path class="bd-head" d="M${DX} 82 Q${DX} 70 ${DX + 12} 70 H${DX + DW - 12} Q${DX + DW} 70 ${DX + DW} 82 V114 H${DX} Z"/>
        <circle class="bd-knot" cx="${DX}" cy="128" r="6"/>
        ${BR.icon(p, DX + 10, 75)}
        <text class="bd-title" x="${DX + 58}" y="91">yazici :</text>
        <text class="bd-cls" x="${DX + 58}" y="108">${esc(P.cls)}${ghost ? ' ?' : ''}</text>
        <rect class="bd-dialect" x="${DX + DW - 12 - dw}" y="80" width="${dw}" height="22" rx="11"/><text class="bd-dialect-t" x="${DX + DW - 12 - dw / 2}" y="95" text-anchor="middle">${esc(P.dialect)}</text>
        <rect class="bd-term" x="${DX + 8}" y="121" width="${DW - 16}" height="112" rx="8"/>
        ${term || `<text class="bd-line is-dim" x="${DX + 16}" y="142">${ghost ? 'henüz yazılmadı' : 'komut bekliyor…'}</text>`}
      </g>`;
    }

    /**
     * st: {label, printer, ghostPrinter, bridge, calling, row, n, finished, token, banner, absNew, devNew}
     *   row: yazdir() içindeki etkin adım (BR.rows sırası) · n: cihaza ulaşan ilkel çağrı sayısı
     */
    render(st, prev, o) {
      const anim = !!(o && o.animate);
      prev = prev || {};
      const s = Object.assign({}, st, {
        absNew: anim && st.label && (prev.label !== st.label || !prev.label),
        devNew: anim && st.printer && prev.printer !== st.printer,
      });
      const newestLine = anim && (st.n || 0) > (prev.label === st.label && prev.printer === st.printer ? prev.n || 0 : 0);
      this.k.abs.innerHTML = this._abs(s);
      this.k.dev.innerHTML = this._dev(s, newestLine);
      const n = st.n || 0;
      const sameJob = prev.label === st.label && prev.printer === st.printer;
      this.k.prev.innerHTML = st.label && st.printer ? preview(st.printer, st.label, n, !!st.finished, anim && sameJob && n > (prev.n || 0) ? n - 1 : -1) : '';

      // köprü: kurulunca belirir
      const span = this.k.span;
      span.classList.toggle('is-on', !!st.bridge);
      if (anim && st.bridge && !prev.bridge) DP.flash(span, 'is-build');

      // köprüden geçen çağrı
      const tok = this.k.tok;
      if (st.token) {
        // jeton güverte üzerinde soldan sağa yürür; uzun çağrılar daha kısa yol alır (kartlara taşmasın)
        const w = Math.max(100, st.token.length * 8.5 + 28);
        const from = 320 + w / 2;
        const to = 672 - w / 2;
        this.k['tok-bg'].setAttribute('x', String(-w / 2));
        this.k['tok-bg'].setAttribute('width', String(w));
        this.k['tok-t'].textContent = st.token;
        tok.classList.add('is-on');
        if (anim) {
          setTransform(tok, `translate(${from}px, 100px)`, false);
          void tok.getBoundingClientRect();
          setTransform(tok, `translate(${to}px, 100px)`, true);
        } else setTransform(tok, `translate(${to}px, 100px)`, false);
      } else {
        tok.classList.remove('is-on');
      }
      banner(this.k['b-banner'], st.banner);
    }

    destroy() {
      this.el.remove();
    }
  }
  BR.Bridge = Bridge;
})();
