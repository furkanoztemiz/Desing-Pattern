/*
 * Facade — sahneler (2/3): CANLI AKIŞ ve CEPHE TEZGÂHI
 *   Canlı Akış: istemci tek bir çağrı yapar (cephe.gonder); cephe yedi alt sistemi sırayla çalıştırır,
 *               ödeme reddedilirse akışı durdurur ve sonucu Optional olarak döndürür.
 *   Tezgâh   : tasarım (kalıpsız / cephe), istemci sayısı ve değişiklik istekleri (kart limiti, sigorta,
 *               kurye API'si) seçilir. Bağımlılık kabloları, değişen dosyalar ve kodun farkı birlikte görünür.
 */
(function () {
  'use strict';
  const FC = DP.fc;
  const { h } = DP;
  const kit = DP.kit;
  const ui = FC.ui;
  const md = FC.md;
  const esc = DP.esc;

  function renderStack(stackEl, frames) {
    stackEl.innerHTML = '<span class="cs-label">Çağrı yığını</span>';
    frames.forEach((fr, i) => {
      if (i) stackEl.appendChild(h('span', { class: 'cs-sep' }, '›'));
      const r = FC.roleOf(fr.cls);
      stackEl.appendChild(h('span', { class: 'cs-frame' + (r ? ' rc rc-' + r : '') + (i === frames.length - 1 ? ' is-top' : '') }, fr.t));
    });
  }

  // ================================================================== 4. CANLI AKIŞ
  /** Cephedeki satır ve alt sistemdeki karşılığı (kod işaretleri) */
  const SATIR = {
    adres: ['String tamAdres = adres.dogrula(t.adres(), t.il());', 'AdresServisi.java', 'public String dogrula(String adres, String il) {'],
    tarife: ['int tutar = tarife.hesapla(t.kg());', 'TarifeServisi.java', 'public int hesapla(int kg) {'],
    odeme: ['if (!odeme.cek(t.musteri(), tutar)) {', 'OdemeServisi.java', 'public boolean cek(String musteri, int tutar) {'],
    takip: ['String no = takip.yeni();', 'TakipNoServisi.java', 'public String yeni() {'],
    etiket: ['etiket.bas(no, tamAdres);', 'EtiketServisi.java', 'public void bas(String no, String adres) {'],
    kurye: ['kurye.ata(no, t.il());', 'KuryeServisi.java', 'public String ata(String no, String il) {'],
    sms: ['sms.gonder(t.musteri(), no + " gönderiniz alındı");', 'BildirimServisi.java', 'public void gonder(String musteri, String mesaj) {'],
  };
  const NE = {
    adres: 'Adres alt sistemi adresi doğruladı ve tam adresi döndürdü.',
    tarife: 'Tarife alt sistemi ücreti hesapladı: 40 TL + kilo başına 15 TL.',
    takip: 'Takip numarası alt sistemi sıradaki numarayı verdi.',
    etiket: 'Etiket yazıcısı gönderinin etiketini bastı.',
    kurye: 'Kurye alt sistemi şehre göre kuryeyi atadı.',
    sms: 'Bildirim alt sistemi müşteriye SMS gönderdi.',
  };

  function flowSteps(p) {
    const seq = FC.seqSpec(p);
    const r = seq.run;
    const msgOf = seq.msgOf;
    const z = r.iz[0];
    const ist = FC.ISTEMCI[z.ist];
    const IF = ist.cls + '.java';
    const CF = 'GonderiCephesi.java';
    const MF = 'Main.java';
    const f = p.prog.f;
    const fMain = { t: 'Main.main()', cls: 'Main' };
    const fIst = { t: `${ist.v}.gonder()`, cls: ist.cls };
    const fCephe = { t: 'cephe.gonder()', cls: 'GonderiCephesi' };
    const steps = [];
    // sahne durumu adım adım değişir
    const S = { offices: {}, desk: { adim: {} }, fis: null };
    const snap = (x) => {
      x = x || {};
      const desk = Object.assign({}, S.desk, { adim: Object.assign({}, S.desk.adim), aktif: x.aktif || null });
      return {
        mode: 'cephe',
        f,
        clients: [{ ist: z.ist, musteri: z.t.musteri, cepheli: true, fis: S.fis, hl: !!x.hlClient }],
        desk,
        offices: JSON.parse(JSON.stringify(S.offices)),
        sayac: { bag: 1, cephe: FC.altOrder(f).length },
        token: x.token || null,
        wire: x.wire || null,
        banner: x.banner || null,
      };
    };
    let out = 0;
    const lineOf = (i) => i + 1;

    steps.push({
      t: 'Kurulum',
      x: 'Main yedi alt sistem nesnesini ve **bir** [[GonderiCephesi]] yarattı; istemciye yalnızca cepheyi verdi. İstemci alt sistemlerin hiçbirini tanımıyor.',
      code: [MF, 'GonderiCephesi cephe = new GonderiCephesi('], dev: [MF, `${ist.cls} ${ist.v} = new ${ist.cls}(cephe);`], stack: [fMain], out: 0, seq: -1, d: 5400,
      uml: { classes: [ist.cls, 'GonderiCephesi'], edges: ['c-' + z.ist] },
      stage: snap({ banner: { text: `${ist.tag} hazır: elinde yalnızca **cephe** var.` } }),
    });
    S.fis = { kind: 'bekliyor', no: z.t.musteri };
    steps.push({
      t: `${ist.v}.gonder(talep)`,
      x: `${z.t.musteri} ${z.t.kg} kg’lık bir gönderi istiyor (${z.t.adres}/${z.t.il}). [[${ist.cls}]] işin nasıl yapıldığını bilmiyor; tek satır: \`cephe.gonder(t)\`.`,
      code: [MF, `${ist.v}.gonder(new Talep("${z.t.musteri}"`], dev: [IF, 'Optional<String> no = cephe.gonder(t);'], stack: [fMain, fIst], out: lineOf(0), seq: -1, d: 5000,
      uml: { classes: [ist.cls], members: [[ist.cls, 'gonder']] },
      stage: snap({ hlClient: true }),
    });
    steps.push({
      t: 'cephe.gonder(t)',
      x: 'İstek **cepheye** geldi. Cephe hangi alt sistemin hangi işten sorumlu olduğunu ve doğru sırayı biliyor; şimdi onları tek tek çağıracak.',
      code: [CF, 'public Optional<String> gonder(Talep t) {'], stack: [fMain, fIst, fCephe], out: lineOf(0), seq: msgOf.gonder, d: 4800,
      uml: { classes: ['GonderiCephesi'], edges: ['c-' + z.ist], members: [['GonderiCephesi', 'gonder']] },
      stage: snap({ aktif: 'gonder', token: { from: 'client:0', to: 'cephe:in', text: 'gonder(t)', kind: 'req' }, wire: { client: 0, cephe: true } }),
    });
    z.adim.forEach((a) => {
      const k = a.k;
      const [cLine, sFile, sLine] = SATIR[k];
      out = a.line + 1;
      if (a.dur) {
        // ödeme reddedildi: kural devreye girer
        S.desk.adim.limit = 'bad';
        S.offices.sms = { text: a.t, state: 'ok' };
        ['takip', 'sigorta', 'etiket', 'kurye'].forEach((x) => FC.altOrder(f).includes(x) && (S.offices[x] = { text: 'çalışmadı', state: 'skip' }));
        ['takip', 'sigorta', 'etiket', 'kurye', 'sms'].forEach((x) => (S.desk.adim[x] = x === 'sms' ? 'ok' : 'skip'));
        steps.push({
          t: 'Reddedildi: akış durur',
          x: 'Cephedeki kural devreye girdi: ödeme reddedilince müşteriye “ödeme alınamadı” SMS’i gitti ve akış **durdu**. Takip numarası, etiket ve kurye hiç çağrılmadı: hayalet gönderi yok.',
          code: [CF, 'sms.gonder(t.musteri(), "ödeme alınamadı, gönderi oluşturulmadı");'], dev: [CF, 'return Optional.empty();'], stack: [fMain, fIst, fCephe, { t: 'sms.gonder()', cls: 'BildirimServisi' }], out, seq: msgOf.sms, d: 6000,
          uml: { classes: ['GonderiCephesi', 'BildirimServisi'], edges: ['a-sms'] },
          stage: snap({ aktif: 'limit', token: { from: 'cephe:out', to: 'office:sms', text: 'ödeme alınamadı', kind: 'bad' }, wire: { office: 'sms', cephe: true }, banner: { text: 'Kural **cephede**: reddedilen ödeme gönderiyi durdurdu.', tone: 'ok' } }),
        });
        return;
      }
      S.offices[k] = { text: a.t, state: a.bad ? 'bad' : 'ok' };
      S.desk.adim[k] = a.bad ? 'bad' : 'ok';
      if (k === 'odeme' && f.limit && !a.bad) S.desk.adim.limit = 'ok';
      const kodSatiri = k === 'kurye' && f.kurye ? 'kurye.planla(no, t.il(), t.kg());' : cLine;
      steps.push({
        t: `${FC.ALT[k].v}.${{ adres: 'dogrula', tarife: 'hesapla', odeme: 'cek', takip: 'yeni', etiket: 'bas', kurye: 'ata', sms: 'gonder', sigorta: 'police' }[k]}()`,
        x:
          k === 'odeme'
            ? a.bad
              ? `Ödeme alt sistemi **reddetti**: ${z.t.musteri}’in kart limiti ${FC.LIMIT[z.t.musteri]} TL, tutar ${FC.tutar(z.t.kg)} TL. \`cek\` false döndü; sıra cephenin kuralında.`
              : `Ödeme alt sistemi ${FC.tutar(z.t.kg)} TL çekti ve \`true\` döndü. Kart limiti (${FC.LIMIT[z.t.musteri]} TL) yetti; akış devam ediyor.`
            : NE[k] + ` Konsola bakın: \`${a.t}\`.`,
        code: [CF, kodSatiri], dev: [sFile, k === 'odeme' && !f.limit ? 'public void cek(String musteri, int tutar) {' : sLine], stack: [fMain, fIst, fCephe, { t: `${FC.ALT[k].v}.${FC.ALT[k].call.split('.')[1]}`, cls: FC.ALT[k].cls }], out, seq: msgOf[k], d: k === 'odeme' ? 5600 : 4400,
        uml: { classes: ['GonderiCephesi', FC.ALT[k].cls], edges: ['a-' + k] },
        stage: snap({ aktif: k, token: { from: 'cephe:out', to: 'office:' + k, text: FC.ALT[k].call, kind: a.bad ? 'bad' : 'req' }, wire: { office: k, cephe: true } }),
      });
    });
    out = z.cikti[z.cikti.length - 1] + 1;
    S.fis = { kind: z.sonuc === 'red' ? 'yok' : 'ok', no: z.no };
    S.desk.ret = { kind: z.sonuc === 'red' ? 'yok' : 'ok', text: z.sonuc === 'red' ? 'Optional.empty' : `Optional[${z.no}]` };
    steps.push({
      t: z.sonuc === 'red' ? 'return Optional.empty()' : 'return Optional.of(no)',
      x:
        z.sonuc === 'red'
          ? `Cephe boş bir \`Optional\` döndürdü; [[${ist.cls}]] “gönderi oluşturulmadı” yazdı. İstemci reddin **nedenini** ve kuralı bilmek zorunda değil.`
          : `Cephe takip numarasını döndürdü: \`Optional[${z.no}]\`. [[${ist.cls}]] fişi yazdı. İstemci yedi alt sistemin hiçbirini görmedi.`,
      code: [CF, z.sonuc === 'red' ? 'return Optional.empty();' : 'return Optional.of(no);'], dev: [IF, 'System.out.println('], stack: [fMain, fIst], out, seq: msgOf.ret, d: 5400,
      uml: { classes: [ist.cls, 'GonderiCephesi'], edges: ['c-' + z.ist] },
      stage: snap({ token: { from: 'cephe:in', to: 'clientIn:0', text: z.sonuc === 'red' ? 'Optional.empty' : z.no, kind: z.sonuc === 'red' ? 'bad' : 'ok' }, wire: { client: 0, cephe: true } }),
    });
    const st = r.stats;
    steps.push({
      t: 'Sonuç: istemci ne bildi?',
      x:
        z.sonuc === 'red'
          ? `Tek bir çağrı: \`cephe.gonder(t)\`. Ödeme reddedilince akış **cephede** durdu; gün sonu ${st.basilan} etiket, ${st.tahsilat} TL. Üstten öbür tarifi seçip karşılaştırın.`
          : `Tek bir çağrı: \`cephe.gonder(t)\`. Arkada ${z.adim.length} alt sistem çağrısı doğru sırayla yapıldı. İstemci yalnızca sonucu (takip numarasını) gördü. Üstten öbür tarifi seçip karşılaştırın.`,
      code: [MF, 'System.out.println("Gün sonu: "'], stack: [fMain], out: r.lines.length, seq: seq.spec.messages.length - 1, d: 6400,
      uml: { classes: ['GonderiCephesi'], edges: ['c-' + z.ist] },
      stage: snap({ banner: { text: z.sonuc === 'red' ? 'Tek çağrı → **akış durdu**, hayalet gönderi yok.' : `Tek çağrı → **${z.adim.length} alt sistem**, doğru sırayla.`, tone: 'ok' } }),
    });
    return { steps, seq, run: r };
  }

  FC.scenes.flow = function (root, ctx) {
    const S = ctx.state;
    let p = FC.presets[S.preset] || FC.presets.ali;
    const el = h('div', { class: 'scene scene-flow' });
    const toolbar = h('div', { class: 'scene-toolbar' });
    const body = h('div', { class: 'flow-body' + (S.showCode === false ? ' hide-code' : '') });
    el.append(toolbar, body);
    root.appendChild(el);

    const presetSeg = kit.seg(
      FC.presetOrder.map((k) => ({ v: k, label: FC.presets[k].title, title: k === 'ali' ? 'Şube kasası: Ali Şahin, 3 kg, Malatya' : 'Web sitesi: Can Demir, 1 kg, İstanbul (kart limiti 50 TL)' })),
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
      h('span', { class: 'tb-hint fc-key', html: '<span class="fc-key-c">istemci</span> tek çağrı · <span class="fc-key-f">cephe</span> yedi alt sistemi sırayla çağırır' }),
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
    const consoleEl = h('div', { class: 'console fc-flow-console', 'aria-live': 'polite' });
    codeCol.append(stackEl, cvPanel, consoleEl);
    body.append(viewPanel, codeCol);

    const stage = new FC.Merkez(views.stage);
    const cv = new DP.CodeView(cvPanel, { roleOf: FC.roleOf, special: FC.special });
    let uml = null;
    let seq = null;
    let steps = [];
    let run = null;

    function load() {
      const f = flowSteps(p);
      steps = f.steps;
      run = f.run;
      cv.setFiles(FC.akisFiles(p), { active: 'Main.java', keepActive: false });
      views.seq.innerHTML = '';
      seq = new DP.SequenceDiagram(views.seq, f.seq.spec, { roles: FC.roles });
      const spec = FC.gofDiagram({ notes: true });
      if (uml) uml.update(spec, { animate: false });
      else uml = new DP.ClassDiagram(views.uml, spec, { roles: FC.roles, roleTags: true });
    }

    function setPreset(k) {
      if (FC.presets[k] === p) return;
      p = FC.presets[k];
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
      FC.renderConsole(
        consoleEl,
        FC.cmd(),
        run.lines.slice(0, s.out).map((l) => FC.consoleLine(l, { redBad: true, yokNote: 'akış durdu' })),
        { animateFrom: info.animate && ps && s.out > ps.out ? ps.out : null, cursor: i < steps.length - 1 }
      );
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
      delayOf: (i) => (steps[i] && steps[i].d) || 4800,
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

  // ================================================================== 5. CEPHE TEZGÂHI
  FC.scenes.counter = function (root, ctx) {
    const S = ctx.state;
    S.tz = S.tz || { design: 'cephe', n: 3, limit: true, sigorta: false, kurye: false };
    const unlocked = !!S.apiUnlocked;
    const el = h('div', { class: 'scene scene-split fc-tz' });
    const body = h('div', { class: 'scene-body cols-tz' });
    const left = kit.panel('Değişiklik masası', { cls: 'panel-code fc-left fc-tz-left' });
    const right = kit.panel('Gönderi merkezi <span class="panel-sub">· kablolar = bağımlılıklar</span>', { cls: 'panel-side fc-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    // ---- denetimler
    const designSeg = kit.seg(
      [
        { v: 'naive', label: 'Kalıpsız', title: 'Her istemci yedi alt sistemi kendisi çağırır' },
        { v: 'cephe', label: 'Cephe', title: 'İstemciler yalnızca GonderiCephesi’ni tanır' },
      ],
      S.tz.design,
      (v) => act((c) => (c.design = v)),
      { label: 'Tasarım', cls: 'fc-seg' }
    );
    const nSeg = kit.seg(
      [1, 2, 3, 4].map((n) => {
        const locked = n === 4 && !unlocked;
        return {
          v: String(n),
          html: (locked ? '🔒 ' : '') + n,
          title: FC.istemciOrder
            .slice(0, n)
            .map((k) => FC.ISTEMCI[k].name)
            .join(' + '),
          disabled: locked,
          onLocked: () => {
            DP.fx.toast('KurumsalApi henüz yazılmadı! “Genişlet” sahnesinde ekleyin.', 2600);
            ctx.flashScene('genislet');
          },
        };
      }),
      String(S.tz.n),
      (v) => act((c) => (c.n = Number(v))),
      { label: 'İstemci sayısı', cls: 'fc-seg' }
    );
    const degBtns = {};
    const degRow = h('div', { class: 'fc-degler' });
    FC.degisiklikOrder.forEach((k) => {
      const D = FC.DEGISIKLIK[k];
      const b = h('button', { class: 'fc-deg-btn', type: 'button', title: D.sub, html: `<span class="fc-deg-k"></span>${esc(D.title)}` });
      b.addEventListener('click', () => act((c) => (c[k] = !c[k])));
      degBtns[k] = b;
      degRow.appendChild(b);
    });
    const metrics = h('div', { class: 'fc-metrics' });
    const btnRun = h('button', { class: 'btn btn-primary btn-sm fc-run', type: 'button', title: 'Günün siparişlerini tek tek işlet' }, '▶ Çalıştır');
    btnRun.addEventListener('click', () => runGun());
    const controls = h(
      'div',
      { class: 'fc-tz-controls' },
      h('div', { class: 'fc-tz-row' }, h('span', { class: 'tb-label' }, 'Tasarım:'), designSeg.el, h('span', { class: 'tb-label' }, 'İstemci:'), nSeg.el),
      h('div', { class: 'fc-tz-row' }, h('span', { class: 'tb-label' }, 'Değişiklik:'), degRow, h('span', { class: 'tb-spacer' }), btnRun),
      metrics
    );
    const cvHost = h('div', { class: 'fc-cv' });
    const consoleEl = h('div', { class: 'console fc-console' });
    left.body.append(controls, cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: FC.roleOf, special: FC.special });

    // ---- sağ: gönderi merkezi
    const viewHost = h('div', { class: 'fc-view' });
    const extra = h('div', { class: 'fc-extra' });
    right.body.append(viewHost, extra);
    const stage = new FC.Merkez(viewHost, { cls: 'is-tezgah' });

    const FREE = 5;
    const STEPS = [
      {
        t: 'Kalıpsız · üç istemci',
        x: 'Kasa, web sitesi ve mobil uygulama yedi alt sistemi **kendileri** çağırıyor: 3 × 7 = **21 kablo**. Her kablo bir bağımlılık: alt sistem değişirse o istemci de değişir.',
        cfg: { design: 'naive', n: 3, limit: false, sigorta: false, kurye: false },
      },
      {
        t: 'Değişiklik: kart limiti',
        x: 'Ödeme ekibi kart limitini getirdi. Kalıpsız tasarımda kural **üç istemcide** ayrı ayrı yazılmalı: üç dosya değişti (kodun farkına bakın). Birini unutmak hayalet gönderi demek.',
        cfg: { design: 'naive', n: 3, limit: true, sigorta: false, kurye: false },
      },
      {
        t: 'Aynı değişiklik, cepheyle',
        x: 'Aynı kural cephe tasarımında **tek dosyada**: [[GonderiCephesi]]. İstemcilerin hiçbiri değişmedi; kablolar 21 yerine 3 + 7.',
        cfg: { design: 'cephe', n: 3, limit: true, sigorta: false, kurye: false },
      },
      {
        t: 'Üç değişiklik birden',
        x: 'Kart limiti, yeni bir alt sistem (sigorta) ve kurye API’sinin değişmesi. Cephede yalnızca cephe ve kurulum (Main) değişiyor; tabloda kalıpsız tasarımın bedeli: **4 dosya**.',
        cfg: { design: 'cephe', n: 3, limit: true, sigorta: true, kurye: true },
      },
      {
        t: 'Tek istemci olsaydı?',
        x: 'Tek istemcide cephe **kazandırmaz**: iki tasarımda da 2 dosya değişiyor. Kazanç istemci sayısıyla büyür: N istemci × M alt sistem yerine N + M bağımlılık.',
        cfg: { design: 'cephe', n: 1, limit: true, sigorta: true, kurye: true },
      },
      {
        t: 'Serbest: siz deneyin',
        x: unlocked
          ? 'Tasarımı, istemci sayısını ve değişiklikleri seçin; kod panelindeki farka ve tabloya bakın. **▶ Çalıştır** günün siparişlerini işletir. Kurumsal API de artık açık!'
          : 'Tasarımı, istemci sayısını ve değişiklikleri seçin; kod panelindeki farka ve tabloya bakın. **▶ Çalıştır** günün siparişlerini işletir. (🔒 Dördüncü istemci, Genişlet sahnesinde açılır.)',
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
      const c = Object.assign({}, cur || S.tz);
      fn(c);
      if (c.n === 4 && !unlocked) c.n = 3;
      S.tz = c;
      if (!STEPS[stepper.index].free) stepper.go(FREE, { animate: true });
      else draw(S.tz, true);
    }

    function renderMetrics(c) {
      const row = (design) => {
        const prog = FC.tezgahProg(Object.assign({}, c, { design }));
        const o = FC.olc(prog);
        return `<tr class="${design === c.design ? 'is-cur' : 'is-base'}"><th>${design === 'cephe' ? 'Cephe' : 'Kalıpsız'}</th><td>${o.bag}${o.cepheBag ? ` <span class="fc-mt-s">+${o.cepheBag}</span>` : ''}</td><td>${o.kopya}</td><td class="${o.degisen.length > 2 ? 'is-bad' : ''}">${o.degisen.length}</td><td>${o.yeni.length}</td></tr>`;
      };
      metrics.innerHTML = `<table class="fc-mt"><thead><tr><th>${c.n} istemci</th><th>istemci bağımlılığı</th><th>iş akışı kopyası</th><th>değişen dosya</th><th>yeni dosya</th></tr></thead><tbody>${row('naive')}${row('cephe')}</tbody></table>`;
    }

    /** Değişen dosyalar → sahnedeki rozetler */
    function finalState(c, r) {
      const prog = FC.tezgahProg(c);
      const o = FC.olc(prog);
      const st = FC.stateOf(prog, { run: r });
      st.clients.forEach((cl) => (cl.degisti = o.degisen.includes(FC.ISTEMCI[cl.ist].cls)));
      if (st.desk) st.desk.degisti = o.degisen.includes('GonderiCephesi');
      st.offices = st.offices || {};
      const dg = (k, t) => (st.offices[k] = Object.assign({}, st.offices[k] || {}, { degisti: t }));
      if (c.limit) dg('odeme', 'değişti');
      if (c.sigorta) dg('sigorta', 'YENİ');
      if (c.kurye) dg('kurye', 'arayüz değişti');
      const n = o.degisen.length;
      st.banner = n
        ? { text: `**${n} dosya** değişti: ${o.degisen.join(', ')}${o.yeni.length ? ` · yeni: ${o.yeni.join(', ')}` : ''}`, tone: n > 2 ? 'bad' : 'ok' }
        : { text: `${o.bag} istemci bağımlılığı${o.cepheBag ? ` + ${o.cepheBag} cephede` : ''} · henüz değişiklik yok` };
      return st;
    }

    function draw(cfg, animate) {
      stop();
      cur = Object.assign({}, cfg);
      const c = cur;
      designSeg.set(c.design);
      nSeg.set(String(c.n));
      FC.degisiklikOrder.forEach((k) => degBtns[k].classList.toggle('is-on', !!c[k]));
      renderMetrics(c);
      const prog = FC.tezgahProg(c);
      const r = FC.run(prog);
      // önce konsol, sonra kod
      FC.renderConsole(consoleEl, FC.cmd(true), r.lines.map((l) => FC.consoleLine(l)), { animateFrom: animate ? 0 : null });
      const F = FC.filesFor(prog);
      const base = FC.filesFor(Object.assign({}, prog, { f: {} }));
      const prevMap = {};
      Object.keys(base).forEach((n) => (prevMap[n + '.java'] = base[n]));
      const o = FC.olc(prog);
      const anyDiff = o.degisen.length || o.yeni.length;
      const first = o.degisen.find((n) => n !== 'Main') || o.degisen[0] || 'Main';
      cv.setFiles(FC.fileList(F), { active: first + '.java', prev: anyDiff ? prevMap : null, keepActive: false });
      // açılan dosyada ilk değişikliğe kaydır
      const iz = c.limit ? 'if (!odeme.cek(t.musteri(), tutar)) {' : c.sigorta ? (first === 'Main' ? 'SigortaServisi sigorta = new SigortaServisi();' : 'sigorta.police(no, tutar);') : c.kurye ? 'kurye.planla(' : null;
      if (iz) cv.mark(first + '.java', iz, 'focus', { smooth: false });
      show(finalState(c, r), animate);
      renderExtra(c, o);
    }

    /** Günün siparişlerini sırayla işletir: kablolarda jeton, ofislerde sonuç */
    function runGun() {
      if (!cur) return;
      stop();
      const c = cur;
      const prog = FC.tezgahProg(c);
      const r = FC.run(prog);
      const fin = finalState(c, r);
      btnRun.classList.add('is-running');
      let t = 0;
      const offices = {};
      r.iz.forEach((z) => {
        const ci = prog.istemciler.indexOf(z.ist);
        const cepheli = c.design === 'cephe';
        const base = () => Object.assign({}, fin, { offices: JSON.parse(JSON.stringify(offices)), banner: { text: `${FC.ISTEMCI[z.ist].tag}: ${z.t.musteri}, ${z.t.kg} kg` } });
        if (cepheli)
          at(t, () => show(Object.assign(base(), { token: { from: 'client:' + ci, to: 'cephe:in', text: 'gonder(t)', kind: 'req' }, wire: { client: ci, cephe: true } }), true));
        t += cepheli ? 700 : 200;
        z.adim.forEach((a) => {
          at(t, () => {
            offices[a.k] = { text: a.t, state: a.bad ? 'bad' : a.hayalet ? 'hayalet' : 'ok' };
            show(Object.assign(base(), { token: { from: cepheli ? 'cephe:out' : 'client:' + ci, to: 'office:' + a.k, text: FC.ALT[a.k].call, kind: a.bad ? 'bad' : 'req' }, wire: cepheli ? { office: a.k, cephe: true } : { client: ci, office: a.k } }), true);
          });
          t += 520;
        });
        t += 300;
      });
      at(t + 200, () => {
        show(fin, false);
        btnRun.classList.remove('is-running');
      });
    }

    function renderExtra(c, o) {
      extra.innerHTML = `<div class="fc-oneline"><span class="tb-label">Kural:</span><span>${md(c.design === 'cephe' ? 'İstemciler yalnızca **cepheyi** tanıyor; değişiklikler cephede ve kurulumda (Main).' : 'Her istemci **yedi alt sistemi** tanıyor; her değişiklik her istemciye yayılıyor.')}</span></div>`;
    }

    const foot = ui.foot(el);
    let stepper = null;
    stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: (i) => (STEPS[i].free ? 6000 : 9000),
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        el.classList.toggle('is-free', !!s.free);
        draw(s.free ? S.tz : s.cfg, info.animate);
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
