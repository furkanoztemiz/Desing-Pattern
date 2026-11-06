/*
 * Composite — veri: Java kodları, çıktılar, roller, diyagram tanımları.
 * Bu dosya DOM kullanmaz; tools/export-java.js de Java dosyalarını buradan üretir.
 *
 * Senaryo (lojistik dünyasının devamı): Sipariş kolisinin içinde bir aksesuar kutusu, onun içinde bir saat kutusu…
 * Kalıpsız çözümde koli iki ayrı liste tutuyor (ürünler, koliler) ve Kantar sınıfı içeriği iç içe döngülerle geziyor:
 * döngüler ağacın şeklini kopyalıyor. Paketleme bir kat derinleşince kod sessizce yanılıyor (3400 g yerine 3100 g).
 * Composite: ürün de koli de aynı arayüzü (Parca) uygular; koli her soruyu içindekilere sorup cevapları birleştirir.
 * Özyineleme her derinliğe iner; istemci ürün mü koli mi diye sormaz.
 */
(function () {
  'use strict';
  const DP = (window.DP = window.DP || {});
  const CP = (DP.cp = DP.cp || {});

  // ------------------------------------------------------------------ roller
  CP.roles = {
    client: { en: 'Client', tr: 'İstemci', color: 1 },
    component: { en: 'Component', tr: 'Bileşen (arayüz)', color: 2 },
    leaf: { en: 'Leaf', tr: 'Yaprak', color: 4 },
    composite: { en: 'Composite', tr: 'Bileşik', color: 3 },
  };

  CP.classRoles = {
    Main: 'client',
    Kantar: 'client',
    Parca: 'component',
    Urun: 'leaf',
    Koli: 'composite',
    Palet: 'composite',
    // JDK (Gerçek Dünya, eşleştirme)
    Container: 'composite',
    JButton: 'leaf',
    // GoF genel adları
    Client: 'client',
    Component: 'component',
    Leaf: 'leaf',
    Composite: 'composite',
  };

  CP.roleOf = function (name) {
    const r = CP.classRoles[name];
    return r ? CP.roles[r].color : null;
  };

  // `icindekiler` = kolinin çocukları: bileşiğin her işi devrettiği liste (kodda ayrıca vurgulanır)
  CP.special = { icindekiler: 'cmp' };

  /** 1 tabanlı satır numarası. */
  CP.lineOf = function (src, needle, from) {
    const lines = src.split('\n');
    for (let i = from || 0; i < lines.length; i++) if (lines[i].includes(needle)) return i + 1;
    return 0;
  };

  /** Satırın sonuna, belirli bir sütundan başlayan yorum ekler. */
  const cm = (line, comment, col) => line.padEnd(Math.max(col || 56, line.length + 2)) + '// ' + comment;
  const doc = (text) => `/**\n * ${text}\n */\n`;
  const plain = (src) => src.replace(/^((?:import [^\n]+\n)*\n?)\/\*\*[\s\S]*?\*\/\n/, '$1');
  CP.plain = plain;

  const code = (CP.code = {});

  // ================================================================== model (Java ile birebir)
  /** Ürünler (yapraklar): ağırlıklar gram — tam sayı, yerel ayardan bağımsız çıktı */
  CP.ITEMS = {
    laptop: { ad: 'Laptop', g: 2000, v: 'laptop' },
    mouse: { ad: 'Mouse', g: 100, v: 'mouse' },
    sarj: { ad: 'Şarj aleti', g: 400, v: 'sarj' },
    kilif: { ad: 'Kılıf', g: 200, v: 'kilif' },
    saat: { ad: 'Saat', g: 200, v: 'saat' },
    kupa: { ad: 'Kupa', g: 300, v: 'kupa' },
    kitap: { ad: 'Kitap', g: 500, v: 'kitap' },
    parfum: { ad: 'Parfüm', g: 400, v: 'parfum' },
    bisiklet: { ad: 'Bisiklet', g: 12000, v: 'bisiklet' },
  };
  /** Koliler (bileşikler): dara = boş kolinin ağırlığı */
  CP.BOXES = {
    siparis: { ad: 'Sipariş KRG-2001', dara: 300, v: 'siparis' },
    aksesuar: { ad: 'Aksesuar kutusu', dara: 100, v: 'aksesuar' },
    saatKutusu: { ad: 'Saat kutusu', dara: 100, v: 'saatKutusu' },
    hediye: { ad: 'Hediye kutusu', dara: 150, v: 'hediye' },
    poset: { ad: 'Balonlu poşet', dara: 50, v: 'poset' },
  };
  CP.PALET = { hedef: 'Malatya', dara: 20000, v: 'palet' };
  CP.itemOrder = ['laptop', 'mouse', 'sarj', 'kilif', 'saat', 'kupa', 'kitap', 'parfum'];
  CP.boxOrder = ['aksesuar', 'saatKutusu', 'hediye', 'poset'];

  CP.isBox = (id) => !!CP.BOXES[id] || id === 'palet';
  CP.kindOf = (id) => (id === 'palet' ? 'palet' : CP.BOXES[id] ? 'koli' : 'urun');
  CP.nameOf = (id) => (id === 'palet' ? 'Palet: ' + CP.PALET.hedef : CP.BOXES[id] ? CP.BOXES[id].ad : CP.ITEMS[id].ad);
  CP.classOf = (id) => ({ palet: 'Palet', koli: 'Koli', urun: 'Urun' })[CP.kindOf(id)];

  /** Ağaç düğümü: {id, c: [...]} (koli/palet) ya da {id} (ürün) */
  const K = (id, c) => ({ id, c: c || [] });
  const U = (id) => ({ id });
  CP.K = K;
  CP.U = U;
  CP.clone = (n) => (n.c ? { id: n.id, c: n.c.map(CP.clone) } : { id: n.id });

  /** Canlı Akış ve tezgâhın başlangıç ağacı (Çözüm'deki sipariş kolisi) */
  CP.TREE = K('siparis', [U('laptop'), K('aksesuar', [U('mouse'), U('sarj'), K('saatKutusu', [U('saat')])]), U('kilif')]);

  /** Composite'in hesabı (Java ile birebir) */
  CP.weight = (n) => (n.c ? (n.id === 'palet' ? CP.PALET.dara : CP.BOXES[n.id].dara) + n.c.reduce((t, x) => t + CP.weight(x), 0) : CP.ITEMS[n.id].g);
  CP.lineFor = (n, girinti) =>
    n.id === 'palet'
      ? `${girinti}# Palet: ${CP.PALET.hedef} [${CP.weight(n)} g]`
      : n.c
      ? `${girinti}+ ${CP.BOXES[n.id].ad} [${CP.weight(n)} g]`
      : `${girinti}- ${CP.ITEMS[n.id].ad} (${CP.ITEMS[n.id].g} g)`;
  /** listele(girinti): önce kendisi, sonra içindekiler bir kat içeriden (ön sıra) */
  CP.manifest = function (n, girinti) {
    girinti = girinti || '';
    const out = [CP.lineFor(n, girinti)];
    (n.c || []).forEach((x) => out.push(...CP.manifest(x, girinti + '   ')));
    return out;
  };
  /** Ön sırayla düz liste: {n, depth, parent, path} */
  CP.flatten = function (n, depth, parent, out) {
    out = out || [];
    depth = depth || 0;
    out.push({ n, depth, parent: parent || null });
    (n.c || []).forEach((x) => CP.flatten(x, depth + 1, n, out));
    return out;
  };
  CP.find = (n, id) => (n.id === id ? n : (n.c || []).reduce((f, x) => f || CP.find(x, id), null));
  CP.parentOf = (n, id) => (n.c || []).reduce((f, x) => f || (x.id === id ? n : CP.parentOf(x, id)), null);
  CP.depthOf = (n) => (n.c && n.c.length ? 1 + Math.max(...n.c.map(CP.depthOf)) : 0);
  CP.count = (n) => 1 + (n.c || []).reduce((t, x) => t + CP.count(x), 0);

  // ================================================================== "Sorun": iç içe döngüler
  code.UrunNaive = `public class Urun {

    private final String ad;
    private final int gram;

    public Urun(String ad, int gram) {
        this.ad = ad;
        this.gram = gram;
    }

    public String getAd() {
        return ad;
    }

    public int getGram() {
        return gram;
    }
}`;

  function naiveKoli(v) {
    const two = v !== 'v1';
    return `import java.util.ArrayList;
import java.util.List;

public class Koli {

    private final String ad;
${cm('    private final int dara;', 'boş kolinin ağırlığı (g)', 60)}
    private final List<Urun> urunler = new ArrayList<>();
${two ? cm('    private final List<Koli> koliler = new ArrayList<>();', 'koli içinde koli', 60) + '\n' : ''}
    public Koli(String ad, int dara) {
        this.ad = ad;
        this.dara = dara;
    }

    public void ekle(Urun u) {
        urunler.add(u);
    }
${
  two
    ? `
    public void ekle(Koli k) {
        koliler.add(k);
    }
`
    : ''
}
    public String getAd() {
        return ad;
    }

    public int getDara() {
        return dara;
    }

    public List<Urun> getUrunler() {
        return urunler;
    }${
      two
        ? `

    public List<Koli> getKoliler() {
        return koliler;
    }`
        : ''
    }
}`;
  }

  const KANTAR_ASSUME = 'koli içinde koli: bir kat yeter herhalde';
  CP.KANTAR_ASSUME = KANTAR_ASSUME;
  function naiveKantar(v) {
    const urunMetotlari = v === 'v3';
    const inner = v !== 'v1';
    const aw = `    public static int agirlik(Koli koli) {
        int toplam = koli.getDara();
        for (Urun u : koli.getUrunler()) {
            toplam += u.getGram();
        }
${
  inner
    ? `        // ${KANTAR_ASSUME}
        for (Koli ic : koli.getKoliler()) {
            toplam += ic.getDara();
            for (Urun u : ic.getUrunler()) {
                toplam += u.getGram();
            }
        }
`
    : ''
}        return toplam;
    }`;
    const ls = `    public static void listele(Koli koli) {
        System.out.println("+ " + koli.getAd() + " [" + agirlik(koli) + " g]");
        for (Urun u : koli.getUrunler()) {
            System.out.println("   - " + u.getAd() + " (" + u.getGram() + " g)");
        }${
          inner
            ? `
        for (Koli ic : koli.getKoliler()) {
            System.out.println("   + " + ic.getAd() + " [" + agirlik(ic) + " g]");
            for (Urun u : ic.getUrunler()) {
                System.out.println("      - " + u.getAd() + " (" + u.getGram() + " g)");
            }
        }`
            : ''
        }
    }`;
    const uw = `${cm('    public static int agirlik(Urun u) {', 'kolisiz ürün için ayrı metot', 60)}
        return u.getGram();
    }`;
    const ul = `    public static void listele(Urun u) {
        System.out.println("- " + u.getAd() + " (" + u.getGram() + " g)");
    }`;
    return `${doc('Ağırlık ve içerik listesi (manifesto): kolinin içine kendisi bakar, ürünü ve koliyi ayrı ele alır.')}public class Kantar {

${(urunMetotlari ? [uw, aw, ul, ls] : [aw, ls]).join('\n\n')}
}`;
  }

  /** Kalıpsız Main'ler: sürüm sürüm büyüyen paketleme */
  function naiveMain(v) {
    if (v === 'v1')
      return `public class Main {

    public static void main(String[] args) {
        Koli siparis = new Koli("Sipariş KRG-2001", 300);
        siparis.ekle(new Urun("Laptop", 2000));
        siparis.ekle(new Urun("Mouse", 100));
        siparis.ekle(new Urun("Şarj aleti", 400));

        Kantar.listele(siparis);
    }
}`;
    const saat =
      v === 'v4'
        ? `
        Koli saatKutusu = new Koli("Saat kutusu", 100);
        saatKutusu.ekle(new Urun("Saat", 200));
${cm('        aksesuar.ekle(saatKutusu);', 'kutu içinde kutu içinde koli', 60)}
`
        : '';
    const bis = v === 'v3' || v === 'v4';
    return `public class Main {

    public static void main(String[] args) {
        Koli siparis = new Koli("Sipariş KRG-2001", 300);
        siparis.ekle(new Urun("Laptop", 2000));

        Koli aksesuar = new Koli("Aksesuar kutusu", 100);
        aksesuar.ekle(new Urun("Mouse", 100));
        aksesuar.ekle(new Urun("Şarj aleti", 400));
${saat}
${cm('        siparis.ekle(aksesuar);', 'koli içinde koli', 60)}
        siparis.ekle(new Urun("Kılıf", 200));
${
  bis
    ? `
${cm('        Urun bisiklet = new Urun("Bisiklet", 12000);', 'kolisiz gönderilir', 60)}

        Kantar.listele(siparis);
        Kantar.listele(bisiklet);
        System.out.println("Sevkiyat: " + (Kantar.agirlik(siparis) + Kantar.agirlik(bisiklet)) + " g");`
    : `
        Kantar.listele(siparis);`
}
    }
}`;
  }

  /** Sürümler: v1 tek koli · v2 koli içinde koli · v3 kolisiz ürün · v4 (= 3.1) bir kat daha */
  CP.naiveVersions = ['v1', 'v2', 'v3', 'v4'];
  CP.NAIVE_TREE = {
    v1: [K('siparis', [U('laptop'), U('mouse'), U('sarj')])],
    v2: [K('siparis', [U('laptop'), K('aksesuar', [U('mouse'), U('sarj')]), U('kilif')])],
    v3: [K('siparis', [U('laptop'), K('aksesuar', [U('mouse'), U('sarj')]), U('kilif')]), U('bisiklet')],
    v4: [CP.clone(CP.TREE), U('bisiklet')],
  };
  /** Kantar sınıfı: v1 tek döngü, v2 iç içe döngü, v3/v4 ürün için ek metotlar (v4'te Kantar değişmedi) */
  const KANTAR_V = { v1: 'v1', v2: 'v2', v3: 'v3', v4: 'v3' };

  CP.naive = function (v) {
    return {
      Main: naiveMain(v),
      Kantar: naiveKantar(KANTAR_V[v]),
      Koli: naiveKoli(v),
      Urun: code.UrunNaive,
    };
  };
  CP.naiveOrder = () => ['Main', 'Kantar', 'Koli', 'Urun'];

  /** Kalıpsız Kantar'ın hesabı (Java ile birebir): iki kat iner, ürünler önce, koliler sonra */
  const urunlerOf = (n) => n.c.filter((x) => !x.c);
  const kolilerOf = (n) => n.c.filter((x) => x.c);
  function naiveWeight(n, v) {
    if (!n.c) return CP.ITEMS[n.id].g;
    let t = CP.BOXES[n.id].dara + urunlerOf(n).reduce((s, u) => s + CP.ITEMS[u.id].g, 0);
    if (v !== 'v1')
      kolilerOf(n).forEach((ic) => {
        t += CP.BOXES[ic.id].dara + urunlerOf(ic).reduce((s, u) => s + CP.ITEMS[u.id].g, 0);
      });
    return t;
  }
  CP.naiveWeight = naiveWeight;
  const uLine = (u, girinti) => `${girinti}- ${CP.ITEMS[u.id].ad} (${CP.ITEMS[u.id].g} g)`;
  function naiveList(n, v) {
    if (!n.c) return [{ t: uLine(n, ''), id: n.id }];
    const out = [{ t: `+ ${CP.BOXES[n.id].ad} [${naiveWeight(n, v)} g]`, id: n.id }];
    urunlerOf(n).forEach((u) => out.push({ t: uLine(u, '   '), id: u.id }));
    if (v !== 'v1')
      kolilerOf(n).forEach((ic) => {
        out.push({ t: `   + ${CP.BOXES[ic.id].ad} [${naiveWeight(ic, v)} g]`, id: ic.id });
        urunlerOf(ic).forEach((u) => out.push({ t: uLine(u, '      '), id: u.id }));
      });
    return out;
  }

  /** Kalıpsız çıktı: {t, id, bad, note} — bad: gerçekle tutmayan satır */
  CP.naiveOutput = function (v) {
    const roots = CP.NAIVE_TREE[v];
    const out = [];
    roots.forEach((r) => out.push(...naiveList(r, v)));
    if (roots.length > 1) out.push({ t: `Sevkiyat: ${roots.reduce((s, r) => s + naiveWeight(r, v), 0)} g`, total: true });
    if (v === 'v4') {
      const real = CP.weight(roots[0]);
      out.forEach((l) => {
        if (l.id === 'siparis') Object.assign(l, { bad: true, note: `gerçekte ${real} g` });
        if (l.id === 'aksesuar') Object.assign(l, { bad: true, note: 'listede yalnızca 600 g var' });
        if (l.total) Object.assign(l, { bad: true, note: `gerçekte ${roots.reduce((s, r) => s + CP.weight(r), 0)} g` });
      });
    }
    return out;
  };
  /** Gerçek ağırlıklar (kantarın gösterdiği) ve programın bulduğu */
  CP.naiveTotals = function (v) {
    const roots = CP.NAIVE_TREE[v];
    return { program: roots.reduce((s, r) => s + naiveWeight(r, v), 0), real: roots.reduce((s, r) => s + CP.weight(r), 0) };
  };

  // ================================================================== "Çözüm": Composite
  code.Parca = `${doc('«Component» — Ağaçtaki her şey bir parça: tek bir ürün de, içinde başka parçalar olan bir koli de.')}public interface Parca {

${cm('    int agirlik();', 'gram', 40)}

    void listele(String girinti);
}`;

  code.Urun = `${doc('«Leaf» — Ürün: içinde başka parça yok; soruyu kendisi cevaplar.')}public class Urun implements Parca {

    private final String ad;
    private final int gram;

    public Urun(String ad, int gram) {
        this.ad = ad;
        this.gram = gram;
    }

    @Override
    public int agirlik() {
        return gram;
    }

    @Override
    public void listele(String girinti) {
        System.out.println(girinti + "- " + ad + " (" + gram + " g)");
    }
}`;

  /** Koli kaynağı; seffaf: ekle/cikar Parca'da da tanımlı (burada @Override) */
  function koliSrc(seffaf) {
    const ov = seffaf ? '    @Override\n' : '';
    return `import java.util.ArrayList;
import java.util.List;

${doc('«Composite» — Koli: parçaları tutar; her soruyu içindekilere sorup cevapları birleştirir.')}public class Koli implements Parca {

    private final String ad;
${cm('    private final int dara;', 'boş kolinin ağırlığı', 60)}
${cm('    private final List<Parca> icindekiler = new ArrayList<>();', 'ürün de olur, koli de', 60)}

    public Koli(String ad, int dara) {
        this.ad = ad;
        this.dara = dara;
    }

${ov}    public void ekle(Parca p) {
        icindekiler.add(p);
    }

${ov}    public void cikar(Parca p) {
        icindekiler.remove(p);
    }

    @Override
    public int agirlik() {
        int toplam = dara;
        for (Parca p : icindekiler) {
${cm('            toplam += p.agirlik();', 'ürün mü koli mi, sormadan', 60)}
        }
        return toplam;
    }

    @Override
    public void listele(String girinti) {
        System.out.println(girinti + "+ " + ad + " [" + agirlik() + " g]");
        for (Parca p : icindekiler) {
${cm('            p.listele(girinti + "   ");', 'bir kat içeriden', 60)}
        }
    }
}`;
  }
  code.Koli = koliSrc(false);

  /** Şeffaf tasarım: çocuk yönetimi arayüzde; yapraklar varsayılanı (istisna) devralır */
  CP.SEFFAF_MSG = 'Ürünün içine parça konamaz';
  code.ParcaSeffaf = `${doc('«Component» — Şeffaf tasarım: çocuk yönetimi de arayüzde; ürünler varsayılanı devralır.')}public interface Parca {

${cm('    int agirlik();', 'gram', 40)}

    void listele(String girinti);

    default void ekle(Parca p) {
        throw new UnsupportedOperationException("${CP.SEFFAF_MSG}");
    }

    default void cikar(Parca p) {
        throw new UnsupportedOperationException("Üründen parça çıkarılamaz");
    }
}`;
  code.KoliSeffaf = koliSrc(true);

  /** Çözüm'deki paketleme (kalıpsız 3.1 ile aynı sıra) */
  const BUILD = `        Koli siparis = new Koli("Sipariş KRG-2001", 300);
        siparis.ekle(new Urun("Laptop", 2000));

        Koli aksesuar = new Koli("Aksesuar kutusu", 100);
        aksesuar.ekle(new Urun("Mouse", 100));
        aksesuar.ekle(new Urun("Şarj aleti", 400));

        Koli saatKutusu = new Koli("Saat kutusu", 100);
        saatKutusu.ekle(new Urun("Saat", 200));
${cm('        aksesuar.ekle(saatKutusu);', 'kutu içinde kutu içinde koli', 60)}

${cm('        siparis.ekle(aksesuar);', 'koli içinde koli', 60)}
        siparis.ekle(new Urun("Kılıf", 200));`;

  /** Adım 3: Kantar silindi, istemci doğrudan parçalara sorar */
  const MAIN_R3 = `public class Main {

    public static void main(String[] args) {
${BUILD}

${cm('        Urun bisiklet = new Urun("Bisiklet", 12000);', 'kolisiz gönderilir', 60)}

        siparis.listele("");
        bisiklet.listele("");
        System.out.println("Sevkiyat: " + (siparis.agirlik() + bisiklet.agirlik()) + " g");
    }
}`;

  code.Main = `import java.util.List;

public class Main {

    public static void main(String[] args) {
${BUILD}

${cm('        Parca bisiklet = new Urun("Bisiklet", 12000);', 'kolisiz gönderilir', 60)}

        List<Parca> sevkiyat = List.of(siparis, bisiklet);
        int toplam = 0;
        for (Parca p : sevkiyat) {
${cm('            p.listele("");', 'ürün mü koli mi, sormadan', 60)}
            toplam += p.agirlik();
        }
        System.out.println("Sevkiyat: " + toplam + " g");
    }
}`;
  CP.SEVKIYAT = [CP.clone(CP.TREE), U('bisiklet')];
  CP.output = CP.SEVKIYAT.reduce((a, r) => a.concat(CP.manifest(r, '')), []).concat([`Sevkiyat: ${CP.SEVKIYAT.reduce((s, r) => s + CP.weight(r), 0)} g`]);

  // ------------------------------------------------------------------ adım adım yeniden düzenleme
  /** Adım 2'deki Urun: Parca'yı uygular, Kantar hâlâ çalışsın diye get metotları duruyor */
  const URUN_R2 = `public class Urun implements Parca {

    private final String ad;
    private final int gram;

    public Urun(String ad, int gram) {
        this.ad = ad;
        this.gram = gram;
    }

    public String getAd() {
        return ad;
    }

    public int getGram() {
        return gram;
    }

    @Override
    public int agirlik() {
        return gram;
    }

    @Override
    public void listele(String girinti) {
        System.out.println(girinti + "- " + ad + " (" + gram + " g)");
    }
}`;
  const naiveV4 = CP.naive('v4');
  CP.refactor = [
    Object.assign({}, naiveV4), // 0: iki liste, iç içe döngüler, bir kat kayıp
    Object.assign({}, naiveV4, { Parca: plain(code.Parca) }), // 1: ortak arayüz
    Object.assign({}, naiveV4, { Parca: plain(code.Parca), Urun: URUN_R2 }), // 2: yaprak
    { Main: MAIN_R3, Parca: plain(code.Parca), Urun: plain(code.Urun), Koli: plain(code.Koli) }, // 3: bileşik; Kantar silinir
    { Main: plain(code.Main), Parca: plain(code.Parca), Urun: plain(code.Urun), Koli: plain(code.Koli) }, // 4: istemci tek tip
  ];
  CP.refactorOrder = ['Main', 'Parca', 'Urun', 'Koli', 'Kantar'];

  // ================================================================== Main üreticisi (Canlı Akış, tezgâh)
  const urunExpr = (id) => `new Urun("${CP.ITEMS[id].ad}", ${CP.ITEMS[id].g})`;
  const decl = (id, seffaf) => {
    if (id === 'palet') return `${seffaf ? 'Parca' : 'Palet'} palet = new Palet("${CP.PALET.hedef}");`;
    if (CP.BOXES[id]) return `${seffaf ? 'Parca' : 'Koli'} ${CP.BOXES[id].v} = new Koli("${CP.BOXES[id].ad}", ${CP.BOXES[id].dara});`;
    return `Parca ${CP.ITEMS[id].v} = ${urunExpr(id)};`;
  };

  /**
   * Ağacı kuran ve bir işlem çağıran program.
   * o: {mode: 'guvenli'|'seffaf', action: 'agirlik'|'listele'|'ikisi', bad: {target, item}}
   *   bad: ürünün (target) içine bir şey (item) koyma denemesi
   */
  CP.mainFor = function (tree, o) {
    o = o || {};
    const seffaf = o.mode === 'seffaf';
    const bad = o.bad || null;
    const flat = CP.flatten(tree);
    const boxes = flat.filter((f) => f.n.c).map((f) => f.n.id);
    const decls = boxes.map((id) => decl(id, seffaf));
    if (bad) {
      decls.push(decl(bad.target, seffaf));
      if (CP.isBox(bad.item) && !boxes.includes(bad.item)) decls.push(decl(bad.item, seffaf));
    }
    const ref = (id) => (CP.isBox(id) ? (id === 'palet' ? 'palet' : CP.BOXES[id].v) : bad && bad.target === id ? CP.ITEMS[id].v : urunExpr(id));
    const groups = flat
      .filter((f) => f.n.c && f.n.c.length)
      .map((f) => f.n.c.map((x) => `${ref(f.n.id)}.ekle(${ref(x.id)});`));
    const root = ref(tree.id);
    const lines = [];
    decls.forEach((d) => lines.push('        ' + d));
    groups.forEach((g) => {
      lines.push('');
      g.forEach((l) => lines.push('        ' + l));
    });
    if (bad) {
      lines.push('');
      lines.push(cm(`        ${CP.ITEMS[bad.target].v}.ekle(${CP.isBox(bad.item) ? ref(bad.item) : urunExpr(bad.item)});`, 'ürünün içine?', 48));
    }
    lines.push('');
    if (o.action === 'listele' || o.action === 'ikisi') lines.push(`        ${root}.listele("");`);
    if (o.action === 'agirlik' || o.action === 'ikisi') lines.push(`        System.out.println("Toplam: " + ${root}.agirlik() + " g");`);
    return `public class Main {

    public static void main(String[] args) {
${lines.join('\n')}
    }
}`;
  };

  /** Programın çıktısı: normal satırlar, derleme hatası ya da istisna (Java ile birebir) */
  CP.runFor = function (tree, o) {
    o = o || {};
    const bad = o.bad || null;
    if (bad) {
      const main = CP.mainFor(tree, o);
      const ln = CP.lineOf(main, 'ürünün içine?');
      const text = main.split('\n')[ln - 1];
      const v = CP.ITEMS[bad.target].v;
      if (o.mode !== 'seffaf') {
        const arg = CP.isBox(bad.item) ? (bad.item === 'palet' ? 'Palet' : 'Koli') : 'Urun';
        return {
          kind: 'compile',
          lines: [
            { t: `Main.java:${ln}: error: cannot find symbol`, err: true },
            { t: text },
            { t: ' '.repeat(text.indexOf(v + '.ekle(') + v.length) + '^' },
            { t: `  symbol:   method ekle(${arg})` },
            { t: `  location: variable ${v} of type Parca` },
            { t: '1 error', err: true },
          ],
        };
      }
      return {
        kind: 'exception',
        lines: [
          { t: `Exception in thread "main" java.lang.UnsupportedOperationException: ${CP.SEFFAF_MSG}`, err: true },
          { t: `\tat Parca.ekle(Parca.java:${CP.lineOf(code.ParcaSeffaf, 'throw new UnsupportedOperationException("' + CP.SEFFAF_MSG)})`, err: true },
          { t: `\tat Main.main(Main.java:${ln})`, err: true },
        ],
      };
    }
    const out = [];
    if (o.action === 'listele' || o.action === 'ikisi') out.push(...CP.manifest(tree, ''));
    if (o.action === 'agirlik' || o.action === 'ikisi') out.push(`Toplam: ${CP.weight(tree)} g`);
    return { kind: 'ok', lines: out.map((t) => ({ t })) };
  };

  // ================================================================== Canlı Akış
  CP.presets = {
    agirlik: { key: 'agirlik', title: 'Ağırlık · agirlik()', op: 'agirlik', short: 'Ağırlık' },
    listele: { key: 'listele', title: 'Manifesto · listele()', op: 'listele', short: 'Manifesto' },
  };
  CP.presetOrder = ['agirlik', 'listele'];
  CP.akisMain = (p) => CP.mainFor(CP.TREE, { action: p.op });
  CP.akisFiles = (p) => [
    { name: 'Main.java', code: CP.akisMain(p) },
    { name: 'Koli.java', code: code.Koli },
    { name: 'Urun.java', code: code.Urun },
    { name: 'Parca.java', code: code.Parca },
  ];
  CP.akisOutput = (p) => CP.runFor(CP.TREE, { action: p.op }).lines.map((l) => l.t);

  // ================================================================== Paketleme tezgâhı
  /** Rehberli ilk adım: yeni bir dal (hediye kutusu → kupa, balonlu poşet → parfüm) */
  CP.TEZGAH_DAL = K('siparis', [U('laptop'), K('aksesuar', [U('mouse'), U('sarj'), K('saatKutusu', [U('saat')])]), U('kilif'), K('hediye', [U('kupa'), K('poset', [U('parfum')])])]);
  CP.TEZGAH_BAD = { target: 'laptop', item: 'kitap' };
  CP.tezgahFiles = (mode, palet) => {
    const s = mode === 'seffaf';
    const files = { Parca: s ? code.ParcaSeffaf : code.Parca, Urun: code.Urun, Koli: s ? code.KoliSeffaf : code.Koli };
    if (palet) files.Palet = paletSrc(s);
    return files;
  };
  /** Tezgâhın üç denemesi tek programda (java/composite/tezgah) */
  code.TezgahMain = CP.mainFor(CP.TEZGAH_DAL, { action: 'ikisi' });
  CP.tezgahOutput = CP.runFor(CP.TEZGAH_DAL, { action: 'ikisi' }).lines.map((l) => l.t);

  // ================================================================== Genişlet: yeni bileşik (Palet)
  function paletSrc(seffaf) {
    const ov = seffaf ? '    @Override\n' : '';
    return `import java.util.ArrayList;
import java.util.List;

${doc('«Composite» — Palet: koliler ve kolisiz büyük ürünler üzerine dizilir.')}public class Palet implements Parca {

    private final String hedef;
    private final List<Parca> icindekiler = new ArrayList<>();

    public Palet(String hedef) {
        this.hedef = hedef;
    }

${ov}    public void ekle(Parca p) {
        icindekiler.add(p);
    }

    @Override
    public int agirlik() {
${cm(`        int toplam = ${CP.PALET.dara};`, 'ahşap palet', 60)}
        for (Parca p : icindekiler) {
            toplam += p.agirlik();
        }
        return toplam;
    }

    @Override
    public void listele(String girinti) {
        System.out.println(girinti + "# Palet: " + hedef + " [" + agirlik() + " g]");
        for (Parca p : icindekiler) {
            p.listele(girinti + "   ");
        }
    }
}`;
  }
  code.Palet = paletSrc(false);
  CP.paletSrc = paletSrc;

  const EX = (CP.ext = {});
  EX.exercise = `public class Palet implements ⟦1⟧ {

    private final String hedef;
    private final List<⟦2⟧> icindekiler = new ArrayList<>();

    public Palet(String hedef) {
        this.hedef = hedef;
    }

    public void ekle(Parca p) {
        icindekiler.add(p);
    }

    @Override
    public int agirlik() {
${cm(`        int toplam = ${CP.PALET.dara};`, 'ahşap palet', 60)}
        for (Parca p : icindekiler) {
            toplam += p.⟦3⟧();
        }
        return toplam;
    }

    @Override
    public void listele(String girinti) {
        System.out.println(girinti + "# Palet: " + hedef + " [" + agirlik() + " g]");
        for (Parca p : icindekiler) {
            p.⟦4⟧(girinti + "   ");
        }
    }
}`;
  EX.exerciseMain = `// Main.java içine:
Palet palet = new Palet("Malatya");
palet.ekle(siparis);
${cm('palet.ekle(⟦5⟧);', 'kolisiz ürün de palete', 28)}
palet.listele("");`;
  EX.Main = `public class Main {

    public static void main(String[] args) {
${BUILD}

${cm('        Parca bisiklet = new Urun("Bisiklet", 12000);', 'kolisiz gönderilir', 60)}

${cm('        Palet palet = new Palet("Malatya");', 'YENİ bileşik', 60)}
        palet.ekle(siparis);
${cm('        palet.ekle(bisiklet);', 'kolisiz ürün de palete', 60)}

        palet.listele("");
    }
}`;
  EX.TREE = K('palet', [CP.clone(CP.TREE), U('bisiklet')]);
  EX.output = CP.manifest(EX.TREE, '');

  // ================================================================== Gerçek dünya (JDK) örnekleri
  const RW = (CP.rw = {});
  RW.awt = (arg) => `import java.awt.Component;
import java.awt.Container;
import javax.swing.JButton;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JTextField;

public class FormAgaci {

    /** İstemci: her şeye Component der; içine bakmak için Container mı diye sormak zorunda (güvenli tasarım). */
    static int say(Component c) {
        int n = 1;
        if (c instanceof Container kap) {
            for (Component cocuk : kap.getComponents()) {
                n += say(cocuk);
            }
        }
        return n;
    }

    public static void main(String[] args) {
        JPanel adres = new JPanel();
        adres.add(new JLabel("Alıcı:"));
        adres.add(new JTextField(20));

        JPanel form = new JPanel();
${cm('        form.add(adres);', 'panel içinde panel', 52)}
        form.add(new JButton("Gönder"));

        System.out.println(${arg});
    }
}`;
  RW.awtOpts = [
    { label: 'say(form)', arg: 'say(form) + " bileşen"', out: ['5 bileşen'] },
    { label: 'say(adres)', arg: 'say(adres) + " bileşen"', out: ['3 bileşen'] },
    { label: 'getComponentCount()', arg: 'form.getComponentCount() + " doğrudan çocuk"', out: ['2 doğrudan çocuk'] },
  ];

  RW.tree = (arg) => `import javax.swing.tree.DefaultMutableTreeNode;

public class HazirAgac {

    public static void main(String[] args) {
        DefaultMutableTreeNode siparis = new DefaultMutableTreeNode("Sipariş KRG-2001");
        DefaultMutableTreeNode aksesuar = new DefaultMutableTreeNode("Aksesuar kutusu");
        DefaultMutableTreeNode saatKutusu = new DefaultMutableTreeNode("Saat kutusu");
${cm('        DefaultMutableTreeNode laptop = new DefaultMutableTreeNode("Laptop", false);', 'çocuk kabul etmez', 84)}

        siparis.add(laptop);
        siparis.add(aksesuar);
        aksesuar.add(new DefaultMutableTreeNode("Mouse", false));
        aksesuar.add(saatKutusu);
        saatKutusu.add(new DefaultMutableTreeNode("Saat", false));

        ${arg}
    }
}`;
  RW.treeOpts = [
    { label: 'getLeafCount()', arg: 'System.out.println(siparis.getLeafCount() + " yaprak");', out: ['3 yaprak'] },
    { label: 'getDepth()', arg: 'System.out.println(siparis.getDepth() + " kat derinlik");', out: ['3 kat derinlik'] },
    { label: 'aksesuar', arg: 'System.out.println(aksesuar.getLeafCount() + " yaprak, " + aksesuar.getDepth() + " kat");', out: ['2 yaprak, 2 kat'] },
    { label: 'laptop.add(…)', arg: 'laptop.add(new DefaultMutableTreeNode("Kitap"));', out: [] },
  ];
  // Java 21 ile alınan istisna (JDK içindeki satır numaraları sürüme göre değişebilir)
  RW.treeOpts[3].out = [
    'Exception in thread "main" java.lang.IllegalStateException: node does not allow children',
    '\tat java.desktop/javax.swing.tree.DefaultMutableTreeNode.insert(DefaultMutableTreeNode.java:188)',
    '\tat java.desktop/javax.swing.tree.DefaultMutableTreeNode.add(DefaultMutableTreeNode.java:424)',
    `\tat HazirAgac.main(HazirAgac.java:${CP.lineOf(RW.tree(RW.treeOpts[3].arg), 'laptop.add(')})`,
  ];

  RW.dom = (arg) => `import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

public class DomAgaci {

    public static void main(String[] args) throws Exception {
        Document belge = DocumentBuilderFactory.newInstance().newDocumentBuilder().newDocument();
        Element siparis = belge.createElement("koli");
        Element aksesuar = belge.createElement("koli");
        Node laptop = belge.createTextNode("[Laptop]");

        siparis.appendChild(laptop);
${cm('        siparis.appendChild(aksesuar);', 'eleman içinde eleman', 60)}
        aksesuar.appendChild(belge.createTextNode("[Mouse]"));
        aksesuar.appendChild(belge.createTextNode("[Saat]"));

        ${arg}
    }
}`;
  RW.domOpts = [
    { label: 'siparis', arg: 'System.out.println(siparis.getTextContent());', out: ['[Laptop][Mouse][Saat]'] },
    { label: 'aksesuar', arg: 'System.out.println(aksesuar.getTextContent());', out: ['[Mouse][Saat]'] },
    { label: 'laptop', arg: 'System.out.println(laptop.getTextContent());', out: ['[Laptop]'] },
    { label: 'laptop.appendChild(…)', arg: 'laptop.appendChild(belge.createTextNode("[Kitap]"));', out: [] },
  ];
  RW.domOpts[3].out = [
    'Exception in thread "main" org.w3c.dom.DOMException: HIERARCHY_REQUEST_ERR: An attempt was made to insert a node where it is not permitted.',
    '\tat java.xml/com.sun.org.apache.xerces.internal.dom.NodeImpl.insertBefore(NodeImpl.java:474)',
    '\tat java.xml/com.sun.org.apache.xerces.internal.dom.NodeImpl.appendChild(NodeImpl.java:230)',
    `\tat DomAgaci.main(DomAgaci.java:${CP.lineOf(RW.dom(RW.domOpts[3].arg), 'laptop.appendChild(')})`,
  ];

  // ================================================================== UML sınıf diyagramları
  const M = {
    agirlik: { id: 'agirlik', text: '+ agirlik(): int', generic: '+ operation()', abstract: true },
    listele: { id: 'listele', text: '+ listele(girinti)', generic: '+ operation2()', abstract: true },
    ekleP: { id: 'ekle', text: '+ ekle(p) {istisna}', generic: '+ add(c)' },
    cikarP: { id: 'cikar', text: '+ cikar(p) {istisna}', generic: '+ remove(c)' },
    leafAgirlik: { id: 'agirlik', text: '+ agirlik(): int', generic: '+ operation()' },
    leafListele: { id: 'listele', text: '+ listele(girinti)', generic: '+ operation2()' },
    icindekiler: { id: 'icindekiler', text: '- icindekiler: List<Parca>', generic: '- children: List<Component>', color: 3 },
    ekle: { id: 'ekle', text: '+ ekle(p)', generic: '+ add(c)' },
    cikar: { id: 'cikar', text: '+ cikar(p)', generic: '+ remove(c)' },
    compAgirlik: { id: 'agirlik', text: '+ agirlik(): int', generic: '+ operation()', factory: true },
    compListele: { id: 'listele', text: '+ listele(girinti)', generic: '+ operation2()', factory: true },
  };
  CP.members = M;

  const mainBox = () => ({ id: 'Main', name: 'Main', generic: 'Client', kind: 'class', role: 'client', x: 20, y: 44, w: 170, members: [{ id: 'main', text: '+ main(args)', generic: '+ main()' }] });
  const parcaBox = (seffaf) => ({ id: 'Parca', name: 'Parca', generic: 'Component', kind: 'interface', role: 'component', x: 290, y: 20, w: 300, members: [M.agirlik, M.listele].concat(seffaf ? [M.ekleP, M.cikarP] : []) });
  const urunBox = () => ({ id: 'Urun', name: 'Urun', generic: 'Leaf', kind: 'class', role: 'leaf', x: 40, y: 290, w: 230, members: [M.leafAgirlik, M.leafListele] });
  const koliBox = () => ({ id: 'Koli', name: 'Koli', generic: 'Composite', kind: 'class', role: 'composite', x: 330, y: 290, w: 300, members: [M.icindekiler, M.ekle, M.cikar, M.compAgirlik, M.compListele] });
  const realize = (id, x) => ({ id: 'r-' + id.toLowerCase(), from: id, to: 'Parca', type: 'realization', fromSide: 'top', fromAt: x, toSide: 'bottom', toAt: 440, mid: 240 });
  // bileşik, bileşeni hem uygular hem içerir: ◇ toplama Koli'nin sağından Parca'nın sağına döner
  const childrenEdge = () => ({ id: 'cocuklar', from: 'Koli', to: 'Parca', type: 'aggregation', label: 'icindekiler 0..*', genericLabel: 'children 0..*', fromSide: 'right', fromAt: 322, toSide: 'right', toAt: 70, points: [[716, 322], [716, 70]], labelAt: [653, 61] });
  const usesEdge = (label) => ({ id: 'uses', from: 'Main', to: 'Parca', type: 'dependency', label: label || 'kullanır', genericLabel: 'uses', fromSide: 'right', fromAt: 79, toSide: 'left', toAt: 79 });

  /** GoF yapısı (Yapı sahnesi, Canlı Akış, özet). o.seffaf: ekle/cikar Parca'da · o.notes: Koli.agirlik notu */
  CP.gofDiagram = function (o) {
    o = o || {};
    const classes = [mainBox(), parcaBox(o.seffaf), urunBox(), koliBox()];
    const relations = [usesEdge(), realize('Urun', 155), realize('Koli', 480), childrenEdge()];
    const notes = o.notes
      ? [{ id: 'n-op', x: 740, y: 372, text: 'int toplam = dara;\nfor (Parca p : icindekiler)\n    toplam += p.agirlik();', genericText: 'forall c in children:\n    c.operation();', target: 'Koli', from: 'left', to: 'right', toAt: 395 }]
      : [];
    return { width: 1000, height: 480, title: 'Composite sınıf diyagramı', classes, relations, notes };
  };

  /**
   * "Çözüm" sahnesinin her adımındaki diyagram.
   * 0: kalıpsız (Kantar, iki liste) · 1: Parca · 2: Urun yaprak olur · 3: Koli bileşik olur, Kantar silinir · 4: istemci Parca'yı kullanır
   */
  CP.solutionDiagram = function (st) {
    const classes = [];
    const relations = [];
    if (st <= 2) {
      classes.push({ id: 'Kantar', name: 'Kantar', kind: 'class', role: 'client', x: 712, y: 30, w: 270, members: [{ id: 'ag', text: '+ agirlik(Koli) · 2 kat döngü' }, { id: 'ls', text: '+ listele(Koli) · 2 kat döngü' }, { id: 'u', text: '+ agirlik(Urun), listele(Urun)' }] });
      classes.push({ id: 'Main', name: 'Main', kind: 'class', role: 'client', x: 20, y: 44, w: 170, members: [{ id: 'main', text: '+ main(args)' }] });
      relations.push({ id: 'k-main', from: 'Main', to: 'Kantar', type: 'dependency', label: 'kullanır', fromSide: 'top', fromAt: 105, toSide: 'top', toAt: 846, points: [[105, 8], [846, 8]], labelAt: [450, 2] });
      relations.push({ id: 'k-koli', from: 'Kantar', to: 'Koli', type: 'dependency', label: 'içine bakar', fromSide: 'bottom', fromAt: 846, toSide: 'right', toAt: 360 });
    }
    if (st >= 1) classes.push(parcaBox(false));
    // Urun
    if (st <= 1) classes.push({ id: 'Urun', name: 'Urun', kind: 'class', role: 'leaf', x: 40, y: 290, w: 230, members: [{ id: 'g1', text: '+ getAd(): String' }, { id: 'g2', text: '+ getGram(): int' }] });
    else if (st === 2) classes.push({ id: 'Urun', name: 'Urun', kind: 'class', role: 'leaf', x: 40, y: 290, w: 230, members: [{ id: 'g1', text: '+ getAd(), getGram()' }, M.leafAgirlik, M.leafListele] });
    else classes.push(urunBox());
    if (st >= 2) relations.push(realize('Urun', 155));
    // Koli
    if (st <= 2) {
      classes.push({ id: 'Koli', name: 'Koli', kind: 'class', role: 'composite', x: 330, y: 290, w: 300, members: [{ id: 'u', text: '- urunler: List<Urun>' }, { id: 'k', text: '- koliler: List<Koli>' }, { id: 'e1', text: '+ ekle(Urun)' }, { id: 'e2', text: '+ ekle(Koli)' }] });
      relations.push({ id: 'n-urun', from: 'Koli', to: 'Urun', type: 'association', label: 'urunler', fromSide: 'left', fromAt: 340, toSide: 'right', toAt: 340 });
      relations.push({ id: 'n-koli', from: 'Koli', to: 'Koli', type: 'association', label: 'koliler', fromSide: 'bottom', fromAt: 560, toSide: 'bottom', toAt: 400, points: [[560, 450], [400, 450]], labelAt: [480, 442] });
    } else {
      classes.push(koliBox());
      relations.push(realize('Koli', 480), childrenEdge());
    }
    if (st >= 3) classes.push(mainBox());
    if (st === 3) relations.push(usesEdge('listele, agirlik'));
    if (st >= 4) relations.push(usesEdge('List<Parca>'));
    return { width: 1000, height: 480, view: [0, -12, 1000, 484], classes, relations };
  };

  // ------------------------------------------------------------------ UML sıralama diyagramı (Canlı Akış)
  /** Canlı Akış ağacının nesneleri: değişken adı ve tipi */
  CP.objName = (id) => (CP.BOXES[id] ? CP.BOXES[id].v : CP.ITEMS[id].v);
  /**
   * Akış adımları ile aynı düzende mesajlar. Yaprak çağrısı kısa (dönüşü etikette), bileşik çağrısı + dönüşü ayrı.
   * Dönüş: {spec, msgOf: {'call:id' | 'ret:id': mesaj sırası}}
   */
  CP.seqSpec = function (p) {
    const flat = CP.flatten(CP.TREE);
    const parts = [{ id: 'main', label: 'Main', role: 'client' }].concat(
      flat.map((f) => ({ id: f.n.id, label: CP.objName(f.n.id) + '\n: ' + CP.classOf(f.n.id), role: f.n.c ? 'composite' : 'leaf', object: true }))
    );
    const messages = [];
    const msgOf = {};
    const girinti = (d) => '"' + '·'.repeat(3 * d) + '"'; // boşluklar SVG'de görünsün diye nokta
    const label = (n, d) => (p.op === 'agirlik' ? 'agirlik()' : `listele(${girinti(d)})`);
    const visit = (n, from, d) => {
      if (!n.c) {
        msgOf['call:' + n.id] = messages.length;
        messages.push({ from, to: n.id, kind: 'call', short: true, label: label(n, d) + (p.op === 'agirlik' ? ' → ' + CP.ITEMS[n.id].g : '') });
        return;
      }
      msgOf['call:' + n.id] = messages.length;
      messages.push({ from, to: n.id, kind: 'call', label: label(n, d) });
      if (p.op === 'listele') {
        msgOf['self:' + n.id] = messages.length;
        messages.push({ from: n.id, to: n.id, kind: 'self', short: true, label: 'agirlik() → ' + CP.weight(n) });
      }
      n.c.forEach((x) => visit(x, n.id, d + 1));
      msgOf['ret:' + n.id] = messages.length;
      messages.push({ from: n.id, to: from, kind: 'return', label: p.op === 'agirlik' ? String(CP.weight(n)) : '' });
    };
    visit(CP.TREE, 'main', 0);
    const rowH = 36;
    const h = 120 + messages.reduce((s, m) => s + (m.kind === 'self' ? rowH + 16 : rowH), 0) + 30;
    return { spec: { width: 1060, height: h, top: 100, margin: 62, rowH, participants: parts, messages, initialActive: ['main'] }, msgOf };
  };
})();
