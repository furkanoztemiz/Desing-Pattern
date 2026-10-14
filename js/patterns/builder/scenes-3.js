/*
 * Builder — sahneler (3/3): Yapı, Genişlet, Gerçek Dünya, Quiz, Özet ve kalıp kaydı
 */
(function () {
  'use strict';
  const BL = DP.bl;
  const { h } = DP;
  const kit = DP.kit;
  const ui = BL.ui;
  const md = BL.md;
  const G = BL.gof;

  // ================================================================== 6. YAPI (GoF ↔ akıcı Builder)
  const ROLE_TEXT = {
    client: 'Hangi temsilin üretileceğini <b>hazırlayıcıyı seçerek</b> belirler; yöneticiye verir, sonucu hazırlayıcıdan alır.',
    director: 'Adımların <b>sırasını</b> (tarifi) bilir; yalnızca Builder arayüzünü kullanır.',
    builder: 'Bir ürünün <b>parçalarını kurma adımlarının</b> arayüzü; ürünün tipini bilmez.',
    concreteBuilder: 'Adımları <b>kendi temsiline</b> çevirir ve sonucu <code>build()</code> (getResult) ile verir.',
    product: 'Kurulan karmaşık nesne; temsiller birbirinden çok farklı olabilir (nesne, metin, sayı…).',
  };

  function classInfo(id, json) {
    const main = G.main('asi', json);
    switch (id) {
      case 'Main':
        return { role: 'client', file: 'Main.java', code: main, mark: 'new EtiketHazirlayici()', points: ['Temsili **hazırlayıcı nesnesini oluşturarak** seçer.', 'Aynı yönetici tarifini her hazırlayıcıyla çalıştırır.', 'Sonucu yöneticiden değil, **hazırlayıcıdan** (`build()`) alır.'] };
      case 'GonderiYoneticisi':
        return { role: 'director', file: 'GonderiYoneticisi.java', code: G.GonderiYoneticisi, mark: 'public void asiGonderisi(GonderiHazirlayici h)', points: ['Tarifleri bilir: `asiGonderisi`, `vazoGonderisi`.', 'Parametresi **arayüz** tipinde: `GonderiHazirlayici h`.', 'Tek bir somut sınıf adı geçmez → yeni temsil eklenince değişmez.'] };
      case 'GonderiHazirlayici':
        return { role: 'builder', file: 'GonderiHazirlayici.java', code: G.GonderiHazirlayici, mark: 'GonderiHazirlayici kirilgan();', points: ['Yedi adım; her biri arayüzün kendisini döndürür (zincirleme).', '`build()` burada **yok**: ürün tipleri farklı.', 'Yeni bir adım eklemek **tüm** hazırlayıcıları etkiler (Genişlet sahnesi).'] };
      case 'Builder':
        return { role: 'concreteBuilder', file: 'Gonderi.java', code: G.Gonderi, mark: 'public static class Builder implements GonderiHazirlayici', points: ['Akıcı Builder’ımız, artık arayüzü uyguluyor.', 'Ürünü: değişmez bir **Gonderi** nesnesi.', '`build()` kuralları denetler (kırılgan ⇒ sigorta).'] };
      case 'EtiketHazirlayici':
      case 'Etiket':
        return { role: id === 'Etiket' ? 'product' : 'concreteBuilder', file: 'EtiketHazirlayici.java', code: G.EtiketHazirlayici, mark: 'public String build()', points: ['Her adımda etikete bir satır basar.', 'Ürünü: bir **String** (yazdırılabilir etiket).', 'GoF’taki ASCIIConverter’ın karşılığı.'] };
      case 'FiyatHazirlayici':
      case 'Fiyat':
        return { role: id === 'Fiyat' ? 'product' : 'concreteBuilder', file: 'FiyatHazirlayici.java', code: G.FiyatHazirlayici, mark: 'public int build()', points: ['İlgilenmediği adımları (nereden, nereye) **boş** geçer.', 'Ürünü: bir **int** (TL cinsinden fiyat).', 'GoF’taki CountingMazeBuilder’ın karşılığı: bir şey kurmaz, **sayar**.'] };
      case 'JsonHazirlayici':
      case 'Json':
        return { role: id === 'Json' ? 'product' : 'concreteBuilder', file: 'JsonHazirlayici.java', code: G.JsonHazirlayici, mark: 'public String build()', points: ['Genişlet sahnesinde eklendi; yönetici hiç değişmedi.', 'Ürünü: web servisi için bir **JSON** metni.'] };
      case 'Gonderi':
        return { role: 'product', file: 'Gonderi.java', code: G.Gonderi, mark: 'private final String nereden;', points: ['Alanları `final`: **değişmez** (immutable).', 'Kurucusu private: yalnızca `build()` oluşturabilir.', 'Paket temsili; etiket ve fiyat **başka** ürünlerdir.'] };
      default:
        return null;
    }
  }

  BL.scenes.structure = function (root, ctx) {
    const S = ctx.state;
    const json = !!S.jsonUnlocked;
    const el = h('div', { class: 'scene scene-split' });
    const tools = h('div', { class: 'panel-tools' });
    const body = h('div', { class: 'scene-body cols-64' });
    const left = kit.panel('Yapı', { cls: 'panel-diagram', extra: tools });
    const right = kit.panel('Rol kartı <span class="panel-sub">· bir sınıfa tıklayın</span>', { cls: 'panel-side' });
    body.append(left.el, right.el);
    el.append(body);
    root.appendChild(el);

    const diagHost = h('div', { class: 'diag-host' });
    const legend = kit.umlLegend({ association: false, fmLabel: 'build(): sonucu verir (getResult)' });
    legend.insertAdjacentHTML('beforeend', '<span><svg viewBox="0 0 46 14"><line x1="2" y1="7" x2="28" y2="7" class="lg-line"/><circle cx="36" cy="7" r="6" class="lg-nest"/><path d="M30 7 H42 M36 1 V13" class="lg-line"/></svg> iç sınıf</span>');
    left.body.append(diagHost, legend);
    let view = 'gof';
    const diagram = new DP.ClassDiagram(diagHost, BL.gofDiagram({ json }), {
      roles: BL.roles,
      onSelect: (id) => {
        showInfo(id);
        diagram.focus({ classes: [id] });
        diagram.select(id);
      },
    });

    const viewSeg = kit.seg(
      [
        { v: 'gof', label: 'GoF yapısı' },
        { v: 'fluent', label: 'Akıcı Builder' },
      ],
      'gof',
      (v) => setView(v)
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
    tools.append(viewSeg.el, modeSeg.el, tagToggle);

    function setView(v) {
      if (v === view) return;
      view = v;
      viewSeg.set(v);
      diagram.update(v === 'gof' ? BL.gofDiagram({ json }) : BL.fluentDiagram(), { animate: true });
    }

    const infoTop = h('div', { class: 'info-card' });
    const infoCode = h('div', { class: 'info-code' });
    right.body.append(infoTop, infoCode);

    /** Akıcı görünümde sınıflar Çözüm sahnesindeki (arayüzsüz) koddan anlatılır. */
    function fluentInfo(id) {
      if (id === 'Main') return { role: 'client', file: 'Main.java', code: BL.code.Main, mark: '.kirilgan().sigorta(5000)', points: ['Akıcı Builder’da **yöneticilik istemcide**: adımları kendisi, kendi sırasıyla çağırır.', 'Sonucu doğrudan `build()`’den alır.'] };
      if (id === 'Builder') return { role: 'concreteBuilder', file: 'Gonderi.java', code: BL.code.Gonderi, mark: 'public static class Builder', points: ['Tek bir somut hazırlayıcı; arayüz yok.', '`Gonderi`’nin **iç sınıfı**: private kurucuya erişebilir.', '`build()` kuralları denetler ve değişmez nesneyi verir.'] };
      if (id === 'Gonderi') return { role: 'product', file: 'Gonderi.java', code: BL.code.Gonderi, mark: 'private Gonderi(Builder b)', points: ['Alanları `final`, set metodu yok: **değişmez**.', 'Kurucusu private: yalnızca Builder oluşturabilir.'] };
      return null;
    }

    function showInfo(id) {
      const info = view === 'fluent' ? fluentInfo(id) : classInfo(id, json);
      infoCode.innerHTML = '';
      if (!info) return;
      const r = BL.roles[info.role];
      const title = id === 'Builder' ? 'Gonderi.Builder' : id === 'Etiket' || id === 'Json' ? 'String' : id === 'Fiyat' ? 'int' : id;
      infoTop.innerHTML = `
        <div class="info-role rc rc-${r.color}"><span class="info-dot"></span><b>${r.en}</b> · ${r.tr}</div>
        <div class="info-name rc rc-${r.color}">${DP.esc(title)}</div>
        <p class="info-desc">${ROLE_TEXT[info.role]}</p>
        <ul class="info-points">${info.points.map((p) => `<li>${md(p)}</li>`).join('')}</ul>`;
      const cv = new DP.CodeView(infoCode, { files: [{ name: info.file, code: info.code }], roleOf: BL.roleOf, special: BL.special, compact: true });
      cv.mark(info.file, info.mark, 'focus');
      DP.flash(infoTop, 'is-pop');
    }

    function showOverview() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">Dört rol + istemci</div>
        <div class="role-list">
          ${['director', 'builder', 'concreteBuilder', 'product', 'client']
            .map((k) => `<div class="role-row rc rc-${BL.roles[k].color}"><span class="info-dot"></span><div><b>${BL.roles[k].en}</b> · ${BL.roles[k].tr}<div class="role-desc">${ROLE_TEXT[k]}</div></div></div>`)
            .join('')}
        </div>
        <p class="info-desc">Üstteki <b>Akıcı Builder</b> düğmesi, Çözüm sahnesindeki sade yapıyı gösterir.</p>`;
    }

    const CB = ['Builder', 'EtiketHazirlayici', 'FiyatHazirlayici'].concat(json ? ['JsonHazirlayici'] : []);
    const PR = ['Gonderi', 'Etiket', 'Fiyat'].concat(json ? ['Json'] : []);
    const STEPS = [
      { t: 'Genel bakış', x: 'GoF Builder’da dört rol var: **Director**, **Builder**, **ConcreteBuilder**, **Product** — bir de onları bir araya getiren istemci. Diyagram yukarıdan aşağı: tarif → adımlar → hazırlayıcılar → ürünler.', info: null, v: 'gof' },
      { t: 'Product — Ürün', x: 'Kurulan şeyler: [[Gonderi]] nesnesi, etiket **String**’i, fiyat **int**’i. GoF’a göre temsiller o kadar farklı olabilir ki ortak bir üst sınıf vermenin anlamı yoktur.', info: 'Gonderi', focus: { classes: PR }, v: 'gof' },
      { t: 'Builder — Yapıcı (arayüz)', x: '[[GonderiHazirlayici]] adımları listeler: `nereden`, `nereye`, `kirilgan`… Ürünün tipinden **habersizdir**.', info: 'GonderiHazirlayici', focus: { classes: ['GonderiHazirlayici'] }, v: 'gof' },
      { t: 'ConcreteBuilder — Somut Yapıcı', x: 'Her hazırlayıcı adımları kendi temsiline çevirir: [[Gonderi.Builder]] paketi, [[EtiketHazirlayici]] etiketi, [[FiyatHazirlayici]] fiyatı kurar. Kesik çizgi + boş üçgen = arayüzü uygular.', info: 'EtiketHazirlayici', focus: { classes: CB, edges: CB.map((c) => 'real-' + c) }, v: 'gof' },
      { t: 'Director — Yönetici', x: '[[GonderiYoneticisi]] tarifleri bilir ve adımları **arayüz üzerinden** çağırır (kesik ok = bağımlılık). Hangi temsilin üretildiğini bilmez.', info: 'GonderiYoneticisi', focus: { classes: ['GonderiYoneticisi'], edges: ['dir-builder'] }, v: 'gof' },
      { t: 'Client — İstemci', x: '[[Main]] hazırlayıcıyı **oluşturarak** temsili seçer, yöneticiye verir ve sonucu hazırlayıcıdan (`build()`) alır.', info: 'Main', focus: { classes: ['Main'], edges: ['uses-dir', 'main-cb'] }, v: 'gof' },
      { t: 'getResult neden arayüzde yok?', x: 'Pembe noktalı `build()` metotlarına bakın: dönüş tipleri `Gonderi`, `String`, `int`. Ortak bir tip olmadığından sonuç alma adımı **somut hazırlayıcıda** durur.', info: 'FiyatHazirlayici', focus: { members: CB.map((c) => [c, 'build']) }, v: 'gof' },
      { t: 'Akıcı Builder = sade GoF', x: 'Çözüm’deki **akıcı Builder** bu yapının sadeleşmiş hâlidir: tek bir ConcreteBuilder (iç sınıf), arayüz yok ve **yöneticilik istemcide**. Amaç farklı temsil değil; okunur, doğrulanmış, değişmez **tek** bir ürün.', info: 'Builder', focus: { classes: ['Builder'], edges: ['create', 'nest'] }, v: 'fluent' },
    ];

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: () => 6000,
      onChange: (i) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        setView(s.v);
        diagram.select(null);
        if (s.focus) diagram.focus(s.focus);
        else diagram.clearFocus();
        if (s.info) showInfo(s.info);
        else showOverview();
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };

  // ================================================================== 7. GENİŞLET: yeni temsil ✓ · yeni adım ✗
  const OLD = ['Main', 'GonderiYoneticisi', 'GonderiHazirlayici', 'Builder', 'EtiketHazirlayici', 'FiyatHazirlayici'];
  const NEW = ['JsonHazirlayici', 'Json'];
  const BUILDERS = ['Builder', 'EtiketHazirlayici', 'FiyatHazirlayici', 'JsonHazirlayici'];

  BL.scenes.extend = function (root, ctx) {
    const S = ctx.state;
    S.ext = S.ext || {};
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-50' });
    const left = kit.panel('Görev: JSON temsili ekle', { cls: 'panel-code panel-ex' });
    const right = kit.panel('Sistem görünümü', { cls: 'panel-side' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    // ---- sol (adım 0–2): yeni TEMSİL alıştırması
    const exBox = h('div', { class: 'ex-box' });
    const task = h('div', {
      class: 'task-card',
      html: md('📩 **Web ekibi:** “Mobil uygulama için gönderinin **JSON** hâlini istiyoruz — aynı tariflerden!”\nKural: **yöneticiye ve mevcut hazırlayıcılara dokunmadan** yeni bir temsil ekleyin.'),
    });
    const ex = kit.blankExercise({
      files: [
        { name: 'JsonHazirlayici.java', code: BL.ext.exercise, badge: 'YENİ' },
        { name: 'Main.java · ek', code: BL.ext.exerciseMain },
      ],
      answers: { 1: 'GonderiHazirlayici', 2: 'this', 3: 'String', 4: 'asiGonderisi', 5: 'build' },
      hints: {
        1: 'Yeni hazırlayıcı hangi **Builder arayüzünü** uygular?',
        2: 'Akıcı bir adım, zincir devam etsin diye **ne** döndürür?',
        3: 'JSON temsili hangi **tipte** bir sonuç?',
        4: 'Yöneticinin hangi **tarifini** çalıştırıyoruz? (aşı kolisi)',
        5: 'Sonucu veren adım hangisi? (GoF: getResult)',
      },
      choices: ['GonderiHazirlayici', 'GonderiYoneticisi', 'Gonderi', 'this', 'null', 'String', 'int', 'asiGonderisi', 'build'],
      roleOf: BL.roleOf,
      special: BL.special,
      state: S.ext,
      doneText: '<b class="ok">✔ Derleme başarılı!</b> JSON hazırlayıcısı hazır.',
      onSolved: () => {
        DP.fx.confetti();
        DP.fx.toast('Derleme başarılı! 🎉');
        setTimeout(() => stepper.index === 0 && stepper.go(1), DP.dur(900));
      },
      onShowAnswers: () => stepper.index === 0 && stepper.go(1),
      onReset: () => stepper.go(0),
    });
    exBox.append(task, ex.wrap, ex.chipRow, ex.actions);

    // ---- sol (adım 3–4): yeni ADIM
    const typeBox = h('div', { class: 'type-box', hidden: true });
    const typeTask = h('div', { class: 'task-card is-alert' });
    const typeCode = h('div', { class: 'type-code' });
    const typeConsole = h('div', { class: 'console bl-console bl-type-console' });
    typeBox.append(typeTask, typeCode, typeConsole);
    left.body.append(exBox, typeBox);
    const typeCv = new DP.CodeView(typeCode, { roleOf: BL.roleOf, special: BL.special });

    // ---- sağ: UML + etki
    const diagHost = h('div', { class: 'diag-host' });
    const impact = h('div', { class: 'impact' });
    right.body.append(diagHost, impact);
    const diagram = new DP.ClassDiagram(diagHost, BL.gofDiagram({ json: true }), { roles: BL.roles, roleTags: false });

    const STEPS = [
      { t: 'Görev: yeni bir TEMSİL ekle', x: 'Aynı tariflerden bir de **JSON** üretmek istiyoruz. Boşluklara tıklayıp doğru parçaları seçin. İpucu: yeni temsil = yeni bir **ConcreteBuilder**.' },
      { t: 'Derlendi: yeni hazırlayıcı', x: '[[JsonHazirlayici]] arayüzü uyguluyor ve kendi ürününü (`String`) veriyor. Diyagramda yeni bir **sütun** belirdi; çıktıda JSON satırı var.' },
      { t: 'Mevcut kod: dokunulmadı', x: '[[GonderiYoneticisi]], [[GonderiHazirlayici]] ve diğer hazırlayıcılar **değişmedi**; yalnızca `Main`’e üç satır eklendi. Yeni temsil eklemek Açık/Kapalı İlkesi’ne uyar.' },
      { t: 'Yeni istek: yeni bir ADIM', x: 'Muhasebe **kapıda ödeme** seçeneği istiyor: arayüze `kapidaOdeme(int tutar)` eklenince onu uygulamayan **her** hazırlayıcı derlenmez hâle gelir — dördü birden.' },
      { t: 'Ödünleşim (trade-off)', x: 'Builder’da **yeni temsil eklemek kolay**, **yeni adım eklemek zor**. Java 8+ `default` metodu acıyı hafifletir: adımla ilgilenmeyen hazırlayıcılar değişmeden derlenir. **JSON artık Yönetici sahnesinde!**' },
    ];

    function renderLeft(i) {
      exBox.hidden = i >= 3;
      typeBox.hidden = i < 3;
      left.head.querySelector('.panel-title').innerHTML = i >= 3 ? 'Yeni adım: <span class="ver">kapidaOdeme(int)</span>' : 'Görev: JSON temsili ekle';
      if (i < 3) return;
      if (i === 3) {
        typeTask.innerHTML = md('📩 **Muhasebe:** “Bazı gönderiler **kapıda ödemeli** olsun!”\nYeni bir adım → Builder arayüzüne yeni bir metot.');
        typeCv.setFiles([{ name: 'GonderiHazirlayici.java', code: BL.ext.withCod }], { prev: { 'GonderiHazirlayici.java': G.GonderiHazirlayici } });
        typeCv.mark('GonderiHazirlayici.java', 'kapidaOdeme', 'bad', { smooth: false });
        BL.renderConsole(typeConsole, '$ javac *.java', BL.compileErrors(true), { title: 'Derleyici' });
      } else {
        typeTask.innerHTML = md('💡 **Java 8+ ipucu:** `default` gövdeli bir metot, adımla ilgilenmeyen hazırlayıcıları kurtarır. İlgilenenler (ör. etiket, fiyat) metodu **ezer** (override).');
        typeCv.setFiles([{ name: 'GonderiHazirlayici.java', code: BL.ext.withDefault }], { prev: { 'GonderiHazirlayici.java': BL.ext.withCod } });
        typeCv.mark('GonderiHazirlayici.java', 'default GonderiHazirlayici kapidaOdeme', 'focus', { smooth: false });
        BL.renderConsole(typeConsole, '$ javac *.java && java Main', BL.gofOutput('asi', true).map((t) => ({ t })).concat([{ t: '(derleme başarılı — kapıda ödemeyi henüz hiçbir tarif kullanmıyor)', dim: true }]), { title: 'Derleyici' });
      }
    }

    function renderRight(i, animate) {
      diagram.setHidden(NEW, i < 1);
      diagram.clearBadges();
      diagram.clearFocus();
      if (i >= 1 && i <= 2) NEW.forEach((c) => diagram.badge(c, 'YENİ', 'new'));
      if (i === 1) diagram.focus({ classes: NEW, edges: ['real-JsonHazirlayici', 'cr-JsonHazirlayici'] });
      if (i === 2) OLD.forEach((c) => diagram.badge(c, '✓ değişmedi', 'same'));
      if (i === 3) {
        diagram.badge('GonderiHazirlayici', '+ kapidaOdeme()', 'bad');
        BUILDERS.forEach((c) => diagram.badge(c, '✗ derlenmez', 'bad'));
      }
      if (i === 4) diagram.badge('GonderiHazirlayici', 'default ✓', 'same');

      if (i === 0) {
        impact.innerHTML = `
          <div class="impact-title">İpucu</div>
          <p>${md('Yeni bir temsil = bir **ConcreteBuilder**: arayüzü uygula, her adımda kendi parçanı kur, sonucu `build()` ile ver.')}</p>`;
      } else if (i === 1) {
        impact.innerHTML = `
          <div class="impact-title ok">✔ Derleme başarılı · yeni temsil</div>
          <ul class="filelist"><li><span class="cv-dot rc rc-${BL.roleOf('JsonHazirlayici')}"></span>JsonHazirlayici.java <span class="cv-badge is-new">YENİ</span></li></ul>
          <div class="console bl-mini-console"><div class="console-line is-cmd">$ java Main   (son satır)</div><div class="console-line is-okline">${DP.esc(BL.gofOutput('asi', true).slice(-1)[0])}</div></div>`;
      } else if (i === 2) {
        impact.innerHTML = `
          <div class="metrics">
            <div class="metric is-good"><div class="m-val">0</div><div class="m-label">değişen sınıf (yönetici dahil)</div></div>
            <div class="metric"><div class="m-val">1</div><div class="m-label">yeni sınıf</div></div>
            <div class="metric"><div class="m-val">+3</div><div class="m-label">satır Main’de</div></div>
          </div>`;
      } else if (i === 3) {
        impact.innerHTML = `
          <div class="metrics">
            <div class="metric is-bad"><div class="m-val">5</div><div class="m-label">değişmek zorunda (arayüz + 4 hazırlayıcı)</div></div>
            <div class="metric is-bad"><div class="m-val">4</div><div class="m-label">derleme hatası</div></div>
            <div class="metric"><div class="m-val">1</div><div class="m-label">yeni adım</div></div>
          </div>`;
      } else {
        impact.innerHTML = `
          <table class="cmp">
            <thead><tr><th></th><th>Yeni temsil (hazırlayıcı)</th><th>Yeni adım (arayüz metodu)</th></tr></thead>
            <tbody>
              <tr><td>Değişen mevcut dosya</td><td class="ok">Hiçbiri (yalnızca Main’e ekleme)</td><td class="bad">Arayüz + tüm hazırlayıcılar</td></tr>
              <tr><td>Açık/Kapalı İlkesi</td><td class="ok">✔ Uyumlu</td><td class="bad">✘ İhlal (default ile yumuşar)</td></tr>
              <tr><td>Zorluk</td><td class="ok">Kolay</td><td class="bad">Zor</td></tr>
            </tbody>
          </table>
          <button class="btn btn-primary" type="button" data-go>{ } Yönetici sahnesinde JSON’u izle →</button>`;
        impact.querySelector('[data-go]').addEventListener('click', () => ctx.goScene('yonetici'));
      }
      if (animate) DP.flash(impact, 'is-pop');
    }

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: () => 6000,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        if (i >= 1) {
          ex.autoFill(info.animate && i === 1);
          S.jsonUnlocked = true;
        } else ex.ensureSelection();
        renderLeft(i);
        renderRight(i, info.animate || i !== prev);
      },
    });
    ex.paintAll();
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };

  // ================================================================== 8. GERÇEK DÜNYA
  const httpCode = (arg) => `import java.net.URI;
import java.net.http.HttpRequest;
import java.time.Duration;

public class HttpOrnegi {

    public static void main(String[] args) {
        HttpRequest istek = HttpRequest.newBuilder()${arg === '.build()' ? '' : '\n                .uri(URI.create("https://ornek.com/api/gonderi"))'}
                .header("Accept", "application/json")
                .timeout(Duration.ofSeconds(5))
                .GET()
                .build();

        System.out.println(istek.method() + " " + istek.uri());
        System.out.println(istek.headers().map());
    }
}`;

  const localeCode = (arg) => `import java.util.Locale;

public class LocaleOrnegi {

    public static void main(String[] args) {
        Locale tr = new Locale.Builder()
                .setLanguage("tr")
                ${arg}
                .build();

        System.out.println(tr + " / " + tr.getDisplayCountry(tr) + " / " + tr.getDisplayLanguage(tr));
    }
}`;

  const RW = [
    {
      tab: 'StringBuilder',
      title: '`StringBuilder` — her gün kullandığınız builder',
      intro: 'Metni **adım adım** biriktirip en sonda **değişmez** bir `String` veren `StringBuilder`, Builder fikrinin en tanıdık hâlidir. `append()` çağrıları tıpkı bizim adımlarımız gibi **zincirlenir**.',
      map: [
        ['concreteBuilder', 'Gonderi.Builder', '`StringBuilder`'],
        ['product', 'Gonderi', '`String` (değişmez)'],
        ['fm', 'build()', '`toString()`'],
        ['client', 'Main', 'Sizin kodunuz'],
      ],
      note: '`Gonderi.toString()` içinde de `StringBuilder` kullandık! (Teknik not: `StringBuilder` değişebilir bir tampondur; GoF’un tam Builder’ından çok “akıcı biriktirici”dir ama fikir aynı.) Çıktı Java 21 ile alındı.',
      roles: { StringBuilder: 'concreteBuilder', String: 'product' },
      special: { toString: 'fm' },
      file: 'StringBuilderOrnegi.java',
      code: () => `public class StringBuilderOrnegi {

    public static void main(String[] args) {
        String etiket = new StringBuilder()
                .append("KRG-")
                .append(1001)
                .append(" / ")
                .append("İzmir")
                .toString();          // «build()»: sonuç değişmez bir String

        System.out.println(etiket);
    }
}`,
      mark: '.toString();',
      out: ['KRG-1001 / İzmir'],
      cmd: '$ java StringBuilderOrnegi',
    },
    {
      tab: 'HttpRequest',
      title: '`HttpRequest.newBuilder()` — eksik bilgi build()’den geçemez',
      intro: 'Java 11’in HTTP istemcisi değişmez `HttpRequest` nesnelerini **yalnızca** bir builder ile kurdurur. Zorunlu bilgi (URI) eksikse `build()` reddeder — tıpkı bizim “kırılgan ⇒ sigorta” kuralımız gibi.',
      map: [
        ['concreteBuilder', 'Gonderi.Builder', '`HttpRequest.Builder`'],
        ['product', 'Gonderi', '`HttpRequest` (değişmez)'],
        ['fm', 'build()', '`build()` — eksikse `IllegalStateException`'],
        ['client', 'Main', 'İstek gönderen kodunuz'],
      ],
      note: 'İkinci denemede `.uri(…)` satırı yok: istisna `build()` satırında (12) fırlatılıyor. JDK içindeki satır numarası sürüme göre değişebilir; çıktılar Java 21 ile alındı.',
      roles: { HttpRequest: 'product' },
      special: { build: 'fm' },
      file: 'HttpOrnegi.java',
      code: httpCode,
      options: [
        { label: 'Tam istek', arg: '.uri(URI.create', out: ['GET https://ornek.com/api/gonderi', '{Accept=[application/json]}'] },
        {
          label: 'uri() unutuldu',
          arg: '.build()',
          out: ['Exception in thread "main" java.lang.IllegalStateException: uri is null', '\tat java.net.http/jdk.internal.net.http.HttpRequestBuilderImpl.build(HttpRequestBuilderImpl.java:222)', '\tat HttpOrnegi.main(HttpOrnegi.java:12)'],
        },
      ],
      cmd: '$ java HttpOrnegi',
    },
    {
      tab: 'Locale.Builder',
      title: '`Locale.Builder` — adım anında doğrulama',
      intro: 'Bazı builder’lar kuralları `build()`’i beklemeden **adım anında** denetler: geçersiz bölge kodu, zincir bitmeden `setRegion` satırında reddedilir.',
      map: [
        ['concreteBuilder', 'Gonderi.Builder', '`Locale.Builder`'],
        ['product', 'Gonderi', '`Locale` (değişmez)'],
        ['fm', 'build()', '`build()`'],
      ],
      note: 'Hata `build()`’de değil, `setRegion` satırında (8) fırlatıldı. Erken hata çoğu zaman daha anlaşılırdır; ama **birden çok alana bağlı** kurallar (kırılgan ⇒ sigorta gibi) ancak `build()`’de denetlenebilir. Çıktılar Java 21 ile alındı.',
      roles: { Locale: 'product' },
      special: { build: 'fm' },
      file: 'LocaleOrnegi.java',
      code: localeCode,
      options: [
        { label: 'tr-TR', arg: '.setRegion("TR")', out: ['tr_TR / Türkiye / Türkçe'] },
        {
          label: 'Hatalı bölge',
          arg: '.setRegion("TURKIYE")',
          out: ['Exception in thread "main" java.util.IllformedLocaleException: Ill-formed region: TURKIYE [at index 0]', '\tat java.base/java.util.Locale$Builder.setRegion(Locale.java:2795)', '\tat LocaleOrnegi.main(LocaleOrnegi.java:8)'],
        },
      ],
      cmd: '$ java LocaleOrnegi',
    },
    {
      tab: 'Lombok @Builder',
      title: 'Lombok `@Builder` — builder’ı derleyiciye yazdırmak',
      intro: 'Her alanı iki kez yazmak (sınıfta ve builder’da) Builder’ın en çok şikâyet edilen yanıdır. Lombok gibi kütüphaneler iç builder sınıfını **derleme anında üretir**.',
      map: [
        ['concreteBuilder', 'Gonderi.Builder', 'Lombok’un ürettiği `Gonderi.GonderiBuilder`'],
        ['fm', 'build()', '`build()` — ama **doğrulama yok**'],
      ],
      note: 'Dikkat: Lombok’un `build()`’i **doğrulama yapmaz**; “kırılgan ⇒ sigorta” kuralını yine sizin yazmanız gerekir. (Lombok kurulumu gerektirdiği için çıktı gösterilmiyor.)',
      roles: { Gonderi: 'product' },
      special: { build: 'fm', builder: 'fm' },
      file: 'Gonderi.java · Lombok',
      code: () => `import lombok.Builder;

@Builder                      // Lombok: Gonderi.builder() ve iç builder sınıfı üretilir
public class Gonderi {
    private final String nereden;
    private final String nereye;
    @Builder.Default private final int agirlik = 1;
    private final boolean kirilgan;
    private final boolean sogukZincir;
    private final boolean ekspres;
    private final int sigorta;
}

// Kullanım:
Gonderi vazo = Gonderi.builder()
        .nereden("Kütahya").nereye("İzmir").agirlik(12)
        .kirilgan(true).sigorta(5000)
        .build();`,
      mark: '@Builder                      // Lombok',
    },
    {
      tab: 'Karıştırmayın!',
      title: 'Builder mı, Abstract Factory mi, Factory Method mu?',
      intro: 'Dördü de “nesneyi kim, nasıl oluşturur?” sorusuna cevap verir. Ayırt etmenin anahtarı: **ne zaman** ve **ne** teslim edildiği.',
      extraHtml: `<table class="cmp cmp-3">
        <thead><tr><th></th><th>Builder</th><th>Abstract Factory</th><th>Factory Method</th><th>Prototype</th></tr></thead>
        <tbody>
          <tr><td>Ne üretir?</td><td>Tek, <b>karmaşık</b> ürün</td><td>İlişkili ürün <b>ailesi</b></td><td>Tek ürün</td><td>Var olanın kopyası</td></tr>
          <tr><td>Ne zaman döner?</td><td><b>En sonda</b> (<code>build()</code>)</td><td>Hemen (her çağrıda)</td><td>Hemen</td><td>Hemen (<code>kopyala()</code>)</td></tr>
          <tr><td>Odak</td><td>Kurulum süreci + doğrulama</td><td>Ailenin tutarlılığı</td><td>Hangi alt sınıf?</td><td>Kopyalama</td></tr>
          <tr><td>Bizim örnek</td><td><code>Gonderi.Builder</code></td><td><code>KaraFabrikasi</code></td><td><code>KaraLojistigi</code></td><td><code>son.kopyala()</code></td></tr>
        </tbody></table>`,
      note: 'Builder’lar sıklıkla **Composite** ağaçları (menü, belge, arayüz ağacı) kurmak için de kullanılır.',
      roles: { Gonderi: 'product', Builder: 'concreteBuilder' },
      special: { build: 'fm' },
      file: 'Karsilastirma.java',
      code: () => `// Abstract Factory: ürünler HEMEN döner, birbirine uyumlu bir aile
LojistikFabrikasi fabrika = new KaraFabrikasi();
TasimaAraci arac = fabrika.aracOlustur();       // hemen bir Kamyon
TasimaBelgesi belge = fabrika.belgeOlustur();   // hemen bir CMR

// Builder: TEK ürün ADIM ADIM kurulur, EN SONDA teslim edilir
Gonderi vazo = new Gonderi.Builder()
        .nereden("Kütahya").nereye("İzmir")
        .kirilgan().sigorta(5000)
        .build();                               // ürün ancak şimdi var`,
      mark: '.build();                               // ürün ancak şimdi var',
    },
  ];

  BL.scenes.realworld = (root, ctx) =>
    kit.realWorldScene(root, ctx, {
      tabs: RW,
      roles: BL.roles,
      roleOf: BL.roleOf,
      fmLabel: 'build() · sonuç',
      footText: (i) =>
        i === 4
          ? 'Yaratımsal kalıpları birbirinden ayırmak sınavda puan kazandırır.'
          : 'Kendi örneğimizdeki rolleri Java dünyasında bulun. Sağdaki düğmelerle başka bir deneme yapın: doğrulamanın **nerede** yapıldığına dikkat.',
    });

  // ================================================================== 9. QUIZ
  const BUILD_EXCERPT = `public Gonderi build() {
    if (nereden == null || nereye == null) {
        throw new IllegalStateException("Gönderi: nereden ve nereye zorunlu!");
    }
    if (kirilgan && sigorta == 0) {
        throw new IllegalStateException("Gönderi: kırılgan eşya sigortasız gönderilemez!");
    }
    return new Gonderi(this);
}`;

  const Q = [
    {
      type: 'mcq',
      q: 'Builder kalıbının **temel amacı** (GoF) nedir?',
      options: ['Bir sınıfın tek örneği olmasını sağlamak', 'İlişkili nesne ailelerini birlikte oluşturmak', 'Karmaşık bir nesnenin **kurulumunu temsilinden ayırmak**; aynı süreçle farklı temsiller üretmek', 'Var olan bir nesneyi kopyalamak'],
      answer: 2,
      explain: 'GoF: “Karmaşık bir nesnenin oluşturulmasını temsilinden ayır; böylece aynı oluşturma süreci farklı temsiller üretebilsin.” Diğerleri Singleton, Abstract Factory ve Prototype’ın amaçlarıdır.',
    },
    {
      type: 'mcq',
      q: '`new Gonderi("Kütahya", "İzmir", 12, false, true, false, 5000)` çağrısının **asıl tehlikesi** nedir?',
      options: ['Java yedi argümandan fazlasını kabul etmez', 'Çok yavaş çalışır', 'Kurucunun static olması gerekir', 'Aynı tipteki argümanların **yeri karışınca derleyici yakalayamaz**'],
      answer: 3,
      explain: 'Üç `boolean` yan yana: `kirilgan` ile `sogukZincir`’in yeri karıştı ama tipler aynı olduğu için kod derlendi. Builder’da her değerin bir **adı** var: `.kirilgan()`.',
    },
    {
      type: 'line',
      q: 'Akıcı Builder’da `Gonderi` nesnesinin **gerçekten oluşturulduğu** satıra tıklayın.',
      codeName: 'Gonderi.Builder · build()',
      code: BUILD_EXCERPT,
      answer: 'return new Gonderi(this);',
      explain: 'Adımlar yalnızca Builder’ın alanlarını doldurur; nesne **ancak** doğrulamalar geçince `new Gonderi(this)` ile doğar. Yarım ya da kurala aykırı bir gönderi hiç oluşmaz.',
    },
    {
      type: 'mcq',
      q: 'Set metotlarına (JavaBeans) göre Builder’ın **en önemli kazancı** hangisi?',
      options: ['Daha az kod yazılması', 'Kalıtımı zorunlu kılması', 'Daha hızlı çalışması', 'Nesnenin **yarım** hâlde kullanılamaması: `build()` tek seferde doğrular ve **değişmez** nesne verir'],
      answer: 3,
      explain: 'JavaBeans’te nesne boş doğar, set çağrıları arasında tutarsız kalır ve `final` olamaz. Builder’da tüm kurallar `build()` anında denetlenir; ürünün alanları `final`’dır.',
    },
    {
      type: 'mcq',
      q: 'GoF Builder’da **Yönetici (Director)** neyi bilir?',
      options: ['Adımların **sırasını** (tarifi) — hangi temsilin üretildiğini bilmez', 'Ürünün hangi somut sınıftan olacağını', 'Ürünün parçalarını kendisi `new` ile oluşturmayı', 'Ürünü değişmez yapmayı'],
      answer: 0,
      explain: '[[GonderiYoneticisi]] yalnızca `GonderiHazirlayici` arayüzünü tanır ve adımları sırayla çağırır. Paket mi, etiket mi, fiyat mı üretildiğine **verilen hazırlayıcı** karar verir.',
    },
    {
      type: 'line',
      q: 'Bu programda **etiket temsilinin seçildiği** satıra tıklayın.',
      codeName: 'Main.java',
      code: G.main('asi', false),
      answer: 'new EtiketHazirlayici()',
      explain: 'Temsil, istemcinin **hangi hazırlayıcıyı oluşturduğuna** göre seçilir. Yönetici aynı kalır; yalnızca ona verilen nesne değişir.',
    },
    {
      type: 'mcq',
      q: '`build()` (GoF: getResult) neden `GonderiHazirlayici` arayüzünde **yer almaz**?',
      options: ['Java arayüzlerinde metot dönüş tipi olamaz', 'Ürünlerin (`Gonderi`, `String`, `int`) **ortak bir üst tipi yok**', '`build()` yalnızca bir kez çağrılabilir', 'Yönetici onu çağıramadığı için'],
      answer: 1,
      explain: 'Her hazırlayıcının ürünü bambaşka bir tip; GoF bu yüzden sonuç alma işlemini somut hazırlayıcıya bırakır. İstemci sonucu, oluşturduğu hazırlayıcıdan alır.',
    },
    {
      type: 'mcq',
      q: 'Builder ile Abstract Factory arasındaki **temel fark** nedir?',
      options: ['İkisi de ürünü hemen döndürür', 'Builder **tek, karmaşık** bir ürünü adım adım kurup **en sonda** verir; Abstract Factory ilişkili bir **aileyi** her çağrıda **hemen** verir', 'Abstract Factory yalnızca tek ürün üretir', 'Builder kalıtım, Abstract Factory kompozisyon kullanır'],
      answer: 1,
      explain: 'Abstract Factory: `aracOlustur()` hemen bir Kamyon döndürür. Builder: `.kirilgan().sigorta(5000)` yalnızca bilgi toplar; ürün `build()`’de doğar.',
    },
  ];

  BL.scenes.quiz = (root, ctx) =>
    kit.quizScene(root, ctx, {
      questions: Q,
      roleOf: BL.roleOf,
      special: BL.special,
      patternName: 'Builder',
      match: {
        items: ['Main', 'GonderiYoneticisi', 'GonderiHazirlayici', 'Gonderi.Builder', 'EtiketHazirlayici', 'FiyatHazirlayici', 'Gonderi'].map((id) => ({ id, label: id })),
        buckets: ['client', 'director', 'builder', 'concreteBuilder', 'product'].map((k) => ({ id: k, title: BL.roles[k].en, sub: BL.roles[k].tr, color: BL.roles[k].color })),
        answer: BL.classRoles,
        hint: 'Yedi sınıfı beş role yerleştirin. Takıldığınızda **Cevapları göster** düğmesi var.',
      },
    });

  // ================================================================== 10. ÖZET
  BL.scenes.summary = function (root, ctx) {
    const el = h('div', { class: 'scene scene-summary' });
    el.innerHTML = `
      <div class="sum-head">
        <div>
          <div class="chips"><span class="chip chip-cat">Yaratımsal · Creational</span><span class="chip">İki yüzü: akıcı + GoF</span></div>
          <h1>Builder — Özet</h1>
        </div>
        <div class="sum-actions no-print">
          <button class="btn btn-ghost" type="button" data-print>🖨 Yazdır / PDF</button>
          <a class="btn btn-ghost" href="#/singleton/ozet">← Singleton özeti</a>
          <a class="btn btn-ghost" href="#/">Tüm kalıplar</a>
          ${DP.patterns.prototype ? '<a class="btn btn-primary" href="#/prototype">Sıradaki kalıp: Prototype →</a>' : ''}
        </div>
      </div>
      <div class="sum-grid">
        <article class="card sum-intent">
          <h3>Amaç</h3>
          <p>Karmaşık bir nesnenin <b>oluşturulmasını</b> temsilinden ayır; böylece <b>aynı oluşturma süreci</b> farklı temsiller üretebilsin.</p>
          <div class="sum-formula"><code>Director</code> → <code>builder.adimA().adimB()…</code> → <code class="tk-fm">build()</code> → <code>Product</code> <span>(paket · etiket · fiyat)</span></div>
        </article>
        <article class="card sum-uml"><h3>Yapı (GoF)</h3><div class="sum-diag"></div></article>
        <article class="card">
          <h3>İki yüzü</h3>
          <table class="cmp sg-sum-cmp">
            <thead><tr><th></th><th>Akıcı (Effective Java)</th><th>GoF</th></tr></thead>
            <tbody>
              <tr><td>Amaç</td><td>Çok parametreli <b>tek</b> ürün</td><td>Aynı süreç, <b>farklı temsiller</b></td></tr>
              <tr><td>Yönetici</td><td>İstemci</td><td>Ayrı sınıf</td></tr>
              <tr><td>Arayüz</td><td>Yok</td><td>Var</td></tr>
              <tr><td>Sonuç</td><td><code>build()</code></td><td><code>getResult()</code></td></tr>
            </tbody>
          </table>
        </article>
        <article class="card">
          <h3>Katılımcılar</h3>
          <ul class="sum-roles">
            <li>${ui.roleChip('director')}<span>adımların sırasını (tarifi) bilir</span></li>
            <li>${ui.roleChip('builder')}<span>parça kurma adımlarının arayüzü</span></li>
            <li>${ui.roleChip('concreteBuilder')}<span>adımları kendi temsiline çevirir, sonucu verir</span></li>
            <li>${ui.roleChip('product')}<span>kurulan karmaşık nesne</span></li>
          </ul>
        </article>
        <article class="card sum-pros">
          <h3>Artıları</h3>
          <ul>
            <li><b>Okunurluk:</b> her değerin bir adı var</li>
            <li><b>Doğrulama tek yerde</b> ve nesne doğmadan önce</li>
            <li><b>Değişmez</b> ürün; varsayılan değerler</li>
            <li><b>OCP:</b> yeni temsil = yeni hazırlayıcı</li>
          </ul>
        </article>
        <article class="card sum-cons">
          <h3>Eksileri</h3>
          <ul>
            <li>Daha fazla kod: alanlar iki kez yazılır</li>
            <li><b>Yeni adım</b> eklemek tüm hazırlayıcıları etkiler</li>
            <li>Az alanlı basit nesnelerde gereksiz karmaşıklık</li>
          </ul>
        </article>
        <article class="card">
          <h3>İlişkili kalıplar</h3>
          <ul>
            <li><b>Abstract Factory:</b> aileyi hemen verir; Builder tek ürünü en sonda.</li>
            <li><b>Composite:</b> Builder’lar sıklıkla ağaç yapıları kurar.</li>
            <li><b>Factory Method:</b> tek ürün, kararı alt sınıf verir.</li>
            <li><b>Singleton:</b> yönetici çoğu zaman tek örnek olabilir.</li>
          </ul>
        </article>
        <article class="card sum-tip">
          <h3>Sınav ipuçları</h3>
          <pre class="mini-code">new Gonderi.Builder()
    .nereden("Kütahya").nereye("İzmir")
    .kirilgan().sigorta(5000)
    .build();   // doğrula + değişmez nesne</pre>
          <p class="exam"><b>Teleskop kurucu</b> → Builder · <b>Director + Builder + ConcreteBuilder + Product</b> · Builder <u>en sonda</u> verir, Abstract Factory <u>hemen</u> verir</p>
        </article>
        <article class="card sum-files">
          <h3>Java kodları</h3>
          <p>Çalıştırılabilir örnekler proje klasöründe:</p>
          <pre class="mini-code">java/builder/sorun/teleskop   → yer değiştiren boolean’lar
java/builder/sorun/javabeans  → sigortasız kırılgan gönderi
java/builder/cozum            → akıcı Builder + 3 hazır tarif
java/builder/yonetici         → yönetici + 4 temsil</pre>
          <p>Derleyip çalıştırmak için <code>java/README.md</code> dosyasına bakın.</p>
        </article>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-print]').addEventListener('click', () => window.print());
    const spec = BL.gofDiagram({ json: false });
    spec.classes = spec.classes.filter((c) => !c.hidden);
    const diag = new DP.ClassDiagram(el.querySelector('.sum-diag'), spec, { roles: BL.roles, roleTags: false, mode: 'generic' });
    diag.svg.classList.add('is-compact');
    return { destroy() {} };
  };

  // ================================================================== kayıt
  DP.register({
    id: 'builder',
    name: 'Builder',
    tr: 'Yapıcı',
    category: 'creational',
    roleOf: BL.roleOf,
    initialState: () => ({
      preset: 'vazo',
      view: 'stage',
      showCode: true,
      recipe: 'asi',
      showDirCode: true,
      jsonUnlocked: false,
      ext: {},
      quiz: { results: {}, match: false },
    }),
    scenes: [
      { id: 'giris', title: 'Giriş', mount: BL.scenes.intro },
      { id: 'sorun', title: 'Sorun', mount: BL.scenes.problem },
      { id: 'cozum', title: 'Çözüm', mount: BL.scenes.solution },
      { id: 'akis', title: 'Canlı Akış', mount: BL.scenes.flow, star: true },
      { id: 'yonetici', title: 'Yönetici', mount: BL.scenes.director, star: true },
      { id: 'yapi', title: 'Yapı (UML)', mount: BL.scenes.structure },
      { id: 'genislet', title: 'Genişlet', mount: BL.scenes.extend },
      { id: 'gercek', title: 'Gerçek Dünya', mount: BL.scenes.realworld },
      { id: 'quiz', title: 'Quiz', mount: BL.scenes.quiz },
      { id: 'ozet', title: 'Özet', mount: BL.scenes.summary },
    ],
  });
})();
