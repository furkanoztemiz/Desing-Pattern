/*
 * Adapter — sahneler (2/3): CANLI AKIŞ ve NESNE ↔ SINIF ADAPTÖRÜ
 *   Canlı Akış: tek bir gönderinin yolculuğu — çağrı adaptörde çevrilir (ad, kg → lb), yabancı kütüphaneye gider,
 *               cevap geri çevrilir (48213 → "GS-48213", 2 → "Yolda"). Sahne, sıralama ve sınıf diyagramı görünümleri.
 *   Nesne ↔ Sınıf: kompozisyonla (nesne) ve kalıtımla (sınıf) adaptör; sızıntı, final kütüphane, karşılaştırma.
 */
(function () {
  'use strict';
  const AD = DP.ad;
  const { h } = DP;
  const kit = DP.kit;
  const ui = AD.ui;
  const md = AD.md;

  // ================================================================== 4. CANLI AKIŞ
  function flowSteps() {
    const M = 'Main.java';
    const G = 'GonderiServisi.java';
    const A = 'GlobalShipAdaptoru.java';
    const fMain = { t: 'Main.main()', cls: 'Main' };
    const fGonder = { t: 'servis.gonder(…)', cls: 'GonderiServisi' };
    const fOlustur = { t: 'firma.gonderiOlustur(…)', cls: 'GlobalShipAdaptoru' };
    const fCreate = { t: 'api.createShipment(…)', cls: 'GlobalShipApi' };
    const fDurum = { t: 'firma.durumSorgula(…)', cls: 'GlobalShipAdaptoru' };
    const fTrack = { t: 'api.trackStatus(…)', cls: 'GlobalShipApi' };
    const row = (o) => Object.assign({ id: 'g', client: AD.C.gonderi, link: 'adapter', adapter: { name: 'GlobalShipAdaptoru', sub: 'Adaptör · çevirmen', display: AD.display(-1) }, provider: AD.P.global }, o);
    const disp = (on, done) => ({ name: 'GlobalShipAdaptoru', sub: 'Adaptör · çevirmen', display: AD.display(on, done) });
    return [
      {
        t: 'Uyarlanan: new GlobalShipApi()',
        x: 'Programda üç parça kurulacak: önce **uyarlanan**, sonra onu saran **adaptör**, en son **istemci**. İlki oluştu: yabancı kütüphanenin nesnesi. Onu **olduğu gibi** kullanacağız. Bağlantısı **kare**: bizim yuvarlak yuvamıza uymuyor.',
        code: [M, 'GlobalShipApi api = new GlobalShipApi();'], stack: [fMain], out: 0, seq: -1, uml: { classes: ['GlobalShipApi'] },
        stage: { rows: [row({ link: 'gap', ghostClient: true })] },
      },
      {
        t: 'Adaptör onu sarmalıyor',
        x: '`new GlobalShipAdaptoru(api)` — adaptör uyarlananı bir alanda **tutar** (`private final GlobalShipApi api`). Solu yuvarlak (hedef arayüze uyar), sağı kare (uyarlananı içine alır).',
        code: [M, 'new GlobalShipAdaptoru(api)'], stack: [fMain], out: 0, seq: -1, uml: { classes: ['Adaptor'], edges: ['comp', 'real'] },
        stage: { rows: [row({ ghostClient: true })] },
      },
      {
        t: 'İstemci yalnızca arayüzü görüyor',
        x: '`firma` değişkeninin tipi **KargoFirmasi**. [[GonderiServisi]] karşısındakinin bir adaptör olduğunu **bilmiyor**; yurt içi firmayla nasıl konuşuyorsa onunla da öyle konuşacak.',
        code: [M, 'new GonderiServisi(firma)'], stack: [fMain], out: 0, seq: -1, uml: { classes: ['GonderiServisi', 'KargoFirmasi'], edges: ['uses'] },
        stage: { rows: [row({})], banner: { text: 'İstemcinin gördüğü tek şey: yuvarlak bir **KargoFirmasi** bağlantısı.' } },
      },
      {
        t: 'servis.gonder("İstanbul", "Berlin", 12)',
        x: 'Servis her zamanki gibi `firma.gonderiOlustur(nereden, nereye, kg)` diyor — **Türkçe ve kilogram** ile. Mesaj yola çıktı.',
        code: [G, 'firma.gonderiOlustur(nereden, nereye, kg)'], stack: [fMain, fGonder], out: 0, seq: 1, uml: { members: [['KargoFirmasi', 'gonderiOlustur']] },
        stage: { rows: [row({ active: 'c' })], msg: { row: 0, at: 'c', text: 'gonderiOlustur(…, 12 kg)', lang: 'tr' } },
      },
      {
        t: 'Adaptöre ulaştı',
        x: 'Çağrı [[GlobalShipAdaptoru]]’na geldi: hedef arayüzün metodu **adaptörde** gerçekleniyor. Çeviri tablosunun ilk satırı: `gonderiOlustur` → `createShipment`.',
        code: [A, 'public String gonderiOlustur('], stack: [fMain, fGonder, fOlustur], out: 0, seq: 1, uml: { members: [['Adaptor', 'gonderiOlustur']] },
        stage: { rows: [row({ active: 'a', adapter: disp(0) })], msg: { row: 0, at: 'a', text: 'gonderiOlustur(…, 12 kg)', lang: 'tr' } },
      },
      {
        t: 'Birim çevirisi: 12 kg → 26.46 lb',
        x: '`double lb = kg * LB_PER_KG;` — kütüphane **pound** istiyor. Bu dönüşüm programda artık **yalnızca burada** yazılı; iade servisi gibi bir yerde unutulması imkânsız.',
        code: [A, 'double lb = kg * LB_PER_KG;'], stack: [fMain, fGonder, fOlustur], out: 0, seq: 2, uml: { members: [['Adaptor', 'gonderiOlustur']] },
        stage: { rows: [row({ active: 'a', adapter: disp(1, 0) })], msg: { row: 0, at: 'a', text: '12 kg → 26.46 lb', lang: 'tr' } },
      },
      {
        t: 'Yabancı dilde çağrı: createShipment',
        x: 'Adaptör, kütüphanenin **kendi diliyle** konuşuyor: `api.createShipment(new ShipmentRequest(…, 26.46))`. GlobalShip konsola kendi (İngilizce) satırını yazdı.',
        code: [A, 'long id = api.createShipment('], stack: [fMain, fGonder, fOlustur, fCreate], out: 1, seq: 3, uml: { members: [['GlobalShipApi', 'createShipment']], edges: ['comp'] },
        stage: { rows: [row({ active: 'p', adapter: disp(-1, 1) })], msg: { row: 0, at: 'p', text: 'createShipment(… 26.46 lb)', lang: 'en' } },
      },
      {
        t: 'Cevap geri çevriliyor',
        x: 'Kütüphane bir **sayı** döndürdü: `48213`. Bizim sistemimiz takip numarasını metin olarak bekliyor: `return "GS-" + id;` → `"GS-48213"`.',
        code: [A, 'return "GS-" + id;'], stack: [fMain, fGonder, fOlustur], out: 1, seq: 5, uml: { members: [['Adaptor', 'gonderiOlustur']] },
        stage: { rows: [row({ active: 'a', adapter: disp(2, 1) })], msg: { row: 0, at: 'a', text: '48213 → "GS-48213"', lang: 'tr', back: true } },
      },
      {
        t: 'Durum sorgusu: numarayı geri çöz',
        x: 'Servis şimdi `firma.durumSorgula("GS-48213")` diyor. Adaptör ters yönde çeviriyor: `Long.parseLong(takipNo.substring(3))` → `48213`.',
        code: [A, 'long id = Long.parseLong(takipNo.substring(3));'], stack: [fMain, fGonder, fDurum], out: 1, seq: 6, uml: { members: [['Adaptor', 'durumSorgula']] },
        stage: { rows: [row({ active: 'a', adapter: disp(2, 1) })], msg: { row: 0, at: 'a', text: '"GS-48213" → 48213', lang: 'tr' } },
      },
      {
        t: 'trackStatus(48213) → 2 → "Yolda"',
        x: 'Kütüphane durumu bir **kodla** bildiriyor: `2` (IN_TRANSIT). Adaptör tabloya bakıp Türkçe metne çeviriyor: `DURUMLAR[2]` → `"Yolda"`.',
        code: [A, 'return DURUMLAR[api.trackStatus(id)];'], stack: [fMain, fGonder, fDurum, fTrack], out: 1, seq: 9, uml: { members: [['GlobalShipApi', 'trackStatus'], ['Adaptor', 'durumSorgula']] },
        stage: { rows: [row({ active: 'a', adapter: disp(3, 2) })], msg: { row: 0, at: 'a', text: '2 → "Yolda"', lang: 'tr', back: true } },
      },
      {
        t: 'İstemci kendi dilini duydu',
        x: 'Konsolda: `Takip no: GS-48213 | durum: Yolda`. Servis ne pound gördü ne de durum kodu; yalnızca **kendi dilini** duydu.',
        code: [G, 'System.out.println("Takip no: "'], stack: [fMain, fGonder], out: 2, seq: 9, uml: { classes: ['GonderiServisi'] },
        stage: { rows: [row({ active: 'c', adapter: disp(-1, 3) })], msg: { row: 0, at: 'c', text: '"GS-48213" · "Yolda"', lang: 'tr', back: true }, banner: { text: '✓ İstemci yalnızca kendi dilini duydu. Bütün çeviri adaptörde.', tone: 'ok' } },
      },
      {
        t: 'Sonuç: çevirmen tek yerde',
        x: 'Adaptör = **çevirmen**: ad, birim, numara ve durum çevirisi **tek sınıfta**. İstemci de kütüphane de **değişmedi**. Yarın GlobalShip birim değiştirirse düzeltilecek tek yer burası.',
        code: [A, 'private final GlobalShipApi api;'], stack: [fMain], out: 2, seq: 9, uml: { classes: ['Adaptor'], edges: ['comp', 'real'] },
        stage: { rows: [row({ adapter: disp(-1, 3) })], banner: { text: 'Ad · birim · numara · durum: hepsi **GlobalShipAdaptoru** içinde.', tone: 'ok' } },
      },
    ];
  }

  const FLOW_DELAYS = [4600, 4600, 4600, 4200, 4400, 4800, 4800, 4800, 4800, 4800, 4800, 5600];

  AD.scenes.flow = function (root, ctx) {
    const S = ctx.state;
    const el = h('div', { class: 'scene scene-flow' });
    const toolbar = h('div', { class: 'scene-toolbar' });
    const body = h('div', { class: 'flow-body' + (S.showCode === false ? ' hide-code' : '') });
    el.append(toolbar, body);
    root.appendChild(el);

    const viewSeg = kit.seg(
      [
        { v: 'stage', label: 'Sahne' },
        { v: 'seq', label: 'Sıralama diyagramı' },
        { v: 'uml', label: 'Sınıf diyagramı' },
      ],
      S.view || 'stage',
      (k) => setView(k),
      { label: 'Görünüm' }
    );
    const codeBtn = h('button', { class: 'btn btn-ghost btn-sm', type: 'button', title: 'Kod panelini göster/gizle' }, 'Kod paneli');
    codeBtn.addEventListener('click', () => {
      S.showCode = body.classList.contains('hide-code');
      body.classList.toggle('hide-code', !S.showCode);
      codeBtn.classList.toggle('is-on', S.showCode);
    });
    codeBtn.classList.toggle('is-on', S.showCode !== false);
    toolbar.append(
      h('span', { class: 'tb-label' }, 'Bir gönderinin yolculuğu · '),
      h('span', { class: 'tb-hint', html: '<span class="ad-lang-key is-tr">mavi</span> = bizim dilimiz · <span class="ad-lang-key is-en">turuncu</span> = onlarınki' }),
      h('span', { class: 'tb-spacer' }),
      viewSeg.el,
      codeBtn
    );

    const viewPanel = h('section', { class: 'panel flow-view' });
    const views = { stage: h('div', { class: 'fv fv-stage' }), seq: h('div', { class: 'fv fv-seq' }), uml: h('div', { class: 'fv fv-uml' }) };
    Object.values(views).forEach((x) => viewPanel.appendChild(x));
    const codeCol = h('div', { class: 'flow-code' });
    const stackEl = h('div', { class: 'callstack', 'aria-label': 'Çağrı yığını' });
    const cvPanel = h('section', { class: 'panel flow-cv' });
    const consoleEl = h('div', { class: 'console ad-flow-console', 'aria-live': 'polite' });
    codeCol.append(stackEl, cvPanel, consoleEl);
    body.append(viewPanel, codeCol);

    const stage = new AD.Stage(views.stage);
    const seq = new DP.SequenceDiagram(views.seq, AD.seqSpec(), { roles: AD.roles });
    const uml = new DP.ClassDiagram(views.uml, AD.gofDiagram({ form: 'nesne', notes: true }), { roles: AD.roles, roleTags: true });
    const cv = new DP.CodeView(cvPanel, { roleOf: AD.roleOf, special: AD.special });
    cv.setFiles(AD.akis.files());
    const steps = flowSteps();

    function setView(k) {
      S.view = k;
      Object.keys(views).forEach((key) => (views[key].hidden = key !== k));
      viewSeg.set(k);
      if (stepper) render(stepper.index, -1, { animate: false });
    }

    function renderStack(all) {
      stackEl.innerHTML = '<span class="cs-label">Çağrı yığını</span>';
      const frames = all.length > 3 ? all.slice(-2) : all;
      if (frames !== all) {
        stackEl.appendChild(h('span', { class: 'cs-frame cs-more', title: all.slice(0, -2).map((x) => x.t).join(' › ') }, '…'));
        stackEl.appendChild(h('span', { class: 'cs-sep' }, '›'));
      }
      frames.forEach((fr, i) => {
        if (i) stackEl.appendChild(h('span', { class: 'cs-sep' }, '›'));
        const r = AD.roleOf(fr.cls);
        stackEl.appendChild(h('span', { class: 'cs-frame' + (r ? ' rc rc-' + r : '') + (i === frames.length - 1 ? ' is-top' : '') }, fr.t));
      });
    }

    function render(i, prev, info) {
      const s = steps[i];
      const ps = prev >= 0 && prev < steps.length ? steps[prev] : null;
      foot.set(i, steps.length, s.t, s.x);
      cv.clear();
      for (let j = 0; j < i; j++) cv.mark(steps[j].code[0], steps[j].code[1], 'trail', { show: false, scroll: false });
      cv.mark(s.code[0], s.code[1], 'active', { flash: !!ps && ps.code[0] !== s.code[0] });
      renderStack(s.stack);
      AD.renderConsole(
        consoleEl,
        '$ java Main',
        AD.akis.output.slice(0, s.out).map((t, j) => ({ t, ok: j === 1 })),
        { animateFrom: info.animate && (!ps || ps.out !== s.out) ? (ps ? ps.out : 0) : null, cursor: i < steps.length - 2 }
      );
      stage.render(s.stage, ps ? ps.stage : null, { animate: info.animate && S.view === 'stage' });
      seq.show(s.seq, info.animate && S.view === 'seq');
      uml.stopFx();
      if (s.uml) uml.focus(s.uml);
      else uml.clearFocus();
      el.classList.toggle('is-done', i === steps.length - 1);
    }

    const foot = ui.foot(el);
    let stepper = null;
    stepper = new DP.Stepper(foot.stepHost, {
      count: steps.length,
      labels: steps.map((s) => s.t),
      delayOf: (i) => FLOW_DELAYS[i] || 4400,
      onChange: (i, prev, info) => render(i, prev, info),
    });
    setView(S.view || 'stage');
    return kit.stepApi(stepper, {
      destroy: () => {
        stepper.destroy();
        stage.destroy();
      },
    });
  };

  // ================================================================== 5. NESNE ↔ SINIF ADAPTÖRÜ
  const SA = AD.sinif;

  AD.scenes.forms = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-50' });
    const left = kit.panel('Biçim: <span class="ver"></span>', { cls: 'panel-code ad-left' });
    const right = kit.panel('Sınıf diyagramı', { cls: 'panel-side panel-diagram ad-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'ad-cv' });
    const consoleEl = h('div', { class: 'console ad-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: AD.roleOf, special: AD.special });

    const diagHost = h('div', { class: 'diag-host' });
    const extra = h('div', { class: 'ad-extra' });
    right.body.append(diagHost, extra);
    const diagram = new DP.ClassDiagram(diagHost, AD.gofDiagram({ form: 'nesne', notes: true }), { roles: AD.roles, roleTags: true });

    const STEPS = [
      {
        t: 'Nesne adaptörü (kompozisyon)',
        x: 'Şimdiye kadar yazdığımız biçim: adaptör, uyarlananı bir **alanda tutar** ve işi ona **devreder** (kompozisyon: “sahiptir”). Çalışma anında **iki nesne** var: adaptör + uyarlanan.',
        k: 'nesne', ver: 'nesne adaptörü', focus: 'GlobalShipAdaptoru.java', marks: [['private final GlobalShipApi api;', 'focus'], ['long id = api.createShipment(', 'focus']],
        diag: { form: 'nesne', focus: { edges: ['comp', 'real'], members: [['Adaptor', 'api']] } },
      },
      {
        t: 'Sınıf adaptörü (kalıtım)',
        x: 'GoF’un ikinci biçimi: adaptör uyarlanandan **kalıtır** ve hedef arayüzü **uygular**: `extends GlobalShipApi implements KargoFirmasi`. Java’da sınıflar tek kalıtımlı olduğundan hedefin bir **arayüz** olması şart. Tek nesne; çağrı `api.` olmadan **miras alınan** metoda gider.',
        k: 'sinif', ver: 'sınıf adaptörü', focus: 'GlobalShipSinifAdaptoru.java', marks: [['extends GlobalShipApi implements KargoFirmasi', 'focus'], ['long id = createShipment(', 'focus']],
        diag: { form: 'sinif', focus: { edges: ['ext', 'real'] } },
      },
      {
        t: 'Sızıntı: miras alınan metotlar da açık',
        x: 'Sınıf adaptörü uyarlananın **bütün public metotlarını** da miras alır. Aceleci bir geliştirici adaptör üzerinden `createShipment`’ı **doğrudan** çağırdı ve çeviriyi atladı: yine **12.00 lb**!',
        k: 'sizintiSinif', diff: 'sinif', ver: 'sınıf adaptörü · sızıntı', focus: 'Main.java', marks: [['adaptor.createShipment(', 'bad']],
        diag: { form: 'sinif', badges: [['Adaptor', 'createShipment() da açık', 'bad']], focus: { members: [['GlobalShipApi', 'createShipment']], edges: ['ext'] } },
      },
      {
        t: 'Nesne adaptörü kapıyı kapatır',
        x: 'Aynı satır nesne adaptöründe **derlenmez**: `GlobalShipAdaptoru`’nun böyle bir metodu yok. Uyarlanan adaptörün **içinde gizli**; dışarıya yalnızca hedef arayüzün metotları görünür.',
        k: 'sizintiNesne', diff: 'nesne', ver: 'nesne adaptörü · aynı satır', focus: 'Main.java', marks: [['adaptor.createShipment(', 'bad']],
        diag: { form: 'nesne', badges: [['Adaptor', 'yalnızca KargoFirmasi', 'same']], focus: { classes: ['Adaptor'], edges: ['comp'] } },
      },
      {
        t: 'Kütüphane final ise',
        x: 'Birçok kütüphane sınıflarını `final` yapar: kalıtıma kapalıdır. O zaman sınıf adaptörü **yazılamaz**: `cannot inherit from final GlobalShipApi`. Nesne adaptörü bundan hiç etkilenmez.',
        k: 'finalSinif', ver: 'sınıf adaptörü · final kütüphane', focus: 'GlobalShipApi.java', marks: [['public final class GlobalShipApi', 'bad']],
        diag: { form: 'sinif', badges: [['GlobalShipApi', 'final', 'bad'], ['Adaptor', '✗ derlenmez', 'bad']], focus: { edges: ['ext'] } },
      },
      {
        t: 'Karşılaştırma',
        x: 'Java’da **nesne adaptörü** varsayılan seçimdir: final sınıflarla da çalışır, uyarlananı gizler ve alt sınıflarını da sarabilir. Sınıf adaptörü tek nesneyle yetinir ve uyarlananın davranışını **ezmeyi** (override) kolaylaştırır.',
        k: 'finalNesne', ver: 'nesne adaptörü · final kütüphane', focus: 'GlobalShipAdaptoru.java', marks: [['private final GlobalShipApi api;', 'ok']],
        diag: { form: 'nesne', badges: [['GlobalShipApi', 'final', 'same'], ['Adaptor', '✓ çalışır', 'same']], focus: { edges: ['comp'] } },
        table: true,
      },
    ];

    const filesOf = (k) => {
      const F = SA.filesOf(k);
      const order = [SA.variants[k].form === 'sinif' ? 'GlobalShipSinifAdaptoru' : 'GlobalShipAdaptoru', 'Main', 'GlobalShipApi', 'KargoFirmasi', 'GonderiServisi', 'ShipmentRequest'];
      return order.map((n) => ({ name: n + '.java', code: F[n] }));
    };
    const asMap = (k) => {
      const F = SA.filesOf(k);
      const m = {};
      Object.keys(F).forEach((n) => (m[n + '.java'] = F[n]));
      return m;
    };

    let form = 'nesne';
    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: () => 7000,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        left.head.querySelector('.ver').textContent = s.ver;
        cv.setFiles(filesOf(s.k), { active: s.focus, prev: s.diff ? asMap(s.diff) : null, keepActive: false });
        s.marks.forEach(([spec, kind], j) => cv.mark(s.focus, spec, kind, { scroll: j === 0 }));
        const o = SA.output(s.k);
        const fresh = info.animate && (prev < 0 || !STEPS[prev] || STEPS[prev].k !== s.k);
        AD.renderConsole(
          consoleEl,
          o.cmd,
          o.lines.map((l) => (l.bad ? Object.assign({}, l, { note: 'çeviri atlandı!' }) : l)),
          { animateFrom: fresh ? 0 : null, title: o.compileError ? 'Derleyici' : 'Konsol' }
        );
        if (s.diag.form !== form) {
          form = s.diag.form;
          diagram.update(AD.gofDiagram({ form, notes: true }), { animate: info.animate });
        }
        diagram.clearBadges();
        diagram.clearFocus();
        (s.diag.badges || []).forEach((b) => diagram.badge(b[0], b[1], b[2]));
        if (s.diag.focus) diagram.focus(s.diag.focus);
        if (s.table) {
          extra.innerHTML = `
            <table class="cmp ad-cmp">
              <thead><tr><th></th><th>Nesne adaptörü</th><th>Sınıf adaptörü</th></tr></thead>
              <tbody>
                <tr><td>İlişki</td><td>Kompozisyon (sahiptir)</td><td>Kalıtım (bir türüdür)</td></tr>
                <tr><td>Nesne sayısı</td><td>2</td><td class="ok">1</td></tr>
                <tr><td>Uyarlananın metotları</td><td class="ok">Gizli</td><td class="bad">Dışarı sızar</td></tr>
                <tr><td><code>final</code> kütüphane</td><td class="ok">Çalışır</td><td class="bad">Yazılamaz</td></tr>
                <tr><td>Alt sınıfları da sarar</td><td class="ok">Evet</td><td class="bad">Hayır</td></tr>
                <tr><td>Davranışı ezmek (override)</td><td>Dolaylı</td><td class="ok">Kolay</td></tr>
                <tr><td>Java’da hedef</td><td>Arayüz ya da sınıf</td><td>Mutlaka arayüz</td></tr>
              </tbody>
            </table>`;
          if (info.animate) DP.flash(extra, 'is-pop');
        } else extra.innerHTML = '';
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };
})();
