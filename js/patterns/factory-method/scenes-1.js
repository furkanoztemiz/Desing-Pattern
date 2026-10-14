/*
 * Factory Method — sahneler (1/3): ortak yardımcılar, Giriş, Sorun, Çözüm, Yapı
 */
(function () {
  'use strict';
  const FM = DP.fm;
  const { h } = DP;
  const md = (t) => DP.md(t, FM.roleOf);
  FM.md = md;
  FM.scenes = FM.scenes || {};

  // ================================================================== ortak arayüz yardımcıları (DP.kit üzerine ince katman)
  const kit = DP.kit;
  const ui = (FM.ui = {
    foot: (root) => kit.foot(root, FM.roleOf),
    panel: kit.panel,
    seg: kit.seg,
    toggle: kit.toggle,
    roleChip: (key) => kit.roleChip(FM.roles, key),
    stepApi: kit.stepApi,
  });

  // ================================================================== 1. GİRİŞ
  FM.scenes.intro = function (root, ctx) {
    const el = h('div', { class: 'scene scene-intro' });
    el.innerHTML = `
      <div class="intro-grid">
        <section class="intro-main">
          <div class="chips">
            <span class="chip chip-cat">Yaratımsal · Creational</span>
            <span class="chip">GoF · 1994</span>
            <span class="chip">Sınıf düzeyi kalıp (kalıtım)</span>
          </div>
          <h1 class="intro-title">Factory Method</h1>
          <div class="intro-sub">Fabrika Metodu <span>· diğer adıyla <em>Virtual Constructor</em> (Sanal Kurucu)</span></div>
          <blockquote class="intent">
            <div class="intent-label">Amaç</div>
            <p>Nesne oluşturmak için bir arayüz tanımla, ama <b>hangi sınıfın örnekleneceğine alt sınıflar karar versin</b>. Factory Method, bir sınıfın örnekleme işini alt sınıflarına ertelemesini sağlar.</p>
            <footer>— Gamma, Helm, Johnson, Vlissides (GoF), <i>Design Patterns</i>, 1994</footer>
          </blockquote>
        </section>
        <section class="intro-hero" aria-label="Kalıbın kısa animasyonu">
          ${heroSvg()}
        </section>
      </div>
      <div class="intro-cards">
        <article class="card">
          <h3><span class="card-ic">🏢</span> Günlük hayattan</h3>
          <p>Bir kargo şirketinin genel müdürlüğü teslimat sürecini belirler: <b>planla → aracı hazırla → teslim et</b>.
          Ama “hangi araç?” sorusunu şubelere bırakır: kara şubesi kamyon, deniz şubesi gemi gönderir.
          Merkez yalnızca <i>“bir araç hazırlayın”</i> der; aracı şube seçer.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🧴</span> <code>new</code> bir yapıştırıcıdır</h3>
          <p><code>new Kamyon()</code> yazdığınız anda kodunuzu <code>Kamyon</code> sınıfına <b>yapıştırırsınız</b>.
          Factory Method bu yapıştırıcıyı iş mantığından söküp alt sınıflara taşır; iş mantığı yalnızca
          soyutlamalarla (arayüzlerle) çalışır.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🎯</span> Bu derste</h3>
          <ol class="objectives">
            <li><code>new</code> ile doğrudan nesne üretmenin yarattığı bağımlılığı fark etmek</li>
            <li>Kalıbın dört rolünü tanımak: ${['creator', 'concreteCreator', 'product', 'concreteProduct'].map((r) => ui.roleChip(r)).join(' ')}</li>
            <li>Çalışma zamanında hangi nesnenin üretildiğini adım adım izlemek</li>
            <li>Yeni bir türü mevcut kodu değiştirmeden eklemek (OCP)</li>
            <li>JDK’daki gerçek örnekleri tanımak</li>
          </ol>
        </article>
      </div>
      <div class="intro-cta">
        <button class="btn btn-primary btn-lg" type="button" data-go>Sorunla başlayalım →</button>
        <span class="hint">ya da klavyede <kbd>→</kbd> tuşuna basın</span>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-go]').addEventListener('click', () => ctx.goScene('sorun'));

    // kahraman animasyonu: aynı fabrika iskeleti, farklı alt sınıf → farklı ürün
    const vs = FM.variantOrder.map((k) => FM.variants[k]);
    const svg = el.querySelector('.hero-svg');
    let i = 0;
    const tick = () => {
      const v = vs[i % vs.length];
      svg.querySelector('[data-h=creator]').textContent = v.creator;
      svg.querySelector('[data-h=prod]').textContent = v.product;
      DP.$$('.h-veh', svg).forEach((g) => g.classList.toggle('is-on', g.dataset.kind === v.vehicle));
      DP.flash(svg.querySelector('.h-bottom'), 'is-swap');
      DP.flash(svg.querySelector('.h-code'), 'is-swap');
      i++;
    };
    tick();
    const timer = setInterval(tick, 2800);
    return { destroy: () => clearInterval(timer) };
  };

  function heroSvg() {
    const art = FM.art;
    return `
    <svg class="hero-svg" viewBox="0 0 560 360" role="img" aria-label="Fabrika farklı araçlar üretiyor">
      <rect class="h-chimney" x="200" y="52" width="24" height="64" rx="2"/>
      <g class="h-smoke"><circle cx="212" cy="44" r="8"/><circle cx="220" cy="28" r="10"/><circle cx="210" cy="10" r="12"/></g>
      <path class="h-roof" d="M40 122 V102 L113 88 V102 L186 88 V102 L260 88 V122 Z"/>
      <g class="h-top">
        <rect x="40" y="120" width="220" height="86"/>
        <text class="h-t1" x="54" y="146">Lojistik</text>
        <text class="h-t2" x="54" y="168">teslimatPlanla()</text>
        <text class="h-t3" x="54" y="192">aracOlustur() → ?</text>
      </g>
      <g class="h-bottom">
        <rect x="40" y="206" width="220" height="96"/>
        <text class="h-t1" x="54" y="232" data-h="creator">KaraLojistigi</text>
        <text class="h-t2" x="54" y="256">aracOlustur() {</text>
        <text class="h-t2 h-code" x="70" y="278"><tspan class="h-kw">return new </tspan><tspan class="h-prod" data-h="prod">Kamyon</tspan>();</text>
      </g>
      <rect class="h-door" x="224" y="248" width="36" height="54" rx="3"/>
      <rect class="h-belt" x="236" y="300" width="300" height="14" rx="7"/>
      <path class="h-belt-top" d="M244 301.5 H530"/>
      <g transform="translate(360,300)"><g class="h-veh" data-kind="truck">${art.truck()}</g></g>
      <g transform="translate(350,302)"><g class="h-veh" data-kind="ship">${art.ship()}</g></g>
      <g transform="translate(346,300)"><g class="h-veh" data-kind="plane">${art.plane()}</g></g>
      <line class="h-ground" x1="20" y1="314" x2="545" y2="314"/>
      <text class="h-caption" x="290" y="346" text-anchor="middle">Aynı iskelet · farklı alt sınıf → farklı ürün</text>
    </svg>`;
  }

  // ================================================================== 2. SORUN
  FM.scenes.problem = function (root, ctx) {
    const N = FM.naive;
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-55' });
    const left = ui.panel('Kalıpsız kod · <span class="ver"></span>', { cls: 'panel-code' });
    const right = ui.panel('Etki analizi', { cls: 'panel-side' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cv = new DP.CodeView(left.body, { roleOf: FM.roleOf, special: FM.special });

    // sağ panel: gereksinim kartı, bağımlılık grafiği, metrikler, teşhis
    const req = h('div', { class: 'req-card' });
    const graphHost = h('div', { class: 'dep-graph' });
    const metrics = h('div', { class: 'metrics' });
    right.body.append(req, graphHost, metrics);
    graphHost.innerHTML = depGraphSvg();
    const M = {};
    [
      ['changes', 'Lojistik.java kaç kez değişti'],
      ['branches', 'if / else dalı'],
      ['deps', 'somut sınıfa bağımlılık'],
    ].forEach(([key, label]) => {
      const val = h('div', { class: 'm-val' }, '0');
      metrics.appendChild(h('div', { class: 'metric' }, val, h('div', { class: 'm-label' }, label)));
      M[key] = val;
    });

    const REQ = [
      { who: 'Lojistik A.Ş.', icon: '📦', text: 'Şirket kuruldu! İlk iş: kamyonla şehirler arası taşıma.' },
      { who: 'Satış Müdürü', icon: '📩', text: '“Müşteriler gemiyle de gönderim istiyor!”' },
      { who: 'Genel Müdür', icon: '📩', text: '“Acil kargolar için hava yolu şart!”' },
      { who: 'Yönetim Kurulu', icon: '📩', text: '“Demiryolu anlaşmasını imzaladık!”' },
    ];
    const VALUES = [
      { changes: 0, branches: 0, deps: 1 },
      { changes: 1, branches: 2, deps: 2 },
      { changes: 2, branches: 3, deps: 3 },
      { changes: 3, branches: 4, deps: 4 },
      { changes: 3, branches: 4, deps: 4 },
    ];
    const STEPS = [
      { t: 'Sürüm 1.0 — Sadece kamyon', x: 'Şirket yalnızca kamyonla taşıma yapıyor. [[Lojistik]] sınıfı aracı doğrudan `new Kamyon()` ile üretiyor. Basit ve çalışıyor… şimdilik.' },
      { t: 'Sürüm 2.0 — Deniz yolu geldi', x: 'Gemi için `if / else` ekledik. Dikkat: metodun imzası da değişti (`tur` parametresi), bu yüzden onu çağıran **Main.java** de değişmek zorunda kaldı.' },
      { t: 'Sürüm 3.0 — Hava yolu geldi', x: 'Yine aynı sınıfı açtık, yine `else if` ekledik. Test edilmiş, çalışan kodu **her yeni istekte yeniden değiştiriyoruz**.' },
      { t: 'Sürüm 4.0 — Demiryolu geldi', x: 'Zincir uzadıkça uzuyor. [[Lojistik]] artık dört somut sınıfa yapışık: her `new`, kodu o sınıfa bağlayan bir **yapıştırıcı**.' },
      { t: 'Teşhis — Sorun nerede?', x: 'Tüm sorunların kaynağı aynı: **“hangi araç?” kararı** ile **teslimat iş mantığı** aynı yerde duruyor. Çözüm: üretim kararını ayrı bir metoda ve alt sınıflara taşımak → **Factory Method**.' },
    ];

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: () => 5200,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        const ver = N[Math.min(i, 3)];
        left.head.querySelector('.ver').textContent = 'sürüm ' + ver.version;
        const files = [
          { name: 'Lojistik.java', code: ver.lojistik },
          { name: 'Main.java', code: ver.main },
        ];
        const prevVer = i >= 1 && i <= 3 ? N[i - 1] : null;
        cv.setFiles(files, {
          active: 'Lojistik.java',
          prev: prevVer ? { 'Lojistik.java': prevVer.lojistik, 'Main.java': prevVer.main } : null,
        });
        if (i === 4) {
          for (let n = 1; n <= 4; n++) {
            cv.mark('Lojistik.java', { find: 'tur.equals', nth: n }, 'focus', { scroll: false });
            cv.mark('Lojistik.java', { find: '= new ', nth: n }, 'bad', { scroll: false });
          }
        }
        metrics.hidden = i === 4;

        // gereksinim / teşhis kartı
        if (i < 4) {
          const r = REQ[i];
          req.className = 'req-card' + (i > 0 ? ' is-request' : '');
          req.innerHTML = `<div class="req-icon">${r.icon}</div><div><div class="req-who">${r.who}</div><div class="req-text">${md(r.text)}</div></div>`;
        } else {
          req.className = 'req-card is-diagnosis';
          req.innerHTML = `
            <div class="diag-title">Teşhis</div>
            <ul class="problems">
              <li><b>Açık/Kapalı İlkesi (OCP) ihlali:</b> Her yeni tür, çalışan ve test edilmiş [[Lojistik]] sınıfını değiştirmeyi gerektiriyor.</li>
              <li><b>Sıkı bağlılık:</b> [[Lojistik]] tüm somut araç sınıflarını tanıyor (\`new Kamyon()\`, \`new Gemi()\`…).</li>
              <li><b>Tek Sorumluluk (SRP) ihlali:</b> Teslimat planlama ile “hangi aracı üretmeliyim?” kararı aynı metotta.</li>
              <li><b>Dalga etkisi:</b> Metodun imzası değişti, tüm çağıranlar da değişti.</li>
              <li><b>Kırılganlık:</b> \`"dniz"\` gibi bir yazım hatası derleyicide yakalanmaz; sessizce hiçbir şey olmaz.</li>
            </ul>`.replace(/\[\[(\w+)\]\]/g, (m, c) => `<span class="cls rc rc-${FM.roleOf(c)}">${c}</span>`).replace(/`([^`]+)`/g, '<code>$1</code>');
        }
        if (info.animate || i !== prev) DP.flash(req, 'is-pop');

        // metrikler
        Object.keys(M).forEach((key) => {
          const nv = String(VALUES[i][key]);
          if (M[key].textContent !== nv) {
            M[key].textContent = nv;
            if (info.animate) DP.flash(M[key], 'is-bump');
          }
          M[key].classList.toggle('is-bad', VALUES[i][key] >= 3);
        });

        // grafik
        const g = graphHost.querySelector('svg');
        ['kamyon', 'gemi', 'ucak', 'tren'].forEach((key, idx) => {
          const on = idx <= Math.min(i, 3);
          g.querySelector(`[data-n="${key}"]`).classList.toggle('is-on', on);
          g.querySelector(`[data-e="${key}"]`).classList.toggle('is-on', on);
          if (on && idx === i && info.animate) {
            DP.flash(g.querySelector(`[data-e="${key}"]`), 'is-draw');
            DP.flash(g.querySelector(`[data-n="${key}"]`), 'is-pop');
          }
        });
        g.querySelector('[data-n="ghost"]').classList.toggle('is-on', i === 4);
        g.classList.toggle('is-alarm', i === 4);
      },
    });
    return ui.stepApi(stepper, { destroy: () => stepper.destroy() });
  };

  function depGraphSvg() {
    const nodes = [
      { key: 'kamyon', label: 'Kamyon', cy: 40 },
      { key: 'gemi', label: 'Gemi', cy: 104 },
      { key: 'ucak', label: 'Ucak', cy: 168 },
      { key: 'tren', label: 'Tren', cy: 232 },
    ];
    const lx = 168;
    const ly = 136;
    const edges = nodes
      .map(
        (n) => `<g class="dep-edge" data-e="${n.key}">
          <path pathLength="100" d="M${lx} ${ly} C ${lx + 70} ${ly}, ${lx + 62} ${n.cy}, 290 ${n.cy}"/>
          <polygon points="298,${n.cy} 286,${n.cy - 6} 286,${n.cy + 6}"/>
          <text x="${lx + 70}" y="${(ly + n.cy) / 2 + 4}">new</text>
        </g>`
      )
      .join('');
    const vnodes = nodes
      .map(
        (n) => `<g class="dep-node rc rc-5" data-n="${n.key}">
          <rect x="300" y="${n.cy - 22}" width="132" height="44" rx="10"/>
          <text x="366" y="${n.cy + 6}" text-anchor="middle">${n.label}</text>
        </g>`
      )
      .join('');
    return `
      <svg viewBox="0 0 450 300" role="img" aria-label="Lojistik sınıfının somut sınıflara bağımlılıkları">
        ${edges}
        <g class="dep-node is-center rc rc-2"><rect x="16" y="${ly - 26}" width="152" height="52" rx="12"/><text x="92" y="${ly + 6}" text-anchor="middle">Lojistik</text></g>
        ${vnodes}
        <g class="dep-node is-ghost" data-n="ghost"><rect x="300" y="268" width="132" height="30" rx="10"/><text x="366" y="288" text-anchor="middle">Drone? Roket? …</text></g>
      </svg>`;
  }

  // ================================================================== 3. ÇÖZÜM (adım adım yeniden düzenleme)
  FM.scenes.solution = function (root, ctx) {
    const R = FM.refactor;
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-50' });
    const left = ui.panel('Yeniden düzenleme (refactoring)', { cls: 'panel-code' });
    const right = ui.panel('Sınıf diyagramı', { cls: 'panel-side panel-diagram' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cv = new DP.CodeView(left.body, { roleOf: FM.roleOf, special: FM.special });
    const diagHost = h('div', { class: 'diag-host' });
    const recipe = h('ol', { class: 'recipe' });
    right.body.append(h('div', { class: 'recipe-wrap' }, h('div', { class: 'recipe-title' }, 'Dönüşüm tarifi'), recipe), diagHost);
    const RECIPE = ['Ürünler için ortak arayüz çıkar', 'Üretimi tek bir metoda topla', 'O metodu soyut yap', 'Alt sınıflarda override et'];
    RECIPE.forEach((t, i) => recipe.appendChild(h('li', { 'data-i': String(i + 1) }, t)));
    const diagram = new DP.ClassDiagram(diagHost, FM.solutionDiagram(0), { roles: FM.roles, roleTags: false });

    const STEPS = [
      {
        t: 'Başlangıç — Kalıpsız sürüm 2.0',
        x: '[[Lojistik]] hem teslimatı planlıyor hem de `if / else` ile hangi aracı üreteceğine karar veriyor. Dört adımda **Factory Method**’a dönüştüreceğiz.',
        focus: 'Lojistik.java',
      },
      {
        t: 'Adım 1 — Ortak arayüz: TasimaAraci',
        x: 'Tüm araçların ortak sözleşmesini çıkarıyoruz: [[TasimaAraci]] arayüzü. [[Kamyon]] ve [[Gemi]] bu arayüzü gerçekliyor (`implements`). Artık araçlarla tek bir tip üzerinden konuşabiliriz.',
        focus: 'TasimaAraci.java',
      },
      {
        t: 'Adım 2 — Üretimi tek bir metoda topla',
        x: '`new` ifadelerini `aracOlustur(tur)` metoduna taşıdık. `teslimatPlanla()` artık yalnızca arayüzü kullanıyor 👍 ama `if / else` hâlâ [[Lojistik]] içinde 👎 Yeni araç = yine bu sınıfı değiştirmek.',
        focus: 'Lojistik.java',
        mark: 'private TasimaAraci aracOlustur',
      },
      {
        t: 'Adım 3 — Kararı alt sınıflara bırak',
        x: '`aracOlustur()` metodunu **soyut** (`abstract`) yaptık; `tur` parametresi de gitti. `if / else` ve bütün `new` ifadeleri [[Lojistik]] sınıfından kayboldu! Peki araçları kim üretecek?',
        focus: 'Lojistik.java',
        mark: 'protected abstract TasimaAraci aracOlustur',
      },
      {
        t: 'Adım 4 — Her araç için bir somut yaratıcı',
        x: '[[KaraLojistigi]] ve [[DenizLojistigi]] alt sınıfları `aracOlustur()` metodunu override ederek kendi aracını üretiyor. İstemci, hangi lojistiği kullanacağını **tek bir yerde** seçiyor. İşte Factory Method! 🎉',
        focus: 'KaraLojistigi.java',
        mark: 'return new Kamyon();',
      },
      {
        t: 'Sonuç — Bağımlılık yön değiştirdi',
        x: 'Önce: [[Lojistik]] → [[Kamyon]], [[Gemi]] (somut sınıflar). Şimdi: [[Lojistik]] → [[TasimaAraci]] (soyutlama). Somut ürünleri yalnızca somut yaratıcılar tanıyor. Bu, **Bağımlılığı Tersine Çevirme İlkesi**nin (DIP) bir uygulamasıdır.',
        focus: 'Lojistik.java',
        mark: 'TasimaAraci arac = aracOlustur();',
      },
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
        diagram.update(FM.solutionDiagram(ri), { animate: info.animate });
        diagram.clearBadges();
        if (i === 5) {
          diagram.focus({ classes: ['Lojistik', 'TasimaAraci'], edges: ['uses'] });
          diagram.badge('Lojistik', 'yalnızca soyutlamaya bağlı', 'same');
        } else if (i === 1) diagram.badge('TasimaAraci', 'YENİ', 'new');
        else if (i === 4) {
          diagram.badge('KaraLojistigi', 'YENİ', 'new');
          diagram.badge('DenizLojistigi', 'YENİ', 'new');
        }
        DP.$$('li', recipe).forEach((li, k) => {
          li.classList.toggle('is-done', k + 1 < i || (i === 5 && k < 4));
          li.classList.toggle('is-current', k + 1 === i);
        });
      },
    });
    return ui.stepApi(stepper, { destroy: () => stepper.destroy() });
  };

  // ================================================================== 4. YAPI (UML rolleri)
  const ROLE_TEXT = {
    creator: 'Fabrika metodunu <b>bildirir</b> ve ürünü kullanan iş mantığını içerir. Somut ürünleri tanımaz.',
    concreteCreator: 'Fabrika metodunu <b>override</b> eder ve somut ürünü oluşturur.',
    product: 'Fabrika metodunun döndürdüğü nesnelerin <b>ortak arayüzü</b>.',
    concreteProduct: 'Ürün arayüzünün <b>somut gerçekleştirimi</b>.',
    client: 'Yaratıcıyı soyut tip üzerinden kullanan kod.',
  };

  function classInfo(id) {
    const vByCreator = {};
    const vByProduct = {};
    FM.variantOrder.forEach((k) => {
      vByCreator[FM.variants[k].creator] = FM.variants[k];
      vByProduct[FM.variants[k].product] = FM.variants[k];
    });
    if (id === 'Lojistik')
      return {
        role: 'creator',
        code: FM.code.Lojistik,
        points: ['Fabrika metodunu (`aracOlustur`) **bildirir**: `protected abstract`.', 'İş mantığında (`teslimatPlanla`) fabrika metodunu **kullanır**.', 'Somut ürünleri tanımaz; yalnızca [[TasimaAraci]] ile çalışır.'],
      };
    if (id === 'TasimaAraci')
      return { role: 'product', code: FM.code.TasimaAraci, points: ['Fabrika metodunun **dönüş tipi**.', 'Tüm araçların ortak sözleşmesi: `teslimEt(yuk)`.'] };
    if (vByCreator[id]) {
      const v = vByCreator[id];
      return { role: 'concreteCreator', code: FM.code.creator(v), points: [`[[Lojistik]] sınıfını genişletir (\`extends\`).`, `Fabrika metodunu **override** eder: \`return new ${v.product}();\``, 'Kalıpta somut ürün adını bilen **tek** yer.'] };
    }
    if (vByProduct[id]) {
      const v = vByProduct[id];
      return { role: 'concreteProduct', code: FM.code.product(v), points: ['[[TasimaAraci]] arayüzünü **gerçekler** (`implements`).', `\`teslimEt()\` işini ${v.yol} yapar.`] };
    }
    return { ghost: true, points: ['**Genişleme noktası.** Yeni bir taşıma türü için buraya yeni bir alt sınıf yazılır; mevcut sınıfların hiçbiri değişmez (bkz. *Genişlet* sahnesi).'] };
  }

  FM.scenes.structure = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split' });
    const toolbar = h('div', { class: 'panel-tools' });
    const body = h('div', { class: 'scene-body cols-64' });
    const left = ui.panel('UML sınıf diyagramı', { cls: 'panel-diagram', extra: toolbar });
    const right = ui.panel('Rol kartı <span class="panel-sub">· bir sınıfa tıklayın</span>', { cls: 'panel-side' });
    body.append(left.el, right.el);
    el.append(body);
    root.appendChild(el);

    const diagHost = h('div', { class: 'diag-host' });
    left.body.append(diagHost, kit.umlLegend());
    const hava = !!ctx.state.havaUnlocked;
    const diagram = new DP.ClassDiagram(diagHost, FM.diagram({ ghosts: !hava, hava }), {
      roles: FM.roles,
      onSelect: (id) => {
        showInfo(id);
        diagram.focus({ classes: [id] });
        diagram.select(id);
      },
    });

    const modeSeg = ui.seg(
      [
        { v: 'concrete', label: 'Somut örnek (Lojistik)' },
        { v: 'generic', label: 'Genel yapı (GoF)' },
      ],
      'concrete',
      (v) => diagram.setMode(v),
      { label: 'Adlandırma' }
    );
    toolbar.append(modeSeg.el, ui.toggle('Rol etiketleri', true, (on) => diagram.setRoleTags(on)));

    const infoTop = h('div', { class: 'info-card' });
    const infoCode = h('div', { class: 'info-code' });
    right.body.append(infoTop, infoCode);
    let cv = null;

    function showInfo(id, mark) {
      const info = classInfo(id);
      infoCode.innerHTML = '';
      cv = null;
      if (info.ghost) {
        infoTop.innerHTML = `<div class="info-name">Genişleme yeri</div><ul class="info-points">${info.points.map((p) => `<li>${md(p)}</li>`).join('')}</ul>`;
        return;
      }
      const r = FM.roles[info.role];
      infoTop.innerHTML = `
        <div class="info-role rc rc-${r.color}"><span class="info-dot"></span><b>${r.en}</b> · ${r.tr}</div>
        <div class="info-name rc rc-${r.color}">${id}</div>
        <p class="info-desc">${ROLE_TEXT[info.role]}</p>
        <ul class="info-points">${info.points.map((p) => `<li>${md(p)}</li>`).join('')}</ul>`;
      cv = new DP.CodeView(infoCode, { files: [{ name: id + '.java', code: info.code }], roleOf: FM.roleOf, special: FM.special, compact: true });
      if (mark) cv.mark(id + '.java', mark, 'focus');
      DP.flash(infoTop, 'is-pop');
    }

    function showOverview() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">Dört rol, iki hiyerarşi</div>
        <div class="role-list">
          ${['creator', 'concreteCreator', 'product', 'concreteProduct']
            .map((k) => `<div class="role-row rc rc-${FM.roles[k].color}"><span class="info-dot"></span><div><b>${FM.roles[k].en}</b> · ${FM.roles[k].tr}<div class="role-desc">${ROLE_TEXT[k]}</div></div></div>`)
            .join('')}
        </div>
        <p class="info-desc">Renkler tüm sahnelerde aynı rolleri gösterir: diyagramda, kodda ve animasyonda.</p>`;
    }

    const STEPS = [
      { t: 'Genel bakış', x: 'Factory Method **dört rolden** oluşur ve iki paralel sınıf hiyerarşisi kurar: yaratıcılar (solda) ve ürünler (sağda). Üstteki **Genel yapı (GoF)** düğmesiyle ders kitaplarındaki adlandırmayı görebilirsiniz.', info: null },
      { t: 'Product — Ürün', x: 'Fabrika metodunun döndürdüğü nesnelerin **ortak arayüzü**. [[Lojistik]] araçları yalnızca bu tip üzerinden tanır.', info: 'TasimaAraci', focus: { classes: ['TasimaAraci'] } },
      { t: 'ConcreteProduct — Somut Ürün', x: 'Arayüzü gerçekleyen sınıflar. Her biri `teslimEt()` işini kendi yöntemiyle yapar. UML’de **kesik çizgi + boş üçgen** = gerçekleme (`implements`).', info: 'Kamyon', focus: { classes: ['Kamyon', 'Gemi'], edges: ['real-kamyon', 'real-gemi'] } },
      { t: 'Creator — Yaratıcı', x: 'Fabrika metodunu bildirir ve iş mantığında kullanır. Somut ürünleri **tanımaz**; tek bağımlılığı [[TasimaAraci]] arayüzüdür (kesik çizgili ok = bağımlılık).', info: 'Lojistik', focus: { classes: ['Lojistik'], edges: ['uses'] } },
      { t: 'Fabrika metodu', x: '`protected abstract TasimaAraci aracOlustur()` — üretim kararını alt sınıflara devreden “kanca”. Diyagramda **italik** = soyut, **#** = protected. Dönüş tipi soyut [[TasimaAraci]] arayüzüdür.', info: 'Lojistik', mark: 'protected abstract TasimaAraci aracOlustur', focus: { members: [['Lojistik', 'aracOlustur'], ['KaraLojistigi', 'aracOlustur'], ['DenizLojistigi', 'aracOlustur']] } },
      { t: 'ConcreteCreator — Somut Yaratıcı', x: 'Fabrika metodunu override eder ve somut ürünü üretir. Kalıptaki **tek** `new` buradadır. Düz çizgi + boş üçgen = kalıtım (`extends`); «create» oku = “oluşturur”.', info: 'KaraLojistigi', mark: 'return new Kamyon();', focus: { classes: ['KaraLojistigi', 'DenizLojistigi'], edges: ['gen-kara', 'gen-deniz', 'cr-kara', 'cr-deniz'] } },
      hava
        ? { t: 'Paralel hiyerarşiler', x: 'Her somut yaratıcının bir somut ürün karşılığı var. Hava taşımacılığı, iki hiyerarşiye **birer sınıf eklenerek** sisteme katıldı — mevcut sınıfların hiçbiri değişmedi.', info: 'HavaLojistigi', focus: { classes: ['HavaLojistigi', 'Ucak'], edges: ['gen-hava', 'real-ucak', 'cr-hava'] } }
        : { t: 'Paralel hiyerarşiler', x: 'Her somut yaratıcının bir somut ürün karşılığı var. Yeni bir tür eklemek için iki hiyerarşiye **birer sınıf eklemek** yeter (kesik çizgili kutular) — mevcut sınıfların hiçbiri değişmez.', info: 'ghostC', focus: { classes: ['ghostC', 'ghostP'], edges: ['gen-ghost', 'real-ghost'] } },
    ];

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: () => 5600,
      onChange: (i) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        diagram.select(null);
        if (s.focus) diagram.focus(s.focus);
        else diagram.clearFocus();
        if (s.info) showInfo(s.info, s.mark);
        else showOverview();
      },
    });
    return ui.stepApi(stepper, { destroy: () => stepper.destroy() });
  };

})();
