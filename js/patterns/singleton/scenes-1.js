/*
 * Singleton — sahneler (1/3): Giriş, Sorun, Çözüm, Yapı
 */
(function () {
  'use strict';
  const SG = DP.sg;
  const { h } = DP;
  const kit = DP.kit;
  const md = (t) => DP.md(t, SG.roleOf);
  SG.md = md;
  SG.scenes = SG.scenes || {};
  const ui = (SG.ui = {
    foot: (root) => kit.foot(root, SG.roleOf),
    roleChip: (key) => kit.roleChip(SG.roles, key),
  });
  const C = SG.cargo;

  /** Konsol: satırlar {t, err, ok, dup}. */
  SG.renderConsole = function (el, cmd, lines, o) {
    o = o || {};
    el.innerHTML = '<div class="console-head"><span></span><span></span><span></span> Konsol</div>';
    if (cmd) el.appendChild(h('div', { class: 'console-line is-cmd' }, cmd));
    lines.forEach((l, i) => {
      const cls = ['console-line'];
      if (l.err) cls.push('is-err');
      if (l.ok) cls.push('is-okline');
      if (l.dup) cls.push('is-dup');
      if (l.dim) cls.push('is-dim');
      if (o.animateFrom != null && i >= o.animateFrom) cls.push('is-new');
      el.appendChild(h('div', { class: cls.join(' ') }, l.t));
    });
    if (o.cursor) el.appendChild(h('div', { class: 'console-cursor' }));
    el.scrollTop = el.scrollHeight;
  };

  // ================================================================== 1. GİRİŞ
  SG.scenes.intro = function (root, ctx) {
    const el = h('div', { class: 'scene scene-intro' });
    el.innerHTML = `
      <div class="intro-grid">
        <section class="intro-main">
          <div class="chips">
            <span class="chip chip-cat">Yaratımsal · Creational</span>
            <span class="chip">GoF · 1994</span>
            <span class="chip">Nesne düzeyi kalıp</span>
          </div>
          <h1 class="intro-title">Singleton</h1>
          <div class="intro-sub">Tekil Nesne <span>· “bu sınıftan yalnızca bir tane”</span></div>
          <blockquote class="intent">
            <div class="intent-label">Amaç</div>
            <p>Bir sınıfın yalnızca <b>tek bir örneği</b> olmasını garanti et ve bu örneğe <b>global bir erişim noktası</b> sağla.</p>
            <footer>— Gamma, Helm, Johnson, Vlissides (GoF), <i>Design Patterns</i>, 1994</footer>
          </blockquote>
        </section>
        <section class="intro-hero" aria-label="Kalıbın kısa animasyonu">${heroSvg()}</section>
      </div>
      <div class="intro-cards">
        <article class="card">
          <h3><span class="card-ic">🎫</span> Günlük hayattan</h3>
          <p>Bankadaki <b>sıramatiği</b> düşünün: bütün gişeler numarayı <b>aynı makineden</b> alır.
          Her gişe kendi makinesini kursaydı iki müşteri aynı anda <b>A-001</b> numarasını alırdı.
          Singleton der ki: <i>bu sınıftan tek bir tane olsun ve herkes ona aynı yerden ulaşsın.</i></p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🤝</span> İki söz</h3>
          <p><b>1 · Tek örnek:</b> sınıf, kendisinden ikinci bir nesne oluşturulmasına <b>izin vermez</b>.</p>
          <p><b>2 · Global erişim noktası:</b> herkes nesneye aynı kapıdan ulaşır:
          <code class="tk-fm">TakipNoUretici.getInstance()</code></p>
          <p class="muted">Aynı lojistik dünyasında devam ediyoruz: bu kez her gönderiye <b>takip numarası</b> veriyoruz.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🎯</span> Bu derste</h3>
          <ol class="objectives">
            <li>Tek olması gereken bir nesne <b>çoğalınca</b> ne olduğunu görmek</li>
            <li>Üç malzemeyi tanımak: ${['ctor', 'instance', 'access'].map((r) => ui.roleChip(r)).join(' ')}</li>
            <li>Tembel (<i>lazy</i>) oluşturmayı adım adım izlemek</li>
            <li>İki thread’in <b>yarışını</b> görmek ve altı çözümü karşılaştırmak</li>
            <li>Singleton’ı kırma yollarını ve <b>eleştirilerini</b> (test, bağımlılık enjeksiyonu) tartışmak</li>
          </ol>
        </article>
      </div>
      <div class="intro-cta">
        <button class="btn btn-primary btn-lg" type="button" data-go>Sorunla başlayalım →</button>
        <a class="btn btn-ghost" href="#/abstract-factory">← Önceki kalıp: Abstract Factory</a>
        <span class="hint">ya da klavyede <kbd>→</kbd> tuşuna basın</span>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-go]').addEventListener('click', () => ctx.goScene('sorun'));

    // Sıramatik: tek makine, iki gişe; numaralar sırayla ve asla çakışmadan dağıtılır.
    const svg = el.querySelector('.hero-svg');
    const cnt = svg.querySelector('[data-h=count]');
    const tk = svg.querySelector('.h-ticket');
    const tkText = svg.querySelector('[data-h=ticket]');
    const last = { left: svg.querySelector('[data-h=left]'), right: svg.querySelector('[data-h=right]') };
    let n = 1000;
    const tick = () => {
      n++;
      const side = n % 2 ? 'left' : 'right';
      cnt.textContent = String(n);
      tkText.textContent = 'KRG-' + n;
      tk.classList.remove('to-left', 'to-right');
      void tk.getBoundingClientRect();
      tk.classList.add(side === 'left' ? 'to-left' : 'to-right');
      last[side].textContent = 'KRG-' + n;
      DP.flash(cnt, 'is-tick');
      if (n >= 1099) n = 1000;
    };
    tick();
    const timer = setInterval(tick, 2200);
    return { destroy: () => clearInterval(timer) };
  };

  function heroSvg() {
    const desk = (x, label, key) => `
      <g class="h-desk" transform="translate(${x},0)">
        <circle class="ck-head" cx="60" cy="226" r="15"/><path class="ck-body" d="M36 272 Q36 242 60 242 Q84 242 84 272 Z"/>
        <rect class="dk-top" x="0" y="270" width="120" height="9" rx="3"/>
        <rect class="dk-front" x="6" y="279" width="108" height="44" rx="4"/>
        <text class="dk-sign" x="60" y="299" text-anchor="middle">${label}</text>
        <text class="h-last" x="60" y="316" text-anchor="middle" data-h="${key}">—</text>
      </g>`;
    return `
    <svg class="hero-svg sg-hero" viewBox="0 0 560 360" role="img" aria-label="Tek numara makinesi iki masaya sırayla takip numarası veriyor">
      <rect class="of-floor" x="0" y="323" width="560" height="37"/>
      ${desk(16, 'SİPARİŞ', 'left')}
      ${desk(424, 'İADE', 'right')}
      <g class="mach is-on" transform="translate(280,323)">
        <g class="mach-in">
          <rect class="mc-body" x="-46" y="-196" width="92" height="188" rx="14"/>
          <rect class="mc-screen" x="-36" y="-182" width="72" height="36" rx="5"/>
          <text class="mc-count" x="0" y="-155" text-anchor="middle" data-h="count">1000</text>
          <text class="mc-cap" x="0" y="-128" text-anchor="middle">TAKİP NO</text>
          <rect class="mc-slot" x="-28" y="-114" width="56" height="7" rx="3.5"/>
          <circle class="mc-btn" cx="0" cy="-66" r="12"/>
          <rect class="mc-base" x="-52" y="-10" width="104" height="10" rx="3"/>
        </g>
      </g>
      <g class="h-ticket"><rect x="-34" y="-12" width="68" height="24" rx="3"/><text x="0" y="5" text-anchor="middle" data-h="ticket">KRG-1001</text></g>
      <text class="h-caption" x="280" y="40" text-anchor="middle">TEK makine → numaralar asla çakışmaz</text>
      <text class="h-sub" x="280" y="62" text-anchor="middle">TakipNoUretici.getInstance()</text>
    </svg>`;
  }

  // ================================================================== 2. SORUN
  const B1 = { no: 'KRG-1001', cargo: C.s1, src: 'Sipariş' };
  const B2 = { no: 'KRG-1002', cargo: C.s2, src: 'Sipariş' };

  SG.scenes.problem = function (root, ctx) {
    const N = SG.naive;
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-46' });
    const left = kit.panel('Kalıpsız kod · <span class="ver"></span>', { cls: 'panel-code sg-left' });
    const viewSeg = kit.seg(
      [
        { v: 'stage', label: 'Sahne' },
        { v: 'mem', label: 'Bellek' },
      ],
      'stage',
      (v) => setView(v)
    );
    const right = kit.panel('Takip ofisi', { cls: 'panel-side sg-right', extra: h('div', { class: 'panel-tools' }, viewSeg.el) });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'sg-cv' });
    const consoleEl = h('div', { class: 'console sg-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: SG.roleOf, special: SG.special });

    const viewHost = h('div', { class: 'sg-view' });
    const stageHost = h('div', { class: 'sg-view-in' });
    const memHost = h('div', { class: 'sg-view-in', hidden: true });
    viewHost.append(stageHost, memHost);
    const extra = h('div', { class: 'sg-extra' });
    right.body.append(viewHost, extra);
    const stage = new SG.Stage(stageHost);
    const mem = new SG.MemoryView(memHost);
    let view = 'stage';

    function setView(v) {
      view = v;
      viewSeg.set(v);
      stageHost.hidden = v !== 'stage';
      memHost.hidden = v !== 'mem';
    }

    const memFor = (vi, bad) =>
      SG.memSpec({
        mode: 'problem',
        main: vi ? { siparis: 1, iade: 1 } : { siparis: 1 },
        services: vi ? ['sip', 'iade'] : ['sip'],
        svcRef: { sip: 'g1', iade: 'g2' },
        gens: vi ? { g1: { sayac: 1002 }, g2: { sayac: bad ? 1001 : 1000, state: bad ? 'bad' : null, badge: bad ? 'KRG-1001 ikinci kez!' : null } } : { g1: { sayac: 1002 } },
      });

    const STEPS = [
      {
        t: 'Sürüm 1.0 — Tek masa, tek üretici',
        x: 'Sipariş masası ([[SiparisServisi]]) kendi [[TakipNoUretici]] nesnesini `new` ile oluşturuyor ve numaraları ondan alıyor. Tek masa varken her şey yolunda: **KRG-1001**, **KRG-1002**.',
        vi: 0,
        stage: { mode: 'problem', desks: { sip: true }, hide: ['iade'], machines: { a: { count: 1002 } }, pkg: { sip: { cargo: C.s2, no: 'KRG-1002' } }, board: [B1, B2] },
        out: { lines: SG.naiveOutput(0) },
      },
      {
        t: 'Sürüm 2.0 — İade masası açıldı',
        x: 'Yeni bir geliştirici [[IadeServisi]]’ni yazdı; o da kendi üreticisini `new` ile oluşturdu. Konsola bakın: **iki kez** “yeni nesne oluşturuldu”. İkinci makinenin sayacı da **1000**’den başlıyor…',
        vi: 1,
        mark: ['IadeServisi.java', 'new TakipNoUretici()'],
        stage: { mode: 'problem', desks: { sip: true, iade: true }, machines: { a: { count: 1002 }, b: { count: 1000 } }, pop: 'b', pkg: { sip: { cargo: C.s2, no: 'KRG-1002' } }, board: [B1, B2] },
        out: { lines: SG.naiveOutput(1).slice(0, 4), from: 1 },
      },
      {
        t: 'Çakışma!',
        x: 'İade masasının makinesi de **KRG-1001** verdi. Aynı takip numarası iki farklı gönderide! Derleyici tek kelime etmedi; hata ancak müşteri sorgulayınca ortaya çıkıyor.',
        vi: 1,
        mark: ['IadeServisi.java', 'uretici.yeniNumara()'],
        stage: {
          mode: 'problem', desks: { sip: true, iade: true }, active: 'iade', machines: { a: { count: 1002 }, b: { count: 1001 } }, tick: 'b',
          call: { from: 'iade', to: 'b', label: 'yeniNumara()' }, ticket: { from: 'b', to: 'iade', no: 'KRG-1001', bad: true },
          pkg: { sip: { cargo: C.s2, no: 'KRG-1002' }, iade: { cargo: C.r1, no: 'KRG-1001', bad: true } },
          board: [Object.assign({}, B1, { bad: true }), B2, { no: 'KRG-1001', cargo: C.r1, src: 'İade', bad: true }], clash: true,
          bubble: { at: 'left', text: 'Müşteri **KRG-1001**’i sorguluyor… **iki gönderi** çıkıyor: kayısı mı, hasarlı koli mi?', tone: 'bad' },
        },
        out: { lines: SG.naiveOutput(1), from: 4 },
      },
      {
        t: 'Kök neden: iki nesne, iki sayaç',
        x: 'Bellekte **iki** [[TakipNoUretici]] nesnesi var; her birinin **kendi** sayacı. `new` her çağrıldığında yeni bir nesne doğar ve sınıf bunu engelleyemez: kurucusu **public**.',
        vi: 1,
        view: 'mem',
        mark: ['TakipNoUretici.java', 'public TakipNoUretici()'],
        mem: memFor(1, true),
        out: { lines: SG.naiveOutput(1) },
      },
      {
        t: 'Teşhis — Neye ihtiyacımız var?',
        x: 'İki şey: (1) sınıf **ikinci bir nesneye izin vermesin**, (2) herkes **aynı nesneye** kolayca ulaşabilsin. Bunlar Singleton’ın iki sözü.',
        vi: 1,
        view: 'mem',
        mem: memFor(1, true),
        diag: true,
        out: { lines: SG.naiveOutput(1) },
      },
    ];

    const stageOf = (s) => s.stage || STEPS[2].stage;
    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: () => 5600,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        const ps = prev >= 0 ? STEPS[prev] : null;
        foot.set(i, STEPS.length, s.t, s.x);
        const ver = N[s.vi];
        left.head.querySelector('.ver').textContent = 'sürüm ' + ver.version;
        const files = Object.keys(ver.files).map((k) => ({ name: k + '.java', code: ver.files[k] }));
        const prevMap = {};
        Object.keys(N[0].files).forEach((k) => (prevMap[k + '.java'] = N[0].files[k]));
        cv.setFiles(files, { active: s.mark ? s.mark[0] : 'SiparisServisi.java', prev: i === 1 ? prevMap : null });
        if (s.mark) cv.mark(s.mark[0], s.mark[1], i >= 2 ? 'bad' : 'focus');
        else cv.mark('SiparisServisi.java', 'new TakipNoUretici()', 'focus', { scroll: false });

        SG.renderConsole(consoleEl, '$ java Main', s.out.lines, { animateFrom: info.animate && s.out.from != null ? s.out.from : null });

        stage.render(stageOf(s), ps ? stageOf(ps) : null, info);
        mem.update(s.mem || memFor(s.vi, i >= 2), { animate: info.animate });
        if (s.view || (ps && ps.view)) setView(s.view || 'stage');

        if (s.diag) {
          extra.innerHTML = `
            <div class="req-card is-diagnosis">
              <div class="diag-title">Teşhis</div>
              <ul class="problems">
                <li>${md('**Tek olması gereken nesne çoğaldı:** her `new TakipNoUretici()` sıfırdan bir sayaç başlatıyor.')}</li>
                <li>${md('**Sınıf savunmasız:** kurucu `public`; kaç nesne oluşturulacağına istemciler karar veriyor.')}</li>
                <li>${md('**Ortak erişim noktası yok:** iki masanın aynı nesneyi paylaşmasının kolay bir yolu yok.')}</li>
                <li>${md('**Hata sessiz:** derleyici uyarmıyor; sorun çalışma zamanında, müşteride çıkıyor.')}</li>
              </ul>
            </div>
            <div class="sg-aside">${md('💬 **“Sayacı `static` yapsak?”** Numaralar çakışmaz ama **nesneler yine çoğalır**: her biri ayrı bağlantı, ayrı önbellek tutabilir ve kaç tane olduğunu yine kimse denetlemez. Singleton hem durumu hem **nesneyi** teke indirir.')}</div>`;
          if (info.animate) DP.flash(extra, 'is-pop');
        } else extra.innerHTML = '';
      },
    });
    return kit.stepApi(stepper, {
      destroy: () => {
        stepper.destroy();
        stage.destroy();
      },
    });
  };

  // ================================================================== 3. ÇÖZÜM
  SG.scenes.solution = function (root, ctx) {
    const R = SG.refactor;
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-diag' });
    const left = kit.panel('Yeniden düzenleme (refactoring)', { cls: 'panel-code sg-left' });
    const right = kit.panel('Sınıf diyagramı', { cls: 'panel-side panel-diagram' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'sg-cv' });
    const consoleEl = h('div', { class: 'console sg-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: SG.roleOf, special: SG.special });
    const diagHost = h('div', { class: 'diag-host' });
    const recipe = h('ol', { class: 'recipe' });
    right.body.append(h('div', { class: 'recipe-wrap' }, h('div', { class: 'recipe-title' }, 'Dönüşüm tarifi'), recipe), diagHost, kit.umlLegend({ association: true, fmLabel: 'getInstance(): erişim noktası' }));
    ['Kurucuyu private yap', 'Tek örnek için static alan', 'static getInstance() ekle', 'İstemciler getInstance() kullanır'].forEach((t, i) => recipe.appendChild(h('li', { 'data-i': String(i + 1) }, t)));
    const diagram = new DP.ClassDiagram(diagHost, SG.solutionDiagram(0), { roles: SG.roles, roleTags: false });

    const ERR = SG.compileErrors();
    const STEPS = [
      { t: 'Başlangıç — Kalıpsız sürüm 2.0', x: 'İki istemci üreticiyi `new` ile **kendisi** oluşturuyor; sonuç: iki nesne, aynı numara. Dört adımda **Singleton**’a dönüştüreceğiz.', focus: 'SiparisServisi.java', mark: 'new TakipNoUretici()', run: 'naive' },
      { t: 'Adım 1 — Kapıyı kilitle: private kurucu', x: 'Kurucuyu `private` yaptık. Artık sınıfın **dışından** kimse `new TakipNoUretici()` diyemez — derleyici iki istemciyi hemen yakaladı. Bu kırmızı yazı iyi haber: kural artık **derleyicinin** güvencesinde.', focus: 'TakipNoUretici.java', mark: 'private TakipNoUretici()', run: 'err' },
      { t: 'Adım 2 — Tek örneğin yeri: static alan', x: 'Sınıf tek nesnesini kendi içinde saklayacak: `private static TakipNoUretici ornek`. **static** = alan nesneye değil **sınıfa** aittir; programda tek kopyası vardır. UML’de static üyelerin **altı çizilir**.', focus: 'TakipNoUretici.java', mark: 'private static TakipNoUretici ornek;', run: 'err' },
      { t: 'Adım 3 — Global erişim noktası', x: '`public static getInstance()`: nesne yoksa **ilk çağrıda** oluşturur (tembel / *lazy*), varsa hep **aynısını** döndürür. Private kurucuyu çağırabilen tek yer burası. İstemciler hâlâ `new` dediği için derleyici kızgın…', focus: 'TakipNoUretici.java', mark: ['public static TakipNoUretici getInstance()', 'return ornek;'], run: 'err' },
      { t: 'Adım 4 — İstemciler getInstance() ile ister', x: 'İstemciler artık `new` demiyor: `TakipNoUretici.getInstance().yeniNumara()`. Derleme temiz; numaralar KRG-1001, KRG-1002, **KRG-1003**. Çakışma yok!', focus: 'SiparisServisi.java', mark: 'TakipNoUretici.getInstance()', run: 'ok' },
      { t: 'Sonuç — Üç malzeme', x: 'Singleton’ın tarifi üç parça: **private kurucu** (kimse `new` diyemez) + **private static alan** (tek nesnenin yeri) + **public static getInstance()** (herkesin kapısı).', focus: 'TakipNoUretici.java', marks: ['private static TakipNoUretici ornek;', 'private TakipNoUretici()', 'public static TakipNoUretici getInstance()'], run: 'ok' },
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
      delayOf: () => 6200,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        const ri = Math.min(i, R.length - 1);
        const showDiff = i >= 1 && i <= R.length - 1;
        cv.setFiles(filesAt(ri), { active: s.focus, prev: showDiff ? asMap(ri - 1) : null });
        if (s.mark) cv.mark(s.focus, s.mark, 'focus');
        (s.marks || []).forEach((m, k) => cv.mark(s.focus, m, 'focus', { scroll: k === 0 }));

        if (s.run === 'naive') SG.renderConsole(consoleEl, '$ java Main', SG.naiveOutput(1));
        else if (s.run === 'err') SG.renderConsole(consoleEl, '$ javac *.java', ERR, { animateFrom: info.animate && i === 1 ? 0 : null });
        else SG.renderConsole(consoleEl, '$ javac *.java && java Main', SG.output.map((t) => ({ t })), { animateFrom: info.animate && i === 4 ? 0 : null });

        diagram.update(SG.solutionDiagram(ri), { animate: info.animate });
        diagram.clearBadges();
        if (i >= 1 && i <= 3) {
          diagram.badge('SiparisServisi', '✗ derlenmez', 'bad');
          diagram.badge('IadeServisi', '✗ derlenmez', 'bad');
        }
        if (i === 1) diagram.focus({ members: [['TakipNoUretici', 'ctor']], edges: ['new-sip', 'new-iade'] });
        if (i === 2) {
          diagram.badge('TakipNoUretici', 'static alan', 'new');
          diagram.focus({ members: [['TakipNoUretici', 'ornek']], edges: ['self'] });
        }
        if (i === 3) {
          diagram.badge('TakipNoUretici', 'YENİ: getInstance()', 'new');
          diagram.focus({ members: [['TakipNoUretici', 'getInstance']], edges: ['self'] });
        }
        if (i === 4) {
          diagram.badge('TakipNoUretici', 'tek nesne', 'same');
          diagram.focus({ classes: ['SiparisServisi', 'IadeServisi'], edges: ['uses-sip', 'uses-iade'] });
        }
        if (i === 5) diagram.focus({ members: [['TakipNoUretici', 'ornek'], ['TakipNoUretici', 'ctor'], ['TakipNoUretici', 'getInstance']] });
        DP.$$('li', recipe).forEach((li, k) => {
          li.classList.toggle('is-done', k + 1 < i || (i === 5 && k < 4));
          li.classList.toggle('is-current', k + 1 === i);
        });
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };

  // ================================================================== 4. YAPI (UML ↔ bellek)
  const PART = {
    singleton: { title: 'TakipNoUretici', text: 'Kendi tek örneğini <b>kendisi</b> yönetir: oluşturur, saklar ve dağıtır.', points: ['Hem **tekliği** garanti eder hem de asıl işini yapar (`yeniNumara()`).', 'Dışarıdan `new` ile oluşturulamaz.', 'GoF adı: **Singleton**.'], mark: 'public class TakipNoUretici' },
    instance: { title: 'ornek (static)', text: 'Tek nesnenin saklandığı yer. <b>static</b> olduğu için nesneye değil sınıfa aittir.', points: ['Programda **tek kopyası** vardır; ilk başta `null`.', 'UML’de static üyelerin **altı çizilir**; kendi tipinde bir alan olduğu için diyagramda sınıf **kendini** gösterir.', 'GoF adı: **uniqueInstance**.'], mark: 'private static TakipNoUretici ornek;' },
    ctor: { title: 'private TakipNoUretici()', text: '<code>new</code>’e kapalı kapı: kurucuyu yalnızca sınıfın içi çağırabilir.', points: ['Sınıf dışındaki her `new TakipNoUretici()` **derleme hatası** verir.', 'Kuralı derleyici korur — disipline güvenmek gerekmez.', '(Yansıma ile bu kapı zorlanabilir: **Kırmak** sahnesi.)'], mark: 'private TakipNoUretici()' },
    access: { title: 'getInstance()', text: 'Herkesin kullandığı <b>tek kapı</b>: global erişim noktası.', points: ['**static**: elinizde nesne yokken sınıf adıyla çağrılır.', 'Nesne yoksa ilk çağrıda oluşturur (**tembel**), varsa hep aynısını döndürür.', 'Çok thread’li programlarda dikkat: **Thread Yarışı** sahnesi.'], mark: 'public static TakipNoUretici getInstance()' },
    client: { title: 'SiparisServisi · IadeServisi', text: 'Üreticiyi oluşturmaz; yalnızca <code>getInstance()</code> ile ister.', points: ['İstemci sayısı ne olursa olsun nesne **tek**.', 'Bağımlılık kodun içinde gizli: imzada görünmez (**Eleştiri** sahnesi).'], mark: 'TakipNoUretici.getInstance()', file: 'SiparisServisi' },
  };

  function structMem() {
    const ROW = SG.MEM_ROW;
    const boxes = [
      { id: 'f-sip', kind: 'frame', x: 26, y: 46, w: 268, title: 'siparisAl()', sub: 'SiparisServisi', tone: 1, rows: [{ id: 'gi', k: 'getInstance()', ref: 'g1', tone: 6 }] },
      { id: 'f-iade', kind: 'frame', x: 26, y: 46 + 30 + ROW + 26, w: 268, title: 'iadeAl()', sub: 'IadeServisi', tone: 1, rows: [{ id: 'gi', k: 'getInstance()', ref: 'g1', tone: 6 }] },
      { id: 'f-main', kind: 'frame', x: 26, y: 46 + 2 * (30 + ROW + 26), w: 268, title: 'main()', sub: 'Main', tone: 1, rows: [{ id: 'a', k: 'a', ref: 'g1', tone: 2 }, { id: 'b', k: 'b', ref: 'g1', tone: 2 }] },
      { id: 'st', kind: 'static', x: 26, y: 382, w: 268, title: 'TakipNoUretici', sub: 'sınıf', tone: 2, rows: [{ id: 'ornek', k: 'static ornek', ref: 'g1', tone: 3 }] },
      { id: 'g1', kind: 'obj', x: 640, y: 214, w: 280, title: 'TakipNoUretici', sub: 'TEK nesne', tone: 2, badge: '5 referans · 1 nesne', rows: [{ id: 'sayac', k: 'sayac', v: '1003' }] },
    ];
    return { view: [0, 0, 1000, 520], regions: SG.memRegions, boxes };
  }

  SG.scenes.structure = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split' });
    const tools = h('div', { class: 'panel-tools' });
    const body = h('div', { class: 'scene-body cols-64' });
    const left = kit.panel('Yapı', { cls: 'panel-diagram', extra: tools });
    const right = kit.panel('Parça kartı <span class="panel-sub">· bir sınıfa tıklayın</span>', { cls: 'panel-side' });
    body.append(left.el, right.el);
    el.append(body);
    root.appendChild(el);

    const diagHost = h('div', { class: 'diag-host' });
    const memHost = h('div', { class: 'diag-host sg-memhost', hidden: true });
    const legend = kit.umlLegend({ association: true, fmLabel: 'getInstance(): erişim noktası' });
    legend.insertAdjacentHTML('beforeend', '<span><u>altı çizili</u> = static</span>');
    left.body.append(diagHost, memHost, legend);
    const diagram = new DP.ClassDiagram(diagHost, SG.diagram({ note: true }), {
      roles: SG.roles,
      onSelect: (id) => {
        showInfo(id === 'TakipNoUretici' ? 'singleton' : 'client');
        diagram.focus({ classes: [id] });
        diagram.select(id);
      },
    });
    const mem = new SG.MemoryView(memHost);
    mem.update(structMem(), { animate: false });

    const viewSeg = kit.seg(
      [
        { v: 'uml', label: 'UML' },
        { v: 'mem', label: 'Bellek' },
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
      viewSeg.set(v);
      diagHost.hidden = v !== 'uml';
      legend.hidden = v !== 'uml';
      memHost.hidden = v !== 'mem';
      modeSeg.el.hidden = v !== 'uml';
      tagToggle.hidden = v !== 'uml';
    }

    const infoTop = h('div', { class: 'info-card' });
    const infoCode = h('div', { class: 'info-code' });
    right.body.append(infoTop, infoCode);

    function showInfo(key) {
      const p = PART[key];
      const r = SG.roles[key];
      infoTop.innerHTML = `
        <div class="info-role rc rc-${r.color}"><span class="info-dot"></span><b>${r.en}</b> · ${r.tr}</div>
        <div class="info-name rc rc-${r.color}">${DP.esc(p.title)}</div>
        <p class="info-desc">${p.text}</p>
        <ul class="info-points">${p.points.map((x) => `<li>${md(x)}</li>`).join('')}</ul>`;
      infoCode.innerHTML = '';
      const file = (p.file || 'TakipNoUretici') + '.java';
      const cv = new DP.CodeView(infoCode, { files: [{ name: file, code: SG.code[p.file || 'TakipNoUretici'] }], roleOf: SG.roleOf, special: SG.special, compact: true });
      cv.mark(file, p.mark, 'focus');
      DP.flash(infoTop, 'is-pop');
    }

    function showOverview() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">Tek sınıf, üç parça</div>
        <div class="role-list">
          ${['singleton', 'instance', 'ctor', 'access', 'client']
            .map((k) => `<div class="role-row rc rc-${SG.roles[k].color}"><span class="info-dot"></span><div><b>${SG.roles[k].en}</b> · ${SG.roles[k].tr}<div class="role-desc">${PART[k].text}</div></div></div>`)
            .join('')}
        </div>
        <p class="info-desc">Üstteki <b>Bellek</b> düğmesi aynı yapıyı çalışma anında gösterir: kaç yerden sorulursa sorulsun <b>tek nesne</b>.</p>`;
    }

    const STEPS = [
      { t: 'Genel bakış', x: 'Singleton GoF’un **en küçük** kalıbıdır: tek bir sınıf. Ama o sınıfın üç parçası var ve her biri bir iş görür. Renkler parçaları ayırt ediyor.', info: null },
      { t: 'Singleton — Tekil sınıf', x: '[[TakipNoUretici]] hem asıl işini yapar (`yeniNumara()`) hem de **kendi tek örneğini** yönetir: oluşturur, saklar, dağıtır.', info: 'singleton', focus: { classes: ['TakipNoUretici'] } },
      { t: 'uniqueInstance — static alan', x: '`- ornek: TakipNoUretici` **altı çizili**: static. Alan sınıfın kendi tipinde olduğu için diyagramda sınıf **kendini** gösteren bir ok çizer (öz-ilişki).', info: 'instance', focus: { members: [['TakipNoUretici', 'ornek']], edges: ['self'] } },
      { t: 'private kurucu', x: '`- TakipNoUretici()` başında **eksi**: private. Sınıfın dışından `new` denemez; tekliğin bekçisi derleyicidir.', info: 'ctor', focus: { members: [['TakipNoUretici', 'ctor']] } },
      { t: 'getInstance() — global erişim noktası', x: 'Static ve public: **herkesin tek kapısı**. Not kutusundaki üç satır kalıbın kalbi: yoksa oluştur, hep aynısını döndür.', info: 'access', focus: { members: [['TakipNoUretici', 'getInstance']] } },
      { t: 'Client — İstemciler', x: 'İstemciler üreticiyi **oluşturmaz**, `getInstance()` ile **ister** (kesik ok = bağımlılık). Kaç istemci olursa olsun nesne tek.', info: 'client', focus: { classes: ['SiparisServisi', 'IadeServisi'], edges: ['uses-sip', 'uses-iade'] } },
      { t: 'Bellekte: tek nesne, çok yol', x: 'Çalışma anına bakalım: iki servis, `main`’deki `a` ve `b` ve static `ornek` alanı — **beş referans, tek nesne**. `a == b` bu yüzden `true`.', info: 'access', view: 'mem' },
    ];

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: () => 5800,
      onChange: (i, prev) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        diagram.select(null);
        if (s.focus) diagram.focus(s.focus);
        else diagram.clearFocus();
        if (s.info) showInfo(s.info);
        else showOverview();
        if (s.view || (prev >= 0 && STEPS[prev] && STEPS[prev].view)) setView(s.view || 'uml');
      },
    });
    setView('uml');
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };
})();
