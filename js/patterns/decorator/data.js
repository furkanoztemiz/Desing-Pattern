/*
 * Decorator — veri: Java kodları, çıktılar, roller, diyagram tanımları.
 * Bu dosya DOM kullanmaz; tools/export-java.js de Java dosyalarını buradan üretir.
 *
 * Senaryo (lojistik dünyasının devamı): Gönderilere ek hizmetler satılıyor — ekspres, sigorta, soğuk zincir…
 * Kalıpsız çözüm her KOMBİNASYON için bir alt sınıf yazıyor (3 seçenek = 8 sınıf); sigortaya zam gelince
 * dört sınıftan biri unutuluyor ve fiyat listesi tutarsızlaşıyor. Decorator: her ek hizmet çekirdek gönderiyi
 * SARAN bir katman → new Sigorta(new Ekspres(new StandartKargo())). Ücret katman katman hesaplanır.
 */
(function () {
  'use strict';
  const DP = (window.DP = window.DP || {});
  const DC = (DP.dc = DP.dc || {});

  // ------------------------------------------------------------------ roller
  DC.roles = {
    client: { en: 'Client', tr: 'İstemci', color: 1 },
    component: { en: 'Component', tr: 'Bileşen (arayüz)', color: 2 },
    concreteComponent: { en: 'ConcreteComponent', tr: 'Somut Bileşen', color: 4 },
    decorator: { en: 'Decorator', tr: 'Dekoratör', color: 3 },
    concreteDecorator: { en: 'ConcreteDecorator', tr: 'Somut Dekoratör', color: 5 },
  };

  DC.classRoles = {
    Main: 'client',
    KargoHizmeti: 'component',
    StandartKargo: 'concreteComponent',
    ZarfKargo: 'concreteComponent',
    EkHizmet: 'decorator',
    Ekspres: 'concreteDecorator',
    Sigorta: 'concreteDecorator',
    SogukZincir: 'concreteDecorator',
    SmsBildirim: 'concreteDecorator',
    KurumsalIndirim: 'concreteDecorator',
    HediyePaketi: 'concreteDecorator',
    // GoF genel adları
    Client: 'client',
    Component: 'component',
    ConcreteComponent: 'concreteComponent',
    ConcreteComponent2: 'concreteComponent',
    Decorator: 'decorator',
    ConcreteDecoratorA: 'concreteDecorator',
    ConcreteDecoratorB: 'concreteDecorator',
    ConcreteDecoratorC: 'concreteDecorator',
    ConcreteDecoratorD: 'concreteDecorator',
  };

  DC.roleOf = function (name) {
    const r = DC.classRoles[name];
    return r ? DC.roles[r].color : null;
  };

  // `icteki` = sarılan nesne: her katmanın içteki katmana devrettiği yer (kodda ayrıca vurgulanır)
  DC.special = { icteki: 'dlg' };

  /** 1 tabanlı satır numarası. */
  DC.lineOf = function (src, needle, from) {
    const lines = src.split('\n');
    for (let i = from || 0; i < lines.length; i++) if (lines[i].includes(needle)) return i + 1;
    return 0;
  };

  /** Satırın sonuna, belirli bir sütundan başlayan yorum ekler. */
  const cm = (line, comment, col) => line.padEnd(col || 56) + '// ' + comment;
  const doc = (text) => `/**\n * ${text}\n */\n`;

  const code = (DC.code = {});

  // ================================================================== ek hizmetler (Java ile birebir)
  /** Çekirdekler ve katmanlar: ad (Java sınıfı), açıklama eki, ücret kuralı. */
  DC.CORES = {
    standart: { cls: 'StandartKargo', label: 'Standart kargo', fee: 50 },
    zarf: { cls: 'ZarfKargo', label: 'Zarf', fee: 20 },
  };
  DC.ADDONS = {
    ekspres: { cls: 'Ekspres', label: 'ekspres', fee: 40, icon: '⚡', doc: 'Ekspres teslimat: +40 TL.' },
    sigorta: { cls: 'Sigorta', label: 'sigorta', fee: 35, icon: '🛡', doc: 'Sigorta: +35 TL.' },
    zincir: { cls: 'SogukZincir', label: 'soğuk zincir', fee: 60, icon: '❄', doc: 'Soğuk zincir (2-8 °C): +60 TL.' },
    sms: { cls: 'SmsBildirim', label: 'SMS', fee: 5, icon: '✉', doc: 'SMS bildirimi: +5 TL.' },
    indirim: { cls: 'KurumsalIndirim', label: '%10 kurumsal indirim', pct: 10, icon: '%', doc: 'Kurumsal müşteri: içteki toplamın %10 eksiği.' },
    hediye: { cls: 'HediyePaketi', label: 'hediye paketi', fee: 15, icon: '🎁', doc: 'Hediye paketi: +15 TL.' },
  };
  DC.addonOrder = ['ekspres', 'sigorta', 'zincir', 'sms', 'indirim', 'hediye'];

  /** Bir katman zincirinin ücreti (Java'daki tam sayı aritmetiğiyle birebir). layers: içten dışa. */
  DC.price = function (core, layers) {
    let p = DC.CORES[core].fee;
    layers.forEach((k) => {
      const a = DC.ADDONS[k];
      p = a.pct ? Math.trunc((p * (100 - a.pct)) / 100) : p + a.fee;
    });
    return p;
  };
  /** Her katmandan sonraki ara toplamlar (çekirdek dahil): [50, 90, 125] */
  DC.trace = function (core, layers) {
    const out = [DC.CORES[core].fee];
    layers.forEach((k, i) => out.push(DC.price(core, layers.slice(0, i + 1))));
    return out;
  };
  DC.describe = function (core, layers) {
    return DC.CORES[core].label + layers.map((k) => ' + ' + DC.ADDONS[k].label).join('');
  };
  DC.line = (core, layers) => `${DC.describe(core, layers)} = ${DC.price(core, layers)} TL`;
  /** Java ifadesi: new Sigorta(new Ekspres(new StandartKargo())) */
  DC.expr = function (core, layers) {
    let e = `new ${DC.CORES[core].cls}()`;
    layers.forEach((k) => (e = `new ${DC.ADDONS[k].cls}(${e})`));
    return e;
  };

  // ================================================================== "Sorun": her kombinasyon bir alt sınıf
  const NV = [
    { cls: 'StandartKargo', parent: null, opts: [] },
    { cls: 'EkspresKargo', parent: 'StandartKargo', add: 'ekspres', opts: ['ekspres'] },
    { cls: 'SigortaliKargo', parent: 'StandartKargo', add: 'sigorta', opts: ['sigorta'] },
    { cls: 'SigortaliEkspresKargo', parent: 'EkspresKargo', add: 'sigorta', opts: ['ekspres', 'sigorta'] },
    { cls: 'SogukZincirliKargo', parent: 'StandartKargo', add: 'zincir', opts: ['zincir'] },
    { cls: 'SogukZincirliEkspresKargo', parent: 'EkspresKargo', add: 'zincir', opts: ['ekspres', 'zincir'] },
    { cls: 'SigortaliSogukZincirliKargo', parent: 'SogukZincirliKargo', add: 'sigorta', opts: ['zincir', 'sigorta'] },
    { cls: 'SigortaliSogukZincirliEkspresKargo', parent: 'SogukZincirliEkspresKargo', add: 'sigorta', opts: ['ekspres', 'zincir', 'sigorta'] },
  ];
  DC.NAIVE = NV;
  DC.FORGOT = 'SigortaliSogukZincirliEkspresKargo'; // zamda unutulan sınıf
  /** Sürümdeki sınıf sayısı: v1 = 2, v2 = 4, v3/v4 = 8 */
  DC.naiveCount = { v1: 2, v2: 4, v3: 8, v4: 8 };

  /** Kalıpsız sürümde sigortanın ücreti: v4'te zam (30 → 35) — ama bir sınıf unutuldu. */
  const naiveFee = (v, n) => {
    const a = n.add;
    if (a !== 'sigorta') return DC.ADDONS[a].fee;
    if (v !== 'v4') return 30;
    return n.cls === DC.FORGOT ? 30 : 35;
  };

  function naiveClass(v, n) {
    if (!n.parent) {
      return `public class StandartKargo {

    public String aciklama() {
        return "Standart kargo";
    }

    public int ucret() {
        return 50;
    }
}`;
    }
    const fee = naiveFee(v, n);
    const zam = v === 'v4' && n.add === 'sigorta' && n.cls !== DC.FORGOT;
    const ret = `        return super.ucret() + ${fee};`;
    return `public class ${n.cls} extends ${n.parent} {

    @Override
    public String aciklama() {
        return super.aciklama() + " + ${DC.ADDONS[n.add].label}";
    }

    @Override
    public int ucret() {
${zam ? cm(ret, 'zam: 30 → 35', 48) : ret}
    }
}`;
  }

  function naiveMain(v) {
    const list = NV.slice(0, DC.naiveCount[v]);
    return `public class Main {

    public static void main(String[] args) {
        StandartKargo[] fiyatListesi = {
${list.map((n) => `            new ${n.cls}(),`).join('\n')}
        };
        for (StandartKargo k : fiyatListesi) {
            System.out.println(k.aciklama() + " = " + k.ucret() + " TL");
        }
    }
}`;
  }

  /** Kalıpsız sürümün dosyaları. v: 'v1' | 'v2' | 'v3' | 'v4' (zam) */
  DC.naive = function (v) {
    const files = {};
    NV.slice(0, DC.naiveCount[v]).forEach((n) => (files[n.cls] = naiveClass(v, n)));
    files.Main = naiveMain(v);
    return files;
  };

  /** Kalıpsız fiyat listesi (Java ile birebir): {t, cls, bad} */
  DC.naiveOutput = function (v) {
    return NV.slice(0, DC.naiveCount[v]).map((n) => {
      // zincirin her halkası kendi ücretini ekler (ebeveynden kalıtılan + kendi eklediği)
      let p = 50;
      let d = 'Standart kargo';
      const chain = [];
      for (let c = n; c && c.parent; c = NV.find((x) => x.cls === c.parent)) chain.unshift(c);
      chain.forEach((c) => {
        p += naiveFee(v, c);
        d += ' + ' + DC.ADDONS[c.add].label;
      });
      return { t: `${d} = ${p} TL`, cls: n.cls, bad: v === 'v4' && n.cls === DC.FORGOT };
    });
  };

  // ================================================================== "Çözüm": Decorator
  code.KargoHizmeti = `${doc('«Component» — Bir kargo hizmeti: açıklaması ve ücreti var.')}public interface KargoHizmeti {

    String aciklama();

${cm('    int ucret();', 'TL', 40)}
}`;

  const coreSrc = (k, tag) => {
    const c = DC.CORES[k];
    return `${tag ? doc('«ConcreteComponent» — Çekirdek hizmet: ' + (k === 'standart' ? 'standart koli taşıma.' : 'evrak zarfı.')) : ''}public class ${c.cls} implements KargoHizmeti {

    @Override
    public String aciklama() {
        return "${c.label}";
    }

    @Override
    public int ucret() {
        return ${c.fee};
    }
}`;
  };

  code.EkHizmet = `${doc('«Decorator» — Bütün ek hizmetlerin ortak atası: içteki hizmeti SARAR.\n * İçteki, bir çekirdek de olabilir başka bir ek hizmet de: katmanlar iç içe geçer.')}public abstract class EkHizmet implements KargoHizmeti {

${cm('    protected final KargoHizmeti icteki;', 'sarılan hizmet', 52)}

    protected EkHizmet(KargoHizmeti icteki) {
        this.icteki = icteki;
    }
}`;

  /** Somut dekoratör kaynağı. */
  DC.addonSrc = function (k) {
    const a = DC.ADDONS[k];
    const ucret = a.pct ? cm('        return icteki.ucret() * 9 / 10;', 'içteki toplamın %10 eksiği', 52) : cm(`        return icteki.ucret() + ${a.fee};`, 'içtekine sor, üstüne ekle', 52);
    return `${doc('«ConcreteDecorator» — ' + a.doc)}public class ${a.cls} extends EkHizmet {

    public ${a.cls}(KargoHizmeti icteki) {
        super(icteki);
    }

    @Override
    public String aciklama() {
        return icteki.aciklama() + " + ${a.label}";
    }

    @Override
    public int ucret() {
${ucret}
    }
}`;
  };

  code.StandartKargo = coreSrc('standart', true);
  code.ZarfKargo = coreSrc('zarf', true);
  DC.addonOrder.forEach((k) => (code[DC.ADDONS[k].cls] = DC.addonSrc(k)));

  /** Fiyat listesi: kalıpsız sürümdeki sekiz satır + sınıf yazmadan yeni bir kombinasyon */
  DC.LIST = [
    ['standart', []],
    ['standart', ['ekspres']],
    ['standart', ['sigorta']],
    ['standart', ['ekspres', 'sigorta']],
    ['standart', ['zincir']],
    ['standart', ['ekspres', 'zincir']],
    ['standart', ['zincir', 'sigorta']],
    ['standart', ['ekspres', 'zincir', 'sigorta']],
    ['zarf', ['sigorta', 'sms']],
  ];

  code.Main = `public class Main {

    public static void main(String[] args) {
        KargoHizmeti[] fiyatListesi = {
${DC.LIST.map(([c, l], i) => (i === DC.LIST.length - 1 ? cm(`            ${DC.expr(c, l)},`, 'yeni: hiç sınıf yazmadan', 64) : `            ${DC.expr(c, l)},`)).join('\n')}
        };
        for (KargoHizmeti h : fiyatListesi) {
            System.out.println(h.aciklama() + " = " + h.ucret() + " TL");
        }
    }
}`;
  DC.output = DC.LIST.map(([c, l]) => DC.line(c, l));

  // ------------------------------------------------------------------ adım adım yeniden düzenleme
  const naiveV4 = DC.naive('v4');
  const r1Standart = naiveV4.StandartKargo.replace('public class StandartKargo {', 'public class StandartKargo implements KargoHizmeti {')
    .replace('    public String aciklama() {', '    @Override\n    public String aciklama() {')
    .replace('    public int ucret() {', '    @Override\n    public int ucret() {');
  const kargoHizmetiPlain = code.KargoHizmeti.replace(/^\/\*\*[\s\S]*?\*\/\n/, '');
  const ekHizmetPlain = code.EkHizmet.replace(/^\/\*\*[\s\S]*?\*\/\n/, '');
  const plain = (src) => src.replace(/^\/\*\*[\s\S]*?\*\/\n/, '');
  const step = (o) => Object.assign({}, naiveV4, o);
  DC.refactor = [
    step({}), // 0: sekiz sınıf, zam unutulmuş
    step({ KargoHizmeti: kargoHizmetiPlain, StandartKargo: r1Standart }), // 1: ortak arayüz
    step({ KargoHizmeti: kargoHizmetiPlain, StandartKargo: r1Standart, EkHizmet: ekHizmetPlain }), // 2: dekoratör atası
    step({ KargoHizmeti: kargoHizmetiPlain, StandartKargo: r1Standart, EkHizmet: ekHizmetPlain, Ekspres: plain(code.Ekspres), Sigorta: plain(code.Sigorta), SogukZincir: plain(code.SogukZincir) }), // 3: katmanlar
  ];
  // 4: istemci katmanları kendisi kurar; yedi kombinasyon sınıfı silinir; zarf + SMS yeni
  const r4 = { KargoHizmeti: kargoHizmetiPlain, StandartKargo: plain(code.StandartKargo), ZarfKargo: plain(code.ZarfKargo), EkHizmet: ekHizmetPlain, Ekspres: plain(code.Ekspres), Sigorta: plain(code.Sigorta), SogukZincir: plain(code.SogukZincir), SmsBildirim: plain(code.SmsBildirim), Main: code.Main };
  DC.refactor.push(r4);
  // Dekoratörlü sürümün StandartKargo'su R1'dekiyle aynı içerikte olmalı (fark görünmesin)
  DC.refactorOrder = ['Main', 'KargoHizmeti', 'StandartKargo', 'ZarfKargo', 'EkHizmet', 'Ekspres', 'Sigorta', 'SogukZincir', 'SmsBildirim'].concat(NV.slice(1).map((n) => n.cls));

  // ================================================================== Canlı Akış: katman katman
  DC.presets = {
    ekspresSigorta: { key: 'ekspresSigorta', label: 'Ekspres + sigorta', core: 'standart', layers: ['ekspres', 'sigorta'] },
    zarfSms: { key: 'zarfSms', label: 'Zarf + SMS + ekspres', core: 'zarf', layers: ['sms', 'ekspres'] },
  };
  DC.presetOrder = ['ekspresSigorta', 'zarfSms'];

  DC.akisMain = function (p) {
    const core = DC.CORES[p.core];
    const lines = [cm(`        KargoHizmeti hizmet = new ${core.cls}();`, 'çekirdek', 60)];
    p.layers.forEach((k, i) => lines.push(cm(`        hizmet = new ${DC.ADDONS[k].cls}(hizmet);`, `${i + 1}. katman`, 60)));
    return `public class Main {

    public static void main(String[] args) {
${lines.join('\n')}

        System.out.println(hizmet.aciklama() + " = " + hizmet.ucret() + " TL");
    }
}`;
  };
  DC.akisFiles = (p) =>
    [{ name: 'Main.java', code: DC.akisMain(p) }]
      .concat(
        p.layers
          .slice()
          .reverse()
          .map((k) => ({ name: DC.ADDONS[k].cls + '.java', code: code[DC.ADDONS[k].cls] }))
      )
      .concat([
        { name: DC.CORES[p.core].cls + '.java', code: code[DC.CORES[p.core].cls] },
        { name: 'EkHizmet.java', code: code.EkHizmet },
        { name: 'KargoHizmeti.java', code: code.KargoHizmeti },
      ]);
  DC.akisOutput = (p) => [DC.line(p.core, p.layers)];

  // ================================================================== Sipariş tezgâhı: sıra ve dinamiklik
  DC.tezgah = {
    sira1: ['ekspres', 'sigorta', 'indirim'], // indirim en dışta: 125 → 112
    sira2: ['indirim', 'ekspres', 'sigorta'], // indirim en içte: 45 + 40 + 35 = 120
    ikiSms: ['sigorta', 'sms', 'sms'], // aynı katman iki kez: gönderene ve alıcıya
  };
  DC.TEZGAH_MAX = 5; // ekranda en çok beş katman (Java'da sınır yok)

  /** Tezgâhtaki seçimin Java programı: her satır bir katman */
  DC.tezgahMain = function (core, layers) {
    const lines = [cm(`        KargoHizmeti siparis = new ${DC.CORES[core].cls}();`, 'çekirdek', 60)];
    layers.forEach((k, i) => lines.push(cm(`        siparis = new ${DC.ADDONS[k].cls}(siparis);`, `${i + 1}. katman`, 60)));
    return `public class Main {

    public static void main(String[] args) {
${lines.join('\n')}

        System.out.println(siparis.aciklama() + " = " + siparis.ucret() + " TL");
    }
}`;
  };

  /** Tezgâhın üç rehberli siparişi tek programda (java/decorator/tezgah) */
  DC.tezgahDemo = `public class Main {

    public static void main(String[] args) {
${cm(`        KargoHizmeti disarida = ${DC.expr('standart', DC.tezgah.sira1)};`, 'indirim en dışta', 104)}
${cm(`        KargoHizmeti iceride = ${DC.expr('standart', DC.tezgah.sira2)};`, 'indirim en içte', 104)}
${cm(`        KargoHizmeti ikiSms = ${DC.expr('standart', DC.tezgah.ikiSms)};`, 'aynı katman iki kez', 104)}

        for (KargoHizmeti h : new KargoHizmeti[] { disarida, iceride, ikiSms }) {
            System.out.println(h.aciklama() + " = " + h.ucret() + " TL");
        }
    }
}`;
  DC.tezgahDemoOutput = [DC.line('standart', DC.tezgah.sira1), DC.line('standart', DC.tezgah.sira2), DC.line('standart', DC.tezgah.ikiSms)];

  // ================================================================== Genişlet: yeni katman (HediyePaketi)
  const EX = (DC.ext = {});
  EX.exercise = `public class HediyePaketi extends ⟦1⟧ {

    public HediyePaketi(KargoHizmeti icteki) {
        ⟦2⟧(icteki);
    }

    @Override
    public String aciklama() {
        return icteki.⟦3⟧() + " + hediye paketi";
    }

    @Override
    public int ucret() {
        return icteki.ucret() + ⟦4⟧;
    }
}`;
  EX.exerciseMain = `// Main.java içine:
KargoHizmeti hediye = new ⟦5⟧(new Ekspres(new StandartKargo()));
System.out.println(hediye.aciklama() + " = " + hediye.ucret() + " TL");`;
  EX.Main = `public class Main {

    public static void main(String[] args) {
${cm(`        KargoHizmeti hediye = ${DC.expr('standart', ['ekspres', 'hediye'])};`, 'YENİ katman', 76)}
${cm(`        KargoHizmeti dogumGunu = ${DC.expr('zarf', ['hediye', 'sms'])};`, 'her şeyle birleşir', 76)}

        System.out.println(hediye.aciklama() + " = " + hediye.ucret() + " TL");
        System.out.println(dogumGunu.aciklama() + " = " + dogumGunu.ucret() + " TL");
    }
}`;
  EX.output = [DC.line('standart', ['ekspres', 'hediye']), DC.line('zarf', ['hediye', 'sms'])];

  // ================================================================== Gerçek dünya (JDK) örnekleri
  const RW = (DC.rw = {});
  RW.unmod = (arg) => `import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class SaltOkunur {

    public static void main(String[] args) {
        List<String> icerik = new ArrayList<>(List.of("A4 kağıt", "toner"));
${cm('        List<String> katman = Collections.unmodifiableList(icerik);', 'dekoratör: aynı arayüz, yeni kural', 72)}

${cm('        ' + arg, arg.startsWith('icerik') ? 'asıl listeye ekle' : 'katman üzerinden ekle', 72)}
        System.out.println("katman: " + katman + " (" + katman.size() + " ürün)");
    }
}`;
  RW.unmodOpts = [
    { label: 'icerik.add(…)', arg: 'icerik.add("zımba");', out: ['katman: [A4 kağıt, toner, zımba] (3 ürün)'] },
    {
      label: 'katman.add(…)',
      arg: 'katman.add("zımba");',
      out: [
        'Exception in thread "main" java.lang.UnsupportedOperationException',
        '\tat java.base/java.util.Collections$UnmodifiableCollection.add(Collections.java:1092)',
        `\tat SaltOkunur.main(SaltOkunur.java:${DC.lineOf(RW.unmod('katman.add("zımba");'), 'katman.add(')})`,
      ],
    },
  ];

  RW.lines = () => `import java.io.IOException;
import java.io.LineNumberReader;
import java.io.StringReader;

public class SatirNumarasi {

    public static void main(String[] args) throws IOException {
${cm('        StringReader metin = new StringReader("A4 kağıt\\ntoner\\nzımba");', 'bileşen: düz metin', 80)}
${cm('        LineNumberReader okuyucu = new LineNumberReader(metin);', 'dekoratör: satır sayar', 80)}

        String satir;
        while ((satir = okuyucu.readLine()) != null) {
            System.out.println(okuyucu.getLineNumber() + ": " + satir);
        }
    }
}`;
  RW.linesOut = ['1: A4 kağıt', '2: toner', '3: zımba'];

  RW.gzip = (arg) => `import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.util.zip.GZIPOutputStream;

public class AkisKatmanlari {

    public static void main(String[] args) throws IOException {
${cm('        ByteArrayOutputStream bellek = new ByteArrayOutputStream();', 'bileşen: baytları biriktirir', 76)}
        try (DataOutputStream yazici = new DataOutputStream(${arg})) {
            for (int i = 0; i < 1000; i++) {
                yazici.writeUTF("KRG-" + (1000 + i));
            }
        }
        System.out.println(bellek.size() + " bayt");
    }
}`;
  RW.gzipOpts = [
    { label: 'Katmansız', arg: 'bellek', out: ['10000 bayt'] },
    { label: '+ GZIP katmanı', arg: 'new GZIPOutputStream(bellek)', out: ['1823 bayt'] },
  ];

  // ================================================================== UML sınıf diyagramları
  const M = {
    aciklama: { id: 'aciklama', text: '+ aciklama(): String', generic: '+ operation()', abstract: true },
    ucret: { id: 'ucret', text: '+ ucret(): int', generic: '+ operation2()', abstract: true },
    impl: { id: 'impl', text: '+ aciklama(), ucret()', generic: '+ operation()' },
    icteki: { id: 'icteki', text: '# icteki: KargoHizmeti', generic: '# component: Component', color: 2 },
    decImpl: (fee) => ({ id: 'impl', text: `+ ucret(): içteki + ${fee}`, generic: '+ operation()', factory: true }),
  };
  DC.members = M;

  /**
   * GoF yapısı (Yapı sahnesi, Canlı Akış ve özet).
   * o.hediye: Genişlet'teki yeni dekoratör görünsün mü · o.decs: çizilecek üç somut dekoratör (Canlı Akış'ta tarife göre)
   */
  DC.gofDiagram = function (o) {
    o = o || {};
    const DY = 380;
    const DW = 220; // "+ ucret(): içteki + 40" ve katman metodu noktası sığsın
    const D = o.decs || ['ekspres', 'sigorta', 'zincir'];
    const dec = (k, x, g, hidden) => ({ id: DC.ADDONS[k].cls, name: DC.ADDONS[k].cls, generic: 'ConcreteDecorator' + g, kind: 'class', role: 'concreteDecorator', x, y: DY, w: DW, hidden, members: [DC.ADDONS[k].pct ? { id: 'impl', text: '+ ucret(): içteki × 0,9', generic: '+ operation()', factory: true } : M.decImpl(DC.ADDONS[k].fee)] });
    const classes = [
      { id: 'Main', name: 'Main', generic: 'Client', kind: 'class', role: 'client', x: 10, y: 40, w: 200, members: [{ id: 'main', text: '+ main(args)', generic: '+ main()' }] },
      { id: 'KargoHizmeti', name: 'KargoHizmeti', generic: 'Component', kind: 'interface', role: 'component', x: 330, y: 40, w: 300, members: [M.aciklama, M.ucret] },
      { id: 'StandartKargo', name: 'StandartKargo', generic: 'ConcreteComponent', kind: 'class', role: 'concreteComponent', x: 10, y: 220, w: 230, members: [M.impl] },
      { id: 'ZarfKargo', name: 'ZarfKargo', generic: 'ConcreteComponent2', kind: 'class', role: 'concreteComponent', x: 260, y: 220, w: 200, members: [M.impl] },
      { id: 'EkHizmet', name: 'EkHizmet', generic: 'Decorator', kind: 'abstract', role: 'decorator', x: 560, y: 210, w: 300, members: [M.icteki, { id: 'ctor', text: '# EkHizmet(icteki)', generic: '# Decorator(c)' }] },
      dec(D[0], 300, 'A'),
      dec(D[1], 532, 'B'),
      dec(D[2], 764, 'C'),
      dec('hediye', 996, 'D', !o.hediye),
    ];
    // somut dekoratörlerin kalıtım okları EkHizmet'in altında tek bir üçgende birleşir
    const gen = (k, x) => ({ id: 'gen-' + k, from: DC.ADDONS[k].cls, to: 'EkHizmet', type: 'generalization', fromSide: 'top', fromAt: x + DW / 2, toSide: 'bottom', toAt: 710, mid: 350, hidden: k === 'hediye' && !o.hediye });
    const relations = [
      { id: 'uses', from: 'Main', to: 'KargoHizmeti', type: 'dependency', label: 'kullanır', genericLabel: 'uses', fromSide: 'right', fromAt: 70, toSide: 'left', toAt: 70 },
      { id: 'r-std', from: 'StandartKargo', to: 'KargoHizmeti', type: 'realization', fromSide: 'top', fromAt: 125, toSide: 'left', toAt: 120, points: [[125, 120]] },
      { id: 'r-zarf', from: 'ZarfKargo', to: 'KargoHizmeti', type: 'realization', fromSide: 'top', fromAt: 400, toSide: 'bottom', toAt: 400 },
      { id: 'r-dec', from: 'EkHizmet', to: 'KargoHizmeti', type: 'realization', fromSide: 'top', fromAt: 600, toSide: 'bottom', toAt: 600 },
      { id: 'agg', from: 'EkHizmet', to: 'KargoHizmeti', type: 'aggregation', label: 'icteki', genericLabel: 'component', fromSide: 'right', fromAt: 250, toSide: 'right', toAt: 76, points: [[900, 250], [900, 76]], labelAt: [924, 168] },
      gen(D[0], 300),
      gen(D[1], 532),
      gen(D[2], 764),
      gen('hediye', 996),
    ];
    const notes = o.notes
      ? [{ id: 'n-dec', x: 300, y: 490, text: `return icteki.ucret() + ${DC.ADDONS[D[0]].fee};`, genericText: 'return component.operation() + extra;', target: DC.ADDONS[D[0]].cls, from: 'top', to: 'bottom', toAt: 410 }]
      : [];
    return { width: o.hediye ? 1230 : 1000, height: 560, title: 'Decorator sınıf diyagramı', fitVisible: true, classes, relations, notes };
  };

  /**
   * "Çözüm" sahnesinin her adımındaki diyagram.
   * 0: kombinasyon sınıfları · 1: ortak arayüz · 2: dekoratör atası · 3: katmanlar · 4: istemci kurar (eskiler silinir)
   */
  DC.solutionDiagram = function (st) {
    const DY = 380;
    const DW = 220;
    const DX = { sms: 10, ekspres: 280, sigorta: 512, zincir: 744 }; // SmsBildirim, silinen kombinasyon sınıflarının yerine gelir
    const dec = (k) => ({ id: DC.ADDONS[k].cls, name: DC.ADDONS[k].cls, kind: 'class', role: 'concreteDecorator', x: DX[k], y: DY, w: DW, members: [M.decImpl(DC.ADDONS[k].fee)] });
    const classes = [{ id: 'StandartKargo', name: 'StandartKargo', kind: 'class', role: 'concreteComponent', x: 10, y: 220, w: 230, members: [M.impl] }];
    const relations = [];
    if (st <= 3) {
      classes.push({ id: 'ghost', name: '', kind: 'class', x: 10, y: DY, w: 250, h: 74, ghost: true, ghostText: '+ 7 kombinasyon sınıfı' });
      relations.push({ id: 'gen-ghost', from: 'ghost', to: 'StandartKargo', type: 'generalization', fromSide: 'top', fromAt: 125, toSide: 'bottom', toAt: 125, ghost: true });
    }
    if (st >= 1) {
      classes.push({ id: 'KargoHizmeti', name: 'KargoHizmeti', kind: 'interface', role: 'component', x: 330, y: 40, w: 300, members: [M.aciklama, M.ucret] });
      relations.push({ id: 'r-std', from: 'StandartKargo', to: 'KargoHizmeti', type: 'realization', fromSide: 'top', fromAt: 125, toSide: 'left', toAt: 120, points: [[125, 120]] });
    }
    if (st >= 2) {
      classes.push({ id: 'EkHizmet', name: 'EkHizmet', kind: 'abstract', role: 'decorator', x: 560, y: 210, w: 300, members: [M.icteki, { id: 'ctor', text: '# EkHizmet(icteki)' }] });
      relations.push({ id: 'r-dec', from: 'EkHizmet', to: 'KargoHizmeti', type: 'realization', fromSide: 'top', fromAt: 600, toSide: 'bottom', toAt: 600 });
      relations.push({ id: 'agg', from: 'EkHizmet', to: 'KargoHizmeti', type: 'aggregation', label: 'icteki', fromSide: 'right', fromAt: 250, toSide: 'right', toAt: 76, points: [[900, 250], [900, 76]], labelAt: [924, 168] });
    }
    if (st >= 3) {
      const ks = st >= 4 ? ['ekspres', 'sigorta', 'zincir', 'sms'] : ['ekspres', 'sigorta', 'zincir'];
      ks.forEach((k) => {
        classes.push(dec(k));
        relations.push({ id: 'gen-' + k, from: DC.ADDONS[k].cls, to: 'EkHizmet', type: 'generalization', fromSide: 'top', fromAt: DX[k] + DW / 2, toSide: 'bottom', toAt: 710, mid: 350 });
      });
    }
    if (st >= 4) {
      classes.push({ id: 'ZarfKargo', name: 'ZarfKargo', kind: 'class', role: 'concreteComponent', x: 260, y: 220, w: 200, members: [M.impl] });
      relations.push({ id: 'r-zarf', from: 'ZarfKargo', to: 'KargoHizmeti', type: 'realization', fromSide: 'top', fromAt: 400, toSide: 'bottom', toAt: 400 });
      classes.push({ id: 'Main', name: 'Main', kind: 'class', role: 'client', x: 10, y: 40, w: 170, members: [{ id: 'main', text: '+ main(args)' }] });
      relations.push({ id: 'uses', from: 'Main', to: 'KargoHizmeti', type: 'dependency', label: 'katmanları kurar', fromSide: 'right', fromAt: 70, toSide: 'left', toAt: 70 });
    }
    return { width: 1000, height: 500, view: [0, 14, 985, 470], classes, relations };
  };

  // ------------------------------------------------------------------ UML sıralama diyagramı (Canlı Akış)
  DC.seqSpec = function (p) {
    const L = p.layers.slice().reverse(); // dıştan içe
    const parts = [{ id: 'main', label: 'Main', role: 'client' }].concat(
      L.map((k, i) => ({ id: 'd' + i, label: (i === 0 ? 'hizmet\n: ' : ': ') + DC.ADDONS[k].cls, role: 'concreteDecorator', object: true })),
      [{ id: 'core', label: ': ' + DC.CORES[p.core].cls, role: 'concreteComponent', object: true }]
    );
    const ids = ['main'].concat(L.map((k, i) => 'd' + i), ['core']);
    const tr = DC.trace(p.core, p.layers); // içten dışa ara toplamlar
    const messages = [];
    for (let i = 0; i < ids.length - 1; i++) messages.push({ from: ids[i], to: ids[i + 1], kind: 'call', label: 'ucret()' });
    for (let i = ids.length - 1; i > 0; i--) {
      const value = tr[ids.length - 1 - i];
      messages.push({ from: ids[i], to: ids[i - 1], kind: 'return', label: String(value) });
    }
    return { width: 900, height: 140 + messages.length * 42, top: 110, margin: 110, rowH: 40, participants: parts, messages, initialActive: ['main'] };
  };
})();
