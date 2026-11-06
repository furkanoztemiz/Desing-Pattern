/*
 * Decorator — sahneler (1/3): Giriş, Sorun, Çözüm
 */
(function () {
  'use strict';
  const DC = DP.dc;
  const { h } = DP;
  const kit = DP.kit;
  const md = (t) => DP.md(t, DC.roleOf);
  DC.md = md;
  DC.scenes = DC.scenes || {};
  const ui = (DC.ui = {
    foot: (root) => kit.foot(root, DC.roleOf),
    roleChip: (key) => kit.roleChip(DC.roles, key),
  });

  /** Konsol: satırlar {t, err, ok, bad, dim, note}. */
  DC.renderConsole = function (el, cmd, lines, o) {
    o = o || {};
    el.innerHTML = '<div class="console-head"><span></span><span></span><span></span> ' + (o.title || 'Konsol') + '</div>';
    if (cmd) el.appendChild(h('div', { class: 'console-line is-cmd' }, cmd));
    lines.forEach((l, i) => {
      const cls = ['console-line'];
      if (l.err) cls.push('is-err');
      if (l.ok) cls.push('is-okline');
      if (l.bad) cls.push('is-badline');
      if (l.dim) cls.push('is-dim');
      if (o.animateFrom != null && i >= o.animateFrom) cls.push('is-new');
      const row = h('div', { class: cls.join(' ') }, l.t);
      if (l.note) row.appendChild(h('span', { class: 'console-note' }, '  ← ' + l.note));
      el.appendChild(row);
    });
    if (o.cursor) el.appendChild(h('div', { class: 'console-cursor' }));
    el.scrollTop = el.scrollHeight;
  };

  // ================================================================== 1. GİRİŞ
  const HERO = [
    { layers: [], expr: 'new StandartKargo()' },
    { layers: ['ekspres'], expr: 'new Ekspres(new StandartKargo())' },
    { layers: ['ekspres', 'sigorta'], expr: 'new Sigorta(new Ekspres(new StandartKargo()))' },
    { layers: ['ekspres', 'sigorta', 'sms'], expr: 'new SmsBildirim(new Sigorta(new Ekspres(…)))' },
  ];

  DC.scenes.intro = function (root, ctx) {
    const el = h('div', { class: 'scene scene-intro' });
    el.innerHTML = `
      <div class="intro-grid">
        <section class="intro-main">
          <div class="chips">
            <span class="chip chip-cat is-struct">Yapısal · Structural</span>
            <span class="chip">GoF · 1994</span>
            <span class="chip">Diğer adı: Wrapper (Sarmalayıcı)</span>
          </div>
          <h1 class="intro-title">Decorator</h1>
          <div class="intro-sub">Dekoratör <span>· “katman katman sar”</span></div>
          <blockquote class="intent">
            <div class="intent-label">Amaç</div>
            <p>Bir nesneye <b>çalışma anında</b>, dinamik olarak <b>ek sorumluluklar</b> ekle. Dekoratörler, işlevselliği genişletmek için
            <b>alt sınıf oluşturmaya</b> esnek bir alternatif sunar.</p>
            <footer>— Gamma, Helm, Johnson, Vlissides (GoF), <i>Design Patterns</i>, 1994</footer>
          </blockquote>
        </section>
        <section class="intro-hero" aria-label="Kalıbın kısa animasyonu">${heroSvg()}</section>
      </div>
      <div class="intro-cards">
        <article class="card">
          <h3><span class="card-ic">🎁</span> Günlük hayattan</h3>
          <p>Hediyeyi kutuya koyarsınız; kutuyu <b>pakete</b> sararsınız, üstüne <b>kurdele</b>, en üste <b>kart</b> eklersiniz. Her katman bir şey katar
          ama içteki hediye <b>değişmez</b>. Kahvecide de öyle: espresso + süt + karamel… Fiyat, katmanların toplamıdır.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🧅</span> Fikir</h3>
          <p>Her ek hizmet, içteki nesneyle <b>aynı arayüzü</b> uygulayan ve onu <b>saran</b> bir nesnedir. Çağrıyı içeriye iletir,
          cevaba <b>kendi payını</b> ekler: <code>icteki.ucret() + 40</code>. Katmanlar istenen sırada, istenen sayıda, <b>çalışma anında</b> eklenir.</p>
          <p>Builder’daki seçenekler <i>alan</i>dı; burada her seçenek bir <b>katman</b>.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🎯</span> Bu derste</h3>
          <ol class="objectives">
            <li>Her kombinasyona alt sınıf yazmanın <b>patlamasını</b> görmek</li>
            <li>Ek hizmetleri <b>katman</b> olarak yazmak: <code>new Sigorta(new Ekspres(…))</code></li>
            <li>Rolleri tanımak: ${['component', 'concreteComponent', 'decorator', 'concreteDecorator'].map((r) => ui.roleChip(r)).join(' ')}</li>
            <li>Bir çağrının katmanlardan <b>içeri inip dışarı çıkışını</b> izlemek</li>
            <li>Katman <b>sırasının</b> önemini ve Java I/O’daki dekoratörleri görmek</li>
          </ol>
        </article>
      </div>
      <div class="intro-cta">
        <button class="btn btn-primary btn-lg" type="button" data-go>Sorunla başlayalım →</button>
        <a class="btn btn-ghost" href="#/composite">← Önceki kalıp: Composite</a>
        <span class="hint">ya da klavyede <kbd>→</kbd> tuşuna basın</span>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-go]').addEventListener('click', () => ctx.goScene('sorun'));

    // Çekirdeğin etrafına katmanlar sarılır, fiyat büyür (dekoratif döngü).
    const svg = el.querySelector('.hero-svg');
    const k = {};
    DP.$$('[data-k]', svg).forEach((n) => (k[n.getAttribute('data-k')] = n));
    let t = 0;
    const tick = () => {
      const ph = Math.min(t % 7, 3); // 0..3 katman, sonra bekle
      const st = HERO[ph];
      ['r1', 'r2', 'r3'].forEach((r, i) => {
        const on = i < st.layers.length;
        k[r].classList.toggle('is-on', on);
        if (on && i === st.layers.length - 1 && t % 7 === ph) DP.flash(k[r], 'is-new');
      });
      k.price.textContent = DC.price('standart', st.layers) + ' TL';
      if (t % 7 === ph) DP.flash(k.price, 'is-bump');
      k.expr.textContent = st.expr;
      t++;
    };
    tick();
    const timer = setInterval(tick, 1300);
    return { destroy: () => clearInterval(timer) };
  };

  function heroSvg() {
    const ring = (key, i, x, y, w, hh) => {
      const a = DC.ADDONS[key];
      return `<g class="dh-ring dl-${key}" data-k="r${i}"><g class="dh-in"><rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="${14 + i * 4}"/>
        <text x="${x + 12}" y="${y + 19}">${a.icon} ${esc(a.cls)} ${a.pct ? '' : '+' + a.fee}</text></g></g>`;
    };
    const esc = DP.esc;
    return `
    <svg class="hero-svg dc-hero" viewBox="0 0 560 360" role="img" aria-label="Bir koli katman katman sarılıyor; her katman ücrete kendi payını ekliyor">
      <text class="h-caption" x="280" y="30" text-anchor="middle">Çekirdeği değiştirme → üstüne katman sar</text>
      ${ring('sms', 3, 74, 58, 412, 230)}
      ${ring('sigorta', 2, 108, 88, 344, 170)}
      ${ring('ekspres', 1, 142, 118, 276, 110)}
      <g class="dh-core"><rect class="dh-core-bg" x="176" y="146" width="208" height="64" rx="10"/>
        <g transform="translate(190,152)"><path class="bx-top" d="M0 10 L8 2 H44 L36 10 Z"/><path class="bx-side" d="M36 10 L44 2 V38 L36 46 Z"/><rect class="bx-front" x="0" y="10" width="36" height="36" rx="2"/></g>
        <text class="dh-core-t" x="244" y="176">StandartKargo</text><text class="dh-core-s" x="244" y="196">çekirdek · 50 TL</text></g>
      <g class="dh-price"><rect x="404" y="300" width="132" height="40" rx="20"/><text data-k="price" x="470" y="327" text-anchor="middle">50 TL</text></g>
      <text class="h-sub dh-expr" data-k="expr" x="24" y="325">new StandartKargo()</text>
    </svg>`;
  }

  // ================================================================== 2. SORUN
  DC.scenes.problem = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-46' });
    const left = kit.panel('Kalıpsız kod · <span class="ver"></span>', { cls: 'panel-code dc-left' });
    const right = kit.panel('Sınıf ağacı', { cls: 'panel-side dc-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'dc-cv' });
    const consoleEl = h('div', { class: 'console dc-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: DC.roleOf, special: DC.special });

    const viewHost = h('div', { class: 'dc-view' });
    const extra = h('div', { class: 'dc-extra' });
    right.body.append(viewHost, extra);
    const stage = new DC.Lattice(viewHost);

    const ORDER = ['Main'].concat(DC.NAIVE.map((n) => n.cls));
    const files = (v) => {
      const F = DC.naive(v);
      return ORDER.filter((n) => F[n]).map((n) => ({ name: n + '.java', code: F[n] }));
    };
    const asMap = (v) => {
      const F = DC.naive(v);
      const m = {};
      Object.keys(F).forEach((n) => (m[n + '.java'] = F[n]));
      return m;
    };
    const out = (v) => DC.naiveOutput(v).map((l) => (l.bad ? { t: l.t, bad: true, note: '185 olmalıydı!' } : { t: l.t }));
    const F = DC.FORGOT;

    const STEPS = [
      {
        t: 'Tek seçenek: EkspresKargo',
        x: 'Standart kargoya bir seçenek eklendi: **ekspres** (+40 TL). Kalıtımla çözmek kolay: `EkspresKargo extends StandartKargo`, ücrete 40 ekler. İki sınıf, henüz sorun yok.',
        v: 'v1', mark: ['EkspresKargo.java', 'return super.ucret() + 40;', 'focus'], out: out('v1'),
        stage: { v: 'v1', banner: { text: 'Bir seçenek → **2 sınıf**.' } },
      },
      {
        t: 'İkinci seçenek: kombinasyon sınıfı',
        x: 'Müşteriler **sigorta** da istiyor. Ama hem ekspres hem sigortalı bir gönderi için de bir sınıf gerekiyor: [[SigortaliEkspresKargo]]. Sigorta kuralı (+30) artık **iki sınıfta** yazılı.',
        v: 'v2', diff: 'v1', mark: ['SigortaliEkspresKargo.java', 'return super.ucret() + 30;', 'focus'], out: out('v2'), animateOut: 2,
        stage: { v: 'v2', hl: { SigortaliKargo: 'dup', SigortaliEkspresKargo: 'dup' }, banner: { text: 'İki seçenek → **4 sınıf**; sigorta kodu iki yerde.' } },
      },
      {
        t: 'Üçüncü seçenek: patlama',
        x: '**Soğuk zincir** geldi: dört yeni sınıf, toplam **8**. Her yeni seçenek sınıf sayısını **ikiye katlıyor**: 4 seçenek 16, 5 seçenek 32 sınıf. Zarf gönderileri için hepsini bir daha yazmak gerekirdi.',
        v: 'v3', diff: 'v2', mark: ['SigortaliSogukZincirliEkspresKargo.java', 'extends SogukZincirliEkspresKargo', 'focus'], out: out('v3'), animateOut: 4,
        stage: { v: 'v3', banner: { text: 'Üç seçenek → **8 sınıf** (2³). Sağ alttaki çubuklara bakın: 6 seçenek = 64 sınıf.', tone: 'bad' } },
      },
      {
        t: 'Zam: sigorta 30 → 35',
        x: 'Sigortaya zam geldi. Sigorta kuralı **dört sınıfta** yazılı; üçü güncellendi, biri **unutuldu**. Derleyici bir şey demedi: fiyat listesi artık **tutarsız** (180 TL, 185 olmalıydı).',
        v: 'v4', diff: 'v3', mark: [F + '.java', 'return super.ucret() + 30;', 'bad'], out: out('v4'), animateOut: 7,
        stage: { v: 'v4', hl: { SigortaliKargo: 'ok', SigortaliEkspresKargo: 'ok', SigortaliSogukZincirliKargo: 'ok', [F]: 'bad' }, banner: { text: 'Dört sınıftan biri unutuldu: liste **tutarsız**.', tone: 'bad' } },
      },
      {
        t: 'Teşhis — Alt sınıf neden yetmiyor?',
        x: 'Kalıtım **derleme anında** ve **tek yönde** genişletir: her kombinasyon ayrı bir sınıf olmak zorunda. Ya seçenekleri sınıf yerine **nesne** olarak, gönderinin etrafına **katman katman** sarsak?',
        v: 'v4', mark: null, diag: true, out: out('v4'),
      },
    ];

    const stageOf = (i) => (STEPS[i].stage ? STEPS[i].stage : STEPS[i - 1].stage);
    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: () => 6000,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        left.head.querySelector('.ver').textContent = { v1: 'sürüm 1.0 (ekspres)', v2: 'sürüm 2.0 (+ sigorta)', v3: 'sürüm 3.0 (+ soğuk zincir)', v4: 'sürüm 3.1 (sigortaya zam)' }[s.v];
        cv.setFiles(files(s.v), { active: s.mark ? s.mark[0] : 'Main.java', prev: s.diff ? asMap(s.diff) : null });
        if (s.mark) cv.mark(s.mark[0], s.mark[1], s.mark[2]);
        DC.renderConsole(consoleEl, '$ javac *.java && java Main', s.out, { animateFrom: info.animate && s.animateOut != null ? s.animateOut : null });
        stage.render(stageOf(i), prev >= 0 ? stageOf(prev) : null, { animate: info.animate && !!s.stage });
        if (s.diag) {
          extra.innerHTML = `
            <div class="req-card is-diagnosis">
              <div class="diag-title">Teşhis</div>
              <ul class="problems">
                <li>${md('**Sınıf patlaması:** n seçenek için 2ⁿ sınıf; ikinci bir çekirdek (zarf) bunu bir kez daha katlar.')}</li>
                <li>${md('**Aynı kural birçok yerde:** sigorta dört sınıfta yazılı; bir zam tutarsızlık doğurdu.')}</li>
                <li>${md('**Statik:** sipariş nesnesi oluştuktan sonra sınıfı değişemez — müşteri sonradan SMS isterse?')}</li>
              </ul>
            </div>
            <div class="sg-aside">${md('💬 **Hediye paketi gibi:** kutuyu değiştirmeden üstüne kâğıt, kurdele, kart sararız. Her katman **bir kez** yazılır, istenen sırada ve sayıda eklenir.')}</div>`;
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
  DC.scenes.solution = function (root, ctx) {
    const R = DC.refactor;
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-diag' });
    const left = kit.panel('Yeniden düzenleme (refactoring)', { cls: 'panel-code dc-left' });
    const right = kit.panel('Sınıf diyagramı', { cls: 'panel-side panel-diagram' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'dc-cv' });
    const consoleEl = h('div', { class: 'console dc-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: DC.roleOf, special: DC.special });
    const diagHost = h('div', { class: 'diag-host' });
    const recipe = h('ol', { class: 'recipe' });
    const legend = kit.umlLegend({ association: false, aggregation: true, fmLabel: 'katman metodu: içtekine devreder, payını ekler' });
    right.body.append(h('div', { class: 'recipe-wrap' }, h('div', { class: 'recipe-title' }, 'Dönüşüm tarifi'), recipe), diagHost, legend);
    ['Ortak arayüz', 'Dekoratör atası', 'Her seçenek bir katman', 'İstemci katmanları kurar'].forEach((t, i) => recipe.appendChild(h('li', { 'data-i': String(i + 1) }, t)));
    const diagram = new DP.ClassDiagram(diagHost, DC.solutionDiagram(0), { roles: DC.roles, roleTags: false });

    const bugOut = DC.naiveOutput('v4').map((l) => (l.bad ? { t: l.t, bad: true, note: 'hâlâ 180' } : { t: l.t, dim: true }));
    const okOut = DC.output.map((t, j) => ({ t, ok: j === 7 || j === 8, note: j === 7 ? '185 ✓ (zam tek yerde)' : j === 8 ? 'sınıf yazmadan' : null }));
    const F = DC.FORGOT;
    const STEPS = [
      { t: 'Başlangıç — sekiz sınıf', x: 'Sekiz kombinasyon sınıfı ve tutarsız bir fiyat listesi. Dört adımda her seçeneği **bir kez** yazılan bir katmana dönüştüreceğiz.', focus: F + '.java', mark: 'return super.ucret() + 30;', kind: 'bad', run: 'bug' },
      { t: 'Adım 1 — Ortak arayüz: KargoHizmeti', x: '[[KargoHizmeti]] arayüzü: `aciklama()` ve `ucret()`. [[StandartKargo]] onu uyguluyor. Bu arayüz, katmanların **birbirinin yerine** geçebilmesinin anahtarı: hem çekirdek hem her katman bir `KargoHizmeti` olacak.', focus: 'KargoHizmeti.java', mark: 'public interface KargoHizmeti', run: 'bug' },
      { t: 'Adım 2 — Dekoratör atası: EkHizmet', x: '[[EkHizmet]] hem bir `KargoHizmeti` **dir** (implements) hem de bir `KargoHizmeti`’ne **sahiptir** (`icteki`). Bu çifte ilişki kalıbın kalbi: bir katman, başka bir katmanı da sarabilir.', focus: 'EkHizmet.java', mark: 'protected final KargoHizmeti icteki;', run: 'bug' },
      { t: 'Adım 3 — Her seçenek bir katman', x: '[[Ekspres]], [[Sigorta]], [[SogukZincir]]: her biri içtekine sorar ve **kendi payını** ekler. Sigorta kuralı (+35) artık programda **tek bir yerde**. Eski sınıflar henüz duruyor; istemciyi bir sonraki adımda taşıyacağız.', focus: 'Sigorta.java', marks: ['return icteki.ucret() + 35;', 'return icteki.aciklama() + " + sigorta";'], run: 'bug' },
      { t: 'Adım 4 — İstemci katmanları kurar', x: '`Main` sekiz satırı katmanlarla kuruyor: `new Sigorta(new SogukZincir(new Ekspres(new StandartKargo())))`. Yedi kombinasyon sınıfı **silindi**. Son satıra bakın: zarf + sigorta + SMS için **hiç sınıf yazmadık**.', focus: 'Main.java', mark: 'new Sigorta(new SogukZincir(new Ekspres(new StandartKargo())))', run: 'ok' },
      { t: 'Sonuç — Ne kazandık?', x: 'Sınıf sayısı **üstel değil doğrusal**: n seçenek = n katman sınıfı. Her kural **tek yerde** (zam tek satır). Katmanlar istenen **sırada ve sayıda**, **çalışma anında** eklenir; çekirdek de değişebilir (zarf). Bedeli: çok sayıda küçük nesne.', focus: 'EkHizmet.java', mark: 'protected final KargoHizmeti icteki;', run: 'ok' },
    ];

    const filesAt = (i) => DC.refactorOrder.filter((k) => R[i][k]).map((k) => ({ name: k + '.java', code: R[i][k] }));
    const asMap = (i) => {
      const m = {};
      Object.keys(R[i]).forEach((k) => (m[k + '.java'] = R[i][k]));
      return m;
    };

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: () => 6400,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        const ri = Math.min(i, R.length - 1);
        const showDiff = i >= 1 && i <= R.length - 1;
        cv.setFiles(filesAt(ri), { active: s.focus, prev: showDiff ? asMap(ri - 1) : null, keepActive: false });
        if (s.mark) cv.mark(s.focus, s.mark, s.kind || 'focus');
        (s.marks || []).forEach((m, k) => cv.mark(s.focus, m, 'focus', { scroll: k === 0 }));

        if (s.run === 'bug') DC.renderConsole(consoleEl, '$ javac *.java && java Main', bugOut, { animateFrom: info.animate && i === 0 ? 7 : null });
        else DC.renderConsole(consoleEl, '$ javac *.java && java Main', okOut, { animateFrom: info.animate && i === 4 ? 0 : null });

        diagram.update(DC.solutionDiagram(Math.min(i, 4)), { animate: info.animate });
        diagram.clearBadges();
        diagram.clearFocus();
        if (i === 0) diagram.badge('StandartKargo', '+7 alt sınıf', 'bad');
        if (i === 1) {
          diagram.badge('KargoHizmeti', 'YENİ', 'new');
          diagram.focus({ classes: ['KargoHizmeti', 'StandartKargo'], edges: ['r-std'] });
        }
        if (i === 2) {
          diagram.badge('EkHizmet', 'hem “dir” hem “sahiptir”', 'new');
          diagram.focus({ classes: ['EkHizmet'], edges: ['r-dec', 'agg'] });
        }
        if (i === 3) {
          ['Ekspres', 'Sigorta', 'SogukZincir'].forEach((c) => diagram.badge(c, 'YENİ', 'new'));
          diagram.focus({ classes: ['Ekspres', 'Sigorta', 'SogukZincir'], edges: ['gen-ekspres', 'gen-sigorta', 'gen-zincir'] });
        }
        if (i === 4) {
          ['ZarfKargo', 'SmsBildirim'].forEach((c) => diagram.badge(c, 'YENİ', 'new'));
          diagram.focus({ classes: ['Main', 'ZarfKargo', 'SmsBildirim'], edges: ['uses'] });
        }
        if (i === 5) diagram.focus({ classes: ['EkHizmet'], edges: ['agg', 'r-dec'] });
        DP.$$('li', recipe).forEach((li, k) => {
          li.classList.toggle('is-done', k + 1 < i || (i === 5 && k < 4));
          li.classList.toggle('is-current', k + 1 === i);
        });
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };
})();
