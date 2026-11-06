/*
 * Chain of Responsibility — animasyon sahnesi.
 *   CR.Hat : teslimat hattı.
 *     Zincir kipi   : solda kurye (yalnızca zincirin başını tanır), yanında kapıdaki gönderi; ortada halkalar
 *                     (her biri kendi kuralını parça parça gösterir), aralarında "sonraki" okları ve zincirin ucu (null).
 *                     Altta günün gönderileri: her birinin zincirde izlediği yol.
 *     Kalıpsız kip  : kuryenin içindeki if/else merdiveni (bir ya da iki kurye) ve dalların gizli varsayımları.
 *   İstek jetonu (gönderi) kuryeden ilk halkaya, oradan sonrakilere ilerler.
 *
 * Durum tabanlı çizim: render(state, prevState, {animate}) — geri/ileri adımlarda tutarlı.
 */
(function () {
  'use strict';
  const CR = DP.cr;
  const esc = DP.esc;
  const md = (t) => DP.md(t, CR.roleOf);

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
    kurye: '<path d="M2 16.5 V6 H14 V16.5 Z M14 9.5 H18.5 L21.5 13 V16.5 H14"/><circle cx="6.5" cy="17.5" r="2"/><circle cx="17.5" cy="17.5" r="2"/>',
    paket: '<path d="M3 7.5 L12 3 L21 7.5 V16.5 L12 21 L3 16.5 Z M3 7.5 L12 12 L21 7.5 M12 12 V21 M7.5 5.2 L16.5 9.8"/>',
    alici: '<path d="M3 11 L12 3.5 L21 11 M5.5 9.5 V20.5 H18.5 V9.5 M10 20.5 V14.5 H14 V20.5"/>',
    komsu: '<circle cx="8" cy="8" r="3"/><circle cx="16.5" cy="9" r="2.6"/><path d="M2.5 20 Q2.5 13.5 8 13.5 Q13.5 13.5 13.5 20 M13.2 14.4 Q14.5 13.6 16.5 13.6 Q21.5 13.6 21.5 20"/>',
    dolap: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9 H21 M3 15 H21 M12 3 V21 M8.5 6 H9.5 M14.5 6 H15.5 M8.5 12 H9.5 M14.5 12 H15.5 M8.5 18 H9.5 M14.5 18 H15.5"/>',
    market: '<path d="M3 9 L4.5 4 H19.5 L21 9 Z M4.5 9 V20.5 H19.5 V9 M9.5 20.5 V14.5 H14.5 V20.5"/><path d="M3 9 Q5.25 11.5 7.5 9 Q9.75 11.5 12 9 Q14.25 11.5 16.5 9 Q18.75 11.5 21 9"/>',
    sube: '<path d="M2.5 9.5 L12 4 L21.5 9.5 V20.5 H2.5 Z"/><path d="M7 20.5 V13 H17 V20.5 M7 16.5 H17"/>',
    iade: '<path d="M9 5 L4 10 L9 15"/><path d="M4 10 H15 Q20 10 20 15 Q20 20 15 20 H10"/>',
    soguk: '<path d="M12 2.5 V21.5 M3.8 7.25 L20.2 16.75 M3.8 16.75 L20.2 7.25 M9.5 3.8 L12 6 L14.5 3.8 M9.5 20.2 L12 18 L14.5 20.2"/>',
    kapi: '<rect x="5" y="2.5" width="14" height="19" rx="1"/><circle cx="15.5" cy="12" r="1"/>',
    kayip: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5 Q9.5 7 12 7 Q14.5 7 14.5 9.5 Q14.5 11.5 12 12.2 V14 M12 17 V17.3"/>',
  };
  CR.icon = (k, x, y, s) => `<g class="cri cri-${k}" transform="translate(${x},${y})${s && s !== 1 ? ` scale(${s})` : ''}">${ICON[k]}</g>`;
  CR.ICON = ICON;
  /** Kapı durumu → küçük simge */
  const KAPI_IC = { ALICI_EVDE: 'alici', KOMSU_EVDE: 'komsu', KIMSE_YOK: 'kapi' };
  CR.kapiIcon = (g) => KAPI_IC[g.kapi];

  // ================================================================== teslimat hattı
  const W = 960;
  const H = 560;
  const L = 16; // sol kenar
  const R = 944; // sağ kenar
  const TOP = 36; // kurye + gönderi kartı
  const TH = 112;
  const KW = 236; // kurye kartı genişliği
  const CY = 186; // halkaların üst kenarı
  const CH = 162;
  const GAP = 36; // halkalar arası (sonraki oku)
  const ENDW = 58; // zincirin ucu (null)
  const BY = 382; // gönderi panosu
  const BH = 34;
  const BG = 7;

  /** Halkaların yatay yerleşimi */
  function chainLayout(n) {
    const avail = R - L - ENDW;
    const w = Math.min(170, (avail - (n - 1) * GAP) / n);
    const total = n * w + (n - 1) * GAP + ENDW;
    const x0 = L + Math.max(0, (R - L - total) / 2);
    return { w, x: (i) => x0 + i * (w + GAP), endX: x0 + n * w + (n - 1) * GAP };
  }
  CR.chainLayout = chainLayout;

  class Hat {
    /** o: {cls} */
    constructor(root, o) {
      this.o = o || {};
      this.el = DP.h('div', { class: 'fm-stage cr-hat' + (this.o.cls ? ' ' + this.o.cls : '') });
      root.appendChild(this.el);
      this.el.innerHTML = `
<svg class="fm-svg cr-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Teslimat hattı: kurye, teslim zinciri ve günün gönderileri">
  <rect class="cr-bg" x="-1500" y="-1500" width="4000" height="4000"/>
  <g data-k="head"></g>
  <g data-k="wires"></g>
  <g data-k="main"></g>
  <g data-k="board"></g>
  <g data-k="fx"><g class="cr-token" data-k="tok"><g class="cr-token-in"><rect data-k="tok-bg" x="-60" y="-13" width="120" height="26" rx="13"/><text data-k="tok-t" x="0" y="5" text-anchor="middle"></text></g></g></g>
  <foreignObject class="bubble-fo" data-k="b-banner" x="16" y="504" width="928" height="54"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble cr-banner"></div></foreignObject>
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
     * Zincir kipi: {
     *   mode: 'chain', bolge, keys: [halka],
     *   links: {k: {state: 'active'|'pass'|'ok', checks: [{t, ok}], count, note}}, fresh: halka (YENİ rozeti),
     *   end: 'kayip' (zincirin ucu kırmızı),
     *   parcel: {g, durum: {kind: 'wait'|'at'|'ok'|'kayip', text}} | null,
     *   board: [{g, adim: [{k, ok}], yer, kayip, hl}] | null, boardTitle,
     *   token: {from, to, text, kind}, banner
     * }
     * Kalıpsız kip: {mode: 'naive', ladders: [{cls, bolge, rows: CR.merdivenBilgi(v), assume, hlRow}],
     *   board: [{g, yerler: [{bolge, yer, bad}], hl}], banner}
     */
    render(st, prev, o) {
      const anim = !!(o && o.animate);
      prev = prev || {};
      this._stop();
      this.A = {};
      if (st.mode === 'naive') {
        this._ladders(st, prev, anim);
        this.k.wires.innerHTML = '';
      } else {
        this._chain(st, prev, anim);
      }
      this._board(st, prev, anim);
      banner(this.k['b-banner'], st.banner);
      this._token(st.token, anim);
    }

    // ---------------------------------------------------------------- zincir kipi
    _chain(st, prev, anim) {
      const keys = st.keys || [];
      const lay = chainLayout(keys.length);
      const links = st.links || {};
      const prevKeys = prev.mode === 'chain' ? prev.keys || [] : null;
      const head = keys[0] ? CR.HALKA[keys[0]] : null;

      // başlıklar (zincir başlığı gönderi sütununda: kuryeden inen "zincir" okuyla çakışmasın)
      const capX = L + KW + 16;
      const capT = 'Zincir' + (st.bolge ? ' · ' + st.bolge : '');
      this.k.head.innerHTML = `
        <text class="cr-cap" x="${L}" y="24">Kurye</text>
        <text class="cr-cap" x="${capX}" y="24">Kapıdaki gönderi</text>
        <text class="cr-cap is-chain" x="${capX}" y="${CY - 12}">${esc(capT)}</text>
        <text class="cr-cap-sub" x="${capX + capT.length * 10.4 + 18}" y="${CY - 12}"><tspan class="cr-arrow-key">→</tspan> = sonraki</text>`;

      // kurye kartı: yalnızca zincirin başını tanır
      const kx = L;
      this.A.kurye = { x: kx + KW / 2, y: TOP + TH };
      let html = `<g class="cr-kurye rc rc-1">
        <rect class="cr-card-bg" x="${kx}" y="${TOP}" width="${KW}" height="${TH}" rx="12"/>
        <circle class="cr-ic-bg" cx="${kx + 28}" cy="${TOP + 30}" r="17"/>${CR.icon('kurye', kx + 16, TOP + 18, 1)}
        <text class="cr-card-t" x="${kx + 54}" y="${TOP + 28}">Kurye${st.bolge ? ' · ' + esc(st.bolge) : ''}</text>
        <text class="cr-card-s" x="${kx + 54}" y="${TOP + 45}">teslimEt(g)</text>
        <text class="cr-kurye-k" x="${kx + 14}" y="${TOP + 76}">tanıdığı tek halka:</text>
        <text class="cr-kurye-v" x="${kx + 14}" y="${TOP + 97}">zincir = ${head ? esc(head.cls) : 'null'}</text>
      </g>`;

      // kapıdaki gönderi
      html += this._parcel(st.parcel, prev.parcel);

      // halkalar
      keys.forEach((k, i) => {
        const Hk = CR.HALKA[k];
        const s = links[k] || {};
        const x = lay.x(i);
        const w = lay.w;
        this.A['link:' + k] = { x: x + w / 2, y: CY + 82 };
        this.A['linkTop:' + k] = { x: x + w / 2, y: CY };
        const fresh = anim && prevKeys && !prevKeys.includes(k);
        const checks = s.checks || CR.kosulMetin(k).map((t) => ({ t, ok: null }));
        const rows = checks
          .map((c, j) => {
            const y = CY + 72 + j * 20;
            const mk = c.ok === true ? '✓' : c.ok === false ? '✗' : '•';
            const cls = c.ok === true ? ' is-ok' : c.ok === false ? ' is-bad' : '';
            return `<g class="cr-cond${cls}"><text class="cr-cond-m" x="${x + 12}" y="${y}">${mk}</text><text class="cr-cond-t" x="${x + 26}" y="${y}"${fit(c.t, w - 34, 6.6)}>${esc(c.t)}</text></g>`;
          })
          .join('');
        const PILL = { active: '▶ bakıyor…', ok: '✓ teslim aldı', pass: '✗ ' + (s.note || 'geçti') };
        const pt = PILL[s.state];
        const pill = pt
          ? `<g class="cr-pill is-${s.state}"><rect x="${x + 6}" y="${CY + CH - 30}" width="${w - 12}" height="22" rx="11"/><text x="${x + w / 2}" y="${CY + CH - 14.5}" text-anchor="middle"${fit(pt, w - 24, 6.4)}>${esc(pt)}</text></g>`
          : '';
        const count = s.count != null ? `<g class="cr-count${s.count ? '' : ' is-zero'}"><circle cx="${x + w - 4}" cy="${CY + 4}" r="13"/><text x="${x + w - 4}" y="${CY + 8.5}" text-anchor="middle">${s.count}</text></g>` : '';
        const yeni = st.fresh === k ? `<g class="cr-yeni"><rect x="${x + w - 54}" y="${CY - 9}" width="44" height="17" rx="8.5"/><text x="${x + w - 32}" y="${CY + 3}" text-anchor="middle">YENİ</text></g>` : '';
        html += `<g class="cr-link rc rc-4${s.state ? ' is-' + s.state : ''}${fresh ? ' is-new' : ''}${st.fresh === k ? ' is-fresh' : ''}">
          <rect class="cr-link-bg" x="${x}" y="${CY}" width="${w}" height="${CH}" rx="12"/>
          <circle class="cr-ic-bg" cx="${x + 22}" cy="${CY + 24}" r="15"/>${CR.icon(k, x + 11, CY + 13, 0.92)}
          <text class="cr-link-t" x="${x + 43}" y="${CY + 23}"${fit(Hk.ad, w - 50, 9.2)}>${esc(Hk.ad)}</text>
          <text class="cr-link-c" x="${x + 43}" y="${CY + 39}"${fit(Hk.cls, w - 50, 6.4)}>${esc(Hk.cls)}</text>
          <line class="cr-link-sep" x1="${x + 8}" x2="${x + w - 8}" y1="${CY + 52}" y2="${CY + 52}"/>
          ${rows}${pill}${count}${yeni}
        </g>`;
      });
      this.A.end = { x: lay.endX + ENDW / 2 + 4, y: CY + 82 };
      const kayip = st.end === 'kayip';
      html += `<g class="cr-end${kayip ? ' is-kayip' : ''}"><circle cx="${lay.endX + ENDW / 2 + 4}" cy="${CY + 82}" r="17"/><text class="cr-end-t" x="${lay.endX + ENDW / 2 + 4}" y="${CY + 87}" text-anchor="middle">${kayip ? '!' : '∅'}</text><text class="cr-end-s" x="${lay.endX + ENDW / 2 + 4}" y="${CY + 118}" text-anchor="middle">${kayip ? 'KAYIP' : 'null'}</text></g>`;
      this.k.main.innerHTML = html;

      // oklar: kurye → baş, halka → sonraki, son halka → null
      let wires = '';
      if (head) {
        // kurye kartının altından ilk halkanın tepesine: hizalıysa düz, değilse dirsekli
        const b = this.A['linkTop:' + keys[0]];
        const ax = Math.min(Math.max(b.x, L + 24), L + KW - 24);
        const ay = TOP + TH;
        const live = st.token && st.token.from === 'kurye' ? ' is-live' : '';
        const d = Math.abs(ax - b.x) < 1 ? `M${ax} ${ay} V${b.y - 2}` : `M${ax} ${ay} V${ay + 10} H${b.x} V${b.y - 2}`;
        wires += `<path class="cr-wire is-zincir${live}" d="${d}"/><polyline class="cr-wire-head is-zincir${live}" points="${b.x - 6},${b.y - 10} ${b.x},${b.y - 2} ${b.x + 6},${b.y - 10}"/>
          <text class="cr-wire-l" x="${b.x + 9}" y="${b.y - 12}">zincir</text>`;
        this.A.kurye = { x: ax, y: ay };
      }
      keys.forEach((k, i) => {
        const x1 = lay.x(i) + lay.w;
        const x2 = i < keys.length - 1 ? lay.x(i + 1) : lay.endX + 12 - 4;
        const y = CY + 82;
        const last = i === keys.length - 1;
        const live = st.token && st.token.from === 'link:' + k ? ' is-live' : '';
        wires += `<path class="cr-wire${last ? ' is-null' : ''}${live}" d="M${x1 + 3} ${y} H${x2 - 3}"/><polyline class="cr-wire-head${last ? ' is-null' : ''}${live}" points="${x2 - 10},${y - 6} ${x2 - 3},${y} ${x2 - 10},${y + 6}"/>`;
      });
      this.k.wires.innerHTML = wires;
    }

    /** Kapıdaki gönderi kartı */
    _parcel(p, pp) {
      const x = L + KW + 16;
      const w = R - x;
      if (!p) {
        return `<g class="cr-parcel is-empty"><rect class="cr-card-bg" x="${x}" y="${TOP}" width="${w}" height="${TH}" rx="12"/>
          <text class="cr-parcel-e" x="${x + w / 2}" y="${TOP + TH / 2 + 5}" text-anchor="middle">Günün 6 gönderisi zincirden tek tek geçecek</text></g>`;
      }
      const g = p.g;
      const changed = !pp || !pp.g || pp.g.no !== g.no;
      this.A.parcel = { x: x + 40, y: TOP + TH / 2 };
      const chips = [];
      let cx = x + 76;
      const chip = (icon, text, cls) => {
        const cw = text.length * 7.4 + (icon ? 30 : 16);
        chips.push(`<g class="cr-chip${cls ? ' ' + cls : ''}"><rect x="${cx}" y="${TOP + 50}" width="${cw}" height="24" rx="7"/>${icon ? CR.icon(icon, cx + 6, TOP + 54, 0.67) : ''}<text x="${cx + (icon ? 24 : 8)}" y="${TOP + 66.5}">${esc(text)}</text></g>`);
        cx += cw + 8;
      };
      chip(null, g.kg + ' kg');
      if (g.soguk) chip('soguk', 'soğuk zincir', 'is-soguk');
      chip(KAPI_IC[g.kapi], CR.KAPI[g.kapi].t, 'is-kapi');
      const d = p.durum || { kind: 'wait', text: 'kuryede' };
      return `<g class="cr-parcel${changed ? ' is-changed' : ''} is-${d.kind}">
        <rect class="cr-card-bg" x="${x}" y="${TOP}" width="${w}" height="${TH}" rx="12"/>
        <circle class="cr-ic-bg" cx="${x + 38}" cy="${TOP + 40}" r="22"/>${CR.icon('paket', x + 23, TOP + 25, 1.25)}
        <text class="cr-parcel-t" x="${x + 76}" y="${TOP + 34}">${esc(g.no)} · ${esc(g.alici)}</text>
        ${chips.join('')}
        <text class="cr-parcel-d is-${d.kind}" x="${x + 76}" y="${TOP + 98}">${esc(d.text)}</text>
      </g>`;
    }

    // ---------------------------------------------------------------- kalıpsız kip: if/else merdivenleri
    _ladders(st, prev, anim) {
      const LD = st.ladders || [];
      const two = LD.length > 1;
      const lw = two ? (R - L - 14) / 2 : R - L;
      // sınıf adı ve if/else İngilizce büyük harfle (Türkçe kuralı "İF" yapmasın)
      this.k.head.innerHTML = LD.map((ld, i) => `<text class="cr-cap" x="${L + i * (lw + 14)}" y="24"><tspan lang="en" xml:lang="en">${esc(ld.cls)} · if/else</tspan> merdiveni</text>`).join('');
      const prevN = prev.mode === 'naive' ? (prev.ladders || []).length : 0;
      this.k.main.innerHTML = LD.map((ld, li) => {
        const x = L + li * (lw + 14);
        const y0 = TOP;
        const hgt = 306;
        const fresh = anim && li >= prevN;
        const n = ld.rows.length;
        const rh = Math.min(40, (hgt - 66) / Math.max(1, n));
        const rows = ld.rows
          .map((r, j) => {
            const y = y0 + 58 + j * rh;
            const kw = j === 0 ? 'if' : r.c ? 'else if' : 'else';
            const hl = ld.hlRow === j;
            const marker = ld.assume && r.varsayim ? this._marker(r.varsayim, two) : '';
            const condX = x + 16 + kw.length * 7.8 + 8;
            const yerX = x + (two ? 262 : 330);
            const yerW = r.yer.length * 8 + 22;
            const gelen = r.gelen.length ? `<text class="cr-lr-n" x="${yerX + yerW + 10}" y="${y + rh / 2 + 4}">×${r.gelen.length}</text>` : '';
            return `<g class="cr-lr${hl ? ' is-hl' : ''}${r.bad ? ' is-bad' : ''}${ld.assume && r.varsayim ? ' is-' + r.varsayim : ''}">
              <rect class="cr-lr-bg" x="${x + 8}" y="${y}" width="${lw - 16}" height="${rh - 4}" rx="7"/>
              <text class="cr-lr-kw" x="${x + 16}" y="${y + rh / 2 + 3}">${kw}</text>
              <text class="cr-lr-c" x="${condX}" y="${y + rh / 2 + 3}">${r.c ? '(' + esc(r.tr) + ')' : ''}</text>
              <text class="cr-lr-ar" x="${yerX - 18}" y="${y + rh / 2 + 4}">→</text>
              <g class="cr-lr-yer"><rect x="${yerX}" y="${y + rh / 2 - 11}" width="${yerW}" height="22" rx="7"/><text x="${yerX + yerW / 2}" y="${y + rh / 2 + 4}" text-anchor="middle">${esc(r.yer)}</text></g>
              ${gelen}${marker ? marker.replace(/__X__/g, String(x + lw - 16)).replace(/__Y__/g, String(y + rh / 2 + 4)) : ''}
            </g>`;
          })
          .join('');
        return `<g class="cr-ladder rc rc-1${fresh ? ' is-new' : ''}${ld.bad ? ' is-bad' : ''}">
          <rect class="cr-card-bg" x="${x}" y="${y0}" width="${lw}" height="${hgt}" rx="12"/>
          <circle class="cr-ic-bg" cx="${x + 26}" cy="${y0 + 26}" r="16"/>${CR.icon('kurye', x + 14, y0 + 14, 1)}
          <text class="cr-card-t" x="${x + 50}" y="${y0 + 24}">${esc(ld.cls)} · ${esc(ld.bolge)}</text>
          <text class="cr-card-s" x="${x + 50}" y="${y0 + 41}">teslimEt(g): ${n} dal, sıra sabit</text>
          ${rows}
        </g>`;
      }).join('');
    }

    _marker(v, two) {
      const T = two
        ? { gizli: '⚠ varsayım', bozuk: '✗ bozuldu', yok: '✗ kural yok' }
        : { gizli: '⚠ “soğuk değil” varsayılıyor', bozuk: '✗ varsayım bozuldu', yok: '✗ soğuk zincir kuralı yok' };
      return `<text class="cr-lr-m is-${v}" x="__X__" y="__Y__" text-anchor="end">${esc(T[v])}</text>`;
    }

    // ---------------------------------------------------------------- gönderi panosu
    _board(st, prev, anim) {
      const B = st.board;
      if (!B || !B.length) {
        this.k.board.innerHTML = '';
        return;
      }
      const one = B.length === 1;
      const cw = one ? 640 : (R - L - 14) / 2;
      const prevB = prev.board || [];
      let html = `<text class="cr-cap" x="${L}" y="${BY - 10}">${esc(st.boardTitle || (one ? 'Bu gönderinin yolu' : 'Günün gönderileri · kim teslim aldı?'))}</text>`;
      B.forEach((b, i) => {
        const x = one ? L + (R - L - cw) / 2 : L + (i % 2) * (cw + 14);
        const y = one ? BY + BH + BG : BY + Math.floor(i / 2) * (BH + BG);
        const g = b.g;
        const pb = prevB[i];
        const changed = anim && pb && JSON.stringify(pb.adim || pb.yerler) !== JSON.stringify(b.adim || b.yerler);
        let chips = '';
        let cx = x + 176;
        const chip = (text, cls) => {
          const w = text.length * 6 + 10;
          chips += `<g class="cr-bchip ${cls}"><rect x="${cx}" y="${y + 7}" width="${w}" height="20" rx="6"/><text x="${cx + w / 2}" y="${y + 21}" text-anchor="middle">${esc(text)}</text></g>`;
          cx += w + 4;
        };
        if (b.adim) {
          b.adim.forEach((a) => chip(CR.HALKA[a.k].ad + (a.ok ? ' ✓' : ''), a.ok ? (CR.HASSAS.includes(a.k) && g.soguk ? 'is-bad' : 'is-ok') : 'is-pass'));
          if (b.kayip) chip('KAYIP', 'is-kayip');
        } else if (b.yerler) {
          b.yerler.forEach((yy) => chip((b.yerler.length > 1 ? yy.bolge + ': ' : '→ ') + yy.yer + (yy.bad ? ' ✗' : ''), yy.bad ? 'is-bad' : 'is-ok'));
        }
        const bad = (b.adim && b.adim.some((a) => a.ok && CR.HASSAS.includes(a.k) && g.soguk)) || (b.yerler && b.yerler.some((yy) => yy.bad));
        html += `<g class="cr-bcard${b.hl ? ' is-hl' : ''}${bad ? ' is-bad' : ''}${b.kayip ? ' is-kayip' : ''}${changed ? ' is-changed' : ''}">
          <rect class="cr-bcard-bg" x="${x}" y="${y}" width="${cw}" height="${BH}" rx="8"/>
          <text class="cr-b-no" x="${x + 10}" y="${y + 22}">${esc(g.no.slice(4))}</text>
          <text class="cr-b-ad" x="${x + 48}" y="${y + 22}">${esc(g.alici.split(' ')[0])}</text>
          <text class="cr-b-kg" x="${x + 102}" y="${y + 22}">${g.kg} kg</text>
          ${g.soguk ? CR.icon('soguk', x + 138, y + 9, 0.66) : ''}
          ${CR.icon(KAPI_IC[g.kapi], x + 154, y + 9, 0.66)}
          ${chips}
        </g>`;
      });
      this.k.board.innerHTML = html;
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
      tok.setAttribute('class', 'cr-token is-on is-' + (t.kind || 'req'));
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
  CR.Hat = Hat;

  // ================================================================== durum yardımcıları (sahneler kullanır)
  /** Zincir boyunca bir gönderinin izi → halka durumları (adım adım: upto = kaçıncı halkaya kadar) */
  CR.linkStates = function (keys, g, upto, o) {
    o = o || {};
    const r = CR.zincirCalistir(keys, g);
    const links = {};
    r.adim.forEach((a, i) => {
      if (i > upto) return;
      const checks = CR.kosullar(a.k, g).map((c) => ({ t: c.t, ok: c.ok }));
      if (i === upto && o.active) links[a.k] = { state: 'active', checks };
      else links[a.k] = { state: a.ok ? 'ok' : 'pass', checks, note: a.ok ? null : CR.neden(a.k, g) };
    });
    return { links, run: r };
  };

  /** Bir zincir programının sonu → pano satırları */
  CR.boardOf = function (lines, hl) {
    return lines.map((l, i) => ({ g: l.g, adim: l.adim, yer: l.yer, kayip: l.kayip, hl: hl === i }));
  };

  /** Teslim sayıları → halka rozetleri */
  CR.countLinks = function (keys, lines) {
    const links = {};
    keys.forEach((k) => (links[k] = { count: lines.filter((l) => l.yer === k).length }));
    return links;
  };
})();
