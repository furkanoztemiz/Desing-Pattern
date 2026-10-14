/*
 * Prototype — animasyon sahneleri.
 *   PT.art         : koli, zarf, palet ve içerik listesi (pano) çizimleri
 *   PT.DeskStage   : "Sorun" — sipariş masası; instanceof panosu her türü tek tek sorar, kopyayı
 *                    sıfırdan kurar (yavaş adres servisi her seferinde çağrılır), Palet'te çöker.
 *   PT.ShelfStage  : "Sığ ↔ Derin" — depo: kutular (nesneler), içerik panoları (listeler) ve
 *                    aralarındaki ipler (referanslar). Sığ kopyada bütün ipler TEK panoya gider.
 *   PT.memKopya / PT.memKlon : aynı adımların bellek görünümü (DP.MemoryView) için düzenler.
 *   PT.CatalogStage: "Katalog" — şablon rafı ve teslim tezgâhı (HTML).
 *
 * Durum tabanlı çizim: render(state, prevState, {animate}) — geri/ileri adımlarda tutarlı.
 * Görünürlük hemen uygulanır; animasyonlar yalnızca CSS ile (zamanlayıcıya bağlı değil).
 */
(function () {
  'use strict';
  const PT = DP.pt;
  const esc = DP.esc;
  const md = (t) => DP.md(t, PT.roleOf);
  const art = (PT.art = PT.art || {});
  let uidCounter = 0;

  // ================================================================== çizimler
  // Hepsinin orijini sol-alt köşedir (zemine temas noktası).

  /** Koli: ön yüz 120×84, 16 px derinlik. label: adres etiketi, kg: ağırlık çıkartması */
  art.koli = (o) => {
    o = o || {};
    return `
    <g class="pa-koli">
      <path class="bx-top" d="M0 -84 L16 -98 H136 L120 -84 Z"/>
      <path class="bx-side" d="M120 -84 L136 -98 V-14 L120 0 Z"/>
      <rect class="bx-front" x="0" y="-84" width="120" height="84" rx="2"/>
      <path class="bx-tape-v" d="M53 -84 H67 V0 H53 Z"/>
      ${o.label ? `<g class="pa-tag"><rect x="8" y="-74" width="78" height="30" rx="3"/><text x="14" y="-62">${esc(o.label)}</text><path d="M14 -53 H72"/></g>` : ''}
      ${o.kg != null ? `<g class="pa-kg"><rect x="72" y="-36" width="40" height="24" rx="3"/><text x="92" y="-19" text-anchor="middle">${esc(o.kg)} kg</text></g>` : ''}
      ${o.ribbon ? `<g class="pa-ribbon"><rect x="-6" y="-104" width="${o.ribbon.length * 8.2 + 16}" height="20" rx="4"/><text x="2" y="-90">${esc(o.ribbon)}</text></g>` : ''}
    </g>`;
  };

  /** Zarf: 130×80. */
  art.zarf = (o) => {
    o = o || {};
    return `
    <g class="pa-zarf">
      <rect class="zf-body" x="0" y="-80" width="130" height="80" rx="4"/>
      <path class="zf-fold" d="M2 -2 L52 -40 M128 -2 L78 -40"/>
      <path class="zf-flap" d="M2 -78 L65 -34 L128 -78"/>
      <g class="zf-stamp"><rect x="100" y="-72" width="22" height="26" rx="2"/><path d="M104 -66 H118 M104 -60 H118 M104 -54 H114"/></g>
      ${o.iadeli ? '<g class="zf-iade"><rect x="10" y="-28" width="58" height="20" rx="3"/><text x="39" y="-14" text-anchor="middle">İADELİ</text></g>' : ''}
      ${o.label ? `<text class="zf-label" x="10" y="-60">${esc(o.label)}</text>` : ''}
    </g>`;
  };

  /** Palet: 150 genişliğinde ahşap palet + streç filmli koliler. */
  art.palet = (o) => {
    o = o || {};
    const boxes = [
      [6, -44], [52, -44], [98, -44],
      [18, -80], [64, -80],
    ]
      .map(([x, y]) => `<rect class="pl-box" x="${x}" y="${y}" width="44" height="34" rx="2"/><path class="pl-box-tape" d="M${x + 19} ${y} h6 v34 h-6z"/>`)
      .join('');
    return `
    <g class="pa-palet">
      ${boxes}
      <path class="pl-film" d="M4 -84 H146 V-10 H4 Z"/>
      <rect class="pl-deck" x="0" y="-10" width="150" height="6" rx="1"/>
      <rect class="pl-foot" x="4" y="-4" width="20" height="4"/><rect class="pl-foot" x="65" y="-4" width="20" height="4"/><rect class="pl-foot" x="126" y="-4" width="20" height="4"/>
      ${o.label ? `<g class="pa-tag"><rect x="88" y="-78" width="56" height="20" rx="3"/><text x="116" y="-64" text-anchor="middle">${esc(o.label)}</text></g>` : ''}
    </g>`;
  };

  /** Bir gönderinin çizimi (türüne göre). */
  art.item = (g, o) => {
    o = o || {};
    const short = g.alici.split(' ')[0];
    if (g.k === 'zarf') return art.zarf({ iadeli: g.deger, label: short });
    if (g.k === 'palet') return art.palet({ label: g.deger + ' palet' });
    return art.koli({ label: short, kg: g.deger, ribbon: o.ribbon });
  };

  /** İçerik panosu (liste). Orijin: sol-üst; genişlik 160. o: {title, hl, bad, ok} */
  art.listCard = (items, o) => {
    o = o || {};
    const H = 54 + items.length * 26;
    const rows = items
      .map((it, i) => {
        const isHl = o.hl === it && i === items.length - 1;
        return `<g class="pl-row${isHl ? ' is-hl' + (o.bad ? ' is-bad' : ' is-ok') : ''}"><rect x="12" y="${42 + i * 26}" width="136" height="23" rx="4"/><text x="20" y="${58 + i * 26}">• ${esc(it)}</text></g>`;
      })
      .join('');
    return `
    <g class="pa-list${o.bad ? ' is-bad' : ''}">
      <rect class="bf-clip-bg" x="0" y="0" width="160" height="${H}" rx="9"/>
      <rect class="bf-paper" x="7" y="12" width="146" height="${H - 19}" rx="5"/>
      <rect class="bf-clip" x="56" y="-7" width="48" height="16" rx="5"/>
      <text class="pl-title" x="16" y="33">${esc(o.title || 'İÇERİK')}</text>
      ${rows}
    </g>`;
  };
  art.listH = (n) => 54 + n * 26;

  /** Kum saati (yavaş servis). Orijin: merkez. */
  art.hourglass = () => `
    <g class="pa-hg"><g class="pa-hg-in">
      <path class="hg-frame" d="M-9 -13 H9 M-9 13 H9"/>
      <path class="hg-glass" d="M-7 -12 L7 -12 L1 0 L7 12 L-7 12 L-1 0 Z"/>
      <path class="hg-sand" d="M-4 -9 L4 -9 L0 -2 Z M-5 11 L5 11 L0 6 Z"/>
    </g></g>`;

  /** Ortak arka plan: duvar, süpürgelik, zemin. */
  const room = () => `
  <rect class="of-wall" x="-1500" y="-1500" width="4000" height="1900"/>
  <rect class="of-band" x="-1500" y="384" width="4000" height="16"/>
  <rect class="of-floor" x="-1500" y="400" width="4000" height="1500"/>
  <path class="of-floor-line" d="M-1500 440 H2500"/>`;

  /** foreignObject içinde konuşma balonu. */
  const bubbleFo = (key, x, y, w, hgt, tail) =>
    `<foreignObject class="bubble-fo" data-k="b-${key}" x="${x}" y="${y}" width="${w}" height="${hgt}"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble ${tail || 'tail-bottom'}"></div></foreignObject>`;

  function renderBubbles(k, keys, b) {
    keys.forEach((at) => {
      const fo = k['b-' + at];
      if (!fo) return;
      const on = !!b && b.at === at;
      const div = fo.firstElementChild;
      if (on) {
        const html = md(b.text);
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

  /** CSS dönüşümünü uygular; animasyon yoksa geçişi o an için kapatır (geri adımlarda zıplama olmasın). */
  function setTransform(el, value, anim) {
    if (!anim) el.style.transition = 'none';
    el.style.transform = value;
    if (!anim) {
      void el.getBoundingClientRect();
      el.style.transition = '';
    }
  }

  // ================================================================== "Sorun": sipariş masası
  const CHECKS = [
    { cond: 'son instanceof KoliGonderisi ?', res: '→ new KoliGonderisi(k.getAlici(), …)' },
    { cond: 'son instanceof ZarfGonderisi ?', res: '→ new ZarfGonderisi(z.getAlici(), …)' },
    { cond: 'başka bir tür?', res: '→ throw IllegalArgumentException' },
  ];

  class DeskStage {
    constructor(root) {
      this.uid = 'pds' + ++uidCounter;
      this.el = DP.h('div', { class: 'fm-stage pt-stage pt-desk' });
      root.appendChild(this.el);
      this.el.innerHTML = this._markup();
      this.k = {};
      DP.$$('[data-k]', this.el).forEach((n) => (this.k[n.getAttribute('data-k')] = n));
    }

    _markup() {
      const u = this.uid;
      const rows = CHECKS.map(
        (c, i) => `<g class="ds-row" data-k="row${i}" transform="translate(286,${96 + i * 62})">
          <rect class="ds-row-bg" x="-6" y="-24" width="370" height="54" rx="8"/>
          <circle class="ds-dot" cx="12" cy="-6" r="11"/><text class="ds-mark" x="12" y="-1" text-anchor="middle" data-k="mark${i}">?</text>
          <text class="ds-cond" x="32" y="-1">${esc(c.cond)}</text>
          <text class="ds-res" x="32" y="21">${esc(c.res)}</text></g>`
      ).join('');
      return `
<svg class="fm-svg pt-svg" viewBox="0 0 960 470" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Sipariş masası: instanceof panosu, yavaş adres servisi ve sıfırdan kurulan kopya">
  <defs>
    <marker id="${u}-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="mk-spot" d="M0 0 L10 5 L0 10 z"/></marker>
  </defs>
  ${room()}

  <!-- sol: geçen haftanın gönderisi -->
  <g class="ds-plaque"><rect x="34" y="34" width="200" height="30" rx="6"/><text x="134" y="55" text-anchor="middle">GEÇEN HAFTA</text></g>
  <path class="ds-shelf-br" d="M52 300 V322 H76 M216 300 V322 H192"/>
  <rect class="ds-shelf" x="30" y="296" width="208" height="10" rx="3"/>
  <g class="ds-item" data-k="item" transform="translate(66,296)"><g class="ds-item-in" data-k="item-in"></g></g>
  <g class="ds-tag" data-k="tag"><rect x="30" y="334" width="208" height="28" rx="14"/><text x="134" y="353" text-anchor="middle" data-k="tag-t">son : KoliGonderisi</text></g>
  <text class="ds-content" x="134" y="384" text-anchor="middle" data-k="content">A4 kağıt, toner</text>

  <!-- orta: SiparisEkrani panosu + masa -->
  <g class="ds-board" data-k="board">
    <rect class="ds-board-bg" x="270" y="22" width="390" height="236" rx="12"/>
    <text class="ds-board-t" x="286" y="50">SiparisEkrani.tekrarla(son)</text>
    <path class="ds-board-line" d="M282 62 H648"/>
    ${rows}
  </g>
  <rect class="tb-top" x="300" y="356" width="330" height="12" rx="3"/>
  <path class="tb-leg" d="M318 368 V400 M612 368 V400"/>
  <g class="ds-monitor">
    <rect class="ds-mon" x="392" y="276" width="146" height="74" rx="6"/>
    <rect class="ds-mon-scr" x="399" y="283" width="132" height="58" rx="3"/>
    <rect class="ds-btn" data-k="btn" x="408" y="297" width="114" height="30" rx="6"/>
    <text class="ds-btn-t" x="465" y="316" text-anchor="middle">↻ Geçen haftakini</text>
    <path class="ds-stand" d="M458 350 V356 M472 350 V356"/>
  </g>
  <path class="ds-flow" data-k="flow-in" d="M206 236 C 240 236, 246 150, 268 150" marker-end="url(#${u}-a)"/>
  <path class="ds-flow" data-k="flow-out" d="M662 150 C 720 150, 760 210, 800 268" marker-end="url(#${u}-a)"/>

  <!-- sağ üst: yavaş adres servisi -->
  <g class="ds-svc" data-k="svc">
    <rect class="ds-svc-bg" x="694" y="22" width="246" height="92" rx="12"/>
    <g transform="translate(714,40)"><rect class="ds-srv" x="0" y="0" width="34" height="14" rx="3"/><rect class="ds-srv" x="0" y="18" width="34" height="14" rx="3"/><rect class="ds-srv" x="0" y="36" width="34" height="14" rx="3"/>
      <circle class="ds-led" cx="27" cy="7" r="2.5"/><circle class="ds-led" cx="27" cy="25" r="2.5"/><circle class="ds-led" cx="27" cy="43" r="2.5"/></g>
    <text class="ds-svc-t" x="760" y="52">AdresServisi</text>
    <text class="ds-svc-s" x="760" y="74">yavaş · ~2 sn / sorgu</text>
    <text class="ds-svc-n" x="924" y="98" text-anchor="end" data-k="svc-n">0</text>
    <text class="ds-svc-l" x="760" y="98">sorgu sayısı:</text>
  </g>
  <path class="ds-call" data-k="svc-call" d="M840 116 V262"/>
  <g data-k="hg" transform="translate(860,190)">${art.hourglass()}</g>

  <!-- sağ: sıfırdan kurulan kopya -->
  <rect class="ds-plat" x="712" y="372" width="220" height="12" rx="3"/>
  <g class="ds-new" data-k="new" transform="translate(760,372)"><g class="ds-new-in" data-k="new-in"></g></g>
  <g class="ds-tag ds-newtag" data-k="newtag"><rect x="692" y="404" width="260" height="28" rx="14"/><text x="822" y="423" text-anchor="middle" data-k="newtag-t">kopya</text></g>
  <g class="bl-crash pt-crash" data-k="crash" transform="translate(822,300)"><g class="bl-crash-in">
    <path d="M0 -46 L12 -18 L42 -30 L24 -4 L52 10 L20 16 L28 44 L4 24 L-14 50 L-12 18 L-46 22 L-22 0 L-44 -24 L-12 -16 Z"/>
    <text x="0" y="6" text-anchor="middle">HATA!</text></g></g>

  ${bubbleFo('left', 18, 70, 250, 130)}
  ${bubbleFo('right', 676, 118, 270, 140)}
</svg>`;
    }

    /**
     * st: {item: cargo, checks: ['ok'|'no'|'err'|null ×3], result: {cargo, state:'new'|'err'} | null,
     *      svc: {n, busy}, hl: 'board'|'svc'|null, bubble: {at:'left'|'right', text, tone}}
     */
    render(st, prev, o) {
      const k = this.k;
      const anim = !!(o && o.animate);
      prev = prev || {};
      const g = st.item;
      const itemKey = g ? g.k + '|' + g.alici : '';
      const prevKey = prev.item ? prev.item.k + '|' + prev.item.alici : '';
      if (itemKey !== this._itemKey) {
        k['item-in'].innerHTML = g ? art.item(g) : '';
        this._itemKey = itemKey;
        if (anim && itemKey !== prevKey) DP.flash(k['item-in'], 'is-arrive');
      }
      k.tag.classList.toggle('is-on', !!g);
      if (g) {
        k['tag-t'].textContent = 'son : ' + PT.ALT[g.k].cls;
        k.tag.setAttribute('class', 'ds-tag is-on rc rc-3');
        k.content.textContent = 'içerik: ' + g.icerik.join(', ');
      } else k.content.textContent = '';

      // instanceof panosu
      (st.checks || [null, null, null]).forEach((c, i) => {
        const row = k['row' + i];
        row.classList.toggle('is-ok', c === 'ok');
        row.classList.toggle('is-no', c === 'no');
        row.classList.toggle('is-err', c === 'err');
        k['mark' + i].textContent = c === 'ok' ? '✓' : c === 'no' ? '✗' : c === 'err' ? '!' : '?';
        const was = (prev.checks || [])[i];
        if (anim && c && c !== was) DP.flash(row, 'is-flash');
      });
      k.board.classList.toggle('is-hl', st.hl === 'board');
      k.board.classList.toggle('is-err', (st.checks || []).includes('err'));
      k.btn.classList.toggle('is-press', !!st.press);
      if (anim && st.press && !prev.press) DP.flash(k.btn, 'is-click');

      // adres servisi
      const svc = st.svc || { n: 0 };
      k['svc-n'].textContent = String(svc.n);
      if (anim && prev.svc && prev.svc.n !== svc.n) DP.flash(k['svc-n'], 'is-bump');
      k.svc.classList.toggle('is-hl', st.hl === 'svc');
      k.svc.classList.toggle('is-busy', !!svc.busy);
      k['svc-call'].classList.toggle('is-on', !!svc.busy);
      k.hg.classList.toggle('is-on', !!svc.busy);

      // sağ: yeni nesne
      const r = st.result;
      const rKey = r ? r.state + '|' + (r.cargo ? r.cargo.k + r.cargo.alici : '') : '';
      if (rKey !== this._rKey) {
        k['new-in'].innerHTML = r && r.state === 'new' ? art.item(r.cargo) : '';
        this._rKey = rKey;
        if (anim && r && r.state === 'new') DP.flash(k['new-in'], 'is-build');
      }
      k.newtag.classList.toggle('is-on', !!r && r.state === 'new');
      if (r && r.state === 'new') k['newtag-t'].textContent = 'yeni : ' + PT.ALT[r.cargo.k].cls + ' (sıfırdan)';
      k.crash.classList.toggle('is-on', !!r && r.state === 'err');
      if (anim && r && r.state === 'err' && !(prev.result && prev.result.state === 'err')) DP.flash(k.crash, 'is-bursting');
      k['flow-in'].classList.toggle('is-on', !!g && !!(st.checks || []).some(Boolean));
      k['flow-out'].classList.toggle('is-on', !!r);
      k['flow-out'].classList.toggle('is-bad', !!r && r.state === 'err');
      renderBubbles(k, ['left', 'right'], st.bubble);
    }

    destroy() {
      this.el.remove();
    }
  }
  PT.DeskStage = DeskStage;

  // ================================================================== "Sığ ↔ Derin": depo
  const SLOT = { s: 80, b: 420, g: 760 }; // kutuların ön yüz sol kenarı
  const CARD = { L1: 60, L2: 400, L3: 740 }; // panoların sol kenarı
  const NAME = { s: 'sablon', b: 'buHafta', g: 'gelecekHafta' };
  const CARD_Y = 52;
  const BOX_Y = 392;
  PT.SLOT = SLOT;
  PT.NAME = NAME;

  class ShelfStage {
    constructor(root) {
      this.uid = 'pss' + ++uidCounter;
      this.el = DP.h('div', { class: 'fm-stage pt-stage pt-shelf' });
      root.appendChild(this.el);
      this.el.innerHTML = `
<svg class="fm-svg pt-svg" viewBox="0 0 960 470" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Depo: kutular, içerik panoları ve aralarındaki ipler">
  ${room()}
  <g class="ss-hud" data-k="hud"><rect x="684" y="6" width="266" height="30" rx="15"/>
    <text x="700" y="26">AdresServisi · sorgu:</text><text class="ss-hud-n" x="934" y="26" text-anchor="end" data-k="hud-n">0</text></g>
  <g data-k="hud-hg" class="ss-hud-hg" transform="translate(668,21) scale(0.8)">${art.hourglass()}</g>
  <g class="ss-cords" data-k="cords"></g>
  <g data-k="cards"></g>
  <g data-k="boxes"></g>
  ${bubbleFo('mid', 200, 196, 560, 96, 'pt-banner')}
</svg>`;
      this.k = {};
      DP.$$('[data-k]', this.el).forEach((n) => (this.k[n.getAttribute('data-k')] = n));
    }

    /**
     * st: {objs: {s|b|g: 'building'|'ready'}, lists: {L1|L2|L3: [..]}, ref: {s,b,g → L*},
     *      bad: bool (şablon kirlendi), added: {list, item}, active: 's'|'b'|'g', copying: 'b'|'g',
     *      svc: {n, busy}, bubble: {at:'mid'|'low', text, tone}}
     */
    render(st, prev, o) {
      const k = this.k;
      const anim = !!(o && o.animate);
      prev = prev || {};
      const objs = st.objs || {};
      const lists = st.lists || {};
      const pObjs = prev.objs || {};
      const pLists = prev.lists || {};

      // panolar
      k.cards.innerHTML = Object.keys(lists)
        .map((id) => {
          const items = lists[id];
          const fresh = anim && !pLists[id];
          const bad = !!st.bad && id === st.ref.s;
          const hl = st.added && st.added.list === id ? st.added.item : null;
          const dx = fresh ? CARD.L1 - CARD[id] : 0;
          return `<g class="ss-card${fresh ? ' is-entering' : ''}${bad ? ' is-bad' : ''}" transform="translate(${CARD[id]},${CARD_Y})" style="--dx:${dx}px">
            <g class="ss-card-in">${art.listCard(items, { title: 'İÇERİK · liste #' + id.slice(1), hl, bad: bad && !!hl })}</g></g>`;
        })
        .join('');

      // ipler: kutunun tepesinden panonun altına
      k.cords.innerHTML = Object.keys(objs)
        .filter((ob) => st.ref && st.ref[ob] && lists[st.ref[ob]])
        .map((ob) => {
          const id = st.ref[ob];
          const x1 = CARD[id] + 80;
          const y1 = CARD_Y + art.listH(lists[id].length) - 4;
          const x2 = SLOT[ob] + 68;
          const y2 = BOX_Y - 98;
          const sag = Math.abs(x2 - x1) > 40 ? 46 : 14;
          const changed = anim && (!prev.ref || prev.ref[ob] !== id || !pObjs[ob]);
          const shared = Object.keys(objs).filter((x) => st.ref[x] === id).length > 1;
          return `<path class="ss-cord${changed ? ' is-new' : ''}${shared ? ' is-shared' : ''}${st.bad && shared ? ' is-bad' : ''}" d="M${x1} ${y1} Q ${(x1 + x2) / 2} ${Math.max(y1, y2) + sag} ${x2} ${y2}" pathLength="100"/>
            <circle class="ss-knot" cx="${x1}" cy="${y1}" r="4.5"/><circle class="ss-knot" cx="${x2}" cy="${y2}" r="4.5"/>`;
        })
        .join('');

      // kutular
      k.boxes.innerHTML = Object.keys(objs)
        .map((ob) => {
          const state = objs[ob];
          const fresh = anim && !pObjs[ob];
          const dx = fresh && ob !== 's' ? SLOT.s - SLOT[ob] : 0;
          const bad = ob === 's' && !!st.bad;
          const cls = ['ss-box', 'is-' + state];
          if (fresh) cls.push(ob === 's' ? 'is-born' : 'is-entering');
          if (bad) cls.push('is-bad');
          if (st.active === ob) cls.push('is-active');
          if (st.copying && ob === 's') cls.push('is-copying');
          return `<g class="${cls.join(' ')}" transform="translate(${SLOT[ob]},${BOX_Y})" style="--dx:${dx}px">
            <g class="ss-box-in">${art.koli({ label: 'Ayşe K.', kg: 12, ribbon: ob === 's' ? 'ŞABLON' : null })}</g>
            <g class="ss-name"><rect x="-10" y="14" width="156" height="26" rx="13"/><text x="68" y="32" text-anchor="middle">${NAME[ob]}</text></g>
            ${bad ? '<g class="ss-alarm"><rect x="-6" y="-150" width="150" height="26" rx="13"/><text x="69" y="-132" text-anchor="middle">şablon kirlendi!</text></g>' : ''}
          </g>`;
        })
        .join('');
      if (anim && st.copying && !(prev.copying === st.copying)) {
        const src = DP.$('.ss-box.is-copying', k.boxes);
        if (src) DP.flash(src, 'is-flash');
      }

      const svc = st.svc || { n: 0 };
      k['hud-n'].textContent = String(svc.n);
      if (anim && prev.svc && prev.svc.n !== svc.n) DP.flash(k['hud-n'], 'is-bump');
      k['hud-hg'].classList.toggle('is-on', !!svc.busy);
      renderBubbles(k, ['mid'], st.bubble);
    }

    destroy() {
      this.el.remove();
    }
  }
  PT.ShelfStage = ShelfStage;

  // ================================================================== bellek görünümü düzenleri
  const ROW = DP.MemoryView.ROW;
  const boxH = (n) => DP.MemoryView.HEAD + Math.max(1, n) * ROW + 8;

  /**
   * Sığ ↔ Derin sahnesinin bellek fotoğrafı (ShelfStage ile aynı durumdan).
   * st: {vars: {sablon, buHafta, gelecekHafta}, objs, lists, ref, frame: {title, sub, rows}, building, bad, added, hl}
   */
  PT.memKopya = function (st) {
    const OY = { s: 46, b: 200, g: 354 };
    const LY = { L1: 46, L2: 200, L3: 354 };
    const boxes = [];
    const vars = st.vars || {};
    const mainRows = ['sablon', 'buHafta', 'gelecekHafta'].filter((v) => vars[v]).map((v) => ({ id: v, k: v, ref: vars[v], tone: 3 }));
    boxes.push({ id: 'f-main', kind: 'frame', x: 24, y: 46, w: 262, title: 'main()', sub: 'Main', tone: 1, rows: mainRows, empty: 'henüz yerel değişken yok', active: !st.frame });
    if (st.frame) boxes.push({ id: 'f-call', kind: 'frame', x: 24, y: 46 + boxH(Math.max(1, mainRows.length)) + 22, w: 262, title: st.frame.title, sub: st.frame.sub || '', tone: st.frame.tone || 3, rows: st.frame.rows || [], active: true });

    const objs = st.objs || {};
    const lists = st.lists || {};
    ['s', 'b', 'g'].forEach((ob, i) => {
      if (!objs[ob]) return;
      const building = objs[ob] === 'building';
      const rows = [];
      const f = (st.fields || {})[ob] || (building ? {} : { alici: 1, icerik: 1, agirlik: 1 });
      rows.push({ id: 'alici', k: 'alici', v: f.alici ? '"Ayşe Kırtasiye"' : 'null', hl: st.hl === ob + '.alici' });
      rows.push(f.icerik && st.ref && st.ref[ob] ? { id: 'icerik', k: 'icerik', ref: st.ref[ob], tone: 5, hl: st.hl === ob + '.icerik' } : { id: 'icerik', k: 'icerik', ref: null });
      rows.push({ id: 'agirlik', k: 'agirlik', v: f.agirlik ? '12' : '0', hl: st.hl === ob + '.agirlik' });
      const bad = ob === 's' && st.bad;
      boxes.push({
        id: ob,
        kind: 'obj',
        x: 350,
        y: OY[ob],
        w: 262,
        title: 'KoliGonderisi',
        sub: 'nesne #' + (i + 1),
        tone: 3,
        state: building ? 'building' : bad ? 'bad' : null,
        badge: bad ? 'şablon kirlendi!' : st.badges && st.badges[ob],
        active: st.active === ob,
        rows,
      });
    });
    Object.keys(lists).forEach((id) => {
      const items = lists[id];
      // listeyi gösteren nesneler: hazır olanlar ya da kurulurken icerik alanı atanmış olanlar
      const users = Object.keys(objs).filter((ob) => st.ref && st.ref[ob] === id && (objs[ob] !== 'building' || ((st.fields || {})[ob] || {}).icerik)).length;
      const bad = st.bad && st.ref && id === st.ref.s;
      boxes.push({
        id,
        kind: 'obj',
        x: 712,
        y: LY[id],
        w: 256,
        title: 'ArrayList',
        sub: 'liste #' + id.slice(1),
        tone: 5,
        state: bad ? 'bad' : null,
        badge: st.listBadges && st.listBadges[id] ? st.listBadges[id] : users > 1 ? users + ' nesne paylaşıyor' : null,
        rows: items.map((it, j) => ({ id: 'i' + j, k: '[' + j + ']', v: '"' + it + '"', tone: st.added && st.added.list === id && st.added.item === it ? (bad ? 'bad' : 'ok') : null, hl: st.added && st.added.list === id && st.added.item === it })),
        empty: 'boş liste',
      });
    });
    return {
      view: [0, 0, 1000, 520],
      label: 'Bellek görünümü: yığındaki değişkenler, heap’teki gönderi nesneleri ve listeler',
      regions: [
        { x: 10, y: 10, w: 290, h: 500, title: 'Yığın (stack) · yerel değişkenler', cls: 'r-stack' },
        { x: 320, y: 10, w: 670, h: 500, title: 'Heap · nesneler', cls: 'r-heap' },
      ],
      boxes,
      notes: st.notes || [],
    };
  };

  /**
   * clone() sahnesinin bellek fotoğrafı.
   * st: {sayac, vars: {sablon, kopya}, objs: {k1, k2: {takipNo, list, state, badge}}, lists: {L1, L2}, frame, bad, notes}
   */
  PT.memKlon = function (st) {
    const boxes = [];
    const vars = st.vars || {};
    const mainRows = ['sablon', 'kopya'].filter((v) => vars[v]).map((v) => ({ id: v, k: v, ref: vars[v], tone: 3 }));
    boxes.push({ id: 'f-main', kind: 'frame', x: 24, y: 46, w: 262, title: 'main()', sub: 'Main', tone: 1, rows: mainRows, empty: 'henüz yerel değişken yok', active: !st.frame });
    if (st.frame) boxes.push({ id: 'f-call', kind: 'frame', x: 24, y: 46 + boxH(Math.max(1, mainRows.length)) + 22, w: 262, title: st.frame.title, sub: st.frame.sub || '', tone: 3, rows: st.frame.rows || [], active: true });
    boxes.push({ id: 'st', kind: 'static', x: 24, y: 382, w: 262, title: 'Koli', sub: 'sınıf', tone: 3, rows: [{ id: 'sayac', k: 'static sayac', v: String(st.sayac || 1000), hl: !!st.hlSayac }] });
    const OY = { k1: 46, k2: 236 };
    const LY = { L1: 46, L2: 236 };
    Object.keys(st.objs || {}).forEach((id, i) => {
      const ob = st.objs[id];
      boxes.push({
        id,
        kind: 'obj',
        x: 350,
        y: OY[id],
        w: 262,
        title: 'Koli',
        sub: 'nesne #' + (i + 1),
        tone: 3,
        state: ob.state || null,
        badge: ob.badge || null,
        active: !!ob.active,
        rows: [
          { id: 'takipNo', k: 'takipNo', v: '"' + ob.takipNo + '"', tone: ob.dupNo ? 'bad' : null, hl: !!ob.hlNo },
          { id: 'alici', k: 'alici', v: '"Ayşe Kırtasiye"' },
          { id: 'icerik', k: 'icerik', ref: ob.list, tone: 5, hl: !!ob.hlList },
        ],
      });
    });
    Object.keys(st.lists || {}).forEach((id) => {
      const items = st.lists[id];
      const users = Object.keys(st.objs || {}).filter((o) => st.objs[o].list === id).length;
      boxes.push({
        id,
        kind: 'obj',
        x: 712,
        y: LY[id],
        w: 256,
        title: 'ArrayList',
        sub: 'liste #' + id.slice(1),
        tone: 5,
        state: st.badList === id ? 'bad' : null,
        badge: users > 1 ? users + ' nesne paylaşıyor' : null,
        rows: items.map((it, j) => ({ id: 'i' + j, k: '[' + j + ']', v: '"' + it + '"', tone: st.added && st.added.list === id && st.added.item === it ? (st.badList === id ? 'bad' : 'ok') : null })),
      });
    });
    return {
      view: [0, 0, 1000, 520],
      label: 'Bellek görünümü: clone() ile kopyalanan koliler',
      regions: [
        { x: 10, y: 10, w: 290, h: 350, title: 'Yığın (stack) · yerel değişkenler', cls: 'r-stack' },
        { x: 10, y: 370, w: 290, h: 140, title: 'Sınıf alanı (static)', cls: 'r-static' },
        { x: 320, y: 10, w: 670, h: 500, title: 'Heap · nesneler', cls: 'r-heap' },
      ],
      boxes,
      notes: st.notes || [],
    };
  };

  // ================================================================== "Katalog": şablon rafı (HTML)
  const ICON_VIEW = { koli: '-4 -104 148 108', zarf: '-4 -84 138 88', palet: '-4 -88 158 92' };
  PT.itemIcon = (g, o) => `<svg class="kt-ic" viewBox="${ICON_VIEW[g.k]}" aria-hidden="true">${art.item(g, o)}</svg>`;

  class CatalogStage {
    constructor(root) {
      this.el = DP.h('div', { class: 'kt-stage' });
      root.appendChild(this.el);
      this.el.innerHTML = `
        <section class="kt-shelf">
          <header class="kt-head"><span class="kt-obj">katalog : SablonKatalogu</span><code>Map&lt;String, Gonderi&gt; sablonlar</code></header>
          <div class="kt-slots" data-k="slots"></div>
        </section>
        <div class="kt-call" data-k="call"></div>
        <section class="kt-out">
          <header class="kt-head"><span class="kt-obj kt-cli">Main · teslim tezgâhı</span><span class="kt-hint">olustur(ad) → kopya</span></header>
          <div class="kt-copies" data-k="copies"></div>
        </section>`;
      this.k = {};
      DP.$$('[data-k]', this.el).forEach((n) => (this.k[n.getAttribute('data-k')] = n));
    }

    /**
     * st: {slots: [{ad, g, state:'ghost'|'on'|'new'|'gone'|'bad'}], call: 'md', copies: [{ad, g, extra, tone, note}], hl: ad}
     */
    render(st, prev, o) {
      const anim = !!(o && o.animate);
      prev = prev || {};
      const pSlots = new Map((prev.slots || []).map((s) => [s.ad, s.state]));
      this.k.slots.innerHTML = st.slots
        .map((s) => {
          const g = s.g;
          const fresh = anim && pSlots.get(s.ad) !== s.state && (s.state === 'new' || s.state === 'bad');
          if (s.state === 'ghost')
            return `<div class="kt-card is-ghost"><div class="kt-q">?</div><div class="kt-name">"${esc(s.ad)}"</div><div class="kt-sub">çalışma anında eklenecek</div></div>`;
          if (s.state === 'gone')
            return `<div class="kt-card is-gone"><div class="kt-q">⌀</div><div class="kt-name">"${esc(s.ad)}"</div><div class="kt-sub">şablonun KENDİSİ verildi!</div></div>`;
          return `<div class="kt-card rc rc-3 is-${s.state}${s.ad === st.hl ? ' is-hl' : ''}${fresh ? ' is-pop' : ''}">
            ${s.state === 'new' ? '<span class="kt-badge">YENİ · sınıf yok</span>' : ''}
            ${PT.itemIcon(g)}
            <div class="kt-name">"${esc(s.ad)}"</div>
            <div class="kt-sub">${esc(PT.ALT[g.k].cls)}</div>
            <div class="kt-items${s.state === 'bad' ? ' is-bad' : ''}">${esc(g.icerik.join(', '))}</div>
          </div>`;
        })
        .join('');
      this.k.call.innerHTML = st.call ? `<span class="kt-arrow">▼</span> ${md(st.call)} <span class="kt-arrow">▼</span>` : '';
      this.k.call.classList.toggle('is-on', !!st.call);
      if (anim && st.call && st.call !== prev.call) DP.flash(this.k.call, 'is-pop');
      const pCopies = (prev.copies || []).length;
      this.k.copies.innerHTML = (st.copies || []).length
        ? st.copies
            .map((c, i) => {
              const g = c.g;
              return `<div class="kt-copy rc rc-3${c.tone ? ' is-' + c.tone : ''}${anim && i >= pCopies ? ' is-new' : ''}">
                ${PT.itemIcon(g)}
                <div class="kt-copy-body"><div class="kt-name">${esc(c.label || 'kopya')}</div>
                <div class="kt-line"><code>${esc(PT.describe(g))}</code></div>
                ${c.note ? `<div class="kt-note">${md(c.note)}</div>` : ''}</div>
              </div>`;
            })
            .join('')
        : '<div class="kt-empty">Henüz bir şey istenmedi. Şablonlar rafta bekliyor.</div>';
    }

    destroy() {
      this.el.remove();
    }
  }
  PT.CatalogStage = CatalogStage;
})();
