/*
 * MemoryView — bellek görünümü (yığın · sınıf alanı · heap).
 * "Kaç nesne var, kim hangisini gösteriyor?" sorusunun görseli: referans okları nesnelere gider.
 * Singleton (tek nesne) ve Prototype (sığ ↔ derin kopya) sahneleri kullanır.
 *
 * new DP.MemoryView(root, {cls, flashAdded, spreadArrows})
 *   flashAdded   : var olan bir kutuya yeni eklenen satır da parlasın (ör. listeye eklenen eleman)
 *   spreadArrows : aynı kutuya gelen oklar kutunun kenarında yan yana dursun (üst üste binmesin)
 *
 * update(spec, {animate}):
 *   spec = {
 *     view: [x, y, w, h],
 *     regions: [{x, y, w, h, title, cls}],                       // arka plandaki bölgeler
 *     boxes: [{id, x, y, w, kind:'frame'|'static'|'obj', title, sub, tone, state, active, badge, empty,
 *              rows:[{id, k, v, ref, tone, hl, dashed}]}],        // ref → başka bir kutunun id'si (ok çizilir)
 *     lock: {at, owner, waiting:[], jvm, note},                   // isteğe bağlı kilit rozeti
 *     notes: [{x, y, text, tone, anchor}]
 *   }
 * Önceki çizimle karşılaştırılır: yeni kutular "doğar", hedefi değişen oklar yeniden çizilir.
 */
