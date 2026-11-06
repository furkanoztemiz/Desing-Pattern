/*
 * Chain of Responsibility — sahneler (3/3): Yapı, Genişlet, Gerçek Dünya, Quiz, Özet ve kalıp kaydı
 */
(function () {
  'use strict';
  const CR = DP.cr;
  const { h } = DP;
  const kit = DP.kit;
  const ui = CR.ui;
  const md = CR.md;
  const C = CR.code;
  const EX = CR.ext;
  /** Satır sonu yorumlarını atar (quiz'de cevabı ele vermesin) */
  const yorumsuz = (s) => s.replace(/ +\/\/ [^\n]*$/gm, '');

  // ================================================================== 6. YAPI
  const ROLE_TEXT = {
    client: 'İsteği zincirin <b>başına</b> verir; kimin işleyeceğini bilmez. Yalnızca soyut halka türünü (<code>TeslimatAdimi</code>) tanır.',
    handler: 'İsteği işleme arayüzünü tanımlar ve zincirdeki <b>ardılı</b> (<code>sonraki</code>) tutar. Şablon: işleyebiliyorsan işle, işleyemiyorsan <b>sonrakine ilet</b>.',
    concreteHandler: 'Sorumlu olduğu istekleri işler; işleyemediğini ardılına bırakır. Ardılın <b>kim</b> olduğunu bilmez, kendi kuralını eksiksiz bilir.',
  };

  function classInfo(id) {
    const k = Object.keys(CR.HALKA).find((x) => CR.HALKA[x].cls === id);
    if (k) {
      const H = CR.HALKA[k];
      return { role: 'concreteHandler', file: id + '.java', code: C[id], mark: `return ${H.kural};`, points: [`Kendi kuralı: **${H.tr}**.`, 'Sonraki halkanın kim olduğunu **bilmez**.', k === 'iade' ? 'Her zaman `true`: zincirin sonunda kimse düşmesin.' : 'Kural eksiksiz: üstteki halkalara güvenmez.'] };
    }
    switch (id) {
      case 'TeslimatAdimi':
        return { role: 'handler', file: 'TeslimatAdimi.java', code: C.TeslimatAdimi, mark: ['public final void teslimEt(Gonderi g) {', 'protected abstract boolean dene(Gonderi g);'], points: ['`sonraki`: zincirdeki bir sonraki halka (ardıl, *successor*).', '`teslimEt(g)`: şablon — `dene(g)`, tutmazsa sonrakine ilet.', '`sonra(s)`: zinciri kurar, s’yi döndürür (akıcı kurulum).'] };
      case 'Kurye':
        return { role: 'client', file: 'Kurye.java', code: C.Kurye, mark: 'zincir.teslimEt(g);', points: ['Tek alan: zincirin başı.', 'Hangi halkanın teslim alacağını **bilmez**.', 'Zinciri Main kurar; kurye her sırayla değişmeden çalışır.'] };
      default:
        return null;
    }
  }

  CR.scenes.structure = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split' });
    const tools = h('div', { class: 'panel-tools' });
    const body = h('div', { class: 'scene-body cols-64' });
    const left = kit.panel('Yapı', { cls: 'panel-diagram', extra: tools });
    const right = kit.panel('Rol kartı <span class="panel-sub">· bir sınıfa tıklayın</span>', { cls: 'panel-side' });
    body.append(left.el, right.el);
    el.append(body);
    root.appendChild(el);

    const diagHost = h('div', { class: 'diag-host' });
    const legend = kit.umlLegend({ association: true, fmLabel: 'şablon: dene, olmazsa sonrakine ilet' });
    left.body.append(diagHost, legend);
    const diagram = new DP.ClassDiagram(diagHost, CR.gofDiagram({ notes: true }), {
      roles: CR.roles,
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
      const r = CR.roles[info.role];
      infoTop.innerHTML = `
        <div class="info-role rc rc-${r.color}"><span class="info-dot"></span><b>${r.en}</b> · ${r.tr}</div>
        <div class="info-name rc rc-${r.color}">${DP.esc(id)}</div>
        <p class="info-desc">${ROLE_TEXT[info.role]}</p>
        <ul class="info-points">${info.points.map((p) => `<li>${md(p)}</li>`).join('')}</ul>`;
      const cv = new DP.CodeView(infoCode, { files: [{ name: info.file, code: info.code }], roleOf: CR.roleOf, special: CR.special, compact: true });
      cv.mark(info.file, info.mark, 'focus');
      DP.flash(infoTop, 'is-pop');
    }

    function showOverview() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">Bir istek, birçok aday</div>
        <div class="role-list">
          ${['handler', 'concreteHandler', 'client']
            .map((k) => `<div class="role-row rc rc-${CR.roles[k].color}"><span class="info-dot"></span><div><b>${CR.roles[k].en}</b> · ${CR.roles[k].tr}<div class="role-desc">${ROLE_TEXT[k]}</div></div></div>`)
            .join('')}
        </div>
        <p class="info-desc">GoF’ta üç rol var: <b>Handler</b>, <b>ConcreteHandler</b> ve isteği başlatan <b>Client</b>. Üstteki <b>Genel (GoF)</b> düğmesi kitaptaki adları gösterir: <code>successor</code>, <code>handleRequest()</code>.</p>`;
    }

    function showKurulum() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">Zinciri kim kurar?</div>
        <p class="info-desc">${md('Ne kurye ne de halkalar: zincir **kurulumda** (Main) kurulur. Aynı sınıflar, iki bölge, iki sıra:')}</p>
        <pre class="mini-code cr-mini">TeslimatAdimi malatya = new AliciyaTeslim();
malatya.sonra(new KomsuyaTeslim())
       .sonra(new DolabaTeslim())
       .sonra(new SubeyeTeslim())
       .sonra(new GondericiyeIade());

TeslimatAdimi istanbul = new AliciyaTeslim();
istanbul.sonra(new DolabaTeslim())     // önce dolap
        .sonra(new KomsuyaTeslim()) …</pre>
        <p class="info-desc">${md('GoF: ardıl bağlantısı **çalışırken** kurulur ve değiştirilebilir. Zincir bir yapılandırma dosyasından, bir veritabanından ya da kullanıcı tercihinden de okunabilir; halka sınıfları değişmez.')}</p>`;
      DP.flash(infoTop, 'is-pop');
    }

    function showGaranti() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">Kimse işlemezse?</div>
        <p class="info-desc">${md('İstek zincirin sonuna kadar gidip **işlenmeden** düşebilir: `sonraki == null` → KAYIP. GoF bunu kalıbın bilinen bir sonucu sayar: *alındı garantisi yoktur*.')}</p>
        <table class="cmp cr-cmp">
          <thead><tr><th>Seçenek</th><th>Ne olur?</th></tr></thead>
          <tbody>
            <tr><td>Sona “her zaman” halkası</td><td class="ok">${md('[[GondericiyeIade]]: kimse almadıysa iade')}</td></tr>
            <tr><td>Sonda varsayılan davranış</td><td>${md('`TeslimatAdimi` içinde: “KAYIP” yaz, hata fırlat, günlüğe kaydet')}</td></tr>
            <tr><td>Hiçbiri</td><td class="bad">istek sessizce kaybolur</td></tr>
          </tbody>
        </table>
        <p class="info-desc">${md('Zincir Tezgâhı’nda İade halkasını çıkarıp deneyin: Mert’in 25 kg’lık kolisi KAYIP olur.')}</p>`;
      DP.flash(infoTop, 'is-pop');
    }

    const halkalar = CR.MALATYA.map((k) => CR.HALKA[k].cls);
    const STEPS = [
      { t: 'Genel bakış', x: 'Kurye zincirin **başını** tanır. Her halka [[TeslimatAdimi]]’nden türer ve **sonraki** halkayı tutar: kendine dönen ok, bir halkanın ardılının da bir `TeslimatAdimi` olduğunu söyler. Kimin işleyeceği çalışırken belli olur.', info: null },
      { t: 'Handler — `TeslimatAdimi`', x: '[[TeslimatAdimi]] halkaların ortak iskeleti: `sonraki` alanı ve `teslimEt(g)` şablonu. Nottaki gibi: `dene(g)` tutarsa işle ve **dur**; tutmazsa sonrakine ilet; sonraki yoksa kimse işlemedi.', info: 'TeslimatAdimi', focus: { classes: ['TeslimatAdimi'], edges: ['sonraki'], members: [['TeslimatAdimi', 'teslimEt'], ['TeslimatAdimi', 'sonraki']] } },
      { t: 'ConcreteHandler — halkalar', x: 'Beş somut halka yalnızca `dene(g)`’yi yazıyor: kendi kuralını **eksiksiz** ve tek başına. [[DolabaTeslim]] soğuk zinciri kendisi reddediyor; üstündeki halkalara güvenmiyor. Bu yüzden sıra değişse de kural bozulmuyor.', info: 'DolabaTeslim', focus: { classes: halkalar, edges: CR.MALATYA.map((k) => 'r-' + k) } },
      { t: 'Client — `Kurye`', x: '[[Kurye]] tek bir alan tutuyor: zincirin başı. `teslimEt(g)` içinde tek satır: `zincir.teslimEt(g)`. Beş halkanın hiçbirini, sıralarını ve kurallarını **bilmiyor**.', info: 'Kurye', focus: { classes: ['Kurye'], edges: ['zincir'], members: [['Kurye', 'zincir']] } },
      { t: 'Zinciri kim kurar?', x: 'Zinciri **Main** kuruyor: `sonra(…)` ile halkaları bağlıyor. GoF’a göre ardıl bağlantısı çalışırken kurulur ve değiştirilebilir; Malatya ve İstanbul aynı sınıflarla farklı sıra kullanıyor.', kurulum: true, focus: { classes: ['TeslimatAdimi'], members: [['TeslimatAdimi', 'sonra']] } },
      { t: 'Kimse işlemezse?', x: 'Zincirde teslim **garanti değil**: son halka da reddederse istek düşer. Bizim çözümümüz sona her zaman `true` diyen [[GondericiyeIade]]’yi koymak; [[TeslimatAdimi]] ise ardıl yoksa “KAYIP” yazıyor.', garanti: true, focus: { classes: ['GondericiyeIade', 'TeslimatAdimi'], members: [['TeslimatAdimi', 'teslimEt']] } },
    ];

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t.replace(/`/g, '')),
      delayOf: () => 6600,
      onChange: (i) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        diagram.select(null);
        if (s.focus) diagram.focus(s.focus);
        else diagram.clearFocus();
        if (s.kurulum) showKurulum();
        else if (s.garanti) showGaranti();
        else if (s.info) showInfo(s.info);
        else showOverview();
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };

  // ================================================================== 7. GENİŞLET: yeni halka (anlaşmalı market)
  CR.scenes.extend = function (root, ctx) {
    const S = ctx.state;
    S.ext = S.ext || {};
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-50' });
    const left = kit.panel('Görev: <code class="cr-code-t">MarketeTeslim</code>', { cls: 'panel-code panel-ex' });
    const right = kit.panel('Teslimat hattı', { cls: 'panel-side cr-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    // ---- sol (adım 0): alıştırma
    const exBox = h('div', { class: 'ex-box' });
    const task = h('div', {
      class: 'task-card',
      html: md('📩 **İş birimi:** “Mahalledeki anlaşmalı marketler 15 kg’a kadar koli kabul ediyor. Dolap olmazsa, şubeye götürmeden önce markete bırakalım.”\nKural: soğuk zincir markete de **bırakılmaz**. Kurye ve öbür halkalar değişmeyecek.'),
    });
    const ex = kit.blankExercise({
      files: [
        { name: 'MarketeTeslim.java', code: EX.exercise, badge: 'YENİ' },
        { name: 'Main.java · ek', code: EX.exerciseMain },
      ],
      answers: EX.answers,
      hints: {
        1: 'Her halka aynı soyut sınıftan türer: hangisi?',
        2: 'Halkanın kendi kuralını söyleyen soyut metot?',
        3: 'Soğuk zincir olup olmadığını söyleyen `Gonderi` alanı?',
        4: 'Zincire eklenen yeni halkanın sınıfı?',
      },
      choices: ['TeslimatAdimi', 'Kurye', 'dene', 'teslimEt', 'sogukZincir', 'kapi', 'MarketeTeslim', 'SubeyeTeslim'],
      roleOf: CR.roleOf,
      special: CR.special,
      state: S.ext,
      doneText: '<b class="ok">✔ Derleme başarılı!</b> Market halkası zincirde.',
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
    const runBox = h('div', { class: 'cr-runbox', hidden: true });
    const runCode = h('div', { class: 'cr-cv' });
    const runConsole = h('div', { class: 'console cr-console' });
    runBox.append(runCode, runConsole);
    left.body.append(exBox, runBox);
    const runCv = new DP.CodeView(runCode, { roleOf: CR.roleOf, special: CR.special });

    // ---- sağ: teslimat hattı + etki
    const viewHost = h('div', { class: 'cr-view' });
    const impact = h('div', { class: 'cr-extra' });
    right.body.append(viewHost, impact);
    const stage = new CR.Hat(viewHost);

    const malatya = { zincirler: [CR.COZUM.zincirler[0]] };
    const lines = CR.run(EX.prog);
    const selin = lines.find((l) => l.g.no === 'KRG-1005');
    const once = CR.chainState(malatya, { banner: { text: 'Yeni halka: **tek bir sınıf** ve Main’de **tek satır** yetecek mi?' } });
    const fin = CR.chainState(EX.prog, { fresh: 'market' });
    const STEPS = [
      {
        t: 'Görev: `MarketeTeslim`',
        x: 'Boşluklara tıklayıp doğru parçaları seçin. İpucu: yeni halka da öbürleri gibi [[TeslimatAdimi]]’nden türer ve yalnızca `dene(g)`’yi yazar. Zincire eklemek Main’in işi.',
        st: once,
      },
      {
        t: 'Derlendi: market halkası',
        x: `[[MarketeTeslim]] dolapla şube arasına girdi. Selin’in 9 kg’lık kolisi dolaba sığmadı ve artık **markette**: \`${selin.adim.map((a) => CR.HALKA[a.k].ad + (a.ok ? ' ✓' : ' ✗')).join(' → ')}\`. Zeynep’in ilacını market de **kendi kuralıyla** reddetti.`,
        st: Object.assign({}, fin, { banner: { text: '✓ Selin’in kolisi **markette** · ilaç yine şubede', tone: 'ok' } }),
      },
      {
        t: 'Hiçbir halka değişmedi',
        x: '[[Kurye]], [[TeslimatAdimi]] ve beş eski halka **aynı kaldı**. Değişen tek dosya Main (zincire bir satır); eklenen tek dosya yeni halka. Açık/kapalı ilkesi: genişlemeye açık, değişikliğe kapalı.',
        st: Object.assign({}, fin, { banner: { text: 'Yeni halka: **1 yeni sınıf**, Main’de **1 satır**, 0 değişen halka.', tone: 'ok' } }),
      },
      {
        t: 'Kalıpsız olsaydı?',
        x: 'Kalıpsız tasarımda yeni seçenek, merdivene **doğru yere** yeni bir `else if` demekti; İstanbul kopyasına da ayrıca. Market dalı soğuk zincir dalının üstüne düşerse ilaç markete giderdi. **Market** halkası artık Zincir Tezgâhı’nda da açık.',
        st: Object.assign({}, fin, { banner: { text: 'Yeni seçenek: kalıpsız **her merdivene bir dal**, zincirde **bir sınıf**.', tone: 'ok' } }),
      },
    ];

    function renderLeft(i) {
      exBox.hidden = i >= 1;
      runBox.hidden = i < 1;
      left.head.querySelector('.panel-title').innerHTML = i >= 1 ? 'Yeni halka: <code class="cr-code-t ver">MarketeTeslim</code>' : 'Görev: <code class="cr-code-t">MarketeTeslim</code>';
      if (i < 1) return;
      // önce konsol (yüksekliği değişir), sonra koddaki işaret
      CR.renderConsole(runConsole, CR.cmd(true), lines.map((l) => CR.consoleLine(l, { hl: l.g.no === 'KRG-1005' })));
      runCv.setFiles(
        [
          { name: 'MarketeTeslim.java', code: C.MarketeTeslim, badge: 'YENİ' },
          { name: 'Main.java', code: EX.Main },
        ],
        { active: i === 1 ? 'Main.java' : 'MarketeTeslim.java', keepActive: false }
      );
      if (i === 1) runCv.mark('Main.java', '.sonra(new MarketeTeslim())', 'focus');
      else runCv.mark('MarketeTeslim.java', 'return !g.sogukZincir() && g.kg() <= 15;', 'focus');
    }

    function renderImpact(i, animate) {
      if (i === 0) {
        impact.innerHTML = `<div class="impact-title">İpucu</div><p>${md('[[DolabaTeslim]]’e bakın: kurucuda adı (`super("Dolap")`), `dene(g)` içinde tek satırlık kural. Market de böyle yazılır; tek farkı 15 kg sınırı.')}</p>`;
      } else if (i === 1) {
        impact.innerHTML = `
          <div class="impact-title ok">✔ Derleme başarılı · yeni halka</div>
          <ul class="filelist"><li><span class="cv-dot rc rc-${CR.roleOf('MarketeTeslim')}"></span>MarketeTeslim.java <span class="cv-badge is-new">YENİ</span></li><li><span class="cv-dot rc rc-${CR.roleOf('Main')}"></span>Main.java <span class="cv-badge is-mod">değişti</span></li></ul>`;
      } else if (i === 2) {
        impact.innerHTML = `
          <div class="metrics">
            <div class="metric is-good"><div class="m-val">1</div><div class="m-label">yeni sınıf</div></div>
            <div class="metric is-good"><div class="m-val">1</div><div class="m-label">satır (Main)</div></div>
            <div class="metric is-good"><div class="m-val">0</div><div class="m-label">değişen halka</div></div>
          </div>`;
      } else {
        impact.innerHTML = `
          <table class="cmp cr-cmp">
            <thead><tr><th>Yeni seçenek</th><th>Kalıpsız</th><th>Zincir</th></tr></thead>
            <tbody>
              <tr><td>Değişen kod</td><td class="bad">her kurye merdiveni</td><td class="ok">yalnızca Main</td></tr>
              <tr><td>Soğuk zincir kuralı</td><td class="bad">dalın yerine bağlı</td><td class="ok">halkanın içinde</td></tr>
              <tr><td>Bölgeye göre sıra</td><td class="bad">yeni kopya</td><td class="ok">yeni zincir</td></tr>
            </tbody>
          </table>
          <div class="cr-go"><button class="btn btn-primary btn-sm" type="button" data-go>⛓ Zincir Tezgâhı’nda dene →</button></div>`;
        impact.querySelector('[data-go]').addEventListener('click', () => ctx.goScene('tezgah'));
      }
      if (animate) DP.flash(impact, 'is-pop');
    }

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t.replace(/`/g, '')),
      delayOf: () => 6600,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        if (i >= 1) {
          ex.autoFill(info.animate && i === 1);
          S.marketUnlocked = true;
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
  const RW = CR.rw;
  const TABS = [
    {
      tab: 'java.util.logging',
      title: '`java.util.logging.Logger` — kayıt ebeveyne iletilir',
      intro: 'Her günlükçünün (logger) bir **ebeveyni** var: `kargo.teslimat` → `kargo` → kök. Bir kayıt önce günlükçünün kendi işleyicilerine verilir, sonra `useParentHandlers` açıksa **ebeveynine iletilir**. Buradaki halkalar kaydı işleyip **yine de** iletiyor; zinciri kesmek ya da bir halkanın süzgecini yükseltmek sizin elinizde.',
      map: [
        ['handler', 'TeslimatAdimi', '`Logger` (ebeveyn = ardıl)'],
        ['concreteHandler', 'DolabaTeslim', '`kargo`, `kargo.teslimat` günlükçüleri ve işleyicileri'],
        ['client', 'Kurye', '`teslimat.warning(…)` çağıran kod'],
      ],
      note: 'Sağdaki düğmeler zinciri değiştirir: `setUseParentHandlers(false)` iletmeyi keser, işleyicinin seviyesi süzgeç gibi davranır. Çıktılar Java 21 ile alındı.',
      roles: { Logger: 'handler', Handler: 'concreteHandler' },
      file: 'GunlukZinciri.java',
      code: RW.gunluk,
      options: RW.gunlukOpts,
      mark: 'teslimat.warning("KRG-1003 soğuk zincir!");',
      cmd: '$ java GunlukZinciri',
    },
    {
      tab: 'İstisnalar',
      title: 'İstisnalar — çağrı yığını boyunca yukarı',
      intro: 'Bir istisna fırlatılınca JVM onu **yakalayabilecek** ilk `catch` bloğunu arar: önce o metot, sonra onu çağıran, sonra onu çağıran… Yakalayamayan her çerçeve istisnayı bir üste iletir. Kimse yakalamazsa varsayılan işleyici yığın izini basar ve iş parçacığı biter: zincirin sonundaki “KAYIP”.',
      map: [
        ['handler', 'TeslimatAdimi', 'çağrı yığınındaki her metot çerçevesi'],
        ['concreteHandler', 'SubeyeTeslim', 'uygun türde `catch` bloğu olan metot'],
        ['client', 'Kurye', '`throw` eden kod'],
      ],
      note: '“Kimse yakalamaz” seçeneğinde `finally` yine çalışır, sonra istisna main’den de çıkar ve program biter (“program devam ediyor” yazılmaz). Yığın izi Java 21 ile alındı.',
      roles: {},
      file: 'IstisnaZinciri.java',
      code: RW.istisna,
      options: RW.istisnaOpts,
      mark: 'throw new IllegalStateException("şube kapalı");',
      cmd: '$ java IstisnaZinciri',
    },
    {
      tab: 'Servlet Filter',
      title: '`jakarta.servlet.FilterChain` — dur ya da ilet',
      intro: 'Bir web isteği sunucudaki koda ulaşmadan önce bir **filtre zincirinden** geçer: oturum, yetki, sıkıştırma, günlük… Her filtre isteği ya **durdurur** (yönlendirme, hata) ya da `zincir.doFilter(…)` ile sonrakine iletir. Spring Security’nin güvenlik filtreleri de böyle bir zincirdir.',
      map: [
        ['handler', 'TeslimatAdimi', '`Filter` + `FilterChain`'],
        ['concreteHandler', 'KomsuyaTeslim', '`OturumFiltresi`, yetki filtresi…'],
        ['client', 'Kurye', 'sunucu (isteği zincire verir)'],
      ],
      note: 'Jakarta Servlet JDK’nın parçası değil; bu parça burada çalıştırılmadı. Filtre zincirinde çoğu filtre işini yapıp **yine de iletir**; GoF’taki saf biçimde ise yalnızca biri işler ve zincir durur.',
      roles: { Filter: 'handler', FilterChain: 'handler', OturumFiltresi: 'concreteHandler' },
      file: 'OturumFiltresi.java',
      code: RW.filtre,
      mark: 'zincir.doFilter(istek, yanit);',
    },
    {
      tab: 'Karıştırmayın!',
      title: 'Chain of Responsibility, Decorator, Composite, Observer',
      intro: 'Dördü de isteği başka nesnelere **iletir**. Fark: istek **kaç alıcıya** ulaşıyor ve aradaki biri onu **durdurabiliyor** mu?',
      extraHtml: `<table class="cmp cmp-3">
        <thead lang="en"><tr><th></th><th>Chain of Resp.</th><th>Decorator</th><th>Composite</th><th>Observer</th></tr></thead>
        <tbody>
          <tr><td>Yapı</td><td>Doğrusal zincir: her halka ardılını tutar</td><td>Katmanlar: dıştaki içtekini sarar</td><td>Ağaç: parça–bütün</td><td>Konu, gözlemci listesi tutar</td></tr>
          <tr><td>İstek kaça ulaşır?</td><td><b>Biri</b> işleyene kadar (belki hiçbiri)</td><td>Her katmana</td><td>Bütün alt ağaca</td><td>Bütün gözlemcilere</td></tr>
          <tr><td>Aradaki durdurabilir mi?</td><td><b>Evet</b>: işleyen durur</td><td>Hayır, hep iletir</td><td>Hayır</td><td>Hayır</td></tr>
          <tr><td>Amaç</td><td>Göndereni alıcıdan <b>ayırmak</b></td><td>Davranış <b>eklemek</b></td><td>Parçayı bütün gibi kullanmak</td><td>Değişikliği <b>yaymak</b></td></tr>
        </tbody></table>`,
      note: 'GoF: CoR sıklıkla Composite ile birlikte kullanılır; bir bileşenin **ebeveyni** onun ardılı olur (örneğin arayüzde bir düğmenin yardım isteği önce kutuya, sonra pencereye gider).',
      roles: { TeslimatAdimi: 'handler' },
      special: CR.special,
      file: 'Karsilastirma.java',
      code: () => `// CoR: işleyebiliyorsan işle ve DUR; yoksa sonrakine ver
if (dene(g)) teslimAl(g); else if (sonraki != null) sonraki.teslimEt(g);

// Decorator: her zaman içtekine ilet, üstüne bir şey ekle
return ic.ucret() + 25;

// Composite: isteği bütün çocuklara dağıt
for (Bilesen c : cocuklar) toplam += c.agirlik();

// Observer: değişikliği bütün gözlemcilere bildir
for (Gozlemci o : gozlemciler) o.guncelle(durum);`,
      mark: 'if (dene(g)) teslimAl(g); else if (sonraki != null) sonraki.teslimEt(g);',
    },
  ];

  CR.scenes.realworld = (root, ctx) =>
    kit.realWorldScene(root, ctx, {
      tabs: TABS,
      roles: CR.roles,
      roleOf: CR.roleOf,
      fmLabel: 'zincir',
      footText: (i) =>
        i === 3
          ? 'Yapı benziyorsa **isteğin kaç alıcıya ulaştığına** bakın: CoR’da biri (ya da hiçbiri), Decorator, Composite ve Observer’da hepsi.'
          : i === 2
          ? 'Her filtre ya isteği durdurur ya da `zincir.doFilter(…)` ile sonrakine iletir.'
          : i === 1
          ? 'Yakalayamayan her çerçeve istisnayı çağırana iletir. Sağdaki düğmelerle kimin yakalayacağını değiştirin.'
          : 'Kayıt günlükçüden ebeveynine doğru zincirde ilerler. Sağdaki düğmelerle zinciri değiştirin.',
    });

  // ================================================================== 9. QUIZ
  const Q = [
    {
      type: 'mcq',
      q: 'Chain of Responsibility kalıbının **temel amacı** (GoF) nedir?',
      options: ['Göndericiyi alıcıya bağlamamak: isteği, biri işleyene kadar nesneler zinciri boyunca iletmek', 'Bir nesneye, alt sınıf yazmadan, çalışırken yeni sorumluluklar eklemek ve onları katlamak', 'Bir nesnedeki değişikliği, ona bağlı bütün nesnelere kendiliğinden bildirip güncellemek', 'Bir isteği nesne olarak paketlemek; böylece sıraya koymak, kaydetmek ve geri almak'],
      answer: 0,
      explain: 'GoF: “Bir isteğin göndericisini alıcısına bağlamaktan kaçın; isteği işleme fırsatını birden çok nesneye ver.” Diğerleri Decorator, Observer ve Command’ın amaçları.',
    },
    {
      type: 'line',
      q: 'Bu sınıfta isteğin **sonraki halkaya iletildiği** satıra tıklayın.',
      codeName: 'TeslimatAdimi.java',
      code: yorumsuz(CR.plain(C.TeslimatAdimi)),
      answer: 'sonraki.teslimEt(g);',
      explain: 'Halka işleyemediği gönderiyi ardılına veriyor. Ardılın hangi sınıf olduğunu bilmiyor; yalnızca bir TeslimatAdimi olduğunu biliyor.',
    },
    {
      type: 'mcq',
      q: '`Kurye` (istemci) zincir hakkında ne bilir?',
      options: ['Bütün halkaları ve sıralarını; zinciri kendisi kurar', 'Yalnızca zincirin başını: bir TeslimatAdimi', 'Hangi halkanın teslim alacağını, gönderiye bakarak', 'Yalnızca son halkayı: kimse almazsa devreye giren iadeyi'],
      answer: 1,
      explain: 'Gönderen alıcıdan ayrılır: kurye tek bir alan tutar ve `zincir.teslimEt(g)` der. Kimin teslim alacağı çalışırken, zincirde belli olur.',
    },
    {
      type: 'mcq',
      q: 'Zincirde **hiçbir halka** isteği işleyemezse ne olur?',
      options: ['Derleyici hata verir; zincirin sonunda işleyen bir halka zorunludur', 'İstek işlenmeden düşebilir; bu yüzden sona her zaman işleyen bir halka konabilir', 'Zincir isteği baştan bir kez daha dener; ikinci turda ilk halka işler', 'Java son halkayı isteği işlemeye zorlar; dene(g) false olsa da teslim alır'],
      answer: 1,
      explain: 'GoF: alındı garantisi yoktur. Bizim örnekte İade halkası bu boşluğu kapatıyor; tezgâhta çıkarınca Mert’in kolisi KAYIP oluyor.',
    },
    {
      type: 'mcq',
      q: 'Malatya zincirinde **Şube** halkasını en başa alırsanız ne olur?',
      options: ['Soğuk zincir ilaç dolaba girer; şube öndeyken dolabın kuralı atlanır', 'Program derlenmez; zincirin ilk halkası her zaman AliciyaTeslim olmalı', '20 kg’a kadar her gönderiyi önce şube alır; evdeki alıcının kolisi bile şubeye gider', 'Hiçbir şey değişmez; her gönderi yine aynı halkada teslim edilir'],
      answer: 2,
      explain: 'Kurallar bozulmaz (ilaç yine dolaba girmez), ama zincirde sıra **önceliği** belirler: ilk “ben alırım” diyen teslim alır.',
    },
    {
      type: 'line',
      q: 'Bu halkada soğuk zincirin **halkanın kendi kuralıyla** reddedildiği satıra tıklayın.',
      codeName: 'DolabaTeslim.java',
      code: CR.plain(C.DolabaTeslim),
      answer: 'return !g.sogukZincir() && g.kg() <= 5;',
      explain: 'Kural eksiksiz ve halkanın içinde; üstteki halkalara güvenmiyor. Bu yüzden İstanbul sırasında da ilaç dolaba giremez.',
    },
    {
      type: 'mcq',
      q: 'Chain of Responsibility ile Decorator arasındaki en önemli fark nedir?',
      options: ['CoR’da bir halka isteği işleyip zinciri durdurabilir; Decorator her zaman içtekine iletir ve davranış ekler', 'Decorator kalıtımla, CoR yalnızca bileşimle kurulur; ikisi de isteği hep sona kadar iletir', 'CoR en fazla iki halkayla çalışır; Decorator ise sınırsız sayıda katman sarabilir', 'Aralarında fark yoktur; ikisinde de her halka isteği işler ve sonrakine iletir'],
      answer: 0,
      explain: 'İkisi de isteği bir sonraki nesneye verir. Decorator’da her katman çalışır ve iletir; CoR’da işleyen halka zinciri bitirir.',
    },
    {
      type: 'mcq',
      q: 'Java’da hangisi bir **sorumluluk zinciri** örneğidir?',
      options: ['`Collections.unmodifiableList(liste)` ile listenin değiştirilemez bir görünümünü almak', 'Bir istisnanın, onu yakalayan ilk `catch` bloğuna kadar çağrı yığınında yukarı iletilmesi', '`Integer.valueOf(127)` ile önbellekteki paylaşılan Integer nesnesini almak', '`Files.readAllLines(yol)` ile dosyayı tek çağrıda satır satır okumak'],
      answer: 1,
      explain: 'Yakalayamayan her çerçeve istisnayı çağırana iletir. Diğerleri sırasıyla Decorator/Proxy, Flyweight ve Facade örnekleri.',
    },
  ];

  CR.scenes.quiz = (root, ctx) =>
    kit.quizScene(root, ctx, {
      questions: Q,
      roleOf: CR.roleOf,
      special: CR.special,
      patternName: 'Chain of Responsibility',
      match: {
        items: ['TeslimatAdimi', 'AliciyaTeslim', 'DolabaTeslim', 'GondericiyeIade', 'Kurye'].map((id) => ({ id, label: id })),
        buckets: ['handler', 'concreteHandler', 'client'].map((k) => ({ id: k, title: CR.roles[k].en, sub: CR.roles[k].tr, color: CR.roles[k].color })),
        answer: CR.classRoles,
        hint: 'Beş sınıfı üç role yerleştirin. Takıldığınızda **Cevapları göster** düğmesi var.',
      },
    });

  // ================================================================== 10. ÖZET
  CR.scenes.summary = function (root, ctx) {
    const at = DP.catalog.findIndex((p) => p.id === 'chain-of-responsibility');
    const next = DP.catalog.slice(at + 1).find((p) => p.ready && DP.patterns[p.id]);
    const el = h('div', { class: 'scene scene-summary' });
    el.innerHTML = `
      <div class="sum-head">
        <div>
          <div class="chips"><span class="chip chip-cat is-behav">Davranışsal · Behavioral</span><span class="chip">Anahtar kelime: iletme</span></div>
          <h1>Chain of Responsibility — Özet</h1>
        </div>
        <div class="sum-actions no-print">
          <button class="btn btn-ghost" type="button" data-print>🖨 Yazdır / PDF</button>
          <a class="btn btn-ghost" href="#/proxy/ozet">← Proxy özeti</a>
          <a class="btn btn-ghost" href="#/">Tüm kalıplar</a>
          ${next ? `<a class="btn btn-primary" href="#/${next.id}">Sıradaki kalıp: ${DP.esc(next.name)} →</a>` : ''}
        </div>
      </div>
      <div class="sum-grid">
        <article class="card sum-intent">
          <h3>Amaç</h3>
          <p>Bir isteğin göndericisini alıcısına <b>bağlamaktan kaçın</b>; isteği işleme fırsatını birden çok nesneye ver. Alıcıları <b>zincirle</b> ve isteği, biri işleyene kadar zincir boyunca <b>ilet</b>.</p>
          <div class="sum-formula"><code>zincir.teslimEt(g)</code> → <code>Alıcı ✗ → Komşu ✗ → Dolap ✗ → Şube ✓</code> <span>(ilk “ben alırım” diyen işler, zincir durur)</span></div>
        </article>
        <article class="card sum-uml"><h3>Yapı (GoF)</h3><div class="sum-diag"></div></article>
        <article class="card">
          <h3>if/else merdiveni ↔ Zincir</h3>
          <table class="cmp sg-sum-cmp">
            <thead lang="en"><tr><th></th><th>Kalıpsız</th><th>Chain of Resp.</th></tr></thead>
            <tbody>
              <tr><td>Gönderenin tanıdığı</td><td class="bad">bütün seçenekler</td><td class="ok">zincirin başı</td></tr>
              <tr><td>Kural nerede?</td><td class="bad">dalın yerinde (gizli)</td><td class="ok">halkanın içinde</td></tr>
              <tr><td>Sıra değişirse</td><td class="bad">kopya + bozulma</td><td class="ok">Main’de bir satır</td></tr>
              <tr><td>Yeni seçenek</td><td class="bad">her merdivene dal</td><td class="ok">yeni halka sınıfı</td></tr>
            </tbody>
          </table>
        </article>
        <article class="card">
          <h3>Katılımcılar</h3>
          <ul class="sum-roles">
            <li>${ui.roleChip('handler')}<span>arayüz + ardıl (<code>sonraki</code>)</span></li>
            <li>${ui.roleChip('concreteHandler')}<span>işler ya da iletir</span></li>
            <li>${ui.roleChip('client')}<span>isteği zincirin başına verir</span></li>
          </ul>
          <p class="cr-sum-note">Zinciri <b>kurulum</b> (Main) kurar; sıra = öncelik.</p>
        </article>
        <article class="card sum-pros">
          <h3>Artıları</h3>
          <ul>
            <li>Gönderen ile alıcılar arasında <b>gevşek bağ</b></li>
            <li>Halkalar <b>çalışırken</b> eklenir, çıkarılır, sıralanır</li>
            <li>Her halka tek bir kuraldan sorumlu</li>
            <li>Yeni seçenek = yeni sınıf (açık/kapalı ilkesi)</li>
          </ul>
        </article>
        <article class="card sum-cons">
          <h3>Eksileri</h3>
          <ul>
            <li>Teslim <b>garanti değil</b>: sona işleyen bir halka koyun</li>
            <li>Uzun zincirde izlemek ve hata ayıklamak zorlaşır</li>
            <li>Her istek zinciri baştan dolaşır</li>
            <li>Yanlış sıra = yanlış sonuç</li>
          </ul>
        </article>
        <article class="card">
          <h3>İlişkili kalıplar</h3>
          <ul>
            <li><b>Composite:</b> bir bileşenin ebeveyni çoğu zaman onun ardılıdır.</li>
            <li><b>Decorator:</b> benzer zincir yapısı; ama her katman iletir.</li>
            <li><b>Command:</b> zincirde taşınan istek bir nesne olabilir.</li>
            <li><b>Template Method:</b> <code>teslimEt</code> bir şablon: <code>dene</code> + ilet.</li>
          </ul>
        </article>
        <article class="card sum-tip">
          <h3>Sınav ipuçları</h3>
          <pre class="mini-code">abstract class TeslimatAdimi {                // Handler
    private TeslimatAdimi sonraki;            // successor
    public final void teslimEt(Gonderi g) {
        if (dene(g)) { … }                    // işle ve DUR
        else if (sonraki != null)
            sonraki.teslimEt(g);              // ilet
        else { … }                            // kimse işlemedi
    }
    protected abstract boolean dene(Gonderi g);
}
zincir.teslimEt(g);                           // Client: yalnızca baş</pre>
          <p class="exam"><b>Kimin işleyeceği belli değil + gönderen bilmesin</b> → CoR · <b>Handler, ConcreteHandler, successor</b> · teslim <u>garanti değil</u> · sıra = <u>öncelik</u></p>
        </article>
        <article class="card sum-files">
          <h3>Java kodları</h3>
          <p>Çalıştırılabilir örnekler proje klasöründe:</p>
          <pre class="mini-code">java/chainofresponsibility/sorun      → if/else merdiveni; İstanbul’da ilaç dolapta
java/chainofresponsibility/cozum      → TeslimatAdimi zinciri: Malatya ve İstanbul sırası
java/chainofresponsibility/akis/...   → Canlı Akış: ayse · zeynep
java/chainofresponsibility/tezgah/... → dolaponce · subeonce · iadesiz
java/chainofresponsibility/genislet   → MarketeTeslim: yeni halka, tek satır</pre>
          <p>Derleyip çalıştırmak için <code>java/README.md</code> dosyasına bakın.</p>
        </article>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-print]').addEventListener('click', () => window.print());
    const diag = new DP.ClassDiagram(el.querySelector('.sum-diag'), CR.gofDiagram({}), { roles: CR.roles, roleTags: false, mode: 'generic' });
    diag.svg.classList.add('is-compact');
    return { destroy() {} };
  };

  // ================================================================== kayıt
  DP.register({
    id: 'chain-of-responsibility',
    name: 'Chain of Responsibility',
    tr: 'Sorumluluk Zinciri',
    category: 'behavioral',
    roleOf: CR.roleOf,
    initialState: () => ({
      view: 'stage',
      showCode: true,
      preset: 'zeynep',
      tz: { keys: CR.MALATYA.slice() },
      marketUnlocked: false,
      ext: {},
      quiz: { results: {}, match: false },
    }),
    scenes: [
      { id: 'giris', title: 'Giriş', mount: CR.scenes.intro },
      { id: 'sorun', title: 'Sorun', mount: CR.scenes.problem },
      { id: 'cozum', title: 'Çözüm', mount: CR.scenes.solution },
      { id: 'akis', title: 'Canlı Akış', mount: CR.scenes.flow, star: true },
      { id: 'tezgah', title: 'Zincir Tezgâhı', mount: CR.scenes.counter, star: true },
      { id: 'yapi', title: 'Yapı (UML)', mount: CR.scenes.structure },
      { id: 'genislet', title: 'Genişlet', mount: CR.scenes.extend },
      { id: 'gercek', title: 'Gerçek Dünya', mount: CR.scenes.realworld },
      { id: 'quiz', title: 'Quiz', mount: CR.scenes.quiz },
      { id: 'ozet', title: 'Özet', mount: CR.scenes.summary },
    ],
  });
})();
