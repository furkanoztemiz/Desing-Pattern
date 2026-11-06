/*
 * Composite — sahneler (1/3): Giriş, Sorun, Çözüm
 */
(function () {
  'use strict';
  const CP = DP.cp;
  const { h } = DP;
  const kit = DP.kit;
  const md = (t) => DP.md(t, CP.roleOf);
  CP.md = md;
  CP.scenes = CP.scenes || {};
  const ui = (CP.ui = {
    foot: (root) => kit.foot(root, CP.roleOf),
    roleChip: (key) => kit.roleChip(CP.roles, key),
  });

  /** Konsol: satırlar {t, err, ok, bad, dim, note}. */
  CP.renderConsole = function (el, cmd, lines, o) {
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
  /** Giriş animasyonunun küçük ağacı: Sipariş > Aksesuar > Saat kutusu */
  const HT = { siparis: 300, laptop: 2000, aksesuar: 100, mouse: 100, saatKutusu: 100, saat: 200 };
  /** Her adım: yığın (açık çağrılar), etkin satır, kolilerin ara toplamları */
  const HERO = [
    { stack: [], sums: {} },
    { stack: ['siparis'], on: 'siparis', sums: { siparis: 300 } },
    { stack: ['siparis', 'laptop'], on: 'laptop', sums: { siparis: 300 }, ret: '2000' },
    { stack: ['siparis'], on: 'siparis', sums: { siparis: 2300 } },
    { stack: ['siparis', 'aksesuar'], on: 'aksesuar', sums: { siparis: 2300, aksesuar: 100 } },
    { stack: ['siparis', 'aksesuar', 'mouse'], on: 'mouse', sums: { siparis: 2300, aksesuar: 100 }, ret: '100' },
    { stack: ['siparis', 'aksesuar', 'saatKutusu'], on: 'saatKutusu', sums: { siparis: 2300, aksesuar: 200, saatKutusu: 100 } },
    { stack: ['siparis', 'aksesuar', 'saatKutusu', 'saat'], on: 'saat', sums: { siparis: 2300, aksesuar: 200, saatKutusu: 100 }, ret: '200' },
    { stack: ['siparis', 'aksesuar', 'saatKutusu'], on: 'saatKutusu', sums: { siparis: 2300, aksesuar: 200, saatKutusu: 300 }, done: ['saatKutusu'] },
    { stack: ['siparis', 'aksesuar'], on: 'aksesuar', sums: { siparis: 2300, aksesuar: 500, saatKutusu: 300 }, done: ['saatKutusu', 'aksesuar'] },
    { stack: ['siparis'], on: 'siparis', sums: { siparis: 2800, aksesuar: 500, saatKutusu: 300 }, done: ['saatKutusu', 'aksesuar', 'siparis'] },
    { stack: [], sums: { siparis: 2800, aksesuar: 500, saatKutusu: 300 }, done: ['saatKutusu', 'aksesuar', 'siparis'], result: true },
    { stack: [], sums: { siparis: 2800, aksesuar: 500, saatKutusu: 300 }, done: ['saatKutusu', 'aksesuar', 'siparis'], result: true },
  ];
  const HV = { siparis: 'siparis', laptop: 'laptop', aksesuar: 'aksesuar', mouse: 'mouse', saatKutusu: 'saatKutusu', saat: 'saat' };

  CP.scenes.intro = function (root, ctx) {
    const el = h('div', { class: 'scene scene-intro' });
    el.innerHTML = `
      <div class="intro-grid">
        <section class="intro-main">
          <div class="chips">
            <span class="chip chip-cat is-struct">Yapısal · Structural</span>
            <span class="chip">GoF · 1994</span>
            <span class="chip">Parça–bütün hiyerarşisi</span>
          </div>
          <h1 class="intro-title">Composite</h1>
          <div class="intro-sub">Bileşik <span>· “ürün de bir parça, koli de”</span></div>
          <blockquote class="intent">
            <div class="intent-label">Amaç</div>
            <p>Nesneleri <b>parça–bütün</b> hiyerarşilerini temsil eden <b>ağaç yapılarında</b> birleştir. Composite, istemcilerin tekil nesnelere ve nesne bileşimlerine <b>aynı biçimde</b> davranmasını sağlar.</p>
            <footer>— Gamma, Helm, Johnson, Vlissides (GoF), <i>Design Patterns</i>, 1994</footer>
          </blockquote>
        </section>
        <section class="intro-hero" aria-label="Kalıbın kısa animasyonu">${heroSvg()}</section>
      </div>
      <div class="intro-cards">
        <article class="card">
          <h3><span class="card-ic">📁</span> Günlük hayattan</h3>
          <p>Bilgisayarınızda bir <b>klasörün boyutunu</b> sorarsınız; klasör de içindekilere sorar: dosyalar cevap verir, alt klasörler
          aynı soruyu kendi içlerine sorar. Klasörü dosya gibi kopyalar, taşır, silersiniz. Ordu da öyle: “kaç kişi?” sorusu taburdan
          bölüğe, takıma iner; cevaplar yukarı toplanır.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">📦</span> Fikir</h3>
          <p>Ürün de koli de <b>aynı arayüzü</b> uygular: <code>Parca</code>. Ürün soruyu <b>kendisi</b> cevaplar (yaprak);
          koli soruyu <b>içindekilere</b> sorar ve cevapları birleştirir (bileşik). Kolinin içinde ürün de olabilir, başka bir koli de:
          ağaç <b>istediği kadar</b> derinleşir.</p>
          <p>Decorator tek bir nesneyi sarar; Composite <b>çok sayıda</b> parçayı bir araya getirir.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🎯</span> Bu derste</h3>
          <ol class="objectives">
            <li>İç içe döngülerin ağacın <b>derinliğinde</b> nasıl kör kaldığını görmek</li>
            <li>Ürün ile koliyi <b>tek arayüzde</b> buluşturmak: <code>Parca</code></li>
            <li>Rolleri tanımak: ${['component', 'leaf', 'composite'].map((r) => ui.roleChip(r)).join(' ')}</li>
            <li>Özyinelemeyi izlemek: çağrı aşağı iner, cevaplar yukarı toplanır</li>
            <li><b>Şeffaf</b> ve <b>güvenli</b> tasarımı karşılaştırmak</li>
          </ol>
        </article>
      </div>
      <div class="intro-cta">
        <button class="btn btn-primary btn-lg" type="button" data-go>Sorunla başlayalım →</button>
        <a class="btn btn-ghost" href="#/bridge">← Önceki kalıp: Bridge</a>
        <span class="hint">ya da klavyede <kbd>→</kbd> tuşuna basın</span>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-go]').addEventListener('click', () => ctx.goScene('sorun'));

    // agirlik() çağrısı aşağı iner, cevaplar yukarı toplanır (dekoratif döngü)
    const svg = el.querySelector('.hero-svg');
    const k = {};
    DP.$$('[data-k]', svg).forEach((n) => (k[n.getAttribute('data-k')] = n));
    let t = 0;
    const tick = () => {
      const s = HERO[t % HERO.length];
      const done = s.done || [];
      Object.keys(HT).forEach((id) => {
        const g = k['n-' + id];
        g.classList.toggle('is-on', s.on === id);
        g.classList.toggle('is-done', done.includes(id));
        const b = k['b-' + id];
        if (b) b.textContent = id in s.sums ? s.sums[id] + ' g' : '? g';
      });
      // çağrı yığını: en üstte en son çağrılan
      k.stack.innerHTML = s.stack
        .map((id, i) => {
          const y = 252 - i * 34;
          const leaf = !['siparis', 'aksesuar', 'saatKutusu'].includes(id);
          const last = i === s.stack.length - 1;
          const text = `${HV[id]}.agirlik()${leaf && s.ret && last ? ' → ' + s.ret : ''}`;
          return `<g class="ch-frame${leaf ? ' is-leaf' : ''}${last ? ' is-top' : ''}"><rect x="352" y="${y}" width="190" height="28" rx="8"/><text x="447" y="${y + 19}" text-anchor="middle">${DP.esc(text)}</text></g>`;
        })
        .join('');
      k.result.classList.toggle('is-on', !!s.result);
      if (s.result && !(HERO[(t - 1 + HERO.length) % HERO.length] || {}).result) DP.flash(k.result, 'is-pop');
      t++;
    };
    tick();
    const timer = setInterval(tick, 1000);
    return { destroy: () => clearInterval(timer) };
  };

  function heroSvg() {
    const box = (id, x, y, w, hh, name) => `<g class="ch-box" data-k="n-${id}"><rect class="ch-frame-r" x="${x}" y="${y}" width="${w}" height="${hh}" rx="10"/><path class="ch-head" d="M${x} ${y + 10} Q${x} ${y} ${x + 10} ${y} H${x + w - 10} Q${x + w} ${y} ${x + w} ${y + 10} V${y + 32} H${x} Z"/>${CP.icon(id, x + 8, y + 6, 0.85)}<text class="ch-name" x="${x + 34}" y="${y + 22}">${name}</text><g class="ch-badge"><rect x="${x + w - 74}" y="${y + 6}" width="66" height="21" rx="10.5"/><text data-k="b-${id}" x="${x + w - 41}" y="${y + 21}" text-anchor="middle">? g</text></g></g>`;
    const item = (id, x, y, w, name, g) => `<g class="ch-item" data-k="n-${id}"><rect x="${x}" y="${y}" width="${w}" height="28" rx="8"/>${CP.icon(id, x + 6, y + 3, 0.9)}<text class="ch-iname" x="${x + 32}" y="${y + 19}">${name}</text><text class="ch-ig" x="${x + w - 8}" y="${y + 19}" text-anchor="end">${g} g</text></g>`;
    return `
    <svg class="hero-svg cp-hero" viewBox="0 0 560 360" role="img" aria-label="Koli içinde koli: ağırlık sorusu içeri iner, cevaplar dışarı toplanır">
      <text class="h-caption" x="280" y="26" text-anchor="middle">Ürün de bir parça, koli de: soru içeri iner, cevap dışarı çıkar</text>
      ${box('siparis', 16, 44, 318, 262, 'Sipariş')}
      ${item('laptop', 32, 84, 286, 'Laptop', 2000)}
      ${box('aksesuar', 32, 122, 286, 172, 'Aksesuar')}
      ${item('mouse', 48, 162, 254, 'Mouse', 100)}
      ${box('saatKutusu', 48, 200, 254, 84, 'Saat kutusu')}
      ${item('saat', 64, 240, 222, 'Saat', 200)}
      <text class="ch-stack-t" x="447" y="300" text-anchor="middle">çağrı yığını</text>
      <path class="ch-stack-base" d="M352 286 H542"/>
      <g data-k="stack"></g>
      <g class="ch-result" data-k="result"><rect x="148" y="318" width="264" height="32" rx="16"/><text x="280" y="339" text-anchor="middle">siparis.agirlik() → 2800 g</text></g>
    </svg>`;
  }

  // ================================================================== 2. SORUN
  CP.scenes.problem = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-46' });
    const left = kit.panel('Kalıpsız kod · <span class="ver"></span>', { cls: 'panel-code cp-left' });
    const right = kit.panel('Koliler <span class="panel-sub">· Kantar’ın döngüleri hangi kata iniyor?</span>', { cls: 'panel-side cp-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'cp-cv' });
    const consoleEl = h('div', { class: 'console cp-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: CP.roleOf, special: CP.special });

    const viewHost = h('div', { class: 'cp-view' });
    const extra = h('div', { class: 'cp-extra' });
    right.body.append(viewHost, extra);
    const stage = new CP.Boxes(viewHost, { minH: 640 });

    const files = (v) => {
      const F = CP.naive(v);
      return CP.naiveOrder(v).map((n) => ({ name: n + '.java', code: F[n] }));
    };
    const asMap = (v) => {
      const F = CP.naive(v);
      const m = {};
      Object.keys(F).forEach((n) => (m[n + '.java'] = F[n]));
      return m;
    };
    const out = (v) => CP.naiveOutput(v).map((l) => ({ t: l.t, bad: l.bad, note: l.note }));
    const reach = {
      v1: { laptop: 'l1', mouse: 'l1', sarj: 'l1' },
      v2: { laptop: 'l1', aksesuar: 'l1', kilif: 'l1', mouse: 'l2', sarj: 'l2' },
      v3: { laptop: 'l1', aksesuar: 'l1', kilif: 'l1', mouse: 'l2', sarj: 'l2', bisiklet: 'm' },
      v4: { laptop: 'l1', aksesuar: 'l1', kilif: 'l1', mouse: 'l2', sarj: 'l2', saatKutusu: 'miss', saat: 'miss', bisiklet: 'm' },
    };
    const st = (v, b) => ({ roots: CP.NAIVE_TREE[v], client: 'Kantar', reach: reach[v], scale: CP.naiveTotals(v), banner: b });
    const S4 = CP.NAIVE_TREE.v4[0]; // v4'teki sipariş kolisi
    const T4 = { program: CP.naiveWeight(S4, 'v4'), real: CP.weight(S4) };

    const STEPS = [
      {
        t: 'Tek koli',
        x: 'Laptop, mouse ve şarj aleti tek bir koliye kondu. [[Kantar]] kolinin içine **bir döngüyle** bakıp ağırlığı topluyor ve içerik listesini (manifesto) yazıyor. Henüz sorun yok.',
        v: 'v1', mark: ['Kantar.java', 'for (Urun u : koli.getUrunler()) {', 'focus'], out: out('v1'),
        stage: st('v1', { text: 'Tek koli, tek kat: Kantar **bir döngüyle** içine bakıyor.' }),
      },
      {
        t: 'Koli içinde koli',
        x: 'Mouse ve şarj aleti ezilmesin diye ayrı bir **aksesuar kutusuna** kondu; kutu da sipariş kolisine. [[Koli]] ikinci bir liste tuttu (`koliler`), [[Kantar]] **iç içe ikinci bir döngü** yazdı. Kodun şekli, ağacın şeklini kopyalıyor.',
        v: 'v2', diff: 'v1', mark: ['Kantar.java', ['// koli içinde koli', 'for (Koli ic : koli.getKoliler()) {'], 'focus'], out: out('v2'), animateOut: 0,
        stage: st('v2', { text: 'Koli içinde koli: **iç içe iki döngü**. Her kat, kodda bir döngü daha.' }),
      },
      {
        t: 'Kolisiz ürün',
        x: 'Bisiklet kolisiz gönderiliyor. [[Kantar]] ürün için **ayrı metotlar** yazdı: `agirlik(Urun)`, `listele(Urun)`. İstemci her seferinde elindekinin ürün mü koli mi olduğunu bilmek zorunda; ikisini tek bir listede gezemiyor.',
        v: 'v3', diff: 'v2', mark: ['Kantar.java', 'public static int agirlik(Urun u) {', 'focus'], out: out('v3'), animateOut: 6,
        stage: st('v3', { text: 'Ürün ve koli için **iki ayrı yol**: istemci önce türü bilmeli.' }),
      },
      {
        t: 'Bir kat daha: saat kutusu',
        x: `Depo, saati kendi **saat kutusuyla** aksesuar kutusuna koydu. Main’e üç satır eklendi; [[Kantar]]’a **dokunulmadı**. Döngüler iki kat iniyor, saat kutusu üçüncü katta: programa göre sipariş **${T4.program} g**, kantarda **${T4.real} g**. Aynı aksesuar kutusu tek başına 900 g, siparişin içinde 600 g sayılıyor.`,
        v: 'v4', diff: 'v3', mark: ['Kantar.java', ['// koli içinde koli', 'for (Koli ic : koli.getKoliler()) {'], 'bad'], out: out('v4'), animateOut: 0,
        stage: st('v4', { text: 'Saat kutusu **hiçbir döngünün** erişemediği katta: 300 g kayıp.', tone: 'bad' }),
      },
      {
        t: 'Teşhis — Ağaç derin, kod sığ',
        x: 'Kantar ağacın **şeklini** bilmek zorunda: kaç kat, hangi katta ne var. Ya koli, ağırlığını **içindekilere** sorabilseydi ve ürün de koli de **aynı soruya** cevap verebilseydi?',
        v: 'v4', mark: null, diag: true, out: out('v4'),
      },
    ];

    const stageOf = (i) => (STEPS[i].stage ? STEPS[i].stage : STEPS[i - 1].stage);
    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: () => 6400,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        left.head.querySelector('.ver').textContent = { v1: 'sürüm 1.0 (tek koli)', v2: 'sürüm 2.0 (koli içinde koli)', v3: 'sürüm 3.0 (kolisiz ürün)', v4: 'sürüm 3.1 (saat kutusu)' }[s.v];
        // önce konsol: yüksekliği değişince işaretli satır kod panelinin dışında kalmasın
        CP.renderConsole(consoleEl, '$ javac *.java && java Main', s.out, { animateFrom: info.animate && s.animateOut != null ? s.animateOut : null });
        cv.setFiles(files(s.v), { active: s.mark ? s.mark[0] : 'Kantar.java', prev: s.diff ? asMap(s.diff) : null });
        if (s.mark) cv.mark(s.mark[0], s.mark[1], s.mark[2]);
        stage.render(stageOf(i), prev >= 0 ? stageOf(prev) : null, { animate: info.animate && !!s.stage });
        // teşhiste ağaç yer kaplamasın: kanıt tek satırda özetlenir
        right.el.classList.toggle('is-diag', !!s.diag);
        if (s.diag) {
          const tv = CP.naiveTotals('v4');
          extra.innerHTML = `
            <div class="cp-evidence">
              <span class="cp-ev-k">Program</span><b class="is-bad">${tv.program} g</b>
              <span class="cp-ev-k">Kantar (gerçek)</span><b>${tv.real} g</b>
              <span class="cp-ev-k">Fark</span><b class="is-bad">${tv.real - tv.program} g</b>
              <span class="cp-ev-why">${md('Saat kutusu (100 g) ve saat (200 g): **üçüncü kat**')}</span>
            </div>
            <div class="req-card is-diagnosis">
              <div class="diag-title">Teşhis</div>
              <ul class="problems">
                <li>${md('**Derinlik koda gömülü:** iç içe döngüler ağacın şeklini kopyalıyor. Ağaç bir kat derinleşince kod **sessizce** yanılıyor; derleyici de uyarmıyor.')}</li>
                <li>${md('**İstemci türleri ayırt ediyor:** ürüne ayrı, koliye ayrı metot; kolide iki ayrı liste (`urunler`, `koliler`). Koliyi ve bisikleti tek bir listede gezemiyoruz.')}</li>
                <li>${md('**Her işlem aynı gezintiyi kopyalıyor:** `agirlik` ve `listele` aynı döngü piramidini tekrar yazıyor; yeni bir işlem bir piramit daha demek.')}</li>
              </ul>
            </div>
            <div class="sg-aside">${md('💬 **Klasörler gibi:** bir klasörün boyutunu sorarsınız, o da içindekilere sorar. Dosya mı, klasör mü diye siz ayırmazsınız; derinliği de bilmezsiniz.')}</div>`;
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
  CP.scenes.solution = function (root, ctx) {
    const R = CP.refactor;
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-diag' });
    const left = kit.panel('Yeniden düzenleme (refactoring)', { cls: 'panel-code cp-left' });
    const right = kit.panel('Sınıf diyagramı', { cls: 'panel-side panel-diagram' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'cp-cv' });
    const consoleEl = h('div', { class: 'console cp-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: CP.roleOf, special: CP.special });
    const diagHost = h('div', { class: 'diag-host' });
    const recipe = h('ol', { class: 'recipe' });
    const legend = kit.umlLegend({ association: true, aggregation: true, fmLabel: 'işi içindekilere devreden (özyinelemeli) işlem' });
    right.body.append(h('div', { class: 'recipe-wrap' }, h('div', { class: 'recipe-title' }, 'Dönüşüm tarifi'), recipe), diagHost, legend);
    ['Ortak arayüz', 'Yaprak: Urun', 'Bileşik: Koli', 'İstemci tek tip'].forEach((t, i) => recipe.appendChild(h('li', { 'data-i': String(i + 1) }, t)));
    const diagram = new DP.ClassDiagram(diagHost, CP.solutionDiagram(0), { roles: CP.roles, roleTags: false });

    const bugOut = CP.naiveOutput('v4').map((l) => (l.bad ? { t: l.t, bad: true, note: l.note } : { t: l.t, dim: true }));
    const okOut = CP.output.map((t) => {
      if (t.startsWith('+ Sipariş')) return { t, ok: true, note: 'doğru: 3400 g' };
      if (t.includes('Saat kutusu')) return { t, ok: true, note: 'artık görünüyor' };
      if (t.startsWith('Sevkiyat')) return { t, ok: true, note: 'kantarla aynı' };
      return { t };
    });
    const STEPS = [
      { t: 'Başlangıç — iç içe döngüler', x: 'İki listeli koli, ürün ve koliyi ayrı ele alan bir Kantar ve üçüncü kata inemeyen döngüler. Dört adımda ürünü ve koliyi **aynı arayüzde** buluşturacağız; koli soruyu **içindekilere** soracak.', focus: 'Kantar.java', mark: ['// koli içinde koli', 'for (Koli ic : koli.getKoliler()) {'], kind: 'bad', run: 'bug' },
      { t: 'Adım 1 — Ortak arayüz: Parca', x: '[[Parca]]: ağaçtaki **her şey** bu arayüzü uygulayacak. İki soru: `agirlik()` ve `listele(girinti)`. Ürün de koli de bu iki soruya cevap verebilmeli.', focus: 'Parca.java', mark: 'public interface Parca {', run: 'bug' },
      { t: 'Adım 2 — Yaprak: Urun', x: '[[Urun]] `Parca`’yı uyguluyor ve soruları **kendisi** cevaplıyor: ağırlığı kendi gramı, listesi tek satır. İçinde başka parça yok: ağacın **yaprağı**.', focus: 'Urun.java', marks: ['public class Urun implements Parca {', 'return gram;'], run: 'bug' },
      { t: 'Adım 3 — Bileşik: Koli', x: '[[Koli]] de `Parca` ve **tek bir listede** parçaları tutuyor: `List<Parca> icindekiler`. Ağırlığı sorulunca kendi darasına **her parçanın** ağırlığını ekliyor: `toplam += p.agirlik();` — parça bir koliyse aynı soru **onun içine** iner. Kantar’a gerek kalmadı: silindi.', focus: 'Koli.java', marks: ['private final List<Parca> icindekiler', 'toplam += p.agirlik();'], run: 'ok' },
      { t: 'Adım 4 — İstemci tek tip', x: '`Main` sipariş kolisini ve bisikleti **aynı listede** geziyor: `for (Parca p : sevkiyat)`. Ürün mü koli mi diye **sormuyor**; ağacın kaç kat olduğunu da bilmiyor.', focus: 'Main.java', marks: ['List<Parca> sevkiyat = List.of(siparis, bisiklet);', 'p.listele("");'], run: 'ok' },
      { t: 'Sonuç — Ne kazandık?', x: 'Özyineleme **her derinliğe** iner: saat kutusu da sayıldı (3400 g). İstemci tek tip: ürün ile koliye **aynı biçimde** davranıyor. Yeni bir koli türü (palet, poşet) eklemek için Kantar’ı değil, **yalnızca yeni sınıfı** yazacağız. Sıra da korunuyor: Kılıf, konulduğu yerde listeleniyor.', focus: 'Koli.java', mark: 'toplam += p.agirlik();', run: 'ok' },
    ];

    const filesAt = (i) => CP.refactorOrder.filter((k) => R[i][k]).map((k) => ({ name: k + '.java', code: R[i][k] }));
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
        if (s.run === 'bug') CP.renderConsole(consoleEl, '$ javac *.java && java Main', bugOut, { animateFrom: info.animate && i === 0 ? 0 : null });
        else CP.renderConsole(consoleEl, '$ javac *.java && java Main', okOut, { animateFrom: info.animate && i === 3 ? 0 : null });
        cv.setFiles(filesAt(ri), { active: s.focus, prev: showDiff ? asMap(ri - 1) : null, keepActive: false });
        if (s.mark) cv.mark(s.focus, s.mark, s.kind || 'focus');
        (s.marks || []).forEach((m, k) => cv.mark(s.focus, m, 'focus', { scroll: k === 0 }));


        diagram.update(CP.solutionDiagram(Math.min(i, 4)), { animate: info.animate });
        diagram.clearBadges();
        diagram.clearFocus();
        if (i === 0) diagram.badge('Kantar', 'iki kat döngü', 'bad');
        if (i === 1) {
          diagram.badge('Parca', 'YENİ', 'new');
          diagram.focus({ classes: ['Parca'] });
        }
        if (i === 2) {
          diagram.badge('Urun', 'yaprak', 'new');
          diagram.focus({ classes: ['Urun', 'Parca'], edges: ['r-urun'], members: [['Urun', 'agirlik']] });
        }
        if (i === 3) {
          diagram.badge('Koli', 'tek liste', 'new');
          diagram.focus({ classes: ['Koli', 'Parca'], edges: ['r-koli', 'cocuklar'], members: [['Koli', 'icindekiler'], ['Koli', 'agirlik']] });
        }
        if (i === 4) diagram.focus({ classes: ['Main', 'Parca'], edges: ['uses'] });
        if (i === 5) diagram.focus({ classes: ['Koli', 'Parca'], edges: ['r-koli', 'cocuklar'] });
        DP.$$('li', recipe).forEach((li, k) => {
          li.classList.toggle('is-done', k + 1 < i || (i === 5 && k < 4));
          li.classList.toggle('is-current', k + 1 === i);
        });
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };
})();
