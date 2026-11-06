/*
 * Chain of Responsibility — sahneler (2/3): CANLI AKIŞ ve ZİNCİR TEZGÂHI
 *   Canlı Akış: kurye gönderiyi zincirin başına verir; her halka kendi kuralına bakar, tutmazsa isteği sonrakine
 *               iletir. Çağrı yığını halka halka büyür, konsol satırı parça parça yazılır.
 *   Tezgâh   : halkaları çıkarın, ekleyin, sırasını değiştirin; günün altı gönderisi zincirden geçer. Değişen tek
 *               dosya Main.java; hiçbir sırada soğuk zincir kuralı bozulmaz, ama sıra önceliği belirler.
 */
(function () {
  'use strict';
  const CR = DP.cr;
  const { h } = DP;
  const kit = DP.kit;
  const ui = CR.ui;
  const md = CR.md;
  const esc = DP.esc;

  function renderStack(stackEl, frames) {
    stackEl.innerHTML = '<span class="cs-label">Çağrı yığını</span>';
    frames.forEach((fr, i) => {
      if (i) stackEl.appendChild(h('span', { class: 'cs-sep' }, '›'));
      const r = CR.roleOf(fr.cls);
      stackEl.appendChild(h('span', { class: 'cs-frame' + (r ? ' rc rc-' + r : '') + (i === frames.length - 1 ? ' is-top' : '') }, fr.t));
    });
  }

  // ================================================================== 4. CANLI AKIŞ
  /** Halka kuralı tutmadığında anlatım */
  function neden(k, g, bolge) {
    const n = CR.neden(k, g);
    if (k === 'alici') return `Alıcı evde mi? Değil (${CR.KAPI[g.kapi].t}).`;
    if (k === 'komsu') return n === 'komşu yok' ? 'Komşu da evde değil.' : n === 'soğuk zincir' ? 'Komşu evde; ama gönderi **soğuk zincir**: komşuya ilaç bırakılmaz.' : 'Komşu evde; ama koli 10 kg’dan ağır.';
    if (k === 'dolap') return n === 'soğuk zincir' ? `Dolap soğutmalı değil: **soğuk zincir** reddedildi.${bolge === 'İstanbul' ? ' Kalıpsız İstanbul kuryesinde ilaç tam burada dolaba giriyordu!' : ''}` : 'Koli dolaba sığmıyor (5 kg üstü).';
    if (k === 'market') return n === 'soğuk zincir' ? 'Market soğuk zincir kabul etmiyor.' : 'Koli markete göre ağır (15 kg üstü).';
    if (k === 'sube') return 'Şube 20 kg’dan ağırını almıyor.';
    return '';
  }

  function flowSteps(p) {
    const seq = CR.seqSpec(p);
    const r = seq.run;
    const msgOf = seq.msgOf;
    const z = p.prog.zincirler[0];
    const keys = z.keys;
    const g = r.g;
    const MF = 'Main.java';
    const KF = 'Kurye.java';
    const TF = 'TeslimatAdimi.java';
    const fMain = { t: 'Main.main()', cls: 'Main' };
    const fKurye = { t: `${z.v}.teslimEt()`, cls: 'Kurye' };
    const fLink = (k) => ({ t: `${CR.HALKA[k].ad.toLocaleLowerCase('tr')}.teslimEt()`, cls: CR.HALKA[k].cls });
    const steps = [];
    const yolda = (k) => ({ kind: 'at', text: `zincirde: ${CR.HALKA[k].ad} bakıyor` });
    /** upto: kaç halka konsola yazdı · links: halka durumları */
    const snap = (x) => ({
      mode: 'chain',
      bolge: z.bolge,
      keys,
      links: x.links || {},
      parcel: { g, durum: x.durum },
      board: [{ g, adim: r.adim.slice(0, x.yol || 0), kayip: false }],
      boardTitle: 'Bu gönderinin yolu',
      token: x.token || null,
      banner: x.banner || null,
    });
    const linkSt = (upto, active) => CR.linkStates(keys, g, upto, { active }).links;
    const kurulum = CR.zincirSatirlari(z.v + 'Zinciri', keys).split('\n');

    steps.push({
      t: 'Kurulum: zincir',
      x: `Main ${keys.length} halka yarattı ve \`sonra(…)\` ile **birbirine bağladı**: ${keys.map((k) => CR.HALKA[k].ad).join(' → ')}. \`sonra(s)\` s’yi döndürdüğü için zincir tek ifadede kuruluyor. Kurye yalnızca zincirin **başını** aldı.`,
      code: [MF, kurulum[0].trim()], dev: [MF, [kurulum[1].trim(), kurulum[kurulum.length - 1].trim()]], stack: [fMain], con: -1, seq: -1, d: 6200,
      uml: { classes: ['Kurye', 'TeslimatAdimi'], edges: ['zincir', 'sonraki'], members: [['TeslimatAdimi', 'sonraki'], ['TeslimatAdimi', 'sonra']] },
      stage: snap({ durum: { kind: 'wait', text: 'henüz yola çıkmadı' }, banner: { text: `Zincir hazır: **${keys.length} halka**. Kurye yalnızca başını tanıyor.` } }),
    });
    steps.push({
      t: `${z.v}.teslimEt(g)`,
      x: `${g.alici}’in gönderisi kapıda: ${g.kg} kg${g.soguk ? ', **soğuk zincir** (ilaç)' : ''}, ${CR.KAPI[g.kapi].t}. [[Kurye]] önce etiketi konsola yazdı; teslimi **kimin** yapacağını düşünmüyor.`,
      code: [MF, `${z.v}.teslimEt(`], dev: [KF, 'System.out.print("[" + bolge + "] " + g.etiket() + ": ");'], stack: [fMain, fKurye], con: 0, seq: msgOf.teslim, d: 5200,
      uml: { classes: ['Kurye'], members: [['Kurye', 'teslimEt']] },
      stage: snap({ durum: { kind: 'wait', text: 'kuryede' } }),
    });
    steps.push({
      t: 'zincir.teslimEt(g)',
      x: `Kurye tek satır yazıyor: \`zincir.teslimEt(g)\`. İstek ilk halkaya, [[${CR.HALKA[keys[0]].cls}]]’e geldi. Kurye zincirin geri kalanını **bilmiyor**; kaç halka olduğunu da.`,
      code: [KF, 'zincir.teslimEt(g);'], dev: [TF, 'public final void teslimEt(Gonderi g) {'], stack: [fMain, fKurye, fLink(keys[0])], con: 0, seq: msgOf.zincir, d: 5200,
      uml: { classes: ['Kurye', 'TeslimatAdimi'], edges: ['zincir'], members: [['TeslimatAdimi', 'teslimEt']] },
      stage: snap({ links: { [keys[0]]: { state: 'active' } }, durum: yolda(keys[0]), token: { from: 'kurye', to: 'link:' + keys[0], text: g.no, kind: 'req' } }),
    });
    const frames = [fMain, fKurye];
    r.adim.forEach((a, i) => {
      const H = CR.HALKA[a.k];
      const F = H.cls + '.java';
      const ret = `return ${H.kural};`;
      frames.push(fLink(a.k));
      const kosul = CR.kosullar(a.k, g)
        .map((c) => `${c.t} ${c.ok ? '✓' : '✗'}`)
        .join(' · ');
      if (a.ok) {
        steps.push({
          t: `${H.ad}: dene(g) → true ✓`,
          x: `[[${H.cls}]]’in kuralı tuttu (${kosul}): halka gönderiyi **teslim aldı** ve konsola \`${H.ad} ✓\` yazdı. İstek burada **durdu**${i < keys.length - 1 ? `; sonraki halkalar (${keys.slice(i + 1).map((k) => CR.HALKA[k].ad).join(', ')}) hiç çağrılmadı` : ''}.`,
          code: [F, ret], dev: [TF, 'System.out.println(ad + " ✓");'], stack: frames.slice(), con: i + 1, seq: msgOf['dene:' + i], d: 6200,
          uml: { classes: ['TeslimatAdimi', H.cls], members: [['TeslimatAdimi', 'dene']] },
          stage: snap({ links: linkSt(i), yol: i + 1, durum: { kind: 'ok', text: `✓ ${H.ad} teslim aldı (${i + 1}. halka)` }, banner: { text: `**${H.ad}** teslim aldı: ${i} halka “bana değil” dedi, isteği iletti.`, tone: 'ok' } }),
        });
        return;
      }
      steps.push({
        t: `${H.ad}: dene(g)`,
        x: `[[${H.cls}]] yalnızca **kendi kuralına** bakıyor: ${kosul}. ${neden(a.k, g, z.bolge)} \`dene(g)\` → \`false\`.`,
        code: [F, ret], dev: [TF, 'if (dene(g)) {'], stack: frames.slice(), con: i, seq: msgOf['dene:' + i], d: 5600,
        uml: { classes: ['TeslimatAdimi', H.cls], members: [['TeslimatAdimi', 'dene']] },
        stage: snap({ links: linkSt(i, true), yol: i, durum: yolda(a.k) }),
      });
      const next = r.adim[i + 1].k;
      steps.push({
        t: `${H.ad} ✗ → sonraki`,
        x:
          i === 0
            ? `Kural tutmadı: halka konsola \`${H.ad} ✗ → \` yazdı ve isteği **sonraki** halkaya verdi: \`sonraki.teslimEt(g)\`. [[${H.cls}]] sonrakinin kim olduğunu bilmiyor; yalnızca bir \`TeslimatAdimi\` olduğunu biliyor.`
            : `\`${H.ad} ✗ → \` ve yine \`sonraki.teslimEt(g)\`: istek [[${CR.HALKA[next].cls}]]’e geçti. Çağrı yığınına bakın: her halka, bir öncekinin \`teslimEt\` çağrısının **içinde** çalışıyor.`,
        code: [TF, 'sonraki.teslimEt(g);'], dev: [TF, 'System.out.print(ad + " ✗ → ");'], stack: frames.concat([fLink(next)]), con: i + 1, seq: msgOf['ilet:' + i], d: i === 0 ? 6200 : 5000,
        uml: { classes: ['TeslimatAdimi'], edges: ['sonraki'], members: [['TeslimatAdimi', 'sonraki']] },
        stage: snap({ links: Object.assign(linkSt(i), { [next]: { state: 'active' } }), yol: i + 1, durum: yolda(next), token: { from: 'link:' + a.k, to: 'link:' + next, text: g.no, kind: 'req' } }),
      });
    });
    const son = r.adim.length;
    const yer = CR.HALKA[r.yer];
    const geri = [yer.ad].concat(r.adim.slice(0, -1).map((a) => CR.HALKA[a.k].ad).reverse()).join(' → ');
    steps.push({
      t: 'Dönüş: yığın çözülüyor',
      x: `Her \`teslimEt\` bir öncekinin içinde çağrılmıştı; şimdi yığın **tersine** çözülüyor: ${geri} → kurye → Main. Halkalar bir sonuç döndürmüyor (\`void\`): iş yapıldı, zincir bitti.`,
      code: [MF, `${z.v}.teslimEt(`], stack: [fMain], con: son, seq: msgOf.done, d: 5600,
      uml: { classes: ['Kurye', 'TeslimatAdimi'], edges: ['zincir'] },
      stage: snap({ links: linkSt(son - 1), yol: son, durum: { kind: 'ok', text: `✓ ${yer.ad} teslim aldı` } }),
    });
    steps.push({
      t: 'Sonuç: kurye ne bildi?',
      x: `Kurye yalnızca zincirin başını tanıdı. ${son} halka gönderiye baktı; ${son - 1} tanesi “bana değil” dedi, **${yer.ad}** teslim aldı. ${g.soguk ? 'Soğuk zincir kuralını komşu ve dolap **kendileri** denetledi; sıra değişse de bozulmaz.' : 'Üstten öbür tarifi seçip karşılaştırın.'}`,
      code: [MF, `${z.v}.teslimEt(`], stack: [fMain], con: son, seq: seq.spec.messages.length - 1, d: 6400,
      uml: { classes: ['Kurye', 'TeslimatAdimi'].concat(r.adim.map((a) => CR.HALKA[a.k].cls)), edges: ['zincir', 'sonraki'] },
      stage: snap({ links: linkSt(son - 1), yol: son, durum: { kind: 'ok', text: `✓ ${yer.ad} teslim aldı` }, banner: { text: `Kurye **1 halka** tanıdı · ${son} halka sorgulandı · **${yer.ad}** teslim aldı`, tone: 'ok' } }),
    });
    return { steps, seq, run: r };
  }

  CR.scenes.flow = function (root, ctx) {
    const S = ctx.state;
    let p = CR.presets[S.preset] || CR.presets.zeynep;
    const el = h('div', { class: 'scene scene-flow' });
    const toolbar = h('div', { class: 'scene-toolbar' });
    const body = h('div', { class: 'flow-body' + (S.showCode === false ? ' hide-code' : '') });
    el.append(toolbar, body);
    root.appendChild(el);

    const presetSeg = kit.seg(
      CR.presetOrder.map((k) => ({ v: k, label: CR.presets[k].title, title: k === 'ayse' ? 'Malatya zinciri: Ayşe Yılmaz, 2 kg, komşu evde' : 'İstanbul zinciri: Zeynep Güneş, ilaç (soğuk zincir), komşu evde' })),
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
      h('span', { class: 'tb-hint cr-key', html: '<span class="cr-key-c">kurye</span> zincirin başına verir · <span class="cr-key-h">halka</span> dener, olmazsa sonrakine iletir' }),
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
    const consoleEl = h('div', { class: 'console cr-flow-console', 'aria-live': 'polite' });
    codeCol.append(stackEl, cvPanel, consoleEl);
    body.append(viewPanel, codeCol);

    const stage = new CR.Hat(views.stage);
    const cv = new DP.CodeView(cvPanel, { roleOf: CR.roleOf, special: CR.special });
    let uml = null;
    let seq = null;
    let steps = [];
    let run = null;

    function load() {
      const f = flowSteps(p);
      steps = f.steps;
      run = f.run;
      cv.setFiles(CR.akisFiles(p), { active: 'Main.java', keepActive: false });
      views.seq.innerHTML = '';
      seq = new DP.SequenceDiagram(views.seq, f.seq.spec, { roles: CR.roles });
      const spec = CR.gofDiagram({ notes: true });
      if (uml) uml.update(spec, { animate: false });
      else uml = new DP.ClassDiagram(views.uml, spec, { roles: CR.roles, roleTags: true });
    }

    function setPreset(k) {
      if (CR.presets[k] === p) return;
      p = CR.presets[k];
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
      const line = s.con >= 0 ? [CR.consoleLine(run, { upto: s.con })] : [];
      // yeni yazılan parçalar (System.out.print) daktilo gibi belirir
      if (line.length && info.animate && ps && s.con > ps.con) line[0].newFrom = ps.con < 0 ? 0 : CR.lineParts(run, ps.con).length;
      CR.renderConsole(consoleEl, CR.cmd(), line, { cursor: i < steps.length - 1 });
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
      delayOf: (i) => (steps[i] && steps[i].d) || 5000,
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

  // ================================================================== 5. ZİNCİR TEZGÂHI
  CR.scenes.counter = function (root, ctx) {
    const S = ctx.state;
    S.tz = S.tz || { keys: CR.MALATYA.slice() };
    const unlocked = !!S.marketUnlocked;
    const el = h('div', { class: 'scene scene-split cr-tz' });
    const body = h('div', { class: 'scene-body cols-tz' });
    const left = kit.panel('Zincir masası', { cls: 'panel-code cr-left cr-tz-left' });
    const right = kit.panel('Teslimat hattı <span class="panel-sub">· halkadaki sayı = teslim aldığı gönderi</span>', { cls: 'panel-side cr-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    // ---- denetimler
    const chainRow = h('div', { class: 'cr-tz-chain', role: 'list', 'aria-label': 'Zincirdeki halkalar' });
    const poolRow = h('div', { class: 'cr-tz-pool' });
    const btnReset = h('button', { class: 'btn btn-ghost btn-sm', type: 'button', title: 'Malatya sırasına dön' }, '↺ Malatya sırası');
    btnReset.addEventListener('click', () => act(() => CR.MALATYA.slice()));
    const btnRun = h('button', { class: 'btn btn-primary btn-sm cr-run', type: 'button', title: 'Günün gönderilerini zincirden tek tek geçir' }, '▶ Çalıştır');
    btnRun.addEventListener('click', () => runGun());
    const metrics = h('div', { class: 'cr-metrics' });
    const controls = h(
      'div',
      { class: 'cr-tz-controls' },
      h('div', { class: 'cr-tz-row' }, h('span', { class: 'tb-label' }, 'Zincir:'), chainRow),
      h('div', { class: 'cr-tz-row' }, h('span', { class: 'tb-label' }, 'Ekle:'), poolRow, h('span', { class: 'tb-spacer' }), btnReset, btnRun)
    );
    const cvHost = h('div', { class: 'cr-cv' });
    const consoleEl = h('div', { class: 'console cr-console' });
    left.body.append(controls, cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: CR.roleOf, special: CR.special });

    // ---- sağ: teslimat hattı
    const viewHost = h('div', { class: 'cr-view' });
    const extra = h('div', { class: 'cr-extra' });
    right.body.append(viewHost, metrics, extra);
    const stage = new CR.Hat(viewHost, { cls: 'is-tezgah' });

    const FREE = 4;
    const STEPS = [
      {
        t: 'Malatya zinciri',
        x: 'Beş halka, Malatya sırası. Halkaların köşesindeki sayı, günün altı gönderisinden kaçını **teslim aldıkları**. Alttaki panoda her gönderinin yolu: hangi halkalar “bana değil” dedi, kim aldı?',
        keys: CR.MALATYA,
      },
      {
        t: 'İstanbul: önce dolap',
        x: 'Dolap ikinci sıraya geçti. Değişen tek dosya **Main** (kod farkına bakın); halka sınıflarının hiçbiri değişmedi. Ayşe’nin kolisi artık dolapta. Zeynep’in ilacı? Dolap onu **kendi kuralıyla** reddetti: kalıpsız İstanbul kuryesindeki hata zincirde olamaz.',
        keys: CR.ISTANBUL,
      },
      {
        t: 'Sıra = öncelik',
        x: 'Şube en başa alınınca 20 kg’a kadar her gönderiyi **ilk o** aldı: Ali evdeyken bile kolisi şubeye gitti. Kurallar yine bozulmadı; ama zincirde sıra, **kime önce sorulacağı** demek. Sırayı iş kuralı belirler.',
        keys: CR.SUBE_ONCE,
      },
      {
        t: 'Zincirin sonu: kimse almazsa?',
        x: 'İade halkası çıkarıldı. Mert’in 25 kg’lık kolisini şube de almadı ve zincir **bitti**: `sonraki == null` → **KAYIP**. GoF’un uyarısı: zincirde teslim **garanti değildir**. Sona her zaman işleyen bir halka koymak iyi bir alışkanlıktır.',
        keys: CR.IADESIZ,
      },
      {
        t: 'Serbest: siz deneyin',
        x: unlocked
          ? 'Halkaları ◀ ▶ ile taşıyın, ✕ ile çıkarın, **Ekle** satırından geri koyun. **▶ Çalıştır** gönderileri tek tek geçirir. Market halkası da artık açık!'
          : 'Halkaları ◀ ▶ ile taşıyın, ✕ ile çıkarın, **Ekle** satırından geri koyun. **▶ Çalıştır** gönderileri tek tek geçirir. (🔒 Market halkası Genişlet sahnesinde yazılır.)',
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
      let keys = fn((cur || S.tz.keys).slice());
      if (!unlocked) keys = keys.filter((k) => k !== 'market');
      if (!keys.length) return;
      S.tz = { keys };
      if (!STEPS[stepper.index].free) stepper.go(FREE, { animate: true });
      else draw(keys, true);
    }

    function renderChain(keys) {
      chainRow.innerHTML = '';
      keys.forEach((k, i) => {
        if (i) chainRow.appendChild(h('span', { class: 'cr-tz-ar', 'aria-hidden': 'true' }, '→'));
        const H = CR.HALKA[k];
        const chip = h('div', { class: 'cr-tz-chip rc rc-4', role: 'listitem' });
        chip.innerHTML = `<span class="cr-tz-i">${i + 1}</span><b>${esc(H.ad)}</b>`;
        const btn = (txt, title, dis, fn) => {
          const b = h('button', { class: 'cr-tz-b', type: 'button', title, 'aria-label': title }, txt);
          b.disabled = dis;
          b.addEventListener('click', fn);
          chip.appendChild(b);
        };
        btn('◀', `${H.ad} bir öne`, i === 0, () => act((ks) => (ks.splice(i - 1, 0, ks.splice(i, 1)[0]), ks)));
        btn('▶', `${H.ad} bir arkaya`, i === keys.length - 1, () => act((ks) => (ks.splice(i + 1, 0, ks.splice(i, 1)[0]), ks)));
        btn('✕', `${H.ad} zincirden çıkar`, keys.length === 1, () => act((ks) => ks.filter((x) => x !== k)));
        chainRow.appendChild(chip);
      });
      poolRow.innerHTML = '';
      const rest = Object.keys(CR.HALKA).filter((k) => !keys.includes(k));
      if (!rest.length) poolRow.appendChild(h('span', { class: 'cr-tz-none' }, 'hepsi zincirde'));
      rest.forEach((k) => {
        const locked = k === 'market' && !unlocked;
        const b = h('button', { class: 'cr-tz-add' + (locked ? ' is-locked' : ''), type: 'button', title: locked ? 'MarketeTeslim henüz yazılmadı' : CR.HALKA[k].cls + ' zincirin sonuna' }, (locked ? '🔒 ' : '+ ') + CR.HALKA[k].ad);
        b.addEventListener('click', () => {
          if (locked) {
            DP.fx.toast('MarketeTeslim henüz yazılmadı! “Genişlet” sahnesinde ekleyin.', 2600);
            ctx.flashScene('genislet');
            return;
          }
          act((ks) => ks.concat(k));
        });
        poolRow.appendChild(b);
      });
    }

    function renderMetrics(keys) {
      const o = CR.ozet(keys);
      const tile = (v, label, cls) => `<div class="cr-mt-t${cls ? ' ' + cls : ''}"><b>${v}</b><span>${label}</span></div>`;
      metrics.innerHTML = `<div class="cr-mt">
        ${keys.map((k) => tile(o.say[k], esc(CR.HALKA[k].ad), o.say[k] ? '' : 'is-zero')).join('')}
        ${tile(o.kayip, 'KAYIP', o.kayip ? 'is-bad' : 'is-zero')}
        <span class="cr-mt-sep"></span>
        ${tile(o.ort.toFixed(1).replace('.', ','), 'halka / gönderi')}
        ${tile(o.evdeyken, 'evdeyken başka yere', o.evdeyken ? 'is-warn' : '')}
        ${tile(o.ihlal, 'soğuk zincir ihlali', o.ihlal ? 'is-bad' : 'is-good')}
      </div>`;
    }

    function finalState(keys, o) {
      o = o || {};
      const prog = CR.tezgahProg(keys);
      const st = CR.chainState(prog);
      const oz = CR.ozet(keys);
      const sabit = JSON.stringify(keys) === JSON.stringify(CR.MALATYA);
      st.banner = o.banner || {
        text: oz.kayip
          ? `**${oz.kayip} gönderi KAYIP**: zincirin sonunda kimse teslim almadı.`
          : oz.evdeyken
          ? `Alıcı evdeyken **${oz.evdeyken} gönderi** başka yere gitti: sıra = öncelik.`
          : sabit
          ? 'Malatya sırası · değişen dosya yok'
          : 'Değişen tek dosya **Main.java** · halka sınıfları aynı · soğuk zincir ihlali **0**',
        tone: oz.kayip ? 'bad' : oz.evdeyken ? null : 'ok',
      };
      return st;
    }

    function draw(keys, animate) {
      stop();
      cur = keys.slice();
      renderChain(cur);
      renderMetrics(cur);
      const prog = CR.tezgahProg(cur);
      const r = CR.run(prog);
      // önce konsol, sonra kod
      CR.renderConsole(consoleEl, CR.cmd(true), r.map((l) => CR.consoleLine(l)), { animateFrom: animate ? 0 : null });
      const F = CR.tezgahFiles(cur);
      const base = CR.tezgahFiles(CR.MALATYA);
      const prevMap = {};
      Object.keys(base).forEach((n) => (prevMap[n + '.java'] = base[n]));
      const fark = F.Main !== base.Main || Object.keys(F).length !== Object.keys(base).length;
      cv.setFiles(CR.fileList(F), { active: 'Main.java', prev: fark ? prevMap : null, keepActive: false });
      const zs = CR.zincirSatirlari('malatyaZinciri', cur)
        .split('\n')
        .map((x) => x.trim());
      cv.mark('Main.java', zs.length > 1 ? [zs[0], zs[zs.length - 1]] : zs[0], 'focus', { smooth: false });
      show(finalState(cur), animate);
      extra.innerHTML = `<div class="cr-oneline"><span class="tb-label">Kural:</span><span>${md('Her halka yalnızca **kendi kuralına** bakar; ilk “ben alırım” diyen teslim alır. Sırayı ve halkaları **Main** belirler.')}</span></div>`;
    }

    /** Günün gönderilerini sırayla zincirden geçirir: jeton halka halka ilerler */
    function runGun() {
      if (!cur) return;
      stop();
      const keys = cur;
      const prog = CR.tezgahProg(keys);
      const lines = CR.run(prog);
      const fin = finalState(keys);
      btnRun.classList.add('is-running');
      let t = 0;
      const board = [];
      lines.forEach((l, gi) => {
        const bitti = board.slice(); // zamanlayıcı çalıştığında yalnızca öncekiler bitmiş olsun
        const base = (x) =>
          Object.assign({}, fin, {
            links: x.links,
            end: x.end || null,
            parcel: { g: l.g, durum: x.durum },
            board: bitti.concat([{ g: l.g, adim: l.adim.slice(0, x.yol), kayip: !!x.kayipYol, hl: true }]),
            token: x.token || null,
            banner: { text: `${gi + 1}/6 · ${CR.etiket(l.g)}` },
          });
        at(t, () => show(base({ links: { [keys[0]]: { state: 'active' } }, yol: 0, durum: { kind: 'at', text: `zincirde: ${CR.HALKA[keys[0]].ad} bakıyor` }, token: { from: 'kurye', to: 'link:' + keys[0], text: l.g.no, kind: 'req' } }), true));
        t += 560;
        l.adim.forEach((a, i) => {
          const links = CR.linkStates(keys, l.g, i).links;
          const son = i === l.adim.length - 1;
          const next = son ? null : l.adim[i + 1].k;
          if (next) links[next] = { state: 'active' };
          const durum = a.ok ? { kind: 'ok', text: `✓ ${CR.HALKA[a.k].ad} teslim aldı` } : son ? { kind: 'kayip', text: '✗ KAYIP: kimse teslim almadı' } : { kind: 'at', text: `zincirde: ${CR.HALKA[next].ad} bakıyor` };
          at(t, () => show(base({ links, yol: i + 1, kayipYol: son && !a.ok, end: son && !a.ok ? 'kayip' : null, durum, token: a.ok ? null : { from: 'link:' + a.k, to: next ? 'link:' + next : 'end', text: l.g.no, kind: son ? 'bad' : 'req' } }), true));
          t += a.ok ? 680 : 480;
        });
        board.push({ g: l.g, adim: l.adim, kayip: l.kayip });
        t += 350;
      });
      at(t + 150, () => {
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
        draw(s.free ? S.tz.keys : s.keys, info.animate);
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
