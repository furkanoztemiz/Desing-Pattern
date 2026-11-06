/*
 * Chain of Responsibility — veri: Java kodları, çıktılar, roller, diyagram tanımları.
 * Bu dosya DOM kullanmaz; tools/export-java.js de Java dosyalarını buradan üretir.
 *
 * Senaryo (lojistik dünyasının devamı): Kurye kapıda. Alıcı evde değilse komşuya, olmazsa akıllı dolaba, o da olmazsa
 * şubeye bırakır; şube de almazsa gönderi göndericiye döner. Kalıpsız çözümde bütün seçenekler ve sıraları kuryenin
 * içindeki tek bir if/else merdiveninde: her koşul, öncekilerin tutmadığını VARSAYIYOR (soğuk zincir dalı erken
 * geldiği için sonraki dallar "soğuk değil" kabul ediyor). İstanbul, apartmanlar yüzünden dolabı öne almak isteyince
 * merdiven kopyalanıp yeniden sıralanıyor: gizli varsayım bozuluyor, Zeynep'in ilacı akıllı dolaba bırakılıyor.
 * Chain of Responsibility: her seçenek kendi kuralını eksiksiz bilen bir halka (TeslimatAdimi); halka işleyemezse
 * isteği sonrakine iletir. Kurye yalnızca zincirin başını tanır; sırayı Main kurar, bölgeye göre değiştirmek güvenli.
 */