(function () {
  'use strict';
  const esc = DP.esc;

  const HEAD = 30; // kutu başlığı yüksekliği
  const ROW = 28; // satır yüksekliği

  let uid = 0;

  class MemoryView {
    constructor(root, o) {
      o = o || {};
      this.o = o;
      this.uid = 'mem' + ++uid;
      this.el = DP.h('div', { class: 'mem-view' + (o.cls ? ' ' + o.cls : '') });
      root.appendChild(this.el);
      this.prev = null;
    }

    _boxH(b) {
      return HEAD + Math.max(1, (b.rows || []).length) * ROW + 8;
    }

    update(spec, o) {
      o = o || {};
      const anim = o.animate !== false && !!this.prev;
      const prevBoxes = this.prev ? new Map(this.prev.boxes.map((b) => [b.id, b])) : new Map();
      const prevRefs = new Map();
      if (this.prev) this.prev.boxes.forEach((b) => (b.rows || []).forEach((r) => prevRefs.set(b.id + '/' + (r.id || r.k), r)));
      const boxes = new Map(spec.boxes.map((b) => [b.id, b]));
      const u = this.uid;

      const regions = (spec.regions || [])
        .map(
          (r) => `<g class="mem-region ${r.cls || ''}"><rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="14"/>
          <text class="mem-region-t" x="${r.x + 14}" y="${r.y + 22}">${esc(r.title)}</text></g>`
        )
        .join('');

      // ---- kutular
      const anchors = {}; // satır → ok başlangıcı
      const boxSvg = spec.boxes
        .map((b) => {
          const hgt = this._boxH(b);
          const old = prevBoxes.get(b.id);
          const cls = ['mem-box', 'k-' + (b.kind || 'obj')];
          if (b.tone) cls.push('rc', 'rc-' + b.tone);
          if (b.state) cls.push('is-' + b.state);
          if (b.active) cls.push('is-active');
          if (anim && !old) cls.push('is-entering');
          const rows = (b.rows || [])
            .map((r, i) => {
              const y = b.y + HEAD + 6 + i * ROW;
              const key = b.id + '/' + (r.id || r.k);
              const pr = prevRefs.get(key);
              const changed = anim && ((pr && (pr.v !== r.v || pr.ref !== r.ref)) || (!pr && old && this.o.flashAdded));
              let val;
              if (r.ref !== undefined) {
                anchors[key] = { x: b.x + b.w - 18, y: y + ROW / 2 - 2, ref: r.ref, tone: r.tone || b.tone, key, changed: anim && (!pr || pr.ref !== r.ref), dashed: r.dashed };
                val = r.ref
                  ? `<circle class="mem-dot" cx="${b.x + b.w - 18}" cy="${y + ROW / 2 - 2}" r="5.5"/>`
                  : `<text class="mem-null" x="${b.x + b.w - 14}" y="${y + ROW / 2 + 3}" text-anchor="end">null</text>`;
              } else {
                val = `<text class="mem-v" x="${b.x + b.w - 14}" y="${y + ROW / 2 + 3}" text-anchor="end">${esc(r.v == null ? '' : r.v)}</text>`;
              }
              return `<g class="mem-row${changed ? ' is-changed' : ''}${r.tone ? ' rc rc-' + r.tone : ''}${r.hl ? ' is-hl' : ''}">
                <rect class="mem-row-bg" x="${b.x + 6}" y="${y}" width="${b.w - 12}" height="${ROW - 4}" rx="6"/>
                <text class="mem-k" x="${b.x + 14}" y="${y + ROW / 2 + 3}">${esc(r.k)}</text>${val}</g>`;
            })
            .join('');
          const empty = !(b.rows || []).length ? `<text class="mem-empty" x="${b.x + b.w / 2}" y="${b.y + HEAD + 22}" text-anchor="middle">${esc(b.empty || 'alan yok')}</text>` : '';
          return `<g class="${cls.join(' ')}" data-id="${esc(b.id)}"><g class="mem-box-in">
            <rect class="mem-box-bg" x="${b.x}" y="${b.y}" width="${b.w}" height="${hgt}" rx="10"/>
            <path class="mem-box-head" d="M${b.x} ${b.y + HEAD} V${b.y + 10} Q${b.x} ${b.y} ${b.x + 10} ${b.y} H${b.x + b.w - 10} Q${b.x + b.w} ${b.y} ${b.x + b.w} ${b.y + 10} V${b.y + HEAD} Z"/>
            <text class="mem-title" x="${b.x + 12}" y="${b.y + 20}">${esc(b.title)}</text>
            ${b.sub ? `<text class="mem-sub" x="${b.x + b.w - 12}" y="${b.y + 20}" text-anchor="end">${esc(b.sub)}</text>` : ''}
            ${rows}${empty}
            ${b.badge ? `<g class="mem-badge" transform="translate(${b.x + b.w - 8},${b.y - 25})"><g class="mem-badge-in"><rect x="${-b.badge.length * 7.2 - 18}" y="0" width="${b.badge.length * 7.2 + 18}" height="21" rx="10.5"/><text x="${-(b.badge.length * 7.2 + 18) / 2}" y="15" text-anchor="middle">${esc(b.badge)}</text></g></g>` : ''}
          </g></g>`;
        })
        .join('');

      // ---- oklar (satırdan hedef kutuya)
      const live = Object.values(anchors).filter((a) => a.ref && boxes.has(a.ref));
      // spreadArrows: aynı kutuya soldan gelen okların uçları kenar boyunca yan yana dizilir
      const spread = new Map();
      if (this.o.spreadArrows) {
        const byTarget = new Map();
        live.forEach((a) => {
          const t = boxes.get(a.ref);
          if (t.x < a.x + 10) return;
          if (!byTarget.has(a.ref)) byTarget.set(a.ref, []);
          byTarget.get(a.ref).push(a);
        });
        byTarget.forEach((list, id) => {
          if (list.length < 2) return;
          const t = boxes.get(id);
          const span = Math.min(this._boxH(t) - 16, (list.length - 1) * 16);
          list.sort((p, q) => p.y - q.y).forEach((a, k) => spread.set(a.key, t.y + 12 + (list.length > 1 ? (span * k) / (list.length - 1) : 0)));
        });
      }
      const arrows = live
        .map((a) => {
          const t = boxes.get(a.ref);
          const th = this._boxH(t);
          let ex;
          let ey = spread.has(a.key) ? spread.get(a.key) : t.y + Math.min(HEAD / 2 + 4, th / 2);
          let d;
          if (t.x >= a.x + 10) {
            ex = t.x - 2;
            const dx = Math.max(40, (ex - a.x) * 0.5);
            d = `M${a.x} ${a.y} C${a.x + dx} ${a.y}, ${ex - dx} ${ey}, ${ex} ${ey}`;
          } else if (t.x + t.w <= a.x - 30) {
            // hedef solda: üstten dolaş
            ex = t.x + t.w + 2;
            d = `M${a.x} ${a.y} C${a.x + 60} ${a.y}, ${ex + 60} ${ey}, ${ex} ${ey}`;
          } else {
            // hedef altta ya da üstte: kutunun üst/alt kenarına
            ex = t.x + t.w / 2;
            const below = t.y > a.y;
            ey = below ? t.y - 2 : t.y + th + 2;
            d = `M${a.x} ${a.y} C${a.x + 70} ${a.y}, ${ex} ${below ? ey - 60 : ey + 60}, ${ex} ${ey}`;
          }
          return `<path class="mem-arrow${a.tone ? ' rc rc-' + a.tone : ''}${a.changed ? ' is-new' : ''}${a.dashed ? ' is-dashed' : ''}" d="${d}" pathLength="100" marker-end="url(#${u}-m${a.tone || 0})"/>`;
        })
        .join('');

      // ---- kilit rozeti
      let lock = '';
      if (spec.lock && boxes.has(spec.lock.at)) {
        const b = boxes.get(spec.lock.at);
        const L = spec.lock;
        const x = b.x + b.w + 14;
        const y = b.y + 2;
        const owner = L.owner ? `<text class="lk-owner th-${L.owner}" x="${x + 40}" y="${y + 19}">${L.jvm ? 'JVM · ' : ''}sahibi: ${esc(L.owner)}</text>` : `<text class="lk-owner" x="${x + 40}" y="${y + 19}">serbest</text>`;
        const wait = (L.waiting || []).length ? `<text class="lk-wait" x="${x + 40}" y="${y + 39}">⏳ bekleyen: ${esc(L.waiting.join(', '))}</text>` : '';
        const note = L.note ? `<text class="lk-note" x="${x + 40}" y="${y + (wait ? 59 : 39)}">${esc(L.note)}</text>` : '';
        lock = `<g class="mem-lock${L.owner ? ' is-held' : ''}${anim && !(this.prev && this.prev.lock && this.prev.lock.owner === L.owner) ? ' is-flip' : ''}">
          <g class="lk-ic" transform="translate(${x},${y})"><path class="lk-shackle" d="M7 13 V8 a9 9 0 0 1 18 0 V${L.owner ? 13 : 6}"/><rect class="lk-body" x="2" y="12" width="28" height="22" rx="5"/><circle class="lk-hole" cx="16" cy="23" r="3"/></g>
          ${owner}${wait}${note}</g>`;
      }

      const notes = (spec.notes || [])
        .map((n) => `<text class="mem-note${n.tone ? ' is-' + n.tone : ''}" x="${n.x}" y="${n.y}" text-anchor="${n.anchor || 'start'}">${esc(n.text)}</text>`)
        .join('');

      const markers = [0, 1, 2, 3, 4, 5, 6, 't1', 't2', 'bad', 'ok']
        .map((c) => `<marker id="${u}-m${c}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="mem-mk${c ? ' rc rc-' + c : ''}" d="M0 0 L10 5 L0 10 z"/></marker>`)
        .join('');
      const v = spec.view || [0, 0, 1000, 520];
      this.el.innerHTML = `<svg class="mem-svg" viewBox="${v.join(' ')}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${esc(spec.label || 'Bellek görünümü: yığın, sınıf alanı ve heap')}">
        <defs>${markers}</defs>${regions}<g class="mem-arrows">${arrows}</g>${boxSvg}${lock}${notes}</svg>`;
      this.prev = JSON.parse(JSON.stringify(spec));
    }

    reset() {
      this.prev = null;
    }

    destroy() {
      this.el.remove();
    }
  }

  MemoryView.HEAD = HEAD;
  MemoryView.ROW = ROW;
  DP.MemoryView = MemoryView;
})();
