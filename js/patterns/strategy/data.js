/*
 * Strategy — veri: Java kodları, çalıştırma benzetimi, roller, diyagram tanımları.
 * Bu dosya DOM kullanmaz; tools/export-java.js de Java dosyalarını buradan üretir.
 *
 * Senaryo (lojistik dünyasının devamı): Malatya kuryesinin günü. Depodan çıkan kurye altı durağı dolaşır; sıradaki
 * durağı bir rota algoritması seçer: randevu sırası (müşterilere söz verilen sıra), en yakın durak, soğuk zincir önce.
 * Sokaklar ızgara gibidir: iki nokta arası |dx| + |dy| km.
 *   Sürüm 1.0: tek algoritma, randevu sırası: kalan.get(0) — liste randevu sırasında tutuluyor.
 *   Sürüm 1.1: algoritma adıyla seçiliyor (String + if/else); EN_YAKIN eklendi, listeye dokunmuyor.
 *   Sürüm 2.0: SOGUK_ONCE eklendi: ortak listeyi yerinde sıralıyor (kalan.sort). Kurye sabah soğuk zincirlileri
 *              dağıtıp öğleden sonra randevu sırasına dönünce sıra bozuk: Can Demir’in ikinci randevusu en sona kalıyor.
 *              Randevu dalının koduna kimse dokunmadı; onu bozan, aynı sınıftaki yeni dal.
 * Strategy: her algoritma RotaStratejisi’ni uygulayan ayrı bir sınıf. Kurye yalnızca arayüzü tanır, stratejiye listenin
 * salt okunur görünümünü verir; strateji yalnızca seçer. İstemci (Main) stratejiyi çalışırken değiştirebilir.
 */
