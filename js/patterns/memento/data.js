/*
 * Memento — veri: Java kodları, çalıştırma benzetimi, roller, diyagram tanımları.
 * Bu dosya DOM kullanmaz; tools/export-java.js de Java dosyalarını buradan üretir.
 *
 * Senaryo (lojistik dünyasının devamı): Command modülündeki Malatya deposu. Gece 02:00 planı “ya hep ya hiç”
 * uygulanmalı: plan yarıda hata verirse (aynı raf iki kez kullanılmış: “C2 dolu”) depo plandan önceki hâline dönmeli.
 * Kalıpsız çözümde yedeği depo değil bir yedek defteri alır; bunun için Depo içini get/set ile dışarı açar.
 *   Sürüm 1.0: yedek = depo.getRaflar()  → yedek deponun KENDİ haritası; geri yükleme hiçbir şey değiştirmez.
 *   Sürüm 1.1: yedek = new TreeMap<>(…) → düzeldi.
 *   Sürüm 2.0: depoya kamyon eklendi; yedek defteri güncellenmedi → geri yüklemeden sonra koliler hem rafta hem kamyonda.
 * Memento: Depo kendi hatırasını kendisi oluşturur (Depo.Hatira, alanları özel) ve ona kendisi döner; YedekDefteri
 * hatırayı saklar ama içine bakamaz. Depo’nun içi yeniden kapanır.
 */
