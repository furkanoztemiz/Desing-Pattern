/*
 * State — sahneler (1/3): Giriş, Sorun, Çözüm
 */
(function () {
  'use strict';
  const ST = DP.sta;
  const { h } = DP;
  const kit = DP.kit;
  const esc = DP.esc;
  const md = (t) => DP.md(t, ST.roleOf);
  ST.md = md;
  ST.scenes = ST.scenes || {};
  const ui = (ST.ui = {
    foot: (root) => kit.foot(root, ST.roleOf),
    roleChip: (key) => kit.roleChip(ST.roles, key),
  });

  /** Konsol: satırlar {t, k, bad, ok, note, hl}; istek satırları, cevaplar, geçişler ayrı renkte; hatalı satırlar kırmızı. */
  ST.renderConsole = function (el, cmd, lines, o) {
    o = o || {};
    el.innerHTML = '<div class="console-head"><span></span><span></span><span></span> ' + (o.title || 'Konsol') + '</div>';
    if (cmd) el.appendChild(h('div', { class: 'console-line is-cmd' }, cmd));
    lines.forEach((l, i) => {
      const cls = ['console-line', 'stl-' + (l.k || 'x')];
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
  /** Çalıştırma satırı → konsol satırı (kalıpsız sürümün hatalı satırları kırmızı, notlu) */
  ST.consoleLine = (l, o) => {
    o = o || {};
    const note = o.notes ? o.notes(l) : null;
    return { t: l.t, k: l.k, bad: l.k === 'hata', note, hl: o.hl ? o.hl(l) : false };
  };
  ST.cmd = (javac) => `$ ${javac ? 'javac *.java && ' : ''}java Main`;
  /** Kalıpsız sürümün hata satırlarına not */
  ST.hataNotu = (l) => (l.k !== 'hata' ? null : l.t.includes('kondu') ? 'kilitli dolaba paket kondu!' : l.t.includes('4/3') ? 'Ali’nin kodu artık yanlış' : null);

  /** Bir programın i. isteği bittiğindeki an (yoksa son an) → sahne durumu */
  ST.anDurumu = function (prog, r, istek, x) {
    const O = r.olaylar;
    let son = null;
    for (let j = 0; j < O.length; j++) if (O[j].istek === istek) son = O[j];
    const e = son || O[O.length - 1];
    return { e, st: ST.stateFrom(prog, e.s, x) };
  };

  /** Programın son hâli → sahne durumu (Sorun, Çözüm, Tezgâh) */
  ST.sonDurum = function (prog, o) {
    o = o || {};
    const r = o.run || ST.run(prog);
    return ST.stateFrom(prog, r.son, { banner: o.banner || null });
  };

  // ================================================================== 1. GİRİŞ
  /** Giriş animasyonu: aynı istek (kodGir) üç farklı durumda üç farklı cevap alır */
  const HKART = { BOS: 56, DOLU: 140, KILITLI: 224 };
  const HPLAN = [
    { d: 'BOS', istek: 'kodGir(4821)', cevap: '«dolap boş»', kart: 'BOS', not: 'BOŞ dolapta kod işe yaramaz' },
    { d: 'BOS', istek: 'paketKoy(1001)', cevap: 'paket kondu', kart: 'BOS', not: 'Kurye paketi koydu…' },
    { d: 'DOLU', istek: 'paketKoy(1001)', cevap: 'durum → DOLU', kart: 'BOS', gecis: true, not: '…durum nesnesi değişti: DOLU' },
    { d: 'DOLU', istek: 'kodGir(1111) ×3', cevap: 'hatalı (3/3)', kart: 'DOLU', not: 'Biri üç kez yanlış kod girdi…' },
    { d: 'KILITLI', istek: 'kodGir(1111) ×3', cevap: 'durum → KİLİTLİ', kart: 'DOLU', gecis: true, not: '…dolap kilitlendi' },
    { d: 'KILITLI', istek: 'kodGir(4821)', cevap: '«kilitli»', kart: 'KILITLI', not: 'Aynı istek, KİLİTLİ’de: reddedildi' },
    { d: 'DOLU', istek: 'gorevliAc()', cevap: 'durum → DOLU', kart: 'KILITLI', gecis: true, not: 'Görevli kilidi açtı' },
    { d: 'DOLU', istek: 'kodGir(4821)', cevap: 'kapak açıldı', kart: 'DOLU', not: 'Aynı istek, DOLU’da: kapak açıldı!' },
    { d: 'BOS', istek: 'kodGir(4821)', cevap: 'durum → BOŞ', kart: 'DOLU', gecis: true, not: 'Her durum, isteğe kendi cevabını verir' },
  ];

  ST.scenes.intro = function (root, ctx) {
    const el = h('div', { class: 'scene scene-intro' });
    el.innerHTML = `
      <div class="intro-grid">
        <section class="intro-main">
          <div class="chips">
            <span class="chip chip-cat is-behav">Davranışsal · Behavioral</span>
            <span class="chip">GoF · 1994</span>
            <span class="chip">Anahtar kelime: duruma göre davranış</span>
          </div>
          <h1 class="intro-title">State</h1>
          <div class="intro-sub">Durum <span>· “nesne, iç durumu değişince sanki sınıfı değişmiş gibi davranır”</span></div>
          <blockquote class="intent">
            <div class="intent-label">Amaç</div>
            <p>Bir nesnenin, <b>iç durumu değiştiğinde davranışını da değiştirmesine</b> izin ver. Nesne, sanki <b>sınıfını değiştirmiş</b> gibi görünecektir.</p>
            <footer>— Gamma, Helm, Johnson, Vlissides (GoF), <i>Design Patterns</i>, 1994</footer>
          </blockquote>
        </section>
        <section class="intro-hero" aria-label="Kalıbın kısa animasyonu">${heroSvg()}</section>
      </div>
      <div class="intro-cards">
        <article class="card">
          <h3><span class="card-ic">🚦</span> Günlük hayattan</h3>
          <p>Yaya butonuna basmak, ışık <b>kırmızıyken</b> “bekle” sayacını başlatır, <b>yeşilken</b> hiçbir şey yapmaz.
          Düğme aynı, davranış farklı: davranışı ışığın o anki <b>durumu</b> belirler. Akıllı kargo dolabı da böyledir:
          aynı kod, dolap doluyken kapağı açar, kilitliyken reddedilir.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🧩</span> Fikir</h3>
          <p>Her durumu bir sınıf yap: <code>BosDurum</code>, <code>DoluDurum</code>, <code>KilitliDurum</code>. Hepsi aynı
          istekleri (<code>paketKoy</code>, <code>kodGir</code>, <code>gorevliAc</code>) kendi bildiği gibi karşılar.</p>
          <p>Dolap o anki durumu bir <b>nesnede</b> tutar ve isteği ona devreder: <code>durum.kodGir(this, kod)</code>. Durum değişince yalnızca bu nesne değişir.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🎯</span> Bu derste</h3>
          <ol class="objectives">
            <li>Her metotta <code>if (durum…)</code> sormanın bedelini görmek (kilitli dolaba konan paket)</li>
            <li>Durumu <b>nesne</b> yapmak: istek, o anki durum nesnesine devredilir</li>
            <li>Rolleri tanımak: ${['context', 'state', 'concreteState', 'client'].map((r) => ui.roleChip(r)).join(' ')}</li>
            <li>Geçişleri kimin yaptığı, yeni durum eklemek, durum nesnelerini paylaşmak</li>
            <li>State’i Strategy’den ve <code>enum</code> + <code>switch</code>’ten ayırmak</li>
          </ol>
        </article>
      </div>
      <div class="intro-cta">
        <button class="btn btn-primary btn-lg" type="button" data-go>Sorunla başlayalım →</button>
        <a class="btn btn-ghost" href="#/observer">← Önceki kalıp: Observer</a>
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
      k.dolap.setAttribute('class', 'hs-dolap sd-' + p.d);
      k.ekran.textContent = ST.AD[p.d];
      DP.$$('.hs-kart', svg).forEach((c) => {
        const key = c.getAttribute('data-d');
        c.classList.toggle('is-on', key === p.d);
        c.classList.toggle('is-calisan', key === p.kart);
      });
      const y = HKART[p.d] + 32;
      k.ok.setAttribute('d', `M156 172 C 220 172, 236 ${y}, 296 ${y}`);
      k.ok.setAttribute('class', 'hs-ok sd-' + p.d);
      k.istek.textContent = p.istek;
      k.cevap.textContent = p.cevap;
      k.cevapG.setAttribute('class', 'hs-balon is-cevap' + (p.gecis ? ' is-gecis' : ''));
      k.not.textContent = p.not;
      DP.flash(k.not, 'is-pop');
      DP.flash(k.cevapG, 'is-pop');
      t++;
    };
    tick();
    const timer = setInterval(tick, 1500);
    return { destroy: () => clearInterval(timer) };
  };

  function heroSvg() {
    const kart = (key, cevap) => `<g class="hs-kart sd-${key}" data-d="${key}">
        <rect x="296" y="${HKART[key]}" width="240" height="66" rx="10"/>
        <circle class="hs-kart-led" cx="314" cy="${HKART[key] + 22}" r="5"/>
        <text class="hs-kart-t" x="328" y="${HKART[key] + 27}">${ST.SINIF[key]}</text>
        <text class="hs-kart-ad" x="522" y="${HKART[key] + 27}" text-anchor="end">${ST.AD[key]}</text>
        <text class="hs-kart-s" x="314" y="${HKART[key] + 51}">kodGir → ${esc(cevap)}</text>
      </g>`;
    const tuslar = '123456789'
      .split('')
      .map((c, i) => `<rect class="hs-tus" x="${46 + (i % 3) * 30}" y="${234 + Math.floor(i / 3) * 17}" width="24" height="12" rx="3"/>`)
      .join('');
    return `
    <svg class="hero-svg sta-hero" viewBox="0 0 560 360" role="img" aria-label="Aynı istek, dolabın durumuna göre farklı durum nesnesine gider ve farklı cevap alır">
      <text class="h-caption" x="280" y="28" text-anchor="middle">Aynı istek, farklı davranış: davranışı durum nesnesi belirler</text>
      <g data-k="dolap" class="hs-dolap sd-BOS">
        <rect class="hs-govde" x="24" y="52" width="132" height="244" rx="12"/>
        <rect class="hs-ekran" x="36" y="64" width="108" height="34" rx="7"/>
        <text class="hs-ekran-t" data-k="ekran" x="90" y="87" text-anchor="middle">BOŞ</text>
        <rect class="hs-kapak" x="36" y="108" width="108" height="112" rx="7"/>
        <text class="hs-dolap-t" x="90" y="168" text-anchor="middle">dolap</text>
        <text class="hs-dolap-s" x="90" y="186" text-anchor="middle">durum ●</text>
        ${tuslar}
      </g>
      <path data-k="ok" class="hs-ok sd-BOS" d="M156 172 C 220 172, 236 88, 296 88"/>
      ${kart('BOS', '«dolap boş»')}${kart('DOLU', 'kapağı aç')}${kart('KILITLI', '«kilitli»')}
      <g class="hs-balon is-istek"><rect x="164" y="56" width="124" height="26" rx="13"/><text data-k="istek" x="226" y="73" text-anchor="middle"></text></g>
      <g data-k="cevapG" class="hs-balon is-cevap"><rect x="164" y="262" width="124" height="26" rx="13"/><text data-k="cevap" x="226" y="279" text-anchor="middle"></text></g>
      <text class="hc-not" data-k="not" x="280" y="322" text-anchor="middle"></text>
      <text class="h-sub hs-code" x="280" y="348" text-anchor="middle">dolap.kodGir("4821");   →   durum.kodGir(this, "4821");</text>
    </svg>`;
  }

  // ================================================================== 2. SORUN
  ST.scenes.problem = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-46' });
    const left = kit.panel('Kalıpsız kod · <span class="ver"></span>', { cls: 'panel-code sta-left' });
    const right = kit.panel('Kargo dolabı <span class="panel-sub">· durum bir dizgi, davranış if/else’lerde</span>', { cls: 'panel-side sta-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'sta-cv' });
    const consoleEl = h('div', { class: 'console sta-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: ST.roleOf, special: ST.special });

    const viewHost = h('div', { class: 'sta-view' });
    const extra = h('div', { class: 'sta-extra' });
    right.body.append(viewHost, extra);
    const stage = new ST.DolapSahne(viewHost);

    const files = (v) => ST.fileList(ST.naiveFiles(v));
    const asMap = (v) => {
      const F = ST.naiveFiles(v);
      const m = {};
      Object.keys(F).forEach((n) => (m[n + '.java'] = F[n]));
      return m;
    };
    const R = { v1: ST.run(ST.NV.v1), v2: ST.run(ST.NV.v2) };
    /** i. isteğe kadar (dahil) konsol satırları; -1: hepsi */
    const kadar = (v, istek) => {
      const r = R[v];
      if (istek < 0) return r.lines;
      const an = ST.anDurumu(ST.NV[v], r, istek);
      return r.lines.slice(0, an.e.n);
    };
    const hucreOf = (v, istek, tip) => {
      const prog = ST.NV[v];
      const op = prog.ops[istek];
      const ilk = R[v].olaylar.find((o) => o.istek === istek && o.e === 'istek');
      return { metot: ST.metotOf(op), durum: ilk.durum, tip };
    };
    const an = (v, istek, x) => {
      const prog = ST.NV[v];
      const op = prog.ops[istek];
      const a = ST.anDurumu(prog, R[v], istek);
      const cevap = R[v].lines.filter((l) => l.i === istek && l.k !== 'istek' && l.k !== 'gecis').pop();
      return Object.assign(a.st, { aktor: ST.aktorOf(op), alici: op.t === 'kod' && ST.kimOf(op.kod) !== 'yabancı' ? ST.kimOf(op.kod) : null, istek: { metot: ST.metotOf(op), cagri: ST.cagriOf(op) }, cevap: cevap ? { t: cevap.t.trim(), tip: cevap.k === 'hata' ? 'hata' : cevap.k === 'cevap' ? 'ok' : 'red' } : null, tuslar: op.t === 'kod' ? op.kod : null }, x || {});
    };
    const STEPS = [
      {
        t: 'Sürüm 1: durum bir dizgi',
        x: '[[KargoDolabi]] durumu bir **dizgide** tutuyor: `"BOŞ"` ya da `"DOLU"`. Her metot durumu `if/else` ile kendisi soruyor. Kurye Ali’nin paketini koydu; biri **dört kez** yanlış kod denedi, dolap hiç itiraz etmedi. Sonunda Ali kendi koduyla paketini aldı.',
        v: 'v1', istek: -1, mark: ['KargoDolabi.java', ['public void kodGir(String girilen) {', 'System.out.println("  hatalı kod");'], 'focus'],
        st: () => an('v1', 5, { hucre: hucreOf('v1', 5, 'ok'), banner: { text: 'Biri **4 kez** kod denedi, dolap hiç itiraz etmedi: deneme **sınırsız**.', tone: 'bad' } }),
      },
      {
        t: 'Sürüm 2: üç hatalı kodda kilit',
        x: 'Güvenlik ekibi: “Üç hatalı kodda dolap **kilitlensin**, yalnızca şube görevlisi açsın.” Geliştirici `kodGir`’e KİLİTLİ dalını, `hatali` sayacını ve yeni `gorevliAc` metodunu yazdı. Üçüncü yanlış kodda dolap kilitlendi: özellik çalışıyor.',
        v: 'v2', diff: 'v1', istek: 3, mark: ['KargoDolabi.java', ['} else if (durum.equals("KİLİTLİ")) {', 'durumDegistir("KİLİTLİ");'], 'focus'], animateOut: true,
        st: () => an('v2', 3, { hucre: hucreOf('v2', 3, 'on'), hedef: 'KILITLI', banner: { text: 'Üç hatalı kod: dolap **KİLİTLİ**. Güvenlik ekibi memnun.', tone: 'ok' } }),
      },
      {
        t: 'Kilitli dolaba paket kondu!',
        x: 'Kurye Selin’in paketiyle geldi ve aynı göze koydu. `paketKoy`’a kimse dokunmamıştı: `if (DOLU) … else` — “BOŞ ise” diye yazılmış **else dalı KİLİTLİ’yi de karşıladı**. Paket kondu, kilit kalktı, `kod` alanı Selin’in koduyla değişti. Derleyici hiçbir şey söylemedi.',
        v: 'v2', istek: 4, mark: ['KargoDolabi.java', ['} else {', 'durumDegistir("DOLU");'], 'bad'], main: 'dolap.paketKoy("KRG-1005", "7356");',
        st: () => an('v2', 4, { hucre: hucreOf('v2', 4, 'bad'), hedef: 'DOLU', hl: { kod: true, paket: true }, banner: { text: 'KİLİTLİ dolap **else** dalına düştü: paket kondu, kilit kalktı.', tone: 'bad' } }),
      },
      {
        t: 'Ali’nin paketi kayboldu',
        x: 'Görevli geldi: dolap artık DOLU görünüyor, “kilitli değil” dedi. Ali kendi kodunu girdi: **hatalı kod (4/3)**. Ali’nin paketi dolabın içinde ama sistemde **kaydı yok**; kod artık Selin’in. Sayaç da 3’ü geçti; dolap bir daha hiç kilitlenmeyecek.',
        v: 'v2', istek: -1, mark: ['Main.java', ['dolap.gorevliAc();', 'dolap.kodGir("4821");'], 'bad'],
        st: () => an('v2', 6, { hucre: hucreOf('v2', 6, 'bad'), hl: { hatali: true }, banner: { text: 'Ali’nin kodu çalışmadı · **KRG-1001** dolapta ama kayıtsız · sayaç **4/3**', tone: 'bad' } }),
      },
      {
        t: 'Teşhis — Davranış metotlara dağılmış',
        x: 'Dolabın davranışı **duruma** bağlı ama durum bir dizgi; her metot bütün durumları kendisi soruyor. Yeni bir durum eklemek **her metodu** değiştirmek demek; unutulan bir metotta `else`, yeni durumu sessizce eski bir durum sanıyor. Ya her durum, bütün isteklere kendi cevabını veren bir **nesne** olsaydı?',
        v: 'v2', istek: -1, diag: true,
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
        left.head.querySelector('.ver').textContent = { v1: 'sürüm 1.0 (iki durum)', v2: 'sürüm 2.0 (+ kilit)' }[s.v];
        // önce konsol: yüksekliği değişince işaretli satır kod panelinin dışında kalmasın
        const satirlar = kadar(s.v, s.istek).map((l) => ST.consoleLine(l, { notes: ST.hataNotu }));
        ST.renderConsole(consoleEl, ST.cmd(true), satirlar, { animateFrom: info.animate && s.animateOut ? 0 : null, cursor: s.istek >= 0 });
        cv.setFiles(files(s.v), { active: s.mark ? s.mark[0] : 'KargoDolabi.java', prev: s.diff ? asMap(s.diff) : null, keepActive: false });
        if (s.main) cv.mark('Main.java', s.main, 'active', { show: false, scroll: false });
        if (s.mark) cv.mark(s.mark[0], s.mark[1], s.mark[2]);
        if (i === 2) cv.mark('KargoDolabi.java', 'if (durum.equals("DOLU")) {', 'focus', { scroll: false });
        if (s.diag) {
          cv.mark('KargoDolabi.java', ['public void paketKoy(String koli, String kod) {', 'durumDegistir("DOLU");'], 'focus');
          cv.mark('KargoDolabi.java', '} else {', 'bad', { scroll: false });
        }
        right.el.classList.toggle('is-diag', !!s.diag);
        if (!s.diag) {
          const st = s.st();
          stage.render(st, last, { animate: info.animate });
          last = st;
          extra.innerHTML = '';
          return;
        }
        const son = R.v2.son;
        extra.innerHTML = `
          <div class="sta-evidence">
            <span class="sta-ev-k">Kilit</span><b class="is-ok">çalıştı</b>
            <span class="sta-ev-k">Kilitliyken paket</span><b class="is-bad">kondu</b>
            <span class="sta-ev-k">Kayıtsız paket</span><b class="is-bad">${son.kayip.map(ST.kisa).join(', ')}</b>
            <span class="sta-ev-k">if (durum…)</span><b>${ST.kosulSayisi(ST.code.KargoDolabiV2)}</b>
            <span class="sta-ev-why">${md('Aynı dokuz davranış (3 durum × 3 istek), üç metodun içine dağılmış. Her metot bütün durumları biliyor; bir metotta bir durum unutulunca `else` onu yanlış dala düşürüyor.')}</span>
          </div>
          <div class="req-card is-diagnosis">
            <div class="diag-title">Teşhis</div>
            <ul class="problems">
              <li>${md('**Durum davranışı metotlara dağılmış:** her metot bütün durumları kendisi soruyor. Yeni bir durum (KİLİTLİ) her metodu tek tek değiştirmek demek; biri unutulunca hata derleme değil **çalışma** anında çıkıyor.')}</li>
              <li>${md('**else sessizce yanlış dala düşürüyor:** `paketKoy`’daki “BOŞ ise” dalı, sonradan eklenen KİLİTLİ’yi de karşıladı. Derleyici bir dizginin hangi değerleri alabileceğini bilemez.')}</li>
              <li>${md('**Geçişler gizli:** `durum = "…"` atamaları dalların içine gömülü. Dolabın hangi durumdan hangisine geçtiğini görmek için bütün metotları okumak gerekiyor.')}</li>
            </ul>
          </div>
          <div class="sg-aside">${md('💬 **Trafik ışığı gibi:** yaya butonu kırmızıda sayacı başlatır, yeşilde bir şey yapmaz. Davranışı **durum** belirler. Peki her durum, bütün düğmelere kendi cevabını veren bir **nesne** olsaydı?')}</div>`;
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
  ST.scenes.solution = function (root, ctx) {
    const R = ST.refactor;
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-diag' });
    const left = kit.panel('Yeniden düzenleme (refactoring)', { cls: 'panel-code sta-left' });
    const right = kit.panel('Sınıf diyagramı', { cls: 'panel-side panel-diagram' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'sta-cv' });
    const consoleEl = h('div', { class: 'console sta-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: ST.roleOf, special: ST.special });
    const diagHost = h('div', { class: 'diag-host' });
    const recipe = h('ol', { class: 'recipe' });
    const legend = kit.umlLegend({ association: false, aggregation: 'tutar', fmLabel: 'durum geçişi' });
    right.body.append(h('div', { class: 'recipe-wrap' }, h('div', { class: 'recipe-title' }, 'Dönüşüm tarifi'), recipe), diagHost, legend);
    ['Durumlar nesne olur', 'paketKoy durumlara taşınır', 'kodGir taşınır', 'gorevliAc taşınır'].forEach((t, i) => recipe.appendChild(h('li', { 'data-i': String(i + 1) }, t)));
    const diagram = new DP.ClassDiagram(diagHost, ST.solutionDiagram(0), { roles: ST.roles, roleTags: false });

    const outAt = (i) => ST.run(ST.refactorProgs[i]).lines.map((l) => ST.consoleLine(l, { notes: ST.hataNotu, hl: (x) => i === 2 && x.t.includes('kilitli: KRG-1005') }));
    const STEPS = [
      { t: 'Başlangıç — durum bir dizgi, davranış if/else’lerde', x: 'Üç metot, her birinde bütün durumlar: 5 tane `if (durum…)`. Kilitli dolaba paket konuyor, Ali’nin paketi kayboluyor. Dört adımda her durumu bir **sınıfa** dönüştüreceğiz; dolabın dışarıya açık metotları (`paketKoy`, `kodGir`, `gorevliAc`) ve Main **değişmeyecek**.', focus: 'KargoDolabi.java', mark: '} else {', kind: 'bad' },
      { t: 'Adım 1 — Durumlar nesne olur', x: '[[DolapDurumu]] arayüzü ve üç sınıf: [[BosDurum]], [[DoluDurum]], [[KilitliDurum]]. Şimdilik yalnızca `ad()` biliyorlar. Bağlam dizgi yerine bir **durum nesnesi** tutuyor; dallar `instanceof` ile soruyor. Konsola bakın: **hata sürüyor**. Durumu nesne yapmak tek başına yetmez; davranış hâlâ bağlamda.', focus: 'KargoDolabi.java', marks: ['private DolapDurumu durum = new BosDurum();', 'if (durum instanceof DoluDurum) {'] },
      { t: 'Adım 2 — `paketKoy` durumlara taşınır', x: 'Arayüze `paketKoy` eklendi: artık **her** durum sınıfı onu yazmak zorunda, yoksa kod derlenmez. [[KilitliDurum]] kendi cevabını verdi: “kilitli: KRG-1005 konamadı”. **Hata düzeldi!** Bağlamın `paketKoy`’u tek satır: `durum.paketKoy(this, koli, kod)`.', focus: 'KilitliDurum.java', marks: ['public void paketKoy(KargoDolabi dolap, String koli, String kod) {', 'System.out.println("  kilitli: " + koli + " konamadı");'] },
      { t: 'Adım 3 — `kodGir` taşınır', x: 'Doğru kod, yanlış kod ve kilitleme kuralı [[DoluDurum]]’a taşındı; BOŞ ve KİLİTLİ kendi kısa cevaplarını veriyor. Geçiş artık açıkça görünüyor: `dolap.durumDegistir(new KilitliDurum())`. Bağlam, durumların kullandığı küçük işlemleri sunuyor (`kodDogruMu`, `paketiVer`, `hataliArtir`).', focus: 'DoluDurum.java', marks: ['public void kodGir(KargoDolabi dolap, String girilen) {', 'dolap.durumDegistir(new KilitliDurum());'] },
      { t: 'Adım 4 — `gorevliAc` taşınır', x: 'Son istek de taşındı: kilidi açan [[KilitliDurum]]. [[KargoDolabi]]’nde tek bir `if (durum…)` kalmadı; her istek tek satırda o anki durum nesnesine **devrediliyor**.', focus: 'KargoDolabi.java', marks: ['durum.paketKoy(this, koli, kod);', 'durum.gorevliAc(this);'] },
      { t: 'Sonuç — Ne kazandık?', x: 'Her durum bir sınıf: bir durumun **bütün** davranışı tek yerde. Yeni bir durum, her isteğe cevap vermek **zorunda** (derleyici denetler); `else`’e düşen durum yok. Geçişler açık: `dolap.durumDegistir(new …)`. Dolap, durumu değişince **sanki sınıfı değişmiş gibi** davranıyor.', focus: 'DoluDurum.java', marks: ['dolap.durumDegistir(new BosDurum());', 'dolap.durumDegistir(new KilitliDurum());'] },
    ];

    const filesAt = (i) => ST.refactorOrder.filter((k) => R[i][k]).map((k) => ({ name: k + '.java', code: R[i][k] }));
    const asMap = (i) => {
      const m = {};
      Object.keys(R[i]).forEach((k) => (m[k + '.java'] = R[i][k]));
      return m;
    };
    const ifSayisi = R.map((F) => ST.kosulSayisi(F.KargoDolabi));

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
        ST.renderConsole(consoleEl, ST.cmd(true), outAt(ri), { animateFrom: info.animate && i === 2 ? 0 : null });
        const showDiff = i >= 1 && i <= R.length - 1;
        cv.setFiles(filesAt(ri), { active: s.focus, prev: showDiff ? asMap(ri - 1) : null, keepActive: false });
        if (s.mark) cv.mark(s.focus, s.mark, s.kind || 'focus');
        (s.marks || []).forEach((m, k) => cv.mark(s.focus, m, 'focus', { scroll: k === 0 }));

        diagram.update(ST.solutionDiagram(Math.min(i, 5)), { animate: info.animate });
        diagram.clearBadges();
        diagram.clearFocus();
        const ifRozet = (n) => diagram.badge('KargoDolabi', `${n} × if`, n ? 'bad' : 'new');
        if (i === 0) {
          ifRozet(ifSayisi[0]);
          diagram.focus({ classes: ['KargoDolabi'] });
        }
        if (i === 1) {
          ifRozet(ifSayisi[1]);
          diagram.badge('DolapDurumu', 'YENİ', 'new');
          diagram.focus({ classes: ['DolapDurumu', 'BosDurum', 'DoluDurum', 'KilitliDurum'], edges: ['durum', 'r-BOS', 'r-DOLU', 'r-KILITLI'] });
        }
        if (i === 2) {
          ifRozet(ifSayisi[2]);
          diagram.badge('KilitliDurum', 'paketKoy zorunlu', 'new');
          diagram.focus({ classes: ['DolapDurumu', 'KilitliDurum'], members: [['DolapDurumu', 'paketKoy'], ['BosDurum', 'paketKoy'], ['DoluDurum', 'paketKoy'], ['KilitliDurum', 'paketKoy']] });
        }
        if (i === 3) {
          ifRozet(ifSayisi[3]);
          diagram.badge('DoluDurum', 'kural burada', 'new');
          diagram.focus({ classes: ['DolapDurumu', 'DoluDurum'], members: [['DolapDurumu', 'kodGir'], ['DoluDurum', 'kodGir']] });
        }
        if (i === 4) {
          ifRozet(ifSayisi[4]);
          diagram.focus({ classes: ['KargoDolabi', 'DolapDurumu'], edges: ['durum'], members: [['DolapDurumu', 'gorevliAc'], ['KilitliDurum', 'gorevliAc']] });
        }
        if (i === 5) diagram.focus({ classes: ['KargoDolabi', 'DolapDurumu', 'BosDurum', 'DoluDurum', 'KilitliDurum'], edges: ['durum', 'r-BOS', 'r-DOLU', 'r-KILITLI'] });
        DP.$$('li', recipe).forEach((li, k) => {
          li.classList.toggle('is-done', k + 1 < i || (i === 5 && k < 4));
          li.classList.toggle('is-current', k + 1 === i);
        });
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };
})();
