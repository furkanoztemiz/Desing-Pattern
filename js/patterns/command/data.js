/*
 * Command — veri: Java kodları, çalıştırma benzetimi, roller, diyagram tanımları.
 * Bu dosya DOM kullanmaz; tools/export-java.js de Java dosyalarını buradan üretir.
 *
 * Senaryo (lojistik dünyasının devamı): Malatya şubesinin deposu. Operatör panelden kolileri raftan rafa taşır,
 * kamyona yükler. Kalıpsız çözümde panel isteği bir dizgiyle ("TASI", "YUKLE") alır ve switch ile kendisi yapar.
 * "Geri al" istenince panel yalnızca SON işlemi üç alanda hatırlar: iki hata yapan operatörün ikinci "geri al"ı boşa
 * gider (Ali'nin kolisi yanlış rafta kalır). Gece işi de işlemleri metin olarak biriktirir ve switch'i kopyalar; gece
 * vardiyası "YÜKLE" yazınca 02:00'de program çöker, kamyon Selin'in kolisi olmadan yola çıkar.
 * Command: her istek bir nesne (TasiKomutu, YukleKomutu); ne yapacağını ve nasıl geri alınacağını kendisi bilir.
 * Panel komutları bir yığında tutar (sınırsız geri al / yinele), gece işi komut kuyruğu tutar.
 */
