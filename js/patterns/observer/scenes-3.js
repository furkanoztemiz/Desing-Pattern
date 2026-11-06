/*
 * Observer — sahneler (3/3): Yapı, Genişlet, Gerçek Dünya, Quiz, Özet ve kalıp kaydı
 */
(function () {
  'use strict';
  const OB = DP.obs;
  const { h } = DP;
  const kit = DP.kit;
  const ui = OB.ui;
  const md = OB.md;
  const C = OB.code;
  const EX = OB.ext;
  /** Satır sonu yorumlarını atar (quiz'de cevabı ele vermesin) */
  const yorumsuz = (s) => s.replace(/ +\/\/ [^\n]*$/gm, '');

  // ================================================================== 6. YAPI
  const ROLE_TEXT = {
    subject: 'Değişen nesne. Abone listesini tutar (<code>aboneEkle</code>, <code>aboneCikar</code>); durumu değişince <code>bildir()</code> ile listedeki herkese haber verir. Abonelerin <b>sınıflarını bilmez</b>.',
    observer: 'Haber almak isteyenlerin ortak arayüzü: tek yöntem, <code>guncelle(gonderi)</code>. Konu ile gözlemciler arasındaki <b>tek bağ</b> budur.',
    concreteObserver: 'Arayüzü uygulayan asıl ekran. Aynı bildirime <b>kendince</b> tepki verir; yeni durumu konudan kendisi okur (<code>getDurum()</code>).',
    client: 'Konuyu ve gözlemcileri kurar; kimin neyi izleyeceğine <b>çalışma anında</b> karar verir.',
  };

  function classInfo(id) {
    switch (id) {
      case 'Gonderi':
        return { role: 'subject', file: 'Gonderi.java', code: C.Gonderi, mark: ['public void aboneEkle(GonderiGozlemcisi abone) {', 'abone.guncelle(this);'], points: ['`List<GonderiGozlemcisi> aboneler`: kim abone, sırasıyla.', '`bildir()`: listeyi dolaşır, herkese `guncelle(this)`.', 'Ekran sınıflarının **hiçbirini** tanımaz.'] };
      case 'GonderiGozlemcisi':
        return { role: 'observer', file: 'GonderiGozlemcisi.java', code: C.Arayuz, mark: 'void guncelle(Gonderi gonderi);', points: ['Tek yöntem: `guncelle(Gonderi gonderi)`.', 'Parametre: hangi gönderinin değiştiği.', 'Konu yalnızca bu türü bilir.'] };
      case 'AliciTelefonu':
      case 'SaticiPaneli':
      case 'KuryeTableti':
        return {
          role: 'concreteObserver',
          file: id + '.java',
          code: C[id],
          mark: ['public void guncelle(Gonderi gonderi) {', 'String durum = gonderi.getDurum();'],
          points: ['Arayüzü uygular: `guncelle`.', 'Yeni durumu konudan **kendisi okur** (pull).', { AliciTelefonu: 'Tepkisi: SMS gönderir.', SaticiPaneli: 'Tepkisi: gönderinin satırını günceller.', KuryeTableti: 'Tepkisi: rotaya ekler ya da çıkarır.' }[id]],
        };
      case 'Main':
        return { role: 'client', file: 'Main.java', code: C.Main, mark: ['gonderi.aboneEkle(telefon);', 'gonderi.aboneEkle(tablet);'], points: ['Ekranları ve gönderiyi kurar.', 'Kimin abone olacağını **o** seçer.', 'Gönderinin durumunu değiştirir; haber vermek Gonderi’nin işi.'] };
      default:
        return null;
    }
  }

  OB.scenes.structure = function (root, ctx) {
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
    const legend = kit.umlLegend({ association: true, aggregation: 'abone listesi', fmLabel: 'bildirim (bildir → guncelle)' });
    left.body.append(diagHost, legend);
    const diagram = new DP.ClassDiagram(diagHost, OB.gofDiagram({ notes: true }), {
      roles: OB.roles,
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
      infoCode.classList.remove('obs-info-col');
      if (!info) return;
      const r = OB.roles[info.role];
      infoTop.innerHTML = `
        <div class="info-role rc rc-${r.color}"><span class="info-dot"></span><b>${r.en}</b> · ${r.tr}</div>
        <div class="info-name rc rc-${r.color}">${DP.esc(id)}</div>
        <p class="info-desc">${ROLE_TEXT[info.role]}</p>
        <ul class="info-points">${info.points.map((p) => `<li>${md(p)}</li>`).join('')}</ul>`;
      const cv = new DP.CodeView(infoCode, { files: [{ name: info.file, code: info.code }], roleOf: OB.roleOf, special: OB.special, compact: true });
      cv.mark(info.file, info.mark, 'focus');
      DP.flash(infoTop, 'is-pop');
    }

    function showOverview() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">Kanal ve aboneleri</div>
        <div class="role-list">
          ${['subject', 'observer', 'concreteObserver', 'client']
            .map((k) => `<div class="role-row rc rc-${OB.roles[k].color}"><span class="info-dot"></span><div><b>${OB.roles[k].en}</b> · ${OB.roles[k].tr}<div class="role-desc">${ROLE_TEXT[k]}</div></div></div>`)
            .join('')}
        </div>`;
    }

    function showPushPull() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">Push mı, pull mı?</div>
        <p class="info-desc">${md('Bizim `guncelle(this)` yalnızca “değiştim” diyor; gözlemci gerekeni konudan **kendisi okuyor** (*pull*). Konu veriyi bildirimle birlikte de gönderebilirdi (*push*).')}</p>
        <table class="cmp obs-cmp">
          <thead lang="en"><tr><th></th><th>Pull</th><th>Push</th></tr></thead>
          <tbody>
            <tr><td>Arayüz</td><td><code>guncelle(Gonderi g)</code></td><td><code>guncelle(String no, String durum)</code></td></tr>
            <tr><td>Kim ne bilir?</td><td class="ok">gözlemci neyi okuyacağını seçer</td><td class="bad">konu, gözlemcinin neye ihtiyacı olduğunu varsayar</td></tr>
            <tr><td>Bedel</td><td class="bad">her gözlemci konuya geri döner (getDurum)</td><td class="ok">tek çağrıda bütün veri</td></tr>
          </tbody>
        </table>
        <p class="info-desc">${md('**Bildirimi kim tetikler?** Burada durumu değiştiren yöntemler (`setDurum`, `teslimEt`) kendileri `bildir()` diyor: unutulmaz ama arka arkaya on değişiklik on bildirim demek. İstemci tetikleseydi toplu değişiklikten sonra tek bildirim yapılabilirdi; bu kez de unutulabilirdi.')}</p>`;
      DP.flash(infoTop, 'is-pop');
    }

    const TUZAK = {
      bas: { label: 'Telefon başta', not: 'Telefon listenin **başında**: Java’nın yineleyicisi listenin değiştiğini fark ediyor ve **istisna** fırlatıyor. Panel ve tablet teslimi hiç duymadı.' },
      orta: { label: 'Telefon ortada', not: 'Telefon **ortada**: istisna yok! Liste kısaldığı için döngü erken bitti, tablet **sessizce atlandı**: rotada yine teslim edilmiş bir gönderi.' },
      kopya: { label: 'List.copyOf', not: 'Düzeltme: `bildir()` listenin **kopyası** üzerinde dolaşıyor. Telefon gerçek listeden çıkıyor, döngü bozulmuyor; üç ekran da haber alıyor.' },
    };
    function showTuzak() {
      const sira = S.tuzak || 'bas';
      const prog = OB.tuzak(sira);
      const F = OB.filesFor(prog);
      const r = OB.run(prog);
      infoTop.innerHTML = `
        <div class="info-name">Tuzak: bildirirken ayrılmak</div>
        <p class="info-desc">${md('Telefon teslimden sonra `guncelle` içinden kendini çıkarıyor: `gonderi.aboneCikar(this)`. Gonderi o sırada **aynı listeyi** dolaşıyor.')}</p>
        <div class="obs-tuzak-seg"></div>
        <p class="info-desc obs-tuzak-not">${md(TUZAK[sira].not)}</p>`;
      const seg = kit.seg(
        OB.TUZAK_SIRA.map((k) => ({ v: k, label: TUZAK[k].label })),
        sira,
        (k) => {
          S.tuzak = k;
          showTuzak();
        },
        { label: 'Sıra', cls: 'obs-seg' }
      );
      infoTop.querySelector('.obs-tuzak-seg').appendChild(seg.el);
      infoCode.innerHTML = '';
      infoCode.classList.add('obs-info-col');
      const cv = new DP.CodeView(infoCode, {
        files: [
          { name: 'AliciTelefonu.java', code: OB.plain(F.AliciTelefonu), badge: 'meraklı' },
          { name: 'Gonderi.java', code: OB.plain(F.Gonderi) },
        ],
        roleOf: OB.roleOf,
        special: OB.special,
        compact: true,
      });
      if (sira === 'kopya') cv.mark('Gonderi.java', 'for (GonderiGozlemcisi abone : List.copyOf(aboneler)) {', 'ok');
      else cv.mark('AliciTelefonu.java', 'gonderi.aboneCikar(this);', 'bad');
      const con = h('div', { class: 'console obs-console is-yapi' });
      infoCode.appendChild(con);
      const L = r.lines;
      const bas = L.findIndex((l) => l.t.startsWith('[KRG-1001] Teslim edildi'));
      const kuyruk = L.slice(bas).map((l) => OB.consoleLine(l, { bad: (x) => x.k === 'hata' || (x.t === 'Kurye rotası: KRG-1001') }));
      OB.renderConsole(con, '$ java Main', [{ t: '…', k: 'x' }].concat(kuyruk), { title: sira === 'bas' ? 'Konsol · istisna' : 'Konsol' });
      DP.flash(infoTop, 'is-pop');
    }

    function showBedel() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">Bedeli</div>
        <p class="info-desc">${md('Gevşek bağın bedeli: akış artık koddan değil, **çalışma anındaki listeden** okunuyor.')}</p>
        <table class="cmp obs-cmp">
          <thead><tr><th>Dikkat</th><th>Ne olur?</th></tr></thead>
          <tbody>
            <tr><td>Unutulan abone</td><td>${md('İşi biten ekran `aboneCikar` demezse konu onu **bellekte tutar** ve haber vermeye devam eder')}</td></tr>
            <tr><td>Sıra varsayımı</td><td>${md('Bildirim sırası liste sırasıdır; bir gözlemci diğerinden **önce** çalışacağını varsaymamalı')}</td></tr>
            <tr><td>Zincirleme güncelleme</td><td>${md('Gözlemci `guncelle` içinden konuyu değiştirirse yeni bir bildirim başlar: döngüye dikkat')}</td></tr>
            <tr><td>Pahalı bildirim</td><td>${md('Çok abone, sık değişiklik: her değişiklik herkese gider (gerekirse ilgi alanına göre süzün)')}</td></tr>
          </tbody>
        </table>`;
      DP.flash(infoTop, 'is-pop');
    }

    const STEPS = [
      { t: 'Genel bakış', x: 'Dört rol: değişen **konu** ([[Gonderi]]), haber almak isteyenlerin ortak arayüzü **gözlemci** ([[GonderiGozlemcisi]]), onu uygulayan **somut gözlemciler** ([[AliciTelefonu]], [[SaticiPaneli]], [[KuryeTableti]]) ve hepsini kuran **istemci** ([[Main]]).', info: null },
      { t: 'Subject — `Gonderi`', x: '[[Gonderi]] abone listesini tutuyor (◇) ve durum değişince `bildir()` ile herkese haber veriyor. GoF’ta liste yönetimi soyut bir `Subject`’te, durum `ConcreteSubject`’te durur; burada ikisi tek sınıfta.', info: 'Gonderi', focus: { classes: ['Gonderi'], edges: ['aboneler'], members: [['Gonderi', 'aboneler'], ['Gonderi', 'bildir']] } },
      { t: 'Observer — `GonderiGozlemcisi`', x: '[[GonderiGozlemcisi]] tek yöntemli bir arayüz. Konu ile gözlemciler arasındaki tek bağ bu: Gonderi yalnızca bu türü tanıyor.', info: 'GonderiGozlemcisi', focus: { classes: ['GonderiGozlemcisi', 'Gonderi'], edges: ['aboneler', 'cek'], members: [['GonderiGozlemcisi', 'guncelle']] } },
      { t: 'ConcreteObserver — `KuryeTableti`', x: 'Üç somut gözlemci aynı bildirime üç farklı tepki veriyor. [[KuryeTableti]] yeni durumu gönderiden okuyor ve rotasını güncelliyor. Diğer ikisine diyagramdan tıklayabilirsiniz.', info: 'KuryeTableti', focus: { classes: ['KuryeTableti', 'AliciTelefonu', 'SaticiPaneli', 'GonderiGozlemcisi'], edges: ['r-KuryeTableti', 'r-AliciTelefonu', 'r-SaticiPaneli'] } },
      { t: 'Client — `Main`', x: '[[Main]] nesneleri kuruyor ve kimin neyi izleyeceğine karar veriyor. **Ne zaman** haber verileceğine konu, **kime** haber verileceğine istemci (abonelikler) karar veriyor.', info: 'Main', focus: { classes: ['Main', 'Gonderi'], edges: ['c-main'], members: [['Gonderi', 'aboneEkle'], ['Gonderi', 'aboneCikar']] } },
      { t: 'Push mı, pull mı?', x: 'Bildirimle ne gönderilmeli? Bizim tasarım *pull*: konu yalnızca kendini gönderiyor, gözlemci gerekeni okuyor. Bildirimi kimin tetiklediği de bir tasarım kararı.', pushPull: true, focus: { classes: ['GonderiGozlemcisi', 'Gonderi'], edges: ['cek'] } },
      { t: 'Tuzak: bildirim sırasında abonelikten çıkmak', x: 'Gözlemci bildirim **sırasında** listeyi değiştirirse ne olur? Üç çalıştırma, üç sonuç (gerçek Java çıktıları): istisna, sessizce atlanan abone ve düzeltme.', tuzak: true, focus: { classes: ['Gonderi', 'AliciTelefonu'], members: [['Gonderi', 'bildir'], ['Gonderi', 'aboneCikar']] } },
      { t: 'Bedeli', x: 'Gevşek bağ ücretsiz değil: unutulan aboneler bellekte kalır, sıra varsayımları kırılır, zincirleme güncellemeler döngüye girebilir.', bedel: true, focus: { classes: ['Gonderi', 'GonderiGozlemcisi'], edges: ['aboneler'] } },
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
        infoCode.classList.remove('obs-info-col');
        if (s.tuzak) showTuzak();
        else if (s.pushPull) showPushPull();
        else if (s.bedel) showBedel();
        else if (s.info) showInfo(s.info);
        else showOverview();
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };

  // ================================================================== 7. GENİŞLET: yeni gözlemci (CagriMerkezi)
  OB.scenes.extend = function (root, ctx) {
    const S = ctx.state;
    S.ext = S.ext || {};
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-50' });
    const left = kit.panel('Görev: <code class="obs-code-t">CagriMerkezi</code>', { cls: 'panel-code panel-ex' });
    const right = kit.panel('Gönderi takibi', { cls: 'panel-side obs-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    // ---- sol (adım 0): alıştırma
    const exBox = h('div', { class: 'ex-box' });
    const task = h('div', {
      class: 'task-card',
      html: md('📩 **Müşteri hizmetleri:** “Müşteri aradığında gönderisinin **son durumunu** ekranda görelim. Her değişiklikte kaydımız güncellensin.”\nKural: Gonderi ve öteki ekranlar değişmeyecek.'),
    });
    const ex = kit.blankExercise({
      files: [
        { name: 'CagriMerkezi.java', code: EX.exercise, badge: 'YENİ' },
        { name: 'Main.java · ek', code: EX.exerciseMain },
      ],
      answers: EX.answers,
      hints: {
        1: 'Haber almak isteyen her sınıf hangi arayüzü uygular?',
        2: 'Gonderi, bildir() içinde abonelerinin hangi yöntemini çağırıyor?',
        3: 'Yeni durumu gönderiden hangi yöntemle okuruz?',
        4: 'Bir ekranı gönderinin abone listesine ne ekler?',
      },
      choices: ['Gonderi', 'GonderiGozlemcisi', 'SaticiPaneli', 'guncelle', 'bildir', 'getDurum', 'setDurum', 'aboneEkle', 'aboneCikar'],
      roleOf: OB.roleOf,
      special: OB.special,
      state: S.ext,
      doneText: '<b class="ok">✔ Derleme başarılı!</b> Çağrı merkezi abone oldu.',
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
    const runBox = h('div', { class: 'obs-runbox', hidden: true });
    const runCode = h('div', { class: 'obs-cv' });
    const runConsole = h('div', { class: 'console obs-console' });
    runBox.append(runCode, runConsole);
    left.body.append(exBox, runBox);
    const runCv = new DP.CodeView(runCode, { roleOf: OB.roleOf, special: OB.special });

    // ---- sağ: sahne + etki
    const viewHost = h('div', { class: 'obs-view' });
    const impact = h('div', { class: 'obs-extra' });
    right.body.append(viewHost, impact);
    const stage = new OB.TakipSahne(viewHost);

    const prog = EX.prog;
    const r = OB.run(prog);
    const O = r.olaylar;
    const bas = OB.stateFrom(OB.COZUM, OB.KURULU_AN(OB.COZUM), {
      ekranlar: ['aliTel', 'panel', 'tablet', 'merkez'],
      yer: { merkez: 'henüz yazılmadı: CagriMerkezi' },
      banner: { text: 'Yeni ekran için Gonderi’ye dokunmadan **bir sınıf** ve **bir abonelik** yeter.' },
    });
    const ilk = O.find((o) => o.e === 'guncelle' && o.o === 'merkez');
    const son = r.son;
    const STEPS = [
      {
        t: 'Görev: `CagriMerkezi`',
        x: 'Boşluklara tıklayıp doğru parçaları seçin. İpucu: yeni ekran da öteki üçü gibi **arayüzü uygular** ve bir kez **abone edilir**. Gonderi’de değişecek satır yok.',
        st: bas,
      },
      {
        t: 'Derlendi: dördüncü abone',
        x: 'Main çağrı merkezini abone etti. Gönderi yola çıkınca `bildir()` listeyi dolaştı ve dördüncü aboneye de `guncelle(this)` dedi: çağrı merkezi kaydını tuttu.',
        st: OB.stateFrom(prog, ilk.s, { hl: { merkez: 'on' }, ghl: { 'KRG-1001': true }, bildir: 'KRG-1001', teller: [{ g: 'KRG-1001', o: 'merkez', kind: 'on' }], tokens: [{ from: 'g:KRG-1001', to: 'o:merkez', text: 'guncelle(this)', kind: 'bil' }], banner: { text: '4 abone · çağrı merkezi: KRG-1001 → **Yolda**', tone: 'ok' } }),
      },
      {
        t: 'Gonderi’de değişen satır: 0',
        x: 'Teslimata kadar çağrı merkezi her değişikliği duydu; müşteri arayınca son durumu söyleyebiliyor. [[Gonderi]]’ye ve öteki ekranlara **tek satır** eklemedik: yeni bir **somut gözlemci** ve bir `aboneEkle` satırı.',
        st: OB.stateFrom(prog, son, { banner: { text: 'Çağrı merkezi: KRG-1001 → **Teslim edildi** · Gonderi değişmedi', tone: 'ok' } }),
      },
      {
        t: 'Doğrudan çağrıyla karşılaştırın',
        x: 'Sürüm 2.0’da aynı istek Gonderi’de **dört** yeri değiştirirdi: yeni alan, kurucu parametresi, `setDurum` ve `teslimEt` içindeki çağrılar (birini unutmak yine mümkün). **Çağrı merkezi** artık Abonelik Tezgâhı’nda da açık.',
        st: OB.stateFrom(prog, son, { banner: { text: 'Doğrudan çağrı: Gonderi’de 4 değişiklik · Observer: 0', tone: 'ok' } }),
      },
    ];

    function renderLeft(i) {
      exBox.hidden = i >= 1;
      runBox.hidden = i < 1;
      left.head.querySelector('.panel-title').innerHTML = i >= 1 ? 'Yeni gözlemci: <code class="obs-code-t ver">CagriMerkezi</code>' : 'Görev: <code class="obs-code-t">CagriMerkezi</code>';
      if (i < 1) return;
      // önce konsol (yüksekliği değişir), sonra koddaki işaret
      const kadar = i === 1 ? ilk.n : r.lines.length;
      OB.renderConsole(runConsole, OB.cmd(true), r.lines.slice(0, kadar).map((l) => OB.consoleLine(l, { hl: (x) => x.k === 'merkez' })));
      runCv.setFiles(
        [
          { name: 'CagriMerkezi.java', code: C.CagriMerkezi, badge: 'YENİ' },
          { name: 'Main.java', code: EX.Main },
        ],
        { active: i === 1 ? 'Main.java' : 'CagriMerkezi.java', keepActive: false }
      );
      if (i === 1) runCv.mark('Main.java', ['CagriMerkezi merkez = new CagriMerkezi();', 'gonderi.aboneEkle(merkez);'], 'focus');
      else if (i === 2) runCv.mark('CagriMerkezi.java', ['public void guncelle(Gonderi gonderi) {', 'kayitlar.put(takipNo, durum);'], 'focus');
      else runCv.mark('CagriMerkezi.java', ['public String sorgula(String takipNo) {', 'return "Çağrı merkezi: " + takipNo + " → " + durum;'], 'focus');
    }

    function renderImpact(i, animate) {
      if (i === 0) {
        impact.innerHTML = `<div class="impact-title">İpucu</div><p>${md('Öteki ekranlara bakın: hepsi `implements GonderiGozlemcisi` diyor ve `guncelle` içinde `gonderi.getDurum()` ile okuyor. Main’de ise her ekran için bir `aboneEkle` satırı var.')}</p>`;
      } else if (i === 1) {
        impact.innerHTML = `
          <div class="impact-title ok">✔ Derleme başarılı · yeni gözlemci</div>
          <ul class="filelist"><li><span class="cv-dot rc rc-${OB.roleOf('CagriMerkezi')}"></span>CagriMerkezi.java <span class="cv-badge is-new">YENİ</span></li><li><span class="cv-dot rc rc-${OB.roleOf('Main')}"></span>Main.java <span class="cv-badge">+2 satır</span></li></ul>`;
      } else if (i === 2) {
        impact.innerHTML = `
          <div class="metrics">
            <div class="metric is-good"><div class="m-val">1</div><div class="m-label">yeni sınıf</div></div>
            <div class="metric is-good"><div class="m-val">0</div><div class="m-label">Gonderi’de değişen satır</div></div>
            <div class="metric"><div class="m-val">${son.bildirim}</div><div class="m-label">bildirim</div></div>
          </div>`;
      } else {
        impact.innerHTML = `
          <table class="cmp obs-cmp">
            <thead lang="en"><tr><th>Yeni ekran</th><th>Doğrudan çağrı</th><th>Observer</th></tr></thead>
            <tbody>
              <tr><td>Gonderi</td><td class="bad">alan, kurucu, 2 yöntem</td><td class="ok">değişmez</td></tr>
              <tr><td>Main</td><td>kurucu çağrısı değişir</td><td>bir <code>aboneEkle</code></td></tr>
              <tr><td>Unutma riski</td><td class="bad">her yöntemde</td><td class="ok">yok: tek <code>bildir()</code></td></tr>
            </tbody>
          </table>
          <div class="obs-go"><button class="btn btn-primary btn-sm" type="button" data-go>📡 Abonelik Tezgâhı’nda dene →</button></div>`;
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
          S.merkezUnlocked = true;
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
  const RW = OB.rw;
  const TABS = [
    {
      tab: 'PropertyChangeSupport',
      title: '`java.beans.PropertyChangeSupport` — hazır abone listesi',
      intro: 'JDK’nın hazır konu yardımcısı: abone listesini o tutar, `firePropertyChange` ile herkese haber verir. Bildirim **eski ve yeni değeri** birlikte taşır (push). Değer gerçekten değişmediyse kimseye haber verilmez.',
      map: [
        ['subject', 'Gonderi', '`Gonderi` (`PropertyChangeSupport` ile)'],
        ['observer', 'GonderiGozlemcisi', '`PropertyChangeListener`'],
        ['concreteObserver', 'SaticiPaneli', '`panel` (lambda)'],
        ['fm', 'bildir', '`firePropertyChange("durum", eski, yeni)`'],
      ],
      note: '“Aynı değer” seçeneğinde `setDurum("Yolda")` iki kez çağrılıyor ama bildirim bir kez: eski ve yeni değer eşitse olay atılmaz. Çıktılar Java 21 ile alındı.',
      roles: { Gonderi: 'subject', PropertyChangeListener: 'observer', PropertyChangeSupport: 'subject' },
      file: 'DurumDinleyici.java',
      code: RW.pcs,
      options: RW.pcsOpts,
      mark: 'destek.firePropertyChange("durum", eski, yeni);',
      cmd: '$ java DurumDinleyici',
    },
    {
      tab: 'ActionListener',
      title: 'Swing `ActionListener` — düğme ve dinleyicileri',
      intro: 'Arayüz programlamada her olay bir Observer’dır: düğme konu, `ActionListener`’lar gözlemci. `addActionListener` abone eder; düğmeye basılınca (`doClick`) hepsi çağrılır.',
      map: [
        ['subject', 'Gonderi', '`JButton`'],
        ['observer', 'GonderiGozlemcisi', '`ActionListener`'],
        ['concreteObserver', 'SaticiPaneli', '`dinleyici("2. Panel")`'],
        ['fm', 'bildir', '`fireActionPerformed` (düğmenin içinde)'],
      ],
      note: 'Çıktıya bakın: Swing dinleyicileri **son eklenenden başlayarak** çağırır. Bildirim sırasına güvenmeyin. Program pencere açmadan çalışır; çıktılar Java 21 ile alındı.',
      roles: { JButton: 'subject', ActionListener: 'observer' },
      file: 'DugmeDinleyici.java',
      code: RW.swing,
      options: RW.swingOpts,
      mark: 'teslim.addActionListener(dinleyici("1. SMS"));',
      cmd: '$ java DugmeDinleyici',
    },
    {
      tab: 'Flow',
      title: '`java.util.concurrent.Flow` — abone kadar iste',
      intro: 'Java 9’un tepkisel akışları Observer’ın büyümüş hâli: `Publisher` yayınlar, `Subscriber` abone olur. Fark: abone ne kadar **istediğini** (`request`) söyler; yayıncı ondan fazlasını göndermez (geri basınç).',
      map: [
        ['subject', 'Gonderi', '`SubmissionPublisher` (`Flow.Publisher`)'],
        ['observer', 'GonderiGozlemcisi', '`Flow.Subscriber`'],
        ['concreteObserver', 'KuryeTableti', '`Abone("Tablet")`'],
        ['fm', 'bildir', '`submit(durum)` → `onNext(durum)`'],
      ],
      note: 'Burada `Runnable::run` ile bildirimler aynı iş parçacığında ve sırayla. Gerçekte yayıncı ayrı iş parçacıklarında çalışır; RxJava ve Reactor bu fikrin üzerine kuruludur. Çıktılar Java 21 ile alındı.',
      roles: { Abone: 'concreteObserver', SubmissionPublisher: 'subject' },
      file: 'AkisAbone.java',
      code: RW.flow,
      options: RW.flowOpts,
      mark: 'gonderi.subscribe(new Abone("Tablet"));',
      cmd: '$ java AkisAbone',
    },
    {
      tab: 'Karıştırmayın!',
      title: 'Observer, Mediator ve olay yolu',
      intro: 'Üçü de nesneleri birbirinden habersiz tutar. Fark: kim kimi tanıyor ve haber kimin üzerinden gidiyor?',
      extraHtml: `<table class="cmp cmp-3">
        <thead lang="en"><tr><th></th><th>Observer</th><th>Mediator</th><th>Olay yolu (pub/sub)</th></tr></thead>
        <tbody>
          <tr><td>Kim kimi tanır?</td><td>Konu, abone <b>listesini</b> tutar</td><td>Herkes yalnızca <b>aracıyı</b> tanır</td><td>Kimse kimseyi; yalnızca <b>konu adı</b></td></tr>
          <tr><td>Haber yönü</td><td>Bire-çok, tek yön</td><td>Çok yönlü, aracı üzerinden</td><td>Bire-çok, aracı yol üzerinden</td></tr>
          <tr><td>Örnek</td><td><code>gonderi.aboneEkle(tablet)</code></td><td>Kontrol kulesi ve uçaklar</td><td><code>yol.yayinla("teslim", …)</code></td></tr>
        </tbody></table>`,
      note: 'Olay yolu (event bus, mesaj kuyruğu) Observer’ın dağıtık hâlidir: yayıncı abonelerini hiç tutmaz. Mediator ise bildirimden çok, nesneler arasındaki **konuşma kurallarını** bir merkeze toplar.',
      roles: { Gonderi: 'subject', GonderiGozlemcisi: 'observer' },
      special: OB.special,
      file: 'Karsilastirma.java',
      code: () => `// Observer: konu abonelerini tutar, herkese aynı bildirim
gonderi.aboneEkle(tablet);  …  gonderi.setDurum("Yolda");

// Mediator: nesneler birbirine değil, aracıya konuşur
kule.inisIzniIste(ucak);         // kime ne denir, kule bilir

// Olay yolu: yayıncı ile abone birbirini hiç tanımaz
yol.abone("teslim", tablet);  …  yol.yayinla("teslim", "KRG-1001");`,
      mark: 'gonderi.aboneEkle(tablet);  …  gonderi.setDurum("Yolda");',
    },
  ];

  OB.scenes.realworld = (root, ctx) =>
    kit.realWorldScene(root, ctx, {
      tabs: TABS,
      roles: OB.roles,
      roleOf: OB.roleOf,
      fmLabel: 'bildirim yöntemi',
      footText: (i) =>
        i === 3
          ? 'Benzer görünüyorsa **kimin kimi tanıdığına** bakın: Observer’da konu abonelerini tutar, Mediator’da herkes aracıyı, olay yolunda kimse kimseyi tanımaz.'
          : i === 2
          ? 'Tepkisel akışlar Observer’a bir soru ekler: abone ne kadarını kaldırabilir? `request(n)` bunu söyler.'
          : i === 1
          ? 'Her düğme bir konu, her dinleyici bir gözlemci. Sıraya güvenmeyin: Swing son ekleneni önce çağırır.'
          : 'JDK’nın hazır konu yardımcısı: listeyi o tutar, `firePropertyChange` herkese haber verir.',
    });

  // ================================================================== 9. QUIZ
  const Q = [
    {
      type: 'mcq',
      q: 'Observer kalıbının **temel amacı** (GoF) nedir?',
      options: [
        'Bir nesnenin iç durumunu kapsüllemeyi bozmadan saklamak; nesne sonra o duruma dönebilsin',
        'Bire-çok bağımlılık kurmak; bir nesne değişince ona bağlı olanların hepsi haber alsın',
        'Bir isteği, onu işleyebilecek nesneler zincirinde biri üstlenene kadar sırayla dolaştırmak',
        'Bir grup nesnenin birbiriyle doğrudan değil, merkezdeki tek bir aracı nesneyle konuşması',
      ],
      answer: 1,
      explain: 'Diğerleri Memento, Chain of Responsibility ve Mediator’ın amaçları.',
    },
    {
      type: 'line',
      q: 'Bu sınıfta abonelere **haber verilen** satıra tıklayın.',
      codeName: 'Gonderi.java',
      code: yorumsuz(OB.plain(C.Gonderi)),
      answer: 'abone.guncelle(this);',
      explain: '`bildir()` listeyi dolaşır ve her aboneye `guncelle(this)` der; abone kim olursa olsun aynı çağrı.',
    },
    {
      type: 'mcq',
      q: 'Sürüm 2.0’da kurye tableti teslim bilgisini neden alamadı?',
      options: [
        'Tablet abonelikten kendisi çıkmıştı; teslimden hemen önce aboneCikar çağrılmıştı',
        'Teslim bilgisi tablete gitti ama tablet onu yanlış biçimde işleyip hemen sildi',
        'Kurye tableti yalnızca Dağıtımda durumunu dinleyecek biçimde kurulmuştu',
        'Yeni yazılan teslimEt yöntemi, tableti çağırmayı unutan kopyalanmış koddu',
      ],
      answer: 3,
      explain: 'Kalıpsız tasarımda durumu değiştiren her yöntem bütün ekranları ayrı ayrı çağırmak zorunda. Observer’da her yöntem yalnızca `bildir()` der.',
    },
    {
      type: 'mcq',
      q: '`GonderiGozlemcisi` arayüzü bu tasarımda hangi rolde?',
      options: ['Observer', 'Subject', 'ConcreteObserver', 'Client'],
      answer: 0,
      explain: 'Haber almak isteyenlerin ortak arayüzü Observer’dır; onu uygulayan ekranlar ConcreteObserver.',
    },
    {
      type: 'line',
      q: 'Bu sınıfta gözlemcinin yeni durumu **konudan okuduğu** (pull) satıra tıklayın.',
      codeName: 'KuryeTableti.java',
      code: yorumsuz(OB.plain(C.KuryeTableti)),
      answer: 'String durum = gonderi.getDurum();',
      explain: 'Bildirim yalnızca “değiştim” der; gözlemci gerekeni konudan kendisi çeker (pull modeli).',
    },
    {
      type: 'mcq',
      q: 'Gözlemciye neden `guncelle(Gonderi gonderi)` ile konunun **kendisi** gönderiliyor?',
      options: [
        'Java, arayüz yöntemlerinin en az bir nesne parametresi almasını zorunlu tutar',
        'Gözlemci, gönderiyi kopyalayıp kendi listesinde saklayabilsin diye gönderilir',
        'Birden çok gönderiyi izleyen gözlemci, hangisinin değiştiğini anlayabilsin',
        'Gönderi, gözlemcinin hangi sınıftan olduğunu bu parametreyle öğrenebilsin',
      ],
      answer: 2,
      explain: 'Satıcı paneli iki gönderiyi birden izliyor; `gonderi.getTakipNo()` ile hangi satırı güncelleyeceğini anlıyor.',
    },
    {
      type: 'mcq',
      q: 'Bildirim sırasında telefon kendini listeden çıkarırsa (`aboneCikar(this)`) ne olabilir?',
      options: [
        'Hiçbir şey olmaz; Java, dolaşılan listeyi değişikliklere karşı kendiliğinden kopyalar',
        'Listedeki yerine göre ConcurrentModificationException ya da sessizce atlanan abone',
        'Derleyici, guncelle içinden aboneCikar çağrılmasına izin vermez ve kod derlenmez',
        'Telefon listeden çıkmaz; çıkarma isteği bildirim bitene kadar sırada bekletilir',
      ],
      answer: 1,
      explain: 'Gerçek çalıştırma: telefon baştaysa istisna, ortadaysa tablet sessizce atlanır. Çözüm: listenin kopyası üzerinde dolaşmak (`List.copyOf`).',
    },
    {
      type: 'mcq',
      q: 'Observer ile Mediator arasındaki fark nedir?',
      options: [
        'Observer’da nesneler bir aracıyla konuşur; Mediator’da konu abonelerine haber verir',
        'İkisi aynıdır; aralarındaki tek fark sınıf adlarının ve yöntem adlarının seçimidir',
        'Mediator yalnızca iki nesneyi bağlar; Observer ise sınırsız sayıda nesneyi bağlar',
        'Observer’da konu abonelerine haber verir; Mediator’da nesneler bir aracıyla konuşur',
      ],
      answer: 3,
      explain: 'Observer bire-çok, tek yönlü bir bildirimdir; Mediator ise nesneler arasındaki çok yönlü konuşmayı tek bir merkeze toplar.',
    },
    {
      type: 'mcq',
      q: 'Observer’ın **bedeli** (dikkat edilmesi gereken yanı) hangisi?',
      options: [
        'Her gözlemci, konunun bütün alanlarını kopyalayıp sakladığı için bellek hızla büyür',
        'Konu, her yeni gözlemci türü için yeniden derlenmek ve değiştirilmek zorundadır',
        'Kimin, hangi sırayla haber aldığı koddan okunmaz; unutulan abone bellekte kalır',
        'Gözlemciler yalnızca aynı paketteki konuları izleyebilir; paket dışına çıkamazlar',
      ],
      answer: 2,
      explain: 'Gevşek bağın bedeli: akış koddan değil, çalışma anındaki listeden çıkar. İşi biten gözlemci `aboneCikar` ile ayrılmazsa konu onu bellekte tutar.',
    },
  ];

  OB.scenes.quiz = (root, ctx) =>
    kit.quizScene(root, ctx, {
      questions: Q,
      roleOf: OB.roleOf,
      special: OB.special,
      patternName: 'Observer',
      match: {
        items: ['Gonderi', 'GonderiGozlemcisi', 'AliciTelefonu', 'SaticiPaneli', 'KuryeTableti', 'CagriMerkezi', 'Main'].map((id) => ({ id, label: id })),
        buckets: ['subject', 'observer', 'concreteObserver', 'client'].map((k) => ({ id: k, title: OB.roles[k].en, sub: OB.roles[k].tr, color: OB.roles[k].color })),
        answer: OB.classRoles,
        hint: 'Yedi sınıfı dört role yerleştirin. Takıldığınızda **Cevapları göster** düğmesi var.',
      },
    });

  // ================================================================== 10. ÖZET
  OB.scenes.summary = function (root, ctx) {
    const at = DP.catalog.findIndex((p) => p.id === 'observer');
    const next = DP.catalog.slice(at + 1).find((p) => p.ready && DP.patterns[p.id]);
    const el = h('div', { class: 'scene scene-summary' });
    el.innerHTML = `
      <div class="sum-head">
        <div>
          <div class="chips"><span class="chip chip-cat is-behav">Davranışsal · Behavioral</span><span class="chip">Diğer adları: Dependents, Publish-Subscribe</span></div>
          <h1>Observer — Özet</h1>
        </div>
        <div class="sum-actions no-print">
          <button class="btn btn-ghost" type="button" data-print>🖨 Yazdır / PDF</button>
          <a class="btn btn-ghost" href="#/memento/ozet">← Memento özeti</a>
          <a class="btn btn-ghost" href="#/">Tüm kalıplar</a>
          ${next ? `<a class="btn btn-primary" href="#/${next.id}">Sıradaki kalıp: ${DP.esc(next.name)} →</a>` : ''}
        </div>
      </div>
      <div class="sum-grid">
        <article class="card sum-intent">
          <h3>Amaç</h3>
          <p>Nesneler arasında <b>bire-çok</b> bir bağımlılık tanımla: bir nesnenin durumu değiştiğinde ona bağlı <b>bütün nesneler haberdar edilsin</b> ve kendiliğinden güncellensin.</p>
          <div class="sum-formula"><code>gonderi.setDurum(d)</code> → <code>bildir()</code> → <code>abone.guncelle(this)</code> <span>(abone: <code>aboneEkle</code> / <code>aboneCikar</code>)</span></div>
        </article>
        <article class="card sum-uml"><h3>Yapı (GoF)</h3><div class="sum-diag"></div></article>
        <article class="card">
          <h3>Doğrudan çağrı ↔ Observer</h3>
          <table class="cmp sg-sum-cmp">
            <thead lang="en"><tr><th></th><th>Kalıpsız</th><th>Observer</th></tr></thead>
            <tbody>
              <tr><td>Konu kimi tanır?</td><td class="bad">her ekranı adıyla</td><td class="ok">yalnızca arayüzü</td></tr>
              <tr><td>Yeni ekran</td><td class="bad">konu değişir</td><td class="ok">yeni sınıf + aboneEkle</td></tr>
              <tr><td>Abonelik</td><td class="bad">kodda sabit</td><td class="ok">çalışma anında</td></tr>
              <tr><td>Unutulan çağrı</td><td class="bad">her yöntemde risk</td><td class="ok">tek bildir()</td></tr>
            </tbody>
          </table>
        </article>
        <article class="card">
          <h3>Katılımcılar</h3>
          <ul class="sum-roles">
            <li>${ui.roleChip('subject')}<span>abone listesi, bildir()</span></li>
            <li>${ui.roleChip('observer')}<span>ortak arayüz: guncelle</span></li>
            <li>${ui.roleChip('concreteObserver')}<span>kendi tepkisi; durumu okur</span></li>
            <li>${ui.roleChip('client')}<span>kimin neyi izleyeceğini seçer</span></li>
          </ul>
        </article>
        <article class="card sum-pros">
          <h3>Artıları</h3>
          <ul>
            <li><b>Gevşek bağ</b>: konu gözlemcileri tanımaz</li>
            <li>Çalışma anında abone olma ve ayrılma</li>
            <li>Bire-çok yayın; bir gözlemci birçok konu</li>
            <li>Yeni gözlemci = yeni sınıf (konu değişmez)</li>
          </ul>
        </article>
        <article class="card sum-cons">
          <h3>Eksileri</h3>
          <ul>
            <li>Bildirim <b>sırasına</b> güvenilemez</li>
            <li>Unutulan abone bellekte kalır</li>
            <li>Bildirim sırasında liste değişirse: kopya üzerinde dolaş</li>
            <li>Zincirleme güncellemeler, gereksiz bildirimler</li>
          </ul>
        </article>
        <article class="card">
          <h3>İlişkili kalıplar</h3>
          <ul>
            <li><b>Mediator:</b> karmaşık bildirim kuralları bir “değişiklik yöneticisi”nde toplanabilir.</li>
            <li><b>Singleton:</b> o değişiklik yöneticisi çoğu zaman tek bir nesnedir.</li>
            <li><b>MVC:</b> model konu, görünümler gözlemcidir.</li>
          </ul>
        </article>
        <article class="card sum-tip">
          <h3>Sınav ipuçları</h3>
          <pre class="mini-code">interface GonderiGozlemcisi {                       // Observer
    void guncelle(Gonderi gonderi);
}
class Gonderi {                                     // Subject
    private final List&lt;GonderiGozlemcisi&gt; aboneler = new ArrayList&lt;&gt;();
    public void aboneEkle(GonderiGozlemcisi a) { aboneler.add(a); }
    private void bildir() { for (… a : aboneler) a.guncelle(this); }
    public void setDurum(String d) { durum = d; bildir(); }
}
class KuryeTableti implements GonderiGozlemcisi {   // ConcreteObserver
    public void guncelle(Gonderi g) { … g.getDurum() … }   // pull
}</pre>
          <p class="exam"><b>Bire-çok bağımlılık, otomatik bildirim</b> → Observer · <b>Subject, Observer, ConcreteObserver</b> · konu gözlemcileri <u>tanımaz</u> · <u>push</u> / <u>pull</u> · abonelik çalışma anında</p>
        </article>
        <article class="card sum-files">
          <h3>Java kodları</h3>
          <p>Çalıştırılabilir örnekler proje klasöründe:</p>
          <pre class="mini-code">java/observer/sorun      → ekranlar adıyla çağrılıyor; teslimEt tableti unutuyor
java/observer/cozum      → GonderiGozlemcisi, abone listesi ve bildir()
java/observer/akis/...   → Canlı Akış: gun · iki
java/observer/tezgah/... → aynı oturum: dogrudan · sabit · observer
java/observer/tuzak      → bildirim sırasında abonelikten çıkmak (istisna)
java/observer/genislet   → CagriMerkezi: Gonderi değişmeden yeni gözlemci</pre>
          <p>Derleyip çalıştırmak için <code>java/README.md</code> dosyasına bakın.</p>
        </article>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-print]').addEventListener('click', () => window.print());
    const diag = new DP.ClassDiagram(el.querySelector('.sum-diag'), OB.gofDiagram({}), { roles: OB.roles, roleTags: false, mode: 'generic' });
    diag.svg.classList.add('is-compact');
    return { destroy() {} };
  };

  // ================================================================== kayıt
  DP.register({
    id: 'observer',
    name: 'Observer',
    tr: 'Gözlemci',
    category: 'behavioral',
    roleOf: OB.roleOf,
    initialState: () => ({
      view: 'stage',
      showCode: true,
      preset: 'gun',
      tz: { design: 'observer', ops: OB.TEZGAH_ANA.slice() },
      merkezUnlocked: false,
      tuzak: 'bas',
      ext: {},
      quiz: { results: {}, match: false },
    }),
    scenes: [
      { id: 'giris', title: 'Giriş', mount: OB.scenes.intro },
      { id: 'sorun', title: 'Sorun', mount: OB.scenes.problem },
      { id: 'cozum', title: 'Çözüm', mount: OB.scenes.solution },
      { id: 'akis', title: 'Canlı Akış', mount: OB.scenes.flow, star: true },
      { id: 'tezgah', title: 'Abonelik Tezgâhı', mount: OB.scenes.counter, star: true },
      { id: 'yapi', title: 'Yapı (UML)', mount: OB.scenes.structure },
      { id: 'genislet', title: 'Genişlet', mount: OB.scenes.extend },
      { id: 'gercek', title: 'Gerçek Dünya', mount: OB.scenes.realworld },
      { id: 'quiz', title: 'Quiz', mount: OB.scenes.quiz },
      { id: 'ozet', title: 'Özet', mount: OB.scenes.summary },
    ],
  });
})();
