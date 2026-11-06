/*
 * Mediator — sahneler (1/3): Giriş, Sorun, Çözüm
 */
(function () {
  'use strict';
  const MD = DP.med;
  const { h } = DP;
  const kit = DP.kit;
  const md = (t) => DP.md(t, MD.roleOf);
  MD.md = md;
  MD.scenes = MD.scenes || {};
  const ui = (MD.ui = {
    foot: (root) => kit.foot(root, MD.roleOf),
    roleChip: (key) => kit.roleChip(MD.roles, key),
  });

  /** Konsol: satırlar {t, k, bad, note, hl}; kullanıcı işlemi, ayar, ücret satırları ayrı renkte. */
  MD.renderConsole = function (el, cmd, lines, o) {
    o = o || {};
    el.innerHTML = '<div class="console-head"><span></span><span></span><span></span> ' + (o.title || 'Konsol') + '</div>';
    if (cmd) el.appendChild(h('div', { class: 'console-line is-cmd' }, cmd));
    lines.forEach((l, i) => {
      const cls = ['console-line', 'mdl-' + (l.k || 'x')];
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
  MD.consoleLine = (l, o) => {
    o = o || {};
    return { t: l.t, k: l.k, bad: o.bad ? o.bad(l) : false, note: o.note ? o.note(l) : null, hl: o.hl ? o.hl(l) : false };
  };
  MD.cmd = (javac) => `$ ${javac ? 'javac *.java && ' : ''}java Main`;

  /** Bir programın son hâli → sahne durumu */
  MD.sonDurum = function (prog, o) {
    o = o || {};
    const r = o.run || MD.run(prog);
    return MD.stateFrom(prog, r.son, { banner: o.banner || null });
  };

  // ================================================================== 1. GİRİŞ
  /** Giriş animasyonu: önce ağ (herkes herkesi tanır), sonra yıldız (herkes yalnızca arabulucuyu tanır) */
  const HD = { sehir: 'şehir', agirlik: 'ağırlık', soguk: 'soğuk zincir', teslimat: 'teslimat', ucret: 'ücret' };
  const HO = ['sehir', 'agirlik', 'soguk', 'teslimat', 'ucret'];
  const HPLAN = [
    { faz: 'ag', not: 'Arabulucu yok: her öğe ötekileri tanıyor (10 bağ)' },
    { faz: 'ag', ates: [['soguk', 'teslimat'], ['soguk', 'ucret']], not: 'Soğuk zincir işaretlendi: teslimata ve ücrete kendisi söylüyor' },
    { faz: 'ag', ates: [['sehir', 'teslimat']], bad: true, not: 'Şehir seçildi: şehir seçici dolabı yeniden açtı!' },
    { faz: 'yildiz', not: 'Arabulucuyla: öğeler yalnızca formu tanıyor (5 bağ)' },
    { faz: 'yildiz', ates: [['soguk', 'hub'], ['hub', 'teslimat', 0.55], ['hub', 'ucret', 0.55]], not: 'Soğuk zincir: öğe forma haber verir, form kuralları uygular' },
    { faz: 'yildiz', ates: [['sehir', 'hub'], ['hub', 'teslimat', 0.55]], not: 'Şehir seçildi: form bütün kurala bakar, dolap kapalı kalır' },
  ];
  const HPOS = (() => {
    const P = {};
    HO.forEach((o, k) => {
      const a = -Math.PI / 2 + (k * 2 * Math.PI) / HO.length;
      P[o] = { x: 280 + Math.cos(a) * 168, y: 166 + Math.sin(a) * 104 };
    });
    P.hub = { x: 280, y: 166 };
    return P;
  })();

  MD.scenes.intro = function (root, ctx) {
    const el = h('div', { class: 'scene scene-intro' });
    el.innerHTML = `
      <div class="intro-grid">
        <section class="intro-main">
          <div class="chips">
            <span class="chip chip-cat is-behav">Davranışsal · Behavioral</span>
            <span class="chip">GoF · 1994</span>
            <span class="chip">Anahtar kelime: herkes arabulucuyla konuşur</span>
          </div>
          <h1 class="intro-title">Mediator</h1>
          <div class="intro-sub">Arabulucu <span>· “öğeler birbirini değil, yalnızca arabulucuyu tanır”</span></div>
          <blockquote class="intent">
            <div class="intent-label">Amaç</div>
            <p>Bir grup nesnenin <b>birbiriyle nasıl etkileşeceğini</b> kapsülleyen bir nesne tanımla. Nesnelerin birbirine doğrudan başvurmasını önleyerek <b>gevşek bağ</b> sağlar ve etkileşimi onlardan bağımsız olarak değiştirmeye izin verir.</p>
            <footer>— Gamma, Helm, Johnson, Vlissides (GoF), <i>Design Patterns</i>, 1994</footer>
          </blockquote>
        </section>
        <section class="intro-hero" aria-label="Kalıbın kısa animasyonu">${heroSvg()}</section>
      </div>
      <div class="intro-cards">
        <article class="card">
          <h3><span class="card-ic">🛬</span> Günlük hayattan</h3>
          <p>Uçaklar birbiriyle konuşmaz; hepsi <b>kuleyle</b> konuşur. Pistin kime ait olduğuna, kimin bekleyeceğine kule karar
          verir. Yeni bir uçak geldiğinde öteki uçakların hiçbir şey öğrenmesi gerekmez.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🧩</span> Fikir</h3>
          <p>Form öğeleri (şehir, ağırlık, soğuk zincir, teslimat, ücret) birbirini <b>tanımasın</b>. Bir öğe değişince yalnızca
          forma söylesin: <code>yonetici.degisti(this)</code>.</p>
          <p>“Dolap ne zaman açık?” gibi bütün kurallar tek yerde, <code>GonderiFormu.degisti()</code> içinde dursun.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🎯</span> Bu derste</h3>
          <ol class="objectives">
            <li>Öğelerin birbirini <b>tanımasının</b> bedelini görmek (kopyalanan kural, sıraya bağlı hata)</li>
            <li>Ağı yıldıza çevirmek: etkileşimi tek bir arabulucuya toplamak</li>
            <li>Rolleri tanımak: ${['mediator', 'concreteMediator', 'colleague', 'concreteColleague', 'client'].map((r) => ui.roleChip(r)).join(' ')}</li>
            <li>Bağ sayısı, sonsuz bildirim döngüsü, “her şeyi bilen” arabulucu</li>
            <li>Mediator’ı Facade ve Observer’dan ayırmak</li>
          </ol>
        </article>
      </div>
      <div class="intro-cta">
        <button class="btn btn-primary btn-lg" type="button" data-go>Sorunla başlayalım →</button>
        <a class="btn btn-ghost" href="#/command">← Önceki kalıp: Command</a>
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
      svg.classList.toggle('is-yildiz', p.faz === 'yildiz');
      svg.classList.toggle('is-ag', p.faz === 'ag');
      DP.$$('.mh-dot', svg).forEach((d) => d.classList.remove('is-git', 'is-bad'));
      DP.$$('.mh-dugum', svg).forEach((d) => d.classList.remove('is-on', 'is-bad'));
      (p.ates || []).forEach(([a, b, gec]) => {
        const dot = k['dot-' + a + '-' + b];
        if (!dot) return;
        dot.style.setProperty('--gec', (gec || 0) + 's');
        void dot.getBoundingClientRect();
        dot.classList.add('is-git');
        if (p.bad) dot.classList.add('is-bad');
        const hedef = k['n-' + b];
        if (hedef) hedef.classList.add(p.bad ? 'is-bad' : 'is-on');
      });
      k.not.textContent = p.not;
      DP.flash(k.not, 'is-pop');
      t++;
    };
    tick();
    const timer = setInterval(tick, 1800);
    return { destroy: () => clearInterval(timer) };
  };

  function heroSvg() {
    const P = HPOS;
    let ag = '';
    for (let a = 0; a < HO.length; a++) for (let b = a + 1; b < HO.length; b++) ag += `<line class="mh-ag" x1="${P[HO[a]].x}" y1="${P[HO[a]].y}" x2="${P[HO[b]].x}" y2="${P[HO[b]].y}"/>`;
    const yildiz = HO.map((o) => `<line class="mh-kol" x1="${P[o].x}" y1="${P[o].y}" x2="${P.hub.x}" y2="${P.hub.y}"/>`).join('');
    const yollar = [
      ['soguk', 'teslimat'],
      ['soguk', 'ucret'],
      ['sehir', 'teslimat'],
      ['soguk', 'hub'],
      ['hub', 'teslimat'],
      ['hub', 'ucret'],
      ['sehir', 'hub'],
    ];
    const noktalar = yollar.map(([a, b]) => `<circle data-k="dot-${a}-${b}" class="mh-dot" cx="${P[a].x}" cy="${P[a].y}" r="6" style="--dx:${(P[b].x - P[a].x).toFixed(1)}px; --dy:${(P[b].y - P[a].y).toFixed(1)}px"/>`).join('');
    const dugumler = HO.map((o) => `<g data-k="n-${o}" class="mh-dugum"><rect x="${P[o].x - 52}" y="${P[o].y - 17}" width="104" height="34" rx="9"/><text x="${P[o].x}" y="${P[o].y + 5}" text-anchor="middle">${HD[o]}</text></g>`).join('');
    return `
    <svg class="hero-svg med-hero is-ag" viewBox="0 0 560 360" role="img" aria-label="Önce her öğe ötekilere bağlı; sonra öğeler yalnızca ortadaki arabulucuya bağlı">
      <text class="h-caption" x="280" y="28" text-anchor="middle">Öğeler birbirini değil, yalnızca arabulucuyu tanır</text>
      <g class="mh-ag-g">${ag}</g>
      <g class="mh-yildiz-g">${yildiz}</g>
      <g data-k="n-hub" class="mh-hub"><rect x="${P.hub.x - 54}" y="${P.hub.y - 20}" width="108" height="40" rx="11"/><text x="${P.hub.x}" y="${P.hub.y + 5}" text-anchor="middle">form</text></g>
      ${noktalar}
      ${dugumler}
      <text class="hc-not" data-k="not" x="280" y="306" text-anchor="middle"></text>
      <text class="h-sub mh-code" x="280" y="338" text-anchor="middle">soguk.isaretle(true)  →  yonetici.degisti(this)  →  teslimat.ayarla(…)</text>
    </svg>`;
  }

  // ================================================================== 2. SORUN
  MD.scenes.problem = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-46' });
    const left = kit.panel('Kalıpsız kod · <span class="ver"></span>', { cls: 'panel-code med-left' });
    const right = kit.panel('Gönderi formu <span class="panel-sub">· öğeler birbirini tanıyor</span>', { cls: 'panel-side med-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'med-cv' });
    const consoleEl = h('div', { class: 'console med-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: MD.roleOf, special: MD.special });

    const viewHost = h('div', { class: 'med-view' });
    const extra = h('div', { class: 'med-extra' });
    right.body.append(viewHost, extra);
    const stage = new MD.FormSahne(viewHost);

    const files = (v) => MD.fileList(MD.naiveFiles(v));
    const asMap = (v) => {
      const F = MD.naiveFiles(v);
      const m = {};
      Object.keys(F).forEach((n) => (m[n + '.java'] = F[n]));
      return m;
    };
    const R = { v1: MD.run(MD.NV.v1), v2a: MD.run(MD.NV.v2a), v2b: MD.run(MD.NV.v2b) };
    const SON = 'Gönderi: Malatya · 2 kg · soğuk zincir · Dolap · 59 TL';
    const satirlar = (v, n) =>
      R[v].lines.slice(0, n == null ? R[v].lines.length : n).map((l) =>
        MD.consoleLine(l, { bad: (x) => v === 'v2b' && (x.t === SON || x.t === '  dolap: açık'), note: (x) => (v === 'v2b' && x.t === SON ? 'soğuk zincirli ilaç dolaba!' : v === 'v2b' && x.t === '  dolap: açık' ? 'soğuk zincir varken!' : null) })
      );
    // şehir seçildiği an (sıra B, 2. işlem): dolap yanlışlıkla açılır
    const sehirAn = R.v2b.olaylar.filter((x) => x.i === 1 && x.e === 'son')[0];
    const sehirFx = MD.cagriFx(R.v2b.olaylar, 1);
    const STEPS = [
      {
        t: 'Sürüm 1.0: dört öğe birbirini tanıyor',
        x: 'Şube ekranındaki form dört öğeden oluşuyor. “Dolap açık mı?” kuralını **iki öğe** ayrı ayrı uyguluyor: şehir seçici ([[SehirSecici]]) ve ağırlık alanı ([[AgirlikAlani]]). Bunun için birbirlerini tanıyorlar: sağdaki grafikte **7 bağ**. Çalışıyor.',
        v: 'v1', mark: ['SehirSecici.java', ['boolean dolap = sehir.equals("Malatya") && agirlik.kg() <= 20;', 'teslimat.setDolapAcik(dolap);'], 'focus'],
        st: () => MD.sonDurum(MD.NV.v1, { run: R.v1, banner: { text: 'Dolap kuralı **iki öğede** kopya; öğeler birbirini tanıyor (7 bağ).' } }),
      },
      {
        t: 'Sürüm 2.0: soğuk zincir kutusu eklendi',
        x: 'İlaç gibi soğuk zincirli gönderiler dolaba konamaz. Yeni öğe [[SogukZincirKutusu]] eklendi; işaretlenince dolabı kapatıyor. Öbür öğeler de onu tanımak zorunda kaldı (ücret için): bağ sayısı **13**. Önce şehir, sonra soğuk zincir seçilince her şey doğru: Dolap seçilemiyor.',
        v: 'v2a', diff: 'v1', mark: ['SogukZincirKutusu.java', ['boolean dolap = !isaretli && "Malatya".equals(sehir.secili())', 'teslimat.setDolapAcik(dolap);'], 'focus'], animateOut: true,
        st: () => MD.sonDurum(MD.NV.v2a, { run: R.v2a, banner: { text: 'Önce şehir, sonra soğuk zincir: dolap kapandı, Dolap **seçilemedi**.', tone: 'ok' } }),
      },
      {
        t: 'Aynı değerler, başka sıra',
        x: 'Bu kez görevli önce **soğuk zinciri** işaretledi, sonra şehri seçti. Şehir seçici kendi kural kopyasını uyguladı: “Malatya ve 20 kg altı → dolap açık”. Soğuk zinciri **bilmiyor**; o kutu eklenirken bu kopya güncellenmedi. Dolap yeniden açıldı.',
        v: 'v2b', diff: 'v2a', n: () => sehirAn.n, mark: ['SehirSecici.java', 'boolean dolap = sehir.equals("Malatya") && agirlik.kg() <= 20;', 'bad'],
        st: () =>
          MD.stateFrom(MD.NV.v2b, sehirAn.s, {
            aktif: 'sehir',
            hl: sehirFx.hl,
            kenar: sehirFx.kenar,
            tokens: sehirFx.tokens,
            banner: { text: 'Şehir seçici dolabı açtı: soğuk zinciri **bilmiyordu**', tone: 'bad' },
          }),
      },
      {
        t: 'Soğuk zincirli ilaç dolaba gitti',
        x: 'Ağırlık alanının kopyası da soğuk zinciri bilmiyor; dolap açık kaldı ve görevli Dolap’ı seçebildi. Form kurala aykırı bir gönderi oluşturdu: soğuk zincirli ilaç oda sıcaklığındaki **dolaba** gidiyor. Chain of Responsibility’deki hatanın aynısı, bu kez bir formda.',
        v: 'v2b', mark: ['AgirlikAlani.java', 'boolean dolap = "Malatya".equals(sehir.secili()) && kg <= 20;', 'bad'], animateOut: true,
        st: () => MD.sonDurum(MD.NV.v2b, { run: R.v2b, banner: { text: 'Soğuk zincir + **Dolap**: kurala aykırı gönderi', tone: 'bad' } }),
      },
      {
        t: 'Teşhis — Herkes herkesi tanıyor',
        x: 'Öğeler arasındaki etkileşim öğelerin içine dağılmış: her öğe ötekileri tanıyor ve kuralın bir parçasını uyguluyor. Sonuç, kimin **en son** konuştuğuna, yani tıklama sırasına bağlı. Ya öğeler yalnızca bir **arabulucuyla** konuşsa?',
        v: 'v2b', diag: true,
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
        left.head.querySelector('.ver').textContent = { v1: 'sürüm 1.0 (dört öğe)', v2a: 'sürüm 2.0 · önce şehir', v2b: 'sürüm 2.0 · önce soğuk zincir' }[s.v];
        // önce konsol: yüksekliği değişince işaretli satır kod panelinin dışında kalmasın
        MD.renderConsole(consoleEl, MD.cmd(true), satirlar(s.v, s.n ? s.n() : null), { animateFrom: info.animate && s.animateOut ? 0 : null, cursor: !!s.n });
        cv.setFiles(files(s.v), { active: s.mark ? s.mark[0] : 'SehirSecici.java', prev: s.diff ? asMap(s.diff) : null, keepActive: false });
        if (s.mark) cv.mark(s.mark[0], s.mark[1], s.mark[2]);
        if (s.diag) {
          cv.mark('AgirlikAlani.java', 'boolean dolap = "Malatya".equals(sehir.secili()) && kg <= 20;', 'bad', { show: false, scroll: false });
          cv.mark('SehirSecici.java', ['private AgirlikAlani agirlik;', 'private TeslimatSecici teslimat;'], 'bad');
          cv.mark('SehirSecici.java', 'boolean dolap = sehir.equals("Malatya") && agirlik.kg() <= 20;', 'bad', { scroll: false });
        }
        right.el.classList.toggle('is-diag', !!s.diag);
        if (!s.diag) {
          const st = s.st();
          stage.render(st, last, { animate: info.animate });
          last = st;
          extra.innerHTML = '';
          return;
        }
        const F1 = MD.naiveFiles('v1');
        const F2 = MD.naiveFiles('v2b');
        const k2 = MD.kuralYerleri(F2);
        extra.innerHTML = `
          <div class="med-evidence">
            <span class="med-ev-k">1.0</span><b>${MD.baglar(F1).length} bağ · kural ${MD.kuralYerleri(F1).length} yerde</b>
            <span class="med-ev-k">2.0</span><b class="is-bad">${MD.baglar(F2).length} bağ · kural ${k2.length} yerde (${k2.filter((x) => x.eksik).length} eksik)</b>
            <span class="med-ev-k">aynı değerler</span><b class="is-bad">sıraya göre farklı sonuç</b>
            <span class="med-ev-why">${md('Etkileşim kuralları öğelerin içine dağıldı. Bir öğe eklemek, ötekilerin hepsini okuyup gerekenleri değiştirmek demek; unutulan bir kopya ancak belli bir tıklama sırasında ortaya çıkıyor.')}</span>
          </div>
          <div class="req-card is-diagnosis">
            <div class="diag-title">Teşhis</div>
            <ul class="problems">
              <li>${md('**Herkes herkesi tanıyor:** beş öğe arasında 13 bağ. Soğuk zincir kutusunu eklemek dört sınıfı ve formun kurucusunu değiştirdi; öğeleri başka bir formda tek başına kullanmak imkânsız.')}</li>
              <li>${md('**Kural dağınık:** “Dolap açık mı?” üç sınıfta ayrı ayrı yazılı. Biri güncellenip ötekiler unutulunca **en son konuşan** öğe kazanıyor.')}</li>
              <li>${md('**Sıraya bağlı sonuç:** aynı değerler, farklı tıklama sırası, farklı form. Hatayı bulmak için bütün öğeleri birlikte okumak gerekiyor.')}</li>
            </ul>
          </div>
          <div class="sg-aside">${md('💬 **Kontrol kulesi gibi:** uçaklar birbiriyle konuşmaz, hepsi kuleyle konuşur; pistin kime ait olduğuna kule karar verir. Ya form öğeleri de yalnızca formla konuşsa ve kurallar tek yerde dursa?')}</div>`;
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
  /** Bağ grafiği açıklaması (Çözüm ve Yapı) */
  MD.grafikAciklama = () =>
    h('div', {
      class: 'med-lejant',
      html: `<span><svg viewBox="0 0 46 14"><line x1="2" y1="7" x2="34" y2="7" class="lg-line"/><polygon points="44,7 33,2 33,12" class="med-lg-uc"/></svg> alan: tanır</span>
        <span><svg viewBox="0 0 46 14"><polygon points="2,7 13,2 13,12" class="med-lg-uc"/><line x1="12" y1="7" x2="34" y2="7" class="lg-line"/><polygon points="44,7 33,2 33,12" class="med-lg-uc"/></svg> iki yönlü</span>
        <span><b class="med-lg-kural">kural</b> dolap kuralının bir kopyası</span>
        <span><b class="med-lg-kural is-eksik">kural eksik</b> soğuk zinciri bilmiyor</span>`,
    });

  MD.scenes.solution = function (root, ctx) {
    const RF = MD.refactor;
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-diag' });
    const left = kit.panel('Yeniden düzenleme (refactoring)', { cls: 'panel-code med-left' });
    const right = kit.panel('Bağ grafiği <span class="panel-sub">· kim kimi tanıyor?</span>', { cls: 'panel-side med-right med-cozum' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'med-cv' });
    const consoleEl = h('div', { class: 'console med-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: MD.roleOf, special: MD.special });
    const recipe = h('ol', { class: 'recipe' });
    const viewHost = h('div', { class: 'med-view' });
    right.body.append(h('div', { class: 'recipe-wrap' }, h('div', { class: 'recipe-title' }, 'Dönüşüm tarifi'), recipe), viewHost, MD.grafikAciklama());
    ['Arayüz ve üst sınıf: yönetici ile öğe', 'Kurallar tek yerde: degisti()', 'Öğeler birbirini unutur'].forEach((t, i) => recipe.appendChild(h('li', { 'data-i': String(i + 1) }, t)));
    const stage = new MD.FormSahne(viewHost, { cls: 'is-cozum', grafik: true });

    const SON = 'Gönderi: Malatya · 2 kg · soğuk zincir · Dolap · 59 TL';
    const outAt = (i) =>
      MD.run(MD.refactorProgs[i]).lines.map((l) =>
        MD.consoleLine(l, {
          bad: (x) => x.t === SON,
          note: (x) => (x.t === SON ? 'ilaç dolaba' : i >= 2 && x.k === 'red' ? 'artık dolap kapalı' : null),
          hl: (x) => i === 2 && x.k === 'red',
        })
      );
    const STEPS = [
      { t: 'Başlangıç — öğeler birbirini tanıyor', x: 'Beş öğe arasında 13 bağ; “dolap açık mı?” kuralı üç öğede kopya, ikisi soğuk zinciri bilmiyor. Önce soğuk zincir, sonra şehir seçilince ilaç dolaba gidiyor. Üç adımda öğeleri birbirinden ayıracağız; Main değişmeyecek.', focus: 'SehirSecici.java', mark: 'boolean dolap = sehir.equals("Malatya") && agirlik.kg() <= 20;', kind: 'bad', banner: { text: '13 bağ · kural 3 yerde (2 eksik) · ilaç dolaba', tone: 'bad' } },
      { t: 'Adım 1 — `FormYoneticisi` ve `FormOgesi`', x: 'İki rol tanımlandı: [[FormYoneticisi]] (arabulucu arayüzü, tek yöntem: `degisti(kaynak)`) ve [[FormOgesi]] (her öğenin üst sınıfı; değişince `yonetici.degisti(this)` der). [[GonderiFormu]] yönetici oldu ama `degisti` henüz boş: kurallar hâlâ öğelerin içinde, hata sürüyor.', focus: 'FormOgesi.java', marks: ['protected void degisti() {', 'yonetici.degisti(this);'], banner: { text: 'İskelet hazır; kurallar henüz öğelerde · hata sürüyor', tone: 'bad' } },
      { t: 'Adım 2 — Kurallar tek yerde', x: 'Bütün kurallar [[GonderiFormu]]’nun `degisti` yöntemine taşındı: dolap, hızlı teslimat ve ücret. Öğeler artık birbirini **çağırmıyor**; yalnızca `degisti()` diyor. Teslimat seçiciye `ayarla(hizli, dolap)` eklendi. Konsola bakın: dolap kapalı kaldı, Dolap seçilemedi.', focus: 'GonderiFormu.java', marks: ['public void degisti(FormOgesi kaynak) {', 'ucret.goster(ucretHesapla());'], banner: { text: 'Kural tek yerde · dolap kapalı kaldı · eski bağlar hâlâ duruyor', tone: 'ok' } },
      { t: 'Adım 3 — Öğeler birbirini unutur', x: 'Artık kullanılmayan alanlar ve `baglan` yöntemleri silindi; formun kurucusundaki bağlama satırları da gitti. Öğeler arasındaki bağ sayısı **13 → 0**: her öğe yalnızca yöneticisini tanıyor. Öğelerin her biri başka bir formda da kullanılabilir.', focus: 'SehirSecici.java', marks: ['public class SehirSecici extends FormOgesi {', 'degisti();'], banner: { text: 'Öğeler arası bağ: 0 · her öğe yalnızca formu tanıyor', tone: 'ok' } },
      { t: 'Sonuç — Ne kazandık?', x: 'Ağ yıldıza döndü. Etkileşimin bütün kuralları tek bir sınıfta: okunuyor, test ediliyor, tıklama sırasından bağımsız. Yeni bir öğe = yeni bir sınıf + yöneticide birkaç satır. Bedeli: yönetici büyüyebilir; Yapı sahnesinde konuşacağız.', focus: 'GonderiFormu.java', marks: ['boolean dolap = "Malatya".equals(sehir.secili()) && !soguk.isaretli()', 'teslimat.ayarla(hizli, dolap);'], banner: { text: 'Ağ → yıldız · kural 1 yerde · sıra fark etmez', tone: 'ok' } },
    ];

    const filesAt = (i) => MD.refactorOrder.filter((k) => RF[i][k]).map((k) => ({ name: k + '.java', code: RF[i][k] }));
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
        MD.renderConsole(consoleEl, MD.cmd(true), outAt(ri), { animateFrom: info.animate && i === 2 ? 0 : null });
        const showDiff = i >= 1 && i <= RF.length - 1;
        cv.setFiles(filesAt(ri), { active: s.focus, prev: showDiff ? asMap(ri - 1) : null, keepActive: false });
        if (s.mark) cv.mark(s.focus, s.mark, s.kind || 'focus');
        (s.marks || []).forEach((m, k) => cv.mark(s.focus, m, 'focus', { scroll: k === 0 }));
        const prog = MD.refactorProgs[ri];
        const st = MD.sonDurum(prog, { banner: s.banner });
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
