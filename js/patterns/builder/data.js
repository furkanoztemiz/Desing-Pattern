/*
 * Builder — veri: Java kodları, çıktılar, roller, diyagram tanımları.
 * Bu dosya DOM kullanmaz; tools/export-java.js de Java dosyalarını buradan üretir.
 *
 * Senaryo (lojistik dünyasının devamı): Gönderilerin seçenekleri çoğaldı — kırılgan, soğuk zincir,
 * ekspres, sigorta… Kurucu parametreleri teleskop gibi uzadı; yeri karışan iki `boolean` yüzünden
 * cam vazo "soğuk zincir" ile ve KIRILACAK etiketi olmadan yola çıktı.
 *   Bölüm A (akıcı Builder, Effective Java): Gonderi + iç sınıf Gonderi.Builder, build() doğrular.
 *   Bölüm B (GoF Builder): aynı adımlar bir arayüzde (GonderiHazirlayici); Yönetici (Director)
 *   tarifi bilir; Gonderi.Builder, EtiketHazirlayici ve FiyatHazirlayici aynı tariften üç ayrı
 *   temsil üretir: paket nesnesi, etiket metni, fiyat.
 */
(function () {
  'use strict';
  const DP = (window.DP = window.DP || {});
  const BL = (DP.bl = DP.bl || {});

  // ------------------------------------------------------------------ roller
  BL.roles = {
    client: { en: 'Client', tr: 'İstemci', color: 1 },
    director: { en: 'Director', tr: 'Yönetici', color: 2 },
    builder: { en: 'Builder', tr: 'Yapıcı (arayüz)', color: 3 },
    concreteBuilder: { en: 'ConcreteBuilder', tr: 'Somut Yapıcı', color: 4 },
    product: { en: 'Product', tr: 'Ürün', color: 5 },
  };

  BL.classRoles = {
    Main: 'client',
    VazoGonderisi: 'client',
    AsiGonderisi: 'client',
    HataliGonderi: 'client',
    GonderiYoneticisi: 'director',
    GonderiHazirlayici: 'builder',
    Builder: 'concreteBuilder', // Gonderi.Builder
    'Gonderi.Builder': 'concreteBuilder',
    EtiketHazirlayici: 'concreteBuilder',
    FiyatHazirlayici: 'concreteBuilder',
    JsonHazirlayici: 'concreteBuilder',
    Gonderi: 'product',
    // GoF genel adları
    Client: 'client',
    Director: 'director',
    ConcreteBuilder1: 'concreteBuilder',
    ConcreteBuilder2: 'concreteBuilder',
    ConcreteBuilder3: 'concreteBuilder',
    ConcreteBuilder4: 'concreteBuilder',
    Product: 'product',
    Product1: 'product',
    Product2: 'product',
    Product3: 'product',
    Product4: 'product',
  };

  BL.roleOf = function (name) {
    const r = BL.classRoles[name];
    return r ? BL.roles[r].color : null;
  };

  // build() = GoF'taki getResult(): sonucu teslim eden adım (kodda ayrıca vurgulanır)
  BL.special = { build: 'fm', getResult: 'fm' };

  /** 1 tabanlı satır numarası (yığın izi ve derleyici hatalarını kodla tutarlı üretmek için). */
  BL.lineOf = function (src, needle, from) {
    const lines = src.split('\n');
    for (let i = from || 0; i < lines.length; i++) if (lines[i].includes(needle)) return i + 1;
    return 0;
  };

  const code = (BL.code = {});

  // ================================================================== ortak parçalar
  const toStr = `    @Override
    public String toString() {
        StringBuilder s = new StringBuilder(nereden + " > " + nereye + ", " + agirlik + " kg");
        if (kirilgan) s.append(", KIRILGAN");
        if (sogukZincir) s.append(", SOĞUK ZİNCİR");
        if (ekspres) s.append(", EKSPRES");
        if (sigorta > 0) s.append(", sigorta ").append(sigorta).append(" TL");
        return "Gönderi[" + s + "]";
    }`;

  const finalFields = `    private final String nereden;
    private final String nereye;
    private final int agirlik;
    private final boolean kirilgan;
    private final boolean sogukZincir;
    private final boolean ekspres;
    private final int sigorta;`;

  /** Gönderinin metin hâli (Java'daki toString ile birebir). */
  BL.describe = function (g) {
    let s = `${g.nereden} > ${g.nereye}, ${g.agirlik} kg`;
    if (g.kirilgan) s += ', KIRILGAN';
    if (g.sogukZincir) s += ', SOĞUK ZİNCİR';
    if (g.ekspres) s += ', EKSPRES';
    if (g.sigorta > 0) s += `, sigorta ${g.sigorta} TL`;
    return `Gönderi[${s}]`;
  };

  // ================================================================== "Sorun": kalıpsız kod
  BL.naive = {};
  BL.naive.v1 = {
    Gonderi: `public class Gonderi {

    private final String nereden;
    private final String nereye;
    private final int agirlik;

    public Gonderi(String nereden, String nereye, int agirlik) {
        this.nereden = nereden;
        this.nereye = nereye;
        this.agirlik = agirlik;
    }

    @Override
    public String toString() {
        return "Gönderi[" + nereden + " > " + nereye + ", " + agirlik + " kg]";
    }
}`,
    Main: `public class Main {

    public static void main(String[] args) {
        Gonderi kayisi = new Gonderi("Malatya", "Ankara", 20);

        System.out.println(kayisi);
    }
}`,
  };

  BL.naive.v2 = {
    Gonderi: `public class Gonderi {

${finalFields}

    public Gonderi(String nereden, String nereye, int agirlik) {
        this(nereden, nereye, agirlik, false);
    }

    public Gonderi(String nereden, String nereye, int agirlik, boolean kirilgan) {
        this(nereden, nereye, agirlik, kirilgan, false);
    }

    public Gonderi(String nereden, String nereye, int agirlik, boolean kirilgan,
                   boolean sogukZincir) {
        this(nereden, nereye, agirlik, kirilgan, sogukZincir, false);
    }

    public Gonderi(String nereden, String nereye, int agirlik, boolean kirilgan,
                   boolean sogukZincir, boolean ekspres) {
        this(nereden, nereye, agirlik, kirilgan, sogukZincir, ekspres, 0);
    }

    public Gonderi(String nereden, String nereye, int agirlik, boolean kirilgan,
                   boolean sogukZincir, boolean ekspres, int sigorta) {
        this.nereden = nereden;
        this.nereye = nereye;
        this.agirlik = agirlik;
        this.kirilgan = kirilgan;
        this.sogukZincir = sogukZincir;
        this.ekspres = ekspres;
        this.sigorta = sigorta;
    }

${toStr}
}`,
    Main: `public class Main {

    public static void main(String[] args) {
        Gonderi kayisi = new Gonderi("Malatya", "Ankara", 20);
        Gonderi asi = new Gonderi("İstanbul", "Van", 4, false, true, true, 20000);
        // cam vazo: kırılgan + sigortalı olmalı
        Gonderi vazo = new Gonderi("Kütahya", "İzmir", 12, false, true, false, 5000);

        System.out.println(kayisi);
        System.out.println(asi);
        System.out.println(vazo);
    }
}`,
  };

  BL.naive.v3 = {
    Gonderi: `public class Gonderi {

    private String nereden;
    private String nereye;
    private int agirlik = 1;
    private boolean kirilgan;
    private boolean sogukZincir;
    private boolean ekspres;
    private int sigorta;

    public void setNereden(String nereden) { this.nereden = nereden; }
    public void setNereye(String nereye) { this.nereye = nereye; }
    public void setAgirlik(int agirlik) { this.agirlik = agirlik; }
    public void setKirilgan(boolean kirilgan) { this.kirilgan = kirilgan; }
    public void setSogukZincir(boolean sogukZincir) { this.sogukZincir = sogukZincir; }
    public void setEkspres(boolean ekspres) { this.ekspres = ekspres; }
    public void setSigorta(int sigorta) { this.sigorta = sigorta; }

${toStr}
}`,
    Main: `public class Main {

    public static void main(String[] args) {
        Gonderi vazo = new Gonderi();
        vazo.setNereden("Kütahya");
        vazo.setNereye("İzmir");
        vazo.setAgirlik(12);
        vazo.setKirilgan(true);
        // setSigorta(...) unutuldu: derleyici bir şey demez

        System.out.println(vazo);   // kırılgan ama sigortasız!
    }
}`,
  };

  // Gönderi tarifleri (Main'deki ve Yönetici'deki değerler)
  BL.cargo = {
    kayisi: { nereden: 'Malatya', nereye: 'Ankara', agirlik: 20, kirilgan: false, sogukZincir: false, ekspres: false, sigorta: 0 },
    asi: { nereden: 'İstanbul', nereye: 'Van', agirlik: 4, kirilgan: false, sogukZincir: true, ekspres: true, sigorta: 20000 },
    vazo: { nereden: 'Kütahya', nereye: 'İzmir', agirlik: 12, kirilgan: true, sogukZincir: false, ekspres: false, sigorta: 5000 },
    // teleskop kurucudaki hata: kirilgan=false, sogukZincir=true yazıldı
    vazoHatali: { nereden: 'Kütahya', nereye: 'İzmir', agirlik: 12, kirilgan: false, sogukZincir: true, ekspres: false, sigorta: 5000 },
    // JavaBeans: setSigorta unutuldu
    vazoBean: { nereden: 'Kütahya', nereye: 'İzmir', agirlik: 12, kirilgan: true, sogukZincir: false, ekspres: false, sigorta: 0 },
  };
  const C = BL.cargo;

  /** Kalıpsız sürümlerin çıktısı (Java ile birebir). bad: yanlış oluşturulmuş gönderi. */
  BL.naiveOutput = function (v) {
    if (v === 1) return [{ t: BL.describe(C.kayisi) }];
    if (v === 2) return [{ t: BL.describe(C.kayisi) }, { t: BL.describe(C.asi) }, { t: BL.describe(C.vazoHatali), bad: true }];
    return [{ t: BL.describe(C.vazoBean), bad: true }];
  };

  // ================================================================== Bölüm A: akıcı Builder (Effective Java)
  const builderSteps = (ov) => `        ${ov}public Builder nereden(String sehir) {
            this.nereden = sehir;
            return this;                  // zincirleme için kendini döndür
        }

        ${ov}public Builder nereye(String sehir) {
            this.nereye = sehir;
            return this;
        }

        ${ov}public Builder agirlik(int kg) {
            this.agirlik = kg;
            return this;
        }

        ${ov}public Builder kirilgan() {
            this.kirilgan = true;
            return this;
        }

        ${ov}public Builder sogukZincir() {
            this.sogukZincir = true;
            return this;
        }

        ${ov}public Builder ekspres() {
            this.ekspres = true;
            return this;
        }

        ${ov}public Builder sigorta(int tutar) {
            this.sigorta = tutar;
            return this;
        }`;

  const buildMethod = `        public Gonderi build() {
            if (nereden == null || nereye == null) {
                throw new IllegalStateException("Gönderi: nereden ve nereye zorunlu!");
            }
            if (kirilgan && sigorta == 0) {
                throw new IllegalStateException("Gönderi: kırılgan eşya sigortasız gönderilemez!");
            }
            return new Gonderi(this);     // nesne YALNIZCA burada doğar
        }`;

  const builderFields = `        private String nereden;
        private String nereye;
        private int agirlik = 1;          // varsayılan değerler
        private boolean kirilgan;
        private boolean sogukZincir;
        private boolean ekspres;
        private int sigorta;`;

  const privateCtor = `    private Gonderi(Builder b) {          // yalnızca Builder çağırabilir
        this.nereden = b.nereden;
        this.nereye = b.nereye;
        this.agirlik = b.agirlik;
        this.kirilgan = b.kirilgan;
        this.sogukZincir = b.sogukZincir;
        this.ekspres = b.ekspres;
        this.sigorta = b.sigorta;
    }`;

  const gonderiWithBuilder = (implementsPart, ov, header) => `${header}public class Gonderi {

${finalFields}

${privateCtor}

${toStr}

    /**
     * «${implementsPart ? 'ConcreteBuilder' : 'Builder'}» — Gönderiyi adım adım toplar; build() doğrular ve değişmez nesneyi verir.
     */
    public static class Builder${implementsPart} {

${builderFields}

${builderSteps(ov)}

${buildMethod}
    }
}`;

  code.Gonderi = gonderiWithBuilder(
    '',
    '',
    `/**
 * «Product» — Gönderi. DEĞİŞMEZ (immutable): alanlar final, set metodu yok.
 * Yalnızca iç sınıf Gonderi.Builder oluşturabilir.
 */
`
  );

  code.Main = `public class Main {

    public static void main(String[] args) {
        Gonderi kayisi = new Gonderi.Builder()
                .nereden("Malatya").nereye("Ankara").agirlik(20)
                .build();
        Gonderi asi = new Gonderi.Builder()
                .nereden("İstanbul").nereye("Van").agirlik(4)
                .sogukZincir().ekspres().sigorta(20000)
                .build();
        Gonderi vazo = new Gonderi.Builder()
                .nereden("Kütahya").nereye("İzmir").agirlik(12)
                .kirilgan().sigorta(5000)      // artık her değerin bir adı var
                .build();

        System.out.println(kayisi);
        System.out.println(asi);
        System.out.println(vazo);
    }
}`;

  BL.output = [BL.describe(C.kayisi), BL.describe(C.asi), BL.describe(C.vazo)];

  // ------------------------------------------------------------------ Canlı Akış: üç hazır gönderi programı
  /** Bir gönderi tarifinin adımları: [metot, argüman (kod metni), alan, değer] */
  const STEP = {
    nereden: (v) => ({ m: 'nereden', arg: `"${v}"`, field: 'nereden', value: v }),
    nereye: (v) => ({ m: 'nereye', arg: `"${v}"`, field: 'nereye', value: v }),
    agirlik: (v) => ({ m: 'agirlik', arg: String(v), field: 'agirlik', value: v }),
    kirilgan: () => ({ m: 'kirilgan', arg: '', field: 'kirilgan', value: true }),
    sogukZincir: () => ({ m: 'sogukZincir', arg: '', field: 'sogukZincir', value: true }),
    ekspres: () => ({ m: 'ekspres', arg: '', field: 'ekspres', value: true }),
    sigorta: (v) => ({ m: 'sigorta', arg: String(v), field: 'sigorta', value: v }),
  };
  BL.STEP = STEP;

  BL.presets = {
    vazo: {
      key: 'vazo',
      label: 'Cam vazo',
      cls: 'VazoGonderisi',
      varName: 'vazo',
      steps: [STEP.nereden('Kütahya'), STEP.nereye('İzmir'), STEP.agirlik(12), STEP.kirilgan(), STEP.sigorta(5000)],
    },
    asi: {
      key: 'asi',
      label: 'Aşı kolisi',
      cls: 'AsiGonderisi',
      varName: 'asi',
      steps: [STEP.nereden('İstanbul'), STEP.nereye('Van'), STEP.agirlik(4), STEP.sogukZincir(), STEP.ekspres(), STEP.sigorta(20000)],
    },
    hatali: {
      key: 'hatali',
      label: 'Eksik tarif',
      cls: 'HataliGonderi',
      varName: 'vazo',
      steps: [STEP.nereden('Kütahya'), STEP.nereye('İzmir'), STEP.agirlik(12), STEP.kirilgan()],
      forgot: 'sigorta(...) unutuldu!',
    },
  };
  BL.presetOrder = ['vazo', 'asi', 'hatali'];

  /** Bir hazır gönderinin Java programı (Canlı Akış'ta gösterilir; dışa da aktarılır). */
  code.preset = function (p) {
    const calls = p.steps.map((s, i) => {
      const last = i === p.steps.length - 1 && p.forgot;
      return `                .${s.m}(${s.arg})${last ? '            // ' + p.forgot : ''}`;
    });
    return `public class ${p.cls} {

    public static void main(String[] args) {
        Gonderi ${p.varName} = new Gonderi.Builder()
${calls.join('\n')}
                .build();

        System.out.println(${p.varName});
    }
}`;
  };

  /** Tarifin alanlarını toplar (Builder'ın son durumu). */
  BL.fieldsOf = function (steps) {
    const g = { nereden: null, nereye: null, agirlik: 1, kirilgan: false, sogukZincir: false, ekspres: false, sigorta: 0 };
    steps.forEach((s) => (g[s.field] = s.value));
    return g;
  };

  /** build() doğrulaması (Java'daki kurallarla birebir). null = geçerli. */
  BL.validate = function (g) {
    if (g.nereden == null || g.nereye == null) return 'Gönderi: nereden ve nereye zorunlu!';
    if (g.kirilgan && g.sigorta === 0) return 'Gönderi: kırılgan eşya sigortasız gönderilemez!';
    return null;
  };

  /** Hazır gönderi programının çıktısı (geçersizse gerçek Java yığın izi). */
  BL.presetOutput = function (p) {
    const g = BL.fieldsOf(p.steps);
    const err = BL.validate(g);
    if (!err) return [{ t: BL.describe(g) }];
    const src = code.Gonderi;
    const prog = code.preset(p);
    return [
      { t: `Exception in thread "main" java.lang.IllegalStateException: ${err}`, err: true },
      { t: `\tat Gonderi$Builder.build(Gonderi.java:${BL.lineOf(src, err.includes('kırılgan') ? 'kırılgan eşya sigortasız' : 'nereden ve nereye zorunlu')})`, err: true },
      { t: `\tat ${p.cls}.main(${p.cls}.java:${BL.lineOf(prog, '.build()')})`, err: true },
    ];
  };

  // ------------------------------------------------------------------ "Çözüm": adım adım yeniden düzenleme
  const v2 = BL.naive.v2;
  const R = {};
  // Adım 1: iç sınıf + alanlar
  R.g1 = v2.Gonderi.replace(
    /\n}$/,
    `

    public static class Builder {

${builderFields}
    }
}`
  );
  // Adım 2: akıcı adımlar
  R.g2 = R.g1.replace(
    `${builderFields}
    }
}`,
    `${builderFields}

${builderSteps('')}
    }
}`
  );
  // Adım 3: build() + private kurucu; teleskop kurucular silinir
  R.g3 = code.Gonderi.replace(/^\/\*\*[\s\S]*?\*\/\n/, '').replace(/    \/\*\*\n     \* «Builder»[\s\S]*?\*\/\n/, '');
  BL.refactor = [
    { Gonderi: v2.Gonderi, Main: v2.Main },
    { Gonderi: R.g1, Main: v2.Main },
    { Gonderi: R.g2, Main: v2.Main },
    { Gonderi: R.g3, Main: v2.Main },
    { Gonderi: R.g3, Main: code.Main },
  ];

  /** Adım 3'te (teleskop kurucular silinince) eski Main'in aldığı gerçek javac hatası. */
  BL.refactorErrors = function () {
    const src = v2.Main;
    const out = [];
    [
      ['kayisi', 'String,String,int'],
      ['asi', 'String,String,int,boolean,boolean,boolean,int'],
      ['vazo', 'String,String,int,boolean,boolean,boolean,int'],
    ].forEach(([v, found]) => {
      const ln = BL.lineOf(src, `Gonderi ${v} = new Gonderi(`);
      const text = src.split('\n')[ln - 1];
      out.push({ t: `Main.java:${ln}: error: constructor Gonderi in class Gonderi cannot be applied to given types;`, err: true });
      out.push({ t: text });
      out.push({ t: ' '.repeat(text.indexOf('new Gonderi')) + '^' });
      out.push({ t: '  required: Builder' });
      out.push({ t: '  found:    ' + found });
      out.push({ t: '  reason: actual and formal argument lists differ in length' });
    });
    out.push({ t: '3 errors', err: true });
    return out;
  };

  // ================================================================== Bölüm B: GoF Builder (Director + birden çok temsil)
  const B = (BL.gof = {});

  B.GonderiHazirlayici = `/**
 * «Builder» — Bir gönderiyi tarif eden adımlar.
 * Her ConcreteBuilder bu adımları kendi temsiline çevirir.
 */
public interface GonderiHazirlayici {

    GonderiHazirlayici nereden(String sehir);

    GonderiHazirlayici nereye(String sehir);

    GonderiHazirlayici agirlik(int kg);

    GonderiHazirlayici kirilgan();

    GonderiHazirlayici sogukZincir();

    GonderiHazirlayici ekspres();

    GonderiHazirlayici sigorta(int tutar);
}`;

  B.Gonderi = gonderiWithBuilder(
    ' implements GonderiHazirlayici',
    '@Override\n        ',
    `/**
 * «Product» — Gönderi. DEĞİŞMEZ (immutable): alanlar final, set metodu yok.
 * İç sınıf Gonderi.Builder artık GonderiHazirlayici arayüzünü uygular.
 */
`
  );

  const hazirlayici = (cls, header, fields, bodies, result) => {
    const sig = {
      nereden: 'nereden(String sehir)',
      nereye: 'nereye(String sehir)',
      agirlik: 'agirlik(int kg)',
      kirilgan: 'kirilgan()',
      sogukZincir: 'sogukZincir()',
      ekspres: 'ekspres()',
      sigorta: 'sigorta(int tutar)',
    };
    const methods = Object.keys(sig)
      .map(
        (m) => `    @Override
    public ${cls} ${sig[m]} {
${bodies[m].map((l) => '        ' + l).join('\n')}
        return this;
    }`
      )
      .join('\n\n');
    return `${header}public class ${cls} implements GonderiHazirlayici {

${fields}

${methods}

${result}
}`;
  };

  B.EtiketHazirlayici = hazirlayici(
    'EtiketHazirlayici',
    `/**
 * «ConcreteBuilder» — aynı adımlardan yazdırılabilir bir kargo ETİKETİ üretir.
 */
`,
    '    private final StringBuilder etiket = new StringBuilder("KARGO ETİKETİ\\n");',
    {
      nereden: ['etiket.append("Gönderen : ").append(sehir).append(\'\\n\');'],
      nereye: ['etiket.append("Alıcı    : ").append(sehir).append(\'\\n\');'],
      agirlik: ['etiket.append("Ağırlık  : ").append(kg).append(" kg\\n");'],
      kirilgan: ['etiket.append("!! KIRILACAK EŞYA !!\\n");'],
      sogukZincir: ['etiket.append("** SOĞUK ZİNCİR: 2-8 C **\\n");'],
      ekspres: ['etiket.append(">> EKSPRES >>\\n");'],
      sigorta: ['etiket.append("Sigorta  : ").append(tutar).append(" TL\\n");'],
    },
    `    public String build() {               // «getResult»: ürün bir metin
        return etiket.toString().trim();
    }`
  );

  B.FiyatHazirlayici = hazirlayici(
    'FiyatHazirlayici',
    `/**
 * «ConcreteBuilder» — aynı adımlardan bir FİYAT hesaplar (ürün bir sayı).
 */
`,
    `    private int toplam = 50;              // taban ücret (TL)
    private boolean ekspres;`,
    {
      nereden: ['// fiyatı etkilemez'],
      nereye: ['// fiyatı etkilemez'],
      agirlik: ['toplam += kg * 4;'],
      kirilgan: ['toplam += 40;'],
      sogukZincir: ['toplam += 120;'],
      ekspres: ['ekspres = true;'],
      sigorta: ['toplam += tutar / 100;          // tutarın %1\'i'],
    },
    `    public int build() {                  // «getResult»: ürün bir sayı
        return ekspres ? toplam * 3 / 2 : toplam;
    }`
  );

  B.JsonHazirlayici = hazirlayici(
    'JsonHazirlayici',
    `import java.util.ArrayList;
import java.util.List;

/**
 * «ConcreteBuilder» — aynı adımlardan web servisi için JSON üretir.
 */
`,
    '    private final List<String> alanlar = new ArrayList<>();',
    {
      nereden: ['alanlar.add("\\"nereden\\": \\"" + sehir + "\\"");'],
      nereye: ['alanlar.add("\\"nereye\\": \\"" + sehir + "\\"");'],
      agirlik: ['alanlar.add("\\"agirlik\\": " + kg);'],
      kirilgan: ['alanlar.add("\\"kirilgan\\": true");'],
      sogukZincir: ['alanlar.add("\\"sogukZincir\\": true");'],
      ekspres: ['alanlar.add("\\"ekspres\\": true");'],
      sigorta: ['alanlar.add("\\"sigorta\\": " + tutar);'],
    },
    `    public String build() {               // «getResult»: ürün bir JSON metni
        return "{" + String.join(", ", alanlar) + "}";
    }`
  );

  B.GonderiYoneticisi = `/**
 * «Director» — Yönetici: hazır gönderi tariflerini bilir.
 * Hangi temsilin (paket, etiket, fiyat…) üretildiğini BİLMEZ; yalnızca adımları sırayla çağırır.
 */
public class GonderiYoneticisi {

    public void asiGonderisi(GonderiHazirlayici h) {
        h.nereden("İstanbul")
         .nereye("Van")
         .agirlik(4)
         .sogukZincir()
         .ekspres()
         .sigorta(20000);
    }

    public void vazoGonderisi(GonderiHazirlayici h) {
        h.nereden("Kütahya")
         .nereye("İzmir")
         .agirlik(12)
         .kirilgan()
         .sigorta(5000);
    }
}`;

  BL.recipes = {
    asi: { key: 'asi', label: 'Aşı kolisi', method: 'asiGonderisi', cargo: C.asi, steps: BL.presets.asi.steps },
    vazo: { key: 'vazo', label: 'Cam vazo', method: 'vazoGonderisi', cargo: C.vazo, steps: BL.presets.vazo.steps },
  };

  /** Bölüm B'nin Main'i: aynı tarif, üç (JSON eklenince dört) temsil. */
  B.main = function (recipe, json) {
    const m = BL.recipes[recipe].method;
    return `public class Main {

    public static void main(String[] args) {
        GonderiYoneticisi yonetici = new GonderiYoneticisi();

        Gonderi.Builder paket = new Gonderi.Builder();
        yonetici.${m}(paket);
        System.out.println(paket.build());

        EtiketHazirlayici etiket = new EtiketHazirlayici();
        yonetici.${m}(etiket);
        System.out.println(etiket.build());

        FiyatHazirlayici fiyat = new FiyatHazirlayici();
        yonetici.${m}(fiyat);
        System.out.println("Fiyat: " + fiyat.build() + " TL");${
          json
            ? `

        JsonHazirlayici json = new JsonHazirlayici();
        yonetici.${m}(json);
        System.out.println(json.build());`
            : ''
        }
    }
}`;
  };

  // ------------------------------------------------------------------ temsillerin hesaplanması (Java ile birebir)
  /** Etiket satırları (adım adım). */
  BL.labelLines = function (steps) {
    const out = ['KARGO ETİKETİ'];
    steps.forEach((s) => {
      if (s.m === 'nereden') out.push('Gönderen : ' + s.value);
      if (s.m === 'nereye') out.push('Alıcı    : ' + s.value);
      if (s.m === 'agirlik') out.push('Ağırlık  : ' + s.value + ' kg');
      if (s.m === 'kirilgan') out.push('!! KIRILACAK EŞYA !!');
      if (s.m === 'sogukZincir') out.push('** SOĞUK ZİNCİR: 2-8 C **');
      if (s.m === 'ekspres') out.push('>> EKSPRES >>');
      if (s.m === 'sigorta') out.push('Sigorta  : ' + s.value + ' TL');
    });
    return out;
  };

  /** Fiyat dökümü: her adımın katkısı + toplam. */
  BL.priceTrace = function (steps) {
    let toplam = 50;
    let ekspres = false;
    const lines = [{ t: 'taban ücret', v: '50 TL' }];
    steps.forEach((s) => {
      if (s.m === 'nereden' || s.m === 'nereye') lines.push({ t: s.m + '(' + s.value + ')', v: '—', muted: true });
      if (s.m === 'agirlik') {
        toplam += s.value * 4;
        lines.push({ t: `ağırlık ${s.value} kg × 4`, v: `+${s.value * 4} TL` });
      }
      if (s.m === 'kirilgan') {
        toplam += 40;
        lines.push({ t: 'kırılgan', v: '+40 TL' });
      }
      if (s.m === 'sogukZincir') {
        toplam += 120;
        lines.push({ t: 'soğuk zincir', v: '+120 TL' });
      }
      if (s.m === 'ekspres') {
        ekspres = true;
        lines.push({ t: 'ekspres', v: '× 1,5 (sonda)' });
      }
      if (s.m === 'sigorta') {
        toplam += Math.floor(s.value / 100);
        lines.push({ t: `sigorta %1`, v: `+${Math.floor(s.value / 100)} TL` });
      }
    });
    return { lines, ara: toplam, ekspres, toplam: ekspres ? Math.floor((toplam * 3) / 2) : toplam };
  };

  /** JSON alanları (adım adım). */
  BL.jsonParts = function (steps) {
    return steps.map((s) => {
      if (s.m === 'nereden' || s.m === 'nereye') return `"${s.m}": "${s.value}"`;
      if (s.m === 'agirlik' || s.m === 'sigorta') return `"${s.m}": ${s.value}`;
      return `"${s.m}": true`;
    });
  };

  /** Bölüm B Main'inin çıktısı (Java ile birebir). */
  BL.gofOutput = function (recipe, json) {
    const r = BL.recipes[recipe];
    const out = [BL.describe(r.cargo)].concat(BL.labelLines(r.steps), ['Fiyat: ' + BL.priceTrace(r.steps).toplam + ' TL']);
    if (json) out.push('{' + BL.jsonParts(r.steps).join(', ') + '}');
    return out;
  };

  // ------------------------------------------------------------------ "Genişlet": yeni temsil kolay, yeni adım zor
  BL.ext = {};
  BL.ext.exercise = `public class JsonHazirlayici implements ⟦1⟧ {

    private final List<String> alanlar = new ArrayList<>();

    @Override
    public JsonHazirlayici nereden(String sehir) {
        alanlar.add("\\"nereden\\": \\"" + sehir + "\\"");
        return ⟦2⟧;
    }

    // nereye, agirlik, kirilgan, sogukZincir, ekspres, sigorta: aynı kalıp

    public ⟦3⟧ build() {
        return "{" + String.join(", ", alanlar) + "}";
    }
}`;
  BL.ext.exerciseMain = `// Main.java içine:
JsonHazirlayici json = new JsonHazirlayici();
yonetici.⟦4⟧(json);
System.out.println(json.⟦5⟧());`;

  BL.ext.withCod = B.GonderiHazirlayici.replace(
    '    GonderiHazirlayici sigorta(int tutar);\n}',
    '    GonderiHazirlayici sigorta(int tutar);\n\n    GonderiHazirlayici kapidaOdeme(int tutar);   // YENİ adım\n}'
  );
  BL.ext.withDefault = B.GonderiHazirlayici.replace(
    '    GonderiHazirlayici sigorta(int tutar);\n}',
    `    GonderiHazirlayici sigorta(int tutar);

    // Java 8+: varsayılan gövde → bu adımla ilgilenmeyen hazırlayıcılar değişmeden derlenir
    default GonderiHazirlayici kapidaOdeme(int tutar) {
        return this;
    }
}`
  );

  /** Arayüze yeni adım eklenince her ConcreteBuilder'ın aldığı gerçek javac hatası (dosyalar alfabetik). */
  BL.compileErrors = function (withJson) {
    const items = [
      { file: 'EtiketHazirlayici', cls: 'EtiketHazirlayici', src: B.EtiketHazirlayici, decl: 'public class EtiketHazirlayici' },
      { file: 'FiyatHazirlayici', cls: 'FiyatHazirlayici', src: B.FiyatHazirlayici, decl: 'public class FiyatHazirlayici' },
      { file: 'Gonderi', cls: 'Builder', src: B.Gonderi, decl: 'public static class Builder' },
    ];
    if (withJson) items.push({ file: 'JsonHazirlayici', cls: 'JsonHazirlayici', src: B.JsonHazirlayici, decl: 'public class JsonHazirlayici' });
    items.sort((a, b) => a.file.localeCompare(b.file));
    const out = [];
    items.forEach((it) => {
      const ln = BL.lineOf(it.src, it.decl);
      const text = it.src.split('\n')[ln - 1];
      out.push({ t: `${it.file}.java:${ln}: error: ${it.cls} is not abstract and does not override abstract method kapidaOdeme(int) in GonderiHazirlayici`, err: true });
      out.push({ t: text });
      out.push({ t: ' '.repeat(text.indexOf('class ')) + '^' }); // javac `class` anahtar kelimesini gösterir
    });
    out.push({ t: `${items.length} errors`, err: true });
    return out;
  };

  // ================================================================== UML sınıf diyagramları
  const M = {
    // Gonderi
    gFields: { id: 'alanlar', text: '- nereden, nereye … : final', generic: '- parts : final' },
    gTele: [
      { id: 'k3', text: '+ Gonderi(nereden, nereye, agirlik)' },
      { id: 'k4', text: '+ Gonderi(…, kirilgan)' },
      { id: 'k5', text: '+ Gonderi(…, sogukZincir)' },
      { id: 'k6', text: '+ Gonderi(…, ekspres)' },
      { id: 'k7', text: '+ Gonderi(…, sigorta)' },
    ],
    gPrivate: { id: 'ctor', text: '- Gonderi(b: Builder)', generic: '- Product(b: Builder)', color: 5 },
    gToString: { id: 'toString', text: '+ toString(): String', generic: '+ operation()' },
    // Gonderi.Builder
    bFields: { id: 'alanlar', text: '- nereden, nereye : String', generic: '- parts' },
    bFields2: { id: 'varsayilan', text: '- agirlik = 1, kirilgan …', generic: '- defaults' },
    stNereden: { id: 'nereden', text: '+ nereden(sehir): Builder', generic: '+ buildPartA(): Builder' },
    stNereye: { id: 'nereye', text: '+ nereye(sehir): Builder', generic: '+ buildPartB(): Builder' },
    stKirilgan: { id: 'kirilgan', text: '+ kirilgan(): Builder', generic: '+ buildPartC(): Builder' },
    stMore: { id: 'diger', text: '+ … (7 adım)', generic: '+ …' },
    build: { id: 'build', text: '+ build(): Gonderi', generic: '+ getResult(): Product', factory: true },
  };
  BL.members = M;

  /** Akıcı (Effective Java) Builder'ın yapısı: istemci → Gonderi.Builder → Gonderi. */
  BL.fluentDiagram = function () {
    return {
      width: 900,
      height: 420,
      title: 'Akıcı Builder sınıf diyagramı',
      classes: [
        { id: 'Main', name: 'Main', generic: 'Client', kind: 'class', role: 'client', x: 10, y: 40, w: 190, members: [{ id: 'main', text: '+ main(args)', generic: '+ main()' }] },
        { id: 'Builder', name: 'Gonderi.Builder', generic: 'Builder', kind: 'class', role: 'concreteBuilder', x: 330, y: 40, w: 300, members: [M.bFields, M.bFields2, M.stNereden, M.stKirilgan, M.stMore, M.build] },
        { id: 'Gonderi', name: 'Gonderi', generic: 'Product', kind: 'class', role: 'product', x: 330, y: 330, w: 300, members: [M.gFields, M.gPrivate, M.gToString] },
      ],
      relations: [
        { id: 'uses', from: 'Main', to: 'Builder', type: 'dependency', label: 'adımları çağırır', genericLabel: 'uses', fromSide: 'right', fromAt: 80, toSide: 'left', toAt: 80 },
        { id: 'create', from: 'Builder', to: 'Gonderi', type: 'create', label: '«create» build()', fromSide: 'bottom', fromAt: 430, toSide: 'top', toAt: 430 },
        { id: 'nest', from: 'Builder', to: 'Gonderi', type: 'nesting', label: 'iç sınıf', genericLabel: 'nested', fromSide: 'bottom', fromAt: 560, toSide: 'top', toAt: 560 },
        { id: 'result', from: 'Main', to: 'Gonderi', type: 'dependency', label: 'değişmez sonuç', genericLabel: 'result', fromSide: 'bottom', fromAt: 105, toSide: 'left', toAt: 370 },
      ],
    };
  };

  /** "Çözüm" sahnesinin her adımındaki diyagram (0: teleskop … 4: akıcı Builder). */
  BL.solutionDiagram = function (step) {
    const gonderiMembers = step < 3 ? [M.gFields].concat(M.gTele, [M.gToString]) : [M.gFields, M.gPrivate, M.gToString];
    const builderMembers = [M.bFields, M.bFields2];
    if (step >= 2) builderMembers.push(M.stNereden, M.stKirilgan, M.stMore);
    if (step >= 3) builderMembers.push(M.build);
    const classes = [
      { id: 'Main', name: 'Main', kind: 'class', role: 'client', x: 10, y: 40, w: 220, members: [{ id: 'main', text: '+ main(args)' }] },
      { id: 'Gonderi', name: 'Gonderi', kind: 'class', role: 'product', x: 10, y: 250, w: 320, members: gonderiMembers },
    ];
    const relations = [];
    if (step >= 1) classes.push({ id: 'Builder', name: 'Gonderi.Builder', kind: 'class', role: 'concreteBuilder', x: 450, y: 40, w: 300, members: builderMembers });
    if (step >= 1) relations.push({ id: 'nest', from: 'Builder', to: 'Gonderi', type: 'nesting', label: 'iç sınıf', fromSide: 'bottom', fromAt: 680, toSide: 'right', toAt: 300 });
    if (step < 4) relations.push({ id: 'new', from: 'Main', to: 'Gonderi', type: 'create', label: step < 3 ? 'new Gonderi(7 argüman)' : 'new … ✗', fromSide: 'bottom', fromAt: 110, toSide: 'top', toAt: 110, tone: step === 3 ? 'bad' : null });
    if (step >= 3) relations.push({ id: 'create', from: 'Builder', to: 'Gonderi', type: 'create', label: '«create» build()', fromSide: 'bottom', fromAt: 560, toSide: 'right', toAt: 280 });
    if (step >= 4) relations.push({ id: 'uses', from: 'Main', to: 'Builder', type: 'dependency', label: 'zincirleme çağrılar', fromSide: 'right', fromAt: 80, toSide: 'left', toAt: 80 });
    return { width: 900, height: 480, view: [0, 10, 860, 470], classes, relations };
  };

  /** GoF Builder yapısı (Yapı ve Genişlet sahneleri). o.json: JSON hazırlayıcısı görünsün mü. */
  BL.gofDiagram = function (o) {
    o = o || {};
    const CB_Y = 370;
    const P_Y = 520;
    const cb = (id, name, generic, x, result, gen) => ({
      id,
      name,
      generic,
      kind: 'class',
      role: 'concreteBuilder',
      x,
      y: CB_Y,
      w: 228,
      hidden: id === 'JsonHazirlayici' && !o.json,
      members: [
        { id: 'adimlar', text: '+ nereden(…) … sigorta(…)', generic: '+ buildPart…()' },
        { id: 'build', text: '+ build(): ' + result, generic: '+ getResult(): ' + gen, factory: true },
      ],
    });
    const prod = (id, name, generic, x, stereo, hidden) => ({ id, name, generic, kind: 'class', stereo, role: 'product', x, y: P_Y, w: 228, hidden, members: [] });
    const classes = [
      { id: 'Main', name: 'Main', generic: 'Client', kind: 'class', role: 'client', x: 10, y: 30, w: 230, members: [{ id: 'main', text: '+ main(args)', generic: '+ main()' }] },
      { id: 'GonderiYoneticisi', name: 'GonderiYoneticisi', generic: 'Director', kind: 'class', role: 'director', x: 330, y: 30, w: 330, members: [{ id: 'asi', text: '+ asiGonderisi(h: GonderiHazirlayici)', generic: '+ construct(b: Builder)' }, { id: 'vazo', text: '+ vazoGonderisi(h: GonderiHazirlayici)', generic: '+ construct2(b: Builder)' }] },
      {
        id: 'GonderiHazirlayici', name: 'GonderiHazirlayici', generic: 'Builder', kind: 'interface', role: 'builder', x: 330, y: 160, w: 330,
        members: [
          { id: 'nereden', text: '+ nereden(sehir)', generic: '+ buildPartA()', abstract: true },
          { id: 'kirilgan', text: '+ kirilgan()', generic: '+ buildPartB()', abstract: true },
          { id: 'sigorta', text: '+ sigorta(tutar)', generic: '+ buildPartC()', abstract: true },
          { id: 'diger', text: '+ … (7 adım)', generic: '+ …', abstract: true },
        ],
      },
      cb('Builder', 'Gonderi.Builder', 'ConcreteBuilder1', 10, 'Gonderi', 'Product1'),
      cb('EtiketHazirlayici', 'EtiketHazirlayici', 'ConcreteBuilder2', 262, 'String', 'Product2'),
      cb('FiyatHazirlayici', 'FiyatHazirlayici', 'ConcreteBuilder3', 514, 'int', 'Product3'),
      cb('JsonHazirlayici', 'JsonHazirlayici', 'ConcreteBuilder4', 766, 'String', 'Product4'),
      prod('Gonderi', 'Gonderi', 'Product1', 10, null, false),
      prod('Etiket', 'String', 'Product2', 262, '«metin: etiket»', false),
      prod('Fiyat', 'int', 'Product3', 514, '«sayı: fiyat»', false),
      prod('Json', 'String', 'Product4', 766, '«metin: JSON»', !o.json),
    ];
    const real = (id, x) => ({ id: 'real-' + id, from: id, to: 'GonderiHazirlayici', type: 'realization', fromSide: 'top', fromAt: x + 114, toSide: 'bottom', toAt: x + 114 < 330 ? 360 : x + 114 > 660 ? 630 : x + 114, mid: 342 });
    const create = (from, to, x) => ({ id: 'cr-' + from, from, to, type: 'create', label: '«create»', fromSide: 'bottom', fromAt: x + 114, toSide: 'top', toAt: x + 114 });
    const relations = [
      { id: 'uses-dir', from: 'Main', to: 'GonderiYoneticisi', type: 'dependency', label: 'tarif ister', genericLabel: 'uses', fromSide: 'right', fromAt: 64, toSide: 'left', toAt: 64 },
      { id: 'dir-builder', from: 'GonderiYoneticisi', to: 'GonderiHazirlayici', type: 'dependency', label: 'adımları çağırır', genericLabel: 'builder', fromSide: 'bottom', fromAt: 495, toSide: 'top', toAt: 495 },
      { id: 'main-cb', from: 'Main', to: 'Builder', type: 'create', label: 'hangi temsil?', genericLabel: 'creates', fromSide: 'bottom', fromAt: 124, toSide: 'top', toAt: 124 },
      real('Builder', 10),
      real('EtiketHazirlayici', 262),
      real('FiyatHazirlayici', 514),
      real('JsonHazirlayici', 766),
      create('Builder', 'Gonderi', 10),
      create('EtiketHazirlayici', 'Etiket', 262),
      create('FiyatHazirlayici', 'Fiyat', 514),
      create('JsonHazirlayici', 'Json', 766),
    ];
    return { width: 1000, height: 720, title: 'Builder (GoF) sınıf diyagramı', fitVisible: true, classes, relations };
  };

  // ------------------------------------------------------------------ UML sıralama diyagramı (Canlı Akış)
  BL.seqSpec = function (p) {
    const valid = !BL.validate(BL.fieldsOf(p.steps));
    const messages = [{ from: 'cli', to: 'b', kind: 'create', label: '«create»' }];
    p.steps.forEach((s) => messages.push({ from: 'cli', to: 'b', kind: 'call', label: `${s.m}(${s.arg}) ↩ this`, short: true }));
    messages.push({ from: 'cli', to: 'b', kind: 'call', label: 'build()' });
    if (valid) {
      messages.push({ from: 'b', to: 'g', kind: 'create', label: '«create» new Gonderi(this)' });
      messages.push({ from: 'b', to: 'cli', kind: 'return', label: p.varName });
      messages.push({ from: 'cli', to: 'g', kind: 'call', label: 'toString()', short: true });
    } else {
      messages.push({ from: 'b', to: 'cli', kind: 'return', label: '✗ IllegalStateException' });
    }
    return {
      width: 860,
      height: 120 + messages.length * 40,
      top: 110,
      margin: 120,
      rowH: 38,
      participants: [
        { id: 'cli', label: p.cls, role: 'client' },
        { id: 'b', label: 'builder\n: Gonderi.Builder', role: 'concreteBuilder', object: true },
        { id: 'g', label: p.varName + '\n: Gonderi', role: 'product', object: true },
      ],
      messages,
      initialActive: ['cli'],
    };
  };
})();
