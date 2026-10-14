/*
 * Singleton — bellek görünümünün hazır düzenleri (yığın · sınıf alanı · heap).
 * Çizim bileşeni ortaktır: DP.MemoryView (js/core/memory-view.js).
 */
(function () {
  'use strict';
  const SG = DP.sg;

  const ROW = DP.MemoryView.ROW;

  // Görünüm bileşeni artık ortak: js/core/memory-view.js (Prototype da kullanır).
  SG.MemoryView = DP.MemoryView;

  // ------------------------------------------------------------------ hazır düzenler
  // Kökler (yığın + sınıf alanı) solda, nesneler sağda: oklar hep soldan sağa gider, kutuların üstünden geçmez.
  SG.memRegions = [
    { x: 10, y: 10, w: 300, h: 324, title: 'Yığın (stack) · yerel değişkenler', cls: 'r-stack' },
    { x: 10, y: 346, w: 300, h: 164, title: 'Sınıf alanı (static)', cls: 'r-static' },
    { x: 330, y: 10, w: 660, h: 500, title: 'Heap · nesneler', cls: 'r-heap' },
  ];
  SG.MEM_ROW = ROW;

  /**
   * Lojistik senaryosunun bellek fotoğrafı.
   * o: {mode:'problem'|'single', services:['sip','iade'], svcRef:{sip:'g1', iade:'g2'},
   *     gens:{g1:{sayac, state, badge, label}, g2:{…}}, ornek:'g1'|null,
   *     main:{siparis, iade, a, b}, frame:{title, sub, rows}, activeFrame, hl:{ornek}, notes}
   */
  SG.memSpec = function (o) {
    const boxes = [];
    const mainRows = [];
    const m = o.main || {};
    if (m.siparis) mainRows.push({ id: 'siparis', k: 'siparis', ref: 'sip', tone: 1 });
    if (m.iade) mainRows.push({ id: 'iade', k: 'iade', ref: 'iade', tone: 1 });
    if (m.a) mainRows.push({ id: 'a', k: 'a', ref: m.a, tone: 2 });
    if (m.b) mainRows.push({ id: 'b', k: 'b', ref: m.b, tone: 2 });
    boxes.push({ id: 'f-main', kind: 'frame', x: 26, y: 46, w: 268, title: 'main()', sub: 'Main', tone: 1, rows: mainRows, empty: 'henüz yerel değişken yok', active: o.activeFrame === 'main' });
    if (o.frame) boxes.push({ id: 'f-call', kind: 'frame', x: 26, y: 96 + Math.max(1, mainRows.length) * ROW + 16, w: 268, title: o.frame.title, sub: o.frame.sub || '', tone: 1, rows: o.frame.rows || [], active: true });

    const statRows = o.mode === 'single' ? [{ id: 'ornek', k: 'static ornek', ref: o.ornek || null, tone: 3, hl: o.hl && o.hl.ornek }] : [];
    boxes.push({ id: 'st', kind: 'static', x: 26, y: 382, w: 268, title: 'TakipNoUretici', sub: 'sınıf', tone: 2, rows: statRows, empty: 'static alan yok' });

    const services = o.services || [];
    const gens = o.gens || {};
    const gen = (gid, x, y) => {
      const g = gens[gid];
      return { id: gid, kind: 'obj', x, y, w: 270, title: 'TakipNoUretici', sub: g.label || (gid === 'g1' ? 'nesne #1' : 'nesne #2'), tone: 2, state: g.state, badge: g.badge, rows: [{ id: 'sayac', k: 'sayac', v: String(g.sayac) }] };
    };
    if (o.mode === 'problem') {
      // üç sütun: kökler | servisler | üreticiler (servis → üretici okları kısa ve yatay)
      const svcRows = (key) => [{ id: 'uretici', k: 'uretici', ref: (o.svcRef && o.svcRef[key]) || null, tone: 2 }];
      if (services.includes('sip')) boxes.push({ id: 'sip', kind: 'obj', x: 352, y: 60, w: 260, title: 'SiparisServisi', sub: 'nesne', tone: 1, rows: svcRows('sip') });
      if (services.includes('iade')) boxes.push({ id: 'iade', kind: 'obj', x: 352, y: 230, w: 260, title: 'IadeServisi', sub: 'nesne', tone: 1, rows: svcRows('iade') });
      if (gens.g1) boxes.push(gen('g1', 690, 60));
      if (gens.g2) boxes.push(gen('g2', 690, 230));
    } else {
      // tek nesne sütunu: üretici ortada, servisler üstte ve altta
      if (services.includes('sip')) boxes.push({ id: 'sip', kind: 'obj', x: 640, y: 46, w: 270, title: 'SiparisServisi', sub: 'nesne', tone: 1, rows: [], empty: 'alan yok — üretici tutmuyor' });
      if (gens.g1) boxes.push(gen('g1', 640, 196));
      if (services.includes('iade')) boxes.push({ id: 'iade', kind: 'obj', x: 640, y: 372, w: 270, title: 'IadeServisi', sub: 'nesne', tone: 1, rows: [], empty: 'alan yok — üretici tutmuyor' });
    }
    return { view: [0, 0, 1000, 520], regions: SG.memRegions, boxes, notes: o.notes || [] };
  };
})();
