/*
 * Prototype — sahneler (1/3): Giriş, Sorun, Çözüm
 */
(function () {
  'use strict';
  const PT = DP.pt;
  const { h } = DP;
  const kit = DP.kit;
  const md = (t) => DP.md(t, PT.roleOf);
  PT.md = md;
  PT.scenes = PT.scenes || {};
  const ui = (PT.ui = {
    foot: (root) => kit.foot(root, PT.roleOf),
    roleChip: (key) => kit.roleChip(PT.roles, key),
  });
  const C = PT.cargo;

  /** Konsol: satırlar {t, err, ok, bad, dim, note}. note: satırın sonuna eklenen açıklama. */
  PT.renderConsole = function (el, cmd, lines, o) {
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
  PT.scenes.intro = function (root, ctx) {
    const el = h('div', { class: 'scene scene-intro' });
    el.innerHTML = `
      <div class="intro-grid">
        <section class="intro-main">
          <div class="chips">
            <span class="chip chip-cat">Yaratımsal · Creational</span>
            <span class="chip">GoF · 1994</span>
            <span class="chip">Nesne düzeyi kalıp</span>
          </div>
          <h1 class="intro-title">Prototype</h1>
          <div class="intro-sub">Prototip <span>· “sıfırdan kurma, var olanı kopyala”</span></div>
          <blockquote class="intent">
            <div class="intent-label">Amaç</div>
            <p>Oluşturulacak nesnelerin türünü <b>bir prototip örnekle</b> belirt; yeni nesneleri bu prototipi <b>kopyalayarak</b> üret.</p>
            <footer>— Gamma, Helm, Johnson, Vlissides (GoF), <i>Design Patterns</i>, 1994</footer>
          </blockquote>
        </section>
        <section class="intro-hero" aria-label="Kalıbın kısa animasyonu">${heroSvg()}</section>
      </div>
      <div class="intro-cards">
        <article class="card">
          <h3><span class="card-ic">📄</span> Günlük hayattan</h3>
          <p>Dilekçeyi her seferinde <b>sıfırdan</b> yazmazsınız: dolu bir örneği <b>fotokopi</b> çeker, yalnızca tarihi değiştirirsiniz.
          Hücre bölünmesi de böyledir: yeni hücre, var olanın <b>kopyası</b> olarak doğar. Fotokopi makinesi kâğıdın ne olduğunu
          <b>bilmeden</b> çoğaltır.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🧬</span> Fikir</h3>
          <p>İstemci <code>new KoliGonderisi(…)</code> demez; elindeki nesneye <b>“kendini kopyala”</b> der:
          <code><span class="tk-fm">son.kopyala()</span></code>. Nesnenin türünü <b>bilmesi gerekmez</b>; pahalı kurulum da tekrarlanmaz.</p>
          <p>Asıl tuzak kopyanın <b>derinliğinde</b>: içerideki liste paylaşılırsa, kopyayı değiştirmek <b>şablonu</b> da değiştirir.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🎯</span> Bu derste</h3>
          <ol class="objectives">
            <li><code>instanceof</code> zinciriyle kopyalamanın <b>sorunlarını</b> görmek</li>
            <li>Nesneye kendi kopyasını ürettirmek: <code>kopyala()</code> + <b>kopya kurucu</b></li>
            <li>Rolleri tanımak: ${['prototype', 'concretePrototype', 'client', 'manager'].map((r) => ui.roleChip(r)).join(' ')}</li>
            <li><b>Sığ</b> ve <b>derin</b> kopyayı bellekte görmek</li>
            <li>Java’nın <code>clone()</code> tuzaklarını ve <b>şablon kataloğunu</b> öğrenmek</li>
          </ol>
        </article>
      </div>
      <div class="intro-cta">
        <button class="btn btn-primary btn-lg" type="button" data-go>Sorunla başlayalım →</button>
        <a class="btn btn-ghost" href="#/builder">← Önceki kalıp: Builder</a>
        <span class="hint">ya da klavyede <kbd>→</kbd> tuşuna basın</span>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-go]').addEventListener('click', () => ctx.goScene('sorun'));

    // Şablon iki kez kopyalanır; ikinci kopyaya "zımba" eklenir, şablon temiz kalır (dekoratif döngü).
    const svg = el.querySelector('.hero-svg');
    const k = {};
    DP.$$('[data-k]', svg).forEach((n) => (k[n.getAttribute('data-k')] = n));
    let t = 0;
    const tick = () => {
      const ph = t % 8; // 0: şablon · 1: kopya 1 · 2: kopya 2 · 3: zımba · 4-7: bekle
      ['c1', 'c2'].forEach((c, i) => {
        const on = ph >= i + 1;
        k[c].classList.toggle('is-on', on);
        if (ph === i + 1) DP.flash(k[c], 'is-enter');
      });
      k.beam.classList.toggle('is-on', ph === 1 || ph === 2);
      k.beam.setAttribute('d', ph === 2 ? 'M150 176 C 230 120, 330 120, 404 170' : 'M150 176 C 180 140, 210 140, 236 170');
      if (ph === 1 || ph === 2) DP.flash(k.tpl, 'is-flash');
      const z = ph >= 3;
      k.c2.classList.toggle('has-z', z);
      if (ph === 3) DP.flash(k.c2, 'is-write');
      k.ok.classList.toggle('is-on', z);
      DP.$$('.ph-code', svg).forEach((n) => n.classList.toggle('is-on', ph === 1 || ph === 2));
      t++;
    };
    tick();
    const timer = setInterval(tick, 1400);
    return { destroy: () => clearInterval(timer) };
  };

  function heroSvg() {
    const card = (x, items, key, extra) => `
      <g transform="translate(${x},52) scale(0.78)">${PT.art.listCard(items, { title: 'İÇERİK' })}</g>${extra || ''}`;
    const cord = (x) => `<path class="ss-cord" d="M${x + 62} ${52 + PT.art.listH(2) * 0.78 - 2} Q ${x + 66} 170 ${x + 64} 184"/>`;
    return `
    <svg class="hero-svg pt-hero" viewBox="0 0 560 360" role="img" aria-label="Bir şablon koli iki kez kopyalanıyor; kopyalardan birine zımba ekleniyor, şablon değişmiyor">
      <text class="h-caption" x="280" y="30" text-anchor="middle">Sıfırdan kurma → var olanı kopyala</text>
      ${card(20, ['A4 kağıt', 'toner'])}${cord(20)}
      <g class="ph-copy" data-k="c1">${card(200, ['A4 kağıt', 'toner'])}${cord(200)}<g transform="translate(196,284)"><g class="ph-in">${PT.art.koli({ label: 'Ayşe K.', kg: 12 })}</g></g></g>
      <g class="ph-copy" data-k="c2">
        <g transform="translate(372,52) scale(0.78)">${PT.art.listCard(['A4 kağıt', 'toner', 'zımba'], { title: 'İÇERİK', hl: 'zımba' })}</g>
        <path class="ss-cord" d="M${372 + 62} ${52 + PT.art.listH(3) * 0.78 - 2} Q ${372 + 66} 176 ${372 + 64} 184"/>
        <g transform="translate(368,284)"><g class="ph-in">${PT.art.koli({ label: 'Ayşe K.', kg: 12 })}</g></g></g>
      <g class="ph-tpl" data-k="tpl" transform="translate(24,284)">${PT.art.koli({ label: 'Ayşe K.', kg: 12, ribbon: 'ŞABLON' })}</g>
      <path class="ph-beam" data-k="beam" d="M150 176 C 180 140, 210 140, 236 170"/>
      <rect class="bh-table" x="10" y="284" width="540" height="10" rx="3"/>
      <g class="ph-ok" data-k="ok"><rect x="20" y="304" width="148" height="24" rx="12"/><text x="94" y="321" text-anchor="middle">✓ şablon temiz</text></g>
      <text class="h-sub ph-code" x="370" y="322" text-anchor="middle">Gonderi kopya = sablon.kopyala();</text>
      <text class="h-sub ph-hint" x="280" y="350" text-anchor="middle">new yok · türü bilmeden · pahalı kurulum yok</text>
    </svg>`;
  }

  // ================================================================== 2. SORUN
  PT.scenes.problem = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-46' });
    const left = kit.panel('Kalıpsız kod · <span class="ver"></span>', { cls: 'panel-code pt-left' });
    const right = kit.panel('Sipariş masası', { cls: 'panel-side pt-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'pt-cv' });
    const consoleEl = h('div', { class: 'console pt-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: PT.roleOf, special: PT.special });

    const viewHost = h('div', { class: 'pt-view' });
    const extra = h('div', { class: 'pt-extra' });
    right.body.append(viewHost, extra);
    const stage = new PT.DeskStage(viewHost);

    const files = (v) => {
      const F = PT.naive(v);
      return Object.keys(F).map((n) => ({ name: n + '.java', code: F[n] }));
    };
    const asMap = (v) => {
      const F = PT.naive(v);
      const m = {};
      Object.keys(F).forEach((n) => (m[n + '.java'] = F[n]));
      return m;
    };
    const out1 = (mode) =>
      PT.naiveOutput(1).map((l) => {
        if (l.again && mode === 'svc') return { t: l.t, bad: true, note: 'gereksiz: zaten doğrulanmıştı' };
        if (l.svc) return { t: l.t, dim: true };
        return { t: l.t };
      });
    const out2 = PT.naiveOutput(2).map((l) => (l.svc ? { t: l.t, dim: true } : l));
    const SIP = 'SiparisEkrani.java';

    const STEPS = [
      {
        t: 'Her hafta aynı sipariş',
        x: 'Ayşe Kırtasiye her hafta **aynı** koliyi istiyor. Sipariş ekranına **“Geçen haftakini tekrarla”** düğmesi eklendi: [[SiparisEkrani]] son gönderiye bakıp **aynısını** yeniden oluşturuyor. Çalışıyor… şimdilik.',
        v: 1, mark: ['Main.java', 'SiparisEkrani.tekrarla(kirtasiye)', 'focus'], out: out1(), animateOut: 2,
        stage: { item: C.kirtasiye, press: true, checks: ['ok', null, null], result: { state: 'new', cargo: C.kirtasiye }, svc: { n: 3 }, bubble: { at: 'right', text: 'Kopya hazır — ama **sıfırdan** kuruldu: yeni nesne, yeni kurucu çağrısı.' } },
      },
      {
        t: 'instanceof zinciri',
        x: 'Ekran, kopyalamak için gönderinin **somut sınıfını** tanımak zorunda: önce `instanceof` ile sorar, sonra alanları **getter**’larla tek tek okuyup `new` ile kurar. Her tür için ayrı bir dal. Getter’ı olmayan **private** bir alan olsaydı kopyaya hiç aktarılamazdı.',
        v: 1, mark: [SIP, ['if (son instanceof KoliGonderisi k)', 'throw new'], 'focus'], out: out1(),
        stage: { item: C.noter, press: true, checks: ['no', 'ok', null], result: { state: 'new', cargo: C.noter }, svc: { n: 4 }, hl: 'board', bubble: { at: 'left', text: 'İstemci her türü **tanımak** ve alanlarını **getter**’larla okumak zorunda.' } },
      },
      {
        t: 'Pahalı kurulum tekrarlanıyor',
        x: 'Kopya **kurucudan** geçtiği için adres **yeniden** doğrulanıyor (~2 sn). Oysa bu adres geçen hafta zaten doğrulanmıştı! İki gönderiyi tekrarlamak için **4** sorgu yapıldı; ikisi tamamen gereksiz.',
        v: 1, mark: ['Gonderi.java', 'AdresServisi.dogrula(alici);', 'bad'], out: out1('svc'),
        stage: { item: C.noter, checks: ['no', 'ok', null], result: { state: 'new', cargo: C.noter }, svc: { n: 4, busy: true }, hl: 'svc', bubble: { at: 'right', text: 'Adres zaten doğrulanmıştı. Her kopyada **yeniden** sorgu: ~2 sn × gönderi sayısı.', tone: 'bad' } },
      },
      {
        t: 'Yeni tür: PaletGonderisi',
        x: 'Lojistik ekibi [[PaletGonderisi]] ekledi. [[SiparisEkrani]]’ne kimse dokunmadı… ve program **çalışırken** çöktü: `IllegalArgumentException`. Her yeni gönderi türü bu `if` zincirine **elle** eklenmeli — unutulursa hata ancak müşteri düğmeye bastığında ortaya çıkar.',
        v: 2, diff: 1, mark: ['Main.java', 'tekrarla(fabrika)', 'bad'], out: out2, animateOut: 8,
        stage: { item: C.fabrika, press: true, checks: ['no', 'no', 'err'], result: { state: 'err' }, svc: { n: 5 }, hl: 'board', bubble: { at: 'right', text: '`Bilinmeyen gönderi türü: PaletGonderisi` — ekran yeni türü **tanımıyor**!', tone: 'bad' } },
      },
      {
        t: 'Teşhis — Kim kopyalamalı?',
        x: 'Kopyalama bilgisini **dışarıda**, her türü tanıyan bir istemcide tuttuk. Oysa kendi türünü ve alanlarını en iyi bilen, **nesnenin kendisi**. İşte Prototype: `son.kopyala()`.',
        v: 2, mark: null, diag: true, out: out2,
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
        left.head.querySelector('.ver').textContent = s.v === 1 ? 'sürüm 1.0 (Koli + Zarf)' : 'sürüm 2.0 (+ Palet)';
        cv.setFiles(files(s.v), { active: s.mark ? s.mark[0] : SIP, prev: s.diff ? asMap(s.diff) : null });
        if (s.mark) cv.mark(s.mark[0], s.mark[1], s.mark[2]);
        PT.renderConsole(consoleEl, '$ java Main', s.out, { animateFrom: info.animate && s.animateOut != null ? s.animateOut : null });
        stage.render(stageOf(i), prev >= 0 ? stageOf(prev) : null, { animate: info.animate && !!s.stage });
        if (s.diag) {
          extra.innerHTML = `
            <div class="req-card is-diagnosis">
              <div class="diag-title">Teşhis</div>
              <ul class="problems">
                <li>${md('**Somut sınıflara bağımlılık:** istemci her türü `instanceof` ile tanımak zorunda; yeni tür = istemcide yeni bir `if` (Açık/Kapalı İlkesi ihlali).')}</li>
                <li>${md('**Pahalı kurulumun tekrarı:** kopya kurucudan geçtiği için adres servisi her seferinde yeniden çağrılıyor.')}</li>
                <li>${md('**Kapsülleme delindi:** kopyalayabilmek için her alana getter açıldı; getter’ı olmayan private alan kopyalanamaz.')}</li>
              </ul>
            </div>
            <div class="sg-aside">${md('💬 **“Peki türünü kim biliyor?”** Gönderinin kendisi! Kopyalamayı nesneye bırakırsak istemcinin tek bildiği şu olur: `Gonderi kopya = son.kopyala();`')}</div>`;
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
  PT.scenes.solution = function (root, ctx) {
    const R = PT.refactor;
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-diag' });
    const left = kit.panel('Yeniden düzenleme (refactoring)', { cls: 'panel-code pt-left' });
    const right = kit.panel('Sınıf diyagramı', { cls: 'panel-side panel-diagram' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'pt-cv' });
    const consoleEl = h('div', { class: 'console pt-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: PT.roleOf, special: PT.special });
    const diagHost = h('div', { class: 'diag-host' });
    const recipe = h('ol', { class: 'recipe' });
    const legend = kit.umlLegend({ association: false, fmLabel: 'kopyala(): kopyalayarak oluşturur' });
    right.body.append(h('div', { class: 'recipe-wrap' }, h('div', { class: 'recipe-title' }, 'Dönüşüm tarifi'), recipe), diagHost, legend);
    ['Gonderi: soyut kopyala()', 'Kopya kurucular', 'İstemci: son.kopyala()'].forEach((t, i) => recipe.appendChild(h('li', { 'data-i': String(i + 1) }, t)));
    const diagram = new DP.ClassDiagram(diagHost, PT.solutionDiagram(0), { roles: PT.roles, roleTags: false });

    const crash = PT.naiveOutput(2).map((l) => (l.svc ? { t: l.t, dim: true } : l));
    const okOut = PT.output.map((t, j) => ({ t, dim: j < 3, ok: j >= 4 && j <= 6, note: j === 6 ? 'Palet de kopyalandı!' : j === 7 ? 'kopyalar servise gitmedi' : null }));
    const STEPS = [
      { t: 'Başlangıç — instanceof zinciri', x: 'Kopyalama bilgisi istemcide: [[SiparisEkrani]] her türü tanıyor ve Palet’te çöküyor. Üç adımda kopyalamayı **nesnelerin kendisine** taşıyacağız.', focus: 'SiparisEkrani.java', mark: ['if (son instanceof KoliGonderisi k)', 'throw new'], kind: 'bad', run: 'crash' },
      { t: 'Adım 1 — Gonderi: soyut kopyala()', x: '[[Gonderi]]’ye `public abstract Gonderi kopyala();` ekledik: “Her gönderi kendi kopyasını üretebilmeli.” Bu sözleşme **Prototype** rolüdür. Derleyici hemen uyarıyor: üç alt sınıf bu metodu henüz yazmadı.', focus: 'Gonderi.java', mark: 'public abstract Gonderi kopyala();', run: 'err' },
      { t: 'Adım 2 — Kopya kurucular', x: '[[Gonderi]]’ye bir **kopya kurucu** ekledik: alanları kaynaktan kopyalar, adres servisine **gitmez**. Her alt sınıf da kendi kopya kurucusunu ve `kopyala()`’yı yazar: `return new KoliGonderisi(this);`. Private `agirlik` alanını getter olmadan, **kendi sınıfı** kopyalıyor.', focus: 'KoliGonderisi.java', marks: ['private KoliGonderisi(KoliGonderisi kaynak)', 'return new KoliGonderisi(this);'], run: 'crash' },
      { t: 'Adım 3 — İstemci: son.kopyala()', x: '`instanceof` zinciri silindi; [[SiparisEkrani]] artık tek satır: `return son.kopyala();`. Getter’lar da gereksizleşti ve kaldırıldı. Palet bile kopyalanıyor, adres servisine **yalnızca 3** sorgu gitti.', focus: 'SiparisEkrani.java', mark: 'return son.kopyala();', run: 'ok' },
      { t: 'Sonuç — Ne kazandık?', x: '**Tür bağımsızlığı** (istemci somut sınıf adı bilmez), **ucuz kopya** (pahalı kurulum bir kez), **kapsülleme** (getter’sız; alanları sınıfın kendisi kopyalar), **genişleyebilirlik** (yeni tür = yalnızca yeni alt sınıf). Kopya kurucudaki `new ArrayList<>(…)` satırına dikkat: neden gerekli? Sıradaki sahnede!', focus: 'Gonderi.java', marks: ['protected Gonderi(Gonderi kaynak)', 'this.icerik = new ArrayList<>(kaynak.icerik);'], run: 'ok' },
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

        if (s.run === 'crash') PT.renderConsole(consoleEl, '$ javac *.java && java Main', crash, { animateFrom: info.animate && i === 0 ? 8 : null });
        else if (s.run === 'err') PT.renderConsole(consoleEl, '$ javac *.java', PT.refactorErrors(), { animateFrom: info.animate ? 0 : null, title: 'Derleyici' });
        else PT.renderConsole(consoleEl, '$ javac *.java && java Main', okOut, { animateFrom: info.animate && i === 3 ? 3 : null });

        diagram.update(PT.solutionDiagram(Math.min(i, 3)), { animate: info.animate });
        diagram.clearBadges();
        diagram.clearFocus();
        if (i === 0) {
          diagram.badge('SiparisEkrani', 'her türü tanır', 'bad');
          diagram.focus({ classes: ['SiparisEkrani'], edges: ['new-koli', 'new-zarf', 'new-palet'] });
        }
        if (i === 1) {
          diagram.badge('Gonderi', '+ kopyala()', 'new');
          ['KoliGonderisi', 'ZarfGonderisi', 'PaletGonderisi'].forEach((c) => diagram.badge(c, '✗ derlenmez', 'bad'));
          diagram.focus({ members: [['Gonderi', 'kopyala']] });
        }
        if (i === 2) {
          diagram.focus({ members: [['Gonderi', 'copyCtor'], ['KoliGonderisi', 'copyCtor'], ['KoliGonderisi', 'kopyala'], ['ZarfGonderisi', 'kopyala'], ['PaletGonderisi', 'kopyala']] });
        }
        if (i === 3) {
          diagram.badge('SiparisEkrani', 'tür bilmez', 'same');
          diagram.focus({ classes: ['SiparisEkrani', 'Gonderi'], edges: ['uses'] });
        }
        if (i === 4) {
          ['KoliGonderisi', 'ZarfGonderisi', 'PaletGonderisi'].forEach((c) => diagram.badge(c, 'kendini kopyalar', 'same'));
          diagram.focus({ members: [['Gonderi', 'kopyala'], ['Gonderi', 'copyCtor']] });
        }
        DP.$$('li', recipe).forEach((li, k) => {
          li.classList.toggle('is-done', k + 1 < i || (i === 4 && k < 3));
          li.classList.toggle('is-current', k + 1 === i);
        });
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };
})();
