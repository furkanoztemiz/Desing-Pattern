/*
 * Proxy — sahneler (2/3): CANLI AKIŞ ve VEKİL TEZGÂHI
 *   Canlı Akış: istek istemciden vekile gelir; vekil önce kimin sorduğunu (koruma), sonra önbelleği denetler,
 *               gerçek nesne yoksa ilk ihtiyaçta yaratır (sanal) ve ancak o zaman GlobalShip'e sorar.
 *   Tezgâh   : bir trafik senaryosu seçilir; vekil açılıp kapanır, denetimleri tek tek seçilir.
 *               İstemci kodu hiç değişmez; oturum, sorgu, ücret, engellenen ve sızan istekler değişir.
 */
(function () {
  'use strict';
  const PX = DP.px;
  const { h } = DP;
  const kit = DP.kit;
  const ui = PX.ui;
  const md = PX.md;
  const esc = DP.esc;

  function renderStack(stackEl, frames) {
    stackEl.innerHTML = '<span class="cs-label">Çağrı yığını</span>';
    frames.forEach((fr, i) => {
      if (i) stackEl.appendChild(h('span', { class: 'cs-sep' }, '›'));
      const r = PX.roleOf(fr.cls);
      stackEl.appendChild(h('span', { class: 'cs-frame' + (r ? ' rc rc-' + r : '') + (i === frames.length - 1 ? ' is-top' : '') }, fr.t));
    });
  }

  // ================================================================== 4. CANLI AKIŞ
  function flowSteps(p) {
    const seq = PX.seqSpec(p);
    const r = seq.run;
    const msgOf = seq.msgOf;
    const [istKey, m] = p.prog.s[0];
    const I = PX.ISTEMCI[istKey];
    const M = PX.MUSTERI[m];
    const IF = I.cls + '.java';
    const VF = 'TakipVekili.java';
    const GF = 'GlobalShipTakip.java';
    const v = istKey === 'sms' ? 'metin' : 'durum';
    const fMain = { t: 'Main.main()', cls: 'Main' };
    const fIst = { t: `${I.v}.${I.m}()`, cls: I.cls };
    const fVek = { t: 'vekil.sorgula()', cls: 'TakipVekili' };
    const steps = [];
    // sahne durumu adım adım değişir
    const S = { screen: null, cache: [], gercek: false, oturum: 0, sorgu: 0 };
    let out = 0;
    const snap = (x) => {
      x = x || {};
      return {
        mode: 'vekil',
        lanes: [{ ist: istKey, m, screen: S.screen }],
        vekil: { koruma: 'on', onbellek: 'on', sanal: 'on', oturum: M.ad, cache: S.cache.slice(), gercek: S.gercek, gate: x.gate || {} },
        gs: { oturum: S.oturum, sorgu: S.sorgu, sessions: S.gercek ? [`${I.tag}/${M.ad}`] : [], live: [S.gercek], active: !!x.active, bump: x.bump || [] },
        token: x.token || null,
        banner: x.banner || null,
      };
    };
    const callLine = (i) => {
      const no = r.iz[i].no;
      const same = r.iz.slice(0, i).filter((z) => z.no === no).length;
      return [Main, { find: `${I.v}.${I.m}("${no}")`, nth: same + 1 }];
    };
    const Main = 'Main.java';

    steps.push({
      t: 'Vekil kuruldu',
      x: `Main, ${I.name.toLowerCase()} için bir [[TakipVekili]] oluşturdu ve istemciye **TakipServisi** olarak verdi. GlobalShip’e henüz bağlanılmadı: \`gercek = null\`. Sanal vekil gerçek nesneyi **ihtiyaç olana kadar** yaratmaz.`,
      code: [Main, `TakipServisi servis = new TakipVekili(${m});`], stack: [fMain], out: 0, seq: -1, d: 5200,
      uml: { classes: ['MusteriPaneli', 'TakipVekili'], edges: ['uses'] },
      stage: snap({ banner: { text: `${I.tag} hazır: karşısındaki bir **vekil**, GlobalShip’e henüz bağlanılmadı.` } }),
    });

    r.iz.forEach((z, i) => {
      const no = z.no;
      const kendi = PX.sahibi(m, no);
      const first = i === 0;
      steps.push({
        t: `${I.v}.${I.m}("${no}")`,
        x: `${first ? `[[${I.cls}]] yalnızca \`servis.sorgula("${no}")\` diyor; karşısındakinin vekil mi gerçek servis mi olduğunu **bilmiyor**.` : 'İstek yine vekile geldi.'}${kendi ? '' : ` Ama ${no} ${M.ad}’nin gönderisi değil.`}`,
        code: callLine(i), dev: [IF, `${v} = servis.sorgula(takipNo);`], stack: [fMain, fIst, fVek], out, seq: msgOf['sorgula:' + i], d: 4400,
        uml: { classes: [I.cls, 'TakipServisi'], edges: ['uses'] },
        stage: snap({ token: { from: 'client', to: 'vekilIn', text: `sorgula(${no})`, kind: 'req' } }),
      });
      if (z.adim.includes('koruma-bad')) {
        steps.push({
          t: `Koruma: ${no} ✗`,
          x: `Vekil önce **kimin sorduğuna** baktı: \`oturum.sahibi("${no}")\` yanlış. \`SecurityException\` fırlatıldı; istek **kapıda kaldı**.`,
          code: [VF, 'throw new SecurityException'], dev: [VF, 'if (!oturum.sahibi(takipNo)) {'], stack: [fMain, fIst, fVek], out, seq: msgOf['koruma:' + i], d: 4800,
          uml: { members: [['TakipVekili', 'oturum'], ['TakipVekili', 'sorgula']] },
          stage: snap({ gate: { koruma: 'bad' }, token: { from: 'vekil', to: 'client', text: '✗ KVKK', kind: 'bad' } }),
        });
        out = r.iz[i].cikti[r.iz[i].cikti.length - 1] + 1;
        S.screen = { no, kind: 'kvkk' };
        steps.push({
          t: 'İstemci yakalar',
          x: `[[${I.cls}]] istisnayı yakalayıp mesajı gösterdi. **GlobalShip’e hiç gidilmedi**${S.gercek ? '' : '; oturum bile açılmadı (`gercek` hâlâ null)'}. Yetkiyi denetlemek vekilin, hatayı göstermek istemcinin işi.`,
          code: [IF, `${v} = e.getMessage();`], stack: [fMain, fIst], out, seq: msgOf['ret:' + i], d: 4800,
          uml: { classes: [I.cls] },
          stage: snap({ banner: { text: `**${no}** engellendi: vekil, isteği gerçek servise iletmedi.`, tone: 'bad' } }),
        });
        return;
      }
      const korumaOk = z.adim.includes('koruma-ok');
      const hit = z.adim.includes('onbellek-hit');
      steps.push({
        t: hit ? `Koruma ✓ · önbellekte var` : `Koruma ✓ · önbellek boş`,
        x: hit
          ? `\`${no}\` ${M.ad}’nin ✓. **Önbellekte var**: GlobalShip’e gidilmeden cevap döndü. 0 ms, 0 kuruş.`
          : `\`${no}\` ${M.ad}’nin ✓ (koruma geçti). Önbellekte **yok**: gerçek servise sormak gerekiyor.`,
        code: [VF, 'String kayit = onbellek.get(takipNo);'], dev: korumaOk ? [VF, 'if (!oturum.sahibi(takipNo)) {'] : null, stack: [fMain, fIst, fVek], out, seq: msgOf['onbellek:' + i], d: hit ? 5000 : 4600,
        uml: { members: [['TakipVekili', 'oturum'], ['TakipVekili', 'onbellek']] },
        stage: snap({ gate: { koruma: 'ok', onbellek: hit ? 'hit' : 'miss' } }),
      });
      if (hit) {
        out = z.cikti[z.cikti.length - 1] + 1;
        S.screen = { no, kind: 'ok' };
        steps.push({
          t: 'Önbellekten döndü',
          x: `[[${I.cls}]] cevabı gösterdi. Konsola bakın: **[GlobalShip] satırı yok**. Aynı soru ikinci kez sorulduğunda vekil cevabı kendi defterinden verdi.`,
          code: [VF, 'return kayit;'], stack: [fMain, fIst], out, seq: msgOf['ret:' + i], d: 4800,
          uml: { members: [['TakipVekili', 'onbellek']] },
          stage: snap({ gate: { onbellek: 'hit' }, token: { from: 'vekil', to: 'client', text: 'önbellekten', kind: 'hit' }, banner: { text: 'Önbellekten: **0 ms, 0 kuruş**.', tone: 'ok' } }),
        });
        return;
      }
      if (z.adim.includes('create')) {
        S.gercek = true;
        S.oturum++;
        out = z.cikti[0] + 1;
        steps.push({
          t: 'Sanal: gercek = new GlobalShipTakip()',
          x: `\`gercek\` null’dı: vekil gerçek nesneyi **şimdi**, ilk ihtiyaçta yarattı ve GlobalShip’te oturum açıldı (1200 ms). ${steps.some((s) => s.t === 'İstemci yakalar') ? 'Engellenen istekte bu bedel hiç ödenmedi.' : 'İstemci açıldığından beri bu bedel ödenmemişti.'}`,
          code: [VF, 'gercek = new GlobalShipTakip();'], dev: [GF, 'oturum++;'], stack: [fMain, fIst, fVek, { t: 'new GlobalShipTakip()', cls: 'GlobalShipTakip' }], out, seq: msgOf['create:' + i], d: 5200,
          uml: { members: [['TakipVekili', 'gercek'], ['GlobalShipTakip', 'ctor']], edges: ['gercek'] },
          stage: snap({ gate: { gercek: 'create' }, active: true, bump: ['oturum', 'süre'], token: { from: 'vekil', to: 'gs', text: '«create»', kind: 'req' } }),
        });
      }
      S.sorgu++;
      out = z.cikti[z.cikti.length - 2] + 1;
      steps.push({
        t: `gercek.sorgula("${no}")`,
        x: `Vekil çağrıyı **gerçek nesneye** iletti. GlobalShip ağ üzerinden cevap verdi: 800 ms, 25 kuruş. Bu, bu oturumdaki ${S.sorgu}. ağ sorgusu.`,
        code: [VF, 'kayit = gercek.sorgula(takipNo);'], dev: [GF, 'public String sorgula(String takipNo) {'], stack: [fMain, fIst, fVek, { t: 'gercek.sorgula()', cls: 'GlobalShipTakip' }], out, seq: msgOf['qret:' + i], d: 4800,
        uml: { members: [['GlobalShipTakip', 'sorgula']], edges: ['gercek'] },
        stage: snap({ gate: { gercek: 'call' }, active: true, bump: ['sorgu', 'süre', 'ücret'], token: { from: 'vekil', to: 'gs', text: `sorgula(${no})`, kind: 'req' } }),
      });
      S.cache.push(no);
      S.screen = { no, kind: kendi ? 'ok' : 'leak' };
      out = z.cikti[z.cikti.length - 1] + 1;
      steps.push({
        t: 'Önbelleğe yaz, döndür',
        x: `Cevap önbelleğe yazıldı (\`onbellek.put\`) ve [[${I.cls}]]’e döndü: “${PX.durum(no)}”. Aynı soru tekrar gelirse GlobalShip’e gidilmeyecek.`,
        code: [VF, 'onbellek.put(takipNo, kayit);'], dev: [VF, 'return kayit;'], stack: [fMain, fIst], out, seq: msgOf['ret:' + i], d: 4800,
        uml: { members: [['TakipVekili', 'onbellek']] },
        stage: snap({ gate: { onbellek: 'miss' }, token: { from: 'gs', to: 'client', text: PX.durum(no), kind: 'ok' } }),
      });
    });

    const st = r.stats;
    steps.push({
      t: 'Sonuç: vekil ne kazandırdı?',
      x: `${st.istek} isteğe ${st.sorgu} ağ sorgusu${st.engel ? `; ${st.engel} istek kapıda kaldı` : ''}. İstemci kodunda tek bir denetim satırı yok: koruma, önbellek ve gerçek nesnenin yaratılma anı **vekilin** işi. Üstten öbür tarifi seçip karşılaştırın.`,
      code: [Main, 'System.out.println(GlobalShipTakip.ozet());'], stack: [fMain], out: r.lines.length, seq: seq.spec.messages.length - 1, d: 6400,
      uml: { classes: ['TakipVekili', 'TakipServisi', 'GlobalShipTakip'], edges: ['r-vekil', 'gercek'] },
      stage: snap({ banner: { text: `${st.istek} istek → **${st.sorgu} sorgu**, ${st.sorgu * PX.COST.kurus} kuruş${st.engel ? ` · ${st.engel} engellendi` : ''}`, tone: 'ok' } }),
    });
    return { steps, seq, run: r };
  }

  PX.scenes.flow = function (root, ctx) {
    const S = ctx.state;
    let p = PX.presets[S.preset] || PX.presets.ali;
    const el = h('div', { class: 'scene scene-flow' });
    const toolbar = h('div', { class: 'scene-toolbar' });
    const body = h('div', { class: 'flow-body' + (S.showCode === false ? ' hide-code' : '') });
    el.append(toolbar, body);
    root.appendChild(el);

    const presetSeg = kit.seg(
      PX.presetOrder.map((k) => ({ v: k, label: PX.presets[k].title, title: k === 'ali' ? 'Ali kendi gönderisini iki kez sorar' : 'Ayşe önce Ali’nin, sonra kendi gönderisini sorar' })),
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
      h('span', { class: 'tb-hint px-key', html: '<span class="px-key-v">vekil</span> denetler · <span class="px-key-g">gerçek nesne</span> ancak gerekince' }),
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
    const consoleEl = h('div', { class: 'console px-flow-console', 'aria-live': 'polite' });
    codeCol.append(stackEl, cvPanel, consoleEl);
    body.append(viewPanel, codeCol);

    const stage = new PX.Hat(views.stage, { minH: 500 });
    const cv = new DP.CodeView(cvPanel, { roleOf: PX.roleOf, special: PX.special });
    let uml = null;
    let seq = null;
    let steps = [];
    let run = null;

    function load() {
      const f = flowSteps(p);
      steps = f.steps;
      run = f.run;
      cv.setFiles(PX.akisFiles(p), { active: 'Main.java', keepActive: false });
      views.seq.innerHTML = '';
      seq = new DP.SequenceDiagram(views.seq, f.seq.spec, { roles: PX.roles });
      const spec = PX.gofDiagram({ notes: true });
      if (uml) uml.update(spec, { animate: false });
      else uml = new DP.ClassDiagram(views.uml, spec, { roles: PX.roles, roleTags: true });
    }

    function setPreset(k) {
      if (PX.presets[k] === p) return;
      p = PX.presets[k];
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
      PX.renderConsole(
        consoleEl,
        '$ java Main',
        run.lines.slice(0, s.out).map((l) => PX.consoleLine(l, { kvkkOk: true })),
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
      delayOf: (i) => (steps[i] && steps[i].d) || 4600,
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

  // ================================================================== 5. VEKİL TEZGÂHI
  const KAPI = [
    { k: 'koruma', label: 'Koruma', title: 'KVKK: müşteri yalnızca kendi gönderisini görür' },
    { k: 'onbellek', label: 'Önbellek', title: 'Aynı soruyu GlobalShip’e ikinci kez sorma' },
    { k: 'sanal', label: 'Sanal', title: 'Gerçek nesneyi ilk ihtiyaçta yarat (açılışta değil)' },
  ];

  PX.scenes.counter = function (root, ctx) {
    const S = ctx.state;
    S.tz = S.tz || { trafik: 'merak', vekil: true, koruma: true, onbellek: true, sanal: true };
    const unlocked = !!S.smsUnlocked;
    const el = h('div', { class: 'scene scene-split px-tz' });
    const body = h('div', { class: 'scene-body cols-tz' });
    const left = kit.panel('Vekil tezgâhı', { cls: 'panel-code px-left px-tz-left' });
    const right = kit.panel('İstek hattı <span class="panel-sub">· istemci kodu hiç değişmiyor</span>', { cls: 'panel-side px-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    // ---- denetimler
    const trafikSeg = kit.seg(
      PX.trafikOrder.map((k) => {
        const T = PX.trafik[k];
        const locked = T.locked && !unlocked;
        return {
          v: k,
          html: (locked ? '🔒 ' : '') + esc(T.title),
          title: `${PX.ISTEMCI[T.ist].name} · ${PX.MUSTERI[T.m].ad}: ${T.c.length ? T.c.map((c) => c[1]).join(', ') : 'hiç sorgu yok'}`,
          disabled: locked,
          onLocked: () => {
            DP.fx.toast('SmsBildirim henüz yazılmadı! “Genişlet” sahnesinde ekleyin.', 2600);
            ctx.flashScene('genislet');
          },
        };
      }),
      'merak',
      (v) => act((c) => (c.trafik = v)),
      { label: 'Trafik', cls: 'px-trafik' }
    );
    const vekilBtn = h('button', { class: 'px-switch', type: 'button', role: 'switch' }, h('span', { class: 'px-switch-k' }), h('span', { class: 'px-switch-t' }, 'Vekil'));
    vekilBtn.addEventListener('click', () => act((c) => (c.vekil = !c.vekil)));
    const kapiBtns = {};
    const kapiRow = h('div', { class: 'px-kapilar' });
    KAPI.forEach((K) => {
      // sanal kapının simgesi: gerçek nesnenin fişi
      const b = h('button', { class: 'px-kapi', type: 'button', title: K.title, html: `<svg viewBox="0 0 24 24" aria-hidden="true">${PX.icon(K.k === 'sanal' ? 'gercek' : K.k, 0, 0)}</svg><span>${esc(K.label)}</span>` });
      b.addEventListener('click', () => act((c) => (c[K.k] = !c[K.k])));
      kapiBtns[K.k] = b;
      kapiRow.appendChild(b);
    });
    const metrics = h('div', { class: 'px-metrics' });
    const btnRun = h('button', { class: 'btn btn-primary btn-sm px-run', type: 'button', title: 'Trafiği istek istek oynat' }, '▶ Çalıştır');
    btnRun.addEventListener('click', () => runTraffic());
    const controls = h(
      'div',
      { class: 'px-tz-controls' },
      h('div', { class: 'px-tz-row' }, h('span', { class: 'tb-label' }, 'Trafik:'), trafikSeg.el),
      h('div', { class: 'px-tz-row' }, vekilBtn, kapiRow, h('span', { class: 'tb-spacer' }), btnRun),
      metrics
    );
    const cvHost = h('div', { class: 'px-cv' });
    const consoleEl = h('div', { class: 'console px-console' });
    left.body.append(controls, cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: PX.roleOf, special: PX.special });

    // ---- sağ: istek hattı
    const viewHost = h('div', { class: 'px-view' });
    const extra = h('div', { class: 'px-extra' });
    right.body.append(viewHost, extra);
    const stage = new PX.Hat(viewHost, { minH: 500, cls: 'is-tezgah' });

    const FREE = 4;
    const STEPS = [
      {
        t: 'Vekilsiz',
        x: 'Ali’nin paneli doğrudan [[GlobalShipTakip]]’e bağlı: panel açılınca oturum açılıyor, her yenileme bir ağ sorgusu. Dört istek, **dört sorgu**, 100 kuruş.',
        cfg: { trafik: 'yenile', vekil: false, koruma: false, onbellek: false, sanal: false },
      },
      {
        t: 'Önbellek vekili',
        x: 'Aynı panel, **aynı kod**. Araya yalnızca önbellek tutan bir vekil girdi (`new TakipVekili()`): dört isteğe **bir** sorgu. Panelin haberi bile yok.',
        cfg: { trafik: 'yenile', vekil: true, koruma: false, onbellek: true, sanal: false },
      },
      {
        t: 'Koruma vekili',
        x: 'Meraklı Ayşe önce Ali’nin, sonra Zeynep’in gönderisini sordu. Koruma açık: iki istek **kapıda kaldı**, GlobalShip yalnızca Ayşe’nin gönderisi için çalıştı. Korumayı kapatıp sızıntıyı görün.',
        cfg: { trafik: 'merak', vekil: true, koruma: true, onbellek: true, sanal: false },
      },
      {
        t: 'Sanal vekil',
        x: 'Zeynep paneli açtı, hiçbir şey sormadan çıktı. **Sanal** açıkken gerçek nesne hiç yaratılmadı: **0 oturum**. Sanalı kapatın: açılışta 1200 ms boşa gider.',
        cfg: { trafik: 'bakip', vekil: true, koruma: true, onbellek: true, sanal: true },
      },
      {
        t: 'Serbest: vekili siz ayarlayın',
        x: unlocked
          ? 'Trafiği ve vekilin denetimlerini seçin, **▶ Çalıştır** ile izleyin. İstemci kodu hiç değişmiyor; yalnızca Main’de araya giren nesne. **SMS gece işi** de artık açık!'
          : 'Trafiği ve vekilin denetimlerini seçin, **▶ Çalıştır** ile izleyin. İstemci kodu hiç değişmiyor; yalnızca Main’de araya giren nesne. (🔒 **SMS gece işi**, Genişlet sahnesinde açılır.)',
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
      if (PX.trafik[c.trafik].locked && !unlocked) return;
      S.tz = c;
      if (!STEPS[stepper.index].free) stepper.go(FREE, { animate: true });
      else draw(S.tz, true);
    }

    /** Programın son durumu: istemcinin son ekranı, önbellek, oturumlar */
    function finalState(c, r) {
      const T = PX.trafik[c.trafik];
      const shows = r.lines.filter((l) => l.k === 'show' || l.k === 'leak' || l.k === 'kvkk');
      const lastLine = shows[shows.length - 1];
      const z = lastLine ? r.iz.find((x) => x.cikti.includes(r.lines.indexOf(lastLine))) : null;
      const cache = [];
      if (c.vekil && c.onbellek) r.iz.forEach((x) => x.adim.includes('put') && cache.push(x.no));
      return {
        mode: c.vekil ? 'vekil' : 'yok',
        lanes: [{ ist: T.ist, m: T.m, screen: z ? { no: z.no, kind: lastLine.k === 'leak' ? 'leak' : lastLine.k === 'kvkk' ? 'kvkk' : 'ok' } : null }],
        vekil: c.vekil ? { koruma: c.koruma ? 'on' : 'off', onbellek: c.onbellek ? 'on' : 'off', sanal: c.sanal ? 'on' : 'off', oturum: PX.MUSTERI[T.m].ad, cache, gercek: r.stats.oturum > 0 } : null,
        gs: { oturum: r.stats.oturum, sorgu: r.stats.sorgu, sessions: r.stats.oturum ? [`${PX.ISTEMCI[T.ist].tag}/${PX.MUSTERI[T.m].ad}`] : [], live: [r.stats.oturum > 0] },
      };
    }

    function renderMetrics(c, r) {
      const base = PX.run(PX.tezgahProg({ trafik: c.trafik, vekil: false })).stats;
      const st = r.stats;
      const row = (name, x, cls) =>
        `<tr class="${cls || ''}"><th>${name}</th><td>${x.oturum}</td><td>${x.sorgu}</td><td>${x.ms} ms</td><td>${x.kurus} kr</td><td class="${x.engel ? 'is-ok' : ''}">${x.engel}</td><td class="${x.sizinti ? 'is-bad' : ''}">${x.sizinti}</td></tr>`;
      metrics.innerHTML = `<table class="px-mt"><thead><tr><th></th><th>oturum</th><th>sorgu</th><th>süre</th><th>ücret</th><th>engel</th><th>sızıntı</th></tr></thead><tbody>${row(c.vekil ? 'Bu vekil' : 'Vekilsiz', st, 'is-cur')}${c.vekil ? row('Vekilsiz', base, 'is-base') : ''}</tbody></table>`;
    }

    function draw(cfg, animate) {
      stop();
      cur = Object.assign({}, cfg);
      const c = cur;
      trafikSeg.set(c.trafik);
      vekilBtn.classList.toggle('is-on', !!c.vekil);
      vekilBtn.setAttribute('aria-checked', String(!!c.vekil));
      KAPI.forEach((K) => {
        kapiBtns[K.k].classList.toggle('is-on', !!c[K.k]);
        kapiBtns[K.k].disabled = !c.vekil;
      });
      const prog = PX.tezgahProg(c);
      const r = PX.run(prog);
      renderMetrics(c, r);
      // önce konsol, sonra kod
      PX.renderConsole(consoleEl, '$ javac *.java && java Main', r.lines.map((l) => PX.consoleLine(l, { kvkkOk: true })), { animateFrom: animate ? 0 : null });
      const F = PX.tezgahFiles(c);
      const T = PX.trafik[c.trafik];
      const order = ['Main', 'TakipVekili', PX.ISTEMCI[T.ist].cls, 'TakipServisi', 'GlobalShipTakip', 'Musteri'].filter((n) => F[n]);
      cv.setFiles(order.map((n) => ({ name: n + '.java', code: F[n] })), { active: c.vekil && stepper && STEPS[stepper.index].free ? 'TakipVekili.java' : 'Main.java', keepActive: false });
      cv.mark('Main.java', c.vekil ? 'new TakipVekili(' : 'new GlobalShipTakip()', 'focus', { smooth: false, show: false, scroll: cv.active === 'Main.java' });
      if (c.vekil) cv.mark('TakipVekili.java', c.koruma ? 'if (!oturum.sahibi(takipNo)) {' : c.onbellek ? 'String kayit = onbellek.get(takipNo);' : c.sanal ? 'gercek = new GlobalShipTakip();' : 'return gercek.sorgula(takipNo);', 'focus', { smooth: false, show: false, scroll: cv.active === 'TakipVekili.java' });
      const fs = finalState(c, r);
      const st = r.stats;
      fs.banner = st.sizinti
        ? { text: `**${st.sizinti} sızıntı:** ${PX.MUSTERI[T.m].ad} başkasının adresini gördü.`, tone: 'bad' }
        : { text: `${st.istek} istek → **${st.sorgu} sorgu**, ${st.oturum} oturum${st.engel ? ` · ${st.engel} engellendi` : ''}`, tone: 'ok' };
      show(fs, animate);
      renderExtra(stepper ? stepper.index : 0, c, r);
    }

    /** Trafiği istek istek oynatır */
    function runTraffic() {
      if (!cur) return;
      stop();
      const c = cur;
      const T = PX.trafik[c.trafik];
      const r = PX.run(PX.tezgahProg(c));
      const M = PX.MUSTERI[T.m];
      const lane = { ist: T.ist, m: T.m, screen: null };
      const G = { oturum: 0, sorgu: 0 };
      const cache = [];
      let gercek = false;
      let t = 0;
      btnRun.classList.add('is-running');
      // açılış: sanal değilse (ya da vekil yoksa) oturum hemen açılır
      if (r.kurulum[0].length) {
        G.oturum = 1;
        gercek = true;
      }
      const base = (x) => {
        x = x || {};
        return {
          mode: c.vekil ? 'vekil' : 'yok',
          lanes: [Object.assign({}, lane)],
          vekil: c.vekil ? { koruma: c.koruma ? 'on' : 'off', onbellek: c.onbellek ? 'on' : 'off', sanal: c.sanal ? 'on' : 'off', oturum: M.ad, cache: cache.slice(), gercek, gate: x.gate || {} } : null,
          gs: { oturum: G.oturum, sorgu: G.sorgu, sessions: gercek ? [`${PX.ISTEMCI[T.ist].tag}/${M.ad}`] : [], live: [gercek], active: !!x.active, bump: x.bump || [] },
          token: x.token || null,
          banner: x.banner || null,
        };
      };
      at(t, () => show(base({ banner: { text: gercek ? 'Açılış: oturum **hemen** açıldı (1200 ms).' : 'Açılış: GlobalShip’e **henüz** bağlanılmadı.' }, bump: gercek ? ['oturum', 'süre'] : [] }), true));
      t += 1300;
      const V = !!c.vekil;
      r.iz.forEach((z) => {
        const no = z.no;
        at(t, () => show(base({ token: { from: 'client', to: V ? 'vekilIn' : 'gs', text: `sorgula(${no})`, kind: 'req' } }), true));
        t += 900;
        if (z.adim.includes('koruma-bad')) {
          at(t, () => {
            lane.screen = { no, kind: 'kvkk' };
            show(base({ gate: { koruma: 'bad' }, token: { from: 'vekil', to: 'client', text: '✗ KVKK', kind: 'bad' } }), true);
          });
          t += 1200;
          return;
        }
        if (z.adim.includes('onbellek-hit')) {
          at(t, () => {
            lane.screen = { no, kind: PX.sahibi(T.m, no) ? 'ok' : 'leak' };
            show(base({ gate: { koruma: c.koruma ? 'ok' : null, onbellek: 'hit' }, token: { from: 'vekil', to: 'client', text: 'önbellekten', kind: 'hit' } }), true);
          });
          t += 1200;
          return;
        }
        if (V && (c.koruma || c.onbellek)) {
          at(t, () => show(base({ gate: { koruma: c.koruma ? 'ok' : null, onbellek: c.onbellek ? 'miss' : null } }), true));
          t += 700;
        }
        if (z.adim.includes('create')) {
          at(t, () => {
            G.oturum++;
            gercek = true;
            show(base({ gate: { gercek: 'create' }, active: true, bump: ['oturum', 'süre'], token: { from: V ? 'vekil' : 'client', to: 'gs', text: '«create»', kind: 'req' } }), true);
          });
          t += 1000;
        }
        at(t, () => {
          G.sorgu++;
          show(base({ gate: V ? { gercek: 'call' } : {}, active: true, bump: ['sorgu', 'süre', 'ücret'], token: { from: V ? 'vekil' : 'client', to: 'gs', text: `sorgula(${no})`, kind: 'req' } }), true);
        });
        t += 1000;
        at(t, () => {
          if (z.adim.includes('put')) cache.push(no);
          const kendi = PX.sahibi(T.m, no);
          lane.screen = { no, kind: kendi ? 'ok' : 'leak' };
          show(base({ token: { from: 'gs', to: 'client', text: PX.durum(no), kind: kendi ? 'ok' : 'bad' }, banner: kendi ? null : { text: `**Sızıntı:** ${M.ad}, ${PX.alici(no)} bilgisini gördü.`, tone: 'bad' } }), true);
        });
        t += 1300;
      });
      at(t + 200, () => {
        draw(c, false);
        btnRun.classList.remove('is-running');
      });
    }

    function renderExtra(i, c, r) {
      const s = STEPS[i];
      if (!s) return;
      if (i === 3 || (s.free && c.trafik === 'bakip')) {
        const off = PX.run(PX.tezgahProg(Object.assign({}, c, { sanal: false }))).stats;
        const on = PX.run(PX.tezgahProg(Object.assign({}, c, { sanal: true }))).stats;
        extra.innerHTML = c.vekil
          ? `<div class="px-oneline"><span class="tb-label">Hiç sorgu yokken açılış:</span><span>sanal kapalı <b class="bad">${off.oturum} oturum · ${off.ms} ms</b></span><span>sanal açık <b class="ok">${on.oturum} oturum · ${on.ms} ms</b></span></div>`
          : '';
      } else extra.innerHTML = '';
    }

    const foot = ui.foot(el);
    let stepper = null;
    stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: (i) => (STEPS[i].free ? 6000 : 12000),
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        el.classList.toggle('is-free', !!s.free);
        draw(s.free ? S.tz : s.cfg, info.animate);
        if (info.animate) at(900, runTraffic);
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
