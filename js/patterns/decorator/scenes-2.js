/*
 * Decorator — sahneler (2/3): CANLI AKIŞ ve SİPARİŞ TEZGÂHI
 *   Canlı Akış: katmanlar tek tek kurulur; ucret() çağrısı katman katman içeri iner, değer dışarı çıkarken
 *               her katman kendi payını ekler. Sahne, sıralama ve sınıf diyagramı görünümleri.
 *   Tezgâh   : katman sırası (indirim içte mi dışta mı?), aynı katmanın iki kez kullanılması ve serbest sipariş kurma.
 */
(function () {
  'use strict';
  const DC = DP.dc;
  const { h } = DP;
  const kit = DP.kit;
  const ui = DC.ui;
  const md = DC.md;
  const esc = DP.esc;

  /** Bir katmanın ücrete etkisi, Java'daki işlemle aynı biçimde: "+ 40" ya da "× 9 / 10" */
  const opOf = (a) => (a.pct ? '× 9 / 10' : '+ ' + a.fee);

  function renderStack(stackEl, all) {
    stackEl.innerHTML = '<span class="cs-label">Çağrı yığını</span>';
    const frames = all.length > 3 ? all.slice(-2) : all;
    if (frames !== all) {
      stackEl.appendChild(h('span', { class: 'cs-frame cs-more', title: all.slice(0, -2).map((x) => x.t).join(' › ') }, '…'));
      stackEl.appendChild(h('span', { class: 'cs-sep' }, '›'));
    }
    frames.forEach((fr, i) => {
      if (i) stackEl.appendChild(h('span', { class: 'cs-sep' }, '›'));
      const r = DC.roleOf(fr.cls);
      stackEl.appendChild(h('span', { class: 'cs-frame' + (r ? ' rc rc-' + r : '') + (i === frames.length - 1 ? ' is-top' : '') }, fr.t));
    });
  }

  // ================================================================== 4. CANLI AKIŞ
  /** Tarifin adımları: çekirdek → katmanlar → aciklama() → ucret() içeri → değer dışarı → çıktı → sonuç */
  function flowSteps(p) {
    const L = p.layers; // içten dışa
    const n = L.length;
    const core = DC.CORES[p.core];
    const A = (i) => DC.ADDONS[L[i - 1]]; // i. katman (1 = çekirdeğe en yakın)
    const tr = DC.trace(p.core, L);
    const desc = DC.describe(p.core, L);
    const M = 'Main.java';
    const CF = core.cls + '.java';
    const fMain = { t: 'Main.main()', cls: 'Main' };
    const frame = (i) => (i === 0 ? { t: core.cls + '.ucret()', cls: core.cls } : { t: A(i).cls + '.ucret()', cls: A(i).cls });
    /** Main'den i. katmana kadar inen yığın: Main › dış … › i */
    const stackTo = (i) => [fMain].concat(Array.from({ length: n - i + 1 }, (_, j) => frame(n - j)));
    const st = (o) => Object.assign({ core: p.core, layers: L }, o);
    const member = (i) => (i === 0 ? [core.cls, 'impl'] : [A(i).cls, 'impl']);
    const other = DC.presets[DC.presetOrder.find((k) => k !== p.key)];
    const steps = [];

    steps.push({
      t: `Çekirdek: new ${core.cls}()`,
      x: `Önce **çekirdek** hizmet oluşuyor: [[${core.cls}]], ${core.fee} TL. Değişkenin tipi **KargoHizmeti** (arayüz); birazdan aynı değişken katmanları gösterecek.`,
      code: [M, `KargoHizmeti hizmet = new ${core.cls}();`], stack: [fMain], out: 0, seq: -1, d: 4400,
      uml: { classes: [core.cls, 'KargoHizmeti'], edges: [p.core === 'zarf' ? 'r-zarf' : 'r-std'] },
      stage: { core: p.core, layers: [], active: 0, banner: { text: `Çekirdek: **${core.cls}** · ${core.fee} TL` } },
    });
    L.forEach((k, j) => {
      const a = DC.ADDONS[k];
      steps.push({
        t: `${j + 1}. katman: new ${a.cls}(hizmet)`,
        x:
          j === 0
            ? `[[${a.cls}]] kurucusunda **eski nesneyi** alıyor ve \`icteki\` alanına koyuyor. Atamadan sonra \`hizmet\` artık **dıştaki katmanı** gösteriyor; çekirdek içeride, hiç değişmeden duruyor.`
            : `Aynı hamle bir kez daha: [[${a.cls}]] bu kez bir **katmanı** sarıyor. Onun için fark etmez, içteki de bir \`KargoHizmeti\`. Program çalışırken katman sayısı: **${j + 1}**.`,
        code: [M, `hizmet = new ${a.cls}(hizmet);`], stack: [fMain], out: 0, seq: -1, d: 4800,
        uml: { classes: [a.cls, 'EkHizmet'], edges: ['gen-' + k, 'agg'] },
        stage: {
          core: p.core,
          layers: L.slice(0, j + 1),
          active: j + 1,
          banner: { text: j === 0 ? `\`new ${a.cls}(hizmet)\`: eski nesne **içeride**, \`hizmet\` dış katmanda.` : `${j + 1}. katman: \`new ${a.cls}(hizmet)\` bir **katmanı** sardı.` },
        },
      });
    });
    steps.push({
      t: 'Önce aciklama(): metin katman katman',
      x: `Java \`+\` işlemlerini soldan sağa yapar; önce \`hizmet.aciklama()\` çalışır. Her katman içtekine sorar, metnin sonuna **kendi adını** ekler. Şimdi aynı yolculuğu \`ucret()\` ile **adım adım** izleyelim.`,
      code: [M, 'hizmet.aciklama()'], stack: [fMain], out: 0, seq: -1, d: 5600,
      uml: { members: [['KargoHizmeti', 'aciklama']] },
      stage: st({ banner: { text: `\`aciklama()\` → "${desc}"` } }),
    });

    // ---- çağrı içeri iner: en dıştan çekirdeğe
    for (let i = n; i >= 0; i--) {
      const base = { stack: stackTo(i), out: 0, seq: n - i, d: 4200, uml: { members: [member(i)], edges: i ? ['agg'] : [] }, stage: st({ active: i, probe: { at: i, phase: 'call' } }) };
      if (i === 0) {
        steps.push(
          Object.assign(base, {
            t: `Çekirdek: ${core.cls}.ucret()`,
            x: `Çağrı çekirdeğe ulaştı. [[${core.cls}]] kimseye sormaz; cevabı kendisi verir: **${core.fee} TL**. Şimdi **dönüş** yolculuğu başlıyor.`,
            code: [CF, 'public int ucret()'],
          })
        );
      } else {
        const a = A(i);
        steps.push(
          Object.assign(base, {
            t: i === n ? `hizmet.ucret() → ${a.cls}` : `${a.cls}: içtekine sor`,
            x:
              i === n
                ? `Çağrı **en dıştaki** katmana, [[${a.cls}]]’ya geldi. Cevabı tek başına bilmiyor: önce **içtekine** soruyor, \`icteki.ucret()\`.`
                : `[[${a.cls}]] da aynısını yapıyor: \`icteki.ucret()\`. Çağrı bir katman daha **içeri** indi. Hiçbir katman zincirin tamamını bilmez; her biri yalnızca kendi \`icteki\`’ni tanır.`,
            code: [a.cls + '.java', 'return icteki.ucret()'],
          })
        );
      }
    }

    // ---- değer dışarı çıkar: her katman payını ekler
    for (let i = 0; i <= n; i++) {
      const base = { stack: stackTo(i), out: 0, seq: n + 1 + i, d: 4600, kind: 'ok', uml: { members: [member(i)], edges: i ? ['agg'] : [] }, stage: st({ active: i, probe: { at: i, phase: 'return' } }) };
      if (i === 0) {
        steps.push(
          Object.assign(base, {
            t: `return ${core.fee}`,
            x: `Çekirdek **${core.fee}** döndürdü. Değer, onu çağıran katmana, [[${A(1).cls}]]’ya doğru **dışarı** çıkıyor.`,
            code: [CF, `return ${core.fee};`],
          })
        );
      } else {
        const a = A(i);
        const op = `${tr[i - 1]} ${opOf(a)} = ${tr[i]}`;
        steps.push(
          Object.assign(base, {
            t: `${a.cls}: ${op}`,
            x: `[[${a.cls}]] içtekinden gelen **${tr[i - 1]}** değerine **kendi payını** ekledi: ${op}. ${i < n ? `Değer bir katman daha dışarı, [[${A(i + 1).cls}]]’ya çıkıyor.` : 'En dıştaki katman toplamı **Main**’e teslim etti.'}`,
            code: [a.cls + '.java', 'return icteki.ucret()'],
          })
        );
      }
    }

    steps.push({
      t: `Ekranda: ${tr[n]} TL`,
      x: `Fiyatı hiçbir sınıf tek başına bilmiyordu; **zincir** hesapladı. Ara toplamlar: ${tr.join(' → ')}. Konsolda: \`${DC.line(p.core, L)}\``,
      code: [M, 'System.out.println('], stack: [fMain], out: 1, seq: 2 * n + 1, d: 5200,
      uml: { classes: ['Main', 'KargoHizmeti'], edges: ['uses'] },
      stage: st({ banner: { text: `✓ ${desc} = **${tr[n]} TL**`, tone: 'ok' } }),
    });
    steps.push({
      t: 'Sonuç: her katmanda iki iş',
      x: `Her dekoratör iki iş yapar: çağrıyı **içeri iletir**, gelen cevaba **kendi payını ekler**. İstemci için \`hizmet\` tek bir \`KargoHizmeti\`; içinde kaç katman olduğunu bilmez. Üstten **${other.label}** tarifini seçip başka bir zinciri izleyin.`,
      code: ['EkHizmet.java', 'protected final KargoHizmeti icteki;'], stack: [fMain], out: 1, seq: 2 * n + 1, d: 6400,
      uml: { classes: ['EkHizmet'], edges: ['agg', 'r-dec'] },
      stage: st({ banner: { text: 'Çağrı **içeri** iner · değer **dışarı** çıkarken her katman payını ekler.', tone: 'ok' } }),
    });
    return steps;
  }

  /** Sınıf diyagramında tarifin katmanları görünsün: tarifteki dekoratörler + eksik kalan yere varsayılanlar */
  function decsFor(p) {
    const ks = p.layers.filter((k, i, a) => a.indexOf(k) === i);
    ['ekspres', 'sigorta', 'zincir'].forEach((k) => ks.length < 3 && !ks.includes(k) && ks.push(k));
    return DC.addonOrder.filter((k) => ks.includes(k));
  }

  DC.scenes.flow = function (root, ctx) {
    const S = ctx.state;
    let p = DC.presets[S.preset] || DC.presets.ekspresSigorta;
    const el = h('div', { class: 'scene scene-flow' });
    const toolbar = h('div', { class: 'scene-toolbar' });
    const body = h('div', { class: 'flow-body' + (S.showCode === false ? ' hide-code' : '') });
    el.append(toolbar, body);
    root.appendChild(el);

    const presetSeg = kit.seg(
      DC.presetOrder.map((k) => {
        const q = DC.presets[k];
        return { v: k, html: `<span class="dc-seg-ic">${q.layers.map((x) => DC.ADDONS[x].icon).join('')}</span>${esc(q.label)}`, title: DC.expr(q.core, q.layers) };
      }),
      p.key,
      (k) => setPreset(k),
      { label: 'Sipariş tarifi' }
    );
    const viewSeg = kit.seg(
      [
        { v: 'stage', label: 'Sahne' },
        { v: 'seq', label: 'Sıralama diyagramı' },
        { v: 'uml', label: 'Sınıf diyagramı' },
      ],
      S.view || 'stage',
      (k) => setView(k),
      { label: 'Görünüm' }
    );
    const codeBtn = h('button', { class: 'btn btn-ghost btn-sm', type: 'button', title: 'Kod panelini göster/gizle' }, 'Kod paneli');
    codeBtn.addEventListener('click', () => {
      S.showCode = body.classList.contains('hide-code');
      body.classList.toggle('hide-code', !S.showCode);
      codeBtn.classList.toggle('is-on', S.showCode);
    });
    codeBtn.classList.toggle('is-on', S.showCode !== false);
    const exprHint = h('code', { class: 'dc-expr-hint', title: 'Aynı zincir tek satırda' });
    toolbar.append(h('span', { class: 'tb-label' }, 'Sipariş:'), presetSeg.el, exprHint, h('span', { class: 'tb-spacer' }), viewSeg.el, codeBtn);

    const viewPanel = h('section', { class: 'panel flow-view' });
    const views = { stage: h('div', { class: 'fv fv-stage' }), seq: h('div', { class: 'fv fv-seq' }), uml: h('div', { class: 'fv fv-uml' }) };
    Object.values(views).forEach((x) => viewPanel.appendChild(x));
    const codeCol = h('div', { class: 'flow-code' });
    const stackEl = h('div', { class: 'callstack', 'aria-label': 'Çağrı yığını' });
    const cvPanel = h('section', { class: 'panel flow-cv' });
    const consoleEl = h('div', { class: 'console dc-flow-console', 'aria-live': 'polite' });
    codeCol.append(stackEl, cvPanel, consoleEl);
    body.append(viewPanel, codeCol);

    const stage = new DC.Layers(views.stage, { geom: DC.LAYOUT.flow });
    const cv = new DP.CodeView(cvPanel, { roleOf: DC.roleOf, special: DC.special });
    let uml = null;
    let seq = null;
    let steps = [];

    function load() {
      steps = flowSteps(p);
      cv.setFiles(DC.akisFiles(p), { active: 'Main.java', keepActive: false });
      exprHint.textContent = DC.expr(p.core, p.layers);
      views.seq.innerHTML = '';
      seq = new DP.SequenceDiagram(views.seq, DC.seqSpec(p), { roles: DC.roles });
      const spec = DC.gofDiagram({ notes: true, decs: decsFor(p) });
      if (uml) uml.update(spec, { animate: false });
      else uml = new DP.ClassDiagram(views.uml, spec, { roles: DC.roles, roleTags: true });
    }

    function setPreset(k) {
      if (DC.presets[k] === p) return;
      p = DC.presets[k];
      S.preset = k;
      presetSeg.set(k);
      load();
      stepper.setCount(steps.length, steps.map((s) => s.t));
      stepper.go(0, { force: true, animate: false });
    }

    function setView(k) {
      S.view = k;
      Object.keys(views).forEach((key) => (views[key].hidden = key !== k));
      viewSeg.set(k);
      if (stepper) render(stepper.index, -1, { animate: false });
    }

    function render(i, prev, info) {
      const s = steps[i];
      const ps = prev >= 0 && prev < steps.length ? steps[prev] : null;
      foot.set(i, steps.length, s.t, s.x);
      cv.clear();
      for (let j = 0; j < i; j++) cv.mark(steps[j].code[0], steps[j].code[1], 'trail', { show: false, scroll: false });
      cv.mark(s.code[0], s.code[1], s.kind || 'active', { flash: !!ps && ps.code[0] !== s.code[0] });
      renderStack(stackEl, s.stack);
      DC.renderConsole(
        consoleEl,
        '$ java Main',
        DC.akisOutput(p)
          .slice(0, s.out)
          .map((t) => ({ t, ok: true })),
        { animateFrom: info.animate && (!ps || ps.out !== s.out) ? 0 : null, cursor: s.out === 0 }
      );
      stage.render(s.stage, ps ? ps.stage : null, { animate: info.animate && S.view === 'stage' });
      seq.show(s.seq, info.animate && S.view === 'seq');
      uml.stopFx();
      if (s.uml) uml.focus(s.uml);
      else uml.clearFocus();
      el.classList.toggle('is-done', i === steps.length - 1);
    }

    const foot = ui.foot(el);
    let stepper = null;
    load();
    stepper = new DP.Stepper(foot.stepHost, {
      count: steps.length,
      labels: steps.map((s) => s.t),
      delayOf: (i) => (steps[i] && steps[i].d) || 4400,
      onChange: (i, prev, info) => render(i, prev, info),
    });
    setView(S.view || 'stage');
    return kit.stepApi(stepper, {
      destroy: () => {
        stepper.destroy();
        stage.destroy();
      },
    });
  };

  // ================================================================== 5. SİPARİŞ TEZGÂHI
  const TZ = DC.tezgah;

  DC.scenes.counter = function (root, ctx) {
    const S = ctx.state;
    S.tz = S.tz || { core: 'standart', layers: ['ekspres'] };
    const el = h('div', { class: 'scene scene-split dc-tz' });
    const body = h('div', { class: 'scene-body cols-tz' });
    const left = kit.panel('Sipariş tezgâhı', { cls: 'panel-code dc-left dc-tz-left' });
    const right = kit.panel('Katmanlar <span class="panel-sub">· en dıştaki, en son eklenen</span>', { cls: 'panel-side dc-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    // ---- denetimler: çekirdek, katman ekle, geri al / sıfırla / hesapla
    const coreSeg = kit.seg(
      ['standart', 'zarf'].map((c) => ({ v: c, html: `${esc(DC.CORES[c].label)} <b class="dc-seg-fee">${DC.CORES[c].fee} TL</b>`, title: `new ${DC.CORES[c].cls}()` })),
      S.tz.core,
      (c) => act((o) => (o.core === c ? false : void (o.core = c))),
      { label: 'Çekirdek' }
    );
    const addWrap = h('div', { class: 'dc-adds' });
    const addBtns = {};
    DC.addonOrder.forEach((k) => {
      const a = DC.ADDONS[k];
      const locked = k === 'hediye' && !S.hediyeUnlocked;
      const b = h('button', {
        class: `dc-add dl-${k}${locked ? ' is-locked' : ''}`,
        type: 'button',
        title: locked ? 'Önce “Genişlet” sahnesinde yazın' : `${a.doc} → new ${a.cls}(siparis)`,
        html: `<span class="dc-add-ic">${a.icon}</span><span class="dc-add-name">${esc(a.cls)}</span><span class="dc-add-fee">${locked ? '🔒' : a.pct ? '−%10' : '+' + a.fee}</span>`,
      });
      b.addEventListener('click', () => {
        if (locked) {
          DP.fx.toast('HediyePaketi henüz yazılmadı! “Genişlet” sahnesinde ekleyin.', 2600);
          ctx.flashScene('genislet');
          return;
        }
        act((o) => {
          if (o.layers.length >= DC.TEZGAH_MAX) {
            DP.fx.toast(`Ekranda en çok ${DC.TEZGAH_MAX} katman var; Java’da böyle bir sınır yok!`, 2600);
            return false;
          }
          o.layers.push(k);
        });
      });
      addBtns[k] = b;
      addWrap.appendChild(b);
    });
    const btnUndo = h('button', { class: 'btn btn-ghost btn-sm', type: 'button', title: 'En dıştaki katmanı çıkar' }, '↶ Geri al');
    const btnReset = h('button', { class: 'btn btn-ghost btn-sm', type: 'button', title: 'Bütün katmanları çıkar' }, '⟲ Sıfırla');
    const btnRun = h('button', { class: 'btn btn-primary btn-sm dc-run', type: 'button', title: 'ucret() çağrısını katman katman izle' }, '▶ Fiyatı hesapla');
    btnUndo.addEventListener('click', () => act((o) => (o.layers.length ? void o.layers.pop() : false)));
    btnReset.addEventListener('click', () => act((o) => (o.layers.length ? void (o.layers = []) : false)));
    btnRun.addEventListener('click', () => runPrice());
    const countEl = h('span', { class: 'dc-tz-count' });
    const controls = h(
      'div',
      { class: 'dc-tz-controls' },
      h('div', { class: 'dc-tz-row' }, h('span', { class: 'tb-label' }, 'Çekirdek:'), coreSeg.el),
      h('div', { class: 'dc-tz-row is-adds' }, h('span', { class: 'tb-label' }, 'Katman ekle:'), addWrap),
      h('div', { class: 'dc-tz-row' }, btnUndo, btnReset, countEl, h('span', { class: 'tb-spacer' }), btnRun)
    );
    const cvHost = h('div', { class: 'dc-cv' });
    const consoleEl = h('div', { class: 'console dc-console' });
    left.body.append(controls, cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: DC.roleOf, special: DC.special });

    // ---- sağ: katmanlar + ara toplamlar + açıklama
    const viewHost = h('div', { class: 'dc-view' });
    const trace = h('div', { class: 'dc-trace', 'aria-live': 'polite' });
    const extra = h('div', { class: 'dc-extra' });
    right.body.append(viewHost, trace, extra);
    const stage = new DC.Layers(viewHost, { geom: DC.LAYOUT.counter, varName: 'siparis' });

    const FREE = 3;
    const unlocked = !!S.hediyeUnlocked;
    const STEPS = [
      {
        t: 'Sıra 1: indirim en dışta',
        x: 'Kurumsal bir müşteri ekspres + sigorta istiyor ve **%10 indirim** hakkı var. İndirim **en dış** katman: içteki **toplamın** (125 TL) %10’unu düşüyor → **112 TL**. Soldaki **▶ Fiyatı hesapla** ile çağrıyı yeniden izleyebilirsiniz.',
        cfg: { core: 'standart', layers: TZ.sira1 },
      },
      {
        t: 'Sıra 2: indirim en içte',
        x: 'Aynı üç katman, **farklı sıra**: indirim şimdi **en içte** ve yalnızca çekirdeğe uygulanıyor (50 → 45); ekspres ve sigorta tam fiyat → **120 TL**. Dekoratörlerde **sıra anlam taşır**: kim kimi sarıyor?',
        cfg: { core: 'standart', layers: TZ.sira2 },
      },
      {
        t: 'Aynı katman iki kez',
        x: 'Müşteri hem kendisine hem alıcıya **SMS** istiyor: aynı katmanı **iki kez** sarıyoruz → 95 TL. Kalıtımla bu imkânsızdı; bir sınıf aynı atadan iki kez kalıtamaz.',
        cfg: { core: 'standart', layers: TZ.ikiSms },
      },
      {
        t: 'Serbest: kendi siparişinizi kurun',
        x: unlocked
          ? 'Sıra sizde! Çekirdeği seçin, katman ekleyin, **Geri al** ile en dıştaki katmanı çıkarın. Kod ve çıktı her tıklamada güncellenir; hepsi **çalışma anında**, yeni sınıf yazmadan. 🎁 **HediyePaketi** de artık tezgâhta!'
          : 'Sıra sizde! Çekirdeği seçin, katman ekleyin, **Geri al** ile en dıştaki katmanı çıkarın. Kod ve çıktı her tıklamada güncellenir; hepsi **çalışma anında**, yeni sınıf yazmadan. (🔒 Hediye paketi, **Genişlet** sahnesinde yazılınca açılır.)',
        free: true,
      },
    ];

    let cur = null; // ekrandaki sipariş {core, layers}
    let pendingFrom = null; // rehberli adımdan serbest kipe geçerken, farkın gösterileceği önceki sipariş
    let runTimers = [];

    function stopRun() {
      runTimers.forEach(clearTimeout);
      runTimers = [];
      btnRun.classList.remove('is-running');
    }

    /** Denetimlerden gelen değişiklik: rehberli adımdaysak o siparişten başlayıp serbest kipe geçer. */
    function act(fn) {
      const base = STEPS[stepper.index].free ? S.tz : cur;
      const next = { core: base.core, layers: base.layers.slice() };
      if (fn(next) === false) {
        coreSeg.set(cur.core);
        return;
      }
      S.tz = next;
      if (!STEPS[stepper.index].free) {
        pendingFrom = cur;
        stepper.go(FREE, { animate: true });
      } else draw(S.tz, true, cur);
    }

    function renderTrace(cfg, on) {
      const tr = DC.trace(cfg.core, cfg.layers);
      const c = DC.CORES[cfg.core];
      let html = `<span class="tb-label">Ara toplamlar:</span><span class="dc-tr is-core${on === 0 ? ' is-on' : ''}"><b>${esc(c.cls)}</b><i>${c.fee}</i></span>`;
      cfg.layers.forEach((k, i) => {
        const a = DC.ADDONS[k];
        html += `<span class="dc-tr-arrow">→</span><span class="dc-tr dl-${k}${on === i + 1 ? ' is-on' : ''}"><b>${a.icon} ${esc(opOf(a))}</b><i>${tr[i + 1]}</i></span>`;
      });
      html += `<span class="dc-tr-total">= ${tr[tr.length - 1]} TL</span>`;
      trace.innerHTML = html;
    }

    function renderExtra(i, animate) {
      const s = STEPS[i];
      if (i === 0) {
        extra.innerHTML = `<div class="sg-aside">${md('💬 **Sıra = sarma sırası:** en içteki `new` ilk eklenen, en dıştaki `new` son eklenen katmandır. Kodda yukarıdan aşağı okunan her satır bir katman daha **dışa** ekler.')}</div>`;
      } else if (i === 1) {
        const a = DC.trace('standart', TZ.sira1);
        const b = DC.trace('standart', TZ.sira2);
        extra.innerHTML = `
          <table class="cmp dc-cmp">
            <thead><tr><th></th><th>İndirim en dışta</th><th>İndirim en içte</th></tr></thead>
            <tbody>
              <tr><td>Ara toplamlar</td><td>${a.slice(0, -1).join(' → ')} → <b>${a[a.length - 1]}</b></td><td>${b.slice(0, -1).join(' → ')} → <b>${b[b.length - 1]}</b></td></tr>
              <tr><td>İndirim neye?</td><td>Toplama (125)</td><td>Yalnızca çekirdeğe (50)</td></tr>
            </tbody>
          </table>`;
      } else if (i === 2) {
        extra.innerHTML = `<div class="sg-aside">${md('💬 **Kalıtımla iki SMS?** `SmsliSmsliSigortaliKargo extends SmsliSigortaliKargo`… Kimse böyle bir sınıf yazmaz. Dekoratörle yalnızca **bir satır daha**: `siparis = new SmsBildirim(siparis);`')}</div>`;
      } else if (s.free) {
        extra.innerHTML = `<div class="dc-oneline"><span class="tb-label">Tek satırda:</span><code>${esc(DC.expr(cur.core, cur.layers))};</code></div>`;
      }
      if (animate && !s.free) DP.flash(extra, 'is-pop');
    }

    function draw(cfg, animate, from) {
      stopRun();
      const before = cur;
      cur = { core: cfg.core, layers: cfg.layers.slice() };
      coreSeg.set(cur.core);
      const n = cur.layers.length;
      cv.setFiles([{ name: 'Main.java', code: DC.tezgahMain(cur.core, cur.layers) }], {
        active: 'Main.java',
        keepActive: false,
        prev: from ? { 'Main.java': DC.tezgahMain(from.core, from.layers) } : null,
      });
      cv.mark('Main.java', 4 + n, 'focus', { smooth: false });
      DC.renderConsole(consoleEl, '$ javac *.java && java Main', [{ t: DC.line(cur.core, cur.layers), ok: true }], { animateFrom: animate ? 0 : null });
      stage.render({ core: cur.core, layers: cur.layers }, before ? { core: before.core, layers: before.layers } : null, { animate });
      renderTrace(cur, null);
      countEl.textContent = `${n} / ${DC.TEZGAH_MAX} katman`;
      btnUndo.disabled = !n;
      btnReset.disabled = !n;
      Object.keys(addBtns).forEach((k) => addBtns[k].classList.toggle('is-full', n >= DC.TEZGAH_MAX));
      if (STEPS[stepper ? stepper.index : 0].free) renderExtra(FREE, false);
    }

    /** ucret() çağrısını katman katman oynatır: içeri n → 0, dışarı 0 → n */
    function runPrice() {
      stopRun();
      const cfg = { core: cur.core, layers: cur.layers.slice() };
      const n = cfg.layers.length;
      const seq = [];
      for (let i = n; i >= 0; i--) seq.push({ at: i, phase: 'call' });
      for (let i = 0; i <= n; i++) seq.push({ at: i, phase: 'return' });
      const base = () => ({ core: cfg.core, layers: cfg.layers });
      let last = base();
      btnRun.classList.add('is-running');
      seq.forEach((pr, j) =>
        runTimers.push(
          setTimeout(() => {
            const s = Object.assign(base(), { active: pr.at, probe: pr });
            stage.render(s, last, { animate: true });
            last = s;
            renderTrace(cfg, pr.phase === 'return' ? pr.at : null);
          }, DP.dur(j * 640))
        )
      );
      runTimers.push(
        setTimeout(() => {
          stage.render(base(), last, { animate: false });
          renderTrace(cfg, null);
          DC.renderConsole(consoleEl, '$ javac *.java && java Main', [{ t: DC.line(cfg.core, cfg.layers), ok: true }], { animateFrom: 0 });
          btnRun.classList.remove('is-running');
        }, DP.dur(seq.length * 640 + 600))
      );
    }

    const foot = ui.foot(el);
    let stepper = null;
    stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: (i) => (STEPS[i].free ? 6000 : 9000),
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        el.classList.toggle('is-free', !!s.free);
        const from = s.free ? pendingFrom : null;
        pendingFrom = null;
        draw(s.free ? S.tz : s.cfg, info.animate, from);
        renderExtra(i, info.animate);
        // rehberli adıma ilerleyince fiyat bir kez kendiliğinden hesaplansın
        if (info.animate && !s.free) runTimers.push(setTimeout(runPrice, DP.dur(1000)));
      },
    });
    return kit.stepApi(stepper, {
      destroy: () => {
        stopRun();
        stepper.destroy();
        stage.destroy();
      },
    });
  };
})();
