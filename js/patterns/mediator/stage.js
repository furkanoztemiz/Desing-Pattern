/*
 * Mediator — animasyon sahnesi.
 *   MD.FormSahne : şubedeki gönderi oluşturma formu.
 *     Solda formun kendisi (kullanıcının gördüğü): şehir, ağırlık, soğuk zincir, (sigorta), teslimat seçenekleri
 *       ve ücret. Kurala aykırı açık kalan ya da seçilen seçenek kırmızıyla işaretlenir.
 *     Sağda “kim kimi tanıyor?” grafiği: her öğe bir düğüm. Kalıpsızda bağlar öğeden öğeye (koddaki alanlardan
 *       çıkarılır) ve “dolap açık mı?” kuralının kopyaları düğümlerde rozet olarak durur; Mediator’da bütün bağlar
 *       ortadaki forma (yöneticiye) gider, kural yalnızca orada yazılıdır. Çağrılar bağlar boyunca giden jetonlardır.
 *
 * Durum tabanlı çizim: render(state, prevState, {animate}) — geri/ileri adımlarda tutarlı.
 */
(function () {
  'use strict';
  const MD = DP.med;
  const esc = DP.esc;
  const md = (t) => DP.md(t, MD.roleOf);

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
    form: '<rect x="4" y="2.5" width="16" height="19" rx="2"/><path d="M7.5 7.5 H16.5 M7.5 11.5 H16.5 M7.5 15.5 H12.5"/>',
    yonetici: '<circle cx="12" cy="12" r="3.2"/><path d="M12 3 V8.8 M12 15.2 V21 M3 12 H8.8 M15.2 12 H21"/>',
  };
  MD.icon = (k, x, y, s) => `<g class="mdi mdi-${k}" transform="translate(${x},${y})${s && s !== 1 ? ` scale(${s})` : ''}">${ICON[k]}</g>`;
  MD.ICON = ICON;

  // ================================================================== sahne
  const W = 960;
  const H = 600;
  const FX = 16; // form kartı
  const FY = 36;
  const FW = 388;
  const FH = 492;
  const GCX = 684; // grafik merkezi
  const GCY = 286;
  const NW = 150; // düğüm
  const NH = 64;

  /** Düğüm konumları: elips üstünde, tepeden başlayarak saat yönünde. g: {cx, cy, rx, ry} */
  function konumlar(ogeler, g) {
    const n = ogeler.length;
    const P = {};
    ogeler.forEach((o, k) => {
      const a = -Math.PI / 2 + (k * 2 * Math.PI) / n;
      P[o] = { x: g.cx + Math.cos(a) * g.rx, y: g.cy + Math.sin(a) * g.ry };
    });
    return P;
  }
  /** Tam sahne: form solda, grafik sağda · yalnızca grafik: geniş ve basık (Çözüm panelinin oranı) */
  const GRAF = { tam: { cx: GCX, cy: GCY, rx: 194, ry: 172 }, yalniz: { cx: 480, cy: 238, rx: 330, ry: 150 } };
  /** Merkezden merkeze giden doğrunun dikdörtgen kenarındaki noktası */
  function kenarNoktasi(c, hedef, w, h) {
    const dx = hedef.x - c.x;
    const dy = hedef.y - c.y;
    if (!dx && !dy) return { x: c.x, y: c.y };
    const t = Math.min(Math.abs((w / 2 + 4) / (dx || 1e-9)), Math.abs((h / 2 + 4) / (dy || 1e-9)));
    return { x: c.x + dx * t, y: c.y + dy * t };
  }

  class FormSahne {
    /** o: {cls, grafik: yalnızca bağ grafiği (form gizli, görünüm grafiğe yakınlaşır)} */
    constructor(root, o) {
      this.o = o || {};
      this.el = DP.h('div', { class: 'fm-stage med-sahne' + (this.o.cls ? ' ' + this.o.cls : '') });
      root.appendChild(this.el);
      this.g = this.o.grafik ? GRAF.yalniz : GRAF.tam;
      const vb = this.o.grafik ? '0 0 960 470' : `0 0 ${W} ${H}`;
      const bx = this.o.grafik ? 160 : 16;
      const by = this.o.grafik ? 414 : 540;
      const bw = this.o.grafik ? 640 : 928;
      this.el.innerHTML = `
<svg class="fm-svg med-svg" viewBox="${vb}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Gönderi oluşturma formu ve öğelerin birbirini tanıma grafiği">
  <defs>
    <marker id="med-ok" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" class="med-ok-uc"/></marker>
    <marker id="med-ok-on" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" class="med-ok-uc is-on"/></marker>
    <marker id="med-ok-bad" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" class="med-ok-uc is-bad"/></marker>
  </defs>
  <rect class="med-bg" x="-1500" y="-1500" width="4000" height="4000"/>
  <g data-k="head"></g>
  <g data-k="form"></g>
  <g data-k="kenarlar"></g>
  <g data-k="dugumler"></g>
  <g data-k="fx"></g>
  <foreignObject class="bubble-fo" data-k="b-banner" x="${bx}" y="${by}" width="${bw}" height="56"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble med-banner"></div></foreignObject>
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
     *   mode: 'v1'|'v2'|'kopyali'|'r1'|'r2'|'mediator', ogeler: [düğüm], yer: {düğüm: açıklama}, hub (yönetici düğümü var mı),
     *   s: anlık durum, baglar: [{from, to}], kural: [{sinif, eksik}], hl: {düğüm|'form': 'on'|'bad'},
     *   kenar: [{a, b, kind: 'on'|'bad'}], aktif: düğüm (formdaki satır), tokens: [{from, to, text, kind, delay}], banner
     * }
     */
    render(st, prev, o) {
      const anim = !!(o && o.animate);
      prev = prev || {};
      this._stop();
      this.A = {};
      this.P = konumlar(st.ogeler, this.g);
      this._head(st);
      if (!this.o.grafik) this._form(st, prev, anim);
      this._kenarlar(st);
      this._dugumler(st, prev, anim);
      banner(this.k['b-banner'], st.banner);
      this._tokens(st.tokens, anim);
    }

    _head(st) {
      const n = st.baglar.length;
      const k = st.kural.length;
      const sayi = st.hub ? `öğeler arası bağ: ${n} · kural ${k} yerde` : `${n} bağ · kural ${k} yerde`;
      this.k.head.innerHTML = `
        ${this.o.grafik ? '' : `<text class="med-cap" x="${FX}" y="26">Form · kullanıcının gördüğü</text>`}
        <text class="med-cap is-graf" x="${this.o.grafik ? 24 : 436}" y="26">Kim kimi tanıyor?</text>
        <text class="med-sayi${!st.hub && n ? ' is-bad' : ''}" x="${this.o.grafik ? 936 : 944}" y="26" text-anchor="end">${sayi}</text>`;
    }

    // ---------------------------------------------------------------- form (kullanıcının gördüğü)
    _form(st, prev, anim) {
      const s = st.s;
      const ps = prev.s || s;
      const x = FX;
      const y = FY;
      const w = FW;
      const satir = (oge) => (st.aktif === oge ? ' is-aktif' : '');
      let html = `<g class="med-form">
        <rect class="med-form-bg" x="${x}" y="${y}" width="${w}" height="${FH}" rx="12"/>
        <rect class="med-form-ust" x="${x}" y="${y}" width="${w}" height="54" rx="12"/>
        ${MD.icon('form', x + 16, y + 15, 1)}
        <text class="med-form-t" x="${x + 48}" y="${y + 25}">Yeni gönderi</text>
        <text class="med-form-s" x="${x + 48}" y="${y + 43}">şube ekranı · form : GonderiFormu</text>`;
      let ry = y + 92;
      const etiket = (ad, degisken, yy) => `<text class="med-etiket" x="${x + 18}" y="${yy - 2}">${esc(ad)}</text><text class="med-degisken" x="${x + 18}" y="${yy + 15}">${degisken}</text>`;
      const kx = x + 150;
      const kw = w - 168;
      // şehir
      const yeniSehir = anim && ps.sehir !== s.sehir;
      html += `<g class="med-satir${satir('sehir')}">${etiket('Şehir', 'sehir', ry)}<g class="med-kutu${yeniSehir ? ' is-new' : ''}"><rect x="${kx}" y="${ry - 20}" width="${kw}" height="34" rx="8"/><text class="med-deger${s.sehir ? '' : ' is-bos'}" x="${kx + 12}" y="${ry + 2}">${esc(s.sehir || 'seçiniz')}</text><text class="med-ok-asagi" x="${kx + kw - 14}" y="${ry + 2}" text-anchor="end">▾</text></g></g>`;
      this.A['f:sehir'] = { x: x + w, y: ry - 3 };
      ry += 54;
      // ağırlık
      const yeniKg = anim && ps.kg !== s.kg;
      html += `<g class="med-satir${satir('agirlik')}">${etiket('Ağırlık', 'agirlik', ry)}<g class="med-kutu${yeniKg ? ' is-new' : ''}"><rect x="${kx}" y="${ry - 20}" width="${kw}" height="34" rx="8"/><text class="med-deger${s.kg ? '' : ' is-bos'}" x="${kx + 12}" y="${ry + 2}">${s.kg ? s.kg + ' kg' : '0 kg'}</text></g></g>`;
      this.A['f:agirlik'] = { x: x + w, y: ry - 3 };
      ry += 54;
      // soğuk zincir, sigorta
      const kutu = (oge, ad, deger, yer) => {
        if (yer) return `<g class="med-satir is-yok">${etiket(ad, oge, ry)}<text class="med-yer" x="${kx}" y="${ry + 2}">${esc(yer)}</text></g>`;
        const yeni = anim && ps[oge] !== deger;
        return `<g class="med-satir${satir(oge)}">${etiket(ad, oge, ry)}<g class="med-onay${deger ? ' is-on' : ''}${yeni ? ' is-new' : ''}"><rect x="${kx}" y="${ry - 17}" width="26" height="26" rx="6"/>${deger ? `<path d="M${kx + 6} ${ry - 4} L${kx + 11} ${ry + 2} L${kx + 21} ${ry - 10}"/>` : ''}</g><text class="med-deger" x="${kx + 38}" y="${ry + 2}">${deger ? 'evet' : 'hayır'}</text></g>`;
      };
      if (st.ogeler.includes('soguk') || (st.yer && st.yer.soguk)) {
        html += kutu('soguk', 'Soğuk zincir', s.soguk, st.yer && st.yer.soguk);
        this.A['f:soguk'] = { x: x + w, y: ry - 3 };
        ry += 50;
      }
      if (st.ogeler.includes('sigorta') || (st.yer && st.yer.sigorta)) {
        html += kutu('sigorta', 'Sigorta', s.sigorta, st.yer && st.yer.sigorta);
        this.A['f:sigorta'] = { x: x + w, y: ry - 3 };
        ry += 50;
      }
      // teslimat seçenekleri
      html += `<g class="med-satir${satir('teslimat')}">${etiket('Teslimat', 'teslimat', ry)}`;
      const d = s.dogru || MD.dogruKural(s);
      MD.SECENEKLER.forEach((sec, k) => {
        const yy = ry + k * 34;
        const acik = sec === 'Hızlı' ? s.hizli : sec === 'Dolap' ? s.dolap : true;
        const olmali = sec === 'Hızlı' ? d.hizli : sec === 'Dolap' ? d.dolap : true;
        const secili = s.secili === sec;
        const aykiri = secili && !olmali;
        const yanlisAcik = acik && !olmali;
        const cls = (acik ? '' : ' is-kapali') + (secili ? ' is-secili' : '') + (aykiri ? ' is-aykiri' : yanlisAcik ? ' is-yanlis' : '');
        const yeni = anim && (ps.secili !== s.secili && secili);
        const not = aykiri ? 'kurala aykırı!' : yanlisAcik ? 'açık olmamalı!' : acik ? '' : 'kapalı';
        html += `<g class="med-secenek${cls}${yeni ? ' is-new' : ''}"><rect class="med-secenek-bg" x="${kx - 6}" y="${yy - 20}" width="${kw + 6}" height="30" rx="7"/><circle cx="${kx + 9}" cy="${yy - 5}" r="8"/>${secili ? `<circle class="med-radyo-ic" cx="${kx + 9}" cy="${yy - 5}" r="4"/>` : ''}<text class="med-secenek-t" x="${kx + 26}" y="${yy}">${esc(sec)}</text>${not ? `<text class="med-secenek-not" x="${kx + kw - 6}" y="${yy}" text-anchor="end">${not}</text>` : ''}</g>`;
      });
      html += '</g>';
      this.A['f:teslimat'] = { x: x + w, y: ry + 30 };
      ry += 3 * 34 + 18;
      // ücret
      const yeniTl = anim && ps.tl !== s.tl;
      html += `<g class="med-satir${satir('ucret')}">${etiket('Ücret', 'ucret', ry)}<text class="med-ucret${yeniTl ? ' is-new' : ''}" x="${x + w - 20}" y="${ry + 6}" text-anchor="end">${s.tl} TL</text></g>`;
      this.A['f:ucret'] = { x: x + w, y: ry - 3 };
      html += '</g>';
      this.k.form.innerHTML = html;
    }

    // ---------------------------------------------------------------- bağlar
    _kenarlar(st) {
      const P = this.P;
      const vurgu = {};
      (st.kenar || []).forEach((e) => {
        vurgu[e.a + '>' + e.b] = e.kind;
        vurgu[e.b + '>' + e.a] = vurgu[e.b + '>' + e.a] || e.kind;
      });
      let html = '';
      const cizgi = (a, b, wa, ha, wb, hb, ciftYon, cls, kind) => {
        const p1 = kenarNoktasi(a, b, wa, ha);
        const p2 = kenarNoktasi(b, a, wb, hb);
        const m = kind === 'bad' ? 'med-ok-bad' : kind === 'on' ? 'med-ok-on' : 'med-ok';
        return `<path class="med-kenar ${cls}${kind ? ' is-' + kind : ''}" d="M${p1.x.toFixed(1)} ${p1.y.toFixed(1)} L${p2.x.toFixed(1)} ${p2.y.toFixed(1)}" marker-end="url(#${m})"${ciftYon ? ` marker-start="url(#${m})"` : ''}/>`;
      };
      if (st.hub) {
        const hubC = { x: this.g.cx, y: this.g.cy };
        this.A.hub = hubC;
        st.ogeler.forEach((o) => {
          if (st.yer && st.yer[o]) return;
          const kind = vurgu['hub>' + o] || vurgu[o + '>hub'];
          html += cizgi(P[o], hubC, NW, NH, 184, 76, true, 'is-yildiz', kind);
        });
      }
      // öğeden öğeye bağlar (kalıpsız ya da henüz silinmemiş eski bağlar)
      const ciftler = {};
      st.baglar.forEach((b) => {
        const key = [b.from, b.to].sort().join('|');
        ciftler[key] = ciftler[key] || { a: b.from, b: b.to, ab: false, ba: false };
        const c = ciftler[key];
        if (c.a === b.from) c.ab = true;
        else c.ba = true;
      });
      Object.values(ciftler).forEach((c) => {
        if (!P[c.a] || !P[c.b]) return;
        const kind = vurgu[c.a + '>' + c.b] || vurgu[c.b + '>' + c.a];
        // ara adım 2: kurallar yöneticide, eski alanlar henüz silinmedi (kullanılmıyor)
        const eski = st.mode === 'r2' ? ' is-eski' : '';
        // yön: a → b (a, b’yi tanıyor); iki yönlüyse iki uç
        const [from, to] = c.ab ? [c.a, c.b] : [c.b, c.a];
        html += cizgi(P[from], P[to], NW, NH, NW, NH, c.ab && c.ba, 'is-ag' + eski, kind);
      });
      this.k.kenarlar.innerHTML = html;
    }

    // ---------------------------------------------------------------- düğümler (öğeler) ve yönetici
    _dugumler(st, prev, anim) {
      const s = st.s;
      const P = this.P;
      const kuralOf = {};
      st.kural.forEach((k) => (kuralOf[MD.ogeOf(k.sinif) || (k.sinif === 'GonderiFormu' ? 'hub' : '')] = k));
      const deger = {
        sehir: s.sehir || '—',
        agirlik: s.kg + ' kg',
        soguk: s.soguk ? 'evet' : 'hayır',
        sigorta: s.sigorta ? 'evet' : 'hayır',
        teslimat: s.secili,
        ucret: s.tl + ' TL',
      };
      let html = '';
      if (st.hub) {
        const hl = st.hl && st.hl.hub;
        const k = kuralOf.hub;
        const GX = this.g.cx;
        const GY = this.g.cy;
        html += `<g class="med-hub rc rc-3${hl ? ' is-' + hl : ''}">
          <rect class="med-hub-bg" x="${GX - 92}" y="${GY - 38}" width="184" height="76" rx="14"/>
          ${MD.icon('yonetici', GX - 80, GY - 27, 0.9)}
          <text class="med-hub-t" x="${GX - 52}" y="${GY - 12}">form</text>
          <text class="med-hub-s" x="${GX - 52}" y="${GY + 6}">: GonderiFormu</text>
          ${k ? `<g class="med-kural is-tek"><rect x="${GX - 52}" y="${GY + 14}" width="104" height="19" rx="9.5"/><text x="${GX}" y="${GY + 27.5}" text-anchor="middle">kurallar burada</text></g>` : `<text class="med-hub-s is-bos" x="${GX - 52}" y="${GY + 27}">kurallar henüz öğelerde</text>`}
        </g>`;
      }
      st.ogeler.forEach((o) => {
        const p = P[o];
        const x = p.x - NW / 2;
        const y = p.y - NH / 2;
        this.A['n:' + o] = { x: p.x, y: p.y };
        if (st.yer && st.yer[o])
          return (html += `<g class="med-dugum is-yok"><rect class="med-dugum-bg" x="${x}" y="${y}" width="${NW}" height="${NH}" rx="11"/><text class="med-dugum-t" x="${p.x}" y="${p.y - 6}" text-anchor="middle">${o}</text><text class="med-dugum-s" x="${p.x}" y="${p.y + 13}" text-anchor="middle">${esc(st.yer[o])}</text></g>`);
        const hl = st.hl && st.hl[o];
        const k = kuralOf[o];
        const pv = prev.s ? { sehir: prev.s.sehir || '—', agirlik: prev.s.kg + ' kg', soguk: prev.s.soguk ? 'evet' : 'hayır', sigorta: prev.s.sigorta ? 'evet' : 'hayır', teslimat: prev.s.secili, ucret: prev.s.tl + ' TL' }[o] : deger[o];
        const yeni = anim && pv !== deger[o];
        const bozuk = o === 'teslimat' && (s.yanlisAcik || s.yanlisSecim);
        html += `<g class="med-dugum rc rc-4${hl ? ' is-' + hl : ''}${bozuk ? ' is-bozuk' : ''}">
          <rect class="med-dugum-bg" x="${x}" y="${y}" width="${NW}" height="${NH}" rx="11"/>
          <text class="med-dugum-t" x="${x + 12}" y="${y + 20}">${o}</text>
          <text class="med-dugum-s" x="${x + 12}" y="${y + 37}">${MD.OGE[o].sinif}</text>
          <text class="med-dugum-v${yeni ? ' is-new' : ''}" x="${x + 12}" y="${y + 55}">${esc(deger[o])}</text>
          ${k ? `<g class="med-kural${k.eksik ? ' is-eksik' : ''}"><rect x="${x + NW - 64}" y="${y - 10}" width="${k.eksik ? 76 : 50}" height="19" rx="9.5"/><text x="${x + NW - 64 + (k.eksik ? 38 : 25)}" y="${y + 3.5}" text-anchor="middle">${k.eksik ? 'kural eksik' : 'kural'}</text></g>` : ''}
        </g>`;
      });
      this.k.dugumler.innerHTML = html;
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
        const w = Math.max(60, t.text.length * 7.6 + 22);
        const g = DP.s('g', { class: 'med-token is-' + (t.kind || 'cagri') });
        g.innerHTML = `<g class="med-token-in"><rect x="${-w / 2}" y="-13" width="${w}" height="26" rx="13"/><text x="0" y="5" text-anchor="middle">${esc(t.text)}</text></g>`;
        fx.appendChild(g);
        setTransform(g, `translate(${a.x}px, ${a.y}px)`, false);
        this._at(t.delay || 0, () => {
          g.classList.add('is-on');
          void g.getBoundingClientRect();
          setTransform(g, `translate(${b.x}px, ${b.y}px)`, true);
        });
        this._at((t.delay || 0) + 1000, () => g.classList.remove('is-on'));
      });
    }

    destroy() {
      this._stop();
      this.el.remove();
    }
  }
  MD.FormSahne = FormSahne;

  // ================================================================== durum yardımcıları (sahneler kullanır)
  /** Program + anlık durum → sahne durumu (taban). Bağlar ve kural yerleri programın Java kodundan çıkarılır. */
  MD.stateFrom = function (prog, s, x) {
    const F = MD.filesFor(prog);
    const ogeler = MD.OGE_SIRA.filter((o) => F[MD.OGE[o].sinif]);
    const yer = {};
    if (!F.SogukZincirKutusu) {
      ogeler.splice(2, 0, 'soguk');
      yer.soguk = 'sürüm 2.0’da gelecek';
    }
    return Object.assign(
      {
        mode: prog.tasarim,
        hub: !!F.FormYoneticisi,
        ogeler,
        yer,
        s,
        baglar: MD.baglar(F),
        kural: MD.kuralYerleri(F),
      },
      x || {}
    );
  };
  /** Kurulum anı (henüz hiçbir işlem yapılmadı) */
  MD.BOS_AN = (prog) => MD.run(Object.assign({}, prog, { ops: [] })).olaylar[0].s;
  /**
   * Bir işlemin sahnedeki jetonları ve vurguları: kalıpsızda öğeden öğeye çağrılar, kalıplıda öğe → form → öğeler.
   * Dönüş: {tokens, kenar, hl}
   */
  MD.cagriFx = function (O, k, o) {
    o = o || {};
    const ara = o.ara || 260;
    const tokens = [];
    const kenar = [];
    const hl = {};
    let n = 0;
    O.filter((x) => x.i === k).forEach((x) => {
      if (x.e === 'cagri') {
        const from = x.from === 'form' ? 'hub' : 'n:' + x.from;
        const to = 'n:' + x.to;
        const yanlis = x.yanlis;
        tokens.push({ from, to, text: x.metin, kind: yanlis ? 'bad' : x.from === 'form' ? 'yon' : 'cagri', delay: n++ * ara });
        kenar.push({ a: x.from === 'form' ? 'hub' : x.from, b: x.to, kind: yanlis ? 'bad' : 'on' });
        hl[x.to] = yanlis ? 'bad' : 'on';
      } else if (x.e === 'bildir' && !x.bos) {
        tokens.push({ from: 'n:' + x.from, to: 'hub', text: 'degisti(this)', kind: 'bildir', delay: n++ * ara });
        kenar.push({ a: x.from, b: 'hub', kind: 'on' });
        hl.hub = 'on';
      } else if (x.e === 'eylem' || x.e === 'red') hl[x.oge] = x.e === 'red' ? 'bad' : 'on';
    });
    return { tokens, kenar, hl };
  };
})();
