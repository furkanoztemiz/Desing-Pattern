/*
 * Builder — "Paketleme atölyesi" animasyon sahnesi (Sorun ve Canlı Akış).
 *
 * Üç kip:
 *   ctor    → teleskop kurucu: argüman şeridi (konumlu, adsız değerler) + anında oluşan paket
 *   bean    → JavaBeans: nesne baştan var, set çağrılarıyla yavaş yavaş dolar (yarım nesne)
 *   builder → akıcı Builder: form (Builder nesnesi) adım adım dolar, paket yalnızca PLANDIR;
 *             build() kontrol kapısından geçince paket gerçek, mühürlü ve değişmez olur.
 *
 * Durum tabanlı çizim: render(state, prevState, {animate}) — geri/ileri adımlarda tutarlı.
 * Görünürlük hemen uygulanır; animasyonlar yalnızca CSS ile (zamanlayıcıya bağlı değil).
 */
(function () {
  'use strict';
  const BL = DP.bl;
  const esc = DP.esc;
  const art = (BL.art = BL.art || {});
  let uidCounter = 0;

  const FIELDS = ['nereden', 'nereye', 'agirlik', 'kirilgan', 'sogukZincir', 'ekspres', 'sigorta'];
  BL.FIELDS = FIELDS;

  // ================================================================== paket çizimi
  /** Gönderi paketi. Orijin: ön yüzün sol-üst köşesi; ön yüz 200×140, üst/yan yüz 26 px derinlik. */
  art.box = (k) => `
    <g class="bx" data-k="${k}">
      <path class="bx-top" d="M0 0 L26 -20 H226 L200 0 Z"/>
      <path class="bx-side" d="M200 0 L226 -20 V120 L200 140 Z"/>
      <rect class="bx-front" x="0" y="0" width="200" height="140" rx="2"/>
      <path class="bx-tape-v" d="M92 0 H108 V140 H92 Z"/>
      <g class="bx-seal" data-k="${k}-seal"><path d="M84 0 L110 -20 H126 L100 0 Z"/><rect x="0" y="-3" width="200" height="10"/></g>
      <text class="bx-plan" x="113" y="-30" text-anchor="middle">henüz nesne yok · yalnızca plan</text>
      <g class="bx-part bx-adres" data-k="${k}-adres"><rect x="10" y="10" width="112" height="46" rx="3"/>
        <text class="bx-t1" x="18" y="29" data-k="${k}-from">—</text><text class="bx-t2" x="18" y="47" data-k="${k}-to">› —</text></g>
      <g class="bx-part bx-kg" data-k="${k}-kg"><rect x="130" y="10" width="60" height="26" rx="3"/><text x="160" y="28" text-anchor="middle" data-k="${k}-kgt">1 kg</text></g>
      <g class="bx-part bx-kirilgan" data-k="${k}-kirilgan"><rect x="10" y="64" width="90" height="30" rx="3"/>
        <path class="bx-ic" d="M22 70 h14 l-2 8 a5 5 0 0 1 -10 0 z M29 83 v6 M25 90 h8"/><text x="62" y="84" text-anchor="middle">KIRILACAK</text></g>
      <g class="bx-part bx-soguk" data-k="${k}-soguk"><rect x="108" y="64" width="82" height="30" rx="3"/>
        <path class="bx-ic" d="M121 70 v18 M113 74 l16 10 M113 84 l16 -10"/><text x="160" y="84" text-anchor="middle">SOĞUK</text></g>
      <g class="bx-part bx-ekspres" data-k="${k}-ekspres"><rect x="10" y="102" width="90" height="30" rx="3"/>
        <path class="bx-ic is-fill" d="M27 105 l-7 13 h6 l-3 11 l10 -15 h-6 l4 -9 z"/><text x="64" y="122" text-anchor="middle">EKSPRES</text></g>
      <g class="bx-part bx-sigorta" data-k="${k}-sigorta"><circle cx="150" cy="114" r="22"/>
        <text class="bx-s1" x="150" y="111" text-anchor="middle">SİGORTA</text><text class="bx-s2" x="150" y="124" text-anchor="middle" data-k="${k}-sigt">5000</text></g>
      <g class="bx-final" data-k="${k}-final"><circle cx="212" cy="-14" r="15"/>
        <path d="M206 -14 v-4 a6 6 0 0 1 12 0 v4"/><rect x="203" y="-14" width="18" height="12" rx="2"/></g>
      <g class="bx-crack" data-k="${k}-crack">
        <path class="bx-crack-l" d="M60 0 L74 30 L62 52 L86 80 L72 104 L94 140"/>
        <path class="bx-crack-l" d="M150 140 L140 116 L158 96 L146 76"/>
        <g class="bx-shards"><path d="M40 150 l8 -6 l4 9 z"/><path d="M120 156 l10 -4 l-2 10 z"/><path d="M170 150 l6 -8 l5 8 z"/></g>
        <g class="bx-stamp"><rect x="34" y="52" width="132" height="34" rx="6"/><text x="100" y="76" text-anchor="middle">KIRILDI!</text></g>
      </g>
      <g class="bx-half" data-k="${k}-half"><rect x="44" y="-50" width="112" height="24" rx="12"/><text x="100" y="-33" text-anchor="middle">yarım nesne!</text></g>
    </g>`;

  /** Paketi bir gönderinin alanlarına göre günceller. o: {plan, real, sealed, final, cracked, half} */
  art.applyBox = function (k, key, g, o, prevG, anim) {
    o = o || {};
    const root = k[key];
    root.classList.toggle('is-plan', !!o.plan);
    root.classList.toggle('is-real', !!o.real);
    root.classList.toggle('is-none', !o.plan && !o.real);
    // agirlik === null → henüz verilmedi (plan aşamasında etiket görünmez)
    const parts = (x) => ({
      adres: !!(x.nereden || x.nereye),
      kg: x.agirlik != null,
      kirilgan: !!x.kirilgan,
      soguk: !!x.sogukZincir,
      ekspres: !!x.ekspres,
      sigorta: x.sigorta > 0,
    });
    const show = parts(g);
    const was = prevG ? parts(prevG) : {};
    Object.keys(show).forEach((p) => {
      const el = k[key + '-' + p];
      el.classList.toggle('is-on', show[p]);
      if (anim && show[p] && !was[p]) DP.flash(el, 'is-new');
    });
    k[key + '-from'].textContent = g.nereden || '—';
    k[key + '-to'].textContent = '› ' + (g.nereye || '—');
    k[key + '-kgt'].textContent = (g.agirlik != null ? g.agirlik : 1) + ' kg';
    k[key + '-sigt'].textContent = g.sigorta > 0 ? String(g.sigorta) : '';
    k[key + '-seal'].classList.toggle('is-on', !!o.sealed);
    k[key + '-final'].classList.toggle('is-on', !!o.final);
    k[key + '-crack'].classList.toggle('is-on', !!o.cracked);
    k[key + '-half'].classList.toggle('is-on', !!o.half);
  };

  const LABEL = { nereden: 'nereden', nereye: 'nereye', agirlik: 'agirlik', kirilgan: 'kirilgan', sogukZincir: 'sogukZincir', ekspres: 'ekspres', sigorta: 'sigorta' };

  /** Form satırında gösterilecek değer. */
  function fmtValue(f, g, isSet) {
    const v = g[f];
    if (f === 'nereden' || f === 'nereye') return v == null ? 'null' : `"${v}"`;
    if (f === 'agirlik') return String(v == null ? 1 : v) + (isSet ? '' : '  (varsayılan)');
    if (f === 'sigorta') return String(v || 0) + (isSet ? '' : '  (varsayılan)');
    return v ? 'true' : 'false';
  }

  const POS = { table: 'translate(450px,228px) scale(1)', truck: 'translate(830px,282px) scale(.4)', gone: 'translate(1100px,282px) scale(.4)' };

  /** CSS dönüşümünü uygular; animasyon yoksa geçişi o an için kapatır (geri adımlarda zıplama olmasın). */
  function setTransform(el, value, anim) {
    if (!anim) el.style.transition = 'none';
    el.style.transform = value;
    if (!anim) {
      void el.getBoundingClientRect();
      el.style.transition = '';
    }
  }

  class BLStage {
    constructor(root) {
      this.uid = 'bls' + ++uidCounter;
      this.el = DP.h('div', { class: 'fm-stage bl-stage' });
      root.appendChild(this.el);
      this.el.innerHTML = this._markup();
      this.k = {};
      DP.$$('[data-k]', this.el).forEach((n) => (this.k[n.getAttribute('data-k')] = n));
      this.state = null;
    }

    _markup() {
      const u = this.uid;
      const rows = FIELDS.map(
        (f, i) => `<g class="bf-row" data-k="row-${f}" transform="translate(0,${170 + i * 30})">
          <rect class="bf-row-bg" x="54" y="-19" width="304" height="27" rx="5"/>
          <text class="bf-k" x="66" y="0">${LABEL[f]}</text>
          <text class="bf-v" x="346" y="0" text-anchor="end" data-k="val-${f}">—</text></g>`
      ).join('');
      const rollers = [700, 724, 748, 772, 796, 820, 844, 868, 892, 916, 940, 964].map((x) => `<circle class="roller" cx="${x}" cy="395" r="4"/>`).join('');
      return `
<svg class="fm-svg bl-svg" viewBox="20 0 960 470" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Paketleme atölyesi: Builder formu, paket ve kontrol kapısı">
  <defs>
    <marker id="${u}-call" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="mk-spot" d="M0 0 L10 5 L0 10 z"/></marker>
  </defs>
  <rect class="of-wall" x="-1500" y="-1500" width="4000" height="1900"/>
  <rect class="of-band" x="-1500" y="384" width="4000" height="16"/>
  <rect class="of-floor" x="-1500" y="400" width="4000" height="1500"/>
  <path class="of-floor-line" d="M-1500 440 H2500"/>

  <!-- teleskop kurucu: argüman şeridi -->
  <g class="ct-strip" data-k="strip">
    <rect class="ct-bg" x="40" y="14" width="920" height="114" rx="12"/>
    <text class="ct-new" x="58" y="74" data-k="ct-head">new Gonderi(</text>
    <g data-k="ct-slots"></g>
  </g>

  <!-- istemci kartı: o anki çağrı -->
  <g class="bk-card" data-k="client">
    <rect class="bk-bg" x="40" y="16" width="330" height="64" rx="10"/>
    <text class="bk-title" x="54" y="38" data-k="bk-title">Main.main()</text>
    <text class="bk-call" x="54" y="64" data-k="bk-call">…</text>
    <g class="bk-ret" data-k="bk-ret"><rect x="270" y="46" width="88" height="26" rx="13"/><text x="314" y="64" text-anchor="middle">↩ this</text></g>
  </g>
  <path class="bl-call" data-k="callpath" d="M206 80 C 206 92, 206 96, 206 104" marker-end="url(#${u}-call)"/>

  <!-- Builder nesnesi: form (pano) -->
  <g class="bf-board" data-k="form">
    <rect class="bf-clip-bg" x="40" y="100" width="330" height="292" rx="12"/>
    <rect class="bf-paper" x="50" y="124" width="310" height="260" rx="6"/>
    <rect class="bf-clip" x="170" y="92" width="70" height="20" rx="5"/>
    <text class="bf-title" x="66" y="146" data-k="bf-title">builder : Gonderi.Builder</text>
    ${rows}
  </g>

  <!-- montaj masası -->
  <rect class="tb-top" x="420" y="368" width="272" height="12" rx="3"/>
  <path class="tb-leg" d="M440 380 V400 M672 380 V400"/>

  <!-- kontrol kapısı: build() -->
  <g class="gate" data-k="gate">
    <path class="gt-post" d="M716 250 V400 M768 250 V400"/>
    <rect class="gt-beam" x="706" y="232" width="72" height="22" rx="4"/>
    <text class="gt-sign" x="742" y="248" text-anchor="middle">build()</text>
    <circle class="gt-lamp" data-k="lamp" cx="742" cy="272" r="9"/>
  </g>

  <!-- bant + kamyon -->
  <g class="bl-belt"><rect class="belt-body" x="690" y="388" width="290" height="14" rx="7"/>${rollers}</g>
  <g class="bl-truck" data-k="truck"><g transform="translate(822,400) scale(1.25)">${DP.lojistik.art.truck()}</g></g>

  <!-- kırılma damgası (kamyondaki küçük paketin üstünde, okunur büyüklükte) -->
  <g class="bl-crash" data-k="crash" transform="translate(866,252)"><g class="bl-crash-in">
    <path d="M0 -46 L12 -18 L42 -30 L24 -4 L52 10 L20 16 L28 44 L4 24 L-14 50 L-12 18 L-46 22 L-22 0 L-44 -24 L-12 -16 Z"/>
    <text x="0" y="6" text-anchor="middle">KIRILDI!</text></g></g>

  <!-- paket (konumu CSS ile: masa ↔ kamyon) -->
  <g class="bx-wrap" data-k="boxwrap">${art.box('box')}</g>

  <!-- balonlar ve kontrol kartı -->
  <foreignObject class="bubble-fo" data-k="b-check" x="598" y="34" width="362" height="128"><div xmlns="http://www.w3.org/1999/xhtml" class="bl-check"></div></foreignObject>
  <foreignObject class="bubble-fo" data-k="b-box" x="372" y="96" width="222" height="112"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble tail-bottom"></div></foreignObject>
  <foreignObject class="bubble-fo" data-k="b-truck" x="690" y="96" width="270" height="110"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble tail-bottom"></div></foreignObject>
  <foreignObject class="bubble-fo" data-k="b-form" x="380" y="40" width="300" height="100"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble tail-left"></div></foreignObject>
</svg>`;
    }

    /** Tüm sahneyi verilen duruma getirir. */
    render(st, prev, o) {
      const k = this.k;
      const anim = !!(o && o.animate);
      prev = prev || {};
      this.state = st;
      this.el.classList.toggle('is-ctor', st.mode === 'ctor');
      this.el.classList.toggle('is-bean', st.mode === 'bean');
      this.el.classList.toggle('is-builder', st.mode === 'builder');

      this._renderStrip(st.ctor, anim && JSON.stringify(st.ctor) !== JSON.stringify(prev.ctor));
      this._renderClient(st, prev, anim);
      this._renderForm(st, prev, anim);

      // paket
      const b = st.box || { state: 'none', g: {} };
      const pb = prev.box || null;
      art.applyBox(k, 'box', b.g || {}, { plan: b.state === 'plan', real: b.state === 'real', sealed: b.sealed, final: b.final, cracked: b.cracked, half: b.half }, pb && pb.state !== 'none' ? pb.g : null, anim);
      if (anim && b.state === 'real' && pb && pb.state === 'plan') DP.flash(k.box, 'is-materialize');
      if (anim && b.cracked && !(pb && pb.cracked)) {
        DP.flash(k['box-crack'], 'is-cracking');
        DP.flash(k.crash, 'is-bursting');
      }
      k.crash.classList.toggle('is-on', !!b.cracked);
      const wrap = k.boxwrap;
      const moving = anim && !!pb && (pb.pos || 'table') !== (b.pos || 'table');
      if (moving) setTransform(wrap, POS[pb.pos || 'table'], false);
      wrap.classList.toggle('is-going', b.pos === 'gone');
      setTransform(wrap, POS[b.pos || 'table'], moving);

      // kontrol kapısı
      const gt = st.gate || null;
      k.gate.classList.toggle('is-on', st.mode === 'builder');
      k.lamp.classList.toggle('is-green', !!gt && gt.lamp === 'ok');
      k.lamp.classList.toggle('is-red', !!gt && gt.lamp === 'bad');
      this._renderCheck(gt, anim && !!gt && JSON.stringify(gt) !== JSON.stringify(prev.gate || null));

      // kamyon (paket "gone" konumuna kamyonla birlikte gider)
      const go = st.truck === 'go';
      setTransform(k.truck, go ? 'translateX(270px)' : 'translateX(0px)', anim && go !== (prev.truck === 'go'));
      this._renderBubble(st.bubble);
    }

    _renderStrip(c, anim) {
      const k = this.k;
      k.strip.classList.toggle('is-on', !!c);
      if (!c) return;
      k['ct-head'].textContent = c.head || 'new Gonderi(';
      let x = 58 + (c.head || 'new Gonderi(').length * 10.4 + 6;
      const parts = c.args.map((a, i) => {
        const w = Math.max(54, a.length * 10.4 + 22);
        const bad = (c.bad || []).includes(i);
        const intent = c.intent && c.intent[i];
        const g = `<g class="ct-slot${bad ? ' is-bad' : ''}${c.names ? ' show-name' : ''}${anim ? ' is-new' : ''}" style="animation-delay:${i * 0.07}s">
          ${intent ? `<g class="ct-intent"><rect x="${x + 4}" y="22" width="${w - 8}" height="20" rx="10"/><text x="${x + w / 2}" y="36" text-anchor="middle">${esc(intent)}</text></g>` : ''}
          <rect class="ct-box" x="${x}" y="48" width="${w}" height="38" rx="7"/>
          <text class="ct-val" x="${x + w / 2}" y="73" text-anchor="middle">${esc(a)}</text>
          <text class="ct-name" x="${x + w / 2}" y="108" text-anchor="middle">${c.names ? esc(c.params[i]) : '?'}</text></g>`;
        x += w + (i < c.args.length - 1 ? 14 : 0);
        return g + (i < c.args.length - 1 ? `<text class="ct-comma" x="${x - 9}" y="73" text-anchor="middle">,</text>` : '');
      });
      const legend = c.intent ? `<text class="ct-intent-l" x="58" y="36">niyet edilen →</text>` : '';
      k['ct-slots'].innerHTML = legend + parts.join('') + `<text class="ct-new" x="${x + 6}" y="74">)</text>`;
    }

    _renderClient(st, prev, anim) {
      const k = this.k;
      const c = st.call;
      k.client.classList.toggle('is-on', st.mode !== 'ctor' && !!c);
      k.callpath.classList.toggle('is-on', st.mode !== 'ctor' && !!c && !c.idle);
      if (!c) return;
      k['bk-title'].textContent = c.title || 'Main.main()';
      k['bk-call'].textContent = c.text || '';
      k['bk-ret'].classList.toggle('is-on', !!c.ret);
      if (anim && (!prev.call || prev.call.text !== c.text)) DP.flash(k['bk-call'], 'is-typing');
      if (anim && c.ret) DP.flash(k['bk-ret'], 'is-pop');
    }

    _renderForm(st, prev, anim) {
      const k = this.k;
      const f = st.form;
      k.form.classList.toggle('is-on', !!f);
      k.form.classList.toggle('is-bean', st.mode === 'bean');
      if (!f) return;
      k['bf-title'].textContent = f.title;
      const pv = prev.form && prev.form.values ? prev.form.values : null;
      FIELDS.forEach((fl) => {
        const isSet = (f.set || []).includes(fl);
        const txt = fmtValue(fl, f.values, isSet);
        k['val-' + fl].textContent = txt;
        const row = k['row-' + fl];
        row.classList.toggle('is-set', isSet);
        row.classList.toggle('is-hl', f.hl === fl);
        row.classList.toggle('is-missing', (f.missing || []).includes(fl));
        if (anim && pv && fmtValue(fl, pv, (prev.form.set || []).includes(fl)) !== txt) DP.flash(row, 'is-changed');
      });
      k.form.classList.toggle('is-done', !!f.done);
    }

    _renderCheck(gt, anim) {
      const fo = this.k['b-check'];
      fo.classList.toggle('is-on', !!gt && !!gt.checks);
      if (!gt || !gt.checks) return;
      const div = fo.firstElementChild;
      div.className = 'bl-check ' + (gt.lamp === 'bad' ? 'is-bad' : 'is-ok');
      div.innerHTML =
        `<div class="bc-title"><code>build()</code> · kontrol</div>` +
        gt.checks.map((c) => `<div class="bc-row ${c.ok ? 'is-ok' : 'is-bad'}">${c.ok ? '✓' : '✗'} ${DP.md(c.t, BL.roleOf)}</div>`).join('') +
        (gt.verdict ? `<div class="bc-verdict">${DP.md(gt.verdict, BL.roleOf)}</div>` : '');
      if (anim) DP.flash(div, 'is-pop');
    }

    _renderBubble(b) {
      ['box', 'truck', 'form'].forEach((at) => {
        const fo = this.k['b-' + at];
        const on = !!b && b.at === at;
        const div = fo.firstElementChild;
        if (on) {
          const html = DP.md(b.text, BL.roleOf);
          if (div.innerHTML !== html) {
            div.innerHTML = html;
            DP.flash(div, 'is-pop');
          }
          div.classList.toggle('is-ok', b.tone === 'ok');
          div.classList.toggle('is-bad', b.tone === 'bad');
        }
        fo.classList.toggle('is-on', on);
      });
    }

    destroy() {
      this.el.remove();
    }
  }

  BL.Stage = BLStage;
})();
