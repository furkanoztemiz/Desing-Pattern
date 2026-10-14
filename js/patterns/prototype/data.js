/*
 * Prototype — veri: Java kodları, çıktılar, roller, diyagram tanımları.
 * Bu dosya DOM kullanmaz; tools/export-java.js de Java dosyalarını buradan üretir.
 *
 * Senaryo (lojistik dünyasının devamı): Bazı müşteriler her hafta AYNI gönderiyi veriyor. Sipariş
 * ekranına "Geçen haftakini tekrarla" düğmesi eklendi. Kalıpsız çözüm gönderinin türünü instanceof
 * ile tanıyıp her şeyi sıfırdan kuruyor (yavaş adres servisi her kopyada yeniden çağrılıyor) ve yeni
 * PaletGonderisi gelince çöküyor. Prototype: her gönderi KENDİ kopyasını üretir → son.kopyala().
 *   Sığ ↔ Derin : kopya kurucu listeyi paylaşırsa şablon "zımba" ile kirlenir.
 *   clone()     : Java'nın yerleşik yolu ve tuzakları (Cloneable, sığlık, kurucu atlanır, final alanlar).
 *   Katalog     : Prototip yöneticisi — çalışma anında yeni şablon; yeni sınıf yok.
 */
(function () {
  'use strict';
  const DP = (window.DP = window.DP || {});
  const PT = (DP.pt = DP.pt || {});

  // ------------------------------------------------------------------ roller
  PT.roles = {
    client: { en: 'Client', tr: 'İstemci', color: 1 },
    prototype: { en: 'Prototype', tr: 'Prototip', color: 2 },
    concretePrototype: { en: 'ConcretePrototype', tr: 'Somut Prototip', color: 3 },
    manager: { en: 'Prototype Manager', tr: 'Prototip Yöneticisi', color: 4 },
  };

  PT.classRoles = {
    Main: 'client',
    SiparisEkrani: 'client',
    Gonderi: 'prototype',
    KoliGonderisi: 'concretePrototype',
    ZarfGonderisi: 'concretePrototype',
    PaletGonderisi: 'concretePrototype',
    Koli: 'concretePrototype',
    SablonKatalogu: 'manager',
    // GoF genel adları
    Client: 'client',
    Prototype: 'prototype',
    ConcretePrototype1: 'concretePrototype',
    ConcretePrototype2: 'concretePrototype',
    ConcretePrototype3: 'concretePrototype',
    PrototypeManager: 'manager',
  };

  PT.roleOf = function (name) {
    const r = PT.classRoles[name];
    return r ? PT.roles[r].color : null;
  };

  // kopyala() / clone() = "kopyalayarak oluşturma" işlemi (kodda ayrıca vurgulanır)
  PT.special = { kopyala: 'fm', clone: 'fm' };

  /** 1 tabanlı satır numarası (yığın izi ve derleyici hatalarını kodla tutarlı üretmek için). */
  PT.lineOf = function (src, needle, from) {
    const lines = src.split('\n');
    for (let i = from || 0; i < lines.length; i++) if (lines[i].includes(needle)) return i + 1;
    return 0;
  };

  /** Satırın sonuna, belirli bir sütundan başlayan yorum ekler (yorumlar alt alta hizalı dursun). */
  const cm = (line, comment, col) => line.padEnd(col || 52) + '// ' + comment;

  const code = (PT.code = {});

  // ================================================================== gönderiler (Java ile birebir)
  PT.cargo = {
    kirtasiye: { k: 'koli', alici: 'Ayşe Kırtasiye', icerik: ['A4 kağıt', 'toner'], deger: 12, v: 'kirtasiye' },
    noter: { k: 'zarf', alici: 'Noter Ofisi', icerik: ['sözleşme'], deger: true, v: 'noter' },
    fabrika: { k: 'palet', alici: 'Demir Fabrikası', icerik: ['cıvata', 'somun'], deger: 2, v: 'fabrika' },
    eczane: { k: 'koli', alici: 'Şifa Eczanesi', icerik: ['aşı', 'serum'], deger: 3, v: 'eczane' },
  };
  const C = PT.cargo;

  /** Gönderinin metin hâli (Java'daki toString ile birebir). */
  PT.describe = function (g) {
    const list = g.icerik.join(', ');
    if (g.k === 'koli') return `Koli[${g.alici}: ${list} | ${g.deger} kg]`;
    if (g.k === 'zarf') return `Zarf[${g.alici}: ${list}${g.deger ? ' | iadeli' : ''}]`;
    return `Palet[${g.alici}: ${list} | ${g.deger} palet]`;
  };

  /** Bir gönderinin Java'daki kurucu çağrısı: new KoliGonderisi("…", List.of(…), 12) */
  PT.newExpr = function (g) {
    const a = ALT[g.k];
    return `new ${a.cls}("${g.alici}", List.of(${g.icerik.map((x) => `"${x}"`).join(', ')}), ${g.deger})`;
  };

  PT.adresLine = (alici) => `  [AdresServisi] ${alici} doğrulanıyor... (~2 sn)`;

  // ================================================================== ortak sınıflar
  code.AdresServisi = `/**
 * Yavaş bir dış servis: alıcının adresini doğrular (gerçekte bir ağ çağrısı, ~2 sn).
 */
public class AdresServisi {

    static int sorguSayisi = 0;

    public static void dogrula(String alici) {
        sorguSayisi++;
        System.out.println("  [AdresServisi] " + alici + " doğrulanıyor... (~2 sn)");
    }
}`;

  const DEEP = cm('        this.icerik = new ArrayList<>(kaynak.icerik);', 'DERİN: listenin de kopyası', 56);
  const SHALLOW = cm('        this.icerik = kaynak.icerik;', 'SIĞ: aynı liste paylaşılır!', 56);
  PT.DEEP_LINE = DEEP.trim();
  PT.SHALLOW_LINE = SHALLOW.trim();

  /**
   * Gonderi.java'nın bütün sürümleri.
   * o: {kopyala: soyut metot, copy: kopya kurucu, getters, sig: sığ kopya satırı, doc: rol açıklaması}
   */
  PT.gonderiSrc = function (o) {
    o = o || {};
    const doc = o.doc
      ? `/**
 * «Prototype» — Gönderi. Her gönderi KENDİ kopyasını üretmeyi bilir.
 */
`
      : '';
    const copy = o.copy
      ? `
${cm('    protected Gonderi(Gonderi kaynak) {', 'kopya kurucu: doğrulanmış nesneden', 56)}
${cm('        this.alici = kaynak.alici;', 'String değişmez → paylaşmak güvenli', 56)}
${o.sig ? SHALLOW : DEEP}
    }
`
      : '';
    const kopyala = o.kopyala
      ? `
${cm('    public abstract Gonderi kopyala();', '«clone»: kendinin kopyasını döndür', 56)}
`
      : '';
    const getters = o.getters
      ? `
    public String getAlici() { return alici; }

    public List<String> getIcerik() { return icerik; }
`
      : '';
    return `import java.util.ArrayList;
import java.util.List;

${doc}public abstract class Gonderi {

    protected final String alici;
    protected final List<String> icerik;

    protected Gonderi(String alici, List<String> icerik) {
${cm('        AdresServisi.dogrula(alici);', 'pahalı: dış servise sorgu', 56)}
        this.alici = alici;
        this.icerik = new ArrayList<>(icerik);
    }
${copy}${kopyala}${getters}
    public void ekle(String urun) {
        icerik.add(urun);
    }
}`;
  };

  /** Somut gönderi sınıfları: alanları ve metin hâlleri. */
  const ALT = {
    koli: { cls: 'KoliGonderisi', tag: 'Koli', field: 'agirlik', type: 'int', getter: 'getAgirlik', show: '" | " + agirlik + " kg]"', doc: 'Koli gönderisi (ağırlığı olan paket).' },
    zarf: { cls: 'ZarfGonderisi', tag: 'Zarf', field: 'iadeli', type: 'boolean', getter: 'isIadeli', show: '(iadeli ? " | iadeli" : "") + "]"', doc: 'Zarf gönderisi (evrak; iadeli olabilir).' },
    palet: { cls: 'PaletGonderisi', tag: 'Palet', field: 'paletSayisi', type: 'int', getter: 'getPaletSayisi', show: '" | " + paletSayisi + " palet]"', doc: 'Palet gönderisi (toplu yük).' },
  };
  PT.ALT = ALT;
  PT.altOrder = ['koli', 'zarf', 'palet'];

  /**
   * KoliGonderisi / ZarfGonderisi / PaletGonderisi.
   * o: {copy: kopya kurucu + kopyala(), getters, doc}
   */
  PT.altSrc = function (k, o) {
    o = o || {};
    const a = ALT[k];
    const doc = o.doc
      ? `/**
 * «ConcretePrototype» — ${a.doc}
 */
`
      : '';
    const copy = o.copy
      ? `
${cm(`    private ${a.cls}(${a.cls} kaynak) {`, 'kopya kurucu', 56)}
        super(kaynak);
${cm(`        this.${a.field} = kaynak.${a.field};`, 'private alana kendi sınıfı erişir', 56)}
    }

    @Override
    public ${a.cls} kopyala() {
        return new ${a.cls}(this);
    }
`
      : '';
    const getter = o.getters
      ? `
    public ${a.type} ${a.getter}() { return ${a.field}; }
`
      : '';
    return `import java.util.List;

${doc}public class ${a.cls} extends Gonderi {

    private final ${a.type} ${a.field};

    public ${a.cls}(String alici, List<String> icerik, ${a.type} ${a.field}) {
        super(alici, icerik);
        this.${a.field} = ${a.field};
    }
${copy}${getter}
    @Override
    public String toString() {
        return "${a.tag}[" + alici + ": " + String.join(", ", icerik) + ${a.show};
    }
}`;
  };

  /** SiparisEkrani.java — "Geçen haftakini tekrarla" düğmesi (İstemci). o: {proto, doc} */
  PT.siparisSrc = function (o) {
    o = o || {};
    const head = `/**
 * ${o.doc ? '«Client» — ' : ''}"Geçen haftakini tekrarla" düğmesi: son gönderinin aynısını yeniden oluşturur.
 */
public class SiparisEkrani {

    public static Gonderi tekrarla(Gonderi son) {
`;
    if (o.proto) {
      return `${head}${cm('        return son.kopyala();', 'türünü sormadan: kendini kopyalasın', 48)}
    }
}`;
    }
    return `${head}        if (son instanceof KoliGonderisi k) {
            return new KoliGonderisi(k.getAlici(), k.getIcerik(), k.getAgirlik());
        }
        if (son instanceof ZarfGonderisi z) {
            return new ZarfGonderisi(z.getAlici(), z.getIcerik(), z.isIadeli());
        }
        throw new IllegalArgumentException("Bilinmeyen gönderi türü: " + son.getClass().getSimpleName());
    }
}`;
  };

  /** Main.java (Sorun ve Çözüm sahneleri). palet: üçüncü gönderi türü de var mı? */
  PT.mainSrc = function (palet) {
    const decl = (g) => `        Gonderi ${g.v} = ${PT.newExpr(g)};`;
    return `import java.util.List;

public class Main {

    public static void main(String[] args) {
${decl(C.kirtasiye)}
${decl(C.noter)}${palet ? '\n' + decl(C.fabrika) : ''}

        System.out.println("--- Geçen haftakini tekrarla ---");
        System.out.println(SiparisEkrani.tekrarla(kirtasiye));
        System.out.println(SiparisEkrani.tekrarla(noter));${palet ? '\n' + cm('        System.out.println(SiparisEkrani.tekrarla(fabrika));', 'yeni tür!', 64) : ''}
        System.out.println("Adres sorgusu: " + AdresServisi.sorguSayisi);
    }
}`;
  };

  // ================================================================== "Sorun": kalıpsız kod
  /** Kalıpsız sürümün dosyaları. v: 1 (Koli + Zarf) · 2 (Palet de eklendi) */
  PT.naive = function (v) {
    const files = {
      SiparisEkrani: PT.siparisSrc({}),
      Main: PT.mainSrc(v === 2),
      Gonderi: PT.gonderiSrc({ getters: true }),
      KoliGonderisi: PT.altSrc('koli', { getters: true }),
      ZarfGonderisi: PT.altSrc('zarf', { getters: true }),
    };
    if (v === 2) files.PaletGonderisi = PT.altSrc('palet', { getters: true });
    files.AdresServisi = code.AdresServisi;
    return files;
  };

  /**
   * Kalıpsız sürümün çıktısı (Java ile birebir).
   * Satırlar {t, svc (adres servisi), again (gereksiz tekrar), err}
   */
  PT.naiveOutput = function (v) {
    const list = v === 1 ? [C.kirtasiye, C.noter] : [C.kirtasiye, C.noter, C.fabrika];
    const out = list.map((g) => ({ t: PT.adresLine(g.alici), svc: true }));
    out.push({ t: '--- Geçen haftakini tekrarla ---' });
    for (const g of list) {
      if (g.k === 'palet') {
        const sip = PT.siparisSrc({});
        const main = PT.mainSrc(true);
        out.push({ t: 'Exception in thread "main" java.lang.IllegalArgumentException: Bilinmeyen gönderi türü: PaletGonderisi', err: true });
        out.push({ t: `\tat SiparisEkrani.tekrarla(SiparisEkrani.java:${PT.lineOf(sip, 'throw new IllegalArgumentException')})`, err: true });
        out.push({ t: `\tat Main.main(Main.java:${PT.lineOf(main, 'tekrarla(fabrika)')})`, err: true });
        return out;
      }
      out.push({ t: PT.adresLine(g.alici), svc: true, again: true });
      out.push({ t: PT.describe(g) });
    }
    out.push({ t: 'Adres sorgusu: ' + list.length * 2 });
    return out;
  };

  // ================================================================== "Çözüm": kalıplı kod
  code.Gonderi = PT.gonderiSrc({ kopyala: true, copy: true, doc: true });
  PT.altOrder.forEach((k) => (code[ALT[k].cls] = PT.altSrc(k, { copy: true, doc: true })));
  code.SiparisEkrani = PT.siparisSrc({ proto: true, doc: true });
  code.Main = PT.mainSrc(true);

  /** Kalıplı çözümün çıktısı: kopyalar adres servisine hiç gitmez. */
  PT.output = [C.kirtasiye, C.noter, C.fabrika]
    .map((g) => PT.adresLine(g.alici))
    .concat(['--- Geçen haftakini tekrarla ---'], [C.kirtasiye, C.noter, C.fabrika].map(PT.describe), ['Adres sorgusu: 3']);

  // ------------------------------------------------------------------ adım adım yeniden düzenleme
  const step = (gOpts, altOpts, proto) => {
    const files = {
      SiparisEkrani: PT.siparisSrc({ proto }),
      Main: PT.mainSrc(true),
      Gonderi: PT.gonderiSrc(gOpts),
    };
    PT.altOrder.forEach((k) => (files[ALT[k].cls] = PT.altSrc(k, altOpts)));
    files.AdresServisi = code.AdresServisi;
    return files;
  };
  PT.refactor = [
    step({ getters: true }, { getters: true }, false), // 0: kalıpsız (Palet çöker)
    step({ getters: true, kopyala: true }, { getters: true }, false), // 1: soyut kopyala() → derlenmez
    step({ getters: true, kopyala: true, copy: true }, { getters: true, copy: true }, false), // 2: kopya kurucular
    step({ kopyala: true, copy: true }, { copy: true }, true), // 3: istemci kopyala() ister, getter'lar gitti
  ];

  /** Adım 1'de (soyut kopyala() eklenince) alınan gerçek javac hatası — dosyalar alfabetik. */
  PT.refactorErrors = function () {
    const out = [];
    ['koli', 'palet', 'zarf'].forEach((k) => {
      const a = ALT[k];
      const src = PT.refactor[1][a.cls];
      const ln = PT.lineOf(src, `public class ${a.cls}`);
      const text = src.split('\n')[ln - 1];
      out.push({ t: `${a.cls}.java:${ln}: error: ${a.cls} is not abstract and does not override abstract method kopyala() in Gonderi`, err: true });
      out.push({ t: text });
      out.push({ t: ' '.repeat(text.indexOf('class ')) + '^' });
    });
    out.push({ t: '3 errors', err: true });
    return out;
  };

  // ================================================================== Sığ ↔ Derin (Canlı Akış)
  PT.kopya = {};
  PT.kopya.Main = `import java.util.List;

public class Main {

    public static void main(String[] args) {
        Gonderi sablon = ${PT.newExpr(C.kirtasiye)};

        Gonderi buHafta = sablon.kopyala();
${cm('        buHafta.ekle("zımba");', 'yalnızca bu haftaya ek', 52)}

        Gonderi gelecekHafta = sablon.kopyala();

        System.out.println("şablon       : " + sablon);
        System.out.println("bu hafta     : " + buHafta);
        System.out.println("gelecek hafta: " + gelecekHafta);
    }
}`;

  /** Sahnedeki dosyalar. mode: 'sig' | 'derin' */
  PT.kopya.files = (mode) => [
    { name: 'Main.java', code: PT.kopya.Main },
    { name: 'KoliGonderisi.java', code: code.KoliGonderisi },
    { name: 'Gonderi.java', code: PT.gonderiSrc({ kopyala: true, copy: true, doc: true, sig: mode === 'sig' }) },
    { name: 'AdresServisi.java', code: code.AdresServisi },
  ];

  PT.kopya.items = C.kirtasiye.icerik.slice();
  PT.kopya.extra = 'zımba';

  /** Programın çıktısı (Java ile birebir). */
  PT.kopya.output = function (mode) {
    const base = C.kirtasiye.icerik;
    const z = base.concat(PT.kopya.extra);
    const g = (list) => PT.describe(Object.assign({}, C.kirtasiye, { icerik: list }));
    return [PT.adresLine(C.kirtasiye.alici), 'şablon       : ' + g(mode === 'sig' ? z : base), 'bu hafta     : ' + g(z), 'gelecek hafta: ' + g(mode === 'sig' ? z : base)];
  };

  // ================================================================== Java'da clone()
  const KL = (PT.klon = {});

  const koliCtor = `    public Koli(String alici, List<String> icerik) {
        this.takipNo = "KRG-" + (++sayac);
        this.alici = alici;
        this.icerik = new ArrayList<>(icerik);
        System.out.println("  kurucu çalıştı: " + takipNo);
    }`;

  const koliTail = `    public void ekle(String urun) {
        icerik.add(urun);
    }

    @Override
    public String toString() {
        return takipNo + " " + alici + ": " + String.join(", ", icerik);
    }
}`;

  const finalFields = `    private static int sayac = 1000;

    private final String takipNo;
    private final String alici;
    private final List<String> icerik;`;

  const cloneShallow = `    @Override
    public Koli clone() {
        try {
${cm('            return (Koli) super.clone();', 'alan alan kopya; kurucu ÇALIŞMAZ', 48)}
        } catch (CloneNotSupportedException e) {
${cm('            throw new AssertionError(e);', 'Cloneable uyguladık: olamaz', 48)}
        }
    }`;

  const cloneDeep = `    @Override
    public Koli clone() {
        try {
            Koli kopya = (Koli) super.clone();
${cm('            kopya.takipNo = "KRG-" + (++sayac);', 'yeni numara: elle', 56)}
${cm('            kopya.icerik = new ArrayList<>(icerik);', 'derin kopya: elle', 56)}
            return kopya;
        } catch (CloneNotSupportedException e) {
            throw new AssertionError(e);
        }
    }`;

  // Bazı sürümlerde sınıf satırının sonuna yorum gelir: başlığı ayrıca kuralım.
  const head = (decl) => `import java.util.ArrayList;
import java.util.List;

${decl}
`;

  KL.variants = {
    // 0–2: Java'nın yerleşik yolu — Cloneable + super.clone(); üç tuzak birden
    tuzak: head('public class Koli implements Cloneable {') + `
${finalFields}

${koliCtor}

${cloneShallow}

${koliTail}`,
    // 3: Cloneable unutulursa — derlenir ama çalışırken patlar
    unutulan: head(cm('public class Koli {', '"implements Cloneable" unutuldu', 44)) + `
${finalFields}

${koliCtor}

${cloneShallow}

${koliTail}`,
    // 4: derin kopya denemesi — final alanlara clone() içinde atama yapılamaz
    final: head('public class Koli implements Cloneable {') + `
${finalFields}

${koliCtor}

${cloneDeep}

${koliTail}`,
    // 5: zorla düzeltme — final'dan vazgeç, her şeyi elle kopyala
    duzeltme: head('public class Koli implements Cloneable {') + `
    private static int sayac = 1000;

${cm('    private String takipNo;', 'final OLAMAZ: clone() içinde atanıyor', 44)}
    private final String alici;
${cm('    private List<String> icerik;', 'final OLAMAZ: clone() içinde atanıyor', 44)}

${koliCtor}

${cloneDeep}

${koliTail}`,
    // 6: tavsiye edilen yol — kopya kurucu (Effective Java, Madde 13)
    kurucu: head('public class Koli {') + `
${finalFields}

${koliCtor}

${cm('    private Koli(Koli kaynak) {', 'kopya kurucu: final alanlarla uyumlu', 48)}
${cm('        this.takipNo = "KRG-" + (++sayac);', 'kurucu çalışır → yeni numara', 48)}
        this.alici = kaynak.alici;
        this.icerik = new ArrayList<>(kaynak.icerik);
        System.out.println("  kopya kurucu çalıştı: " + takipNo);
    }

${cm('    public Koli kopyala() {', 'Cloneable yok, cast yok, istisna yok', 48)}
        return new Koli(this);
    }

${koliTail}`,
  };

  /** clone() sahnesinin Main'i. m: 'clone' | 'kopyala' */
  KL.main = (m) => `import java.util.List;

public class Main {

    public static void main(String[] args) {
        Koli sablon = new Koli("${C.kirtasiye.alici}", List.of(${C.kirtasiye.icerik.map((x) => `"${x}"`).join(', ')}));
        Koli kopya = sablon.${m}();
        kopya.ekle("zımba");

        System.out.println("şablon: " + sablon);
        System.out.println("kopya : " + kopya);
    }
}`;

  KL.mainOf = (v) => KL.main(v === 'kurucu' ? 'kopyala' : 'clone');

  /** Her sürümün gerçek çıktısı (derleme hatası ya da program çıktısı). {cmd, lines, compileError} */
  KL.output = function (v) {
    const src = KL.variants[v];
    const main = KL.mainOf(v);
    const items = C.kirtasiye.icerik;
    const line = (no, list) => `${no} ${C.kirtasiye.alici}: ${list.join(', ')}`;
    const z = items.concat('zımba');
    if (v === 'final') {
      const out = [];
      ['takipNo', 'icerik'].forEach((f) => {
        const ln = PT.lineOf(src, `kopya.${f} = `);
        const text = src.split('\n')[ln - 1];
        out.push({ t: `Koli.java:${ln}: error: cannot assign a value to final variable ${f}`, err: true });
        out.push({ t: text });
        out.push({ t: ' '.repeat(text.indexOf('kopya.') + 5) + '^' });
      });
      out.push({ t: '2 errors', err: true });
      return { cmd: '$ javac *.java', lines: out, compileError: true };
    }
    const ctor = { t: '  kurucu çalıştı: KRG-1001', dim: true };
    if (v === 'unutulan') {
      return {
        cmd: '$ javac *.java && java Main',
        lines: [
          ctor,
          { t: 'Exception in thread "main" java.lang.AssertionError: java.lang.CloneNotSupportedException: Koli', err: true },
          { t: `\tat Koli.clone(Koli.java:${PT.lineOf(src, 'throw new AssertionError(e);')})`, err: true },
          { t: `\tat Main.main(Main.java:${PT.lineOf(main, 'sablon.clone()')})`, err: true },
          { t: 'Caused by: java.lang.CloneNotSupportedException: Koli', err: true },
          { t: '\tat java.base/java.lang.Object.clone(Native Method)', err: true },
          { t: `\tat Koli.clone(Koli.java:${PT.lineOf(src, 'super.clone()')})`, err: true },
          { t: '\t... 1 more', err: true },
        ],
      };
    }
    if (v === 'tuzak') {
      return {
        cmd: '$ javac *.java && java Main',
        lines: [ctor, { t: 'şablon: ' + line('KRG-1001', z), bad: true }, { t: 'kopya : ' + line('KRG-1001', z), bad: true }],
      };
    }
    const lines = [ctor];
    if (v === 'kurucu') lines.push({ t: '  kopya kurucu çalıştı: KRG-1002', dim: true });
    lines.push({ t: 'şablon: ' + line('KRG-1001', items), ok: true }, { t: 'kopya : ' + line('KRG-1002', z), ok: true });
    return { cmd: '$ javac *.java && java Main', lines };
  };

  // ================================================================== Prototip yöneticisi (katalog)
  const KT = (PT.katalog = {});

  const katalogSrc = (ret, doc) => `import java.util.HashMap;
import java.util.Map;

${doc ? `/**
 * «Prototype Manager» — Hazır şablonları adlarıyla saklar; istenince KOPYASINI verir.
 */
` : ''}public class SablonKatalogu {

    private final Map<String, Gonderi> sablonlar = new HashMap<>();

    public void ekle(String ad, Gonderi sablon) {
        sablonlar.put(ad, sablon);
    }

    public Gonderi olustur(String ad) {
        Gonderi sablon = sablonlar.get(ad);
        if (sablon == null) {
            throw new IllegalArgumentException("Böyle bir şablon yok: " + ad);
        }
${ret}
    }
}`;

  KT.SablonKatalogu = katalogSrc(cm('        return sablon.kopyala();', 'şablonun kendisi DEĞİL, kopyası!', 48), true);
  KT.hatali = katalogSrc(cm('        return sablon;', 'HATA: şablonun kendisi veriliyor', 48), true);

  KT.templates = [
    { ad: 'kirtasiye', g: C.kirtasiye },
    { ad: 'noter', g: C.noter },
    { ad: 'fabrika', g: C.fabrika },
  ];
  KT.yeni = { ad: 'eczane', g: C.eczane };

  KT.Main = `import java.util.List;

public class Main {

    public static void main(String[] args) {
        SablonKatalogu katalog = new SablonKatalogu();
${KT.templates.map((t) => `        katalog.ekle("${t.ad}", ${PT.newExpr(t.g)});`).join('\n')}

        // çalışma anında YENİ bir şablon: yeni sınıf yok, yalnızca yeni bir nesne
        katalog.ekle("${KT.yeni.ad}", ${PT.newExpr(KT.yeni.g)});

        Gonderi siparis = katalog.olustur("kirtasiye");
        siparis.ekle("zımba");
        System.out.println(siparis);
${cm('        System.out.println(katalog.olustur("kirtasiye"));', 'şablon temiz mi?', 60)}
        System.out.println(katalog.olustur("eczane"));
        System.out.println("Adres sorgusu: " + AdresServisi.sorguSayisi);
    }
}`;

  /** Katalog programının çıktısı. hatali: olustur() şablonun kendisini veriyorsa. */
  KT.output = function (hatali) {
    const all = KT.templates.map((t) => t.g).concat(KT.yeni.g);
    const k = C.kirtasiye;
    const z = Object.assign({}, k, { icerik: k.icerik.concat('zımba') });
    return all
      .map((g) => ({ t: PT.adresLine(g.alici), svc: true }))
      .concat([
        { t: PT.describe(z) },
        { t: PT.describe(hatali ? z : k), bad: hatali, ok: !hatali, note: hatali ? 'şablon kirlendi!' : 'şablon temiz' },
        { t: PT.describe(C.eczane) },
        { t: 'Adres sorgusu: 4' },
      ]);
  };

  KT.exercise = `public class SablonKatalogu {

    private final Map<String, Gonderi> sablonlar = new HashMap<>();

    public void ekle(String ad, ⟦1⟧ sablon) {
        sablonlar.put(ad, sablon);
    }

    public Gonderi olustur(String ad) {
        Gonderi sablon = sablonlar.⟦2⟧(ad);
        if (sablon == null) {
            throw new IllegalArgumentException("Böyle bir şablon yok: " + ad);
        }
        return sablon.⟦3⟧();
    }
}`;
  KT.exerciseMain = `// Main.java içine: çalışma anında yeni bir şablon
katalog.⟦4⟧("eczane", ${PT.newExpr(C.eczane)});
Gonderi ilac = katalog.⟦5⟧("eczane");`;

  // ================================================================== Gerçek dünya (JDK) örnekleri
  // Kodlar burada durur ki çıktıları gerçek Java ile karşılaştırılabilsin (tools/ ve test betiği).
  const RW = (PT.rw = {});

  RW.liste = (arg) => `import java.util.ArrayList;
import java.util.List;

public class ListeKopyasi {

    public static void main(String[] args) {
        List<StringBuilder> etiketler = new ArrayList<>();
        etiketler.add(new StringBuilder("KRG-1001"));

${cm('        List<StringBuilder> kopya = new ArrayList<>(etiketler);', 'kopya kurucu: yeni liste', 64)}
${arg.startsWith('kopya.add') ? cm('        ' + arg, 'listenin YAPISI değişir', 64) : cm('        ' + arg, 'ORTAK eleman değişir', 64)}

        System.out.println("asıl : " + etiketler);
        System.out.println("kopya: " + kopya);
    }
}`;
  RW.listeOpts = [
    { label: 'kopya.add(…)', arg: 'kopya.add(new StringBuilder("KRG-1002"));', out: ['asıl : [KRG-1001]', 'kopya: [KRG-1001, KRG-1002]'] },
    { label: 'kopya.get(0).append(…)', arg: 'kopya.get(0).append(" İPTAL");', out: ['asıl : [KRG-1001 İPTAL]', 'kopya: [KRG-1001 İPTAL]'] },
  ];

  RW.dizi = (arg) =>
    arg.includes('[][]')
      ? `import java.util.Arrays;

public class DiziKopyasi {

    public static void main(String[] args) {
        int[][] raf = {{5, 8}, {13, 21}};
${cm('        int[][] kopya = raf.clone();', 'yalnızca DIŞ dizi kopyalanır', 48)}

        kopya[0][0] = 99;

        System.out.println("asıl : " + Arrays.deepToString(raf));
        System.out.println("kopya: " + Arrays.deepToString(kopya));
    }
}`
      : `import java.util.Arrays;

public class DiziKopyasi {

    public static void main(String[] args) {
        int[] stok = {5, 8, 13};
${cm('        int[] kopya = stok.clone();', 'diziler için clone() idealdir', 48)}

        kopya[0] = 99;

        System.out.println("asıl : " + Arrays.toString(stok));
        System.out.println("kopya: " + Arrays.toString(kopya));
    }
}`;
  RW.diziOpts = [
    { label: 'int[] (tek boyut)', arg: 'int[] kopya = stok.clone();', out: ['asıl : [5, 8, 13]', 'kopya: [99, 8, 13]'] },
    { label: 'int[][] (iki boyut)', arg: 'int[][] kopya = raf.clone();', out: ['asıl : [[99, 8], [13, 21]]', 'kopya: [[99, 8], [13, 21]]'] },
  ];

  RW.fabrika = (arg) => `import java.util.ArrayList;
import java.util.List;

public class KopyaFabrikasi {

    public static void main(String[] args) {
        List<String> icerik = new ArrayList<>(List.of("A4 kağıt", "toner"));
${cm('        List<String> sabit = List.copyOf(icerik);', 'kopya fabrikası: DEĞİŞMEZ kopya', 52)}

        icerik.add("zımba");
        System.out.println("asıl : " + icerik);
        System.out.println("kopya: " + sabit);${
          arg.startsWith('sabit.add')
            ? `

${cm('        sabit.add("kalem");', 'değişmez kopyaya ekleme?', 52)}`
            : ''
        }
    }
}`;
  RW.fabrikaOpts = [
    { label: 'Asıl liste değişirse', arg: 'List.copyOf(icerik)', out: ['asıl : [A4 kağıt, toner, zımba]', 'kopya: [A4 kağıt, toner]'] },
    {
      label: 'Kopyaya eklenirse',
      arg: 'sabit.add("kalem");',
      out: [
        'asıl : [A4 kağıt, toner, zımba]',
        'kopya: [A4 kağıt, toner]',
        'Exception in thread "main" java.lang.UnsupportedOperationException',
        '\tat java.base/java.util.ImmutableCollections.uoe(ImmutableCollections.java:142)',
        '\tat java.base/java.util.ImmutableCollections$AbstractImmutableCollection.add(ImmutableCollections.java:147)',
        `\tat KopyaFabrikasi.main(KopyaFabrikasi.java:${PT.lineOf(RW.fabrika('sabit.add'), 'sabit.add(')})`,
      ],
    },
  ];

  // ================================================================== UML sınıf diyagramları
  const M = {
    alici: { id: 'alici', text: '# alici: String', generic: '# state' },
    icerik: { id: 'icerik', text: '# icerik: List<String>', generic: '# parts' },
    getters: { id: 'getters', text: '+ getAlici(), getIcerik()', generic: '+ getState()' },
    copyCtor: { id: 'copyCtor', text: '# Gonderi(kaynak: Gonderi)', generic: '# Prototype(source)', color: 2 },
    kopyala: { id: 'kopyala', text: '+ kopyala(): Gonderi', generic: '+ clone(): Prototype', abstract: true, factory: true },
    ekle: { id: 'ekle', text: '+ ekle(urun: String)', generic: '+ operation()' },
    tekrarla: { id: 'tekrarla', text: '+ tekrarla(son: Gonderi): Gonderi', generic: '+ operation()' },
  };
  PT.members = M;

  const altMembers = (k, o) => {
    const a = ALT[k];
    const g = { koli: 1, zarf: 2, palet: 3 }[k];
    const mem = [{ id: 'alan', text: `- ${a.field}: ${a.type}`, generic: '- ownState' }];
    if (o.getters) mem.push({ id: 'getter', text: `+ ${a.getter}()`, generic: '+ getOwnState()' });
    if (o.copy) {
      mem.push({ id: 'copyCtor', text: `- ${a.cls}(kaynak)`, generic: `- ConcretePrototype${g}(source)`, color: 3 });
      mem.push({ id: 'kopyala', text: `+ kopyala(): ${a.cls}`, generic: '+ clone(): Prototype', factory: true });
    }
    return mem;
  };

  /** "Çözüm" sahnesinin her adımındaki diyagram (0: instanceof zinciri … 3: kalıplı). */
  PT.solutionDiagram = function (st) {
    const getters = st < 3;
    const gMembers = [M.alici, M.icerik];
    if (st >= 2) gMembers.push(M.copyCtor);
    if (st >= 1) gMembers.push(M.kopyala);
    if (getters) gMembers.push(M.getters);
    const altO = { getters, copy: st >= 2 };
    const ROWY = 300;
    const cls = (k, x) => ({ id: ALT[k].cls, name: ALT[k].cls, kind: 'class', role: 'concretePrototype', x, y: ROWY, w: 272, members: altMembers(k, altO) });
    const classes = [
      { id: 'SiparisEkrani', name: 'SiparisEkrani', kind: 'class', role: 'client', x: 10, y: 30, w: 330, members: [M.tekrarla] },
      { id: 'Gonderi', name: 'Gonderi', kind: 'abstract', role: 'prototype', x: 470, y: 30, w: 300, members: gMembers },
      cls('koli', 10),
      cls('zarf', 304),
      cls('palet', 598),
    ];
    const gen = (k, x) => ({ id: 'gen-' + k, from: ALT[k].cls, to: 'Gonderi', type: 'generalization', fromSide: 'top', fromAt: x, toSide: 'bottom', toAt: x < 470 ? 500 : x > 770 ? 740 : x, mid: 262 });
    const relations = [gen('koli', 210), gen('zarf', 470), gen('palet', 760)];
    if (st < 3) {
      relations.push(
        { id: 'new-koli', from: 'SiparisEkrani', to: 'KoliGonderisi', type: 'create', label: 'instanceof + new', fromSide: 'bottom', fromAt: 70, toSide: 'top', toAt: 70 },
        { id: 'new-zarf', from: 'SiparisEkrani', to: 'ZarfGonderisi', type: 'create', label: 'instanceof + new', fromSide: 'bottom', fromAt: 300, toSide: 'top', toAt: 380, mid: 196, labelAt: [380, 188] },
        { id: 'new-palet', from: 'SiparisEkrani', to: 'PaletGonderisi', type: 'create', label: '✗ tanımıyor', fromSide: 'right', fromAt: 100, toSide: 'top', toAt: 660, points: [[420, 100], [420, 226], [660, 226]], tone: 'bad', labelAt: [560, 218] }
      );
    } else {
      relations.push({ id: 'uses', from: 'SiparisEkrani', to: 'Gonderi', type: 'dependency', label: 'son.kopyala()', fromSide: 'right', fromAt: 66, toSide: 'left', toAt: 66 });
    }
    return { width: 900, height: 470, view: [0, 14, 890, 450], classes, relations };
  };

  /**
   * GoF yapısı (Yapı sahnesi ve özet). o.katalog: prototip yöneticisi görünsün mü · o.notes: kod notları
   */
  PT.gofDiagram = function (o) {
    o = o || {};
    const ROWY = 330;
    const cls = (k, x, g) => ({ id: ALT[k].cls, name: ALT[k].cls, generic: 'ConcretePrototype' + g, kind: 'class', role: 'concretePrototype', x, y: ROWY, w: 262, members: altMembers(k, { copy: true }).filter((m) => m.id !== 'copyCtor') });
    const classes = [
      { id: 'SiparisEkrani', name: 'SiparisEkrani', generic: 'Client', kind: 'class', role: 'client', x: 10, y: 40, w: 300, members: [M.tekrarla] },
      { id: 'Gonderi', name: 'Gonderi', generic: 'Prototype', kind: 'abstract', role: 'prototype', x: 430, y: 40, w: 300, members: [M.alici, M.icerik, M.kopyala, M.ekle] },
      cls('koli', 160, 1),
      cls('zarf', 450, 2),
      cls('palet', 740, 3),
      {
        id: 'SablonKatalogu', name: 'SablonKatalogu', generic: 'PrototypeManager', kind: 'class', role: 'manager', x: 10, y: 196, w: 300, hidden: !o.katalog,
        members: [
          { id: 'sablonlar', text: '- sablonlar: Map<String, Gonderi>', generic: '- prototypes: Map' },
          { id: 'ekle', text: '+ ekle(ad, sablon)', generic: '+ register(key, p)' },
          { id: 'olustur', text: '+ olustur(ad): Gonderi', generic: '+ create(key): Prototype', factory: true },
        ],
      },
    ];
    const gen = (k, x) => ({ id: 'gen-' + k, from: ALT[k].cls, to: 'Gonderi', type: 'generalization', fromSide: 'top', fromAt: x, toSide: 'bottom', toAt: x < 430 ? 450 : x > 730 ? 710 : x, mid: 290 });
    const relations = [
      { id: 'uses', from: 'SiparisEkrani', to: 'Gonderi', type: 'association', label: 'son · kopyala()', genericLabel: 'prototype', fromSide: 'right', fromAt: 74, toSide: 'left', toAt: 74 },
      gen('koli', 291),
      gen('zarf', 581),
      gen('palet', 871),
      { id: 'kat', from: 'SablonKatalogu', to: 'Gonderi', type: 'association', label: 'sablonlar *', genericLabel: 'prototypes *', fromSide: 'right', fromAt: 236, toSide: 'left', toAt: 150, hidden: !o.katalog },
    ];
    // Katalog görünümünde istemci notunun yerinde SablonKatalogu durur: o not yalnızca GoF görünümünde.
    const notes = [];
    if (o.notes && !o.katalog) notes.push({ id: 'n-client', x: 20, y: 160, text: 'Gonderi kopya = son.kopyala();', genericText: 'p = prototype.clone();', target: 'SiparisEkrani', from: 'top', to: 'bottom', toAt: 160 });
    if (o.notes) notes.push({ id: 'n-koli', x: 170, y: 470, text: 'return new KoliGonderisi(this);', genericText: 'return copy of self;', target: 'KoliGonderisi', from: 'top', to: 'bottom', toAt: 290 });
    return { width: 1010, height: 560, title: 'Prototype sınıf diyagramı', classes, relations, notes };
  };
})();
