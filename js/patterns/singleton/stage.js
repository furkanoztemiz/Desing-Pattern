/*
 * Singleton — "Takip ofisi" animasyon sahnesi (Sorun ve Canlı Akış).
 *
 * Metafor:
 *   Masalar        → SiparisServisi / IadeServisi nesneleri (istemciler)
 *   Numara makinesi → TakipNoUretici nesnesi (ekranda sayacı görünür)
 *   Takip panosu   → verilen numaraların kaydı; aynı numara iki kez gelirse ÇAKIŞMA
 *   Kaide          → static ornek alanı (Singleton modunda makine buraya "doğar")
 *
 * Durum tabanlı çizim: render(state, prevState, {animate}) — geri/ileri adımlarda tutarlı.
 * Görünürlük hemen uygulanır; animasyonlar yalnızca CSS ile (zamanlayıcıya bağlı değil).
 */
(function () {
  'use strict';
  const SG = DP.sg;
  const esc = DP.esc;
  let uidCounter = 0;

  const DESK = { sip: { x: 60, label: 'SİPARİŞ MASASI', obj: 'siparis : SiparisServisi', pkgX: 150 }, iade: { x: 680, label: 'İADE MASASI', obj: 'iade : IadeServisi', pkgX: 40 } };
  const MACH_X = { problem: { a: 380, b: 620 }, single: { a: 500, b: 620 } };
  const LABEL_AT = (desk) => ({ x: DESK[desk].x + DESK[desk].pkgX + 35, y: 309 });

  class SGStage {
    constructor(root) {
      this.uid = 'sgs' + ++uidCounter;
      this.el = DP.h('div', { class: 'fm-stage sg-stage' });
      root.appendChild(this.el);
      this.el.innerHTML = this._markup();
      this.k = {};
      DP.$$('[data-k]', this.el).forEach((n) => (this.k[n.getAttribute('data-k')] = n));
      this.state = null;
    }

    _desk(key) {
      const d = DESK[key];
      const cx = key === 'sip' ? 66 : 196; // memur, paketin karşı tarafında durur
      // Konum dış grupta (transform özniteliği), animasyonlar iç grupta: CSS transform özniteliği ezmesin.
      return `
  <g class="desk" data-k="desk-${key}" transform="translate(${d.x},0)"><g class="desk-in">
    <g class="clerk"><circle class="ck-head" cx="${cx}" cy="282" r="17"/><path class="ck-body" d="M${cx - 28} 334 Q${cx - 28} 300 ${cx} 300 Q${cx + 28} 300 ${cx + 28} 334 Z"/></g>
    <rect class="dk-top" x="0" y="330" width="260" height="11" rx="3"/>
    <rect class="dk-front" x="8" y="341" width="244" height="59" rx="4"/>
    <text class="dk-sign" x="130" y="365" text-anchor="middle">${d.label}</text>
    <text class="dk-obj" x="130" y="389" text-anchor="middle">${d.obj}</text>
    <text class="bp-label small dk-bp" x="130" y="300" text-anchor="middle">henüz nesne yok</text>
    <g class="pkg" data-k="pkg-${key}" transform="translate(${d.pkgX},330)"><g class="pkg-in">
      <text class="pk-cargo" x="35" y="-54" text-anchor="middle" data-k="pkc-${key}">yük</text>
      <rect class="pk-box" x="0" y="-44" width="70" height="44" rx="3"/>
      <rect class="pk-tape" x="31" y="-44" width="8" height="44"/>
      <g class="pk-label" data-k="pkl-${key}"><rect x="5" y="-30" width="60" height="18" rx="2"/><text x="35" y="-17" text-anchor="middle" data-k="pkn-${key}">KRG-0000</text></g>
    </g></g>
  </g></g>`;
    }

    _machine(key) {
      return `
  <g class="mach" data-k="mach-${key}" transform="translate(${MACH_X.problem[key]},400)">
    <g class="mach-in" data-k="machin-${key}">
      <rect class="mc-body" x="-40" y="-160" width="80" height="152" rx="12"/>
      <rect class="mc-screen" x="-31" y="-148" width="62" height="31" rx="4"/>
      <text class="mc-count" x="0" y="-125" text-anchor="middle" data-k="cnt-${key}">1000</text>
      <text class="mc-cap" x="0" y="-102" text-anchor="middle">TAKİP NO</text>
      <rect class="mc-slot" x="-24" y="-92" width="48" height="6" rx="3"/>
      <rect class="mc-paper" x="-19" y="-88" width="38" height="13" rx="1.5"/>
      <circle class="mc-btn" cx="0" cy="-52" r="10"/>
      <rect class="mc-base" x="-46" y="-9" width="92" height="9" rx="3"/>
    </g>
    <text class="mc-label" x="0" y="22" text-anchor="middle" data-k="ml-${key}">uretici : TakipNoUretici</text>
    <text class="mc-sub" x="0" y="40" text-anchor="middle" data-k="ms-${key}">nesne #1</text>
  </g>`;
    }

    _markup() {
      const u = this.uid;
      return `
<svg class="fm-svg sg-svg" viewBox="50 0 900 470" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Takip ofisi: masalar, numara makinesi ve takip panosu">
  <defs>
    <marker id="${u}-call" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="mk-spot" d="M0 0 L10 5 L0 10 z"/></marker>
  </defs>
  <rect class="of-wall" x="-1500" y="-1500" width="4000" height="1900"/>
  <rect class="of-band" x="-1500" y="384" width="4000" height="16"/>
  <rect class="of-floor" x="-1500" y="400" width="4000" height="1500"/>
  <path class="of-floor-line" d="M-1500 440 H2500 M-1500 488 H2500"/>
  <g class="of-sign"><rect x="62" y="20" width="178" height="40" rx="8"/><text x="151" y="46" text-anchor="middle">LOJİSTİK MERKEZİ</text></g>
  <g class="of-clock" transform="translate(898,52)"><circle r="26"/><path d="M0 0 V-15 M0 0 L11 7"/></g>

  <!-- takip panosu -->
  <g class="board" data-k="board">
    <rect class="bd-frame" x="282" y="12" width="436" height="176" rx="10"/>
    <rect class="bd-screen" x="292" y="40" width="416" height="138" rx="4"/>
    <text class="bd-title" x="302" y="32">TAKİP PANOSU</text>
    <text class="bd-cols" x="704" y="32" text-anchor="end">no · yük · masa</text>
    <g data-k="rows"></g>
    <text class="bd-empty" data-k="bd-empty" x="500" y="114" text-anchor="middle">henüz gönderi yok</text>
    <g class="bd-clash" data-k="clash" transform="translate(612,160)"><g class="bd-clash-in"><rect x="-74" y="-18" width="148" height="36" rx="6"/><text x="0" y="7" text-anchor="middle">ÇAKIŞMA!</text></g></g>
  </g>

  <!-- static ornek kaidesi (Singleton modu) -->
  <g class="pedestal" data-k="ped" transform="translate(500,400)">
    <rect class="pd-glow" x="-70" y="-6" width="140" height="12" rx="6"/>
    <g class="pd-ghost"><rect x="-40" y="-160" width="80" height="152" rx="12"/><text x="0" y="-80" text-anchor="middle">ornek</text><text x="0" y="-58" text-anchor="middle">= null</text></g>
  </g>

  <path class="sg-call" data-k="call" d="M0 0" marker-end="url(#${u}-call)"/>

  ${this._desk('sip')}
  ${this._desk('iade')}
  ${this._machine('a')}
  ${this._machine('b')}

  <!-- çağrı etiketi: makinelerin üstünde kalsın diye en son çizilir -->
  <text class="sg-call-t" data-k="call-t" x="0" y="0" text-anchor="middle"></text>

  <!-- uçan takip fişi -->
  <g class="ticket" data-k="ticket"><rect x="-32" y="-11" width="64" height="22" rx="3"/><text x="0" y="5" text-anchor="middle" data-k="ticket-t">KRG-1001</text></g>

  <!-- konuşma balonları ve kontrol kartı -->
  <foreignObject class="bubble-fo" data-k="b-check" x="380" y="186" width="240" height="56"><div xmlns="http://www.w3.org/1999/xhtml" class="sg-check"></div></foreignObject>
  <foreignObject class="bubble-fo" data-k="b-board" x="722" y="70" width="226" height="120"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble tail-left"></div></foreignObject>
  <foreignObject class="bubble-fo" data-k="b-sip" x="60" y="150" width="262" height="108"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble tail-bottom"></div></foreignObject>
  <foreignObject class="bubble-fo" data-k="b-iade" x="680" y="150" width="262" height="108"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble tail-bottom"></div></foreignObject>
  <foreignObject class="bubble-fo" data-k="b-left" x="56" y="70" width="222" height="120"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble"></div></foreignObject>
</svg>`;
    }

    /** Tüm sahneyi verilen duruma getirir. */
    render(st, prev, o) {
      const k = this.k;
      const anim = !!(o && o.animate);
      prev = prev || {};
      this.state = st;
      const single = st.mode === 'single';
      this.el.classList.toggle('is-single', single);
      this.el.classList.toggle('is-problem', !single);

      // masalar
      ['sip', 'iade'].forEach((key) => {
        const on = !!(st.desks && st.desks[key]);
        const hidden = st.hide && st.hide.includes(key);
        const desk = k['desk-' + key];
        desk.classList.toggle('is-off', !on);
        desk.classList.toggle('is-hidden', !!hidden);
        desk.classList.toggle('is-active', st.active === key);
        if (on && anim && !(prev.desks && prev.desks[key])) DP.flash(desk, 'is-popping');
        const pkg = st.pkg && st.pkg[key];
        k['pkg-' + key].classList.toggle('is-on', !!pkg);
        if (pkg) {
          k['pkc-' + key].textContent = pkg.cargo;
          k['pkl-' + key].classList.toggle('is-on', !!pkg.no);
          k['pkl-' + key].classList.toggle('is-bad', !!pkg.bad);
          if (pkg.no) k['pkn-' + key].textContent = pkg.no;
          const ppkg = prev.pkg && prev.pkg[key];
          if (anim && (!ppkg || ppkg.cargo !== pkg.cargo)) DP.flash(k['pkg-' + key], 'is-arriving');
          if (anim && pkg.no && (!ppkg || ppkg.no !== pkg.no)) DP.flash(k['pkl-' + key], 'is-stick');
        }
      });

      // makineler
      const pos = MACH_X[st.mode];
      ['a', 'b'].forEach((key) => {
        const m = st.machines && st.machines[key];
        const g = k['mach-' + key];
        g.setAttribute('transform', `translate(${pos[key]},400)`);
        g.classList.toggle('is-on', !!m);
        if (!m) return;
        k['cnt-' + key].textContent = String(m.count);
        k['ml-' + key].textContent = single ? 'ornek : TakipNoUretici' : 'uretici : TakipNoUretici';
        const reuse = st.reuse === key;
        k['ms-' + key].textContent = reuse ? 'aynı nesne ✓' : single ? 'tek nesne' : key === 'a' ? 'nesne #1 · sipariş' : 'nesne #2 · iade';
        g.classList.toggle('is-printing', st.tick === key);
        g.classList.toggle('is-reuse', reuse);
        if (anim && st.pop === key) DP.flash(k['machin-' + key], 'is-popping');
        if (anim && st.tick === key) DP.flash(k['cnt-' + key], 'is-tick');
        if (anim && reuse) DP.flash(k['machin-' + key], 'is-pulse');
      });
      k.ped.classList.toggle('is-on', single);
      k.ped.classList.toggle('is-null', single && !(st.machines && st.machines.a));
      k.ped.classList.toggle('is-check', single && !!st.check);

      this._renderCall(st);
      this._renderTicket(st, prev, anim);
      this._renderBoard(st, prev, anim);
      this._renderCheck(st.check);
      this._renderBubble(st.bubble);
    }

    _renderCall(st) {
      const k = this.k;
      const c = st.call;
      k.call.classList.toggle('is-on', !!c);
      k['call-t'].classList.toggle('is-on', !!c);
      if (!c) return;
      const mx = MACH_X[st.mode][c.to];
      const from = c.from === 'sip' ? { x: DESK.sip.x + 254, y: 318 } : { x: DESK.iade.x + 6, y: 318 };
      const to = { x: mx + (from.x < mx ? -44 : 44), y: 300 };
      const midY = Math.min(from.y, to.y) - 36;
      k.call.setAttribute('d', `M${from.x} ${from.y} C${from.x + (to.x - from.x) * 0.3} ${midY}, ${to.x - (to.x - from.x) * 0.3} ${midY}, ${to.x} ${to.y}`);
      const t = k['call-t'];
      t.textContent = c.label || '';
      // kısa çağrılarda (masa ↔ yanındaki makine) etiket masanın üstüne kayar
      const short = Math.abs(to.x - from.x) < 120;
      t.setAttribute('x', String(short ? from.x + (from.x < to.x ? -50 : 50) : (from.x + to.x) / 2));
      t.setAttribute('y', String(midY - (short ? 10 : 4)));
      DP.flash(k.call, 'is-drawing');
    }

    _renderTicket(st, prev, anim) {
      const t = this.k.ticket;
      const tk = st.ticket;
      if (!tk || !anim) {
        t.classList.remove('is-flying');
        return;
      }
      const mx = MACH_X[st.mode][tk.from];
      const end = LABEL_AT(tk.to);
      this.k['ticket-t'].textContent = tk.no;
      t.classList.toggle('is-bad', !!tk.bad);
      t.style.transition = 'none';
      t.style.transform = `translate(${mx}px,${312}px) scale(.6)`;
      void t.getBoundingClientRect();
      t.style.transition = '';
      t.style.transform = `translate(${end.x}px,${end.y}px) scale(1)`;
      DP.flash(t, 'is-flying');
    }

    _renderBoard(st, prev, anim) {
      const rows = st.board || [];
      const prevN = (prev.board || []).length;
      this.k['bd-empty'].classList.toggle('is-on', !rows.length);
      this.k.rows.innerHTML = rows
        .slice(-4)
        .map((r, i, arr) => {
          const idx = rows.length - arr.length + i;
          const y = 46 + i * 33;
          const fresh = anim && idx >= prevN;
          return `<g class="bd-row${r.bad ? ' is-bad' : ''}${fresh ? ' is-new' : ''}${r.dupOf ? ' is-dup' : ''}">
            <rect x="298" y="${y}" width="404" height="28" rx="4"/>
            <text class="bd-no" x="308" y="${y + 19}">${esc(r.no)}</text>
            <text class="bd-cargo" x="404" y="${y + 19}">${esc(r.cargo)}</text>
            <text class="bd-src" x="694" y="${y + 19}" text-anchor="end">${esc(r.src)}</text></g>`;
        })
        .join('');
      const clash = this.k.clash;
      clash.classList.toggle('is-on', !!st.clash);
      if (st.clash && anim && !prev.clash) DP.flash(clash, 'is-stamping');
      this.k.board.classList.toggle('is-alarm', !!st.clash);
    }

    _renderCheck(check) {
      const fo = this.k['b-check'];
      fo.classList.toggle('is-on', !!check);
      if (!check) return;
      fo.firstElementChild.className = 'sg-check ' + (check === 'yes' ? 'is-yes' : 'is-no');
      fo.firstElementChild.innerHTML =
        check === 'yes'
          ? '<code>ornek == null</code> ? <b>EVET</b> → oluştur'
          : '<code>ornek == null</code> ? <b>HAYIR</b> → var olanı ver';
    }

    _renderBubble(b) {
      ['board', 'sip', 'iade', 'left'].forEach((at) => {
        const fo = this.k['b-' + at];
        const on = !!b && b.at === at;
        const div = fo.firstElementChild;
        if (on) {
          const html = DP.md(b.text, SG.roleOf);
          if (div.innerHTML !== html) {
            div.innerHTML = html;
            DP.flash(div, 'is-pop');
          }
          div.classList.toggle('is-ok', b.tone === 'ok');
          div.classList.toggle('is-bad', b.tone === 'bad');
        }
        fo.classList.toggle('is-on', on);
      });
    }

    destroy() {
      this.el.remove();
    }
  }

  SG.Stage = SGStage;
})();
