/*
 * State — veri: Java kodları, çalıştırma benzetimi, roller, diyagram tanımları.
 * Bu dosya DOM kullanmaz; tools/export-java.js de Java dosyalarını buradan üretir.
 *
 * Senaryo (lojistik dünyasının devamı): Malatya şubesinin akıllı kargo dolabı (Chain of Responsibility’deki “Dolap”
 * halkası). Kurye paketi koyar, alıcıya SMS ile bir kod gider; alıcı kodu girince kapak açılır. Kalıpsız çözümde
 * dolabın durumu bir dizgidir ("BOŞ", "DOLU") ve her metot durumu if/else ile kendisi sorar. Güvenlik ekibi “üç hatalı
 * kodda dolap kilitlensin” der: geliştirici kodGir’i ve yeni gorevliAc’ı yazar ama paketKoy’a dokunmaz. paketKoy’un
 * else dalı (“BOŞ ise”) KİLİTLİ’yi de karşılar: kilitli dolaba Selin’in paketi konur, kayıt değişir, Ali’nin kodu
 * artık çalışmaz; Ali’nin paketi dolabın içinde ama sistemde yok.
 * State: her durum bir sınıf (BosDurum, DoluDurum, KilitliDurum); dolap isteği o anki durum nesnesine devreder,
 * geçişi durumlar yapar. Yeni bir durum sınıfı her isteğe cevap vermek zorunda: derleyici unutmaya izin vermez.
 */
