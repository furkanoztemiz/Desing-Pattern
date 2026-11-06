/*
 * Bridge — sahneler (2/3): CANLI AKIŞ ve EŞLEŞTİRME TEZGÂHI
 *   Canlı Akış: yazıcı ve etiket nesneleri kurulur, köprü bağlanır; yazdir() içindeki her ilkel çağrı köprüden
 *               geçip yazıcının diline çevrilir, etiket adım adım basılır. Sahne, sıralama ve sınıf diyagramı.
 *   Tezgâh   : matristen bir hücre seçilir; o eşleşme için sınıf yok, nesneler çalışma anında birleşir.
 *               Aynı etiket başka yazıcıda, aynı yazıcı başka etikette, çalışma anında yazıcı değiştirme.
 */
(function () {
  'use strict';
  const BR = DP.br;
  const { h } = DP;
  const kit = DP.kit;
  const ui = BR.ui;
  const md = BR.md;
  const esc = DP.esc;

  function renderStack(stackEl, all) {
    stackEl.innerHTML = '<span class="cs-label">Çağrı yığını</span>';
    const frames = all.length > 3 ? all.slice(-2) : all;
    if (frames !== all) {
      stackEl.appendChild(h('span', { class: 'cs-frame cs-more', title: all.slice(0, -2).map((x) => x.t).join(' › ') }, '…'));
      stackEl.appendChild(h('span', { class: 'cs-sep' }, '›'));
    }
    frames.forEach((fr, i) => {
      if (i) stackEl.appendChild(h('span', { class: 'cs-sep' }, '›'));
      const r = BR.roleOf(fr.cls);
      stackEl.appendChild(h('span', { class: 'cs-frame' + (r ? ' rc rc-' + r : '') + (i === frames.length - 1 ? ' is-top' : '') }, fr.t));
    });
  }

  /** Her cihazın her ilkel işlemi nasıl karşıladığı (anlatım için) */
  const SAY = {
    zebra: {
      basla: '`^XA` etiketi başlatır, `^CI28` UTF-8’i açar: Türkçe karakterler doğru basılır.',
      cerceve: 'Milimetreler noktaya çevrildi (1 mm = 8 nokta); `^GB` bir kutu çizer.',
      yazi: '`^FO` konumu (nokta), `^A0N,30` yazı tipini, `^FD…^FS` metni verir.',
      barkod: '`^BCN,80`: 80 nokta yüksekliğinde Code 128 barkod.',
      bitir: '`^XZ` etiketi bitirir; yazıcı etiketi basıp keser.',
    },
    pdf: {
      basla: 'PDF kütüphanesi 100 × 60 mm’lik yeni bir sayfa açtı.',
      cerceve: 'PDF milimetreyle çalışır: dikdörtgen olduğu gibi çizildi.',
      yazi: 'Metin, verilen konuma (mm) yazıldı.',
      barkod: 'Code128 barkod sayfaya çizildi.',
      bitir: 'Sayfa kaydedildi; dosya e-postaya eklenebilir.',
    },
    termal: {
      basla: '`ESC @` yazıcıyı sıfırlar.',
      cerceve: 'Fiş yazıcısı çerçeve çizemez, yerine bir çizgi basar: gerçekleştirici ilkel işlemi **elinden geldiğince** karşılar.',
      yazi: 'Termal yazıcı konum bilmez: x ve y’yi yok sayıp metni sıradaki satıra basar.',
      barkod: '`GS k` fişe barkod basar.',
      bitir: '`GS V` kâğıdı keser; kurye fişi koliye yapıştırır.',
    },
    html: {
      basla: 'Müşteri panelinde etiket için bir `div` açıldı.',
      cerceve: 'Çerçeve bir CSS kutusu oldu.',
      yazi: 'Metin, mutlak konumlu bir paragraf oldu.',
      barkod: 'Barkod bir SVG olarak çizildi.',
      bitir: '`div` kapandı; etiket sayfada görünür.',
    },
  };

  // ================================================================== 4. CANLI AKIŞ
  function flowSteps(p) {
    const L = BR.LABELS[p.label];
    const P = BR.PRINTERS[p.printer];
    const rows = BR.rows(p.label);
    const lines = BR.lines(p.label, p.printer);
    const seq = BR.seqSpec(p);
    const g = BR.G[L.g];
    const M = 'Main.java';
    const PF = P.cls + '.java';
    const fMain = { t: 'Main.main()', cls: 'Main' };
    const fYaz = { t: L.cls + '.yazdir()', cls: L.cls };
    const fAdres = { t: 'Etiket.adresVeBarkod()', cls: 'Etiket' };
    const base = { label: p.label, printer: p.printer, bridge: true, calling: true };
    const other = BR.presets[BR.presetOrder.find((k) => k !== p.key)];
    const steps = [];

    steps.push({
      t: `Gerçekleştirici: new ${P.cls}()`,
      x: `Önce **cihaz** oluşuyor: [[${P.cls}]], ${P.where} için ${P.dialect} konuşan yazıcı. Değişkenin tipi **Yazici** (arayüz): soyutlama tarafı bu cihazı yalnızca **ilkel işlemleriyle** tanıyacak.`,
      code: [M, `Yazici yazici = new ${P.cls}();`], stack: [fMain], out: 0, seq: 0, d: 4600,
      uml: { classes: [P.cls, 'Yazici'], edges: ['r-' + p.printer] },
      stage: { printer: p.printer, banner: { text: `Gerçekleştirici hazır: **${P.cls}** (${P.dialect})` } },
    });
    steps.push({
      t: `Soyutlama: new ${L.cls}(yazici)`,
      x: `[[${L.cls}]] kurucusunda yazıcıyı alıp [[Etiket]]’in \`yazici\` alanına koyuyor. **Köprü kuruldu**: etiket bundan sonra her ilkel işi bu alan üzerinden yaptıracak.`,
      code: [M, `Etiket etiket = new ${L.cls}(yazici);`], stack: [fMain], out: 0, seq: 1, d: 5200,
      uml: { classes: [L.cls, 'Etiket'], edges: ['kopru'] },
      stage: { label: p.label, printer: p.printer, bridge: true, banner: { text: `Köprü kuruldu: \`etiket.yazici\` → **${P.cls}**` } },
    });
    steps.push({
      t: `etiket.yazdir(${L.g})`,
      x: `Main yalnızca \`yazdir\` diyor; etiketin hangi cihazda basılacağını **bilmiyor**. Gönderi verisi (${g.takipNo}, ${g.alici}) etikete geçti.`,
      code: [M, `etiket.yazdir(${L.g});`], stack: [fMain, fYaz], out: 0, seq: 2, d: 4400,
      uml: { members: [['Etiket', 'yazdir']] },
      stage: Object.assign({}, base, { row: -1 }),
    });

    let n = 0;
    const said = {};
    rows.forEach((r, i) => {
      if (r.hl) {
        steps.push({
          t: `Üst düzey işlem: ${r.call}`,
          x: `[[Etiket]]’in kendi yardımcı metodu: \`adresVeBarkod\` iki **ilkel** çağrıdan oluşur. Bu kod **bir kez** yazıldı; her etiket türü ve her yazıcı onu paylaşır.`,
          code: BR.srcOf(p.label, r), stack: [fMain, fYaz, fAdres], out: n, seq: seq.rowMsg[i], d: 4600,
          uml: { members: [['Etiket', 'adres']] },
          stage: Object.assign({}, base, { row: i, n }),
        });
        return;
      }
      n++;
      const call = BR.callText(r);
      const cmd = lines[n - 1].replace(/^\[[^\]]+\] /, '');
      const first = !said[r.p];
      said[r.p] = true;
      const last = r.p === 'bitir';
      steps.push({
        t: `${call} → ${P.name}`,
        x: `${r.sub ? '`adresVeBarkod` içinden: ' : ''}\`${call}\` köprüden geçti; [[${P.cls}]] kendi diline çevirdi: \`${cmd}\`. ${first ? SAY[p.printer][r.p] : 'Aynı ilkel işlem, aynı çeviri.'}`,
        code: BR.srcOf(p.label, r), dev: [PF, `public void ${r.p}(`], stack: [fMain, fYaz].concat(r.sub ? [fAdres] : [], [{ t: P.cls + '.' + r.p + '()', cls: P.cls }]), out: n, seq: seq.rowMsg[i], d: last ? 5000 : 4400,
        uml: { members: [[P.cls, 'impl'], ['Yazici', r.p]], edges: ['kopru'] },
        stage: Object.assign({}, base, { row: i, n, token: call, finished: last }),
      });
    });

    const total = lines.length;
    steps.push({
      t: `Basıldı: ${total} komut`,
      x: `Etiket ${total} ilkel çağrı yaptı; [[${P.cls}]] her birini ${P.dialect} diline çevirdi. Konsoldaki her satır **cihazdan** çıktı; etiket sınıfında tek bir ${P.dialect} komutu yok.`,
      code: [M, `etiket.yazdir(${L.g});`], stack: [fMain], out: total, seq: seq.messages.length - 1, d: 5200,
      uml: { classes: ['Main', 'Etiket'], edges: ['uses'] },
      stage: Object.assign({}, base, { calling: false, n: total, finished: true, banner: { text: `✓ ${L.name} etiketi ${P.name} ile basıldı: **${total} komut**`, tone: 'ok' } }),
    });
    steps.push({
      t: 'Sonuç: ne ve nasıl ayrıldı',
      x: `**Ne** basılacağını etiket (soyutlama), **nasıl** basılacağını yazıcı (gerçekleştirici) biliyor; aralarındaki tek bağ \`yazici\` alanı. Üstten **${other.title}** tarifini seçip iki tarafın da değiştiğini izleyin.`,
      code: ['Etiket.java', 'protected Yazici yazici;'], stack: [fMain], out: total, seq: seq.messages.length - 1, d: 6400,
      uml: { classes: ['Etiket', 'Yazici'], edges: ['kopru'] },
      stage: Object.assign({}, base, { calling: false, n: total, finished: true, banner: { text: 'Soyutlama **ne**, gerçekleştirici **nasıl**: aradaki köprü tek bir alan.', tone: 'ok' } }),
    });
    return steps;
  }

  BR.scenes.flow = function (root, ctx) {
    const S = ctx.state;
    let p = BR.presets[S.preset] || BR.presets.kirilacakZebra;
    const el = h('div', { class: 'scene scene-flow' });
    const toolbar = h('div', { class: 'scene-toolbar' });
    const body = h('div', { class: 'flow-body' + (S.showCode === false ? ' hide-code' : '') });
    el.append(toolbar, body);
    root.appendChild(el);

    const presetSeg = kit.seg(
      BR.presetOrder.map((k) => ({ v: k, label: BR.presets[k].title, title: `new ${BR.LABELS[BR.presets[k].label].cls}(new ${BR.PRINTERS[BR.presets[k].printer].cls}())` })),
      p.key,
      (k) => setPreset(k),
      { label: 'Eşleşme' }
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
      h('span', { class: 'tb-label' }, 'Eşleşme:'),
      presetSeg.el,
      h('span', { class: 'tb-hint br-key', html: '<span class="br-key-a">soyutlama</span> ⟷ <span class="br-key-i">gerçekleştirici</span>' }),
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
    const consoleEl = h('div', { class: 'console br-flow-console', 'aria-live': 'polite' });
    codeCol.append(stackEl, cvPanel, consoleEl);
    body.append(viewPanel, codeCol);

    const stage = new BR.Bridge(views.stage);
    const cv = new DP.CodeView(cvPanel, { roleOf: BR.roleOf, special: BR.special });
    let uml = null;
    let seq = null;
    let steps = [];

    function load() {
      steps = flowSteps(p);
      cv.setFiles(BR.akisFiles(p), { active: 'Main.java', keepActive: false });
      views.seq.innerHTML = '';
      seq = new DP.SequenceDiagram(views.seq, BR.seqSpec(p), { roles: BR.roles });
      const spec = BR.gofDiagram({ notes: true });
      if (uml) uml.update(spec, { animate: false });
      else uml = new DP.ClassDiagram(views.uml, spec, { roles: BR.roles, roleTags: true });
    }

    function setPreset(k) {
      if (BR.presets[k] === p) return;
      p = BR.presets[k];
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
      cv.clear();
      for (let j = 0; j < i; j++) cv.mark(steps[j].code[0], steps[j].code[1], 'trail', { show: false, scroll: false });
      if (s.dev) cv.mark(s.dev[0], s.dev[1], 'focus', { show: false, scroll: false });
      cv.mark(s.code[0], s.code[1], 'active', { flash: !!ps && ps.code[0] !== s.code[0] });
      renderStack(stackEl, s.stack);
      BR.renderConsole(
        consoleEl,
        '$ java Main',
        BR.akisOutput(p)
          .slice(0, s.out)
          .map((t) => ({ t })),
        { animateFrom: info.animate && ps && s.out > ps.out ? ps.out : null, cursor: i < steps.length - 2 }
      );
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
      delayOf: (i) => (steps[i] && steps[i].d) || 4400,
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

  // ================================================================== 5. EŞLEŞTİRME TEZGÂHI
  BR.scenes.counter = function (root, ctx) {
    const S = ctx.state;
    S.tz = S.tz || { label: 'kirilacak', printer: 'pdf' };
    const unlocked = !!S.htmlUnlocked;
    const PR = unlocked ? BR.printerOrder : BR.printerOrder.filter((k) => k !== 'html');
    /** Kalıtımla bu eşleşmeye gereken sınıfın adı */
    const naiveFor = (lk, pk) => BR.PRINTERS[pk].prefix + BR.LABELS[lk].naive + BR.LABELS[lk].suffix;
    const el = h('div', { class: 'scene scene-split br-tz' });
    const body = h('div', { class: 'scene-body cols-tz' });
    const left = kit.panel('Eşleştirme tezgâhı', { cls: 'panel-code br-left br-tz-left' });
    const right = kit.panel('Köprü <span class="panel-sub">· sol: ne basılacak · sağ: nasıl basılacak</span>', { cls: 'panel-side br-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    // ---- matris: satır = etiket türü (soyutlama), sütun = yazıcı (gerçekleştirici); hücre = çalışma anında birleşme
    const grid = h('div', { class: 'br-grid' });
    const cells = {};
    const cols = BR.printerOrder;
    grid.style.setProperty('--cols', String(cols.length));
    grid.appendChild(h('div', { class: 'br-gh is-corner', html: '<span>etiket ↓ · yazıcı →</span>' }));
    cols.forEach((pk) => {
      const P = BR.PRINTERS[pk];
      const locked = pk === 'html' && !unlocked;
      grid.appendChild(h('div', { class: 'br-gh is-col' + (locked ? ' is-locked' : ''), html: `<b class="is-long">${esc(P.cls)}</b><b class="is-short">${esc(P.name)}</b><span>${locked ? '🔒 Genişlet’te' : esc(P.dialect)}</span>` }));
    });
    BR.labelOrder.forEach((lk) => {
      const L = BR.LABELS[lk];
      grid.appendChild(h('div', { class: 'br-gh is-row rc rc-' + (lk === 'standart' ? 2 : 3), html: `<b class="is-long">${esc(L.cls)}</b><b class="is-short">${esc(L.name)}</b>` }));
      cols.forEach((pk) => {
        const locked = pk === 'html' && !unlocked;
        const b = h('button', {
          class: 'br-cell' + (locked ? ' is-locked' : ''),
          type: 'button',
          title: locked ? 'HtmlYazici henüz yazılmadı: önce “Genişlet” sahnesi' : `new ${L.cls}(new ${BR.PRINTERS[pk].cls}()) · kalıtımla: ${naiveFor(lk, pk)}`,
          html: locked ? '🔒' : '<i></i>',
        });
        b.addEventListener('click', () => {
          if (locked) {
            DP.fx.toast('HtmlYazici henüz yazılmadı! “Genişlet” sahnesinde ekleyin.', 2600);
            ctx.flashScene('genislet');
            return;
          }
          choose(lk, pk);
        });
        cells[lk + '.' + pk] = b;
        grid.appendChild(b);
      });
    });
    const m = BR.labelOrder.length;
    const nCols = PR.length;
    const counts = h('div', {
      class: 'br-counts',
      html: `<span class="is-bad">Kalıtımla: <b>${m * nCols}</b> sınıf (${m} × ${nCols})</span><span class="is-ok">Köprüyle: <b>${m + nCols}</b> sınıf (${m} + ${nCols})</span>`,
    });
    const btnRun = h('button', { class: 'btn btn-primary btn-sm br-run', type: 'button', title: 'yazdir() çağrısını köprü üzerinden izle' }, '▶ Yazdır');
    btnRun.addEventListener('click', () => runPrint());
    const controls = h('div', { class: 'br-tz-controls' }, grid, h('div', { class: 'br-tz-row' }, counts, h('span', { class: 'tb-spacer' }), btnRun));
    const cvHost = h('div', { class: 'br-cv' });
    const consoleEl = h('div', { class: 'console br-console' });
    left.body.append(controls, cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: BR.roleOf, special: BR.special });

    // ---- sağ: köprü sahnesi + açıklama
    const viewHost = h('div', { class: 'br-view' });
    const extra = h('div', { class: 'br-extra' });
    right.body.append(viewHost, extra);
    const stage = new BR.Bridge(viewHost, { cls: 'is-tezgah' });

    const FREE = 3;
    const STEPS = [
      {
        t: 'Aynı etiket, başka yazıcı',
        x: 'Canlı Akış’taki kırılacak etiket, bu kez kuryenin **termal** yazıcısında. Sol taraf (soyutlama) **hiç değişmedi**; yalnızca köprünün öbür ucundaki cihaz değişti. Termal yazıcı konum bilmez, çerçeve yerine çizgi basar.',
        cfg: { label: 'kirilacak', printer: 'termal' },
      },
      {
        t: 'Aynı yazıcı, başka etiket',
        x: 'Şimdi sağ taraf sabit, sol taraf değişti: **İade etiketi** aynı termal yazıcıda. Kalıtımla bu iki eşleşme için iki ayrı sınıf (`TermalKirilacakEtiket`, `TermalIadeEtiketi`) gerekirdi; burada ikisi de **çalışma anında** kuruldu.',
        cfg: { label: 'iade', printer: 'termal' },
      },
      {
        t: 'Çalışma anında: kâğıt bitti',
        x: 'Etiket Zebra’ya bağlıydı ama depodaki Zebra’nın **kâğıdı bitti**. Aynı etiket nesnesi köprüsünü yeniden bağlıyor: `etiket.yaziciDegistir(new PdfYazici())`. Kalıtımla bu imkânsızdı: nesnenin sınıfı (ve yazıcısı) bir kez seçilir.',
        cfg: { label: 'kirilacak', printer: 'zebra', switchTo: 'pdf' },
      },
      {
        t: 'Serbest: bir hücre seçin',
        x: unlocked
          ? 'Matristen istediğiniz hücreyi seçin: her hücre bir eşleşme, ama hiçbiri için **sınıf yok**; nesneler çalışma anında birleşiyor. **HtmlYazici** de artık tezgâhta!'
          : 'Matristen istediğiniz hücreyi seçin: her hücre bir eşleşme, ama hiçbiri için **sınıf yok**; nesneler çalışma anında birleşiyor. (🔒 HTML sütunu **Genişlet** sahnesinde açılır.)',
        free: true,
      },
    ];

    let cur = null; // {label, printer, switchTo}
    let timers = [];
    let last = null; // sahnede son çizilen durum

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

    function choose(lk, pk) {
      S.tz = { label: lk, printer: pk };
      if (!STEPS[stepper.index].free) stepper.go(FREE, { animate: true });
      else {
        draw(S.tz, true);
        renderExtra(FREE, false);
        runPrint();
      }
    }

    function finalPrinter(c) {
      return c.switchTo || c.printer;
    }

    function draw(cfg, animate) {
      stop();
      cur = Object.assign({}, cfg);
      const fp = finalPrinter(cur);
      Object.keys(cells).forEach((k) => cells[k].classList.toggle('is-on', k === cur.label + '.' + fp));
      cv.setFiles([{ name: 'Main.java', code: BR.tezgahMain(cur.label, cur.printer, cur.switchTo) }], { active: 'Main.java', keepActive: false });
      cv.mark('Main.java', cur.switchTo ? 'etiket.yaziciDegistir(' : 'Etiket etiket = new', 'focus', { smooth: false });
      BR.renderConsole(consoleEl, '$ javac *.java && java Main', BR.lines(cur.label, fp).map((t) => ({ t })), { animateFrom: animate ? 0 : null });
      const n = BR.prims(cur.label).length;
      show({ label: cur.label, printer: fp, bridge: true, n, finished: true }, animate);
    }

    /** yazdir() çağrısını köprü üzerinden oynatır; switchTo varsa önce yazıcı değişir */
    function runPrint() {
      stop();
      const c = cur;
      const rows = BR.rows(c.label);
      let t = 0;
      btnRun.classList.add('is-running');
      if (c.switchTo) {
        show({ label: c.label, printer: c.printer, bridge: true, banner: { text: `**${BR.PRINTERS[c.printer].name}**’da kâğıt bitti…`, tone: 'bad' } }, false);
        at(1100, () => show({ label: c.label, printer: c.switchTo, bridge: true, banner: { text: `\`etiket.yaziciDegistir(new ${BR.PRINTERS[c.switchTo].cls}())\`: köprü yeniden bağlandı` } }, true));
        t = 2400;
      }
      const fp = finalPrinter(c);
      at(t, () => show({ label: c.label, printer: fp, bridge: true, calling: true, row: -1, n: 0 }, true));
      t += 600;
      let n = 0;
      rows.forEach((r, i) => {
        if (r.p) n++;
        const nn = n;
        at(t, () => show({ label: c.label, printer: fp, bridge: true, calling: true, row: i, n: nn, token: r.p ? BR.callText(r) : null, finished: r.p === 'bitir' }, true));
        t += r.p ? 760 : 520;
      });
      at(t + 300, () => {
        show({ label: c.label, printer: fp, bridge: true, n, finished: true, banner: { text: `✓ \`new ${BR.LABELS[c.label].cls}(…)\` → **${BR.PRINTERS[fp].name}**: ${n} komut`, tone: 'ok' } }, false);
        BR.renderConsole(consoleEl, '$ javac *.java && java Main', BR.lines(c.label, fp).map((x) => ({ t: x })), { animateFrom: 0 });
        btnRun.classList.remove('is-running');
      });
    }

    function renderExtra(i, animate) {
      const s = STEPS[i];
      if (i === 0) {
        extra.innerHTML = `<div class="sg-aside">${md('💬 **Soyutlama sabit:** `KirilacakEtiket` sınıfında tek satır değişmedi. Termal yazıcı `cerceve` ve konumları kendi bildiği gibi karşıladı.')}</div>`;
      } else if (i === 1) {
        extra.innerHTML = `<div class="sg-aside">${md('💬 **Gerçekleştirici sabit:** aynı `TermalYazici` bu kez başka bir etiketin ilkel çağrılarını çevirdi. Yazıcı, hangi etiketi bastığını bilmez.')}</div>`;
      } else if (i === 2) {
        extra.innerHTML = `<table class="cmp br-cmp">
          <thead><tr><th></th><th>Kalıtımla</th><th>Köprüyle</th></tr></thead>
          <tbody>
            <tr><td>Yazıcı ne zaman seçilir?</td><td class="bad">Derleme anında (sınıf adında)</td><td class="ok">Çalışma anında (alanda)</td></tr>
            <tr><td>Kâğıt bitince</td><td class="bad">Yeni bir nesne, başka bir sınıf</td><td class="ok"><code>yaziciDegistir(…)</code></td></tr>
          </tbody>
        </table>`;
      } else if (s.free) {
        extra.innerHTML = `<div class="br-oneline"><span class="tb-label">Kalıtımla bu hücre:</span><code>${esc(naiveFor(cur.label, finalPrinter(cur)))}</code><span class="tb-label">· köprüyle:</span><code>new ${esc(BR.LABELS[cur.label].cls)}(new ${esc(BR.PRINTERS[finalPrinter(cur)].cls)}())</code></div>`;
      }
      if (animate && !s.free) DP.flash(extra, 'is-pop');
    }

    const foot = ui.foot(el);
    let stepper = null;
    stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: (i) => (STEPS[i].free ? 6000 : i === 2 ? 11000 : 9000),
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        el.classList.toggle('is-free', !!s.free);
        draw(s.free ? S.tz : s.cfg, info.animate);
        renderExtra(i, info.animate);
        // rehberli adıma (ya da hücre seçimiyle serbest kipe) ilerleyince yazdırma bir kez oynasın
        if (info.animate) at(900, runPrint);
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
