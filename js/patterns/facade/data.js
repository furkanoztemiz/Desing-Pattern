/*
 * Facade — veri: Java kodları, çıktılar, roller, diyagram tanımları.
 * Bu dosya DOM kullanmaz; tools/export-java.js de Java dosyalarını buradan üretir.
 *
 * Senaryo (lojistik dünyasının devamı): Bir gönderi oluşturmak yedi alt sistemi doğru sırayla çalıştırmayı
 * gerektiriyor: adres, tarife, ödeme, takip numarası, etiket, kurye, SMS. Kalıpsız çözümde her istemci (şube kasası,
 * web sitesi) bu iş akışını kendisi yazıyor; yedi alt sistemi tanıyor, kurucusu yedi parametre alıyor. Ödeme ekibi
 * kart limiti getirince (cek() artık boolean) kasa kontrolü ekliyor, web sitesi unutuyor: Can'ın ödemesi reddediliyor
 * ama etiket basılıyor, kurye yola çıkıyor ("hayalet gönderi"). Derleyici bir şey demiyor.
 * Facade: iş akışı ve kuralları GonderiCephesi'nde toplanır; istemciler tek bir sade işlem çağırır:
 * cephe.gonder(talep). Alt sistem sınıfları değişmez ve cepheden habersizdir.
 */
