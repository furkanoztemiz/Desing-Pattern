/*
 * Memento — sahneler (1/3): Giriş, Sorun, Çözüm
 */
(function () {
  'use strict';
  const MN = DP.mnt;
  const { h } = DP;
  const kit = DP.kit;
  const esc = DP.esc;
  const md = (t) => DP.md(t, MN.roleOf);
  MN.md = md;
  MN.scenes = MN.scenes || {};
  const ui = (MN.ui = {
    foot: (root) => kit.foot(root, MN.roleOf),
    roleChip: (key) => kit.roleChip(MN.roles, key),
  });

  /** Konsol: satırlar {t, k, bad, note, hl}; defter, depo, kamyon, hata satırları ayrı renkte. */
  MN.renderConsole = function (el, cmd, lines, o) {
    o = o || {};
    el.innerHTML = '<div class="console-head"><span></span><span></span><span></span> ' + (o.title || 'Konsol') + '</div>';
    if (cmd) el.appendChild(h('div', { class: 'console-line is-cmd' }, cmd));
    lines.forEach((l, i) => {
      const cls = ['console-line', 'mnl-' + (l.k || 'x')];
      if (l.bad) cls.push('is-badline');
      if (l.k === 'durum') cls.push('is-strong');
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
  MN.consoleLine = (l, o) => {
    o = o || {};
    return { t: l.t, k: l.k, bad: o.bad ? o.bad(l) : false, note: o.note ? o.note(l) : null, hl: o.hl ? o.hl(l) : false };
  };
  MN.cmd = (javac) => `$ ${javac ? 'javac *.java && ' : ''}java Main`;

  /** Bir programın son hâli → sahne durumu (hatalı geri yüklemede olması gereken yerler hayalet kutu) */
  MN.sonDurum = function (prog, o) {
    o = o || {};
    const r = o.run || MN.run(prog);
    const s = r.son;
    const donler = r.olaylar.filter((x) => x.e === 'don');
    const son = donler[donler.length - 1];
    const hy = son && !son.ok ? MN.hayalet(s, son.dogru) : { ghost: {}, hl: {} };
    return MN.stateFrom(prog, s, { ghost: hy.ghost, hl: hy.hl, banner: o.banner || null });
  };

  // ================================================================== 1. GİRİŞ
  /** Giriş animasyonu: depo kendi hatırasını oluşturur, mühürleyip deftere verir; hata olunca hatırasına döner */
  const HSABAH = { 1001: 'A1', 1002: 'A2', 1003: 'A3', 1004: 'B1', 1005: 'B2', 1006: 'C1' };
  const HPLAN_DEGISIK = { 1001: 'B3', 1002: 'A2', 1003: 'A3', 1004: 'C2', 1005: 'B2', 1006: 'C1' };
  const HPLAN = [
    { yer: HSABAH, zarf: 'yok', not: 'Depo sabah düzeninde' },
    { yer: HSABAH, zarf: 'acik-depo', not: 'Depo kendi hatırasını oluşturdu (kopya)' },
    { yer: HSABAH, zarf: 'kapali-defter', not: 'Hatıra mühürlendi, deftere verildi' },
    { yer: HPLAN_DEGISIK, zarf: 'kapali-defter', not: 'Gece planı rafları değiştirdi…' },
    { yer: HPLAN_DEGISIK, zarf: 'kapali-defter', hata: true, not: '…ve yarıda kaldı: C2 dolu!' },
    { yer: HPLAN_DEGISIK, zarf: 'kapali-depo', not: 'Defter zarfı açmadan depoya geri verdi' },
    { yer: HSABAH, zarf: 'acik-depo', not: 'Depo zarfı açtı, hatırasına döndü' },
    { yer: HSABAH, zarf: 'yok', not: 'Defter içini hiç görmedi: kapsülleme bozulmadı' },
  ];
  const HCELL = (raf) => {
    const r = 'ABC'.indexOf(raf[0]);
    const c = Number(raf.slice(1)) - 1;
    return { x: 34 + c * 50, y: 90 + r * 40 };
  };

  MN.scenes.intro = function (root, ctx) {
    const el = h('div', { class: 'scene scene-intro' });
    el.innerHTML = `
      <div class="intro-grid">
        <section class="intro-main">
          <div class="chips">
            <span class="chip chip-cat is-behav">Davranışsal · Behavioral</span>
            <span class="chip">GoF · 1994</span>
            <span class="chip">Anahtar kelime: kapsülleme bozulmadan geri dönmek</span>
          </div>
          <h1 class="intro-title">Memento</h1>
          <div class="intro-sub">Hatıra <span>· “durumun fotoğrafını nesnenin kendisi çeker; saklayan içine bakamaz”</span></div>
          <blockquote class="intent">
            <div class="intent-label">Amaç</div>
            <p><b>Kapsüllemeyi bozmadan</b> bir nesnenin iç durumunu yakala ve dışarıda sakla; böylece nesne daha sonra <b>o duruma geri döndürülebilsin</b>.</p>
            <footer>— Gamma, Helm, Johnson, Vlissides (GoF), <i>Design Patterns</i>, 1994</footer>
          </blockquote>
        </section>
        <section class="intro-hero" aria-label="Kalıbın kısa animasyonu">${heroSvg()}</section>
      </div>
      <div class="intro-cards">
        <article class="card">
          <h3><span class="card-ic">✉️</span> Günlük hayattan</h3>
          <p>Notere mühürlü bir zarf bırakırsınız. Noter zarfı <b>saklar</b> ama <b>açmaz</b>; içinde ne olduğunu bilmesi de
          gerekmez. Gün gelince zarfı size geri verir, onu yalnızca siz açarsınız. Saklayan ile içini bilen ayrı kişilerdir.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🧩</span> Fikir</h3>
          <p>Depo kendi durumunun kopyasını <b>kendisi</b> çıkarsın: <code>hatiraOlustur()</code> bir <code>Depo.Hatira</code>
          döndürür. Hatıranın alanları <b>private</b>: yalnızca Depo açabilir.</p>
          <p>Yedek defteri hatırayı saklar ve istenince geri verir: <code>depo.hatirayaDon(h)</code>. Depo’nun içi hiç dışarı açılmaz.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🎯</span> Bu derste</h3>
          <ol class="objectives">
            <li>Yedeği <b>dışarıdan</b> almanın bedelini görmek (referans tuzağı, unutulan alan)</li>
            <li>Hatırayı kaynak nesnenin kendisine oluşturtmak: dar ve geniş arayüz</li>
            <li>Rolleri tanımak: ${['originator', 'memento', 'caretaker', 'client'].map((r) => ui.roleChip(r)).join(' ')}</li>
            <li>Kayıt noktaları, geri al / yinele, hatıraların bellek bedeli</li>
            <li>Memento’yu Command’ın geri almasından ve Prototype’tan ayırmak</li>
          </ol>
        </article>
      </div>
      <div class="intro-cta">
        <button class="btn btn-primary btn-lg" type="button" data-go>Sorunla başlayalım →</button>
        <a class="btn btn-ghost" href="#/mediator">← Önceki kalıp: Mediator</a>
        <span class="hint">ya da klavyede <kbd>→</kbd> tuşuna basın</span>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-go]').addEventListener('click', () => ctx.goScene('sorun'));

    const svg = el.querySelector('.hero-svg');
    const k = {};
    DP.$$('[data-k]', svg).forEach((n) => (k[n.getAttribute('data-k')] = n));
    const koli = {};
    DP.$$('[data-koli]', svg).forEach((n) => (koli[n.getAttribute('data-koli')] = n));
    let t = 0;
    const tick = () => {
      const p = HPLAN[t % HPLAN.length];
      Object.keys(p.yer).forEach((id) => {
        const c = HCELL(p.yer[id]);
        koli[id].style.transform = `translate(${c.x}px, ${c.y}px)`;
      });
      k.c2.classList.toggle('is-hata', !!p.hata);
      const [hal, yer] = p.zarf.split('-');
      k.zarf.setAttribute('class', 'hm-zarf' + (p.zarf === 'yok' ? '' : ' is-on is-' + hal + ' is-' + yer));
      k.not.textContent = p.not;
      DP.flash(k.not, 'is-pop');
      t++;
    };
    tick();
    const timer = setInterval(tick, 1500);
    return { destroy: () => clearInterval(timer) };
  };

  function heroSvg() {
    const raflar = MN.RAFLAR.map((raf) => {
      const p = HCELL(raf);
      return `<g class="hm-raf"${raf === 'C2' ? ' data-k="c2"' : ''}><rect x="${p.x}" y="${p.y}" width="46" height="36" rx="5"/><text x="${p.x + 4}" y="${p.y + 10}">${raf}</text></g>`;
    }).join('');
    const kutu = (id) => `<g class="hm-koli" data-koli="${id}"><rect x="7" y="12" width="32" height="20" rx="4"/><text x="23" y="26" text-anchor="middle">${String(id).slice(2)}</text></g>`;
    const icerik = Object.keys(HSABAH)
      .map((id) => {
        const r = 'ABC'.indexOf(HSABAH[id][0]);
        const c = Number(HSABAH[id].slice(1)) - 1;
        return `<rect class="hm-zarf-hucre" x="${11 + c * 23}" y="${12 + r * 15}" width="19" height="11" rx="2"/>`;
      })
      .join('');
    return `
    <svg class="hero-svg mnt-hero" viewBox="0 0 560 360" role="img" aria-label="Depo kendi durumunun hatırasını oluşturup deftere verir; hata olunca defter hatırayı geri verir ve depo ona döner">
      <text class="h-caption" x="280" y="28" text-anchor="middle">Durumun fotoğrafını nesnenin kendisi çeker; saklayan içine bakamaz</text>
      <g class="hm-depo"><rect x="20" y="52" width="238" height="190" rx="12"/><text class="hm-t" x="34" y="74">depo : Depo</text></g>
      ${raflar}
      ${[1001, 1002, 1003, 1004, 1005, 1006].map(kutu).join('')}
      <g class="hm-defter"><rect x="372" y="52" width="168" height="190" rx="12"/><text class="hm-t" x="386" y="74">defter</text><text class="hm-s" x="386" y="92">saklar, açmaz</text></g>
      <g data-k="zarf" class="hm-zarf">
        <rect class="hm-zarf-govde" x="0" y="0" width="110" height="78" rx="7"/>
        <g class="hm-zarf-ic">${icerik}</g>
        <path class="hm-zarf-kapak" d="M2 3 L55 44 L108 3"/>
        <circle class="hm-zarf-muhur" cx="55" cy="44" r="10"/>
        <text class="hm-zarf-t" x="55" y="72" text-anchor="middle">Depo.Hatira</text>
      </g>
      <text class="hc-not" data-k="not" x="280" y="292" text-anchor="middle"></text>
      <text class="h-sub hm-code" x="280" y="336" text-anchor="middle">Depo.Hatira h = depo.hatiraOlustur();   …   depo.hatirayaDon(h);</text>
    </svg>`;
  }

  // ================================================================== 2. SORUN
  MN.scenes.problem = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-46' });
    const left = kit.panel('Kalıpsız kod · <span class="ver"></span>', { cls: 'panel-code mnt-left' });
    const right = kit.panel('Depo <span class="panel-sub">· yedeği depo değil defter alıyor</span>', { cls: 'panel-side mnt-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'mnt-cv' });
    const consoleEl = h('div', { class: 'console mnt-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: MN.roleOf, special: MN.special });

    const viewHost = h('div', { class: 'mnt-view' });
    const extra = h('div', { class: 'mnt-extra' });
    right.body.append(viewHost, extra);
    const stage = new MN.DepoSahne(viewHost);

    const files = (v) => MN.fileList(MN.naiveFiles(v));
    const asMap = (v) => {
      const F = MN.naiveFiles(v);
      const m = {};
      Object.keys(F).forEach((n) => (m[n + '.java'] = F[n]));
      return m;
    };
    const R = { v1: MN.run(MN.NV.v1), v11: MN.run(MN.NV.v11), v2: MN.run(MN.NV.v2) };
    const notOf = (v) => (l) => (l.k === 'durum' ? { v1: 'plan yarıda kaldı: 1001 B3’te, 1004 C2’de', v11: 'sabah düzeni', v2: '1001 ve 1005 iki yerde!' }[v] : null);
    const satirlar = (v, n) => R[v].lines.slice(0, n == null ? R[v].lines.length : n).map((l) => MN.consoleLine(l, { note: notOf(v), bad: (x) => x.k === 'durum' && v !== 'v11' }));
    const anOf = (v, e) => R[v].olaylar.find((o) => o.e === e);
    const STEPS = [
      {
        t: 'Sürüm 1.0: yedek = depo.getRaflar()',
        x: 'Gece planı “ya hep ya hiç” uygulanmalı: hata olursa depo plandan önceki hâline dönmeli. Yedeği [[YedekDefteri]] alıyor; bunun için [[Depo]] iç haritasını `getRaflar()` ile dışarı açtı. Plan üçüncü işte **C2 dolu** hatası verdi. Deftere bakın: yedek de **değişmiş**!',
        v: 'v1', n: () => anOf('v1', 'yakala').n, mark: ['YedekDefteri.java', 'yedekler.put(ad, depo.getRaflar());', 'bad'],
        st: () => {
          const o = anOf('v1', 'yakala');
          return MN.stateFrom(MN.NV.v1, o.s, { hataRaf: 'C2', hl: { 'KRG-1001': 'move', 'KRG-1004': 'move' }, defterHl: '02:00', alanHl: { raflar: true }, banner: { text: 'Plan yarıda kaldı (C2 dolu). Yedek: **Map #1**, yani deponun **kendi** haritası!', tone: 'bad' } });
        },
      },
      {
        t: 'Geri yükleme hiçbir şey yapmadı',
        x: '`depo.setRaflar(yedek)` çağrıldı ve “geri yüklendi” yazdı. Ama yedek, deponun haritasına verilmiş **ikinci bir addı**: `yedek = depo.getRaflar()` yeni bir nesne yaratmaz. Raflar planın yarısında kaldı (kesikli kutular: olması gereken yer).',
        v: 'v1', mark: ['YedekDefteri.java', 'depo.setRaflar(yedekler.get(ad));', 'bad'], animateOut: true,
        st: () => MN.sonDurum(MN.NV.v1, { run: R.v1, banner: { text: 'Geri yüklendi… ama raflar değişmedi: **referans ≠ kopya**.', tone: 'bad' } }),
      },
      {
        t: 'Sürüm 1.1: kopya',
        x: 'Hata raporu sonrası düzeltme: `new TreeMap<>(depo.getRaflar())` ile **kopya** saklanıyor (Map #3, ayrı bir nesne). Geri yükleme çalıştı: raflar sabah düzeninde.',
        v: 'v11', diff: 'v1', mark: ['YedekDefteri.java', 'yedekler.put(ad, new TreeMap<>(depo.getRaflar()));', 'focus'], animateOut: true,
        st: () => MN.sonDurum(MN.NV.v11, { run: R.v11, banner: { text: 'Kopya alınca geri dönüş çalıştı: yedek **ayrı bir nesne** (Map #3).', tone: 'ok' } }),
      },
      {
        t: 'Sürüm 2.0: depoya kamyon eklendi',
        x: 'Başka bir geliştirici [[Depo]]’ya kamyonu ekledi (`yukle`, `getKamyon`, `setKamyon`); gece planı artık yükleme de yapıyor. [[YedekDefteri]] güncellenmedi: kamyonu **kaydetmiyor**. Geri yüklemeden sonra raflar sabah düzeninde ama kamyon dolu: 1001 ve 1005 **hem rafta hem kamyonda**.',
        v: 'v2', diff: 'v11', mark: ['Depo.java', ['public List<String> getKamyon() {', 'this.kamyon = kamyon;'], 'focus'], animateOut: true,
        st: () => MN.sonDurum(MN.NV.v2, { run: R.v2, banner: { text: 'Raflar döndü, kamyon dönmedi: **1001 ve 1005 iki yerde**.', tone: 'bad' } }),
      },
      {
        t: 'Teşhis — Yedeği alan, deponun içini bilmek zorunda',
        x: 'Yedek dışarıdan alınıyor: defter deponun **hangi alanları** olduğunu ve onların **nasıl kopyalanacağını** bilmek zorunda. Depo bunun için içini get/set ile herkese açtı. Depoya yeni bir alan gelince defterin de değişmesi gerekiyordu; unutuldu. Ya depo kendi fotoğrafını kendisi çekip mühürlü bir zarfla verse?',
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
        left.head.querySelector('.ver').textContent = { v1: 'sürüm 1.0 (referans)', v11: 'sürüm 1.1 (kopya)', v2: 'sürüm 2.0 (+ kamyon)' }[s.v];
        // önce konsol: yüksekliği değişince işaretli satır kod panelinin dışında kalmasın
        MN.renderConsole(consoleEl, MN.cmd(true), satirlar(s.v, s.n ? s.n() : null), { animateFrom: info.animate && s.animateOut ? 0 : null, cursor: !!s.n });
        cv.setFiles(files(s.v), { active: s.mark ? s.mark[0] : 'YedekDefteri.java', prev: s.diff ? asMap(s.diff) : null, keepActive: false });
        if (s.mark) cv.mark(s.mark[0], s.mark[1], s.mark[2]);
        if (i === 3) cv.mark('YedekDefteri.java', 'yedekler.put(ad, new TreeMap<>(depo.getRaflar()));', 'bad', { show: false, scroll: false });
        if (s.diag) {
          cv.mark('YedekDefteri.java', ['public void kaydet(String ad) {', 'depo.setRaflar(yedekler.get(ad));'], 'focus');
          cv.mark('YedekDefteri.java', 'yedekler.put(ad, new TreeMap<>(depo.getRaflar()));', 'bad', { scroll: false });
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
          <div class="mnt-evidence">
            <span class="mnt-ev-k">1.0</span><b class="is-bad">geri dönüş etkisiz</b>
            <span class="mnt-ev-k">1.1</span><b class="is-ok">kopya: çalıştı</b>
            <span class="mnt-ev-k">2.0</span><b class="is-bad">2 koli iki yerde</b>
            <span class="mnt-ev-k">açık get/set</span><b>${MN.acikSayisi(MN.code.DepoV2)}</b>
            <span class="mnt-ev-why">${md('Yedeği alan sınıf, yedeklenen sınıfın içini bilmek zorunda kaldı: alanlarını, tiplerini, nasıl kopyalanacaklarını. Her yeni alan iki dosyayı birden değiştirmek demek.')}</span>
          </div>
          <div class="req-card is-diagnosis">
            <div class="diag-title">Teşhis</div>
            <ul class="problems">
              <li>${md('**Kapsülleme bozuldu:** `getRaflar()`/`setRaflar()` yalnızca yedek için yazıldı ama artık **herkes** deponun haritasını okuyup değiştirebilir; bir koli iki rafa bile konabilir.')}</li>
              <li>${md('**Referans ≠ kopya:** `yedek = depo.getRaflar()` yeni bir nesne yaratmaz; aynı haritaya ikinci bir ad verir. Neyin, ne kadar derin kopyalanacağını en iyi nesnenin kendisi bilir.')}</li>
              <li>${md('**Yeni alan, unutulan yedek:** depoya kamyon eklenince defterin de değişmesi gerekiyordu. Derleyici bunu hatırlatamaz; hata ancak gece 02:00’de, geri dönüşte ortaya çıktı.')}</li>
            </ul>
          </div>
          <div class="sg-aside">${md('💬 **Mühürlü zarf gibi:** noter, bıraktığınız zarfı saklar ama açmaz. Ya depo da durumunun fotoğrafını **kendisi** çekip mühürlese, defter yalnızca zarfı saklasa?')}</div>`;
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
  MN.scenes.solution = function (root, ctx) {
    const R = MN.refactor;
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-diag' });
    const left = kit.panel('Yeniden düzenleme (refactoring)', { cls: 'panel-code mnt-left' });
    const right = kit.panel('Sınıf diyagramı', { cls: 'panel-side panel-diagram' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'mnt-cv' });
    const consoleEl = h('div', { class: 'console mnt-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: MN.roleOf, special: MN.special });
    const diagHost = h('div', { class: 'diag-host' });
    const recipe = h('ol', { class: 'recipe' });
    const legend = kit.umlLegend({ association: true, aggregation: 'saklar', fmLabel: 'hatıra yöntemi' });
    right.body.append(h('div', { class: 'recipe-wrap' }, h('div', { class: 'recipe-title' }, 'Dönüşüm tarifi'), recipe), diagHost, legend);
    ['Depo.Hatira: içte, alanları özel', 'Defter hatıra saklar', 'Depo’nun içi kapanır'].forEach((t, i) => recipe.appendChild(h('li', { 'data-i': String(i + 1) }, t)));
    const diagram = new DP.ClassDiagram(diagHost, MN.solutionDiagram(0), { roles: MN.roles, roleTags: false });

    const outAt = (i) =>
      MN.run(MN.refactorProgs[i]).lines.map((l) =>
        MN.consoleLine(l, { bad: (x) => x.k === 'durum' && i < 2, note: (x) => (x.k === 'durum' ? (i < 2 ? '1001 ve 1005 iki yerde!' : 'kamyon da döndü') : null), hl: (x) => i === 2 && x.k === 'durum' })
      );
    const STEPS = [
      { t: 'Başlangıç — yedek dışarıdan alınıyor', x: 'Defter deponun içini get/set ile okuyup yazıyor ve kamyonu unutuyor: geri yüklemeden sonra 1001 ve 1005 iki yerde. Üç adımda yedeği **depoya** aldıracağız; Main değişmeyecek.', focus: 'YedekDefteri.java', mark: 'yedekler.put(ad, new TreeMap<>(depo.getRaflar()));', kind: 'bad' },
      { t: 'Adım 1 — `Depo.Hatira`', x: '[[Depo]]’nun içine bir iç sınıf: [[Hatira]]. Alanları ve kurucusu **private**: onu yalnızca Depo oluşturup içini okuyabilir. `hatiraOlustur()` raflar **ve** kamyonun kopyasını alır; `hatirayaDon(h)` onları geri koyar. Defter henüz eski yolda: konsol değişmedi.', focus: 'Depo.java', marks: ['public Hatira hatiraOlustur() {', 'public static final class Hatira {'] },
      { t: 'Adım 2 — Defter hatıra saklar', x: '[[YedekDefteri]] artık deponun içini **bilmiyor**: `Map<String, Depo.Hatira>`. Kaydederken `depo.hatiraOlustur()`, geri yüklerken `depo.hatirayaDon(…)`. Konsola bakın: kamyon da döndü, **hiçbir koli iki yerde değil**.', focus: 'YedekDefteri.java', marks: ['yedekler.put(ad, depo.hatiraOlustur());', 'depo.hatirayaDon(yedekler.get(ad));'] },
      { t: 'Adım 3 — Depo’nun içi kapanır', x: 'Artık kimsenin get/set’e ihtiyacı yok: dört yöntem **silindi**, alanlar `final` oldu. Deponun haritasını dışarıdan kimse değiştiremez. Yeni bir alan gelirse yalnızca Depo ve Hatira değişir; defter **hiç** değişmez.', focus: 'Depo.java', marks: ['private final Map<String, String> raflar = new TreeMap<>();', 'private final List<String> kamyon = new ArrayList<>();'] },
      { t: 'Sonuç — Ne kazandık?', x: 'Durumun fotoğrafını, içini en iyi bilen nesne **kendisi** çekiyor (geniş arayüz); defter yalnızca saklıyor (dar arayüz). Kapsülleme korunuyor, referans tuzağı ve unutulan alan hatası ortadan kalkıyor. Bedeli: her hatıra durumun bir kopyası.', focus: 'Depo.java', marks: ['raflar.putAll(h.raflar);', 'this.kamyon = new ArrayList<>(kamyon);'] },
    ];

    const filesAt = (i) => MN.refactorOrder.filter((k) => R[i][k]).map((k) => ({ name: k + '.java', code: R[i][k] }));
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
        MN.renderConsole(consoleEl, MN.cmd(true), outAt(ri), { animateFrom: info.animate && i === 2 ? 0 : null });
        const showDiff = i >= 1 && i <= R.length - 1;
        cv.setFiles(filesAt(ri), { active: s.focus, prev: showDiff ? asMap(ri - 1) : null, keepActive: false });
        if (s.mark) cv.mark(s.focus, s.mark, s.kind || 'focus');
        (s.marks || []).forEach((m, k) => cv.mark(s.focus, m, 'focus', { scroll: k === 0 }));

        diagram.update(MN.solutionDiagram(Math.min(i, 4)), { animate: info.animate });
        diagram.clearBadges();
        diagram.clearFocus();
        if (i === 0) {
          diagram.badge('Depo', '4 × get/set', 'bad');
          diagram.badge('YedekDefteri', 'içi biliyor', 'bad');
          diagram.focus({ classes: ['Depo', 'YedekDefteri'], edges: ['depo'], members: [['Depo', 'getset']] });
        }
        if (i === 1) {
          diagram.badge('Hatira', 'YENİ', 'new');
          diagram.focus({ classes: ['Depo', 'Hatira'], edges: ['icinde'], members: [['Depo', 'hatiraOlustur'], ['Depo', 'hatirayaDon']] });
        }
        if (i === 2) {
          diagram.badge('YedekDefteri', 'sadeleşti', 'new');
          diagram.focus({ classes: ['YedekDefteri', 'Hatira'], edges: ['yedekler'], members: [['YedekDefteri', 'yedekler']] });
        }
        if (i === 3) {
          diagram.badge('Depo', 'içi kapandı', 'new');
          diagram.focus({ classes: ['Depo'] });
        }
        if (i === 4) diagram.focus({ classes: ['Depo', 'Hatira', 'YedekDefteri'], edges: ['icinde', 'yedekler', 'depo'] });
        DP.$$('li', recipe).forEach((li, k) => {
          li.classList.toggle('is-done', k + 1 < i || (i === 4 && k < 3));
          li.classList.toggle('is-current', k + 1 === i);
        });
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };
})();
