/*
 * Facade — sahneler (1/3): Giriş, Sorun, Çözüm
 */
(function () {
  'use strict';
  const FC = DP.fc;
  const { h } = DP;
  const kit = DP.kit;
  const md = (t) => DP.md(t, FC.roleOf);
  FC.md = md;
  FC.scenes = FC.scenes || {};
  const ui = (FC.ui = {
    foot: (root) => kit.foot(root, FC.roleOf),
    roleChip: (key) => kit.roleChip(FC.roles, key),
  });

  /** Konsol: satırlar {t, err, ok, bad, dim, cmd, sum, note}. */
  FC.renderConsole = function (el, cmd, lines, o) {
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
      if (l.ist) cls.push('is-ist');
      if (l.sum) cls.push('is-strong');
      if (o.animateFrom != null && i >= o.animateFrom) cls.push('is-new');
      const row = h('div', { class: cls.join(' ') }, l.t);
      if (l.note) row.appendChild(h('span', { class: 'console-note' }, '  ← ' + l.note));
      el.appendChild(row);
    });
    if (o.cursor) el.appendChild(h('div', { class: 'console-cursor' }));
    el.scrollTop = el.scrollHeight;
  };

  /** Çıktı satırı → konsol satırı (hayalet gönderinin satırları kırmızı) */
  FC.consoleLine = (l, o) => {
    o = o || {};
    if (l.k === 'sum') return { t: l.t, sum: true, note: o.sumNote || null };
    if (l.hayalet) return { t: l.t, bad: true, note: l.k === 'takip' ? o.hayaletNote || 'ödeme reddedildi ama devam!' : null };
    if (l.k === 'red') return { t: l.t, bad: !!o.redBad, note: o.redNote || null };
    if (l.k === 'yok') return { t: l.t, ok: true, note: o.yokNote || null };
    if (l.k === 'ist' || l.k === 'fis') return { t: l.t, ist: true };
    return { t: l.t };
  };
  FC.cmd = (javac) => `$ ${javac ? 'javac *.java && ' : ''}java Main`;

  /** Ofislerin durumu: bir talebin izinden (atlanan adımlar soluk) */
  FC.officesOf = function (z, f) {
    const O = {};
    if (!z) return O;
    const dur = z.adim.some((a) => a.dur);
    FC.altOrder(f).forEach((k) => {
      const a = z.adim.find((x) => x.k === k);
      if (a) O[k] = { text: a.t, state: a.bad ? 'bad' : a.hayalet ? 'hayalet' : 'ok' };
      else if (dur) O[k] = { text: 'çalışmadı', state: 'skip' };
    });
    return O;
  };

  /** Bir programın son hâli → sahne durumu (Sorun, Tezgâh, Genişlet) */
  FC.stateOf = function (prog, o) {
    o = o || {};
    const r = o.run || FC.run(prog);
    const f = prog.f || {};
    const cepheMi = (ist) => prog.design === 'cephe' || (prog.cepheli || []).includes(ist);
    const clients = prog.istemciler.map((ist) => {
      const zs = r.iz.filter((z) => z.ist === ist);
      const z = zs[zs.length - 1];
      const kotu = zs.find((x) => x.sonuc === 'hayalet');
      const goster = kotu || z;
      return {
        ist,
        musteri: goster ? goster.t.musteri : '',
        cepheli: cepheMi(ist),
        forgot: (prog.forgot || []).includes(ist),
        fis: goster ? { kind: goster.sonuc === 'red' ? 'yok' : goster.sonuc === 'hayalet' ? 'hayalet' : 'ok', no: goster.no } : null,
      };
    });
    // ofisler: hayalet gönderi varsa onun izi, yoksa günün son talebi
    const zGoster = r.iz.find((z) => z.sonuc === 'hayalet') || r.iz[r.iz.length - 1];
    const olc = FC.olc(prog);
    const st = {
      mode: prog.design,
      f,
      clients,
      offices: FC.officesOf(zGoster, f),
      sayac: { bag: olc.bag, cephe: olc.cepheBag },
      banner: o.banner || null,
    };
    const cepheVar = prog.design === 'cephe' || (prog.cepheli || []).length || prog.cepheHazir;
    if (cepheVar) {
      const zc = r.iz.filter((z) => z.cepheli);
      const zz = zc[zc.length - 1];
      st.desk = zz ? { adim: deskAdim(zz, f), ret: { kind: zz.sonuc === 'red' ? 'yok' : 'ok', text: zz.sonuc === 'red' ? 'Optional.empty' : `Optional[${zz.no}]` } } : {};
    }
    return st;
  };
  /** Cephe masasındaki adımların işaretleri */
  function deskAdim(z, f) {
    const A = {};
    const dur = z.adim.some((a) => a.dur);
    FC.altOrder(f).forEach((k) => {
      const a = z.adim.find((x) => x.k === k);
      A[k] = a ? (a.bad ? 'bad' : 'ok') : dur ? 'skip' : '';
    });
    if (f.limit) A.limit = dur ? 'bad' : 'ok';
    return A;
  }
  FC.deskAdim = deskAdim;

  // ================================================================== 1. GİRİŞ
  /** Giriş animasyonu: üç istemci, yedi alt sistem — kalıpsız 21 kablo, cepheyle 3 + 7 */
  const HC = [
    ['kasa', 104],
    ['web', 180],
    ['mobil', 256],
  ];
  const HA = ['adres', 'tarife', 'odeme', 'takip', 'etiket', 'kurye', 'sms'];
  const HAY = (i) => 64 + i * 38;

  FC.scenes.intro = function (root, ctx) {
    const el = h('div', { class: 'scene scene-intro' });
    el.innerHTML = `
      <div class="intro-grid">
        <section class="intro-main">
          <div class="chips">
            <span class="chip chip-cat is-struct">Yapısal · Structural</span>
            <span class="chip">GoF · 1994</span>
            <span class="chip">Anahtar kelime: sadeleştirme</span>
          </div>
          <h1 class="intro-title">Facade</h1>
          <div class="intro-sub">Cephe <span>· “karmaşık bir alt sisteme tek, sade bir kapı”</span></div>
          <blockquote class="intent">
            <div class="intent-label">Amaç</div>
            <p>Bir alt sistemdeki arayüzler kümesine <b>birleşik bir arayüz</b> sağla. Cephe, alt sistemi kullanmayı kolaylaştıran <b>üst düzey</b> bir arayüz tanımlar.</p>
            <footer>— Gamma, Helm, Johnson, Vlissides (GoF), <i>Design Patterns</i>, 1994</footer>
          </blockquote>
        </section>
        <section class="intro-hero" aria-label="Kalıbın kısa animasyonu">${heroSvg()}</section>
      </div>
      <div class="intro-cards">
        <article class="card">
          <h3><span class="card-ic">🏛️</span> Günlük hayattan</h3>
          <p>e-Devlet ya da gümrükteki <b>tek pencere</b>: nüfus, tapu, vergi, sigorta… Her kurumun kendi kuralı ve sırası
          var, siz tek kapıdan başvurursunuz. Kurumlar pencereden <b>habersiz</b> çalışmaya devam eder; isterseniz yine
          doğrudan gidebilirsiniz.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🧩</span> Fikir</h3>
          <p>Alt sistemin önüne, istemcinin asıl istediği işi <b>tek bir çağrıyla</b> yapan bir sınıf koy:
          <code>cephe.gonder(talep)</code>. İş akışı, doğru sıra ve kurallar cephede durur. Alt sistem sınıfları değişmez ve
          cepheden habersizdir.</p>
          <p>Cephe bir <b>duvar</b> değildir: gerekirse alt sisteme doğrudan erişim serbesttir.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🎯</span> Bu derste</h3>
          <ol class="objectives">
            <li>İş akışının istemcilere dağılmasının bedelini görmek (hayalet gönderi)</li>
            <li>Alt sistemin önüne sade, üst düzey bir kapı koymak</li>
            <li>Rolleri tanımak: ${['facade', 'subsystem', 'client'].map((r) => ui.roleChip(r)).join(' ')}</li>
            <li>Bağımlılıkları <b>N × M</b>’den <b>N + M</b>’ye indirmek</li>
            <li>Facade’ı Adapter, Mediator ve Proxy’den ayırmak</li>
          </ol>
        </article>
      </div>
      <div class="intro-cta">
        <button class="btn btn-primary btn-lg" type="button" data-go>Sorunla başlayalım →</button>
        <a class="btn btn-ghost" href="#/decorator">← Önceki kalıp: Decorator</a>
        <span class="hint">ya da klavyede <kbd>→</kbd> tuşuna basın</span>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-go]').addEventListener('click', () => ctx.goScene('sorun'));

    // iki evre: kalıpsız (her istemci her alt sisteme) ↔ cephe (istemciler cepheye, cephe alt sistemlere)
    const svg = el.querySelector('.hero-svg');
    const k = {};
    DP.$$('[data-k]', svg).forEach((n) => (k[n.getAttribute('data-k')] = n));
    const line = (x1, y1, x2, y2, cls) => `<path class="fh-w ${cls}" d="M${x1} ${y1} C${x1 + (x2 - x1) * 0.45} ${y1}, ${x2 - (x2 - x1) * 0.45} ${y2}, ${x2} ${y2}"/>`;
    const spaghetti = HC.map(([c, y]) => HA.map((a, i) => line(118, y, 444, HAY(i), 'fc-c-' + c)).join('')).join('');
    const star = HC.map(([c, y]) => line(118, y, 238, 180, 'is-cephe')).join('') + HA.map((a, i) => line(318, 180, 444, HAY(i), 'is-fan')).join('');
    let t = 0;
    const tick = () => {
      const evre = Math.floor(t / 9) % 2; // 0: kalıpsız, 1: cephe
      const adim = t % 9;
      if (adim === 0) {
        k.wires.innerHTML = evre ? star : spaghetti;
        k.cephe.classList.toggle('is-on', !!evre);
        k.n.textContent = evre ? '3 + 7' : '21';
        k.mode.textContent = evre ? 'Cephe ile' : 'Kalıpsız';
        svg.classList.toggle('is-cephe', !!evre);
        DP.flash(k.n, 'is-pop');
      }
      // cephe evresinde istek alt sistemleri sırayla dolaşır
      DP.$$('.fh-alt', svg).forEach((g, i) => g.classList.toggle('is-on', !!evre && adim >= 1 && i === adim - 1));
      t++;
    };
    tick();
    const timer = setInterval(tick, 650);
    return { destroy: () => clearInterval(timer) };
  };

  function heroSvg() {
    const clients = HC.map(([c, y]) => `<g class="fh-cl fc-c-${c}"><circle cx="96" cy="${y}" r="22"/>${FC.icon(c, 84, y - 12, 1)}</g>`).join('');
    const alts = HA.map((a, i) => `<g class="fh-alt"><rect x="444" y="${HAY(i) - 15}" width="104" height="30" rx="8"/>${FC.icon(a, 450, HAY(i) - 9, 0.75)}<text x="472" y="${HAY(i) + 5}">${FC.ALT[a].name}</text></g>`).join('');
    return `
    <svg class="hero-svg fc-hero" viewBox="0 0 560 360" role="img" aria-label="Üç istemci yedi alt sisteme önce doğrudan, sonra tek bir cephe üzerinden bağlanıyor">
      <text class="h-caption" x="280" y="28" text-anchor="middle">Üç istemci, yedi alt sistem</text>
      <g data-k="wires"></g>
      ${clients}${alts}
      <g class="fh-cephe" data-k="cephe"><rect x="238" y="146" width="80" height="68" rx="14"/>${FC.icon('cephe', 260, 154, 1.5)}<text x="278" y="206" text-anchor="middle">cephe</text></g>
      <g class="fh-count"><text class="fh-mode" data-k="mode" x="280" y="300" text-anchor="middle">Kalıpsız</text><text x="280" y="324" text-anchor="middle">bağımlılık: <tspan class="fh-n" data-k="n">21</tspan></text></g>
      <text class="h-sub fh-code" x="280" y="350" text-anchor="middle">Optional&lt;String&gt; no = cephe.gonder(talep);   // tek kapı</text>
    </svg>`;
  }

  // ================================================================== 2. SORUN
  FC.scenes.problem = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-46' });
    const left = kit.panel('Kalıpsız kod · <span class="ver"></span>', { cls: 'panel-code fc-left' });
    const right = kit.panel('Gönderi merkezi <span class="panel-sub">· iş akışını kim biliyor?</span>', { cls: 'panel-side fc-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'fc-cv' });
    const consoleEl = h('div', { class: 'console fc-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: FC.roleOf, special: FC.special });

    const viewHost = h('div', { class: 'fc-view' });
    const extra = h('div', { class: 'fc-extra' });
    right.body.append(viewHost, extra);
    const stage = new FC.Merkez(viewHost);

    const order = ['Main', 'SubeKasasi', 'WebSitesi', 'OdemeServisi', 'Talep', 'AdresServisi', 'TarifeServisi', 'TakipNoServisi', 'EtiketServisi', 'KuryeServisi', 'BildirimServisi'];
    const files = (v) => FC.fileList(FC.naiveFiles(v), order);
    const asMap = (v) => {
      const F = FC.naiveFiles(v);
      const m = {};
      Object.keys(F).forEach((n) => (m[n + '.java'] = F[n]));
      return m;
    };
    const out = (v) => FC.run(FC.NV[v]).lines.map((l) => FC.consoleLine(l));
    const AKIS = ['String tamAdres = adres.dogrula(t.adres(), t.il());', 'sms.gonder(t.musteri(), no + " gönderiniz alındı");'];
    const S3 = FC.run(FC.NV.v3).stats;
    const STEPS = [
      {
        t: 'Şube kasası: yedi alt sistem',
        x: 'Bir gönderi oluşturmak yedi alt sistemi **doğru sırayla** çalıştırmayı gerektiriyor: adres, tarife, ödeme, takip numarası, etiket, kurye, SMS. [[SubeKasasi]] hepsini kendisi tanıyor; kurucusu **yedi parametre** alıyor.',
        v: 'v1', mark: ['SubeKasasi.java', AKIS, 'focus'],
        banner: { text: 'Kasa yedi alt sistemi **kendisi** çalıştırıyor: 7 bağımlılık.' },
      },
      {
        t: 'Web sitesi: kopyala-yapıştır',
        x: '[[WebSitesi]] geldi; geliştirici iş akışını kasadan **kopyaladı**. Artık iki sınıf yedi alt sistemi ve doğru sırayı biliyor: 14 bağımlılık, iki kopya iş akışı. Ayşe ve Can’ın gönderileri web’den.',
        v: 'v2', diff: 'v1', mark: ['WebSitesi.java', AKIS, 'focus'], animateOut: true,
        banner: { text: 'İki istemci, **iki kopya** iş akışı: 14 bağımlılık.' },
      },
      {
        t: 'Yeni kural: kart limiti',
        x: 'Ödeme ekibi [[OdemeServisi]]’ni değiştirdi: limit aşılırsa ödeme **reddediliyor** (`cek` artık `boolean`). Kasa kontrolü ekledi, web sitesinde **unutuldu**: Can’ın ödemesi reddedildi ama takip numarası verildi, etiket basıldı, kurye yola çıktı. Derleyici sustu; dönen değeri yok saymak Java’da serbest.',
        v: 'v3', diff: 'v2', mark: ['WebSitesi.java', 'odeme.cek(t.musteri(), tutar);', 'bad'], animateOut: true,
        banner: { text: `Can’ın ödemesi **reddedildi**, yine de etiket basıldı ve kurye çıktı: **hayalet gönderi** (gün sonu: ${S3.basilan} etiket).`, tone: 'bad' },
      },
      {
        t: 'Teşhis — İş akışı istemcilere dağılmış',
        x: 'Her istemci yedi alt sistemi, doğru sırayı ve kuralları **ayrı ayrı** biliyor. Bir kural değişince bütün istemcileri bulup düzeltmek gerekiyor; biri unutulunca hata sessizce çıkıyor. Ya istemcilerle alt sistem arasına bu işi **tek yerde** yapan bir kapı koysaydık?',
        v: 'v3', diag: true,
      },
    ];

    const foot = ui.foot(el);
    let last = null;
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: () => 7200,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        left.head.querySelector('.ver').textContent = { v1: 'sürüm 1.0 (şube kasası)', v2: 'sürüm 2.0 (+ web sitesi)', v3: 'sürüm 2.1 (kart limiti)' }[s.v];
        // önce konsol: yüksekliği değişince işaretli satır kod panelinin dışında kalmasın
        FC.renderConsole(consoleEl, FC.cmd(true), out(s.v), { animateFrom: info.animate && s.animateOut ? 0 : null });
        cv.setFiles(files(s.v), { active: s.mark ? s.mark[0] : 'WebSitesi.java', prev: s.diff ? asMap(s.diff) : null, keepActive: false });
        if (s.mark) cv.mark(s.mark[0], s.mark[1], s.mark[2]);
        if (i === 2) cv.mark('SubeKasasi.java', 'if (!odeme.cek(t.musteri(), tutar)) {', 'ok', { show: false, scroll: false });
        if (s.diag) {
          cv.mark('WebSitesi.java', ['private final AdresServisi adres;', 'private final BildirimServisi sms;'], 'focus');
          cv.mark('WebSitesi.java', 'odeme.cek(t.musteri(), tutar);', 'bad', { scroll: false });
        }
        right.el.classList.toggle('is-diag', !!s.diag);
        if (!s.diag) {
          const st = FC.stateOf(FC.NV[s.v], { banner: s.banner });
          stage.render(st, last, { animate: info.animate });
          last = st;
          extra.innerHTML = '';
          return;
        }
        extra.innerHTML = `
          <div class="fc-evidence">
            <span class="fc-ev-k">Kasa</span><b class="is-ok">kart limiti kontrol ediliyor</b>
            <span class="fc-ev-k">Web</span><b class="is-bad">KRG-1003 ödenmeden yola çıktı</b>
            <span class="fc-ev-k">Bağımlılık</span><b>2 istemci × 7 alt sistem = 14</b>
            <span class="fc-ev-why">${md('Aynı iş akışı **iki sınıfta iki kez** yazıldı; kural birinde eksik kaldı.')}</span>
          </div>
          <div class="req-card is-diagnosis">
            <div class="diag-title">Teşhis</div>
            <ul class="problems">
              <li>${md('**İş akışı istemcilere dağılmış:** hangi alt sistemin hangi sırayla çağrılacağı, ödeme reddedilince ne olacağı her istemcide yeniden yazılıyor. Mobil uygulama ve kurumsal API de aynısını kopyalayacak.')}</li>
              <li>${md('**Sıkı bağlılık (N × M):** her istemci yedi alt sistemi tanıyor, kurucusu yedi parametre alıyor. Bir alt sistemdeki değişiklik bütün istemcilere dalga gibi yayılıyor.')}</li>
              <li>${md('**Unutulan kural = hayalet gönderi:** web sitesi `cek`’in sonucuna bakmadı; ödenmemiş gönderi için etiket ve kurye.')}</li>
            </ul>
          </div>
          <div class="sg-aside">${md('💬 **Tek pencere gibi:** gümrükteki tek pencere sistemi onlarca kurumun iznini tek başvuruda toplar. Başvuran kurumları tek tek dolaşmaz; kurallar ve sıra **pencerenin arkasında** kalır.')}</div>`;
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
  FC.scenes.solution = function (root, ctx) {
    const R = FC.refactor;
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-diag' });
    const left = kit.panel('Yeniden düzenleme (refactoring)', { cls: 'panel-code fc-left' });
    const right = kit.panel('Sınıf diyagramı', { cls: 'panel-side panel-diagram' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'fc-cv' });
    const consoleEl = h('div', { class: 'console fc-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: FC.roleOf, special: FC.special });
    const diagHost = h('div', { class: 'diag-host' });
    const recipe = h('ol', { class: 'recipe' });
    const legend = kit.umlLegend({ association: true, fmLabel: 'alt sistemi sade bir arayüzle sunan işlem' });
    right.body.append(h('div', { class: 'recipe-wrap' }, h('div', { class: 'recipe-title' }, 'Dönüşüm tarifi'), recipe), diagHost, legend);
    ['Cephe yazılır: iş akışı tek yerde', 'Kasa cepheye devreder', 'Web sitesi cepheye devreder'].forEach((t, i) => recipe.appendChild(h('li', { 'data-i': String(i + 1) }, t)));
    const diagram = new DP.ClassDiagram(diagHost, FC.solutionDiagram(0), { roles: FC.roles, roleTags: false });

    const outAt = (i) => FC.refactorOutputs[i].map((l) => FC.consoleLine(l, { yokNote: i === 3 ? 'akış durdu' : null }));
    const STEPS = [
      { t: 'Başlangıç — iş akışı istemcilerde', x: 'İki istemci, iki kopya iş akışı ve web sitesinde unutulmuş bir kart limiti kuralı. Üç adımda iş akışını istemcilerden alıp alt sistemin önüne **tek bir kapı** koyacağız. Alt sistem sınıflarına dokunmayacağız.', focus: 'WebSitesi.java', mark: 'odeme.cek(t.musteri(), tutar);', kind: 'bad' },
      { t: 'Adım 1 — Cephe: `GonderiCephesi`', x: '[[GonderiCephesi]] yedi alt sistemi alıyor ve `gonder(t)` ile onları **doğru sırayla** çalıştırıyor. Kart limiti kuralı kasadaki doğru sürümden taşındı: reddedilirse akış durur, `Optional.empty()` döner. Henüz kimse onu kullanmıyor.', focus: 'GonderiCephesi.java', marks: ['public Optional<String> gonder(Talep t) {', 'if (!odeme.cek(t.musteri(), tutar)) {'] },
      { t: 'Adım 2 — Kasa cepheye devreder', x: '[[SubeKasasi]]’ndan yedi alan, yedi parametreli kurucu ve iş akışı **silindi**; yerine tek bir alan geldi: `cephe`. [[Main]] cepheyi bir kez kurup kasaya veriyor. Web sitesi hâlâ eski yolda: hayalet gönderi duruyor.', focus: 'SubeKasasi.java', marks: ['private final GonderiCephesi cephe;', 'Optional<String> no = cephe.gonder(t);'] },
      { t: 'Adım 3 — Web sitesi cepheye devreder', x: '[[WebSitesi]] de cepheye geçti. Kart limiti kuralını artık **kimse unutamaz**, çünkü tek bir yerde. Konsola bakın: Can’ın ödemesi reddedilince akış durdu; takip numarası, etiket ve kurye hiç çalışmadı.', focus: 'WebSitesi.java', marks: ['private final GonderiCephesi cephe;', 'Optional<String> no = cephe.gonder(t);'] },
      { t: 'Sonuç — Ne kazandık?', x: 'İki istemci yedi alt sistem yerine **tek bir sınıf** tanıyor: 14 bağımlılık → 2 (+7 cephede). Alt sistem sınıflarının **hiçbiri değişmedi** ve cepheden habersiz. Yeni bir istemci tek satırla başlar: `new MobilUygulama(cephe)`.', focus: 'GonderiCephesi.java', marks: ['return Optional.of(no);'] },
    ];

    const filesAt = (i) => FC.refactorOrder.filter((k) => R[i][k]).map((k) => ({ name: k + '.java', code: R[i][k] }));
    const asMap = (i) => {
      const m = {};
      Object.keys(R[i]).forEach((k) => (m[k + '.java'] = R[i][k]));
      return m;
    };

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t.replace(/`/g, '')),
      delayOf: () => 7000,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        const ri = Math.min(i, R.length - 1);
        // önce konsol, sonra koddaki işaret
        FC.renderConsole(consoleEl, FC.cmd(true), outAt(ri), { animateFrom: info.animate && i === 3 ? 0 : null });
        const showDiff = i >= 1 && i <= R.length - 1;
        cv.setFiles(filesAt(ri), { active: s.focus, prev: showDiff ? asMap(ri - 1) : null, keepActive: false });
        if (s.mark) cv.mark(s.focus, s.mark, s.kind || 'focus');
        (s.marks || []).forEach((m, k) => cv.mark(s.focus, m, 'focus', { scroll: k === 0 }));

        diagram.update(FC.solutionDiagram(Math.min(i, 3)), { animate: info.animate });
        diagram.clearBadges();
        diagram.clearFocus();
        if (i === 0) {
          diagram.badge('WebSitesi', 'limit unutuldu', 'bad');
          diagram.focus({ classes: ['SubeKasasi', 'WebSitesi'] });
        }
        if (i === 1) {
          diagram.badge('GonderiCephesi', 'YENİ', 'new');
          diagram.focus({ classes: ['GonderiCephesi'], members: [['GonderiCephesi', 'gonder']] });
        }
        if (i === 2) {
          diagram.badge('SubeKasasi', 'sadeleşti', 'new');
          diagram.focus({ classes: ['SubeKasasi', 'GonderiCephesi'], edges: ['c-kasa'] });
        }
        if (i === 3) {
          diagram.badge('WebSitesi', 'sadeleşti', 'new');
          diagram.focus({ classes: ['WebSitesi', 'GonderiCephesi'], edges: ['c-web'] });
        }
        if (i === 4) diagram.focus({ classes: ['GonderiCephesi'], edges: ['c-kasa', 'c-web'], members: [['GonderiCephesi', 'gonder']] });
        DP.$$('li', recipe).forEach((li, k) => {
          li.classList.toggle('is-done', k + 1 < i || (i === 4 && k < 3));
          li.classList.toggle('is-current', k + 1 === i);
        });
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };
})();
