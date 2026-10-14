/*
 * Builder — Yönetici (Director) sahnesinin görünümü.
 * Üstte yöneticinin tarifi (adım zinciri); altta aynı adımları alan hazırlayıcı istasyonları:
 *   paket  : Gonderi.Builder    → Gonderi nesnesi (kutu plan hâlinden gerçeğe)
 *   etiket : EtiketHazirlayici  → String (satır satır yazdırılan etiket)
 *   fiyat  : FiyatHazirlayici   → int (fiş: her adımın katkısı, sonda toplam)
 *   json   : JsonHazirlayici    → String (Genişlet sahnesinden sonra)
 *
 * render({recipe, i, json}, prev, {animate}) — i: o ana kadar çalışan adım sayısı (0..n), n+1 = build()
 */
(function () {
  'use strict';
  const BL = DP.bl;
  const { h, esc } = DP;

  const STATIONS = [
    { key: 'paket', obj: 'paket : Gonderi.Builder', cls: 'Builder', type: 'Gonderi' },
    { key: 'etiket', obj: 'etiket : EtiketHazirlayici', cls: 'EtiketHazirlayici', type: 'String' },
    { key: 'fiyat', obj: 'fiyat : FiyatHazirlayici', cls: 'FiyatHazirlayici', type: 'int' },
    { key: 'json', obj: 'json : JsonHazirlayici', cls: 'JsonHazirlayici', type: 'String' },
  ];
  BL.STATIONS = STATIONS;

  const SRC = { paket: ['Gonderi', 'Builder'], etiket: ['EtiketHazirlayici', 'EtiketHazirlayici'], fiyat: ['FiyatHazirlayici', 'FiyatHazirlayici'], json: ['JsonHazirlayici', 'JsonHazirlayici'] };

  /** Bir adımın o hazırlayıcıdaki gövdesi: Java kodundaki ilk satırın kendisi (birebir). */
  BL.reaction = function (st, s) {
    if (!s) return '';
    const [file, ret] = SRC[st];
    const lines = BL.gof[file].split('\n');
    const at = lines.findIndex((l) => l.includes(`public ${ret} ${s.m}(`));
    if (at < 0) return '';
    const line = lines[at + 1].trim();
    return line.startsWith('//') ? line : line.replace(/\s+\/\/.*$/, ''); // satır sonu yorumunu at
  };

  /** build() anında her hazırlayıcının yaptığı. */
  const BUILD = {
    paket: 'return new Gonderi(this);',
    etiket: 'return etiket.toString().trim();',
    fiyat: 'return ekspres ? toplam * 3 / 2 : toplam;',
    json: 'return "{" + String.join(", ", alanlar) + "}";',
  };

  class DirectorStage {
    constructor(root) {
      this.el = h('div', { class: 'dr-stage' });
      root.appendChild(this.el);
      this.recipeEl = h('div', { class: 'dr-recipe' });
      this.grid = h('div', { class: 'dr-stations' });
      this.el.append(this.recipeEl, this.grid);
      this.st = {};
      STATIONS.forEach((s) => {
        const sec = h('section', { class: 'dr-st rc rc-' + BL.roleOf(s.cls), 'data-st': s.key });
        sec.innerHTML = `
          <header class="dr-st-head"><span class="dr-st-name">${esc(s.obj)}</span><span class="dr-st-type">→ ${esc(s.type)}</span></header>
          <div class="dr-call"></div>
          <div class="dr-viz"></div>
          <div class="dr-react"><code></code></div>`;
        this.grid.appendChild(sec);
        this.st[s.key] = { sec, call: sec.querySelector('.dr-call'), viz: sec.querySelector('.dr-viz'), react: sec.querySelector('.dr-react code') };
      });
      // paket istasyonu: küçük SVG kutu
      const pv = this.st.paket.viz;
      pv.innerHTML = `<svg class="dr-box" viewBox="-14 -48 254 212" role="img" aria-label="Gönderi paketi">${BL.art.box('dbox')}</svg>`;
      this.k = {};
      DP.$$('[data-k]', pv).forEach((n) => (this.k[n.getAttribute('data-k')] = n));
      this.prev = null;
    }

    render(o, anim) {
      const r = BL.recipes[o.recipe];
      const n = r.steps.length;
      const i = Math.max(0, Math.min(n + 1, o.i));
      const prev = this.prev;
      const fresh = anim && prev && prev.recipe === o.recipe && prev.i === i - 1;
      const done = r.steps.slice(0, Math.min(i, n));
      const cur = i >= 1 && i <= n ? r.steps[i - 1] : null;
      const building = i === n + 1;

      // ---- tarif şeridi
      const chips = r.steps
        .map((s, j) => `<span class="dr-step${j < i - 1 || building ? ' is-done' : ''}${j === i - 1 && !building ? ' is-current' : ''}">.${esc(s.m)}(${esc(s.arg)})</span>`)
        .join('<span class="dr-sep">›</span>');
      this.recipeEl.innerHTML = `
        <div class="dr-head"><span class="dr-obj">yonetici : GonderiYoneticisi</span><code class="dr-method">${esc(r.method)}(h)</code>
          <span class="dr-note">“hangi hazırlayıcı?” — bilmiyor, bilmesi de gerekmiyor</span></div>
        <div class="dr-steps">${chips}<span class="dr-sep">›</span><span class="dr-step dr-build${building ? ' is-current' : ''}">build()</span></div>`;

      // ---- istasyonlar
      this.grid.classList.toggle('has-json', !!o.json);
      this.st.json.sec.hidden = !o.json;
      STATIONS.forEach((s) => {
        const S = this.st[s.key];
        const callTxt = building ? 'build()' : cur ? `${cur.m}(${cur.arg})` : '';
        S.call.textContent = callTxt ? '▼ ' + callTxt : '';
        S.call.classList.toggle('is-on', !!callTxt);
        if (fresh && callTxt) DP.flash(S.call, 'is-pop');
        S.react.textContent = building ? BUILD[s.key] : cur ? BL.reaction(s.key, cur) : 'henüz çağrı yok';
        S.sec.classList.toggle('is-idle', !cur && !building);
        S.sec.classList.toggle('is-built', building);
        if (fresh) DP.flash(S.sec, 'is-pulse');
      });

      // paket: plan → build() ile gerçek nesne
      const g = BL.fieldsOf(done);
      if (!done.some((s) => s.m === 'agirlik')) g.agirlik = null;
      const pg = prev && prev.recipe === o.recipe ? prev.g : null;
      BL.art.applyBox(this.k, 'dbox', g, { plan: !building && i > 0, real: building, sealed: building, final: building }, pg, fresh);
      if (fresh && building) DP.flash(this.k.dbox, 'is-materialize');
      this.st.paket.viz.classList.toggle('is-empty', i === 0);
      const pres = this.st.paket.sec.querySelector('.dr-result') || this.st.paket.viz.appendChild(h('div', { class: 'dr-result' }));
      pres.textContent = building ? BL.describe(r.cargo) : '';

      // etiket: satır satır
      const lines = BL.labelLines(done);
      this.st.etiket.viz.innerHTML = `<div class="dr-paper${building ? ' is-printed' : ''}">${lines
        .map((l, j) => `<div class="dr-line${j === lines.length - 1 && cur && fresh ? ' is-new' : ''}${j === 0 ? ' is-head' : ''}">${esc(l)}</div>`)
        .join('')}${building ? '' : '<div class="dr-caret"></div>'}</div>`;

      // fiyat: fiş
      const tr = BL.priceTrace(done);
      this.st.fiyat.viz.innerHTML = `<div class="dr-receipt">${tr.lines
        .map((l, j) => `<div class="dr-row${l.muted ? ' is-muted' : ''}${j === tr.lines.length - 1 && cur && fresh ? ' is-new' : ''}"><span>${esc(l.t)}</span><b>${esc(l.v)}</b></div>`)
        .join('')}
        <div class="dr-total${building ? ' is-on' : ''}"><span>${building && tr.ekspres ? `${tr.ara} × 1,5 =` : 'TOPLAM'}</span><b>${building ? tr.toplam + ' TL' : '…'}</b></div></div>`;

      // json
      if (o.json) {
        const parts = BL.jsonParts(done);
        this.st.json.viz.innerHTML = `<div class="dr-json">${building ? '<div class="dr-brace">{</div>' : ''}${parts
          .map((p, j) => `<div class="dr-line${j === parts.length - 1 && cur && fresh ? ' is-new' : ''}">${esc(p)}${building && j < parts.length - 1 ? ',' : ''}</div>`)
          .join('')}${building ? '<div class="dr-brace">}</div>' : ''}</div>`;
      }

      this.prev = { recipe: o.recipe, i, g };
    }

    destroy() {
      this.el.remove();
    }
  }

  BL.DirectorStage = DirectorStage;
})();
