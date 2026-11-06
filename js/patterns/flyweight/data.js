/*
 * Flyweight — veri: Java kodları, çıktılar, roller, diyagram tanımları.
 * Bu dosya DOM kullanmaz; tools/export-java.js de Java dosyalarını buradan üretir.
 *
 * Senaryo (lojistik dünyasının devamı): Kuryelerin tabletinde canlı bir gönderi haritası var. Her nokta kendi
 * ikonunu (64×64 resim, 16 KB) yüklüyor: üç gönderide sorun yok, bütün Türkiye (10.000 gönderi) gelince
 * 64 MB'lık tablette OutOfMemoryError. "Kestirme" bir paylaşım bütün noktayı paylaşıyor: bellek düzeliyor ama
 * son yazan kazanıyor, Ali'nin gönderisi başka birinin konumunda çiziliyor.
 * Flyweight: durum ikiye ayrılır. İçsel (türe ait: ad, ikon) az sayıda paylaşılan, değişmez nesnede durur;
 * dışsal (gönderiye ait: etiket, konum) noktada kalır ve çizerken parametreyle gider. Fabrika paylaşımı garanti eder.
 */
(function () {
  'use strict';
  const DP = (window.DP = window.DP || {});
  const FL = (DP.fl = DP.fl || {});

  // ------------------------------------------------------------------ roller
  FL.roles = {
    client: { en: 'Client', tr: 'İstemci', color: 1 },
    flyweight: { en: 'Flyweight', tr: 'Sinek sıklet (arayüz)', color: 2 },
    concreteFlyweight: { en: 'ConcreteFlyweight', tr: 'Paylaşılan nesne', color: 4 },
    unshared: { en: 'UnsharedConcreteFlyweight', tr: 'Paylaşılmayan nesne', color: 5 },
    factory: { en: 'FlyweightFactory', tr: 'Fabrika (havuz)', color: 3 },
  };

  FL.classRoles = {
    Main: 'client',
    Harita: 'client',
    HaritaNoktasi: 'client',
    Isaret: 'flyweight',
    IsaretTuru: 'concreteFlyweight',
    DepoIsareti: 'unshared',
    IsaretFabrikasi: 'factory',
    // GoF genel adları
    Client: 'client',
    Context: 'client',
    Flyweight: 'flyweight',
    ConcreteFlyweight: 'concreteFlyweight',
    UnsharedConcreteFlyweight: 'unshared',
    FlyweightFactory: 'factory',
  };

  FL.roleOf = function (name) {
    const r = FL.classRoles[name];
    return r ? FL.roles[r].color : null;
  };

  // `havuz` = fabrikanın paylaşılan nesneleri tuttuğu yer (kodda ayrıca vurgulanır)
  FL.special = { havuz: 'fly' };

  /** 1 tabanlı satır numarası. */
  FL.lineOf = function (src, needle, from) {
    const lines = src.split('\n');
    for (let i = from || 0; i < lines.length; i++) if (lines[i].includes(needle)) return i + 1;
    return 0;
  };

  /** Satırın sonuna, belirli bir sütundan başlayan yorum ekler (satır uzunsa en az iki boşluk). */
  const cm = (line, comment, col) => line.padEnd(Math.max(col || 56, line.length + 2)) + '// ' + comment;
  const doc = (text) => `/**\n * ${text}\n */\n`;
  const plain = (src) => src.replace(/^((?:import [^\n]+\n)*\n?)\/\*\*[\s\S]*?\*\/\n/, '$1');
  FL.plain = plain;
  /** 9997 → 9_997 (Java sayı yazımı) */
  const lit = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '_');
  /** 10000 → 10.000 (Türkçe yazım) */
  FL.sayi = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  const code = (FL.code = {});

  // ================================================================== model (Java ile birebir)
  FL.IKON = 64 * 64 * 4; // bayt (16 KB)
  FL.IKON_KB = FL.IKON / 1024;
  FL.ORNEK = 5; // Harita.ciz() konsola ilk beş noktayı çizer
  FL.TABLET = 64; // kurye tableti: -Xmx64m
  FL.PC = 512; // geliştiricinin bilgisayarı: -Xmx512m
  /** Gerçek ölçüm (Java 21, -Xmx64m, G1): kalıpsız harita ≈ 3.950. noktada çöker */
  FL.CRASH_AT = 3950;

  /** Gonderiler.java'daki 12 il: [ad, x, y] — harita koordinatları (800 × 360) */
  FL.ILLER = [
    ['Malatya', 521, 215],
    ['Ankara', 306, 135],
    ['İzmir', 81, 212],
    ['İstanbul', 153, 80],
    ['Antalya', 221, 289],
    ['Van', 721, 208],
    ['Trabzon', 576, 81],
    ['Adana', 403, 284],
    ['Erzurum', 637, 137],
    ['Konya', 291, 240],
    ['Samsun', 443, 66],
    ['Diyarbakır', 596, 238],
  ];
  FL.TURLER = ['koli', 'zarf', 'koli', 'palet', 'koli'];
  FL.turOrder = ['koli', 'zarf', 'palet'];
  FL.TUR = {
    koli: { ad: 'koli', dosya: 'koli.png', name: 'Koli' },
    zarf: { ad: 'zarf', dosya: 'zarf.png', name: 'Zarf' },
    palet: { ad: 'palet', dosya: 'palet.png', name: 'Palet' },
  };

  /** Main'deki üç gönderi (takip numaraları ve şehirler önceki modüllerle aynı) */
  FL.UC = [
    { etiket: 'KRG-1001', x: 521, y: 215, tur: 'koli', kim: 'Ali · Malatya' },
    { etiket: 'KRG-1002', x: 306, y: 135, tur: 'zarf', kim: 'Ayşe · Ankara' },
    { etiket: 'KRG-1003', x: 81, y: 212, tur: 'koli', kim: 'Zeynep · İzmir' },
  ];
  /** Genişlet: Malatya aktarma merkezi (paylaşılmayan işaret) */
  FL.DEPO = { etiket: 'Malatya Aktarma', x: 548, y: 236, depo: { sehir: 'Malatya', doluluk: 87 } };

  /** Gonderiler.ekle'nin i. gönderisi (Java ile birebir) */
  FL.gen = function (i) {
    const il = FL.ILLER[i % FL.ILLER.length];
    return {
      etiket: 'KRG-' + (1004 + i),
      x: il[1] + ((i * 37) % 29) + ((i * 13) % 19) + ((i * 7) % 11) - 28,
      y: il[2] + ((i * 53) % 19) + ((i * 11) % 13) + ((i * 5) % 9) - 19,
      tur: FL.TURLER[i % FL.TURLER.length],
    };
  };

  // ------------------------------------------------------------------ ortak Java kaynakları
  code.Ikon = `${doc('Diskten okunan 64×64 ikon (RGBA): 16 KB piksel verisi.')}public class Ikon {

${cm('    public static final int BOYUT = 64 * 64 * 4;', '16 KB', 56)}
${cm('    static int yuklenen;', 'ölçüm: kaç ikon yüklendi?', 56)}

    private final String dosya;
    private final int no;
${cm('    private final byte[] pikseller = new byte[BOYUT];', 'gerçekte PNG dosyasından okunur', 56)}

    public Ikon(String dosya) {
        this.dosya = dosya;
        this.no = ++yuklenen;
    }

    @Override
    public String toString() {
        return dosya + "#" + no;
    }
}`;

  const ilSatirlari = [0, 4, 8]
    .map((k) => {
      const grup = FL.ILLER.slice(k, k + 4);
      return cm('        ' + grup.map((il) => `{ ${il[1]}, ${il[2]} },`).join(' '), grup.map((il) => il[0]).join(', '), 70);
    })
    .join('\n');
  code.Gonderiler = `${doc("Örnek veri: bütün Türkiye'den gönderiler, 12 ilin çevresine dağılmış (her çalıştırmada aynı).")}public class Gonderiler {

    private static final int[][] ILLER = {
${ilSatirlari}
    };
    private static final String[] TURLER = { ${FL.TURLER.map((t) => `"${t}"`).join(', ')} };

    public static void ekle(Harita harita, int adet) {
        for (int i = 0; i < adet; i++) {
            int[] il = ILLER[i % ILLER.length];
${cm('            int x = il[0] + (i * 37) % 29 + (i * 13) % 19 + (i * 7) % 11 - 28;', 'ilin çevresine dağıt', 80)}
${cm('            int y = il[1] + (i * 53) % 19 + (i * 11) % 13 + (i * 5) % 9 - 19;', 'her çalıştırmada aynı', 80)}
            harita.ekle("KRG-" + (1004 + i), x, y, TURLER[i % TURLER.length]);
        }
    }
}`;

  // ================================================================== "Sorun": her nokta kendi ikonunu taşıyor
  const CIZ_SATIRI = 'System.out.println("[" + tur + "] " + etiket + " → (" + x + ", " + y + ") · " + ikon);';

  /** Kalıpsız nokta. kind: 'kopya' (her nokta kendi ikonu) | 'kestirme' (bütün nokta türe göre paylaşılır) */
  function noktaSrc(kind) {
    const docText = 'Haritadaki bir gönderi noktası: türü, ikonu, etiketi ve konumu.';
    if (kind === 'kopya')
      return `${doc(docText)}public class HaritaNoktasi {

    private final String tur;
    private final Ikon ikon;
    private final String etiket;
    private final int x;
    private final int y;

    public HaritaNoktasi(String etiket, int x, int y, String tur) {
        this.tur = tur;
${cm('        this.ikon = new Ikon(tur + ".png");', 'her nokta kendi kopyasını yükler', 52)}
        this.etiket = etiket;
        this.x = x;
        this.y = y;
    }

    public void ciz() {
        ${CIZ_SATIRI}
    }
}`;
    return `import java.util.HashMap;
import java.util.Map;

${doc(docText)}public class HaritaNoktasi {

    // kestirme: aynı türden noktalar TEK nesneyi paylaşsın (ikon bir kez yüklensin)
    private static final Map<String, HaritaNoktasi> HAVUZ = new HashMap<>();

    private final String tur;
    private final Ikon ikon;
    private String etiket;
    private int x;
    private int y;

    private HaritaNoktasi(String tur) {
        this.tur = tur;
        this.ikon = new Ikon(tur + ".png");
    }

    public static HaritaNoktasi al(String etiket, int x, int y, String tur) {
        HaritaNoktasi nokta = HAVUZ.get(tur);
        if (nokta == null) {
            nokta = new HaritaNoktasi(tur);
            HAVUZ.put(tur, nokta);
        }
${cm('        nokta.etiket = etiket;', 'paylaşılan nesnenin üstüne yazılır!', 44)}
        nokta.x = x;
        nokta.y = y;
        return nokta;
    }

    public void ciz() {
        ${CIZ_SATIRI}
    }
}`;
  }
  code.NoktaKopya = noktaSrc('kopya');
  code.NoktaKestirme = noktaSrc('kestirme');

  /** Harita. kind: 'kopya' | 'kestirme' | 'flyweight' */
  function haritaSrc(kind) {
    const fw = kind === 'flyweight';
    const ekle = fw
      ? `    public void ekle(String etiket, int x, int y, String tur) {
${cm('        ekle(etiket, x, y, fabrika.al(tur));', 'paylaşılan işaret: fabrikadan', 52)}
    }

    public void ekle(String etiket, int x, int y, Isaret isaret) {
        noktalar.add(new HaritaNoktasi(etiket, x, y, isaret));
    }`
      : `    public void ekle(String etiket, int x, int y, String tur) {
        noktalar.add(${kind === 'kestirme' ? 'HaritaNoktasi.al(etiket, x, y, tur)' : 'new HaritaNoktasi(etiket, x, y, tur)'});
    }`;
    return `import java.util.ArrayList;
import java.util.List;

${doc(fw ? '«Client» — Canlı gönderi haritası: dışsal durumu (noktaları) tutar, işaretleri fabrikadan alır.' : 'Canlı gönderi haritası: kuryelerin tabletinde çalışır.')}public class Harita {

${cm('    private static final int ORNEK = 5;', 'konsola çizilen nokta sayısı', 52)}

    private final List<HaritaNoktasi> noktalar = new ArrayList<>();
${fw ? '    private final IsaretFabrikasi fabrika = new IsaretFabrikasi();\n' : ''}
${ekle}

    public void ciz() {
        for (int i = 0; i < Math.min(ORNEK, noktalar.size()); i++) {
            noktalar.get(i).ciz();
        }
        if (noktalar.size() > ORNEK) {
            System.out.println("… ve " + (noktalar.size() - ORNEK) + " nokta daha");
        }
    }

    public String ozet() {
        return "Harita: " + noktalar.size() + " nokta, " + Ikon.yuklenen + " ikon, "
                + Ikon.yuklenen * Ikon.BOYUT / 1024 + " KB";
    }
}`;
  }
  code.HaritaKopya = haritaSrc('kopya');
  code.HaritaKestirme = haritaSrc('kestirme');

  /** Main: üç gönderi (+ depo) ve isteğe bağlı olarak bütün Türkiye. prog: {items, adet} */
  function mainSrc(prog) {
    const calls = prog.items.map((it) => {
      if (it.depo) return `        harita.ekle("${it.etiket}", ${it.x}, ${it.y}, new DepoIsareti("${it.depo.sehir}", ${it.depo.doluluk}));`;
      const st = `        harita.ekle("${it.etiket}", ${it.x}, ${it.y}, "${it.tur}");`;
      return it.kim ? cm(st, it.kim, 60) : st;
    });
    if (prog.adet) calls.push(cm(`        Gonderiler.ekle(harita, ${lit(prog.adet)});`, 'bütün Türkiye', 60));
    return `public class Main {

    public static void main(String[] args) {
        Harita harita = new Harita();
${calls.join('\n')}
        harita.ciz();
        System.out.println(harita.ozet());
    }
}`;
  }
  FL.mainFor = mainSrc;

  // ================================================================== "Çözüm": içsel / dışsal ayrımı
  code.Isaret = `${doc('«Flyweight» — Haritaya çizilebilen her şey. Dışsal durum (konum, etiket) çağrıyla gelir.')}public interface Isaret {

    void ciz(int x, int y, String etiket);
}`;

  code.IsaretTuru = `${doc('«ConcreteFlyweight» — Bir gönderi türünün işareti: yalnızca İÇSEL durum. Paylaşılır, değişmez.')}public final class IsaretTuru implements Isaret {

    private final String ad;
${cm('    private final Ikon ikon;', '16 KB: paylaşılan ağır kısım', 48)}

${cm('    IsaretTuru(String ad) {', 'yalnızca fabrika yaratır', 48)}
        this.ad = ad;
        this.ikon = new Ikon(ad + ".png");
    }

    @Override
    public void ciz(int x, int y, String etiket) {
        System.out.println("[" + ad + "] " + etiket + " → (" + x + ", " + y + ") · " + ikon);
    }

    @Override
    public String toString() {
        return ad + " (" + ikon + ")";
    }
}`;

  code.IsaretFabrikasi = `import java.util.HashMap;
import java.util.Map;

${doc('«FlyweightFactory» — İşaretleri üretir ve paylaştırır: her tür için TEK nesne.')}public class IsaretFabrikasi {

    private final Map<String, IsaretTuru> havuz = new HashMap<>();

    public Isaret al(String tur) {
        IsaretTuru isaret = havuz.get(tur);
${cm('        if (isaret == null) {', 'havuzda yok: bir kez yarat', 48)}
            isaret = new IsaretTuru(tur);
            havuz.put(tur, isaret);
            System.out.println("[Fabrika] yeni tür: " + isaret);
        }
${cm('        return isaret;', 'varsa hep AYNI nesne', 48)}
    }
}`;

  code.HaritaNoktasi = `${doc('Haritadaki bir nokta: yalnızca DIŞSAL durum (etiket, konum) ve paylaşılan işarete başvuru.')}public class HaritaNoktasi {

${cm('    private final Isaret isaret;', 'paylaşılan: içsel durum orada', 48)}
    private final String etiket;
    private final int x;
    private final int y;

    public HaritaNoktasi(String etiket, int x, int y, Isaret isaret) {
        this.isaret = isaret;
        this.etiket = etiket;
        this.x = x;
        this.y = y;
    }

    public void ciz() {
${cm('        isaret.ciz(x, y, etiket);', 'dışsal durum çağrıyla gider', 48)}
    }
}`;
  code.Harita = haritaSrc('flyweight');

  code.DepoIsareti = `${doc('«UnsharedConcreteFlyweight» — Aktarma merkezi: her depo tek ve kendine özgü; paylaşılmaz.')}public class DepoIsareti implements Isaret {

${cm('    private final int doluluk;', 'yüzde: deponun KENDİ durumu', 48)}
    private final Ikon foto;

    public DepoIsareti(String sehir, int doluluk) {
        this.doluluk = doluluk;
${cm('        this.foto = new Ikon("depo-" + sehir + ".png");', 'her deponun kendi fotoğrafı', 58)}
    }

    @Override
    public void ciz(int x, int y, String etiket) {
        System.out.println("[depo] " + etiket + " → (" + x + ", " + y + ") · " + foto + " · doluluk %" + doluluk);
    }
}`;

  /** Bir tasarımın dosyaları. mode: 'kopya' | 'kestirme' | 'flyweight' */
  FL.filesFor = function (mode, prog) {
    const F = { Main: mainSrc(prog) };
    if (mode === 'flyweight') {
      Object.assign(F, { Harita: code.Harita, HaritaNoktasi: code.HaritaNoktasi, IsaretFabrikasi: code.IsaretFabrikasi, Isaret: code.Isaret, IsaretTuru: code.IsaretTuru });
      if (prog.items.some((it) => it.depo)) F.DepoIsareti = code.DepoIsareti;
    } else {
      F.Harita = mode === 'kestirme' ? code.HaritaKestirme : code.HaritaKopya;
      F.HaritaNoktasi = mode === 'kestirme' ? code.NoktaKestirme : code.NoktaKopya;
    }
    F.Ikon = code.Ikon;
    if (prog.adet) F.Gonderiler = code.Gonderiler;
    return F;
  };
  FL.fileOrder = ['Main', 'Harita', 'HaritaNoktasi', 'IsaretFabrikasi', 'Isaret', 'IsaretTuru', 'DepoIsareti', 'Ikon', 'Gonderiler'];
  FL.fileList = (F, order) => (order || FL.fileOrder).filter((n) => F[n]).map((n) => ({ name: n + '.java', code: F[n] }));

  // ------------------------------------------------------------------ çalıştırma (Java ile birebir)
  /** Kalıpsız harita, verilen bellekte kaç noktaya kadar dayanır? (yaklaşık; yalnızca uzak durumlarda kullanılır) */
  FL.dayanir = (n, heap) => n * 16.55 < heap * 1024 * 0.98;

  /**
   * Programın çıktısı ve iz.
   * prog: {mode: 'kopya'|'kestirme'|'flyweight', items: [...], adet, heap: MB}
   * Çıktı satırı: {t, k: 'fab'|'ciz'|'depo'|'more'|'sum'|'err', tur, no, i (nokta sırası)}
   * İz (Main'deki her ekle için): {it, olay: 'kopya'|'yeni'|'var'|'ustune'|'depo', no, cikti: [satır indeksleri]}
   */
  FL.run = function (prog) {
    const mode = prog.mode;
    const heap = prog.heap || FL.TABLET;
    const N = prog.items.length + (prog.adet || 0);
    const out = [];
    let ikon = 0;
    const havuz = {}; // tür → {no} (flyweight) | {no, etiket, x, y} (kestirme)
    const liste = []; // {etiket, x, y, tur, no, depo}
    const sayac = { koli: 0, zarf: 0, palet: 0 };
    const iz = [];
    const ekle = (it, named) => {
      const n0 = out.length;
      let olay;
      let no;
      if (it.depo) {
        no = ++ikon;
        olay = 'depo';
        liste.push(Object.assign({}, it, { no }));
      } else if (mode === 'kopya') {
        no = ++ikon;
        olay = 'kopya';
        liste.push(Object.assign({}, it, { no }));
      } else {
        let p = havuz[it.tur];
        if (!p) {
          p = havuz[it.tur] = { no: ++ikon };
          olay = 'yeni';
          if (mode === 'flyweight') out.push({ t: `[Fabrika] yeni tür: ${it.tur} (${it.tur}.png#${p.no})`, k: 'fab', tur: it.tur, no: p.no });
        } else olay = mode === 'kestirme' ? 'ustune' : 'var';
        no = p.no;
        if (mode === 'kestirme') {
          Object.assign(p, { etiket: it.etiket, x: it.x, y: it.y });
          liste.push({ tur: it.tur, ref: true });
        } else liste.push(Object.assign({}, it, { no }));
      }
      if (it.tur) sayac[it.tur]++;
      if (named) iz.push({ it, olay, no, cikti: out.slice(n0).map((_, k) => n0 + k) });
    };
    prog.items.forEach((it) => ekle(it, true));
    // kalıpsız tasarım: bellek dolunca Gonderiler.ekle içinde çöker
    if (mode === 'kopya' && !FL.dayanir(N, heap)) {
      const F = FL.filesFor('kopya', prog);
      const at = (cls, needle) => `\tat ${cls}(${cls.split('.')[0]}.java:${FL.lineOf(F[cls.split('.')[0]], needle)})`;
      ['Exception in thread "main" java.lang.OutOfMemoryError: Java heap space',
        at('Ikon.<init>', 'new byte[BOYUT]'),
        at('HaritaNoktasi.<init>', 'this.ikon = new Ikon('),
        at('Harita.ekle', 'noktalar.add('),
        at('Gonderiler.ekle', 'harita.ekle('),
        at('Main.main', 'Gonderiler.ekle('),
      ].forEach((t) => out.push({ t, k: 'err' }));
      // türlerin dağılımı programın girdisidir (çökmeden bağımsız)
      for (let i = 0; i < (prog.adet || 0); i++) sayac[FL.TURLER[i % FL.TURLER.length]]++;
      return { lines: out, iz, stats: { N, ikon: FL.CRASH_AT, oom: true, sayac, havuz }, liste };
    }
    for (let i = 0; i < (prog.adet || 0); i++) ekle(FL.gen(i), false);
    // ciz(): ilk beş nokta
    for (let i = 0; i < Math.min(FL.ORNEK, liste.length); i++) {
      const e = liste[i];
      if (e.depo) out.push({ t: `[depo] ${e.etiket} → (${e.x}, ${e.y}) · depo-${e.depo.sehir}.png#${e.no} · doluluk %${e.depo.doluluk}`, k: 'depo', no: e.no, i });
      else {
        const s = e.ref ? havuz[e.tur] : e;
        out.push({ t: `[${e.tur}] ${s.etiket} → (${s.x}, ${s.y}) · ${e.tur}.png#${e.ref ? s.no : e.no}`, k: 'ciz', tur: e.tur, no: e.ref ? s.no : e.no, i });
      }
    }
    if (liste.length > FL.ORNEK) out.push({ t: `… ve ${liste.length - FL.ORNEK} nokta daha`, k: 'more' });
    out.push({ t: `Harita: ${liste.length} nokta, ${ikon} ikon, ${(ikon * FL.IKON) / 1024} KB`, k: 'sum' });
    return { lines: out, iz, stats: { N, ikon, oom: false, sayac, havuz }, liste };
  };
  FL.outputOf = (prog) => FL.run(prog).lines.map((l) => l.t);

  /** Yaklaşık bellek (sahnedeki gösterge için): ikon verisi + nokta nesneleri, KB */
  FL.bellek = function (mode, n, ikon) {
    const nokta = { kopya: 0.15, kestirme: 0.005, flyweight: 0.085 }[mode] * n;
    return { ikonKB: ikon * FL.IKON_KB, noktaKB: nokta, toplamKB: ikon * FL.IKON_KB + nokta };
  };

  // ------------------------------------------------------------------ sürümler (Sorun sahnesi)
  FL.NV = {
    v1: { mode: 'kopya', items: FL.UC, adet: 0 },
    v2: { mode: 'kopya', items: FL.UC, adet: 9997 },
    v3: { mode: 'kestirme', items: FL.UC, adet: 9997 },
  };
  FL.naiveFiles = (v) => FL.filesFor(FL.NV[v].mode, FL.NV[v]);

  // ------------------------------------------------------------------ adım adım yeniden düzenleme
  const P2 = FL.NV.v2;
  const R0 = FL.filesFor('kopya', P2);
  const COZUM = { mode: 'flyweight', items: FL.UC, adet: 9997 };
  FL.COZUM = COZUM;
  code.Main = mainSrc(COZUM);
  FL.refactor = [
    Object.assign({}, R0), // 0: her nokta kendi ikonu
    Object.assign({}, R0, { Isaret: plain(code.Isaret) }), // 1: ortak arayüz
    Object.assign({}, R0, { Isaret: plain(code.Isaret), IsaretTuru: plain(code.IsaretTuru) }), // 2: içsel durum ayrı sınıfta
    Object.assign({}, R0, { Isaret: plain(code.Isaret), IsaretTuru: plain(code.IsaretTuru), IsaretFabrikasi: plain(code.IsaretFabrikasi) }), // 3: fabrika
    Object.assign({}, R0, { Isaret: plain(code.Isaret), IsaretTuru: plain(code.IsaretTuru), IsaretFabrikasi: plain(code.IsaretFabrikasi), HaritaNoktasi: plain(code.HaritaNoktasi), Harita: plain(code.Harita) }), // 4: nokta yalnızca dışsal durumu tutar
  ];
  FL.refactorOrder = ['Main', 'Harita', 'HaritaNoktasi', 'Isaret', 'IsaretTuru', 'IsaretFabrikasi', 'Ikon', 'Gonderiler'];
  FL.refactorProgs = [P2, P2, P2, P2, COZUM].map((p) => Object.assign({ heap: FL.TABLET }, p));
  FL.refactorOutputs = FL.refactorProgs.map((p) => FL.run(p).lines);
  FL.output = FL.outputOf(Object.assign({ heap: FL.TABLET }, COZUM));

  // ================================================================== Canlı Akış
  FL.presets = {
    uc: { key: 'uc', title: 'Üç gönderi', prog: { mode: 'flyweight', items: FL.UC, adet: 0, heap: FL.TABLET } },
    depo: { key: 'depo', title: 'Depolu harita', locked: true, prog: { mode: 'flyweight', items: [FL.UC[0], FL.DEPO, FL.UC[2]], adet: 0, heap: FL.TABLET } },
  };
  FL.presetOrder = ['uc', 'depo'];
  FL.akisFiles = (p) => FL.fileList(FL.filesFor('flyweight', p.prog), ['Main', 'Harita', 'IsaretFabrikasi', 'IsaretTuru', 'DepoIsareti', 'HaritaNoktasi', 'Isaret', 'Ikon']);
  FL.akisOutput = (p) => FL.outputOf(p.prog);

  // ================================================================== Harita tezgâhı
  FL.MODES = {
    kopya: { key: 'kopya', title: 'Paylaşım yok', sub: 'her nokta kendi ikonu' },
    kestirme: { key: 'kestirme', title: 'Kestirme', sub: 'bütün nokta paylaşılır' },
    flyweight: { key: 'flyweight', title: 'Flyweight', sub: 'içsel paylaşılır, dışsal noktada' },
  };
  FL.modeOrder = ['kopya', 'kestirme', 'flyweight'];
  FL.NLER = [3, 100, 1000, 10000, 100000];
  /** cfg: {mode, n} → program (tablet) */
  FL.tezgahProg = (cfg) => ({ mode: cfg.mode, items: FL.UC, adet: cfg.n - FL.UC.length, heap: FL.TABLET });
  FL.tezgahFiles = (cfg) => FL.filesFor(cfg.mode, FL.tezgahProg(cfg));

  // ================================================================== Genişlet: paylaşılmayan işaret (depo)
  const EX = (FL.ext = {});
  EX.exercise = `public class DepoIsareti implements ⟦1⟧ {

${cm('    private final int doluluk;', 'yüzde: deponun KENDİ durumu', 48)}
    private final Ikon foto;

    public DepoIsareti(String sehir, int doluluk) {
        this.doluluk = doluluk;
${cm('        this.foto = new ⟦2⟧("depo-" + sehir + ".png");', 'kendi fotoğrafı', 58)}
    }

    @Override
    public void ⟦3⟧(int x, int y, String etiket) {
        System.out.println("[depo] " + etiket + " → (" + x + ", " + y + ") · " + foto + " · doluluk %" + doluluk);
    }
}`;
  EX.exerciseMain = `// Main.java içine (KRG-1001'den sonra):
harita.ekle("${FL.DEPO.etiket}", ${FL.DEPO.x}, ${FL.DEPO.y}, new ⟦4⟧("${FL.DEPO.depo.sehir}", ${FL.DEPO.depo.doluluk}));`;
  EX.answers = { 1: 'Isaret', 2: 'Ikon', 3: 'ciz', 4: 'DepoIsareti' };
  EX.prog = FL.presets.depo.prog;
  EX.Main = mainSrc(EX.prog);
  EX.output = FL.outputOf(EX.prog);

  // ================================================================== Gerçek dünya (JDK) örnekleri
  const RW = (FL.rw = {});
  RW.tamsayi = (arg) => `public class TamsayiOnbellegi {

    public static void main(String[] args) {
${cm('        ' + arg, 'kutulama: Integer.valueOf(…)', 62)}
${cm('        System.out.println("a == b      : " + (a == b));', 'aynı NESNE mi?', 62)}
${cm('        System.out.println("a.equals(b) : " + a.equals(b));', 'aynı DEĞER mi?', 62)}
    }
}`;
  RW.tamsayiOpts = [
    { label: '127', arg: 'Integer a = 127, b = 127;', out: ['a == b      : true', 'a.equals(b) : true'] },
    { label: '128', arg: 'Integer a = 128, b = 128;', out: ['a == b      : false', 'a.equals(b) : true'] },
    { label: '−128', arg: 'Integer a = -128, b = -128;', out: ['a == b      : true', 'a.equals(b) : true'] },
    { label: '1000', arg: 'Integer a = 1000, b = 1000;', out: ['a == b      : false', 'a.equals(b) : true'] },
  ];

  RW.metin = (arg) => `public class MetinHavuzu {

    public static void main(String[] args) {
${cm('        String a = "KRG-1001";', 'literal: havuzdan gelir', 50)}
        String no = "1001";
        ${arg}
        System.out.println("a == b      : " + (a == b));
        System.out.println("a.equals(b) : " + a.equals(b));
    }
}`;
  RW.metinOpts = [
    { label: 'Literal', arg: 'String b = "KRG-1001";', out: ['a == b      : true', 'a.equals(b) : true'] },
    { label: 'Birleştirme', arg: 'String b = "KRG-" + no;', out: ['a == b      : false', 'a.equals(b) : true'] },
    { label: 'intern()', arg: 'String b = ("KRG-" + no).intern();', out: ['a == b      : true', 'a.equals(b) : true'] },
  ];

  RW.tablo = () => `import java.awt.Component;
import javax.swing.JLabel;
import javax.swing.JTable;
import javax.swing.table.TableCellRenderer;

public class TabloCizici {

    public static void main(String[] args) {
        Object[][] satirlar = { { "KRG-1001", "Malatya" }, { "KRG-1002", "Ankara" }, { "KRG-1003", "İzmir" } };
        JTable tablo = new JTable(satirlar, new Object[] { "Takip no", "Şehir" });

        // Bütün hücreler için TEK çizici bileşen; hücreye özgü durum çağrıyla gelir
        TableCellRenderer cizici = tablo.getDefaultRenderer(Object.class);
        Component ilk = null;
        for (int satir = 0; satir < tablo.getRowCount(); satir++) {
            for (int sutun = 0; sutun < tablo.getColumnCount(); sutun++) {
                Object deger = tablo.getValueAt(satir, sutun);
                Component c = cizici.getTableCellRendererComponent(tablo, deger, false, false, satir, sutun);
                if (ilk == null) {
                    ilk = c;
                }
                System.out.println(((JLabel) c).getText() + " · aynı bileşen mi? " + (c == ilk));
            }
        }
    }
}`;
  RW.tabloOut = ['KRG-1001 · aynı bileşen mi? true', 'Malatya · aynı bileşen mi? true', 'KRG-1002 · aynı bileşen mi? true', 'Ankara · aynı bileşen mi? true', 'KRG-1003 · aynı bileşen mi? true', 'İzmir · aynı bileşen mi? true'];

  // ================================================================== UML sınıf diyagramları
  const M = {
    noktalar: { id: 'noktalar', text: '- noktalar: List<HaritaNoktasi>', generic: '- contexts' },
    fabrika: { id: 'fabrika', text: '- fabrika: IsaretFabrikasi', generic: '- factory: FlyweightFactory' },
    ekle: { id: 'ekle', text: '+ ekle(etiket, x, y, tur)', generic: '+ add(extrinsicState, key)' },
    hciz: { id: 'ciz', text: '+ ciz()', generic: '+ draw()' },
    isaret: { id: 'isaret', text: '- isaret: Isaret', generic: '- flyweight: Flyweight', color: 4 },
    etiket: { id: 'etiket', text: '- etiket: String', generic: '- extrinsicState' },
    xy: { id: 'xy', text: '- x, y: int', generic: '- …' },
    nciz: { id: 'ciz', text: '+ ciz()', generic: '+ draw()' },
    havuz: { id: 'havuz', text: '- havuz: Map<String, IsaretTuru>', generic: '- flyweights: Map' },
    al: { id: 'al', text: '+ al(tur): Isaret', generic: '+ getFlyweight(key)', factory: true },
    op: { id: 'ciz', text: '+ ciz(x, y, etiket)', generic: '+ operation(extrinsicState)', abstract: true },
    ad: { id: 'ad', text: '- ad: String', generic: '- intrinsicState' },
    ikon: { id: 'ikon', text: '- ikon: Ikon', generic: '- …' },
    tciz: { id: 'ciz', text: '+ ciz(x, y, etiket)', generic: '+ operation(extrinsicState)' },
    doluluk: { id: 'doluluk', text: '- doluluk: int', generic: '- allState' },
    foto: { id: 'foto', text: '- foto: Ikon', generic: '- …' },
    dciz: { id: 'ciz', text: '+ ciz(x, y, etiket)', generic: '+ operation(extrinsicState)' },
  };
  FL.members = M;

  const haritaBox = (x, y, st) => ({ id: 'Harita', name: 'Harita', generic: 'Client', kind: 'class', role: 'client', x, y, w: 320, members: st === 'naive' ? [M.noktalar, M.ekle, M.hciz] : [M.noktalar, M.fabrika, M.ekle, M.hciz] });
  const noktaBox = (x, y) => ({ id: 'HaritaNoktasi', name: 'HaritaNoktasi', generic: 'Context', kind: 'class', role: 'client', x, y, w: 300, members: [M.isaret, M.etiket, M.xy, M.nciz] });
  const fabrikaBox = (x, y) => ({ id: 'IsaretFabrikasi', name: 'IsaretFabrikasi', generic: 'FlyweightFactory', kind: 'class', role: 'factory', x, y, w: 350, members: [M.havuz, M.al] });
  const isaretBox = (x, y) => ({ id: 'Isaret', name: 'Isaret', generic: 'Flyweight', kind: 'interface', role: 'flyweight', x, y, w: 290, members: [M.op] });
  const turBox = (x, y) => ({ id: 'IsaretTuru', name: 'IsaretTuru', generic: 'ConcreteFlyweight', kind: 'class', role: 'concreteFlyweight', x, y, w: 290, members: [M.ad, M.ikon, M.tciz] });
  const depoBox = (x, y) => ({ id: 'DepoIsareti', name: 'DepoIsareti', generic: 'UnsharedConcreteFlyweight', kind: 'class', role: 'unshared', x, y, w: 300, members: [M.doluluk, M.foto, M.dciz] });

  /** GoF yapısı (Yapı sahnesi, Canlı Akış, özet). o.notes: fabrikanın al() notu */
  FL.gofDiagram = function (o) {
    o = o || {};
    const classes = [haritaBox(20, 34), noktaBox(30, 262), fabrikaBox(600, 34), isaretBox(410, 250), depoBox(250, 440), turBox(640, 440)];
    const relations = [
      { id: 'fabrika', from: 'Harita', to: 'IsaretFabrikasi', type: 'association', label: 'fabrika', genericLabel: 'factory', fromSide: 'right', fromAt: 76, toSide: 'left', toAt: 76 },
      { id: 'noktalar', from: 'Harita', to: 'HaritaNoktasi', type: 'aggregation', label: 'noktalar *', genericLabel: 'contexts *', fromSide: 'bottom', fromAt: 180, toSide: 'top', toAt: 180 },
      { id: 'isaret', from: 'HaritaNoktasi', to: 'Isaret', type: 'association', label: 'isaret', genericLabel: 'flyweight', fromSide: 'right', fromAt: 300, toSide: 'left', toAt: 300 },
      { id: 'havuz', from: 'IsaretFabrikasi', to: 'IsaretTuru', type: 'aggregation', label: 'havuz *', genericLabel: 'flyweights *', fromSide: 'bottom', fromAt: 850, toSide: 'top', toAt: 850, labelAt: [860, 300] },
      { id: 'r-tur', from: 'IsaretTuru', to: 'Isaret', type: 'realization', fromSide: 'top', fromAt: 720, toSide: 'bottom', toAt: 555, mid: 400 },
      { id: 'r-depo', from: 'DepoIsareti', to: 'Isaret', type: 'realization', fromSide: 'top', fromAt: 400, toSide: 'bottom', toAt: 555, mid: 400 },
    ];
    const notes = o.notes
      ? [{ id: 'n-al', x: 1010, y: 150, text: 'IsaretTuru i = havuz.get(tur);\nif (i == null) {\n    i = new IsaretTuru(tur);\n    havuz.put(tur, i);\n}\nreturn i;   // hep AYNI nesne', genericText: 'if (flyweights[key] exists)\n    return existing;\nelse\n    create, add to pool,\n    return new one;', target: 'IsaretFabrikasi', from: 'left', to: 'right', toAt: 110 }]
      : [];
    return { width: o.notes ? 1300 : 1000, height: 580, title: 'Flyweight sınıf diyagramı', classes, relations, notes };
  };

  /**
   * "Çözüm" sahnesinin her adımındaki diyagram.
   * 0: her nokta kendi ikonu · 1: arayüz · 2: içsel durum (IsaretTuru) · 3: fabrika · 4: nokta yalnızca dışsal durumu tutar
   */
  FL.solutionDiagram = function (st) {
    const classes = [];
    const relations = [];
    classes.push(haritaBox(20, 20, st >= 4 ? 'fw' : 'naive'));
    const naiveNokta = { id: 'HaritaNoktasi', name: 'HaritaNoktasi', kind: 'class', role: 'client', x: 20, y: 214, w: 320, members: [{ id: 'tur', text: '- tur: String' }, { id: 'ikon', text: '- ikon: Ikon', color: 5 }, M.etiket, M.xy, M.nciz] };
    classes.push(st >= 4 ? Object.assign(noktaBox(20, 214), { w: 320 }) : naiveNokta);
    classes.push({ id: 'Ikon', name: 'Ikon', kind: 'class', x: 20, y: 440, w: 320, members: [{ id: 'dosya', text: '- dosya: String' }, { id: 'pikseller', text: '- pikseller: byte[16384]' }] });
    relations.push({ id: 'noktalar', from: 'Harita', to: 'HaritaNoktasi', type: 'aggregation', label: 'noktalar *', fromSide: 'bottom', fromAt: 180, toSide: 'top', toAt: 180 });
    if (st <= 3) relations.push({ id: 'n-ikon', from: 'HaritaNoktasi', to: 'Ikon', type: 'association', label: 'ikon (her noktaya bir)', fromSide: 'bottom', fromAt: 180, toSide: 'top', toAt: 180 });
    if (st >= 1) classes.push(isaretBox(440, 214));
    if (st >= 2) {
      classes.push(turBox(780, 420));
      relations.push({ id: 'r-tur', from: 'IsaretTuru', to: 'Isaret', type: 'realization', fromSide: 'top', fromAt: 860, toSide: 'bottom', toAt: 585, mid: 370 });
      relations.push({ id: 't-ikon', from: 'IsaretTuru', to: 'Ikon', type: 'association', label: 'ikon', fromSide: 'left', fromAt: 490, toSide: 'right', toAt: 490 });
    }
    if (st >= 3) {
      classes.push(fabrikaBox(720, 20));
      relations.push({ id: 'havuz', from: 'IsaretFabrikasi', to: 'IsaretTuru', type: 'aggregation', label: 'havuz *', fromSide: 'bottom', fromAt: 1010, toSide: 'top', toAt: 1010 });
    }
    if (st >= 4) {
      relations.push({ id: 'isaret', from: 'HaritaNoktasi', to: 'Isaret', type: 'association', label: 'isaret', fromSide: 'right', fromAt: 252, toSide: 'left', toAt: 252 });
      relations.push({ id: 'fabrika', from: 'Harita', to: 'IsaretFabrikasi', type: 'association', label: 'fabrika', fromSide: 'right', fromAt: 64, toSide: 'left', toAt: 64 });
    }
    return { width: 1100, height: 560, view: [0, 0, 1100, 560], classes, relations };
  };

  // ------------------------------------------------------------------ UML sıralama diyagramı (Canlı Akış)
  /** Akış adımlarıyla aynı sırada mesajlar. Dönüş: {spec, msgOf: {'ekle:i' | 'al:i' | 'get:i' | 'create:i' | 'put:i' | 'ret:i' | 'add:i' | 'ciz' | 'op:i'}} */
  FL.seqSpec = function (p) {
    const r = FL.run(p.prog);
    const hasDepo = p.prog.items.some((it) => it.depo);
    const turler = [];
    p.prog.items.forEach((it) => it.tur && !turler.includes(it.tur) && turler.push(it.tur));
    const parts = [
      { id: 'main', label: 'Main', role: 'client' },
      { id: 'harita', label: 'harita\n: Harita', role: 'client', object: true },
      { id: 'fabrika', label: 'fabrika\n: IsaretFabrikasi', role: 'factory', object: true },
    ];
    turler.forEach((t) => parts.push({ id: t, label: `${t}\n: IsaretTuru`, role: 'concreteFlyweight', object: true }));
    if (hasDepo) parts.push({ id: 'depo', label: 'depo\n: DepoIsareti', role: 'unshared', object: true });
    const messages = [];
    const msgOf = {};
    const add = (key, m) => {
      msgOf[key] = messages.length;
      messages.push(m);
    };
    r.iz.forEach((z, i) => {
      const it = z.it;
      if (it.depo) {
        add('create:' + i, { from: 'main', to: 'depo', kind: 'create', label: `«create» ("${it.depo.sehir}", ${it.depo.doluluk})` });
        add('ekle:' + i, { from: 'main', to: 'harita', kind: 'call', label: `ekle("${it.etiket}", …, depo)` });
        add('add:' + i, { from: 'harita', to: 'harita', kind: 'self', short: true, label: 'noktalar.add(…)' });
        add('done:' + i, { from: 'harita', to: 'main', kind: 'return', label: '' });
        return;
      }
      add('ekle:' + i, { from: 'main', to: 'harita', kind: 'call', label: `ekle("${it.etiket}", …, "${it.tur}")` });
      add('al:' + i, { from: 'harita', to: 'fabrika', kind: 'call', label: `al("${it.tur}")` });
      if (z.olay === 'yeni') {
        add('get:' + i, { from: 'fabrika', to: 'fabrika', kind: 'self', short: true, label: 'havuz.get() → null' });
        add('create:' + i, { from: 'fabrika', to: it.tur, kind: 'create', label: '«create»' });
        add('put:' + i, { from: 'fabrika', to: 'fabrika', kind: 'self', short: true, label: 'havuz.put()' });
      } else add('get:' + i, { from: 'fabrika', to: 'fabrika', kind: 'self', short: true, label: `havuz.get() → ${it.tur} ✓` });
      add('ret:' + i, { from: 'fabrika', to: 'harita', kind: 'return', label: `${it.tur}${z.olay === 'var' ? ' (aynı nesne)' : ''}` });
      add('add:' + i, { from: 'harita', to: 'harita', kind: 'self', short: true, label: 'noktalar.add(…)' });
      add('done:' + i, { from: 'harita', to: 'main', kind: 'return', label: '' });
    });
    add('ciz', { from: 'main', to: 'harita', kind: 'call', label: 'ciz()' });
    r.liste.forEach((e, i) => {
      add('op:' + i, { from: 'harita', to: e.depo ? 'depo' : e.tur, kind: 'call', label: `ciz(${e.x}, ${e.y}, "${e.etiket}")` });
      add('opRet:' + i, { from: e.depo ? 'depo' : e.tur, to: 'harita', kind: 'return', label: '' });
    });
    add('done', { from: 'harita', to: 'main', kind: 'return', label: '' });
    const rowH = 34;
    const h = 110 + messages.reduce((s, m) => s + (m.kind === 'self' ? rowH + 16 : rowH), 0) + 30;
    return { spec: { width: 1080, height: h, top: 100, margin: 110, rowH, participants: parts, messages, initialActive: ['main'] }, msgOf, run: r };
  };
})();
