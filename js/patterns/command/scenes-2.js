/*
 * Command — sahneler (2/3): CANLI AKIŞ ve KOMUT TEZGÂHI
 *   Canlı Akış: istemci komut nesnesini yaratır, panel onu çalıştırıp geçmişe koyar; "geri al" yığından çekip
 *               komutun kendi geri alma kaydıyla geri alır. İkinci tarif: gece işinin komut kuyruğu.
 *   Tezgâh   : operatör gibi istek gönderin (taşı, yükle, geri al, yinele, makro); aynı oturumu kalıpsız (tek kayıt)
 *               ve komutlu (geçmiş yığını) tasarımda karşılaştırın. Üretilen Main.java ve konsol birlikte görünür.
 */
(function () {
  'use strict';
  const CM = DP.cmd;
  const { h } = DP;
  const kit = DP.kit;
  const ui = CM.ui;
  const md = CM.md;

  function renderStack(stackEl, frames) {
    stackEl.innerHTML = '<span class="cs-label">Çağrı yığını</span>';
    frames.forEach((fr, i) => {
      if (i) stackEl.appendChild(h('span', { class: 'cs-sep' }, '›'));
      const r = CM.roleOf(fr.cls);
      stackEl.appendChild(h('span', { class: 'cs-frame' + (r ? ' rc rc-' + r : '') + (i === frames.length - 1 ? ' is-top' : '') }, fr.t));
    });
  }

  // ================================================================== 4. CANLI AKIŞ
  const BOS = { raflar: Object.assign({}, CM.SABAH), yuk: [], gecmis: [], ileri: [], slot: {}, kuyruk: [] };

  function flowSteps(p) {
    const seq = CM.seqSpec(p);
    const r = seq.run;
    const msgOf = seq.msgOf;
    const prog = p.prog;
    const MF = 'Main.java';
    const PF = 'OperatorPaneli.java';
    const GF = 'GeceIsi.java';
    const TF = 'TasiKomutu.java';
    const YF = 'YukleKomutu.java';
    const DF = 'Depo.java';
    const KF = 'Kamyon.java';
    const fMain = { t: 'Main.main()', cls: 'Main' };
    const steps = [];
    const O = r.olaylar;
    const bul = (e, istek, from) => O.findIndex((o, i) => i >= (from || 0) && o.e === e && (istek == null || o.istek === istek));
    // komut nesnelerinin o anki alanları (bant için)
    const kartlar = {};
    const adOf = {};
    const kartBant = (x) => ({
      kind: 'kartlar',
      not: x.not,
      kartlar: Object.keys(kartlar).map((id) => ({ kart: kartlar[id], ad: adOf[id], durum: x.aktif === Number(id) ? 'aktif' : null, metot: x.aktif === Number(id) ? x.metot : null, yeniKayit: x.aktif === Number(id) && x.yeniKayit })),
    });
    const st = (s, x) => CM.stateFrom(prog, s, Object.assign({ panelBos: !!prog.gece }, x));
    const lineCount = (i) => (i < 0 ? 0 : O[i].n);

    if (!prog.gece) {
      // ---- gündüz: iki komut, iki geri al
      const tKart = O[bul('yeni', 0)].kart;
      const yKart = O[bul('yeni', 1)].kart;
      adOf[tKart.id] = 't';
      adOf[yKart.id] = 'y';
      const fPanel = (m) => ({ t: `panel.${m}()`, cls: 'OperatorPaneli' });
      const fK = (ad, m, cls) => ({ t: `${ad}.${m}()`, cls });
      const fD = (m) => ({ t: `depo.${m}()`, cls: 'Depo' });
      const fKm = (m) => ({ t: `kamyon.${m}()`, cls: 'Kamyon' });
      steps.push({
        t: 'Kurulum',
        x: 'Main iki **alıcıyı** ([[Depo]], [[Kamyon]]) ve bir **çağıranı** ([[OperatorPaneli]]) yarattı. Panel depoyu da kamyonu da tanımıyor: kurucusu hiç parametre almıyor.',
        code: [MF, 'Depo depo = Depo.sabah();'], dev: [MF, 'OperatorPaneli panel = new OperatorPaneli();'], stack: [fMain], con: 0, seq: -1, d: 5600,
        uml: { classes: ['Main', 'OperatorPaneli', 'Depo', 'Kamyon'] },
        stage: st(BOS, { bant: { kind: 'kartlar', kartlar: [], not: 'henüz komut yok' }, banner: { text: 'Panelin elinde **hiçbir alıcı yok**: yalnızca komut alacak.' } }),
      });
      // 1) yeni TasiKomutu
      let i = bul('yeni', 0);
      kartlar[tKart.id] = Object.assign({}, tKart);
      steps.push({
        t: 'new TasiKomutu(…)',
        x: 'İstemci (Main) bir **komut nesnesi** yarattı: işi yapacak alıcıyı (`depo`) ve isteğin bilgilerini (`KRG-1001`, `B3`) taşıyor. Henüz hiçbir şey olmadı; `onceki` alanı boş.',
        code: [MF, 'panel.yap(new TasiKomutu('], dev: [TF, 'public TasiKomutu(Depo depo, String koli, String hedef) {'], stack: [fMain], con: lineCount(i), seq: msgOf['new:0'], d: 5600,
        uml: { classes: ['Main', 'TasiKomutu'], edges: ['c-main'] },
        stage: st(O[i].s, { bant: kartBant({ aktif: tKart.id, not: 'istemci yarattı; henüz çalışmadı' }) }),
      });
      i = bul('yap', 0);
      steps.push({
        t: 'panel.yap(t)',
        x: '[[OperatorPaneli]] komutu aldı ve adını yazdı. Panel komutun ne yaptığını **bilmiyor**: yalnızca bir `Komut` olduğunu biliyor.',
        code: [PF, 'public void yap(Komut k) {'], dev: [PF, 'System.out.println("[Panel] " + k.ad());'], stack: [fMain, fPanel('yap')], con: O[i].n, seq: msgOf['yap:0'], d: 5000,
        uml: { classes: ['OperatorPaneli', 'Komut'], members: [['OperatorPaneli', 'yap']] },
        stage: st(O[i].s, { dugme: 'tasi', bant: kartBant({ aktif: tKart.id }), token: { from: 'kart:' + tKart.id, to: 'panel', text: 't', kind: 'req' } }),
      });
      i = bul('yeri', 0);
      kartlar[tKart.id].kayit = O[i].raf;
      steps.push({
        t: 't.calistir(): önce kaydet',
        x: `\`k.calistir()\`: komut önce **geri almak için gereken bilgiyi** kaydetti: \`onceki = depo.yeri("KRG-1001")\` → **${O[i].raf}**. Bu bilgi panelde değil, komutun **kendi alanında** duruyor.`,
        code: [TF, 'onceki = depo.yeri(koli);'], dev: [PF, 'k.calistir();'], stack: [fMain, fPanel('yap'), fK('t', 'calistir', 'TasiKomutu')], con: O[i].n, seq: msgOf['yeri:0'], d: 6000,
        uml: { classes: ['TasiKomutu', 'Depo'], edges: ['a-tasi'], members: [['TasiKomutu', 'onceki']] },
        stage: st(O[i].s, { dugme: 'tasi', bant: kartBant({ aktif: tKart.id, metot: 'calistir', yeniKayit: true }) }),
      });
      i = bul('tasi', 0);
      steps.push({
        t: 'depo.tasi(1001, B3)',
        x: 'Sonra işi **alıcıya** yaptırdı: [[Depo]] koliyi A1’den B3’e taşıdı. İşi bilen depo; komut yalnızca kimin neyi yapacağını biliyor.',
        code: [TF, 'depo.tasi(koli, hedef);'], dev: [DF, 'public void tasi(String koli, String raf) {'], stack: [fMain, fPanel('yap'), fK('t', 'calistir', 'TasiKomutu'), fD('tasi')], con: O[i].n, seq: msgOf['tasi:0'], d: 5200,
        uml: { classes: ['TasiKomutu', 'Depo'], edges: ['a-tasi'], members: [['Depo', 'tasi']] },
        stage: st(O[i].s, { hl: { 'KRG-1001': 'move' }, from: { A1: true }, bant: kartBant({ aktif: tKart.id, metot: 'calistir' }), token: { from: 'kart:' + tKart.id, to: 'cell:B3', text: 'tasi', kind: 'req' } }),
      });
      i = bul('push', 0);
      steps.push({
        t: 'gecmis.push(t)',
        x: 'Panel çalışan komutu **geçmiş yığınına** koydu (ve yinele yığınını temizledi). Yığında bir nesne var: `TAŞI 1001 → B3`, içinde `onceki = A1`.',
        code: [PF, 'gecmis.push(k);'], dev: [PF, 'ileri.clear();'], stack: [fMain, fPanel('yap')], con: O[i].n, seq: msgOf['retm:0'], d: 5000,
        uml: { classes: ['OperatorPaneli', 'Komut'], edges: ['gecmis'], members: [['OperatorPaneli', 'gecmis']] },
        stage: st(O[i].s, { bant: kartBant({}) }),
      });
      i = bul('yap', 1);
      kartlar[yKart.id] = Object.assign({}, yKart);
      steps.push({
        t: 'panel.yap(new YukleKomutu(…))',
        x: 'İkinci istek: Main bir [[YukleKomutu]] yarattı (alıcıları: `depo` ve `kamyon`) ve panele verdi. Panel için ikisi aynı: `k.ad()`, `k.calistir()`.',
        code: [MF, 'panel.yap(new YukleKomutu('], dev: [YF, 'public YukleKomutu(Depo depo, Kamyon kamyon, String koli) {'], stack: [fMain, fPanel('yap')], con: O[i].n, seq: msgOf['yap:1'], d: 5400,
        uml: { classes: ['Main', 'YukleKomutu', 'OperatorPaneli'] },
        stage: st(O[i].s, { dugme: 'yukle', bant: kartBant({ aktif: yKart.id }), token: { from: 'kart:' + yKart.id, to: 'panel', text: 'y', kind: 'req' } }),
      });
      i = bul('yukle', 1);
      kartlar[yKart.id].kayit = O[bul('cikar', 1)].from;
      steps.push({
        t: 'y.calistir(): raftan kamyona',
        x: `Komut koliyi raftan aldı ve **hangi raftan aldığını** kaydetti (\`raf = ${kartlar[yKart.id].kayit}\`), sonra kamyona yükledi. Zeynep’in ilacı yanlış kamyonda: operatörün ikinci hatası.`,
        code: [YF, 'raf = depo.cikar(koli);'], dev: [KF, 'public void yukle(String koli) {'], stack: [fMain, fPanel('yap'), fK('y', 'calistir', 'YukleKomutu'), fKm('yukle')], con: O[i].n, seq: msgOf['yukle:1'], d: 6000,
        uml: { classes: ['YukleKomutu', 'Depo', 'Kamyon'], edges: ['a-yukle-depo', 'a-yukle-kamyon'] },
        stage: st(O[i].s, { hl: { 'KRG-1003': 'move' }, from: { A3: true }, bant: kartBant({ aktif: yKart.id, metot: 'calistir', yeniKayit: true }), token: { from: 'kart:' + yKart.id, to: 'kamyon', text: 'yukle', kind: 'req' } }),
      });
      i = bul('push', 1);
      steps.push({
        t: 'gecmis.push(y)',
        x: 'Yığında iki komut: üstte `YÜKLE 1003` (raf = A3), altta `TAŞI 1001 → B3` (önceki = A1). Kalıpsız panel bu anda yalnızca **sonuncuyu** hatırlıyordu.',
        code: [PF, 'gecmis.push(k);'], dev: [PF, 'ileri.clear();'], stack: [fMain, fPanel('yap')], con: O[i].n, seq: msgOf['retm:1'], d: 5600,
        uml: { classes: ['OperatorPaneli', 'Komut'], edges: ['gecmis'], members: [['OperatorPaneli', 'gecmis']] },
        stage: st(O[i].s, { bant: kartBant({}), banner: { text: 'Geçmişte **iki komut**, her biri kendi geri alma kaydıyla.' } }),
      });
      i = bul('geriAl', 2);
      steps.push({
        t: 'panel.geriAl() → y',
        x: 'Operatör “geri al” dedi. Panel yığının **üstündeki** komutu çekti (`YÜKLE 1003`) ve ona `geriAl()` dedi. Panel yine ne olacağını bilmiyor.',
        code: [MF, { find: 'panel.geriAl();', nth: 1 }], dev: [PF, 'Komut k = gecmis.pop();'], stack: [fMain, fPanel('geriAl')], con: O[i].n, seq: msgOf['gal:2'], d: 5400,
        uml: { classes: ['OperatorPaneli', 'Komut'], members: [['OperatorPaneli', 'geriAl'], ['Komut', 'geriAl']] },
        stage: st(O[i].s, { dugme: 'geri', bant: kartBant({ aktif: yKart.id, metot: 'geriAl' }) }),
      });
      i = bul('koy', 2);
      steps.push({
        t: 'y.geriAl(): kamyondan rafa',
        x: `Komut kendi kaydına baktı: koli **${kartlar[yKart.id].kayit}** rafından gelmişti. Kamyondan indirdi, aynı rafa koydu.`,
        code: [YF, 'depo.koy(koli, raf);'], dev: [YF, 'kamyon.indir(koli);'], stack: [fMain, fPanel('geriAl'), fK('y', 'geriAl', 'YukleKomutu'), fD('koy')], con: O[i].n, seq: msgOf['koy:2'], d: 5600,
        uml: { classes: ['YukleKomutu', 'Depo', 'Kamyon'], edges: ['a-yukle-depo', 'a-yukle-kamyon'] },
        stage: st(O[i].s, { hl: { 'KRG-1003': 'ok' }, bant: kartBant({ aktif: yKart.id, metot: 'geriAl' }), token: { from: 'kamyon', to: 'cell:' + kartlar[yKart.id].kayit, text: 'koy', kind: 'ok' } }),
      });
      i = bul('geriAl', 3);
      steps.push({
        t: 'panel.geriAl() → t',
        x: 'İkinci “geri al”. Kalıpsız panel burada **“geri alınacak işlem yok”** diyordu. Komutlu panelde yığında hâlâ bir komut var: `TAŞI 1001 → B3`.',
        code: [MF, { find: 'panel.geriAl();', nth: 2 }], dev: [PF, 'Komut k = gecmis.pop();'], stack: [fMain, fPanel('geriAl')], con: O[i].n, seq: msgOf['gal:3'], d: 6000,
        uml: { classes: ['OperatorPaneli', 'Komut'], members: [['OperatorPaneli', 'geriAl']] },
        stage: st(O[i].s, { dugme: 'geri', bant: kartBant({ aktif: tKart.id, metot: 'geriAl' }) }),
      });
      i = bul('tasi', 3);
      steps.push({
        t: 't.geriAl(): B3 → A1',
        x: `\`depo.tasi(koli, onceki)\`: komutun kendi kaydı **${kartlar[tKart.id].kayit}**. Ali’nin kolisi yerine döndü.`,
        code: [TF, 'depo.tasi(koli, onceki);'], dev: [DF, 'public void tasi(String koli, String raf) {'], stack: [fMain, fPanel('geriAl'), fK('t', 'geriAl', 'TasiKomutu'), fD('tasi')], con: O[i].n, seq: msgOf['tasi:3'], d: 5400,
        uml: { classes: ['TasiKomutu', 'Depo'], edges: ['a-tasi'] },
        stage: st(O[i].s, { hl: { 'KRG-1001': 'ok' }, bant: kartBant({ aktif: tKart.id, metot: 'geriAl' }), token: { from: 'kart:' + tKart.id, to: 'cell:A1', text: 'tasi', kind: 'ok' } }),
      });
      i = bul('durum');
      steps.push({
        t: 'Sonuç: iki geri al, ikisi de doğru',
        x: 'Her komut kendi geri alma kaydını taşıdığı için geçmiş **sınırsız**: iki işlem, iki geri al, depo sabahki hâlinde. Geri alınan komutlar **yinele** yığınında bekliyor; `panel.yinele()` onları yeniden çalıştırır.',
        code: [MF, 'System.out.println(depo.durum()'], stack: [fMain], con: O[i].n, seq: seq.spec.messages.length - 1, d: 6400,
        uml: { classes: ['OperatorPaneli', 'Komut', 'TasiKomutu', 'YukleKomutu'], edges: ['gecmis', 'r-tasi', 'r-yukle'] },
        stage: st(O[i].s, { hl: { 'KRG-1001': 'ok', 'KRG-1003': 'ok' }, bant: kartBant({ not: 'geri alınanlar yinele yığınında' }), banner: { text: '2 komut · 2 geri al · depo **sabahki hâlinde**', tone: 'ok' } }),
      });
    } else {
      // ---- gece: komut kuyruğu
      const fGece = (m) => ({ t: `gece.${m}()`, cls: 'GeceIsi' });
      const geceBant = (s, x) => Object.assign(CM.geceBant(prog, s), x || {});
      steps.push({
        t: 'Kurulum',
        x: 'Main alıcıları ([[Depo]], [[Kamyon]]) ve ikinci bir **çağıran** yarattı: [[GeceIsi]]. Gece işi de panel gibi yalnızca `Komut` türünü tanıyor.',
        code: [MF, 'Depo depo = Depo.sabah();'], dev: [MF, 'GeceIsi gece = new GeceIsi();'], stack: [fMain], con: 0, seq: -1, d: 5200,
        uml: { classes: ['Main', 'GeceIsi', 'Depo', 'Kamyon'] },
        stage: st(BOS, { bant: { kind: 'gece', naive: false, items: [] }, banner: { text: 'Gece işi boş: kuyrukta **komut nesneleri** bekleyecek.' } }),
      });
      prog.gece.forEach((op, k) => {
        const i = bul('ekle', k);
        const etiket = op.t === 'tasi' ? `TAŞI ${op.koli} → ${op.raf}` : `YÜKLE ${op.koli}`;
        steps.push({
          t: `gece.ekle(${op.t === 'tasi' ? 'TasiKomutu' : 'YukleKomutu'})`,
          x:
            k === 0
              ? `Akşam vardiyası ilk işi kuyruğa koydu: bir [[YukleKomutu]] nesnesi. Dikkat: **hiçbir şey çalışmadı**; komut yalnızca bekliyor.`
              : k === prog.gece.length - 1
              ? `Üçüncü iş: \`${etiket}\`. Kalıpsız sürümde bu satır \`"YÜKLE KRG-1005"\` diye yazılmıştı ve gece çökmüştü; burada bir sınıf adı var, yanlış yazılsa **derlenmezdi**.`
              : `İkinci iş: \`${etiket}\`. Kuyrukta farklı türden komutlar yan yana duruyor; gece işi hepsine aynı davranıyor.`,
          code: [MF, `gece.ekle(${CM.yeniKomut(op)});`], dev: [GF, 'kuyruk.add(k);'], stack: [fMain, fGece('ekle')], con: 0, seq: msgOf['ekle:' + k], d: k === 0 ? 5600 : 5000,
          uml: { classes: ['GeceIsi', 'Komut'], edges: ['kuyruk'], members: [['GeceIsi', 'ekle']] },
          stage: st(O[i].s, { bant: geceBant(O[i].s), token: null }),
        });
      });
      let i = bul('gece');
      steps.push({
        t: '02:00 · gece.calistir()',
        x: 'Saat 02:00: gece işi kuyruğu dolaşmaya başladı. Kaç işin beklediğini biliyor (3) ama **ne yaptıklarını** bilmiyor.',
        code: [MF, 'gece.calistir();'], dev: [GF, 'System.out.println("[Gece] 02:00, "'], stack: [fMain, fGece('calistir')], con: O[i].n, seq: msgOf.cal, d: 5000,
        uml: { classes: ['GeceIsi'], members: [['GeceIsi', 'calistir']] },
        stage: st(O[i].s, { bant: geceBant(O[i].s) }),
      });
      prog.gece.forEach((op, k) => {
        const j = bul('geceOk', k);
        const hedef = op.t === 'tasi' ? 'cell:' + op.raf : 'kamyon';
        steps.push({
          t: `${k + 1}. iş: ${op.t === 'tasi' ? 'TAŞI ' + op.koli.slice(4) + ' → ' + op.raf : 'YÜKLE ' + op.koli.slice(4)}`,
          x:
            op.t === 'tasi'
              ? `\`k.calistir()\` bu kez bir [[TasiKomutu]]: önce \`onceki\` kaydı, sonra depoya taşıma. Gece işi için fark yok.`
              : `\`k.calistir()\`: [[YukleKomutu]] koliyi raftan aldı (kaydı: **${O[bul('cikar', k)].from}**) ve kamyona yükledi.${k === prog.gece.length - 1 ? ' Kalıpsız sürüm tam bu işte çöküyordu.' : ''}`,
          code: [GF, 'k.calistir();'], dev: [op.t === 'tasi' ? TF : YF, op.t === 'tasi' ? 'depo.tasi(koli, hedef);' : 'kamyon.yukle(koli);'], stack: [fMain, fGece('calistir'), { t: (op.t === 'tasi' ? 't' : 'y') + '.calistir()', cls: op.t === 'tasi' ? 'TasiKomutu' : 'YukleKomutu' }], con: O[j].n, seq: msgOf[(op.t === 'tasi' ? 'tasi:' : 'yukle:') + k], d: 5200,
          uml: { classes: ['GeceIsi', op.t === 'tasi' ? 'TasiKomutu' : 'YukleKomutu'], edges: ['kuyruk'] },
          stage: st(O[j].s, { hl: { [op.koli]: 'move' }, bant: geceBant(O[j].s), token: { from: 'gece:' + k, to: hedef, text: op.t === 'tasi' ? 'tasi' : 'yukle', kind: 'req' } }),
        });
      });
      i = bul('durum');
      steps.push({
        t: 'Sonuç: kuyruk bitti',
        x: 'Üç iş de yapıldı; kamyon Ali ve Selin’in kolileriyle yola çıkıyor. Kuyrukta dizgi değil **nesne** vardı: ne kopya `switch` ne satır bölme. Aynı komutlar istense panelden de çalıştırılabilir, kaydedilebilir ya da geri alınabilir.',
        code: [MF, 'System.out.println(depo.durum()'], stack: [fMain], con: O[i].n, seq: seq.spec.messages.length - 1, d: 6400,
        uml: { classes: ['GeceIsi', 'Komut', 'TasiKomutu', 'YukleKomutu'], edges: ['kuyruk', 'r-tasi', 'r-yukle'] },
        stage: st(O[i].s, { hl: { 'KRG-1001': 'ok', 'KRG-1005': 'ok', 'KRG-1004': 'ok' }, bant: geceBant(O[bul('geceOk', prog.gece.length - 1)].s), banner: { text: '02:00 · **3 iş** · çöküş yok · kamyonda 1001 ve 1005', tone: 'ok' } }),
      });
    }
    return { steps, seq, run: r };
  }

  CM.scenes.flow = function (root, ctx) {
    const S = ctx.state;
    let p = CM.presets[S.preset] || CM.presets.gun;
    const el = h('div', { class: 'scene scene-flow' });
    const toolbar = h('div', { class: 'scene-toolbar' });
    const body = h('div', { class: 'flow-body' + (S.showCode === false ? ' hide-code' : '') });
    el.append(toolbar, body);
    root.appendChild(el);

    const presetSeg = kit.seg(
      CM.presetOrder.map((k) => ({ v: k, label: CM.presets[k].title, title: k === 'gun' ? 'Panel: TAŞI, YÜKLE, iki kez geri al' : 'Gece işi: üç komut kuyrukta, 02:00’de çalışır' })),
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
      h('span', { class: 'tb-hint cmd-key', html: '<span class="cmd-key-k">komut</span> isteği taşır · <span class="cmd-key-i">çağıran</span> çalıştırır · <span class="cmd-key-r">alıcı</span> işi yapar' }),
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
    const consoleEl = h('div', { class: 'console cmd-flow-console', 'aria-live': 'polite' });
    codeCol.append(stackEl, cvPanel, consoleEl);
    body.append(viewPanel, codeCol);

    const stage = new CM.DepoSahne(views.stage);
    const cv = new DP.CodeView(cvPanel, { roleOf: CM.roleOf, special: CM.special });
    let uml = null;
    let seq = null;
    let steps = [];
    let run = null;

    function load() {
      const f = flowSteps(p);
      steps = f.steps;
      run = f.run;
      cv.setFiles(CM.akisFiles(p), { active: 'Main.java', keepActive: false });
      views.seq.innerHTML = '';
      seq = new DP.SequenceDiagram(views.seq, f.seq.spec, { roles: CM.roles });
      const spec = CM.gofDiagram({ notes: true });
      if (uml) uml.update(spec, { animate: false });
      else uml = new DP.ClassDiagram(views.uml, spec, { roles: CM.roles, roleTags: true });
    }

    function setPreset(k) {
      if (CM.presets[k] === p) return;
      p = CM.presets[k];
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
      CM.renderConsole(
        consoleEl,
        CM.cmd(),
        run.lines.slice(0, s.con).map((l) => CM.consoleLine(l)),
        { animateFrom: info.animate && ps && s.con > ps.con ? ps.con : null, cursor: i < steps.length - 1 }
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
      delayOf: (i) => (steps[i] && steps[i].d) || 5200,
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

  // ================================================================== 5. KOMUT TEZGÂHI
  const { T, Y, G, I } = CM.op;

  CM.scenes.counter = function (root, ctx) {
    const S = ctx.state;
    S.tz = S.tz || { design: 'komut', ops: CM.GUN.slice() };
    const unlocked = !!S.makroUnlocked;
    const el = h('div', { class: 'scene scene-split cmd-tz' });
    const body = h('div', { class: 'scene-body cols-tz' });
    const left = kit.panel('Operatör masası', { cls: 'panel-code cmd-left cmd-tz-left' });
    const right = kit.panel('Depo <span class="panel-sub">· aynı istekler, iki tasarım</span>', { cls: 'panel-side cmd-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    // ---- denetimler
    const designSeg = kit.seg(
      [
        { v: 'naive', label: 'Kalıpsız · tek kayıt', title: 'Panel isteği switch ile yapar, yalnızca son işlemi hatırlar' },
        { v: 'komut', label: 'Komut · geçmiş yığını', title: 'Her istek bir komut nesnesi; panel geçmiş ve ileri yığını tutar' },
      ],
      S.tz.design,
      (v) => act((c) => (c.design = v)),
      { label: 'Tasarım', cls: 'cmd-seg' }
    );
    let secili = 'KRG-1001';
    const koliRow = h('div', { class: 'cmd-tz-koliler' });
    const rafSel = h('select', { class: 'cmd-tz-raf', 'aria-label': 'Hedef raf' });
    const bTasi = h('button', { class: 'cmd-tz-b', type: 'button' }, 'Taşı →');
    const bYukle = h('button', { class: 'cmd-tz-b', type: 'button', title: 'Seçili koliyi kamyona yükle' }, 'Yükle');
    const bGeri = h('button', { class: 'cmd-tz-b', type: 'button' }, '↶ Geri al');
    const bYinele = h('button', { class: 'cmd-tz-b', type: 'button' }, '↷ Yinele');
    const bMakro = h('button', { class: 'cmd-tz-b is-makro', type: 'button' }, '');
    const opsRow = h('div', { class: 'cmd-tz-ops' });
    const btnReset = h('button', { class: 'btn btn-ghost btn-sm', type: 'button', title: 'Oturumu boşalt' }, '↺ Sıfırla');
    const btnRun = h('button', { class: 'btn btn-primary btn-sm cmd-run', type: 'button', title: 'Oturumu baştan, istek istek oynat' }, '▶ Oynat');
    bTasi.addEventListener('click', () => ekle(T(secili, rafSel.value)));
    bYukle.addEventListener('click', () => ekle(Y(secili)));
    bGeri.addEventListener('click', () => ekle(G));
    bYinele.addEventListener('click', () => ekle(I));
    bMakro.addEventListener('click', () => {
      if (!unlocked) {
        DP.fx.toast('MakroKomut henüz yazılmadı! “Genişlet” sahnesinde ekleyin.', 2600);
        ctx.flashScene('genislet');
        return;
      }
      ekle(CM.MAKRO);
    });
    btnReset.addEventListener('click', () => act((c) => (c.ops = [])));
    btnRun.addEventListener('click', () => oynat());
    const controls = h(
      'div',
      { class: 'cmd-tz-controls' },
      h('div', { class: 'cmd-tz-row' }, h('span', { class: 'tb-label' }, 'Tasarım:'), designSeg.el, h('span', { class: 'tb-spacer' }), btnReset, btnRun),
      h('div', { class: 'cmd-tz-row' }, h('span', { class: 'tb-label' }, 'Koli:'), koliRow),
      h('div', { class: 'cmd-tz-row' }, h('span', { class: 'tb-label' }, 'İstek:'), bTasi, rafSel, bYukle, bGeri, bYinele, bMakro),
      h('div', { class: 'cmd-tz-row is-ops' }, h('span', { class: 'tb-label' }, 'Oturum:'), opsRow)
    );
    const cvHost = h('div', { class: 'cmd-cv' });
    const consoleEl = h('div', { class: 'console cmd-console' });
    left.body.append(controls, cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: CM.roleOf, special: CM.special });

    // ---- sağ: depo + ölçüler
    const viewHost = h('div', { class: 'cmd-view' });
    const metrics = h('div', { class: 'cmd-metrics' });
    const extra = h('div', { class: 'cmd-extra' });
    right.body.append(viewHost, metrics, extra);
    const stage = new CM.DepoSahne(viewHost, { cls: 'is-tezgah' });

    const FREE = 4;
    const STEPS = [
      {
        t: 'Komut: iki hata, iki geri al',
        x: 'Komutlu tasarım. Operatör Ali’nin kolisini B3’e taşıdı, Zeynep’in ilacını kamyona yükledi, sonra iki kez **geri al** dedi. Geçmiş yığını iki komutu da geri aldı; depo sabahki hâlinde.',
        tz: { design: 'komut', ops: CM.GUN },
      },
      {
        t: 'Aynı oturum, kalıpsız',
        x: 'Aynı dört istek, **kalıpsız** panelde. İkinci geri al “işlem yok” dedi; Ali’nin kolisi B3’te kaldı (kesikli kutu: olması gereken yer). Ölçüler: **1** boşa giden geri al, **1** yanlış yerde koli.',
        tz: { design: 'naive', ops: CM.GUN },
      },
      {
        t: 'Geri al, sonra yinele',
        x: 'Geri alınan komut kaybolmuyor: **ileri** yığınına geçiyor. `panel.yinele()` onu yeniden çalıştırıyor; ilaç yine kamyonda. Kalıpsız panelde “yinele” hiç yok.',
        tz: { design: 'komut', ops: [T('KRG-1001', 'B3'), Y('KRG-1003'), G, I] },
      },
      {
        t: 'Geri al, sonra yeni işlem',
        x: 'Geri aldıktan sonra **yeni bir istek** gelince ileri yığını temizlenir: eski gelecek artık geçersiz. Son “yinele” bu yüzden “yinelenecek işlem yok” dedi. Metin düzenleyicilerdeki davranışın aynısı.',
        tz: { design: 'komut', ops: [T('KRG-1001', 'B3'), G, T('KRG-1002', 'B4'), I] },
      },
      {
        t: 'Serbest: siz deneyin',
        x: unlocked
          ? 'Bir koli seçin, **Taşı** ya da **Kamyona yükle** deyin; istediğiniz kadar geri alın, yineleyin. Tasarımı değiştirip aynı oturumu karşılaştırın. **Makro** da artık açık!'
          : 'Bir koli seçin, **Taşı** ya da **Kamyona yükle** deyin; istediğiniz kadar geri alın, yineleyin. Tasarımı değiştirip aynı oturumu karşılaştırın. (🔒 Makro, Genişlet sahnesinde yazılır.)',
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
      // kalıpsız tasarımda olmayan istekler (yinele, makro) düşer
      if (c.design === 'naive') c.ops = c.ops.filter((op) => op.t !== 'yinele' && op.t !== 'makro');
      S.tz = c;
      if (!STEPS[stepper.index].free) stepper.go(FREE, { animate: true });
      else draw(S.tz, true);
    }

    function ekle(op) {
      const s = CM.run(CM.tezgahProg(cur || S.tz)).son;
      if (!CM.uygun(s, op, (cur || S.tz).design)) {
        DP.fx.toast(op.t === 'tasi' ? 'Hedef raf dolu ya da koli rafta değil.' : 'Bu istek şu an yapılamaz.', 2200);
        return;
      }
      act((c) => c.ops.push(op));
    }

    const etiket = (op) => (op.t === 'tasi' ? `Taşı ${op.koli.slice(4)}→${op.raf}` : op.t === 'yukle' ? `Yükle ${op.koli.slice(4)}` : op.t === 'geri' ? '↶ Geri al' : op.t === 'yinele' ? '↷ Yinele' : 'Makro');

    function renderControls(tz, s) {
      designSeg.set(tz.design);
      const naive = tz.design === 'naive';
      if (!s.raflar[secili]) secili = CM.KOLILER.find((k) => s.raflar[k]) || secili;
      koliRow.innerHTML = '';
      CM.KOLILER.forEach((k) => {
        const rafta = !!s.raflar[k];
        const b = h('button', { class: 'cmd-tz-koli' + (k === secili ? ' is-on' : '') + (rafta ? '' : ' is-kamyon'), type: 'button', title: rafta ? `${CM.KOLI[k].tam} · ${s.raflar[k]}` : 'kamyonda' }, `${k.slice(4)} · ${rafta ? s.raflar[k] : '🚚'}`);
        b.disabled = !rafta;
        b.addEventListener('click', () => {
          secili = k;
          renderControls(cur, CM.run(CM.tezgahProg(cur)).son);
        });
        koliRow.appendChild(b);
      });
      const bos = CM.RAFLAR.filter((r) => !Object.values(s.raflar).includes(r));
      const onceki = rafSel.value;
      rafSel.innerHTML = bos.map((r) => `<option value="${r}">${r}</option>`).join('');
      if (bos.includes(onceki)) rafSel.value = onceki;
      bTasi.disabled = rafSel.disabled = !s.raflar[secili] || !bos.length;
      bYukle.disabled = !s.raflar[secili];
      bYinele.disabled = naive;
      bYinele.title = naive ? 'Kalıpsız panelde yinele yok' : '';
      bMakro.innerHTML = (unlocked ? '' : '🔒 ') + 'Makro';
      bMakro.title = 'Makro: Malatya kamyonu (1001, 1005, 1006)';
      bMakro.disabled = unlocked && (naive || !CM.uygun(s, CM.MAKRO, tz.design));
      opsRow.innerHTML = '';
      if (!tz.ops.length) opsRow.appendChild(h('span', { class: 'cmd-tz-none' }, 'henüz istek yok'));
      tz.ops.forEach((op, i) => opsRow.appendChild(h('span', { class: 'cmd-tz-op is-' + op.t, title: (i + 1) + '. istek' }, etiket(op))));
    }

    function renderMetrics(tz, o) {
      const tile = (v, label, cls) => `<div class="cmd-mt-t${cls ? ' ' + cls : ''}"><b>${v}</b><span>${label}</span></div>`;
      metrics.innerHTML = `<div class="cmd-mt">
        ${tile(tz.ops.length, 'istek')}
        ${tile(o.komutNesnesi, 'komut nesnesi', tz.design === 'naive' ? 'is-zero' : '')}
        ${tz.design === 'komut' ? tile(o.gecmis, 'geçmiş') + tile(o.ileri, 'ileri (yinele)') : tile(o.run.son.slot.sonIslem ? 1 : 0, 'kayıt (en çok 1)')}
        ${tile(o.kamyon, 'kamyonda')}
        <span class="cmd-mt-sep"></span>
        ${tile(o.kayipGeri, 'boşa giden geri al', o.kayipGeri ? 'is-bad' : 'is-good')}
        ${tile(o.yanlis.length, 'yanlış yerde koli', o.yanlis.length ? 'is-bad' : 'is-good')}
      </div>`;
    }

    function finalState(tz, o) {
      const prog = CM.tezgahProg(tz);
      const hl = {};
      const ghost = {};
      o.yanlis.forEach((k) => {
        hl[k] = 'bad';
        const yer = o.idealYer(k);
        if (yer !== 'kamyon' && yer !== '?') ghost[k] = yer;
      });
      const st = CM.sonDurum(prog, { run: o.run, hl, ghost });
      if (tz.design === 'naive') st.bant = null;
      const n = o.yanlis.length;
      st.banner =
        tz.design === 'naive'
          ? n
            ? { text: `**${o.kayipGeri}** geri al boşa gitti · **${n} koli** yanlış yerde: ${o.yanlis.map((k) => k.slice(4)).join(', ')}`, tone: 'bad' }
            : { text: 'Kalıpsız panel bu oturumda yetti: tek kayıt, en çok bir geri al.' }
          : { text: `Geçmiş **${o.gecmis}** · ileri **${o.ileri}** · her komut kendi kaydını taşıyor`, tone: 'ok' };
      return st;
    }

    function draw(tz, animate) {
      stop();
      cur = { design: tz.design, ops: tz.ops.slice() };
      const o = CM.olc(cur);
      renderControls(cur, o.run.son);
      renderMetrics(cur, o);
      // önce konsol, sonra kod
      CM.renderConsole(consoleEl, CM.cmd(true), o.run.lines.map((l) => CM.consoleLine(l, { yokBad: cur.design === 'naive' && o.kayipGeri > 0 && l.t.includes('geri alınacak') })), { animateFrom: animate ? 0 : null });
      const F = CM.tezgahFiles(cur);
      cv.setFiles(CM.fileList(F), { active: 'Main.java', keepActive: false });
      if (cur.ops.length) cv.mark('Main.java', [cur.design === 'naive' ? 'OperatorPaneli panel = new OperatorPaneli(depo, kamyon);' : 'OperatorPaneli panel = new OperatorPaneli();', 'System.out.println(depo.durum()'], 'focus', { smooth: false });
      show(finalState(cur, o), animate);
      extra.innerHTML = `<div class="cmd-oneline"><span class="tb-label">Kural:</span><span>${md(cur.design === 'naive' ? 'Panel isteği **kendisi** yapar ve yalnızca **son** işlemi hatırlar; yinele yok.' : 'Her istek bir **komut nesnesi**: panel onu çalıştırır, geçmişe koyar; geri al yığından çeker.')}</span></div>`;
    }

    /** Oturumu baştan oynatır: her istek için depo, yığınlar ve bir jeton */
    function oynat() {
      if (!cur) return;
      stop();
      const prog = CM.tezgahProg(cur);
      const r = CM.run(prog);
      const o = CM.olc(cur);
      const fin = finalState(cur, o);
      btnRun.classList.add('is-running');
      let t = 0;
      show(Object.assign(CM.stateFrom(prog, { raflar: Object.assign({}, CM.SABAH), yuk: [], gecmis: [], ileri: [], slot: {} }), { banner: { text: 'Oturum baştan oynatılıyor…' } }), true);
      t += 700;
      cur.ops.forEach((op, k) => {
        const son = r.olaylar.filter((x) => x.istek === k && x.alan === 'gun');
        const e = son[son.length - 1];
        if (!e) return;
        const yok = son.some((x) => x.e === 'yok');
        const hareket = son.filter((x) => x.e === 'tasi' || x.e === 'koy' || x.e === 'yukle');
        const hl = {};
        hareket.forEach((x) => (hl[x.koli] = op.t === 'geri' ? 'ok' : 'move'));
        const hedef = hareket.length ? (hareket[hareket.length - 1].e === 'yukle' ? 'kamyon' : 'cell:' + (hareket[hareket.length - 1].to || '')) : null;
        at(t, () =>
          show(
            CM.stateFrom(prog, e.s, {
              hl,
              dugme: op.t === 'geri' ? 'geri' : op.t === 'yinele' ? 'yinele' : op.t === 'yukle' || op.t === 'makro' ? 'yukle' : 'tasi',
              token: hedef ? { from: 'panel', to: hedef, text: etiket(op), kind: op.t === 'geri' ? 'ok' : 'req' } : null,
              banner: { text: `${k + 1}/${cur.ops.length} · ${etiket(op)}${yok ? ' — **boşa gitti**' : ''}`, tone: yok ? 'bad' : null },
            }),
            true
          )
        );
        t += 1100;
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
