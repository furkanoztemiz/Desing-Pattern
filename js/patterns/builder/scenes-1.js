/*
 * Builder — sahneler (1/3): Giriş, Sorun, Çözüm
 */
(function () {
  'use strict';
  const BL = DP.bl;
  const { h } = DP;
  const kit = DP.kit;
  const md = (t) => DP.md(t, BL.roleOf);
  BL.md = md;
  BL.scenes = BL.scenes || {};
  const ui = (BL.ui = {
    foot: (root) => kit.foot(root, BL.roleOf),
    roleChip: (key) => kit.roleChip(BL.roles, key),
  });
  const C = BL.cargo;

  /** Konsol: satırlar {t, err, ok, bad, note, dim}. note: satırın sonuna eklenen açıklama. */
  BL.renderConsole = function (el, cmd, lines, o) {
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
  const HERO_CODE = ['new Gonderi.Builder()', '    .nereden("Kütahya")', '    .nereye("İzmir")', '    .kirilgan()', '    .sigorta(5000)', '    .build();'];

  BL.scenes.intro = function (root, ctx) {
    const el = h('div', { class: 'scene scene-intro' });
    el.innerHTML = `
      <div class="intro-grid">
        <section class="intro-main">
          <div class="chips">
            <span class="chip chip-cat">Yaratımsal · Creational</span>
            <span class="chip">GoF · 1994</span>
            <span class="chip">Nesne düzeyi kalıp</span>
          </div>
          <h1 class="intro-title">Builder</h1>
          <div class="intro-sub">Yapıcı <span>· “karmaşık nesneyi adım adım kur”</span></div>
          <blockquote class="intent">
            <div class="intent-label">Amaç</div>
            <p>Karmaşık bir nesnenin <b>oluşturulmasını</b> onun <b>temsilinden</b> ayır; böylece <b>aynı oluşturma süreci</b> farklı temsiller üretebilsin.</p>
            <footer>— Gamma, Helm, Johnson, Vlissides (GoF), <i>Design Patterns</i>, 1994</footer>
          </blockquote>
        </section>
        <section class="intro-hero" aria-label="Kalıbın kısa animasyonu">${heroSvg()}</section>
      </div>
      <div class="intro-cards">
        <article class="card">
          <h3><span class="card-ic">🥪</span> Günlük hayattan</h3>
          <p>Sandviççide sipariş: <i>“Tam buğday ekmek… hindi… bol domates… soğansız… tamam, hazırla!”</i>
          Sipariş <b>parça parça</b> verilir, ürün <b>en sonda tek seferde</b> teslim edilir. Aynı siparişten mutfak sandviçi,
          kasa ise <b>fişi</b> çıkarır: aynı adımlar, farklı ürünler.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🧱</span> İki yüzü</h3>
          <p><b>Akıcı Builder</b> (<i>Effective Java</i>): çok sayıda isteğe bağlı parametreyi okunur, <b>doğrulanmış</b> ve
          <b>değişmez</b> bir nesneye çevirir: <code>new Gonderi.Builder()…<span class="tk-fm">build()</span></code></p>
          <p><b>GoF Builder</b>: bir <b>Yönetici</b> (Director) aynı adımları farklı hazırlayıcılara uygular →
          paket, etiket, fiyat… <b>farklı temsiller</b>.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🎯</span> Bu derste</h3>
          <ol class="objectives">
            <li>Teleskop kurucuların ve set metotlarının <b>tuzaklarını</b> görmek</li>
            <li>Akıcı Builder ile <b>okunur, doğrulanmış, değişmez</b> nesne kurmak</li>
            <li>Dört rolü tanımak: ${['director', 'builder', 'concreteBuilder', 'product'].map((r) => ui.roleChip(r)).join(' ')}</li>
            <li>Aynı tariften <b>farklı temsiller</b> üretmek (paket, etiket, fiyat)</li>
            <li>Yeni temsil eklemenin kolay, yeni adım eklemenin zor olduğunu görmek</li>
          </ol>
        </article>
      </div>
      <div class="intro-cta">
        <button class="btn btn-primary btn-lg" type="button" data-go>Sorunla başlayalım →</button>
        <a class="btn btn-ghost" href="#/singleton">← Önceki kalıp: Singleton</a>
        <span class="hint">ya da klavyede <kbd>→</kbd> tuşuna basın</span>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-go]').addEventListener('click', () => ctx.goScene('sorun'));

    // Akıcı zincir satır satır ilerler; kutu plandan gerçeğe döner (dekoratif döngü).
    const svg = el.querySelector('.hero-svg');
    const k = {};
    DP.$$('[data-k]', svg).forEach((n) => (k[n.getAttribute('data-k')] = n));
    const lines = DP.$$('.bh-line', svg);
    const steps = BL.presets.vazo.steps;
    let t = 0;
    let prevG = null;
    const tick = () => {
      const phase = t % 9; // 0: yeni builder, 1-5: adımlar(4 + build), 6-8: bekle
      const n = Math.min(phase, 4); // tamamlanan adım sayısı (nereden, nereye, kirilgan, sigorta)
      const chosen = [steps[0], steps[1], steps[3], steps[4]].slice(0, n);
      const g = BL.fieldsOf(chosen);
      g.agirlik = null;
      const built = phase >= 5;
      BL.art.applyBox(k, 'hero', g, { plan: !built, real: built, sealed: built, final: built }, prevG, true);
      if (phase === 5) DP.flash(k.hero, 'is-materialize');
      lines.forEach((ln, i) => {
        ln.classList.toggle('is-on', i === Math.min(phase, 5));
        ln.classList.toggle('is-done', i < Math.min(phase, 5) || phase > 5);
      });
      prevG = g;
      t++;
    };
    tick();
    const timer = setInterval(tick, 1500);
    return { destroy: () => clearInterval(timer) };
  };

  function heroSvg() {
    const code = HERO_CODE.map((l, i) => `<text class="bh-line" x="22" y="${108 + i * 29}">${DP.esc(l)}</text>`).join('');
    return `
    <svg class="hero-svg bl-hero" viewBox="0 0 560 360" role="img" aria-label="Akıcı Builder zinciri adım adım bir paket kuruyor">
      <rect class="bh-card" x="8" y="56" width="236" height="208" rx="12"/>
      <text class="bh-title" x="22" y="80">VazoGonderisi.java</text>
      ${code}
      <path class="bh-arrow" d="M250 160 H286"/>
      <g transform="translate(300,150) scale(1.02)">${BL.art.box('hero')}</g>
      <rect class="bh-table" x="290" y="294" width="250" height="10" rx="3"/>
      <text class="h-caption" x="280" y="34" text-anchor="middle">Adım adım topla → en sonda doğrula ve teslim et</text>
      <text class="h-sub bh-sub" x="280" y="336" text-anchor="middle">build() öncesi nesne YOK · sonrası DEĞİŞMEZ</text>
    </svg>`;
  }

  // ================================================================== 2. SORUN
  const PARAMS = ['nereden', 'nereye', 'agirlik', 'kirilgan', 'sogukZincir', 'ekspres', 'sigorta'];
  const argsOf = (g, n) => [`"${g.nereden}"`, `"${g.nereye}"`, String(g.agirlik), String(g.kirilgan), String(g.sogukZincir), String(g.ekspres), String(g.sigorta)].slice(0, n || 7);

  BL.scenes.problem = function (root, ctx) {
    const N = BL.naive;
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-46' });
    const left = kit.panel('Kalıpsız kod · <span class="ver"></span>', { cls: 'panel-code bl-left' });
    const right = kit.panel('Paketleme atölyesi', { cls: 'panel-side bl-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'bl-cv' });
    const consoleEl = h('div', { class: 'console bl-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: BL.roleOf, special: BL.special });

    const viewHost = h('div', { class: 'bl-view' });
    const extra = h('div', { class: 'bl-extra' });
    right.body.append(viewHost, extra);
    const stage = new BL.Stage(viewHost);

    const files = (v) => Object.keys(N[v]).map((n) => ({ name: n + '.java', code: N[v][n] }));
    const asMap = (v) => {
      const m = {};
      Object.keys(N[v]).forEach((n) => (m[n + '.java'] = N[v][n]));
      return m;
    };
    const real = (g, extraO) => Object.assign({ state: 'real', g, pos: 'table' }, extraO || {});

    const STEPS = [
      {
        t: 'Sürüm 1.0 — Üç parametre',
        x: 'Gönderinin üç bilgisi var: nereden, nereye, ağırlık. Kurucu kısa, çağrı okunaklı: `new Gonderi("Malatya", "Ankara", 20)`. Her şey yolunda.',
        v: 'v1', mark: ['Main.java', 'new Gonderi("Malatya"', 'focus'],
        out: BL.naiveOutput(1),
        stage: { mode: 'ctor', ctor: { args: argsOf(C.kayisi, 3), params: PARAMS, names: true }, box: real(C.kayisi) },
      },
      {
        t: 'Sürüm 2.0 — Teleskop kurucular',
        x: 'Yeni ihtiyaçlar geldi: kırılgan, soğuk zincir, ekspres, sigorta. Her seçenek **bir kurucu daha** doğurdu: teleskop gibi uzayan kurucular. Aşı kolisinin çağrısına bakın: `4, false, true, true, 20000` — hangisi neydi?',
        v: 'v2', diff: 'v1', mark: ['Main.java', 'Gonderi asi = new Gonderi(', 'focus'],
        out: BL.naiveOutput(2).map((l) => ({ t: l.t })),
        stage: { mode: 'ctor', ctor: { args: argsOf(C.asi), params: PARAMS, names: false }, box: real(C.asi) },
      },
      {
        t: 'Yer değiştiren iki boolean',
        x: 'Vazo **kırılgan** olacaktı ama `true` bir sonraki parametreye, `sogukZincir`’e yazıldı. İkisi de `boolean` olduğu için **derleyici hiçbir şey demedi**. Vazo soğuk zincirle ve KIRILACAK etiketi olmadan yola çıktı — ve kırıldı.',
        v: 'v2', mark: ['Main.java', 'Gonderi vazo = new Gonderi(', 'bad'],
        out: BL.naiveOutput(2).map((l) => (l.bad ? { t: l.t, bad: true, note: 'KIRILGAN yok, SOĞUK ZİNCİR var?!' } : { t: l.t })),
        animateOut: 2,
        stage: {
          mode: 'ctor',
          ctor: { args: argsOf(C.vazoHatali), params: PARAMS, names: true, bad: [3, 4], intent: { 3: 'true', 4: 'false' } },
          box: real(C.vazoHatali, { pos: 'truck', cracked: true }),
          bubble: { at: 'truck', text: 'Cam vazo **soğuk zincirle** ve **KIRILACAK etiketi olmadan** yola çıktı…', tone: 'bad' },
        },
      },
      {
        t: 'Hızlı çözüm: set metotları (JavaBeans)',
        x: 'Artık her değerin bir adı var ve kod okunuyor. Ama nesne `new Gonderi()` ile **boş** doğuyor ve set çağrıları arasında **yarım** duruyor. `setSigorta` unutulunca kimse fark etmedi. Alanlar `final` olamadığı için nesne yolda bile değiştirilebilir.',
        v: 'v3', diff: 'v2', mark: ['Main.java', 'setSigorta(...) unutuldu', 'bad'],
        out: BL.naiveOutput(3).map((l) => ({ t: l.t, bad: true, note: 'kırılgan ama sigortasız!' })),
        animateOut: 0,
        stage: {
          mode: 'bean',
          call: { title: 'Main.main()', text: 'vazo.setKirilgan(true);' },
          form: { title: 'vazo : Gonderi (set ile)', values: C.vazoBean, set: ['nereden', 'nereye', 'agirlik', 'kirilgan'], missing: ['sigorta'] },
          box: real(C.vazoBean, { pos: 'truck', half: true }),
          bubble: { at: 'truck', text: 'Kırılgan ama **sigortasız** yola çıktı. Doğrulamanın yapılacağı bir “bitti” anı yok!', tone: 'bad' },
        },
      },
      {
        t: 'Teşhis — Neye ihtiyacımız var?',
        x: 'Değerleri **adlarıyla** ve **adım adım** toplayan, en sonda **tek seferde doğrulayıp** **değişmez** bir nesne veren bir yardımcıya. İşte Builder.',
        v: 'v3', mark: null, diag: true,
        out: BL.naiveOutput(3).map((l) => ({ t: l.t, bad: true, note: 'kırılgan ama sigortasız!' })),
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
        left.head.querySelector('.ver').textContent = s.v === 'v1' ? 'sürüm 1.0' : s.v === 'v2' ? 'sürüm 2.0 (teleskop)' : 'sürüm 3.0 (set metotları)';
        cv.setFiles(files(s.v), { active: s.mark ? s.mark[0] : 'Main.java', prev: s.diff ? asMap(s.diff) : null });
        if (s.mark) cv.mark(s.mark[0], s.mark[1], s.mark[2]);
        BL.renderConsole(consoleEl, '$ java Main', s.out, { animateFrom: info.animate && s.animateOut != null ? s.animateOut : null });
        stage.render(stageOf(i), prev >= 0 ? stageOf(prev) : null, { animate: info.animate && !!s.stage });
        if (s.diag) {
          extra.innerHTML = `
            <div class="req-card is-diagnosis">
              <div class="diag-title">Teşhis</div>
              <ul class="problems">
                <li>${md('**Konumlu argümanlar:** aynı tipteki değerlerin yeri karışınca derleyici yakalayamaz.')}</li>
                <li>${md('**Teleskop kurucular:** her yeni seçenek yeni bir kurucu; okumak ve bakımını yapmak zor.')}</li>
                <li>${md('**JavaBeans:** nesne yarım doğar, `final` olamaz; doğrulamanın yapılacağı “bitti” anı yok.')}</li>
              </ul>
            </div>
            <div class="sg-aside">${md('💬 **“Parametrelere ad veremez miyiz?”** Java’da adlandırılmış parametre yok (Kotlin ve Python’da var). Builder, Java’da bu ihtiyacın en yaygın karşılığıdır.')}</div>`;
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
  BL.scenes.solution = function (root, ctx) {
    const R = BL.refactor;
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-diag' });
    const left = kit.panel('Yeniden düzenleme (refactoring)', { cls: 'panel-code bl-left' });
    const right = kit.panel('Sınıf diyagramı', { cls: 'panel-side panel-diagram' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'bl-cv' });
    const consoleEl = h('div', { class: 'console bl-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: BL.roleOf, special: BL.special });
    const diagHost = h('div', { class: 'diag-host' });
    const recipe = h('ol', { class: 'recipe' });
    const legend = kit.umlLegend({ association: false, fmLabel: 'build(): sonucu verir (getResult)' });
    legend.insertAdjacentHTML('beforeend', '<span><svg viewBox="0 0 46 14"><line x1="2" y1="7" x2="28" y2="7" class="lg-line"/><circle cx="36" cy="7" r="6" class="lg-nest"/><path d="M30 7 H42 M36 1 V13" class="lg-line"/></svg> iç sınıf (nested)</span>');
    right.body.append(h('div', { class: 'recipe-wrap' }, h('div', { class: 'recipe-title' }, 'Dönüşüm tarifi'), recipe), diagHost, legend);
    ['İç sınıf: Gonderi.Builder', 'Akıcı adımlar: return this', 'build(): doğrula ve oluştur', 'İstemci zinciri kurar'].forEach((t, i) => recipe.appendChild(h('li', { 'data-i': String(i + 1) }, t)));
    const diagram = new DP.ClassDiagram(diagHost, BL.solutionDiagram(0), { roles: BL.roles, roleTags: false });

    const naiveOut = BL.naiveOutput(2).map((l) => (l.bad ? { t: l.t, bad: true, note: 'hata hâlâ yerinde' } : { t: l.t }));
    const STEPS = [
      { t: 'Başlangıç — Teleskop kurucular', x: 'Beş kurucu ve yerleri karışabilen yedi argüman. Dört adımda **akıcı Builder**’a dönüştüreceğiz; vazo hatası da bu yolculukta kendiliğinden ortadan kalkacak.', focus: 'Main.java', mark: 'Gonderi vazo = new Gonderi(', kind: 'bad', run: 'naive' },
      { t: 'Adım 1 — İç sınıf: Gonderi.Builder', x: '`Gonderi`’nin içine `public static class Builder` ekledik. Aynı alanlara sahip ama alanları **değişebilir** ve **varsayılan değerli** (`agirlik = 1`): bilgiler burada adım adım toplanacak.', focus: 'Gonderi.java', mark: 'public static class Builder', run: 'naive' },
      { t: 'Adım 2 — Akıcı adımlar: return this', x: 'Her alan için bir metot: değeri yazar ve **kendisini (`this`) döndürür**. Böylece çağrılar zincirlenir: `.nereden(…).nereye(…).kirilgan()`. Her değerin artık bir **adı** var.', focus: 'Gonderi.java', marks: ['public Builder kirilgan()', 'return this;                  // zincirleme'], run: 'naive' },
      { t: 'Adım 3 — build(): doğrula ve oluştur', x: '`build()` kuralları **tek yerde** denetler ve ancak geçerse `new Gonderi(this)` der. Teleskop kurucular silindi; `Gonderi`’nin tek kurucusu artık **private**. Eski çağrılar derlenmiyor: derleyici bizi Builder’a yönlendiriyor.', focus: 'Gonderi.java', marks: ['public Gonderi build()', 'if (kirilgan && sigorta == 0)', 'return new Gonderi(this);'], run: 'err' },
      { t: 'Adım 4 — İstemci zinciri kurar', x: '`Main` artık her gönderiyi adlarla kuruyor. Vazo: `.kirilgan().sigorta(5000)` — yanlış yere `true` yazmak imkânsız. Çıktı doğru: **KIRILGAN**.', focus: 'Main.java', mark: '.kirilgan().sigorta(5000)', run: 'ok' },
      { t: 'Sonuç — Ne kazandık?', x: '**Okunurluk** (her değerin adı var), **varsayılanlar**, **tek noktada doğrulama** (`build()`), **değişmez ürün** (`final` alanlar, set yok). Yarım ya da hatalı bir `Gonderi` artık dışarı sızamaz.', focus: 'Gonderi.java', marks: ['private final String nereden;', 'private Gonderi(Builder b)', 'if (kirilgan && sigorta == 0)'], run: 'ok' },
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
      delayOf: () => 6400,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        const ri = Math.min(i, R.length - 1);
        const showDiff = i >= 1 && i <= R.length - 1;
        cv.setFiles(filesAt(ri), { active: s.focus, prev: showDiff ? asMap(ri - 1) : null, keepActive: false });
        if (s.mark) cv.mark(s.focus, s.mark, s.kind || 'focus');
        (s.marks || []).forEach((m, k) => cv.mark(s.focus, m, 'focus', { scroll: k === 0 }));

        if (s.run === 'naive') BL.renderConsole(consoleEl, '$ java Main', naiveOut);
        else if (s.run === 'err') BL.renderConsole(consoleEl, '$ javac *.java', BL.refactorErrors(), { animateFrom: info.animate ? 0 : null });
        else BL.renderConsole(consoleEl, '$ javac *.java && java Main', BL.output.map((t, j) => ({ t, ok: j === 2, note: j === 2 ? 'doğru!' : null })), { animateFrom: info.animate && i === 4 ? 0 : null });

        diagram.update(BL.solutionDiagram(Math.min(i, 4)), { animate: info.animate });
        diagram.clearBadges();
        diagram.clearFocus();
        if (i === 0) diagram.badge('Gonderi', '5 kurucu', 'bad');
        if (i === 1) {
          diagram.badge('Builder', 'YENİ', 'new');
          diagram.focus({ classes: ['Builder'], edges: ['nest'] });
        }
        if (i === 2) diagram.focus({ members: [['Builder', 'nereden'], ['Builder', 'kirilgan'], ['Builder', 'diger']] });
        if (i === 3) {
          diagram.badge('Main', '✗ derlenmez', 'bad');
          diagram.focus({ members: [['Builder', 'build'], ['Gonderi', 'ctor']], edges: ['create'] });
        }
        if (i === 4) {
          diagram.badge('Gonderi', 'değişmez', 'same');
          diagram.focus({ classes: ['Main', 'Builder'], edges: ['uses'] });
        }
        if (i === 5) diagram.focus({ members: [['Builder', 'build'], ['Gonderi', 'ctor'], ['Gonderi', 'alanlar']] });
        DP.$$('li', recipe).forEach((li, k) => {
          li.classList.toggle('is-done', k + 1 < i || (i === 5 && k < 4));
          li.classList.toggle('is-current', k + 1 === i);
        });
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };
})();
