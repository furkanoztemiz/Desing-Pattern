/*
 * Proxy — sahneler (3/3): Yapı, Genişlet, Gerçek Dünya, Quiz, Özet ve kalıp kaydı
 */
(function () {
  'use strict';
  const PX = DP.px;
  const { h } = DP;
  const kit = DP.kit;
  const ui = PX.ui;
  const md = PX.md;
  const C = PX.code;
  const EX = PX.ext;

  // ================================================================== 6. YAPI
  const ROLE_TEXT = {
    client: 'Yalnızca <b>Subject</b> arayüzünü tanır; karşısındakinin vekil mi gerçek nesne mi olduğunu <b>bilmez</b>.',
    subject: 'Gerçek nesnenin ve vekilin <b>ortak arayüzü</b>: vekil, gerçek nesnenin beklendiği her yerde kullanılabilir.',
    realSubject: 'Asıl işi yapan nesne; çoğu zaman <b>pahalı</b>, <b>uzak</b> ya da <b>korunması gereken</b> bir kaynak.',
    proxy: 'Gerçek nesneye bir <b>başvuru</b> tutar ve erişimi denetler: kim, ne zaman, ne sıklıkla. Gerekirse gerçek nesneyi <b>kendisi yaratır</b>.',
  };

  function classInfo(id) {
    switch (id) {
      case 'MusteriPaneli':
        return { role: 'client', file: 'MusteriPaneli.java', code: C.MusteriPaneli, mark: 'durum = servis.sorgula(takipNo);', points: ['Alanının tipi **TakipServisi**: vekil de gerçek servis de olabilir.', 'Denetim kodu yok: bağlantı, önbellek ve KVKK vekilin işi.', 'Yetki hatasını yakalayıp gösterir; denetlemez.'] };
      case 'TakipServisi':
        return { role: 'subject', file: 'TakipServisi.java', code: C.TakipServisi, mark: 'String sorgula(String takipNo);', points: ['Tek işlem: `sorgula(takipNo)`.', 'Vekil ve gerçek servis **aynı** arayüzü uygular: istemci farkı görmez.', 'Adapter’dan farkı: arayüz **değişmez**.'] };
      case 'GlobalShipTakip':
        return { role: 'realSubject', file: 'GlobalShipTakip.java', code: C.GlobalShipTakip, mark: 'public GlobalShipTakip() {', points: ['Oturum açmak 1200 ms; her sorgu 800 ms ve 25 kuruş.', 'Denetimden habersiz: yalnızca kendi işini yapar.', 'Dokunamayacağımız bir sınıf da olabilir (üçüncü taraf).'] };
      case 'TakipVekili':
        return { role: 'proxy', file: 'TakipVekili.java', code: C.TakipVekili, mark: 'gercek = new GlobalShipTakip();', points: ['`gercek` gerçek nesneye başvurudur; **ilk ihtiyaçta** yaratılır (sanal).', 'Koruma: `oturum.sahibi(takipNo)` · önbellek: `onbellek`.', 'İstemciye **aynı arayüzle** görünür; Main onu gerçek servisin yerine verir.'] };
      default:
        return null;
    }
  }

  PX.scenes.structure = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split' });
    const tools = h('div', { class: 'panel-tools' });
    const body = h('div', { class: 'scene-body cols-64' });
    const left = kit.panel('Yapı', { cls: 'panel-diagram', extra: tools });
    const right = kit.panel('Rol kartı <span class="panel-sub">· bir sınıfa tıklayın</span>', { cls: 'panel-side' });
    body.append(left.el, right.el);
    el.append(body);
    root.appendChild(el);

    const diagHost = h('div', { class: 'diag-host' });
    const legend = kit.umlLegend({ association: true, fmLabel: 'denetleyip gerçek nesneye devreden işlem' });
    left.body.append(diagHost, legend);
    const diagram = new DP.ClassDiagram(diagHost, PX.gofDiagram({ notes: true }), {
      roles: PX.roles,
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
      const r = PX.roles[info.role];
      infoTop.innerHTML = `
        <div class="info-role rc rc-${r.color}"><span class="info-dot"></span><b>${r.en}</b> · ${r.tr}</div>
        <div class="info-name rc rc-${r.color}">${DP.esc(id)}</div>
        <p class="info-desc">${ROLE_TEXT[info.role]}</p>
        <ul class="info-points">${info.points.map((p) => `<li>${md(p)}</li>`).join('')}</ul>`;
      const cv = new DP.CodeView(infoCode, { files: [{ name: info.file, code: info.code }], roleOf: PX.roleOf, special: PX.special, compact: true });
      cv.mark(info.file, info.mark, 'focus');
      DP.flash(infoTop, 'is-pop');
    }

    function showOverview() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">Üç rol, bir araya giren</div>
        <div class="role-list">
          ${['subject', 'realSubject', 'proxy']
            .map((k) => `<div class="role-row rc rc-${PX.roles[k].color}"><span class="info-dot"></span><div><b>${PX.roles[k].en}</b> · ${PX.roles[k].tr}<div class="role-desc">${ROLE_TEXT[k]}</div></div></div>`)
            .join('')}
        </div>
        <p class="info-desc">Vekili <b>Client</b>’a, gerçek nesnenin yerine Main (ya da bir fabrika) verir. Üstteki <b>Genel (GoF)</b> düğmesi kitaptaki adları gösterir.</p>`;
    }

    function showKinds() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">Vekil türleri (GoF)</div>
        <table class="cmp px-cmp">
          <thead><tr><th>Tür</th><th>Neyi denetler?</th><th>Örnek</th></tr></thead>
          <tbody>
            <tr><td><b>Uzak</b> (remote)</td><td>Nesne başka bir makinede</td><td>RMI vekili (stub)</td></tr>
            <tr><td><b>Sanal</b> (virtual)</td><td>Pahalı nesne <b>ne zaman</b> yaratılır</td><td><code>gercek == null</code> · JPA <code>LAZY</code></td></tr>
            <tr><td><b>Koruma</b> (protection)</td><td><b>Kim</b> erişebilir</td><td>KVKK denetimi</td></tr>
            <tr><td><b>Akıllı başvuru</b></td><td>Erişirken ek iş</td><td>önbellek, sayaç, kilit, kayıt</td></tr>
          </tbody>
        </table>
        <p class="info-desc">${md('`TakipVekili` üçünü birden yapıyor: koruma, önbellek (akıllı başvuru) ve sanal. Hangisinin ne işe yaradığını **Vekil Tezgâhı**’nda tek tek açıp kapatabilirsiniz.')}</p>`;
      DP.flash(infoTop, 'is-pop');
    }

    const STEPS = [
      { t: 'Genel bakış', x: 'Üç rol ve bir istemci. [[TakipVekili]] ile [[GlobalShipTakip]] **aynı arayüzü** uygular; vekil ayrıca gerçek nesneye bir **başvuru** tutar (`gercek`). İstemci yalnızca arayüzü görür.', info: null },
      { t: 'Subject — Konu', x: '[[TakipServisi]] istemcinin tanıdığı tek tür. Gerçek nesne de vekil de onu uygular; bu yüzden vekil **fark edilmeden** araya girebilir.', info: 'TakipServisi', focus: { classes: ['TakipServisi'], edges: ['uses'] } },
      { t: 'RealSubject — Gerçek konu', x: '[[GlobalShipTakip]] asıl işi yapar: uzakta, yavaş ve ücretli. Denetimden habersizdir; ona dokunmadık.', info: 'GlobalShipTakip', focus: { classes: ['GlobalShipTakip'], edges: ['r-real'] } },
      { t: 'Proxy — Vekil', x: '[[TakipVekili]] aynı arayüzü uygular, gerçek nesneyi `gercek` alanında tutar ve her çağrıyı **iletmeden önce** denetler: `oturum` (koruma), `onbellek` (akıllı başvuru).', info: 'TakipVekili', focus: { classes: ['TakipVekili'], members: [['TakipVekili', 'gercek'], ['TakipVekili', 'onbellek'], ['TakipVekili', 'oturum']], edges: ['r-vekil'] } },
      { t: 'Vekil gerçek nesneyi yönetir', x: 'Oka dikkat: vekil, **arayüze değil gerçek sınıfa** bağlı ve onu nottaki gibi **kendisi yaratıyor**. Decorator içteki nesneyi dışarıdan alır ve yalnızca arayüzü tanır; Proxy ise gerçek nesnenin yaşam döngüsünü (ne zaman yaratılacağını) yönetir.', info: 'TakipVekili', focus: { classes: ['TakipVekili', 'GlobalShipTakip'], edges: ['gercek'], members: [['TakipVekili', 'gercek']] } },
      { t: 'Vekil türleri', x: 'GoF dört tür sayar: **uzak**, **sanal**, **koruma** ve **akıllı başvuru**. Yapı aynı; değişen, vekilin denetlediği şey. Bizim vekil üçünü bir arada yapıyor.', kinds: true, focus: { classes: ['TakipVekili'], members: [['TakipVekili', 'sorgula']] } },
      { t: 'Client — İstemci', x: '[[MusteriPaneli]] alanını `TakipServisi` tipinde tutar. Vekili ona **Main** verir: `TakipServisi aliServisi = new TakipVekili(ali);` — değişkenin tipi arayüz, nesne vekil. İstemci kodu, vekil olsa da olmasa da aynıdır.', info: 'MusteriPaneli', focus: { classes: ['MusteriPaneli'], edges: ['uses'] } },
    ];

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: () => 6200,
      onChange: (i) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        diagram.select(null);
        if (s.focus) diagram.focus(s.focus);
        else diagram.clearFocus();
        if (s.kinds) showKinds();
        else if (s.info) showInfo(s.info);
        else showOverview();
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };

  // ================================================================== 7. GENİŞLET: yeni istemci (SMS), sıfır denetim kodu
  PX.scenes.extend = function (root, ctx) {
    const S = ctx.state;
    S.ext = S.ext || {};
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-50' });
    const left = kit.panel('Görev: SmsBildirim', { cls: 'panel-code panel-ex' });
    const right = kit.panel('İstek hattı', { cls: 'panel-side px-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    // ---- sol (adım 0): alıştırma
    const exBox = h('div', { class: 'ex-box' });
    const task = h('div', {
      class: 'task-card',
      html: md('📩 **Müşteri hizmetleri:** “Gece çalışan bir iş, müşterilere gönderi durumunu **SMS** ile bildirsin.”\nKural: SMS sınıfı bağlantı, önbellek ya da KVKK kodu **yazmayacak**; hepsini vekilden alacak.'),
    });
    const ex = kit.blankExercise({
      files: [
        { name: 'SmsBildirim.java', code: EX.exercise, badge: 'YENİ' },
        { name: 'Main.java · ek', code: EX.exerciseMain },
      ],
      answers: { 1: 'TakipServisi', 2: 'sorgula', 3: 'SecurityException', 4: 'TakipVekili', 5: 'zeynep' },
      hints: {
        1: 'İstemci yalnızca **arayüzü** tanır: alanın tipi ne olmalı?',
        2: 'Arayüzdeki tek işlemin adı?',
        3: 'Koruma vekili yetkisiz isteği hangi istisnayla reddediyor?',
        4: 'SMS işine gerçek servis yerine **hangi nesneyi** veriyoruz?',
        5: 'Vekil kimin oturumunu denetleyecek? (SMS’i alan müşteri)',
      },
      choices: ['TakipServisi', 'GlobalShipTakip', 'TakipVekili', 'sorgula', 'goster', 'SecurityException', 'RuntimeException', 'zeynep', 'ali', 'Musteri'],
      roleOf: PX.roleOf,
      special: PX.special,
      state: S.ext,
      doneText: '<b class="ok">✔ Derleme başarılı!</b> SMS işi hazır.',
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
    const runBox = h('div', { class: 'px-runbox', hidden: true });
    const runCode = h('div', { class: 'px-cv' });
    const runConsole = h('div', { class: 'console px-console' });
    runBox.append(runCode, runConsole);
    left.body.append(exBox, runBox);
    const runCv = new DP.CodeView(runCode, { roleOf: PX.roleOf, special: PX.special });

    // ---- sağ: istek hattı + etki
    const viewHost = h('div', { class: 'px-view' });
    const impact = h('div', { class: 'px-extra' });
    right.body.append(viewHost, impact);
    const stage = new PX.Hat(viewHost, { minH: 500 });

    const r = PX.run(EX.prog);
    const lane0 = { ist: 'sms', m: 'zeynep', screen: null };
    const vek0 = { koruma: 'on', onbellek: 'on', sanal: 'on', oturum: 'Zeynep', cache: [], gercek: false };
    const last = r.iz[r.iz.length - 1];
    const fin = {
      mode: 'vekil',
      lanes: [{ ist: 'sms', m: 'zeynep', screen: { no: last.no, kind: 'kvkk' } }],
      vekil: Object.assign({}, vek0, { cache: ['KRG-1003'], gercek: true }),
      gs: { oturum: r.stats.oturum, sorgu: r.stats.sorgu, sessions: ['SMS/Zeynep'], live: [true] },
    };
    const STEPS = [
      {
        t: 'Görev: SmsBildirim',
        x: 'Boşluklara tıklayıp doğru parçaları seçin. İpucu: yeni istemci de yalnızca `TakipServisi`’ni tanıyacak; denetimleri vekil yapacak.',
        st: { mode: 'vekil', lanes: [lane0], vekil: vek0, gs: { oturum: 0, sorgu: 0 }, banner: { text: 'Yeni istemci: **tek satır denetim kodu** yazmadan korunacak mı?' } },
      },
      {
        t: 'Derlendi: üç SMS',
        x: `[[SmsBildirim]] üç istek yaptı: ilk ${'KRG-1003'} GlobalShip’e gitti, aynı iş tekrar çalışınca **önbellekten** döndü, yanlış alıcıya (KRG-1001) gidecek SMS **kapıda kaldı**. Toplam ${r.stats.sorgu} sorgu.`,
        st: Object.assign({}, fin, { banner: { text: `✓ 3 SMS → **${r.stats.sorgu} sorgu**, 1 engellendi`, tone: 'ok' } }),
      },
      {
        t: 'Sıfır denetim kodu',
        x: '[[SmsBildirim]] bağlantıdan, önbellekten ve KVKK’dan habersiz; yine de üçünden yararlanıyor. [[TakipVekili]], [[GlobalShipTakip]] ve öbür istemcilere dokunulmadı.',
        st: Object.assign({}, fin, { banner: { text: 'Denetim **vekilde**: yeni istemci hepsini hazır buldu.', tone: 'ok' } }),
      },
      {
        t: 'Kalıpsız olsaydı?',
        x: 'Kalıpsız sürümde SMS işi bağlantı, önbellek ve KVKK kodunu üçüncü kez **kopyalamak** zorundaydı; birini unutsa yanlış alıcıya adres giderdi. Vekille 0 satır. **SMS gece işi** artık **Vekil Tezgâhı**’nda da açık.',
        st: Object.assign({}, fin, { banner: { text: 'Yeni istemci: kalıpsız **3 denetim kopyası**, vekille **0**.', tone: 'ok' } }),
      },
    ];

    function renderLeft(i) {
      exBox.hidden = i >= 1;
      runBox.hidden = i < 1;
      left.head.querySelector('.panel-title').innerHTML = i >= 1 ? 'Yeni istemci: <span class="ver">SmsBildirim</span>' : 'Görev: SmsBildirim';
      if (i < 1) return;
      // önce konsol (yüksekliği değişir), sonra koddaki işaret
      PX.renderConsole(runConsole, '$ javac *.java && java Main', r.lines.map((l) => PX.consoleLine(l, { kvkkOk: true, kvkkNote: l.k === 'kvkk' ? 'vekil engelledi' : null })));
      runCv.setFiles(
        [
          { name: 'SmsBildirim.java', code: C.SmsBildirim, badge: 'YENİ' },
          { name: 'Main.java', code: EX.Main },
        ],
        { active: i === 1 ? 'Main.java' : 'SmsBildirim.java', keepActive: false }
      );
      if (i === 1) runCv.mark('Main.java', 'TakipServisi servis = new TakipVekili(zeynep);', 'focus');
      else runCv.mark('SmsBildirim.java', 'metin = servis.sorgula(takipNo);', 'focus');
    }

    function renderImpact(i, animate) {
      if (i === 0) {
        impact.innerHTML = `<div class="impact-title">İpucu</div><p>${md('Paneldeki `goster` metoduna bakın: `servis.sorgula(…)` ve `catch (SecurityException e)`. SMS işi de aynı şekilde konuşacak; kim olduğunu vekile `Main` söyleyecek.')}</p>`;
      } else if (i === 1) {
        impact.innerHTML = `
          <div class="impact-title ok">✔ Derleme başarılı · yeni istemci</div>
          <ul class="filelist"><li><span class="cv-dot rc rc-${PX.roleOf('SmsBildirim')}"></span>SmsBildirim.java <span class="cv-badge is-new">YENİ</span></li></ul>`;
      } else if (i === 2) {
        impact.innerHTML = `
          <div class="metrics">
            <div class="metric is-good"><div class="m-val">0</div><div class="m-label">değişen sınıf</div></div>
            <div class="metric is-good"><div class="m-val">0</div><div class="m-label">satır denetim kodu</div></div>
            <div class="metric"><div class="m-val">3</div><div class="m-label">hazır denetim</div></div>
          </div>`;
      } else {
        impact.innerHTML = `
          <table class="cmp px-cmp">
            <thead><tr><th>Yeni istemci</th><th>Kalıpsız</th><th>Vekil</th></tr></thead>
            <tbody>
              <tr><td>Denetim kodu</td><td class="bad">3 kopya (bağlantı, önbellek, KVKK)</td><td class="ok">0 satır</td></tr>
              <tr><td>Biri unutulursa</td><td class="bad">Sızıntı ya da fatura</td><td class="ok">Unutulamaz</td></tr>
              <tr><td>Değişen sınıf</td><td>0</td><td class="ok">0</td></tr>
            </tbody>
          </table>
          <div class="px-go"><button class="btn btn-primary btn-sm" type="button" data-go>🛡️ Vekil Tezgâhı’nda dene →</button></div>`;
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
          S.smsUnlocked = true;
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
  const RW = PX.rw;
  const TABS = [
    {
      tab: 'Dinamik vekil',
      title: '`java.lang.reflect.Proxy` — vekil sınıfını çalışma anında üretmek',
      intro: 'Her arayüz için elle vekil yazmak zorunda değiliz: `Proxy.newProxyInstance` verilen arayüzleri uygulayan bir sınıfı **çalışma anında** üretir; her çağrı tek bir **işleyiciye** (`InvocationHandler`) düşer. Spring’in `@Transactional`, `@Cacheable` gibi açıklamaları da böyle vekillerle çalışır.',
      map: [
        ['subject', 'TakipServisi', '`TakipServisi` (arayüz)'],
        ['realSubject', 'GlobalShipTakip', '`gercek` (lambda)'],
        ['proxy', 'TakipVekili', 'Üretilen `$Proxy0` + işleyici (lambda)'],
        ['client', 'MusteriPaneli', '`vekil.sorgula(…)` diyen kod'],
      ],
      note: 'İşleyici her çağrıyı görür: metodun adını, argümanları. Buradaki işleyici bir **önbellek** vekili: aynı takip numarası ikinci kez sorulunca gerçek nesneye gitmiyor. Çıktılar Java 21 ile alındı.',
      roles: { TakipServisi: 'subject', Proxy: 'proxy' },
      file: 'DinamikVekil.java',
      code: RW.dinamik,
      options: RW.dinamikOpts,
      cmd: '$ java DinamikVekil',
    },
    {
      tab: 'RMI: uzak vekil',
      title: 'Java RMI — başka makinedeki nesnenin vekili',
      intro: 'Uzak vekil, ağın öbür ucundaki nesneyi **yerel bir nesneymiş gibi** kullandırır. RMI’da `lookup` bir **stub** döndürür: çağrınızın parametrelerini paketleyip ağdan gönderen, cevabı geri çeviren bir vekil. Java 5’ten beri bu stub’lar da dinamik vekildir.',
      map: [
        ['subject', 'TakipServisi', '`StokServisi extends Remote`'],
        ['realSubject', 'GlobalShipTakip', 'Malatya deposundaki sunucu nesnesi'],
        ['proxy', 'TakipVekili', 'RMI stub (`lookup` sonucu)'],
      ],
      note: 'Bu parça bir sunucu ve ağ gerektirdiği için burada çalıştırılmadı. Uzaklık tamamen gizlenemez: her metot `RemoteException` bildirmek zorunda; ağ koptuğunda istemci bunu bilmeli.',
      roles: { StokServisi: 'subject' },
      file: 'StokIstemcisi.java',
      code: RW.rmi,
      mark: 'StokServisi stok = (StokServisi) kayit.lookup("stok");',
    },
    {
      tab: 'JPA: sanal vekil',
      title: 'JPA / Hibernate — tembel yükleme vekilleri',
      intro: 'Veritabanı nesneleri pahalıdır. `getReference` veritabanına gitmeden bir **vekil** döndürür; ilk alana erişildiğinde `SELECT` çalışır. `FetchType.LAZY` ilişkiler de vekille gelir. Bu, GoF’un **sanal vekili**dir.',
      map: [
        ['subject', 'TakipServisi', '`Gonderi` (varlık sınıfı)'],
        ['realSubject', 'GlobalShipTakip', 'Veritabanından yüklenen `Gonderi`'],
        ['proxy', 'TakipVekili', 'Hibernate’in ürettiği `Gonderi$HibernateProxy$…`'],
      ],
      note: 'JPA, JDK’nın değil Jakarta EE’nin parçası; bu parça veritabanı gerektirdiği için burada çalıştırılmadı. Sık görülen hata: oturum kapandıktan sonra vekile ilk kez erişmek → `LazyInitializationException`.',
      roles: { Gonderi: 'subject' },
      file: 'GonderiDeposu.java',
      code: RW.jpa,
      mark: 'Gonderi g = em.getReference(Gonderi.class, 1002L);',
    },
    {
      tab: 'Karıştırmayın!',
      title: 'Proxy, Decorator, Adapter, Facade',
      intro: 'Dördü de bir nesnenin önüne başka bir nesne koyar. Fark: **arayüzü** değiştirip değiştirmedikleri ve **ne için** araya girdikleri.',
      extraHtml: `<table class="cmp cmp-3">
        <thead lang="en"><tr><th></th><th>Proxy</th><th>Decorator</th><th>Adapter</th><th>Facade</th></tr></thead>
        <tbody>
          <tr><td>Arayüz</td><td>Aynı</td><td>Aynı</td><td>Farklı → beklenen</td><td>Yeni, sade</td></tr>
          <tr><td>Amaç</td><td>Erişimi <b>denetlemek</b></td><td>Sorumluluk <b>eklemek</b></td><td><b>Uydurmak</b></td><td>Alt sistemi <b>gizlemek</b></td></tr>
          <tr><td>Arkadaki nesneyi kim kurar?</td><td>Çoğu zaman <b>vekil</b></td><td>İstemci (katmanlar)</td><td>Dışarıdan verilir</td><td>Cephe</td></tr>
          <tr><td>Arkadaki</td><td>Tek gerçek nesne</td><td>Tek nesne (katmanlanır)</td><td>Tek uyarlanan</td><td>Birçok sınıf</td></tr>
        </tbody></table>`,
      note: 'GoF: Decorator nesneye sorumluluk ekler, Proxy ise nesneye **erişimi** denetler. Yapıları çok benzeyebilir; bir koruma vekili tıpkı bir dekoratör gibi yazılabilir. Belirleyici olan amaç.',
      roles: { TakipServisi: 'subject', TakipVekili: 'proxy' },
      special: PX.special,
      file: 'Karsilastirma.java',
      code: () => `// Proxy: aynı arayüz; gerçek nesneyi gerekince kendisi yaratır, erişimi denetler
TakipServisi servis = new TakipVekili(ali);

// Decorator: aynı arayüz; istemci katmanları kendisi kurar, her katman iş ekler
KargoHizmeti hizmet = new Sigorta(new Ekspres(new StandartKargo()));

// Adapter: FARKLI bir arayüzü beklenen arayüze uydurur
KargoFirmasi firma = new GlobalShipAdaptoru(new GlobalShipApi());

// Facade: karmaşık bir alt sisteme tek, sade bir kapı
gonderiCephesi.gonder(siparis);`,
      mark: 'TakipServisi servis = new TakipVekili(ali);',
    },
  ];

  PX.scenes.realworld = (root, ctx) =>
    kit.realWorldScene(root, ctx, {
      tabs: TABS,
      roles: PX.roles,
      roleOf: PX.roleOf,
      fmLabel: 'denetim',
      footText: (i) =>
        i === 3
          ? 'Yapı benziyorsa **amaca** bakın: Proxy erişimi denetler, Decorator iş ekler, Adapter uydurur, Facade sadeleştirir.'
          : i === 0
          ? 'Vekil sınıfını kimse yazmadı: JDK çalışma anında üretti. Sağdaki düğmelerle önbelleğin etkisini görün.'
          : 'Vekilin arkasındaki nesne bu kez uzakta ya da veritabanında; istemci kodu yine yerel bir nesneyle konuşur gibi.',
    });

  // ================================================================== 9. QUIZ
  const Q = [
    {
      type: 'mcq',
      q: 'Proxy kalıbının **temel amacı** (GoF) nedir?',
      options: ['Bir nesneye erişimi denetlemek için onun yerine geçen bir vekil sağlamak', 'Bir nesneye çalışma anında ek sorumluluklar eklemek', 'Uyumsuz bir arayüzü istemcinin beklediği arayüze dönüştürmek', 'Karmaşık bir alt sisteme tek bir giriş noktası sunmak'],
      answer: 0,
      explain: 'GoF: “Bir nesneye erişimi denetlemek için onun yerine geçen bir vekil (surrogate) sağla.” Diğerleri Decorator, Adapter ve Facade’ın amaçlarıdır.',
    },
    {
      type: 'line',
      q: 'Bu sınıfta gerçek nesnenin **ihtiyaç anında** yaratıldığı satıra tıklayın.',
      codeName: 'TakipVekili.java',
      code: PX.plain(C.TakipVekili),
      answer: 'gercek = new GlobalShipTakip();',
      explain: 'Sanal vekil: `gercek` ilk sorguya kadar null kalır; GlobalShip’te oturum ancak gerçekten gerektiğinde açılır.',
    },
    {
      type: 'mcq',
      q: 'Başka bir makinedeki nesneyi **yerel bir nesneymiş gibi** kullanmayı sağlayan vekil türü hangisidir?',
      options: ['Sanal vekil', 'Koruma vekili', 'Uzak vekil', 'Önbellek vekili'],
      answer: 2,
      explain: 'Uzak vekil (remote proxy) çağrıyı paketleyip ağdan gönderir; Java RMI’daki stub buna örnektir.',
    },
    {
      type: 'mcq',
      q: 'Ali paneli **beş kez** yeniliyor (hep KRG-1001). Önbellekli ve sanal bir vekil arkasında GlobalShip’e kaç oturum ve kaç sorgu gider?',
      options: ['0 oturum, 0 sorgu', '1 oturum, 1 sorgu', '1 oturum, 5 sorgu', '5 oturum, 5 sorgu'],
      answer: 1,
      explain: 'İlk sorguda oturum açılır ve GlobalShip’e bir kez sorulur; sonraki dört yenileme önbellekten döner.',
    },
    {
      type: 'line',
      q: 'Bu programda Ali’nin paneline **vekilin verildiği** satıra tıklayın.',
      codeName: 'Main.java',
      code: PX.plain(C.Main),
      answer: 'TakipServisi aliServisi = new TakipVekili(ali);',
      explain: 'Vekil, gerçek servisin beklendiği yere konur. Panel bunu bilmez; yalnızca bir TakipServisi alır.',
    },
    {
      type: 'mcq',
      q: 'Proxy’yi Decorator’dan ayıran en önemli fark nedir?',
      options: ['Vekil erişimi denetler, gerçek nesneyi çoğu zaman kendisi yaratır; Decorator sorumluluk ekler', 'Vekil gerçek nesneden farklı bir arayüz sunar; Decorator ise aynı arayüzü korur', 'Decorator yalnızca uzak nesnelerle çalışır; Proxy ise yerel nesnelere sorumluluk ekler', 'Aralarında fark yoktur; ikisi de aynı arayüzü uygular ve gerçek nesneyi sarar'],
      answer: 0,
      explain: 'Yapıları benzer; ikisi de aynı arayüzü uygular ve bir nesneye başvuru tutar. Fark amaçta ve gerçek nesnenin yaşam döngüsünü kimin yönettiğinde.',
    },
    {
      type: 'mcq',
      q: 'Vekil neden gerçek nesneyle **aynı arayüzü** uygular?',
      options: ['Arayüz çağrıları daha hızlı çalışır; önbellekli vekil böylece hızlansın diye', 'Gerçek nesnenin beklendiği her yerde, istemci farkı görmeden kullanılabilsin diye', 'Java, bir sınıfı saran her sınıfın onunla aynı arayüzü uygulamasını zorunlu kılar', 'Gerçek nesneyi kalıtımla genişletip metotlarını override edebilsin diye'],
      answer: 1,
      explain: 'Şeffaf yer değiştirme: Main istemciye gerçek servis yerine vekili verir; istemci kodu değişmez.',
    },
    {
      type: 'mcq',
      q: 'Java’da hangisi vekil sınıfını **çalışma anında** üretir?',
      options: ['`Arrays.asList(new String[] {"KRG-1001", "KRG-1002"})`', '`new BufferedReader(new FileReader("takip.txt"), 8192)`', '`Proxy.newProxyInstance(yükleyici, arayüzler, işleyici)`', '`Collections.newSetFromMap(new ConcurrentHashMap<>())`'],
      answer: 2,
      explain: '`asList` bir Adapter, `BufferedReader` bir Decorator, `newSetFromMap` bir Bridge örneği. `java.lang.reflect.Proxy` verilen arayüzler için vekil sınıfını çalışma anında üretir.',
    },
  ];

  PX.scenes.quiz = (root, ctx) =>
    kit.quizScene(root, ctx, {
      questions: Q,
      roleOf: PX.roleOf,
      special: PX.special,
      patternName: 'Proxy',
      match: {
        items: ['TakipServisi', 'GlobalShipTakip', 'TakipVekili', 'MusteriPaneli', 'MobilUygulama', 'SmsBildirim'].map((id) => ({ id, label: id })),
        buckets: ['subject', 'realSubject', 'proxy', 'client'].map((k) => ({ id: k, title: PX.roles[k].en, sub: PX.roles[k].tr, color: PX.roles[k].color })),
        answer: PX.classRoles,
        hint: 'Altı sınıfı dört role yerleştirin. Takıldığınızda **Cevapları göster** düğmesi var.',
      },
    });

  // ================================================================== 10. ÖZET
  PX.scenes.summary = function (root, ctx) {
    const at = DP.catalog.findIndex((p) => p.id === 'proxy');
    const next = DP.catalog.slice(at + 1).find((p) => p.ready && DP.patterns[p.id]);
    const el = h('div', { class: 'scene scene-summary' });
    el.innerHTML = `
      <div class="sum-head">
        <div>
          <div class="chips"><span class="chip chip-cat is-struct">Yapısal · Structural</span><span class="chip">Diğer adı: Surrogate</span></div>
          <h1>Proxy — Özet</h1>
        </div>
        <div class="sum-actions no-print">
          <button class="btn btn-ghost" type="button" data-print>🖨 Yazdır / PDF</button>
          <a class="btn btn-ghost" href="#/flyweight/ozet">← Flyweight özeti</a>
          <a class="btn btn-ghost" href="#/">Tüm kalıplar</a>
          ${next ? `<a class="btn btn-primary" href="#/${next.id}">Sıradaki kalıp: ${DP.esc(next.name)} →</a>` : ''}
        </div>
      </div>
      <div class="sum-grid">
        <article class="card sum-intent">
          <h3>Amaç</h3>
          <p>Bir nesneye <b>erişimi denetlemek</b> için onun yerine geçen bir <b>vekil</b> sağla.</p>
          <div class="sum-formula"><code>proxy.request()</code> → <code>[denetim] <span class="tk-prx">realSubject</span>.request()</code> <span>(aynı arayüz; gerçek nesne gerekince yaratılır)</span></div>
        </article>
        <article class="card sum-uml"><h3>Yapı (GoF)</h3><div class="sum-diag"></div></article>
        <article class="card">
          <h3>İstemcide denetim ↔ Vekil</h3>
          <table class="cmp sg-sum-cmp">
            <thead lang="en"><tr><th></th><th>Kalıpsız</th><th>Proxy</th></tr></thead>
            <tbody>
              <tr><td>Denetim kodu</td><td class="bad">Her istemcide</td><td class="ok">Tek sınıfta</td></tr>
              <tr><td>Yeni istemci</td><td class="bad">Kopyala</td><td class="ok">0 satır</td></tr>
              <tr><td>Unutulan denetim</td><td class="bad">Sızıntı</td><td class="ok">Olamaz</td></tr>
              <tr><td>Gerçek nesne</td><td>Dokunulmaz</td><td>Dokunulmaz</td></tr>
            </tbody>
          </table>
        </article>
        <article class="card">
          <h3>Katılımcılar ve türler</h3>
          <ul class="sum-roles">
            <li>${ui.roleChip('subject')}<span>ortak arayüz</span></li>
            <li>${ui.roleChip('realSubject')}<span>asıl iş</span></li>
            <li>${ui.roleChip('proxy')}<span>denetler, gerekince yaratır</span></li>
          </ul>
          <p class="px-kinds"><b>Uzak</b> · <b>Sanal</b> · <b>Koruma</b> · <b>Akıllı başvuru</b> (önbellek, sayaç, kilit)</p>
        </article>
        <article class="card sum-pros">
          <h3>Artıları</h3>
          <ul>
            <li>Denetim <b>tek yerde</b>; istemci kodu değişmez</li>
            <li>Pahalı nesne <b>gerekince</b> yaratılır</li>
            <li>Gerçek nesneye <b>dokunmadan</b> erişim kuralı eklenir</li>
            <li>Yeni istemciler denetimi hazır bulur</li>
          </ul>
        </article>
        <article class="card sum-cons">
          <h3>Eksileri</h3>
          <ul>
            <li>Ek bir <b>dolaylama</b>; ilk çağrı gecikebilir (sanal)</li>
            <li>Önbellek <b>bayatlayabilir</b>: ne zaman yenilenecek?</li>
            <li>Uzaklık tam gizlenemez (<code>RemoteException</code>)</li>
          </ul>
        </article>
        <article class="card">
          <h3>İlişkili kalıplar</h3>
          <ul>
            <li><b>Decorator:</b> benzer yapı; ama iş ekler, katmanları istemci kurar.</li>
            <li><b>Adapter:</b> araya girer ama arayüzü <i>değiştirir</i>.</li>
            <li><b>Facade:</b> birçok sınıfın önüne sade bir kapı koyar.</li>
          </ul>
        </article>
        <article class="card sum-tip">
          <h3>Sınav ipuçları</h3>
          <pre class="mini-code">interface TakipServisi { String sorgula(String no); }   // Subject
class GlobalShipTakip implements TakipServisi { … }      // RealSubject
class TakipVekili implements TakipServisi {              // Proxy
    private GlobalShipTakip gercek;
    public String sorgula(String no) {
        // denetim: koruma, önbellek…
        if (gercek == null) gercek = new GlobalShipTakip();
        return gercek.sorgula(no);
    }
}</pre>
          <p class="exam"><b>Erişim denetimi + aynı arayüz</b> → Proxy · <b>Subject, RealSubject, Proxy</b> · vekil gerçek nesneye <u>başvuru tutar</u> ve onu çoğu zaman <u>kendisi yaratır</u></p>
        </article>
        <article class="card sum-files">
          <h3>Java kodları</h3>
          <p>Çalıştırılabilir örnekler proje klasöründe:</p>
          <pre class="mini-code">java/proxy/sorun      → denetim istemcilerde; mobilde KVKK unutuldu
java/proxy/cozum      → TakipVekili: koruma, önbellek, sanal
java/proxy/akis/...   → Canlı Akış: ali · ayse
java/proxy/tezgah/... → meraklı müşteri: vekilsiz · vekilli
java/proxy/genislet   → SmsBildirim: sıfır denetim kodu</pre>
          <p>Derleyip çalıştırmak için <code>java/README.md</code> dosyasına bakın.</p>
        </article>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-print]').addEventListener('click', () => window.print());
    const diag = new DP.ClassDiagram(el.querySelector('.sum-diag'), PX.gofDiagram({}), { roles: PX.roles, roleTags: false, mode: 'generic' });
    diag.svg.classList.add('is-compact');
    return { destroy() {} };
  };

  // ================================================================== kayıt
  DP.register({
    id: 'proxy',
    name: 'Proxy',
    tr: 'Vekil',
    category: 'structural',
    roleOf: PX.roleOf,
    initialState: () => ({
      view: 'stage',
      showCode: true,
      preset: 'ali',
      tz: { trafik: 'merak', vekil: true, koruma: true, onbellek: true, sanal: true },
      smsUnlocked: false,
      ext: {},
      quiz: { results: {}, match: false },
    }),
    scenes: [
      { id: 'giris', title: 'Giriş', mount: PX.scenes.intro },
      { id: 'sorun', title: 'Sorun', mount: PX.scenes.problem },
      { id: 'cozum', title: 'Çözüm', mount: PX.scenes.solution },
      { id: 'akis', title: 'Canlı Akış', mount: PX.scenes.flow, star: true },
      { id: 'tezgah', title: 'Vekil Tezgâhı', mount: PX.scenes.counter, star: true },
      { id: 'yapi', title: 'Yapı (UML)', mount: PX.scenes.structure },
      { id: 'genislet', title: 'Genişlet', mount: PX.scenes.extend },
      { id: 'gercek', title: 'Gerçek Dünya', mount: PX.scenes.realworld },
      { id: 'quiz', title: 'Quiz', mount: PX.scenes.quiz },
      { id: 'ozet', title: 'Özet', mount: PX.scenes.summary },
    ],
  });
})();
