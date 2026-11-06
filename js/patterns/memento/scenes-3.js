/*
 * Memento — sahneler (3/3): Yapı, Genişlet, Gerçek Dünya, Quiz, Özet ve kalıp kaydı
 */
(function () {
  'use strict';
  const MN = DP.mnt;
  const { h } = DP;
  const kit = DP.kit;
  const ui = MN.ui;
  const md = MN.md;
  const C = MN.code;
  const EX = MN.ext;
  /** Satır sonu yorumlarını atar (quiz'de cevabı ele vermesin) */
  const yorumsuz = (s) => s.replace(/ +\/\/ [^\n]*$/gm, '');

  // ================================================================== 6. YAPI
  const ROLE_TEXT = {
    originator: 'Durumu tutan asıl nesne. Kendi durumunun hatırasını <b>kendisi</b> oluşturur (<code>hatiraOlustur()</code>) ve istenince o hatıraya <b>kendisi</b> döner (<code>hatirayaDon(h)</code>).',
    memento: 'Kaynağın bir anki durumunun kopyası. İki yüzü vardır: kaynak için <b>geniş</b> (içini okur), emanetçi için <b>dar</b> (yalnızca saklanabilir bir nesne).',
    caretaker: 'Hatırayı saklar ve istenince geri verir; içine <b>bakmaz</b>, değiştirmez. Ne zaman kaydedileceğine ve hangi hatıraya dönüleceğine o karar verir.',
    client: 'Kaynağı ve emanetçiyi kurar; işlemleri yapar, hata olunca emanetçiden geri dönüşü ister.',
  };

  function classInfo(id) {
    switch (id) {
      case 'Depo':
        return { role: 'originator', file: 'Depo.java', code: C.Depo, mark: ['public Hatira hatiraOlustur() {', 'kamyon.addAll(h.kamyon);'], points: ['`hatiraOlustur()`: raflar ve kamyonun **kopyası**.', '`hatirayaDon(h)`: kendi nesnelerinin içini hatıradan doldurur.', 'get/set yok: iç durum kapalı.'] };
      case 'Hatira':
        return { role: 'memento', file: 'Depo.java', code: C.Depo, mark: ['public static final class Hatira {', 'this.kamyon = new ArrayList<>(kamyon);'], points: ['Depo’nun **iç sınıfı**: alanlarına yalnızca Depo erişir.', 'Kurucusu private: onu yalnızca Depo yaratır.', 'Alanları `final`, içerik kurucuda kopyalanır: sonradan değişmez.'] };
      case 'YedekDefteri':
        return { role: 'caretaker', file: 'YedekDefteri.java', code: C.YedekDefteri, mark: ['private final Map<String, Depo.Hatira> yedekler = new HashMap<>();', 'depo.hatirayaDon(yedekler.get(ad));'], points: ['Hatıraları adıyla saklar.', 'İçlerini bilmez: deponun alanlarından habersiz.', 'Depo’ya yeni alan gelse bile **değişmez**.'] };
      case 'Main':
        return { role: 'client', file: 'Main.java', code: C.Main, mark: ['defter.kaydet("02:00");', 'defter.geriYukle("02:00");'], points: ['Plandan önce kayıt ister.', 'Hata olunca geri dönüşü ister.', 'Kalıpsız sürümdeki Main’in **aynısı**.'] };
      default:
        return null;
    }
  }

  MN.scenes.structure = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split' });
    const tools = h('div', { class: 'panel-tools' });
    const body = h('div', { class: 'scene-body cols-64' });
    const left = kit.panel('Yapı', { cls: 'panel-diagram', extra: tools });
    const right = kit.panel('Rol kartı <span class="panel-sub">· bir sınıfa tıklayın</span>', { cls: 'panel-side' });
    body.append(left.el, right.el);
    el.append(body);
    root.appendChild(el);

    const diagHost = h('div', { class: 'diag-host' });
    const legend = kit.umlLegend({ association: true, aggregation: 'saklar', fmLabel: 'hatıra yöntemi' });
    left.body.append(diagHost, legend);
    const diagram = new DP.ClassDiagram(diagHost, MN.gofDiagram({ notes: true }), {
      roles: MN.roles,
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
      const r = MN.roles[info.role];
      infoTop.innerHTML = `
        <div class="info-role rc rc-${r.color}"><span class="info-dot"></span><b>${r.en}</b> · ${r.tr}</div>
        <div class="info-name rc rc-${r.color}">${DP.esc(id === 'Hatira' ? 'Depo.Hatira' : id)}</div>
        <p class="info-desc">${ROLE_TEXT[info.role]}</p>
        <ul class="info-points">${info.points.map((p) => `<li>${md(p)}</li>`).join('')}</ul>`;
      const cv = new DP.CodeView(infoCode, { files: [{ name: info.file, code: info.code }], roleOf: MN.roleOf, special: MN.special, compact: true });
      cv.mark(info.file, info.mark, 'focus');
      DP.flash(infoTop, 'is-pop');
    }

    function showOverview() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">Mühürlü zarf</div>
        <div class="role-list">
          ${['originator', 'memento', 'caretaker', 'client']
            .map((k) => `<div class="role-row rc rc-${MN.roles[k].color}"><span class="info-dot"></span><div><b>${MN.roles[k].en}</b> · ${MN.roles[k].tr}<div class="role-desc">${ROLE_TEXT[k]}</div></div></div>`)
            .join('')}
        </div>`;
    }

    function showArayuz() {
      infoTop.innerHTML = `
        <div class="info-name">Dar ve geniş arayüz</div>
        <p class="info-desc">${md('Java’da bu ikilik **iç sınıfla** kurulur: `Hatira`, `Depo`’nun içinde; alanları ve kurucusu `private`. Depo onları okuyabilir (geniş arayüz), defter ise yalnızca `Depo.Hatira` türünde bir nesne tutabilir (dar arayüz). Defter içine bakmaya kalkarsa kod **derlenmez**:')}</p>`;
      infoCode.innerHTML = '';
      infoCode.classList.add('mnt-info-col');
      const cv = new DP.CodeView(infoCode, { files: [{ name: 'YedekDefteri.java', code: MN.merakli.src, badge: 'meraklı' }], roleOf: MN.roleOf, special: MN.special, compact: true });
      cv.mark('YedekDefteri.java', 'yedekler.get(ad).raflar', 'bad');
      const con = h('div', { class: 'console mnt-console is-yapi' });
      infoCode.appendChild(con);
      MN.renderConsole(con, '$ javac *.java', MN.merakli.hata.map((t, k) => ({ t, k: k === 0 ? 'hata' : 'x' })), { title: 'Derleyici' });
      DP.flash(infoTop, 'is-pop');
    }

    function showBedel() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">Bedeli ve akrabaları</div>
        <p class="info-desc">${md('Her hatıra durumun **kopyası**: depo büyükse ya da sık kaydediliyorsa bellek ve zaman harcar. Emanetçi bu bedeli göremez; ne kadar büyük bir zarf sakladığını bilmez.')}</p>
        <table class="cmp mnt-cmp">
          <thead><tr><th>Fikir</th><th>Ne yapar?</th></tr></thead>
          <tbody>
            <tr><td>Artımlı hatıra</td><td>${md('Bütün durumu değil, yalnızca **değişen** kısmı saklar (ör. son işlemden etkilenen raflar)')}</td></tr>
            <tr><td>Command + Memento</td><td>${md('Tersi zor bir komut (ör. “rafları düzenle”), `geriAl()` için çalışmadan önce bir hatıra tutar')}</td></tr>
            <tr><td>Değişmez durum</td><td>${md('Durum zaten değişmezse (ör. `record` + `List.copyOf`) kopyalamadan paylaşılabilir')}</td></tr>
          </tbody>
        </table>`;
      DP.flash(infoTop, 'is-pop');
    }

    const STEPS = [
      { t: 'Genel bakış', x: 'Dört rol: durumu tutan **kaynak** ([[Depo]]), onun anlık görüntüsü **hatıra** ([[Hatira]]), hatırayı saklayan **emanetçi** ([[YedekDefteri]]) ve hepsini kullanan **istemci** ([[Main]]).', info: null },
      { t: 'Originator — `Depo`', x: '[[Depo]] hatırasını kendisi oluşturuyor ve ona kendisi dönüyor. Neyin, ne kadar derin kopyalanacağını en iyi o biliyor; iç durumunu kimseye açmıyor.', info: 'Depo', focus: { classes: ['Depo'], members: [['Depo', 'hatiraOlustur'], ['Depo', 'hatirayaDon']] } },
      { t: 'Memento — `Depo.Hatira`', x: '[[Hatira]] Depo’nun **iç sınıfı** (⊕). Alanları ve kurucusu private; içerik kurucuda kopyalanıyor ve bir daha değişmiyor.', info: 'Hatira', focus: { classes: ['Hatira', 'Depo'], edges: ['icinde'] } },
      { t: 'Caretaker — `YedekDefteri`', x: '[[YedekDefteri]] hatıraları adıyla saklıyor (◇ = saklar) ve geri veriyor. Deponun hangi alanları olduğunu **bilmiyor**; depo değişse de defter değişmiyor.', info: 'YedekDefteri', focus: { classes: ['YedekDefteri', 'Hatira'], edges: ['yedekler', 'depo'] } },
      { t: 'Client — `Main`', x: '[[Main]] plandan önce kayıt, hata olunca geri dönüş istiyor. **Ne zaman** kaydedileceğine istemci (ya da emanetçi), **nasıl** kaydedileceğine kaynak karar veriyor.', info: 'Main', focus: { classes: ['Main', 'YedekDefteri'], edges: ['c-main'] } },
      { t: 'Dar ve geniş arayüz', x: 'GoF’un en ince noktası: hatıranın kaynağa **geniş**, emanetçiye **dar** bir yüzü olmalı. Java’da bunu iç sınıf ve `private` sağlıyor; emanetçi içine bakmaya kalkarsa derleyici izin vermiyor (gerçek `javac` çıktısı).', arayuz: true, focus: { classes: ['Hatira', 'YedekDefteri'], edges: ['yedekler'] } },
      { t: 'Bedeli ve akrabaları', x: 'Hatıra bir **kopya**: bellek ve zaman ister. Bedeli düşürmenin yolları var: yalnızca değişeni saklamak, değişmez durum. Command de tersi zor işlemlerde bir hatıra tutabilir.', bedel: true, focus: { classes: ['Hatira'] } },
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
        infoCode.classList.remove('mnt-info-col');
        if (s.arayuz) showArayuz();
        else if (s.bedel) showBedel();
        else if (s.info) showInfo(s.info);
        else showOverview();
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };

  // ================================================================== 7. GENİŞLET: geri al / yinele (DepoGecmisi)
  MN.scenes.extend = function (root, ctx) {
    const S = ctx.state;
    S.ext = S.ext || {};
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-50' });
    const left = kit.panel('Görev: <code class="mnt-code-t">DepoGecmisi</code>', { cls: 'panel-code panel-ex' });
    const right = kit.panel('Depo', { cls: 'panel-side mnt-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    // ---- sol (adım 0): alıştırma
    const exBox = h('div', { class: 'ex-box' });
    const task = h('div', {
      class: 'task-card',
      html: md('📩 **Vardiya şefi:** “Operatörler her işlemden sonra **geri al** diyebilsin, geri aldıklarını **yineleyebilsin**. Her işlem için ayrı bir ters işlem yazmak istemiyoruz.”\nKural: Depo ve YedekDefteri değişmeyecek.'),
    });
    const ex = kit.blankExercise({
      files: [
        { name: 'DepoGecmisi.java', code: EX.exercise, badge: 'YENİ' },
        { name: 'Main.java · ek', code: EX.exerciseMain },
      ],
      answers: EX.answers,
      hints: {
        1: 'Yığında hangi türden nesneler duruyor?',
        2: 'İşlemden önce depodan ne istenir?',
        3: 'Depo, saklanan hatıraya hangi yöntemle döner?',
        4: 'Son işlemi geri almak için geçmişe ne denir?',
      },
      choices: ['Depo', 'Depo.Hatira', 'YedekDefteri', 'hatiraOlustur', 'hatirayaDon', 'kaydet', 'geriYukle', 'geriAl'],
      roleOf: MN.roleOf,
      special: MN.special,
      state: S.ext,
      doneText: '<b class="ok">✔ Derleme başarılı!</b> Geri al / yinele hazır.',
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
    const runBox = h('div', { class: 'mnt-runbox', hidden: true });
    const runCode = h('div', { class: 'mnt-cv' });
    const runConsole = h('div', { class: 'console mnt-console' });
    runBox.append(runCode, runConsole);
    left.body.append(exBox, runBox);
    const runCv = new DP.CodeView(runCode, { roleOf: MN.roleOf, special: MN.special });

    // ---- sağ: depo + etki
    const viewHost = h('div', { class: 'mnt-view' });
    const impact = h('div', { class: 'mnt-extra' });
    right.body.append(viewHost, impact);
    const stage = new MN.DepoSahne(viewHost);

    const prog = EX.prog;
    const r = MN.run(prog);
    const O = r.olaylar;
    const ikinciGeri = O.filter((o) => o.e === 'geriAl')[1];
    const sonGeri = ikinciGeri;
    const yinele = O.find((o) => o.e === 'yinele');
    const bas = MN.stateFrom(prog, MN.BOS_AN(prog), { banner: { text: 'Her işlemden önce bir hatıra: geri al, en son hatıraya dönmek demek.' } });
    const geriSonrasi = MN.stateFrom(prog, sonGeri.s, { hl: { 'KRG-1001': 'ok', 'KRG-1003': 'ok' }, masa: MN.masaOf(sonGeri.s, 'ac', 'h'), banner: { text: '↶ ↶ İki geri al: depo yine **sabah** hâlinde (geçmişte 2 hatıra ileri yığınında)', tone: 'ok' } });
    const yineleSonrasi = MN.stateFrom(prog, yinele.s, { hl: { 'KRG-1001': 'move' }, masa: MN.masaOf(yinele.s, 'ac', 'h'), banner: { text: '↷ Yinele: taşıma geri geldi (1001 → B3); yükleme hâlâ geri alınmış', tone: 'ok' } });
    const STEPS = [
      {
        t: 'Görev: `DepoGecmisi`',
        x: 'Boşluklara tıklayıp doğru parçaları seçin. İpucu: geçmiş, hatıralardan oluşan iki **yığın**. Her işlemden önce depodan bir hatıra istenir; geri alırken en üstteki hatıraya dönülür.',
        st: bas,
      },
      {
        t: 'Derlendi: iki işlem, iki geri al',
        x: 'Taşı ve yükle’den önce birer hatıra alındı. İki “geri al” depoyu önce yüklemeden önceki, sonra taşımadan önceki hâline döndürdü. Geri alırken o anki hâl de bir hatıra olarak **ileri** yığınına kondu.',
        st: geriSonrasi,
      },
      {
        t: 'Yinele',
        x: '“Yinele” ileri yığınındaki hatırayı geri getirdi: 1001 yine B3’te. [[Depo]] ve [[YedekDefteri]]’ne tek satır eklemedik; yeni bir **emanetçi** yazdık.',
        st: yineleSonrasi,
      },
      {
        t: 'Command’la karşılaştırın',
        x: 'Command’da her komut kendi **ters işlemini** biliyordu; burada ters işlem yok, her işlemden önce bir **fotoğraf** var. Kolay ve genel, ama her işlemde bütün depo kopyalanıyor. **Geri al / yinele** artık Yedek Tezgâhı’nda da açık.',
        st: Object.assign({}, yineleSonrasi, { banner: { text: 'Command: ters işlem · Memento: önceki hâlin fotoğrafı', tone: 'ok' } }),
      },
    ];

    function renderLeft(i) {
      exBox.hidden = i >= 1;
      runBox.hidden = i < 1;
      left.head.querySelector('.panel-title').innerHTML = i >= 1 ? 'Yeni emanetçi: <code class="mnt-code-t ver">DepoGecmisi</code>' : 'Görev: <code class="mnt-code-t">DepoGecmisi</code>';
      if (i < 1) return;
      // önce konsol (yüksekliği değişir), sonra koddaki işaret
      const kadar = i === 1 ? sonGeri.n : r.lines.length;
      MN.renderConsole(runConsole, MN.cmd(true), r.lines.slice(0, kadar).map((l) => MN.consoleLine(l)));
      runCv.setFiles(
        [
          { name: 'DepoGecmisi.java', code: C.DepoGecmisi, badge: 'YENİ' },
          { name: 'Main.java', code: EX.Main },
        ],
        { active: i === 1 ? 'DepoGecmisi.java' : i === 2 ? 'DepoGecmisi.java' : 'Main.java', keepActive: false }
      );
      if (i === 1) runCv.mark('DepoGecmisi.java', ['public void geriAl() {', 'System.out.println("[Geçmiş] geri alındı");'], 'focus');
      else if (i === 2) runCv.mark('DepoGecmisi.java', ['public void yinele() {', 'System.out.println("[Geçmiş] yinelendi");'], 'focus');
      else runCv.mark('Main.java', ['gecmis.islemOncesi();', 'gecmis.yinele();'], 'focus');
    }

    function renderImpact(i, animate) {
      if (i === 0) {
        impact.innerHTML = `<div class="impact-title">İpucu</div><p>${md('Defter `kaydet` derken depodan ne istiyordu? Geçmiş de aynısını yapacak: `depo.hatiraOlustur()`. Dönmek için de `depo.hatirayaDon(…)`.')}</p>`;
      } else if (i === 1) {
        impact.innerHTML = `
          <div class="impact-title ok">✔ Derleme başarılı · yeni emanetçi</div>
          <ul class="filelist"><li><span class="cv-dot rc rc-${MN.roleOf('DepoGecmisi')}"></span>DepoGecmisi.java <span class="cv-badge is-new">YENİ</span></li></ul>`;
      } else if (i === 2) {
        impact.innerHTML = `
          <div class="metrics">
            <div class="metric is-good"><div class="m-val">1</div><div class="m-label">yeni sınıf</div></div>
            <div class="metric is-good"><div class="m-val">0</div><div class="m-label">değişen sınıf</div></div>
            <div class="metric"><div class="m-val">${r.son.kopyalanan}</div><div class="m-label">kopyalanan kayıt</div></div>
          </div>`;
      } else {
        impact.innerHTML = `
          <table class="cmp mnt-cmp">
            <thead lang="en"><tr><th>Geri al</th><th>Command</th><th>Memento</th></tr></thead>
            <tbody>
              <tr><td>Ne saklanır?</td><td>komut + kendi kaydı</td><td>bütün durumun kopyası</td></tr>
              <tr><td>Yeni işlem türü</td><td class="bad">tersini de yaz</td><td class="ok">bir şey yazma</td></tr>
              <tr><td>Bellek</td><td class="ok">az (yalnızca kayıt)</td><td class="bad">her işlemde tam kopya</td></tr>
            </tbody>
          </table>
          <div class="mnt-go"><button class="btn btn-primary btn-sm" type="button" data-go>🗂 Yedek Tezgâhı’nda dene →</button></div>`;
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
          S.gecmisUnlocked = true;
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
  const RW = MN.rw;
  const TABS = [
    {
      tab: 'Serializable',
      title: '`Serializable` — bayt dizisine bir hatıra',
      intro: 'Serileştirme, bir nesnenin durumunu **getter yazmadan** bayt dizisine döker; geri okumak o durumu canlandırır. Neyin kaydedileceğine sınıfın kendisi karar verir: `transient` alan hatıraya girmez. Saklayan (dosya, ağ, bayt dizisi) içindekileri anlamaz.',
      map: [
        ['originator', 'Depo', '`Kamyon` (`Serializable`)'],
        ['memento', 'Hatira', '`byte[]` (serileştirilmiş durum)'],
        ['caretaker', 'YedekDefteri', 'bayt dizisini saklayan kod, dosya, veritabanı'],
        ['client', 'Main', '`kaydet` ve `geriOku` çağıran kod'],
      ],
      note: 'Geri okumak **yeni bir nesne** yaratır; bizim `hatirayaDon` ise aynı nesneyi eski hâline getiriyordu. `private` alanlar da kaydedilir: kapsülleme bozulmadan. Çıktılar Java 21 ile alındı.',
      roles: { Kamyon: 'originator', ObjectOutputStream: 'caretaker', ObjectInputStream: 'caretaker' },
      file: 'SeriHatira.java',
      code: RW.seri,
      options: RW.seriOpts,
      mark: 'byte[] hatira = kaydet(kamyon);',
      cmd: '$ java SeriHatira',
    },
    {
      tab: 'StateEdit',
      title: '`javax.swing.undo.StateEdit` — JDK’nın hazır hatırası',
      intro: '`StateEditable` bir nesne durumunu bir `Hashtable`’a kendisi yazar (`storeState`) ve oradan kendisi okur (`restoreState`). `StateEdit` düzenlemeden **önceki** ve **sonraki** hâlin hatırasını tutar; `undo()` ve `redo()` onları nesneye geri verir.',
      map: [
        ['originator', 'Depo', '`StateEditable` (`Koli`)'],
        ['memento', 'Hatira', '`Hashtable` (önceki / sonraki durum)'],
        ['caretaker', 'YedekDefteri', '`StateEdit` (`undo`, `redo`)'],
        ['client', 'Main', 'düzenlemeyi başlatıp bitiren kod'],
      ],
      note: '`StateEdit` bir `UndoableEdit`’tir: Command modülündeki `UndoManager`’a da eklenebilir. Program pencere açmadan çalışır. Çıktılar Java 21 ile alındı.',
      roles: { Koli: 'originator', StateEditable: 'originator', StateEdit: 'caretaker', Hashtable: 'memento' },
      file: 'DurumDuzenleme.java',
      code: RW.stateEdit,
      options: RW.stateEditOpts,
      mark: 'StateEdit tasima = new StateEdit(koli, "taşı");',
      cmd: '$ java DurumDuzenleme',
    },
    {
      tab: 'record',
      title: '`record` — değişmez ama sığ',
      intro: 'Bir `record` hatıra için çekici görünür: alanları `final`, kendisi değişmez. Ama içindeki liste **sığ** kopyalanır: listeyi kopyalamazsanız hatıra canlı kalır, Sorun’daki referans tuzağının aynısı. Üstelik erişimcileri public’tir: emanetçi içine bakabilir.',
      map: [
        ['memento', 'Hatira', '`record Hatira(List<String> kamyon)`'],
        ['originator', 'Depo', 'listeyi tutan kod'],
        ['fm', 'hatiraOlustur', '`new Hatira(List.copyOf(kamyon))`'],
      ],
      note: '`List.copyOf` hem kopyalar hem de değiştirilemez bir liste döndürür: hatıra için en güvenli yol. Dar arayüz isteniyorsa `record`’u kaynağın içine `private` bir iç tür olarak koyun. Çıktılar Java 21 ile alındı.',
      roles: { Hatira: 'memento' },
      file: 'KayitHatira.java',
      code: RW.kayit,
      options: RW.kayitOpts,
      mark: 'System.out.println("hatıradaki kamyon: " + h.kamyon());',
      cmd: '$ java KayitHatira',
    },
    {
      tab: 'Karıştırmayın!',
      title: 'Memento, Command ve Prototype',
      intro: 'Üçü de bir şeyi “saklar” ya da “kopyalar”. Fark: saklanan ne ve onu kim, ne için kullanıyor?',
      extraHtml: `<table class="cmp cmp-3">
        <thead lang="en"><tr><th></th><th>Memento</th><th>Command</th><th>Prototype</th></tr></thead>
        <tbody>
          <tr><td>Ne saklanır?</td><td>Bir nesnenin <b>durumu</b></td><td>Bir <b>istek</b> (+ geri alma kaydı)</td><td>Bir <b>nesne</b> (şablon)</td></tr>
          <tr><td>Kopyayı kim çıkarır?</td><td>Kaynak nesnenin kendisi</td><td>Komut, çalışırken</td><td>Prototip kendini kopyalar</td></tr>
          <tr><td>Sonuç</td><td>Aynı nesne <b>eski hâline</b> döner</td><td>Ters işlem çalışır</td><td><b>Yeni</b> bir nesne doğar</td></tr>
          <tr><td>Kapsülleme</td><td>Hatıranın içi gizli</td><td>—</td><td>Kopya da tam bir nesne</td></tr>
        </tbody></table>`,
      note: 'Command’ın geri alması ters işlemi bilir (taşı ↔ geri taşı); Memento eski durumu saklar. Tersi zor işlemlerde ikisi birlikte kullanılır: komut, `geriAl()` için bir hatıra tutar.',
      roles: { Depo: 'originator', Hatira: 'memento' },
      special: MN.special,
      file: 'Karsilastirma.java',
      code: () => `// Memento: durum saklanır; aynı nesne o duruma döner
Depo.Hatira h = depo.hatiraOlustur();  …  depo.hatirayaDon(h);

// Command: istek saklanır; geri alma ters işlemle
panel.yap(new TasiKomutu(depo, "KRG-1001", "B3"));  …  panel.geriAl();

// Prototype: nesne kopyalanır; kopya yeni bir nesnedir
Gonderi kopya = sablon.kopyala();`,
      mark: 'Depo.Hatira h = depo.hatiraOlustur();  …  depo.hatirayaDon(h);',
    },
  ];

  MN.scenes.realworld = (root, ctx) =>
    kit.realWorldScene(root, ctx, {
      tabs: TABS,
      roles: MN.roles,
      roleOf: MN.roleOf,
      fmLabel: 'hatıra yöntemi',
      footText: (i) =>
        i === 3
          ? 'Benzer görünüyorsa **ne saklandığına** bakın: Memento bir durum, Command bir istek, Prototype bir nesne saklar.'
          : i === 2
          ? 'Değişmez bir kayıt bile içindeki listeyi kopyalamazsa canlı kalır: hatırada kopyayı kaynak çıkarmalı.'
          : i === 1
          ? 'JDK’da hazır bir Memento: nesne durumunu kendisi yazar ve okur, `StateEdit` saklar.'
          : 'Serileştirme bir hatıradır: kaydedilen bayt dizisinden kayıt anındaki durum geri okunur.',
    });

  // ================================================================== 9. QUIZ
  const Q = [
    {
      type: 'mcq',
      q: 'Memento kalıbının **temel amacı** (GoF) nedir?',
      options: ['Bir isteği nesne olarak paketlemek; böylece istekler sıraya konabilsin, kaydedilsin ve geri alınabilsin', 'Var olan bir nesneyi kopyalayarak, sınıfını belirtmeden yeni nesneler üretmek ve çoğaltmak', 'Kapsüllemeyi bozmadan bir nesnenin iç durumunu yakalayıp saklamak; nesne sonra o duruma dönebilsin', 'Bir nesnenin, iç durumu değiştikçe davranışını da değiştirmesine izin vermek; sanki sınıfı değişmiş gibi'],
      answer: 2,
      explain: 'Diğerleri Command, Prototype ve State’in amaçları.',
    },
    {
      type: 'line',
      q: 'Bu sınıfta hatırada **kamyonun kopyalandığı** satıra tıklayın.',
      codeName: 'Depo.java',
      code: yorumsuz(MN.plain(C.Depo)),
      answer: 'this.kamyon = new ArrayList<>(kamyon);',
      explain: 'Hatıranın kurucusu listeyi kopyalıyor; böylece depo sonra değişse de hatıra değişmiyor.',
    },
    {
      type: 'mcq',
      q: 'Sürüm 1.0’da geri yükleme neden hiçbir şey değiştirmedi?',
      options: ['Yedek, deponun kendi haritasıydı; getRaflar() yeni bir nesne yaratmaz', 'setRaflar() private olduğu için defter onu çağıramadı ve depo hiç değişmedi', 'TreeMap, içine yeni değer konunca eski değerleri kendiliğinden siler', 'Geri yükleme, gece planı bittikten sonra çalıştığı için çok geç kalmıştı'],
      answer: 0,
      explain: '`yedek = depo.getRaflar()` aynı haritaya ikinci bir ad verir. Plan haritayı değiştirince “yedek” de değişti; `setRaflar(yedek)` aynı nesneyi yeniden bağladı.',
    },
    {
      type: 'line',
      q: 'Bu sınıfta emanetçinin hatırayı **depoya geri verdiği** satıra tıklayın.',
      codeName: 'YedekDefteri.java',
      code: yorumsuz(MN.plain(C.YedekDefteri)),
      answer: 'depo.hatirayaDon(yedekler.get(ad));',
      explain: 'Defter hatırayı açmıyor; yalnızca depoya veriyor. İçini okuyup kendini eski hâline getiren Depo.',
    },
    {
      type: 'mcq',
      q: '`YedekDefteri` sınıfı bu tasarımda hangi rolde?',
      options: ['Originator', 'Caretaker', 'Memento', 'Client'],
      answer: 1,
      explain: 'Hatırayı saklayan ve geri veren, ama içine bakmayan sınıf emanetçidir (Caretaker).',
    },
    {
      type: 'mcq',
      q: '`Depo.Hatira`’nın alanları ve kurucusu neden private?',
      options: ['Java, iç sınıfların bütün alanlarının ve kurucularının private olmasını ister', 'Private alanlar bellekte daha az yer kaplar; hatıralar küçük kalsın diye', 'Hatıra her geri yüklemede yeniden kurulmasın, bir kez kullanılsın diye', 'Hatırayı yalnızca Depo oluşturup açabilsin; defter saklasın ama bakamasın'],
      answer: 3,
      explain: 'Geniş arayüz kaynağa, dar arayüz emanetçiye: iç sınıf ve `private` Java’da bu ikiliği kurar. Emanetçi içine bakmaya kalkarsa kod derlenmez.',
    },
    {
      type: 'mcq',
      q: 'Sürüm 2.0’da kamyon neden geri yüklenmedi?',
      options: ['ArrayList kopyalanırken boş kaldığı için kamyonun kopyası hiç alınamadı', 'Yedeği defter alıyordu; depoya eklenen kamyonu defter bilmiyordu', 'Kamyon alanı final olduğu için setKamyon() onu bir türlü değiştiremedi', 'Gece planı kamyonu kilitlediği için geri yüklemede ona dokunulamadı'],
      answer: 1,
      explain: 'Yedek dışarıdan alınınca depodaki her yeni alan defterde de değişiklik ister. Memento’da kopyayı Depo çıkardığı için yeni alan aynı dosyada ele alınır.',
    },
    {
      type: 'mcq',
      q: 'Memento ile Command’ın geri alması arasındaki fark nedir?',
      options: ['Command durumu saklayıp ona döner; Memento işlemin tersini çalıştırır', 'İkisi de tamamen aynı yolu izler; aradaki fark yalnızca sınıf adlarındadır', 'Memento yalnızca tek seviye, Command ise sınırsız geri alır', 'Memento eski durumu saklayıp ona döner; Command işlemin tersini çalıştırır'],
      answer: 3,
      explain: 'Command her işlemin tersini bilir (taşı ↔ geri taşı); Memento önceki hâlin fotoğrafını saklar. Tersi zor işlemlerde komut bir hatıra tutabilir.',
    },
    {
      type: 'mcq',
      q: 'Hatıraların **bedeli** nedir?',
      options: ['Her hatıra durumun bir kopyasıdır: büyük ya da sık kayıt bellek ve zaman ister', 'Hatıralar yalnızca diske yazılabilir; bu yüzden her kayıt yavaş bir dosya işlemidir', 'Hatıra kullanan sınıflar kalıtıma kapanır; onlardan alt sınıf yazılamaz hâle gelir', 'Her hatıra, kaynağın bütün metotlarını da kopyaladığı için kodu büyütür'],
      answer: 0,
      explain: 'Emanetçi zarfın ne kadar büyük olduğunu bilmez. Bedeli düşürmek için yalnızca değişen kısım ya da değişmez durum saklanabilir.',
    },
  ];

  MN.scenes.quiz = (root, ctx) =>
    kit.quizScene(root, ctx, {
      questions: Q,
      roleOf: MN.roleOf,
      special: MN.special,
      patternName: 'Memento',
      match: {
        items: ['Depo', 'Hatira', 'YedekDefteri', 'DepoGecmisi', 'Main'].map((id) => ({ id, label: id === 'Hatira' ? 'Depo.Hatira' : id })),
        buckets: ['originator', 'memento', 'caretaker', 'client'].map((k) => ({ id: k, title: MN.roles[k].en, sub: MN.roles[k].tr, color: MN.roles[k].color })),
        answer: MN.classRoles,
        hint: 'Beş sınıfı dört role yerleştirin. Takıldığınızda **Cevapları göster** düğmesi var.',
      },
    });

  // ================================================================== 10. ÖZET
  MN.scenes.summary = function (root, ctx) {
    const at = DP.catalog.findIndex((p) => p.id === 'memento');
    const next = DP.catalog.slice(at + 1).find((p) => p.ready && DP.patterns[p.id]);
    const el = h('div', { class: 'scene scene-summary' });
    el.innerHTML = `
      <div class="sum-head">
        <div>
          <div class="chips"><span class="chip chip-cat is-behav">Davranışsal · Behavioral</span><span class="chip">Anahtar kelime: kapsülleme bozulmadan geri dönmek</span></div>
          <h1>Memento — Özet</h1>
        </div>
        <div class="sum-actions no-print">
          <button class="btn btn-ghost" type="button" data-print>🖨 Yazdır / PDF</button>
          <a class="btn btn-ghost" href="#/mediator/ozet">← Mediator özeti</a>
          <a class="btn btn-ghost" href="#/">Tüm kalıplar</a>
          ${next ? `<a class="btn btn-primary" href="#/${next.id}">Sıradaki kalıp: ${DP.esc(next.name)} →</a>` : ''}
        </div>
      </div>
      <div class="sum-grid">
        <article class="card sum-intent">
          <h3>Amaç</h3>
          <p><b>Kapsüllemeyi bozmadan</b> bir nesnenin iç durumunu yakala ve dışarıda sakla; nesne daha sonra <b>o duruma geri döndürülebilsin</b>.</p>
          <div class="sum-formula"><code>defter.kaydet(ad)</code> → <code>depo.hatiraOlustur()</code> <span>(geri: <code>depo.hatirayaDon(h)</code>)</span></div>
        </article>
        <article class="card sum-uml"><h3>Yapı (GoF)</h3><div class="sum-diag"></div></article>
        <article class="card">
          <h3>Dışarıdan yedek ↔ Memento</h3>
          <table class="cmp sg-sum-cmp">
            <thead lang="en"><tr><th></th><th>Kalıpsız</th><th>Memento</th></tr></thead>
            <tbody>
              <tr><td>Kopyayı kim çıkarır?</td><td class="bad">defter (get/set ile)</td><td class="ok">Depo’nun kendisi</td></tr>
              <tr><td>İç durum</td><td class="bad">herkese açık</td><td class="ok">kapalı (private)</td></tr>
              <tr><td>Referans tuzağı</td><td class="bad">“yedek” = aynı nesne</td><td class="ok">kurucuda kopya</td></tr>
              <tr><td>Yeni alan</td><td class="bad">defter de değişmeli</td><td class="ok">yalnızca Depo değişir</td></tr>
            </tbody>
          </table>
        </article>
        <article class="card">
          <h3>Katılımcılar</h3>
          <ul class="sum-roles">
            <li>${ui.roleChip('originator')}<span>hatırayı oluşturur, ona döner</span></li>
            <li>${ui.roleChip('memento')}<span>durumun kopyası; içi gizli</span></li>
            <li>${ui.roleChip('caretaker')}<span>saklar, geri verir; içine bakmaz</span></li>
            <li>${ui.roleChip('client')}<span>ne zaman kaydedileceğini seçer</span></li>
          </ul>
        </article>
        <article class="card sum-pros">
          <h3>Artıları</h3>
          <ul>
            <li><b>Kapsülleme korunur</b>: get/set gerekmez</li>
            <li>Kopyalama bilgisi tek yerde: <b>kaynakta</b></li>
            <li>Kayıt noktaları, geri al / yinele, “ya hep ya hiç”</li>
            <li>Emanetçi basit kalır; kaynak değişse de değişmez</li>
          </ul>
        </article>
        <article class="card sum-cons">
          <h3>Eksileri</h3>
          <ul>
            <li>Her hatıra bir <b>kopya</b>: bellek ve zaman</li>
            <li>Emanetçi hatıranın ne kadar büyük olduğunu bilmez</li>
            <li>Dar arayüz her dilde kolay değil (Java’da iç sınıf)</li>
            <li>Sık kayıtta artımlı hatıra gerekebilir</li>
          </ul>
        </article>
        <article class="card">
          <h3>İlişkili kalıplar</h3>
          <ul>
            <li><b>Command:</b> geri alınabilir komutlar durumu bir hatırada saklayabilir.</li>
            <li><b>Prototype:</b> kopya yeni bir nesnedir; hatıra ise aynı nesneyi eski hâline döndürür.</li>
            <li><b>Iterator:</b> dolaşmanın konumu bir hatıra olarak saklanabilir.</li>
          </ul>
        </article>
        <article class="card sum-tip">
          <h3>Sınav ipuçları</h3>
          <pre class="mini-code">class Depo {                                        // Originator
    public Hatira hatiraOlustur() { return new Hatira(raflar, kamyon); }
    public void hatirayaDon(Hatira h) { raflar.clear(); raflar.putAll(h.raflar); … }
    public static final class Hatira {              // Memento
        private final Map&lt;String, String&gt; raflar;   // yalnızca Depo görür
        private Hatira(…) { this.raflar = new TreeMap&lt;&gt;(raflar); … }
    }
}
yedekler.put(ad, depo.hatiraOlustur());             // Caretaker: saklar, bakmaz</pre>
          <p class="exam"><b>Kapsüllemeyi bozmadan geri dönmek</b> → Memento · <b>Originator, Memento, Caretaker</b> · kopyayı <u>kaynak</u> çıkarır · emanetçi içine <u>bakmaz</u> · referans ≠ kopya</p>
        </article>
        <article class="card sum-files">
          <h3>Java kodları</h3>
          <p>Çalıştırılabilir örnekler proje klasöründe:</p>
          <pre class="mini-code">java/memento/sorun      → dışarıdan yedek; kamyon unutuldu, koliler iki yerde
java/memento/cozum      → Depo.Hatira: kaynak kendi hatırasını oluşturur
java/memento/akis/...   → Canlı Akış: gece · noktalar
java/memento/tezgah/... → aynı oturum: referans · kopya · hatira
java/memento/genislet   → DepoGecmisi: hatıralarla geri al / yinele</pre>
          <p>Derleyip çalıştırmak için <code>java/README.md</code> dosyasına bakın.</p>
        </article>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-print]').addEventListener('click', () => window.print());
    const diag = new DP.ClassDiagram(el.querySelector('.sum-diag'), MN.gofDiagram({}), { roles: MN.roles, roleTags: false, mode: 'generic' });
    diag.svg.classList.add('is-compact');
    return { destroy() {} };
  };

  // ================================================================== kayıt
  DP.register({
    id: 'memento',
    name: 'Memento',
    tr: 'Hatıra',
    category: 'behavioral',
    roleOf: MN.roleOf,
    initialState: () => ({
      view: 'stage',
      showCode: true,
      preset: 'gece',
      tz: { design: 'hatira', ops: MN.TEZGAH_ANA.slice() },
      gecmisUnlocked: false,
      ext: {},
      quiz: { results: {}, match: false },
    }),
    scenes: [
      { id: 'giris', title: 'Giriş', mount: MN.scenes.intro },
      { id: 'sorun', title: 'Sorun', mount: MN.scenes.problem },
      { id: 'cozum', title: 'Çözüm', mount: MN.scenes.solution },
      { id: 'akis', title: 'Canlı Akış', mount: MN.scenes.flow, star: true },
      { id: 'tezgah', title: 'Yedek Tezgâhı', mount: MN.scenes.counter, star: true },
      { id: 'yapi', title: 'Yapı (UML)', mount: MN.scenes.structure },
      { id: 'genislet', title: 'Genişlet', mount: MN.scenes.extend },
      { id: 'gercek', title: 'Gerçek Dünya', mount: MN.scenes.realworld },
      { id: 'quiz', title: 'Quiz', mount: MN.scenes.quiz },
      { id: 'ozet', title: 'Özet', mount: MN.scenes.summary },
    ],
  });
})();
