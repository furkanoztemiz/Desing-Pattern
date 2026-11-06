/*
 * Composite — sahneler (3/3): Yapı, Genişlet, Gerçek Dünya, Quiz, Özet ve kalıp kaydı
 */
(function () {
  'use strict';
  const CP = DP.cp;
  const { h } = DP;
  const kit = DP.kit;
  const ui = CP.ui;
  const md = CP.md;
  const C = CP.code;
  const EX = CP.ext;

  // ================================================================== 6. YAPI
  const ROLE_TEXT = {
    client: 'Parçalarla yalnızca <b>Component</b> arayüzü üzerinden konuşur; ürün mü koli mi diye <b>sormaz</b>.',
    component: 'Ağaçtaki her nesnenin <b>ortak arayüzü</b>: işlemler (şeffaf tasarımda çocuk yönetimi de) burada bildirilir.',
    leaf: 'Çocuğu olmayan parça: işlemi <b>kendisi</b> yapar.',
    composite: 'Çocukları (<b>Component</b>’leri) tutar; işlemi her çocuğa <b>devredip</b> sonuçları birleştirir. Kendisi de bir Component’tir.',
  };

  function classInfo(id) {
    switch (id) {
      case 'Main':
        return { role: 'client', file: 'Main.java', code: C.Main, mark: 'List<Parca> sevkiyat = List.of(siparis, bisiklet);', points: ['Koliyi ve bisikleti **aynı listede** tutar: `List<Parca>`.', 'Ağacın kaç kat olduğunu bilmez; her parçaya tek bir çağrı yapar.', 'Koliyi kurarken `Koli` tipini kullanır: güvenli tasarımda `ekle` yalnızca kolide.'] };
      case 'Parca':
        return { role: 'component', file: 'Parca.java', code: C.Parca, mark: 'public interface Parca {', points: ['İki işlem: `agirlik()` ve `listele(girinti)`.', 'Güvenli tasarımda çocuk yönetimi **burada değil**; şeffaf tasarımda burada (GoF’un şeması).', 'Hem `Urun` hem `Koli` bu arayüzü uygular.'] };
      case 'Urun':
        return { role: 'leaf', file: 'Urun.java', code: C.Urun, mark: 'return gram;', points: ['Soruyu **kendisi** cevaplar: `return gram;`', 'İçinde başka parça yok: ağacın **yaprağı**.', 'Yeni bir yaprak türü (ör. belge zarfı) = bir yeni sınıf.'] };
      case 'Koli':
        return { role: 'composite', file: 'Koli.java', code: C.Koli, mark: 'toplam += p.agirlik();', points: ['Çocukları **tek listede** tutar: `List<Parca> icindekiler` — ürün de olur, koli de.', 'İşi her çocuğa devreder, sonuçları birleştirir: kendi darası + içindekiler.', 'Kendisi de bir `Parca`: başka bir kolinin içine konabilir (**özyinelemeli** yapı).'] };
      default:
        return null;
    }
  }

  CP.scenes.structure = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split' });
    const tools = h('div', { class: 'panel-tools' });
    const body = h('div', { class: 'scene-body cols-64' });
    const left = kit.panel('Yapı', { cls: 'panel-diagram', extra: tools });
    const right = kit.panel('Rol kartı <span class="panel-sub">· bir sınıfa tıklayın</span>', { cls: 'panel-side' });
    body.append(left.el, right.el);
    el.append(body);
    root.appendChild(el);

    const diagHost = h('div', { class: 'diag-host' });
    const legend = kit.umlLegend({ aggregation: true, fmLabel: 'işi içindekilere devreden (özyinelemeli) işlem' });
    left.body.append(diagHost, legend);
    let seffaf = false;
    const diagram = new DP.ClassDiagram(diagHost, CP.gofDiagram({ notes: true }), {
      roles: CP.roles,
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
    const designSeg = kit.seg(
      [
        { v: 'guvenli', label: 'Güvenli', title: 'ekle/cikar yalnızca Koli’de' },
        { v: 'seffaf', label: 'Şeffaf', title: 'ekle/cikar Parca’da (GoF’un şeması)' },
      ],
      'guvenli',
      (v) => setDesign(v === 'seffaf', true)
    );
    const tagToggle = kit.toggle('Rol etiketleri', true, (on) => diagram.setRoleTags(on));
    tools.append(designSeg.el, modeSeg.el, tagToggle);

    function setDesign(on, animate) {
      designSeg.set(on ? 'seffaf' : 'guvenli');
      if (on === seffaf) return;
      seffaf = on;
      diagram.update(CP.gofDiagram({ notes: true, seffaf: on }), { animate });
    }

    const infoTop = h('div', { class: 'info-card' });
    const infoCode = h('div', { class: 'info-code' });
    right.body.append(infoTop, infoCode);

    function showInfo(id) {
      const info = classInfo(id);
      infoCode.innerHTML = '';
      if (!info) return;
      const r = CP.roles[info.role];
      const code = id === 'Parca' && seffaf ? C.ParcaSeffaf : info.code;
      const mark = id === 'Parca' && seffaf ? 'default void ekle(Parca p) {' : info.mark;
      infoTop.innerHTML = `
        <div class="info-role rc rc-${r.color}"><span class="info-dot"></span><b>${r.en}</b> · ${r.tr}</div>
        <div class="info-name rc rc-${r.color}">${DP.esc(id)}</div>
        <p class="info-desc">${ROLE_TEXT[info.role]}</p>
        <ul class="info-points">${info.points.map((p) => `<li>${md(p)}</li>`).join('')}</ul>`;
      const cv = new DP.CodeView(infoCode, { files: [{ name: info.file, code }], roleOf: CP.roleOf, special: CP.special, compact: true });
      cv.mark(info.file, mark, 'focus');
      DP.flash(infoTop, 'is-pop');
    }

    function showOverview() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">Üç rol, bir ağaç</div>
        <div class="role-list">
          ${['component', 'leaf', 'composite']
            .map((k) => `<div class="role-row rc rc-${CP.roles[k].color}"><span class="info-dot"></span><div><b>${CP.roles[k].en}</b> · ${CP.roles[k].tr}<div class="role-desc">${ROLE_TEXT[k]}</div></div></div>`)
            .join('')}
        </div>
        <p class="info-desc">Ağacı <b>Client</b> kurar ve kullanır. Üstteki <b>Genel (GoF)</b> düğmesi kitaptaki adları gösterir.</p>`;
    }

    function showTradeoff() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">Şeffaf mı, güvenli mi?</div>
        <table class="cmp cp-cmp">
          <thead><tr><th></th><th>Güvenli</th><th>Şeffaf (GoF)</th></tr></thead>
          <tbody>
            <tr><td><code>ekle</code>, <code>cikar</code></td><td>Yalnızca <code>Koli</code></td><td><code>Parca</code>’da; ürün varsayılanı devralır</td></tr>
            <tr><td>Ürüne ekleme</td><td class="ok">Derlenmez</td><td class="bad">Çalışma anında istisna</td></tr>
            <tr><td>İstemci</td><td>Koliyi <code>Koli</code> olarak tutar</td><td class="ok">Her şeye <code>Parca</code> der</td></tr>
          </tbody>
        </table>
        <p class="info-desc">${md('GoF şeffaflığı öne çıkarır; Java’da AWT güvenli (`add` yalnızca `Container`’da), DOM ise şeffaftır (`appendChild` her düğümde). Tezgâhta ikisini de deneyin.')}</p>`;
      const cv = new DP.CodeView(infoCode, { files: [{ name: 'Parca.java', code: C.ParcaSeffaf }], roleOf: CP.roleOf, special: CP.special, compact: true });
      cv.mark('Parca.java', 'default void ekle(Parca p) {', 'focus');
      DP.flash(infoTop, 'is-pop');
    }

    const STEPS = [
      { t: 'Genel bakış', x: 'Üç rol ve bir istemci. Diyagramdaki **halkaya** dikkat: [[Koli]] hem `Parca`’yı **uygular** (üçgenli kesik ok) hem de `Parca`’ları **içerir** (◇). İkisi birlikte ağacı mümkün kılar.', info: null },
      { t: 'Component — Bileşen', x: '[[Parca]] ağaçtaki her nesnenin ortak arayüzü: `agirlik()` ve `listele(girinti)`. İstemci yalnızca bunu tanır.', info: 'Parca', focus: { classes: ['Parca'] } },
      { t: 'Leaf — Yaprak', x: '[[Urun]] çocuksuz parça: işlemi **kendisi** yapar. Bir ağaçta en çok bulunan nesneler genellikle yapraklardır.', info: 'Urun', focus: { classes: ['Urun'], edges: ['r-urun'] } },
      { t: 'Composite — Bileşik', x: '[[Koli]] çocukları tek bir listede tutar ve işi onlara **devreder**: kendi darası + her çocuğun ağırlığı. Çocuk yönetimi de burada: `ekle`, `cikar`.', info: 'Koli', focus: { classes: ['Koli'], members: [['Koli', 'icindekiler'], ['Koli', 'agirlik']] } },
      { t: 'Özyinelemeli yapı', x: 'Bileşik, bileşeni hem **uygular** hem **içerir**: “bir koli bir parçadır **ve** parçalardan oluşur”. Nottaki satırlar kalıbın kalbi: her çocuğa aynı soruyu sor, cevapları birleştir. Çocuk bir koliyse soru onun içine iner.', info: 'Koli', focus: { classes: ['Koli', 'Parca'], edges: ['r-koli', 'cocuklar'] } },
      { t: 'Şeffaf mı, güvenli mi?', x: 'GoF’un şemasında `add`, `remove` **Component**’tedir (**şeffaf**): istemci her şeye aynı davranır, ama ürüne ekleme ancak çalışma anında yakalanır. Örneğimiz **güvenli** tasarımı seçti: `ekle` yalnızca [[Koli]]’de. Üstteki düğmeyle iki şemayı karşılaştırın.', tradeoff: true, design: true, focus: { classes: ['Parca'], members: [['Parca', 'ekle'], ['Parca', 'cikar']] } },
      { t: 'Client — İstemci', x: '[[Main]] ağacı kurar ve tek bir listede gezer: `for (Parca p : sevkiyat)`. Ürün mü koli mi, kaç kat derin — hiçbirini sormaz.', info: 'Main', focus: { classes: ['Main'], edges: ['uses'] } },
    ];

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: () => 6200,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        setDesign(!!s.design, info.animate);
        diagram.select(null);
        if (s.focus) diagram.focus(s.focus);
        else diagram.clearFocus();
        if (s.tradeoff) showTradeoff();
        else if (s.info) showInfo(s.info);
        else showOverview();
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };

  // ================================================================== 7. GENİŞLET: yeni bileşik Palet
  CP.scenes.extend = function (root, ctx) {
    const S = ctx.state;
    S.ext = S.ext || {};
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-50' });
    const left = kit.panel('Görev: Palet', { cls: 'panel-code panel-ex' });
    const right = kit.panel('Koliler', { cls: 'panel-side cp-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    // ---- sol (adım 0): alıştırma
    const exBox = h('div', { class: 'ex-box' });
    const task = h('div', {
      class: 'task-card',
      html: md('📩 **Depo:** “Malatya’ya giden kamyon **palet** yüklüyor: sipariş kolisi ve kolisiz bisiklet aynı palete.”\nKural: `Koli`, `Urun` ve `Parca`’ya **dokunmadan** yeni bir kap türü ekleyin.'),
    });
    const ex = kit.blankExercise({
      files: [
        { name: 'Palet.java', code: EX.exercise, badge: 'YENİ' },
        { name: 'Main.java · ek', code: EX.exerciseMain },
      ],
      answers: { 1: 'Parca', 2: 'Parca', 3: 'agirlik', 4: 'listele', 5: 'bisiklet' },
      hints: {
        1: 'Palet de ağaçtaki bir **parça**: hangi arayüzü uygulamalı?',
        2: 'Palete koli de konur, kolisiz bisiklet de: liste **hangi tipte** olmalı?',
        3: 'Her parçaya hangi **soruyu** soruyoruz? (ağırlık)',
        4: 'İçindekileri bir kat içeriden **yazdıran** çağrı hangisi?',
        5: 'Kolisiz gönderilen ürünün değişkeni?',
      },
      choices: ['Parca', 'Koli', 'Urun', 'Palet', 'agirlik', 'listele', 'ekle', 'icindekiler', 'siparis', 'bisiklet'],
      roleOf: CP.roleOf,
      special: CP.special,
      state: S.ext,
      doneText: '<b class="ok">✔ Derleme başarılı!</b> Palet hazır.',
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
    const runBox = h('div', { class: 'cp-runbox', hidden: true });
    const runCode = h('div', { class: 'cp-cv' });
    const runConsole = h('div', { class: 'console cp-console' });
    runBox.append(runCode, runConsole);
    left.body.append(exBox, runBox);
    const runCv = new DP.CodeView(runCode, { roleOf: CP.roleOf, special: CP.special });

    // ---- sağ: koliler + etki
    const viewHost = h('div', { class: 'cp-view' });
    const impact = h('div', { class: 'cp-extra' });
    right.body.append(viewHost, impact);
    const stage = new CP.Boxes(viewHost, { minH: 640 });

    const roots = [CP.clone(CP.TREE), CP.U('bisiklet')];
    const W = CP.weight(EX.TREE);
    const STEPS = [
      {
        t: 'Görev: Palet',
        x: 'Boşluklara tıklayıp doğru parçaları seçin. İpucu: palet de bir **bileşik**; koli gibi içindekilere sorar, ama kendi ağırlığı ve başlığı farklı.',
        st: { roots, ghostPalet: true, weights: true, banner: { text: 'Yeni kap türü = **tek bir sınıf**. Hangi sınıfa dokunacağız? **Hiçbirine.**' } },
      },
      {
        t: 'Derlendi: palet.listele("")',
        x: `[[Palet]] siparişi ve bisikleti taşıyor: \`palet.ekle(siparis)\`, \`palet.ekle(bisiklet)\`. Sipariş ağacının tamamı **bir kat içeriden** listelendi; toplam **${W} g**. Koliye de ürüne de aynı davrandı.`,
        st: { roots: [EX.TREE], banner: { text: `✓ \`palet.agirlik()\` → **${W} g**`, tone: 'ok' } },
      },
      {
        t: 'Hiçbir sınıf değişmedi',
        x: '[[Koli]], [[Urun]] ve [[Parca]]’ya dokunulmadı. Kalıpsız Kantar’da palet, **bir kat daha** iç içe döngü ve yeni metotlar demekti; burada palet yalnızca “içindekilere soran” yeni bir parça.',
        st: { roots: [EX.TREE], banner: { text: 'Palet koliyi taşıyor, koli kutuyu, kutu saati: **dört kat**, tek kod.', tone: 'ok' } },
      },
      {
        t: 'Kalıpsız olsaydı?',
        x: 'Kantar’a `agirlik(Palet)`, `listele(Palet)` ve bir kat daha döngü gerekirdi; her yeni kap türü **bütün işlemleri** değiştirirdi. Composite’te +1 sınıf. **Palete yükle** artık **Paketleme Tezgâhı**’nda da açık.',
        st: { roots: [EX.TREE], banner: { text: 'Yeni kap türü: kalıpsız **her işlem** değişir, Composite’te **+1 sınıf**.', tone: 'ok' } },
      },
    ];

    function renderLeft(i) {
      exBox.hidden = i >= 1;
      runBox.hidden = i < 1;
      left.head.querySelector('.panel-title').innerHTML = i >= 1 ? 'Yeni bileşik: <span class="ver">Palet</span>' : 'Görev: Palet';
      if (i < 1) return;
      // önce konsol (yüksekliği değişir), sonra koddaki işaret
      CP.renderConsole(
        runConsole,
        '$ javac *.java && java Main',
        EX.output.map((t, j) => ({ t, ok: j === 0 }))
      );
      runCv.setFiles(
        [
          { name: 'Palet.java', code: C.Palet, badge: 'YENİ' },
          { name: 'Main.java', code: EX.Main },
        ],
        { active: i === 1 ? 'Main.java' : 'Palet.java', keepActive: false }
      );
      if (i === 1) runCv.mark('Main.java', 'palet.ekle(bisiklet);', 'focus');
      else runCv.mark('Palet.java', 'toplam += p.agirlik();', 'focus');
    }

    function renderImpact(i, animate) {
      if (i === 0) {
        impact.innerHTML = `<div class="impact-title">İpucu</div><p>${md('Koli içindekilere `p.agirlik()` diye sorar ve **ürün mü koli mi** bilmez. Palet de aynısını yapacak; yeter ki listesi `Parca` tutsun.')}</p>`;
      } else if (i === 1) {
        impact.innerHTML = `
          <div class="impact-title ok">✔ Derleme başarılı · yeni bileşik</div>
          <ul class="filelist"><li><span class="cv-dot rc rc-${CP.roleOf('Palet')}"></span>Palet.java <span class="cv-badge is-new">YENİ</span></li></ul>`;
      } else if (i === 2) {
        impact.innerHTML = `
          <div class="metrics">
            <div class="metric is-good"><div class="m-val">0</div><div class="m-label">değişen sınıf</div></div>
            <div class="metric"><div class="m-val">1</div><div class="m-label">yeni sınıf</div></div>
            <div class="metric"><div class="m-val">${CP.depthOf(EX.TREE) + 1}</div><div class="m-label">kat derinlik</div></div>
          </div>`;
      } else {
        impact.innerHTML = `
          <table class="cmp cp-cmp">
            <thead><tr><th>Yeni kap türü</th><th>Kalıpsız (Kantar)</th><th>Composite</th></tr></thead>
            <tbody>
              <tr><td>Yeni sınıf</td><td>+1 (Palet)</td><td class="ok">+1 (Palet)</td></tr>
              <tr><td>Değişen sınıf</td><td class="bad">Kantar: her işlem</td><td class="ok">0</td></tr>
              <tr><td>Derinlik</td><td class="bad">Bir kat daha döngü</td><td class="ok">Kendiliğinden</td></tr>
            </tbody>
          </table>
          <div class="cp-go"><button class="btn btn-primary btn-sm" type="button" data-go>📦 Paketleme Tezgâhı’nda dene →</button></div>`;
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
          S.paletUnlocked = true;
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
  const RW = CP.rw;
  const TABS = [
    {
      tab: 'AWT / Swing',
      title: '`java.awt.Container` — bileşen ağacı',
      intro: 'Bir form iç içe panellerden oluşur: `JPanel` içinde `JPanel`, içlerinde etiketler, metin kutuları, düğmeler. `Container` bir `Component`’tir **ve** `Component`’ler tutar: `add(Component)`. Çizim (`paint`), yerleşim (`validate`) ve tercih edilen boyut bu ağaçta özyinelemeyle dolaşır.',
      map: [
        ['component', 'Parca', '`java.awt.Component`'],
        ['composite', 'Koli', '`java.awt.Container` (`JPanel`, `JFrame`…)'],
        ['leaf', 'Urun', '`JLabel`, `JTextField`, `JButton`'],
        ['client', 'Main', 'Formu kuran ve dolaşan kod'],
      ],
      note: 'AWT **güvenli** tasarımı seçer: `getComponents()` yalnızca `Container`’da; bu yüzden `say` önce `instanceof Container` diye sormak zorunda. Swing’de ise her `JComponent` bir `Container`’dır: `JButton`’a bile `add` yapılabilir. Program ekransız (headless) da çalışır; çıktılar Java 21 ile alındı.',
      roles: { Component: 'component', Container: 'composite', JPanel: 'composite', JLabel: 'leaf', JTextField: 'leaf', JButton: 'leaf' },
      file: 'FormAgaci.java',
      code: RW.awt,
      options: RW.awtOpts,
      cmd: '$ java FormAgaci',
    },
    {
      tab: 'DefaultMutableTreeNode',
      title: '`DefaultMutableTreeNode` — JDK’nın hazır ağacı',
      intro: '`javax.swing.tree` paketindeki düğüm tek başına bir Composite: çocuk düğümler tutar (`add`), yaprak mı diye sorulabilir (`isLeaf`) ve ağacın tamamı için **özyinelemeli** işlemler sunar: `getLeafCount()`, `getDepth()`, ön ve son sıralı gezinti.',
      map: [
        ['component', 'Parca', '`MutableTreeNode` (arayüz)'],
        ['composite', 'Koli', '`DefaultMutableTreeNode` (çocuklu)'],
        ['leaf', 'Urun', '`DefaultMutableTreeNode` (çocuksuz)'],
      ],
      note: 'Tek sınıf hem yaprak hem bileşik: **şeffaf** tasarım. Laptopu `new DefaultMutableTreeNode("Laptop", false)` ile çocuk kabul etmez yaptık; içine ekleme ancak **çalışma anında** reddediliyor (son seçenek). Çıktılar Java 21 ile alındı.',
      roles: { DefaultMutableTreeNode: 'composite' },
      file: 'HazirAgac.java',
      code: RW.tree,
      options: RW.treeOpts,
      cmd: '$ java HazirAgac',
    },
    {
      tab: 'DOM',
      title: 'DOM — `Node`, `Element`, `Text`',
      intro: 'Bir XML ya da HTML belgesi bir ağaçtır. `org.w3c.dom.Node` her düğümün arayüzü; `Element` başka düğümler tutar, `Text` tutmaz. `getTextContent()` aynı çağrıyla hem bir metin düğümünde hem koca bir elemanda çalışır: eleman, içindekilerin metnini **özyinelemeyle** birleştirir.',
      map: [
        ['component', 'Parca', '`org.w3c.dom.Node`'],
        ['composite', 'Koli', '`Element`, `Document`'],
        ['leaf', 'Urun', '`Text`, `Comment`'],
      ],
      note: 'DOM **şeffaf** tasarımdır: `appendChild` bütün düğümlerde var. Metin düğümüne eklemeye kalkınca `DOMException: HIERARCHY_REQUEST_ERR` (son seçenek): tezgâhtaki şeffaf tasarımla aynı bedel. Çıktılar Java 21 ile alındı.',
      roles: { Node: 'component', Element: 'composite', Document: 'composite' },
      file: 'DomAgaci.java',
      code: RW.dom,
      options: RW.domOpts,
      cmd: '$ java DomAgaci',
    },
    {
      tab: 'Karıştırmayın!',
      title: 'Composite, Decorator, Iterator, Visitor',
      intro: 'Composite ile Decorator’ın yapısı benzer: ikisi de aynı arayüzü uygulayıp o arayüzden nesne(ler) tutar ve özyinelemeyle çalışır. Fark, **kaç** nesne tuttuklarında ve **ne için** tuttuklarında.',
      extraHtml: `<table class="cmp cmp-3">
        <thead lang="en"><tr><th></th><th>Composite</th><th>Decorator</th><th>Iterator</th><th>Visitor</th></tr></thead>
        <tbody>
          <tr><td>Amaç</td><td>Parça–bütün ağacı; tek tip istemci</td><td>Sorumluluk eklemek</td><td>Ağacı gezmek</td><td>Ağaca yeni işlem eklemek</td></tr>
          <tr><td>Tutulan</td><td><b>Çok</b> çocuk (0..*)</td><td><b>Tek</b> nesne (içteki)</td><td>Gezinti konumu</td><td>—</td></tr>
          <tr><td>Sonuç</td><td>Çocukların cevaplarını <b>birleştirir</b></td><td>İçtekinin cevabına <b>ekler</b></td><td>Sıradaki parça</td><td>İşlem ayrı bir sınıfta</td></tr>
        </tbody></table>`,
      note: 'GoF: Decorator, tek bileşenli bir Composite gibi görülebilir; ama amacı nesneleri **bir araya getirmek** değil, **sorumluluk eklemek**tir. Composite’e yeni işlem eklemek bütün sınıflara dokunur; **Visitor** bu işlemleri ayrı bir sınıfa taşır.',
      roles: { Parca: 'component', Koli: 'composite', Urun: 'leaf' },
      special: CP.special,
      file: 'Karsilastirma.java',
      code: () => `// Composite: koli ÇOK parçayı tutar, cevaplarını birleştirir
int toplam = dara;
for (Parca p : icindekiler) toplam += p.agirlik();

// Decorator: katman TEK nesneyi sarar, cevabına ekler (Decorator modülü)
return icteki.ucret() + 40;

// Iterator: ağacı gezmek ayrı bir nesnenin işi olabilir
Iterator<Parca> gezgin = siparis.iterator();

// Visitor: yeni bir işlem (ör. gümrük beyanı) sınıflara dokunmadan
siparis.kabulEt(new GumrukBeyani());`,
      mark: 'for (Parca p : icindekiler) toplam += p.agirlik();',
    },
  ];

  CP.scenes.realworld = (root, ctx) =>
    kit.realWorldScene(root, ctx, {
      tabs: TABS,
      roles: CP.roles,
      roleOf: CP.roleOf,
      fmLabel: 'özyinelemeli işlem',
      footText: (i) =>
        i === 3
          ? 'Yapı benziyorsa **sayıya** ve **amaca** bakın: Composite çok çocuğu birleştirir, Decorator tek nesneyi süsler.'
          : i === 0
          ? 'Kendi örneğimizdeki rolleri JDK’da bulun. Sağdaki düğmelerle **aynı soruyu** farklı düğümlere sorun.'
          : 'Aynı çağrı yaprakta da bileşikte de çalışıyor. Son seçenek: **şeffaf** tasarımda yaprağa ekleme çalışma anında patlıyor.',
    });

  // ================================================================== 9. QUIZ
  const Q = [
    {
      type: 'mcq',
      q: 'Composite kalıbının **temel amacı** (GoF) nedir?',
      options: ['Nesneleri parça–bütün ağaçlarında birleştirmek; tekil nesnelere ve bileşimlere aynı biçimde davranmak', 'Bir nesneye, alt sınıf yazmadan, çalışma anında ek sorumluluklar eklemek ve onları katlamak', 'Bir soyutlamayı gerçekleştiriminden ayırmak; böylece ikisi birbirinden bağımsız değişebilir', 'Bir koleksiyonun elemanlarına, iç yapısını göstermeden sırayla erişmenin bir yolunu sağlamak'],
      answer: 0,
      explain: 'GoF: “Nesneleri parça–bütün hiyerarşilerini temsil eden ağaç yapılarında birleştir.” Diğerleri Decorator, Bridge ve Iterator’ın amaçlarıdır.',
    },
    {
      type: 'line',
      q: 'Bu sınıfta işi **içindekilere devreden** satıra tıklayın.',
      codeName: 'Koli.java',
      code: CP.plain(C.Koli),
      answer: 'toplam += p.agirlik();',
      explain: 'Koli her parçaya aynı soruyu sorar; parça bir koliyse soru onun içine iner. Özyineleme bu satırda.',
    },
    {
      type: 'mcq',
      q: 'Bir koli (dara 200 g) içinde 500 g’lık bir ürün ve bir kutu var; kutunun darası 100 g, içinde 300 g ve 100 g’lık iki ürün. `koli.agirlik()` kaç döner?',
      options: ['900', '1000', '1100', '1200'],
      answer: 3,
      explain: '200 + 500 + (100 + 300 + 100) = 1200. Kutu kendi darasını ve içindekileri toplar, sonucu dış koliye verir.',
    },
    {
      type: 'mcq',
      q: '`ekle` yalnızca `Koli`’de tanımlı (**güvenli** tasarım). `Parca p = new Urun("Kitap", 500); p.ekle(x);` ne olur?',
      options: ['Derleme hatası: Parca tipinde ekle yok', 'Çalışma anında UnsupportedOperationException', 'x sessizce yok sayılır', 'Kitap kendiliğinden bir koliye dönüşür'],
      answer: 0,
      explain: 'Güvenli tasarımda çocuk yönetimi yalnızca bileşikte; hata derleme anında yakalanır. Şeffaf tasarımda (`ekle` Parca’da, varsayılan: istisna) aynı kod derlenir ve çalışma anında istisna fırlatır.',
    },
    {
      type: 'mcq',
      q: '`Koli`’deki liste neden `List<Urun>` değil de `List<Parca>`?',
      options: ['Arayüz tipli listeler daha hızlı çalışır; ağırlık hesabı kısalsın diye', 'Kolinin içine ürün de koli de konabilsin; ağaç istediği kadar derinleşsin', 'Java’da liste elemanları bir arayüz tipinde olmak zorunda; sınıf olamaz', 'Ürünler değiştirilemesin, koliye girdikten sonra ağırlıkları sabit kalsın diye'],
      answer: 1,
      explain: 'Bileşik, çocuklarını bileşen tipinde tutar: böylece bir koli başka bir koliyi de içerebilir. Kalıpsız sürümde bu yüzden iki ayrı liste vardı.',
    },
    {
      type: 'line',
      q: 'Bu programda koli ile bisikletin **aynı listede** tutulduğu satıra tıklayın.',
      codeName: 'Main.java',
      code: CP.plain(C.Main),
      answer: 'List<Parca> sevkiyat = List.of(siparis, bisiklet);',
      explain: 'İstemci ürüne ve koliye aynı biçimde davranır: ikisi de bir `Parca`. Kalıpsız sürümde Kantar’ın ürün ve koli için ayrı metotları vardı.',
    },
    {
      type: 'mcq',
      q: 'Composite ile Decorator arasındaki temel fark nedir?',
      options: ['Composite çok çocuğu tutup cevaplarını birleştirir; Decorator tek nesneyi sarıp ona sorumluluk ekler', 'Decorator çok çocuklu ağaçlar kurar; Composite ise yalnızca tek bir nesneyi sarabilir', 'İkisi aynı kalıbın iki adıdır; GoF yalnızca örnekleri farklı olduğu için ayırmıştır', 'Composite kalıtımla, Decorator kompozisyonla kurulur; ikisi de tek nesneyi sarar'],
      answer: 0,
      explain: 'İkisi de özyinelemeli kompozisyon kullanır. GoF: Decorator tek bileşenli bir Composite gibi görülebilir, ama amacı nesneleri bir araya getirmek değil sorumluluk eklemektir.',
    },
    {
      type: 'mcq',
      q: 'Java’da hangisi bir **Composite** örneğidir?',
      options: ['`Collections.newSetFromMap(map)`: bir Map’i Set arayüzüyle kullanır', '`new BufferedReader(new FileReader(dosya))`: okuyucuyu tamponla sarar', '`java.awt.Container`: `Component`’ler tutar ve kendisi de bir `Component`’tir', '`Runtime.getRuntime()`: çalışma ortamının tek örneğine ulaştırır'],
      answer: 2,
      explain: '`newSetFromMap` bir Bridge, `BufferedReader` bir Decorator, `getRuntime` bir Singleton örneği. `Container` ise bileşen ağacının bileşiğidir.',
    },
  ];

  CP.scenes.quiz = (root, ctx) =>
    kit.quizScene(root, ctx, {
      questions: Q,
      roleOf: CP.roleOf,
      special: CP.special,
      patternName: 'Composite',
      match: {
        items: ['Parca', 'Urun', 'Koli', 'Palet', 'Main', 'Container', 'JButton'].map((id) => ({ id, label: id })),
        buckets: ['component', 'leaf', 'composite', 'client'].map((k) => ({ id: k, title: CP.roles[k].en, sub: CP.roles[k].tr, color: CP.roles[k].color })),
        answer: CP.classRoles,
        hint: 'Yedi sınıfı dört role yerleştirin: ikisi JDK’dan. Takıldığınızda **Cevapları göster** düğmesi var.',
      },
    });

  // ================================================================== 10. ÖZET
  CP.scenes.summary = function (root, ctx) {
    const at = DP.catalog.findIndex((p) => p.id === 'composite');
    const next = DP.catalog.slice(at + 1).find((p) => p.ready && DP.patterns[p.id]);
    const el = h('div', { class: 'scene scene-summary' });
    el.innerHTML = `
      <div class="sum-head">
        <div>
          <div class="chips"><span class="chip chip-cat is-struct">Yapısal · Structural</span><span class="chip">Parça–bütün hiyerarşisi</span></div>
          <h1>Composite — Özet</h1>
        </div>
        <div class="sum-actions no-print">
          <button class="btn btn-ghost" type="button" data-print>🖨 Yazdır / PDF</button>
          <a class="btn btn-ghost" href="#/bridge/ozet">← Bridge özeti</a>
          <a class="btn btn-ghost" href="#/">Tüm kalıplar</a>
          ${next ? `<a class="btn btn-primary" href="#/${next.id}">Sıradaki kalıp: ${DP.esc(next.name)} →</a>` : ''}
        </div>
      </div>
      <div class="sum-grid">
        <article class="card sum-intent">
          <h3>Amaç</h3>
          <p>Nesneleri <b>parça–bütün</b> hiyerarşilerini temsil eden <b>ağaç yapılarında</b> birleştir; istemci tekil nesnelere ve bileşimlere <b>aynı biçimde</b> davransın.</p>
          <div class="sum-formula"><code>composite.operation()</code> → <code>for (c : <span class="tk-cmp">children</span>) c.operation()</code> <span>(her çocuğa aynı soru, cevaplar birleşir)</span></div>
        </article>
        <article class="card sum-uml"><h3>Yapı (GoF · şeffaf)</h3><div class="sum-diag"></div></article>
        <article class="card">
          <h3>İç içe döngüler ↔ Composite</h3>
          <table class="cmp sg-sum-cmp">
            <thead lang="en"><tr><th></th><th>Kantar (kalıpsız)</th><th>Composite</th></tr></thead>
            <tbody>
              <tr><td>Derinlik</td><td class="bad">Döngü sayısı kadar</td><td class="ok">Sınırsız (özyineleme)</td></tr>
              <tr><td>Ürün mü, koli mi?</td><td class="bad">İstemci sorar</td><td class="ok">Kimse sormaz</td></tr>
              <tr><td>Yeni kap türü</td><td class="bad">Her işlem değişir</td><td class="ok">Bir yeni sınıf</td></tr>
              <tr><td>Yeni işlem</td><td>Bir döngü piramidi daha</td><td>Her sınıfa bir metot</td></tr>
            </tbody>
          </table>
        </article>
        <article class="card">
          <h3>Katılımcılar</h3>
          <ul class="sum-roles">
            <li>${ui.roleChip('component')}<span>ortak arayüz</span></li>
            <li>${ui.roleChip('leaf')}<span>kendisi cevaplar</span></li>
            <li>${ui.roleChip('composite')}<span>çocuklara devreder, birleştirir</span></li>
            <li>${ui.roleChip('client')}<span>türü sormaz</span></li>
          </ul>
        </article>
        <article class="card sum-pros">
          <h3>Artıları</h3>
          <ul>
            <li>İstemci <b>tek tip</b>: ürün ile koliye aynı davranır</li>
            <li>Ağaç <b>istediği kadar</b> derin: özyineleme</li>
            <li>Yeni yaprak ya da bileşik türü kolay (<b>OCP</b>)</li>
            <li>İstemci kodu sade: tür kontrolü yok</li>
          </ul>
        </article>
        <article class="card sum-cons">
          <h3>Eksileri</h3>
          <ul>
            <li>Tasarım <b>fazla genel</b> olabilir: “koliye palet konamaz” tiplerle söylenemez</li>
            <li><b>Şeffaflık ↔ güvenlik</b> ikilemi</li>
            <li>Yeni bir <b>işlem</b> bütün sınıflara dokunur (→ Visitor)</li>
          </ul>
        </article>
        <article class="card">
          <h3>İlişkili kalıplar</h3>
          <ul>
            <li><b>Decorator:</b> tek çocuklu bir bileşik gibi; ama sorumluluk ekler.</li>
            <li><b>Iterator:</b> ağacı gezmek için.</li>
            <li><b>Visitor:</b> ağaca sınıflara dokunmadan yeni işlem eklemek için.</li>
            <li><b>Chain of Responsibility:</b> çocuktan üst bileşiğe giden bağlantı bir zincir kurar.</li>
          </ul>
        </article>
        <article class="card sum-tip">
          <h3>Sınav ipuçları</h3>
          <pre class="mini-code">interface Parca { int agirlik(); }                  // Component
class Urun implements Parca {                       // Leaf
    public int agirlik() { return gram; }
}
class Koli implements Parca {                       // Composite
    List&lt;Parca&gt; icindekiler;
    public int agirlik() {
        int t = dara;
        for (Parca p : icindekiler) t += p.agirlik();
        return t;
    }
}</pre>
          <p class="exam"><b>Parça–bütün ağacı + tek tip istemci</b> → Composite · <b>Component, Leaf, Composite</b> · bileşik bileşeni hem <u>uygular</u> hem <u>içerir</u></p>
        </article>
        <article class="card sum-files">
          <h3>Java kodları</h3>
          <p>Çalıştırılabilir örnekler proje klasöründe:</p>
          <pre class="mini-code">java/composite/sorun     → iç içe döngüler; saat kutusu sayılmıyor
java/composite/cozum     → Parca, Urun, Koli: özyineleme
java/composite/akis/...  → Canlı Akış: agirlik · listele
java/composite/tezgah    → yeni dal: hediye kutusu, poşet
java/composite/seffaf    → şeffaf tasarım: ürüne ekleme istisnası
java/composite/genislet  → Palet: yeni bileşik</pre>
          <p>Derleyip çalıştırmak için <code>java/README.md</code> dosyasına bakın.</p>
        </article>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-print]').addEventListener('click', () => window.print());
    const diag = new DP.ClassDiagram(el.querySelector('.sum-diag'), CP.gofDiagram({ seffaf: true }), { roles: CP.roles, roleTags: false, mode: 'generic' });
    diag.svg.classList.add('is-compact');
    return { destroy() {} };
  };

  // ================================================================== kayıt
  DP.register({
    id: 'composite',
    name: 'Composite',
    tr: 'Bileşik',
    category: 'structural',
    roleOf: CP.roleOf,
    initialState: () => ({
      view: 'stage',
      showCode: true,
      preset: 'agirlik',
      tz: { tree: CP.clone(CP.TEZGAH_DAL), mode: 'guvenli', target: 'siparis' },
      paletUnlocked: false,
      ext: {},
      quiz: { results: {}, match: false },
    }),
    scenes: [
      { id: 'giris', title: 'Giriş', mount: CP.scenes.intro },
      { id: 'sorun', title: 'Sorun', mount: CP.scenes.problem },
      { id: 'cozum', title: 'Çözüm', mount: CP.scenes.solution },
      { id: 'akis', title: 'Canlı Akış', mount: CP.scenes.flow, star: true },
      { id: 'tezgah', title: 'Paketleme Tezgâhı', mount: CP.scenes.counter, star: true },
      { id: 'yapi', title: 'Yapı (UML)', mount: CP.scenes.structure },
      { id: 'genislet', title: 'Genişlet', mount: CP.scenes.extend },
      { id: 'gercek', title: 'Gerçek Dünya', mount: CP.scenes.realworld },
      { id: 'quiz', title: 'Quiz', mount: CP.scenes.quiz },
      { id: 'ozet', title: 'Özet', mount: CP.scenes.summary },
    ],
  });
})();
