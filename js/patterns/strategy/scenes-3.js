/*
 * Strategy — sahneler (3/3): Yapı, Genişlet, Gerçek Dünya, Quiz, Özet ve kalıp kaydı
 */
(function () {
  'use strict';
  const SG = DP.stg;
  const { h } = DP;
  const kit = DP.kit;
  const ui = SG.ui;
  const md = SG.md;
  const EX = SG.ext;
  /** Satır sonu yorumlarını atar (quiz'de cevabı ele vermesin) */
  const yorumsuz = (s) => s.replace(/ +\/\/ [^\n]*$/gm, '');
  const COZ = SG.filesFor(SG.COZUM);

  // ================================================================== 6. YAPI
  const ROLE_TEXT = {
    strategy: 'Algoritma ailesinin ortak arayüzü. Tek yöntemi var: <code>sec(konum, kalan)</code>. Bağlam yalnızca bu türü bilir.',
    concreteStrategy: 'Bir algoritmanın kendisi: randevu sırası, en yakın durak, soğuk zincir önce. Bağlamın verisini parametreyle alır ve yalnızca <b>seçer</b>.',
    context: 'Stratejiyi tutar ve işi ona <b>devreder</b>: <code>strateji.sec(…)</code>. Kendi verisinin (liste, konum, km) sahibidir; stratejiye salt okunur görünüm verir.',
    client: 'Hangi stratejinin kullanılacağına karar verir; nesneyi yaratıp bağlama verir, gerekirse çalışırken değiştirir.',
  };

  function classInfo(id) {
    switch (id) {
      case 'RotaStratejisi':
        return { role: 'strategy', file: 'RotaStratejisi.java', code: COZ.RotaStratejisi, mark: 'Durak sec(Konum konum, List<Durak> kalan);', points: ['Tek yöntem: `sec(konum, kalan)`.', 'Liste **salt okunur** gelir: strateji yalnızca seçer.', 'Tek yöntemli olduğu için lambda ile de yazılabilir.'] };
      case 'RandevuRota':
      case 'EnYakinRota':
      case 'SogukOnceRota':
        return {
          role: 'concreteStrategy',
          file: id + '.java',
          code: COZ[id],
          mark: { RandevuRota: 'return kalan.get(0);', EnYakinRota: ['for (Durak d : kalan) {', 'return secilen;'], SogukOnceRota: ['List<Durak> soguklar = kalan.stream().filter(Durak::soguk).toList();', 'return enYakin.sec(konum, soguklar.isEmpty() ? kalan : soguklar);'] }[id],
          points: {
            RandevuRota: ['Listenin başı: randevu sırası.', 'Varsayımı (liste sıralı) kurye korur.', 'Tek satırlık bir algoritma da bir stratejidir.'],
            EnYakinRota: ['Bulunulan yere en yakın durak.', 'Eşitlikte listede önce olan: randevusu önce olan.', 'Başka stratejiler de onu kullanabilir.'],
            SogukOnceRota: ['Soğuk zincirlileri **süzer**, listeyi değiştirmez.', 'Seçimi bir [[EnYakinRota]]’ya sorar: strateji içinde strateji.', 'Sürüm 2.0’da hatayı yaratan dal buydu.'],
          }[id],
        };
      case 'Kurye':
        return { role: 'context', file: 'Kurye.java', code: COZ.Kurye, mark: ['this.okunur = Collections.unmodifiableList(kalan);', 'Durak d = strateji.sec(konum, okunur);'], points: ['Stratejiyi **arayüz** türüyle tutar.', 'Seçimi stratejiye devreder; listeyi, km’yi ve konumu kendisi günceller.', 'Somut stratejilerin hiçbirini adıyla tanımaz.'] };
      case 'Main':
        return { role: 'client', file: 'Main.java', code: COZ.Main, mark: ['Kurye kurye = new Kurye(Durak.gunun(), new SogukOnceRota());', 'kurye.setStrateji(new RandevuRota());'], points: ['Stratejiyi **seçer** ve yaratır.', 'Çalışırken değiştirir: `setStrateji(…)`.', 'Hangi stratejinin ne zaman uygun olduğunu o bilir.'] };
      default:
        return null;
    }
  }

  SG.scenes.structure = function (root, ctx) {
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
    const legend = kit.umlLegend({ aggregation: 'tutar', fmLabel: 'stratejinin yöntemi (sec)' });
    left.body.append(diagHost, legend);
    const diagram = new DP.ClassDiagram(diagHost, SG.gofDiagram({ notes: true }), {
      roles: SG.roles,
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
      infoCode.classList.remove('stg-info-col');
      if (!info) return;
      const r = SG.roles[info.role];
      infoTop.innerHTML = `
        <div class="info-role rc rc-${r.color}"><span class="info-dot"></span><b>${r.en}</b> · ${r.tr}</div>
        <div class="info-name rc rc-${r.color}">${DP.esc(id)}</div>
        <p class="info-desc">${ROLE_TEXT[info.role]}</p>
        <ul class="info-points">${info.points.map((p) => `<li>${md(p)}</li>`).join('')}</ul>`;
      const cv = new DP.CodeView(infoCode, { files: [{ name: info.file, code: info.code }], roleOf: SG.roleOf, special: SG.special, compact: true });
      cv.mark(info.file, info.mark, 'focus');
      DP.flash(infoTop, 'is-pop');
    }

    function showOverview() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">Kartuşlu kurye</div>
        <div class="role-list">
          ${['strategy', 'concreteStrategy', 'context', 'client']
            .map((k) => `<div class="role-row rc rc-${SG.roles[k].color}"><span class="info-dot"></span><div><b>${SG.roles[k].en}</b> · ${SG.roles[k].tr}<div class="role-desc">${ROLE_TEXT[k]}</div></div></div>`)
            .join('')}
        </div>`;
    }

    function showVeri() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">Bağlam ↔ strateji: veri nasıl gider?</div>
        <p class="info-desc">${md('Stratejinin işi için veri gerekir. GoF iki yol sayar: veriyi **parametreyle** vermek ya da stratejiye **bağlamın kendisini** vermek.')}</p>
        <table class="cmp stg-cmp">
          <thead><tr><th>Yol</th><th>Kazanç</th><th>Bedel</th></tr></thead>
          <tbody>
            <tr><td><code>sec(konum, okunur)</code></td><td class="ok">${md('Strateji yalnızca gerekeni görür; kurye stratejiyi tanımaz')}</td><td>${md('Yeni bir veri gerekirse arayüz değişir')}</td></tr>
            <tr><td><code>sec(Kurye k)</code></td><td>${md('Strateji istediğini kuryeden sorar')}</td><td class="bad">${md('Strateji kuryeye bağlanır; liste korunmazsa sürüm 2.0 geri gelir')}</td></tr>
          </tbody>
        </table>
        <p class="info-desc">${md('Biz ilk yolu seçtik ve listeyi **salt okunur görünümle** verdik: kuryenin verisinin sahibi yalnızca kurye.')}</p>`;
      DP.flash(infoTop, 'is-pop');
    }

    const TUZAK = {
      paylasim: { label: 'Paylaşım', not: 'Stratejiler çoğu zaman durumsuzdur; “bir tane yeter” diye iki kuryeye aynı nesne verildi. Ama [[PlanliRota]] planı **kendi içinde** tutuyor: ikinci kurye, birincinin planındaki durağı aldı ve kurye listesinde olmayan bir durağa gitmeyi reddetti.' },
      duzeltme: { label: 'Düzeltme', not: 'Durum tutan bir strateji **paylaşılmaz**: her kuryeye kendi `new PlanliRota()` nesnesi. Ya da strateji durumsuz yazılır ve gereken her şeyi parametreyle alır (öteki stratejilerimiz gibi).' },
    };
    function showTuzak() {
      const tur = S.tuzak || 'paylasim';
      const F = SG.tuzakFiles(tur);
      infoTop.innerHTML = `
        <div class="info-name">Tuzak: durum tutan strateji</div>
        <p class="info-desc">${md('Planı bir kez hesaplayıp sırayla veren bir strateji iki kuryeye birden verilirse ne olur?')}</p>
        <div class="stg-tuzak-seg"></div>
        <p class="info-desc stg-tuzak-not">${md(TUZAK[tur].not)}</p>`;
      const seg = kit.seg(
        SG.TUZAK_SIRA.map((k) => ({ v: k, label: TUZAK[k].label })),
        tur,
        (k) => {
          S.tuzak = k;
          showTuzak();
        },
        { label: 'Tuzak', cls: 'stg-seg' }
      );
      infoTop.querySelector('.stg-tuzak-seg').appendChild(seg.el);
      infoCode.innerHTML = '';
      infoCode.classList.add('stg-info-col');
      const cv = new DP.CodeView(
        infoCode,
        {
          files: [
            { name: 'Main.java', code: F.Main, badge: tur === 'paylasim' ? 'paylaşım' : null },
            { name: 'PlanliRota.java', code: SG.plain(F.PlanliRota) },
          ],
          roleOf: SG.roleOf,
          special: SG.special,
          compact: true,
        }
      );
      if (tur === 'paylasim') {
        cv.mark('PlanliRota.java', 'private final List<Durak> plan = new ArrayList<>();', 'bad', { show: false, scroll: false });
        cv.mark('Main.java', ['RotaStratejisi planli = new PlanliRota();', 'Kurye kurye2 = new Kurye(gun.subList(3, 6), planli);'], 'bad');
      } else cv.mark('Main.java', ['Kurye kurye1 = new Kurye(gun.subList(0, 3), new PlanliRota());', 'Kurye kurye2 = new Kurye(gun.subList(3, 6), new PlanliRota());'], 'ok');
      const con = h('div', { class: 'console stg-console is-yapi' });
      infoCode.appendChild(con);
      const cikti = SG.tuzakCikti(tur).map((t) => ({ t, k: t.startsWith('Exception') ? 'hata' : t.startsWith('\tat') ? 'iz' : t.startsWith('—') ? 'sec' : 'teslim', bad: t.startsWith('Exception') }));
      SG.renderConsole(con, '$ java Main', cikti, { title: tur === 'paylasim' ? 'Konsol · istisna' : 'Konsol' });
      DP.flash(infoTop, 'is-pop');
    }

    function showLambda() {
      infoTop.innerHTML = `
        <div class="info-name">Lambda ile strateji</div>
        <p class="info-desc">${md('[[RotaStratejisi]]’nin tek bir soyut yöntemi var: Java’da bu bir **işlevsel arayüzdür**. Kısa bir strateji için sınıf yazmak gerekmez; lambda yeter.')}</p>
        <p class="info-desc">${md('Gerçek Dünya sahnesindeki `Comparator` örnekleri de böyle: `comparing(Koli::alici)` bir strateji nesnesi üretir.')}</p>`;
      infoCode.innerHTML = '';
      const cv = new DP.CodeView(infoCode, {
        files: [
          {
            name: 'Main.java · parça',
            code: `// sınıf yerine lambda: son randevu önce
kurye.setStrateji((konum, kalan) -> kalan.get(kalan.size() - 1));

// yöntem başvurusu: imzası sec ile aynı olan bir yöntem
static Durak enAgir(Konum konum, List<Durak> kalan) { … }
kurye.setStrateji(Main::enAgir);`,
          },
        ],
        roleOf: SG.roleOf,
        special: SG.special,
        compact: true,
      });
      cv.mark('Main.java · parça', 'kurye.setStrateji((konum, kalan) -> kalan.get(kalan.size() - 1));', 'focus');
      DP.flash(infoTop, 'is-pop');
    }

    function showBedel() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">Bedeli ve akrabaları</div>
        <p class="info-desc">${md('Koşul dalları yok oldu ama karar ortadan kalkmadı: hangi stratejinin ne zaman kullanılacağını artık **istemci** biliyor.')}</p>
        <table class="cmp stg-cmp">
          <thead><tr><th>Konu</th><th>Ne yapılır?</th></tr></thead>
          <tbody>
            <tr><td>İstemci stratejileri tanımalı</td><td>${md('Seçimi bir yerde toplamak (ayar, fabrika); bağlamın bir **varsayılan** stratejisi olabilir')}</td></tr>
            <tr><td>Nesne sayısı artar</td><td>${md('Durumsuz stratejiler paylaşılabilir (**Flyweight**); kısa olanlar lambda olur')}</td></tr>
            <tr><td>Arayüz herkese aynı veriyi verir</td><td>${md('Bazı stratejiler parametrelerin hepsini kullanmaz; arayüzü dar tutmak')}</td></tr>
          </tbody>
        </table>`;
      DP.flash(infoTop, 'is-pop');
    }

    const STEPS = [
      { t: 'Genel bakış', x: 'Dört rol: algoritma ailesinin arayüzü **strateji** ([[RotaStratejisi]]), onu uygulayan **somut stratejiler**, işi stratejiye devreden **bağlam** ([[Kurye]]) ve stratejiyi seçen **istemci** ([[Main]]).', info: null },
      { t: 'Strategy — `RotaStratejisi`', x: '[[RotaStratejisi]] tek yöntemli bir arayüz. Bağlam yalnızca bu türü tanıyor; hangi somut stratejinin takılı olduğunu bilmiyor.', info: 'RotaStratejisi', focus: { classes: ['RotaStratejisi', 'Kurye'], edges: ['strateji'], members: [['RotaStratejisi', 'sec']] } },
      { t: 'ConcreteStrategy — `SogukOnceRota`', x: 'Her algoritma kendi sınıfında. [[SogukOnceRota]] soğuk zincirlileri süzüyor ve seçimi bir [[EnYakinRota]]’ya soruyor. Ötekilere diyagramdan tıklayabilirsiniz.', info: 'SogukOnceRota', focus: { classes: ['RandevuRota', 'EnYakinRota', 'SogukOnceRota', 'RotaStratejisi'], edges: ['r-RandevuRota', 'r-EnYakinRota', 'r-SogukOnceRota'], members: [['SogukOnceRota', 'sec']] } },
      { t: 'Context — `Kurye`', x: '[[Kurye]] stratejiyi bir alanda tutuyor (◇ toplama) ve seçimi ona devrediyor. Verinin sahibi kurye: listeyi stratejiye **salt okunur** veriyor, güncellemeyi kendisi yapıyor.', info: 'Kurye', focus: { classes: ['Kurye', 'RotaStratejisi'], edges: ['strateji'], members: [['Kurye', 'strateji'], ['Kurye', 'teslimEt']] } },
      { t: 'Client — `Main`', x: '[[Main]] stratejiyi seçip yaratıyor ve kuryeye veriyor; öğleden sonra `setStrateji(…)` ile değiştiriyor. Hangi stratejinin ne zaman uygun olduğunu bilen o.', info: 'Main', focus: { classes: ['Main', 'Kurye', 'RandevuRota'], edges: ['c-kurye', 'c-somut'] } },
      { t: 'Bağlam ↔ strateji: veri', x: 'Strateji işini yapmak için kuryenin verisine ihtiyaç duyuyor. Veriyi parametreyle vermek bağı gevşek tutar; bağlamın kendisini vermek esnektir ama stratejiyi bağlama bağlar.', veri: true, focus: { classes: ['Kurye', 'RotaStratejisi'], members: [['Kurye', 'kalan'], ['RotaStratejisi', 'sec']] } },
      { t: 'Tuzak: durum tutan strateji', x: 'Durumsuz bir strateji nesnesi paylaşılabilir. Ama strateji durum tutuyorsa (bir plan, bir sayaç) iki bağlam birbirinin işini bozar: gerçek bir `IllegalStateException`.', tuzak: true, focus: { classes: ['RotaStratejisi', 'Kurye'], edges: ['strateji'] } },
      { t: 'Lambda ile strateji', x: 'Tek yöntemli bir strateji arayüzü işlevsel arayüzdür: kısa stratejiler sınıf yerine lambda ya da yöntem başvurusu olarak yazılabilir. JDK’daki `Comparator` en bilinen örnek.', lambda: true, focus: { classes: ['RotaStratejisi'], members: [['RotaStratejisi', 'sec']] } },
      { t: 'Bedeli ve akrabaları', x: 'Koşul dalları kalktı, karar istemciye geçti. Nesne sayısı arttı; durumsuz stratejiler paylaşılabilir. Aynı yapıyı State de kullanır; fark, nesneyi kimin değiştirdiğinde.', bedel: true, focus: { classes: ['Main'] } },
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
        infoCode.classList.remove('stg-info-col');
        if (s.tuzak) showTuzak();
        else if (s.veri) showVeri();
        else if (s.lambda) showLambda();
        else if (s.bedel) showBedel();
        else if (s.info) showInfo(s.info);
        else showOverview();
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };

  // ================================================================== 7. GENİŞLET: yeni strateji (AgirOnceRota)
  SG.scenes.extend = function (root, ctx) {
    const S = ctx.state;
    S.ext = S.ext || {};
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-50' });
    const left = kit.panel('Görev: <code class="stg-code-t">AgirOnceRota</code>', { cls: 'panel-code panel-ex' });
    const right = kit.panel('Kurye nesnesi <span class="panel-sub">· öğleden sonra başlarken</span>', { cls: 'panel-side stg-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    // ---- sol (adım 0): alıştırma
    const exBox = h('div', { class: 'ex-box' });
    const task = h('div', {
      class: 'task-card',
      html: md('📩 **Depo şefi:** “Bugün öğleden sonra randevu yok. Kamyonet Yeşilyurt yokuşunda zorlanıyor: soğuk zincirlilerden sonra **önce en ağır** kolileri bırak.”\nKural: [[Kurye]] ve öteki stratejiler değişmeyecek.'),
    });
    const ex = kit.blankExercise({
      files: [
        { name: 'AgirOnceRota.java', code: EX.exercise, badge: 'YENİ' },
        { name: 'Main.java · ek', code: EX.exerciseMain },
      ],
      answers: EX.answers,
      hints: {
        1: 'Bütün rota stratejileri hangi arayüzü uygular?',
        2: 'Kuryenin stratejiye sorduğu yöntemin adı ne?',
        3: 'Bir durağın ağırlığını hangi bileşen verir?',
        4: 'Kuryeye hangi yeni stratejiyi takıyoruz?',
      },
      choices: ['RotaStratejisi', 'Kurye', 'EnYakinRota', 'sec', 'teslimEt', 'kg', 'mesafe', 'AgirOnceRota', 'setStrateji'],
      roleOf: SG.roleOf,
      special: SG.special,
      state: S.ext,
      doneText: '<b class="ok">✔ Derleme başarılı!</b> Yeni strateji rafa eklendi.',
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
    const runBox = h('div', { class: 'stg-runbox', hidden: true });
    const runCode = h('div', { class: 'stg-cv' });
    const runConsole = h('div', { class: 'console stg-console' });
    runBox.append(runCode, runConsole);
    left.body.append(exBox, runBox);
    const runCv = new DP.CodeView(runCode, { roleOf: SG.roleOf, special: SG.special });

    // ---- sağ: sahne + etki
    const viewHost = h('div', { class: 'stg-view' });
    const impact = h('div', { class: 'stg-extra' });
    right.body.append(viewHost, impact);
    const stage = new SG.HaritaSahne(viewHost, { nesne: true });

    const prog = EX.prog;
    const r = SG.run(prog);
    const F = SG.filesFor(prog);
    const oncesi = r.olaylar.filter((x) => x.i === 2).pop();
    const gecis = r.olaylar.find((x) => x.e === 'sec' && x.i === 3);
    const ilkAgir = r.olaylar.find((x) => x.e === 'teslim' && x.algo === 'AGIR');
    const bas = SG.stateFrom(SG.COZUM, oncesi.s, { anNotu: 'öğleden sonra başlarken', banner: { text: 'Soğuk zincirliler teslim edildi · sırada en ağır koli: **Mert, 25 kg**' } });
    const sonra = (banner, x) => SG.stateFrom(prog, gecis.s, Object.assign({ secilen: ilkAgir.no, serit: r.son.bacaklar.map((b) => ({ no: b.no, yanlis: b.yanlis })), seritKm: r.son.km, anNotu: 'öğleden sonra başlarken', banner }, x || {}));
    const STEPS = [
      {
        t: 'Görev: `AgirOnceRota`',
        x: 'Boşluklara tıklayıp doğru parçaları seçin. İpucu: yeni algoritma da öbürleri gibi [[RotaStratejisi]]’ni uygular ve yalnızca `sec` yöntemini yazar. Kurye’ye dokunmuyoruz; Main yeni stratejiyi takıyor.',
        st: bas,
      },
      {
        t: 'Derlendi: öğleden sonra ağır önce',
        x: 'Main öğleden sonra `new AgirOnceRota()` taktı. Kurye aynı satırla, `strateji.sec(konum, okunur)` ile sordu; strateji en ağırları seçti: **25, 9, 4, 3 kg**. Soğuk zincirliler sabah zaten dağıtılmıştı.',
        st: sonra({ text: 'Ağır önce: Mert 25 kg → Selin 9 kg → Can 4 kg → Ali 3 kg · 38 km', tone: 'ok' }, { yeni: 'AGIR' }),
      },
      {
        t: 'Değişen sınıf yok',
        x: 'Yeni bir sınıf ([[AgirOnceRota]]) ve Main’de bir satır. [[Kurye]], [[RotaStratejisi]] ve öteki üç strateji **aynen** kaldı; onları yeniden sınamaya gerek yok.',
        st: sonra({ text: 'Yeni algoritma: 1 sınıf · değişen sınıf: 0', tone: 'ok' }),
      },
      {
        t: 'if/else ve kalıtımla karşılaştırın',
        x: 'Sürüm 2.0’da aynı istek Kurye’ye yeni bir dal eklemek demekti: öteki dallarla aynı listeyi paylaşan bir dal daha. Kalıtımda yeni bir alt sınıf gerekir; ama kurye yine gün ortasında ona geçemez. **Ağır önce** artık Rota Tezgâhı’nda da açık.',
        st: sonra({ text: 'if/else: Kurye değişir · kalıtım: geçiş yok · Strategy: yeni sınıf', tone: 'ok' }),
      },
    ];

    function renderLeft(i) {
      exBox.hidden = i >= 1;
      runBox.hidden = i < 1;
      left.head.querySelector('.panel-title').innerHTML = i >= 1 ? 'Yeni strateji: <code class="stg-code-t ver">AgirOnceRota</code>' : 'Görev: <code class="stg-code-t">AgirOnceRota</code>';
      if (i < 1) return;
      // önce konsol (yüksekliği değişir), sonra koddaki işaret
      SG.renderConsole(runConsole, SG.cmd(true), r.lines.map((l) => SG.consoleLine(l, { hl: (x) => x.t === SG.isaret('AGIR') })));
      runCv.setFiles(
        [
          { name: 'AgirOnceRota.java', code: F.AgirOnceRota, badge: 'YENİ' },
          { name: 'Main.java', code: EX.Main, badge: 'DEĞİŞTİ' },
          { name: 'Kurye.java', code: F.Kurye },
        ],
        { active: i === 2 ? 'Main.java' : 'AgirOnceRota.java', keepActive: false }
      );
      if (i === 1) runCv.mark('AgirOnceRota.java', ['public Durak sec(Konum konum, List<Durak> kalan) {', 'return secilen;'], 'focus');
      else runCv.mark('Main.java', 'kurye.setStrateji(new AgirOnceRota());', 'focus');
    }

    function renderImpact(i, animate) {
      if (i === 0) {
        impact.innerHTML = `<div class="impact-title">İpucu</div><p>${md('[[EnYakinRota]]’ya bakın: `implements RotaStratejisi`, `@Override public Durak sec(Konum konum, List<Durak> kalan)`. Bu kez karşılaştırma uzaklıkla değil, **ağırlıkla**: `d.kg() > secilen.kg()`.')}</p>`;
      } else if (i === 1) {
        impact.innerHTML = `
          <div class="impact-title ok">✔ Derleme başarılı · yeni strateji</div>
          <ul class="filelist"><li><span class="cv-dot rc rc-${SG.roleOf('AgirOnceRota')}"></span>AgirOnceRota.java <span class="cv-badge is-new">YENİ</span></li><li><span class="cv-dot rc rc-${SG.roleOf('Main')}"></span>Main.java <span class="cv-badge">DEĞİŞTİ</span></li></ul>`;
      } else if (i === 2) {
        impact.innerHTML = `
          <div class="metrics">
            <div class="metric is-good"><div class="m-val">1</div><div class="m-label">yeni sınıf</div></div>
            <div class="metric"><div class="m-val">1</div><div class="m-label">satır: Main</div></div>
            <div class="metric is-good"><div class="m-val">0</div><div class="m-label">değişen sınıf</div></div>
          </div>`;
      } else {
        impact.innerHTML = `
          <table class="cmp stg-cmp">
            <thead lang="en"><tr><th>Yeni algoritma</th><th>if/else (2.0)</th><th>Kalıtım</th><th>Strategy</th></tr></thead>
            <tbody>
              <tr><td>Kurye</td><td class="bad">yeni dal</td><td>yeni alt sınıf</td><td class="ok">değişmez</td></tr>
              <tr><td>Öteki algoritmalar</td><td class="bad">aynı liste</td><td class="ok">ayrı</td><td class="ok">ayrı, salt okunur</td></tr>
              <tr><td>Gün ortasında geçiş</td><td>String ile</td><td class="bad">yok</td><td class="ok">setStrateji</td></tr>
            </tbody>
          </table>
          <div class="stg-go"><button class="btn btn-primary btn-sm" type="button" data-go>🗺 Rota Tezgâhı’nda dene →</button></div>`;
        impact.querySelector('[data-go]').addEventListener('click', () => ctx.goScene('tezgah'));
      }
      if (animate) DP.flash(impact, 'is-pop');
    }

    const stOf = (i) => Object.assign({}, STEPS[i].st, { agir: i >= 1 });
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
          S.agirUnlocked = true;
        } else ex.ensureSelection();
        renderLeft(i);
        stage.render(stOf(i), prev >= 0 ? stOf(prev) : null, { animate: false });
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
  const RW = SG.rw;
  const TABS = [
    {
      tab: 'Comparator',
      title: '`java.util.Comparator` — sıralamanın stratejisi',
      intro: '`List.sort` hep aynı sıralama algoritmasını çalıştırır; **neye göre** sıralanacağını bir `Comparator` nesnesi söyler. Lambda ve yöntem başvuruları en kısa strateji yazımıdır.',
      map: [
        ['context', 'Kurye', '`List.sort(…)`'],
        ['strategy', 'RotaStratejisi', '`Comparator<Koli>`'],
        ['concreteStrategy', 'EnYakinRota', '`comparing(Koli::alici)`, Türkçe `Collator`'],
        ['client', 'Main', 'sıralamayı isteyen kod'],
      ],
      note: '“Ada göre” Çağla’yı Zeynep’ten sonraya koyuyor: `String` karşılaştırması Unicode sırasıdır, Ç ile Ö, Z’den sonra gelir. Türkçe `Collator` stratejisi takılınca sıra düzeliyor. Çıktılar Java 21 ile alındı.',
      roles: { Comparator: 'strategy', Collator: 'concreteStrategy' },
      file: 'Siralama.java',
      code: RW.siralama,
      options: RW.siralamaOpts,
      mark: 'Collator tr = Collator.getInstance(Locale.forLanguageTag("tr-TR"));',
      cmd: '$ java Siralama',
    },
    {
      tab: 'Ret politikası',
      title: '`ThreadPoolExecutor` — rampa dolunca ne olacak?',
      intro: 'Bir forklift (iş parçacığı) ve bir palet bekleme yeri olan yükleme rampası. Üçüncü palet geldiğinde rampa dolu: ne yapılacağına **ret politikası** karar verir. Havuzun kodu aynı; takılan politika nesnesi değişir.',
      map: [
        ['context', 'Kurye', '`ThreadPoolExecutor`'],
        ['strategy', 'RotaStratejisi', '`RejectedExecutionHandler`'],
        ['concreteStrategy', 'SogukOnceRota', '`AbortPolicy`, `CallerRunsPolicy` …'],
        ['client', 'Main', '`setRejectedExecutionHandler(…)`'],
      ],
      note: '`CallerRunsPolicy`’de üçüncü paleti `main` iş parçacığı kendisi yükledi; `DiscardOldestPolicy` bekleyen ikinci paleti attı. Her seçenek beş kez çalıştırıldı ve çıktı hep aynıydı (Java 21).',
      roles: { ThreadPoolExecutor: 'context', RejectedExecutionHandler: 'strategy', AbortPolicy: 'concreteStrategy', CallerRunsPolicy: 'concreteStrategy', DiscardPolicy: 'concreteStrategy', DiscardOldestPolicy: 'concreteStrategy' },
      file: 'Rampa.java',
      code: RW.rampa,
      options: RW.rampaOpts,
      mark: 'rampa.execute(() -> yukle(3, null));',
      cmd: '$ java Rampa',
    },
    {
      tab: 'LayoutManager',
      title: 'Swing’de yerleşim yöneticisi: GoF’un kendi örneği',
      intro: 'GoF, Strategy’yi bir metni satırlara bölme algoritmalarıyla anlatır. Java’da aynı fikir: bir `JPanel` (bağlam) içindekileri kendisi yerleştirmez, işi bir `LayoutManager` stratejisine bırakır.',
      map: [
        ['context', 'Kurye', '`JPanel` (Container)'],
        ['strategy', 'RotaStratejisi', '`LayoutManager`'],
        ['concreteStrategy', 'RandevuRota', '`FlowLayout`, `GridLayout`'],
        ['client', 'Main', '`raf.setLayout(…)`'],
      ],
      note: 'Aynı dört koli, aynı raf (220 × 120 piksel): yalnızca yerleşim stratejisi değişti. Program pencere açmaz; çıktılar Java 21 ile alındı.',
      roles: { JPanel: 'context', LayoutManager: 'strategy', FlowLayout: 'concreteStrategy', GridLayout: 'concreteStrategy' },
      file: 'Raf.java',
      code: RW.raf,
      options: RW.rafOpts,
      mark: 'raf.doLayout();',
      cmd: '$ java Raf',
    },
    {
      tab: 'Karıştırmayın!',
      title: 'Strategy, State ve Template Method',
      intro: 'Üçü de bir davranışın **değişen kısmını** ayırır. Fark: değişen nedir, nasıl takılır ve onu kim değiştirir?',
      extraHtml: `<table class="cmp cmp-3">
        <thead lang="en"><tr><th></th><th>Strategy</th><th>State</th><th>Template Method</th></tr></thead>
        <tbody>
          <tr><td>Değişen ne?</td><td>Algoritmanın tamamı</td><td>Duruma bağlı davranış</td><td>Algoritmanın bazı adımları</td></tr>
          <tr><td>Nasıl takılır?</td><td>Bileşim (nesne verilir)</td><td>Bileşim</td><td>Kalıtım (alt sınıf)</td></tr>
          <tr><td>Kim değiştirir?</td><td><b>İstemci</b> seçer</td><td><b>Durumlar</b> birbirine geçer</td><td>Derlemede: alt sınıf</td></tr>
          <tr><td>Çalışırken değişir mi?</td><td>Evet</td><td>Evet, sık sık</td><td>Hayır</td></tr>
        </tbody></table>`,
      note: 'State ile Strategy’nin **sınıf diyagramı aynıdır**. Strategy’de stratejiler birbirini tanımaz ve onları istemci seçer; State’te durumlar bir sonraki durumu kendileri yaratır. Template Method aynı işi kalıtımla yapar: adım, alt sınıfta sabittir.',
      roles: { Kurye: 'context', SogukOnceRota: 'concreteStrategy' },
      special: SG.special,
      file: 'Karsilastirma.java',
      code: () => `// Strategy: algoritmayı istemci seçer, çalışırken değiştirir
kurye.setStrateji(new SogukOnceRota());

// State: geçişi durumlar yapar; istemci yalnızca bağlamı çağırır
dolap.kodGir("3333");             // DoluDurum → KilitliDurum

// Template Method: iskelet üst sınıfta, bir adım alt sınıfta
class EkspresTeslimat extends Teslimat {
    @Override protected int ucret() { return 70; }
}`,
      mark: 'kurye.setStrateji(new SogukOnceRota());',
    },
  ];

  SG.scenes.realworld = (root, ctx) =>
    kit.realWorldScene(root, ctx, {
      tabs: TABS,
      roles: SG.roles,
      roleOf: SG.roleOf,
      fmLabel: 'strateji yöntemi',
      footText: (i) =>
        i === 3
          ? 'Yapı aynıysa **kimin değiştirdiğine** bakın: Strategy’yi istemci seçer, State’te durumlar kendi aralarında geçer, Template Method’da alt sınıf sabittir.'
          : i === 2
          ? 'GUI’lerde strateji her yerde: aynı panel, takılan yerleşim yöneticisine göre bambaşka görünür.'
          : i === 1
          ? 'Eşzamanlılıkta da strateji var: havuz dolunca ne olacağını havuz değil, takılan politika nesnesi belirler.'
          : 'JDK’nın en çok kullanılan stratejisi: `List.sort` aynı kalır, sıralama ölçütü bir nesne olarak verilir. Sağdaki seçeneklerle deneyin.',
    });

  // ================================================================== 9. QUIZ
  const Q = [
    {
      type: 'mcq',
      q: 'Strategy kalıbının **temel amacı** (GoF) nedir?',
      options: [
        'Bir nesnenin iç durumu değiştikçe davranışını da değiştirmek; sanki sınıfı değişmiş gibi',
        'Bir algoritma ailesini kapsüllemek; algoritmalar birbirinin yerine kullanılabilsin',
        'Bir algoritmanın iskeletini üst sınıfta kurup bazı adımlarını alt sınıflara bırakmak',
        'Bir isteği nesne olarak paketleyip kuyruğa almak, kaydetmek ve gerekirse geri almak',
      ],
      answer: 1,
      explain: 'Diğerleri State, Template Method ve Command’ın amaçları. Strategy’de algoritma, onu kullanan istemciden bağımsız değişir.',
    },
    {
      type: 'line',
      q: 'Bu sınıfta işin **stratejiye devredildiği** satıra tıklayın.',
      codeName: 'Kurye.java',
      code: yorumsuz(SG.plain(COZ.Kurye)),
      answer: 'Durak d = strateji.sec(konum, okunur);',
      explain: 'Kurye sıradaki durağı kendisi seçmiyor; takılı stratejiye soruyor ve ona listenin salt okunur görünümünü veriyor.',
    },
    {
      type: 'mcq',
      q: 'Sürüm 2.0’da öğleden sonra randevu sırası neden bozuldu?',
      options: [
        'Randevu dalı yanlış yazılmıştı; listenin ilk elemanı yerine son elemanını alıyordu',
        'Derleyici, String ile seçilen yöntemi başka bir dala yönlendirdiği için sıra karıştı',
        'En yakın dalı her teslimatta ortak listeyi uzaklığa göre baştan sıralıyordu',
        'Soğuk zincir dalı ortak listeyi yerinde sıraladı; randevu dalı bozuk sırayı aldı',
      ],
      answer: 3,
      explain: 'Randevu dalı “liste randevu sırasında” varsayımıyla `kalan.get(0)` diyordu. Aynı sınıftaki soğuk zincir dalı listeyi sıralayınca bu varsayım bozuldu.',
    },
    {
      type: 'mcq',
      q: '`Kurye` sınıfı bu tasarımda hangi rolde?',
      options: ['Context', 'Strategy', 'ConcreteStrategy', 'Client'],
      answer: 0,
      explain: 'Kurye bağlamdır: stratejiyi tutar, işi ona devreder ve kendi verisinin sahibidir.',
    },
    {
      type: 'line',
      q: 'Bu stratejide adayların **listeyi değiştirmeden** seçildiği satıra tıklayın.',
      codeName: 'SogukOnceRota.java',
      code: yorumsuz(SG.plain(COZ.SogukOnceRota)),
      answer: 'List<Durak> soguklar = kalan.stream().filter(Durak::soguk).toList();',
      explain: 'Süzme yeni bir liste üretir; kuryenin listesine dokunmaz. Sürüm 2.0’daki `kalan.sort(…)` ise listeyi yerinde değiştiriyordu.',
    },
    {
      type: 'mcq',
      q: 'Kurye stratejiye `Collections.unmodifiableList(kalan)` veriyor. Strateji bu listeyi sıralamaya çalışırsa ne olur?',
      options: [
        'Liste sessizce sıralanır; görünüm, listenin yalnızca bir kopyasıdır',
        'Derleyici sort çağrısına izin vermez; kod hiç derlenmez',
        'Çalışırken UnsupportedOperationException fırlar; liste değişmez',
        'Yalnızca görünüm sıralanır; kuryenin asıl listesi aynı kalır',
      ],
      answer: 2,
      explain: 'Gerçek çalıştırma: ilk teslimatta `Collections$UnmodifiableList.sort` istisna fırlattı. Hata sessiz kalmadı, sorunlu satırda yakalandı.',
    },
    {
      type: 'mcq',
      q: 'Kalıtımla tasarlanan `SogukOnceKuryesi` nesnesine öğleden sonra neden randevu sırası verilemedi?',
      options: [
        'Randevu sırası, soğuk zincirli gönderilerle aynı gün kullanılamaz',
        'Algoritma nesnenin sınıfına gömülü; nesnenin sınıfı sonradan değişmez',
        'Alt sınıflar üst sınıfın yöntemlerini çalışma sırasında çağıramaz',
        'Java, soyut bir sınıfın alt sınıflarından nesne yaratmaya izin vermez',
      ],
      answer: 1,
      explain: 'Kalıtımda davranış sınıfa bağlı. Başka bir algoritma için yeni bir kurye nesnesi yaratıp listeyi, konumu ve km’yi taşımak gerekir.',
    },
    {
      type: 'mcq',
      q: 'İki kurye aynı `PlanliRota` nesnesini paylaşınca ikinci kurye neden hata verdi?',
      options: [
        'PlanliRota arayüzü yanlış uyguladığı için her çağrıda null değeri döndürüyordu',
        'Java, iki nesnenin aynı strateji nesnesini paylaşmasına izin vermiyor',
        'İkinci kuryenin listesi salt okunur olduğu için teslimat yapılamadı',
        'Strateji ilk kuryenin planını tutuyordu; ikinciye o planın durağını verdi',
      ],
      answer: 3,
      explain: 'Durumsuz stratejiler paylaşılabilir; durum tutan bir strateji paylaşılırsa bağlamlar birbirinin işini bozar. Gerçek çalıştırma: IllegalStateException.',
    },
    {
      type: 'mcq',
      q: 'Strategy’nin **bedeli** (dikkat edilmesi gereken yanı) hangisi?',
      options: [
        'İstemci stratejileri tanımalı; hangisinin ne zaman uygun olduğunu o bilir',
        'Her yeni strateji eklendiğinde bağlam sınıfının da yeniden değiştirilmesi gerekir',
        'Stratejiler çalışırken değiştirilemez; bağlam yeniden yaratılmalıdır',
        'Strateji arayüzü yalnızca tek bir somut sınıf tarafından uygulanabilir',
      ],
      answer: 0,
      explain: 'Koşul dalları bağlamdan kalkar ama karar ortadan kalkmaz: istemciye geçer. Ayrıca nesne sayısı artar.',
    },
  ];

  SG.scenes.quiz = (root, ctx) =>
    kit.quizScene(root, ctx, {
      questions: Q,
      roleOf: SG.roleOf,
      special: SG.special,
      patternName: 'Strategy',
      match: {
        items: ['RotaStratejisi', 'RandevuRota', 'SogukOnceRota', 'AgirOnceRota', 'Kurye', 'Main'].map((id) => ({ id, label: id })),
        buckets: ['strategy', 'concreteStrategy', 'context', 'client'].map((k) => ({ id: k, title: SG.roles[k].en, sub: SG.roles[k].tr, color: SG.roles[k].color })),
        answer: SG.classRoles,
        hint: 'Altı sınıfı dört role yerleştirin. Takıldığınızda **Cevapları göster** düğmesi var.',
      },
    });

  // ================================================================== 10. ÖZET
  SG.scenes.summary = function (root, ctx) {
    const at = DP.catalog.findIndex((p) => p.id === 'strategy');
    const next = DP.catalog.slice(at + 1).find((p) => p.ready && DP.patterns[p.id]);
    const el = h('div', { class: 'scene scene-summary' });
    el.innerHTML = `
      <div class="sum-head">
        <div>
          <div class="chips"><span class="chip chip-cat is-behav">Davranışsal · Behavioral</span><span class="chip">Anahtar kelime: değiştirilebilir algoritma</span></div>
          <h1>Strategy — Özet</h1>
        </div>
        <div class="sum-actions no-print">
          <button class="btn btn-ghost" type="button" data-print>🖨 Yazdır / PDF</button>
          <a class="btn btn-ghost" href="#/state/ozet">← State özeti</a>
          <a class="btn btn-ghost" href="#/">Tüm kalıplar</a>
          ${next ? `<a class="btn btn-primary" href="#/${next.id}">Sıradaki kalıp: ${DP.esc(next.name)} →</a>` : ''}
        </div>
      </div>
      <div class="sum-grid">
        <article class="card sum-intent">
          <h3>Amaç</h3>
          <p>Bir <b>algoritma ailesi</b> tanımla, her birini kapsülle ve <b>birbirinin yerine kullanılabilir</b> yap; algoritma, onu kullanan istemciden bağımsız değişebilsin.</p>
          <div class="sum-formula"><code>kurye.teslimEt()</code> → <code>strateji.sec(konum, okunur)</code> → <code>kalan.remove(d)</code> <span>(seçim: strateji · veri: kurye)</span></div>
        </article>
        <article class="card sum-uml"><h3>Yapı (GoF)</h3><div class="sum-diag"></div></article>
        <article class="card">
          <h3>if/else ↔ Strategy</h3>
          <table class="cmp sg-sum-cmp">
            <thead lang="en"><tr><th></th><th>if/else (2.0)</th><th>Strategy</th></tr></thead>
            <tbody>
              <tr><td>Algoritmalar</td><td class="bad">Kurye’de, 3 dal</td><td class="ok">ayrı sınıflarda</td></tr>
              <tr><td>Kuryenin listesi</td><td class="bad">hepsi değiştirebilir</td><td class="ok">salt okunur görünüm</td></tr>
              <tr><td>Yeni algoritma</td><td class="bad">Kurye değişir</td><td class="ok">yeni sınıf</td></tr>
              <tr><td>Gün ortasında geçiş</td><td class="bad">String ile</td><td class="ok">nesne ile</td></tr>
            </tbody>
          </table>
        </article>
        <article class="card">
          <h3>Katılımcılar</h3>
          <ul class="sum-roles">
            <li>${ui.roleChip('strategy')}<span>tek yöntem: sec(konum, kalan)</span></li>
            <li>${ui.roleChip('concreteStrategy')}<span>bir algoritma; yalnızca seçer</span></li>
            <li>${ui.roleChip('context')}<span>stratejiyi tutar, işi devreder</span></li>
            <li>${ui.roleChip('client')}<span>stratejiyi seçer, değiştirir</span></li>
          </ul>
        </article>
        <article class="card sum-pros">
          <h3>Artıları</h3>
          <ul>
            <li>Algoritmalar <b>ayrı sınıflarda</b>, tek başına sınanır</li>
            <li>Yeni algoritma = yeni sınıf; bağlam değişmez</li>
            <li>Algoritma <b>çalışırken</b> değiştirilebilir</li>
            <li>Bağlamdaki koşul dalları kalkar</li>
          </ul>
        </article>
        <article class="card sum-cons">
          <h3>Eksileri</h3>
          <ul>
            <li>İstemci stratejileri tanımalı</li>
            <li>Nesne (sınıf) sayısı artar</li>
            <li>Arayüz herkese aynı veriyi verir</li>
            <li>Durum tutan strateji paylaşılamaz</li>
          </ul>
        </article>
        <article class="card">
          <h3>İlişkili kalıplar</h3>
          <ul>
            <li><b>State:</b> aynı yapı; ama geçişi durumlar yapar.</li>
            <li><b>Template Method:</b> değişen adımı kalıtımla verir; çalışırken değişmez.</li>
            <li><b>Flyweight:</b> durumsuz stratejiler paylaşılabilir.</li>
          </ul>
        </article>
        <article class="card sum-tip">
          <h3>Sınav ipuçları</h3>
          <pre class="mini-code">interface RotaStratejisi {                       // Strategy
    Durak sec(Konum konum, List&lt;Durak&gt; kalan);
}
class EnYakinRota implements RotaStratejisi { … } // ConcreteStrategy
class Kurye {                                      // Context
    private RotaStratejisi strateji;
    void setStrateji(RotaStratejisi s) { strateji = s; }
    void teslimEt() { Durak d = strateji.sec(konum, okunur); … }
}
kurye.setStrateji(new RandevuRota());              // Client</pre>
          <p class="exam"><b>Algoritma çalışırken değişsin</b> → Strategy · <b>Context, Strategy, ConcreteStrategy</b> · bağlam işi <u>devreder</u> · stratejiyi <u>istemci seçer</u> · State’ten farkı: <u>kim değiştiriyor?</u></p>
        </article>
        <article class="card sum-files">
          <h3>Java kodları</h3>
          <p>Çalıştırılabilir örnekler proje klasöründe:</p>
          <pre class="mini-code">java/strategy/sorun      → algoritmalar Kurye’de; randevu sırası bozuluyor
java/strategy/cozum      → RotaStratejisi ve üç strateji; liste salt okunur
java/strategy/akis/...   → Canlı Akış: gun · yakin
java/strategy/tezgah/... → aynı istekler: ifelse · kalitim · strateji
java/strategy/tuzak      → paylaşılan PlanliRota: IllegalStateException
java/strategy/genislet   → AgirOnceRota: yeni strateji, Kurye değişmeden</pre>
          <p>Derleyip çalıştırmak için <code>java/README.md</code> dosyasına bakın.</p>
        </article>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-print]').addEventListener('click', () => window.print());
    const diag = new DP.ClassDiagram(el.querySelector('.sum-diag'), SG.gofDiagram({}), { roles: SG.roles, roleTags: false, mode: 'generic' });
    diag.svg.classList.add('is-compact');
    return { destroy() {} };
  };

  // ================================================================== kayıt
  DP.register({
    id: 'strategy',
    name: 'Strategy',
    tr: 'Strateji',
    category: 'behavioral',
    roleOf: SG.roleOf,
    initialState: () => ({
      view: 'stage',
      showCode: true,
      preset: 'gun',
      tz: { design: 'strateji', ops: SG.TEZGAH_ANA.slice() },
      agirUnlocked: false,
      tuzak: 'paylasim',
      ext: {},
      quiz: { results: {}, match: false },
    }),
    scenes: [
      { id: 'giris', title: 'Giriş', mount: SG.scenes.intro },
      { id: 'sorun', title: 'Sorun', mount: SG.scenes.problem },
      { id: 'cozum', title: 'Çözüm', mount: SG.scenes.solution },
      { id: 'akis', title: 'Canlı Akış', mount: SG.scenes.flow, star: true },
      { id: 'tezgah', title: 'Rota Tezgâhı', mount: SG.scenes.counter, star: true },
      { id: 'yapi', title: 'Yapı (UML)', mount: SG.scenes.structure },
      { id: 'genislet', title: 'Genişlet', mount: SG.scenes.extend },
      { id: 'gercek', title: 'Gerçek Dünya', mount: SG.scenes.realworld },
      { id: 'quiz', title: 'Quiz', mount: SG.scenes.quiz },
      { id: 'ozet', title: 'Özet', mount: SG.scenes.summary },
    ],
  });
})();
