/*
 * Observer — animasyon sahnesi.
 *   OB.TakipSahne : gönderi takibi.
 *     Solda gözlenen gönderi(ler) (gonderi : Gonderi): takip numarası, alıcı, durum ve
 *       kalıpsız tasarımda kodda sabit alanlar (telefon, panel, tablet) ile hangi yöntemin hangi ekranı çağırdığı;
 *       kalıplı tasarımda abone listesi (sırasıyla) ve bildir() düğmesi.
 *     Sağda ekranlar (somut gözlemciler): Ali’nin telefonu (son SMS), satıcı paneli (gönderi listesi),
 *       kurye tableti (rota), çağrı merkezi (kayıtlar). Her ekran kendi bildiği durumu gösterir; bildirim isteyip
 *       bir değişikliği kaçıran ekran “bayat”, sonradan abone olup son durumu bilmeyen ekran “geç abone” olarak işaretlenir.
 *     Ortada teller: hangi gönderi kime haber veriyor. Bildirimler tel boyunca giden jetonlardır.
 *
 * Durum tabanlı çizim: render(state, prevState, {animate}) — geri/ileri adımlarda tutarlı.
 */
(function () {
  'use strict';
  const OB = DP.obs;
  const esc = DP.esc;
  const md = (t) => DP.md(t, OB.roleOf);

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
    gonderi: '<path d="M3 7.5 L12 3 L21 7.5 V16.5 L12 21 L3 16.5 Z"/><path d="M3 7.5 L12 12 L21 7.5 M12 12 V21"/>',
    telefon: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.2"/><path d="M10.5 18.5 H13.5"/>',
    panel: '<rect x="2.5" y="4" width="19" height="12.5" rx="1.8"/><path d="M8.5 20.5 H15.5 M12 16.5 V20.5 M6 8.5 H18 M6 12 H14"/>',
    tablet: '<rect x="3.5" y="3" width="17" height="18" rx="2.2"/><path d="M12 6.5 Q15 6.5 15 9.5 Q15 12 12 15 Q9 12 9 9.5 Q9 6.5 12 6.5 Z"/><circle cx="12" cy="9.6" r="0.9"/>',
    merkez: '<path d="M4.5 13 V11.5 Q4.5 4 12 4 Q19.5 4 19.5 11.5 V13"/><rect x="3" y="12.5" width="4" height="6" rx="1.5"/><rect x="17" y="12.5" width="4" height="6" rx="1.5"/><path d="M19 18.5 Q19 21 15 21 H13"/>',
    zil: '<path d="M6 16.5 V11 Q6 5 12 5 Q18 5 18 11 V16.5 L19.5 18 H4.5 Z"/><path d="M10 20.5 Q12 22 14 20.5"/>',
    kilit: '<rect x="5" y="10.5" width="14" height="10.5" rx="2"/><path d="M8 10.5 V7.5 Q8 3.5 12 3.5 Q16 3.5 16 7.5 V10.5"/>',
  };
  const ICON_OF = { aliTel: 'telefon', zeynepTel: 'telefon', panel: 'panel', tablet: 'tablet', merkez: 'merkez' };
  OB.icon = (k, x, y, s) => `<g class="obi obi-${k}" transform="translate(${x},${y})${s && s !== 1 ? ` scale(${s})` : ''}">${ICON[k]}</g>`;
  OB.ICON = ICON;
  OB.ICON_OF = ICON_OF;
  /** Durumun renk sınıfı */
  const DURUM_CLS = { Hazırlanıyor: 'is-d0', Yolda: 'is-d1', Dağıtımda: 'is-d2', 'Teslim edildi': 'is-d3' };

  // ================================================================== sahne
  const W = 960;
  const H = 600;
  const GX = 16; // gönderi kartları
  const GW = 330;
  const TOP = 36;
  const BOT = 528;
  const DX = 596; // ekranlar
  const DW = 348;
  const DG = 8;

  class TakipSahne {
    /** o: {cls} */
    constructor(root, o) {
      this.o = o || {};
      this.el = DP.h('div', { class: 'fm-stage obs-sahne' + (this.o.cls ? ' ' + this.o.cls : '') });
      root.appendChild(this.el);
      this.el.innerHTML = `
<svg class="fm-svg obs-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Gönderi takibi: gözlenen gönderiler, teller ve ekranlar">
  <rect class="obs-bg" x="-1500" y="-1500" width="4000" height="4000"/>
  <g data-k="head"></g>
  <g data-k="teller"></g>
  <g data-k="gonderiler"></g>
  <g data-k="ekranlar"></g>
  <g data-k="fx"></g>
  <foreignObject class="bubble-fo" data-k="b-banner" x="16" y="540" width="928" height="56"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble obs-banner"></div></foreignObject>
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
     *   mode: 'naive'|'sabit'|'observer', teslimEt (yöntem var mı), unutur (teslimEt tableti çağırmaz),
     *   gonderiler, gv: {g: değişken}, ov: {o: değişken}, ekranlar: [o], yer: {o: 'açıklama'} (henüz olmayan ekran),
     *   s: anlık durum (durum, liste, niyet, ekran, kacirdi, sms, rota),
     *   hl: {o: 'on'|'bad'}, ghl: {g: true}, bildir: g, yontem: {g, ad}, teller: [{g, o, kind: 'on'|'bad'}],
     *   tokens: [{from, to, text, kind, delay}], banner
     * }
     */
    render(st, prev, o) {
      const anim = !!(o && o.animate);
      prev = prev || {};
      this._stop();
      this.A = {};
      this.ek = OB.ekranDurumu(st.s, st.gonderiler);
      this._head(st);
      this._gonderiler(st, prev, anim);
      this._ekranlar(st, prev, anim);
      this._teller(st);
      banner(this.k['b-banner'], st.banner);
      this._tokens(st.tokens, anim);
    }

    _head(st) {
      this.k.head.innerHTML = `
        <text class="obs-cap is-konu" x="${GX}" y="26">${st.gonderiler.length > 1 ? 'Gözlenen gönderiler' : 'Gözlenen gönderi'}</text>
        <text class="obs-cap is-goz" x="${DX}" y="26">Ekranlar · gözlemciler</text>`;
    }

    // ---------------------------------------------------------------- gönderi kartları (konu)
    _gonderiler(st, prev, anim) {
      const n = st.gonderiler.length;
      const gap = 12;
      const ch = (BOT - TOP - gap * (n - 1)) / n;
      this.port = {};
      this.k.gonderiler.innerHTML = st.gonderiler.map((g, k) => this._kart(st, prev, anim, g, GX, TOP + k * (ch + gap), GW, ch)).join('');
    }

    _kart(st, prev, anim, g, x, y, w, h) {
      const s = st.s;
      const G = OB.GONDERI[g];
      const uzun = h > 300;
      const d = s.durum[g];
      const pd = prev.s && prev.s.durum ? prev.s.durum[g] : d;
      const yeniDurum = anim && pd !== d;
      const gv = (st.gv && st.gv[g]) || 'gonderi';
      const on = st.ghl && st.ghl[g];
      this.A['g:' + g] = { x: x + w, y: y + h / 2 };
      let html = `<g class="obs-kart rc rc-3${on ? ' is-on' : ''}">
        <rect class="obs-kart-bg" x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/>
        <circle class="obs-ic-bg" cx="${x + 28}" cy="${y + 30}" r="18"/>${OB.icon('gonderi', x + 16, y + 18, 1)}
        <text class="obs-kart-t" x="${x + 54}" y="${y + 28}">${esc(gv)} : Gonderi</text>
        <text class="obs-kart-s" x="${x + 54}" y="${y + 48}">${g} · ${esc(G.tam)} · ${esc(G.sehir)}</text>`;
      const k = OB.DURUMLAR.indexOf(d);
      let by;
      if (uzun) {
        // dikey durum çizelgesi: geçilen, şimdiki ve sıradaki durumlar
        html += `<text class="obs-sec" x="${x + 16}" y="${y + 80}">durum</text>`;
        OB.DURUMLAR.forEach((ad, i) => {
          const ry = y + 104 + i * 32;
          const cls = i < k ? ' is-gecti' : i === k ? ' is-simdi' : '';
          html += `<g class="obs-adim${cls}">${i < 3 ? `<path class="obs-adim-cizgi" d="M${x + 30} ${ry + 8} V${ry + 24}"/>` : ''}<circle cx="${x + 30}" cy="${ry}" r="${i === k ? 8 : 6}"/></g>`;
          if (i === k) html += `<g class="obs-durum ${DURUM_CLS[d]}${yeniDurum ? ' is-new' : ''}"><rect x="${x + 48}" y="${ry - 14}" width="150" height="28" rx="14"/><text x="${x + 123}" y="${ry + 5}" text-anchor="middle">${esc(ad)}</text></g>`;
          else html += `<text class="obs-adim-t${cls}" x="${x + 56}" y="${ry + 5}">${esc(ad)}</text>`;
        });
        by = y + 252;
      } else {
        const dy = y + 80;
        html += `<text class="obs-alan-k" x="${x + 16}" y="${dy + 5}">durum</text>
          <g class="obs-durum ${DURUM_CLS[d]}${yeniDurum ? ' is-new' : ''}"><rect x="${x + 74}" y="${dy - 14}" width="140" height="28" rx="14"/><text x="${x + 144}" y="${dy + 5}" text-anchor="middle">${esc(d)}</text></g>`;
        OB.DURUMLAR.forEach((ad, i) => {
          const cx = x + 232 + i * 25;
          html += `<g class="obs-adim${i < k ? ' is-gecti' : i === k ? ' is-simdi' : ''}"><circle cx="${cx}" cy="${dy}" r="${i === k ? 8 : 6}"/>${i < 3 ? `<path class="obs-adim-cizgi" d="M${cx + (i === k ? 8 : 6)} ${dy} H${cx + 25 - (i + 1 === k ? 8 : 6)}"/>` : ''}</g>`;
        });
        by = y + 112;
      }
      // alt bölüm
      if (st.mode === 'naive') html += this._sabitAlanlar(st, g, x, by, w, y + h, uzun);
      else html += this._aboneListesi(st, prev, anim, g, x, by, w, y + h, uzun);
      html += '</g>';
      return html;
    }

    /** Kalıpsız: kodda sabit alanlar ve hangi yöntemin kimi çağırdığı */
    _sabitAlanlar(st, g, x, y, w, alt, uzun) {
      const s = st.s;
      const tel = s.liste[g];
      const ad = (o) => (st.ov && st.ov[o]) || o;
      let html = `<text class="obs-sec" x="${x + 16}" y="${y}">kodda sabit alanlar</text>`;
      const sat = uzun ? 30 : 20;
      tel.forEach((o, i) => {
        const yy = y + (uzun ? 28 : 21) + i * sat;
        this.port[g + ':' + o] = yy - 5;
        html += `<g class="obs-alan"><text class="obs-alan-k" x="${x + 16}" y="${yy}">${esc(OB.degiskenAd(o, ad(o)))}</text><text class="obs-alan-v" x="${x + w - 16}" y="${yy}" text-anchor="end">→ ${OB.GOZ[o].sinif}</text></g>`;
      });
      // yöntem × ekran tablosu
      const ty = y + (uzun ? 28 : 21) + tel.length * sat + (uzun ? 26 : 4);
      if (ty + (uzun ? 56 : 40) > alt) return html;
      const yontemler = st.teslimEt ? ['setDurum', 'teslimEt'] : ['setDurum'];
      const cw = 56;
      const x0 = x + w - 16 - tel.length * cw;
      html += `<text class="obs-sec" x="${x + 16}" y="${ty}">kim kimi çağırır</text>`;
      tel.forEach((o, i) => (html += `<text class="obs-mx-h" x="${x0 + i * cw + cw / 2}" y="${ty}" text-anchor="middle">${OB.GOZ[o].tel ? 'tel.' : o}</text>`));
      yontemler.forEach((m, r) => {
        const yy = ty + (uzun ? 26 : 19) + r * (uzun ? 28 : 18);
        const yon = st.yontem && st.yontem.g === g && st.yontem.ad === m;
        html += `<text class="obs-mx-m${yon ? ' is-on' : ''}" x="${x + 16}" y="${yy}">${m}()</text>`;
        tel.forEach((o, i) => {
          const var_ = !(m === 'teslimEt' && st.unutur && o === 'tablet');
          html += `<text class="obs-mx-c ${var_ ? 'is-var' : 'is-yok'}" x="${x0 + i * cw + cw / 2}" y="${yy}" text-anchor="middle">${var_ ? '✓' : '✗'}</text>`;
        });
      });
      return html;
    }

    /** Kalıplı (ya da sabit liste): abone listesi sırasıyla ve bildir() */
    _aboneListesi(st, prev, anim, g, x, y, w, alt, uzun) {
      const s = st.s;
      const L = s.liste[g];
      const PL = prev.s && prev.s.liste && prev.s.liste[g] ? prev.s.liste[g] : L;
      const sabit = st.mode === 'sabit';
      let html = `<text class="obs-sec" x="${x + 16}" y="${y}">${sabit ? 'abone listesi · kurucuda sabit' : 'abone listesi · sırayla'}</text>`;
      if (sabit) html += OB.icon('kilit', x + w - 36, y - 15, 0.8);
      if (!L.length) html += `<text class="obs-bos" x="${x + 16}" y="${y + 30}">liste boş: kimse haber almaz</text>`;
      const ad = (o) => (st.ov && st.ov[o]) || o;
      const cw = uzun ? w - 32 : 96;
      const chh = uzun ? 34 : 28;
      L.forEach((o, i) => {
        const cx = uzun ? x + 16 : x + 16 + (i % 3) * (cw + 5);
        const cy = uzun ? y + 14 + i * (chh + 7) : y + 10 + Math.floor(i / 3) * (chh + 5);
        if (cy + chh > alt - (uzun ? 50 : 36)) return;
        const yeni = anim && !PL.includes(o);
        const on = st.hl && st.hl[o] && st.bildir === g;
        this.port[g + ':' + o] = cy + chh / 2;
        html += `<g class="obs-cip${yeni ? ' is-new' : ''}${on ? ' is-on' : ''}${uzun ? '' : ' is-kucuk'}"><rect x="${cx}" y="${cy}" width="${cw}" height="${chh}" rx="${chh / 2}"/><text class="obs-cip-n" x="${cx + 14}" y="${cy + chh / 2 + 5}" text-anchor="middle">${i + 1}</text><text class="obs-cip-t" x="${cx + 28}" y="${cy + chh / 2 + 5}"${fit(ad(o), cw - 34, uzun ? 8.6 : 7.8)}>${esc(ad(o))}</text>${uzun ? `<text class="obs-cip-s" x="${cx + cw - 14}" y="${cy + chh / 2 + 5}" text-anchor="end">${OB.GOZ[o].sinif}</text>` : ''}</g>`;
      });
      // bildir()
      const bh = uzun ? 32 : 26;
      const by = alt - bh - (uzun ? 14 : 10);
      const on = st.bildir === g;
      html += `<g class="obs-bildir${on ? ' is-on' : ''}"><rect x="${x + 16}" y="${by}" width="${w - 32}" height="${bh}" rx="${bh / 2}"/>${OB.icon('zil', x + 25, by + (bh - 19) / 2, 0.8)}<text x="${x + 50}" y="${by + bh / 2 + 5}">bildir(): herkese guncelle(this)</text></g>`;
      return html;
    }

    // ---------------------------------------------------------------- ekranlar (somut gözlemciler)
    _ekranlar(st, prev, anim) {
      const list = st.ekranlar;
      const n = list.length;
      const eh = Math.min(118, (BOT - TOP - DG * (n - 1)) / n);
      const toplam = n * eh + (n - 1) * DG;
      const y0 = TOP + Math.max(0, (BOT - TOP - toplam) / 2);
      this.dport = {};
      this.k.ekranlar.innerHTML = list.map((o, k) => this._ekran(st, prev, anim, o, DX, y0 + k * (eh + DG), DW, eh)).join('');
    }

    _ekran(st, prev, anim, o, x, y, w, h) {
      const s = st.s;
      const G = OB.GOZ[o];
      this.dport[o] = { x, y: y + h / 2, h };
      this.A['o:' + o] = { x: x + 4, y: y + h / 2 };
      const yer = st.yer && st.yer[o];
      if (yer)
        return `<g class="obs-ekran is-yok"><rect class="obs-ekran-bg" x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/>
          ${OB.icon(ICON_OF[o], x + 18, y + h / 2 - 12, 1)}
          <text class="obs-ekran-t" x="${x + 60}" y="${y + h / 2 - 3}">${esc(G.ad)}</text>
          <text class="obs-ekran-s" x="${x + 60}" y="${y + h / 2 + 15}">${esc(yer)}</text></g>`;
      const gs = st.gonderiler;
      const hl = st.hl && st.hl[o];
      const bayat = this.ek.bayat.filter((b) => b.o === o).map((b) => b.g);
      const gec = this.ek.gec.filter((b) => b.o === o).map((b) => b.g);
      const ister = gs.filter((g) => s.niyet[g].includes(o));
      const bagli = gs.filter((g) => s.liste[g].includes(o));
      const istemedigi = bagli.filter((g) => !ister.includes(g));
      const ad = (st.ov && st.ov[o]) || o;
      const kompakt = h < 100;
      let html = `<g class="obs-ekran rc rc-4${hl ? ' is-' + hl : ''}${bayat.length ? ' is-bayat' : ''}">
        <rect class="obs-ekran-bg" x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/>
        <circle class="obs-ic-bg" cx="${x + 30}" cy="${y + 31}" r="19"/>${OB.icon(ICON_OF[o], x + 18, y + 19, 1)}
        <text class="obs-ekran-t" x="${x + 60}" y="${y + 25}">${esc(G.ad)}</text>
        <text class="obs-ekran-s" x="${x + 60}" y="${y + 44}">${esc(ad)} : ${G.sinif}</text>`;
      // abonelik rozeti (sağ üst)
      let roz;
      let rozCls;
      if (istemedigi.length) {
        roz = 'istemiyor!';
        rozCls = 'is-bad';
      } else if (st.mode === 'naive') {
        roz = bagli.length ? 'kodda sabit' : ister.length ? 'bağlanamaz' : 'bağlı değil';
        rozCls = bagli.length ? 'is-sabit' : ister.length ? 'is-bad' : 'is-off';
      } else if (bagli.length) {
        roz = gs.length > 1 ? 'abone: ' + bagli.map(OB.kisa).join(', ') : 'abone';
        rozCls = 'is-abone';
      } else {
        roz = 'abone değil';
        rozCls = 'is-off';
      }
      const rw = Math.max(64, roz.length * 7.6 + 18);
      html += `<g class="obs-roz ${rozCls}"><rect x="${x + w - 10 - rw}" y="${y + 9}" width="${rw}" height="22" rx="11"/><text x="${x + w - 10 - rw / 2}" y="${y + 24.5}" text-anchor="middle">${esc(roz)}</text></g>`;
      // gövde
      const by = y + (kompakt ? 68 : 78);
      const sat = kompakt ? 18 : 22;
      const isaret = (g) => (bayat.includes(g) ? ' is-bayat' : gec.includes(g) ? ' is-gec' : '');
      const ek = (g, xx, yy) => (bayat.includes(g) ? `<text class="obs-uyari is-bad" x="${xx}" y="${yy}" text-anchor="end">bayat!</text>` : gec.includes(g) ? `<text class="obs-uyari is-gec" x="${xx}" y="${yy}" text-anchor="end">geç abone</text>` : '');
      const E = s.ekran[o] || {};
      if (G.tel) {
        const m = s.sms[o];
        const sayi = Object.keys(E).length;
        if (!m) html += `<text class="obs-bos" x="${x + 60}" y="${by}">henüz SMS yok</text>`;
        else {
          const t = `${m.g} ${m.durum}`;
          const pm = prev.s && prev.s.sms ? prev.s.sms[o] : null;
          const yeni = anim && (!pm || pm.g !== m.g || pm.durum !== m.durum);
          const bw = Math.min(w - 132, t.length * 8.4 + 26);
          html += `<g class="obs-sms${yeni ? ' is-new' : ''}${isaret(m.g)}"><rect x="${x + 60}" y="${by - 18}" width="${bw}" height="26" rx="9"/><text x="${x + 72}" y="${by}">${esc(t)}</text></g>`;
          if (sayi > 1 && gs.length > 1) html += `<text class="obs-kucuk" x="${x + 60}" y="${by + sat + 2}">${gs.filter((g) => E[g]).map((g) => `${OB.kisa(g)}: ${E[g]}`).join(' · ')}</text>`;
        }
        gs.forEach((g, i) => (html += ek(g, x + w - 12, by + i * sat)));
      } else if (o === 'tablet') {
        const rota = s.rota;
        html += `<text class="obs-govde" x="${x + 60}" y="${by}">rota: <tspan class="obs-rota${rota.some((g) => s.durum[g] === OB.TESLIM) ? ' is-bad' : ''}">${rota.length ? rota.join(' ') : 'boş'}</tspan></text>`;
        const bil = gs.filter((g) => E[g]);
        if (bil.length) html += `<text class="obs-kucuk" x="${x + 60}" y="${by + sat}">${bil.map((g) => `${OB.kisa(g)}: ${E[g]}`).join(' · ')}</text>`;
        gs.forEach((g, i) => (html += ek(g, x + w - 12, by + i * sat)));
      } else {
        // panel, merkez: gönderi başına bir satır
        gs.forEach((g, i) => {
          const yy = by + i * sat;
          if (yy > y + h - 6) return;
          const v = E[g];
          html += `<g class="obs-satir${isaret(g)}"><text class="obs-govde is-no" x="${x + 60}" y="${yy}">${g}</text><text class="obs-govde" x="${x + 146}" y="${yy}">${o === 'merkez' ? '→ ' : ''}${v ? esc(v) : '—'}</text></g>`;
          html += ek(g, x + w - 12, yy);
        });
      }
      html += '</g>';
      return html;
    }

    // ---------------------------------------------------------------- teller
    _teller(st) {
      const s = st.s;
      const gs = st.gonderiler;
      const vurgu = {};
      (st.teller || []).forEach((t) => (vurgu[t.g + ':' + t.o] = t.kind));
      let html = '';
      gs.forEach((g, gi) => {
        const A = this.A['g:' + g];
        const L = s.liste[g];
        const ister = s.niyet[g];
        const hepsi = L.concat(ister.filter((o) => !L.includes(o)));
        hepsi.forEach((o) => {
          const D = this.dport[o];
          if (!D || (st.yer && st.yer[o])) return;
          const off = gs.length > 1 ? (gi - (gs.length - 1) / 2) * Math.min(16, D.h / 4) : 0;
          const y2 = D.y + off;
          const y1 = this.port[g + ':' + o] != null ? this.port[g + ':' + o] : A.y;
          const bagli = L.includes(o);
          let cls = st.mode === 'naive' ? 'is-sabit' : 'is-abone';
          if (!bagli) cls = 'is-kopuk';
          else if (!ister.includes(o)) cls += ' is-istenmeyen';
          const v = vurgu[g + ':' + o];
          if (v) cls += ' is-' + v;
          const x1 = A.x;
          const x2 = D.x;
          const mx = (x1 + x2) / 2;
          this.A['w:' + g + ':' + o] = { x1, y1, x2, y2 };
          this.A['p:' + g + ':' + o] = { x: x1 + 6, y: y1 };
          this.A['q:' + g + ':' + o] = { x: x2 - 6, y: y2 };
          html += `<path class="obs-tel ${cls}" d="M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}"/>`;
          if (bagli) html += `<circle class="obs-fis ${cls}" cx="${x2}" cy="${y2}" r="4.5"/>`;
          else html += `<text class="obs-tel-x" x="${x2 - 14}" y="${y2 + 5}" text-anchor="middle">✗</text>`;
        });
      });
      this.k.teller.innerHTML = html;
    }

    // ---------------------------------------------------------------- jetonlar
    _tokens(list, anim) {
      const fx = this.k.fx;
      fx.innerHTML = '';
      if (!list || !list.length || !anim || DP.reducedMotion) return;
      list.forEach((t) => {
        const a = this.A[t.from];
        const b = this.A[t.to];
        if (!a || !b) return;
        const w = Math.max(64, t.text.length * 7.8 + 24);
        const g = DP.s('g', { class: 'obs-token is-' + (t.kind || 'bil') });
        g.innerHTML = `<g class="obs-token-in"><rect x="${-w / 2}" y="-13" width="${w}" height="26" rx="13"/><text x="0" y="5" text-anchor="middle">${esc(t.text)}</text></g>`;
        fx.appendChild(g);
        setTransform(g, `translate(${a.x}px, ${a.y}px)`, false);
        this._at(t.delay || 0, () => {
          g.classList.add('is-on');
          void g.getBoundingClientRect();
          setTransform(g, `translate(${b.x}px, ${b.y}px)`, true);
        });
        this._at((t.delay || 0) + (t.stay ? 1500 : 1000), () => g.classList.remove('is-on'));
      });
    }

    destroy() {
      this._stop();
      this.el.remove();
    }
  }
  OB.TakipSahne = TakipSahne;

  // ================================================================== durum yardımcıları (sahneler kullanır)
  /** Kalıpsız tasarımda alan adı (telefon, panel, tablet) */
  OB.degiskenAd = (o, ad) => (OB.GOZ[o].tel ? 'telefon' : ad);
  /** Program + anlık durum → sahne durumu (taban) */
  OB.stateFrom = function (prog, s, x) {
    const gv = {};
    prog.gonderiler.forEach((g) => (gv[g] = OB.gDegisken(prog, g)));
    const ov = {};
    OB.GOZ_SIRA.forEach((o) => (ov[o] = OB.degisken(prog, o)));
    const ekranlar = OB.tanimli(prog).slice();
    const yer = {};
    if (prog.tasarim === 'dogrudan' && prog.surum === 'v1') {
      ekranlar.push('tablet');
      yer.tablet = 'sürüm 1.1’de eklenecek';
    }
    // kalıpsız tasarımda niyet edilen ama tanımlı olmayan ekran (çağrı merkezi) da görünsün
    if (!OB.kalipli(prog)) OB.GOZ_SIRA.forEach((o) => !ekranlar.includes(o) && prog.gonderiler.some((g) => s.niyet[g].includes(o)) && ekranlar.push(o));
    return Object.assign(
      {
        mode: prog.tasarim === 'observer' ? 'observer' : prog.tasarim === 'sabit' ? 'sabit' : 'naive',
        teslimEt: OB.teslimEtVar(prog),
        unutur: OB.tabletUnutulur(prog),
        gonderiler: prog.gonderiler,
        gv,
        ov,
        ekranlar: OB.GOZ_SIRA.filter((o) => ekranlar.includes(o)),
        yer,
        s,
      },
      x || {}
    );
  };
  /** Programın kurulum anı (abone eklenmeden önce ya da kalıpsızda kurucudan sonra) */
  OB.BOS_AN = (prog) => OB.run(Object.assign({}, prog, { ops: [], ozet: [] })).olaylar[0].s;
  /** Bütün başlangıç aboneleri eklendikten sonraki an */
  OB.KURULU_AN = (prog) => {
    const O = OB.run(Object.assign({}, prog, { ops: [], ozet: [] })).olaylar;
    return O[O.length - 1].s;
  };
})();