(function () {
  'use strict';
  const DP = (window.DP = window.DP || {});
  const MN = (DP.mnt = DP.mnt || {});

  // ------------------------------------------------------------------ roller
  MN.roles = {
    client: { en: 'Client', tr: 'İstemci', color: 1 },
    originator: { en: 'Originator', tr: 'Kaynak (durumun sahibi)', color: 3 },
    memento: { en: 'Memento', tr: 'Hatıra (anlık görüntü)', color: 4 },
    caretaker: { en: 'Caretaker', tr: 'Emanetçi (saklayan)', color: 5 },
  };

  MN.classRoles = {
    Main: 'client',
    Depo: 'originator',
    Hatira: 'memento',
    'Depo.Hatira': 'memento',
    YedekDefteri: 'caretaker',
    DepoGecmisi: 'caretaker',
    // GoF genel adları
    Client: 'client',
    Originator: 'originator',
    Memento: 'memento',
    Caretaker: 'caretaker',
  };

  MN.roleOf = function (name) {
    const r = MN.classRoles[name];
    return r ? MN.roles[r].color : null;
  };

  // `hatiraOlustur` ve `hatirayaDon`: kaynak nesnenin iki işlemi (kodda ayrıca vurgulanır)
  MN.special = { hatiraOlustur: 'hat', hatirayaDon: 'hat' };

  /** 1 tabanlı satır numarası. */
  MN.lineOf = function (src, needle, from) {
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
  MN.plain = plain;

  const code = (MN.code = {});

  // ================================================================== dünya: depo, koliler, kamyon
  MN.KOLI = {
    'KRG-1001': { ad: 'Ali', tam: 'Ali Şahin' },
    'KRG-1002': { ad: 'Ayşe', tam: 'Ayşe Yılmaz' },
    'KRG-1003': { ad: 'Zeynep', tam: 'Zeynep Güneş', soguk: true },
    'KRG-1004': { ad: 'Can', tam: 'Can Demir' },
    'KRG-1005': { ad: 'Selin', tam: 'Selin Aydın' },
    'KRG-1006': { ad: 'Mert', tam: 'Mert Kaya' },
  };
  MN.KOLILER = Object.keys(MN.KOLI);
  /** Sabahki raf düzeni (Depo.sabah() ile birebir; Command modülüyle aynı) */
  MN.SABAH = { 'KRG-1001': 'A1', 'KRG-1002': 'A2', 'KRG-1003': 'A3', 'KRG-1004': 'B1', 'KRG-1005': 'B2', 'KRG-1006': 'C1' };
  MN.RAFLAR = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4'];
  MN.kisa = (koli) => koli.slice(4);

  // ------------------------------------------------------------------ istekler
  const T = (koli, raf) => ({ t: 'tasi', koli, raf });
  const Y = (koli) => ({ t: 'yukle', koli });
  const K = (ad) => ({ t: 'kaydet', ad });
  const D = (ad) => ({ t: 'don', ad });
  const G = { t: 'geri' };
  const I = { t: 'ileri' };
  MN.op = { T, Y, K, D, G, I };
  /** Gece planı, sürüm 1 (kamyon yok): üçüncü iş C2’yi ikinci kez kullanır */
  MN.PLAN_V1 = [T('KRG-1001', 'B3'), T('KRG-1004', 'C2'), T('KRG-1006', 'C2')];
  /** Gece planı, sürüm 2 (kamyonla): dördüncü iş C2’yi ikinci kez kullanır */
  MN.PLAN = [Y('KRG-1001'), T('KRG-1004', 'C2'), Y('KRG-1005'), T('KRG-1006', 'C2')];
  /** Tezgâhtaki kayıt adları: 09:00, 10:00 … */
  MN.kayitAdi = (n) => String(9 + n).padStart(2, '0') + ':00';
  MN.KAYIT_EN_COK = 8;

  // ================================================================== Depo (kaynak) — bütün sürümler
  /**
   * o: {kamyon: kamyon özelliği var mı, getset: iç durum get/set ile açık mı, hatira: hatıra yöntemleri ve iç sınıf,
   *     belge: sınıf açıklaması (yoksa açıklamasız)}
   */
  function depoSrc(o) {
    const fin = o.getset ? '' : 'final ';
    const imp = (o.kamyon ? 'import java.util.ArrayList;\nimport java.util.List;\n' : '') + 'import java.util.Map;\nimport java.util.TreeMap;\n';
    const alanlar = [`    private ${fin}Map<String, String> raflar = new TreeMap<>();`];
    if (o.kamyon) alanlar.push(`    private ${fin}List<String> kamyon = new ArrayList<>();`);
    const yukle = o.kamyon
      ? `

    public void yukle(String koli) {
        String raf = raflar.remove(koli);
        kamyon.add(koli);
        System.out.println("  kamyon: " + koli + " yüklendi (" + raf + " boşaldı)");
    }`
      : '';
    const getset = o.getset
      ? `

    // yedek alınabilsin diye iç durum dışarı açıldı
    public Map<String, String> getRaflar() {
        return raflar;
    }

    public void setRaflar(Map<String, String> raflar) {
        this.raflar = raflar;
    }${
      o.kamyon
        ? `

    public List<String> getKamyon() {
        return kamyon;
    }

    public void setKamyon(List<String> kamyon) {
        this.kamyon = kamyon;
    }`
        : ''
    }`
      : '';
    const hatira = o.hatira
      ? `

    public Hatira hatiraOlustur() {
        return new Hatira(raflar, kamyon);
    }

    public void hatirayaDon(Hatira h) {
        raflar.clear();
        raflar.putAll(h.raflar);
        kamyon.clear();
        kamyon.addAll(h.kamyon);
    }`
      : '';
    const durumKamyon = o.kamyon
      ? `
        sb.append(" · Kamyon:");
        if (kamyon.isEmpty()) {
            sb.append(" boş");
        }
        for (String koli : kamyon) {
            sb.append(' ').append(koli.substring(4));
        }`
      : '';
    const icSinif = o.hatira
      ? `

${doc('«Memento» — Deponun bir anki durumu. Alanları ve kurucusu özel: içini yalnızca Depo görür.', '    ')}    public static final class Hatira {

        private final Map<String, String> raflar;
        private final List<String> kamyon;

        private Hatira(Map<String, String> raflar, List<String> kamyon) {
            this.raflar = new TreeMap<>(raflar);
            this.kamyon = new ArrayList<>(kamyon);
        }
    }`
      : '';
    return `${imp}
${o.belge ? doc(o.belge) : ''}public class Depo {

${alanlar.join('\n')}

    /** Sabahki raf düzeni */
    public static Depo sabah() {
        Depo d = new Depo();
${Object.keys(MN.SABAH)
  .map((k) => `        d.raflar.put("${k}", "${MN.SABAH[k]}");`)
  .join('\n')}
        return d;
    }

    public void tasi(String koli, String raf) {
        if (raflar.containsValue(raf)) {
            throw new IllegalStateException(raf + " dolu");
        }
        String eski = raflar.put(koli, raf);
        System.out.println("  depo: " + koli + " " + eski + " → " + raf);
    }${yukle}${getset}${hatira}

    public String durum() {
        StringBuilder sb = new StringBuilder("Raflar:");
        raflar.forEach((koli, raf) -> sb.append(' ').append(koli.substring(4)).append(':').append(raf));${durumKamyon}
        return sb.toString();
    }${icSinif}
}`;
  }
  const DEPO_BELGE = {
    v1: 'Depo: raflardaki koliler. Yedek alınabilsin diye iç durum dışarı açıldı (get/set).',
    v2: 'Depo: raflar ve Malatya kamyonu. Yedek alınabilsin diye iç durum dışarı açıldı (get/set).',
    hatira: '«Originator» — Depo: kendi durumunun hatırasını oluşturur ve istenince o hatıraya döner.',
  };
  code.DepoV1 = depoSrc({ kamyon: false, getset: true, belge: DEPO_BELGE.v1 });
  code.DepoV2 = depoSrc({ kamyon: true, getset: true, belge: DEPO_BELGE.v2 });
  code.Depo = depoSrc({ kamyon: true, hatira: true, belge: DEPO_BELGE.hatira });

  // ================================================================== YedekDefteri (emanetçi) — üç sürüm
  function defterSrc(tur, belge) {
    const naive = tur !== 'hatira';
    const imp = 'import java.util.HashMap;\nimport java.util.Map;\n' + (tur === 'kopya' ? 'import java.util.TreeMap;\n' : '');
    const alan = naive ? '    private final Map<String, Map<String, String>> yedekler = new HashMap<>();' : '    private final Map<String, Depo.Hatira> yedekler = new HashMap<>();';
    const kaydet =
      tur === 'referans'
        ? cm('        yedekler.put(ad, depo.getRaflar());', 'yedeği al', 60)
        : tur === 'kopya'
        ? cm('        yedekler.put(ad, new TreeMap<>(depo.getRaflar()));', 'kopya', 60)
        : '        yedekler.put(ad, depo.hatiraOlustur());';
    const don = naive ? '        depo.setRaflar(yedekler.get(ad));' : '        depo.hatirayaDon(yedekler.get(ad));';
    const B = {
      referans: 'Yedek defteri: deponun raflarını adıyla saklar, istenince geri yükler.',
      kopya: 'Yedek defteri: deponun raflarının kopyasını adıyla saklar, istenince geri yükler.',
      hatira: '«Caretaker» — Hatıraları adıyla saklar; içlerine bakmaz, yalnızca depoya geri verir.',
    }[tur];
    return `${imp}
${belge ? doc(B) : ''}public class YedekDefteri {

    private final Depo depo;
${alan}

    public YedekDefteri(Depo depo) {
        this.depo = depo;
    }

    public void kaydet(String ad) {
${kaydet}
        System.out.println("[Defter] kaydedildi: " + ad);
    }

    public void geriYukle(String ad) {
${don}
        System.out.println("[Defter] geri yüklendi: " + ad);
    }
}`;
  }
  code.DefterReferans = defterSrc('referans', true);
  code.DefterKopya = defterSrc('kopya', true);
  code.YedekDefteri = defterSrc('hatira', true);

  // ================================================================== DepoGecmisi (Genişlet: geri al / yinele)
  code.DepoGecmisi = `import java.util.ArrayDeque;
import java.util.Deque;

${doc('«Caretaker» — Her işlemden önce deponun hatırasını alır; geri al ve yinele hatıralarla çalışır.')}public class DepoGecmisi {

    private final Depo depo;
    private final Deque<Depo.Hatira> geri = new ArrayDeque<>();
    private final Deque<Depo.Hatira> ileri = new ArrayDeque<>();

    public DepoGecmisi(Depo depo) {
        this.depo = depo;
    }

    public void islemOncesi() {
        geri.push(depo.hatiraOlustur());
        ileri.clear();
    }

    public void geriAl() {
        if (geri.isEmpty()) {
            System.out.println("[Geçmiş] geri alınacak işlem yok");
            return;
        }
        ileri.push(depo.hatiraOlustur());
        depo.hatirayaDon(geri.pop());
        System.out.println("[Geçmiş] geri alındı");
    }

    public void yinele() {
        if (ileri.isEmpty()) {
            System.out.println("[Geçmiş] yinelenecek işlem yok");
            return;
        }
        geri.push(depo.hatiraOlustur());
        depo.hatirayaDon(ileri.pop());
        System.out.println("[Geçmiş] yinelendi");
    }
}`;

  // ================================================================== programlar (Main üreticileri)
  /**
   * Program: {depo: 'v1'|'v2'|'hatira', defter: 'referans'|'kopya'|'hatira', tur: 'gece'|'oturum',
   *           plan: [istek] (gece), ops: [istek] (oturum), gecmis: geri al/yinele açık mı (oturum, hatira)}
   */
  const islemSatiri = (op, girinti) => {
    const g = ' '.repeat(girinti);
    return op.t === 'tasi' ? `${g}depo.tasi("${op.koli}", "${op.raf}");` : `${g}depo.yukle("${op.koli}");`;
  };
  function geceMain(prog) {
    const L = ['        Depo depo = Depo.sabah();', '        YedekDefteri defter = new YedekDefteri(depo);', '', cm('        defter.kaydet("02:00");', 'gece planından önce', 52), '        try {'];
    prog.plan.forEach((op, i) => {
      const s = islemSatiri(op, 12);
      L.push(i === prog.plan.length - 1 ? cm(s, `planlama hatası: ${op.raf} dolu`, 52) : s);
    });
    L.push(
      '        } catch (IllegalStateException e) {',
      '            System.out.println("[Gece] HATA: " + e.getMessage());',
      cm('            defter.geriYukle("02:00");', 'plan iptal: önceki hâle dön', 52),
      '        }',
      '        System.out.println(depo.durum());'
    );
    return `public class Main {

    public static void main(String[] args) {
${L.join('\n')}
    }
}`;
  }
  MN.defterVar = (prog) => prog.tur === 'gece' || prog.ops.some((op) => op.t === 'kaydet' || op.t === 'don');
  function oturumMain(prog) {
    const L = ['        Depo depo = Depo.sabah();'];
    if (MN.defterVar(prog)) L.push('        YedekDefteri defter = new YedekDefteri(depo);');
    if (prog.gecmis) L.push('        DepoGecmisi gecmis = new DepoGecmisi(depo);');
    if (prog.ops.length) L.push('');
    prog.ops.forEach((op) => {
      if (prog.gecmis && (op.t === 'tasi' || op.t === 'yukle' || op.t === 'don')) L.push('        gecmis.islemOncesi();');
      if (op.t === 'tasi' || op.t === 'yukle') L.push(islemSatiri(op, 8));
      else if (op.t === 'kaydet') L.push(`        defter.kaydet("${op.ad}");`);
      else if (op.t === 'don') L.push(`        defter.geriYukle("${op.ad}");`);
      else if (op.t === 'geri') L.push('        gecmis.geriAl();');
      else L.push('        gecmis.yinele();');
    });
    L.push('        System.out.println(depo.durum());');
    return `public class Main {

    public static void main(String[] args) {
${L.join('\n')}
    }
}`;
  }
  MN.mainFor = (prog) => (prog.tur === 'gece' ? geceMain(prog) : oturumMain(prog));

  const DEPO_KOD = { v1: code.DepoV1, v2: code.DepoV2, hatira: code.Depo };
  const DEFTER_KOD = { referans: code.DefterReferans, kopya: code.DefterKopya, hatira: code.YedekDefteri };
  /** Programın bütün dosyaları */
  MN.filesFor = function (prog) {
    const F = { Main: MN.mainFor(prog) };
    if (MN.defterVar(prog)) F.YedekDefteri = DEFTER_KOD[prog.defter];
    if (prog.gecmis) F.DepoGecmisi = code.DepoGecmisi;
    F.Depo = DEPO_KOD[prog.depo];
    return F;
  };
  MN.fileOrder = ['Main', 'YedekDefteri', 'DepoGecmisi', 'Depo'];
  MN.fileList = (F, order) => (order || MN.fileOrder).filter((n) => F[n]).map((n) => ({ name: n + '.java', code: F[n] }));

  // ================================================================== çalıştırma benzetimi (Java ile birebir)
  /**
   * Programı adım adım çalıştırır; Java’nın referans anlamını da izler: deponun haritası ve listesi birer nesnedir
   * (#1, #2 …). “yedek = depo.getRaflar()” aynı nesneye ikinci bir ad verir; setRaflar(…) alanı başka bir nesneye bağlar.
   * Dönüş: {lines, olaylar, son}
   *   lines  : [{t, k: 'defter'|'depo'|'kamyon'|'hata'|'gecmis'|'yok'|'durum', i: istek no}]
   *   olaylar: {e, istek, n: o ana kadarki satır sayısı, s: anlık durum, ...}
   */
  MN.run = function (prog) {
    const v1 = prog.depo === 'v1';
    let nid = 0;
    const nesne = {};
    const yeniMap = (src) => {
      const id = ++nid;
      nesne[id] = { id, tur: 'map', veri: Object.assign({}, src) };
      return id;
    };
    const yeniList = (src) => {
      const id = ++nid;
      nesne[id] = { id, tur: 'list', veri: src.slice() };
      return id;
    };
    const depo = { raflar: yeniMap(MN.SABAH), kamyon: v1 ? null : yeniList([]) };
    const yedekler = {};
    const sira = [];
    const dogru = {};
    const gecmis = { geri: [], ileri: [] };
    let kopyalanan = 0;
    let hatali = 0;
    let hatira = null; // en son oluşturulan ya da açılan hatıra (sahne için)
    const lines = [];
    const olaylar = [];
    let istek = -1;

    const raflarOf = () => nesne[depo.raflar].veri;
    const kamyonOf = () => (v1 ? null : nesne[depo.kamyon].veri);
    const kopyaMap = (m) => Object.assign({}, m);
    const snap = () => ({
      raflar: kopyaMap(raflarOf()),
      raflarId: depo.raflar,
      kamyon: v1 ? null : kamyonOf().slice(),
      kamyonId: depo.kamyon,
      yedekler: sira.map((ad) => {
        const y = yedekler[ad];
        return y.tur === 'map'
          ? { ad, tur: 'map', id: y.id, raflar: kopyaMap(nesne[y.id].veri), canli: y.id === depo.raflar }
          : { ad, tur: 'hatira', id: y.h.id, raflar: kopyaMap(y.h.raflar), kamyon: y.h.kamyon.slice() };
      }),
      hatira: hatira ? { id: hatira.id, raflar: kopyaMap(hatira.raflar), kamyon: hatira.kamyon.slice() } : null,
      gecmis: { geri: gecmis.geri.length, ileri: gecmis.ileri.length },
      kopyalanan,
      hatali,
    });
    const out = (t, k) => lines.push({ t, k, i: istek });
    const olay = (e, x) => olaylar.push(Object.assign({ e, istek, n: lines.length }, x || {}, { s: snap() }));

    // ---- depo (kaynak)
    const tasi = (koli, raf) => {
      const m = raflarOf();
      if (Object.values(m).includes(raf)) {
        olay('hata', { koli, raf });
        throw { dolu: true, raf };
      }
      const eski = m[koli] === undefined ? 'null' : m[koli];
      m[koli] = raf;
      out(`  depo: ${koli} ${eski} → ${raf}`, 'depo');
      olay('tasi', { koli, from: eski, to: raf });
    };
    const yukle = (koli) => {
      const m = raflarOf();
      const raf = m[koli] === undefined ? 'null' : m[koli];
      delete m[koli];
      kamyonOf().push(koli);
      out(`  kamyon: ${koli} yüklendi (${raf} boşaldı)`, 'kamyon');
      olay('yukle', { koli, from: raf });
    };
    const hatiraOlustur = () => {
      const h = { id: ++nid, raflar: kopyaMap(raflarOf()), kamyon: kamyonOf().slice() };
      kopyalanan += Object.keys(h.raflar).length + h.kamyon.length;
      hatira = h;
      olay('hatiraOlustur', { id: h.id });
      return h;
    };
    const hatirayaDon = (h) => {
      const m = raflarOf();
      Object.keys(m).forEach((k) => delete m[k]);
      Object.assign(m, h.raflar);
      const l = kamyonOf();
      l.length = 0;
      l.push(...h.kamyon);
      hatira = h;
      olay('hatirayaDon', { id: h.id });
    };

    // ---- yedek defteri (emanetçi)
    const kaydet = (ad) => {
      olay('kaydetBas', { ad });
      let y;
      if (prog.defter === 'referans') y = { tur: 'map', id: depo.raflar };
      else if (prog.defter === 'kopya') {
        y = { tur: 'map', id: yeniMap(raflarOf()) };
        kopyalanan += Object.keys(raflarOf()).length;
      } else y = { tur: 'hatira', h: hatiraOlustur() };
      if (!(ad in yedekler)) sira.push(ad);
      yedekler[ad] = y;
      dogru[ad] = { raflar: kopyaMap(raflarOf()), kamyon: v1 ? null : kamyonOf().slice() };
      out(`[Defter] kaydedildi: ${ad}`, 'defter');
      olay('kaydet', { ad, tur: y.tur, id: y.tur === 'map' ? y.id : y.h.id });
    };
    const geriYukle = (ad) => {
      olay('donBas', { ad });
      const y = yedekler[ad];
      if (y.tur === 'map') {
        depo.raflar = y.id;
        olay('setRaflar', { id: y.id });
      } else hatirayaDon(y.h);
      const d = dogru[ad];
      const ayniMap = (a, b) => JSON.stringify(Object.keys(a).sort().map((k) => [k, a[k]])) === JSON.stringify(Object.keys(b).sort().map((k) => [k, b[k]]));
      const ok = ayniMap(raflarOf(), d.raflar) && (v1 || JSON.stringify(kamyonOf()) === JSON.stringify(d.kamyon));
      if (!ok) hatali++;
      out(`[Defter] geri yüklendi: ${ad}`, 'defter');
      olay('don', { ad, ok, dogru: { raflar: kopyaMap(d.raflar), kamyon: d.kamyon ? d.kamyon.slice() : null } });
    };

    // ---- geçmiş (Genişlet)
    const islemOncesi = () => {
      gecmis.geri.push(hatiraOlustur());
      gecmis.ileri.length = 0;
      olay('gecmisKaydet');
    };
    const geriAl = () => {
      if (!gecmis.geri.length) {
        out('[Geçmiş] geri alınacak işlem yok', 'yok');
        olay('yok');
        return;
      }
      gecmis.ileri.push(hatiraOlustur());
      hatirayaDon(gecmis.geri.pop());
      out('[Geçmiş] geri alındı', 'gecmis');
      olay('geriAl');
    };
    const yinele = () => {
      if (!gecmis.ileri.length) {
        out('[Geçmiş] yinelenecek işlem yok', 'yok');
        olay('yok');
        return;
      }
      gecmis.geri.push(hatiraOlustur());
      hatirayaDon(gecmis.ileri.pop());
      out('[Geçmiş] yinelendi', 'gecmis');
      olay('yinele');
    };

    const durum = () => {
      const m = raflarOf();
      let s =
        'Raflar:' +
        Object.keys(m)
          .sort()
          .map((k) => ` ${k.slice(4)}:${m[k]}`)
          .join('');
      if (!v1) {
        const l = kamyonOf();
        s += ' · Kamyon:' + (l.length ? l.map((k) => ' ' + k.slice(4)).join('') : ' boş');
      }
      istek = -1;
      out(s, 'durum');
      olay('durum');
    };

    if (prog.tur === 'gece') {
      istek = 0;
      kaydet('02:00');
      try {
        prog.plan.forEach((op, k) => {
          istek = k + 1;
          if (op.t === 'tasi') tasi(op.koli, op.raf);
          else yukle(op.koli);
        });
      } catch (e) {
        if (!e.dolu) throw e;
        istek = prog.plan.length + 1;
        out(`[Gece] HATA: ${e.raf} dolu`, 'hata');
        olay('yakala', { raf: e.raf });
        geriYukle('02:00');
      }
    } else {
      prog.ops.forEach((op, k) => {
        istek = k;
        if (prog.gecmis && (op.t === 'tasi' || op.t === 'yukle' || op.t === 'don')) islemOncesi();
        if (op.t === 'tasi') tasi(op.koli, op.raf);
        else if (op.t === 'yukle') yukle(op.koli);
        else if (op.t === 'kaydet') kaydet(op.ad);
        else if (op.t === 'don') geriYukle(op.ad);
        else if (op.t === 'geri') geriAl();
        else yinele();
      });
    }
    durum();
    const son = olaylar[olaylar.length - 1].s;
    // iki yerde duran koliler: hem rafta hem kamyonda (ya da kamyonda iki kez)
    const say = {};
    Object.keys(son.raflar).forEach((k) => (say[k] = (say[k] || 0) + 1));
    (son.kamyon || []).forEach((k) => (say[k] = (say[k] || 0) + 1));
    son.ikiYerde = Object.keys(say).filter((k) => say[k] > 1).sort();
    son.dogru = dogru;
    return { lines, olaylar, son };
  };
  MN.outputOf = (prog) => MN.run(prog).lines.map((l) => l.t);

  // ================================================================== "Sorun" sürümleri
  MN.NV = {
    v1: { depo: 'v1', defter: 'referans', tur: 'gece', plan: MN.PLAN_V1 },
    v11: { depo: 'v1', defter: 'kopya', tur: 'gece', plan: MN.PLAN_V1 },
    v2: { depo: 'v2', defter: 'kopya', tur: 'gece', plan: MN.PLAN },
  };
  MN.naiveFiles = (v) => MN.filesFor(MN.NV[v]);

  // ================================================================== çözüm ve adım adım yeniden düzenleme
  MN.COZUM = { depo: 'hatira', defter: 'hatira', tur: 'gece', plan: MN.PLAN };
  code.Main = geceMain(MN.COZUM);
  MN.output = MN.outputOf(MN.COZUM);
  const V2 = MN.naiveFiles('v2');
  /** Adım 1: Depo hatırasını oluşturmayı ve ona dönmeyi öğrenir (get/set hâlâ açık) */
  const depoAra = plain(depoSrc({ kamyon: true, getset: true, hatira: true }));
  const R1 = Object.assign({}, V2, { Depo: depoAra });
  /** Adım 2: Defter hatıra saklar */
  const R2 = Object.assign({}, R1, { YedekDefteri: plain(code.YedekDefteri) });
  /** Adım 3: Depo’nun içi kapanır (get/set silindi, alanlar final) */
  const R3 = Object.assign({}, R2, { Depo: plain(code.Depo) });
  MN.refactor = [V2, R1, R2, R3];
  MN.refactorProgs = [MN.NV.v2, MN.NV.v2, MN.COZUM, MN.COZUM];
  MN.refactorOrder = ['Main', 'YedekDefteri', 'Depo'];
  /** Depo’nun dışarı açtığı iç durum yöntemleri (get/set) */
  MN.acikSayisi = (src) => (src.match(/public (?:Map|List)<String(?:, String)?> get|public void set(?:Raflar|Kamyon)\(/g) || []).length;

  // ================================================================== Canlı Akış
  MN.presets = {
    gece: { key: 'gece', title: 'Gece planı: geri dönüş', prog: MN.COZUM },
    noktalar: { key: 'noktalar', title: 'İki kayıt noktası', prog: { depo: 'hatira', defter: 'hatira', tur: 'oturum', ops: [K('09:00'), T('KRG-1001', 'B3'), K('10:00'), Y('KRG-1003'), D('09:00')] } },
  };
  MN.presetOrder = ['gece', 'noktalar'];
  MN.akisFiles = (p) => MN.fileList(MN.filesFor(p.prog));
  MN.akisOutput = (p) => MN.outputOf(p.prog);

  // ================================================================== Yedek tezgâhı
  /** Rehberli ana oturum: kaydet, iki yükleme ve bir taşıma, geri yükle */
  MN.TEZGAH_ANA = [K('09:00'), Y('KRG-1001'), T('KRG-1004', 'C2'), Y('KRG-1005'), D('09:00')];
  /** Oturum: {design: 'referans'|'kopya'|'hatira', ops, gecmis (yalnızca hatira)} */
  MN.tezgahProg = (tz) => ({ depo: tz.design === 'hatira' ? 'hatira' : 'v2', defter: tz.design, tur: 'oturum', ops: tz.ops, gecmis: tz.design === 'hatira' && !!tz.gecmis });
  MN.tezgahFiles = (tz) => MN.filesFor(MN.tezgahProg(tz));
  /** Bir istek bu anda yapılabilir mi? (tezgâhın düğmeleri; Java tarafında çalışma hatası çıkmasın) */
  MN.uygun = function (s, op, tz) {
    if (op.t === 'tasi') return !!s.raflar[op.koli] && s.raflar[op.koli] !== op.raf && !Object.values(s.raflar).includes(op.raf);
    if (op.t === 'yukle') return !!s.raflar[op.koli];
    if (op.t === 'kaydet') return tz.ops.filter((x) => x.t === 'kaydet').length < MN.KAYIT_EN_COK;
    if (op.t === 'don') return tz.ops.some((x) => x.t === 'kaydet' && x.ad === op.ad);
    return tz.design === 'hatira' && !!tz.gecmis;
  };
  MN.siradakiKayit = (ops) => MN.kayitAdi(ops.filter((x) => x.t === 'kaydet').length);
  MN.olc = function (tz) {
    const prog = MN.tezgahProg(tz);
    const r = MN.run(prog);
    return {
      run: r,
      islem: tz.ops.filter((x) => x.t === 'tasi' || x.t === 'yukle').length,
      kayit: tz.ops.filter((x) => x.t === 'kaydet').length,
      kopyalanan: r.son.kopyalanan,
      hatali: r.son.hatali,
      ikiYerde: r.son.ikiYerde,
    };
  };

  // ================================================================== Genişlet: geri al / yinele (DepoGecmisi)
  const EX = (MN.ext = {});
  EX.exercise = `public class DepoGecmisi {

    private final Depo depo;
    private final Deque<⟦1⟧> geri = new ArrayDeque<>();
    private final Deque<Depo.Hatira> ileri = new ArrayDeque<>();

    public void islemOncesi() {
        geri.push(depo.⟦2⟧());
        ileri.clear();
    }

    public void geriAl() {
        if (geri.isEmpty()) {
            System.out.println("[Geçmiş] geri alınacak işlem yok");
            return;
        }
        ileri.push(depo.hatiraOlustur());
        depo.⟦3⟧(geri.pop());
        System.out.println("[Geçmiş] geri alındı");
    }
}`;
  EX.exerciseMain = `// Main.java: her işlemden önce hatıra, sonra geri al
gecmis.islemOncesi();
depo.tasi("KRG-1001", "B3");
gecmis.islemOncesi();
depo.yukle("KRG-1003");
gecmis.⟦4⟧();`;
  EX.answers = { 1: 'Depo.Hatira', 2: 'hatiraOlustur', 3: 'hatirayaDon', 4: 'geriAl' };
  EX.prog = { depo: 'hatira', defter: 'hatira', tur: 'oturum', gecmis: true, ops: [T('KRG-1001', 'B3'), Y('KRG-1003'), G, G, I] };
  EX.Main = oturumMain(EX.prog);
  EX.output = MN.outputOf(EX.prog);

  // ================================================================== Yapı: emanetçi hatıranın içine bakarsa (gerçek javac hatası)
  MN.merakli = (function () {
    const src = plain(code.YedekDefteri).replace(
      '        System.out.println("[Defter] geri yüklendi: " + ad);\n    }\n}',
      `        System.out.println("[Defter] geri yüklendi: " + ad);
    }

    public void icineBak(String ad) {
        System.out.println(yedekler.get(ad).raflar);
    }
}`
    );
    const satirNo = MN.lineOf(src, 'yedekler.get(ad).raflar');
    const L = src.split('\n')[satirNo - 1];
    return {
      src,
      hata: [`YedekDefteri.java:${satirNo}: error: raflar has private access in Hatira`, L, ' '.repeat(L.indexOf('.raflar')) + '^', '1 error'],
    };
  })();

  // ================================================================== Gerçek dünya (JDK) örnekleri
  const RW = (MN.rw = {});

  RW.seri = (arg) => `import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.util.ArrayList;

public class SeriHatira {

    static class Kamyon implements Serializable {
        private static final long serialVersionUID = 1L;
${cm('        private final ArrayList<String> yuk = new ArrayList<>();', 'kaydedilir', 64)}
${cm('        private transient String surucu = "Ahmet";', 'kaydedilmez', 64)}
    }

    public static void main(String[] args) throws Exception {
        Kamyon kamyon = new Kamyon();
        kamyon.yuk.add("KRG-1001");
${cm('        byte[] hatira = kaydet(kamyon);', 'hatıra: bayt dizisi', 52)}
${cm('        kamyon.yuk.add("KRG-1005");', 'sonra değişti', 52)}

        ${arg}
        System.out.println("yük: " + k.yuk + " · sürücü: " + k.surucu);
    }

    static byte[] kaydet(Kamyon k) throws IOException {
        ByteArrayOutputStream bayt = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(bayt)) {
            out.writeObject(k);
        }
        return bayt.toByteArray();
    }

    static Kamyon geriOku(byte[] hatira) throws IOException, ClassNotFoundException {
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(hatira))) {
            return (Kamyon) in.readObject();
        }
    }
}`;
  const sArg = (stmt, comment) => cm('        ' + stmt, comment, 52).slice(8);
  RW.seriOpts = [
    { label: 'Şimdiki nesne', arg: sArg('Kamyon k = kamyon;', 'değişmiş hâl'), out: ['yük: [KRG-1001, KRG-1005] · sürücü: Ahmet'] },
    { label: 'Hatıradan oku', arg: sArg('Kamyon k = geriOku(hatira);', 'kayıt anındaki hâl'), out: ['yük: [KRG-1001] · sürücü: null'] },
    { label: 'Aynı nesne mi?', arg: 'Kamyon k = geriOku(hatira); System.out.print(k == kamyon ? "aynı · " : "yeni nesne · ");', out: ['yeni nesne · yük: [KRG-1001] · sürücü: null'] },
  ];

  RW.stateEdit = (arg) => `import java.util.Hashtable;
import javax.swing.undo.StateEdit;
import javax.swing.undo.StateEditable;

public class DurumDuzenleme {

    static class Koli implements StateEditable {
        private String raf = "A1";

        @Override
        public void storeState(Hashtable<Object, Object> durum) {
            durum.put("raf", raf);
        }

        @Override
        public void restoreState(Hashtable<?, ?> durum) {
            Object r = durum.get("raf");
            if (r != null) {
                raf = (String) r;
            }
        }
    }

    public static void main(String[] args) {
        Koli koli = new Koli();
${cm('        StateEdit tasima = new StateEdit(koli, "taşı");', 'önceki hâlin hatırası', 52)}
        koli.raf = "B3";
${cm('        tasima.end();', 'sonraki hâlin hatırası', 52)}
        ${arg}
        System.out.println("KRG-1001 → " + koli.raf);
    }
}`;
  RW.stateEditOpts = [
    { label: 'Taşındı', arg: '// düzenleme bitti', out: ['KRG-1001 → B3'] },
    { label: 'undo()', arg: 'tasima.undo();', out: ['KRG-1001 → A1'] },
    { label: 'undo(), redo()', arg: 'tasima.undo(); tasima.redo();', out: ['KRG-1001 → B3'] },
  ];

  RW.kayit = (arg) => `import java.util.ArrayList;
import java.util.List;

public class KayitHatira {

    record Hatira(List<String> kamyon) {
    }

    public static void main(String[] args) {
        List<String> kamyon = new ArrayList<>(List.of("KRG-1001"));
        ${arg}
${cm('        kamyon.add("KRG-1005");', 'depo değişti', 52)}
        System.out.println("hatıradaki kamyon: " + h.kamyon());
    }
}`;
  RW.kayitOpts = [
    { label: 'Referans', arg: 'Hatira h = new Hatira(kamyon);', out: ['hatıradaki kamyon: [KRG-1001, KRG-1005]'] },
    { label: 'Kopya', arg: 'Hatira h = new Hatira(new ArrayList<>(kamyon));', out: ['hatıradaki kamyon: [KRG-1001]'] },
    { label: 'List.copyOf', arg: 'Hatira h = new Hatira(List.copyOf(kamyon));', out: ['hatıradaki kamyon: [KRG-1001]'] },
  ];

  // ================================================================== UML sınıf diyagramları
  const Mb = {
    raflar: { id: 'raflar', text: '- raflar: Map<String, String>', generic: '- state' },
    kamyon: { id: 'kamyon', text: '- kamyon: List<String>', generic: '- state2' },
    tasi: { id: 'tasi', text: '+ tasi(koli, raf)', generic: '+ operation()' },
    yukle: { id: 'yukle', text: '+ yukle(koli)', generic: '+ operation2()' },
    olustur: { id: 'hatiraOlustur', text: '+ hatiraOlustur(): Hatira', generic: '+ createMemento()', factory: true },
    don: { id: 'hatirayaDon', text: '+ hatirayaDon(h: Hatira)', generic: '+ setMemento(m)', factory: true },
    getset: { id: 'getset', text: '+ get/setRaflar · get/setKamyon', color: 5 },
    hRaflar: { id: 'raflar', text: '- raflar: Map<String, String>', generic: '- state' },
    hKamyon: { id: 'kamyon', text: '- kamyon: List<String>', generic: '- state2' },
    hKurucu: { id: 'kurucu', text: '- Hatira(raflar, kamyon)', generic: '- Memento(state)' },
    yedekler: { id: 'yedekler', text: '- yedekler: Map<String, Hatira>', generic: '- mementos' },
    yedeklerNaive: { id: 'yedekler', text: '- yedekler: Map<String, Map<…>>' },
    kaydet: { id: 'kaydet', text: '+ kaydet(ad)', generic: '+ save()' },
    geriYukle: { id: 'geriYukle', text: '+ geriYukle(ad)', generic: '+ restore()' },
  };
  MN.members = Mb;
  const box = {
    Main: (x, y) => ({ id: 'Main', name: 'Main', generic: 'Client', kind: 'class', role: 'client', x, y, w: 190, members: [{ id: 'main', text: '+ main(args)', generic: '+ main()' }] }),
    Depo: (x, y, o) => {
      o = o || {};
      const m = [Mb.raflar];
      if (o.kamyon !== false) m.push(Mb.kamyon);
      m.push(Mb.tasi);
      if (o.kamyon !== false) m.push(Mb.yukle);
      if (o.getset) m.push(Mb.getset);
      if (o.hatira !== false) m.push(Mb.olustur, Mb.don);
      return { id: 'Depo', name: 'Depo', generic: 'Originator', kind: 'class', role: 'originator', x, y, w: 300, members: m };
    },
    Hatira: (x, y) => ({ id: 'Hatira', name: 'Depo.Hatira', generic: 'Memento', kind: 'class', role: 'memento', x, y, w: 270, members: [Mb.hRaflar, Mb.hKamyon, Mb.hKurucu] }),
    YedekDefteri: (x, y, o) => ({ id: 'YedekDefteri', name: 'YedekDefteri', generic: 'Caretaker', kind: 'class', role: 'caretaker', x, y, w: 290, members: [o && o.naive ? Mb.yedeklerNaive : Mb.yedekler, Mb.kaydet, Mb.geriYukle] }),
  };
  MN.box = box;

  /** GoF yapısı (Yapı sahnesi, Canlı Akış, özet). o.notes: dar/geniş arayüz notları */
  MN.gofDiagram = function (o) {
    o = o || {};
    const classes = [box.Depo(20, 40), box.YedekDefteri(720, 40), box.Hatira(380, 300), box.Main(830, 320)];
    const relations = [
      { id: 'icinde', from: 'Hatira', to: 'Depo', type: 'nesting', fromSide: 'left', fromAt: 360, toSide: 'bottom', toAt: 170 },
      { id: 'yedekler', from: 'YedekDefteri', to: 'Hatira', type: 'aggregation', label: 'yedekler', genericLabel: 'mementos', fromSide: 'bottom', fromAt: 800, toSide: 'right', toAt: 345, points: [[800, 345]] },
      { id: 'depo', from: 'YedekDefteri', to: 'Depo', type: 'association', label: 'depo', genericLabel: 'originator', fromSide: 'left', fromAt: 90, toSide: 'right', toAt: 90 },
      { id: 'c-main', from: 'Main', to: 'YedekDefteri', type: 'dependency', label: '«create»', fromSide: 'top', fromAt: 925, toSide: 'bottom', toAt: 925 },
    ];
    const notes = o.notes
      ? [
          { id: 'n-genis', x: 20, y: 300, text: 'geniş arayüz: Depo açar\nraflar.putAll(h.raflar);', genericText: 'wide interface:\noriginator reads state', target: 'Depo', from: 'top', to: 'bottom', toAt: 90 },
          { id: 'n-dar', x: 380, y: 470, text: 'dar arayüz: defter yalnızca saklar\n(alanlar ve kurucu private)', genericText: 'narrow interface:\ncaretaker only holds it', target: 'Hatira', from: 'top', to: 'bottom', toAt: 515 },
        ]
      : [];
    return { width: 1040, height: 560, title: 'Memento sınıf diyagramı', classes, relations, notes };
  };

  /**
   * "Çözüm" sahnesinin her adımındaki diyagram.
   * 0: defter deponun içini get/set ile okur · 1: Depo.Hatira · 2: defter hatıra saklar · 3: get/set kapanır · 4: sonuç
   */
  MN.solutionDiagram = function (st) {
    const classes = [box.Depo(20, 40, { getset: st < 3, hatira: st >= 1 }), box.YedekDefteri(720, 40, { naive: st < 2 }), box.Main(830, 320)];
    const relations = [
      { id: 'depo', from: 'YedekDefteri', to: 'Depo', type: 'association', label: st < 2 ? 'depo (get/set)' : 'depo', fromSide: 'left', fromAt: 90, toSide: 'right', toAt: 90 },
      { id: 'c-main', from: 'Main', to: 'YedekDefteri', type: 'dependency', label: '«create»', fromSide: 'top', fromAt: 925, toSide: 'bottom', toAt: 925 },
    ];
    if (st >= 1) {
      classes.push(box.Hatira(380, 300));
      relations.push({ id: 'icinde', from: 'Hatira', to: 'Depo', type: 'nesting', fromSide: 'left', fromAt: 360, toSide: 'bottom', toAt: 170 });
    }
    if (st >= 2) relations.push({ id: 'yedekler', from: 'YedekDefteri', to: 'Hatira', type: 'aggregation', label: 'yedekler', fromSide: 'bottom', fromAt: 800, toSide: 'right', toAt: 345, points: [[800, 345]] });
    return { width: 1040, height: 460, view: [0, 0, 1040, 460], classes, relations };
  };

  // ------------------------------------------------------------------ UML sıralama diyagramı (Canlı Akış)
  /**
   * Akış adımlarıyla aynı sırada mesajlar; olay listesinden üretilir.
   * Dönüş: {spec, msgOf: {anahtar: mesaj no}, run}
   */
  MN.seqSpec = function (p) {
    const r = MN.run(p.prog);
    const parts = [
      { id: 'main', label: 'Main', role: 'client' },
      { id: 'defter', label: 'defter\n: YedekDefteri', role: 'caretaker', object: true },
      { id: 'depo', label: 'depo\n: Depo', role: 'originator', object: true },
    ];
    const messages = [];
    const msgOf = {};
    const add = (key, m) => {
      msgOf[key] = messages.length;
      messages.push(m);
    };
    const adlar = {};
    let say = 0;
    const islemEt = (o) => (o.e === 'tasi' ? `tasi(${MN.kisa(o.koli)}, ${o.to})` : `yukle(${MN.kisa(o.koli)})`);
    r.olaylar.forEach((o) => {
      if (o.e === 'kaydetBas') add('kaydet:' + o.ad, { from: 'main', to: 'defter', kind: 'call', label: `kaydet("${o.ad}")` });
      else if (o.e === 'hatiraOlustur') {
        say++;
        const id = 'h' + say;
        adlar[o.id] = { id, ad: say > 1 ? 'h' + say : 'h' };
        parts.push({ id, label: `${adlar[o.id].ad}\n: Depo.Hatira`, role: 'memento', object: true });
        add('olustur:' + o.id, { from: 'defter', to: 'depo', kind: 'call', label: 'hatiraOlustur()' });
        add('yeni:' + o.id, { from: 'depo', to: id, kind: 'create', label: '«create» kopyalar' });
        add('olusturDon:' + o.id, { from: 'depo', to: 'defter', kind: 'return', label: adlar[o.id].ad });
      } else if (o.e === 'kaydet') add('kaydetDon:' + o.ad, { from: 'defter', to: 'main', kind: 'return', label: '' });
      else if (o.e === 'tasi' || o.e === 'yukle') add('islem:' + o.istek, { from: 'main', to: 'depo', kind: 'call', short: true, label: islemEt(o) });
      else if (o.e === 'hata') {
        add('islem:' + o.istek, { from: 'main', to: 'depo', kind: 'call', label: `tasi(${MN.kisa(o.koli)}, ${o.raf})` });
        add('hata', { from: 'depo', to: 'main', kind: 'return', label: `IllegalStateException: ${o.raf} dolu` });
      } else if (o.e === 'donBas') add('don:' + o.ad, { from: 'main', to: 'defter', kind: 'call', label: `geriYukle("${o.ad}")` });
      else if (o.e === 'hatirayaDon') {
        const a = adlar[o.id];
        add('hatirayaDon:' + o.id, { from: 'defter', to: 'depo', kind: 'call', label: `hatirayaDon(${a.ad})` });
        add('oku:' + o.id, { from: 'depo', to: a.id, kind: 'call', short: true, label: `${a.ad}.raflar, ${a.ad}.kamyon (özel)` });
        add('hatirayaDonDon:' + o.id, { from: 'depo', to: 'defter', kind: 'return', label: '' });
      } else if (o.e === 'don') add('donDon:' + o.ad, { from: 'defter', to: 'main', kind: 'return', label: '' });
      else if (o.e === 'durum') add('durum', { from: 'main', to: 'depo', kind: 'call', short: true, label: 'durum()' });
    });
    const W = 960;
    parts.forEach((pp, i) => (pp.x = 80 + (i * (W - 160)) / (parts.length - 1)));
    const rowH = 30;
    const h = 118 + messages.length * rowH + 40;
    return { spec: { width: W, height: h, top: 118, margin: 80, rowH, participants: parts, messages, initialActive: ['main'] }, msgOf, run: r };
  };
})();
