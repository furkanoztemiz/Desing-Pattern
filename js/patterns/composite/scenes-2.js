/*
 * Composite — sahneler (2/3): CANLI AKIŞ ve PAKETLEME TEZGÂHI
 *   Canlı Akış: siparis.agirlik() çağrısı kolilerin içine iner, cevaplar yukarı toplanır (son sıra);
 *               siparis.listele("") önce kendini yazar, sonra içindekileri bir kat içeriden (ön sıra).
 *               Çağrı yığınında aynı metodun (Koli.agirlik) birden çok çerçevesi: özyineleme.
 *   Tezgâh   : koliye eşya, koliye koli konur; Koli ve Urun sınıfları hiç değişmez, yalnızca Main.
 *               Ürünün içine eşya koymaya kalkınca: güvenli tasarımda derleme hatası, şeffaf tasarımda istisna.
 */
(function () {
  'use strict';
  const CP = DP.cp;
  const { h } = DP;
  const kit = DP.kit;
  const ui = CP.ui;
  const md = CP.md;
  const esc = DP.esc;

  /** Çağrı yığını: özyinelemede aynı metodun birden çok çerçevesi görünsün diye hepsi yazılır */
  function renderStack(stackEl, frames) {
    stackEl.innerHTML = '<span class="cs-label">Çağrı yığını</span>';
    frames.forEach((fr, i) => {
      if (i) stackEl.appendChild(h('span', { class: 'cs-sep' }, '›'));
      const r = CP.roleOf(fr.cls);
      stackEl.appendChild(h('span', { class: 'cs-frame' + (r ? ' rc rc-' + r : '') + (i === frames.length - 1 ? ' is-top' : ''), title: fr.cls + '.' + fr.m + '()' }, fr.t));
    });
    if (frames.length > 2) stackEl.appendChild(h('span', { class: 'cs-depth' }, `${frames.length - 1} çerçeve`));
  }

  const dots = (n) => '"' + '·'.repeat(n) + '"';

  // ================================================================== 4. CANLI AKIŞ
  function flowSteps(p) {
    const tree = CP.TREE;
    const seq = CP.seqSpec(p);
    const msgOf = seq.msgOf;
    const op = p.op;
    const M = 'Main.java';
    const KF = 'Koli.java';
    const UF = 'Urun.java';
    const fMain = { t: 'Main.main()', cls: 'Main', m: 'main' };
    const frame = (n) => ({ t: `${CP.objName(n.id)}.${op}()`, cls: n.c ? 'Koli' : 'Urun', m: op });
    const steps = [];
    const sums = {};
    const done = {};
    const open = {};
    const printed = {};
    let out = 0;
    const lines = CP.akisOutput(p);
    const snap = (extra) =>
      Object.assign(
        { roots: [tree], client: 'Main', weights: false, sums: Object.assign({}, sums), done: Object.assign({}, done), open: Object.assign({}, open), printed: Object.assign({}, printed) },
        extra || {}
      );
    const nKoli = CP.flatten(tree).filter((f) => f.n.c).length;
    const nUrun = CP.flatten(tree).length - nKoli;

    steps.push({
      t: 'Ağaç kuruldu',
      x: `${nKoli} koli, ${nUrun} ürün: \`ekle\` çağrılarıyla koliler birbirinin içine kondu. Her koli içindekileri **tek bir listede** tutuyor: \`List<Parca> icindekiler\`. Şimdi soru: ${op === 'agirlik' ? '**sipariş kaç gram?**' : '**kolide neler var?**'}`,
      code: [M, ['Koli siparis = new Koli', 'saatKutusu.ekle(new Urun']], stack: [fMain], out: 0, seq: -1, d: 4800,
      uml: { classes: ['Main', 'Koli', 'Urun'], edges: ['cocuklar'] },
      stage: snap({ banner: { text: `${nKoli} koli, ${nUrun} ürün. ${op === 'agirlik' ? '**Kaç gram?**' : '**İçinde neler var?**'}` } }),
    });

    let lastWasReturnTo = null;
    let leafCount = 0;
    const visit = (n, parent, frames, depth) => {
      const fr = frames.concat([frame(n)]);
      const v = CP.objName(n.id);
      const resumed = lastWasReturnTo && parent && lastWasReturnTo === parent.id;
      lastWasReturnTo = null;
      const from = parent ? parent.id : '__client';
      if (op === 'agirlik') {
        if (!n.c) {
          const g = CP.ITEMS[n.id].g;
          const pre = Object.assign({}, sums);
          sums[parent.id] += g;
          done[n.id] = true;
          leafCount++;
          const pv = CP.objName(parent.id);
          steps.push({
            t: `${v}.agirlik() → ${g}`,
            x: `${resumed ? `${CP.BOXES[parent.id].ad} döngüsü **kaldığı yerden** devam ediyor. ` : ''}\`p\` bir [[Urun]]: soruyu **kendisi** cevaplıyor, \`return gram;\` → ${g}. ${leafCount === 1 ? 'Yaprak başka kimseye sormaz. ' : ''}\`${pv}\` için ara toplam: ${pre[parent.id]} + ${g} = **${sums[parent.id]}**.`,
            code: [UF, 'return gram;'], dev: [KF, 'toplam += p.agirlik();'], stack: fr, out: 0, seq: msgOf['call:' + n.id], d: resumed ? 5600 : 4400,
            uml: { members: [['Urun', 'agirlik']], edges: ['r-urun'] },
            stage: snap({ active: n.id, sumsPre: pre, token: { from, to: n.id, text: 'agirlik()', back: g + ' g' } }),
          });
          return;
        }
        open[n.id] = true;
        sums[n.id] = CP.BOXES[n.id].dara;
        const koliFrames = fr.filter((f) => f.cls === 'Koli').length;
        steps.push({
          t: `${v}.agirlik()`,
          x: !parent
            ? `Main yalnızca \`siparis.agirlik()\` diyor; ağacın kaç kat olduğunu **bilmiyor**. [[Koli]] kendi darasıyla başlıyor: \`toplam = ${sums[n.id]}\`. Sonra içindekileri **tek tek** soracak.`
            : `${resumed ? 'Döngü kaldığı yerden devam ediyor. ' : ''}\`p\` bu kez bir [[Koli]]: **aynı metot** (\`Koli.agirlik()\`) bu kez ${CP.BOXES[n.id].ad.toLowerCase()} için çalışıyor — **özyineleme**. Yığında ${koliFrames} \`Koli.agirlik()\` çerçevesi var; her biri kendi \`toplam\`’ını tutuyor: bu kutu ${sums[n.id]} ile başladı.`,
          code: [KF, 'int toplam = dara;'], dev: parent ? [KF, 'toplam += p.agirlik();'] : [M, 'siparis.agirlik()'], stack: fr, out: 0, seq: msgOf['call:' + n.id], d: parent ? 6000 : 5200,
          uml: parent ? { members: [['Koli', 'agirlik'], ['Koli', 'icindekiler']], edges: ['cocuklar'] } : { members: [['Koli', 'agirlik']], edges: ['uses'] },
          stage: snap({ active: n.id, token: { from, to: n.id, text: 'agirlik()' } }),
        });
        n.c.forEach((c) => visit(c, n, fr, depth + 1));
        delete open[n.id];
        done[n.id] = true;
        const w = CP.weight(n);
        const pre = Object.assign({}, sums);
        if (parent) sums[parent.id] += w;
        else out = 1;
        steps.push({
          t: parent ? `${v} döner: ${w}` : `siparis döner: ${w} g`,
          x: parent
            ? `${CP.BOXES[n.id].ad} bitti: \`return toplam;\` → **${w}**. Çerçeve yığından çıktı; cevap bir üst kata, \`${CP.objName(parent.id)}\`’ın döngüsüne döndü: ${pre[parent.id]} + ${w} = **${sums[parent.id]}**.`
            : `Sipariş kolisi bitti: **${w} g**. Saat kutusu da sayıldı. Main yalnızca bir kez sordu; gerisini koliler **kendi aralarında** halletti.`,
          code: parent ? [KF, 'return toplam;'] : [M, 'siparis.agirlik()'], dev: parent ? [KF, 'toplam += p.agirlik();'] : [KF, 'return toplam;'], stack: frames.length ? frames : [fMain], out, seq: msgOf['ret:' + n.id], d: 5400,
          uml: { members: [['Koli', 'agirlik']], edges: parent ? ['cocuklar'] : ['uses'] },
          stage: snap({ active: parent ? parent.id : null, sumsPre: pre, token: { from: n.id, to: parent ? parent.id : '__client', text: w + ' g', up: true }, banner: parent ? null : { text: `✓ \`siparis.agirlik()\` → **${w} g**`, tone: 'ok' } }),
        });
        lastWasReturnTo = parent ? parent.id : null;
        return;
      }
      // ---- listele: önce kendini yaz, sonra içindekileri bir kat içeriden
      out++;
      printed[n.id] = true;
      done[n.id] = true;
      if (n.c) sums[n.id] = CP.weight(n);
      const gir = 3 * depth;
      const line = lines[out - 1];
      const call = `${v}.listele(${dots(gir)})`;
      steps.push({
        t: call,
        x: !parent
          ? `Main \`siparis.listele("")\` diyor. [[Koli]] **önce kendi satırını** yazıyor; ağırlığı için içinde \`agirlik()\` çağırıyor (Ağırlık tarifindeki özyineleme) → ${CP.weight(n)} g. Sonra içindekilere **3 boşluk daha** girintiyle soracak.`
          : n.c
          ? `${resumed ? 'Döngü kaldığı yerden devam ediyor. ' : ''}Yine [[Koli]]: önce kendi satırı (girinti ${gir} boşluk), sonra içindekiler **${gir + 3} boşlukla**. Girinti bir parametre: her kat bir öncekine 3 boşluk ekleyip aşağı iletiyor.`
          : `${resumed ? 'İç koliler bitti; döngü **kaldığı yerden** devam ediyor. ' : ''}[[Urun]] tek satırını yazıyor: girinti ${gir} boşluk, çünkü ${depth}. katta.`,
        code: n.c ? [KF, 'System.out.println(girinti + "+ "'] : [UF, 'System.out.println(girinti + "- "'], dev: parent ? [KF, 'p.listele(girinti + "   ");'] : [M, 'siparis.listele("");'], stack: fr, out, seq: msgOf['call:' + n.id], d: 4800,
        uml: n.c ? { members: [['Koli', 'listele'], ['Koli', 'icindekiler']], edges: parent ? ['cocuklar'] : ['uses'] } : { members: [['Urun', 'listele']], edges: ['r-urun'] },
        stage: snap({ active: n.id, girinti: { id: n.id, n: gir }, token: { from, to: n.id, text: `listele(${dots(gir)})` } }),
        line,
      });
      if (n.c) {
        open[n.id] = true;
        n.c.forEach((c) => visit(c, n, fr, depth + 1));
        delete open[n.id];
        lastWasReturnTo = parent ? parent.id : null;
      }
    };
    visit(tree, null, [fMain], 0);

    const all = CP.flatten(tree).length;
    if (op === 'agirlik') {
      steps.push({
        t: 'Sonuç: soru iner, cevap çıkar',
        x: `${all} parçaya ${all} \`agirlik()\` çağrısı; en derinde yığında **${2 + CP.depthOf(tree)} çerçeve** vardı. Ürün soruyu kendisi cevapladı, koli içindekilere sordu. Hiçbir yerde “ürün mü, koli mi?” sorusu yok. Üstten **Manifesto** tarifini seçip aynı ağacın öbür gezintisini izleyin.`,
        code: [KF, 'toplam += p.agirlik();'], stack: [fMain], out: 1, seq: seq.spec.messages.length - 1, d: 6400,
        uml: { classes: ['Koli', 'Parca'], edges: ['cocuklar', 'r-koli'] },
        stage: snap({ banner: { text: 'Son sıra: önce **içindekiler**, sonra toplam.', tone: 'ok' } }),
      });
    } else {
      steps.push({
        t: 'Sonuç: önce kendisi, sonra içindekiler',
        x: '**Ön sıra:** her parça önce kendi satırını yazdı, sonra içindekilere sordu; girinti her katta 3 boşluk büyüdü. Ağırlıkta tersiydi (**son sıra**): önce içindekiler, sonra toplam. İki gezinti, aynı yapı: hiçbir yerde `if` yok.',
        code: [KF, 'p.listele(girinti + "   ");'], stack: [fMain], out: lines.length, seq: seq.spec.messages.length - 1, d: 6400,
        uml: { classes: ['Koli', 'Parca'], edges: ['cocuklar', 'r-koli'] },
        stage: snap({ weights: false, banner: { text: 'Ön sıra: önce **kendisi**, sonra içindekiler.', tone: 'ok' } }),
      });
    }
    return { steps, seq };
  }

  CP.scenes.flow = function (root, ctx) {
    const S = ctx.state;
    let p = CP.presets[S.preset] || CP.presets.agirlik;
    const el = h('div', { class: 'scene scene-flow' });
    const toolbar = h('div', { class: 'scene-toolbar' });
    const body = h('div', { class: 'flow-body' + (S.showCode === false ? ' hide-code' : '') });
    el.append(toolbar, body);
    root.appendChild(el);

    const presetSeg = kit.seg(
      CP.presetOrder.map((k) => ({ v: k, label: CP.presets[k].title, title: k === 'agirlik' ? 'siparis.agirlik(): önce içindekiler, sonra toplam' : 'siparis.listele(""): önce kendisi, sonra içindekiler' })),
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
      h('span', { class: 'tb-hint cp-key', html: '<span class="cp-key-c">koli</span> içindekilere sorar · <span class="cp-key-l">ürün</span> kendisi cevaplar' }),
      h('span', { class: 'tb-spacer' }),
      viewSeg.el,
      codeBtn
    );

    const viewPanel = h('section', { class: 'panel flow-view' });
    const views = { stage: h('div', { class: 'fv fv-stage' }), seq: h('div', { class: 'fv fv-seq' }), uml: h('div', { class: 'fv fv-uml' }) };
    Object.values(views).forEach((x) => viewPanel.appendChild(x));
    const codeCol = h('div', { class: 'flow-code' });
    const stackEl = h('div', { class: 'callstack cp-stack', 'aria-label': 'Çağrı yığını' });
    const cvPanel = h('section', { class: 'panel flow-cv' });
    const consoleEl = h('div', { class: 'console cp-flow-console', 'aria-live': 'polite' });
    codeCol.append(stackEl, cvPanel, consoleEl);
    body.append(viewPanel, codeCol);

    const stage = new CP.Boxes(views.stage, { minH: 560 });
    const cv = new DP.CodeView(cvPanel, { roleOf: CP.roleOf, special: CP.special });
    let uml = null;
    let seq = null;
    let steps = [];

    function load() {
      const r = flowSteps(p);
      steps = r.steps;
      cv.setFiles(CP.akisFiles(p), { active: 'Main.java', keepActive: false });
      views.seq.innerHTML = '';
      seq = new DP.SequenceDiagram(views.seq, r.seq.spec, { roles: CP.roles });
      const spec = CP.gofDiagram({ notes: true });
      if (uml) uml.update(spec, { animate: false });
      else uml = new DP.ClassDiagram(views.uml, spec, { roles: CP.roles, roleTags: true });
    }

    function setPreset(k) {
      if (CP.presets[k] === p) return;
      p = CP.presets[k];
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
      CP.renderConsole(
        consoleEl,
        '$ java Main',
        CP.akisOutput(p)
          .slice(0, s.out)
          .map((t) => ({ t })),
        { animateFrom: info.animate && ps && s.out > ps.out ? ps.out : null, cursor: i < steps.length - 1 && s.out < CP.akisOutput(p).length }
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

  // ================================================================== 5. PAKETLEME TEZGÂHI
  CP.scenes.counter = function (root, ctx) {
    const S = ctx.state;
    S.tz = S.tz || { tree: CP.clone(CP.TEZGAH_DAL), mode: 'guvenli', target: 'siparis' };
    const unlocked = !!S.paletUnlocked;
    const el = h('div', { class: 'scene scene-split cp-tz' });
    const body = h('div', { class: 'scene-body cols-tz' });
    const left = kit.panel('Paketleme tezgâhı', { cls: 'panel-code cp-left cp-tz-left' });
    const right = kit.panel('Koliler <span class="panel-sub">· bir koliye tıklayın, sonra soldan bir eşya seçin</span>', { cls: 'panel-side cp-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    // ---- denetimler
    const targetEl = h('b', { class: 'cp-target' });
    const modeSeg = kit.seg(
      [
        { v: 'guvenli', label: 'Güvenli', title: 'ekle() yalnızca Koli’de' },
        { v: 'seffaf', label: 'Şeffaf', title: 'ekle() Parca’da da var (varsayılan: istisna)' },
      ],
      'guvenli',
      (v) => act((c) => (c.mode = v)),
      { label: 'Tasarım', cls: 'cp-mode' }
    );
    const palette = h('div', { class: 'cp-palette' });
    const stats = h('div', { class: 'cp-stats' });
    const btnReset = h('button', { class: 'btn btn-ghost btn-sm', type: 'button', title: 'Başlangıç ağacına dön' }, '↺ Başa dön');
    const btnPalet = h('button', { class: 'btn btn-ghost btn-sm cp-palet-btn' + (unlocked ? '' : ' is-locked'), type: 'button' });
    const btnRun = h('button', { class: 'btn btn-primary btn-sm cp-run', type: 'button', title: 'agirlik() çağrısını kolilerin içinde izle' }, '▶ Tart');
    btnReset.addEventListener('click', () => act((c) => Object.assign(c, { tree: CP.clone(CP.TREE), target: 'siparis', bad: null })));
    btnPalet.addEventListener('click', () => {
      if (!unlocked) {
        DP.fx.toast('Palet sınıfı henüz yazılmadı! “Genişlet” sahnesinde ekleyin.', 2600);
        ctx.flashScene('genislet');
        return;
      }
      act((c) => {
        c.bad = null;
        if (c.tree.id === 'palet') {
          c.tree = c.tree.c.find((x) => x.id === 'siparis') || CP.clone(CP.TREE);
          c.target = 'siparis';
        } else {
          c.tree = CP.K('palet', [c.tree]);
          c.target = 'palet';
        }
      });
    });
    btnRun.addEventListener('click', () => runWeigh());
    const controls = h(
      'div',
      { class: 'cp-tz-controls' },
      h('div', { class: 'cp-tz-row' }, h('span', { class: 'tb-label' }, 'Hedef:'), targetEl, h('span', { class: 'tb-spacer' }), h('span', { class: 'tb-label' }, 'Tasarım:'), modeSeg.el),
      palette,
      h('div', { class: 'cp-tz-row' }, stats, h('span', { class: 'tb-spacer' }), btnReset, btnPalet, btnRun)
    );
    const cvHost = h('div', { class: 'cp-cv' });
    const consoleEl = h('div', { class: 'console cp-console' });
    left.body.append(controls, cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: CP.roleOf, special: CP.special });

    // ---- sağ: koliler + açıklama
    const viewHost = h('div', { class: 'cp-view' });
    const extra = h('div', { class: 'cp-extra' });
    right.body.append(viewHost, extra);
    const stage = new CP.Boxes(viewHost, {
      cls: 'is-tezgah',
      interactive: true,
      minH: 480,
      onPick: (id) => act((c) => {
        c.target = id;
        c.bad = null;
      }),
      onRemove: (id) => act((c) => {
        const par = CP.parentOf(c.tree, id);
        if (!par) return;
        par.c = par.c.filter((x) => x.id !== id);
        if (!CP.find(c.tree, c.target)) c.target = par.id;
        c.bad = null;
      }),
    });

    const FREE = 3;
    const STEPS = [
      {
        t: 'Yeni bir dal',
        x: 'Müşteri siparişe bir **hediye** ekledi: hediye kutusunda bir kupa ve balonlu poşete sarılmış bir parfüm. Main’e yalnızca `ekle` satırları eklendi; [[Koli]] ve [[Urun]] sınıflarında **tek satır değişmedi**. Özyineleme yeni dala da kendiliğinden iniyor.',
        cfg: { tree: CP.TEZGAH_DAL, mode: 'guvenli', target: 'poset' },
      },
      {
        t: 'Ürünün içine?',
        x: 'Biri laptopun **içine** kitap koymaya kalktı: `laptop.ekle(…)`. Güvenli tasarımda `ekle` yalnızca [[Koli]]’de; `Parca` tipindeki bir değişkende böyle bir metot yok. Hata **derleme anında** yakalanıyor.',
        cfg: { tree: CP.TEZGAH_DAL, mode: 'guvenli', target: 'laptop', bad: CP.TEZGAH_BAD },
      },
      {
        t: 'Şeffaf tasarımda',
        x: 'Şeffaf tasarımda `ekle` [[Parca]]’da da var (GoF’un şeması): ürün varsayılanı devralır ve **istisna** fırlatır. Kod derlendi; hata **çalışma anına** kaldı. Karşılığında istemci her şeyi `Parca` olarak tutabiliyor: bildirimlere bakın.',
        cfg: { tree: CP.TEZGAH_DAL, mode: 'seffaf', target: 'laptop', bad: CP.TEZGAH_BAD },
      },
      {
        t: 'Serbest: kendi kolinizi kurun',
        x: unlocked
          ? 'Bir koliye tıklayıp soldan eşya seçin; kutular da koliye konur. ✕ ile çıkarın, **▶ Tart** ile özyinelemeyi izleyin. **Palete yükle** de artık açık!'
          : 'Bir koliye tıklayıp soldan eşya seçin; kutular da koliye konur. ✕ ile çıkarın, **▶ Tart** ile özyinelemeyi izleyin. (🔒 **Palete yükle**, Genişlet sahnesinde açılır.)',
        free: true,
      },
    ];

    let cur = null; // {tree, mode, target, bad}
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
    const used = (tree) => new Set(CP.flatten(tree).map((f) => f.n.id));
    const opts = (c) => ({ mode: c.mode, action: 'ikisi', bad: c.bad || null });

    /** Kullanıcı eylemi: rehberli adımdaysa serbest kipe geçer (o anki ağaçtan başlar) */
    function act(fn) {
      const base = cur || S.tz;
      const c = { tree: CP.clone(base.tree), mode: base.mode || 'guvenli', target: base.target || base.tree.id, bad: base.bad || null };
      const before = CP.clone(c.tree);
      fn(c);
      if (c.bad && !CP.find(c.tree, c.bad.target)) c.bad = null;
      S.tz = c;
      if (!STEPS[stepper.index].free) stepper.go(FREE, { animate: true });
      else draw(S.tz, true, before);
    }

    /** Palete tıklanınca: hedef koliyse içine konur, ürünse “ürünün içine?” denemesi */
    function addItem(id) {
      act((c) => {
        const tgt = CP.find(c.tree, c.target) || c.tree;
        if (!tgt.c) {
          c.bad = { target: tgt.id, item: id };
          return;
        }
        c.bad = null;
        const node = CP.isBox(id) ? CP.K(id, []) : CP.U(id);
        tgt.c.push(node);
        if (node.c) c.target = id; // yeni kutu hedef olsun: sıradaki eşyalar içine gitsin
      });
    }

    function renderPalette(c) {
      const u = used(c.tree);
      palette.innerHTML = '';
      const add = (id, box) => {
        if (u.has(id)) return;
        const name = box ? CP.BOXES[id].ad : CP.ITEMS[id].ad;
        const b = h('button', {
          class: 'cp-chip-btn rc rc-' + (box ? 3 : 4),
          type: 'button',
          title: box ? `new Koli("${name}", ${CP.BOXES[id].dara})` : `new Urun("${name}", ${CP.ITEMS[id].g})`,
          html: `<svg viewBox="0 0 24 24" aria-hidden="true">${CP.icon(id, 0, 0)}</svg><span>${esc(name)}</span><i>${box ? CP.BOXES[id].dara : CP.ITEMS[id].g} g</i>`,
        });
        b.addEventListener('click', () => addItem(id));
        palette.appendChild(b);
      };
      const freeItems = CP.itemOrder.filter((id) => !u.has(id));
      const freeBoxes = CP.boxOrder.filter((id) => !u.has(id));
      if (freeItems.length) palette.appendChild(h('span', { class: 'tb-label' }, 'Ürünler:'));
      freeItems.forEach((id) => add(id, false));
      if (freeBoxes.length) palette.appendChild(h('span', { class: 'tb-label' + (freeItems.length ? ' cp-pal-sep' : '') }, 'Kutular:'));
      freeBoxes.forEach((id) => add(id, true));
      if (!freeItems.length && !freeBoxes.length) palette.appendChild(h('span', { class: 'hint' }, 'Bütün eşyalar kolide: ✕ ile birini çıkarın.'));
    }

    function draw(cfg, animate, prevTree) {
      stop();
      cur = { tree: CP.clone(cfg.tree), mode: cfg.mode || 'guvenli', target: cfg.target || cfg.tree.id, bad: cfg.bad || null };
      const c = cur;
      modeSeg.set(c.mode);
      const tgt = CP.find(c.tree, c.target) || c.tree;
      targetEl.className = 'cp-target rc rc-' + (tgt.c ? 3 : 4);
      targetEl.textContent = CP.nameOf(tgt.id) + (tgt.c ? '' : ' (ürün!)');
      btnPalet.textContent = c.tree.id === 'palet' ? '⤓ Paletten indir' : unlocked ? '📦 Palete yükle' : '🔒 Palete yükle';
      renderPalette(c);
      const all = CP.flatten(c.tree);
      const nK = all.filter((f) => f.n.c).length;
      stats.innerHTML = `<span><b>${all.length}</b> parça</span><span><b>${nK}</b> koli</span><span><b>${CP.depthOf(c.tree) + 1}</b> kat</span><span class="is-ok"><b>${CP.weight(c.tree)}</b> g</span>`;

      // kod: Main + sınıflar (moda göre); Koli ve Urun hiç değişmez
      const F = CP.tezgahFiles(c.mode, c.tree.id === 'palet');
      const files = [{ name: 'Main.java', code: CP.mainFor(c.tree, opts(c)) }].concat(['Parca', 'Koli', 'Urun', 'Palet'].filter((n) => F[n]).map((n) => ({ name: n + '.java', code: F[n] })));
      // önce konsol (yüksekliği değişir), sonra koddaki işaret
      const res = CP.runFor(c.tree, opts(c));
      CP.renderConsole(consoleEl, res.kind === 'compile' ? '$ javac *.java' : '$ javac *.java && java Main', res.lines, { animateFrom: animate ? 0 : null });
      cv.setFiles(files, { active: 'Main.java', keepActive: false });
      if (c.bad) cv.mark('Main.java', 'ürünün içine?', 'bad', { smooth: false });
      else if (prevTree) {
        // en son eklenen eşyanın satırı
        const had = used(prevTree);
        const fresh = all.map((f) => f.n.id).filter((id) => !had.has(id));
        const lastId = fresh[fresh.length - 1];
        const par = lastId ? CP.parentOf(c.tree, lastId) : null;
        if (lastId && !par) cv.mark('Main.java', (lastId === 'palet' ? 'palet' : CP.objName(lastId)) + '.ekle(', 'focus', { smooth: false }); // yeni kök (palete yükle)
        else if (lastId) {
          const pv = par.id === 'palet' ? 'palet' : CP.objName(par.id);
          const spec = CP.isBox(lastId) ? `${pv}.ekle(${CP.objName(lastId)});` : `${pv}.ekle(new Urun("${CP.ITEMS[lastId].ad}",`;
          cv.mark('Main.java', spec, 'focus', { smooth: false });
        } else cv.mark('Main.java', 'listele("")', 'focus', { smooth: false });
      } else cv.mark('Main.java', c.mode === 'seffaf' ? 'Parca siparis' : 'listele("")', 'focus', { smooth: false });

      show(
        {
          roots: [c.tree],
          target: c.target,
          bad: c.bad,
          banner: c.bad
            ? c.mode === 'seffaf'
              ? { text: '**Çalışma anında** istisna: `UnsupportedOperationException`', tone: 'bad' }
              : { text: '**Derlenmedi:** `Parca` tipinde `ekle` yok', tone: 'bad' }
            : null,
        },
        animate
      );
      renderExtra(stepper ? stepper.index : 0, false);
    }

    /** agirlik() çağrısını ağaçta oynatır: her parçaya iner, cevaplar yukarı toplanır */
    function runWeigh() {
      if (!cur || cur.bad) return;
      stop();
      const tree = cur.tree;
      const sums = {};
      const done = {};
      const open = {};
      let t = 0;
      btnRun.classList.add('is-running');
      const base = () => ({ roots: [tree], target: cur.target, weights: false, sums: Object.assign({}, sums), done: Object.assign({}, done), open: Object.assign({}, open) });
      const visit = (n, parent) => {
        if (!n.c) {
          const pre = Object.assign({}, sums);
          sums[parent.id] += CP.ITEMS[n.id].g;
          done[n.id] = true;
          const st = Object.assign(base(), { active: n.id, sumsPre: pre, token: { from: parent.id, to: n.id, text: 'agirlik()', back: CP.ITEMS[n.id].g + ' g' } });
          at(t, () => show(st, true));
          t += 1700;
          return;
        }
        open[n.id] = true;
        sums[n.id] = n.id === 'palet' ? CP.PALET.dara : CP.BOXES[n.id].dara;
        const st = Object.assign(base(), { active: n.id, token: parent ? { from: parent.id, to: n.id, text: 'agirlik()' } : null });
        at(t, () => show(st, true));
        t += 950;
        n.c.forEach((c) => visit(c, n));
        delete open[n.id];
        done[n.id] = true;
        const pre = Object.assign({}, sums);
        if (parent) sums[parent.id] += CP.weight(n);
        const st2 = Object.assign(base(), { active: parent ? parent.id : null, sumsPre: pre, token: parent ? { from: n.id, to: parent.id, text: CP.weight(n) + ' g', up: true } : null });
        at(t, () => show(st2, true));
        t += parent ? 950 : 600;
      };
      visit(tree, null);
      at(t + 200, () => {
        show({ roots: [tree], target: cur.target, banner: { text: `✓ \`${tree.id === 'palet' ? 'palet' : CP.objName(tree.id)}.agirlik()\` → **${CP.weight(tree)} g** · ${CP.count(tree)} çağrı`, tone: 'ok' } }, false);
        btnRun.classList.remove('is-running');
      });
    }

    function renderExtra(i, animate) {
      // ağaç tam boy görünsün: açıklama yalnızca şeffaf ↔ güvenli karşılaştırmasında
      if (i === 2) {
        extra.innerHTML = `<table class="cmp cp-cmp">
          <thead><tr><th></th><th>Güvenli</th><th>Şeffaf</th></tr></thead>
          <tbody>
            <tr><td><code>ekle</code> nerede?</td><td>Yalnızca <code>Koli</code></td><td><code>Parca</code>’da (varsayılan: istisna)</td></tr>
            <tr><td>Ürünün içine ekleme</td><td class="ok">Derlenmez</td><td class="bad">Çalışma anında istisna</td></tr>
            <tr><td>İstemci</td><td>Koliyi <code>Koli</code> olarak tutar</td><td class="ok">Her şeyi <code>Parca</code> olarak tutar</td></tr>
          </tbody>
        </table>`;
        if (animate) DP.flash(extra, 'is-pop');
      } else extra.innerHTML = '';
    }

    /** Rehberli ilk adım: yeni dal eşya eşya kurulur */
    function growBranch() {
      const order = [
        ['siparis', 'hediye'],
        ['hediye', 'kupa'],
        ['hediye', 'poset'],
        ['poset', 'parfum'],
      ];
      const tree = CP.clone(CP.TREE);
      let prevTree = CP.clone(tree);
      draw({ tree, mode: 'guvenli', target: 'siparis' }, false);
      order.forEach(([par, id], k) =>
        at(700 + k * 900, () => {
          const p2 = CP.find(tree, par);
          p2.c.push(CP.isBox(id) ? CP.K(id, []) : CP.U(id));
          const before = prevTree;
          prevTree = CP.clone(tree);
          const keep = timers;
          timers = [];
          draw({ tree: CP.clone(tree), mode: 'guvenli', target: CP.isBox(id) ? id : par }, true, before);
          timers = keep;
          if (k === order.length - 1) at(800, runWeigh);
        })
      );
    }

    const foot = ui.foot(el);
    let stepper = null;
    stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: (i) => (STEPS[i].free ? 6000 : i === 0 ? 14000 : 9000),
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        el.classList.toggle('is-free', !!s.free);
        if (i === 0 && info.animate) growBranch();
        else draw(s.free ? S.tz : s.cfg, info.animate);
        renderExtra(i, info.animate);
        if (s.free && info.animate && !cur.bad) at(700, runWeigh);
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
