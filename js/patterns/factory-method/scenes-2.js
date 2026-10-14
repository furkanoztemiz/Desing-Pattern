/*
 * Factory Method — sahneler (2/3): CANLI AKIŞ
 * Aynı yürütme adımı üç görünümde eş zamanlı izlenir: animasyon sahnesi, sıralama diyagramı, sınıf diyagramı.
 * Sağda Java kodu (aktif satır + yürütme izi), çağrı yığını ve konsol çıktısı.
 */
(function () {
  'use strict';
  const FM = DP.fm;
  const { h } = DP;
  const ui = FM.ui;
  const md = FM.md;

  const BASE = {
    client: false, factory: false, ref: false, order: 0, top: false, bottom: false, plan: false, abs: false, impl: false,
    dispatch: false, gear: false, smoke: false, product: 'none', lens: false, lensLine: false, call: false, done: false, bubble: null,
  };
  const st = (o) => Object.assign({}, BASE, o);

  /** Bir varyant için yürütme adımları. */
  function flowSteps(v, cargo) {
    const C = v.creator;
    const P = v.product;
    const prodKey = P.toLowerCase();
    const mainF = 'Main.java';
    const lojF = 'Lojistik.java';
    const crF = C + '.java';
    const prF = P + '.java';
    const fMain = { t: 'Main.main()', cls: 'Main' };
    const fMus = { t: 'Main.musteriKodu()', cls: 'Main' };
    const fPlan = { t: 'Lojistik.teslimatPlanla()', cls: 'Lojistik', self: C };
    const fFm = { t: C + '.aracOlustur()', cls: C, self: C };
    const fTes = { t: P + '.teslimEt()', cls: P };
    const built = { factory: true, ref: true };

    return [
      {
        t: 'Program başlıyor',
        x: 'Program [[Main]] sınıfının `main()` metodundan başlar. Sahnedeki fabrika henüz yalnızca bir **plan** (sınıf tanımı): ortada nesne yok.',
        code: [mainF, 'public static void main'],
        stack: [fMain],
        out: 0,
        seq: -1,
        uml: null,
        stage: st({ client: true, bubble: { at: 'client', text: 'Bir teslimat yapmam lazım!' } }),
      },
      {
        t: 'Somut yaratıcı seçiliyor',
        x: `\`new ${C}()\` ile nesne oluşturuldu. Değişkenin tipi [[Lojistik]] (soyut), nesnenin gerçek tipi [[${C}]]. Somut sınıf adı **yalnızca bu satırda** geçiyor.`,
        code: [mainF, `new ${C}()`],
        stack: [fMain],
        out: 0,
        seq: 0,
        uml: { classes: [C, 'Lojistik'], edges: ['gen-' + v.key] },
        stage: st(Object.assign({ client: true }, built)),
      },
      {
        t: 'İstemci yalnızca soyut tipi görür',
        x: '`musteriKodu()` içindeyiz. İstemci elindeki nesneyi [[Lojistik]] olarak görür ve `teslimatPlanla()` der. Hangi alt sınıfla konuştuğunu **bilmez**, bilmesine de gerek yoktur.',
        code: [mainF, 'lojistik.teslimatPlanla(yuk);'],
        stack: [fMain, fMus],
        out: 0,
        seq: 1,
        uml: { members: [['Lojistik', 'teslimatPlanla']] },
        stage: st(Object.assign({ client: true, order: 1 }, built)),
      },
      {
        t: 'Miras alınan iş mantığı çalışıyor',
        x: `\`teslimatPlanla()\` [[Lojistik]] sınıfında tanımlı; [[${C}]] onu **miras aldı**. Fabrikanın üst katı tüm alt sınıflarda aynıdır. Önce planlama mesajı yazılır.`,
        code: [lojF, 'System.out.println("[Plan]'],
        stack: [fMain, fMus, fPlan],
        out: 1,
        seq: 1,
        uml: { members: [['Lojistik', 'teslimatPlanla']] },
        stage: st(Object.assign({ top: true, plan: true, bubble: { at: 'top', text: 'Teslimatı planlıyorum. Önce bir araç lazım!' } }, built)),
      },
      {
        t: 'Fabrika metodu çağrılıyor',
        x: 'İş mantığının bir araca ihtiyacı var ama [[Lojistik]] hangi aracı üreteceğini bilmiyor: `aracOlustur()` **soyut** bir metot. Bu çağrı aslında `this.aracOlustur()` demektir.',
        code: [lojF, 'TasimaAraci arac = aracOlustur();'],
        stack: [fMain, fMus, fPlan],
        out: 1,
        seq: 2,
        uml: { members: [['Lojistik', 'aracOlustur']] },
        stage: st(Object.assign({ top: true, abs: true, bubble: { at: 'top', text: 'Hangi araç? Bilmiyorum! `aracOlustur()` soyut…' } }, built)),
      },
      {
        t: 'Polimorfizm: alt sınıfın metodu çalışır',
        x: `\`this\` bir [[${C}]] nesnesi olduğu için Java, **çalışma zamanında** alt sınıfın override ettiği \`aracOlustur()\` metodunu çağırır (dinamik bağlama · *dynamic dispatch*).`,
        code: [crF, 'protected TasimaAraci aracOlustur()'],
        stack: [fMain, fMus, fPlan, fFm],
        out: 1,
        seq: 2,
        uml: { members: [[C, 'aracOlustur']], travel: { edge: 'gen-' + v.key, reverse: true } },
        stage: st(Object.assign({ bottom: true, abs: true, dispatch: true, impl: true, gear: true, bubble: { at: 'bottom', text: `Ben [[${C}]]: ${v.productTr.toLocaleLowerCase('tr')} üretirim!` } }, built)),
      },
      {
        t: 'Ürün üretiliyor',
        x: `\`new ${P}()\` — kalıptaki **tek** somut üretim noktası. Hangi sınıfın örnekleneceğine [[${C}]] karar verdi.`,
        code: [crF, `return new ${P}();`],
        stack: [fMain, fMus, fPlan, fFm],
        out: 1,
        seq: 3,
        uml: { classes: [P], members: [[C, 'aracOlustur']], edges: ['cr-' + v.key], travel: { edge: 'cr-' + v.key } },
        stage: st(Object.assign({ bottom: true, impl: true, gear: true, smoke: true, product: 'built' }, built)),
      },
      {
        t: 'Ürün, arayüz tipiyle geri döner',
        x: `Araç [[Lojistik]] sınıfına döner ama orada \`TasimaAraci arac\` olarak görünür. [[Lojistik]], elindekinin bir [[${P}]] olduğunu **bilmez** — bilmesi de gerekmez.`,
        code: [lojF, 'TasimaAraci arac = aracOlustur();'],
        stack: [fMain, fMus, fPlan],
        out: 1,
        seq: 4,
        uml: { classes: ['TasimaAraci'], members: [['Lojistik', 'teslimatPlanla']], edges: ['real-' + prodKey], travel: { edge: 'real-' + prodKey } },
        stage: st(Object.assign({ top: true, product: 'built', lens: true, lensLine: true, bubble: { at: 'top', text: 'Elimde bir [[TasimaAraci]] var. Gerisi beni ilgilendirmez!' } }, built)),
      },
      {
        t: 'Arayüz üzerinden çağrı',
        x: '[[Lojistik]] yalnızca arayüzde tanımlı `teslimEt()` metodunu çağırır. Hangi kodun çalışacağına yine nesnenin gerçek tipi karar verecek.',
        code: [lojF, 'arac.teslimEt(yuk);'],
        stack: [fMain, fMus, fPlan],
        out: 1,
        seq: 5,
        uml: { members: [['TasimaAraci', 'teslimEt']] },
        stage: st(Object.assign({ top: true, product: 'built', lens: true, call: true }, built)),
      },
      {
        t: 'Somut ürün işini yapıyor',
        x: `Yine polimorfizm: çalışan kod [[${P}]] sınıfının \`teslimEt()\` metodu. ${v.productTr} yola çıktı!`,
        code: [prF, 'System.out.println'],
        stack: [fMain, fMus, fPlan, fTes],
        out: 2,
        seq: 5,
        uml: { members: [[P, 'teslimEt']], edges: ['real-' + prodKey], travel: { edge: 'real-' + prodKey, reverse: true } },
        stage: st(Object.assign({ product: 'delivering', lens: true }, built)),
      },
      {
        t: 'Teslimat tamam!',
        x: 'Bitti! Dikkat: [[Lojistik]] sınıfında **hiçbir somut sınıf adı geçmedi**. Şimdi yukarıdan başka bir somut yaratıcı seçip **aynı kodun** farklı bir ürünle çalıştığını izleyin.',
        code: [mainF, 'musteriKodu(lojistik,'],
        stack: [fMain],
        out: 2,
        seq: 7,
        uml: null,
        stage: st(Object.assign({ product: 'delivered', done: true, bubble: { at: 'dest', text: `✓ ${cargo} teslim edildi!` } }, built)),
      },
    ];
  }

  const DELAYS = [3200, 4600, 4200, 4200, 4600, 5200, 4600, 5000, 3800, 4400, 3000];

  FM.scenes.flow = function (root, ctx) {
    const S = ctx.state;
    let v = FM.variants[S.variant] || FM.variants.kara;
    if (v.extension && !S.havaUnlocked) v = FM.variants.kara;

    const el = h('div', { class: 'scene scene-flow' });
    const toolbar = h('div', { class: 'scene-toolbar' });
    const body = h('div', { class: 'flow-body' + (S.showCode === false ? ' hide-code' : '') });
    el.append(toolbar, body);
    root.appendChild(el);

    // ---- araç çubuğu: varyant, yük, görünüm, kod paneli
    const varItems = FM.variantOrder.map((k) => {
      const vv = FM.variants[k];
      const locked = vv.extension && !S.havaUnlocked;
      return {
        v: k,
        html: `${FM.art.icon(vv.vehicle)}<span>${vv.creator}</span>${locked ? FM.art.icon('lock') : ''}`,
        title: locked ? 'Önce “Genişlet” sahnesinde ekleyin' : `${vv.creator} → new ${vv.product}()`,
        disabled: locked,
        onLocked: () => {
          DP.fx.toast('Hava taşımacılığı henüz sistemde yok! “Genişlet” sahnesinde ekleyin.', 2600);
          ctx.flashScene('genislet');
        },
      };
    });
    const varSeg = ui.seg(varItems, v.key, (k) => setVariant(k), { cls: 'seg-variant', label: 'Somut yaratıcı' });
    if (!S.havaUnlocked) varSeg.btns.hava.classList.add('is-locked');

    const cargoInput = h('input', { class: 'input', type: 'text', maxlength: '32', spellcheck: 'false', 'aria-label': 'Yük' });
    cargoInput.value = S.cargo[v.key];
    cargoInput.addEventListener('input', () => {
      const clean = cargoInput.value.replace(/["\\]/g, '').trim() || v.cargo;
      S.cargo[v.key] = clean;
      rebuild(false);
    });

    const viewSeg = ui.seg(
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

    toolbar.append(
      h('span', { class: 'tb-label' }, 'Somut yaratıcı:'),
      varSeg.el,
      h('label', { class: 'tb-field' }, h('span', { class: 'tb-label' }, 'Yük:'), cargoInput),
      h('span', { class: 'tb-spacer' }),
      viewSeg.el,
      codeBtn
    );

    // ---- gövde: görünüm paneli + kod sütunu
    const viewPanel = h('section', { class: 'panel flow-view' });
    const views = {
      stage: h('div', { class: 'fv fv-stage' }),
      seq: h('div', { class: 'fv fv-seq' }),
      uml: h('div', { class: 'fv fv-uml' }),
    };
    Object.values(views).forEach((x) => viewPanel.appendChild(x));
    const codeCol = h('div', { class: 'flow-code' });
    const stackEl = h('div', { class: 'callstack', 'aria-label': 'Çağrı yığını' });
    const cvPanel = h('section', { class: 'panel flow-cv' });
    const consoleEl = h('div', { class: 'console', 'aria-live': 'polite' });
    codeCol.append(stackEl, cvPanel, consoleEl);
    body.append(viewPanel, codeCol);

    const stage = new FM.Stage(views.stage, { variant: v });
    const cv = new DP.CodeView(cvPanel, { roleOf: FM.roleOf, special: FM.special });
    let seq = null;
    let uml = null;
    let steps = [];

    function buildDiagrams() {
      views.seq.innerHTML = '';
      views.uml.innerHTML = '';
      seq = new DP.SequenceDiagram(views.seq, FM.seqSpec(v), { roles: FM.roles });
      uml = new DP.ClassDiagram(views.uml, FM.diagram({ hava: S.havaUnlocked, ghosts: !S.havaUnlocked }), { roles: FM.roles, roleTags: true });
    }

    function rebuild(resetStep) {
      const cargo = S.cargo[v.key];
      steps = flowSteps(v, cargo);
      cv.setFiles(FM.flowFiles(v, cargo), { keepActive: !resetStep });
      if (resetStep) {
        buildDiagrams();
        stepper.go(0, { force: true, animate: false });
      } else {
        stepper.go(stepper.index, { force: true, animate: false });
      }
    }

    function setVariant(k) {
      const nv = FM.variants[k];
      if (nv === v) return;
      v = nv;
      S.variant = k;
      cargoInput.value = S.cargo[k];
      stage.setVariant(v, true);
      rebuild(true);
    }

    function setView(k) {
      S.view = k;
      Object.keys(views).forEach((key) => (views[key].hidden = key !== k));
      viewSeg.set(k);
      if (stepper) render(stepper.index, -1, { animate: false });
    }

    function renderStack(all) {
      stackEl.innerHTML = '<span class="cs-label">Çağrı yığını</span>';
      // Derin yığınlarda en alttaki istemci çerçeveleri "…" ile özetlenir (dar sütuna sığsın).
      const frames = all.length > 3 ? all.slice(-2) : all;
      if (frames !== all) {
        stackEl.appendChild(h('span', { class: 'cs-frame cs-more', title: all.slice(0, -2).map((f) => f.t).join(' › ') }, '…'));
        stackEl.appendChild(h('span', { class: 'cs-sep' }, '›'));
      }
      frames.forEach((f, i) => {
        if (i) stackEl.appendChild(h('span', { class: 'cs-sep' }, '›'));
        const r = FM.roleOf(f.cls);
        stackEl.appendChild(
          h(
            'span',
            { class: 'cs-frame rc rc-' + r + (i === frames.length - 1 ? ' is-top' : '') },
            f.t,
            f.self && f.cls !== f.self ? h('span', { class: 'cs-this', html: `this: <b>${f.self}</b>` }) : null
          )
        );
      });
    }

    function renderConsole(n, animate) {
      const lines = FM.output(v, S.cargo[v.key]).slice(0, n);
      consoleEl.innerHTML = '<div class="console-head"><span></span><span></span><span></span> Konsol</div>';
      consoleEl.appendChild(h('div', { class: 'console-line is-cmd' }, '$ java Main'));
      lines.forEach((l, i) => {
        consoleEl.appendChild(h('div', { class: 'console-line' + (i === lines.length - 1 && animate ? ' is-new' : '') }, l));
      });
      consoleEl.appendChild(h('div', { class: 'console-cursor' }));
    }

    function render(i, prev, info) {
      const s = steps[i];
      const ps = prev >= 0 && prev < steps.length ? steps[prev] : null;
      foot.set(i, steps.length, s.t, s.x);

      // kod: iz + aktif satır
      cv.clear('active');
      cv.clear('trail');
      for (let j = 0; j < i; j++) cv.mark(steps[j].code[0], steps[j].code[1], 'trail', { show: false, scroll: false });
      cv.mark(s.code[0], s.code[1], 'active', { flash: !!ps && ps.code[0] !== s.code[0] });

      renderStack(s.stack);
      renderConsole(s.out, info.animate && (!ps || ps.out !== s.out));
      stage.render(s.stage, ps ? ps.stage : null, info);
      seq.show(s.seq, info.animate && S.view === 'seq');
      uml.stopFx();
      if (s.uml) uml.focus(s.uml);
      else uml.clearFocus();
      if (s.uml && s.uml.travel && info.animate && S.view === 'uml') uml.travel(s.uml.travel.edge, { reverse: s.uml.travel.reverse, duration: 1100 });
      el.classList.toggle('is-done', i === steps.length - 1);
    }

    const foot = ui.foot(el);
    let stepper = null;
    steps = flowSteps(v, S.cargo[v.key]);
    cv.setFiles(FM.flowFiles(v, S.cargo[v.key]));
    buildDiagrams();
    stepper = new DP.Stepper(foot.stepHost, {
      count: steps.length,
      labels: steps.map((s) => s.t),
      delayOf: (i) => DELAYS[i] || 4000,
      onChange: (i, prev, info) => render(i, prev, info),
    });
    setView(S.view || 'stage');

    return ui.stepApi(stepper, {
      destroy: () => {
        stepper.destroy();
        stage.destroy();
      },
    });
  };
})();
