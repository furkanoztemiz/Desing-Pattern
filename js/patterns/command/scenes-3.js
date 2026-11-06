/*
 * Command — sahneler (3/3): Yapı, Genişlet, Gerçek Dünya, Quiz, Özet ve kalıp kaydı
 */
(function () {
  'use strict';
  const CM = DP.cmd;
  const { h } = DP;
  const kit = DP.kit;
  const ui = CM.ui;
  const md = CM.md;
  const C = CM.code;
  const EX = CM.ext;
  /** Satır sonu yorumlarını atar (quiz'de cevabı ele vermesin) */
  const yorumsuz = (s) => s.replace(/ +\/\/ [^\n]*$/gm, '');

  // ================================================================== 6. YAPI
  const ROLE_TEXT = {
    command: 'Bir işlemi yürütmek için arayüzü tanımlar: <code>calistir()</code>; geri alınabilen komutlarda <code>geriAl()</code>.',
    concreteCommand: 'Bir <b>alıcıyı</b> bir eylemle bağlar; <code>calistir()</code> içinde alıcının işlemlerini çağırır. Geri almak için gereken <b>durumu</b> kendisi tutar.',
    invoker: 'Komuttan isteği yerine getirmesini ister (<code>k.calistir()</code>). Komutu saklar, sıraya koyar, geçmişte tutar; alıcıyı <b>tanımaz</b>.',
    receiver: 'İsteği yerine getirmek için gereken işi <b>bilen</b> nesne. Komutlardan habersizdir; her sınıf alıcı olabilir.',
    client: 'Somut komutu yaratır, alıcısını verir ve komutu bir çağırana teslim eder.',
  };

  function classInfo(id) {
    switch (id) {
      case 'Komut':
        return { role: 'command', file: 'Komut.java', code: C.Komut, mark: ['void calistir();', 'String ad();'], points: ['Üç işlem: `calistir()`, `geriAl()`, `ad()`.', 'Çağıranların tanıdığı **tek** tür.', 'Alıcıdan, depodan, kamyondan söz etmez.'] };
      case 'TasiKomutu':
      case 'YukleKomutu': {
        const tasi = id === 'TasiKomutu';
        return { role: 'concreteCommand', file: id + '.java', code: C[id], mark: tasi ? ['public void calistir() {', 'depo.tasi(koli, onceki);'] : ['public void calistir() {', 'depo.koy(koli, raf);'], points: [tasi ? 'Alıcısı: `depo`. Parametreleri: `koli`, `hedef`.' : 'Alıcıları: `depo` ve `kamyon`. Parametresi: `koli`.', tasi ? 'Geri alma kaydı: `onceki` (calistir sırasında doldurulur).' : 'Geri alma kaydı: `raf` (calistir sırasında doldurulur).', 'İşi kendisi yapmaz, **alıcıya** yaptırır.'] };
      }
      case 'OperatorPaneli':
        return { role: 'invoker', file: 'OperatorPaneli.java', code: C.OperatorPaneli, mark: ['public void yap(Komut k) {', 'ileri.clear();'], points: ['`yap(k)`: çalıştır, geçmişe koy.', '`geriAl()` / `yinele()`: yığından çek, komuta devret.', 'Depoyu ve kamyonu **tanımıyor**.'] };
      case 'GeceIsi':
        return { role: 'invoker', file: 'GeceIsi.java', code: C.GeceIsi, mark: ['public void ekle(Komut k) {', 'k.calistir();'], points: ['Komutları **sonra** çalıştırmak için kuyrukta tutar.', 'Panelle aynı komut sınıflarını kullanır.', 'Dizgi yok, satır bölme yok, kopya switch yok.'] };
      case 'Depo':
      case 'Kamyon':
        return { role: 'receiver', file: id + '.java', code: C[id], mark: id === 'Depo' ? 'public void tasi(String koli, String raf) {' : 'public void yukle(String koli) {', points: ['Asıl işi bilen nesne.', 'Komutlardan, panelden, gece işinden **habersiz**.', 'Kalıpsız sürümdeki hâliyle **aynı** sınıf.'] };
      case 'Main':
        return { role: 'client', file: 'Main.java', code: C.Main, mark: ['panel.yap(new TasiKomutu(depo, "KRG-1001", "B3"));', 'gece.ekle(new YukleKomutu(depo, kamyon, "KRG-1005"));'], points: ['Alıcıları ve komutları yaratır.', 'Komutu bir çağırana verir: panele ya da gece işine.', 'Hangi komutun ne zaman çalışacağına çağıran karar verir.'] };
      default:
        return null;
    }
  }

  CM.scenes.structure = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split' });
    const tools = h('div', { class: 'panel-tools' });
    const body = h('div', { class: 'scene-body cols-64' });
    const left = kit.panel('Yapı', { cls: 'panel-diagram', extra: tools });
    const right = kit.panel('Rol kartı <span class="panel-sub">· bir sınıfa tıklayın</span>', { cls: 'panel-side' });
    body.append(left.el, right.el);
    el.append(body);
    root.appendChild(el);

    const diagHost = h('div', { class: 'diag-host' });
    const legend = kit.umlLegend({ association: true, aggregation: 'tutar', fmLabel: 'komutu çalıştırır, geçmişe koyar' });
    left.body.append(diagHost, legend);
    const diagram = new DP.ClassDiagram(diagHost, CM.gofDiagram({ notes: true }), {
      roles: CM.roles,
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
      const r = CM.roles[info.role];
      infoTop.innerHTML = `
        <div class="info-role rc rc-${r.color}"><span class="info-dot"></span><b>${r.en}</b> · ${r.tr}</div>
        <div class="info-name rc rc-${r.color}">${DP.esc(id)}</div>
        <p class="info-desc">${ROLE_TEXT[info.role]}</p>
        <ul class="info-points">${info.points.map((p) => `<li>${md(p)}</li>`).join('')}</ul>`;
      const cv = new DP.CodeView(infoCode, { files: [{ name: info.file, code: info.code }], roleOf: CM.roleOf, special: CM.special, compact: true });
      cv.mark(info.file, info.mark, 'focus');
      DP.flash(infoTop, 'is-pop');
    }

    function showOverview() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">İstek bir nesne</div>
        <div class="role-list">
          ${['command', 'concreteCommand', 'invoker', 'receiver', 'client']
            .map((k) => `<div class="role-row rc rc-${CM.roles[k].color}"><span class="info-dot"></span><div><b>${CM.roles[k].en}</b> · ${CM.roles[k].tr}<div class="role-desc">${ROLE_TEXT[k]}</div></div></div>`)
            .join('')}
        </div>`;
    }

    function showAkil() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">Komut ne kadar akıllı olmalı?</div>
        <p class="info-desc">${md('GoF’a göre bir yelpaze var: komut yalnızca alıcıyı ve eylemi **bağlayabilir** ya da işi tamamen **kendisi** yapabilir (o zaman alıcı yoktur).')}</p>
        <table class="cmp cmd-cmp">
          <thead><tr><th>Komut</th><th>Ne yapar?</th></tr></thead>
          <tbody>
            <tr><td>Bağlayıcı</td><td>${md('`depo.tasi(koli, hedef)`: iş alıcıda (bizim komutlar)')}</td></tr>
            <tr><td>Kendi başına</td><td>${md('Alıcı yok; işi `calistir()` içinde kendisi yapar (ör. bir `Runnable`)')}</td></tr>
            <tr><td>Geri alınamaz</td><td>${md('Etiketi yazdırmak gibi: `geriAl()` yalnızca “iptal” damgası basabilir')}</td></tr>
          </tbody>
        </table>
        <p class="info-desc">${md('Geri alma için komut, **çalışırken** gereken durumu saklar (`onceki`, `raf`). Durum büyükse komut bir **Memento** kullanabilir.')}</p>`;
      DP.flash(infoTop, 'is-pop');
    }

    const komutlar = ['TasiKomutu', 'YukleKomutu'];
    const STEPS = [
      { t: 'Genel bakış', x: 'Beş rol: [[Komut]] arayüzü, onu uygulayan somut komutlar, komutları çalıştıran **çağıranlar** ([[OperatorPaneli]], [[GeceIsi]]), işi bilen **alıcılar** ([[Depo]], [[Kamyon]]) ve hepsini kuran **istemci** ([[Main]]).', info: null },
      { t: 'Command — `Komut`', x: '[[Komut]]: `calistir()`, `geriAl()`, `ad()`. Çağıranların tanıdığı tek tür; içi boş bir sözleşme.', info: 'Komut', focus: { classes: ['Komut'], members: [['Komut', 'calistir'], ['Komut', 'geriAl']] } },
      { t: 'ConcreteCommand — komutlar', x: '[[TasiKomutu]] ve [[YukleKomutu]] alıcılarını alan olarak tutuyor ve işi onlara **yaptırıyor**. Geri alma kaydı (`onceki`, `raf`) da komutun içinde.', info: 'TasiKomutu', focus: { classes: komutlar, edges: ['r-tasi', 'r-yukle', 'a-tasi', 'a-yukle-depo', 'a-yukle-kamyon'] } },
      { t: 'Receiver — alıcılar', x: '[[Depo]] ve [[Kamyon]] işi biliyor ama komutlardan **habersiz**: kalıpsız sürümdeki sınıfların aynısı. Herhangi bir sınıf alıcı olabilir.', info: 'Depo', focus: { classes: ['Depo', 'Kamyon'], edges: ['a-tasi', 'a-yukle-depo', 'a-yukle-kamyon'] } },
      { t: 'Invoker — çağıranlar', x: '[[OperatorPaneli]] komutları **geçmişte**, [[GeceIsi]] **kuyrukta** tutuyor (◇ = tutar). İkisi de yalnızca `Komut`’u tanıyor; nottaki gibi: çalıştır, geçmişe koy, geri alırken yığından çek.', info: 'OperatorPaneli', focus: { classes: ['OperatorPaneli', 'GeceIsi', 'Komut'], edges: ['gecmis', 'kuyruk'] } },
      { t: 'Client — `Main`', x: '[[Main]] alıcıları ve komutları yaratıyor, komutu bir çağırana veriyor. **Ne** yapılacağına istemci, **ne zaman** yapılacağına çağıran karar veriyor.', info: 'Main', focus: { classes: ['Main', 'TasiKomutu'], edges: ['c-main'] } },
      { t: 'Komut ne kadar akıllı olmalı?', x: 'Komut alıcıya iş yaptıran bir **bağlayıcı** da olabilir, işi kendisi yapan bir nesne de. Bazı işlemler geri alınamaz; geri alma için gereken durum büyükse bir **Memento** saklanabilir.', akil: true, focus: { classes: komutlar } },
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
        if (s.akil) showAkil();
        else if (s.info) showInfo(s.info);
        else showOverview();
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };

  // ================================================================== 7. GENİŞLET: makro komut
  CM.scenes.extend = function (root, ctx) {
    const S = ctx.state;
    S.ext = S.ext || {};
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-50' });
    const left = kit.panel('Görev: <code class="cmd-code-t">MakroKomut</code>', { cls: 'panel-code panel-ex' });
    const right = kit.panel('Depo', { cls: 'panel-side cmd-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    // ---- sol (adım 0): alıştırma
    const exBox = h('div', { class: 'ex-box' });
    const task = h('div', {
      class: 'task-card',
      html: md('📩 **Sevkiyat şefi:** “Malatya kamyonuna her akşam aynı üç koli yükleniyor: 1001, 1005, 1006. **Tek düğmeyle** yüklensin; yanlışlıkla basılırsa **tek geri al** hepsini geri alsın.”\nKural: panel, depo ve kamyon değişmeyecek.'),
    });
    const ex = kit.blankExercise({
      files: [
        { name: 'MakroKomut.java', code: EX.exercise, badge: 'YENİ' },
        { name: 'Main.java · ek', code: EX.exerciseMain },
      ],
      answers: EX.answers,
      hints: {
        1: 'Panel yalnızca hangi türü çalıştırabiliyor?',
        2: 'Her parçayı yürütmek için hangi metot?',
        3: 'Geri alırken her parçaya ne denir?',
        4: 'Panele verilen yeni komutun sınıfı?',
      },
      choices: ['Komut', 'TasiKomutu', 'OperatorPaneli', 'calistir', 'geriAl', 'yap', 'MakroKomut', 'YukleKomutu'],
      roleOf: CM.roleOf,
      special: CM.special,
      state: S.ext,
      doneText: '<b class="ok">✔ Derleme başarılı!</b> Makro komut hazır.',
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
    const runBox = h('div', { class: 'cmd-runbox', hidden: true });
    const runCode = h('div', { class: 'cmd-cv' });
    const runConsole = h('div', { class: 'console cmd-console' });
    runBox.append(runCode, runConsole);
    left.body.append(exBox, runBox);
    const runCv = new DP.CodeView(runCode, { roleOf: CM.roleOf, special: CM.special });

    // ---- sağ: depo + etki
    const viewHost = h('div', { class: 'cmd-view' });
    const impact = h('div', { class: 'cmd-extra' });
    right.body.append(viewHost, impact);
    const stage = new CM.DepoSahne(viewHost);

    const r = CM.run(EX.prog);
    const O = r.olaylar;
    const pushOlay = O.find((o) => o.e === 'push');
    const makroKart = pushOlay.kart;
    const nYap = pushOlay.n;
    const prog = EX.prog;
    const bant = (aktif, metot) => ({ kind: 'kartlar', not: 'üç komut, panelde tek nesne', kartlar: [{ kart: makroKart, ad: 'm', durum: aktif ? 'aktif' : null, metot }] });
    const bas = CM.stateFrom(prog, { raflar: Object.assign({}, CM.SABAH), yuk: [], gecmis: [], ileri: [], slot: {} }, { bant: null, banner: { text: 'Üç yükleme **tek komut** olabilir mi? Geri al hepsini birden almalı.' } });
    const sonrasi = CM.stateFrom(prog, pushOlay.s, { hl: { 'KRG-1001': 'move', 'KRG-1005': 'move', 'KRG-1006': 'move' }, bant: bant(true, 'calistir'), dugme: 'yukle', banner: { text: '✓ Tek istek → **3 koli** kamyonda · geçmişte **1** komut', tone: 'ok' } });
    const geri = CM.stateFrom(prog, r.son, { hl: { 'KRG-1001': 'ok', 'KRG-1005': 'ok', 'KRG-1006': 'ok' }, bant: bant(true, 'geriAl'), dugme: 'geri', banner: { text: '↶ Tek geri al → üç koli **ters sırayla** raflarına döndü (1006, 1005, 1001)', tone: 'ok' } });
    const STEPS = [
      {
        t: 'Görev: `MakroKomut`',
        x: 'Boşluklara tıklayıp doğru parçaları seçin. İpucu: makro da bir [[Komut]]; içinde bir **komut listesi** var. `calistir()` hepsini sırayla, `geriAl()` hepsini **ters** sırayla çağırır.',
        st: bas,
      },
      {
        t: 'Derlendi: tek düğme, üç yükleme',
        x: 'Panel makroyu **tek bir komut** olarak çalıştırdı ve geçmişe koydu; makro da kendi içinde üç [[YukleKomutu]]’nu çalıştırdı. Panel için makro sıradan bir komut.',
        st: sonrasi,
      },
      {
        t: 'Tek geri al, ters sıra',
        x: 'Tek “geri al” makronun `geriAl()`’ını çağırdı; makro parçalarını **ters sırayla** geri aldı: 1006, 1005, 1001. Geri alma, yapılışın tersi sırayla olmalı: sonraki komut öncekinin sonucuna dayanıyor olabilir.',
        st: geri,
      },
      {
        t: 'Kalıpsız olsaydı?',
        x: 'Kalıpsız panelde “makro”, iki `switch`’e yeni bir dal ve üç alanlık kayda sığmayan bir geri alma demekti. Komutlarla yeni bir sınıf yetti: panel, depo, kamyon **değişmedi**. **Makro** artık Komut Tezgâhı’nda da açık.',
        st: Object.assign({}, geri, { banner: { text: 'Yeni istek türü: kalıpsız **iki switch + kayıt**, komutla **bir sınıf**.', tone: 'ok' } }),
      },
    ];

    function renderLeft(i) {
      exBox.hidden = i >= 1;
      runBox.hidden = i < 1;
      left.head.querySelector('.panel-title').innerHTML = i >= 1 ? 'Yeni komut: <code class="cmd-code-t ver">MakroKomut</code>' : 'Görev: <code class="cmd-code-t">MakroKomut</code>';
      if (i < 1) return;
      // önce konsol (yüksekliği değişir), sonra koddaki işaret
      const kadar = i === 1 ? nYap : r.lines.length;
      CM.renderConsole(runConsole, CM.cmd(true), r.lines.slice(0, kadar).map((l) => CM.consoleLine(l)));
      runCv.setFiles(
        [
          { name: 'MakroKomut.java', code: C.MakroKomut, badge: 'YENİ' },
          { name: 'Main.java', code: EX.Main },
        ],
        { active: i === 1 ? 'Main.java' : 'MakroKomut.java', keepActive: false }
      );
      if (i === 1) runCv.mark('Main.java', ['panel.yap(new MakroKomut(', '"KRG-1006"))));'], 'focus');
      else runCv.mark('MakroKomut.java', ['public void geriAl() {', 'komutlar.get(i).geriAl();'], 'focus');
    }

    function renderImpact(i, animate) {
      if (i === 0) {
        impact.innerHTML = `<div class="impact-title">İpucu</div><p>${md('Panelin `yap(k)` metoduna bakın: yalnızca `Komut` türünü tanıyor. Makroyu panele verebilmek için makronun da bir `Komut` olması yeter.')}</p>`;
      } else if (i === 1) {
        impact.innerHTML = `
          <div class="impact-title ok">✔ Derleme başarılı · yeni komut</div>
          <ul class="filelist"><li><span class="cv-dot rc rc-${CM.roleOf('MakroKomut')}"></span>MakroKomut.java <span class="cv-badge is-new">YENİ</span></li></ul>`;
      } else if (i === 2) {
        impact.innerHTML = `
          <div class="metrics">
            <div class="metric is-good"><div class="m-val">1</div><div class="m-label">yeni sınıf</div></div>
            <div class="metric is-good"><div class="m-val">0</div><div class="m-label">değişen sınıf</div></div>
            <div class="metric"><div class="m-val">3 → 1</div><div class="m-label">istek → komut</div></div>
          </div>`;
      } else {
        impact.innerHTML = `
          <table class="cmp cmd-cmp">
            <thead><tr><th>Yeni istek türü</th><th>Kalıpsız</th><th>Komut</th></tr></thead>
            <tbody>
              <tr><td>Değişen kod</td><td class="bad">panel + gece işi (iki switch)</td><td class="ok">yok</td></tr>
              <tr><td>Geri alma</td><td class="bad">üç alana sığmaz</td><td class="ok">makro kendi geri alır</td></tr>
              <tr><td>Geceye eklemek</td><td class="bad">yeni metin biçimi</td><td class="ok"><code>gece.ekle(makro)</code></td></tr>
            </tbody>
          </table>
          <div class="cmd-go"><button class="btn btn-primary btn-sm" type="button" data-go>🧾 Komut Tezgâhı’nda dene →</button></div>`;
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
          S.makroUnlocked = true;
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
  const RW = CM.rw;
  const TABS = [
    {
      tab: 'Runnable',
      title: '`Runnable` — Java’nın en yalın komutu',
      intro: '`Runnable` tek metotlu bir komut arayüzüdür: `run()`. Bir lambda yazdığınızda bir **komut nesnesi** yaratırsınız; onu kimin, ne zaman çalıştıracağına siz değil **çağıran** karar verir: bugün `main`, gece başka bir iş parçacığı, yarın bir `ExecutorService`.',
      map: [
        ['command', 'Komut', '`Runnable` (`run()`)'],
        ['concreteCommand', 'YukleKomutu', 'lambda: `() -> yaz(…)`'],
        ['invoker', 'GeceIsi', '`Thread`, `ExecutorService`, bir döngü'],
        ['client', 'Main', 'lambdayı yaratıp listeye koyan kod'],
      ],
      note: 'Sağdaki düğmeler aynı iki komutu farklı çağıranlara verir. “Henüz değil” seçeneğinde komutlar yaratıldı ama **hiçbiri çalışmadı**. Çıktılar Java 21 ile alındı.',
      roles: { Runnable: 'command', Thread: 'invoker' },
      file: 'IsKuyrugu.java',
      code: RW.runnable,
      options: RW.runnableOpts,
      mark: 'gece.add(() -> yaz("KRG-1001 kamyona"));',
      cmd: '$ java IsKuyrugu',
    },
    {
      tab: 'Swing Action',
      title: '`javax.swing.Action` — bir komut, iki düğme',
      intro: 'Swing’de bir `Action`, bir kullanıcı isteğinin nesnesidir: adı, simgesi, açık/kapalı durumu ve `actionPerformed()`. Aynı aksiyon bir düğmeye **ve** bir menü öğesine verilir; komutu kapatınca ikisi birden kapanır. GoF kitabındaki örnek de buydu: menü öğeleri komutları çağırır.',
      map: [
        ['command', 'Komut', '`Action` / `AbstractAction`'],
        ['concreteCommand', 'YukleKomutu', '“Kamyona yükle” aksiyonu'],
        ['invoker', 'OperatorPaneli', '`JButton`, `JMenuItem`'],
        ['client', 'Main', 'aksiyonu yaratıp bileşenlere veren kod'],
      ],
      note: 'Program pencere açmadan çalışır: `doClick()` düğmeye basmanın kendisidir. `@SuppressWarnings("serial")`: Swing bileşenleri serileştirilebilir; bu örnekte gerekmiyor. Çıktılar Java 21 ile alındı.',
      roles: { Action: 'command', AbstractAction: 'command', JButton: 'invoker', JMenuItem: 'invoker' },
      file: 'AksiyonOrnegi.java',
      code: RW.aksiyon,
      options: RW.aksiyonOpts,
      mark: 'public void actionPerformed(ActionEvent e) {',
      cmd: '$ java AksiyonOrnegi',
    },
    {
      tab: 'UndoManager',
      title: '`javax.swing.undo` — JDK’nın geri al yığını',
      intro: '`UndoableEdit`, `undo()` ve `redo()` bilen bir komuttur; `UndoManager` bu komutları bir geçmişte tutar. Metin bileşenlerindeki Ctrl+Z bununla çalışır. Bizim paneldeki `gecmis` ve `ileri` yığınlarının JDK’daki karşılığı.',
      map: [
        ['command', 'Komut', '`UndoableEdit` (`undo`, `redo`)'],
        ['concreteCommand', 'TasiKomutu', '`Tasi` (önceki rafı hatırlar)'],
        ['invoker', 'OperatorPaneli', '`UndoManager` (geçmiş)'],
        ['receiver', 'Depo', '`Koli` (rafı değişen nesne)'],
      ],
      note: 'Program iki taşıma ekleyip bir kez geri alıyor; düğmeler sonrasını değiştiriyor. “Yeni işlem” seçeneğinde, bizim panelde olduğu gibi, **yinele** geçmişi silinir. Çıktılar Java 21 ile alındı.',
      roles: { UndoManager: 'invoker', AbstractUndoableEdit: 'command', Tasi: 'concreteCommand', Koli: 'receiver' },
      file: 'GeriAlYoneticisi.java',
      code: RW.geriAl,
      options: RW.geriAlOpts,
      mark: 'yonetici.undo();',
      cmd: '$ java GeriAlYoneticisi',
    },
    {
      tab: 'Karıştırmayın!',
      title: 'Command, Strategy, Memento, Chain of Responsibility',
      intro: 'Dördü de bir davranışı ya da durumu bir **nesneye** koyar. Fark: nesnede ne paketleniyor ve onu kim, ne zaman kullanıyor?',
      extraHtml: `<table class="cmp cmp-3">
        <thead lang="en"><tr><th></th><th>Command</th><th>Strategy</th><th>Memento</th><th>Chain of Resp.</th></tr></thead>
        <tbody>
          <tr><td>Nesnede ne var?</td><td>Bir <b>istek</b>: ne yapılacak, kime</td><td>Bir <b>algoritma</b>: nasıl yapılacak</td><td>Bir <b>durumun</b> anlık görüntüsü</td><td>Bir <b>işleyici</b> (istek zincirde dolaşır)</td></tr>
          <tr><td>Kim kullanır?</td><td>Çağıran; ne yaptığını bilmeden</td><td>Bağlam; işini yaparken</td><td>Sahibi; kaydeder, geri yükler</td><td>Gönderen yalnızca zincirin başını bilir</td></tr>
          <tr><td>Geri alma</td><td>Komut <b>ters işlemi</b> bilir</td><td>—</td><td>Eski durumu <b>geri yükler</b></td><td>—</td></tr>
          <tr><td>Sıraya, kayda</td><td><b>Evet</b></td><td>Genelde hayır</td><td>Durum saklanır</td><td>—</td></tr>
        </tbody></table>`,
      note: 'Geri almanın iki yolu var: Command ters işlemi bilir (taşı ↔ geri taşı); Memento eski durumu saklar. GoF: geri alma için gereken durum büyükse komut bir memento tutabilir.',
      roles: { Komut: 'command' },
      special: CM.special,
      file: 'Karsilastirma.java',
      code: () => `// Command: istek bir nesne; çağıran ne yaptığını bilmeden çalıştırır
panel.yap(new TasiKomutu(depo, "KRG-1001", "B3"));

// Strategy: algoritma bir nesne; bağlam işini yaparken kullanır
double ucret = tarife.hesapla(gonderi);

// Memento: durumun anlık görüntüsü; geri yüklemek için saklanır
DepoAnisi ani = depo.kaydet(); … depo.geriYukle(ani);

// Chain of Responsibility: istek, biri işleyene kadar zincirde ilerler
zincir.teslimEt(gonderi);`,
      mark: 'panel.yap(new TasiKomutu(depo, "KRG-1001", "B3"));',
    },
  ];

  CM.scenes.realworld = (root, ctx) =>
    kit.realWorldScene(root, ctx, {
      tabs: TABS,
      roles: CM.roles,
      roleOf: CM.roleOf,
      fmLabel: 'komut',
      footText: (i) =>
        i === 3
          ? 'Yapı benziyorsa **nesnede ne olduğuna** bakın: Command bir istek, Strategy bir algoritma, Memento bir durum taşır.'
          : i === 2
          ? 'Geri alınabilir komutlar ve onları tutan bir geçmiş: JDK’da hazır. Sağdaki düğmelerle deneyin.'
          : i === 1
          ? 'Aynı komutu iki çağıran kullanıyor; komutu kapatınca ikisi birden kapanıyor.'
          : 'Komutu yaratmak ile çalıştırmak ayrı işler: ne zaman ve kimin çalıştıracağını çağıran belirler.',
    });

  // ================================================================== 9. QUIZ
  const Q = [
    {
      type: 'mcq',
      q: 'Command kalıbının **temel amacı** (GoF) nedir?',
      options: ['Bir isteği nesne olarak paketlemek; böylece istekler sıraya konabilir, kaydedilebilir, geri alınabilir', 'Bir algoritma ailesini tanımlayıp her birini kapsüllemek; böylece birbirinin yerine kullanılabilsinler', 'Bir nesnenin iç durumunu, kapsüllemeyi bozmadan dışarıda saklamak; sonra o duruma geri dönmek', 'Göndericiyi alıcıya bağlamamak; isteği, biri işleyene kadar nesneler zinciri boyunca iletmek'],
      answer: 0,
      explain: 'Diğerleri Strategy, Memento ve Chain of Responsibility’nin amaçları.',
    },
    {
      type: 'line',
      q: 'Bu sınıfta panelin komutu **ne yaptığını bilmeden** çalıştırdığı satıra tıklayın.',
      codeName: 'OperatorPaneli.java',
      code: yorumsuz(CM.plain(C.OperatorPaneli)),
      answer: 'k.calistir();',
      explain: 'Panel yalnızca bir `Komut` biliyor; işin ne olduğunu ve hangi alıcının yapacağını komut biliyor.',
    },
    {
      type: 'mcq',
      q: '`Depo` sınıfı bu tasarımda hangi rolde?',
      options: ['Command', 'Invoker', 'Receiver', 'Client'],
      answer: 2,
      explain: 'Depo taşımayı, rafa koymayı, raftan almayı bilir; komutlar işi ona yaptırır. Kalıpsız sürümdeki hâliyle aynı sınıftır.',
    },
    {
      type: 'mcq',
      q: 'Kalıpsız paneldeki ikinci “geri al” neden boşa gitti?',
      options: ['Java, aynı metodun art arda iki kez çağrılmasına izin vermez', 'Panel yalnızca son işlemin bilgisini tutuyordu; ilk geri al bu kaydı sildi', 'geriAl’deki switch’te TASI dalı eksikti; taşıma geri alınamadı', 'Depo, B3’teki koliyi A1’e geri taşımayı reddetti; raf doluydu'],
      answer: 1,
      explain: 'Sınırsız geri al için her işlemin kendi kaydı gerekir; bu kayıt komut nesnesinin alanıdır (`onceki`, `raf`). Panel yalnızca komutları bir yığında tutar.',
    },
    {
      type: 'line',
      q: 'Bu komutta **geri almak için gereken bilginin kaydedildiği** satıra tıklayın.',
      codeName: 'TasiKomutu.java',
      code: yorumsuz(CM.plain(C.TasiKomutu)),
      answer: 'onceki = depo.yeri(koli);',
      explain: 'Komut çalışırken koli nerede olduğunu kendi alanına yazar; `geriAl()` bu kaydı kullanır.',
    },
    {
      type: 'mcq',
      q: '`MakroKomut.geriAl()` parçaları neden **ters sırayla** geri alıyor?',
      options: ['List.get(i) yalnızca sondan başa doğru dolaşmak için tasarlanmıştır', 'Sonraki komut öncekinin sonucuna dayanabilir; geri alma, yapılışın tersi sırayla olmalı', 'Ters sıra daha hızlıdır; son eklenen komut bellekte en önde durur', 'Sıranın önemi yoktur; ters sıra yalnızca konsol çıktısı düzgün görünsün diye'],
      answer: 1,
      explain: 'Geri alma bir yığın gibi çalışır (son giren ilk çıkar): paneldeki geçmiş de makronun içi de aynı kurala uyar.',
    },
    {
      type: 'mcq',
      q: 'Command ile Strategy arasındaki en önemli fark nedir?',
      options: ['Command bir isteği (ne yapılacağını) paketler; Strategy bir algoritmayı (nasıl yapılacağını) paketler', 'Strategy bir isteği paketleyip sıraya koyar; Command ise algoritmayı değiştirilebilir kılar', 'Command yalnızca kalıtımla, Strategy yalnızca bileşimle kurulabilir; amaçları aynıdır', 'Aralarında fark yoktur; ikisi de bir davranışı nesneye koyar ve aynı amaçla kullanılır'],
      answer: 0,
      explain: 'İkisi de davranışı bir nesneye koyar; ama amaçları farklı: komut bir isteği temsil eder, strateji değiştirilebilir bir algoritmayı.',
    },
    {
      type: 'mcq',
      q: 'Java’da hangisi bir **komut** örneğidir?',
      options: ['`Collections.unmodifiableList(liste)` ile listenin değiştirilemez bir görünümünü almak', 'Bir `Runnable`’ı, ne zaman çalışacağına o karar versin diye bir `ExecutorService`’e vermek', '`Integer.valueOf(127)` ile önbellekteki paylaşılan Integer nesnesini almak', '`Files.readAllLines(yol)` ile dosyayı tek çağrıda satır satır okumak'],
      answer: 1,
      explain: '`Runnable` bir istek nesnesidir; havuz onu ne yaptığını bilmeden, kendi seçtiği zamanda çalıştırır. Diğerleri Decorator/Proxy, Flyweight ve Facade örnekleri.',
    },
  ];

  CM.scenes.quiz = (root, ctx) =>
    kit.quizScene(root, ctx, {
      questions: Q,
      roleOf: CM.roleOf,
      special: CM.special,
      patternName: 'Command',
      match: {
        items: ['Komut', 'TasiKomutu', 'OperatorPaneli', 'GeceIsi', 'Depo', 'Main'].map((id) => ({ id, label: id })),
        buckets: ['command', 'concreteCommand', 'invoker', 'receiver', 'client'].map((k) => ({ id: k, title: CM.roles[k].en, sub: CM.roles[k].tr, color: CM.roles[k].color })),
        answer: CM.classRoles,
        hint: 'Altı sınıfı beş role yerleştirin. Takıldığınızda **Cevapları göster** düğmesi var.',
      },
    });

  // ================================================================== 10. ÖZET
  CM.scenes.summary = function (root, ctx) {
    const at = DP.catalog.findIndex((p) => p.id === 'command');
    const next = DP.catalog.slice(at + 1).find((p) => p.ready && DP.patterns[p.id]);
    const el = h('div', { class: 'scene scene-summary' });
    el.innerHTML = `
      <div class="sum-head">
        <div>
          <div class="chips"><span class="chip chip-cat is-behav">Davranışsal · Behavioral</span><span class="chip">Anahtar kelime: isteği nesneleştirmek</span></div>
          <h1>Command — Özet</h1>
        </div>
        <div class="sum-actions no-print">
          <button class="btn btn-ghost" type="button" data-print>🖨 Yazdır / PDF</button>
          <a class="btn btn-ghost" href="#/chain-of-responsibility/ozet">← Chain of Responsibility özeti</a>
          <a class="btn btn-ghost" href="#/">Tüm kalıplar</a>
          ${next ? `<a class="btn btn-primary" href="#/${next.id}">Sıradaki kalıp: ${DP.esc(next.name)} →</a>` : ''}
        </div>
      </div>
      <div class="sum-grid">
        <article class="card sum-intent">
          <h3>Amaç</h3>
          <p>Bir isteği bir <b>nesne</b> olarak paketle; istemcileri farklı isteklerle parametrelendir, istekleri <b>sıraya</b> koy ya da <b>kaydet</b>, <b>geri alınabilen</b> işlemleri destekle.</p>
          <div class="sum-formula"><code>panel.yap(new TasiKomutu(depo, koli, raf))</code> → <code>k.calistir(); gecmis.push(k)</code> <span>(geri al: <code>gecmis.pop().geriAl()</code>)</span></div>
        </article>
        <article class="card sum-uml"><h3>Yapı (GoF)</h3><div class="sum-diag"></div></article>
        <article class="card">
          <h3>Dizgi + switch ↔ Komut</h3>
          <table class="cmp sg-sum-cmp">
            <thead lang="en"><tr><th></th><th>Kalıpsız</th><th>Command</th></tr></thead>
            <tbody>
              <tr><td>İsteği kim yapar?</td><td class="bad">çağıran (switch)</td><td class="ok">komut, alıcıya yaptırır</td></tr>
              <tr><td>Geri al</td><td class="bad">yalnızca son işlem</td><td class="ok">sınırsız + yinele</td></tr>
              <tr><td>Sıraya koymak</td><td class="bad">metin + kopya switch</td><td class="ok">komut kuyruğu</td></tr>
              <tr><td>Yeni işlem</td><td class="bad">her switch’e dal</td><td class="ok">yeni komut sınıfı</td></tr>
            </tbody>
          </table>
        </article>
        <article class="card">
          <h3>Katılımcılar</h3>
          <ul class="sum-roles">
            <li>${ui.roleChip('command')}<span><code>calistir()</code>, <code>geriAl()</code></span></li>
            <li>${ui.roleChip('concreteCommand')}<span>alıcı + parametreler + geri alma kaydı</span></li>
            <li>${ui.roleChip('invoker')}<span>çalıştırır, geçmişte / kuyrukta tutar</span></li>
            <li>${ui.roleChip('receiver')}<span>işi bilir; komutlardan habersiz</span></li>
            <li>${ui.roleChip('client')}<span>komutu yaratır, çağırana verir</span></li>
          </ul>
        </article>
        <article class="card sum-pros">
          <h3>Artıları</h3>
          <ul>
            <li>İsteği başlatan ile yerine getiren <b>ayrılır</b></li>
            <li><b>Geri al / yinele</b>, kuyruk, kayıt, makro</li>
            <li>Yeni istek = yeni sınıf; çağıranlar değişmez</li>
            <li>İstekler derleyicinin denetlediği <b>türler</b></li>
          </ul>
        </article>
        <article class="card sum-cons">
          <h3>Eksileri</h3>
          <ul>
            <li>Her istek için bir sınıf: <b>sınıf sayısı</b> artar</li>
            <li>Geri alma için durum saklamak bellek ister</li>
            <li>Bazı işlemler geri alınamaz (yazdırmak, e-posta)</li>
            <li>Basit bir düğme için fazla gelebilir (lambda yeter)</li>
          </ul>
        </article>
        <article class="card">
          <h3>İlişkili kalıplar</h3>
          <ul>
            <li><b>Composite:</b> makro komutlar bileşik nesnelerdir.</li>
            <li><b>Memento:</b> geri alma için gereken durumu saklayabilir.</li>
            <li><b>Prototype:</b> geçmişe konmadan önce kopyalanması gereken komutlar.</li>
            <li><b>Chain of Responsibility:</b> komut, zincirde dolaşan istek olabilir.</li>
          </ul>
        </article>
        <article class="card sum-tip">
          <h3>Sınav ipuçları</h3>
          <pre class="mini-code">interface Komut { void calistir(); void geriAl(); }   // Command
class TasiKomutu implements Komut {           // ConcreteCommand
    private final Depo depo;                  // Receiver
    private String onceki;                    // geri alma kaydı
    public void calistir() { onceki = depo.yeri(koli); depo.tasi(koli, hedef); }
    public void geriAl()   { depo.tasi(koli, onceki); }
}
panel.yap(new TasiKomutu(depo, "KRG-1001", "B3"));  // Client → Invoker</pre>
          <p class="exam"><b>İstek sıraya, kayda, geri almaya girecekse</b> → Command · <b>Command, ConcreteCommand, Invoker, Receiver, Client</b> · çağıran alıcıyı <u>tanımaz</u> · geri alma <u>ters sırayla</u></p>
        </article>
        <article class="card sum-files">
          <h3>Java kodları</h3>
          <p>Çalıştırılabilir örnekler proje klasöründe:</p>
          <pre class="mini-code">java/command/sorun      → dizgi + switch; ikinci geri al boşa, gece 02:00’de çöker
java/command/cozum      → komutlar: geçmiş yığını ve gece kuyruğu
java/command/akis/...   → Canlı Akış: gun · gece
java/command/tezgah/... → aynı oturum: kalipsiz · komutlu
java/command/genislet   → MakroKomut: üç yükleme, tek geri al</pre>
          <p>Derleyip çalıştırmak için <code>java/README.md</code> dosyasına bakın.</p>
        </article>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-print]').addEventListener('click', () => window.print());
    const diag = new DP.ClassDiagram(el.querySelector('.sum-diag'), CM.gofDiagram({}), { roles: CM.roles, roleTags: false, mode: 'generic' });
    diag.svg.classList.add('is-compact');
    return { destroy() {} };
  };

  // ================================================================== kayıt
  DP.register({
    id: 'command',
    name: 'Command',
    tr: 'Komut',
    category: 'behavioral',
    roleOf: CM.roleOf,
    initialState: () => ({
      view: 'stage',
      showCode: true,
      preset: 'gun',
      tz: { design: 'komut', ops: CM.GUN.slice() },
      makroUnlocked: false,
      ext: {},
      quiz: { results: {}, match: false },
    }),
    scenes: [
      { id: 'giris', title: 'Giriş', mount: CM.scenes.intro },
      { id: 'sorun', title: 'Sorun', mount: CM.scenes.problem },
      { id: 'cozum', title: 'Çözüm', mount: CM.scenes.solution },
      { id: 'akis', title: 'Canlı Akış', mount: CM.scenes.flow, star: true },
      { id: 'tezgah', title: 'Komut Tezgâhı', mount: CM.scenes.counter, star: true },
      { id: 'yapi', title: 'Yapı (UML)', mount: CM.scenes.structure },
      { id: 'genislet', title: 'Genişlet', mount: CM.scenes.extend },
      { id: 'gercek', title: 'Gerçek Dünya', mount: CM.scenes.realworld },
      { id: 'quiz', title: 'Quiz', mount: CM.scenes.quiz },
      { id: 'ozet', title: 'Özet', mount: CM.scenes.summary },
    ],
  });
})();
