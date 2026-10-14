/*
 * Factory Method — veri: Java kodları, varyantlar, roller, diyagram tanımları.
 * Bu dosya DOM kullanmaz; tools/export-java.js de Java dosyalarını buradan üretir.
 */
(function () {
  'use strict';
  const DP = (window.DP = window.DP || {});
  const FM = (DP.fm = DP.fm || {});

  // ------------------------------------------------------------------ roller
  FM.roles = {
    client: { en: 'Client', tr: 'İstemci', color: 1 },
    creator: { en: 'Creator', tr: 'Yaratıcı', color: 2 },
    concreteCreator: { en: 'ConcreteCreator', tr: 'Somut Yaratıcı', color: 3 },
    product: { en: 'Product', tr: 'Ürün', color: 4 },
    concreteProduct: { en: 'ConcreteProduct', tr: 'Somut Ürün', color: 5 },
  };

  FM.classRoles = {
    Main: 'client',
    Lojistik: 'creator',
    KaraLojistigi: 'concreteCreator',
    DenizLojistigi: 'concreteCreator',
    HavaLojistigi: 'concreteCreator',
    TasimaAraci: 'product',
    Kamyon: 'concreteProduct',
    Gemi: 'concreteProduct',
    Ucak: 'concreteProduct',
    Tren: 'concreteProduct',
    // GoF genel adları
    Creator: 'creator',
    ConcreteCreator: 'concreteCreator',
    ConcreteCreatorA: 'concreteCreator',
    ConcreteCreatorB: 'concreteCreator',
    Product: 'product',
    ConcreteProduct: 'concreteProduct',
    ConcreteProductA: 'concreteProduct',
    ConcreteProductB: 'concreteProduct',
    Client: 'client',
  };

  FM.roleOf = function (name) {
    const r = FM.classRoles[name];
    return r ? FM.roles[r].color : null;
  };

  // Fabrika metodu adı kodda ayrıca vurgulanır.
  FM.special = { aracOlustur: 'fm', factoryMethod: 'fm' };

  // ------------------------------------------------------------------ varyantlar (somut yaratıcılar)
  FM.variants = {
    kara: {
      key: 'kara', label: 'Kara', creator: 'KaraLojistigi', product: 'Kamyon', productTr: 'Kamyon',
      yol: 'karayoluyla', cargo: '20 ton kayısı', vehicle: 'truck', dest: 'Depo',
    },
    deniz: {
      key: 'deniz', label: 'Deniz', creator: 'DenizLojistigi', product: 'Gemi', productTr: 'Gemi',
      yol: 'denizyoluyla', cargo: '300 konteyner fındık', vehicle: 'ship', dest: 'Liman',
    },
    hava: {
      key: 'hava', label: 'Hava', creator: 'HavaLojistigi', product: 'Ucak', productTr: 'Uçak',
      yol: 'havayoluyla', cargo: 'acil ilaç kolisi', vehicle: 'plane', dest: 'Havalimanı', extension: true,
    },
  };
  FM.variantOrder = ['kara', 'deniz', 'hava'];

  // ------------------------------------------------------------------ çözüm kodu (kanonik)
  const code = (FM.code = {});

  code.TasimaAraci = `/**
 * «Product» — Ürün
 * Fabrika metodunun döndürdüğü tüm nesnelerin ortak arayüzü.
 */
public interface TasimaAraci {

    void teslimEt(String yuk);
}`;

  code.Lojistik = `/**
 * «Creator» — Yaratıcı
 * Teslimat sürecini yönetir ama aracı kendisi üretmez.
 */
public abstract class Lojistik {

    // İş mantığı: yalnızca TasimaAraci arayüzünü tanır.
    public void teslimatPlanla(String yuk) {
        System.out.println("[Plan] " + yuk + " için araç hazırlanıyor...");
        TasimaAraci arac = aracOlustur();   // new yok!
        arac.teslimEt(yuk);
    }

    // FABRİKA METODU: Hangi aracın üretileceğine alt sınıflar karar verir.
    protected abstract TasimaAraci aracOlustur();
}`;

  code.product = (v) => `/**
 * «ConcreteProduct» — Somut Ürün
 */
public class ${v.product} implements TasimaAraci {

    @Override
    public void teslimEt(String yuk) {
        System.out.println("[${v.productTr}] " + yuk + " ${v.yol} teslim edildi.");
    }
}`;

  code.creator = (v) => `/**
 * «ConcreteCreator» — Somut Yaratıcı
 */
public class ${v.creator} extends Lojistik {

    @Override
    protected TasimaAraci aracOlustur() {
        return new ${v.product}();
    }
}`;

  /** Canlı akış sahnesindeki istemci kodu (seçilen varyanta göre). */
  code.main = (v, cargo) => `public class Main {

    public static void main(String[] args) {
        // Somut yaratıcı YALNIZCA burada seçilir:
        Lojistik lojistik = new ${v.creator}();

        musteriKodu(lojistik, "${cargo}");
    }

    // İstemci kodu yalnızca soyut Lojistik tipini tanır.
    static void musteriKodu(Lojistik lojistik, String yuk) {
        lojistik.teslimatPlanla(yuk);
    }
}`;

  /** Dışa aktarılan (çalıştırılabilir) örnekteki istemci: üç varyantı da dener. */
  code.mainAll = `public class Main {

    public static void main(String[] args) {
        musteriKodu(new KaraLojistigi(), "20 ton kayısı");
        musteriKodu(new DenizLojistigi(), "300 konteyner fındık");
        musteriKodu(new HavaLojistigi(), "acil ilaç kolisi");   // genişletme: yeni tür
    }

    // İstemci kodu yalnızca soyut Lojistik tipini tanır.
    static void musteriKodu(Lojistik lojistik, String yuk) {
        lojistik.teslimatPlanla(yuk);
    }
}`;

  /** Bir varyantın çalıştırılmasında oluşan konsol çıktısı (Java ile birebir aynı). */
  FM.output = (v, cargo) => [`[Plan] ${cargo} için araç hazırlanıyor...`, `[${v.productTr}] ${cargo} ${v.yol} teslim edildi.`];

  /** Canlı akışta gösterilen dosyalar. */
  FM.flowFiles = (v, cargo) => [
    { name: 'Main.java', code: code.main(v, cargo) },
    { name: 'Lojistik.java', code: code.Lojistik },
    { name: v.creator + '.java', code: code.creator(v) },
    { name: 'TasimaAraci.java', code: code.TasimaAraci },
    { name: v.product + '.java', code: code.product(v) },
  ];

  // ------------------------------------------------------------------ "Sorun" sahnesi: kalıpsız kodun evrimi
  const naiveBranch = (tur, cls, v) => [
    `if (tur.equals("${tur}")) {`,
    `            ${cls} ${v} = new ${cls}();`,
    `            ${v}.teslimEt(yuk);`,
  ];

  function naiveLojistik(types) {
    if (types.length === 1) {
      return `public class Lojistik {

    public void teslimatPlanla(String yuk) {
        System.out.println("[Plan] " + yuk + " için araç hazırlanıyor...");
        Kamyon kamyon = new Kamyon();
        kamyon.teslimEt(yuk);
    }
}`;
    }
    const body = types
      .map((t, i) => {
        const [cond, l1, l2] = naiveBranch(t.tur, t.cls, t.v);
        return (i === 0 ? '        ' : '        } else ') + cond + '\n' + l1 + '\n' + l2;
      })
      .join('\n');
    return `public class Lojistik {

    public void teslimatPlanla(String yuk, String tur) {
        System.out.println("[Plan] " + yuk + " için araç hazırlanıyor...");
${body}
        }
    }
}`;
  }

  function naiveMain(calls) {
    return `public class Main {

    public static void main(String[] args) {
        Lojistik lojistik = new Lojistik();
${calls.map((c) => '        ' + c).join('\n')}
    }
}`;
  }

  const T = {
    kara: { tur: 'kara', cls: 'Kamyon', v: 'kamyon' },
    deniz: { tur: 'deniz', cls: 'Gemi', v: 'gemi' },
    hava: { tur: 'hava', cls: 'Ucak', v: 'ucak' },
    demiryolu: { tur: 'demiryolu', cls: 'Tren', v: 'tren' },
  };

  FM.naive = [
    {
      version: '1.0',
      lojistik: naiveLojistik([T.kara]),
      main: naiveMain(['lojistik.teslimatPlanla("20 ton kayısı");']),
    },
    {
      version: '2.0',
      lojistik: naiveLojistik([T.kara, T.deniz]),
      main: naiveMain([
        'lojistik.teslimatPlanla("20 ton kayısı", "kara");',
        'lojistik.teslimatPlanla("300 konteyner fındık", "deniz");',
      ]),
    },
    {
      version: '3.0',
      lojistik: naiveLojistik([T.kara, T.deniz, T.hava]),
      main: naiveMain([
        'lojistik.teslimatPlanla("20 ton kayısı", "kara");',
        'lojistik.teslimatPlanla("300 konteyner fındık", "deniz");',
        'lojistik.teslimatPlanla("acil ilaç kolisi", "hava");',
      ]),
    },
    {
      version: '4.0',
      lojistik: naiveLojistik([T.kara, T.deniz, T.hava, T.demiryolu]),
      main: naiveMain([
        'lojistik.teslimatPlanla("20 ton kayısı", "kara");',
        'lojistik.teslimatPlanla("300 konteyner fındık", "deniz");',
        'lojistik.teslimatPlanla("acil ilaç kolisi", "hava");',
        'lojistik.teslimatPlanla("12 vagon mermer", "demiryolu");',
      ]),
    },
  ];

  // ------------------------------------------------------------------ "Çözüm" sahnesi: adım adım yeniden düzenleme
  const plainVehicle = (cls, label, yol, iface) => `public class ${cls}${iface ? ' implements TasimaAraci' : ''} {
${iface ? '\n    @Override' : ''}
    public void teslimEt(String yuk) {
        System.out.println("[${label}] " + yuk + " ${yol} teslim edildi.");
    }
}`;

  const R = {};
  R.lojistik0 = naiveLojistik([T.kara, T.deniz]);
  R.lojistik2 = `public class Lojistik {

    public void teslimatPlanla(String yuk, String tur) {
        System.out.println("[Plan] " + yuk + " için araç hazırlanıyor...");
        TasimaAraci arac = aracOlustur(tur);
        arac.teslimEt(yuk);
    }

    private TasimaAraci aracOlustur(String tur) {
        if (tur.equals("kara")) {
            return new Kamyon();
        } else if (tur.equals("deniz")) {
            return new Gemi();
        }
        throw new IllegalArgumentException("Bilinmeyen tür: " + tur);
    }
}`;
  R.lojistik3 = `public abstract class Lojistik {

    public void teslimatPlanla(String yuk) {
        System.out.println("[Plan] " + yuk + " için araç hazırlanıyor...");
        TasimaAraci arac = aracOlustur();
        arac.teslimEt(yuk);
    }

    // FABRİKA METODU: Hangi aracın üretileceğine alt sınıflar karar verir.
    protected abstract TasimaAraci aracOlustur();
}`;
  R.iface = `public interface TasimaAraci {

    void teslimEt(String yuk);
}`;
  R.creator = (cls, prod) => `public class ${cls} extends Lojistik {

    @Override
    protected TasimaAraci aracOlustur() {
        return new ${prod}();
    }
}`;
  R.main0 = FM.naive[1].main;
  R.main4 = `public class Main {

    public static void main(String[] args) {
        Lojistik kara = new KaraLojistigi();
        kara.teslimatPlanla("20 ton kayısı");

        Lojistik deniz = new DenizLojistigi();
        deniz.teslimatPlanla("300 konteyner fındık");
    }
}`;

  /** Kalıpsız sürümdeki (arayüzsüz) araç sınıfı — dışa aktarım için. */
  code.plain = (v) => plainVehicle(v.product, v.productTr, v.yol, false);

  const kamyon0 = plainVehicle('Kamyon', 'Kamyon', 'karayoluyla', false);
  const gemi0 = plainVehicle('Gemi', 'Gemi', 'denizyoluyla', false);
  const kamyon1 = plainVehicle('Kamyon', 'Kamyon', 'karayoluyla', true);
  const gemi1 = plainVehicle('Gemi', 'Gemi', 'denizyoluyla', true);

  /** Her adımda proje dosyalarının hâli (sıra = sekme sırası). */
  FM.refactor = [
    { Lojistik: R.lojistik0, Kamyon: kamyon0, Gemi: gemi0, Main: R.main0 },
    { Lojistik: R.lojistik0, TasimaAraci: R.iface, Kamyon: kamyon1, Gemi: gemi1, Main: R.main0 },
    { Lojistik: R.lojistik2, TasimaAraci: R.iface, Kamyon: kamyon1, Gemi: gemi1, Main: R.main0 },
    { Lojistik: R.lojistik3, TasimaAraci: R.iface, Kamyon: kamyon1, Gemi: gemi1, Main: R.main0 },
    {
      Lojistik: R.lojistik3, KaraLojistigi: R.creator('KaraLojistigi', 'Kamyon'), DenizLojistigi: R.creator('DenizLojistigi', 'Gemi'),
      TasimaAraci: R.iface, Kamyon: kamyon1, Gemi: gemi1, Main: R.main4,
    },
  ];

  // ------------------------------------------------------------------ UML sınıf diyagramı
  const M = {
    planla: { id: 'teslimatPlanla', text: '+ teslimatPlanla(yuk: String)', generic: '+ someOperation()' },
    fm: { id: 'aracOlustur', text: '# aracOlustur(): TasimaAraci', generic: '# factoryMethod(): Product', abstract: true, factory: true },
    fmImpl: { id: 'aracOlustur', text: '# aracOlustur(): TasimaAraci', generic: '# factoryMethod(): Product', factory: true },
    teslim: { id: 'teslimEt', text: '+ teslimEt(yuk: String)', generic: '+ doStuff()' },
    teslimAbs: { id: 'teslimEt', text: '+ teslimEt(yuk: String)', generic: '+ doStuff()', abstract: true },
  };
  FM.members = M;

  const TOP = 34;
  const ROW = { a: 196, b: 296, c: 396 };
  const ccls = (id, generic, y, extra) =>
    Object.assign({ id, name: id, generic, kind: 'class', role: 'concreteCreator', x: 66, y, w: 280, members: [M.fmImpl] }, extra);
  const cprod = (id, generic, y, extra) =>
    Object.assign({ id, name: id, generic, kind: 'class', role: 'concreteProduct', x: 460, y, w: 254, members: [M.teslim] }, extra);
  const gen = (id, from) => ({ id, from, to: 'Lojistik', type: 'generalization', fromSide: 'left', toSide: 'bottom', toAt: 43 });
  const real = (id, from) => ({ id, from, to: 'TasimaAraci', type: 'realization', fromSide: 'right', toSide: 'bottom', toAt: 737 });
  const create = (id, from, to) => ({ id, from, to, type: 'create', label: '«create»', fromSide: 'right', toSide: 'left' });

  /**
   * Kalıbın yapı diyagramı.
   * o.hava: Hava sınıfları görünsün mü · o.ghosts: genişleme yeri (kesik çizgili kutular)
   */
  FM.diagram = function (o) {
    o = o || {};
    const classes = [
      { id: 'Lojistik', name: 'Lojistik', generic: 'Creator', kind: 'abstract', role: 'creator', x: 20, y: TOP, w: 300, members: [M.planla, M.fm] },
      { id: 'TasimaAraci', name: 'TasimaAraci', generic: 'Product', kind: 'interface', role: 'product', x: 460, y: TOP, w: 300, members: [M.teslimAbs] },
      ccls('KaraLojistigi', 'ConcreteCreatorA', ROW.a),
      ccls('DenizLojistigi', 'ConcreteCreatorB', ROW.b),
      ccls('HavaLojistigi', 'ConcreteCreatorC', ROW.c, { hidden: !o.hava }),
      cprod('Kamyon', 'ConcreteProductA', ROW.a),
      cprod('Gemi', 'ConcreteProductB', ROW.b),
      cprod('Ucak', 'ConcreteProductC', ROW.c, { hidden: !o.hava }),
      { id: 'ghostC', name: '', kind: 'class', x: 66, y: ROW.c, w: 280, h: 70, ghost: true, ghostText: '+ YeniLojistik ?', hidden: !o.ghosts },
      { id: 'ghostP', name: '', kind: 'class', x: 460, y: ROW.c, w: 254, h: 70, ghost: true, ghostText: '+ YeniArac ?', hidden: !o.ghosts },
    ];
    const relations = [
      { id: 'uses', from: 'Lojistik', to: 'TasimaAraci', type: 'dependency', label: 'kullanır', genericLabel: 'uses', fromSide: 'right', toSide: 'left', fromAt: TOP + 42, toAt: TOP + 42 },
      gen('gen-kara', 'KaraLojistigi'),
      gen('gen-deniz', 'DenizLojistigi'),
      gen('gen-hava', 'HavaLojistigi'),
      real('real-kamyon', 'Kamyon'),
      real('real-gemi', 'Gemi'),
      real('real-ucak', 'Ucak'),
      create('cr-kara', 'KaraLojistigi', 'Kamyon'),
      create('cr-deniz', 'DenizLojistigi', 'Gemi'),
      create('cr-hava', 'HavaLojistigi', 'Ucak'),
      Object.assign(gen('gen-ghost', 'ghostC'), { ghost: true }),
      Object.assign(real('real-ghost', 'ghostP'), { ghost: true }),
    ];
    return { width: 780, height: 480, title: 'Factory Method sınıf diyagramı', classes, relations };
  };

  /** "Çözüm" sahnesinin her adımındaki diyagram. */
  FM.solutionDiagram = function (step) {
    const classes = [];
    const relations = [];
    const kamyon = cprod('Kamyon', null, ROW.a);
    const gemi = cprod('Gemi', null, ROW.b);
    if (step <= 0) {
      kamyon.members = [M.teslim];
      gemi.members = [M.teslim];
    }
    if (step <= 1) {
      classes.push({ id: 'Lojistik', name: 'Lojistik', kind: 'class', role: 'creator', x: 20, y: TOP, w: 300, members: [{ id: 'teslimatPlanla', text: '+ teslimatPlanla(yuk, tur)' }] });
    } else if (step === 2) {
      classes.push({
        id: 'Lojistik', name: 'Lojistik', kind: 'class', role: 'creator', x: 20, y: TOP, w: 300,
        members: [{ id: 'teslimatPlanla', text: '+ teslimatPlanla(yuk, tur)' }, { id: 'aracOlustur', text: '- aracOlustur(tur): TasimaAraci', factory: true }],
      });
    } else {
      classes.push({ id: 'Lojistik', name: 'Lojistik', kind: 'abstract', role: 'creator', x: 20, y: TOP, w: 300, members: [M.planla, M.fm] });
    }
    classes.push(kamyon, gemi);
    if (step >= 1) {
      classes.push({ id: 'TasimaAraci', name: 'TasimaAraci', kind: 'interface', role: 'product', x: 460, y: TOP, w: 300, members: [M.teslimAbs] });
      relations.push(real('real-kamyon', 'Kamyon'), real('real-gemi', 'Gemi'));
    }
    if (step <= 2) {
      relations.push(
        { id: 'new-kamyon', from: 'Lojistik', to: 'Kamyon', type: 'create', label: 'new', fromSide: 'right', toSide: 'left', fromAt: TOP + 50, mid: 410, labelAt: [436, ROW.a + 27] },
        { id: 'new-gemi', from: 'Lojistik', to: 'Gemi', type: 'create', label: 'new', fromSide: 'right', toSide: 'left', fromAt: TOP + 62, mid: 390, labelAt: [426, ROW.b + 27] }
      );
    }
    if (step >= 2) {
      relations.push({ id: 'uses', from: 'Lojistik', to: 'TasimaAraci', type: 'dependency', label: 'kullanır', fromSide: 'right', toSide: 'left', fromAt: TOP + 42, toAt: TOP + 42 });
    }
    if (step >= 4) {
      classes.push(ccls('KaraLojistigi', null, ROW.a), ccls('DenizLojistigi', null, ROW.b));
      relations.push(gen('gen-kara', 'KaraLojistigi'), gen('gen-deniz', 'DenizLojistigi'), create('cr-kara', 'KaraLojistigi', 'Kamyon'), create('cr-deniz', 'DenizLojistigi', 'Gemi'));
    }
    // Sabit görüş kutusu: adımlar arasında diyagram ölçeği değişmesin.
    return { width: 780, height: 400, view: [8, TOP - 14, 764, ROW.b + 70 + 26 - (TOP - 14)], classes, relations };
  };

  // ------------------------------------------------------------------ UML sıralama diyagramı
  FM.seqSpec = (v) => ({
    width: 960,
    height: 540,
    top: 112,
    margin: 130,
    participants: [
      { id: 'main', label: 'Main', role: 'client' },
      { id: 'loj', label: 'lojistik : ' + v.creator, role: 'concreteCreator', object: true },
      { id: 'arac', label: 'arac : ' + v.product, role: 'concreteProduct', object: true },
    ],
    messages: [
      { from: 'main', to: 'loj', kind: 'create', label: '«create»' },
      { from: 'main', to: 'loj', kind: 'call', label: 'teslimatPlanla(yuk)' },
      { from: 'loj', to: 'loj', kind: 'self', label: 'aracOlustur()' },
      { from: 'loj', to: 'arac', kind: 'create', label: '«create»' },
      { from: 'loj', to: 'loj', kind: 'return', label: 'arac' },
      { from: 'loj', to: 'arac', kind: 'call', label: 'teslimEt(yuk)' },
      { from: 'arac', to: 'loj', kind: 'return', label: '' },
      { from: 'loj', to: 'main', kind: 'return', label: '' },
    ],
    initialActive: ['main'],
  });
})();
