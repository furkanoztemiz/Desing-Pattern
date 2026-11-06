/*
 * Mediator — sahneler (3/3): Yapı, Genişlet, Gerçek Dünya, Quiz, Özet ve kalıp kaydı
 */
(function () {
  'use strict';
  const MD = DP.med;
  const { h } = DP;
  const kit = DP.kit;
  const ui = MD.ui;
  const md = MD.md;
  const EX = MD.ext;
  /** Satır sonu yorumlarını atar (quiz'de cevabı ele vermesin) */
  const yorumsuz = (s) => s.replace(/ +\/\/ [^\n]*$/gm, '');
  const COZ = MD.filesFor(MD.COZUM);

  // ================================================================== 6. YAPI
  const ROLE_TEXT = {
    mediator: 'Öğelerin konuştuğu tek muhatap. Tek yöntemi var: <code>degisti(kaynak)</code>. Öğeler yalnızca bu arayüzü bilir.',
    concreteMediator: 'Öğeleri tanır ve etkileşimin <b>bütün kurallarını</b> uygular: kim değişince kim nasıl etkilenir, yalnızca burada yazılıdır.',
    colleague: 'Her öğenin üst sınıfı. Yöneticisine bir referans tutar; değişince <code>yonetici.degisti(this)</code> der. Öbür öğeleri <b>tanımaz</b>.',
    concreteColleague: 'Asıl öğe (şehir seçici, ağırlık alanı …). Kendi değerini tutar ve değişince haber verir; başka öğelerin işine karışmaz.',
    client: 'Formu yaratır ve öğeleri kullanır (kullanıcının tıklamaları). Kuralları bilmez.',
  };

  function classInfo(id) {
    switch (id) {
      case 'FormYoneticisi':
        return { role: 'mediator', file: 'FormYoneticisi.java', code: COZ.FormYoneticisi, mark: 'void degisti(FormOgesi kaynak);', points: ['Tek yöntem: `degisti(kaynak)`.', '`kaynak`: hangi öğenin değiştiği.', 'Öğeler yalnızca bu türü bilir.'] };
      case 'GonderiFormu':
        return {
          role: 'concreteMediator',
          file: 'GonderiFormu.java',
          code: COZ.GonderiFormu,
          mark: ['public void degisti(FormOgesi kaynak) {', 'ucret.goster(ucretHesapla());'],
          points: ['Öğeleri **kendisi** yaratır ve onlara `this` verir.', 'Dolap, hızlı teslimat ve ücret kuralı **yalnızca** burada.', '`final`: kurucuda `this` dışarı verildiği için alt sınıfa kapalı (`-Xlint:this-escape`).'],
        };
      case 'FormOgesi':
        return { role: 'colleague', file: 'FormOgesi.java', code: COZ.FormOgesi, mark: ['protected void degisti() {', 'yonetici.degisti(this);'], points: ['Yöneticiye bir referans; başka öğeye **hiç**.', '`degisti()`: alt sınıflar değişince bunu çağırır.', 'Soyut: tek başına bir öğe değil.'] };
      case 'SehirSecici':
      case 'AgirlikAlani':
      case 'SogukZincirKutusu':
      case 'TeslimatSecici':
      case 'UcretEtiketi':
        return {
          role: 'concreteColleague',
          file: id + '.java',
          code: COZ[id],
          mark: id === 'TeslimatSecici' ? ['public void ayarla(boolean hizli, boolean dolap) {', 'System.out.println("  teslimat: Standart");'] : id === 'UcretEtiketi' ? ['public void goster(int yeni) {', 'System.out.println("  ücret: " + tl + " TL");'] : { find: 'degisti();' },
          points: {
            SehirSecici: ['Seçimi tutar, değişince `degisti()`.', 'Dolabın varlığından habersiz.', 'Başka bir formda da aynen kullanılabilir.'],
            AgirlikAlani: ['Ağırlığı tutar, değişince `degisti()`.', 'Ücreti ya da seçenekleri bilmez.', 'Kuralı yöneticidedir.'],
            SogukZincirKutusu: ['İşaretlenince `degisti()`.', 'Dolabı kapatmak onun işi değil.', 'Sürüm 2.0’ın sorununu yaratan sınıf; artık tek satır.'],
            TeslimatSecici: ['Kullanıcı seçince `degisti()`.', '`ayarla(…)`: yönetici çağırır; seçici **yeniden haber vermez**.', 'Kapanan seçenek seçiliyse Standart’a döner.'],
            UcretEtiketi: ['Yalnızca gösterir: `goster(tl)`.', 'Ücreti yönetici hesaplar.', 'Hiç haber vermeyen (edilgen) bir öğe.'],
          }[id],
        };
      case 'Main':
        return { role: 'client', file: 'Main.java', code: COZ.Main, mark: ['GonderiFormu form = new GonderiFormu();', 'form.teslimat().sec("Dolap");'], points: ['Formu yaratır, öğeleri kullanır.', 'Kuralları bilmez.', 'Kalıpsız sürümdeki Main’in **aynısı**.'] };
      default:
        return null;
    }
  }

  MD.scenes.structure = function (root, ctx) {
    const S = ctx.state;
    const el = h('div', { class: 'scene scene-split' });
    const tools = h('div', { class: 'panel-tools' });
    const body = h('div', { class: 'scene-body cols-64' });
    const left = kit.panel('Yapı', { cls: 'panel-diagram', extra: tools });
    const right = kit.panel('Rol kartı <span class="panel-sub">· bir sınıfa tıklayın</span>', { cls: 'panel-side' });
    body.append(left.el, right.el);
    el.append(body);
    root.appendChild(el);

    const diagHost = h('div', { class: 'diag-host' });
    const legend = kit.umlLegend({ association: true, fmLabel: 'öğeden yöneticiye haber (degisti)' });
    left.body.append(diagHost, legend);
    const diagram = new DP.ClassDiagram(diagHost, MD.gofDiagram({ notes: true }), {
      roles: MD.roles,
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
      infoCode.classList.remove('med-info-col');
      if (!info) return;
      const r = MD.roles[info.role];
      infoTop.innerHTML = `
        <div class="info-role rc rc-${r.color}"><span class="info-dot"></span><b>${r.en}</b> · ${r.tr}</div>
        <div class="info-name rc rc-${r.color}">${DP.esc(id)}</div>
        <p class="info-desc">${ROLE_TEXT[info.role]}</p>
        <ul class="info-points">${info.points.map((p) => `<li>${md(p)}</li>`).join('')}</ul>`;
      const cv = new DP.CodeView(infoCode, { files: [{ name: info.file, code: info.code }], roleOf: MD.roleOf, special: MD.special, compact: true });
      cv.mark(info.file, info.mark, 'focus');
      DP.flash(infoTop, 'is-pop');
    }

    function showOverview() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">Kule ve uçaklar</div>
        <div class="role-list">
          ${['mediator', 'concreteMediator', 'colleague', 'concreteColleague', 'client']
            .map((k) => `<div class="role-row rc rc-${MD.roles[k].color}"><span class="info-dot"></span><div><b>${MD.roles[k].en}</b> · ${MD.roles[k].tr}<div class="role-desc">${ROLE_TEXT[k]}</div></div></div>`)
            .join('')}
        </div>`;
    }

    function showBag() {
      infoCode.innerHTML = '';
      const satir = (n) => `<tr><td>${n} öğe</td><td class="bad">${n * (n - 1)}</td><td class="ok">${2 * n}</td></tr>`;
      infoTop.innerHTML = `
        <div class="info-name">Bağ sayısı: ağ ↔ yıldız</div>
        <p class="info-desc">${md('Her öğe ötekilerin hepsini tanıyabilirse en kötü durumda **n(n−1)** yönlü bağ olur; her yeni öğe bütün ötekileri değiştirir. Arabulucuyla her öğe yalnızca yöneticiyi, yönetici de öğeleri tanır: **2n** bağ.')}</p>
        <table class="cmp med-cmp">
          <thead><tr><th>Öğe sayısı</th><th>Ağ: n(n−1)</th><th>Yıldız: 2n</th></tr></thead>
          <tbody>${[5, 10, 20].map(satir).join('')}</tbody>
        </table>
        <p class="info-desc">${md(`Bizim formumuzda (5 öğe) kalıpsız sürüm 2.0 **${MD.baglar(MD.naiveFiles('v2b')).length}** bağa ulaştı; Mediator’da öğeler arasında **0** bağ var, bütün bağlar yöneticiden geçiyor.`)}</p>`;
      DP.flash(infoTop, 'is-pop');
    }

    const TUZAK = {
      dongu: { label: 'Döngü', not: 'Teslimat seçici, yönetici onu ayarlarken “ben de değiştim” deyip yeniden `degisti()` çağırıyor. Yönetici kuralları yeniden uyguluyor, yine `ayarla` diyor… Döngü yığın dolana kadar sürüyor.' },
      duzeltme: { label: 'Düzeltme', not: 'Kural: **yalnızca kullanıcının** yaptığı değişiklik yöneticiye bildirilir. Yöneticinin yaptığı ayar bildirilmez. `ayarla` sonundaki `degisti()` silinince form normal çalışıyor.' },
    };
    function showTuzak() {
      const tur = S.tuzak || 'dongu';
      const prog = MD.tuzak(tur);
      const F = MD.filesFor(prog);
      const r = MD.run(prog);
      infoTop.innerHTML = `
        <div class="info-name">Tuzak: ayara haber vermek</div>
        <p class="info-desc">${md('Arabulucu öğeyi ayarlarken öğe bunu yeni bir değişiklik gibi bildirirse ne olur?')}</p>
        <div class="med-tuzak-seg"></div>
        <p class="info-desc med-tuzak-not">${md(TUZAK[tur].not)}</p>`;
      const seg = kit.seg(
        MD.TUZAK_SIRA.map((k) => ({ v: k, label: TUZAK[k].label })),
        tur,
        (k) => {
          S.tuzak = k;
          showTuzak();
        },
        { label: 'Tuzak', cls: 'med-seg' }
      );
      infoTop.querySelector('.med-tuzak-seg').appendChild(seg.el);
      infoCode.innerHTML = '';
      infoCode.classList.add('med-info-col');
      const cv = new DP.CodeView(infoCode, { files: [{ name: 'TeslimatSecici.java', code: MD.plain(F.TeslimatSecici), badge: tur === 'dongu' ? 'meraklı' : null }], roleOf: MD.roleOf, special: MD.special, compact: true });
      if (tur === 'dongu') cv.mark('TeslimatSecici.java', { find: 'degisti();', nth: 2 }, 'bad');
      else cv.mark('TeslimatSecici.java', ['public void ayarla(boolean hizli, boolean dolap) {', 'System.out.println("  teslimat: Standart");'], 'ok');
      const con = h('div', { class: 'console med-console is-yapi' });
      infoCode.appendChild(con);
      const cikti = r.lines.map((l) => MD.consoleLine(l, { bad: (x) => x.k === 'hata', note: (x) => (x.k === 'hata' ? 'ardından 1024 satır: ayarla → degisti → degisti …' : null) }));
      MD.renderConsole(con, '$ java Main', cikti, { title: tur === 'dongu' ? 'Konsol · istisna' : 'Konsol' });
      DP.flash(infoTop, 'is-pop');
    }

    function showBedel() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">Bedeli ve akrabaları</div>
        <p class="info-desc">${md('Karmaşıklık yok olmadı, **tek yere** taşındı. Yönetici her yeni kuralla büyür; dikkat edilmezse her şeyi bilen tek bir sınıfa (“tanrı nesnesi”) dönüşür.')}</p>
        <table class="cmp med-cmp">
          <thead><tr><th>Fikir</th><th>Ne işe yarar?</th></tr></thead>
          <tbody>
            <tr><td><code>kaynak</code> parametresi</td><td>${md('Büyük formlarda yalnızca **değişen öğeyi** ilgilendiren kuralı çalıştırmak (GoF: `WidgetChanged(widget)`)')}</td></tr>
            <tr><td>Alt yöneticiler</td><td>${md('Yönetici büyüyünce kuralları gruplara bölmek (adres kuralları, ücret kuralları …)')}</td></tr>
            <tr><td>Observer ile</td><td>${md('Öğeler yöneticiye doğrudan değil, **olay** ile haber verebilir; yönetici dinleyici olur')}</td></tr>
          </tbody>
        </table>`;
      DP.flash(infoTop, 'is-pop');
    }

    const STEPS = [
      { t: 'Genel bakış', x: 'Beş rol: öğelerin muhatabı **arabulucu** ([[FormYoneticisi]]) ve onu uygulayan [[GonderiFormu]]; öğelerin üst sınıfı **meslektaş** ([[FormOgesi]]) ve somut öğeler; hepsini kullanan **istemci** ([[Main]]).', info: null },
      { t: 'Mediator — `FormYoneticisi`', x: '[[FormYoneticisi]] tek yöntemli bir arayüz. Öğeler yalnızca bu türü tanıyor; formun somut sınıfından bile habersizler.', info: 'FormYoneticisi', focus: { classes: ['FormYoneticisi', 'FormOgesi'], edges: ['yonetici'], members: [['FormYoneticisi', 'degisti']] } },
      { t: 'ConcreteMediator — `GonderiFormu`', x: '[[GonderiFormu]] öğeleri yaratıyor ve etkileşimin **bütün kurallarını** uyguluyor. Dolap, hızlı teslimat ve ücret: hepsi tek bir yöntemde.', info: 'GonderiFormu', focus: { classes: ['GonderiFormu'], edges: ['r-form', 'o-SehirSecici', 'o-AgirlikAlani', 'o-SogukZincirKutusu', 'o-TeslimatSecici', 'o-UcretEtiketi'], members: [['GonderiFormu', 'degisti']] } },
      { t: 'Colleague — `FormOgesi`', x: '[[FormOgesi]] her öğenin üst sınıfı. Yöneticiye bir referans tutuyor ve `degisti()` ile ona haber veriyor; başka bir öğeye referansı yok.', info: 'FormOgesi', focus: { classes: ['FormOgesi', 'FormYoneticisi'], edges: ['yonetici'], members: [['FormOgesi', 'degisti']] } },
      { t: 'ConcreteColleague — `TeslimatSecici`', x: 'Somut öğeler kendi değerlerini tutuyor ve değişince haber veriyor. [[TeslimatSecici]] ayrıca yöneticinin çağırdığı `ayarla` yöntemini taşıyor. Ötekilere diyagramdan tıklayabilirsiniz.', info: 'TeslimatSecici', focus: { classes: ['SehirSecici', 'AgirlikAlani', 'SogukZincirKutusu', 'TeslimatSecici', 'UcretEtiketi', 'FormOgesi'], edges: ['g-SehirSecici', 'g-AgirlikAlani', 'g-SogukZincirKutusu', 'g-TeslimatSecici', 'g-UcretEtiketi'] } },
      { t: 'Client — `Main`', x: '[[Main]] formu yaratıyor ve kullanıcının tıklamalarını yapıyor. Kuralları bilmiyor; kalıpsız sürümdeki Main’in **aynısı**.', info: 'Main', focus: { classes: ['Main', 'GonderiFormu'], edges: ['c-main'] } },
      { t: 'Bağ sayısı: ağ ↔ yıldız', x: 'Öğeler birbirini tanıdığında bağ sayısı öğe sayısının karesiyle büyür; arabulucuyla doğrusal büyür. Asıl kazanç sayı değil: **bir değişiklik tek bir sınıfı** etkiliyor.', bag: true, focus: { classes: ['GonderiFormu', 'FormOgesi'] } },
      { t: 'Tuzak: ayara haber vermek', x: 'Arabulucu ile öğeler arasında iki yönlü bir ilişki var. Öğe, yöneticinin yaptığı ayarı yeni bir değişiklik gibi bildirirse sonsuz döngü (gerçek `StackOverflowError`).', tuzak: true, focus: { classes: ['TeslimatSecici', 'GonderiFormu'], members: [['TeslimatSecici', 'ayarla'], ['GonderiFormu', 'degisti']] } },
      { t: 'Bedeli ve akrabaları', x: 'Karmaşıklık yöneticide toplandı: okunması kolay ama büyümeye açık. Büyüyen yöneticiyi bölmek, `kaynak` parametresiyle yalnızca gerekeni çalıştırmak ya da Observer ile birleştirmek mümkün.', bedel: true, focus: { classes: ['GonderiFormu'] } },
    ];

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t.replace(/`/g, '')),
      delayOf: () => 6800,
      onChange: (i) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        diagram.select(null);
        if (s.focus) diagram.focus(s.focus);
        else diagram.clearFocus();
        infoCode.classList.remove('med-info-col');
        if (s.tuzak) showTuzak();
        else if (s.bag) showBag();
        else if (s.bedel) showBedel();
        else if (s.info) showInfo(s.info);
        else showOverview();
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };

  // ================================================================== 7. GENİŞLET: yeni öğe (SigortaKutusu)
  MD.scenes.extend = function (root, ctx) {
    const S = ctx.state;
    S.ext = S.ext || {};
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-50' });
    const left = kit.panel('Görev: <code class="med-code-t">SigortaKutusu</code>', { cls: 'panel-code panel-ex' });
    const right = kit.panel('Gönderi formu', { cls: 'panel-side med-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    // ---- sol (adım 0): alıştırma
    const exBox = h('div', { class: 'ex-box' });
    const task = h('div', {
      class: 'task-card',
      html: md('📩 **Şube müdürü:** “Forma bir **sigorta** kutusu ekleyelim (+15 TL). Sigortalı gönderi imzayla teslim edilir, yani **dolaba konamaz**.”\nKural: Öbür öğeler değişmeyecek.'),
    });
    const ex = kit.blankExercise({
      files: [
        { name: 'SigortaKutusu.java', code: EX.exercise, badge: 'YENİ' },
        { name: 'GonderiFormu.java · ek', code: EX.exerciseForm },
      ],
      answers: EX.answers,
      hints: {
        1: 'Formun her öğesi hangi sınıftan türer?',
        2: 'Öğe değişince yöneticiye hangi yöntemle haber verir?',
        3: 'Öğeyi yaratan form, kendini nasıl verir?',
        4: 'Kutunun işaretli olup olmadığını hangi yöntem söyler?',
      },
      choices: ['FormOgesi', 'FormYoneticisi', 'GonderiFormu', 'degisti', 'ayarla', 'this', 'yonetici', 'isaretli', 'secili'],
      roleOf: MD.roleOf,
      special: MD.special,
      state: S.ext,
      doneText: '<b class="ok">✔ Derleme başarılı!</b> Sigorta kutusu forma eklendi.',
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
    const runBox = h('div', { class: 'med-runbox', hidden: true });
    const runCode = h('div', { class: 'med-cv' });
    const runConsole = h('div', { class: 'console med-console' });
    runBox.append(runCode, runConsole);
    left.body.append(exBox, runBox);
    const runCv = new DP.CodeView(runCode, { roleOf: MD.roleOf, special: MD.special });

    // ---- sağ: sahne + etki
    const viewHost = h('div', { class: 'med-view' });
    const impact = h('div', { class: 'med-extra' });
    right.body.append(viewHost, impact);
    const stage = new MD.FormSahne(viewHost);

    const prog = EX.prog;
    const r = MD.run(prog);
    const O = r.olaylar;
    const F = MD.filesFor(prog);
    const sigortaK = prog.ops.findIndex((op) => op.t === 'sigorta');
    const oncesi = O.filter((x) => x.i === sigortaK - 1 && x.e === 'son')[0];
    const fx = MD.cagriFx(O, sigortaK);
    const bas = MD.stateFrom(MD.COZUM, oncesi.s, {
      ogeler: ['sehir', 'agirlik', 'soguk', 'sigorta', 'teslimat', 'ucret'],
      yer: { sigorta: 'yazılacak' },
      banner: { text: 'Malatya · 2 kg · Dolap seçili. Sigorta gelince dolap kapanmalı.' },
    });
    const STEPS = [
      {
        t: 'Görev: `SigortaKutusu`',
        x: 'Boşluklara tıklayıp doğru parçaları seçin. İpucu: yeni öğe de öbürleri gibi [[FormOgesi]]’nden türer ve değişince yalnızca yöneticiye haber verir. Kuralı yönetici uygular.',
        st: bas,
      },
      {
        t: 'Derlendi: sigorta işaretlendi',
        x: 'Sigorta kutusu yalnızca `degisti()` dedi. Yönetici kuralı uyguladı: sigortalı gönderi dolaba konamaz, dolap kapandı; Dolap seçili olduğu için seçim **Standart**’a döndü, ücret +15 TL ile güncellendi.',
        st: MD.stateFrom(prog, r.son, { aktif: 'sigorta', hl: fx.hl, kenar: fx.kenar, tokens: fx.tokens, banner: { text: 'Sigorta → dolap kapandı → **Standart** · 59 TL', tone: 'ok' } }),
      },
      {
        t: 'Değişen tek öğe yok',
        x: 'Yeni bir sınıf ([[SigortaKutusu]]) ve yöneticide birkaç satır ([[GonderiFormu]]: alan, kural, ücret). Şehir seçici, ağırlık alanı, soğuk zincir kutusu, teslimat seçici ve ücret etiketi **aynen** kaldı.',
        st: MD.stateFrom(prog, r.son, { banner: { text: 'Yeni öğe: 1 sınıf · değişen: yalnızca yönetici', tone: 'ok' } }),
      },
      {
        t: 'Dağınık tasarımla karşılaştırın',
        x: 'Sürüm 2.0’da aynı istek: sigorta kutusu ötekileri tanımalı, dolap kuralının üç kopyası ve ücret hesabının imzası değişmeli, formun kurucusu yeniden bağlanmalı. Birini unutmak yine mümkün. **Sigorta** artık Form Tezgâhı’nda da açık.',
        st: MD.stateFrom(prog, r.son, { banner: { text: 'Dağınık: en az 5 sınıf değişir · Mediator: 1 sınıf', tone: 'ok' } }),
      },
    ];

    function renderLeft(i) {
      exBox.hidden = i >= 1;
      runBox.hidden = i < 1;
      left.head.querySelector('.panel-title').innerHTML = i >= 1 ? 'Yeni öğe: <code class="med-code-t ver">SigortaKutusu</code>' : 'Görev: <code class="med-code-t">SigortaKutusu</code>';
      if (i < 1) return;
      // önce konsol (yüksekliği değişir), sonra koddaki işaret
      MD.renderConsole(runConsole, MD.cmd(true), r.lines.map((l) => MD.consoleLine(l, { hl: (x) => x.t.startsWith('> sigorta') })));
      runCv.setFiles(
        [
          { name: 'SigortaKutusu.java', code: F.SigortaKutusu, badge: 'YENİ' },
          { name: 'GonderiFormu.java', code: F.GonderiFormu, badge: 'DEĞİŞTİ' },
          { name: 'Main.java', code: EX.Main },
        ],
        { active: i === 2 ? 'GonderiFormu.java' : 'SigortaKutusu.java', keepActive: false }
      );
      if (i === 1) runCv.mark('SigortaKutusu.java', ['public void isaretle(boolean isaretli) {', 'degisti();'], 'focus');
      else runCv.mark('GonderiFormu.java', ['private final SigortaKutusu sigorta = new SigortaKutusu(this);'], 'focus');
      if (i >= 2) runCv.mark('GonderiFormu.java', '&& !sigorta.isaretli() && kg <= 20;', 'focus', { scroll: false });
    }

    function renderImpact(i, animate) {
      if (i === 0) {
        impact.innerHTML = `<div class="impact-title">İpucu</div><p>${md('Soğuk zincir kutusuna bakın: `extends FormOgesi`, kurucuda `super(yonetici)`, değişince `degisti()`. Yöneticide ise yeni alan `new SigortaKutusu(this)` ve kurala bir koşul.')}</p>`;
      } else if (i === 1) {
        impact.innerHTML = `
          <div class="impact-title ok">✔ Derleme başarılı · yeni öğe</div>
          <ul class="filelist"><li><span class="cv-dot rc rc-${MD.roleOf('SigortaKutusu')}"></span>SigortaKutusu.java <span class="cv-badge is-new">YENİ</span></li><li><span class="cv-dot rc rc-${MD.roleOf('GonderiFormu')}"></span>GonderiFormu.java <span class="cv-badge">DEĞİŞTİ</span></li></ul>`;
      } else if (i === 2) {
        impact.innerHTML = `
          <div class="metrics">
            <div class="metric is-good"><div class="m-val">1</div><div class="m-label">yeni sınıf</div></div>
            <div class="metric"><div class="m-val">1</div><div class="m-label">değişen: yönetici</div></div>
            <div class="metric is-good"><div class="m-val">0</div><div class="m-label">değişen öğe</div></div>
          </div>`;
      } else {
        impact.innerHTML = `
          <table class="cmp med-cmp">
            <thead lang="en"><tr><th>Yeni öğe</th><th>Dağınık (2.0)</th><th>Mediator</th></tr></thead>
            <tbody>
              <tr><td>Öbür öğeler</td><td class="bad">kural kopyaları, imzalar</td><td class="ok">değişmez</td></tr>
              <tr><td>Kural</td><td class="bad">üç yerde güncellenir</td><td class="ok">tek yerde</td></tr>
              <tr><td>Unutma riski</td><td class="bad">her kopyada</td><td class="ok">yok</td></tr>
            </tbody>
          </table>
          <div class="med-go"><button class="btn btn-primary btn-sm" type="button" data-go>📝 Form Tezgâhı’nda dene →</button></div>`;
        impact.querySelector('[data-go]').addEventListener('click', () => ctx.goScene('tezgah'));
      }
      if (animate) DP.flash(impact, 'is-pop');
    }

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t.replace(/`/g, '')),
      delayOf: () => 6800,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        if (i >= 1) {
          ex.autoFill(info.animate && i === 1);
          S.sigortaUnlocked = true;
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
  const RW = MD.rw;
  const TABS = [
    {
      tab: 'ButtonGroup',
      title: '`javax.swing.ButtonGroup` — radyo düğmelerinin arabulucusu',
      intro: 'Bir grup radyo düğmesinden **yalnızca biri** seçili olabilir. Düğmeler birbirini tanımaz: biri seçilince öbürlerini kaldıran, gruptur. Düğme gruptan çıkarılırsa kural da onu kapsamaz.',
      map: [
        ['concreteMediator', 'GonderiFormu', '`ButtonGroup`'],
        ['concreteColleague', 'TeslimatSecici', '`JRadioButton` (Standart, Hızlı, Dolap)'],
        ['client', 'Main', 'düğmelere tıklayan kod'],
      ],
      note: '“Gruptan çıkar” seçeneğinde Dolap gruptan çıkınca iki düğme birden seçili kalıyor: kuralı düğmeler değil grup uyguluyordu. Program pencere açmadan çalışır; çıktılar Java 21 ile alındı.',
      roles: { ButtonGroup: 'concreteMediator', JRadioButton: 'concreteColleague' },
      file: 'TeslimatGrubu.java',
      code: RW.grup,
      options: RW.grupOpts,
      mark: 'ButtonGroup grup = new ButtonGroup();',
      cmd: '$ java TeslimatGrubu',
    },
    {
      tab: 'Swing formu',
      title: 'Swing’de yönetici: pencerenin kendisi',
      intro: 'GoF’un örneği bir iletişim kutusudur. Swing’de de öğeler (`JCheckBox`, `JRadioButton`) birbirini tanımaz; pencere sınıfı hepsini dinler (`ItemListener`) ve kuralı tek yerde uygular.',
      map: [
        ['mediator', 'FormYoneticisi', '`ItemListener`'],
        ['concreteMediator', 'GonderiFormu', '`SwingFormu` (pencere)'],
        ['concreteColleague', 'SogukZincirKutusu', '`JCheckBox`, `JRadioButton`'],
        ['fm', 'degisti', '`itemStateChanged(e)`'],
      ],
      note: 'Son iki seçeneğe bakın: soğuk zincir ile Dolap’ın sırası değişse de sonuç aynı. Sınıf `final`: kurucuda `this` dinleyici olarak veriliyor. Çıktılar Java 21 ile alındı.',
      roles: { SwingFormu: 'concreteMediator', ItemListener: 'mediator', JCheckBox: 'concreteColleague', JRadioButton: 'concreteColleague' },
      file: 'SwingFormu.java',
      code: RW.swing,
      options: RW.swingOpts,
      mark: 'dolap.setEnabled(!soguk.isSelected());',
      cmd: '$ java SwingFormu',
    },
    {
      tab: 'CyclicBarrier',
      title: '`java.util.concurrent.CyclicBarrier` — kamyonlar bariyerde buluşur',
      intro: 'Altı kamyon (iş parçacığı) birbirini hiç tanımadan bariyerde bekler. Kaç kamyonun toplanacağına ve sonra ne olacağına **bariyer** karar verir: son gelen konvoyu yola çıkarır.',
      map: [
        ['concreteMediator', 'GonderiFormu', '`CyclicBarrier`'],
        ['concreteColleague', 'TeslimatSecici', 'kamyon iş parçacıkları'],
        ['fm', 'degisti', '`await()`'],
      ],
      note: 'Kural (3’erli, 2’şerli, tek konvoy) yalnızca bariyerin kurulduğu satırda; kamyonların kodu değişmiyor. Çıktılar Java 21 ile alındı ve her seçenek üç kez çalıştırılıp aynı çıktı verdi.',
      roles: { CyclicBarrier: 'concreteMediator' },
      file: 'Konvoy.java',
      code: RW.bariyer,
      options: RW.bariyerOpts,
      mark: 'bariyer.await();',
      cmd: '$ java Konvoy',
    },
    {
      tab: 'Karıştırmayın!',
      title: 'Mediator, Facade ve Observer',
      intro: 'Üçü de nesneleri birbirinden uzak tutar. Fark: haber hangi yönde gidiyor ve kuralları kim biliyor?',
      extraHtml: `<table class="cmp cmp-3">
        <thead lang="en"><tr><th></th><th>Mediator</th><th>Facade</th><th>Observer</th></tr></thead>
        <tbody>
          <tr><td>Kim kimi tanır?</td><td>Öğeler yöneticiyi, yönetici öğeleri</td><td>İstemci cepheyi; alt sistem cepheyi <b>bilmez</b></td><td>Konu abone listesini</td></tr>
          <tr><td>Haber yönü</td><td>İki yönlü: öğe ↔ yönetici</td><td>Tek yönlü: istemci → alt sistem</td><td>Tek yönlü: konu → aboneler</td></tr>
          <tr><td>Kurallar</td><td>Yöneticide</td><td>Cephede (iş akışı)</td><td>Her abone kendi tepkisini verir</td></tr>
        </tbody></table>`,
      note: 'Facade bir alt sistemi **kullanmayı** kolaylaştırır; Mediator eşit nesnelerin **birbiriyle etkileşimini** toplar. Observer’da kural yoktur: konu yalnızca haber verir. Yönetici ile öğeler arasındaki haberleşme Observer ile de kurulabilir.',
      roles: { GonderiFormu: 'concreteMediator', FormOgesi: 'colleague' },
      special: MD.special,
      file: 'Karsilastirma.java',
      code: () => `// Mediator: öğe yalnızca yöneticiye haber verir; kurallar onda
form.soguk().isaretle(true);     // → degisti(this) → ayarla(…)

// Facade: istemci karmaşık bir alt sistemi tek kapıdan kullanır
cephe.gonderiOlustur(siparis);   // alt sistem cepheyi bilmez

// Observer: konu abonelerine haber verir; kural yok
gonderi.setDurum("Yolda");       // → bildir() → guncelle(this)`,
      mark: 'form.soguk().isaretle(true);     // → degisti(this) → ayarla(…)',
    },
  ];

  MD.scenes.realworld = (root, ctx) =>
    kit.realWorldScene(root, ctx, {
      tabs: TABS,
      roles: MD.roles,
      roleOf: MD.roleOf,
      fmLabel: 'haber yöntemi',
      footText: (i) =>
        i === 3
          ? 'Benzer görünüyorsa **haberin yönüne** bakın: Mediator’da iki yönlü (öğe ↔ yönetici), Facade’da istemciden alt sisteme, Observer’da konudan abonelere.'
          : i === 2
          ? 'Eşzamanlılıkta da arabulucu var: iş parçacıkları birbirini değil, bariyeri tanır. Kural bariyerde.'
          : i === 1
          ? 'GUI’lerde yönetici çoğu zaman pencerenin ya da denetleyicinin (controller) kendisidir.'
          : 'JDK’da hazır bir arabulucu: “yalnızca biri seçili” kuralını düğmeler değil grup uygular.',
    });

  // ================================================================== 9. QUIZ
  const Q = [
    {
      type: 'mcq',
      q: 'Mediator kalıbının **temel amacı** (GoF) nedir?',
      options: [
        'Bir nesnedeki değişikliği, ona abone olan bütün nesnelere kendiliğinden haber vermek',
        'Karmaşık bir alt sistemi kullanmak için istemcilere tek ve basit bir giriş kapısı sunmak',
        'Nesnelerin nasıl etkileşeceğini tek bir nesnede toplamak; nesneler birbirini tanımasın',
        'Bir isteği, onu işleyebilecek nesneler zincirinde biri üstlenene kadar sırayla dolaştırmak',
      ],
      answer: 2,
      explain: 'Diğerleri Observer, Facade ve Chain of Responsibility’nin amaçları.',
    },
    {
      type: 'line',
      q: 'Bu sınıfta **dolap kuralının** hesaplandığı satıra tıklayın.',
      codeName: 'GonderiFormu.java',
      code: yorumsuz(MD.plain(COZ.GonderiFormu)),
      answer: 'boolean dolap = "Malatya".equals(sehir.secili()) && !soguk.isaretli()',
      explain: 'Kural yalnızca yöneticide yazılı: şehir, soğuk zincir ve ağırlık birlikte değerlendiriliyor.',
    },
    {
      type: 'mcq',
      q: 'Sürüm 2.0’da soğuk zincirli ilaç neden dolaba gidebildi?',
      options: [
        'Şehir seçicinin kural kopyası soğuk zinciri bilmeden dolabı yeniden açtı',
        'Soğuk zincir kutusu işaretlendiğinde dolabı kapatmayı tümüyle unutmuştu',
        'Teslimat seçici kapalı seçenekleri de seçtirecek biçimde yanlış yazılmıştı',
        'Ücret etiketi dolap seçeneği için yanlış ücret hesapladığı için onay geçti',
      ],
      answer: 0,
      explain: 'Kuralın üç kopyası vardı; soğuk zincir eklenirken ikisi güncellenmedi. Önce soğuk zincir, sonra şehir seçilince son konuşan şehir seçici oldu.',
    },
    {
      type: 'mcq',
      q: '`FormOgesi` sınıfı bu tasarımda hangi rolde?',
      options: ['Mediator', 'Colleague', 'ConcreteMediator', 'Client'],
      answer: 1,
      explain: 'Öğelerin üst sınıfı Colleague’dir: yöneticiye bir referans tutar ve `degisti()` ile ona haber verir.',
    },
    {
      type: 'line',
      q: 'Bu sınıfta öğenin **yöneticiye haber verdiği** satıra tıklayın.',
      codeName: 'SogukZincirKutusu.java',
      code: yorumsuz(MD.plain(COZ.SogukZincirKutusu)),
      answer: 'degisti();',
      explain: 'Öğe yalnızca `degisti()` der (üst sınıfta `yonetici.degisti(this)`); dolabı ya da ücreti bilmez.',
    },
    {
      type: 'mcq',
      q: 'Mediator ile Facade arasındaki fark nedir?',
      options: [
        'İkisi aynıdır; aralarındaki fark yalnızca sınıf adlarında ve paketlerdedir',
        'Facade eşit nesnelerin etkileşimini toplar; Mediator bir alt sistemi kolaylaştırır',
        'Mediator yalnızca iki nesneyle çalışır; Facade ise sınırsız nesneyle çalışabilir',
        'Mediator eşit nesnelerin etkileşimini toplar; Facade bir alt sistemi kolaylaştırır',
      ],
      answer: 3,
      explain: 'Facade’da alt sistem cepheyi bilmez ve haber tek yönlüdür. Mediator’da öğeler yöneticiyi tanır, haber iki yönlüdür.',
    },
    {
      type: 'mcq',
      q: '10 öğeli bir formda öğeler birbirini doğrudan tanırsa en çok kaç yönlü bağ olur? Arabulucuyla kaç?',
      options: ['10 ve 10', '45 ve 10', '100 ve 11', '90 ve 20'],
      answer: 3,
      explain: 'Ağ: n(n−1) = 90 yönlü bağ. Yıldız: her öğe yöneticiyi, yönetici her öğeyi tanır: 2n = 20.',
    },
    {
      type: 'mcq',
      q: 'Yönetici `teslimat.ayarla(…)` derken seçici de `degisti()` çağırırsa ne olur?',
      options: [
        'Hiçbir şey; Java aynı nesneden gelen ikinci bildirimi kendiliğinden yok sayar',
        'Yönetici ile seçici birbirini durmadan çağırır; sonunda StackOverflowError',
        'Derleyici, ayarla içinden degisti çağrılmasına izin vermez ve kod derlenmez',
        'Bildirim bir kez daha işlenir, sonra yönetici döngüyü fark edip kendisi durur',
      ],
      answer: 1,
      explain: 'Gerçek çalıştırma: yığın dolana kadar ayarla → degisti → degisti döngüsü. Yöneticinin yaptığı ayar yeniden bildirilmemeli.',
    },
    {
      type: 'mcq',
      q: 'Mediator’ın **bedeli** (dikkat edilmesi gereken yanı) hangisi?',
      options: [
        'Yönetici her yeni kuralla büyür; her şeyi bilen tek bir sınıfa dönüşebilir',
        'Öğeler, yönetici olsa bile birbirini doğrudan çağırmaya devam etmek zorunda kalır',
        'Her yeni öğe, formdaki bütün öbür öğelerin de değiştirilmesini gerektirir',
        'Öğeler yalnızca aynı paketteki yöneticilerle çalışabilir, başka pakete geçemez',
      ],
      answer: 0,
      explain: 'Karmaşıklık yok olmaz, tek yerde toplanır. Büyüyen yönetici bölünebilir ya da `kaynak`’a göre yalnızca gereken kural çalıştırılabilir.',
    },
  ];

  MD.scenes.quiz = (root, ctx) =>
    kit.quizScene(root, ctx, {
      questions: Q,
      roleOf: MD.roleOf,
      special: MD.special,
      patternName: 'Mediator',
      match: {
        items: ['FormYoneticisi', 'GonderiFormu', 'FormOgesi', 'SehirSecici', 'TeslimatSecici', 'SigortaKutusu', 'Main'].map((id) => ({ id, label: id })),
        buckets: ['mediator', 'concreteMediator', 'colleague', 'concreteColleague', 'client'].map((k) => ({ id: k, title: MD.roles[k].en, sub: MD.roles[k].tr, color: MD.roles[k].color })),
        answer: MD.classRoles,
        hint: 'Yedi sınıfı beş role yerleştirin. Takıldığınızda **Cevapları göster** düğmesi var.',
      },
    });

  // ================================================================== 10. ÖZET
  MD.scenes.summary = function (root, ctx) {
    const at = DP.catalog.findIndex((p) => p.id === 'mediator');
    const next = DP.catalog.slice(at + 1).find((p) => p.ready && DP.patterns[p.id]);
    const el = h('div', { class: 'scene scene-summary' });
    el.innerHTML = `
      <div class="sum-head">
        <div>
          <div class="chips"><span class="chip chip-cat is-behav">Davranışsal · Behavioral</span><span class="chip">Anahtar kelime: herkes arabulucuyla konuşur</span></div>
          <h1>Mediator — Özet</h1>
        </div>
        <div class="sum-actions no-print">
          <button class="btn btn-ghost" type="button" data-print>🖨 Yazdır / PDF</button>
          <a class="btn btn-ghost" href="#/command/ozet">← Command özeti</a>
          <a class="btn btn-ghost" href="#/">Tüm kalıplar</a>
          ${next ? `<a class="btn btn-primary" href="#/${next.id}">Sıradaki kalıp: ${DP.esc(next.name)} →</a>` : ''}
        </div>
      </div>
      <div class="sum-grid">
        <article class="card sum-intent">
          <h3>Amaç</h3>
          <p>Bir grup nesnenin <b>birbiriyle nasıl etkileşeceğini</b> kapsülleyen bir nesne tanımla; nesneler birbirine doğrudan başvurmasın, etkileşim onlardan <b>bağımsız</b> değiştirilebilsin.</p>
          <div class="sum-formula"><code>soguk.isaretle(true)</code> → <code>yonetici.degisti(this)</code> → <code>teslimat.ayarla(…)</code> <span>(kurallar: <code>GonderiFormu.degisti</code>)</span></div>
        </article>
        <article class="card sum-uml"><h3>Yapı (GoF)</h3><div class="sum-diag"></div></article>
        <article class="card">
          <h3>Ağ ↔ yıldız</h3>
          <table class="cmp sg-sum-cmp">
            <thead lang="en"><tr><th></th><th>Kalıpsız</th><th>Mediator</th></tr></thead>
            <tbody>
              <tr><td>Öğeler arası bağ</td><td class="bad">13 (5 öğe)</td><td class="ok">0</td></tr>
              <tr><td>Kural nerede?</td><td class="bad">3 öğede kopya</td><td class="ok">yalnızca yöneticide</td></tr>
              <tr><td>Tıklama sırası</td><td class="bad">sonucu değiştirir</td><td class="ok">fark etmez</td></tr>
              <tr><td>Yeni öğe</td><td class="bad">ötekiler değişir</td><td class="ok">yeni sınıf + yönetici</td></tr>
            </tbody>
          </table>
        </article>
        <article class="card">
          <h3>Katılımcılar</h3>
          <ul class="sum-roles">
            <li>${ui.roleChip('mediator')}<span>tek yöntem: degisti(kaynak)</span></li>
            <li>${ui.roleChip('concreteMediator')}<span>öğeleri tanır, bütün kurallar</span></li>
            <li>${ui.roleChip('colleague')}<span>yöneticiyi tanır, haber verir</span></li>
            <li>${ui.roleChip('concreteColleague')}<span>kendi değeri; ötekilerden habersiz</span></li>
            <li>${ui.roleChip('client')}<span>formu kullanır</span></li>
          </ul>
        </article>
        <article class="card sum-pros">
          <h3>Artıları</h3>
          <ul>
            <li><b>Gevşek bağ</b>: öğeler birbirini tanımaz</li>
            <li>Etkileşim kuralları <b>tek yerde</b></li>
            <li>Öğeler başka formlarda yeniden kullanılır</li>
            <li>Sonuç tıklama sırasından bağımsız</li>
          </ul>
        </article>
        <article class="card sum-cons">
          <h3>Eksileri</h3>
          <ul>
            <li>Yönetici büyür: “her şeyi bilen” sınıf</li>
            <li>Yeni öğe yöneticiyi değiştirir</li>
            <li>Ayar bildirilirse sonsuz döngü</li>
            <li>Akışı izlemek için yöneticiyi okumak gerekir</li>
          </ul>
        </article>
        <article class="card">
          <h3>İlişkili kalıplar</h3>
          <ul>
            <li><b>Facade:</b> bir alt sistemi kullanmayı kolaylaştırır; haber tek yönlü.</li>
            <li><b>Observer:</b> öğeler yöneticiye olaylarla haber verebilir.</li>
            <li><b>Command:</b> öğeler yöneticiye istekleri komut nesnesi olarak gönderebilir.</li>
          </ul>
        </article>
        <article class="card sum-tip">
          <h3>Sınav ipuçları</h3>
          <pre class="mini-code">interface FormYoneticisi {                          // Mediator
    void degisti(FormOgesi kaynak);
}
abstract class FormOgesi {                          // Colleague
    private final FormYoneticisi yonetici;
    protected void degisti() { yonetici.degisti(this); }
}
final class GonderiFormu implements FormYoneticisi {   // ConcreteMediator
    public void degisti(FormOgesi kaynak) {
        boolean dolap = Malatya && !soguk && kg &lt;= 20;   // kurallar tek yerde
        teslimat.ayarla(hizli, dolap);
    }
}</pre>
          <p class="exam"><b>Nesneler birbirini değil, aracıyı tanır</b> → Mediator · <b>Mediator, ConcreteMediator, Colleague</b> · ağ <u>n(n−1)</u> ↔ yıldız <u>2n</u> · kurallar <u>tek yerde</u> · Facade’dan farkı: <u>iki yönlü</u></p>
        </article>
        <article class="card sum-files">
          <h3>Java kodları</h3>
          <p>Çalıştırılabilir örnekler proje klasöründe:</p>
          <pre class="mini-code">java/mediator/sorun      → öğeler birbirini tanıyor; ilaç dolaba gidiyor
java/mediator/cozum      → FormYoneticisi, FormOgesi, kurallar GonderiFormu’nda
java/mediator/akis/...   → Canlı Akış: ilac · agir
java/mediator/tezgah/... → aynı tıklamalar: daginik · kopyali · mediator
java/mediator/tuzak      → ayara haber veren öğe: StackOverflowError
java/mediator/genislet   → SigortaKutusu: yeni öğe, öteki öğeler değişmeden</pre>
          <p>Derleyip çalıştırmak için <code>java/README.md</code> dosyasına bakın.</p>
        </article>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-print]').addEventListener('click', () => window.print());
    const diag = new DP.ClassDiagram(el.querySelector('.sum-diag'), MD.gofDiagram({}), { roles: MD.roles, roleTags: false, mode: 'generic' });
    diag.svg.classList.add('is-compact');
    return { destroy() {} };
  };

  // ================================================================== kayıt
  DP.register({
    id: 'mediator',
    name: 'Mediator',
    tr: 'Arabulucu',
    category: 'behavioral',
    roleOf: MD.roleOf,
    initialState: () => ({
      view: 'stage',
      showCode: true,
      preset: 'ilac',
      tz: { design: 'mediator', ops: MD.TEZGAH_ANA.slice() },
      sigortaUnlocked: false,
      tuzak: 'dongu',
      ext: {},
      quiz: { results: {}, match: false },
    }),
    scenes: [
      { id: 'giris', title: 'Giriş', mount: MD.scenes.intro },
      { id: 'sorun', title: 'Sorun', mount: MD.scenes.problem },
      { id: 'cozum', title: 'Çözüm', mount: MD.scenes.solution },
      { id: 'akis', title: 'Canlı Akış', mount: MD.scenes.flow, star: true },
      { id: 'tezgah', title: 'Form Tezgâhı', mount: MD.scenes.counter, star: true },
      { id: 'yapi', title: 'Yapı (UML)', mount: MD.scenes.structure },
      { id: 'genislet', title: 'Genişlet', mount: MD.scenes.extend },
      { id: 'gercek', title: 'Gerçek Dünya', mount: MD.scenes.realworld },
      { id: 'quiz', title: 'Quiz', mount: MD.scenes.quiz },
      { id: 'ozet', title: 'Özet', mount: MD.scenes.summary },
    ],
  });
})();
