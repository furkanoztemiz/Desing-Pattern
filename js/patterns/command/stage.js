/*
 * Command — animasyon sahnesi.
 *   CM.Depo : Malatya şubesinin deposu.
 *     Solda operatör paneli (çağıran): düğmeler; komutlu tasarımda geçmiş (geri al) ve ileri (yinele) yığınları,
 *     kalıpsız tasarımda switch ve "son işlem kaydı" (tek kayıt). Ortada raflar (A1…C4), sağda kamyon.
 *     Altta: komut nesneleri (alanlarıyla: koli, hedef, geri al için kayıt) ya da gece işinin kuyruğu
 *     (kalıpsızda metin satırları, komutluda komut nesneleri).
 *   İstek jetonu panelden rafa/kamyona, kuyruktan rafa ilerler.
 *
 * Durum tabanlı çizim: render(state, prevState, {animate}) — geri/ileri adımlarda tutarlı.
 */
(function () {
  'use strict';
  const CM = DP.cmd;
  const esc = DP.esc;
  const md = (t) => DP.md(t, CM.roleOf);

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

  /** Tahmini genişliği aşan yazıyı sıkıştırır (SVG textLength) */
  const fit = (text, max, cw) => (text.length * cw > max ? ` textLength="${max}" lengthAdjust="spacingAndGlyphs"` : '');

  // ------------------------------------------------------------------ simgeler (24 × 24)
  const ICON = {
    panel: '<rect x="3" y="2.5" width="18" height="19" rx="2.5"/><path d="M6.5 6.5 H17.5 M6.5 11 H10.5 M13.5 11 H17.5 M6.5 15.5 H10.5 M13.5 15.5 H17.5"/>',
    kutu: '<path d="M3 7.5 L12 3 L21 7.5 V16.5 L12 21 L3 16.5 Z M3 7.5 L12 12 L21 7.5 M12 12 V21"/>',
    kamyon: '<path d="M2 16.5 V6 H14 V16.5 Z M14 9.5 H18.5 L21.5 13 V16.5 H14"/><circle cx="6.5" cy="17.5" r="2"/><circle cx="17.5" cy="17.5" r="2"/>',
    ay: '<path d="M20 14.5 A8.5 8.5 0 1 1 9.5 4 A7 7 0 0 0 20 14.5 Z"/>',
    komut: '<path d="M4 4.5 H20 V19.5 H4 Z M7.5 9 H16.5 M7.5 12.5 H16.5 M7.5 16 H12.5"/>',
    geri: '<path d="M9 5.5 L4.5 10 L9 14.5"/><path d="M4.5 10 H14.5 Q20 10 20 15 Q20 19.5 14.5 19.5 H10"/>',
    ileri: '<path d="M15 5.5 L19.5 10 L15 14.5"/><path d="M19.5 10 H9.5 Q4 10 4 15 Q4 19.5 9.5 19.5 H14"/>',
    hafiza: '<rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M8 3.5 V9 H16 V3.5 M8 20.5 V14 H16 V20.5"/>',
    soguk: '<path d="M12 2.5 V21.5 M3.8 7.25 L20.2 16.75 M3.8 16.75 L20.2 7.25"/>',
  };
  CM.icon = (k, x, y, s) => `<g class="cmi cmi-${k}" transform="translate(${x},${y})${s && s !== 1 ? ` scale(${s})` : ''}">${ICON[k]}</g>`;
  CM.ICON = ICON;

  // ================================================================== depo
  const W = 960;
  const H = 560;
  const PX = 16; // panel
  const PW = 222;
  const PY = 36;
  const PH = 460;
  const GX = 256; // raflar
  const CW = 92;
  const CG = 10;
  const GY = 40;
  const CH = 80;
  const RG = 8;
  const TX = 676; // kamyon
  const TW = 268;
  const BX = 256; // alt bant
  const BY = 318;
  const BW = 688;
  const BH = 170;

  const cell = (raf) => {
    const r = 'ABC'.indexOf(raf[0]);
    const c = Number(raf.slice(1)) - 1;
    return { x: GX + c * (CW + CG), y: GY + r * (CH + RG) };
  };
  CM.cellOf = cell;
  /** Kamyondaki i. kolinin yeri (yükleme sırasıyla, iki sütun) */
  const yukYeri = (i) => ({ x: TX + 16 + (i % 2) * 92, y: GY + 54 + Math.floor(i / 2) * 50 });

  class DepoSahne {
    /** o: {cls} */
    constructor(root, o) {
      this.o = o || {};
      this.el = DP.h('div', { class: 'fm-stage cmd-depo' + (this.o.cls ? ' ' + this.o.cls : '') });
      root.appendChild(this.el);
      this.el.innerHTML = `
<svg class="fm-svg cmd-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Depo: operatör paneli, raflar, kamyon ve komut nesneleri">
  <rect class="cmd-bg" x="-1500" y="-1500" width="4000" height="4000"/>
  <g data-k="head"></g>
  <g data-k="panel"></g>
  <g data-k="raflar"></g>
  <g data-k="kamyon"></g>
  <g data-k="bant"></g>
  <g data-k="fx"><g class="cmd-token" data-k="tok"><g class="cmd-token-in"><rect data-k="tok-bg" x="-60" y="-13" width="120" height="26" rx="13"/><text data-k="tok-t" x="0" y="5" text-anchor="middle"></text></g></g></g>
  <foreignObject class="bubble-fo" data-k="b-banner" x="16" y="504" width="928" height="54"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble cmd-banner"></div></foreignObject>
</svg>`;
      this.svg = this.el.querySelector('svg');
      this.k = {};
      DP.$$('[data-k]', this.el).forEach((n) => (this.k[n.getAttribute('data-k')] = n));
      this.timers = [];
      this.A = {};
    }

    _stop() {
      this.timers.forEach(clearTimeout);
      this.timers = [];
    }

    _at(ms, fn) {
      this.timers.push(setTimeout(fn, DP.dur(ms)));
    }

    /**
     * st: {
     *   mode: 'naive'|'komut', v: 'v1'|'v2', raflar: {koli: raf}, yuk: [koli],
     *   hl: {koli: 'move'|'bad'|'ok'}, ghost: {koli: raf} (olması gereken yer), from: {raf: true} (boşalan raf),
     *   dugme: 'tasi'|'yukle'|'geri'|'yinele'|null,
     *   gecmis: [kart], ileri: [kart], slot: {sonIslem, sonKoli, sonRaf}, slotHl: alan adı,
     *   bant: {kind: 'kartlar', kartlar: [{kart, ad, durum, metot}]} | {kind: 'gece', naive, items: [{satir, durum, kart}]} | {kind: 'slot'} | null,
     *   token: {from, to, text, kind}, banner
     * }
     */
    render(st, prev, o) {
      const anim = !!(o && o.animate);
      prev = prev || {};
      this._stop();
      this.A = {};
      this._head(st);
      this._raflar(st, prev, anim);
      this._kamyon(st, prev, anim);
      this._panel(st, prev, anim);
      this._bant(st, prev, anim);
      banner(this.k['b-banner'], st.banner);
      this._token(st.token, anim);
    }

    _head(st) {
      this.k.head.innerHTML = `
        <text class="cmd-cap" x="${PX}" y="24">Çağıran · panel</text>
        <text class="cmd-cap is-recv" x="${GX}" y="24">Depo rafları</text>
        <text class="cmd-cap is-recv" x="${TX}" y="24">Malatya kamyonu</text>`;
    }

    // ---------------------------------------------------------------- raflar
    _raflar(st, prev, anim) {
      const R = st.raflar || {};
      const PR = prev.raflar || {};
      const hl = st.hl || {};
      const ghost = st.ghost || {};
      const from = st.from || {};
      const yerinde = {};
      Object.keys(R).forEach((k) => (yerinde[R[k]] = k));
      const ghostAt = {};
      Object.keys(ghost).forEach((k) => (ghostAt[ghost[k]] = k));
      this.k.raflar.innerHTML = CM.RAFLAR.map((raf) => {
        const c = cell(raf);
        this.A['cell:' + raf] = { x: c.x + CW / 2, y: c.y + CH / 2 + 6 };
        const koli = yerinde[raf];
        let ic = '';
        if (koli) {
          const K = CM.KOLI[koli];
          const cls = hl[koli] ? ' is-' + hl[koli] : '';
          const yeniGeldi = anim && PR[koli] !== raf;
          ic = `<g class="cmd-koli${cls}${yeniGeldi ? ' is-new' : ''}">
            <rect x="${c.x + 9}" y="${c.y + 22}" width="${CW - 18}" height="${CH - 30}" rx="6"/>
            <path class="cmd-koli-bant" d="M${c.x + CW / 2} ${c.y + 22} V${c.y + CH - 8}"/>
            <text class="cmd-koli-no" x="${c.x + CW / 2}" y="${c.y + 44}" text-anchor="middle">${CM.kisa(koli)}</text>
            <text class="cmd-koli-ad" x="${c.x + CW / 2}" y="${c.y + 60}" text-anchor="middle">${esc(K.ad)}</text>
            ${K.soguk ? CM.icon('soguk', c.x + CW - 22, c.y + 25, 0.5) : ''}
          </g>`;
        } else if (ghostAt[raf]) {
          ic = `<g class="cmd-hayal"><rect x="${c.x + 9}" y="${c.y + 22}" width="${CW - 18}" height="${CH - 30}" rx="6"/><text x="${c.x + CW / 2}" y="${c.y + 47}" text-anchor="middle">${CM.kisa(ghostAt[raf])}?</text><text class="cmd-hayal-s" x="${c.x + CW / 2}" y="${c.y + 62}" text-anchor="middle">olmalıydı</text></g>`;
        }
        return `<g class="cmd-raf${from[raf] ? ' is-from' : ''}${koli ? '' : ' is-bos'}">
          <rect class="cmd-raf-bg" x="${c.x}" y="${c.y}" width="${CW}" height="${CH}" rx="9"/>
          <text class="cmd-raf-ad" x="${c.x + 8}" y="${c.y + 15}">${raf}</text>
          ${ic}
        </g>`;
      }).join('');
    }

    // ---------------------------------------------------------------- kamyon
    _kamyon(st, prev, anim) {
      const Y = st.yuk || [];
      const PY_ = prev.yuk || [];
      const hl = st.hl || {};
      this.A.kamyon = { x: TX + 100, y: GY + 120 };
      const kutular = Y.map((koli, i) => {
        const p = yukYeri(i);
        const K = CM.KOLI[koli];
        const fresh = anim && !PY_.includes(koli);
        const cls = hl[koli] ? ' is-' + hl[koli] : '';
        return `<g class="cmd-koli is-yuk${cls}${fresh ? ' is-new' : ''}"><rect x="${p.x}" y="${p.y}" width="84" height="40" rx="6"/><text class="cmd-koli-no" x="${p.x + 42}" y="${p.y + 18}" text-anchor="middle">${CM.kisa(koli)}</text><text class="cmd-koli-ad" x="${p.x + 42}" y="${p.y + 33}" text-anchor="middle">${esc(K.ad)}</text></g>`;
      }).join('');
      this.k.kamyon.innerHTML = `<g class="cmd-truck">
        <rect class="cmd-truck-kasa" x="${TX}" y="${GY}" width="200" height="${3 * CH + 2 * RG - 12}" rx="10"/>
        <text class="cmd-truck-t" x="${TX + 14}" y="${GY + 22}">kasa · ${Y.length} koli</text>
        <path class="cmd-truck-kabin" d="M${TX + 206} ${GY + 120} H${TX + 238} L${TX + TW} ${GY + 158} V${GY + 244} H${TX + 206} Z"/>
        <rect class="cmd-truck-cam" x="${TX + 214}" y="${GY + 130}" width="26" height="24" rx="3"/>
        <circle class="cmd-truck-teker" cx="${TX + 48}" cy="${GY + 252}" r="14"/><circle class="cmd-truck-teker" cx="${TX + 152}" cy="${GY + 252}" r="14"/><circle class="cmd-truck-teker" cx="${TX + 238}" cy="${GY + 252}" r="14"/>
        ${Y.length ? '' : `<text class="cmd-truck-bos" x="${TX + 100}" y="${GY + 128}" text-anchor="middle">boş</text>`}
        ${kutular}
      </g>`;
    }

    // ---------------------------------------------------------------- panel (çağıran)
    _panel(st, prev, anim) {
      const naive = st.mode === 'naive';
      const v1 = naive && st.v === 'v1';
      this.A.panel = { x: PX + PW, y: PY + 70 };
      this.A.panelIc = { x: PX + PW / 2, y: PY + 230 };
      const D = st.dugme;
      const btn = (key, label, x, y, kapali) => `<g class="cmd-dugme${D === key ? ' is-on' : ''}${kapali ? ' is-off' : ''}"><rect x="${x}" y="${y}" width="98" height="30" rx="8"/><text x="${x + 49}" y="${y + 20}" text-anchor="middle">${label}</text></g>`;
      let html = `<g class="cmd-panel rc rc-3${st.panelBos ? " is-bos" : ""}">
        <rect class="cmd-card-bg" x="${PX}" y="${PY}" width="${PW}" height="${PH}" rx="12"/>
        <circle class="cmd-ic-bg" cx="${PX + 27}" cy="${PY + 28}" r="17"/>${CM.icon('panel', PX + 15, PY + 16, 1)}
        <text class="cmd-card-t" x="${PX + 52}" y="${PY + 25}">OperatorPaneli</text>
        <text class="cmd-card-s" x="${PX + 52}" y="${PY + 42}">${naive ? 'tikla(islem) · switch' : 'yap(k) · geriAl() · yinele()'}</text>
        ${btn('tasi', 'Taşı', PX + 10, PY + 58)}${btn('yukle', 'Yükle', PX + 114, PY + 58)}
        ${btn('geri', '↶ Geri al', PX + 10, PY + 94, v1)}${btn('yinele', '↷ Yinele', PX + 114, PY + 94, naive)}`;
      if (naive) {
        html += `<text class="cmd-sec" x="${PX + 12}" y="${PY + 150}">Panelin içinde</text>
          <g class="cmd-switch"><rect x="${PX + 10}" y="${PY + 158}" width="${PW - 20}" height="76" rx="8"/>
            <text x="${PX + 20}" y="${PY + 178}">switch (islem) {</text>
            <text x="${PX + 32}" y="${PY + 197}">case "TASI" → depo…</text>
            <text x="${PX + 32}" y="${PY + 215}">case "YUKLE" → kamyon…</text>
          </g>
          <text class="cmd-sec-n" x="${PX + 12}" y="${PY + 256}">İstek bir dizgi; işi panel yapıyor.</text>`;
        if (!v1) {
          const S = st.slot || {};
          const alan = (ad, deger, y) => {
            const bos = deger === null || deger === undefined;
            const eski = !bos && S.sonIslem === null && ad !== 'sonIslem';
            return `<g class="cmd-alan${bos ? ' is-null' : ''}${eski ? ' is-eski' : ''}${st.slotHl === ad ? ' is-hl' : ''}"><text class="cmd-alan-k" x="${PX + 22}" y="${y}">${ad}</text><text class="cmd-alan-v" x="${PX + PW - 22}" y="${y}" text-anchor="end">${bos ? 'null' : esc('"' + deger + '"')}</text></g>`;
          };
          html += `<text class="cmd-sec" x="${PX + 12}" y="${PY + 292}">Son işlem kaydı (tek)</text>
            <rect class="cmd-hafiza" x="${PX + 10}" y="${PY + 300}" width="${PW - 20}" height="88" rx="8"/>
            ${alan('sonIslem', S.sonIslem, PY + 324)}${alan('sonKoli', S.sonKoli, PY + 348)}${alan('sonRaf', S.sonRaf, PY + 372)}
            <text class="cmd-sec-n${S.sonIslem === null && S.sonKoli ? ' is-bad' : ''}" x="${PX + 12}" y="${PY + 410}">${S.sonIslem === null && S.sonKoli ? 'kayıt silindi: geri alınacak yok' : 'yalnızca SON işlemi hatırlar'}</text>`;
        }
      } else {
        const G = st.gecmis || [];
        const I = st.ileri || [];
        const PG = (prev.gecmis || []).map((k) => k.id);
        const kartRow = (k, y, cls, fresh) => {
          const ad = k.ad.replace(' KRG-', ' ');
          return `<g class="cmd-yigin ${cls}${fresh ? ' is-new' : ''}"><rect x="${PX + 10}" y="${y}" width="${PW - 20}" height="30" rx="7"/><text class="cmd-yigin-t" x="${PX + 20}" y="${y + 19}"${fit(ad, PW - 96, 7)}>${esc(ad)}</text><text class="cmd-yigin-k" x="${PX + PW - 18}" y="${y + 19}" text-anchor="end">${k.kayit ? esc(k.kayit) : k.t === 'makro' ? '×' + (k.parca || []).length : '–'}</text></g>`;
        };
        const gor = G.slice().reverse().slice(0, 6);
        html += `<text class="cmd-sec" x="${PX + 12}" y="${PY + 150}">Geçmiş · geri al yığını</text>`;
        if (!gor.length) html += `<text class="cmd-sec-n" x="${PX + 12}" y="${PY + 176}">boş</text>`;
        gor.forEach((k, i) => (html += kartRow(k, PY + 158 + i * 35, 'is-gecmis' + (i === 0 ? ' is-top' : ''), anim && !PG.includes(k.id))));
        if (G.length > 6) html += `<text class="cmd-sec-n" x="${PX + 12}" y="${PY + 376}">+${G.length - 6} daha</text>`;
        const PI = (prev.ileri || []).map((k) => k.id);
        html += `<text class="cmd-sec" x="${PX + 12}" y="${PY + 388}">İleri · yinele yığını</text>`;
        const gorI = I.slice().reverse().slice(0, 2);
        if (!gorI.length) html += `<text class="cmd-sec-n" x="${PX + 12}" y="${PY + 412}">boş</text>`;
        gorI.forEach((k, i) => (html += kartRow(k, PY + 396 + i * 31, 'is-ileri', anim && !PI.includes(k.id))));
      }
      html += '</g>';
      this.k.panel.innerHTML = html;
    }

    // ---------------------------------------------------------------- alt bant: komut nesneleri ya da gece kuyruğu
    _bant(st, prev, anim) {
      const B = st.bant;
      if (!B) {
        this.k.bant.innerHTML = '';
        return;
      }
      let html = '';
      if (B.kind === 'gece') {
        html += `<g class="cmd-gece${B.naive ? ' is-naive' : ''}"><rect class="cmd-bant-bg" x="${BX}" y="${BY}" width="${BW}" height="${BH}" rx="12"/>
          ${CM.icon('ay', BX + 14, BY + 12, 0.9)}<text class="cmd-bant-t" x="${BX + 42}" y="${BY + 28}">GeceIsi · 02:00</text>
          <text class="cmd-bant-s" x="${BX + 170}" y="${BY + 28}">${B.naive ? 'plan: List&lt;String&gt; — metin satırları' : 'kuyruk: List&lt;Komut&gt; — komut nesneleri'}</text>`;
        const n = B.items.length;
        const iw = Math.min(212, (BW - 32 - (n - 1) * 14) / Math.max(1, n));
        B.items.forEach((it, i) => {
          const x = BX + 16 + i * (iw + 14);
          const y = BY + 44;
          this.A['gece:' + i] = { x: x + iw / 2, y: y + 40 };
          const DUR = { bekliyor: 'bekliyor', aktif: '▶ çalışıyor', ok: '✓ yapıldı', hata: '✗ bilinmeyen işlem' };
          const metin = B.naive ? '"' + it.satir + '"' : it.satir.replace(' KRG-', ' ');
          html += `<g class="cmd-is is-${it.durum}${B.naive ? ' is-metin' : ' is-komut'}">
            <rect x="${x}" y="${y}" width="${iw}" height="112" rx="9"/>
            <text class="cmd-is-n" x="${x + 12}" y="${y + 22}">${i + 1}.</text>
            <text class="cmd-is-t" x="${x + 30}" y="${y + 22}"${fit(metin, iw - 42, 7.4)}>${esc(metin)}</text>
            <text class="cmd-is-s" x="${x + 12}" y="${y + 46}">${B.naive ? 'String · kopya switch okur' : esc((it.kart && it.kart.t === 'tasi' ? 'TasiKomutu' : 'YukleKomutu') + (it.kart && it.kart.kayit ? ' · kayıt: ' + it.kart.kayit : ''))}</text>
            <g class="cmd-is-d"><rect x="${x + 10}" y="${y + 72}" width="${iw - 20}" height="26" rx="13"/><text x="${x + iw / 2}" y="${y + 90}" text-anchor="middle">${DUR[it.durum]}</text></g>
          </g>`;
        });
        html += '</g>';
      } else if (B.kind === 'kartlar') {
        html += `<g class="cmd-kartlar"><rect class="cmd-bant-bg" x="${BX}" y="${BY}" width="${BW}" height="${BH}" rx="12"/>
          ${CM.icon('komut', BX + 14, BY + 12, 0.9)}<text class="cmd-bant-t" x="${BX + 42}" y="${BY + 28}">Komut nesneleri</text>
          <text class="cmd-bant-s" x="${BX + 182}" y="${BY + 28}">${esc(B.not || 'her istek bir nesne: ne yapacağını ve nasıl geri alınacağını bilir')}</text>`;
        const n = B.kartlar.length;
        const kw = Math.min(330, (BW - 32 - (n - 1) * 14) / Math.max(1, n));
        const PK = (prev.bant && prev.bant.kartlar ? prev.bant.kartlar : []).map((x) => x.kart.id);
        B.kartlar.forEach((x, i) => {
          const k = x.kart;
          const kx = BX + 16 + i * (kw + 14);
          const ky = BY + 40;
          this.A['kart:' + k.id] = { x: kx + kw / 2, y: ky + 50 };
          const fresh = anim && !PK.includes(k.id);
          const tip = k.t === 'tasi' ? 'TasiKomutu' : k.t === 'yukle' ? 'YukleKomutu' : 'MakroKomut';
          const alanlar = k.t === 'tasi' ? [['koli', k.koli], ['hedef', k.hedef], ['onceki', k.kayit]] : k.t === 'yukle' ? [['koli', k.koli], ['raf', k.kayit]] : [['komutlar', (k.parca || []).length + ' yükleme']];
          const rows = alanlar
            .map(([a, deger], j) => {
              const kayit = (a === 'onceki' || a === 'raf') && k.t !== 'makro';
              return `<g class="cmd-kalan${kayit ? ' is-kayit' : ''}${kayit && !deger ? ' is-null' : ''}${kayit && x.yeniKayit ? ' is-hl' : ''}"><text class="cmd-alan-k" x="${kx + 14}" y="${ky + 48 + j * 20}">${a}${kayit ? ' ↶' : ''}</text><text class="cmd-alan-v" x="${kx + kw - 14}" y="${ky + 48 + j * 20}" text-anchor="end">${deger ? esc('"' + deger + '"') : 'null'}</text></g>`;
            })
            .join('');
          const metot = (m, mx) => `<g class="cmd-metot${x.metot === m ? ' is-on' : ''}"><rect x="${mx}" y="${ky + 96}" width="${(kw - 36) / 2}" height="22" rx="11"/><text x="${mx + (kw - 36) / 4}" y="${ky + 111}" text-anchor="middle">${m}()</text></g>`;
          html += `<g class="cmd-kart rc rc-4${x.durum ? ' is-' + x.durum : ''}${fresh ? ' is-new' : ''}">
            <rect class="cmd-kart-bg" x="${kx}" y="${ky}" width="${kw}" height="124" rx="10"/>
            <text class="cmd-kart-t" x="${kx + 14}" y="${ky + 22}">${esc(x.ad || 'k')} : <tspan class="cmd-kart-tip">${tip}</tspan></text>
            ${rows}
            ${metot('calistir', kx + 14)}${metot('geriAl', kx + 22 + (kw - 36) / 2)}
          </g>`;
        });
        html += '</g>';
      }
      this.k.bant.innerHTML = html;
    }

    // ---------------------------------------------------------------- jeton
    _token(t, anim) {
      const tok = this.k.tok;
      if (!t || !anim || DP.reducedMotion) {
        tok.classList.remove('is-on');
        return;
      }
      const a = this.A[t.from];
      const b = this.A[t.to];
      if (!a || !b) {
        tok.classList.remove('is-on');
        return;
      }
      const w = Math.max(70, t.text.length * 7.6 + 24);
      this.k['tok-bg'].setAttribute('x', String(-w / 2));
      this.k['tok-bg'].setAttribute('width', String(w));
      this.k['tok-t'].textContent = t.text;
      tok.setAttribute('class', 'cmd-token is-on is-' + (t.kind || 'req'));
      setTransform(tok, `translate(${a.x}px, ${a.y}px)`, false);
      void tok.getBoundingClientRect();
      setTransform(tok, `translate(${b.x}px, ${b.y}px)`, true);
      this._at(t.stay ? 1500 : 1000, () => tok.classList.remove('is-on'));
    }

    destroy() {
      this._stop();
      this.el.remove();
    }
  }
  CM.DepoSahne = DepoSahne;

  // ================================================================== durum yardımcıları (sahneler kullanır)
  /** Bir olayın anlık durumu → sahne durumu (taban) */
  CM.stateFrom = function (prog, s, x) {
    x = x || {};
    const naive = prog.design === 'naive';
    return Object.assign(
      {
        mode: naive ? 'naive' : 'komut',
        v: prog.v || 'v2',
        raflar: s.raflar,
        yuk: s.yuk,
        gecmis: s.gecmis,
        ileri: s.ileri,
        slot: s.slot,
      },
      x
    );
  };
  /** Gece kuyruğunun bant görünümü */
  CM.geceBant = (prog, s) => ({ kind: 'gece', naive: (prog.geceDesign || prog.design) === 'naive', items: s.kuyruk.map((q) => ({ satir: q.satir, durum: q.durum, kart: q.kart })) });
})();
