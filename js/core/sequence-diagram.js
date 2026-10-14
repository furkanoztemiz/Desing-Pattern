/*
 * SequenceDiagram — adım adım açılan UML sıralama (sequence) diyagramı.
 * Mesaj türleri: call (senkron çağrı), self (kendine çağrı), create («create»), return (dönüş).
 * show(k): 0..k arası mesajları çizer, k. mesajı vurgular.
 */
(function () {
  'use strict';
  const { s } = DP;

  const AW = 14; // aktivasyon çubuğu genişliği
  const DOFF = 7; // iç içe aktivasyon kayması
  const HB = 40; // katılımcı kutusu yüksekliği
  const SELF_DROP = 26;

  class SequenceDiagram {
    constructor(root, spec, opts) {
      this.spec = spec;
      this.opts = Object.assign({ roles: {} }, opts || {});
      this.svg = s('svg', { class: 'seq', viewBox: `0 0 ${spec.width} ${spec.height}`, role: 'img', 'aria-label': 'UML sıralama diyagramı' });
      root.appendChild(this.svg);
      this._layout();
      this.k = -1;
      this.show(-1, false);
    }

    _boxW(p) {
      const longest = Math.max(...p.label.split('\n').map((l) => l.length));
      return Math.max(96, Math.ceil(longest * 8.1 + 30));
    }

    /** Katılımcı kutusunun yüksekliği: iki satırlı etiket ("ad\n: Tip") için daha uzun. */
    _boxH(p) {
      return p.label.includes('\n') ? 50 : HB;
    }

    _layout() {
      const sp = this.spec;
      const P = sp.participants;
      const n = P.length;
      const margin = sp.margin || 120;
      this.X = {};
      this.P = {};
      P.forEach((p, i) => {
        this.X[p.id] = p.x != null ? p.x : n === 1 ? sp.width / 2 : margin + (i * (sp.width - 2 * margin)) / (n - 1);
        this.P[p.id] = p;
        p.createdBy = null;
      });
      sp.messages.forEach((m, i) => {
        if (m.kind === 'create') this.P[m.to].createdBy = i;
      });

      // satır konumları (rowH: mesajlar arası dikey aralık)
      const RH = sp.rowH || 48;
      let y = sp.top || 112;
      this.rows = sp.messages.map((m) => {
        const r = { y };
        const selfReturn = m.kind === 'return' && m.from === m.to;
        y += m.kind === 'self' ? RH + 16 : selfReturn ? RH + 4 : RH;
        return r;
      });
      this.endY = Math.min(sp.height - 14, y + 8);

      // aktivasyonlar ve ok koordinatları
      const open = {};
      const acts = [];
      const edgeX = (pid, depth, side) => this.X[pid] + (side === 'right' ? AW / 2 : -AW / 2) + depth * DOFF;
      const topDepth = (pid) => (open[pid] && open[pid].length ? open[pid].length - 1 : 0);
      const push = (pid, start) => {
        const st = (open[pid] = open[pid] || []);
        const a = { pid, start, end: null, depth: st.length };
        st.push(a);
        acts.push(a);
        return a;
      };
      const pop = (pid, end) => {
        const a = open[pid] && open[pid].pop();
        if (a) a.end = end;
        return a;
      };

      (sp.initialActive || []).forEach((pid) => push(pid, (sp.top || 112) - 40));
      sp.messages.forEach((m, i) => {
        const yy = this.rows[i].y;
        const dir = this.X[m.to] >= this.X[m.from] ? 1 : -1;
        if (m.kind === 'self') {
          const d0 = topDepth(m.from);
          const a = push(m.to, yy + SELF_DROP - 6);
          m._g = { x0: edgeX(m.from, d0, 'right'), x1: edgeX(m.to, a.depth, 'right'), y: yy };
        } else if (m.kind === 'call') {
          const d0 = topDepth(m.from);
          const a = push(m.to, yy - 6);
          m._g = { x0: edgeX(m.from, d0, dir > 0 ? 'right' : 'left'), x1: edgeX(m.to, a.depth, dir > 0 ? 'left' : 'right'), y: yy };
          // short: dönüşü ayrıca çizilmeyen kısa çağrı — aktivasyon hemen kapanır
          if (m.short) pop(m.to, yy + 22);
        } else if (m.kind === 'create') {
          const d0 = topDepth(m.from);
          m._g = { x0: edgeX(m.from, d0, dir > 0 ? 'right' : 'left'), x1: this.X[m.to] - (dir * this._boxW(this.P[m.to])) / 2, y: yy };
        } else {
          const a = pop(m.from, yy + 4);
          const dFrom = a ? a.depth : 0;
          const d1 = topDepth(m.to);
          if (m.from === m.to) {
            m._g = { x0: edgeX(m.from, dFrom, 'right'), x1: edgeX(m.to, d1, 'right'), y: yy, self: true };
          } else {
            m._g = { x0: edgeX(m.from, dFrom, dir > 0 ? 'right' : 'left'), x1: edgeX(m.to, d1, dir > 0 ? 'left' : 'right'), y: yy };
          }
        }
      });
      Object.keys(open).forEach((pid) => {
        while (open[pid].length) pop(pid, this.endY - 6);
      });
      this.acts = acts;
    }

    show(k, animate) {
      this.k = k;
      const sp = this.spec;
      const svg = this.svg;
      svg.innerHTML = '';
      const curY = k < 0 ? (sp.top || 112) - 30 : this.rows[k].y + (sp.messages[k].kind === 'self' ? SELF_DROP : 0);

      const gLife = s('g', { class: 'seq-life' });
      const gAct = s('g', { class: 'seq-acts' });
      const gMsg = s('g', { class: 'seq-msgs' });
      const gHead = s('g', { class: 'seq-heads' });
      svg.append(gLife, gAct, gMsg, gHead);

      // katılımcılar
      for (const p of sp.participants) {
        if (p.createdBy != null && p.createdBy > k) continue;
        const x = this.X[p.id];
        const bw = this._boxW(p);
        const hb = this._boxH(p);
        const hy = p.createdBy != null ? this.rows[p.createdBy].y - hb / 2 : 18;
        const role = this.opts.roles[p.role];
        const g = s('g', {
          class: 'seq-head' + (role ? ' rc rc-' + role.color : '') + (p.createdBy === k && animate ? ' is-new' : ''),
        });
        g.appendChild(s('rect', { x: x - bw / 2, y: hy, width: bw, height: hb, rx: 8 }));
        const lines = p.label.split('\n');
        if (lines.length === 1) {
          g.appendChild(s('text', { x, y: hy + hb / 2 + 5, 'text-anchor': 'middle', class: p.object ? 'is-object' : '' }, p.label));
        } else {
          g.appendChild(s('text', { x, y: hy + 21, 'text-anchor': 'middle', class: p.object ? 'is-object' : '' }, lines[0]));
          g.appendChild(s('text', { x, y: hy + 40, 'text-anchor': 'middle', class: 'is-type' }, lines[1]));
        }
        gHead.appendChild(g);
        gLife.appendChild(s('line', { class: 'seq-lifeline', x1: x, x2: x, y1: hy + hb, y2: this.endY }));
      }

      // aktivasyon çubukları
      for (const a of this.acts) {
        if (a.start > curY + 2) continue;
        const p = this.P[a.pid];
        const role = this.opts.roles[p.role];
        const end = a.end != null && a.end <= curY + 6 ? a.end : Math.min(this.endY - 6, curY + 24);
        if (end <= a.start) continue;
        gAct.appendChild(
          s('rect', {
            class: 'seq-act' + (role ? ' rc rc-' + role.color : ''),
            x: this.X[a.pid] - AW / 2 + a.depth * DOFF,
            y: a.start,
            width: AW,
            height: end - a.start,
            rx: 3,
          })
        );
      }

      // mesajlar
      for (let i = 0; i <= k && i < sp.messages.length; i++) {
        const m = sp.messages[i];
        const gm = m._g;
        const cls = ['seq-msg', 'kind-' + m.kind];
        if (i === k) cls.push('is-current');
        if (i === k && animate) cls.push('is-new');
        const g = s('g', { class: cls.join(' ') });
        let d;
        let tip;
        let lx;
        let ly;
        let anchor = 'middle';
        if (m.kind === 'self') {
          const loop = Math.max(gm.x0, gm.x1) + 34;
          d = `M${gm.x0} ${gm.y} H${loop} V${gm.y + SELF_DROP} H${gm.x1}`;
          tip = { x: gm.x1, y: gm.y + SELF_DROP, dir: -1 };
          lx = gm.x0 + 8;
          ly = gm.y - 8;
          anchor = 'start';
        } else if (gm.self) {
          const loop = Math.max(gm.x0, gm.x1) + 34;
          d = `M${gm.x0} ${gm.y} H${loop} V${gm.y + 18} H${gm.x1}`;
          tip = { x: gm.x1, y: gm.y + 18, dir: -1 };
          lx = loop + 8;
          ly = gm.y + 14;
          anchor = 'start';
        } else {
          d = `M${gm.x0} ${gm.y} H${gm.x1}`;
          tip = { x: gm.x1, y: gm.y, dir: gm.x1 >= gm.x0 ? 1 : -1 };
          lx = (gm.x0 + gm.x1) / 2;
          ly = gm.y - 9;
        }
        g.appendChild(s('path', { class: 'seq-line', d, pathLength: 100 }));
        const ax = tip.x - tip.dir * 11;
        if (m.kind === 'call' || m.kind === 'self') {
          g.appendChild(s('polygon', { class: 'seq-tip-fill', points: `${tip.x},${tip.y} ${ax},${tip.y - 5.5} ${ax},${tip.y + 5.5}` }));
        } else {
          g.appendChild(s('polyline', { class: 'seq-tip-open', points: `${ax},${tip.y - 6} ${tip.x},${tip.y} ${ax},${tip.y + 6}` }));
        }
        if (m.label) g.appendChild(s('text', { class: 'seq-label', x: lx, y: ly, 'text-anchor': anchor }, m.label));
        gMsg.appendChild(g);
      }
    }

    destroy() {
      this.svg.remove();
    }
  }

  DP.SequenceDiagram = SequenceDiagram;
})();
