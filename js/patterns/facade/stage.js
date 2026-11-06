/*
 * Facade — animasyon sahnesi.
 *   FC.Merkez : gönderi merkezi. Solda istemciler (kasa, web, mobil, API), sağda alt sistem ofisleri
 *               (adres, tarife, ödeme, takip no, [sigorta], etiket, kurye, SMS), ortada (varsa) cephe masası.
 *     Kalıpsız: her istemci her ofise kabloyla bağlı (N × M bağımlılık); iş akışı istemci kartının içinde.
 *     Cephe   : istemciler yalnızca cepheye bağlı; cephe adımları sırayla ofislere iletir.
 *   Ofislerin son sonucu, istemcinin fişi, değişen dosya rozetleri ve istek jetonu durumdan çizilir.
 *
 * Durum tabanlı çizim: render(state, prevState, {animate}) — geri/ileri adımlarda tutarlı.
 */
(function () {
  'use strict';
  const FC = DP.fc;
  const esc = DP.esc;
  const md = (t) => DP.md(t, FC.roleOf);

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

  // ------------------------------------------------------------------ simgeler (24 × 24)
  const ICON = {
    kasa: '<rect x="3" y="11" width="18" height="10" rx="1.5"/><path d="M6 11 V5 H14 V11 M8 7.5 H12 M7 15 H9 M11 15 H13 M15 15 H17"/>',
    web: '<rect x="2.5" y="4" width="19" height="16" rx="2"/><path d="M2.5 8.5 H21.5"/><circle cx="5.5" cy="6.3" r="0.6"/><circle cx="8" cy="6.3" r="0.6"/>',
    mobil: '<rect x="6" y="1.5" width="12" height="21" rx="2.6"/><path d="M10 19 H14"/>',
    api: '<path d="M8 6 L3 12 L8 18 M16 6 L21 12 L16 18 M13.5 4.5 L10.5 19.5"/>',
    cephe: '<path d="M3 9 L12 3.5 L21 9 Z M4.5 21 H19.5 M6.5 10.5 V18 M10 10.5 V18 M14 10.5 V18 M17.5 10.5 V18 M4.5 18.5 H19.5"/>',
    adres: '<path d="M12 21.5 C12 21.5 5 14 5 9 a7 7 0 0 1 14 0 C19 14 12 21.5 12 21.5 Z"/><circle cx="12" cy="9" r="2.5"/>',
    tarife: '<path d="M3 12.5 L11.5 4 H20 V12.5 L11.5 21 Z"/><circle cx="15.8" cy="8.2" r="1.6"/>',
    odeme: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 9.5 H21.5 M6 15 H10"/>',
    takip: '<path d="M4 5 V19 M7 5 V19 M10.5 5 V19 M13 5 V19 M16.5 5 V19 M20 5 V19"/>',
    sigorta: '<path d="M12 2 L20 5 V11 Q20 17.5 12 22 Q4 17.5 4 11 V5 Z"/><path d="M8.5 12 L11 14.5 L15.5 9.5"/>',
    etiket: '<path d="M6 9 V3 H18 V9"/><rect x="3" y="9" width="18" height="8" rx="1.5"/><path d="M6.5 13.5 H17.5 V21 H6.5 Z"/>',
    kurye: '<path d="M2 16.5 V6 H14 V16.5 Z M14 9.5 H18.5 L21.5 13 V16.5 H14"/><circle cx="6.5" cy="17.5" r="2"/><circle cx="17.5" cy="17.5" r="2"/>',
    sms: '<path d="M3 4 H21 Q22 4 22 5 V15 Q22 16 21 16 H9 L4 20.5 V16 H3 Q2 16 2 15 V5 Q2 4 3 4 Z"/><path d="M6 8.5 H18 M6 12 H14"/>',
  };
  FC.icon = (k, x, y, s) => `<g class="fci fci-${k}" transform="translate(${x},${y})${s && s !== 1 ? ` scale(${s})` : ''}">${ICON[k]}</g>`;
  FC.ICON = ICON;

  // ================================================================== gönderi merkezi
  const W = 960;
  const H = 560;
  const CX = 16; // istemci kartları
  const CW = 230;
  const DX = 312; // cephe masası
  const DW = 236;
  const OX = 612; // ofisler
  const OW = 332;
  const OH = 48;
  const OG = 8;
  const TOP = 40;
  const ROWH = 25; // cephe masasındaki adım satırı
  const CHIP = { adres: 'adres', tarife: 'tarife', odeme: 'ödeme', takip: 'takip', sigorta: 'sigorta', etiket: 'etiket', kurye: 'kurye', sms: 'sms' };

  class Merkez {
    /** o: {cls} */
    constructor(root, o) {
      this.o = o || {};
      this.el = DP.h('div', { class: 'fm-stage fc-merkez' + (this.o.cls ? ' ' + this.o.cls : '') });
      root.appendChild(this.el);
      this.el.innerHTML = `
<svg class="fm-svg fc-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Gönderi merkezi: istemciler, cephe ve alt sistem ofisleri">
  <rect class="fc-bg" x="-1500" y="-1500" width="4000" height="4000"/>
  <g data-k="head"></g>
  <g data-k="wires"></g>
  <g data-k="offices"></g>
  <g data-k="desk"></g>
  <g data-k="clients"></g>
  <g data-k="fx"><g class="fc-token" data-k="tok"><g class="fc-token-in"><rect data-k="tok-bg" x="-60" y="-13" width="120" height="26" rx="13"/><text data-k="tok-t" x="0" y="5" text-anchor="middle"></text></g></g></g>
  <foreignObject class="bubble-fo" data-k="b-banner" x="16" y="508" width="928" height="50"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble fc-banner"></div></foreignObject>
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
     *   mode: 'naive'|'cephe', f: {limit, sigorta, kurye},
     *   clients: [{ist, musteri, cepheli, forgot, fis: {kind: 'ok'|'yok'|'hayalet'|'bekliyor', no}, hl, degisti}],
     *   desk: {aktif: altKey|'gonder'|'ret', adim: {altKey: 'ok'|'bad'|'skip'}, degisti} | null,
     *   offices: {altKey: {text, state: 'active'|'ok'|'bad'|'hayalet'|'skip', degisti: 'değişti'|'YENİ'|…}},
     *   token: {from, to, text, kind}, banner, sayac: {bag, cephe}
     * }
     */
    render(st, prev, o) {
      const anim = !!(o && o.animate);
      prev = prev || {};
      this._stop();
      this.A = {};
      const alt = FC.altOrder(st.f || {});
      const cephe = st.mode === 'cephe' || (st.clients || []).some((c) => c.cepheli) || !!st.desk;
      this._offices(st, prev, anim, alt);
      this._clients(st, prev, anim, alt);
      this._desk(st, prev, anim, alt, cephe);
      this._wires(st, alt, cephe);
      this._head(st, cephe);
      banner(this.k['b-banner'], st.banner);
      this._token(st.token, anim);
    }

    // ---------------------------------------------------------------- başlıklar ve sayaç
    _head(st, cephe) {
      const s = st.sayac;
      this.k.head.innerHTML = `
        <text class="fc-cap" x="${CX}" y="24">İstemciler</text>
        ${cephe ? `<text class="fc-cap is-cephe" x="${DX}" y="24">Cephe</text>` : ''}
        <text class="fc-cap" x="${OX}" y="24">Alt sistem sınıfları</text>
        ${s ? `<g class="fc-sayac${s.bag > 9 ? ' is-cok' : ''}"><text x="${W / 2}" y="499" text-anchor="middle">bağımlılık · istemci → alt sistem: <tspan class="fc-sayac-v">${s.bag}</tspan>${s.cephe ? ` · cephe → alt sistem: <tspan class="fc-sayac-v">${s.cephe}</tspan>` : ''}</text></g>` : ''}`;
    }

    // ---------------------------------------------------------------- ofisler (alt sistem sınıfları)
    _offices(st, prev, anim, alt) {
      const O = st.offices || {};
      const PO = prev.offices || {};
      const prevAlt = prev.f ? FC.altOrder(prev.f) : null;
      const STATE = { active: 'çalışıyor', ok: '✓', bad: '✗', hayalet: '⚠', skip: 'atlandı' };
      this.k.offices.innerHTML = alt
        .map((k, i) => {
          const A = FC.ALT[k];
          const y = TOP + i * (OH + OG);
          this.A['office:' + k] = { x: OX, y: y + OH / 2 };
          const s = O[k] || {};
          const fresh = anim && prevAlt && !prevAlt.includes(k);
          const changed = anim && PO[k] && PO[k].text !== s.text && s.text;
          let metin = (s.text || A.call).replace(/^(?:Ali Şahin|Ayşe Yılmaz|Zeynep Güneş|Can Demir): /, '');
          if (metin.length > 34) metin = metin.slice(0, 33) + '…';
          const pill = s.state && STATE[s.state] ? `<g class="fc-pill is-${s.state}"><rect x="${OX + OW - 74}" y="${y + 12}" width="62" height="22" rx="11"/><text x="${OX + OW - 43}" y="${y + 27}" text-anchor="middle">${STATE[s.state]}</text></g>` : '';
          const deg = s.degisti ? `<g class="fc-deg"><rect x="${OX + OW - 150}" y="${y - 7}" width="${s.degisti.length * 6.6 + 16}" height="17" rx="8.5"/><text x="${OX + OW - 142}" y="${y + 5}">${esc(s.degisti)}</text></g>` : '';
          return `<g class="fc-office rc rc-2${s.state ? ' is-' + s.state : ''}${fresh ? ' is-new' : ''}${changed ? ' is-changed' : ''}">
            <rect class="fc-office-bg" x="${OX}" y="${y}" width="${OW}" height="${OH}" rx="10"/>
            <circle class="fc-office-ic" cx="${OX + 25}" cy="${y + OH / 2}" r="15"/>${FC.icon(k, OX + 14, y + OH / 2 - 11, 0.92)}
            <text class="fc-office-t" x="${OX + 50}" y="${y + 20}">${esc(A.cls)}</text>
            <text class="fc-office-r" x="${OX + 50}" y="${y + 38}">${esc(metin)}</text>
            ${pill}${deg}
          </g>`;
        })
        .join('');
    }

    // ---------------------------------------------------------------- istemci kartları
    _clients(st, prev, anim, alt) {
      const C = st.clients || [];
      const PC = prev.clients || [];
      let y = TOP;
      this.k.clients.innerHTML = C.map((c, i) => {
        const I = FC.ISTEMCI[c.ist];
        const naive = !c.cepheli;
        const h = naive ? 104 : 82;
        const fresh = anim && !PC.some((p) => p.ist === c.ist);
        const y0 = y;
        y += h + 10;
        this.A['client:' + i] = { x: CX + CW, y: y0 + h / 2 };
        this.A['clientIn:' + i] = { x: CX + 40, y: y0 + h / 2 };
        let body;
        if (naive) {
          const chips = alt.slice();
          if (st.f && st.f.limit) chips.splice(chips.indexOf('odeme') + 1, 0, 'limit');
          body = chips
              .map((k, j) => {
                const col = j % 4;
                const row = Math.floor(j / 4);
                const cx = CX + 12 + col * 53;
                const cy = y0 + 46 + row * 21;
                const miss = k === 'limit' && c.forgot;
                const t = k === 'limit' ? (miss ? 'limit ✗' : 'limit ✓') : CHIP[k];
                return `<g class="fc-chip${k === 'limit' ? ' is-limit' : ''}${miss ? ' is-miss' : ''}"><rect x="${cx}" y="${cy}" width="49" height="18" rx="5"/><text x="${cx + 24.5}" y="${cy + 13}" text-anchor="middle">${t}</text></g>`;
              })
              .join('');
        } else body = `<g class="fc-chip is-cephe"><rect x="${CX + 12}" y="${y0 + 46}" width="${CW - 24}" height="20" rx="6"/><text x="${CX + CW / 2}" y="${y0 + 60}" text-anchor="middle">cephe.gonder(t)</text></g>`;
        const fis = c.fis;
        const fy = y0 + h - 8;
        const fisSvg = fis
          ? `<text class="fc-fis is-${fis.kind}" x="${CX + 12}" y="${fy}">${esc({ ok: '✓ fiş: ' + fis.no, yok: '✗ gönderi oluşturulmadı', hayalet: '⚠ hayalet gönderi: ' + fis.no, bekliyor: '… işleniyor' }[fis.kind])}</text>`
          : '';
        const deg = c.degisti ? `<g class="fc-deg"><rect x="${CX + CW - 64}" y="${y0 - 7}" width="62" height="17" rx="8.5"/><text x="${CX + CW - 56}" y="${y0 + 5}">değişti</text></g>` : '';
        return `<g class="fc-client rc rc-1 fc-c-${c.ist}${fresh ? ' is-new' : ''}${c.hl ? ' is-hl' : ''}${fis && fis.kind === 'hayalet' ? ' is-hayalet' : ''}">
          <rect class="fc-client-bg" x="${CX}" y="${y0}" width="${CW}" height="${h}" rx="12"/>
          ${FC.icon(c.ist, CX + 10, y0 + 9, 0.95)}
          <text class="fc-cl-t" x="${CX + 40}" y="${y0 + 22}">${esc(I.tag)}${c.musteri ? ' · ' + esc(c.musteri.split(' ')[0]) : ''}</text>
          <text class="fc-cl-s" x="${CX + 40}" y="${y0 + 37}">${esc(I.cls)}${naive ? ' · iş akışı içinde' : ''}</text>
          ${body}${fisSvg}${deg}
        </g>`;
      }).join('');
    }

    // ---------------------------------------------------------------- cephe masası
    _desk(st, prev, anim, alt, cephe) {
      if (!cephe) {
        this.k.desk.innerHTML = '';
        return;
      }
      const D = st.desk || {};
      const ad = D.adim || {};
      const steps = alt.slice();
      if (st.f && st.f.limit) steps.splice(steps.indexOf('odeme') + 1, 0, 'limit');
      const hgt = 56 + steps.length * ROWH + 34;
      const y0 = TOP + Math.max(0, ((OH + OG) * alt.length - OG - hgt) / 2);
      this.A['cephe:in'] = { x: DX, y: y0 + hgt / 2 };
      this.A['cephe:out'] = { x: DX + DW, y: y0 + hgt / 2 };
      this.A.cephe = { x: DX + DW / 2, y: y0 + 26 };
      const LBL = { adres: 'adres.dogrula()', tarife: 'tarife.hesapla()', odeme: 'odeme.cek()', limit: 'reddedilirse DUR', takip: 'takip.yeni()', sigorta: 'sigorta.police()', etiket: 'etiket.bas()', kurye: st.f && st.f.kurye ? 'kurye.planla()' : 'kurye.ata()', sms: 'sms.gonder()' };
      const MARK = { ok: '✓', bad: '✗', skip: '–', active: '▶' };
      const rows = steps
        .map((k, j) => {
          const y = y0 + 56 + j * ROWH;
          const s = D.aktif === k ? 'active' : ad[k] || '';
          return `<g class="fc-step${s ? ' is-' + s : ''}${k === 'limit' ? ' is-limit' : ''}"><rect x="${DX + 10}" y="${y - 16}" width="${DW - 20}" height="${ROWH - 3}" rx="6"/><text class="fc-step-n" x="${DX + 20}" y="${y}">${k === 'limit' ? '↳' : j + 1 - (steps.indexOf('limit') >= 0 && j > steps.indexOf('limit') ? 1 : 0)}</text><text class="fc-step-t" x="${DX + 40}" y="${y}">${esc(LBL[k])}</text><text class="fc-step-m" x="${DX + DW - 20}" y="${y}" text-anchor="end">${MARK[s] || ''}</text></g>`;
        })
        .join('');
      const deg = D.degisti ? `<g class="fc-deg"><rect x="${DX + DW - 64}" y="${y0 - 7}" width="62" height="17" rx="8.5"/><text x="${DX + DW - 56}" y="${y0 + 5}">değişti</text></g>` : '';
      const ret = D.ret ? `<text class="fc-desk-ret is-${D.ret.kind}" x="${DX + DW / 2}" y="${y0 + hgt - 12}" text-anchor="middle">${esc(D.ret.text)}</text>` : `<text class="fc-desk-ret" x="${DX + DW / 2}" y="${y0 + hgt - 12}" text-anchor="middle">gonder(t) → Optional&lt;String&gt;</text>`;
      const fresh = anim && !(prev.mode === 'cephe' || (prev.clients || []).some((c) => c.cepheli) || prev.desk);
      this.k.desk.innerHTML = `<g class="fc-desk rc rc-3${D.aktif ? ' is-active' : ''}${fresh ? ' is-new' : ''}">
        <rect class="fc-desk-bg" x="${DX}" y="${y0}" width="${DW}" height="${hgt}" rx="14"/>
        <path class="fc-desk-head" d="M${DX} ${y0 + 14} Q${DX} ${y0} ${DX + 14} ${y0} H${DX + DW - 14} Q${DX + DW} ${y0} ${DX + DW} ${y0 + 14} V${y0 + 40} H${DX} Z"/>
        ${FC.icon('cephe', DX + 10, y0 + 8, 0.95)}<text class="fc-desk-t" x="${DX + 40}" y="${y0 + 26}">cephe : <tspan class="fc-desk-cls">GonderiCephesi</tspan></text>
        ${rows}${ret}${deg}
      </g>`;
    }

    // ---------------------------------------------------------------- kablolar (bağımlılıklar)
    _wires(st, alt, cephe) {
      const C = st.clients || [];
      const live = st.wire || null; // {client: i, office: k} ya da {cephe: k}
      const path = (a, b, bend) => `M${a.x} ${a.y} C${a.x + bend} ${a.y}, ${b.x - bend} ${b.y}, ${b.x} ${b.y}`;
      let html = '';
      C.forEach((c, i) => {
        const a = this.A['client:' + i];
        if (!a) return;
        if (c.cepheli) {
          const b = this.A['cephe:in'];
          if (b) html += `<path class="fc-wire is-cephe${live && live.client === i && live.cephe ? ' is-live' : ''}" d="${path(a, b, 36)}"/>`;
        } else
          alt.forEach((k) => {
            const b = this.A['office:' + k];
            const on = live && live.client === i && live.office === k;
            html += `<path class="fc-wire fc-c-${c.ist}${on ? ' is-live' : ''}" d="${path(a, b, 150)}"/>`;
          });
      });
      if (cephe && C.some((c) => c.cepheli))
        alt.forEach((k) => {
          const a = this.A['cephe:out'];
          const b = this.A['office:' + k];
          const on = live && live.office === k && live.cephe;
          html += `<path class="fc-wire is-fan${on ? ' is-live' : ''}" d="${path(a, b, 28)}"/>`;
        });
      this.k.wires.innerHTML = html;
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
      const w = Math.max(80, t.text.length * 7.6 + 24);
      this.k['tok-bg'].setAttribute('x', String(-w / 2));
      this.k['tok-bg'].setAttribute('width', String(w));
      this.k['tok-t'].textContent = t.text;
      tok.setAttribute('class', 'fc-token is-on is-' + (t.kind || 'req'));
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
  FC.Merkez = Merkez;
})();
