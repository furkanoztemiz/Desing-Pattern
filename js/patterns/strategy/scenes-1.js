/*
 * Strategy — sahneler (1/3): Giriş, Sorun, Çözüm
 */
(function () {
  'use strict';
  const SG = DP.stg;
  const { h } = DP;
  const kit = DP.kit;
  const md = (t) => DP.md(t, SG.roleOf);
  SG.md = md;
  SG.scenes = SG.scenes || {};
  const ui = (SG.ui = {
    foot: (root) => kit.foot(root, SG.roleOf),
    roleChip: (key) => kit.roleChip(SG.roles, key),
  });

  /** Konsol: satırlar {t, k, bad, note, hl}; strateji seçimi, teslimat, özet ve hata satırları ayrı renkte. */
  SG.renderConsole = function (el, cmd, lines, o) {
    o = o || {};
    el.innerHTML = '<div class="console-head"><span></span><span></span><span></span> ' + (o.title || 'Konsol') + '</div>';
    if (cmd) el.appendChild(h('div', { class: 'console-line is-cmd' }, cmd));
    lines.forEach((l, i) => {
      const cls = ['console-line', 'sgl-' + (l.k || 'x')];
      if (l.bad) cls.push('is-badline');
      if (l.k === 'ozet') cls.push('is-strong');
      if (l.hl) cls.push('is-hlline');
      if (o.animateFrom != null && i >= o.animateFrom) cls.push('is-new');
      const row = h('div', { class: cls.join(' ') }, l.t);
      if (l.note) row.appendChild(h('span', { class: 'console-note' }, '  ← ' + l.note));
      el.appendChild(row);
    });
    if (o.cursor) el.appendChild(h('div', { class: 'console-cursor' }));
    el.scrollTop = el.scrollHeight;
  };
  /** Çalıştırma satırı → konsol satırı */
  SG.consoleLine = (l, o) => {
    o = o || {};
    return { t: l.t, k: l.k, bad: o.bad ? o.bad(l) : false, note: o.note ? o.note(l) : null, hl: o.hl ? o.hl(l) : false };
  };
  SG.cmd = (javac) => `$ ${javac ? 'javac *.java && ' : ''}java Main`;
  /** Kurala aykırı teslimat satırları: {satır numarası: beklenen durak} */
  SG.yanlisSatirlar = (r) => {
    const m = {};
    r.olaylar.filter((x) => x.e === 'teslim' && x.yanlis).forEach((x) => (m[x.n - 1] = x.beklenen));
    return m;
  };
  /** Konsol satırları: yanlış adımlar ve hata kırmızı, notlu */
  SG.satirlar = (r, n, o) => {
    o = o || {};
    const Y = SG.yanlisSatirlar(r);
    return r.lines.slice(0, n == null ? r.lines.length : n).map((l, i) =>
      SG.consoleLine(l, {
        bad: (x) => i in Y || x.k === 'hata',
        note: (x) => (i in Y ? `beklenen: ${Y[i]}${o.kural ? ' (' + o.kural + ')' : ''}` : x.k === 'hata' && o.hataNot ? o.hataNot : null),
        hl: (x) => !!(o.hl && o.hl(x, i)),
      })
    );
  };

  /** Bir programın son hâli → sahne durumu */
  SG.sonDurum = function (prog, o) {
    o = o || {};
    const r = o.run || SG.run(prog);
    return SG.stateFrom(prog, r.son, { banner: o.banner || null, cokus: !!r.son.cokus });
  };

  // ================================================================== 1. GİRİŞ
  /** Giriş animasyonu: aynı duraklar, sırayla üç strateji; her biri haritada başka bir rota çizer */
  const HX = (x) => 40 + x * 28;
  const HY = (y) => 66 + y * 28;
  const HPLAN = ['RANDEVU', 'EN_YAKIN', 'SOGUK'].map((a) => {
    const r = SG.run({ tasarim: 'strateji', ops: [SG.op.S(a), SG.op.T(), SG.op.T(), SG.op.T(), SG.op.T(), SG.op.T(), SG.op.T()] });
    return { a, km: r.son.km, bacaklar: r.son.bacaklar, sira: r.son.teslim.map((no) => SG.durak(no).sira) };
  });

  SG.scenes.intro = function (root, ctx) {
    const el = h('div', { class: 'scene scene-intro' });
    el.innerHTML = `
      <div class="intro-grid">
        <section class="intro-main">
          <div class="chips">
            <span class="chip chip-cat is-behav">Davranışsal · Behavioral</span>
            <span class="chip">GoF · 1994</span>
            <span class="chip">Anahtar kelime: değiştirilebilir algoritma</span>
          </div>
          <h1 class="intro-title">Strategy</h1>
          <div class="intro-sub">Strateji <span>· “algoritmayı bir nesneye koy, gerektiğinde değiştir”</span></div>
          <blockquote class="intent">
            <div class="intent-label">Amaç</div>
            <p>Bir <b>algoritma ailesi</b> tanımla, her birini kapsülle ve <b>birbirinin yerine kullanılabilir</b> yap. Strateji, algoritmanın onu kullanan istemcilerden <b>bağımsız</b> olarak değişmesine izin verir.</p>
            <footer>— Gamma, Helm, Johnson, Vlissides (GoF), <i>Design Patterns</i>, 1994</footer>
          </blockquote>
        </section>
        <section class="intro-hero" aria-label="Kalıbın kısa animasyonu">${heroSvg()}</section>
      </div>
      <div class="intro-cards">
        <article class="card">
          <h3><span class="card-ic">🧭</span> Günlük hayattan</h3>
          <p>Navigasyon uygulamasında aynı yolculuk için <b>“en hızlı”</b>, <b>“en kısa”</b>, <b>“ücretli yol yok”</b> seçenekleri vardır.
          Araba da varış yeri de aynıdır; değişen yalnızca rotayı hesaplayan yöntemdir. Yolda fikrinizi değiştirip başka seçeneğe geçebilirsiniz.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🧩</span> Fikir</h3>
          <p>Kurye rotayı kendisi hesaplamasın. Sıradaki durağı seçen algoritma bir <b>nesne</b> olsun: <code>RotaStratejisi</code>.
          Kurye yalnızca <code>strateji.sec(konum, kalan)</code> desin; hangi algoritmanın takılı olduğunu bilmesin.</p>
          <p>Main sabah <code>SogukOnceRota</code>, öğleden sonra <code>RandevuRota</code> takar.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🎯</span> Bu derste</h3>
          <ol class="objectives">
            <li>Algoritmaları tek sınıfta toplamanın bedelini görmek (yeni dal, eski dalı bozuyor)</li>
            <li>Her algoritmayı bir sınıfa taşımak; bağlamın verisini korumak</li>
            <li>Rolleri tanımak: ${['strategy', 'concreteStrategy', 'context', 'client'].map((r) => ui.roleChip(r)).join(' ')}</li>
            <li>Çalışırken strateji değiştirmek; kalıtımla karşılaştırmak</li>
            <li>Durum tutan strateji tuzağı, lambda ile strateji; State ve Template Method’dan ayırmak</li>
          </ol>
        </article>
      </div>
      <div class="intro-cta">
        <button class="btn btn-primary btn-lg" type="button" data-go>Sorunla başlayalım →</button>
        <a class="btn btn-ghost" href="#/state">← Önceki kalıp: State</a>
        <span class="hint">ya da klavyede <kbd>→</kbd> tuşuna basın</span>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-go]').addEventListener('click', () => ctx.goScene('sorun'));

    const svg = el.querySelector('.hero-svg');
    const k = {};
    DP.$$('[data-k]', svg).forEach((n) => (k[n.getAttribute('data-k')] = n));
    let t = 0;
    const tick = () => {
      const p = HPLAN[t % HPLAN.length];
      DP.$$('.sh-rota', svg).forEach((r) => r.classList.toggle('is-on', r.getAttribute('data-a') === p.a));
      DP.$$('.sh-kartus', svg).forEach((c) => c.classList.toggle('is-on', c.getAttribute('data-a') === p.a));
      k.kod.textContent = `kurye.setStrateji(new ${SG.ALGO[p.a].sinif}());`;
      k.not.textContent = `${SG.ALGO[p.a].ad}: ${p.sira.join(' → ')} · ${p.km} km`;
      DP.flash(k.not, 'is-pop');
      t++;
    };
    tick();
    const timer = setInterval(tick, 3000);
    return { destroy: () => clearInterval(timer) };
  };

  function heroSvg() {
    let izgara = '';
    for (let x = 0; x <= 12; x++) izgara += `<line class="sh-sokak" x1="${HX(x)}" y1="${HY(0)}" x2="${HX(x)}" y2="${HY(8)}"/>`;
    for (let y = 0; y <= 8; y++) izgara += `<line class="sh-sokak" x1="${HX(0)}" y1="${HY(y)}" x2="${HX(12)}" y2="${HY(y)}"/>`;
    const rotalar = HPLAN.map((p) => `<path class="sh-rota is-${SG.RENK[p.a]}" data-a="${p.a}" pathLength="100" d="${p.bacaklar.map((b, k) => `${k ? '' : `M${HX(b.from.x)} ${HY(b.from.y)} `}H${HX(b.to.x)} V${HY(b.to.y)}`).join(' ')}"/>`).join('');
    const duraklar = SG.DURAKLAR.map((d) => `<g class="sh-durak${d.soguk ? ' is-soguk' : ''}"><circle cx="${HX(d.x)}" cy="${HY(d.y)}" r="10"/><text x="${HX(d.x)}" y="${HY(d.y) + 4}" text-anchor="middle">${d.sira}</text></g>`).join('');
    const kartuslar = HPLAN.map((p, i) => `<g class="sh-kartus is-${SG.RENK[p.a]}" data-a="${p.a}"><rect x="420" y="${96 + i * 52}" width="124" height="40" rx="8"/><text x="482" y="${121 + i * 52}" text-anchor="middle">${SG.ALGO[p.a].sinif}</text></g>`).join('');
    return `
    <svg class="hero-svg stg-hero" viewBox="0 0 560 360" role="img" aria-label="Aynı altı durak; kuryeye takılan strateji değişince rota da değişiyor">
      <text class="h-caption" x="280" y="30" text-anchor="middle">Aynı duraklar, değiştirilebilir algoritma</text>
      <g>${izgara}</g>
      <g>${rotalar}</g>
      <g class="sh-depo"><rect x="${HX(SG.DEPO.x) - 11}" y="${HY(SG.DEPO.y) - 9}" width="22" height="18" rx="3"/><text x="${HX(SG.DEPO.x)}" y="${HY(SG.DEPO.y) + 4}" text-anchor="middle">D</text></g>
      ${duraklar}
      <text class="sh-raf-t" x="482" y="82" text-anchor="middle">stratejiler</text>
      ${kartuslar}
      <text class="hc-not" data-k="not" x="280" y="318" text-anchor="middle"></text>
      <text class="h-sub sh-kod" data-k="kod" x="280" y="344" text-anchor="middle"></text>
    </svg>`;
  }

  // ================================================================== 2. SORUN
  SG.scenes.problem = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-46' });
    const left = kit.panel('Kalıpsız kod · <span class="ver"></span>', { cls: 'panel-code stg-left' });
    const right = kit.panel('Kuryenin günü <span class="panel-sub">· algoritmalar Kurye’nin içinde</span>', { cls: 'panel-side stg-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'stg-cv' });
    const consoleEl = h('div', { class: 'console stg-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: SG.roleOf, special: SG.special });

    const viewHost = h('div', { class: 'stg-view' });
    const extra = h('div', { class: 'stg-extra' });
    right.body.append(viewHost, extra);
    const stage = new SG.HaritaSahne(viewHost);

    const files = (v) => SG.fileList(SG.naiveFiles(v));
    const asMap = (v) => {
      const F = SG.naiveFiles(v);
      const m = {};
      Object.keys(F).forEach((n) => (m[n + '.java'] = F[n]));
      return m;
    };
    const R = { v1: SG.run(SG.NV.v1), v11: SG.run(SG.NV.v11), v2: SG.run(SG.NV.v2) };
    const O2 = R.v2.olaylar;
    // öğleden sonraya geçiş anı (4. istek): liste karışık
    const gecis = O2.find((x) => x.e === 'sec' && x.i === 3);
    // ilk yanlış adım
    const ilkYanlis = O2.find((x) => x.e === 'teslim' && x.yanlis);
    const once = O2.filter((x) => x.i === ilkYanlis.i - 1).pop();
    const sirali = (L) => L.slice().sort((a, b) => SG.durak(a).sira - SG.durak(b).sira);
    const STEPS = [
      {
        t: 'Sürüm 1.0: tek algoritma, randevu sırası',
        x: 'Müşteriler teslimat için randevu aldı. Kurye durakları **randevu sırasıyla** dolaşıyor: `kalan.get(0)`, çünkü liste randevu sırasında tutuluyor. Çalışıyor; ama soğuk zincirli iki ilaç günün sonuna kalıyor (5. ve 6. durak).',
        v: 'v1', mark: ['Kurye.java', 'return kalan.get(0);', 'focus'], animateOut: true,
        st: () => SG.sonDurum(SG.NV.v1, { run: R.v1, banner: { text: 'Randevu sırası: **41 km** · soğuk zincirliler en sonda' } }),
      },
      {
        t: 'Sürüm 1.1: algoritma adıyla seçiliyor',
        x: 'Randevusuz günler için **en yakın durak** istendi. Algoritma bir `String` ile seçiliyor ve iki algoritma da [[Kurye]]’nin içinde. Kurye sabah en yakın durağa, öğleden sonra randevu sırasıyla gidiyor. Sorun yok: en yakın dalı listeye dokunmuyor.',
        v: 'v11', diff: 'v1', mark: ['Kurye.java', ['} else if (yontem.equals("EN_YAKIN")) {', 'return secilen;'], 'focus'], animateOut: true,
        st: () => SG.sonDurum(SG.NV.v11, { run: R.v11, banner: { text: 'En yakın, sonra randevu: **35 km** · sıra doğru', tone: 'ok' } }),
      },
      {
        t: 'Sürüm 2.0: soğuk zincir önce',
        x: 'Eczanelerden insülin ve aşı geldi; soğuk zincirliler **önce** dağıtılmalı. Yeni dal `SOGUK_ONCE` çabucak yazıldı: listeyi **yerinde** sıralıyor (soğuklar başa, sonra yakından uzağa) ve ilkini alıyor. Sabah iki ilaç zamanında teslim edildi. Ama sağdaki listeye bakın: `kalan` artık randevu sırasında değil.',
        v: 'v2', diff: 'v11', n: () => gecis.n, mark: ['Kurye.java', ['// soğuk zincirliler başa, sonra yakından uzağa', '.thenComparingInt(d -> konum.mesafe(d.konum())));'], 'bad'],
        st: () => SG.stateFrom(SG.NV.v2, gecis.s, { sirala: { once: sirali(gecis.s.kalan), sonra: gecis.s.kalan }, banner: { text: 'Soğuk zincirliler teslim edildi · liste **karıştı**: R1, R4, R3, R2', tone: 'bad' } }),
      },
      {
        t: 'Öğleden sonra: randevu sırası',
        x: `Kurye randevulu müşterilere döndü: \`yontemSec("RANDEVU")\`. Randevu dalı hâlâ \`kalan.get(0)\` diyor, ama listenin başında Ali’den sonra artık Can (R2) değil, ${SG.durak(ilkYanlis.no).alici.split(' ')[0]} (R${SG.durak(ilkYanlis.no).sira}) var. Kurye Can’ın randevusunu atlayıp Yeşilyurt’a gitti. Randevu dalının koduna **kimse dokunmadı**.`,
        v: 'v2', n: () => ilkYanlis.n, mark: ['Kurye.java', 'return kalan.get(0);', 'bad'],
        st: () => SG.stateFrom(SG.NV.v2, ilkYanlis.s, { secilen: ilkYanlis.no, beklenen: ilkYanlis.beklenen, banner: { text: `Beklenen **${ilkYanlis.beklenen}** (R2) · giden **${ilkYanlis.no}** (R4)`, tone: 'bad' } }),
        prevSt: () => SG.stateFrom(SG.NV.v2, once.s, {}),
      },
      {
        t: 'Can Demir’in randevusu en sona kaldı',
        x: 'Öğleden sonranın sırası 1, 4, 3, 2 oldu: ikinci randevunun sahibi Can en son ziyaret edildi. Hata değiştirilen dalda değil, **dokunulmayan** dalda ortaya çıktı. Yeni dal ile eski dal aynı sınıfın aynı listesini paylaşıyordu.',
        v: 'v2', mark: ['Kurye.java', 'kalan.sort(Comparator.comparing(Durak::soguk).reversed()', 'bad'], animateOut: true,
        st: () => SG.sonDurum(SG.NV.v2, { run: R.v2, banner: { text: '**2 yanlış adım** · randevu sırası 1 → 4 → 3 → 2', tone: 'bad' } }),
      },
      {
        t: 'Teşhis — Bütün algoritmalar tek sınıfta',
        x: 'Rota algoritmaları [[Kurye]]’nin içinde, aynı alanları paylaşıyor. Bir algoritmayı eklemek ya da değiştirmek Kurye’yi değiştiriyor ve ötekileri etkileyebiliyor. Ya her algoritma ayrı bir **nesne** olsa ve kurye yalnızca “sıradaki durak hangisi?” diye sorsa?',
        v: 'v2', diag: true,
      },
    ];

    const foot = ui.foot(el);
    let last = null;
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: () => 7800,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        left.head.querySelector('.ver').textContent = { v1: 'sürüm 1.0 (randevu sırası)', v11: 'sürüm 1.1 (+ en yakın)', v2: 'sürüm 2.0 (+ soğuk zincir önce)' }[s.v];
        // önce konsol: yüksekliği değişince işaretli satır kod panelinin dışında kalmasın
        SG.renderConsole(consoleEl, SG.cmd(true), SG.satirlar(R[s.v], s.n ? s.n() : null, { kural: 'randevu sırası' }), { animateFrom: info.animate && s.animateOut ? 0 : null, cursor: !!s.n });
        cv.setFiles(files(s.v), { active: 'Kurye.java', prev: s.diff ? asMap(s.diff) : null, keepActive: false });
        if (s.mark) cv.mark(s.mark[0], s.mark[1], s.mark[2]);
        if (s.diag) {
          cv.mark('Kurye.java', 'return kalan.get(0);', 'bad', { scroll: false });
          cv.mark('Kurye.java', 'kalan.sort(Comparator.comparing(Durak::soguk).reversed()', 'bad');
        }
        right.el.classList.toggle('is-diag', !!s.diag);
        if (!s.diag) {
          const st = s.st();
          stage.render(st, s.prevSt && info.animate ? s.prevSt() : last, { animate: info.animate });
          last = st;
          extra.innerHTML = '';
          return;
        }
        const F1 = SG.naiveFiles('v1');
        const F2 = SG.naiveFiles('v2');
        extra.innerHTML = `
          <div class="stg-evidence">
            <span class="stg-ev-k">1.0</span><b>Kurye’de ${Math.max(1, SG.kuryeDallari(F1))} algoritma</b>
            <span class="stg-ev-k">2.0</span><b class="is-bad">Kurye’de ${SG.kuryeDallari(F2)} algoritma · ortak liste</b>
            <span class="stg-ev-k">aynı gün</span><b class="is-bad">${R.v2.son.yanlisAdim} yanlış adım</b>
            <span class="stg-ev-why">${md('Randevu dalı, listenin randevu sırasında olduğunu **varsayıyor**. Soğuk zincir dalı aynı listeyi yerinde sıralayınca bu varsayım sessizce bozuldu; sorun ancak strateji değiştirilince görünüyor.')}</span>
          </div>
          <div class="req-card is-diagnosis">
            <div class="diag-title">Teşhis</div>
            <ul class="problems">
              <li>${md('**Hepsi tek sınıfta:** üç algoritma [[Kurye]]’nin içinde. Her yeni algoritma Kurye’yi değiştiriyor; bir algoritmayı başka yerde kullanmak ya da tek başına sınamak mümkün değil.')}</li>
              <li>${md('**Ortak veri:** algoritmalar Kurye’nin alanlarını paylaşıyor. `SOGUK_ONCE` dalı `kalan` listesini sıraladı; randevu dalının varsayımı bozuldu.')}</li>
              <li>${md('**Adla seçim:** `yontemSec("SOĞUK_ONCE")` gibi bir yazım hatası derlenir; ancak çalışırken `IllegalArgumentException` verir.')}</li>
            </ul>
          </div>
          <div class="sg-aside">${md('💬 **Navigasyon gibi:** “en hızlı”, “en kısa”, “ücretli yol yok”… Araba aynı kalır, rotayı hesaplayan yöntem değişir. Ya her rota algoritması ayrı bir nesne olsa ve kurye yalnızca onu çağırsa?')}</div>`;
        if (info.animate) DP.flash(extra, 'is-pop');
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
    const RF = SG.refactor;
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-diag' });
    const left = kit.panel('Yeniden düzenleme (refactoring)', { cls: 'panel-code stg-left' });
    const right = kit.panel('Kurye nesnesi <span class="panel-sub">· algoritma nerede duruyor?</span>', { cls: 'panel-side stg-right stg-cozum' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'stg-cv' });
    const consoleEl = h('div', { class: 'console stg-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: SG.roleOf, special: SG.special });
    const recipe = h('ol', { class: 'recipe' });
    const viewHost = h('div', { class: 'stg-view' });
    right.body.append(h('div', { class: 'recipe-wrap' }, h('div', { class: 'recipe-title' }, 'Dönüşüm tarifi'), recipe), viewHost);
    ['Ortak arayüz: algoritmalar sınıflara', 'Bağlam veriyi salt okunur verir', 'Strateji yalnızca seçer'].forEach((t, i) => recipe.appendChild(h('li', { 'data-i': String(i + 1) }, t)));
    const stage = new SG.HaritaSahne(viewHost, { cls: 'is-cozum', nesne: true });

    const outAt = (i) => SG.satirlar(SG.run(SG.refactorProgs[i]), null, { kural: 'randevu sırası', hataNot: 'strateji listeyi sıralamaya çalıştı' });
    const STEPS = [
      { t: 'Başlangıç — algoritmalar Kurye’nin içinde', x: 'Üç algoritma [[Kurye]]’nin içinde ve aynı `kalan` listesini kullanıyor. Soğuk zincir dalı listeyi sıraladığı için öğleden sonra randevu sırası bozuluyor: **2 yanlış adım**. Üç adımda algoritmaları kuryeden ayıracağız.', focus: 'Kurye.java', mark: 'kalan.sort(Comparator.comparing(Durak::soguk).reversed()', kind: 'bad', banner: { text: '3 algoritma Kurye’de · ortak liste · **2 yanlış adım**', tone: 'bad' } },
      { t: 'Adım 1 — `RotaStratejisi` ve üç sınıf', x: 'Tek yöntemli bir arayüz tanımlandı: [[RotaStratejisi]] `sec(konum, kalan)`. Her dalın kodu olduğu gibi kendi sınıfına taşındı: [[RandevuRota]], [[EnYakinRota]], [[SogukOnceRota]]. Kurye artık yalnızca `strateji.sec(…)` diyor; Main de String yerine nesne veriyor. Ama kurye **kendi listesini** veriyor: [[SogukOnceRota]] onu hâlâ sıralıyor, hata sürüyor.', focus: 'Kurye.java', marks: ['private RotaStratejisi strateji;', 'Durak d = strateji.sec(konum, kalan);'], banner: { text: 'Algoritmalar sınıflarda · liste hâlâ ortak · **hata sürüyor**', tone: 'bad' } },
      { t: 'Adım 2 — Salt okunur görünüm', x: 'Kurye stratejiye listenin kendisini değil, **salt okunur görünümünü** veriyor: `Collections.unmodifiableList(kalan)`. Şimdi [[SogukOnceRota]] listeyi sıralamaya çalıştığı anda `UnsupportedOperationException` alıyor. Hata artık sessiz değil: sorunlu satırda, ilk teslimatta yakalandı.', focus: 'Kurye.java', marks: ['this.okunur = Collections.unmodifiableList(kalan);', 'Durak d = strateji.sec(konum, okunur);'], banner: { text: 'Strateji listeyi değiştiremiyor → **UnsupportedOperationException**', tone: 'bad' } },
      { t: 'Adım 3 — Strateji yalnızca seçer', x: '[[SogukOnceRota]] listeyi sıralamak yerine soğuk zincirlileri **süzüyor** ve en yakınını bir [[EnYakinRota]]’ya soruyor: strateji içinde strateji. Hiçbir strateji kuryenin listesini değiştirmiyor; randevu sırası korundu, **0** yanlış adım.', focus: 'SogukOnceRota.java', marks: ['List<Durak> soguklar = kalan.stream().filter(Durak::soguk).toList();', 'return enYakin.sec(konum, soguklar.isEmpty() ? kalan : soguklar);'], banner: { text: 'Liste korundu · randevu sırası 1 → 2 → 3 → 4 · **0** yanlış adım', tone: 'ok' } },
      { t: 'Sonuç — Ne kazandık?', x: 'Kurye artık hiçbir somut stratejiyi **tanımıyor**, yalnızca arayüzü biliyor. Yeni bir algoritma = yeni bir sınıf; Kurye de öteki stratejiler de değişmiyor. Main stratejiyi çalışırken değiştiriyor. Bedeli: stratejileri istemci tanımalı; Yapı sahnesinde konuşacağız.', focus: 'Main.java', marks: ['Kurye kurye = new Kurye(Durak.gunun(), new SogukOnceRota());', 'kurye.setStrateji(new RandevuRota());'], banner: { text: 'Kurye 0 somut strateji tanıyor · algoritma çalışırken değişiyor', tone: 'ok' } },
    ];

    const filesAt = (i) => SG.refactorOrder.filter((k) => RF[i][k]).map((k) => ({ name: k + '.java', code: RF[i][k] }));
    const asMap = (i) => {
      const m = {};
      Object.keys(RF[i]).forEach((k) => (m[k + '.java'] = RF[i][k]));
      return m;
    };

    const foot = ui.foot(el);
    let last = null;
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t.replace(/`/g, '')),
      delayOf: () => 7800,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        const ri = Math.min(i, RF.length - 1);
        // önce konsol, sonra koddaki işaret
        SG.renderConsole(consoleEl, SG.cmd(true), outAt(ri), { animateFrom: info.animate && (i === 2 || i === 3) ? 0 : null });
        const showDiff = i >= 1 && i <= RF.length - 1;
        cv.setFiles(filesAt(ri), { active: s.focus, prev: showDiff ? asMap(ri - 1) : null, keepActive: false });
        if (s.mark) cv.mark(s.focus, s.mark, s.kind || 'focus');
        (s.marks || []).forEach((m, k) => cv.mark(s.focus, m, 'focus', { scroll: k === 0 }));
        const prog = SG.refactorProgs[ri];
        const r = SG.run(prog);
        // öğleden sonraya geçiş anı (ya da çöküş): liste o an ne durumda? Altta günün teslim sırası
        const an = r.olaylar.find((x) => x.e === 'sec' && x.i === 3) || r.olaylar.find((x) => x.e === 'cokus');
        const st = SG.stateFrom(prog, an.s, {
          cokus: !!r.son.cokus,
          serit: r.son.bacaklar.map((b) => ({ no: b.no, yanlis: b.yanlis })),
          seritKm: r.son.km,
          anNotu: r.son.cokus ? 'ilk teslimat anı' : 'öğleden sonraya geçerken',
          banner: s.banner,
        });
        stage.render(st, last, { animate: info.animate });
        last = st;
        DP.$$('li', recipe).forEach((li, k) => {
          li.classList.toggle('is-done', k + 1 < i || (i === 4 && k < 3));
          li.classList.toggle('is-current', k + 1 === i);
        });
      },
    });
    return kit.stepApi(stepper, {
      destroy: () => {
        stepper.destroy();
        stage.destroy();
      },
    });
  };
})();
