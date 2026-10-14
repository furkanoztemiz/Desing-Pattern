/*
 * Ortak "lojistik dünyası": Factory Method ve Abstract Factory sahnelerinin paylaştığı
 * SVG çizimleri, araç hareket yolları ve arka plan (gökyüzü, zemin, yol/deniz/pist, varış noktaları).
 * Araçların yerel orijini: sol-alt köşe (zemine/su hattına temas noktası), sağa bakar.
 */
(function () {
  'use strict';
  const L = (DP.lojistik = DP.lojistik || {});
  const art = (L.art = {});

  // ================================================================== araçlar
  art.truck = () => `
    <g class="art-truck">
      <rect class="v-cargo" x="0" y="-50" width="64" height="38" rx="3"/>
      <rect class="v-stripe" x="0" y="-24" width="64" height="4"/>
      <path class="v-cab" d="M66 -36 h18 q4 0 6 3 l9 12 q2 3 2 6 v3 h-35 z"/>
      <path class="v-window" d="M71 -32 h12 l7 10 h-19 z"/>
      <rect class="v-chassis" x="-2" y="-13" width="104" height="6" rx="2"/>
      <circle class="v-wheel" cx="17" cy="-6" r="7.5"/><circle class="v-hub" cx="17" cy="-6" r="2.6"/>
      <circle class="v-wheel" cx="83" cy="-6" r="7.5"/><circle class="v-hub" cx="83" cy="-6" r="2.6"/>
      <rect class="v-light" x="98" y="-19" width="3.5" height="4" rx="1"/>
    </g>`;

  art.ship = () => `
    <g class="art-ship">
      <rect class="v-box c1" x="14" y="-36" width="22" height="16" rx="1.5"/>
      <rect class="v-box c2" x="38" y="-36" width="22" height="16" rx="1.5"/>
      <rect class="v-box c3" x="62" y="-36" width="22" height="16" rx="1.5"/>
      <rect class="v-box c3" x="26" y="-52" width="22" height="16" rx="1.5"/>
      <rect class="v-box c1" x="50" y="-52" width="22" height="16" rx="1.5"/>
      <rect class="v-funnel" x="99" y="-64" width="9" height="14" rx="1"/>
      <rect class="v-bridge" x="92" y="-50" width="24" height="30" rx="2"/>
      <rect class="v-window" x="95" y="-46" width="18" height="6" rx="1"/>
      <path class="v-hull" d="M0 -20 H132 L118 6 H14 Z"/>
      <rect class="v-stripe" x="7" y="-12" width="119" height="3"/>
    </g>`;

  art.plane = () => `
    <g class="art-plane">
      <path class="v-wing-far" d="M60 -27 L46 -46 H57 L82 -27 Z"/>
      <path class="v-tail" d="M9 -30 L1 -54 H13 L32 -30 Z"/>
      <path class="v-body" d="M6 -22 Q4 -32 16 -32 H108 Q128 -32 136 -22 Q128 -12 108 -12 H16 Q4 -12 6 -22 Z"/>
      <path class="v-window" d="M114 -29 Q126 -28 130 -23 H114 Z"/>
      ${[36, 46, 56, 66, 76, 86, 96].map((x) => `<circle class="v-dot" cx="${x}" cy="-24" r="2.2"/>`).join('')}
      <path class="v-wing" d="M54 -19 L36 -3 H49 L84 -19 Z"/>
      <line class="v-gear" x1="30" y1="-12" x2="30" y2="-4"/><circle class="v-wheel" cx="30" cy="-3" r="3"/>
      <line class="v-gear" x1="104" y1="-12" x2="104" y2="-4"/><circle class="v-wheel" cx="104" cy="-3" r="3"/>
    </g>`;

  art.vehicle = (kind) => (kind === 'ship' ? art.ship() : kind === 'plane' ? art.plane() : art.truck());

  // ================================================================== varış noktaları
  art.depo = () => `
    <g class="art-dest art-depo">
      <path class="b-wall" d="M0 0 V-62 L50 -88 L100 -62 V0 Z"/>
      <path class="b-roof" d="M-6 -59 L50 -92 L106 -59"/>
      <rect class="b-door" x="24" y="-44" width="52" height="44" rx="2"/>
      <path class="b-door-line" d="M24 -33 H76 M24 -22 H76 M24 -11 H76"/>
      <text class="b-label" x="50" y="-53" text-anchor="middle">DEPO</text>
    </g>`;

  art.liman = () => `
    <g class="art-dest art-liman">
      <rect class="b-post" x="12" y="6" width="8" height="40"/>
      <rect class="b-post" x="62" y="6" width="8" height="40"/>
      <rect class="b-post" x="104" y="6" width="8" height="40"/>
      <rect class="b-dock" x="0" y="-6" width="124" height="14" rx="2"/>
      <rect class="v-box c2" x="8" y="-22" width="24" height="16" rx="1.5"/>
      <rect class="v-box c1" x="34" y="-22" width="24" height="16" rx="1.5"/>
      <rect class="v-box c3" x="20" y="-38" width="24" height="16" rx="1.5"/>
      <path class="b-crane" d="M92 -6 V-120 M92 -112 H22 M92 -120 L44 -112 M30 -112 V-70"/>
      <rect class="b-crane-box" x="84" y="-104" width="22" height="16" rx="2"/>
      <rect class="b-hook" x="25" y="-70" width="10" height="7" rx="1"/>
      <text class="b-label" x="62" y="-130" text-anchor="middle">LİMAN</text>
    </g>`;

  art.havalimani = () => `
    <g class="art-dest art-havalimani">
      <rect class="b-terminal" x="0" y="-34" width="74" height="34" rx="3"/>
      <path class="b-glass" d="M8 -26 H66 V-12 H8 Z"/>
      <rect class="b-tower" x="82" y="-104" width="14" height="104"/>
      <path class="b-cab" d="M73 -104 H105 L100 -124 H78 Z"/>
      <path class="b-glass" d="M79 -119 H99 L101 -108 H77 Z"/>
      <text class="b-label" x="50" y="-134" text-anchor="middle">HAVALİMANI</text>
    </g>`;

  art.dest = (kind) => (kind === 'ship' ? art.liman() : kind === 'plane' ? art.havalimani() : art.depo());

  // ================================================================== küçük parçalar
  // Dış grup CSS ile süzülür, iç grup konumlanır (CSS transform, transform özniteliğini ezmesin diye).
  art.cloud = (x, y, s, cls) => `
    <g class="cloud ${cls || ''}"><g transform="translate(${x},${y}) scale(${s || 1})">
      <ellipse cx="0" cy="0" rx="34" ry="13"/><ellipse cx="-20" cy="4" rx="22" ry="11"/>
      <ellipse cx="22" cy="4" rx="24" ry="10"/><ellipse cx="0" cy="-9" rx="20" ry="13"/>
    </g></g>`;

  art.envelope = () => `
    <g class="art-env">
      <rect x="-20" y="-13" width="40" height="26" rx="3"/>
      <path d="M-20 -11 L0 3 L20 -11"/>
    </g>`;

  art.clipboard = () => `
    <g class="art-clip">
      <rect class="c-board" x="0" y="0" width="54" height="66" rx="5"/>
      <rect class="c-paper" x="6" y="9" width="42" height="51" rx="2"/>
      <rect class="c-clip" x="17" y="-5" width="20" height="10" rx="3"/>
      <path class="c-lines" d="M12 22 H42 M12 32 H42 M12 42 H34"/>
    </g>`;

  /** Taşıma belgesi (kâğıt). Orijin: sol-üst köşe, 64×78. data-k ile ad ve damga güncellenir. */
  art.doc = (key) => `
    <g class="art-doc">
      <path class="d-paper" d="M0 0 H50 L64 14 V78 H0 Z"/>
      <path class="d-fold" d="M50 0 V14 H64"/>
      <rect class="d-band" x="6" y="18" width="52" height="17" rx="3"/>
      <text class="d-name" x="32" y="30.5" text-anchor="middle" data-k="${key}-name">CMR</text>
      <path class="d-lines" d="M9 45 H55 M9 53 H55 M9 61 H38"/>
      <g class="d-stamp"><circle cx="47" cy="63" r="11.5"/><text x="47" y="66" text-anchor="middle">ONAY</text></g>
    </g>`;

  /** Belge yazıcısı (Abstract Factory'nin "belge hattı"). Orijin: sol-üst, 70×48. */
  art.printer = () => `
    <g class="art-printer">
      <rect class="p-tray" x="12" y="0" width="46" height="14" rx="2"/>
      <rect class="p-body" x="0" y="10" width="70" height="32" rx="6"/>
      <rect class="p-slot" x="10" y="30" width="50" height="5" rx="2.5"/>
      <circle class="p-led" cx="60" cy="19" r="3.5"/>
    </g>`;

  /** Gümrük kulübesi. Orijin: direk tabanı (zemin), kabin yukarıda. */
  art.customs = () => `
    <g class="art-customs">
      <rect class="cu-pole" x="-4" y="-138" width="8" height="138"/>
      <rect class="cu-cabin" x="-40" y="-186" width="80" height="50" rx="6"/>
      <rect class="cu-glass" x="-32" y="-178" width="40" height="18" rx="3"/>
      <rect class="cu-sign" x="-40" y="-206" width="80" height="20" rx="4"/>
      <text class="cu-sign-t" x="0" y="-191.5" text-anchor="middle">GÜMRÜK</text>
      <circle class="cu-lamp" data-k="lamp" cx="24" cy="-169" r="7"/>
    </g>`;

  /** İstemci ofisi (TeslimatServisi nesnesi). Orijin: sol-alt köşe (zemin), 176×160. */
  art.office = () => `
    <g class="art-office">
      <rect class="o-wall" x="0" y="-150" width="176" height="150" rx="4"/>
      <rect class="o-roof" x="-6" y="-160" width="188" height="14" rx="4"/>
      ${[0, 1, 2]
        .map((c) => [0, 1].map((r) => `<rect class="o-win" x="${18 + c * 52}" y="${-132 + r * 38}" width="36" height="26" rx="3"/>`).join(''))
        .join('')}
      <rect class="o-door" x="70" y="-48" width="36" height="48" rx="3"/>
    </g>`;

  // Küçük ikonlar (24×24) — düğmeler ve rozetler için
  art.icon = function (kind) {
    const paths = {
      truck: '<path d="M1.5 6.5h11.5v9.5H1.5z"/><path d="M13 9.5h4.2l3.3 3.6v2.9H13z"/><circle cx="5.5" cy="17.2" r="2.1"/><circle cx="16.8" cy="17.2" r="2.1"/>',
      ship: '<path d="M2.5 13.5h19l-2.6 5.2H5.1z"/><path d="M6 13.5V9.2h4.6v4.3M11.6 13.5V6.4h4.2v7.1"/><path d="M2 21.2c1.7 0 1.7-.9 3.4-.9s1.7.9 3.4.9 1.7-.9 3.4-.9 1.7.9 3.4.9 1.7-.9 3.4-.9 1.7.9 3 .9" fill="none"/>',
      plane: '<path d="M21.5 14.6 13.8 12V6.1a1.6 1.6 0 1 0-3.2 0V12l-7.7 2.6v2.1l7.7-1.6v3.7l-2.2 1.6v1.5l3.8-1 3.8 1v-1.5l-2.2-1.6v-3.7l7.7 1.6z"/>',
      lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none"/>',
      doc: '<path d="M6 2.5h8.5l4 4V21.5H6z"/><path d="M14.5 2.5v4h4" fill="none"/><path d="M8.5 11h7M8.5 14.5h7M8.5 18h5" fill="none"/>',
    };
    return `<svg class="ic ic-${kind}" viewBox="0 0 24 24" aria-hidden="true">${paths[kind] || ''}</svg>`;
  };

  // ================================================================== hareket yolları
  L.vw = { truck: 104, ship: 132, plane: 136 };

  // Uçak: bantta kısa kalkış koşusu → kavisli uçuş → pistte yatay iniş koşusu (sonunda düz durur).
  function planePath() {
    const pts = [[590, 416], [622, 416]];
    for (let i = 1; i <= 28; i++) {
      const t = i / 28;
      const x = (1 - t) * (1 - t) * 622 + 2 * (1 - t) * t * 668 + t * t * 712;
      const y = (1 - t) * (1 - t) * 416 + 2 * (1 - t) * t * 160 + t * t * 440;
      pts.push([x, y]);
    }
    pts.push([740, 440]);
    return pts;
  }

  // Ürünün banttan varış noktasına izlediği yol (ilk nokta = bant üzerindeki yeri).
  L.paths = {
    truck: [[598, 416], [652, 416], [730, 462], [778, 462]],
    ship: [[592, 416], [640, 416], [700, 452], [746, 452]],
    plane: planePath(),
  };

  L.pointAt = function (pts, t) {
    const segs = [];
    let total = 0;
    for (let i = 1; i < pts.length; i++) {
      const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      segs.push(d);
      total += d;
    }
    let target = Math.max(0, Math.min(1, t)) * total;
    for (let i = 0; i < segs.length; i++) {
      if (target <= segs[i] || i === segs.length - 1) {
        const u = segs[i] ? Math.min(1, target / segs[i]) : 1;
        const a = pts[i];
        const b = pts[i + 1];
        return { x: a[0] + (b[0] - a[0]) * u, y: a[1] + (b[1] - a[1]) * u };
      }
      target -= segs[i];
    }
    const last = pts[pts.length - 1];
    return { x: last[0], y: last[1] };
  };

  /** Aracı yolunun t (0..1) noktasına yerleştirir; yokuşta hafifçe eğer. */
  L.placeVehicle = function (el, kind, t) {
    const pts = L.paths[kind];
    const p = L.pointAt(pts, t);
    const a = L.pointAt(pts, t - 0.035);
    const b = L.pointAt(pts, t + 0.035);
    let ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    ang = Math.max(-24, Math.min(24, ang));
    el.setAttribute('transform', `translate(${p.x.toFixed(1)},${p.y.toFixed(1)}) rotate(${ang.toFixed(1)},${L.vw[kind] / 2},0)`);
  };

  function waves(y, amp, step, x0, x1) {
    let d = `M${x0} ${y}`;
    for (let x = x0; x < x1; x += step * 2) d += ` q ${step / 2} ${-amp} ${step} 0 t ${step} 0`;
    return d;
  }

  // ================================================================== sahne arka planı
  /**
   * Gökyüzü, zemin, üç yol (kara/deniz/hava) ve üç varış noktası.
   * Gökyüzü ve yollar viewBox dışına taşacak kadar geniş çizilir: panelin en-boy oranı
   * ne olursa olsun boşluk kalmaz (svg { overflow: visible }).
   * u: belge içinde benzersiz kimlik öneki (gradyan/işaretçi id'leri için).
   */
  L.world = function (u) {
    return `
  <defs>
    <linearGradient id="${u}-sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="432"><stop offset="0" class="sky-1"/><stop offset="1" class="sky-2"/></linearGradient>
    <linearGradient id="${u}-sea" gradientUnits="userSpaceOnUse" x1="0" y1="430" x2="0" y2="560"><stop offset="0" class="sea-1"/><stop offset="1" class="sea-2"/></linearGradient>
    <marker id="${u}-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="mk-spot" d="M0 0 L10 5 L0 10 z"/></marker>
    <marker id="${u}-arrow2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="mk-ref" d="M0 0 L10 5 L0 10 z"/></marker>
  </defs>
  <rect class="sky" x="-1500" y="-1500" width="4000" height="1932" fill="url(#${u}-sky)"/>
  <circle class="sun" cx="935" cy="60" r="24"/>
  ${art.cloud(150, 54, 0.9, 'c1')}${art.cloud(470, 30, 0.65, 'c2')}${art.cloud(790, 96, 0.95, 'c3')}
  <rect class="ground" x="-1500" y="430" width="4000" height="1500"/>
  <g class="lane" data-k="lane-truck">
    <rect class="road" x="590" y="436" width="1900" height="50"/>
    <path class="road-edge" d="M590 436 H2490 M590 486 H2490"/>
    <path class="road-dash" d="M600 461 H2490"/>
  </g>
  <g class="lane" data-k="lane-ship">
    <rect class="sea" x="590" y="430" width="1900" height="1500" fill="url(#${u}-sea)"/>
    <path class="wave w1" d="${waves(448, 5, 20, 590, 2500)}"/>
    <path class="wave w2" d="${waves(476, 4, 26, 580, 2500)}"/>
    <path class="wave w1" d="${waves(502, 4, 22, 590, 2500)}"/>
    <rect class="quay" x="556" y="430" width="38" height="1500"/>
  </g>
  <g class="lane" data-k="lane-plane">
    <rect class="runway" x="596" y="440" width="1900" height="18" rx="2"/>
    <path class="runway-dash" d="M606 449 H2490"/>
  </g>
  <g class="dest-g" data-k="dest-truck" transform="translate(884,436)">${art.depo()}</g>
  <g class="dest-g" data-k="dest-ship" transform="translate(876,430)">${art.liman()}</g>
  <g class="dest-g" data-k="dest-plane" transform="translate(884,440)">${art.havalimani()}</g>`;
  };

  /** Fabrika kapısından çıkan taşıma bandı. */
  L.belt = function () {
    const rollers = [566, 586, 606, 626, 646, 666, 686, 706, 726].map((x) => `<circle class="roller" cx="${x}" cy="423" r="4.2"/>`).join('');
    return `
  <g class="belt" data-k="belt">
    <rect class="belt-body" x="552" y="416" width="186" height="14" rx="7"/>
    <path class="belt-top" d="M560 417.5 H732"/>
    ${rollers}
  </g>`;
  };

  /** Ürün (araç) grubu: üç araç çizimi + "arac : Kamyon" etiketi. extra: aracın üstüne eklenecek SVG. */
  L.vehicle = function (extra) {
    return `
  <g class="veh-wrap" data-k="veh" transform="translate(598,416)">
    <g class="veh-inner" data-k="veh-inner">
      <g class="veh" data-k="veh-truck">${art.truck()}</g>
      <g class="veh" data-k="veh-ship">${art.ship()}</g>
      <g class="veh" data-k="veh-plane">${art.plane()}</g>
      <g class="veh-tag" data-k="veh-tag" transform="translate(0,-86)">
        <rect data-k="veh-tag-bg" width="140" height="26" rx="13"/>
        <text x="12" y="18" data-k="veh-tag-text">arac : Kamyon</text>
      </g>
      ${extra || ''}
    </g>
  </g>`;
  };

  /** Yol, varış noktası ve araç çizimini seçilen türe (truck/ship/plane) göre açar. */
  L.applyKind = function (k, kind) {
    ['truck', 'ship', 'plane'].forEach((x) => {
      const on = x === kind;
      ['veh-', 'lane-', 'dest-'].forEach((p) => k[p + x] && k[p + x].classList.toggle('is-on', on));
    });
  };

  /** "arac : Kamyon" etiketini ve genişliğini günceller. */
  L.setTag = function (k, text) {
    k['veh-tag-text'].textContent = text;
    k['veh-tag-bg'].setAttribute('width', String(Math.ceil(text.length * 8.6 + 26)));
  };
})();
