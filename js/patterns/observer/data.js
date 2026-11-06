/*
 * Observer — veri: Java kodları, çalıştırma benzetimi, roller, diyagram tanımları.
 * Bu dosya DOM kullanmaz; tools/export-java.js de Java dosyalarını buradan üretir.
 *
 * Senaryo (lojistik dünyasının devamı): gönderi takibi. KRG-1001’in (Ali Şahin, Malatya) durumu değiştikçe
 * (Hazırlanıyor → Yolda → Dağıtımda → Teslim edildi) üç ekran haberdar olmalı: Ali’nin telefonu (SMS), satıcı paneli
 * ve kurye tableti (dağıtımdaki gönderiler kuryenin rotasında).
 *   Sürüm 1.0: Gonderi telefonu ve paneli adlarıyla tanır, ikisinin kendine özgü yöntemlerini çağırır.
 *   Sürüm 1.1: kurye tableti eklendi → Gonderi’ye yeni alan, yeni kurucu parametresi, yeni çağrı.
 *   Sürüm 2.0: teslimde imza için teslimEt() yazıldı; bildirimler kopyalandı, tablet unutuldu →
 *              panel “teslim edildi” derken tablet gönderiyi hâlâ rotada gösteriyor: kurye kapıya yeniden gidecek.
 * Observer: ekranlar tek bir arayüzü (GonderiGozlemcisi.guncelle) uygular; Gonderi yalnızca bir abone listesi tutar
 * ve her değişiklikte bildir() ile hepsine haber verir. Kimin abone olduğunu Main (çalışma anında) belirler.
 */
