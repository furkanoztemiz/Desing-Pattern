/*
 * Singleton — sahneler (3/3): Kırmak, Eleştiri, Gerçek Dünya, Quiz, Özet ve kalıp kaydı
 */
(function () {
  'use strict';
  const SG = DP.sg;
  const { h } = DP;
  const kit = DP.kit;
  const ui = SG.ui;
  const md = SG.md;
  const A = SG.attack;
  const AO = SG.attackOutput;

  // ================================================================== 7. KIRMAK
  /** Saldırı sahnesinin bellek çizimi: asıl nesne + (varsa) sahte/kopya. */
  function attackMem(o) {
    const rows = [{ id: 'asil', k: 'asil', ref: 'g1', tone: 2 }];
    if (o.second) {
      if (o.blocked) rows.push({ id: 'ikinci', k: o.second, v: '✗ engellendi', tone: 'ok' });
      else rows.push({ id: 'ikinci', k: o.second, ref: o.target || null, tone: o.target === 'g2' ? 'bad' : 2 });
    }
    const boxes = [
      { id: 'f-main', kind: 'frame', x: 26, y: 46, w: 268, title: 'main()', sub: o.prog, tone: 1, rows },
      { id: 'st', kind: 'static', x: 26, y: 382, w: 268, title: 'TakipNoUretici', sub: o.enumMode ? 'enum' : 'sınıf', tone: 2, rows: [{ id: 'f', k: o.enumMode ? 'INSTANCE' : 'static ornek', ref: 'g1', tone: 3 }] },
      { id: 'g1', kind: 'obj', x: 640, y: 96, w: 280, title: 'TakipNoUretici', sub: 'asıl nesne', tone: 2, rows: [{ id: 'sayac', k: 'sayac', v: '1000' }], badge: o.g1badge },
    ];
    if (o.g2) boxes.push({ id: 'g2', kind: 'obj', x: 640, y: 300, w: 280, title: 'TakipNoUretici', sub: o.g2.sub, tone: 2, state: o.g2.state, badge: o.g2.badge, rows: [{ id: 'sayac', k: 'sayac', v: '1000' }] });
    return { view: [0, 0, 1000, 520], regions: SG.memRegions, boxes, notes: o.notes || [] };
  }

  const PARTS = [
    { v: 'yansima', label: 'Yansıma', first: 0 },
    { v: 'serilestirme', label: 'Serileştirme', first: 3 },
    { v: 'enum', label: 'enum kalkanı', first: 6 },
  ];

  SG.scenes.breaking = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split' });
    const toolbar = h('div', { class: 'scene-toolbar' });
    const body = h('div', { class: 'scene-body cols-46' });
    el.append(toolbar, body);
    root.appendChild(el);
    const seg = kit.seg(PARTS.map((p) => ({ v: p.v, label: p.label })), 'yansima', (v) => stepper.go(PARTS.find((p) => p.v === v).first), { label: 'Saldırı' });
    toolbar.append(h('span', { class: 'tb-label' }, 'Saldırı:'), seg.el, h('span', { class: 'tb-spacer' }), h('span', { class: 'tb-hint', html: md('Private kurucu **derleyiciyi** durdurur — peki çalışma anını?') }));

    const left = kit.panel('Saldırı kodu', { cls: 'panel-code sg-left' });
    const right = kit.panel('Bellek', { cls: 'panel-side sg-right' });
    body.append(left.el, right.el);
    const cvHost = h('div', { class: 'sg-cv' });
    const consoleEl = h('div', { class: 'console sg-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: SG.roleOf, special: SG.special });
    const memHost = h('div', { class: 'sg-view' });
    const card = h('div', { class: 'sg-extra' });
    right.body.append(memHost, card);
    const mem = new SG.MemoryView(memHost);

    const Y = 'YansimaSaldirisi.java';
    const SZ = 'SerilestirmeSaldirisi.java';
    const T = 'TakipNoUretici.java';
    const files = (prog, progName, uretici, prevUretici) => ({ list: [{ name: progName, code: prog }, { name: T, code: uretici }], prev: prevUretici ? { [progName]: prog, [T]: prevUretici } : null });

    const STEPS = [
      {
        part: 'yansima', t: 'Kilidi zorlamak: yansıma',
        x: 'Kurucu `private`, ama Java’nın **yansıma** (*reflection*) API’si çalışma anında erişim kurallarını delebilir: `getDeclaredConstructor()` ile private kurucu bulunur, `setAccessible(true)` ile kilit açılır.',
        f: files(A.acik.yansima, Y, A.acik.uretici), active: Y, marks: ['getDeclaredConstructor()', 'kurucu.setAccessible(true)'], out: null,
        mem: attackMem({ prog: 'YansimaSaldirisi' }),
      },
      {
        part: 'yansima', t: 'Saldırı başarılı: ikinci nesne!',
        x: 'Kurucu **ikinci kez** çalıştı: konsolda iki “oluşturuldu” satırı ve `asil == sahte` → **false**. Tekliğin bekçisi derleyiciydi; yansıma derleyiciyi atlar.',
        f: files(A.acik.yansima, Y, A.acik.uretici), active: Y, marks: ['kurucu.newInstance()'], out: AO.acik.yansima, verdict: ['bad', 'Kırıldı: bellekte iki nesne'],
        mem: attackMem({ prog: 'YansimaSaldirisi', second: 'sahte', target: 'g2', g2: { sub: 'sahte nesne', state: 'bad', badge: 'ikinci nesne!' } }),
      },
      {
        part: 'yansima', t: 'Savunma: kurucuda kontrol',
        x: 'Kurucu, `ornek` zaten doluysa istisna fırlatıyor: saldırı engellendi. Zayıf nokta: saldırı **ilk** `getInstance()`’tan **önce** yapılırsa kontrol hiçbir şey göremez.',
        f: files(A.acik.yansima, Y, A.guardOnly, A.acik.uretici), active: T, marks: ['if (ornek != null)'], out: AO.korumali.yansima, verdict: ['ok', 'Korundu (kısmen): kurucu kontrolü'],
        mem: attackMem({ prog: 'YansimaSaldirisi', second: 'sahte', blocked: true }),
      },
      {
        part: 'serilestirme', t: 'Kopyala, geri oku: serileştirme',
        x: 'Sınıf `Serializable`. Nesneyi baytlara çevirip (`writeObject`) geri okumak (`readObject`) ne üretir? Dosyaya kaydetmek, ağdan göndermek, önbelleğe almak hep bunu yapar.',
        f: files(A.acik.serilestirme, SZ, A.guardOnly), active: SZ, marks: ['yaz.writeObject(asil)', 'oku.readObject()'], out: null,
        mem: attackMem({ prog: 'SerilestirmeSaldirisi' }),
      },
      {
        part: 'serilestirme', t: 'Kurucu çalışmadan doğan nesne',
        x: 'Konsolda **tek** “oluşturuldu” satırı var ama bellekte **iki** nesne: `readObject` kurucuyu **hiç çağırmadan** nesne üretir. Bu yüzden kurucudaki kontrol işe yaramadı!',
        f: files(A.acik.serilestirme, SZ, A.guardOnly), active: SZ, marks: ['oku.readObject()'], out: AO.acik.serilestirme, verdict: ['bad', 'Kırıldı: kurucu hiç çalışmadı'],
        mem: attackMem({ prog: 'SerilestirmeSaldirisi', second: 'kopya', target: 'g2', g2: { sub: 'kopya nesne', state: 'bad', badge: 'kurucusuz doğdu!' } }),
      },
      {
        part: 'serilestirme', t: 'Savunma: readResolve()',
        x: '`readResolve()` serileştirmenin son sözüdür: okunan kopya yerine **asıl** nesneyi döndürür. Kopya çöpe gider; `asil == kopya` → **true**.',
        f: files(A.acik.serilestirme, SZ, A.korumali.uretici, A.guardOnly), active: T, marks: ['private Object readResolve()'], out: AO.korumali.serilestirme, verdict: ['ok', 'Korundu: readResolve()'],
        mem: attackMem({ prog: 'SerilestirmeSaldirisi', second: 'kopya', target: 'g1', g2: { sub: 'okunan kopya', state: 'ghost', badge: 'çöpe gitti' } }),
      },
      {
        part: 'enum', t: 'enum kalkanı: yansıma',
        x: 'JVM, enum nesnelerinin yansımayla oluşturulmasını **kesinlikle** yasaklar: *Cannot reflectively create enum objects*. Tek satır savunma kodu yazmadık!',
        f: files(A.enumile.yansima, Y, A.enumile.uretici), active: Y, marks: ['kurucu.newInstance("SAHTE", 1)'], out: AO.enumile.yansima, verdict: ['ok', 'JVM korudu'],
        mem: attackMem({ prog: 'YansimaSaldirisi', enumMode: true, second: 'sahte', blocked: true }),
      },
      {
        part: 'enum', t: 'enum kalkanı: serileştirme',
        x: 'Enum sabitleri **adlarıyla** serileştirilir; geri okununca **aynı** sabit gelir. Ek kod yok. Bu turun kazananı: **enum**.',
        f: files(A.enumile.serilestirme, SZ, A.enumile.uretici), active: SZ, marks: ['oku.readObject()'], out: AO.enumile.serilestirme, verdict: ['ok', 'JVM korudu'], table: true,
        mem: attackMem({ prog: 'SerilestirmeSaldirisi', enumMode: true, second: 'kopya', target: 'g1' }),
      },
    ];

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: () => 6000,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        seg.set(s.part);
        cv.setFiles(s.f.list, { active: s.active, prev: s.f.prev, keepActive: false });
        s.marks.forEach((m, k) => cv.mark(s.active, m, 'focus', { scroll: k === 0 }));
        const prog = s.active === T ? s.f.list[0].name : s.active;
        SG.renderConsole(
          consoleEl,
          '$ java ' + prog.replace('.java', ''),
          s.out ? s.out.map((t) => ({ t, err: /false$/.test(t), ok: /engellendi|true$/.test(t) })) : [{ t: '(henüz çalıştırılmadı — → ile çalıştırın)', dim: true }],
          { animateFrom: info.animate && s.out ? 0 : null }
        );
        mem.update(s.mem, { animate: info.animate });
        const v = s.verdict;
        card.innerHTML =
          (v ? `<div class="sg-verdict-card is-${v[0]}">${v[0] === 'ok' ? '🛡' : '💥'} <b>${v[1]}</b></div>` : '') +
          (s.table
            ? `<table class="cmp sg-mini-cmp">
                <thead><tr><th>Saldırı</th><th>Sınıf tabanlı Singleton</th><th>enum</th></tr></thead>
                <tbody>
                  <tr><td>Yansıma</td><td>Kurucuda kontrol (kısmi koruma)</td><td class="ok">✓ JVM engeller</td></tr>
                  <tr><td>Serileştirme</td><td><code>readResolve()</code> yazılmalı</td><td class="ok">✓ kendiliğinden</td></tr>
                  <tr><td>Klonlama</td><td><code>Cloneable</code> uygulamayın</td><td class="ok">✓ enum klonlanamaz</td></tr>
                </tbody></table>`
            : '');
        if (info.animate && (v || s.table)) DP.flash(card, 'is-pop');
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };

  // ================================================================== 8. ELEŞTİRİ (test + bağımlılık enjeksiyonu)
  const ORDERS = [
    { v: 'A', label: 'Yalnız A' },
    { v: 'B', label: 'Yalnız B' },
    { v: 'AB', label: 'A → B' },
    { v: 'BA', label: 'B → A' },
  ];

  SG.scenes.critique = function (root, ctx) {
    const S = ctx.state;
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-50' });
    const left = kit.panel('Kod', { cls: 'panel-code' });
    const right = kit.panel('Test koşucusu', { cls: 'panel-side sg-runner' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);
    const cv = new DP.CodeView(left.body, { roleOf: SG.roleOf, special: SG.special });

    let mode = 'single';
    let order = 'AB';
    const modeSeg = kit.seg(
      [
        { v: 'single', label: 'Singleton' },
        { v: 'di', label: 'Bağımlılık enjeksiyonu (DI)' },
      ],
      mode,
      (v) => {
        mode = v;
        run(true);
      }
    );
    const orderSeg = kit.seg(ORDERS, order, (v) => {
      order = v;
      run(true);
    });
    const xray = h('div', { class: 'sg-xray' });
    const results = h('div', { class: 'sg-results' });
    const consoleEl = h('div', { class: 'console sg-console' });
    const extra = h('div', { class: 'sg-extra' });
    right.body.append(
      xray,
      h('div', { class: 'sg-runner-bar' }, h('span', { class: 'tb-label' }, 'Sürüm:'), modeSeg.el),
      h('div', { class: 'sg-runner-bar' }, h('span', { class: 'tb-label' }, 'Sıra:'), orderSeg.el),
      results,
      consoleEl,
      extra
    );

    function run(animate) {
      modeSeg.set(mode);
      orderSeg.set(order);
      const out = SG.testOutput(order, mode);
      const res = out.filter((l) => /^\[(GEÇTİ|KALDI)\]/.test(l.t));
      results.innerHTML = order
        .split('')
        .map((k, i) => {
          const r = res[i];
          const ok = r && r.ok;
          const got = (out.filter((l) => /için takip no:/.test(l.t))[i] || { t: '' }).t.split(': ').pop();
          return `<div class="sg-test ${ok ? 'is-ok' : 'is-bad'}${animate ? ' is-new' : ''}" style="animation-delay:${i * 0.25}s">
            <span class="sg-test-n">${i + 1}</span>
            <span class="sg-test-name">Test ${k} <small>${k === 'A' ? 'sipariş' : 'iade'}</small></span>
            <span class="sg-test-got">beklenen <code>KRG-1001</code> · gelen <code>${got}</code></span>
            <span class="sg-test-v">${ok ? '✓ GEÇTİ' : '✗ KALDI'}</span></div>`;
        })
        .join('');
      SG.renderConsole(consoleEl, `$ java UreticiTesti ${order.split('').join(' ')}`, out, { animateFrom: animate ? 0 : null });
    }

    const F = {
      single: [
        { name: 'SiparisServisi.java', code: SG.code.SiparisServisi },
        { name: 'UreticiTesti.java', code: SG.code.UreticiTesti },
        { name: 'TakipNoUretici.java', code: SG.code.TakipNoUretici },
      ],
      di: [
        { name: 'SiparisServisi.java', code: SG.di.SiparisServisi },
        { name: 'Main.java', code: SG.di.Main },
        { name: 'UreticiTesti.java', code: SG.di.UreticiTesti },
        { name: 'TakipNoUretici.java', code: SG.di.TakipNoUretici },
      ],
    };
    const prevDI = { 'SiparisServisi.java': SG.code.SiparisServisi, 'UreticiTesti.java': SG.code.UreticiTesti, 'TakipNoUretici.java': SG.code.TakipNoUretici };

    const STEPS = [
      { t: 'Gizli bağımlılık', x: '[[SiparisServisi]]’nin imzası `siparisAl(String yuk)`: üreticiye bağımlı olduğu **hiçbir yerde yazmıyor**. Bağımlılık gövdenin içine gizlenmiş — tıpkı global bir değişken gibi.', files: 'single', active: 'SiparisServisi.java', marks: [['public String siparisAl(String yuk)', 'focus'], ['TakipNoUretici.getInstance()', 'bad']], xray: true },
      { t: 'Test A tek başına: GEÇTİ', x: 'Yeni bir siparişin **KRG-1001** almasını bekleyen basit bir test. Tek başına çalışınca geçiyor ✓', files: 'single', active: 'UreticiTesti.java', marks: [['static void siparisTesti()', 'focus']], mode: 'single', order: 'A' },
      { t: 'Test B tek başına: GEÇTİ', x: 'İade testi de tek başına geçiyor ✓. Her şey yolunda görünüyor…', files: 'single', active: 'UreticiTesti.java', marks: [['static void iadeTesti()', 'focus']], mode: 'single', order: 'B' },
      { t: 'Birlikte çalışınca: A → B', x: 'Aynı JVM’de art arda çalışınca **B kaldı**: Singleton, A’dan kalan sayacı hatırlıyor (KRG-1002). Testler birbirini **etkiliyor**!', files: 'single', active: 'UreticiTesti.java', marks: [['new IadeServisi().iadeAl', 'bad']], mode: 'single', order: 'AB' },
      { t: 'Sıra değişince: B → A', x: 'Bu kez **A kaldı**. Tek başına geçen, birlikte kalan, sıraya göre değişen testler: **global durumun** bedeli. Hata ayıklaması en zor test türüdür.', files: 'single', active: 'UreticiTesti.java', marks: [['new SiparisServisi().siparisAl', 'bad']], mode: 'single', order: 'BA' },
      { t: 'Çözüm: bağımlılığı dışarıdan ver', x: 'Üretici artık **kurucudan** veriliyor; bağımlılık imzada görünür. Programda tek nesne olmasını sınıf değil [[Main]] sağlıyor: `new TakipNoUretici(1000)` **bir kez** yazılır, iki servise de aynı nesne verilir.', files: 'di', active: 'SiparisServisi.java', diff: true, marks: [['public SiparisServisi(TakipNoUretici uretici)', 'focus']], mode: 'di', order: 'AB' },
      { t: 'DI ile testler bağımsız', x: 'Her test kendine **taze** bir üretici veriyor: sıra ne olursa olsun ikisi de geçer ✓✓. Gerçek projelerde bu kurulumu Spring gibi bir **DI konteyneri** yapar.', files: 'di', active: 'UreticiTesti.java', diff: true, marks: [['new SiparisServisi(new TakipNoUretici(1000))', 'ok'], ['new IadeServisi(new TakipNoUretici(1000))', 'ok']], mode: 'di', order: 'BA' },
      { t: 'Ne zaman Singleton?', x: 'Singleton bir **araç**, varsayılan değil. Gerçekten tek olması gereken ve durumu az olan nesnelerde kullanın; iş mantığını global erişime bağlamayın.', files: 'di', active: 'Main.java', marks: [['new TakipNoUretici(1000)', 'focus']], mode: 'di', order: 'AB', when: true },
    ];

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: () => 6200,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        cv.setFiles(F[s.files], { active: s.active, prev: s.diff ? prevDI : null, keepActive: false });
        s.marks.forEach(([m, kind], k) => cv.mark(s.active, m, kind, { scroll: k === 0 }));
        xray.hidden = !s.xray;
        xray.innerHTML = s.xray
          ? `<div class="sg-xray-row"><span class="sg-xray-k">Dışarıdan görünen</span><code>public String siparisAl(String yuk)</code><span class="ok">“yalnızca bir yük alır”</span></div>
             <div class="sg-xray-row is-hidden-dep"><span class="sg-xray-k">İçeride saklı</span><code class="tk-fm">TakipNoUretici.getInstance()</code><span class="bad">global duruma bağlı!</span></div>`
          : '';
        if (s.mode) {
          mode = s.mode;
          order = s.order;
        }
        run(!!info.animate && !!s.mode);
        extra.innerHTML = s.when
          ? `<div class="sg-when">
              <div class="sg-when-col is-ok"><b>✓ Uygun</b><ul><li>Gerçekten tek olan kaynak: donanım, <code>Runtime</code>, yapılandırma okuyucu</li><li>Loglama, önbellek gibi <b>durumu az</b> altyapı nesneleri</li><li>Kütüphane içinde, dışa kapalı ayrıntılar</li></ul></div>
              <div class="sg-when-col is-bad"><b>✗ Kaçının</b><ul><li>“Her yerden erişeyim” için (global değişken kılığı)</li><li>Test edilmesi gereken <b>iş mantığı</b></li><li>İleride ikinci örnek gerekebilecek nesneler (ör. çok kiracılı sistem)</li></ul></div>
            </div>`
          : '';
        if (s.when && info.animate) DP.flash(extra, 'is-pop');
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };

  // ================================================================== 9. GERÇEK DÜNYA
  const runtimeCode = (arg) =>
    arg === 'new Runtime()'
      ? `public class RuntimeOrnegi {

    public static void main(String[] args) {
        Runtime r1 = new Runtime();   // olur mu?
        System.out.println(r1);
    }
}`
      : `public class RuntimeOrnegi {

    public static void main(String[] args) {
        Runtime r1 = Runtime.getRuntime();
        Runtime r2 = Runtime.getRuntime();
        System.out.println("Aynı nesne mi? " + (r1 == r2));
    }
}`;
  const rtErrLine = runtimeCode('new Runtime()').split('\n')[3];

  const getInstanceCode = (arg) => {
    const type = arg.split('.')[0];
    const pkg = type === 'Calendar' ? 'java.util' : 'java.text';
    const v = type === 'Calendar' ? 'c' : 'n';
    return `import ${pkg}.${type};

public class GetInstanceOrnegi {

    public static void main(String[] args) {
        ${type} ${v}1 = ${type}.getInstance();
        ${type} ${v}2 = ${type}.getInstance();
        System.out.println("Aynı nesne mi? " + (${v}1 == ${v}2));
        System.out.println(${v}1.getClass().getName());
    }
}`;
  };

  const RW = [
    {
      tab: 'Runtime',
      title: '`Runtime.getRuntime()` — JDK’nın kendi Singleton’ı',
      intro: 'Her Java programının **tek** bir çalışma ortamı vardır: bellek, işlemci sayısı, çıkış kancaları… JDK bunu klasik bir **erken** Singleton olarak yazar. Sağdaki ikinci düğme, kendimiz `new` demeyi deniyor.',
      map: [
        ['singleton', 'TakipNoUretici', '`java.lang.Runtime`'],
        ['instance', 'ornek', '`private static final Runtime currentRuntime = new Runtime();`'],
        ['ctor', 'TakipNoUretici()', '`private Runtime()`'],
        ['access', 'getInstance()', '`public static Runtime getRuntime()`'],
      ],
      note: 'JDK kaynağındaki bu üyeleri `javap -p java.lang.Runtime` komutuyla kendiniz görebilirsiniz. Çıktılar Java 21 ile alındı.',
      roles: { Runtime: 'singleton' },
      special: { getRuntime: 'fm' },
      file: 'RuntimeOrnegi.java',
      code: runtimeCode,
      options: [
        { label: 'getRuntime()', arg: 'Runtime.getRuntime()', out: ['Aynı nesne mi? true'] },
        { label: 'new Runtime()', arg: 'new Runtime()', out: ['RuntimeOrnegi.java:4: error: Runtime() has private access in Runtime', rtErrLine, ' '.repeat(rtErrLine.indexOf('new Runtime')) + '^', '1 error'] },
      ],
      cmd: '$ javac RuntimeOrnegi.java && java RuntimeOrnegi',
    },
    {
      tab: 'getInstance() ≠ Singleton',
      title: '`Calendar.getInstance()` — adı aldatmasın!',
      intro: 'JDK’da `getInstance()` adlı pek çok metot var ama çoğu Singleton **değildir**: her çağrıda **yeni** bir nesne döndüren *statik fabrika metotlarıdır* — Factory Method’un akrabası. Hangi alt sınıfın döneceğine de metot karar verir.',
      extraHtml: `<table class="cmp cmp-3">
        <thead><tr><th>Metot</th><th>Her çağrıda</th><th>Singleton mı?</th></tr></thead>
        <tbody>
          <tr><td><code>Runtime.getRuntime()</code></td><td>aynı nesne</td><td class="ok">✓ evet</td></tr>
          <tr><td><code>LogManager.getLogManager()</code></td><td>aynı nesne</td><td class="ok">✓ evet</td></tr>
          <tr><td><code>Collections.emptyList()</code></td><td>aynı (değişmez) nesne</td><td>paylaşılan sabit</td></tr>
          <tr><td><code>Calendar.getInstance()</code></td><td>yeni nesne</td><td class="bad">✗ fabrika metodu</td></tr>
          <tr><td><code>NumberFormat.getInstance()</code></td><td>yeni nesne</td><td class="bad">✗ fabrika metodu</td></tr>
        </tbody></table>`,
      note: 'Sınav klasiği: metodun **adı** değil **davranışı** önemlidir. Emin değilseniz iki çağrıyı `==` ile karşılaştırın. Çıktılar Java 21 ile alındı.',
      roles: { Calendar: 'client', NumberFormat: 'client' },
      special: { getInstance: 'fm' },
      file: 'GetInstanceOrnegi.java',
      code: getInstanceCode,
      options: [
        { label: 'Calendar', arg: 'Calendar.getInstance()', out: ['Aynı nesne mi? false', 'java.util.GregorianCalendar'] },
        { label: 'NumberFormat', arg: 'NumberFormat.getInstance()', out: ['Aynı nesne mi? false', 'java.text.DecimalFormat'] },
      ],
      cmd: '$ java GetInstanceOrnegi',
    },
    {
      tab: 'Loglama',
      title: '`Logger.getLogger(ad)` — isim başına tek nesne',
      intro: 'Loglama, Singleton’ın en klasik kullanım alanıdır: programın her yerinden **aynı** kayıt sistemine yazılır. `LogManager` gerçek bir Singleton’dır; `Logger.getLogger("ad")` ise **her isim için** tek nesne tutan bir *kayıt defteri* (registry) gibi çalışır. GoF, Singleton bölümünde bu “Singleton kayıt defteri” fikrinden de söz eder.',
      map: [
        ['singleton', 'TakipNoUretici', '`java.util.logging.LogManager`'],
        ['access', 'getInstance()', '`LogManager.getLogManager()` · isimliler için `Logger.getLogger(ad)`'],
        ['client', 'SiparisServisi', 'Log yazan her sınıf'],
      ],
      note: 'İsim başına tek örnek tutan bu yapıya bazen **Multiton** da denir. Çıktı Java 21 ile alındı.',
      roles: { Logger: 'singleton', LogManager: 'singleton' },
      special: { getLogger: 'fm', getLogManager: 'fm' },
      file: 'LoggerOrnegi.java',
      code: () => `import java.util.logging.LogManager;
import java.util.logging.Logger;

public class LoggerOrnegi {

    public static void main(String[] args) {
        Logger a = Logger.getLogger("lojistik");
        Logger b = Logger.getLogger("lojistik");
        Logger c = Logger.getLogger("muhasebe");
        System.out.println("a == b ? " + (a == b));
        System.out.println("a == c ? " + (a == c));
        System.out.println("LogManager tek mi? " + (LogManager.getLogManager() == LogManager.getLogManager()));
    }
}`,
      mark: 'Logger b = Logger.getLogger("lojistik")',
      out: ['a == b ? true', 'a == c ? false', 'LogManager tek mi? true'],
      cmd: '$ java LoggerOrnegi',
    },
    {
      tab: 'Spring (DI)',
      title: 'Spring: “singleton” kapsamı — ama GoF Singleton değil',
      intro: 'Spring’de `@Service` gibi bileşenler varsayılan olarak **singleton kapsamındadır**: konteyner her sınıftan **bir** nesne oluşturur ve ihtiyaç duyan herkese **kurucudan** verir. Sınıfın kendisi sıradandır: public kurucu, static alan yok → test etmek kolay.',
      map: [
        ['singleton', 'TakipNoUretici', 'Sıradan bir `@Service` sınıfı'],
        ['access', 'getInstance()', 'Yok! Konteyner nesneyi **enjekte eder**'],
        ['client', 'SiparisServisi', 'Bağımlılığı kurucusunda **alan** sınıf'],
      ],
      note: 'Teklik **konteyner başınadır**: aynı JVM’de iki konteyner iki nesne demektir. “Eleştiri” sahnesindeki DI çözümünün endüstriyel hâli budur. (Spring gerektirdiği için çıktı gösterilmiyor.)',
      roles: { TakipNoUretici: 'singleton', SiparisServisi: 'client' },
      special: {},
      file: 'Spring · özet',
      code: () => `@Service                        // Spring: varsayılan kapsam = singleton
public class TakipNoUretici {

    private int sayac = 1000;

    public String yeniNumara() {
        sayac++;
        return "KRG-" + sayac;
    }
}

@Service
public class SiparisServisi {

    private final TakipNoUretici uretici;

    public SiparisServisi(TakipNoUretici uretici) {   // konteyner enjekte eder
        this.uretici = uretici;
    }
}`,
      mark: '@Service                        // Spring',
    },
    {
      tab: 'Karıştırmayın!',
      title: 'Singleton mı, static sınıf mı, DI mı?',
      intro: '“Tek bir şey olsun” ihtiyacının üç yaygın cevabı var. Farklarını bilmek hem tasarımda hem sınavda işe yarar:',
      extraHtml: `<table class="cmp cmp-3">
        <thead><tr><th></th><th>Singleton</th><th>static sınıf (<code>Math</code>)</th><th>DI ile tek nesne</th></tr></thead>
        <tbody>
          <tr><td>Nesne var mı?</td><td>Evet, bir tane</td><td>Hayır, yalnızca static metotlar</td><td>Evet, bir tane</td></tr>
          <tr><td>Arayüz uygular / parametre olur</td><td class="ok">✓</td><td class="bad">✗</td><td class="ok">✓</td></tr>
          <tr><td>Tembel oluşturma</td><td class="ok">✓ istenirse</td><td>—</td><td>konteynere bağlı</td></tr>
          <tr><td>Testte değiştirmek</td><td class="bad">zor</td><td class="bad">çok zor</td><td class="ok">kolay</td></tr>
          <tr><td>Tipik örnek</td><td><code>Runtime</code></td><td><code>Math</code>, <code>Collections</code></td><td>Spring bileşenleri</td></tr>
        </tbody></table>`,
      note: 'Durum yoksa ve yalnızca yardımcı metotlar varsa **static sınıf**; test edilebilirlik önemliyse **DI**; gerçekten tek olan, kütüphane düzeyindeki kaynaklar için **Singleton**.',
      roles: { Runtime: 'singleton' },
      special: { getRuntime: 'fm' },
      file: 'Karsilastirma.java',
      code: () => `// static sınıf: nesne yok, yalnızca yardımcı metotlar
int buyuk = Math.max(3, 5);

// Singleton: tek bir NESNE (arayüz uygulayabilir, parametre olarak verilebilir)
Runtime calismaOrtami = Runtime.getRuntime();
int islemci = calismaOrtami.availableProcessors();

// DI: nesneyi dışarıdan al (test ederken sahtesini verebilirsin)
SiparisServisi siparis = new SiparisServisi(new TakipNoUretici(1000));`,
      mark: 'Runtime calismaOrtami = Runtime.getRuntime();',
    },
  ];

  SG.scenes.realworld = (root, ctx) =>
    kit.realWorldScene(root, ctx, {
      tabs: RW,
      roles: SG.roles,
      roleOf: SG.roleOf,
      mapHead: ['Parça', 'Bizim örnek', 'Java’da'],
      footText: (i) =>
        i === 1
          ? '`getInstance()` adını görünce hemen “Singleton” demeyin: iki çağrıyı **karşılaştırın**.'
          : i === 4
          ? 'Benzer görünen üç yaklaşımı ayırt etmek sınavda puan kazandırır.'
          : 'Kendi örneğimizdeki parçaları Java dünyasında bulun. Sağdaki düğmelerle başka bir deneme yapın.',
    });

  // ================================================================== 10. QUIZ
  const RACE = SG.race.variants.korumasiz.code;
  const Q = [
    {
      type: 'mcq',
      q: 'Singleton kalıbının verdiği **iki söz** hangisidir?',
      options: ['Nesne **ailesi** üretmek ve ailenin tutarlılığını korumak', 'Sınıfın **tek örneği** olması ve ona **global bir erişim noktası**', 'Karmaşık bir nesneyi adım adım kurmak', 'Var olan bir nesneyi kopyalayarak çoğaltmak'],
      answer: 1,
      explain: 'GoF: “Bir sınıfın yalnızca tek örneği olmasını garanti et ve ona global bir erişim noktası sağla.” Diğerleri Abstract Factory, Builder ve Prototype’ın amaçlarıdır.',
    },
    {
      type: 'line',
      q: 'Sınıfın dışından `new TakipNoUretici()` yazılmasını **engelleyen** satıra tıklayın.',
      codeName: 'TakipNoUretici.java',
      code: SG.code.TakipNoUretici,
      answer: 'private TakipNoUretici()',
      explain: 'Kurucu `private` olunca sınıf dışındaki her `new` **derleme hatası** verir. Tekliğin bekçisi derleyicidir.',
    },
    {
      type: 'mcq',
      q: '`ornek` alanı neden **static** tanımlanır?',
      options: ['Program daha hızlı çalışsın diye', 'Serileştirmeyi engellemek için', 'Alan nesneye değil **sınıfa** ait olmalı: tek kopyası olsun ve static `getInstance()` ona nesne yokken ulaşabilsin', 'Java her alanın static olmasını zorunlu kılar'],
      answer: 2,
      explain: 'Static alanın programda tek kopyası vardır. `getInstance()` da static olduğu için elde hiç nesne yokken bu alana bakıp nesneyi oluşturabilir.',
    },
    {
      type: 'line',
      q: 'İki thread aynı anda çağırdığında **yarışın başladığı** satıra tıklayın (korumasız sürüm).',
      codeName: 'TakipNoUretici.java',
      code: RACE,
      answer: 'if (ornek == null)',
      explain: '“Kontrol et” (`ornek == null`?) ve “yap” (`new`) iki ayrı adımdır. İki thread de kontrolü geçip ikisi de nesne oluşturabilir (*check-then-act*).',
    },
    {
      type: 'mcq',
      q: 'Çift kontrollü kilitte (*double-checked locking*) `volatile` ne işe yarar?',
      options: ['Kilidi tamamen gereksiz kılar', 'Nesneyi serileştirmeye karşı korur', 'Başka bir thread’in **yarım kurulmuş** nesneyi görmesine yol açan yeniden sıralamayı engeller', 'Sınıfın erken yüklenmesini sağlar'],
      answer: 2,
      explain: '`new` = bellek ayır + kurucuyu çalıştır + adresi ata. `volatile` olmadan son ikisi yer değiştirebilir; 1. kontrol dolu bir referans görüp yarım nesneyi kullanabilir.',
    },
    {
      type: 'mcq',
      q: 'Hangi yazım yansıma **ve** serileştirme saldırılarına karşı **kendiliğinden** dayanıklıdır?',
      options: ['Tek elemanlı **enum**', '`synchronized` getInstance()', 'Holder (iç sınıf)', 'Çift kontrollü kilit'],
      answer: 0,
      explain: 'JVM enum nesnelerinin yansımayla oluşturulmasını yasaklar ve serileştirmede aynı sabiti döndürür. Sınıf tabanlı yazımlar için kurucu kontrolü ve `readResolve()` yazmak gerekir.',
    },
    {
      type: 'mcq',
      q: '`Calendar.getInstance() == Calendar.getInstance()` ifadesinin sonucu nedir?',
      options: ['`true` — çünkü adı getInstance', '**false** — her çağrıda yeni nesne döndüren bir statik fabrika metodudur', 'Derleme hatası', 'İlk çağrıda false, sonrakilerde true'],
      answer: 1,
      explain: 'Calendar.getInstance() her çağrıda yeni bir `GregorianCalendar` döndürür (Java 21 ile doğrulandı). Metodun adı Singleton olduğunu göstermez.',
    },
    {
      type: 'mcq',
      q: 'Singleton kullanan iki test **tek başına geçiyor**, art arda çalışınca biri **kalıyor**. En iyi çözüm hangisi?',
      options: ['Testleri hep aynı sırada çalıştırmak', 'Bağımlılığı kurucudan vermek (**DI**) ve testte taze nesne kullanmak', 'Singleton’a public bir `reset()` metodu eklemek', 'Testleri silmek'],
      answer: 1,
      explain: 'Asıl sorun gizli **global durum**. `reset()` bir yamadır ve üretim kodunu test için kirletir; DI ile her test kendi nesnesini alır, sıra fark etmez.',
    },
  ];

  const MATCH_ITEMS = [
    ['k1', 'if (ornek == null) ornek = new …', 'unsafe'],
    ['k2', 'synchronized getInstance()', 'lazy'],
    ['k3', 'Çift kontrol, volatile YOK', 'unsafe'],
    ['k4', 'Çift kontrol + volatile', 'lazy'],
    ['k5', 'static final ORNEK = new …', 'eager'],
    ['k6', 'Holder: return Tutucu.ORNEK', 'lazy'],
    ['k7', 'enum { INSTANCE }', 'eager'],
  ];

  SG.scenes.quiz = (root, ctx) =>
    kit.quizScene(root, ctx, {
      questions: Q,
      roleOf: SG.roleOf,
      special: SG.special,
      patternName: 'Singleton',
      match: {
        title: 'Yazımları gruplarına taşıyın',
        prompt: 'Her Singleton yazımını doğru gruba **sürükleyin** (ya da önce yazıma, sonra gruba tıklayın).',
        poolLabel: 'Yazımlar',
        items: MATCH_ITEMS.map(([id, label]) => ({ id, label })),
        buckets: [
          { id: 'unsafe', title: 'Thread-safe değil', sub: 'yarış ya da yarım nesne riski', color: 'bad' },
          { id: 'lazy', title: 'Güvenli · tembel', sub: 'ilk kullanımda oluşur', color: 4 },
          { id: 'eager', title: 'Güvenli · erken', sub: 'sınıf başlatılınca oluşur', color: 2 },
        ],
        answer: Object.fromEntries(MATCH_ITEMS.map(([id, , b]) => [id, b])),
        hint: 'Yedi yazımı üç gruba yerleştirin. İpucu: **Thread Yarışı** sahnesindeki karşılaştırma tablosu.',
      },
    });

  // ================================================================== 11. ÖZET
  SG.scenes.summary = function (root, ctx) {
    const el = h('div', { class: 'scene scene-summary' });
    el.innerHTML = `
      <div class="sum-head">
        <div>
          <div class="chips"><span class="chip chip-cat">Yaratımsal · Creational</span><span class="chip">GoF’un en küçük kalıbı</span></div>
          <h1>Singleton — Özet</h1>
        </div>
        <div class="sum-actions no-print">
          <button class="btn btn-ghost" type="button" data-print>🖨 Yazdır / PDF</button>
          <a class="btn btn-ghost" href="#/abstract-factory/ozet">← Abstract Factory özeti</a>
          <a class="btn btn-ghost" href="#/">Tüm kalıplar</a>
          ${DP.patterns.builder ? '<a class="btn btn-primary" href="#/builder">Sıradaki kalıp: Builder →</a>' : ''}
        </div>
      </div>
      <div class="sum-grid">
        <article class="card sum-intent">
          <h3>Amaç</h3>
          <p>Bir sınıfın yalnızca <b>tek bir örneği</b> olmasını garanti et ve bu örneğe <b>global bir erişim noktası</b> sağla.</p>
          <div class="sum-formula"><code>private</code> kurucu + <code class="tk-sgi">private static</code> alan + <code class="tk-fm">public static getInstance()</code> = Singleton</div>
        </article>
        <article class="card sum-uml"><h3>Yapı</h3><div class="sum-diag"></div></article>
        <article class="card">
          <h3>Üç parça</h3>
          <ul class="sum-roles">
            <li>${ui.roleChip('ctor')}<span>dışarıdan <code>new</code> denemez (derleyici korur)</span></li>
            <li>${ui.roleChip('instance')}<span>tek nesnenin yeri (sınıfa ait)</span></li>
            <li>${ui.roleChip('access')}<span>yoksa oluştur, hep aynısını döndür</span></li>
            <li>${ui.roleChip('client')}<span>yalnızca <code>getInstance()</code> ile ister</span></li>
          </ul>
        </article>
        <article class="card">
          <h3>Thread-safe yazımlar</h3>
          <table class="cmp sg-sum-cmp">
            <tbody>
              <tr><td>Korumasız <code>if (null)</code></td><td class="bad">✗ yarış</td></tr>
              <tr><td><code>synchronized</code> metot</td><td class="ok">✓ ama her çağrıda kilit</td></tr>
              <tr><td>Çift kontrol + <code>volatile</code></td><td class="ok">✓ dikkat ister</td></tr>
              <tr><td>Erken <code>static final</code></td><td class="ok">✓ basit</td></tr>
              <tr><td>Holder (iç sınıf)</td><td class="ok">✓ tembel + kilitsiz</td></tr>
              <tr><td><code>enum</code></td><td class="ok">✓ en sağlam</td></tr>
            </tbody>
          </table>
        </article>
        <article class="card sum-pros">
          <h3>Artıları</h3>
          <ul>
            <li><b>Tek nesne garantisi</b> — derleyici korur</li>
            <li>Ortak kaynağa <b>kontrollü erişim</b></li>
            <li><b>Tembel oluşturma</b>: gerekene kadar maliyet yok</li>
            <li>Kaynak tasarrufu (tek bağlantı, tek önbellek…)</li>
          </ul>
        </article>
        <article class="card sum-cons">
          <h3>Eksileri</h3>
          <ul>
            <li><b>Global durum</b>: bağımlılık imzada görünmez</li>
            <li><b>Test zorluğu</b>: testler birbirini etkiler</li>
            <li>Çok thread’de dikkat; yansıma/serileştirme ile kırılabilir (enum hariç)</li>
            <li>SRP: sınıf hem işini hem kendi yaşam döngüsünü yönetir</li>
          </ul>
        </article>
        <article class="card">
          <h3>İlişkili kalıplar</h3>
          <ul>
            <li><b>Abstract Factory, Builder, Prototype:</b> çoğu zaman tek örnek olarak kullanılır.</li>
            <li><b>Facade:</b> tek bir giriş nesnesi çoğu zaman yeterlidir.</li>
            <li><b>Flyweight:</b> paylaşılan nesneler; Singleton’ın “çok sayıda tek” hâli.</li>
            <li><b>Bağımlılık enjeksiyonu:</b> tek nesneyi sınıf yerine kurulum kodu sağlar.</li>
          </ul>
        </article>
        <article class="card sum-tip">
          <h3>Sınav ipuçları</h3>
          <pre class="mini-code">TakipNoUretici a = TakipNoUretici.getInstance();
TakipNoUretici b = TakipNoUretici.getInstance();
a == b   // true: aynı nesne</pre>
          <p class="exam"><b>“Tek örnek + global erişim”</b> → Singleton · güvenli yazım: <b>Holder</b> ya da <b>enum</b> · <code>getInstance()</code> adı her zaman Singleton demek değildir (<code>Calendar</code>!)</p>
        </article>
        <article class="card sum-files">
          <h3>Java kodları</h3>
          <p>Çalıştırılabilir örnekler proje klasöründe:</p>
          <pre class="mini-code">java/singleton/sorun    → kalıpsız: aynı numara iki kez
java/singleton/cozum    → tembel Singleton + UreticiTesti
java/singleton/di       → bağımlılık enjeksiyonu sürümü
java/singleton/yaris/*  → altı yazım, iki thread’li deney
java/singleton/kirmak/* → yansıma ve serileştirme saldırıları</pre>
          <p>Derleyip çalıştırmak için <code>java/README.md</code> dosyasına bakın.</p>
        </article>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-print]').addEventListener('click', () => window.print());
    const diag = new DP.ClassDiagram(el.querySelector('.sum-diag'), SG.diagram({ note: true }), { roles: SG.roles, roleTags: false, mode: 'generic' });
    diag.svg.classList.add('is-compact');
    return { destroy() {} };
  };

  // ================================================================== kayıt
  DP.register({
    id: 'singleton',
    name: 'Singleton',
    tr: 'Tekil Nesne',
    category: 'creational',
    roleOf: SG.roleOf,
    initialState: () => ({
      view: 'stage',
      showCode: true,
      race: 'korumasiz',
      quiz: { results: {}, match: false },
    }),
    scenes: [
      { id: 'giris', title: 'Giriş', mount: SG.scenes.intro },
      { id: 'sorun', title: 'Sorun', mount: SG.scenes.problem },
      { id: 'cozum', title: 'Çözüm', mount: SG.scenes.solution },
      { id: 'yapi', title: 'Yapı (UML)', mount: SG.scenes.structure },
      { id: 'akis', title: 'Canlı Akış', mount: SG.scenes.flow, star: true },
      { id: 'yaris', title: 'Thread Yarışı', mount: SG.scenes.race, star: true },
      { id: 'kirmak', title: 'Kırmak', mount: SG.scenes.breaking },
      { id: 'elestiri', title: 'Eleştiri', mount: SG.scenes.critique },
      { id: 'gercek', title: 'Gerçek Dünya', mount: SG.scenes.realworld },
      { id: 'quiz', title: 'Quiz', mount: SG.scenes.quiz },
      { id: 'ozet', title: 'Özet', mount: SG.scenes.summary },
    ],
  });
})();
