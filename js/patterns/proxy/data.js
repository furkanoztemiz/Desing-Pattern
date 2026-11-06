/*
 * Proxy — veri: Java kodları, çıktılar, roller, diyagram tanımları.
 * Bu dosya DOM kullanmaz; tools/export-java.js de Java dosyalarını buradan üretir.
 *
 * Senaryo (lojistik dünyasının devamı): Gönderi takibi GlobalShip'in uzaktaki servisine soruluyor; oturum açmak
 * 1200 ms, her sorgu 800 ms ve 25 kuruş. Kalıpsız çözümde her istemci (panel, mobil) bağlantıyı, önbelleği ve KVKK
 * denetimini KENDİSİ yazıyor; mobil uygulama KVKK denetimini unutuyor ve Ayşe, Ali'nin adresini görüyor.
 * Proxy: istemcilerle aynı arayüzü (TakipServisi) uygulayan bir vekil araya girer; koruma, önbellek ve gerçek
 * nesnenin ihtiyaç anında yaratılması (sanal vekil) tek yerde toplanır. İstemcilerde tek satır değişmez.
 */
(function () {
  'use strict';
  const DP = (window.DP = window.DP || {});
  const PX = (DP.px = DP.px || {});

  // ------------------------------------------------------------------ roller
  PX.roles = {
    client: { en: 'Client', tr: 'İstemci', color: 1 },
    subject: { en: 'Subject', tr: 'Konu (arayüz)', color: 2 },
    realSubject: { en: 'RealSubject', tr: 'Gerçek Konu', color: 4 },
    proxy: { en: 'Proxy', tr: 'Vekil', color: 3 },
  };

  PX.classRoles = {
    Main: 'client',
    MusteriPaneli: 'client',
    MobilUygulama: 'client',
    SmsBildirim: 'client',
    TakipServisi: 'subject',
    GlobalShipTakip: 'realSubject',
    TakipVekili: 'proxy',
    // GoF genel adları
    Client: 'client',
    Subject: 'subject',
    RealSubject: 'realSubject',
    Proxy: 'proxy',
  };

  PX.roleOf = function (name) {
    const r = PX.classRoles[name];
    return r ? PX.roles[r].color : null;
  };

  // `gercek` = vekilin arkasındaki gerçek nesne (kodda ayrıca vurgulanır)
  PX.special = { gercek: 'prx' };

  /** 1 tabanlı satır numarası. */
  PX.lineOf = function (src, needle, from) {
    const lines = src.split('\n');
    for (let i = from || 0; i < lines.length; i++) if (lines[i].includes(needle)) return i + 1;
    return 0;
  };

  /** Satırın sonuna, belirli bir sütundan başlayan yorum ekler (satır uzunsa en az iki boşluk). */
  const cm = (line, comment, col) => line.padEnd(Math.max(col || 56, line.length + 2)) + '// ' + comment;
  const doc = (text) => `/**\n * ${text}\n */\n`;
  const plain = (src) => src.replace(/^((?:import [^\n]+\n)*\n?)\/\*\*[\s\S]*?\*\/\n/, '$1');
  PX.plain = plain;

  const code = (PX.code = {});

  // ================================================================== model (Java ile birebir)
  /** GlobalShip'teki kayıtlar: durum ve alıcı (KVKK kapsamında kişisel veri) */
  PX.KAYIT = {
    'KRG-1001': 'Dağıtımda (Ali Şahin, Battalgazi)',
    'KRG-1002': 'Transfer merkezinde (Ayşe Yılmaz, Çankaya)',
    'KRG-1003': 'Teslim edildi (Zeynep Güneş, Konak)',
  };
  PX.durum = (no) => PX.KAYIT[no].replace(/ \(.*$/, '');
  PX.alici = (no) => PX.KAYIT[no].replace(/^.*\((.*)\)$/, '$1');
  PX.MUSTERI = {
    ali: { v: 'ali', ad: 'Ali', no: 'KRG-1001' },
    ayse: { v: 'ayse', ad: 'Ayşe', no: 'KRG-1002' },
    zeynep: { v: 'zeynep', ad: 'Zeynep', no: 'KRG-1003' },
  };
  PX.musteriOrder = ['ali', 'ayse', 'zeynep'];
  PX.sahibi = (m, no) => PX.MUSTERI[m].no === no;
  PX.ISTEMCI = {
    panel: { key: 'panel', cls: 'MusteriPaneli', tag: 'Panel', v: 'panel', m: 'goster', name: 'Müşteri paneli' },
    mobil: { key: 'mobil', cls: 'MobilUygulama', tag: 'Mobil', v: 'mobil', m: 'goster', name: 'Mobil uygulama' },
    sms: { key: 'sms', cls: 'SmsBildirim', tag: 'SMS', v: 'sms', m: 'gonder', name: 'SMS bildirimi' },
  };
  PX.COST = { oturum: 1200, sorgu: 800, kurus: 25 };
  PX.KVKK = 'size ait değil (KVKK)';

  const mDecl = (m) => `Musteri ${m} = new Musteri("${PX.MUSTERI[m].ad}", List.of("${PX.MUSTERI[m].no}"));`;
  PX.mDecl = mDecl;

  // ------------------------------------------------------------------ ortak Java kaynakları
  function musteriSrc(sahibi) {
    return `import java.util.List;

${doc('Oturumdaki müşteri ve ona ait gönderiler.')}public record Musteri(String ad, List<String> gonderiler) {
${
  sahibi
    ? `
    /** KVKK: gönderi bu müşterinin mi? */
    public boolean sahibi(String takipNo) {
        return gonderiler.contains(takipNo);
    }
`
    : ''
}}`;
  }
  code.MusteriEski = musteriSrc(false);
  code.Musteri = musteriSrc(true);

  code.TakipServisi = `${doc('«Subject» — Takip sorgusunun arayüzü: istemciler yalnızca bunu tanır.')}public interface TakipServisi {

    String sorgula(String takipNo);
}`;

  /** Gerçek servis; arayuz: TakipServisi'ni uyguluyor mu (çözümde evet) */
  function globalShipSrc(arayuz) {
    const ov = arayuz ? '    @Override\n' : '';
    const kayitlar = Object.keys(PX.KAYIT)
      .map((no) => `            "${no}", "${PX.KAYIT[no]}"`)
      .join(',\n');
    return `import java.util.Map;

${doc((arayuz ? '«RealSubject» — ' : '') + "GlobalShip'in uzaktaki takip servisi: oturum açmak da her sorgu da yavaş ve ücretli.")}public class GlobalShipTakip${arayuz ? ' implements TakipServisi' : ''} {

${cm('    static int oturum;', 'ölçüm (özet için)', 44)}
    static int sorgu;

    private static final Map<String, String> KAYITLAR = Map.of(
${kayitlar});

    public GlobalShipTakip() {
        oturum++;
        System.out.println("[GlobalShip] oturum açıldı (${PX.COST.oturum} ms)");
    }

${ov}    public String sorgula(String takipNo) {
        sorgu++;
        System.out.println("[GlobalShip] " + takipNo + " sorgulandı (${PX.COST.sorgu} ms, ${PX.COST.kurus} kuruş)");
        return KAYITLAR.get(takipNo);
    }

    public static String ozet() {
        return "GlobalShip: " + oturum + " oturum, " + sorgu + " sorgu, "
                + (oturum * ${PX.COST.oturum} + sorgu * ${PX.COST.sorgu}) + " ms, " + sorgu * ${PX.COST.kurus} + " kuruş";
    }
}`;
  }
  code.GlobalShipEski = globalShipSrc(false);
  code.GlobalShipTakip = globalShipSrc(true);

  // ================================================================== "Sorun": kontrol istemcilerin içinde
  /**
   * Kalıpsız istemci. kind:
   *   'eager'    : açılışta oturum açar, her seferinde sorar (sürüm 1.0)
   *   'lazy'     : ilk sorguda oturum açar, önbellek tutar (sürüm 2.0, mobilde kopyası)
   *   'lazyKvkk' : üstüne KVKK denetimi (sürüm 3.1, yalnızca panelde)
   */
  function naiveClient(ist, kind, docText) {
    const I = PX.ISTEMCI[ist];
    const print = (expr) => `System.out.println("[${I.tag}/" + musteri.ad() + "] " + takipNo + ": " + ${expr});`;
    if (kind === 'eager')
      return `${doc(docText)}public class ${I.cls} {

    private final Musteri musteri;
    private final GlobalShipTakip servis;

    public ${I.cls}(Musteri musteri) {
        this.musteri = musteri;
${cm('        this.servis = new GlobalShipTakip();', 'hemen oturum açar', 48)}
    }

    public void ${I.m}(String takipNo) {
        ${print('servis.sorgula(takipNo)')}
    }
}`;
    const kvkk =
      kind === 'lazyKvkk'
        ? `${cm('        if (!musteri.sahibi(takipNo)) {', 'KVKK', 48)}
            System.out.println("[${I.tag}/" + musteri.ad() + "] " + takipNo + ": ${PX.KVKK}");
            return;
        }
`
        : '';
    return `import java.util.HashMap;
import java.util.Map;

${doc(docText)}public class ${I.cls} {

    private final Musteri musteri;
${cm('    private GlobalShipTakip servis;', 'ilk sorguda açılır', 48)}
    private final Map<String, String> onbellek = new HashMap<>();

    public ${I.cls}(Musteri musteri) {
        this.musteri = musteri;
    }

    public void ${I.m}(String takipNo) {
${kvkk}        String durum = onbellek.get(takipNo);
        if (durum == null) {
            if (servis == null) {
                servis = new GlobalShipTakip();
            }
            durum = servis.sorgula(takipNo);
            onbellek.put(takipNo, durum);
        }
        ${print('durum')}
    }
}`;
  }

  /** Kalıpsız sürümler: oturumlar (istemci, müşteri, tür) ve çağrılar [oturum, takipNo, yorum] */
  PX.NV = {
    v1: { s: [['panel', 'ali', 'eager']], c: [[0, 'KRG-1001'], [0, 'KRG-1001', 'sayfa yenilendi'], [0, 'KRG-1001', 'yine']] },
    v2: { s: [['panel', 'ali', 'lazy']], c: [[0, 'KRG-1001'], [0, 'KRG-1001', 'sayfa yenilendi'], [0, 'KRG-1001', 'yine']] },
    v3: {
      s: [['panel', 'ali', 'lazy'], ['mobil', 'ayse', 'lazy']],
      c: [[0, 'KRG-1001'], [0, 'KRG-1001', 'sayfa yenilendi'], [1, 'KRG-1002'], [1, 'KRG-1002', 'uygulama yenilendi']],
    },
    v4: {
      s: [['panel', 'ali', 'lazyKvkk'], ['mobil', 'ayse', 'lazy']],
      c: [[0, 'KRG-1001'], [0, 'KRG-1001', 'sayfa yenilendi'], [0, 'KRG-1003', "Zeynep'in gönderisi"], [1, 'KRG-1002'], [1, 'KRG-1001', "Ali'nin gönderisi!"]],
    },
  };
  PX.naiveVersions = ['v1', 'v2', 'v3', 'v4'];
  const NAIVE_DOC = {
    panel: { eager: 'Müşteri paneli: takip sayfası her açıldığında GlobalShip\'e sorar.', lazy: 'Müşteri paneli: bağlantıyı ve önbelleği kendisi yönetir.', lazyKvkk: 'Müşteri paneli: bağlantı, önbellek ve KVKK denetimi panelin içinde.' },
    mobil: { lazy: 'Mobil uygulama: bağlantı ve önbellek kodu panelden kopyalandı.' },
  };

  /** Program: {s: [[istemci, müşteri, tür, toggles?]], c: [[oturum, takipNo, yorum?]]} → oturum nesneleri */
  const sessionsOf = (prog) => prog.s.map(([ist, m, kind, t]) => ({ ist, m, kind, t: t || {} }));

  /** Main: kalıpsız (istemci yalnızca müşteriyi alır) ya da kalıplı (servis/vekil de verilir) */
  function mainSrc(prog, o) {
    o = o || {};
    const S = sessionsOf(prog);
    const ms = [];
    S.forEach((s) => !ms.includes(s.m) && ms.push(s.m));
    const svc = (s) => {
      if (s.kind === 'direct') return 'new GlobalShipTakip()';
      if (s.kind === 'vekil') return s.t.koruma ? `new TakipVekili(${s.m})` : 'new TakipVekili()';
      return null;
    };
    // servis değişkeni arayüz tipinde: vekil de gerçek servis de olabilir (fark yalnızca sağ tarafta)
    const sv = (s) => (S.length === 1 ? 'servis' : s.m + 'Servisi');
    const svcDecls = S.filter((s) => svc(s)).map((s) => `        TakipServisi ${sv(s)} = ${svc(s)};`);
    const decls = S.map((s) => {
      const I = PX.ISTEMCI[s.ist];
      return `        ${I.cls} ${I.v} = new ${I.cls}(${s.m}${svc(s) ? ', ' + sv(s) : ''});`;
    });
    const calls = prog.c.map(([si, no, yorum]) => {
      const I = PX.ISTEMCI[S[si].ist];
      const st = `        ${I.v}.${I.m}("${no}");`;
      return yorum ? cm(st, yorum, 52) : st;
    });
    return `import java.util.List;

public class Main {

    public static void main(String[] args) {
${ms.map((m) => '        ' + mDecl(m)).join('\n')}
${svcDecls.length ? svcDecls.join('\n') + '\n' : ''}${decls.join('\n')}
${calls.length ? '\n' + calls.join('\n') + '\n' : ''}        System.out.println(GlobalShipTakip.ozet());
    }
}`;
  }
  PX.mainFor = mainSrc;

  // ------------------------------------------------------------------ çalıştırma (Java ile birebir)
  /**
   * Programın çıktısı ve her çağrının izi.
   * Çıktı satırı: {t, k: 'login'|'query'|'show'|'kvkk'|'leak'|'sum', s: oturum}
   * İz (çağrı başına): {s, no, adim: ['koruma-ok'|'koruma-bad', 'onbellek-hit'|'onbellek-miss', 'create', 'query', 'put'], cikti: [satır indeksleri]}
   */
  PX.run = function (prog) {
    const S = sessionsOf(prog).map((s) => Object.assign(s, { real: false, cache: {} }));
    const out = [];
    const st = { oturum: 0, sorgu: 0, engel: 0, sizinti: 0 };
    const login = (si) => {
      st.oturum++;
      out.push({ t: `[GlobalShip] oturum açıldı (${PX.COST.oturum} ms)`, k: 'login', s: si });
    };
    const query = (si, no) => {
      st.sorgu++;
      out.push({ t: `[GlobalShip] ${no} sorgulandı (${PX.COST.sorgu} ms, ${PX.COST.kurus} kuruş)`, k: 'query', s: si });
      return PX.KAYIT[no];
    };
    const prefix = (s) => `[${PX.ISTEMCI[s.ist].tag}/${PX.MUSTERI[s.m].ad}] `;
    const show = (si, no, text) => {
      const s = S[si];
      const leak = !PX.sahibi(s.m, no);
      if (leak) st.sizinti++;
      out.push({ t: `${prefix(s)}${no}: ${text}`, k: leak ? 'leak' : 'show', s: si });
    };
    const kvkk = (si, no) => {
      st.engel++;
      out.push({ t: `${prefix(S[si])}${no}: ${PX.KVKK}`, k: 'kvkk', s: si });
    };
    // kurulum: açılışta oturum açanlar (Main'deki sıra)
    const kurulum = [];
    S.forEach((s, si) => {
      const n0 = out.length;
      if (s.kind === 'eager' || s.kind === 'direct' || (s.kind === 'vekil' && !s.t.sanal)) {
        login(si);
        s.real = true;
      }
      kurulum.push(out.slice(n0).map((_, k) => n0 + k));
    });
    const iz = prog.c.map(([si, no]) => {
      const s = S[si];
      const n0 = out.length;
      const adim = [];
      const ag = () => {
        if (!s.real) {
          login(si);
          s.real = true;
          adim.push('create');
        }
        adim.push('query');
        return query(si, no);
      };
      if (s.kind === 'eager' || s.kind === 'direct') {
        show(si, no, ag());
      } else if (s.kind === 'lazy' || s.kind === 'lazyKvkk') {
        if (s.kind === 'lazyKvkk' && !PX.sahibi(s.m, no)) {
          adim.push('koruma-bad');
          kvkk(si, no);
        } else {
          if (s.kind === 'lazyKvkk') adim.push('koruma-ok');
          if (s.cache[no]) adim.push('onbellek-hit');
          else {
            adim.push('onbellek-miss');
            s.cache[no] = ag();
            adim.push('put');
          }
          show(si, no, s.cache[no]);
        }
      } else {
        // vekil
        if (s.t.koruma && !PX.sahibi(s.m, no)) {
          adim.push('koruma-bad');
          kvkk(si, no);
        } else {
          if (s.t.koruma) adim.push('koruma-ok');
          let kayit = s.t.onbellek ? s.cache[no] : null;
          if (s.t.onbellek) adim.push(kayit ? 'onbellek-hit' : 'onbellek-miss');
          if (!kayit) {
            kayit = ag();
            if (s.t.onbellek) {
              s.cache[no] = kayit;
              adim.push('put');
            }
          }
          show(si, no, kayit);
        }
      }
      return { s: si, no, adim, cikti: out.slice(n0).map((_, k) => n0 + k) };
    });
    const ms = st.oturum * PX.COST.oturum + st.sorgu * PX.COST.sorgu;
    const kurus = st.sorgu * PX.COST.kurus;
    out.push({ t: `GlobalShip: ${st.oturum} oturum, ${st.sorgu} sorgu, ${ms} ms, ${kurus} kuruş`, k: 'sum' });
    return { lines: out, iz, kurulum, stats: Object.assign(st, { ms, kurus, istek: prog.c.length }) };
  };
  PX.outputOf = (prog) => PX.run(prog).lines.map((l) => l.t);

  PX.naive = function (v) {
    const P = PX.NV[v];
    const files = { Main: mainSrc(P) };
    sessionsOf(P).forEach((s) => (files[PX.ISTEMCI[s.ist].cls] = naiveClient(s.ist, s.kind, NAIVE_DOC[s.ist][s.kind])));
    files.GlobalShipTakip = code.GlobalShipEski;
    files.Musteri = v === 'v4' ? code.Musteri : code.MusteriEski;
    return files;
  };
  PX.naiveOrder = (v) => ['Main', 'MusteriPaneli'].concat(v === 'v3' || v === 'v4' ? ['MobilUygulama'] : [], ['GlobalShipTakip', 'Musteri']);
  /** Kalıpsız çıktı: {t, bad, note} — sızıntı satırı işaretli */
  PX.naiveOutput = (v) => PX.run(PX.NV[v]).lines.map((l) => (l.k === 'leak' ? { t: l.t, bad: true, note: 'başkasının adresi!' } : { t: l.t }));

  // ================================================================== "Çözüm": vekil
  /** Vekil; o: {koruma, onbellek, sanal} — tezgâhta açılıp kapanan denetimler */
  function vekilSrc(o) {
    const imports = o.onbellek ? 'import java.util.HashMap;\nimport java.util.Map;\n\n' : '';
    const fields = [];
    if (o.koruma) fields.push(cm('    private final Musteri oturum;', 'koruma: kim soruyor?', 52));
    if (o.onbellek) fields.push('    private final Map<String, String> onbellek = new HashMap<>();');
    fields.push(o.sanal ? cm('    private GlobalShipTakip gercek;', 'sanal: ilk sorguda yaratılır', 52) : cm('    private final GlobalShipTakip gercek = new GlobalShipTakip();', 'hemen oturum', 66));
    const ctor = o.koruma
      ? `
    public TakipVekili(Musteri oturum) {
        this.oturum = oturum;
    }
`
      : '';
    const ind = (s, n) =>
      s
        .split('\n')
        .map((l) => (l ? ' '.repeat(n) + l : l))
        .join('\n');
    const create = o.sanal ? `${cm('if (gercek == null) {', 'sanal', 40)}\n    gercek = new GlobalShipTakip();\n}\n` : '';
    let body = '';
    if (o.koruma)
      body += `${cm('        if (!oturum.sahibi(takipNo)) {', 'koruma (KVKK)', 48)}
            throw new SecurityException("${PX.KVKK}");
        }
`;
    if (o.onbellek) {
      body += `${cm('        String kayit = onbellek.get(takipNo);', 'önbellek', 48)}
        if (kayit == null) {
${ind(create, 12)}            kayit = gercek.sorgula(takipNo);
            onbellek.put(takipNo, kayit);
        }
        return kayit;`;
    } else body += `${ind(create, 8)}        return gercek.sorgula(takipNo);`;
    return `${imports}${doc('«Proxy» — GlobalShip\'in vekili: aynı arayüz; erişimi denetler, gerçek nesneyi kendisi yönetir.')}public class TakipVekili implements TakipServisi {

${fields.join('\n')}
${ctor}
    @Override
    public String sorgula(String takipNo) {
${body}
    }
}`;
  }
  PX.vekilSrc = vekilSrc;
  PX.TAM = { koruma: true, onbellek: true, sanal: true };
  code.TakipVekili = vekilSrc(PX.TAM);

  /** Kalıplı istemci: yalnızca TakipServisi'ni tanır */
  function clientSrc(ist) {
    const I = PX.ISTEMCI[ist];
    const v = ist === 'sms' ? 'metin' : 'durum';
    const docText = {
      panel: "İstemci: yalnızca TakipServisi'ni tanır; karşısındakinin vekil olduğunu bilmez.",
      mobil: 'İstemci: panelle aynı; bağlantı, önbellek ya da KVKK kodu yok.',
      sms: 'Yeni istemci: gece SMS işi. Bağlantı, önbellek, KVKK… hiçbirini bilmez.',
    }[ist];
    return `${doc(docText)}public class ${I.cls} {

    private final Musteri musteri;
    private final TakipServisi servis;

    public ${I.cls}(Musteri musteri, TakipServisi servis) {
        this.musteri = musteri;
        this.servis = servis;
    }

    public void ${I.m}(String takipNo) {
        String ${v};
        try {
            ${v} = servis.sorgula(takipNo);
        } catch (SecurityException e) {
            ${v} = e.getMessage();
        }
        System.out.println("[${I.tag}/" + musteri.ad() + "] " + takipNo + ": " + ${v});
    }
}`;
  }
  code.MusteriPaneli = clientSrc('panel');
  code.MobilUygulama = clientSrc('mobil');
  code.SmsBildirim = clientSrc('sms');

  /** Çözüm: aynı trafik, istemcilere vekil verilir */
  const sol = (kind, t) => ({ s: [['panel', 'ali', kind, t], ['mobil', 'ayse', kind, t]], c: PX.NV.v4.c });
  PX.COZUM = sol('vekil', PX.TAM);
  code.Main = mainSrc(PX.COZUM);
  PX.output = PX.outputOf(PX.COZUM);

  // ------------------------------------------------------------------ adım adım yeniden düzenleme
  const naiveV4 = PX.naive('v4');
  const R3 = { Main: mainSrc(sol('direct')), MusteriPaneli: plain(code.MusteriPaneli), MobilUygulama: plain(code.MobilUygulama) };
  PX.refactor = [
    Object.assign({}, naiveV4), // 0: kontrol istemcilerin içinde, mobilde KVKK unutuldu
    Object.assign({}, naiveV4, { TakipServisi: plain(code.TakipServisi), GlobalShipTakip: plain(code.GlobalShipTakip) }), // 1: ortak arayüz
    Object.assign({}, naiveV4, { TakipServisi: plain(code.TakipServisi), GlobalShipTakip: plain(code.GlobalShipTakip), TakipVekili: plain(code.TakipVekili) }), // 2: vekil yazılır
    Object.assign({}, naiveV4, { TakipServisi: plain(code.TakipServisi), GlobalShipTakip: plain(code.GlobalShipTakip), TakipVekili: plain(code.TakipVekili) }, R3), // 3: istemciler sadeleşir (henüz vekil yok!)
    Object.assign({}, naiveV4, { TakipServisi: plain(code.TakipServisi), GlobalShipTakip: plain(code.GlobalShipTakip), TakipVekili: plain(code.TakipVekili) }, R3, { Main: plain(code.Main) }), // 4: araya vekil girer
  ];
  PX.refactorOrder = ['Main', 'MusteriPaneli', 'MobilUygulama', 'TakipServisi', 'TakipVekili', 'GlobalShipTakip', 'Musteri'];
  PX.refactorOutputs = [PX.NV.v4, PX.NV.v4, PX.NV.v4, sol('direct'), PX.COZUM].map((p) => PX.run(p).lines);

  // ================================================================== Canlı Akış
  PX.presets = {
    ali: { key: 'ali', title: 'Ali yeniliyor', prog: { s: [['panel', 'ali', 'vekil', PX.TAM]], c: [[0, 'KRG-1001'], [0, 'KRG-1001', 'sayfa yenilendi']] } },
    ayse: { key: 'ayse', title: 'Ayşe merak ediyor', prog: { s: [['mobil', 'ayse', 'vekil', PX.TAM]], c: [[0, 'KRG-1001', "Ali'nin gönderisi"], [0, 'KRG-1002']] } },
  };
  PX.presetOrder = ['ali', 'ayse'];
  PX.akisMain = (p) => mainSrc(p.prog);
  PX.akisFiles = (p) => {
    const ist = p.prog.s[0][0];
    return [
      { name: 'Main.java', code: PX.akisMain(p) },
      { name: PX.ISTEMCI[ist].cls + '.java', code: code[PX.ISTEMCI[ist].cls] },
      { name: 'TakipVekili.java', code: code.TakipVekili },
      { name: 'GlobalShipTakip.java', code: code.GlobalShipTakip },
      { name: 'TakipServisi.java', code: code.TakipServisi },
      { name: 'Musteri.java', code: code.Musteri },
    ];
  };
  PX.akisOutput = (p) => PX.outputOf(p.prog);

  // ================================================================== Vekil tezgâhı
  PX.trafik = {
    yenile: { key: 'yenile', title: 'Yenile, yenile', ist: 'panel', m: 'ali', c: [[0, 'KRG-1001'], [0, 'KRG-1001', 'sayfa yenilendi'], [0, 'KRG-1001', 'yine'], [0, 'KRG-1001', 'yine']] },
    merak: { key: 'merak', title: 'Meraklı müşteri', ist: 'mobil', m: 'ayse', c: [[0, 'KRG-1001', "Ali'nin gönderisi"], [0, 'KRG-1003', "Zeynep'in gönderisi"], [0, 'KRG-1002'], [0, 'KRG-1002', 'uygulama yenilendi']] },
    bakip: { key: 'bakip', title: 'Bakıp çıkan', ist: 'panel', m: 'zeynep', c: [] },
    sms: { key: 'sms', title: 'SMS gece işi', ist: 'sms', m: 'zeynep', c: [[0, 'KRG-1003'], [0, 'KRG-1003', 'iş tekrar çalıştı'], [0, 'KRG-1001', 'yanlış alıcı!']], locked: true },
  };
  PX.trafikOrder = ['yenile', 'merak', 'bakip', 'sms'];
  /** cfg: {trafik, vekil: bool, koruma, onbellek, sanal} */
  PX.tezgahProg = (cfg) => {
    const T = PX.trafik[cfg.trafik];
    return { s: [[T.ist, T.m, cfg.vekil ? 'vekil' : 'direct', { koruma: !!cfg.koruma, onbellek: !!cfg.onbellek, sanal: !!cfg.sanal }]], c: T.c };
  };
  PX.tezgahFiles = (cfg) => {
    const T = PX.trafik[cfg.trafik];
    const files = { Main: mainSrc(PX.tezgahProg(cfg)) };
    files[PX.ISTEMCI[T.ist].cls] = code[PX.ISTEMCI[T.ist].cls];
    if (cfg.vekil) files.TakipVekili = vekilSrc(cfg);
    files.TakipServisi = code.TakipServisi;
    files.GlobalShipTakip = code.GlobalShipTakip;
    files.Musteri = code.Musteri;
    return files;
  };
  /** Dışa aktarılan iki tezgâh programı: aynı meraklı müşteri, vekilsiz ve tam vekilli */
  PX.TZ_VEKILSIZ = { trafik: 'merak', vekil: false };
  PX.TZ_VEKILLI = Object.assign({ trafik: 'merak', vekil: true }, PX.TAM);

  // ================================================================== Genişlet: yeni istemci (SMS), sıfır denetim kodu
  const EX = (PX.ext = {});
  EX.exercise = `public class SmsBildirim {

    private final Musteri musteri;
    private final ⟦1⟧ servis;

    public SmsBildirim(Musteri musteri, TakipServisi servis) {
        this.musteri = musteri;
        this.servis = servis;
    }

    public void gonder(String takipNo) {
        String metin;
        try {
            metin = servis.⟦2⟧(takipNo);
        } catch (⟦3⟧ e) {
            metin = e.getMessage();
        }
        System.out.println("[SMS/" + musteri.ad() + "] " + takipNo + ": " + metin);
    }
}`;
  EX.exerciseMain = `// Main.java içine:
${mDecl('zeynep')}
TakipServisi servis = new ⟦4⟧(⟦5⟧);
SmsBildirim sms = new SmsBildirim(zeynep, servis);
sms.gonder("KRG-1003");
${cm('sms.gonder("KRG-1003");', 'iş tekrar çalıştı', 26)}
${cm('sms.gonder("KRG-1001");', 'yanlış alıcı!', 26)}`;
  EX.prog = { s: [['sms', 'zeynep', 'vekil', PX.TAM]], c: PX.trafik.sms.c };
  EX.Main = mainSrc(EX.prog);
  EX.output = PX.outputOf(EX.prog);

  // ================================================================== Gerçek dünya (JDK) örnekleri
  const RW = (PX.rw = {});
  RW.dinamik = (arg) => `import java.lang.reflect.Proxy;
import java.util.HashMap;
import java.util.Map;

public class DinamikVekil {

    interface TakipServisi {
        String sorgula(String takipNo);
    }

    public static void main(String[] args) {
        Map<String, String> kayitlar = Map.of("KRG-1001", "Dağıtımda", "KRG-1002", "Transfer merkezinde");
        TakipServisi gercek = takipNo -> {
            System.out.println("  [GlobalShip] " + takipNo + " sorgulandı");
            return kayitlar.get(takipNo);
        };
        Map<Object, Object> onbellek = new HashMap<>();

        // Vekil sınıfı ÇALIŞMA ANINDA üretilir; her çağrı bu işleyiciye düşer
        TakipServisi vekil = (TakipServisi) Proxy.newProxyInstance(
                TakipServisi.class.getClassLoader(),
                new Class<?>[] { TakipServisi.class },
                (nesne, metot, argumanlar) -> {
                    System.out.println("[vekil] " + metot.getName() + "(" + argumanlar[0] + ")");
                    if (!onbellek.containsKey(argumanlar[0])) {
                        onbellek.put(argumanlar[0], metot.invoke(gercek, argumanlar));
                    }
                    return onbellek.get(argumanlar[0]);
                });

        ${arg}
    }
}`;
  RW.dinamikOpts = [
    {
      label: 'Aynı sorgu iki kez',
      arg: 'System.out.println(vekil.sorgula("KRG-1001") + " / " + vekil.sorgula("KRG-1001"));',
      out: ['[vekil] sorgula(KRG-1001)', '  [GlobalShip] KRG-1001 sorgulandı', '[vekil] sorgula(KRG-1001)', 'Dağıtımda / Dağıtımda'],
    },
    {
      label: 'İki farklı sorgu',
      arg: 'System.out.println(vekil.sorgula("KRG-1001") + " / " + vekil.sorgula("KRG-1002"));',
      out: ['[vekil] sorgula(KRG-1001)', '  [GlobalShip] KRG-1001 sorgulandı', '[vekil] sorgula(KRG-1002)', '  [GlobalShip] KRG-1002 sorgulandı', 'Dağıtımda / Transfer merkezinde'],
    },
    // Java 21: çalışma anında üretilen sınıfın adı (ilk vekil: $Proxy0)
    { label: 'Vekilin sınıfı', arg: 'System.out.println(vekil.getClass().getSimpleName() + ", vekil mi? " + Proxy.isProxyClass(vekil.getClass()));', out: ['$Proxy0, vekil mi? true'] },
  ];

  RW.rmi = () => `// Malatya deposundaki sunucu bir UZAK arayüz yayınlar:
public interface StokServisi extends Remote {
    int adet(String urunKodu) throws RemoteException;
}

// İstemci: kayıt defterinden sunucudaki nesnenin VEKİLİNİ (stub) alır
Registry kayit = LocateRegistry.getRegistry("depo.malatya", 1099);
${cm('StokServisi stok = (StokServisi) kayit.lookup("stok");', 'stok: uzak nesnenin vekili', 60)}
${cm('int adet = stok.adet("KOLI-40x30");', 'parametreler paketlenir, ağdan gider', 60)}
// Ağ koparsa: RemoteException — uzaklık arayüzde bile görünür`;

  RW.jpa = () => `// JPA / Hibernate: getReference veritabanına GİTMEZ, bir vekil döndürür
Gonderi g = em.getReference(Gonderi.class, 1002L);
${cm('System.out.println(g.getClass().getSimpleName());', 'Gonderi$HibernateProxy$… (vekil)', 56)}
${cm('String alici = g.getAlici();', 'ilk erişim: SELECT burada çalışır', 56)}

// İlişkiler de vekille gelir (sanal vekil):
@ManyToOne(fetch = FetchType.LAZY)
private Musteri musteri;
// Oturum kapandıktan sonra ilk erişim: LazyInitializationException`;

  // ================================================================== UML sınıf diyagramları
  const M = {
    sorgula: { id: 'sorgula', text: '+ sorgula(takipNo): String', generic: '+ request()', abstract: true },
    realCtor: { id: 'ctor', text: '+ GlobalShipTakip() · oturum açar', generic: '+ RealSubject()' },
    realSorgula: { id: 'sorgula', text: '+ sorgula(takipNo): String', generic: '+ request()' },
    gercek: { id: 'gercek', text: '- gercek: GlobalShipTakip', generic: '- realSubject: RealSubject', color: 4 },
    onbellek: { id: 'onbellek', text: '- onbellek: Map<String, String>', generic: '- cache' },
    oturum: { id: 'oturum', text: '- oturum: Musteri', generic: '- user' },
    vekilSorgula: { id: 'sorgula', text: '+ sorgula(takipNo): String', generic: '+ request()', factory: true },
    servis: { id: 'servis', text: '- servis: TakipServisi', generic: '- subject: Subject' },
    goster: { id: 'goster', text: '+ goster(takipNo)', generic: '+ operation()' },
  };
  PX.members = M;

  const subjectBox = (x, y) => ({ id: 'TakipServisi', name: 'TakipServisi', generic: 'Subject', kind: 'interface', role: 'subject', x, y, w: 290, members: [M.sorgula] });
  const realBox = (x, y) => ({ id: 'GlobalShipTakip', name: 'GlobalShipTakip', generic: 'RealSubject', kind: 'class', role: 'realSubject', x, y, w: 300, members: [M.realCtor, M.realSorgula] });
  const proxyBox = (x, y) => ({ id: 'TakipVekili', name: 'TakipVekili', generic: 'Proxy', kind: 'class', role: 'proxy', x, y, w: 320, members: [M.gercek, M.onbellek, M.oturum, M.vekilSorgula] });

  /** GoF yapısı (Yapı sahnesi, Canlı Akış, özet). o.notes: vekilin sorgula() notu */
  PX.gofDiagram = function (o) {
    o = o || {};
    const classes = [
      { id: 'MusteriPaneli', name: 'MusteriPaneli', generic: 'Client', kind: 'class', role: 'client', x: 20, y: 34, w: 240, members: [M.servis, M.goster] },
      subjectBox(350, 20),
      realBox(20, 280),
      proxyBox(420, 262),
    ];
    const relations = [
      { id: 'uses', from: 'MusteriPaneli', to: 'TakipServisi', type: 'association', label: 'servis', genericLabel: 'subject', fromSide: 'right', fromAt: 70, toSide: 'left', toAt: 70 },
      { id: 'r-real', from: 'GlobalShipTakip', to: 'TakipServisi', type: 'realization', fromSide: 'top', fromAt: 170, toSide: 'bottom', toAt: 495, mid: 200 },
      { id: 'r-vekil', from: 'TakipVekili', to: 'TakipServisi', type: 'realization', fromSide: 'top', fromAt: 580, toSide: 'bottom', toAt: 495, mid: 200 },
      { id: 'gercek', from: 'TakipVekili', to: 'GlobalShipTakip', type: 'association', label: 'gercek', genericLabel: 'realSubject', fromSide: 'left', fromAt: 330, toSide: 'right', toAt: 330 },
    ];
    const notes = o.notes
      ? [{ id: 'n-op', x: 776, y: 280, text: '// denetim (koruma, önbellek)\nif (gercek == null)\n    gercek = new GlobalShipTakip();\nreturn gercek.sorgula(takipNo);', genericText: '// access control\nif (realSubject == null)\n    realSubject = new RealSubject();\nrealSubject.request();', target: 'TakipVekili', from: 'left', to: 'right', toAt: 360 }]
      : [];
    return { width: o.notes ? 1080 : 760, height: 420, title: 'Proxy sınıf diyagramı', classes, relations, notes };
  };

  /**
   * "Çözüm" sahnesinin her adımındaki diyagram.
   * 0: kontrol istemcilerde · 1: ortak arayüz · 2: vekil · 3: istemciler arayüzü kullanır (henüz vekil yok) · 4: araya vekil girer
   */
  PX.solutionDiagram = function (st) {
    const classes = [];
    const relations = [];
    const naiveMembers = (kvkk) => [{ id: 's', text: '- servis: GlobalShipTakip' }, { id: 'o', text: '- onbellek: Map' }, { id: 'g', text: '+ goster() · bağlantı, önbellek' + (kvkk ? ', KVKK' : '') }];
    const cleanMembers = () => [M.servis, M.goster];
    classes.push({ id: 'MusteriPaneli', name: 'MusteriPaneli', kind: 'class', role: 'client', x: 20, y: 20, w: 330, members: st <= 2 ? naiveMembers(true) : cleanMembers() });
    classes.push({ id: 'MobilUygulama', name: 'MobilUygulama', kind: 'class', role: 'client', x: 20, y: 172, w: 330, members: st <= 2 ? naiveMembers(false) : cleanMembers() });
    classes.push(realBox(380, 330));
    if (st <= 2) {
      relations.push({ id: 'n-panel', from: 'MusteriPaneli', to: 'GlobalShipTakip', type: 'association', label: 'servis', fromSide: 'right', fromAt: 60, toSide: 'top', toAt: 470, labelAt: [420, 52] });
      relations.push({ id: 'n-mobil', from: 'MobilUygulama', to: 'GlobalShipTakip', type: 'association', label: 'servis', fromSide: 'right', fromAt: 214, toSide: 'top', toAt: 420, labelAt: [388, 206] });
    }
    if (st >= 1) {
      classes.push(subjectBox(560, 20));
      relations.push({ id: 'r-real', from: 'GlobalShipTakip', to: 'TakipServisi', type: 'realization', fromSide: 'top', fromAt: 620, toSide: 'bottom', toAt: 705, mid: 230 });
    }
    if (st >= 2) {
      classes.push(proxyBox(770, 300));
      relations.push({ id: 'r-vekil', from: 'TakipVekili', to: 'TakipServisi', type: 'realization', fromSide: 'top', fromAt: 930, toSide: 'bottom', toAt: 705, mid: 230 });
      relations.push({ id: 'gercek', from: 'TakipVekili', to: 'GlobalShipTakip', type: 'association', label: 'gercek', fromSide: 'left', fromAt: 372, toSide: 'right', toAt: 372 });
    }
    if (st >= 3) {
      relations.push({ id: 'c-panel', from: 'MusteriPaneli', to: 'TakipServisi', type: 'association', label: 'servis', fromSide: 'right', fromAt: 56, toSide: 'left', toAt: 56 });
      relations.push({ id: 'c-mobil', from: 'MobilUygulama', to: 'TakipServisi', type: 'association', label: 'servis', fromSide: 'right', fromAt: 210, toSide: 'left', toAt: 92, points: [[470, 210], [470, 92]], labelAt: [412, 202] });
    }
    return { width: 1100, height: 470, view: [0, 0, 1105, 460], classes, relations };
  };

  // ------------------------------------------------------------------ UML sıralama diyagramı (Canlı Akış)
  /**
   * Akış adımlarıyla aynı sırada mesajlar. Dönüş: {spec, msgOf: {'call:i' | 'koruma:i' | 'onbellek:i' | 'create:i' | 'query:i' | 'put:i' | 'ret:i' | 'done:i'}}
   */
  PX.seqSpec = function (p) {
    const ist = PX.ISTEMCI[p.prog.s[0][0]];
    const r = PX.run(p.prog);
    const parts = [
      { id: 'main', label: 'Main', role: 'client' },
      { id: 'ist', label: `${ist.v}\n: ${ist.cls}`, role: 'client', object: true },
      { id: 'vekil', label: 'vekil\n: TakipVekili', role: 'proxy', object: true },
      { id: 'gercek', label: 'gercek\n: GlobalShipTakip', role: 'realSubject', object: true },
    ];
    const messages = [];
    const msgOf = {};
    const add = (key, m) => {
      msgOf[key] = messages.length;
      messages.push(m);
    };
    r.iz.forEach((z, i) => {
      add('call:' + i, { from: 'main', to: 'ist', kind: 'call', label: `${ist.m}("${z.no}")` });
      add('sorgula:' + i, { from: 'ist', to: 'vekil', kind: 'call', label: `sorgula("${z.no}")` });
      let blocked = false;
      z.adim.forEach((a) => {
        if (a === 'koruma-ok') add('koruma:' + i, { from: 'vekil', to: 'vekil', kind: 'self', short: true, label: 'sahibi() ✓' });
        if (a === 'koruma-bad') {
          add('koruma:' + i, { from: 'vekil', to: 'vekil', kind: 'self', short: true, label: 'sahibi() ✗' });
          blocked = true;
        }
        if (a === 'onbellek-hit') add('onbellek:' + i, { from: 'vekil', to: 'vekil', kind: 'self', short: true, label: 'onbellek.get() ✓' });
        if (a === 'onbellek-miss') add('onbellek:' + i, { from: 'vekil', to: 'vekil', kind: 'self', short: true, label: 'onbellek.get() → null' });
        if (a === 'create') add('create:' + i, { from: 'vekil', to: 'gercek', kind: 'create', label: '«create» oturum' });
        if (a === 'query') {
          add('query:' + i, { from: 'vekil', to: 'gercek', kind: 'call', label: `sorgula("${z.no}")` });
          add('qret:' + i, { from: 'gercek', to: 'vekil', kind: 'return', label: PX.durum(z.no) });
        }
        if (a === 'put') add('put:' + i, { from: 'vekil', to: 'vekil', kind: 'self', short: true, label: 'onbellek.put()' });
      });
      add('ret:' + i, { from: 'vekil', to: 'ist', kind: 'return', label: blocked ? 'SecurityException' : PX.durum(z.no) });
      add('done:' + i, { from: 'ist', to: 'main', kind: 'return', label: '' });
    });
    const rowH = 34;
    const h = 110 + messages.reduce((s, m) => s + (m.kind === 'self' ? rowH + 16 : rowH), 0) + 30;
    return { spec: { width: 900, height: h, top: 100, margin: 110, rowH, participants: parts, messages, initialActive: ['main'] }, msgOf, run: r };
  };
})();
