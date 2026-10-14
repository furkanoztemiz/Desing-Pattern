/*
 * Stepper — adım adım oynatıcı (başa dön / geri / oynat-durdur / ileri / hız).
 * Sahneler onChange(i, prev, info) ile kendini çizer. Tek adımlık ileri hareketlerde
 * info.animate = true olur; geri ve atlamalı geçişlerde animasyonsuz çizilir.
 */
(function () {
  'use strict';
  const { h } = DP;

  const ICONS = {
    first: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5v14M19 5l-9 7 9 7z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-8 7 8 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l8 7-8 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="4.5" width="4.2" height="15" rx="1" fill="currentColor"/><rect x="13.8" y="4.5" width="4.2" height="15" rx="1" fill="currentColor"/></svg>',
  };
  const SPEEDS = [0.5, 1, 1.5, 2];

  class Stepper {
    /**
     * @param root kapsayıcı
     * @param o {count, onChange, labels?, delayOf?(i) → ms, startAt?}
     */
    constructor(root, o) {
      this.count = o.count;
      this.onChange = o.onChange;
      this.labels = o.labels || [];
      this.delayOf = o.delayOf || (() => 2800);
      this.index = -1;
      this.playing = false;
      this.timer = 0;

      this.el = h('div', { class: 'stepper' });
      this.btnFirst = this._btn('first', 'Başa dön (Home)', () => this.go(0));
      this.btnPrev = this._btn('prev', 'Önceki adım (←)', () => this.prev());
      this.btnPlay = this._btn('play', 'Oynat / durdur (P)', () => this.toggle(), 'is-play');
      // Son adımdayken "ileri" düğmesi bir sonraki sahneye geçer (uygulama kabuğu dinler).
      this.btnNext = this._btn('next', 'Sonraki adım (→)', () => {
        if (!this.next()) DP.emit('scene:next');
      });
      this.dots = h('div', { class: 'st-dots' });
      this.counter = h('div', { class: 'st-count' });
      this.speedBtn = h('button', { class: 'st-speed', type: 'button', title: 'Animasyon hızı' });
      this.speedBtn.addEventListener('click', () => {
        const idx = SPEEDS.indexOf(DP.speed);
        DP.setSpeed(SPEEDS[(idx + 1) % SPEEDS.length]);
        DP.store.set('speed', DP.speed);
        this._render();
      });
      this.el.append(
        h('div', { class: 'st-btns' }, this.btnFirst, this.btnPrev, this.btnPlay, this.btnNext),
        this.dots,
        this.counter,
        this.speedBtn
      );
      root.appendChild(this.el);
      this._buildDots();
      this.go(o.startAt || 0, { animate: false, force: true });
    }

    _btn(icon, title, fn, extra) {
      const b = h('button', { class: 'st-btn ' + (extra || ''), type: 'button', title, 'aria-label': title, html: ICONS[icon] });
      b.addEventListener('click', fn);
      return b;
    }

    _buildDots() {
      this.dots.innerHTML = '';
      for (let i = 0; i < this.count; i++) {
        const d = h('button', { class: 'st-dot', type: 'button', title: this.labels[i] ? `${i + 1}. ${this.labels[i]}` : `Adım ${i + 1}` });
        d.addEventListener('click', () => this.go(i));
        this.dots.appendChild(d);
      }
    }

    setCount(n, labels) {
      this.count = n;
      if (labels) this.labels = labels;
      this._buildDots();
      if (this.index >= n) this.index = n - 1;
      this._render();
    }

    go(i, o) {
      o = o || {};
      i = Math.max(0, Math.min(this.count - 1, i));
      const prev = this.index;
      if (i === prev && !o.force) return false;
      this.index = i;
      this._render();
      const step1 = Math.abs(i - prev) === 1;
      const animate = o.animate !== undefined ? o.animate : step1 && i > prev;
      this.onChange(i, prev, { animate, dir: i >= prev ? 1 : -1 });
      if (this.playing) this._schedule();
      return true;
    }

    next() {
      if (this.index >= this.count - 1) {
        this.pause();
        return false;
      }
      return this.go(this.index + 1);
    }

    prev() {
      if (this.index <= 0) return false;
      return this.go(this.index - 1);
    }

    first() {
      return this.go(0);
    }

    last() {
      return this.go(this.count - 1, { animate: false });
    }

    play() {
      if (this.index >= this.count - 1) this.go(0, { animate: false });
      this.playing = true;
      this._render();
      this._schedule();
    }

    pause() {
      this.playing = false;
      clearTimeout(this.timer);
      this._render();
    }

    toggle() {
      if (this.playing) this.pause();
      else this.play();
    }

    _schedule() {
      clearTimeout(this.timer);
      if (!this.playing) return;
      if (this.index >= this.count - 1) {
        this.pause();
        return;
      }
      this.timer = setTimeout(() => this.next(), DP.dur(this.delayOf(this.index)));
    }

    _render() {
      Array.from(this.dots.children).forEach((d, i) => {
        d.classList.toggle('is-done', i < this.index);
        d.classList.toggle('is-current', i === this.index);
      });
      this.counter.innerHTML = `<b>${this.index + 1}</b> / ${this.count}`;
      this.btnPlay.innerHTML = this.playing ? ICONS.pause : ICONS.play;
      this.btnPlay.classList.toggle('is-playing', this.playing);
      this.btnPrev.disabled = this.index <= 0;
      this.btnFirst.disabled = this.index <= 0;
      const end = this.index >= this.count - 1;
      this.btnNext.title = end ? 'Sonraki sahne (→)' : 'Sonraki adım (→)';
      this.btnNext.classList.toggle('is-scene-next', end);
      this.speedBtn.textContent = (DP.speed === 1 ? '1' : DP.speed) + '× hız';
      this.el.classList.toggle('is-end', end);
    }

    destroy() {
      clearTimeout(this.timer);
      this.el.remove();
    }
  }

  DP.Stepper = Stepper;
})();
