/*
 * Proxy — animasyon sahnesi.
 *   PX.Hat : istemci → (vekil) → GlobalShip. Her şerit bir istemci oturumu.
 *            Sorun  : vekil yok; bağlantı, önbellek ve KVKK kodu istemcinin İÇİNDE (rozetler), mobilde KVKK eksik.
 *            Akış   : istek vekilin kapılarından geçer — koruma, önbellek, gerçek nesne (sanal: ilk ihtiyaçta yaratılır).
 *            Tezgâh : kapılar açılıp kapanır; trafik oynatılır, sayaçlar değişir.
 *
 * Durum tabanlı çizim: render(state, prevState, {animate}) — geri/ileri adımlarda tutarlı.
 */
(function () {
  'use strict';
  const PX = DP.px;
  const esc = DP.esc;
  const md = (t) => DP.md(t, PX.roleOf);

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
    panel: '<rect x="3" y="4" width="18" height="12" rx="1.6"/><path d="M1 19.5 H23 L21 16 H3 Z"/>',
    mobil: '<rect x="6" y="1.5" width="12" height="21" rx="2.6"/><path d="M10 19 H14"/>',
    sms: '<path d="M3 4 H21 Q22 4 22 5 V15 Q22 16 21 16 H9 L4 20.5 V16 H3 Q2 16 2 15 V5 Q2 4 3 4 Z"/><path d="M6 8.5 H18 M6 12 H14"/>',
    koruma: '<path d="M12 2 L20 5 V11 Q20 17.5 12 22 Q4 17.5 4 11 V5 Z"/>',
    onbellek: '<rect x="5" y="2.5" width="14" height="19" rx="1.8"/><path d="M8.5 7 H15.5 M8.5 10.5 H15.5 M8.5 14 H13"/>',
    gercek: '<path d="M9 2 V7 M15 2 V7"/><rect x="6" y="7" width="12" height="7" rx="2"/><path d="M12 14 V18 Q12 21 9 21 H7"/>',
    bulut: '<path d="M7 19 H18 Q22.5 19 22.5 14.8 Q22.5 10.8 18.4 10.5 Q17.6 5.5 12.6 5.5 Q8.6 5.5 7.4 9.4 Q2 9.8 2 14.4 Q2 19 7 19 Z"/>',
  };
  PX.icon = (k, x, y, s) => `<g class="pxi pxi-${k}" transform="translate(${x},${y})${s && s !== 1 ? ` scale(${s})` : ''}">${ICON[k]}</g>`;

  // ================================================================== hat: istemci → vekil → GlobalShip
  const CX = 20; // istemci kartı
  const CW = 250;
  const NW = 420; // kalıpsız istemci kartı (kontrol rozetleriyle)
  const VX = 330; // vekil kartı
  const VW = 290;
  const GX = 680; // GlobalShip kartı
  const GW = 260;
  const ROWH = 66; // vekil kapısı satırı

  const SCREEN = (s) => {
    if (!s || !s.no) return { a: 'hazır', b: '', c: '', kind: 'idle' };
    if (s.kind === 'kvkk') return { a: s.no, b: PX.KVKK, c: '', kind: 'kvkk' };
    return { a: s.no, b: PX.durum(s.no), c: PX.alici(s.no), kind: s.kind || 'ok' };
  };

  class Hat {
    /** o: {minH, cls} */
    constructor(root, o) {
      this.o = o || {};
      this.el = DP.h('div', { class: 'fm-stage px-hat' + (this.o.cls ? ' ' + this.o.cls : '') });
      root.appendChild(this.el);
      this.el.innerHTML = `
<svg class="fm-svg px-svg" viewBox="0 0 960 ${this.o.minH || 520}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="İstemci, vekil ve GlobalShip arasında takip sorgusu">
  <rect class="px-bg" x="-1500" y="-1500" width="4000" height="4000"/>
  <g data-k="wires"></g>
  <g data-k="gs"></g>
  <g data-k="lanes"></g>
  <g data-k="fx"><g class="px-token" data-k="tok"><g class="px-token-in"><rect data-k="tok-bg" x="-60" y="-15" width="120" height="30" rx="15"/><text data-k="tok-t" x="0" y="5" text-anchor="middle"></text></g></g></g>
  <foreignObject class="bubble-fo" data-k="b-banner" x="110" y="460" width="740" height="52"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble px-banner"></div></foreignObject>
</svg>`;
      this.svg = this.el.querySelector('svg');
      this.k = {};
      DP.$$('[data-k]', this.el).forEach((n) => (this.k[n.getAttribute('data-k')] = n));
      this.timers = [];
      this.geo = [];
    }

    _stop() {
      this.timers.forEach(clearTimeout);
      this.timers = [];
    }

    _at(ms, fn) {
      this.timers.push(setTimeout(fn, DP.dur(ms)));
    }

    /** Şeritlerin dikey konumları */
    _layout(n, mode) {
      if (n === 1) return mode === 'naive' ? [{ y: 150, h: 214 }] : [{ y: 70, h: 340 }]; // vekil açılıp kapanınca yerler oynamasın
      return [
        { y: 50, h: 200 },
        { y: 272, h: 200 },
      ];
    }

    /** İstemci kartı (kalıpsızda kontrol rozetleriyle) */
    _client(L, g, mode, i) {
      const I = PX.ISTEMCI[L.ist];
      const naive = mode === 'naive';
      const w = naive ? NW : CW;
      const sc = SCREEN(L.screen);
      const sy = g.y + 50;
      const sh = naive ? 78 : 112;
      // dar kartta uyarı ekranın altına yazılır
      const warn =
        sc.kind !== 'leak'
          ? ''
          : naive
          ? `<g class="pxc-warn"><rect x="${CX + w - 196}" y="${sy + 9}" width="168" height="24" rx="12"/><text x="${CX + w - 112}" y="${sy + 26}" text-anchor="middle">⚠ başkasının verisi</text></g>`
          : `<text class="pxc-warn-t" x="${CX + w / 2}" y="${sy + sh + 28}" text-anchor="middle">⚠ başkasının verisi</text>`;
      const screen = `<g class="pxc-screen is-${sc.kind}">
          <rect x="${CX + 14}" y="${sy}" width="${w - 28}" height="${sh}" rx="8"/>
          <text class="pxc-s1" x="${CX + 28}" y="${sy + (naive ? 25 : 30)}">${esc(sc.a)}</text>
          <text class="pxc-s2" x="${CX + 28}" y="${sy + (naive ? 47 : 60)}">${esc(sc.b)}</text>
          <text class="pxc-s3" x="${CX + 28}" y="${sy + (naive ? 68 : 88)}">${esc(sc.c)}</text>
          ${warn}
        </g>`;
      let badges = '';
      if (naive && L.badges) {
        let bx = CX + 14;
        const by = sy + sh + 24;
        const kopya = L.badges.some((b) => b.kind === 'dup');
        badges = L.badges
          .map((b) => {
            const bw = b.text.length * 7.6 + 34;
            const html = `<g class="pxc-badge is-${b.kind || 'on'}"><rect x="${bx}" y="${by}" width="${bw}" height="28" rx="8"/><text x="${bx + 12}" y="${by + 19}">${b.kind === 'missing' ? '✗' : '✓'} ${esc(b.text)}</text></g>`;
            bx += bw + 8;
            return html;
          })
          .join('');
        badges = `<text class="pxc-code-t${kopya ? ' is-dup' : ''}" x="${CX + 14}" y="${by - 7}">${kopya ? 'panelden kopyalanan denetim kodu:' : 'istemcinin içindeki denetim kodu:'}</text>` + badges;
      }
      this.geo[i] = { y: g.y + g.h / 2, client: CX + w };
      return `<g class="pxc rc rc-1${L.fresh ? ' is-new' : ''}">
        <rect class="pxc-card" x="${CX}" y="${g.y}" width="${w}" height="${g.h}" rx="14"/>
        ${PX.icon(L.ist, CX + 14, g.y + 13)}
        <text class="pxc-title" x="${CX + 48}" y="${g.y + 31}">${esc(I.tag)} · ${esc(PX.MUSTERI[L.m].ad)}</text>
        ${naive ? `<text class="pxc-sub" x="${CX + w - 14}" y="${g.y + 31}" text-anchor="end">${esc(I.cls)}</text>` : `<text class="pxc-sub" x="${CX + w / 2}" y="${g.y + g.h - 16}" text-anchor="middle">${esc(I.cls)}</text>`}
        ${screen}${badges}
      </g>`;
    }

    /** Vekil kartı: üç kapı */
    _vekil(V, g) {
      const y0 = g.y;
      const rows = [
        { k: 'koruma', t: 'koruma', d: V.koruma === 'off' ? 'kapalı' : 'oturum: ' + V.oturum },
        { k: 'onbellek', t: 'önbellek', d: V.onbellek === 'off' ? 'kapalı' : V.cache && V.cache.length ? V.cache.join(', ') : 'boş' },
        { k: 'gercek', t: 'gercek', d: V.gercek ? 'GlobalShipTakip ●' : V.sanal === 'off' ? 'açılışta yaratılır' : 'null (henüz yok)' },
      ];
      const gate = V.gate || {};
      const STATE = { ok: '✓', bad: '✗', hit: 'bulundu', miss: 'yok', create: 'yaratıldı', call: 'soruluyor' };
      const rowsSvg = rows
        .map((r, i) => {
          const y = y0 + 70 + i * (ROWH + 12);
          const off = (r.k === 'koruma' && V.koruma === 'off') || (r.k === 'onbellek' && V.onbellek === 'off');
          const st = gate[r.k];
          const pill = st ? `<g class="pxv-st is-${st}"><rect x="${VX + VW - 98}" y="${y + 20}" width="86" height="26" rx="13"/><text x="${VX + VW - 55}" y="${y + 38}" text-anchor="middle">${STATE[st]}</text></g>` : '';
          return `<g class="pxv-row is-${r.k}${off ? ' is-off' : ''}${st ? ' is-' + st : ''}${r.k === 'gercek' && V.gercek ? ' is-live' : ''}">
            <rect class="pxv-rowbg" x="${VX + 10}" y="${y}" width="${VW - 20}" height="${ROWH}" rx="10"/>
            <circle class="pxv-ic-bg" cx="${VX + 38}" cy="${y + ROWH / 2}" r="17"/>${PX.icon(r.k, VX + 26, y + ROWH / 2 - 12)}
            <text class="pxv-t" x="${VX + 64}" y="${y + 27}">${esc(r.t)}</text>
            <text class="pxv-d" x="${VX + 64}" y="${y + 49}">${esc(r.d.length > 26 ? r.d.slice(0, 25) + '…' : r.d)}</text>
            ${pill}
          </g>`;
        })
        .join('');
      return `<g class="pxv rc rc-3${V.fresh ? ' is-new' : ''}">
        <rect class="pxv-card" x="${VX}" y="${y0}" width="${VW}" height="${g.h}" rx="14"/>
        <path class="pxv-head" d="M${VX} ${y0 + 14} Q${VX} ${y0} ${VX + 14} ${y0} H${VX + VW - 14} Q${VX + VW} ${y0} ${VX + VW} ${y0 + 14} V${y0 + 50} H${VX} Z"/>
        <text class="pxv-title" x="${VX + 16}" y="${y0 + 32}">vekil : <tspan class="pxv-cls">TakipVekili</tspan></text>
        <text class="pxv-sub" x="${VX + VW - 14}" y="${y0 + 32}" text-anchor="end">TakipServisi</text>
        ${rowsSvg}
      </g>`;
    }

    /** GlobalShip kartı: oturumlar ve sayaçlar */
    _gs(G, top, bottom) {
      const h = bottom - top;
      const sessions = (G.sessions || [])
        .map((s, i) => `<g class="pxg-ses"><rect x="${GX + 16}" y="${top + 92 + i * 34}" width="${GW - 32}" height="26" rx="8"/><circle cx="${GX + 32}" cy="${top + 105 + i * 34}" r="4.5"/><text x="${GX + 44}" y="${top + 110 + i * 34}">oturum #${i + 1} · ${esc(s)}</text></g>`)
        .join('');
      const ms = G.oturum * PX.COST.oturum + G.sorgu * PX.COST.sorgu;
      const cnt = [
        ['oturum', G.oturum],
        ['sorgu', G.sorgu],
        ['süre', ms + ' ms'],
        ['ücret', G.sorgu * PX.COST.kurus + ' kr'],
      ];
      const cy = bottom - 112;
      const counters = cnt
        .map(([k, v], i) => {
          const x = GX + 16 + (i % 2) * ((GW - 40) / 2 + 8);
          const y = cy + Math.floor(i / 2) * 50;
          return `<g class="pxg-cnt${(G.bump || []).includes(k) ? ' is-bump' : ''}"><rect x="${x}" y="${y}" width="${(GW - 40) / 2}" height="42" rx="9"/><text class="pxg-k" x="${x + 10}" y="${y + 16}">${k}</text><text class="pxg-v" x="${x + 10}" y="${y + 35}">${esc(String(v))}</text></g>`;
        })
        .join('');
      return `<g class="pxg rc rc-4${G.active ? ' is-active' : ''}">
        <rect class="pxg-card" x="${GX}" y="${top}" width="${GW}" height="${h}" rx="14"/>
        ${PX.icon('bulut', GX + 14, top + 12, 1.25)}
        <text class="pxg-title" x="${GX + 52}" y="${top + 33}">GlobalShip</text>
        <text class="pxg-sub" x="${GX + 16}" y="${top + 62}">uzak · oturum ${PX.COST.oturum} ms</text>
        <text class="pxg-sub" x="${GX + 16}" y="${top + 80}">sorgu ${PX.COST.sorgu} ms · ${PX.COST.kurus} kuruş</text>
        ${sessions || `<text class="pxg-none" x="${GX + GW / 2}" y="${top + 112}" text-anchor="middle">açık oturum yok</text>`}
        ${counters}
      </g>`;
    }

    /**
     * st: {mode: 'naive'|'vekil'|'yok', lanes: [{ist, m, screen, badges}], vekil: {...}, gs: {oturum, sorgu, sessions, active, bump}, token, banner}
     *   token: {from: 'client'|'vekil'|'gs', to: ..., text, kind: 'req'|'ok'|'bad'|'hit', lane}
     */
    render(st, prev, o) {
      const anim = !!(o && o.animate);
      prev = prev || {};
      this._stop();
      const mode = st.mode || 'vekil';
      const lanes = st.lanes || [];
      const G = this._layout(lanes.length, mode);
      const fresh = (L, i) => anim && (!prev.lanes || !prev.lanes[i] || prev.lanes[i].ist !== L.ist || prev.lanes[i].m !== L.m);
      this.k.lanes.innerHTML =
        lanes.map((L, i) => this._client(Object.assign({}, L, { fresh: fresh(L, i) }), G[i], mode, i)).join('') +
        (mode === 'vekil' && st.vekil ? this._vekil(Object.assign({}, st.vekil, { fresh: anim && prev.mode !== 'vekil' }), G[0]) : '');
      const top = G[0].y;
      const bottom = G[G.length - 1].y + G[G.length - 1].h;
      this.k.gs.innerHTML = this._gs(st.gs || { oturum: 0, sorgu: 0 }, top, bottom);
      // kablolar: oturum açılmışsa düz, değilse kesik
      this.k.wires.innerHTML = lanes
        .map((L, i) => {
          const y = this.geo[i].y;
          const live = (st.gs && st.gs.live && st.gs.live[i]) || false;
          const segs = [];
          if (mode === 'vekil') {
            segs.push([this.geo[i].client, VX, true]);
            segs.push([VX + VW, GX, live]);
          } else segs.push([this.geo[i].client, GX, live]);
          return segs.map(([a, b, on]) => `<path class="px-wire${on ? ' is-live' : ''}" d="M${a} ${y} H${b}"/>`).join('');
        })
        .join('');
      const H = Math.max(this.o.minH || 520, bottom + 80);
      this.svg.setAttribute('viewBox', `0 0 960 ${H}`);
      this.k['b-banner'].setAttribute('y', String(H - 62));
      banner(this.k['b-banner'], st.banner);
      if (anim && st.gs && st.gs.bump && st.gs.bump.length) this.k.gs.querySelectorAll('.pxg-cnt.is-bump').forEach((g) => DP.flash(g, 'is-bumping'));
      this._token(st.token, anim, mode);
    }

    /** Jeton: istemciden vekile, vekilden GlobalShip'e ya da geri */
    _token(t, anim, mode) {
      const tok = this.k.tok;
      if (!t || !anim || DP.reducedMotion) {
        tok.classList.remove('is-on');
        return;
      }
      const lane = this.geo[t.lane || 0];
      if (!lane) return;
      const X = { client: lane.client - 64, vekil: mode === 'vekil' ? VX + VW / 2 : GX - 70, vekilIn: VX + 66, gs: GX + 70 };
      const w = Math.max(96, t.text.length * 8.2 + 26);
      this.k['tok-bg'].setAttribute('x', String(-w / 2));
      this.k['tok-bg'].setAttribute('width', String(w));
      this.k['tok-t'].textContent = t.text;
      tok.setAttribute('class', 'px-token is-on is-' + (t.kind || 'req'));
      const y = lane.y - 2;
      setTransform(tok, `translate(${X[t.from]}px, ${y}px)`, false);
      void tok.getBoundingClientRect();
      setTransform(tok, `translate(${X[t.to]}px, ${y}px)`, true);
      this._at(t.stay ? 1500 : 1000, () => tok.classList.remove('is-on'));
    }

    destroy() {
      this._stop();
      this.el.remove();
    }
  }
  PX.Hat = Hat;
})();
