/*
 * Memento — sahneler (2/3): CANLI AKIŞ ve YEDEK TEZGÂHI
 *   Canlı Akış: defter kaydet der; depo kendi hatırasını oluşturur (geniş arayüz), defter onu mühürlü saklar (dar arayüz).
 *               Plan yarıda hata verince defter hatırayı açmadan geri verir; depo hatırasına döner. İkinci tarif: iki kayıt noktası.
 *   Tezgâh   : koli taşıyın, kamyona yükleyin, kaydedin, geri yükleyin; aynı oturumu üç tasarımda karşılaştırın:
 *               referans (getRaflar), kopya (new TreeMap) ve Memento. Üretilen Main.java ve konsol birlikte görünür.
 */
(function () {
  'use strict';
  const MN = DP.mnt;
  const { h } = DP;
  const kit = DP.kit;
  const ui = MN.ui;
  const md = MN.md;

  function renderStack(stackEl, frames) {
    stackEl.innerHTML = '<span class="cs-label">Çağrı yığını</span>';
    frames.forEach((fr, i) => {
      if (i) stackEl.appendChild(h('span', { class: 'cs-sep' }, '›'));
      const r = MN.roleOf(fr.cls);
      stackEl.appendChild(h('span', { class: 'cs-frame' + (r ? ' rc rc-' + r : '') + (i === frames.length - 1 ? ' is-top' : '') }, fr.t));
    });
  }

  // ================================================================== 4. CANLI AKIŞ
  function flowSteps(p) {
    const seq = MN.seqSpec(p);
    const r = seq.run;
    const msgOf = seq.msgOf;
    const prog = p.prog;
    const O = r.olaylar;
    const MF = 'Main.java';
    const YF = 'YedekDefteri.java';
    const DF = 'Depo.java';
    const fMain = { t: 'Main.main()', cls: 'Main' };
    const fDefter = (m) => ({ t: `defter.${m}()`, cls: 'YedekDefteri' });
    const fDepo = (m) => ({ t: `depo.${m}()`, cls: 'Depo' });
    const st = (s, x) => MN.stateFrom(prog, s, x);
    const steps = [];
    const bul = (e, from, kosul) => O.findIndex((o, i) => i >= (from || 0) && o.e === e && (!kosul || kosul(o)));
    const islemSatiri = (op) => (op.t === 'tasi' ? `depo.tasi("${op.koli}", "${op.raf}");` : `depo.yukle("${op.koli}");`);

    steps.push({
      t: 'Kurulum',
      x: 'Main bir [[Depo]] (kaynak) ve bir [[YedekDefteri]] (emanetçi) yarattı. Depo’nun alanları birer nesne: `raflar → Map #1`, `kamyon → List #2`. Bu alanlar **dışarı açık değil**: get/set yok.',
      code: [MF, 'Depo depo = Depo.sabah();'], dev: [MF, 'YedekDefteri defter = new YedekDefteri(depo);'], stack: [fMain], con: 0, seq: -1, d: 5600,
      uml: { classes: ['Main', 'Depo', 'YedekDefteri'], edges: ['c-main', 'depo'] },
      stage: st(MN.BOS_AN(prog), { banner: { text: 'Depo’nun içi kapalı; defter yalnızca **hatıra** saklayabilir.' } }),
    });

    const gece = prog.tur === 'gece';
    let i0 = 0;
    // her kayıt: kaydetBas → hatiraOlustur → kaydet
    const kaydetAdimlari = (ad, ayrintili) => {
      const iBas = bul('kaydetBas', i0, (o) => o.ad === ad);
      const iOl = bul('hatiraOlustur', iBas);
      const iK = bul('kaydet', iOl, (o) => o.ad === ad);
      const hid = O[iOl].id;
      const masa = MN.masaOf(O[iOl].s, 'olustur', 'h');
      if (ayrintili) {
        steps.push({
          t: `defter.kaydet("${ad}")`,
          x: gece ? 'Gece planından önce Main deftere “kaydet” dedi. Defter yedeği **kendisi almıyor**: depodan bir hatıra isteyecek.' : `Main “${ad}” adıyla bir kayıt noktası istedi.`,
          code: [MF, `defter.kaydet("${ad}");`], dev: [YF, 'public void kaydet(String ad) {'], stack: [fMain, fDefter('kaydet')], con: O[iBas].n, seq: msgOf['kaydet:' + ad], d: 5000,
          uml: { classes: ['Main', 'YedekDefteri'], members: [['YedekDefteri', 'kaydet']] },
          stage: st(O[iBas].s, { defterHl: ad, token: { from: 'defter', to: 'depo', text: 'hatıra lütfen', kind: 'req' } }),
        });
        steps.push({
          t: 'depo.hatiraOlustur()',
          x: '[[Depo]] kendi durumunun kopyasını **kendisi** çıkardı: `new Hatira(raflar, kamyon)`. Hatıranın kurucusu raflar **ve** kamyonu kopyalıyor; hangi alanların, ne kadar derin kopyalanacağını Depo biliyor. Bu, **geniş arayüz**: Depo hatıranın içini görebilir.',
          code: [DF, 'return new Hatira(raflar, kamyon);'], dev: [DF, ['this.raflar = new TreeMap<>(raflar);', 'this.kamyon = new ArrayList<>(kamyon);']], stack: [fMain, fDefter('kaydet'), fDepo('hatiraOlustur')], con: O[iOl].n, seq: msgOf['yeni:' + hid], d: 6400,
          uml: { classes: ['Depo', 'Hatira'], edges: ['icinde'], members: [['Depo', 'hatiraOlustur'], ['Hatira', 'kurucu']] },
          stage: st(O[iOl].s, { masa, alanHl: { raflar: true, kamyon: true }, yontem: 'hatiraOlustur', token: { from: 'depo', to: 'masa', text: 'kopya', kind: 'hatira' } }),
        });
        steps.push({
          t: 'Mühürlü zarf deftere',
          x: `Defter hatırayı “${ad}” adıyla sakladı. Elinde bir \`Depo.Hatira\` var ama alanları **private**: içine bakamaz, değiştiremez. Bu, **dar arayüz**: emanetçi yalnızca saklar ve geri verir.`,
          code: [YF, 'yedekler.put(ad, depo.hatiraOlustur());'], dev: [YF, 'System.out.println("[Defter] kaydedildi: " + ad);'], stack: [fMain, fDefter('kaydet')], con: O[iK].n, seq: msgOf['kaydetDon:' + ad], d: 5800,
          uml: { classes: ['YedekDefteri', 'Hatira'], edges: ['yedekler'], members: [['YedekDefteri', 'yedekler']] },
          stage: st(O[iK].s, { defterHl: ad, token: { from: 'masa', to: 'kayit:' + ad, text: '✉ ' + ad, kind: 'hatira' } }),
        });
      } else {
        steps.push({
          t: `kaydet("${ad}")`,
          x: `İkinci kayıt noktası: depo yine kendi hatırasını oluşturdu (o anki raflar ve kamyon), defter onu “${ad}” adıyla sakladı. Defterde artık **iki** mühürlü zarf var.`,
          code: [MF, `defter.kaydet("${ad}");`], dev: [YF, 'yedekler.put(ad, depo.hatiraOlustur());'], stack: [fMain, fDefter('kaydet'), fDepo('hatiraOlustur')], con: O[iK].n, seq: msgOf['kaydetDon:' + ad], d: 5600,
          uml: { classes: ['YedekDefteri', 'Hatira', 'Depo'], edges: ['yedekler', 'icinde'] },
          stage: st(O[iK].s, { defterHl: ad, token: { from: 'depo', to: 'kayit:' + ad, text: '✉ ' + ad, kind: 'hatira' } }),
        });
      }
      i0 = iK + 1;
    };
    const islemAdimi = (op, k, ozel) => {
      const iIs = O.findIndex((o, i) => i >= i0 && (o.e === 'tasi' || o.e === 'yukle') && o.istek === k);
      const hedef = op.t === 'tasi' ? 'cell:' + op.raf : 'kamyon';
      steps.push({
        t: op.t === 'tasi' ? `tasi(${MN.kisa(op.koli)}, ${op.raf})` : `yukle(${MN.kisa(op.koli)})`,
        x: ozel || (op.t === 'tasi' ? `Depo koliyi taşıdı: ${op.koli} → ${op.raf}. Defterdeki zarf **değişmedi**: içinde kayıt anının kopyası var.` : `Depo ${op.koli}’i kamyona yükledi. Raflar ve kamyon değişti; hatıra yine aynı.`),
        code: [MF, islemSatiri(op)], dev: [DF, op.t === 'tasi' ? 'public void tasi(String koli, String raf) {' : 'public void yukle(String koli) {'], stack: [fMain, fDepo(op.t)], con: O[iIs].n, seq: msgOf['islem:' + k], d: 4600,
        uml: { classes: ['Depo'], members: [['Depo', op.t]] },
        stage: st(O[iIs].s, { hl: { [op.koli]: 'move' }, token: { from: 'depo', to: hedef, text: op.t === 'tasi' ? op.raf : 'kamyon', kind: 'req' } }),
      });
      i0 = iIs + 1;
    };
    const donAdimlari = (ad, ayrintili) => {
      const iBas = bul('donBas', i0, (o) => o.ad === ad);
      const iH = bul('hatirayaDon', iBas);
      const iD = bul('don', iH, (o) => o.ad === ad);
      const masa = MN.masaOf(O[iH].s, 'ac', 'h');
      if (ayrintili) {
        steps.push({
          t: `defter.geriYukle("${ad}")`,
          x: 'Plan iptal: Main deftere “geri yükle” dedi. Defter zarfı **açmadan** depoya geri veriyor; içinde ne olduğunu hâlâ bilmiyor.',
          code: [MF, `defter.geriYukle("${ad}");`], dev: [YF, 'depo.hatirayaDon(yedekler.get(ad));'], stack: [fMain, fDefter('geriYukle')], con: O[iBas].n, seq: msgOf['don:' + ad], d: 5200,
          uml: { classes: ['Main', 'YedekDefteri'], members: [['YedekDefteri', 'geriYukle']] },
          stage: st(O[iBas].s, { defterHl: ad, token: { from: 'kayit:' + ad, to: 'masa', text: '✉ ' + ad, kind: 'hatira' } }),
        });
        steps.push({
          t: 'depo.hatirayaDon(h)',
          x: 'Zarfı yalnızca [[Depo]] açabilir: `h.raflar` ve `h.kamyon` private ama Depo’nun **iç sınıfı** olduğu için erişebiliyor. Depo kendi haritasını ve listesini temizleyip hatıradaki kopyayı geri koydu: raflar **ve kamyon** sabah hâlinde.',
          code: [DF, 'raflar.putAll(h.raflar);'], dev: [DF, ['raflar.clear();', 'kamyon.addAll(h.kamyon);']], stack: [fMain, fDefter('geriYukle'), fDepo('hatirayaDon')], con: O[iH].n, seq: msgOf['oku:' + O[iH].id], d: 6400,
          uml: { classes: ['Depo', 'Hatira'], edges: ['icinde'], members: [['Depo', 'hatirayaDon']] },
          stage: st(O[iH].s, { masa, alanHl: { raflar: true, kamyon: true }, yontem: 'hatirayaDon', hl: hlDon(O[iBas].s, O[iH].s) }),
        });
        steps.push({
          t: 'geri yüklendi',
          x: 'Defter işini bitirdi ve yazdı. Dikkat: Depo’nun nesneleri aynı kaldı (`Map #1`, `List #2`); yalnızca içerikleri hatıradaki kopyayla değişti. Hatıra da defterde duruyor: istenirse yine kullanılabilir.',
          code: [YF, 'System.out.println("[Defter] geri yüklendi: " + ad);'], dev: [YF, 'public void geriYukle(String ad) {'], stack: [fMain, fDefter('geriYukle')], con: O[iD].n, seq: msgOf['donDon:' + ad], d: 5200,
          uml: { classes: ['YedekDefteri'], members: [['YedekDefteri', 'geriYukle']] },
          stage: st(O[iD].s, { defterHl: ad }),
        });
      } else {
        steps.push({
          t: `geriYukle("${ad}")`,
          x: `“${ad}” zarfı depoya döndü; depo onu açıp o anki hâline geri geçti: ${MN.kisa('KRG-1001')} yine A1’de, kamyon boş. “10:00” zarfı defterde duruyor: istenirse ona da dönülebilir.`,
          code: [MF, `defter.geriYukle("${ad}");`], dev: [DF, 'raflar.putAll(h.raflar);'], stack: [fMain, fDefter('geriYukle'), fDepo('hatirayaDon')], con: O[iD].n, seq: msgOf['donDon:' + ad], d: 6200,
          uml: { classes: ['YedekDefteri', 'Hatira', 'Depo'], edges: ['yedekler', 'icinde'], members: [['Depo', 'hatirayaDon']] },
          stage: st(O[iD].s, { masa, defterHl: ad, hl: hlDon(O[iBas].s, O[iH].s), token: { from: 'kayit:' + ad, to: 'masa', text: '✉ ' + ad, kind: 'hatira' } }),
        });
      }
      i0 = iD + 1;
    };
    /** Geri yüklemede yer değiştiren koliler (yeşil) */
    const hlDon = (once, sonra) => {
      const hl = {};
      Object.keys(sonra.raflar).forEach((k) => once.raflar[k] !== sonra.raflar[k] && (hl[k] = 'ok'));
      return hl;
    };

    if (gece) {
      kaydetAdimlari('02:00', true);
      prog.plan.forEach((op, k) => {
        if (k === prog.plan.length - 1) return;
        islemAdimi(op, k + 1);
      });
      const son = prog.plan[prog.plan.length - 1];
      const iHata = bul('hata', i0);
      steps.push({
        t: `tasi(${MN.kisa(son.koli)}, ${son.raf}): dolu!`,
        x: `Planlama hatası: ${son.raf} az önce ${MN.kisa('KRG-1004')}’e verilmişti. \`tasi\` bir \`IllegalStateException\` fırlattı; plan yarıda kaldı. Depo şu an “yarım” bir hâlde: iki koli kamyonda, biri yer değiştirmiş.`,
        code: [MF, islemSatiri(son)], dev: [DF, 'throw new IllegalStateException(raf + " dolu");'], stack: [fMain, fDepo('tasi')], con: O[iHata].n, seq: msgOf.hata, d: 6000,
        uml: { classes: ['Depo'], members: [['Depo', 'tasi']] },
        stage: st(O[iHata].s, { hataRaf: son.raf, hl: { [son.koli]: 'bad' }, token: { from: 'cell:' + MN.SABAH[son.koli], to: 'cell:' + son.raf, text: son.raf + '?', kind: 'bad' } }),
      });
      const iY = bul('yakala', iHata);
      steps.push({
        t: 'catch: plan iptal',
        x: 'Main istisnayı yakaladı ve hatayı yazdı. “Ya hep ya hiç”: yarım kalan planın hiçbir izi kalmamalı.',
        code: [MF, 'System.out.println("[Gece] HATA: " + e.getMessage());'], dev: [MF, '} catch (IllegalStateException e) {'], stack: [fMain], con: O[iY].n, seq: msgOf.hata, d: 4600,
        uml: { classes: ['Main'] },
        stage: st(O[iY].s, { hataRaf: son.raf, banner: { text: 'Plan yarıda kaldı: depo **02:00** hâline dönmeli.', tone: 'bad' } }),
      });
      i0 = iY + 1;
      donAdimlari('02:00', true);
    } else {
      prog.ops.forEach((op, k) => {
        if (op.t === 'kaydet') kaydetAdimlari(op.ad, k === 0);
        else if (op.t === 'don') donAdimlari(op.ad, false);
        else islemAdimi(op, k);
      });
    }

    const i = O.length - 1;
    const s = O[i].s;
    steps.push({
      t: 'Sonuç',
      x: gece
        ? 'Depo plandan önceki hâlinde: raflar sabah düzeninde, kamyon boş, hiçbir koli iki yerde değil. Defter bu sonuca deponun içini **hiç görmeden** ulaştı; Depo da içini kimseye açmadı.'
        : 'Kayıt noktaları birer mühürlü zarf: hangisine dönüleceğini defter (ya da kullanıcı) seçer, nasıl dönüleceğini Depo bilir. Defter iki zarfı da saklıyor ama ikisinin de içini bilmiyor.',
      code: [MF, 'System.out.println(depo.durum());'], stack: [fMain], con: O[i].n, seq: seq.spec.messages.length - 1, d: 6400,
      uml: { classes: ['Depo', 'Hatira', 'YedekDefteri'], edges: ['icinde', 'yedekler', 'depo'] },
      stage: st(s, { banner: { text: gece ? 'Plan iptal · depo **02:00** hâlinde · kamyon boş · iki yerde koli yok' : `Defterde **${s.yedekler.length}** hatıra · depo **09:00** hâlinde`, tone: 'ok' } }),
    });
    return { steps, seq, run: r };
  }

  MN.scenes.flow = function (root, ctx) {
    const S = ctx.state;
    let p = MN.presets[S.preset] || MN.presets.gece;
    const el = h('div', { class: 'scene scene-flow' });
    const toolbar = h('div', { class: 'scene-toolbar' });
    const body = h('div', { class: 'flow-body' + (S.showCode === false ? ' hide-code' : '') });
    el.append(toolbar, body);
    root.appendChild(el);

    const presetSeg = kit.seg(
      MN.presetOrder.map((k) => ({ v: k, label: MN.presets[k].title, title: k === 'gece' ? 'Kaydet, planı uygula, hata olunca geri yükle' : 'İki kayıt noktası, sonra ilkine dönüş' })),
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
      h('span', { class: 'tb-hint mnt-key', html: '<span class="mnt-key-o">kaynak</span> hatırayı oluşturur · <span class="mnt-key-c">emanetçi</span> saklar · <span class="mnt-key-m">hatıra</span> mühürlüdür' }),
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
    const consoleEl = h('div', { class: 'console mnt-flow-console', 'aria-live': 'polite' });
    codeCol.append(stackEl, cvPanel, consoleEl);
    body.append(viewPanel, codeCol);

    const stage = new MN.DepoSahne(views.stage);
    const cv = new DP.CodeView(cvPanel, { roleOf: MN.roleOf, special: MN.special });
    let uml = null;
    let seq = null;
    let steps = [];
    let run = null;

    function load() {
      const f = flowSteps(p);
      steps = f.steps;
      run = f.run;
      cv.setFiles(MN.akisFiles(p), { active: 'Main.java', keepActive: false });
      views.seq.innerHTML = '';
      seq = new DP.SequenceDiagram(views.seq, f.seq.spec, { roles: MN.roles });
      const spec = MN.gofDiagram({ notes: true });
      if (uml) uml.update(spec, { animate: false });
      else uml = new DP.ClassDiagram(views.uml, spec, { roles: MN.roles, roleTags: true });
    }

    function setPreset(k) {
      if (MN.presets[k] === p) return;
      p = MN.presets[k];
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
      MN.renderConsole(consoleEl, MN.cmd(), run.lines.slice(0, s.con).map((l) => MN.consoleLine(l)), { animateFrom: info.animate && ps && s.con > ps.con ? ps.con : null, cursor: i < steps.length - 1 });
      cv.clear();
      for (let j = 0; j < i; j++) cv.mark(steps[j].code[0], steps[j].code[1], 'trail', { show: false, scroll: false });
      if (s.dev) cv.mark(s.dev[0], s.dev[1], 'focus', { show: false, scroll: false });
      cv.mark(s.code[0], s.code[1], 'active', { flash: !!ps && ps.code[0] !== s.code[0] });
      stage.render(s.stage, ps ? ps.stage : null, { animate: info.animate && S.view === 'stage' });
      seq.show(s.seq, info.animate && S.view === 'seq');
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

  // ================================================================== 5. YEDEK TEZGÂHI
  const { T, Y, K, D, G, I } = MN.op;
  const ANA = MN.TEZGAH_ANA;

  MN.scenes.counter = function (root, ctx) {
    const S = ctx.state;
    S.tz = S.tz || { design: 'hatira', ops: ANA.slice() };
    const unlocked = !!S.gecmisUnlocked;
    const el = h('div', { class: 'scene scene-split mnt-tz' });
    const body = h('div', { class: 'scene-body cols-tz' });
    const left = kit.panel('Vardiya masası', { cls: 'panel-code mnt-left mnt-tz-left' });
    const right = kit.panel('Depo <span class="panel-sub">· aynı oturum, üç yedek yöntemi</span>', { cls: 'panel-side mnt-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    // ---- denetimler
    const designSeg = kit.seg(
      [
        { v: 'referans', label: 'Referans', title: 'yedekler.put(ad, depo.getRaflar())' },
        { v: 'kopya', label: 'Kopya', title: 'yedekler.put(ad, new TreeMap<>(depo.getRaflar()))' },
        { v: 'hatira', label: 'Memento', title: 'yedekler.put(ad, depo.hatiraOlustur())' },
      ],
      S.tz.design,
      (v) => act((c) => (c.design = v)),
      { label: 'Tasarım', cls: 'mnt-seg' }
    );
    let secili = 'KRG-1001';
    const koliRow = h('div', { class: 'mnt-tz-koliler' });
    const rafSel = h('select', { class: 'mnt-tz-sel', 'aria-label': 'Hedef raf' });
    const bTasi = h('button', { class: 'mnt-tz-b', type: 'button' }, 'Taşı →');
    const bYukle = h('button', { class: 'mnt-tz-b', type: 'button', title: 'Seçili koliyi kamyona yükle' }, 'Kamyona yükle');
    const bKaydet = h('button', { class: 'mnt-tz-b is-kaydet', type: 'button' }, '');
    const kayitSel = h('select', { class: 'mnt-tz-sel', 'aria-label': 'Kayıt' });
    const bDon = h('button', { class: 'mnt-tz-b is-don', type: 'button' }, '⟲ Geri yükle');
    const bGeri = h('button', { class: 'mnt-tz-b is-gecmis', type: 'button' }, '');
    const bIleri = h('button', { class: 'mnt-tz-b is-gecmis', type: 'button' }, '');
    const opsRow = h('div', { class: 'mnt-tz-ops' });
    const btnReset = h('button', { class: 'btn btn-ghost btn-sm', type: 'button', title: 'Oturumu boşalt' }, '↺ Sıfırla');
    const btnRun = h('button', { class: 'btn btn-primary btn-sm mnt-run', type: 'button', title: 'Oturumu baştan, istek istek oynat' }, '▶ Oynat');
    bTasi.addEventListener('click', () => ekle(T(secili, rafSel.value)));
    bYukle.addEventListener('click', () => ekle(Y(secili)));
    bKaydet.addEventListener('click', () => ekle(K(MN.siradakiKayit((cur || S.tz).ops))));
    bDon.addEventListener('click', () => kayitSel.value && ekle(D(kayitSel.value)));
    const kilitli = () => {
      DP.fx.toast('Geri al / yinele henüz yazılmadı! “Genişlet” sahnesinde ekleyin.', 2600);
      ctx.flashScene('genislet');
    };
    bGeri.addEventListener('click', () => (unlocked ? ekle(G) : kilitli()));
    bIleri.addEventListener('click', () => (unlocked ? ekle(I) : kilitli()));
    btnReset.addEventListener('click', () => act((c) => (c.ops = [])));
    btnRun.addEventListener('click', () => oynat());
    const controls = h(
      'div',
      { class: 'mnt-tz-controls' },
      h('div', { class: 'mnt-tz-row' }, h('span', { class: 'tb-label' }, 'Yedek:'), designSeg.el, h('span', { class: 'tb-spacer' }), btnReset, btnRun),
      h('div', { class: 'mnt-tz-row' }, h('span', { class: 'tb-label' }, 'Koli:'), koliRow),
      h('div', { class: 'mnt-tz-row' }, h('span', { class: 'tb-label' }, 'İşlem:'), bTasi, rafSel, bYukle),
      h('div', { class: 'mnt-tz-row' }, h('span', { class: 'tb-label' }, 'Defter:'), bKaydet, bDon, kayitSel, bGeri, bIleri),
      h('div', { class: 'mnt-tz-row is-ops' }, h('span', { class: 'tb-label' }, 'Oturum:'), opsRow)
    );
    const cvHost = h('div', { class: 'mnt-cv' });
    const consoleEl = h('div', { class: 'console mnt-console' });
    left.body.append(controls, cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: MN.roleOf, special: MN.special });

    // ---- sağ: depo + ölçüler
    const viewHost = h('div', { class: 'mnt-view' });
    const metrics = h('div', { class: 'mnt-metrics' });
    const extra = h('div', { class: 'mnt-extra' });
    right.body.append(viewHost, metrics, extra);
    const stage = new MN.DepoSahne(viewHost, { cls: 'is-tezgah' });

    const FREE = 4;
    const STEPS = [
      {
        t: 'Memento: kaydet, değiştir, geri yükle',
        x: '09:00’da kayıt alındı; sonra iki koli kamyona yüklendi, biri taşındı. Geri yükleme depoyu **tam** 09:00 hâline getirdi: raflar ve kamyon. Ölçüler temiz: **0** hatalı geri yükleme, **0** iki yerde koli.',
        tz: { design: 'hatira', ops: ANA },
      },
      {
        t: 'Aynı oturum: kopya',
        x: 'Aynı istekler, **kopya** yöntemiyle (sürüm 1.1/2.0). Raflar döndü, kamyon dönmedi: 1001 ve 1005 **iki yerde**. Defter kamyonun varlığından habersiz.',
        tz: { design: 'kopya', ops: ANA },
      },
      {
        t: 'Aynı oturum: referans',
        x: '**Referans** yöntemiyle (sürüm 1.0) yedek, deponun kendi haritası (Map #1). Geri yükleme hiçbir şey yapmadı: depo planın sonundaki hâlinde kaldı. Kayıt sayfası da depoyla birlikte değişmiş.',
        tz: { design: 'referans', ops: ANA },
      },
      {
        t: 'Kopya: aynı kayda iki kez',
        x: 'Kopya yöntemi bile yetmiyor: ilk geri yüklemede `setRaflar(yedek)` deponun alanını **yedeğin kendisine** bağladı. Sonraki taşıma yedeği bozdu; ikinci geri yükleme 1002’yi B4’te bıraktı. Kopyalamak, geri yüklerken de gerekiyordu: bunu en iyi Depo bilir.',
        tz: { design: 'kopya', ops: [K('09:00'), T('KRG-1001', 'B3'), D('09:00'), T('KRG-1002', 'B4'), D('09:00')] },
      },
      {
        t: 'Serbest: siz deneyin',
        x: unlocked
          ? 'Koli seçip taşıyın, yükleyin; istediğiniz anda kaydedin ve geri yükleyin. Yöntemi değiştirip aynı oturumu karşılaştırın. **Geri al / yinele** de açık (Memento).'
          : 'Koli seçip taşıyın, yükleyin; istediğiniz anda kaydedin ve geri yükleyin. Yöntemi değiştirip aynı oturumu karşılaştırın. (🔒 Geri al / yinele, Genişlet sahnesinde yazılır.)',
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
      // geri al / yinele yalnızca Memento tasarımında var
      if (c.design !== 'hatira' || !unlocked) c.ops = c.ops.filter((op) => op.t !== 'geri' && op.t !== 'ileri');
      c.gecmis = c.design === 'hatira' && unlocked;
      S.tz = c;
      if (!STEPS[stepper.index].free) stepper.go(FREE, { animate: true });
      else draw(S.tz, true);
    }

    function ekle(op) {
      const tz = cur || S.tz;
      const s = MN.run(MN.tezgahProg(tz)).son;
      if (!MN.uygun(s, op, tz)) {
        DP.fx.toast(op.t === 'tasi' ? 'Hedef raf dolu ya da koli rafta değil.' : op.t === 'kaydet' ? 'En çok ' + MN.KAYIT_EN_COK + ' kayıt.' : 'Bu istek şu an yapılamaz.', 2200);
        return;
      }
      act((c) => c.ops.push(op));
    }

    const etiket = (op) => (op.t === 'tasi' ? `${MN.kisa(op.koli)}→${op.raf}` : op.t === 'yukle' ? `🚚 ${MN.kisa(op.koli)}` : op.t === 'kaydet' ? `📸 ${op.ad}` : op.t === 'don' ? `⟲ ${op.ad}` : op.t === 'geri' ? '↶' : '↷');

    function renderControls(tz, s) {
      designSeg.set(tz.design);
      if (!s.raflar[secili]) secili = MN.KOLILER.find((k) => s.raflar[k]) || secili;
      koliRow.innerHTML = '';
      MN.KOLILER.forEach((k) => {
        const rafta = !!s.raflar[k];
        const b = h('button', { class: 'mnt-tz-koli' + (k === secili ? ' is-on' : '') + (rafta ? '' : ' is-kamyon'), type: 'button', title: rafta ? `${MN.KOLI[k].tam} · ${s.raflar[k]}` : 'kamyonda' }, `${MN.kisa(k)} · ${rafta ? s.raflar[k] : '🚚'}`);
        b.disabled = !rafta;
        b.addEventListener('click', () => {
          secili = k;
          renderControls(cur, MN.run(MN.tezgahProg(cur)).son);
        });
        koliRow.appendChild(b);
      });
      const bos = MN.RAFLAR.filter((r) => !Object.values(s.raflar).includes(r));
      const onceki = rafSel.value;
      rafSel.innerHTML = bos.map((r) => `<option value="${r}">${r}</option>`).join('');
      if (bos.includes(onceki)) rafSel.value = onceki;
      bTasi.disabled = rafSel.disabled = !s.raflar[secili] || !bos.length;
      bYukle.disabled = !s.raflar[secili];
      const kayitlar = tz.ops.filter((x) => x.t === 'kaydet').map((x) => x.ad);
      const sonKayit = kayitSel.value;
      kayitSel.innerHTML = kayitlar.map((a) => `<option value="${a}">${a}</option>`).join('');
      if (kayitlar.includes(sonKayit)) kayitSel.value = sonKayit;
      else if (kayitlar.length) kayitSel.value = kayitlar[kayitlar.length - 1];
      bDon.disabled = kayitSel.disabled = !kayitlar.length;
      bKaydet.innerHTML = `📸 Kaydet <code>${MN.siradakiKayit(tz.ops)}</code>`;
      bKaydet.disabled = kayitlar.length >= MN.KAYIT_EN_COK;
      bGeri.innerHTML = (unlocked ? '' : '🔒 ') + '↶ Geri al';
      bIleri.innerHTML = (unlocked ? '' : '🔒 ') + '↷ Yinele';
      bGeri.disabled = bIleri.disabled = unlocked && tz.design !== 'hatira';
      bGeri.title = bIleri.title = unlocked ? (tz.design === 'hatira' ? 'DepoGecmisi: her işlemden önce hatıra' : 'Geri al / yinele yalnızca Memento tasarımında') : 'Genişlet sahnesinde yazılır';
      opsRow.innerHTML = '';
      if (!tz.ops.length) opsRow.appendChild(h('span', { class: 'mnt-tz-none' }, 'henüz istek yok'));
      tz.ops.forEach((op, i) => opsRow.appendChild(h('span', { class: 'mnt-tz-op is-' + op.t, title: i + 1 + '. istek' }, etiket(op))));
    }

    function renderMetrics(tz, o) {
      const tile = (v, label, cls) => `<div class="mnt-mt-t${cls ? ' ' + cls : ''}"><b>${v}</b><span>${label}</span></div>`;
      metrics.innerHTML = `<div class="mnt-mt">
        ${tile(o.islem, 'işlem')}
        ${tile(o.kayit, 'kayıt')}
        ${tile(o.kopyalanan, 'kopyalanan kayıt', tz.design === 'referans' ? 'is-zero' : '')}
        <span class="mnt-mt-sep"></span>
        ${tile(o.hatali, 'hatalı geri yükleme', o.hatali ? 'is-bad' : 'is-good')}
        ${tile(o.ikiYerde.length, 'iki yerde koli', o.ikiYerde.length ? 'is-bad' : 'is-good')}
      </div>`;
    }

    function finalState(tz, o) {
      const prog = MN.tezgahProg(tz);
      const st = MN.sonDurum(prog, { run: o.run });
      const n = o.hatali + o.ikiYerde.length;
      st.banner =
        tz.design === 'hatira'
          ? { text: `Memento · ${o.kayit} kayıt · **${o.kopyalanan}** kopyalanan kayıt · her geri yükleme tam`, tone: 'ok' }
          : n
          ? { text: `**${o.hatali}** hatalı geri yükleme · iki yerde: **${o.ikiYerde.map(MN.kisa).join(', ') || 'yok'}**`, tone: 'bad' }
          : { text: tz.design === 'kopya' ? 'Kopya bu oturumda yetti: kamyona dokunulmadı, aynı kayda bir kez dönüldü.' : 'Referans bu oturumda sorun çıkarmadı (geri yükleme yok ya da depo değişmedi).' };
      return st;
    }

    function draw(tz, animate) {
      stop();
      cur = { design: tz.design, ops: tz.ops.slice(), gecmis: tz.design === 'hatira' && unlocked };
      const o = MN.olc(cur);
      renderControls(cur, o.run.son);
      renderMetrics(cur, o);
      // önce konsol, sonra kod
      MN.renderConsole(consoleEl, MN.cmd(true), o.run.lines.map((l) => MN.consoleLine(l)), { animateFrom: animate ? 0 : null });
      const F = MN.tezgahFiles(cur);
      cv.setFiles(MN.fileList(F), { active: F.YedekDefteri ? 'YedekDefteri.java' : 'Main.java', keepActive: false });
      if (F.YedekDefteri) cv.mark('YedekDefteri.java', ['public void kaydet(String ad) {', 'System.out.println("[Defter] geri yüklendi: " + ad);'], 'focus', { smooth: false });
      show(finalState(cur, o), animate);
      const kural = {
        referans: 'Yedek, deponun **kendi haritası**: `depo.getRaflar()` yeni nesne yaratmaz. Kamyon hiç kaydedilmez.',
        kopya: 'Yedek, haritanın **kopyası**; ama geri yüklerken `setRaflar(yedek)` kopyalamaz ve kamyon hiç kaydedilmez.',
        hatira: 'Depo hatırasını **kendisi** oluşturur (raflar + kamyon, kopya) ve ona kendisi döner; defter yalnızca saklar.',
      }[cur.design];
      extra.innerHTML = `<div class="mnt-oneline"><span class="tb-label">Kural:</span><span>${md(kural)}</span></div>`;
    }

    /** Oturumu baştan oynatır: her istek için depo, defter ve bir jeton */
    function oynat() {
      if (!cur) return;
      stop();
      const prog = MN.tezgahProg(cur);
      const r = MN.run(prog);
      const o = MN.olc(cur);
      const fin = finalState(cur, o);
      btnRun.classList.add('is-running');
      let t = 0;
      show(MN.stateFrom(prog, MN.BOS_AN(prog), { banner: { text: 'Oturum baştan oynatılıyor…' } }), true);
      t += 700;
      cur.ops.forEach((op, k) => {
        const olaylar = r.olaylar.filter((x) => x.istek === k);
        const e = olaylar[olaylar.length - 1];
        if (!e) return;
        const don = olaylar.find((x) => x.e === 'don');
        const hy = don && !don.ok ? MN.hayalet(e.s, don.dogru) : { ghost: {}, hl: {} };
        const hl = Object.assign({}, hy.hl);
        if (op.t === 'tasi' || op.t === 'yukle') hl[op.koli] = 'move';
        const tok =
          op.t === 'tasi'
            ? { from: 'cell:' + (r.olaylar.find((x) => x.istek === k && x.e === 'tasi') || {}).from, to: 'cell:' + op.raf, text: MN.kisa(op.koli), kind: 'req' }
            : op.t === 'yukle'
            ? { from: 'depo', to: 'kamyon', text: MN.kisa(op.koli), kind: 'req' }
            : op.t === 'kaydet'
            ? { from: 'depo', to: 'kayit:' + op.ad, text: '📸 ' + op.ad, kind: 'hatira' }
            : op.t === 'don'
            ? { from: 'kayit:' + op.ad, to: 'depo', text: '⟲ ' + op.ad, kind: don && don.ok ? 'ok' : 'bad' }
            : null;
        at(t, () =>
          show(
            MN.stateFrom(prog, e.s, {
              hl,
              ghost: hy.ghost,
              defterHl: op.ad || null,
              token: tok,
              banner: { text: `${k + 1}/${cur.ops.length} · ${etiket(op)}${don && !don.ok ? ' — **depo kayıttaki hâline dönmedi**' : ''}`, tone: don && !don.ok ? 'bad' : null },
            }),
            true
          )
        );
        t += 1200;
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
