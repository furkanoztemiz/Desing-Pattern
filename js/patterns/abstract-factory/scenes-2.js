/*
 * Abstract Factory — sahneler (2/3): CANLI AKIŞ
 * Bir gönderinin yürütülmesi üç görünümde eş zamanlı izlenir: animasyon sahnesi, sıralama diyagramı,
 * sınıf diyagramı. Sağda Java kodu (aktif satır + iz), çağrı yığını ve konsol.
 */
(function () {
  'use strict';
  const AF = DP.af;
  const { h } = DP;
  const kit = DP.kit;
  const ui = AF.ui;
  const art = DP.lojistik.art;
  const F = AF.families;

  const BASE = {
    main: false, mainLine: 0, factory: false, mref: false, office: false, cref: false, officeActive: false, order: null,
    top: false, bottom: false, chipArac: false, chipBelge: false, gear: false, printer: false, smoke: false,
    vehicle: 'none', doc: 'none', gate: 'idle', check: false, done: false, bubble: null,
  };
  const st = (o) => Object.assign({}, BASE, o);

  function flowSteps(f, cargo) {
    const mainF = 'Main.java';
    const srvF = 'TeslimatServisi.java';
    const facF = f.factory + '.java';
    const docF = f.doc + '.java';
    const gumF = 'Gumruk.java';
    const vehF = f.vehicle + '.java';
    const fMain = { t: 'Main.main()', cls: 'Main' };
    const fGon = { t: 'TeslimatServisi.gonder()', cls: 'TeslimatServisi' };
    const B = { factory: true, mref: true, mainLine: 1 };
    const C = Object.assign({ office: true, cref: true }, B);
    const at = (o) => st(Object.assign({}, C, o));

    return [
      {
        t: 'Program başlıyor',
        x: 'Program [[Main]] sınıfından başlar. Sahnedeki fabrika ve ofis henüz yalnızca **plan** (sınıf tanımı): ortada nesne yok.',
        code: [mainF, 'public static void main'],
        stack: [fMain], out: 0, seq: -1, uml: null,
        stage: st({ main: true, bubble: { at: 'main', text: 'Hangi aileyle çalışacağız? Karar **burada**, tek bir yerde verilecek.' } }),
      },
      {
        t: 'Aile seçiliyor',
        x: `\`new ${f.factory}()\` — tüm aile bu **tek satırla** seçildi. Değişkenin tipi [[LojistikFabrikasi]] (soyut), nesnenin tipi [[${f.factory}]].`,
        code: [mainF, `new ${f.factory}()`],
        stack: [fMain], out: 0, seq: 0,
        uml: { classes: [f.factory, 'LojistikFabrikasi'], edges: ['real-' + f.factory] },
        stage: st(Object.assign({ main: true }, B)),
      },
      {
        t: 'İstemci fabrikayı alıyor',
        x: '[[TeslimatServisi]] fabrikayı kendisi üretmiyor: kurucu parametresi olarak **alıyor** ve bir alanda saklıyor. Kararı kalıtım değil **kompozisyon** taşıyor.',
        code: [mainF, 'new TeslimatServisi(fabrika)'],
        stack: [fMain], out: 0, seq: 1,
        uml: { classes: ['TeslimatServisi', 'LojistikFabrikasi'], edges: ['has'] },
        stage: at({ bubble: { at: 'office', text: 'Fabrikayı ben üretmedim; bana **verildi**.' } }),
      },
      {
        t: 'Gönderi başlıyor',
        x: '`gonder()` çağrılıyor. İstemci, elindeki fabrikanın **hangi aileden** olduğunu bilmiyor; bilmesine de gerek yok.',
        code: [mainF, 'servis.gonder('],
        stack: [fMain], out: 0, seq: 2,
        uml: { members: [['TeslimatServisi', 'gonder']] },
        stage: at({ officeActive: true, bubble: { at: 'office', text: 'Bir **araç** ve bir **belge** lazım.' } }),
      },
      {
        t: 'Ürün A isteniyor',
        x: '`fabrika.aracOlustur()` — çağrı yalnızca [[LojistikFabrikasi]] arayüzü üzerinden yapılıyor.',
        code: [srvF, 'TasimaAraci arac = fabrika.aracOlustur();'],
        stack: [fMain, fGon], out: 0, seq: 3,
        uml: { members: [['LojistikFabrikasi', 'aracOlustur']], edges: ['has'] },
        stage: at({ officeActive: true, order: 'arac' }),
      },
      {
        t: 'Araç hattı çalışıyor',
        x: `Nesnenin gerçek tipi [[${f.factory}]] olduğu için onun \`aracOlustur()\` metodu çalışır: \`new ${f.vehicle}()\`.`,
        code: [facF, `return new ${f.vehicle}();`],
        stack: [fMain, fGon, { t: f.factory + '.aracOlustur()', cls: f.factory }], out: 0, seq: 4,
        uml: { classes: [f.vehicle], members: [[f.factory, 'aracOlustur']], edges: ['cr-' + f.key + '-a'], travel: { edge: 'cr-' + f.key + '-a' } },
        stage: at({ bottom: true, chipArac: true, gear: true, vehicle: 'built', bubble: { at: 'bottom', text: `${f.label} ailesi → **${f.vehicleTr}**` } }),
      },
      {
        t: 'Ürün B isteniyor — aynı fabrikadan',
        x: '`fabrika.belgeOlustur()` — belge **aynı** fabrika nesnesinden isteniyor. Tutarlılığın sırrı bu: bir aile, bir nesne.',
        code: [srvF, 'TasimaBelgesi belge = fabrika.belgeOlustur();'],
        stack: [fMain, fGon], out: 0, seq: 6,
        uml: { members: [['LojistikFabrikasi', 'belgeOlustur']], edges: ['has'] },
        stage: at({ officeActive: true, order: 'belge', vehicle: 'built', bubble: { at: 'office', text: 'Belgeyi de **aynı** fabrikadan istiyorum.' } }),
      },
      {
        t: 'Belge hattı çalışıyor',
        x: `[[${f.factory}]] kendi ailesinin belgesini basıyor: \`new ${f.doc}()\`. ${f.label} aracının yanına **${f.docName}** gelir; başka bir şey üretmesi mümkün değil.`,
        code: [facF, `return new ${f.doc}();`],
        stack: [fMain, fGon, { t: f.factory + '.belgeOlustur()', cls: f.factory }], out: 0, seq: 7,
        uml: { classes: [f.doc], members: [[f.factory, 'belgeOlustur']], edges: ['cr-' + f.key + '-b'], travel: { edge: 'cr-' + f.key + '-b' } },
        stage: at({ top: true, chipBelge: true, printer: true, smoke: true, vehicle: 'built', doc: 'printed', bubble: { at: 'top', text: `${f.label} ailesi → **${f.docName}** belgesi` } }),
      },
      {
        t: 'Belge hazırlanıyor',
        x: `\`belge.hazirla(yuk)\` — çalışan kod [[${f.doc}]] sınıfında. Aynı fabrikanın iki ürünü buluştu: belge araca takıldı.`,
        code: [docF, 'System.out.println'],
        stack: [fMain, fGon, { t: f.doc + '.hazirla()', cls: f.doc }], out: 1, seq: 9,
        uml: { members: [[f.doc, 'hazirla']] },
        stage: at({ vehicle: 'built', doc: 'attached' }),
      },
      {
        t: 'Gümrük kontrolü',
        x: `Gümrük, aracın gerektirdiği belgeyle gelen belgeyi karşılaştırıyor: ${f.docName} = ${f.docName} ✓. İkisi de aynı fabrikadan geldiği için **başka bir sonuç mümkün değildi**.`,
        code: [gumF, 'System.out.println("[Gümrük]'],
        stack: [fMain, fGon, { t: 'Gumruk.kontrolEt()', cls: 'Gumruk' }], out: 2, seq: 10,
        uml: null,
        stage: at({ vehicle: 'built', doc: 'stamped', gate: 'ok', check: true }),
      },
      {
        t: 'Teslimat',
        x: `\`arac.teslimEt(yuk)\` — çalışan kod [[${f.vehicle}]] sınıfında. ${f.vehicleTr} belgesiyle birlikte yola çıktı!`,
        code: [vehF, 'System.out.println'],
        stack: [fMain, fGon, { t: f.vehicle + '.teslimEt()', cls: f.vehicle }], out: 3, seq: 11,
        uml: { members: [[f.vehicle, 'teslimEt']] },
        stage: at({ vehicle: 'delivering', doc: 'stamped', gate: 'ok' }),
      },
      {
        t: 'Teslimat tamam!',
        x: 'Bitti! [[TeslimatServisi]] kodunda **hiçbir somut sınıf adı** geçmedi. Yukarıdan başka bir aile seçin: aynı istemci kodu, bambaşka ama yine **tutarlı** bir aileyle çalışacak.',
        code: [mainF, 'servis.gonder('],
        stack: [fMain], out: 3, seq: 12,
        uml: null,
        stage: at({ vehicle: 'delivered', doc: 'stamped', gate: 'ok', done: true, bubble: { at: 'dest', text: `✓ ${cargo} teslim edildi!` } }),
      },
    ];
  }

  const DELAYS = [3200, 4600, 4800, 3600, 4200, 4800, 4600, 5200, 4400, 5200, 4600, 3000];

  AF.scenes.flow = function (root, ctx) {
    const S = ctx.state;
    let f = F[S.family] || F.kara;
    if (f.extension && !S.havaUnlocked) f = F.kara;

    const el = h('div', { class: 'scene scene-flow' });
    const toolbar = h('div', { class: 'scene-toolbar' });
    const body = h('div', { class: 'flow-body' + (S.showCode === false ? ' hide-code' : '') });
    el.append(toolbar, body);
    root.appendChild(el);

    // ---- araç çubuğu: aile, yük, görünüm, kod paneli
    const famItems = AF.familyOrder.map((k) => {
      const ff = F[k];
      const locked = ff.extension && !S.havaUnlocked;
      return {
        v: k,
        html: `${art.icon(ff.kind)}<span>${ff.factory}</span>${locked ? art.icon('lock') : ''}`,
        title: locked ? 'Önce “Genişlet” sahnesinde ekleyin' : `${ff.factory} → ${ff.vehicle} + ${ff.doc}`,
        disabled: locked,
        onLocked: () => {
          DP.fx.toast('Hava ailesi henüz sistemde yok! “Genişlet” sahnesinde ekleyin.', 2600);
          ctx.flashScene('genislet');
        },
      };
    });
    const famSeg = kit.seg(famItems, f.key, (k) => setFamily(k), { cls: 'seg-variant', label: 'Somut fabrika' });
    if (!S.havaUnlocked) famSeg.btns.hava.classList.add('is-locked');

    const cargoInput = h('input', { class: 'input', type: 'text', maxlength: '32', spellcheck: 'false', 'aria-label': 'Yük' });
    cargoInput.value = S.cargo[f.key];
    cargoInput.addEventListener('input', () => {
      S.cargo[f.key] = cargoInput.value.replace(/["\\]/g, '').trim() || f.cargo;
      rebuild(false);
    });

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

    toolbar.append(
      h('span', { class: 'tb-label' }, 'Somut fabrika:'),
      famSeg.el,
      h('label', { class: 'tb-field' }, h('span', { class: 'tb-label' }, 'Yük:'), cargoInput),
      h('span', { class: 'tb-spacer' }),
      viewSeg.el,
      codeBtn
    );

    // ---- gövde
    const viewPanel = h('section', { class: 'panel flow-view' });
    const views = { stage: h('div', { class: 'fv fv-stage' }), seq: h('div', { class: 'fv fv-seq' }), uml: h('div', { class: 'fv fv-uml' }) };
    Object.values(views).forEach((x) => viewPanel.appendChild(x));
    const codeCol = h('div', { class: 'flow-code' });
    const stackEl = h('div', { class: 'callstack', 'aria-label': 'Çağrı yığını' });
    const cvPanel = h('section', { class: 'panel flow-cv' });
    const consoleEl = h('div', { class: 'console', 'aria-live': 'polite' });
    codeCol.append(stackEl, cvPanel, consoleEl);
    body.append(viewPanel, codeCol);

    const stage = new AF.Stage(views.stage, { family: f });
    const cv = new DP.CodeView(cvPanel, { roleOf: AF.roleOf, special: AF.special });
    let seq = null;
    let uml = null;
    let steps = [];

    function buildDiagrams() {
      views.seq.innerHTML = '';
      views.uml.innerHTML = '';
      seq = new DP.SequenceDiagram(views.seq, AF.seqSpec(f), { roles: AF.roles });
      uml = new DP.ClassDiagram(views.uml, AF.diagram({ hava: S.havaUnlocked }), { roles: AF.roles, roleTags: true });
    }

    function rebuild(reset) {
      const cargo = S.cargo[f.key];
      steps = flowSteps(f, cargo);
      cv.setFiles(AF.flowFiles(f, cargo), { keepActive: !reset });
      if (reset) {
        buildDiagrams();
        stepper.go(0, { force: true, animate: false });
      } else {
        stepper.go(stepper.index, { force: true, animate: false });
      }
    }

    function setFamily(k) {
      const nf = F[k];
      if (nf === f) return;
      f = nf;
      S.family = k;
      cargoInput.value = S.cargo[k];
      stage.setFamily(f, true);
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
      const frames = all.length > 3 ? all.slice(-2) : all;
      if (frames !== all) {
        stackEl.appendChild(h('span', { class: 'cs-frame cs-more', title: all.slice(0, -2).map((x) => x.t).join(' › ') }, '…'));
        stackEl.appendChild(h('span', { class: 'cs-sep' }, '›'));
      }
      frames.forEach((fr, i) => {
        if (i) stackEl.appendChild(h('span', { class: 'cs-sep' }, '›'));
        const r = AF.roleOf(fr.cls);
        stackEl.appendChild(h('span', { class: 'cs-frame' + (r ? ' rc rc-' + r : '') + (i === frames.length - 1 ? ' is-top' : '') }, fr.t));
      });
    }

    function renderConsole(n, animate) {
      const lines = AF.output(f, S.cargo[f.key]).slice(0, n);
      consoleEl.innerHTML = '<div class="console-head"><span></span><span></span><span></span> Konsol</div>';
      consoleEl.appendChild(h('div', { class: 'console-line is-cmd' }, '$ java Main'));
      lines.forEach((l, i) => consoleEl.appendChild(h('div', { class: 'console-line' + (i === lines.length - 1 && animate ? ' is-new' : '') }, l)));
      consoleEl.appendChild(h('div', { class: 'console-cursor' }));
    }

    function render(i, prev, info) {
      const s = steps[i];
      const ps = prev >= 0 && prev < steps.length ? steps[prev] : null;
      foot.set(i, steps.length, s.t, s.x);
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
    steps = flowSteps(f, S.cargo[f.key]);
    cv.setFiles(AF.flowFiles(f, S.cargo[f.key]));
    buildDiagrams();
    stepper = new DP.Stepper(foot.stepHost, {
      count: steps.length,
      labels: steps.map((s) => s.t),
      delayOf: (i) => DELAYS[i] || 4000,
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
})();
