/*
 * CodeView — sekmeli Java kod görüntüleyici.
 * Satır vurgulama (aktif satır, iz, odak), fark (diff) gösterimi ve tıklanabilir satırlar.
 *
 * Satır belirtimi (spec) biçimleri:
 *   3 | [3,4,5]                  → satır numaraları (1 tabanlı)
 *   'metin'                      → metni içeren ilk satır
 *   {find:'metin', nth:2}        → metni içeren n. satır
 *   {block:'metin'}              → metni içeren satırdan, süslü parantez dengesi kapanana kadar
 *   ['baş', 'son']               → 'baş' içeren satırdan 'son' içeren satıra kadar
 */
(function () {
  'use strict';
  const { h } = DP;

  const ICON_COPY =
    '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" fill="none" stroke="currentColor" stroke-width="2"/></svg>';

  class CodeView {
    constructor(root, opts) {
      this.opts = Object.assign(
        { tabs: true, copy: true, roleOf: null, special: null, clickable: false, onLineClick: null, compact: false },
        opts || {}
      );
      this.files = new Map();
      this.active = null;

      this.el = h('div', { class: 'codeview' + (this.opts.compact ? ' is-compact' : '') });
      this.tabsEl = h('div', { class: 'cv-tabs', role: 'tablist' });
      const bar = h('div', { class: 'cv-bar' }, this.tabsEl);
      if (this.opts.copy) {
        const btn = h('button', { class: 'cv-copy', type: 'button', title: 'Kodu kopyala', html: ICON_COPY });
        btn.addEventListener('click', async () => {
          const f = this.files.get(this.active);
          if (!f) return;
          const ok = await DP.copyText(f.code.replace(/⟦\d+⟧/g, '___'));
          btn.classList.toggle('is-done', ok);
          if (DP.fx) DP.fx.toast(ok ? 'Kod panoya kopyalandı' : 'Kopyalanamadı');
          setTimeout(() => btn.classList.remove('is-done'), 1200);
        });
        bar.appendChild(btn);
      }
      if (!this.opts.tabs) bar.classList.add('is-plain');
      this.body = h('div', { class: 'cv-body' });
      this.el.append(bar, this.body);
      root.appendChild(this.el);

      if (this.opts.files) this.setFiles(this.opts.files);
    }

    /**
     * @param files [{name, code, role?, badge?}]
     * @param o.prev {ad: eskiKod} → fark gösterimi; o.active → gösterilecek dosya
     */
    setFiles(files, o) {
      o = o || {};
      const keep = o.keepActive !== false ? this.active : null;
      this.files.clear();
      this.body.innerHTML = '';
      this.tabsEl.innerHTML = '';
      for (const f of files) this._addFile(f, o.prev ? o.prev[f.name] : undefined, !!o.prev);
      const target = o.active && this.files.has(o.active) ? o.active : keep && this.files.has(keep) ? keep : files[0] && files[0].name;
      this.active = null;
      if (target) this.show(target);
    }

    _addFile(f, oldCode, diffMode) {
      const rec = Object.assign({}, f, { lines: [], textLines: f.code.split('\n') });
      const hl = { roleOf: this.opts.roleOf, special: this.opts.special };
      const newHtml = DP.highlightJava(f.code, hl);
      let rows;
      if (diffMode && oldCode === undefined) {
        rows = newHtml.map((html, i) => ({ type: 'add', html, n: i + 1 }));
        rec.isNew = true;
      } else if (diffMode && oldCode !== f.code) {
        const oldHtml = DP.highlightJava(oldCode, hl);
        rows = DP.diffLines(oldCode, f.code).map((d) =>
          d.type === 'del' ? { type: 'del', html: oldHtml[d.na], n: null } : { type: d.type, html: newHtml[d.nb], n: d.nb + 1 }
        );
        rec.changed = rows.some((r) => r.type !== 'same');
      } else {
        rows = newHtml.map((html, i) => ({ type: 'same', html, n: i + 1 }));
      }

      const pane = h('div', { class: 'cv-file', role: 'tabpanel', hidden: true });
      const code = h('div', { class: 'cv-code' });
      for (const r of rows) {
        const line = h(
          'div',
          { class: 'cv-line' + (r.type !== 'same' ? ' is-' + r.type : '') },
          h('span', { class: 'cv-ln' }, r.n ? String(r.n) : r.type === 'del' ? '−' : ''),
          h('span', { class: 'cv-lc', html: r.html || ' ' })
        );
        if (r.n) {
          rec.lines[r.n] = line;
          if (this.opts.clickable) {
            line.classList.add('is-clickable');
            line.addEventListener('click', () => this.opts.onLineClick && this.opts.onLineClick(f.name, r.n, line));
          }
        }
        code.appendChild(line);
      }
      pane.appendChild(code);
      this.body.appendChild(pane);
      rec.pane = pane;

      const roleN = f.role || (this.opts.roleOf ? this.opts.roleOf(f.name.replace(/\.java$/, '')) : null);
      const tab = h(
        'button',
        { class: 'cv-tab' + (roleN ? ' rc rc-' + roleN : ''), type: 'button', role: 'tab', 'aria-selected': 'false', title: f.name },
        h('span', { class: 'cv-dot' }),
        h('span', { class: 'cv-name' }, f.name),
        f.badge || rec.isNew ? h('span', { class: 'cv-badge is-new' }, f.badge || 'YENİ') : null,
        !rec.isNew && rec.changed ? h('span', { class: 'cv-badge is-mod', title: 'Değişti' }, 'değişti') : null
      );
      tab.addEventListener('click', () => this.show(f.name));
      this.tabsEl.appendChild(tab);
      rec.tab = tab;
      this.files.set(f.name, rec);
    }

    show(name, o) {
      const rec = this.files.get(name);
      if (!rec) return;
      if (this.active === name) {
        if (o && o.flash) DP.flash(rec.tab, 'is-flash');
        return;
      }
      for (const r of this.files.values()) {
        r.pane.hidden = r !== rec;
        r.tab.classList.toggle('is-active', r === rec);
        r.tab.setAttribute('aria-selected', String(r === rec));
      }
      this.active = name;
      if (o && o.flash) DP.flash(rec.tab, 'is-flash');
      rec.tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }

    resolve(name, spec) {
      const rec = this.files.get(name);
      if (!rec || spec == null) return [];
      const L = rec.textLines;
      const find = (txt, from) => {
        for (let i = from || 0; i < L.length; i++) if (L[i].includes(txt)) return i;
        return -1;
      };
      const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i + 1);
      if (typeof spec === 'number') return [spec];
      if (Array.isArray(spec) && typeof spec[0] === 'number') return spec.slice();
      if (typeof spec === 'string') {
        const i = find(spec);
        return i < 0 ? [] : [i + 1];
      }
      if (Array.isArray(spec)) {
        const a = find(spec[0]);
        if (a < 0) return [];
        const b = find(spec[1], a);
        return range(a, b < 0 ? a : b);
      }
      if (spec.find) {
        let i = -1;
        for (let k = 0; k < (spec.nth || 1); k++) i = find(spec.find, i + 1);
        return i < 0 ? [] : [i + 1];
      }
      if (spec.block) {
        const a = find(spec.block);
        if (a < 0) return [];
        let depth = 0;
        let opened = false;
        for (let i = a; i < L.length; i++) {
          const clean = L[i].replace(/"(?:[^"\\]|\\.)*"/g, '').replace(/\/\/.*$/, '');
          for (const ch of clean) {
            if (ch === '{') {
              depth++;
              opened = true;
            } else if (ch === '}') depth--;
          }
          if (opened && depth <= 0) return range(a, i);
        }
        return range(a, a);
      }
      return [];
    }

    /** Satırları işaretler. kind: active | trail | focus | ok | bad */
    mark(name, spec, kind, o) {
      kind = kind || 'active';
      o = o || {};
      const rec = this.files.get(name);
      if (!rec) return [];
      if (o.show !== false) this.show(name, { flash: o.flash });
      const els = this.resolve(name, spec)
        .map((n) => rec.lines[n])
        .filter(Boolean);
      els.forEach((el) => el.classList.add('is-' + kind));
      if (o.scroll !== false && els[0]) this._scrollTo(els[0], o.smooth !== false);
      return els;
    }

    clear(kind) {
      const kinds = kind ? [kind] : ['active', 'trail', 'focus', 'ok', 'bad'];
      for (const rec of this.files.values()) {
        for (const k of kinds) rec.pane.querySelectorAll('.is-' + k).forEach((e) => e.classList.remove('is-' + k));
      }
    }

    _scrollTo(el, smooth) {
      const body = this.body;
      const top = el.offsetTop - body.clientHeight * 0.3;
      body.scrollTo({ top: Math.max(0, top), behavior: smooth && !DP.reducedMotion ? 'smooth' : 'auto' });
    }

    blanks() {
      return DP.$$('.blank', this.body);
    }

    destroy() {
      this.el.remove();
    }
  }

  DP.CodeView = CodeView;
})();
