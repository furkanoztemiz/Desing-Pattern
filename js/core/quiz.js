/*
 * Quiz bileşenleri:
 *   DP.ui.MCQ      — çoktan seçmeli soru
 *   DP.ui.LinePick — "kodda doğru satıra tıkla" sorusu
 *   DP.ui.Match    — sınıfları rollere sürükle/bırak (veya tıkla-yerleştir) eşleştirme
 */
(function () {
  'use strict';
  const { h } = DP;
  const LETTERS = 'ABCDEF';

  function explainBox() {
    return h('div', { class: 'quiz-explain', hidden: true, 'aria-live': 'polite' });
  }

  // ------------------------------------------------------------------ çoktan seçmeli
  DP.ui.MCQ = function (root, q, o) {
    o = o || {};
    const roleOf = o.roleOf;
    let answered = false;
    const wrap = h('div', { class: 'quiz-q' });
    wrap.appendChild(h('div', { class: 'quiz-prompt', html: DP.md(q.q, roleOf) }));
    if (q.code) {
      const host = h('div', { class: 'quiz-code' });
      wrap.appendChild(host);
      new DP.CodeView(host, {
        files: [{ name: q.codeName || 'Ornek.java', code: q.code }],
        roleOf,
        special: o.special,
        copy: false,
        compact: true,
      });
    }
    const opts = h('div', { class: 'quiz-opts' });
    const explain = explainBox();
    q.options.forEach((txt, i) => {
      const b = h(
        'button',
        { class: 'quiz-opt', type: 'button' },
        h('span', { class: 'quiz-letter' }, LETTERS[i]),
        h('span', { class: 'quiz-text', html: DP.md(txt, roleOf) })
      );
      b.addEventListener('click', () => reveal(i));
      opts.appendChild(b);
    });
    const revealBtn = h('button', { class: 'btn btn-ghost quiz-reveal', type: 'button' }, 'Cevabı göster');
    revealBtn.addEventListener('click', () => reveal(null));
    wrap.append(opts, h('div', { class: 'quiz-actions' }, revealBtn), explain);
    root.appendChild(wrap);

    function reveal(choice) {
      if (answered) return;
      answered = true;
      Array.from(opts.children).forEach((b, i) => {
        b.disabled = true;
        if (i === q.answer) b.classList.add('is-correct');
        else if (i === choice) b.classList.add('is-wrong');
        else b.classList.add('is-muted');
      });
      revealBtn.hidden = true;
      const ok = choice === q.answer;
      explain.hidden = false;
      explain.className = 'quiz-explain ' + (choice == null ? 'is-info' : ok ? 'is-ok' : 'is-bad');
      explain.innerHTML =
        `<b>${choice == null ? 'Doğru cevap: ' + LETTERS[q.answer] : ok ? 'Doğru!' : 'Yanlış — doğru cevap ' + LETTERS[q.answer]}</b> ` +
        DP.md(q.explain, roleOf);
      if (o.onAnswer) o.onAnswer(ok, choice);
    }
    return { el: wrap, reveal: () => reveal(null), get answered() { return answered; } };
  };

  // ------------------------------------------------------------------ kodda satır seçme
  DP.ui.LinePick = function (root, q, o) {
    o = o || {};
    const roleOf = o.roleOf;
    let answered = false;
    const wrap = h('div', { class: 'quiz-q' });
    wrap.appendChild(h('div', { class: 'quiz-prompt', html: DP.md(q.q, roleOf) }));
    wrap.appendChild(h('div', { class: 'quiz-hint' }, '👆 Kod üzerinde ilgili satıra tıklayın.'));
    const host = h('div', { class: 'quiz-code is-pick' });
    wrap.appendChild(host);
    const explain = explainBox();
    const revealBtn = h('button', { class: 'btn btn-ghost quiz-reveal', type: 'button' }, 'Cevabı göster');
    wrap.append(h('div', { class: 'quiz-actions' }, revealBtn), explain);
    root.appendChild(wrap);

    const name = q.codeName || 'Ornek.java';
    const cv = new DP.CodeView(host, {
      files: [{ name, code: q.code }],
      roleOf,
      special: o.special,
      copy: false,
      clickable: true,
      compact: true,
      onLineClick: (file, n) => pick(n),
    });
    const correct = cv.resolve(name, q.answer);
    revealBtn.addEventListener('click', () => pick(null));

    function pick(n) {
      if (answered) return;
      answered = true;
      host.classList.remove('is-pick');
      const ok = n != null && correct.includes(n);
      cv.mark(name, correct, 'ok', { scroll: n == null });
      if (n != null && !ok) cv.mark(name, n, 'bad', { scroll: false });
      revealBtn.hidden = true;
      explain.hidden = false;
      explain.className = 'quiz-explain ' + (n == null ? 'is-info' : ok ? 'is-ok' : 'is-bad');
      explain.innerHTML = `<b>${n == null ? 'Doğru satır işaretlendi.' : ok ? 'Doğru!' : 'Olmadı — doğru satır yeşil.'}</b> ` + DP.md(q.explain, roleOf);
      if (o.onAnswer) o.onAnswer(ok, n);
    }
    return { el: wrap, reveal: () => pick(null), get answered() { return answered; } };
  };

  // ------------------------------------------------------------------ eşleştirme
  /**
   * o: {items:[{id,label,role?}], buckets:[{id,title,sub,color}], answer:{itemId:bucketId}, roleOf, onDone, poolLabel}
   */
  DP.ui.Match = function (root, o) {
    const place = {}; // itemId → bucketId | null
    o.items.forEach((it) => (place[it.id] = null));
    let selected = null;
    let checked = false;

    const wrap = h('div', { class: 'match' });
    const pool = h('div', { class: 'match-pool', 'data-bucket': '' });
    const grid = h('div', { class: 'match-buckets' });
    grid.style.setProperty('--n', String(o.buckets.length)); // sütun sayısı = rol sayısı
    const status = h('div', { class: 'match-status', 'aria-live': 'polite' });
    const btnCheck = h('button', { class: 'btn btn-primary', type: 'button' }, 'Kontrol et');
    const btnReset = h('button', { class: 'btn btn-ghost', type: 'button' }, 'Sıfırla');
    const btnShow = h('button', { class: 'btn btn-ghost', type: 'button' }, 'Cevapları göster');
    const bucketEls = {};

    o.buckets.forEach((b) => {
      const zone = h('div', { class: 'match-zone' });
      const el = h(
        'div',
        { class: 'match-bucket' + (b.color ? ' rc rc-' + b.color : ''), 'data-bucket': b.id },
        h('div', { class: 'match-bucket-title' }, b.title),
        b.sub ? h('div', { class: 'match-bucket-sub' }, b.sub) : null,
        zone
      );
      el.addEventListener('click', (e) => {
        if (e.target.closest('.match-chip')) return;
        if (selected) move(selected, b.id);
      });
      bucketEls[b.id] = { el, zone };
      grid.appendChild(el);
    });
    pool.addEventListener('click', (e) => {
      if (e.target.closest('.match-chip')) return;
      if (selected) move(selected, null);
    });

    const chips = {};
    o.items.forEach((it) => {
      const c = h('button', { class: 'match-chip', type: 'button', 'data-item': it.id }, it.label);
      c.addEventListener('click', (e) => {
        e.stopPropagation();
        if (c.dataset.dragged === '1') {
          c.dataset.dragged = '';
          return;
        }
        selected = selected === it.id ? null : it.id;
        render();
      });
      enableDrag(c, it.id);
      chips[it.id] = c;
    });

    wrap.append(
      h('div', { class: 'match-pool-wrap' }, h('div', { class: 'match-label' }, o.poolLabel || 'Sınıflar'), pool),
      grid,
      h('div', { class: 'match-actions' }, btnCheck, btnShow, btnReset, status)
    );
    root.appendChild(wrap);

    btnCheck.addEventListener('click', check);
    btnReset.addEventListener('click', () => {
      o.items.forEach((it) => (place[it.id] = null));
      checked = false;
      selected = null;
      status.textContent = '';
      render();
    });
    btnShow.addEventListener('click', () => {
      o.items.forEach((it) => (place[it.id] = o.answer[it.id]));
      selected = null;
      render();
      check(true);
    });

    function move(id, bucket) {
      place[id] = bucket;
      selected = null;
      checked = false;
      status.textContent = '';
      render();
    }

    function render() {
      o.items.forEach((it) => {
        const c = chips[it.id];
        const target = place[it.id] ? bucketEls[place[it.id]].zone : pool;
        if (c.parentNode !== target) target.appendChild(c);
        c.classList.toggle('is-selected', selected === it.id);
        if (!checked) c.classList.remove('is-ok', 'is-bad');
      });
      wrap.classList.toggle('has-selection', !!selected);
    }

    function check(silent) {
      let ok = 0;
      let placed = 0;
      o.items.forEach((it) => {
        const c = chips[it.id];
        c.classList.remove('is-ok', 'is-bad');
        if (!place[it.id]) return;
        placed++;
        const good = place[it.id] === o.answer[it.id];
        c.classList.add(good ? 'is-ok' : 'is-bad');
        if (good) ok++;
      });
      checked = true;
      const total = o.items.length;
      if (ok === total) {
        status.innerHTML = '<b>Harika! Tüm roller doğru.</b>';
        status.className = 'match-status is-ok';
        if (silent !== true && o.onDone) o.onDone();
      } else {
        status.innerHTML = `${ok} / ${total} doğru` + (placed < total ? ` · ${total - placed} sınıf yerleştirilmedi` : '');
        status.className = 'match-status';
      }
    }

    // İşaretçi (fare + dokunmatik) ile sürükleme
    function enableDrag(chip, id) {
      chip.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        const sx = e.clientX;
        const sy = e.clientY;
        let ghost = null;
        const onMove = (ev) => {
          if (!ghost && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 6) {
            ghost = chip.cloneNode(true);
            ghost.classList.add('match-ghost');
            document.body.appendChild(ghost);
            chip.classList.add('is-dragging');
          }
          if (ghost) {
            ghost.style.left = ev.clientX + 'px';
            ghost.style.top = ev.clientY + 'px';
            DP.$$('.match-bucket, .match-pool', wrap).forEach((b) => b.classList.remove('is-over'));
            const over = document.elementFromPoint(ev.clientX, ev.clientY);
            const zone = over && over.closest('.match-bucket, .match-pool');
            if (zone && wrap.contains(zone)) zone.classList.add('is-over');
          }
        };
        const onUp = (ev) => {
          document.removeEventListener('pointermove', onMove);
          document.removeEventListener('pointerup', onUp);
          if (!ghost) return;
          ghost.remove();
          chip.classList.remove('is-dragging');
          chip.dataset.dragged = '1';
          setTimeout(() => (chip.dataset.dragged = ''), 0);
          DP.$$('.match-bucket, .match-pool', wrap).forEach((b) => b.classList.remove('is-over'));
          const over = document.elementFromPoint(ev.clientX, ev.clientY);
          const zone = over && over.closest('[data-bucket]');
          if (zone && wrap.contains(zone)) move(id, zone.dataset.bucket || null);
        };
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
      });
    }

    render();
    return { el: wrap, showAnswers: () => btnShow.click() };
  };
})();
