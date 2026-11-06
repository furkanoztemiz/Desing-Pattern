/*
 * Flyweight — sahneler (3/3): Yapı, Genişlet, Gerçek Dünya, Quiz, Özet ve kalıp kaydı
 */
(function () {
  'use strict';
  const FL = DP.fl;
  const { h } = DP;
  const kit = DP.kit;
  const ui = FL.ui;
  const md = FL.md;
  const C = FL.code;
  const EX = FL.ext;

  // ================================================================== 6. YAPI
  const ROLE_TEXT = {
    client: 'Paylaşılan nesnelere başvuru tutar; <b>dışsal durumu</b> saklar ya da hesaplar ve işlemi çağırırken verir. Flyweight’leri yalnızca <b>fabrikadan</b> alır.',
    flyweight: 'Paylaşılan nesnelerin arayüzü: işlem, <b>dışsal durumu parametre olarak</b> alır (<code>operation(extrinsicState)</code>).',
    concreteFlyweight: '<b>İçsel</b> (paylaşılabilir) durumu saklar. Bağlamdan bağımsızdır ve <b>değişmez</b> olmalıdır: herkes aynı nesneyi kullanır.',
    unshared: 'Arayüz paylaşımı <b>mümkün kılar</b>, zorunlu kılmaz: bazı nesneler paylaşılmaz ve kendi bütün durumunu taşır.',
    factory: 'Flyweight’leri yaratır ve yönetir; aynı anahtar için hep <b>aynı nesneyi</b> verir. Yoksa bir kez yaratıp havuza koyar.',
  };

  function classInfo(id) {
    switch (id) {
      case 'Harita':
        return { role: 'client', file: 'Harita.java', code: C.Harita, mark: 'ekle(etiket, x, y, fabrika.al(tur));', points: ['İşaretleri **yalnızca fabrikadan** alır; `new IsaretTuru(…)` demez.', 'Dışsal durumu (noktaları) tutar; çizerken her nokta işaretine verir.', 'İkinci `ekle` her `Isaret`’i kabul eder: paylaşılanı da, paylaşılmayanı da.'] };
      case 'HaritaNoktasi':
        return { role: 'client', file: 'HaritaNoktasi.java', code: C.HaritaNoktasi, mark: 'isaret.ciz(x, y, etiket);', points: ['GoF’ta ayrı bir rol değil: istemcinin **dışsal durumu** sakladığı yer (bazı kaynaklar *Context* der).', 'Hafif: etiket, x, y ve paylaşılan işarete başvuru.', 'Sayısı gönderi sayısı kadardır; ağır kısım onda değil.'] };
      case 'Isaret':
        return { role: 'flyweight', file: 'Isaret.java', code: C.Isaret, mark: 'void ciz(int x, int y, String etiket);', points: ['Dışsal durum **parametre** olarak gelir: işaret konumu saklamaz.', 'Paylaşılan ve paylaşılmayan işaretlerin ortak arayüzü.', 'İstemci yalnızca bu arayüzü tanır.'] };
      case 'IsaretTuru':
        return { role: 'concreteFlyweight', file: 'IsaretTuru.java', code: C.IsaretTuru, mark: 'private final Ikon ikon;', points: ['Yalnızca **içsel** durum: tür adı ve 16 KB’lık ikon.', '**Değişmez**: alanlar ve sınıf `final`. Paylaşılan nesne değişirse herkes etkilenir.', 'Kurucusu paket-özel: onu yalnızca fabrika yaratır.'] };
      case 'IsaretFabrikasi':
        return { role: 'factory', file: 'IsaretFabrikasi.java', code: C.IsaretFabrikasi, mark: 'IsaretTuru isaret = havuz.get(tur);', points: ['`havuz`: tür adı → paylaşılan işaret.', 'Yoksa **bir kez** yaratır, varsa **aynı** nesneyi verir.', 'Paylaşımı garanti eden tek yer; uygulamada çoğu zaman tek örnektir (Singleton).'] };
      case 'DepoIsareti':
        return { role: 'unshared', file: 'DepoIsareti.java', code: C.DepoIsareti, mark: 'private final int doluluk;', points: ['Aynı arayüz, ama **paylaşılmaz**: her depo kendine özgü.', 'Kendi bütün durumunu taşır: doluluk, fotoğraf.', 'Fabrikadan geçmez; istemci doğrudan yaratır.'] };
      default:
        return null;
    }
  }

  FL.scenes.structure = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split' });
    const tools = h('div', { class: 'panel-tools' });
    const body = h('div', { class: 'scene-body cols-64' });
    const left = kit.panel('Yapı', { cls: 'panel-diagram', extra: tools });
    const right = kit.panel('Rol kartı <span class="panel-sub">· bir sınıfa tıklayın</span>', { cls: 'panel-side' });
    body.append(left.el, right.el);
    el.append(body);
    root.appendChild(el);

    const diagHost = h('div', { class: 'diag-host' });
    const legend = kit.umlLegend({ association: true, aggregation: 'tutar', fmLabel: 'paylaşılan nesneyi veren işlem' });
    left.body.append(diagHost, legend);
    const diagram = new DP.ClassDiagram(diagHost, FL.gofDiagram({ notes: true }), {
      roles: FL.roles,
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
      const r = FL.roles[info.role];
      infoTop.innerHTML = `
        <div class="info-role rc rc-${r.color}"><span class="info-dot"></span><b>${r.en}</b> · ${r.tr}</div>
        <div class="info-name rc rc-${r.color}">${DP.esc(id)}</div>
        <p class="info-desc">${ROLE_TEXT[info.role]}</p>
        <ul class="info-points">${info.points.map((p) => `<li>${md(p)}</li>`).join('')}</ul>`;
      const cv = new DP.CodeView(infoCode, { files: [{ name: info.file, code: info.code }], roleOf: FL.roleOf, special: FL.special, compact: true });
      cv.mark(info.file, info.mark, 'focus');
      DP.flash(infoTop, 'is-pop');
    }

    function showOverview() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">Beş rol, iki tür durum</div>
        <div class="role-list">
          ${['flyweight', 'concreteFlyweight', 'unshared', 'factory', 'client']
            .map((k) => `<div class="role-row rc rc-${FL.roles[k].color}"><span class="info-dot"></span><div><b>${FL.roles[k].en}</b> · ${FL.roles[k].tr}<div class="role-desc">${ROLE_TEXT[k]}</div></div></div>`)
            .join('')}
        </div>
        <p class="info-desc">Üstteki <b>Genel (GoF)</b> düğmesi kitaptaki adları gösterir.</p>`;
    }

    function showStates() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">İçsel ↔ dışsal durum</div>
        <table class="cmp fl-cmp">
          <thead><tr><th></th><th>İçsel <span lang="en">(intrinsic)</span></th><th>Dışsal <span lang="en">(extrinsic)</span></th></tr></thead>
          <tbody>
            <tr><td>Örnek</td><td>tür adı, ikon</td><td>etiket, x, y</td></tr>
            <tr><td>Kime ait?</td><td>Türe: her kolide <b>aynı</b></td><td>Gönderiye: her noktada <b>farklı</b></td></tr>
            <tr><td>Nerede durur?</td><td>Paylaşılan nesnede</td><td>İstemcide (<code>HaritaNoktasi</code>)</td></tr>
            <tr><td>Nasıl kullanılır?</td><td>Nesnenin içinden</td><td>Çağrıda parametre olarak</td></tr>
            <tr><td>Değişebilir mi?</td><td class="bad">Hayır: herkes paylaşıyor</td><td class="ok">Evet: kimseyle paylaşılmıyor</td></tr>
          </tbody>
        </table>
        <p class="info-desc">${md('Ayrımın ölçütü şu soru: **bu bilgi, onu kullanan her nokta için aynı mı?** Aynıysa içseldir ve paylaşılır; noktaya göre değişiyorsa dışsaldır ve çağrıyla gelir. Kestirme çözüm dışsal durumu paylaşılan nesneye koymuştu.')}</p>`;
      DP.flash(infoTop, 'is-pop');
    }

    const STEPS = [
      { t: 'Genel bakış', x: 'Beş rol. [[IsaretFabrikasi]] paylaşılan [[IsaretTuru]] nesnelerini bir **havuzda** tutar; [[Harita]] işaretleri yalnızca fabrikadan alır. Noktalar ([[HaritaNoktasi]]) dışsal durumu tutar ve işarete bir **başvuru** taşır.', info: null },
      { t: 'Flyweight — `Isaret`', x: '[[Isaret]] paylaşılabilen nesnelerin arayüzü. İşlemin imzasına dikkat: `ciz(x, y, etiket)`. Dışsal durum **parametre** olarak gelir; işaret onu saklamaz.', info: 'Isaret', focus: { classes: ['Isaret'], members: [['Isaret', 'ciz']] } },
      { t: 'ConcreteFlyweight — `IsaretTuru`', x: '[[IsaretTuru]] **içsel** durumu tutar: tür adı ve ikon. Bağlamdan bağımsızdır, **değişmez** ve paylaşılır: 10.000 noktadan binlercesi aynı nesneyi gösterir.', info: 'IsaretTuru', focus: { classes: ['IsaretTuru'], edges: ['r-tur'], members: [['IsaretTuru', 'ad'], ['IsaretTuru', 'ikon']] } },
      { t: 'FlyweightFactory — `IsaretFabrikasi`', x: '[[IsaretFabrikasi]] paylaşımı **garanti eder**: `al(tur)` önce havuza bakar, varsa aynı nesneyi verir, yoksa bir kez yaratır. İstemci `new IsaretTuru(…)` dememeli; yoksa paylaşım bozulur.', info: 'IsaretFabrikasi', focus: { classes: ['IsaretFabrikasi', 'IsaretTuru'], edges: ['havuz'], members: [['IsaretFabrikasi', 'havuz'], ['IsaretFabrikasi', 'al']] } },
      { t: 'İçsel ↔ dışsal durum', x: 'Kalıbın kalbi bu ayrım. **İçsel** durum paylaşılan nesnede durur ve değişmez; **dışsal** durum istemcide kalır ve her çağrıda verilir. Ölçüt: bilgi, onu kullanan her nokta için aynı mı?', states: true, focus: { classes: ['IsaretTuru', 'HaritaNoktasi'], members: [['IsaretTuru', 'ad'], ['IsaretTuru', 'ikon'], ['HaritaNoktasi', 'etiket'], ['HaritaNoktasi', 'xy']] } },
      { t: 'UnsharedConcreteFlyweight — `DepoIsareti`', x: 'Arayüz paylaşımı **zorunlu kılmaz**. [[DepoIsareti]] aynı arayüzü uygular ama her depo tektir: kendi durumunu (doluluk, fotoğraf) taşır ve fabrikadan geçmez. Harita ikisini aynı biçimde çizer.', info: 'DepoIsareti', focus: { classes: ['DepoIsareti'], edges: ['r-depo'], members: [['DepoIsareti', 'doluluk'], ['DepoIsareti', 'foto']] } },
      { t: 'Client — Harita', x: '[[Harita]] dışsal durumu noktalarda saklar ve işaretleri fabrikadan alır: `ekle(etiket, x, y, fabrika.al(tur))`. Çizerken her nokta kendi konumunu işarete verir. **Main**, paylaşımdan habersiz: kalıpsız sürümdekiyle aynı.', info: 'Harita', focus: { classes: ['Harita', 'HaritaNoktasi'], edges: ['fabrika', 'noktalar', 'isaret'] } },
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
        if (s.states) showStates();
        else if (s.info) showInfo(s.info);
        else showOverview();
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };

  // ================================================================== 7. GENİŞLET: paylaşılmayan işaret (depo)
  FL.scenes.extend = function (root, ctx) {
    const S = ctx.state;
    S.ext = S.ext || {};
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-50' });
    const left = kit.panel('Görev: <code class="fl-code-t">DepoIsareti</code>', { cls: 'panel-code panel-ex' });
    const right = kit.panel('Kurye tableti', { cls: 'panel-side fl-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    // ---- sol (adım 0): alıştırma
    const exBox = h('div', { class: 'ex-box' });
    const task = h('div', {
      class: 'task-card',
      html: md('📩 **Operasyon:** “Malatya aktarma merkezi de haritada görünsün; doluluk oranıyla birlikte.”\nHer depo **tektir**: kendi fotoğrafı ve kendi durumu var, paylaşılacak bir şey yok. Ama harita onu da bir `Isaret` gibi çizebilmeli.'),
    });
    const ex = kit.blankExercise({
      files: [
        { name: 'DepoIsareti.java', code: EX.exercise, badge: 'YENİ' },
        { name: 'Main.java · ek', code: EX.exerciseMain },
      ],
      answers: EX.answers,
      hints: {
        1: 'Haritaya çizilebilen her şeyin **ortak arayüzü**: Harita yalnızca onu tanır.',
        2: 'Depo kendi fotoğrafını yükler: 16 KB’lık resmi hangi sınıf tutuyor?',
        3: 'Arayüzdeki tek işlem; dışsal durum (x, y, etiket) parametre olarak gelir.',
        4: 'Depo **fabrikadan alınmaz**: Main hangi sınıfı doğrudan yaratıyor?',
      },
      choices: ['Isaret', 'IsaretTuru', 'IsaretFabrikasi', 'Ikon', 'HaritaNoktasi', 'DepoIsareti', 'ciz', 'al', 'ekle'],
      roleOf: FL.roleOf,
      special: FL.special,
      state: S.ext,
      doneText: '<b class="ok">✔ Derleme başarılı!</b> Depo haritaya eklendi.',
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
    const runBox = h('div', { class: 'fl-runbox', hidden: true });
    const runCode = h('div', { class: 'fl-cv' });
    const runConsole = h('div', { class: 'console fl-console' });
    runBox.append(runCode, runConsole);
    left.body.append(exBox, runBox);
    const runCv = new DP.CodeView(runCode, { roleOf: FL.roleOf, special: FL.special });

    // ---- sağ: harita + etki
    const viewHost = h('div', { class: 'fl-view' });
    const impact = h('div', { class: 'fl-extra' });
    right.body.append(viewHost, impact);
    const stage = new FL.Sahne(viewHost);

    const r = FL.run(EX.prog);
    const once = FL.stateOf({ mode: 'flyweight', items: [FL.UC[0], FL.UC[2]], adet: 0, heap: FL.TABLET }, { banner: { text: 'Depo nereye? **Paylaşılmayan** bir işaret gerekiyor.' } });
    const fin = FL.stateOf(EX.prog);
    const withHl = (st, hl) => Object.assign({}, st, { havuz: st.havuz.map((c) => Object.assign({}, c, { hl: hl.koli || null })), ayri: st.ayri.map((c) => Object.assign({}, c, { hl: hl.depo || null })) });
    const STEPS = [
      {
        t: 'Görev: `DepoIsareti`',
        x: 'Boşluklara tıklayıp doğru parçaları seçin. İpucu: depo da bir `Isaret`; ama fabrikadan **alınmayacak**, Main onu doğrudan yaratacak.',
        st: once,
      },
      {
        t: 'Derlendi: depolu harita',
        x: `[[DepoIsareti]] haritada. Konsola bakın: koli için fabrika **bir** işaret yarattı ve iki nokta onu paylaşıyor; depo kendi fotoğrafını yükledi (\`depo-Malatya.png#2\`). Toplam **${r.stats.ikon} ikon**.`,
        st: Object.assign({}, fin, { banner: { text: `✓ 3 nokta, **${r.stats.ikon} ikon**: koli paylaşılıyor, depo kendine özgü.`, tone: 'ok' } }),
      },
      {
        t: 'Paylaşılan ve paylaşılmayan',
        x: '[[Harita]] ikisini **aynı arayüzle** çiziyor: `isaret.ciz(x, y, etiket)`. Farkı yalnızca nereden geldikleri: koli işareti fabrikanın havuzundan, depo `new` ile. Hiçbir sınıf değişmedi.',
        st: Object.assign({}, withHl(fin, { koli: 'hit', depo: 'new' }), { banner: { text: 'Aynı arayüz: **paylaşılan** koli işareti ve **paylaşılmayan** depo işareti.', tone: 'ok' } }),
      },
      {
        t: 'Neden paylaşılmıyor?',
        x: 'Deponun durumu (doluluk, fotoğraf) **başka hiçbir noktayla ortak değil**; paylaşmak bir şey kazandırmaz. GoF bunu açıkça söyler: Flyweight arayüzü paylaşımı mümkün kılar, **zorunlu kılmaz**. **Depolu harita** tarifi artık Canlı Akış’ta açık.',
        st: Object.assign({}, fin, { banner: { text: 'Paylaşmak, ortak bir şey olduğunda kazandırır.', tone: 'ok' } }),
      },
    ];

    function renderLeft(i) {
      exBox.hidden = i >= 1;
      runBox.hidden = i < 1;
      left.head.querySelector('.panel-title').innerHTML = i >= 1 ? 'Yeni işaret: <code class="fl-code-t ver">DepoIsareti</code>' : 'Görev: <code class="fl-code-t">DepoIsareti</code>';
      if (i < 1) return;
      // önce konsol (yüksekliği değişir), sonra koddaki işaret
      FL.renderConsole(runConsole, FL.cmd(FL.TABLET, true), r.lines.map((l) => FL.consoleLine(l, { note: (x) => (x.k === 'depo' ? 'paylaşılmayan' : x.k === 'ciz' && x.i === 2 ? 'aynı koli nesnesi' : null) })));
      runCv.setFiles(
        [
          { name: 'DepoIsareti.java', code: C.DepoIsareti, badge: 'YENİ' },
          { name: 'Main.java', code: EX.Main },
        ],
        { active: i === 1 ? 'Main.java' : 'DepoIsareti.java', keepActive: false }
      );
      if (i === 1) runCv.mark('Main.java', 'new DepoIsareti(', 'focus');
      else runCv.mark('DepoIsareti.java', i === 2 ? 'public void ciz(int x, int y, String etiket) {' : 'private final int doluluk;', 'focus');
    }

    function renderImpact(i, animate) {
      if (i === 0) {
        impact.innerHTML = `<div class="impact-title">İpucu</div><p>${md('[[IsaretTuru]]’ya bakın: `implements Isaret`, kurucuda `new Ikon(…)`, `@Override public void ciz(…)`. Depo da böyle yazılır; tek fark, **Main** onu `fabrika.al(…)` yerine `new` ile yaratır.')}</p>`;
      } else if (i === 1) {
        impact.innerHTML = `
          <div class="impact-title ok">✔ Derleme başarılı · yeni sınıf</div>
          <ul class="filelist"><li><span class="cv-dot rc rc-${FL.roleOf('DepoIsareti')}"></span>DepoIsareti.java <span class="cv-badge is-new">YENİ</span></li></ul>`;
      } else if (i === 2) {
        impact.innerHTML = `
          <div class="metrics">
            <div class="metric is-good"><div class="m-val">0</div><div class="m-label">değişen sınıf</div></div>
            <div class="metric"><div class="m-val">1</div><div class="m-label">paylaşılan işaret · 2 nokta</div></div>
            <div class="metric"><div class="m-val">1</div><div class="m-label">paylaşılmayan işaret</div></div>
          </div>`;
      } else {
        impact.innerHTML = `
          <table class="cmp fl-cmp">
            <thead><tr><th></th><th>IsaretTuru</th><th>DepoIsareti</th></tr></thead>
            <tbody>
              <tr><td>Kaç nesne?</td><td>Tür başına bir</td><td>Depo başına bir</td></tr>
              <tr><td>Nereden gelir?</td><td><code>fabrika.al(tur)</code></td><td><code>new DepoIsareti(…)</code></td></tr>
              <tr><td>Durumu</td><td>İçsel: ad, ikon</td><td>Bütün durumu: doluluk, foto</td></tr>
              <tr><td>Arayüz</td><td><code>Isaret</code></td><td><code>Isaret</code></td></tr>
            </tbody>
          </table>
          <div class="fl-go"><button class="btn btn-primary btn-sm" type="button" data-go>🗺️ Canlı Akış’ta dene →</button></div>`;
        impact.querySelector('[data-go]').addEventListener('click', () => {
          S.preset = 'depo';
          ctx.goScene('akis');
        });
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
          S.depoUnlocked = true;
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
  const RW = FL.rw;
  const TABS = [
    {
      tab: 'Integer önbelleği',
      title: '`Integer.valueOf` — küçük sayılar paylaşılır',
      intro: 'Otomatik kutulama (`Integer a = 127`) aslında `Integer.valueOf(127)` çağırır. Java **-128 ile 127** arasındaki `Integer` nesnelerini önceden yaratıp bir dizide tutar ve hep **aynı nesneyi** verir. `Integer` değişmez olduğu için paylaşmak güvenlidir.',
      map: [
        ['flyweight', 'Isaret', '`Integer` (değişmez değer nesnesi)'],
        ['factory', 'IsaretFabrikasi', '`Integer.valueOf(int)`'],
        ['concreteFlyweight', 'IsaretTuru', '`IntegerCache` dizisindeki nesneler'],
        ['client', 'Harita', 'kutulama yapan kod'],
      ],
      note: 'Alt aralık (-128…127) dil tanımında güvence altında (JLS §5.1.7); üst sınır `-XX:AutoBoxCacheMax` ile büyütülebilir. Ders: nesneleri `==` ile değil `equals` ile karşılaştırın. Çıktılar Java 21 ile alındı.',
      roles: { Integer: 'flyweight' },
      file: 'TamsayiOnbellegi.java',
      code: RW.tamsayi,
      options: RW.tamsayiOpts,
      cmd: '$ java TamsayiOnbellegi',
    },
    {
      tab: 'String havuzu',
      title: '`String` havuzu ve `intern()`',
      intro: 'Kaynaktaki her metin sabiti (literal) JVM’in **metin havuzundan** gelir: aynı metin, aynı nesne. Çalışma anında birleştirilen metin ise yeni bir nesnedir; `intern()` onun yerine havuzdaki nesneyi verir.',
      map: [
        ['flyweight', 'Isaret', '`String` (değişmez)'],
        ['factory', 'IsaretFabrikasi', '`String.intern()` ve derleyici'],
        ['concreteFlyweight', 'IsaretTuru', 'havuzdaki metin nesneleri'],
        ['client', 'Harita', 'metin kullanan kod'],
      ],
      note: '`"KRG-" + 1001` gibi iki sabitin birleşimi derleme anında hesaplanır ve yine havuzdan gelir; burada `no` bir değişken olduğu için birleştirme çalışma anında yapılıyor. Çıktılar Java 21 ile alındı.',
      roles: { String: 'flyweight' },
      file: 'MetinHavuzu.java',
      code: RW.metin,
      options: RW.metinOpts,
      cmd: '$ java MetinHavuzu',
    },
    {
      tab: 'Swing: tek çizici',
      title: '`JTable` hücre çizicisi — tek bileşen, bütün hücreler',
      intro: 'Bir `JTable` her hücre için ayrı bir bileşen yaratmaz. **Tek** bir çizici bileşen bütün hücreleri sırayla çizer; hücreye özgü durum (değer, satır, sütun, seçili mi) `getTableCellRendererComponent(…)` çağrısıyla **parametre olarak** gelir. GoF’un belge editörü örneğindeki glif nesneleri gibi.',
      map: [
        ['flyweight', 'Isaret', '`TableCellRenderer`'],
        ['concreteFlyweight', 'IsaretTuru', '`DefaultTableCellRenderer` (tek bir `JLabel`)'],
        ['client', 'Harita', '`JTable`: dışsal durumu verir'],
      ],
      note: 'Ekranda pencere açılmadı; bileşen yalnızca bellekte. Altı hücre, tek bileşen: `c == ilk` hep `true`. Çıktı Java 21 ile alındı.',
      roles: { TableCellRenderer: 'flyweight' },
      file: 'TabloCizici.java',
      code: RW.tablo,
      out: RW.tabloOut,
      cmd: '$ java TabloCizici',
      mark: 'cizici.getTableCellRendererComponent(',
    },
    {
      tab: 'Karıştırmayın!',
      title: 'Flyweight, Singleton, nesne havuzu, Prototype',
      intro: 'Dördü de “nesne sayısı” ile ilgilidir. Fark: nesnenin **aynı anda** paylaşılıp paylaşılmadığı ve **değişip değişmediği**.',
      extraHtml: `<table class="cmp cmp-3">
        <thead lang="en"><tr><th></th><th>Flyweight</th><th>Singleton</th><th>Object Pool</th><th>Prototype</th></tr></thead>
        <tbody>
          <tr><td>Kaç nesne?</td><td>Anahtar başına <b>bir</b></td><td>Sınıf başına <b>bir</b></td><td>Sabit sayıda</td><td>İstendiği kadar</td></tr>
          <tr><td>Aynı anda paylaşılır mı?</td><td>Evet, herkesle</td><td>Evet</td><td>Hayır: ödünç alınır</td><td>Hayır: kopyalanır</td></tr>
          <tr><td>Değişebilir mi?</td><td><b>Hayır</b></td><td>Olabilir</td><td>Evet (geri verilince sıfırlanır)</td><td>Evet</td></tr>
          <tr><td>Amaç</td><td>Bellek</td><td>Tek erişim noktası</td><td>Yaratma maliyeti</td><td>Kopyalayarak yaratma</td></tr>
        </tbody></table>`,
      note: 'Nesne havuzu (bağlantı havuzu gibi) bir GoF kalıbı değildir ama sık karıştırılır: havuzdaki nesne bir anda **tek** kullanıcıya verilir. Flyweight ise aynı nesneyi **herkese aynı anda** verir; bu yüzden değişmez olmak zorundadır.',
      roles: { Isaret: 'flyweight', IsaretFabrikasi: 'factory' },
      special: FL.special,
      file: 'Karsilastirma.java',
      code: () => `// Flyweight: anahtar başına TEK, değişmez, herkesin aynı anda kullandığı nesne
Isaret koli = fabrika.al("koli");

// Singleton: sınıf başına TEK nesne
TakipNoUretici uretici = TakipNoUretici.getInstance();

// Nesne havuzu: ödünç al, kullan, geri ver (aynı anda tek kullanıcı)
Connection baglanti = baglantiHavuzu.getConnection();
baglanti.close();                          // havuza geri döner

// Prototype: paylaşmaz, KOPYALAR
Gonderi kopya = sablon.kopyala();`,
      mark: 'Isaret koli = fabrika.al("koli");',
    },
  ];

  FL.scenes.realworld = (root, ctx) =>
    kit.realWorldScene(root, ctx, {
      tabs: TABS,
      roles: FL.roles,
      roleOf: FL.roleOf,
      fmLabel: 'fabrika',
      footText: (i) =>
        i === 3
          ? 'Hepsi nesne sayısını yönetir; Flyweight’in farkı **aynı nesneyi aynı anda herkese** vermesi. Bu yüzden paylaşılan nesne değişmez olmalı.'
          : i === 2
          ? 'Tek bileşen, binlerce hücre: hücreye özgü bilgi çağrıyla geliyor. Bizim `isaret.ciz(x, y, etiket)` çağrımızın Swing’deki karşılığı.'
          : 'JDK, değişmez değer nesnelerini paylaşarak bellekten kazanır. Sağdaki düğmelerle `==` ile `equals` farkını görün.',
    });

  // ================================================================== 9. QUIZ
  const Q = [
    {
      type: 'mcq',
      q: 'Flyweight kalıbının **temel amacı** (GoF) nedir?',
      options: ['Çok sayıdaki ince taneli nesneyi paylaşım yoluyla verimli biçimde desteklemek', 'Bir nesneye erişimi denetlemek için onun yerine geçen bir vekil sağlamak', 'Yeni nesneleri var olan bir örneği kopyalayarak yaratmak', 'Bir sınıfın tek bir örneği olmasını sağlamak'],
      answer: 0,
      explain: 'GoF: “Çok sayıdaki ince taneli nesneyi paylaşım yoluyla verimli biçimde destekle.” Diğerleri Proxy, Prototype ve Singleton’ın amaçlarıdır.',
    },
    {
      type: 'mcq',
      q: 'Gönderi haritasında hangisi **içsel** (paylaşılabilir) durumdur?',
      options: ['Takip numarası (etiket)', 'Noktanın x, y konumu', 'Türün adı ve 16 KB’lık ikon', 'Gönderinin alıcısı'],
      answer: 2,
      explain: 'İkon ve tür adı aynı türdeki her noktada aynıdır: paylaşılır. Etiket ve konum noktaya özgüdür: dışsal durum, çağrıyla verilir.',
    },
    {
      type: 'line',
      q: 'Bu sınıfta **yeni bir paylaşılan işaretin yaratıldığı** satıra tıklayın.',
      codeName: 'IsaretFabrikasi.java',
      code: FL.plain(C.IsaretFabrikasi),
      answer: 'isaret = new IsaretTuru(tur);',
      explain: 'Yalnızca havuzda yoksa çalışır; her tür için bir kez. Sonraki isteklerde aynı nesne `return isaret;` ile döner.',
    },
    {
      type: 'mcq',
      q: '10.000 gönderi ve üç tür (koli, zarf, palet) var. Flyweight’li haritada kaç **IsaretTuru** ve kaç **HaritaNoktasi** nesnesi olur?',
      options: ['3 ve 3', '3 ve 10.000', '10.000 ve 10.000', '1 ve 10.000'],
      answer: 1,
      explain: 'Paylaşılan işaret tür başına bir (3). Noktalar hâlâ gönderi başına bir (10.000) ama hafif: etiket, x, y ve bir başvuru.',
    },
    {
      type: 'mcq',
      q: 'Paylaşılan nesne (flyweight) neden **değişmez** olmalıdır?',
      options: ['Değişmez sınıflar daha hızlı derlenir; fabrika onları önceden hazırlar', 'Paylaşıldığı için: biri değiştirirse onu kullanan herkes etkilenir (kestirmedeki gibi)', 'Java, bir fabrikada saklanan her nesnenin değişmez olmasını zorunlu kılar', 'Fabrikanın Map’i yalnızca final sınıfları ve değişmez nesneleri saklayabilir'],
      answer: 1,
      explain: 'Kestirme tasarımda etiket ve konum paylaşılan nesnenin üstüne yazılıyordu: son yazan kazandı, 10.000 nokta üç yere yığıldı.',
    },
    {
      type: 'mcq',
      q: '`Integer a = 128, b = 128;` için `a == b` ne yazdırır? (Java 21, varsayılan ayarlar)',
      options: ['true', 'false', 'Derleme hatası', 'NullPointerException'],
      answer: 1,
      explain: '`Integer.valueOf` yalnızca -128…127 aralığındaki nesneleri paylaşır. 128 için iki ayrı nesne yaratılır; `equals` ise true döner.',
    },
    {
      type: 'line',
      q: 'Bu sınıfta **dışsal durumun** paylaşılan işarete verildiği satıra tıklayın.',
      codeName: 'HaritaNoktasi.java',
      code: FL.plain(C.HaritaNoktasi),
      answer: 'isaret.ciz(x, y, etiket);',
      explain: 'Nokta konumunu ve etiketini kendisi tutar; çizerken paylaşılan işarete parametre olarak verir.',
    },
    {
      type: 'mcq',
      q: 'Flyweight ile Singleton arasındaki en önemli fark nedir?',
      options: ['Flyweight’te anahtar başına bir paylaşılan nesne olabilir; Singleton’da sınıf başına bir nesne vardır', 'İkisi aynı şeydir; Flyweight, Singleton’ın birden çok sınıfa uygulanmış adıdır', 'Singleton nesneleri değişmez olmalıdır; flyweight’ler ise paylaşıldıkları için değişebilir', 'Flyweight yalnızca sayılar ve karakterler için kullanılır; Singleton her türde olur'],
      answer: 0,
      explain: 'Fabrika her anahtar (tür) için ayrı bir paylaşılan nesne tutar: koli, zarf, palet. Fabrikanın kendisi ise çoğu zaman bir Singleton’dır.',
    },
  ];

  FL.scenes.quiz = (root, ctx) =>
    kit.quizScene(root, ctx, {
      questions: Q,
      roleOf: FL.roleOf,
      special: FL.special,
      patternName: 'Flyweight',
      match: {
        items: ['Isaret', 'IsaretTuru', 'DepoIsareti', 'IsaretFabrikasi', 'Harita', 'HaritaNoktasi'].map((id) => ({ id, label: id })),
        // uzun adlar (UnsharedConcreteFlyweight) kelime sınırlarında satır atlayabilsin
        buckets: ['flyweight', 'concreteFlyweight', 'unshared', 'factory', 'client'].map((k) => ({ id: k, title: FL.roles[k].en.replace(/([a-z])([A-Z])/g, '$1​$2'), sub: FL.roles[k].tr, color: FL.roles[k].color })),
        answer: FL.classRoles,
        hint: 'Altı sınıfı beş role yerleştirin. Takıldığınızda **Cevapları göster** düğmesi var.',
      },
    });

  // ================================================================== 10. ÖZET
  FL.scenes.summary = function (root, ctx) {
    const at = DP.catalog.findIndex((p) => p.id === 'flyweight');
    const next = DP.catalog.slice(at + 1).find((p) => p.ready && DP.patterns[p.id]);
    const el = h('div', { class: 'scene scene-summary' });
    el.innerHTML = `
      <div class="sum-head">
        <div>
          <div class="chips"><span class="chip chip-cat is-struct">Yapısal · Structural</span><span class="chip">Anahtar kelime: paylaşım</span></div>
          <h1>Flyweight — Özet</h1>
        </div>
        <div class="sum-actions no-print">
          <button class="btn btn-ghost" type="button" data-print>🖨 Yazdır / PDF</button>
          <a class="btn btn-ghost" href="#/facade/ozet">← Facade özeti</a>
          <a class="btn btn-ghost" href="#/">Tüm kalıplar</a>
          ${next ? `<a class="btn btn-primary" href="#/${next.id}">Sıradaki kalıp: ${DP.esc(next.name)} →</a>` : ''}
        </div>
      </div>
      <div class="sum-grid">
        <article class="card sum-intent">
          <h3>Amaç</h3>
          <p>Çok sayıdaki <b>ince taneli</b> nesneyi <b>paylaşım</b> yoluyla verimli biçimde destekle.</p>
          <div class="sum-formula"><code>flyweight.operation(<span class="fl-key-d">dışsal</span>)</code> → <code><span class="fl-key-i">içsel</span> durum nesnenin içinde</code> <span>(aynı nesne, farklı bağlam)</span></div>
        </article>
        <article class="card sum-uml"><h3>Yapı (GoF)</h3><div class="sum-diag"></div></article>
        <article class="card">
          <h3>Kopyalamak ↔ Paylaşmak</h3>
          <table class="cmp sg-sum-cmp">
            <thead lang="en"><tr><th></th><th>Kalıpsız</th><th>Flyweight</th></tr></thead>
            <tbody>
              <tr><td>İkon nesnesi</td><td class="bad">Nokta sayısı kadar</td><td class="ok">Tür sayısı kadar</td></tr>
              <tr><td>10.000 nokta</td><td class="bad">160.000 KB</td><td class="ok">48 KB</td></tr>
              <tr><td>Tablet (64 MB)</td><td class="bad">OutOfMemoryError</td><td class="ok">Çalışır</td></tr>
              <tr><td>Nokta nesnesi</td><td>10.000 (ağır)</td><td>10.000 (hafif)</td></tr>
            </tbody>
          </table>
        </article>
        <article class="card">
          <h3>Katılımcılar ve durum</h3>
          <ul class="sum-roles">
            <li>${ui.roleChip('flyweight')}<span>dışsal durumu parametre alır</span></li>
            <li>${ui.roleChip('concreteFlyweight')}<span>içsel durum, değişmez</span></li>
            <li>${ui.roleChip('factory')}<span>aynı anahtara aynı nesne</span></li>
          </ul>
          <p class="fl-sum-note"><b>İçsel</b>: paylaşılır, nesnede durur · <b>Dışsal</b>: istemcide kalır, çağrıyla gelir</p>
        </article>
        <article class="card sum-pros">
          <h3>Artıları</h3>
          <ul>
            <li>Bellek ve nesne sayısı <b>tür sayısına</b> iner</li>
            <li>Pahalı yükleme (disk, ağ) <b>bir kez</b> yapılır</li>
            <li>Çok sayıda nesneyle çalışmak mümkün olur</li>
            <li>İstemcinin üst düzey kodu (Main) değişmez</li>
          </ul>
        </article>
        <article class="card sum-cons">
          <h3>Eksileri</h3>
          <ul>
            <li>Dışsal durumu istemci taşır ya da hesaplar</li>
            <li>Paylaşılan nesne <b>değişmez</b> olmak zorunda</li>
            <li>Az nesnede ya da paylaşılacak ortak durum yoksa kazanç yok</li>
            <li>Eşzamanlı erişimde fabrika güvenli olmalı</li>
          </ul>
        </article>
        <article class="card">
          <h3>İlişkili kalıplar</h3>
          <ul>
            <li><b>Composite:</b> ağacın yaprakları paylaşılan flyweight’ler olabilir.</li>
            <li><b>State, Strategy:</b> durum ve strateji nesneleri çoğu zaman flyweight olarak paylaşılır.</li>
            <li><b>Singleton:</b> fabrika çoğu zaman tektir; flyweight ise anahtar başına bir.</li>
            <li><b>Prototype:</b> paylaşmaz, kopyalar.</li>
          </ul>
        </article>
        <article class="card sum-tip">
          <h3>Sınav ipuçları</h3>
          <pre class="mini-code">interface Isaret { void ciz(int x, int y, String etiket); } // Flyweight
final class IsaretTuru implements Isaret {             // ConcreteFlyweight
    private final Ikon ikon;                           // içsel, değişmez
    public void ciz(int x, int y, String etiket) { … } // dışsal: parametre
}
class IsaretFabrikasi {                                // FlyweightFactory
    private final Map&lt;String, IsaretTuru&gt; havuz = new HashMap&lt;&gt;();
    Isaret al(String tur) { /* yoksa yarat, varsa aynısını ver */ }
}</pre>
          <p class="exam"><b>Çok sayıda benzer nesne + bellek</b> → Flyweight · <b>içsel</b> = paylaşılan, değişmez · <b>dışsal</b> = istemcide, parametreyle · <b>fabrika</b> = havuz</p>
        </article>
        <article class="card sum-files">
          <h3>Java kodları</h3>
          <p>Çalıştırılabilir örnekler proje klasöründe:</p>
          <pre class="mini-code">java/flyweight/sorun      → her nokta kendi ikonu; tablette OutOfMemoryError
java/flyweight/kestirme   → bütün nokta paylaşılıyor; harita yanlış
java/flyweight/cozum      → IsaretTuru + IsaretFabrikasi: 10.000 nokta, 3 ikon
java/flyweight/akis/...   → Canlı Akış: uc · depo
java/flyweight/genislet   → DepoIsareti: paylaşılmayan işaret</pre>
          <p>Derleyip çalıştırmak için <code>java/README.md</code> dosyasına bakın.</p>
        </article>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-print]').addEventListener('click', () => window.print());
    const diag = new DP.ClassDiagram(el.querySelector('.sum-diag'), FL.gofDiagram({}), { roles: FL.roles, roleTags: false, mode: 'generic' });
    diag.svg.classList.add('is-compact');
    return { destroy() {} };
  };

  // ================================================================== kayıt
  DP.register({
    id: 'flyweight',
    name: 'Flyweight',
    tr: 'Sinek Sıklet',
    category: 'structural',
    roleOf: FL.roleOf,
    initialState: () => ({
      view: 'stage',
      showCode: true,
      preset: 'uc',
      tz: { mode: 'flyweight', n: 10000 },
      depoUnlocked: false,
      ext: {},
      quiz: { results: {}, match: false },
    }),
    scenes: [
      { id: 'giris', title: 'Giriş', mount: FL.scenes.intro },
      { id: 'sorun', title: 'Sorun', mount: FL.scenes.problem },
      { id: 'cozum', title: 'Çözüm', mount: FL.scenes.solution },
      { id: 'akis', title: 'Canlı Akış', mount: FL.scenes.flow, star: true },
      { id: 'tezgah', title: 'Harita Tezgâhı', mount: FL.scenes.counter, star: true },
      { id: 'yapi', title: 'Yapı (UML)', mount: FL.scenes.structure },
      { id: 'genislet', title: 'Genişlet', mount: FL.scenes.extend },
      { id: 'gercek', title: 'Gerçek Dünya', mount: FL.scenes.realworld },
      { id: 'quiz', title: 'Quiz', mount: FL.scenes.quiz },
      { id: 'ozet', title: 'Özet', mount: FL.scenes.summary },
    ],
  });
})();
