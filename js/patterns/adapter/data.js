/*
 * Adapter — veri: Java kodları, çıktılar, roller, diyagram tanımları.
 * Bu dosya DOM kullanmaz; tools/export-java.js de Java dosyalarını buradan üretir.
 *
 * Senaryo (lojistik dünyasının devamı): Şirket yurt dışına açılıyor; ortak firma GlobalShip'in Java
 * kütüphanesi bizim KargoFirmasi arayüzümüze uymuyor: ağırlığı POUND (lb) ister, gönderi numarası bir
 * sayıdır, durumu bir kodla bildirir. Kütüphaneyi değiştiremeyiz (üçüncü parti .jar).
 *   Kalıpsız: servisler yabancı API'yi doğrudan öğrenir; çeviri kodu kopyalanır ve İade servisinde
 *             kg → lb çevirisi unutulur (aynı koli 12 lb olarak bildirilir).
 *   Adapter : GlobalShipAdaptoru implements KargoFirmasi — bütün çeviri tek yerde.
 *   Nesne ↔ sınıf adaptörü, yeni firma (EuroCargo) ve JDK'daki adaptörler.
 */
(function () {
  'use strict';
  const DP = (window.DP = window.DP || {});
  const AD = (DP.ad = DP.ad || {});

  // ------------------------------------------------------------------ roller
  AD.roles = {
    client: { en: 'Client', tr: 'İstemci', color: 1 },
    target: { en: 'Target', tr: 'Hedef arayüz', color: 2 },
    adapter: { en: 'Adapter', tr: 'Adaptör', color: 3 },
    adaptee: { en: 'Adaptee', tr: 'Uyarlanan', color: 5 },
    native: { en: 'Target uygulaması', tr: 'arayüze zaten uyan', color: 4 },
  };

  AD.classRoles = {
    Main: 'client',
    GonderiServisi: 'client',
    IadeServisi: 'client',
    KargoFirmasi: 'target',
    GlobalShipAdaptoru: 'adapter',
    GlobalShipSinifAdaptoru: 'adapter',
    EuroCargoAdaptoru: 'adapter',
    GlobalShipApi: 'adaptee',
    ShipmentRequest: 'adaptee',
    EuroCargoClient: 'adaptee',
    HizliKargo: 'native',
    // GoF genel adları
    Client: 'client',
    Target: 'target',
    Adapter: 'adapter',
    Adaptee: 'adaptee',
  };

  AD.roleOf = function (name) {
    const r = AD.classRoles[name];
    return r ? AD.roles[r].color : null;
  };

  // Kodda iki "dil": hedef arayüzün kelimeleri (mavi) ve uyarlananın kelimeleri (turuncu)
  AD.special = {
    gonderiOlustur: 'tgt',
    durumSorgula: 'tgt',
    createShipment: 'ade',
    trackStatus: 'ade',
    book: 'ade',
    isDelivered: 'ade',
  };

  /** 1 tabanlı satır numarası (yığın izi ve derleyici hatalarını kodla tutarlı üretmek için). */
  AD.lineOf = function (src, needle, from) {
    const lines = src.split('\n');
    for (let i = from || 0; i < lines.length; i++) if (lines[i].includes(needle)) return i + 1;
    return 0;
  };

  /** Satırın sonuna, belirli bir sütundan başlayan yorum ekler (yorumlar alt alta hizalı dursun). */
  const cm = (line, comment, col) => line.padEnd(col || 60) + '// ' + comment;

  const code = (AD.code = {});
  const doc = (text) => `/**\n * ${text}\n */\n`;

  // ================================================================== gönderiler ve hesaplar (Java ile birebir)
  AD.LB_PER_KG = 2.20462;
  AD.DURUMLAR = ['Hazırlanıyor', 'Aktarma merkezinde', 'Yolda', 'Teslim edildi'];
  AD.lb = (kg) => (kg * AD.LB_PER_KG).toFixed(2); // Java: %.2f (Locale.US)

  AD.ship = {
    yurtici: { nereden: 'Malatya', nereye: 'Ankara', kg: 20 },
    yurtdisi: { nereden: 'İstanbul', nereye: 'Berlin', kg: 12 },
    iade: { nereden: 'Berlin', nereye: 'İstanbul', kg: 12 },
    iadeYurtici: { nereden: 'Ankara', nereye: 'Malatya', kg: 20 },
    avrupa: { nereden: 'İzmir', nereye: 'Roma', kg: 3 },
  };
  const S = AD.ship;

  const hk = (no, s) => `[HızlıKargo] HK-${no}: ${s.nereden} > ${s.nereye}, ${s.kg} kg`;
  const gs = (id, s, lb) => `[GlobalShip] #${id} created: ${s.nereden} -> ${s.nereye}, ${lb} lb`;
  AD.line = { hk, gs };

  // ================================================================== ortak sınıflar
  AD.kargoFirmasi = (tag) => `${doc((tag ? '«Target» — ' : '') + 'Sistemimizin her kargo firmasından beklediği arayüz.')}public interface KargoFirmasi {

${cm('    String gonderiOlustur(String nereden, String nereye, int kg);', '→ takip numarası', 68)}

${cm('    String durumSorgula(String takipNo);', '→ "Yolda" gibi bir metin', 68)}
}`;

  code.HizliKargo = `${doc('Yurt içi kargo firmamız: KargoFirmasi arayüzünü zaten uyguluyor.')}public class HizliKargo implements KargoFirmasi {

    private int sonNo = 1000;

    @Override
    public String gonderiOlustur(String nereden, String nereye, int kg) {
        String takipNo = "HK-" + (++sonNo);
        System.out.println("[HızlıKargo] " + takipNo + ": " + nereden + " > " + nereye + ", " + kg + " kg");
        return takipNo;
    }

    @Override
    public String durumSorgula(String takipNo) {
        return "Dağıtımda";
    }
}`;

  /** GlobalShip kütüphanesi (Adaptee). fin: sınıf final mı? (nesne ↔ sınıf adaptörü sahnesi) */
  AD.globalShipApi = (tag, fin) => `import java.util.Locale;

${doc((tag ? '«Adaptee» — ' : '') + 'GlobalShip\'in Java kütüphanesi (üçüncü parti .jar: kaynak kodunu DEĞİŞTİREMEYİZ).\n * Ağırlık POUND (lb) cinsinden; gönderi numarası bir sayı; durum bir kod.')}public ${fin ? 'final ' : ''}class GlobalShipApi {

    private long sonId = 48212;

    public long createShipment(ShipmentRequest request) {
        long id = ++sonId;
        System.out.printf(Locale.US, "[GlobalShip] #%d created: %s -> %s, %.2f lb%n",
                id, request.from(), request.to(), request.weightLb());
        return id;
    }

    /** 0: CREATED · 1: AT_HUB · 2: IN_TRANSIT · 3: DELIVERED */
    public int trackStatus(long shipmentId) {
        return 2;                                   // örnekte her gönderi yolda
    }
}`;

  code.ShipmentRequest = `${doc('GlobalShip kütüphanesinin istek nesnesi (o da üçüncü parti).')}public record ShipmentRequest(String from, String to, double weightLb) {
}`;

  // ------------------------------------------------------------------ istemciler (kalıplı hâl = sürüm 1.0)
  AD.gonderiServisi = (tag) => `${doc((tag ? '«Client» — ' : '') + 'Gönderi servisi: yalnızca KargoFirmasi arayüzünü tanır.')}public class GonderiServisi {

    private final KargoFirmasi firma;

    public GonderiServisi(KargoFirmasi firma) {
        this.firma = firma;
    }

    public void gonder(String nereden, String nereye, int kg) {
        String takipNo = firma.gonderiOlustur(nereden, nereye, kg);
        System.out.println("Takip no: " + takipNo + " | durum: " + firma.durumSorgula(takipNo));
    }
}`;

  AD.iadeServisi = (tag) => `${doc((tag ? '«Client» — ' : '') + 'İade servisi: o da yalnızca KargoFirmasi arayüzünü tanır.')}public class IadeServisi {

    private final KargoFirmasi firma;

    public IadeServisi(KargoFirmasi firma) {
        this.firma = firma;
    }

    public void iadeAl(String musteriSehri, String depoSehri, int kg) {
        String takipNo = firma.gonderiOlustur(musteriSehri, depoSehri, kg);
        System.out.println("İade takip no: " + takipNo);
    }
}`;

  // ------------------------------------------------------------------ "Sorun": kalıpsız sürümler
  const gonderiHack = `${doc('Gönderi servisi — yurt dışı için GlobalShip\'i DOĞRUDAN kullanıyor.')}public class GonderiServisi {

    private final KargoFirmasi firma;
    private final GlobalShipApi globalShip;

    public GonderiServisi(KargoFirmasi firma, GlobalShipApi globalShip) {
        this.firma = firma;
        this.globalShip = globalShip;
    }

    public void gonder(String nereden, String nereye, int kg, boolean yurtdisi) {
        if (yurtdisi) {
${cm('            double lb = kg * 2.20462;', 'birim çevirisi istemcide', 76)}
            long id = globalShip.createShipment(new ShipmentRequest(nereden, nereye, lb));
            String durum = globalShip.trackStatus(id) == 2 ? "Yolda" : "Bilinmiyor";
            System.out.println("Takip no: GS-" + id + " | durum: " + durum);
        } else {
            String takipNo = firma.gonderiOlustur(nereden, nereye, kg);
            System.out.println("Takip no: " + takipNo + " | durum: " + firma.durumSorgula(takipNo));
        }
    }
}`;

  const iadeHack = `${doc('İade servisi — başka bir geliştirici yazdı; GlobalShip kodunu kopyaladı.')}public class IadeServisi {

    private final KargoFirmasi firma;
    private final GlobalShipApi globalShip;

    public IadeServisi(KargoFirmasi firma, GlobalShipApi globalShip) {
        this.firma = firma;
        this.globalShip = globalShip;
    }

    public void iadeAl(String musteriSehri, String depoSehri, int kg, boolean yurtdisi) {
        if (yurtdisi) {
            long id = globalShip.createShipment(new ShipmentRequest(musteriSehri, depoSehri, kg));
            System.out.println("İade takip no: GS-" + id);
        } else {
            System.out.println("İade takip no: " + firma.gonderiOlustur(musteriSehri, depoSehri, kg));
        }
    }
}`;

  const mainV1 = `public class Main {

    public static void main(String[] args) {
        KargoFirmasi yurtici = new HizliKargo();

        new GonderiServisi(yurtici).gonder("Malatya", "Ankara", 20);
        new IadeServisi(yurtici).iadeAl("Ankara", "Malatya", 20);
    }
}`;

  const mainTry = `public class Main {

    public static void main(String[] args) {
        KargoFirmasi yurtici = new HizliKargo();
${cm('        KargoFirmasi yurtdisi = new GlobalShipApi();', 'yeni ortak: takılır mı?', 60)}

        new GonderiServisi(yurtici).gonder("Malatya", "Ankara", 20);
        new GonderiServisi(yurtdisi).gonder("İstanbul", "Berlin", 12);
    }
}`;

  const mainV2 = `public class Main {

    public static void main(String[] args) {
        KargoFirmasi yurtici = new HizliKargo();
        GlobalShipApi globalShip = new GlobalShipApi();

        new GonderiServisi(yurtici, globalShip).gonder("Malatya", "Ankara", 20, false);
        new GonderiServisi(yurtici, globalShip).gonder("İstanbul", "Berlin", 12, true);
    }
}`;

  const mainV3 = `public class Main {

    public static void main(String[] args) {
        KargoFirmasi yurtici = new HizliKargo();
        GlobalShipApi globalShip = new GlobalShipApi();

        new GonderiServisi(yurtici, globalShip).gonder("Malatya", "Ankara", 20, false);
        new GonderiServisi(yurtici, globalShip).gonder("İstanbul", "Berlin", 12, true);
        new IadeServisi(yurtici, globalShip).iadeAl("Berlin", "İstanbul", 12, true);
    }
}`;

  /** Kalıpsız sürümlerin dosyaları. v: 'v1' | 'dene' | 'v2' | 'v3' */
  AD.naive = function (v) {
    const files = {};
    if (v === 'v1' || v === 'dene') {
      files.GonderiServisi = AD.gonderiServisi(false);
      files.IadeServisi = AD.iadeServisi(false);
      files.Main = v === 'v1' ? mainV1 : mainTry;
    } else {
      files.GonderiServisi = gonderiHack;
      files.IadeServisi = v === 'v3' ? iadeHack : AD.iadeServisi(false);
      files.Main = v === 'v3' ? mainV3 : mainV2;
    }
    files.KargoFirmasi = AD.kargoFirmasi(false);
    files.HizliKargo = code.HizliKargo;
    if (v !== 'v1') {
      files.GlobalShipApi = AD.globalShipApi(false);
      files.ShipmentRequest = code.ShipmentRequest;
    }
    return files;
  };

  /** Kalıpsız sürümlerin çıktısı (Java ile birebir). {t, gs (GlobalShip satırı), bad, err} */
  AD.naiveOutput = function (v) {
    if (v === 'dene') {
      const src = mainTry;
      const ln = AD.lineOf(src, 'new GlobalShipApi()');
      const text = src.split('\n')[ln - 1];
      return [
        { t: `Main.java:${ln}: error: incompatible types: GlobalShipApi cannot be converted to KargoFirmasi`, err: true },
        { t: text },
        { t: ' '.repeat(text.indexOf('new GlobalShipApi')) + '^' },
        { t: '1 error', err: true },
      ];
    }
    if (v === 'v1') {
      return [{ t: hk(1001, S.yurtici) }, { t: 'Takip no: HK-1001 | durum: Dağıtımda' }, { t: hk(1002, S.iadeYurtici) }, { t: 'İade takip no: HK-1002' }];
    }
    const out = [
      { t: hk(1001, S.yurtici) },
      { t: 'Takip no: HK-1001 | durum: Dağıtımda' },
      { t: gs(48213, S.yurtdisi, AD.lb(S.yurtdisi.kg)), gs: true },
      { t: 'Takip no: GS-48213 | durum: Yolda' },
    ];
    if (v === 'v3') {
      out.push({ t: gs(48214, S.iade, S.iade.kg.toFixed(2)), gs: true, bad: true });
      out.push({ t: 'İade takip no: GS-48214' });
    }
    return out;
  };

  // ================================================================== "Çözüm": nesne adaptörü
  const adapterSkeleton = `public class GlobalShipAdaptoru implements KargoFirmasi {

    private final GlobalShipApi api;

    public GlobalShipAdaptoru(GlobalShipApi api) {
        this.api = api;
    }
}`;

  /** GlobalShipAdaptoru.java. tag: rol açıklaması (son hâl) */
  AD.adaptor = (tag) => `${tag ? doc('«Adapter» — GlobalShip\'i, sistemimizin beklediği KargoFirmasi arayüzüne uyarlar.\n * Bütün çeviri (ad, birim, numara, durum) YALNIZCA burada.') : ''}public class GlobalShipAdaptoru implements KargoFirmasi {

    private static final double LB_PER_KG = 2.20462;
    private static final String[] DURUMLAR = {"Hazırlanıyor", "Aktarma merkezinde", "Yolda", "Teslim edildi"};

${cm('    private final GlobalShipApi api;', 'uyarlanan nesne (kompozisyon)', 72)}

    public GlobalShipAdaptoru(GlobalShipApi api) {
        this.api = api;
    }

    @Override
    public String gonderiOlustur(String nereden, String nereye, int kg) {
${cm('        double lb = kg * LB_PER_KG;', 'birim: kg → lb', 72)}
        long id = api.createShipment(new ShipmentRequest(nereden, nereye, lb));
${cm('        return "GS-" + id;', 'numara: 48213 → "GS-48213"', 72)}
    }

    @Override
    public String durumSorgula(String takipNo) {
${cm('        long id = Long.parseLong(takipNo.substring(3));', '"GS-48213" → 48213', 72)}
${cm('        return DURUMLAR[api.trackStatus(id)];', 'kod: 2 → "Yolda"', 72)}
    }
}`;

  code.KargoFirmasi = AD.kargoFirmasi(true);
  code.GlobalShipApi = AD.globalShipApi(true, false);
  code.GlobalShipAdaptoru = AD.adaptor(true);
  code.GonderiServisi = AD.gonderiServisi(true);
  code.IadeServisi = AD.iadeServisi(true);
  code.Main = `public class Main {

    public static void main(String[] args) {
        KargoFirmasi yurtici = new HizliKargo();
${cm('        KargoFirmasi yurtdisi = new GlobalShipAdaptoru(new GlobalShipApi());', 'yabancı kütüphane, sarmalanmış', 80)}

        new GonderiServisi(yurtici).gonder("Malatya", "Ankara", 20);
        new GonderiServisi(yurtdisi).gonder("İstanbul", "Berlin", 12);
        new IadeServisi(yurtdisi).iadeAl("Berlin", "İstanbul", 12);
    }
}`;

  /** Kalıplı çözümün çıktısı: iade de doğru ağırlıkla bildiriliyor. */
  AD.output = [
    hk(1001, S.yurtici),
    'Takip no: HK-1001 | durum: Dağıtımda',
    gs(48213, S.yurtdisi, AD.lb(S.yurtdisi.kg)),
    'Takip no: GS-48213 | durum: Yolda',
    gs(48214, S.iade, AD.lb(S.iade.kg)),
    'İade takip no: GS-48214',
  ];

  // ------------------------------------------------------------------ adım adım yeniden düzenleme
  const base = (o) =>
    Object.assign(
      {
        GonderiServisi: gonderiHack,
        IadeServisi: iadeHack,
        Main: mainV3,
        KargoFirmasi: AD.kargoFirmasi(false),
        HizliKargo: code.HizliKargo,
        GlobalShipApi: AD.globalShipApi(false),
        ShipmentRequest: code.ShipmentRequest,
      },
      o || {}
    );
  AD.refactor = [
    base(), // 0: kalıpsız (iade 12 lb)
    base({ GlobalShipAdaptoru: adapterSkeleton }), // 1: adaptör iskeleti → derlenmez
    base({ GlobalShipAdaptoru: AD.adaptor(false) }), // 2: çeviri metotları
    base({
      // 3: istemciler yalnızca KargoFirmasi'yı bilir; Main adaptörü bağlar
      GlobalShipAdaptoru: AD.adaptor(false),
      GonderiServisi: AD.gonderiServisi(false),
      IadeServisi: AD.iadeServisi(false),
      Main: code.Main,
    }),
  ];
  AD.refactorOrder = ['GlobalShipAdaptoru', 'GonderiServisi', 'IadeServisi', 'Main', 'KargoFirmasi', 'HizliKargo', 'GlobalShipApi', 'ShipmentRequest'];

  /** Adım 1'deki gerçek javac hatası: adaptör iskeleti arayüzün metotlarını henüz yazmadı. */
  AD.refactorErrors = function () {
    const src = adapterSkeleton;
    const ln = AD.lineOf(src, 'public class GlobalShipAdaptoru');
    const text = src.split('\n')[ln - 1];
    return [
      { t: `GlobalShipAdaptoru.java:${ln}: error: GlobalShipAdaptoru is not abstract and does not override abstract method durumSorgula(String) in KargoFirmasi`, err: true },
      { t: text },
      { t: ' '.repeat(text.indexOf('class ')) + '^' },
      { t: '1 error', err: true },
    ];
  };

  // ================================================================== Canlı Akış: tek gönderinin yolculuğu
  AD.akis = {};
  AD.akis.Main = `public class Main {

    public static void main(String[] args) {
${cm('        GlobalShipApi api = new GlobalShipApi();', 'uyarlanan: dokunamayız', 64)}
${cm('        KargoFirmasi firma = new GlobalShipAdaptoru(api);', 'adaptör onu sarmalar', 64)}
${cm('        GonderiServisi servis = new GonderiServisi(firma);', 'istemci yalnızca arayüzü bilir', 64)}

        servis.gonder("İstanbul", "Berlin", 12);
    }
}`;
  AD.akis.files = () => [
    { name: 'Main.java', code: AD.akis.Main },
    { name: 'GonderiServisi.java', code: code.GonderiServisi },
    { name: 'GlobalShipAdaptoru.java', code: code.GlobalShipAdaptoru },
    { name: 'GlobalShipApi.java', code: code.GlobalShipApi },
    { name: 'KargoFirmasi.java', code: code.KargoFirmasi },
    { name: 'ShipmentRequest.java', code: code.ShipmentRequest },
  ];
  AD.akis.output = [gs(48213, S.yurtdisi, AD.lb(S.yurtdisi.kg)), 'Takip no: GS-48213 | durum: Yolda'];

  // ================================================================== Nesne adaptörü ↔ sınıf adaptörü
  const SA = (AD.sinif = {});

  SA.adaptor = `${doc('«Adapter» (SINIF adaptörü) — GlobalShipApi\'den KALITIR, KargoFirmasi\'nı uygular.')}public class GlobalShipSinifAdaptoru extends GlobalShipApi implements KargoFirmasi {

    private static final double LB_PER_KG = 2.20462;
    private static final String[] DURUMLAR = {"Hazırlanıyor", "Aktarma merkezinde", "Yolda", "Teslim edildi"};

    @Override
    public String gonderiOlustur(String nereden, String nereye, int kg) {
${cm('        long id = createShipment(new ShipmentRequest(nereden, nereye, kg * LB_PER_KG));', 'miras alınan metot', 92)}
        return "GS-" + id;
    }

    @Override
    public String durumSorgula(String takipNo) {
        return DURUMLAR[trackStatus(Long.parseLong(takipNo.substring(3)))];
    }
}`;

  /** Sahnedeki Main'ler. form: 'nesne' | 'sinif' · sizinti: adaptör üzerinden yabancı metodu doğrudan çağır */
  SA.main = (form, sizinti) => {
    const decl =
      form === 'sinif'
        ? sizinti
          ? cm('        GlobalShipSinifAdaptoru adaptor = new GlobalShipSinifAdaptoru();', 'tek nesne: hem adaptör hem uyarlanan', 76)
          : cm('        KargoFirmasi adaptor = new GlobalShipSinifAdaptoru();', 'tek nesne: hem adaptör hem uyarlanan', 76)
        : sizinti
        ? cm('        GlobalShipAdaptoru adaptor = new GlobalShipAdaptoru(new GlobalShipApi());', 'iki nesne: adaptör + uyarlanan', 76)
        : cm('        KargoFirmasi adaptor = new GlobalShipAdaptoru(new GlobalShipApi());', 'iki nesne: adaptör + uyarlanan', 76);
    return `public class Main {

    public static void main(String[] args) {
${decl}
        new GonderiServisi(adaptor).gonder("İstanbul", "Berlin", 12);${
          sizinti
            ? `

        // aceleci bir geliştirici çeviriyi atlayıp yabancı metodu DOĞRUDAN çağırıyor:
        adaptor.createShipment(new ShipmentRequest("Berlin", "İstanbul", 12));`
            : ''
        }
    }
}`;
  };

  /**
   * Sahnedeki varyantlar. Her biri: dosyalar + gerçek sonuç.
   * nesne / sinif         : iki biçim de aynı çıktıyı verir
   * sizintiSinif          : sınıf adaptörü yabancı metodu da miras alır → çeviri atlanır (12 lb)
   * sizintiNesne          : nesne adaptöründe aynı satır derlenmez (cannot find symbol)
   * finalSinif / finalNesne: kütüphane sınıfı final ise sınıf adaptörü yazılamaz
   */
  SA.variants = {
    nesne: { form: 'nesne', files: { GlobalShipAdaptoru: code.GlobalShipAdaptoru, Main: SA.main('nesne') } },
    sinif: { form: 'sinif', files: { GlobalShipSinifAdaptoru: SA.adaptor, Main: SA.main('sinif') } },
    sizintiSinif: { form: 'sinif', files: { GlobalShipSinifAdaptoru: SA.adaptor, Main: SA.main('sinif', true) } },
    sizintiNesne: { form: 'nesne', files: { GlobalShipAdaptoru: code.GlobalShipAdaptoru, Main: SA.main('nesne', true) } },
    finalSinif: { form: 'sinif', fin: true, files: { GlobalShipSinifAdaptoru: SA.adaptor, Main: SA.main('sinif') } },
    finalNesne: { form: 'nesne', fin: true, files: { GlobalShipAdaptoru: code.GlobalShipAdaptoru, Main: SA.main('nesne') } },
  };

  /** Bir varyantın derlenecek bütün dosyaları. */
  SA.filesOf = function (k) {
    const v = SA.variants[k];
    return Object.assign(
      {
        KargoFirmasi: code.KargoFirmasi,
        GonderiServisi: code.GonderiServisi,
        GlobalShipApi: AD.globalShipApi(true, !!v.fin),
        ShipmentRequest: code.ShipmentRequest,
      },
      v.files
    );
  };

  /** Bir varyantın gerçek sonucu: {cmd, lines, compileError} */
  SA.output = function (k) {
    const okLines = [{ t: gs(48213, S.yurtdisi, AD.lb(S.yurtdisi.kg)) }, { t: 'Takip no: GS-48213 | durum: Yolda' }];
    if (k === 'sizintiNesne') {
      const src = SA.main('nesne', true);
      const ln = AD.lineOf(src, 'adaptor.createShipment(');
      const text = src.split('\n')[ln - 1];
      return {
        cmd: '$ javac *.java',
        compileError: true,
        lines: [
          { t: `Main.java:${ln}: error: cannot find symbol`, err: true },
          { t: text },
          { t: ' '.repeat(text.indexOf('.createShipment')) + '^' },
          { t: '  symbol:   method createShipment(ShipmentRequest)' },
          { t: '  location: variable adaptor of type GlobalShipAdaptoru' },
          { t: '1 error', err: true },
        ],
      };
    }
    if (k === 'finalSinif') {
      const src = SA.adaptor;
      const ln = AD.lineOf(src, 'public class GlobalShipSinifAdaptoru');
      const text = src.split('\n')[ln - 1];
      return {
        cmd: '$ javac *.java',
        compileError: true,
        lines: [
          { t: `GlobalShipSinifAdaptoru.java:${ln}: error: cannot inherit from final GlobalShipApi`, err: true },
          { t: text },
          { t: ' '.repeat(text.indexOf('GlobalShipApi')) + '^' },
          { t: '1 error', err: true },
        ],
      };
    }
    const lines = okLines.slice();
    if (k === 'sizintiSinif') lines.push({ t: gs(48214, S.iade, S.iade.kg.toFixed(2)), bad: true });
    return { cmd: '$ javac *.java && java Main', lines };
  };

  // ================================================================== Genişlet: yeni ortak EuroCargo
  const EC = (AD.euro = {});
  EC.client = `${doc('«Adaptee» — EuroCargo\'nun istemci kütüphanesi (üçüncü parti). Ağırlık GRAM, rota tek bir metin.')}public class EuroCargoClient {

    private int sira = 7730;

    public String book(String route, int grams) {
        String code = "EC/" + (++sira);
        System.out.println("[EuroCargo] " + code + " booked: " + route + ", " + grams + " g");
        return code;
    }

    public boolean isDelivered(String bookingCode) {
        return false;
    }
}`;

  EC.adaptor = `${doc('«Adapter» — EuroCargo\'yu KargoFirmasi arayüzüne uyarlar.')}public class EuroCargoAdaptoru implements KargoFirmasi {

    private final EuroCargoClient client;

    public EuroCargoAdaptoru(EuroCargoClient client) {
        this.client = client;
    }

    @Override
    public String gonderiOlustur(String nereden, String nereye, int kg) {
${cm('        return client.book(nereden + " > " + nereye, kg * 1000);', 'kg → gram, iki şehir → tek rota', 68)}
    }

    @Override
    public String durumSorgula(String takipNo) {
        return client.isDelivered(takipNo) ? "Teslim edildi" : "Yolda";
    }
}`;

  EC.exercise = `public class EuroCargoAdaptoru implements ⟦1⟧ {

    private final ⟦2⟧ client;

    public EuroCargoAdaptoru(EuroCargoClient client) {
        this.client = client;
    }

    @Override
    public String gonderiOlustur(String nereden, String nereye, int kg) {
        return client.⟦3⟧(nereden + " > " + nereye, kg * ⟦4⟧);
    }

    @Override
    public String durumSorgula(String takipNo) {
        return client.isDelivered(takipNo) ? "Teslim edildi" : "Yolda";
    }
}`;
  EC.exerciseMain = `// Main.java içine:
KargoFirmasi avrupa = new ⟦5⟧(new EuroCargoClient());
new GonderiServisi(avrupa).gonder("İzmir", "Roma", 3);`;

  EC.Main = `public class Main {

    public static void main(String[] args) {
        KargoFirmasi yurtici = new HizliKargo();
        KargoFirmasi yurtdisi = new GlobalShipAdaptoru(new GlobalShipApi());
${cm('        KargoFirmasi avrupa = new EuroCargoAdaptoru(new EuroCargoClient());', 'YENİ', 80)}

        new GonderiServisi(yurtici).gonder("Malatya", "Ankara", 20);
        new GonderiServisi(yurtdisi).gonder("İstanbul", "Berlin", 12);
        new GonderiServisi(avrupa).gonder("İzmir", "Roma", 3);
    }
}`;
  EC.output = [
    hk(1001, S.yurtici),
    'Takip no: HK-1001 | durum: Dağıtımda',
    gs(48213, S.yurtdisi, AD.lb(S.yurtdisi.kg)),
    'Takip no: GS-48213 | durum: Yolda',
    `[EuroCargo] EC/7731 booked: ${S.avrupa.nereden} > ${S.avrupa.nereye}, ${S.avrupa.kg * 1000} g`,
    'Takip no: EC/7731 | durum: Yolda',
  ];

  // ================================================================== Gerçek dünya (JDK) örnekleri
  // Kodlar burada durur ki çıktıları gerçek Java ile karşılaştırılabilsin.
  const RW = (AD.rw = {});

  RW.asList = (arg) => `import java.util.Arrays;
import java.util.List;

public class DiziGorunumu {

    public static void main(String[] args) {
        String[] sehirler = {"İstanbul", "Berlin", "Roma"};
${cm('        List<String> liste = Arrays.asList(sehirler);', 'dizi → List (kopya değil, GÖRÜNÜM)', 56)}

${cm('        ' + arg, arg.startsWith('liste.set') ? 'listeye yazmak diziye yazmaktır' : 'sabit boyutlu dizi büyüyemez', 56)}

        System.out.println("liste: " + liste);
        System.out.println("dizi : " + Arrays.toString(sehirler));
    }
}`;
  RW.asListOpts = [
    { label: 'liste.set(…)', arg: 'liste.set(1, "Paris");', out: ['liste: [İstanbul, Paris, Roma]', 'dizi : [İstanbul, Paris, Roma]'] },
    {
      label: 'liste.add(…)',
      arg: 'liste.add("Viyana");',
      out: [
        'Exception in thread "main" java.lang.UnsupportedOperationException',
        '\tat java.base/java.util.AbstractList.add(AbstractList.java:155)',
        '\tat java.base/java.util.AbstractList.add(AbstractList.java:113)',
        `\tat DiziGorunumu.main(DiziGorunumu.java:${AD.lineOf(RW.asList('liste.add("Viyana");'), 'liste.add(')})`,
      ],
    },
  ];

  RW.reader = (arg) => `import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;

public class BaytKarakter {

    public static void main(String[] args) throws IOException {
        byte[] baytlar = "Ağırlık: 12 kg".getBytes(StandardCharsets.UTF_8);
${cm('        InputStream baytAkisi = new ByteArrayInputStream(baytlar);', 'uyarlanan: BAYT akışı', 84)}
${cm(`        Reader okuyucu = new InputStreamReader(baytAkisi, ${arg});`, 'adaptör: KARAKTER okuyucu', 84)}

        StringBuilder metin = new StringBuilder();
        int c;
        while ((c = okuyucu.read()) != -1) {
            metin.append((char) c);
        }
        System.out.println(baytlar.length + " bayt → " + metin.length() + " karakter: " + metin);
    }
}`;
  RW.readerOpts = [
    { label: 'UTF-8 ile çevir', arg: 'StandardCharsets.UTF_8', out: ['17 bayt → 14 karakter: Ağırlık: 12 kg'] },
    { label: 'US-ASCII ile çevir', arg: 'StandardCharsets.US_ASCII', out: ['17 bayt → 17 karakter: A����rl��k: 12 kg'] },
  ];

  RW.callable = () => `import java.util.concurrent.Callable;
import java.util.concurrent.Executors;

public class GorevUyarla {

    public static void main(String[] args) throws Exception {
${cm('        Runnable sayim = () -> System.out.println("Depo sayımı yapıldı");', 'uyarlanan: sonuç döndürmez', 80)}
${cm('        Callable<String> gorev = Executors.callable(sayim, "TAMAM");', 'adaptör: Callable gibi davranır', 80)}

        System.out.println("Sonuç: " + gorev.call());
        System.out.println("Sınıf: " + gorev.getClass().getName());
    }
}`;
  RW.callableOut = ['Depo sayımı yapıldı', 'Sonuç: TAMAM', 'Sınıf: java.util.concurrent.Executors$RunnableAdapter'];

  // ================================================================== UML sınıf diyagramları
  const M = {
    req: { id: 'gonderiOlustur', text: '+ gonderiOlustur(nereden, nereye, kg): String', generic: '+ request()', abstract: true },
    durum: { id: 'durumSorgula', text: '+ durumSorgula(takipNo): String', generic: '+ request2()', abstract: true },
    adReq: { id: 'gonderiOlustur', text: '+ gonderiOlustur(…): String', generic: '+ request()', factory: true },
    adDurum: { id: 'durumSorgula', text: '+ durumSorgula(…): String', generic: '+ request2()', factory: true },
    api: { id: 'api', text: '- api: GlobalShipApi', generic: '- adaptee: Adaptee', color: 5 },
    create: { id: 'createShipment', text: '+ createShipment(req): long', generic: '+ specificRequest()' },
    track: { id: 'trackStatus', text: '+ trackStatus(id): int', generic: '+ specificRequest2()' },
    gonder: { id: 'gonder', text: '+ gonder(nereden, nereye, kg)', generic: '+ operation()' },
    iadeAl: { id: 'iadeAl', text: '+ iadeAl(…)', generic: '+ operation()' },
    hkReq: { id: 'gonderiOlustur', text: '+ gonderiOlustur(…)', generic: '+ request()' },
  };
  AD.members = M;

  /**
   * "Çözüm" sahnesinin her adımındaki diyagram (0: istemciler yabancı API'yi tanır … 3: adaptör).
   * Sol sütun: istemciler ve (altlarında) uyarlanan; sağ: hedef arayüz, yerli firma ve adaptör.
   */
  AD.solutionDiagram = function (st) {
    const clientsKnowApi = st < 3;
    const apiField = { id: 'globalShip', text: '- globalShip: GlobalShipApi', color: 5 };
    const classes = [
      { id: 'GonderiServisi', name: 'GonderiServisi', kind: 'class', role: 'client', x: 40, y: 30, w: 290, members: clientsKnowApi ? [apiField, M.gonder] : [M.gonder] },
      { id: 'IadeServisi', name: 'IadeServisi', kind: 'class', role: 'client', x: 40, y: 190, w: 290, members: clientsKnowApi ? [apiField, M.iadeAl] : [M.iadeAl] },
      { id: 'GlobalShipApi', name: 'GlobalShipApi', kind: 'class', role: 'adaptee', x: 40, y: 400, w: 290, members: [M.create, M.track] },
      { id: 'KargoFirmasi', name: 'KargoFirmasi', kind: 'interface', role: 'target', x: 430, y: 30, w: 430, members: [M.req, M.durum] },
      { id: 'HizliKargo', name: 'HizliKargo', kind: 'class', role: 'native', x: 430, y: 250, w: 200, members: [M.hkReq] },
    ];
    const relations = [
      { id: 'g-t', from: 'GonderiServisi', to: 'KargoFirmasi', type: 'association', label: 'firma', fromSide: 'right', fromAt: 62, toSide: 'left', toAt: 62 },
      { id: 'i-t', from: 'IadeServisi', to: 'KargoFirmasi', type: 'association', label: 'firma', fromSide: 'right', fromAt: 222, toSide: 'left', toAt: 104, mid: 380 },
      { id: 'hk', from: 'HizliKargo', to: 'KargoFirmasi', type: 'realization', fromSide: 'top', fromAt: 530, toSide: 'bottom', toAt: 530 },
    ];
    if (clientsKnowApi) {
      relations.push(
        { id: 'g-api', from: 'GonderiServisi', to: 'GlobalShipApi', type: 'association', label: 'doğrudan!', tone: 'bad', fromSide: 'left', fromAt: 96, toSide: 'left', toAt: 444, points: [[20, 96], [20, 444]], labelAt: [72, 380] },
        { id: 'i-api', from: 'IadeServisi', to: 'GlobalShipApi', type: 'association', label: 'doğrudan!', tone: 'bad', fromSide: 'bottom', fromAt: 185, toSide: 'top', toAt: 185, labelAt: [236, 346] }
      );
    }
    if (st >= 1) {
      classes.push({ id: 'GlobalShipAdaptoru', name: 'GlobalShipAdaptoru', kind: 'class', role: 'adapter', x: 660, y: 250, w: 300, members: st >= 2 ? [M.api, M.adReq, M.adDurum] : [M.api] });
      relations.push({ id: 'ad-t', from: 'GlobalShipAdaptoru', to: 'KargoFirmasi', type: 'realization', fromSide: 'top', fromAt: 810, toSide: 'bottom', toAt: 810 });
      relations.push({ id: 'ad-api', from: 'GlobalShipAdaptoru', to: 'GlobalShipApi', type: 'association', label: 'api', fromSide: 'bottom', fromAt: 810, toSide: 'right', toAt: 468, points: [[810, 468]], labelAt: [786, 460] });
    }
    return { width: 980, height: 520, view: [0, 14, 975, 500], classes, relations };
  };

  /**
   * GoF yapısı (Yapı sahnesi ve özet). o.form: 'nesne' (kompozisyon) | 'sinif' (kalıtım); o.full: somut tüm sınıflar
   */
  AD.gofDiagram = function (o) {
    o = o || {};
    const sinif = o.form === 'sinif';
    const adName = sinif ? 'GlobalShipSinifAdaptoru' : 'GlobalShipAdaptoru';
    const classes = [
      { id: 'GonderiServisi', name: 'GonderiServisi', generic: 'Client', kind: 'class', role: 'client', x: 10, y: 40, w: 270, members: [M.gonder] },
      { id: 'KargoFirmasi', name: 'KargoFirmasi', generic: 'Target', kind: 'interface', role: 'target', x: 360, y: 40, w: 300, members: [Object.assign({}, M.req, { text: '+ gonderiOlustur(…): String' }), Object.assign({}, M.durum, { text: '+ durumSorgula(…): String' })] },
      { id: 'GlobalShipApi', name: 'GlobalShipApi', generic: 'Adaptee', kind: 'class', role: 'adaptee', x: 720, y: 40, w: 270, members: [M.create, M.track] },
      { id: 'Adaptor', name: adName, generic: 'Adapter', kind: 'class', role: 'adapter', x: sinif ? 560 : 360, y: 300, w: sinif ? 320 : 300, members: sinif ? [M.adReq, M.adDurum] : [M.api, M.adReq, M.adDurum] },
    ];
    const relations = [
      { id: 'uses', from: 'GonderiServisi', to: 'KargoFirmasi', type: 'association', label: 'firma', genericLabel: 'target', fromSide: 'right', fromAt: 76, toSide: 'left', toAt: 76 },
      { id: 'real', from: 'Adaptor', to: 'KargoFirmasi', type: 'realization', fromSide: 'top', fromAt: sinif ? 610 : 510, toSide: 'bottom', toAt: sinif ? 610 : 510 },
    ];
    if (sinif) relations.push({ id: 'ext', from: 'Adaptor', to: 'GlobalShipApi', type: 'generalization', fromSide: 'top', fromAt: 830, toSide: 'bottom', toAt: 830 });
    else relations.push({ id: 'comp', from: 'Adaptor', to: 'GlobalShipApi', type: 'association', label: 'api', genericLabel: 'adaptee', fromSide: 'right', fromAt: 340, toSide: 'bottom', toAt: 855, points: [[855, 340]], labelAt: [770, 332] });
    const notes = o.notes
      ? [
          sinif
            ? { id: 'n-ad', x: 520, y: 470, text: 'long id = createShipment(…);   // miras', genericText: 'specificRequest();   // inherited', target: 'Adaptor', from: 'top', to: 'bottom', toAt: 720 }
            : { id: 'n-ad', x: 330, y: 470, text: 'long id = api.createShipment(…);', genericText: 'adaptee.specificRequest();', target: 'Adaptor', from: 'top', to: 'bottom', toAt: 510 },
        ]
      : [];
    return { width: 1000, height: 560, title: 'Adapter sınıf diyagramı', classes, relations, notes };
  };

  // ------------------------------------------------------------------ UML sıralama diyagramı (Canlı Akış)
  AD.seqSpec = function () {
    return {
      width: 900,
      height: 560,
      top: 110,
      margin: 110,
      rowH: 36,
      participants: [
        { id: 'main', label: 'Main', role: 'client' },
        { id: 'servis', label: 'servis\n: GonderiServisi', role: 'client', object: true },
        { id: 'firma', label: 'firma\n: GlobalShipAdaptoru', role: 'adapter', object: true },
        { id: 'api', label: 'api\n: GlobalShipApi', role: 'adaptee', object: true },
      ],
      messages: [
        { from: 'main', to: 'servis', kind: 'call', label: 'gonder("İstanbul", "Berlin", 12)' },
        { from: 'servis', to: 'firma', kind: 'call', label: 'gonderiOlustur(…, 12)' },
        { from: 'firma', to: 'firma', kind: 'self', label: 'lb = 12 × 2.20462' },
        { from: 'firma', to: 'api', kind: 'call', label: 'createShipment(… 26.46 lb)' },
        { from: 'api', to: 'firma', kind: 'return', label: '48213' },
        { from: 'firma', to: 'servis', kind: 'return', label: '"GS-48213"' },
        { from: 'servis', to: 'firma', kind: 'call', label: 'durumSorgula("GS-48213")' },
        { from: 'firma', to: 'api', kind: 'call', label: 'trackStatus(48213)' },
        { from: 'api', to: 'firma', kind: 'return', label: '2' },
        { from: 'firma', to: 'servis', kind: 'return', label: '"Yolda"' },
      ],
      initialActive: ['main'],
    };
  };
})();
