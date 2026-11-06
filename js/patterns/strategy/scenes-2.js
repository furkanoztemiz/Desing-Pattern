/*
 * Strategy — sahneler (2/3): CANLI AKIŞ ve ROTA TEZGÂHI
 *   Canlı Akış: kurye sıradaki durağı stratejisine sorar (strateji.sec), strateji yalnızca seçer; Main stratejiyi
 *               çalışırken değiştirir. İki tarif: soğuk zincir, sonra randevu · randevusuz gün (en yakın durak).
 *   Tezgâh   : stratejileri seçip teslimat yaptırın; aynı oturumu üç tasarımda karşılaştırın: if/else (sürüm 2.0),
 *               kalıtım (her algoritma bir Kurye alt sınıfı), Strategy. Üretilen Main.java ve konsol birlikte görünür.
 */
(function () {
  'use strict';
  const SG = DP.stg;
  const { h } = DP;
  const kit = DP.kit;
  const ui = SG.ui;
  const md = SG.md;

  function renderStack(stackEl, frames) {
    stackEl.innerHTML = '<span class="cs-label">Çağrı yığını</span>';
    frames.forEach((fr, i) => {
      if (i) stackEl.appendChild(h('span', { class: 'cs-sep' }, '›'));
      const r = SG.roleOf(fr.cls);
      stackEl.appendChild(h('span', { class: 'cs-frame' + (r ? ' rc rc-' + r : '') + (i === frames.length - 1 ? ' is-top' : '') }, fr.t));
    });
  }

  // ================================================================== 4. CANLI AKIŞ
  function flowSteps(p) {
    const seq = SG.seqSpec(p);
    const r = seq.run;
    const prog = p.prog;
    const O = r.olaylar;
    const B = seq.bolumler;
    const MF = 'Main.java';
    const KF = 'Kurye.java';
    const SF = (algo) => SG.ALGO[algo].sinif + '.java';
    const fMain = { t: 'Main.main()', cls: 'Main' };
    const fTes = { t: 'kurye.teslimEt()', cls: 'Kurye' };
    const fSec = (algo) => ({ t: 's.sec()', cls: SG.ALGO[algo].sinif });
    const fIc = { t: 'enYakin.sec()', cls: 'EnYakinRota' };
    const st = (s, x) => SG.stateFrom(prog, s, x);
    const steps = [];
    const son = B.length - 1;
    const kur = O.find((x) => x.e === 'kur');
    const a0 = kur.s.aktif;
    let bi = 1; // bölüm sayacı (kurulumdan sonra)
    let onceki = O.find((x) => x.e === 'sec' && x.ilk) || kur;
    let ilkDetay = true;

    steps.push({
      t: 'Kurulum',
      x: `Main bir [[${SG.ALGO[a0].sinif}]] yarattı ve kuryeye verdi: \`new Kurye(Durak.gunun(), new ${SG.ALGO[a0].sinif}())\`. Kurye bu nesneyi yalnızca **arayüz** türüyle tutuyor: \`RotaStratejisi strateji\`.${a0 === 'SOGUK' ? ' SogukOnceRota da kendi içinde bir [[EnYakinRota]] tutuyor.' : ''}`,
      code: [MF, `Kurye kurye = new Kurye(Durak.gunun(), new ${SG.ALGO[a0].sinif}());`], dev: [KF, 'this.strateji = strateji;'], stack: [fMain], con: kur.n || (r.lines[0] && r.lines[0].k === 'sec' ? 1 : 0), seq: { b: 0, m: B[0].spec.messages.length - 1 }, d: 5800,
      uml: { classes: ['Main', 'Kurye', 'RotaStratejisi', SG.ALGO[a0].sinif], edges: ['strateji', 'c-kurye'] },
      stage: st(kur.s, { vurgu: 'slot', banner: { text: `Yuvada **${SG.ALGO[a0].sinif}** · kurye depoda, 6 durak bekliyor` } }),
    });

    let ilkTeslim = {};
    prog.ops.forEach((op, k) => {
      if (k === 0 && op.t === 'sec') return;
      const b = bi++;
      const msg = B[b].msgOf;
      const ev = SG.istekOlaylari(r, k);
      if (op.t === 'sec') {
        const a = SG.ALGO[op.v];
        steps.push({
          t: `setStrateji(new ${a.sinif}())`,
          x: `${op.v === 'RANDEVU' ? 'Öğleden sonra randevulu müşteriler var: ' : ''}Main yeni bir [[${a.sinif}]] yaratıp kuryeye taktı. [[Kurye]]’nin kodu değişmedi; yalnızca yuvadaki **nesne** değişti. Liste de olduğu gibi duruyor: randevu sırasında.`,
          code: [MF, `kurye.setStrateji(new ${a.sinif}());`], dev: [KF, 'this.strateji = strateji;'], stack: [fMain, { t: 'kurye.setStrateji()', cls: 'Kurye' }], con: ev.sec.n, seq: { b, m: msg.set }, d: 5800,
          uml: { classes: ['Main', 'Kurye', a.sinif], members: [['Kurye', 'setStrateji']], edges: ['strateji'] },
          stage: st(ev.sec.s, { vurgu: 'slot', banner: { text: `Yuvaya **${a.sinif}** takıldı · Kurye değişmedi`, tone: 'ok' } }),
          prevStage: st(onceki.s, {}),
        });
        onceki = ev.son;
        return;
      }
      const tes = ev.teslim;
      const algo = tes.algo;
      const d = SG.durak(tes.no);
      const sOnce = onceki.s;
      const kalanOnce = sOnce.kalan.map(SG.durak);
      const ayrintili = !ilkTeslim[algo];
      ilkTeslim[algo] = true;
      const frames = [fMain, fTes, fSec(algo)];
      const sonDurum = st(tes.s, { secilen: tes.no, banner: { text: `→ **${tes.no}** ${d.alici} · ${tes.yol} km`, tone: 'ok' } });
      if (ayrintili) {
        steps.push({
          t: 'kurye.teslimEt()',
          x: ilkDetay
            ? 'Main “sıradaki teslimat” dedi. [[Kurye]] sıradaki durağı **kendisi seçmiyor**: stratejisine soruyor ve ona listenin salt okunur görünümünü veriyor. Hangi stratejinin takılı olduğunu bilmiyor.'
            : `Aynı çağrı, aynı satır: kurye yine yalnızca stratejisine soruyor. Bu kez yuvada [[${SG.ALGO[algo].sinif}]] var.`,
          code: [KF, 'Durak d = strateji.sec(konum, okunur);'], dev: [MF, 'kurye.teslimEt();'], stack: [fMain, fTes], con: onceki.n, seq: { b, m: msg.sec }, d: 5400,
          uml: { classes: ['Kurye', 'RotaStratejisi'], edges: ['strateji'], members: [['Kurye', 'teslimEt'], ['RotaStratejisi', 'sec']] },
          stage: st(sOnce, { vurgu: 'slot', banner: { text: '`strateji.sec(konum, okunur)` · kurye stratejiye soruyor' } }),
        });
        ilkDetay = false;
        if (algo === 'SOGUK') {
          const soguk = kalanOnce.filter((x) => x.soguk);
          const aday = soguk.length ? soguk : kalanOnce;
          steps.push({
            t: 'SogukOnceRota: soğuk zincirliler',
            x: soguk.length
              ? `[[SogukOnceRota]] listeden soğuk zincirlileri **süzdü**: ${soguk.map((x) => x.alici.split(' ')[0]).join(' ve ')}. Listeyi değiştirmiyor; yeni bir liste üretiyor (\`stream().filter(…).toList()\`).`
              : 'Soğuk zincirli kalmadı: [[SogukOnceRota]] bütün listeyi en yakın stratejisine veriyor.',
            code: [SF('SOGUK'), 'List<Durak> soguklar = kalan.stream().filter(Durak::soguk).toList();'], stack: frames, con: onceki.n, seq: { b, m: msg.suz }, d: 5400,
            uml: { classes: ['SogukOnceRota'], members: [['SogukOnceRota', 'sec']] },
            stage: st(sOnce, { aday: aday.map((x) => x.no), banner: { text: `Adaylar: **${aday.map((x) => x.alici.split(' ')[0]).join(', ')}**` } }),
          });
          steps.push({
            t: 'enYakin.sec(konum, soguklar)',
            x: `Hangisi daha yakın? [[SogukOnceRota]] bu soruyu kendi içindeki [[EnYakinRota]]’ya soruyor: bir strateji başka bir stratejiyi kullanabilir. Depodan uzaklıklar: ${aday.map((x) => `${x.alici.split(' ')[0]} ${SG.mesafe(sOnce.konum, x)} km`).join(', ')}.`,
            code: [SF('SOGUK'), 'return enYakin.sec(konum, soguklar.isEmpty() ? kalan : soguklar);'], dev: [SF('EN_YAKIN'), 'if (konum.mesafe(d.konum()) < konum.mesafe(secilen.konum())) {'], stack: frames.concat([fIc]), con: onceki.n, seq: { b, m: msg.icret }, d: 6000,
            uml: { classes: ['SogukOnceRota', 'EnYakinRota'], members: [['SogukOnceRota', 'enYakin'], ['EnYakinRota', 'sec']] },
            stage: st(sOnce, { aday: aday.map((x) => x.no), mesafeler: SG.mesafeler(sOnce.konum, aday), banner: { text: `En yakın soğuk zincirli: **${d.alici}** · ${tes.yol} km` } }),
          });
        } else if (algo === 'EN_YAKIN') {
          steps.push({
            t: 'EnYakinRota: en yakını ara',
            x: `[[EnYakinRota]] kalan durakların hepsine bakıp bulunulan yere **en yakın** olanı seçiyor: ${SG.mesafeler(sOnce.konum, kalanOnce).map((m) => `${SG.durak(m.no).alici.split(' ')[0]} ${m.km}`).join(', ')} km. Eşitlikte listede önce olan, yani randevusu önce olan kazanır.`,
            code: [SF('EN_YAKIN'), 'if (konum.mesafe(d.konum()) < konum.mesafe(secilen.konum())) {'], stack: frames, con: onceki.n, seq: { b, m: msg.ara }, d: 6200,
            uml: { classes: ['EnYakinRota'], members: [['EnYakinRota', 'sec']] },
            stage: st(sOnce, { mesafeler: SG.mesafeler(sOnce.konum, kalanOnce), banner: { text: `En yakın: **${d.alici}** · ${tes.yol} km` } }),
          });
        } else if (algo === 'RANDEVU') {
          steps.push({
            t: 'RandevuRota: listenin başı',
            x: `[[RandevuRota]] yalnızca \`kalan.get(0)\` diyor: liste randevu sırasında, çünkü onu yalnızca [[Kurye]] değiştirebiliyor; stratejiler salt okunur görünümü alıyor. Sürüm 2.0’da bozulan varsayım burada **korunuyor**: sıradaki ${d.alici} (R${d.sira}).`,
            code: [SF('RANDEVU'), 'return kalan.get(0);'], stack: frames, con: onceki.n, seq: { b, m: msg.ara }, d: 6000,
            uml: { classes: ['RandevuRota'], members: [['RandevuRota', 'sec']] },
            stage: st(sOnce, { secilen: tes.no, vurgu: 'liste', banner: { text: `Listenin başı: **${d.alici}** (R${d.sira})` } }),
          });
        }
        steps.push({
          t: `Teslim: ${tes.no}`,
          x: `Strateji yalnızca **seçti**; listeden çıkarmayı, kilometreyi ve konumu [[Kurye]] güncelledi: \`kalan.remove(d)\`, +${tes.yol} km. Konsolda teslimat satırı.`,
          code: [KF, 'System.out.println("→ " + d + " · " + yol + " km");'], dev: [KF, 'if (!kalan.remove(d)) {'], stack: [fMain, fTes], con: tes.n, seq: { b, m: msg.yuru }, d: 5400,
          uml: { classes: ['Kurye'], members: [['Kurye', 'kalan'], ['Kurye', 'teslimEt']] },
          stage: sonDurum,
          prevStage: st(sOnce, {}),
        });
      } else {
        let x;
        if (algo === 'SOGUK' && d.soguk) x = `İkinci soğuk zincirli: [[SogukOnceRota]] yine süzdü ve en yakınını seçti: ${d.alici} (${d.yer}).`;
        else if (algo === 'SOGUK') x = `Soğuk zincirli kalmadı; [[SogukOnceRota]] en yakın durağı seçti: ${d.alici}.`;
        else if (algo === 'EN_YAKIN') x = `Yine en yakını: ${SG.mesafeler(sOnce.konum, kalanOnce).map((m) => `${SG.durak(m.no).alici.split(' ')[0]} ${m.km}`).join(', ')} km → ${d.alici}.`;
        else x = `Listenin başı: ${d.alici} (R${d.sira}). Randevu sırası bozulmadan sürüyor.`;
        steps.push({
          t: `teslimEt() → ${tes.no}`,
          x,
          code: [MF, 'kurye.teslimEt();'], dev: [KF, 'Durak d = strateji.sec(konum, okunur);'], stack: frames, con: tes.n, seq: { b, m: msg.secret }, d: 5000,
          uml: { classes: ['Kurye', SG.ALGO[algo].sinif], members: [[SG.ALGO[algo].sinif, 'sec']] },
          stage: algo === 'EN_YAKIN' ? Object.assign({}, sonDurum, { mesafeler: SG.mesafeler(sOnce.konum, kalanOnce) }) : sonDurum,
          prevStage: st(sOnce, {}),
        });
      }
      onceki = ev.son;
    });

    const s = O[O.length - 1].s;
    steps.push({
      t: 'Sonuç',
      x:
        p.key === 'gun'
          ? 'Sürüm 2.0’ı bozan gün: sabah soğuk zincir, öğleden sonra randevu. Bu kez randevu sırası **1 → 2 → 3 → 4**: hiçbir strateji kuryenin listesini değiştiremedi. Kurye bütün gün aynı koddu; değişen yalnızca takılı strateji.'
          : 'Randevusuz bir gün: en yakın durak stratejisi altı durağı **32 km**’de bitirdi (randevu sırasıyla 41 km). Aynı kurye, aynı duraklar; yalnızca başka bir strateji nesnesi.',
      code: [MF, 'System.out.println(kurye.ozet());'], stack: [fMain], con: O[O.length - 1].n, seq: { b: son, m: 1 }, d: 6400,
      uml: { classes: ['Kurye', 'RotaStratejisi'], edges: ['strateji'] },
      stage: st(s, { banner: { text: p.key === 'gun' ? 'Randevu sırası korundu · **37 km** · 0 yanlış adım' : 'En yakın durak · **32 km**', tone: 'ok' } }),
    });
    return { steps, seq, run: r };
  }

  SG.scenes.flow = function (root, ctx) {
    const S = ctx.state;
    let p = SG.presets[S.preset] || SG.presets.gun;
    const el = h('div', { class: 'scene scene-flow' });
    const toolbar = h('div', { class: 'scene-toolbar' });
    const body = h('div', { class: 'flow-body' + (S.showCode === false ? ' hide-code' : '') });
    el.append(toolbar, body);
    root.appendChild(el);

    const presetSeg = kit.seg(
      SG.presetOrder.map((k) => ({ v: k, label: SG.presets[k].title, title: k === 'gun' ? 'Sabah soğuk zincir önce, öğleden sonra randevu sırası: sürüm 2.0’ı bozan gün' : 'Bütün gün en yakın durak' })),
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
      h('span', { class: 'tb-hint stg-key', html: '<span class="stg-key-c">kurye</span> sorar · <span class="stg-key-s">strateji</span> seçer' }),
      h('span', { class: 'tb-spacer' }),
      viewSeg.el,
      codeBtn
    );

    const viewPanel = h('section', { class: 'panel flow-view' });
    const views = { stage: h('div', { class: 'fv fv-stage' }), seq: h('div', { class: 'fv fv-seq stg-fv-seq' }), uml: h('div', { class: 'fv fv-uml' }) };
    Object.values(views).forEach((x) => viewPanel.appendChild(x));
    const seqHead = h('div', { class: 'stg-seq-head' });
    const seqHost = h('div', { class: 'stg-seq-host' });
    views.seq.append(seqHead, seqHost);
    const codeCol = h('div', { class: 'flow-code' });
    const stackEl = h('div', { class: 'callstack', 'aria-label': 'Çağrı yığını' });
    const cvPanel = h('section', { class: 'panel flow-cv' });
    const consoleEl = h('div', { class: 'console stg-flow-console', 'aria-live': 'polite' });
    codeCol.append(stackEl, cvPanel, consoleEl);
    body.append(viewPanel, codeCol);

    const stage = new SG.HaritaSahne(views.stage);
    const cv = new DP.CodeView(cvPanel, { roleOf: SG.roleOf, special: SG.special });
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
      cv.setFiles(SG.akisFiles(p), { active: 'Main.java', keepActive: false });
      const spec = SG.gofDiagram({ notes: true });
      if (uml) uml.update(spec, { animate: false });
      else uml = new DP.ClassDiagram(views.uml, spec, { roles: SG.roles, roleTags: true });
    }

    function showSeq(b, m, animate) {
      const B = flow.seq.bolumler[b];
      if (b !== seqB) {
        seqHost.innerHTML = '';
        seq = new DP.SequenceDiagram(seqHost, B.spec, { roles: SG.roles });
        seqB = b;
        animate = false;
      }
      const n = flow.seq.bolumler.length;
      seqHead.innerHTML = `<b>${DP.esc(B.baslik)}</b><span>${b > 0 && b < n - 1 ? `istek ${b} / ${n - 2}` : ''}</span>`;
      seq.show(m, animate);
    }

    function setPreset(k) {
      if (SG.presets[k] === p) return;
      p = SG.presets[k];
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
      SG.renderConsole(consoleEl, SG.cmd(), run.lines.slice(0, s.con).map((l) => SG.consoleLine(l)), { animateFrom: info.animate && ps && s.con > ps.con ? ps.con : null, cursor: i < steps.length - 1 });
      cv.clear();
      for (let j = 0; j < i; j++) cv.mark(steps[j].code[0], steps[j].code[1], 'trail', { show: false, scroll: false });
      if (s.dev) cv.mark(s.dev[0], s.dev[1], 'focus', { show: false, scroll: false });
      cv.mark(s.code[0], s.code[1], 'active', { flash: !!ps && ps.code[0] !== s.code[0] });
      const ileri = ps && prev === i - 1;
      stage.render(s.stage, ileri && s.prevStage ? s.prevStage : ps ? ps.stage : null, { animate: info.animate && S.view === 'stage' && ileri });
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

  // ================================================================== 5. ROTA TEZGÂHI
  const { S: OS, T: OT } = SG.op;
  const TASARIM_AD = { v2: 'if/else (2.0)', kalitim: 'Kalıtım', strateji: 'Strategy' };

  SG.scenes.counter = function (root, ctx) {
    const S = ctx.state;
    S.tz = S.tz || { design: 'strateji', ops: SG.TEZGAH_ANA.slice() };
    const unlocked = !!S.agirUnlocked;
    const el = h('div', { class: 'scene scene-split stg-tz' });
    const body = h('div', { class: 'scene-body cols-tz' });
    const left = kit.panel('Kurye tableti', { cls: 'panel-code stg-left stg-tz-left' });
    const right = kit.panel('Kuryenin günü <span class="panel-sub">· aynı istekler, üç tasarım</span>', { cls: 'panel-side stg-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    // ---- denetimler
    const designSeg = kit.seg(
      [
        { v: 'v2', label: 'if/else (2.0)', title: 'Algoritmalar Kurye’nin içinde; soğuk zincir dalı ortak listeyi sıralıyor' },
        { v: 'kalitim', label: 'Kalıtım', title: 'Her algoritma bir Kurye alt sınıfı; kuryenin sınıfı sonradan değişmez' },
        { v: 'strateji', label: 'Strategy', title: 'Algoritmalar ayrı nesneler; kurye yalnızca arayüzü tanır' },
      ],
      S.tz.design,
      (v) => act((c) => (c.design = v)),
      { label: 'Tasarım', cls: 'stg-seg' }
    );
    const btnReset = h('button', { class: 'btn btn-ghost btn-sm', type: 'button', title: 'Oturumu boşalt' }, '↺ Sıfırla');
    const btnRun = h('button', { class: 'btn btn-primary btn-sm stg-run', type: 'button', title: 'Oturumu baştan, istek istek oynat' }, '▶ Oynat');
    btnReset.addEventListener('click', () => act((c) => (c.ops = [])));
    btnRun.addEventListener('click', () => oynat());
    const algoBtns = SG.ALGO_SIRA.map((a) => {
      const b = h('button', { class: 'stg-tz-b is-' + SG.RENK[a], type: 'button', title: SG.ALGO[a].sinif }, '');
      b.addEventListener('click', () => {
        if (a === 'AGIR' && !unlocked) {
          DP.fx.toast('Ağır önce stratejisi henüz yazılmadı! “Genişlet” sahnesinde ekleyin.', 2600);
          ctx.flashScene('genislet');
          return;
        }
        if (a === 'AGIR' && (cur || S.tz).design !== 'strateji') {
          DP.fx.toast('AgirOnceRota yalnızca Strategy tasarımında var.', 2400);
          return;
        }
        ekle(OS(a));
      });
      return b;
    });
    const bTeslim = h('button', { class: 'stg-tz-b is-teslim', type: 'button', title: 'kurye.teslimEt()' }, '▸ Teslim et');
    bTeslim.addEventListener('click', () => ekle(OT()));
    const bBitir = h('button', { class: 'stg-tz-b is-teslim', type: 'button', title: 'Kalan durakların hepsi' }, '⏭ Günü bitir');
    bBitir.addEventListener('click', () => {
      const tz = cur || S.tz;
      const kalan = SG.DURAKLAR.length - SG.teslimSayisi(tz.ops);
      if (!kalan) return DP.fx.toast('Bütün duraklar teslim edildi.', 2000);
      const yer = SG.ISTEK_EN_COK - tz.ops.length;
      if (yer <= 0) return DP.fx.toast('En çok ' + SG.ISTEK_EN_COK + ' istek.', 2200);
      act((c) => {
        for (let k = 0; k < Math.min(kalan, yer); k++) c.ops.push(OT());
      });
    });
    const opsRow = h('div', { class: 'stg-tz-ops' });
    const controls = h(
      'div',
      { class: 'stg-tz-controls' },
      h('div', { class: 'stg-tz-row' }, h('span', { class: 'tb-label' }, 'Tasarım:'), designSeg.el, h('span', { class: 'tb-spacer' }), btnReset, btnRun),
      h('div', { class: 'stg-tz-row' }, h('span', { class: 'tb-label' }, 'Strateji:'), h('div', { class: 'stg-tz-grup' }, ...algoBtns)),
      h('div', { class: 'stg-tz-row' }, h('span', { class: 'tb-label' }, 'Kurye:'), bTeslim, bBitir),
      h('div', { class: 'stg-tz-row is-ops' }, h('span', { class: 'tb-label' }, 'Oturum:'), opsRow)
    );
    const cvHost = h('div', { class: 'stg-cv' });
    const consoleEl = h('div', { class: 'console stg-console' });
    left.body.append(controls, cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: SG.roleOf, special: SG.special });

    // ---- sağ: sahne + ölçüler
    const viewHost = h('div', { class: 'stg-view' });
    const metrics = h('div', { class: 'stg-metrics' });
    right.body.append(viewHost, metrics);
    const stage = new SG.HaritaSahne(viewHost, { cls: 'is-tezgah' });

    const FREE = 4;
    const STEPS = [
      {
        t: 'Strategy: sabah soğuk zincir, sonra randevu',
        x: 'Sürüm 2.0’ı bozan gün: soğuk zincir önce iki teslimat, sonra randevu sırası. Strategy’de stratejiler listeyi yalnızca okuyor: randevu sırası 1 → 2 → 3 → 4, **0** yanlış adım, 37 km.',
        tz: { design: 'strateji', ops: SG.TEZGAH_ANA },
      },
      {
        t: 'Aynı oturum: if/else (2.0)',
        x: 'Aynı istekler, sürüm 2.0. Soğuk zincir dalı ortak listeyi sıraladı; randevu dalı listenin başını alınca sıra 1 → 4 → 3 → 2 oldu: **2 yanlış adım**. Kırmızı kesikli bacaklar kurala aykırı adımlar.',
        tz: { design: 'v2', ops: SG.TEZGAH_ANA },
      },
      {
        t: 'Aynı oturum: kalıtım',
        x: 'Kalıtımda algoritma kuryenin **sınıfı**: sabah `SogukOnceKuryesi` yaratıldı. Öğleden sonraki randevu isteğinin karşılığı yok; nesnenin sınıfı değişmez. Kurye bütün gün soğuk önce (sonra en yakın) gitti: **1** değiştirilemeyen seçim, **1** yanlış adım.',
        tz: { design: 'kalitim', ops: SG.TEZGAH_ANA },
      },
      {
        t: 'Soğuk zincir yokken: if/else sorunsuz',
        x: 'Sabah en yakın, öğleden sonra randevu. if/else (2.0) bu oturumda **hata vermiyor**: en yakın dalı listeye dokunmuyor. Hata yalnızca soğuk zincir dalı çalıştıktan sonra görünüyor. Tasarımı değiştirip kalıtımda ne olduğuna da bakın.',
        tz: { design: 'v2', ops: SG.TEZGAH_YAKIN },
      },
      {
        t: 'Serbest: siz deneyin',
        x: unlocked
          ? 'Strateji seçin, teslimat yaptırın; tasarımı değiştirip aynı oturumu karşılaştırın. **Ağır önce** stratejisi de açık (yalnızca Strategy’de).'
          : 'Strateji seçin, teslimat yaptırın; tasarımı değiştirip aynı oturumu karşılaştırın. (🔒 Ağır önce stratejisi Genişlet sahnesinde yazılır.)',
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
      // ağır önce yalnızca Strategy tasarımında (Genişlet’ten sonra)
      c.agir = c.design === 'strateji' && unlocked;
      if (!c.agir) c.ops = c.ops.filter((op) => !(op.t === 'sec' && op.v === 'AGIR'));
      S.tz = c;
      if (!STEPS[stepper.index].free) stepper.go(FREE, { animate: true });
      else draw(S.tz, true);
    }

    function ekle(op) {
      const tz = cur || S.tz;
      if (!SG.uygun(Object.assign({}, tz, { agir: tz.design === 'strateji' && unlocked }), op)) {
        DP.fx.toast(tz.ops.length >= SG.ISTEK_EN_COK ? 'En çok ' + SG.ISTEK_EN_COK + ' istek.' : op.t === 'teslim' ? 'Bütün duraklar teslim edildi.' : 'Bu istek şu an yapılamaz.', 2200);
        return;
      }
      act((c) => c.ops.push(op));
    }

    const etiket = (op) => (op.t === 'teslim' ? '▸ teslim' : '◆ ' + SG.ALGO[op.v].kisa);

    function renderControls(tz, o) {
      designSeg.set(tz.design);
      const s = o.run.son;
      SG.ALGO_SIRA.forEach((a, k) => {
        const b = algoBtns[k];
        const kilitli = a === 'AGIR' && !unlocked;
        b.innerHTML = `${kilitli ? '🔒 ' : ''}${SG.ALGO[a].ad}`;
        b.classList.toggle('is-on', s.istenen === a);
        b.classList.toggle('is-kilit', a === 'AGIR' && (!unlocked || tz.design !== 'strateji'));
      });
      const bitti = SG.teslimSayisi(tz.ops) >= SG.DURAKLAR.length;
      bTeslim.classList.toggle('is-kapali', bitti);
      bBitir.classList.toggle('is-kapali', bitti);
      opsRow.innerHTML = '';
      if (!tz.ops.length) opsRow.appendChild(h('span', { class: 'stg-tz-none' }, 'henüz istek yok'));
      const red = new Set(o.run.olaylar.filter((x) => x.e === 'sec' && x.reddedildi).map((x) => x.i));
      const yanlis = new Set(o.run.olaylar.filter((x) => x.e === 'teslim' && x.yanlis).map((x) => x.i));
      tz.ops.forEach((op, i) => opsRow.appendChild(h('span', { class: 'stg-tz-op is-' + (op.t === 'teslim' ? 'teslim' : SG.RENK[op.v]) + (red.has(i) || yanlis.has(i) ? ' is-bad' : ''), title: i + 1 + '. istek' + (red.has(i) ? ' · değiştirilemedi' : yanlis.has(i) ? ' · kurala aykırı adım' : '') }, etiket(op))));
    }

    const NOT = {
      v2: 'Algoritmalar **Kurye’nin içinde**; soğuk zincir dalı ortak listeyi sıralıyor.',
      kalitim: 'Her algoritma bir **alt sınıf**; kuryenin sınıfı sonradan değişmez.',
      strateji: 'Kurye yalnızca `strateji.sec(…)` der; stratejiler listeyi **yalnızca okur**.',
    };
    function renderMetrics(tz, o) {
      const tile = (v, label, cls) => `<div class="stg-mt-t${cls ? ' ' + cls : ''}"><b>${v}</b><span>${label}</span></div>`;
      metrics.innerHTML = `<div class="stg-mt">
        ${tile(o.islem, 'istek')}
        ${tile(o.teslim + '/6', 'teslimat')}
        ${tile(o.km, 'km')}
        <span class="stg-mt-sep"></span>
        ${tile(o.yanlisAdim, 'yanlış adım', o.yanlisAdim ? 'is-bad' : 'is-good')}
        ${tile(o.reddedilen, 'değiştirilemeyen seçim', o.reddedilen ? 'is-bad' : 'is-good')}
        <span class="stg-mt-not">${md(NOT[tz.design])}</span>
      </div>`;
    }

    function finalState(tz, o) {
      const prog = SG.tezgahProg(tz);
      const st = SG.sonDurum(prog, { run: o.run });
      st.banner =
        o.yanlisAdim || o.reddedilen
          ? { text: `${o.reddedilen ? `**${o.reddedilen}** değiştirilemeyen seçim · ` : ''}**${o.yanlisAdim}** yanlış adım · ${o.km} km`, tone: 'bad' }
          : tz.design === 'strateji'
          ? { text: `Strategy · ${o.teslim}/6 teslimat · ${o.km} km · **0** yanlış adım`, tone: 'ok' }
          : { text: `${TASARIM_AD[tz.design]} bu oturumda hata vermedi · ${o.teslim}/6 teslimat · ${o.km} km` };
      return st;
    }

    function draw(tz, animate) {
      stop();
      cur = { design: tz.design, ops: tz.ops.slice(), agir: tz.design === 'strateji' && unlocked };
      const o = SG.olc(cur);
      renderControls(cur, o);
      renderMetrics(cur, o);
      // önce konsol, sonra kod
      SG.renderConsole(consoleEl, SG.cmd(true), SG.satirlar(o.run, null), { animateFrom: animate ? 0 : null });
      const F = SG.tezgahFiles(cur);
      cv.setFiles(SG.fileList(F), { active: cur.design === 'v2' ? 'Kurye.java' : 'Main.java', keepActive: false });
      if (cur.design === 'v2') cv.mark('Kurye.java', 'kalan.sort(Comparator.comparing(Durak::soguk).reversed()', 'bad', { smooth: false });
      else if (cur.design === 'kalitim') {
        const red = cur.ops.some((op, i) => i && op.t === 'sec');
        cv.mark('Main.java', red ? { find: '// istek:' } : { find: 'Kurye kurye = new' }, red ? 'bad' : 'focus', { smooth: false });
      } else cv.mark('Main.java', cur.ops.some((op, i) => i && op.t === 'sec') ? { find: 'kurye.setStrateji(' } : { find: 'Kurye kurye = new' }, 'focus', { smooth: false });
      show(finalState(cur, o), animate);
    }

    /** Oturumu baştan oynatır: her teslimatta kamyonet yeni bacağı gider */
    function oynat() {
      if (!cur) return;
      stop();
      const prog = SG.tezgahProg(cur);
      const r = SG.run(prog);
      const o = SG.olc(cur);
      const fin = finalState(cur, o);
      btnRun.classList.add('is-running');
      let t = 0;
      show(SG.stateFrom(prog, SG.BOS_AN(prog), { banner: { text: 'Oturum baştan oynatılıyor…' } }), false);
      t += 600;
      cur.ops.forEach((op, k) => {
        const ev = SG.istekOlaylari(r, k);
        if (!ev.son) return;
        const metin = `${k + 1}/${cur.ops.length} · ${etiket(op)}`;
        if (op.t === 'sec') {
          const red = ev.sec && ev.sec.reddedildi;
          at(t, () => show(SG.stateFrom(prog, ev.son.s, { vurgu: 'slot', red: red ? op.v : null, banner: { text: metin + (red ? ' — **değiştirilemez**' : ''), tone: red ? 'bad' : null } }), true));
          t += 1100;
          return;
        }
        const tes = ev.teslim;
        if (!tes) return;
        at(t, () =>
          show(
            SG.stateFrom(prog, tes.s, {
              secilen: tes.no,
              beklenen: tes.yanlis ? tes.beklenen : null,
              sirala: ev.sirala ? { once: ev.sirala.once, sonra: ev.sirala.sonra } : null,
              banner: { text: `${metin} → ${tes.no}${tes.yanlis ? ` — **beklenen ${tes.beklenen}**` : ''}`, tone: tes.yanlis ? 'bad' : null },
            }),
            true
          )
        );
        t += 1500;
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
