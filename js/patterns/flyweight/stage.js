/*
 * Flyweight — animasyon sahnesi.
 *   FL.Sahne : kurye tabletindeki canlı harita ve bellek.
 *     sol üst : Türkiye haritası — noktaların DIŞSAL durumu (konum, etiket) burada görünür
 *     sol alt : harita.noktalar — HaritaNoktasi nesneleri (dışsal durum + işarete başvuru)
 *     sağ     : paylaşılan nesneler (fabrikanın havuzu) ya da her noktanın kendi ikonu
 *     alt     : bellek göstergesi (kurye tableti: 64 MB)
 *   Az noktada nesne nesne çizilir (satırlar, kartlar, bağlantılar); çok noktada harita noktacıkları,
 *   yığınlar ve ikon duvarı.
 *
 * Durum tabanlı çizim: render(state, prevState, {animate}) — geri/ileri adımlarda tutarlı.
 */
(function () {
  'use strict';
  const FL = DP.fl;
  const esc = DP.esc;
  const md = (t) => DP.md(t, FL.roleOf);

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
    koli: '<path d="M3 7.5 L12 3 L21 7.5 V16.5 L12 21 L3 16.5 Z"/><path d="M3 7.5 L12 12 L21 7.5 M12 12 V21"/><path d="M7.5 5.2 L16.5 9.7"/>',
    zarf: '<rect x="2.5" y="5" width="19" height="14" rx="1.8"/><path d="M3.2 6 L12 12.8 L20.8 6"/>',
    palet: '<rect x="4" y="9.5" width="7" height="7"/><rect x="13" y="9.5" width="7" height="7"/><rect x="8.5" y="2.8" width="7" height="6.7"/><path d="M2 17.5 H22 M2 21 H22 M4.5 17.5 V21 M12 17.5 V21 M19.5 17.5 V21"/>',
    depo: '<path d="M2.5 10 L12 3.5 L21.5 10 V20.5 H2.5 Z"/><path d="M7 20.5 V13 H17 V20.5 M7 16.6 H17"/>',
    dosya: '<path d="M6 2.5 H14 L19 7.5 V21.5 H6 Z"/><path d="M14 2.5 V7.5 H19"/><circle cx="10" cy="12" r="1.6"/><path d="M7.5 19 L11 15 L13.5 17.5 L15.5 15.5 L18 19"/>',
    fabrika: '<path d="M2.5 21 V10.5 L8 13.5 V10.5 L13.5 13.5 V4.5 H16.5 V2.5 H19.5 V21 Z"/><path d="M6 17.5 H8 M11 17.5 H13"/>',
    tablet: '<rect x="4" y="2" width="16" height="20" rx="2.4"/><path d="M10.5 19 H13.5"/>',
    harita: '<path d="M2.5 5.5 L8.5 3 L15.5 5.5 L21.5 3 V18.5 L15.5 21 L8.5 18.5 L2.5 21 Z M8.5 3 V18.5 M15.5 5.5 V21"/>',
    kase: '<path d="M9 3 H15 V9 Q15 11 17 11 H19 Q21 11 21 13 V15 H3 V13 Q3 11 5 11 H7 Q9 11 9 9 Z"/><path d="M4 18 H20 V21 H4 Z"/>',
  };
  FL.icon = (k, x, y, s) => `<g class="fli fli-${k}" transform="translate(${x},${y})${s && s !== 1 ? ` scale(${s})` : ''}">${ICON[k]}</g>`;
  FL.ICON = ICON;

  // ------------------------------------------------------------------ Türkiye (harita koordinatları: 800 × 360)
  FL.MAP = {
    kara:
      'M36.9 94.5 L49.9 79.8 L57.4 63.1 L49.9 44.8 L60.2 32.7 L85.8 25.1 L115.7 31.2 L146.1 60.6 L157.9 68.7 L185.5 72.7 L213.1 70.7 L248.5 65.6 L284 42.8 L323.4 30.1 L366.7 32.7 L396.3 28.6 L414 45.4 L433.7 47.9 L442.8 64.1 L469.2 75.8 L500.7 81.9 L524.3 83.4 L576.3 80.8 L607.1 79.3 L642.5 60.6 L648.4 54.5 L685.9 58 L713.4 68.2 L724.1 79.3 L733.1 96.1 L729.2 116.3 L748.9 126.5 L774.5 146.8 L756.8 162 L748.9 182.2 L756.8 212.7 L756.8 238 L776.5 273.5 L754.8 281.1 L721.3 268.4 L693.7 265.9 L679.9 278.6 L634.6 279.6 L595.2 286.2 L555.8 300.4 L516.4 291.2 L484.9 301.4 L457.3 293.8 L453.4 324.2 L435.7 343.5 L423.9 336.9 L427.8 316.6 L437.6 303.9 L421.9 293.8 L406.1 304.9 L388.4 296.3 L374.6 293.8 L351 319.1 L327.3 326.7 L303.7 332.8 L272.2 306.5 L240.6 293.8 L220.9 289.7 L215 314.1 L209.1 324.2 L179.6 324.2 L157.9 303.9 L138.2 298.9 L124.4 298.9 L106.7 286.2 L92.1 282.1 L85 263.4 L87 240.5 L69.3 225.3 L47.6 217.7 L67.3 210.1 L65.3 194.9 L71.2 177.2 L61.4 167 L39.7 159.4 L41.7 136.6 L51.5 121.4 L43.6 113.8 Z',
    marmara: 'M63.3 111.3 L94.9 83.4 L122.4 78.3 L153.2 80.8 L169.7 93.5 L155.9 108.7 L114.6 112.3 L87 111.3 Z',
    van: [703.6, 201.5],
  };
  /** Haritanın kendisi (harita koordinatlarında); o.iller: il adları */
  FL.mapSvg = (o) => {
    o = o || {};
    const iller = o.iller
      ? FL.ILLER.map(([ad, x, y]) => `<g class="fl-il"><circle cx="${x}" cy="${y}" r="3.4"/><text x="${x + 7}" y="${y + 17}">${esc(ad)}</text></g>`).join('')
      : '';
    return `<path class="fl-kara" d="${FL.MAP.kara}"/><path class="fl-deniz" d="${FL.MAP.marmara}"/><ellipse class="fl-deniz" cx="${FL.MAP.van[0]}" cy="${FL.MAP.van[1]}" rx="15" ry="9"/>${iller}`;
  };
  /** Harita iğnesi (ucu orijinde). Baş: (0, -17), yarıçap 9. */
  FL.pin = (cls, ic) =>
    `<g class="fl-pin ${cls}"><path class="fl-pin-b" d="M0 0 C -2 -6, -9.5 -10, -9.5 -17 A 9.5 9.5 0 1 1 9.5 -17 C 9.5 -10, 2 -6, 0 0 Z"/>${ic ? FL.icon(ic, -6, -23, 0.5) : ''}</g>`;

  const turCls = (t) => 'fl-t-' + (t || 'depo');
  const kb = (n) => (n > 0 && n < 1 ? '< 1 KB' : n < 1024 ? Math.round(n) + ' KB' : (n / 1024).toFixed(n < 102400 ? 1 : 0).replace('.', ',') + ' MB');

  /**
   * İğne etiketlerini çakışmadan yerleştirir. items: [{x, y (iğne ucu), w, h, pref: [[dx, dy], …]}]
   * Engeller: iğne başları ve önceden yerleşen etiketler. Dönüş: etiketlerin sol-üst köşeleri.
   */
  function placeLabels(items, pins) {
    const placed = pins.map((p) => ({ x0: p.x - 11, y0: p.y - 28, x1: p.x + 11, y1: p.y }));
    const hit = (r) => placed.some((p) => r.x0 < p.x1 && r.x1 > p.x0 && r.y0 < p.y1 && r.y1 > p.y0);
    return items.map((it) => {
      const cands = it.pref.concat([[-it.w / 2, -46], [-it.w / 2, 4], [13, -27], [-it.w - 13, -27], [-it.w / 2, 24], [-it.w / 2, -66], [13, -5], [-it.w - 13, -5]]);
      let best = null;
      for (const [dx, dy] of cands) {
        const r = { x0: it.x + dx, y0: it.y + dy, x1: it.x + dx + it.w, y1: it.y + dy + it.h };
        if (!hit(r)) {
          best = r;
          break;
        }
      }
      if (!best) best = { x0: it.x + cands[0][0], y0: it.y + cands[0][1], x1: it.x + cands[0][0] + it.w, y1: it.y + cands[0][1] + it.h };
      placed.push(best);
      return best;
    });
  }
  FL.kb = kb;

  // ================================================================== sahne
  const W = 960;
  const H = 600;
  const S = 0.66; // harita ölçeği
  const OX = 14;
  const OY = 30;
  const MX = (x) => OX + x * S;
  const MY = (y) => OY + y * S;
  const RX = 568; // sağ sütun
  const RW = 378;
  const CX = RX + 12; // kart
  const CW = RW - 24;
  const CH = 82;
  const CG = 10;
  const POOL_Y = 62;
  const ROW_X = 14;
  const ROW_W = 526;
  const ROW_Y = 306;
  const ROW_H = 30;
  const ROW_G = 6;
  const NOKTA_MAX = 900; // haritada en çok bu kadar noktacık

  class Sahne {
    /** o: {cls} */
    constructor(root, o) {
      this.o = o || {};
      this.el = DP.h('div', { class: 'fm-stage fl-sahne' + (this.o.cls ? ' ' + this.o.cls : '') });
      root.appendChild(this.el);
      this.el.innerHTML = `
<svg class="fm-svg fl-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Kurye tabletindeki gönderi haritası ve bellek">
  <rect class="fl-bg" x="-1500" y="-1500" width="4000" height="4000"/>
  <g class="fl-map-head">${FL.icon('tablet', 14, 4, 0.8)}<text class="fl-cap" x="36" y="20">Harita</text><text class="fl-cap-sub" x="94" y="20">kurye tableti · dışsal durum: konum, etiket</text></g>
  <g transform="translate(${OX},${OY}) scale(${S})"><g class="fl-map">${FL.mapSvg({ iller: true })}</g><g data-k="dots"></g></g>
  <g data-k="links"></g>
  <g data-k="rows"></g>
  <g data-k="right"></g>
  <g data-k="pins"></g>
  <g data-k="gauge"></g>
  <g data-k="fx"><g class="fl-token" data-k="tok"><g class="fl-token-in"><rect data-k="tok-bg" x="-60" y="-14" width="120" height="28" rx="14"/><text data-k="tok-t" x="0" y="5" text-anchor="middle"></text></g></g></g>
  <foreignObject class="bubble-fo" data-k="b-banner" x="16" y="452" width="928" height="50"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble fl-banner"></div></foreignObject>
</svg>`;
      this.svg = this.el.querySelector('svg');
      this.k = {};
      DP.$$('[data-k]', this.el).forEach((n) => (this.k[n.getAttribute('data-k')] = n));
      this.timers = [];
      this.anchors = {};
      this.dotKey = null;
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
     *   mode: 'kopya'|'kestirme'|'flyweight', cihaz: 'tablet'|'pc',
     *   noktalar: [{etiket, x, y, tur|depo, no, cizildi, hl}]     (az nokta)
     *   havuz: [{tur, no, hl, etiket, x, y}] · ikonlar: [{tur, no, etiket, dup, hl}] · ayri: [{etiket, depo, no, hl}]
     *   N, crash (büyük harita), lookup: {tur, sonuc}, token: {from, to, text, kind}, banner, gauge: {ikon, noktaKB, oom}
     * }
     */
    render(st, prev, o) {
      const anim = !!(o && o.animate);
      prev = prev || {};
      this._stop();
      this.anchors = {};
      const big = st.N != null && st.N > 3;
      this.el.classList.toggle('is-big', big);
      this.el.classList.toggle('is-oom', !!(st.gauge && st.gauge.oom));
      this._dots(st, anim);
      this._right(st, prev, anim, big);
      if (big) this._block(st, anim);
      else this._rows(st, prev, anim);
      this._pins(st, prev, anim, big);
      this._links(st, big);
      this._gauge(st, prev, anim);
      banner(this.k['b-banner'], st.banner);
      this._token(st.token, anim);
    }

    // ---------------------------------------------------------------- haritadaki noktacıklar (çok nokta)
    _dots(st, anim) {
      const g = this.k.dots;
      if (!(st.N > 3)) {
        g.innerHTML = '';
        this.dotKey = null;
        return;
      }
      const n = st.N - 3;
      const m = Math.min(n, NOKTA_MAX);
      const key = n + '/' + m;
      // aynı nokta kümesi: yalnızca durum (çöküş, yığılma) değişir
      if (this.dotKey !== key) {
        let html = '';
        for (let k = 0; k < m; k++) {
          const i = Math.floor((k * n) / m);
          const p = FL.gen(i);
          html += `<circle class="fl-dot ${turCls(p.tur)}" data-i="${i}" cx="${p.x}" cy="${p.y}" r="2.6" style="--k:${k}"/>`;
        }
        g.innerHTML = html;
        this.dotKey = key;
      }
      const crash = st.crash || null;
      const kes = st.mode === 'kestirme' ? st.yigin || null : null;
      // dolum animasyonu her seferinde baştan başlasın
      g.classList.remove('is-filling');
      if (anim && st.fill) {
        void g.getBoundingClientRect();
        g.classList.add('is-filling');
      }
      g.style.setProperty('--n', String(m));
      g.style.setProperty('--fill', DP.dur(1500) + 'ms');
      DP.$$('.fl-dot', g).forEach((c) => {
        const i = Number(c.getAttribute('data-i'));
        c.classList.toggle('is-gone', crash != null && i >= crash - 3);
        if (kes) {
          const t = kes[FL.TURLER[i % FL.TURLER.length]];
          const p = FL.gen(i);
          setTransform(c, `translate(${t.x - p.x}px, ${t.y - p.y}px)`, anim);
        } else if (c.style.transform) setTransform(c, '', anim);
      });
      g.classList.toggle('is-collapsed', !!kes);
    }

    // ---------------------------------------------------------------- sağ sütun: disk + havuz / ikonlar
    _right(st, prev, anim, big) {
      const mode = st.mode;
      const A = this.anchors;
      // disk: hangi resim dosyaları var?
      const files = [];
      const addF = (k, t) => !files.some((f) => f.k === k) && files.push({ k, t });
      (st.havuz || []).forEach((c) => addF(c.tur, c.tur + '.png'));
      (st.ikonlar || []).forEach((c) => addF(c.tur, c.tur + '.png'));
      (st.ayri || []).forEach((c) => addF('depo', 'depo-' + c.depo.sehir + '.png'));
      if (big && mode === 'kopya') FL.turOrder.forEach((t) => addF(t, t + '.png'));
      let fx = RX + 96;
      const fileSvg = files
        .map((f) => {
          const w = f.t.length * 7.4 + 30;
          const x = fx;
          fx += w + 6;
          A['disk:' + f.k] = { x: x + w / 2, y: 32 };
          return `<g class="fl-file ${turCls(f.k === 'depo' ? null : f.k)}"><rect x="${x}" y="20" width="${w}" height="24" rx="6"/>${FL.icon('dosya', x + 4, 23, 0.75)}<text x="${x + 23}" y="37">${esc(f.t)}</text></g>`;
        })
        .join('');
      const disk = `<g class="fl-disk"><rect class="fl-disk-bg" x="${RX}" y="12" width="${RW}" height="40" rx="10"/><text class="fl-disk-t" x="${RX + 14}" y="37">disk</text><text class="fl-disk-s" x="${RX + 48}" y="37">ikonlar</text>${fileSvg || `<text class="fl-disk-s" x="${RX + 110}" y="37">—</text>`}</g>`;

      // havuz kutusunun başlığı
      const head = {
        flyweight: { t: 'fabrika : IsaretFabrikasi', s: 'havuz : Map<String, IsaretTuru>', ic: 'fabrika', cls: 'rc rc-3' },
        kestirme: { t: 'HaritaNoktasi.HAVUZ', s: 'static Map<String, HaritaNoktasi>', ic: 'fabrika', cls: 'is-kestirme' },
        kopya: { t: 'Ikon nesneleri', s: 'her nokta kendi kopyasını yükler', ic: 'dosya', cls: 'is-kopya' },
      }[mode];
      let body = '';
      let boxH;
      const cy0 = POOL_Y + 48;
      if (mode === 'kopya' && big) {
        // ikon duvarı: her tuğla N / 195 ikon
        const cols = 15;
        const rows = 13;
        const tot = cols * rows;
        const per = st.N / tot;
        const alive = st.crash ? Math.max(1, Math.round((st.crash / st.N) * tot)) : tot;
        let tiles = '';
        for (let k = 0; k < tot; k++) {
          const x = CX + 6 + (k % cols) * 23;
          const y = cy0 + Math.floor(k / cols) * 23;
          const t = FL.TURLER[Math.floor(k * per) % FL.TURLER.length];
          tiles += `<rect class="fl-tile ${turCls(t)}${k >= alive ? ' is-gone' : ''}" x="${x}" y="${y}" width="20" height="20" rx="4" style="--k:${k}"/>`;
        }
        boxH = 48 + rows * 23 + 34;
        body = `<g class="fl-wall${anim && st.fill ? ' is-filling' : ''}">${tiles}</g>
          <text class="fl-wall-t" x="${CX}" y="${cy0 + rows * 23 + 22}">${st.crash ? `≈ ${FL.sayi(st.crash)} ikon yüklendi, sonra bellek bitti` : `${FL.sayi(st.N)} ikon · her tuğla ≈ ${FL.sayi(Math.round(per))} kopya`}</text>`;
        A['card:wall'] = { x: CX, y: cy0 + (rows * 23) / 2 };
        if (st.crash && st.boom !== false) body += `<g class="fl-boom"><rect x="${CX + 40}" y="${cy0 + 100}" width="${CW - 80}" height="64" rx="14"/><text x="${CX + CW / 2}" y="${cy0 + 128}" text-anchor="middle">💥 OutOfMemoryError</text><text class="fl-boom-s" x="${CX + CW / 2}" y="${cy0 + 151}" text-anchor="middle">Java heap space</text></g>`;
      } else {
        const cards = mode === 'kopya' ? st.ikonlar || [] : st.havuz || [];
        const prevCards = mode === 'kopya' ? prev.ikonlar || [] : prev.havuz || [];
        body = cards
          .map((c, i) => {
            const y = cy0 + i * (CH + CG);
            const id = mode === 'kopya' ? 'card:' + i : 'card:' + c.tur;
            A[id] = { x: CX, y: y + CH / 2 };
            A[id + ':r'] = { x: CX + CW - 60, y: y + CH / 2 };
            const fresh = anim && !prevCards.some((p) => p.tur === c.tur && p.no === c.no);
            return this._card(c, y, mode, fresh);
          })
          .join('');
        if (!cards.length) body = `<text class="fl-empty" x="${RX + RW / 2}" y="${cy0 + 34}" text-anchor="middle">${mode === 'flyweight' ? 'havuz boş' : 'henüz nesne yok'}</text>`;
        boxH = 48 + Math.max(1, cards.length) * (CH + CG) + 6;
      }
      const lk = st.lookup;
      const look = lk
        ? `<g class="fl-look is-${lk.sonuc}"><rect x="${RX + RW - 176}" y="${POOL_Y + 10}" width="164" height="26" rx="13"/><text x="${RX + RW - 94}" y="${POOL_Y + 28}" text-anchor="middle">get("${esc(lk.tur)}") → ${lk.sonuc === 'hit' ? lk.tur + ' ✓' : 'null'}</text></g>`
        : '';
      A.pool = { x: RX + 40, y: POOL_Y + 22 };
      const pool = `<g class="fl-pool ${head.cls}"><rect class="fl-pool-bg" x="${RX}" y="${POOL_Y}" width="${RW}" height="${boxH}" rx="14"/>
        ${FL.icon(head.ic, RX + 12, POOL_Y + 10, 0.85)}<text class="fl-pool-t" x="${RX + 36}" y="${POOL_Y + 24}">${esc(head.t)}</text><text class="fl-pool-s" x="${RX + 14}" y="${POOL_Y + 42}">${esc(head.s)}</text>${look}${body}</g>`;

      // paylaşılmayan nesneler (fabrikanın dışında)
      let ayri = '';
      const ay = POOL_Y + boxH + 14;
      (st.ayri || []).forEach((c, i) => {
        const y = ay + 18 + i * (CH + CG);
        A['card:depo'] = { x: CX, y: y + CH / 2 };
        A['card:depo:r'] = { x: CX + CW - 60, y: y + CH / 2 };
        const fresh = anim && !(prev.ayri || []).some((p) => p.no === c.no);
        ayri += this._card(Object.assign({ tur: null }, c), y, 'ayri', fresh);
      });
      if (ayri) ayri = `<g class="fl-ayri"><text class="fl-ayri-t" x="${RX + 4}" y="${ay + 8}">paylaşılmayan · fabrikadan geçmez</text>${ayri}</g>`;
      this.k.right.innerHTML = disk + pool + ayri;
    }

    /** Nesne kartı. kind: 'flyweight' | 'kestirme' | 'kopya' | 'ayri' */
    _card(c, y, kind, fresh) {
      const x = CX;
      const t = c.tur;
      const ic = t || 'depo';
      let title;
      let l2;
      let l3 = '';
      let l3cls = '';
      if (kind === 'ayri') {
        title = 'depo : DepoIsareti';
        l2 = `foto depo-${c.depo.sehir}.png#${c.no} · 16 KB`;
        l3 = `doluluk %${c.depo.doluluk} · kendi durumu`;
      } else if (kind === 'kopya') {
        title = `Ikon · ${t}.png#${c.no}`;
        l2 = '16 KB · ' + (c.etiket ? `${c.etiket} noktasının` : 'bir noktanın');
        l3 = c.dup ? `aynı resim: ${t}.png#${c.dup}` : 'kendi kopyası';
        l3cls = c.dup ? ' is-bad' : '';
      } else if (kind === 'kestirme') {
        title = `${t} noktası : HaritaNoktasi`;
        l2 = `ikon ${t}.png#${c.no} · 16 KB`;
        l3 = c.etiket ? `${c.etiket} · (${c.x}, ${c.y})` : 'etiket, x, y: boş';
        l3cls = ' is-bad';
      } else {
        title = `${t} : IsaretTuru`;
        l2 = `ikon ${t}.png#${c.no} · 16 KB`;
        l3 = c.pay ? `paylaşan: ${FL.sayi(c.pay)} nokta` : c.pay === 0 ? 'henüz kullanan nokta yok' : 'içsel: ad, ikon';
      }
      const pill = c.hl
        ? `<g class="fl-pill is-${c.hl}"><rect x="${x + CW - 102}" y="${y + 8}" width="92" height="22" rx="11"/><text x="${x + CW - 56}" y="${y + 23}" text-anchor="middle">${esc({ new: 'yeni', hit: '✓ aynı nesne', active: 'çiziyor', dup: 'kopya!', bad: 'üstüne yazıldı' }[c.hl])}</text></g>`
        : '';
      const role = { flyweight: 'rc-4', kestirme: 'rc-1', kopya: '', ayri: 'rc-5' }[kind];
      return `<g class="fl-card is-${kind} ${role ? 'rc ' + role : ''} ${turCls(t)}${fresh ? ' is-new' : ''}${c.hl ? ' is-' + c.hl : ''}">
        <rect class="fl-card-bg" x="${x}" y="${y}" width="${CW}" height="${CH}" rx="11"/>
        <rect class="fl-card-art" x="${x + 9}" y="${y + 9}" width="64" height="64" rx="10"/>${FL.icon(ic, x + 17, y + 17, 2)}
        <text class="fl-card-t" x="${x + 84}" y="${y + 27}">${esc(title)}</text>
        <text class="fl-card-l" x="${x + 84}" y="${y + 49}">${esc(l2)}</text>
        <text class="fl-card-l${l3cls}" x="${x + 84}" y="${y + 69}">${esc(l3)}</text>${pill}
      </g>`;
    }

    // ---------------------------------------------------------------- harita.noktalar (az nokta)
    _rows(st, prev, anim) {
      const mode = st.mode;
      const A = this.anchors;
      const rows = st.noktalar || [];
      const prevRows = prev.noktalar || [];
      const tag = { flyweight: 'dışsal durum + başvuru', kestirme: 'yalnızca başvuru', kopya: 'her şey noktada' }[mode];
      const head = `<g class="fl-rows-head"><text class="fl-cap" x="${ROW_X + 2}" y="${ROW_Y - 14}">harita.noktalar</text><text class="fl-cap-sub" x="${ROW_X + 140}" y="${ROW_Y - 14}">List&lt;HaritaNoktasi&gt;</text>
        <g class="fl-tag is-${mode}"><rect x="${ROW_X + ROW_W - 186}" y="${ROW_Y - 31}" width="186" height="22" rx="11"/><text x="${ROW_X + ROW_W - 93}" y="${ROW_Y - 16}" text-anchor="middle">${tag}</text></g></g>`;
      A.rows = { x: ROW_X + 60, y: ROW_Y - 18 };
      const body = rows
        .map((r, i) => {
          const y = ROW_Y + i * (ROW_H + ROW_G);
          const t = r.depo ? null : r.tur;
          const fresh = anim && !prevRows[i];
          const cx = ROW_X + ROW_W - 114;
          A['row:' + i] = { x: cx + 56, y: y + ROW_H / 2 };
          A['row:' + i + ':r'] = { x: ROW_X + ROW_W, y: y + ROW_H / 2 };
          const ref = r.depo ? `depo#${r.no}` : mode === 'kestirme' ? `HAVUZ["${t}"]` : `${t}#${r.no}`;
          const ok = mode === 'kestirme';
          return `<g class="fl-row ${turCls(t)}${fresh ? ' is-new' : ''}${r.hl ? ' is-hl' : ''}${r.kayip ? ' is-lost' : ''}">
            <rect class="fl-row-bg" x="${ROW_X}" y="${y}" width="${ROW_W}" height="${ROW_H}" rx="8"/>
            <circle class="fl-row-dot" cx="${ROW_X + 16}" cy="${y + ROW_H / 2}" r="6"/>
            <text class="fl-row-i" x="${ROW_X + 30}" y="${y + 20}">[${i}]</text>
            ${ok ? `<text class="fl-row-ref" x="${ROW_X + 64}" y="${y + 20}">kendi alanı yok: aynı nesneye başvuru</text>` : `<text class="fl-row-e" x="${ROW_X + 64}" y="${y + 20}">${esc(r.etiket)}</text><text class="fl-row-xy" x="${ROW_X + 222}" y="${y + 20}">(${r.x}, ${r.y})</text>`}
            <text class="fl-row-k" x="${cx - 8}" y="${y + 20}" text-anchor="end">${mode === 'kopya' ? 'ikon →' : r.depo ? 'isaret →' : mode === 'kestirme' ? '→' : 'isaret →'}</text>
            <g class="fl-chip"><rect x="${cx}" y="${y + 5}" width="112" height="20" rx="10"/><text x="${cx + 56}" y="${y + 19}" text-anchor="middle">${esc(ref)}</text></g>
          </g>`;
        })
        .join('');
      const empty = rows.length ? '' : `<text class="fl-empty" x="${ROW_X + ROW_W / 2}" y="${ROW_Y + 22}" text-anchor="middle">liste boş</text>`;
      this.k.rows.innerHTML = head + body + empty;
    }

    // ---------------------------------------------------------------- harita.noktalar (çok nokta): yığın
    _block(st, anim) {
      const A = this.anchors;
      const mode = st.mode;
      const y = ROW_Y - 4;
      const say = st.sayac || {};
      const n = st.crash || st.N;
      const per = { kopya: 'etiket, x, y, tür + kendi ikonu (16 KB!)', kestirme: 'aynı üç nesneye başvuru: etiket, x, y paylaşılıyor', flyweight: 'etiket, x, y + işarete başvuru (≈ 85 bayt)' }[mode];
      const stack = [3, 2, 1, 0]
        .map((k) => `<rect class="fl-stack-c" x="${ROW_X + 4 + k * 5}" y="${y + 6 + k * 5}" width="150" height="74" rx="9"/>`)
        .join('');
      let types = '';
      if (mode !== 'kopya') {
        FL.turOrder.forEach((t, i) => {
          const ty = y + 20 + i * 30;
          A['row:' + t] = { x: ROW_X + ROW_W - 30, y: ty };
          A['row:' + t + ':r'] = { x: ROW_X + ROW_W, y: ty };
          types += `<g class="fl-cnt ${turCls(t)}"><rect x="${ROW_X + 336}" y="${ty - 13}" width="${ROW_W - 336}" height="26" rx="8"/><circle cx="${ROW_X + 352}" cy="${ty}" r="6"/><text x="${ROW_X + 366}" y="${ty + 5}">${t}</text><text class="fl-cnt-n" x="${ROW_X + ROW_W - 12}" y="${ty + 5}" text-anchor="end">× ${FL.sayi(say[t] || 0)}</text></g>`;
        });
      } else A['row:wall:r'] = { x: ROW_X + ROW_W, y: y + 50 };
      this.k.rows.innerHTML = `<g class="fl-block is-${mode}">
        <text class="fl-cap" x="${ROW_X + 2}" y="${ROW_Y - 14}">harita.noktalar</text><text class="fl-cap-sub" x="${ROW_X + 140}" y="${ROW_Y - 14}">List&lt;HaritaNoktasi&gt;</text>
        ${stack}<text class="fl-stack-n" x="${ROW_X + 83}" y="${y + 50}" text-anchor="middle">× ${FL.sayi(n)}</text>
        <text class="fl-stack-s" x="${ROW_X + 176}" y="${y + 24}">${mode === 'kopya' && st.crash ? 'ekleme yarıda kaldı' : 'nokta nesnesi'}</text>
        <foreignObject x="${ROW_X + 176}" y="${y + 32}" width="${mode === 'kopya' ? ROW_W - 182 : 150}" height="70"><div xmlns="http://www.w3.org/1999/xhtml" class="fl-stack-d">${esc(per)}</div></foreignObject>
        ${types}
      </g>`;
    }

    // ---------------------------------------------------------------- iğneler
    _pins(st, prev, anim, big) {
      const A = this.anchors;
      const pinSvg = [];
      const labels = []; // {x, y, t, cls, pref}
      const UP = [[0, -46]];
      const DOWN = [[0, 4]];
      if (big && st.mode === 'kestirme' && st.yigin) {
        // gerçek konumlar boş; bütün noktalar türün son konumunda üst üste
        FL.UC.forEach((u) => {
          pinSvg.push({ x: MX(u.x), y: MY(u.y), html: `<g class="fl-ghost">${FL.pin('is-ghost ' + turCls(u.tur))}</g>` });
          labels.push({ x: MX(u.x), y: MY(u.y), t: u.etiket + ' ?', cls: ' is-lost', pref: UP });
        });
        FL.turOrder.forEach((t) => {
          const p = st.yigin[t];
          pinSvg.push({ x: MX(p.x), y: MY(p.y), html: FL.pin('is-drawn is-pile ' + turCls(t), t) });
          labels.push({ x: MX(p.x), y: MY(p.y), t: `${FL.sayi((st.sayac || {})[t] || 0)} ${t}: ${p.etiket}`, cls: ' is-bad', pref: DOWN });
        });
      } else {
        // çökmede harita hiç çizilmedi: üç gönderi de yalnızca listede
        const pins = big ? FL.UC.map((u, i) => Object.assign({ cizildi: !st.crash, i }, u)) : (st.noktalar || []).map((r, i) => Object.assign({ i }, r));
        const prevPins = prev.noktalar || [];
        pins.forEach((r) => {
          const x = MX(r.x);
          const y = MY(r.y);
          A['pin:' + r.i] = { x, y: y - 17 };
          const pr = prevPins[r.i];
          const stamp = anim && r.cizildi && !(pr && pr.cizildi);
          const cls = [turCls(r.depo ? null : r.tur), r.cizildi ? 'is-drawn' : 'is-ghost', stamp ? 'is-stamp' : '', r.hl ? 'is-hl' : '', r.kayip ? 'is-lost' : ''].join(' ');
          pinSvg.push({ x, y, html: FL.pin(cls, r.depo ? 'depo' : r.tur) });
          if (big || r.etiket) labels.push({ x, y, t: r.etiket, cls: r.kayip ? ' is-lost' : r.hl ? ' is-hl' : '', pref: UP });
        });
      }
      const boxes = placeLabels(
        labels.map((l) => {
          const w = l.t.length * 7.4 + 14;
          return Object.assign(l, { w, h: 18, pref: l.pref.map(([dx, dy]) => [dx - w / 2, dy]) });
        }),
        pinSvg
      );
      this.k.pins.innerHTML =
        pinSvg.map((p) => `<g transform="translate(${p.x},${p.y})">${p.html}</g>`).join('') +
        labels
          .map((l, i) => {
            const r = boxes[i];
            return `<g class="fl-pin-l${l.cls || ''}"><rect x="${r.x0}" y="${r.y0}" width="${l.w}" height="18" rx="9"/><text x="${r.x0 + l.w / 2}" y="${r.y0 + 13}" text-anchor="middle">${esc(l.t)}</text></g>`;
          })
          .join('');
    }

    // ---------------------------------------------------------------- bağlantılar: nokta → nesne
    _links(st, big) {
      const A = this.anchors;
      const path = (a, b) => `M${a.x} ${a.y} C${a.x + 26} ${a.y}, ${b.x - 26} ${b.y}, ${b.x} ${b.y}`;
      let html = '';
      if (big) {
        if (st.mode !== 'kopya')
          FL.turOrder.forEach((t) => {
            const a = A['row:' + t + ':r'];
            const b = A['card:' + t];
            if (a && b) html += `<path class="fl-link is-bundle ${turCls(t)}${st.mode === 'kestirme' ? ' is-kestirme' : ''}" d="${path(a, b)}"/>`;
          });
      } else
        (st.noktalar || []).forEach((r, i) => {
          const a = A['row:' + i + ':r'];
          const b = r.depo ? A['card:depo'] : st.mode === 'kopya' ? A['card:' + i] : A['card:' + r.tur];
          if (a && b) html += `<path class="fl-link ${turCls(r.depo ? null : r.tur)}${r.hl ? ' is-hl' : ''}" d="${path(a, b)}"/>`;
        });
      this.k.links.innerHTML = html;
    }

    // ---------------------------------------------------------------- bellek göstergesi
    _gauge(st, prev, anim) {
      const g = st.gauge || { ikon: 0, noktaKB: 0 };
      const pc = st.cihaz === 'pc';
      const lim = (pc ? FL.PC : FL.TABLET) * 1024;
      const ikonKB = g.ikon * FL.IKON_KB;
      const top = ikonKB + (g.noktaKB || 0);
      const X0 = 20;
      const BW = 920;
      const y = 532;
      const wI = g.oom ? BW : Math.min(BW, (ikonKB / lim) * BW);
      const wN = g.oom ? 0 : Math.min(BW - wI, ((g.noktaKB || 0) / lim) * BW);
      const ticks = [0, 0.25, 0.5, 0.75, 1]
        .map((f) => `<line class="fl-tick" x1="${X0 + f * BW}" x2="${X0 + f * BW}" y1="${y + 22}" y2="${y + 28}"/><text class="fl-tick-t" x="${X0 + f * BW}" y="${y + 41}" text-anchor="${f === 0 ? 'start' : f === 1 ? 'end' : 'middle'}">${Math.round((f * lim) / 1024)} MB</text>`)
        .join('');
      const right = g.oom
        ? `<text class="fl-g-r is-bad" x="${X0 + BW}" y="${y - 8}" text-anchor="end">≈ ${FL.sayi(FL.CRASH_AT)}. noktada bellek bitti</text>`
        : `<text class="fl-g-r" x="${X0 + BW}" y="${y - 8}" text-anchor="end">ikon verisi ${kb(ikonKB)} · noktalar ≈ ${kb(g.noktaKB || 0)} · toplam ≈ ${kb(top)}</text>`;
      const prevW = this._gw || 0;
      this.k.gauge.innerHTML = `<g class="fl-gauge${g.oom ? ' is-oom' : ''}${pc ? ' is-pc' : ''}">
        ${FL.icon(pc ? 'harita' : 'tablet', X0 - 2, y - 26, 0.75)}<text class="fl-g-l" x="${X0 + 20}" y="${y - 8}">Bellek · ${pc ? 'geliştirici bilgisayarı (-Xmx512m)' : 'kurye tableti (-Xmx64m)'}</text>${right}
        <rect class="fl-g-bg" x="${X0}" y="${y}" width="${BW}" height="20" rx="10"/>
        <rect class="fl-g-ikon" data-k="g-ikon" x="${X0}" y="${y}" width="${anim ? prevW : wI}" height="20" rx="10"/>
        <rect class="fl-g-nokta" x="${X0 + wI}" y="${y + 4}" width="${wN}" height="12" rx="6"/>
        ${g.oom ? `<text class="fl-g-oom" x="${X0 + BW / 2}" y="${y + 15}" text-anchor="middle">OutOfMemoryError: Java heap space</text>` : ''}
        ${ticks}
      </g>`;
      this._gw = wI;
      if (anim) {
        const bar = this.k.gauge.querySelector('.fl-g-ikon');
        void bar.getBoundingClientRect();
        bar.setAttribute('width', String(wI));
        if (st.fill) bar.style.transitionDuration = DP.dur(1600) + 'ms';
      }
    }

    /**
     * Haritayı baştan doldurur: noktacıklar belirir, gösterge yükselir; kalıpsız tasarım çöker, kestirmede noktalar
     * yığılır. done(): animasyon bitince.
     */
    fill(fin, prev, done) {
      if (!(fin.N > 3)) {
        this.render(fin, prev, { animate: true });
        if (done) done();
        return;
      }
      const a = Object.assign({}, fin, { fill: true });
      if (fin.crash) Object.assign(a, { boom: false, gauge: { ikon: FL.CRASH_AT * 0.97, noktaKB: 0, oom: false }, banner: { text: 'Bellek doluyor…', tone: 'bad' } });
      if (fin.yigin) {
        delete a.yigin;
        a.banner = { text: `${FL.sayi(fin.N)} nokta ekleniyor…` };
      }
      this.render(a, prev, { animate: true });
      this._at(fin.yigin ? 2100 : 1800, () => {
        if (fin.crash || fin.yigin) this.render(fin, a, { animate: true });
        if (done) done();
      });
    }

    // ---------------------------------------------------------------- jeton
    _token(t, anim) {
      const tok = this.k.tok;
      if (!t || !anim || DP.reducedMotion) {
        tok.classList.remove('is-on');
        return;
      }
      const a = this.anchors[t.from];
      const b = this.anchors[t.to];
      if (!a || !b) {
        tok.classList.remove('is-on');
        return;
      }
      const w = Math.max(80, t.text.length * 7.8 + 24);
      this.k['tok-bg'].setAttribute('x', String(-w / 2));
      this.k['tok-bg'].setAttribute('width', String(w));
      this.k['tok-t'].textContent = t.text;
      tok.setAttribute('class', 'fl-token is-on is-' + (t.kind || 'req'));
      setTransform(tok, `translate(${a.x}px, ${a.y}px)`, false);
      void tok.getBoundingClientRect();
      setTransform(tok, `translate(${b.x}px, ${b.y}px)`, true);
      this._at(t.stay ? 1500 : 1050, () => tok.classList.remove('is-on'));
    }

    destroy() {
      this._stop();
      this.el.remove();
    }
  }
  FL.Sahne = Sahne;
})();