(function () {
  'use strict';
  const DP = (window.DP = window.DP || {});
  const SG = (DP.stg = DP.stg || {});

  // ------------------------------------------------------------------ roller
  SG.roles = {
    client: { en: 'Client', tr: 'İstemci', color: 1 },
    context: { en: 'Context', tr: 'Bağlam', color: 3 },
    strategy: { en: 'Strategy', tr: 'Strateji (arayüz)', color: 2 },
    concreteStrategy: { en: 'ConcreteStrategy', tr: 'Somut strateji', color: 4 },
  };

  SG.classRoles = {
    Main: 'client',
    Kurye: 'context',
    RotaStratejisi: 'strategy',
    RandevuRota: 'concreteStrategy',
    EnYakinRota: 'concreteStrategy',
    SogukOnceRota: 'concreteStrategy',
    AgirOnceRota: 'concreteStrategy',
    PlanliRota: 'concreteStrategy',
    // GoF genel adları
    Client: 'client',
    Context: 'context',
    Strategy: 'strategy',
    ConcreteStrategy: 'concreteStrategy',
    ConcreteStrategyA: 'concreteStrategy',
    ConcreteStrategyB: 'concreteStrategy',
    ConcreteStrategyC: 'concreteStrategy',
  };

  SG.roleOf = function (name) {
    const r = SG.classRoles[name];
    return r ? SG.roles[r].color : null;
  };

  // `sec`: stratejinin tek yöntemi (kodda ayrıca vurgulanır)
  SG.special = { sec: 'stg' };

  /** 1 tabanlı satır numarası. */
  SG.lineOf = function (src, needle, from) {
    const lines = src.split('\n');
    for (let i = from || 0; i < lines.length; i++) if (lines[i].includes(needle)) return i + 1;
    return 0;
  };

  /** Satırın sonuna, belirli bir sütundan başlayan yorum ekler (satır uzunsa en az iki boşluk). */
  const cm = (line, comment, col) => line.padEnd(Math.max(col || 60, line.length + 2)) + '// ' + comment;
  const doc = (text) => `/**\n * ${text}\n */\n`;
  const plain = (src) => src.replace(/^((?:import [^\n]+\n)*\n?)\/\*\*[\s\S]*?\*\/\n/, '$1');
  SG.plain = plain;

  const code = (SG.code = {});

  // ================================================================== dünya: harita, depo, duraklar
  /** Depo ve duraklar (Durak.java ile birebir). Liste randevu sırasındadır. */
  SG.DEPO = { x: 1, y: 1 };
  const D = (no, alici, yer, x, y, kg, soguk) => ({ no, alici, yer, x, y, kg, soguk });
  SG.DURAKLAR = [
    D('KRG-1001', 'Ali Şahin', 'Çarşı', 6, 4, 3, false),
    D('KRG-1004', 'Can Demir', 'Battalgazi', 9, 1, 4, false),
    D('KRG-1005', 'Selin Aydın', 'Üniversite', 11, 4, 9, false),
    D('KRG-1006', 'Mert Kaya', 'Yeşilyurt', 2, 7, 25, false),
    D('KRG-1007', 'Elif Arslan', 'Kernek', 3, 4, 1, true),
    D('KRG-1008', 'Emre Koç', 'Bostanbaşı', 6, 7, 2, true),
  ];
  SG.DURAKLAR.forEach((d, i) => (d.sira = i + 1));
  SG.durak = (no) => SG.DURAKLAR.find((d) => d.no === no);
  SG.mesafe = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  /** Durak.toString() ile birebir */
  SG.etiket = (d) => `${d.no} ${d.alici} (${d.yer}${d.soguk ? ', soğuk zincir' : ''})`;

  /** Rota algoritmaları: arayüzdeki ad, strateji sınıfı, kalıtımdaki alt sınıf, kalıpsız sürümdeki sabit */
  SG.ALGO = {
    RANDEVU: { key: 'RANDEVU', ad: 'Randevu sırası', kisa: 'randevu', sinif: 'RandevuRota', kalitim: 'RandevuKuryesi', sabit: 'RANDEVU' },
    EN_YAKIN: { key: 'EN_YAKIN', ad: 'En yakın durak', kisa: 'en yakın', sinif: 'EnYakinRota', kalitim: 'EnYakinKuryesi', sabit: 'EN_YAKIN' },
    SOGUK: { key: 'SOGUK', ad: 'Soğuk zincir önce', kisa: 'soğuk önce', sinif: 'SogukOnceRota', kalitim: 'SogukOnceKuryesi', sabit: 'SOGUK_ONCE' },
    AGIR: { key: 'AGIR', ad: 'Ağır önce', kisa: 'ağır önce', sinif: 'AgirOnceRota', kalitim: null, sabit: null },
  };
  SG.ALGO_SIRA = ['RANDEVU', 'EN_YAKIN', 'SOGUK', 'AGIR'];
  /** Main’in strateji değişince yazdığı satır */
  SG.isaret = (algo) => '~ ' + SG.ALGO[algo].ad.toLocaleLowerCase('tr');

  // ------------------------------------------------------------------ kuralların tanımı (doğru seçim)
  const randevuSirasi = (L) => L.slice().sort((a, b) => a.sira - b.sira);
  const ilkEnYakin = (k, L) => L.reduce((s, d) => (SG.mesafe(k, d) < SG.mesafe(k, s) ? d : s), L[0]);
  const ilkEnAgir = (L) => L.reduce((s, d) => (d.kg > s.kg ? d : s), L[0]);
  /** İstenen algoritmanın tanımına göre sıradaki durak (eşitlikte randevusu önce olan) */
  SG.dogruSecim = function (algo, konum, kalan) {
    const L = randevuSirasi(kalan);
    if (algo === 'RANDEVU') return L[0];
    if (algo === 'EN_YAKIN') return ilkEnYakin(konum, L);
    if (algo === 'AGIR') return ilkEnAgir(L);
    const soguk = L.filter((d) => d.soguk);
    return ilkEnYakin(konum, soguk.length ? soguk : L);
  };
  /** Kalan durakların bulunulan yere uzaklıkları (Canlı Akış) */
  SG.mesafeler = (konum, kalan) => kalan.map((d) => ({ no: d.no, km: SG.mesafe(konum, d) }));

  // ------------------------------------------------------------------ istekler (istemcinin işlemleri)
  const S = (algo) => ({ t: 'sec', v: algo });
  const T = () => ({ t: 'teslim' });
  SG.op = { S, T };
  const T6 = () => [T(), T(), T(), T(), T(), T()];

  // ================================================================== Java kaynakları
  code.Konum = `${doc('Haritada bir nokta (km). Sokaklar ızgara gibi: iki nokta arası |dx| + |dy| km.')}public record Konum(int x, int y) {

    public static final Konum DEPO = new Konum(${SG.DEPO.x}, ${SG.DEPO.y});

    public int mesafe(Konum o) {
        return Math.abs(x - o.x) + Math.abs(y - o.y);
    }
}`;

  const durakSatiri = (d) => `            new Durak("${d.no}", "${d.alici}", "${d.yer}", ${d.x}, ${d.y}, ${d.kg}, ${d.soguk})`;
  code.Durak = `import java.util.List;

${doc('Günün bir teslimat durağı. gunun() listesi randevu sırasındadır.')}public record Durak(String no, String alici, String yer,
                    int x, int y, int kg, boolean soguk) {

    public static List<Durak> gunun() {
        return List.of(
${SG.DURAKLAR.map(durakSatiri).join(',\n')});
    }

    public Konum konum() {
        return new Konum(x, y);
    }

    @Override
    public String toString() {
        String not = soguk ? ", soğuk zincir" : "";
        return no + " " + alici + " (" + yer + not + ")";
    }
}`;

  // ---- ortak parçalar (Kurye)
  const ALAN_KALAN = (erisim) => cm(`    ${erisim} final List<Durak> kalan;`, 'randevu sırasında', 40);
  const OZET = `    public String ozet() {
        int teslim = toplam - kalan.size();
        return "Gün sonu: " + teslim + "/" + toplam + " teslimat · " + km + " km";
    }`;
  const YURU = `        int yol = konum.mesafe(d.konum());
        km += yol;
        konum = d.konum();
        System.out.println("→ " + d + " · " + yol + " km");`;
  const enYakinDongu = (liste, ind) => {
    const p = ' '.repeat(ind);
    return `${p}Durak secilen = ${liste}.get(0);
${p}for (Durak d : ${liste}) {
${p}    if (konum.mesafe(d.konum()) < konum.mesafe(secilen.konum())) {
${p}        secilen = d;
${p}    }
${p}}
${p}return secilen;`;
  };

  // ---- kalıpsız sürümler: algoritmalar Kurye’nin içinde (v1: tek algoritma · v11: String + if/else · v2: SOGUK_ONCE)
  function naiveKurye(v) {
    const secimli = v !== 'v1';
    const v2 = v === 'v2';
    const belge = {
      v1: 'Sürüm 1.0: kurye durakları randevu sırasıyla dolaşır.',
      v11: 'Sürüm 1.1: rota algoritması adıyla seçilir; algoritmaların hepsi bu sınıfta.',
      v2: 'Sürüm 2.0: SOGUK_ONCE eklendi. Algoritmaların hepsi aynı listeyi kullanıyor.',
    }[v];
    let sec;
    if (!secimli) {
      sec = `    private Durak sec() {
${cm('        return kalan.get(0);', 'liste randevu sırasında', 1)}
    }`;
    } else {
      sec = `    private Durak sec() {
        if (yontem.equals("RANDEVU")) {
${cm('            return kalan.get(0);', 'liste randevu sırasında', 1)}
        } else if (yontem.equals("EN_YAKIN")) {
${enYakinDongu('kalan', 12)}${
        v2
          ? `
        } else if (yontem.equals("SOGUK_ONCE")) {
            // soğuk zincirliler başa, sonra yakından uzağa
            kalan.sort(Comparator.comparing(Durak::soguk).reversed()
                    .thenComparingInt(d -> konum.mesafe(d.konum())));
            return kalan.get(0);`
          : ''
      }
        }
        throw new IllegalArgumentException("bilinmeyen yöntem: " + yontem);
    }`;
    }
    return `import java.util.ArrayList;${v2 ? '\nimport java.util.Comparator;' : ''}
import java.util.List;

${doc(belge)}public class Kurye {

${ALAN_KALAN('private')}
    private final int toplam;
    private Konum konum = Konum.DEPO;
    private int km;${secimli ? '\n    private String yontem = "RANDEVU";' : ''}

    public Kurye(List<Durak> duraklar) {
        this.kalan = new ArrayList<>(duraklar);
        this.toplam = duraklar.size();
    }
${
  secimli
    ? `
    public void yontemSec(String yontem) {
        this.yontem = yontem;
    }
`
    : ''
}
    public void teslimEt() {
        Durak d = sec();
        kalan.remove(d);
${YURU}
    }

${sec}

${OZET}
}`;
  }

  // ---- kalıtım: her algoritma bir alt sınıf; kuryenin sınıfı yaratılınca belli olur
  const kalitimKurye = () => `import java.util.ArrayList;
import java.util.List;

${doc('Kalıtımla: her algoritma bir alt sınıf; sınıf, kurye yaratılırken seçilir.')}public abstract class Kurye {

${ALAN_KALAN('protected')}
    protected Konum konum = Konum.DEPO;
    private final int toplam;
    private int km;

    protected Kurye(List<Durak> duraklar) {
        this.kalan = new ArrayList<>(duraklar);
        this.toplam = duraklar.size();
    }

    protected abstract Durak sec();

    protected Durak enYakin(List<Durak> adaylar) {
${enYakinDongu('adaylar', 8)}
    }

    public void teslimEt() {
        Durak d = sec();
        kalan.remove(d);
${YURU}
    }

${OZET}
}`;
  const altSinif = (sinif, govde) => `import java.util.List;

public class ${sinif} extends Kurye {

    public ${sinif}(List<Durak> duraklar) {
        super(duraklar);
    }

    @Override
    protected Durak sec() {
${govde}
    }
}`;
  const KALITIM = {
    RandevuKuryesi: altSinif('RandevuKuryesi', '        return kalan.get(0);'),
    EnYakinKuryesi: altSinif('EnYakinKuryesi', '        return enYakin(kalan);'),
    SogukOnceKuryesi: altSinif(
      'SogukOnceKuryesi',
      `        List<Durak> soguklar = kalan.stream().filter(Durak::soguk).toList();
        return enYakin(soguklar.isEmpty() ? kalan : soguklar);`
    ),
  };

  // ---- Strategy: arayüz, somut stratejiler ve bağlam
  // o.mod: 'r1' (algoritmalar sınıflarda, kurye listenin kendisini veriyor) · 'r2' (salt okunur görünüm; SogukOnceRota
  //        hâlâ sıralamaya çalışıyor → UnsupportedOperationException) · 'temiz' (strateji yalnızca seçer)
  const belgeli = (o, text) => (o.belge ? doc(text) : '');
  const arayuzSrc = (o) => `import java.util.List;

${belgeli(o, 'Strateji: kalan duraklardan sıradakini seçer. Liste salt okunurdur.')}public interface RotaStratejisi {

    Durak sec(Konum konum, List<Durak> kalan);
}`;
  const stratejiSinifi = (o, sinif, belge, govde, ekler) => `${(ekler && ekler.imports) || ''}import java.util.List;

${belgeli(o, belge)}public class ${sinif} implements RotaStratejisi {
${(ekler && ekler.alan) || ''}
    @Override
    public Durak sec(Konum konum, List<Durak> kalan) {
${govde}
    }
}`;
  const randevuSrc = (o) => stratejiSinifi(o, 'RandevuRota', 'Randevu sırası: müşterilere söz verilen sıra. Kurye listeyi bu sırada tutar.', '        return kalan.get(0);');
  const enYakinSrc = (o) => stratejiSinifi(o, 'EnYakinRota', 'En yakın durak; eşitlikte randevusu önce olan.', enYakinDongu('kalan', 8));
  const sogukSrc = (o) =>
    o.mod === 'temiz'
      ? stratejiSinifi(
          o,
          'SogukOnceRota',
          'Soğuk zincir önce: önce soğuk zincirlilerin en yakını, sonra en yakın durak.',
          `        List<Durak> soguklar = kalan.stream().filter(Durak::soguk).toList();
        return enYakin.sec(konum, soguklar.isEmpty() ? kalan : soguklar);`,
          { alan: '\n    private final RotaStratejisi enYakin = new EnYakinRota();\n' }
        )
      : stratejiSinifi(
          o,
          'SogukOnceRota',
          'Soğuk zincir önce.',
          `        // soğuk zincirliler başa, sonra yakından uzağa
        kalan.sort(Comparator.comparing(Durak::soguk).reversed()
                .thenComparingInt(d -> konum.mesafe(d.konum())));
        return kalan.get(0);`,
          { imports: 'import java.util.Comparator;\n' }
        );
  const agirSrc = (o) =>
    stratejiSinifi(
      o,
      'AgirOnceRota',
      'Ağır önce: kamyoneti hafifletmek için önce en ağır koli.',
      `        Durak secilen = kalan.get(0);
        for (Durak d : kalan) {
            if (d.kg() > secilen.kg()) {
                secilen = d;
            }
        }
        return secilen;`
    );
  const planliSrc = (o) =>
    stratejiSinifi(
      o,
      'PlanliRota',
      'Planlı rota: planı ilk çağrıda bir kez çıkarır, sonra sırayla verir. Durum tutar!',
      `        if (plan.isEmpty()) {
            List<Durak> aday = new ArrayList<>(kalan);
            Konum k = konum;
            while (!aday.isEmpty()) {
                Durak d = enYakin.sec(k, aday);
                plan.add(d);
                aday.remove(d);
                k = d.konum();
            }
        }
        return plan.remove(0);`,
      {
        imports: 'import java.util.ArrayList;\n',
        alan: '\n' + cm('    private final List<Durak> plan = new ArrayList<>();', 'durum!', 1) + '\n    private final RotaStratejisi enYakin = new EnYakinRota();\n',
      }
    );

  function kuryeSrc(o) {
    const okunur = o.mod !== 'r1';
    return `import java.util.ArrayList;${okunur ? '\nimport java.util.Collections;' : ''}
import java.util.List;

${belgeli(o, 'Bağlam: durakları ve konumu tutar; sıradaki durağı strateji seçer.')}public class Kurye {

${ALAN_KALAN('private')}${okunur ? '\n' + cm('    private final List<Durak> okunur;', 'stratejinin gördüğü', 40) : ''}
    private final int toplam;
    private Konum konum = Konum.DEPO;
    private int km;
    private RotaStratejisi strateji;

    public Kurye(List<Durak> duraklar, RotaStratejisi strateji) {
        this.kalan = new ArrayList<>(duraklar);${okunur ? '\n        this.okunur = Collections.unmodifiableList(kalan);' : ''}
        this.toplam = duraklar.size();
        this.strateji = strateji;
    }

    public void setStrateji(RotaStratejisi strateji) {
        this.strateji = strateji;
    }

    public void teslimEt() {
        Durak d = strateji.sec(konum, ${okunur ? 'okunur' : 'kalan'});
        if (!kalan.remove(d)) {
            throw new IllegalStateException(d.no() + " bu kuryenin listesinde yok");
        }
${YURU}
    }

${OZET}
}`;
  }

  // ================================================================== programlar
  /**
   * Program: {tasarim: 'v1'|'v11'|'v2'|'kalitim'|'r1'|'r2'|'strateji', agir (Genişlet), ops: [istek]}
   *   v1, v11, v2: kalıpsız sürümler · kalitim: her algoritma bir Kurye alt sınıfı (değiştirilemez)
   *   r1: algoritmalar sınıflarda ama kurye listenin kendisini veriyor · r2: salt okunur görünüm · strateji: temiz
   */
  const NAIVE = ['v1', 'v11', 'v2'];
  const STRATEJI = ['r1', 'r2', 'strateji'];
  SG.naiveMi = (prog) => NAIVE.includes(prog.tasarim);
  SG.stratejiMi = (prog) => STRATEJI.includes(prog.tasarim);
  const modOf = (prog) => (prog.tasarim === 'strateji' ? 'temiz' : prog.tasarim);

  /** Kuryenin ilk algoritması: ilk istek bir seçimse o (kurucuda verilir), yoksa randevu sırası */
  const ilkAlgo = (prog) => (prog.ops.length && prog.ops[0].t === 'sec' ? prog.ops[0].v : 'RANDEVU');

  SG.mainFor = function (prog) {
    const t = prog.tasarim;
    const L = [];
    const ilk = prog.ops.length && prog.ops[0].t === 'sec';
    const a0 = ilkAlgo(prog);
    if (SG.naiveMi(prog)) {
      L.push('Kurye kurye = new Kurye(Durak.gunun());');
      if (ilk) L.push(`System.out.println("${SG.isaret(a0)}");`, `kurye.yontemSec("${SG.ALGO[a0].sabit}");`);
    } else {
      if (ilk) L.push(`System.out.println("${SG.isaret(a0)}");`);
      L.push(t === 'kalitim' ? `Kurye kurye = new ${SG.ALGO[a0].kalitim}(Durak.gunun());` : `Kurye kurye = new Kurye(Durak.gunun(), new ${SG.ALGO[a0].sinif}());`);
    }
    prog.ops.forEach((op, k) => {
      if (k === 0 && ilk) return;
      if (op.t === 'teslim') return L.push('kurye.teslimEt();');
      if (t === 'kalitim') return L.push(`// istek: ${SG.ALGO[op.v].ad.toLocaleLowerCase('tr')} (yolu yok)`);
      L.push(`System.out.println("${SG.isaret(op.v)}");`);
      L.push(SG.naiveMi(prog) ? `kurye.yontemSec("${SG.ALGO[op.v].sabit}");` : `kurye.setStrateji(new ${SG.ALGO[op.v].sinif}());`);
    });
    L.push('System.out.println(kurye.ozet());');
    return `public class Main {

    public static void main(String[] args) {
${L.map((l) => '        ' + l).join('\n')}
    }
}`;
  };

  /** Programın bütün dosyaları (resmî sürümler açıklamalı, ara adımlar açıklamasız) */
  SG.filesFor = function (prog) {
    const t = prog.tasarim;
    const F = { Main: SG.mainFor(prog) };
    if (SG.naiveMi(prog)) F.Kurye = naiveKurye(t);
    else if (t === 'kalitim') {
      F.Kurye = kalitimKurye();
      Object.assign(F, KALITIM);
    } else {
      const o = { mod: modOf(prog), belge: t === 'strateji' };
      F.Kurye = kuryeSrc(o);
      F.RotaStratejisi = arayuzSrc(o);
      F.RandevuRota = randevuSrc(o);
      F.EnYakinRota = enYakinSrc(o);
      F.SogukOnceRota = sogukSrc(o);
      if (prog.agir) F.AgirOnceRota = agirSrc(o);
    }
    F.Durak = code.Durak;
    F.Konum = code.Konum;
    return F;
  };
  SG.fileOrder = ['Main', 'Kurye', 'RotaStratejisi', 'RandevuRota', 'EnYakinRota', 'SogukOnceRota', 'AgirOnceRota', 'PlanliRota', 'RandevuKuryesi', 'EnYakinKuryesi', 'SogukOnceKuryesi', 'Durak', 'Konum'];
  SG.fileList = (F, order) => (order || SG.fileOrder).filter((n) => F[n]).map((n) => ({ name: n + '.java', code: F[n] }));

  /** Koddan: Kurye sınıfının içindeki algoritma dalları (yontem.equals) */
  SG.kuryeDallari = (F) => (F.Kurye.match(/yontem\.equals\("/g) || []).length;
  /** Koddan: kuryenin listesini yerinde sıralayan sınıflar */
  SG.listeyiDegistiren = (F) => Object.keys(F).filter((n) => /kalan\.sort\(/.test(F[n]));
  /** Koddan: Kurye.java’nın adıyla tanıdığı somut stratejiler */
  SG.kuryeninTanidigi = (F) => SG.ALGO_SIRA.map((a) => SG.ALGO[a].sinif).filter((s) => new RegExp('\\b' + s + '\\b').test(F.Kurye));

  // ================================================================== çalıştırma benzetimi (Java ile birebir)
  /** JDK 21: Collections$UnmodifiableList.sort satırı (gerçek çalıştırmadan) */
  SG.JDK_SORT = 'Collections.java:1524';
  /**
   * İstekleri sırayla oynatır.
   * Dönüş: {lines, olaylar, son}
   *   lines  : [{t, k: 'sec'|'teslim'|'ozet'|'hata'|'iz', i}]
   *   olaylar: {e, i, n, s, ...} — e: 'kur'|'sec'|'sirala'|'teslim'|'cokus'|'ozet'
   *   s (anlık durum): {kalan: [no] (listenin sırası), teslim: [no], konum, km, istenen, aktif, bacaklar, yanlisAdim, reddedilen}
   */
  SG.run = function (prog) {
    const t = prog.tasarim;
    const yerinde = t === 'v2' || t === 'r1';
    const cokertir = t === 'r2';
    const lines = [];
    const olaylar = [];
    let kalan = SG.DURAKLAR.slice();
    let konum = { x: SG.DEPO.x, y: SG.DEPO.y };
    let km = 0;
    let istenen = ilkAlgo(prog);
    let aktif = istenen;
    const teslim = [];
    const bacaklar = [];
    let yanlisAdim = 0;
    let reddedilen = 0;
    let cokus = false;
    let i = -1;
    const kopya = () => ({
      kalan: kalan.map((d) => d.no),
      teslim: teslim.slice(),
      konum: { x: konum.x, y: konum.y },
      km,
      istenen,
      aktif,
      bacaklar: bacaklar.slice(),
      yanlisAdim,
      reddedilen,
    });
    const out = (tx, k) => lines.push({ t: tx, k, i });
    const olay = (e, x) => olaylar.push(Object.assign({ e, i, n: lines.length }, x || {}, { s: kopya() }));

    olay('kur');
    for (let k = 0; k < prog.ops.length && !cokus; k++) {
      i = k;
      const op = prog.ops[k];
      if (op.t === 'sec') {
        if (k === 0) {
          out(SG.isaret(op.v), 'sec');
          olay('sec', { v: op.v, ok: true, ilk: true });
          continue;
        }
        istenen = op.v;
        if (t === 'kalitim') {
          if (op.v !== aktif) reddedilen++;
          olay('sec', { v: op.v, ok: op.v === aktif, reddedildi: op.v !== aktif });
          continue;
        }
        aktif = op.v;
        out(SG.isaret(op.v), 'sec');
        olay('sec', { v: op.v, ok: true });
        continue;
      }
      // teslim: algoritma sıradaki durağı seçer
      const beklenen = SG.dogruSecim(istenen, konum, kalan);
      let secilen;
      if (aktif === 'RANDEVU') secilen = kalan[0];
      else if (aktif === 'EN_YAKIN') secilen = ilkEnYakin(konum, kalan);
      else if (aktif === 'AGIR') secilen = ilkEnAgir(kalan);
      else if (cokertir) {
        cokus = true;
        olay('cokus', { neden: 'sort' });
        break;
      } else if (yerinde) {
        const once = kalan.map((d) => d.no);
        const kk = konum;
        kalan.sort((a, b) => (b.soguk - a.soguk) || SG.mesafe(kk, a) - SG.mesafe(kk, b));
        const sonra = kalan.map((d) => d.no);
        if (once.join() !== sonra.join()) olay('sirala', { once, sonra });
        secilen = kalan[0];
      } else {
        const soguk = kalan.filter((d) => d.soguk);
        secilen = ilkEnYakin(konum, soguk.length ? soguk : kalan);
      }
      const yanlis = secilen !== beklenen;
      if (yanlis) yanlisAdim++;
      const yol = SG.mesafe(konum, secilen);
      bacaklar.push({ from: { x: konum.x, y: konum.y }, to: { x: secilen.x, y: secilen.y }, no: secilen.no, yol, yanlis, algo: aktif });
      km += yol;
      konum = { x: secilen.x, y: secilen.y };
      kalan = kalan.filter((d) => d !== secilen);
      teslim.push(secilen.no);
      out(`→ ${SG.etiket(secilen)} · ${yol} km`, 'teslim');
      olay('teslim', { no: secilen.no, yol, yanlis, beklenen: beklenen.no, algo: aktif });
    }
    if (cokus) {
      out('Exception in thread "main" java.lang.UnsupportedOperationException', 'hata');
      SG.cokusIzi(prog).forEach((l) => out(l, 'iz'));
    } else {
      i = -1;
      out(`Gün sonu: ${teslim.length}/${SG.DURAKLAR.length} teslimat · ${km} km`, 'ozet');
      olay('ozet');
    }
    const son = olaylar[olaylar.length - 1].s;
    son.cokus = cokus;
    return { lines, olaylar, son };
  };
  SG.outputOf = (prog) => SG.run(prog).lines.map((l) => l.t);

  /** Adım 2’deki çöküşün yığın izi (uygulamadaki dosyalara göre; pkg verilirse dışa aktarılmış paket, satırlar +3) */
  SG.cokusIzi = function (prog, pkg) {
    const F = SG.filesFor(prog);
    const pk = pkg ? pkg + '.' : '';
    const kay = pkg ? 3 : 0;
    const mainSatir = SG.lineOf(F.Main, 'kurye.teslimEt();') + kay;
    return [
      `\tat java.base/java.util.Collections$UnmodifiableList.sort(${SG.JDK_SORT})`,
      `\tat ${pk}SogukOnceRota.sec(SogukOnceRota.java:${SG.lineOf(F.SogukOnceRota, 'kalan.sort(') + kay})`,
      `\tat ${pk}Kurye.teslimEt(Kurye.java:${SG.lineOf(F.Kurye, 'Durak d = strateji.sec(') + kay})`,
      `\tat ${pk}Main.main(Main.java:${mainSatir})`,
    ];
  };

  // ================================================================== "Sorun" sürümleri
  /** Ana gün: sabah soğuk zincirliler, öğleden sonra randevu sırası */
  SG.ANA = [S('SOGUK'), T(), T(), S('RANDEVU'), T(), T(), T(), T()];
  SG.NV = {
    v1: { tasarim: 'v1', ops: T6() },
    v11: { tasarim: 'v11', ops: [S('EN_YAKIN'), T(), T(), S('RANDEVU'), T(), T(), T(), T()] },
    v2: { tasarim: 'v2', ops: SG.ANA },
  };
  SG.naiveFiles = (v) => SG.filesFor(SG.NV[v]);

  // ================================================================== çözüm ve adım adım yeniden düzenleme
  SG.COZUM = { tasarim: 'strateji', ops: SG.ANA };
  code.Main = SG.mainFor(SG.COZUM);
  SG.output = SG.outputOf(SG.COZUM);
  const progR = (t) => ({ tasarim: t, ops: SG.ANA });
  SG.refactorProgs = [SG.NV.v2, progR('r1'), progR('r2'), SG.COZUM];
  SG.refactor = SG.refactorProgs.map((p, k) => {
    const F = SG.filesFor(p);
    if (k === 3) Object.keys(F).forEach((n) => (F[n] = plain(F[n])));
    return F;
  });
  SG.refactorOrder = ['Main', 'Kurye', 'RotaStratejisi', 'RandevuRota', 'EnYakinRota', 'SogukOnceRota', 'Durak', 'Konum'];

  // ================================================================== Canlı Akış
  SG.presets = {
    gun: { key: 'gun', title: 'Soğuk zincir, sonra randevu', prog: SG.COZUM },
    yakin: { key: 'yakin', title: 'Randevusuz gün', prog: { tasarim: 'strateji', ops: [S('EN_YAKIN')].concat(T6()) } },
  };
  SG.presetOrder = ['gun', 'yakin'];
  SG.akisFiles = (p) => SG.fileList(SG.filesFor(p.prog));
  SG.akisOutput = (p) => SG.outputOf(p.prog);

  // ================================================================== Rota tezgâhı
  SG.TEZGAH_ANA = SG.ANA;
  SG.TEZGAH_YAKIN = SG.NV.v11.ops;
  SG.ISTEK_EN_COK = 14;
  SG.TASARIMLAR = ['v2', 'kalitim', 'strateji'];
  /** Oturum: {design: 'v2'|'kalitim'|'strateji', ops, agir (yalnızca Strategy, Genişlet’ten sonra)} */
  SG.tezgahProg = (tz) => ({ tasarim: tz.design, ops: tz.ops, agir: tz.design === 'strateji' && !!tz.agir });
  SG.tezgahFiles = (tz) => SG.filesFor(SG.tezgahProg(tz));
  SG.teslimSayisi = (ops) => ops.filter((op) => op.t === 'teslim').length;
  SG.uygun = function (tz, op) {
    if (tz.ops.length >= SG.ISTEK_EN_COK) return false;
    if (op.t === 'teslim') return SG.teslimSayisi(tz.ops) < SG.DURAKLAR.length;
    if (op.v === 'AGIR') return tz.design === 'strateji' && !!tz.agir;
    return true;
  };
  SG.olc = function (tz) {
    const prog = SG.tezgahProg(tz);
    const r = SG.run(prog);
    return {
      run: r,
      islem: tz.ops.length,
      teslim: r.son.teslim.length,
      km: r.son.km,
      yanlisAdim: r.son.yanlisAdim,
      reddedilen: r.son.reddedilen,
    };
  };

  // ================================================================== Genişlet: yeni strateji (AgirOnceRota)
  const EX = (SG.ext = {});
  EX.exercise = `public class AgirOnceRota implements ⟦1⟧ {

    @Override
    public Durak ⟦2⟧(Konum konum, List<Durak> kalan) {
        Durak secilen = kalan.get(0);
        for (Durak d : kalan) {
            if (d.⟦3⟧() > secilen.kg()) {
                secilen = d;
            }
        }
        return secilen;
    }
}`;
  EX.exerciseMain = `// Main.java: öğleden sonra
kurye.setStrateji(new ⟦4⟧());`;
  EX.answers = { 1: 'RotaStratejisi', 2: 'sec', 3: 'kg', 4: 'AgirOnceRota' };
  EX.prog = { tasarim: 'strateji', agir: true, ops: [S('SOGUK'), T(), T(), S('AGIR'), T(), T(), T(), T()] };
  EX.Main = SG.mainFor(EX.prog);
  EX.output = SG.outputOf(EX.prog);

  // ================================================================== Yapı: durum tutan stratejiyi iki kurye paylaşırsa
  /** 'paylasim': iki kurye aynı PlanliRota nesnesini kullanır · 'duzeltme': her kuryeye kendi nesnesi */
  SG.TUZAK_SIRA = ['paylasim', 'duzeltme'];
  SG.tuzakFiles = function (tur) {
    const o = { mod: 'temiz', belge: true };
    const paylasim = tur === 'paylasim';
    const Main = `import java.util.List;

public class Main {

    public static void main(String[] args) {
        List<Durak> gun = Durak.gunun();
${
  paylasim
    ? `${cm('        RotaStratejisi planli = new PlanliRota();', '“bir tane yeter”', 1)}
        Kurye kurye1 = new Kurye(gun.subList(0, 3), planli);
        Kurye kurye2 = new Kurye(gun.subList(3, 6), planli);`
    : `        Kurye kurye1 = new Kurye(gun.subList(0, 3), new PlanliRota());
        Kurye kurye2 = new Kurye(gun.subList(3, 6), new PlanliRota());`
}
        System.out.println("— 1. kurye —");
        kurye1.teslimEt();
        System.out.println("— 2. kurye —");
        kurye2.teslimEt();
        System.out.println("— 1. kurye —");
        kurye1.teslimEt();
    }
}`;
    return {
      Main,
      Kurye: kuryeSrc(o),
      RotaStratejisi: arayuzSrc(o),
      EnYakinRota: enYakinSrc(o),
      PlanliRota: planliSrc(o),
      Durak: code.Durak,
      Konum: code.Konum,
    };
  };
  /** Tuzak programlarının çıktısı (benzetim): her kuryenin kendi listesi; paylaşımda plan ilk kuryenin listesinden */
  SG.tuzakCikti = function (tur, pkg) {
    const L1 = SG.DURAKLAR.slice(0, 3);
    const L2 = SG.DURAKLAR.slice(3, 6);
    const planOf = (L) => {
      const plan = [];
      let aday = L.slice();
      let k = SG.DEPO;
      while (aday.length) {
        const d = ilkEnYakin(k, aday);
        plan.push(d);
        aday = aday.filter((x) => x !== d);
        k = d;
      }
      return plan;
    };
    const kuryeler = [{ kalan: L1.slice(), konum: SG.DEPO }, { kalan: L2.slice(), konum: SG.DEPO }];
    const planlar = tur === 'paylasim' ? [null, null] : [planOf(L1), planOf(L2)];
    let ortak = null;
    const out = [];
    const F = SG.tuzakFiles(tur);
    const kay = pkg ? 3 : 0;
    const pk = pkg ? pkg + '.' : '';
    const sira = [0, 1, 0];
    for (let j = 0; j < sira.length; j++) {
      const n = sira[j];
      const ku = kuryeler[n];
      out.push(`— ${n + 1}. kurye —`);
      let d;
      if (tur === 'paylasim') {
        if (!ortak) ortak = planOf(ku.kalan);
        d = ortak.shift();
      } else d = planlar[n].shift();
      if (!ku.kalan.includes(d)) {
        out.push(`Exception in thread "main" java.lang.IllegalStateException: ${d.no} bu kuryenin listesinde yok`);
        out.push(`\tat ${pk}Kurye.teslimEt(Kurye.java:${SG.lineOf(F.Kurye, 'throw new IllegalStateException(') + kay})`);
        let m = 0;
        for (let q = 0; q <= j; q++) m = SG.lineOf(F.Main, `kurye${sira[q] + 1}.teslimEt();`, m);
        out.push(`\tat ${pk}Main.main(Main.java:${m + kay})`);
        return out;
      }
      const yol = SG.mesafe(ku.konum, d);
      ku.kalan = ku.kalan.filter((x) => x !== d);
      ku.konum = d;
      out.push(`→ ${SG.etiket(d)} · ${yol} km`);
    }
    return out;
  };

  // ================================================================== Gerçek dünya (JDK) örnekleri
  const RW = (SG.rw = {});
  const sArg = (stmt, comment) => cm('        ' + stmt, comment, 50).slice(8);

  RW.siralama = (arg) => `import java.text.Collator;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

public class Siralama {

    record Koli(String alici, int kg) {}

    public static void main(String[] args) {
        List<Koli> koliler = new ArrayList<>(List.of(
                new Koli("Zeynep", 1), new Koli("Çağla", 7),
                new Koli("Ömer", 25), new Koli("Can", 4)));
        Collator tr = Collator.getInstance(Locale.forLanguageTag("tr-TR"));
        ${arg}
        for (Koli k : koliler) {
            System.out.println(k.alici() + " · " + k.kg() + " kg");
        }
    }
}`;
  RW.siralamaOpts = [
    { label: 'Ada göre', arg: 'koliler.sort(Comparator.comparing(Koli::alici));', out: ['Can · 4 kg', 'Zeynep · 1 kg', 'Çağla · 7 kg', 'Ömer · 25 kg'] },
    { label: 'Ada göre (Türkçe)', arg: 'koliler.sort(Comparator.comparing(Koli::alici, tr));', out: ['Can · 4 kg', 'Çağla · 7 kg', 'Ömer · 25 kg', 'Zeynep · 1 kg'] },
    { label: 'Ağır önce', arg: 'koliler.sort(Comparator.comparingInt(Koli::kg).reversed());', out: ['Ömer · 25 kg', 'Çağla · 7 kg', 'Can · 4 kg', 'Zeynep · 1 kg'] },
  ];

  RW.rampa = (arg) => `import static java.util.concurrent.TimeUnit.SECONDS;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.ThreadPoolExecutor.*;

public class Rampa {

    public static void main(String[] args) throws InterruptedException {
        CountDownLatch forklift = new CountDownLatch(1);
        // 1 forklift (iş parçacığı), 1 palet bekleme yeri
        var bekleme = new ArrayBlockingQueue<Runnable>(1);
        var rampa = new ThreadPoolExecutor(1, 1, 0, SECONDS, bekleme);
        ${arg}
        rampa.execute(() -> yukle(1, forklift));
        rampa.execute(() -> yukle(2, null));
        try {
            rampa.execute(() -> yukle(3, null));
        } catch (RejectedExecutionException e) {
            System.out.println("palet 3 reddedildi");
        }
        forklift.countDown();
        rampa.shutdown();
        rampa.awaitTermination(5, SECONDS);
    }

    static void yukle(int palet, CountDownLatch bekle) {
        try {
            if (bekle != null) {
                bekle.await();
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        String kim = Thread.currentThread().getName();
        System.out.println("palet " + palet + " yüklendi · " + kim);
    }
}`;
  const pol = (p) => `rampa.setRejectedExecutionHandler(new ${p}());`;
  RW.rampaOpts = [
    { label: 'AbortPolicy', arg: pol('AbortPolicy'), out: ['palet 3 reddedildi', 'palet 1 yüklendi · pool-1-thread-1', 'palet 2 yüklendi · pool-1-thread-1'] },
    { label: 'CallerRunsPolicy', arg: pol('CallerRunsPolicy'), out: ['palet 3 yüklendi · main', 'palet 1 yüklendi · pool-1-thread-1', 'palet 2 yüklendi · pool-1-thread-1'] },
    { label: 'DiscardPolicy', arg: pol('DiscardPolicy'), out: ['palet 1 yüklendi · pool-1-thread-1', 'palet 2 yüklendi · pool-1-thread-1'] },
    { label: 'DiscardOldestPolicy', arg: pol('DiscardOldestPolicy'), out: ['palet 1 yüklendi · pool-1-thread-1', 'palet 3 yüklendi · pool-1-thread-1'] },
  ];

  RW.raf = (arg) => `import java.awt.Component;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.GridLayout;
import javax.swing.JPanel;

public class Raf {

    public static void main(String[] args) {
${cm('        JPanel raf = new JPanel();', 'bağlam', 50)}
        ${arg}
        for (int kg : new int[] {25, 9, 4, 3}) {
            JPanel koli = new JPanel();
            koli.setName(kg + " kg");
            koli.setPreferredSize(new Dimension(20 + 4 * kg, 30));
            raf.add(koli);
        }
        raf.setSize(220, 120);
        raf.doLayout();
        for (Component c : raf.getComponents()) {
            System.out.println(c.getName() + ": x=" + c.getX() + " y=" + c.getY()
                    + " en=" + c.getWidth() + " boy=" + c.getHeight());
        }
    }
}`;
  RW.rafOpts = [
    { label: 'FlowLayout', arg: sArg('raf.setLayout(new FlowLayout());', 'yan yana'), out: ['25 kg: x=19 y=5 en=120 boy=30', '9 kg: x=144 y=5 en=56 boy=30', '4 kg: x=73 y=40 en=36 boy=30', '3 kg: x=114 y=40 en=32 boy=30'] },
    { label: 'GridLayout(2, 2)', arg: sArg('raf.setLayout(new GridLayout(2, 2));', 'eşit hücreler'), out: ['25 kg: x=0 y=0 en=110 boy=60', '9 kg: x=110 y=0 en=110 boy=60', '4 kg: x=0 y=60 en=110 boy=60', '3 kg: x=110 y=60 en=110 boy=60'] },
    { label: 'GridLayout(4, 1)', arg: sArg('raf.setLayout(new GridLayout(4, 1));', 'üst üste'), out: ['25 kg: x=0 y=0 en=220 boy=30', '9 kg: x=0 y=30 en=220 boy=30', '4 kg: x=0 y=60 en=220 boy=30', '3 kg: x=0 y=90 en=220 boy=30'] },
  ];

  // ================================================================== UML sınıf diyagramları
  const Mb = {
    secY: { id: 'sec', text: '+ sec(konum, kalan): Durak', generic: '+ algorithmInterface()', factory: true, abstract: true },
    secS: { id: 'sec', text: '+ sec(konum, kalan): Durak', generic: '+ algorithmInterface()', factory: true },
    kalan: { id: 'kalan', text: '- kalan, okunur: List<Durak>', generic: '- data' },
    strateji: { id: 'strateji', text: '- strateji: RotaStratejisi', generic: '- strategy: Strategy' },
    setStrateji: { id: 'setStrateji', text: '+ setStrateji(s)', generic: '+ setStrategy(s)' },
    teslimEt: { id: 'teslimEt', text: '+ teslimEt()', generic: '+ contextInterface()' },
    ozet: { id: 'ozet', text: '+ ozet(): String', generic: '+ result()' },
    enYakin: { id: 'enYakin', text: '- enYakin: RotaStratejisi', generic: '- helper' },
  };
  SG.members = Mb;
  const SOMUT = ['RandevuRota', 'EnYakinRota', 'SogukOnceRota'];
  const SOMUT_W = { RandevuRota: 240, EnYakinRota: 240, SogukOnceRota: 264, AgirOnceRota: 240 };
  const box = {
    Main: (x, y) => ({ id: 'Main', name: 'Main', generic: 'Client', kind: 'class', role: 'client', x, y, w: 200, members: [{ id: 'main', text: '+ main(args)', generic: '+ main()' }] }),
    Kurye: (x, y) => ({ id: 'Kurye', name: 'Kurye', generic: 'Context', kind: 'class', role: 'context', x, y, w: 300, members: [Mb.kalan, Mb.strateji, Mb.setStrateji, Mb.teslimEt, Mb.ozet] }),
    Arayuz: (x, y) => ({ id: 'RotaStratejisi', name: 'RotaStratejisi', generic: 'Strategy', kind: 'interface', role: 'strategy', x, y, w: 300, members: [Mb.secY] }),
    somut: (sinif, x, y, o) => ({
      id: sinif,
      name: sinif,
      generic: 'ConcreteStrategy' + 'ABCD'[SOMUT.concat(['AgirOnceRota']).indexOf(sinif)],
      kind: 'class',
      role: 'concreteStrategy',
      x,
      y,
      w: SOMUT_W[sinif],
      noTag: !!(o && o.noTag),
      members: sinif === 'SogukOnceRota' ? [Mb.enYakin, Mb.secS] : [Mb.secS],
    }),
  };
  SG.box = box;

  /** GoF yapısı (Yapı sahnesi, Canlı Akış, özet). o.notes: delege ve seçim notları */
  SG.gofDiagram = function (o) {
    o = o || {};
    const classes = [box.Kurye(20, 40), box.Arayuz(560, 40), box.Main(20, 420)];
    let x = 400;
    const xs = {};
    SOMUT.forEach((s, k) => {
      xs[s] = x;
      classes.push(box.somut(s, x, 250, { noTag: k > 0 }));
      x += SOMUT_W[s] + 16;
    });
    const relations = [
      { id: 'strateji', from: 'Kurye', to: 'RotaStratejisi', type: 'aggregation', label: 'strateji', genericLabel: 'strategy', fromSide: 'right', fromAt: 90, toSide: 'left', toAt: 90 },
      { id: 'c-kurye', from: 'Main', to: 'Kurye', type: 'dependency', label: '«create»', fromSide: 'top', fromAt: 60, toSide: 'bottom', toAt: 60 },
      { id: 'c-somut', from: 'Main', to: 'RandevuRota', type: 'dependency', label: '«create»', fromSide: 'right', fromAt: 460, toSide: 'bottom', toAt: xs.RandevuRota + 120, points: [[xs.RandevuRota + 120, 460]] },
    ];
    SOMUT.forEach((s) => {
      const cx = xs[s] + SOMUT_W[s] / 2;
      relations.push({ id: 'r-' + s, from: s, to: 'RotaStratejisi', type: 'realization', fromSide: 'top', fromAt: cx, toSide: 'bottom', toAt: 710, mid: 205 });
    });
    const notes = o.notes
      ? [
          { id: 'n-delege', x: 334, y: 116, text: 'teslimEt():\nd = strateji.sec(konum, okunur)\nliste salt okunur', genericText: 'contextInterface():\nstrategy.algorithmInterface()', target: 'Kurye', from: 'left', to: 'right', toAt: 150 },
          { id: 'n-lambda', x: 880, y: 52, text: 'tek yöntemli arayüz:\nlambda ile de yazılabilir', genericText: 'one method only:\na lambda can implement it', target: 'RotaStratejisi', from: 'left', to: 'right', toAt: 80 },
        ]
      : [];
    return { width: 1190, height: 540, title: 'Strategy sınıf diyagramı', classes, relations, notes };
  };

  // ------------------------------------------------------------------ UML sıralama diyagramı (Canlı Akış)
  /**
   * Her istek kendi küçük diyagramıdır (bölüm): Main, kurye, o anki strateji nesnesi (ve SogukOnceRota’nın içindeki
   * enYakin). Dönüş: {bolumler: [{spec, msgOf, baslik}], run}
   */
  SG.seqSpec = function (p) {
    const prog = p.prog;
    const r = SG.run(prog);
    const bolumler = [];
    const W = 940;
    const rowH = 32;
    const parts = (algo) => {
      const ps = [
        { id: 'main', label: 'Main', role: 'client' },
        { id: 'kurye', label: 'kurye\n: Kurye', role: 'context', object: true },
        { id: 'strateji', label: `s\n: ${SG.ALGO[algo].sinif}`, role: 'concreteStrategy', object: true },
      ];
      if (algo === 'SOGUK') ps.push({ id: 'ic', label: 'enYakin\n: EnYakinRota', role: 'concreteStrategy', object: true });
      const xs = ps.length === 4 ? [80, 330, 590, 840] : [100, 440, 800];
      ps.forEach((pp, k) => (pp.x = xs[k]));
      return ps;
    };
    const yap = (algo, messages, msgOf, baslik) => {
      const h = 118 + messages.length * rowH + 40;
      return { spec: { width: W, height: Math.max(h, 300), top: 118, margin: 60, rowH, participants: parts(algo), messages, initialActive: ['main'] }, msgOf, baslik, algo };
    };
    const O = r.olaylar;
    // kurulum: strateji nesnesi ve kurye
    {
      const a0 = ilkAlgo(prog);
      const messages = [{ from: 'main', to: 'strateji', kind: 'create', label: '«create»' }];
      const msgOf = { strateji: 0 };
      if (a0 === 'SOGUK') {
        msgOf.ic = messages.length;
        messages.push({ from: 'strateji', to: 'ic', kind: 'create', label: '«create»' });
      }
      msgOf.kurye = messages.length;
      messages.push({ from: 'main', to: 'kurye', kind: 'create', label: '«create» (gunun(), s)' });
      bolumler.push(yap(a0, messages, msgOf, 'Kurulum · new Kurye(Durak.gunun(), new ' + SG.ALGO[a0].sinif + '())'));
    }
    prog.ops.forEach((op, k) => {
      if (k === 0 && op.t === 'sec') return;
      const Ok = O.filter((x) => x.i === k);
      const messages = [];
      const msgOf = {};
      const add = (key, m) => {
        msgOf[key] = messages.length;
        messages.push(m);
      };
      if (op.t === 'sec') {
        const sinif = SG.ALGO[op.v].sinif;
        add('yeni', { from: 'main', to: 'strateji', kind: 'create', label: '«create»' });
        if (op.v === 'SOGUK') add('ic', { from: 'strateji', to: 'ic', kind: 'create', label: '«create»' });
        add('set', { from: 'main', to: 'kurye', kind: 'call', label: 'setStrateji(s)' });
        add('ret', { from: 'kurye', to: 'main', kind: 'return', label: '' });
        bolumler.push(yap(op.v, messages, msgOf, `${k + 1}. istek · setStrateji(new ${sinif}())`));
        return;
      }
      const tes = Ok.find((x) => x.e === 'teslim');
      const algo = tes.algo;
      const d = SG.durak(tes.no);
      // isteğin hemen öncesindeki durum (özet olayının da i’si -1: sıraya göre bul)
      const once = O[O.findIndex((x) => x.i === k) - 1].s;
      add('istek', { from: 'main', to: 'kurye', kind: 'call', label: 'teslimEt()' });
      add('sec', { from: 'kurye', to: 'strateji', kind: 'call', label: 'sec(konum, okunur)' });
      if (algo === 'SOGUK') {
        const soguk = once.kalan.map(SG.durak).filter((x) => x.soguk);
        add('suz', { from: 'strateji', to: 'strateji', kind: 'self', short: true, label: soguk.length ? `soğuk zincirliler: ${soguk.length}` : 'soğuk zincirli yok → bütün liste' });
        add('ic', { from: 'strateji', to: 'ic', kind: 'call', label: `sec(konum, ${soguk.length ? 'soguklar' : 'kalan'})` });
        add('icret', { from: 'ic', to: 'strateji', kind: 'return', label: d.no });
      } else if (algo === 'EN_YAKIN') add('ara', { from: 'strateji', to: 'strateji', kind: 'self', short: true, label: `en yakını ara → ${tes.yol} km` });
      else if (algo === 'AGIR') add('ara', { from: 'strateji', to: 'strateji', kind: 'self', short: true, label: `en ağırı ara → ${d.kg} kg` });
      else add('ara', { from: 'strateji', to: 'strateji', kind: 'self', short: true, label: 'kalan.get(0)' });
      add('secret', { from: 'strateji', to: 'kurye', kind: 'return', label: d.no });
      add('yuru', { from: 'kurye', to: 'kurye', kind: 'self', short: true, label: `remove(d) · +${tes.yol} km` });
      add('ret', { from: 'kurye', to: 'main', kind: 'return', label: '' });
      bolumler.push(yap(algo, messages, msgOf, `${k + 1}. istek · teslimEt() → ${d.no}`));
    });
    const sonAlgo = r.son.aktif;
    bolumler.push(yap(sonAlgo, [{ from: 'main', to: 'kurye', kind: 'call', label: 'ozet()' }, { from: 'kurye', to: 'main', kind: 'return', label: '"Gün sonu: …"' }], { ozet: 0, ret: 1 }, 'Sonuç · ozet()'));
    return { bolumler, run: r };
  };
})();
