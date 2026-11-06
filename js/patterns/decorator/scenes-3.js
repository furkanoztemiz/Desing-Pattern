/*
 * Decorator — sahneler (3/3): Yapı, Genişlet, Gerçek Dünya, Quiz, Özet ve kalıp kaydı
 */
(function () {
  'use strict';
  const DC = DP.dc;
  const { h } = DP;
  const kit = DP.kit;
  const ui = DC.ui;
  const md = DC.md;
  const C = DC.code;
  const EX = DC.ext;
  const plain = (src) => src.replace(/^\/\*\*[\s\S]*?\*\/\n/, '');

  // ================================================================== 6. YAPI
  const ROLE_TEXT = {
    client: 'Katmanları <b>kurar</b>; zincirle yalnızca <b>bileşen arayüzü</b> üzerinden konuşur.',
    component: 'Hem çekirdeklerin hem katmanların uyduğu <b>ortak arayüz</b>.',
    concreteComponent: 'Sarılan <b>çekirdek</b> nesne; asıl işi yapar, katmanlardan habersizdir.',
    decorator: 'Bileşen arayüzünü <b>uygular</b> ve bir bileşeni <b>içinde tutar</b>; çağrıyı ona iletir.',
    concreteDecorator: 'İçtekinin cevabına <b>kendi sorumluluğunu</b> ekler.',
  };

  function classInfo(id) {
    const key = DC.addonOrder.find((k) => DC.ADDONS[k].cls === id);
    if (key) {
      const a = DC.ADDONS[key];
      return {
        role: 'concreteDecorator',
        file: id + '.java',
        code: C[id],
        mark: 'return icteki.ucret()',
        points: ['Önce **içtekine** sorar: `icteki.ucret()`.', `Cevaba **kendi payını** ekler: \`${a.pct ? '× 9 / 10' : '+ ' + a.fee}\`.`, 'Zincirin kalanını **bilmez**; kuralı yalnızca bu sınıfta yazılı.'],
      };
    }
    switch (id) {
      case 'Main':
        return { role: 'client', file: 'Main.java', code: C.Main, mark: 'new Sigorta(new SogukZincir(new Ekspres(new StandartKargo())))', points: ['Katmanları **kendisi** kurar: `new Sigorta(new Ekspres(…))`.', 'Zincirle yalnızca **KargoHizmeti** üzerinden konuşur; katman sayısını görmez.', 'Yeni bir kombinasyon için **sınıf yazmaz**.'] };
      case 'KargoHizmeti':
        return { role: 'component', file: 'KargoHizmeti.java', code: C.KargoHizmeti, mark: 'public interface KargoHizmeti', points: ['Çekirdeklerin **ve** katmanların ortak arayüzü.', 'Katmanların birbirinin yerine geçebilmesinin anahtarı.', 'GoF: bu arayüz **hafif** tutulmalı; her katman hepsini uygular.'] };
      case 'StandartKargo':
      case 'ZarfKargo':
        return { role: 'concreteComponent', file: id + '.java', code: C[id], mark: id === 'ZarfKargo' ? 'return 20;' : 'return 50;', points: ['Zincirin **en içi**: kimseye sormadan cevap verir.', 'Katmanlardan **habersizdir**; kalıp uygulanırken hiç değişmedi.', 'Birden çok çekirdek olabilir: koli, zarf…'] };
      case 'EkHizmet':
        return { role: 'decorator', file: 'EkHizmet.java', code: C.EkHizmet, mark: 'protected final KargoHizmeti icteki;', points: ['Bir `KargoHizmeti` **dir** (implements)…', '…ve bir `KargoHizmeti`’ne **sahiptir** (`icteki`).', 'Bu çifte ilişki sayesinde katmanlar **iç içe** geçer.'] };
      default:
        return null;
    }
  }

  DC.scenes.structure = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split' });
    const tools = h('div', { class: 'panel-tools' });
    const body = h('div', { class: 'scene-body cols-64' });
    const left = kit.panel('Yapı', { cls: 'panel-diagram', extra: tools });
    const right = kit.panel('Rol kartı <span class="panel-sub">· bir sınıfa tıklayın</span>', { cls: 'panel-side' });
    body.append(left.el, right.el);
    el.append(body);
    root.appendChild(el);

    const diagHost = h('div', { class: 'diag-host' });
    const legend = kit.umlLegend({ aggregation: true, fmLabel: 'katman metodu: içtekine devreder, payını ekler' });
    left.body.append(diagHost, legend);
    const diagram = new DP.ClassDiagram(diagHost, DC.gofDiagram({ notes: true }), {
      roles: DC.roles,
      onSelect: (id) => {
        showInfo(id);
        diagram.focus({ classes: [id] });
        diagram.select(id);
      },
    });

    const modeSeg = kit.seg(
      [
        { v: 'concrete', label: 'Somut' },
        { v: 'generic', label: 'Genel (GoF)' },
      ],
      'concrete',
      (v) => diagram.setMode(v)
    );
    const tagToggle = kit.toggle('Rol etiketleri', true, (on) => diagram.setRoleTags(on));
    tools.append(modeSeg.el, tagToggle);

    const infoTop = h('div', { class: 'info-card' });
    const infoCode = h('div', { class: 'info-code' });
    right.body.append(infoTop, infoCode);

    function showInfo(id) {
      const info = classInfo(id);
      infoCode.innerHTML = '';
      if (!info) return;
      const r = DC.roles[info.role];
      infoTop.innerHTML = `
        <div class="info-role rc rc-${r.color}"><span class="info-dot"></span><b>${r.en}</b> · ${r.tr}</div>
        <div class="info-name rc rc-${r.color}">${DP.esc(id)}</div>
        <p class="info-desc">${ROLE_TEXT[info.role]}</p>
        <ul class="info-points">${info.points.map((p) => `<li>${md(p)}</li>`).join('')}</ul>`;
      const cv = new DP.CodeView(infoCode, { files: [{ name: info.file, code: info.code }], roleOf: DC.roleOf, special: DC.special, compact: true });
      cv.mark(info.file, info.mark, 'focus');
      DP.flash(infoTop, 'is-pop');
    }

    function showOverview() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">Dört rol + istemci</div>
        <div class="role-list">
          ${['component', 'concreteComponent', 'decorator', 'concreteDecorator']
            .map((k) => `<div class="role-row rc rc-${DC.roles[k].color}"><span class="info-dot"></span><div><b>${DC.roles[k].en}</b> · ${DC.roles[k].tr}<div class="role-desc">${ROLE_TEXT[k]}</div></div></div>`)
            .join('')}
        </div>
        <p class="info-desc">Zinciri <b>Client</b> kurar. Üstteki <b>Genel (GoF)</b> düğmesi kitaptaki adları gösterir.</p>`;
    }

    const DECS = ['Ekspres', 'Sigorta', 'SogukZincir'];
    const STEPS = [
      { t: 'Genel bakış', x: 'Dört rol: **Component**, **ConcreteComponent**, **Decorator**, **ConcreteDecorator**; zinciri **Client** kurar. Kalıbın imzasına dikkat: [[EkHizmet]]’ten arayüze giden **iki** çizgi.', info: null },
      { t: 'Component — Bileşen', x: '[[KargoHizmeti]] herkesin konuştuğu dil: `aciklama()`, `ucret()`. Çekirdekler de katmanlar da onu uygular; istemci yalnızca onu tanır.', info: 'KargoHizmeti', focus: { classes: ['KargoHizmeti'] } },
      { t: 'ConcreteComponent — Somut bileşen', x: '[[StandartKargo]] ve [[ZarfKargo]] zincirin **en içi**: kimseye sormadan cevap verirler. Kalıbı uygularken bu sınıflara **hiç dokunmadık**.', info: 'StandartKargo', focus: { classes: ['StandartKargo', 'ZarfKargo'], edges: ['r-std', 'r-zarf'] } },
      { t: 'Decorator — Dekoratör', x: '[[EkHizmet]] arayüzü **uygular** (kesik çizgi + boş üçgen) ve bir arayüz nesnesini **tutar** (◇ toplama: “sarar”). Bu çifte ilişki kalıbın kalbi: bir katman, başka bir katmanı da sarabilir.', info: 'EkHizmet', focus: { classes: ['EkHizmet'], edges: ['r-dec', 'agg'] } },
      { t: 'ConcreteDecorator — Somut dekoratör', x: 'Her somut dekoratör içtekine sorar ve **payını** ekler; nottaki satıra bakın. Her kural **tek bir sınıfta** yazılı: sigortaya zam gelirse tek satır değişir.', info: 'Ekspres', focus: { classes: DECS, edges: ['gen-ekspres', 'gen-sigorta', 'gen-zincir'] } },
      { t: 'Client — İstemci', x: '[[Main]] katmanları **kurar** ve yalnızca [[KargoHizmeti]]’ye bağlıdır. Hangi sırada, kaç katman olacağına çalışma anında o karar verir.', info: 'Main', focus: { classes: ['Main'], edges: ['uses'] } },
      { t: 'Saydamlık ve nesne kimliği', x: 'Katmanlı nesne çekirdekle **aynı arayüze** sahiptir: istemci farkı görmez (saydamlık). Ama **aynı nesne değildir**: `hizmet == cekirdek` → `false`. GoF uyarır: nesne kimliğine güvenen kod dekoratörlerle bozulur.', info: 'EkHizmet', focus: { classes: ['KargoHizmeti', 'EkHizmet'], edges: ['agg'] } },
    ];

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: () => 6000,
      onChange: (i) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        diagram.select(null);
        if (s.focus) diagram.focus(s.focus);
        else diagram.clearFocus();
        if (s.info) showInfo(s.info);
        else showOverview();
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };

  // ================================================================== 7. GENİŞLET: yeni katman HediyePaketi
  DC.scenes.extend = function (root, ctx) {
    const S = ctx.state;
    S.ext = S.ext || {};
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-50' });
    const left = kit.panel('Görev: HediyePaketi katmanı', { cls: 'panel-code panel-ex' });
    const right = kit.panel('Katmanlar', { cls: 'panel-side dc-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    // ---- sol (adım 0): alıştırma
    const exBox = h('div', { class: 'ex-box' });
    const task = h('div', {
      class: 'task-card',
      html: md('📩 **Pazarlama:** “Yılbaşı için **hediye paketi** (+15 TL) satalım; her gönderiye, her kombinasyonla eklenebilsin!”\nKural: **var olan hiçbir sınıfa dokunmadan** yeni bir katman yazın.'),
    });
    const ex = kit.blankExercise({
      files: [
        { name: 'HediyePaketi.java', code: EX.exercise, badge: 'YENİ' },
        { name: 'Main.java · ek', code: EX.exerciseMain },
      ],
      answers: { 1: 'EkHizmet', 2: 'super', 3: 'aciklama', 4: '15', 5: 'HediyePaketi' },
      hints: {
        1: 'Bütün ek hizmetlerin **ortak atası** hangi sınıf? (sarılan hizmeti o saklıyor)',
        2: 'Sarılan hizmeti **atanın kurucusuna** hangi anahtar kelimeyle iletiriz?',
        3: 'İçteki katmana **metnini** soran metot hangisi?',
        4: 'Hediye paketi kaç TL ekliyor? (görevdeki fiyata bakın)',
        5: 'En dışa **hangi katmanı** sarıyoruz?',
      },
      choices: ['EkHizmet', 'KargoHizmeti', 'StandartKargo', 'super', 'this', 'aciklama', 'ucret', '15', '40', 'HediyePaketi', 'Ekspres'],
      roleOf: DC.roleOf,
      special: DC.special,
      state: S.ext,
      doneText: '<b class="ok">✔ Derleme başarılı!</b> Yeni katman hazır.',
      onSolved: () => {
        DP.fx.confetti();
        DP.fx.toast('Derleme başarılı! 🎉');
        setTimeout(() => stepper.index === 0 && stepper.go(1), DP.dur(900));
      },
      onShowAnswers: () => stepper.index === 0 && stepper.go(1),
      onReset: () => stepper.go(0),
    });
    exBox.append(task, ex.wrap, ex.chipRow, ex.actions);

    // ---- sol (adım 1+): kod + konsol
    const runBox = h('div', { class: 'dc-runbox', hidden: true });
    const runCode = h('div', { class: 'dc-cv' });
    const runConsole = h('div', { class: 'console dc-console' });
    runBox.append(runCode, runConsole);
    left.body.append(exBox, runBox);
    const runCv = new DP.CodeView(runCode, { roleOf: DC.roleOf, special: DC.special });

    // ---- sağ: katmanlar + etki
    const viewHost = h('div', { class: 'dc-view' });
    const impact = h('div', { class: 'dc-extra' });
    right.body.append(viewHost, impact);
    const stage = new DC.Layers(viewHost, { geom: DC.LAYOUT.extend });

    const zarfExpr = DC.expr('zarf', ['hediye', 'sms']);
    const STEPS = [
      {
        t: 'Görev: HediyePaketi katmanı',
        x: 'Boşluklara tıklayıp doğru parçaları seçin. İpucu: yeni katman öbürlerinin **aynısı**; ortak atadan kalıtır, içtekine sorar, **payını** ekler.',
        st: { core: 'standart', layers: ['ekspres'], ghost: 'hediye', banner: { text: 'Yeni katman = **tek bir sınıf**. Hangi sınıfa dokunacağız? **Hiçbirine.**' } },
      },
      {
        t: 'Derlendi: yeni katman çalışıyor',
        x: '[[HediyePaketi]] ekspres gönderinin **dışına** sarıldı: 50 + 40 + 15 = **105 TL**. Yazdığımız tek şey yeni sınıf ve onu kuran satır.',
        st: { core: 'standart', layers: ['ekspres', 'hediye'], active: 2, banner: { text: `✓ ${EX.output[0]}`, tone: 'ok' } },
      },
      {
        t: 'Her şeyle birleşir',
        x: 'Yeni katman, **eski** katmanlarla ve **öbür çekirdekle** de çalışıyor: doğum günü zarfı + hediye + SMS = **40 TL**. Bu kombinasyon için hiçbir sınıf yazmadık.',
        st: { core: 'zarf', layers: ['hediye', 'sms'], active: 1, banner: { text: `✓ ${EX.output[1]}`, tone: 'ok' } },
      },
      {
        t: 'Kalıtımla olsaydı?',
        x: 'Kalıpsız çözümde dördüncü seçenek sınıf sayısını **8’den 16’ya** çıkarırdı (zarf için bir o kadar daha). Dekoratörle **+1 sınıf**. Hediye paketi artık **Sipariş Tezgâhı**’nda da açık.',
        st: { core: 'zarf', layers: ['hediye', 'sms'], banner: { text: 'Dördüncü seçenek: kalıtımla **+8 sınıf**, dekoratörle **+1 sınıf**.', tone: 'ok' } },
      },
    ];

    function renderLeft(i) {
      exBox.hidden = i >= 1;
      runBox.hidden = i < 1;
      left.head.querySelector('.panel-title').innerHTML = i >= 1 ? 'Yeni katman: <span class="ver">HediyePaketi</span>' : 'Görev: HediyePaketi katmanı';
      if (i < 1) return;
      runCv.setFiles(
        [
          { name: 'HediyePaketi.java', code: C.HediyePaketi, badge: 'YENİ' },
          { name: 'Main.java', code: EX.Main },
        ],
        { active: i === 2 ? 'Main.java' : 'HediyePaketi.java', keepActive: false }
      );
      if (i === 2) runCv.mark('Main.java', zarfExpr, 'focus');
      else runCv.mark('HediyePaketi.java', 'return icteki.ucret() + 15;', 'focus');
      DC.renderConsole(runConsole, '$ javac *.java && java Main', EX.output.map((t, j) => ({ t, ok: i === 2 ? j === 1 : j === 0, dim: i === 2 ? j === 0 : false })));
    }

    function renderImpact(i, animate) {
      if (i === 0) {
        impact.innerHTML = `<div class="impact-title">İpucu</div><p>${md('Bir katmanın iki işi var: içtekine **sormak** (`icteki.…()`) ve cevaba **kendi payını** eklemek. Kurucu, sarılacak hizmeti ataya iletir.')}</p>`;
      } else if (i === 1) {
        impact.innerHTML = `
          <div class="impact-title ok">✔ Derleme başarılı · yeni katman</div>
          <ul class="filelist"><li><span class="cv-dot rc rc-${DC.roleOf('HediyePaketi')}"></span>HediyePaketi.java <span class="cv-badge is-new">YENİ</span></li></ul>`;
      } else if (i === 2) {
        impact.innerHTML = `
          <div class="metrics">
            <div class="metric is-good"><div class="m-val">0</div><div class="m-label">değişen sınıf</div></div>
            <div class="metric"><div class="m-val">1</div><div class="m-label">yeni sınıf</div></div>
            <div class="metric"><div class="m-val">2</div><div class="m-label">çekirdekle de çalışır</div></div>
          </div>`;
      } else {
        impact.innerHTML = `
          <table class="cmp dc-cmp">
            <thead><tr><th>Dördüncü seçenek</th><th>Kalıtımla</th><th>Dekoratörle</th></tr></thead>
            <tbody>
              <tr><td>Sınıf sayısı</td><td class="bad">8 → 16 (+8)</td><td class="ok">+1</td></tr>
              <tr><td>Zarf da olursa</td><td class="bad">bir 16 daha</td><td class="ok">yine +1</td></tr>
              <tr><td>Hediye kuralı (+15)</td><td class="bad">8 sınıfta</td><td class="ok">1 sınıfta</td></tr>
            </tbody>
          </table>
          <div class="dc-go"><button class="btn btn-primary btn-sm" type="button" data-go>🎁 Sipariş Tezgâhı’nda dene →</button></div>`;
        impact.querySelector('[data-go]').addEventListener('click', () => ctx.goScene('tezgah'));
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
          S.hediyeUnlocked = true;
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
  const RW = DC.rw;
  const TABS = [
    {
      tab: 'unmodifiableList',
      title: '`Collections.unmodifiableList` — aynı arayüz, yeni kural',
      intro: '`unmodifiableList` listeyi **kopyalamaz**; onu saran bir katman döndürür. Okuma çağrılarını içteki listeye **iletir**, değiştirme çağrılarını **reddeder**. Arayüz yine `List`: istemci farkı görmez.',
      map: [
        ['component', 'KargoHizmeti', '`List<String>`'],
        ['concreteComponent', 'StandartKargo', '`ArrayList` (asıl liste)'],
        ['concreteDecorator', 'Sigorta', '`Collections$UnmodifiableList`'],
        ['client', 'Main', 'Listeyi kullanan kodunuz'],
      ],
      note: 'Katman bir **görünümdür**: asıl listeye eklenen “zımba” katmandan da görünür. JDK içindeki satır numarası sürüme göre değişebilir; çıktılar Java 21 ile alındı.',
      roles: {},
      file: 'SaltOkunur.java',
      code: RW.unmod,
      options: RW.unmodOpts,
      cmd: '$ java SaltOkunur',
    },
    {
      tab: 'LineNumberReader',
      title: '`LineNumberReader` — okurken satır sayan katman',
      intro: 'Bir `Reader`’ı sarar, okuma işini ona **devreder** ve üstüne **satır numarası** tutmayı ekler. `StringReader` yerine bir dosya (`FileReader`) da sarılabilir: katman, içtekinin türünü bilmez.',
      map: [
        ['component', 'KargoHizmeti', '`Reader`'],
        ['concreteComponent', 'StandartKargo', '`StringReader`, `FileReader`…'],
        ['concreteDecorator', 'Ekspres', '`LineNumberReader`, `BufferedReader`'],
      ],
      note: '`getLineNumber()` içteki `StringReader`’da **yok**; katmanın getirdiği **yeni bir metot**. GoF’a göre dekoratörler yeni işlemler de ekleyebilir; onları çağırmak için değişkenin tipi o katman olmalı.',
      roles: {},
      file: 'SatirNumarasi.java',
      code: RW.lines,
      mark: 'new LineNumberReader(metin)',
      out: RW.linesOut,
      cmd: '$ java SatirNumarasi',
    },
    {
      tab: 'Java I/O akışları',
      title: '`DataOutputStream` + `GZIPOutputStream` — katman katman akış',
      intro: 'Java I/O, GoF’un en ünlü Decorator örneğidir: `OutputStream` **bileşen**, `FilterOutputStream` **dekoratör atası** (bizim `EkHizmet`), `DataOutputStream` ve `GZIPOutputStream` **somut dekoratörler**. Sıkıştırma eklemek tek bir `new` demektir.',
      map: [
        ['component', 'KargoHizmeti', '`OutputStream`'],
        ['concreteComponent', 'StandartKargo', '`ByteArrayOutputStream`, `FileOutputStream`'],
        ['decorator', 'EkHizmet', '`FilterOutputStream`'],
        ['concreteDecorator', 'Ekspres', '`DataOutputStream`, `GZIPOutputStream`, `BufferedOutputStream`'],
      ],
      note: 'Aynı 1000 takip numarası: katmansız 10000 bayt, GZIP katmanıyla 1823 bayt. Sıra burada da anlam taşır: `writeUTF` yalnızca `DataOutputStream`’de var, bu yüzden o katman **en dışta**. Çıktılar Java 21 ile alındı.',
      roles: {},
      file: 'AkisKatmanlari.java',
      code: RW.gzip,
      options: RW.gzipOpts,
      cmd: '$ java AkisKatmanlari',
    },
    {
      tab: 'Karıştırmayın!',
      title: 'Decorator, Adapter, Proxy, Composite, Strategy',
      intro: 'Hepsi bir nesneyi “sarar” ya da “içerir”. Ayırt etmenin anahtarı: **arayüz** değişiyor mu ve sarmanın **amacı** ne?',
      extraHtml: `<table class="cmp cmp-3">
        <thead lang="en"><tr><th></th><th>Decorator</th><th>Adapter</th><th>Proxy</th><th>Composite</th><th>Strategy</th></tr></thead>
        <tbody>
          <tr><td>Arayüz</td><td>Aynı kalır</td><td><b>Değiştirir</b></td><td>Aynı kalır</td><td>Aynı (parça = bütün)</td><td>Ayrı bir arayüz</td></tr>
          <tr><td>Amaç</td><td>Sorumluluk eklemek</td><td>Uyumsuzu uydurmak</td><td>Erişimi denetlemek</td><td>Ağaç yapısı kurmak</td><td>Algoritmayı değiştirmek</td></tr>
          <tr><td>İçinde</td><td>1 bileşen (zincir)</td><td>1 uyarlanan</td><td>1 gerçek nesne</td><td>Çok çocuk</td><td>1 strateji</td></tr>
          <tr><td>Neyi değiştirir?</td><td><b>Kabuğu</b></td><td>Arayüzü</td><td>Erişimi</td><td>—</td><td><b>İçi</b></td></tr>
        </tbody></table>`,
      note: 'GoF: Decorator nesnenin **kabuğunu**, Strategy **içini** değiştirir. Decorator’ı tek çocuklu bir Composite gibi de düşünebilirsiniz; ama amacı nesne toplamak değil, **sorumluluk eklemektir**.',
      roles: { KargoHizmeti: 'component', StandartKargo: 'concreteComponent', Ekspres: 'concreteDecorator', Sigorta: 'concreteDecorator' },
      special: DC.special,
      file: 'Karsilastirma.java',
      code: () => `// Decorator: ARAYÜZ AYNI KALIR, sorumluluk eklenir
KargoHizmeti hizmet = new Sigorta(new Ekspres(new StandartKargo()));

// Adapter: ARAYÜZ DEĞİŞİR (Adapter dersinden)
KargoFirmasi firma = new GlobalShipAdaptoru(new GlobalShipApi());

// Java I/O'da ikisi bir arada:
Reader okuyucu = new BufferedReader(new InputStreamReader(System.in));
//               └ Decorator: tampon   └ Adapter: bayt → karakter`,
      mark: 'new Sigorta(new Ekspres(new StandartKargo()))',
    },
  ];

  DC.scenes.realworld = (root, ctx) =>
    kit.realWorldScene(root, ctx, {
      tabs: TABS,
      roles: DC.roles,
      roleOf: DC.roleOf,
      fmLabel: 'katman metodu',
      footText: (i) =>
        i === 3
          ? 'Yapısal kalıplar birbirine benzer; “arayüz değişiyor mu, amaç ne?” soruları çoğu zaman cevabı verir.'
          : i === 1
          ? 'Satır numarası `LineNumberReader` katmanından geliyor; içteki `StringReader` satır saymayı **bilmez**.'
          : 'Kendi örneğimizdeki rolleri JDK’da bulun. Sağdaki düğmelerle iki denemeyi karşılaştırın: katman, içtekine **iletir** ve üstüne **kendi kuralını** ekler.',
    });

  // ================================================================== 9. QUIZ
  const Q = [
    {
      type: 'mcq',
      q: 'Decorator kalıbının **temel amacı** (GoF) nedir?',
      options: ['Bir sınıfın arayüzünü, istemcinin beklediği başka bir arayüze dönüştürüp uyumsuzluğu gidermek', 'Bir nesneye çalışma anında ek sorumluluklar eklemek; alt sınıf oluşturmaya esnek bir alternatif sunmak', 'Bir sınıfın yalnızca tek bir örneği olmasını garanti etmek ve ona genel erişim sağlamak', 'Karmaşık bir nesnenin kurulumunu temsilinden ayırıp aynı süreçle farklı temsiller üretmek'],
      answer: 1,
      explain: 'GoF: “Bir nesneye dinamik olarak ek sorumluluklar ekle. Dekoratörler, işlevselliği genişletmek için alt sınıf oluşturmaya esnek bir alternatif sunar.” Diğerleri Adapter, Singleton ve Builder’ın amaçlarıdır.',
    },
    {
      type: 'mcq',
      q: 'Kalıpsız (kalıtımla) çözümde **4 ek hizmet** her kombinasyonuyla satılacak. Çekirdek dahil kaç sınıf gerekir?',
      options: ['4', '8', '16', '24'],
      answer: 2,
      explain: 'Her seçenek ya var ya yok: 2⁴ = 16 kombinasyon, her biri ayrı bir sınıf. Dekoratörle: 1 çekirdek + 1 ata + 4 katman (ve arayüz). Zarf gibi ikinci bir çekirdek, kalıtım çözümünü bir kez daha katlar.',
    },
    {
      type: 'line',
      q: 'Bu dekoratörde **ücretin içteki katmana sorulduğu** satıra tıklayın.',
      codeName: 'Sigorta.java',
      code: plain(C.Sigorta),
      answer: 'return icteki.ucret() + 35;',
      explain: 'Dekoratörün iki işi tek satırda: içtekine sorar (`icteki.ucret()`), **kendi payını** ekler (`+ 35`). Sigorta zincirin kalanını bilmez; yalnızca içtekini tanır.',
    },
    {
      type: 'mcq',
      q: '`new KurumsalIndirim(new Sigorta(new Ekspres(new StandartKargo())))` kaç TL? (Standart 50 · Ekspres +40 · Sigorta +35 · İndirim: içteki × 9 / 10)',
      options: ['112', '113', '120', '125'],
      answer: 0,
      explain: 'İçten dışa: 50 → 90 → 125 → 125 × 9 / 10 = 112 (tam sayı bölmesi). İndirim en içte olsaydı 50 → 45 → 85 → 120 olurdu: dekoratörlerde **sıra önemlidir**.',
    },
    {
      type: 'mcq',
      q: '`EkHizmet`’teki `icteki` alanının tipi neden `StandartKargo` değil de `KargoHizmeti`?',
      options: ['Arayüz tipli alanlar daha az bellek kullanır; çok katmanda fark büyür', 'Bir katman başka bir katmanı da sarabilsin diye: içteki çekirdek de olabilir, dekoratör de', 'Java, soyut sınıflarda somut sınıf tipinde bir alan tanımlamaya izin vermediği için', 'Dekoratör yalnızca zarf gönderilerini sarsın, kolileri sarmasın diye'],
      answer: 1,
      explain: 'Alan arayüz tipinde olduğu için `new Sigorta(new Ekspres(…))` mümkün: Sigorta’nın içtekisi bir Ekspres. Somut bir tip yazsaydık katmanlar iç içe geçemezdi.',
    },
    {
      type: 'line',
      q: 'Bu programda siparişe **SMS sorumluluğunun eklendiği** satıra tıklayın.',
      codeName: 'Main.java',
      code: DC.akisMain(DC.presets.zarfSms),
      answer: 'hizmet = new SmsBildirim(hizmet);',
      explain: 'Nesne zaten vardı (`new ZarfKargo()`); SMS, onu **saran** yeni bir nesneyle **çalışma anında** eklendi. Hiçbir sınıf değişmedi, kombinasyon için yeni sınıf da yazılmadı.',
    },
    {
      type: 'mcq',
      q: 'Hangisi Decorator’ın **bedelidir**?',
      options: ['Her seçenek birleşimi için ayrı sınıf gerekir; sınıf sayısı katlanarak artar', 'Çok sayıda küçük nesne oluşur; zinciri izlemek zorlaşır, sarılmış nesne çekirdekle == değildir', 'Her katman arayüzü biraz değiştirir; istemci hangi katmanı tuttuğunu bilmelidir', 'Katmanlar yalnızca derleme anında eklenebilir; çalışırken seçenek eklenip çıkarılamaz'],
      answer: 1,
      explain: 'Sınıf patlaması **kalıpsız** çözümün sorunuydu. Dekoratörün bedeli: çok sayıda küçük nesne ve kimlik farkı (`hizmet == cekirdek` → `false`). GoF bunu açıkça not eder.',
    },
    {
      type: 'mcq',
      q: 'Java’daki hangi satır bir **Decorator** örneğidir?',
      options: ['`Arrays.asList(new String[] {"A4", "toner"})`', '`Runtime.getRuntime().availableProcessors()`', '`new BufferedReader(new FileReader("liste.txt"))`', '`List.of("A4 kağıt", "toner", "zımba")`'],
      answer: 2,
      explain: '`BufferedReader` bir `Reader`’ı sarar ve **tamponlama** ekler; arayüz yine `Reader`. `asList` bir adaptör, `getRuntime` bir Singleton, `List.of` ise bir fabrika metodudur.',
    },
  ];

  DC.scenes.quiz = (root, ctx) =>
    kit.quizScene(root, ctx, {
      questions: Q,
      roleOf: DC.roleOf,
      special: DC.special,
      patternName: 'Decorator',
      match: {
        items: ['KargoHizmeti', 'StandartKargo', 'ZarfKargo', 'EkHizmet', 'Ekspres', 'Sigorta', 'SmsBildirim', 'HediyePaketi'].map((id) => ({ id, label: id })),
        buckets: ['component', 'concreteComponent', 'decorator', 'concreteDecorator'].map((k) => ({ id: k, title: DC.roles[k].en, sub: DC.roles[k].tr, color: DC.roles[k].color })),
        answer: DC.classRoles,
        hint: 'Sekiz sınıfı dört role yerleştirin. Takıldığınızda **Cevapları göster** düğmesi var.',
      },
    });

  // ================================================================== 10. ÖZET
  DC.scenes.summary = function (root, ctx) {
    const at = DP.catalog.findIndex((p) => p.id === 'decorator');
    const next = DP.catalog.slice(at + 1).find((p) => p.ready && DP.patterns[p.id]);
    const el = h('div', { class: 'scene scene-summary' });
    el.innerHTML = `
      <div class="sum-head">
        <div>
          <div class="chips"><span class="chip chip-cat is-struct">Yapısal · Structural</span><span class="chip">Diğer adı: Wrapper</span></div>
          <h1>Decorator — Özet</h1>
        </div>
        <div class="sum-actions no-print">
          <button class="btn btn-ghost" type="button" data-print>🖨 Yazdır / PDF</button>
          <a class="btn btn-ghost" href="#/composite/ozet">← Composite özeti</a>
          <a class="btn btn-ghost" href="#/">Tüm kalıplar</a>
          ${next ? `<a class="btn btn-primary" href="#/${next.id}">Sıradaki kalıp: ${DP.esc(next.name)} →</a>` : ''}
        </div>
      </div>
      <div class="sum-grid">
        <article class="card sum-intent">
          <h3>Amaç</h3>
          <p>Bir nesneye <b>çalışma anında</b>, dinamik olarak <b>ek sorumluluklar</b> ekle; işlevselliği genişletmek için alt sınıf oluşturmaya esnek bir alternatif.</p>
          <div class="sum-formula"><code>new C(new B(new Cekirdek()))</code> → <code>operation()</code> içeri iner → her katman <code><span class="tk-dlg">icteki</span>.operation()</code> + kendi payı <span>(arayüz hiç değişmez)</span></div>
        </article>
        <article class="card sum-uml"><h3>Yapı (GoF)</h3><div class="sum-diag"></div></article>
        <article class="card">
          <h3>Alt sınıflar ↔ Dekoratör</h3>
          <table class="cmp sg-sum-cmp">
            <thead><tr><th></th><th>Alt sınıflar</th><th>Dekoratör</th></tr></thead>
            <tbody>
              <tr><td>n seçenek</td><td class="bad">2ⁿ sınıf</td><td class="ok">n sınıf</td></tr>
              <tr><td>Ne zaman?</td><td>Derleme anı</td><td class="ok">Çalışma anı</td></tr>
              <tr><td>Sıra / tekrar</td><td class="bad">Sabit</td><td class="ok">Serbest</td></tr>
              <tr><td>Bir kural</td><td class="bad">Çok yerde</td><td class="ok">Tek yerde</td></tr>
            </tbody>
          </table>
        </article>
        <article class="card">
          <h3>Katılımcılar</h3>
          <ul class="sum-roles">
            <li>${ui.roleChip('component')}<span>ortak arayüz</span></li>
            <li>${ui.roleChip('concreteComponent')}<span>sarılan çekirdek</span></li>
            <li>${ui.roleChip('decorator')}<span>uygular + içinde tutar</span></li>
            <li>${ui.roleChip('concreteDecorator')}<span>iletir, payını ekler</span></li>
          </ul>
        </article>
        <article class="card sum-pros">
          <h3>Artıları</h3>
          <ul>
            <li>Sorumluluklar <b>çalışma anında</b> eklenir</li>
            <li>Sınıf patlaması yok; her kural <b>tek sınıfta</b> (SRP)</li>
            <li>Yeni katman = yeni sınıf, eskilere dokunulmaz (<b>OCP</b>)</li>
            <li>Katmanlar istenen <b>sırada</b> ve <b>sayıda</b> birleşir</li>
          </ul>
        </article>
        <article class="card sum-cons">
          <h3>Eksileri</h3>
          <ul>
            <li>Çok sayıda <b>küçük nesne</b>; zinciri izlemek zor</li>
            <li>Sarılmış nesne çekirdekle <b>aynı nesne değil</b> (<code>==</code>)</li>
            <li>Yanlış <b>sıra</b> sessizce yanlış sonuç verir</li>
            <li>Katmanın yeni metotları ancak o tiple görülür</li>
          </ul>
        </article>
        <article class="card">
          <h3>İlişkili kalıplar</h3>
          <ul>
            <li><b>Adapter:</b> arayüzü değiştirir; Decorator aynı tutar.</li>
            <li><b>Composite:</b> benzer yapı (tek çocuklu); amacı nesne toplamak.</li>
            <li><b>Strategy:</b> nesnenin içini değiştirir; Decorator kabuğunu.</li>
            <li><b>Proxy:</b> aynı arayüzle erişimi denetler.</li>
          </ul>
        </article>
        <article class="card sum-tip">
          <h3>Sınav ipuçları</h3>
          <pre class="mini-code">abstract class EkHizmet implements KargoHizmeti { // "dir"
    protected final KargoHizmeti icteki;          // "sahiptir"
}
class Sigorta extends EkHizmet {
    public int ucret() { return icteki.ucret() + 35; }
}
KargoHizmeti h = new Sigorta(new Ekspres(new StandartKargo()));</pre>
          <p class="exam"><b>Kombinasyon patlaması + çalışma anında ekleme</b> → Decorator · <b>Component, ConcreteComponent, Decorator, ConcreteDecorator</b> · dekoratör hem <u>uygular</u> hem <u>içinde tutar</u></p>
        </article>
        <article class="card sum-files">
          <h3>Java kodları</h3>
          <p>Çalıştırılabilir örnekler proje klasöründe:</p>
          <pre class="mini-code">java/decorator/sorun     → 8 kombinasyon sınıfı; zam bir sınıfta unutuldu
java/decorator/cozum     → katmanlar: new Sigorta(new Ekspres(…))
java/decorator/akis/...  → Canlı Akış'taki iki tarif
java/decorator/tezgah    → sıra (112 ≠ 120) ve iki SMS
java/decorator/genislet  → HediyePaketi: yeni katman</pre>
          <p>Derleyip çalıştırmak için <code>java/README.md</code> dosyasına bakın.</p>
        </article>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-print]').addEventListener('click', () => window.print());
    const diag = new DP.ClassDiagram(el.querySelector('.sum-diag'), DC.gofDiagram({}), { roles: DC.roles, roleTags: false, mode: 'generic' });
    diag.svg.classList.add('is-compact');
    return { destroy() {} };
  };

  // ================================================================== kayıt
  DP.register({
    id: 'decorator',
    name: 'Decorator',
    tr: 'Dekoratör',
    category: 'structural',
    roleOf: DC.roleOf,
    initialState: () => ({
      view: 'stage',
      showCode: true,
      preset: 'ekspresSigorta',
      tz: { core: 'standart', layers: ['ekspres'] },
      hediyeUnlocked: false,
      ext: {},
      quiz: { results: {}, match: false },
    }),
    scenes: [
      { id: 'giris', title: 'Giriş', mount: DC.scenes.intro },
      { id: 'sorun', title: 'Sorun', mount: DC.scenes.problem },
      { id: 'cozum', title: 'Çözüm', mount: DC.scenes.solution },
      { id: 'akis', title: 'Canlı Akış', mount: DC.scenes.flow, star: true },
      { id: 'tezgah', title: 'Sipariş Tezgâhı', mount: DC.scenes.counter, star: true },
      { id: 'yapi', title: 'Yapı (UML)', mount: DC.scenes.structure },
      { id: 'genislet', title: 'Genişlet', mount: DC.scenes.extend },
      { id: 'gercek', title: 'Gerçek Dünya', mount: DC.scenes.realworld },
      { id: 'quiz', title: 'Quiz', mount: DC.scenes.quiz },
      { id: 'ozet', title: 'Özet', mount: DC.scenes.summary },
    ],
  });
})();
