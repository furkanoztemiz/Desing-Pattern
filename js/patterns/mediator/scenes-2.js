/*
 * Mediator — sahneler (2/3): CANLI AKIŞ ve FORM TEZGÂHI
 *   Canlı Akış: öğe değişir, yalnızca yöneticiye haber verir (degisti(this)); yönetici ötekilerin durumunu okur,
 *               kuralları tek yerde uygular ve öğeleri ayarlar. İki tarif: soğuk zincirli ilaç · ağır koli.
 *   Tezgâh   : formu doldurun; aynı işlem sırasını üç tasarımda karşılaştırın: dağınık kurallar (sürüm 2.0),
 *               kopyalı ama tam kurallar, Mediator. Üretilen Main.java ve konsol birlikte görünür.
 */
(function () {
  'use strict';
  const MD = DP.med;
  const { h } = DP;
  const kit = DP.kit;
  const ui = MD.ui;
  const md = MD.md;

  function renderStack(stackEl, frames) {
    stackEl.innerHTML = '<span class="cs-label">Çağrı yığını</span>';
    frames.forEach((fr, i) => {
      if (i) stackEl.appendChild(h('span', { class: 'cs-sep' }, '›'));
      const r = MD.roleOf(fr.cls);
      stackEl.appendChild(h('span', { class: 'cs-frame' + (r ? ' rc rc-' + r : '') + (i === frames.length - 1 ? ' is-top' : '') }, fr.t));
    });
  }

  // ================================================================== 4. CANLI AKIŞ
  const YONTEM = { sehir: 'sec', agirlik: 'yaz', soguk: 'isaretle', sigorta: 'isaretle', teslimat: 'sec' };
  const ILK_SATIR = {
    sehir: 'secili = sehir;',
    agirlik: 'this.kg = kg;',
    soguk: 'this.isaretli = isaretli;',
    sigorta: 'this.isaretli = isaretli;',
    teslimat: 'secili = secenek;',
  };

  function flowSteps(p) {
    const seq = MD.seqSpec(p);
    const r = seq.run;
    const prog = p.prog;
    const O = r.olaylar;
    const B = seq.bolumler;
    const MF = 'Main.java';
    const GF = 'GonderiFormu.java';
    const OF = 'FormOgesi.java';
    const TF = 'TeslimatSecici.java';
    const UF = 'UcretEtiketi.java';
    const SF = (o) => MD.OGE[o].sinif + '.java';
    const fMain = { t: 'Main.main()', cls: 'Main' };
    const fOge = (o) => ({ t: `${o}.${YONTEM[o]}()`, cls: MD.OGE[o].sinif });
    const fForm = (m) => ({ t: `form.${m}()`, cls: 'GonderiFormu' });
    const fOgeDeg = { t: 'FormOgesi.degisti()', cls: 'FormOgesi' };
    const st = (s, x) => MD.stateFrom(prog, s, x);
    const steps = [];
    const son = B.length - 1;
    const kur = O.find((x) => x.e === 'kur');

    steps.push({
      t: 'Kurulum',
      x: 'Main bir [[GonderiFormu]] yarattı. Form, beş öğesini **kendisi** yarattı ve her birine kendini verdi: `new SehirSecici(this)`. Öğeler birbirini tanımıyor; her biri yalnızca yöneticisini (formu) biliyor.',
      code: [MF, 'GonderiFormu form = new GonderiFormu();'], dev: [GF, 'private final SehirSecici sehir = new SehirSecici(this);'], stack: [fMain], con: 0, seq: { b: 0, m: B[0].spec.messages.length - 1 }, d: 5800,
      uml: { classes: ['Main', 'GonderiFormu', 'FormYoneticisi'], edges: ['c-main', 'r-form'] },
      stage: st(kur.s, { banner: { text: 'Öğeler yalnızca formu tanıyor: **0** öğeler arası bağ.' } }),
    });

    const ayrintili = {};
    if (p.key === 'ilac') ayrintili[0] = true;
    else {
      const k = prog.ops.findIndex((op, j) => op.t === 'agirlik' && j > 0 && op.v > 20);
      if (k >= 0) ayrintili[k] = true;
    }

    prog.ops.forEach((op, k) => {
      const Ok = O.filter((x) => x.i === k);
      const msg = B[k + 1].msgOf;
      const satir = MD.istekSatiri(op);
      const sonEv = Ok[Ok.length - 1];
      const red = Ok.find((x) => x.e === 'red');
      const o = op.t;
      if (red) {
        steps.push({
          t: satir.replace(/^form\./, '').replace(/;$/, ''),
          x: `Görevli **${op.v}** seçeneğine tıkladı ama seçenek kapalı: teslimat seçici isteği geri çevirdi. Seçim değişmediği için yöneticiye **haber verilmedi**; form olduğu gibi kaldı.`,
          code: [MF, satir], dev: [TF, 'System.out.println("> teslimat: " + secenek + " seçilemez (kapalı)");'], stack: [fMain, fOge(o)], con: red.n, seq: { b: k + 1, m: msg.red }, d: 5600,
          uml: { classes: ['TeslimatSecici'], members: [['TeslimatSecici', 'sec']] },
          stage: st(sonEv.s, { aktif: 'teslimat', hl: { teslimat: 'bad' }, banner: { text: `**${op.v}** kapalı: seçilmedi, haber verilmedi`, tone: 'bad' } }),
        });
        return;
      }
      const eylem = Ok.find((x) => x.e === 'eylem');
      const bildir = Ok.find((x) => x.e === 'bildir');
      const kural = Ok.find((x) => x.e === 'kural');
      const ayarCagri = Ok.find((x) => x.e === 'cagri' && x.yontem === 'ayarla');
      const iAyarSon = Ok.filter((x) => x.e === 'ayar').pop();
      const goster = Ok.find((x) => x.e === 'cagri' && x.yontem === 'goster');
      const fx = MD.cagriFx(O, k);
      if (ayrintili[k]) {
        steps.push({
          t: satir.replace(/^form\./, '').replace(/;$/, ''),
          x: `Görevli formda bir değişiklik yaptı. [[${MD.OGE[o].sinif}]] kendi değerini güncelledi ve yazdı. Bu öğe başka hiçbir öğeyi tanımıyor: dolap ya da ücret onun işi değil.`,
          code: [MF, satir], dev: [SF(o), ILK_SATIR[o]], stack: [fMain, fOge(o)], con: eylem.n, seq: { b: k + 1, m: msg.istek }, d: 5200,
          uml: { classes: [MD.OGE[o].sinif], members: [[MD.OGE[o].sinif, YONTEM[o]]] },
          stage: st(eylem.s, { aktif: o, hl: { [o]: 'on' } }),
        });
        steps.push({
          t: 'degisti() → yonetici',
          x: 'Öğenin bildiği tek şey yöneticisi: `degisti()` üst sınıf [[FormOgesi]]’nden geliyor ve yalnızca `yonetici.degisti(this)` diyor. Kendini (`this`) gönderiyor ki yönetici kimin değiştiğini bilsin.',
          code: [OF, 'yonetici.degisti(this);'], dev: [SF(o), 'degisti();'], stack: [fMain, fOge(o), fOgeDeg], con: eylem.n, seq: { b: k + 1, m: msg.bildir }, d: 5400,
          uml: { classes: ['FormOgesi', 'FormYoneticisi'], edges: ['yonetici'], members: [['FormOgesi', 'degisti'], ['FormYoneticisi', 'degisti']] },
          stage: st(bildir.s, { aktif: o, hl: { [o]: 'on', hub: 'on' }, kenar: [{ a: o, b: 'hub', kind: 'on' }], tokens: [{ from: 'n:' + o, to: 'hub', text: 'degisti(this)', kind: 'bildir' }] }),
        });
        steps.push({
          t: 'form.degisti(kaynak): kurallar',
          x: `[[GonderiFormu]] öteki öğelerin durumunu **okudu** (ağırlık ${kural.s.kg} kg, şehir ${kural.s.sehir || 'yok'}, soğuk zincir ${kural.s.soguk ? 'var' : 'yok'}) ve kuralların **hepsini** tek yerde uyguladı: hızlı ${kural.hizli ? 'açık' : 'kapalı'}, dolap ${kural.dolap ? 'açık' : 'kapalı'}. Hangi öğenin önce değiştiği önemli değil.`,
          code: [GF, 'boolean dolap = "Malatya".equals(sehir.secili()) && !soguk.isaretli()'], dev: [GF, 'int kg = agirlik.kg();'], stack: [fMain, fOge(o), fOgeDeg, fForm('degisti')], con: kural.n, seq: { b: k + 1, m: msg['oku:soguk'] }, d: 6200,
          uml: { classes: ['GonderiFormu'], members: [['GonderiFormu', 'degisti']] },
          stage: st(kural.s, { aktif: o, hl: { hub: 'on' } }),
        });
        steps.push({
          t: `teslimat.ayarla(${kural.hizli}, ${kural.dolap})`,
          x:
            iAyarSon
              ? 'Yönetici teslimat seçiciye hangi seçeneklerin açık olacağını söyledi. Değişenleri seçici kendisi yazdı; seçili seçenek kapandıysa Standart’a döndü. Seçici bu yüzden yeniden haber **vermiyor**: ayarı yönetici yaptı.'
              : 'Yönetici teslimat seçiciye hangi seçeneklerin açık olacağını söyledi. Bu kez değişen bir şey yok: dolap zaten kapalıydı. Seçici yeniden haber **vermiyor**: ayarı yönetici yaptı.',
          code: [GF, 'teslimat.ayarla(hizli, dolap);'], dev: [TF, 'public void ayarla(boolean hizli, boolean dolap) {'], stack: [fMain, fOge(o), fOgeDeg, fForm('degisti'), { t: 'teslimat.ayarla()', cls: 'TeslimatSecici' }], con: iAyarSon ? iAyarSon.n : ayarCagri.n, seq: { b: k + 1, m: msg.ayarla }, d: 5800,
          uml: { classes: ['GonderiFormu', 'TeslimatSecici'], members: [['TeslimatSecici', 'ayarla']] },
          stage: st((iAyarSon || ayarCagri).s, { aktif: 'teslimat', hl: { hub: 'on', teslimat: 'on' }, kenar: [{ a: 'hub', b: 'teslimat', kind: 'on' }], tokens: [{ from: 'hub', to: 'n:teslimat', text: ayarCagri.metin, kind: 'yon' }] }),
        });
        steps.push({
          t: `ucret.goster(${sonEv.s.tl})`,
          x: 'Son olarak yönetici ücreti hesapladı (seçenek, ağırlık, soğuk zincir) ve ücret etiketine gösterdi. Ücret kuralı da yöneticide: etiket yalnızca gösteriyor.',
          code: [GF, 'ucret.goster(ucretHesapla());'], dev: [UF, 'public void goster(int yeni) {'], stack: [fMain, fOge(o), fOgeDeg, fForm('degisti'), { t: 'ucret.goster()', cls: 'UcretEtiketi' }], con: sonEv.n, seq: { b: k + 1, m: msg.goster }, d: 5200,
          uml: { classes: ['GonderiFormu', 'UcretEtiketi'], members: [['GonderiFormu', 'ucretHesapla']] },
          stage: st(sonEv.s, { aktif: 'ucret', hl: { hub: 'on', ucret: 'on' }, kenar: [{ a: 'hub', b: 'ucret', kind: 'on' }], tokens: [{ from: 'hub', to: 'n:ucret', text: goster ? goster.metin : 'goster(…)', kind: 'yon' }] }),
        });
        return;
      }
      // kısa: işlem ve yöneticinin bütün ayarları tek adımda
      let x;
      if (p.key === 'ilac' && o === 'sehir')
        x = 'Sürüm 2.0’ın hatası burada olmuştu: şehir seçici dolabı kendisi açıyordu. Şimdi şehir seçici yalnızca forma haber verdi; form **bütün kurala** baktı (soğuk zincir var) ve dolap **kapalı kaldı**. Konsolda tek satır bile değişmedi.';
      else if (o === 'sehir') x = 'Şehir Malatya: yönetici kuralı uyguladı ve dolabı açtı. Şehir seçici dolabın varlığından bile habersiz.';
      else if (o === 'agirlik') x = `Ağırlık ${op.v} kg: yönetici ücreti yeniden hesapladı. Kural yine tek yerde uygulandı.`;
      else if (o === 'teslimat') x = `Görevli ${op.v} seçti; teslimat seçici forma haber verdi, yönetici ücreti güncelledi.`;
      else x = 'Öğe forma haber verdi; yönetici kuralları uyguladı.';
      steps.push({
        t: satir.replace(/^form\./, '').replace(/;$/, ''),
        x,
        code: [MF, satir], dev: [GF, 'teslimat.ayarla(hizli, dolap);'], stack: [fMain, fOge(o), fOgeDeg, fForm('degisti')], con: sonEv.n, seq: { b: k + 1, m: msg.goster }, d: 6000,
        uml: { classes: ['GonderiFormu', MD.OGE[o].sinif], members: [['GonderiFormu', 'degisti']] },
        stage: st(sonEv.s, { aktif: o, hl: fx.hl, kenar: fx.kenar, tokens: fx.tokens }),
      });
    });

    const i = O.length - 1;
    const s = O[i].s;
    steps.push({
      t: 'Sonuç',
      x:
        p.key === 'ilac'
          ? 'Önce soğuk zincir, sonra şehir: sürüm 2.0’ı bozan sıra. Bu kez gönderi **Standart**: dolap hiç açılmadı, çünkü kural tek yerde ve her seferinde bütün form okunuyor.'
          : 'Tek bir ağırlık değişikliği üç şeyi etkiledi: hızlı teslimat ve dolap kapandı, seçim Standart’a döndü, ücret değişti. Bu zincirleme etkinin hepsi tek bir yöntemde, sırası belli.',
      code: [MF, 'System.out.println(form.ozet());'], stack: [fMain], con: O[i].n, seq: { b: son, m: 1 }, d: 6400,
      uml: { classes: ['GonderiFormu', 'FormYoneticisi', 'FormOgesi'], edges: ['r-form', 'yonetici'] },
      stage: st(s, { banner: { text: p.key === 'ilac' ? 'Soğuk zincir · **Standart** · dolap kapalı kaldı' : '25 kg · **Standart** · hızlı ve dolap kapandı', tone: 'ok' } }),
    });
    return { steps, seq, run: r };
  }

  MD.scenes.flow = function (root, ctx) {
    const S = ctx.state;
    let p = MD.presets[S.preset] || MD.presets.ilac;
    const el = h('div', { class: 'scene scene-flow' });
    const toolbar = h('div', { class: 'scene-toolbar' });
    const body = h('div', { class: 'flow-body' + (S.showCode === false ? ' hide-code' : '') });
    el.append(toolbar, body);
    root.appendChild(el);

    const presetSeg = kit.seg(
      MD.presetOrder.map((k) => ({ v: k, label: MD.presets[k].title, title: k === 'ilac' ? 'Önce soğuk zincir, sonra şehir: sürüm 2.0’ı bozan sıra' : 'Hızlı seçiliyken ağırlık 25 kg olur' })),
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
      h('span', { class: 'tb-hint med-key', html: '<span class="med-key-c">öğe</span> haber verir · <span class="med-key-m">yönetici</span> kuralları uygular' }),
      h('span', { class: 'tb-spacer' }),
      viewSeg.el,
      codeBtn
    );

    const viewPanel = h('section', { class: 'panel flow-view' });
    const views = { stage: h('div', { class: 'fv fv-stage' }), seq: h('div', { class: 'fv fv-seq med-fv-seq' }), uml: h('div', { class: 'fv fv-uml' }) };
    Object.values(views).forEach((x) => viewPanel.appendChild(x));
    const seqHead = h('div', { class: 'med-seq-head' });
    const seqHost = h('div', { class: 'med-seq-host' });
    views.seq.append(seqHead, seqHost);
    const codeCol = h('div', { class: 'flow-code' });
    const stackEl = h('div', { class: 'callstack', 'aria-label': 'Çağrı yığını' });
    const cvPanel = h('section', { class: 'panel flow-cv' });
    const consoleEl = h('div', { class: 'console med-flow-console', 'aria-live': 'polite' });
    codeCol.append(stackEl, cvPanel, consoleEl);
    body.append(viewPanel, codeCol);

    const stage = new MD.FormSahne(views.stage);
    const cv = new DP.CodeView(cvPanel, { roleOf: MD.roleOf, special: MD.special });
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
      cv.setFiles(MD.akisFiles(p), { active: 'Main.java', keepActive: false });
      const spec = MD.gofDiagram({ notes: true });
      if (uml) uml.update(spec, { animate: false });
      else uml = new DP.ClassDiagram(views.uml, spec, { roles: MD.roles, roleTags: true });
    }

    function showSeq(b, m, animate) {
      const B = flow.seq.bolumler[b];
      if (b !== seqB) {
        seqHost.innerHTML = '';
        seq = new DP.SequenceDiagram(seqHost, B.spec, { roles: MD.roles });
        seqB = b;
        animate = false;
      }
      const n = flow.seq.bolumler.length;
      seqHead.innerHTML = `<b>${DP.esc(B.baslik)}</b><span>${b > 0 && b < n - 1 ? `işlem ${b} / ${n - 2}` : ''}</span>`;
      seq.show(m, animate);
    }

    function setPreset(k) {
      if (MD.presets[k] === p) return;
      p = MD.presets[k];
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
      MD.renderConsole(consoleEl, MD.cmd(), run.lines.slice(0, s.con).map((l) => MD.consoleLine(l)), { animateFrom: info.animate && ps && s.con > ps.con ? ps.con : null, cursor: i < steps.length - 1 });
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

  // ================================================================== 5. FORM TEZGÂHI
  const { S: OS, A: OA, K: OK, G: OG, T: OT } = MD.op;
  const ANA = MD.TEZGAH_ANA;
  const TASARIM_AD = { v2: 'Dağınık (2.0)', kopyali: 'Kopyalı kurallar', mediator: 'Mediator' };

  MD.scenes.counter = function (root, ctx) {
    const S = ctx.state;
    S.tz = S.tz || { design: 'mediator', ops: ANA.slice() };
    const unlocked = !!S.sigortaUnlocked;
    const el = h('div', { class: 'scene scene-split med-tz' });
    const body = h('div', { class: 'scene-body cols-tz' });
    const left = kit.panel('Şube ekranı', { cls: 'panel-code med-left med-tz-left' });
    const right = kit.panel('Gönderi formu <span class="panel-sub">· aynı tıklamalar, üç tasarım</span>', { cls: 'panel-side med-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    // ---- denetimler
    const designSeg = kit.seg(
      [
        { v: 'v2', label: 'Dağınık (2.0)', title: 'Öğeler birbirini çağırır; dolap kuralının iki kopyası soğuk zinciri bilmiyor' },
        { v: 'kopyali', label: 'Kopyalı kurallar', title: 'Öğeler birbirini çağırır; kural kopyalarının hepsi tam' },
        { v: 'mediator', label: 'Mediator', title: 'Öğeler yalnızca yöneticiye haber verir; kurallar tek yerde' },
      ],
      S.tz.design,
      (v) => act((c) => (c.design = v)),
      { label: 'Tasarım', cls: 'med-seg' }
    );
    const btnReset = h('button', { class: 'btn btn-ghost btn-sm', type: 'button', title: 'Oturumu boşalt' }, '↺ Sıfırla');
    const btnRun = h('button', { class: 'btn btn-primary btn-sm med-run', type: 'button', title: 'Oturumu baştan, işlem işlem oynat' }, '▶ Oynat');
    btnReset.addEventListener('click', () => act((c) => (c.ops = [])));
    btnRun.addEventListener('click', () => oynat());
    const dugme = (metin, op, title) => {
      const b = h('button', { class: 'med-tz-b', type: 'button', title: title || '' }, metin);
      b.addEventListener('click', () => ekle(op()));
      return b;
    };
    const sehirRow = h('div', { class: 'med-tz-grup' }, ...MD.SEHIRLER.map((sh) => dugme(sh, () => OS(sh))));
    const kgRow = h('div', { class: 'med-tz-grup' }, ...MD.AGIRLIKLAR.map((kg) => dugme(kg + ' kg', () => OA(kg))));
    const bSoguk = h('button', { class: 'med-tz-b is-kutu', type: 'button' }, '');
    bSoguk.addEventListener('click', () => ekle(OK(!sonDurum().soguk)));
    const bSigorta = h('button', { class: 'med-tz-b is-kutu', type: 'button' }, '');
    bSigorta.addEventListener('click', () => {
      if (!unlocked) {
        DP.fx.toast('Sigorta kutusu henüz yazılmadı! “Genişlet” sahnesinde ekleyin.', 2600);
        ctx.flashScene('genislet');
        return;
      }
      if ((cur || S.tz).design !== 'mediator') {
        DP.fx.toast('Sigorta kutusu yalnızca Mediator tasarımında var.', 2400);
        return;
      }
      ekle(OG(!sonDurum().sigorta));
    });
    const tesRow = h('div', { class: 'med-tz-grup' }, ...MD.SECENEKLER.map((sec) => dugme(sec, () => OT(sec), 'Teslimat seçeneği')));
    const opsRow = h('div', { class: 'med-tz-ops' });
    const controls = h(
      'div',
      { class: 'med-tz-controls' },
      h('div', { class: 'med-tz-row' }, h('span', { class: 'tb-label' }, 'Tasarım:'), designSeg.el, h('span', { class: 'tb-spacer' }), btnReset, btnRun),
      h('div', { class: 'med-tz-row' }, h('span', { class: 'tb-label' }, 'Şehir:'), sehirRow, h('span', { class: 'tb-label' }, 'Ağırlık:'), kgRow),
      h('div', { class: 'med-tz-row' }, h('span', { class: 'tb-label' }, 'Kutular:'), bSoguk, bSigorta, h('span', { class: 'tb-label' }, 'Teslimat:'), tesRow),
      h('div', { class: 'med-tz-row is-ops' }, h('span', { class: 'tb-label' }, 'Oturum:'), opsRow)
    );
    const cvHost = h('div', { class: 'med-cv' });
    const consoleEl = h('div', { class: 'console med-console' });
    left.body.append(controls, cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: MD.roleOf, special: MD.special });

    // ---- sağ: sahne + ölçüler
    const viewHost = h('div', { class: 'med-view' });
    const metrics = h('div', { class: 'med-metrics' });
    const extra = h('div', { class: 'med-extra' });
    right.body.append(viewHost, metrics, extra);
    const stage = new MD.FormSahne(viewHost, { cls: 'is-tezgah' });

    const FREE = 4;
    const STEPS = [
      {
        t: 'Mediator: önce soğuk zincir, sonra şehir',
        x: 'Sürüm 2.0’ı bozan sıra: soğuk zincir, Malatya, 2 kg, Dolap. Mediator’da her değişiklik forma gidiyor, form **bütün kuralı** uyguluyor: dolap hiç açılmadı, Dolap seçilemedi. **0** yanlış an, **0** kurala aykırı gönderi.',
        tz: { design: 'mediator', ops: ANA },
      },
      {
        t: 'Aynı oturum: dağınık kurallar (2.0)',
        x: 'Aynı tıklamalar, sürüm 2.0. Şehir seçici ve ağırlık alanı kendi kural kopyalarını uyguladı; ikisi de soğuk zinciri bilmiyor. Üç işlem boyunca dolap yanlışlıkla açık: **3 yanlış an**, sonunda kurala aykırı gönderi.',
        tz: { design: 'v2', ops: ANA },
      },
      {
        t: 'Aynı oturum: kopyalı ama tam kurallar',
        x: 'Kopyaların hepsi düzeltilince sonuç doğru: **0** hata. Ama bedel ortada: öğeler arası **14 bağ**, kural **3 yerde**. Bir sonraki kural değişikliği yine üç sınıfı birden değiştirmeyi gerektirir; Mediator’da bir sınıfı.',
        tz: { design: 'kopyali', ops: ANA },
      },
      {
        t: 'Ağır koli: zincirleme değişiklik',
        x: 'Hızlı seçiliyken ağırlık 25 kg oldu: hızlı teslimat ve dolap kapandı, seçim Standart’a döndü, ücret değişti. Mediator’da bu zincirin hepsi tek yöntemde. **▶ Oynat** ile izleyin, sonra tasarımı değiştirip çağrıların öğeden öğeye nasıl dolaştığına bakın.',
        tz: { design: 'mediator', ops: MD.presets.agir.prog.ops },
      },
      {
        t: 'Serbest: siz deneyin',
        x: unlocked
          ? 'Formu istediğiniz sırayla doldurun; tasarımı değiştirip aynı oturumu karşılaştırın. **Sigorta** kutusu da açık (yalnızca Mediator’da).'
          : 'Formu istediğiniz sırayla doldurun; tasarımı değiştirip aynı oturumu karşılaştırın. (🔒 Sigorta kutusu, Genişlet sahnesinde yazılır.)',
        free: true,
      },
    ];

    let cur = null;
    let timers = [];
    let last = null;
    const sonDurum = () => MD.run(MD.tezgahProg(cur || S.tz)).son;

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
      // sigorta kutusu yalnızca Mediator tasarımında (Genişlet’ten sonra)
      c.sigorta = c.design === 'mediator' && unlocked;
      if (!c.sigorta) c.ops = c.ops.filter((op) => op.t !== 'sigorta');
      S.tz = c;
      if (!STEPS[stepper.index].free) stepper.go(FREE, { animate: true });
      else draw(S.tz, true);
    }

    function ekle(op) {
      const tz = cur || S.tz;
      if (!MD.uygun(Object.assign({}, tz, { sigorta: tz.design === 'mediator' && unlocked }), op)) {
        DP.fx.toast(tz.ops.length >= MD.ISTEK_EN_COK ? 'En çok ' + MD.ISTEK_EN_COK + ' işlem.' : 'Bu işlem şu an yapılamaz.', 2200);
        return;
      }
      act((c) => c.ops.push(op));
    }

    const etiket = (op) => {
      if (op.t === 'sehir') return op.v;
      if (op.t === 'agirlik') return op.v + ' kg';
      if (op.t === 'soguk') return (op.v ? '✓' : '✗') + ' soğuk';
      if (op.t === 'sigorta') return (op.v ? '✓' : '✗') + ' sigorta';
      return '◉ ' + op.v;
    };

    function renderControls(tz, s) {
      designSeg.set(tz.design);
      DP.$$('.med-tz-b', sehirRow).forEach((b, k) => b.classList.toggle('is-on', s.sehir === MD.SEHIRLER[k]));
      DP.$$('.med-tz-b', kgRow).forEach((b, k) => b.classList.toggle('is-on', s.kg === MD.AGIRLIKLAR[k]));
      DP.$$('.med-tz-b', tesRow).forEach((b, k) => {
        const sec = MD.SECENEKLER[k];
        b.classList.toggle('is-on', s.secili === sec);
        b.classList.toggle('is-kapali', !(sec === 'Hızlı' ? s.hizli : sec === 'Dolap' ? s.dolap : true));
      });
      bSoguk.innerHTML = `${s.soguk ? '☑' : '☐'} Soğuk zincir`;
      bSoguk.classList.toggle('is-on', s.soguk);
      const sigortaVar = tz.design === 'mediator' && unlocked;
      bSigorta.innerHTML = `${unlocked ? (s.sigorta ? '☑' : '☐') : '🔒'} Sigorta`;
      bSigorta.classList.toggle('is-on', !!s.sigorta);
      bSigorta.classList.toggle('is-kilit', !sigortaVar);
      bSigorta.title = unlocked ? (sigortaVar ? 'SigortaKutusu: yeni öğe' : 'Yalnızca Mediator tasarımında') : 'Genişlet sahnesinde yazılır';
      opsRow.innerHTML = '';
      if (!tz.ops.length) opsRow.appendChild(h('span', { class: 'med-tz-none' }, 'henüz işlem yok'));
      tz.ops.forEach((op, i) => opsRow.appendChild(h('span', { class: 'med-tz-op is-' + op.t, title: i + 1 + '. işlem' }, etiket(op))));
    }

    function renderMetrics(tz, o) {
      const tile = (v, label, cls) => `<div class="med-mt-t${cls ? ' ' + cls : ''}"><b>${v}</b><span>${label}</span></div>`;
      metrics.innerHTML = `<div class="med-mt">
        ${tile(o.islem, 'işlem')}
        ${tile(o.yanlisAn, 'yanlış an', o.yanlisAn ? 'is-bad' : 'is-good')}
        ${tile(o.aykiri, 'aykırı gönderi', o.aykiri ? 'is-bad' : 'is-good')}
        <span class="med-mt-sep"></span>
        ${tile(o.bag, 'öğeler arası bağ', o.bag ? 'is-bad' : 'is-good')}
        ${tile(o.kural, 'kural kaç yerde', o.kural > 1 ? 'is-bad' : 'is-good')}
      </div>`;
    }

    function finalState(tz, o) {
      const prog = MD.tezgahProg(tz);
      const st = MD.sonDurum(prog, { run: o.run });
      st.banner = o.aykiri
        ? { text: `**${o.yanlisAn}** yanlış an · kurala aykırı gönderi: **${o.run.son.secili}**`, tone: 'bad' }
        : o.yanlisAn
        ? { text: `**${o.yanlisAn}** yanlış an: kapalı olması gereken bir seçenek açık kaldı`, tone: 'bad' }
        : tz.design === 'mediator'
        ? { text: `Mediator · kurallar tek yerde · ${o.islem} işlem, **0** hata`, tone: 'ok' }
        : { text: `${TASARIM_AD[tz.design]} bu oturumda hata vermedi · ${o.bag} bağ, kural ${o.kural} yerde` };
      return st;
    }

    function draw(tz, animate) {
      stop();
      cur = { design: tz.design, ops: tz.ops.slice(), sigorta: tz.design === 'mediator' && unlocked };
      const o = MD.olc(cur);
      renderControls(cur, o.run.son);
      renderMetrics(cur, o);
      // önce konsol, sonra kod
      MD.renderConsole(consoleEl, MD.cmd(true), o.run.lines.map((l) => MD.consoleLine(l, { bad: (x) => x.k === 'ozet' && o.aykiri })), { animateFrom: animate ? 0 : null });
      const F = MD.tezgahFiles(cur);
      cv.setFiles(MD.fileList(F), { active: cur.design === 'mediator' ? 'GonderiFormu.java' : 'SehirSecici.java', keepActive: false });
      if (cur.design === 'mediator') cv.mark('GonderiFormu.java', ['public void degisti(FormOgesi kaynak) {', 'ucret.goster(ucretHesapla());'], 'focus', { smooth: false });
      else cv.mark('SehirSecici.java', { find: 'boolean dolap =' }, cur.design === 'v2' ? 'bad' : 'focus', { smooth: false });
      show(finalState(cur, o), animate);
      const kural = {
        v2: 'Öğeler birbirini **çağırır**; “dolap açık mı?” üç öğede kopya ve ikisi soğuk zinciri **bilmiyor**: sonuç tıklama sırasına bağlı.',
        kopyali: 'Öğeler birbirini **çağırır**; kural üç öğede kopya ama hepsi tam: doğru sonuç, yüksek bağ.',
        mediator: 'Öğeler yalnızca `degisti(this)` der; **yönetici** öteki öğeleri okur, kuralların hepsini tek yerde uygular.',
      }[cur.design];
      extra.innerHTML = `<div class="med-oneline"><span class="tb-label">Kural:</span><span>${md(kural)}</span></div>`;
    }

    /** Oturumu baştan oynatır: her işlem için çağrılar bağlar boyunca jeton olarak gider */
    function oynat() {
      if (!cur) return;
      stop();
      const prog = MD.tezgahProg(cur);
      const r = MD.run(prog);
      const o = MD.olc(cur);
      const fin = finalState(cur, o);
      btnRun.classList.add('is-running');
      let t = 0;
      show(MD.stateFrom(prog, MD.BOS_AN(prog), { banner: { text: 'Oturum baştan oynatılıyor…' } }), true);
      t += 700;
      cur.ops.forEach((op, k) => {
        const olaylar = r.olaylar.filter((x) => x.i === k);
        const e = olaylar[olaylar.length - 1];
        if (!e) return;
        const fx = MD.cagriFx(r.olaylar, k, { ara: 240 });
        const red = olaylar.find((x) => x.e === 'red');
        const yanlis = e.s.yanlisAcik || e.s.yanlisSecim;
        at(t, () =>
          show(
            MD.stateFrom(prog, e.s, {
              aktif: op.t,
              hl: fx.hl,
              kenar: fx.kenar,
              tokens: fx.tokens,
              banner: { text: `${k + 1}/${cur.ops.length} · ${etiket(op)}${red ? ' — **seçilemez (kapalı)**' : yanlis ? ' — **kurala aykırı durum**' : ''}`, tone: red || yanlis ? 'bad' : null },
            }),
            true
          )
        );
        t += 700 + fx.tokens.length * 240;
      });
      at(t + 300, () => {
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
