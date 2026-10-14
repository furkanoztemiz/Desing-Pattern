/*
 * Singleton — sahneler (2/3): CANLI AKIŞ ve THREAD YARIŞI
 *   Canlı Akış   : tembel Singleton'ın çalışması dört görünümde (sahne, bellek, sıralama, sınıf diyagramı);
 *                  sağda Java kodu (aktif satır + iz), çağrı yığını ve konsol.
 *   Thread Yarışı: iki thread aynı anda getInstance() çağırınca ne olur? Altı gerçekleştirim adım adım;
 *                  kodda T1/T2 imleçleri, ortada zaman çizelgesi, sağda bellek ve kilit.
 */
(function () {
  'use strict';
  const SG = DP.sg;
  const { h } = DP;
  const kit = DP.kit;
  const ui = SG.ui;
  const md = SG.md;
  const C = SG.cargo;

  // ================================================================== 5. CANLI AKIŞ
  const R1 = { no: 'KRG-1001', cargo: C.s1, src: 'Sipariş' };
  const R2 = { no: 'KRG-1002', cargo: C.s2, src: 'Sipariş' };
  const R3 = { no: 'KRG-1003', cargo: C.r1, src: 'İade' };
  const D2 = { sip: true, iade: true };

  function flowSteps() {
    const M = 'Main.java';
    const SIP = 'SiparisServisi.java';
    const IADE = 'IadeServisi.java';
    const T = 'TakipNoUretici.java';
    const fMain = { t: 'Main.main()', cls: 'Main' };
    const fSip = { t: 'SiparisServisi.siparisAl()', cls: 'SiparisServisi' };
    const fIade = { t: 'IadeServisi.iadeAl()', cls: 'IadeServisi' };
    const fGet = { t: 'TakipNoUretici.getInstance()', cls: 'TakipNoUretici' };
    const fNew = { t: 'new TakipNoUretici()', cls: 'TakipNoUretici' };
    const fNum = { t: 'TakipNoUretici.yeniNumara()', cls: 'TakipNoUretici' };
    const st = (o) => Object.assign({ mode: 'single', desks: D2, machines: {}, board: [] }, o);
    const mem = (o) => Object.assign({ mode: 'single', main: { siparis: 1, iade: 1 }, services: ['sip', 'iade'], gens: {}, ornek: null }, o);
    const g = (sayac, extra) => ({ g1: Object.assign({ sayac }, extra || {}) });
    const call = (title, sub, rows) => ({ title, sub, rows });
    const yuk = (y) => ({ id: 'yuk', k: 'yuk', v: '"' + y + '"' });
    const no = (n) => ({ id: 'no', k: 'no', v: '"' + n + '"', tone: 4 });

    return [
      {
        t: 'Program başlıyor',
        x: 'Sınıf yüklendi ama `ornek` alanı **null**: henüz hiç üretici yok. Static alanlar nesneye değil **sınıfa** aittir; programın başından beri oradadır.',
        code: [M, 'public static void main'], stack: [fMain], out: 0, seq: -1, uml: null,
        stage: st({ desks: {}, bubble: { at: 'left', text: 'Kaide boş: `ornek == null`. Makine **ilk ihtiyaç anında** gelecek.' } }),
        mem: mem({ main: {}, services: [], activeFrame: 'main' }),
      },
      {
        t: 'Masalar açılıyor',
        x: '`new SiparisServisi()` ve `new IadeServisi()`. Dikkat: servisler artık **kendi üreticilerini oluşturmuyor** — üretici hâlâ yok.',
        code: [M, ['SiparisServisi siparis = new', 'IadeServisi iade = new']], stack: [fMain], out: 0, seq: 1,
        uml: { classes: ['SiparisServisi', 'IadeServisi'] },
        stage: st({}),
        mem: mem({ activeFrame: 'main' }),
      },
      {
        t: 'İlk sipariş geldi',
        x: '`siparis.siparisAl("20 ton kayısı")` — Sipariş masası bir takip numarasına ihtiyaç duyuyor.',
        code: [M, `siparis.siparisAl("${C.s1}")`], stack: [fMain, fSip], out: 0, seq: 2,
        uml: { members: [['SiparisServisi', 'siparisAl']] },
        stage: st({ active: 'sip', pkg: { sip: { cargo: C.s1 } } }),
        mem: mem({ frame: call('siparisAl()', 'SiparisServisi', [yuk(C.s1)]) }),
      },
      {
        t: 'getInstance() çağrılıyor',
        x: 'Masa üreticiyi **oluşturmuyor**, sınıftan **istiyor**: `TakipNoUretici.getInstance()`. Static metot: elde nesne yokken sınıf adıyla çağrılır.',
        code: [SIP, 'TakipNoUretici.getInstance()'], stack: [fMain, fSip, fGet], out: 0, seq: 3,
        uml: { members: [['TakipNoUretici', 'getInstance']], edges: ['uses-sip'] },
        stage: st({ active: 'sip', pkg: { sip: { cargo: C.s1 } }, call: { from: 'sip', to: 'a', label: 'getInstance()' } }),
        mem: mem({ frame: call('siparisAl()', 'SiparisServisi', [yuk(C.s1)]) }),
      },
      {
        t: 'ornek == null? → EVET',
        x: 'İlk çağrı: `ornek` hâlâ **null**. Demek ki nesne şimdi oluşturulacak.',
        code: [T, 'if (ornek == null)'], stack: [fMain, fSip, fGet], out: 0, seq: 3,
        uml: { members: [['TakipNoUretici', 'ornek']] },
        stage: st({ active: 'sip', pkg: { sip: { cargo: C.s1 } }, call: { from: 'sip', to: 'a', label: 'getInstance()' }, check: 'yes' }),
        mem: mem({ frame: call('siparisAl()', 'SiparisServisi', [yuk(C.s1)]), hl: { ornek: true } }),
      },
      {
        t: 'Tek nesne doğuyor',
        x: '`ornek = new TakipNoUretici()` — private kurucu **sınıfın içinden** çağrılabiliyor. Kurucu mesajını yazdı ve nesne `ornek` alanına yerleşti. Bu satır programda **yalnızca bir kez** çalışacak.',
        code: [T, 'ornek = new TakipNoUretici();'], stack: [fMain, fSip, fGet, fNew], out: 1, seq: 4,
        uml: { members: [['TakipNoUretici', 'ctor'], ['TakipNoUretici', 'ornek']], edges: ['self'] },
        stage: st({ active: 'sip', pkg: { sip: { cargo: C.s1 } }, machines: { a: { count: 1000 } }, pop: 'a', bubble: { at: 'left', text: 'İlk çağrı → nesne **şimdi** doğdu (tembel oluşturma).' } }),
        mem: mem({ frame: call('siparisAl()', 'SiparisServisi', [yuk(C.s1)]), gens: g(1000, { badge: 'YENİ' }), ornek: 'g1', hl: { ornek: true } }),
      },
      {
        t: 'Numara: KRG-1001',
        x: '`getInstance()` nesneyi döndürdü; `yeniNumara()` sayacı 1001 yaptı. Fiş pakete yapıştı, panoya işlendi.',
        code: [T, 'sayac++;'], stack: [fMain, fSip, fNum], out: 2, seq: 6,
        uml: { members: [['TakipNoUretici', 'yeniNumara']] },
        stage: st({ active: 'sip', machines: { a: { count: 1001 } }, tick: 'a', call: { from: 'sip', to: 'a', label: 'yeniNumara()' }, ticket: { from: 'a', to: 'sip', no: 'KRG-1001' }, pkg: { sip: { cargo: C.s1, no: 'KRG-1001' } }, board: [R1] }),
        mem: mem({ frame: call('siparisAl()', 'SiparisServisi', [yuk(C.s1), no('KRG-1001')]), gens: g(1001), ornek: 'g1' }),
      },
      {
        t: 'İkinci sipariş: nesne zaten var',
        x: 'Yine `getInstance()`. Bu kez `ornek == null`? **Hayır** → yeni nesne yok, **var olanı** döndür.',
        code: [T, 'return ornek;'], stack: [fMain, fSip, fGet], out: 2, seq: 9,
        uml: { members: [['TakipNoUretici', 'getInstance']], edges: ['uses-sip'] },
        stage: st({ active: 'sip', machines: { a: { count: 1001 } }, reuse: 'a', check: 'no', call: { from: 'sip', to: 'a', label: 'getInstance()' }, pkg: { sip: { cargo: C.s2 } }, board: [R1] }),
        mem: mem({ frame: call('siparisAl()', 'SiparisServisi', [yuk(C.s2)]), gens: g(1001), ornek: 'g1', hl: { ornek: true } }),
      },
      {
        t: 'KRG-1002',
        x: 'Aynı nesnenin sayacı ilerledi: **KRG-1002**.',
        code: [T, 'sayac++;'], stack: [fMain, fSip, fNum], out: 3, seq: 10,
        uml: { members: [['TakipNoUretici', 'yeniNumara']] },
        stage: st({ active: 'sip', machines: { a: { count: 1002 } }, tick: 'a', call: { from: 'sip', to: 'a', label: 'yeniNumara()' }, ticket: { from: 'a', to: 'sip', no: 'KRG-1002' }, pkg: { sip: { cargo: C.s2, no: 'KRG-1002' } }, board: [R1, R2] }),
        mem: mem({ frame: call('siparisAl()', 'SiparisServisi', [yuk(C.s2), no('KRG-1002')]), gens: g(1002), ornek: 'g1' }),
      },
      {
        t: 'İade masası da aynı makineye gidiyor',
        x: '[[IadeServisi]] de `getInstance()` diyor ve **aynı** nesneyi alıyor. Kalıpsız sürümdeki ikinci makine yok!',
        code: [IADE, 'TakipNoUretici.getInstance()'], stack: [fMain, fIade, fGet], out: 3, seq: 13,
        uml: { classes: ['IadeServisi'], edges: ['uses-iade'] },
        stage: st({ active: 'iade', machines: { a: { count: 1002 } }, reuse: 'a', check: 'no', call: { from: 'iade', to: 'a', label: 'getInstance()' }, pkg: { sip: { cargo: C.s2, no: 'KRG-1002' }, iade: { cargo: C.r1 } }, board: [R1, R2] }),
        mem: mem({ frame: call('iadeAl()', 'IadeServisi', [yuk(C.r1)]), gens: g(1002), ornek: 'g1', hl: { ornek: true } }),
      },
      {
        t: 'KRG-1003 — çakışma yok!',
        x: 'İade gönderisi **KRG-1003** aldı. Tek sayaç olduğu için numaralar **asla** çakışmaz.',
        code: [T, 'sayac++;'], stack: [fMain, fIade, fNum], out: 4, seq: 14,
        uml: { members: [['TakipNoUretici', 'yeniNumara']] },
        stage: st({ active: 'iade', machines: { a: { count: 1003 } }, tick: 'a', call: { from: 'iade', to: 'a', label: 'yeniNumara()' }, ticket: { from: 'a', to: 'iade', no: 'KRG-1003' }, pkg: { sip: { cargo: C.s2, no: 'KRG-1002' }, iade: { cargo: C.r1, no: 'KRG-1003' } }, board: [R1, R2, R3], bubble: { at: 'board', text: '✓ Üç gönderi, üç farklı numara.', tone: 'ok' } }),
        mem: mem({ frame: call('iadeAl()', 'IadeServisi', [yuk(C.r1), no('KRG-1003')]), gens: g(1003), ornek: 'g1' }),
      },
      {
        t: 'a == b → true',
        x: '`main` iki kez `getInstance()` istedi: `a` ve `b` **aynı** nesneyi gösteriyor (`==` aynı nesne mi diye bakar). Kaç kez sorulursa sorulsun cevap tek nesne.',
        code: [M, 'System.out.println("Aynı nesne mi? "'], stack: [fMain], out: 5, seq: 16,
        uml: { members: [['TakipNoUretici', 'getInstance']] },
        stage: st({ machines: { a: { count: 1003 } }, reuse: 'a', pkg: { sip: { cargo: C.s2, no: 'KRG-1002' }, iade: { cargo: C.r1, no: 'KRG-1003' } }, board: [R1, R2, R3], bubble: { at: 'left', text: '`a == b` → **true**: hep **aynı** nesne.', tone: 'ok' } }),
        mem: mem({ main: { siparis: 1, iade: 1, a: 'g1', b: 'g1' }, gens: g(1003, { badge: 'a == b ✓' }), ornek: 'g1', activeFrame: 'main' }),
      },
    ];
  }

  const FLOW_DELAYS = [3600, 4200, 3600, 4400, 4000, 5200, 4600, 4800, 3600, 4800, 4400, 4600];

  SG.scenes.flow = function (root, ctx) {
    const S = ctx.state;
    const el = h('div', { class: 'scene scene-flow' });
    const toolbar = h('div', { class: 'scene-toolbar' });
    const body = h('div', { class: 'flow-body' + (S.showCode === false ? ' hide-code' : '') });
    el.append(toolbar, body);
    root.appendChild(el);

    const viewSeg = kit.seg(
      [
        { v: 'stage', label: 'Sahne' },
        { v: 'mem', label: 'Bellek' },
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
      h('span', { class: 'tb-label' }, 'Tembel (lazy) Singleton · '),
      h('span', { class: 'tb-hint sg-tb-hint', html: md('`getInstance()` ilk çağrıda oluşturur, sonra hep aynısını verir') }),
      h('span', { class: 'tb-spacer' }),
      viewSeg.el,
      codeBtn
    );

    const viewPanel = h('section', { class: 'panel flow-view' });
    const views = { stage: h('div', { class: 'fv fv-stage' }), mem: h('div', { class: 'fv fv-mem' }), seq: h('div', { class: 'fv fv-seq' }), uml: h('div', { class: 'fv fv-uml' }) };
    Object.values(views).forEach((x) => viewPanel.appendChild(x));
    const codeCol = h('div', { class: 'flow-code' });
    const stackEl = h('div', { class: 'callstack', 'aria-label': 'Çağrı yığını' });
    const cvPanel = h('section', { class: 'panel flow-cv' });
    const consoleEl = h('div', { class: 'console', 'aria-live': 'polite' });
    codeCol.append(stackEl, cvPanel, consoleEl);
    body.append(viewPanel, codeCol);

    const stage = new SG.Stage(views.stage);
    const mem = new SG.MemoryView(views.mem);
    const seq = new DP.SequenceDiagram(views.seq, SG.seqSpec(), { roles: SG.roles });
    const uml = new DP.ClassDiagram(views.uml, SG.diagram({}), { roles: SG.roles, roleTags: true });
    const cv = new DP.CodeView(cvPanel, { roleOf: SG.roleOf, special: SG.special });
    cv.setFiles(SG.flowFiles());
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
        const r = SG.roleOf(fr.cls);
        stackEl.appendChild(h('span', { class: 'cs-frame' + (r ? ' rc rc-' + r : '') + (i === frames.length - 1 ? ' is-top' : '') }, fr.t));
      });
    }

    function render(i, prev, info) {
      const s = steps[i];
      const ps = prev >= 0 && prev < steps.length ? steps[prev] : null;
      foot.set(i, steps.length, s.t, s.x);
      cv.clear('active');
      cv.clear('trail');
      for (let j = 0; j < i; j++) cv.mark(steps[j].code[0], steps[j].code[1], 'trail', { show: false, scroll: false });
      cv.mark(s.code[0], s.code[1], 'active', { flash: !!ps && ps.code[0] !== s.code[0] });
      renderStack(s.stack);
      SG.renderConsole(
        consoleEl,
        '$ java Main',
        SG.output.slice(0, s.out).map((t) => ({ t })),
        { animateFrom: info.animate && (!ps || ps.out !== s.out) ? s.out - 1 : null, cursor: true }
      );
      stage.render(s.stage, ps ? ps.stage : null, { animate: info.animate && S.view === 'stage' });
      mem.update(SG.memSpec(s.mem), { animate: info.animate && S.view === 'mem' });
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
      delayOf: (i) => FLOW_DELAYS[i] || 4200,
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

  // ================================================================== 6. THREAD YARIŞI
  const RV = SG.race.variants;

  /** Adımların bellek durumlarını sırayla birleştirir (her adım yalnızca değişeni yazar). */
  function accumulate(v) {
    let m = {};
    let at = { T1: null, T2: null };
    return v.steps.map((s) => {
      m = Object.assign({}, m, s.mem || {});
      if (s.mem && s.mem.objs) m.objs = Object.assign({}, s.mem.objs);
      if (s.at) at = Object.assign({}, at, s.at);
      return { m: JSON.parse(JSON.stringify(m)), at: Object.assign({}, at) };
    });
  }

  /** Yarış sahnesinin bellek çizimi (iki thread, sınıf alanı, en çok iki nesne, kilit). */
  function raceMem(v, m) {
    const field = m.field || 'ornek';
    const half = !!m.half;
    const holders = (o) => ['T1', 'T2'].filter((t) => m[t] === o);
    const sayacOf = (o) => {
      const st = (m.objs || {})[o];
      if (st === 'building') return '… (okunuyor)';
      if (half && o === 'A') return '0 (!)';
      return String(m.nums ? 1000 + holders(o).length : 1000);
    };
    const thread = (t, y) => {
      const num = half && t === 'T2' ? 'KRG-1 (!)' : (m.nums && m.nums[t]) || '—';
      return {
        id: t.toLowerCase(),
        kind: 'frame',
        x: 16,
        y,
        w: 204,
        title: t,
        sub: 'numaraAl()',
        tone: t === 'T1' ? 't1' : 't2',
        active: false,
        rows: [
          { id: 'u', k: 'üretici', ref: m[t] ? 'o' + m[t] : half && t === 'T2' ? 'oA' : null, tone: t === 'T1' ? 't1' : 't2' },
          { id: 'no', k: 'no', v: num, tone: (m.bad || (half && t === 'T2')) && num !== '—' ? 'bad' : m.ok && num !== '—' ? 4 : null },
        ],
      };
    };
    const boxes = [thread('T1', 40), thread('T2', 168)];
    boxes.push({ id: 'st', kind: 'static', x: 16, y: 336, w: 204, title: 'TakipNoUretici', sub: 'sınıf', tone: 2, rows: [{ id: 'f', k: 'static ' + field, ref: m.ornek ? 'o' + m.ornek : half ? 'oA' : null, tone: 3 }] });
    const objY = { A: 40, B: 214 };
    Object.keys(m.objs || {}).forEach((o) => {
      const st = m.objs[o];
      boxes.push({
        id: 'o' + o,
        kind: 'obj',
        x: 340,
        y: objY[o],
        w: 206,
        title: 'TakipNoUretici',
        sub: 'nesne ' + o,
        tone: 2,
        state: half && o === 'A' ? 'half' : st === 'building' ? 'building' : m.bad ? 'bad' : null,
        badge: half && o === 'A' ? 'yarım kurulmuş!' : st === 'building' ? 'kuruluyor…' : null,
        rows: [{ id: 'sayac', k: 'sayac', v: sayacOf(o) }],
      });
    });
    const lock = m.lock ? Object.assign({ at: 'st', x: 246, y: 336 }, m.lock) : null;
    const notes = [];
    if (half) notes.push({ x: 443, y: 300, text: 'Varsayımsal: volatile OLMASAYDI', tone: 'bad', anchor: 'middle' });
    const regions = [
      { x: 6, y: 6, w: 224, h: 292, title: 'Thread’ler (yığın)', cls: 'r-stack' },
      { x: 6, y: 304, w: 224, h: 120, title: 'Sınıf alanı', cls: 'r-static' },
      { x: 236, y: 6, w: 318, h: 418, title: 'Heap', cls: 'r-heap' },
    ];
    return { view: [0, 0, 560, 430], regions, boxes, lock, notes };
  }

  const COMPARE = `
    <table class="cmp cmp-wide sg-cmp">
      <thead><tr><th>Yazım</th><th>Thread-safe</th><th>Tembel (lazy)</th><th>Kilit maliyeti</th><th>Yansıma / serileştirme</th><th>Ne zaman?</th></tr></thead>
      <tbody>
        <tr><td>Korumasız <code>if (ornek == null)</code></td><td class="bad">✗ yarış</td><td class="ok">✓</td><td>yok</td><td class="bad">✗ / ✗</td><td>Yalnızca tek thread’li programlar</td></tr>
        <tr><td><code>synchronized</code> getInstance()</td><td class="ok">✓</td><td class="ok">✓</td><td class="bad">her çağrıda</td><td class="bad">✗ / ✗</td><td>Seyrek çağrılıyorsa, en anlaşılır güvenli yol</td></tr>
        <tr><td>Çift kontrol + <code>volatile</code></td><td class="ok">✓</td><td class="ok">✓</td><td>yalnızca ilk sefer</td><td class="bad">✗ / ✗</td><td>Nedenini biliyorsanız; <code>volatile</code>’ı unutmak sessiz hata</td></tr>
        <tr><td>Erken: <code>static final</code></td><td class="ok">✓ (JVM)</td><td>✗ sınıf başlatılınca</td><td>yok</td><td class="bad">✗ / ✗</td><td>Nesne ucuzsa ya da hep kullanılıyorsa</td></tr>
        <tr><td>Holder (iç sınıf)</td><td class="ok">✓ (JVM)</td><td class="ok">✓</td><td>yok</td><td class="bad">✗ / ✗</td><td>Sınıf tabanlı + tembel isteniyorsa en iyisi</td></tr>
        <tr><td><code>enum</code> INSTANCE</td><td class="ok">✓ (JVM)</td><td>✗ sınıf başlatılınca</td><td>yok</td><td class="ok">✓ / ✓</td><td>Çoğu durumda önerilen (Effective Java, Madde 3)</td></tr>
      </tbody>
    </table>
    <p class="sg-cmp-note">${'Sınıf tabanlı yazımlar kurucuda kontrol ve <code>readResolve()</code> ile güçlendirilebilir (<b>Kırmak</b> sahnesi). Ayrıca dikkat: tekliği güvenceye almak <b>metotları</b> güvenli yapmaz — <code>sayac++</code> için de <code>synchronized</code> gerekir.'}</p>`;

  SG.scenes.race = function (root, ctx) {
    const S = ctx.state;
    let key = RV[S.race] ? S.race : S.race === 'compare' ? 'compare' : 'korumasiz';
    const el = h('div', { class: 'scene scene-race' });
    const toolbar = h('div', { class: 'scene-toolbar' });
    const body = h('div', { class: 'scene-body sg-race-body' });
    const table = h('div', { class: 'cmp-big', hidden: true, html: COMPARE });
    el.append(toolbar, body, table);
    root.appendChild(el);

    const items = SG.race.order.map((k) => ({ v: k, html: `<span class="sg-dot ${RV[k].safe ? 'is-ok' : 'is-bad'}"></span>${DP.esc(RV[k].label)}`, title: RV[k].title }));
    items.push({ v: 'compare', html: '⚖ Karşılaştır', title: 'Altı yazımı yan yana karşılaştır' });
    const seg = kit.seg(items, key, (k) => setVariant(k), { cls: 'seg-variant sg-race-seg', label: 'Gerçekleştirim' });
    toolbar.append(h('span', { class: 'tb-label' }, 'Gerçekleştirim:'), seg.el, h('span', { class: 'tb-spacer' }), h('span', { class: 'tb-hint', html: md('İki thread aynı anda `getInstance()` çağırıyor') }));

    // sol: kod + konsol · orta: zaman çizelgesi · sağ: bellek
    const codePanel = kit.panel('Kod <span class="panel-sub">· <b class="th-T1">T1</b> ve <b class="th-T2">T2</b> imleçleri</span>', { cls: 'panel-code sg-race-code' });
    const tlPanel = kit.panel('Zaman çizelgesi', { cls: 'panel-side sg-race-tl' });
    const memPanel = kit.panel('Bellek ve kilit', { cls: 'panel-side sg-race-mem' });
    body.append(codePanel.el, tlPanel.el, memPanel.el);
    const cvHost = h('div', { class: 'sg-cv' });
    const consoleEl = h('div', { class: 'console sg-console' });
    codePanel.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: SG.roleOf, special: SG.special });
    const tl = h('div', { class: 'sg-tl' });
    const verdict = h('div', { class: 'sg-verdict' });
    tlPanel.body.append(tl, verdict);
    const memHost = h('div', { class: 'sg-race-memhost' });
    memPanel.body.append(memHost);
    const mem = new SG.MemoryView(memHost, { cls: 'is-race' });

    let v = null;
    let acc = [];

    function load(k) {
      key = k;
      S.race = k;
      seg.set(k);
      const cmp = k === 'compare';
      body.hidden = cmp;
      table.hidden = !cmp;
      if (cmp) {
        DP.flash(table, 'is-pop');
        return;
      }
      v = RV[k];
      acc = accumulate(v);
      cv.setFiles(
        [
          { name: 'TakipNoUretici.java', code: v.code },
          { name: 'YarisDeneyi.java', code: SG.race.yarisDeneyi(v.access) },
          { name: 'Veritabani.java', code: SG.code.Veritabani },
        ],
        { active: 'TakipNoUretici.java', keepActive: false }
      );
      mem.reset();
    }

    const steps = () => (key === 'compare' ? [{ t: 'Altı yazım yan yana', x: 'Hepsi aynı sorunu çözüyor ama bedelleri farklı. Basit ihtiyaçta **erken** ya da **enum**; tembellik gerekiyorsa **Holder**. Çift kontrolü ancak `volatile`’ın neden gerektiğini biliyorsanız yazın.' }] : v.steps);

    function render(i, prev, info) {
      if (key === 'compare') {
        const s = steps()[0];
        foot.set(0, 1, s.t, s.x);
        return;
      }
      const s = v.steps[i];
      const a = acc[i];
      foot.set(i, v.steps.length, s.t, s.x);

      cv.clear('t1');
      cv.clear('t2');
      const F = 'TakipNoUretici.java';
      const actor = s.row ? s.row[0] : null;
      if (a.at.T2) cv.mark(F, a.at.T2, 't2', { scroll: actor === 'T2', show: true });
      if (a.at.T1) cv.mark(F, a.at.T1, 't1', { scroll: actor !== 'T2', show: true });

      // zaman çizelgesi
      const rows = [];
      v.steps.slice(0, i + 1).forEach((st, j) => {
        if (st.sw) rows.push('<div class="tl-switch">⚡ bağlam değişimi</div>');
        if (st.row) {
          const who = st.row[0];
          rows.push(`<div class="tl-item who-${who}${j === i ? ' is-current' : ''}${j === i && info.animate ? ' is-new' : ''}">
            <span class="tl-who">${who === 'both' ? 'T1 · T2' : who}</span><span class="tl-text">${md(st.row[1])}</span></div>`);
        }
      });
      tl.innerHTML = rows.length ? rows.join('') : '<div class="tl-empty">Henüz bir şey olmadı. <b>→</b> ile ilerleyin.</div>';
      const cur = tl.querySelector('.is-current');
      if (cur) cur.scrollIntoView({ block: 'nearest' });

      const m = a.m;
      verdict.className = 'sg-verdict' + (m.bad || m.half ? ' is-bad' : m.ok ? ' is-ok' : '');
      verdict.innerHTML = m.half
        ? '⚠ <b>volatile olmasaydı</b> · yarım nesne kullanılabilirdi'
        : m.bad
        ? '✗ <b>2 nesne</b> · aynı numara iki kez'
        : m.ok
        ? '✓ <b>1 nesne</b> · numaralar benzersiz'
        : '';

      mem.update(raceMem(v, m), { animate: info.animate });
      const outN = s.out || 0;
      SG.renderConsole(
        consoleEl,
        '$ java YarisDeneyi',
        v.out.slice(0, outN).map((t) => ({ t, err: !!m.bad && / aldı: KRG-1001$/.test(t) })).concat(outN === v.out.length ? [{ t: '(örnek bir çalıştırma · satır sırası değişebilir)', dim: true }] : []),
        { animateFrom: info.animate && prev >= 0 && (v.steps[prev].out || 0) !== outN ? v.steps[prev].out || 0 : null }
      );
    }

    function setVariant(k) {
      if (k === key) return;
      load(k);
      const n = steps().length;
      stepper.setCount(n, steps().map((s) => s.t));
      stepper.go(0, { force: true, animate: false });
    }

    const foot = ui.foot(el);
    load(key);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: steps().length,
      labels: steps().map((s) => s.t),
      delayOf: () => 5200,
      onChange: (i, prev, info) => render(i, prev, info),
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };
})();
