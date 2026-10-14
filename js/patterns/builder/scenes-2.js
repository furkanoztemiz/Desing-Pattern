/*
 * Builder — sahneler (2/3): CANLI AKIŞ ve YÖNETİCİ
 *   Canlı Akış: akıcı Builder'ın çalışması — form (Builder nesnesi) adım adım dolar, paket yalnızca plandır;
 *               build() kontrol kapısından geçerse değişmez Gonderi doğar. Üç hazır tarif: vazo, aşı, eksik tarif.
 *   Yönetici  : GoF Builder — aynı tarif (Director) üç hazırlayıcıya uygulanır: paket, etiket, fiyat.
 */
(function () {
  'use strict';
  const BL = DP.bl;
  const { h } = DP;
  const kit = DP.kit;
  const ui = BL.ui;
  const md = BL.md;

  // ================================================================== 4. CANLI AKIŞ
  const STEP_TEXT = {
    nereden: (s) => `\`nereden(${s.arg})\` — değer **adıyla** veriliyor. Builder alanı doldurdu ve **kendisini (\`this\`) döndürdü**: zincir bir sonraki çağrıyla devam ediyor.`,
    nereye: (s) => `\`nereye(${s.arg})\` — sıra değişse bile anlam değişmez; her değerin bir adı var.`,
    agirlik: (s) => `\`agirlik(${s.arg})\` — varsayılan 1 kg’ın üzerine yazıldı. Verilmeseydi varsayılan kalırdı.`,
    kirilgan: () => '`kirilgan()` — parametresiz bir adım: çağırmak yeter. Teleskop kurucudaki `true/false` tahmini bitti.',
    sogukZincir: () => '`sogukZincir()` — yalnızca gerektiğinde çağrılan isteğe bağlı bir adım.',
    ekspres: () => '`ekspres()` — yine isteğe bağlı; çağrılmasa `false` kalırdı.',
    sigorta: (s) => `\`sigorta(${s.arg})\` — tutar eklendi. Paket hâlâ **plan**: ortada bir \`Gonderi\` yok.`,
  };

  /** Bir hazır tarifin bütün adımları (durum + kod + yığın + diyagram işaretleri). */
  function flowSteps(p) {
    const F = p.cls + '.java';
    const G = 'Gonderi.java';
    const fMain = { t: p.cls + '.main()', cls: p.cls };
    const fB = (m) => ({ t: 'Gonderi.Builder.' + m + '()', cls: 'Builder' });
    const n = p.steps.length;
    const fin = BL.fieldsOf(p.steps);
    const err = BL.validate(fin);
    const callTitle = p.cls + '.main()';
    const out = [];
    const values = (k) => {
      const g = BL.fieldsOf(p.steps.slice(0, k));
      return g;
    };
    const planG = (k) => {
      const g = values(k);
      if (!p.steps.slice(0, k).some((s) => s.m === 'agirlik')) g.agirlik = null;
      return g;
    };
    const setOf = (k) => p.steps.slice(0, k).map((s) => s.field);

    out.push({
      t: 'Program başlıyor',
      x: `\`${p.cls}.main()\` başladı. Henüz ne bir **Builder** ne de bir **Gonderi** var.`,
      code: [F, 'public static void main'], stack: [fMain], out: 0, seq: -1, uml: null,
      stage: { mode: 'builder', call: { title: callTitle, text: 'main() başlıyor…', idle: true }, box: { state: 'none', g: {} } },
    });
    out.push({
      t: 'Builder nesnesi oluşuyor',
      x: '`new Gonderi.Builder()` — bilgileri toplayacak **yardımcı** nesne doğdu: alanları değişebilir ve varsayılan değerli. **Gonderi hâlâ yok**; sağdaki paket yalnızca bir plan.',
      code: [F, 'new Gonderi.Builder()'], stack: [fMain], out: 0, seq: 0,
      uml: { classes: ['Builder'] },
      stage: { mode: 'builder', call: { title: callTitle, text: 'new Gonderi.Builder()' }, form: { title: 'builder : Gonderi.Builder', values: values(0), set: [] }, box: { state: 'plan', g: planG(0) } },
    });
    p.steps.forEach((s, j) => {
      out.push({
        t: `.${s.m}(${s.arg})`,
        x: STEP_TEXT[s.m](s) + (j === 0 ? ' Her adım **aynı** Builder nesnesini döndürür.' : ''),
        code: [F, `.${s.m}(${s.arg})`], gmark: `public Builder ${s.m}(`,
        stack: [fMain, fB(s.m)], out: 0, seq: j + 1,
        uml: { members: [['Builder', s.m === 'nereden' || s.m === 'nereye' ? 'nereden' : s.m === 'kirilgan' ? 'kirilgan' : 'diger']] },
        stage: { mode: 'builder', call: { title: callTitle, text: `.${s.m}(${s.arg})`, ret: true }, form: { title: 'builder : Gonderi.Builder', values: values(j + 1), set: setOf(j + 1), hl: s.field }, box: { state: 'plan', g: planG(j + 1) } },
      });
    });
    const checks = [
      { t: '`nereden` ve `nereye` dolu', ok: !!(fin.nereden && fin.nereye) },
      { t: fin.kirilgan ? '`kirilgan` ⇒ `sigorta > 0`' : '`kirilgan` değil → sigorta şartı yok', ok: !(fin.kirilgan && fin.sigorta === 0) },
    ];
    out.push({
      t: 'build(): kontrol kapısı',
      x: err
        ? `\`build()\` kuralları denetliyor: **kırılgan ama sigortasız!** Builder istisna fırlatıyor ve **hiçbir Gonderi oluşmuyor** — hatalı bir nesne dışarı sızamaz. (${p.forgot})`
        : '`build()` kuralları **tek yerde** denetliyor: adresler dolu, kırılgansa sigortalı mı? Hepsi geçti ✓',
      code: [F, '.build()'], gmark: err && err.includes('kırılgan') ? 'if (kirilgan && sigorta == 0)' : 'public Gonderi build()',
      stack: [fMain, fB('build')], out: err ? 3 : 0, seq: err ? n + 2 : n + 1,
      uml: { members: [['Builder', 'build']] },
      err: !!err,
      stage: {
        mode: 'builder',
        call: { title: callTitle, text: err ? '.build()  ✗ IllegalStateException' : '.build()' },
        form: { title: 'builder : Gonderi.Builder', values: values(n), set: setOf(n), missing: err ? ['sigorta'] : [] },
        box: { state: 'plan', g: planG(n) },
        gate: { checks, lamp: err ? 'bad' : 'ok', verdict: err ? '**Reddedildi:** nesne oluşturulmadı.' : '**Geçti** → `new Gonderi(this)`' },
        bubble: err ? { at: 'box', text: 'Gonderi **hiç doğmadı**. Hata, nesne kullanılmadan önce yakalandı.', tone: 'bad' } : null,
      },
    });
    if (err) {
      out.push({
        t: 'Düzeltme: eksik adımı ekle',
        x: 'Çözüm tek satır: zincire `.sigorta(5000)` eklemek. Kural ihlali **derleme sonrası ilk çalıştırmada** ve **tek bir yerde** yakalandı; JavaBeans sürümünde ise sessizce yola çıkmıştı. Üstten **Cam vazo** tarifini seçip doğru hâlini izleyin.',
        code: [F, '.kirilgan()'], gmark: 'if (kirilgan && sigorta == 0)', stack: [fMain], out: 3, seq: n + 2, uml: { members: [['Builder', 'build']] }, err: true,
        stage: {
          mode: 'builder',
          call: { title: callTitle, text: '+ .sigorta(5000) eklenmeli' },
          form: { title: 'builder : Gonderi.Builder', values: values(n), set: setOf(n), missing: ['sigorta'] },
          box: { state: 'plan', g: planG(n) },
          gate: { checks, lamp: 'bad', verdict: '**Reddedildi:** nesne oluşturulmadı.' },
          bubble: { at: 'form', text: 'Eksik olan: `.sigorta(…)`. Builder hangi kuralın bozulduğunu **mesajıyla** söylüyor.' },
        },
      });
      return out;
    }
    out.push({
      t: 'new Gonderi(this): nesne doğuyor',
      x: 'Doğrulama geçti; `Gonderi` **ancak şimdi** oluşuyor: private kurucu Builder’daki değerleri `final` alanlara kopyalıyor. Bundan sonra paket **değiştirilemez** (kilit simgesi).',
      code: [G, 'return new Gonderi(this);'], gmark: 'private Gonderi(Builder b)',
      stack: [fMain, fB('build'), { t: 'new Gonderi(Builder)', cls: 'Gonderi' }], out: 0, seq: n + 2,
      uml: { classes: ['Gonderi'], members: [['Gonderi', 'ctor']], edges: ['create'] },
      stage: {
        mode: 'builder',
        call: { title: callTitle, text: '.build()' },
        form: { title: 'builder : Gonderi.Builder', values: values(n), set: setOf(n), done: true },
        box: { state: 'real', g: fin, sealed: true, final: true },
        gate: { checks, lamp: 'ok', verdict: '**Geçti** → `new Gonderi(this)`' },
      },
    });
    out.push({
      t: 'Değişmez gönderi yola çıkıyor',
      x: `\`${p.varName}\` artık tamamlanmış, doğrulanmış ve **değişmez** bir \`Gonderi\`. Builder’a ihtiyaç kalmadı; çöp toplayıcı onu temizler.`,
      code: [F, `System.out.println(${p.varName})`], stack: [fMain], out: 1, seq: n + 4,
      uml: { classes: ['Main', 'Gonderi'], edges: ['result'] },
      stage: {
        mode: 'builder',
        call: { title: callTitle, text: `System.out.println(${p.varName})` },
        form: { title: 'builder : Gonderi.Builder', values: values(n), set: setOf(n), done: true },
        box: { state: 'real', g: fin, sealed: true, final: true, pos: 'gone' },
        truck: 'go',
        bubble: { at: 'truck', text: '✓ ' + BL.describe(fin), tone: 'ok' },
      },
    });
    return out;
  }

  BL.scenes.flow = function (root, ctx) {
    const S = ctx.state;
    let p = BL.presets[S.preset] || BL.presets.vazo;
    const el = h('div', { class: 'scene scene-flow' });
    const toolbar = h('div', { class: 'scene-toolbar' });
    const body = h('div', { class: 'flow-body' + (S.showCode === false ? ' hide-code' : '') });
    el.append(toolbar, body);
    root.appendChild(el);

    const presetSeg = kit.seg(
      BL.presetOrder.map((k) => ({ v: k, html: `<span class="sg-dot ${k === 'hatali' ? 'is-bad' : 'is-ok'}"></span>${DP.esc(BL.presets[k].label)}`, title: BL.presets[k].cls + '.java' })),
      p.key,
      (k) => setPreset(k),
      { label: 'Gönderi tarifi' }
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
    toolbar.append(h('span', { class: 'tb-label' }, 'Gönderi tarifi:'), presetSeg.el, h('span', { class: 'tb-spacer' }), viewSeg.el, codeBtn);

    const viewPanel = h('section', { class: 'panel flow-view' });
    const views = { stage: h('div', { class: 'fv fv-stage' }), seq: h('div', { class: 'fv fv-seq' }), uml: h('div', { class: 'fv fv-uml' }) };
    Object.values(views).forEach((x) => viewPanel.appendChild(x));
    const codeCol = h('div', { class: 'flow-code' });
    const stackEl = h('div', { class: 'callstack', 'aria-label': 'Çağrı yığını' });
    const cvPanel = h('section', { class: 'panel flow-cv' });
    const consoleEl = h('div', { class: 'console bl-flow-console', 'aria-live': 'polite' });
    codeCol.append(stackEl, cvPanel, consoleEl);
    body.append(viewPanel, codeCol);

    const stage = new BL.Stage(views.stage);
    const cv = new DP.CodeView(cvPanel, { roleOf: BL.roleOf, special: BL.special });
    const uml = new DP.ClassDiagram(views.uml, BL.fluentDiagram(), { roles: BL.roles, roleTags: true });
    let seq = null;
    let steps = [];

    function load() {
      steps = flowSteps(p);
      cv.setFiles(
        [
          { name: p.cls + '.java', code: BL.code.preset(p) },
          { name: 'Gonderi.java', code: BL.code.Gonderi },
        ],
        { active: p.cls + '.java', keepActive: false }
      );
      views.seq.innerHTML = '';
      seq = new DP.SequenceDiagram(views.seq, BL.seqSpec(p), { roles: BL.roles });
    }

    function setPreset(k) {
      if (BL.presets[k] === p) return;
      p = BL.presets[k];
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

    function renderStack(all) {
      stackEl.innerHTML = '<span class="cs-label">Çağrı yığını</span>';
      const frames = all.length > 3 ? all.slice(-2) : all;
      if (frames !== all) {
        stackEl.appendChild(h('span', { class: 'cs-frame cs-more', title: all.slice(0, -2).map((x) => x.t).join(' › ') }, '…'));
        stackEl.appendChild(h('span', { class: 'cs-sep' }, '›'));
      }
      frames.forEach((fr, i) => {
        if (i) stackEl.appendChild(h('span', { class: 'cs-sep' }, '›'));
        const r = BL.roleOf(fr.cls);
        stackEl.appendChild(h('span', { class: 'cs-frame' + (r ? ' rc rc-' + r : '') + (i === frames.length - 1 ? ' is-top' : '') }, fr.t));
      });
    }

    function render(i, prev, info) {
      const s = steps[i];
      const ps = prev >= 0 && prev < steps.length ? steps[prev] : null;
      foot.set(i, steps.length, s.t, s.x);
      cv.clear();
      for (let j = 0; j < i; j++) cv.mark(steps[j].code[0], steps[j].code[1], 'trail', { show: false, scroll: false });
      if (s.gmark) cv.mark('Gonderi.java', { block: s.gmark }, 'focus', { show: false, scroll: false });
      cv.mark(s.code[0], s.code[1], s.err && s.code[1] === '.build()' ? 'bad' : 'active', { flash: !!ps && ps.code[0] !== s.code[0] });
      renderStack(s.stack);
      const outLines = BL.presetOutput(p).slice(0, s.out);
      BL.renderConsole(consoleEl, '$ java ' + p.cls, outLines.map((l) => ({ t: l.t, err: l.err, ok: !l.err })), { animateFrom: info.animate && (!ps || ps.out !== s.out) ? 0 : null, cursor: !s.err });
      stage.render(s.stage, ps ? ps.stage : null, { animate: info.animate && S.view === 'stage' });
      seq.show(s.seq, info.animate && S.view === 'seq');
      if (s.uml) uml.focus(s.uml);
      else uml.clearFocus();
      el.classList.toggle('is-done', i === steps.length - 1 && !s.err);
    }

    const foot = ui.foot(el);
    let stepper = null;
    load();
    stepper = new DP.Stepper(foot.stepHost, {
      count: steps.length,
      labels: steps.map((s) => s.t),
      delayOf: () => 3800,
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

  // ================================================================== 5. YÖNETİCİ (GoF Director)
  const REACT_TEXT = {
    nereden: 'Paket alanı yazıyor, etiket “Gönderen” satırını basıyor, fiyat **hiçbir şey yapmıyor** — bir hazırlayıcı ilgilenmediği adımı boş geçebilir.',
    nereye: 'Aynı çağrı, üç farklı gövde: alan, etiket satırı, (fiyat için) yine boş.',
    agirlik: 'Paket ağırlığı yazdı, etiket satır bastı, fiyat **kg × 4 TL** ekledi.',
    kirilgan: '**Aynı** `kirilgan()` çağrısı: paket işaretlendi, etikete “KIRILACAK” basıldı, fiyata **+40 TL** eklendi.',
    sogukZincir: 'Soğuk zincir: paket işaretlendi, etikete “2-8 C” uyarısı basıldı, fiyata **+120 TL**.',
    ekspres: 'Ekspres: fiyat çarpanı **sonda** uygulanacak (× 1,5); diğerleri yalnızca işaretliyor.',
    sigorta: 'Sigorta: paket tutarı kaydetti, etiket satır bastı, fiyat tutarın **%1**’ini ekledi.',
  };

  BL.scenes.director = function (root, ctx) {
    const S = ctx.state;
    let recipe = BL.recipes[S.recipe] ? S.recipe : 'asi';
    const el = h('div', { class: 'scene scene-director' });
    const toolbar = h('div', { class: 'scene-toolbar' });
    const body = h('div', { class: 'scene-body bl-dir-body' + (S.showDirCode === false ? ' hide-code' : '') });
    el.append(toolbar, body);
    root.appendChild(el);

    const recipeSeg = kit.seg(
      Object.keys(BL.recipes).map((k) => ({ v: k, label: BL.recipes[k].label + ' tarifi', title: 'yonetici.' + BL.recipes[k].method + '(h)' })),
      recipe,
      (k) => setRecipe(k),
      { label: 'Tarif' }
    );
    const codeBtn = h('button', { class: 'btn btn-ghost btn-sm', type: 'button', title: 'Kod panelini göster/gizle' }, 'Kod paneli');
    codeBtn.addEventListener('click', () => {
      S.showDirCode = body.classList.contains('hide-code');
      body.classList.toggle('hide-code', !S.showDirCode);
      codeBtn.classList.toggle('is-on', S.showDirCode);
    });
    codeBtn.classList.toggle('is-on', S.showDirCode !== false);
    const hint = h('span', { class: 'tb-hint', html: md(S.jsonUnlocked ? 'JSON hazırlayıcısı eklendi ✓' : 'Main aynı tarifi her hazırlayıcıyla **ayrı ayrı** çalıştırır; burada yan yana izliyoruz') });
    toolbar.append(h('span', { class: 'tb-label' }, 'Yönetici tarifi:'), recipeSeg.el, h('span', { class: 'tb-spacer' }), hint, codeBtn);

    const left = kit.panel('Kod', { cls: 'panel-code bl-left bl-dir-code' });
    const right = h('section', { class: 'panel bl-dir-view' });
    body.append(left.el, right);
    const cvHost = h('div', { class: 'bl-cv' });
    const consoleEl = h('div', { class: 'console bl-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: BL.roleOf, special: BL.special });
    const view = new BL.DirectorStage(right);
    const json = !!S.jsonUnlocked;

    let steps = [];
    const DIR = 'GonderiYoneticisi.java';
    const MAIN = 'Main.java';

    function build() {
      const r = BL.recipes[recipe];
      const n = r.steps.length;
      const G = BL.gof;
      const files = [
        { name: DIR, code: G.GonderiYoneticisi },
        { name: MAIN, code: G.main(recipe, json) },
        { name: 'GonderiHazirlayici.java', code: G.GonderiHazirlayici },
        { name: 'Gonderi.java', code: G.Gonderi },
        { name: 'EtiketHazirlayici.java', code: G.EtiketHazirlayici },
        { name: 'FiyatHazirlayici.java', code: G.FiyatHazirlayici },
      ];
      if (json) files.push({ name: 'JsonHazirlayici.java', code: G.JsonHazirlayici });
      cv.setFiles(files, { active: DIR, keepActive: false });
      const method = `public void ${r.method}(`;
      const lineSpec = (j) => {
        const s = r.steps[j];
        return { find: (j === 0 ? 'h.' : '.') + s.m + '(' + s.arg + ')', nth: 1 };
      };
      const ownLine = (j) => {
        // tarifin kendi bloğundaki j. adım satırı (iki tarif aynı adımı kullanabilir)
        const src = G.GonderiYoneticisi.split('\n');
        const start = src.findIndex((l) => l.includes(method));
        const needle = lineSpec(j).find;
        for (let q = start; q < src.length; q++) if (src[q].includes(needle)) return q + 1;
        return start + 1;
      };
      steps = [
        { t: 'Aynı tarif, farklı ürünler', x: 'Yönetici (Director) **tarifi** bilir: hangi adımlar, hangi sırayla. Hazırlayıcı (Builder) ise adımların **nasıl** uygulanacağını bilir. `Main` aynı tarifi üç hazırlayıcıyla ayrı ayrı çalıştırıyor; burada üçünü **yan yana** izliyoruz.', code: [DIR, method], i: 0 },
      ];
      r.steps.forEach((s, j) => steps.push({ t: `.${s.m}(${s.arg})`, x: REACT_TEXT[s.m], code: [DIR, ownLine(j)], i: j + 1 }));
      steps.push({
        t: 'build(): her biri kendi ürünü',
        x: 'Her hazırlayıcı kendi ürününü verir: `Gonderi`, `String`, `int`. Ortak bir üst tipleri olmadığı için `build()` (GoF’ta **getResult**) arayüzde **değil**, her somut hazırlayıcıda tanımlı.',
        code: [MAIN, 'System.out.println(paket.build())'], extra: [[MAIN, 'System.out.println(etiket.build())'], [MAIN, '"Fiyat: " + fiyat.build()']], i: n + 1, out: true,
      });
      steps.push({
        t: 'Yöneticinin bilmedikleri',
        x: 'Yöneticinin kodunda **tek bir somut sınıf adı yok**: yalnızca `GonderiHazirlayici` arayüzü. Yeni bir temsil (ör. JSON) eklemek için yöneticiye **dokunmak gerekmez** → bunu **Genişlet** sahnesinde yapacağız.',
        code: [DIR, method], extra: [[DIR, { find: 'GonderiHazirlayici h', nth: 1 }], [DIR, { find: 'GonderiHazirlayici h', nth: 2 }]], i: n + 1, out: true,
      });
    }

    function setRecipe(k) {
      if (k === recipe) return;
      recipe = k;
      S.recipe = k;
      recipeSeg.set(k);
      build();
      stepper.setCount(steps.length, steps.map((s) => s.t));
      stepper.go(0, { force: true, animate: false });
    }

    function render(i, prev, info) {
      const s = steps[i];
      foot.set(i, steps.length, s.t, s.x);
      cv.clear();
      for (let j = 1; j < i; j++) if (steps[j].code[0] === DIR) cv.mark(DIR, steps[j].code[1], 'trail', { show: false, scroll: false });
      cv.mark(s.code[0], s.code[1], 'active', { flash: prev >= 0 && steps[prev] && steps[prev].code[0] !== s.code[0] });
      (s.extra || []).forEach(([f, spec]) => cv.mark(f, spec, 'focus', { show: false, scroll: false }));
      if (s.out) BL.renderConsole(consoleEl, '$ java Main', BL.gofOutput(recipe, json).map((t) => ({ t })), { animateFrom: info.animate && i === steps.length - 2 ? 0 : null });
      else BL.renderConsole(consoleEl, '$ java Main', [{ t: '(yönetici tarifi çalışıyor…)', dim: true }]);
      view.render({ recipe, i: s.i, json }, info.animate);
      el.classList.toggle('is-done', i === steps.length - 1);
    }

    const foot = ui.foot(el);
    let stepper = null;
    build();
    stepper = new DP.Stepper(foot.stepHost, {
      count: steps.length,
      labels: steps.map((s) => s.t),
      delayOf: () => 4600,
      onChange: (i, prev, info) => render(i, prev, info),
    });
    return kit.stepApi(stepper, {
      destroy: () => {
        stepper.destroy();
        view.destroy();
      },
    });
  };
})();
