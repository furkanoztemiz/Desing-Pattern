/*
 * Observer — sahneler (2/3): CANLI AKIŞ ve ABONELİK TEZGÂHI
 *   Canlı Akış: ekranlar gönderiye abone olur; durum değişince bildir() listeyi dolaşır, her ekran guncelle(this) ile
 *               uyanır ve yeni durumu gönderiden kendisi okur (pull). İkinci tarif: iki gönderi, tek panel ve
 *               çalışma anında abonelikten çıkma.
 *   Tezgâh   : iki gönderinin durumunu ilerletin, ekranları abone edin ya da çıkarın; aynı oturumu üç tasarımda
 *               karşılaştırın: doğrudan çağrı, sabit liste ve Observer. Üretilen Main.java ve konsol birlikte görünür.
 */
(function () {
  'use strict';
  const OB = DP.obs;
  const { h } = DP;
  const kit = DP.kit;
  const ui = OB.ui;
  const md = OB.md;

  function renderStack(stackEl, frames) {
    stackEl.innerHTML = '<span class="cs-label">Çağrı yığını</span>';
    frames.forEach((fr, i) => {
      if (i) stackEl.appendChild(h('span', { class: 'cs-sep' }, '›'));
      const r = OB.roleOf(fr.cls);
      stackEl.appendChild(h('span', { class: 'cs-frame' + (r ? ' rc rc-' + r : '') + (i === frames.length - 1 ? ' is-top' : '') }, fr.t));
    });
  }

  /** Bir isteğin sahnedeki jetonları: her bildirim tel boyunca gider (istenmeyen kırmızı) */
  OB.jetonlar = function (O, k, o) {
    o = o || {};
    const list = [];
    O.filter((x) => x.i === k && x.e === 'guncelle').forEach((x, j) => list.push({ from: 'g:' + x.g, to: 'o:' + x.o, text: o.metin || 'guncelle', kind: x.istenmeyen ? 'bad' : 'bil', delay: j * (o.ara || 300) }));
    return list;
  };
  /** Bir isteğin tel vurguları: haber alanlar yeşil, kaçıranlar kırmızı */
  OB.telVurgu = function (O, k) {
    const t = [];
    O.filter((x) => x.i === k && (x.e === 'guncelle' || x.e === 'kacan')).forEach((x) => t.push({ g: x.g, o: x.o, kind: x.e === 'kacan' || x.istenmeyen ? 'bad' : 'on' }));
    return t;
  };

  // ================================================================== 4. CANLI AKIŞ
  function flowSteps(p) {
    const seq = OB.seqSpec(p);
    const r = seq.run;
    const prog = p.prog;
    const O = r.olaylar;
    const B = seq.bolumler;
    const MF = 'Main.java';
    const GF = 'Gonderi.java';
    const SINIF_F = (o) => OB.GOZ[o].sinif + '.java';
    const gv = (g) => OB.gDegisken(prog, g);
    const ov = (o) => OB.degisken(prog, o);
    const fMain = { t: 'Main.main()', cls: 'Main' };
    const fG = (g, m) => ({ t: `${gv(g)}.${m}()`, cls: 'Gonderi' });
    const fO = (o) => ({ t: `${ov(o)}.guncelle()`, cls: OB.GOZ[o].sinif });
    const st = (s, x) => OB.stateFrom(prog, s, x);
    const steps = [];
    const son = B.length - 1;
    const iki = prog.gonderiler.length > 1;
    const ilkG = prog.gonderiler[0];
    const satir = (op) => OB.istekSatiri(prog, op);
    /** Ekranın guncelle içindeki iş satırı */
    const isSatiri = (o, d) => {
      if (OB.GOZ[o].tel) return 'System.out.println("  SMS → " + ad + ": " + takipNo + " " + durum);';
      if (o === 'panel') return 'satirlar.put(takipNo, durum);';
      if (o === 'merkez') return 'kayitlar.put(takipNo, durum);';
      return d === 'Dağıtımda' ? 'duraklar.add(takipNo);' : d === OB.TESLIM ? 'duraklar.remove(takipNo);' : 'System.out.println("  Tablet: " + takipNo + " " + durum);';
    };
    const iKur = O.findIndex((o) => o.e === 'kur');
    const aboneler = O.filter((o) => o.e === 'abone');
    const sonAbone = aboneler[aboneler.length - 1];

    // ---- kurulum
    if (!iki) {
      steps.push({
        t: 'Kurulum',
        x: 'Main üç ekranı ve bir [[Gonderi]] yarattı. Gonderi’nin abone listesi **boş**: şu an durum değişse kimse haber almaz. Gonderi’nin kurucusu ekranları istemiyor; yalnızca takip numarasını.',
        code: [MF, `Gonderi ${gv(ilkG)} = new Gonderi("${ilkG}");`], dev: [GF, 'private final List<GonderiGozlemcisi> aboneler = new ArrayList<>();'], stack: [fMain], con: 0, seq: { b: 0, m: B[0].msgOf['yeni:' + ilkG] }, d: 5600,
        uml: { classes: ['Main', 'Gonderi'], edges: ['c-main'], members: [['Gonderi', 'aboneler']] },
        stage: st(O[iKur].s, { banner: { text: 'Abone listesi boş: gönderi henüz kimseye haber vermeyecek.' } }),
      });
      const ilk = prog.ilk[ilkG];
      steps.push({
        t: 'aboneEkle × ' + ilk.length,
        x: `Main ekranları sırayla abone etti. Gonderi onları yalnızca \`GonderiGozlemcisi\` olarak görüyor: telefon mu, tablet mi bilmiyor. Liste sırası, **bildirim sırası** olacak.`,
        code: [MF, [`${gv(ilkG)}.aboneEkle(${ov(ilk[0])});`, `${gv(ilkG)}.aboneEkle(${ov(ilk[ilk.length - 1])});`]], dev: [GF, 'aboneler.add(abone);'], stack: [fMain, fG(ilkG, 'aboneEkle')], con: 0, seq: { b: 0, m: B[0].msgOf['abone:' + ilkG + ':' + ilk[ilk.length - 1]] }, d: 5600,
        uml: { classes: ['Main', 'Gonderi', 'GonderiGozlemcisi'], edges: ['c-main', 'aboneler'], members: [['Gonderi', 'aboneEkle']] },
        stage: st(sonAbone.s, { tokens: ilk.map((o, j) => ({ from: 'o:' + o, to: 'g:' + ilkG, text: 'abone ol', kind: 'abone', delay: j * 300 })), banner: { text: `Abone listesi: **${ilk.map(ov).join(', ')}**` } }),
      });
    } else {
      const L = prog.gonderiler.map((g) => `${g.slice(4)}: ${prog.ilk[g].map(ov).join(', ')}`).join(' · ');
      steps.push({
        t: 'Kurulum: iki gönderi, iki liste',
        x: 'İki gönderi, iki ayrı abone listesi. Ali’nin telefonu KRG-1001’i, Zeynep’in telefonu KRG-1003’ü izliyor; satıcı paneli **ikisine birden** abone. Bir gözlemci birden çok konuyu izleyebilir.',
        code: [MF, [`Gonderi ${gv(prog.gonderiler[0])} = new Gonderi("${prog.gonderiler[0]}");`, `${gv(prog.gonderiler[1])}.aboneEkle(panel);`]], dev: [GF, 'aboneler.add(abone);'], stack: [fMain], con: 0, seq: { b: 0, m: B[0].spec.messages.length - 1 }, d: 6000,
        uml: { classes: ['Main', 'Gonderi', 'GonderiGozlemcisi'], edges: ['c-main', 'aboneler'] },
        stage: st(sonAbone.s, { banner: { text: L } }),
      });
    }

    // ---- istekler
    let ayrintiliYapildi = false;
    prog.ops.forEach((op, k) => {
      const Ok = O.filter((o) => o.i === k);
      const bol = B[k + 1];
      const msg = bol.msgOf;
      const g = op.g;
      if (op.t === 'cik' || op.t === 'ekle') {
        const ev = Ok[Ok.length - 1];
        steps.push({
          t: satir(op).replace(/;$/, ''),
          x:
            op.t === 'cik'
              ? `Ali SMS istemiyor: telefon ${g}’in listesinden çıktı. Gonderi’de **tek satır** değişmedi; değişen yalnızca listenin içeriği.`
              : `${OB.GOZ[op.o].ad} ${g} listesine katıldı. Bundan sonraki değişiklikleri o da alacak.`,
          code: [MF, satir(op)], dev: [GF, op.t === 'cik' ? 'aboneler.remove(abone);' : 'aboneler.add(abone);'], stack: [fMain, fG(g, op.t === 'cik' ? 'aboneCikar' : 'aboneEkle')], con: ev.n, seq: { b: k + 1, m: msg.istek }, d: 5200,
          uml: { classes: ['Main', 'Gonderi'], members: [['Gonderi', op.t === 'cik' ? 'aboneCikar' : 'aboneEkle']] },
          stage: st(ev.s, { ghl: { [g]: true }, tokens: [{ from: 'o:' + op.o, to: 'g:' + g, text: op.t === 'cik' ? 'ayrıl' : 'abone ol', kind: op.t === 'cik' ? 'cik' : 'abone' }], banner: { text: op.t === 'cik' ? `**${ov(op.o)}** listeden çıktı: ${g} artık ona haber vermeyecek` : `**${ov(op.o)}** listeye eklendi` } }),
        });
        return;
      }
      const iDeg = O.indexOf(Ok.find((o) => o.e === 'degis'));
      const iBil = O.indexOf(Ok.find((o) => o.e === 'bildir'));
      const gun = Ok.filter((o) => o.e === 'guncelle');
      const d = O[iDeg].durum;
      const teslim = op.t === 'teslim';
      const yontem = teslim ? 'teslimEt' : 'setDurum';
      const devSatir = teslim ? { find: 'bildir();', nth: 2 } : 'this.durum = durum;';
      const ayrintili = !iki && !ayrintiliYapildi && !teslim;
      if (ayrintili) {
        ayrintiliYapildi = true;
        steps.push({
          t: satir(op).replace(/;$/, ''),
          x: 'Gönderi yola çıktı. Gonderi önce kendi durumunu değiştirdi ve yazdı; **sonra** haber verecek. Durum tutarlı olmadan bildirim yapılmaz.',
          code: [MF, satir(op)], dev: [GF, devSatir], stack: [fMain, fG(g, yontem)], con: O[iDeg].n, seq: { b: k + 1, m: msg.istek }, d: 5200,
          uml: { classes: ['Main', 'Gonderi'], members: [['Gonderi', yontem]] },
          stage: st(O[iDeg].s, { ghl: { [g]: true }, banner: { text: `Durum: **${d}** · şimdi abonelere haber verilecek` } }),
        });
        steps.push({
          t: 'bildir()',
          x: '`bildir()` abone listesini baştan sona dolaşıyor ve her aboneye aynı şeyi söylüyor: `guncelle(this)`. Kendini (`this`) gönderiyor ki abone **hangi gönderinin** değiştiğini bilsin.',
          code: [GF, 'bildir();'], dev: [GF, 'for (GonderiGozlemcisi abone : aboneler) {'], stack: [fMain, fG(g, yontem), fG(g, 'bildir')], con: O[iBil].n, seq: { b: k + 1, m: msg.bildir }, d: 5600,
          uml: { classes: ['Gonderi', 'GonderiGozlemcisi'], edges: ['aboneler'], members: [['Gonderi', 'bildir'], ['GonderiGozlemcisi', 'guncelle']] },
          stage: st(O[iBil].s, { ghl: { [g]: true }, bildir: g }),
        });
        const ACIK = {
          tel: 'Sıradaki abone telefon. Bildirim yalnızca “değiştim” diyor; telefon yeni durumu gönderiden **kendisi okuyor** (`getDurum()`: *pull*) ve SMS’i gönderiyor.',
          panel: 'Panel aynı bildirimi aldı ama **kendi işini** yaptı: gönderinin satırını güncelledi. Gonderi ne SMS’ten ne panelden haberdar; yalnızca listeyi dolaşıyor.',
          tablet: 'Tablet de haber aldı. Gönderi henüz dağıtımda değil, rotaya eklenmedi. Üç abone, üç farklı tepki, **tek** bir bildirim döngüsü.',
        };
        gun.forEach((ev, j) => {
          const o = ev.o;
          steps.push({
            t: `${ov(o)}.guncelle(this)`,
            x: OB.GOZ[o].tel ? ACIK.tel : ACIK[o] || ACIK.tablet,
            code: [SINIF_F(o), OB.GOZ[o].tel ? 'String durum = gonderi.getDurum();' : isSatiri(o, d)], dev: [SINIF_F(o), OB.GOZ[o].tel ? isSatiri(o, d) : 'String durum = gonderi.getDurum();'], stack: [fMain, fG(g, yontem), fG(g, 'bildir'), fO(o)], con: ev.n, seq: { b: k + 1, m: msg['cek:' + o] }, d: 5200,
            uml: { classes: ['GonderiGozlemcisi', OB.GOZ[o].sinif, 'Gonderi'], edges: ['r-' + OB.GOZ[o].sinif, 'cek'], members: [[OB.GOZ[o].sinif, 'guncelle']] },
            stage: st(ev.s, { ghl: { [g]: true }, bildir: g, hl: { [o]: 'on' }, teller: [{ g, o, kind: 'on' }], tokens: [{ from: 'g:' + g, to: 'o:' + o, text: 'guncelle(this)', kind: 'bil' }] }),
          });
        });
        return;
      }
      // kısa: değişiklik ve bütün bildirimler tek adımda
      const sonEv = gun.length ? gun[gun.length - 1] : O[iBil];
      const kimler = gun.map((x) => ov(x.o));
      let x;
      if (teslim)
        x = 'Sürüm 2.0’ın hatası burada olmuştu. Şimdi `teslimEt` de yalnızca `bildir()` diyor: kimin abone olduğunu bilmesine gerek yok, **kimseyi unutamaz**. Tablet gönderiyi rotasından çıkardı.';
      else if (iki && k === 1)
        x = 'Şimdi KRG-1003. Panel aynı `guncelle` yöntemine bir kez daha çağrıldı; **hangi** gönderinin değiştiğini parametreden (`gonderi.getTakipNo()`) anlıyor ve doğru satırı güncelliyor.';
      else if (iki && prog.ops.slice(0, k).some((q) => q.t === 'cik' && q.g === g))
        x = `${g} dağıtımda. Bu kez listede yalnızca ${kimler.join(', ')} var: Ali’ye SMS gitmedi. Zeynep’in telefonu zaten bu gönderiyi izlemiyor.`;
      else if (iki) x = `${g} yola çıktı: ${kimler.join(' ve ')} haber aldı. Zeynep’in telefonu bu gönderinin abonesi değil.`;
      else x = `Aynı döngü bir kez daha: ${kimler.length} abone sırayla haber aldı. Tablet gönderiyi kuryenin **rotasına** ekledi.`;
      const oDev = teslim ? 'tablet' : iki ? 'panel' : 'tablet';
      steps.push({
        t: satir(op).replace(/;$/, ''),
        x,
        code: [MF, satir(op)], dev: teslim ? [GF, devSatir] : [SINIF_F(oDev), iki ? 'String takipNo = gonderi.getTakipNo();' : isSatiri(oDev, d)], stack: [fMain, fG(g, yontem), fG(g, 'bildir')], con: sonEv.n, seq: { b: k + 1, m: bol.spec.messages.length - 2 }, d: 6000,
        uml: { classes: ['Gonderi', 'GonderiGozlemcisi'], edges: ['aboneler'], members: [['Gonderi', 'bildir']] },
        stage: st(sonEv.s, { ghl: { [g]: true }, bildir: g, hl: Object.fromEntries(gun.map((ev) => [ev.o, 'on'])), teller: OB.telVurgu(O, k), tokens: OB.jetonlar(O, k), banner: { text: `**${d}** · haber alan: ${kimler.join(', ') || 'kimse'}` } }),
      });
    });

    // ---- sonuç
    const i = O.length - 1;
    const s = O[i].s;
    steps.push({
      t: 'Sonuç',
      x: iki
        ? 'Panel iki gönderiyi de doğru gösteriyor. Kimin hangi gönderiyi izlediği **çalışma anında** değişti; Gonderi bunun için hiç değişmedi.'
        : 'Bütün ekranlar aynı gerçeği gösteriyor. Gonderi bunu, ekranların hiçbirini tanımadan başardı: elinde yalnızca bir `GonderiGozlemcisi` listesi vardı.',
      code: [MF, iki ? 'System.out.println(panel.ekran());' : 'System.out.println(tablet.rota());'], stack: [fMain], con: O[i].n, seq: { b: son, m: B[son].spec.messages.length - 1 }, d: 6400,
      uml: { classes: ['Gonderi', 'GonderiGozlemcisi', 'AliciTelefonu', 'SaticiPaneli', 'KuryeTableti'], edges: ['aboneler', 'r-AliciTelefonu', 'r-SaticiPaneli', 'r-KuryeTableti'] },
      stage: st(s, { banner: { text: iki ? 'Panel: **' + Object.keys(s.ekran.panel).sort().map((g) => `${g.slice(4)} ${s.ekran.panel[g]}`).join(' · ') + '**' : 'Panel: **Teslim edildi** · rota: **boş** · ekranlar tutarlı', tone: 'ok' } }),
    });
    return { steps, seq, run: r };
  }

  OB.scenes.flow = function (root, ctx) {
    const S = ctx.state;
    let p = OB.presets[S.preset] || OB.presets.gun;
    const el = h('div', { class: 'scene scene-flow' });
    const toolbar = h('div', { class: 'scene-toolbar' });
    const body = h('div', { class: 'flow-body' + (S.showCode === false ? ' hide-code' : '') });
    el.append(toolbar, body);
    root.appendChild(el);

    const presetSeg = kit.seg(
      OB.presetOrder.map((k) => ({ v: k, label: OB.presets[k].title, title: k === 'gun' ? 'Üç abone, üç durum değişikliği' : 'İki gönderi, ortak panel, abonelikten çıkma' })),
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
      h('span', { class: 'tb-hint obs-key', html: '<span class="obs-key-s">konu</span> bildirir · <span class="obs-key-o">gözlemciler</span> güncellenir' }),
      h('span', { class: 'tb-spacer' }),
      viewSeg.el,
      codeBtn
    );

    const viewPanel = h('section', { class: 'panel flow-view' });
    const views = { stage: h('div', { class: 'fv fv-stage' }), seq: h('div', { class: 'fv fv-seq obs-fv-seq' }), uml: h('div', { class: 'fv fv-uml' }) };
    Object.values(views).forEach((x) => viewPanel.appendChild(x));
    const seqHead = h('div', { class: 'obs-seq-head' });
    const seqHost = h('div', { class: 'obs-seq-host' });
    views.seq.append(seqHead, seqHost);
    const codeCol = h('div', { class: 'flow-code' });
    const stackEl = h('div', { class: 'callstack', 'aria-label': 'Çağrı yığını' });
    const cvPanel = h('section', { class: 'panel flow-cv' });
    const consoleEl = h('div', { class: 'console obs-flow-console', 'aria-live': 'polite' });
    codeCol.append(stackEl, cvPanel, consoleEl);
    body.append(viewPanel, codeCol);

    const stage = new OB.TakipSahne(views.stage);
    const cv = new DP.CodeView(cvPanel, { roleOf: OB.roleOf, special: OB.special });
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
      cv.setFiles(OB.akisFiles(p), { active: 'Main.java', keepActive: false });
      const spec = OB.gofDiagram({ notes: true });
      if (uml) uml.update(spec, { animate: false });
      else uml = new DP.ClassDiagram(views.uml, spec, { roles: OB.roles, roleTags: true });
    }

    function showSeq(b, m, animate) {
      const B = flow.seq.bolumler[b];
      if (b !== seqB) {
        seqHost.innerHTML = '';
        seq = new DP.SequenceDiagram(seqHost, B.spec, { roles: OB.roles });
        seqB = b;
        animate = false;
      }
      const n = flow.seq.bolumler.length;
      seqHead.innerHTML = `<b>${DP.esc(B.baslik)}</b><span>${b > 0 && b < n - 1 ? `satır ${b} / ${n - 2}` : ''}</span>`;
      seq.show(m, animate);
    }

    function setPreset(k) {
      if (OB.presets[k] === p) return;
      p = OB.presets[k];
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
      OB.renderConsole(consoleEl, OB.cmd(), run.lines.slice(0, s.con).map((l) => OB.consoleLine(l)), { animateFrom: info.animate && ps && s.con > ps.con ? ps.con : null, cursor: i < steps.length - 1 });
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

  // ================================================================== 5. ABONELİK TEZGÂHI
  const { S: OS, C: OC, E: OE } = OB.op;
  const ANA = OB.TEZGAH_ANA;
  const TASARIM_AD = { dogrudan: 'Doğrudan çağrı', sabit: 'Sabit liste', observer: 'Observer' };
  const EKRAN_KISA = { aliTel: 'Ali (SMS)', zeynepTel: 'Zeynep (SMS)', panel: 'Panel', tablet: 'Tablet', merkez: 'Çağrı merkezi' };

  OB.scenes.counter = function (root, ctx) {
    const S = ctx.state;
    S.tz = S.tz || { design: 'observer', ops: ANA.slice() };
    const unlocked = !!S.merkezUnlocked;
    const el = h('div', { class: 'scene scene-split obs-tz' });
    const body = h('div', { class: 'scene-body cols-tz' });
    const left = kit.panel('Takip masası', { cls: 'panel-code obs-left obs-tz-left' });
    const right = kit.panel('Gönderi takibi <span class="panel-sub">· aynı oturum, üç tasarım</span>', { cls: 'panel-side obs-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    // ---- denetimler
    const designSeg = kit.seg(
      [
        { v: 'dogrudan', label: 'Doğrudan çağrı', title: 'Sürüm 2.0: Gonderi ekranları adıyla çağırır; teslimEt tableti unutur' },
        { v: 'sabit', label: 'Sabit liste', title: 'Abone listesi ve tek bildir(); ama liste kurucuda sabit' },
        { v: 'observer', label: 'Observer', title: 'aboneEkle / aboneCikar: liste çalışma anında değişir' },
      ],
      S.tz.design,
      (v) => act((c) => (c.design = v)),
      { label: 'Tasarım', cls: 'obs-seg' }
    );
    let secili = 'KRG-1001';
    const gRow = h('div', { class: 'obs-tz-gonderiler' });
    const bIlerle = h('button', { class: 'obs-tz-b is-ilerle', type: 'button' }, '');
    const ekranRow = h('div', { class: 'obs-tz-ekranlar' });
    const izLabel = h('span', { class: 'tb-label' }, 'İzleyenler:');
    const opsRow = h('div', { class: 'obs-tz-ops' });
    const btnReset = h('button', { class: 'btn btn-ghost btn-sm', type: 'button', title: 'Oturumu boşalt' }, '↺ Sıfırla');
    const btnRun = h('button', { class: 'btn btn-primary btn-sm obs-run', type: 'button', title: 'Oturumu baştan, istek istek oynat' }, '▶ Oynat');
    bIlerle.addEventListener('click', () => {
      const tz = cur || S.tz;
      const op = OB.ilerle(secili, OB.durumOf(tz.ops)[secili]);
      if (op) ekle(op);
    });
    btnReset.addEventListener('click', () => act((c) => (c.ops = [])));
    btnRun.addEventListener('click', () => oynat());
    const controls = h(
      'div',
      { class: 'obs-tz-controls' },
      h('div', { class: 'obs-tz-row' }, h('span', { class: 'tb-label' }, 'Tasarım:'), designSeg.el, h('span', { class: 'tb-spacer' }), btnReset, btnRun),
      h('div', { class: 'obs-tz-row' }, h('span', { class: 'tb-label' }, 'Gönderi:'), gRow, bIlerle),
      h('div', { class: 'obs-tz-row' }, izLabel, ekranRow),
      h('div', { class: 'obs-tz-row is-ops' }, h('span', { class: 'tb-label' }, 'Oturum:'), opsRow)
    );
    const cvHost = h('div', { class: 'obs-cv' });
    const consoleEl = h('div', { class: 'console obs-console' });
    left.body.append(controls, cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: OB.roleOf, special: OB.special });

    // ---- sağ: sahne + ölçüler
    const viewHost = h('div', { class: 'obs-view' });
    const metrics = h('div', { class: 'obs-metrics' });
    const extra = h('div', { class: 'obs-extra' });
    right.body.append(viewHost, metrics, extra);
    const stage = new OB.TakipSahne(viewHost, { cls: 'is-tezgah' });

    const FREE = 4;
    const STEPS = [
      {
        t: 'Observer: iki gönderi, değişen abonelikler',
        x: 'İki gönderi yola çıktı; Ali SMS’leri kapattı (`aboneCikar`); KRG-1001 dağıtıma çıkıp teslim edildi. Her bildirim yalnızca **o anda abone olanlara** gitti: **0** istenmeyen, **0** kaçan. Gonderi hiçbir ekran sınıfını tanımıyor.',
        tz: { design: 'observer', ops: ANA },
      },
      {
        t: 'Aynı oturum: sabit liste',
        x: 'Abone listesi var ama kurucuda **sabit**: Ali’nin “artık istemiyorum” isteğinin kodda karşılığı yok (Main’deki yorum satırına bakın). Ali iki SMS daha aldı: **2 istenmeyen** bildirim. Tek `bildir()` sayesinde kimse unutulmadı.',
        tz: { design: 'sabit', ops: ANA },
      },
      {
        t: 'Aynı oturum: doğrudan çağrı',
        x: 'Sürüm 2.0: istenmeyen SMS’ler sürüyor, üstelik `teslimEt` tableti unuttu: **1 kaçan** bildirim, kurye rotasında teslim edilmiş bir gönderi. İki sorun, iki kök: sabit liste ve dağınık çağrılar.',
        tz: { design: 'dogrudan', ops: ANA },
      },
      {
        t: 'Ali, Zeynep’in gönderisini de izlesin',
        x: 'Bir gözlemci birden çok konuyu izleyebilir: Ali’nin telefonu KRG-1003’e de abone oldu. Ama o gönderinin **şimdiki** durumunu bilmiyor (geç abone): Observer geçmişi değil, abone olunduktan **sonrasını** bildirir. KRG-1003’ü ilerletip deneyin.',
        tz: { design: 'observer', ops: ANA.concat([OE('KRG-1003', 'aliTel')]) },
      },
      {
        t: 'Serbest: siz deneyin',
        x: unlocked
          ? 'Gönderi seçip durumunu ilerletin; ekranları abone edin ya da çıkarın. Tasarımı değiştirip aynı oturumu karşılaştırın. **Çağrı merkezi** de açık (Genişlet).'
          : 'Gönderi seçip durumunu ilerletin; ekranları abone edin ya da çıkarın. Tasarımı değiştirip aynı oturumu karşılaştırın. (🔒 Çağrı merkezi, Genişlet sahnesinde yazılır.)',
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
      if (!unlocked) c.ops = c.ops.filter((op) => op.o !== 'merkez');
      S.tz = c;
      if (!STEPS[stepper.index].free) stepper.go(FREE, { animate: true });
      else draw(S.tz, true);
    }

    function ekle(op) {
      const tz = cur || S.tz;
      if (!OB.uygun(tz.ops, op, { merkez: unlocked })) {
        DP.fx.toast(tz.ops.length >= OB.ISTEK_EN_COK ? 'En çok ' + OB.ISTEK_EN_COK + ' istek.' : 'Bu istek şu an yapılamaz.', 2200);
        return;
      }
      act((c) => c.ops.push(op));
    }

    const etiket = (op) => {
      if (op.t === 'durum') return `${OB.kisa(op.g)} → ${op.durum}`;
      if (op.t === 'teslim') return `${OB.kisa(op.g)} ✓ teslim`;
      const ad = { aliTel: 'Ali', zeynepTel: 'Zeynep', panel: 'panel', tablet: 'tablet', merkez: 'merkez' }[op.o];
      return `${op.t === 'cik' ? '−' : '+'}${ad} ${OB.kisa(op.g)}`;
    };

    function renderControls(tz) {
      designSeg.set(tz.design);
      const d = OB.durumOf(tz.ops);
      const niyet = OB.niyetOf(tz.ops);
      gRow.innerHTML = '';
      OB.TZ_GONDERILER.forEach((g) => {
        const b = h('button', { class: 'obs-tz-g' + (g === secili ? ' is-on' : ''), type: 'button', title: `${OB.GONDERI[g].tam} · ${OB.GONDERI[g].sehir}` }, `${g} · ${d[g]}`);
        b.addEventListener('click', () => {
          secili = g;
          renderControls(cur || S.tz);
        });
        gRow.appendChild(b);
      });
      const sira = OB.ilerle(secili, d[secili]);
      bIlerle.textContent = sira ? (sira.t === 'teslim' ? '✓ Teslim et' : `▶ ${sira.durum}`) : 'teslim edildi';
      bIlerle.disabled = !sira || tz.ops.length >= OB.ISTEK_EN_COK;
      ekranRow.innerHTML = '';
      izLabel.textContent = `İzleyenler · ${OB.kisa(secili)}:`;
      OB.GOZ_SIRA.forEach((o) => {
        const kilitli = o === 'merkez' && !unlocked;
        const abone = niyet[secili].includes(o);
        const b = h(
          'button',
          {
            class: 'obs-tz-e' + (abone ? ' is-on' : '') + (kilitli ? ' is-kilit' : ''),
            type: 'button',
            title: kilitli ? 'Genişlet sahnesinde yazılır' : abone ? `${secili} aboneliğinden çıkar` : `${secili} gönderisine abone et`,
            'aria-pressed': String(abone),
          },
          `${kilitli ? '🔒 ' : abone ? '✓ ' : '+ '}${EKRAN_KISA[o]}`
        );
        b.addEventListener('click', () => {
          if (kilitli) {
            DP.fx.toast('Çağrı merkezi henüz yazılmadı! “Genişlet” sahnesinde ekleyin.', 2600);
            ctx.flashScene('genislet');
            return;
          }
          ekle(abone ? OC(secili, o) : OE(secili, o));
        });
        ekranRow.appendChild(b);
      });
      opsRow.innerHTML = '';
      if (!tz.ops.length) opsRow.appendChild(h('span', { class: 'obs-tz-none' }, 'henüz istek yok'));
      tz.ops.forEach((op, i) => opsRow.appendChild(h('span', { class: 'obs-tz-op is-' + op.t, title: i + 1 + '. istek' }, etiket(op))));
    }

    function renderMetrics(tz, o) {
      const tile = (v, label, cls) => `<div class="obs-mt-t${cls ? ' ' + cls : ''}"><b>${v}</b><span>${label}</span></div>`;
      metrics.innerHTML = `<div class="obs-mt">
        ${tile(o.degisiklik, 'durum değişikliği')}
        ${tile(o.bildirim, 'bildirim')}
        <span class="obs-mt-sep"></span>
        ${tile(o.istenmeyen, 'istenmeyen', o.istenmeyen ? 'is-bad' : 'is-good')}
        ${tile(o.kacan, 'kaçan', o.kacan ? 'is-bad' : 'is-good')}
        ${tile(o.tanidigi, 'Gonderi’nin tanıdığı ekran', o.tanidigi ? 'is-bad' : 'is-good')}
      </div>`;
    }

    function finalState(tz, o) {
      const prog = OB.tezgahProg(tz);
      const st = OB.sonDurum(prog, { run: o.run });
      st.banner =
        tz.design === 'observer'
          ? { text: `Observer · **${o.bildirim}** bildirim, hepsi isteyene · Gonderi ekran tanımıyor`, tone: 'ok' }
          : o.istenmeyen + o.kacan
          ? { text: `**${o.istenmeyen}** istenmeyen · **${o.kacan}** kaçan bildirim${o.bosuna.length ? ' · rotada teslim edilmiş: **' + o.bosuna.join(', ') + '**' : ''}`, tone: 'bad' }
          : { text: `${TASARIM_AD[tz.design]} bu oturumda sorun çıkarmadı (abonelik değişmedi${tz.design === 'dogrudan' ? ', teslim yok' : ''}).` };
      return st;
    }

    function draw(tz, animate) {
      stop();
      cur = { design: tz.design, ops: tz.ops.slice() };
      const o = OB.olc(cur);
      renderControls(cur);
      renderMetrics(cur, o);
      // önce konsol, sonra kod
      OB.renderConsole(consoleEl, OB.cmd(true), o.run.lines.map((l) => OB.consoleLine(l, { bad: (x) => x.k === 'ozet' && x.t.startsWith('Kurye rotası') && o.bosuna.length > 0 })), { animateFrom: animate ? 0 : null });
      const F = OB.tezgahFiles(cur);
      cv.setFiles(OB.fileList(F), { active: 'Main.java', keepActive: false });
      const yorum = cur.ops.map((op) => OB.istekSatiri(OB.tezgahProg(cur), op)).filter((x) => x.startsWith('//'));
      if (yorum.length) yorum.forEach((y, k) => cv.mark('Main.java', y, 'bad', { scroll: k === 0, smooth: false }));
      show(finalState(cur, o), animate);
      const kural = {
        dogrudan: 'Gonderi ekranları **adıyla** çağırır; abonelik değişikliğinin kodda karşılığı yok, `teslimEt` tableti unutur.',
        sabit: 'Tek `bildir()` herkese haber verir; ama liste **kurucuda sabit**: abone olmak ya da ayrılmak mümkün değil.',
        observer: 'Liste **çalışma anında** değişir (`aboneEkle`, `aboneCikar`); `bildir()` o anda listede kim varsa ona haber verir.',
      }[cur.design];
      extra.innerHTML = `<div class="obs-oneline"><span class="tb-label">Kural:</span><span>${md(kural)}</span></div>`;
    }

    /** Oturumu baştan oynatır: her istek için gönderi, teller ve jetonlar */
    function oynat() {
      if (!cur) return;
      stop();
      const prog = OB.tezgahProg(cur);
      const r = OB.run(prog);
      const o = OB.olc(cur);
      const fin = finalState(cur, o);
      btnRun.classList.add('is-running');
      let t = 0;
      show(OB.stateFrom(prog, OB.KURULU_AN(prog), { banner: { text: 'Oturum baştan oynatılıyor…' } }), true);
      t += 700;
      cur.ops.forEach((op, k) => {
        const olaylar = r.olaylar.filter((x) => x.i === k);
        const e = olaylar[olaylar.length - 1];
        if (!e) return;
        const yok = olaylar.find((x) => x.e === 'yok');
        const gun = olaylar.filter((x) => x.e === 'guncelle');
        const kac = olaylar.filter((x) => x.e === 'kacan');
        const ist = gun.filter((x) => x.istenmeyen);
        let tokens = OB.jetonlar(r.olaylar, k, { ara: 220 });
        if (op.t === 'cik' || op.t === 'ekle') tokens = yok ? [] : [{ from: 'o:' + op.o, to: 'g:' + op.g, text: op.t === 'cik' ? 'ayrıl' : 'abone ol', kind: op.t === 'cik' ? 'cik' : 'abone' }];
        const not = yok ? ' — **bu tasarımda yolu yok**' : ist.length || kac.length ? ` — ${ist.length ? ist.length + ' istenmeyen' : ''}${ist.length && kac.length ? ', ' : ''}${kac.length ? kac.length + ' kaçan' : ''}` : '';
        at(t, () =>
          show(
            OB.stateFrom(prog, e.s, {
              ghl: { [op.g]: true },
              bildir: op.t === 'durum' || op.t === 'teslim' ? op.g : null,
              hl: Object.fromEntries(gun.map((x) => [x.o, x.istenmeyen ? 'bad' : 'on']).concat(kac.map((x) => [x.o, 'bad']))),
              teller: OB.telVurgu(r.olaylar, k),
              tokens,
              banner: { text: `${k + 1}/${cur.ops.length} · ${etiket(op)}${not}`, tone: not ? 'bad' : null },
            }),
            true
          )
        );
        t += op.t === 'durum' || op.t === 'teslim' ? 1500 : 1100;
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
        if (s.tz && s.tz.ops.some((op) => op.g === 'KRG-1003') && i === 3) secili = 'KRG-1003';
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
