/*
 * Adapter — sahneler (3/3): Yapı, Genişlet, Gerçek Dünya, Quiz, Özet ve kalıp kaydı
 */
(function () {
  'use strict';
  const AD = DP.ad;
  const { h } = DP;
  const kit = DP.kit;
  const ui = AD.ui;
  const md = AD.md;
  const C = AD.code;
  const EC = AD.euro;

  // ================================================================== 6. YAPI
  const ROLE_TEXT = {
    client: 'Hedef arayüze uyan nesnelerle çalışır; karşısındakinin bir adaptör olduğunu <b>bilmez</b>.',
    target: 'İstemcinin kullandığı, alana özgü arayüz: <b>bizim dilimiz</b>.',
    adapter: 'Uyarlananın arayüzünü hedef arayüze <b>çevirir</b> ve çağrıları ona iletir.',
    adaptee: 'Uyarlanması gereken, <b>var olan</b> arayüz; çoğu zaman değiştirilemez.',
  };

  function classInfo(id, form) {
    switch (id) {
      case 'GonderiServisi':
        return { role: 'client', file: 'GonderiServisi.java', code: C.GonderiServisi, mark: 'firma.gonderiOlustur(nereden, nereye, kg)', points: ['Yalnızca **hedef arayüzü** (`KargoFirmasi`) tanır.', 'Karşısında yerli firma da olsa adaptör de olsa **aynı** kodu çalıştırır.', 'Yabancı kütüphaneden **habersizdir**.'] };
      case 'KargoFirmasi':
        return { role: 'target', file: 'KargoFirmasi.java', code: C.KargoFirmasi, mark: 'String gonderiOlustur(', points: ['İstemcinin **beklediği** arayüz: TR adlar, kilogram.', 'Yerli firmalar onu **doğrudan** uygular; yabancılar **adaptörle**.', 'Adaptör ona uyar; o adaptöre göre değişmez.'] };
      case 'GlobalShipApi':
        return { role: 'adaptee', file: 'GlobalShipApi.java', code: C.GlobalShipApi, mark: 'public long createShipment(', points: ['Var olan, **değiştiremediğimiz** sınıf (üçüncü parti).', 'Kendi dili var: `createShipment`, **lb**, sayısal numara, durum **kodu**.', 'Adaptörün varlığından **habersizdir**.'] };
      case 'Adaptor':
        return form === 'sinif'
          ? { role: 'adapter', file: 'GlobalShipSinifAdaptoru.java', code: AD.sinif.adaptor, mark: 'extends GlobalShipApi implements KargoFirmasi', points: ['Uyarlanandan **kalıtır**, hedefi **uygular**.', 'Tek nesne; miras alınan metodu doğrudan çağırır.', 'Uyarlanan `final` ise yazılamaz.'] }
          : { role: 'adapter', file: 'GlobalShipAdaptoru.java', code: C.GlobalShipAdaptoru, mark: 'public class GlobalShipAdaptoru implements KargoFirmasi', points: ['Hedef arayüzü **uygular**, uyarlananı bir **alanda tutar**.', 'Bütün çeviri burada: **ad, birim, numara, durum**.', 'İstemciye yalnızca hedef arayüzün metotlarını gösterir.'] };
      default:
        return null;
    }
  }

  AD.scenes.structure = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split' });
    const tools = h('div', { class: 'panel-tools' });
    const body = h('div', { class: 'scene-body cols-64' });
    const left = kit.panel('Yapı', { cls: 'panel-diagram', extra: tools });
    const right = kit.panel('Rol kartı <span class="panel-sub">· bir sınıfa tıklayın</span>', { cls: 'panel-side' });
    body.append(left.el, right.el);
    el.append(body);
    root.appendChild(el);

    const diagHost = h('div', { class: 'diag-host' });
    const legend = kit.umlLegend({ association: true, fmLabel: 'çeviri yapan metot (adaptör)' });
    left.body.append(diagHost, legend);
    let form = 'nesne';
    const diagram = new DP.ClassDiagram(diagHost, AD.gofDiagram({ form, notes: true }), {
      roles: AD.roles,
      onSelect: (id) => {
        showInfo(id);
        diagram.focus({ classes: [id] });
        diagram.select(id);
      },
    });

    const formSeg = kit.seg(
      [
        { v: 'nesne', label: 'Nesne adaptörü' },
        { v: 'sinif', label: 'Sınıf adaptörü' },
      ],
      'nesne',
      (v) => setForm(v)
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
    tools.append(formSeg.el, modeSeg.el, tagToggle);

    function setForm(v) {
      if (v === form) return;
      form = v;
      formSeg.set(v);
      diagram.update(AD.gofDiagram({ form, notes: true }), { animate: true });
    }

    const infoTop = h('div', { class: 'info-card' });
    const infoCode = h('div', { class: 'info-code' });
    right.body.append(infoTop, infoCode);

    function showInfo(id) {
      const info = classInfo(id, form);
      infoCode.innerHTML = '';
      if (!info) return;
      const r = AD.roles[info.role];
      infoTop.innerHTML = `
        <div class="info-role rc rc-${r.color}"><span class="info-dot"></span><b>${r.en}</b> · ${r.tr}</div>
        <div class="info-name rc rc-${r.color}">${DP.esc(id === 'Adaptor' ? (form === 'sinif' ? 'GlobalShipSinifAdaptoru' : 'GlobalShipAdaptoru') : id)}</div>
        <p class="info-desc">${ROLE_TEXT[info.role]}</p>
        <ul class="info-points">${info.points.map((p) => `<li>${md(p)}</li>`).join('')}</ul>`;
      const cv = new DP.CodeView(infoCode, { files: [{ name: info.file, code: info.code }], roleOf: AD.roleOf, special: AD.special, compact: true });
      cv.mark(info.file, info.mark, 'focus');
      DP.flash(infoTop, 'is-pop');
    }

    function showOverview() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">Dört rol</div>
        <div class="role-list">
          ${['client', 'target', 'adapter', 'adaptee']
            .map((k) => `<div class="role-row rc rc-${AD.roles[k].color}"><span class="info-dot"></span><div><b>${AD.roles[k].en}</b> · ${AD.roles[k].tr}<div class="role-desc">${ROLE_TEXT[k]}</div></div></div>`)
            .join('')}
        </div>
        <p class="info-desc">Üstteki <b>Sınıf adaptörü</b> düğmesi, kalıtımla yazılan ikinci biçimi gösterir.</p>`;
    }

    const STEPS = [
      { t: 'Genel bakış', x: 'Dört rol: **Client**, **Target**, **Adapter**, **Adaptee**. Diyagramda istemcinin tek bağı hedef arayüze; uyarlanana giden **tek yol** adaptörden geçiyor.', info: null, f: 'nesne' },
      { t: 'Target — Hedef arayüz', x: '[[KargoFirmasi]] istemcinin konuştuğu dil: `gonderiOlustur`, `durumSorgula`, kilogram. Yerli firmalar onu doğrudan uygular.', info: 'KargoFirmasi', focus: { classes: ['KargoFirmasi'] }, f: 'nesne' },
      { t: 'Adaptee — Uyarlanan', x: '[[GlobalShipApi]] var olan ve **değiştiremediğimiz** sınıf. İşini iyi yapıyor; sadece **başka bir dil** konuşuyor.', info: 'GlobalShipApi', focus: { classes: ['GlobalShipApi'] }, f: 'nesne' },
      { t: 'Adapter — Adaptör', x: '[[GlobalShipAdaptoru]] hedefi **uygular** (kesik çizgi + boş üçgen) ve uyarlananı bir alanda **tutar** (düz ok: ilişki). Nottaki satıra bakın: her hedef çağrısı bir uyarlanan çağrısına çevrilir.', info: 'Adaptor', focus: { classes: ['Adaptor'], edges: ['real', 'comp'] }, f: 'nesne' },
      { t: 'Client — İstemci', x: '[[GonderiServisi]] yalnızca [[KargoFirmasi]]’ya bağlı. Adaptörü ve uyarlananı **hiç görmez**; ikisi değişse bile istemci derlenmeye devam eder.', info: 'GonderiServisi', focus: { classes: ['GonderiServisi'], edges: ['uses'] }, f: 'nesne' },
      { t: 'Sınıf adaptörü', x: 'İkinci biçimde adaptör uyarlanandan **kalıtır** (düz çizgi + boş üçgen). Java’da tek kalıtım olduğundan hedef bir **arayüz** olmalı. Nottaki çağrıda `api.` yok: metot miras alındı.', info: 'Adaptor', focus: { classes: ['Adaptor'], edges: ['ext', 'real'] }, f: 'sinif' },
      { t: 'Ne kadar uyarlama?', x: 'GoF’a göre bir adaptörün işi basit bir **ad değişikliğinden** tamamen farklı işlemleri desteklemeye kadar uzanır. Bizimki dört şey çeviriyor: **ad, birim, numara, durum**. Ne kadar çok çeviri, o kadar değerli tek nokta.', info: 'Adaptor', focus: { members: [['Adaptor', 'gonderiOlustur'], ['Adaptor', 'durumSorgula']] }, f: 'nesne' },
    ];

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: () => 6000,
      onChange: (i) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        setForm(s.f);
        diagram.select(null);
        if (s.focus) diagram.focus(s.focus);
        else diagram.clearFocus();
        if (s.info) showInfo(s.info);
        else showOverview();
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };

  // ================================================================== 7. GENİŞLET: yeni ortak EuroCargo
  AD.scenes.extend = function (root, ctx) {
    const S = ctx.state;
    S.ext = S.ext || {};
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-50' });
    const left = kit.panel('Görev: EuroCargo adaptörü', { cls: 'panel-code panel-ex' });
    const right = kit.panel('Bağlantı tezgâhı', { cls: 'panel-side ad-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    // ---- sol (adım 0): alıştırma
    const exBox = h('div', { class: 'ex-box' });
    const task = h('div', {
      class: 'task-card',
      html: md('📩 **Satış ekibi:** “Avrupa için ikinci bir ortak bulduk: **EuroCargo**. Kütüphanesi yine bambaşka: ağırlık **gram**, rota tek bir metin!”\nKural: **servislere dokunmadan** yeni ortağı sisteme bağlayın.'),
    });
    const ex = kit.blankExercise({
      files: [
        { name: 'EuroCargoAdaptoru.java', code: EC.exercise, badge: 'YENİ' },
        { name: 'Main.java · ek', code: EC.exerciseMain },
      ],
      answers: { 1: 'KargoFirmasi', 2: 'EuroCargoClient', 3: 'book', 4: '1000', 5: 'EuroCargoAdaptoru' },
      hints: {
        1: 'Adaptör, istemcinin beklediği hangi **hedef arayüzü** uygulamalı?',
        2: 'Adaptör hangi **uyarlanan** nesneyi bir alanda tutuyor?',
        3: 'EuroCargo’da gönderi oluşturan metodun adı ne? (kütüphanenin **kendi** dili)',
        4: '1 kg kaç gram? Bu sefer çeviri tablosu farklı.',
        5: 'İstemciye **hangi sınıfın** nesnesini veriyoruz?',
      },
      choices: ['KargoFirmasi', 'GlobalShipApi', 'EuroCargoClient', 'book', 'createShipment', '1000', '2.20462', 'EuroCargoAdaptoru', 'GonderiServisi'],
      roleOf: AD.roleOf,
      special: AD.special,
      state: S.ext,
      doneText: '<b class="ok">✔ Derleme başarılı!</b> EuroCargo bağlandı.',
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
    const runBox = h('div', { class: 'ad-runbox', hidden: true });
    const runCode = h('div', { class: 'ad-cv' });
    const runConsole = h('div', { class: 'console ad-console' });
    runBox.append(runCode, runConsole);
    left.body.append(exBox, runBox);
    const runCv = new DP.CodeView(runCode, { roleOf: AD.roleOf, special: AD.special });

    // ---- sağ: tezgâh + etki
    const viewHost = h('div', { class: 'ad-view' });
    const impact = h('div', { class: 'ad-extra' });
    right.body.append(viewHost, impact);
    const stage = new AD.Stage(viewHost, { cls: 'is-compact' });

    const rowHk = { id: 'hk', client: AD.C.gonderi, link: 'snap', provider: AD.P.hizli };
    const rowGs = { id: 'gs', client: AD.C.gonderi, link: 'adapter', adapter: { name: 'GlobalShipAdaptoru', sub: 'Adaptör', line: 'ad · kg → lb · numara · durum' }, provider: AD.P.global };
    const rowEc = (on) => ({ id: 'ec', client: AD.C.gonderi, link: on ? 'adapter' : 'gap', adapter: { name: 'EuroCargoAdaptoru', sub: 'Adaptör · YENİ', line: 'ad · kg → g · rota · durum' }, provider: AD.P.euro });
    const STEPS = [
      { t: 'Görev: EuroCargo adaptörü', x: 'Boşluklara tıklayıp doğru parçaları seçin. İpucu: yeni yabancı kütüphane = **yeni bir adaptör**. Üçgen bağlantılı parça yuvarlak yuvaya ancak bir ara parçayla oturur.', st: { rows: [rowHk, rowGs, rowEc(false)] } },
      { t: 'Derlendi: üçüncü firma bağlandı', x: '[[EuroCargoAdaptoru]] hedef arayüzü uyguluyor ve çağrıyı EuroCargo’nun diline çeviriyor: `book("İzmir > Roma", 3000)`. Konsolda yeni satır: `[EuroCargo] EC/7731 booked`.', st: { rows: [rowHk, rowGs, rowEc(true)], msg: { row: 2, at: 'p', text: 'book("İzmir > Roma", 3000 g)', lang: 'en' } } },
      { t: 'Servisler: dokunulmadı', x: '[[GonderiServisi]] ve [[IadeServisi]] **tek satır** değişmedi; yalnızca `Main` yeni nesneyi bağladı. Yeni bir yabancı ortak eklemek Açık/Kapalı İlkesi’ne uyar.', st: { rows: [rowHk, rowGs, rowEc(true)] } },
      { t: 'Her firmanın çeviri tablosu', x: 'Üç firma, üç farklı “dil”. [[HizliKargo]] zaten bizim dilimizi konuşuyor (adaptöre gerek yok); diğer ikisinin çeviri tablosu farklı. Her tablo **kendi adaptöründe**, tek yerde.', st: { rows: [rowHk, rowGs, rowEc(true)] }, table: true },
    ];

    function renderLeft(i) {
      exBox.hidden = i >= 1;
      runBox.hidden = i < 1;
      left.head.querySelector('.panel-title').innerHTML = i >= 1 ? 'Yeni adaptör: <span class="ver">EuroCargoAdaptoru</span>' : 'Görev: EuroCargo adaptörü';
      if (i < 1) return;
      runCv.setFiles(
        [
          { name: 'EuroCargoAdaptoru.java', code: EC.adaptor, badge: 'YENİ' },
          { name: 'Main.java', code: EC.Main },
          { name: 'EuroCargoClient.java', code: EC.client },
        ],
        { active: i === 2 ? 'Main.java' : 'EuroCargoAdaptoru.java', keepActive: false }
      );
      if (i === 2) runCv.mark('Main.java', 'new EuroCargoAdaptoru(new EuroCargoClient())', 'focus');
      else runCv.mark('EuroCargoAdaptoru.java', 'client.book(nereden + " > " + nereye, kg * 1000)', 'focus');
      AD.renderConsole(runConsole, '$ javac *.java && java Main', EC.output.map((t, j) => ({ t, ok: j >= 4, dim: j < 4 })));
    }

    function renderImpact(i, animate) {
      if (i === 0) {
        impact.innerHTML = `<div class="impact-title">İpucu</div><p>${md('Adaptör iki ucu da tanır: bir yanı **hedef arayüz** (`KargoFirmasi`), öbür yanı **uyarlanan** (`EuroCargoClient`). Çeviri tablosu: kg → **gram**, iki şehir → **tek rota**.')}</p>`;
      } else if (i === 1) {
        impact.innerHTML = `
          <div class="impact-title ok">✔ Derleme başarılı · yeni ortak</div>
          <ul class="filelist"><li><span class="cv-dot rc rc-${AD.roleOf('EuroCargoAdaptoru')}"></span>EuroCargoAdaptoru.java <span class="cv-badge is-new">YENİ</span></li></ul>`;
      } else if (i === 2) {
        impact.innerHTML = `
          <div class="metrics">
            <div class="metric is-good"><div class="m-val">0</div><div class="m-label">değişen istemci</div></div>
            <div class="metric"><div class="m-val">1</div><div class="m-label">yeni adaptör</div></div>
            <div class="metric"><div class="m-val">+2</div><div class="m-label">satır Main’de</div></div>
          </div>`;
      } else {
        impact.innerHTML = `
          <table class="cmp ad-cmp">
            <thead><tr><th>Çeviri</th><th>HizliKargo</th><th>GlobalShip</th><th>EuroCargo</th></tr></thead>
            <tbody>
              <tr><td>Metot adı</td><td>—</td><td><code>createShipment</code></td><td><code>book</code></td></tr>
              <tr><td>Ağırlık</td><td>kg</td><td>kg × 2.20462 → lb</td><td>kg × 1000 → g</td></tr>
              <tr><td>Parametreler</td><td>—</td><td>istek nesnesi</td><td>iki şehir → tek rota</td></tr>
              <tr><td>Takip no</td><td>—</td><td><code>48213</code> → <code>"GS-48213"</code></td><td>zaten metin</td></tr>
              <tr><td>Durum</td><td>—</td><td>kod → metin</td><td><code>boolean</code> → metin</td></tr>
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
          S.euroUnlocked = true;
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
  const RW = AD.rw;
  const TABS = [
    {
      tab: 'Arrays.asList',
      title: '`Arrays.asList` — diziyi List gibi gösteren adaptör',
      intro: 'Bir **dizi** (`String[]`), `List` arayüzünü uygulamaz. `Arrays.asList` diziyi **kopyalamaz**; onu `List` arayüzüne **uyarlar**: listeye yazmak diziye yazmaktır. Ama dizi büyüyemediği için `add` desteklenmez.',
      map: [
        ['target', 'KargoFirmasi', '`List<String>`'],
        ['adapter', 'GlobalShipAdaptoru', '`Arrays.asList(…)`’in döndürdüğü liste'],
        ['adaptee', 'GlobalShipApi', '`String[]` dizisi'],
        ['client', 'GonderiServisi', 'Listeyle çalışan kodunuz'],
      ],
      note: 'Adaptör, uyarlananın **sınırlarını** da taşır: `add` diziyi büyütemeyeceği için `UnsupportedOperationException` fırlatır. JDK içindeki satır numaraları sürüme göre değişebilir; çıktılar Java 21 ile alındı.',
      roles: {},
      file: 'DiziGorunumu.java',
      code: RW.asList,
      options: RW.asListOpts,
      cmd: '$ java DiziGorunumu',
    },
    {
      tab: 'InputStreamReader',
      title: '`InputStreamReader` — bayttan karaktere çevirmen',
      intro: '`InputStream` **bayt** okur; metin işleyen kod ise **karakter** okuyan bir `Reader` bekler. `InputStreamReader` bayt akışını `Reader` arayüzüne uyarlar. Çeviri tablosu da **karakter kodlamasıdır** (charset): yanlış tabloyla çevirmek, kilogramı pound sanmak gibidir.',
      map: [
        ['target', 'KargoFirmasi', '`Reader`'],
        ['adapter', 'GlobalShipAdaptoru', '`InputStreamReader`'],
        ['adaptee', 'GlobalShipApi', '`InputStream` (baytlar)'],
      ],
      note: '“Ağırlık” UTF-8’de 9 bayttır (ğ ve ı ikişer bayt). US-ASCII bu baytları tanımaz, her birini “�” ile değiştirir: 17 bayt → 17 karakter. Çıktılar Java 21 ile alındı.',
      roles: {},
      file: 'BaytKarakter.java',
      code: RW.reader,
      options: RW.readerOpts,
      cmd: '$ java BaytKarakter',
    },
    {
      tab: 'Executors.callable',
      title: '`Executors.callable` — adı konmuş bir JDK adaptörü',
      intro: '`Runnable` sonuç döndürmez; ama birçok API sonuç veren bir `Callable` ister. `Executors.callable(gorev, sonuc)` görevi `Callable` arayüzüne uyarlar. Son satıra bakın: JDK’nın içindeki sınıfın adı düpedüz **RunnableAdapter**!',
      map: [
        ['target', 'KargoFirmasi', '`Callable<String>`'],
        ['adapter', 'GlobalShipAdaptoru', '`Executors$RunnableAdapter`'],
        ['adaptee', 'GlobalShipApi', '`Runnable`'],
      ],
      note: 'Son satır `getClass().getName()` çıktısı: kalıbın adı JDK’nın kaynak kodunda bile geçiyor. Çıktılar Java 21 ile alındı.',
      roles: {},
      file: 'GorevUyarla.java',
      code: RW.callable,
      mark: 'Executors.callable(sayim, "TAMAM")',
      out: RW.callableOut,
      cmd: '$ java GorevUyarla',
    },
    {
      tab: 'Karıştırmayın!',
      title: 'Adapter, Decorator, Proxy, Facade, Bridge',
      intro: 'Yapısal kalıpların çoğu bir nesneyi “sarar”. Ayırt etmenin anahtarı: **arayüz değişiyor mu** ve kalıp **ne zaman** uygulanıyor?',
      extraHtml: `<table class="cmp cmp-3">
        <thead><tr><th></th><th>Adapter</th><th>Decorator</th><th>Proxy</th><th>Facade</th><th>Bridge</th></tr></thead>
        <tbody>
          <tr><td>Arayüz</td><td><b>Değiştirir</b></td><td>Aynı kalır</td><td>Aynı kalır</td><td>Yeni, sade arayüz</td><td>Ayrı hiyerarşiler</td></tr>
          <tr><td>Amaç</td><td>Uyumsuzu uydurmak</td><td>Davranış eklemek</td><td>Erişimi denetlemek</td><td>Alt sistemi sadeleştirmek</td><td>Soyutlama ↔ gerçekleştirim</td></tr>
          <tr><td>Ne zaman?</td><td>Tasarımdan <b>sonra</b></td><td>Çalışma anında</td><td>—</td><td>—</td><td>Tasarımda, <b>önceden</b></td></tr>
        </tbody></table>`,
      note: 'Aynı satırda ikisi birden: `new BufferedReader(new InputStreamReader(System.in))` — içteki **Adapter** (bayt → karakter), dıştaki **Decorator** (tamponlama ekler; arayüz yine `Reader`).',
      roles: { KargoFirmasi: 'target', GlobalShipAdaptoru: 'adapter', GlobalShipApi: 'adaptee' },
      special: AD.special,
      file: 'Karsilastirma.java',
      code: () => `// Adapter: ARAYÜZ DEĞİŞİR — GlobalShipApi, KargoFirmasi gibi görünür
KargoFirmasi firma = new GlobalShipAdaptoru(new GlobalShipApi());

// Decorator: ARAYÜZ AYNI KALIR, davranış eklenir (ileride göreceğiz)
Reader okuyucu = new BufferedReader(new InputStreamReader(System.in));
//               └ Decorator: tampon   └ Adapter: bayt → karakter`,
      mark: 'new GlobalShipAdaptoru(new GlobalShipApi())',
    },
  ];

  AD.scenes.realworld = (root, ctx) =>
    kit.realWorldScene(root, ctx, {
      tabs: TABS,
      roles: AD.roles,
      roleOf: AD.roleOf,
      fmLabel: 'çeviri',
      footText: (i) =>
        i === 3
          ? 'Yapısal kalıplar birbirine benzer; “arayüz değişiyor mu?” sorusu çoğu zaman cevabı verir.'
          : i === 2
          ? 'Konsolun son satırına bakın: JDK’nın içindeki sınıfın adı **RunnableAdapter**. Kalıp adları gerçek kodda da kullanılır.'
          : 'Kendi örneğimizdeki rolleri JDK’da bulun. Sağdaki düğmelerle iki denemeyi karşılaştırın: adaptör uyarlananın **sınırlarını** ve **çeviri tablosunu** da taşır.',
    });

  // ================================================================== 9. QUIZ
  const ADAPTOR_EXCERPT = `public String gonderiOlustur(String nereden, String nereye, int kg) {
    double lb = kg * LB_PER_KG;
    long id = api.createShipment(new ShipmentRequest(nereden, nereye, lb));
    return "GS-" + id;
}`;

  const Q = [
    {
      type: 'mcq',
      q: 'Adapter kalıbının **temel amacı** (GoF) nedir?',
      options: ['Bir nesneye çalışma anında yeni sorumluluklar eklemek', 'Bir sınıfın arayüzünü, istemcilerin **beklediği başka bir arayüze dönüştürmek**', 'Karmaşık bir alt sisteme tek bir giriş noktası sunmak', 'Bir nesneye erişimi denetlemek'],
      answer: 1,
      explain: 'GoF: “Bir sınıfın arayüzünü istemcilerin beklediği başka bir arayüze dönüştür.” Diğerleri Decorator, Facade ve Proxy’nin amaçlarıdır.',
    },
    {
      type: 'mcq',
      q: 'Neden `GlobalShipApi` sınıfına `implements KargoFirmasi` ekleyip sorunu orada çözmedik?',
      options: ['Java buna izin vermez', 'Arayüzler yalnızca yeni sınıflara eklenebilir', 'Üçüncü parti bir kütüphane: kaynak kodu elimizde değil, değiştirsek de her sürümde kaybolur', 'Daha yavaş çalışırdı'],
      answer: 2,
      explain: 'Uyarlanan genellikle **değiştiremediğimiz** bir sınıftır (.jar, başka ekibin kodu, eski sistem). Adaptör iki tarafa da dokunmadan aralarına girer.',
    },
    {
      type: 'line',
      q: 'Bu adaptör metodunda **birim çevirisinin** yapıldığı satıra tıklayın.',
      codeName: 'GlobalShipAdaptoru · gonderiOlustur()',
      code: ADAPTOR_EXCERPT,
      answer: 'double lb = kg * LB_PER_KG;',
      explain: 'Kilogram, kütüphanenin beklediği pound’a burada çevriliyor. Çeviri **tek yerde** olduğu için iade servisindeki gibi unutulma ihtimali kalmadı.',
    },
    {
      type: 'mcq',
      q: 'İade servisindeki `new ShipmentRequest(musteriSehri, depoSehri, kg)` hatasını derleyici neden **yakalamadı**?',
      options: ['Derleyici uyarı verdi ama görmezden gelindi', '`int` değer `double` parametreye **kendiliğinden genişler**; tipler uyumlu olduğu için kod geçerlidir', '`ShipmentRequest` bir record olduğu için', 'Java birimleri denetlemez ama yalnızca çalışma anında hata verir'],
      answer: 1,
      explain: 'Genişletici dönüşüm (int → double) sessizdir. Derleyici “12” sayısının kilogram mı pound mu olduğunu bilemez; birim bilgisi tipte yok. Bu yüzden çeviriyi tek bir yerde (adaptörde) toplamak hayatidir.',
    },
    {
      type: 'mcq',
      q: '**Nesne adaptörü** için hangisi doğrudur?',
      options: ['Uyarlanandan kalıtır', 'Uyarlananı bir alanda tutar (kompozisyon); uyarlananın alt sınıflarını da sarabilir', 'Uyarlanan `final` ise yazılamaz', 'Uyarlananın bütün public metotlarını dışarı açar'],
      answer: 1,
      explain: 'Nesne adaptörü “sahiptir” ilişkisi kurar: `private final GlobalShipApi api`. Diğer şıklar **sınıf adaptörünün** özellikleridir.',
    },
    {
      type: 'mcq',
      q: '`GlobalShipApi` sınıfı `final` olsaydı ne olurdu?',
      options: ['İki adaptör biçimi de yazılamazdı', 'Yalnızca nesne adaptörü yazılamazdı', 'Sınıf adaptörü **derlenmezdi** (`cannot inherit from final`); nesne adaptörü sorunsuz çalışırdı', 'Hiçbir şey değişmezdi'],
      answer: 2,
      explain: 'Sınıf adaptörü uyarlanandan kalıtmak zorundadır; `final` sınıftan kalıtılamaz. Nesne adaptörü kalıtım kullanmadığı için etkilenmez.',
    },
    {
      type: 'line',
      q: 'Bu programda **uyarlananın adaptörle sarıldığı** satıra tıklayın.',
      codeName: 'Main.java',
      code: C.Main,
      answer: 'new GlobalShipAdaptoru(new GlobalShipApi())',
      explain: 'Bağlantıyı yalnızca `Main` kurar: uyarlanan (`new GlobalShipApi()`) adaptöre verilir ve sonuç `KargoFirmasi` tipinde bir değişkende tutulur. Servisler bundan habersizdir.',
    },
    {
      type: 'mcq',
      q: 'Adapter ile **Decorator** arasındaki temel fark nedir?',
      options: ['Adapter arayüzü **değiştirir**; Decorator arayüzü **aynı tutar** ve davranış ekler', 'İkisi de arayüzü değiştirir', 'Decorator yalnızca kalıtımla yazılır', 'Adapter yalnızca tek bir metot için kullanılır'],
      answer: 0,
      explain: '`new BufferedReader(new InputStreamReader(System.in))`: içteki adaptör arayüzü (bayt → karakter) değiştirir; dıştaki dekoratör yine bir `Reader`’dır, yalnızca tamponlama ekler.',
    },
  ];

  AD.scenes.quiz = (root, ctx) =>
    kit.quizScene(root, ctx, {
      questions: Q,
      roleOf: AD.roleOf,
      special: AD.special,
      patternName: 'Adapter',
      match: {
        items: ['GonderiServisi', 'IadeServisi', 'KargoFirmasi', 'GlobalShipAdaptoru', 'EuroCargoAdaptoru', 'GlobalShipApi', 'EuroCargoClient'].map((id) => ({ id, label: id })),
        buckets: ['client', 'target', 'adapter', 'adaptee'].map((k) => ({ id: k, title: AD.roles[k].en, sub: AD.roles[k].tr, color: AD.roles[k].color })),
        answer: AD.classRoles,
        hint: 'Yedi sınıfı dört role yerleştirin. Takıldığınızda **Cevapları göster** düğmesi var.',
      },
    });

  // ================================================================== 10. ÖZET
  AD.scenes.summary = function (root, ctx) {
    const at = DP.catalog.findIndex((p) => p.id === 'adapter');
    const next = DP.catalog.slice(at + 1).find((p) => p.ready && DP.patterns[p.id]);
    const el = h('div', { class: 'scene scene-summary' });
    el.innerHTML = `
      <div class="sum-head">
        <div>
          <div class="chips"><span class="chip chip-cat is-struct">Yapısal · Structural</span><span class="chip">Diğer adı: Wrapper</span></div>
          <h1>Adapter — Özet</h1>
        </div>
        <div class="sum-actions no-print">
          <button class="btn btn-ghost" type="button" data-print>🖨 Yazdır / PDF</button>
          <a class="btn btn-ghost" href="#/prototype/ozet">← Prototype özeti</a>
          <a class="btn btn-ghost" href="#/">Tüm kalıplar</a>
          ${next ? `<a class="btn btn-primary" href="#/${next.id}">Sıradaki kalıp: ${DP.esc(next.name)} →</a>` : ''}
        </div>
      </div>
      <div class="sum-grid">
        <article class="card sum-intent">
          <h3>Amaç</h3>
          <p>Bir sınıfın arayüzünü, istemcilerin <b>beklediği başka bir arayüze dönüştür</b>; uyumsuz arayüzler yüzünden birlikte çalışamayan sınıflar birlikte çalışsın.</p>
          <div class="sum-formula"><code>Client</code> → <code class="tk-tgt">target.request()</code> → <code>Adapter</code> → <code class="tk-ade">adaptee.specificRequest()</code> <span>(istemci de uyarlanan da değişmez)</span></div>
        </article>
        <article class="card sum-uml"><h3>Yapı (GoF · nesne adaptörü)</h3><div class="sum-diag"></div></article>
        <article class="card">
          <h3>Nesne ↔ Sınıf adaptörü</h3>
          <table class="cmp sg-sum-cmp">
            <thead><tr><th></th><th>Nesne</th><th>Sınıf</th></tr></thead>
            <tbody>
              <tr><td>İlişki</td><td>Kompozisyon</td><td>Kalıtım</td></tr>
              <tr><td>final uyarlanan</td><td class="ok">Çalışır</td><td class="bad">Yazılamaz</td></tr>
              <tr><td>Uyarlananın metotları</td><td class="ok">Gizli</td><td class="bad">Sızar</td></tr>
            </tbody>
          </table>
          <p class="sum-note">Java’da varsayılan seçim: <b>nesne adaptörü</b>.</p>
        </article>
        <article class="card">
          <h3>Katılımcılar</h3>
          <ul class="sum-roles">
            <li>${ui.roleChip('client')}<span>hedef arayüzle çalışır</span></li>
            <li>${ui.roleChip('target')}<span>istemcinin beklediği arayüz</span></li>
            <li>${ui.roleChip('adapter')}<span>çevirir, çağrıyı iletir</span></li>
            <li>${ui.roleChip('adaptee')}<span>var olan, uyumsuz sınıf</span></li>
          </ul>
        </article>
        <article class="card sum-pros">
          <h3>Artıları</h3>
          <ul>
            <li>Değiştirilemeyen kodu <b>yeniden kullanmak</b></li>
            <li>Çeviri <b>tek yerde</b> (SRP); istemciler sade kalır</li>
            <li>Yeni yabancı ortak = yeni adaptör (<b>OCP</b>)</li>
            <li>Testte uyarlanan yerine sahtesi verilebilir</li>
          </ul>
        </article>
        <article class="card sum-cons">
          <h3>Eksileri</h3>
          <ul>
            <li>Ek sınıf ve bir <b>dolaylama</b> katmanı</li>
            <li>Arayüzler çok farklıysa adaptör <b>şişer</b></li>
            <li>Uyarlananın sınırlarını taşır (ör. <code>asList</code> + <code>add</code>)</li>
          </ul>
        </article>
        <article class="card">
          <h3>İlişkili kalıplar</h3>
          <ul>
            <li><b>Bridge:</b> yapısı benzer ama tasarımda <i>önceden</i> kurulur; Adapter sonradan uydurur.</li>
            <li><b>Decorator:</b> arayüzü değiştirmeden davranış ekler.</li>
            <li><b>Proxy:</b> aynı arayüzle erişimi denetler.</li>
            <li><b>Facade:</b> bütün bir alt sisteme yeni, sade bir arayüz verir.</li>
          </ul>
        </article>
        <article class="card sum-tip">
          <h3>Sınav ipuçları</h3>
          <pre class="mini-code">class GlobalShipAdaptoru implements KargoFirmasi {
    private final GlobalShipApi api;      // uyarlanan
    public String gonderiOlustur(…, int kg) {
        long id = api.createShipment(…kg * 2.20462…);
        return "GS-" + id;               // geri çeviri
    }
}</pre>
          <p class="exam"><b>Uyumsuz arayüz + değiştirilemeyen sınıf</b> → Adapter · <b>Client, Target, Adapter, Adaptee</b> · <u>nesne</u> adaptörü kompozisyon, <u>sınıf</u> adaptörü kalıtım</p>
        </article>
        <article class="card sum-files">
          <h3>Java kodları</h3>
          <p>Çalıştırılabilir örnekler proje klasöründe:</p>
          <pre class="mini-code">java/adapter/sorun       → istemciler yabancı API'yi tanır; iade 12 lb
java/adapter/cozum       → GlobalShipAdaptoru (nesne adaptörü)
java/adapter/akis        → Canlı Akış'taki tek gönderi
java/adapter/bicim/...   → nesne ↔ sınıf adaptörü, sızıntı
java/adapter/genislet    → EuroCargo için ikinci adaptör</pre>
          <p>Derleyip çalıştırmak için <code>java/README.md</code> dosyasına bakın.</p>
        </article>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-print]').addEventListener('click', () => window.print());
    const diag = new DP.ClassDiagram(el.querySelector('.sum-diag'), AD.gofDiagram({ form: 'nesne' }), { roles: AD.roles, roleTags: false, mode: 'generic' });
    diag.svg.classList.add('is-compact');
    return { destroy() {} };
  };

  // ================================================================== kayıt
  DP.register({
    id: 'adapter',
    name: 'Adapter',
    tr: 'Adaptör',
    category: 'structural',
    roleOf: AD.roleOf,
    initialState: () => ({
      view: 'stage',
      showCode: true,
      ext: {},
      euroUnlocked: false,
      quiz: { results: {}, match: false },
    }),
    scenes: [
      { id: 'giris', title: 'Giriş', mount: AD.scenes.intro },
      { id: 'sorun', title: 'Sorun', mount: AD.scenes.problem },
      { id: 'cozum', title: 'Çözüm', mount: AD.scenes.solution },
      { id: 'akis', title: 'Canlı Akış', mount: AD.scenes.flow, star: true },
      { id: 'bicim', title: 'Nesne ↔ Sınıf', mount: AD.scenes.forms, star: true },
      { id: 'yapi', title: 'Yapı (UML)', mount: AD.scenes.structure },
      { id: 'genislet', title: 'Genişlet', mount: AD.scenes.extend },
      { id: 'gercek', title: 'Gerçek Dünya', mount: AD.scenes.realworld },
      { id: 'quiz', title: 'Quiz', mount: AD.scenes.quiz },
      { id: 'ozet', title: 'Özet', mount: AD.scenes.summary },
    ],
  });
})();
