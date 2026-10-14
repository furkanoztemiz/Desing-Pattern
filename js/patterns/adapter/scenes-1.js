/*
 * Adapter — sahneler (1/3): Giriş, Sorun, Çözüm
 */
(function () {
  'use strict';
  const AD = DP.ad;
  const { h } = DP;
  const kit = DP.kit;
  const md = (t) => DP.md(t, AD.roleOf);
  AD.md = md;
  AD.scenes = AD.scenes || {};
  const ui = (AD.ui = {
    foot: (root) => kit.foot(root, AD.roleOf),
    roleChip: (key) => kit.roleChip(AD.roles, key),
  });

  /** Konsol: satırlar {t, err, ok, bad, dim, note}. note: satırın sonuna eklenen açıklama. */
  AD.renderConsole = function (el, cmd, lines, o) {
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
  AD.scenes.intro = function (root, ctx) {
    const el = h('div', { class: 'scene scene-intro' });
    el.innerHTML = `
      <div class="intro-grid">
        <section class="intro-main">
          <div class="chips">
            <span class="chip chip-cat is-struct">Yapısal · Structural</span>
            <span class="chip">GoF · 1994</span>
            <span class="chip">Diğer adı: Wrapper (Sarmalayıcı)</span>
          </div>
          <h1 class="intro-title">Adapter</h1>
          <div class="intro-sub">Adaptör <span>· “uymayanı uydur”</span></div>
          <blockquote class="intent">
            <div class="intent-label">Amaç</div>
            <p>Bir sınıfın arayüzünü, istemcilerin <b>beklediği başka bir arayüze dönüştür</b>. Adapter, uyumsuz arayüzleri yüzünden
            birlikte çalışamayan sınıfların <b>birlikte çalışmasını</b> sağlar.</p>
            <footer>— Gamma, Helm, Johnson, Vlissides (GoF), <i>Design Patterns</i>, 1994</footer>
          </blockquote>
        </section>
        <section class="intro-hero" aria-label="Kalıbın kısa animasyonu">${heroSvg()}</section>
      </div>
      <div class="intro-cards">
        <article class="card">
          <h3><span class="card-ic">🔌</span> Günlük hayattan</h3>
          <p>İngiltere’ye giderken şarj aletinizi değiştirmezsiniz, duvardaki prizi de sökmezsiniz: araya bir <b>seyahat adaptörü</b> takarsınız.
          Konferanstaki <b>tercüman</b> da öyle: konuşmacı Türkçe konuşmaya devam eder, dinleyici İngilizce duyar.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🛰️</span> Birim uyumsuzluğu</h3>
          <p>1999’da NASA’nın <b>Mars Climate Orbiter</b> sondası kayboldu: bir yazılım itkiyi <b>pound-kuvvet·saniye</b>,
          diğeri <b>newton·saniye</b> sanıyordu. İki doğru çalışan parça, aralarında çevirmen olmadığı için yanlış sonuç üretti.
          Bu derste aynı tuzak bizi <b>kg ↔ lb</b> ile bekliyor.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🎯</span> Bu derste</h3>
          <ol class="objectives">
            <li>Değiştiremediğimiz bir kütüphaneyle <b>uyumsuzluğu</b> görmek</li>
            <li>Çeviriyi istemcilere dağıtmanın <b>tehlikesini</b> yaşamak</li>
            <li>Dört rolü tanımak: ${['client', 'target', 'adapter', 'adaptee'].map((r) => ui.roleChip(r)).join(' ')}</li>
            <li>Bir çağrının adaptörde <b>çevrilişini</b> adım adım izlemek</li>
            <li><b>Nesne</b> ve <b>sınıf</b> adaptörünü karşılaştırmak; JDK’daki adaptörleri bulmak</li>
          </ol>
        </article>
      </div>
      <div class="intro-cta">
        <button class="btn btn-primary btn-lg" type="button" data-go>Sorunla başlayalım →</button>
        <a class="btn btn-ghost" href="#/prototype">← Önceki kalıp: Prototype</a>
        <span class="hint">ya da klavyede <kbd>→</kbd> tuşuna basın</span>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-go]').addEventListener('click', () => ctx.goScene('sorun'));

    // Uyumsuz iki parça → adaptör araya oturur → mesaj gider (çevrilir) ve cevap döner (dekoratif döngü).
    const svg = el.querySelector('.hero-svg');
    const k = {};
    DP.$$('[data-k]', svg).forEach((n) => (k[n.getAttribute('data-k')] = n));
    const MSG = [
      null,
      null,
      { x: 92, t: '12 kg', en: false },
      { x: 276, t: '12 kg → 26.46 lb', en: false },
      { x: 466, t: '26.46 lb', en: true },
      { x: 466, t: '48213', en: true, back: true },
      { x: 276, t: '"GS-48213" ← 48213', en: false, back: true },
      { x: 92, t: '"GS-48213"', en: false, back: true },
      null,
    ];
    let t = 0;
    const tick = () => {
      const ph = t % 10; // 0: uyumsuz · 1: adaptör iner · 2-7: mesaj · 8-9: bekle
      const on = ph >= 1;
      k.adapter.classList.toggle('is-on', on);
      if (ph === 1) DP.flash(k.adapter, 'is-drop');
      k.reject.classList.toggle('is-on', !on);
      const m = MSG[ph] || null;
      k.msg.classList.toggle('is-on', !!m);
      if (m) {
        k['msg-t'].textContent = m.t;
        const w = Math.max(70, m.t.length * 7.4 + 22);
        k['msg-bg'].setAttribute('width', String(w));
        k['msg-t'].setAttribute('x', String(w / 2));
        k.msg.style.transform = `translate(${m.x - w / 2}px, 0px)`;
        k.msg.classList.toggle('is-en', m.en);
      }
      k.ok.classList.toggle('is-on', ph >= 7);
      t++;
    };
    tick();
    const timer = setInterval(tick, 1300);
    return { destroy: () => clearInterval(timer) };
  };

  function heroSvg() {
    const P = (o) => AD.art.piece(Object.assign({ s: 18 }, o));
    return `
    <svg class="hero-svg ad-hero" viewBox="0 0 560 360" role="img" aria-label="Uyumsuz iki parçanın arasına bir adaptör oturuyor; mesaj geçerken kilogramdan pounda çevriliyor">
      <text class="h-caption" x="280" y="34" text-anchor="middle">Uyumsuz iki arayüz → arada bir çevirmen</text>
      ${P({ x: 14, y: 140, w: 156, h: 116, right: 'round', role: 'client', title: 'GonderiServisi', sub: 'TR · kg' })}
      <g class="ah-gap"><rect x="172" y="146" width="208" height="104" rx="12"/><text x="276" y="204" text-anchor="middle">?</text></g>
      <g class="ah-adapter" data-k="adapter">${P({ x: 170, y: 140, w: 214, h: 116, left: 'round', right: 'square', role: 'adapter', title: 'Adaptör', sub: 'kg → lb · id → "GS-…"' })}</g>
      ${P({ x: 384, y: 140, w: 162, h: 116, left: 'square', role: 'adaptee', title: 'GlobalShipApi', sub: 'EN · lb' })}
      <g class="ah-reject" data-k="reject"><circle cx="276" cy="198" r="20"/><path d="M266 188 L286 208 M286 188 L266 208"/></g>
      <g class="ad-msg ah-msg" data-k="msg"><rect data-k="msg-bg" x="0" y="96" width="80" height="28" rx="14"/><text data-k="msg-t" x="40" y="115" text-anchor="middle"></text></g>
      <g class="ah-ok" data-k="ok"><rect x="186" y="280" width="188" height="26" rx="13"/><text x="280" y="298" text-anchor="middle">✓ iki taraf da değişmedi</text></g>
      <text class="h-sub ah-sub" x="280" y="340" text-anchor="middle">istemci TR/kg konuşur · kütüphane EN/lb · adaptör çevirir</text>
    </svg>`;
  }

  // ================================================================== 2. SORUN
  AD.scenes.problem = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-46' });
    const left = kit.panel('Kalıpsız kod · <span class="ver"></span>', { cls: 'panel-code ad-left' });
    const right = kit.panel('Bağlantı tezgâhı', { cls: 'panel-side ad-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'ad-cv' });
    const consoleEl = h('div', { class: 'console ad-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: AD.roleOf, special: AD.special });

    const viewHost = h('div', { class: 'ad-view' });
    const extra = h('div', { class: 'ad-extra' });
    right.body.append(viewHost, extra);
    const stage = new AD.Stage(viewHost, { view: '150 28 660 444' });

    const ORDER = ['GonderiServisi', 'IadeServisi', 'Main', 'KargoFirmasi', 'HizliKargo', 'GlobalShipApi', 'ShipmentRequest'];
    const files = (v) => {
      const F = AD.naive(v);
      return ORDER.filter((n) => F[n]).map((n) => ({ name: n + '.java', code: F[n] }));
    };
    const asMap = (v) => {
      const F = AD.naive(v);
      const m = {};
      Object.keys(F).forEach((n) => (m[n + '.java'] = F[n]));
      return m;
    };
    const out = (v) =>
      AD.naiveOutput(v).map((l) => {
        if (l.err) return l;
        if (l.bad) return { t: l.t, bad: true, note: 'aynı koli: 12 lb?!' };
        return { t: l.t, dim: !!l.gs && v === 'v3' };
      });
    const P = AD.P;
    const C = AD.C;
    const patchG = { ok: true, text: 'kg × 2.20462 · "GS-" + id' };
    const patchI = { ok: false, text: 'çeviri yok: 12 → "12 lb"' };

    const STEPS = [
      {
        t: 'Yurt içi: her şey yerine oturuyor',
        x: '[[GonderiServisi]] ve [[IadeServisi]] bir [[KargoFirmasi]] ile çalışıyor; yurt içi firmamız [[HizliKargo]] bu arayüzü zaten uyguluyor. Servisler hangi firmayla konuştuklarını bilmiyor, yalnızca **arayüzü** tanıyor.',
        v: 'v1', mark: ['GonderiServisi.java', 'firma.gonderiOlustur(nereden, nereye, kg)', 'focus'], out: out('v1'),
        stage: { rows: [{ id: 'g', client: C.gonderi, link: 'snap', provider: P.hizli }], msg: { row: 0, at: 'p', text: 'gonderiOlustur(…, 20 kg)', lang: 'tr' }, banner: { text: 'Yuvarlak parça yuvarlak yuvaya **oturuyor**: arayüzler uyumlu.', tone: 'ok' } },
      },
      {
        t: 'Yeni ortak: GlobalShip',
        x: 'Şirket yurt dışına açılıyor. Ortağımız GlobalShip’in kütüphanesi bambaşka konuşuyor: `createShipment(ShipmentRequest)`, ağırlık **pound**, numara **sayı**, durum **kod**. Üstelik bir .jar dosyası: kaynak kodunu **değiştiremeyiz**. Doğrudan takmayı denedik; derleyici reddetti.',
        v: 'dene', diff: 'v1', mark: ['Main.java', 'new GlobalShipApi()', 'bad'], out: out('dene'), compile: true,
        stage: { rows: [{ id: 'g', client: C.gonderi, link: 'reject', provider: P.global }], banner: { text: 'Kare parça yuvarlak yuvaya **girmiyor**: `GlobalShipApi` bir `KargoFirmasi` değil.', tone: 'bad' } },
      },
      {
        t: 'Kestirme: istemci yabancı dili öğreniyor',
        x: 'Hızlı çözüm: [[GonderiServisi]] GlobalShip’i **doğrudan** kullanmaya başladı. `if (yurtdisi)` dalında kg → lb çevirisi, istek nesnesi, `"GS-" + id`, durum kodu… Çalışıyor; ama istemci artık yabancı bir API’yi **ezbere** biliyor ve yuvası ona göre **yamalandı**.',
        v: 'v2', diff: 'dene', mark: ['GonderiServisi.java', ['if (yurtdisi)', '} else {'], 'focus'], out: out('v2'), animateOut: 2,
        stage: { rows: [{ id: 'g', client: C.gonderi, link: 'patch', patch: patchG, provider: P.global }], msg: { row: 0, at: 'p', text: 'createShipment(… 26.46 lb)', lang: 'en' } },
      },
      {
        t: 'Kopyala-yapıştır: İade servisi',
        x: '[[IadeServisi]]’ni başka bir geliştirici yazdı ve GlobalShip kodunu kopyaladı… çeviriyi **unuttu**. `int` değer `double` parametreye kendiliğinden genişlediği için derleyici **sessiz** kaldı: aynı koli iadede 12 lb (≈5,4 kg) olarak bildirildi.',
        v: 'v3', diff: 'v2', mark: ['IadeServisi.java', 'new ShipmentRequest(musteriSehri, depoSehri, kg)', 'bad'], out: out('v3'), animateOut: 4,
        stage: {
          rows: [
            { id: 'g', client: C.gonderi, link: 'patch', patch: patchG, provider: P.global },
            { id: 'i', client: C.iade, link: 'patch', patch: patchI, provider: P.global },
          ],
          msg: { row: 1, at: 'p', text: 'createShipment(… 12.00 lb)', lang: 'en', tone: 'bad' },
          banner: { text: 'Aynı 12 kg’lık koli: gidişte **26.46 lb**, iadede **12.00 lb**!', tone: 'bad' },
        },
      },
      {
        t: 'Teşhis — Çevirmen nerede olmalı?',
        x: 'Çeviri bilgisi **istemcilere dağıldı**: her servis yabancı API’yi ayrı ayrı öğrendi ve biri yanlış öğrendi. Kütüphaneyi değiştiremiyoruz, istemcileri de değiştirmek istemiyoruz. Çözüm: araya **tek bir çevirmen** koymak — Adapter.',
        v: 'v3', mark: null, diag: true, out: out('v3'),
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
        left.head.querySelector('.ver').textContent = { v1: 'sürüm 1.0 (yurt içi)', dene: 'deneme: doğrudan takmak', v2: 'sürüm 2.0 (yurt dışı)', v3: 'sürüm 3.0 (iade de yurt dışında)' }[s.v];
        cv.setFiles(files(s.v), { active: s.mark ? s.mark[0] : 'GonderiServisi.java', prev: s.diff ? asMap(s.diff) : null });
        if (s.mark) cv.mark(s.mark[0], s.mark[1], s.mark[2]);
        AD.renderConsole(consoleEl, s.compile ? '$ javac *.java' : '$ javac *.java && java Main', s.out, {
          animateFrom: info.animate && s.animateOut != null ? s.animateOut : info.animate && s.compile ? 0 : null,
          title: s.compile ? 'Derleyici' : 'Konsol',
        });
        stage.render(stageOf(i), prev >= 0 ? stageOf(prev) : null, { animate: info.animate && !!s.stage });
        if (s.diag) {
          extra.innerHTML = `
            <div class="req-card is-diagnosis">
              <div class="diag-title">Teşhis</div>
              <ul class="problems">
                <li>${md('**İstemciler yabancı API’ye bağımlı:** her yeni yabancı firma, her serviste yeni bir `if` demek (Açık/Kapalı İlkesi ihlali).')}</li>
                <li>${md('**Çeviri dağınık ve kopyalanmış:** aynı dönüşüm iki yerde yazıldı ve biri **yanlış**; derleyici fark etmedi.')}</li>
                <li>${md('**İki taraf da sabit:** kütüphaneyi değiştiremeyiz (üçüncü parti), istemcileri de her ortak için değiştirmek istemeyiz.')}</li>
              </ul>
            </div>
            <div class="sg-aside">${md('💬 **Seyahat adaptörü gibi:** ne prizi ne de cihazı değiştiririz; araya ikisine de uyan bir **ara parça** takarız. Bütün çeviri o parçada, **tek yerde** durur.')}</div>`;
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
  AD.scenes.solution = function (root, ctx) {
    const R = AD.refactor;
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-diag' });
    const left = kit.panel('Yeniden düzenleme (refactoring)', { cls: 'panel-code ad-left' });
    const right = kit.panel('Sınıf diyagramı', { cls: 'panel-side panel-diagram' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'ad-cv' });
    const consoleEl = h('div', { class: 'console ad-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: AD.roleOf, special: AD.special });
    const diagHost = h('div', { class: 'diag-host' });
    const recipe = h('ol', { class: 'recipe' });
    const legend = kit.umlLegend({ association: true, fmLabel: 'çeviri yapan metot (adaptör)' });
    right.body.append(h('div', { class: 'recipe-wrap' }, h('div', { class: 'recipe-title' }, 'Dönüşüm tarifi'), recipe), diagHost, legend);
    ['Adaptör: implements KargoFirmasi', 'Çeviri metotları', 'İstemciler yalnızca arayüzü bilir'].forEach((t, i) => recipe.appendChild(h('li', { 'data-i': String(i + 1) }, t)));
    const diagram = new DP.ClassDiagram(diagHost, AD.solutionDiagram(0), { roles: AD.roles, roleTags: false });

    const bugOut = AD.naiveOutput('v3').map((l) => (l.bad ? { t: l.t, bad: true, note: 'hata hâlâ yerinde' } : { t: l.t, dim: !!l.gs }));
    const okOut = AD.output.map((t, j) => ({ t, ok: j === 4, note: j === 4 ? 'iade de 26.46 lb ✓' : null }));
    const STEPS = [
      { t: 'Başlangıç — istemciler yabancı dili konuşuyor', x: 'İki servis de GlobalShip’i doğrudan kullanıyor; çeviri kodu iki yerde ve biri hatalı. Üç adımda bütün çeviriyi **tek bir sınıfa** taşıyacağız; istemciler eski sade hâllerine dönecek.', focus: 'IadeServisi.java', mark: 'new ShipmentRequest(musteriSehri, depoSehri, kg)', kind: 'bad', run: 'bug' },
      { t: 'Adım 1 — Adaptör: implements KargoFirmasi', x: 'Yeni sınıf [[GlobalShipAdaptoru]]: istemcilerin beklediği arayüzü **uygular** ve uyarlanacak [[GlobalShipApi]] nesnesini bir alanda **tutar** (kompozisyon). Derleyici hemen hatırlatıyor: arayüzün metotları henüz yazılmadı.', focus: 'GlobalShipAdaptoru.java', mark: 'public class GlobalShipAdaptoru implements KargoFirmasi', run: 'err' },
      { t: 'Adım 2 — Çeviri metotları', x: 'Her hedef metot bir **çeviri**: `gonderiOlustur` → kg’yi lb’ye çevirir, istek nesnesini kurar, `createShipment`’ı çağırır, sayıyı `"GS-…"`’ye çevirir. `durumSorgula` ise numarayı geri çözer ve kodu metne dönüştürür. Mavi kelimeler bizim dilimiz, turuncular onlarınki.', focus: 'GlobalShipAdaptoru.java', marks: ['double lb = kg * LB_PER_KG;', 'return "GS-" + id;', 'return DURUMLAR[api.trackStatus(id)];'], run: 'bug' },
      { t: 'Adım 3 — İstemciler yalnızca arayüzü bilir', x: 'Servislerdeki `if (yurtdisi)` dalları ve `GlobalShipApi` alanları silindi; ikisi de **sürüm 1.0’daki** hâline döndü. Bağlantıyı yalnızca `Main` kuruyor: `new GlobalShipAdaptoru(new GlobalShipApi())`. İade artık doğru: **26.46 lb**.', focus: 'Main.java', mark: 'new GlobalShipAdaptoru(new GlobalShipApi())', run: 'ok' },
      { t: 'Sonuç — Ne kazandık?', x: '**Tek çeviri noktası** (hata bir kez düzeltilir), **sade istemciler** (yabancı API’yi bilmezler), **dokunulmamış kütüphane**, **genişleyebilirlik** (yeni yabancı firma = yeni adaptör). Bedeli: bir sınıf ve bir dolaylama katmanı.', focus: 'GlobalShipAdaptoru.java', marks: ['private final GlobalShipApi api;', 'public String gonderiOlustur(', 'public String durumSorgula('], run: 'ok' },
    ];

    const filesAt = (i) => AD.refactorOrder.filter((k) => R[i][k]).map((k) => ({ name: k + '.java', code: R[i][k] }));
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
        cv.setFiles(filesAt(ri), { active: s.focus, prev: showDiff ? asMap(ri - 1) : null, keepActive: false });
        if (s.mark) cv.mark(s.focus, s.mark, s.kind || 'focus');
        (s.marks || []).forEach((m, k) => cv.mark(s.focus, m, 'focus', { scroll: k === 0 }));

        if (s.run === 'bug') AD.renderConsole(consoleEl, '$ javac *.java && java Main', bugOut, { animateFrom: info.animate && i === 0 ? 4 : null });
        else if (s.run === 'err') AD.renderConsole(consoleEl, '$ javac *.java', AD.refactorErrors(), { animateFrom: info.animate ? 0 : null, title: 'Derleyici' });
        else AD.renderConsole(consoleEl, '$ javac *.java && java Main', okOut, { animateFrom: info.animate && i === 3 ? 2 : null });

        diagram.update(AD.solutionDiagram(Math.min(i, 3)), { animate: info.animate });
        diagram.clearBadges();
        diagram.clearFocus();
        if (i === 0) {
          ['GonderiServisi', 'IadeServisi'].forEach((c) => diagram.badge(c, 'yabancı API’yi bilir', 'bad'));
          diagram.focus({ classes: ['GonderiServisi', 'IadeServisi', 'GlobalShipApi'], edges: ['g-api', 'i-api'] });
        }
        if (i === 1) {
          diagram.badge('GlobalShipAdaptoru', '✗ derlenmez', 'bad');
          diagram.focus({ classes: ['GlobalShipAdaptoru'], edges: ['ad-t', 'ad-api'] });
        }
        if (i === 2) {
          diagram.badge('GlobalShipAdaptoru', 'çeviri burada', 'new');
          diagram.focus({ members: [['GlobalShipAdaptoru', 'gonderiOlustur'], ['GlobalShipAdaptoru', 'durumSorgula'], ['GlobalShipAdaptoru', 'api']] });
        }
        if (i === 3) {
          ['GonderiServisi', 'IadeServisi'].forEach((c) => diagram.badge(c, 'sürüm 1.0’a döndü', 'same'));
          diagram.focus({ classes: ['GonderiServisi', 'IadeServisi', 'KargoFirmasi'], edges: ['g-t', 'i-t'] });
        }
        if (i === 4) {
          diagram.badge('GlobalShipApi', 'dokunulmadı', 'same');
          diagram.focus({ classes: ['GlobalShipAdaptoru'], edges: ['ad-t', 'ad-api'] });
        }
        DP.$$('li', recipe).forEach((li, k) => {
          li.classList.toggle('is-done', k + 1 < i || (i === 4 && k < 3));
          li.classList.toggle('is-current', k + 1 === i);
        });
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };
})();
