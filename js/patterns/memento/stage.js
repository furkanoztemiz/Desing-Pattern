/*
 * Memento — animasyon sahnesi.
 *   MN.DepoSahne : Malatya deposu.
 *     Sol üstte raflar (A1…C4), yanında Malatya kamyonu.
 *     Altta kaynak nesne (depo : Depo): alanları birer nesneye bağlı (raflar → Map #1, kamyon → List #2);
 *       kalıpsız tasarımda get/set ile dışarı açık, Memento’da kapalı. Sağında “hatıra masası”: oluşturulan ya da
 *       açılan hatıranın içi (geniş arayüz: yalnızca Depo görür).
 *     Sağda emanetçi (defter : YedekDefteri): kayıtlar. Kalıpsızda açık harita sayfaları (hangi nesne olduğu ve
 *       içindekiler), Memento’da mühürlü zarflar (içi görünmez).
 *   Kalıpsız tasarımın tuzakları görünür: “yedek” deponun kendi haritasıysa (aynı nesne) depoyla birlikte değişir;
 *   kamyon hiç kaydedilmezse geri yüklemeden sonra koli iki yerde durur.
 *
 * Durum tabanlı çizim: render(state, prevState, {animate}) — geri/ileri adımlarda tutarlı.
 */
(function () {
  'use strict';
  const MN = DP.mnt;
  const esc = DP.esc;
  const md = (t) => DP.md(t, MN.roleOf);

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
    depo: '<path d="M3 21 V8.5 L12 3.5 L21 8.5 V21 Z"/><path d="M7 21 V13 H17 V21 M7 17 H17"/>',
    defter: '<path d="M5 3.5 H17 Q19 3.5 19 5.5 V20.5 H7 Q5 20.5 5 18.5 Z"/><path d="M8.5 8 H15.5 M8.5 11.5 H15.5 M8.5 15 H13"/>',
    zarf: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.5 6.5 L12 13 L20.5 6.5"/>',
    kilit: '<rect x="5" y="10.5" width="14" height="10.5" rx="2"/><path d="M8 10.5 V7.5 Q8 3.5 12 3.5 Q16 3.5 16 7.5 V10.5"/>',
    goz: '<path d="M2 12 Q12 3 22 12 Q12 21 2 12 Z"/><circle cx="12" cy="12" r="3.2"/>',
    soguk: '<path d="M12 2.5 V21.5 M3.8 7.25 L20.2 16.75 M3.8 16.75 L20.2 7.25"/>',
  };
  MN.icon = (k, x, y, s) => `<g class="mni mni-${k}" transform="translate(${x},${y})${s && s !== 1 ? ` scale(${s})` : ''}">${ICON[k]}</g>`;
  MN.ICON = ICON;

  // ================================================================== sahne
  const W = 960;
  const H = 600;
  const GX = 16; // raflar
  const GY = 36;
  const CW = 92;
  const CH = 72;
  const CG = 8;
  const RG = 8;
  const TX = 424; // kamyon
  const TW = 216;
  const OX = 16; // kaynak (Depo) kartı
  const OY = 284;
  const OW = 624;
  const OH = 244;
  const DX = 656; // emanetçi (defter)
  const DY = 36;
  const DW = 288;
  const DH = 492;
  const EH = 98; // defter kaydı
  const EG = 6;

  const cell = (raf) => {
    const r = 'ABC'.indexOf(raf[0]);
    const c = Number(raf.slice(1)) - 1;
    return { x: GX + c * (CW + CG), y: GY + r * (CH + RG) };
  };
  MN.cellOf = cell;
  const yukYeri = (i) => ({ x: TX + 12 + (i % 2) * 84, y: GY + 32 + Math.floor(i / 2) * 44 });

  /** Küçük raf haritası (defter sayfası, hatıra masası) */
  function mini(x, y, raflar, o) {
    o = o || {};
    const w = o.w || 28;
    const h = o.h || 16;
    const g = 3;
    const yer = {};
    Object.keys(raflar || {}).forEach((k) => (yer[raflar[k]] = k));
    return MN.RAFLAR.map((raf) => {
      const r = 'ABC'.indexOf(raf[0]);
      const c = Number(raf.slice(1)) - 1;
      const cx = x + c * (w + g);
      const cy = y + r * (h + g);
      const koli = yer[raf];
      const fark = o.fark && koli && o.fark[koli];
      return `<g class="mnt-mini${koli ? ' is-dolu' : ''}${fark ? ' is-fark' : ''}"><rect x="${cx}" y="${cy}" width="${w}" height="${h}" rx="3"/>${koli ? `<text x="${cx + w / 2}" y="${cy + h - 4.5}" text-anchor="middle">${MN.kisa(koli).slice(2)}</text>` : ''}</g>`;
    }).join('');
  }
  MN.mini = mini;

  /** Mühürlü zarf (hatıra) */
  function zarf(x, y, w, h, etiket) {
    return `<g class="mnt-zarf"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/><path class="mnt-zarf-kapak" d="M${x + 2} ${y + 3} L${x + w / 2} ${y + h * 0.55} L${x + w - 2} ${y + 3}"/>
      <circle class="mnt-muhur" cx="${x + w / 2}" cy="${y + h * 0.55}" r="9"/>${MN.icon('kilit', x + w / 2 - 6, y + h * 0.55 - 6, 0.5)}
      ${etiket ? `<text class="mnt-zarf-t" x="${x + w / 2}" y="${y + h - 7}" text-anchor="middle">${esc(etiket)}</text>` : ''}</g>`;
  }

  class DepoSahne {
    /** o: {cls} */
    constructor(root, o) {
      this.o = o || {};
      this.el = DP.h('div', { class: 'fm-stage mnt-sahne' + (this.o.cls ? ' ' + this.o.cls : '') });
      root.appendChild(this.el);
      this.el.innerHTML = `
<svg class="fm-svg mnt-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Depo: raflar, kamyon, kaynak nesne ve yedek defteri">
  <rect class="mnt-bg" x="-1500" y="-1500" width="4000" height="4000"/>
  <g data-k="head"></g>
  <g data-k="raflar"></g>
  <g data-k="kamyon"></g>
  <g data-k="kaynak"></g>
  <g data-k="defter"></g>
  <g data-k="fx"><g class="mnt-token" data-k="tok"><g class="mnt-token-in"><rect data-k="tok-bg" x="-60" y="-14" width="120" height="28" rx="14"/><text data-k="tok-t" x="0" y="5" text-anchor="middle"></text></g></g></g>
  <foreignObject class="bubble-fo" data-k="b-banner" x="16" y="540" width="928" height="56"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble mnt-banner"></div></foreignObject>
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
     *   mode: 'naive'|'hatira', v1 (kamyon yok), defter: 'referans'|'kopya'|'hatira',
     *   raflar: {koli: raf}, raflarId, kamyon: [koli]|null, kamyonId,
     *   yedekler: [{ad, tur: 'map'|'hatira', id, raflar, kamyon, canli}], masa: {id, raflar, kamyon, tur: 'olustur'|'ac'}|null,
     *   gecmis: {geri, ileri}|null, hl: {koli: 'move'|'ok'|'bad'}, ghost: {koli: raf}, hataRaf, defterHl: ad, alanHl: {raflar|kamyon: true},
     *   yontem: vurgulanan yöntem adı, token: {from, to, text, kind}, banner
     * }
     */
    render(st, prev, o) {
      const anim = !!(o && o.animate);
      prev = prev || {};
      this._stop();
      this.A = {};
      const say = {};
      Object.keys(st.raflar || {}).forEach((k) => (say[k] = (say[k] || 0) + 1));
      (st.kamyon || []).forEach((k) => (say[k] = (say[k] || 0) + 1));
      this.iki = {};
      Object.keys(say).forEach((k) => say[k] > 1 && (this.iki[k] = true));
      this._head(st);
      this._raflar(st, prev, anim);
      this._kamyon(st, prev, anim);
      this._kaynak(st, prev, anim);
      this._defter(st, prev, anim);
      banner(this.k['b-banner'], st.banner);
      this._token(st.token, anim);
    }

    _head(st) {
      this.k.head.innerHTML = `
        <text class="mnt-cap" x="${GX}" y="26">Raflar</text>
        <text class="mnt-cap" x="${TX}" y="26">Malatya kamyonu</text>
        <text class="mnt-cap is-care" x="${DX}" y="26">Emanetçi · defter</text>`;
    }

    // ---------------------------------------------------------------- raflar
    _raflar(st, prev, anim) {
      const R = st.raflar || {};
      const PR = prev.raflar || {};
      const hl = st.hl || {};
      const ghost = st.ghost || {};
      const yerinde = {};
      Object.keys(R).forEach((k) => (yerinde[R[k]] = k));
      const ghostAt = {};
      Object.keys(ghost).forEach((k) => (ghostAt[ghost[k]] = k));
      this.k.raflar.innerHTML = MN.RAFLAR.map((raf) => {
        const c = cell(raf);
        this.A['cell:' + raf] = { x: c.x + CW / 2, y: c.y + CH / 2 + 6 };
        const koli = yerinde[raf];
        let ic = '';
        if (koli) {
          const K = MN.KOLI[koli];
          const cls = this.iki[koli] ? ' is-iki' : hl[koli] ? ' is-' + hl[koli] : '';
          const yeni = anim && PR[koli] !== raf;
          ic = `<g class="mnt-koli${cls}${yeni ? ' is-new' : ''}">
            <rect x="${c.x + 9}" y="${c.y + 20}" width="${CW - 18}" height="${CH - 26}" rx="6"/>
            <path class="mnt-koli-bant" d="M${c.x + CW / 2} ${c.y + 20} V${c.y + CH - 6}"/>
            <text class="mnt-koli-no" x="${c.x + CW / 2}" y="${c.y + 40}" text-anchor="middle">${MN.kisa(koli)}</text>
            <text class="mnt-koli-ad" x="${c.x + CW / 2}" y="${c.y + 56}" text-anchor="middle">${esc(this.iki[koli] ? 'iki yerde!' : K.ad)}</text>
            ${K.soguk ? MN.icon('soguk', c.x + CW - 22, c.y + 23, 0.5) : ''}
          </g>`;
        } else if (ghostAt[raf]) {
          ic = `<g class="mnt-hayal"><rect x="${c.x + 9}" y="${c.y + 20}" width="${CW - 18}" height="${CH - 26}" rx="6"/><text x="${c.x + CW / 2}" y="${c.y + 42}" text-anchor="middle">${MN.kisa(ghostAt[raf])}?</text><text class="mnt-hayal-s" x="${c.x + CW / 2}" y="${c.y + 57}" text-anchor="middle">olmalıydı</text></g>`;
        }
        const hata = st.hataRaf === raf;
        return `<g class="mnt-raf${koli ? '' : ' is-bos'}${hata ? ' is-hata' : ''}">
          <rect class="mnt-raf-bg" x="${c.x}" y="${c.y}" width="${CW}" height="${CH}" rx="9"/>
          <text class="mnt-raf-ad" x="${c.x + 8}" y="${c.y + 14}">${raf}</text>
          ${hata ? `<text class="mnt-raf-hata" x="${c.x + CW - 8}" y="${c.y + 14}" text-anchor="end">dolu!</text>` : ''}
          ${ic}
        </g>`;
      }).join('');
    }

    // ---------------------------------------------------------------- kamyon
    _kamyon(st, prev, anim) {
      this.A.kamyon = { x: TX + 92, y: GY + 120 };
      if (st.v1) {
        this.k.kamyon.innerHTML = `<g class="mnt-truck is-yok"><rect class="mnt-truck-kasa" x="${TX}" y="${GY}" width="${TW}" height="232" rx="10"/>
          <text class="mnt-truck-bos" x="${TX + TW / 2}" y="${GY + 108}" text-anchor="middle">kamyon yok</text>
          <text class="mnt-truck-s" x="${TX + TW / 2}" y="${GY + 130}" text-anchor="middle">sürüm 2.0’da eklenecek</text></g>`;
        return;
      }
      const Y = st.kamyon || [];
      const PY = prev.kamyon || [];
      const hl = st.hl || {};
      const sayac = {};
      const kutular = Y.map((koli, i) => {
        const p = yukYeri(i);
        const K = MN.KOLI[koli];
        sayac[koli] = (sayac[koli] || 0) + 1;
        const fresh = anim && PY.length < Y.length && i >= PY.length;
        const cls = this.iki[koli] ? ' is-iki' : hl[koli] ? ' is-' + hl[koli] : '';
        return `<g class="mnt-koli is-yuk${cls}${fresh ? ' is-new' : ''}"><rect x="${p.x}" y="${p.y}" width="78" height="38" rx="6"/><text class="mnt-koli-no" x="${p.x + 39}" y="${p.y + 17}" text-anchor="middle">${MN.kisa(koli)}</text><text class="mnt-koli-ad" x="${p.x + 39}" y="${p.y + 31}" text-anchor="middle">${esc(this.iki[koli] ? 'iki yerde!' : K.ad)}</text></g>`;
      }).join('');
      this.k.kamyon.innerHTML = `<g class="mnt-truck">
        <rect class="mnt-truck-kasa" x="${TX}" y="${GY}" width="178" height="214" rx="10"/>
        <text class="mnt-truck-t" x="${TX + 12}" y="${GY + 20}">kasa · ${Y.length} koli</text>
        <path class="mnt-truck-kabin" d="M${TX + 182} ${GY + 104} H${TX + 200} L${TX + TW} ${GY + 136} V${GY + 214} H${TX + 182} Z"/>
        <rect class="mnt-truck-cam" x="${TX + 188}" y="${GY + 114}" width="16" height="22" rx="3"/>
        <circle class="mnt-truck-teker" cx="${TX + 40}" cy="${GY + 222}" r="13"/><circle class="mnt-truck-teker" cx="${TX + 136}" cy="${GY + 222}" r="13"/><circle class="mnt-truck-teker" cx="${TX + 196}" cy="${GY + 222}" r="13"/>
        ${Y.length ? '' : `<text class="mnt-truck-bos" x="${TX + 89}" y="${GY + 116}" text-anchor="middle">boş</text>`}
        ${kutular}
      </g>`;
    }

    // ---------------------------------------------------------------- kaynak nesne (Depo) ve hatıra masası
    _kaynak(st, prev, anim) {
      const naive = st.mode === 'naive';
      const ah = st.alanHl || {};
      const R = st.raflar || {};
      this.A.depo = { x: OX + 150, y: OY + 60 };
      this.A.masa = { x: OX + 486, y: OY + 120 };
      const alan = (ad, deger, y, hl) => `<g class="mnt-alan${hl ? ' is-hl' : ''}"><text class="mnt-alan-k" x="${OX + 18}" y="${y}">${ad}</text><text class="mnt-alan-v" x="${OX + 318}" y="${y}" text-anchor="end">${esc(deger)}</text></g>`;
      let html = `<g class="mnt-kaynak rc rc-3">
        <rect class="mnt-kart-bg" x="${OX}" y="${OY}" width="${OW}" height="${OH}" rx="12"/>
        <circle class="mnt-ic-bg" cx="${OX + 27}" cy="${OY + 27}" r="17"/>${MN.icon('depo', OX + 15, OY + 15, 1)}
        <text class="mnt-kart-t" x="${OX + 52}" y="${OY + 24}">depo : Depo</text>
        <text class="mnt-kart-s" x="${OX + 52}" y="${OY + 42}">${naive ? 'iç durumu get/set ile dışarı açık' : 'hatırasını kendisi oluşturur, kendisi döner'}</text>`;
      html += alan('raflar', `→ Map #${st.raflarId} · ${Object.keys(R).length} koli`, OY + 76, ah.raflar);
      if (!st.v1) html += alan('kamyon', `→ List #${st.kamyonId} · ${(st.kamyon || []).length} koli`, OY + 102, ah.kamyon);
      // yöntemler
      const pill = (t, x, y, cls) => {
        const w = Math.max(96, t.length * 7.2 + 18);
        return `<g class="mnt-yontem ${cls}${st.yontem === t.split('(')[0] ? ' is-on' : ''}"><rect x="${x}" y="${y}" width="${w}" height="24" rx="12"/><text x="${x + w / 2}" y="${y + 16}" text-anchor="middle">${esc(t)}</text></g>`;
      };
      const my = OY + 128;
      if (naive) {
        html += `<text class="mnt-sec" x="${OX + 18}" y="${my}">dışarı açık</text>`;
        html += pill('getRaflar()', OX + 18, my + 8, 'is-acik') + pill('setRaflar(m)', OX + 168, my + 8, 'is-acik');
        if (!st.v1) html += pill('getKamyon()', OX + 18, my + 38, 'is-acik') + pill('setKamyon(k)', OX + 168, my + 38, 'is-acik');
        html += `<text class="mnt-sec-n is-bad" x="${OX + 18}" y="${OY + OH - 14}">herkes iç durumu okuyup değiştirebilir</text>`;
      } else {
        html += `<text class="mnt-sec" x="${OX + 18}" y="${my}">hatıra yöntemleri</text>`;
        html += pill('hatiraOlustur()', OX + 18, my + 8, 'is-hat') + pill('hatirayaDon(h)', OX + 18, my + 38, 'is-hat');
        if (st.gecmis) html += `<g class="mnt-gecmis"><text class="mnt-sec" x="${OX + 18}" y="${my + 86}">geri al / yinele</text><text class="mnt-gecmis-v" x="${OX + 18}" y="${my + 104}">DepoGecmisi · geri: ${st.gecmis.geri} ✉ · ileri: ${st.gecmis.ileri} ✉</text></g>`;
        else html += `<text class="mnt-sec-n is-ok" x="${OX + 18}" y="${OY + OH - 14}">get/set yok: iç durum kapalı</text>`;
      }
      // hatıra masası
      const mx = OX + 344;
      const myy = OY + 14;
      const mw = OW - 344 - 12;
      const mh = OH - 28;
      html += `<g class="mnt-masa"><rect class="mnt-masa-bg" x="${mx}" y="${myy}" width="${mw}" height="${mh}" rx="10"/>`;
      const M = st.masa;
      if (!M) {
        html += `<text class="mnt-masa-bos" x="${mx + mw / 2}" y="${myy + mh / 2 - 4}" text-anchor="middle">hatıra masası</text>
          <text class="mnt-masa-bos is-s" x="${mx + mw / 2}" y="${myy + mh / 2 + 16}" text-anchor="middle">${naive ? '(hatıra yok: yedeği defter alıyor)' : 'oluşturulan ya da açılan hatıra burada'}</text>`;
      } else {
        const fresh = anim && (!prev.masa || prev.masa.id !== M.id || prev.masa.tur !== M.tur);
        html += `<g class="mnt-hatira-acik${fresh ? ' is-new' : ''}">
          <text class="mnt-masa-t" x="${mx + 12}" y="${myy + 22}">${esc(M.ad || 'h')} : Depo.Hatira #${M.id}</text>
          <text class="mnt-masa-s" x="${mx + 12}" y="${myy + 40}">${M.tur === 'ac' ? 'açıldı: Depo kopyayı geri okuyor' : 'oluşturuldu: Depo kendini kopyaladı'}</text>
          ${mini(mx + 12, myy + 54, M.raflar, { w: 30, h: 22 })}
          <text class="mnt-masa-k" x="${mx + 12}" y="${myy + 152}">kamyon:</text>
          <text class="mnt-masa-kv" x="${mx + 70}" y="${myy + 152}">${(M.kamyon || []).length ? esc(M.kamyon.map(MN.kisa).join(' ')) : 'boş'}</text>
          <g class="mnt-genis">${MN.icon('goz', mx + 12, myy + 168, 0.8)}<text x="${mx + 36}" y="${myy + 184}">geniş arayüz: içini yalnızca Depo görür</text></g>
        </g>`;
      }
      html += '</g></g>';
      this.k.kaynak.innerHTML = html;
    }

    // ---------------------------------------------------------------- emanetçi (defter)
    _defter(st, prev, anim) {
      const naive = st.mode === 'naive';
      const Y = st.yedekler || [];
      const PY = (prev.yedekler || []).map((y) => y.ad);
      this.A.defter = { x: DX + DW / 2, y: DY + 40 };
      let html = `<g class="mnt-defter rc rc-5">
        <rect class="mnt-kart-bg" x="${DX}" y="${DY}" width="${DW}" height="${DH}" rx="12"/>
        <circle class="mnt-ic-bg" cx="${DX + 27}" cy="${DY + 27}" r="17"/>${MN.icon('defter', DX + 15, DY + 15, 1)}
        <text class="mnt-kart-t" x="${DX + 52}" y="${DY + 24}">defter : YedekDefteri</text>
        <text class="mnt-kart-s" x="${DX + 52}" y="${DY + 42}">${naive ? (st.defter === 'kopya' ? 'raflar haritasının kopyası' : 'raflar haritası (referans)') : 'hatıra saklar, içine bakamaz'}</text>`;
      if (!Y.length) html += `<text class="mnt-defter-bos" x="${DX + DW / 2}" y="${DY + 120}" text-anchor="middle">henüz kayıt yok</text>`;
      const gor = Y.slice(-4);
      gor.forEach((y, i) => {
        const ex = DX + 8;
        const ey = DY + 58 + i * (EH + EG);
        const ew = DW - 16;
        this.A['kayit:' + y.ad] = { x: ex + ew / 2, y: ey + EH / 2 };
        const fresh = anim && !PY.includes(y.ad);
        const on = st.defterHl === y.ad;
        let ic = '';
        let tip;
        let durum;
        let durumCls = '';
        if (y.tur === 'hatira') {
          tip = `Hatira #${y.id}`;
          durum = '🔒 mühürlü: içini yalnızca Depo açar';
          durumCls = ' is-ok';
          ic = zarf(ex + 10, ey + 42, 121, 50, '') + `<text class="mnt-kayit-not" x="${ex + 142}" y="${ey + 62}">içinde:</text><text class="mnt-kayit-not" x="${ex + 142}" y="${ey + 78}">raflar + kamyon</text><text class="mnt-kayit-not is-s" x="${ex + 142}" y="${ey + 92}">(defter bilmez)</text>`;
        } else {
          tip = `Map #${y.id}`;
          if (y.canli) {
            durum = '≡ deponun şu anki haritası!';
            durumCls = ' is-bad';
          } else {
            durum = st.v1 ? 'harita kopyası' : 'harita kopyası · kamyon yok';
            durumCls = st.v1 ? '' : ' is-warn';
          }
          ic = mini(ex + 10, ey + 42, y.raflar) + `<text class="mnt-kayit-not" x="${ex + 142}" y="${ey + 62}">raflar: ${Object.keys(y.raflar).length}</text><text class="mnt-kayit-not${st.v1 ? '' : ' is-warn'}" x="${ex + 142}" y="${ey + 78}">${st.v1 ? '' : 'kamyon: —'}</text>`;
        }
        html += `<g class="mnt-kayit${y.tur === 'hatira' ? ' is-hatira' : ' is-map'}${y.canli ? ' is-canli' : ''}${on ? ' is-on' : ''}${fresh ? ' is-new' : ''}">
          <rect class="mnt-kayit-bg" x="${ex}" y="${ey}" width="${ew}" height="${EH}" rx="9"/>
          <text class="mnt-kayit-ad" x="${ex + 12}" y="${ey + 19}">${esc(y.ad)}</text>
          <text class="mnt-kayit-tip" x="${ex + ew - 12}" y="${ey + 19}" text-anchor="end">${esc(tip)}</text>
          <text class="mnt-kayit-durum${durumCls}" x="${ex + 12}" y="${ey + 35}"${fit(durum, ew - 24, 6.4)}>${esc(durum)}</text>
          ${ic}
        </g>`;
      });
      if (Y.length > 4) html += `<text class="mnt-defter-bos" x="${DX + DW / 2}" y="${DY + DH - 10}" text-anchor="middle">+${Y.length - 4} eski kayıt</text>`;
      html += '</g>';
      this.k.defter.innerHTML = html;
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
      tok.setAttribute('class', 'mnt-token is-on is-' + (t.kind || 'req'));
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
  MN.DepoSahne = DepoSahne;

  // ================================================================== durum yardımcıları (sahneler kullanır)
  /** Bir anlık durum (run snapshot) → sahne durumu (taban) */
  MN.stateFrom = function (prog, s, x) {
    x = x || {};
    return Object.assign(
      {
        mode: prog.defter === 'hatira' ? 'hatira' : 'naive',
        v1: prog.depo === 'v1',
        defter: prog.defter,
        raflar: s.raflar,
        raflarId: s.raflarId,
        kamyon: s.kamyon,
        kamyonId: s.kamyonId,
        yedekler: s.yedekler,
        gecmis: prog.gecmis ? s.gecmis : null,
      },
      x
    );
  };
  /** Bir hatıranın masadaki görünümü */
  MN.masaOf = (s, tur, ad) => (s.hatira ? { id: s.hatira.id, raflar: s.hatira.raflar, kamyon: s.hatira.kamyon, tur, ad } : null);
  /** Geri yüklemeden sonra olması gereken yer (yanlış raftaki koliler için hayalet kutu) */
  MN.hayalet = function (s, dogru) {
    const ghost = {};
    const hl = {};
    if (!dogru) return { ghost, hl };
    const dolu = {};
    Object.keys(s.raflar).forEach((k) => (dolu[s.raflar[k]] = true));
    Object.keys(dogru.raflar).forEach((k) => {
      if (s.raflar[k] !== dogru.raflar[k]) {
        if (s.raflar[k]) hl[k] = 'bad';
        if (!dolu[dogru.raflar[k]]) ghost[k] = dogru.raflar[k];
      }
    });
    return { ghost, hl };
  };
  MN.BOS_AN = (prog) => MN.run(Object.assign({}, prog, prog.tur === 'gece' ? { plan: [] } : { ops: [] })).olaylar[0].s;
})();
