/*
 * Abstract Factory — veri: Java kodları, aileler, roller, diyagram tanımları.
 * Bu dosya DOM kullanmaz; tools/export-java.js de Java dosyalarını buradan üretir.
 *
 * Senaryo (Factory Method'un devamı): Her gönderi artık bir ÜRÜN AİLESİ gerektiriyor:
 *   araç + taşıma belgesi.  Kara: Kamyon + CMR · Deniz: Gemi + Konşimento · Hava: Uçak + AWB
 * Araçla belge aynı aileden değilse gümrük gönderiyi durdurur.
 */
(function () {
  'use strict';
  const DP = (window.DP = window.DP || {});
  const AF = (DP.af = DP.af || {});

  // ------------------------------------------------------------------ roller
  AF.roles = {
    client: { en: 'Client', tr: 'İstemci', color: 1 },
    abstractFactory: { en: 'AbstractFactory', tr: 'Soyut Fabrika', color: 2 },
    concreteFactory: { en: 'ConcreteFactory', tr: 'Somut Fabrika', color: 3 },
    abstractProduct: { en: 'AbstractProduct', tr: 'Soyut Ürün', color: 4 },
    concreteProduct: { en: 'ConcreteProduct', tr: 'Somut Ürün', color: 5 },
  };

  AF.classRoles = {
    Main: 'client',
    TeslimatServisi: 'client',
    LojistikFabrikasi: 'abstractFactory',
    KaraFabrikasi: 'concreteFactory',
    DenizFabrikasi: 'concreteFactory',
    HavaFabrikasi: 'concreteFactory',
    TestFabrikasi: 'concreteFactory',
    TasimaAraci: 'abstractProduct',
    TasimaBelgesi: 'abstractProduct',
    TasimaSigortasi: 'abstractProduct',
    Kamyon: 'concreteProduct',
    Gemi: 'concreteProduct',
    Ucak: 'concreteProduct',
    CmrBelgesi: 'concreteProduct',
    Konsimento: 'concreteProduct',
    HavaKonsimentosu: 'concreteProduct',
    // GoF genel adları
    Client: 'client',
    AbstractFactory: 'abstractFactory',
    ConcreteFactory1: 'concreteFactory',
    ConcreteFactory2: 'concreteFactory',
    ConcreteFactory3: 'concreteFactory',
    AbstractProductA: 'abstractProduct',
    AbstractProductB: 'abstractProduct',
    ProductA1: 'concreteProduct',
    ProductA2: 'concreteProduct',
    ProductA3: 'concreteProduct',
    ProductB1: 'concreteProduct',
    ProductB2: 'concreteProduct',
    ProductB3: 'concreteProduct',
  };

  AF.roleOf = function (name) {
    const r = AF.classRoles[name];
    return r ? AF.roles[r].color : null;
  };

  // Ailenin "oluştur" metotları kodda ayrıca vurgulanır (her biri aslında bir fabrika metodudur).
  AF.special = { aracOlustur: 'fm', belgeOlustur: 'fm', sigortaOlustur: 'fm', createProductA: 'fm', createProductB: 'fm' };

  // ------------------------------------------------------------------ aileler (somut fabrikalar)
  AF.families = {
    kara: {
      key: 'kara', label: 'Kara', gen: '1', factory: 'KaraFabrikasi', vehicle: 'Kamyon', vehicleTr: 'Kamyon',
      doc: 'CmrBelgesi', docName: 'CMR', docLong: 'karayolu taşıma senedi', yol: 'karayoluyla', cargo: '20 ton kayısı', kind: 'truck',
    },
    deniz: {
      key: 'deniz', label: 'Deniz', gen: '2', factory: 'DenizFabrikasi', vehicle: 'Gemi', vehicleTr: 'Gemi',
      doc: 'Konsimento', docName: 'Konşimento', docLong: 'deniz yolu taşıma senedi', yol: 'denizyoluyla', cargo: '300 konteyner fındık', kind: 'ship',
    },
    hava: {
      key: 'hava', label: 'Hava', gen: '3', factory: 'HavaFabrikasi', vehicle: 'Ucak', vehicleTr: 'Uçak',
      doc: 'HavaKonsimentosu', docName: 'AWB', docLong: 'hava yolu taşıma senedi', yol: 'havayoluyla', cargo: 'acil ilaç kolisi', kind: 'plane', extension: true,
    },
  };
  AF.familyOrder = ['kara', 'deniz', 'hava'];

  // ------------------------------------------------------------------ çözüm kodu (kanonik)
  const code = (AF.code = {});

  code.TasimaAraci = `/**
 * «AbstractProduct A» — Soyut Ürün: araç
 */
public interface TasimaAraci {

    String gerekenBelge();   // bu araç hangi belgeyle yola çıkabilir?

    void teslimEt(String yuk);
}`;

  code.TasimaBelgesi = `/**
 * «AbstractProduct B» — Soyut Ürün: taşıma belgesi
 */
public interface TasimaBelgesi {

    String ad();

    void hazirla(String yuk);
}`;

  code.vehicle = (f) => `/**
 * «ConcreteProduct» — ${f.label} ailesinin aracı
 */
public class ${f.vehicle} implements TasimaAraci {

    @Override
    public String gerekenBelge() {
        return "${f.docName}";
    }

    @Override
    public void teslimEt(String yuk) {
        System.out.println("[${f.vehicleTr}] " + yuk + " ${f.yol} teslim edildi.");
    }
}`;

  code.doc = (f) => `/**
 * «ConcreteProduct» — ${f.label} ailesinin belgesi
 */
public class ${f.doc} implements TasimaBelgesi {

    @Override
    public String ad() {
        return "${f.docName}";
    }

    @Override
    public void hazirla(String yuk) {
        System.out.println("[${f.docName}] " + yuk + " için ${f.docLong} düzenlendi.");
    }
}`;

  code.LojistikFabrikasi = `/**
 * «AbstractFactory» — Soyut Fabrika
 * Birbiriyle UYUMLU ürünlerden oluşan bir aile üretir.
 */
public interface LojistikFabrikasi {

    TasimaAraci aracOlustur();

    TasimaBelgesi belgeOlustur();
}`;

  code.factory = (f) => `/**
 * «ConcreteFactory» — ${f.label} ailesi: ${f.vehicleTr} + ${f.docName}
 */
public class ${f.factory} implements LojistikFabrikasi {

    @Override
    public TasimaAraci aracOlustur() {
        return new ${f.vehicle}();
    }

    @Override
    public TasimaBelgesi belgeOlustur() {
        return new ${f.doc}();
    }
}`;

  code.TeslimatServisi = `/**
 * «Client» — İstemci
 * Yalnızca soyut fabrikayı ve soyut ürünleri tanır.
 */
public class TeslimatServisi {

    private final LojistikFabrikasi fabrika;   // kompozisyon: fabrika dışarıdan verilir

    public TeslimatServisi(LojistikFabrikasi fabrika) {
        this.fabrika = fabrika;
    }

    public void gonder(String yuk) {
        TasimaAraci arac = fabrika.aracOlustur();
        TasimaBelgesi belge = fabrika.belgeOlustur();   // aynı aileden!
        belge.hazirla(yuk);
        Gumruk.kontrolEt(arac, belge);
        arac.teslimEt(yuk);
    }
}`;

  code.Gumruk = `/**
 * Gümrük: araç ile belge aynı aileden değilse gönderiyi durdurur.
 */
public class Gumruk {

    public static void kontrolEt(TasimaAraci arac, TasimaBelgesi belge) {
        if (!arac.gerekenBelge().equals(belge.ad())) {
            throw new IllegalStateException(
                "Gümrük: " + arac.gerekenBelge() + " bekleniyordu, " + belge.ad() + " geldi!");
        }
        System.out.println("[Gümrük] " + belge.ad() + " onaylandı.");
    }
}`;

  /** Canlı akış sahnesindeki istemci (seçilen aileye göre). */
  code.main = (f, cargo) => `public class Main {

    public static void main(String[] args) {
        // Ürün ailesi YALNIZCA burada seçilir:
        LojistikFabrikasi fabrika = new ${f.factory}();

        TeslimatServisi servis = new TeslimatServisi(fabrika);
        servis.gonder("${cargo}");
    }
}`;

  /** Dışa aktarılan (çalıştırılabilir) örnek: üç aileyi de dener. */
  code.mainAll = `public class Main {

    public static void main(String[] args) {
        new TeslimatServisi(new KaraFabrikasi()).gonder("20 ton kayısı");
        new TeslimatServisi(new DenizFabrikasi()).gonder("300 konteyner fındık");
        new TeslimatServisi(new HavaFabrikasi()).gonder("acil ilaç kolisi");   // genişletme: yeni aile
    }
}`;

  /** Birim testlerde kullanılan sahte aile ("Gerçek Dünya" sahnesi; dışa aktarılan örneklerde de var). */
  code.TestFabrikasi = `/** Yalnızca testlerde kullanılan sahte (mock) aile. */
public class TestFabrikasi implements LojistikFabrikasi {

    @Override
    public TasimaAraci aracOlustur() {
        return new TasimaAraci() {
            public String gerekenBelge() { return "TEST"; }
            public void teslimEt(String yuk) { System.out.println("[Test] " + yuk + " teslim edildi (sahte)."); }
        };
    }

    @Override
    public TasimaBelgesi belgeOlustur() {
        return new TasimaBelgesi() {
            public String ad() { return "TEST"; }
            public void hazirla(String yuk) { System.out.println("[Test] belge hazır (sahte)."); }
        };
    }

    public static void main(String[] args) {
        new TeslimatServisi(new TestFabrikasi()).gonder("deneme kolisi");
    }
}`;

  /** Bir aileyle yapılan gönderinin konsol çıktısı (Java ile birebir aynı). */
  AF.output = (f, cargo) => [
    `[${f.docName}] ${cargo} için ${f.docLong} düzenlendi.`,
    `[Gümrük] ${f.docName} onaylandı.`,
    `[${f.vehicleTr}] ${cargo} ${f.yol} teslim edildi.`,
  ];

  /** Canlı akışta gösterilen dosyalar (çağrı sırasıyla). */
  AF.flowFiles = (f, cargo) => [
    { name: 'Main.java', code: code.main(f, cargo) },
    { name: 'TeslimatServisi.java', code: code.TeslimatServisi },
    { name: 'LojistikFabrikasi.java', code: code.LojistikFabrikasi },
    { name: f.factory + '.java', code: code.factory(f) },
    { name: f.doc + '.java', code: code.doc(f) },
    { name: 'Gumruk.java', code: code.Gumruk },
    { name: f.vehicle + '.java', code: code.vehicle(f) },
  ];

  /** 1 tabanlı satır numarası (yığın izi ve derleyici hatalarını kodla tutarlı üretmek için). */
  AF.lineOf = function (src, needle) {
    const i = src.split('\n').findIndex((l) => l.includes(needle));
    return i < 0 ? 0 : i + 1;
  };

  // ------------------------------------------------------------------ "Sorun" sahnesi: aileyi iki ayrı switch seçiyor
  function naiveServis(withHava) {
    return `public class TeslimatServisi {

    public void gonder(String yuk, String tur) {
        TasimaAraci arac = aracSec(tur);
        TasimaBelgesi belge = belgeSec(tur);
        belge.hazirla(yuk);
        Gumruk.kontrolEt(arac, belge);
        arac.teslimEt(yuk);
    }

    private TasimaAraci aracSec(String tur) {
        switch (tur) {
            case "kara":  return new Kamyon();
            case "deniz": return new Gemi();${
              withHava
                ? `
            case "hava":  return new Ucak();`
                : ''
            }
            default: throw new IllegalArgumentException("Bilinmeyen tür: " + tur);
        }
    }

    private TasimaBelgesi belgeSec(String tur) {
        switch (tur) {
            case "deniz": return new Konsimento();
            default:      return new CmrBelgesi();   // varsayılan: kara
        }
    }
}`;
  }

  function naiveMain(n) {
    const calls = [
      'servis.gonder("20 ton kayısı", "kara");',
      'servis.gonder("300 konteyner fındık", "deniz");',
      'servis.gonder("acil ilaç kolisi", "hava");',
    ].slice(0, n);
    return `public class Main {

    public static void main(String[] args) {
        TeslimatServisi servis = new TeslimatServisi();
${calls.map((c) => '        ' + c).join('\n')}
    }
}`;
  }

  const F = AF.families;
  AF.naive = [
    { version: '1.0', servis: naiveServis(false), main: naiveMain(2) },
    { version: '2.0', servis: naiveServis(true), main: naiveMain(3) },
  ];

  /** Kalıpsız sürümlerin çıktısı. Sürüm 2.0'da hava gönderisi gümrükte patlar. */
  AF.naiveOutput = function (v) {
    const lines = AF.output(F.kara, F.kara.cargo).concat(AF.output(F.deniz, F.deniz.cargo));
    if (v === 0) return lines.map((t) => ({ t }));
    const n = AF.naive[1];
    return lines.map((t) => ({ t })).concat([
      { t: `[CMR] ${F.hava.cargo} için karayolu taşıma senedi düzenlendi.` },
      { t: 'Exception in thread "main" java.lang.IllegalStateException: Gümrük: AWB bekleniyordu, CMR geldi!', err: true },
      // javac, çok satırlı `throw new …(` ifadesinde kurucu çağrısını argümanların satırına bağlar (java ile doğrulandı)
      { t: `\tat Gumruk.kontrolEt(Gumruk.java:${AF.lineOf(code.Gumruk, '"Gümrük: " + arac')})`, err: true },
      { t: `\tat TeslimatServisi.gonder(TeslimatServisi.java:${AF.lineOf(n.servis, 'Gumruk.kontrolEt')})`, err: true },
      { t: `\tat Main.main(Main.java:${AF.lineOf(n.main, '"hava"')})`, err: true },
    ]);
  };

  // ------------------------------------------------------------------ "Çözüm" sahnesi: adım adım yeniden düzenleme
  const R = {};
  R.iface = `public interface LojistikFabrikasi {

    TasimaAraci aracOlustur();

    TasimaBelgesi belgeOlustur();
}`;
  R.factory = (f) => `public class ${f.factory} implements LojistikFabrikasi {

    @Override
    public TasimaAraci aracOlustur() {
        return new ${f.vehicle}();
    }

    @Override
    public TasimaBelgesi belgeOlustur() {
        return new ${f.doc}();
    }
}`;
  R.servis = `public class TeslimatServisi {

    private final LojistikFabrikasi fabrika;

    public TeslimatServisi(LojistikFabrikasi fabrika) {
        this.fabrika = fabrika;
    }

    public void gonder(String yuk) {
        TasimaAraci arac = fabrika.aracOlustur();
        TasimaBelgesi belge = fabrika.belgeOlustur();
        belge.hazirla(yuk);
        Gumruk.kontrolEt(arac, belge);
        arac.teslimEt(yuk);
    }
}`;
  R.main = `public class Main {

    public static void main(String[] args) {
        new TeslimatServisi(new KaraFabrikasi()).gonder("20 ton kayısı");
        new TeslimatServisi(new DenizFabrikasi()).gonder("300 konteyner fındık");
    }
}`;
  const n0 = AF.naive[0];
  AF.refactor = [
    { TeslimatServisi: n0.servis, Main: n0.main },
    { TeslimatServisi: n0.servis, LojistikFabrikasi: R.iface, Main: n0.main },
    { TeslimatServisi: n0.servis, LojistikFabrikasi: R.iface, KaraFabrikasi: R.factory(F.kara), DenizFabrikasi: R.factory(F.deniz), Main: n0.main },
    { TeslimatServisi: R.servis, LojistikFabrikasi: R.iface, KaraFabrikasi: R.factory(F.kara), DenizFabrikasi: R.factory(F.deniz), Main: n0.main },
    { TeslimatServisi: R.servis, LojistikFabrikasi: R.iface, KaraFabrikasi: R.factory(F.kara), DenizFabrikasi: R.factory(F.deniz), Main: R.main },
  ];

  // ------------------------------------------------------------------ "Genişlet" sahnesi: yeni ürün TÜRÜ
  code.withInsurance = `/**
 * «AbstractFactory» — Soyut Fabrika
 * Birbiriyle UYUMLU ürünlerden oluşan bir aile üretir.
 */
public interface LojistikFabrikasi {

    TasimaAraci aracOlustur();

    TasimaBelgesi belgeOlustur();

    TasimaSigortasi sigortaOlustur();   // YENİ ürün türü
}`;
  code.withDefault = `public interface LojistikFabrikasi {

    TasimaAraci aracOlustur();

    TasimaBelgesi belgeOlustur();

    // Java 8+: varsayılan gövde → mevcut fabrikalar derlenmeye devam eder
    default TasimaSigortasi sigortaOlustur() {
        return new StandartSigorta();
    }
}`;
  /** Arayüze metot eklenince her somut fabrikanın aldığı gerçek javac hatası. */
  AF.compileErrors = function (factoryCodes) {
    const out = [];
    // `javac *.java` dosyaları alfabetik sırayla raporlar (gerçek derleyiciyle doğrulandı)
    factoryCodes.slice().sort((a, b) => a.name.localeCompare(b.name)).forEach(({ name, src }) => {
      const ln = AF.lineOf(src, 'public class ' + name);
      out.push({ t: `${name}.java:${ln}: error: ${name} is not abstract and does not override abstract method sigortaOlustur() in LojistikFabrikasi`, err: true });
      out.push({ t: `public class ${name} implements LojistikFabrikasi {` });
      out.push({ t: '       ^' });
    });
    out.push({ t: `${factoryCodes.length} errors`, err: true });
    return out;
  };

  // ------------------------------------------------------------------ UML sınıf diyagramı
  const M = {
    gonder: { id: 'gonder', text: '+ gonder(yuk: String)', generic: '+ someOperation()' },
    field: { id: 'fabrika', text: '- fabrika: LojistikFabrikasi', generic: '- factory: AbstractFactory' },
    aracAbs: { id: 'aracOlustur', text: '+ aracOlustur(): TasimaAraci', generic: '+ createProductA(): AbstractProductA', abstract: true, factory: true },
    belgeAbs: { id: 'belgeOlustur', text: '+ belgeOlustur(): TasimaBelgesi', generic: '+ createProductB(): AbstractProductB', abstract: true, factory: true },
    arac: { id: 'aracOlustur', text: '+ aracOlustur()', generic: '+ createProductA()', factory: true },
    belge: { id: 'belgeOlustur', text: '+ belgeOlustur()', generic: '+ createProductB()', factory: true },
    gerekenBelge: { id: 'gerekenBelge', text: '+ gerekenBelge(): String', generic: '+ operationA1()', abstract: true },
    teslimEtAbs: { id: 'teslimEt', text: '+ teslimEt(yuk: String)', generic: '+ operationA2()', abstract: true },
    adAbs: { id: 'ad', text: '+ ad(): String', generic: '+ operationB1()', abstract: true },
    hazirlaAbs: { id: 'hazirla', text: '+ hazirla(yuk: String)', generic: '+ operationB2()', abstract: true },
    teslimEt: { id: 'teslimEt', text: '+ teslimEt(yuk)', generic: '+ operationA2()' },
    hazirla: { id: 'hazirla', text: '+ hazirla(yuk)', generic: '+ operationB2()' },
  };
  AF.members = M;

  // Düzen: üstte istemci; altında üç arayüz (Ürün A · Soyut Fabrika · Ürün B);
  // her SATIR bir aile: [Ürün A] ◄ [Somut Fabrika] ► [Ürün B]
  const TOP = 34;
  const IY = 190;
  AF.rows = { kara: 360, deniz: 480, hava: 600 };

  const ifaces = () => [
    { id: 'TasimaAraci', name: 'TasimaAraci', generic: 'AbstractProductA', kind: 'interface', role: 'abstractProduct', x: 10, y: IY, w: 250, members: [M.gerekenBelge, M.teslimEtAbs] },
    { id: 'LojistikFabrikasi', name: 'LojistikFabrikasi', generic: 'AbstractFactory', kind: 'interface', role: 'abstractFactory', x: 320, y: IY, w: 340, members: [M.aracAbs, M.belgeAbs] },
    { id: 'TasimaBelgesi', name: 'TasimaBelgesi', generic: 'AbstractProductB', kind: 'interface', role: 'abstractProduct', x: 720, y: IY, w: 250, members: [M.adAbs, M.hazirlaAbs] },
  ];

  const famClasses = (f, extra) => {
    const y = AF.rows[f.key];
    return [
      Object.assign({ id: f.vehicle, name: f.vehicle, generic: 'ProductA' + f.gen, kind: 'class', role: 'concreteProduct', x: 40, y, w: 200, members: [M.teslimEt] }, extra),
      Object.assign({ id: f.factory, name: f.factory, generic: 'ConcreteFactory' + f.gen, kind: 'class', role: 'concreteFactory', x: 380, y, w: 220, members: [M.arac, M.belge] }, extra),
      Object.assign({ id: f.doc, name: f.doc, generic: 'ProductB' + f.gen, kind: 'class', role: 'concreteProduct', x: 740, y, w: 200, members: [M.hazirla] }, extra),
    ];
  };

  const famRelations = (f) => {
    const y = AF.rows[f.key];
    return [
      { id: 'real-' + f.vehicle, from: f.vehicle, to: 'TasimaAraci', type: 'realization', fromSide: 'left', toSide: 'bottom', toAt: 24 },
      { id: 'real-' + f.factory, from: f.factory, to: 'LojistikFabrikasi', type: 'realization', fromSide: 'left', fromAt: y + 16, toSide: 'bottom', toAt: 356 },
      { id: 'real-' + f.doc, from: f.doc, to: 'TasimaBelgesi', type: 'realization', fromSide: 'right', toSide: 'bottom', toAt: 956 },
      { id: 'cr-' + f.key + '-a', from: f.factory, to: f.vehicle, type: 'create', label: '«create»', fromSide: 'left', fromAt: y + 35, toSide: 'right', toAt: y + 35 },
      { id: 'cr-' + f.key + '-b', from: f.factory, to: f.doc, type: 'create', label: '«create»', fromSide: 'right', fromAt: y + 35, toSide: 'left', toAt: y + 35 },
    ];
  };

  const clientUses = () => [
    { id: 'uses-a', from: 'TeslimatServisi', to: 'TasimaAraci', type: 'dependency', label: 'kullanır', genericLabel: 'uses', fromSide: 'left', fromAt: 70, toSide: 'top', toAt: 236 },
    { id: 'uses-b', from: 'TeslimatServisi', to: 'TasimaBelgesi', type: 'dependency', label: 'kullanır', genericLabel: 'uses', fromSide: 'right', fromAt: 70, toSide: 'top', toAt: 946 },
  ];
  const hasFactory = { id: 'has', from: 'TeslimatServisi', to: 'LojistikFabrikasi', type: 'association', label: 'fabrika', genericLabel: 'factory', fromSide: 'bottom', fromAt: 600, toSide: 'top', toAt: 600 };

  /** Kalıbın yapı diyagramı. o.hava: Hava ailesi görünsün mü. */
  AF.diagram = function (o) {
    o = o || {};
    const classes = [{ id: 'TeslimatServisi', name: 'TeslimatServisi', generic: 'Client', kind: 'class', role: 'client', x: 350, y: TOP, w: 280, members: [M.field, M.gonder] }]
      .concat(ifaces())
      .concat(famClasses(F.kara), famClasses(F.deniz), famClasses(F.hava, { hidden: !o.hava }));
    const relations = [hasFactory].concat(clientUses(), famRelations(F.kara), famRelations(F.deniz), famRelations(F.hava));
    return { width: 990, height: 720, title: 'Abstract Factory sınıf diyagramı', fitVisible: true, classes, relations };
  };

  /** "Çözüm" sahnesinin her adımındaki diyagram. */
  AF.solutionDiagram = function (step) {
    const old = step <= 2;
    const client = old
      ? {
          id: 'TeslimatServisi', name: 'TeslimatServisi', kind: 'class', role: 'client', x: 350, y: TOP, w: 280,
          members: [
            { id: 'gonder', text: '+ gonder(yuk, tur)' },
            { id: 'aracSec', text: '- aracSec(tur): TasimaAraci' },
            { id: 'belgeSec', text: '- belgeSec(tur): TasimaBelgesi' },
          ],
        }
      : { id: 'TeslimatServisi', name: 'TeslimatServisi', kind: 'class', role: 'client', x: 350, y: TOP, w: 280, members: [M.field, M.gonder] };
    const all = ifaces();
    const classes = [client, all[0], all[2]];
    if (step >= 1) classes.push(all[1]);
    const famA = famClasses(F.kara);
    const famB = famClasses(F.deniz);
    classes.push(famA[0], famA[2], famB[0], famB[2]);
    const relations = clientUses();
    ['kara', 'deniz'].forEach((k) => {
      const rel = famRelations(F[k]);
      relations.push(rel[0], rel[2]);
    });
    if (old) {
      // istemci dört somut ürünü kendisi "new"liyor (dış sütunlardan dolaşan oklar)
      const ya = AF.rows.kara + 35;
      const yb = AF.rows.deniz + 35;
      relations.push(
        { id: 'new-kamyon', from: 'TeslimatServisi', to: 'Kamyon', type: 'create', label: 'new', fromSide: 'left', fromAt: 112, toSide: 'right', toAt: ya, points: [[300, 112], [300, ya]], labelAt: [270, ya - 8] },
        { id: 'new-gemi', from: 'TeslimatServisi', to: 'Gemi', type: 'create', label: 'new', fromSide: 'left', fromAt: 126, toSide: 'right', toAt: yb, points: [[288, 126], [288, yb]], labelAt: [264, yb - 8] },
        { id: 'new-cmr', from: 'TeslimatServisi', to: 'CmrBelgesi', type: 'create', label: 'new', fromSide: 'right', fromAt: 112, toSide: 'left', toAt: ya, points: [[680, 112], [680, ya]], labelAt: [710, ya - 8] },
        { id: 'new-kons', from: 'TeslimatServisi', to: 'Konsimento', type: 'create', label: 'new', fromSide: 'right', fromAt: 126, toSide: 'left', toAt: yb, points: [[692, 126], [692, yb]], labelAt: [716, yb - 8] }
      );
    }
    if (step >= 2) {
      classes.push(famA[1], famB[1]);
      ['kara', 'deniz'].forEach((k) => {
        const rel = famRelations(F[k]);
        relations.push(rel[1], rel[3], rel[4]);
      });
    }
    if (!old) relations.push(hasFactory);
    // Sabit görüş kutusu: adımlar arasında diyagram ölçeği değişmesin.
    return { width: 990, height: 600, view: [0, 20, 986, AF.rows.deniz + 91 + 18 - 20], classes, relations };
  };

  // ------------------------------------------------------------------ UML sıralama diyagramı
  AF.seqSpec = (f) => ({
    width: 1040,
    height: 700,
    top: 120,
    margin: 70,
    rowH: 42,
    participants: [
      { id: 'main', label: 'Main', role: 'client' },
      { id: 'srv', label: 'servis\n: TeslimatServisi', role: 'client', object: true },
      { id: 'fab', label: 'fabrika\n: ' + f.factory, role: 'concreteFactory', object: true },
      { id: 'arac', label: 'arac\n: ' + f.vehicle, role: 'concreteProduct', object: true },
      { id: 'belge', label: 'belge\n: ' + f.doc, role: 'concreteProduct', object: true },
      { id: 'gum', label: 'Gumruk', role: null },
    ],
    messages: [
      { from: 'main', to: 'fab', kind: 'create', label: '«create»' },
      { from: 'main', to: 'srv', kind: 'create', label: '«create»(fabrika)' },
      { from: 'main', to: 'srv', kind: 'call', label: 'gonder(yuk)' },
      { from: 'srv', to: 'fab', kind: 'call', label: 'aracOlustur()' },
      { from: 'fab', to: 'arac', kind: 'create', label: '«create»' },
      { from: 'fab', to: 'srv', kind: 'return', label: 'arac' },
      { from: 'srv', to: 'fab', kind: 'call', label: 'belgeOlustur()' },
      { from: 'fab', to: 'belge', kind: 'create', label: '«create»' },
      { from: 'fab', to: 'srv', kind: 'return', label: 'belge' },
      { from: 'srv', to: 'belge', kind: 'call', label: 'hazirla(yuk)', short: true },
      { from: 'srv', to: 'gum', kind: 'call', label: 'kontrolEt(arac, belge)', short: true },
      { from: 'srv', to: 'arac', kind: 'call', label: 'teslimEt(yuk)', short: true },
      { from: 'srv', to: 'main', kind: 'return', label: '' },
    ],
    initialActive: ['main'],
  });
})();
