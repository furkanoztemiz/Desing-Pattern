/*
 * Strategy — animasyon sahnesi.
 *   SG.HaritaSahne : Malatya kuryesinin günü.
 *     Solda temsili harita: depo, altı durak (iğnedeki sayı randevu sırası, kar tanesi soğuk zincir), teslim edilen
 *       bacaklar (rengi, o durağı seçen algoritmanın rengi; kurala aykırı adım kırmızı kesikli) ve kuryenin kamyoneti.
 *     Sağda kurye nesnesi: rota algoritması nerede duruyor? Kalıpsızda Kurye’nin içindeki if/else dalları; kalıtımda
 *       kuryenin sınıfı; Strategy’de bir yuva ve içine takılan strateji nesnesi (öteki stratejiler rafta). Altında
 *       kuryenin `kalan` listesi: listenin gerçek sırası, randevu numaralarıyla. Liste karışırsa satırlar yer değiştirir.
 *       En altta günün teslim sırası (randevu numaraları; kurala aykırı adımlar kırmızı).
 *   o.nesne: yalnızca kurye nesnesi, geniş ve büyük (Çözüm sahnesi): solda algoritma, sağda liste, altta teslim sırası.
 *
 * Durum tabanlı çizim: render(state, prevState, {animate}) — geri/ileri adımlarda tutarlı.
 */
