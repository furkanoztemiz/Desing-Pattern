/*
 * Bridge — sahneler (3/3): Yapı, Genişlet, Gerçek Dünya, Quiz, Özet ve kalıp kaydı
 */
(function () {
  'use strict';
  const BR = DP.br;
  const { h } = DP;
  const kit = DP.kit;
  const ui = BR.ui;
  const md = BR.md;
  const C = BR.code;
  const EX = BR.ext;

  // ================================================================== 6. YAPI
  const ROLE_TEXT = {
    client: 'Köprüyü <b>kurar</b>: bir etiket ile bir yazıcıyı çalışma anında birleştirir.',
    abstraction: 'Üst düzey arayüz (<b>ne</b> basılacak); gerçekleştiriciyi bir <b>alanda</b> tutar ve işi ona devreder.',
    refinedAbstraction: 'Soyutlamayı genişletir (yeni etiket türleri); yine yalnızca <b>ilkel işlemleri</b> kullanır.',
    implementor: 'Gerçekleştiricilerin <b>ilkel</b> arayüzü (<b>nasıl</b> basılacak); soyutlamanın arayüzüne benzemek zorunda değildir.',
    concreteImplementor: 'İlkel işlemleri bir platforma (cihaza) göre <b>gerçekler</b>: ZPL, PDF, ESC/POS…',
  };

  function classInfo(id) {
    const pk = BR.printerOrder.find((k) => BR.PRINTERS[k].cls === id);
    if (pk) {
      const P = BR.PRINTERS[pk];
      return { role: 'concreteImplementor', file: id + '.java', code: C[id], mark: 'public void yazi(', points: [`İlkel işlemleri **kendi diliyle** gerçekler: ${P.dialect}.`, 'Hangi etiketi bastığını **bilmez**.', 'Yeni cihaz = **bir** yeni sınıf (kalıtımla: bir sütun dolusu).'] };
    }
    switch (id) {
      case 'Main':
        return { role: 'client', file: 'Main.java', code: C.Main, mark: 'Yazici zebra = new ZebraYazici();', points: ['Etiketi ve yazıcıyı **birleştirir**: `new KirilacakEtiket(zebra)`.', 'Hangi eşleşmenin kurulacağına **çalışma anında** karar verir.', 'Ne etiketin ne de yazıcının iç işini bilir.'] };
      case 'Etiket':
        return { role: 'abstraction', file: 'Etiket.java', code: C.Etiket, mark: 'protected Yazici yazici;', points: ['Köprüyü tutar: `protected Yazici yazici;`', 'Üst düzey işlemleri ilkel çağrılarla kurar: `adresVeBarkod`.', 'Yazıcıyı çalışma anında değiştirebilir: `yaziciDegistir`.'] };
      case 'KirilacakEtiket':
      case 'IadeEtiketi':
        return { role: 'refinedAbstraction', file: id + '.java', code: C[id], mark: id === 'IadeEtiketi' ? 'yazici.yazi(5, 5, "İADE: Malatya depo");' : 'yazici.cerceve(2, 2, 96, 56);', points: ['Etiket türüne özgü **mantığı** taşır (çerçeve, uyarı, İADE başlığı).', 'İçinde tek bir cihaz komutu yok; **her yazıcıyla** çalışır.', 'Yeni etiket türü = **bir** yeni sınıf (kalıtımla: bir satır dolusu).'] };
      case 'Yazici':
        return { role: 'implementor', file: 'Yazici.java', code: C.Yazici, mark: 'public interface Yazici', points: ['**İlkel** işlemler: basla, yazi, barkod, cerceve, bitir.', 'Soyutlamanınkinden **alt düzey**: `yazdir()` burada yok.', 'GoF: iki arayüz birbirine benzemek zorunda değildir.'] };
      default:
        return null;
    }
  }

  BR.scenes.structure = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split' });
    const tools = h('div', { class: 'panel-tools' });
    const body = h('div', { class: 'scene-body cols-64' });
    const left = kit.panel('Yapı', { cls: 'panel-diagram', extra: tools });
    const right = kit.panel('Rol kartı <span class="panel-sub">· bir sınıfa tıklayın</span>', { cls: 'panel-side' });
    body.append(left.el, right.el);
    el.append(body);
    root.appendChild(el);

    const diagHost = h('div', { class: 'diag-host' });
    const legend = kit.umlLegend({ aggregation: true, fmLabel: 'cihazın diline çeviren gerçekleştirim' });
    left.body.append(diagHost, legend);
    const diagram = new DP.ClassDiagram(diagHost, BR.gofDiagram({ notes: true }), {
      roles: BR.roles,
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
      const r = BR.roles[info.role];
      infoTop.innerHTML = `
        <div class="info-role rc rc-${r.color}"><span class="info-dot"></span><b>${r.en}</b> · ${r.tr}</div>
        <div class="info-name rc rc-${r.color}">${DP.esc(id)}</div>
        <p class="info-desc">${ROLE_TEXT[info.role]}</p>
        <ul class="info-points">${info.points.map((p) => `<li>${md(p)}</li>`).join('')}</ul>`;
      const cv = new DP.CodeView(infoCode, { files: [{ name: info.file, code: info.code }], roleOf: BR.roleOf, special: BR.special, compact: true });
      cv.mark(info.file, info.mark, 'focus');
      DP.flash(infoTop, 'is-pop');
    }

    function showOverview() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">Dört rol, iki hiyerarşi</div>
        <div class="role-list">
          ${['abstraction', 'refinedAbstraction', 'implementor', 'concreteImplementor']
            .map((k) => `<div class="role-row rc rc-${BR.roles[k].color}"><span class="info-dot"></span><div><b>${BR.roles[k].en}</b> · ${BR.roles[k].tr}<div class="role-desc">${ROLE_TEXT[k]}</div></div></div>`)
            .join('')}
        </div>
        <p class="info-desc">Köprüyü <b>Client</b> kurar. Üstteki <b>Genel (GoF)</b> düğmesi kitaptaki adları gösterir.</p>`;
    }

    const IMPLS = ['ZebraYazici', 'PdfYazici', 'TermalYazici'];
    const STEPS = [
      { t: 'Genel bakış', x: 'Dört rol **iki hiyerarşide**: solda **Abstraction** ve **RefinedAbstraction**, sağda **Implementor** ve **ConcreteImplementor**. Aradaki ◇ çizgi köprünün kendisi: `yazici` alanı. Köprüyü **Client** kurar.', info: null },
      { t: 'Abstraction — Soyutlama', x: '[[Etiket]] istemcinin konuştuğu üst düzey arayüz: `yazdir(g)`. Gerçekleştiriciyi bir **alanda** tutar ve üst düzey işlemlerini ilkel çağrılarla kurar: `adresVeBarkod`.', info: 'Etiket', focus: { classes: ['Etiket'], members: [['Etiket', 'yazici'], ['Etiket', 'adres']] } },
      { t: 'RefinedAbstraction — Özelleşmiş soyutlama', x: '[[KirilacakEtiket]] ve [[IadeEtiketi]] soyutlamayı **genişletir**. Hangi yazıcıda basılacaklarını bilmezler; yalnızca ilkel işlemleri çağırırlar.', info: 'KirilacakEtiket', focus: { classes: ['KirilacakEtiket', 'IadeEtiketi'], edges: ['g-kirilacak', 'g-iade'] } },
      { t: 'Implementor — Gerçekleştirici', x: '[[Yazici]] gerçekleştiricilerin arayüzü: yalnızca **ilkel** işlemler. Soyutlamanın arayüzüne benzemesi gerekmez; GoF’ta da Implementor genellikle daha alt düzeydir.', info: 'Yazici', focus: { classes: ['Yazici'] } },
      { t: 'ConcreteImplementor — Somut gerçekleştirici', x: '[[ZebraYazici]], [[PdfYazici]], [[TermalYazici]] ilkel işlemleri **kendi platformlarına** çevirir: ZPL, PDF, ESC/POS. Yeni bir cihaz = yeni bir sınıf; etiketlere dokunulmaz.', info: 'ZebraYazici', focus: { classes: IMPLS, edges: ['r-zebra', 'r-pdf', 'r-termal'] } },
      { t: 'Köprü: kompozisyon', x: 'Soyutlama gerçekleştiriciyi **tutar** (◇ toplama); aralarında kalıtım yok. Böylece iki hiyerarşi **bağımsız** büyür ve bağlantı **çalışma anında** kurulur. Nottaki satır: soyutlama işi ilkel bir çağrıya devreder.', info: 'Etiket', focus: { classes: ['Etiket', 'Yazici'], edges: ['kopru'] } },
      { t: 'Client — İstemci', x: '[[Main]] köprüyü kurar: `new KirilacakEtiket(zebra)`. Hangi eşleşmenin kurulacağına çalışma anında karar verir; GoF’a göre bu seçimi bir **Abstract Factory** de üstlenebilir.', info: 'Main', focus: { classes: ['Main'], edges: ['uses'] } },
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

  // ================================================================== 7. GENİŞLET: yeni gerçekleştirici HtmlYazici
  BR.scenes.extend = function (root, ctx) {
    const S = ctx.state;
    S.ext = S.ext || {};
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-50' });
    const left = kit.panel('Görev: HtmlYazici', { cls: 'panel-code panel-ex' });
    const right = kit.panel('Köprü', { cls: 'panel-side br-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    // ---- sol (adım 0): alıştırma
    const exBox = h('div', { class: 'ex-box' });
    const task = h('div', {
      class: 'task-card',
      html: md('📩 **Müşteri paneli ekibi:** “Etiketleri panelde **HTML** olarak gösterelim; kırılacak da iade de, hepsi!”\nKural: **etiket sınıflarına dokunmadan** yeni bir yazıcı ekleyin.'),
    });
    const ex = kit.blankExercise({
      files: [
        { name: 'HtmlYazici.java', code: EX.exercise, badge: 'YENİ' },
        { name: 'Main.java · ek', code: EX.exerciseMain },
      ],
      answers: { 1: 'Yazici', 2: 'yazi', 3: 'bitir', 4: 'HtmlYazici', 5: 'KirilacakEtiket' },
      hints: {
        1: 'Yeni cihaz hangi **gerçekleştirici arayüzünü** uygulamalı?',
        2: 'Konum ve metin alan ilkel işlemin adı ne?',
        3: 'Etiketi kapatan (son) ilkel işlem hangisi?',
        4: 'Köprünün öbür ucuna **hangi yeni sınıfın** nesnesini bağlıyoruz?',
        5: 'Cam vazonun etiketi: hangi **özelleşmiş soyutlama**?',
      },
      choices: ['Yazici', 'Etiket', 'ZebraYazici', 'yazi', 'barkod', 'basla', 'bitir', 'HtmlYazici', 'KirilacakEtiket', 'IadeEtiketi'],
      roleOf: BR.roleOf,
      special: BR.special,
      state: S.ext,
      doneText: '<b class="ok">✔ Derleme başarılı!</b> Yeni yazıcı hazır.',
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
    const runBox = h('div', { class: 'br-runbox', hidden: true });
    const runCode = h('div', { class: 'br-cv' });
    const runConsole = h('div', { class: 'console br-console' });
    runBox.append(runCode, runConsole);
    left.body.append(exBox, runBox);
    const runCv = new DP.CodeView(runCode, { roleOf: BR.roleOf, special: BR.special });

    // ---- sağ: köprü + etki
    const viewHost = h('div', { class: 'br-view' });
    const impact = h('div', { class: 'br-extra' });
    right.body.append(viewHost, impact);
    const stage = new BR.Bridge(viewHost);

    const nK = BR.prims('kirilacak').length;
    const nI = BR.prims('iade').length;
    const STEPS = [
      {
        t: 'Görev: HtmlYazici',
        x: 'Boşluklara tıklayıp doğru parçaları seçin. İpucu: yeni cihaz, `Yazici` arayüzünün beş **ilkel** işlemini kendi diliyle (HTML) gerçekler.',
        st: { label: 'kirilacak', ghostPrinter: 'html', banner: { text: 'Yeni yazıcı = **tek bir sınıf**. Hangi etiket sınıfına dokunacağız? **Hiçbirine.**' } },
      },
      {
        t: 'Derlendi: kırılacak etiket HTML’de',
        x: '[[KirilacakEtiket]] hiç değişmeden yeni yazıcıya bağlandı: `new KirilacakEtiket(html)`. Aynı altı ilkel çağrı bu kez HTML etiketlerine çevrildi.',
        st: { label: 'kirilacak', printer: 'html', bridge: true, n: nK, finished: true, banner: { text: `✓ KirilacakEtiket → **HtmlYazici**: ${nK} komut`, tone: 'ok' } },
      },
      {
        t: 'Her etiketle çalışır',
        x: '[[IadeEtiketi]] de aynı yazıcıyla basılıyor. Yeni bir gerçekleştirici, var olan **bütün** soyutlamalarla kendiliğinden eşleşir.',
        st: { label: 'iade', printer: 'html', bridge: true, n: nI, finished: true, banner: { text: '✓ İade etiketi de HTML’de: etiket sınıflarına dokunulmadı.', tone: 'ok' } },
      },
      {
        t: 'Kalıtımla olsaydı?',
        x: 'Kalıpsız çözümde yeni yazıcı **bir sütun dolusu** sınıf demekti: `HtmlStandartEtiket`, `HtmlKirilacakEtiket`, `HtmlIadeEtiketi`. Köprüyle **+1 sınıf**. HTML artık **Eşleştirme Tezgâhı**’nda da açık.',
        st: { label: 'iade', printer: 'html', bridge: true, n: nI, finished: true, banner: { text: 'Yeni yazıcı: kalıtımla **+3 sınıf**, köprüyle **+1 sınıf**.', tone: 'ok' } },
      },
    ];

    function renderLeft(i) {
      exBox.hidden = i >= 1;
      runBox.hidden = i < 1;
      left.head.querySelector('.panel-title').innerHTML = i >= 1 ? 'Yeni gerçekleştirici: <span class="ver">HtmlYazici</span>' : 'Görev: HtmlYazici';
      if (i < 1) return;
      runCv.setFiles(
        [
          { name: 'HtmlYazici.java', code: C.HtmlYazici, badge: 'YENİ' },
          { name: 'Main.java', code: EX.Main },
        ],
        { active: i === 1 ? 'HtmlYazici.java' : 'Main.java', keepActive: false }
      );
      if (i === 1) runCv.mark('HtmlYazici.java', 'public void yazi(', 'focus');
      else runCv.mark('Main.java', 'new IadeEtiketi(html).yazdir(iade);', 'focus');
      BR.renderConsole(runConsole, '$ javac *.java && java Main', EX.output.map((t, j) => ({ t, ok: i === 1 ? j < nK : j >= nK, dim: i === 1 ? j >= nK : j < nK })));
    }

    function renderImpact(i, animate) {
      if (i === 0) {
        impact.innerHTML = `<div class="impact-title">İpucu</div><p>${md('Etiketler `yazici.yazi(…)`, `yazici.barkod(…)` der: **ne** çizileceğini onlar söyler. Yeni sınıf yalnızca **nasıl** çizileceğini (HTML) bilir.')}</p>`;
      } else if (i === 1) {
        impact.innerHTML = `
          <div class="impact-title ok">✔ Derleme başarılı · yeni gerçekleştirici</div>
          <ul class="filelist"><li><span class="cv-dot rc rc-${BR.roleOf('HtmlYazici')}"></span>HtmlYazici.java <span class="cv-badge is-new">YENİ</span></li></ul>`;
      } else if (i === 2) {
        impact.innerHTML = `
          <div class="metrics">
            <div class="metric is-good"><div class="m-val">0</div><div class="m-label">değişen etiket sınıfı</div></div>
            <div class="metric"><div class="m-val">1</div><div class="m-label">yeni sınıf</div></div>
            <div class="metric"><div class="m-val">3</div><div class="m-label">etiket türüyle çalışır</div></div>
          </div>`;
      } else {
        impact.innerHTML = `
          <table class="cmp br-cmp">
            <thead><tr><th>Yeni yazıcı</th><th>Kalıtımla</th><th>Köprüyle</th></tr></thead>
            <tbody>
              <tr><td>Yeni sınıf</td><td class="bad">+3 (bir sütun)</td><td class="ok">+1</td></tr>
              <tr><td>Toplam</td><td class="bad">9 → 12 (3 × 4)</td><td class="ok">6 → 7 (3 + 4)</td></tr>
              <tr><td>Değişen etiket sınıfı</td><td>0</td><td class="ok">0</td></tr>
            </tbody>
          </table>
          <div class="br-go"><button class="btn btn-primary btn-sm" type="button" data-go>🧩 Eşleştirme Tezgâhı’nda dene →</button></div>`;
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
          S.htmlUnlocked = true;
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
  const RW = BR.rw;
  const TABS = [
    {
      tab: 'newSetFromMap',
      title: '`Collections.newSetFromMap` — Set soyutlaması, Map gerçekleştirimi',
      intro: '`newSetFromMap` bir **Set** döndürür ama elemanları kendisi saklamaz: her işi verdiğiniz **Map**’e devreder (içindeki alan: `private final Map<E, Boolean> m;`). Aynı küme kodu, üç ayrı gerçekleştirimle.',
      map: [
        ['abstraction', 'Etiket', '`Set<String>` (`Collections$SetFromMap`)'],
        ['implementor', 'Yazici', '`Map<E, Boolean>`'],
        ['concreteImplementor', 'ZebraYazici', '`HashMap`, `LinkedHashMap`, `TreeMap`'],
        ['client', 'Main', 'Kümeyi kullanan kodunuz'],
      ],
      note: 'Sıra **gerçekleştirimden** gelir: HashMap karışık, LinkedHashMap ekleme sırası, TreeMap alfabetik… ama “İzmir” sona düştü: `String.compareTo` Türkçe bilmez (İ, Unicode’da M’den sonra gelir). Türkçe sıralama için `Collator` gerekir. Çıktılar Java 21 ile alındı.',
      roles: {},
      file: 'KumeKoprusu.java',
      code: RW.set,
      options: RW.setOpts,
      cmd: '$ java KumeKoprusu',
    },
    {
      tab: 'Swing görünümü',
      title: '`JButton` ↔ `ButtonUI` — takılıp çıkarılabilen görünüm',
      intro: 'Bir Swing düğmesi kendini **çizmez**: çizimi bir **UI temsilcisine** (`ButtonUI`) devreder. Görünüm (Look and Feel) değişince aynı `JButton` sınıfı başka bir gerçekleştirimle çizilir; düğmeyi kullanan kod değişmez.',
      map: [
        ['abstraction', 'Etiket', '`JComponent` → `JButton`'],
        ['implementor', 'Yazici', '`ComponentUI` → `ButtonUI`'],
        ['concreteImplementor', 'ZebraYazici', '`MetalButtonUI`, `SynthButtonUI` (Nimbus)…'],
      ],
      note: 'Görünümü seçen `UIManager` bir **Abstract Factory** gibi çalışır; GoF’un dediği gibi bir Abstract Factory belirli bir Bridge’i kurup yapılandırabilir. Program ekransız (headless) da çalışır; çıktılar Java 21 ile alındı.',
      roles: {},
      file: 'GorunumKoprusu.java',
      code: RW.ui,
      options: RW.uiOpts,
      cmd: '$ java GorunumKoprusu',
    },
    {
      tab: 'JDBC',
      title: 'JDBC — uygulama ile veritabanı sürücüsü arasındaki köprü',
      intro: 'Uygulamanız yalnızca `java.sql` arayüzlerini (`Connection`, `PreparedStatement`, `ResultSet`) bilir. Gerçek işi yapan **sürücü** ise bağlantı adresine göre **çalışma anında** seçilir: PostgreSQL, MySQL, H2… Uygulamalar ve sürücüler birbirinden bağımsız gelişir.',
      map: [
        ['abstraction', 'Etiket', '`java.sql` arayüzleriyle yazılmış uygulama kodu'],
        ['implementor', 'Yazici', '`java.sql.Driver` (sürücü arayüzü)'],
        ['concreteImplementor', 'ZebraYazici', '`org.postgresql.Driver`, `com.mysql.cj.jdbc.Driver`…'],
      ],
      note: 'Bu parça bir veritabanı ve sürücü gerektirdiği için burada çalıştırılmadı. Kodda hiçbir sürücü sınıfının adı geçmiyor: bu, köprünün öbür ucunun serbest olduğunun işareti.',
      roles: {},
      file: 'GonderiSorgusu.java',
      code: RW.jdbc,
      mark: 'DriverManager.getConnection(url)',
    },
    {
      tab: 'Karıştırmayın!',
      title: 'Bridge, Adapter, Strategy, Abstract Factory',
      intro: 'Bridge ile Adapter’ın yapısı benzer: ikisi de bir nesneyi tutup işi ona devreder. Fark, **ne zaman** ve **neden** kullanıldıklarında.',
      extraHtml: `<table class="cmp cmp-3">
        <thead lang="en"><tr><th></th><th>Bridge</th><th>Adapter</th><th>Strategy</th><th>Abstract Factory</th></tr></thead>
        <tbody>
          <tr><td>Ne zaman?</td><td>Tasarımda, <b>önceden</b></td><td>Tasarımdan <b>sonra</b></td><td>Tasarımda</td><td>Tasarımda</td></tr>
          <tr><td>Amaç</td><td>İki boyutu bağımsız büyütmek</td><td>Uyumsuz arayüzü uydurmak</td><td>Algoritmayı değiştirmek</td><td>Ürün ailesi üretmek</td></tr>
          <tr><td>Tutulan nesne</td><td>Gerçekleştirici (bir hiyerarşi)</td><td>Uyarlanan (yabancı sınıf)</td><td>Strateji</td><td>— (nesne üretir)</td></tr>
          <tr><td>Soyutlama tarafı</td><td>Bir <b>hiyerarşi</b></td><td>Tek adaptör</td><td>Genelde tek bağlam</td><td>—</td></tr>
        </tbody></table>`,
      note: 'GoF: Adapter, tasarlanmış sistemler birlikte çalışsın diye **sonradan** uygulanır; Bridge ise soyutlama ve gerçekleştirim bağımsız değişebilsin diye **baştan** kullanılır. Bir Abstract Factory de belirli bir köprüyü kurup yapılandırabilir.',
      roles: { Etiket: 'abstraction', KirilacakEtiket: 'refinedAbstraction', ZebraYazici: 'concreteImplementor', Yazici: 'implementor' },
      special: BR.special,
      file: 'Karsilastirma.java',
      code: () => `// Bridge: iki hiyerarşi, tasarımda kuruldu — iki taraf da bizim
Etiket etiket = new KirilacakEtiket(new ZebraYazici());

// Adapter: var olan yabancı sınıfı bizim arayüzümüze uydurur (sonradan)
KargoFirmasi firma = new GlobalShipAdaptoru(new GlobalShipApi());

// Abstract Factory, köprünün hangi gerçekleştiriciyle kurulacağını seçebilir
Yazici yazici = depoFabrikasi.yaziciOlustur();
Etiket depoEtiketi = new KirilacakEtiket(yazici);`,
      mark: 'new KirilacakEtiket(new ZebraYazici())',
    },
  ];

  BR.scenes.realworld = (root, ctx) =>
    kit.realWorldScene(root, ctx, {
      tabs: TABS,
      roles: BR.roles,
      roleOf: BR.roleOf,
      fmLabel: 'gerçekleştirim',
      footText: (i) =>
        i === 3
          ? 'Yapı benziyorsa amaca ve **zamana** bakın: Bridge baştan kurulur, Adapter sonradan takılır.'
          : i === 2
          ? 'Uygulama kodu sürücünün sınıf adını hiç yazmaz; sürücü bağlantı adresine göre **çalışma anında** seçilir.'
          : 'Kendi örneğimizdeki rolleri JDK’da bulun. Sağdaki düğmelerle gerçekleştirimi değiştirin: **soyutlamayı kullanan kod hiç değişmiyor**.',
    });

  // ================================================================== 9. QUIZ
  const Q = [
    {
      type: 'mcq',
      q: 'Bridge kalıbının **temel amacı** (GoF) nedir?',
      options: ['Bir soyutlamayı gerçekleştiriminden ayırmak; böylece ikisi bağımsız olarak değişebilsin', 'Uyumsuz bir sınıfın arayüzünü, istemcinin beklediği başka bir arayüze dönüştürmek', 'Bir nesneye, alt sınıf yazmadan, çalışma anında ek sorumluluklar eklemek ve katlamak', 'Karmaşık bir alt sistemin önüne sade, tek bir giriş noktası (arayüz) koymak'],
      answer: 0,
      explain: 'GoF: “Bir soyutlamayı gerçekleştiriminden ayır; böylece ikisi bağımsız olarak değişebilsin.” Diğerleri Adapter, Decorator ve Facade’ın amaçlarıdır.',
    },
    {
      type: 'mcq',
      q: '**4 etiket türü** ve **5 yazıcı** var. Her eşleşme bir sınıf olursa (kalıtımla) ve köprüyle kaç somut sınıf gerekir?',
      options: ['9 ve 20', '20 ve 9', '20 ve 20', '9 ve 9'],
      answer: 1,
      explain: 'Kalıtımla m × n = 4 × 5 = 20 eşleşme sınıfı; köprüyle m + n = 4 + 5 = 9 (etiket türleri + yazıcılar). Boyutlar büyüdükçe fark hızla açılır.',
    },
    {
      type: 'line',
      q: 'Bu sınıfta **köprünün kendisi** olan satıra tıklayın.',
      codeName: 'Etiket.java',
      code: BR.plain(C.Etiket),
      answer: 'protected Yazici yazici;',
      explain: 'Köprü bir alandır: soyutlama gerçekleştiriciyi **tutar** (kompozisyon). Kalıtım yerine bu alan sayesinde iki hiyerarşi bağımsız büyür.',
    },
    {
      type: 'mcq',
      q: '`ZebraYazici.basla()` içine `^CI28` eklendi. Hangi etiketler düzelir?',
      options: ['Yalnızca standart etiket', 'Yalnızca KirilacakEtiket', 'Zebra’da basılan bütün etiket türleri — tek değişiklikle', 'Hiçbiri; her etiket sınıfı ayrıca güncellenmeli'],
      answer: 2,
      explain: 'Cihaz komutları yalnızca gerçekleştiricide yazılı. Kalıpsız sürümde aynı düzeltme üç sınıfa yapılmalıydı ve biri unutulmuştu.',
    },
    {
      type: 'mcq',
      q: 'Bridge ile Adapter arasındaki temel fark nedir?',
      options: ['Bridge baştan kurulur ki iki taraf bağımsız büyüsün; Adapter uyumsuz bir sınıfı sonradan uydurur', 'Adapter kompozisyonla, Bridge ise kalıtımla iki sınıf hiyerarşisini birleştirir', 'Bridge yalnızca arayüzlerle, Adapter yalnızca somut sınıflarla çalışabilir; başka fark yok', 'Aralarında fark yoktur; ikisi de tasarım aşamasında, aynı amaçla kurulur'],
      answer: 0,
      explain: 'Yapıları benzer: ikisi de bir nesneyi tutup işi ona devreder. Fark amaçta ve zamandadır (GoF).',
    },
    {
      type: 'line',
      q: 'Bu programda **gerçekleştiricinin çalışma anında değiştirildiği** satıra tıklayın.',
      codeName: 'Main.java',
      code: BR.tezgahMain('kirilacak', 'zebra', 'pdf'),
      answer: 'etiket.yaziciDegistir(new PdfYazici());',
      explain: 'Aynı etiket nesnesi köprüsünü başka bir yazıcıya bağladı. Kalıtımla yazıcı, nesnenin sınıfına kaynaklı olurdu.',
    },
    {
      type: 'mcq',
      q: '`Yazici` arayüzünde neden `yazdir()` yok da `yazi`, `barkod`, `cerceve` gibi ilkel işlemler var?',
      options: ['Java arayüzleri yalnızca tek satırlık, ilkel işlemler içerebilir; üst düzey metot içeremez', 'Gerçekleştirici ilkel işlemleri sağlar, soyutlama birleştirir; yeni etiket türü yazıcıya dokunmaz', 'İlkel işlemler daha hızlı çalışır; yazdırma süresi her etikette kısalsın diye', 'Her yazıcı yalnızca tek bir etiket türü basabilsin, türler birbirine karışmasın diye'],
      answer: 1,
      explain: 'GoF: Implementor’ın arayüzü Abstraction’ınkine benzemek zorunda değildir; genellikle ilkel işlemler sunar, Abstraction bunlardan üst düzey işlemler kurar (`adresVeBarkod`, `yazdir`).',
    },
    {
      type: 'mcq',
      q: 'Java’da hangisi bir **Bridge** örneği olarak gösterilir?',
      options: ['`Arrays.asList(dizi)`: bir diziyi List arayüzüne uydurur, kopyalamadan', '`new BufferedReader(new FileReader(dosya))`: okuyucuyu tamponla sarar', 'JDBC: uygulama `java.sql` arayüzleriyle yazılır, sürücü çalışma anında seçilir', '`Runtime.getRuntime()`: çalışma ortamının tek örneğine ulaştırır'],
      answer: 2,
      explain: '`asList` bir Adapter, `BufferedReader` bir Decorator, `getRuntime` bir Singleton. JDBC’de uygulamalar ve sürücüler birbirinden bağımsız gelişir.',
    },
  ];

  BR.scenes.quiz = (root, ctx) =>
    kit.quizScene(root, ctx, {
      questions: Q,
      roleOf: BR.roleOf,
      special: BR.special,
      patternName: 'Bridge',
      match: {
        items: ['Etiket', 'KirilacakEtiket', 'IadeEtiketi', 'Yazici', 'ZebraYazici', 'PdfYazici', 'TermalYazici', 'HtmlYazici'].map((id) => ({ id, label: id })),
        buckets: ['abstraction', 'refinedAbstraction', 'implementor', 'concreteImplementor'].map((k) => ({ id: k, title: BR.roles[k].en, sub: BR.roles[k].tr, color: BR.roles[k].color })),
        answer: BR.classRoles,
        hint: 'Sekiz sınıfı dört role yerleştirin. Takıldığınızda **Cevapları göster** düğmesi var.',
      },
    });

  // ================================================================== 10. ÖZET
  BR.scenes.summary = function (root, ctx) {
    const at = DP.catalog.findIndex((p) => p.id === 'bridge');
    const next = DP.catalog.slice(at + 1).find((p) => p.ready && DP.patterns[p.id]);
    const el = h('div', { class: 'scene scene-summary' });
    el.innerHTML = `
      <div class="sum-head">
        <div>
          <div class="chips"><span class="chip chip-cat is-struct">Yapısal · Structural</span><span class="chip">Diğer adı: Handle/Body</span></div>
          <h1>Bridge — Özet</h1>
        </div>
        <div class="sum-actions no-print">
          <button class="btn btn-ghost" type="button" data-print>🖨 Yazdır / PDF</button>
          <a class="btn btn-ghost" href="#/adapter/ozet">← Adapter özeti</a>
          <a class="btn btn-ghost" href="#/">Tüm kalıplar</a>
          ${next ? `<a class="btn btn-primary" href="#/${next.id}">Sıradaki kalıp: ${DP.esc(next.name)} →</a>` : ''}
        </div>
      </div>
      <div class="sum-grid">
        <article class="card sum-intent">
          <h3>Amaç</h3>
          <p>Bir soyutlamayı <b>gerçekleştiriminden ayır</b>; böylece ikisi <b>birbirinden bağımsız olarak</b> değişebilsin.</p>
          <div class="sum-formula"><code>abstraction.operation()</code> → <code><span class="tk-brg">imp</span>.operationImp()</code> <span>(iki hiyerarşi, aralarında tek bir alan)</span></div>
        </article>
        <article class="card sum-uml"><h3>Yapı (GoF)</h3><div class="sum-diag"></div></article>
        <article class="card">
          <h3>Kalıtım ↔ Köprü</h3>
          <table class="cmp sg-sum-cmp">
            <thead><tr><th></th><th>Her eşleşme bir sınıf</th><th>Köprü</th></tr></thead>
            <tbody>
              <tr><td>Sınıf sayısı</td><td class="bad">m × n</td><td class="ok">m + n</td></tr>
              <tr><td>Eşleşme ne zaman?</td><td>Derleme anı</td><td class="ok">Çalışma anı</td></tr>
              <tr><td>Bir cihaz düzeltmesi</td><td class="bad">Bir sütun dolusu</td><td class="ok">Tek sınıf</td></tr>
              <tr><td>Yeni tür / cihaz</td><td class="bad">Bir satır / sütun</td><td class="ok">Bir sınıf</td></tr>
            </tbody>
          </table>
        </article>
        <article class="card">
          <h3>Katılımcılar</h3>
          <ul class="sum-roles">
            <li>${ui.roleChip('abstraction')}<span>ne · köprüyü tutar</span></li>
            <li>${ui.roleChip('refinedAbstraction')}<span>yeni türler</span></li>
            <li>${ui.roleChip('implementor')}<span>ilkel arayüz</span></li>
            <li>${ui.roleChip('concreteImplementor')}<span>nasıl · platforma özgü</span></li>
          </ul>
        </article>
        <article class="card sum-pros">
          <h3>Artıları</h3>
          <ul>
            <li>İki hiyerarşi <b>bağımsız</b> büyür (<b>OCP</b>)</li>
            <li>Gerçekleştirici <b>çalışma anında</b> seçilir, değiştirilir</li>
            <li>Platform ayrıntıları istemciden <b>gizlenir</b></li>
            <li>Her bilgi <b>tek yerde</b>: kopya kod yok</li>
          </ul>
        </article>
        <article class="card sum-cons">
          <h3>Eksileri</h3>
          <ul>
            <li>Ek bir <b>dolaylama</b> katmanı</li>
            <li>İyi bir <b>ilkel arayüz</b> tasarlamak zor (termal yazıcı çerçeve çizemez)</li>
            <li>Tek boyut varsa <b>gereksiz</b> karmaşıklık</li>
          </ul>
        </article>
        <article class="card">
          <h3>İlişkili kalıplar</h3>
          <ul>
            <li><b>Adapter:</b> benzer yapı; ama var olanı <i>sonradan</i> uydurur.</li>
            <li><b>Abstract Factory:</b> belirli bir köprüyü kurup yapılandırabilir.</li>
            <li><b>Strategy:</b> benzer yapı; amacı algoritmayı değiştirmek.</li>
            <li><b>Decorator:</b> tek boyuta katman ekler; Bridge iki boyutu ayırır.</li>
          </ul>
        </article>
        <article class="card sum-tip">
          <h3>Sınav ipuçları</h3>
          <pre class="mini-code">class Etiket {                          // Abstraction
    protected Yazici yazici;            // köprü
    void yazdir(Gonderi g) { yazici.yazi(5, 5, g.alici()); … }
}
interface Yazici { void yazi(int x, int y, String m); … }
class ZebraYazici implements Yazici { … }   // ZPL
Etiket e = new KirilacakEtiket(new ZebraYazici());</pre>
          <p class="exam"><b>İki bağımsız boyut + m × n sınıf</b> → Bridge · <b>Abstraction, RefinedAbstraction, Implementor, ConcreteImplementor</b> · soyutlama gerçekleştiriciyi <u>tutar</u>, kalıtmaz</p>
        </article>
        <article class="card sum-files">
          <h3>Java kodları</h3>
          <p>Çalıştırılabilir örnekler proje klasöründe:</p>
          <pre class="mini-code">java/bridge/sorun     → 9 eşleşme sınıfı; ^CI28 bir sınıfta unutuldu
java/bridge/cozum     → Etiket ↔ Yazici köprüsü
java/bridge/akis/...  → Canlı Akış'taki iki eşleşme
java/bridge/tezgah    → başka yazıcı, başka etiket, yaziciDegistir
java/bridge/genislet  → HtmlYazici: yeni gerçekleştirici</pre>
          <p>Derleyip çalıştırmak için <code>java/README.md</code> dosyasına bakın.</p>
        </article>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-print]').addEventListener('click', () => window.print());
    const diag = new DP.ClassDiagram(el.querySelector('.sum-diag'), BR.gofDiagram({}), { roles: BR.roles, roleTags: false, mode: 'generic' });
    diag.svg.classList.add('is-compact');
    return { destroy() {} };
  };

  // ================================================================== kayıt
  DP.register({
    id: 'bridge',
    name: 'Bridge',
    tr: 'Köprü',
    category: 'structural',
    roleOf: BR.roleOf,
    initialState: () => ({
      view: 'stage',
      showCode: true,
      preset: 'kirilacakZebra',
      tz: { label: 'kirilacak', printer: 'pdf' },
      htmlUnlocked: false,
      ext: {},
      quiz: { results: {}, match: false },
    }),
    scenes: [
      { id: 'giris', title: 'Giriş', mount: BR.scenes.intro },
      { id: 'sorun', title: 'Sorun', mount: BR.scenes.problem },
      { id: 'cozum', title: 'Çözüm', mount: BR.scenes.solution },
      { id: 'akis', title: 'Canlı Akış', mount: BR.scenes.flow, star: true },
      { id: 'tezgah', title: 'Eşleştirme Tezgâhı', mount: BR.scenes.counter, star: true },
      { id: 'yapi', title: 'Yapı (UML)', mount: BR.scenes.structure },
      { id: 'genislet', title: 'Genişlet', mount: BR.scenes.extend },
      { id: 'gercek', title: 'Gerçek Dünya', mount: BR.scenes.realworld },
      { id: 'quiz', title: 'Quiz', mount: BR.scenes.quiz },
      { id: 'ozet', title: 'Özet', mount: BR.scenes.summary },
    ],
  });
})();
