/*
 * Composite — animasyon sahnesi.
 *   CP.Boxes : iç içe koliler. Her koli bir çerçeve; içindekiler (ürünler ve başka koliler) çerçevenin içinde,
 *              bir kat içeride. Aynı görünüm hem fiziksel kutuları hem de ağacı gösterir (ön sıra = manifesto sırası).
 *              Sorun   : kalıpsız Kantar'ın döngülerinin hangi kata kadar indiği; kantarın gösterdiği ile programın bulduğu.
 *              Akış    : agirlik() çağrısı aşağı iner, cevaplar yukarı toplanır; listele() önce kendini yazar.
 *              Tezgâh  : bir koli (ya da ürün) seçilir, içine eşya konur; ✕ ile çıkarılır.
 *
 * Durum tabanlı çizim: render(state, prevState, {animate}) — geri/ileri adımlarda tutarlı.
 */
(function () {
  'use strict';
  const CP = DP.cp;
  const esc = DP.esc;
  const md = (t) => DP.md(t, CP.roleOf);

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
  const ICONS = {
    laptop: '<rect x="4" y="4" width="16" height="11" rx="1.5"/><path d="M1.5 19 H22.5 L20.5 15.5 H3.5 Z"/>',
    mouse: '<rect x="7" y="2.5" width="10" height="19" rx="5"/><path d="M12 2.5 V9"/>',
    sarj: '<rect x="5" y="9" width="14" height="11" rx="2.5"/><path d="M9 3.5 V9 M15 3.5 V9 M12 20 V23"/>',
    kilif: '<rect x="2" y="6" width="20" height="14" rx="3"/><path d="M2 10.5 H22"/>',
    saat: '<rect x="8.5" y="1" width="7" height="22" rx="2"/><circle cx="12" cy="12" r="6"/><path d="M12 8.6 V12 L14.2 13.4"/>',
    kupa: '<path d="M4 6 H16 V17.5 Q16 21 12.5 21 H7.5 Q4 21 4 17.5 Z"/><path d="M16 9 H18 Q21 9 21 12 Q21 15 18 15 H16"/>',
    kitap: '<rect x="4" y="2.5" width="16" height="19" rx="1.5"/><path d="M8 2.5 V21.5 M11 7.5 H17"/>',
    parfum: '<rect x="5" y="9" width="14" height="13" rx="3.5"/><rect x="9.5" y="5.5" width="5" height="3.5"/><rect x="8" y="1.5" width="8" height="4" rx="1"/>',
    bisiklet: '<circle cx="5.5" cy="16" r="4.5"/><circle cx="18.5" cy="16" r="4.5"/><path d="M5.5 16 L10 8 H16 L18.5 16 M10 8 L13 16 H5.5 M14 5 H17.5"/>',
  };
  const BOX_ICON = '<path class="cpb-side" d="M2 8.5 H22 V21.5 H2 Z"/><path class="cpb-top" d="M2 8.5 L5 3.5 H19 L22 8.5 Z"/><path class="cpb-tape" d="M12 3.5 V13"/>';
  const BAG_ICON = '<rect class="cpb-bag" x="2.5" y="3" width="19" height="18.5" rx="4.5"/><circle class="cpb-dot" cx="8" cy="9" r="1.7"/><circle class="cpb-dot" cx="14" cy="8" r="1.7"/><circle class="cpb-dot" cx="10" cy="14.5" r="1.7"/><circle class="cpb-dot" cx="16" cy="14" r="1.7"/>';
  const PALLET_ICON = '<rect class="cpb-slat" x="1" y="7" width="22" height="4" rx="1"/><rect class="cpb-slat" x="1" y="16" width="22" height="4" rx="1"/><rect class="cpb-block" x="2.5" y="11" width="4" height="5"/><rect class="cpb-block" x="10" y="11" width="4" height="5"/><rect class="cpb-block" x="17.5" y="11" width="4" height="5"/>';

  /** Bir parçanın simgesi (sol üst x, y; s: ölçek) */
  CP.icon = function (id, x, y, s) {
    const t = `transform="translate(${x},${y})${s && s !== 1 ? ` scale(${s})` : ''}"`;
    if (id === 'palet') return `<g class="cpi cpi-palet" ${t}>${PALLET_ICON}</g>`;
    if (id === 'poset') return `<g class="cpi cpi-bag" ${t}>${BAG_ICON}</g>`;
    if (CP.BOXES[id]) return `<g class="cpi cpi-box" ${t}>${BOX_ICON}</g>`;
    return `<g class="cpi cpi-item" ${t}>${ICONS[id] || ICONS.kitap}</g>`;
  };

  // ================================================================== iç içe koliler
  const X0 = 20; // en dış çerçevenin sol kenarı
  const XR = 940; // sağ kenarı
  const IND = 26; // her kat bu kadar içeride
  const HEAD = 42; // koli başlığı
  const ROW = 36; // ürün satırı
  const GAP = 6;
  const PADB = 10; // çerçevenin alt boşluğu
  const TOP = 66;
  const nameW = (s, px) => s.length * (px || 8.6);
  const CHIP = { l1: '1. döngü', l2: '2. döngü', miss: '✗ döngü yok', m: 'ayrı metot', root: 'agirlik(koli)' };

  class Boxes {
    /** o: {cls, interactive, onPick(id), onRemove(id), minH} */
    constructor(root, o) {
      this.o = o || {};
      this.el = DP.h('div', { class: 'fm-stage cp-boxes' + (this.o.cls ? ' ' + this.o.cls : '') + (this.o.interactive ? ' is-interactive' : '') });
      root.appendChild(this.el);
      this.el.innerHTML = `
<svg class="fm-svg cp-svg" viewBox="0 0 960 ${this.o.minH || 520}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="İç içe koliler: her koli bir çerçeve, içindekiler bir kat içeride">
  <rect class="cp-bg" x="-1500" y="-1500" width="4000" height="4000"/>
  <g data-k="head"></g>
  <g data-k="rows"></g>
  <g data-k="fx"><g class="cp-token" data-k="tok"><g class="cp-token-in"><rect data-k="tok-bg" x="-50" y="-15" width="100" height="30" rx="15"/><text data-k="tok-t" x="0" y="5" text-anchor="middle"></text></g></g></g>
  <foreignObject class="bubble-fo" data-k="b-banner" x="110" y="460" width="740" height="52"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble cp-banner"></div></foreignObject>
</svg>`;
      this.svg = this.el.querySelector('svg');
      this.k = {};
      DP.$$('[data-k]', this.el).forEach((n) => (this.k[n.getAttribute('data-k')] = n));
      this.timers = [];
      this.geo = {};
      if (this.o.interactive) {
        this.svg.addEventListener('click', (e) => {
          const rm = e.target.closest('[data-remove]');
          if (rm) {
            if (this.o.onRemove) this.o.onRemove(rm.getAttribute('data-remove'));
            return;
          }
          const node = e.target.closest('[data-node]');
          if (node && this.o.onPick) this.o.onPick(node.getAttribute('data-node'));
        });
      }
    }

    _stop() {
      this.timers.forEach(clearTimeout);
      this.timers = [];
    }

    _at(ms, fn) {
      this.timers.push(setTimeout(fn, DP.dur(ms)));
    }

    /** Ön sıralı satırlar ve konumları */
    _layout(roots) {
      const rows = [];
      const lay = (n, depth, y, parent) => {
        const x = X0 + depth * IND;
        const w = XR - X0 - depth * IND * 2;
        if (!n.c) {
          rows.push({ n, id: n.id, depth, x, y, w, h: ROW, leaf: true, parent });
          return y + ROW + GAP;
        }
        const r = { n, id: n.id, depth, x, y, w, leaf: false, parent };
        rows.push(r);
        let yy = y + HEAD + GAP;
        n.c.forEach((c) => (yy = lay(c, depth + 1, yy, r)));
        r.h = yy - GAP - y + PADB;
        return y + r.h + GAP;
      };
      let y = TOP;
      roots.forEach((rt) => (y = lay(rt, 0, y, null) + 6));
      return { rows, bottom: y };
    }

    _badge(r, st) {
      const sums = st.sums || {};
      let text;
      let cls;
      if (r.id in sums) {
        text = sums[r.id] + ' g';
        cls = (st.done || {})[r.id] ? 'is-final' : 'is-part';
      } else if (st.weights === false) {
        text = '? g';
        cls = 'is-q';
      } else {
        text = CP.weight(r.n) + ' g';
        cls = 'is-final';
      }
      const bw = Math.max(64, text.length * 9.4 + 22);
      const bx = r.x + r.w - 12 - bw - (this.o.interactive && r.depth > 0 ? 34 : 0);
      return { html: `<g class="cpk-badge ${cls}"><rect x="${bx}" y="${r.y + 8}" width="${bw}" height="26" rx="13"/><text x="${bx + bw / 2}" y="${r.y + 26}" text-anchor="middle">${esc(text)}</text></g>`, left: bx };
    }

    _chip(kind, right, y) {
      if (!kind) return '';
      const text = CHIP[kind];
      const cw = text.length * 7.4 + 18;
      return `<g class="cp-chip is-${kind}"><rect x="${right - cw}" y="${y - 12}" width="${cw}" height="23" rx="11.5"/><text x="${right - cw / 2}" y="${y + 4}" text-anchor="middle">${esc(text)}</text></g>`;
    }

    _remove(r) {
      if (!this.o.interactive || r.depth === 0 || r.ghost) return '';
      const cx = r.x + r.w - 20;
      const cy = r.y + (r.leaf ? ROW / 2 : 21);
      return `<g class="cp-x" data-remove="${r.id}" role="button" aria-label="Çıkar: ${esc(CP.nameOf(r.id))}"><circle cx="${cx}" cy="${cy}" r="11"/><path d="M${cx - 4} ${cy - 4} L${cx + 4} ${cy + 4} M${cx + 4} ${cy - 4} L${cx - 4} ${cy + 4}"/></g>`;
    }

    _check(r) {
      const cy = r.y + (r.leaf ? ROW / 2 : 21);
      return `<g class="cp-check"><circle cx="${r.x}" cy="${cy}" r="9"/><path d="M${r.x - 4} ${cy} L${r.x - 1} ${cy + 3} L${r.x + 4.5} ${cy - 3.5}"/></g>`;
    }

    _rowSvg(r, st, fresh) {
      const id = r.id;
      const flags = [];
      if (st.active === id) flags.push('is-active');
      if ((st.open || {})[id]) flags.push('is-open');
      if ((st.done || {})[id]) flags.push('is-done');
      if ((st.printed || {})[id]) flags.push('is-printed');
      if ((st.reach || {})[id] === 'miss') flags.push('is-miss');
      if (st.target === id) flags.push('is-target');
      if (st.bad && st.bad.target === id) flags.push('is-bad');
      if (r.ghost) flags.push('is-ghost');
      if (fresh) flags.push('is-new');
      const reach = (st.reach || {})[id];
      const mark = (st.done || {})[id] || (st.printed || {})[id] ? this._check(r) : '';
      const gir = st.girinti && st.girinti.id === id ? st.girinti.n : null;
      const girTag = (right, y) => {
        if (gir == null) return '';
        const text = `girinti = "${'·'.repeat(gir)}"`;
        const tw = text.length * 7.6 + 18;
        return `<g class="cp-gir"><rect x="${right - tw}" y="${y - 12}" width="${tw}" height="23" rx="6"/><text x="${right - tw + 9}" y="${y + 4}">${esc(text)}</text></g>`;
      };

      if (r.leaf) {
        const it = CP.ITEMS[id];
        const gx = r.x + r.w - 14 - (this.o.interactive && r.depth > 0 ? 34 : 0);
        const gtext = it.g + ' g';
        const right = gx - gtext.length * 8.2 - 14;
        return `<g class="cpu rc rc-4 ${flags.join(' ')}" data-node="${id}">
          <rect class="cpu-pill" x="${r.x}" y="${r.y}" width="${r.w}" height="${ROW}" rx="10"/>
          ${CP.icon(id, r.x + 9, r.y + 6)}
          <text class="cpu-name" x="${r.x + 42}" y="${r.y + 23.5}">${esc(it.ad)}</text>
          <text class="cpu-g" x="${gx}" y="${r.y + 23.5}" text-anchor="end">${esc(gtext)}</text>
          ${this._chip(reach, right, r.y + ROW / 2)}${girTag(right, r.y + ROW / 2)}
          ${this._remove(r)}${mark}
        </g>`;
      }
      const isPalet = id === 'palet';
      const name = r.ghost ? 'Palet ?' : CP.nameOf(id);
      const dara = isPalet ? CP.PALET.dara : CP.BOXES[id].dara;
      const b = this._badge(r, st);
      const right = b.left - 10;
      const daraText = isPalet ? `palet ${dara} g` : `${id === 'poset' ? 'poşet' : 'kutu'} ${dara} g`;
      const daraX = r.x + 44 + nameW(name, 9) + 12;
      return `<g class="cpk rc rc-3${isPalet ? ' is-palet' : ''} ${flags.join(' ')}" data-node="${id}">
        <rect class="cpk-frame" x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="12"/>
        <path class="cpk-head" d="M${r.x} ${r.y + 12} Q${r.x} ${r.y} ${r.x + 12} ${r.y} H${r.x + r.w - 12} Q${r.x + r.w} ${r.y} ${r.x + r.w} ${r.y + 12} V${r.y + HEAD} H${r.x} Z"/>
        ${CP.icon(id, r.x + 11, r.y + 9)}
        <text class="cpk-name" x="${r.x + 44}" y="${r.y + 27}">${esc(name)}</text>
        ${daraX + daraText.length * 7 < right - 10 ? `<text class="cpk-dara" x="${daraX}" y="${r.y + 27}">${esc(daraText)}</text>` : ''}
        ${r.ghost ? '' : b.html}
        ${this._chip(reach, right, r.y + 21)}${girTag(right, r.y + 21)}
        ${isPalet ? `<path class="cpk-slats" d="M${r.x + 30} ${r.y + r.h} v8 M${r.x + r.w / 2} ${r.y + r.h} v8 M${r.x + r.w - 30} ${r.y + r.h} v8"/>` : ''}
        ${this._remove(r)}${mark}
      </g>`;
    }

    /**
     * st: {roots, client, active, open, done, printed, sums, weights, reach, girinti, token, target, bad, scale, banner}
     *   token: {from, to, text, back} — from → to çağrı jetonu; back varsa cevapla geri döner
     */
    render(st, prev, o) {
      const anim = !!(o && o.animate);
      prev = prev || {};
      this._stop();
      let roots = st.roots;
      if (st.ghostPalet) roots = [{ id: 'palet', c: roots, ghost: true }];
      const L = this._layout(roots);
      this.geo = {};
      L.rows.forEach((r) => (this.geo[r.id] = r));
      if (st.ghostPalet) L.rows[0].ghost = true;
      const had = new Set();
      (prev.roots || []).forEach((rt) => CP.flatten(rt).forEach((f) => had.add(f.n.id)));
      if (prev.ghostPalet) had.add('palet');
      const paint = (sums, first) => {
        const s2 = Object.assign({}, st, { sums });
        this.k.rows.innerHTML = L.rows.map((r) => this._rowSvg(r, s2, first && anim && prev.roots && !had.has(r.id))).join('');
      };
      // sumsPre: cevap yukarı ulaşana kadar üst kolinin eski ara toplamı görünsün
      if (anim && st.sumsPre && !DP.reducedMotion) {
        paint(st.sumsPre, true);
        this._at(st.token && st.token.back != null ? 1480 : 860, () => {
          paint(st.sums, false);
          Object.keys(st.sums || {}).forEach((id) => {
            if (st.sums[id] === st.sumsPre[id]) return;
            const g = this.k.rows.querySelector(`[data-node="${id}"] .cpk-badge`);
            if (g) DP.flash(g, 'is-bump');
          });
        });
      } else paint(st.sums, true);

      // üst şerit: istemci ve kantar
      let head = '';
      if (st.client) {
        const cw = st.client.length * 9.5 + 36;
        head += `<g class="cp-client rc rc-1"><rect x="${X0}" y="16" width="${cw}" height="32" rx="16"/><text x="${X0 + cw / 2}" y="37" text-anchor="middle">${esc(st.client)}</text></g>`;
        this.geo.__client = { x: X0, y: 16, w: cw, h: 32 };
      }
      if (st.caption) head += `<text class="cp-caption" x="${st.client ? X0 + st.client.length * 9.5 + 52 : X0}" y="37">${esc(st.caption)}</text>`;
      if (st.scale) {
        const ok = st.scale.program === st.scale.real;
        head += `<g class="cp-scale ${ok ? 'is-ok' : 'is-bad'}" transform="translate(${XR - 330},8)">
          <rect class="cps-body" width="330" height="50" rx="11"/>
          <text class="cps-l" x="16" y="20">Program</text><text class="cps-v" x="16" y="41">${st.scale.program} g</text>
          <text class="cps-l" x="152" y="20">Kantar (gerçek)</text><text class="cps-v is-real" x="152" y="41">${st.scale.real} g</text>
          <text class="cps-mark" x="312" y="34" text-anchor="end">${ok ? '✓' : '✗'}</text>
        </g>`;
      }
      this.k.head.innerHTML = head;

      // tuval yüksekliği: içerik + afiş
      const H = Math.max(this.o.minH || 520, L.bottom + 76);
      this.svg.setAttribute('viewBox', `0 0 960 ${H}`);
      this.k['b-banner'].setAttribute('y', String(H - 62));
      banner(this.k['b-banner'], st.banner);
      if (anim && st.bad && !(prev.bad && prev.bad.target === st.bad.target && prev.bad.item === st.bad.item)) {
        const g = this.k.rows.querySelector('.is-bad');
        if (g) DP.flash(g, 'is-shake');
      }
      this._token(st.token, anim);
    }

    /** Çağrı jetonu: üst parçadan alt parçaya iner; back varsa cevabı taşıyarak geri çıkar */
    _token(t, anim) {
      const tok = this.k.tok;
      if (!t || !anim || DP.reducedMotion) {
        tok.classList.remove('is-on', 'is-ret');
        return;
      }
      const A = t.from === '__client' ? this.geo.__client : this.geo[t.from];
      const B = this.geo[t.to];
      if (!A || !B) return;
      const call = (r) => ({ x: r.x + 150, y: r.y + (r.leaf ? ROW / 2 : r === this.geo.__client ? 16 : 21) });
      const ret = (r) => (r === this.geo.__client ? { x: r.x + r.w / 2, y: r.y + 16 } : { x: r.x + r.w - 110, y: r.y + (r.leaf ? ROW / 2 : 21) });
      const size = (text) => {
        const w = Math.max(84, text.length * 8.4 + 26);
        this.k['tok-bg'].setAttribute('x', String(-w / 2));
        this.k['tok-bg'].setAttribute('width', String(w));
        this.k['tok-t'].textContent = text;
      };
      const p0 = t.up ? ret(A) : call(A);
      const p1 = t.up ? ret(B) : call(B);
      size(t.text);
      tok.classList.toggle('is-ret', !!t.up);
      tok.classList.add('is-on');
      setTransform(tok, `translate(${p0.x}px, ${p0.y}px)`, false);
      void tok.getBoundingClientRect();
      setTransform(tok, `translate(${p1.x}px, ${p1.y}px)`, true);
      if (t.back != null) {
        this._at(760, () => {
          size(t.back);
          tok.classList.add('is-ret');
          const q0 = ret(B);
          const q1 = ret(A);
          setTransform(tok, `translate(${q0.x}px, ${q0.y}px)`, false);
          void tok.getBoundingClientRect();
          setTransform(tok, `translate(${q1.x}px, ${q1.y}px)`, true);
        });
        this._at(1560, () => tok.classList.remove('is-on'));
      } else this._at(900, () => tok.classList.remove('is-on'));
    }

    destroy() {
      this._stop();
      this.el.remove();
    }
  }
  CP.Boxes = Boxes;
})();