(function () {
  'use strict';
  const DP = (window.DP = window.DP || {});
  const CM = (DP.cmd = DP.cmd || {});

  // ------------------------------------------------------------------ roller
  CM.roles = {
    client: { en: 'Client', tr: 'İstemci', color: 1 },
    command: { en: 'Command', tr: 'Komut (arayüz)', color: 2 },
    concreteCommand: { en: 'ConcreteCommand', tr: 'Somut komut', color: 4 },
    invoker: { en: 'Invoker', tr: 'Çağıran', color: 3 },
    receiver: { en: 'Receiver', tr: 'Alıcı (işi yapan)', color: 5 },
  };

  CM.classRoles = {
    Main: 'client',
    Komut: 'command',
    TasiKomutu: 'concreteCommand',
    YukleKomutu: 'concreteCommand',
    MakroKomut: 'concreteCommand',
    OperatorPaneli: 'invoker',
    GeceIsi: 'invoker',
    Depo: 'receiver',
    Kamyon: 'receiver',
    // GoF genel adları
    Client: 'client',
    Command: 'command',
    ConcreteCommand: 'concreteCommand',
    Invoker: 'invoker',
    Receiver: 'receiver',
  };

  CM.roleOf = function (name) {
    const r = CM.classRoles[name];
    return r ? CM.roles[r].color : null;
  };

  // `calistir` ve `geriAl`: komutun iki işlemi (kodda ayrıca vurgulanır)
  CM.special = { calistir: 'kmt', geriAl: 'kmt' };

  /** 1 tabanlı satır numarası. */
  CM.lineOf = function (src, needle, from) {
    const lines = src.split('\n');
    for (let i = from || 0; i < lines.length; i++) if (lines[i].includes(needle)) return i + 1;
    return 0;
  };

  /** Satırın sonuna, belirli bir sütundan başlayan yorum ekler (satır uzunsa en az iki boşluk). */
  const cm = (line, comment, col) => line.padEnd(Math.max(col || 60, line.length + 2)) + '// ' + comment;
  const doc = (text) => `/**\n * ${text}\n */\n`;
  const plain = (src) => src.replace(/^((?:import [^\n]+\n)*\n?)\/\*\*[\s\S]*?\*\/\n/, '$1');
  CM.plain = plain;

  const code = (CM.code = {});

  // ================================================================== dünya: depo, koliler, kamyon
  CM.KOLI = {
    'KRG-1001': { ad: 'Ali', tam: 'Ali Şahin', sehir: 'Malatya' },
    'KRG-1002': { ad: 'Ayşe', tam: 'Ayşe Yılmaz', sehir: 'Ankara' },
    'KRG-1003': { ad: 'Zeynep', tam: 'Zeynep Güneş', sehir: 'İzmir', soguk: true },
    'KRG-1004': { ad: 'Can', tam: 'Can Demir', sehir: 'İstanbul' },
    'KRG-1005': { ad: 'Selin', tam: 'Selin Aydın', sehir: 'Malatya' },
    'KRG-1006': { ad: 'Mert', tam: 'Mert Kaya', sehir: 'Malatya' },
  };
  CM.KOLILER = Object.keys(CM.KOLI);
  /** Sabahki raf düzeni (Depo.sabah() ile birebir) */
  CM.SABAH = { 'KRG-1001': 'A1', 'KRG-1002': 'A2', 'KRG-1003': 'A3', 'KRG-1004': 'B1', 'KRG-1005': 'B2', 'KRG-1006': 'C1' };
  CM.RAFLAR = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4'];
  CM.kisa = (koli) => koli.slice(4);

  // ------------------------------------------------------------------ istekler (oturum adımları)
  const T = (koli, raf) => ({ t: 'tasi', koli, raf });
  const Y = (koli, yazim) => (yazim ? { t: 'yukle', koli, yazim } : { t: 'yukle', koli });
  const G = { t: 'geri' };
  const I = { t: 'yinele' };
  const M = (ad, koliler) => ({ t: 'makro', ad, koliler });
  CM.op = { T, Y, G, I, M };
  /** Gündüz: operatörün iki hatası ve iki "geri al" */
  CM.GUN = [T('KRG-1001', 'B3'), Y('KRG-1003'), G, G];
  /** Gece planı (Malatya kamyonu); kalıpsız sürümde son satır "YÜKLE" diye yazıldı */
  CM.GECE = [Y('KRG-1001'), T('KRG-1004', 'C2'), Y('KRG-1005')];
  CM.GECE_YAZIM = [Y('KRG-1001'), T('KRG-1004', 'C2'), Y('KRG-1005', 'YÜKLE')];
  /** Genişlet: tek komut gibi çalışan makro */
  CM.MAKRO = M('Malatya kamyonu', ['KRG-1001', 'KRG-1005', 'KRG-1006']);

  // ================================================================== ortak Java kaynakları (alıcılar)
  code.Depo = `import java.util.Map;
import java.util.TreeMap;

${doc('Depodaki raflar: hangi koli hangi rafta? Taşımayı, rafa koymayı ve raftan almayı bilen nesne.')}public class Depo {

    private final Map<String, String> raflar = new TreeMap<>();

    /** Sabahki raf düzeni */
    public static Depo sabah() {
        Depo d = new Depo();
${Object.keys(CM.SABAH)
  .map((k) => `        d.raflar.put("${k}", "${CM.SABAH[k]}");`)
  .join('\n')}
        return d;
    }

    public String yeri(String koli) {
        return raflar.get(koli);
    }

    public void tasi(String koli, String raf) {
        String eski = raflar.put(koli, raf);
        System.out.println("  depo: " + koli + " " + eski + " → " + raf);
    }

    public String cikar(String koli) {
        String raf = raflar.remove(koli);
        System.out.println("  depo: " + koli + " " + raf + " rafından alındı");
        return raf;
    }

    public void koy(String koli, String raf) {
        raflar.put(koli, raf);
        System.out.println("  depo: " + koli + " → " + raf);
    }

    public String durum() {
        StringBuilder sb = new StringBuilder("Raflar:");
        raflar.forEach((koli, raf) -> sb.append(' ').append(koli.substring(4)).append(':').append(raf));
        return sb.toString();
    }
}`;

  code.Kamyon = `import java.util.ArrayList;
import java.util.List;

${doc('Malatya kamyonu: yüklenen koliler, yükleme sırasıyla.')}public class Kamyon {

    private final List<String> yuk = new ArrayList<>();

    public void yukle(String koli) {
        yuk.add(koli);
        System.out.println("  kamyon: " + koli + " yüklendi");
    }

    public void indir(String koli) {
        yuk.remove(koli);
        System.out.println("  kamyon: " + koli + " indirildi");
    }

    public String durum() {
        if (yuk.isEmpty()) {
            return "Kamyon: boş";
        }
        StringBuilder sb = new StringBuilder("Kamyon:");
        for (String koli : yuk) {
            sb.append(' ').append(koli.substring(4));
        }
        return sb.toString();
    }
}`;

  // ================================================================== "Sorun": dizgi + switch, tek kayıtlık geri al
  function panelNaiveSrc(geri) {
    const alanlar = geri
      ? `
${cm('    private String sonIslem;', 'geri al için: yalnızca SON işlem')}
    private String sonKoli;
    private String sonRaf;`
      : '';
    const tasi = geri
      ? `            case "TASI" -> {
                sonRaf = depo.yeri(koli);
                depo.tasi(koli, raf);
            }`
      : '            case "TASI" -> depo.tasi(koli, raf);';
    const yukle = geri
      ? `            case "YUKLE" -> {
                sonRaf = depo.cikar(koli);
                kamyon.yukle(koli);
            }`
      : `            case "YUKLE" -> {
                depo.cikar(koli);
                kamyon.yukle(koli);
            }`;
    const kayit = geri
      ? `
        sonIslem = islem;
        sonKoli = koli;`
      : '';
    const geriAl = geri
      ? `

    public void geriAl() {
        if (sonIslem == null) {
            System.out.println("[Panel] geri alınacak işlem yok");
            return;
        }
        System.out.println("[Panel] geri al: " + sonIslem + " " + sonKoli);
        switch (sonIslem) {
            case "TASI" -> depo.tasi(sonKoli, sonRaf);
            case "YUKLE" -> {
                kamyon.indir(sonKoli);
                depo.koy(sonKoli, sonRaf);
            }
            default -> throw new IllegalStateException(sonIslem);
        }
        sonIslem = null;
    }`
      : '';
    return `${doc(geri ? 'Operatör paneli: isteği switch ile kendisi yapar; geri almak için yalnızca son işlemi hatırlar.' : 'Operatör paneli: her düğme isteği bir dizgiyle bildirir; panel ne yapılacağını switch ile kendisi çözer.')}public class OperatorPaneli {

    private final Depo depo;
    private final Kamyon kamyon;${alanlar}

    public OperatorPaneli(Depo depo, Kamyon kamyon) {
        this.depo = depo;
        this.kamyon = kamyon;
    }

    public void tikla(String islem, String koli, String raf) {
        System.out.println("[Panel] " + islem + " " + koli + (raf == null ? "" : " → " + raf));
        switch (islem) {
${tasi}
${yukle}
            default -> throw new IllegalArgumentException("bilinmeyen işlem: " + islem);
        }${kayit}
    }${geriAl}
}`;
  }
  code.OperatorPaneliV1 = panelNaiveSrc(false);
  code.OperatorPaneliV2 = panelNaiveSrc(true);

  code.GeceIsiNaive = `import java.util.ArrayList;
import java.util.List;

${doc('Gece işi: işlemleri metin olarak biriktirir, gece 02:00’de sırayla yapar.')}public class GeceIsi {

    private final Depo depo;
    private final Kamyon kamyon;
    private final List<String> plan = new ArrayList<>();

    public GeceIsi(Depo depo, Kamyon kamyon) {
        this.depo = depo;
        this.kamyon = kamyon;
    }

    public void ekle(String satir) {
        plan.add(satir);
    }

    public void calistir() {
        System.out.println("[Gece] 02:00, " + plan.size() + " iş");
        for (String satir : plan) {
            System.out.println("[Gece] " + satir);
            String[] p = satir.split(" ");
${cm('            switch (p[0]) {', 'paneldeki switch’in kopyası')}
                case "TASI" -> depo.tasi(p[1], p[2]);
                case "YUKLE" -> {
                    depo.cikar(p[1]);
                    kamyon.yukle(p[1]);
                }
                default -> throw new IllegalArgumentException("bilinmeyen işlem: " + p[0]);
            }
        }
    }
}`;

  // ================================================================== "Çözüm": komut nesneleri
  code.Komut = `${doc('«Command» — Bir isteği nesne olarak paketler: çalıştırılabilir, geri alınabilir, sıraya konabilir.')}public interface Komut {

    void calistir();

    void geriAl();

    String ad();
}`;

  code.TasiKomutu = `${doc('«ConcreteCommand» — Koliyi başka bir rafa taşır; geri almak için nereden geldiğini kendisi hatırlar.')}public class TasiKomutu implements Komut {

    private final Depo depo;
    private final String koli;
    private final String hedef;
${cm('    private String onceki;', 'geri al için: bu komutun kendi kaydı')}

    public TasiKomutu(Depo depo, String koli, String hedef) {
        this.depo = depo;
        this.koli = koli;
        this.hedef = hedef;
    }

    @Override
    public void calistir() {
        onceki = depo.yeri(koli);
        depo.tasi(koli, hedef);
    }

    @Override
    public void geriAl() {
        depo.tasi(koli, onceki);
    }

    @Override
    public String ad() {
        return "TAŞI " + koli + " → " + hedef;
    }
}`;

  code.YukleKomutu = `${doc('«ConcreteCommand» — Koliyi raftan alıp kamyona yükler; geri alınca aynı rafa koyar.')}public class YukleKomutu implements Komut {

    private final Depo depo;
    private final Kamyon kamyon;
    private final String koli;
${cm('    private String raf;', 'geri al için: koli hangi raftan alındı')}

    public YukleKomutu(Depo depo, Kamyon kamyon, String koli) {
        this.depo = depo;
        this.kamyon = kamyon;
        this.koli = koli;
    }

    @Override
    public void calistir() {
        raf = depo.cikar(koli);
        kamyon.yukle(koli);
    }

    @Override
    public void geriAl() {
        kamyon.indir(koli);
        depo.koy(koli, raf);
    }

    @Override
    public String ad() {
        return "YÜKLE " + koli;
    }
}`;

  code.MakroKomut = `import java.util.List;

${doc('«ConcreteCommand» — Birçok komutu tek komut gibi çalıştırır; tek "geri al" hepsini ters sırayla geri alır.')}public class MakroKomut implements Komut {

    private final String ad;
    private final List<Komut> komutlar;

    public MakroKomut(String ad, List<Komut> komutlar) {
        this.ad = ad;
        this.komutlar = komutlar;
    }

    @Override
    public void calistir() {
        for (Komut k : komutlar) {
            k.calistir();
        }
    }

    @Override
    public void geriAl() {
${cm('        for (int i = komutlar.size() - 1; i >= 0; i--) {', 'ters sırayla')}
            komutlar.get(i).geriAl();
        }
    }

    @Override
    public String ad() {
        return "MAKRO " + ad + " (" + komutlar.size() + " komut)";
    }
}`;

  code.OperatorPaneli = `import java.util.ArrayDeque;
import java.util.Deque;

${doc('«Invoker» — Komutu çalıştırır ve geçmişe koyar. Komutun ne yaptığını, depoyu ya da kamyonu bilmez.')}public class OperatorPaneli {

${cm('    private final Deque<Komut> gecmis = new ArrayDeque<>();', 'geri al yığını')}
${cm('    private final Deque<Komut> ileri = new ArrayDeque<>();', 'yinele yığını')}

    public void yap(Komut k) {
        System.out.println("[Panel] " + k.ad());
        k.calistir();
        gecmis.push(k);
        ileri.clear();
    }

    public void geriAl() {
        if (gecmis.isEmpty()) {
            System.out.println("[Panel] geri alınacak işlem yok");
            return;
        }
        Komut k = gecmis.pop();
        System.out.println("[Panel] geri al: " + k.ad());
        k.geriAl();
        ileri.push(k);
    }

    public void yinele() {
        if (ileri.isEmpty()) {
            System.out.println("[Panel] yinelenecek işlem yok");
            return;
        }
        Komut k = ileri.pop();
        System.out.println("[Panel] yinele: " + k.ad());
        k.calistir();
        gecmis.push(k);
    }
}`;

  code.GeceIsi = `import java.util.ArrayList;
import java.util.List;

${doc('«Invoker» — Komutları sıraya koyar, gece 02:00’de sırayla çalıştırır.')}public class GeceIsi {

    private final List<Komut> kuyruk = new ArrayList<>();

    public void ekle(Komut k) {
        kuyruk.add(k);
    }

    public void calistir() {
        System.out.println("[Gece] 02:00, " + kuyruk.size() + " iş");
        for (Komut k : kuyruk) {
            System.out.println("[Gece] " + k.ad());
            k.calistir();
        }
        kuyruk.clear();
    }
}`;

  // ================================================================== programlar (Main üreticisi)
  /**
   * Program: {design: 'naive'|'komut' (gündüz paneli), geceDesign (varsayılan design), v: 'v1'|'v2' (kalıpsız panel),
   *           gun: [istek], gece: [istek] | null}
   */
  const naiveAd = (op) => op.yazim || (op.t === 'tasi' ? 'TASI' : 'YUKLE');
  CM.planSatiri = (op) => `${naiveAd(op)} ${op.koli}${op.t === 'tasi' ? ' ' + op.raf : ''}`;
  const yeni = (op) => (op.t === 'tasi' ? `new TasiKomutu(depo, "${op.koli}", "${op.raf}")` : `new YukleKomutu(depo, kamyon, "${op.koli}")`);
  CM.yeniKomut = yeni;

  function gunSatirlari(op, naive) {
    if (op.t === 'geri') return ['        panel.geriAl();'];
    if (op.t === 'yinele') return ['        panel.yinele();'];
    if (op.t === 'makro') {
      const L = [`        panel.yap(new MakroKomut("${op.ad}", List.of(`];
      op.koliler.forEach((k, i) => L.push(`                ${yeni(Y(k))}${i < op.koliler.length - 1 ? ',' : ')));'}`));
      return L;
    }
    if (naive) return [op.t === 'tasi' ? `        panel.tikla("TASI", "${op.koli}", "${op.raf}");` : `        panel.tikla("YUKLE", "${op.koli}", null);`];
    return [`        panel.yap(${yeni(op)});`];
  }

  function mainSrc(prog) {
    const naive = prog.design === 'naive';
    const geceNaive = (prog.geceDesign || prog.design) === 'naive';
    const gun = prog.gun || [];
    const L = ['        Depo depo = Depo.sabah();', '        Kamyon kamyon = new Kamyon();'];
    if (gun.length) {
      L.push(naive ? '        OperatorPaneli panel = new OperatorPaneli(depo, kamyon);' : '        OperatorPaneli panel = new OperatorPaneli();');
      L.push('');
      gun.forEach((op) => L.push(...gunSatirlari(op, naive)));
    }
    if (prog.gece) {
      L.push('');
      L.push(geceNaive ? '        GeceIsi gece = new GeceIsi(depo, kamyon);' : '        GeceIsi gece = new GeceIsi();');
      prog.gece.forEach((op) => L.push(geceNaive ? `        gece.ekle("${CM.planSatiri(op)}");` : `        gece.ekle(${yeni(op)});`));
      L.push('        gece.calistir();');
    }
    L.push('        System.out.println(depo.durum() + " · " + kamyon.durum());');
    const makro = gun.some((op) => op.t === 'makro');
    return `${makro ? 'import java.util.List;\n\n' : ''}public class Main {

    public static void main(String[] args) {
${L.join('\n')}
    }
}`;
  }
  CM.mainFor = mainSrc;

  /** Programın bütün dosyaları */
  CM.filesFor = function (prog) {
    const naive = prog.design === 'naive';
    const geceNaive = (prog.geceDesign || prog.design) === 'naive';
    const gun = prog.gun || [];
    const F = { Main: mainSrc(prog) };
    if (gun.length) F.OperatorPaneli = naive ? (prog.v === 'v1' ? code.OperatorPaneliV1 : code.OperatorPaneliV2) : code.OperatorPaneli;
    if (prog.gece) F.GeceIsi = geceNaive ? code.GeceIsiNaive : code.GeceIsi;
    const komutlar = (naive ? [] : gun).concat(prog.gece && !geceNaive ? prog.gece : []);
    if (komutlar.length) {
      F.Komut = code.Komut;
      if (komutlar.some((op) => op.t === 'tasi')) F.TasiKomutu = code.TasiKomutu;
      if (komutlar.some((op) => op.t === 'yukle' || op.t === 'makro')) F.YukleKomutu = code.YukleKomutu;
      if (komutlar.some((op) => op.t === 'makro')) F.MakroKomut = code.MakroKomut;
    }
    F.Depo = code.Depo;
    F.Kamyon = code.Kamyon;
    return F;
  };
  CM.fileOrder = ['Main', 'OperatorPaneli', 'GeceIsi', 'Komut', 'TasiKomutu', 'YukleKomutu', 'MakroKomut', 'Depo', 'Kamyon'];
  CM.fileList = (F, order) => (order || CM.fileOrder).filter((n) => F[n]).map((n) => ({ name: n + '.java', code: F[n] }));

  // ================================================================== çalıştırma benzetimi (Java ile birebir)
  /**
   * Programı adım adım çalıştırır. Dönüş: {lines, olaylar, crash}
   *   lines : [{t, k: 'panel'|'yok'|'gece'|'depo'|'kamyon'|'durum'|'err', i: istek no}]
   *   olaylar: ince taneli olaylar (sahne ve Canlı Akış için): {e, ...veri, n: o ana kadarki satır sayısı, s: anlık durum}
   * o.pkg: yığın izindeki sınıf adlarının paketi (dışa aktarılan kod), o.kayma: başlık satırları
   */
  CM.run = function (prog, o) {
    o = o || {};
    const naive = prog.design === 'naive';
    const geceNaive = (prog.geceDesign || prog.design) === 'naive';
    const undo = !naive || prog.v !== 'v1';
    const raflar = Object.assign({}, CM.SABAH);
    const yuk = [];
    const lines = [];
    const olaylar = [];
    let istek = -1;
    let alan = 'gun';
    const gecmis = [];
    const ileri = [];
    const slot = { sonIslem: null, sonKoli: null, sonRaf: null };
    const kuyruk = [];
    let id = 0;

    const kart = (c) => ({ id: c.id, t: c.op.t, ad: c.ad, koli: c.op.koli, hedef: c.op.raf, kayit: c.kayit, parca: c.parca ? c.parca.map(kart) : null });
    const snap = () => ({
      raflar: Object.assign({}, raflar),
      yuk: yuk.slice(),
      gecmis: gecmis.map(kart),
      ileri: ileri.map(kart),
      slot: Object.assign({}, slot),
      kuyruk: kuyruk.map((q) => Object.assign({}, q, { kart: q.kart ? Object.assign({}, q.kart) : null })),
    });
    const olay = (e, x) => olaylar.push(Object.assign({ e, alan, istek, n: lines.length }, x || {}, { s: snap() }));
    const out = (t, k) => lines.push({ t, k, i: istek, alan });

    // alıcılar
    const D = {
      yeri(koli) {
        const r = raflar[koli];
        olay('yeri', { koli, raf: r });
        return r;
      },
      tasi(koli, raf) {
        const eski = raflar[koli] === undefined ? 'null' : raflar[koli];
        raflar[koli] = raf;
        out(`  depo: ${koli} ${eski} → ${raf}`, 'depo');
        olay('tasi', { koli, from: eski, to: raf });
      },
      cikar(koli) {
        const raf = raflar[koli];
        delete raflar[koli];
        out(`  depo: ${koli} ${raf} rafından alındı`, 'depo');
        olay('cikar', { koli, from: raf });
        return raf;
      },
      koy(koli, raf) {
        raflar[koli] = raf;
        out(`  depo: ${koli} → ${raf}`, 'depo');
        olay('koy', { koli, to: raf });
      },
    };
    const K = {
      yukle(koli) {
        yuk.push(koli);
        out(`  kamyon: ${koli} yüklendi`, 'kamyon');
        olay('yukle', { koli });
      },
      indir(koli) {
        const i = yuk.indexOf(koli);
        if (i >= 0) yuk.splice(i, 1);
        out(`  kamyon: ${koli} indirildi`, 'kamyon');
        olay('indir', { koli });
      },
    };

    // komut nesneleri
    function komut(op) {
      const c = { id: ++id, op, kayit: null };
      if (op.t === 'tasi') {
        c.ad = `TAŞI ${op.koli} → ${op.raf}`;
        c.calistir = () => {
          c.kayit = D.yeri(op.koli);
          D.tasi(op.koli, op.raf);
        };
        c.geriAl = () => D.tasi(op.koli, c.kayit);
      } else if (op.t === 'yukle') {
        c.ad = `YÜKLE ${op.koli}`;
        c.calistir = () => {
          c.kayit = D.cikar(op.koli);
          K.yukle(op.koli);
        };
        c.geriAl = () => {
          K.indir(op.koli);
          D.koy(op.koli, c.kayit);
        };
      } else {
        c.parca = op.koliler.map((k) => komut(Y(k)));
        c.ad = `MAKRO ${op.ad} (${c.parca.length} komut)`;
        c.calistir = () => c.parca.forEach((p) => p.calistir());
        c.geriAl = () => {
          for (let i = c.parca.length - 1; i >= 0; i--) c.parca[i].geriAl();
        };
      }
      return c;
    }

    let crash = null;
    const trace = (cls, line) => `\tat ${o.pkg ? o.pkg + '.' : ''}${cls}.${cls === 'Main' ? 'main' : 'calistir'}(${cls}.java:${line + (o.kayma || 0)})`;

    try {
      // ---- gündüz: panel
      (prog.gun || []).forEach((op, k) => {
        istek = k;
        if (naive) {
          if (op.t === 'geri') {
            if (slot.sonIslem === null) {
              out('[Panel] geri alınacak işlem yok', 'yok');
              olay('yok');
              return;
            }
            out(`[Panel] geri al: ${slot.sonIslem} ${slot.sonKoli}`, 'panel');
            olay('geriAlNaive', { islem: slot.sonIslem, koli: slot.sonKoli, raf: slot.sonRaf });
            if (slot.sonIslem === 'TASI') D.tasi(slot.sonKoli, slot.sonRaf);
            else {
              K.indir(slot.sonKoli);
              D.koy(slot.sonKoli, slot.sonRaf);
            }
            slot.sonIslem = null;
            olay('slotBos');
            return;
          }
          const islem = op.t === 'tasi' ? 'TASI' : 'YUKLE';
          out(`[Panel] ${islem} ${op.koli}${op.t === 'tasi' ? ' → ' + op.raf : ''}`, 'panel');
          olay('tikla', { islem, koli: op.koli, raf: op.raf });
          if (op.t === 'tasi') {
            if (undo) slot.sonRaf = D.yeri(op.koli);
            D.tasi(op.koli, op.raf);
          } else {
            const r = D.cikar(op.koli);
            if (undo) slot.sonRaf = r;
            K.yukle(op.koli);
          }
          if (undo) {
            slot.sonIslem = islem;
            slot.sonKoli = op.koli;
            olay('slot');
          }
          return;
        }
        if (op.t === 'geri') {
          if (!gecmis.length) {
            out('[Panel] geri alınacak işlem yok', 'yok');
            olay('yok');
            return;
          }
          const c = gecmis.pop();
          olay('pop', { kart: kart(c) });
          out(`[Panel] geri al: ${c.ad}`, 'panel');
          olay('geriAl', { kart: kart(c) });
          c.geriAl();
          ileri.push(c);
          olay('ileriPush', { kart: kart(c) });
          return;
        }
        if (op.t === 'yinele') {
          if (!ileri.length) {
            out('[Panel] yinelenecek işlem yok', 'yok');
            olay('yok');
            return;
          }
          const c = ileri.pop();
          out(`[Panel] yinele: ${c.ad}`, 'panel');
          olay('yinele', { kart: kart(c) });
          c.calistir();
          gecmis.push(c);
          olay('push', { kart: kart(c) });
          return;
        }
        const c = komut(op);
        olay('yeni', { kart: kart(c) });
        out(`[Panel] ${c.ad}`, 'panel');
        olay('yap', { kart: kart(c) });
        c.calistir();
        gecmis.push(c);
        ileri.length = 0;
        olay('push', { kart: kart(c) });
      });

      // ---- gece işi
      if (prog.gece) {
        alan = 'gece';
        istek = -1;
        if (geceNaive) {
          prog.gece.forEach((op) => kuyruk.push({ satir: CM.planSatiri(op), durum: 'bekliyor', kart: null }));
          olay('plan');
          out(`[Gece] 02:00, ${kuyruk.length} iş`, 'gece');
          olay('gece');
          kuyruk.forEach((q, k) => {
            istek = k;
            out(`[Gece] ${q.satir}`, 'gece');
            q.durum = 'aktif';
            olay('geceIs', { k });
            const p = q.satir.split(' ');
            if (p[0] === 'TASI') D.tasi(p[1], p[2]);
            else if (p[0] === 'YUKLE') {
              D.cikar(p[1]);
              K.yukle(p[1]);
            } else {
              q.durum = 'hata';
              crash = { islem: p[0], k };
              throw crash;
            }
            q.durum = 'ok';
            olay('geceOk', { k });
          });
        } else {
          prog.gece.forEach((op, k) => {
            istek = k;
            const c = komut(op);
            kuyruk.push({ satir: c.ad, durum: 'bekliyor', kart: kart(c), c });
            olay('ekle', { k, kart: kart(c) });
          });
          istek = -1;
          out(`[Gece] 02:00, ${kuyruk.length} iş`, 'gece');
          olay('gece');
          kuyruk.forEach((q, k) => {
            istek = k;
            out(`[Gece] ${q.c.ad}`, 'gece');
            q.durum = 'aktif';
            olay('geceIs', { k, kart: kart(q.c) });
            q.c.calistir();
            q.kart = kart(q.c);
            q.durum = 'ok';
            olay('geceOk', { k, kart: kart(q.c) });
          });
          kuyruk.length = 0;
          olay('kuyrukBos');
        }
      }
      istek = -1;
      alan = 'son';
      out(`${durumMetni(raflar)} · ${kamyonMetni(yuk)}`, 'durum');
      olay('durum');
    } catch (e) {
      if (e !== crash) throw e;
      const F = CM.filesFor(prog);
      out(`Exception in thread "main" java.lang.IllegalArgumentException: bilinmeyen işlem: ${crash.islem}`, 'err');
      out(trace('GeceIsi', CM.lineOf(F.GeceIsi, 'default -> throw new IllegalArgumentException')), 'err');
      out(trace('Main', CM.lineOf(F.Main, 'gece.calistir();')), 'err');
      olay('crash', { islem: crash.islem, k: crash.k });
    }
    return { lines, olaylar, crash, son: olaylar[olaylar.length - 1].s };
  };
  const durumMetni = (raflar) =>
    'Raflar:' +
    Object.keys(raflar)
      .sort()
      .map((k) => ` ${k.slice(4)}:${raflar[k]}`)
      .join('');
  const kamyonMetni = (yuk) => (yuk.length ? 'Kamyon:' + yuk.map((k) => ' ' + k.slice(4)).join('') : 'Kamyon: boş');
  CM.outputOf = (prog) => CM.run(prog).lines.map((l) => l.t);

  // ================================================================== "Sorun" sürümleri
  CM.NV = {
    v1: { design: 'naive', v: 'v1', gun: [T('KRG-1001', 'B3'), Y('KRG-1003')], gece: null },
    v2: { design: 'naive', v: 'v2', gun: CM.GUN, gece: null },
    v3: { design: 'naive', v: 'v2', gun: CM.GUN, gece: CM.GECE_YAZIM },
  };
  CM.naiveFiles = (v) => CM.filesFor(CM.NV[v]);

  // ================================================================== çözüm ve adım adım yeniden düzenleme
  CM.COZUM = { design: 'komut', gun: CM.GUN, gece: CM.GECE };
  code.Main = mainSrc(CM.COZUM);
  CM.output = CM.outputOf(CM.COZUM);
  /** Ara durum: panel komutlarla çalışıyor, gece işi hâlâ metin planı */
  CM.ARA = { design: 'komut', geceDesign: 'naive', gun: CM.GUN, gece: CM.GECE_YAZIM };
  const V3 = CM.naiveFiles('v3');
  const R1 = Object.assign({}, V3, { Komut: plain(code.Komut) });
  const R2 = Object.assign({}, R1, { TasiKomutu: plain(code.TasiKomutu), YukleKomutu: plain(code.YukleKomutu) });
  const R3 = Object.assign({}, R2, { Main: mainSrc(CM.ARA), OperatorPaneli: plain(code.OperatorPaneli) });
  const R4 = Object.assign({}, R3, { Main: code.Main, GeceIsi: plain(code.GeceIsi) });
  CM.refactor = [V3, R1, R2, R3, R4];
  CM.refactorProgs = [CM.NV.v3, CM.NV.v3, CM.NV.v3, CM.ARA, CM.COZUM];
  CM.refactorOrder = ['Main', 'OperatorPaneli', 'GeceIsi', 'Komut', 'TasiKomutu', 'YukleKomutu', 'Depo', 'Kamyon'];

  // ================================================================== Canlı Akış
  CM.presets = {
    gun: { key: 'gun', title: 'Gündüz: iki hata, iki geri al', prog: { design: 'komut', gun: CM.GUN, gece: null } },
    gece: { key: 'gece', title: 'Gece kuyruğu', prog: { design: 'komut', gun: [], gece: CM.GECE } },
  };
  CM.presetOrder = ['gun', 'gece'];
  CM.akisFiles = (p) => CM.fileList(CM.filesFor(p.prog));
  CM.akisOutput = (p) => CM.outputOf(p.prog);

  // ================================================================== Komut tezgâhı
  /** Oturum: {design: 'naive'|'komut', ops: [istek]} */
  CM.tezgahProg = (tz) => ({ design: tz.design, v: 'v2', gun: tz.ops, gece: null });
  CM.tezgahFiles = (tz) => CM.filesFor(CM.tezgahProg(tz));
  /** Bir istek bu durumda yapılabilir mi? (tezgâhın düğmeleri; Java tarafında denetim yok) */
  CM.uygun = function (s, op, design) {
    if (op.t === 'tasi') return !!s.raflar[op.koli] && !Object.values(s.raflar).includes(op.raf);
    if (op.t === 'yukle') return !!s.raflar[op.koli];
    if (op.t === 'makro') return design === 'komut' && op.koliler.every((k) => s.raflar[k]);
    if (op.t === 'yinele') return design === 'komut';
    return true;
  };
  /** Kalıpsız oturumun sonucu, aynı oturumun komutlu sonucuyla karşılaştırılır */
  CM.olc = function (tz) {
    const r = CM.run(CM.tezgahProg(tz));
    const ideal = CM.run(CM.tezgahProg({ design: 'komut', ops: tz.ops.filter((op) => op.t !== 'yinele' && op.t !== 'makro') }));
    const yer = (s, k) => s.raflar[k] || (s.yuk.includes(k) ? 'kamyon' : '?');
    const yanlis = CM.KOLILER.filter((k) => yer(r.son, k) !== yer(ideal.son, k));
    const bosaGeri = r.lines.filter((l) => l.k === 'yok' && l.t.includes('geri alınacak')).length;
    const idealBos = ideal.lines.filter((l) => l.k === 'yok' && l.t.includes('geri alınacak')).length;
    return {
      run: r,
      gecmis: r.son.gecmis.length,
      ileri: r.son.ileri.length,
      kamyon: r.son.yuk.length,
      komutNesnesi: tz.design === 'komut' ? tz.ops.filter((op) => op.t === 'tasi' || op.t === 'yukle' || op.t === 'makro').length : 0,
      kayipGeri: tz.design === 'naive' ? Math.max(0, bosaGeri - idealBos) : 0,
      yanlis: tz.design === 'naive' ? yanlis : [],
      idealYer: (k) => yer(ideal.son, k),
    };
  };

  // ================================================================== Genişlet: makro komut
  const EX = (CM.ext = {});
  EX.exercise = `public class MakroKomut implements ⟦1⟧ {

    private final String ad;
    private final List<Komut> komutlar;

    public MakroKomut(String ad, List<Komut> komutlar) {
        this.ad = ad;
        this.komutlar = komutlar;
    }

    @Override
    public void calistir() {
        for (Komut k : komutlar) {
            k.⟦2⟧();
        }
    }

    @Override
    public void geriAl() {
${cm('        for (int i = komutlar.size() - 1; i >= 0; i--) {', 'ters sırayla')}
            komutlar.get(i).⟦3⟧();
        }
    }

    @Override
    public String ad() {
        return "MAKRO " + ad + " (" + komutlar.size() + " komut)";
    }
}`;
  EX.exerciseMain = `// Main.java: üç yükleme, panelde TEK komut
panel.yap(new ⟦4⟧("Malatya kamyonu", List.of(
        new YukleKomutu(depo, kamyon, "KRG-1001"),
        new YukleKomutu(depo, kamyon, "KRG-1005"),
        new YukleKomutu(depo, kamyon, "KRG-1006"))));
panel.geriAl();`;
  EX.answers = { 1: 'Komut', 2: 'calistir', 3: 'geriAl', 4: 'MakroKomut' };
  EX.prog = { design: 'komut', gun: [CM.MAKRO, G], gece: null };
  EX.Main = mainSrc(EX.prog);
  EX.output = CM.outputOf(EX.prog);

  // ================================================================== Gerçek dünya (JDK) örnekleri
  const RW = (CM.rw = {});
  /** Seçeneğin satırı: yorum, koddaki öbür yorumlarla aynı sütunda */
  const rwArg = (stmt, comment) => cm('        ' + stmt, comment, 60).slice(8);

  RW.runnable = (arg) => `import java.util.ArrayList;
import java.util.List;

public class IsKuyrugu {

    public static void main(String[] args) {
${cm('        List<Runnable> gece = new ArrayList<>();', 'komutlar: nesne olarak sırada')}
        gece.add(() -> yaz("KRG-1001 kamyona"));
        gece.add(() -> yaz("KRG-1004 → C2"));

        ${arg}
    }

    static void yaz(String is) {
        System.out.println(Thread.currentThread().getName() + ": " + is);
    }
}`;
  RW.runnableOpts = [
    { label: 'Henüz değil', arg: rwArg('System.out.println(gece.size() + " iş sırada");', 'yaratmak ≠ çalıştırmak'), out: ['2 iş sırada'] },
    { label: 'Şimdi, burada', arg: rwArg('gece.forEach(Runnable::run);', 'çağıran: main'), out: ['main: KRG-1001 kamyona', 'main: KRG-1004 → C2'] },
    { label: 'Gece iş parçacığı', arg: rwArg('new Thread(() -> gece.forEach(Runnable::run), "gece-02:00").start();', 'başka çağıran'), out: ['gece-02:00: KRG-1001 kamyona', 'gece-02:00: KRG-1004 → C2'] },
  ];

  RW.aksiyon = (arg) => `import java.awt.event.ActionEvent;
import javax.swing.AbstractAction;
import javax.swing.Action;
import javax.swing.JButton;
import javax.swing.JMenuItem;

public class AksiyonOrnegi {

    public static void main(String[] args) {
        @SuppressWarnings("serial")
        Action yukle = new AbstractAction("Kamyona yükle") {
            @Override
            public void actionPerformed(ActionEvent e) {
                System.out.println("yükle çalıştı ← " + e.getSource().getClass().getSimpleName());
            }
        };
${cm('        JButton dugme = new JButton(yukle);', 'iki çağıran,')}
${cm('        JMenuItem menu = new JMenuItem(yukle);', 'tek komut')}

        ${arg}
        System.out.println("düğme: " + dugme.isEnabled() + " · menü: " + menu.isEnabled());
    }
}`;
  RW.aksiyonOpts = [
    { label: 'Düğmeye bas', arg: 'dugme.doClick();', out: ['yükle çalıştı ← JButton', 'düğme: true · menü: true'] },
    { label: 'Menüden seç', arg: 'menu.doClick();', out: ['yükle çalıştı ← JMenuItem', 'düğme: true · menü: true'] },
    { label: 'Komutu kapat', arg: rwArg('yukle.setEnabled(false);', 'ikisi birden kapanır'), out: ['düğme: false · menü: false'] },
  ];

  RW.geriAl = (arg) => `import javax.swing.undo.AbstractUndoableEdit;
import javax.swing.undo.UndoManager;

public class GeriAlYoneticisi {

    static class Koli {
        String raf = "A1";
    }

    /** UndoableEdit: JDK’nın geri alınabilir komutu */
    @SuppressWarnings("serial")
    static class Tasi extends AbstractUndoableEdit {
        private final Koli koli;
        private final String once;
        private final String sonra;

        Tasi(Koli koli, String sonra) {
            this.koli = koli;
            this.once = koli.raf;
            this.sonra = sonra;
            koli.raf = sonra;
        }

        @Override
        public void undo() {
            super.undo();
            koli.raf = once;
        }

        @Override
        public void redo() {
            super.redo();
            koli.raf = sonra;
        }
    }

    public static void main(String[] args) {
        Koli koli = new Koli();
        UndoManager yonetici = new UndoManager();
        yonetici.addEdit(new Tasi(koli, "B3"));
        yonetici.addEdit(new Tasi(koli, "C2"));
        yonetici.undo();
        ${arg}
        System.out.println("KRG-1001 → " + koli.raf + " · geri al: " + (yonetici.canUndo() ? "var" : "yok")
                + " · yinele: " + (yonetici.canRedo() ? "var" : "yok"));
    }
}`;
  RW.geriAlOpts = [
    { label: 'Bir geri al', arg: '// başka bir şey yapma', out: ['KRG-1001 → B3 · geri al: var · yinele: var'] },
    { label: 'Bir daha geri al', arg: rwArg('yonetici.undo();', 'bir kez daha'), out: ['KRG-1001 → A1 · geri al: yok · yinele: var'] },
    { label: 'Yeni işlem', arg: rwArg('yonetici.addEdit(new Tasi(koli, "C4"));', 'yinele yığını silinir'), out: ['KRG-1001 → C4 · geri al: var · yinele: yok'] },
  ];

  // ================================================================== UML sınıf diyagramları
  const Mb = {
    gecmis: { id: 'gecmis', text: '- gecmis: Deque<Komut>', generic: '- history: Command[*]' },
    ileri: { id: 'ileri', text: '- ileri: Deque<Komut>', generic: '- redo: Command[*]' },
    yap: { id: 'yap', text: '+ yap(k: Komut)', generic: '+ invoke(c)', factory: true },
    pGeriAl: { id: 'geriAl', text: '+ geriAl()', generic: '+ undo()' },
    yinele: { id: 'yinele', text: '+ yinele()', generic: '+ redo()' },
    kuyruk: { id: 'kuyruk', text: '- kuyruk: List<Komut>', generic: '- queue: Command[*]' },
    ekle: { id: 'ekle', text: '+ ekle(k: Komut)', generic: '+ add(c)' },
    gCalistir: { id: 'calistir', text: '+ calistir()', generic: '+ runAll()' },
    kCalistir: { id: 'calistir', text: '+ calistir()', generic: '+ execute()', abstract: true },
    kGeriAl: { id: 'geriAl', text: '+ geriAl()', generic: '+ unexecute()', abstract: true },
    kAd: { id: 'ad', text: '+ ad(): String', generic: '+ name()', abstract: true },
  };
  CM.members = Mb;
  const box = {
    Main: (x, y) => ({ id: 'Main', name: 'Main', generic: 'Client', kind: 'class', role: 'client', x, y, w: 190, members: [{ id: 'main', text: '+ main(args)', generic: '+ main()' }] }),
    OperatorPaneli: (x, y) => ({ id: 'OperatorPaneli', name: 'OperatorPaneli', generic: 'Invoker', kind: 'class', role: 'invoker', x, y, w: 250, members: [Mb.gecmis, Mb.ileri, Mb.yap, Mb.pGeriAl, Mb.yinele] }),
    GeceIsi: (x, y) => ({ id: 'GeceIsi', name: 'GeceIsi', generic: 'Invoker2', kind: 'class', role: 'invoker', x, y, w: 250, noTag: true, members: [Mb.kuyruk, Mb.ekle, Mb.gCalistir] }),
    Komut: (x, y) => ({ id: 'Komut', name: 'Komut', generic: 'Command', kind: 'interface', role: 'command', x, y, w: 210, members: [Mb.kCalistir, Mb.kGeriAl, Mb.kAd] }),
    TasiKomutu: (x, y) => ({ id: 'TasiKomutu', name: 'TasiKomutu', generic: 'ConcreteCommand1', kind: 'class', role: 'concreteCommand', x, y, w: 210, members: [{ id: 'onceki', text: '- onceki: String', generic: '- state' }, { id: 'calistir', text: '+ calistir()', generic: '+ execute()' }, { id: 'geriAl', text: '+ geriAl()', generic: '+ unexecute()' }] }),
    YukleKomutu: (x, y) => ({ id: 'YukleKomutu', name: 'YukleKomutu', generic: 'ConcreteCommand2', kind: 'class', role: 'concreteCommand', x, y, w: 210, noTag: true, members: [{ id: 'raf', text: '- raf: String', generic: '- state' }, { id: 'calistir', text: '+ calistir()', generic: '+ execute()' }, { id: 'geriAl', text: '+ geriAl()', generic: '+ unexecute()' }] }),
    Depo: (x, y) => ({ id: 'Depo', name: 'Depo', generic: 'Receiver', kind: 'class', role: 'receiver', x, y, w: 210, members: [{ id: 'tasi', text: '+ tasi(koli, raf)', generic: '+ action()' }, { id: 'cikar', text: '+ cikar(koli)', generic: '+ action2()' }, { id: 'koy', text: '+ koy(koli, raf)', generic: '+ action3()' }] }),
    Kamyon: (x, y) => ({ id: 'Kamyon', name: 'Kamyon', generic: 'Receiver2', kind: 'class', role: 'receiver', x, y, w: 210, noTag: true, members: [{ id: 'yukle', text: '+ yukle(koli)', generic: '+ action()' }, { id: 'indir', text: '+ indir(koli)', generic: '+ action2()' }] }),
  };
  CM.box = box;

  /** GoF yapısı (Yapı sahnesi, Canlı Akış, özet). o.notes: yap() notu */
  CM.gofDiagram = function (o) {
    o = o || {};
    const classes = [box.OperatorPaneli(20, 40), box.GeceIsi(20, 262), box.Komut(400, 40), box.TasiKomutu(330, 262), box.YukleKomutu(580, 262), box.Depo(330, 470), box.Kamyon(580, 470), box.Main(20, 470)];
    const relations = [
      { id: 'gecmis', from: 'OperatorPaneli', to: 'Komut', type: 'aggregation', label: 'gecmis', genericLabel: 'history', fromSide: 'right', fromAt: 100, toSide: 'left', toAt: 100 },
      { id: 'kuyruk', from: 'GeceIsi', to: 'Komut', type: 'aggregation', label: 'kuyruk', genericLabel: 'queue', fromSide: 'right', fromAt: 300, toSide: 'left', toAt: 150, mid: 300 },
      { id: 'r-tasi', from: 'TasiKomutu', to: 'Komut', type: 'realization', fromSide: 'top', fromAt: 435, toSide: 'bottom', toAt: 505, mid: 222 },
      { id: 'r-yukle', from: 'YukleKomutu', to: 'Komut', type: 'realization', fromSide: 'top', fromAt: 685, toSide: 'bottom', toAt: 505, mid: 222 },
      { id: 'a-tasi', from: 'TasiKomutu', to: 'Depo', type: 'association', label: 'depo', genericLabel: 'receiver', fromSide: 'bottom', fromAt: 435, toSide: 'top', toAt: 435 },
      { id: 'a-yukle-depo', from: 'YukleKomutu', to: 'Depo', type: 'association', fromSide: 'bottom', fromAt: 620, toSide: 'top', toAt: 515, points: [[620, 440], [515, 440]] },
      { id: 'a-yukle-kamyon', from: 'YukleKomutu', to: 'Kamyon', type: 'association', label: 'kamyon', genericLabel: 'receiver', fromSide: 'bottom', fromAt: 700, toSide: 'top', toAt: 700 },
      { id: 'c-main', from: 'Main', to: 'TasiKomutu', type: 'dependency', label: '«create»', fromSide: 'right', fromAt: 505, toSide: 'left', toAt: 365, mid: 280 },
    ];
    const notes = o.notes
      ? [{ id: 'n-yap', x: 820, y: 40, text: 'çağıranın bildiği tek şey:\nk.calistir();   // yap\nk.geriAl();     // geri al', genericText: 'invoker only knows:\nc.execute();\nc.unexecute();', target: 'Komut', from: 'left', to: 'right', toAt: 90 }]
      : [];
    return { width: 1040, height: 580, title: 'Command sınıf diyagramı', classes, relations, notes };
  };

  /**
   * "Çözüm" sahnesinin her adımındaki diyagram.
   * 0: panel ve gece işi alıcıları doğrudan çağırır · 1: Komut · 2: somut komutlar · 3: panel komut tutar · 4: gece işi de
   */
  CM.solutionDiagram = function (st) {
    const classes = [];
    const relations = [];
    const P = box.OperatorPaneli(20, 40);
    if (st < 3) P.members = [{ id: 'tikla', text: '+ tikla(islem, koli, raf)' }, { id: 'sonIslem', text: '- sonIslem, sonKoli, sonRaf' }, { id: 'geriAl', text: '+ geriAl() · switch' }];
    const Gc = box.GeceIsi(20, 262);
    Gc.noTag = false;
    if (st < 4) Gc.members = [{ id: 'plan', text: '- plan: List<String>' }, { id: 'calistir', text: '+ calistir() · switch kopyası' }];
    classes.push(P, Gc, box.Depo(330, 470), box.Kamyon(580, 470));
    if (st >= 1) classes.push(box.Komut(400, 40));
    if (st >= 2) classes.push(box.TasiKomutu(330, 262), box.YukleKomutu(580, 262));
    // kalıpsız çağıranlar alıcıları doğrudan tanır
    if (st < 3) relations.push({ id: 'p-depo', from: 'OperatorPaneli', to: 'Depo', type: 'dependency', fromSide: 'bottom', fromAt: 230, toSide: 'left', toAt: 520, points: [[230, 240], [300, 240], [300, 520]] });
    if (st < 4) relations.push({ id: 'g-depo', from: 'GeceIsi', to: 'Depo', type: 'dependency', fromSide: 'bottom', fromAt: 145, toSide: 'left', toAt: 545, points: [[145, 545]] });
    if (st >= 2) {
      relations.push({ id: 'r-tasi', from: 'TasiKomutu', to: 'Komut', type: 'realization', fromSide: 'top', fromAt: 435, toSide: 'bottom', toAt: 505, mid: 222 });
      relations.push({ id: 'r-yukle', from: 'YukleKomutu', to: 'Komut', type: 'realization', fromSide: 'top', fromAt: 685, toSide: 'bottom', toAt: 505, mid: 222 });
      relations.push({ id: 'a-tasi', from: 'TasiKomutu', to: 'Depo', type: 'association', label: 'depo', genericLabel: 'receiver', fromSide: 'bottom', fromAt: 435, toSide: 'top', toAt: 435 });
      relations.push({ id: 'a-yukle-depo', from: 'YukleKomutu', to: 'Depo', type: 'association', fromSide: 'bottom', fromAt: 620, toSide: 'top', toAt: 515, points: [[620, 440], [515, 440]] });
      relations.push({ id: 'a-yukle-kamyon', from: 'YukleKomutu', to: 'Kamyon', type: 'association', label: 'kamyon', genericLabel: 'receiver', fromSide: 'bottom', fromAt: 700, toSide: 'top', toAt: 700 });
    }
    if (st >= 3) relations.push({ id: 'gecmis', from: 'OperatorPaneli', to: 'Komut', type: 'aggregation', label: 'gecmis', fromSide: 'right', fromAt: 100, toSide: 'left', toAt: 100 });
    if (st >= 4) relations.push({ id: 'kuyruk', from: 'GeceIsi', to: 'Komut', type: 'aggregation', label: 'kuyruk', fromSide: 'right', fromAt: 300, toSide: 'left', toAt: 150, mid: 300 });
    return { width: 1040, height: 600, view: [0, 0, 820, 600], classes, relations };
  };

  // ------------------------------------------------------------------ UML sıralama diyagramı (Canlı Akış)
  /**
   * Akış adımlarıyla aynı sırada mesajlar; olay listesinden üretilir.
   * Dönüş: {spec, msgOf: {anahtar: mesaj no}, run}
   */
  CM.seqSpec = function (p) {
    const r = CM.run(p.prog);
    const gece = !!p.prog.gece;
    const parts = [{ id: 'main', label: 'Main', role: 'client' }];
    parts.push(gece ? { id: 'inv', label: 'gece', role: 'invoker', object: true } : { id: 'inv', label: 'panel', role: 'invoker', object: true });
    const messages = [];
    const msgOf = {};
    const add = (key, m) => {
      msgOf[key] = messages.length;
      messages.push(m);
    };
    const nesne = {}; // kart id → katılımcı
    const lbl = {}; // kart id → nesne adı (t, y, y1, y2…)
    let son = null; // o an çalışan komut
    const ad = (kart) => lbl[kart.id];
    r.olaylar.forEach((o) => {
      if (o.e === 'yeni' || o.e === 'ekle') {
        const id = 'k' + o.kart.id;
        const ayni = r.olaylar.filter((x) => (x.e === 'yeni' || x.e === 'ekle') && x.kart.t === o.kart.t);
        lbl[o.kart.id] = (o.kart.t === 'tasi' ? 't' : 'y') + (ayni.length > 1 ? ayni.findIndex((x) => x.kart.id === o.kart.id) + 1 : '');
        nesne[o.kart.id] = id;
        parts.push({ id, label: `${ad(o.kart)}\n: ${o.kart.t === 'tasi' ? 'TasiKomutu' : 'YukleKomutu'}`, role: 'concreteCommand', object: true });
        add('new:' + o.istek, { from: 'main', to: id, kind: 'create', label: '«create»' });
        if (o.e === 'ekle') add('ekle:' + o.istek, { from: 'main', to: 'inv', kind: 'call', short: true, label: `ekle(${ad(o.kart)})` });
      } else if (o.e === 'yap') {
        add('yap:' + o.istek, { from: 'main', to: 'inv', kind: 'call', label: `yap(${ad(o.kart)})` });
        son = nesne[o.kart.id];
        add('calistir:' + o.istek, { from: 'inv', to: son, kind: 'call', label: 'calistir()' });
      } else if (o.e === 'gece') {
        add('cal', { from: 'main', to: 'inv', kind: 'call', label: 'calistir()' });
      } else if (o.e === 'geceIs') {
        son = nesne[o.kart.id];
        add('c:' + o.istek, { from: 'inv', to: son, kind: 'call', label: 'calistir()' });
      } else if (o.e === 'pop') {
        add('geri:' + o.istek, { from: 'main', to: 'inv', kind: 'call', label: 'geriAl()' });
      } else if (o.e === 'geriAl') {
        son = nesne[o.kart.id];
        add('gal:' + o.istek, { from: 'inv', to: son, kind: 'call', label: 'geriAl()' });
      } else if (o.e === 'yeri') {
        add('yeri:' + o.istek, { from: son, to: 'depo', kind: 'call', short: true, label: `yeri(${o.koli.slice(4)}) → ${o.raf}` });
      } else if (o.e === 'tasi') {
        add('tasi:' + o.istek, { from: son, to: 'depo', kind: 'call', short: true, label: `tasi(${o.koli.slice(4)}, ${o.to})` });
      } else if (o.e === 'cikar') {
        add('cikar:' + o.istek, { from: son, to: 'depo', kind: 'call', short: true, label: `cikar(${o.koli.slice(4)}) → ${o.from}` });
      } else if (o.e === 'koy') {
        add('koy:' + o.istek, { from: son, to: 'depo', kind: 'call', short: true, label: `koy(${o.koli.slice(4)}, ${o.to})` });
      } else if (o.e === 'yukle') {
        add('yukle:' + o.istek, { from: son, to: 'kamyon', kind: 'call', short: true, label: `yukle(${o.koli.slice(4)})` });
      } else if (o.e === 'indir') {
        add('indir:' + o.istek, { from: son, to: 'kamyon', kind: 'call', short: true, label: `indir(${o.koli.slice(4)})` });
      } else if (o.e === 'push' || o.e === 'ileriPush') {
        add('ret:' + o.istek, { from: son, to: 'inv', kind: 'return', label: '' });
        add('retm:' + o.istek, { from: 'inv', to: 'main', kind: 'return', label: '' });
      } else if (o.e === 'geceOk') {
        add('ret:' + o.istek, { from: son, to: 'inv', kind: 'return', label: '' });
      } else if (o.e === 'kuyrukBos') {
        add('ret', { from: 'inv', to: 'main', kind: 'return', label: '' });
      }
    });
    parts.push({ id: 'depo', label: 'depo', role: 'receiver', object: true }, { id: 'kamyon', label: 'kamyon', role: 'receiver', object: true });
    const W = gece ? 1240 : 1120;
    parts.forEach((pp, i) => (pp.x = 70 + (i * (W - 70 - 150)) / (parts.length - 1)));
    const rowH = 27;
    const h = 120 + messages.reduce((s, m) => s + (m.kind === 'self' ? rowH + 16 : rowH), 0) + 40;
    return { spec: { width: W, height: h, top: 118, margin: 70, rowH, participants: parts, messages, initialActive: ['main'] }, msgOf, run: r };
  };
})();