(function () {
  'use strict';
  const SG = DP.stg;
  const esc = DP.esc;
  const md = (t) => DP.md(t, SG.roleOf);

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

  // ------------------------------------------------------------------ küçük çizimler
  /** Kar tanesi (soğuk zincir): üç çizgi */
  SG.kar = (x, y, r) => {
    let d = '';
    for (let k = 0; k < 3; k++) {
      const a = (k * Math.PI) / 3;
      const dx = Math.cos(a) * r;
      const dy = Math.sin(a) * r;
      d += `M${(x - dx).toFixed(1)} ${(y - dy).toFixed(1)} L${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)} `;
    }
    return `<path class="stg-kar" d="${d.trim()}"/>`;
  };
  /** Kamyonet (merkezi 0,0) */
  const VAN = '<g class="stg-van-in"><rect class="stg-van-kasa" x="-16" y="-11" width="20" height="16" rx="2.5"/><path class="stg-van-kabin" d="M4 -7 H11 L15 -1 V5 H4 Z"/><circle class="stg-van-teker" cx="-9" cy="6" r="3.4"/><circle class="stg-van-teker" cx="9" cy="6" r="3.4"/></g>';
  SG.VAN = VAN;
  /** Kilit simgesi */
  const kilit = (x, y) => `<g class="stg-kilit" transform="translate(${x},${y})"><rect x="-6.5" y="-1" width="13" height="10" rx="2"/><path d="M-3.8 -1 V-4.2 A3.8 3.8 0 0 1 3.8 -4.2 V-1"/></g>`;

  // ================================================================== sahne
  const W = 960;
  const H = 600;
  const MX = 32; // harita ızgarası: 12 × 8 km, kare 44 px
  const MY = 72;
  const C = 44;
  const px = (x) => MX + x * C;
  const py = (y) => MY + y * C;
  SG.px = px;
  SG.py = py;
  /** Kurye nesnesinin yerleşimi: tam sahnede sağ panel, nesne kipinde iki sütun */
  const GEO = {
    tam: { cerceve: [600, 40, 344, 492], baslik: [616, 69], alg: [600, 100, 344], liste: [600, 284, 344], RH: 31, serit: [616, 516, 312], banner: [16, 540, 928] },
    nesne: { cerceve: [16, 40, 928, 352], baslik: [32, 70], alg: [24, 102, 456], liste: [500, 102, 436], RH: 34, serit: [32, 370, 896], banner: [96, 398, 768] },
  };
  /** Durak etiketlerinin yeri (iğneye göre) */
  const ETIKET = {
    'KRG-1001': { dx: 19, dy: -7, a: 'start' },
    'KRG-1004': { dx: 19, dy: -7, a: 'start' },
    'KRG-1005': { dx: 0, dy: 34, a: 'middle' },
    'KRG-1006': { dx: 19, dy: -7, a: 'start' },
    'KRG-1007': { dx: -19, dy: -7, a: 'end' },
    'KRG-1008': { dx: 19, dy: -7, a: 'start' },
  };
  /** Bacak yolu: önce yatay, sonra dikey (sokaklar ızgara) */
  const yol = (a, b) => `M${px(a.x)} ${py(a.y)} H${px(b.x)} V${py(b.y)}`;
  SG.yolD = yol;
  const RENK = { RANDEVU: 'randevu', EN_YAKIN: 'yakin', SOGUK: 'soguk', AGIR: 'agir' };
  SG.RENK = RENK;
  const NAIVE = ['v1', 'v11', 'v2'];
  const STRATEJI = ['r1', 'r2', 'strateji'];

  class HaritaSahne {
    /** o: {cls, nesne: yalnızca kurye nesnesi (geniş)} */
    constructor(root, o) {
      this.o = o || {};
      this.g = this.o.nesne ? GEO.nesne : GEO.tam;
      this.el = DP.h('div', { class: 'fm-stage stg-sahne' + (this.o.nesne ? ' is-nesne' : '') + (this.o.cls ? ' ' + this.o.cls : '') });
      root.appendChild(this.el);
      const b = this.g.banner;
      const harita = this.o.nesne
        ? ''
        : `<text class="stg-cap" x="16" y="26">Malatya · temsili harita</text>
  <g data-k="harita">${this._harita()}</g>
  <g data-k="bacaklar"></g>
  <g data-k="onizleme"></g>
  <g data-k="pinler"></g>
  <g data-k="mesafe"></g>
  <g data-k="van" class="stg-van">${VAN}</g>
  <g data-k="ozet"></g>`;
      this.el.innerHTML = `
<svg class="fm-svg stg-svg" viewBox="0 0 ${W} ${this.o.nesne ? 456 : H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${this.o.nesne ? 'Kurye nesnesi: rota algoritmasının yeri ve kuryenin listesi' : 'Malatya haritasında kuryenin rotası ve kurye nesnesindeki rota algoritması'}">
  <rect class="stg-bg" x="-1500" y="-1500" width="4000" height="4000"/>
  ${harita}
  <text class="stg-cap is-sag" x="${this.g.cerceve[0]}" y="26">Kurye nesnesi</text>
  <g data-k="panel"></g>
  <foreignObject class="bubble-fo" data-k="b-banner" x="${b[0]}" y="${b[1]}" width="${b[2]}" height="56"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble stg-banner"></div></foreignObject>
</svg>`;
      this.svg = this.el.querySelector('svg');
      this.k = {};
      DP.$$('[data-k]', this.el).forEach((n) => (this.k[n.getAttribute('data-k')] = n));
      this.timers = [];
    }

    _stop() {
      this.timers.forEach(clearTimeout);
      this.timers = [];
    }

    _at(ms, fn) {
      this.timers.push(setTimeout(fn, DP.dur(ms)));
    }

    // ---------------------------------------------------------------- sabit harita
    _harita() {
      let g = `<rect class="stg-harita-bg" x="16" y="40" width="560" height="400" rx="12"/>`;
      for (let x = 0; x <= 12; x++) g += `<line class="stg-sokak${x === 6 ? ' is-cadde' : ''}" x1="${px(x)}" y1="${py(0)}" x2="${px(x)}" y2="${py(8)}"/>`;
      for (let y = 0; y <= 8; y++) g += `<line class="stg-sokak${y === 4 ? ' is-cadde' : ''}" x1="${px(0)}" y1="${py(y)}" x2="${px(12)}" y2="${py(y)}"/>`;
      const d = SG.DEPO;
      g += `<g class="stg-depo"><rect x="${px(d.x) - 17}" y="${py(d.y) - 13}" width="34" height="24" rx="3"/><path d="M${px(d.x) - 21} ${py(d.y) - 11} L${px(d.x)} ${py(d.y) - 25} L${px(d.x) + 21} ${py(d.y) - 11}"/><text x="${px(d.x)}" y="${py(d.y) + 6}" text-anchor="middle">D</text></g>`;
      g += `<text class="stg-depo-t" x="${px(d.x) + 27}" y="${py(d.y) - 10}">Depo</text>`;
      g += `<text class="stg-olcek" x="${px(12)}" y="433" text-anchor="end">1 kare = 1 km · yol = |dx| + |dy|</text>`;
      return g;
    }

    /**
     * st: {
     *   mode, s (anlık durum), agir (rafta AgirOnceRota), secilen, beklenen (no), sirala {once, sonra},
     *   red (kalıtımda geri çevrilen istek), cokus, mesafeler [{no, km}], aday [no], onizleme (no),
     *   vurgu: 'slot'|'liste', yeni (rafa yeni giren strateji), serit (teslim sırası: [{no, yanlis}]), banner
     * }
     */
    render(st, prev, o) {
      const anim = !!(o && o.animate) && !DP.reducedMotion;
      prev = prev || {};
      this._stop();
      if (!this.o.nesne) {
        this._bacaklar(st, prev, anim);
        this._onizleme(st);
        this._pinler(st);
        this._mesafe(st);
        this._van(st, prev, anim);
        this._ozet(st);
      }
      this._panel(st, prev, anim);
      banner(this.k['b-banner'], st.banner);
    }

    // ---------------------------------------------------------------- harita: bacaklar, iğneler, kamyonet
    _bacaklar(st, prev, anim) {
      const B = st.s.bacaklar;
      const pb = prev.s ? prev.s.bacaklar.length : 0;
      const yeni = anim && B.length === pb + 1 ? B.length - 1 : -1;
      this.k.bacaklar.innerHTML = B.map((b, k) => `<path class="stg-bacak is-${RENK[b.algo]}${b.yanlis ? ' is-yanlis' : ''}${k === yeni ? ' is-yeni' : ''}" d="${yol(b.from, b.to)}"${k === yeni ? ` style="--len:${b.yol * C}"` : ''}/>`).join('');
    }

    _onizleme(st) {
      const g = this.k.onizleme;
      if (!st.onizleme) return (g.innerHTML = '');
      const d = SG.durak(st.onizleme);
      g.innerHTML = `<path class="stg-onizleme" d="${yol(st.s.konum, d)}"/>`;
    }

    _pinler(st) {
      const s = st.s;
      const teslim = new Set(s.teslim);
      const yanlisNo = new Set(s.bacaklar.filter((b) => b.yanlis).map((b) => b.no));
      const aday = st.aday ? new Set(st.aday) : null;
      let html = '';
      SG.DURAKLAR.forEach((d) => {
        const x = px(d.x);
        const y = py(d.y);
        const e = ETIKET[d.no];
        const cls = ['stg-pin'];
        if (teslim.has(d.no)) cls.push('is-teslim');
        if (yanlisNo.has(d.no)) cls.push('is-yanlis');
        if (st.secilen === d.no) cls.push(st.beklenen && st.beklenen !== d.no ? 'is-hatali' : 'is-secili');
        if (st.beklenen && st.beklenen !== st.secilen && st.beklenen === d.no) cls.push('is-beklenen');
        if (aday && !aday.has(d.no) && !teslim.has(d.no)) cls.push('is-soluk');
        html += `<g class="${cls.join(' ')}">
          <circle class="stg-pin-c" cx="${x}" cy="${y}" r="14"/>
          <text class="stg-pin-n" x="${x}" y="${y + 5}" text-anchor="middle">${teslim.has(d.no) ? '✓' : d.sira}</text>
          ${d.soguk ? `<g class="stg-pin-kar"><circle cx="${x}" cy="${y + 23}" r="8"/>${SG.kar(x, y + 23, 5.2)}</g>` : ''}
          <text class="stg-pin-ad" x="${x + e.dx}" y="${y + e.dy}" text-anchor="${e.a}">${esc(d.alici)}</text>
          <text class="stg-pin-yer" x="${x + e.dx}" y="${y + e.dy + 17}" text-anchor="${e.a}">${esc(d.yer)} · ${d.kg} kg</text>
        </g>`;
      });
      this.k.pinler.innerHTML = html;
    }

    _mesafe(st) {
      const g = this.k.mesafe;
      if (!st.mesafeler) return (g.innerHTML = '');
      const enAz = Math.min(...st.mesafeler.map((m) => m.km));
      g.innerHTML = st.mesafeler
        .map((m) => {
          const d = SG.durak(m.no);
          const x = px(d.x);
          const y = py(d.y) - 32;
          const w = m.km >= 10 ? 60 : 52;
          return `<g class="stg-km${m.km === enAz ? ' is-min' : ''}"><rect x="${x - w / 2}" y="${y - 13}" width="${w}" height="24" rx="12"/><text x="${x}" y="${y + 4}" text-anchor="middle">${m.km} km</text></g>`;
        })
        .join('');
    }

    _van(st, prev, anim) {
      const g = this.k.van;
      const s = st.s;
      const hedef = `translate(${px(s.konum.x)}px, ${py(s.konum.y)}px)`;
      const pb = prev.s ? prev.s.bacaklar.length : -1;
      g.classList.toggle('is-cokus', !!st.cokus);
      if (anim && prev.s && s.bacaklar.length === pb + 1) {
        const b = s.bacaklar[s.bacaklar.length - 1];
        setTransform(g, `translate(${px(b.from.x)}px, ${py(b.from.y)}px)`, false);
        const kose = `translate(${px(b.to.x)}px, ${py(b.from.y)}px)`;
        const yatay = Math.abs(b.to.x - b.from.x);
        const dikey = Math.abs(b.to.y - b.from.y);
        const t1 = Math.max(180, (yatay / Math.max(1, yatay + dikey)) * 900);
        g.style.setProperty('--stg-sure', t1 + 'ms');
        this._at(30, () => setTransform(g, kose, true));
        this._at(30 + t1, () => {
          g.style.setProperty('--stg-sure', Math.max(180, 900 - t1) + 'ms');
          setTransform(g, hedef, true);
        });
        return;
      }
      setTransform(g, hedef, false);
    }

    _ozet(st) {
      const s = st.s;
      const agir = st.agir || s.bacaklar.some((b) => b.algo === 'AGIR');
      const algolar = ['RANDEVU', 'EN_YAKIN', 'SOGUK'].concat(agir ? ['AGIR'] : []);
      const ara = agir ? 112 : 136;
      this.k.ozet.innerHTML = `<text class="stg-ozet-s${s.yanlisAdim || s.reddedilen ? ' is-bad' : ''}" x="16" y="472">${s.teslim.length}/6 teslimat · ${s.km} km${s.yanlisAdim ? ` · ${s.yanlisAdim} yanlış adım` : ''}${s.reddedilen ? ` · ${s.reddedilen} değiştirilemeyen seçim` : ''}</text>
        <g class="stg-lejant" transform="translate(16, 492)">${algolar
          .map((a, k) => `<g transform="translate(${k * ara}, 0)"><line class="stg-bacak is-${RENK[a]}" x1="0" y1="9" x2="26" y2="9"/><text x="32" y="14">${SG.ALGO[a].kisa}</text></g>`)
          .join('')}<g transform="translate(${algolar.length * ara}, 0)"><line class="stg-bacak is-yanlis" x1="0" y1="9" x2="26" y2="9"/><text x="32" y="14">yanlış adım</text></g></g>`;
    }

    // ---------------------------------------------------------------- kurye nesnesi
    _panel(st, prev, anim) {
      const s = st.s;
      const g = this.g;
      const [fx, fy, fw, fh] = g.cerceve;
      let html = `<rect class="stg-nesne" x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="12"/>
        <text class="stg-nesne-t" x="${g.baslik[0]}" y="${g.baslik[1]}">kurye<tspan class="stg-nesne-s" dx="8">: ${st.mode === 'kalitim' ? SG.ALGO[s.aktif].kalitim : 'Kurye'}</tspan></text>`;
      if (st.anNotu) html += `<text class="stg-cap is-not" x="${fx + fw}" y="26" text-anchor="end">${esc(st.anNotu)}</text>`;
      html += this._algoritma(st, prev, anim, g.alg[0], g.alg[1], g.alg[2]);
      html += this._listeBasligi(st, g.liste[0], g.liste[1], g.liste[2]);
      html += '<g data-k="liste"></g>';
      html += this._serit(st, g.serit[0], g.serit[1], g.serit[2]);
      this.k.panel.innerHTML = html;
      this._liste(st, prev, anim, g.liste[0], g.liste[1] + 30, g.liste[2], g.RH);
    }

    /** Rota algoritması nerede? (x, y: bölüm başlığı; w: sütun genişliği) */
    _algoritma(st, prev, anim, x, y, w) {
      const s = st.s;
      const mode = st.mode;
      let html = `<text class="stg-bolum" x="${x + 16}" y="${y}">rota algoritması</text>`;
      const y0 = y + 10;
      if (STRATEJI.includes(mode)) {
        const a = SG.ALGO[s.aktif];
        const yeni = anim && prev.s && prev.mode === mode && prev.s.aktif !== s.aktif;
        html += `<text class="stg-alan" x="${x + 16}" y="${y0 + 16}">strateji : RotaStratejisi</text>
          <rect class="stg-yuva${st.vurgu === 'slot' ? ' is-on' : ''}" x="${x + 12}" y="${y0 + 24}" width="${w - 24}" height="62" rx="10"/>
          <g class="stg-kartus rc rc-4${yeni ? ' is-yeni' : ''}${st.cokus ? ' is-bad' : ''}">
            <rect x="${x + 20}" y="${y0 + 31}" width="${w - 40}" height="48" rx="8"/>
            <text class="stg-kartus-t" x="${x + 34}" y="${y0 + 52}">${a.sinif}</text>
            <text class="stg-kartus-s" x="${x + 34}" y="${y0 + 71}">${esc(a.ad)}</text>
            ${st.cokus ? `<text class="stg-kartus-x" x="${x + w - 34}" y="${y0 + 61}" text-anchor="end">✗ sort()</text>` : ''}
          </g>`;
        const raf = ['RANDEVU', 'EN_YAKIN', 'SOGUK'].concat(st.agir ? ['AGIR'] : []);
        const rw = (w - 24 - (raf.length - 1) * 6) / raf.length;
        html += `<text class="stg-alan" x="${x + 16}" y="${y0 + 108}">raf: takılabilecek stratejiler</text>`;
        raf.forEach((k, j) => {
          const rx = x + 12 + j * (rw + 6);
          const takili = k === s.aktif;
          html += `<g class="stg-raf rc rc-4${takili ? ' is-takili' : ''}${st.yeni === k ? ' is-yeni' : ''}"><rect x="${rx}" y="${y0 + 116}" width="${rw}" height="32" rx="6"/><text x="${rx + rw / 2}" y="${y0 + 137}" text-anchor="middle">${takili ? 'takılı' : SG.ALGO[k].sinif.replace('Rota', '')}</text></g>`;
        });
        return html;
      }
      if (NAIVE.includes(mode)) {
        const dallar = mode === 'v1' ? ['RANDEVU'] : mode === 'v11' ? ['RANDEVU', 'EN_YAKIN'] : ['RANDEVU', 'EN_YAKIN', 'SOGUK'];
        html += `<text class="stg-alan" x="${x + 16}" y="${y0 + 16}">${mode === 'v1' ? 'sec(): tek algoritma' : `yontem = "${SG.ALGO[s.aktif].sabit}"`}</text>`;
        dallar.forEach((k, j) => {
          const yy = y0 + 26 + j * 38;
          html += `<g class="stg-dal${k === s.aktif ? ' is-on' : ''}"><rect x="${x + 12}" y="${yy}" width="${w - 24}" height="33" rx="7"/>
            <text class="stg-dal-t" x="${x + 26}" y="${yy + 22}">${mode === 'v1' ? 'return kalan.get(0);' : `if "${SG.ALGO[k].sabit}"`}</text>
            ${k === 'SOGUK' && mode === 'v2' ? `<text class="stg-dal-not is-bad" x="${x + w - 24}" y="${yy + 22}" text-anchor="end">kalan.sort(…)</text>` : ''}
          </g>`;
        });
        if (mode !== 'v1') html += `<text class="stg-not" x="${x + 16}" y="${y0 + 26 + dallar.length * 38 + 14}">${dallar.length} algoritma da Kurye’nin içinde</text>`;
        return html;
      }
      // kalıtım
      const a = SG.ALGO[s.aktif];
      html += `<g class="stg-sinif"><rect x="${x + 12}" y="${y0 + 8}" width="${w - 24}" height="64" rx="10"/>
          <text class="stg-kartus-t" x="${x + 26}" y="${y0 + 33}">${a.kalitim}</text>
          <text class="stg-kartus-s" x="${x + 26}" y="${y0 + 56}">extends Kurye · sec() sınıfın içinde</text>
          ${kilit(x + w - 32, y0 + 30)}
        </g>
        <text class="stg-not" x="${x + 16}" y="${y0 + 94}">nesnenin sınıfı yaratılınca belli olur, değişmez</text>`;
      if (st.red) html += `<g class="stg-red${anim ? ' is-yeni' : ''}"><rect x="${x + 12}" y="${y0 + 106}" width="${w - 24}" height="36" rx="8"/><text x="${x + 26}" y="${y0 + 129}">istek: ${esc(SG.ALGO[st.red].ad.toLocaleLowerCase('tr'))} ✗ değiştirilemez</text></g>`;
      return html;
    }

    _listeBasligi(st, x, y, w) {
      const s = st.s;
      const mode = st.mode;
      const okunur = mode === 'r2' || mode === 'strateji';
      const L = (st.sirala ? st.sirala.sonra : s.kalan).map(SG.durak);
      const karisik = L.some((d, j) => j && L[j - 1].sira > d.sira);
      let html = `<text class="stg-bolum" x="${x + 16}" y="${y}">kalan</text>`;
      if (okunur) html += kilit(x + 74, y - 5);
      html += `<text class="stg-altyazi" x="${x + 16}" y="${y + 19}">${okunur ? 'stratejiye salt okunur görünüm verilir' : mode === 'kalitim' ? 'alt sınıf listeye doğrudan erişir' : 'algoritmalar listeye doğrudan erişir'}</text>`;
      if (karisik) html += `<text class="stg-karisik" x="${x + w - 16}" y="${y}" text-anchor="end">randevu sırası bozuk!</text>`;
      else if (mode === 'r1') html += `<text class="stg-karisik" x="${x + w - 16}" y="${y}" text-anchor="end">strateji listeyi değiştirebilir</text>`;
      if (!L.length) html += `<text class="stg-alt" x="${x + 16}" y="${y + 56}">liste boş: duraklar bitti</text>`;
      return html;
    }

    _liste(st, prev, anim, x, y0, w, RH) {
      const host = this.k.panel.querySelector('[data-k="liste"]');
      const s = st.s;
      const sirala = st.sirala;
      const sira = sirala ? sirala.sonra : s.kalan;
      const onceki = sirala ? sirala.once : null;
      const L = sira.map(SG.durak);
      host.innerHTML = '';
      L.forEach((d, j) => {
        const g = DP.s('g', { class: 'stg-satir' + (st.secilen === d.no ? (st.beklenen && st.beklenen !== d.no ? ' is-hatali' : ' is-secili') : '') + (st.beklenen && st.beklenen !== st.secilen && st.beklenen === d.no ? ' is-beklenen' : '') + (j && L[j - 1].sira > d.sira ? ' is-ters' : '') });
        const ry = (RH - 4) / 2;
        g.innerHTML = `<rect class="stg-satir-bg" x="${x + 12}" y="0" width="${w - 24}" height="${RH - 4}" rx="7"/>
          <text class="stg-satir-i" x="${x + 27}" y="${ry + 5}" text-anchor="middle">${j}</text>
          <g class="stg-rozet"><rect x="${x + 41}" y="${ry - 11}" width="38" height="22" rx="11"/><text x="${x + 60}" y="${ry + 5}" text-anchor="middle">R${d.sira}</text></g>
          ${d.soguk ? SG.kar(x + 93, ry, 5.6) : ''}
          <text class="stg-satir-t" x="${x + 107}" y="${ry + 5.5}">${esc(d.alici)}</text>
          <text class="stg-satir-s" x="${x + w - 24}" y="${ry + 5}" text-anchor="end">${esc(d.yer)}${this.o.nesne ? ` · ${d.kg} kg` : ''}</text>`;
        host.appendChild(g);
        const hedef = `translate(0px, ${y0 + j * RH}px)`;
        if (anim && onceki) {
          const eski = onceki.indexOf(d.no);
          setTransform(g, `translate(0px, ${y0 + eski * RH}px)`, false);
          this._at(260, () => setTransform(g, hedef, true));
        } else setTransform(g, hedef, false);
      });
    }

    /** Günün teslim sırası: randevu numaraları; kurala aykırı adımlar kırmızı */
    _serit(st, x, y, w) {
      const s = st.s;
      const serit = st.serit || s.bacaklar.map((b) => ({ no: b.no, yanlis: b.yanlis }));
      const genis = !!this.o.nesne;
      const bas = genis ? 92 : 62;
      const adim = genis ? 46 : 40;
      const bw = genis ? 38 : 34;
      let html = `<text class="stg-serit-t" x="${x}" y="${y + 5}">${st.serit ? 'gün sonu' : 'teslim'}:</text>`;
      if (!serit.length) return html + `<text class="stg-alt" x="${x + bas}" y="${y + 5}">${st.cokus ? 'ilk teslimatta çöktü' : 'henüz yok'}</text>`;
      serit.forEach((t, j) => {
        const bx = x + bas + j * adim;
        html += `<g class="stg-serit-r${t.yanlis ? ' is-bad' : ''}"><rect x="${bx}" y="${y - 11}" width="${bw}" height="22" rx="11"/><text x="${bx + bw / 2}" y="${y + 5}" text-anchor="middle">R${SG.durak(t.no).sira}</text></g>`;
      });
      if (this.o.nesne && st.serit) {
        const yanlis = serit.filter((t) => t.yanlis).length;
        html += `<text class="stg-serit-s${yanlis ? ' is-bad' : ''}" x="${x + w}" y="${y + 5}" text-anchor="end">${st.seritKm} km · ${yanlis} yanlış adım</text>`;
      }
      return html;
    }

    destroy() {
      this._stop();
      this.el.remove();
    }
  }
  SG.HaritaSahne = HaritaSahne;

  // ================================================================== durum yardımcıları (sahneler kullanır)
  /** Program + anlık durum → sahne durumu */
  SG.stateFrom = (prog, s, x) => Object.assign({ mode: prog.tasarim, agir: !!prog.agir, s }, x || {});
  /** Kurulum anı (henüz hiçbir teslimat yok) */
  SG.BOS_AN = (prog) => SG.run(prog).olaylar[0].s;
  /** Bir isteğin olayları: o isteğe ait son olay, teslimat ve sıralama */
  SG.istekOlaylari = (r, k) => {
    const O = r.olaylar.filter((x) => x.i === k);
    return { son: O[O.length - 1], teslim: O.find((x) => x.e === 'teslim'), sirala: O.find((x) => x.e === 'sirala'), sec: O.find((x) => x.e === 'sec'), cokus: O.find((x) => x.e === 'cokus') };
  };
})();
