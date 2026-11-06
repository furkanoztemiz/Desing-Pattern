/*
 * Flyweight — sahneler (1/3): Giriş, Sorun, Çözüm
 */
(function () {
  'use strict';
  const FL = DP.fl;
  const { h } = DP;
  const kit = DP.kit;
  const md = (t) => DP.md(t, FL.roleOf);
  FL.md = md;
  FL.scenes = FL.scenes || {};
  const ui = (FL.ui = {
    foot: (root) => kit.foot(root, FL.roleOf),
    roleChip: (key) => kit.roleChip(FL.roles, key),
  });

  /** Konsol: satırlar {t, err, ok, bad, dim, fab, cmd, note}. */
  FL.renderConsole = function (el, cmd, lines, o) {
    o = o || {};
    el.innerHTML = '<div class="console-head"><span></span><span></span><span></span> ' + (o.title || 'Konsol') + '</div>';
    if (cmd) el.appendChild(h('div', { class: 'console-line is-cmd' }, cmd));
    lines.forEach((l, i) => {
      const cls = ['console-line'];
      if (l.cmd) cls.push('is-cmd');
      if (l.err) cls.push('is-err');
      if (l.ok) cls.push('is-okline');
      if (l.bad) cls.push('is-badline');
      if (l.dim) cls.push('is-dim');
      if (l.fab) cls.push('is-fab');
      if (l.sum) cls.push('is-strong');
      if (o.animateFrom != null && i >= o.animateFrom) cls.push('is-new');
      const row = h('div', { class: cls.join(' ') }, l.t);
      if (l.note) row.appendChild(h('span', { class: 'console-note' }, '  ← ' + l.note));
      el.appendChild(row);
    });
    if (o.cursor) el.appendChild(h('div', { class: 'console-cursor' }));
    el.scrollTop = el.scrollHeight;
  };

  /** Çıktı satırı → konsol satırı */
  FL.consoleLine = (l, o) => {
    o = o || {};
    if (l.k === 'err') return { t: l.t, err: true };
    if (l.k === 'fab') return { t: l.t, fab: true };
    if (l.k === 'sum') return { t: l.t, sum: true, note: o.sumNote || null };
    return { t: l.t, bad: !!(o.bad && o.bad(l)), note: o.note ? o.note(l) : null };
  };
  FL.cmd = (heap, javac) => `$ ${javac ? 'javac *.java && ' : ''}java -Xmx${heap}m Main`;

  /** Bir programın son hâli → sahne durumu (Sorun, Tezgâh, Genişlet) */
  FL.stateOf = function (prog, o) {
    o = o || {};
    const r = o.run || FL.run(prog);
    const big = prog.items.length + (prog.adet || 0) > 3;
    const st = { mode: prog.mode, cihaz: prog.heap === FL.PC ? 'pc' : 'tablet', banner: o.banner || null };
    const ikon = r.stats.oom ? FL.CRASH_AT : r.stats.ikon;
    const N = r.stats.oom ? FL.CRASH_AT : r.stats.N;
    st.gauge = { ikon, noktaKB: FL.bellek(prog.mode, N, ikon).noktaKB, oom: r.stats.oom };
    if (big) {
      st.N = r.stats.N;
      st.sayac = r.stats.sayac;
      if (r.stats.oom) st.crash = FL.CRASH_AT;
      if (prog.mode === 'kestirme') st.yigin = r.stats.havuz;
      st.havuz = prog.mode === 'kopya' ? [] : FL.turOrder.filter((t) => r.stats.havuz[t]).map((t) => Object.assign({ tur: t, pay: r.stats.sayac[t] }, r.stats.havuz[t]));
      return st;
    }
    // az nokta: nesne nesne
    const liste = r.liste;
    st.noktalar = liste.map((e) => {
      if (prog.mode === 'kestirme') return { tur: e.tur, no: r.stats.havuz[e.tur].no, etiket: r.stats.havuz[e.tur].etiket, x: r.stats.havuz[e.tur].x, y: r.stats.havuz[e.tur].y, cizildi: true };
      return Object.assign({ cizildi: o.cizildi !== false }, e);
    });
    if (prog.mode === 'kopya') {
      st.ikonlar = liste.map((e, i) => {
        const ilk = liste.findIndex((x) => x.tur === e.tur);
        return { tur: e.tur, no: e.no, etiket: e.etiket, dup: ilk < i ? liste[ilk].no : null };
      });
    } else {
      st.havuz = FL.turOrder.filter((t) => r.stats.havuz[t]).map((t) => Object.assign({ tur: t, pay: liste.filter((e) => e.tur === t).length }, r.stats.havuz[t]));
      if (prog.mode === 'kestirme') {
        // gerçek konumunu yitiren noktalar
        st.kayip = prog.items.filter((it) => it.tur && r.stats.havuz[it.tur].etiket !== it.etiket);
      }
    }
    st.ayri = liste.filter((e) => e.depo).map((e) => ({ etiket: e.etiket, depo: e.depo, no: e.no }));
    return st;
  };

  // ================================================================== 1. GİRİŞ
  /** Giriş animasyonu: üç paylaşılan işaret, haritaya basılan noktalar (kaşe gibi) */
  const HERO_PTS = [
    ['koli', 521, 215], ['zarf', 306, 135], ['koli', 81, 212], ['palet', 153, 80], ['koli', 576, 81], ['zarf', 403, 284],
    ['koli', 221, 289], ['palet', 637, 137], ['koli', 291, 240], ['zarf', 721, 208], ['koli', 443, 66], ['koli', 596, 238],
  ];
  const HS = 0.42;
  const HMX = (x) => 18 + x * HS;
  const HMY = (y) => 66 + y * HS;
  const HCARD = { koli: 70, zarf: 136, palet: 202 };

  FL.scenes.intro = function (root, ctx) {
    const el = h('div', { class: 'scene scene-intro' });
    el.innerHTML = `
      <div class="intro-grid">
        <section class="intro-main">
          <div class="chips">
            <span class="chip chip-cat is-struct">Yapısal · Structural</span>
            <span class="chip">GoF · 1994</span>
            <span class="chip">Anahtar kelime: paylaşım</span>
          </div>
          <h1 class="intro-title">Flyweight</h1>
          <div class="intro-sub">Sinek Sıklet <span>· “binlerce nesne, birkaç paylaşılan çekirdek”</span></div>
          <blockquote class="intent">
            <div class="intent-label">Amaç</div>
            <p>Çok sayıdaki <b>ince taneli</b> nesneyi <b>paylaşım</b> yoluyla verimli biçimde destekle.</p>
            <footer>— Gamma, Helm, Johnson, Vlissides (GoF), <i>Design Patterns</i>, 1994</footer>
          </blockquote>
        </section>
        <section class="intro-hero" aria-label="Kalıbın kısa animasyonu">${heroSvg()}</section>
      </div>
      <div class="intro-cards">
        <article class="card">
          <h3><span class="card-ic">🏷️</span> Günlük hayattan</h3>
          <p>Depoda tek bir <b>“KIRILACAK” kaşesi</b> vardır; binlerce koliye basılır. Kaşenin şekli kaşenin kendisindedir
          ve <b>paylaşılır</b>. Nereye basılacağı ise her koliye göre değişir ve kaşeyi tutan el karar verir.
          Metin editörü de böyledir: sayfadaki on bin “a” harfi aynı yazı tipi glifini kullanır, yalnızca <b>konumları</b> farklıdır.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🪶</span> Fikir</h3>
          <p>Nesnenin durumunu ikiye ayır. <b>İçsel</b> durum bağlamdan bağımsızdır (ikon, yazı tipi) ve az sayıda
          <b>paylaşılan, değişmez</b> nesnede tutulur. <b>Dışsal</b> durum bağlama özgüdür (konum, takip no); istemcide kalır
          ve çağrıyla gönderilir: <code>isaret.ciz(x, y, etiket)</code>.</p>
          <p>Bir <b>fabrika</b>, aynı anahtar için hep <b>aynı</b> nesneyi verir.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🎯</span> Bu derste</h3>
          <ol class="objectives">
            <li>Paylaşmadan çoğalan nesnelerin bedelini görmek (gerçek bir <code>OutOfMemoryError</code>)</li>
            <li>Durumu <b>içsel</b> ve <b>dışsal</b> diye ayırmak</li>
            <li>Rolleri tanımak: ${['flyweight', 'concreteFlyweight', 'factory'].map((r) => ui.roleChip(r)).join(' ')}</li>
            <li>Paylaşılan nesnenin neden <b>değişmez</b> olması gerektiğini görmek</li>
            <li>Java’daki örnekleri tanımak: <code>Integer.valueOf</code>, <code>String</code> havuzu</li>
          </ol>
        </article>
      </div>
      <div class="intro-cta">
        <button class="btn btn-primary btn-lg" type="button" data-go>Sorunla başlayalım →</button>
        <a class="btn btn-ghost" href="#/facade">← Önceki kalıp: Facade</a>
        <span class="hint">ya da klavyede <kbd>→</kbd> tuşuna basın</span>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-go]').addEventListener('click', () => ctx.goScene('sorun'));

    // her tıkta bir işaret haritaya "basılır": aynı nesne, farklı dışsal durum
    const svg = el.querySelector('.hero-svg');
    const k = {};
    DP.$$('[data-k]', svg).forEach((n) => (k[n.getAttribute('data-k')] = n));
    let t = 0;
    const tick = () => {
      const i = t % (HERO_PTS.length + 3);
      if (i === 0) {
        k.pins.innerHTML = '';
        DP.$$('.fh-card', svg).forEach((c) => c.classList.remove('is-on'));
      }
      if (i < HERO_PTS.length) {
        const [tur, x, y] = HERO_PTS[i];
        DP.$$('.fh-card', svg).forEach((c) => c.classList.toggle('is-on', c.getAttribute('data-t') === tur));
        k.tok.setAttribute('class', 'fh-tok fl-t-' + tur);
        k['tok-t'].textContent = `ciz(${x}, ${y})`;
        k.tok.style.transition = 'none';
        k.tok.style.transform = `translate(400px, ${HCARD[tur] + 22}px)`;
        void k.tok.getBoundingClientRect();
        k.tok.style.transition = '';
        k.tok.style.transform = `translate(${HMX(x)}px, ${HMY(y) - 9}px)`;
        setTimeout(() => {
          k.pins.insertAdjacentHTML('beforeend', `<g transform="translate(${HMX(x)},${HMY(y)}) scale(0.85)">${FL.pin('is-drawn is-stamp fl-t-' + tur, tur)}</g>`);
        }, DP.dur(620));
        const n = i + 1;
        const turler = new Set(HERO_PTS.slice(0, n).map((p) => p[0])).size;
        k.n.textContent = String(n);
        k.fw.textContent = `${turler} işaret · ${turler * 16} KB`;
        k.naive.textContent = `${n} ikon · ${n * 16} KB`;
      }
      t++;
    };
    tick();
    const timer = setInterval(tick, 1100);
    return { destroy: () => clearInterval(timer) };
  };

  function heroSvg() {
    const cards = ['koli', 'zarf', 'palet']
      .map(
        (t) => `<g class="fh-card fl-t-${t}" data-t="${t}"><rect x="372" y="${HCARD[t]}" width="168" height="54" rx="11"/><rect class="fh-art" x="380" y="${HCARD[t] + 7}" width="40" height="40" rx="8"/>${FL.icon(t, 388, HCARD[t] + 15, 1)}<text x="430" y="${HCARD[t] + 24}">${t}</text><text class="fh-sub" x="430" y="${HCARD[t] + 42}">${t}.png · 16 KB</text></g>`
      )
      .join('');
    return `
    <svg class="hero-svg fl-hero" viewBox="0 0 560 360" role="img" aria-label="Üç paylaşılan işaret, haritadaki her noktaya farklı konumla basılıyor">
      <text class="h-caption" x="280" y="26" text-anchor="middle">Binlerce nokta, üç paylaşılan işaret</text>
      <g transform="translate(18,66) scale(${HS})"><g class="fl-map">${FL.mapSvg()}</g></g>
      <g data-k="pins"></g>
      <g class="fh-pool"><rect x="362" y="46" width="188" height="222" rx="14"/><text class="fh-pool-t" x="456" y="62" text-anchor="middle">havuz · IsaretFabrikasi</text>${cards}</g>
      <g class="fh-tok" data-k="tok"><rect x="-44" y="-12" width="88" height="24" rx="12"/><text data-k="tok-t" x="0" y="4" text-anchor="middle"></text></g>
      <g class="fh-count">
        <text x="18" y="292">nokta</text><text class="fh-v" data-k="n" x="18" y="318">0</text>
        <text x="120" y="292">Flyweight</text><text class="fh-v is-ok" data-k="fw" x="120" y="318"></text>
        <text x="330" y="292">her noktaya kendi ikonu</text><text class="fh-v is-bad" data-k="naive" x="330" y="318"></text>
      </g>
      <text class="h-sub fh-code" x="280" y="348" text-anchor="middle">Isaret koli = fabrika.al("koli");   // hep AYNI nesne</text>
    </svg>`;
  }

  // ================================================================== 2. SORUN
  FL.scenes.problem = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-46' });
    const left = kit.panel('Kalıpsız kod · <span class="ver"></span>', { cls: 'panel-code fl-left' });
    const right = kit.panel('Kurye tableti <span class="panel-sub">· harita ve bellek</span>', { cls: 'panel-side fl-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'fl-cv' });
    const consoleEl = h('div', { class: 'console fl-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: FL.roleOf, special: FL.special });

    const viewHost = h('div', { class: 'fl-view' });
    const extra = h('div', { class: 'fl-extra' });
    right.body.append(viewHost, extra);
    const stage = new FL.Sahne(viewHost);

    const order = ['Main', 'Harita', 'HaritaNoktasi', 'Ikon', 'Gonderiler'];
    const files = (v) => FL.fileList(FL.naiveFiles(v), order);
    const asMap = (v) => {
      const F = FL.naiveFiles(v);
      const m = {};
      Object.keys(F).forEach((n) => (m[n + '.java'] = F[n]));
      return m;
    };
    const prog = (v, heap) => Object.assign({ heap }, FL.NV[v]);
    const out = (v, heap, o) => FL.run(prog(v, heap)).lines.map((l) => FL.consoleLine(l, o));
    const r3 = FL.run(prog('v3', FL.TABLET));
    const k3 = r3.stats.havuz.koli;
    const STEPS = [
      {
        t: 'Üç gönderi, üç ikon',
        x: 'Kuryelerin tabletinde canlı bir harita var. Her [[HaritaNoktasi]] kendi ikonunu diskten yüklüyor (64×64 resim, **16 KB**). Konsola bakın: KRG-1001 ile KRG-1003 aynı resmi gösteriyor ama `koli.png#1` ve `koli.png#3` **iki ayrı nesne**.',
        v: 'v1', mark: ['HaritaNoktasi.java', 'this.ikon = new Ikon(tur + ".png");', 'focus'],
        run: [{ heap: FL.TABLET, o: { note: (l) => (l.no === 3 ? 'aynı resim, yeni nesne' : null) } }],
        stage: () => FL.stateOf(prog('v1', FL.TABLET), { banner: { text: 'Üç nokta, üç ikon: **koli.png iki kez** yüklendi.' } }),
      },
      {
        t: 'Bütün Türkiye: 10.000 gönderi',
        x: 'Harita bütün Türkiye’ye açıldı: [[Main]] 9.997 gönderi daha ekliyor. Geliştiricinin bilgisayarında (512 MB) çalıştı, ama özet satırına bakın: **10.000 ikon, 160.000 KB**. Ekranda yalnızca üç farklı resim var!',
        v: 'v2', diff: 'v1', mark: ['Main.java', 'Gonderiler.ekle(harita, 9_997);', 'focus'], animateOut: 0,
        run: [{ heap: FL.PC, o: { sumNote: 'üç resim için ≈ 156 MB' } }],
        stage: () => FL.stateOf(prog('v2', FL.PC), { banner: { text: '10.000 nokta → **10.000 ikon, ≈ 156 MB**: üç farklı resim için!' } }),
        fill: true,
      },
      {
        t: 'Kurye tabletinde: OutOfMemoryError',
        x: 'Aynı program kuryenin tabletinde (64 MB): harita açılmadan **OutOfMemoryError**. Yığın izi suçluyu gösteriyor: `Ikon.<init>`, her noktanın kendi ikonunu yüklediği yer. Harita ≈ 3.950. noktada çöktü.',
        v: 'v2', mark: ['Ikon.java', 'new byte[BOYUT]', 'bad'],
        run: [{ heap: FL.PC, dim: true }, { heap: FL.TABLET, animate: true }],
        stage: () => FL.stateOf(prog('v2', FL.TABLET), { banner: { text: 'Tablette ≈ 3.950. noktada **OutOfMemoryError**: harita açılamadı.', tone: 'bad' } }),
        fill: true,
      },
      {
        t: 'Kestirme: bütün noktayı paylaş',
        x: `Bir geliştirici kestirme buldu: aynı türden noktalar **tek nesneyi** paylaşsın (\`HAVUZ\`). Tablette çalıştı: 3 ikon, 48 KB. Ama konsola bakın: KRG-1001 yok, ilk satırda **${k3.etiket}** var. Paylaşılan nesnenin etiketi ve konumu her \`al(...)\` çağrısında **üstüne yazılıyor**: son yazan kazanıyor.`,
        v: 'v3', diff: 'v2', mark: ['HaritaNoktasi.java', 'nokta.etiket = etiket;', 'bad'], animateOut: 0,
        run: [{ heap: FL.TABLET, o: { bad: (l) => l.k === 'ciz', note: (l) => (l.i === 0 ? 'KRG-1001 olmalıydı!' : null) } }],
        stage: () => FL.stateOf(prog('v3', FL.TABLET), { banner: { text: 'Bellek düzeldi (3 ikon), harita bozuldu: 10.000 nokta **üç yere** yığıldı.', tone: 'bad' } }),
        fill: true,
      },
      {
        t: 'Teşhis — İki tür durum aynı nesnede',
        x: 'Sürüm 2.0’ın [[HaritaNoktasi]]’na dönelim. **Yeşil** alanlar türe ait: her kolide aynı (paylaşılabilir). **Mor** alanlar gönderiye ait: her noktada farklı. Kalıpsız sürüm ikisini birlikte çoğalttı; kestirme ikisini birlikte paylaştı.',
        v: 'v2', diag: true,
      },
    ];

    const writeConsole = (s, animate) => {
      const lines = [];
      let from = null;
      s.run.forEach((rn) => {
        const L = out(s.v, rn.heap, rn.o);
        if (rn.animate && animate) from = lines.length + 1;
        lines.push({ t: FL.cmd(rn.heap, !lines.length) + (s.run.length > 1 ? (rn.heap === FL.PC ? '   # geliştirici bilgisayarı' : '   # kurye tableti') : ''), cmd: true });
        L.forEach((l) => lines.push(rn.dim ? { t: l.t, dim: true } : l));
      });
      FL.renderConsole(consoleEl, null, lines, { animateFrom: animate ? (from != null ? from : s.animateOut != null ? 1 : null) : null });
    };

    const stageOf = (i) => (STEPS[i].stage ? STEPS[i].stage() : null);
    const foot = ui.foot(el);
    let last = null;
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: (i) => (i === 2 ? 8000 : 6800),
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        left.head.querySelector('.ver').textContent = { v1: 'sürüm 1.0 (üç gönderi)', v2: 'sürüm 2.0 (bütün Türkiye)', v3: 'sürüm 2.1 (kestirme)' }[s.v];
        // önce konsol: yüksekliği değişince işaretli satır kod panelinin dışında kalmasın
        if (s.run) writeConsole(s, info.animate);
        else FL.renderConsole(consoleEl, null, [{ t: FL.cmd(FL.TABLET, true), cmd: true }].concat(out('v2', FL.TABLET)));
        cv.setFiles(files(s.v), { active: s.mark ? s.mark[0] : 'HaritaNoktasi.java', prev: s.diff ? asMap(s.diff) : null, keepActive: false });
        if (s.mark) cv.mark(s.mark[0], s.mark[1], s.mark[2]);
        if (i === 2) cv.mark('HaritaNoktasi.java', 'this.ikon = new Ikon(tur + ".png");', 'bad', { show: false, scroll: false });
        if (s.diag) {
          cv.mark('HaritaNoktasi.java', ['private final String tur;', 'private final Ikon ikon;'], 'ok');
          cv.mark('HaritaNoktasi.java', ['private final String etiket;', 'private final int y;'], 'focus', { scroll: false });
        }
        right.el.classList.toggle('is-diag', !!s.diag);
        if (!s.diag) {
          const st = stageOf(i);
          if (s.fill && info.animate) stage.fill(st, last);
          else stage.render(st, last, { animate: info.animate });
          last = st;
        }
        if (s.diag) {
          const r2 = FL.run(prog('v2', FL.TABLET));
          extra.innerHTML = `
            <div class="fl-evidence">
              <span class="fl-ev-k">Sürüm 2.0</span><b class="is-bad">10.000 ikon · tablette çöktü</b>
              <span class="fl-ev-k">Sürüm 2.1</span><b class="is-bad">3 ikon · KRG-1001 kayıp</b>
              <span class="fl-ev-k">Farklı resim</span><b class="is-ok">3 (koli, zarf, palet)</b>
              <span class="fl-ev-why">${md(`Yığın izinin tepesi: \`${r2.lines[1].t.trim()}\``)}</span>
            </div>
            <div class="req-card is-diagnosis">
              <div class="diag-title">Teşhis</div>
              <ul class="problems">
                <li>${md('**İki tür durum aynı nesnede:** nokta hem türe ait olanı (tür adı, 16 KB ikon: her kolide **aynı**) hem gönderiye ait olanı (etiket, konum: her noktada **farklı**) tutuyor.')}</li>
                <li>${md('**Paylaşmamak = bellek patlaması:** 10.000 nokta, 3 farklı resim, 10.000 kopya. Ağır kısım gönderi sayısıyla birlikte büyüyor.')}</li>
                <li>${md('**Her şeyi paylaşmak = yanlış harita:** kestirme, gönderiye ait durumu da paylaşılan nesneye koydu. Paylaşılan nesne **değişebilir** olunca son yazan kazanıyor.')}</li>
              </ul>
            </div>
            <div class="sg-aside">${md('💬 **Kaşe gibi:** depodaki tek “KIRILACAK” kaşesi binlerce koliye basılır. Kaşenin şekli kaşede durur (**paylaşılır**); nereye basılacağına kaşeyi tutan el karar verir (**dışsal**). Kaşenin üstüne bir adres kazısaydınız, bütün kolilere aynı adres basılırdı.')}</div>`;
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
  FL.scenes.solution = function (root, ctx) {
    const R = FL.refactor;
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-diag' });
    const left = kit.panel('Yeniden düzenleme (refactoring)', { cls: 'panel-code fl-left' });
    const right = kit.panel('Sınıf diyagramı', { cls: 'panel-side panel-diagram' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'fl-cv' });
    const consoleEl = h('div', { class: 'console fl-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: FL.roleOf, special: FL.special });
    const diagHost = h('div', { class: 'diag-host' });
    const recipe = h('ol', { class: 'recipe' });
    const legend = kit.umlLegend({ association: true, aggregation: 'tutar', fmLabel: 'paylaşılan nesneyi veren işlem' });
    right.body.append(h('div', { class: 'recipe-wrap' }, h('div', { class: 'recipe-title' }, 'Dönüşüm tarifi'), recipe), diagHost, legend);
    ['Arayüz: dışsal durum parametrede', 'İçsel durum: değişmez sınıf', 'Fabrika: paylaşımı garanti eder', 'Nokta: yalnızca dışsal durum'].forEach((t, i) => recipe.appendChild(h('li', { 'data-i': String(i + 1) }, t)));
    const diagram = new DP.ClassDiagram(diagHost, FL.solutionDiagram(0), { roles: FL.roles, roleTags: false });

    const outAt = (i) => [{ t: FL.cmd(FL.TABLET, true), cmd: true }].concat(FL.refactorOutputs[i].map((l) => FL.consoleLine(l, i === 4 ? { sumNote: 'tablette çalışıyor' } : {})));
    const STEPS = [
      { t: 'Başlangıç — her nokta kendi ikonu', x: 'Kestirmeyi geri aldık; sürüm 2.0’dan başlıyoruz: her nokta 16 KB’lık ikonunu kendisi yüklüyor ve tablet çöküyor. Dört adımda **türe ait** olanı paylaşılan nesnelere, **gönderiye ait** olanı noktada bırakacağız.', focus: 'HaritaNoktasi.java', mark: 'this.ikon = new Ikon(tur + ".png");', kind: 'bad' },
      { t: 'Adım 1 — Arayüz: `Isaret`', x: '[[Isaret]] haritaya çizilebilen her şeyin arayüzü. Dikkat: `ciz(x, y, etiket)` **dışsal durumu parametre olarak alır**. İşaret konumunu ve etiketini kendisi tutmayacak; çizen her seferinde söyleyecek.', focus: 'Isaret.java', mark: 'void ciz(int x, int y, String etiket);' },
      { t: 'Adım 2 — İçsel durum: `IsaretTuru`', x: '[[IsaretTuru]] yalnızca **içsel** durumu tutar: türün adı ve 16 KB’lık ikon. Alanlar `final`, sınıf `final`: paylaşılan nesne **değişmez** olmalı (kestirmenin hatası tam buydu). Henüz kimse onu kullanmıyor.', focus: 'IsaretTuru.java', marks: ['public final class IsaretTuru implements Isaret {', 'private final String ad;', 'private final Ikon ikon;'] },
      { t: 'Adım 3 — Fabrika: `IsaretFabrikasi`', x: '[[IsaretFabrikasi]] paylaşımı **garanti eder**: bir tür istendiğinde önce `havuz`’a bakar; varsa **aynı nesneyi** verir, yoksa bir kez yaratıp havuza koyar. İstemci [[IsaretTuru]]’yu kendisi yaratmaz.', focus: 'IsaretFabrikasi.java', marks: ['IsaretTuru isaret = havuz.get(tur);', 'havuz.put(tur, isaret);', 'return isaret;'] },
      { t: 'Adım 4 — Nokta yalnızca dışsal durumu tutar', x: '[[HaritaNoktasi]]’ndan `tur` ve `ikon` çıktı; yerine paylaşılan işarete bir **başvuru** geldi. Çizerken dışsal durumu kendisi veriyor: `isaret.ciz(x, y, etiket)`. [[Harita]] işareti fabrikadan alıyor. **Main değişmedi.** Konsol: 10.000 nokta, **3 ikon**, tablette çalışıyor.', focus: 'HaritaNoktasi.java', marks: ['private final Isaret isaret;', 'isaret.ciz(x, y, etiket);'] },
      { t: 'Sonuç — Ne kazandık?', x: 'İkon sayısı artık nokta sayısına değil **tür sayısına** bağlı: 10.000 noktada 3 ikon (48 KB). Noktalar hâlâ 10.000 tane ama her biri hafif (etiket, x, y, başvuru). Ağır ve ortak olan paylaşıldı; hafif ve bağlama özgü olan dışarıda kaldı.', focus: 'Harita.java', marks: ['ekle(etiket, x, y, fabrika.al(tur));'] },
    ];

    const filesAt = (i) => FL.refactorOrder.filter((k) => R[i][k]).map((k) => ({ name: k + '.java', code: R[i][k] }));
    const asMap = (i) => {
      const m = {};
      Object.keys(R[i]).forEach((k) => (m[k + '.java'] = R[i][k]));
      return m;
    };

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t.replace(/`/g, '')),
      delayOf: () => 6800,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        const ri = Math.min(i, R.length - 1);
        // önce konsol, sonra koddaki işaret
        FL.renderConsole(consoleEl, null, outAt(ri), { animateFrom: info.animate && i === 4 ? 1 : null });
        const showDiff = i >= 1 && i <= R.length - 1;
        cv.setFiles(filesAt(ri), { active: s.focus, prev: showDiff ? asMap(ri - 1) : null, keepActive: false });
        if (s.mark) cv.mark(s.focus, s.mark, s.kind || 'focus');
        (s.marks || []).forEach((m, k) => cv.mark(s.focus, m, 'focus', { scroll: k === 0 }));

        diagram.update(FL.solutionDiagram(Math.min(i, 4)), { animate: info.animate });
        diagram.clearBadges();
        diagram.clearFocus();
        if (i === 0) {
          diagram.badge('HaritaNoktasi', 'her birine 16 KB', 'bad');
          diagram.focus({ classes: ['HaritaNoktasi', 'Ikon'], edges: ['n-ikon'] });
        }
        if (i === 1) {
          diagram.badge('Isaret', 'YENİ', 'new');
          diagram.focus({ classes: ['Isaret'], members: [['Isaret', 'ciz']] });
        }
        if (i === 2) {
          diagram.badge('IsaretTuru', 'YENİ', 'new');
          diagram.focus({ classes: ['IsaretTuru'], edges: ['r-tur', 't-ikon'], members: [['IsaretTuru', 'ad'], ['IsaretTuru', 'ikon']] });
        }
        if (i === 3) {
          diagram.badge('IsaretFabrikasi', 'YENİ', 'new');
          diagram.focus({ classes: ['IsaretFabrikasi', 'IsaretTuru'], edges: ['havuz'], members: [['IsaretFabrikasi', 'havuz'], ['IsaretFabrikasi', 'al']] });
        }
        if (i === 4) {
          diagram.badge('HaritaNoktasi', 'hafifledi', 'new');
          diagram.focus({ classes: ['HaritaNoktasi', 'Isaret', 'Harita', 'IsaretFabrikasi'], edges: ['isaret', 'fabrika'], members: [['HaritaNoktasi', 'isaret']] });
        }
        if (i === 5) diagram.focus({ classes: ['IsaretFabrikasi', 'IsaretTuru'], edges: ['havuz', 'isaret'], members: [['IsaretFabrikasi', 'al']] });
        DP.$$('li', recipe).forEach((li, k) => {
          li.classList.toggle('is-done', k + 1 < i || (i === 5 && k < 4));
          li.classList.toggle('is-current', k + 1 === i);
        });
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };
})();
