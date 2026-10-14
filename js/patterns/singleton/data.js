/*
 * Singleton — veri: Java kodları, çıktılar, roller, diyagram tanımları, thread yarışı senaryoları.
 * Bu dosya DOM kullanmaz; tools/export-java.js de Java dosyalarını buradan üretir.
 *
 * Senaryo (lojistik dünyasının devamı): Her gönderiye bir TAKİP NUMARASI verilir (KRG-1001, KRG-1002…).
 * Numaraları TakipNoUretici verir. Sipariş ve İade masaları kendi üreticilerini `new` ile oluşturunca
 * aynı numara iki gönderiye verilir. Çözüm: üreticiden programda yalnızca BİR nesne olsun.
 */
(function () {
  'use strict';
  const DP = (window.DP = window.DP || {});
  const SG = (DP.sg = DP.sg || {});

  // ------------------------------------------------------------------ roller
  // Singleton tek sınıflık bir kalıptır; renkler sınıfın "parçalarını" da ayırt eder.
  SG.roles = {
    client: { en: 'Client', tr: 'İstemci', color: 1 },
    singleton: { en: 'Singleton', tr: 'Tekil sınıf', color: 2 },
    instance: { en: 'uniqueInstance', tr: 'Tek örnek (static alan)', color: 3 },
    ctor: { en: 'private constructor', tr: 'Özel kurucu', color: 5 },
    access: { en: 'getInstance()', tr: 'Global erişim noktası', color: 6 },
  };

  SG.classRoles = {
    TakipNoUretici: 'singleton',
    Singleton: 'singleton',
    SiparisServisi: 'client',
    IadeServisi: 'client',
    Main: 'client',
    Client: 'client',
    Client1: 'client',
    Client2: 'client',
    YarisDeneyi: 'client',
    UreticiTesti: 'client',
    YansimaSaldirisi: 'client',
    SerilestirmeSaldirisi: 'client',
  };

  SG.roleOf = function (name) {
    const r = SG.classRoles[name];
    return r ? SG.roles[r].color : null;
  };

  // Kodda ayrıca vurgulananlar: erişim noktası (pembe) ve tek örneği tutan alan (mor).
  SG.special = { getInstance: 'fm', ornek: 'sgi', ORNEK: 'sgi', INSTANCE: 'sgi', uniqueInstance: 'sgi' };

  /** 1 tabanlı satır numarası (derleyici hatalarını kodla tutarlı üretmek için). */
  SG.lineOf = function (src, needle) {
    const i = src.split('\n').findIndex((l) => l.includes(needle));
    return i < 0 ? 0 : i + 1;
  };

  // Gönderiler (Main'de sırayla)
  SG.cargo = { s1: '20 ton kayısı', s2: '300 konteyner fındık', r1: 'hasarlı koli' };

  const code = (SG.code = {});

  // ================================================================== "Sorun": kalıpsız kod
  const plainUretici = `public class TakipNoUretici {

    private int sayac = 1000;   // son verilen numara

    public TakipNoUretici() {
        System.out.println("[Üretici] yeni nesne oluşturuldu (sayaç: " + sayac + ")");
    }

    public String yeniNumara() {
        sayac++;
        return "KRG-" + sayac;
    }
}`;

  const plainServis = (cls, method, tag, header) => `${header || ''}public class ${cls} {

    private final TakipNoUretici uretici = new TakipNoUretici();

    public String ${method}(String yuk) {
        String no = uretici.yeniNumara();
        System.out.println("[${tag}] " + yuk + " için takip no: " + no);
        return no;
    }
}`;

  const mainV1 = `public class Main {

    public static void main(String[] args) {
        SiparisServisi siparis = new SiparisServisi();

        siparis.siparisAl("${SG.cargo.s1}");
        siparis.siparisAl("${SG.cargo.s2}");
    }
}`;

  const mainV2 = `public class Main {

    public static void main(String[] args) {
        SiparisServisi siparis = new SiparisServisi();
        IadeServisi iade = new IadeServisi();

        siparis.siparisAl("${SG.cargo.s1}");
        siparis.siparisAl("${SG.cargo.s2}");
        iade.iadeAl("${SG.cargo.r1}");
    }
}`;

  SG.naive = [
    { version: '1.0', files: { TakipNoUretici: plainUretici, SiparisServisi: plainServis('SiparisServisi', 'siparisAl', 'Sipariş'), Main: mainV1 } },
    {
      version: '2.0',
      files: {
        TakipNoUretici: plainUretici,
        SiparisServisi: plainServis('SiparisServisi', 'siparisAl', 'Sipariş'),
        IadeServisi: plainServis('IadeServisi', 'iadeAl', 'İade'),
        Main: mainV2,
      },
    },
  ];

  const created = '[Üretici] yeni nesne oluşturuldu (sayaç: 1000)';
  const line = (tag, yuk, no) => `[${tag}] ${yuk} için takip no: ${no}`;

  /** Kalıpsız sürümlerin çıktısı (Java ile birebir). dup: aynı numaranın ikinci kez verildiği satır. */
  SG.naiveOutput = function (v) {
    if (v === 0) return [{ t: created }, { t: line('Sipariş', SG.cargo.s1, 'KRG-1001') }, { t: line('Sipariş', SG.cargo.s2, 'KRG-1002') }];
    return [
      { t: created },
      { t: created },
      { t: line('Sipariş', SG.cargo.s1, 'KRG-1001') },
      { t: line('Sipariş', SG.cargo.s2, 'KRG-1002') },
      { t: line('İade', SG.cargo.r1, 'KRG-1001'), dup: true },
    ];
  };

  // ================================================================== kalıplı çözüm (tembel Singleton)
  code.TakipNoUretici = `/**
 * «Singleton» — Takip numarası üretici.
 * Programda bu sınıftan YALNIZCA BİR nesne olabilir.
 */
public class TakipNoUretici {

    private static TakipNoUretici ornek;   // tek örnek burada saklanır

    private int sayac = 1000;   // son verilen numara

    private TakipNoUretici() {   // dışarıdan new yasak!
        System.out.println("[Üretici] yeni nesne oluşturuldu (sayaç: " + sayac + ")");
    }

    public static TakipNoUretici getInstance() {   // global erişim noktası
        if (ornek == null) {
            ornek = new TakipNoUretici();   // ilk çağrıda oluştur (tembel)
        }
        return ornek;
    }

    public String yeniNumara() {
        sayac++;
        return "KRG-" + sayac;
    }
}`;

  const singleServis = (cls, method, tag, header) => `${header || ''}public class ${cls} {

    public String ${method}(String yuk) {
        String no = TakipNoUretici.getInstance().yeniNumara();
        System.out.println("[${tag}] " + yuk + " için takip no: " + no);
        return no;
    }
}`;

  code.SiparisServisi = singleServis(
    'SiparisServisi',
    'siparisAl',
    'Sipariş',
    `/**
 * «Client» — Sipariş masası.
 * Üreticiyi kendisi oluşturmaz; ona getInstance() ile ulaşır.
 */
`
  );
  code.IadeServisi = singleServis(
    'IadeServisi',
    'iadeAl',
    'İade',
    `/**
 * «Client» — İade masası.
 * Sipariş masasıyla AYNI üreticiyi kullanır.
 */
`
  );

  code.Main = `public class Main {

    public static void main(String[] args) {
        SiparisServisi siparis = new SiparisServisi();
        IadeServisi iade = new IadeServisi();

        siparis.siparisAl("${SG.cargo.s1}");
        siparis.siparisAl("${SG.cargo.s2}");
        iade.iadeAl("${SG.cargo.r1}");

        TakipNoUretici a = TakipNoUretici.getInstance();
        TakipNoUretici b = TakipNoUretici.getInstance();
        System.out.println("Aynı nesne mi? " + (a == b));
    }
}`;

  /** Kalıplı çözümün çıktısı (Java ile birebir). */
  SG.output = [
    created,
    line('Sipariş', SG.cargo.s1, 'KRG-1001'),
    line('Sipariş', SG.cargo.s2, 'KRG-1002'),
    line('İade', SG.cargo.r1, 'KRG-1003'),
    'Aynı nesne mi? true',
  ];

  SG.flowFiles = () => [
    { name: 'Main.java', code: code.Main },
    { name: 'SiparisServisi.java', code: code.SiparisServisi },
    { name: 'IadeServisi.java', code: code.IadeServisi },
    { name: 'TakipNoUretici.java', code: code.TakipNoUretici },
  ];

  // ================================================================== "Çözüm": adım adım yeniden düzenleme
  const R = {};
  R.u1 = plainUretici.replace('    public TakipNoUretici() {', '    private TakipNoUretici() {   // dışarıdan new yasak!');
  R.u2 = R.u1.replace('public class TakipNoUretici {\n', 'public class TakipNoUretici {\n\n    private static TakipNoUretici ornek;   // tek örnek burada saklanır\n');
  R.u3 = R.u2.replace(
    '    public String yeniNumara() {',
    `    public static TakipNoUretici getInstance() {   // global erişim noktası
        if (ornek == null) {
            ornek = new TakipNoUretici();   // ilk çağrıda oluştur (tembel)
        }
        return ornek;
    }

    public String yeniNumara() {`
  );
  const n2 = SG.naive[1].files;
  SG.refactor = [
    { TakipNoUretici: plainUretici, SiparisServisi: n2.SiparisServisi, IadeServisi: n2.IadeServisi, Main: mainV2 },
    { TakipNoUretici: R.u1, SiparisServisi: n2.SiparisServisi, IadeServisi: n2.IadeServisi, Main: mainV2 },
    { TakipNoUretici: R.u2, SiparisServisi: n2.SiparisServisi, IadeServisi: n2.IadeServisi, Main: mainV2 },
    { TakipNoUretici: R.u3, SiparisServisi: n2.SiparisServisi, IadeServisi: n2.IadeServisi, Main: mainV2 },
    {
      TakipNoUretici: R.u3,
      SiparisServisi: singleServis('SiparisServisi', 'siparisAl', 'Sipariş'),
      IadeServisi: singleServis('IadeServisi', 'iadeAl', 'İade'),
      Main: code.Main,
    },
  ];

  /** Kurucu private olunca istemcilerin aldığı gerçek javac hatası (dosyalar alfabetik sırayla). */
  SG.compileErrors = function () {
    const out = [];
    ['IadeServisi', 'SiparisServisi'].forEach((name) => {
      const src = n2[name];
      const text = src.split('\n')[SG.lineOf(src, 'new TakipNoUretici()') - 1];
      out.push({ t: `${name}.java:${SG.lineOf(src, 'new TakipNoUretici()')}: error: TakipNoUretici() has private access in TakipNoUretici`, err: true });
      out.push({ t: text });
      out.push({ t: ' '.repeat(text.indexOf('new TakipNoUretici')) + '^' });
    });
    out.push({ t: '2 errors', err: true });
    return out;
  };

  // ================================================================== "Eleştiri": testler ve bağımlılık enjeksiyonu
  code.UreticiTesti = `/**
 * Elle yazılmış küçük bir test koşucusu (JUnit gerekmez).
 * Kullanım:  java UreticiTesti A B   → testleri verilen sırayla çalıştırır.
 */
public class UreticiTesti {

    public static void main(String[] args) {
        String[] sira = args.length > 0 ? args : new String[] {"A", "B"};
        for (String test : sira) {
            if (test.equals("A")) siparisTesti();
            if (test.equals("B")) iadeTesti();
        }
    }

    // Test A: yeni bir sipariş KRG-1001 almalı
    static void siparisTesti() {
        String no = new SiparisServisi().siparisAl("test kolisi");
        kontrol("Test A (sipariş)", no);
    }

    // Test B: yeni bir iade KRG-1001 almalı
    static void iadeTesti() {
        String no = new IadeServisi().iadeAl("test iadesi");
        kontrol("Test B (iade)", no);
    }

    static void kontrol(String test, String no) {
        if (no.equals("KRG-1001")) {
            System.out.println("[GEÇTİ] " + test);
        } else {
            System.out.println("[KALDI] " + test + ": KRG-1001 bekleniyordu, " + no + " geldi");
        }
    }
}`;

  const di = (SG.di = {});
  di.TakipNoUretici = `/**
 * Bağımlılık enjeksiyonu (DI) sürümü: sıradan bir sınıf.
 * Programda tek nesne olmasını sınıf değil, Main (kurulum kodu) sağlar.
 */
public class TakipNoUretici {

    private int sayac;

    public TakipNoUretici(int sonNumara) {
        this.sayac = sonNumara;
        System.out.println("[Üretici] yeni nesne oluşturuldu (sayaç: " + sayac + ")");
    }

    public String yeniNumara() {
        sayac++;
        return "KRG-" + sayac;
    }
}`;
  const diServis = (cls, method, tag) => `public class ${cls} {

    private final TakipNoUretici uretici;

    public ${cls}(TakipNoUretici uretici) {   // bağımlılık dışarıdan verilir
        this.uretici = uretici;
    }

    public String ${method}(String yuk) {
        String no = uretici.yeniNumara();
        System.out.println("[${tag}] " + yuk + " için takip no: " + no);
        return no;
    }
}`;
  di.SiparisServisi = diServis('SiparisServisi', 'siparisAl', 'Sipariş');
  di.IadeServisi = diServis('IadeServisi', 'iadeAl', 'İade');
  di.Main = `public class Main {

    public static void main(String[] args) {
        TakipNoUretici uretici = new TakipNoUretici(1000);   // tek nesne: BURADA, bir kez

        SiparisServisi siparis = new SiparisServisi(uretici);
        IadeServisi iade = new IadeServisi(uretici);

        siparis.siparisAl("${SG.cargo.s1}");
        siparis.siparisAl("${SG.cargo.s2}");
        iade.iadeAl("${SG.cargo.r1}");
    }
}`;
  di.UreticiTesti = code.UreticiTesti.replace('new SiparisServisi().siparisAl', 'new SiparisServisi(new TakipNoUretici(1000)).siparisAl')
    .replace('new IadeServisi().iadeAl', 'new IadeServisi(new TakipNoUretici(1000)).iadeAl')
    .replace('    static void siparisTesti() {', '    static void siparisTesti() {   // her teste taze bir üretici');

  /** Test koşucusunun çıktısı (Java ile birebir). order: 'A' | 'B' | 'AB' | 'BA'; mode: 'single' | 'di' */
  SG.testOutput = function (order, mode) {
    const out = [];
    let n = 1000;
    const T = {
      A: { tag: 'Sipariş', yuk: 'test kolisi', name: 'Test A (sipariş)' },
      B: { tag: 'İade', yuk: 'test iadesi', name: 'Test B (iade)' },
    };
    order.split('').forEach((k, i) => {
      if (mode === 'di') n = 1000;
      if (mode === 'di' || i === 0) out.push({ t: created });
      n++;
      const no = 'KRG-' + n;
      out.push({ t: line(T[k].tag, T[k].yuk, no) });
      out.push(no === 'KRG-1001' ? { t: '[GEÇTİ] ' + T[k].name, ok: true } : { t: `[KALDI] ${T[k].name}: KRG-1001 bekleniyordu, ${no} geldi`, err: true });
    });
    return out;
  };

  // ================================================================== "Thread Yarışı": altı gerçekleştirim
  code.Veritabani = `/**
 * Sahte veritabanı: son verilen numarayı okumak zaman alır (ağ + disk).
 */
public class Veritabani {

    public static int sonNumarayiOku() {
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return 1000;
    }
}`;

  const raceCtor = `    private TakipNoUretici() {
        sayac = Veritabani.sonNumarayiOku();   // yavaş: ~100 ms
        String t = Thread.currentThread().getName();
        System.out.println("[Üretici] yeni nesne oluşturuldu (" + t + ")");
    }`;
  const raceOp = `    public synchronized String yeniNumara() {   // sayac++ de korunmalı
        sayac++;
        return "KRG-" + sayac;
    }`;
  const raceClass = (fields, accessor) => `public class TakipNoUretici {

${fields}

    private int sayac;

${raceCtor}

${accessor}

${raceOp}
}`;

  const raceCode = {
    korumasiz: raceClass(
      '    private static TakipNoUretici ornek;',
      `    public static TakipNoUretici getInstance() {
        if (ornek == null) {                  // 1) kontrol et
            ornek = new TakipNoUretici();     // 2) oluştur ve ata
        }
        return ornek;
    }`
    ),
    senkron: raceClass(
      '    private static TakipNoUretici ornek;',
      `    // aynı anda yalnızca BİR thread girebilir
    public static synchronized TakipNoUretici getInstance() {
        if (ornek == null) {
            ornek = new TakipNoUretici();
        }
        return ornek;
    }`
    ),
    ciftkontrol: raceClass(
      '    private static volatile TakipNoUretici ornek;   // volatile!',
      `    public static TakipNoUretici getInstance() {
        if (ornek == null) {               // 1. kontrol (kilitsiz)
            synchronized (TakipNoUretici.class) {
                if (ornek == null) {       // 2. kontrol (kilitli)
                    ornek = new TakipNoUretici();
                }
            }
        }
        return ornek;
    }`
    ),
    erken: raceClass(
      `    // sınıf başlatılırken (bir kez) oluşturulur
    private static final TakipNoUretici ORNEK = new TakipNoUretici();`,
      `    public static TakipNoUretici getInstance() {
        return ORNEK;
    }`
    ),
    tutucu: raceClass(
      `    private static class Tutucu {   // ilk kullanımda başlatılır
        static final TakipNoUretici ORNEK = new TakipNoUretici();
    }`,
      `    public static TakipNoUretici getInstance() {
        return Tutucu.ORNEK;
    }`
    ),
    enumile: `public enum TakipNoUretici {

    INSTANCE;   // JVM tek örneği garanti eder

    private int sayac;

    TakipNoUretici() {   // enum kurucusu zaten private
        sayac = Veritabani.sonNumarayiOku();
        String t = Thread.currentThread().getName();
        System.out.println("[Üretici] yeni nesne oluşturuldu (" + t + ")");
    }

${raceOp}
}`,
  };

  const yaris = (access) => `public class YarisDeneyi {

    public static void main(String[] args) throws InterruptedException {
        Thread t1 = new Thread(YarisDeneyi::numaraAl, "T1");
        Thread t2 = new Thread(YarisDeneyi::numaraAl, "T2");
        t1.start();
        t2.start();   // iki thread neredeyse aynı anda başlar
        t1.join();
        t2.join();
    }

    static void numaraAl() {
        String no = TakipNoUretici.${access}.yeniNumara();
        System.out.println(Thread.currentThread().getName() + " aldı: " + no);
    }
}`;

  const made = (t) => `[Üretici] yeni nesne oluşturuldu (${t})`;
  const oneObj = [made('T1'), 'T1 aldı: KRG-1001', 'T2 aldı: KRG-1002'];

  /*
   * Her adım: {t, x, at:{T1,T2} (kod imleçleri), row:[thread|'both', md] (zaman çizelgesine eklenen satır),
   *            sw (bağlam değişimi), mem:{ornek, objs:{A:'building'|'ready'|'half'}, T1, T2, lock, nums, bad, ok}, out}
   * mem alanları önceki adımdan devralınır (yalnızca değişenler yazılır).
   */
  const GI = 'public static TakipNoUretici getInstance()';

  SG.race = {
    order: ['korumasiz', 'senkron', 'ciftkontrol', 'erken', 'tutucu', 'enumile'],
    yarisDeneyi: yaris,
    variants: {
      korumasiz: {
        label: 'Korumasız',
        title: 'Korumasız tembel oluşturma',
        safe: false, lazy: true, lock: 'yok', attack: false,
        code: raceCode.korumasiz,
        access: 'getInstance()',
        out: [made('T1'), made('T2'), 'T1 aldı: KRG-1001', 'T2 aldı: KRG-1001'],
        steps: [
          ({ t: 'İki thread aynı anda', x: '`T1` ve `T2` aynı anda `getInstance()` çağırıyor. `ornek` henüz **null**. Bakalım kaç nesne oluşacak?', at: { T1: GI, T2: GI }, mem: { ornek: null, objs: {}, T1: null, T2: null }, out: 0 }),
          ({ t: 'T1: kontrol et', x: 'T1 soruyor: `ornek == null`? **Evet.** Şimdi nesneyi oluşturacak…', at: { T1: 'if (ornek == null)' }, row: ['T1', '`ornek == null` → **evet**'], out: 0 }),
          ({ t: '⚡ Bağlam değişimi!', x: 'İşletim sistemi tam bu anda T1’i bekletip T2’yi çalıştırıyor. T2 de soruyor: `ornek == null`? **Evet** — T1 henüz hiçbir şey atamadı!', sw: true, at: { T2: 'if (ornek == null)' }, row: ['T2', '`ornek == null` → **evet** (hâlâ null!)'], out: 0 }),
          ({ t: 'T1 nesne oluşturuyor', x: 'T1 `new TakipNoUretici()` diyor. Kurucu son numarayı veritabanından okuyor: **~100 ms**. Nesne **A** yapım aşamasında…', at: { T1: 'ornek = new TakipNoUretici()' }, row: ['T1', '`new` → nesne **A** kuruluyor…'], mem: { objs: { A: 'building' } }, out: 0 }),
          ({ t: 'T2 de nesne oluşturuyor', x: 'T2 de `new` diyor: nesne **B**. Bellekte şu an **iki** üretici kuruluyor. Kurucu ne kadar yavaşsa yarış penceresi o kadar geniş!', at: { T2: 'ornek = new TakipNoUretici()' }, row: ['T2', '`new` → nesne **B** kuruluyor…'], mem: { objs: { A: 'building', B: 'building' } }, out: 0 }),
          ({ t: 'T1: ornek = A', x: 'A hazır: kurucu mesajını yazdı. T1 onu `ornek` alanına atıyor ve döndürüyor. T1’in elindeki üretici: **A**.', at: { T1: 'return ornek;' }, row: ['T1', '`ornek = A` · `return A`'], mem: { ornek: 'A', objs: { A: 'ready', B: 'building' }, T1: 'A' }, out: 1 }),
          ({ t: 'T2: ornek = B — A’nın üstüne!', x: 'B de hazır: T2 onu `ornek` alanına yazıyor. A artık `ornek`’te değil ama T1 hâlâ onu kullanıyor. **İki nesne** yaşıyor.', at: { T2: 'return ornek;' }, row: ['T2', '`ornek = B` (A’nın üstüne!) · `return B`'], mem: { ornek: 'B', objs: { A: 'ready', B: 'ready' }, T2: 'B' }, out: 2 }),
          ({ t: 'Numara zamanı: ÇAKIŞMA', x: 'Her thread kendi nesnesinden numara istiyor. A’nın da B’nin de sayacı 1000’den başladı → ikisi de **KRG-1001**!', at: { T1: 'sayac++;', T2: 'sayac++;' }, row: ['both', 'T1 → **KRG-1001** · T2 → **KRG-1001**'], mem: { nums: { T1: 'KRG-1001', T2: 'KRG-1001' }, bad: true }, out: 4 }),
          ({ t: 'Teşhis: kontrol et, sonra yap', x: '`if (ornek == null)` ile `ornek = new …` **iki ayrı adım**; arasına başka bir thread girebilir. Buna **yarış durumu** (*race condition*) denir. Bizim denememizde gerçek Java bu kodla **8 çalıştırmanın 8’inde** iki nesne üretti.', at: { T1: 'if (ornek == null)', T2: 'ornek = new TakipNoUretici()' }, mem: {}, out: 4 }),
        ],
      },
      senkron: {
        label: 'synchronized',
        title: 'synchronized getInstance()',
        safe: true, lazy: true, lock: 'her çağrıda', attack: false,
        code: raceCode.senkron,
        access: 'getInstance()',
        out: oneObj,
        steps: [
          ({ t: 'Kilitli kapı', x: '`getInstance()` artık `synchronized`: metoda aynı anda **yalnızca bir thread** girebilir. Kilit, `TakipNoUretici.class` nesnesine ait.', at: { T1: 'getInstance()', T2: 'getInstance()' }, mem: { ornek: null, objs: {}, T1: null, T2: null, lock: null }, out: 0 }),
          ({ t: 'T1 kilidi aldı', x: 'T1 önce geldi: kilidi aldı ve metoda girdi 🔒', at: { T1: 'if (ornek == null)' }, row: ['T1', 'kilidi aldı 🔒 · `ornek == null` → **evet**'], mem: { lock: { owner: 'T1', waiting: [] } }, out: 0 }),
          ({ t: 'T2 kapıda bekliyor', x: 'T2 de girmek istiyor ama kilit T1’de. T2 **bekler** (BLOCKED) — kontrol satırına bile ulaşamaz.', sw: true, at: { T2: 'getInstance()' }, row: ['T2', 'kilit dolu → **bekliyor** ⏳'], mem: { lock: { owner: 'T1', waiting: ['T2'] } }, out: 0 }),
          ({ t: 'T1 nesneyi oluşturuyor', x: 'T1 rahatça oluşturuyor: nesne **A**. Bu sırada T2 hâlâ kapıda.', at: { T1: 'ornek = new TakipNoUretici();' }, row: ['T1', '`new` → **A** · `ornek = A`'], mem: { ornek: 'A', objs: { A: 'ready' } }, out: 1 }),
          ({ t: 'T1 çıkıyor, kilit serbest', x: 'T1 **A**’yı döndürüp metottan çıkıyor; kilit bırakıldı 🔓 ve sıradaki T2 içeri giriyor.', at: { T1: 'return ornek;' }, row: ['T1', '`return A` · kilidi bıraktı 🔓'], mem: { T1: 'A', lock: { owner: 'T2', waiting: [] } }, out: 1 }),
          ({ t: 'T2: artık null değil', x: 'T2 kontrol ediyor: `ornek == null`? **Hayır!** A zaten var. T2 de **A**’yı alıyor.', at: { T2: 'return ornek;' }, row: ['T2', 'kilidi aldı · `ornek == null` → **hayır** · `return A`'], mem: { T2: 'A', lock: null }, out: 1 }),
          ({ t: 'Sonuç: tek nesne', x: 'İki thread de **aynı** nesneyi kullanıyor: KRG-1001 ve KRG-1002. Yarış bitti ✓', at: { T1: 'sayac++;', T2: 'sayac++;' }, row: ['both', 'T1 → **KRG-1001** · T2 → **KRG-1002**'], mem: { nums: { T1: 'KRG-1001', T2: 'KRG-1002' }, ok: true }, out: 3 }),
          ({ t: 'Bedeli: her çağrıda kilit', x: 'Nesne oluştuktan sonra kilide gerek yok, ama `synchronized` **her** `getInstance()` çağrısında kilit alır. Saniyede binlerce çağrıda threadler boşuna sıraya girer. Daha ucuzu olabilir mi?', at: { T1: 'public static synchronized', T2: null }, mem: { lock: { owner: 'T1', waiting: ['T2'], note: 'her çağrıda!' } }, out: 3 }),
        ],
      },
      ciftkontrol: {
        label: 'Çift kontrol',
        title: 'Çift kontrollü kilit + volatile',
        safe: true, lazy: true, lock: 'yalnızca ilk sefer', attack: false,
        code: raceCode.ciftkontrol,
        access: 'getInstance()',
        out: oneObj,
        steps: [
          ({ t: 'Çift kontrollü kilit (DCL)', x: 'Fikir: kilidi **yalnızca nesne yokken** al. Dışarıda kilitsiz bir kontrol, içeride kilitli ikinci bir kontrol (*double-checked locking*).', at: { T1: GI, T2: GI }, mem: { ornek: null, objs: {}, T1: null, T2: null, lock: null }, out: 0 }),
          ({ t: 'T1: 1. kontrol', x: 'T1 kilitsiz bakıyor: `ornek == null`? **Evet.**', at: { T1: '1. kontrol' }, row: ['T1', '1. kontrol → **evet**'], out: 0 }),
          ({ t: 'T2: 1. kontrol', x: 'Bağlam değişimi: T2 de kilitsiz bakıyor ve **evet** diyor. Korumasız sürümdeki tehlikeli an… ama bu kez bir kapı daha var.', sw: true, at: { T2: '1. kontrol' }, row: ['T2', '1. kontrol → **evet**'], out: 0 }),
          ({ t: 'T1 kilidi aldı', x: 'T1 `synchronized` bloğa girdi 🔒', at: { T1: 'synchronized (TakipNoUretici.class)' }, row: ['T1', 'kilidi aldı 🔒'], mem: { lock: { owner: 'T1', waiting: [] } }, out: 0 }),
          ({ t: 'T2 bekliyor', x: 'T2 de bloğa girmek istiyor ama kilit T1’de: **bekliyor** ⏳', at: { T2: 'synchronized (TakipNoUretici.class)' }, row: ['T2', 'kilit dolu → **bekliyor** ⏳'], mem: { lock: { owner: 'T1', waiting: ['T2'] } }, out: 0 }),
          ({ t: 'T1: 2. kontrol ve oluştur', x: 'T1 kilit içinde **tekrar** bakıyor: hâlâ null → nesne **A**’yı oluşturup atıyor ve bloktan çıkıyor 🔓', at: { T1: 'ornek = new TakipNoUretici();' }, row: ['T1', '2. kontrol → **evet** · `new` → **A** · kilidi bıraktı 🔓'], mem: { ornek: 'A', objs: { A: 'ready' }, lock: { owner: 'T2', waiting: [] } }, out: 1 }),
          ({ t: 'T2: 2. kontrol kurtarıyor', x: 'T2 içeri girip **2. kontrolü** yapıyor: `ornek == null`? **Hayır!** Yeni nesne oluşturmadan çıkıyor. İkinci kontrol olmasaydı burada B doğardı.', at: { T2: '2. kontrol', T1: 'return ornek;' }, row: ['T2', '2. kontrol → **hayır** · kilidi bıraktı 🔓'], mem: { T1: 'A', lock: null }, out: 1 }),
          ({ t: 'Sonuç ve hızlı yol', x: 'İkisi de **A**’yı aldı ✓. Bundan sonraki her çağrı 1. kontrolde **hayır** deyip kilide hiç dokunmadan döner: hem güvenli hem hızlı.', at: { T1: 'sayac++;', T2: 'sayac++;' }, row: ['both', 'T1 → **KRG-1001** · T2 → **KRG-1002** · sonraki çağrılar kilitsiz ⚡'], mem: { T2: 'A', nums: { T1: 'KRG-1001', T2: 'KRG-1002' }, ok: true }, out: 3 }),
          ({ t: 'volatile neden şart?', x: '`new` aslında üç iştir: bellek ayır → kurucuyu çalıştır → adresi `ornek`’e yaz. İşlemci ya da JIT son ikisinin **sırasını değiştirebilir**. `volatile` olmasaydı başka bir thread 1. kontrolde dolu bir `ornek` görüp **yarım kurulmuş** nesneyi kullanabilirdi (sayaç 0 → KRG-1!). `volatile` bu yeniden sıralamayı yasaklar.', at: { T1: 'private static volatile', T2: null }, mem: { half: true }, out: 3 }),
        ],
      },
      erken: {
        label: 'Erken',
        title: 'Erken (eager) oluşturma',
        safe: true, lazy: false, lock: 'yok (JVM, bir kez)', attack: false,
        code: raceCode.erken,
        access: 'getInstance()',
        out: oneObj,
        steps: [
          ({ t: 'Nesne baştan hazır', x: '`static final` alan, sınıf **ilk kullanıldığında** JVM tarafından başlatılır. JVM sınıf başlatmayı kendisi kilitler: iki thread aynı sınıfı aynı anda başlatamaz.', at: { T1: GI, T2: GI }, mem: { ornek: null, objs: {}, T1: null, T2: null, lock: null, field: 'ORNEK' }, out: 0 }),
          ({ t: 'T1 sınıfı tetikledi', x: 'T1 `getInstance()` dedi; sınıf ilk kez kullanılıyor → JVM sınıfı başlatıyor ve `ORNEK = new TakipNoUretici()` satırını çalıştırıyor.', at: { T1: 'ORNEK = new TakipNoUretici()' }, row: ['T1', 'sınıf başlatılıyor (JVM kilidi) → `new` → **A**'], mem: { objs: { A: 'building' }, lock: { owner: 'T1', waiting: [], jvm: true } }, out: 0 }),
          ({ t: 'T2 JVM’i bekliyor', x: 'T2’nin yazdığımız hiçbir kilit kodu yok, ama JVM onu sınıf başlatma bitene kadar **bekletiyor**.', sw: true, at: { T2: 'return ORNEK;' }, row: ['T2', 'sınıf hâlâ başlatılıyor → **bekliyor** ⏳'], mem: { lock: { owner: 'T1', waiting: ['T2'], jvm: true } }, out: 0 }),
          ({ t: 'Sınıf hazır', x: '`ORNEK` artık A. İki thread de `return ORNEK` ile **aynı** nesneyi alıyor.', at: { T1: 'return ORNEK;', T2: 'return ORNEK;' }, row: ['both', 'ikisi de `return ORNEK` → **A**'], mem: { ornek: 'A', objs: { A: 'ready' }, T1: 'A', T2: 'A', lock: null }, out: 1 }),
          ({ t: 'Sonuç: basit ve güvenli', x: 'Tek nesne ✓, kilit kodu yok. Bedeli: nesne **tembel değil** — sınıfın başka bir static üyesi kullanılsa bile oluşur. Çoğu uygulamada sorun değildir.', at: { T1: 'sayac++;', T2: 'sayac++;' }, row: ['both', 'T1 → **KRG-1001** · T2 → **KRG-1002**'], mem: { nums: { T1: 'KRG-1001', T2: 'KRG-1002' }, ok: true }, out: 3 }),
        ],
      },
      tutucu: {
        label: 'Holder',
        title: 'Tutucu iç sınıf (holder)',
        safe: true, lazy: true, lock: 'yok (JVM, bir kez)', attack: false,
        code: raceCode.tutucu,
        access: 'getInstance()',
        out: oneObj,
        steps: [
          ({ t: 'Tembel + güvenli + kilitsiz', x: 'Dış sınıf başlatılınca nesne **oluşmaz**. İç sınıf `Tutucu`, ancak `getInstance()` içinde ilk kez dokunulunca başlatılır. Güvenliği yine JVM’in sınıf başlatma kilidi sağlar.', at: { T1: GI, T2: GI }, mem: { ornek: null, objs: {}, T1: null, T2: null, lock: null, field: 'Tutucu.ORNEK' }, out: 0 }),
          ({ t: 'T1 Tutucu’yu tetikledi', x: 'T1 `Tutucu.ORNEK` dedi → JVM `Tutucu` sınıfını başlatıyor → nesne **A** oluşuyor.', at: { T1: 'return Tutucu.ORNEK;' }, row: ['T1', '`Tutucu` başlatılıyor (JVM kilidi) → **A**'], mem: { objs: { A: 'building' }, lock: { owner: 'T1', waiting: [], jvm: true } }, out: 0 }),
          ({ t: 'T2 bekliyor', x: 'T2 de `Tutucu.ORNEK`’e ulaşmak istiyor; JVM onu başlatma bitene kadar bekletiyor.', sw: true, at: { T2: 'return Tutucu.ORNEK;' }, row: ['T2', '`Tutucu` başlatılıyor → **bekliyor** ⏳'], mem: { lock: { owner: 'T1', waiting: ['T2'], jvm: true } }, out: 0 }),
          ({ t: 'İkisi de A’yı aldı', x: '`Tutucu.ORNEK` hazır: iki thread de **A**’yı alıyor. Sonraki çağrılarda hiçbir kilit yok — yalnızca bir alan okuması.', at: { T1: 'return Tutucu.ORNEK;', T2: 'return Tutucu.ORNEK;' }, row: ['both', 'ikisi de **A** · sonraki çağrılar kilitsiz ⚡'], mem: { ornek: 'A', objs: { A: 'ready' }, T1: 'A', T2: 'A', lock: null }, out: 1 }),
          ({ t: 'Sonuç', x: 'Tek nesne ✓, tembel ✓, kilit kodu yok ✓. Java’da sınıf tabanlı Singleton için en çok önerilen yazımlardan biri (*initialization-on-demand holder*).', at: { T1: 'sayac++;', T2: 'sayac++;' }, row: ['both', 'T1 → **KRG-1001** · T2 → **KRG-1002**'], mem: { nums: { T1: 'KRG-1001', T2: 'KRG-1002' }, ok: true }, out: 3 }),
        ],
      },
      enumile: {
        label: 'enum',
        title: 'enum ile Singleton',
        safe: true, lazy: false, lock: 'yok (JVM, bir kez)', attack: true,
        code: raceCode.enumile,
        access: 'INSTANCE',
        out: oneObj,
        steps: [
          ({ t: 'Tek elemanlı enum', x: '`INSTANCE` bir enum sabiti. JVM her enum sabitinden **tek örnek** olacağını garanti eder; kurucu zaten private’tır. Yansıma ve serileştirme bile ikinci örnek üretemez (bkz. **Kırmak** sahnesi).', at: { T1: 'INSTANCE;', T2: 'INSTANCE;' }, mem: { ornek: null, objs: {}, T1: null, T2: null, lock: null, field: 'INSTANCE' }, out: 0 }),
          ({ t: 'T1 enum’u tetikledi', x: 'T1 `TakipNoUretici.INSTANCE` dedi → JVM enum sınıfını başlatıyor → nesne **A**.', at: { T1: 'sayac = Veritabani.sonNumarayiOku();' }, row: ['T1', 'enum başlatılıyor (JVM kilidi) → **A**'], mem: { objs: { A: 'building' }, lock: { owner: 'T1', waiting: [], jvm: true } }, out: 0 }),
          ({ t: 'T2 bekliyor', x: 'T2 de `INSTANCE` istiyor; JVM başlatma bitene kadar bekletiyor.', sw: true, at: { T2: 'INSTANCE;' }, row: ['T2', 'enum başlatılıyor → **bekliyor** ⏳'], mem: { lock: { owner: 'T1', waiting: ['T2'], jvm: true } }, out: 0 }),
          ({ t: 'İkisi de A’yı aldı', x: '`INSTANCE` hazır: iki thread de **A**’yı kullanıyor.', at: { T1: 'INSTANCE;', T2: 'INSTANCE;' }, row: ['both', 'ikisi de `INSTANCE` → **A**'], mem: { ornek: 'A', objs: { A: 'ready' }, T1: 'A', T2: 'A', lock: null }, out: 1 }),
          ({ t: 'Sonuç: en kısa ve en sağlam', x: 'Tek nesne ✓, thread-safe ✓, yansımaya ve serileştirmeye dayanıklı ✓. Joshua Bloch (*Effective Java*, Madde 3) tek elemanlı enum’u çoğu durumda **en iyi yol** olarak önerir. Tek kısıtı: enum başka bir sınıftan kalıtım alamaz.', at: { T1: 'sayac++;', T2: 'sayac++;' }, row: ['both', 'T1 → **KRG-1001** · T2 → **KRG-1002**'], mem: { nums: { T1: 'KRG-1001', T2: 'KRG-1002' }, ok: true }, out: 3 }),
        ],
      },
    },
  };
  SG.race.order.forEach((k) => (SG.race.variants[k].key = k));

  // ================================================================== "Kırmak": yansıma ve serileştirme saldırıları
  const serialClass = (guard, resolve) => `import java.io.Serializable;

public class TakipNoUretici implements Serializable {

    private static final long serialVersionUID = 1L;

    private static TakipNoUretici ornek;

    private int sayac = 1000;

    private TakipNoUretici() {${
      guard
        ? `
        if (ornek != null) {   // yansıma saldırısına karşı
            throw new IllegalStateException("İkinci nesne oluşturulamaz!");
        }`
        : ''
    }
        System.out.println("[Üretici] yeni nesne oluşturuldu");
    }

    public static TakipNoUretici getInstance() {
        if (ornek == null) {
            ornek = new TakipNoUretici();
        }
        return ornek;
    }

    public String yeniNumara() {
        sayac++;
        return "KRG-" + sayac;
    }${
      resolve
        ? `

    private Object readResolve() {   // serileştirmeye karşı: kopya yerine asıl nesne
        return getInstance();
    }`
        : ''
    }
}`;

  const yansima = (enumMode) => `import java.lang.reflect.Constructor;${enumMode ? '' : '\nimport java.lang.reflect.InvocationTargetException;'}

public class YansimaSaldirisi {

    public static void main(String[] args) throws Exception {
        TakipNoUretici asil = TakipNoUretici.${enumMode ? 'INSTANCE' : 'getInstance()'};

        Constructor<TakipNoUretici> kurucu = TakipNoUretici.class.getDeclaredConstructor(${enumMode ? 'String.class, int.class' : ''});
        kurucu.setAccessible(true);   // private kilidi açılıyor!
        try {
            TakipNoUretici sahte = kurucu.newInstance(${enumMode ? '"SAHTE", 1' : ''});
            System.out.println("Aynı nesne mi? " + (asil == sahte));
        } catch (${enumMode ? 'IllegalArgumentException' : 'InvocationTargetException'} e) {
            System.out.println("Saldırı engellendi: " + e.${enumMode ? 'getMessage()' : 'getCause().getMessage()'});
        }
    }
}`;

  const serilestirme = (enumMode) => `import java.io.*;

public class SerilestirmeSaldirisi {

    public static void main(String[] args) throws Exception {
        TakipNoUretici asil = TakipNoUretici.${enumMode ? 'INSTANCE' : 'getInstance()'};

        ByteArrayOutputStream bayt = new ByteArrayOutputStream();
        try (ObjectOutputStream yaz = new ObjectOutputStream(bayt)) {
            yaz.writeObject(asil);   // nesneyi bayt dizisine çevir
        }
        try (ObjectInputStream oku = new ObjectInputStream(new ByteArrayInputStream(bayt.toByteArray()))) {
            TakipNoUretici kopya = (TakipNoUretici) oku.readObject();   // baytlardan geri oku
            System.out.println("Aynı nesne mi? " + (asil == kopya));
        }
    }
}`;

  SG.attack = {
    acik: { uretici: serialClass(false, false), yansima: yansima(false), serilestirme: serilestirme(false) },
    korumali: { uretici: serialClass(true, true), yansima: yansima(false), serilestirme: serilestirme(false) },
    enumile: {
      uretici: `public enum TakipNoUretici {

    INSTANCE;

    private int sayac = 1000;

    TakipNoUretici() {
        System.out.println("[Üretici] yeni nesne oluşturuldu");
    }

    public String yeniNumara() {
        sayac++;
        return "KRG-" + sayac;
    }
}`,
      yansima: yansima(true),
      serilestirme: serilestirme(true),
    },
    // Ara adım: yalnızca kurucu koruması (readResolve yok) — sahnede gösterilir, dışa aktarılmaz
    guardOnly: serialClass(true, false),
  };

  // Gerçek Java çıktıları (Java 21 ile doğrulandı)
  const mk = '[Üretici] yeni nesne oluşturuldu';
  SG.attackOutput = {
    acik: { yansima: [mk, mk, 'Aynı nesne mi? false'], serilestirme: [mk, 'Aynı nesne mi? false'] },
    korumali: { yansima: [mk, 'Saldırı engellendi: İkinci nesne oluşturulamaz!'], serilestirme: [mk, 'Aynı nesne mi? true'] },
    enumile: { yansima: [mk, 'Saldırı engellendi: Cannot reflectively create enum objects'], serilestirme: [mk, 'Aynı nesne mi? true'] },
  };

  // ================================================================== UML sınıf diyagramı
  const M = {
    ornek: { id: 'ornek', text: '- ornek: TakipNoUretici', generic: '- uniqueInstance: Singleton', static: true, color: 3 },
    sayac: { id: 'sayac', text: '- sayac: int', generic: '- singletonData' },
    ctorPrivate: { id: 'ctor', text: '- TakipNoUretici()', generic: '- Singleton()', color: 5 },
    ctorPublic: { id: 'ctor', text: '+ TakipNoUretici()', generic: '+ Singleton()' },
    getInstance: { id: 'getInstance', text: '+ getInstance(): TakipNoUretici', generic: '+ getInstance(): Singleton', static: true, factory: true },
    yeniNumara: { id: 'yeniNumara', text: '+ yeniNumara(): String', generic: '+ singletonOperation()' },
    uretici: { id: 'uretici', text: '- uretici: TakipNoUretici' },
    siparisAl: { id: 'siparisAl', text: '+ siparisAl(yuk): String', generic: '+ operation()' },
    iadeAl: { id: 'iadeAl', text: '+ iadeAl(yuk): String', generic: '+ operation()' },
  };
  SG.members = M;

  const SX = 420; // Singleton kutusunun konumu
  const SY = 150;
  const SW = 360;

  const singletonBox = (members) => ({ id: 'TakipNoUretici', name: 'TakipNoUretici', generic: 'Singleton', kind: 'class', role: 'singleton', x: SX, y: SY, w: SW, members });
  const selfLoop = { id: 'self', from: 'TakipNoUretici', to: 'TakipNoUretici', type: 'association', label: 'ornek · 1', genericLabel: 'uniqueInstance · 1', fromSide: 'right', fromAt: SY + 62, toSide: 'top', toAt: SX + 192, points: [[SX + SW + 46, SY + 62], [SX + SW + 46, SY - 44], [SX + 192, SY - 44]], labelAt: [SX + SW - 40, SY - 52] };

  /** Kalıbın yapı diyagramı (Yapı ve Canlı Akış sahneleri). */
  SG.diagram = function (o) {
    o = o || {};
    const classes = [
      { id: 'SiparisServisi', name: 'SiparisServisi', generic: 'Client1', kind: 'class', role: 'client', x: 10, y: 60, w: 270, members: [M.siparisAl] },
      { id: 'IadeServisi', name: 'IadeServisi', generic: 'Client2', kind: 'class', role: 'client', x: 10, y: 300, w: 270, members: [M.iadeAl] },
      singletonBox([M.ornek, M.sayac, M.ctorPrivate, M.getInstance, M.yeniNumara]),
    ];
    const relations = [
      { id: 'uses-sip', from: 'SiparisServisi', to: 'TakipNoUretici', type: 'dependency', label: 'getInstance()', fromSide: 'right', fromAt: 100, toSide: 'left', toAt: SY + 60, mid: 350 },
      { id: 'uses-iade', from: 'IadeServisi', to: 'TakipNoUretici', type: 'dependency', label: 'getInstance()', fromSide: 'right', fromAt: 340, toSide: 'left', toAt: SY + 140, mid: 350 },
      selfLoop,
    ];
    const notes = o.note
      ? [{ id: 'note', x: SX + 40, y: SY + 210, w: 300, text: 'if (ornek == null)\n    ornek = new TakipNoUretici();\nreturn ornek;', genericText: 'if (uniqueInstance == null)\n    uniqueInstance = new Singleton();\nreturn uniqueInstance;', target: 'TakipNoUretici', from: 'top', to: 'bottom', toAt: SX + 190 }]
      : [];
    return { width: 900, height: 560, title: 'Singleton sınıf diyagramı', classes, relations, notes };
  };

  /** "Çözüm" sahnesinin her adımındaki diyagram (0: kalıpsız … 4: Singleton). */
  SG.solutionDiagram = function (step) {
    const fieldSvc = step < 4 ? [M.uretici] : [];
    const members = [];
    if (step >= 2) members.push(M.ornek);
    members.push(M.sayac, step >= 1 ? M.ctorPrivate : M.ctorPublic);
    if (step >= 3) members.push(M.getInstance);
    members.push(M.yeniNumara);
    const classes = [
      { id: 'SiparisServisi', name: 'SiparisServisi', kind: 'class', role: 'client', x: 10, y: 40, w: 280, members: fieldSvc.concat([M.siparisAl]) },
      { id: 'IadeServisi', name: 'IadeServisi', kind: 'class', role: 'client', x: 10, y: 300, w: 280, members: fieldSvc.concat([M.iadeAl]) },
      singletonBox(members),
    ];
    const relations = [];
    if (step < 4) {
      const bad = step >= 1 ? 'bad' : null;
      relations.push(
        { id: 'new-sip', from: 'SiparisServisi', to: 'TakipNoUretici', type: 'create', label: step >= 1 ? 'new ✗' : 'new', fromSide: 'right', fromAt: 90, toSide: 'left', toAt: SY + 50, mid: 350, tone: bad },
        { id: 'new-iade', from: 'IadeServisi', to: 'TakipNoUretici', type: 'create', label: step >= 1 ? 'new ✗' : 'new', fromSide: 'right', fromAt: 350, toSide: 'left', toAt: SY + 120, mid: 350, tone: bad }
      );
    } else {
      relations.push(
        { id: 'uses-sip', from: 'SiparisServisi', to: 'TakipNoUretici', type: 'dependency', label: 'getInstance()', fromSide: 'right', fromAt: 90, toSide: 'left', toAt: SY + 50, mid: 350 },
        { id: 'uses-iade', from: 'IadeServisi', to: 'TakipNoUretici', type: 'dependency', label: 'getInstance()', fromSide: 'right', fromAt: 350, toSide: 'left', toAt: SY + 120, mid: 350 }
      );
    }
    if (step >= 2) relations.push(selfLoop);
    // Sabit görüş kutusu: adımlar arasında ölçek değişmesin
    return { width: 900, height: 480, view: [0, 60, 900, 410], classes, relations };
  };

  // ------------------------------------------------------------------ UML sıralama diyagramı (Canlı Akış)
  SG.seqSpec = () => ({
    width: 1000,
    height: 700,
    top: 112,
    margin: 80,
    rowH: 33,
    participants: [
      { id: 'main', label: 'Main', role: 'client' },
      { id: 'sip', label: 'siparis\n: SiparisServisi', role: 'client', object: true },
      { id: 'iade', label: 'iade\n: IadeServisi', role: 'client', object: true },
      { id: 'cls', label: 'TakipNoUretici\n(sınıf · static)', role: 'singleton' },
      { id: 'obj', label: 'ornek\n: TakipNoUretici', role: 'singleton', object: true },
    ],
    messages: [
      { from: 'main', to: 'sip', kind: 'create', label: '«create»' },
      { from: 'main', to: 'iade', kind: 'create', label: '«create»' },
      { from: 'main', to: 'sip', kind: 'call', label: 'siparisAl(…)' },
      { from: 'sip', to: 'cls', kind: 'call', label: 'getInstance()' },
      { from: 'cls', to: 'obj', kind: 'create', label: '«create»' },
      { from: 'cls', to: 'sip', kind: 'return', label: 'ornek' },
      { from: 'sip', to: 'obj', kind: 'call', label: 'yeniNumara()', short: true },
      { from: 'sip', to: 'main', kind: 'return', label: '"KRG-1001"' },
      { from: 'main', to: 'sip', kind: 'call', label: 'siparisAl(…)' },
      { from: 'sip', to: 'cls', kind: 'call', label: 'getInstance() → aynı ornek', short: true },
      { from: 'sip', to: 'obj', kind: 'call', label: 'yeniNumara()', short: true },
      { from: 'sip', to: 'main', kind: 'return', label: '"KRG-1002"' },
      { from: 'main', to: 'iade', kind: 'call', label: 'iadeAl(…)' },
      { from: 'iade', to: 'cls', kind: 'call', label: 'getInstance() → aynı ornek', short: true },
      { from: 'iade', to: 'obj', kind: 'call', label: 'yeniNumara()', short: true },
      { from: 'iade', to: 'main', kind: 'return', label: '"KRG-1003"' },
      { from: 'main', to: 'cls', kind: 'call', label: 'getInstance() ×2 → a == b', short: true },
    ],
    initialActive: ['main'],
  });
})();
