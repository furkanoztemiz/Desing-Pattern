/*
 * ClassDiagram — SVG tabanlı UML sınıf diyagramı.
 * - Kalıtım (generalization), gerçekleme (realization), bağımlılık, «create» ilişkileri
 * - Rol etiketleri ve rol renkleri
 * - "Genel (GoF)" ↔ "Somut örnek" adlandırma geçişi
 * - Vurgulama, rozetler, ilişki üzerinde ilerleyen "yürütme jetonu" animasyonu
 */
(function () {
  'use strict';
  const { s } = DP;

  const LH = 21; // satır yüksekliği
  const PADY = 8;
  const PADX = 12;
  const CHAR = 8.45; // 14px eş aralıklı yazı için yaklaşık karakter genişliği
  const RADIUS = 7;

  const dist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
  const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

  function roundTop(w, hh, r) {
    return `M0 ${hh} V${r} Q0 0 ${r} 0 H${w - r} Q${w} 0 ${w} ${r} V${hh} Z`;
  }

  function roundedPath(pts, r) {
    let d = `M${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const p0 = pts[i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const d1 = dist(p0, p1);
      const d2 = dist(p1, p2);
      const rr = Math.min(r, d1 / 2, d2 / 2);
      const a = lerp(p1, p0, d1 ? rr / d1 : 0);
      const b = lerp(p1, p2, d2 ? rr / d2 : 0);
      d += ` L${a.x} ${a.y} Q${p1.x} ${p1.y} ${b.x} ${b.y}`;
    }
    const last = pts[pts.length - 1];
    return d + ` L${last.x} ${last.y}`;
  }

  /**
   * Köşeleri yuvarlatılmış yol + kesişme noktalarında küçük "atlama" kavisleri.
   * hops: [{seg, x}] — yatay `seg` parçası, x konumunda dikey bir çizgiyi kesiyor.
   */
  function pathWithHops(pts, hops, r) {
    if (!hops || !hops.length) return roundedPath(pts, r);
    const R = 6;
    const n = pts.length;
    const corners = [];
    for (let i = 1; i < n - 1; i++) {
      const p0 = pts[i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const d1 = dist(p0, p1);
      const d2 = dist(p1, p2);
      const rr = Math.min(r, d1 / 2, d2 / 2);
      corners[i] = { a: lerp(p1, p0, d1 ? rr / d1 : 0), b: lerp(p1, p2, d2 ? rr / d2 : 0) };
    }
    let d = `M${pts[0].x} ${pts[0].y}`;
    for (let s = 0; s < n - 1; s++) {
      const start = s === 0 ? pts[0] : corners[s].b;
      const end = s === n - 2 ? pts[n - 1] : corners[s + 1].a;
      const xs = Array.from(new Set(hops.filter((hp) => hp.seg === s).map((hp) => Math.round(hp.x * 10) / 10)));
      if (xs.length && Math.abs(start.y - end.y) < 0.5) {
        const dir = end.x >= start.x ? 1 : -1;
        xs.sort((p, q) => dir * (p - q));
        for (const x of xs) {
          if ((x - start.x) * dir < R + 2 || (end.x - x) * dir < R + 2) continue;
          d += ` L${x - dir * R} ${start.y} A${R} ${R} 0 0 ${dir > 0 ? 1 : 0} ${x + dir * R} ${start.y}`;
        }
      }
      d += ` L${end.x} ${end.y}`;
      if (s < n - 2) d += ` Q${pts[s + 1].x} ${pts[s + 1].y} ${corners[s + 1].b.x} ${corners[s + 1].b.y}`;
    }
    return d;
  }

  function route(p1, side1, p2, side2, mid) {
    const h1 = side1 === 'left' || side1 === 'right';
    const h2 = side2 === 'left' || side2 === 'right';
    if (h1 && h2) {
      if (Math.abs(p1.y - p2.y) < 0.5) return [p1, p2];
      const mx = mid != null ? mid : (p1.x + p2.x) / 2;
      return [p1, { x: mx, y: p1.y }, { x: mx, y: p2.y }, p2];
    }
    if (!h1 && !h2) {
      if (Math.abs(p1.x - p2.x) < 0.5) return [p1, p2];
      const my = mid != null ? mid : (p1.y + p2.y) / 2;
      return [p1, { x: p1.x, y: my }, { x: p2.x, y: my }, p2];
    }
    if (h1) return [p1, { x: p2.x, y: p1.y }, p2];
    return [p1, { x: p1.x, y: p2.y }, p2];
  }

  class ClassDiagram {
    /**
     * @param root kapsayıcı
     * @param spec {width,height,classes,relations,notes}
     * @param opts {roles, roleTags, mode, onSelect}
     */
    constructor(root, spec, opts) {
      this.opts = Object.assign({ roles: {}, roleTags: true, mode: 'concrete', onSelect: null }, opts || {});
      this.mode = this.opts.mode;
      this.hidden = new Set();
      this.hiddenEdges = new Set();
      this.cancels = [];
      this.svg = s('svg', {
        class: 'uml' + (this.opts.roleTags ? ' show-tags' : ''),
        viewBox: `0 0 ${spec.width} ${spec.height}`,
        role: 'img',
        'aria-label': spec.title || 'UML sınıf diyagramı',
      });
      root.appendChild(this.svg);
      this.spec = spec;
      (spec.classes || []).forEach((c) => c.hidden && this.hidden.add(c.id));
      (spec.relations || []).forEach((r) => r.hidden && this.hiddenEdges.add(r.id));
      this._renderAll();
    }

    // ------------------------------------------------------------ çizim
    _renderAll() {
      this.svg.innerHTML = '';
      this.gEdges = s('g', { class: 'uml-edges' });
      this.gNotes = s('g', { class: 'uml-notes' });
      this.gClasses = s('g', { class: 'uml-classes' });
      this.gFx = s('g', { class: 'uml-fx' });
      this.svg.append(this.gEdges, this.gNotes, this.gClasses, this.gFx);
      this.boxes = new Map();
      this.edges = new Map();
      this.notes = new Map();
      for (const c of this.spec.classes || []) this._renderClass(c);
      for (const r of this.spec.relations || []) this._renderEdge(r);
      for (const n of this.spec.notes || []) this._renderNote(n);
      this._applyVisibility();
      this._applyMode(false);
      this._fit();
    }

    /**
     * viewBox'ı içeriğe göre daraltır (boş kenarlar gitsin, yazılar büyüsün).
     * Gizli sınıflar da hesaba katılır; böylece görünürlük değişince diyagram zıplamaz.
     */
    _fit() {
      const sp = this.spec;
      if (sp.view) {
        this.svg.setAttribute('viewBox', sp.view.join(' '));
        return;
      }
      if (this.opts.fit === false) return;
      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;
      const add = (x, y) => {
        x0 = Math.min(x0, x);
        y0 = Math.min(y0, y);
        x1 = Math.max(x1, x);
        y1 = Math.max(y1, y);
      };
      // fitVisible: yalnızca görünen sınıflar (ör. sonradan eklenen bir aile görünür olunca diyagram genişler)
      const skip = (id) => sp.fitVisible && this.hidden.has(id);
      for (const b of this.boxes.values()) {
        if (skip(b.c.id)) continue;
        add(b.x, b.y - (this.opts.roleTags && !b.c.ghost ? 27 : 0));
        add(b.x + b.w, b.y + b.h);
      }
      for (const e of this.edges.values()) {
        if (sp.fitVisible && e.g.classList.contains('is-hidden')) continue;
        e.pts.forEach((p) => add(p.x, p.y));
        if (e.labelEl && e.r.labelAt) add(e.r.labelAt[0], e.r.labelAt[1] - 14);
      }
      for (const nt of this.notes.values()) {
        if (sp.fitVisible && nt.g.classList.contains('is-hidden')) continue;
        add(nt.box.x, nt.box.y);
        add(nt.box.x + nt.box.w, nt.box.y + nt.box.h);
      }
      if (!isFinite(x0)) return;
      const pad = 12;
      this.svg.setAttribute('viewBox', `${x0 - pad} ${y0 - pad} ${x1 - x0 + pad * 2} ${y1 - y0 + pad * 2}`);
    }

    _text(c, key, mode) {
      // key: 'name' ya da üye nesnesi
      if (typeof key === 'string') return mode === 'generic' && c.generic ? c.generic : c.name;
      return mode === 'generic' && key.generic ? key.generic : key.text;
    }

    _renderClass(c) {
      const role = this.opts.roles[c.role] || null;
      const color = role ? role.color : 0;
      const members = c.members || [];
      const stereo = c.stereo || (c.kind === 'interface' ? '«interface»' : c.kind === 'abstract' ? '«abstract»' : null);
      const lengths = [c.name.length, (c.generic || '').length, stereo ? stereo.length : 0];
      members.forEach((m) => lengths.push(m.text.length, (m.generic || '').length));
      const w = c.w || Math.max(150, Math.ceil(Math.max(...lengths) * CHAR + PADX * 2 + 4));
      const headerH = PADY * 2 + (stereo ? 2 : 1) * LH - 2;
      const membersH = members.length ? PADY * 2 + members.length * LH - 2 : 14;
      const hgt = c.ghost ? c.h || 76 : headerH + membersH;

      const outer = s('g', {
        class: `uml-class kind-${c.kind || 'class'}${c.ghost ? ' is-ghost' : ''}${color ? ' rc rc-' + color : ''}`,
        transform: `translate(${c.x},${c.y})`,
        'data-id': c.id,
      });
      // İç grup: CSS animasyonları (giriş, vurgu) konum dönüşümünü bozmadan buna uygulanır.
      const g = s('g', { class: 'uml-inner' });
      outer.appendChild(g);
      g.appendChild(s('rect', { class: 'uml-ring', x: -6, y: -6, width: w + 12, height: hgt + 12, rx: RADIUS + 5 }));

      const box = { c, x: c.x, y: c.y, w, h: hgt, g: outer, members: new Map() };

      if (c.ghost) {
        g.appendChild(s('rect', { class: 'uml-box', width: w, height: hgt, rx: RADIUS }));
        g.appendChild(s('text', { class: 'uml-ghost-text', x: w / 2, y: hgt / 2 + 5, 'text-anchor': 'middle' }, c.ghostText || '+ yeni sınıf?'));
        if (this.opts.onSelect) {
          outer.classList.add('is-clickable');
          outer.addEventListener('click', () => this.opts.onSelect(c.id));
        }
        this.gClasses.appendChild(outer);
        this.boxes.set(c.id, box);
        return;
      }

      if (role) {
        const label = `${role.en} · ${role.tr}`;
        const tw = Math.ceil(label.length * 6.9 + 18);
        g.appendChild(
          s(
            'g',
            { class: 'uml-tag', transform: 'translate(0,-25)' },
            s('rect', { width: tw, height: 20, rx: 10 }),
            s('text', { x: 9, y: 14 }, label)
          )
        );
      }

      g.appendChild(s('rect', { class: 'uml-box', width: w, height: hgt, rx: RADIUS }));
      g.appendChild(s('path', { class: 'uml-head', d: roundTop(w, headerH, RADIUS) }));
      let ty = PADY + 15;
      if (stereo) {
        g.appendChild(s('text', { class: 'uml-stereo', x: w / 2, y: ty, 'text-anchor': 'middle' }, stereo));
        ty += LH;
      }
      box.nameEl = s('text', { class: 'uml-name', x: w / 2, y: ty, 'text-anchor': 'middle' }, c.name);
      g.appendChild(box.nameEl);
      g.appendChild(s('line', { class: 'uml-sep', x1: 0, x2: w, y1: headerH, y2: headerH }));

      members.forEach((m, i) => {
        const my = headerH + PADY + i * LH;
        const mg = s('g', {
          class:
            'uml-member' +
            (m.abstract ? ' is-abstract' : '') +
            (m.factory ? ' is-factory' : '') +
            (m.static ? ' is-static' : '') + // UML: static üyelerin altı çizilir
            (m.color ? ' is-tinted rc rc-' + m.color : ''),
          'data-member': m.id || '',
        });
        mg.appendChild(s('rect', { class: 'uml-member-hl', x: 4, y: my - 1, width: w - 8, height: LH, rx: 4 }));
        const t = s('text', { x: PADX, y: my + 15 }, m.text);
        mg.appendChild(t);
        if (m.factory) {
          mg.appendChild(s('circle', { class: 'uml-fm-dot', cx: w - 12, cy: my + LH / 2 - 1, r: 4.5 }));
        }
        g.appendChild(mg);
        box.members.set(m.id || 'm' + i, { g: mg, text: t, m });
      });

      if (this.opts.onSelect) {
        outer.classList.add('is-clickable');
        outer.addEventListener('click', () => this.opts.onSelect(c.id));
      }
      this.gClasses.appendChild(outer);
      this.boxes.set(c.id, box);
    }

    _anchor(b, side, at) {
      switch (side) {
        case 'top':
          return { x: at != null ? at : b.x + b.w / 2, y: b.y };
        case 'bottom':
          return { x: at != null ? at : b.x + b.w / 2, y: b.y + b.h };
        case 'left':
          return { x: b.x, y: at != null ? at : b.y + b.h / 2 };
        default:
          return { x: b.x + b.w, y: at != null ? at : b.y + b.h / 2 };
      }
    }

    _autoSides(a, b) {
      const dx = b.x + b.w / 2 - (a.x + a.w / 2);
      const dy = b.y + b.h / 2 - (a.y + a.h / 2);
      if (Math.abs(dy) > Math.abs(dx)) return dy < 0 ? ['top', 'bottom'] : ['bottom', 'top'];
      return dx > 0 ? ['right', 'left'] : ['left', 'right'];
    }

    _renderEdge(r) {
      const a = this.boxes.get(r.from);
      const b = this.boxes.get(r.to);
      if (!a || !b) return;
      const sides = this._autoSides(a, b);
      const fs = r.fromSide || sides[0];
      const ts = r.toSide || sides[1];
      const p1 = this._anchor(a, fs, r.fromAt);
      const p2 = this._anchor(b, ts, r.toAt);
      const pts = r.points ? [p1].concat(r.points.map(([x, y]) => ({ x, y })), [p2]) : route(p1, fs, p2, ts, r.mid);

      const type = r.type || 'dependency';
      const triangle = type === 'generalization' || type === 'realization';
      const nesting = type === 'nesting'; // iç sınıf: dış sınıf ucunda ⊕
      const dashed = type !== 'generalization' && type !== 'association' && !nesting;
      const end = pts[pts.length - 1];
      const prev = pts[pts.length - 2];
      const len = dist(prev, end) || 1;
      const dir = { x: (end.x - prev.x) / len, y: (end.y - prev.y) / len };
      const nrm = { x: -dir.y, y: dir.x };
      const lpts = pts.slice();
      let head;
      if (triangle) {
        const base = { x: end.x - dir.x * 15, y: end.y - dir.y * 15 };
        lpts[lpts.length - 1] = base;
        head = s('polygon', {
          class: 'uml-head-tri',
          points: `${end.x},${end.y} ${base.x + nrm.x * 8.5},${base.y + nrm.y * 8.5} ${base.x - nrm.x * 8.5},${base.y - nrm.y * 8.5}`,
        });
      } else if (nesting) {
        // UML iç içe sınıf gösterimi: dış sınıfa değen artı işaretli daire
        const R = 8;
        const c = { x: end.x - dir.x * R, y: end.y - dir.y * R };
        lpts[lpts.length - 1] = { x: end.x - dir.x * R * 2, y: end.y - dir.y * R * 2 };
        head = s(
          'g',
          { class: 'uml-head-nest' },
          s('circle', { cx: c.x, cy: c.y, r: R }),
          s('path', { d: `M${c.x - R} ${c.y} H${c.x + R} M${c.x} ${c.y - R} V${c.y + R}` })
        );
      } else {
        const bx = end.x - dir.x * 12;
        const by = end.y - dir.y * 12;
        head = s('polyline', {
          class: 'uml-head-open',
          points: `${bx + nrm.x * 6.5},${by + nrm.y * 6.5} ${end.x},${end.y} ${bx - nrm.x * 6.5},${by - nrm.y * 6.5}`,
        });
      }
      const path = s('path', { class: 'uml-line' + (dashed ? ' is-dashed' : ''), d: roundedPath(lpts, 10) });
      const g = s('g', { class: `uml-edge type-${type}${r.ghost ? ' is-ghost' : ''}${r.tone ? ' tone-' + r.tone : ''}`, 'data-id': r.id }, path, head);

      let labelEl = null;
      if (r.label) {
        // en uzun parçanın ortasına yerleştir
        let best = 0;
        let bi = 0;
        for (let i = 0; i < pts.length - 1; i++) {
          const d = dist(pts[i], pts[i + 1]);
          if (d > best) {
            best = d;
            bi = i;
          }
        }
        const m = lerp(pts[bi], pts[bi + 1], 0.5);
        const horizontal = Math.abs(pts[bi].y - pts[bi + 1].y) < 1;
        const lp = r.labelAt ? { x: r.labelAt[0], y: r.labelAt[1] } : horizontal ? { x: m.x, y: m.y - 8 } : { x: m.x + 9, y: m.y + 4 };
        labelEl = s(
          'text',
          { class: 'uml-elabel', x: lp.x, y: lp.y, 'text-anchor': r.labelAt || horizontal ? 'middle' : 'start' },
          r.label
        );
        g.appendChild(labelEl);
      }
      this.gEdges.appendChild(g);
      this.edges.set(r.id, { r, g, path, labelEl, from: r.from, to: r.to, pts, lpts, hopKey: '[]' });
    }

    /** Görünür çizgilerin kesişimlerine atlama kavisi ekler (görünürlük değiştikçe yeniden hesaplanır). */
    _updateHops() {
      if (this.opts.hops === false) return;
      const visible = Array.from(this.edges.values()).filter((e) => !e.g.classList.contains('is-hidden'));
      const vsegs = [];
      visible.forEach((e) => {
        for (let i = 0; i < e.lpts.length - 1; i++) {
          const a = e.lpts[i];
          const b = e.lpts[i + 1];
          if (Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) > 1) vsegs.push({ id: e.r.id, x: a.x, y1: Math.min(a.y, b.y), y2: Math.max(a.y, b.y) });
        }
      });
      for (const e of this.edges.values()) {
        const hops = [];
        if (!e.g.classList.contains('is-hidden')) {
          for (let i = 0; i < e.lpts.length - 1; i++) {
            const a = e.lpts[i];
            const b = e.lpts[i + 1];
            if (Math.abs(a.y - b.y) >= 0.5) continue;
            const x1 = Math.min(a.x, b.x);
            const x2 = Math.max(a.x, b.x);
            for (const v of vsegs) {
              if (v.id !== e.r.id && v.x > x1 + 10 && v.x < x2 - 10 && a.y > v.y1 + 3 && a.y < v.y2 - 3) hops.push({ seg: i, x: v.x });
            }
          }
        }
        const key = JSON.stringify(hops);
        if (key !== e.hopKey) {
          e.hopKey = key;
          e.path.setAttribute('d', pathWithHops(e.lpts, hops, 10));
        }
      }
    }

    _renderNote(n) {
      const lines = n.text.split('\n');
      const glines = (n.genericText || n.text).split('\n');
      const w = n.w || Math.max(...lines.concat(glines).map((l) => l.length)) * 7.8 + 26;
      const hgt = Math.max(lines.length, glines.length) * 18 + 16;
      const g = s('g', { class: 'uml-note', transform: `translate(${n.x},${n.y})`, 'data-id': n.id });
      g.appendChild(s('path', { class: 'uml-note-box', d: `M0 0 H${w - 12} L${w} 12 V${hgt} H0 Z` }));
      g.appendChild(s('path', { class: 'uml-note-fold', d: `M${w - 12} 0 V12 H${w}` }));
      const textEls = lines.concat(glines.slice(lines.length).map(() => '')).map((l, i) => {
        const t = s('text', { x: 10, y: 22 + i * 18, 'xml:space': 'preserve' }, l);
        g.appendChild(t);
        return t;
      });
      const target = this.boxes.get(n.target);
      if (target) {
        const nb = { x: n.x, y: n.y, w, h: hgt };
        const p1 = this._anchor(nb, n.from || 'left');
        const p2 = this._anchor(target, n.to || 'right', n.toAt);
        this.gNotes.appendChild(s('line', { class: 'uml-note-link', x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y }));
      }
      this.gNotes.appendChild(g);
      this.notes.set(n.id, { n, g, textEls, box: { x: n.x, y: n.y, w, h: hgt } });
    }

    // ------------------------------------------------------------ görünürlük
    setHidden(ids, hidden) {
      [].concat(ids).forEach((id) => (hidden ? this.hidden.add(id) : this.hidden.delete(id)));
      this._applyVisibility();
      if (this.spec.fitVisible) this._fit();
    }

    setEdgeHidden(ids, hidden) {
      [].concat(ids).forEach((id) => (hidden ? this.hiddenEdges.add(id) : this.hiddenEdges.delete(id)));
      this._applyVisibility();
    }

    _applyVisibility() {
      for (const [id, b] of this.boxes) b.g.classList.toggle('is-hidden', this.hidden.has(id));
      for (const [id, e] of this.edges) {
        e.g.classList.toggle('is-hidden', this.hiddenEdges.has(id) || this.hidden.has(e.from) || this.hidden.has(e.to));
      }
      for (const nt of this.notes.values()) nt.g.classList.toggle('is-hidden', this.hidden.has(nt.n.target));
      this._updateHops();
    }

    // ------------------------------------------------------------ adlandırma kipi
    setMode(mode) {
      if (mode === this.mode) return;
      this.mode = mode;
      // Metin hemen değişir; solma yalnızca görsel bir CSS animasyonudur.
      // (Zamanlayıcıya bağlı gizle/göster, sekme arka plandayken metni boş bırakabiliyordu.)
      this._applyMode();
      DP.flash(this.svg, 'is-swapped');
    }

    _applyMode() {
      const mode = this.mode;
      this.svg.classList.toggle('is-generic', mode === 'generic');
      for (const b of this.boxes.values()) {
        if (b.nameEl) b.nameEl.textContent = this._text(b.c, 'name', mode);
        for (const mm of b.members.values()) mm.text.textContent = this._text(b.c, mm.m, mode);
      }
      for (const e of this.edges.values()) {
        if (e.labelEl) e.labelEl.textContent = mode === 'generic' && e.r.genericLabel ? e.r.genericLabel : e.r.label;
      }
      for (const nt of this.notes.values()) {
        if (!nt.n.genericText) continue;
        const lines = (mode === 'generic' ? nt.n.genericText : nt.n.text).split('\n');
        nt.textEls.forEach((t, i) => (t.textContent = lines[i] || ''));
      }
    }

    setRoleTags(on) {
      this.svg.classList.toggle('show-tags', !!on);
    }

    // ------------------------------------------------------------ vurgulama
    /** {classes:[id], members:[[sinif, uye]], edges:[id], dim:true} */
    focus(o) {
      o = o || {};
      this.clearFocus();
      const classes = o.classes || [];
      const members = o.members || [];
      const edges = o.edges || [];
      if (o.dim !== false && (classes.length || members.length || edges.length)) this.svg.classList.add('is-dimmed');
      classes.forEach((id) => {
        const b = this.boxes.get(id);
        if (b) b.g.classList.add('is-focus');
      });
      members.forEach(([cid, mid]) => {
        const b = this.boxes.get(cid);
        if (!b) return;
        b.g.classList.add('is-focus');
        const mm = b.members.get(mid);
        if (mm) mm.g.classList.add('is-focus');
      });
      edges.forEach((id) => {
        const e = this.edges.get(id);
        if (e) e.g.classList.add('is-focus');
      });
    }

    clearFocus() {
      this.svg.classList.remove('is-dimmed');
      DP.$$('.is-focus', this.svg).forEach((el) => el.classList.remove('is-focus'));
    }

    select(id) {
      DP.$$('.is-selected', this.svg).forEach((el) => el.classList.remove('is-selected'));
      const b = id && this.boxes.get(id);
      if (b) b.g.classList.add('is-selected');
    }

    badge(id, text, kind) {
      const b = this.boxes.get(id);
      if (!b) return;
      const old = b.g.querySelector('.uml-badge');
      if (old) old.remove();
      const bw = Math.ceil(text.length * 7.4 + 20);
      // Konum dış grupta; CSS animasyonu iç grupta (transform özniteliği ezilmesin).
      const g = s(
        'g',
        { class: 'uml-badge kind-' + (kind || 'new'), transform: `translate(${b.w - bw + 10},-11)` },
        s('g', { class: 'uml-badge-in' }, s('rect', { width: bw, height: 22, rx: 11 }), s('text', { x: bw / 2, y: 15.5, 'text-anchor': 'middle' }, text))
      );
      b.g.appendChild(g);
    }

    clearBadges() {
      DP.$$('.uml-badge', this.svg).forEach((el) => el.remove());
    }

    /** İlişki boyunca ilerleyen ışıklı jeton. reverse: hedeften kaynağa. */
    travel(edgeId, o) {
      o = o || {};
      const e = this.edges.get(edgeId);
      if (!e || !this.svg.getClientRects().length || DP.reducedMotion) return Promise.resolve();
      let L = 0;
      try {
        L = e.path.getTotalLength();
      } catch (err) {
        return Promise.resolve();
      }
      const dot = s('circle', { class: 'uml-token', r: 8 });
      const halo = s('circle', { class: 'uml-token-halo', r: 16 });
      this.gFx.append(halo, dot);
      return new Promise((resolve) => {
        const cancel = DP.tween({
          duration: DP.dur(o.duration || 1000),
          update: (t) => {
            const p = e.path.getPointAtLength(o.reverse ? L * (1 - t) : L * t);
            dot.setAttribute('cx', p.x);
            dot.setAttribute('cy', p.y);
            halo.setAttribute('cx', p.x);
            halo.setAttribute('cy', p.y);
          },
          done: () => {
            dot.classList.add('is-done');
            halo.classList.add('is-done');
            setTimeout(() => {
              dot.remove();
              halo.remove();
            }, 450);
            resolve();
          },
        });
        this.cancels.push(() => {
          cancel();
          dot.remove();
          halo.remove();
        });
      });
    }

    stopFx() {
      this.cancels.forEach((c) => c());
      this.cancels = [];
      this.gFx.innerHTML = '';
    }

    // ------------------------------------------------------------ yeniden çizim (adım adım değişen diyagramlar)
    update(spec, o) {
      o = o || {};
      const sig = (c) => JSON.stringify([c.kind, c.name, (c.members || []).map((m) => m.text)]);
      const prevBoxes = new Map(Array.from(this.boxes || [], ([id, b]) => [id, sig(b.c)]));
      const prevEdges = new Set(this.edges ? this.edges.keys() : []);
      this.stopFx();
      this.spec = spec;
      this.hidden = new Set((spec.classes || []).filter((c) => c.hidden).map((c) => c.id));
      this.hiddenEdges = new Set((spec.relations || []).filter((r) => r.hidden).map((r) => r.id));
      this._renderAll();
      if (o.animate === false) return;
      for (const [id, b] of this.boxes) {
        if (!prevBoxes.has(id)) b.g.classList.add('is-entering');
        else if (prevBoxes.get(id) !== sig(b.c)) b.g.classList.add('is-changed');
      }
      for (const [id, e] of this.edges) if (!prevEdges.has(id)) e.g.classList.add('is-entering');
    }

    destroy() {
      this.stopFx();
      this.svg.remove();
    }
  }

  DP.ClassDiagram = ClassDiagram;
})();