(function () {
  'use strict';
  const DP = (window.DP = window.DP || {});
  const ST = (DP.sta = DP.sta || {});

  // ------------------------------------------------------------------ roller
  ST.roles = {
    client: { en: 'Client', tr: 'İstemci', color: 1 },
    context: { en: 'Context', tr: 'Bağlam', color: 3 },
    state: { en: 'State', tr: 'Durum (arayüz)', color: 2 },
    concreteState: { en: 'ConcreteState', tr: 'Somut durum', color: 4 },
  };

  ST.classRoles = {
    Main: 'client',
    KargoDolabi: 'context',
    DolapDurumu: 'state',
    BosDurum: 'concreteState',
    DoluDurum: 'concreteState',
    KilitliDurum: 'concreteState',
    HizmetDisiDurum: 'concreteState',
    // GoF genel adları
    Client: 'client',
    Context: 'context',
    State: 'state',
    ConcreteState: 'concreteState',
  };

  ST.roleOf = function (name) {
    const r = ST.classRoles[name];
    return r ? ST.roles[r].color : null;
  };

  // `durumDegistir`: durum geçişi (kodda ayrıca vurgulanır)
  ST.special = { durumDegistir: 'gec' };

  /** 1 tabanlı satır numarası. */
  ST.lineOf = function (src, needle, from) {
    const lines = src.split('\n');
    for (let i = from || 0; i < lines.length; i++) if (lines[i].includes(needle)) return i + 1;
    return 0;
  };

  /** Satırın sonuna, belirli bir sütundan başlayan yorum ekler (satır uzunsa en az iki boşluk). */
  const cm = (line, comment, col) => line.padEnd(Math.max(col || 60, line.length + 2)) + '// ' + comment;
  const doc = (text) => `/**\n * ${text}\n */\n`;
  const plain = (src) => src.replace(/^((?:import [^\n]+\n)*\n?)\/\*\*[\s\S]*?\*\/\n/, '$1');
  ST.plain = plain;
  const ind = (lines, n) => lines.map((l) => (l ? ' '.repeat(n) + l : l)).join('\n');

  const code = (ST.code = {});

  // ================================================================== dünya: dolap, paketler, kodlar
  /** Durum anahtarı → ekranda/konsolda görünen ad */
  ST.AD = { BOS: 'BOŞ', DOLU: 'DOLU', KILITLI: 'KİLİTLİ', HIZMET: 'HİZMET DIŞI' };
  /** Durum anahtarı → somut durum sınıfı */
  ST.SINIF = { BOS: 'BosDurum', DOLU: 'DoluDurum', KILITLI: 'KilitliDurum', HIZMET: 'HizmetDisiDurum' };
  ST.ISTEKLER = ['paketKoy', 'kodGir', 'gorevliAc'];

  ST.KOLI = {
    'KRG-1001': { ad: 'Ali', tam: 'Ali Şahin', kod: '4821', iyelik: 'Ali’nin' },
    'KRG-1005': { ad: 'Selin', tam: 'Selin Aydın', kod: '7356', iyelik: 'Selin’in' },
    'KRG-1006': { ad: 'Mert', tam: 'Mert Kaya', kod: '2694', iyelik: 'Mert’in' },
  };
  ST.KOLILER = Object.keys(ST.KOLI);
  /** Yabancının denediği kodlar (tezgâhta sırayla) */
  ST.YANLIS = ['1111', '2222', '3333', '5555', '6666', '8888', '9999', '1234'];
  ST.kisa = (koli) => koli.slice(4);
  /** Kodu kim giriyor? Bir paketin kodu ise sahibi, değilse yabancı. */
  ST.kimOf = function (kod) {
    const k = ST.KOLILER.find((x) => ST.KOLI[x].kod === kod);
    return k ? ST.KOLI[k].ad : 'yabancı';
  };

  // ------------------------------------------------------------------ istekler (oturum adımları)
  const P = (koli) => ({ t: 'koy', koli });
  const K = (kod) => ({ t: 'kod', kod });
  const G = { t: 'gorevli' };
  ST.op = { P, K, G };
  /** Sürüm 1.0: kilit yok — biri kodları sınırsız deniyor */
  ST.SENARYO_V1 = [P('KRG-1001'), K('1111'), K('2222'), K('3333'), K('5555'), K('4821')];
  /** Ana senaryo: üç hatalı kod, kilit, ikinci paket, görevli, Ali */
  ST.SENARYO = [P('KRG-1001'), K('1111'), K('2222'), K('3333'), P('KRG-1005'), G, K('4821')];
  /** Genişlet: görevli boş dolabı bakıma alır */
  ST.SENARYO_BAKIM = [G, P('KRG-1006'), G, P('KRG-1006'), K('2694')];

  // ================================================================== "Sorun": durum bir dizgi, her metotta if/else
  function dolapNaiveSrc(v2) {
    const kilitDal = v2
      ? `
        } else if (durum.equals("KİLİTLİ")) {
            System.out.println("  kilitli: görevli bekleniyor");`
      : '';
    const yanlis = v2
      ? `            hatali++;
            System.out.println("  hatalı kod (" + hatali + "/3)");
            if (hatali == 3) {
                durumDegistir("KİLİTLİ");
            }`
      : '            System.out.println("  hatalı kod");';
    const gorevli = v2
      ? `

    public void gorevliAc() {
        System.out.println("[" + durum + "] gorevliAc()");
        if (durum.equals("KİLİTLİ")) {
            hatali = 0;
            System.out.println("  görevli kilidi açtı");
            durumDegistir("DOLU");
        } else if (durum.equals("DOLU")) {
            System.out.println("  dolap kilitli değil");
        } else {
            System.out.println("  dolap boş · yapılacak iş yok");
        }
    }`
      : '';
    return `${doc(v2 ? 'Kargo dolabı: üç hatalı kodda kilitlenir. Durum hâlâ bir dizgi; her metot durumları if/else ile sorar.' : 'Kargo dolabı: durum bir dizgi; her metot durumu if/else ile kendisi sorar.')}public class KargoDolabi {

    private String durum = "BOŞ";
    private String paket;
    private String kod;${v2 ? '\n    private int hatali;' : ''}

    public void paketKoy(String koli, String kod) {
        System.out.println("[" + durum + "] paketKoy(" + koli + ")");
        if (durum.equals("DOLU")) {
            System.out.println("  dolu: " + koli + " konamadı");
${cm('        } else {', 'BOŞ ise', 52)}
            paket = koli;
            this.kod = kod;
            System.out.println("  " + koli + " kondu · kod SMS ile gönderildi");
            durumDegistir("DOLU");
        }
    }

    public void kodGir(String girilen) {
        System.out.println("[" + durum + "] kodGir(" + girilen + ")");
        if (durum.equals("BOŞ")) {
            System.out.println("  dolap boş");${kilitDal}
        } else if (girilen.equals(kod)) {
            System.out.println("  kapak açıldı: " + paket + " teslim edildi");
            paket = null;
            kod = null;${v2 ? '\n            hatali = 0;' : ''}
            durumDegistir("BOŞ");
        } else {
${yanlis}
        }
    }${gorevli}

    public String ozet() {
        return "Dolap: " + durum + " · paket: " + (paket == null ? "yok" : paket);
    }

    private void durumDegistir(String yeni) {
        System.out.println("  durum: " + durum + " → " + yeni);
        durum = yeni;
    }
}`;
  }
  code.KargoDolabiV1 = dolapNaiveSrc(false);
  code.KargoDolabiV2 = dolapNaiveSrc(true);

  // ================================================================== "Çözüm": durum nesneleri
  /** Her durumun her istekteki gövdesi (metot gövdesi, girintisiz) */
  const GOVDE = {
    BOS: {
      paketKoy: ['dolap.paketiYerlestir(koli, kod);', 'System.out.println("  " + koli + " kondu · kod SMS ile gönderildi");', 'dolap.durumDegistir(new DoluDurum());'],
      kodGir: ['System.out.println("  dolap boş");'],
      gorevliAc: ['System.out.println("  dolap boş · yapılacak iş yok");'],
    },
    DOLU: {
      paketKoy: ['System.out.println("  dolu: " + koli + " konamadı");'],
      kodGir: [
        'if (dolap.kodDogruMu(girilen)) {',
        '    String koli = dolap.paketiVer();',
        '    System.out.println("  kapak açıldı: " + koli + " teslim edildi");',
        '    dolap.durumDegistir(new BosDurum());',
        '} else {',
        '    int hatali = dolap.hataliArtir();',
        '    System.out.println("  hatalı kod (" + hatali + "/3)");',
        '    if (hatali == 3) {',
        '        dolap.durumDegistir(new KilitliDurum());',
        '    }',
        '}',
      ],
      gorevliAc: ['System.out.println("  dolap kilitli değil");'],
    },
    KILITLI: {
      paketKoy: ['System.out.println("  kilitli: " + koli + " konamadı");'],
      kodGir: ['System.out.println("  kilitli: görevli bekleniyor");'],
      gorevliAc: ['dolap.hatalariSifirla();', 'System.out.println("  görevli kilidi açtı");', 'dolap.durumDegistir(new DoluDurum());'],
    },
    HIZMET: {
      paketKoy: ['System.out.println("  hizmet dışı: " + koli + " konamadı");'],
      kodGir: ['System.out.println("  hizmet dışı: kapak açılmaz");'],
      gorevliAc: ['System.out.println("  bakım bitti · dolap hizmette");', 'dolap.durumDegistir(new BosDurum());'],
    },
  };
  /** Genişlet: BosDurum.gorevliAc dolabı bakıma alır */
  const BAKIMA_AL = ['System.out.println("  bakım için hizmet dışı bırakıldı");', 'dolap.durumDegistir(new HizmetDisiDurum());'];
  ST.GOVDE = GOVDE;
  const IMZA = {
    paketKoy: 'public void paketKoy(KargoDolabi dolap, String koli, String kod)',
    kodGir: 'public void kodGir(KargoDolabi dolap, String girilen)',
    gorevliAc: 'public void gorevliAc(KargoDolabi dolap)',
  };
  const ARAYUZ_IMZA = {
    paketKoy: 'void paketKoy(KargoDolabi dolap, String koli, String kod);',
    kodGir: 'void kodGir(KargoDolabi dolap, String girilen);',
    gorevliAc: 'void gorevliAc(KargoDolabi dolap);',
  };
  const DURUM_DOC = {
    BOS: '«ConcreteState» — Boş dolap: paketi kabul eder ve DOLU durumuna geçer.',
    DOLU: '«ConcreteState» — Dolu dolap: doğru kod kapağı açar; üçüncü hatalı kod dolabı kilitler.',
    KILITLI: '«ConcreteState» — Kilitli dolap: paket de kod da kabul etmez; yalnızca görevli açar.',
    HIZMET: '«ConcreteState» — Bakımdaki dolap: hiçbir isteği kabul etmez; görevli açınca hizmete döner.',
  };

  /** Arayüz: taşınan istekler + ad() */
  function arayuzSrc(tasinan, belge) {
    const uyeler = ST.ISTEKLER.filter((m) => tasinan.includes(m)).map((m) => '    ' + ARAYUZ_IMZA[m]);
    uyeler.push('    String ad();');
    return `${belge ? doc('«State» — Dolabın bir durumdaki davranışı: her istek için ne yapılacağını söyler.') : ''}public interface DolapDurumu {

${uyeler.join('\n\n')}
}`;
  }

  /** Somut durum sınıfı: taşınan isteklerin gövdeleri + ad(). o: {belge, bakim, eksik: metot adı (derleme hatası için)} */
  function durumSrc(key, tasinan, o) {
    o = o || {};
    const metotlar = ST.ISTEKLER.filter((m) => tasinan.includes(m) && m !== o.eksik).map((m) => {
      const govde = key === 'BOS' && m === 'gorevliAc' && o.bakim ? BAKIMA_AL : GOVDE[key][m];
      return `    @Override
    ${IMZA[m]} {
${ind(govde, 8)}
    }`;
    });
    metotlar.push(`    @Override
    public String ad() {
        return "${ST.AD[key]}";
    }`);
    return `${o.belge ? doc(DURUM_DOC[key]) : ''}public class ${ST.SINIF[key]} implements DolapDurumu {

${metotlar.join('\n\n')}
}`;
  }

  /** Bağlam: taşınmayan istekler hâlâ if/else (durum instanceof …), taşınanlar durum nesnesine devredilir */
  function dolapSrc(tasinan, belge) {
    const T = (m) => tasinan.includes(m);
    const istek = (ad, params, args) => `    public void ${ad}(${params}) {
        System.out.println("[" + durum.ad() + "] ${ad}(${args ? '" + ' + args + ' + "' : ''})");`;
    const paketKoy = T('paketKoy')
      ? `${istek('paketKoy', 'String koli, String kod', 'koli')}
        durum.paketKoy(this, koli, kod);
    }`
      : `${istek('paketKoy', 'String koli, String kod', 'koli')}
        if (durum instanceof DoluDurum) {
            System.out.println("  dolu: " + koli + " konamadı");
${cm('        } else {', 'BOŞ ise', 52)}
            paket = koli;
            this.kod = kod;
            System.out.println("  " + koli + " kondu · kod SMS ile gönderildi");
            durumDegistir(new DoluDurum());
        }
    }`;
    const kodGir = T('kodGir')
      ? `${istek('kodGir', 'String girilen', 'girilen')}
        durum.kodGir(this, girilen);
    }`
      : `${istek('kodGir', 'String girilen', 'girilen')}
        if (durum instanceof BosDurum) {
            System.out.println("  dolap boş");
        } else if (durum instanceof KilitliDurum) {
            System.out.println("  kilitli: görevli bekleniyor");
        } else if (girilen.equals(kod)) {
            System.out.println("  kapak açıldı: " + paket + " teslim edildi");
            paket = null;
            kod = null;
            hatali = 0;
            durumDegistir(new BosDurum());
        } else {
            hatali++;
            System.out.println("  hatalı kod (" + hatali + "/3)");
            if (hatali == 3) {
                durumDegistir(new KilitliDurum());
            }
        }
    }`;
    const gorevliAc = T('gorevliAc')
      ? `${istek('gorevliAc', '', '')}
        durum.gorevliAc(this);
    }`
      : `${istek('gorevliAc', '', '')}
        if (durum instanceof KilitliDurum) {
            hatali = 0;
            System.out.println("  görevli kilidi açtı");
            durumDegistir(new DoluDurum());
        } else if (durum instanceof DoluDurum) {
            System.out.println("  dolap kilitli değil");
        } else {
            System.out.println("  dolap boş · yapılacak iş yok");
        }
    }`;
    // durum nesnelerinin kullandığı işlemler: hangi istek taşındıysa onunkiler
    const paketIci = tasinan.length > 0;
    const yardimci = [
      `    ${paketIci ? '' : 'private '}void durumDegistir(DolapDurumu yeni) {
        System.out.println("  durum: " + durum.ad() + " → " + yeni.ad());
        durum = yeni;
    }`,
    ];
    if (T('paketKoy'))
      yardimci.push(`    void paketiYerlestir(String koli, String kod) {
        paket = koli;
        this.kod = kod;
    }`);
    if (T('kodGir'))
      yardimci.push(
        `    boolean kodDogruMu(String girilen) {
        return girilen.equals(kod);
    }`,
        `    String paketiVer() {
        String verilen = paket;
        paket = null;
        kod = null;
        hatali = 0;
        return verilen;
    }`,
        `    int hataliArtir() {
        return ++hatali;
    }`
      );
    if (T('gorevliAc'))
      yardimci.push(`    void hatalariSifirla() {
        hatali = 0;
    }`);
    return `${belge ? doc('«Context» — Kargo dolabı: istemcinin tanıdığı sınıf; her isteği o anki durum nesnesine devreder.') : ''}public class KargoDolabi {

    private DolapDurumu durum = new BosDurum();
    private String paket;
    private String kod;
    private int hatali;

${paketKoy}

${kodGir}

${gorevliAc}

    public String ozet() {
        return "Dolap: " + durum.ad() + " · paket: " + (paket == null ? "yok" : paket);
    }
${paketIci ? '\n    // ---- durum nesnelerinin kullandığı işlemler (paket içi erişim)\n' : ''}
${yardimci.join('\n\n')}
}`;
  }

  const HEPSI = ST.ISTEKLER;
  code.KargoDolabi = dolapSrc(HEPSI, true);
  code.DolapDurumu = arayuzSrc(HEPSI, true);
  code.BosDurum = durumSrc('BOS', HEPSI, { belge: true });
  code.DoluDurum = durumSrc('DOLU', HEPSI, { belge: true });
  code.KilitliDurum = durumSrc('KILITLI', HEPSI, { belge: true });
  code.BosDurumBakim = durumSrc('BOS', HEPSI, { belge: true, bakim: true });
  code.HizmetDisiDurum = durumSrc('HIZMET', HEPSI, { belge: true });

  // ================================================================== programlar (Main üreticisi)
  /** Program: {design: 'v1'|'naive'|'durum', bakim: bool (yalnızca durum), ops: [istek]} */
  function satir(op) {
    if (op.t === 'koy') {
      const k = ST.KOLI[op.koli];
      return cm(`        dolap.paketKoy("${op.koli}", "${k.kod}");`, `kurye · ${k.iyelik} paketi`, 48);
    }
    if (op.t === 'kod') return cm(`        dolap.kodGir("${op.kod}");`, ST.kimOf(op.kod), 48);
    return cm('        dolap.gorevliAc();', 'şube görevlisi', 48);
  }
  ST.satir = satir;

  function mainSrc(ops) {
    const L = ['        KargoDolabi dolap = new KargoDolabi();'];
    if (ops.length) L.push('');
    ops.forEach((op) => L.push(satir(op)));
    L.push('        System.out.println(dolap.ozet());');
    return `public class Main {

    public static void main(String[] args) {
${L.join('\n')}
    }
}`;
  }
  ST.mainFor = mainSrc;

  /** Programın bütün dosyaları */
  ST.filesFor = function (prog) {
    const F = { Main: mainSrc(prog.ops) };
    if (prog.design === 'v1') F.KargoDolabi = code.KargoDolabiV1;
    else if (prog.design === 'naive') F.KargoDolabi = code.KargoDolabiV2;
    else {
      F.KargoDolabi = code.KargoDolabi;
      F.DolapDurumu = code.DolapDurumu;
      F.BosDurum = prog.bakim ? code.BosDurumBakim : code.BosDurum;
      F.DoluDurum = code.DoluDurum;
      F.KilitliDurum = code.KilitliDurum;
      if (prog.bakim) F.HizmetDisiDurum = code.HizmetDisiDurum;
    }
    return F;
  };
  ST.fileOrder = ['Main', 'KargoDolabi', 'DolapDurumu', 'BosDurum', 'DoluDurum', 'KilitliDurum', 'HizmetDisiDurum'];
  ST.fileList = (F, order) => (order || ST.fileOrder).filter((n) => F[n]).map((n) => ({ name: n + '.java', code: F[n] }));

  // ================================================================== çalıştırma benzetimi (Java ile birebir)
  /**
   * Programı adım adım çalıştırır. Dönüş: {lines, olaylar, son}
   *   lines : [{t, k: 'istek'|'cevap'|'red'|'hata'|'gecis'|'ozet', i: istek no}]
   *   olaylar: ince taneli olaylar (sahne ve Canlı Akış için): {e, istek, n: o ana kadarki satır sayısı, s: anlık durum, ...}
   *   Fiziksel dünya da izlenir: dolabın içi (icerik), kuryede kalanlar, teslim edilenler — kalıpsız sürümde
   *   kayıt (paket) ile dolabın içi ayrışabilir.
   */
  ST.run = function (prog) {
    const v1 = prog.design === 'v1';
    const naive = v1 || prog.design === 'naive';
    const bakim = !naive && !!prog.bakim;
    const AD = ST.AD;
    let durum = 'BOS';
    let paket = null;
    let kod = null;
    let hatali = 0;
    let nesne = naive ? 0 : 1;
    let gecis = 0;
    let kilitliKoy = 0;
    const icerik = [];
    const kuryede = [];
    const teslim = [];
    const lines = [];
    const olaylar = [];
    let istek = -1;

    const snap = () => ({
      durum,
      paket,
      kod,
      hatali,
      icerik: icerik.slice(),
      kuryede: kuryede.slice(),
      teslim: teslim.map((x) => Object.assign({}, x)),
      nesne,
      gecis,
      kilitliKoy,
    });
    const out = (t, k) => lines.push({ t, k, i: istek });
    const olay = (e, x) => olaylar.push(Object.assign({ e, istek, n: lines.length }, x || {}, { s: snap() }));
    const yeni = (to) => {
      if (!naive) {
        nesne++;
        olay('yeni', { to });
      }
    };
    const gec = (to) => {
      const from = durum;
      out(`  durum: ${AD[from]} → ${AD[to]}`, 'gecis');
      durum = to;
      gecis++;
      olay('gecis', { from, to });
    };
    const yerlestir = (koli) => {
      paket = koli;
      kod = ST.KOLI[koli].kod;
      icerik.push(koli);
      const i = kuryede.indexOf(koli);
      if (i >= 0) kuryede.splice(i, 1);
    };
    const reddet = (koli, metin) => {
      out(metin, 'red');
      if (!kuryede.includes(koli)) kuryede.push(koli);
      olay('cevap', { tip: 'red' });
    };
    const ver = (girilen) => {
      const koli = paket;
      icerik.splice(icerik.indexOf(koli), 1);
      teslim.push({ koli, kime: ST.kimOf(girilen) });
      paket = null;
      kod = null;
      hatali = 0;
      return koli;
    };
    const bilgi = (metin) => {
      out(metin, 'red');
      olay('cevap', { tip: 'bilgi' });
    };

    prog.ops.forEach((op, k) => {
      istek = k;
      const once = durum;
      if (op.t === 'koy') {
        out(`[${AD[durum]}] paketKoy(${op.koli})`, 'istek');
        olay('istek', { op, durum: once });
        if (naive) {
          if (durum === 'DOLU') return reddet(op.koli, `  dolu: ${op.koli} konamadı`);
          // else dalı: BOŞ sanılır (KİLİTLİ de buraya düşer)
          const hata = durum === 'KILITLI';
          if (hata) kilitliKoy++;
          yerlestir(op.koli);
          out(`  ${op.koli} kondu · kod SMS ile gönderildi`, hata ? 'hata' : 'cevap');
          olay('cevap', { tip: hata ? 'hata' : 'ok', koli: op.koli });
          return gec('DOLU');
        }
        olay('devret', { durum: once });
        if (durum !== 'BOS') {
          const ne = { DOLU: 'dolu', KILITLI: 'kilitli', HIZMET: 'hizmet dışı' }[durum];
          return reddet(op.koli, `  ${ne}: ${op.koli} konamadı`);
        }
        yerlestir(op.koli);
        olay('yerlestir', { koli: op.koli });
        out(`  ${op.koli} kondu · kod SMS ile gönderildi`, 'cevap');
        olay('cevap', { tip: 'ok', koli: op.koli });
        yeni('DOLU');
        return gec('DOLU');
      }

      if (op.t === 'kod') {
        out(`[${AD[durum]}] kodGir(${op.kod})`, 'istek');
        olay('istek', { op, durum: once });
        if (!naive) olay('devret', { durum: once });
        if (durum === 'BOS') return bilgi('  dolap boş');
        if (durum === 'KILITLI') return bilgi('  kilitli: görevli bekleniyor');
        if (durum === 'HIZMET') return bilgi('  hizmet dışı: kapak açılmaz');
        // DOLU
        const dogru = op.kod === kod;
        if (!naive) olay('kodDogruMu', { sonuc: dogru });
        if (dogru) {
          const koli = ver(op.kod);
          if (!naive) olay('paketiVer', { koli, kime: ST.kimOf(op.kod) });
          out(`  kapak açıldı: ${koli} teslim edildi`, 'cevap');
          olay('cevap', { tip: 'ok', koli, kime: ST.kimOf(op.kod) });
          yeni('BOS');
          return gec('BOS');
        }
        if (v1) return bilgi('  hatalı kod');
        hatali++;
        if (!naive) olay('hataliArtir', { hatali });
        out(`  hatalı kod (${hatali}/3)`, hatali > 3 ? 'hata' : 'red');
        olay('cevap', { tip: hatali > 3 ? 'hata' : 'red', hatali });
        if (hatali === 3) {
          yeni('KILITLI');
          gec('KILITLI');
        }
        return;
      }

      // görevli
      out(`[${AD[durum]}] gorevliAc()`, 'istek');
      olay('istek', { op, durum: once });
      if (!naive) olay('devret', { durum: once });
      if (durum === 'KILITLI') {
        hatali = 0;
        if (!naive) olay('sifirla');
        out('  görevli kilidi açtı', 'cevap');
        olay('cevap', { tip: 'ok' });
        yeni('DOLU');
        return gec('DOLU');
      }
      if (durum === 'DOLU') return bilgi('  dolap kilitli değil');
      if (durum === 'HIZMET') {
        out('  bakım bitti · dolap hizmette', 'cevap');
        olay('cevap', { tip: 'ok' });
        yeni('BOS');
        return gec('BOS');
      }
      if (bakim) {
        out('  bakım için hizmet dışı bırakıldı', 'cevap');
        olay('cevap', { tip: 'ok' });
        yeni('HIZMET');
        return gec('HIZMET');
      }
      return bilgi('  dolap boş · yapılacak iş yok');
    });
    istek = -1;
    out(`Dolap: ${AD[durum]} · paket: ${paket === null ? 'yok' : paket}`, 'ozet');
    olay('ozet');
    const son = olaylar[olaylar.length - 1].s;
    son.kayip = son.icerik.filter((x) => x !== son.paket);
    return { lines, olaylar, son };
  };
  ST.outputOf = (prog) => ST.run(prog).lines.map((l) => l.t);

  // ================================================================== "Sorun" sürümleri
  ST.NV = {
    v1: { design: 'v1', ops: ST.SENARYO_V1 },
    v2: { design: 'naive', ops: ST.SENARYO },
  };
  ST.naiveFiles = (v) => ST.filesFor(ST.NV[v]);

  // ================================================================== çözüm ve adım adım yeniden düzenleme
  ST.COZUM = { design: 'durum', ops: ST.SENARYO };
  code.Main = mainSrc(ST.SENARYO);
  ST.output = ST.outputOf(ST.COZUM);
  /** Adım adım: önce durumlar nesne olur (yalnızca ad()), sonra istekler birer birer durum sınıflarına taşınır */
  const araDosyalar = (tasinan) => ({
    Main: code.Main,
    KargoDolabi: dolapSrc(tasinan, false),
    DolapDurumu: arayuzSrc(tasinan, false),
    BosDurum: durumSrc('BOS', tasinan),
    DoluDurum: durumSrc('DOLU', tasinan),
    KilitliDurum: durumSrc('KILITLI', tasinan),
  });
  ST.refactor = [ST.naiveFiles('v2'), araDosyalar([]), araDosyalar(['paketKoy']), araDosyalar(['paketKoy', 'kodGir']), araDosyalar(HEPSI)];
  ST.refactorProgs = [ST.NV.v2, ST.NV.v2, ST.COZUM, ST.COZUM, ST.COZUM];
  ST.refactorOrder = ['Main', 'KargoDolabi', 'DolapDurumu', 'BosDurum', 'DoluDurum', 'KilitliDurum'];
  /** Bağlamdaki durum sorguları: if (durum.equals(…)) ya da durum instanceof … */
  ST.kosulSayisi = (src) => (src.match(/durum\.equals\(|durum instanceof /g) || []).length;

  // ================================================================== Canlı Akış
  ST.presets = {
    kilit: { key: 'kilit', title: 'Kilit ve görevli', prog: { design: 'durum', ops: ST.SENARYO } },
    teslim: { key: 'teslim', title: 'Dolu dolaba ikinci paket', prog: { design: 'durum', ops: [P('KRG-1006'), P('KRG-1005'), K('2694')] } },
  };
  ST.presetOrder = ['kilit', 'teslim'];
  ST.akisFiles = (p) => ST.fileList(ST.filesFor(p.prog));
  ST.akisOutput = (p) => ST.outputOf(p.prog);

  // ================================================================== Dolap tezgâhı
  /** Oturum: {design: 'naive'|'durum', bakim: bool, ops: [istek]} */
  ST.tezgahProg = (tz) => ({ design: tz.design, bakim: tz.design === 'durum' && !!tz.bakim, ops: tz.ops });
  ST.tezgahFiles = (tz) => ST.filesFor(ST.tezgahProg(tz));
  /** Bir istek bu oturumda yapılabilir mi? (kurye dolaptaki ya da teslim edilmiş paketi yeniden koyamaz) */
  ST.uygun = function (s, op) {
    if (op.t === 'koy') return !s.icerik.includes(op.koli) && !s.teslim.some((x) => x.koli === op.koli);
    return true;
  };
  /** Sıradaki yanlış kod: oturumda kaç yanlış kod denendiyse */
  ST.siradakiYanlis = (ops) => ST.YANLIS[ops.filter((op) => op.t === 'kod' && ST.kimOf(op.kod) === 'yabancı').length % ST.YANLIS.length];
  ST.olc = function (tz) {
    const prog = ST.tezgahProg(tz);
    const r = ST.run(prog);
    const F = ST.filesFor(prog);
    return {
      run: r,
      istek: tz.ops.length,
      gecis: r.son.gecis,
      nesne: r.son.nesne,
      kosul: ST.kosulSayisi(F.KargoDolabi),
      kilitliKoy: r.son.kilitliKoy,
      kayip: r.son.kayip,
    };
  };

  // ================================================================== Genişlet: HİZMET DIŞI durumu
  const EX = (ST.ext = {});
  EX.exercise = `public class HizmetDisiDurum implements ⟦1⟧ {

    @Override
    ${IMZA.paketKoy} {
        System.out.println("  hizmet dışı: " + koli + " konamadı");
    }

    @Override
    ${IMZA.kodGir} {
        System.out.println("  hizmet dışı: kapak açılmaz");
    }

    @Override
    ${IMZA.gorevliAc} {
        System.out.println("  bakım bitti · dolap hizmette");
        dolap.⟦2⟧(new ⟦3⟧());
    }

    @Override
    public String ad() {
        return "HİZMET DIŞI";
    }
}`;
  EX.exerciseBos = `// BosDurum.java: değişen tek metot
@Override
${IMZA.gorevliAc} {
    System.out.println("  bakım için hizmet dışı bırakıldı");
    dolap.durumDegistir(new ⟦4⟧());
}`;
  EX.answers = { 1: 'DolapDurumu', 2: 'durumDegistir', 3: 'BosDurum', 4: 'HizmetDisiDurum' };
  EX.prog = { design: 'durum', bakim: true, ops: ST.SENARYO_BAKIM };
  EX.Main = mainSrc(EX.prog.ops);
  EX.output = ST.outputOf(EX.prog);
  /** Bir metodu unutan HizmetDisiDurum: javac hatası (Java 21 ile alındı; satır/sütun dosyadan hesaplanır) */
  EX.eksikSrc = durumSrc('HIZMET', HEPSI, { eksik: 'gorevliAc' });
  EX.eksikHata = (function () {
    const satirNo = ST.lineOf(EX.eksikSrc, 'public class HizmetDisiDurum');
    const L = EX.eksikSrc.split('\n')[satirNo - 1];
    return [
      `HizmetDisiDurum.java:${satirNo}: error: HizmetDisiDurum is not abstract and does not override abstract method gorevliAc(KargoDolabi) in DolapDurumu`,
      L,
      ' '.repeat(L.indexOf('class')) + '^',
      '1 error',
    ];
  })();

  // ================================================================== Gerçek dünya (JDK) örnekleri
  const RW = (ST.rw = {});
  /** Seçeneğin satırı: yorum, koddaki öbür yorumlarla aynı sütunda */
  const rwArg = (stmt, comment, col) => cm('            ' + stmt, comment, col || 52).slice(12);

  RW.tcp = (arg) => `import java.io.IOException;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.SocketAddress;

public class TcpBaglantisi {

    public static void main(String[] args) throws IOException {
        InetAddress yerel = InetAddress.getLoopbackAddress();
        try (ServerSocket sunucu = new ServerSocket(0, 1, yerel)) {
            SocketAddress adres = sunucu.getLocalSocketAddress();
            Socket soket = new Socket();
            ${arg}
            try {
${cm('                soket.getOutputStream().write(1);', 'aynı istek', 52)}
                System.out.println("yazıldı · " + durum(soket));
            } catch (IOException e) {
                System.out.println(e.getMessage() + " · " + durum(soket));
            }
            soket.close();
        }
    }

    static String durum(Socket s) {
        return "bağlı: " + s.isConnected() + " · kapalı: " + s.isClosed();
    }
}`;
  RW.tcpOpts = [
    { label: 'Bağlanmadan', arg: '// connect() çağrılmadı: durum = bağlı değil', out: ['Socket is not connected · bağlı: false · kapalı: false'] },
    { label: 'Bağlandı', arg: rwArg('soket.connect(adres);', 'durum: bağlı'), out: ['yazıldı · bağlı: true · kapalı: false'] },
    { label: 'Kapatıldı', arg: rwArg('soket.close();', 'durum: kapalı'), out: ['Socket is closed · bağlı: false · kapalı: true'] },
  ];

  RW.enumDurum = (arg) => `public class EnumDolap {

    enum Durum {
        BOS {
            @Override
            Durum kodGir(boolean dogru) {
                System.out.println("  dolap boş");
                return this;
            }
        },
        DOLU {
            @Override
            Durum kodGir(boolean dogru) {
                System.out.println(dogru ? "  kapak açıldı" : "  hatalı kod");
                return dogru ? BOS : this;
            }
        },
        KILITLI {
            @Override
            Durum kodGir(boolean dogru) {
                System.out.println("  kilitli: görevli bekleniyor");
                return this;
            }
        };

        abstract Durum kodGir(boolean dogru);
    }

    public static void main(String[] args) {
        ${arg}
        System.out.println(d + " · sınıfı: " + d.getClass().getName());
        Durum sonra = d.kodGir(true);
        System.out.println("şimdi: " + sonra + " · tek nesne mi? " + (sonra == Durum.valueOf(sonra.name())));
    }
}`;
  RW.enumOpts = [
    { label: 'BOS', arg: 'Durum d = Durum.BOS;', out: ['BOS · sınıfı: EnumDolap$Durum$1', '  dolap boş', 'şimdi: BOS · tek nesne mi? true'] },
    { label: 'DOLU', arg: 'Durum d = Durum.DOLU;', out: ['DOLU · sınıfı: EnumDolap$Durum$2', '  kapak açıldı', 'şimdi: BOS · tek nesne mi? true'] },
    { label: 'KILITLI', arg: 'Durum d = Durum.KILITLI;', out: ['KILITLI · sınıfı: EnumDolap$Durum$3', '  kilitli: görevli bekleniyor', 'şimdi: KILITLI · tek nesne mi? true'] },
  ];

  RW.thread = (arg) => `public class IsParcacigi {

    public static void main(String[] args) throws InterruptedException {
        Runnable is = () -> System.out.println("  tarandı: KRG-1001");
        Thread tarayici = new Thread(is);
        System.out.println("önce: " + tarayici.getState());
        ${arg}
        System.out.println("sonra: " + tarayici.getState());
    }
}`;
  const thArg = (stmt, comment) => cm('        ' + stmt, comment, 52).slice(8);
  RW.threadOpts = [
    { label: 'start()', arg: thArg('tarayici.start(); tarayici.join();', 'NEW → TERMINATED'), out: ['önce: NEW', '  tarandı: KRG-1001', 'sonra: TERMINATED'] },
    { label: 'run()', arg: thArg('tarayici.run();', 'yeni iş parçacığı yok'), out: ['önce: NEW', '  tarandı: KRG-1001', 'sonra: NEW'] },
    {
      label: 'İki kez start()',
      arg: 'tarayici.start(); tarayici.join(); tarayici.start();',
      out: ['önce: NEW', '  tarandı: KRG-1001', 'Exception in thread "main" java.lang.IllegalThreadStateException', '\tat java.base/java.lang.Thread.start(Thread.java:1525)', '\tat IsParcacigi.main(IsParcacigi.java:7)'],
    },
  ];

  // ================================================================== UML sınıf diyagramları
  const Mb = {
    durum: { id: 'durum', text: '- durum: DolapDurumu', generic: '- state: State' },
    durumStr: { id: 'durum', text: '- durum: String' },
    veri: { id: 'veri', text: '- paket, kod · hatali', generic: '- data' },
    paketKoy: { id: 'paketKoy', text: '+ paketKoy(koli, kod)', generic: '+ request1()' },
    kodGir: { id: 'kodGir', text: '+ kodGir(kod)', generic: '+ request2()' },
    gorevliAc: { id: 'gorevliAc', text: '+ gorevliAc()', generic: '+ request3()' },
    durumDegistir: { id: 'durumDegistir', text: '~ durumDegistir(d)', generic: '~ changeState(s)', factory: true },
    sPaketKoy: { id: 'paketKoy', text: '+ paketKoy(dolap, koli, kod)', generic: '+ handle1(context)', abstract: true },
    sKodGir: { id: 'kodGir', text: '+ kodGir(dolap, kod)', generic: '+ handle2(context)', abstract: true },
    sGorevliAc: { id: 'gorevliAc', text: '+ gorevliAc(dolap)', generic: '+ handle3(context)', abstract: true },
    sAd: { id: 'ad', text: '+ ad(): String', generic: '+ name()', abstract: true },
  };
  ST.members = Mb;
  /** Somut durumun üyeleri: taşınan istekler (kısa) + ad() */
  const durumUyeleri = (tasinan) =>
    ST.ISTEKLER.filter((m) => tasinan.includes(m))
      .map((m) => ({ id: m, text: `+ ${m}(…)`, generic: `+ handle${ST.ISTEKLER.indexOf(m) + 1}(context)` }))
      .concat([{ id: 'ad', text: '+ ad()', generic: '+ name()' }]);
  const GEN = { BOS: 'ConcreteStateA', DOLU: 'ConcreteStateB', KILITLI: 'ConcreteStateC', HIZMET: 'ConcreteStateD' };
  const box = {
    Main: (x, y) => ({ id: 'Main', name: 'Main', generic: 'Client', kind: 'class', role: 'client', x, y, w: 200, members: [{ id: 'main', text: '+ main(args)', generic: '+ main()' }] }),
    KargoDolabi: (x, y) => ({ id: 'KargoDolabi', name: 'KargoDolabi', generic: 'Context', kind: 'class', role: 'context', x, y, w: 290, members: [Mb.durum, Mb.veri, Mb.paketKoy, Mb.kodGir, Mb.gorevliAc, Mb.durumDegistir] }),
    DolapDurumu: (x, y, tasinan) => {
      const t = tasinan || HEPSI;
      const m = [];
      if (t.includes('paketKoy')) m.push(Mb.sPaketKoy);
      if (t.includes('kodGir')) m.push(Mb.sKodGir);
      if (t.includes('gorevliAc')) m.push(Mb.sGorevliAc);
      m.push(Mb.sAd);
      return { id: 'DolapDurumu', name: 'DolapDurumu', generic: 'State', kind: 'interface', role: 'state', x, y, w: 300, members: m };
    },
    durum: (key, x, y, o) => ({ id: ST.SINIF[key], name: ST.SINIF[key], generic: GEN[key], kind: 'class', role: 'concreteState', x, y, w: o && o.w ? o.w : 200, noTag: !!(o && o.noTag), members: durumUyeleri((o && o.tasinan) || HEPSI) }),
  };
  ST.box = box;

  /** GoF yapısı (Yapı sahnesi, Canlı Akış, özet). o.notes: devretme ve geçiş notları; o.bakim: HizmetDisiDurum */
  ST.gofDiagram = function (o) {
    o = o || {};
    const w = o.bakim ? 180 : 200;
    const xs = o.bakim ? [360, 555, 750, 945] : [360, 590, 820];
    const keys = o.bakim ? ['BOS', 'DOLU', 'KILITLI', 'HIZMET'] : ['BOS', 'DOLU', 'KILITLI'];
    const classes = [box.KargoDolabi(20, 40), box.DolapDurumu(450, 40), box.Main(20, 420)];
    keys.forEach((k, i) => classes.push(box.durum(k, xs[i], 300, { w, noTag: i > 0 })));
    const relations = [
      { id: 'durum', from: 'KargoDolabi', to: 'DolapDurumu', type: 'aggregation', label: 'durum', genericLabel: 'state', fromSide: 'right', fromAt: 100, toSide: 'left', toAt: 100 },
      { id: 'c-main', from: 'Main', to: 'KargoDolabi', type: 'dependency', label: '«create»', fromSide: 'top', fromAt: 70, toSide: 'bottom', toAt: 70 },
    ];
    keys.forEach((k, i) => relations.push({ id: 'r-' + k, from: ST.SINIF[k], to: 'DolapDurumu', type: 'realization', fromSide: 'top', fromAt: xs[i] + w / 2, toSide: 'bottom', toAt: 600, mid: 256 }));
    const notes = o.notes
      ? [
          { id: 'n-devret', x: 100, y: 252, text: 'her istek devredilir:\ndurum.kodGir(this, girilen);', genericText: 'request → handle:\nstate.handle2(this);', target: 'KargoDolabi', from: 'top', to: 'bottom', toAt: 230 },
          { id: 'n-gecis', x: 790, y: 40, text: 'geçişi durumlar yapar:\ndolap.durumDegistir(\n    new KilitliDurum());', genericText: 'state decides the next:\ncontext.changeState(\n    new ConcreteStateC());', target: 'DolapDurumu', from: 'left', to: 'right', toAt: 90 },
        ]
      : [];
    return { width: 1100, height: 560, title: 'State sınıf diyagramı', classes, relations, notes };
  };

  /**
   * "Çözüm" sahnesinin her adımındaki diyagram.
   * 0: tek sınıf, durum bir dizgi · 1: durumlar nesne (yalnızca ad()) · 2–4: istekler birer birer taşınır · 5: sonuç
   */
  ST.solutionDiagram = function (st) {
    const tasinan = [[], [], ['paketKoy'], ['paketKoy', 'kodGir'], HEPSI, HEPSI][st];
    const classes = [];
    const relations = [];
    const D = box.KargoDolabi(20, 40);
    if (st === 0) D.members = [Mb.durumStr, Mb.veri, { id: 'paketKoy', text: '+ paketKoy() · if/else' }, { id: 'kodGir', text: '+ kodGir() · if/else' }, { id: 'gorevliAc', text: '+ gorevliAc() · if/else' }, { id: 'durumDegistir', text: '- durumDegistir(String)' }];
    else
      D.members = [
        Mb.durum,
        Mb.veri,
        tasinan.includes('paketKoy') ? Mb.paketKoy : { id: 'paketKoy', text: '+ paketKoy() · if/else' },
        tasinan.includes('kodGir') ? Mb.kodGir : { id: 'kodGir', text: '+ kodGir() · if/else' },
        tasinan.includes('gorevliAc') ? Mb.gorevliAc : { id: 'gorevliAc', text: '+ gorevliAc() · if/else' },
        tasinan.length ? Mb.durumDegistir : { id: 'durumDegistir', text: '- durumDegistir(d)' },
      ];
    classes.push(D, box.Main(20, 420));
    relations.push({ id: 'c-main', from: 'Main', to: 'KargoDolabi', type: 'dependency', label: '«create»', fromSide: 'top', fromAt: 70, toSide: 'bottom', toAt: 70 });
    if (st >= 1) {
      const xs = [360, 590, 820];
      classes.push(box.DolapDurumu(450, 40, tasinan));
      ['BOS', 'DOLU', 'KILITLI'].forEach((k, i) => classes.push(box.durum(k, xs[i], 300, { tasinan, noTag: i > 0 })));
      relations.push({ id: 'durum', from: 'KargoDolabi', to: 'DolapDurumu', type: 'aggregation', label: 'durum', fromSide: 'right', fromAt: 100, toSide: 'left', toAt: 100 });
      ['BOS', 'DOLU', 'KILITLI'].forEach((k, i) => relations.push({ id: 'r-' + k, from: ST.SINIF[k], to: 'DolapDurumu', type: 'realization', fromSide: 'top', fromAt: xs[i] + 100, toSide: 'bottom', toAt: 600, mid: 256 }));
    }
    return { width: 1040, height: 520, view: [0, 0, 1040, 510], classes, relations };
  };

  // ------------------------------------------------------------------ UML sıralama diyagramı (Canlı Akış)
  /**
   * Akış adımlarıyla aynı sırada mesajlar; olay listesinden üretilir. Her istek kendi küçük diyagramıdır
   * (bölüm): Main, dolap, o anki durum nesnesi ve geçişte yaratılan yeni durum nesnesi.
   * Dönüş: {bolumler: [{spec, msgOf}], run}  — msgOf: {anahtar: mesaj no}
   */
  ST.seqSpec = function (p) {
    const r = ST.run(p.prog);
    const bolumler = [];
    const W = 900;
    const rowH = 34;
    const yap = (parts, messages, msgOf, baslik) => {
      parts.forEach((pp, i) => (pp.x = 80 + (i * (W - 160)) / Math.max(1, parts.length - 1)));
      const h = 118 + messages.length * rowH + 40;
      return { spec: { width: W, height: Math.max(h, 300), top: 118, margin: 80, rowH, participants: parts, messages, initialActive: ['main'] }, msgOf, baslik };
    };
    const ad = (key) => ({ BOS: 'b', DOLU: 'd', KILITLI: 'k', HIZMET: 'h' })[key];
    const durumP = (key, id) => ({ id: id || 'd0', label: `${ad(key)}\n: ${ST.SINIF[key]}`, role: 'concreteState', object: true });

    // kurulum: Main → dolap «create», dolap → BosDurum «create»
    bolumler.push(
      yap(
        [{ id: 'main', label: 'Main', role: 'client' }, { id: 'dolap', label: 'dolap\n: KargoDolabi', role: 'context', object: true }, durumP('BOS')],
        [
          { from: 'main', to: 'dolap', kind: 'create', label: '«create»' },
          { from: 'dolap', to: 'd0', kind: 'create', label: '«create» (alan ilk değeri)' },
        ],
        { kurulum: 0, ilk: 1 },
        'Kurulum'
      )
    );
    // istek başına
    let cur = 'BOS';
    p.prog.ops.forEach((op, k) => {
      const O = r.olaylar.filter((o) => o.istek === k);
      const parts = [{ id: 'main', label: 'Main', role: 'client' }, { id: 'dolap', label: 'dolap\n: KargoDolabi', role: 'context', object: true }, durumP(cur)];
      const messages = [];
      const msgOf = {};
      const add = (key, m) => {
        msgOf[key] = messages.length;
        messages.push(m);
      };
      const cagri = op.t === 'koy' ? `paketKoy(${ST.kisa(op.koli)}, ${ST.KOLI[op.koli].kod})` : op.t === 'kod' ? `kodGir(${op.kod})` : 'gorevliAc()';
      const devret = op.t === 'koy' ? `paketKoy(this, ${ST.kisa(op.koli)}, …)` : op.t === 'kod' ? `kodGir(this, ${op.kod})` : 'gorevliAc(this)';
      add('istek', { from: 'main', to: 'dolap', kind: 'call', label: cagri });
      O.forEach((o) => {
        if (o.e === 'devret') add('devret', { from: 'dolap', to: 'd0', kind: 'call', label: devret });
        else if (o.e === 'yerlestir') add('yerlestir', { from: 'd0', to: 'dolap', kind: 'call', short: true, label: `paketiYerlestir(${ST.kisa(o.koli)}, …)` });
        else if (o.e === 'kodDogruMu') add('kodDogruMu', { from: 'd0', to: 'dolap', kind: 'call', short: true, label: `kodDogruMu(${op.kod}) → ${o.sonuc}` });
        else if (o.e === 'paketiVer') add('paketiVer', { from: 'd0', to: 'dolap', kind: 'call', short: true, label: `paketiVer() → ${ST.kisa(o.koli)}` });
        else if (o.e === 'hataliArtir') add('hataliArtir', { from: 'd0', to: 'dolap', kind: 'call', short: true, label: `hataliArtir() → ${o.hatali}` });
        else if (o.e === 'sifirla') add('sifirla', { from: 'd0', to: 'dolap', kind: 'call', short: true, label: 'hatalariSifirla()' });
        else if (o.e === 'yeni') {
          parts.push(durumP(o.to, 'd1'));
          add('yeni', { from: 'd0', to: 'd1', kind: 'create', label: '«create»' });
        } else if (o.e === 'gecis') add('gecis', { from: 'd0', to: 'dolap', kind: 'call', short: true, label: `durumDegistir(${ad(o.to)})` });
      });
      add('ret', { from: 'd0', to: 'dolap', kind: 'return', label: '' });
      add('retm', { from: 'dolap', to: 'main', kind: 'return', label: '' });
      const g = O.find((o) => o.e === 'gecis');
      if (g) cur = g.to;
      bolumler.push(yap(parts, messages, msgOf, `${k + 1}. istek · ${cagri}`));
    });
    // özet
    bolumler.push(
      yap(
        [{ id: 'main', label: 'Main', role: 'client' }, { id: 'dolap', label: 'dolap\n: KargoDolabi', role: 'context', object: true }, durumP(cur)],
        [
          { from: 'main', to: 'dolap', kind: 'call', label: 'ozet()' },
          { from: 'dolap', to: 'd0', kind: 'call', short: true, label: `ad() → "${ST.AD[cur]}"` },
          { from: 'dolap', to: 'main', kind: 'return', label: '' },
        ],
        { ozet: 0, ad: 1, ret: 2 },
        'Sonuç · ozet()'
      )
    );
    return { bolumler, run: r };
  };
})();
