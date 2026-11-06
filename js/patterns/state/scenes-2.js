/*
 * State — sahneler (2/3): CANLI AKIŞ ve DOLAP TEZGÂHI
 *   Canlı Akış: istemci dolaba istek gönderir; dolap isteği o anki durum nesnesine devreder; durum işi yapar ve
 *               gerekirse bir sonraki durumu yaratıp dolaba verir (durumDegistir). Sıralama diyagramı her istek için ayrı.
 *   Tezgâh   : kurye, alıcı, yabancı ve görevli gibi istek gönderin; aynı oturumu kalıpsız (if/else) ve durum
 *               nesneleriyle karşılaştırın. Üretilen Main.java ve konsol birlikte görünür.
 */
(function () {
  'use strict';
  const ST = DP.sta;
  const { h } = DP;
  const kit = DP.kit;
  const ui = ST.ui;
  const md = ST.md;

  function renderStack(stackEl, frames) {
    stackEl.innerHTML = '<span class="cs-label">Çağrı yığını</span>';
    frames.forEach((fr, i) => {
      if (i) stackEl.appendChild(h('span', { class: 'cs-sep' }, '›'));
      const r = ST.roleOf(fr.cls);
      stackEl.appendChild(h('span', { class: 'cs-frame' + (r ? ' rc rc-' + r : '') + (i === frames.length - 1 ? ' is-top' : '') }, fr.t));
    });
  }

  // ================================================================== 4. CANLI AKIŞ
  const IMZA = {
    paketKoy: 'public void paketKoy(KargoDolabi dolap, String koli, String kod) {',
    kodGir: 'public void kodGir(KargoDolabi dolap, String girilen) {',
    gorevliAc: 'public void gorevliAc(KargoDolabi dolap) {',
  };
  const BAGLAM_IMZA = {
    paketKoy: 'public void paketKoy(String koli, String kod) {',
    kodGir: 'public void kodGir(String girilen) {',
    gorevliAc: 'public void gorevliAc() {',
  };
  const DEVRET = { paketKoy: 'durum.paketKoy(this, koli, kod);', kodGir: 'durum.kodGir(this, girilen);', gorevliAc: 'durum.gorevliAc(this);' };
  /** Durumun işi (kod işareti): anahtar 'DURUM.metot[.sonuç]' */
  const IS = {
    'BOS.paketKoy': ['dolap.paketiYerlestir(koli, kod);', 'System.out.println("  " + koli + " kondu'],
    'DOLU.kodGir.dogru': ['if (dolap.kodDogruMu(girilen)) {', 'System.out.println("  kapak açıldı: "'],
    'DOLU.kodGir.yanlis': ['int hatali = dolap.hataliArtir();', 'if (hatali == 3) {'],
    'KILITLI.gorevliAc': ['dolap.hatalariSifirla();', 'System.out.println("  görevli kilidi açtı");'],
  };
  const GECIS = {
    'BOS.paketKoy': 'dolap.durumDegistir(new DoluDurum());',
    'DOLU.kodGir.dogru': 'dolap.durumDegistir(new BosDurum());',
    'DOLU.kodGir.yanlis': 'dolap.durumDegistir(new KilitliDurum());',
    'KILITLI.gorevliAc': 'dolap.durumDegistir(new DoluDurum());',
  };

  function flowSteps(p) {
    const seq = ST.seqSpec(p);
    const r = seq.run;
    const prog = p.prog;
    const O = r.olaylar;
    const MF = 'Main.java';
    const KF = 'KargoDolabi.java';
    const SF = (key) => ST.SINIF[key] + '.java';
    const fMain = { t: 'Main.main()', cls: 'Main' };
    const fDolap = (m) => ({ t: `dolap.${m}()`, cls: 'KargoDolabi' });
    const fDurum = (key, m) => ({ t: `${ST.SINIF[key]}.${m}()`, cls: ST.SINIF[key] });
    const steps = [];
    const st = (s, x) => ST.stateFrom(prog, s, x);
    const B = seq.bolumler;
    const son = B.length - 1;

    steps.push({
      t: 'Kurulum',
      x: 'Main bir [[KargoDolabi]] yarattı. Dolabın `durum` alanı ilk değerini aldı: bir [[BosDurum]] nesnesi. Main durum nesnelerini **hiç görmeyecek**; yalnızca dolapla konuşuyor.',
      code: [MF, 'KargoDolabi dolap = new KargoDolabi();'], dev: [KF, 'private DolapDurumu durum = new BosDurum();'], stack: [fMain], con: 0, seq: { b: 0, m: 1 }, d: 5600,
      uml: { classes: ['Main', 'KargoDolabi', 'DolapDurumu', 'BosDurum'], edges: ['c-main', 'durum'] },
      stage: st(ST.BOS_AN, { banner: { text: 'Dolabın `durum` alanı bir **BosDurum** nesnesini gösteriyor.' } }),
    });

    let ilkKoy = true;
    let ilkKod = true;
    prog.ops.forEach((op, k) => {
      const E = (e) => O.findIndex((o) => o.istek === k && o.e === e);
      const iIstek = E('istek');
      const once = O[iIstek].durum;
      const metot = ST.metotOf(op);
      const msg = B[k + 1].msgOf;
      const sonuc = op.t === 'kod' && once === 'DOLU' ? (O[E('kodDogruMu')].sonuc ? 'dogru' : 'yanlis') : null;
      const anahtar = once + '.' + metot + (sonuc ? '.' + sonuc : '');
      const iGecis = E('gecis');
      const cevapler = O.filter((o) => o.istek === k && o.e === 'cevap');
      const iCevap = O.indexOf(cevapler[cevapler.length - 1]);
      const cevapSatir = r.lines.filter((l) => l.i === k && (l.k === 'cevap' || l.k === 'red' || l.k === 'hata')).pop();
      const cevap = { t: cevapSatir.t.trim(), tip: cevapSatir.k === 'cevap' ? 'ok' : 'red' };
      const aktor = ST.aktorOf(op);
      const alici = op.t === 'kod' && ST.kimOf(op.kod) !== 'yabancı' ? ST.kimOf(op.kod) : null;
      const istek = { metot, cagri: ST.cagriOf(op) };
      const mainSatir = ST.satir(op).trim().split('  ')[0];
      const tuslar = op.t === 'kod' ? op.kod : null;
      const base = (i, x) => st(O[i].s, Object.assign({ aktor, alici, istek, tuslar }, x));
      const hucre = (tip) => ({ metot, durum: once, tip });
      const kisa = ST.cagriOf(op).replace(/"KRG-(\d+)", "\d+"/, '$1').replace(/"/g, '');
      const gecisVar = iGecis >= 0;
      const hedef = gecisVar ? O[iGecis].to : null;
      const fs = [fMain, fDolap(metot), fDurum(once, metot)];
      const ayrintili = (op.t === 'koy' && ilkKoy && once === 'BOS') || (op.t === 'kod' && ilkKod && once === 'DOLU');
      if (op.t === 'koy' && once === 'BOS') ilkKoy = false;
      if (op.t === 'kod' && once === 'DOLU') ilkKod = false;

      if (ayrintili) {
        // A: istek dolaba gelir
        steps.push({
          t: `dolap.${kisa}`,
          x: `${aktor === 'kurye' ? 'Kurye' : alici || 'Biri'} dolaba bir istek gönderdi. [[KargoDolabi]] önce o anki durumun adını yazdı: \`[${ST.AD[once]}]\`. Dolap isteği **kendisi** işlemeyecek.`,
          code: [MF, mainSatir], dev: [KF, { block: BAGLAM_IMZA[metot] }], stack: [fMain, fDolap(metot)], con: O[iIstek].n, seq: { b: k + 1, m: msg.istek }, d: 5200,
          uml: { classes: ['Main', 'KargoDolabi'], members: [['KargoDolabi', metot]] },
          stage: base(iIstek, { token: { from: 'aktor:' + aktor, to: 'baglam', text: kisa, kind: 'req' } }),
        });
        // B: devret
        steps.push({
          t: `durum.${metot}(this, …)`,
          x: `Dolap isteği **o anki durum nesnesine devretti**: \`durum.${metot}(this, …)\`. \`durum\` şu an bir [[${ST.SINIF[once]}]]; dolap kendini (\`this\`) de gönderiyor ki durum gerekirse ona dokunabilsin.`,
          code: [KF, DEVRET[metot]], dev: [SF(once), IMZA[metot]], stack: fs, con: O[iIstek].n, seq: { b: k + 1, m: msg.devret }, d: 5600,
          uml: { classes: ['KargoDolabi', 'DolapDurumu', ST.SINIF[once]], edges: ['durum'], members: [['DolapDurumu', metot], [ST.SINIF[once], metot]] },
          stage: base(iIstek, { hucre: hucre('on'), token: { from: 'durumAlan', to: 'hucre:' + metot + ':' + once, text: metot, kind: 'dev' } }),
        });
        // C: durumun işi
        const isMsg = anahtar === 'BOS.paketKoy' ? msg.yerlestir : sonuc === 'dogru' ? msg.paketiVer : sonuc === 'yanlis' ? msg.hataliArtir : msg.devret;
        const isX = {
          'BOS.paketKoy': `[[BosDurum]] işi yaptı: \`dolap.paketiYerlestir(koli, kod)\` ile paketi ve kodu dolaba yazdırdı, alıcıya SMS gitti. Bu davranış **yalnızca** BOŞ durumuna ait.`,
          'DOLU.kodGir.yanlis': `[[DoluDurum]] kodu dolaba sordu (\`kodDogruMu\` → false), sayacı artırdı: **${O[iCevap].s.hatali}/3**. Henüz kilit yok.`,
          'DOLU.kodGir.dogru': `[[DoluDurum]]: kod doğru! \`dolap.paketiVer()\` paketi verdi ve kayıtları temizledi; kapak açıldı.`,
        }[anahtar];
        steps.push({
          t: { 'BOS.paketKoy': 'paketiYerlestir(…)', 'DOLU.kodGir.yanlis': `hatalı (${O[iCevap].s.hatali}/3)`, 'DOLU.kodGir.dogru': 'kapak açıldı' }[anahtar] || cevap.t,
          x: isX || `[[${ST.SINIF[once]}]] kendi cevabını verdi: “${cevap.t}”.`,
          code: [SF(once), IS[anahtar] || { block: IMZA[metot] }], dev: [KF, anahtar === 'BOS.paketKoy' ? 'void paketiYerlestir(String koli, String kod) {' : sonuc === 'dogru' ? 'String paketiVer() {' : 'int hataliArtir() {'], stack: fs, con: O[iCevap].n, seq: { b: k + 1, m: isMsg }, d: 5600,
          uml: { classes: [ST.SINIF[once], 'KargoDolabi'], members: [[ST.SINIF[once], metot]] },
          stage: base(iCevap, {
            hucre: hucre(cevap.tip),
            cevap,
            hl: anahtar === 'BOS.paketKoy' ? { paket: true, kod: true } : sonuc === 'yanlis' ? { hatali: true } : { paket: true },
            kapak: sonuc === 'dogru',
            token: anahtar === 'BOS.paketKoy' ? { from: 'aktor:kurye', to: 'dolap', text: ST.kisa(op.koli), kind: 'koli' } : sonuc === 'dogru' ? { from: 'dolap', to: 'aktor:alici', text: ST.kisa(O[E('paketiVer')].koli), kind: 'koli' } : null,
          }),
        });
      } else {
        // tek adımda: istek → devret → cevap
        const ayni = {
          'DOLU.paketKoy': 'Aynı istek (`paketKoy`), farklı durum: dolap DOLU olduğu için istek [[DoluDurum]]’a gitti; o da paketi **reddetti**. Kimse `if (durum…)` sormadı.',
          'KILITLI.paketKoy': 'Kurye Selin’in paketiyle geldi. İstek [[KilitliDurum]]’a gitti: “kilitli: konamadı”. Kalıpsız sürümde tam burada `else` devreye girmişti; burada KİLİTLİ **kendi cevabını** veriyor, çünkü arayüz onu yazmaya zorladı.',
          'KILITLI.kodGir': 'Aynı `kodGir`, bu kez [[KilitliDurum]]’da: reddedildi. Dolap **aynı nesne**, ama davranışı değişti: sanki sınıfı değişmiş gibi.',
          'BOS.kodGir': '[[BosDurum]]: dolap boş, kod işe yaramaz.',
          'DOLU.gorevliAc': '[[DoluDurum]]: dolap kilitli değil; görevli bir şey yapmadı.',
          'BOS.gorevliAc': '[[BosDurum]]: dolap boş; görevliye iş yok.',
          'DOLU.kodGir.yanlis': `Yine [[DoluDurum]]: \`kodDogruMu\` → false, sayaç **${O[iCevap].s.hatali}/3**.${O[iCevap].s.hatali === 3 ? ' Üçüncü hata: `if (hatali == 3)` doğru!' : ''}`,
          'DOLU.kodGir.dogru': `[[DoluDurum]]: kod doğru — **aynı** \`kodGir\` KİLİTLİ’de reddedilmişti. \`paketiVer()\`, kapak açıldı; ${alici} paketini aldı.`,
          'KILITLI.gorevliAc': 'Görevli geldi: istek [[KilitliDurum]]’a gitti. Kilidi açan kural burada: sayaç sıfırlandı (`hatalariSifirla`).',
        }[anahtar];
        const isMsg = sonuc === 'dogru' ? msg.paketiVer : sonuc === 'yanlis' ? msg.hataliArtir : anahtar === 'KILITLI.gorevliAc' ? msg.sifirla : msg.devret;
        steps.push({
          t: `${kisa} → ${ST.SINIF[once]}`,
          x: ayni || `[[${ST.SINIF[once]}]] kendi cevabını verdi: “${cevap.t}”.`,
          code: [SF(once), IS[anahtar] || { block: IMZA[metot] }], dev: [MF, mainSatir], stack: fs, con: O[iCevap].n, seq: { b: k + 1, m: isMsg }, d: anahtar === 'KILITLI.paketKoy' ? 6800 : 5600,
          uml: { classes: ['KargoDolabi', ST.SINIF[once]], edges: ['durum'], members: [[ST.SINIF[once], metot]] },
          stage: base(iCevap, {
            hucre: hucre(cevap.tip),
            cevap,
            hl: sonuc === 'yanlis' ? { hatali: true } : sonuc === 'dogru' ? { paket: true } : anahtar === 'KILITLI.gorevliAc' ? { hatali: true } : {},
            kapak: sonuc === 'dogru',
            token: sonuc === 'dogru' ? { from: 'dolap', to: 'aktor:alici', text: ST.kisa(O[E('paketiVer')].koli), kind: 'koli' } : { from: 'aktor:' + aktor, to: 'hucre:' + metot + ':' + once, text: kisa, kind: cevap.tip === 'ok' ? 'req' : 'red' },
            banner: anahtar === 'KILITLI.paketKoy' ? { text: 'KİLİTLİ dolap paketi **reddetti**: kalıpsız sürümdeki hata burada yok.', tone: 'ok' } : null,
          }),
        });
      }
      if (gecisVar) {
        const gecX = {
          'BOS.paketKoy': '[[BosDurum]] bir sonraki durumu kendisi seçti: `dolap.durumDegistir(new DoluDurum())`. Dolabın `durum` alanı artık bir [[DoluDurum]] nesnesini gösteriyor; **sonraki istekler oraya gidecek**.',
          'DOLU.kodGir.yanlis': '[[DoluDurum]] üçüncü hatada dolabı kilitledi: `new KilitliDurum()`. Geçişi bağlam değil, **durum** yaptı.',
          'KILITLI.gorevliAc': '[[KilitliDurum]] dolabı yeniden DOLU yaptı: `new DoluDurum()`. Ali artık kodunu girebilir.',
          'DOLU.kodGir.dogru': 'Paket teslim edildi; [[DoluDurum]] dolabı BOŞ’a geçirdi: `new BosDurum()`.',
        }[anahtar];
        steps.push({
          t: `${ST.AD[once]} → ${ST.AD[hedef]}`,
          x: gecX || `Geçiş: ${ST.AD[once]} → ${ST.AD[hedef]}.`,
          code: [SF(once), GECIS[anahtar]], dev: [KF, 'void durumDegistir(DolapDurumu yeni) {'], stack: fs.concat([{ t: 'dolap.durumDegistir()', cls: 'KargoDolabi' }]), con: O[iGecis].n, seq: { b: k + 1, m: msg.gecis }, d: 5800,
          uml: { classes: ['KargoDolabi', ST.SINIF[once], ST.SINIF[hedef]], edges: ['durum'], members: [['KargoDolabi', 'durumDegistir']] },
          stage: base(iGecis, { hucre: hucre(cevap.tip), hedef, cevap, hl: { durum: true }, token: { from: 'hucre:' + metot + ':' + once, to: 'baslik:' + hedef, text: '→ ' + ST.AD[hedef], kind: 'gec' } }),
        });
      }
    });

    const i = O.length - 1;
    const s = O[i].s;
    const teslim = s.teslim.map((x) => `${x.kime}: ${ST.kisa(x.koli)}`).join(', ');
    steps.push({
      t: 'Sonuç',
      x: `Bağlamda tek bir \`if (durum…)\` yoktu: her istek o anki durum nesnesine gitti, geçişleri durumlar yaptı (**${s.gecis}** geçiş). Aynı \`dolap\` nesnesi, durumu değiştikçe başka davrandı.`,
      code: [MF, 'System.out.println(dolap.ozet());'], stack: [fMain], con: O[i].n, seq: { b: son, m: 2 }, d: 6400,
      uml: { classes: ['KargoDolabi', 'DolapDurumu', 'BosDurum', 'DoluDurum', 'KilitliDurum'], edges: ['durum', 'r-BOS', 'r-DOLU', 'r-KILITLI'] },
      stage: st(s, {
        istek: { metot: 'ozet', cagri: 'ozet()', devret: `durum.ad() → "${ST.AD[s.durum]}"` },
        cevap: { t: r.lines[r.lines.length - 1].t, tip: 'ok' },
        banner: { text: `${prog.ops.length} istek · **${s.gecis}** geçiş · if (durum…) yok${teslim ? ' · teslim: ' + teslim : ''}`, tone: 'ok' },
      }),
    });
    return { steps, seq, run: r };
  }

  ST.scenes.flow = function (root, ctx) {
    const S = ctx.state;
    let p = ST.presets[S.preset] || ST.presets.kilit;
    const el = h('div', { class: 'scene scene-flow' });
    const toolbar = h('div', { class: 'scene-toolbar' });
    const body = h('div', { class: 'flow-body' + (S.showCode === false ? ' hide-code' : '') });
    el.append(toolbar, body);
    root.appendChild(el);

    const presetSeg = kit.seg(
      ST.presetOrder.map((k) => ({ v: k, label: ST.presets[k].title, title: k === 'kilit' ? 'Üç hatalı kod, kilit, ikinci paket, görevli, Ali' : 'Mert’in paketi; dolu dolaba ikinci paket; Mert kodunu girer' })),
      p.key,
      (k) => setPreset(k),
      { label: 'Tarif' }
    );
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
      h('span', { class: 'tb-label' }, 'Tarif:'),
      presetSeg.el,
      h('span', { class: 'tb-hint sta-key', html: '<span class="sta-key-c">bağlam</span> isteği alır · <span class="sta-key-s">durum nesnesi</span> cevaplar · <span class="sta-key-g">geçiş</span> durumu değiştirir' }),
      h('span', { class: 'tb-spacer' }),
      viewSeg.el,
      codeBtn
    );

    const viewPanel = h('section', { class: 'panel flow-view' });
    const views = { stage: h('div', { class: 'fv fv-stage' }), seq: h('div', { class: 'fv fv-seq sta-fv-seq' }), uml: h('div', { class: 'fv fv-uml' }) };
    Object.values(views).forEach((x) => viewPanel.appendChild(x));
    const seqHead = h('div', { class: 'sta-seq-head' });
    const seqHost = h('div', { class: 'sta-seq-host' });
    views.seq.append(seqHead, seqHost);
    const codeCol = h('div', { class: 'flow-code' });
    const stackEl = h('div', { class: 'callstack', 'aria-label': 'Çağrı yığını' });
    const cvPanel = h('section', { class: 'panel flow-cv' });
    const consoleEl = h('div', { class: 'console sta-flow-console', 'aria-live': 'polite' });
    codeCol.append(stackEl, cvPanel, consoleEl);
    body.append(viewPanel, codeCol);

    const stage = new ST.DolapSahne(views.stage);
    const cv = new DP.CodeView(cvPanel, { roleOf: ST.roleOf, special: ST.special });
    let uml = null;
    let seq = null;
    let seqB = -1;
    let flow = null;
    let steps = [];
    let run = null;

    function load() {
      flow = flowSteps(p);
      steps = flow.steps;
      run = flow.run;
      seqB = -1;
      cv.setFiles(ST.akisFiles(p), { active: 'Main.java', keepActive: false });
      const spec = ST.gofDiagram({ notes: true });
      if (uml) uml.update(spec, { animate: false });
      else uml = new DP.ClassDiagram(views.uml, spec, { roles: ST.roles, roleTags: true });
    }

    function showSeq(b, m, animate) {
      const B = flow.seq.bolumler[b];
      if (b !== seqB) {
        seqHost.innerHTML = '';
        seq = new DP.SequenceDiagram(seqHost, B.spec, { roles: ST.roles });
        seqB = b;
        animate = false;
      }
      seqHead.innerHTML = `<b>${DP.esc(B.baslik)}</b><span>${b > 0 && b < flow.seq.bolumler.length - 1 ? `istek ${b} / ${flow.seq.bolumler.length - 2}` : ''}</span>`;
      seq.show(m, animate);
    }

    function setPreset(k) {
      if (ST.presets[k] === p) return;
      p = ST.presets[k];
      S.preset = k;
      presetSeg.set(k);
      load();
      stepper.setCount(steps.length, steps.map((s) => s.t));
      stepper.go(0, { force: true, animate: false });
    }

    function setView(k) {
      S.view = k;
      Object.keys(views).forEach((key) => (views[key].hidden = key !== k));
      viewSeg.set(k);
      if (stepper) render(stepper.index, -1, { animate: false });
    }

    function render(i, prev, info) {
      const s = steps[i];
      const ps = prev >= 0 && prev < steps.length ? steps[prev] : null;
      foot.set(i, steps.length, s.t, s.x);
      // önce yığın ve konsol (yükseklikleri değişir), sonra koddaki işaret
      renderStack(stackEl, s.stack);
      ST.renderConsole(consoleEl, ST.cmd(), run.lines.slice(0, s.con).map((l) => ST.consoleLine(l)), { animateFrom: info.animate && ps && s.con > ps.con ? ps.con : null, cursor: i < steps.length - 1 });
      cv.clear();
      for (let j = 0; j < i; j++) cv.mark(steps[j].code[0], steps[j].code[1], 'trail', { show: false, scroll: false });
      if (s.dev) cv.mark(s.dev[0], s.dev[1], 'focus', { show: false, scroll: false });
      cv.mark(s.code[0], s.code[1], 'active', { flash: !!ps && ps.code[0] !== s.code[0] });
      stage.render(s.stage, ps ? ps.stage : null, { animate: info.animate && S.view === 'stage' });
      showSeq(s.seq.b, s.seq.m, info.animate && S.view === 'seq');
      uml.stopFx();
      if (s.uml) uml.focus(s.uml);
      else uml.clearFocus();
      el.classList.toggle('is-done', i === steps.length - 1);
    }

    const foot = ui.foot(el);
    let stepper = null;
    load();
    stepper = new DP.Stepper(foot.stepHost, {
      count: steps.length,
      labels: steps.map((s) => s.t),
      delayOf: (i) => (steps[i] && steps[i].d) || 5400,
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

  // ================================================================== 5. DOLAP TEZGÂHI
  const { P, K, G } = ST.op;

  ST.scenes.counter = function (root, ctx) {
    const S = ctx.state;
    S.tz = S.tz || { design: 'durum', ops: ST.SENARYO.slice() };
    const unlocked = !!S.bakimUnlocked;
    const el = h('div', { class: 'scene scene-split sta-tz' });
    const body = h('div', { class: 'scene-body cols-tz' });
    const left = kit.panel('İstek masası', { cls: 'panel-code sta-left sta-tz-left' });
    const right = kit.panel('Kargo dolabı <span class="panel-sub">· aynı istekler, iki tasarım</span>', { cls: 'panel-side sta-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    // ---- denetimler
    const designSeg = kit.seg(
      [
        { v: 'naive', label: 'Kalıpsız · if/else', title: 'Durum bir dizgi; her metot durumu if/else ile sorar' },
        { v: 'durum', label: 'State · durum nesneleri', title: 'Her durum bir sınıf; dolap isteği o anki durum nesnesine devreder' },
      ],
      S.tz.design,
      (v) => act((c) => (c.design = v)),
      { label: 'Tasarım', cls: 'sta-seg' }
    );
    const koliRow = h('div', { class: 'sta-tz-grup' });
    const kodRow = h('div', { class: 'sta-tz-grup' });
    const bGorevli = h('button', { class: 'sta-tz-b is-gorevli', type: 'button', title: 'Şube görevlisi dolabı anahtarla açar' }, '🔑 Görevli aç');
    const bBakim = h('button', { class: 'sta-tz-b is-bakim', type: 'button' }, '');
    const opsRow = h('div', { class: 'sta-tz-ops' });
    const btnReset = h('button', { class: 'btn btn-ghost btn-sm', type: 'button', title: 'Oturumu boşalt' }, '↺ Sıfırla');
    const btnRun = h('button', { class: 'btn btn-primary btn-sm sta-run', type: 'button', title: 'Oturumu baştan, istek istek oynat' }, '▶ Oynat');
    bGorevli.addEventListener('click', () => ekle(G));
    bBakim.addEventListener('click', () => {
      if (!unlocked) {
        DP.fx.toast('HİZMET DIŞI durumu henüz yazılmadı! “Genişlet” sahnesinde ekleyin.', 2600);
        ctx.flashScene('genislet');
        return;
      }
      DP.fx.toast('Boş dolapta “Görevli aç” → HİZMET DIŞI; bir daha → BOŞ', 2600);
    });
    btnReset.addEventListener('click', () => act((c) => (c.ops = [])));
    btnRun.addEventListener('click', () => oynat());
    const controls = h(
      'div',
      { class: 'sta-tz-controls' },
      h('div', { class: 'sta-tz-row' }, h('span', { class: 'tb-label' }, 'Tasarım:'), designSeg.el, h('span', { class: 'tb-spacer' }), btnReset, btnRun),
      h('div', { class: 'sta-tz-row' }, h('span', { class: 'tb-label' }, 'Kurye:'), koliRow),
      h('div', { class: 'sta-tz-row' }, h('span', { class: 'tb-label' }, 'Kod:'), kodRow),
      h('div', { class: 'sta-tz-row' }, h('span', { class: 'tb-label' }, 'Görevli:'), bGorevli, bBakim),
      h('div', { class: 'sta-tz-row is-ops' }, h('span', { class: 'tb-label' }, 'Oturum:'), opsRow)
    );
    const cvHost = h('div', { class: 'sta-cv' });
    const consoleEl = h('div', { class: 'console sta-console' });
    left.body.append(controls, cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: ST.roleOf, special: ST.special });

    // ---- sağ: dolap + ölçüler
    const viewHost = h('div', { class: 'sta-view' });
    const metrics = h('div', { class: 'sta-metrics' });
    const extra = h('div', { class: 'sta-extra' });
    right.body.append(viewHost, metrics, extra);
    const stage = new ST.DolapSahne(viewHost, { cls: 'is-tezgah' });

    const FREE = 4;
    const STEPS = [
      {
        t: 'State: kilit ve görevli',
        x: 'Durum nesneleriyle aynı oturum: üç hatalı kod dolabı kilitledi, kilitli dolap Selin’in paketini **reddetti**, görevli kilidi açtı, Ali paketini aldı. Ölçüler temiz: **0** kilitli dolaba paket, **0** kayıtsız paket.',
        tz: { design: 'durum', ops: ST.SENARYO },
      },
      {
        t: 'Aynı oturum, kalıpsız',
        x: 'Aynı yedi istek, **if/else**’li dolapta. Kilitli dolap Selin’in paketini aldı (`else` dalı), kilit kalktı, Ali’nin kodu “hatalı” sayıldı. Ali’nin paketi dolabın içinde ama **kayıtsız** (kırmızı kutu).',
        tz: { design: 'naive', ops: ST.SENARYO },
      },
      {
        t: 'Kilitliyken doğru kod',
        x: 'Ali kodunu dolap **kilitliyken** girdi: [[KilitliDurum]] reddetti. Görevli açınca **aynı** kod, bu kez [[DoluDurum]]’da kapağı açtı. Aynı istek, aynı nesne, farklı davranış.',
        tz: { design: 'durum', ops: [P('KRG-1001'), K('1111'), K('2222'), K('3333'), K('4821'), G, K('4821')] },
      },
      {
        t: 'Kalıpsız: kilit bir daha çalışmaz',
        x: 'Kalıpsız dolapta hata zincirleme büyüyor: `else` dalı sayacı sıfırlamadığı için `hatali` 3’ü geçti. `if (hatali == 3)` bir daha hiç doğru olmayacak: yabancı **sınırsız** deneyebilir (5/3, 6/3 …).',
        tz: { design: 'naive', ops: ST.SENARYO.concat([K('5555'), K('6666')]) },
      },
      {
        t: 'Serbest: siz deneyin',
        x: unlocked
          ? 'Kurye olun (paket koyun), alıcı ya da yabancı olun (kod girin), görevliyi çağırın. Tasarımı değiştirip aynı oturumu karşılaştırın. **HİZMET DIŞI** da açık: boş dolapta “Görevli aç” deyin.'
          : 'Kurye olun (paket koyun), alıcı ya da yabancı olun (kod girin), görevliyi çağırın. Tasarımı değiştirip aynı oturumu karşılaştırın. (🔒 HİZMET DIŞI durumu Genişlet sahnesinde yazılır.)',
        free: true,
      },
    ];

    let cur = null;
    let timers = [];
    let last = null;

    function stop() {
      timers.forEach(clearTimeout);
      timers = [];
      btnRun.classList.remove('is-running');
    }
    const at = (ms, fn) => timers.push(setTimeout(fn, DP.dur(ms)));
    const show = (st, animate) => {
      stage.render(st, last, { animate });
      last = st;
    };

    function act(fn) {
      const c = { design: (cur || S.tz).design, ops: (cur || S.tz).ops.slice() };
      fn(c);
      c.bakim = unlocked;
      S.tz = c;
      if (!STEPS[stepper.index].free) stepper.go(FREE, { animate: true });
      else draw(S.tz, true);
    }

    function ekle(op) {
      const s = ST.run(ST.tezgahProg(cur || S.tz)).son;
      if (!ST.uygun(s, op)) {
        DP.fx.toast('Bu paket zaten dolapta ya da teslim edildi.', 2200);
        return;
      }
      act((c) => c.ops.push(op));
    }

    const etiket = (op) => (op.t === 'koy' ? `📦 ${ST.kisa(op.koli)}` : op.t === 'kod' ? `⌨ ${op.kod}` : '🔑 görevli');

    function renderControls(tz, s) {
      designSeg.set(tz.design);
      koliRow.innerHTML = '';
      ST.KOLILER.forEach((k) => {
        const K_ = ST.KOLI[k];
        const ok = ST.uygun(s, P(k));
        const yer = s.icerik.includes(k) ? 'dolapta' : s.teslim.some((x) => x.koli === k) ? 'teslim edildi' : s.kuryede.includes(k) ? 'kuryede (konamadı)' : 'kuryede';
        const b = h('button', { class: 'sta-tz-b is-koli', type: 'button', title: `${K_.tam} · ${yer}` }, `📦 ${ST.kisa(k)} ${K_.ad}`);
        b.disabled = !ok;
        b.addEventListener('click', () => ekle(P(k)));
        koliRow.appendChild(b);
      });
      kodRow.innerHTML = '';
      ST.KOLILER.forEach((k) => {
        const K_ = ST.KOLI[k];
        const b = h('button', { class: 'sta-tz-b is-kod', type: 'button', title: `${K_.tam}’in SMS kodu` }, `${K_.kod} · ${K_.ad}`);
        b.addEventListener('click', () => ekle(K(K_.kod)));
        kodRow.appendChild(b);
      });
      const yanlis = ST.siradakiYanlis(tz.ops);
      const by = h('button', { class: 'sta-tz-b is-yanlis', type: 'button', title: 'Yabancı bir kod dener' }, `❓ ${yanlis} · yabancı`);
      by.addEventListener('click', () => ekle(K(yanlis)));
      kodRow.appendChild(by);
      bBakim.innerHTML = unlocked ? '🛠 HİZMET DIŞI açık' : '🔒 HİZMET DIŞI';
      bBakim.classList.toggle('is-on', unlocked && tz.design === 'durum');
      bBakim.title = unlocked ? (tz.design === 'durum' ? 'Boş dolapta görevli: HİZMET DIŞI' : 'Kalıpsız dolapta HİZMET DIŞI yok') : 'Genişlet sahnesinde yazılır';
      opsRow.innerHTML = '';
      if (!tz.ops.length) opsRow.appendChild(h('span', { class: 'sta-tz-none' }, 'henüz istek yok'));
      tz.ops.forEach((op, i) => opsRow.appendChild(h('span', { class: 'sta-tz-op is-' + op.t + (op.t === 'kod' && ST.kimOf(op.kod) === 'yabancı' ? ' is-yabanci' : ''), title: i + 1 + '. istek' }, etiket(op))));
    }

    function renderMetrics(tz, o) {
      const tile = (v, label, cls) => `<div class="sta-mt-t${cls ? ' ' + cls : ''}"><b>${v}</b><span>${label}</span></div>`;
      const durumlu = tz.design === 'durum';
      metrics.innerHTML = `<div class="sta-mt">
        ${tile(o.istek, 'istek')}
        ${tile(o.gecis, 'geçiş')}
        ${tile(durumlu ? o.nesne : 0, 'durum nesnesi', durumlu ? '' : 'is-zero')}
        ${tile(o.kosul, 'if (durum…)', o.kosul ? 'is-warn' : 'is-good')}
        <span class="sta-mt-sep"></span>
        ${tile(o.kilitliKoy, 'kilitli dolaba paket', o.kilitliKoy ? 'is-bad' : 'is-good')}
        ${tile(o.kayip.length, 'kayıtsız paket', o.kayip.length ? 'is-bad' : 'is-good')}
      </div>`;
    }

    function finalState(tz, o) {
      const prog = ST.tezgahProg(tz);
      const st = ST.sonDurum(prog, { run: o.run });
      const ops = tz.ops;
      if (ops.length) {
        const op = ops[ops.length - 1];
        const r = o.run;
        const ilk = r.olaylar.find((x) => x.istek === ops.length - 1 && x.e === 'istek');
        const cevap = r.lines.filter((l) => l.i === ops.length - 1 && (l.k === 'cevap' || l.k === 'red' || l.k === 'hata')).pop();
        Object.assign(st, {
          aktor: ST.aktorOf(op),
          alici: op.t === 'kod' && ST.kimOf(op.kod) !== 'yabancı' ? ST.kimOf(op.kod) : null,
          istek: { metot: ST.metotOf(op), cagri: ST.cagriOf(op) },
          cevap: cevap ? { t: cevap.t.trim(), tip: cevap.k === 'hata' ? 'hata' : cevap.k === 'cevap' ? 'ok' : 'red' } : null,
          hucre: ilk ? { metot: ST.metotOf(op), durum: ilk.durum, tip: !cevap ? 'on' : cevap.k === 'hata' ? 'bad' : cevap.k === 'cevap' ? 'ok' : 'red' } : null,
          tuslar: op.t === 'kod' ? op.kod : null,
        });
      }
      const n = o.kilitliKoy + o.kayip.length;
      st.banner =
        tz.design === 'naive'
          ? n
            ? { text: `Kilitli dolaba **${o.kilitliKoy}** paket kondu · kayıtsız paket: **${o.kayip.map(ST.kisa).join(', ') || 'yok'}**`, tone: 'bad' }
            : { text: 'Kalıpsız dolap bu oturumda doğru davrandı: KİLİTLİ’ye paket gelmedi.' }
          : { text: `Durum: **${ST.AD[o.run.son.durum]}** · ${o.gecis} geçiş · her istek o anki durum nesnesine gitti`, tone: 'ok' };
      return st;
    }

    function draw(tz, animate) {
      stop();
      cur = { design: tz.design, ops: tz.ops.slice(), bakim: unlocked };
      const o = ST.olc(cur);
      renderControls(cur, o.run.son);
      renderMetrics(cur, o);
      // önce konsol, sonra kod
      ST.renderConsole(consoleEl, ST.cmd(true), o.run.lines.map((l) => ST.consoleLine(l, { notes: ST.hataNotu })), { animateFrom: animate ? 0 : null });
      const F = ST.tezgahFiles(cur);
      cv.setFiles(ST.fileList(F), { active: 'Main.java', keepActive: false });
      if (cur.ops.length) cv.mark('Main.java', ['KargoDolabi dolap = new KargoDolabi();', 'System.out.println(dolap.ozet());'], 'focus', { smooth: false });
      show(finalState(cur, o), animate);
      extra.innerHTML = `<div class="sta-oneline"><span class="tb-label">Kural:</span><span>${md(cur.design === 'naive' ? 'Her metot durumu **kendisi** sorar: `if (durum.equals(…))`. `paketKoy`’un `else` dalı KİLİTLİ’yi de BOŞ sanır.' : 'İstek o anki **durum nesnesine** devredilir: `durum.kodGir(this, kod)`. Her durum her isteğe kendi cevabını verir.')}</span></div>`;
    }

    /** Oturumu baştan oynatır: her istek için dolap, ızgara ve bir jeton */
    function oynat() {
      if (!cur) return;
      stop();
      const prog = ST.tezgahProg(cur);
      const r = ST.run(prog);
      const o = ST.olc(cur);
      const fin = finalState(cur, o);
      btnRun.classList.add('is-running');
      let t = 0;
      show(ST.stateFrom(prog, ST.BOS_AN, { banner: { text: 'Oturum baştan oynatılıyor…' } }), true);
      t += 700;
      cur.ops.forEach((op, k) => {
        const olaylar = r.olaylar.filter((x) => x.istek === k);
        const e = olaylar[olaylar.length - 1];
        const ilk = olaylar.find((x) => x.e === 'istek');
        const gecis = olaylar.find((x) => x.e === 'gecis');
        const hata = r.lines.some((l) => l.i === k && l.k === 'hata');
        const cevap = r.lines.filter((l) => l.i === k && (l.k === 'cevap' || l.k === 'red' || l.k === 'hata')).pop();
        const metot = ST.metotOf(op);
        at(t, () =>
          show(
            ST.stateFrom(prog, e.s, {
              aktor: ST.aktorOf(op),
              alici: op.t === 'kod' && ST.kimOf(op.kod) !== 'yabancı' ? ST.kimOf(op.kod) : null,
              istek: { metot, cagri: ST.cagriOf(op) },
              cevap: cevap ? { t: cevap.t.trim(), tip: hata ? 'hata' : cevap.k === 'cevap' ? 'ok' : 'red' } : null,
              hucre: { metot, durum: ilk.durum, tip: hata ? 'bad' : cevap && cevap.k === 'cevap' ? 'ok' : 'red' },
              hedef: gecis ? gecis.to : null,
              tuslar: op.t === 'kod' ? op.kod : null,
              kapak: olaylar.some((x) => x.e === 'cevap' && x.kime),
              token: { from: 'aktor:' + ST.aktorOf(op), to: 'hucre:' + metot + ':' + ilk.durum, text: etiket(op), kind: hata ? 'bad' : 'req' },
              banner: { text: `${k + 1}/${cur.ops.length} · ${ST.cagriOf(op)}${gecis ? ' · ' + ST.AD[gecis.from] + ' → ' + ST.AD[gecis.to] : ''}${hata ? ' — **hatalı dal!**' : ''}`, tone: hata ? 'bad' : null },
            }),
            true
          )
        );
        t += 1250;
      });
      at(t + 200, () => {
        show(fin, false);
        btnRun.classList.remove('is-running');
      });
    }

    const foot = ui.foot(el);
    let stepper = null;
    stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: (i) => (STEPS[i].free ? 6000 : 9400),
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        el.classList.toggle('is-free', !!s.free);
        draw(s.free ? S.tz : s.tz, info.animate);
      },
    });
    return kit.stepApi(stepper, {
      destroy: () => {
        stop();
        stepper.destroy();
        stage.destroy();
      },
    });
  };
})();
