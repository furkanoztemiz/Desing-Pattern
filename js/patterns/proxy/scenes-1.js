/*
 * Proxy — sahneler (1/3): Giriş, Sorun, Çözüm
 */
(function () {
  'use strict';
  const PX = DP.px;
  const { h } = DP;
  const kit = DP.kit;
  const md = (t) => DP.md(t, PX.roleOf);
  PX.md = md;
  PX.scenes = PX.scenes || {};
  const ui = (PX.ui = {
    foot: (root) => kit.foot(root, PX.roleOf),
    roleChip: (key) => kit.roleChip(PX.roles, key),
  });

  /** Konsol: satırlar {t, err, ok, bad, dim, note}. */
  PX.renderConsole = function (el, cmd, lines, o) {
    o = o || {};
    el.innerHTML = '<div class="console-head"><span></span><span></span><span></span> ' + (o.title || 'Konsol') + '</div>';
    if (cmd) el.appendChild(h('div', { class: 'console-line is-cmd' }, cmd));
    lines.forEach((l, i) => {
      const cls = ['console-line'];
      if (l.err) cls.push('is-err');
      if (l.ok) cls.push('is-okline');
      if (l.bad) cls.push('is-badline');
      if (l.dim) cls.push('is-dim');
      if (l.net) cls.push('is-net');
      if (o.animateFrom != null && i >= o.animateFrom) cls.push('is-new');
      const row = h('div', { class: cls.join(' ') }, l.t);
      if (l.note) row.appendChild(h('span', { class: 'console-note' }, '  ← ' + l.note));
      el.appendChild(row);
    });
    if (o.cursor) el.appendChild(h('div', { class: 'console-cursor' }));
    el.scrollTop = el.scrollHeight;
  };

  /** Çıktı satırı → konsol satırı (ağ satırları soluk, sızıntı kırmızı) */
  PX.consoleLine = (l, o) => {
    o = o || {};
    if (l.k === 'leak') return { t: l.t, bad: true, note: o.leakNote || 'başkasının adresi!' };
    if (l.k === 'login' || l.k === 'query') return { t: l.t, net: true };
    if (l.k === 'kvkk') return { t: l.t, ok: !!o.kvkkOk, note: o.kvkkNote || null };
    return { t: l.t };
  };

  // ================================================================== 1. GİRİŞ
  /** Giriş animasyonu: vekilin üç kararı — geçir, defterden cevapla, engelle */
  const HERO = [
    { tok: 'tel', text: 'sorgula(KRG-1002)', kind: 'req', cache: [] },
    { tok: 'vek', text: 'sorgula(KRG-1002)', kind: 'req', koruma: 'ok', cache: [] },
    { tok: 'vek', text: 'sorgula(KRG-1002)', kind: 'req', koruma: 'ok', defter: 'miss', cache: [] },
    { tok: 'bul', text: 'sorgula(KRG-1002)', kind: 'req', koruma: 'ok', defter: 'miss', bulut: true, cache: [] },
    { tok: 'vek', text: 'Transfer merkezinde', kind: 'ok', bulut: true, cache: ['KRG-1002'] },
    { tok: 'tel', text: 'Transfer merkezinde', kind: 'ok', cache: ['KRG-1002'], note: '800 ms · 25 kuruş' },
    { tok: 'tel', text: 'sorgula(KRG-1002)', kind: 'req', cache: ['KRG-1002'] },
    { tok: 'vek', text: 'sorgula(KRG-1002)', kind: 'req', koruma: 'ok', defter: 'hit', cache: ['KRG-1002'] },
    { tok: 'tel', text: 'Transfer merkezinde', kind: 'hit', cache: ['KRG-1002'], note: 'defterden: 0 ms · 0 kuruş' },
    { tok: 'tel', text: 'sorgula(KRG-1001)', kind: 'req', cache: ['KRG-1002'] },
    { tok: 'vek', text: 'sorgula(KRG-1001)', kind: 'req', koruma: 'bad', cache: ['KRG-1002'] },
    { tok: 'tel', text: 'size ait değil', kind: 'bad', cache: ['KRG-1002'], note: 'KVKK: Ali’nin gönderisi' },
    { tok: 'tel', text: 'size ait değil', kind: 'bad', cache: ['KRG-1002'], note: 'KVKK: Ali’nin gönderisi' },
  ];
  const HX = { tel: 88, vek: 280, bul: 470 };

  PX.scenes.intro = function (root, ctx) {
    const el = h('div', { class: 'scene scene-intro' });
    el.innerHTML = `
      <div class="intro-grid">
        <section class="intro-main">
          <div class="chips">
            <span class="chip chip-cat is-struct">Yapısal · Structural</span>
            <span class="chip">GoF · 1994</span>
            <span class="chip">Diğer adı: Surrogate</span>
          </div>
          <h1 class="intro-title">Proxy</h1>
          <div class="intro-sub">Vekil <span>· “aynı arayüz, araya giren denetim”</span></div>
          <blockquote class="intent">
            <div class="intent-label">Amaç</div>
            <p>Bir nesneye <b>erişimi denetlemek</b> için onun yerine geçen bir <b>vekil</b> (temsilci) sağla.</p>
            <footer>— Gamma, Helm, Johnson, Vlissides (GoF), <i>Design Patterns</i>, 1994</footer>
          </blockquote>
        </section>
        <section class="intro-hero" aria-label="Kalıbın kısa animasyonu">${heroSvg()}</section>
      </div>
      <div class="intro-cards">
        <article class="card">
          <h3><span class="card-ic">🏛️</span> Günlük hayattan</h3>
          <p>Vekâletname ile işlem yapan bir <b>vekil</b>, sizin yerinize imza atar; ama yalnızca yetkisi olan işlerde. Binadaki
          <b>danışma</b> görevlisi de öyle: kimin hangi kata çıkabileceğini denetler, sık sorulanı kendi defterinden cevaplar,
          gerekirse içeri haber verir. Ziyaretçi, karşısındakinin müdür değil görevli olduğunu çoğu zaman fark etmez.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🛡️</span> Fikir</h3>
          <p>Vekil, gerçek nesneyle <b>aynı arayüzü</b> uygular; istemci farkı görmez. Çağrıyı gerçek nesneye iletmeden önce
          <b>denetler</b>: kim soruyor (koruma), bu soru daha önce soruldu mu (önbellek), gerçek nesne <b>var mı</b> (sanal:
          gerektiğinde yaratır), nesne uzakta mı (uzak vekil)?</p>
          <p>Decorator iş <b>ekler</b>; Proxy <b>erişimi</b> yönetir ve gerçek nesneyi çoğu zaman kendisi yaratır.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🎯</span> Bu derste</h3>
          <ol class="objectives">
            <li>Denetim kodunun istemcilere dağılmasının bedelini görmek (KVKK sızıntısı)</li>
            <li>Gerçek nesnenin önüne <b>aynı arayüzlü</b> bir vekil koymak</li>
            <li>Rolleri tanımak: ${['subject', 'realSubject', 'proxy'].map((r) => ui.roleChip(r)).join(' ')}</li>
            <li>Vekil türlerini ayırt etmek: <b>koruma</b>, <b>önbellek</b>, <b>sanal</b>, <b>uzak</b></li>
            <li>Proxy’yi Decorator ve Adapter’dan ayırmak</li>
          </ol>
        </article>
      </div>
      <div class="intro-cta">
        <button class="btn btn-primary btn-lg" type="button" data-go>Sorunla başlayalım →</button>
        <a class="btn btn-ghost" href="#/flyweight">← Önceki kalıp: Flyweight</a>
        <span class="hint">ya da klavyede <kbd>→</kbd> tuşuna basın</span>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-go]').addEventListener('click', () => ctx.goScene('sorun'));

    // istek vekilden geçer: bazen buluta gider, bazen defterden döner, bazen kapıda kalır
    const svg = el.querySelector('.hero-svg');
    const k = {};
    DP.$$('[data-k]', svg).forEach((n) => (k[n.getAttribute('data-k')] = n));
    let t = 0;
    const tick = () => {
      const s = HERO[t % HERO.length];
      k.tok.setAttribute('class', 'ph-tok is-' + s.kind);
      k['tok-t'].textContent = s.text;
      const w = Math.max(110, s.text.length * 7.6 + 24);
      k['tok-bg'].setAttribute('x', String(-w / 2));
      k['tok-bg'].setAttribute('width', String(w));
      k.tok.style.transform = `translate(${HX[s.tok]}px, 214px)`;
      k.koruma.setAttribute('class', 'ph-gate' + (s.koruma ? ' is-' + s.koruma : ''));
      k.defter.setAttribute('class', 'ph-gate' + (s.defter ? ' is-' + s.defter : ''));
      k.bulut.classList.toggle('is-on', !!s.bulut);
      k.cache.textContent = s.cache.length ? s.cache.join(', ') : 'boş';
      k.note.textContent = s.note || '';
      if (s.note) DP.flash(k.note, 'is-pop');
      t++;
    };
    tick();
    const timer = setInterval(tick, 1000);
    return { destroy: () => clearInterval(timer) };
  };

  function heroSvg() {
    return `
    <svg class="hero-svg px-hero" viewBox="0 0 560 360" role="img" aria-label="İstek vekilden geçiyor: koruma, defter, gerekirse uzaktaki gerçek nesne">
      <text class="h-caption" x="280" y="28" text-anchor="middle">Vekil: aynı arayüz, araya giren denetim</text>
      <g class="ph-node is-client"><rect x="34" y="70" width="108" height="122" rx="16"/>${PX.icon('mobil', 70, 84, 1.5)}<text x="88" y="150" text-anchor="middle">Ayşe</text><text class="ph-sub" x="88" y="172" text-anchor="middle">istemci</text></g>
      <g class="ph-node is-vekil"><rect x="196" y="56" width="168" height="150" rx="16"/><text x="280" y="82" text-anchor="middle">vekil</text>
        <g class="ph-gate" data-k="koruma"><rect x="210" y="94" width="140" height="40" rx="10"/>${PX.icon('koruma', 220, 102)}<text x="252" y="119">koruma</text></g>
        <g class="ph-gate" data-k="defter"><rect x="210" y="142" width="140" height="40" rx="10"/>${PX.icon('onbellek', 220, 150)}<text x="252" y="161">defter</text><text class="ph-cache" data-k="cache" x="252" y="176">boş</text></g>
      </g>
      <g class="ph-node is-real" data-k="bulut"><rect x="410" y="70" width="128" height="122" rx="16"/>${PX.icon('bulut', 446, 84, 1.5)}<text x="474" y="150" text-anchor="middle">GlobalShip</text><text class="ph-sub" x="474" y="172" text-anchor="middle">uzak · 800 ms</text></g>
      <path class="ph-wire" d="M142 214 H410"/>
      <g class="ph-tok" data-k="tok"><rect data-k="tok-bg" x="-60" y="-15" width="120" height="30" rx="15"/><text data-k="tok-t" x="0" y="5" text-anchor="middle"></text></g>
      <text class="ph-note" data-k="note" x="280" y="262" text-anchor="middle"></text>
      <text class="h-sub ph-code" x="280" y="300" text-anchor="middle">TakipServisi servis = new TakipVekili(ayse);</text>
      <text class="ph-count" x="280" y="330" text-anchor="middle">istemci farkı görmez: karşısındaki hâlâ bir TakipServisi</text>
    </svg>`;
  }

  // ================================================================== 2. SORUN
  PX.scenes.problem = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-46' });
    const left = kit.panel('Kalıpsız kod · <span class="ver"></span>', { cls: 'panel-code px-left' });
    const right = kit.panel('İstemciler ve GlobalShip <span class="panel-sub">· denetim kodu kimin içinde?</span>', { cls: 'panel-side px-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'px-cv' });
    const consoleEl = h('div', { class: 'console px-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: PX.roleOf, special: PX.special });

    const viewHost = h('div', { class: 'px-view' });
    const extra = h('div', { class: 'px-extra' });
    right.body.append(viewHost, extra);
    const stage = new PX.Hat(viewHost, { minH: 540 });

    const files = (v) => {
      const F = PX.naive(v);
      return PX.naiveOrder(v).map((n) => ({ name: n + '.java', code: F[n] }));
    };
    const asMap = (v) => {
      const F = PX.naive(v);
      const m = {};
      Object.keys(F).forEach((n) => (m[n + '.java'] = F[n]));
      return m;
    };
    const out = (v) => PX.run(PX.NV[v]).lines.map((l) => PX.consoleLine(l));
    /** Sürümün sahnesi: her istemcinin son ekranı ve içindeki denetim kodu */
    const stOf = (v, badges, b) => {
      const r = PX.run(PX.NV[v]);
      const P = PX.NV[v];
      const lanes = P.s.map(([ist, m], i) => {
        const shows = r.lines.filter((l) => l.s === i && (l.k === 'show' || l.k === 'leak' || l.k === 'kvkk'));
        const lastBad = shows.find((l) => l.k === 'leak') || shows.find((l) => l.k === 'kvkk') || shows[shows.length - 1];
        const z = r.iz.filter((x) => x.s === i).find((x) => x.cikti.includes(r.lines.indexOf(lastBad))) || {};
        return { ist, m, badges: badges[i], screen: lastBad ? { no: z.no, kind: lastBad.k === 'leak' ? 'leak' : lastBad.k === 'kvkk' ? 'kvkk' : 'ok' } : null };
      });
      return { mode: 'naive', lanes, gs: { oturum: r.stats.oturum, sorgu: r.stats.sorgu, sessions: P.s.filter((_, i) => r.lines.some((l) => l.k === 'login' && l.s === i)).map(([ist, m]) => `${PX.ISTEMCI[ist].tag}/${PX.MUSTERI[m].ad}`), live: P.s.map((_, i) => r.lines.some((l) => l.k === 'login' && l.s === i)) }, banner: b };
    };
    const B = {
      acilis: { text: 'bağlantı: açılışta' },
      ilk: { text: 'bağlantı: ilk sorguda' },
      ilkK: { text: 'bağlantı' },
      onb: { text: 'önbellek' },
      kvkk: { text: 'KVKK' },
      kopya: (b) => Object.assign({}, b, { kind: 'dup' }),
      eksik: { text: 'KVKK yok', kind: 'missing' },
    };
    const S4 = PX.run(PX.NV.v4).stats;
    const STEPS = [
      {
        t: 'Doğrudan GlobalShip',
        x: 'Müşteri paneli takip sorgusunu doğrudan [[GlobalShipTakip]]’e soruyor. Panel açılır açılmaz oturum açılıyor (1200 ms); sayfa her yenilendiğinde ağa gidiliyor: 800 ms ve **25 kuruş**. Ali sayfayı üç kez yeniledi.',
        v: 'v1', mark: ['MusteriPaneli.java', 'this.servis = new GlobalShipTakip();', 'focus'],
        stage: stOf('v1', [[B.acilis]], { text: 'Her yenileme GlobalShip’e gidiyor: **3 sorgu, 75 kuruş**.' }),
      },
      {
        t: 'Panele önbellek',
        x: 'Fatura kabarınca panel kendi **önbelleğini** tuttu ve oturumu **ilk sorguda** açmaya başladı. Üç yenileme artık tek sorgu. Ama bu denetimler (ne zaman bağlanılır, neyi tekrar sorma) **istemcinin içinde**.',
        v: 'v2', diff: 'v1', mark: ['MusteriPaneli.java', ['String durum = onbellek.get(takipNo);', 'onbellek.put(takipNo, durum);'], 'focus'], animateOut: 0,
        stage: stOf('v2', [[B.ilk, B.onb]], { text: 'Önbellekle **1 sorgu**. Denetim kodu panelin içinde.' }),
      },
      {
        t: 'İkinci istemci: mobil',
        x: 'Mobil uygulama geldi. Geliştirici bağlantı ve önbellek kodunu panelden **kopyaladı**. Her istemci aynı denetimi yeniden yazıyor; her biri kendi oturumunu açıyor.',
        v: 'v3', diff: 'v2', mark: ['MobilUygulama.java', ['String durum = onbellek.get(takipNo);', 'onbellek.put(takipNo, durum);'], 'focus'], animateOut: 0,
        stage: stOf('v3', [[B.ilk, B.onb], [B.kopya(B.ilk), B.kopya(B.onb)]], { text: 'İki istemci, **iki kopya** denetim kodu.' }),
      },
      {
        t: 'KVKK: yalnızca kendi gönderisi',
        x: `Hukuk birimi uyardı: müşteri **yalnızca kendi gönderisini** görebilmeli (KVKK). Denetim panele eklendi: Ali, Zeynep’in gönderisini göremiyor. Mobilde **unutuldu**: Ayşe, Ali’nin adını ve semtini görüyor. Derleyici bir şey demedi. GlobalShip faturası: ${S4.sorgu} sorgu.`,
        v: 'v4', diff: 'v3', mark: ['MobilUygulama.java', 'public void goster(String takipNo) {', 'bad'], animateOut: 4,
        stage: stOf('v4', [[B.ilkK, B.onb, B.kvkk], [B.kopya(B.ilkK), B.kopya(B.onb), B.eksik]], { text: 'Mobilde KVKK denetimi **unutuldu**: Ayşe, Ali’nin adresini görüyor.', tone: 'bad' }),
      },
      {
        t: 'Teşhis — Denetim istemcilere dağılmış',
        x: 'Her istemci gerçek servise **erişimi** kendisi yönetiyor: ne zaman bağlanılacağını, neyin tekrar sorulmayacağını, kimin neyi görebileceğini. Ya istemcilerle GlobalShip arasına, **aynı arayüzü** konuşan tek bir denetçi koysaydık?',
        v: 'v4', mark: null, diag: true,
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
        left.head.querySelector('.ver').textContent = { v1: 'sürüm 1.0 (doğrudan)', v2: 'sürüm 2.0 (panelde önbellek)', v3: 'sürüm 3.0 (+ mobil)', v4: 'sürüm 3.1 (KVKK)' }[s.v];
        // önce konsol: yüksekliği değişince işaretli satır kod panelinin dışında kalmasın
        PX.renderConsole(consoleEl, '$ javac *.java && java Main', out(s.v), { animateFrom: info.animate && s.animateOut != null ? s.animateOut : null });
        cv.setFiles(files(s.v), { active: s.mark ? s.mark[0] : 'MobilUygulama.java', prev: s.diff ? asMap(s.diff) : null });
        if (s.mark) cv.mark(s.mark[0], s.mark[1], s.mark[2]);
        stage.render(stageOf(i), prev >= 0 ? stageOf(prev) : null, { animate: info.animate && !!s.stage });
        right.el.classList.toggle('is-diag', !!s.diag);
        if (s.diag) {
          extra.innerHTML = `
            <div class="px-evidence">
              <span class="px-ev-k">Panel</span><b class="is-ok">KRG-1003 engellendi</b>
              <span class="px-ev-k">Mobil</span><b class="is-bad">KRG-1001 sızdı</b>
              <span class="px-ev-k">Fatura</span><b>${S4.oturum} oturum, ${S4.sorgu} sorgu</b>
              <span class="px-ev-why">${md('Aynı denetim **iki istemcide iki kez** yazıldı; biri eksik kaldı.')}</span>
            </div>
            <div class="req-card is-diagnosis">
              <div class="diag-title">Teşhis</div>
              <ul class="problems">
                <li>${md('**Denetim istemcilere dağılmış:** bağlantı, önbellek ve KVKK kodu her istemcide yeniden yazılıyor; her yeni istemci (SMS, çağrı merkezi…) hepsini kopyalamak zorunda.')}</li>
                <li>${md('**Unutulan denetim = sızıntı:** mobil uygulama KVKK satırını almadı; derleyici bunu fark edemez.')}</li>
                <li>${md('**İstemci işini değil, erişimi yönetiyor:** ekrana durum yazacak sınıf, oturum ve önbellekle uğraşıyor. Gerçek servise dokunamıyoruz: o GlobalShip’in işi.')}</li>
              </ul>
            </div>
            <div class="sg-aside">${md('💬 **Danışma masası gibi:** ziyaretçiler doğrudan müdürün odasına girmez; masadaki görevli kimin girebileceğini denetler, sık sorulanı kendisi cevaplar. Ziyaretçiler değişir, kural **masada** kalır.')}</div>`;
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
  PX.scenes.solution = function (root, ctx) {
    const R = PX.refactor;
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-diag' });
    const left = kit.panel('Yeniden düzenleme (refactoring)', { cls: 'panel-code px-left' });
    const right = kit.panel('Sınıf diyagramı', { cls: 'panel-side panel-diagram' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'px-cv' });
    const consoleEl = h('div', { class: 'console px-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: PX.roleOf, special: PX.special });
    const diagHost = h('div', { class: 'diag-host' });
    const recipe = h('ol', { class: 'recipe' });
    const legend = kit.umlLegend({ association: true, fmLabel: 'denetleyip gerçek nesneye devreden işlem' });
    right.body.append(h('div', { class: 'recipe-wrap' }, h('div', { class: 'recipe-title' }, 'Dönüşüm tarifi'), recipe), diagHost, legend);
    ['Ortak arayüz', 'Vekil yazılır', 'İstemciler sadeleşir', 'Araya vekil girer'].forEach((t, i) => recipe.appendChild(h('li', { 'data-i': String(i + 1) }, t)));
    const diagram = new DP.ClassDiagram(diagHost, PX.solutionDiagram(0), { roles: PX.roles, roleTags: false });

    const outAt = (i) =>
      PX.refactorOutputs[i].map((l) =>
        PX.consoleLine(l, i === 4 ? { kvkkOk: true, kvkkNote: l.s === 1 ? 'vekil engelledi' : null } : { leakNote: i === 3 ? 'sızdı: kimse denetlemiyor' : 'başkasının adresi!' })
      );
    const STEPS = [
      { t: 'Başlangıç — denetim istemcilerde', x: 'İki istemci, iki kopya denetim kodu ve mobilde unutulmuş bir KVKK satırı. Dört adımda denetimi istemcilerden alıp gerçek servisin **önüne** koyacağız.', focus: 'MobilUygulama.java', mark: 'public void goster(String takipNo) {', kind: 'bad' },
      { t: 'Adım 1 — Ortak arayüz: TakipServisi', x: '[[TakipServisi]]: istemcilerin bilmesi gereken tek şey `sorgula(takipNo)`. [[GlobalShipTakip]] bu arayüzü uyguluyor; içinde değişen başka bir şey yok.', focus: 'TakipServisi.java', mark: 'public interface TakipServisi {' },
      { t: 'Adım 2 — Vekil: TakipVekili', x: '[[TakipVekili]] **aynı arayüzü** uyguluyor ve çağrıyı iletmeden önce denetliyor: **koruma** (KVKK), **önbellek**, **sanal** gerçek nesne (`gercek` ilk sorguda yaratılır). Henüz kimse onu kullanmıyor.', focus: 'TakipVekili.java', marks: ['if (!oturum.sahibi(takipNo)) {', 'String kayit = onbellek.get(takipNo);', 'gercek = new GlobalShipTakip();'] },
      { t: 'Adım 3 — İstemciler sadeleşir', x: 'İstemcilerden bağlantı, önbellek ve KVKK kodu **silindi**; artık yalnızca `TakipServisi` alıyorlar. Main şimdilik onlara **gerçek** servisi veriyor (`TakipServisi aliServisi = new GlobalShipTakip();`): konsola bakın — kimse denetlemiyor, **iki sızıntı** ve 5 sorgu.', focus: 'MusteriPaneli.java', marks: ['private final TakipServisi servis;', 'durum = servis.sorgula(takipNo);'] },
      { t: 'Adım 4 — Araya vekil girer', x: 'Yalnızca `Main`’de sağ taraf değişti: `TakipServisi aliServisi = new TakipVekili(ali);` İstemcilerde **tek satır değişmedi**; karşılarındakinin vekil olduğunu bilmiyorlar. Sızıntı yok, sorgu 2’ye indi.', focus: 'Main.java', marks: ['TakipServisi aliServisi = new TakipVekili(ali);', 'TakipServisi ayseServisi = new TakipVekili(ayse);'] },
      { t: 'Sonuç — Ne kazandık?', x: 'Denetim **tek yerde**: yeni bir istemci (SMS, çağrı merkezi) hiçbir denetim kodu yazmadan korunur. Gerçek servis değişmedi. İstemci ile gerçek nesne arasındaki **erişimi** vekil yönetiyor: kim, ne zaman, ne sıklıkla.', focus: 'TakipVekili.java', mark: 'return kayit;' },
    ];

    const filesAt = (i) => PX.refactorOrder.filter((k) => R[i][k]).map((k) => ({ name: k + '.java', code: R[i][k] }));
    const asMap = (i) => {
      const m = {};
      Object.keys(R[i]).forEach((k) => (m[k + '.java'] = R[i][k]));
      return m;
    };

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: () => 6600,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        const ri = Math.min(i, R.length - 1);
        // önce konsol, sonra koddaki işaret
        PX.renderConsole(consoleEl, '$ javac *.java && java Main', outAt(ri), { animateFrom: info.animate && (i === 3 || i === 4) ? 0 : null });
        const showDiff = i >= 1 && i <= R.length - 1;
        cv.setFiles(filesAt(ri), { active: s.focus, prev: showDiff ? asMap(ri - 1) : null, keepActive: false });
        if (s.mark) cv.mark(s.focus, s.mark, s.kind || 'focus');
        (s.marks || []).forEach((m, k) => cv.mark(s.focus, m, 'focus', { scroll: k === 0 }));

        diagram.update(PX.solutionDiagram(Math.min(i, 4)), { animate: info.animate });
        diagram.clearBadges();
        diagram.clearFocus();
        if (i === 0) diagram.badge('MobilUygulama', 'KVKK yok!', 'bad');
        if (i === 1) {
          diagram.badge('TakipServisi', 'YENİ', 'new');
          diagram.focus({ classes: ['TakipServisi', 'GlobalShipTakip'], edges: ['r-real'] });
        }
        if (i === 2) {
          diagram.badge('TakipVekili', 'YENİ', 'new');
          diagram.focus({ classes: ['TakipVekili'], edges: ['r-vekil', 'gercek'], members: [['TakipVekili', 'gercek']] });
        }
        if (i === 3) {
          diagram.badge('MusteriPaneli', 'sadeleşti', 'new');
          diagram.badge('MobilUygulama', 'sadeleşti', 'new');
          diagram.focus({ classes: ['MusteriPaneli', 'MobilUygulama', 'TakipServisi'], edges: ['c-panel', 'c-mobil'] });
        }
        if (i === 4) {
          diagram.badge('TakipVekili', 'araya girdi', 'new');
          diagram.focus({ classes: ['TakipVekili', 'TakipServisi', 'GlobalShipTakip'], edges: ['r-vekil', 'gercek'] });
        }
        if (i === 5) diagram.focus({ classes: ['TakipVekili'], edges: ['gercek', 'r-vekil'], members: [['TakipVekili', 'sorgula']] });
        DP.$$('li', recipe).forEach((li, k) => {
          li.classList.toggle('is-done', k + 1 < i || (i === 5 && k < 4));
          li.classList.toggle('is-current', k + 1 === i);
        });
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };
})();