(function () {
  'use strict';
  const DP = (window.DP = window.DP || {});
  const FC = (DP.fc = DP.fc || {});

  // ------------------------------------------------------------------ roller
  FC.roles = {
    client: { en: 'Client', tr: 'İstemci', color: 1 },
    facade: { en: 'Facade', tr: 'Cephe', color: 3 },
    subsystem: { en: 'Subsystem', tr: 'Alt sistem sınıfı', color: 2 },
  };

  FC.classRoles = {
    Main: 'client',
    SubeKasasi: 'client',
    WebSitesi: 'client',
    MobilUygulama: 'client',
    KurumsalApi: 'client',
    GonderiCephesi: 'facade',
    AdresServisi: 'subsystem',
    TarifeServisi: 'subsystem',
    OdemeServisi: 'subsystem',
    TakipNoServisi: 'subsystem',
    SigortaServisi: 'subsystem',
    EtiketServisi: 'subsystem',
    KuryeServisi: 'subsystem',
    BildirimServisi: 'subsystem',
    // GoF genel adları
    Client: 'client',
    Facade: 'facade',
    Subsystem: 'subsystem',
  };

  FC.roleOf = function (name) {
    const r = FC.classRoles[name];
    return r ? FC.roles[r].color : null;
  };

  // `cephe` = istemcinin tanıdığı tek nesne (kodda ayrıca vurgulanır)
  FC.special = { cephe: 'fac' };

  /** 1 tabanlı satır numarası. */
  FC.lineOf = function (src, needle, from) {
    const lines = src.split('\n');
    for (let i = from || 0; i < lines.length; i++) if (lines[i].includes(needle)) return i + 1;
    return 0;
  };

  /** Satırın sonuna, belirli bir sütundan başlayan yorum ekler (satır uzunsa en az iki boşluk). */
  const cm = (line, comment, col) => line.padEnd(Math.max(col || 56, line.length + 2)) + '// ' + comment;
  const doc = (text) => `/**\n * ${text}\n */\n`;
  const plain = (src) => src.replace(/^((?:import [^\n]+\n)*\n?)\/\*\*[\s\S]*?\*\/\n/, '$1');
  FC.plain = plain;
  /** Parametre listesini satırlara böler (devam satırları 12 boşluk girintili) */
  const wrapParams = (head, params, tail, max) => {
    const lines = [];
    let cur = head;
    params.forEach((p, i) => {
      const piece = p + (i < params.length - 1 ? ',' : tail);
      const sep = cur.endsWith('(') ? '' : ' ';
      if ((cur + sep + piece).length > max && !cur.endsWith('(')) {
        lines.push(cur);
        cur = '            ' + piece;
      } else cur += sep + piece;
    });
    lines.push(cur);
    return lines.join('\n');
  };

  const code = (FC.code = {});

  // ================================================================== model (Java ile birebir)
  /** Müşteriler: kart limitleri (kart limiti kuralı gelince kullanılır) */
  FC.LIMIT = { 'Ali Şahin': 500, 'Ayşe Yılmaz': 300, 'Zeynep Güneş': 300, 'Can Demir': 50 };
  FC.KURYE = { Malatya: 'Mehmet', Ankara: 'Elif', İstanbul: 'Burak', İzmir: 'Deniz' };
  FC.tutar = (kg) => 40 + 15 * kg;

  /** İstemciler ve günün siparişleri */
  FC.ISTEMCI = {
    kasa: { key: 'kasa', cls: 'SubeKasasi', tag: 'Kasa', v: 'kasa', name: 'Şube kasası', doc: 'Şube kasası: gönderiyi kabul eden görevlinin ekranı.' },
    web: { key: 'web', cls: 'WebSitesi', tag: 'Web', v: 'web', name: 'Web sitesi', doc: 'Web sitesi: müşterinin kendi oluşturduğu gönderiler.' },
    mobil: { key: 'mobil', cls: 'MobilUygulama', tag: 'Mobil', v: 'mobil', name: 'Mobil uygulama', doc: 'Mobil uygulama: telefondan gönderi.' },
    api: { key: 'api', cls: 'KurumsalApi', tag: 'API', v: 'api', name: 'Kurumsal API', doc: 'Yeni istemci: e-ticaret ortağının toplu siparişleri.', toplu: true },
  };
  FC.istemciOrder = ['kasa', 'web', 'mobil', 'api'];
  const T = (musteri, adres, il, kg) => ({ musteri, adres, il, kg });
  FC.TRAFIK = {
    kasa: [T('Ali Şahin', 'Battalgazi', 'Malatya', 3)],
    web: [T('Ayşe Yılmaz', 'Çankaya', 'Ankara', 2), T('Can Demir', 'Kadıköy', 'İstanbul', 1)],
    mobil: [T('Zeynep Güneş', 'Konak', 'İzmir', 1)],
    api: [T('Ayşe Yılmaz', 'Çankaya', 'Ankara', 5), T('Can Demir', 'Kadıköy', 'İstanbul', 2)],
  };
  const talepExpr = (t) => `new Talep("${t.musteri}", "${t.adres}", "${t.il}", ${t.kg})`;

  /** Alt sistemler (akış sırasıyla); sigorta yalnızca "sigorta" değişikliğiyle gelir */
  FC.ALT = {
    adres: { key: 'adres', cls: 'AdresServisi', v: 'adres', name: 'Adres', call: 'adres.dogrula()' },
    tarife: { key: 'tarife', cls: 'TarifeServisi', v: 'tarife', name: 'Tarife', call: 'tarife.hesapla()' },
    odeme: { key: 'odeme', cls: 'OdemeServisi', v: 'odeme', name: 'Ödeme', call: 'odeme.cek()' },
    takip: { key: 'takip', cls: 'TakipNoServisi', v: 'takip', name: 'Takip no', call: 'takip.yeni()' },
    sigorta: { key: 'sigorta', cls: 'SigortaServisi', v: 'sigorta', name: 'Sigorta', call: 'sigorta.police()' },
    etiket: { key: 'etiket', cls: 'EtiketServisi', v: 'etiket', name: 'Etiket', call: 'etiket.bas()' },
    kurye: { key: 'kurye', cls: 'KuryeServisi', v: 'kurye', name: 'Kurye', call: 'kurye.ata()' },
    sms: { key: 'sms', cls: 'BildirimServisi', v: 'sms', name: 'SMS', call: 'sms.gonder()' },
  };
  /** Değişiklik istekleri: limit (kart limiti), sigorta (yeni alt sistem), kurye (alt sistemin arayüzü değişti) */
  FC.altOrder = (f) => ['adres', 'tarife', 'odeme', 'takip'].concat(f && f.sigorta ? ['sigorta'] : [], ['etiket', 'kurye', 'sms']);
  FC.DEGISIKLIK = {
    limit: { key: 'limit', title: 'Kart limiti', sub: 'ödeme reddedilebilir: cek() artık boolean' },
    sigorta: { key: 'sigorta', title: 'Sigorta poliçesi', sub: 'yeni alt sistem: SigortaServisi' },
    kurye: { key: 'kurye', title: 'Kurye API’si', sub: 'ata(no, il) → planla(no, il, kg)' },
  };
  FC.degisiklikOrder = ['limit', 'sigorta', 'kurye'];
  FC.arac = (kg) => (kg <= 2 ? 'motosiklet' : 'kamyonet');

  // ------------------------------------------------------------------ alt sistem kaynakları
  code.Talep = `${doc('Gönderi talebi: kim gönderiyor, nereye, kaç kilo.')}public record Talep(String musteri, String adres, String il, int kg) {
}`;

  code.AdresServisi = `${doc('«Subsystem» — Adres doğrulama. Cepheden habersizdir.')}public class AdresServisi {

    public String dogrula(String adres, String il) {
        String tam = adres + "/" + il;
        System.out.println("[Adres] " + tam + " doğrulandı");
        return tam;
    }
}`;

  code.TarifeServisi = `${doc('«Subsystem» — Ücret hesabı: 40 TL + kilo başına 15 TL.')}public class TarifeServisi {

    public int hesapla(int kg) {
        int tutar = 40 + 15 * kg;
        System.out.println("[Tarife] " + kg + " kg → " + tutar + " TL");
        return tutar;
    }
}`;

  /** Ödeme. limit: kart limiti kuralı (cek boolean döndürür, reddedebilir) */
  function odemeSrc(limit) {
    if (!limit)
      return `${doc('«Subsystem» — Kartlı ödeme.')}public class OdemeServisi {

${cm('    static int tahsilat;', 'gün sonu raporu için', 52)}

    public void cek(String musteri, int tutar) {
        tahsilat += tutar;
        System.out.println("[Ödeme] " + musteri + ": " + tutar + " TL çekildi");
    }
}`;
    const lim = Object.keys(FC.LIMIT)
      .map((m) => `"${m}", ${FC.LIMIT[m]}`)
      .join(', ');
    return `import java.util.Map;

${doc('«Subsystem» — Kartlı ödeme. Kart limiti aşılırsa ödeme REDDEDİLİR.')}public class OdemeServisi {

    private static final Map<String, Integer> LIMIT = Map.of(
            ${lim});
${cm('    static int tahsilat;', 'gün sonu raporu için', 52)}

${cm('    public boolean cek(String musteri, int tutar) {', 'yeni: sonucu kontrol edin!', 56)}
        int limit = LIMIT.get(musteri);
        if (tutar > limit) {
            System.out.println("[Ödeme] " + musteri + ": " + tutar + " TL REDDEDİLDİ (limit " + limit + " TL)");
            return false;
        }
        tahsilat += tutar;
        System.out.println("[Ödeme] " + musteri + ": " + tutar + " TL çekildi");
        return true;
    }
}`;
  }
  code.OdemeEski = odemeSrc(false);
  code.OdemeServisi = odemeSrc(true);

  code.TakipNoServisi = `${doc('«Subsystem» — Takip numarası verir (sıra numarası).')}public class TakipNoServisi {

    private int sayac = 1000;

    public String yeni() {
        String no = "KRG-" + (++sayac);
        System.out.println("[Takip] " + no + " verildi");
        return no;
    }
}`;

  code.SigortaServisi = `${doc('«Subsystem» — Yeni alt sistem: her gönderiye sigorta poliçesi.')}public class SigortaServisi {

    public void police(String no, int tutar) {
        System.out.println("[Sigorta] " + no + ": " + tutar + " TL değerinde poliçe");
    }
}`;

  code.EtiketServisi = `${doc('«Subsystem» — Etiket yazıcısı.')}public class EtiketServisi {

${cm('    static int basilan;', 'gün sonu raporu için', 52)}

    public void bas(String no, String adres) {
        basilan++;
        System.out.println("[Etiket] " + no + " basıldı → " + adres);
    }
}`;

  /** Kurye. planla: alt sistemin yeni sürümü (araç kiloya göre seçilir; imza değişti) */
  function kuryeSrc(planla) {
    const map = Object.keys(FC.KURYE)
      .map((il) => `"${il}", "${FC.KURYE[il]}"`)
      .join(', ');
    const head = `import java.util.Map;

${doc(planla ? '«Subsystem» — Kurye planlama (yeni sürüm: araç kiloya göre seçilir).' : '«Subsystem» — Kurye atama.')}public class KuryeServisi {

    private static final Map<String, String> KURYE = Map.of(${map});
`;
    if (!planla)
      return `${head}
    public String ata(String no, String il) {
        String kurye = KURYE.get(il);
        System.out.println("[Kurye] " + no + " → " + kurye + " (" + il + ")");
        return kurye;
    }
}`;
    return `${head}
${cm('    public String planla(String no, String il, int kg) {', 'yeni imza', 60)}
        String kurye = KURYE.get(il);
        String arac = kg <= 2 ? "motosiklet" : "kamyonet";
        System.out.println("[Kurye] " + no + " → " + kurye + " (" + il + ", " + arac + ")");
        return kurye;
    }
}`;
  }
  code.KuryeEski = kuryeSrc(false);
  code.KuryeServisi = kuryeSrc(true);

  code.BildirimServisi = `${doc('«Subsystem» — Müşteriye SMS.')}public class BildirimServisi {

    public void gonder(String musteri, String mesaj) {
        System.out.println("[SMS] " + musteri + ": " + mesaj);
    }
}`;

  // ------------------------------------------------------------------ iş akışı (istemcide ya da cephede)
  /**
   * Gönderi akışının gövdesi. f: {limit, sigorta, kurye}; o: {ret: 'void'|'opt', tag, loop}
   * Kalıpsız istemci kendi etiketiyle ([Kasa]) sonucu yazar; cephe Optional döndürür.
   */
  function akisGovdesi(f, o) {
    const ind = o.toplu ? '            ' : '        ';
    const L = [];
    const say = (x) => L.push(ind + x);
    say('String tamAdres = adres.dogrula(t.adres(), t.il());');
    say('int tutar = tarife.hesapla(t.kg());');
    if (f.limit) {
      say(cm('if (!odeme.cek(t.musteri(), tutar)) {', 'kart limiti: reddedilirse DUR', o.toplu ? 56 : 52));
      say('    sms.gonder(t.musteri(), "ödeme alınamadı, gönderi oluşturulmadı");');
      if (o.ret === 'opt') say('    return Optional.empty();');
      else {
        say(o.toplu ? `    System.out.println("[${o.tag}] " + t.musteri() + " → oluşturulmadı");` : `    System.out.println("[${o.tag}] gönderi oluşturulmadı");`);
        say(o.toplu ? '    continue;' : '    return;');
      }
      say('}');
    } else say('odeme.cek(t.musteri(), tutar);');
    say('String no = takip.yeni();');
    if (f.sigorta) say('sigorta.police(no, tutar);');
    say('etiket.bas(no, tamAdres);');
    say(f.kurye ? 'kurye.planla(no, t.il(), t.kg());' : 'kurye.ata(no, t.il());');
    say('sms.gonder(t.musteri(), no + " gönderiniz alındı");');
    if (o.ret === 'opt') say('return Optional.of(no);');
    else say(o.toplu ? `System.out.println("[${o.tag}] " + t.musteri() + " → " + no);` : `System.out.println("[${o.tag}] fiş: " + no);`);
    return L.join('\n');
  }

  /** Alt sistem alanları ve kurucusu (kalıpsız istemcide ya da cephede) */
  function altAlanlar(cls, f) {
    const alt = FC.altOrder(f).map((k) => FC.ALT[k]);
    const fields = alt.map((a) => `    private final ${a.cls} ${a.v};`).join('\n');
    const ctor = wrapParams(`    public ${cls}(`, alt.map((a) => `${a.cls} ${a.v}`), ') {', 100);
    const assigns = alt.map((a) => `        this.${a.v} = ${a.v};`).join('\n');
    return `${fields}\n\n${ctor}\n${assigns}\n    }`;
  }

  /** Kalıpsız istemci. f: uygulanan değişiklikler; forgot: kart limiti kuralı unutuldu (Sorun 2.1) */
  function naiveClient(ist, f, forgot) {
    const I = FC.ISTEMCI[ist];
    const header = `System.out.println("[${I.tag}] " + t.musteri() + ": " + t.kg() + " kg, " + t.adres() + "/" + t.il());`;
    const ff = forgot ? Object.assign({}, f, { limit: false }) : f;
    const body = akisGovdesi(ff, { ret: 'void', tag: I.tag, toplu: !!I.toplu, forgot });
    const method = I.toplu
      ? `    public void topluGonder(List<Talep> talepler) {
        System.out.println("[${I.tag}] " + talepler.size() + " talep geldi");
        for (Talep t : talepler) {
${body}
        }
    }`
      : `    public void gonder(Talep t) {
        ${header}
${body}
    }`;
    const docText = { kasa: 'Şube kasası: gönderiyi kabul eden görevlinin ekranı. Yedi alt sistemi kendisi yönetir.', web: 'Web sitesi: iş akışı şube kasasından kopyalandı.', mobil: 'Mobil uygulama: iş akışı yine kopyalandı.', api: 'Kurumsal API: toplu siparişler; iş akışı bir kez daha kopyalandı.' }[ist];
    return `${I.toplu ? 'import java.util.List;\n\n' : ''}${doc(docText)}public class ${I.cls} {

${altAlanlar(I.cls, f)}

${method}
}`;
  }

  /** Cephe. f: uygulanan değişiklikler */
  function cepheSrc(f) {
    return `import java.util.Optional;

${doc('«Facade» — Gönderi oluşturmanın tek kapısı: alt sistemleri doğru sırayla ve kurallarıyla çalıştırır.')}public class GonderiCephesi {

${altAlanlar('GonderiCephesi', f)}

${cm('    public Optional<String> gonder(Talep t) {', 'üst düzey, sade işlem', 52)}
${akisGovdesi(f, { ret: 'opt' })}
    }
}`;
  }
  FC.cepheSrc = cepheSrc;

  /** Cephe kullanan istemci (değişikliklerden etkilenmez) */
  function cepheClient(ist) {
    const I = FC.ISTEMCI[ist];
    const docText = {
      kasa: '«Client» — Şube kasası: alt sistemleri tanımaz; gönderiyi cepheye verir.',
      web: '«Client» — Web sitesi: kasayla aynı, yalnızca cepheyi tanır.',
      mobil: '«Client» — Mobil uygulama: yalnızca cepheyi tanır.',
      api: 'Yeni istemci: e-ticaret ortağının toplu siparişleri. Alt sistemleri hiç tanımaz.',
    }[ist];
    const method = I.toplu
      ? `    public void topluGonder(List<Talep> talepler) {
        System.out.println("[${I.tag}] " + talepler.size() + " talep geldi");
        for (Talep t : talepler) {
            Optional<String> no = cephe.gonder(t);
            System.out.println("[${I.tag}] " + t.musteri() + " → " + (no.isPresent() ? no.get() : "oluşturulmadı"));
        }
    }`
      : `    public void gonder(Talep t) {
        System.out.println("[${I.tag}] " + t.musteri() + ": " + t.kg() + " kg, " + t.adres() + "/" + t.il());
        Optional<String> no = cephe.gonder(t);
        System.out.println("[${I.tag}] " + (no.isPresent() ? "fiş: " + no.get() : "gönderi oluşturulmadı"));
    }`;
    return `${I.toplu ? 'import java.util.List;\n' : ''}import java.util.Optional;

${doc(docText)}public class ${I.cls} {

    private final GonderiCephesi cephe;

    public ${I.cls}(GonderiCephesi cephe) {
        this.cephe = cephe;
    }

${method}
}`;
  }
  FC.cepheClient = cepheClient;

  /**
   * Program: {design: 'naive'|'cephe', istemciler: ['kasa', …], f: {limit, sigorta, kurye}, forgot: ['web'],
   *           cepheli: ['kasa'] (Çözüm'ün ara adımı: bazı istemciler cepheye geçmiş)}
   */
  const cepheMi = (prog, ist) => prog.design === 'cephe' || (prog.cepheli || []).includes(ist);
  const trafikOf = (prog, ist) => (prog.trafik && prog.trafik[ist]) || FC.TRAFIK[ist];
  FC.trafikOf = trafikOf;
  const cepheVar = (prog) => prog.design === 'cephe' || (prog.cepheli || []).length > 0 || !!prog.cepheHazir;

  function mainSrc(prog) {
    const f = prog.f || {};
    const alt = FC.altOrder(f).map((k) => FC.ALT[k]);
    const L = [];
    alt.forEach((a) => L.push(`        ${a.cls} ${a.v} = new ${a.cls}();`));
    L.push('');
    const args = alt.map((a) => a.v).join(', ');
    if (prog.istemciler.some((i) => cepheMi(prog, i))) L.push(`        GonderiCephesi cephe = new GonderiCephesi(${args});`);
    prog.istemciler.forEach((i) => {
      const I = FC.ISTEMCI[i];
      L.push(`        ${I.cls} ${I.v} = new ${I.cls}(${cepheMi(prog, i) ? 'cephe' : args});`);
    });
    L.push('');
    prog.istemciler.forEach((i) => {
      const I = FC.ISTEMCI[i];
      const tr = trafikOf(prog, i);
      if (I.toplu) {
        L.push(`        ${I.v}.topluGonder(List.of(`);
        tr.forEach((t, k) => L.push(`                ${talepExpr(t)}${k < tr.length - 1 ? ',' : '));'}`));
      } else tr.forEach((t) => L.push(`        ${I.v}.gonder(${talepExpr(t)});`));
    });
    L.push('        System.out.println("Gün sonu: " + EtiketServisi.basilan + " etiket, " + OdemeServisi.tahsilat + " TL tahsilat");');
    const imp = prog.istemciler.some((i) => FC.ISTEMCI[i].toplu) ? 'import java.util.List;\n\n' : '';
    return `${imp}public class Main {

    public static void main(String[] args) {
${L.join('\n')}
    }
}`;
  }
  FC.mainFor = mainSrc;

  /** Bir programın bütün dosyaları */
  FC.filesFor = function (prog) {
    const f = prog.f || {};
    const F = { Main: mainSrc(prog) };
    prog.istemciler.forEach((i) => (F[FC.ISTEMCI[i].cls] = cepheMi(prog, i) ? cepheClient(i) : naiveClient(i, f, (prog.forgot || []).includes(i))));
    if (cepheVar(prog)) F.GonderiCephesi = cepheSrc(f);
    F.Talep = code.Talep;
    F.AdresServisi = code.AdresServisi;
    F.TarifeServisi = code.TarifeServisi;
    F.OdemeServisi = f.limit ? code.OdemeServisi : code.OdemeEski;
    F.TakipNoServisi = code.TakipNoServisi;
    if (f.sigorta) F.SigortaServisi = code.SigortaServisi;
    F.EtiketServisi = code.EtiketServisi;
    F.KuryeServisi = f.kurye ? code.KuryeServisi : code.KuryeEski;
    F.BildirimServisi = code.BildirimServisi;
    return F;
  };
  FC.fileOrder = ['Main', 'SubeKasasi', 'WebSitesi', 'MobilUygulama', 'KurumsalApi', 'GonderiCephesi', 'Talep', 'AdresServisi', 'TarifeServisi', 'OdemeServisi', 'TakipNoServisi', 'SigortaServisi', 'EtiketServisi', 'KuryeServisi', 'BildirimServisi'];
  FC.fileList = (F, order) => (order || FC.fileOrder).filter((n) => F[n]).map((n) => ({ name: n + '.java', code: F[n] }));

  // ------------------------------------------------------------------ çalıştırma (Java ile birebir)
  /**
   * Programın çıktısı ve iz.
   * Çıktı satırı: {t, k: 'ist'|'adres'|'tarife'|'odeme'|'red'|'takip'|'sigorta'|'etiket'|'kurye'|'sms'|'fis'|'yok'|'sum',
   *               ist (istemci), n (talep sırası), hayalet (ödenmemiş gönderinin satırı)}
   * İz (her talep için): {ist, t, adim: [{k, sonuc}], no, sonuc: 'ok'|'red'|'hayalet', cikti: [satır indeksleri]}
   */
  FC.run = function (prog) {
    const f = prog.f || {};
    const out = [];
    const iz = [];
    let sayac = 1000;
    let basilan = 0;
    let tahsilat = 0;
    let n = 0;
    prog.istemciler.forEach((ist) => {
      const I = FC.ISTEMCI[ist];
      const cepheli = cepheMi(prog, ist);
      const unuttu = !cepheli && (prog.forgot || []).includes(ist);
      const kontrol = f.limit && !unuttu;
      if (I.toplu) out.push({ t: `[${I.tag}] ${trafikOf(prog, ist).length} talep geldi`, k: 'ist', ist });
      trafikOf(prog, ist).forEach((t) => {
        const n0 = out.length;
        const z = { ist, t, n: n++, adim: [], cepheli };
        const push = (k, s, x) => out.push(Object.assign({ t: s, k, ist, n: z.n }, x || {}));
        /** Bir alt sistem adımı: konsol satırı + iz (ofiste gösterilen metin: satırın önek olmayan hâli) */
        const step = (k, s, a, x) => {
          z.adim.push(Object.assign({ k, t: s.replace(/^\[[^\]]+\] /, ''), line: out.length }, a));
          push(a && a.bad ? 'red' : k, s, x);
        };
        if (!I.toplu) push('ist', `[${I.tag}] ${t.musteri}: ${t.kg} kg, ${t.adres}/${t.il}`);
        const tam = `${t.adres}/${t.il}`;
        step('adres', `[Adres] ${tam} doğrulandı`, { sonuc: tam });
        const tutar = FC.tutar(t.kg);
        step('tarife', `[Tarife] ${t.kg} kg → ${tutar} TL`, { sonuc: tutar + ' TL' });
        let red = false;
        if (f.limit && tutar > FC.LIMIT[t.musteri]) {
          red = true;
          step('odeme', `[Ödeme] ${t.musteri}: ${tutar} TL REDDEDİLDİ (limit ${FC.LIMIT[t.musteri]} TL)`, { sonuc: 'REDDEDİLDİ', bad: true });
        } else {
          tahsilat += tutar;
          step('odeme', `[Ödeme] ${t.musteri}: ${tutar} TL çekildi`, { sonuc: tutar + ' TL çekildi' });
        }
        if (red && kontrol) {
          step('sms', `[SMS] ${t.musteri}: ödeme alınamadı, gönderi oluşturulmadı`, { sonuc: 'ödeme alınamadı', dur: true });
          if (I.toplu) push('yok', `[${I.tag}] ${t.musteri} → oluşturulmadı`);
          else push('yok', `[${I.tag}] gönderi oluşturulmadı`);
          z.sonuc = 'red';
        } else {
          const hayalet = red; // ödeme reddedildi ama akış durmadı
          const x = hayalet ? { hayalet: true } : null;
          const h = hayalet ? { hayalet: true } : {};
          const no = 'KRG-' + ++sayac;
          z.no = no;
          step('takip', `[Takip] ${no} verildi`, Object.assign({ sonuc: no }, h), x);
          if (f.sigorta) step('sigorta', `[Sigorta] ${no}: ${tutar} TL değerinde poliçe`, Object.assign({ sonuc: 'poliçe' }, h), x);
          basilan++;
          step('etiket', `[Etiket] ${no} basıldı → ${tam}`, Object.assign({ sonuc: 'basıldı' }, h), x);
          const kurye = FC.KURYE[t.il];
          step('kurye', f.kurye ? `[Kurye] ${no} → ${kurye} (${t.il}, ${FC.arac(t.kg)})` : `[Kurye] ${no} → ${kurye} (${t.il})`, Object.assign({ sonuc: f.kurye ? `${kurye}, ${FC.arac(t.kg)}` : kurye }, h), x);
          step('sms', `[SMS] ${t.musteri}: ${no} gönderiniz alındı`, Object.assign({ sonuc: 'alındı' }, h), x);
          if (I.toplu) push('fis', `[${I.tag}] ${t.musteri} → ${no}`, x);
          else push('fis', `[${I.tag}] fiş: ${no}`, x);
          z.sonuc = hayalet ? 'hayalet' : 'ok';
        }
        z.cikti = out.slice(n0).map((_, k) => n0 + k);
        iz.push(z);
      });
    });
    out.push({ t: `Gün sonu: ${basilan} etiket, ${tahsilat} TL tahsilat`, k: 'sum' });
    const st = { talep: iz.length, gonderi: iz.filter((z) => z.sonuc !== 'red').length, red: iz.filter((z) => z.sonuc === 'red').length, hayalet: iz.filter((z) => z.sonuc === 'hayalet').length, basilan, tahsilat };
    return { lines: out, iz, stats: st };
  };
  FC.outputOf = (prog) => FC.run(prog).lines.map((l) => l.t);

  /**
   * Bağımlılık ve değişiklik ölçüleri (kaynak koddan sayılır).
   * bag: istemcilerin alanlarında başka sınıfa başvuru sayısı; kopya: iş akışının kaç yerde yazıldığı;
   * degisen: aynı tasarımın değişikliksiz hâline göre içeriği değişen dosyalar (alt sistem dosyaları hariç)
   */
  FC.olc = function (prog) {
    const F = FC.filesFor(prog);
    const base = FC.filesFor(Object.assign({}, prog, { f: {} }));
    const alt = FC.altOrder(prog.f || {});
    const istemci = prog.istemciler.map((i) => FC.ISTEMCI[i].cls);
    const bag = prog.istemciler.reduce((s, i) => s + (cepheMi(prog, i) ? 1 : alt.length), 0);
    const kopya = prog.istemciler.filter((i) => !cepheMi(prog, i)).length + (cepheVar(prog) ? 1 : 0);
    const altDosya = Object.keys(FC.ALT).map((k) => FC.ALT[k].cls);
    const degisen = Object.keys(F).filter((n) => !altDosya.includes(n) && n !== 'Talep' && base[n] !== undefined && base[n] !== F[n]);
    const yeni = Object.keys(F).filter((n) => base[n] === undefined);
    return { bag, cepheBag: cepheVar(prog) ? alt.length : 0, kopya, degisen, yeni, istemci };
  };

  // ------------------------------------------------------------------ sürümler (Sorun sahnesi)
  FC.NV = {
    v1: { design: 'naive', istemciler: ['kasa'], f: {} },
    v2: { design: 'naive', istemciler: ['kasa', 'web'], f: {} },
    v3: { design: 'naive', istemciler: ['kasa', 'web'], f: { limit: true }, forgot: ['web'] },
  };
  FC.naiveFiles = (v) => FC.filesFor(FC.NV[v]);

  // ------------------------------------------------------------------ adım adım yeniden düzenleme
  const V3 = FC.NV.v3;
  FC.COZUM = { design: 'cephe', istemciler: ['kasa', 'web'], f: { limit: true } };
  code.GonderiCephesi = cepheSrc(FC.COZUM.f);
  code.Main = mainSrc(FC.COZUM);
  ['kasa', 'web', 'mobil', 'api'].forEach((i) => (code[FC.ISTEMCI[i].cls] = cepheClient(i)));
  FC.refactorProgs = [
    V3, // 0: iş akışı istemcilerde, web'de kural unutuldu
    Object.assign({}, V3, { cepheHazir: true }), // 1: cephe yazılır (henüz kimse kullanmıyor)
    Object.assign({}, V3, { cepheli: ['kasa'] }), // 2: kasa cepheye devreder
    FC.COZUM, // 3: web de devreder
  ];
  FC.refactor = FC.refactorProgs.map((p) => {
    const F = FC.filesFor(p);
    Object.keys(F).forEach((n) => (F[n] = plain(F[n])));
    return F;
  });
  FC.refactorOrder = ['Main', 'SubeKasasi', 'WebSitesi', 'GonderiCephesi', 'OdemeServisi', 'Talep', 'AdresServisi', 'TarifeServisi', 'TakipNoServisi', 'EtiketServisi', 'KuryeServisi', 'BildirimServisi'];
  FC.refactorOutputs = FC.refactorProgs.map((p) => FC.run(p).lines);
  FC.output = FC.outputOf(FC.COZUM);

  // ================================================================== Canlı Akış
  FC.presets = {
    ali: { key: 'ali', title: 'Ali’nin kolisi', prog: { design: 'cephe', istemciler: ['kasa'], f: { limit: true } } },
    can: { key: 'can', title: 'Can’ın kartı', prog: { design: 'cephe', istemciler: ['web'], f: { limit: true }, trafik: { web: [FC.TRAFIK.web[1]] } } },
  };
  FC.presetOrder = ['ali', 'can'];
  FC.akisFiles = (p) => FC.fileList(FC.filesFor(p.prog), ['Main', 'SubeKasasi', 'WebSitesi', 'GonderiCephesi', 'Talep', 'AdresServisi', 'TarifeServisi', 'OdemeServisi', 'TakipNoServisi', 'EtiketServisi', 'KuryeServisi', 'BildirimServisi']);
  FC.akisOutput = (p) => FC.outputOf(p.prog);

  // ================================================================== Cephe tezgâhı
  /** cfg: {design, n (istemci sayısı 1..4), limit, sigorta, kurye} */
  FC.tezgahProg = (cfg) => ({ design: cfg.design, istemciler: FC.istemciOrder.slice(0, cfg.n), f: { limit: !!cfg.limit, sigorta: !!cfg.sigorta, kurye: !!cfg.kurye } });
  FC.tezgahFiles = (cfg) => FC.filesFor(FC.tezgahProg(cfg));

  // ================================================================== Genişlet: yeni istemci (Kurumsal API)
  const EX = (FC.ext = {});
  EX.exercise = `import java.util.List;
import java.util.Optional;

public class KurumsalApi {

    private final ⟦1⟧ cephe;

    public KurumsalApi(GonderiCephesi cephe) {
        this.cephe = cephe;
    }

    public void topluGonder(List<Talep> talepler) {
        System.out.println("[API] " + talepler.size() + " talep geldi");
        for (Talep t : talepler) {
            Optional<String> no = cephe.⟦2⟧(t);
            System.out.println("[API] " + t.musteri() + " → " + (no.isPresent() ? no.get() : "oluşturulmadı"));
        }
    }
}`;
  EX.exerciseMain = `// Main.java içine:
KurumsalApi api = new KurumsalApi(⟦3⟧);
api.topluGonder(List.of(
        new ⟦4⟧("${FC.TRAFIK.api[0].musteri}", "${FC.TRAFIK.api[0].adres}", "${FC.TRAFIK.api[0].il}", ${FC.TRAFIK.api[0].kg}),
        new Talep("${FC.TRAFIK.api[1].musteri}", "${FC.TRAFIK.api[1].adres}", "${FC.TRAFIK.api[1].il}", ${FC.TRAFIK.api[1].kg})));`;
  EX.answers = { 1: 'GonderiCephesi', 2: 'gonder', 3: 'cephe', 4: 'Talep' };
  EX.prog = { design: 'cephe', istemciler: ['kasa', 'web', 'api'], f: { limit: true } };
  EX.Main = mainSrc(EX.prog);
  EX.output = FC.outputOf(EX.prog);

  // ================================================================== Gerçek dünya (JDK) örnekleri
  const RW = (FC.rw = {});
  RW.dosya = (arg) => `import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

public class DosyaCephesi {

    public static void main(String[] args) throws IOException {
        Path yol = Files.createTempFile("gonderiler", ".txt");
        Files.write(yol, List.of("KRG-1001;Malatya", "KRG-1002;Ankara", "KRG-1003;İzmir"));
        ${arg}
        Files.delete(yol);
    }

    /** Cephe olmadan: akış, kod çözücü, tampon… hepsini kendimiz kurup kapatıyoruz */
    static List<String> elleOku(Path yol) throws IOException {
        List<String> satirlar = new ArrayList<>();
        FileInputStream akis = new FileInputStream(yol.toFile());
        try {
            BufferedReader okuyucu = new BufferedReader(new InputStreamReader(akis, StandardCharsets.UTF_8));
            String satir;
            while ((satir = okuyucu.readLine()) != null) {
                satirlar.add(satir);
            }
        } finally {
            akis.close();
        }
        return satirlar;
    }
}`;
  RW.dosyaOpts = [
    { label: 'Cephe: Files', arg: 'System.out.println(Files.readAllLines(yol));', out: ['[KRG-1001;Malatya, KRG-1002;Ankara, KRG-1003;İzmir]'] },
    { label: 'Alt sistem: akışlar', arg: 'System.out.println(elleOku(yol));', out: ['[KRG-1001;Malatya, KRG-1002;Ankara, KRG-1003;İzmir]'] },
    // satır sonu işletim sistemine göre değişir (\r\n / \n): karakter saymak yerine satır seçiyoruz
    { label: 'Üçüncü satır', arg: 'System.out.println(Files.readAllLines(yol).get(2));', out: ['KRG-1003;İzmir'] },
  ];

  RW.derleyici = (arg) => `import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import javax.tools.JavaCompiler;
import javax.tools.ToolProvider;

public class DerleyiciCephesi {

    public static void main(String[] args) throws IOException {
        Path klasor = Files.createTempDirectory("cephe");
        Path kaynak = klasor.resolve("Merhaba.java");
        ${arg}

        // javac'ın yüzlerce sınıfı (ayrıştırıcı, tür denetimi, bayt kodu üretimi…) tek bir run() çağrısının arkasında
        JavaCompiler javac = ToolProvider.getSystemJavaCompiler();
        int sonuc = javac.run(null, null, new ByteArrayOutputStream(), kaynak.toString());

        Path sinif = klasor.resolve("Merhaba.class");
        System.out.println("run(...) sonucu: " + sonuc + (sonuc == 0 ? " (derlendi)" : " (hata)"));
        System.out.println("Merhaba.class var mı? " + Files.exists(sinif));
        Files.deleteIfExists(sinif);
        Files.delete(kaynak);
        Files.delete(klasor);
    }
}`;
  RW.derleyiciOpts = [
    { label: 'Doğru kaynak', arg: 'Files.writeString(kaynak, "public class Merhaba { }");', out: ['run(...) sonucu: 0 (derlendi)', 'Merhaba.class var mı? true'] },
    { label: 'Hatalı kaynak', arg: 'Files.writeString(kaynak, "public class Merhaba { int x = ; }");', out: ['run(...) sonucu: 1 (hata)', 'Merhaba.class var mı? false'] },
  ];

  RW.slf4j = () => `// SLF4J: "Simple Logging Facade for Java" — kütüphanenin adı bile cephe
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class GonderiServisi {

    private static final Logger log = LoggerFactory.getLogger(GonderiServisi.class);

    public void gonder(String no) {
        log.info("Gönderi oluşturuldu: {}", no);
        // Arkada hangisi çalışıyor: Logback mı, Log4j mi, java.util.logging mi?
        // Kod bilmez; sınıf yolundaki bağlayıcı (binding) karar verir.
    }
}`;

  // ================================================================== UML sınıf diyagramları
  const M = {
    cephe: { id: 'cephe', text: '- cephe: GonderiCephesi', generic: '- facade: Facade', color: 3 },
    gonder: { id: 'gonder', text: '+ gonder(t)', generic: '+ operation()' },
    alanlar: { id: 'alanlar', text: '- adres, tarife, odeme, … (7)', generic: '- subsystem objects' },
    cGonder: { id: 'gonder', text: '+ gonder(t): Optional<String>', generic: '+ operation()', factory: true },
  };
  FC.members = M;
  const ALT_METOT = { adres: '+ dogrula(adres, il)', tarife: '+ hesapla(kg)', odeme: '+ cek(musteri, tutar)', takip: '+ yeni()', sigorta: '+ police(no, tutar)', etiket: '+ bas(no, adres)', kurye: '+ ata(no, il)', sms: '+ gonder(musteri, mesaj)' };
  const ALT_X = 740;
  const ALT_W = 250;
  const altY = (i) => 10 + i * 78;
  // rol etiketi yalnızca sütunun ilk kutusunda (kutular sıkışık)
  const altBox = (k, i) => ({ id: FC.ALT[k].cls, name: FC.ALT[k].cls, generic: 'SubsystemClass' + (i + 1), kind: 'class', role: 'subsystem', x: ALT_X, y: altY(i), w: ALT_W, noTag: i > 0, members: [{ id: 'm', text: ALT_METOT[k], generic: '+ …' }] });
  const CEPHE = { x: 370, y: 236, w: 300 };
  const cepheBox = () => ({ id: 'GonderiCephesi', name: 'GonderiCephesi', generic: 'Facade', kind: 'class', role: 'facade', x: CEPHE.x, y: CEPHE.y, w: CEPHE.w, members: [M.alanlar, M.cGonder] });
  const IST_Y = { kasa: 70, web: 380 };
  const istemciBox = (ist, naive) => ({ id: FC.ISTEMCI[ist].cls, name: FC.ISTEMCI[ist].cls, generic: 'Client', kind: 'class', role: 'client', x: 20, y: IST_Y[ist], w: 260, members: naive ? [{ id: 'alanlar', text: '- 7 alt sistem alanı' }, { id: 'gonder', text: '+ gonder(t) · iş akışı burada' }] : [M.cephe, M.gonder] });
  /** cephe → alt sistemler: cephenin sağından tek bir "otobüs" hattıyla */
  const cepheHatlari = (alt) =>
    alt.map((k, i) => ({ id: 'a-' + k, from: 'GonderiCephesi', to: FC.ALT[k].cls, type: 'association', fromSide: 'right', fromAt: CEPHE.y + 45, toSide: 'left', toAt: altY(i) + 35, mid: 705 }));
  const istemciCephe = (ist) => ({ id: 'c-' + ist, from: FC.ISTEMCI[ist].cls, to: 'GonderiCephesi', type: 'association', label: 'cephe', genericLabel: 'facade', fromSide: 'right', fromAt: IST_Y[ist] + 45, toSide: 'left', toAt: CEPHE.y + (ist === 'kasa' ? 30 : 62), mid: 330 });

  /** GoF yapısı (Yapı sahnesi, Canlı Akış, özet). o.notes: cephenin gonder() notu */
  FC.gofDiagram = function (o) {
    o = o || {};
    const alt = FC.altOrder({});
    const classes = [istemciBox('kasa'), istemciBox('web'), cepheBox()].concat(alt.map((k, i) => altBox(k, i)));
    const relations = [istemciCephe('kasa'), istemciCephe('web')].concat(cepheHatlari(alt));
    const notes = o.notes
      ? [{ id: 'n-op', x: 340, y: 380, text: 'adres.dogrula(…); tarife.hesapla(…);\nif (!odeme.cek(…)) return empty;\nno = takip.yeni(); etiket.bas(…);\nkurye.ata(…); sms.gonder(…);\nreturn Optional.of(no);', genericText: 'subsystem1.step();\nsubsystem2.step();\n…   // doğru sıra ve kurallar\nreturn result;', target: 'GonderiCephesi', from: 'top', to: 'bottom', toAt: CEPHE.x + 150 }]
      : [];
    return { width: 1010, height: 560, title: 'Facade sınıf diyagramı', classes, relations, notes };
  };

  /**
   * "Çözüm" sahnesinin her adımındaki diyagram.
   * 0: iş akışı istemcilerde (14 bağımlılık) · 1: cephe yazılır · 2: kasa devreder · 3: web devreder
   * İstemcilerden alt sistemlere giden bağımlılıklar cephe kutusunun arkasından geçer.
   */
  FC.solutionDiagram = function (st) {
    const alt = FC.altOrder({});
    const classes = [istemciBox('kasa', st < 2), istemciBox('web', st < 3)].concat(alt.map((k, i) => altBox(k, i)));
    const relations = [];
    if (st >= 1) classes.push(cepheBox());
    [
      ['kasa', st >= 2, 300],
      ['web', st >= 3, 318],
    ].forEach(([ist, cepheli, mid]) => {
      if (cepheli) relations.push(istemciCephe(ist));
      else alt.forEach((k, i) => relations.push({ id: `n-${ist}-${k}`, from: FC.ISTEMCI[ist].cls, to: FC.ALT[k].cls, type: 'dependency', fromSide: 'right', fromAt: IST_Y[ist] + 45, toSide: 'left', toAt: altY(i) + (ist === 'kasa' ? 26 : 44), mid }));
    });
    if (st >= 1) relations.push(...cepheHatlari(alt));
    return { width: 1010, height: 560, view: [0, 0, 1010, 560], classes, relations };
  };

  // ------------------------------------------------------------------ UML sıralama diyagramı (Canlı Akış)
  /** Akış adımlarıyla aynı sırada mesajlar. Dönüş: {spec, msgOf: {'gonder' | 'cephe' | '<alt>' | 'ret' | 'fis'}} */
  FC.seqSpec = function (p) {
    const r = FC.run(p.prog);
    const ist = FC.ISTEMCI[p.prog.istemciler[0]];
    const z = r.iz[0];
    const alt = FC.altOrder(p.prog.f);
    const parts = [
      { id: 'ist', label: ist.v, role: 'client', object: true },
      { id: 'cephe', label: 'cephe', role: 'facade', object: true },
    ].concat(alt.map((k) => ({ id: k, label: FC.ALT[k].v, role: 'subsystem', object: true })));
    const messages = [];
    const msgOf = {};
    const add = (key, m) => {
      msgOf[key] = messages.length;
      messages.push(m);
    };
    add('gonder', { from: 'ist', to: 'cephe', kind: 'call', label: 'gonder(t)' });
    const LBL = { adres: 'dogrula(…)', tarife: 'hesapla(3)', odeme: 'cek(…)', takip: 'yeni()', sigorta: 'police(…)', etiket: 'bas(…)', kurye: 'ata(…)', sms: 'gonder(…)' };
    z.adim.forEach((a) => {
      const lbl = a.k === 'tarife' ? `hesapla(${z.t.kg})` : LBL[a.k];
      add(a.k, { from: 'cephe', to: a.k, kind: 'call', label: lbl });
      add(a.k + ':ret', { from: a.k, to: 'cephe', kind: 'return', label: a.k === 'odeme' ? (a.bad ? 'false' : 'true') : a.k === 'tarife' ? a.sonuc : a.k === 'takip' ? z.no : '' });
    });
    add('ret', { from: 'cephe', to: 'ist', kind: 'return', label: z.sonuc === 'red' ? 'Optional.empty' : `Optional[${z.no}]` });
    const rowH = 30;
    const h = 100 + messages.reduce((s) => s + rowH, 0) + 40;
    return { spec: { width: 1160, height: h, top: 96, margin: 70, rowH, participants: parts, messages, initialActive: ['ist'] }, msgOf, run: r };
  };
})();
