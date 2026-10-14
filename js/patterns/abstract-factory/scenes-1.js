/*
 * Abstract Factory — sahneler (1/3): Giriş, Sorun, Çözüm, Yapı
 */
(function () {
  'use strict';
  const AF = DP.af;
  const { h } = DP;
  const kit = DP.kit;
  const art = DP.lojistik.art;
  const md = (t) => DP.md(t, AF.roleOf);
  AF.md = md;
  AF.scenes = AF.scenes || {};
  const ui = (AF.ui = {
    foot: (root) => kit.foot(root, AF.roleOf),
    roleChip: (key) => kit.roleChip(AF.roles, key),
  });
  const F = AF.families;

  // ================================================================== 1. GİRİŞ
  AF.scenes.intro = function (root, ctx) {
    const el = h('div', { class: 'scene scene-intro' });
    el.innerHTML = `
      <div class="intro-grid">
        <section class="intro-main">
          <div class="chips">
            <span class="chip chip-cat">Yaratımsal · Creational</span>
            <span class="chip">GoF · 1994</span>
            <span class="chip">Nesne düzeyi kalıp (kompozisyon)</span>
          </div>
          <h1 class="intro-title">Abstract Factory</h1>
          <div class="intro-sub">Soyut Fabrika <span>· diğer adıyla <em>Kit</em> (Takım)</span></div>
          <blockquote class="intent">
            <div class="intent-label">Amaç</div>
            <p>Birbiriyle ilişkili ya da birbirine bağımlı <b>nesne ailelerini</b>, somut sınıflarını belirtmeden oluşturmak için bir arayüz sağla.</p>
            <footer>— Gamma, Helm, Johnson, Vlissides (GoF), <i>Design Patterns</i>, 1994</footer>
          </blockquote>
        </section>
        <section class="intro-hero" aria-label="Kalıbın kısa animasyonu">${heroSvg()}</section>
      </div>
      <div class="intro-cards">
        <article class="card">
          <h3><span class="card-ic">🫖</span> Günlük hayattan</h3>
          <p>Bir <b>çay takımı</b> düşünün: demlik, bardak ve tabak aynı desenden gelir. Ya da prizle fişi:
          İngiltere’deki prize Türk fişi girmez. Abstract Factory parçaları <b>tek tek</b> değil,
          birbirine uyan bir <b>takım</b> hâlinde verir.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🔁</span> Factory Method’dan farkı</h3>
          <p><b>Factory Method:</b> tek ürün; kararı <b>alt sınıf</b> verir (kalıtım).<br>
          <b>Abstract Factory:</b> bir ürün <b>ailesi</b>; kararı istemciye <b>verilen fabrika nesnesi</b> verir (kompozisyon).
          Aynı lojistik dünyasında devam ediyoruz.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🎯</span> Bu derste</h3>
          <ol class="objectives">
            <li>Birlikte kullanılması gereken nesnelerin <b>karışma</b> riskini görmek</li>
            <li>Beş rolü tanımak: ${['abstractFactory', 'concreteFactory', 'abstractProduct', 'concreteProduct', 'client'].map((r) => ui.roleChip(r)).join(' ')}</li>
            <li>Bir ailenin tek bir fabrikadan nasıl tutarlı üretildiğini izlemek</li>
            <li>Aile eklemenin kolay, ürün türü eklemenin zor olduğunu görmek</li>
            <li>Factory Method ile farkını netleştirmek</li>
          </ol>
        </article>
      </div>
      <div class="intro-cta">
        <button class="btn btn-primary btn-lg" type="button" data-go>Sorunla başlayalım →</button>
        <a class="btn btn-ghost" href="#/factory-method">← Önceki kalıp: Factory Method</a>
        <span class="hint">ya da klavyede <kbd>→</kbd> tuşuna basın</span>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-go]').addEventListener('click', () => ctx.goScene('sorun'));

    const svg = el.querySelector('.hero-svg');
    const order = AF.familyOrder.map((k) => F[k]);
    let i = 0;
    const tick = () => {
      const f = order[i % order.length];
      svg.querySelector('[data-h=factory]').textContent = f.factory;
      svg.querySelector('[data-h=veh]').textContent = f.vehicle;
      svg.querySelector('[data-h=doc]').textContent = f.doc;
      const name = svg.querySelector('[data-k=hero-name]');
      name.textContent = f.docName;
      if (f.docName.length > 5) name.setAttribute('textLength', '48');
      else name.removeAttribute('textLength');
      DP.$$('.h-veh', svg).forEach((g) => g.classList.toggle('is-on', g.dataset.kind === f.kind));
      DP.flash(svg.querySelector('.h-doc'), 'is-on');
      DP.flash(svg.querySelector('.h-sign'), 'is-swap');
      i++;
    };
    tick();
    const timer = setInterval(tick, 2800);
    return { destroy: () => clearInterval(timer) };
  };

  function heroSvg() {
    return `
    <svg class="hero-svg af-hero" viewBox="0 0 560 360" role="img" aria-label="Fabrika uyumlu araç ve belge çiftleri üretiyor">
      <rect class="h-chimney" x="200" y="52" width="24" height="64" rx="2"/>
      <g class="h-smoke"><circle cx="212" cy="44" r="8"/><circle cx="220" cy="28" r="10"/><circle cx="210" cy="10" r="12"/></g>
      <path class="h-roof" d="M40 122 V102 L113 88 V102 L186 88 V102 L260 88 V122 Z"/>
      <g class="h-sign"><rect x="56" y="58" width="190" height="28" rx="7"/><text x="151" y="77" text-anchor="middle" data-h="factory">KaraFabrikasi</text></g>
      <g class="h-bottom">
        <rect x="40" y="120" width="220" height="86"/>
        <text class="h-t1" x="54" y="146">Belge hattı</text>
        <text class="h-t2" x="54" y="168">belgeOlustur()</text>
        <text class="h-t2 h-code" x="54" y="192"><tspan class="h-kw">→ new </tspan><tspan class="h-prod" data-h="doc">CmrBelgesi</tspan>()</text>
      </g>
      <g class="h-bottom">
        <rect x="40" y="206" width="220" height="96"/>
        <text class="h-t1" x="54" y="232">Araç hattı</text>
        <text class="h-t2" x="54" y="256">aracOlustur()</text>
        <text class="h-t2 h-code" x="54" y="280"><tspan class="h-kw">→ new </tspan><tspan class="h-prod" data-h="veh">Kamyon</tspan>()</text>
      </g>
      <rect class="h-door" x="224" y="248" width="36" height="54" rx="3"/>
      <rect class="h-belt" x="236" y="300" width="300" height="14" rx="7"/>
      <path class="h-belt-top" d="M244 301.5 H530"/>
      <g transform="translate(330,300)"><g class="h-veh" data-kind="truck">${art.truck()}</g></g>
      <g transform="translate(320,302)"><g class="h-veh" data-kind="ship">${art.ship()}</g></g>
      <g transform="translate(316,300)"><g class="h-veh" data-kind="plane">${art.plane()}</g></g>
      <g transform="translate(470,196) scale(0.72)"><g class="h-doc">${art.doc('hero')}</g></g>
      <text class="h-plus" x="452" y="250" text-anchor="middle">+</text>
      <line class="h-ground" x1="20" y1="314" x2="545" y2="314"/>
      <text class="h-caption" x="290" y="346" text-anchor="middle">Aynı fabrika → aynı aileden araç + belge</text>
    </svg>`;
  }

  // ================================================================== 2. SORUN
  AF.scenes.problem = function (root, ctx) {
    const N = AF.naive;
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-55' });
    const left = kit.panel('Kalıpsız kod · <span class="ver"></span>', { cls: 'panel-code af-left' });
    const right = kit.panel('Gümrük kapısı', { cls: 'panel-side' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'af-cv' });
    const consoleEl = h('div', { class: 'console af-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: AF.roleOf, special: AF.special });

    const log = h('div', { class: 'customs-log' });
    const matrixHost = h('div', { class: 'compat-host' });
    const extra = h('div', { class: 'af-extra' });
    right.body.append(log, matrixHost, extra);
    const compat = new AF.CompatMatrix(matrixHost);

    const SHIP = {
      kara: { v: 'kara', d: 'kara', ok: true },
      deniz: { v: 'deniz', d: 'deniz', ok: true },
      havaBad: { v: 'hava', d: 'kara', ok: false },
    };

    function renderLog(list) {
      log.innerHTML = `<div class="cl-title">Bugünkü gönderiler</div>` + list
        .map((s) => {
          const fv = F[s.v];
          const fd = F[s.d];
          return `<div class="cl-row ${s.ok ? 'is-ok' : 'is-bad'}">
            <span class="cl-item">${art.icon(fv.kind)} ${fv.vehicleTr}</span><span class="cl-plus">+</span>
            <span class="cl-item">${art.icon('doc')} ${fd.docName}</span>
            <span class="cl-verdict">${s.ok ? '✓ geçti' : '✗ REDDEDİLDİ'}</span></div>`;
        })
        .join('');
    }

    function renderConsole(lines, animateFrom) {
      consoleEl.innerHTML = '<div class="console-head"><span></span><span></span><span></span> Konsol</div>';
      consoleEl.appendChild(h('div', { class: 'console-line is-cmd' }, '$ java Main'));
      lines.forEach((l, i) => consoleEl.appendChild(h('div', { class: 'console-line' + (l.err ? ' is-err' : '') + (animateFrom != null && i >= animateFrom ? ' is-new' : '') }, l.t)));
      consoleEl.scrollTop = consoleEl.scrollHeight;
    }

    const STEPS = [
      {
        t: 'Sürüm 1.0 — İki ayrı karar',
        x: 'Her gönderide **iki** nesne gerekiyor: araç ve belge. [[TeslimatServisi]] bunları iki ayrı `switch` ile seçiyor. Şimdilik her şey uyumlu…',
      },
      {
        t: 'Gizli risk: 4 eşleşme, 2’si geçerli',
        x: 'Araç ve belge birbirinden **bağımsız** seçiliyor. Derleyici `Gemi + CMR` gibi yanlış bir eşleşmeyi engelleyemez; tutarlılık tamamen programcının dikkatine kalmış.',
      },
      {
        t: 'Sürüm 2.0 — Hava yolu eklendi… yarım',
        x: 'Yeni bir geliştirici `aracSec` içine Uçak’ı ekledi ama `belgeSec`’i **unuttu**. `default` dalı sessizce CMR verdi; gümrük patladı: `IllegalStateException`. Derleyici tek kelime etmedi!',
      },
      {
        t: 'Kombinasyon patlaması',
        x: '**n** aile ve **k** ürün türü varsa **nᵏ** eşleşme mümkün; yalnızca **n** tanesi geçerli. Her yeni aile, her `switch`’e ayrı ayrı ve eksiksiz eklenmeli.',
      },
      {
        t: 'Teşhis — Sorun nerede?',
        x: 'Aile kararı **bir yerde** verilmiyor, her ürün türü için tekrar tekrar veriliyor. Çözüm: aileyi tek bir nesneye emanet etmek → **Soyut Fabrika**.',
      },
    ];

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: () => 5600,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        const vi = i >= 2 ? 1 : 0;
        const ver = N[vi];
        left.head.querySelector('.ver').textContent = 'sürüm ' + ver.version;
        const files = [
          { name: 'TeslimatServisi.java', code: ver.servis },
          { name: 'Main.java', code: ver.main },
          { name: 'Gumruk.java', code: AF.code.Gumruk },
        ];
        cv.setFiles(files, {
          active: 'TeslimatServisi.java',
          prev: i === 2 ? { 'TeslimatServisi.java': N[0].servis, 'Main.java': N[0].main, 'Gumruk.java': AF.code.Gumruk } : null,
        });
        if (i === 1 || i === 4) {
          cv.mark('TeslimatServisi.java', { block: 'private TasimaAraci aracSec' }, 'focus', { scroll: false });
          cv.mark('TeslimatServisi.java', { block: 'private TasimaBelgesi belgeSec' }, 'focus', { scroll: false });
        }
        if (i >= 2) cv.mark('TeslimatServisi.java', 'default:      return new CmrBelgesi()', 'bad', { scroll: i === 2 });

        const out = AF.naiveOutput(vi);
        renderConsole(out, info.animate && i === 2 ? 6 : null);

        renderLog(vi === 0 ? [SHIP.kara, SHIP.deniz] : [SHIP.kara, SHIP.deniz, SHIP.havaBad]);
        if (info.animate && i === 2) DP.flash(log.lastElementChild, 'is-shake');

        compat.update({
          vehicles: vi === 0 ? ['kara', 'deniz'] : ['kara', 'deniz', 'hava'],
          docs: vi === 0 ? ['kara', 'deniz'] : ['kara', 'deniz', 'hava'],
          produced: [['kara', 'kara'], ['deniz', 'deniz']],
          bad: vi === 1 ? ['hava', 'kara'] : null,
          reveal: i !== 0 && i !== 2 ? true : false,
        });

        if (i === 3) {
          extra.innerHTML = `
            <div class="metrics">
              <div class="metric is-bad"><div class="m-val">9</div><div class="m-label">olası eşleşme (3 araç × 3 belge)</div></div>
              <div class="metric is-good"><div class="m-val">3</div><div class="m-label">geçerli eşleşme</div></div>
              <div class="metric is-bad"><div class="m-val">27</div><div class="m-label">sigorta da eklenirse (3×3×3)</div></div>
            </div>`;
        } else if (i === 4) {
          extra.innerHTML = `
            <div class="req-card is-diagnosis">
              <div class="diag-title">Teşhis</div>
              <ul class="problems">
                <li>${md('**Tutarsız aile:** ürünler birlikte kullanılmalı ama kod bunu garanti etmiyor; hata ancak çalışma zamanında çıkıyor.')}</li>
                <li>${md('**Dağınık karar:** “hangi aile?” sorusu her ürün türü için ayrı bir `switch`’te tekrar ediliyor.')}</li>
                <li>${md('**Sıkı bağlılık:** [[TeslimatServisi]] tüm somut ürünleri tanıyor (`new Kamyon()`, `new CmrBelgesi()`…).')}</li>
                <li>${md('**OCP ihlali:** yeni aile = istemci sınıfını değiştirmek.')}</li>
              </ul>
            </div>`;
        } else extra.innerHTML = '';
        if (i >= 3) DP.flash(extra, 'is-pop');
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };

  // ================================================================== 3. ÇÖZÜM
  AF.scenes.solution = function (root, ctx) {
    const R = AF.refactor;
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-diag' });
    const left = kit.panel('Yeniden düzenleme (refactoring)', { cls: 'panel-code' });
    const right = kit.panel('Sınıf diyagramı', { cls: 'panel-side panel-diagram' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cv = new DP.CodeView(left.body, { roleOf: AF.roleOf, special: AF.special });
    const diagHost = h('div', { class: 'diag-host' });
    const recipe = h('ol', { class: 'recipe' });
    right.body.append(h('div', { class: 'recipe-wrap' }, h('div', { class: 'recipe-title' }, 'Dönüşüm tarifi'), recipe), diagHost);
    ['Ailenin arayüzünü tanımla', 'Her aile için somut fabrika', 'İstemciye fabrikayı ver', 'Aile seçimini tek yere taşı'].forEach((t, i) => recipe.appendChild(h('li', { 'data-i': String(i + 1) }, t)));
    const diagram = new DP.ClassDiagram(diagHost, AF.solutionDiagram(0), { roles: AF.roles, roleTags: false });

    const STEPS = [
      { t: 'Başlangıç — Kalıpsız sürüm 1.0', x: '[[TeslimatServisi]] aileyi iki ayrı `switch` ile seçiyor ve dört somut sınıfı kendisi `new`liyor. Dört adımda **Abstract Factory**’ye dönüştüreceğiz.', focus: 'TeslimatServisi.java' },
      { t: 'Adım 1 — Ailenin “menüsü”', x: 'Bir ailenin üretebildiği her şeyi tek bir arayüzde topluyoruz: [[LojistikFabrikasi]]. Her ürün **türü** için bir oluşturma metodu: `aracOlustur()` ve `belgeOlustur()`.', focus: 'LojistikFabrikasi.java' },
      { t: 'Adım 2 — Her aile için bir somut fabrika', x: '[[KaraFabrikasi]] ve [[DenizFabrikasi]] arayüzü gerçekliyor. Her biri **kendi ailesinin** ürünlerini üretir. Uyumluluk artık bir sınıfın **içinde** garanti altında.', focus: 'KaraFabrikasi.java', mark: 'return new CmrBelgesi();' },
      { t: 'Adım 3 — İstemci fabrikayı alır', x: '`switch`’ler tamamen kayboldu! [[TeslimatServisi]] fabrikayı kurucu parametresi olarak **alıyor** (kompozisyon) ve araçla belgeyi **aynı** nesneden istiyor.', focus: 'TeslimatServisi.java', mark: 'private final LojistikFabrikasi fabrika;' },
      { t: 'Adım 4 — Aile seçimi tek satırda', x: 'Aile yalnızca `new TeslimatServisi(new KaraFabrikasi())` satırında seçiliyor. Bütün aileyi değiştirmek için tek kelime değişir.', focus: 'Main.java', mark: 'new KaraFabrikasi()' },
      { t: 'Sonuç — Karışmak imkânsız', x: 'İstemci yalnızca **soyutlamalara** bağlı: [[LojistikFabrikasi]], [[TasimaAraci]], [[TasimaBelgesi]]. Araç ve belge hep aynı fabrikadan geldiği için `Gemi + CMR` gibi bir karışım **yapısal olarak** imkânsız.', focus: 'TeslimatServisi.java', mark: 'TasimaBelgesi belge = fabrika.belgeOlustur();' },
    ];

    const filesAt = (i) => Object.keys(R[i]).map((k) => ({ name: k + '.java', code: R[i][k] }));
    const asMap = (i) => {
      const m = {};
      Object.keys(R[i]).forEach((k) => (m[k + '.java'] = R[i][k]));
      return m;
    };

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: () => 6000,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        const ri = Math.min(i, R.length - 1);
        const showDiff = i >= 1 && i <= R.length - 1;
        cv.setFiles(filesAt(ri), { active: s.focus, prev: showDiff ? asMap(ri - 1) : null });
        if (s.mark) cv.mark(s.focus, s.mark, 'focus');
        diagram.update(AF.solutionDiagram(ri), { animate: info.animate });
        diagram.clearBadges();
        if (i === 1) diagram.badge('LojistikFabrikasi', 'YENİ', 'new');
        if (i === 2) {
          diagram.badge('KaraFabrikasi', 'YENİ', 'new');
          diagram.badge('DenizFabrikasi', 'YENİ', 'new');
        }
        if (i === 5) {
          diagram.focus({ classes: ['TeslimatServisi', 'LojistikFabrikasi', 'TasimaAraci', 'TasimaBelgesi'], edges: ['has', 'uses-a', 'uses-b'] });
          diagram.badge('TeslimatServisi', 'yalnızca soyutlamalara bağlı', 'same');
        }
        DP.$$('li', recipe).forEach((li, k) => {
          li.classList.toggle('is-done', k + 1 < i || (i === 5 && k < 4));
          li.classList.toggle('is-current', k + 1 === i);
        });
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };

  // ================================================================== 4. YAPI (UML ↔ aile matrisi)
  const ROLE_TEXT = {
    abstractFactory: 'Her ürün türü için bir <b>oluşturma metodu</b> bildirir: ailenin “menüsü”.',
    concreteFactory: 'Oluşturma metotlarını gerçekler; <b>tek bir ailenin</b> ürünlerini üretir.',
    abstractProduct: 'Bir ürün <b>türünün</b> arayüzü (araç, belge…).',
    concreteProduct: 'Bir ailenin somut ürünü; ilgili soyut ürünü gerçekler.',
    client: 'Yalnızca soyut fabrikayı ve soyut ürünleri kullanır; fabrikayı <b>dışarıdan alır</b>.',
  };

  function classInfo(id) {
    const byFactory = {};
    const byVehicle = {};
    const byDoc = {};
    AF.familyOrder.forEach((k) => {
      byFactory[F[k].factory] = F[k];
      byVehicle[F[k].vehicle] = F[k];
      byDoc[F[k].doc] = F[k];
    });
    if (id === 'TeslimatServisi')
      return { role: 'client', code: AF.code.TeslimatServisi, points: ['Fabrikayı **alan** olarak tutar: `private final LojistikFabrikasi fabrika` (kompozisyon).', 'Araç ve belgeyi **aynı** fabrikadan ister → aile tutarlı.', 'Hiçbir somut sınıf adını bilmez.'] };
    if (id === 'LojistikFabrikasi')
      return { role: 'abstractFactory', code: AF.code.LojistikFabrikasi, points: ['Her ürün türü için bir metot: `aracOlustur()`, `belgeOlustur()`.', 'Dönüş tipleri **soyut ürünlerdir**.', 'Yeni bir ürün türü eklemek bu arayüzü — dolayısıyla tüm fabrikaları — değiştirir.'] };
    if (id === 'TasimaAraci') return { role: 'abstractProduct', code: AF.code.TasimaAraci, points: ['Ürün **A** türü: araç.', '`gerekenBelge()` aracın hangi belgeyle yola çıkabileceğini söyler.'] };
    if (id === 'TasimaBelgesi') return { role: 'abstractProduct', code: AF.code.TasimaBelgesi, points: ['Ürün **B** türü: taşıma belgesi.', 'Her ailenin kendi belgesi var: CMR, Konşimento, AWB.'] };
    if (byFactory[id]) {
      const f = byFactory[id];
      return { role: 'concreteFactory', code: AF.code.factory(f), points: [`**${f.label} ailesini** üretir: \`new ${f.vehicle}()\` + \`new ${f.doc}()\`.`, 'Ürünlerin birbirine uymasını garanti eden yer burası.', 'Uygulamada genellikle **tek örnek** yeterlidir (Singleton ile birlikte kullanılabilir).'] };
    }
    if (byVehicle[id]) {
      const f = byVehicle[id];
      return { role: 'concreteProduct', code: AF.code.vehicle(f), points: [`${f.label} ailesinin aracı; gereken belge: **${f.docName}**.`, '[[TasimaAraci]] arayüzünü gerçekler.'] };
    }
    if (byDoc[id]) {
      const f = byDoc[id];
      return { role: 'concreteProduct', code: AF.code.doc(f), points: [`${f.label} ailesinin belgesi: **${f.docName}** (${f.docLong}).`, '[[TasimaBelgesi]] arayüzünü gerçekler.'] };
    }
    return null;
  }

  AF.scenes.structure = function (root, ctx) {
    const hava = !!ctx.state.havaUnlocked;
    const el = h('div', { class: 'scene scene-split' });
    const tools = h('div', { class: 'panel-tools' });
    const body = h('div', { class: 'scene-body cols-64' });
    const left = kit.panel('Yapı', { cls: 'panel-diagram', extra: tools });
    const right = kit.panel('Rol kartı <span class="panel-sub">· bir sınıfa tıklayın</span>', { cls: 'panel-side' });
    body.append(left.el, right.el);
    el.append(body);
    root.appendChild(el);

    const diagHost = h('div', { class: 'diag-host' });
    const matrixHost = h('div', { class: 'matrix-host', hidden: true });
    const legend = kit.umlLegend({ association: true, fmLabel: 'oluşturma (fabrika) metodu' });
    left.body.append(diagHost, matrixHost, legend);
    const diagram = new DP.ClassDiagram(diagHost, AF.diagram({ hava }), {
      roles: AF.roles,
      onSelect: (id) => {
        showInfo(id);
        diagram.focus({ classes: [id] });
        diagram.select(id);
      },
    });
    const matrix = new AF.FamilyMatrix(matrixHost);
    const families = hava ? ['kara', 'deniz', 'hava'] : ['kara', 'deniz'];
    let view = 'uml';
    let matrixState = { rows: families, cols: ['arac', 'belge'] };

    const viewSeg = kit.seg(
      [
        { v: 'uml', label: 'UML' },
        { v: 'matrix', label: 'Aile matrisi' },
      ],
      'uml',
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
      view = v;
      diagHost.hidden = v !== 'uml';
      legend.hidden = v !== 'uml';
      matrixHost.hidden = v !== 'matrix';
      modeSeg.el.hidden = v !== 'uml';
      tagToggle.hidden = v !== 'uml';
      matrix.update(matrixState);
    }

    const infoTop = h('div', { class: 'info-card' });
    const infoCode = h('div', { class: 'info-code' });
    right.body.append(infoTop, infoCode);

    function showInfo(id, mark) {
      const info = classInfo(id);
      infoCode.innerHTML = '';
      if (!info) return;
      const r = AF.roles[info.role];
      infoTop.innerHTML = `
        <div class="info-role rc rc-${r.color}"><span class="info-dot"></span><b>${r.en}</b> · ${r.tr}</div>
        <div class="info-name rc rc-${r.color}">${id}</div>
        <p class="info-desc">${ROLE_TEXT[info.role]}</p>
        <ul class="info-points">${info.points.map((p) => `<li>${md(p)}</li>`).join('')}</ul>`;
      const cv = new DP.CodeView(infoCode, { files: [{ name: id + '.java', code: info.code }], roleOf: AF.roleOf, special: AF.special, compact: true });
      if (mark) cv.mark(id + '.java', mark, 'focus');
      DP.flash(infoTop, 'is-pop');
    }

    function showOverview() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">Beş rol, iki boyut</div>
        <div class="role-list">
          ${['abstractFactory', 'concreteFactory', 'abstractProduct', 'concreteProduct', 'client']
            .map((k) => `<div class="role-row rc rc-${AF.roles[k].color}"><span class="info-dot"></span><div><b>${AF.roles[k].en}</b> · ${AF.roles[k].tr}<div class="role-desc">${ROLE_TEXT[k]}</div></div></div>`)
            .join('')}
        </div>
        <p class="info-desc">Üstteki <b>Aile matrisi</b> düğmesi aynı yapıyı tablo olarak gösterir: satırlar aileler, sütunlar ürün türleri.</p>`;
    }

    const STEPS = [
      { t: 'Genel bakış', x: 'Abstract Factory **beş rolden** oluşur ve iki boyutludur: **aileler** (Kara, Deniz…) ve **ürün türleri** (araç, belge). Her satırda bir aile, ortada onu üreten somut fabrika var.', info: null, m: {} },
      { t: 'AbstractProduct — Soyut Ürün', x: 'Her ürün **türü** için bir arayüz: [[TasimaAraci]] ve [[TasimaBelgesi]]. İstemci ürünleri yalnızca bu tiplerle tanır.', info: 'TasimaBelgesi', focus: { classes: ['TasimaAraci', 'TasimaBelgesi'] }, m: { focusCol: 'belge' } },
      { t: 'ConcreteProduct — Somut Ürün', x: 'Her ailenin kendi ürünleri: Kara → [[Kamyon]] + [[CmrBelgesi]], Deniz → [[Gemi]] + [[Konsimento]]. Kesik çizgi + boş üçgen = gerçekleme.', info: 'Kamyon', focus: { classes: ['Kamyon', 'CmrBelgesi', 'Gemi', 'Konsimento'] }, m: {} },
      { t: 'AbstractFactory — Soyut Fabrika', x: '[[LojistikFabrikasi]] ailenin “menüsüdür”: her ürün türü için bir oluşturma metodu. Dönüş tipleri **soyut** ürünlerdir.', info: 'LojistikFabrikasi', focus: { classes: ['LojistikFabrikasi'] }, m: {} },
      { t: 'ConcreteFactory — Somut Fabrika', x: 'Bir somut fabrika = **bir aile**. [[KaraFabrikasi]] yalnızca Kara ailesinin ürünlerini üretir; «create» okları bunu gösterir.', info: 'KaraFabrikasi', mark: 'return new CmrBelgesi();', focus: { classes: ['KaraFabrikasi', 'DenizFabrikasi'], edges: ['cr-kara-a', 'cr-kara-b', 'cr-deniz-a', 'cr-deniz-b'] }, m: {} },
      { t: 'Client — İstemci', x: '[[TeslimatServisi]] yalnızca arayüzleri tanır. Fabrikayı **alan** olarak tutar (düz ok = ilişki): kararı kalıtım değil **kompozisyon** taşır.', info: 'TeslimatServisi', mark: 'private final LojistikFabrikasi fabrika;', focus: { classes: ['TeslimatServisi'], edges: ['has', 'uses-a', 'uses-b'] }, m: {} },
      { t: 'Bir satır = bir aile', x: 'Kara ailesini izleyin: [[KaraFabrikasi]] → [[Kamyon]] + [[CmrBelgesi]]. **Aynı fabrikadan** çıkan ürünler birbirine uyar; aileyi değiştirmek için fabrikayı değiştirmek yeter.', info: 'KaraFabrikasi', focus: { classes: ['KaraFabrikasi', 'Kamyon', 'CmrBelgesi'], edges: ['cr-kara-a', 'cr-kara-b'] }, m: { focusRow: 'kara' } },
      { t: 'İçeride fabrika metotları var', x: 'Fark ettiniz mi? `aracOlustur()` ve `belgeOlustur()` birer **fabrika metodu**. Abstract Factory çoğu zaman bir grup fabrika metodunun bir nesnede toplanmasıyla kurulur.', info: 'LojistikFabrikasi', focus: { members: [['LojistikFabrikasi', 'aracOlustur'], ['LojistikFabrikasi', 'belgeOlustur'], ['KaraFabrikasi', 'aracOlustur'], ['KaraFabrikasi', 'belgeOlustur'], ['DenizFabrikasi', 'aracOlustur'], ['DenizFabrikasi', 'belgeOlustur']] }, m: {} },
    ];

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: () => 5800,
      onChange: (i) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        diagram.select(null);
        if (s.focus) diagram.focus(s.focus);
        else diagram.clearFocus();
        matrixState = Object.assign({ rows: families, cols: ['arac', 'belge'] }, s.m);
        matrix.update(matrixState);
        if (s.info) showInfo(s.info, s.mark);
        else showOverview();
      },
    });
    setView('uml');
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };
})();
