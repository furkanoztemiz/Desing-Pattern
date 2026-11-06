/*
 * Observer — sahneler (1/3): Giriş, Sorun, Çözüm
 */
(function () {
  'use strict';
  const OB = DP.obs;
  const { h } = DP;
  const kit = DP.kit;
  const md = (t) => DP.md(t, OB.roleOf);
  OB.md = md;
  OB.scenes = OB.scenes || {};
  const ui = (OB.ui = {
    foot: (root) => kit.foot(root, OB.roleOf),
    roleChip: (key) => kit.roleChip(OB.roles, key),
  });

  /** Konsol: satırlar {t, k, bad, note, hl}; konu, SMS, panel, tablet satırları ayrı renkte. */
  OB.renderConsole = function (el, cmd, lines, o) {
    o = o || {};
    el.innerHTML = '<div class="console-head"><span></span><span></span><span></span> ' + (o.title || 'Konsol') + '</div>';
    if (cmd) el.appendChild(h('div', { class: 'console-line is-cmd' }, cmd));
    lines.forEach((l, i) => {
      const cls = ['console-line', 'obl-' + (l.k || 'x')];
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
  OB.consoleLine = (l, o) => {
    o = o || {};
    return { t: l.t, k: l.k, bad: o.bad ? o.bad(l) : false, note: o.note ? o.note(l) : null, hl: o.hl ? o.hl(l) : false };
  };
  OB.cmd = (javac) => `$ ${javac ? 'javac *.java && ' : ''}java Main`;

  /** Bir programın son hâli → sahne durumu */
  OB.sonDurum = function (prog, o) {
    o = o || {};
    const r = o.run || OB.run(prog);
    return OB.stateFrom(prog, r.son, { banner: o.banner || null });
  };

  // ================================================================== 1. GİRİŞ
  /** Giriş animasyonu: gönderinin durumu değişir, abonelerin hepsi haber alır; abone olan ve ayrılan olur */
  const HDURUM = ['Hazırlanıyor', 'Yolda', 'Dağıtımda', 'Teslim edildi'];
  const HPLAN = [
    { d: 0, abone: ['tel', 'panel', 'tablet'], not: 'Telefon, panel ve tablet gönderiye abone' },
    { d: 1, abone: ['tel', 'panel', 'tablet'], ates: true, not: 'Durum değişti: abonelerin hepsi haber aldı' },
    { d: 1, abone: ['tel', 'panel', 'tablet', 'merkez'], yeni: 'merkez', not: 'Çağrı merkezi de abone oldu' },
    { d: 2, abone: ['tel', 'panel', 'tablet', 'merkez'], ates: true, not: 'Yeni durum: bu kez dört abone' },
    { d: 2, abone: ['panel', 'tablet', 'merkez'], cikan: 'tel', not: 'Ali SMS istemiyor: abonelikten çıktı' },
    { d: 3, abone: ['panel', 'tablet', 'merkez'], ates: true, not: 'Teslim edildi: telefon artık haber almıyor' },
    { d: 3, abone: ['panel', 'tablet', 'merkez'], not: 'Gönderi abonelerini sınıf adıyla hiç tanımadı' },
  ];
  const HEKRAN = [
    { k: 'tel', ad: 'Ali’nin telefonu', ic: 'telefon', y: 66 },
    { k: 'panel', ad: 'Satıcı paneli', ic: 'panel', y: 120 },
    { k: 'tablet', ad: 'Kurye tableti', ic: 'tablet', y: 174 },
    { k: 'merkez', ad: 'Çağrı merkezi', ic: 'merkez', y: 228 },
  ];

  OB.scenes.intro = function (root, ctx) {
    const el = h('div', { class: 'scene scene-intro' });
    el.innerHTML = `
      <div class="intro-grid">
        <section class="intro-main">
          <div class="chips">
            <span class="chip chip-cat is-behav">Davranışsal · Behavioral</span>
            <span class="chip">GoF · 1994</span>
            <span class="chip">Diğer adları: Dependents, Publish-Subscribe</span>
          </div>
          <h1 class="intro-title">Observer</h1>
          <div class="intro-sub">Gözlemci <span>· “durum değişir, aboneler kendiliğinden haber alır”</span></div>
          <blockquote class="intent">
            <div class="intent-label">Amaç</div>
            <p>Nesneler arasında <b>bire-çok</b> bir bağımlılık tanımla: bir nesnenin durumu değiştiğinde ona bağlı <b>bütün nesneler haberdar edilsin</b> ve kendiliğinden güncellensin.</p>
            <footer>— Gamma, Helm, Johnson, Vlissides (GoF), <i>Design Patterns</i>, 1994</footer>
          </blockquote>
        </section>
        <section class="intro-hero" aria-label="Kalıbın kısa animasyonu">${heroSvg()}</section>
      </div>
      <div class="intro-cards">
        <article class="card">
          <h3><span class="card-ic">🔔</span> Günlük hayattan</h3>
          <p>Bir kanala abone olup zile basarsınız. Yeni video gelince kanal <b>bütün abonelerine</b> aynı bildirimi
          gönderir; abonelerinin kim olduğunu tek tek tanımaz. İstemezseniz abonelikten çıkarsınız, kanalın hiçbir şeyi değişmez.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🧩</span> Fikir</h3>
          <p>Gönderi, kendisini izleyenleri <b>sınıf adıyla</b> bilmesin: elinde yalnızca bir <code>GonderiGozlemcisi</code>
          listesi olsun. Durum değişince <code>bildir()</code> listedeki herkese <code>guncelle(this)</code> der.</p>
          <p>Her ekran gerekeni gönderiden kendisi okur. Abone olmak ya da ayrılmak çalışma anında: <code>aboneEkle</code>, <code>aboneCikar</code>.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🎯</span> Bu derste</h3>
          <ol class="objectives">
            <li>Ekranları <b>adıyla çağırmanın</b> bedelini görmek (unutulan ekran, çelişen görünümler)</li>
            <li>Konuyu gözlemcilerden ortak bir arayüzle ayırmak</li>
            <li>Rolleri tanımak: ${['subject', 'observer', 'concreteObserver', 'client'].map((r) => ui.roleChip(r)).join(' ')}</li>
            <li>Çalışma anında abonelik, push / pull, bildirim sırası ve tuzakları</li>
            <li>Observer’ı Mediator’dan ve yayınla-abone ol (olay yolu) yapısından ayırmak</li>
          </ol>
        </article>
      </div>
      <div class="intro-cta">
        <button class="btn btn-primary btn-lg" type="button" data-go>Sorunla başlayalım →</button>
        <a class="btn btn-ghost" href="#/memento">← Önceki kalıp: Memento</a>
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
      k.durum.textContent = HDURUM[p.d];
      k.durumKap.setAttribute('class', 'ho-durum is-d' + p.d);
      if (p.ates) DP.flash(k.durumKap, 'is-pop');
      HEKRAN.forEach((e) => {
        const abone = p.abone.includes(e.k);
        k['tel-' + e.k].setAttribute('class', 'ho-tel' + (abone ? ' is-on' : '') + (p.yeni === e.k ? ' is-yeni' : '') + (p.cikan === e.k ? ' is-cikan' : ''));
        k['ek-' + e.k].setAttribute('class', 'ho-ekran' + (abone ? ' is-on' : ''));
        if (p.ates && abone) {
          k['ek-v-' + e.k].textContent = HDURUM[p.d];
          const dot = k['dot-' + e.k];
          dot.classList.remove('is-git');
          void dot.getBoundingClientRect();
          dot.classList.add('is-git');
        }
        if (t % HPLAN.length === 0) k['ek-v-' + e.k].textContent = e.k === 'merkez' ? '—' : HDURUM[0];
      });
      k.not.textContent = p.not;
      DP.flash(k.not, 'is-pop');
      t++;
    };
    tick();
    const timer = setInterval(tick, 1600);
    return { destroy: () => clearInterval(timer) };
  };

  function heroSvg() {
    const PX = 214;
    const PY = 160;
    const ekranlar = HEKRAN.map((e) => {
      const ex = 362;
      const dx = ex - PX - 10;
      const dy = e.y + 20 - PY;
      return `
        <path data-k="tel-${e.k}" class="ho-tel" d="M${PX} ${PY} C${PX + 70} ${PY} ${ex - 70} ${e.y + 20} ${ex} ${e.y + 20}"/>
        <circle data-k="dot-${e.k}" class="ho-dot" cx="${PX + 5}" cy="${PY}" r="6" style="--dx:${dx}px; --dy:${dy}px"/>
        <g data-k="ek-${e.k}" class="ho-ekran"><rect x="${ex}" y="${e.y}" width="178" height="40" rx="9"/>${OB.icon(e.ic, ex + 8, e.y + 8, 1)}<text class="ho-ad" x="${ex + 40}" y="${e.y + 17}">${e.ad}</text><text class="ho-v" data-k="ek-v-${e.k}" x="${ex + 40}" y="${e.y + 33}">${e.k === 'merkez' ? '—' : HDURUM[0]}</text></g>`;
    }).join('');
    return `
    <svg class="hero-svg obs-hero" viewBox="0 0 560 360" role="img" aria-label="Gönderinin durumu değişince abonelerin hepsi haber alır; abone olan ve abonelikten çıkan olur">
      <text class="h-caption" x="280" y="28" text-anchor="middle">Durum değişir, aboneler haber alır; konu onları adıyla tanımaz</text>
      <g class="ho-konu"><rect x="20" y="86" width="194" height="148" rx="12"/>${OB.icon('gonderi', 34, 100, 1)}<text class="ho-t" x="64" y="117">gonderi : Gonderi</text><text class="ho-s" x="34" y="146">KRG-1001 · Ali Şahin</text>
        <g data-k="durumKap" class="ho-durum is-d0"><rect x="34" y="160" width="166" height="30" rx="15"/><text data-k="durum" x="117" y="180" text-anchor="middle">Hazırlanıyor</text></g>
        <text class="ho-s" x="34" y="218">aboneler: ${'[…]'}</text></g>
      ${ekranlar}
      <text class="hc-not" data-k="not" x="280" y="300" text-anchor="middle"></text>
      <text class="h-sub ho-code" x="280" y="336" text-anchor="middle">gonderi.aboneEkle(tablet);   …   gonderi.setDurum("Yolda");  →  bildir()</text>
    </svg>`;
  }

  // ================================================================== 2. SORUN
  OB.scenes.problem = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-46' });
    const left = kit.panel('Kalıpsız kod · <span class="ver"></span>', { cls: 'panel-code obs-left' });
    const right = kit.panel('Gönderi takibi <span class="panel-sub">· gönderi ekranları adıyla çağırıyor</span>', { cls: 'panel-side obs-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'obs-cv' });
    const consoleEl = h('div', { class: 'console obs-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: OB.roleOf, special: OB.special });

    const viewHost = h('div', { class: 'obs-view' });
    const extra = h('div', { class: 'obs-extra' });
    right.body.append(viewHost, extra);
    const stage = new OB.TakipSahne(viewHost);

    const files = (v) => OB.fileList(OB.naiveFiles(v));
    const asMap = (v) => {
      const F = OB.naiveFiles(v);
      const m = {};
      Object.keys(F).forEach((n) => (m[n + '.java'] = F[n]));
      return m;
    };
    const R = { v1: OB.run(OB.NV.v1), v11: OB.run(OB.NV.v11), v2: OB.run(OB.NV.v2) };
    const notOf = (v) => (l) => (v === 'v2' && l.t === 'Kurye rotası: KRG-1001' ? 'teslim edildi ama tablet bilmiyor' : null);
    const satirlar = (v, n) => R[v].lines.slice(0, n == null ? R[v].lines.length : n).map((l) => OB.consoleLine(l, { note: notOf(v), bad: (x) => v === 'v2' && x.t === 'Kurye rotası: KRG-1001' }));
    const kacanAn = R.v2.olaylar.find((o) => o.e === 'kacan' && o.o === 'tablet');
    const G = 'KRG-1001';
    const STEPS = [
      {
        t: 'Sürüm 1.0: Gonderi iki ekranı adıyla çağırıyor',
        x: 'Gönderinin durumu değişince Ali’nin telefonuna SMS gidiyor, satıcı paneli güncelleniyor. Çalışıyor. Ama [[Gonderi]] iki ekranı **sınıf adıyla** tanıyor ve her birinin kendine özgü yöntemini çağırıyor: `smsGonder`, `satirGuncelle`.',
        v: 'v1', mark: ['Gonderi.java', ['telefon.smsGonder(takipNo, durum);', 'panel.satirGuncelle(takipNo, durum);'], 'focus'],
        st: () => OB.sonDurum(OB.NV.v1, { run: R.v1, banner: { text: 'Gonderi iki ekranı **adıyla** tanıyor: `smsGonder`, `satirGuncelle`.' } }),
      },
      {
        t: 'Sürüm 1.1: kurye tableti eklendi',
        x: 'Kurye de dağıtımdaki gönderileri tabletinde görmek istedi. Yeni ekran için **Gonderi değişti**: yeni alan, yeni kurucu parametresi, `setDurum`’da yeni bir çağrı. Main’deki `new Gonderi(…)` da değişti. Her yeni ekran, gözlenen sınıfta bir değişiklik demek.',
        v: 'v11', diff: 'v1', mark: ['Gonderi.java', 'tablet.rotaGuncelle(takipNo, durum);', 'focus'], animateOut: true,
        st: () => OB.sonDurum(OB.NV.v11, { run: R.v11, banner: { text: 'Yeni ekran için **Gonderi** değişti: alan, kurucu ve çağrı.' } }),
      },
      {
        t: 'Sürüm 2.0: teslimEt() tableti unuttu',
        x: 'Teslimde kimin teslim aldığı da yazılsın diye ikinci bir yöntem eklendi: `teslimEt`. Yazan geliştirici bildirimleri `setDurum`’dan kopyaladı ama **tableti unuttu**. Telefon ve panel haber aldı; tablete giden çağrı yok.',
        v: 'v2', diff: 'v11', n: () => kacanAn.n, mark: ['Gonderi.java', ['public void teslimEt(String teslimAlan) {', 'panel.satirGuncelle(takipNo, durum);'], 'bad'],
        st: () =>
          OB.stateFrom(OB.NV.v2, kacanAn.s, {
            ghl: { [G]: true },
            yontem: { g: G, ad: 'teslimEt' },
            hl: { aliTel: 'on', panel: 'on', tablet: 'bad' },
            teller: [{ g: G, o: 'tablet', kind: 'bad' }],
            tokens: [
              { from: 'g:' + G, to: 'o:aliTel', text: 'SMS', kind: 'bil' },
              { from: 'g:' + G, to: 'o:panel', text: 'satır', kind: 'bil', delay: 350 },
            ],
            banner: { text: '`teslimEt()`: telefon ✓ · panel ✓ · tablet **✗ çağrılmadı**', tone: 'bad' },
          }),
      },
      {
        t: 'Panel “teslim edildi”, tablet “rotada”',
        x: 'Program bitince iki ekran **çelişiyor**: satıcı paneli “Teslim edildi” diyor, kurye tableti KRG-1001’i hâlâ rotada gösteriyor. Kurye kapıya **yeniden** gidecek. Derleyici bunu yakalayamazdı: eksik olan bir çağrıydı.',
        v: 'v2', mark: ['Main.java', 'System.out.println(tablet.rota());', 'bad'], animateOut: true,
        st: () => OB.sonDurum(OB.NV.v2, { run: R.v2, banner: { text: 'Panel: **Teslim edildi** · tablet: **rotada** → kurye kapıya yeniden gidecek', tone: 'bad' } }),
      },
      {
        t: 'Teşhis — Gözlenen, gözlemcilerini adıyla tanıyor',
        x: 'Gonderi kimin haber alacağını kodunda tutuyor: her ekranın sınıfını, yöntemini, hangi yöntemden çağrılacağını. Yeni ekran, yeni yöntem ya da “bu gönderiyi şu da izlesin” isteği her seferinde Gonderi’yi değiştiriyor. Ya Gonderi yalnızca bir **abone listesi** tutsa?',
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
        left.head.querySelector('.ver').textContent = { v1: 'sürüm 1.0 (iki ekran)', v11: 'sürüm 1.1 (+ tablet)', v2: 'sürüm 2.0 (+ teslimEt)' }[s.v];
        // önce konsol: yüksekliği değişince işaretli satır kod panelinin dışında kalmasın
        OB.renderConsole(consoleEl, OB.cmd(true), satirlar(s.v, s.n ? s.n() : null), { animateFrom: info.animate && s.animateOut ? 0 : null, cursor: !!s.n });
        cv.setFiles(files(s.v), { active: s.mark ? s.mark[0] : 'Gonderi.java', prev: s.diff ? asMap(s.diff) : null, keepActive: false });
        if (s.mark) cv.mark(s.mark[0], s.mark[1], s.mark[2]);
        if (s.diag) {
          cv.mark('Gonderi.java', ['private final AliciTelefonu telefon;', 'private final KuryeTableti tablet;'], 'bad');
          cv.mark('Gonderi.java', ['public void teslimEt(String teslimAlan) {', 'panel.satirGuncelle(takipNo, durum);'], 'focus', { scroll: false });
        }
        right.el.classList.toggle('is-diag', !!s.diag);
        if (!s.diag) {
          const st = s.st();
          stage.render(st, last, { animate: info.animate });
          last = st;
          extra.innerHTML = '';
          return;
        }
        extra.innerHTML = `
          <div class="obs-evidence">
            <span class="obs-ev-k">1.0</span><b>2 ekran, 2 farklı yöntem</b>
            <span class="obs-ev-k">1.1</span><b class="is-bad">Gonderi değişti</b>
            <span class="obs-ev-k">2.0</span><b class="is-bad">tablet unutuldu</b>
            <span class="obs-ev-k">Gonderi’nin tanıdığı ekran sınıfı</span><b>${OB.tanidigi(OB.code.GonderiV2)}</b>
            <span class="obs-ev-why">${md('Durumu değişen sınıf, kimlerin haber alacağını da bilmek zorunda kaldı. Her yeni ekran ve durumu değiştiren her yeni yöntem, aynı listeyi bir kez daha elle yazmak demek.')}</span>
          </div>
          <div class="req-card is-diagnosis">
            <div class="diag-title">Teşhis</div>
            <ul class="problems">
              <li>${md('**Sıkı bağ:** Gonderi her ekranı sınıf adıyla tanıyor ve her birinin kendine özgü yöntemini çağırıyor. Çağrı merkezi ya da mobil uygulama eklenecekse Gonderi’ye yeni alan, yeni parametre, yeni çağrılar gerekir.')}</li>
              <li>${md('**Dağınık bildirim:** durumu değiştiren her yöntem herkesi ayrı ayrı çağırmak zorunda. Biri unutulunca ekranlar birbiriyle çelişiyor: panel “teslim edildi”, tablet “rotada”.')}</li>
              <li>${md('**Değişmeyen liste:** kimin haber alacağı kurucuda sabit. Ali SMS istemezse ya da Zeynep’in gönderisini çağrı merkezi de izlemek isterse yine Gonderi değişmeli.')}</li>
            </ul>
          </div>
          <div class="sg-aside">${md('💬 **Kanal aboneliği gibi:** kanal abonelerini tek tek tanımaz; yeni video gelince listedeki herkese aynı bildirimi gönderir. Ya Gonderi de yalnızca bir abone listesi tutsa, ekranlar da kendileri abone olsa?')}</div>`;
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
  OB.scenes.solution = function (root, ctx) {
    const R = OB.refactor;
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-diag' });
    const left = kit.panel('Yeniden düzenleme (refactoring)', { cls: 'panel-code obs-left' });
    const right = kit.panel('Sınıf diyagramı', { cls: 'panel-side panel-diagram' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'obs-cv' });
    const consoleEl = h('div', { class: 'console obs-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: OB.roleOf, special: OB.special });
    const diagHost = h('div', { class: 'diag-host' });
    const recipe = h('ol', { class: 'recipe' });
    const legend = kit.umlLegend({ association: true, aggregation: 'abone listesi', fmLabel: 'bildirim (bildir → guncelle)' });
    right.body.append(h('div', { class: 'recipe-wrap' }, h('div', { class: 'recipe-title' }, 'Dönüşüm tarifi'), recipe), diagHost, legend);
    ['Ortak arayüz: guncelle(gonderi)', 'Abone listesi, tek bildir()', 'Abone etmeyi Main üstlenir'].forEach((t, i) => recipe.appendChild(h('li', { 'data-i': String(i + 1) }, t)));
    const diagram = new DP.ClassDiagram(diagHost, OB.solutionDiagram(0), { roles: OB.roles, roleTags: false });

    const outAt = (i) =>
      OB.run(OB.refactorProgs[i]).lines.map((l) =>
        OB.consoleLine(l, {
          bad: (x) => x.t === 'Kurye rotası: KRG-1001',
          note: (x) => (x.t === 'Kurye rotası: KRG-1001' ? 'tablet teslimi duymadı' : i >= 2 && x.t === '  Tablet: KRG-1001 rotadan çıktı' ? 'artık tablet de haber alıyor' : null),
          hl: (x) => i === 2 && x.t === '  Tablet: KRG-1001 rotadan çıktı',
        })
      );
    const STEPS = [
      { t: 'Başlangıç — Gonderi ekranları adıyla çağırıyor', x: 'Gonderi üç ekranı sınıf adıyla tanıyor; `teslimEt` tableti unutuyor ve kurye rotasında teslim edilmiş bir gönderi kalıyor. Üç adımda Gonderi’yi ekranlardan ayıracağız.', focus: 'Gonderi.java', mark: ['public void teslimEt(String teslimAlan) {', 'panel.satirGuncelle(takipNo, durum);'], kind: 'bad' },
      { t: 'Adım 1 — `GonderiGozlemcisi`', x: 'Üç ekran tek bir arayüzü uyguluyor: `guncelle(Gonderi gonderi)`. Kendine özgü yöntemler (`smsGonder`, `satirGuncelle`, `rotaGuncelle`) gitti; her ekran gerekeni gönderiden **kendisi okuyor** (`getDurum()`). Gonderi hâlâ üçünü adıyla çağırıyor ve `teslimEt` tableti hâlâ unutuyor: konsol değişmedi.', focus: 'AliciTelefonu.java', marks: ['public void guncelle(Gonderi gonderi) {', 'String durum = gonderi.getDurum();'] },
      { t: 'Adım 2 — Abone listesi ve tek `bildir()`', x: 'Üç alan yerine tek bir liste: `List<GonderiGozlemcisi> aboneler`. Kurucu ekranları listeye koyuyor; durumu değiştiren **iki yöntem de** yalnızca `bildir()` diyor. Kimseyi unutmak artık mümkün değil: konsola bakın, tablet de “rotadan çıktı” dedi.', focus: 'Gonderi.java', marks: ['private final List<GonderiGozlemcisi> aboneler = new ArrayList<>();', 'abone.guncelle(this);'] },
      { t: 'Adım 3 — Abone etmeyi Main üstlenir', x: 'Kurucu artık yalnızca takip numarasını alıyor; ekranları **Main** abone ediyor: `gonderi.aboneEkle(telefon)`. Gonderi’nin tanıdığı ekran sınıfı **0**. Kim abone olursa olsun, kim ayrılırsa ayrılsın Gonderi değişmez.', focus: 'Gonderi.java', marks: ['public Gonderi(String takipNo) {', 'aboneler.remove(abone);'] },
      { t: 'Sonuç — Ne kazandık?', x: 'Konu (Gonderi) ile gözlemciler (ekranlar) yalnızca bir arayüzle bağlı: **bire-çok**, gevşek bir bağ. Yeni ekran = yeni bir sınıf + bir `aboneEkle` satırı. Bedeli: kimin, hangi sırayla haber aldığı artık koddan okunmuyor; Yapı sahnesinde tuzaklarına bakacağız.', focus: 'Gonderi.java', marks: ['private void bildir() {', 'bildir();'] },
    ];

    const filesAt = (i) => OB.refactorOrder.filter((k) => R[i][k]).map((k) => ({ name: k + '.java', code: R[i][k] }));
    const asMap = (i) => {
      const m = {};
      Object.keys(R[i]).forEach((k) => (m[k + '.java'] = R[i][k]));
      return m;
    };

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t.replace(/`/g, '')),
      delayOf: () => 7800,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        const ri = Math.min(i, R.length - 1);
        // önce konsol, sonra koddaki işaret
        OB.renderConsole(consoleEl, OB.cmd(true), outAt(ri), { animateFrom: info.animate && i === 2 ? 0 : null });
        const showDiff = i >= 1 && i <= R.length - 1;
        cv.setFiles(filesAt(ri), { active: s.focus, prev: showDiff ? asMap(ri - 1) : null, keepActive: false });
        if (s.mark) cv.mark(s.focus, s.mark, s.kind || 'focus');
        (s.marks || []).forEach((m, k) => cv.mark(s.focus, m, 'focus', { scroll: k === 0 }));

        diagram.update(OB.solutionDiagram(Math.min(i, 4)), { animate: info.animate });
        diagram.clearBadges();
        diagram.clearFocus();
        if (i === 0) {
          diagram.badge('Gonderi', '3 ekranı tanıyor', 'bad');
          diagram.badge('KuryeTableti', 'teslimi duymuyor', 'bad');
          diagram.focus({ classes: ['Gonderi', 'AliciTelefonu', 'SaticiPaneli', 'KuryeTableti'], edges: ['tanir-AliciTelefonu', 'tanir-SaticiPaneli', 'tanir-KuryeTableti'] });
        }
        if (i === 1) {
          diagram.badge('GonderiGozlemcisi', 'YENİ', 'new');
          diagram.focus({ classes: ['GonderiGozlemcisi', 'AliciTelefonu', 'SaticiPaneli', 'KuryeTableti'], edges: ['r-AliciTelefonu', 'r-SaticiPaneli', 'r-KuryeTableti'], members: [['GonderiGozlemcisi', 'guncelle']] });
        }
        if (i === 2) {
          diagram.badge('Gonderi', 'tek bildir()', 'new');
          diagram.focus({ classes: ['Gonderi', 'GonderiGozlemcisi'], edges: ['aboneler'], members: [['Gonderi', 'aboneler'], ['Gonderi', 'bildir']] });
        }
        if (i === 3) {
          diagram.badge('Gonderi', 'ekranları tanımıyor', 'new');
          diagram.focus({ classes: ['Gonderi', 'Main'], edges: ['c-main'], members: [['Gonderi', 'aboneEkle'], ['Gonderi', 'aboneCikar']] });
        }
        if (i === 4) diagram.focus({ classes: ['Gonderi', 'GonderiGozlemcisi', 'AliciTelefonu', 'SaticiPaneli', 'KuryeTableti'], edges: ['aboneler', 'r-AliciTelefonu', 'r-SaticiPaneli', 'r-KuryeTableti'] });
        DP.$$('li', recipe).forEach((li, k) => {
          li.classList.toggle('is-done', k + 1 < i || (i === 4 && k < 3));
          li.classList.toggle('is-current', k + 1 === i);
        });
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };
})();
