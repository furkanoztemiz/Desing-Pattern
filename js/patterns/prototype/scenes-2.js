/*
 * Prototype — sahneler (2/3): SIĞ ↔ DERİN (Canlı Akış) ve JAVA'DA clone()
 *   Sığ ↔ Derin: aynı program, kopya kurucudaki TEK satır değişiyor. Depo görünümünde ipler (referanslar),
 *                bellek görünümünde oklar; sağda Java kodu (aktif satır + iz), çağrı yığını ve konsol.
 *   clone()     : Java'nın yerleşik Cloneable/clone() mekanizması ve dört tuzağı; kopya kurucu ile karşılaştırma.
 */
(function () {
  'use strict';
  const PT = DP.pt;
  const { h } = DP;
  const kit = DP.kit;
  const ui = PT.ui;
  const md = PT.md;

  // ================================================================== 4. SIĞ ↔ DERİN
  const BASE = PT.kopya.items;
  const Z = BASE.concat(PT.kopya.extra);

  /** Bir kipteki bütün adımlar. Her adımın durumu hem depo hem bellek görünümünü besler. */
  function kopyaSteps(mode) {
    const sig = mode === 'sig';
    const M = 'Main.java';
    const K = 'KoliGonderisi.java';
    const G = 'Gonderi.java';
    const fMain = { t: 'Main.main()', cls: 'Main' };
    const fNew = { t: 'new KoliGonderisi(…)', cls: 'KoliGonderisi' };
    const fG0 = { t: 'Gonderi(alici, icerik)', cls: 'Gonderi' };
    const fKop = (v) => ({ t: v + '.kopyala()', cls: 'KoliGonderisi' });
    const fKctor = { t: 'KoliGonderisi(kaynak)', cls: 'KoliGonderisi' };
    const fGctor = { t: 'Gonderi(kaynak)', cls: 'Gonderi' };
    const LINE = sig ? 'this.icerik = kaynak.icerik;' : 'this.icerik = new ArrayList<>(kaynak.icerik);';
    const refB = sig ? 'L1' : 'L2';
    const refG = sig ? 'L1' : 'L3';
    const svc1 = { n: 1 };
    const copyFrame = { title: 'Gonderi(kaynak)', sub: 'kopya kurucu', tone: 2, rows: [{ id: 'this', k: 'this', ref: 'b', tone: 3 }, { id: 'kaynak', k: 'kaynak', ref: 's', tone: 3 }] };
    const st = (o) => Object.assign({ vars: {}, objs: {}, lists: {}, ref: {}, svc: svc1 }, o);
    const afterCopy = { vars: { sablon: 's', buHafta: 'b' }, objs: { s: 'ready', b: 'ready' }, lists: sig ? { L1: BASE } : { L1: BASE, L2: BASE }, ref: { s: 'L1', b: refB } };
    const afterAdd = Object.assign({}, afterCopy, { lists: sig ? { L1: Z } : { L1: BASE, L2: Z }, added: { list: refB, item: 'zımba' }, bad: sig });
    const all3 = Object.assign({}, afterAdd, {
      vars: { sablon: 's', buHafta: 'b', gelecekHafta: 'g' },
      objs: { s: 'ready', b: 'ready', g: 'ready' },
      lists: sig ? { L1: Z } : { L1: BASE, L2: Z, L3: BASE },
      ref: { s: 'L1', b: refB, g: refG },
    });

    return [
      {
        t: 'Program başlıyor',
        x: '`Main.main()` başladı; bellekte henüz hiçbir gönderi yok. Plan: bir kez **şablon** kur, sonra her hafta ondan **kopya** al. Üstteki düğmeyle kopya kurucudaki **tek satırı** değiştirebilirsiniz: sığ ya da derin.',
        code: [M, 'public static void main'], stack: [fMain], out: 0,
        st: st({ svc: { n: 0 } }),
      },
      {
        t: 'Şablon kuruluyor',
        x: '`new KoliGonderisi(…)` → `super(alici, icerik)` → **adres servisi** çağrıldı (~2 sn). Bu pahalı iş yalnızca şablon kurulurken, **bir kez** yapılacak.',
        code: [G, 'AdresServisi.dogrula(alici);'], stack: [fMain, fNew, fG0], out: 1,
        st: st({ objs: { s: 'building' }, fields: { s: {} }, svc: { n: 1, busy: true }, active: 's', frame: { title: 'Gonderi(alici, icerik)', sub: 'kurucu', tone: 2, rows: [{ id: 'this', k: 'this', ref: 's', tone: 3 }, { id: 'alici', k: 'alici', v: '"Ayşe Kırtasiye"' }] } }),
      },
      {
        t: 'Şablon hazır',
        x: 'Kurucu listeyi `new ArrayList<>(icerik)` ile oluşturdu; `sablon` değişkeni nesneyi gösteriyor. Depoda: **kutu** (nesne), **içerik panosu** (liste) ve aralarındaki **ip** (referans).',
        code: [M, 'Gonderi sablon = new KoliGonderisi('], stack: [fMain], out: 1,
        st: st({ vars: { sablon: 's' }, objs: { s: 'ready' }, lists: { L1: BASE }, ref: { s: 'L1' } }),
      },
      {
        t: 'sablon.kopyala()',
        x: 'İstemci türü sormadı; nesne **kendi** kopyasını üretiyor: `return new KoliGonderisi(this);` — kendisini kaynak olarak kopya kurucuya veriyor.',
        code: [K, 'return new KoliGonderisi(this);'], stack: [fMain, fKop('sablon')], out: 1,
        st: st({ vars: { sablon: 's' }, objs: { s: 'ready' }, lists: { L1: BASE }, ref: { s: 'L1' }, copying: 'b', active: 's', frame: { title: 'kopyala()', sub: 'KoliGonderisi', tone: 3, rows: [{ id: 'this', k: 'this', ref: 's', tone: 3 }] } }),
      },
      {
        t: 'Kopya kurucu: alici',
        x: 'Kopya kurucu çalışıyor ve **adres servisi çağrılmadı** (sayaç hâlâ 1). `alici` kopyalandı: aslında iki nesne **aynı String’i** gösteriyor; ama String **değişmez** olduğu için bu paylaşım zararsız.',
        code: [G, 'this.alici = kaynak.alici;'], stack: [fMain, fKop('sablon'), fKctor, fGctor], out: 1,
        st: st({ vars: { sablon: 's' }, objs: { s: 'ready', b: 'building' }, fields: { b: { alici: 1 } }, lists: { L1: BASE }, ref: { s: 'L1' }, active: 'b', hl: 'b.alici', frame: copyFrame }),
      },
      {
        t: sig ? 'icerik: referans kopyalandı' : 'icerik: liste kopyalandı',
        star: true,
        x: sig
          ? '`this.icerik = kaynak.icerik;` — yalnızca **referans** kopyalandı; yeni bir liste **yok**. İki nesne **aynı** `ArrayList`’i gösteriyor. Buna **sığ kopya** (shallow copy) denir.'
          : '`this.icerik = new ArrayList<>(kaynak.icerik);` — listenin **kendisi** de kopyalandı: aynı elemanlarla **yeni** bir `ArrayList`. Buna **derin kopya** (deep copy) denir.',
        code: [G, LINE], stack: [fMain, fKop('sablon'), fKctor, fGctor], out: 1,
        st: st({
          vars: { sablon: 's' },
          objs: { s: 'ready', b: 'building' },
          fields: { b: { alici: 1, icerik: 1 } },
          lists: sig ? { L1: BASE } : { L1: BASE, L2: BASE },
          ref: { s: 'L1', b: refB },
          active: 'b',
          hl: 'b.icerik',
          frame: copyFrame,
          bubble: sig ? { at: 'mid', text: 'İki kutu, **tek pano**: iki ip de aynı listeye bağlı!', tone: 'bad' } : { at: 'mid', text: 'Pano da **fotokopilendi**: her kutunun kendi listesi var.', tone: 'ok' },
        }),
      },
      {
        t: 'buHafta hazır',
        x: '`agirlik` da kopyalandı ve yeni nesne `buHafta`’ya atandı. `sablon == buHafta` → **false**: iki ayrı nesne.' + (sig ? ' Ama içleri **ortak**…' : ' İçleri de ayrı.'),
        code: [M, 'Gonderi buHafta = sablon.kopyala();'], stack: [fMain], out: 1,
        st: st(afterCopy),
      },
      {
        t: 'buHafta.ekle("zımba")',
        star: true,
        x: sig
          ? 'Yalnızca bu haftaya bir zımba eklemek istedik. Ama `buHafta.icerik` ile `sablon.icerik` **aynı liste**: **şablon da değişti!**'
          : '`buHafta`’nın **kendi** listesine eklendi. `sablon` hiç etkilenmedi.',
        code: [G, 'icerik.add(urun);'], stack: [fMain, { t: 'buHafta.ekle("zımba")', cls: 'Gonderi' }], out: 1,
        st: st(
          Object.assign({}, afterAdd, {
            active: 'b',
            frame: { title: 'ekle(urun)', sub: 'Gonderi', tone: 2, rows: [{ id: 'this', k: 'this', ref: 'b', tone: 3 }, { id: 'urun', k: 'urun', v: '"zımba"' }] },
            bubble: sig ? { at: 'mid', text: 'Zımba **bu haftaya** eklendi… ama pano ortak: **şablon da** değişti!', tone: 'bad' } : { at: 'mid', text: 'Zımba yalnızca **bu haftanın** panosuna yazıldı. Şablon temiz ✓', tone: 'ok' },
          })
        ),
      },
      {
        t: 'Gelecek hafta: yeni kopya',
        x: sig
          ? 'Gelecek haftanın kopyası **kirli şablondan** alındı ve o da aynı listeye bağlandı. Zımba artık **her hafta** gidecek — kimse istemediği hâlde!'
          : 'Gelecek haftanın kopyası **temiz** şablondan alındı: kendi listesi var, zımba yok. Üç nesne, üç liste.',
        code: [M, 'Gonderi gelecekHafta = sablon.kopyala();'], stack: [fMain], out: 1,
        st: st(Object.assign({}, all3, { added: null, bubble: sig ? { at: 'mid', text: 'Üç kutu, **tek pano**: zımba gelecek haftaya da geçti!', tone: 'bad' } : { at: 'mid', text: 'Gelecek hafta temiz bir kopya: `A4 kağıt, toner` ✓', tone: 'ok' } })),
      },
      {
        t: 'Çıktı',
        x: sig
          ? 'Zımba **üç gönderide** de var. Hata ne derleyicide ne de çalışma anında yakalandı: program sessizce **yanlış veri** üretti.'
          : 'Beklenen çıktı: zımba yalnızca **bu hafta**. Adres servisine yalnızca **1** sorgu gitti.',
        code: [M, ['System.out.println("şablon', 'System.out.println("gelecek']], stack: [fMain], out: 4,
        st: st(Object.assign({}, all3, { added: null })),
      },
      {
        t: sig ? 'Sonuç: sığ kopya' : 'Sonuç: derin kopya',
        x: sig
          ? 'Sığ kopya: nesne yeni, içindekiler **ortak**. Kural: kopyanın **değişebilir** (mutable) alanlarını da kopyala; **değişmez** olanları (String, Integer…) paylaşmak güvenlidir. Üstten **Derin kopya**’yı seçip farkı görün.'
          : 'Derin kopya: değişebilir parçalar da kopyalandı. Kural: **değişebilir alanları kopyala, değişmezleri paylaş.** Ne kadar derine inileceği (liste içindeki nesneler de mi?) sınıfın tasarımına bağlıdır.',
        code: [G, LINE], stack: [fMain], out: 4,
        st: st(Object.assign({}, all3, { added: null, listBadges: sig ? { L1: '3 nesne · 1 liste' } : null })),
      },
    ];
  }

  const KOPYA_DELAYS = [3600, 4400, 4200, 4200, 4600, 5600, 4200, 5600, 5000, 4600, 6000];

  PT.scenes.copy = function (root, ctx) {
    const S = ctx.state;
    let mode = S.copyMode || 'sig';
    const el = h('div', { class: 'scene scene-flow pt-copy' });
    const toolbar = h('div', { class: 'scene-toolbar' });
    const body = h('div', { class: 'flow-body' + (S.showCode === false ? ' hide-code' : '') });
    el.append(toolbar, body);
    root.appendChild(el);

    const modeSeg = kit.seg(
      [
        { v: 'sig', html: '<span class="sg-dot is-bad"></span>Sığ kopya', title: 'this.icerik = kaynak.icerik;' },
        { v: 'derin', html: '<span class="sg-dot is-ok"></span>Derin kopya', title: 'this.icerik = new ArrayList<>(kaynak.icerik);' },
      ],
      mode,
      (k) => setMode(k),
      { label: 'Kopya türü' }
    );
    const viewSeg = kit.seg(
      [
        { v: 'stage', label: 'Depo' },
        { v: 'mem', label: 'Bellek' },
      ],
      S.copyView || 'stage',
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
    const lineHint = h('code', { class: 'pt-line-hint' });
    toolbar.append(h('span', { class: 'tb-label' }, 'Kopya kurucudaki satır:'), modeSeg.el, lineHint, h('span', { class: 'tb-spacer' }), viewSeg.el, codeBtn);

    const viewPanel = h('section', { class: 'panel flow-view' });
    const views = { stage: h('div', { class: 'fv fv-stage' }), mem: h('div', { class: 'fv fv-mem' }) };
    Object.values(views).forEach((x) => viewPanel.appendChild(x));
    const codeCol = h('div', { class: 'flow-code' });
    const stackEl = h('div', { class: 'callstack', 'aria-label': 'Çağrı yığını' });
    const cvPanel = h('section', { class: 'panel flow-cv' });
    const consoleEl = h('div', { class: 'console pt-flow-console', 'aria-live': 'polite' });
    codeCol.append(stackEl, cvPanel, consoleEl);
    body.append(viewPanel, codeCol);

    const stage = new PT.ShelfStage(views.stage);
    const mem = new DP.MemoryView(views.mem, { flashAdded: true, spreadArrows: true });
    const cv = new DP.CodeView(cvPanel, { roleOf: PT.roleOf, special: PT.special });
    let steps = [];

    function load() {
      steps = kopyaSteps(mode);
      cv.setFiles(PT.kopya.files(mode), { active: 'Main.java', keepActive: false });
      lineHint.textContent = mode === 'sig' ? PT.SHALLOW_LINE.split('//')[0].trim() : PT.DEEP_LINE.split('//')[0].trim();
      lineHint.classList.toggle('is-bad', mode === 'sig');
      el.classList.toggle('is-sig', mode === 'sig');
    }

    function setMode(k) {
      if (k === mode) return;
      mode = k;
      S.copyMode = k;
      modeSeg.set(k);
      load();
      // Aynı adımda kal: iki kipi aynı anda karşılaştırmak için
      mem.reset();
      render(stepper.index, -1, { animate: false });
    }

    function setView(k) {
      S.copyView = k;
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
        const r = PT.roleOf(fr.cls);
        stackEl.appendChild(h('span', { class: 'cs-frame' + (r ? ' rc rc-' + r : '') + (i === frames.length - 1 ? ' is-top' : '') }, fr.t));
      });
    }

    function outLines(n) {
      const sig = mode === 'sig';
      return PT.kopya.output(mode)
        .slice(0, n)
        .map((t, j) => {
          if (j === 0) return { t, dim: true };
          const bad = sig && (j === 1 || j === 3);
          return { t, bad, ok: !sig, note: bad ? (j === 1 ? 'şablon kirlendi!' : 'istenmeyen zımba!') : null };
        });
    }

    function render(i, prev, info) {
      const s = steps[i];
      const ps = prev >= 0 && prev < steps.length ? steps[prev] : null;
      foot.set(i, steps.length, s.t, s.x);
      cv.clear();
      for (let j = 0; j < i; j++) cv.mark(steps[j].code[0], steps[j].code[1], 'trail', { show: false, scroll: false });
      const kind = s.star && mode === 'sig' ? 'bad' : 'active';
      cv.mark(s.code[0], s.code[1], kind, { flash: !!ps && ps.code[0] !== s.code[0] });
      renderStack(s.stack);
      PT.renderConsole(consoleEl, '$ java Main', outLines(s.out), { animateFrom: info.animate && (!ps || ps.out !== s.out) ? (ps ? ps.out : 0) : null, cursor: i < steps.length - 2 });
      stage.render(s.st, ps ? ps.st : null, { animate: info.animate && S.copyView !== 'mem' });
      mem.update(PT.memKopya(s.st), { animate: info.animate && S.copyView === 'mem' });
      el.classList.toggle('is-done', i === steps.length - 1);
    }

    const foot = ui.foot(el);
    let stepper = null;
    load();
    stepper = new DP.Stepper(foot.stepHost, {
      count: steps.length,
      labels: steps.map((s) => s.t),
      delayOf: (i) => KOPYA_DELAYS[i] || 4400,
      onChange: (i, prev, info) => render(i, prev, info),
    });
    setView(S.copyView || 'stage');
    return kit.stepApi(stepper, {
      destroy: () => {
        stepper.destroy();
        stage.destroy();
      },
    });
  };

  // ================================================================== 5. JAVA'DA clone()
  const KL = PT.klon;

  PT.scenes.clone = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-50' });
    const left = kit.panel('Java’nın yolu: <span class="ver"></span>', { cls: 'panel-code pt-left' });
    const right = kit.panel('Bellek', { cls: 'panel-side pt-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'pt-cv' });
    const consoleEl = h('div', { class: 'console pt-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: PT.roleOf, special: PT.special });

    const memHost = h('div', { class: 'pt-view pt-memhost' });
    const extra = h('div', { class: 'pt-extra' });
    right.body.append(memHost, extra);
    const mem = new DP.MemoryView(memHost, { flashAdded: true, spreadArrows: true });

    const BASE2 = PT.cargo.kirtasiye.icerik;
    const Z2 = BASE2.concat('zımba');
    const shallow = (o) =>
      Object.assign(
        {
          sayac: 1001,
          vars: { sablon: 'k1', kopya: 'k2' },
          objs: { k1: { takipNo: 'KRG-1001', list: 'L1' }, k2: { takipNo: 'KRG-1001', list: 'L1' } },
          lists: { L1: Z2 },
        },
        o || {}
      );
    const fixed = {
      sayac: 1002,
      vars: { sablon: 'k1', kopya: 'k2' },
      objs: { k1: { takipNo: 'KRG-1001', list: 'L1' }, k2: { takipNo: 'KRG-1002', list: 'L2' } },
      lists: { L1: BASE2, L2: Z2 },
      added: { list: 'L2', item: 'zımba' },
    };

    const STEPS = [
      {
        t: 'Yerleşik yol: Cloneable + clone()',
        x: 'Java’nın kendi kopyalama mekanizması: sınıf `Cloneable` arayüzünü uygular, `clone()` içinde `super.clone()` çağrılır; `Object.clone()` nesneyi **alan alan** kopyalar. Kısa ve kolay görünüyor… Çıktıya dikkatle bakın: **üç sürpriz** var.',
        v: 'tuzak', ver: 'Cloneable + super.clone()', marks: [['public class Koli implements Cloneable', 'focus'], [{ block: 'public Koli clone()' }, 'focus']],
        mem: shallow(),
      },
      {
        t: 'Tuzak 1 — Kurucu çalışmaz',
        x: '“kurucu çalıştı” yalnızca **bir kez** yazıldı: `super.clone()` nesneyi **kurucu çağırmadan** üretir. Kurucuda verilen takip numarası da olduğu gibi kopyalandı: iki koli de **KRG-1001**! (Singleton dersindeki çakışma, bu kez kopyadan.)',
        v: 'tuzak', ver: 'Cloneable + super.clone()', marks: [[{ block: 'public Koli(String alici' }, 'bad']], outMark: { 0: 'yalnızca BİR kez!', 1: 'aynı numara', 2: 'aynı numara' },
        mem: shallow({ hlSayac: true, objs: { k1: { takipNo: 'KRG-1001', list: 'L1', dupNo: true }, k2: { takipNo: 'KRG-1001', list: 'L1', dupNo: true, badge: 'aynı numara!' } } }),
      },
      {
        t: 'Tuzak 2 — Varsayılan kopya sığdır',
        x: '`Object.clone()` alanları **olduğu gibi** kopyalar: `icerik` **referansı** kopyalandı, liste değil. Kopyaya eklenen zımba **şablonda da** göründü — Sığ ↔ Derin sahnesindeki hatanın aynısı.',
        v: 'tuzak', ver: 'Cloneable + super.clone()', marks: [['return (Koli) super.clone();', 'bad']], outMark: { 1: 'şablona zımba?!' },
        mem: shallow({ badList: 'L1', added: { list: 'L1', item: 'zımba' }, objs: { k1: { takipNo: 'KRG-1001', list: 'L1', state: 'bad', badge: 'şablon kirlendi!', hlList: true }, k2: { takipNo: 'KRG-1001', list: 'L1', hlList: true } } }),
      },
      {
        t: 'Tuzak 3 — Cloneable unutulursa',
        x: '`implements Cloneable` silindi ve kod **yine derlendi!** `Cloneable`’ın hiç metodu yok; bir “işaret” arayüzüdür. `Object.clone()` bu işareti **çalışma anında** denetler ve `CloneNotSupportedException` fırlatır: hata derleyiciden kaçtı.',
        v: 'unutulan', diff: 'tuzak', ver: '“implements Cloneable” unutuldu', marks: [['public class Koli {', 'bad'], ['return (Koli) super.clone();', 'bad']],
        mem: { sayac: 1001, vars: { sablon: 'k1' }, objs: { k1: { takipNo: 'KRG-1001', list: 'L1' } }, lists: { L1: BASE2 }, frame: { title: 'clone()', sub: 'Koli', rows: [{ id: 'this', k: 'this', ref: 'k1', tone: 3 }] }, notes: [{ x: 486, y: 330, text: 'CloneNotSupportedException → kopya hiç oluşmadı', tone: 'bad', anchor: 'middle' }] },
      },
      {
        t: 'Tuzak 4 — final alanlar',
        x: 'Kopyayı **derin** yapmak ve yeni numara vermek için `clone()` içinde alanlara atama yapmalıyız. Ama alanlar `final`: **derleme hatası**. `clone()` ile `final` alanlar bir arada yaşayamaz.',
        v: 'final', diff: 'tuzak', ver: 'derin kopya denemesi', marks: [['kopya.takipNo = ', 'bad'], ['kopya.icerik = ', 'bad'], ['private final String takipNo;', 'bad'], ['private final List<String> icerik;', 'bad']],
        mem: { sayac: 1000, vars: {}, objs: {}, lists: {}, notes: [{ x: 655, y: 250, text: 'Program derlenmedi — bellekte hiçbir nesne yok', tone: 'bad', anchor: 'middle' }] },
      },
      {
        t: 'Zorla düzeltme',
        x: '`final`’dan vazgeçip her şeyi **elle** düzelttik: yeni numara, yeni liste. Çalışıyor — ama değişmezliği kaybettik, her yeni alan için `clone()`’u güncellemeyi **hatırlamak** zorundayız; üstelik bir **cast** ve kontrollü bir **istisna** hâlâ orada.',
        v: 'duzeltme', diff: 'final', ver: 'final’sız, elle derin kopya', marks: [['private String takipNo;', 'focus'], ['private List<String> icerik;', 'focus'], ['kopya.takipNo = ', 'focus'], ['kopya.icerik = ', 'focus']],
        mem: Object.assign({}, fixed, { hlSayac: true }),
      },
      {
        t: 'Tavsiye: kopya kurucu',
        x: '*Effective Java* (Madde 13): `clone()` yerine **kopya kurucu** ya da kopya fabrikası kullanın. Kurucu çalışır (yeni numara doğal olarak gelir), `final` alanlar korunur; cast ve kontrollü istisna yoktur. Bizim `kopyala()` metodumuz da tam olarak bu! İstisna: **diziler** için `dizi.clone()` idealdir.',
        v: 'kurucu', diff: 'duzeltme', ver: 'kopya kurucu (önerilen)', marks: [[{ block: 'private Koli(Koli kaynak)' }, 'ok'], [{ block: 'public Koli kopyala()' }, 'ok']],
        mem: fixed, table: true,
      },
    ];

    const filesOf = (v) => [
      { name: 'Koli.java', code: KL.variants[v] },
      { name: 'Main.java', code: KL.mainOf(v) },
    ];
    const asMap = (v) => ({ 'Koli.java': KL.variants[v], 'Main.java': KL.mainOf(v) });

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: () => 7000,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        left.head.querySelector('.ver').textContent = s.ver;
        cv.setFiles(filesOf(s.v), { active: 'Koli.java', prev: s.diff ? asMap(s.diff) : null, keepActive: false });
        s.marks.forEach(([spec, kind], k) => cv.mark('Koli.java', spec, kind, { scroll: k === 0 }));
        const o = KL.output(s.v);
        const lines = o.lines.map((l, j) => (s.outMark && s.outMark[j] != null ? Object.assign({}, l, { note: s.outMark[j], bad: !l.dim, ok: false }) : l));
        const fresh = info.animate && (prev < 0 || !STEPS[prev] || STEPS[prev].v !== s.v);
        PT.renderConsole(consoleEl, o.cmd, lines, { animateFrom: fresh ? 0 : null, title: o.compileError ? 'Derleyici' : 'Konsol' });
        mem.update(PT.memKlon(s.mem), { animate: info.animate });
        if (s.table) {
          extra.innerHTML = `
            <table class="cmp pt-cmp">
              <thead><tr><th></th><th><code>clone()</code> + <code>Cloneable</code></th><th>Kopya kurucu / <code>kopyala()</code></th></tr></thead>
              <tbody>
                <tr><td>Kurucu çalışır mı?</td><td class="bad">Hayır</td><td class="ok">Evet</td></tr>
                <tr><td><code>final</code> alanlar</td><td class="bad">Derin kopyada kullanılamaz</td><td class="ok">Sorunsuz</td></tr>
                <tr><td>Unutulursa</td><td class="bad">Çalışma anında istisna</td><td class="ok">Derleyici yakalar</td></tr>
                <tr><td>Cast / kontrollü istisna</td><td class="bad">Var</td><td class="ok">Yok</td></tr>
                <tr><td>Dizilerde</td><td class="ok"><code>dizi.clone()</code> ideal</td><td>—</td></tr>
              </tbody>
            </table>`;
          if (info.animate) DP.flash(extra, 'is-pop');
        } else if (i === 0) {
          extra.innerHTML = `<div class="sg-aside">${md('🔎 **İpucu:** `Cloneable` arayüzünün **hiç metodu yok**. `clone()` aslında `Object` sınıfında, `protected` olarak tanımlı; biz onu `public` yapıp dönüş tipini `Koli`’ye daraltıyoruz.')}</div>`;
        } else extra.innerHTML = '';
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };
})();