(function () {
  'use strict';
  const DP = (window.DP = window.DP || {});
  const CR = (DP.cr = DP.cr || {});

  // ------------------------------------------------------------------ roller
  CR.roles = {
    client: { en: 'Client', tr: 'İstemci', color: 1 },
    handler: { en: 'Handler', tr: 'İşleyici (soyut halka)', color: 2 },
    concreteHandler: { en: 'ConcreteHandler', tr: 'Somut işleyici', color: 4 },
  };

  CR.classRoles = {
    Main: 'client',
    Kurye: 'client',
    IstanbulKuryesi: 'client',
    TeslimatAdimi: 'handler',
    AliciyaTeslim: 'concreteHandler',
    KomsuyaTeslim: 'concreteHandler',
    DolabaTeslim: 'concreteHandler',
    SubeyeTeslim: 'concreteHandler',
    GondericiyeIade: 'concreteHandler',
    MarketeTeslim: 'concreteHandler',
    // GoF genel adları
    Client: 'client',
    Handler: 'handler',
    ConcreteHandler: 'concreteHandler',
  };

  CR.roleOf = function (name) {
    const r = CR.classRoles[name];
    return r ? CR.roles[r].color : null;
  };

  // `sonraki` = halkanın ardılı: isteğin iletildiği bağ (kodda ayrıca vurgulanır)
  CR.special = { sonraki: 'chn' };

  /** 1 tabanlı satır numarası. */
  CR.lineOf = function (src, needle, from) {
    const lines = src.split('\n');
    for (let i = from || 0; i < lines.length; i++) if (lines[i].includes(needle)) return i + 1;
    return 0;
  };

  /** Satırın sonuna, belirli bir sütundan başlayan yorum ekler (satır uzunsa en az iki boşluk). */
  const cm = (line, comment, col) => line.padEnd(Math.max(col || 56, line.length + 2)) + '// ' + comment;
  const doc = (text) => `/**\n * ${text}\n */\n`;
  const plain = (src) => src.replace(/^((?:import [^\n]+\n)*\n?)\/\*\*[\s\S]*?\*\/\n/, '$1');
  CR.plain = plain;

  const code = (CR.code = {});

  // ================================================================== model (Java ile birebir)
  /** Kapıdaki durum */
  CR.KAPI = {
    ALICI_EVDE: { key: 'ALICI_EVDE', t: 'alıcı evde' },
    KOMSU_EVDE: { key: 'KOMSU_EVDE', t: 'komşu evde' },
    KIMSE_YOK: { key: 'KIMSE_YOK', t: 'kimse yok' },
  };
  /** Günün gönderileri (Gunluk.java ile birebir) */
  const G = (no, alici, kg, soguk, kapi) => ({ no, alici, kg, soguk, kapi });
  CR.GUNLUK = [
    G('KRG-1001', 'Ali Şahin', 3, false, 'ALICI_EVDE'),
    G('KRG-1002', 'Ayşe Yılmaz', 2, false, 'KOMSU_EVDE'),
    G('KRG-1003', 'Zeynep Güneş', 1, true, 'KOMSU_EVDE'),
    G('KRG-1004', 'Can Demir', 4, false, 'KIMSE_YOK'),
    G('KRG-1005', 'Selin Aydın', 9, false, 'KIMSE_YOK'),
    G('KRG-1006', 'Mert Kaya', 25, false, 'KIMSE_YOK'),
  ];
  CR.etiket = (g) => `${g.no} ${g.alici} · ${g.kg} kg${g.soguk ? ' · soğuk zincir' : ''} · ${CR.KAPI[g.kapi].t}`;

  /** Halkalar: ad, kural (Java ile birebir) ve kuralın Türkçesi */
  CR.HALKA = {
    alici: { key: 'alici', cls: 'AliciyaTeslim', ad: 'Alıcı', kural: 'g.kapi() == Kapi.ALICI_EVDE', tr: 'alıcı evdeyse', dene: (g) => g.kapi === 'ALICI_EVDE' },
    komsu: { key: 'komsu', cls: 'KomsuyaTeslim', ad: 'Komşu', kural: 'g.kapi() == Kapi.KOMSU_EVDE && !g.sogukZincir() && g.kg() <= 10', tr: 'komşu evde, soğuk değil, ≤ 10 kg', dene: (g) => g.kapi === 'KOMSU_EVDE' && !g.soguk && g.kg <= 10 },
    dolap: { key: 'dolap', cls: 'DolabaTeslim', ad: 'Dolap', kural: '!g.sogukZincir() && g.kg() <= 5', tr: 'soğuk değil, ≤ 5 kg', dene: (g) => !g.soguk && g.kg <= 5 },
    market: { key: 'market', cls: 'MarketeTeslim', ad: 'Market', kural: '!g.sogukZincir() && g.kg() <= 15', tr: 'soğuk değil, ≤ 15 kg', dene: (g) => !g.soguk && g.kg <= 15 },
    sube: { key: 'sube', cls: 'SubeyeTeslim', ad: 'Şube', kural: 'g.kg() <= 20', tr: '≤ 20 kg (soğuk dolabı var)', dene: (g) => g.kg <= 20 },
    iade: { key: 'iade', cls: 'GondericiyeIade', ad: 'İade', kural: 'true', tr: 'her zaman: göndericiye döner', dene: () => true },
  };
  /**
   * Halkanın kuralı parça parça: [olumlu metin, tutmazsa neden, sınama]. Sahnedeki "kural denetimi" bunu gösterir;
   * parçaların hepsi tutunca dene(g) true döner (Java'daki && zinciriyle aynı).
   */
  const KOSUL = {
    alici: [['alıcı evde', 'alıcı evde değil', (g) => g.kapi === 'ALICI_EVDE']],
    komsu: [
      ['komşu evde', 'komşu yok', (g) => g.kapi === 'KOMSU_EVDE'],
      ['soğuk değil', 'soğuk zincir', (g) => !g.soguk],
      ['≤ 10 kg', '10 kg üstü', (g) => g.kg <= 10],
    ],
    dolap: [
      ['soğuk değil', 'soğuk zincir', (g) => !g.soguk],
      ['≤ 5 kg', '5 kg üstü', (g) => g.kg <= 5],
    ],
    market: [
      ['soğuk değil', 'soğuk zincir', (g) => !g.soguk],
      ['≤ 15 kg', '15 kg üstü', (g) => g.kg <= 15],
    ],
    sube: [['≤ 20 kg', '20 kg üstü', (g) => g.kg <= 20]],
    iade: [['her zaman', '', () => true]],
  };
  CR.kosullar = (k, g) => KOSUL[k].map(([t, neg, f]) => ({ t, neg, ok: !!f(g) }));
  CR.kosulMetin = (k) => KOSUL[k].map(([t]) => t);
  /** Neden geçti? (sahnedeki açıklama; Java çıktısında yok) */
  CR.neden = function (k, g) {
    const x = CR.kosullar(k, g).find((c) => !c.ok);
    return x ? x.neg : '';
  };
  /** Soğuk zincir gönderisi bu halkaya bırakılırsa kural ihlali */
  CR.HASSAS = ['komsu', 'dolap', 'market'];
  CR.MALATYA = ['alici', 'komsu', 'dolap', 'sube', 'iade'];
  CR.ISTANBUL = ['alici', 'dolap', 'komsu', 'sube', 'iade'];
  /** Tezgâhtaki öğretici zincirler: sıra = öncelik · sonda "her zaman" halkası yok */
  CR.SUBE_ONCE = ['sube', 'alici', 'komsu', 'dolap', 'iade'];
  CR.IADESIZ = ['alici', 'komsu', 'dolap', 'sube'];

  // ------------------------------------------------------------------ ortak Java kaynakları
  code.Kapi = `${doc('Kapıdaki durum: kim evde?')}public enum Kapi {

    ALICI_EVDE("alıcı evde"),
    KOMSU_EVDE("komşu evde"),
    KIMSE_YOK("kimse yok");

    private final String aciklama;

    Kapi(String aciklama) {
        this.aciklama = aciklama;
    }

    @Override
    public String toString() {
        return aciklama;
    }
}`;

  code.Gonderi = `${doc('Kapıya gelen gönderi.')}public record Gonderi(String takipNo, String alici, int kg, boolean sogukZincir, Kapi kapi) {

    public static Gonderi koli(String takipNo, String alici, int kg, Kapi kapi) {
        return new Gonderi(takipNo, alici, kg, false, kapi);
    }

    public static Gonderi ilac(String takipNo, String alici, int kg, Kapi kapi) {
        return new Gonderi(takipNo, alici, kg, true, kapi);
    }

    public String etiket() {
        return takipNo + " " + alici + " · " + kg + " kg" + (sogukZincir ? " · soğuk zincir" : "") + " · " + kapi;
    }
}`;

  const gonderiExpr = (g) => `Gonderi.${g.soguk ? 'ilac' : 'koli'}("${g.no}", "${g.alici}", ${g.kg}, Kapi.${g.kapi})`;
  CR.gonderiExpr = gonderiExpr;
  code.Gunluk = `import java.util.List;

${doc('Günün gönderileri (örnek veri).')}public class Gunluk {

    public static List<Gonderi> gonderiler() {
        return List.of(
${CR.GUNLUK.map((g, i) => `                ${gonderiExpr(g)}${i < CR.GUNLUK.length - 1 ? ',' : ');'}`).join('\n')}
    }
}`;

  // ================================================================== "Sorun": if/else merdiveni kuryenin içinde
  /**
   * Kalıpsız merdivenler. Her dal: [koşul, yer, yorum]. Koşulların bir kısmı öncekilerin tutmadığını varsayar.
   *   v1: üç seçenek · v2: dolap + kurallar (soğuk zincir dalı erken) · ist: İstanbul kopyası (dolap öne alındı)
   */
  CR.MERDIVEN = {
    v1: [
      ['g.kapi() == Kapi.ALICI_EVDE', 'Alıcı'],
      ['g.kapi() == Kapi.KOMSU_EVDE', 'Komşu'],
      [null, 'Şube'],
    ],
    v2: [
      ['g.kapi() == Kapi.ALICI_EVDE', 'Alıcı'],
      ['g.sogukZincir()', 'Şube', 'soğuk zincir: yalnızca şube'],
      ['g.kapi() == Kapi.KOMSU_EVDE && g.kg() <= 10', 'Komşu'],
      ['g.kg() <= 5', 'Dolap', 'soğuk değil: yukarıda elendi'],
      ['g.kg() <= 20', 'Şube'],
      [null, 'İade'],
    ],
    ist: [
      ['g.kapi() == Kapi.ALICI_EVDE', 'Alıcı'],
      ['g.kg() <= 5', 'Dolap', 'İstanbul: önce dolap (apartmanlar)'],
      ['g.sogukZincir()', 'Şube', 'soğuk zincir: yalnızca şube'],
      ['g.kapi() == Kapi.KOMSU_EVDE && g.kg() <= 10', 'Komşu'],
      ['g.kg() <= 20', 'Şube'],
      [null, 'İade'],
    ],
  };
  /** Merdiveni JavaScript'te değerlendirir: ilk tutan dalın indeksi */
  CR.merdivenSec = function (v, g) {
    const C = {
      'g.kapi() == Kapi.ALICI_EVDE': g.kapi === 'ALICI_EVDE',
      'g.kapi() == Kapi.KOMSU_EVDE': g.kapi === 'KOMSU_EVDE',
      'g.sogukZincir()': g.soguk,
      'g.kapi() == Kapi.KOMSU_EVDE && g.kg() <= 10': g.kapi === 'KOMSU_EVDE' && g.kg <= 10,
      'g.kg() <= 5': g.kg <= 5,
      'g.kg() <= 20': g.kg <= 20,
    };
    return CR.MERDIVEN[v].findIndex(([c]) => c === null || C[c]);
  };
  const MERD_TR = {
    'g.kapi() == Kapi.ALICI_EVDE': 'alıcı evde',
    'g.kapi() == Kapi.KOMSU_EVDE': 'komşu evde',
    'g.sogukZincir()': 'soğuk zincir',
    'g.kapi() == Kapi.KOMSU_EVDE && g.kg() <= 10': 'komşu evde ve ≤ 10 kg',
    'g.kg() <= 5': '≤ 5 kg',
    'g.kg() <= 20': '≤ 20 kg',
  };
  /**
   * Merdivenin dalları (Sorun sahnesi). varsayim: komşu/dolap dalına soğuk zincir düşmemeli —
   *   'yok'  : kural hiç yazılmamış · 'gizli': yukarıdaki soğuk zincir dalı sayesinde (sıraya bağlı) · 'bozuk': o dal aşağıda kaldı
   */
  CR.merdivenBilgi = function (v) {
    const M = CR.MERDIVEN[v];
    const soguk = M.findIndex(([c]) => c === 'g.sogukZincir()');
    return M.map(([c, yer, yorum], i) => {
      const hassas = yer === 'Komşu' || yer === 'Dolap';
      const gelen = CR.GUNLUK.filter((g) => CR.merdivenSec(v, g) === i);
      return {
        i,
        c,
        tr: c ? MERD_TR[c] : 'hiçbiri',
        yer,
        yorum: yorum || null,
        varsayim: !hassas ? null : soguk < 0 ? 'yok' : soguk < i ? 'gizli' : 'bozuk',
        gelen: gelen.map((g) => g.no),
        bad: hassas && gelen.some((g) => g.soguk),
      };
    });
  };

  function merdivenSrc(v, cls, bolge, docText) {
    const M = CR.MERDIVEN[v];
    const L = [];
    M.forEach(([c, yer, yorum], i) => {
      const head = i === 0 ? `        if (${c}) {` : c ? `        } else if (${c}) {` : '        } else {';
      L.push(yorum ? cm(head, yorum, 60) : head);
      L.push(`            yer = "${yer}";`);
    });
    L.push('        }');
    return `${doc(docText)}public class ${cls} {

    public void teslimEt(Gonderi g) {
        String yer;
${L.join('\n')}
        System.out.println("[${bolge}] " + g.etiket() + ": " + yer);
    }
}`;
  }
  code.KuryeV1 = merdivenSrc('v1', 'Kurye', 'Malatya', 'Kurye: kapıda ne yapacağına kendisi karar verir.');
  code.KuryeV2 = merdivenSrc('v2', 'Kurye', 'Malatya', 'Kurye: bütün teslim seçenekleri ve sıraları bu metotta.');
  code.IstanbulKuryesi = merdivenSrc('ist', 'IstanbulKuryesi', 'İstanbul', 'İstanbul kuryesi: Kurye kopyalandı, dolap öne alındı.');

  function naiveMain(istanbul) {
    return `public class Main {

    public static void main(String[] args) {
        Kurye malatya = new Kurye();
        for (Gonderi g : Gunluk.gonderiler()) {
            malatya.teslimEt(g);
        }${
          istanbul
            ? `
        IstanbulKuryesi istanbul = new IstanbulKuryesi();
        for (Gonderi g : Gunluk.gonderiler()) {
            istanbul.teslimEt(g);
        }`
            : ''
        }
    }
}`;
  }
  CR.NV = {
    v1: { kurye: 'v1', istanbul: false },
    v2: { kurye: 'v2', istanbul: false },
    v3: { kurye: 'v2', istanbul: true },
  };
  CR.naiveFiles = function (v) {
    const P = CR.NV[v];
    const F = { Main: naiveMain(P.istanbul), Kurye: P.kurye === 'v1' ? code.KuryeV1 : code.KuryeV2 };
    if (P.istanbul) F.IstanbulKuryesi = code.IstanbulKuryesi;
    Object.assign(F, { Gonderi: code.Gonderi, Kapi: code.Kapi, Gunluk: code.Gunluk });
    return F;
  };
  /** Kalıpsız sürümün çıktısı: {t, k: 'ok'|'bad', bolge, g, yer, dal} */
  CR.naiveRun = function (v) {
    const P = CR.NV[v];
    const out = [];
    const tur = (bolge, mv) =>
      CR.GUNLUK.forEach((g) => {
        const i = CR.merdivenSec(mv, g);
        const yer = CR.MERDIVEN[mv][i][1];
        // kural ihlali: soğuk zincir dolaba ya da komşuya bırakıldı
        const bad = g.soguk && (yer === 'Dolap' || yer === 'Komşu');
        out.push({ t: `[${bolge}] ${CR.etiket(g)}: ${yer}`, k: bad ? 'bad' : 'ok', bolge, g, yer, dal: i });
      });
    tur('Malatya', P.kurye);
    if (P.istanbul) tur('İstanbul', 'ist');
    return out;
  };

  // ================================================================== "Çözüm": zincir
  code.TeslimatAdimi = `${doc('«Handler» — Zincirin bir halkası: işleyebiliyorsa işler, işleyemiyorsa isteği SONRAKİNE iletir.')}public abstract class TeslimatAdimi {

    private final String ad;
${cm('    private TeslimatAdimi sonraki;', 'zincirdeki bir sonraki halka', 52)}

    protected TeslimatAdimi(String ad) {
        this.ad = ad;
    }

${cm('    public TeslimatAdimi sonra(TeslimatAdimi s) {', 'zinciri kurar; s’yi döndürür', 52)}
        this.sonraki = s;
        return s;
    }

    public final void teslimEt(Gonderi g) {
        if (dene(g)) {
            System.out.println(ad + " ✓");
        } else if (sonraki != null) {
            System.out.print(ad + " ✗ → ");
${cm('            sonraki.teslimEt(g);', 'isteği ilet', 52)}
        } else {
            System.out.println(ad + " ✗ → KAYIP: kimse teslim almadı!");
        }
    }

${cm('    protected abstract boolean dene(Gonderi g);', 'halkanın kendi kuralı', 52)}
}`;

  /** Somut halka. Kural eksiksiz ve kendi içinde: başka halkalara güvenmez. */
  function halkaSrc(k) {
    const H = CR.HALKA[k];
    const docText = {
      alici: '«ConcreteHandler» — Alıcı evdeyse kendisine teslim.',
      komsu: '«ConcreteHandler» — Komşuya teslim: soğuk zincir ve ağır gönderi bırakılmaz.',
      dolap: '«ConcreteHandler» — Akıllı dolap: küçük ve soğuk zincir olmayan gönderiler.',
      market: '«ConcreteHandler» — Yeni halka: anlaşmalı mahalle marketi.',
      sube: '«ConcreteHandler» — Şube: soğuk dolabı var; 20 kg üstünü almaz.',
      iade: '«ConcreteHandler» — Zincirin sonu: kimse almadıysa gönderi göndericiye döner.',
    }[k];
    return `${doc(docText)}public class ${H.cls} extends TeslimatAdimi {

    public ${H.cls}() {
        super("${H.ad}");
    }

    @Override
    protected boolean dene(Gonderi g) {
        return ${H.kural};
    }
}`;
  }
  Object.keys(CR.HALKA).forEach((k) => (code[CR.HALKA[k].cls] = halkaSrc(k)));

  code.Kurye = `${doc('«Client» — Kurye: kapıda ne olacağını bilmez; gönderiyi zincirin başına verir.')}public class Kurye {

    private final String bolge;
    private final TeslimatAdimi zincir;

    public Kurye(String bolge, TeslimatAdimi zincir) {
        this.bolge = bolge;
        this.zincir = zincir;
    }

    public void teslimEt(Gonderi g) {
        System.out.print("[" + bolge + "] " + g.etiket() + ": ");
        zincir.teslimEt(g);
    }
}`;

  /** Zinciri kuran satırlar: ilk halka değişkene, kalanlar sonra(...) ile */
  function zincirSatirlari(ad, keys, yorum) {
    const L = [];
    const first = `        TeslimatAdimi ${ad} = new ${CR.HALKA[keys[0]].cls}();`;
    L.push(yorum ? cm(first, yorum, 66) : first);
    if (keys.length > 1) {
      keys.slice(1).forEach((k, i) => {
        const call = `.sonra(new ${CR.HALKA[k].cls}())`;
        L.push(i === 0 ? `        ${ad}${call}` : `                ${call}`);
      });
      L[L.length - 1] += ';';
    }
    return L.join('\n');
  }
  CR.zincirSatirlari = zincirSatirlari;

  /**
   * Program: {zincirler: [{bolge, keys}], gonderiler: [indeks] (yoksa günlük listenin tamamı)}
   */
  function mainSrc(prog) {
    const L = [];
    prog.zincirler.forEach((z, i) => {
      if (i) L.push('');
      L.push(zincirSatirlari(z.v + 'Zinciri', z.keys, z.yorum));
    });
    L.push('');
    prog.zincirler.forEach((z) => L.push(`        Kurye ${z.v} = new Kurye("${z.bolge}", ${z.v}Zinciri);`));
    prog.zincirler.forEach((z) => {
      if (prog.tek != null) L.push(`        ${z.v}.teslimEt(${gonderiExpr(CR.GUNLUK[prog.tek])});`);
      else {
        L.push(`        for (Gonderi g : Gunluk.gonderiler()) {`);
        L.push(`            ${z.v}.teslimEt(g);`);
        L.push('        }');
      }
    });
    return `public class Main {

    public static void main(String[] args) {
${L.join('\n')}
    }
}`;
  }
  CR.mainFor = mainSrc;

  /** Zincir boyunca çalıştırma (Java ile birebir). Dönüş: {t, adim: [{k, ok}], yer, kayip} */
  CR.zincirCalistir = function (keys, g) {
    const adim = [];
    let t = '';
    for (let i = 0; i < keys.length; i++) {
      const H = CR.HALKA[keys[i]];
      if (H.dene(g)) {
        adim.push({ k: keys[i], ok: true });
        t += H.ad + ' ✓';
        return { t, adim, yer: keys[i], kayip: false };
      }
      adim.push({ k: keys[i], ok: false, neden: CR.neden(keys[i], g) });
      if (i < keys.length - 1) t += H.ad + ' ✗ → ';
      else t += H.ad + ' ✗ → KAYIP: kimse teslim almadı!';
    }
    return { t, adim, yer: null, kayip: true };
  };

  /** Programın çıktısı: satır başına bir gönderi {t, bolge, g, adim, yer, kayip, bad} */
  CR.run = function (prog) {
    const out = [];
    prog.zincirler.forEach((z) => {
      const liste = prog.tek != null ? [CR.GUNLUK[prog.tek]] : CR.GUNLUK;
      liste.forEach((g) => {
        const r = CR.zincirCalistir(z.keys, g);
        out.push({ t: `[${z.bolge}] ${CR.etiket(g)}: ${r.t}`, bolge: z.bolge, g, adim: r.adim, yer: r.yer, kayip: r.kayip, keys: z.keys });
      });
    });
    return out;
  };
  CR.outputOf = (prog) => CR.run(prog).map((l) => l.t);

  /**
   * Konsol satırının parçaları (renkli gösterim): [{t, k: 'pre'|'pass'|'ok'|'kayip'|'yer'|'bad'}].
   * Parçaların birleşimi Java çıktısındaki satırın kendisidir. upto: o ana kadar yazılmış halka sayısı.
   */
  CR.lineParts = function (l, upto) {
    const P = [{ t: `[${l.bolge}] ${CR.etiket(l.g)}: `, k: 'pre' }];
    if (!l.adim) {
      P.push({ t: l.yer, k: l.k === 'bad' ? 'bad' : 'yer' });
      return P;
    }
    const n = upto == null ? l.adim.length : upto;
    l.adim.slice(0, n).forEach((a, i) => {
      const ad = CR.HALKA[a.k].ad;
      if (a.ok) P.push({ t: ad + ' ✓', k: CR.HASSAS.includes(a.k) && l.g.soguk ? 'bad' : 'ok' });
      else {
        P.push({ t: ad + ' ✗ → ', k: 'pass' });
        if (i === l.adim.length - 1) P.push({ t: 'KAYIP: kimse teslim almadı!', k: 'kayip' });
      }
    });
    return P;
  };

  /** Bir zincir programının bütün dosyaları */
  CR.filesFor = function (prog) {
    const F = { Main: mainSrc(prog), Kurye: code.Kurye, TeslimatAdimi: code.TeslimatAdimi };
    const used = [];
    prog.zincirler.forEach((z) => z.keys.forEach((k) => !used.includes(k) && used.push(k)));
    Object.keys(CR.HALKA)
      .filter((k) => used.includes(k))
      .forEach((k) => (F[CR.HALKA[k].cls] = code[CR.HALKA[k].cls]));
    Object.assign(F, { Gonderi: code.Gonderi, Kapi: code.Kapi });
    if (prog.tek == null) F.Gunluk = code.Gunluk;
    return F;
  };
  CR.fileOrder = ['Main', 'Kurye', 'IstanbulKuryesi', 'TeslimatAdimi', 'AliciyaTeslim', 'KomsuyaTeslim', 'DolabaTeslim', 'MarketeTeslim', 'SubeyeTeslim', 'GondericiyeIade', 'Gonderi', 'Kapi', 'Gunluk'];
  CR.fileList = (F, order) => (order || CR.fileOrder).filter((n) => F[n]).map((n) => ({ name: n + '.java', code: F[n] }));

  // ------------------------------------------------------------------ çözüm ve adım adım yeniden düzenleme
  CR.COZUM = {
    zincirler: [
      { bolge: 'Malatya', v: 'malatya', keys: CR.MALATYA },
      { bolge: 'İstanbul', v: 'istanbul', keys: CR.ISTANBUL, yorum: 'aynı sınıflar, başka sıra' },
    ],
  };
  code.Main = mainSrc(CR.COZUM);
  CR.output = CR.outputOf(CR.COZUM);
  const halkalar = ['alici', 'komsu', 'dolap', 'sube', 'iade'];
  const V3 = CR.naiveFiles('v3');
  const R1 = Object.assign({}, V3, { TeslimatAdimi: plain(code.TeslimatAdimi) });
  const R2 = Object.assign({}, R1);
  halkalar.forEach((k) => (R2[CR.HALKA[k].cls] = plain(code[CR.HALKA[k].cls])));
  const R3 = Object.assign({}, R2, { Kurye: plain(code.Kurye), Main: code.Main });
  delete R3.IstanbulKuryesi;
  CR.refactor = [V3, R1, R2, R3];
  CR.refactorOrder = ['Main', 'Kurye', 'IstanbulKuryesi', 'TeslimatAdimi', 'AliciyaTeslim', 'KomsuyaTeslim', 'DolabaTeslim', 'SubeyeTeslim', 'GondericiyeIade', 'Gonderi', 'Kapi', 'Gunluk'];
  CR.refactorOutputs = [0, 1, 2].map(() => CR.naiveRun('v3')).concat([CR.run(CR.COZUM)]);

  // ================================================================== Canlı Akış
  CR.presets = {
    ayse: { key: 'ayse', title: 'Ayşe’nin kolisi', prog: { zincirler: [{ bolge: 'Malatya', v: 'malatya', keys: CR.MALATYA }], tek: 1 } },
    zeynep: { key: 'zeynep', title: 'Zeynep’in ilacı', prog: { zincirler: [{ bolge: 'İstanbul', v: 'istanbul', keys: CR.ISTANBUL }], tek: 2 } },
  };
  CR.presetOrder = ['ayse', 'zeynep'];
  CR.akisFiles = (p) => CR.fileList(CR.filesFor(p.prog));
  CR.akisOutput = (p) => CR.outputOf(p.prog);

  // ================================================================== Zincir tezgâhı
  /** keys: kullanıcının kurduğu sıra */
  CR.tezgahProg = (keys) => ({ zincirler: [{ bolge: 'Malatya', v: 'malatya', keys }] });
  CR.tezgahFiles = (keys) => CR.filesFor(CR.tezgahProg(keys));
  /** Tezgâh özeti: halka başına teslim, kayıp, ortalama adım */
  CR.ozet = function (keys) {
    const r = CR.run(CR.tezgahProg(keys));
    const say = {};
    keys.forEach((k) => (say[k] = 0));
    let kayip = 0;
    let adim = 0;
    let evdeyken = 0; // alıcı evdeyken başka yere giden
    let ihlal = 0; // soğuk zincir komşuya/dolaba/markete (zincirde hiçbir sırada olmaz)
    r.forEach((l) => {
      adim += l.adim.length;
      if (l.kayip) kayip++;
      else say[l.yer]++;
      if (l.g.kapi === 'ALICI_EVDE' && l.yer !== 'alici') evdeyken++;
      if (l.g.soguk && CR.HASSAS.includes(l.yer)) ihlal++;
    });
    return { say, kayip, adim, ort: adim / r.length, evdeyken, ihlal, satir: r };
  };

  // ================================================================== Genişlet: yeni halka (anlaşmalı market)
  const EX = (CR.ext = {});
  EX.exercise = `public class MarketeTeslim extends ⟦1⟧ {

    public MarketeTeslim() {
        super("Market");
    }

    @Override
    protected boolean ⟦2⟧(Gonderi g) {
        return !g.⟦3⟧() && g.kg() <= 15;
    }
}`;
  EX.exerciseMain = `// Malatya zinciri: market, dolaptan hemen sonra
malatyaZinciri.sonra(new KomsuyaTeslim())
        .sonra(new DolabaTeslim())
        .sonra(new ⟦4⟧())
        .sonra(new SubeyeTeslim())`;
  EX.answers = { 1: 'TeslimatAdimi', 2: 'dene', 3: 'sogukZincir', 4: 'MarketeTeslim' };
  EX.keys = ['alici', 'komsu', 'dolap', 'market', 'sube', 'iade'];
  EX.prog = { zincirler: [{ bolge: 'Malatya', v: 'malatya', keys: EX.keys }] };
  EX.Main = mainSrc(EX.prog);
  EX.output = CR.outputOf(EX.prog);

  // ================================================================== Gerçek dünya (JDK) örnekleri
  const RW = (CR.rw = {});
  RW.gunluk = (arg) => `import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.LogRecord;
import java.util.logging.Logger;

public class GunlukZinciri {

    /** Mesajı adıyla birlikte ekrana yazan basit bir işleyici */
    static Handler yazici(String ad) {
        return new Handler() {
            @Override
            public void publish(LogRecord kayit) {
                if (isLoggable(kayit)) {
                    System.out.println(ad + " ← " + kayit.getMessage());
                }
            }

            @Override
            public void flush() {
            }

            @Override
            public void close() {
            }
        };
    }

    public static void main(String[] args) {
        Logger kargo = Logger.getLogger("kargo");
${cm('        kargo.setUseParentHandlers(false);', 'kök günlükçüye gitmesin', 64)}
        kargo.addHandler(yazici("kargo (dosya)"));
${cm('        Logger teslimat = Logger.getLogger("kargo.teslimat");', 'ebeveyni: "kargo"', 64)}
        teslimat.addHandler(yazici("kargo.teslimat (ekran)"));

        ${arg}
        teslimat.warning("KRG-1003 soğuk zincir!");
    }
}`;
  /** Seçeneğin satırı: yorum, koddaki öbür yorumlarla aynı sütunda */
  const rwArg = (stmt, comment) => cm('        ' + stmt, comment, 64).slice(8);
  RW.gunlukOpts = [
    { label: 'Yukarı iletilir', arg: '// ayar yok: önce kendi işleyicisi, sonra ebeveyninki', out: ['kargo.teslimat (ekran) ← KRG-1003 soğuk zincir!', 'kargo (dosya) ← KRG-1003 soğuk zincir!'] },
    { label: 'Zinciri kes', arg: rwArg('teslimat.setUseParentHandlers(false);', 'ebeveyne iletme'), out: ['kargo.teslimat (ekran) ← KRG-1003 soğuk zincir!'] },
    { label: 'Seviye süzgeci', arg: rwArg('teslimat.getHandlers()[0].setLevel(Level.SEVERE);', 'ekran yalnızca SEVERE alır'), out: ['kargo (dosya) ← KRG-1003 soğuk zincir!'] },
  ];

  RW.istisna = (arg) => `public class IstisnaZinciri {

    static void sube() {
        throw new IllegalStateException("şube kapalı");
    }

    static void kurye() {
        try {
            sube();
        } finally {
            System.out.println("kurye: yakalamadı, yukarı iletti");
        }
    }

    static void merkez() {
        try {
            kurye();
        } ${arg} {
            System.out.println("merkez: yakaladı → " + e.getMessage());
        }
    }

    public static void main(String[] args) {
        merkez();
        System.out.println("program devam ediyor");
    }
}`;
  RW.istisnaOpts = [
    { label: 'Merkez yakalar', arg: 'catch (IllegalStateException e)', out: ['kurye: yakalamadı, yukarı iletti', 'merkez: yakaladı → şube kapalı', 'program devam ediyor'] },
    { label: 'Geniş yakalama', arg: 'catch (RuntimeException e)', out: ['kurye: yakalamadı, yukarı iletti', 'merkez: yakaladı → şube kapalı', 'program devam ediyor'] },
    {
      label: 'Kimse yakalamaz',
      arg: 'catch (IllegalArgumentException e)',
      out: [
        'kurye: yakalamadı, yukarı iletti',
        'Exception in thread "main" java.lang.IllegalStateException: şube kapalı',
        '\tat IstisnaZinciri.sube(IstisnaZinciri.java:4)',
        '\tat IstisnaZinciri.kurye(IstisnaZinciri.java:9)',
        '\tat IstisnaZinciri.merkez(IstisnaZinciri.java:17)',
        '\tat IstisnaZinciri.main(IstisnaZinciri.java:24)',
      ],
    },
  ];

  RW.filtre = () => `// Jakarta Servlet: her filtre isteği işler ya da zincirde ilerletir
public class OturumFiltresi implements Filter {

    @Override
    public void doFilter(ServletRequest istek, ServletResponse yanit, FilterChain zincir)
            throws IOException, ServletException {
        if (((HttpServletRequest) istek).getSession(false) == null) {
${cm('            ((HttpServletResponse) yanit).sendRedirect("/giris");', 'burada DUR', 68)}
            return;
        }
${cm('        zincir.doFilter(istek, yanit);', 'sonrakine ilet', 68)}
    }
}`;

  // ================================================================== UML sınıf diyagramları
  const M = {
    sonraki: { id: 'sonraki', text: '- sonraki: TeslimatAdimi', generic: '- successor: Handler', color: 2 },
    sonra: { id: 'sonra', text: '+ sonra(s): TeslimatAdimi', generic: '+ setNext(h)' },
    teslimEt: { id: 'teslimEt', text: '+ teslimEt(g)', generic: '+ handleRequest()', factory: true },
    dene: { id: 'dene', text: '# dene(g): boolean', generic: '# canHandle()', abstract: true },
    zincir: { id: 'zincir', text: '- zincir: TeslimatAdimi', generic: '- handler: Handler' },
    kTeslim: { id: 'teslimEt', text: '+ teslimEt(g)', generic: '+ request()' },
  };
  CR.members = M;
  const handlerBox = (x, y) => ({ id: 'TeslimatAdimi', name: 'TeslimatAdimi', generic: 'Handler', kind: 'abstract', role: 'handler', x, y, w: 300, members: [M.sonraki, M.sonra, M.teslimEt, M.dene] });
  const somut = (k, x, y, i) => ({ id: CR.HALKA[k].cls, name: CR.HALKA[k].cls, generic: 'ConcreteHandler' + (i + 1), kind: 'class', role: 'concreteHandler', x, y, w: 190, noTag: i > 0, members: [{ id: 'dene', text: '# dene(g)', generic: '# canHandle()' }] });
  const kuryeBox = (x, y) => ({ id: 'Kurye', name: 'Kurye', generic: 'Client', kind: 'class', role: 'client', x, y, w: 250, members: [M.zincir, M.kTeslim] });
  const SOMUT_X = (i) => 20 + i * 205;

  /** GoF yapısı (Yapı sahnesi, Canlı Akış, özet). o.notes: teslimEt() notu */
  CR.gofDiagram = function (o) {
    o = o || {};
    const keys = ['alici', 'komsu', 'dolap', 'sube', 'iade'];
    const classes = [kuryeBox(20, 40), handlerBox(390, 40)].concat(keys.map((k, i) => somut(k, SOMUT_X(i), 330, i)));
    const relations = [
      { id: 'zincir', from: 'Kurye', to: 'TeslimatAdimi', type: 'association', label: 'zincir', genericLabel: 'handler', fromSide: 'right', fromAt: 90, toSide: 'left', toAt: 90 },
      // halka kendi türünden bir sonrakini tutar: kendine dönen ok
      { id: 'sonraki', from: 'TeslimatAdimi', to: 'TeslimatAdimi', type: 'association', label: 'sonraki', genericLabel: 'successor', fromSide: 'right', fromAt: 75, toSide: 'right', toAt: 140, points: [[740, 75], [740, 140]] },
    ];
    keys.forEach((k, i) => relations.push({ id: 'r-' + k, from: CR.HALKA[k].cls, to: 'TeslimatAdimi', type: 'generalization', fromSide: 'top', fromAt: SOMUT_X(i) + 95, toSide: 'bottom', toAt: 540, mid: 280 }));
    const notes = o.notes
      ? [{ id: 'n-op', x: 790, y: 120, text: 'if (dene(g)) → işle, DUR\nelse if (sonraki != null)\n    sonraki.teslimEt(g);\nelse → KAYIP', genericText: 'if (canHandle) handle;\nelse if (successor != null)\n    successor.handleRequest();', target: 'TeslimatAdimi', from: 'left', to: 'right', toAt: 160 }]
      : [];
    return { width: o.notes ? 1050 : 1030, height: 430, title: 'Chain of Responsibility sınıf diyagramı', classes, relations, notes };
  };

  /**
   * "Çözüm" sahnesinin her adımındaki diyagram.
   * 0: merdivenler kuryelerde · 1: soyut halka · 2: somut halkalar · 3: kurye zinciri tanır
   */
  CR.solutionDiagram = function (st) {
    const classes = [];
    const relations = [];
    const keys = ['alici', 'komsu', 'dolap', 'sube', 'iade'];
    classes.push({ id: 'Kurye', name: 'Kurye', kind: 'class', role: 'client', x: 20, y: 40, w: 270, members: st >= 3 ? [M.zincir, M.kTeslim] : [{ id: 'teslimEt', text: '+ teslimEt(g) · 6 dallı merdiven' }] });
    if (st <= 2) classes.push({ id: 'IstanbulKuryesi', name: 'IstanbulKuryesi', kind: 'class', role: 'client', x: 20, y: 180, w: 270, members: [{ id: 'teslimEt', text: '+ teslimEt(g) · kopya, yeni sıra' }] });
    if (st >= 1) classes.push(handlerBox(390, 40));
    if (st >= 2) {
      keys.forEach((k, i) => {
        classes.push(somut(k, SOMUT_X(i), 330, i));
        relations.push({ id: 'r-' + k, from: CR.HALKA[k].cls, to: 'TeslimatAdimi', type: 'generalization', fromSide: 'top', fromAt: SOMUT_X(i) + 95, toSide: 'bottom', toAt: 540, mid: 280 });
      });
    }
    if (st >= 1) relations.push({ id: 'sonraki', from: 'TeslimatAdimi', to: 'TeslimatAdimi', type: 'association', label: 'sonraki', fromSide: 'right', fromAt: 75, toSide: 'right', toAt: 140, points: [[740, 75], [740, 140]] });
    if (st >= 3) relations.push({ id: 'zincir', from: 'Kurye', to: 'TeslimatAdimi', type: 'association', label: 'zincir', fromSide: 'right', fromAt: 90, toSide: 'left', toAt: 90 });
    return { width: 1030, height: 430, view: [0, 0, 1030, 430], classes, relations };
  };

  // ------------------------------------------------------------------ UML sıralama diyagramı (Canlı Akış)
  /** Akış adımlarıyla aynı sırada mesajlar. Dönüş: {spec, msgOf: {'teslim' | 'zincir' | 'dene:i' | 'ilet:i' | 'ret'}} */
  CR.seqSpec = function (p) {
    const r = CR.run(p.prog)[0];
    const z = p.prog.zincirler[0];
    // yalnızca isteğin uğradığı halkalar (sonrakiler bu etkileşime katılmıyor)
    const parts = [
      { id: 'main', label: 'Main', role: 'client' },
      { id: 'kurye', label: z.v, role: 'client', object: true },
    ].concat(r.adim.map((a) => ({ id: a.k, label: CR.HALKA[a.k].ad.toLocaleLowerCase('tr'), role: 'concreteHandler', object: true })));
    const messages = [];
    const msgOf = {};
    const add = (key, m) => {
      msgOf[key] = messages.length;
      messages.push(m);
    };
    add('teslim', { from: 'main', to: 'kurye', kind: 'call', label: 'teslimEt(g)' });
    add('zincir', { from: 'kurye', to: z.keys[0], kind: 'call', label: 'teslimEt(g)' });
    r.adim.forEach((a, i) => {
      add('dene:' + i, { from: a.k, to: a.k, kind: 'self', short: true, label: `dene(g) → ${a.ok ? 'true ✓' : 'false'}` });
      if (!a.ok && i < r.adim.length - 1) add('ilet:' + i, { from: a.k, to: r.adim[i + 1].k, kind: 'call', label: 'sonraki.teslimEt(g)' });
    });
    // dönüşler zincir boyunca geri sarılır
    for (let i = r.adim.length - 1; i >= 1; i--) add('ret:' + i, { from: r.adim[i].k, to: r.adim[i - 1].k, kind: 'return', label: '' });
    add('ret', { from: r.adim[0].k, to: 'kurye', kind: 'return', label: '' });
    add('done', { from: 'kurye', to: 'main', kind: 'return', label: '' });
    const rowH = 32;
    const h = 100 + messages.reduce((s, m) => s + (m.kind === 'self' ? rowH + 16 : rowH), 0) + 40;
    // sağda boşluk: son halkanın "dene(g) → true ✓" etiketi çerçeveden taşmasın
    const W = 1000;
    parts.forEach((pp, i) => (pp.x = 70 + (i * (W - 70 - 190)) / (parts.length - 1)));
    return { spec: { width: W, height: h, top: 96, margin: 70, rowH, participants: parts, messages, initialActive: ['main'] }, msgOf, run: r };
  };
})();
