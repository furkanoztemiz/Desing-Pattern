/*
 * Sahne kiti — kalıplardan bağımsız, yeniden kullanılabilir sahne parçaları:
 *   foot, panel, seg, toggle, roleChip, stepApi, umlLegend   → küçük arayüz yardımcıları
 *   blankExercise                                            → boşluk doldurma alıştırması
 *   realWorldScene, quizScene                                → hazır sahne şablonları
 */
(function () {
  'use strict';
  const { h } = DP;
  const kit = (DP.kit = {});

  // ================================================================== küçük yardımcılar
  /** Alt bilgi çubuğu: anlatım kutusu + adım oynatıcı yeri. */
  kit.foot = function (root, roleOf) {
    const narr = h('div', { class: 'narr' });
    const badge = h('div', { class: 'narr-badge' });
    const title = h('div', { class: 'narr-title' });
    const text = h('div', { class: 'narr-text' });
    narr.append(badge, h('div', { class: 'narr-body' }, title, text));
    const stepHost = h('div', { class: 'foot-stepper' });
    const el = h('div', { class: 'scene-foot' }, narr, stepHost);
    root.appendChild(el);
    return {
      el,
      stepHost,
      set(i, n, t, body) {
        badge.textContent = String(i + 1);
        title.innerHTML = DP.md(t || '', roleOf);
        text.innerHTML = DP.md(body || '', roleOf);
        DP.flash(narr, 'is-changed');
      },
    };
  };

  kit.panel = function (title, o) {
    o = o || {};
    const head = h('div', { class: 'panel-head' }, h('span', { class: 'panel-title', html: title }), o.extra || null);
    const body = h('div', { class: 'panel-body' + (o.bodyClass ? ' ' + o.bodyClass : '') });
    const el = h('section', { class: 'panel' + (o.cls ? ' ' + o.cls : '') }, title ? head : null, body);
    return { el, head, body };
  };

  /** Bölümlü seçim düğmesi. items: [{v, label|html, title, disabled, onLocked}] */
  kit.seg = function (items, value, onChange, o) {
    o = o || {};
    const el = h('div', { class: 'seg' + (o.cls ? ' ' + o.cls : ''), role: 'group', 'aria-label': o.label || '' });
    const btns = {};
    items.forEach((it) => {
      const b = h('button', { class: 'seg-btn', type: 'button', html: it.html || DP.esc(it.label), title: it.title || '' });
      b.addEventListener('click', () => {
        if (it.disabled && it.onLocked) return it.onLocked();
        set(it.v);
        onChange(it.v);
      });
      btns[it.v] = b;
      el.appendChild(b);
    });
    function set(v) {
      Object.keys(btns).forEach((k) => {
        btns[k].classList.toggle('is-on', k === v);
        btns[k].setAttribute('aria-pressed', String(k === v));
      });
    }
    set(value);
    return { el, set, btns };
  };

  kit.toggle = function (label, on, onChange) {
    const input = h('input', { type: 'checkbox' });
    input.checked = !!on;
    input.addEventListener('change', () => onChange(input.checked));
    return h('label', { class: 'toggle' }, input, h('span', { class: 'toggle-track' }, h('span', { class: 'toggle-thumb' })), h('span', null, label));
  };

  kit.roleChip = function (roles, key) {
    const r = roles[key];
    return `<span class="role-chip rc rc-${r.color}"><b>${r.en}</b> · ${r.tr}</span>`;
  };

  /** Stepper'ı sahne arayüzüne (next/prev/first/last/play) bağlar. */
  kit.stepApi = function (stepper, extra) {
    return Object.assign(
      {
        next: () => stepper.next(),
        prev: () => stepper.prev(),
        first: () => stepper.first(),
        last: () => stepper.last(),
        play: () => stepper.toggle(),
      },
      extra || {}
    );
  };

  kit.umlLegend = function (o) {
    o = o || {};
    return h('div', {
      class: 'uml-legend',
      html: `
      <span><svg viewBox="0 0 46 14"><line x1="2" y1="7" x2="32" y2="7" class="lg-line"/><polygon points="44,7 32,1.5 32,12.5" class="lg-tri"/></svg> kalıtım (extends)</span>
      <span><svg viewBox="0 0 46 14"><line x1="2" y1="7" x2="32" y2="7" class="lg-line is-dashed"/><polygon points="44,7 32,1.5 32,12.5" class="lg-tri"/></svg> gerçekleme (implements)</span>
      ${o.association ? '<span><svg viewBox="0 0 46 14"><line x1="2" y1="7" x2="42" y2="7" class="lg-line"/><polyline points="33,1.5 43,7 33,12.5" class="lg-open"/></svg> ilişki (alan)</span>' : ''}
      <span><svg viewBox="0 0 46 14"><line x1="2" y1="7" x2="42" y2="7" class="lg-line is-dashed"/><polyline points="33,1.5 43,7 33,12.5" class="lg-open"/></svg> bağımlılık / «create»</span>
      <span><i>italik</i> = soyut</span>
      <span><code>+</code> public · <code>#</code> protected · <code>-</code> private</span>
      <span><span class="lg-fm"></span> ${o.fmLabel || 'fabrika metodu'}</span>`,
    });
  };

  // ================================================================== boşluk doldurma alıştırması
  /**
   * Koddaki ⟦n⟧ boşluklarını öğrencilerle birlikte doldurma.
   * o: {files:[{name,code,badge}], answers:{n:'Sinif'}, hints:{n:'md'}, choices:[...],
   *     roleOf, special, state (cevapların saklandığı nesne), doneText,
   *     onSolved(), onShowAnswers(), onReset()}
   * Dönüş: {wrap, chipRow, actions, paintAll, autoFill(animate), isSolved(), ensureSelection()}
   */
  kit.blankExercise = function (o) {
    const S = o.state;
    const md = (t) => DP.md(t, o.roleOf);
    const ids = Object.keys(o.answers);
    const wrap = h('div', { class: 'ex-wrap' });
    o.files.forEach((f) => {
      const host = h('div', { class: 'ex-code' });
      wrap.appendChild(host);
      new DP.CodeView(host, { files: [f], roleOf: o.roleOf, special: o.special, copy: false, compact: true });
    });
    const chips = h('div', { class: 'ex-chips' });
    const chipRow = h('div', { class: 'ex-chip-row' }, h('span', { class: 'tb-label' }, 'Sınıflar:'), chips);
    const status = h('div', { class: 'ex-status', 'aria-live': 'polite' });
    const btnShow = h('button', { class: 'btn btn-ghost btn-sm', type: 'button' }, 'Cevapları göster');
    const btnReset = h('button', { class: 'btn btn-ghost btn-sm', type: 'button' }, 'Sıfırla');
    const actions = h('div', { class: 'ex-actions' }, status, btnShow, btnReset);

    const blanks = {};
    DP.$$('.blank', wrap).forEach((b) => (blanks[b.dataset.blank] = b));
    let selected = null;

    const nextEmpty = () => ids.find((n) => S[n] !== o.answers[n]) || null;

    function paintBlank(n) {
      const b = blanks[n];
      if (!b) return;
      const val = S[n];
      b.textContent = val || '';
      b.className = 'blank' + (val ? ' is-ok rc rc-' + (o.roleOf(val) || 0) : '') + (selected === n ? ' is-selected' : '');
    }

    function paintAll() {
      ids.forEach(paintBlank);
      const done = ids.filter((n) => S[n] === o.answers[n]).length;
      status.innerHTML =
        done === ids.length
          ? o.doneText || '<b class="ok">✔ Derleme başarılı!</b>'
          : `${done} / ${ids.length} boşluk dolduruldu` + (selected && o.hints[selected] ? ` · <span class="hint">${md(o.hints[selected])}</span>` : '');
    }

    function select(n) {
      selected = n;
      paintAll();
    }

    ids.forEach((n) => {
      const b = blanks[n];
      if (!b) return;
      const pick = () => {
        if (S[n] === o.answers[n]) return;
        select(n);
      };
      b.addEventListener('click', pick);
      b.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          pick();
        }
      });
    });

    o.choices.forEach((c) => {
      const chip = h('button', { class: 'ex-chip rc rc-' + (o.roleOf(c) || 0), type: 'button' }, c);
      chip.addEventListener('click', () => fill(c));
      chips.appendChild(chip);
    });

    function fill(value) {
      const n = selected || nextEmpty();
      if (!n) return;
      if (value === o.answers[n]) {
        S[n] = value;
        selected = nextEmpty();
        paintAll();
        DP.flash(blanks[n], 'is-pop');
        if (!nextEmpty() && o.onSolved) o.onSolved();
      } else {
        const b = blanks[n];
        b.textContent = value;
        b.classList.add('is-bad');
        DP.flash(b, 'is-shake');
        status.innerHTML = `<span class="bad">✘ Derleme hatası!</span> <span class="hint">${md(o.hints[n] || '')}</span>`;
        setTimeout(() => paintBlank(n), 900);
      }
    }

    function autoFill(animate) {
      const todo = ids.filter((n) => S[n] !== o.answers[n]);
      if (!animate) {
        todo.forEach((n) => (S[n] = o.answers[n]));
        selected = null;
        paintAll();
        return;
      }
      todo.forEach((n, i) =>
        setTimeout(() => {
          S[n] = o.answers[n];
          selected = null;
          paintAll();
          DP.flash(blanks[n], 'is-pop');
        }, DP.dur(260 * i))
      );
    }

    btnShow.addEventListener('click', () => {
      autoFill(true);
      if (o.onShowAnswers) setTimeout(o.onShowAnswers, DP.dur(260 * ids.length + 300));
    });
    btnReset.addEventListener('click', () => {
      ids.forEach((n) => delete S[n]);
      selected = nextEmpty();
      paintAll();
      if (o.onReset) o.onReset();
    });

    return {
      wrap,
      chipRow,
      actions,
      paintAll,
      autoFill,
      isSolved: () => !nextEmpty(),
      ensureSelection() {
        if (!selected) {
          selected = nextEmpty();
          paintAll();
        }
      },
    };
  };

  // ================================================================== "Gerçek Dünya" sahne şablonu
  /**
   * Sekmeli gerçek dünya örnekleri: sol panelde rol eşlemesi, sağda çalıştırılabilir kod + çıktı.
   * o: {tabs, roles, roleOf, footText(i) → md, mapHead: ['Rol','Bizim örnek','Java’da'], fmLabel}
   * sekme: {tab, title, intro, map:[[rolKey|'fm', bizim, javada]], note, roles:{Ad:rolKey}, special,
   *         file, code(arg), mark, options:[{label,arg,out}], cmd, extraFile, extraHtml}
   */
  kit.realWorldScene = function (root, ctx, o) {
    const md = (t) => DP.md(t, o.roleOf);
    const tabsData = o.tabs;
    const el = h('div', { class: 'scene scene-split scene-rw' });
    const tabs = h('div', { class: 'rw-tabs', role: 'tablist' });
    const body = h('div', { class: 'scene-body cols-50' });
    const left = kit.panel('', { cls: 'panel-side rw-left' });
    const right = kit.panel('', { cls: 'panel-code rw-right' });
    body.append(left.el, right.el);
    el.append(tabs, body);
    root.appendChild(el);

    const tabBtns = tabsData.map((r, i) => {
      const b = h('button', { class: 'rw-tab', type: 'button', role: 'tab' }, r.tab);
      b.addEventListener('click', () => stepper.go(i));
      tabs.appendChild(b);
      return b;
    });
    const head = o.mapHead || ['Rol', 'Bizim örnek', 'Java’da'];

    function renderTab(i) {
      const r = tabsData[i];
      tabBtns.forEach((b, k) => {
        b.classList.toggle('is-on', k === i);
        b.setAttribute('aria-selected', String(k === i));
      });
      left.body.innerHTML = '';
      right.body.innerHTML = '';
      left.body.appendChild(h('h2', { class: 'rw-title', html: md(r.title) }));
      left.body.appendChild(h('p', { class: 'rw-intro', html: md(r.intro) }));
      if (r.map) {
        const rows = r.map
          .map(([role, ours, jdk]) => {
            const label = role === 'fm' ? `<span class="role-chip is-fm">${o.fmLabel || 'Fabrika metodu'}</span>` : kit.roleChip(o.roles, role);
            const oursHtml = role === 'fm' ? `<code class="tk-fm">${ours}</code>` : `<span class="cls rc rc-${o.roleOf(ours)}">${ours}</span>`;
            return `<tr><td>${label}</td><td>${oursHtml}</td><td>${md(jdk)}</td></tr>`;
          })
          .join('');
        left.body.appendChild(h('table', { class: 'map', html: `<thead><tr><th>${head[0]}</th><th>${head[1]}</th><th>${head[2]}</th></tr></thead><tbody>${rows}</tbody>` }));
      }
      if (r.extraHtml) left.body.appendChild(h('div', { class: 'rw-extra', html: r.extraHtml }));
      if (r.note) left.body.appendChild(h('div', { class: 'rw-note', html: '💡 ' + md(r.note) }));

      const cvHost = h('div', { class: 'rw-code' });
      right.body.appendChild(cvHost);
      const roleOf = (name) => (r.roles && r.roles[name] ? o.roles[r.roles[name]].color : null);
      const cv = new DP.CodeView(cvHost, { roleOf, special: r.special });
      if (!r.options) {
        const files = [{ name: r.file, code: r.code() }];
        if (r.extraFile) files.push(r.extraFile);
        cv.setFiles(files, { active: r.file });
        if (r.mark) cv.mark(r.file, r.mark, 'focus', { smooth: false });
        if (r.out) {
          const out = h('div', { class: 'console' });
          right.body.appendChild(out);
          writeOut(out, r.cmd, r.out, false);
        }
        return;
      }
      const optRow = h('div', { class: 'rw-opts' }, h('span', { class: 'tb-label' }, 'Dene:'));
      const out = h('div', { class: 'console' });
      right.body.append(optRow, out);
      const seg = kit.seg(
        r.options.map((op, k) => ({ v: String(k), label: op.label })),
        '0',
        (k) => run(Number(k), true)
      );
      optRow.appendChild(seg.el);
      function run(k, animate) {
        const op = r.options[k];
        const files = [{ name: r.file, code: r.code(op.arg) }];
        if (r.extraFile) files.push(r.extraFile);
        cv.setFiles(files, { active: r.file });
        cv.mark(r.file, op.arg, 'focus', { smooth: false });
        if (r.mark) cv.mark(r.file, r.mark, 'active', { scroll: false });
        writeOut(out, r.cmd, op.out, animate);
      }
      run(0, false);
    }

    function writeOut(out, cmd, lines, animate) {
      out.innerHTML = '<div class="console-head"><span></span><span></span><span></span> Konsol</div>';
      out.appendChild(h('div', { class: 'console-line is-cmd' }, cmd));
      lines.forEach((l, j) => out.appendChild(h('div', { class: 'console-line' + (animate && j === 0 ? ' is-new' : '') + (j === 0 ? ' is-strong' : '') }, l)));
    }

    const foot = kit.foot(el, o.roleOf);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: tabsData.length,
      labels: tabsData.map((r) => r.tab),
      delayOf: () => 7000,
      onChange: (i) => {
        foot.set(i, tabsData.length, tabsData[i].tab, o.footText(i));
        renderTab(i);
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };

  // ================================================================== Quiz sahne şablonu
  /**
   * o: {questions, match:{items, buckets, answer, hint, title, prompt, poolLabel}, roleOf, special, patternName, summaryId}
   * Sorular: {type:'mcq'|'line', ...} — DP.ui.MCQ / DP.ui.LinePick biçiminde.
   */
  kit.quizScene = function (root, ctx, o) {
    const S = ctx.state;
    S.quiz = S.quiz || { results: {}, match: false };
    const Q = o.questions;
    const md = (t) => DP.md(t, o.roleOf);
    const el = h('div', { class: 'scene scene-quiz' });
    const stage = h('div', { class: 'quiz-stage' });
    el.appendChild(stage);
    root.appendChild(el);
    const total = Q.length + 2; // sorular + eşleştirme + sonuç
    const score = () => Object.values(S.quiz.results).filter(Boolean).length;

    function render(i) {
      stage.innerHTML = '';
      const card = h('div', { class: 'quiz-card' });
      stage.appendChild(card);
      if (i < Q.length) {
        const q = Q[i];
        card.appendChild(h('div', { class: 'quiz-head' }, h('span', { class: 'quiz-num' }, `Soru ${i + 1} / ${Q.length}`), h('span', { class: 'quiz-score' }, `Puan: ${score()}`)));
        const opts = {
          roleOf: o.roleOf,
          special: o.special,
          onAnswer: (ok) => {
            if (!(i in S.quiz.results)) S.quiz.results[i] = ok;
            card.querySelector('.quiz-score').textContent = `Puan: ${score()}`;
            if (ok) DP.fx.confetti({ count: 60 });
          },
        };
        const comp = q.type === 'line' ? DP.ui.LinePick(card, q, opts) : DP.ui.MCQ(card, q, opts);
        if (i in S.quiz.results) comp.reveal();
      } else if (i === Q.length) {
        card.appendChild(h('div', { class: 'quiz-head' }, h('span', { class: 'quiz-num' }, 'Eşleştirme'), h('span', { class: 'quiz-score' }, o.match.title || 'Sınıfları rollerine taşıyın')));
        card.appendChild(h('p', { class: 'quiz-prompt', html: md(o.match.prompt || 'Her sınıfı doğru role **sürükleyin** (ya da önce sınıfa, sonra role tıklayın).') }));
        DP.ui.Match(card, {
          items: o.match.items,
          buckets: o.match.buckets,
          answer: o.match.answer,
          poolLabel: o.match.poolLabel,
          onDone: () => {
            S.quiz.match = true;
            DP.fx.confetti();
          },
        });
      } else {
        const ok = score();
        const pct = ok / Q.length;
        const msg = pct >= 0.85 ? `Muhteşem! ${o.patternName} artık sizin.` : pct >= 0.6 ? 'Güzel! Birkaç noktayı tekrar gözden geçirin.' : 'Sahneleri bir tur daha izlemeye ne dersiniz?';
        card.classList.add('quiz-result');
        card.innerHTML = `
          <div class="res-ring" style="--p:${Math.round(pct * 100)}"><div><b>${ok}</b><span>/ ${Q.length}</span></div></div>
          <h2>${msg}</h2>
          <p>Eşleştirme: ${S.quiz.match ? '<b class="ok">✔ tamamlandı</b>' : '<span class="muted">tamamlanmadı</span>'}</p>
          <div class="res-actions">
            <button class="btn btn-ghost" type="button" data-reset>Quiz’i sıfırla</button>
            <button class="btn btn-primary" type="button" data-go>Özete geç →</button>
          </div>`;
        card.querySelector('[data-reset]').addEventListener('click', () => {
          S.quiz = { results: {}, match: false };
          stepper.go(0);
        });
        card.querySelector('[data-go]').addEventListener('click', () => ctx.goScene(o.summaryId || 'ozet'));
        if (pct >= 0.85) setTimeout(() => DP.fx.confetti(), 250);
      }
    }

    const foot = kit.foot(el, o.roleOf);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: total,
      labels: Q.map((q, i) => 'Soru ' + (i + 1)).concat(['Eşleştirme', 'Sonuç']),
      delayOf: () => 9000,
      onChange: (i) => {
        const title = i < Q.length ? `Soru ${i + 1}` : i === Q.length ? 'Rolleri eşleştir' : 'Sonuç';
        const text =
          i < Q.length
            ? 'Önce sınıfa sorun, cevapları toplayın; sonra şıkka tıklayın ya da **Cevabı göster** deyin.'
            : i === Q.length
            ? o.match.hint || 'Sınıfları rollere yerleştirin. Takıldığınızda **Cevapları göster** düğmesi var.'
            : 'Tebrikler! Bir sonraki sahnede kalıbın tek sayfalık özeti var.';
        foot.set(i, total, title, text);
        render(i);
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };
})();
