/*
 * State — sahneler (3/3): Yapı, Genişlet, Gerçek Dünya, Quiz, Özet ve kalıp kaydı
 */
(function () {
  'use strict';
  const ST = DP.sta;
  const { h } = DP;
  const kit = DP.kit;
  const ui = ST.ui;
  const md = ST.md;
  const C = ST.code;
  const EX = ST.ext;
  /** Satır sonu yorumlarını atar (quiz'de cevabı ele vermesin) */
  const yorumsuz = (s) => s.replace(/ +\/\/ [^\n]*$/gm, '');

  // ================================================================== 6. YAPI
  const ROLE_TEXT = {
    context: 'İstemcinin tanıdığı sınıf. O anki durumu bir <b>durum nesnesinde</b> tutar ve her isteği ona devreder: <code>durum.kodGir(this, kod)</code>.',
    state: 'Bağlamın bir durumdaki davranışının arayüzü: her istek için bir metot. Bağlamı parametre olarak alır.',
    concreteState: 'Bir durumun <b>bütün</b> davranışı tek sınıfta. Gerekirse bir sonraki durumu kendisi seçer: <code>dolap.durumDegistir(new …)</code>.',
    client: 'Yalnızca bağlamı kullanır; durum nesnelerini <b>görmez</b>. Bağlamı ilk durumla kurabilir.',
  };

  function classInfo(id) {
    switch (id) {
      case 'KargoDolabi':
        return { role: 'context', file: 'KargoDolabi.java', code: C.KargoDolabi, mark: ['private DolapDurumu durum = new BosDurum();', 'durum.gorevliAc(this);'], points: ['`durum` alanı: o anki durum nesnesi.', 'Her istek tek satırda devredilir; `if (durum…)` yok.', 'Durumların kullandığı küçük işlemleri sunar (`durumDegistir`, `paketiVer` …).'] };
      case 'DolapDurumu':
        return { role: 'state', file: 'DolapDurumu.java', code: C.DolapDurumu, mark: ['void paketKoy(KargoDolabi dolap, String koli, String kod);', 'String ad();'], points: ['Her istek için bir metot.', 'İlk parametre bağlamın kendisi: `dolap`.', 'Yeni bir durum, bütün metotları **yazmak zorunda**.'] };
      case 'BosDurum':
      case 'DoluDurum':
      case 'KilitliDurum': {
        const key = { BosDurum: 'BOS', DoluDurum: 'DOLU', KilitliDurum: 'KILITLI' }[id];
        const gec = { BOS: 'dolap.durumDegistir(new DoluDurum());', DOLU: 'dolap.durumDegistir(new KilitliDurum());', KILITLI: 'dolap.durumDegistir(new DoluDurum());' }[key];
        return {
          role: 'concreteState',
          file: id + '.java',
          code: C[id],
          mark: gec,
          points: [
            { BOS: 'Yalnızca `paketKoy` iş yapar; öbür istekler kısa birer cevap.', DOLU: 'Kural burada: doğru kod kapağı açar, üçüncü yanlış kilitler.', KILITLI: 'Paket ve kod reddedilir; yalnızca görevli açar.' }[key],
            'Bir sonraki durumu **kendisi** seçer.',
            'Alanı yok: verisi (paket, kod, hatali) bağlamda.',
          ],
        };
      }
      case 'Main':
        return { role: 'client', file: 'Main.java', code: C.Main, mark: ['KargoDolabi dolap = new KargoDolabi();', 'dolap.kodGir("4821");'], points: ['Yalnızca `dolap` ile konuşur.', 'Durum sınıflarının adını bile bilmez.', 'Kalıpsız sürümdeki Main’in **aynısı**.'] };
      default:
        return null;
    }
  }

  /** UML durum diyagramı (state machine): her düğüm bir sınıf, her ok bir durumDegistir */
  function durumDiyagrami() {
    const kutu = (key, x, y) => `<g class="sta-sm-dugum sd-${key}"><rect x="${x}" y="${y}" width="118" height="46" rx="16"/><text class="sta-sm-ad" x="${x + 59}" y="${y + 20}" text-anchor="middle">${ST.AD[key]}</text><text class="sta-sm-sinif" x="${x + 59}" y="${y + 36}" text-anchor="middle">${ST.SINIF[key]}</text></g>`;
    const ok = (d, cls) => `<path class="sta-sm-ok${cls ? ' ' + cls : ''}" d="${d}" marker-end="url(#sta-sm-uc)"/>`;
    const et = (x, y, t, a) => `<text class="sta-sm-et" x="${x}" y="${y}" text-anchor="${a || 'middle'}">${DP.esc(t)}</text>`;
    return `<svg class="sta-sm" viewBox="0 0 440 236" role="img" aria-label="Dolabın UML durum diyagramı">
      <defs><marker id="sta-sm-uc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z"/></marker></defs>
      <circle class="sta-sm-bas" cx="22" cy="49" r="8"/>
      ${ok('M30 49 H52')}
      ${kutu('BOS', 54, 26)}${kutu('DOLU', 262, 26)}${kutu('KILITLI', 262, 170)}
      ${ok('M172 40 H260')}${et(216, 32, 'paketKoy')}
      ${ok('M262 62 H174')}${et(218, 80, 'kodGir [doğru]')}
      ${ok('M300 72 V168')}${et(294, 124, 'kodGir [3. yanlış]', 'end')}
      ${ok('M346 170 V74')}${et(352, 124, 'gorevliAc', 'start')}
      ${et(113, 104, 'öbür istekler:', 'middle')}${et(113, 120, 'durum değişmez', 'middle')}
    </svg>`;
  }

  ST.scenes.structure = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split' });
    const tools = h('div', { class: 'panel-tools' });
    const body = h('div', { class: 'scene-body cols-64' });
    const left = kit.panel('Yapı', { cls: 'panel-diagram', extra: tools });
    const right = kit.panel('Rol kartı <span class="panel-sub">· bir sınıfa tıklayın</span>', { cls: 'panel-side' });
    body.append(left.el, right.el);
    el.append(body);
    root.appendChild(el);

    const diagHost = h('div', { class: 'diag-host' });
    const legend = kit.umlLegend({ aggregation: 'tutar', fmLabel: 'durum geçişi' });
    left.body.append(diagHost, legend);
    const diagram = new DP.ClassDiagram(diagHost, ST.gofDiagram({ notes: true }), {
      roles: ST.roles,
      onSelect: (id) => {
        showInfo(id);
        diagram.focus({ classes: [id] });
        diagram.select(id);
      },
    });

    const modeSeg = kit.seg(
      [
        { v: 'concrete', label: 'Somut' },
        { v: 'generic', label: 'Genel (GoF)' },
      ],
      'concrete',
      (v) => diagram.setMode(v)
    );
    const tagToggle = kit.toggle('Rol etiketleri', true, (on) => diagram.setRoleTags(on));
    tools.append(modeSeg.el, tagToggle);

    const infoTop = h('div', { class: 'info-card' });
    const infoCode = h('div', { class: 'info-code' });
    right.body.append(infoTop, infoCode);

    function showInfo(id) {
      const info = classInfo(id);
      infoCode.innerHTML = '';
      if (!info) return;
      const r = ST.roles[info.role];
      infoTop.innerHTML = `
        <div class="info-role rc rc-${r.color}"><span class="info-dot"></span><b>${r.en}</b> · ${r.tr}</div>
        <div class="info-name rc rc-${r.color}">${DP.esc(id)}</div>
        <p class="info-desc">${ROLE_TEXT[info.role]}</p>
        <ul class="info-points">${info.points.map((p) => `<li>${md(p)}</li>`).join('')}</ul>`;
      const cv = new DP.CodeView(infoCode, { files: [{ name: info.file, code: info.code }], roleOf: ST.roleOf, special: ST.special, compact: true });
      cv.mark(info.file, info.mark, 'focus');
      DP.flash(infoTop, 'is-pop');
    }

    function showOverview() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">Durum bir nesne</div>
        <div class="role-list">
          ${['context', 'state', 'concreteState', 'client']
            .map((k) => `<div class="role-row rc rc-${ST.roles[k].color}"><span class="info-dot"></span><div><b>${ST.roles[k].en}</b> · ${ST.roles[k].tr}<div class="role-desc">${ROLE_TEXT[k]}</div></div></div>`)
            .join('')}
        </div>`;
    }

    function showGecis() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">Geçişi kim yapar?</div>
        <div class="sta-sm-wrap">${durumDiyagrami()}</div>
        <p class="info-desc">${md('UML **durum diyagramındaki** her düğüm bir durum sınıfı, her ok bir `durumDegistir` çağrısı. GoF iki yol gösterir:')}</p>
        <table class="cmp sta-cmp">
          <thead><tr><th>Geçişleri bilen</th><th>Artı</th><th>Eksi</th></tr></thead>
          <tbody>
            <tr><td>Durumlar (bizim tasarım)</td><td>${md('yeni durum kolay; bağlam sade')}</td><td>${md('durumlar birbirini tanır')}</td></tr>
            <tr><td>Bağlam (merkezî)</td><td>${md('geçişler tek yerde')}</td><td>${md('bağlam yine `if`’lerle dolar')}</td></tr>
            <tr><td>Geçiş tablosu</td><td>${md('veriyle değişir: (durum, istek) → durum')}</td><td>${md('davranış değil, yalnızca geçiş')}</td></tr>
          </tbody>
        </table>`;
      DP.flash(infoTop, 'is-pop');
    }

    function showPaylas() {
      infoCode.innerHTML = '';
      infoTop.innerHTML = `
        <div class="info-name">Durum nesneleri paylaşılabilir</div>
        <p class="info-desc">${md('Durum sınıflarımızın **alanı yok**: paket, kod ve sayaç bağlamda. O hâlde her geçişte `new` yerine her durumdan **tek** nesne yeter ve bütün dolaplar onu paylaşabilir (GoF: Flyweight; çoğu zaman Singleton).')}</p>
        <pre class="mini-code">// her durumdan tek nesne (paylaşılan)
static final DolapDurumu BOS = new BosDurum();
dolap.durumDegistir(DurumHavuzu.KILITLI);

// Java’nın kısa yolu: enum sabitleri zaten tek nesnedir
enum Durum { BOS { … }, DOLU { … }, KILITLI { … } }</pre>
        <p class="info-desc">${md('Durumun kendi verisi varsa (ör. her dolabın ayrı sayacı) paylaşılamaz; o zaman her bağlam kendi durum nesnesini yaratır: bizim `new KilitliDurum()` gibi.')}</p>`;
      DP.flash(infoTop, 'is-pop');
    }

    const durumlar = ['BosDurum', 'DoluDurum', 'KilitliDurum'];
    const STEPS = [
      { t: 'Genel bakış', x: 'Dört rol: istemcinin tanıdığı **bağlam** ([[KargoDolabi]]), durum arayüzü [[DolapDurumu]], onu uygulayan **somut durumlar** ve yalnızca bağlamla konuşan **istemci** ([[Main]]).', info: null },
      { t: 'Context — `KargoDolabi`', x: '[[KargoDolabi]] o anki durumu bir nesnede tutuyor (◇ = tutar) ve her isteği ona devrediyor. Dışarıdan bakan yalnızca dolabı görüyor; dolabın davranışı ise `durum` alanı değiştikçe değişiyor.', info: 'KargoDolabi', focus: { classes: ['KargoDolabi', 'DolapDurumu'], edges: ['durum'], members: [['KargoDolabi', 'durum']] } },
      { t: 'State — `DolapDurumu`', x: '[[DolapDurumu]]: her istek için bir metot ve `ad()`. Metotlar bağlamı (`dolap`) parametre olarak alıyor; durum, işini yaparken dolaba dokunabiliyor.', info: 'DolapDurumu', focus: { classes: ['DolapDurumu'], members: [['DolapDurumu', 'paketKoy'], ['DolapDurumu', 'kodGir'], ['DolapDurumu', 'gorevliAc']] } },
      { t: 'ConcreteState — durumlar', x: '[[BosDurum]], [[DoluDurum]], [[KilitliDurum]]: her biri **bir durumun bütün davranışı**. Bir sonraki durumu da kendileri seçiyor (nottaki gibi).', info: 'DoluDurum', focus: { classes: durumlar, edges: ['r-BOS', 'r-DOLU', 'r-KILITLI'] } },
      { t: 'Client — `Main`', x: '[[Main]] yalnızca dolabı yaratıp istek gönderiyor; durum sınıflarını hiç tanımıyor. Kalıpsız sürümdeki Main’in **aynısı**: kalıp, dolabın içini değiştirdi.', info: 'Main', focus: { classes: ['Main', 'KargoDolabi'], edges: ['c-main'] } },
      { t: 'Geçişi kim yapar?', x: 'Bizim tasarımda **durumlar**: her biri sonraki durumu biliyor. Geçişler bağlamda da toplanabilir ya da bir tabloya konabilirdi. Durum diyagramındaki her ok, koddaki bir `durumDegistir` çağrısı.', gecis: true, focus: { classes: durumlar.concat(['KargoDolabi']), members: [['KargoDolabi', 'durumDegistir']] } },
      { t: 'Durum nesneleri paylaşılabilir', x: 'Durum sınıflarının alanı yok; her durumdan **tek** nesne bütün dolaplara yeter (Flyweight, Singleton). Java’da `enum` sabitleri tam da böyle tek nesnelerdir.', paylas: true, focus: { classes: durumlar } },
    ];

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t.replace(/`/g, '')),
      delayOf: () => 6800,
      onChange: (i) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        diagram.select(null);
        if (s.focus) diagram.focus(s.focus);
        else diagram.clearFocus();
        if (s.gecis) showGecis();
        else if (s.paylas) showPaylas();
        else if (s.info) showInfo(s.info);
        else showOverview();
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };

  // ================================================================== 7. GENİŞLET: HİZMET DIŞI durumu
  ST.scenes.extend = function (root, ctx) {
    const S = ctx.state;
    S.ext = S.ext || {};
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-50' });
    const left = kit.panel('Görev: <code class="sta-code-t">HizmetDisiDurum</code>', { cls: 'panel-code panel-ex' });
    const right = kit.panel('Kargo dolabı', { cls: 'panel-side sta-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    // ---- sol (adım 0): alıştırma
    const exBox = h('div', { class: 'ex-box' });
    const task = h('div', {
      class: 'task-card',
      html: md('📩 **Şube müdürü:** “Görevli **boş** bir dolabı anahtarla açarsa dolap bakıma alınsın: kurye paket koyamasın, kod çalışmasın. Görevli yeniden açınca dolap hizmete dönsün.”\nKural: KargoDolabi, DoluDurum ve KilitliDurum değişmeyecek.'),
    });
    const ex = kit.blankExercise({
      files: [
        { name: 'HizmetDisiDurum.java', code: EX.exercise, badge: 'YENİ' },
        { name: 'BosDurum.java · değişen', code: EX.exerciseBos },
      ],
      answers: EX.answers,
      hints: {
        1: 'Bir durum sınıfı hangi arayüzü uygular?',
        2: 'Dolabın durumunu değiştiren metot?',
        3: 'Bakım bitince dolap hangi duruma döner?',
        4: 'Boş dolap bakıma alınınca hangi durum nesnesi yaratılır?',
      },
      choices: ['DolapDurumu', 'KargoDolabi', 'durumDegistir', 'gorevliAc', 'BosDurum', 'DoluDurum', 'HizmetDisiDurum', 'KilitliDurum'],
      roleOf: ST.roleOf,
      special: ST.special,
      state: S.ext,
      doneText: '<b class="ok">✔ Derleme başarılı!</b> Yeni durum hazır.',
      onSolved: () => {
        DP.fx.confetti();
        DP.fx.toast('Derleme başarılı! 🎉');
        setTimeout(() => stepper.index === 0 && stepper.go(1), DP.dur(900));
      },
      onShowAnswers: () => stepper.index === 0 && stepper.go(1),
      onReset: () => stepper.go(0),
    });
    exBox.append(task, ex.wrap, ex.chipRow, ex.actions);

    // ---- sol (adım 1+): kod + konsol
    const runBox = h('div', { class: 'sta-runbox', hidden: true });
    const runCode = h('div', { class: 'sta-cv' });
    const runConsole = h('div', { class: 'console sta-console' });
    runBox.append(runCode, runConsole);
    left.body.append(exBox, runBox);
    const runCv = new DP.CodeView(runCode, { roleOf: ST.roleOf, special: ST.special });

    // ---- sağ: dolap + etki
    const viewHost = h('div', { class: 'sta-view' });
    const impact = h('div', { class: 'sta-extra' });
    right.body.append(viewHost, impact);
    const stage = new ST.DolapSahne(viewHost);

    const prog = EX.prog;
    const r = ST.run(prog);
    const ops = prog.ops;
    const anOf = (istek, x) => {
      const a = ST.anDurumu(prog, r, istek);
      const op = ops[istek];
      const ilk = r.olaylar.find((o) => o.istek === istek && o.e === 'istek');
      const cevap = r.lines.filter((l) => l.i === istek && (l.k === 'cevap' || l.k === 'red')).pop();
      return Object.assign(
        a.st,
        {
          aktor: ST.aktorOf(op),
          alici: op.t === 'kod' ? ST.kimOf(op.kod) : null,
          istek: { metot: ST.metotOf(op), cagri: ST.cagriOf(op) },
          cevap: cevap ? { t: cevap.t.trim(), tip: cevap.k === 'cevap' ? 'ok' : 'red' } : null,
          hucre: { metot: ST.metotOf(op), durum: ilk.durum, tip: cevap && cevap.k === 'cevap' ? 'ok' : 'red' },
          tuslar: op.t === 'kod' ? op.kod : null,
        },
        x || {}
      );
    };
    const bas = ST.stateFrom(prog, ST.BOS_AN, { banner: { text: 'Yeni bir durum: **HİZMET DIŞI**. Hangi sınıflar değişmeli?' } });
    const bakimda = anOf(1, { hedef: null, banner: { text: '✓ Görevli boş dolabı açtı → **HİZMET DIŞI** · kurye paketi koyamadı', tone: 'ok' } });
    const sonra = anOf(4, { banner: { text: '✓ Bakım bitti → **BOŞ** · Mert’in paketi kondu ve teslim edildi', tone: 'ok' } });
    const nBakim = ST.anDurumu(prog, r, 1).e.n;
    const STEPS = [
      {
        t: 'Görev: `HizmetDisiDurum`',
        x: 'Boşluklara tıklayıp doğru parçaları seçin. Yeni durum da bir [[DolapDurumu]]: üç isteğin **hepsine** bir cevap vermek zorunda. Ona geçişi başlatan tek yer [[BosDurum]]’un `gorevliAc` metodu.',
        st: bas,
      },
      {
        t: 'Derlendi: dolap bakımda',
        x: 'Görevli boş dolabı açtı: [[BosDurum]] yeni durumu yarattı, `durum: BOŞ → HİZMET DIŞI`. Kurye Mert’in paketini getirdi; istek [[HizmetDisiDurum]]’a gitti: “hizmet dışı: konamadı”. [[KargoDolabi]]’ne tek satır eklemedik.',
        st: bakimda,
      },
      {
        t: 'Bakım bitti',
        x: 'Görevli yeniden açtı: [[HizmetDisiDurum]] dolabı BOŞ’a geçirdi. Kurye paketi koydu, Mert kodunu girdi: her şey eski durum sınıflarıyla, **değişmeden** çalıştı.',
        st: sonra,
      },
      {
        t: 'Bir metodu unutursanız?',
        x: 'Kalıpsız sürümde unutulan bir dal **çalışma anında** `else`’e düşmüştü. Burada `gorevliAc`’ı yazmayı unutursanız kod **derlenmez**: derleyici yeni durumun her isteğe cevap vermesini şart koşuyor. **HİZMET DIŞI** artık Dolap Tezgâhı’nda da açık.',
        st: Object.assign({}, sonra, { banner: { text: 'Yeni durum: kalıpsız **3 metoda dal + else’ler**, State ile **1 sınıf + 1 satır**.', tone: 'ok' } }),
        eksik: true,
      },
    ];

    function renderLeft(i) {
      exBox.hidden = i >= 1;
      runBox.hidden = i < 1;
      left.head.querySelector('.panel-title').innerHTML = i >= 1 ? 'Yeni durum: <code class="sta-code-t ver">HizmetDisiDurum</code>' : 'Görev: <code class="sta-code-t">HizmetDisiDurum</code>';
      if (i < 1) return;
      // önce konsol (yüksekliği değişir), sonra koddaki işaret
      if (STEPS[i].eksik) {
        ST.renderConsole(runConsole, '$ javac *.java', EX.eksikHata.map((t, k) => ({ t, k: k === 0 ? 'hata' : 'x' })), { title: 'Derleyici' });
        runCv.setFiles([{ name: 'HizmetDisiDurum.java', code: EX.eksikSrc, badge: 'gorevliAc yok' }, { name: 'BosDurum.java', code: C.BosDurumBakim }], { active: 'HizmetDisiDurum.java', keepActive: false });
        runCv.mark('HizmetDisiDurum.java', 'public class HizmetDisiDurum implements DolapDurumu {', 'bad');
        return;
      }
      const kadar = i === 1 ? nBakim : r.lines.length;
      ST.renderConsole(runConsole, ST.cmd(true), r.lines.slice(0, kadar).map((l) => ST.consoleLine(l)));
      runCv.setFiles(
        [
          { name: 'HizmetDisiDurum.java', code: C.HizmetDisiDurum, badge: 'YENİ' },
          { name: 'BosDurum.java', code: C.BosDurumBakim, badge: '1 satır' },
          { name: 'Main.java', code: EX.Main },
        ],
        { active: i === 1 ? 'BosDurum.java' : 'HizmetDisiDurum.java', prev: i === 1 ? { 'BosDurum.java': C.BosDurum } : null, keepActive: false }
      );
      if (i === 1) runCv.mark('BosDurum.java', ['public void gorevliAc(KargoDolabi dolap) {', 'dolap.durumDegistir(new HizmetDisiDurum());'], 'focus');
      else runCv.mark('HizmetDisiDurum.java', ['public void gorevliAc(KargoDolabi dolap) {', 'dolap.durumDegistir(new BosDurum());'], 'focus');
    }

    function renderImpact(i, animate) {
      if (i === 0) {
        impact.innerHTML = `<div class="impact-title">İpucu</div><p>${md('Bağlam (`KargoDolabi`) yalnızca `DolapDurumu` türünü tanıyor: yeni bir durum sınıfı onun için sıradan bir durum. Yeni duruma **kimin** geçireceğini düşünün.')}</p>`;
      } else if (i === 1) {
        impact.innerHTML = `
          <div class="impact-title ok">✔ Derleme başarılı · yeni durum</div>
          <ul class="filelist">
            <li><span class="cv-dot rc rc-${ST.roleOf('HizmetDisiDurum')}"></span>HizmetDisiDurum.java <span class="cv-badge is-new">YENİ</span></li>
            <li><span class="cv-dot rc rc-${ST.roleOf('BosDurum')}"></span>BosDurum.java <span class="cv-badge">1 satır</span></li>
          </ul>`;
      } else if (i === 2) {
        impact.innerHTML = `
          <div class="metrics">
            <div class="metric is-good"><div class="m-val">1</div><div class="m-label">yeni sınıf</div></div>
            <div class="metric"><div class="m-val">1</div><div class="m-label">değişen satır (geçiş)</div></div>
            <div class="metric is-good"><div class="m-val">0</div><div class="m-label">değişen: bağlam, öbür durumlar</div></div>
          </div>`;
      } else {
        impact.innerHTML = `
          <table class="cmp sta-cmp">
            <thead><tr><th>Yeni durum</th><th>Kalıpsız (if/else)</th><th>State</th></tr></thead>
            <tbody>
              <tr><td>Değişen kod</td><td class="bad">üç metoda yeni dal</td><td class="ok">yeni sınıf + geçiş satırı</td></tr>
              <tr><td>Unutulan istek</td><td class="bad">çalışırken <code>else</code>’e düşer</td><td class="ok">derlenmez</td></tr>
              <tr><td>Davranışı nerede?</td><td class="bad">üç metoda dağılmış</td><td class="ok">tek sınıfta</td></tr>
            </tbody>
          </table>
          <div class="sta-go"><button class="btn btn-primary btn-sm" type="button" data-go>🗄 Dolap Tezgâhı’nda dene →</button></div>`;
        impact.querySelector('[data-go]').addEventListener('click', () => ctx.goScene('tezgah'));
      }
      if (animate) DP.flash(impact, 'is-pop');
    }

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t.replace(/`/g, '')),
      delayOf: () => 6800,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        if (i >= 1) {
          ex.autoFill(info.animate && i === 1);
          S.bakimUnlocked = true;
        } else ex.ensureSelection();
        renderLeft(i);
        stage.render(s.st, prev >= 0 ? STEPS[prev].st : null, { animate: info.animate });
        renderImpact(i, info.animate || i !== prev);
      },
    });
    ex.paintAll();
    return kit.stepApi(stepper, {
      destroy: () => {
        stepper.destroy();
        stage.destroy();
      },
    });
  };

  // ================================================================== 8. GERÇEK DÜNYA
  const RW = ST.rw;
  const TABS = [
    {
      tab: 'TCP bağlantısı (GoF)',
      title: '`Socket` — GoF’un TCP bağlantısı örneği',
      intro: 'GoF, State’i bir **TCP bağlantısıyla** anlatır: `TCPConnection` bağlamdır; `TCPEstablished`, `TCPListen`, `TCPClosed` durumlardır ve aynı istekler her durumda başka davranır. Java’da bunu `java.net.Socket` gösterir: **aynı** `getOutputStream().write()` çağrısı, soketin durumuna göre çalışır ya da reddedilir.',
      map: [
        ['context', 'KargoDolabi', '`Socket` (GoF: `TCPConnection`)'],
        ['state', 'DolapDurumu', 'GoF: `TCPState`'],
        ['concreteState', 'KilitliDurum', 'bağlı değil · bağlı · kapalı (GoF: `TCPListen`, `TCPEstablished`, `TCPClosed`)'],
        ['client', 'Main', 'soketi kullanan kod'],
      ],
      note: 'JDK’daki `Socket` durumunu bayraklarla (`connected`, `closed`) tutar ve metotlarında sorar: içi kalıpsızdır. GoF’un önerisi, bu davranışları durum sınıflarına taşımaktı. Program kendi içinde bir sunucu açar; internet gerekmez. Çıktılar Java 21 ile alındı.',
      roles: { Socket: 'context' },
      file: 'TcpBaglantisi.java',
      code: RW.tcp,
      options: RW.tcpOpts,
      mark: 'soket.getOutputStream().write(1);',
      cmd: '$ java TcpBaglantisi',
    },
    {
      tab: 'enum ile durum',
      title: '`enum` ile durumlar — Java’nın kısa yolu',
      intro: 'Java’da State’in en derli toplu yazımı: her durum bir `enum` sabiti, davranışı da sabite özel gövdesi. Her sabit aslında **anonim bir alt sınıfın** tek nesnesidir (`EnumDolap$Durum$2` …): durum nesneleri kendiliğinden **paylaşılır**. Geçiş, metodun döndürdüğü yeni durumdur.',
      map: [
        ['state', 'DolapDurumu', '`enum Durum` (soyut `kodGir`)'],
        ['concreteState', 'DoluDurum', '`BOS`, `DOLU`, `KILITLI` sabitleri'],
        ['context', 'KargoDolabi', '`d` değişkenini tutan kod'],
        ['fm', 'durumDegistir', '`return dogru ? BOS : this;`'],
      ],
      note: 'Sabitlerin alanı yok; bu yüzden her durumdan tek nesne yeter (Flyweight, Singleton). Sayaç gibi bir veri gerekiyorsa onu bağlamda tutun. Çıktılar Java 21 ile alındı.',
      roles: { Durum: 'state' },
      file: 'EnumDolap.java',
      code: RW.enumDurum,
      options: RW.enumOpts,
      mark: 'return dogru ? BOS : this;',
      cmd: '$ java EnumDolap',
    },
    {
      tab: 'Thread',
      title: '`Thread` — yaşam döngüsü ve `Thread.State`',
      intro: 'Bir `Thread` nesnesinin davranışı durumuna bağlıdır: `NEW` iken `start()` iş parçacığını başlatır, `TERMINATED` iken **aynı** çağrı reddedilir. JDK durumları `Thread.State` enum’unda açıkça adlandırır: `NEW`, `RUNNABLE`, `BLOCKED`, `WAITING`, `TIMED_WAITING`, `TERMINATED`.',
      map: [
        ['context', 'KargoDolabi', '`Thread`'],
        ['state', 'DolapDurumu', '`Thread.State` (durumların adı)'],
        ['concreteState', 'KilitliDurum', '`NEW`, `RUNNABLE`, `TERMINATED` …'],
        ['client', 'Main', '`start()` ya da `run()` çağıran kod'],
      ],
      note: '`run()` doğrudan çağrılınca iş `main` iş parçacığında çalışır; durum `NEW` kalır. JDK bu davranışı bir durum alanıyla sorar; ama dışarıdan görünen, State’in tanımıdır: aynı istek, durum değişince başka sonuç. Çıktılar Java 21 ile alındı.',
      roles: { Thread: 'context' },
      file: 'IsParcacigi.java',
      code: RW.thread,
      options: RW.threadOpts,
      mark: 'System.out.println("sonra: " + tarayici.getState());',
      cmd: '$ java IsParcacigi',
    },
    {
      tab: 'Karıştırmayın!',
      title: 'State, Strategy ve `enum` + `switch`',
      intro: 'State ile Strategy’nin **sınıf diyagramı aynıdır**: bağlam bir arayüzü tutar, somut sınıflar onu uygular. Fark, nesneyi **kimin** ve **ne zaman** değiştirdiğindedir.',
      extraHtml: `<table class="cmp cmp-3">
        <thead lang="en"><tr><th></th><th>State</th><th>Strategy</th><th>enum + switch</th></tr></thead>
        <tbody>
          <tr><td>Nesneyi kim değiştirir?</td><td><b>Durumlar</b> (geçiş)</td><td><b>İstemci</b> seçer</td><td>Metotlar (<code>durum = …</code>)</td></tr>
          <tr><td>Birbirini tanır mı?</td><td>Evet: sonraki durumu yaratır</td><td>Hayır, bağımsızdır</td><td>—</td></tr>
          <tr><td>Ne zaman değişir?</td><td>Çalışırken, sık sık</td><td>Genelde bir kez</td><td>Her atamada</td></tr>
          <tr><td>Yeni durum</td><td>Yeni sınıf</td><td>(yeni algoritma: yeni sınıf)</td><td>Her <code>switch</code>’e yeni dal</td></tr>
        </tbody></table>`,
      note: 'Java 21’in `switch` **ifadesi** bir `enum`’un eksik dalını derlemede yakalar; `else`’e düşme hatası olmaz. Ama davranış yine metotlara dağılır. State, bir durumun bütün davranışını tek sınıfta toplar.',
      roles: { DoluDurum: 'concreteState', KilitliDurum: 'concreteState' },
      special: ST.special,
      file: 'Karsilastirma.java',
      code: () => `// State: geçişi durum yapar; istemci yalnızca bağlamı çağırır
dolap.kodGir("3333");          // DoluDurum → new KilitliDurum()

// Strategy: algoritmayı istemci seçer; stratejiler birbirini tanımaz
siparis.setTarife(new EkspresTarife());

// enum + switch ifadesi: eksik dal derlenmez, ama davranış metotlarda
String cevap = switch (durum) {
    case BOS -> "dolap boş";
    case DOLU -> kapagiAc(girilen);
    case KILITLI -> "kilitli";
};`,
      mark: 'dolap.kodGir("3333");',
    },
  ];

  ST.scenes.realworld = (root, ctx) =>
    kit.realWorldScene(root, ctx, {
      tabs: TABS,
      roles: ST.roles,
      roleOf: ST.roleOf,
      fmLabel: 'durum geçişi',
      footText: (i) =>
        i === 3
          ? 'Yapı aynıysa **kimin değiştirdiğine** bakın: State’te durumlar kendi aralarında geçer, Strategy’yi istemci seçer.'
          : i === 2
          ? 'Aynı `start()` çağrısı: `NEW` iken iş parçacığını başlatır, `TERMINATED` iken reddedilir.'
          : i === 1
          ? '`enum` sabitleri tek nesnedir: Java’da paylaşılan durum nesnelerinin en kısa yazımı.'
          : 'GoF’un kendi örneği: aynı istek, bağlantının durumuna göre başka sonuç verir. Sağdaki düğmelerle deneyin.',
    });

  // ================================================================== 9. QUIZ
  const Q = [
    {
      type: 'mcq',
      q: 'State kalıbının **temel amacı** (GoF) nedir?',
      options: ['Bir algoritma ailesini tanımlayıp her birini kapsüllemek; böylece birbirlerinin yerine kullanılabilsinler', 'Bir nesnenin, iç durumu değiştikçe davranışını da değiştirmesine izin vermek; sanki sınıfı değişmiş gibi', 'Bir isteği nesne olarak paketlemek; böylece istekler sıraya konabilsin, kaydedilsin ve geri alınabilsin', 'Bir nesnenin iç durumunu, kapsüllemeyi bozmadan dışarıda saklamak ve sonra o duruma geri dönebilmek'],
      answer: 1,
      explain: 'Diğerleri Strategy, Command ve Memento’nun amaçları.',
    },
    {
      type: 'line',
      q: 'Bu sınıfta `kodGir` isteğinin **o anki durum nesnesine devredildiği** satıra tıklayın.',
      codeName: 'KargoDolabi.java',
      code: yorumsuz(ST.plain(C.KargoDolabi)),
      answer: 'durum.kodGir(this, girilen);',
      explain: 'Bağlam isteği kendisi işlemiyor; `durum` alanındaki nesneye veriyor. Hangi sınıfın kodu çalışacağını o anki durum belirliyor.',
    },
    {
      type: 'mcq',
      q: 'Kalıpsız sürümde kilitli dolaba neden paket kondu?',
      options: ['Java, bir metot çalışırken aynı nesnenin başka bir metodunun çağrılmasına izin vermez', 'paketKoy’daki else dalı, sonradan eklenen KİLİTLİ durumunu da BOŞ gibi karşıladı', 'durumDegistir metodu KİLİTLİ değerini yazamadı; alan hâlâ DOLU olarak kaldı', 'Kurye, dolabın ekranındaki KİLİTLİ yazısını görmedi ve paketi zorla yerleştirdi'],
      answer: 1,
      explain: 'KİLİTLİ, `kodGir` ve `gorevliAc` yazılırken eklendi; `paketKoy`’a kimse dokunmadı. “BOŞ ise” diye yazılmış `else` yeni durumu da karşıladı. State’te her durum sınıfı `paketKoy`’u yazmak zorunda.',
    },
    {
      type: 'line',
      q: 'Üçüncü hatalı koddan sonra **dolabın kilitlendiği** satıra tıklayın.',
      codeName: 'DoluDurum.java',
      code: yorumsuz(ST.plain(C.DoluDurum)),
      answer: 'dolap.durumDegistir(new KilitliDurum());',
      explain: 'Geçişi bağlam değil durum yapıyor: DOLU, bir sonraki durumun KİLİTLİ olduğunu biliyor.',
    },
    {
      type: 'mcq',
      q: '`KargoDolabi` sınıfı bu tasarımda hangi rolde?',
      options: ['State', 'ConcreteState', 'Client', 'Context'],
      answer: 3,
      explain: 'İstemcinin tanıdığı ve o anki durum nesnesini tutan sınıf bağlamdır (Context); istekleri durum nesnesine devreder.',
    },
    {
      type: 'mcq',
      q: 'State tasarımında yeni bir durum (HİZMET DIŞI) eklemek neyi gerektirir?',
      options: ['Bağlamdaki her metoda yeni bir else if dalı eklemeyi ve bütün else’leri gözden geçirmeyi', 'Durum arayüzüne yeni bir metot eklemeyi ve böylece bütün durum sınıflarını değiştirmeyi', 'Yeni bir durum sınıfını ve bu duruma geçişi başlatan durumdaki tek bir satırı', 'KargoDolabi’yi kalıtımla genişletip yeni durum için ayrı bir alt sınıf yazmayı'],
      answer: 2,
      explain: 'Yeni durum yeni bir sınıftır; bağlam ve öbür durumlar değişmez. Yalnızca o duruma geçiren yer (BosDurum.gorevliAc) bir satır değişir.',
    },
    {
      type: 'mcq',
      q: 'State ile Strategy arasındaki en önemli fark nedir?',
      options: ['Strategy’de nesneler birbirini tanır ve geçer; State’te nesneyi her zaman istemci seçer', 'İkisinin sınıf diyagramı farklıdır: State kalıtım, Strategy yalnızca bileşim kullanır', 'Aralarında fark yoktur; ikisi de aynı kalıbın farklı kitaplardaki adlarıdır', 'State’te nesne kendi durumunu değiştirir; Strategy’de algoritmayı istemci seçer'],
      answer: 3,
      explain: 'Yapı aynı, amaç farklı: durumlar birbirini tanır ve geçişi kendileri yapar; stratejiler bağımsızdır ve dışarıdan seçilir.',
    },
    {
      type: 'mcq',
      q: 'Durum sınıflarında hiç alan (field) yoksa ne yapılabilir?',
      options: ['Her durumdan tek bir nesne yaratılıp bütün dolaplarca paylaşılabilir', 'Durum sınıfları silinip davranış yeniden bağlamın if/else’lerine taşınır', 'Durum nesneleri her istekte yeniden yaratılmak zorundadır; paylaşılamaz', 'Bağlam durum nesnesini bir kez yaratır ve geçişlerde hiç değiştirmez'],
      answer: 0,
      explain: 'Alansız durum nesneleri paylaşılabilir (Flyweight); çoğu zaman her durum bir Singleton’dır. Java’da `enum` sabitleri tam da budur.',
    },
    {
      type: 'mcq',
      q: 'Durum arayüzüne yeni bir **istek** (ör. gunSonu) eklemek neden zahmetlidir?',
      options: ['Bütün somut durum sınıfları bu metodu uygulamak zorunda kalır; hepsi değişir', 'Java arayüzlerine sonradan metot eklenemez; arayüz baştan yazılmak zorundadır', 'Bağlamın alanları private olduğu için yeni metot onlara hiç erişemez', 'Yeni istek, mevcut geçişleri bozar ve dolap her seferinde BOŞ durumuna döner'],
      answer: 0,
      explain: 'State yeni **durum** eklemeyi kolaylaştırır, yeni **istek** eklemeyi değil: arayüze her metot, her durum sınıfında bir gövde demektir.',
    },
  ];

  ST.scenes.quiz = (root, ctx) =>
    kit.quizScene(root, ctx, {
      questions: Q,
      roleOf: ST.roleOf,
      special: ST.special,
      patternName: 'State',
      match: {
        items: ['KargoDolabi', 'DolapDurumu', 'BosDurum', 'DoluDurum', 'KilitliDurum', 'Main'].map((id) => ({ id, label: id })),
        buckets: ['context', 'state', 'concreteState', 'client'].map((k) => ({ id: k, title: ST.roles[k].en, sub: ST.roles[k].tr, color: ST.roles[k].color })),
        answer: ST.classRoles,
        hint: 'Altı sınıfı dört role yerleştirin. Takıldığınızda **Cevapları göster** düğmesi var.',
      },
    });

  // ================================================================== 10. ÖZET
  ST.scenes.summary = function (root, ctx) {
    const at = DP.catalog.findIndex((p) => p.id === 'state');
    const next = DP.catalog.slice(at + 1).find((p) => p.ready && DP.patterns[p.id]);
    const el = h('div', { class: 'scene scene-summary' });
    el.innerHTML = `
      <div class="sum-head">
        <div>
          <div class="chips"><span class="chip chip-cat is-behav">Davranışsal · Behavioral</span><span class="chip">Anahtar kelime: duruma göre davranış</span></div>
          <h1>State — Özet</h1>
        </div>
        <div class="sum-actions no-print">
          <button class="btn btn-ghost" type="button" data-print>🖨 Yazdır / PDF</button>
          <a class="btn btn-ghost" href="#/observer/ozet">← Observer özeti</a>
          <a class="btn btn-ghost" href="#/">Tüm kalıplar</a>
          ${next ? `<a class="btn btn-primary" href="#/${next.id}">Sıradaki kalıp: ${DP.esc(next.name)} →</a>` : ''}
        </div>
      </div>
      <div class="sum-grid">
        <article class="card sum-intent">
          <h3>Amaç</h3>
          <p>Bir nesnenin <b>iç durumu değiştiğinde davranışını da değiştirmesine</b> izin ver; nesne sanki <b>sınıfını değiştirmiş</b> gibi görünsün.</p>
          <div class="sum-formula"><code>dolap.kodGir(kod)</code> → <code>durum.kodGir(this, kod)</code> <span>(geçiş: <code>dolap.durumDegistir(new KilitliDurum())</code>)</span></div>
        </article>
        <article class="card sum-uml"><h3>Yapı (GoF)</h3><div class="sum-diag"></div></article>
        <article class="card">
          <h3>if/else ↔ State</h3>
          <table class="cmp sg-sum-cmp">
            <thead lang="en"><tr><th></th><th>Kalıpsız</th><th>State</th></tr></thead>
            <tbody>
              <tr><td>Davranış nerede?</td><td class="bad">her metotta, dallarda</td><td class="ok">durum sınıflarında</td></tr>
              <tr><td>Yeni durum</td><td class="bad">her metoda dal; unutulan <code>else</code>’e düşer</td><td class="ok">yeni sınıf; derleyici denetler</td></tr>
              <tr><td>Geçişler</td><td class="bad">dallara gömülü</td><td class="ok"><code>durumDegistir(new …)</code></td></tr>
              <tr><td>Durum sorgusu</td><td class="bad">5 × <code>if (durum…)</code></td><td class="ok">yok</td></tr>
            </tbody>
          </table>
        </article>
        <article class="card">
          <h3>Katılımcılar</h3>
          <ul class="sum-roles">
            <li>${ui.roleChip('context')}<span>durum nesnesini tutar, isteği devreder</span></li>
            <li>${ui.roleChip('state')}<span>her istek için bir metot</span></li>
            <li>${ui.roleChip('concreteState')}<span>bir durumun bütün davranışı + sonraki durum</span></li>
            <li>${ui.roleChip('client')}<span>yalnızca bağlamı kullanır</span></li>
          </ul>
        </article>
        <article class="card sum-pros">
          <h3>Artıları</h3>
          <ul>
            <li>Bir durumun davranışı <b>tek sınıfta</b></li>
            <li>Yeni durum = yeni sınıf; eksik cevabı derleyici yakalar</li>
            <li>Geçişler <b>açık</b>; durum diyagramı koddan okunur</li>
            <li>Alansız durum nesneleri <b>paylaşılabilir</b></li>
          </ul>
        </article>
        <article class="card sum-cons">
          <h3>Eksileri</h3>
          <ul>
            <li>Her durum bir sınıf: <b>sınıf sayısı</b> artar</li>
            <li>Yeni <b>istek</b> (arayüze metot) bütün durumları değiştirir</li>
            <li>Durumlar birbirini tanır; geçişler sınıflara dağılır</li>
            <li>İki durum, basit davranış için fazla gelebilir (<code>enum</code> yeter)</li>
          </ul>
        </article>
        <article class="card">
          <h3>İlişkili kalıplar</h3>
          <ul>
            <li><b>Strategy:</b> aynı yapı; ama nesneyi istemci seçer, stratejiler birbirini tanımaz.</li>
            <li><b>Flyweight:</b> alansız durum nesneleri nasıl paylaşılır.</li>
            <li><b>Singleton:</b> her durumdan tek nesne (Java’da <code>enum</code>).</li>
            <li><b>Command:</b> geri alma gibi işlemler durumla birlikte kullanılabilir.</li>
          </ul>
        </article>
        <article class="card sum-tip">
          <h3>Sınav ipuçları</h3>
          <pre class="mini-code">interface DolapDurumu { void kodGir(KargoDolabi d, String kod); }   // State
class DoluDurum implements DolapDurumu {                          // ConcreteState
    public void kodGir(KargoDolabi d, String kod) {
        if (d.kodDogruMu(kod)) d.durumDegistir(new BosDurum());   // geçiş
    }
}
class KargoDolabi {                                               // Context
    private DolapDurumu durum = new BosDurum();
    public void kodGir(String kod) { durum.kodGir(this, kod); }   // devret
}</pre>
          <p class="exam"><b>Davranış duruma göre değişiyorsa</b> → State · <b>Context, State, ConcreteState</b> · bağlam isteği <u>devreder</u> · geçişi <u>durumlar</u> yapar · State ≠ Strategy: <u>kim değiştiriyor?</u></p>
        </article>
        <article class="card sum-files">
          <h3>Java kodları</h3>
          <p>Çalıştırılabilir örnekler proje klasöründe:</p>
          <pre class="mini-code">java/state/sorun      → if/else; kilitli dolaba paket kondu, Ali’nin paketi kayboldu
java/state/cozum      → durum nesneleri: BosDurum, DoluDurum, KilitliDurum
java/state/akis/...   → Canlı Akış: kilit · teslim
java/state/tezgah/... → aynı oturum: kalipsiz · durumlu
java/state/genislet   → HizmetDisiDurum: yeni durum, BosDurum’da tek satır</pre>
          <p>Derleyip çalıştırmak için <code>java/README.md</code> dosyasına bakın.</p>
        </article>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-print]').addEventListener('click', () => window.print());
    const diag = new DP.ClassDiagram(el.querySelector('.sum-diag'), ST.gofDiagram({}), { roles: ST.roles, roleTags: false, mode: 'generic' });
    diag.svg.classList.add('is-compact');
    return { destroy() {} };
  };

  // ================================================================== kayıt
  DP.register({
    id: 'state',
    name: 'State',
    tr: 'Durum',
    category: 'behavioral',
    roleOf: ST.roleOf,
    initialState: () => ({
      view: 'stage',
      showCode: true,
      preset: 'kilit',
      tz: { design: 'durum', ops: ST.SENARYO.slice() },
      bakimUnlocked: false,
      ext: {},
      quiz: { results: {}, match: false },
    }),
    scenes: [
      { id: 'giris', title: 'Giriş', mount: ST.scenes.intro },
      { id: 'sorun', title: 'Sorun', mount: ST.scenes.problem },
      { id: 'cozum', title: 'Çözüm', mount: ST.scenes.solution },
      { id: 'akis', title: 'Canlı Akış', mount: ST.scenes.flow, star: true },
      { id: 'tezgah', title: 'Dolap Tezgâhı', mount: ST.scenes.counter, star: true },
      { id: 'yapi', title: 'Yapı (UML)', mount: ST.scenes.structure },
      { id: 'genislet', title: 'Genişlet', mount: ST.scenes.extend },
      { id: 'gercek', title: 'Gerçek Dünya', mount: ST.scenes.realworld },
      { id: 'quiz', title: 'Quiz', mount: ST.scenes.quiz },
      { id: 'ozet', title: 'Özet', mount: ST.scenes.summary },
    ],
  });
})();
