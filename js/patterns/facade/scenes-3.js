/*
 * Facade — sahneler (3/3): Yapı, Genişlet, Gerçek Dünya, Quiz, Özet ve kalıp kaydı
 */
(function () {
  'use strict';
  const FC = DP.fc;
  const { h } = DP;
  const kit = DP.kit;
  const ui = FC.ui;
  const md = FC.md;
  const C = FC.code;
  const EX = FC.ext;

  // ================================================================== 6. YAPI
  const ROLE_TEXT = {
    client: 'İşini yaptırmak için yalnızca <b>cepheyle</b> konuşur; alt sistem sınıflarını, sırayı ve kuralları bilmek zorunda değildir.',
    facade: 'Hangi alt sistem sınıfının hangi işten sorumlu olduğunu bilir; istemcinin isteğini <b>doğru sırayla</b> onlara devreder. Alt sisteme <b>sade, üst düzey</b> bir arayüz sunar.',
    subsystem: 'Asıl işi yapar ve cepheden <b>habersizdir</b>: ona başvuru tutmaz. Gerekirse istemci tarafından doğrudan da kullanılabilir.',
  };

  function classInfo(id) {
    const alt = Object.values(FC.ALT).find((a) => a.cls === id);
    if (alt)
      return { role: 'subsystem', file: id + '.java', code: alt.key === 'kurye' ? C.KuryeEski : C[id], mark: { adres: 'public String dogrula(', tarife: 'public int hesapla(', odeme: 'public boolean cek(', takip: 'public String yeni() {', sigorta: 'public void police(', etiket: 'public void bas(', kurye: 'public String', sms: 'public void gonder(' }[alt.key], points: ['Kendi işini yapar: ' + alt.name.toLowerCase() + '.', 'Cepheyi **tanımaz**; ona hiçbir başvurusu yok.', 'Değişirse (yeni imza, yeni kural) yalnızca cephe uyum sağlar.'] };
    switch (id) {
      case 'GonderiCephesi':
        return { role: 'facade', file: 'GonderiCephesi.java', code: C.GonderiCephesi, mark: 'public Optional<String> gonder(Talep t) {', points: ['Yedi alt sistemi alanlarında tutar; Main onu **bir kez** kurar.', '`gonder(t)`: doğru sıra + kural (reddedilirse dur).', 'Sonucu sade bir biçimde döndürür: `Optional<String>`.'] };
      case 'SubeKasasi':
      case 'WebSitesi':
        return { role: 'client', file: id + '.java', code: C[id], mark: 'Optional<String> no = cephe.gonder(t);', points: ['Tek alan: `cephe`.', 'İş akışından ve kurallardan habersiz.', 'Kurucusu yedi değil **bir** parametre alıyor.'] };
      default:
        return null;
    }
  }

  FC.scenes.structure = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split' });
    const tools = h('div', { class: 'panel-tools' });
    const body = h('div', { class: 'scene-body cols-64' });
    const left = kit.panel('Yapı', { cls: 'panel-diagram', extra: tools });
    const right = kit.panel('Rol kartı <span class="panel-sub">· bir sınıfa tıklayın</span>', { cls: 'panel-side' });
    body.append(left.el, right.el);
    el.append(body);
    root.appendChild(el);

    const diagHost = h('div', { class: 'diag-host' });
    const legend = kit.umlLegend({ association: true, fmLabel: 'alt sistemi sade bir arayüzle sunan işlem' });
    left.body.append(diagHost, legend);
    const diagram = new DP.ClassDiagram(diagHost, FC.gofDiagram({ notes: true }), {
      roles: FC.roles,
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
      const r = FC.roles[info.role];
      infoTop.innerHTML = `
        <div class="info-role rc rc-${r.color}"><span class="info-dot"></span><b>${r.en}</b> · ${r.tr}</div>
        <div class="info-name rc rc-${r.color}">${DP.esc(id)}</div>
        <p class="info-desc">${ROLE_TEXT[info.role]}</p>
        <ul class="info-points">${info.points.map((p) => `<li>${md(p)}</li>`).join('')}</ul>`;
      const cv = new DP.CodeView(infoCode, { files: [{ name: info.file, code: info.code }], roleOf: FC.roleOf, special: FC.special, compact: true });
      cv.mark(info.file, info.mark, 'focus');
      DP.flash(infoTop, 'is-pop');
    }

    function showOverview() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">Bir kapı, yedi oda</div>
        <div class="role-list">
          ${['facade', 'subsystem', 'client']
            .map((k) => `<div class="role-row rc rc-${FC.roles[k].color}"><span class="info-dot"></span><div><b>${FC.roles[k].en}</b> · ${FC.roles[k].tr}<div class="role-desc">${ROLE_TEXT[k]}</div></div></div>`)
            .join('')}
        </div>
        <p class="info-desc">GoF’ta yalnızca iki rol var: <b>Facade</b> ve <b>alt sistem sınıfları</b>. İstemci cepheyle konuşur. Üstteki <b>Genel (GoF)</b> düğmesi kitaptaki adları gösterir.</p>`;
    }

    function showDuvar() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">Cephe bir duvar değil</div>
        <p class="info-desc">${md('GoF: Facade, alt sistemi **gizlemek zorunda değildir**; isteyen istemci alt sistem sınıflarını yine doğrudan kullanabilir. Örneğin depodaki görevlinin aracı, yırtılan bir etiketi yeniden basmak için yalnızca [[EtiketServisi]]’ni ister:')}</p>
        <pre class="mini-code fc-mini">EtiketServisi etiket = new EtiketServisi();
etiket.bas("KRG-1001", "Battalgazi/Malatya");   // cepheyi atlamak serbest</pre>
        <p class="info-desc">${md('Cephe **kolaylık** sağlar, yasak koymaz. Alt sistemi gerçekten saklamak istiyorsanız (paket-özel sınıflar, Java modülleri) bu ayrı bir karardır.')}</p>`;
      DP.flash(infoTop, 'is-pop');
    }

    function showSayi() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">N × M yerine N + M</div>
        <table class="cmp fc-cmp">
          <thead><tr><th>İstemci</th><th>Kalıpsız (N × 7)</th><th>Cephe (N + 7)</th></tr></thead>
          <tbody>
            <tr><td>1 (kasa)</td><td>7</td><td>1 + 7</td></tr>
            <tr><td>2 (+ web)</td><td class="bad">14</td><td class="ok">2 + 7</td></tr>
            <tr><td>3 (+ mobil)</td><td class="bad">21</td><td class="ok">3 + 7</td></tr>
            <tr><td>4 (+ API)</td><td class="bad">28</td><td class="ok">4 + 7</td></tr>
          </tbody>
        </table>
        <p class="info-desc">${md('Bağımlılık = bir sınıfın başka bir sınıfı tanıması. Kalıpsız tasarımda her yeni istemci yedi bağımlılık daha ekler; cephede yalnızca bir. Tek istemcide cephe kazandırmaz; kazanç istemci sayısıyla büyür.')}</p>`;
      DP.flash(infoTop, 'is-pop');
    }

    const STEPS = [
      { t: 'Genel bakış', x: 'İki istemci, bir cephe, yedi alt sistem sınıfı. İstemciler yalnızca [[GonderiCephesi]]’ni tanır; cephe alt sistemleri **doğru sırayla** çağırır. Alt sistem sınıfları cepheden habersizdir.', info: null },
      { t: 'Facade — `GonderiCephesi`', x: '[[GonderiCephesi]] alt sistemin **sade, üst düzey** arayüzü: tek işlem, `gonder(t)`. Nottaki gibi yedi çağrıyı ve kart limiti kuralını içinde saklar.', info: 'GonderiCephesi', focus: { classes: ['GonderiCephesi'], members: [['GonderiCephesi', 'gonder']] } },
      { t: 'Alt sistem sınıfları', x: 'Yedi sınıf asıl işi yapıyor ve **cepheyi tanımıyor**: oklar hep cepheden alt sisteme doğru. Bir alt sistem değişirse (yeni kural, yeni imza) uyum sağlayan tek yer cephedir.', info: 'OdemeServisi', focus: { classes: Object.values(FC.ALT).filter((a) => a.key !== 'sigorta').map((a) => a.cls), edges: FC.altOrder({}).map((k) => 'a-' + k) } },
      { t: 'Client — istemciler', x: '[[SubeKasasi]] ve [[WebSitesi]] tek bir alan tutuyor: `cephe`. Kurucuları yedi değil **bir** parametre alıyor; iş akışından ve kurallardan habersizler.', info: 'SubeKasasi', focus: { classes: ['SubeKasasi', 'WebSitesi'], edges: ['c-kasa', 'c-web'] } },
      { t: 'Cephe bir duvar değil', x: 'GoF’a göre cephe alt sistemi **saklamak zorunda değildir**: depo görevlisinin aracı etiketi yeniden basmak için [[EtiketServisi]]’ni doğrudan kullanabilir. Cephe kolaylık sağlar, yasak koymaz.', duvar: true, focus: { classes: ['EtiketServisi'] } },
      { t: 'N × M yerine N + M', x: 'Kalıpsız tasarımda her istemci her alt sistemi tanır: N × M bağımlılık. Cepheyle N + M. Dört istemcide 28 yerine 11.', sayi: true, focus: { classes: ['GonderiCephesi'], edges: ['c-kasa', 'c-web'].concat(FC.altOrder({}).map((k) => 'a-' + k)) } },
    ];

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t.replace(/`/g, '')),
      delayOf: () => 6400,
      onChange: (i) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        diagram.select(null);
        if (s.focus) diagram.focus(s.focus);
        else diagram.clearFocus();
        if (s.duvar) showDuvar();
        else if (s.sayi) showSayi();
        else if (s.info) showInfo(s.info);
        else showOverview();
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };

  // ================================================================== 7. GENİŞLET: yeni istemci (Kurumsal API)
  FC.scenes.extend = function (root, ctx) {
    const S = ctx.state;
    S.ext = S.ext || {};
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-50' });
    const left = kit.panel('Görev: <code class="fc-code-t">KurumsalApi</code>', { cls: 'panel-code panel-ex' });
    const right = kit.panel('Gönderi merkezi', { cls: 'panel-side fc-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    // ---- sol (adım 0): alıştırma
    const exBox = h('div', { class: 'ex-box' });
    const task = h('div', {
      class: 'task-card',
      html: md('📩 **Satış ekibi:** “Bir e-ticaret ortağı siparişlerini **toplu** göndermek istiyor; ona bir API açalım.”\nKural: yeni istemci alt sistemlerin **hiçbirini** tanımayacak; kart limiti dahil her şeyi cepheden alacak.'),
    });
    const ex = kit.blankExercise({
      files: [
        { name: 'KurumsalApi.java', code: EX.exercise, badge: 'YENİ' },
        { name: 'Main.java · ek', code: EX.exerciseMain },
      ],
      answers: EX.answers,
      hints: {
        1: 'İstemci yalnızca **cepheyi** tanır: alanın tipi ne olmalı?',
        2: 'Cephenin tek işleminin adı?',
        3: 'Main’de zaten kurulmuş olan cephe nesnesinin adı?',
        4: 'Bir gönderi isteğini taşıyan kayıt (record) hangisi?',
      },
      choices: ['GonderiCephesi', 'OdemeServisi', 'AdresServisi', 'SubeKasasi', 'gonder', 'cek', 'dogrula', 'cephe', 'odeme', 'Talep'],
      roleOf: FC.roleOf,
      special: FC.special,
      state: S.ext,
      doneText: '<b class="ok">✔ Derleme başarılı!</b> Kurumsal API hazır.',
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
    const runBox = h('div', { class: 'fc-runbox', hidden: true });
    const runCode = h('div', { class: 'fc-cv' });
    const runConsole = h('div', { class: 'console fc-console' });
    runBox.append(runCode, runConsole);
    left.body.append(exBox, runBox);
    const runCv = new DP.CodeView(runCode, { roleOf: FC.roleOf, special: FC.special });

    // ---- sağ: gönderi merkezi + etki
    const viewHost = h('div', { class: 'fc-view' });
    const impact = h('div', { class: 'fc-extra' });
    right.body.append(viewHost, impact);
    const stage = new FC.Merkez(viewHost);

    const r = FC.run(EX.prog);
    const once = FC.stateOf(FC.COZUM, { banner: { text: 'Yeni istemci: **tek bir sınıfı** tanıyarak gönderi oluşturabilecek mi?' } });
    const fin = FC.stateOf(EX.prog);
    const apiZ = r.iz.filter((z) => z.ist === 'api');
    const STEPS = [
      {
        t: 'Görev: `KurumsalApi`',
        x: 'Boşluklara tıklayıp doğru parçaları seçin. İpucu: yeni istemci de kasa ve web sitesi gibi yalnızca `GonderiCephesi`’ni tanıyacak.',
        st: once,
      },
      {
        t: 'Derlendi: toplu sipariş',
        x: `[[KurumsalApi]] iki talep gönderdi: Ayşe’nin gönderisi **${apiZ[0].no}** oldu, Can’ınki kart limitine takıldı ve **oluşturulmadı**. Kuralı API yazmadı; cephede hazırdı.`,
        st: Object.assign({}, fin, { banner: { text: `✓ 2 talep → **${apiZ.filter((z) => z.sonuc === 'ok').length} gönderi**, 1 reddedildi (hayalet yok)`, tone: 'ok' } }),
      },
      {
        t: 'Sıfır alt sistem bilgisi',
        x: '[[KurumsalApi]] yedi alt sistemin hiçbirini tanımıyor: tek bağımlılık, tek alan, tek çağrı. [[GonderiCephesi]], alt sistemler ve öbür istemciler **değişmedi**.',
        st: Object.assign({}, fin, { banner: { text: 'Yeni istemci: **1 bağımlılık**, 0 değişen sınıf.', tone: 'ok' } }),
      },
      {
        t: 'Kalıpsız olsaydı?',
        x: 'Kalıpsız tasarımda API yedi alanı, yedi parametreli kurucuyu ve iş akışını **dördüncü kez** kopyalamak zorundaydı; kart limiti kuralını unutsa hayalet gönderi. **Kurumsal API** artık Cephe Tezgâhı’nda da açık.',
        st: Object.assign({}, fin, { banner: { text: 'Yeni istemci: kalıpsız **7 bağımlılık + kopya akış**, cepheyle **1**.', tone: 'ok' } }),
      },
    ];

    function renderLeft(i) {
      exBox.hidden = i >= 1;
      runBox.hidden = i < 1;
      left.head.querySelector('.panel-title').innerHTML = i >= 1 ? 'Yeni istemci: <code class="fc-code-t ver">KurumsalApi</code>' : 'Görev: <code class="fc-code-t">KurumsalApi</code>';
      if (i < 1) return;
      // önce konsol (yüksekliği değişir), sonra koddaki işaret
      FC.renderConsole(runConsole, FC.cmd(true), r.lines.map((l) => FC.consoleLine(l, { yokNote: l.ist === 'api' ? 'kural cephede' : null })));
      runCv.setFiles(
        [
          { name: 'KurumsalApi.java', code: C.KurumsalApi, badge: 'YENİ' },
          { name: 'Main.java', code: EX.Main },
        ],
        { active: i === 1 ? 'Main.java' : 'KurumsalApi.java', keepActive: false }
      );
      if (i === 1) runCv.mark('Main.java', 'KurumsalApi api = new KurumsalApi(cephe);', 'focus');
      else runCv.mark('KurumsalApi.java', 'Optional<String> no = cephe.gonder(t);', 'focus');
    }

    function renderImpact(i, animate) {
      if (i === 0) {
        impact.innerHTML = `<div class="impact-title">İpucu</div><p>${md('[[WebSitesi]]’ne bakın: tek alan (`cephe`), tek çağrı (`cephe.gonder(t)`). API de böyle yazılır; tek farkı talepleri bir döngüde göndermesi.')}</p>`;
      } else if (i === 1) {
        impact.innerHTML = `
          <div class="impact-title ok">✔ Derleme başarılı · yeni istemci</div>
          <ul class="filelist"><li><span class="cv-dot rc rc-${FC.roleOf('KurumsalApi')}"></span>KurumsalApi.java <span class="cv-badge is-new">YENİ</span></li></ul>`;
      } else if (i === 2) {
        impact.innerHTML = `
          <div class="metrics">
            <div class="metric is-good"><div class="m-val">1</div><div class="m-label">bağımlılık</div></div>
            <div class="metric is-good"><div class="m-val">0</div><div class="m-label">değişen sınıf</div></div>
            <div class="metric"><div class="m-val">0</div><div class="m-label">kopya iş akışı</div></div>
          </div>`;
      } else {
        impact.innerHTML = `
          <table class="cmp fc-cmp">
            <thead><tr><th>Yeni istemci</th><th>Kalıpsız</th><th>Cephe</th></tr></thead>
            <tbody>
              <tr><td>Tanıdığı sınıf</td><td class="bad">7 alt sistem</td><td class="ok">1 cephe</td></tr>
              <tr><td>İş akışı</td><td class="bad">4. kopya</td><td class="ok">yok</td></tr>
              <tr><td>Kart limiti kuralı</td><td class="bad">yeniden yazılır</td><td class="ok">hazır</td></tr>
            </tbody>
          </table>
          <div class="fc-go"><button class="btn btn-primary btn-sm" type="button" data-go>🏛️ Cephe Tezgâhı’nda dene →</button></div>`;
        impact.querySelector('[data-go]').addEventListener('click', () => ctx.goScene('tezgah'));
      }
      if (animate) DP.flash(impact, 'is-pop');
    }

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t.replace(/`/g, '')),
      delayOf: () => 6400,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        if (i >= 1) {
          ex.autoFill(info.animate && i === 1);
          S.apiUnlocked = true;
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
  const RW = FC.rw;
  const TABS = [
    {
      tab: 'Files',
      title: '`java.nio.file.Files` — dosya alt sisteminin cephesi',
      intro: 'Bir dosyayı okumak için akış (`FileInputStream`), karakter çözücü (`InputStreamReader` + karakter kümesi), tampon (`BufferedReader`) ve kapatma işi gerekir. `Files.readAllLines(yol)` bunların hepsini **tek çağrının** arkasına saklar. Alt sistem sınıfları kaybolmadı: isteyen yine doğrudan kullanabilir.',
      map: [
        ['facade', 'GonderiCephesi', '`Files` (`readAllLines`, `write`, `copy`…)'],
        ['subsystem', 'AdresServisi', 'akışlar, kod çözücüler, tamponlar, kanallar'],
        ['client', 'SubeKasasi', 'dosya okuyan kod'],
      ],
      note: 'Sağdaki düğmeler aynı dosyayı cepheyle ve alt sistemle okur; çıktı aynı. Çıktılar Java 21 ile alındı. Satır sonu işletim sistemine göre değiştiği için karakter saymıyoruz.',
      roles: { Files: 'facade', BufferedReader: 'subsystem', InputStreamReader: 'subsystem', FileInputStream: 'subsystem' },
      file: 'DosyaCephesi.java',
      code: RW.dosya,
      options: RW.dosyaOpts,
      cmd: '$ java DosyaCephesi',
    },
    {
      tab: 'JavaCompiler',
      title: '`javax.tools.JavaCompiler` — derleyicinin cephesi',
      intro: 'javac yüzlerce sınıftan oluşur: sözcük çözümleyici, ayrıştırıcı, tür denetimi, bayt kodu üretimi… `ToolProvider.getSystemJavaCompiler().run(…)` hepsini **tek bir çağrıyla** çalıştırır. GoF kitabındaki Facade örneği de bir derleyicidir.',
      map: [
        ['facade', 'GonderiCephesi', '`JavaCompiler.run(…)`'],
        ['subsystem', 'AdresServisi', 'ayrıştırıcı, tür denetleyici, kod üretici…'],
        ['client', 'SubeKasasi', 'derleme isteyen program'],
      ],
      note: 'Program geçici bir klasöre `Merhaba.java` yazıp derliyor; hata mesajları ayrı bir akışa yönlendirildi. JDK gerekir (yalnızca JRE ile `getSystemJavaCompiler()` null döner). Çıktılar Java 21 ile alındı.',
      roles: { JavaCompiler: 'facade', ToolProvider: 'facade' },
      file: 'DerleyiciCephesi.java',
      code: RW.derleyici,
      options: RW.derleyiciOpts,
      cmd: '$ java DerleyiciCephesi',
    },
    {
      tab: 'SLF4J',
      title: 'SLF4J — adı bile “Facade”',
      intro: '**S**imple **L**ogging **F**acade for **J**ava: kod yalnızca SLF4J’nin sade arayüzünü (`Logger`) kullanır; arkada Logback, Log4j ya da `java.util.logging` çalışır. Günlük kütüphanesini değiştirmek uygulama kodunu değiştirmez.',
      map: [
        ['facade', 'GonderiCephesi', '`Logger` / `LoggerFactory`'],
        ['subsystem', 'AdresServisi', 'Logback, Log4j, `java.util.logging`'],
        ['client', 'SubeKasasi', 'günlük yazan uygulama kodu'],
      ],
      note: 'SLF4J JDK’nın parçası değil; ayrı bir kütüphane olduğu için bu parça burada çalıştırılmadı. Hangi günlük sisteminin kullanılacağına sınıf yolundaki bağlayıcı karar verir.',
      roles: { Logger: 'facade', LoggerFactory: 'facade' },
      file: 'GonderiServisi.java',
      code: RW.slf4j,
      mark: 'log.info("Gönderi oluşturuldu: {}", no);',
    },
    {
      tab: 'Karıştırmayın!',
      title: 'Facade, Adapter, Mediator, Proxy',
      intro: 'Dördü de bir nesneyi başka nesnelerin önüne koyar. Fark: **arayüzü** ne yaptıkları ve arkadakilerin onlardan **haberi olup olmadığı**.',
      extraHtml: `<table class="cmp cmp-3">
        <thead lang="en"><tr><th></th><th>Facade</th><th>Adapter</th><th>Mediator</th><th>Proxy</th></tr></thead>
        <tbody>
          <tr><td>Arayüz</td><td>Yeni, <b>sade</b></td><td>Var olan, beklenene uydurulur</td><td>—</td><td>Aynı</td></tr>
          <tr><td>Arkada</td><td>Birçok sınıf (alt sistem)</td><td>Tek sınıf</td><td>Birçok meslektaş</td><td>Tek nesne</td></tr>
          <tr><td>Arkadakiler onu bilir mi?</td><td>Hayır</td><td>Hayır</td><td><b>Evet</b></td><td>Hayır</td></tr>
          <tr><td>Amaç</td><td>Kullanımı <b>kolaylaştırmak</b></td><td>Uyumsuzluğu gidermek</td><td>İletişimi merkezîleştirmek</td><td>Erişimi denetlemek</td></tr>
        </tbody></table>`,
      note: 'Mediator’da meslektaşlar aracıyı tanır ve birbirleriyle onun üzerinden konuşur; Facade’da alt sistem cepheden habersizdir ve iletişim tek yönlüdür (cepheden alt sisteme).',
      roles: { GonderiCephesi: 'facade' },
      special: FC.special,
      file: 'Karsilastirma.java',
      code: () => `// Facade: birçok sınıfın önüne yeni, sade bir arayüz
Optional<String> no = cephe.gonder(talep);

// Adapter: var olan bir arayüzü beklenen arayüze uydurur
KargoFirmasi firma = new GlobalShipAdaptoru(new GlobalShipApi());

// Mediator: meslektaşlar birbirleriyle aracı üzerinden konuşur (aracıyı tanırlar)
kontrolKulesi.inisIzniIste(ucak);

// Proxy: aynı arayüz; araya girip erişimi denetler
TakipServisi servis = new TakipVekili(ali);`,
      mark: 'Optional<String> no = cephe.gonder(talep);',
    },
  ];

  FC.scenes.realworld = (root, ctx) =>
    kit.realWorldScene(root, ctx, {
      tabs: TABS,
      roles: FC.roles,
      roleOf: FC.roleOf,
      fmLabel: 'cephe',
      footText: (i) =>
        i === 3
          ? 'Yapı benziyorsa **amaca** bakın: Facade sadeleştirir, Adapter uydurur, Mediator konuşturur, Proxy denetler.'
          : i === 2
          ? 'Uygulama kodu tek bir sade arayüzle konuşur; arkadaki alt sistem değişebilir.'
          : 'JDK, karmaşık alt sistemlerini tek çağrılık kapıların arkasına saklar. Sağdaki düğmelerle deneyin.',
    });

  // ================================================================== 9. QUIZ
  const Q = [
    {
      type: 'mcq',
      q: 'Facade kalıbının **temel amacı** (GoF) nedir?',
      options: ['Bir alt sistemdeki arayüzler kümesine birleşik, üst düzey bir arayüz sağlamak', 'Uyumsuz bir arayüzü istemcinin beklediği arayüze dönüştürmek', 'Bir nesneye erişimi denetlemek için onun yerine geçen bir vekil sağlamak', 'Nesnelerin birbirleriyle bir aracı üzerinden konuşmasını sağlamak'],
      answer: 0,
      explain: 'GoF: “Bir alt sistemdeki arayüzler kümesine birleşik bir arayüz sağla.” Diğerleri Adapter, Proxy ve Mediator’ın amaçlarıdır.',
    },
    {
      type: 'line',
      q: 'Bu sınıfta ödeme reddedilince **akışın durdurulduğu** satıra tıklayın.',
      codeName: 'GonderiCephesi.java',
      code: FC.plain(C.GonderiCephesi),
      answer: 'return Optional.empty();',
      explain: 'Kural tek yerde: ödeme reddedilirse cephe boş bir Optional döndürür; takip numarası, etiket ve kurye hiç çağrılmaz.',
    },
    {
      type: 'mcq',
      q: 'Alt sistem sınıfları (`AdresServisi`, `OdemeServisi`…) cephe hakkında ne bilir?',
      options: ['Cepheye bir başvuru tutar ve sonuçları ona bildirir', 'Hiçbir şey: cepheden habersizdir', 'Yalnızca cephe tarafından yaratılabilirler', 'Cephenin alt sınıfıdırlar'],
      answer: 1,
      explain: 'Facade’da iletişim tek yönlüdür: cephe alt sistemi tanır, alt sistem cepheyi tanımaz. Mediator’dan farkı budur.',
    },
    {
      type: 'mcq',
      q: '3 istemci ve 7 alt sistem var. Kalıpsız tasarımda ve cepheyle **istemcilerin** kaç bağımlılığı olur?',
      options: ['21 ve 3', '10 ve 10', '7 ve 1', '21 ve 21'],
      answer: 0,
      explain: 'Kalıpsız: her istemci 7 alt sistemi tanır (3 × 7 = 21). Cepheyle her istemci yalnızca cepheyi tanır (3); cephenin kendisi 7 alt sistemi tanır.',
    },
    {
      type: 'mcq',
      q: 'Facade, istemcilerin alt sistem sınıflarını **doğrudan** kullanmasını engeller mi?',
      options: ['Evet: alt sistem sınıfları cephenin içinde gizlidir, dışarıdan görünmez', 'Hayır: cephe kolaylık sağlar; isteyen alt sistemi yine doğrudan kullanabilir', 'Yalnızca Java’da engeller: cephe varken alt sistem paketi kapanır', 'Evet: derleyici, cephe dışından alt sistem çağrısına izin vermez'],
      answer: 1,
      explain: 'GoF: Facade, uygulamaların gerektiğinde alt sistem sınıflarını kullanmasını engellemez. Depo görevlisinin aracı EtiketServisi’ni doğrudan çağırabilir.',
    },
    {
      type: 'line',
      q: 'Bu istemcide gönderinin **cepheye verildiği** satıra tıklayın.',
      codeName: 'WebSitesi.java',
      code: FC.plain(C.WebSitesi),
      answer: 'Optional<String> no = cephe.gonder(t);',
      explain: 'İstemcinin bütün iş akışı tek satır: alt sistemleri ve kuralları cephe biliyor.',
    },
    {
      type: 'mcq',
      q: 'Facade ile Adapter arasındaki en önemli fark nedir?',
      options: ['Facade birçok sınıfın önüne yeni, sade bir arayüz koyar; Adapter var olan arayüzü beklenene uydurur', 'Adapter birçok sınıfı tek arayüzde birleştirir; Facade ise tek bir sınıfı başka arayüze uydurur', 'Facade yalnızca kalıtımla, Adapter yalnızca bileşimle yazılır; amaçları aynıdır', 'Aralarında fark yoktur; ikisi de mevcut bir arayüzü beklenen arayüze uydurur'],
      answer: 0,
      explain: 'İkisi de sarmalar; ama Adapter istemcinin beklediği arayüze uyar, Facade ise kullanımı kolaylaştıran yeni bir arayüz tasarlar.',
    },
    {
      type: 'mcq',
      q: 'Java’da hangisi bir **cephe** örneğidir?',
      options: ['`Integer.valueOf(127)`', '`Files.readAllLines(yol)`', '`Collections.unmodifiableList(liste)`', '`Arrays.asList(dizi)`'],
      answer: 1,
      explain: '`Files.readAllLines` akış, kod çözücü ve tampon sınıflarını tek çağrının arkasına saklar. Diğerleri Flyweight, Decorator ve Adapter örnekleridir.',
    },
  ];

  FC.scenes.quiz = (root, ctx) =>
    kit.quizScene(root, ctx, {
      questions: Q,
      roleOf: FC.roleOf,
      special: FC.special,
      patternName: 'Facade',
      match: {
        items: ['GonderiCephesi', 'AdresServisi', 'OdemeServisi', 'EtiketServisi', 'SubeKasasi', 'WebSitesi'].map((id) => ({ id, label: id })),
        buckets: ['facade', 'subsystem', 'client'].map((k) => ({ id: k, title: FC.roles[k].en, sub: FC.roles[k].tr, color: FC.roles[k].color })),
        answer: FC.classRoles,
        hint: 'Altı sınıfı üç role yerleştirin. Takıldığınızda **Cevapları göster** düğmesi var.',
      },
    });

  // ================================================================== 10. ÖZET
  FC.scenes.summary = function (root, ctx) {
    const at = DP.catalog.findIndex((p) => p.id === 'facade');
    const next = DP.catalog.slice(at + 1).find((p) => p.ready && DP.patterns[p.id]);
    const el = h('div', { class: 'scene scene-summary' });
    el.innerHTML = `
      <div class="sum-head">
        <div>
          <div class="chips"><span class="chip chip-cat is-struct">Yapısal · Structural</span><span class="chip">Anahtar kelime: sadeleştirme</span></div>
          <h1>Facade — Özet</h1>
        </div>
        <div class="sum-actions no-print">
          <button class="btn btn-ghost" type="button" data-print>🖨 Yazdır / PDF</button>
          <a class="btn btn-ghost" href="#/decorator/ozet">← Decorator özeti</a>
          <a class="btn btn-ghost" href="#/">Tüm kalıplar</a>
          ${next ? `<a class="btn btn-primary" href="#/${next.id}">Sıradaki kalıp: ${DP.esc(next.name)} →</a>` : ''}
        </div>
      </div>
      <div class="sum-grid">
        <article class="card sum-intent">
          <h3>Amaç</h3>
          <p>Bir alt sistemdeki arayüzler kümesine <b>birleşik bir arayüz</b> sağla; alt sistemi kullanmayı kolaylaştıran <b>üst düzey</b> bir arayüz tanımla.</p>
          <div class="sum-formula"><code>cephe.gonder(t)</code> → <code>adres → tarife → ödeme → takip → etiket → kurye → sms</code> <span>(doğru sıra ve kurallar tek yerde)</span></div>
        </article>
        <article class="card sum-uml"><h3>Yapı (GoF)</h3><div class="sum-diag"></div></article>
        <article class="card">
          <h3>İstemcide iş akışı ↔ Cephe</h3>
          <table class="cmp sg-sum-cmp">
            <thead lang="en"><tr><th></th><th>Kalıpsız</th><th>Facade</th></tr></thead>
            <tbody>
              <tr><td>İstemcinin tanıdığı</td><td class="bad">7 alt sistem</td><td class="ok">1 cephe</td></tr>
              <tr><td>Bağımlılık</td><td class="bad">N × M</td><td class="ok">N + M</td></tr>
              <tr><td>Kural değişirse</td><td class="bad">her istemci</td><td class="ok">yalnızca cephe</td></tr>
              <tr><td>Unutulan kural</td><td class="bad">hayalet gönderi</td><td class="ok">olamaz</td></tr>
            </tbody>
          </table>
        </article>
        <article class="card">
          <h3>Katılımcılar</h3>
          <ul class="sum-roles">
            <li>${ui.roleChip('facade')}<span>sade arayüz, doğru sıra</span></li>
            <li>${ui.roleChip('subsystem')}<span>asıl iş; cepheden habersiz</span></li>
            <li>${ui.roleChip('client')}<span>yalnızca cepheyi tanır</span></li>
          </ul>
          <p class="fc-sum-note">Cephe bir <b>duvar</b> değil: alt sisteme doğrudan erişim serbest.</p>
        </article>
        <article class="card sum-pros">
          <h3>Artıları</h3>
          <ul>
            <li>İstemciler <b>basitleşir</b>: tek sınıf, tek çağrı</li>
            <li>Alt sistemle istemciler arasında <b>gevşek bağ</b></li>
            <li>İş akışı ve kurallar <b>tek yerde</b></li>
            <li>Alt sistem değişince yalnızca cephe uyum sağlar</li>
          </ul>
        </article>
        <article class="card sum-cons">
          <h3>Eksileri</h3>
          <ul>
            <li>Cephe her şeyi üstlenirse <b>tanrı sınıfa</b> dönüşür</li>
            <li>Alt sistemin ince ayarlarını gizleyebilir</li>
            <li>Tek istemcide kazandırdığı az</li>
          </ul>
        </article>
        <article class="card">
          <h3>İlişkili kalıplar</h3>
          <ul>
            <li><b>Abstract Factory:</b> cephenin alt sistem nesnelerini yaratması için kullanılabilir.</li>
            <li><b>Mediator:</b> benzer; ama meslektaşlar aracıyı tanır.</li>
            <li><b>Singleton:</b> çoğu zaman tek bir cephe nesnesi yeterlidir.</li>
            <li><b>Adapter:</b> var olan arayüzü uydurur; cephe yenisini tanımlar.</li>
          </ul>
        </article>
        <article class="card sum-tip">
          <h3>Sınav ipuçları</h3>
          <pre class="mini-code">class GonderiCephesi {                          // Facade
    private final AdresServisi adres;          // alt sistemler
    private final OdemeServisi odeme;  …
    public Optional&lt;String&gt; gonder(Talep t) {  // sade, üst düzey işlem
        adres.dogrula(…);
        if (!odeme.cek(…)) return Optional.empty();
        …                                      // doğru sıra, kurallar
    }
}
Optional&lt;String&gt; no = cephe.gonder(talep);    // Client</pre>
          <p class="exam"><b>Karmaşık alt sistem + sade kullanım</b> → Facade · <b>Facade, Subsystem classes</b> · alt sistem cepheyi <u>tanımaz</u> · doğrudan erişim <u>yasak değil</u></p>
        </article>
        <article class="card sum-files">
          <h3>Java kodları</h3>
          <p>Çalıştırılabilir örnekler proje klasöründe:</p>
          <pre class="mini-code">java/facade/sorun      → iş akışı istemcilerde; web’de kart limiti unutuldu
java/facade/cozum      → GonderiCephesi: istemciler tek çağrı yapar
java/facade/akis/...   → Canlı Akış: ali · can
java/facade/tezgah/... → üç değişiklik: kalipsiz · cepheli
java/facade/genislet   → KurumsalApi: yeni istemci, 1 bağımlılık</pre>
          <p>Derleyip çalıştırmak için <code>java/README.md</code> dosyasına bakın.</p>
        </article>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-print]').addEventListener('click', () => window.print());
    const diag = new DP.ClassDiagram(el.querySelector('.sum-diag'), FC.gofDiagram({}), { roles: FC.roles, roleTags: false, mode: 'generic' });
    diag.svg.classList.add('is-compact');
    return { destroy() {} };
  };

  // ================================================================== kayıt
  DP.register({
    id: 'facade',
    name: 'Facade',
    tr: 'Cephe',
    category: 'structural',
    roleOf: FC.roleOf,
    initialState: () => ({
      view: 'stage',
      showCode: true,
      preset: 'ali',
      tz: { design: 'cephe', n: 3, limit: true, sigorta: false, kurye: false },
      apiUnlocked: false,
      ext: {},
      quiz: { results: {}, match: false },
    }),
    scenes: [
      { id: 'giris', title: 'Giriş', mount: FC.scenes.intro },
      { id: 'sorun', title: 'Sorun', mount: FC.scenes.problem },
      { id: 'cozum', title: 'Çözüm', mount: FC.scenes.solution },
      { id: 'akis', title: 'Canlı Akış', mount: FC.scenes.flow, star: true },
      { id: 'tezgah', title: 'Cephe Tezgâhı', mount: FC.scenes.counter, star: true },
      { id: 'yapi', title: 'Yapı (UML)', mount: FC.scenes.structure },
      { id: 'genislet', title: 'Genişlet', mount: FC.scenes.extend },
      { id: 'gercek', title: 'Gerçek Dünya', mount: FC.scenes.realworld },
      { id: 'quiz', title: 'Quiz', mount: FC.scenes.quiz },
      { id: 'ozet', title: 'Özet', mount: FC.scenes.summary },
    ],
  });
})();