(function () {
  'use strict';
  const DP = (window.DP = window.DP || {});
  const OB = (DP.obs = DP.obs || {});

  // ------------------------------------------------------------------ roller
  OB.roles = {
    client: { en: 'Client', tr: 'İstemci', color: 1 },
    subject: { en: 'Subject', tr: 'Konu (gözlenen)', color: 3 },
    observer: { en: 'Observer', tr: 'Gözlemci (arayüz)', color: 2 },
    concreteObserver: { en: 'ConcreteObserver', tr: 'Somut gözlemci', color: 4 },
  };

  OB.classRoles = {
    Main: 'client',
    Gonderi: 'subject',
    GonderiGozlemcisi: 'observer',
    AliciTelefonu: 'concreteObserver',
    SaticiPaneli: 'concreteObserver',
    KuryeTableti: 'concreteObserver',
    CagriMerkezi: 'concreteObserver',
    // GoF genel adları
    Client: 'client',
    Subject: 'subject',
    ConcreteSubject: 'subject',
    Observer: 'observer',
    ConcreteObserver: 'concreteObserver',
  };

  OB.roleOf = function (name) {
    const r = OB.classRoles[name];
    return r ? OB.roles[r].color : null;
  };

  // `bildir` ve `guncelle`: bildirim zincirinin iki ucu (kodda ayrıca vurgulanır)
  OB.special = { bildir: 'bil', guncelle: 'bil' };

  /** 1 tabanlı satır numarası. */
  OB.lineOf = function (src, needle, from) {
    const lines = src.split('\n');
    for (let i = from || 0; i < lines.length; i++) if (lines[i].includes(needle)) return i + 1;
    return 0;
  };

  /** Satırın sonuna, belirli bir sütundan başlayan yorum ekler (satır uzunsa en az iki boşluk). */
  const cm = (line, comment, col) => line.padEnd(Math.max(col || 60, line.length + 2)) + '// ' + comment;
  const doc = (text, ind) => {
    const p = ind || '';
    return `${p}/**\n${p} * ${text}\n${p} */\n`;
  };
  const plain = (src) => src.replace(/^((?:import [^\n]+\n)*\n?)\/\*\*[\s\S]*?\*\/\n/, '$1');
  OB.plain = plain;

  const code = (OB.code = {});

  // ================================================================== dünya: gönderiler, durumlar, ekranlar
  OB.DURUMLAR = ['Hazırlanıyor', 'Yolda', 'Dağıtımda', 'Teslim edildi'];
  OB.TESLIM = 'Teslim edildi';
  OB.GONDERI = {
    'KRG-1001': { kisi: 'Ali', tam: 'Ali Şahin', sehir: 'Malatya', tel: 'aliTel' },
    'KRG-1003': { kisi: 'Zeynep', tam: 'Zeynep Güneş', sehir: 'İzmir', tel: 'zeynepTel', soguk: true },
  };
  OB.kisa = (g) => g.slice(4);
  /** Gözlemci nesneleri (Main’deki değişkenler) */
  OB.GOZ = {
    aliTel: { sinif: 'AliciTelefonu', ad: 'Ali’nin telefonu', kisi: 'Ali', tel: true },
    zeynepTel: { sinif: 'AliciTelefonu', ad: 'Zeynep’in telefonu', kisi: 'Zeynep', tel: true },
    panel: { sinif: 'SaticiPaneli', ad: 'Satıcı paneli' },
    tablet: { sinif: 'KuryeTableti', ad: 'Kurye tableti' },
    merkez: { sinif: 'CagriMerkezi', ad: 'Çağrı merkezi' },
  };
  OB.GOZ_SIRA = ['aliTel', 'zeynepTel', 'panel', 'tablet', 'merkez'];
  OB.EKRAN_SINIFLARI = ['AliciTelefonu', 'SaticiPaneli', 'KuryeTableti', 'CagriMerkezi'];

  // ------------------------------------------------------------------ istekler
  const S = (g, durum) => ({ t: 'durum', g, durum });
  const TE = (g) => ({ t: 'teslim', g });
  const C = (g, o) => ({ t: 'cik', g, o });
  const E = (g, o) => ({ t: 'ekle', g, o });
  OB.op = { S, TE, C, E };
  /** Bir gönderinin sıradaki durum isteği (son durumda teslimEt) */
  OB.ilerle = (g, durum) => {
    const k = OB.DURUMLAR.indexOf(durum);
    if (k < 0 || k >= OB.DURUMLAR.length - 1) return null;
    return k + 1 === OB.DURUMLAR.length - 1 ? TE(g) : S(g, OB.DURUMLAR[k + 1]);
  };

  // ================================================================== ekranlar (somut gözlemciler) — kalıpsız ve kalıplı
  const EKRAN_BELGE = {
    AliciTelefonu: 'Alıcının telefonu: gönderinin her yeni durumunu SMS olarak alır.',
    SaticiPaneli: 'Satıcı paneli: mağazanın bütün gönderilerini tek listede gösterir.',
    KuryeTableti: 'Kurye tableti: dağıtımdakiler rotaya girer, teslim edilenler çıkar.',
    CagriMerkezi: 'Çağrı merkezi: müşteri arayınca gönderinin son durumunu söyler.',
  };
  const belgeOf = (sinif, gozlemci) => (gozlemci ? '«ConcreteObserver» — ' : '') + EKRAN_BELGE[sinif];
  /** Kalıplı sürümde ekran durumu gönderiden kendisi çeker (pull) */
  const GUNCELLE_BAS = `    @Override
    public void guncelle(Gonderi gonderi) {
        String takipNo = gonderi.getTakipNo();
        String durum = gonderi.getDurum();`;

  /** o: {gozlemci: GonderiGozlemcisi’ni uygular mı, belge, merakli: teslimden sonra abonelikten kendisi çıkar} */
  function telefonSrc(o) {
    const imza = o.gozlemci ? GUNCELLE_BAS : '    public void smsGonder(String takipNo, String durum) {';
    const merak = o.merakli
      ? `
${cm('        if (durum.equals("Teslim edildi")) {', 'teslimden sonra SMS gerekmez', 52)}
            gonderi.aboneCikar(this);
        }`
      : '';
    return `${o.belge ? doc(belgeOf('AliciTelefonu', o.gozlemci)) : ''}public class AliciTelefonu${o.gozlemci ? ' implements GonderiGozlemcisi' : ''} {

    private final String ad;

    public AliciTelefonu(String ad) {
        this.ad = ad;
    }

${imza}
        System.out.println("  SMS → " + ad + ": " + takipNo + " " + durum);${merak}
    }
}`;
  }

  function panelSrc(o) {
    const imza = o.gozlemci ? GUNCELLE_BAS : '    public void satirGuncelle(String takipNo, String durum) {';
    return `import java.util.Map;
import java.util.StringJoiner;
import java.util.TreeMap;

${o.belge ? doc(belgeOf('SaticiPaneli', o.gozlemci)) : ''}public class SaticiPaneli${o.gozlemci ? ' implements GonderiGozlemcisi' : ''} {

    private final Map<String, String> satirlar = new TreeMap<>();

${imza}
        satirlar.put(takipNo, durum);
        System.out.println("  Panel: " + takipNo + " = " + durum);
    }

    public String ekran() {
        StringJoiner ekran = new StringJoiner(" · ", "Satıcı paneli: ", "");
        ekran.setEmptyValue("Satıcı paneli: boş");
        satirlar.forEach((takipNo, durum) -> ekran.add(takipNo + " " + durum));
        return ekran.toString();
    }
}`;
  }

  function tabletSrc(o) {
    const imza = o.gozlemci ? GUNCELLE_BAS : '    public void rotaGuncelle(String takipNo, String durum) {';
    return `import java.util.Set;
import java.util.TreeSet;

${o.belge ? doc(belgeOf('KuryeTableti', o.gozlemci)) : ''}public class KuryeTableti${o.gozlemci ? ' implements GonderiGozlemcisi' : ''} {

    private final Set<String> duraklar = new TreeSet<>();

${imza}
        if (durum.equals("Dağıtımda")) {
            duraklar.add(takipNo);
            System.out.println("  Tablet: " + takipNo + " rotaya eklendi");
        } else if (durum.equals("Teslim edildi")) {
            duraklar.remove(takipNo);
            System.out.println("  Tablet: " + takipNo + " rotadan çıktı");
        } else {
            System.out.println("  Tablet: " + takipNo + " " + durum);
        }
    }

    public String rota() {
        if (duraklar.isEmpty()) {
            return "Kurye rotası: boş";
        }
        return "Kurye rotası: " + String.join(" ", duraklar);
    }
}`;
  }

  function merkezSrc(o) {
    return `import java.util.Map;
import java.util.TreeMap;

${o && o.belge ? doc(belgeOf('CagriMerkezi', true)) : ''}public class CagriMerkezi implements GonderiGozlemcisi {

    private final Map<String, String> kayitlar = new TreeMap<>();

${GUNCELLE_BAS}
        kayitlar.put(takipNo, durum);
        System.out.println("  Çağrı merkezi: " + takipNo + " kaydı → " + durum);
    }

    public String sorgula(String takipNo) {
        String durum = kayitlar.getOrDefault(takipNo, "kayıt yok");
        return "Çağrı merkezi: " + takipNo + " → " + durum;
    }
}`;
  }

  code.Arayuz = `${doc('«Observer» — Gönderiyi izleyenlerin ortak arayüzü: gönderi değişince çağrılır.')}public interface GonderiGozlemcisi {

    void guncelle(Gonderi gonderi);
}`;
  code.TelefonNaive = telefonSrc({ belge: true });
  code.PanelNaive = panelSrc({ belge: true });
  code.TabletNaive = tabletSrc({ belge: true });
  code.AliciTelefonu = telefonSrc({ gozlemci: true, belge: true });
  code.SaticiPaneli = panelSrc({ gozlemci: true, belge: true });
  code.KuryeTableti = tabletSrc({ gozlemci: true, belge: true });
  code.CagriMerkezi = merkezSrc({ belge: true });

  // ================================================================== Gonderi (konu) — bütün sürümler
  const SINIF = { telefon: 'AliciTelefonu', panel: 'SaticiPaneli', tablet: 'KuryeTableti' };
  const OZEL = { telefon: 'smsGonder', panel: 'satirGuncelle', tablet: 'rotaGuncelle' };
  /** Uzun bir imzayı virgülden böler (devam satırı 12 boşluk girintili) */
  function imzaSar(bas, params, son) {
    const tek = `${bas}${params.join(', ')}${son}`;
    if (tek.length <= 80) return tek;
    let satir = bas;
    const out = [];
    params.forEach((p, i) => {
      const parca = p + (i < params.length - 1 ? ',' : son);
      if ((satir + parca).length > 80 && satir.trim() !== bas.trim()) {
        out.push(satir.trimEnd());
        satir = '            ';
      }
      satir += parca + (i < params.length - 1 ? ' ' : '');
    });
    out.push(satir);
    return out.join('\n');
  }

  /**
   * o: {ekranlar: ['telefon','panel'(,'tablet')], cagri: 'ozel' (her ekranın kendi yöntemi) | 'guncelle' (ortak arayüz)
   *     | 'liste' (abone listesi + bildir), teslimEt, unutur (teslimEt tableti çağırmaz), aboneYonet (aboneEkle/Cikar,
   *     kurucuda ekran yok), kopya (bildir listenin kopyasını dolaşır), belge}
   */
  function gonderiSrc(o) {
    const liste = o.cagri === 'liste';
    const imp = liste ? 'import java.util.ArrayList;\nimport java.util.List;\n\n' : '';
    const alanlar = ['    private final String takipNo;', '    private String durum = "Hazırlanıyor";'];
    if (liste) alanlar.push('    private final List<GonderiGozlemcisi> aboneler = new ArrayList<>();');
    else o.ekranlar.forEach((e) => alanlar.push(`    private final ${SINIF[e]} ${e};`));
    const params = ['String takipNo'].concat(o.aboneYonet ? [] : o.ekranlar.map((e) => `${SINIF[e]} ${e}`));
    const govde = ['        this.takipNo = takipNo;'];
    if (!o.aboneYonet) o.ekranlar.forEach((e) => govde.push(liste ? `        aboneler.add(${e});` : `        this.${e} = ${e};`));
    const yonet = o.aboneYonet
      ? `

    public void aboneEkle(GonderiGozlemcisi abone) {
        aboneler.add(abone);
    }

    public void aboneCikar(GonderiGozlemcisi abone) {
        aboneler.remove(abone);
    }`
      : '';
    const bildir = liste
      ? `

    private void bildir() {
        for (GonderiGozlemcisi abone : ${o.kopya ? 'List.copyOf(aboneler)' : 'aboneler'}) {
            abone.guncelle(this);
        }
    }`
      : '';
    const cagrilar = (ekr) => (liste ? ['        bildir();'] : ekr.map((e) => (o.cagri === 'ozel' ? `        ${e}.${OZEL[e]}(takipNo, durum);` : `        ${e}.guncelle(this);`)));
    const teslim = o.teslimEt
      ? `

    public void teslimEt(String teslimAlan) {
        durum = "Teslim edildi";
        System.out.println("[" + takipNo + "] " + durum + " · " + teslimAlan);
${cagrilar(o.unutur ? o.ekranlar.filter((e) => e !== 'tablet') : o.ekranlar).join('\n')}
    }`
      : '';
    const getters =
      o.cagri !== 'ozel'
        ? `

    public String getTakipNo() {
        return takipNo;
    }

    public String getDurum() {
        return durum;
    }`
        : '';
    return `${imp}${o.belge ? doc(o.belge) : ''}public class Gonderi {

${alanlar.join('\n')}

${imzaSar('    public Gonderi(', params, ') {')}
${govde.join('\n')}
    }${yonet}${bildir}

    public void setDurum(String durum) {
        this.durum = durum;
        System.out.println("[" + takipNo + "] " + durum);
${cagrilar(o.ekranlar).join('\n')}
    }${teslim}${getters}
}`;
  }
  const UC = ['telefon', 'panel', 'tablet'];
  const GONDERI_BELGE = {
    v1: 'Gönderi: durumu değişince alıcının telefonuna ve satıcı paneline haber verir.',
    v2: 'Gönderi: durumu değişince telefona, satıcı paneline ve kurye tabletine haber verir.',
    sabit: 'Gönderi: abone listesindeki herkese haber verir; liste kurucuda sabitlenir.',
    obs: '«Subject» — Gönderi: durumu değişince abonelerine haber verir; sınıflarını bilmez.',
  };
  const GONDERI = {
    v1: { ekranlar: ['telefon', 'panel'], cagri: 'ozel' },
    v11: { ekranlar: UC, cagri: 'ozel' },
    v2: { ekranlar: UC, cagri: 'ozel', teslimEt: true, unutur: true },
    r1: { ekranlar: UC, cagri: 'guncelle', teslimEt: true, unutur: true },
    sabit: { ekranlar: UC, cagri: 'liste', teslimEt: true },
    obs: { ekranlar: UC, cagri: 'liste', teslimEt: true, aboneYonet: true },
  };
  code.GonderiV1 = gonderiSrc(Object.assign({ belge: GONDERI_BELGE.v1 }, GONDERI.v1));
  code.GonderiV11 = gonderiSrc(Object.assign({ belge: GONDERI_BELGE.v2 }, GONDERI.v11));
  code.GonderiV2 = gonderiSrc(Object.assign({ belge: GONDERI_BELGE.v2 }, GONDERI.v2));
  code.GonderiSabit = gonderiSrc(Object.assign({ belge: GONDERI_BELGE.sabit }, GONDERI.sabit));
  code.Gonderi = gonderiSrc(Object.assign({ belge: GONDERI_BELGE.obs }, GONDERI.obs));
  /** Gonderi’nin adıyla tanıdığı ekran sınıfı sayısı */
  OB.tanidigi = (src) => OB.EKRAN_SINIFLARI.filter((n) => new RegExp('\\b' + n + '\\b').test(src)).length;

  // ================================================================== programlar (Main üreticileri)
  /**
   * Program: {tasarim: 'dogrudan'|'r1'|'sabit'|'observer', surum: 'v1'|'v11'|'v2' (yalnızca dogrudan),
   *           gonderiler: ['KRG-1001', …], ilk: {gonderi: [gözlemci, …]} (başlangıç aboneleri; kalıpsızda kurucu sırası),
   *           ops: [istek], ozet: ['panel'|'tablet'|'merkez'] (sondaki ekran özetleri),
   *           merakli: telefon teslimden sonra abonelikten çıkar (Yapı), kopya: bildir listenin kopyasını dolaşır}
   */
  OB.kalipli = (prog) => prog.tasarim === 'observer';
  OB.teslimEtVar = (prog) => !(prog.tasarim === 'dogrudan' && (prog.surum || 'v2') !== 'v2');
  OB.tabletUnutulur = (prog) => (prog.tasarim === 'dogrudan' && (prog.surum || 'v2') === 'v2') || prog.tasarim === 'r1';
  /** Main’de tanımlanan gözlemciler (kanonik sırayla) */
  OB.tanimli = function (prog) {
    const set = {};
    prog.gonderiler.forEach((g) => prog.ilk[g].forEach((o) => (set[o] = true)));
    if (OB.kalipli(prog)) prog.ops.forEach((op) => op.o && (set[op.o] = true));
    return OB.GOZ_SIRA.filter((o) => set[o]);
  };
  /** Gözlemcinin Main’deki değişken adı: tek telefon varsa `telefon` */
  OB.degisken = function (prog, o) {
    if (!OB.GOZ[o].tel) return o;
    const tel = OB.tanimli(prog).filter((x) => OB.GOZ[x].tel).length;
    return tel > 1 ? o : 'telefon';
  };
  OB.gDegisken = (prog, g) => (prog.gonderiler.length > 1 ? 'g' + OB.kisa(g) : 'gonderi');
  const deDa = (s) => {
    const v = s.toLowerCase().match(/[aeıioöuü]/g) || ['e'];
    return 'aıou'.includes(v[v.length - 1]) ? 'da' : 'de';
  };
  OB.istekSatiri = function (prog, op) {
    const gv = OB.gDegisken(prog, op.g);
    if (op.t === 'durum') return `${gv}.setDurum("${op.durum}");`;
    if (op.t === 'teslim') return OB.teslimEtVar(prog) ? `${gv}.teslimEt("${OB.GONDERI[op.g].tam}");` : `${gv}.setDurum("Teslim edildi");`;
    const ov = OB.degisken(prog, op.o);
    if (OB.kalipli(prog)) return `${gv}.${op.t === 'cik' ? 'aboneCikar' : 'aboneEkle'}(${ov});`;
    return op.t === 'cik' ? `// istek: ${ov} artık ${gv} bildirimi almasın (yolu yok)` : `// istek: ${ov} ${deDa(ov)} ${gv} bildirimi alsın (yolu yok)`;
  };
  const KURUCU = {
    aliTel: 'new AliciTelefonu("Ali")',
    zeynepTel: 'new AliciTelefonu("Zeynep")',
    panel: 'new SaticiPaneli()',
    tablet: 'new KuryeTableti()',
    merkez: 'new CagriMerkezi()',
  };
  const OZET = { panel: 'ekran()', tablet: 'rota()' };
  OB.mainFor = function (prog) {
    const L = [];
    OB.tanimli(prog).forEach((o) => L.push(`        ${OB.GOZ[o].sinif} ${OB.degisken(prog, o)} = ${KURUCU[o]};`));
    prog.gonderiler.forEach((g) => {
      const gv = OB.gDegisken(prog, g);
      if (OB.kalipli(prog)) {
        L.push(`        Gonderi ${gv} = new Gonderi("${g}");`);
        prog.ilk[g].forEach((o) => L.push(`        ${gv}.aboneEkle(${OB.degisken(prog, o)});`));
      } else L.push(`        Gonderi ${gv} = new Gonderi("${g}", ${prog.ilk[g].map((o) => OB.degisken(prog, o)).join(', ')});`);
    });
    L.push('');
    prog.ops.forEach((op) => L.push('        ' + OB.istekSatiri(prog, op)));
    (prog.ozet || []).forEach((o) => L.push(o === 'merkez' ? `        System.out.println(merkez.sorgula("${prog.gonderiler[0]}"));` : `        System.out.println(${o}.${OZET[o]});`));
    return `public class Main {

    public static void main(String[] args) {
${L.join('\n')}
    }
}`;
  };

  /** Programın bütün dosyaları */
  OB.filesFor = function (prog) {
    const T = prog.tasarim;
    const F = { Main: OB.mainFor(prog) };
    if (T === 'dogrudan') {
      const v = prog.surum || 'v2';
      F.Gonderi = { v1: code.GonderiV1, v11: code.GonderiV11, v2: code.GonderiV2 }[v];
      F.AliciTelefonu = code.TelefonNaive;
      F.SaticiPaneli = code.PanelNaive;
      if (v !== 'v1') F.KuryeTableti = code.TabletNaive;
      return F;
    }
    if (T === 'r1') F.Gonderi = plain(gonderiSrc(GONDERI.r1));
    else if (T === 'sabit') F.Gonderi = code.GonderiSabit;
    else F.Gonderi = prog.kopya ? gonderiSrc(Object.assign({ belge: GONDERI_BELGE.obs, kopya: true }, GONDERI.obs)) : code.Gonderi;
    F.GonderiGozlemcisi = code.Arayuz;
    F.AliciTelefonu = prog.merakli ? telefonSrc({ gozlemci: true, belge: true, merakli: true }) : code.AliciTelefonu;
    F.SaticiPaneli = code.SaticiPaneli;
    F.KuryeTableti = code.KuryeTableti;
    if (OB.tanimli(prog).includes('merkez')) F.CagriMerkezi = code.CagriMerkezi;
    return F;
  };
  OB.fileOrder = ['Main', 'Gonderi', 'GonderiGozlemcisi', 'AliciTelefonu', 'SaticiPaneli', 'KuryeTableti', 'CagriMerkezi'];
  OB.fileList = (F, order) => (order || OB.fileOrder).filter((n) => F[n]).map((n) => ({ name: n + '.java', code: F[n] }));

  // ================================================================== çalıştırma benzetimi (Java ile birebir)
  /**
   * Programı adım adım çalıştırır. Kalıpsız tasarımda kimin haber alacağı kodda sabittir (kurucu); kalıplı tasarımda
   * abone listesi çalışma anında değişir. Ayrıca kullanıcının niyetini izler: bir ekran ayrılmak isteyip yine bildirim
   * alıyorsa “istenmeyen”, abone olmak isteyip alamıyorsa “kaçan” bildirimdir.
   * Dönüş: {lines, olaylar, son}
   *   lines  : [{t, k: 'konu'|'sms'|'panel'|'tablet'|'merkez'|'ozet'|'hata', g, o, i: istek no}]
   *   olaylar: {e, i, n: o ana kadarki satır sayısı, s: anlık durum, ...}
   */
  OB.run = function (prog) {
    const kalipli = OB.kalipli(prog);
    const teslimEtVar = OB.teslimEtVar(prog);
    const unutur = OB.tabletUnutulur(prog);
    const gs = prog.gonderiler;
    const durum = {};
    const liste = {};
    const niyet = {};
    const ekran = {};
    const kacirdi = {}; // bildirim isteyip alamadığı son değişiklik (yeniden haber alınca silinir)
    const aboneAn = {}; // gözlemci gönderiyi izlemeye ne zaman başladı (sıra no)
    const degisAn = {}; // gönderinin son değişikliği (sıra no)
    let an = 0;
    OB.GOZ_SIRA.forEach((o) => {
      ekran[o] = {};
      kacirdi[o] = {};
      aboneAn[o] = {};
    });
    const sms = {};
    let duraklar = [];
    let bildirim = 0;
    let istenmeyen = 0;
    let kacan = 0;
    let modCount = 0;
    const lines = [];
    const olaylar = [];
    let i = -1;
    let cokus = null;

    const kopyala = (m) => {
      const r = {};
      Object.keys(m).forEach((k) => (r[k] = Array.isArray(m[k]) ? m[k].slice() : Object.assign({}, m[k])));
      return r;
    };
    const snap = () => ({ durum: Object.assign({}, durum), liste: kopyala(liste), niyet: kopyala(niyet), ekran: kopyala(ekran), kacirdi: kopyala(kacirdi), aboneAn: kopyala(aboneAn), degisAn: Object.assign({}, degisAn), sms: kopyala(sms), rota: duraklar.slice(), bildirim, istenmeyen, kacan });
    const out = (t, k, x) => lines.push(Object.assign({ t, k, i }, x || {}));
    const olay = (e, x) => olaylar.push(Object.assign({ e, i, n: lines.length }, x || {}, { s: snap() }));

    // ---- ekranlar (somut gözlemciler)
    const guncelle = (o, g) => {
      const d = durum[g];
      ekran[o][g] = d;
      delete kacirdi[o][g];
      bildirim++;
      if (OB.GOZ[o].tel) {
        sms[o] = { g, durum: d };
        out(`  SMS → ${OB.GOZ[o].kisi}: ${g} ${d}`, 'sms', { g, o });
        if (prog.merakli && d === OB.TESLIM) {
          const k = liste[g].indexOf(o);
          if (k >= 0) {
            liste[g].splice(k, 1);
            modCount++;
          }
        }
      } else if (o === 'panel') out(`  Panel: ${g} = ${d}`, 'panel', { g, o });
      else if (o === 'tablet') {
        if (d === 'Dağıtımda') {
          if (!duraklar.includes(g)) duraklar = duraklar.concat([g]).sort();
          out(`  Tablet: ${g} rotaya eklendi`, 'tablet', { g, o });
        } else if (d === OB.TESLIM) {
          duraklar = duraklar.filter((x) => x !== g);
          out(`  Tablet: ${g} rotadan çıktı`, 'tablet', { g, o });
        } else out(`  Tablet: ${g} ${d}`, 'tablet', { g, o });
      } else out(`  Çağrı merkezi: ${g} kaydı → ${d}`, 'merkez', { g, o });
    };

    // ---- konu: durum değişir, ekranlara haber verilir
    const degis = (g, d, teslimEt) => {
      durum[g] = d;
      degisAn[g] = ++an;
      out(teslimEt ? `[${g}] ${d} · ${OB.GONDERI[g].tam}` : `[${g}] ${d}`, 'konu', { g });
      olay('degis', { g, durum: d, teslimEt });
      const unutulan = teslimEt && unutur ? ['tablet'] : [];
      const alicilar = (kalipli ? liste[g] : liste[g].filter((o) => !unutulan.includes(o))).slice();
      olay('bildir', { g, alicilar });
      const alanlar = [];
      if (kalipli && !prog.kopya) {
        // ArrayList üzerinde for-each: Itr.hasNext() → cursor != size, Itr.next() → modCount denetimi
        const L = liste[g];
        const beklenen = modCount;
        let cursor = 0;
        while (cursor !== L.length) {
          if (modCount !== beklenen) {
            cokus = { g, sira: cursor };
            return;
          }
          const o = L[cursor++];
          alanlar.push(o);
          const istenmedi = !niyet[g].includes(o);
          if (istenmedi) istenmeyen++;
          guncelle(o, g);
          olay('guncelle', { g, o, istenmeyen: istenmedi });
        }
      } else {
        alicilar.forEach((o) => {
          alanlar.push(o);
          const istenmedi = !niyet[g].includes(o);
          if (istenmedi) istenmeyen++;
          guncelle(o, g);
          olay('guncelle', { g, o, istenmeyen: istenmedi });
        });
      }
      niyet[g]
        .filter((o) => !alanlar.includes(o))
        .forEach((o) => {
          kacan++;
          kacirdi[o][g] = true;
          olay('kacan', { g, o });
        });
    };

    // ---- kurulum
    gs.forEach((g) => {
      durum[g] = OB.DURUMLAR[0];
      degisAn[g] = 0;
      niyet[g] = prog.ilk[g].slice();
      niyet[g].forEach((o) => (aboneAn[o][g] = 0));
      liste[g] = kalipli ? [] : prog.ilk[g].slice();
    });
    olay('kur');
    if (kalipli)
      gs.forEach((g) =>
        prog.ilk[g].forEach((o) => {
          liste[g].push(o);
          modCount++;
          olay('abone', { g, o });
        })
      );

    for (let k = 0; k < prog.ops.length && !cokus; k++) {
      const op = prog.ops[k];
      i = k;
      if (op.t === 'durum') degis(op.g, op.durum, false);
      else if (op.t === 'teslim') degis(op.g, OB.TESLIM, teslimEtVar);
      else if (op.t === 'cik') {
        niyet[op.g] = niyet[op.g].filter((x) => x !== op.o);
        delete kacirdi[op.o][op.g];
        if (kalipli) {
          const j = liste[op.g].indexOf(op.o);
          if (j >= 0) {
            liste[op.g].splice(j, 1);
            modCount++;
          }
        }
        olay(kalipli ? 'cik' : 'yok', { g: op.g, o: op.o, tur: 'cik' });
      } else {
        if (!niyet[op.g].includes(op.o)) niyet[op.g].push(op.o);
        aboneAn[op.o][op.g] = ++an;
        if (kalipli) {
          liste[op.g].push(op.o);
          modCount++;
        }
        olay(kalipli ? 'ekle' : 'yok', { g: op.g, o: op.o, tur: 'ekle' });
      }
    }

    if (cokus) {
      OB.cokusIzi(prog, cokus).forEach((t, k) => out(t, 'hata', { g: cokus.g }));
      olay('cokus', { g: cokus.g, sira: cokus.sira });
    } else {
      i = -1;
      (prog.ozet || []).forEach((o) => {
        let t;
        if (o === 'panel') {
          const p = ekran.panel;
          const ks = Object.keys(p).sort();
          t = 'Satıcı paneli: ' + (ks.length ? ks.map((g) => `${g} ${p[g]}`).join(' · ') : 'boş');
        } else if (o === 'tablet') t = 'Kurye rotası: ' + (duraklar.length ? duraklar.join(' ') : 'boş');
        else {
          const g0 = gs[0];
          t = `Çağrı merkezi: ${g0} → ${ekran.merkez[g0] || 'kayıt yok'}`;
        }
        out(t, 'ozet', { o });
        olay('ozet', { o });
      });
    }
    const son = olaylar[olaylar.length - 1].s;
    const ek = OB.ekranDurumu(son, gs);
    // bayat ekran: bildirim isteyip bir değişikliği kaçıran ekran · geç abone: sonradan abone oldu, son durumu bilmiyor
    son.bayat = ek.bayat;
    son.gec = ek.gec;
    // teslim edildiği hâlde kuryenin rotasında duran gönderiler
    son.bosuna = duraklar.filter((g) => durum[g] === OB.TESLIM);
    son.cokus = cokus;
    return { lines, olaylar, son };
  };
  /**
   * Bir anlık durumda bayat ekranlar ve geç aboneler: [{o, g}]
   * Son değişiklikten önce abone olup henüz haber almayan ekran ise “sırada” (bildirim döngüsünün ortası).
   */
  OB.ekranDurumu = function (s, gs) {
    const bayat = [];
    const gec = [];
    gs.forEach((g) =>
      s.niyet[g].forEach((o) => {
        if (s.kacirdi[o][g]) bayat.push({ o, g });
        else if (s.durum[g] !== OB.DURUMLAR[0] && s.ekran[o][g] !== s.durum[g] && s.aboneAn[o][g] > s.degisAn[g]) gec.push({ o, g });
      })
    );
    return { bayat, gec };
  };
  OB.outputOf = (prog) => OB.run(prog).lines.map((l) => l.t);

  /** Bildirim sırasında liste değişince Java’nın verdiği istisna (gerçek çalıştırmadan; JDK 21) */
  OB.cokusIzi = function (prog, c) {
    const F = OB.filesFor(prog);
    const pk = prog.pkg ? prog.pkg + '.' : '';
    const kay = prog.pkg ? 3 : 0; // dışa aktarılan dosyada üstte açıklama, package ve boş satır var
    const op = prog.ops.find((x) => x.g === c.g && x.t === 'teslim');
    const mainSatir = OB.lineOf(F.Main, '        ' + OB.istekSatiri(prog, op));
    return [
      'Exception in thread "main" java.util.ConcurrentModificationException',
      '\tat java.base/java.util.ArrayList$Itr.checkForComodification(ArrayList.java:1095)',
      '\tat java.base/java.util.ArrayList$Itr.next(ArrayList.java:1049)',
      `\tat ${pk}Gonderi.bildir(Gonderi.java:${OB.lineOf(F.Gonderi, 'for (GonderiGozlemcisi abone : aboneler) {') + kay})`,
      `\tat ${pk}Gonderi.teslimEt(Gonderi.java:${OB.lineOf(F.Gonderi, 'bildir();', OB.lineOf(F.Gonderi, 'public void teslimEt(')) + kay})`,
      `\tat ${pk}Main.main(Main.java:${mainSatir + kay})`,
    ];
  };

  // ================================================================== "Sorun" sürümleri
  const ILK_TEK = { 'KRG-1001': ['aliTel', 'panel', 'tablet'] };
  const GUN = [S('KRG-1001', 'Yolda'), S('KRG-1001', 'Dağıtımda'), TE('KRG-1001')];
  OB.NV = {
    v1: { tasarim: 'dogrudan', surum: 'v1', gonderiler: ['KRG-1001'], ilk: { 'KRG-1001': ['aliTel', 'panel'] }, ops: GUN, ozet: ['panel'] },
    v11: { tasarim: 'dogrudan', surum: 'v11', gonderiler: ['KRG-1001'], ilk: ILK_TEK, ops: GUN, ozet: ['panel', 'tablet'] },
    v2: { tasarim: 'dogrudan', surum: 'v2', gonderiler: ['KRG-1001'], ilk: ILK_TEK, ops: GUN, ozet: ['panel', 'tablet'] },
  };
  OB.naiveFiles = (v) => OB.filesFor(OB.NV[v]);

  // ================================================================== çözüm ve adım adım yeniden düzenleme
  OB.COZUM = { tasarim: 'observer', gonderiler: ['KRG-1001'], ilk: ILK_TEK, ops: GUN, ozet: ['panel', 'tablet'] };
  code.Main = OB.mainFor(OB.COZUM);
  OB.output = OB.outputOf(OB.COZUM);
  const V2 = OB.naiveFiles('v2');
  const progR1 = Object.assign({}, OB.COZUM, { tasarim: 'r1' });
  const progR2 = Object.assign({}, OB.COZUM, { tasarim: 'sabit' });
  /** Adım 1: ekranlar ortak arayüzü uygular; Gonderi hâlâ üçünü adıyla çağırır (teslimEt tableti yine unutur) */
  const R1 = Object.assign({}, OB.filesFor(progR1), {
    GonderiGozlemcisi: plain(code.Arayuz),
    AliciTelefonu: plain(code.AliciTelefonu),
    SaticiPaneli: plain(code.SaticiPaneli),
    KuryeTableti: plain(code.KuryeTableti),
  });
  /** Adım 2: abone listesi ve tek bir bildir(); liste kurucuda doluyor */
  const R2 = Object.assign({}, R1, { Main: OB.mainFor(progR2), Gonderi: plain(code.GonderiSabit) });
  /** Adım 3: Gonderi ekranları tanımaz; Main abone eder */
  const R3 = Object.assign({}, R2, { Main: code.Main, Gonderi: plain(code.Gonderi) });
  OB.refactor = [V2, R1, R2, R3];
  OB.refactorProgs = [OB.NV.v2, progR1, progR2, OB.COZUM];
  OB.refactorOrder = ['Main', 'Gonderi', 'GonderiGozlemcisi', 'AliciTelefonu', 'SaticiPaneli', 'KuryeTableti'];

  // ================================================================== Canlı Akış
  OB.presets = {
    gun: { key: 'gun', title: 'Teslimat günü', prog: OB.COZUM },
    iki: {
      key: 'iki',
      title: 'İki gönderi, tek panel',
      prog: {
        tasarim: 'observer',
        gonderiler: ['KRG-1001', 'KRG-1003'],
        ilk: { 'KRG-1001': ['aliTel', 'panel'], 'KRG-1003': ['zeynepTel', 'panel'] },
        ops: [S('KRG-1001', 'Yolda'), S('KRG-1003', 'Yolda'), C('KRG-1001', 'aliTel'), S('KRG-1001', 'Dağıtımda')],
        ozet: ['panel'],
      },
    },
  };
  OB.presetOrder = ['gun', 'iki'];
  OB.akisFiles = (p) => OB.fileList(OB.filesFor(p.prog));
  OB.akisOutput = (p) => OB.outputOf(p.prog);

  // ================================================================== Abonelik tezgâhı
  OB.TZ_GONDERILER = ['KRG-1001', 'KRG-1003'];
  OB.TZ_ILK = { 'KRG-1001': ['aliTel', 'panel', 'tablet'], 'KRG-1003': ['zeynepTel', 'panel', 'tablet'] };
  /** Rehberli ana oturum: iki gönderi yola çıkar, Ali SMS’leri kapatır, 1001 dağıtıma çıkıp teslim edilir */
  OB.TEZGAH_ANA = [S('KRG-1001', 'Yolda'), S('KRG-1003', 'Yolda'), C('KRG-1001', 'aliTel'), S('KRG-1001', 'Dağıtımda'), TE('KRG-1001')];
  OB.ISTEK_EN_COK = 14;
  /** Oturum: {design: 'dogrudan'|'sabit'|'observer', ops} */
  OB.tezgahProg = (tz) => ({ tasarim: tz.design, surum: 'v2', gonderiler: OB.TZ_GONDERILER, ilk: OB.TZ_ILK, ops: tz.ops, ozet: ['panel', 'tablet'] });
  OB.tezgahFiles = (tz) => OB.filesFor(OB.tezgahProg(tz));
  /** Kullanıcının niyeti: o anda kim hangi gönderiyi izlemek istiyor (tasarımdan bağımsız) */
  OB.niyetOf = function (ops) {
    const n = {};
    OB.TZ_GONDERILER.forEach((g) => (n[g] = OB.TZ_ILK[g].slice()));
    ops.forEach((op) => {
      if (op.t === 'cik') n[op.g] = n[op.g].filter((x) => x !== op.o);
      else if (op.t === 'ekle' && !n[op.g].includes(op.o)) n[op.g].push(op.o);
    });
    return n;
  };
  OB.durumOf = function (ops) {
    const d = {};
    OB.TZ_GONDERILER.forEach((g) => (d[g] = OB.DURUMLAR[0]));
    ops.forEach((op) => {
      if (op.t === 'durum') d[op.g] = op.durum;
      else if (op.t === 'teslim') d[op.g] = OB.TESLIM;
    });
    return d;
  };
  /** Bir istek bu anda yapılabilir mi? (tezgâhın düğmeleri) */
  OB.uygun = function (ops, op, o) {
    o = o || {};
    if (ops.length >= OB.ISTEK_EN_COK) return false;
    const n = OB.niyetOf(ops);
    if (op.t === 'durum' || op.t === 'teslim') {
      const sira = OB.ilerle(op.g, OB.durumOf(ops)[op.g]);
      return !!sira && sira.t === op.t && (op.t === 'teslim' || sira.durum === op.durum);
    }
    if (op.o === 'merkez' && !o.merkez) return false;
    if (op.t === 'cik') return n[op.g].includes(op.o);
    return !n[op.g].includes(op.o);
  };
  OB.olc = function (tz) {
    const prog = OB.tezgahProg(tz);
    const r = OB.run(prog);
    return {
      run: r,
      degisiklik: tz.ops.filter((x) => x.t === 'durum' || x.t === 'teslim').length,
      bildirim: r.son.bildirim,
      istenmeyen: r.son.istenmeyen,
      kacan: r.son.kacan,
      tanidigi: OB.tanidigi(OB.filesFor(prog).Gonderi),
      bayat: r.son.bayat,
      bosuna: r.son.bosuna,
    };
  };

  // ================================================================== Genişlet: yeni gözlemci (CagriMerkezi)
  const EX = (OB.ext = {});
  EX.exercise = `public class CagriMerkezi implements ⟦1⟧ {

    private final Map<String, String> kayitlar = new TreeMap<>();

    @Override
    public void ⟦2⟧(Gonderi gonderi) {
        String takipNo = gonderi.getTakipNo();
        String durum = gonderi.⟦3⟧();
        kayitlar.put(takipNo, durum);
        System.out.println("  Çağrı merkezi: " + takipNo + " kaydı → " + durum);
    }
}`;
  EX.exerciseMain = `// Main.java: ek
CagriMerkezi merkez = new CagriMerkezi();
gonderi.⟦4⟧(merkez);`;
  EX.answers = { 1: 'GonderiGozlemcisi', 2: 'guncelle', 3: 'getDurum', 4: 'aboneEkle' };
  EX.prog = { tasarim: 'observer', gonderiler: ['KRG-1001'], ilk: { 'KRG-1001': ['aliTel', 'panel', 'tablet', 'merkez'] }, ops: GUN, ozet: ['tablet', 'merkez'] };
  EX.Main = OB.mainFor(EX.prog);
  EX.output = OB.outputOf(EX.prog);

  // ================================================================== Yapı: bildirim sırasında abonelikten çıkmak (gerçek çalıştırma)
  /** Telefon teslimden sonra kendini listeden çıkarır. sira: 'bas' (telefon önce) | 'orta' (panelden sonra) | 'kopya' (düzeltme) */
  OB.tuzak = function (sira) {
    const ilk = sira === 'orta' ? ['panel', 'aliTel', 'tablet'] : ['aliTel', 'panel', 'tablet'];
    return { tasarim: 'observer', gonderiler: ['KRG-1001'], ilk: { 'KRG-1001': ilk }, ops: GUN, ozet: ['panel', 'tablet'], merakli: true, kopya: sira === 'kopya' };
  };
  OB.TUZAK_SIRA = ['bas', 'orta', 'kopya'];

  // ================================================================== Gerçek dünya (JDK) örnekleri
  const RW = (OB.rw = {});
  const sArg = (stmt, comment) => cm('        ' + stmt, comment, 52).slice(8);

  RW.pcs = (arg) => `import java.beans.PropertyChangeListener;
import java.beans.PropertyChangeSupport;

public class DurumDinleyici {

    static class Gonderi {
        private final PropertyChangeSupport destek =
                new PropertyChangeSupport(this);
        private String durum = "Hazırlanıyor";

        void dinleyiciEkle(PropertyChangeListener d) {
            destek.addPropertyChangeListener(d);
        }

        void dinleyiciCikar(PropertyChangeListener d) {
            destek.removePropertyChangeListener(d);
        }

        void setDurum(String yeni) {
            String eski = durum;
            durum = yeni;
${cm('            destek.firePropertyChange("durum", eski, yeni);', 'bildir', 64)}
        }

        int dinleyiciSayisi() {
            return destek.getPropertyChangeListeners().length;
        }
    }

    public static void main(String[] args) {
        Gonderi gonderi = new Gonderi();
        PropertyChangeListener panel = e -> System.out.println(
                "Panel: " + e.getOldValue() + " → " + e.getNewValue());
        gonderi.dinleyiciEkle(panel);

        ${arg}
        System.out.println("dinleyici: " + gonderi.dinleyiciSayisi());
    }
}`;
  RW.pcsOpts = [
    { label: 'Değişti', arg: 'gonderi.setDurum("Yolda");', out: ['Panel: Hazırlanıyor → Yolda', 'dinleyici: 1'] },
    { label: 'Aynı değer', arg: 'gonderi.setDurum("Yolda"); gonderi.setDurum("Yolda");', out: ['Panel: Hazırlanıyor → Yolda', 'dinleyici: 1'] },
    { label: 'Dinleyici çıktı', arg: 'gonderi.dinleyiciCikar(panel); gonderi.setDurum("Yolda");', out: ['dinleyici: 0'] },
  ];

  RW.swing = (arg) => `import java.awt.event.ActionListener;
import javax.swing.JButton;

public class DugmeDinleyici {

    static ActionListener dinleyici(String ad) {
        return e -> System.out.println(ad);
    }

    public static void main(String[] args) {
        JButton teslim = new JButton("Teslim et");
${cm('        teslim.addActionListener(dinleyici("1. SMS"));', 'önce', 58)}
${cm('        teslim.addActionListener(dinleyici("2. Panel"));', 'sonra', 58)}
        ${arg}
    }
}`;
  RW.swingOpts = [
    { label: 'doClick()', arg: sArg('teslim.doClick();', 'basıldı'), out: ['2. Panel', '1. SMS'] },
    { label: 'Üçüncü dinleyici', arg: 'teslim.addActionListener(dinleyici("3. Tablet")); teslim.doClick();', out: ['3. Tablet', '2. Panel', '1. SMS'] },
    { label: 'Tıklamadan', arg: 'System.out.println(teslim.getActionListeners().length + " dinleyici");', out: ['2 dinleyici'] },
  ];

  RW.flow = (arg) => `import java.util.concurrent.Flow;
import java.util.concurrent.SubmissionPublisher;

public class AkisAbone {

    static class Abone implements Flow.Subscriber<String> {
        private final String ad;
        private Flow.Subscription abonelik;

        Abone(String ad) {
            this.ad = ad;
        }

        @Override
        public void onSubscribe(Flow.Subscription abonelik) {
            this.abonelik = abonelik;
${cm('            abonelik.request(1);', 'bir tane gönder', 52)}
        }

        @Override
        public void onNext(String durum) {
            System.out.println(ad + ": " + durum);
${cm('            abonelik.request(1);', 'sıradakini iste', 52)}
        }

        @Override
        public void onError(Throwable hata) {
            System.out.println(ad + ": hata " + hata);
        }

        @Override
        public void onComplete() {
            System.out.println(ad + ": akış bitti");
        }
    }

    public static void main(String[] args) {
        // Runnable::run → bildirimler aynı iş parçacığında, sırayla
        SubmissionPublisher<String> gonderi =
                new SubmissionPublisher<>(Runnable::run, 8);
        gonderi.subscribe(new Abone("Tablet"));
        ${arg}
        gonderi.close();
    }
}`;
  RW.flowOpts = [
    { label: 'İki durum', arg: 'gonderi.submit("Yolda"); gonderi.submit("Dağıtımda");', out: ['Tablet: Yolda', 'Tablet: Dağıtımda', 'Tablet: akış bitti'] },
    { label: 'İkinci abone', arg: 'gonderi.subscribe(new Abone("Panel")); gonderi.submit("Yolda");', out: ['Tablet: Yolda', 'Panel: Yolda', 'Tablet: akış bitti', 'Panel: akış bitti'] },
    { label: 'Abone sayısı', arg: 'System.out.println(gonderi.getNumberOfSubscribers() + " abone");', out: ['1 abone', 'Tablet: akış bitti'] },
  ];

  // ================================================================== UML sınıf diyagramları
  const Mb = {
    takipNo: { id: 'takipNo', text: '- takipNo: String', generic: '- id' },
    durum: { id: 'durum', text: '- durum: String', generic: '- subjectState' },
    aboneler: { id: 'aboneler', text: '- aboneler: List<GonderiGozlemcisi>', generic: '- observers: List<Observer>' },
    aboneEkle: { id: 'aboneEkle', text: '+ aboneEkle(abone)', generic: '+ attach(o)' },
    aboneCikar: { id: 'aboneCikar', text: '+ aboneCikar(abone)', generic: '+ detach(o)' },
    bildir: { id: 'bildir', text: '- bildir()', generic: '+ notify()', factory: true },
    setDurum: { id: 'setDurum', text: '+ setDurum(durum)', generic: '+ setState()' },
    teslimEt: { id: 'teslimEt', text: '+ teslimEt(teslimAlan)', generic: '+ setState2()' },
    getDurum: { id: 'getDurum', text: '+ getDurum(): String', generic: '+ getState()' },
    guncelle: { id: 'guncelle', text: '+ guncelle(gonderi: Gonderi)', generic: '+ update(s: Subject)', factory: true, abstract: true },
    sGuncelle: { id: 'guncelle', text: '+ guncelle(gonderi)', generic: '+ update(s)', factory: true },
  };
  OB.members = Mb;
  const OZEL_UYE = {
    AliciTelefonu: [{ id: 'ad', text: '- ad: String', generic: '- observerState' }],
    SaticiPaneli: [{ id: 'satirlar', text: '- satirlar: Map<…>', generic: '- observerState' }, { id: 'ekran', text: '+ ekran(): String' }],
    KuryeTableti: [{ id: 'duraklar', text: '- duraklar: Set<String>', generic: '- observerState' }, { id: 'rota', text: '+ rota(): String' }],
    CagriMerkezi: [{ id: 'kayitlar', text: '- kayitlar: Map<…>', generic: '- observerState' }, { id: 'sorgula', text: '+ sorgula(no): String' }],
  };
  const NAIVE_YONTEM = {
    AliciTelefonu: { id: 'smsGonder', text: '+ smsGonder(no, durum)' },
    SaticiPaneli: { id: 'satirGuncelle', text: '+ satirGuncelle(no, durum)' },
    KuryeTableti: { id: 'rotaGuncelle', text: '+ rotaGuncelle(no, durum)' },
  };
  const box = {
    Main: (x, y) => ({ id: 'Main', name: 'Main', generic: 'Client', kind: 'class', role: 'client', x, y, w: 190, members: [{ id: 'main', text: '+ main(args)', generic: '+ main()' }] }),
    Gonderi: (x, y, o) => {
      o = o || {};
      const m = [Mb.takipNo, Mb.durum];
      if (o.liste) m.push(Mb.aboneler);
      else (o.ekranlar || ['telefon', 'panel', 'tablet']).forEach((e) => m.push({ id: e, text: `- ${e}: ${SINIF[e]}` }));
      if (o.yonet) m.push(Mb.aboneEkle, Mb.aboneCikar);
      if (o.liste) m.push(Mb.bildir);
      m.push(Mb.setDurum);
      if (o.teslim !== false) m.push(Mb.teslimEt);
      if (o.getter !== false) m.push(Mb.getDurum);
      return { id: 'Gonderi', name: 'Gonderi', generic: 'Subject', kind: 'class', role: 'subject', x, y, w: 330, members: m };
    },
    Arayuz: (x, y) => ({ id: 'GonderiGozlemcisi', name: 'GonderiGozlemcisi', generic: 'Observer', kind: 'interface', role: 'observer', x, y, w: 300, members: [Mb.guncelle] }),
    ekran: (sinif, x, y, o) => {
      o = o || {};
      const m = OZEL_UYE[sinif].slice(0, 1);
      m.push(o.naive ? NAIVE_YONTEM[sinif] : Mb.sGuncelle);
      OZEL_UYE[sinif].slice(1).forEach((u) => m.push(u));
      const harf = { AliciTelefonu: 'A', SaticiPaneli: 'B', KuryeTableti: 'C', CagriMerkezi: 'D' }[sinif];
      return { id: sinif, name: sinif, generic: 'ConcreteObserver' + harf, kind: 'class', role: 'concreteObserver', x, y, w: o.w || 220, noTag: !!o.noTag, members: m };
    },
  };
  OB.box = box;
  const EX_X = [370, 600, 830];

  /** GoF yapısı (Yapı sahnesi, Canlı Akış, özet). o.notes: bildir ve pull notları */
  OB.gofDiagram = function (o) {
    o = o || {};
    const classes = [box.Gonderi(20, 40, { liste: true, yonet: true }), box.Arayuz(560, 40), box.Main(20, 470)];
    ['AliciTelefonu', 'SaticiPaneli', 'KuryeTableti'].forEach((s, k) => classes.push(box.ekran(s, EX_X[k], 300, { noTag: k > 0 })));
    const relations = [
      { id: 'aboneler', from: 'Gonderi', to: 'GonderiGozlemcisi', type: 'aggregation', label: 'aboneler *', genericLabel: 'observers *', fromSide: 'right', fromAt: 80, toSide: 'left', toAt: 80 },
      { id: 'cek', from: 'GonderiGozlemcisi', to: 'Gonderi', type: 'dependency', label: 'getDurum()', genericLabel: 'getState()', fromSide: 'left', fromAt: 120, toSide: 'right', toAt: 120 },
      { id: 'c-main', from: 'Main', to: 'Gonderi', type: 'dependency', label: '«create» · aboneEkle', genericLabel: '«create» · attach', fromSide: 'top', fromAt: 110, toSide: 'bottom', toAt: 110 },
    ];
    ['AliciTelefonu', 'SaticiPaneli', 'KuryeTableti'].forEach((s, k) => relations.push({ id: 'r-' + s, from: s, to: 'GonderiGozlemcisi', type: 'realization', fromSide: 'top', fromAt: EX_X[k] + 110, toSide: 'bottom', toAt: 710, mid: 258 }));
    const notes = o.notes
      ? [
          { id: 'n-bildir', x: 380, y: 452, text: 'bildir():\nfor (abone : aboneler)\n    abone.guncelle(this);', genericText: 'notify():\nfor (o : observers)\n    o.update(this);', target: 'Gonderi', from: 'left', to: 'right', toAt: 236 },
          { id: 'n-cek', x: 790, y: 452, text: 'gözlemci durumu çeker:\ngonderi.getDurum()', genericText: 'observer pulls:\nsubject.getState()', target: 'KuryeTableti', from: 'top', to: 'bottom', toAt: 940 },
        ]
      : [];
    return { width: 1060, height: 580, title: 'Observer sınıf diyagramı', classes, relations, notes };
  };

  /**
   * "Çözüm" sahnesinin her adımındaki diyagram.
   * 0: Gonderi üç ekranı adıyla tanır · 1: ortak arayüz · 2: abone listesi (kurucuda sabit) · 3: Main abone eder · 4: sonuç
   */
  OB.solutionDiagram = function (st) {
    const classes = [box.Gonderi(20, 40, { liste: st >= 2, yonet: st >= 3, getter: st >= 1 }), box.Main(20, 470)];
    const relations = [{ id: 'c-main', from: 'Main', to: 'Gonderi', type: 'dependency', label: st >= 3 ? '«create» · aboneEkle' : '«create»', fromSide: 'top', fromAt: 110, toSide: 'bottom', toAt: 110 }];
    ['AliciTelefonu', 'SaticiPaneli', 'KuryeTableti'].forEach((s, k) => classes.push(box.ekran(s, EX_X[k], 300, { naive: st < 1, noTag: true })));
    if (st >= 1) {
      classes.push(box.Arayuz(560, 40));
      ['AliciTelefonu', 'SaticiPaneli', 'KuryeTableti'].forEach((s, k) => relations.push({ id: 'r-' + s, from: s, to: 'GonderiGozlemcisi', type: 'realization', fromSide: 'top', fromAt: EX_X[k] + 110, toSide: 'bottom', toAt: 710, mid: 258 }));
    }
    if (st >= 2) relations.push({ id: 'aboneler', from: 'Gonderi', to: 'GonderiGozlemcisi', type: 'aggregation', label: 'aboneler *', fromSide: 'right', fromAt: 80, toSide: 'left', toAt: 80 });
    if (st < 3) {
      // Gonderi her ekranı adıyla tanır: alan (0, 1) ya da kurucu parametresi (2). Uzaktaki kutuya giden tel daha yukarıdan geçer.
      ['AliciTelefonu', 'SaticiPaneli', 'KuryeTableti'].forEach((s, k) => {
        const yy = 205 - k * 28;
        const xx = EX_X[k] + 40;
        relations.push({
          id: 'tanir-' + s,
          from: 'Gonderi',
          to: s,
          type: st < 2 ? 'association' : 'dependency',
          label: st < 2 ? ['telefon', 'panel', 'tablet'][k] : k === 0 ? 'kurucu' : '',
          fromSide: 'right',
          fromAt: yy,
          toSide: 'top',
          toAt: xx,
          points: [[xx, yy]],
        });
      });
    }
    return { width: 1060, height: 560, view: [0, 0, 1060, 560], classes, relations };
  };

  // ------------------------------------------------------------------ UML sıralama diyagramı (Canlı Akış)
  /**
   * Her Main satırı kendi küçük diyagramıdır (bölüm): Main, gönderi(ler) ve gözlemciler.
   * Dönüş: {bolumler: [{spec, msgOf, baslik}], run}
   */
  OB.seqSpec = function (p) {
    const prog = p.prog;
    const r = OB.run(prog);
    const bolumler = [];
    const W = 900;
    const rowH = 32;
    const gozler = OB.tanimli(prog);
    const parts = () => {
      const ps = [{ id: 'main', label: 'Main', role: 'client' }];
      prog.gonderiler.forEach((g) => ps.push({ id: g, label: `${OB.gDegisken(prog, g)}\n: Gonderi`, role: 'subject', object: true }));
      gozler.forEach((o) => ps.push({ id: o, label: `${OB.degisken(prog, o)}\n: ${OB.GOZ[o].sinif}`, role: 'concreteObserver', object: true }));
      ps.forEach((pp, i) => (pp.x = 70 + (i * (W - 140)) / Math.max(1, ps.length - 1)));
      return ps;
    };
    const yap = (messages, msgOf, baslik) => {
      const h = 118 + messages.length * rowH + 40;
      return { spec: { width: W, height: Math.max(h, 300), top: 118, margin: 70, rowH, participants: parts(), messages, initialActive: ['main'] }, msgOf, baslik };
    };
    // kurulum
    {
      const messages = [];
      const msgOf = {};
      prog.gonderiler.forEach((g) => {
        msgOf['yeni:' + g] = messages.length;
        messages.push({ from: 'main', to: g, kind: 'create', label: OB.kalipli(prog) ? `«create» ("${g}")` : '«create» (ekranlarla)' });
        if (OB.kalipli(prog))
          prog.ilk[g].forEach((o) => {
            msgOf['abone:' + g + ':' + o] = messages.length;
            messages.push({ from: 'main', to: g, kind: 'call', short: true, label: `aboneEkle(${OB.degisken(prog, o)})` });
          });
      });
      bolumler.push(yap(messages, msgOf, 'Kurulum'));
    }
    prog.ops.forEach((op, k) => {
      const O = r.olaylar.filter((o) => o.i === k);
      const messages = [];
      const msgOf = {};
      const add = (key, m) => {
        msgOf[key] = messages.length;
        messages.push(m);
      };
      const satir = OB.istekSatiri(prog, op).replace(/^\w+\./, '').replace(/;$/, '');
      if (op.t === 'durum' || op.t === 'teslim') {
        add('istek', { from: 'main', to: op.g, kind: 'call', label: satir });
        add('bildir', { from: op.g, to: op.g, kind: 'self', short: true, label: OB.kalipli(prog) ? 'bildir()' : 'ekranları tek tek çağırır' });
        O.filter((o) => o.e === 'guncelle').forEach((o) => {
          add('guncelle:' + o.o, { from: op.g, to: o.o, kind: 'call', label: OB.kalipli(prog) ? 'guncelle(this)' : 'kendi yöntemi' });
          add('cek:' + o.o, { from: o.o, to: op.g, kind: 'call', short: true, label: `getDurum() → "${o.s.durum[op.g]}"` });
        });
        add('ret', { from: op.g, to: 'main', kind: 'return', label: '' });
      } else {
        add('istek', { from: 'main', to: op.g, kind: 'call', label: satir });
        add('ret', { from: op.g, to: 'main', kind: 'return', label: '' });
      }
      bolumler.push(yap(messages, msgOf, `${k + 1}. satır · ${satir}`));
    });
    // özet
    {
      const messages = [];
      const msgOf = {};
      (prog.ozet || []).forEach((o) => {
        msgOf['ozet:' + o] = messages.length;
        messages.push({ from: 'main', to: o, kind: 'call', label: o === 'merkez' ? 'sorgula(…)' : OZET[o] });
        messages.push({ from: o, to: 'main', kind: 'return', label: '' });
      });
      bolumler.push(yap(messages, msgOf, 'Sonuç · ekran özetleri'));
    }
    return { bolumler, run: r };
  };
})();
