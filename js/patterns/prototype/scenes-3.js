/*
 * Prototype — sahneler (3/3): Yapı, Katalog, Gerçek Dünya, Quiz, Özet ve kalıp kaydı
 */
(function () {
  'use strict';
  const PT = DP.pt;
  const { h } = DP;
  const kit = DP.kit;
  const ui = PT.ui;
  const md = PT.md;
  const C = PT.cargo;
  const KT = PT.katalog;

  // ================================================================== 6. YAPI
  const ROLE_TEXT = {
    client: 'Yeni bir nesneyi, bir prototipten <b>kendini kopyalamasını</b> isteyerek elde eder; somut sınıfı bilmez.',
    prototype: 'Kendini kopyalama işleminin <b>arayüzünü</b> tanımlar: <code>kopyala()</code> (GoF: <code>clone()</code>).',
    concretePrototype: 'Kendini kopyalama işlemini <b>gerçekler</b>; kopyanın ne kadar <b>derin</b> olacağına o karar verir.',
    manager: 'Prototipleri bir anahtarla saklar ve istemciye <b>kopyalarını</b> verir (GoF: <i>prototype manager</i>).',
  };

  function classInfo(id) {
    const alt = PT.altOrder.map((k) => PT.ALT[k]).find((a) => a.cls === id);
    if (alt)
      return {
        role: 'concretePrototype',
        file: alt.cls + '.java',
        code: PT.code[alt.cls],
        mark: `return new ${alt.cls}(this);`,
        points: [`\`kopyala()\`’yı kendi **kopya kurucusuyla** gerçekler.`, `Dönüş tipini daraltır: \`public ${alt.cls} kopyala()\` (kovaryant dönüş).`, `Kendi **private** alanını (\`${alt.field}\`) getter olmadan kopyalar.`],
      };
    switch (id) {
      case 'SiparisEkrani':
        return { role: 'client', file: 'SiparisEkrani.java', code: PT.code.SiparisEkrani, mark: 'return son.kopyala();', points: ['Somut sınıf adı **geçmez**; yalnızca `Gonderi` tipini bilir.', 'Yeni nesneyi prototipten ister: `son.kopyala()`.', 'Yeni bir gönderi türü eklense de **değişmez**.'] };
      case 'Gonderi':
        return { role: 'prototype', file: 'Gonderi.java', code: PT.code.Gonderi, mark: 'public abstract Gonderi kopyala();', points: ['Kopyalama **sözleşmesini** koyar: `kopyala()`.', 'Ortak alanları **kopya kurucu** kopyalar; pahalı kurulum tekrarlanmaz.', 'Değişebilir `icerik` listesini **derin** kopyalar.'] };
      case 'SablonKatalogu':
        return { role: 'manager', file: 'SablonKatalogu.java', code: KT.SablonKatalogu, mark: 'return sablon.kopyala();', points: ['Hazır şablonları **adlarıyla** saklar.', 'İstenince şablonun **kopyasını** verir; kendisini asla.', 'Çalışma anında yeni şablon eklenebilir (yeni sınıf gerekmez).'] };
      default:
        return null;
    }
  }

  PT.scenes.structure = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split' });
    const tools = h('div', { class: 'panel-tools' });
    const body = h('div', { class: 'scene-body cols-64' });
    const left = kit.panel('Yapı', { cls: 'panel-diagram', extra: tools });
    const right = kit.panel('Rol kartı <span class="panel-sub">· bir sınıfa tıklayın</span>', { cls: 'panel-side' });
    body.append(left.el, right.el);
    el.append(body);
    root.appendChild(el);

    const diagHost = h('div', { class: 'diag-host' });
    const legend = kit.umlLegend({ association: true, fmLabel: 'kopyala(): kopyalayarak oluşturur' });
    left.body.append(diagHost, legend);
    let view = 'gof';
    const spec = (v) => PT.gofDiagram({ katalog: v === 'katalog', notes: true });
    const diagram = new DP.ClassDiagram(diagHost, spec('gof'), {
      roles: PT.roles,
      onSelect: (id) => {
        showInfo(id);
        diagram.focus({ classes: [id] });
        diagram.select(id);
      },
    });

    const viewSeg = kit.seg(
      [
        { v: 'gof', label: 'GoF yapısı' },
        { v: 'katalog', label: 'Katalog ile' },
      ],
      'gof',
      (v) => setView(v)
    );
    const modeSeg = kit.seg(
      [
        { v: 'concrete', label: 'Somut' },
        { v: 'generic', label: 'Genel (GoF)' },
      ],
      'concrete',
      (v) => diagram.setMode(v)
    );
    const tagToggle = kit.toggle('Rol etiketleri', true, (on) => diagram.setRoleTags(on));
    tools.append(viewSeg.el, modeSeg.el, tagToggle);

    function setView(v) {
      if (v === view) return;
      view = v;
      viewSeg.set(v);
      diagram.update(spec(v), { animate: true });
    }

    const infoTop = h('div', { class: 'info-card' });
    const infoCode = h('div', { class: 'info-code' });
    right.body.append(infoTop, infoCode);

    function showInfo(id) {
      const info = classInfo(id);
      infoCode.innerHTML = '';
      if (!info) return;
      const r = PT.roles[info.role];
      infoTop.innerHTML = `
        <div class="info-role rc rc-${r.color}"><span class="info-dot"></span><b>${r.en}</b> · ${r.tr}</div>
        <div class="info-name rc rc-${r.color}">${DP.esc(id)}</div>
        <p class="info-desc">${ROLE_TEXT[info.role]}</p>
        <ul class="info-points">${info.points.map((p) => `<li>${md(p)}</li>`).join('')}</ul>`;
      const cv = new DP.CodeView(infoCode, { files: [{ name: info.file, code: info.code }], roleOf: PT.roleOf, special: PT.special, compact: true });
      cv.mark(info.file, info.mark, 'focus');
      DP.flash(infoTop, 'is-pop');
    }

    function showOverview() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">Üç rol + isteğe bağlı katalog</div>
        <div class="role-list">
          ${['prototype', 'concretePrototype', 'client', 'manager']
            .map((k) => `<div class="role-row rc rc-${PT.roles[k].color}"><span class="info-dot"></span><div><b>${PT.roles[k].en}</b> · ${PT.roles[k].tr}<div class="role-desc">${ROLE_TEXT[k]}</div></div></div>`)
            .join('')}
        </div>
        <p class="info-desc">Üstteki <b>Katalog ile</b> düğmesi, prototip yöneticisini (şablon kataloğunu) yapıya ekler.</p>`;
    }

    const CP = ['KoliGonderisi', 'ZarfGonderisi', 'PaletGonderisi'];
    const STEPS = [
      { t: 'Genel bakış', x: 'Prototype’ta üç rol var: **Prototype**, **ConcretePrototype** ve onları kullanan **Client**. İsteğe bağlı bir dördüncüsü: **Prototype Manager** (şablon kataloğu).', info: null, v: 'gof' },
      { t: 'Prototype — Prototip', x: '[[Gonderi]] kopyalama sözleşmesini koyar: soyut `kopyala()`. GoF diyagramında bu işlemin adı `clone()`’dur. (Pembe nokta: kopyalayarak **oluşturan** işlem.)', info: 'Gonderi', focus: { classes: ['Gonderi'], members: [['Gonderi', 'kopyala']] }, v: 'gof' },
      { t: 'ConcretePrototype — Somut Prototip', x: 'Her alt sınıf `kopyala()`’yı kendi kopya kurucusuyla gerçekler: `return new KoliGonderisi(this);` Düz çizgi + boş üçgen = **kalıtım** (extends).', info: 'KoliGonderisi', focus: { classes: CP, edges: ['gen-koli', 'gen-zarf', 'gen-palet'] }, v: 'gof' },
      { t: 'Client — İstemci', x: '[[SiparisEkrani]] elindeki prototipe “kendini kopyala” der. Diyagramda tek bir somut sınıfa bile **ok yok**: istemci yalnızca [[Gonderi]]’yi tanır.', info: 'SiparisEkrani', focus: { classes: ['SiparisEkrani'], edges: ['uses'] }, v: 'gof' },
      { t: 'Kovaryant dönüş tipi', x: 'Alt sınıflar `kopyala()`’nın dönüş tipini **daraltabilir**: `public KoliGonderisi kopyala()`. Somut tipi bilen kod `KoliGonderisi k2 = k.kopyala();` diyebilir — cast gerekmez.', info: 'KoliGonderisi', focus: { members: CP.map((c) => [c, 'kopyala']) }, v: 'gof' },
      { t: 'Prototype Manager — Katalog', x: '[[SablonKatalogu]] şablonları adlarıyla saklar ve **kopyalarını** verir. İstemci artık “hangi nesneden kopyalayayım?” sorusunu da bilmez: yalnızca bir **ad** söyler.', info: 'SablonKatalogu', focus: { classes: ['SablonKatalogu'], edges: ['kat'], members: [['SablonKatalogu', 'olustur']] }, v: 'katalog' },
      { t: 'Factory Method ile fark', x: 'Factory Method’da her ürün için bir **yaratıcı alt sınıf** gerekir (paralel hiyerarşi). Prototype’ta ürün **kendini** kopyalar: yaratıcı hiyerarşisi yok. Yeni bir “tür” bazen yeni bir sınıf bile değildir: farklı durumda bir **şablon nesne** yeter.', info: null, focus: { classes: ['Gonderi'].concat(CP) }, v: 'katalog' },
    ];

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: () => 6000,
      onChange: (i) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        setView(s.v);
        diagram.select(null);
        if (s.focus) diagram.focus(s.focus);
        else diagram.clearFocus();
        if (s.info) showInfo(s.info);
        else showOverview();
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };

  // ================================================================== 7. KATALOG (prototip yöneticisi)
  PT.scenes.catalog = function (root, ctx) {
    const S = ctx.state;
    S.kat = S.kat || {};
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-50' });
    const left = kit.panel('Görev: şablon kataloğu', { cls: 'panel-code panel-ex' });
    const right = kit.panel('Şablon kataloğu', { cls: 'panel-side pt-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    // ---- sol (adım 0): alıştırma
    const exBox = h('div', { class: 'ex-box' });
    const task = h('div', {
      class: 'task-card',
      html: md('📩 **Satış ekibi:** “Müşterilerimiz gönderilerini **şablon olarak kaydetsin**; adını söyleyince aynısı hazırlansın!”\nGörev: şablonları adlarıyla saklayan, istenince **kopyasını** veren kataloğu tamamlayın.'),
    });
    const ex = kit.blankExercise({
      files: [
        { name: 'SablonKatalogu.java', code: KT.exercise, badge: 'YENİ' },
        { name: 'Main.java · ek', code: KT.exerciseMain },
      ],
      answers: { 1: 'Gonderi', 2: 'get', 3: 'kopyala', 4: 'ekle', 5: 'olustur' },
      hints: {
        1: 'Katalog **her türden** gönderiyi saklayabilmeli: parametre hangi **soyut** tipte olmalı?',
        2: '`Map`’ten bir değeri anahtarıyla hangi metot **okur**?',
        3: 'Şablonun kendisini değil, **kopyasını** vermeliyiz. Bizim kopyalama metodumuz? (`clone()` değil!)',
        4: 'Kataloğa yeni bir şablonu hangi metot **kaydeder**?',
        5: 'Addan yeni bir gönderi isteyen metot hangisi?',
      },
      choices: ['Gonderi', 'KoliGonderisi', 'get', 'put', 'kopyala', 'clone', 'ekle', 'olustur'],
      roleOf: PT.roleOf,
      special: PT.special,
      state: S.kat,
      doneText: '<b class="ok">✔ Derleme başarılı!</b> Katalog hazır.',
      onSolved: () => {
        DP.fx.confetti();
        DP.fx.toast('Derleme başarılı! 🎉');
        setTimeout(() => stepper.index === 0 && stepper.go(1), DP.dur(900));
      },
      onShowAnswers: () => stepper.index === 0 && stepper.go(1),
      onReset: () => stepper.go(0),
    });
    exBox.append(task, ex.wrap, ex.chipRow, ex.actions);

    // ---- sol (adım 1+): tam kod + konsol
    const runBox = h('div', { class: 'pt-runbox', hidden: true });
    const runCode = h('div', { class: 'pt-cv' });
    const runConsole = h('div', { class: 'console pt-console' });
    runBox.append(runCode, runConsole);
    left.body.append(exBox, runBox);
    const runCv = new DP.CodeView(runCode, { roleOf: PT.roleOf, special: PT.special });

    // ---- sağ: katalog + etki
    const stageHost = h('div', { class: 'pt-view pt-kt-host' });
    const impact = h('div', { class: 'pt-extra' });
    right.body.append(stageHost, impact);
    const stage = new PT.CatalogStage(stageHost);

    const k = C.kirtasiye;
    const kZ = Object.assign({}, k, { icerik: k.icerik.concat('zımba') });
    const slots = (o) =>
      KT.templates
        .map((t) => ({ ad: t.ad, g: o.bad && t.ad === 'kirtasiye' ? kZ : t.g, state: o.bad && t.ad === 'kirtasiye' ? 'bad' : 'on' }))
        .concat([{ ad: KT.yeni.ad, g: KT.yeni.g, state: o.yeni ? 'new' : 'ghost' }]);
    const STEPS = [
      {
        t: 'Görev: şablon kataloğu',
        x: 'Boşluklara tıklayıp doğru parçaları seçin. İpucu: katalog bir `Map<String, Gonderi>`; şablonu **saklar**, istenince **kopyasını** verir. Bu role GoF **Prototype Manager** der.',
        st: { slots: slots({}), copies: [] },
      },
      {
        t: 'Derlendi: kopyasını verir',
        x: '`olustur("kirtasiye")` şablonun **kopyasını** verdi; kopyaya eklenen zımba şablona **dokunmadı**. İkinci istekte yine temiz bir kopya geldi.',
        st: {
          slots: slots({}),
          hl: 'kirtasiye',
          call: '`katalog.olustur("kirtasiye")`',
          copies: [
            { label: 'siparis = olustur("kirtasiye")', g: kZ, tone: 'ok', note: '`siparis.ekle("zımba")` yalnızca kopyaya' },
            { label: 'olustur("kirtasiye")', g: k, tone: 'ok', note: 'şablon temiz ✓' },
          ],
        },
        code: 'ok',
      },
      {
        t: 'Çalışma anında yeni şablon',
        x: '“Şifa Eczanesi” için **yeni bir sınıf yazmadık**: farklı durumda bir `KoliGonderisi` nesnesini kataloğa ekledik. Prototype’ta yeni “türler” çoğu zaman yeni sınıf değil, yeni **şablon nesnelerdir** — program çalışırken bile eklenebilir.',
        st: {
          slots: slots({ yeni: true }),
          hl: 'eczane',
          call: '`katalog.ekle("eczane", …)` → `olustur("eczane")`',
          copies: [
            { label: 'siparis = olustur("kirtasiye")', g: kZ, tone: 'ok' },
            { label: 'olustur("kirtasiye")', g: k, tone: 'ok' },
            { label: 'olustur("eczane")', g: C.eczane, tone: 'ok', note: 'yeni sınıf yok, yeni **şablon** var' },
          ],
        },
        code: 'ok',
      },
      {
        t: 'Hata: şablonun kendisini vermek',
        x: 'Ya `olustur()` kopya yerine `return sablon;` deseydi? İstemci **şablonun kendisini** alır; ona eklenen zımba kataloğa yerleşir ve bundan sonraki **her** sipariş zımbalı çıkar. Sığ kopyadaki hatanın aynısı: paylaşılan, değişebilir nesne.',
        st: {
          slots: slots({ yeni: true, bad: true }),
          hl: 'kirtasiye',
          call: '`return sablon;` ✗',
          copies: [
            { label: 'siparis = olustur("kirtasiye")', g: kZ, tone: 'bad', note: 'bu, şablonun **kendisi**!' },
            { label: 'olustur("kirtasiye")', g: kZ, tone: 'bad', note: 'şablon kirlendi!' },
          ],
        },
        code: 'bad',
      },
      {
        t: 'Factory Method ile karşılaştırma',
        x: 'Yeni bir gönderi çeşidi eklemenin bedeli: Factory Method’da **yeni yaratıcı alt sınıf**, Prototype’ta yalnızca **yeni bir şablon nesne**. GoF bunu “alt sınıf sayısını azaltır” diye özetler.',
        st: {
          slots: slots({ yeni: true }),
          copies: [{ label: 'olustur("eczane")', g: C.eczane, tone: 'ok' }],
        },
        code: 'ok',
        table: true,
      },
    ];

    function renderLeft(i) {
      const s = STEPS[i];
      exBox.hidden = i >= 1;
      runBox.hidden = i < 1;
      left.head.querySelector('.panel-title').innerHTML = i >= 1 ? (s.code === 'bad' ? 'Hatalı sürüm: <span class="ver">return sablon;</span>' : 'Katalog: <span class="ver">SablonKatalogu + Main</span>') : 'Görev: şablon kataloğu';
      if (i < 1) return;
      const bad = s.code === 'bad';
      runCv.setFiles(
        [
          { name: 'SablonKatalogu.java', code: bad ? KT.hatali : KT.SablonKatalogu },
          { name: 'Main.java', code: KT.Main },
        ],
        { active: i === 2 ? 'Main.java' : 'SablonKatalogu.java', prev: bad ? { 'SablonKatalogu.java': KT.SablonKatalogu, 'Main.java': KT.Main } : null, keepActive: false }
      );
      if (i === 2) runCv.mark('Main.java', 'katalog.ekle("eczane"', 'focus');
      else runCv.mark('SablonKatalogu.java', bad ? 'return sablon;' : 'return sablon.kopyala();', bad ? 'bad' : 'focus');
      PT.renderConsole(runConsole, '$ javac *.java && java Main', KT.output(bad).map((l) => (l.svc ? { t: l.t, dim: true } : l)));
    }

    function renderImpact(i, animate) {
      if (i === 0) {
        impact.innerHTML = `<div class="impact-title">İpucu</div><p>${md('Katalog, prototipleri **anahtarla** saklayan bir kayıt defteridir. Altın kural: dışarıya **asla şablonun kendisini** verme, her zaman **kopyasını** ver.')}</p>`;
      } else if (i === 1) {
        impact.innerHTML = `<div class="impact-title ok">✔ Derleme başarılı · şablon temiz kaldı</div><p>${md('Adres servisine **4** sorgu gitti: yalnızca dört şablon kurulurken. Kopyalar bedava.')}</p>`;
      } else if (i === 2) {
        impact.innerHTML = `
          <div class="metrics">
            <div class="metric is-good"><div class="m-val">0</div><div class="m-label">yeni sınıf</div></div>
            <div class="metric is-good"><div class="m-val">0</div><div class="m-label">değişen sınıf</div></div>
            <div class="metric"><div class="m-val">1</div><div class="m-label">yeni şablon (nesne)</div></div>
          </div>`;
      } else if (i === 3) {
        impact.innerHTML = `<div class="impact-title bad">✘ Şablon sızdı</div><p>${md('Derleyici de, JVM de hiçbir şey demedi: hata yalnızca **yanlış veride** görünüyor. Bu yüzden `olustur()` her zaman `sablon.kopyala()` döndürmeli.')}</p>`;
      } else {
        impact.innerHTML = `
          <table class="cmp">
            <thead><tr><th>Yeni bir gönderi çeşidi</th><th>Factory Method</th><th>Prototype</th></tr></thead>
            <tbody>
              <tr><td>Ne eklenir?</td><td class="bad">Yeni yaratıcı alt sınıf (+ ürün sınıfı)</td><td class="ok">Yeni şablon nesne</td></tr>
              <tr><td>Ne zaman?</td><td>Derleme zamanında</td><td class="ok">Çalışma anında da</td></tr>
              <tr><td>Hiyerarşi</td><td>Ürün + paralel yaratıcı hiyerarşisi</td><td class="ok">Yalnızca ürün hiyerarşisi</td></tr>
              <tr><td>Bedeli</td><td>Daha çok sınıf</td><td class="bad">Her sınıf <code>kopyala()</code>’yı doğru yazmalı</td></tr>
            </tbody>
          </table>`;
      }
      if (animate) DP.flash(impact, 'is-pop');
    }

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: () => 6400,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        if (i >= 1) {
          ex.autoFill(info.animate && i === 1);
          S.katUnlocked = true;
        } else ex.ensureSelection();
        renderLeft(i);
        stage.render(s.st, prev >= 0 ? STEPS[prev].st : null, { animate: info.animate });
        renderImpact(i, info.animate || i !== prev);
      },
    });
    ex.paintAll();
    return kit.stepApi(stepper, {
      destroy: () => {
        stepper.destroy();
        stage.destroy();
      },
    });
  };

  // ================================================================== 8. GERÇEK DÜNYA
  const RW = PT.rw;
  const TABS = [
    {
      tab: 'ArrayList kopyası',
      title: '`new ArrayList<>(liste)` — kopya kurucu, ama sığ',
      intro: 'JDK koleksiyonlarının hepsinde bir **kopya kurucu** vardır: `new ArrayList<>(liste)`, `new HashMap<>(harita)`… Bizim `Gonderi(Gonderi kaynak)` ile aynı fikir. Ama kopyalanan **liste yapısıdır**; elemanlar **paylaşılır**.',
      map: [
        ['concretePrototype', 'KoliGonderisi', '`ArrayList`'],
        ['fm', 'kopyala()', '`new ArrayList<>(liste)` · `liste.clone()`'],
        ['client', 'SiparisEkrani', 'Sizin kodunuz'],
      ],
      note: '`ArrayList.clone()` ve `HashMap.clone()` de **sığdır** (Javadoc: “shallow copy”). Elemanlar değişebilir nesnelerse (burada `StringBuilder`) onları da ayrıca kopyalamak gerekir. Çıktılar Java 21 ile alındı.',
      roles: { ArrayList: 'concretePrototype' },
      special: { clone: 'fm' },
      file: 'ListeKopyasi.java',
      code: RW.liste,
      options: RW.listeOpts,
      cmd: '$ java ListeKopyasi',
    },
    {
      tab: 'Diziler: clone()',
      title: '`dizi.clone()` — clone()’un parladığı yer',
      intro: '*Effective Java*’ya göre `clone()`’un **önerildiği** yer dizilerdir: kısa, hızlı ve cast gerektirmez. Ama o da **sığdır**: iki boyutlu bir dizide yalnızca **dış** dizi kopyalanır, satırlar paylaşılır.',
      map: [
        ['fm', 'kopyala()', '`dizi.clone()`'],
        ['concretePrototype', 'KoliGonderisi', 'her dizi: `int[]`, `int[][]`…'],
      ],
      note: 'İki boyutlu dizide derin kopya için satırları da kopyalayın: `for (int i = 0; i < raf.length; i++) kopya[i] = raf[i].clone();` Çıktılar Java 21 ile alındı.',
      special: { clone: 'fm' },
      file: 'DiziKopyasi.java',
      code: RW.dizi,
      options: RW.diziOpts,
      cmd: '$ java DiziKopyasi',
    },
    {
      tab: 'List.copyOf',
      title: '`List.copyOf` — değişmez kopya, paylaşım derdi yok',
      intro: 'Java 10’dan beri `List.copyOf`, `Set.copyOf`, `Map.copyOf` **değişmez** bir kopya döndürür (**kopya fabrikası**). Değişmez nesneyi paylaşmak güvenlidir — String’de gördüğümüz gibi. Kopyayı değiştirmeye kalkışan `UnsupportedOperationException` alır.',
      map: [
        ['fm', 'kopyala()', '`List.copyOf(liste)` — kopya fabrikası'],
        ['concretePrototype', 'KoliGonderisi', 'değişmez liste'],
      ],
      note: '*Effective Java* (Madde 13) `clone()` yerine **kopya kurucu** ya da **kopya fabrikası** önerir; `List.copyOf` ikincisine güzel bir örnek. JDK içindeki satır numaraları sürüme göre değişebilir; çıktılar Java 21 ile alındı.',
      special: { copyOf: 'fm' },
      file: 'KopyaFabrikasi.java',
      code: RW.fabrika,
      options: RW.fabrikaOpts,
      cmd: '$ java KopyaFabrikasi',
    },
    {
      tab: 'Karıştırmayın!',
      title: 'Prototype, Factory Method, Abstract Factory, Builder',
      intro: 'Hepsi “nesneyi kim, nasıl oluşturur?” sorusuna cevap verir. Ayırt etmenin anahtarı: yeni nesnenin **neden** doğduğu.',
      extraHtml: `<table class="cmp cmp-3">
        <thead><tr><th></th><th>Prototype</th><th>Factory Method</th><th>Abstract Factory</th><th>Builder</th></tr></thead>
        <tbody>
          <tr><td>Yeni nesne nereden?</td><td><b>Var olanın kopyası</b></td><td>Alt sınıfın <code>new</code>’i</td><td>Ailenin fabrikası</td><td>Adım adım kurulum</td></tr>
          <tr><td>Yeni tür eklemek</td><td>Yeni <b>şablon nesne</b></td><td>Yeni yaratıcı alt sınıf</td><td>Yeni fabrika</td><td>Yeni hazırlayıcı</td></tr>
          <tr><td>Bizim örnek</td><td><code>son.kopyala()</code></td><td><code>KaraLojistigi</code></td><td><code>KaraFabrikasi</code></td><td><code>Gonderi.Builder</code></td></tr>
        </tbody></table>
        <ul class="rw-mini">
          <li>${md('**Spring `@Scope("prototype")`:** adı aynı ama kopyalamaz! Her `getBean()` çağrısında **kurucuyla** yeni nesne üretir.')}</li>
          <li>${md('**JavaScript prototipleri:** dilin nesne modeli (`Object.create`); GoF kalıbıyla akraba ama aynı şey değil.')}</li>
        </ul>`,
      note: 'Kalıplar birlikte de kullanılır: bir **Abstract Factory**, ürünlerini `new` yerine kayıtlı prototipleri kopyalayarak da üretebilir (GoF).',
      roles: { Gonderi: 'prototype', KoliGonderisi: 'concretePrototype', SablonKatalogu: 'manager' },
      special: { kopyala: 'fm', olustur: 'fm' },
      file: 'Karsilastirma.java',
      code: () => `// Factory Method: yeni çeşit = yeni yaratıcı ALT SINIF
Lojistik lojistik = new KaraLojistigi();
TasimaAraci arac = lojistik.aracOlustur();

// Prototype: yeni çeşit = yeni ŞABLON NESNE (sınıf yok)
katalog.ekle("eczane", new KoliGonderisi("Şifa Eczanesi", List.of("aşı"), 3));
Gonderi ilac = katalog.olustur("eczane");      // şablonun kopyası`,
      mark: 'katalog.ekle("eczane"',
    },
  ];

  PT.scenes.realworld = (root, ctx) =>
    kit.realWorldScene(root, ctx, {
      tabs: TABS,
      roles: PT.roles,
      roleOf: PT.roleOf,
      fmLabel: 'kopyala() · kopya',
      footText: (i) =>
        i === 3
          ? 'Yaratımsal kalıpları birbirinden ayırmak sınavda puan kazandırır. Spring’in “prototype” kapsamına dikkat: kopyalama yapmaz.'
          : 'Sağdaki düğmelerle iki denemeyi karşılaştırın: kopyalanan **yapı** mı, yoksa **elemanlar** da mı? Sığ kopya her yerde karşınıza çıkar.',
    });

  // ================================================================== 9. QUIZ
  const SIG_COPY = `protected Gonderi(Gonderi kaynak) {
    this.alici = kaynak.alici;
    this.icerik = kaynak.icerik;
}`;
  const OLUSTUR = `public Gonderi olustur(String ad) {
    Gonderi sablon = sablonlar.get(ad);
    if (sablon == null) {
        throw new IllegalArgumentException("Böyle bir şablon yok: " + ad);
    }
    return sablon.kopyala();
}`;

  const Q = [
    {
      type: 'mcq',
      q: 'Prototype kalıbının **temel amacı** (GoF) nedir?',
      options: ['Bir sınıfın tek örneği olmasını sağlamak', 'Karmaşık bir nesneyi adım adım kurmak', 'Oluşturulacak nesnelerin türünü bir **prototip örnekle** belirtip yenilerini onu **kopyalayarak** üretmek', 'İlişkili nesne ailelerini birlikte oluşturmak'],
      answer: 2,
      explain: 'GoF: “Oluşturulacak nesnelerin türünü bir prototip örnekle belirt; yeni nesneleri bu prototipi kopyalayarak üret.” Diğerleri Singleton, Builder ve Abstract Factory’nin amaçlarıdır.',
    },
    {
      type: 'mcq',
      q: '`instanceof` zinciriyle kopyalayan `SiparisEkrani`’nin **en büyük sorunu** hangisi?',
      options: ['Çok fazla bellek kullanması', 'Her yeni gönderi türünde **istemcinin değişmek zorunda** olması; değiştirilmezse çalışırken hata vermesi', '`instanceof`’un Java’da yasak olması', 'Kopyaların değişmez olması'],
      answer: 1,
      explain: 'İstemci her somut sınıfı tanımak zorunda (Açık/Kapalı İlkesi ihlali). `PaletGonderisi` eklendiğinde zincire dal eklenmediği için program `IllegalArgumentException` ile çöktü.',
    },
    {
      type: 'line',
      q: 'Bu kopya kurucuda, kopyaya eklenen ürünün **şablonu da değiştirmesine** yol açan satıra tıklayın.',
      codeName: 'Gonderi.java · kopya kurucu',
      code: SIG_COPY,
      answer: 'this.icerik = kaynak.icerik;',
      explain: 'Yalnızca **referans** kopyalandı: iki nesne aynı listeyi gösteriyor (sığ kopya). Doğrusu: `this.icerik = new ArrayList<>(kaynak.icerik);`. `alici` satırı zararsızdır, çünkü String değişmezdir.',
    },
    {
      type: 'mcq',
      q: 'Sığ kopyada `buHafta.ekle("zımba")` çağrısından sonra `System.out.println(sablon)` ne yazar?',
      options: ['`Koli[Ayşe Kırtasiye: A4 kağıt, toner | 12 kg]`', '`Koli[Ayşe Kırtasiye: A4 kağıt, toner, zımba | 12 kg]`', '`null`', 'Derleme hatası olur'],
      answer: 1,
      explain: '`sablon.icerik` ile `buHafta.icerik` **aynı** `ArrayList` nesnesi. Birine eklenen zımba ikisinde de görünür; hata derleyiciden de JVM’den de kaçar.',
    },
    {
      type: 'mcq',
      q: 'Kopya kurucuda `this.alici = kaynak.alici;` ile String’i **paylaşmak** neden güvenlidir?',
      options: ['String’ler her zaman kopyalanır', 'Derleyici String’leri otomatik derin kopyalar', 'String **değişmez** (immutable) olduğu için paylaşan hiç kimse onu değiştiremez', 'Güvenli değildir, her zaman `new String(…)` gerekir'],
      answer: 2,
      explain: 'Kural: **değişebilir** alanları kopyala, **değişmezleri** paylaş. String, Integer, `List.copyOf` sonucu gibi değişmez nesneleri paylaşmak hem güvenli hem verimlidir.',
    },
    {
      type: 'mcq',
      q: '`implements Cloneable` yazmayı unutup `clone()` içinde `super.clone()` çağırırsanız ne olur?',
      options: ['Derleme hatası alırsınız', 'Kod derlenir; **çalışırken** `CloneNotSupportedException` fırlatılır', 'Kopya sessizce `null` olur', 'Derin kopya yapılır'],
      answer: 1,
      explain: '`Cloneable`’ın hiç metodu yoktur; `Object.clone()` bu işaret arayüzünü **çalışma anında** denetler. Hata derleyiciden kaçar. Ayrıca `super.clone()` kurucu çağırmaz ve varsayılan olarak **sığdır**.',
    },
    {
      type: 'line',
      q: 'Prototip yöneticisinde, şablonun dışarıdan **kirletilmesini önleyen** satıra tıklayın.',
      codeName: 'SablonKatalogu.java · olustur()',
      code: OLUSTUR,
      answer: 'return sablon.kopyala();',
      explain: 'Katalog şablonun **kendisini** değil, **kopyasını** verir. `return sablon;` deseydi istemcinin eklediği zımba kataloğa yerleşir ve sonraki bütün siparişlere geçerdi.',
    },
    {
      type: 'mcq',
      q: 'Prototype’ın **Factory Method**’a göre avantajı hangisidir?',
      options: ['Her ürün için yaratıcı alt sınıf gerektirmesi', 'Hiç kalıtım kullanmaması', 'Nesneleri her zaman daha hızlı oluşturması', 'Paralel yaratıcı hiyerarşisi gerektirmemesi; yeni çeşitlerin **çalışma anında** şablon nesne olarak eklenebilmesi'],
      answer: 3,
      explain: 'Factory Method’da her ürün için yaratıcı alt sınıf gerekir. Prototype’ta ürün kendini kopyalar; “Şifa Eczanesi” için yeni sınıf değil, kataloğa yeni bir **şablon nesne** ekledik.',
    },
  ];

  PT.scenes.quiz = (root, ctx) =>
    kit.quizScene(root, ctx, {
      questions: Q,
      roleOf: PT.roleOf,
      special: PT.special,
      patternName: 'Prototype',
      match: {
        items: ['Main', 'SiparisEkrani', 'Gonderi', 'KoliGonderisi', 'ZarfGonderisi', 'PaletGonderisi', 'SablonKatalogu'].map((id) => ({ id, label: id })),
        buckets: ['client', 'prototype', 'concretePrototype', 'manager'].map((k) => ({ id: k, title: PT.roles[k].en, sub: PT.roles[k].tr, color: PT.roles[k].color })),
        answer: PT.classRoles,
        hint: 'Yedi sınıfı dört role yerleştirin. Takıldığınızda **Cevapları göster** düğmesi var.',
      },
    });

  // ================================================================== 10. ÖZET
  PT.scenes.summary = function (root, ctx) {
    const next = DP.catalog.find((p) => p.cat !== 'creational' && p.ready && DP.patterns[p.id]);
    const el = h('div', { class: 'scene scene-summary' });
    el.innerHTML = `
      <div class="sum-head">
        <div>
          <div class="chips"><span class="chip chip-cat">Yaratımsal · Creational</span><span class="chip">Yaratımsal grup tamamlandı 🎉</span></div>
          <h1>Prototype — Özet</h1>
        </div>
        <div class="sum-actions no-print">
          <button class="btn btn-ghost" type="button" data-print>🖨 Yazdır / PDF</button>
          <a class="btn btn-ghost" href="#/builder/ozet">← Builder özeti</a>
          <a class="btn btn-ghost" href="#/">Tüm kalıplar</a>
          ${next ? `<a class="btn btn-primary" href="#/${next.id}">Sıradaki kalıp: ${DP.esc(next.name)} →</a>` : ''}
        </div>
      </div>
      <div class="sum-grid">
        <article class="card sum-intent">
          <h3>Amaç</h3>
          <p>Oluşturulacak nesnelerin türünü <b>bir prototip örnekle</b> belirt; yeni nesneleri bu prototipi <b>kopyalayarak</b> üret.</p>
          <div class="sum-formula"><code>Client</code> → <code class="tk-fm">prototip.kopyala()</code> → <code>new KoliGonderisi(this)</code> <span>(türü bilmeden · pahalı kurulum yok)</span></div>
        </article>
        <article class="card sum-uml"><h3>Yapı (GoF)</h3><div class="sum-diag"></div></article>
        <article class="card">
          <h3>Sığ ↔ Derin</h3>
          <table class="cmp sg-sum-cmp">
            <thead><tr><th></th><th>Sığ</th><th>Derin</th></tr></thead>
            <tbody>
              <tr><td>Kopyalanan</td><td>Referanslar</td><td>Değişebilir alt nesneler de</td></tr>
              <tr><td>Liste</td><td class="bad">Paylaşılır</td><td class="ok">Yenisi oluşur</td></tr>
              <tr><td>Kod</td><td><code>= kaynak.icerik</code></td><td><code>= new ArrayList&lt;&gt;(…)</code></td></tr>
            </tbody>
          </table>
          <p class="sum-note">Kural: <b>değişebilir</b> alanları kopyala, <b>değişmezleri</b> (String…) paylaş.</p>
        </article>
        <article class="card">
          <h3>Katılımcılar</h3>
          <ul class="sum-roles">
            <li>${ui.roleChip('prototype')}<span>kendini kopyalama arayüzü</span></li>
            <li>${ui.roleChip('concretePrototype')}<span>kendini kopyalar (kopya kurucu)</span></li>
            <li>${ui.roleChip('client')}<span>prototipten kopya ister</span></li>
            <li>${ui.roleChip('manager')}<span>şablonları adla saklar, kopyasını verir</span></li>
          </ul>
        </article>
        <article class="card sum-pros">
          <h3>Artıları</h3>
          <ul>
            <li>İstemci <b>somut sınıfları bilmez</b> (OCP)</li>
            <li><b>Pahalı kurulum</b> bir kez yapılır</li>
            <li>Yeni çeşit = yeni <b>şablon nesne</b>, çalışma anında</li>
            <li>Paralel yaratıcı hiyerarşisi yok</li>
          </ul>
        </article>
        <article class="card sum-cons">
          <h3>Eksileri</h3>
          <ul>
            <li><b>Derin kopya</b> zor: iç içe ve döngüsel nesneler</li>
            <li>Her alt sınıf <code>kopyala()</code>’yı doğru yazmalı</li>
            <li>Java’nın <code>clone()</code>’u tuzaklı (Cloneable, final, kurucu)</li>
          </ul>
        </article>
        <article class="card">
          <h3>İlişkili kalıplar</h3>
          <ul>
            <li><b>Factory Method:</b> alternatif; ama paralel yaratıcı hiyerarşisi ister.</li>
            <li><b>Abstract Factory:</b> ürünlerini kayıtlı prototipleri kopyalayarak üretebilir.</li>
            <li><b>Composite / Decorator:</b> bu yapılarla kurulan nesneler kopyalanarak çoğaltılır.</li>
            <li><b>Singleton:</b> prototip yöneticisi çoğu zaman tek örnektir.</li>
          </ul>
        </article>
        <article class="card sum-tip">
          <h3>Sınav ipuçları</h3>
          <pre class="mini-code">public KoliGonderisi kopyala() {
    return new KoliGonderisi(this);   // kopya kurucu
}
this.icerik = new ArrayList&lt;&gt;(kaynak.icerik);  // derin</pre>
          <p class="exam"><b>instanceof zinciri</b> → Prototype · <b>Prototype + ConcretePrototype + Client</b> · <u>sığ</u> kopya listeyi paylaşır · <code>Cloneable</code> unutulursa hata <u>çalışma anında</u></p>
        </article>
        <article class="card sum-files">
          <h3>Java kodları</h3>
          <p>Çalıştırılabilir örnekler proje klasöründe:</p>
          <pre class="mini-code">java/prototype/sorun          → instanceof zinciri, Palet'te çöker
java/prototype/cozum          → kopyala() + kopya kurucular
java/prototype/kopya/sig      → şablon "zımba" ile kirlenir
java/prototype/kopya/derin    → şablon temiz kalır
java/prototype/klon/...       → clone() tuzakları ve kopya kurucu
java/prototype/katalog        → şablon kataloğu (Prototype Manager)</pre>
          <p>Derleyip çalıştırmak için <code>java/README.md</code> dosyasına bakın.</p>
        </article>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-print]').addEventListener('click', () => window.print());
    const spec = PT.gofDiagram({});
    spec.classes = spec.classes.filter((c) => !c.hidden);
    spec.relations = spec.relations.filter((r) => !r.hidden);
    const diag = new DP.ClassDiagram(el.querySelector('.sum-diag'), spec, { roles: PT.roles, roleTags: false, mode: 'generic' });
    diag.svg.classList.add('is-compact');
    return { destroy() {} };
  };

  // ================================================================== kayıt
  DP.register({
    id: 'prototype',
    name: 'Prototype',
    tr: 'Prototip',
    category: 'creational',
    roleOf: PT.roleOf,
    initialState: () => ({
      copyMode: 'sig',
      copyView: 'stage',
      showCode: true,
      kat: {},
      katUnlocked: false,
      quiz: { results: {}, match: false },
    }),
    scenes: [
      { id: 'giris', title: 'Giriş', mount: PT.scenes.intro },
      { id: 'sorun', title: 'Sorun', mount: PT.scenes.problem },
      { id: 'cozum', title: 'Çözüm', mount: PT.scenes.solution },
      { id: 'kopya', title: 'Sığ ↔ Derin', mount: PT.scenes.copy, star: true },
      { id: 'klon', title: 'Java’da clone()', mount: PT.scenes.clone, star: true },
      { id: 'yapi', title: 'Yapı (UML)', mount: PT.scenes.structure },
      { id: 'katalog', title: 'Katalog', mount: PT.scenes.catalog },
      { id: 'gercek', title: 'Gerçek Dünya', mount: PT.scenes.realworld },
      { id: 'quiz', title: 'Quiz', mount: PT.scenes.quiz },
      { id: 'ozet', title: 'Özet', mount: PT.scenes.summary },
    ],
  });
})();
