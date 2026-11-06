/*
 * Bridge — veri: Java kodları, çıktılar, roller, diyagram tanımları.
 * Bu dosya DOM kullanmaz; tools/export-java.js de Java dosyalarını buradan üretir.
 *
 * Senaryo (lojistik dünyasının devamı): Gönderi etiketleri üç ayrı cihazda basılıyor — depoda Zebra (ZPL),
 * müşteriye e-postayla PDF, kuryenin el terminalinde termal fiş yazıcısı (ESC/POS). Kalıpsız çözüm her
 * (etiket türü × yazıcı) eşleşmesine bir sınıf yazıyor: 3 × 3 = 9 sınıf. Zebra'nın Türkçe karakter düzeltmesi
 * (^CI28) üç Zebra sınıfından birinde unutuluyor. Bridge: etiketler ve yazıcılar iki ayrı hiyerarşi;
 * aralarındaki köprü tek bir alan — protected Yazici yazici — ve 3 + 3 sınıf yeter.
 */
(function () {
  'use strict';
  const DP = (window.DP = window.DP || {});
  const BR = (DP.br = DP.br || {});

  // ------------------------------------------------------------------ roller
  BR.roles = {
    client: { en: 'Client', tr: 'İstemci', color: 1 },
    abstraction: { en: 'Abstraction', tr: 'Soyutlama', color: 2 },
    refinedAbstraction: { en: 'RefinedAbstraction', tr: 'Özelleşmiş Soyutlama', color: 3 },
    implementor: { en: 'Implementor', tr: 'Gerçekleştirici (arayüz)', color: 4 },
    concreteImplementor: { en: 'ConcreteImplementor', tr: 'Somut Gerçekleştirici', color: 5 },
  };

  BR.classRoles = {
    Main: 'client',
    Etiket: 'abstraction',
    KirilacakEtiket: 'refinedAbstraction',
    IadeEtiketi: 'refinedAbstraction',
    Yazici: 'implementor',
    ZebraYazici: 'concreteImplementor',
    PdfYazici: 'concreteImplementor',
    TermalYazici: 'concreteImplementor',
    HtmlYazici: 'concreteImplementor',
    // GoF genel adları
    Client: 'client',
    Abstraction: 'abstraction',
    RefinedAbstractionA: 'refinedAbstraction',
    RefinedAbstractionB: 'refinedAbstraction',
    Implementor: 'implementor',
    ConcreteImplementorA: 'concreteImplementor',
    ConcreteImplementorB: 'concreteImplementor',
    ConcreteImplementorC: 'concreteImplementor',
    ConcreteImplementorD: 'concreteImplementor',
  };

  BR.roleOf = function (name) {
    const r = BR.classRoles[name];
    return r ? BR.roles[r].color : null;
  };

  // `yazici` = köprü: soyutlamanın gerçekleştirimi tuttuğu alan (kodda ayrıca vurgulanır)
  BR.special = { yazici: 'brg' };

  /** 1 tabanlı satır numarası. */
  BR.lineOf = function (src, needle, from) {
    const lines = src.split('\n');
    for (let i = from || 0; i < lines.length; i++) if (lines[i].includes(needle)) return i + 1;
    return 0;
  };

  /** Satırın sonuna, belirli bir sütundan başlayan yorum ekler. */
  const cm = (line, comment, col) => line.padEnd(col || 56) + '// ' + comment;
  const doc = (text) => `/**\n * ${text}\n */\n`;
  const plain = (src) => src.replace(/^\/\*\*[\s\S]*?\*\/\n/, '');
  BR.plain = plain;

  const code = (BR.code = {});

  // ================================================================== model (Java ile birebir)
  /** Gönderiler: her etiket türü kendi gönderisini basar. */
  BR.G = {
    kitap: { v: 'kitap', takipNo: 'KRG-1001', alici: 'Ali Şahin' },
    vazo: { v: 'vazo', takipNo: 'KRG-1002', alici: 'Ayşe Yılmaz' },
    iade: { v: 'iade', takipNo: 'KRG-1003', alici: 'Zeynep Güneş' },
  };
  BR.gDecl = (k) => `Gonderi ${k} = new Gonderi("${BR.G[k].takipNo}", "${BR.G[k].alici}");`;

  /** Zebra, UTF-8 baytlarını ^CI28 olmadan varsayılan kod sayfasıyla (CP850) okur — Java ile doğrulandı. */
  BR.MOJIBAKE = { 'Ayşe Yılmaz': 'Ay┼ƒe Y─▒lmaz' };

  BR.PRINTERS = {
    zebra: { key: 'zebra', cls: 'ZebraYazici', prefix: 'Zebra', name: 'Zebra', tag: 'Zebra', dialect: 'ZPL', where: 'depo', doc: 'Depodaki Zebra termal etiket yazıcısı: ZPL komutları (1 mm = 8 nokta).' },
    pdf: { key: 'pdf', cls: 'PdfYazici', prefix: 'Pdf', name: 'PDF', tag: 'PDF', dialect: 'PDF', where: 'e-posta', doc: 'Müşteriye e-postayla giden PDF etiket (konumlar milimetre).' },
    termal: { key: 'termal', cls: 'TermalYazici', prefix: 'Termal', name: 'Termal', tag: 'Termal', dialect: 'ESC/POS', where: 'kurye', doc: 'Kuryenin el terminali: ESC/POS fiş yazıcısı; konum bilmez, satır satır basar.' },
    html: { key: 'html', cls: 'HtmlYazici', prefix: 'Html', name: 'HTML', tag: 'HTML', dialect: 'HTML', where: 'müşteri paneli', doc: 'Müşteri panelinde HTML önizleme.' },
  };
  BR.printerOrder = ['zebra', 'pdf', 'termal', 'html'];

  BR.LABELS = {
    standart: { key: 'standart', cls: 'Etiket', name: 'Standart', naive: 'Standart', suffix: 'Etiket', g: 'kitap' },
    kirilacak: { key: 'kirilacak', cls: 'KirilacakEtiket', name: 'Kırılacak', naive: 'Kirilacak', suffix: 'Etiket', g: 'vazo' },
    iade: { key: 'iade', cls: 'IadeEtiketi', name: 'İade', naive: 'Iade', suffix: 'Etiketi', g: 'iade' },
  };
  BR.labelOrder = ['standart', 'kirilacak', 'iade'];

  /**
   * Etiketin yazdir() akışı: ilkel çağrılar (p) ve Etiket'teki üst düzey işlem (adresVeBarkod).
   * sub: adresVeBarkod'un içinden yapılan çağrı. {f: 'alici'} = gönderiden gelen alan.
   */
  BR.rows = function (label) {
    const y = label === 'standart' ? 5 : 12;
    const R = [{ p: 'basla', a: [] }];
    if (label === 'kirilacak') R.push({ p: 'cerceve', a: [2, 2, 96, 56] }, { p: 'yazi', a: [5, 5, 'KIRILACAK'] });
    if (label === 'iade') R.push({ p: 'yazi', a: [5, 5, 'İADE: Malatya depo'] });
    R.push({ hl: true, call: `adresVeBarkod(g, ${y})` });
    R.push({ p: 'yazi', a: [5, y, { f: 'alici' }], sub: true });
    R.push({ p: 'barkod', a: [5, y + 7, { f: 'takipNo' }], sub: true });
    R.push({ p: 'bitir', a: [] });
    return R;
  };
  BR.prims = (label) => BR.rows(label).filter((r) => r.p);

  const argText = (x) => (typeof x === 'string' ? `"${x}"` : typeof x === 'number' ? String(x) : `g.${x.f}()`);
  /** Çağrının kaynak koddaki yazımı: yazi(5, 5, "KIRILACAK") · adresVeBarkod(g, 12) */
  BR.callText = (r) => (r.hl ? r.call : `${r.p}(${r.a.map(argText).join(', ')})`);

  const ZB = 8; // Zebra: 1 mm = 8 nokta (203 dpi)
  const TERMAL_CIZGI = '-'.repeat(24);

  /** Bir ilkel çağrının cihazdaki karşılığı: metin parçaları ve gönderi alanları. o.ci28 = false: düzeltmesiz Zebra */
  function parts(printer, p, a, o) {
    const T = '[' + BR.PRINTERS[printer].tag + '] ';
    const P = (...xs) => [T].concat(xs);
    const ci28 = !o || o.ci28 !== false;
    if (printer === 'zebra') {
      if (p === 'basla') return P(ci28 ? '^XA^CI28' : '^XA');
      if (p === 'yazi') return P(`^FO${a[0] * ZB},${a[1] * ZB}^A0N,30^FD`, a[2], '^FS');
      if (p === 'barkod') return P(`^FO${a[0] * ZB},${a[1] * ZB}^BCN,80^FD`, a[2], '^FS');
      if (p === 'cerceve') return P(`^FO${a[0] * ZB},${a[1] * ZB}^GB${a[2] * ZB},${a[3] * ZB},4^FS`);
      return P('^XZ');
    }
    if (printer === 'pdf') {
      if (p === 'basla') return P('yeni sayfa: 100 x 60 mm');
      if (p === 'yazi') return P(`yazı (${a[0]}, ${a[1]}) "`, a[2], '"');
      if (p === 'barkod') return P(`barkod (${a[0]}, ${a[1]}) Code128: `, a[2]);
      if (p === 'cerceve') return P(`dikdörtgen (${a[0]}, ${a[1]}) ${a[2]} x ${a[3]} mm`);
      return P('sayfa kaydedildi');
    }
    if (printer === 'termal') {
      if (p === 'basla') return P('ESC @');
      if (p === 'yazi') return P(a[2]);
      if (p === 'barkod') return P('GS k ', a[2]);
      if (p === 'cerceve') return P(TERMAL_CIZGI);
      return P('GS V (kes)');
    }
    // html
    if (p === 'basla') return P('<div class="etiket">');
    if (p === 'yazi') return P(`<p style="left:${a[0]}mm; top:${a[1]}mm">`, a[2], '</p>');
    if (p === 'barkod') return P('<svg class="barkod">', a[2], '</svg>');
    if (p === 'cerceve') return P('<div class="cerceve"></div>');
    return P('</div>');
  }

  /** Çıktı satırı: [Zebra] ^FO40,96^A0N,30^FDAyşe Yılmaz^FS */
  BR.line = (printer, p, a, g, o) => parts(printer, p, a, o).map((x) => (typeof x === 'string' ? x : g[x.f])).join('');
  /** Bir etiketin bir yazıcıdaki bütün çıktısı */
  BR.lines = (label, printer, gk, o) => BR.prims(label).map((r) => BR.line(printer, r.p, r.a, BR.G[gk || BR.LABELS[label].g], o));

  /** Kalıpsız sınıflardaki println ifadesi: "metin" + g.alici() + "metin" */
  const jstr = (s) => '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
  function javaConcat(pp) {
    const out = [];
    pp.forEach((x) => {
      if (typeof x === 'string' && out.length && typeof out[out.length - 1] === 'string') out[out.length - 1] += x;
      else out.push(x);
    });
    return out.map((x) => (typeof x === 'string' ? jstr(x) : `g.${x.f}()`)).join(' + ');
  }

  // ================================================================== "Sorun": her eşleşme bir sınıf
  BR.NV = {
    v1: { cols: ['zebra'], rows: ['standart', 'kirilacak'] },
    v2: { cols: ['zebra', 'pdf'], rows: ['standart', 'kirilacak'] },
    v3: { cols: ['zebra', 'pdf', 'termal'], rows: ['standart', 'kirilacak', 'iade'] },
    v4: { cols: ['zebra', 'pdf', 'termal'], rows: ['standart', 'kirilacak', 'iade'] },
  };
  BR.naiveVersions = ['v1', 'v2', 'v3', 'v4'];
  BR.FORGOT = 'ZebraKirilacakEtiket'; // ^CI28 düzeltmesinin unutulduğu sınıf

  /** Kalıpsız sınıf adı: v1'de yalnızca Zebra vardı, ad yazıcıyı söylemiyordu */
  BR.naiveName = (v, label, printer) => (v === 'v1' ? '' : BR.PRINTERS[printer].prefix) + BR.LABELS[label].naive + BR.LABELS[label].suffix;
  /** v4: Zebra sınıflarına ^CI28 eklendi — biri hariç */
  const hasCi28 = (v, name, printer) => printer === 'zebra' && v === 'v4' && name !== BR.FORGOT;

  function naiveClass(v, label, printer) {
    const name = BR.naiveName(v, label, printer);
    const o = { ci28: hasCi28(v, name, printer) };
    const body = BR.prims(label)
      .map((r) => {
        const st = `        System.out.println(${javaConcat(parts(printer, r.p, r.a, o))});`;
        return r.p === 'basla' && o.ci28 ? cm(st, '^CI28: Türkçe karakterler', 52) : st;
      })
      .join('\n');
    return `public class ${name} {

    public void yazdir(Gonderi g) {
${body}
    }
}`;
  }

  /** Sürümdeki Main'in bastığı etiketler: [etiket, yazıcı, yorum] */
  const NAIVE_MAIN = {
    v1: [['standart', 'zebra'], ['kirilacak', 'zebra']],
    v2: [['standart', 'pdf', 'müşteriye e-postayla'], ['kirilacak', 'pdf']],
    v3: [['standart', 'termal', 'kuryenin el terminali'], ['iade', 'termal']],
    v4: [['standart', 'zebra'], ['kirilacak', 'zebra']],
  };

  code.Gonderi = `${doc('Etikete basılacak gönderi bilgisi.')}public record Gonderi(String takipNo, String alici) {
}`;

  function naiveMain(v) {
    const calls = NAIVE_MAIN[v];
    const gs = [];
    calls.forEach(([label]) => !gs.includes(BR.LABELS[label].g) && gs.push(BR.LABELS[label].g));
    return `public class Main {

    public static void main(String[] args) {
${gs.map((k) => '        ' + BR.gDecl(k)).join('\n')}

${calls
  .map(([label, printer, note]) => {
    const st = `        new ${BR.naiveName(v, label, printer)}().yazdir(${BR.LABELS[label].g});`;
    return note ? cm(st, note, 60) : st;
  })
  .join('\n')}
    }
}`;
  }

  /** Kalıpsız sürümün dosyaları. v: 'v1' | 'v2' | 'v3' | 'v4' (^CI28 düzeltmesi) */
  BR.naive = function (v) {
    const files = { Gonderi: code.Gonderi };
    BR.NV[v].cols.forEach((printer) => BR.NV[v].rows.forEach((label) => (files[BR.naiveName(v, label, printer)] = naiveClass(v, label, printer))));
    files.Main = naiveMain(v);
    return files;
  };
  /** Sekme sırası: önce Main, sonra satır satır (etiket türü) sınıflar, en son Gonderi */
  BR.naiveOrder = (v) => ['Main'].concat(...BR.NV[v].rows.map((label) => BR.NV[v].cols.map((printer) => BR.naiveName(v, label, printer))), ['Gonderi']);

  /** Kalıpsız çıktı (Java ile birebir): {t, cls, bad} — bad: ^CI28'in unutulduğu satır */
  BR.naiveOutput = function (v) {
    const out = [];
    NAIVE_MAIN[v].forEach(([label, printer]) => {
      const name = BR.naiveName(v, label, printer);
      BR.lines(label, printer, null, { ci28: hasCi28(v, name, printer) }).forEach((t, i) => out.push({ t, cls: name, bad: v === 'v4' && name === BR.FORGOT && i === 0 }));
    });
    return out;
  };

  // ================================================================== "Çözüm": Bridge
  code.Yazici = `${doc('«Implementor» — Yazıcının ilkel işlemleri. Her cihaz bunları kendi komut diliyle gerçekler.')}public interface Yazici {

    void basla();

${cm('    void yazi(int x, int y, String metin);', 'konumlar milimetre', 48)}

    void barkod(int x, int y, String veri);

    void cerceve(int x, int y, int en, int boy);

    void bitir();
}`;

  code.ZebraYazici = `${doc('«ConcreteImplementor» — ' + BR.PRINTERS.zebra.doc)}public class ZebraYazici implements Yazici {

    @Override
    public void basla() {
${cm('        System.out.println("[Zebra] ^XA^CI28");', '^CI28: UTF-8, Türkçe karakterler', 52)}
    }

    @Override
    public void yazi(int x, int y, String metin) {
        System.out.println("[Zebra] ^FO" + x * 8 + "," + y * 8 + "^A0N,30^FD" + metin + "^FS");
    }

    @Override
    public void barkod(int x, int y, String veri) {
        System.out.println("[Zebra] ^FO" + x * 8 + "," + y * 8 + "^BCN,80^FD" + veri + "^FS");
    }

    @Override
    public void cerceve(int x, int y, int en, int boy) {
        System.out.println("[Zebra] ^FO" + x * 8 + "," + y * 8 + "^GB" + en * 8 + "," + boy * 8 + ",4^FS");
    }

    @Override
    public void bitir() {
        System.out.println("[Zebra] ^XZ");
    }
}`;

  code.PdfYazici = `${doc('«ConcreteImplementor» — ' + BR.PRINTERS.pdf.doc)}public class PdfYazici implements Yazici {

    @Override
    public void basla() {
        System.out.println("[PDF] yeni sayfa: 100 x 60 mm");
    }

    @Override
    public void yazi(int x, int y, String metin) {
        System.out.println("[PDF] yazı (" + x + ", " + y + ") \\"" + metin + "\\"");
    }

    @Override
    public void barkod(int x, int y, String veri) {
        System.out.println("[PDF] barkod (" + x + ", " + y + ") Code128: " + veri);
    }

    @Override
    public void cerceve(int x, int y, int en, int boy) {
        System.out.println("[PDF] dikdörtgen (" + x + ", " + y + ") " + en + " x " + boy + " mm");
    }

    @Override
    public void bitir() {
        System.out.println("[PDF] sayfa kaydedildi");
    }
}`;

  code.TermalYazici = `${doc('«ConcreteImplementor» — ' + BR.PRINTERS.termal.doc)}public class TermalYazici implements Yazici {

    @Override
    public void basla() {
        System.out.println("[Termal] ESC @");
    }

    @Override
    public void yazi(int x, int y, String metin) {
${cm('        System.out.println("[Termal] " + metin);', 'konum kullanılmaz', 52)}
    }

    @Override
    public void barkod(int x, int y, String veri) {
        System.out.println("[Termal] GS k " + veri);
    }

    @Override
    public void cerceve(int x, int y, int en, int boy) {
${cm(`        System.out.println("[Termal] ${TERMAL_CIZGI}");`, 'çerçeve yerine çizgi', 68)}
    }

    @Override
    public void bitir() {
        System.out.println("[Termal] GS V (kes)");
    }
}`;

  code.HtmlYazici = `${doc('«ConcreteImplementor» — ' + BR.PRINTERS.html.doc)}public class HtmlYazici implements Yazici {

    @Override
    public void basla() {
        System.out.println("[HTML] <div class=\\"etiket\\">");
    }

    @Override
    public void yazi(int x, int y, String metin) {
        System.out.println("[HTML] <p style=\\"left:" + x + "mm; top:" + y + "mm\\">" + metin + "</p>");
    }

    @Override
    public void barkod(int x, int y, String veri) {
        System.out.println("[HTML] <svg class=\\"barkod\\">" + veri + "</svg>");
    }

    @Override
    public void cerceve(int x, int y, int en, int boy) {
        System.out.println("[HTML] <div class=\\"cerceve\\"></div>");
    }

    @Override
    public void bitir() {
        System.out.println("[HTML] </div>");
    }
}`;

  code.Etiket = `${doc('«Abstraction» — Etiket NE basılacağını bilir; NASIL basılacağını köprünün öbür ucundaki yazıcıya bırakır.')}public class Etiket {

${cm('    protected Yazici yazici;', 'köprü: işi yapacak cihaz', 44)}

    public Etiket(Yazici yazici) {
        this.yazici = yazici;
    }

    /** Çalışma anında başka bir yazıcıya geçmek için (ör. Zebra'da kâğıt bitti). */
    public void yaziciDegistir(Yazici yeni) {
        this.yazici = yeni;
    }

    public void yazdir(Gonderi g) {
        yazici.basla();
        adresVeBarkod(g, 5);
        yazici.bitir();
    }

    /** Üst düzey işlem: yazıcının ilkel işlemlerinden kurulur. */
    protected void adresVeBarkod(Gonderi g, int y) {
        yazici.yazi(5, y, g.alici());
        yazici.barkod(5, y + 7, g.takipNo());
    }
}`;

  /** Özelleşmiş soyutlama: yazdir() gövdesi BR.rows'tan üretilir (sahnedeki adımlarla aynı kalsın) */
  function refinedSrc(label, text) {
    const L = BR.LABELS[label];
    const body = BR.rows(label)
      .filter((r) => !r.sub)
      .map((r) => '        ' + (r.hl ? r.call + ';' : `yazici.${BR.callText(r)};`))
      .join('\n');
    return `${doc('«RefinedAbstraction» — ' + text)}public class ${L.cls} extends Etiket {

    public ${L.cls}(Yazici yazici) {
        super(yazici);
    }

    @Override
    public void yazdir(Gonderi g) {
${body}
    }
}`;
  }
  code.KirilacakEtiket = refinedSrc('kirilacak', 'Kırılacak eşya: çerçeve ve uyarı ekler; hangi yazıcıda basılacağını bilmez.');
  code.IadeEtiketi = refinedSrc('iade', 'İade etiketi: gönderiyi Malatya deposuna geri yönlendirir.');

  code.Main = `public class Main {

    public static void main(String[] args) {
        ${BR.gDecl('kitap')}
        ${BR.gDecl('vazo')}

        Yazici zebra = new ZebraYazici();

        new Etiket(zebra).yazdir(kitap);
${cm('        new KirilacakEtiket(zebra).yazdir(vazo);', '^CI28 artık burada da var', 52)}
    }
}`;
  BR.output = BR.lines('standart', 'zebra').concat(BR.lines('kirilacak', 'zebra'));

  // ------------------------------------------------------------------ adım adım yeniden düzenleme
  const naiveV4 = BR.naive('v4');
  const R1 = { Yazici: plain(code.Yazici), ZebraYazici: plain(code.ZebraYazici), PdfYazici: plain(code.PdfYazici), TermalYazici: plain(code.TermalYazici) };
  const R2 = Object.assign({}, R1, { Etiket: plain(code.Etiket) });
  const R3 = Object.assign({}, R2, { KirilacakEtiket: plain(code.KirilacakEtiket), IadeEtiketi: plain(code.IadeEtiketi) });
  BR.refactor = [
    Object.assign({}, naiveV4), // 0: dokuz sınıf, ^CI28 bir sınıfta unutulmuş
    Object.assign({}, naiveV4, R1), // 1: gerçekleştirici hiyerarşisi (yazıcılar)
    Object.assign({}, naiveV4, R2), // 2: soyutlama + köprü
    Object.assign({}, naiveV4, R3), // 3: özelleşmiş soyutlamalar
    Object.assign({ Gonderi: code.Gonderi }, R3, { Main: code.Main }), // 4: istemci köprüyü kurar; dokuz sınıf silinir
  ];
  BR.refactorOrder = ['Main', 'Yazici', 'ZebraYazici', 'PdfYazici', 'TermalYazici', 'Etiket', 'KirilacakEtiket', 'IadeEtiketi'].concat(BR.naiveOrder('v4').slice(1));

  // ================================================================== Canlı Akış
  BR.presets = {
    kirilacakZebra: { key: 'kirilacakZebra', label: 'kirilacak', printer: 'zebra', title: 'Kırılacak · Zebra' },
    iadeTermal: { key: 'iadeTermal', label: 'iade', printer: 'termal', title: 'İade · Termal' },
  };
  BR.presetOrder = ['kirilacakZebra', 'iadeTermal'];

  BR.akisMain = function (p) {
    const L = BR.LABELS[p.label];
    const P = BR.PRINTERS[p.printer];
    return `public class Main {

    public static void main(String[] args) {
        ${BR.gDecl(L.g)}

${cm(`        Yazici yazici = new ${P.cls}();`, 'gerçekleştirim', 60)}
${cm(`        Etiket etiket = new ${L.cls}(yazici);`, 'soyutlama + köprü', 60)}

        etiket.yazdir(${L.g});
    }
}`;
  };
  BR.akisFiles = function (p) {
    const L = BR.LABELS[p.label];
    const P = BR.PRINTERS[p.printer];
    const files = [{ name: 'Main.java', code: BR.akisMain(p) }];
    if (L.cls !== 'Etiket') files.push({ name: L.cls + '.java', code: code[L.cls] });
    return files.concat([
      { name: 'Etiket.java', code: code.Etiket },
      { name: P.cls + '.java', code: code[P.cls] },
      { name: 'Yazici.java', code: code.Yazici },
      { name: 'Gonderi.java', code: code.Gonderi },
    ]);
  };
  BR.akisOutput = (p) => BR.lines(p.label, p.printer);

  /** Bir adımın kaynak koddaki yeri: [dosya, işaretlenecek metin] */
  BR.srcOf = function (label, r) {
    if (r.sub) return ['Etiket.java', r.p === 'yazi' ? 'yazici.yazi(5, y, g.alici());' : 'yazici.barkod(5, y + 7, g.takipNo());'];
    return [BR.LABELS[label].cls + '.java', r.hl ? r.call + ';' : `yazici.${BR.callText(r)};`];
  };

  // ================================================================== Eşleştirme tezgâhı
  /** Tezgâhtaki seçimin programı; switchTo: çalışma anında geçilen yazıcı */
  BR.tezgahMain = function (label, printer, switchTo) {
    const L = BR.LABELS[label];
    const sw = switchTo ? cm(`        etiket.yaziciDegistir(new ${BR.PRINTERS[switchTo].cls}());`, 'çalışma anında: kâğıt bitti', 64) + '\n' : '';
    return `public class Main {

    public static void main(String[] args) {
        ${BR.gDecl(L.g)}

        Etiket etiket = new ${L.cls}(new ${BR.PRINTERS[printer].cls}());
${sw}        etiket.yazdir(${L.g});
    }
}`;
  };

  /** Tezgâhın rehberli üç denemesi tek programda (java/bridge/tezgah) */
  code.TezgahMain = `public class Main {

    public static void main(String[] args) {
        ${BR.gDecl('vazo')}
        ${BR.gDecl('iade')}

${cm('        new KirilacakEtiket(new TermalYazici()).yazdir(vazo);', 'aynı etiket, başka yazıcı', 64)}
${cm('        new IadeEtiketi(new TermalYazici()).yazdir(iade);', 'aynı yazıcı, başka etiket', 64)}

        Etiket etiket = new KirilacakEtiket(new ZebraYazici());
${cm('        etiket.yaziciDegistir(new PdfYazici());', 'çalışma anında: Zebra\'da kâğıt bitti', 64)}
        etiket.yazdir(vazo);
    }
}`;
  BR.tezgahOutput = BR.lines('kirilacak', 'termal').concat(BR.lines('iade', 'termal'), BR.lines('kirilacak', 'pdf'));

  // ================================================================== Genişlet: yeni gerçekleştirici (HtmlYazici)
  const EX = (BR.ext = {});
  EX.exercise = `public class HtmlYazici implements ⟦1⟧ {

    @Override
    public void basla() {
        System.out.println("[HTML] <div class=\\"etiket\\">");
    }

    @Override
    public void ⟦2⟧(int x, int y, String metin) {
        System.out.println("[HTML] <p style=\\"left:" + x + "mm; top:" + y + "mm\\">" + metin + "</p>");
    }

    @Override
    public void barkod(int x, int y, String veri) {
        System.out.println("[HTML] <svg class=\\"barkod\\">" + veri + "</svg>");
    }

    @Override
    public void cerceve(int x, int y, int en, int boy) {
        System.out.println("[HTML] <div class=\\"cerceve\\"></div>");
    }

    @Override
    public void ⟦3⟧() {
        System.out.println("[HTML] </div>");
    }
}`;
  EX.exerciseMain = `// Main.java içine:
Yazici html = new ⟦4⟧();
new ⟦5⟧(html).yazdir(vazo);`;
  EX.Main = `public class Main {

    public static void main(String[] args) {
        ${BR.gDecl('vazo')}
        ${BR.gDecl('iade')}

${cm('        Yazici html = new HtmlYazici();', 'YENİ gerçekleştirici', 56)}

        new KirilacakEtiket(html).yazdir(vazo);
${cm('        new IadeEtiketi(html).yazdir(iade);', 'etiket sınıflarına dokunmadan', 56)}
    }
}`;
  EX.output = BR.lines('kirilacak', 'html').concat(BR.lines('iade', 'html'));

  // ================================================================== Gerçek dünya (JDK) örnekleri
  const RW = (BR.rw = {});
  const mapCls = (arg) => arg.replace(/^new (\w+)<>\(\)$/, '$1');
  RW.set = (arg) => `${['java.util.Collections', 'java.util.' + mapCls(arg), 'java.util.Set']
    .sort()
    .map((x) => `import ${x};`)
    .join('\n')}

public class KumeKoprusu {

    public static void main(String[] args) {
${cm(`        Set<String> sehirler = Collections.newSetFromMap(${arg});`, 'köprü: Set → Map', 84)}
        sehirler.add("Malatya");
        sehirler.add("Ankara");
        sehirler.add("Van");
        sehirler.add("İzmir");
${cm('        sehirler.add("Ankara");', 'zaten var: eklenmez', 84)}
        System.out.println(sehirler + " · " + sehirler.size() + " şehir");
    }
}`;
  RW.setOpts = [
    { label: 'HashMap', arg: 'new HashMap<>()', out: ['[Van, Malatya, Ankara, İzmir] · 4 şehir'] },
    { label: 'LinkedHashMap', arg: 'new LinkedHashMap<>()', out: ['[Malatya, Ankara, Van, İzmir] · 4 şehir'] },
    { label: 'TreeMap', arg: 'new TreeMap<>()', out: ['[Ankara, Malatya, Van, İzmir] · 4 şehir'] },
  ];

  RW.ui = (arg) => `import javax.swing.JButton;
import javax.swing.UIManager;

public class GorunumKoprusu {

    public static void main(String[] args) throws Exception {
${cm(`        UIManager.setLookAndFeel("${arg}");`, 'gerçekleştirici ailesi', 84)}
${cm('        JButton dugme = new JButton("Etiketi yazdır");', 'soyutlama: aynı düğme', 84)}
        System.out.println(dugme.getText() + " → " + dugme.getUI().getClass().getSimpleName());
    }
}`;
  RW.uiOpts = [
    { label: 'Metal', arg: 'javax.swing.plaf.metal.MetalLookAndFeel', out: ['Etiketi yazdır → MetalButtonUI'] },
    { label: 'Nimbus', arg: 'javax.swing.plaf.nimbus.NimbusLookAndFeel', out: ['Etiketi yazdır → SynthButtonUI'] },
  ];

  RW.jdbc = () => `// Uygulama yalnızca java.sql arayüzlerini bilir: Connection, PreparedStatement, ResultSet
${cm('String url = "jdbc:postgresql://localhost/kargo";', 'ya da "jdbc:mysql://…", "jdbc:h2:mem:kargo"', 52)}

try (Connection baglanti = DriverManager.getConnection(url);
     PreparedStatement sorgu = baglanti.prepareStatement(
             "SELECT durum FROM gonderi WHERE takip_no = ?")) {
    sorgu.setString(1, "KRG-1002");
    try (ResultSet sonuc = sorgu.executeQuery()) {
        while (sonuc.next()) System.out.println(sonuc.getString("durum"));
    }
}
// Bağlantıyı açan sürücü (gerçekleştirici) URL'ye göre ÇALIŞMA ANINDA seçilir:
// org.postgresql.Driver · com.mysql.cj.jdbc.Driver · org.h2.Driver …`;

  // ================================================================== UML sınıf diyagramları
  const M = {
    yazici: { id: 'yazici', text: '# yazici: Yazici', generic: '# imp: Implementor', color: 4 },
    yazdir: { id: 'yazdir', text: '+ yazdir(g)', generic: '+ operation()' },
    adres: { id: 'adres', text: '# adresVeBarkod(g, y)', generic: '# helper()' },
    degistir: { id: 'degistir', text: '+ yaziciDegistir(y)', generic: '+ setImp(i)' },
    basla: { id: 'basla', text: '+ basla()', generic: '+ beginImp()', abstract: true },
    yazi: { id: 'yazi', text: '+ yazi(x, y, metin)', generic: '+ operationImp()', abstract: true },
    barkod: { id: 'barkod', text: '+ barkod(x, y, veri)', generic: '+ barcodeImp()', abstract: true },
    cerceve: { id: 'cerceve', text: '+ cerceve(x, y, en, boy)', generic: '+ frameImp()', abstract: true },
    bitir: { id: 'bitir', text: '+ bitir()', generic: '+ endImp()', abstract: true },
    dev: (text) => ({ id: 'impl', text: '+ ' + text, generic: '+ operationImp()', factory: true }),
    refined: (text) => ({ id: 'yazdir', text: '+ yazdir(g) · ' + text, generic: '+ operation()' }),
  };
  BR.members = M;

  const IMPL_X = { zebra: 468, pdf: 676, termal: 876, html: 1096 };
  const DEV_TEXT = { zebra: 'ZPL komutları', pdf: 'PDF çizimi', termal: 'ESC/POS komutları', html: 'HTML etiketleri' };
  const IMPL_W = { zebra: 192, pdf: 184, termal: 204, html: 184 };
  const implBox = (k, g, hidden) => ({ id: BR.PRINTERS[k].cls, name: BR.PRINTERS[k].cls, generic: 'ConcreteImplementor' + g, kind: 'class', role: 'concreteImplementor', x: IMPL_X[k], y: 400, w: IMPL_W[k], hidden, members: [M.dev(DEV_TEXT[k])] });
  // gerçekleştiricilerin oku Yazici'nin altında tek bir üçgende birleşir
  const implEdge = (k, hidden) => ({ id: 'r-' + k, from: BR.PRINTERS[k].cls, to: 'Yazici', type: 'realization', fromSide: 'top', fromAt: IMPL_X[k] + IMPL_W[k] / 2, toSide: 'bottom', toAt: 710, mid: 365, hidden });
  const etiketBox = () => ({ id: 'Etiket', name: 'Etiket', generic: 'Abstraction', kind: 'class', role: 'abstraction', x: 20, y: 160, w: 290, members: [M.yazici, M.yazdir, M.adres, M.degistir] });
  const yaziciBox = () => ({ id: 'Yazici', name: 'Yazici', generic: 'Implementor', kind: 'interface', role: 'implementor', x: 560, y: 160, w: 300, members: [M.basla, M.yazi, M.barkod, M.cerceve, M.bitir] });
  const bridgeEdge = () => ({ id: 'kopru', from: 'Etiket', to: 'Yazici', type: 'aggregation', label: 'yazici · köprü', genericLabel: 'imp', fromSide: 'right', fromAt: 214, toSide: 'left', toAt: 214 });
  const refinedBoxes = () => [
    { id: 'KirilacakEtiket', name: 'KirilacakEtiket', generic: 'RefinedAbstractionA', kind: 'class', role: 'refinedAbstraction', x: 0, y: 400, w: 220, members: [M.refined('çerçeve')] },
    { id: 'IadeEtiketi', name: 'IadeEtiketi', generic: 'RefinedAbstractionB', kind: 'class', role: 'refinedAbstraction', x: 240, y: 400, w: 210, members: [M.refined('İADE')] },
  ];
  // özelleşmiş soyutlamaların kalıtım okları Etiket'in altında birleşir
  const refinedEdges = () => [
    { id: 'g-kirilacak', from: 'KirilacakEtiket', to: 'Etiket', type: 'generalization', fromSide: 'top', fromAt: 110, toSide: 'bottom', toAt: 165, mid: 350 },
    { id: 'g-iade', from: 'IadeEtiketi', to: 'Etiket', type: 'generalization', fromSide: 'top', fromAt: 345, toSide: 'bottom', toAt: 165, mid: 350 },
  ];

  /** GoF yapısı (Yapı sahnesi, Canlı Akış, özet). o.html: Genişlet'teki yeni gerçekleştirici görünsün mü */
  BR.gofDiagram = function (o) {
    o = o || {};
    const classes = [
      { id: 'Main', name: 'Main', generic: 'Client', kind: 'class', role: 'client', x: 30, y: 30, w: 180, members: [{ id: 'main', text: '+ main(args)', generic: '+ main()' }] },
      etiketBox(),
      yaziciBox(),
    ]
      .concat(refinedBoxes())
      .concat([implBox('zebra', 'A'), implBox('pdf', 'B'), implBox('termal', 'C'), implBox('html', 'D', !o.html)]);
    const relations = [{ id: 'uses', from: 'Main', to: 'Etiket', type: 'dependency', label: 'kullanır', genericLabel: 'uses', fromSide: 'bottom', fromAt: 120, toSide: 'top', toAt: 120 }, bridgeEdge()]
      .concat(refinedEdges())
      .concat([implEdge('zebra'), implEdge('pdf'), implEdge('termal'), implEdge('html', !o.html)]);
    const notes = o.notes
      ? [{ id: 'n-imp', x: 250, y: 40, text: 'yazici.yazi(5, y, g.alici());', genericText: 'imp.operationImp();', target: 'Etiket', from: 'bottom', to: 'top', toAt: 280 }]
      : [];
    return { width: o.html ? 1300 : 1100, height: 500, title: 'Bridge sınıf diyagramı', fitVisible: true, classes, relations, notes };
  };

  /**
   * "Çözüm" sahnesinin her adımındaki diyagram.
   * 0: dokuz eşleşme sınıfı · 1: yazıcı hiyerarşisi · 2: soyutlama + köprü · 3: özelleşmiş etiketler · 4: istemci (eskiler silinir)
   */
  BR.solutionDiagram = function (st) {
    const classes = [];
    const relations = [];
    if (st <= 3) classes.push({ id: 'ghost', name: '', kind: 'class', x: 20, y: 24, w: 380, h: 80, ghost: true, ghostText: '+ 9 eşleşme sınıfı (ZebraStandartEtiket …)' });
    if (st >= 1) {
      classes.push(yaziciBox(), implBox('zebra', 'A'), implBox('pdf', 'B'), implBox('termal', 'C'));
      relations.push(implEdge('zebra'), implEdge('pdf'), implEdge('termal'));
    }
    if (st >= 2) {
      classes.push(etiketBox());
      relations.push(bridgeEdge());
    }
    if (st >= 3) {
      classes.push(...refinedBoxes());
      relations.push(...refinedEdges());
    }
    if (st >= 4) {
      classes.push({ id: 'Main', name: 'Main', kind: 'class', role: 'client', x: 30, y: 30, w: 180, members: [{ id: 'main', text: '+ main(args)' }] });
      relations.push({ id: 'uses', from: 'Main', to: 'Etiket', type: 'dependency', label: 'köprüyü kurar', fromSide: 'bottom', fromAt: 120, toSide: 'top', toAt: 120 });
    }
    return { width: 1100, height: 500, view: [-10, 10, 1100, 475], classes, relations };
  };

  // ------------------------------------------------------------------ UML sıralama diyagramı (Canlı Akış)
  /** msgOf[i]: akış adımı i'nin mesaj sırası (adım listesiyle aynı düzende üretilir) */
  BR.seqSpec = function (p) {
    const L = BR.LABELS[p.label];
    const P = BR.PRINTERS[p.printer];
    const parts = [
      { id: 'main', label: 'Main', role: 'client' },
      { id: 'etiket', label: 'etiket\n: ' + L.cls, role: p.label === 'standart' ? 'abstraction' : 'refinedAbstraction', object: true },
      { id: 'yazici', label: 'yazici\n: ' + P.cls, role: 'concreteImplementor', object: true },
    ];
    const messages = [
      { from: 'main', to: 'yazici', kind: 'create', label: '«create»' },
      { from: 'main', to: 'etiket', kind: 'create', label: '«create»(yazici)' },
      { from: 'main', to: 'etiket', kind: 'call', label: `yazdir(${L.g})` },
    ];
    const rowMsg = [];
    BR.rows(p.label).forEach((r) => {
      rowMsg.push(messages.length);
      if (r.hl) messages.push({ from: 'etiket', to: 'etiket', kind: 'self', label: r.call });
      else messages.push({ from: 'etiket', to: 'yazici', kind: 'call', short: true, label: BR.callText(r) });
      if (r.sub && r.p === 'barkod') messages.push({ from: 'etiket', to: 'etiket', kind: 'return', label: '' });
    });
    messages.push({ from: 'etiket', to: 'main', kind: 'return', label: '' });
    return { width: 900, height: 150 + messages.length * 38 + 24, top: 110, margin: 130, rowH: 38, participants: parts, messages, initialActive: ['main'], rowMsg };
  };
})();
