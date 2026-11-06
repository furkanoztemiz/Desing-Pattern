/*
 * State — animasyon sahnesi.
 *   ST.DolapSahne : Malatya şubesinin akıllı kargo dolabı.
 *     Solda dolabın kendisi: ekran (durum), kapak penceresi (içindeki koliler), tuş takımı.
 *     Ortada bağlam kartı (dolap : KargoDolabi) — paket, kod, hatali ve durum alanı.
 *     Sağ üstte istekte bulunanlar (kurye, alıcı, yabancı, görevli) ve son istek/cevap.
 *     Altta durum × istek ızgarası:
 *       durum tasarımında sütunlar sınıflardır (BosDurum, DoluDurum, KilitliDurum …) ve bağlamın `durum` oku o anki
 *       sütunu gösterir; kalıpsız tasarımda satırlar metotlardır (her metot bütün durumları if/else ile sorar).
 *     Aynı dokuz davranış, iki farklı biçimde dilimlenir: metoda göre (if/else) ya da duruma göre (sınıflar).
 *
 * Durum tabanlı çizim: render(state, prevState, {animate}) — geri/ileri adımlarda tutarlı.
 */
(function () {
  'use strict';
  const ST = DP.sta;
  const esc = DP.esc;
  const md = (t) => DP.md(t, ST.roleOf);

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
    dolap: '<rect x="4" y="2.5" width="16" height="19" rx="2"/><path d="M4 8.5 H20 M4 15 H20 M15 11.5 H17 M15 18 H17 M15 5.5 H17"/>',
    kurye: '<path d="M2 16.5 V6 H14 V16.5 Z M14 9.5 H18.5 L21.5 13 V16.5 H14"/><circle cx="6.5" cy="17.5" r="2"/><circle cx="17.5" cy="17.5" r="2"/>',
    alici: '<circle cx="12" cy="7.5" r="4"/><path d="M4 21 Q4 13.5 12 13.5 Q20 13.5 20 21"/>',
    yabanci: '<circle cx="11" cy="7.5" r="4"/><path d="M3 21 Q3 13.5 11 13.5 Q19 13.5 19 21"/><path d="M17.5 2.5 Q21 2.5 21 5.5 Q21 7.5 19 8 V9.5"/><circle cx="19" cy="11.6" r="0.4"/>',
    gorevli: '<circle cx="8" cy="8" r="4.5"/><path d="M11.2 11.2 L20 20 M16.5 16.5 L18.5 14.5 M18.3 18.3 L20.3 16.3"/>',
    kilit: '<rect x="5" y="10.5" width="14" height="10.5" rx="2"/><path d="M8 10.5 V7.5 Q8 3.5 12 3.5 Q16 3.5 16 7.5 V10.5"/>',
    acik: '<rect x="5" y="10.5" width="14" height="10.5" rx="2"/><path d="M8 10.5 V7.5 Q8 3.5 12 3.5 Q16 3.5 16 7"/>',
  };
  ST.icon = (k, x, y, s) => `<g class="sti sti-${k}" transform="translate(${x},${y})${s && s !== 1 ? ` scale(${s})` : ''}">${ICON[k]}</g>`;
  ST.ICON = ICON;

  // ------------------------------------------------------------------ hücreler: her durumun her isteğe cevabı
  /** Durum tasarımında hücre: kısa davranış + geçiş hedefleri */
  ST.HUCRE = {
    BOS: { paketKoy: { t: 'paketi koy', to: ['DOLU'] }, kodGir: { t: '«dolap boş»' }, gorevliAc: { t: '«iş yok»' } },
    DOLU: { paketKoy: { t: '«dolu»' }, kodGir: { t: 'doğru · 3. yanlış', to: ['BOS', 'KILITLI'] }, gorevliAc: { t: '«kilitli değil»' } },
    KILITLI: { paketKoy: { t: '«kilitli»' }, kodGir: { t: '«kilitli»' }, gorevliAc: { t: 'kilidi aç', to: ['DOLU'] } },
    HIZMET: { paketKoy: { t: '«hizmet dışı»' }, kodGir: { t: '«hizmet dışı»' }, gorevliAc: { t: 'bakım bitti', to: ['BOS'] } },
  };
  const BAKIMA_AL = { t: 'bakıma al', to: ['HIZMET'] };
  /** Kalıpsız tasarımda hangi dal: [dal, hücre] — KİLİTLİ × paketKoy, BOŞ’un else dalına düşer */
  const DAL = {
    v1: {
      paketKoy: { BOS: ['else', { t: 'paketi koy', to: ['DOLU'] }], DOLU: ['if', { t: '«dolu»' }] },
      kodGir: { BOS: ['if', { t: '«dolap boş»' }], DOLU: ['else if · else', { t: 'doğru · «hatalı»', to: ['BOS'] }] },
    },
    v2: {
      paketKoy: { BOS: ['else', { t: 'paketi koy', to: ['DOLU'] }], DOLU: ['if', { t: '«dolu»' }], KILITLI: ['else (BOŞ sandı!)', { t: 'paketi koy', to: ['DOLU'], bad: true }] },
      kodGir: { BOS: ['if', { t: '«dolap boş»' }], DOLU: ['else if · else', { t: 'doğru · 3. yanlış', to: ['BOS', 'KILITLI'] }], KILITLI: ['else if', { t: '«kilitli»' }] },
      gorevliAc: { BOS: ['else', { t: '«iş yok»' }], DOLU: ['else if', { t: '«kilitli değil»' }], KILITLI: ['if', { t: 'kilidi aç', to: ['DOLU'] }] },
    },
  };
  ST.DAL = DAL;

  // ================================================================== sahne
  const W = 960;
  const H = 600;
  const LX = 16; // dolap
  const LW = 160;
  const CX = 196; // bağlam kartı
  const CY = 36;
  const CW = 320;
  const CH = 186;
  const AX = 536; // istekte bulunanlar
  const AW = 96;
  const GX = 196; // ızgara
  const GLW = 100; // istek adı sütunu
  const GY = 268;
  const HH = 40; // sütun başlığı
  const RY = GY + HH + 6; // ilk satır
  const RH = 56;
  const RG = 6;

  const AKTORLER = [
    { k: 'kurye', ad: 'Kurye', s: 'paketKoy', ic: 'kurye' },
    { k: 'alici', ad: 'Alıcı', s: 'doğru kod', ic: 'alici' },
    { k: 'yabanci', ad: 'Yabancı', s: 'yanlış kod', ic: 'yabanci' },
    { k: 'gorevli', ad: 'Görevli', s: 'gorevliAc', ic: 'gorevli' },
  ];
  /** İsteği yapan kişi */
  ST.aktorOf = (op) => (op.t === 'koy' ? 'kurye' : op.t === 'gorevli' ? 'gorevli' : ST.kimOf(op.kod) === 'yabancı' ? 'yabanci' : 'alici');
  ST.metotOf = (op) => (op.t === 'koy' ? 'paketKoy' : op.t === 'kod' ? 'kodGir' : 'gorevliAc');
  ST.cagriOf = (op) => (op.t === 'koy' ? `paketKoy("${op.koli}", "${ST.KOLI[op.koli].kod}")` : op.t === 'kod' ? `kodGir("${op.kod}")` : 'gorevliAc()');

  class DolapSahne {
    /** o: {cls} */
    constructor(root, o) {
      this.o = o || {};
      this.el = DP.h('div', { class: 'fm-stage sta-sahne' + (this.o.cls ? ' ' + this.o.cls : '') });
      root.appendChild(this.el);
      this.el.innerHTML = `
<svg class="fm-svg sta-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Akıllı kargo dolabı: dolap, bağlam nesnesi, istekte bulunanlar ve durum nesneleri">
  <defs><marker id="sta-ok-uc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" class="sta-ok-uc"/></marker></defs>
  <rect class="sta-bg" x="-1500" y="-1500" width="4000" height="4000"/>
  <g data-k="dolap"></g>
  <g data-k="baglam"></g>
  <g data-k="aktor"></g>
  <g data-k="istek"></g>
  <g data-k="izgara"></g>
  <path class="sta-ok" data-k="ok" marker-end="url(#sta-ok-uc)" d="M360 210 L360 262"/>
  <g data-k="fx"><g class="sta-token" data-k="tok"><g class="sta-token-in"><rect data-k="tok-bg" x="-60" y="-14" width="120" height="28" rx="14"/><text data-k="tok-t" x="0" y="5" text-anchor="middle"></text></g></g></g>
  <foreignObject class="bubble-fo" data-k="b-banner" x="16" y="540" width="928" height="56"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble sta-banner"></div></foreignObject>
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
     *   mode: 'durum'|'naive', v: 'v1'|'v2', bakim,
     *   durum, paket, kod, hatali, icerik: [koli], kuryede: [koli], teslim: [{koli, kime}],
     *   aktor: 'kurye'|'alici'|'yabanci'|'gorevli'|null, alici: ad,
     *   istek: {metot, cagri} | null, cevap: {t, tip} | null,
     *   hucre: {metot, durum, tip} | null (çalışan hücre), hedef: durum (geçişin hedefi),
     *   hl: {paket|kod|hatali|durum: true}, tuslar: '1111', kapak: true (kapak açılır),
     *   token: {from, to, text, kind}, banner
     * }
     */
    render(st, prev, o) {
      const anim = !!(o && o.animate);
      prev = prev || {};
      this._stop();
      this.A = {};
      this.cols = this._cols(st);
      this._dolap(st, prev, anim);
      this._baglam(st, prev, anim);
      this._aktor(st);
      this._istek(st, prev, anim);
      this._izgara(st, prev, anim);
      this._ok(st, anim);
      banner(this.k['b-banner'], st.banner);
      this._token(st.token, anim);
    }

    /** Sütunlar (durumlar) ve konumları */
    _cols(st) {
      const keys = st.mode === 'naive' && st.v === 'v1' ? ['BOS', 'DOLU'] : st.bakim ? ['BOS', 'DOLU', 'KILITLI', 'HIZMET'] : ['BOS', 'DOLU', 'KILITLI'];
      const x0 = GX + GLW + 6;
      const avail = W - 16 - x0;
      const gap = keys.length === 4 ? 14 : 22;
      const w = (avail - gap * (keys.length - 1)) / keys.length;
      const out = {};
      keys.forEach((k, i) => (out[k] = { x: x0 + i * (w + gap), w, i }));
      out.keys = keys;
      return out;
    }

    _rows(st) {
      return st.mode === 'naive' && st.v === 'v1' ? ['paketKoy', 'kodGir'] : ST.ISTEKLER;
    }

    // ---------------------------------------------------------------- dolabın kendisi
    _dolap(st, prev, anim) {
      const d = st.durum || 'BOS';
      const icerik = st.icerik || [];
      const kayip = icerik.filter((k) => k !== st.paket);
      const PI = prev.icerik || [];
      this.A.dolap = { x: LX + LW / 2, y: 228 };
      this.A.tus = { x: LX + LW / 2, y: 450 };
      const koliler = icerik
        .map((koli, i) => {
          const y = icerik.length > 1 ? 160 + i * 76 : 198;
          const K = ST.KOLI[koli];
          const kay = kayip.includes(koli);
          const fresh = anim && !PI.includes(koli);
          return `<g class="sta-koli${kay ? ' is-kayip' : ''}${fresh ? ' is-new' : ''}">
            <rect x="${LX + 30}" y="${y}" width="${LW - 60}" height="64" rx="6"/>
            <path class="sta-koli-bant" d="M${LX + LW / 2} ${y} V${y + 64}"/>
            <text class="sta-koli-no" x="${LX + LW / 2}" y="${y + 28}" text-anchor="middle">${ST.kisa(koli)}</text>
            <text class="sta-koli-ad" x="${LX + LW / 2}" y="${y + 48}" text-anchor="middle">${esc(kay ? 'kayıtsız!' : K.ad)}</text>
          </g>`;
        })
        .join('');
      const keys = [];
      '123456789*0#'.split('').forEach((c, i) => {
        const x = LX + 26 + (i % 3) * 38;
        const y = 400 + Math.floor(i / 3) * 29;
        keys.push(`<g class="sta-tus${st.tuslar && st.tuslar.includes(c) ? ' is-on' : ''}"><rect x="${x}" y="${y}" width="32" height="23" rx="4"/><text x="${x + 16}" y="${y + 16.5}" text-anchor="middle">${c}</text></g>`);
      });
      const kilitli = d === 'KILITLI';
      this.k.dolap.innerHTML = `<g class="sta-dolap sd-${d}">
        <rect class="sta-dolap-govde" x="${LX}" y="36" width="${LW}" height="494" rx="14"/>
        <text class="sta-dolap-t" x="${LX + LW / 2}" y="56" text-anchor="middle">Akıllı dolap · Malatya</text>
        <rect class="sta-ekran" x="${LX + 14}" y="66" width="${LW - 28}" height="46" rx="8"/>
        <text class="sta-ekran-t${anim && prev.durum && prev.durum !== d ? ' is-pop' : ''}" x="${LX + LW / 2}" y="96" text-anchor="middle"${fit(ST.AD[d], LW - 48, 11.5)}>${ST.AD[d]}</text>
        <circle class="sta-led" cx="${LX + LW - 22}" cy="76" r="4.5"/>
        <rect class="sta-goz" x="${LX + 14}" y="124" width="${LW - 28}" height="224" rx="8"/>
        <rect class="sta-pencere" x="${LX + 24}" y="142" width="${LW - 48}" height="180" rx="6"/>
        ${koliler}
        <g class="sta-kapak${st.kapak && anim ? ' is-acik' : ''}"><rect x="${LX + 14}" y="124" width="${LW - 28}" height="224" rx="8"/></g>
        <text class="sta-goz-no" x="${LX + 26}" y="340">GÖZ 7</text>
        <g class="sta-kilit${kilitli ? ' is-on' : ''}">${ST.icon(kilitli ? 'kilit' : 'acik', LX + LW - 46, 322, 0.86)}</g>
        <rect class="sta-tus-bg" x="${LX + 18}" y="360" width="${LW - 36}" height="160" rx="8"/>
        <text class="sta-tus-ekran" x="${LX + LW / 2}" y="388" text-anchor="middle">${st.tuslar ? esc(st.tuslar.split('').join(' ')) : '_ _ _ _'}</text>
        ${keys.join('')}
      </g>`;
    }

    // ---------------------------------------------------------------- bağlam kartı
    _baglam(st, prev, anim) {
      const naive = st.mode === 'naive';
      const hl = st.hl || {};
      const d = st.durum || 'BOS';
      const ayni = prev.mode === st.mode;
      this.A.baglam = { x: CX + CW / 2, y: CY + 36 };
      this.A.durumAlan = { x: CX + 164, y: CY + CH - 10 };
      const q = (v) => (v === null || v === undefined ? 'null' : '"' + v + '"');
      const alan = (ad, deger, y, cls) => {
        const degisti = anim && ayni && JSON.stringify(prev[ad]) !== JSON.stringify(st[ad]);
        return `<g class="sta-alan${cls || ''}${hl[ad] ? ' is-hl' : ''}${degisti ? ' is-changed' : ''}">
          <text class="sta-alan-k" x="${CX + 16}" y="${y}">${ad}</text>
          <text class="sta-alan-v" x="${CX + CW - 16}" y="${y}" text-anchor="end">${esc(deger)}</text>
        </g>`;
      };
      const hatali = st.hatali || 0;
      const durumDeger = naive ? '"' + ST.AD[d] + '"' : '→ ' + ST.SINIF[d] + ' nesnesi';
      this.k.baglam.innerHTML = `<g class="sta-baglam rc rc-3">
        <rect class="sta-kart-bg" x="${CX}" y="${CY}" width="${CW}" height="${CH}" rx="12"/>
        <circle class="sta-ic-bg" cx="${CX + 27}" cy="${CY + 27}" r="17"/>${ST.icon('dolap', CX + 15, CY + 15, 1)}
        <text class="sta-kart-t" x="${CX + 52}" y="${CY + 24}">dolap : KargoDolabi</text>
        <text class="sta-kart-s" x="${CX + 52}" y="${CY + 42}">${naive ? 'durum bir dizgi · her metotta if/else' : 'istekleri durum nesnesine devreder'}</text>
        ${alan('paket', q(st.paket), CY + 72, st.paket == null ? ' is-null' : '')}
        ${alan('kod', q(st.kod), CY + 98, st.kod == null ? ' is-null' : '')}
        ${alan('hatali', hatali + (hatali > 3 ? '  (> 3!)' : ''), CY + 124, hatali > 3 ? ' is-bad' : '')}
        <g class="sta-durum-alan sd-${d}${hl.durum ? ' is-hl' : ''}${anim && ayni && prev.durum && prev.durum !== d ? ' is-changed' : ''}">
          <rect x="${CX + 8}" y="${CY + 136}" width="${CW - 16}" height="42" rx="8"/>
          <text class="sta-alan-k" x="${CX + 18}" y="${CY + 162}">durum</text>
          <text class="sta-durum-v" x="${CX + CW - 18}" y="${CY + 162}" text-anchor="end">${esc(durumDeger)}</text>
        </g>
      </g>`;
    }

    // ---------------------------------------------------------------- istekte bulunanlar
    _aktor(st) {
      const kuryede = st.kuryede || [];
      const teslim = st.teslim || [];
      this.k.aktor.innerHTML = AKTORLER.map((a, i) => {
        const x = AX + i * (AW + 8);
        const y = 36;
        this.A['aktor:' + a.k] = { x: x + AW / 2, y: y + 74 };
        let ad = a.ad;
        let not = '';
        if (a.k === 'alici' && st.alici) ad = st.alici;
        if (a.k === 'kurye' && kuryede.length) not = 'elinde: ' + kuryede.map(ST.kisa).join(', ');
        if (a.k === 'alici') {
          const aldi = teslim.filter((t) => t.kime !== 'yabancı').map((t) => ST.kisa(t.koli));
          if (aldi.length) not = '✓ aldı: ' + aldi.join(', ');
        }
        return `<g class="sta-aktor${st.aktor === a.k ? ' is-on' : ''}">
          <rect x="${x}" y="${y}" width="${AW}" height="96" rx="10"/>
          ${ST.icon(a.ic, x + AW / 2 - 12, y + 9, 1)}
          <text class="sta-aktor-ad" x="${x + AW / 2}" y="${y + 52}" text-anchor="middle">${esc(ad)}</text>
          <text class="sta-aktor-s" x="${x + AW / 2}" y="${y + 69}" text-anchor="middle">${esc(a.s)}</text>
          ${not ? `<text class="sta-aktor-not" x="${x + AW / 2}" y="${y + 87}" text-anchor="middle"${fit(not, AW - 10, 6.6)}>${esc(not)}</text>` : ''}
        </g>`;
      }).join('');
    }

    // ---------------------------------------------------------------- son istek ve cevap
    _istek(st, prev, anim) {
      const naive = st.mode === 'naive';
      const x = AX;
      const y = 142;
      const w = W - 16 - AX;
      const I = st.istek;
      const C = st.cevap;
      let html = `<g class="sta-istek"><rect class="sta-istek-bg" x="${x}" y="${y}" width="${w}" height="80" rx="10"/>`;
      if (!I) {
        html += `<text class="sta-istek-bos" x="${x + 14}" y="${y + 46}">henüz istek yok</text>`;
      } else {
        const ic = `dolap.${I.cagri}`;
        const devret = I.devret || (naive ? 'if (durum.equals(…)) … else …' : `durum.${I.metot}(this, …)`);
        html += `<text class="sta-istek-k" x="${x + 14}" y="${y + 23}">istek</text><text class="sta-istek-v" x="${x + 76}" y="${y + 23}"${fit(ic, w - 90, 7.9)}>${esc(ic)}</text>
          <text class="sta-istek-k" x="${x + 14}" y="${y + 46}">${naive ? 'içeride' : 'devret'}</text><text class="sta-istek-d${naive ? ' is-naive' : ''}" x="${x + 76}" y="${y + 46}"${fit(devret, w - 90, 7.6)}>${esc(devret)}</text>`;
        if (C) {
          const fresh = anim && (!prev.cevap || prev.cevap.t !== C.t);
          html += `<text class="sta-istek-k" x="${x + 14}" y="${y + 69}">cevap</text><text class="sta-cevap is-${C.tip}${fresh ? ' is-pop' : ''}" x="${x + 76}" y="${y + 69}"${fit(C.t, w - 90, 7.9)}>${esc(C.t)}</text>`;
        }
      }
      html += '</g>';
      this.k.istek.innerHTML = html;
    }

    // ---------------------------------------------------------------- durum × istek ızgarası
    _izgara(st, prev, anim) {
      const naive = st.mode === 'naive';
      const C = this.cols;
      const rows = this._rows(st);
      const d = st.durum || 'BOS';
      const H_ = st.hucre;
      const ROWS = rows.map((m, r) => ({ m, y: RY + r * (RH + RG) }));
      const bottom = ROWS[ROWS.length - 1].y + RH;
      let html = '';
      html += `<text class="sta-iz-kose" x="${GX + 4}" y="${GY + 16}">istek ↓</text><text class="sta-iz-kose" x="${GX + 4}" y="${GY + 33}">durum →</text>`;
      if (naive) {
        // metot kutuları: her satır bir metot, içinde bütün durumlar (if/else)
        ROWS.forEach((R) => {
          const on = H_ && H_.metot === R.m;
          html += `<rect class="sta-metot-kutu${on ? ' is-on' : ''}" x="${GX - 6}" y="${R.y - 3}" width="${W - 16 - GX + 10}" height="${RH + 6}" rx="10"/>`;
        });
      } else {
        // sınıf kutuları: her sütun bir durum sınıfı, içinde bütün istekler
        C.keys.forEach((k) => {
          const c = C[k];
          html += `<rect class="sta-sinif-kutu sd-${k}${k === d ? ' is-on' : ''}" x="${c.x - 4}" y="${GY - 4}" width="${c.w + 8}" height="${bottom - GY + 8}" rx="12"/>`;
        });
      }
      ROWS.forEach((R) => {
        const on = H_ && H_.metot === R.m;
        html += `<text class="sta-iz-satir${on ? ' is-on' : ''}" x="${GX + 4}" y="${R.y + RH / 2 + 5}">${R.m}()</text>`;
      });
      // başlıklar
      C.keys.forEach((k) => {
        const c = C[k];
        this.A['baslik:' + k] = { x: c.x + c.w / 2, y: GY + HH / 2 };
        const baslik = naive ? `"${ST.AD[k]}"` : ST.SINIF[k];
        html += `<g class="sta-baslik sd-${k}${k === d ? ' is-on' : ''}${st.hedef === k ? ' is-hedef' : ''}">
          <rect x="${c.x}" y="${GY}" width="${c.w}" height="${HH}" rx="8"/>
          <text class="sta-baslik-t" x="${c.x + c.w / 2}" y="${GY + (naive ? 26 : 18)}" text-anchor="middle"${fit(baslik, c.w - 14, 8.6)}>${esc(baslik)}</text>
          ${naive ? '' : `<text class="sta-baslik-s" x="${c.x + c.w / 2}" y="${GY + 34}" text-anchor="middle">${ST.AD[k]}</text>`}
        </g>`;
      });
      // hücreler
      ROWS.forEach((R) => {
        C.keys.forEach((k) => {
          const c = C[k];
          let dal = null;
          let cell;
          if (naive) {
            const D = DAL[st.v === 'v1' ? 'v1' : 'v2'][R.m];
            if (!D || !D[k]) return;
            dal = D[k][0];
            cell = D[k][1];
          } else cell = k === 'BOS' && R.m === 'gorevliAc' && st.bakim ? BAKIMA_AL : ST.HUCRE[k][R.m];
          const x = c.x;
          const y = R.y;
          this.A['hucre:' + R.m + ':' + k] = { x: x + c.w / 2, y: y + RH / 2 };
          const aktif = H_ && H_.metot === R.m && H_.durum === k;
          const tip = aktif ? H_.tip || 'on' : '';
          const iki = !!(cell.to && cell.to.length);
          const ty = naive ? (iki ? y + 31 : y + 38) : iki ? y + 23 : y + 34;
          let hedefler = '';
          if (iki) {
            const n = cell.to.length;
            const cw = Math.min(92, (c.w - 16 - (n - 1) * 6) / n);
            const cy = naive ? y + 36 : y + 31;
            cell.to.forEach((t, j) => {
              const cx = x + c.w / 2 - (n * cw + (n - 1) * 6) / 2 + j * (cw + 6);
              const lbl = '→ ' + ST.AD[t];
              hedefler += `<g class="sta-hedef sd-${t}${aktif && st.hedef === t ? ' is-on' : ''}"><rect x="${cx}" y="${cy}" width="${cw}" height="18" rx="9"/><text x="${cx + cw / 2}" y="${cy + 13}" text-anchor="middle"${fit(lbl, cw - 8, 7)}>${esc(lbl)}</text></g>`;
            });
          }
          const yazi = cell.t + (cell.bad ? ' ⚠' : '');
          html += `<g class="sta-hucre${cell.bad ? ' is-bug' : ''}${aktif ? ' is-aktif is-' + tip : ''}${aktif && anim ? ' is-new' : ''}">
            <rect class="sta-hucre-bg" x="${x + 3}" y="${y}" width="${c.w - 6}" height="${RH}" rx="7"/>
            ${dal ? `<text class="sta-dal" x="${x + 10}" y="${y + 14}"${fit(dal, c.w - 20, 6.4)}>${esc(dal)}</text>` : ''}
            <text class="sta-hucre-t" x="${x + c.w / 2}" y="${ty}" text-anchor="middle"${fit(yazi, c.w - 16, 7.4)}>${esc(yazi)}</text>
            ${hedefler}
          </g>`;
        });
      });
      this.k.izgara.innerHTML = `<g class="sta-izgara${naive ? ' is-naive' : ' is-durum'}">${html}</g>`;
    }

    // ---------------------------------------------------------------- bağlamın durum oku
    _ok(st, anim) {
      const ok = this.k.ok;
      if (st.mode === 'naive') {
        ok.classList.add('is-off');
        return;
      }
      const c = this.cols[st.durum || 'BOS'];
      const x1 = CX + 164;
      const y1 = CY + CH - 8;
      const x2 = c.x + c.w / 2;
      const y2 = GY - 7;
      const d = `M${x1} ${y1} C${x1} ${y1 + 30}, ${x2} ${y2 - 30}, ${x2} ${y2}`;
      ok.setAttribute('class', 'sta-ok');
      if (!anim || DP.reducedMotion) {
        ok.style.transition = 'none';
        ok.setAttribute('d', d);
        ok.style.d = `path("${d}")`;
        void ok.getBoundingClientRect();
        ok.style.transition = '';
      } else {
        ok.setAttribute('d', d);
        ok.style.d = `path("${d}")`;
      }
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
      const w = Math.max(70, t.text.length * 8 + 26);
      this.k['tok-bg'].setAttribute('x', String(-w / 2));
      this.k['tok-bg'].setAttribute('width', String(w));
      this.k['tok-t'].textContent = t.text;
      tok.setAttribute('class', 'sta-token is-on is-' + (t.kind || 'req'));
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
  ST.DolapSahne = DolapSahne;

  // ================================================================== durum yardımcıları (sahneler kullanır)
  /** Bir anlık durum (run snapshot) → sahne durumu (taban) */
  ST.stateFrom = function (prog, s, x) {
    x = x || {};
    const naive = prog.design !== 'durum';
    return Object.assign(
      {
        mode: naive ? 'naive' : 'durum',
        v: prog.design === 'v1' ? 'v1' : 'v2',
        bakim: !naive && !!prog.bakim,
        durum: s.durum,
        paket: s.paket,
        kod: s.kod,
        hatali: s.hatali,
        icerik: s.icerik,
        kuryede: s.kuryede,
        teslim: s.teslim,
      },
      x
    );
  };
  /** Başlangıç anı (hiçbir istek yokken) */
  ST.BOS_AN = { durum: 'BOS', paket: null, kod: null, hatali: 0, icerik: [], kuryede: [], teslim: [] };
})();
