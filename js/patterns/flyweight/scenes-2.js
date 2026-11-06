/*
 * Flyweight — sahneler (2/3): CANLI AKIŞ ve HARİTA TEZGÂHI
 *   Canlı Akış: Main noktaları ekler; Harita her işareti fabrikadan ister. Fabrika havuza bakar: yoksa bir kez
 *               yaratır (ikon diskten yüklenir), varsa AYNI nesneyi verir. Çizerken her nokta dışsal durumunu
 *               (x, y, etiket) paylaşılan işarete parametreyle verir: aynı kaşe, farklı yer.
 *   Tezgâh   : tasarım (paylaşım yok / kestirme / Flyweight) ve nokta sayısı seçilir; harita, ikon duvarı ya da
 *               havuz ve 64 MB'lık bellek göstergesi değişir. Kalıpsız tasarım tablette gerçekten çöker.
 */
(function () {
  'use strict';
  const FL = DP.fl;
  const { h } = DP;
  const kit = DP.kit;
  const ui = FL.ui;
  const md = FL.md;
  const esc = DP.esc;

  function renderStack(stackEl, frames) {
    stackEl.innerHTML = '<span class="cs-label">Çağrı yığını</span>';
    frames.forEach((fr, i) => {
      if (i) stackEl.appendChild(h('span', { class: 'cs-sep' }, '›'));
      const r = FL.roleOf(fr.cls);
      stackEl.appendChild(h('span', { class: 'cs-frame' + (r ? ' rc rc-' + r : '') + (i === frames.length - 1 ? ' is-top' : '') }, fr.t));
    });
  }

  // ================================================================== 4. CANLI AKIŞ
  function flowSteps(p) {
    const seq = FL.seqSpec(p);
    const r = seq.run;
    const msgOf = seq.msgOf;
    const MF = 'Main.java';
    const HF = 'Harita.java';
    const FF = 'IsaretFabrikasi.java';
    const TF = 'IsaretTuru.java';
    const NF = 'HaritaNoktasi.java';
    const DF = 'DepoIsareti.java';
    const fMain = { t: 'Main.main()', cls: 'Main' };
    const fEkle = { t: 'harita.ekle()', cls: 'Harita' };
    const fAl = { t: 'fabrika.al()', cls: 'IsaretFabrikasi' };
    const fCiz = { t: 'harita.ciz()', cls: 'Harita' };
    const fNCiz = { t: 'n.ciz()', cls: 'HaritaNoktasi' };
    const steps = [];
    // sahne durumu adım adım değişir
    const S = { noktalar: [], havuz: [], ayri: [], ikon: 0 };
    let out = 0;
    const snap = (x) => {
      x = x || {};
      const hl = x.hl || {};
      return {
        mode: 'flyweight',
        noktalar: S.noktalar.map((n, i) => Object.assign({}, n, { hl: hl.row === i })),
        havuz: S.havuz.map((c) => Object.assign({}, c, { pay: S.noktalar.filter((n) => n.tur === c.tur).length, hl: hl.card === c.tur ? hl.kind : null })),
        ayri: S.ayri.map((c) => Object.assign({}, c, { hl: hl.card === 'depo' ? hl.kind : null })),
        gauge: { ikon: S.ikon, noktaKB: FL.bellek('flyweight', S.noktalar.length, S.ikon).noktaKB },
        lookup: x.lookup || null,
        token: x.token || null,
        banner: x.banner || null,
      };
    };
    const callLine = (it) => [MF, `harita.ekle("${it.etiket}"`];

    steps.push({
      t: 'Harita kuruldu',
      x: 'Main bir [[Harita]] yarattı. Haritanın içinde boş bir [[IsaretFabrikasi]] var: `havuz` boş, `noktalar` boş. Henüz **hiçbir ikon** yüklenmedi.',
      code: [MF, 'Harita harita = new Harita();'], dev: [HF, 'private final IsaretFabrikasi fabrika = new IsaretFabrikasi();'], stack: [fMain], out: 0, seq: -1, d: 5200,
      uml: { classes: ['Harita', 'IsaretFabrikasi'], edges: ['fabrika'] },
      stage: snap({ banner: { text: 'Fabrika hazır: **havuz boş**, bellekte ikon yok.' } }),
    });

    r.iz.forEach((z, i) => {
      const it = z.it;
      if (it.depo) {
        S.ikon++;
        S.ayri.push({ etiket: it.etiket, depo: it.depo, no: z.no });
        steps.push({
          t: `\`new DepoIsareti("${it.depo.sehir}", ${it.depo.doluluk})\``,
          x: `Depo işaretini **Main kendisi** yarattı; fabrikaya hiç sorulmadı. [[DepoIsareti]] kendi fotoğrafını yükledi (16 KB) ve kendi durumunu tutuyor (doluluk %${it.depo.doluluk}): **paylaşılmayan** bir işaret.`,
          code: [MF, 'new DepoIsareti('], dev: [DF, 'this.foto = new Ikon('], stack: [fMain, { t: 'new DepoIsareti()', cls: 'DepoIsareti' }], out, seq: msgOf['create:' + i], d: 5600,
          uml: { classes: ['DepoIsareti'], edges: ['r-depo'], members: [['DepoIsareti', 'doluluk'], ['DepoIsareti', 'foto']] },
          stage: snap({ hl: { card: 'depo', kind: 'new' }, token: { from: 'disk:depo', to: 'card:depo', text: `depo-${it.depo.sehir}.png`, kind: 'load' } }),
        });
        S.noktalar.push({ etiket: it.etiket, x: it.x, y: it.y, depo: it.depo, no: z.no });
        const ri = S.noktalar.length - 1;
        steps.push({
          t: `harita.ekle("${it.etiket}", …)`,
          x: '[[Harita]] onu da aynı yolla sakladı: `ekle(etiket, x, y, Isaret)` işaretin paylaşılıp paylaşılmadığını **sormaz**. Yeni nokta: etiket, konum ve depoya bir başvuru.',
          code: callLine(it), dev: [HF, 'noktalar.add(new HaritaNoktasi(etiket, x, y, isaret));'], stack: [fMain, fEkle], out, seq: msgOf['add:' + i], d: 5000,
          uml: { classes: ['Harita', 'HaritaNoktasi'], edges: ['noktalar', 'isaret'] },
          stage: snap({ hl: { row: ri } }),
        });
        return;
      }
      const ilk = !S.havuz.length;
      steps.push({
        t: `ekle("${it.etiket}") → al("${it.tur}")`,
        x: ilk
          ? `[[Harita]] noktayı eklemeden önce işareti **fabrikadan** istiyor: \`fabrika.al("${it.tur}")\`. Kendisi \`new IsaretTuru(…)\` demiyor; paylaşımı fabrika yönetecek.`
          : `\`${it.etiket}\` bir **${it.tur}**: Harita yine fabrikaya soruyor, \`fabrika.al("${it.tur}")\`.`,
        code: callLine(it), dev: [HF, 'ekle(etiket, x, y, fabrika.al(tur));'], stack: [fMain, fEkle, fAl], out, seq: msgOf['al:' + i], d: 4600,
        uml: { classes: ['Harita', 'IsaretFabrikasi'], edges: ['fabrika'], members: [['IsaretFabrikasi', 'al']] },
        stage: snap({ token: { from: 'rows', to: 'pool', text: `al("${it.tur}")`, kind: 'req' } }),
      });
      if (z.olay === 'yeni') {
        S.ikon++;
        S.havuz.push({ tur: it.tur, no: z.no });
        out = z.cikti[z.cikti.length - 1] + 1;
        steps.push({
          t: `Havuzda yok: yeni ${it.tur}`,
          x: `\`havuz.get("${it.tur}")\` **null** döndü: bu tür ilk kez isteniyor. Fabrika bir [[IsaretTuru]] yarattı, ikon diskten **bir kez** yüklendi (16 KB) ve nesne havuza kondu. Konsola bakın: \`${it.tur}.png#${z.no}\`.`,
          code: [FF, 'isaret = new IsaretTuru(tur);'], dev: [TF, 'this.ikon = new Ikon(ad + ".png");'], stack: [fMain, fEkle, fAl, { t: 'new IsaretTuru()', cls: 'IsaretTuru' }], out, seq: msgOf['put:' + i], d: 5800,
          uml: { classes: ['IsaretFabrikasi', 'IsaretTuru'], edges: ['havuz'], members: [['IsaretFabrikasi', 'havuz'], ['IsaretTuru', 'ikon']] },
          stage: snap({ lookup: { tur: it.tur, sonuc: 'miss' }, hl: { card: it.tur, kind: 'new' }, token: { from: 'disk:' + it.tur, to: 'card:' + it.tur, text: it.tur + '.png', kind: 'load' } }),
        });
      } else {
        steps.push({
          t: `Havuzda var: aynı ${it.tur}`,
          x: `\`havuz.get("${it.tur}")\` **bulundu**: fabrika yeni bir nesne yaratmadı, havuzdaki \`${it.tur}.png#${z.no}\` nesnesini **olduğu gibi** verdi. Disk okunmadı, bellek değişmedi, konsola satır yazılmadı.`,
          code: [FF, 'return isaret;'], dev: [FF, 'IsaretTuru isaret = havuz.get(tur);'], stack: [fMain, fEkle, fAl], out, seq: msgOf['ret:' + i], d: 5600,
          uml: { classes: ['IsaretFabrikasi'], edges: ['havuz'], members: [['IsaretFabrikasi', 'havuz'], ['IsaretFabrikasi', 'al']] },
          stage: snap({ lookup: { tur: it.tur, sonuc: 'hit' }, hl: { card: it.tur, kind: 'hit' }, banner: { text: `Aynı nesne: **${it.tur}.png#${z.no}** ikinci kez kullanılıyor.`, tone: 'ok' } }),
        });
      }
      S.noktalar.push({ etiket: it.etiket, x: it.x, y: it.y, tur: it.tur, no: z.no });
      const ri = S.noktalar.length - 1;
      const pay = S.noktalar.filter((n) => n.tur === it.tur).length;
      steps.push({
        t: `Nokta: ${it.etiket}`,
        x:
          pay > 1
            ? `Yeni [[HaritaNoktasi]] de **aynı** \`${it.tur}\` nesnesini gösteriyor: ${pay} nokta, tek işaret. Noktalar yalnızca **dışsal** durumu tutuyor: kendi etiketi ve konumu.`
            : `Yeni [[HaritaNoktasi]] yalnızca **dışsal** durumu tutuyor: \`${it.etiket}\`, \`(${it.x}, ${it.y})\` ve paylaşılan işarete bir **başvuru**. İkon noktada değil, işarette.`,
        code: callLine(it), dev: [NF, 'this.isaret = isaret;'], stack: [fMain, fEkle], out, seq: msgOf['add:' + i], d: 5200,
        uml: { classes: ['HaritaNoktasi'], edges: ['noktalar', 'isaret'], members: [['HaritaNoktasi', 'isaret'], ['HaritaNoktasi', 'etiket'], ['HaritaNoktasi', 'xy']] },
        stage: snap({ hl: { row: ri, card: it.tur, kind: pay > 1 ? 'hit' : null } }),
      });
    });

    // çizim: her nokta dışsal durumunu işarete verir
    const kullan = {};
    r.liste.forEach((e, j) => {
      const line = r.lines.findIndex((l) => (l.k === 'ciz' || l.k === 'depo') && l.i === j);
      out = line + 1;
      S.noktalar[j].cizildi = true;
      const key = e.depo ? 'depo' : e.tur;
      kullan[key] = (kullan[key] || 0) + 1;
      const tekrar = !e.depo && kullan[key] > 1;
      const args = `${e.x}, ${e.y}, "${e.etiket}"`;
      steps.push({
        t: `${e.depo ? 'depo' : e.tur}.ciz(${e.x}, ${e.y}, …)`,
        x:
          j === 0
            ? `\`harita.ciz()\` noktaları geziyor. Her nokta kendi işaretine **dışsal durumunu** veriyor: \`isaret.ciz(${args})\`. İşaret konumu bilmiyordu; çağrıyla öğrendi ve çizdi.`
            : e.depo
            ? `Depo işareti de **aynı arayüzle** çağrıldı: \`ciz(${args})\`. Kendi durumunu (doluluk) kendisi biliyor; konumu yine çağrıyla geldi.`
            : tekrar
            ? `**Aynı** \`${e.tur}\` nesnesi bu kez \`(${args})\` ile çağrıldı: aynı kaşe, başka bir yer. Paylaşılan nesne değişmedi; değişen yalnızca parametreler.`
            : `Sıradaki nokta: \`${e.tur}\` işareti \`(${args})\` ile çizdi.`,
        code: e.depo ? [DF, 'System.out.println("[depo] "'] : [TF, 'System.out.println("[" + ad + "] "'],
        dev: [NF, 'isaret.ciz(x, y, etiket);'],
        stack: [fMain, fCiz, fNCiz, { t: 'isaret.ciz()', cls: e.depo ? 'DepoIsareti' : 'IsaretTuru' }],
        out, seq: msgOf['op:' + j], d: 5000,
        uml: { classes: ['HaritaNoktasi', e.depo ? 'DepoIsareti' : 'IsaretTuru'], edges: ['isaret'], members: [[e.depo ? 'DepoIsareti' : 'IsaretTuru', 'ciz']] },
        stage: snap({ hl: { row: j, card: key, kind: 'active' }, token: { from: 'card:' + key + ':r', to: 'pin:' + j, text: `(${e.x}, ${e.y}, ${e.etiket})`, kind: 'stamp' } }),
      });
    });

    const st = r.stats;
    steps.push({
      t: 'Sonuç: kaç ikon?',
      x: `${st.N} nokta, **${st.ikon} ikon** (${st.ikon * 16} KB). Her nokta kendi ikonunu taşısaydı ${st.N} ikon yüklenirdi. 10.000 noktada fark: 160.000 KB’a karşı 48 KB. Üstten öbür tarifi seçip karşılaştırın.`,
      code: [MF, 'System.out.println(harita.ozet());'], stack: [fMain], out: r.lines.length, seq: seq.spec.messages.length - 1, d: 6400,
      uml: { classes: ['IsaretFabrikasi', 'IsaretTuru', 'HaritaNoktasi'], edges: ['havuz', 'isaret'] },
      stage: snap({ banner: { text: `${st.N} nokta → **${st.ikon} ikon**, ${st.ikon * 16} KB`, tone: 'ok' } }),
    });
    return { steps, seq, run: r };
  }

  FL.scenes.flow = function (root, ctx) {
    const S = ctx.state;
    const unlocked = () => !!S.depoUnlocked;
    let p = FL.presets[S.preset] && (S.preset !== 'depo' || unlocked()) ? FL.presets[S.preset] : FL.presets.uc;
    const el = h('div', { class: 'scene scene-flow' });
    const toolbar = h('div', { class: 'scene-toolbar' });
    const body = h('div', { class: 'flow-body' + (S.showCode === false ? ' hide-code' : '') });
    el.append(toolbar, body);
    root.appendChild(el);

    const presetSeg = kit.seg(
      FL.presetOrder.map((k) => {
        const P = FL.presets[k];
        const locked = P.locked && !unlocked();
        return {
          v: k,
          html: (locked ? '🔒 ' : '') + esc(P.title),
          title: k === 'uc' ? 'KRG-1001 (koli), KRG-1002 (zarf), KRG-1003 (koli)' : 'Koli, Malatya aktarma merkezi (paylaşılmayan) ve yine koli',
          disabled: locked,
          onLocked: () => {
            DP.fx.toast('DepoIsareti henüz yazılmadı! “Genişlet” sahnesinde ekleyin.', 2600);
            ctx.flashScene('genislet');
          },
        };
      }),
      p.key,
      (k) => setPreset(k),
      { label: 'Tarif' }
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
    toolbar.append(
      h('span', { class: 'tb-label' }, 'Tarif:'),
      presetSeg.el,
      h('span', { class: 'tb-hint fl-key', html: '<span class="fl-key-i">içsel</span> havuzda paylaşılır · <span class="fl-key-d">dışsal</span> noktada kalır' }),
      h('span', { class: 'tb-spacer' }),
      viewSeg.el,
      codeBtn
    );

    const viewPanel = h('section', { class: 'panel flow-view' });
    const views = { stage: h('div', { class: 'fv fv-stage' }), seq: h('div', { class: 'fv fv-seq' }), uml: h('div', { class: 'fv fv-uml' }) };
    Object.values(views).forEach((x) => viewPanel.appendChild(x));
    const codeCol = h('div', { class: 'flow-code' });
    const stackEl = h('div', { class: 'callstack', 'aria-label': 'Çağrı yığını' });
    const cvPanel = h('section', { class: 'panel flow-cv' });
    const consoleEl = h('div', { class: 'console fl-flow-console', 'aria-live': 'polite' });
    codeCol.append(stackEl, cvPanel, consoleEl);
    body.append(viewPanel, codeCol);

    const stage = new FL.Sahne(views.stage);
    const cv = new DP.CodeView(cvPanel, { roleOf: FL.roleOf, special: FL.special });
    let uml = null;
    let seq = null;
    let steps = [];
    let run = null;

    function load() {
      const f = flowSteps(p);
      steps = f.steps;
      run = f.run;
      cv.setFiles(FL.akisFiles(p), { active: 'Main.java', keepActive: false });
      views.seq.innerHTML = '';
      seq = new DP.SequenceDiagram(views.seq, f.seq.spec, { roles: FL.roles });
      const spec = FL.gofDiagram({ notes: true });
      if (uml) uml.update(spec, { animate: false });
      else uml = new DP.ClassDiagram(views.uml, spec, { roles: FL.roles, roleTags: true });
    }

    function setPreset(k) {
      if (FL.presets[k] === p) return;
      p = FL.presets[k];
      S.preset = k;
      presetSeg.set(k);
      load();
      stepper.setCount(steps.length, steps.map((s) => s.t.replace(/`/g, '')));
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
      // önce yığın ve konsol (yükseklikleri değişir), sonra koddaki işaret
      renderStack(stackEl, s.stack);
      FL.renderConsole(
        consoleEl,
        FL.cmd(FL.TABLET),
        run.lines.slice(0, s.out).map((l) => FL.consoleLine(l)),
        { animateFrom: info.animate && ps && s.out > ps.out ? ps.out : null, cursor: i < steps.length - 1 }
      );
      cv.clear();
      for (let j = 0; j < i; j++) cv.mark(steps[j].code[0], steps[j].code[1], 'trail', { show: false, scroll: false });
      if (s.dev) cv.mark(s.dev[0], s.dev[1], 'focus', { show: false, scroll: false });
      cv.mark(s.code[0], s.code[1], 'active', { flash: !!ps && ps.code[0] !== s.code[0] });
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
      labels: steps.map((s) => s.t.replace(/`/g, '')),
      delayOf: (i) => (steps[i] && steps[i].d) || 4800,
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

  // ================================================================== 5. HARİTA TEZGÂHI
  FL.scenes.counter = function (root, ctx) {
    const S = ctx.state;
    S.tz = S.tz || { mode: 'flyweight', n: 10000 };
    const el = h('div', { class: 'scene scene-split fl-tz' });
    const body = h('div', { class: 'scene-body cols-tz' });
    const left = kit.panel('Harita tezgâhı', { cls: 'panel-code fl-left fl-tz-left' });
    const right = kit.panel('Kurye tableti <span class="panel-sub">· 64 MB bellek</span>', { cls: 'panel-side fl-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    // ---- denetimler
    const modeSeg = kit.seg(
      FL.modeOrder.map((k) => ({ v: k, label: FL.MODES[k].title, title: FL.MODES[k].sub })),
      S.tz.mode,
      (v) => act((c) => (c.mode = v)),
      { label: 'Tasarım', cls: 'fl-mode' }
    );
    const nSeg = kit.seg(
      FL.NLER.map((n) => ({ v: String(n), label: FL.sayi(n), title: n === 3 ? 'Main’deki üç gönderi' : `üç gönderi + Gonderiler.ekle(harita, ${FL.sayi(n - 3)})` })),
      String(S.tz.n),
      (v) => act((c) => (c.n = Number(v))),
      { label: 'Nokta sayısı', cls: 'fl-nseg' }
    );
    const metrics = h('div', { class: 'fl-metrics' });
    const btnRun = h('button', { class: 'btn btn-primary btn-sm fl-run', type: 'button', title: 'Haritayı baştan yükle' }, '▶ Çalıştır');
    btnRun.addEventListener('click', () => runHarita());
    const controls = h(
      'div',
      { class: 'fl-tz-controls' },
      h('div', { class: 'fl-tz-row' }, h('span', { class: 'tb-label' }, 'Tasarım:'), modeSeg.el),
      h('div', { class: 'fl-tz-row' }, h('span', { class: 'tb-label' }, 'Nokta:'), nSeg.el, h('span', { class: 'tb-spacer' }), btnRun),
      metrics
    );
    const cvHost = h('div', { class: 'fl-cv' });
    const consoleEl = h('div', { class: 'console fl-console' });
    left.body.append(controls, cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: FL.roleOf, special: FL.special });

    // ---- sağ: harita ve bellek
    const viewHost = h('div', { class: 'fl-view' });
    const extra = h('div', { class: 'fl-extra' });
    right.body.append(viewHost, extra);
    const stage = new FL.Sahne(viewHost, { cls: 'is-tezgah' });

    const FREE = 4;
    const STEPS = [
      {
        t: 'Paylaşım yok · 1.000 nokta',
        x: 'Her nokta kendi ikonunu taşıyor. 1.000 noktada **1.000 ikon, 16.000 KB** (≈ 15,6 MB): tablet (64 MB) dayanıyor, ama göstergenin çeyreği aynı üç resmin kopyaları.',
        cfg: { mode: 'kopya', n: 1000 },
      },
      {
        t: '10.000 nokta: tablet çöker',
        x: 'Nokta sayısını on katına çıkarın: ≈ 3.950. noktada **OutOfMemoryError**. İkon belleği nokta sayısıyla **doğru orantılı** büyüyor; resim sayısı ise hâlâ üç.',
        cfg: { mode: 'kopya', n: 10000 },
      },
      {
        t: 'Kestirme: bellek düzelir, harita bozulur',
        x: 'Kestirme tasarımda 3 ikon, 48 KB. Ama haritaya bakın: 10.000 nokta **üç yere** yığıldı; Ali, Ayşe ve Zeynep’in gönderileri kayıp. Paylaşılan nesne **değişebilir** olduğu için son yazan kazandı.',
        cfg: { mode: 'kestirme', n: 10000 },
      },
      {
        t: 'Flyweight · 100.000 nokta',
        x: 'Flyweight’te ikon sayısı **tür sayısı** kadar: 100.000 noktada bile 3 ikon (48 KB). Noktalar hafif (≈ 85 bayt); toplam ≈ 8 MB. Harita doğru: her nokta kendi konumunda.',
        cfg: { mode: 'flyweight', n: 100000 },
      },
      {
        t: 'Serbest: siz deneyin',
        x: 'Tasarımı ve nokta sayısını seçin, **▶ Çalıştır** ile haritayı baştan yükleyin. Tablo üç tasarımı **aynı nokta sayısında** karşılaştırıyor; kod ve konsol seçtiğiniz programın gerçek hâli.',
        free: true,
      },
    ];

    let cur = null;
    let timers = [];
    let last = null;

    function stop() {
      timers.forEach(clearTimeout);
      timers = [];
      btnRun.classList.remove('is-running');
    }
    const at = (ms, fn) => timers.push(setTimeout(fn, DP.dur(ms)));
    const show = (st, animate) => {
      stage.render(st, last, { animate });
      last = st;
    };

    function act(fn) {
      const c = Object.assign({}, cur || S.tz);
      fn(c);
      S.tz = c;
      if (!STEPS[stepper.index].free) stepper.go(FREE, { animate: true });
      else draw(S.tz, true);
    }

    function renderMetrics(c) {
      const row = (mode) => {
        const r = FL.run(FL.tezgahProg({ mode, n: c.n }));
        const s = r.stats;
        const ikon = s.oom ? FL.CRASH_AT : s.ikon;
        const b = FL.bellek(mode, s.oom ? FL.CRASH_AT : s.N, ikon);
        const dogru = mode !== 'kestirme';
        return `<tr class="${mode === c.mode ? 'is-cur' : 'is-base'}"><th>${esc(FL.MODES[mode].title)}</th><td>${s.oom ? '≈ ' : ''}${FL.sayi(ikon)}</td><td>${s.oom ? '> 64 MB' : FL.kb(b.ikonKB)}</td><td>${s.oom ? '—' : '≈ ' + FL.kb(b.toplamKB)}</td><td class="${dogru ? 'is-ok' : 'is-bad'}">${dogru ? '✓ doğru' : '✗ yanlış'}</td><td class="${s.oom ? 'is-bad' : 'is-ok'}">${s.oom ? '✗ çöker' : '✓'}</td></tr>`;
      };
      metrics.innerHTML = `<table class="fl-mt"><thead><tr><th>${FL.sayi(c.n)} nokta</th><th>ikon</th><th>ikon belleği</th><th>toplam</th><th>harita</th><th>tablet</th></tr></thead><tbody>${FL.modeOrder.map(row).join('')}</tbody></table>`;
    }

    function finalState(c) {
      const prog = FL.tezgahProg(c);
      const r = FL.run(prog);
      const s = r.stats;
      const banner = s.oom
        ? { text: `≈ ${FL.sayi(FL.CRASH_AT)}. noktada **OutOfMemoryError**: ${FL.sayi(c.n)} noktanın ikonları 64 MB’a sığmıyor.`, tone: 'bad' }
        : c.mode === 'kestirme'
        ? { text: `**${s.ikon} ikon**, ama ${FL.sayi(c.n)} nokta **${Object.keys(s.havuz).length} konuma** yığıldı: harita yanlış.`, tone: 'bad' }
        : { text: `${FL.sayi(c.n)} nokta → **${FL.sayi(s.ikon)} ikon**, ${FL.kb(s.ikon * 16)} ikon verisi${c.mode === 'flyweight' ? ' · harita doğru' : ''}`, tone: 'ok' };
      return { st: FL.stateOf(prog, { run: r, banner }), r };
    }

    function draw(cfg, animate) {
      stop();
      cur = Object.assign({}, cfg);
      const c = cur;
      modeSeg.set(c.mode);
      nSeg.set(String(c.n));
      renderMetrics(c);
      const { st, r } = finalState(c);
      // önce konsol, sonra kod
      FL.renderConsole(consoleEl, FL.cmd(FL.TABLET, true), r.lines.map((l) => FL.consoleLine(l, c.mode === 'kestirme' ? { bad: (x) => x.k === 'ciz' && x.i < 3 } : {})), { animateFrom: animate ? 0 : null });
      const F = FL.tezgahFiles(c);
      const free = stepper && STEPS[stepper.index].free;
      const focus = { kopya: ['HaritaNoktasi.java', 'this.ikon = new Ikon(tur + ".png");'], kestirme: ['HaritaNoktasi.java', 'nokta.etiket = etiket;'], flyweight: ['IsaretFabrikasi.java', 'IsaretTuru isaret = havuz.get(tur);'] }[c.mode];
      cv.setFiles(FL.fileList(F), { active: free ? focus[0] : 'Main.java', keepActive: false });
      if (F.Gonderiler) cv.mark('Main.java', 'Gonderiler.ekle(harita,', 'focus', { smooth: false, show: false, scroll: cv.active === 'Main.java' });
      cv.mark(focus[0], focus[1], c.mode === 'flyweight' ? 'focus' : 'bad', { smooth: false, show: false, scroll: cv.active === focus[0] });
      if (animate) play(c, st);
      else show(st, false);
      renderExtra(c, r);
    }

    /** Haritayı baştan yükler: boş haritadan başlar, sahne doldurur (kalıpsızda çöker, kestirmede yığılır) */
    function play(c, fin) {
      btnRun.classList.add('is-running');
      const empty = Object.assign({}, fin, { N: 3, havuz: [], ikonlar: [], noktalar: [], ayri: [], banner: { text: 'Harita yükleniyor…' }, gauge: { ikon: 0, noktaKB: 0 } });
      delete empty.crash;
      delete empty.yigin;
      show(empty, false);
      at(250, () => {
        stage.fill(fin, empty, () => btnRun.classList.remove('is-running'));
        last = fin;
      });
    }

    function runHarita() {
      if (cur) draw(cur, true);
    }

    function renderExtra(c, r) {
      const s = r.stats;
      const say = s.sayac;
      extra.innerHTML = `<div class="fl-oneline"><span class="tb-label">Türler:</span>${FL.turOrder
        .map((t) => `<span class="fl-lg fl-t-${t}"><i></i>${t} × ${FL.sayi(say[t] || 0)}</span>`)
        .join('')}<span class="fl-lg-note">${c.mode === 'kopya' ? 'her noktaya bir ikon' : c.mode === 'kestirme' ? 'tür başına bir nokta nesnesi (üstüne yazılır)' : 'tür başına bir paylaşılan işaret'}</span></div>`;
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
        draw(s.free ? S.tz : s.cfg, info.animate);
      },
    });
    return kit.stepApi(stepper, {
      destroy: () => {
        stop();
        stepper.destroy();
        stage.destroy();
      },
    });
  };
})();
