/*
 * Bridge — sahneler (1/3): Giriş, Sorun, Çözüm
 */
(function () {
  'use strict';
  const BR = DP.br;
  const { h } = DP;
  const kit = DP.kit;
  const md = (t) => DP.md(t, BR.roleOf);
  BR.md = md;
  BR.scenes = BR.scenes || {};
  const ui = (BR.ui = {
    foot: (root) => kit.foot(root, BR.roleOf),
    roleChip: (key) => kit.roleChip(BR.roles, key),
  });

  /** Konsol: satırlar {t, err, ok, bad, dim, note}. */
  BR.renderConsole = function (el, cmd, lines, o) {
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
  /** Giriş animasyonunun eşleşmeleri: önce yazıcı, sonra etiket türü değişir */
  const HERO = [
    ['kirilacak', 'zebra'],
    ['kirilacak', 'pdf'],
    ['kirilacak', 'termal'],
    ['iade', 'termal'],
    ['standart', 'termal'],
    ['standart', 'zebra'],
  ];

  BR.scenes.intro = function (root, ctx) {
    const el = h('div', { class: 'scene scene-intro' });
    el.innerHTML = `
      <div class="intro-grid">
        <section class="intro-main">
          <div class="chips">
            <span class="chip chip-cat is-struct">Yapısal · Structural</span>
            <span class="chip">GoF · 1994</span>
            <span class="chip">Diğer adı: Handle/Body</span>
          </div>
          <h1 class="intro-title">Bridge</h1>
          <div class="intro-sub">Köprü <span>· “iki boyutu ayır, bir alanla bağla”</span></div>
          <blockquote class="intent">
            <div class="intent-label">Amaç</div>
            <p>Bir soyutlamayı <b>gerçekleştiriminden ayır</b>; böylece ikisi <b>birbirinden bağımsız olarak</b> değişebilsin.</p>
            <footer>— Gamma, Helm, Johnson, Vlissides (GoF), <i>Design Patterns</i>, 1994</footer>
          </blockquote>
        </section>
        <section class="intro-hero" aria-label="Kalıbın kısa animasyonu">${heroSvg()}</section>
      </div>
      <div class="intro-cards">
        <article class="card">
          <h3><span class="card-ic">🖨️</span> Günlük hayattan</h3>
          <p>Word’den, tarayıcıdan ya da PDF okuyucudan <b>Yazdır</b> dersiniz; yazıcının markası fark etmez. Uygulamalar bir yanda,
          yazıcı <b>sürücüleri</b> öbür yanda çoğalır; ikisini bağlayan sürücü arayüzü bir <b>köprüdür</b>. Evrensel kumanda da öyle:
          aynı tuşlar, her markada başka bir sinyal.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🌉</span> Fikir</h3>
          <p>Bir sınıfta <b>iki bağımsız boyut</b> varsa (etiket türü × yazıcı), kalıtım ikisini tek ağaca sıkıştırır: <b>m × n</b> sınıf.
          Köprü onları <b>iki hiyerarşiye</b> ayırır ve birini öbürüne bir <b>alanla</b> bağlar: <code>protected Yazici yazici;</code>
          Böylece <b>m + n</b> sınıf yeter.</p>
          <p>Decorator’da tek boyuta katman ekliyorduk; burada <b>iki boyutu ayırıyoruz</b>.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🎯</span> Bu derste</h3>
          <ol class="objectives">
            <li>İki boyutu tek hiyerarşide tutmanın <b>m × n</b> bedelini görmek</li>
            <li>Soyutlamayı gerçekleştirimden ayırmak: <code>Etiket</code> → <code>Yazici</code></li>
            <li>Rolleri tanımak: ${['abstraction', 'refinedAbstraction', 'implementor', 'concreteImplementor'].map((r) => ui.roleChip(r)).join(' ')}</li>
            <li>İlkel çağrıların köprüden geçip <b>cihazın diline</b> çevrilişini izlemek</li>
            <li>Yazıcıyı <b>çalışma anında</b> değiştirmek; Adapter’la farkı görmek</li>
          </ol>
        </article>
      </div>
      <div class="intro-cta">
        <button class="btn btn-primary btn-lg" type="button" data-go>Sorunla başlayalım →</button>
        <a class="btn btn-ghost" href="#/adapter">← Önceki kalıp: Adapter</a>
        <span class="hint">ya da klavyede <kbd>→</kbd> tuşuna basın</span>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-go]').addEventListener('click', () => ctx.goScene('sorun'));

    // Bir etiket türü ve bir yazıcı seçilir; çağrı köprüden geçer, yazıcının diline çevrilir (dekoratif döngü).
    const svg = el.querySelector('.hero-svg');
    const k = {};
    DP.$$('[data-k]', svg).forEach((n) => (k[n.getAttribute('data-k')] = n));
    let t = 0;
    const tick = () => {
      const [label, printer] = HERO[t % HERO.length];
      const li = BR.labelOrder.indexOf(label);
      const pi = ['zebra', 'pdf', 'termal'].indexOf(printer);
      BR.labelOrder.forEach((l) => k['l-' + l].classList.toggle('is-on', l === label));
      ['zebra', 'pdf', 'termal'].forEach((p) => k['p-' + p].classList.toggle('is-on', p === printer));
      // köprü sabit; seçilen etikete ve yazıcıya giden rampalar yer değiştirir
      k['ramp-l'].setAttribute('d', `M170 ${100 + li * 60} L198 165`);
      k['ramp-r'].setAttribute('d', `M362 165 L390 ${99 + pi * 60}`);
      const rows = BR.prims(label);
      const first = rows.findIndex((r) => r.p === 'yazi');
      k.cmd.textContent = BR.lines(label, printer)[first];
      k.expr.textContent = `new ${BR.LABELS[label].cls}(new ${BR.PRINTERS[printer].cls}())`;
      // jeton güvertede soldan sağa yürür
      k.tok.style.transition = 'none';
      k.tok.style.transform = 'translate(246px, 146px)';
      void k.tok.getBoundingClientRect();
      k.tok.style.transition = '';
      k.tok.style.transform = 'translate(314px, 146px)';
      DP.flash(k.cmd, 'is-pop');
      t++;
    };
    tick();
    const timer = setInterval(tick, 1900);
    return { destroy: () => clearInterval(timer) };
  };

  function heroSvg() {
    const esc = DP.esc;
    const tag = (l, y) => `<g class="bh-tag" data-k="l-${l}"><path d="M16 ${y + 18} L28 ${y + 6} H170 V${y + 50} H28 L16 ${y + 38} Z"/><circle cx="30" cy="${y + 28}" r="3.5"/><text x="44" y="${y + 33}">${esc(BR.LABELS[l].name)}</text></g>`;
    const dev = (p, y) => `<g class="bh-dev" data-k="p-${p}"><rect x="390" y="${y + 4}" width="154" height="46" rx="10"/>${BR.icon(p, 398, y + 9)}<text x="446" y="${y + 33}">${esc(BR.PRINTERS[p].name)}</text></g>`;
    return `
    <svg class="hero-svg br-hero" viewBox="0 0 560 360" role="img" aria-label="Etiket türleri ile yazıcılar arasında bir köprü; çağrı köprüden geçip yazıcının diline çevriliyor">
      <text class="h-caption" x="280" y="30" text-anchor="middle">İki boyut → iki hiyerarşi, arada bir köprü</text>
      <text class="bh-side" x="93" y="62" text-anchor="middle">ETİKETLER</text>
      <text class="bh-side" x="467" y="62" text-anchor="middle">YAZICILAR</text>
      ${tag('standart', 72)}${tag('kirilacak', 132)}${tag('iade', 192)}
      ${dev('zebra', 72)}${dev('pdf', 132)}${dev('termal', 192)}
      <rect class="bh-water" x="196" y="190" width="168" height="70" rx="8"/>
      <path class="bh-arch" d="M212 236 Q280 128 348 236"/>
      <path class="bh-ramp" data-k="ramp-l" d="M170 160 L198 165"/>
      <path class="bh-ramp" data-k="ramp-r" d="M362 165 L390 159"/>
      <rect class="bh-deck" x="194" y="160" width="172" height="10" rx="3"/>
      <text class="bh-span" x="280" y="216" text-anchor="middle">yazici</text>
      <g class="bh-tok" data-k="tok"><rect x="-52" y="-13" width="104" height="26" rx="13"/><text x="0" y="5" text-anchor="middle">yazi(…)</text></g>
      <text class="bh-cmd" data-k="cmd" x="280" y="292" text-anchor="middle"></text>
      <text class="h-sub bh-expr" data-k="expr" x="280" y="322" text-anchor="middle"></text>
      <text class="bh-count" x="280" y="348" text-anchor="middle">3 etiket × 3 yazıcı = 9 eşleşme · yalnızca 3 + 3 sınıf</text>
    </svg>`;
  }

  // ================================================================== 2. SORUN
  BR.scenes.problem = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-46' });
    const left = kit.panel('Kalıpsız kod · <span class="ver"></span>', { cls: 'panel-code br-left' });
    const right = kit.panel('Eşleşme matrisi <span class="panel-sub">· her hücre bir sınıf</span>', { cls: 'panel-side br-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'br-cv' });
    const consoleEl = h('div', { class: 'console br-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: BR.roleOf, special: BR.special });

    const viewHost = h('div', { class: 'br-view' });
    const extra = h('div', { class: 'br-extra' });
    right.body.append(viewHost, extra);
    const stage = new BR.Matrix(viewHost);

    const files = (v) => {
      const F = BR.naive(v);
      return BR.naiveOrder(v).map((n) => ({ name: n + '.java', code: F[n] }));
    };
    const asMap = (v) => {
      const F = BR.naive(v);
      const m = {};
      Object.keys(F).forEach((n) => (m[n + '.java'] = F[n]));
      return m;
    };
    const garbled = BR.MOJIBAKE[BR.G.vazo.alici];
    const out = (v) =>
      BR.naiveOutput(v).map((l) => {
        if (l.bad) return { t: l.t, bad: true, note: '^CI28 unutuldu!' };
        if (v === 'v4' && l.cls === BR.FORGOT && l.t.includes(BR.G.vazo.alici)) return { t: l.t, bad: true, note: 'basılan: ' + garbled };
        return { t: l.t };
      });
    const F = BR.FORGOT;

    const STEPS = [
      {
        t: 'Tek yazıcı: Zebra',
        x: 'Depoda tek bir yazıcı var: **Zebra** (ZPL komutları). Her etiket sınıfı komutlarını kendisi yazıyor; kırılacak etiketi bir çerçeve ve uyarı ekliyor. İki sınıf, henüz sorun yok.',
        v: 'v1', mark: ['KirilacakEtiket.java', 'KIRILACAK', 'focus'], out: out('v1'),
        stage: { v: 'v1', banner: { text: '1 yazıcı × 2 etiket türü = **2 sınıf**.' } },
      },
      {
        t: 'İkinci yazıcı: PDF',
        x: 'Müşteriler etiketi **e-postayla** istiyor. Her etiket türünün bir de PDF sürümü yazıldı; sınıf adları artık **iki şey** söylüyor: yazıcı + etiket türü. Kırılacak uyarısının mantığı iki sınıfta tekrar ediyor.',
        v: 'v2', diff: 'v1', mark: ['PdfKirilacakEtiket.java', 'KIRILACAK', 'focus'], out: out('v2'), animateOut: 0,
        stage: { v: 'v2', hl: { 'kirilacak.zebra': 'dup', 'kirilacak.pdf': 'dup' }, banner: { text: '2 yazıcı × 2 etiket = **4 sınıf**; kırılacak uyarısı iki yerde.' } },
      },
      {
        t: 'Yeni satır, yeni sütun',
        x: '**İade etiketi** ve kuryenin el terminali (**Termal**, ESC/POS) geldi: **3 × 3 = 9** sınıf. Yeni bir etiket türü bir **satır dolusu**, yeni bir yazıcı bir **sütun dolusu** sınıf demek: 4 × 4 = 16, 5 × 5 = 25…',
        v: 'v3', diff: 'v2', mark: ['TermalIadeEtiketi.java', 'İADE', 'focus'], out: out('v3'), animateOut: 0,
        stage: { v: 'v3', banner: { text: '3 etiket × 3 yazıcı = **9 sınıf**. Her yeni tür ya da cihaz bir sıra dolusu sınıf.', tone: 'bad' } },
      },
      {
        t: 'Türkçe karakter düzeltmesi',
        x: 'Depodan şikâyet: Zebra etiketlerinde **ş, ı, ğ** bozuk çıkıyor. Çözüm ZPL’de bilinen bir ayar: `^CI28` (UTF-8). Zebra kodu **üç sınıfta** yazılı; ikisi düzeltildi, biri **unutuldu**. Cam vazonun etiketinde alıcının adı okunmuyor.',
        v: 'v4', diff: 'v3', mark: [F + '.java', 'System.out.println("[Zebra] ^XA");', 'bad'], out: out('v4'), animateOut: 4,
        stage: { v: 'v4', hl: { 'standart.zebra': 'ok', 'iade.zebra': 'ok', 'kirilacak.zebra': 'bad' }, banner: { text: `Cam vazonun etiketinde alıcı: **${garbled}**`, tone: 'bad' } },
      },
      {
        t: 'Teşhis — İki boyut, tek hiyerarşi',
        x: 'Etiket türü ile yazıcı **iki bağımsız boyut**; kalıtım ikisini tek ağaca sıkıştırdı. Ya bu iki boyutu **iki ayrı hiyerarşiye** ayırıp aralarına bir **köprü** kursak?',
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
        left.head.querySelector('.ver').textContent = { v1: 'sürüm 1.0 (Zebra)', v2: 'sürüm 2.0 (+ PDF)', v3: 'sürüm 3.0 (+ İade, + Termal)', v4: 'sürüm 3.1 (Türkçe karakter)' }[s.v];
        cv.setFiles(files(s.v), { active: s.mark ? s.mark[0] : 'Main.java', prev: s.diff ? asMap(s.diff) : null });
        if (s.mark) cv.mark(s.mark[0], s.mark[1], s.mark[2]);
        BR.renderConsole(consoleEl, '$ javac *.java && java Main', s.out, { animateFrom: info.animate && s.animateOut != null ? s.animateOut : null });
        stage.render(stageOf(i), prev >= 0 ? stageOf(prev) : null, { animate: info.animate && !!s.stage });
        if (s.diag) {
          extra.innerHTML = `
            <div class="req-card is-diagnosis">
              <div class="diag-title">Teşhis</div>
              <ul class="problems">
                <li>${md('**Sınıf patlaması:** m etiket türü × n yazıcı = m × n sınıf. Her yeni tür bir satır, her yeni cihaz bir sütun dolusu sınıf.')}</li>
                <li>${md('**Kod iki eksende kopyalanıyor:** etiket mantığı her yazıcıda, cihaz komutları her etikette. Bir düzeltme bir sınıfta unutuldu.')}</li>
                <li>${md('**Kalıcı bağ:** etiket türü ile yazıcı derleme anında birbirine kaynak; Zebra’da kâğıt bitse aynı etiketi PDF’e göndermek için başka bir sınıf gerekir.')}</li>
              </ul>
            </div>
            <div class="sg-aside">${md('💬 **Bilgisayarınızdaki Yazdır düğmesi gibi:** uygulama yazıcının markasını bilmez; araya bir **sürücü** girer. Uygulamalar da sürücüler de birbirinden bağımsız çoğalır.')}</div>`;
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
  BR.scenes.solution = function (root, ctx) {
    const R = BR.refactor;
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-diag' });
    const left = kit.panel('Yeniden düzenleme (refactoring)', { cls: 'panel-code br-left' });
    const right = kit.panel('Sınıf diyagramı', { cls: 'panel-side panel-diagram' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'br-cv' });
    const consoleEl = h('div', { class: 'console br-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: BR.roleOf, special: BR.special });
    const diagHost = h('div', { class: 'diag-host' });
    const recipe = h('ol', { class: 'recipe' });
    const legend = kit.umlLegend({ aggregation: true, fmLabel: 'cihazın diline çeviren gerçekleştirim' });
    right.body.append(h('div', { class: 'recipe-wrap' }, h('div', { class: 'recipe-title' }, 'Dönüşüm tarifi'), recipe), diagHost, legend);
    ['Gerçekleştirici arayüzü', 'Soyutlama + köprü', 'Özelleşmiş soyutlamalar', 'İstemci birleştirir'].forEach((t, i) => recipe.appendChild(h('li', { 'data-i': String(i + 1) }, t)));
    const diagram = new DP.ClassDiagram(diagHost, BR.solutionDiagram(0), { roles: BR.roles, roleTags: false });

    const bugOut = BR.naiveOutput('v4').map((l) => (l.bad ? { t: l.t, bad: true, note: 'hâlâ ^CI28 yok' } : { t: l.t, dim: true }));
    const okOut = BR.output.map((t, j) => ({ t, ok: j === 4, note: j === 4 ? '^CI28 ✓ (tek yerde yazılı)' : null }));
    const F = BR.FORGOT;
    const STEPS = [
      { t: 'Başlangıç — dokuz sınıf', x: 'Dokuz eşleşme sınıfı ve bir sınıfta unutulmuş bir düzeltme. Dört adımda iki boyutu **iki ayrı hiyerarşiye** ayıracak, aralarına bir köprü kuracağız.', focus: F + '.java', mark: 'System.out.println("[Zebra] ^XA");', kind: 'bad', run: 'bug' },
      { t: 'Adım 1 — Gerçekleştirici: Yazici', x: 'İlkel işlemleri bir arayüze çıkardık: [[Yazici]] — `basla`, `yazi`, `barkod`, `cerceve`, `bitir`. Her cihaz **bir kez** yazılır: [[ZebraYazici]], [[PdfYazici]], [[TermalYazici]]. `^CI28` artık tek bir yerde: `ZebraYazici.basla()`.', focus: 'ZebraYazici.java', mark: '^XA^CI28', run: 'bug' },
      { t: 'Adım 2 — Soyutlama ve köprü: Etiket', x: '[[Etiket]] yazıcıyı bir **alanda** tutar: `protected Yazici yazici;` — köprü bu alan. Etiket **ne** basılacağını bilir (adres, barkod); **nasıl** basılacağını yazıcıya bırakır: `yazici.yazi(…)`.', focus: 'Etiket.java', marks: ['protected Yazici yazici;', 'yazici.yazi(5, y, g.alici());'], run: 'bug' },
      { t: 'Adım 3 — Özelleşmiş etiketler', x: '[[KirilacakEtiket]] ve [[IadeEtiketi]] yalnızca **etiket mantığını** taşır: çerçeve, uyarı, İADE başlığı. İçlerinde tek bir ZPL ya da PDF komutu yok; her yazıcıyla çalışırlar.', focus: 'KirilacakEtiket.java', marks: ['yazici.cerceve(2, 2, 96, 56);', 'yazici.yazi(5, 5, "KIRILACAK");'], run: 'bug' },
      { t: 'Adım 4 — İstemci köprüyü kurar', x: '`Main` etiketi ve yazıcıyı **birleştiriyor**: `new KirilacakEtiket(zebra)`. Dokuz eşleşme sınıfı **silindi**; yerlerinde 3 + 3 sınıf var. Konsola bakın: cam vazonun etiketi de artık `^XA^CI28` ile başlıyor.', focus: 'Main.java', mark: 'new KirilacakEtiket(zebra).yazdir(vazo);', run: 'ok' },
      { t: 'Sonuç — Ne kazandık?', x: 'Sınıf sayısı **m × n yerine m + n**. Her bilgi **tek yerde**: etiket mantığı etikette, cihaz komutları yazıcıda. İki hiyerarşi **bağımsız** büyür; yazıcı **çalışma anında** seçilir, hatta değiştirilir. Bedeli: bir dolaylama ve iyi düşünülmüş bir ilkel arayüz.', focus: 'Etiket.java', mark: 'protected Yazici yazici;', run: 'ok' },
    ];

    const filesAt = (i) => BR.refactorOrder.filter((k) => R[i][k]).map((k) => ({ name: k + '.java', code: R[i][k] }));
    const asMap = (i) => {
      const m = {};
      Object.keys(R[i]).forEach((k) => (m[k + '.java'] = R[i][k]));
      return m;
    };
    const IMPLS = ['ZebraYazici', 'PdfYazici', 'TermalYazici'];

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

        if (s.run === 'bug') BR.renderConsole(consoleEl, '$ javac *.java && java Main', bugOut, { animateFrom: info.animate && i === 0 ? 4 : null });
        else BR.renderConsole(consoleEl, '$ javac *.java && java Main', okOut, { animateFrom: info.animate && i === 4 ? 0 : null });

        diagram.update(BR.solutionDiagram(Math.min(i, 4)), { animate: info.animate });
        diagram.clearBadges();
        diagram.clearFocus();
        if (i === 0) diagram.badge('ghost', '^CI28 birinde yok', 'bad');
        if (i === 1) {
          diagram.badge('Yazici', 'YENİ', 'new');
          diagram.badge('ZebraYazici', '^CI28 burada', 'new');
          diagram.focus({ classes: ['Yazici'].concat(IMPLS), edges: ['r-zebra', 'r-pdf', 'r-termal'] });
        }
        if (i === 2) {
          diagram.badge('Etiket', 'köprü: yazici', 'new');
          diagram.focus({ classes: ['Etiket'], edges: ['kopru'], members: [['Etiket', 'yazici']] });
        }
        if (i === 3) {
          ['KirilacakEtiket', 'IadeEtiketi'].forEach((c) => diagram.badge(c, 'YENİ', 'new'));
          diagram.focus({ classes: ['KirilacakEtiket', 'IadeEtiketi'], edges: ['g-kirilacak', 'g-iade'] });
        }
        if (i === 4) diagram.focus({ classes: ['Main'], edges: ['uses'] });
        if (i === 5) diagram.focus({ classes: ['Etiket', 'Yazici'], edges: ['kopru'] });
        DP.$$('li', recipe).forEach((li, k) => {
          li.classList.toggle('is-done', k + 1 < i || (i === 5 && k < 4));
          li.classList.toggle('is-current', k + 1 === i);
        });
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };
})();
