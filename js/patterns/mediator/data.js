/*
 * Mediator — veri: Java kodları, çalıştırma benzetimi, roller, diyagram tanımları.
 * Bu dosya DOM kullanmaz; tools/export-java.js de Java dosyalarını buradan üretir.
 *
 * Senaryo (lojistik dünyasının devamı): şubedeki gönderi oluşturma formu. Öğeler: şehir, ağırlık, soğuk zincir,
 * teslimat seçenekleri (Standart, Hızlı, Dolap) ve ücret. Kural: Dolap yalnızca Malatya’da (akıllı dolap orada),
 * soğuk zincirli gönderi dolaba konmaz, 20 kg üstü dolaba ve hızlı teslimata sığmaz. Kapanan seçenek seçiliyse
 * Standart’a dönülür; ücret seçeneğe, ağırlığa ve soğuk zincire göre değişir.
 *   Sürüm 1.0: dört öğe birbirini tanıyor; “dolap açık mı?” kuralı şehir seçicide ve ağırlık alanında kopya.
 *   Sürüm 2.0: soğuk zincir kutusu eklendi; kuralın iki eski kopyası güncellenmedi → önce soğuk zincir, sonra şehir
 *              seçilirse dolap yeniden açılıyor: soğuk zincirli ilaç dolaba gidiyor (sonuç tıklama sırasına bağlı).
 * Mediator: öğeler birbirini değil, yalnızca formu (FormYoneticisi) tanır; değişince degisti(this) der. Kuralların
 * hepsi GonderiFormu.degisti() içinde, tek yerde: tıklama sırası ne olursa olsun aynı sonuç.
 */
(function () {
  'use strict';
  const DP = (window.DP = window.DP || {});
  const MD = (DP.med = DP.med || {});

  // ------------------------------------------------------------------ roller
  MD.roles = {
    client: { en: 'Client', tr: 'İstemci', color: 1 },
    mediator: { en: 'Mediator', tr: 'Arabulucu (arayüz)', color: 2 },
    concreteMediator: { en: 'ConcreteMediator', tr: 'Somut arabulucu', color: 3 },
    colleague: { en: 'Colleague', tr: 'Meslektaş (öğe)', color: 5 },
    concreteColleague: { en: 'ConcreteColleague', tr: 'Somut meslektaş', color: 4 },
  };

  MD.classRoles = {
    Main: 'client',
    FormYoneticisi: 'mediator',
    GonderiFormu: 'concreteMediator',
    FormOgesi: 'colleague',
    SehirSecici: 'concreteColleague',
    AgirlikAlani: 'concreteColleague',
    SogukZincirKutusu: 'concreteColleague',
    TeslimatSecici: 'concreteColleague',
    UcretEtiketi: 'concreteColleague',
    SigortaKutusu: 'concreteColleague',
    // GoF genel adları
    Client: 'client',
    Mediator: 'mediator',
    ConcreteMediator: 'concreteMediator',
    Colleague: 'colleague',
    ConcreteColleague: 'concreteColleague',
  };

  MD.roleOf = function (name) {
    const r = MD.classRoles[name];
    return r ? MD.roles[r].color : null;
  };

  // `degisti`: öğeden yöneticiye giden tek çağrı (kodda ayrıca vurgulanır)
  MD.special = { degisti: 'arb' };

  /** 1 tabanlı satır numarası. */
  MD.lineOf = function (src, needle, from) {
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
  MD.plain = plain;

  const code = (MD.code = {});

  // ================================================================== dünya: form, kurallar
  MD.SEHIRLER = ['Malatya', 'Ankara', 'İzmir'];
  MD.AGIRLIKLAR = [2, 9, 25];
  MD.SECENEKLER = ['Standart', 'Hızlı', 'Dolap'];
  MD.TABAN = { Standart: 40, Hızlı: 70, Dolap: 30 };
  MD.KG_TL = 2;
  MD.SOGUK_TL = 25;
  MD.SIGORTA_TL = 15;
  MD.SINIR = 20;
  /** Öğeler (sahnedeki düğümler) ve sınıfları */
  MD.OGE = {
    sehir: { sinif: 'SehirSecici', ad: 'Şehir' },
    agirlik: { sinif: 'AgirlikAlani', ad: 'Ağırlık' },
    soguk: { sinif: 'SogukZincirKutusu', ad: 'Soğuk zincir' },
    sigorta: { sinif: 'SigortaKutusu', ad: 'Sigorta' },
    teslimat: { sinif: 'TeslimatSecici', ad: 'Teslimat' },
    ucret: { sinif: 'UcretEtiketi', ad: 'Ücret' },
  };
  MD.OGE_SIRA = ['sehir', 'agirlik', 'soguk', 'sigorta', 'teslimat', 'ucret'];
  MD.OGE_SINIFLARI = MD.OGE_SIRA.map((o) => MD.OGE[o].sinif);
  MD.ogeOf = (sinif) => MD.OGE_SIRA.find((o) => MD.OGE[o].sinif === sinif);
  /** Kuralların doğru hâli (tam kural): hangi seçenek açık olmalı? */
  MD.dogruKural = (s) => ({ hizli: s.kg <= MD.SINIR, dolap: s.sehir === 'Malatya' && !s.soguk && !s.sigorta && s.kg <= MD.SINIR });
  MD.ucretOf = (s) => MD.TABAN[s.secili] + s.kg * MD.KG_TL + (s.soguk ? MD.SOGUK_TL : 0) + (s.sigorta ? MD.SIGORTA_TL : 0);

  // ------------------------------------------------------------------ istekler (kullanıcının formdaki işlemleri)
  const S = (sehir) => ({ t: 'sehir', v: sehir });
  const A = (kg) => ({ t: 'agirlik', v: kg });
  const K = (b) => ({ t: 'soguk', v: !!b });
  const G = (b) => ({ t: 'sigorta', v: !!b });
  const T = (secenek) => ({ t: 'teslimat', v: secenek });
  MD.op = { S, A, K, G, T };

  // ================================================================== öğeler (meslektaşlar) — bütün sürümler
  /**
   * o: {mod: 'naive' (öğeler birbirini çağırır) | 'iskelet' (aynısı + FormOgesi, boş yönetici) |
   *          'yonetici' (kurallar yöneticide, eski bağlar duruyor) | 'temiz' (öğeler yalnızca yöneticiyi tanır),
   *     soguk: soğuk zincir kutusu var mı, tam: kalıpsız kural kopyaları soğuk zinciri de biliyor mu,
   *     sigorta: sigorta kutusu var mı (Genişlet), tuzak: ayarla() yeniden haber verir (Yapı), belge}
   */
  const ESKI_BAG = (o) => o.mod === 'naive' || o.mod === 'iskelet' || o.mod === 'yonetici';
  const DOGRUDAN = (o) => o.mod === 'naive' || o.mod === 'iskelet';
  const OGE = (o) => o.mod !== 'naive';
  /** Uzun bir imzayı virgülden böler (devam satırı 12 boşluk girintili) */
  function imzaSar(bas, params, son) {
    const tek = `${bas}${params.join(', ')}${son}`;
    if (tek.length <= 84) return tek;
    let satir = bas;
    const out = [];
    params.forEach((p, i) => {
      const parca = p + (i < params.length - 1 ? ',' : son);
      if ((satir + parca).length > 84 && satir.trim() !== bas.trim()) {
        out.push(satir.trimEnd());
        satir = '            ';
      }
      satir += parca + (i < params.length - 1 ? ' ' : '');
    });
    out.push(satir);
    return out.join('\n');
  }
  const SINIF_DEG = { sehir: 'SehirSecici', agirlik: 'AgirlikAlani', soguk: 'SogukZincirKutusu', teslimat: 'TeslimatSecici', ucret: 'UcretEtiketi' };
  /** Kalıpsız tasarımda bir öğenin tanıdığı öbür öğeler */
  function bagListesi(sinif, o) {
    const L = {
      SehirSecici: ['agirlik'].concat(o.soguk && o.tam ? ['soguk'] : [], ['teslimat']),
      AgirlikAlani: ['sehir'].concat(o.soguk ? ['soguk'] : [], ['teslimat', 'ucret']),
      SogukZincirKutusu: ['sehir', 'agirlik', 'teslimat', 'ucret'],
      TeslimatSecici: ['agirlik'].concat(o.soguk ? ['soguk'] : [], ['ucret']),
      UcretEtiketi: [],
    }[sinif];
    return L || [];
  }
  /** Ortak sınıf iskeleti: alanlar, kurucu, baglan(), gövde */
  function ogeSinifi(sinif, o, p) {
    const bag = ESKI_BAG(o) ? bagListesi(sinif, o) : [];
    const alanlar = p.alanlar.concat(bag.map((b) => `    private ${SINIF_DEG[b]} ${b};`));
    const parca = [];
    if (OGE(o))
      parca.push(`    public ${sinif}(FormYoneticisi yonetici) {
        super(yonetici);
    }`);
    if (bag.length)
      parca.push(`${imzaSar('    public void baglan(', bag.map((b) => `${SINIF_DEG[b]} ${b}`), ') {')}
${bag.map((b) => `        this.${b} = ${b};`).join('\n')}
    }`);
    p.yontemler.forEach((y) => parca.push(y));
    const ust = OGE(o) ? ' extends FormOgesi' : '';
    return `${p.imp || ''}${o.belge ? doc(p.belge) : ''}public class ${sinif}${ust} {

${alanlar.join('\n')}

${parca.join('\n\n')}
}`;
  }

  // ---- kalıpsız kural satırları (dolap açık mı?)
  const dolapSatiri = (ifade, girinti) => {
    const g = ' '.repeat(girinti || 8);
    const tek = `${g}boolean dolap = ${ifade.join(' && ')};`;
    if (tek.length <= 84) return tek;
    return `${g}boolean dolap = ${ifade.slice(0, -1).join(' && ')}\n${g}        && ${ifade[ifade.length - 1]};`;
  };
  const ucretCagri = (o, kg, sec, sog) => (o.soguk ? `        ucret.hesapla(${kg}, ${sec}, ${sog});` : `        ucret.hesapla(${kg}, ${sec});`);

  function sehirSrc(o) {
    const govde = ['        secili = sehir;', '        System.out.println("> şehir: " + sehir);'];
    if (DOGRUDAN(o)) {
      govde.push(dolapSatiri(['sehir.equals("Malatya")'].concat(o.soguk && o.tam ? ['!soguk.isaretli()'] : [], ['agirlik.kg() <= 20'])), '        teslimat.setDolapAcik(dolap);');
    }
    if (OGE(o)) govde.push('        degisti();');
    return ogeSinifi('SehirSecici', o, {
      belge: OGE(o) ? '«ConcreteColleague» — Şehir seçici: seçimini yöneticiye bildirir; dolaptan habersizdir.' : 'Şehir seçici: dolap yalnızca Malatya’da; seçim değişince dolabı kendisi açıp kapatır.',
      alanlar: ['    private String secili;'],
      yontemler: [
        `    public void sec(String sehir) {
${govde.join('\n')}
    }`,
        `    public String secili() {
        return secili;
    }`,
      ],
    });
  }

  function agirlikSrc(o) {
    const govde = ['        this.kg = kg;', '        System.out.println("> ağırlık: " + kg + " kg");'];
    if (DOGRUDAN(o)) {
      govde.push(
        '        teslimat.setHizliAcik(kg <= 20);',
        dolapSatiri(['"Malatya".equals(sehir.secili())'].concat(o.soguk && o.tam ? ['!soguk.isaretli()'] : [], ['kg <= 20'])),
        '        teslimat.setDolapAcik(dolap);',
        ucretCagri(o, 'kg', 'teslimat.secili()', 'soguk.isaretli()')
      );
    }
    if (OGE(o)) govde.push('        degisti();');
    return ogeSinifi('AgirlikAlani', o, {
      belge: OGE(o) ? '«ConcreteColleague» — Ağırlık alanı: yazılan ağırlığı yöneticiye bildirir.' : 'Ağırlık alanı: 20 kg üstünde hızlı teslimat ve dolap kapanır; ücreti de kendisi günceller.',
      alanlar: ['    private int kg;'],
      yontemler: [
        `    public void yaz(int kg) {
${govde.join('\n')}
    }`,
        `    public int kg() {
        return kg;
    }`,
      ],
    });
  }

  function sogukSrc(o) {
    const govde = ['        this.isaretli = isaretli;', '        System.out.println("> soğuk zincir: " + (isaretli ? "açık" : "kapalı"));'];
    if (DOGRUDAN(o)) {
      govde.push(dolapSatiri(['!isaretli', '"Malatya".equals(sehir.secili())', 'agirlik.kg() <= 20']), '        teslimat.setDolapAcik(dolap);', '        ucret.hesapla(agirlik.kg(), teslimat.secili(), isaretli);');
    }
    if (OGE(o)) govde.push('        degisti();');
    return ogeSinifi('SogukZincirKutusu', o, {
      belge: OGE(o) ? '«ConcreteColleague» — Soğuk zincir kutusu: işaretlenince yöneticiye bildirir.' : 'Soğuk zincir kutusu: ilaç dolaba konmaz; işaretlenince dolabı kapatır, ücrete ek koyar.',
      alanlar: ['    private boolean isaretli;'],
      yontemler: [
        `    public void isaretle(boolean isaretli) {
${govde.join('\n')}
    }`,
        `    public boolean isaretli() {
        return isaretli;
    }`,
      ],
    });
  }

  function sigortaSrc() {
    return `${doc('«ConcreteColleague» — Sigorta kutusu: sigortalı gönderi imzayla teslim edilir, dolaba konmaz.')}public class SigortaKutusu extends FormOgesi {

    private boolean isaretli;

    public SigortaKutusu(FormYoneticisi yonetici) {
        super(yonetici);
    }

    public void isaretle(boolean isaretli) {
        this.isaretli = isaretli;
        System.out.println("> sigorta: " + (isaretli ? "açık" : "kapalı"));
        degisti();
    }

    public boolean isaretli() {
        return isaretli;
    }
}`;
  }

  const ACIK_YONTEMI = `    private boolean acik(String secenek) {
        return switch (secenek) {
            case "Hızlı" -> hizliAcik;
            case "Dolap" -> dolapAcik;
            default -> true;
        };
    }`;
  function teslimatSrc(o) {
    const secGovde = [
      '        if (!acik(secenek)) {',
      '            System.out.println("> teslimat: " + secenek + " seçilemez (kapalı)");',
      '            return;',
      '        }',
      '        secili = secenek;',
      '        System.out.println("> teslimat: " + secenek);',
    ];
    if (DOGRUDAN(o)) secGovde.push(ucretCagri(o, 'agirlik.kg()', 'secili', 'soguk.isaretli()'));
    if (OGE(o)) secGovde.push('        degisti();');
    const yontemler = [
      `    public void sec(String secenek) {
${secGovde.join('\n')}
    }`,
    ];
    if (DOGRUDAN(o)) {
      ['hizli', 'dolap'].forEach((k) =>
        yontemler.push(`    public void set${k === 'hizli' ? 'Hizli' : 'Dolap'}Acik(boolean acik) {
        if (acik != ${k}Acik) {
            ${k}Acik = acik;
            System.out.println("  ${k === 'hizli' ? 'hızlı' : 'dolap'}: " + (acik ? "açık" : "kapalı"));
            standartaDon();
        }
    }`)
      );
      yontemler.push(`    private void standartaDon() {
        if (!acik(secili)) {
            secili = "Standart";
            System.out.println("  teslimat: Standart");
    ${ucretCagri(o, 'agirlik.kg()', 'secili', 'soguk.isaretli()')}
        }
    }`);
    } else {
      yontemler.push(`${cm('    public void ayarla(boolean hizli, boolean dolap) {', 'yönetici çağırır', 60)}
        if (hizli != hizliAcik) {
            hizliAcik = hizli;
            System.out.println("  hızlı: " + (hizli ? "açık" : "kapalı"));
        }
        if (dolap != dolapAcik) {
            dolapAcik = dolap;
            System.out.println("  dolap: " + (dolap ? "açık" : "kapalı"));
        }
        if (!acik(secili)) {
            secili = "Standart";
            System.out.println("  teslimat: Standart");
        }${
          o.tuzak
            ? `
${cm('        degisti();', '“ben de değiştim”', 52)}`
            : ''
        }
    }`);
    }
    yontemler.push(
      ACIK_YONTEMI,
      `    public String secili() {
        return secili;
    }`
    );
    return ogeSinifi('TeslimatSecici', o, {
      belge: OGE(o) ? '«ConcreteColleague» — Teslimat seçici: seçimi bildirir; hangi seçenek açık, yönetici söyler.' : 'Teslimat seçici: Standart, Hızlı, Dolap; kapanan seçenek seçiliyse Standart’a döner.',
      alanlar: ['    private String secili = "Standart";', '    private boolean hizliAcik = true;', '    private boolean dolapAcik = false;'],
      yontemler,
    });
  }

  function ucretSrc(o) {
    const yontemler = [];
    if (o.mod === 'naive' || o.mod === 'iskelet') {
      const p = o.soguk ? 'int kg, String secenek, boolean soguk' : 'int kg, String secenek';
      yontemler.push(
        `    public void hesapla(${p}) {
        int yeni = taban(secenek) + kg * 2${o.soguk ? ' + (soguk ? 25 : 0)' : ''};
        if (yeni != tl) {
            tl = yeni;
            System.out.println("  ücret: " + tl + " TL");
        }
    }`,
        `    private static int taban(String secenek) {
        return switch (secenek) {
            case "Hızlı" -> 70;
            case "Dolap" -> 30;
            default -> 40;
        };
    }`
      );
    } else {
      yontemler.push(`    public void goster(int yeni) {
        if (yeni != tl) {
            tl = yeni;
            System.out.println("  ücret: " + tl + " TL");
        }
    }`);
    }
    yontemler.push(`    public int tl() {
        return tl;
    }`);
    return ogeSinifi('UcretEtiketi', o, {
      belge: OGE(o)
        ? '«ConcreteColleague» — Ücret etiketi: yöneticinin hesapladığı ücreti gösterir.'
        : o.soguk
        ? 'Ücret etiketi: ücreti ağırlığa, seçeneğe ve soğuk zincire göre hesaplayıp gösterir.'
        : 'Ücret etiketi: ücreti ağırlığa ve teslimat seçeneğine göre hesaplayıp gösterir.',
      alanlar: ['    private int tl = 40;'],
      yontemler,
    });
  }

  code.FormYoneticisi = `${doc('«Mediator» — Form öğelerinin tek muhatabı: öğeler birbirini değil, yöneticiyi tanır.')}public interface FormYoneticisi {

    void degisti(FormOgesi kaynak);
}`;
  code.FormOgesi = `${doc('«Colleague» — Formun her öğesi: değişince yöneticiye haber verir; ötekilerden habersizdir.')}public abstract class FormOgesi {

    private final FormYoneticisi yonetici;

    protected FormOgesi(FormYoneticisi yonetici) {
        this.yonetici = yonetici;
    }

    protected void degisti() {
        yonetici.degisti(this);
    }
}`;

  // ================================================================== GonderiFormu: kalıpsızda kap, kalıplıda arabulucu
  function formSrc(o) {
    const ogeler = ['sehir', 'agirlik'].concat(o.soguk ? ['soguk'] : [], o.sigorta ? ['sigorta'] : [], ['teslimat', 'ucret']);
    const SIN = Object.assign({ sigorta: 'SigortaKutusu' }, SINIF_DEG);
    const alanlar = ogeler.map((k) => `    private final ${SIN[k]} ${k} = new ${SIN[k]}(${OGE(o) ? 'this' : ''});`);
    const parca = [];
    if (ESKI_BAG(o)) {
      const satirlar = [];
      ['SehirSecici', 'AgirlikAlani', 'SogukZincirKutusu', 'TeslimatSecici'].forEach((sinif) => {
        if (sinif === 'SogukZincirKutusu' && !o.soguk) return;
        const b = bagListesi(sinif, o);
        if (b.length) satirlar.push(`        ${MD.ogeOf(sinif)}.baglan(${b.join(', ')});`);
      });
      parca.push(`    public GonderiFormu() {
${satirlar.join('\n')}
    }`);
    }
    if (o.mod === 'iskelet')
      parca.push(`    @Override
    public void degisti(FormOgesi kaynak) {
        // kurallar henüz öğelerin içinde
    }`);
    else if (o.mod === 'yonetici' || o.mod === 'temiz') {
      const ifade = ['"Malatya".equals(sehir.secili())', '!soguk.isaretli()'].concat(o.sigorta ? ['!sigorta.isaretli()'] : [], ['kg <= 20']);
      const dolap = o.sigorta ? `        boolean dolap = ${ifade[0]} && ${ifade[1]}\n                && ${ifade[2]} && ${ifade[3]};` : dolapSatiri(ifade);
      parca.push(`    @Override
    public void degisti(FormOgesi kaynak) {
        int kg = agirlik.kg();
        boolean hizli = kg <= 20;
${dolap}
        teslimat.ayarla(hizli, dolap);
        ucret.goster(ucretHesapla());
    }`);
      parca.push(`    private int ucretHesapla() {
        int taban = switch (teslimat.secili()) {
            case "Hızlı" -> 70;
            case "Dolap" -> 30;
            default -> 40;
        };
        return taban + agirlik.kg() * 2 + (soguk.isaretli() ? 25 : 0)${o.sigorta ? '\n                + (sigorta.isaretli() ? 15 : 0)' : ''};
    }`);
    }
    ogeler
      .filter((k) => k !== 'ucret')
      .forEach((k) =>
        parca.push(`    public ${SIN[k]} ${k}() {
        return ${k};
    }`)
      );
    const ek = (o.soguk ? ['                + (soguk.isaretli() ? " · soğuk zincir" : "")'] : []).concat(o.sigorta ? ['                + (sigorta.isaretli() ? " · sigortalı" : "")'] : []);
    parca.push(`    public String ozet() {
        String yer = sehir.secili() == null ? "şehir seçilmedi" : sehir.secili();
        return "Gönderi: " + yer + " · " + agirlik.kg() + " kg"
${ek.concat(['                + " · " + teslimat.secili() + " · " + ucret.tl() + " TL";']).join('\n')}
    }`);
    const kalipli = OGE(o);
    const belge = kalipli ? '«ConcreteMediator» — Gönderi formu: öğeleri kurar; kim kimi nasıl etkiler, yalnızca burada yazılı.' : 'Gönderi formu: öğeleri yaratır ve birbirine bağlar; kuralları öğeler kendileri uygular.';
    return `${o.belge ? doc(belge) : ''}public ${kalipli ? 'final ' : ''}class GonderiFormu${kalipli ? ' implements FormYoneticisi' : ''} {

${alanlar.join('\n')}

${parca.join('\n\n')}
}`;
  }

  // ================================================================== programlar
  /**
   * Program: {tasarim: 'v1'|'v2'|'kopyali'|'r1'|'r2'|'mediator', sigorta (Genişlet), tuzak (Yapı), ops: [istek]}
   *   v1: dört öğe (soğuk zincir yok) · v2: soğuk zincir eklendi, iki kural kopyası eksik · kopyali: kopyaların hepsi tam
   *   r1: iskelet (FormOgesi, boş yönetici) · r2: kurallar yöneticide, eski bağlar duruyor · mediator: temiz
   */
  const SECENEK = {
    v1: { mod: 'naive', soguk: false },
    v2: { mod: 'naive', soguk: true },
    kopyali: { mod: 'naive', soguk: true, tam: true },
    r1: { mod: 'iskelet', soguk: true },
    r2: { mod: 'yonetici', soguk: true },
    mediator: { mod: 'temiz', soguk: true },
  };
  MD.secenekOf = (prog) => Object.assign({}, SECENEK[prog.tasarim], { sigorta: !!prog.sigorta, tuzak: !!prog.tuzak });
  MD.kalipli = (prog) => ['r2', 'mediator'].includes(prog.tasarim);
  MD.istekSatiri = function (op) {
    if (op.t === 'sehir') return `form.sehir().sec("${op.v}");`;
    if (op.t === 'agirlik') return `form.agirlik().yaz(${op.v});`;
    if (op.t === 'soguk') return `form.soguk().isaretle(${op.v});`;
    if (op.t === 'sigorta') return `form.sigorta().isaretle(${op.v});`;
    return `form.teslimat().sec("${op.v}");`;
  };
  MD.mainFor = function (prog) {
    return `public class Main {

    public static void main(String[] args) {
        GonderiFormu form = new GonderiFormu();
${prog.ops.map((op) => '        ' + MD.istekSatiri(op)).join('\n')}
        System.out.println(form.ozet());
    }
}`;
  };
  /** Programın bütün dosyaları (resmî sürümler açıklamalı, ara adımlar açıklamasız) */
  MD.filesFor = function (prog) {
    const o = MD.secenekOf(prog);
    o.belge = !['r1', 'r2'].includes(prog.tasarim);
    const F = { Main: MD.mainFor(prog), GonderiFormu: formSrc(o) };
    if (OGE(o)) {
      F.FormYoneticisi = o.belge ? code.FormYoneticisi : plain(code.FormYoneticisi);
      F.FormOgesi = o.belge ? code.FormOgesi : plain(code.FormOgesi);
    }
    F.SehirSecici = sehirSrc(o);
    F.AgirlikAlani = agirlikSrc(o);
    if (o.soguk) F.SogukZincirKutusu = sogukSrc(o);
    if (o.sigorta) F.SigortaKutusu = sigortaSrc();
    F.TeslimatSecici = teslimatSrc(o);
    F.UcretEtiketi = ucretSrc(o);
    return F;
  };
  MD.fileOrder = ['Main', 'GonderiFormu', 'FormYoneticisi', 'FormOgesi', 'SehirSecici', 'AgirlikAlani', 'SogukZincirKutusu', 'SigortaKutusu', 'TeslimatSecici', 'UcretEtiketi'];
  MD.fileList = (F, order) => (order || MD.fileOrder).filter((n) => F[n]).map((n) => ({ name: n + '.java', code: F[n] }));

  /** Koddan çıkarılan bağlar: hangi öğe hangi öğeyi alan olarak tutuyor? [{from, to}] (düğüm adları) */
  MD.baglar = function (F) {
    const out = [];
    MD.OGE_SINIFLARI.forEach((sinif) => {
      const src = F[sinif];
      if (!src) return;
      const re = /private (SehirSecici|AgirlikAlani|SogukZincirKutusu|SigortaKutusu|TeslimatSecici|UcretEtiketi) \w+;/g;
      let m;
      while ((m = re.exec(src))) out.push({ from: MD.ogeOf(sinif), to: MD.ogeOf(m[1]) });
    });
    return out;
  };
  /** “Dolap açık mı?” kuralının yazıldığı yerler: [{sinif, eksik}] — eksik: soğuk zinciri bilmiyor */
  MD.kuralYerleri = function (F) {
    const out = [];
    Object.keys(F).forEach((sinif) => {
      if (sinif === 'Main') return;
      const src = F[sinif];
      if (!src.includes('"Malatya"')) return;
      const L = src.split('\n');
      const i = L.findIndex((l) => l.includes('boolean dolap ='));
      let ifade = '';
      for (let k = i; k >= 0 && k < L.length; k++) {
        ifade += L[k];
        if (L[k].trim().endsWith(';')) break;
      }
      out.push({ sinif, eksik: !!F.SogukZincirKutusu && !/isaretli/.test(ifade) });
    });
    return out;
  };

  // ================================================================== çalıştırma benzetimi (Java ile birebir)
  /**
   * Kullanıcının işlemlerini sırayla oynatır. Kalıpsızda öğeler birbirini çağırır (her öğe kuralın kendi kopyasını
   * uygular); kalıplıda öğe yöneticiye haber verir, yönetici kuralların hepsini uygular.
   * Dönüş: {lines, olaylar, son}
   *   lines  : [{t, k: 'eylem'|'red'|'ayar'|'ucret'|'ozet'|'hata', i}]
   *   olaylar: {e, i, n, s, ...} — e: 'kur'|'eylem'|'red'|'cagri'|'bildir'|'kural'|'ayar'|'ucret'|'son'|'cokus'
   */
  MD.run = function (prog) {
    const o = MD.secenekOf(prog);
    const v1 = !o.soguk;
    const kalipli = MD.kalipli(prog);
    const st = { sehir: null, kg: 0, soguk: false, sigorta: false, secili: 'Standart', hizli: true, dolap: false, tl: 40 };
    const lines = [];
    const olaylar = [];
    let i = -1;
    let cokus = false;
    let yanlisAn = 0;
    const kopya = () => {
      const s = Object.assign({}, st);
      const d = MD.dogruKural(st);
      s.dogru = d;
      s.yanlisAcik = (st.dolap && !d.dolap) || (st.hizli && !d.hizli);
      s.yanlisSecim = (st.secili === 'Dolap' && !d.dolap) || (st.secili === 'Hızlı' && !d.hizli);
      return s;
    };
    const out = (t, k) => lines.push({ t, k, i });
    const olay = (e, x) => olaylar.push(Object.assign({ e, i, n: lines.length }, x || {}, { s: kopya() }));
    const cagri = (from, to, yontem, metin, yanlis) => olay('cagri', { from, to, yontem, metin: metin || yontem, yanlis: !!yanlis });

    // ---- ücret etiketi
    const ucretYaz = (yeni, kaynak, yontem) => {
      cagri(kaynak, 'ucret', yontem, yontem === 'goster' ? `goster(${yeni})` : 'hesapla(…)');
      if (yeni !== st.tl) {
        st.tl = yeni;
        out(`  ücret: ${st.tl} TL`, 'ucret');
        olay('ucret', { tl: st.tl });
      }
    };
    const hesapla = (kaynak) => ucretYaz(MD.TABAN[st.secili] + st.kg * 2 + (o.soguk && st.soguk ? 25 : 0), kaynak, 'hesapla');
    const acik = (sec) => (sec === 'Hızlı' ? st.hizli : sec === 'Dolap' ? st.dolap : true);

    // ---- kalıpsız: teslimat seçicinin kendi yöntemleri
    const standartaDon = () => {
      if (!acik(st.secili)) {
        st.secili = 'Standart';
        out('  teslimat: Standart', 'ayar');
        olay('ayar', { ne: 'secili' });
        hesapla('teslimat');
      }
    };
    const secenekAc = (ne, a, kaynak) => {
      const ad = ne === 'hizli' ? 'setHizliAcik' : 'setDolapAcik';
      cagri(kaynak, 'teslimat', ad, `${ad}(${a})`, ne === 'dolap' && a && !MD.dogruKural(st).dolap);
      if (a !== st[ne]) {
        st[ne] = a;
        out(`  ${ne === 'hizli' ? 'hızlı' : 'dolap'}: ${a ? 'açık' : 'kapalı'}`, 'ayar');
        olay('ayar', { ne, acik: a });
        standartaDon();
      }
    };

    // ---- kalıplı: yönetici
    const yoneticiDegisti = (kaynak) => {
      olay('bildir', { from: kaynak });
      const kg = st.kg;
      const hizli = kg <= 20;
      const dolap = st.sehir === 'Malatya' && !st.soguk && (!o.sigorta || !st.sigorta) && kg <= 20;
      olay('kural', { hizli, dolap });
      cagri('form', 'teslimat', 'ayarla', `ayarla(${hizli}, ${dolap})`);
      if (hizli !== st.hizli) {
        st.hizli = hizli;
        out(`  hızlı: ${hizli ? 'açık' : 'kapalı'}`, 'ayar');
        olay('ayar', { ne: 'hizli', acik: hizli });
      }
      if (dolap !== st.dolap) {
        st.dolap = dolap;
        out(`  dolap: ${dolap ? 'açık' : 'kapalı'}`, 'ayar');
        olay('ayar', { ne: 'dolap', acik: dolap });
      }
      if (!acik(st.secili)) {
        st.secili = 'Standart';
        out('  teslimat: Standart', 'ayar');
        olay('ayar', { ne: 'secili' });
      }
      if (o.tuzak) {
        // ayarla() yeniden haber verir → yönetici yeniden ayarla() der … sonsuz döngü
        cokus = true;
        return;
      }
      ucretYaz(MD.TABAN[st.secili] + kg * 2 + (st.soguk ? 25 : 0) + (st.sigorta ? 15 : 0), 'form', 'goster');
    };
    const bildir = (kaynak) => {
      if (OGE(o) && !kalipli) olay('bildir', { from: kaynak, bos: true }); // iskelet: yönetici henüz bir şey yapmıyor
      else if (kalipli) yoneticiDegisti(kaynak);
    };

    // ---- kullanıcının işlemleri
    const DOG = DOGRUDAN(o);
    const islem = {
      sehir: (v) => {
        st.sehir = v;
        out(`> şehir: ${v}`, 'eylem');
        olay('eylem', { oge: 'sehir', v });
        if (DOG) secenekAc('dolap', v === 'Malatya' && (!(o.soguk && o.tam) || !st.soguk) && st.kg <= 20, 'sehir');
        bildir('sehir');
      },
      agirlik: (v) => {
        st.kg = v;
        out(`> ağırlık: ${v} kg`, 'eylem');
        olay('eylem', { oge: 'agirlik', v });
        if (DOG) {
          secenekAc('hizli', v <= 20, 'agirlik');
          secenekAc('dolap', st.sehir === 'Malatya' && (!(o.soguk && o.tam) || !st.soguk) && v <= 20, 'agirlik');
          hesapla('agirlik');
        }
        bildir('agirlik');
      },
      soguk: (v) => {
        st.soguk = v;
        out(`> soğuk zincir: ${v ? 'açık' : 'kapalı'}`, 'eylem');
        olay('eylem', { oge: 'soguk', v });
        if (DOG) {
          secenekAc('dolap', !v && st.sehir === 'Malatya' && st.kg <= 20, 'soguk');
          hesapla('soguk');
        }
        bildir('soguk');
      },
      sigorta: (v) => {
        st.sigorta = v;
        out(`> sigorta: ${v ? 'açık' : 'kapalı'}`, 'eylem');
        olay('eylem', { oge: 'sigorta', v });
        bildir('sigorta');
      },
      teslimat: (v) => {
        if (!acik(v)) {
          out(`> teslimat: ${v} seçilemez (kapalı)`, 'red');
          olay('red', { oge: 'teslimat', v });
          return;
        }
        st.secili = v;
        out(`> teslimat: ${v}`, 'eylem');
        olay('eylem', { oge: 'teslimat', v });
        if (DOG) hesapla('teslimat');
        bildir('teslimat');
      },
    };

    olay('kur');
    for (let k = 0; k < prog.ops.length && !cokus; k++) {
      i = k;
      const op = prog.ops[k];
      islem[op.t](op.v);
      if (!cokus) {
        const s = kopya();
        if (s.yanlisAcik || s.yanlisSecim) yanlisAn++;
        olay('son', { yanlis: s.yanlisAcik || s.yanlisSecim });
      }
    }
    if (cokus) {
      out('Exception in thread "main" java.lang.StackOverflowError', 'hata');
      olay('cokus');
    } else {
      i = -1;
      const yer = st.sehir == null ? 'şehir seçilmedi' : st.sehir;
      out(`Gönderi: ${yer} · ${st.kg} kg${!v1 && st.soguk ? ' · soğuk zincir' : ''}${st.sigorta ? ' · sigortalı' : ''} · ${st.secili} · ${st.tl} TL`, 'ozet');
      olay('ozet');
    }
    const son = olaylar[olaylar.length - 1].s;
    son.yanlisAn = yanlisAn;
    son.aykiri = son.yanlisSecim;
    son.cokus = cokus;
    return { lines, olaylar, son };
  };
  MD.outputOf = (prog) => MD.run(prog).lines.map((l) => l.t);

  // ================================================================== "Sorun" sürümleri
  /** Aynı değerler, iki sıra: A (önce şehir) doğru çalışır; B (önce soğuk zincir) hatayı gösterir */
  MD.SIRA_A = [S('Malatya'), A(2), K(true), T('Dolap')];
  MD.SIRA_B = [K(true), S('Malatya'), A(2), T('Dolap')];
  MD.NV = {
    v1: { tasarim: 'v1', ops: [S('Malatya'), A(2), T('Dolap')] },
    v2a: { tasarim: 'v2', ops: MD.SIRA_A },
    v2b: { tasarim: 'v2', ops: MD.SIRA_B },
  };
  MD.naiveFiles = (v) => MD.filesFor(MD.NV[v]);

  // ================================================================== çözüm ve adım adım yeniden düzenleme
  MD.COZUM = { tasarim: 'mediator', ops: MD.SIRA_B };
  code.Main = MD.mainFor(MD.COZUM);
  MD.output = MD.outputOf(MD.COZUM);
  const progR = (t) => ({ tasarim: t, ops: MD.SIRA_B });
  MD.refactorProgs = [MD.NV.v2b, progR('r1'), progR('r2'), MD.COZUM];
  MD.refactor = MD.refactorProgs.map((p, k) => {
    const F = MD.filesFor(p);
    if (k === 3) Object.keys(F).forEach((n) => (F[n] = plain(F[n])));
    return F;
  });
  MD.refactorOrder = ['Main', 'GonderiFormu', 'FormYoneticisi', 'FormOgesi', 'SehirSecici', 'AgirlikAlani', 'SogukZincirKutusu', 'TeslimatSecici', 'UcretEtiketi'];

  // ================================================================== Canlı Akış
  MD.presets = {
    ilac: { key: 'ilac', title: 'Soğuk zincirli ilaç', prog: MD.COZUM },
    agir: { key: 'agir', title: 'Ağır koli', prog: { tasarim: 'mediator', ops: [S('Malatya'), A(9), T('Hızlı'), A(25)] } },
  };
  MD.presetOrder = ['ilac', 'agir'];
  MD.akisFiles = (p) => MD.fileList(MD.filesFor(p.prog));
  MD.akisOutput = (p) => MD.outputOf(p.prog);

  // ================================================================== Form tezgâhı
  MD.TEZGAH_ANA = MD.SIRA_B;
  MD.ISTEK_EN_COK = 14;
  /** Oturum: {design: 'v2'|'kopyali'|'mediator', ops, sigorta (yalnızca mediator, Genişlet’ten sonra)} */
  MD.tezgahProg = (tz) => ({ tasarim: tz.design, ops: tz.ops, sigorta: tz.design === 'mediator' && !!tz.sigorta });
  MD.tezgahFiles = (tz) => MD.filesFor(MD.tezgahProg(tz));
  MD.uygun = function (tz, op) {
    if (tz.ops.length >= MD.ISTEK_EN_COK) return false;
    if (op.t === 'sigorta') return tz.design === 'mediator' && !!tz.sigorta;
    return true;
  };
  MD.olc = function (tz) {
    const prog = MD.tezgahProg(tz);
    const r = MD.run(prog);
    const F = MD.filesFor(prog);
    return {
      run: r,
      islem: tz.ops.length,
      yanlisAn: r.son.yanlisAn,
      aykiri: r.son.aykiri ? 1 : 0,
      bag: MD.baglar(F).length,
      kural: MD.kuralYerleri(F).length,
    };
  };

  // ================================================================== Genişlet: yeni öğe (SigortaKutusu)
  const EX = (MD.ext = {});
  EX.exercise = `public class SigortaKutusu extends ⟦1⟧ {

    private boolean isaretli;

    public SigortaKutusu(FormYoneticisi yonetici) {
        super(yonetici);
    }

    public void isaretle(boolean isaretli) {
        this.isaretli = isaretli;
        System.out.println("> sigorta: " + (isaretli ? "açık" : "kapalı"));
        ⟦2⟧();
    }
}`;
  EX.exerciseForm = `// GonderiFormu.java: ek
private final SigortaKutusu sigorta = new SigortaKutusu(⟦3⟧);
…
boolean dolap = … && !sigorta.⟦4⟧() && kg <= 20;`;
  EX.answers = { 1: 'FormOgesi', 2: 'degisti', 3: 'this', 4: 'isaretli' };
  EX.prog = { tasarim: 'mediator', sigorta: true, ops: [S('Malatya'), A(2), T('Dolap'), G(true)] };
  EX.Main = MD.mainFor(EX.prog);
  EX.output = MD.outputOf(EX.prog);

  // ================================================================== Yapı: yönetici ayarlarken öğe yeniden haber verirse (gerçek çalıştırma)
  /** 'dongu': ayarla() sonunda degisti() der → StackOverflowError · 'duzeltme': demez */
  MD.tuzak = (tur) => ({ tasarim: 'mediator', tuzak: tur === 'dongu', ops: [S('Malatya'), A(2)] });
  MD.TUZAK_SIRA = ['dongu', 'duzeltme'];
  /** Döngünün yığındaki üç çerçevesi (ilk çerçeve çalıştırmadan çalıştırmaya değişir; sıra hep aynıdır) */
  MD.donguCerceveleri = function (pkg) {
    const F = MD.filesFor(MD.tuzak('dongu'));
    const pk = pkg ? pkg + '.' : '';
    const kay = pkg ? 3 : 0;
    const ay = MD.lineOf(F.TeslimatSecici, 'degisti();', MD.lineOf(F.TeslimatSecici, 'public void ayarla(')) + kay;
    return [`\tat ${pk}TeslimatSecici.ayarla(TeslimatSecici.java:${ay})`, `\tat ${pk}FormOgesi.degisti(FormOgesi.java:${MD.lineOf(F.FormOgesi, 'yonetici.degisti(this);') + kay})`, `\tat ${pk}GonderiFormu.degisti(GonderiFormu.java:${MD.lineOf(F.GonderiFormu, 'teslimat.ayarla(hizli, dolap);') + kay})`];
  };

  // ================================================================== Gerçek dünya (JDK) örnekleri
  const RW = (MD.rw = {});
  const sArg = (stmt, comment) => cm('        ' + stmt, comment, 52).slice(8);

  RW.grup = (arg) => `import javax.swing.ButtonGroup;
import javax.swing.JRadioButton;

public class TeslimatGrubu {

    public static void main(String[] args) {
        JRadioButton standart = new JRadioButton("Standart");
        JRadioButton hizli = new JRadioButton("Hızlı");
        JRadioButton dolap = new JRadioButton("Dolap");
${cm('        ButtonGroup grup = new ButtonGroup();', 'arabulucu', 52)}
        grup.add(standart);
        grup.add(hizli);
        grup.add(dolap);
        standart.doClick();

        ${arg}
        System.out.println("standart: " + standart.isSelected());
        System.out.println("dolap: " + dolap.isSelected());
    }
}`;
  RW.grupOpts = [
    { label: 'Dolap’a tıkla', arg: sArg('dolap.doClick();', 'öteki kendiliğinden kalkar'), out: ['standart: false', 'dolap: true'] },
    { label: 'Gruptan çıkar', arg: 'grup.remove(dolap); dolap.doClick();', out: ['standart: true', 'dolap: true'] },
    { label: 'clearSelection()', arg: sArg('grup.clearSelection();', 'hepsini kaldır'), out: ['standart: false', 'dolap: false'] },
  ];

  RW.swing = (arg) => `import java.awt.event.ItemEvent;
import java.awt.event.ItemListener;
import javax.swing.ButtonGroup;
import javax.swing.JCheckBox;
import javax.swing.JRadioButton;

public final class SwingFormu implements ItemListener {

    private final JCheckBox soguk = new JCheckBox("Soğuk zincir");
    private final JRadioButton standart = new JRadioButton("Standart", true);
    private final JRadioButton dolap = new JRadioButton("Dolap");

    private SwingFormu() {
        ButtonGroup grup = new ButtonGroup();
        grup.add(standart);
        grup.add(dolap);
        soguk.addItemListener(this);
    }

    @Override
    public void itemStateChanged(ItemEvent e) {
        dolap.setEnabled(!soguk.isSelected());
        if (!dolap.isEnabled() && dolap.isSelected()) {
            standart.setSelected(true);
        }
    }

    public static void main(String[] args) {
        SwingFormu form = new SwingFormu();
        ${arg}
        String durum = form.dolap.isEnabled() ? "açık" : "kapalı";
        String secili = form.dolap.isSelected() ? "Dolap" : "Standart";
        System.out.println("dolap: " + durum + " · seçili: " + secili);
    }
}`;
  RW.swingOpts = [
    { label: 'Dolap seç', arg: 'form.dolap.doClick();', out: ['dolap: açık · seçili: Dolap'] },
    { label: 'Soğuk zincir, sonra Dolap', arg: 'form.soguk.doClick(); form.dolap.doClick();', out: ['dolap: kapalı · seçili: Standart'] },
    { label: 'Dolap, sonra soğuk zincir', arg: 'form.dolap.doClick(); form.soguk.doClick();', out: ['dolap: kapalı · seçili: Standart'] },
  ];

  RW.bariyer = (arg) => `import java.util.concurrent.BrokenBarrierException;
import java.util.concurrent.CyclicBarrier;

public class Konvoy {

    private static int sayac;

    static void yolaCik() {
        sayac++;
        System.out.println("konvoy " + sayac + " yola çıktı");
    }

    public static void main(String[] args) throws InterruptedException {
        ${arg}
        Thread[] kamyonlar = new Thread[6];
        for (int i = 0; i < kamyonlar.length; i++) {
            kamyonlar[i] = new Thread(() -> bekle(bariyer));
            kamyonlar[i].start();
        }
        for (Thread kamyon : kamyonlar) {
            kamyon.join();
        }
        System.out.println("6 kamyon birbirini hiç tanımadı");
    }

    static void bekle(CyclicBarrier bariyer) {
        try {
${cm('            bariyer.await();', 'öbürlerini bekle', 52)}
        } catch (InterruptedException | BrokenBarrierException e) {
            System.out.println("bariyer bozuldu: " + e);
        }
    }
}`;
  RW.bariyerOpts = [
    { label: '3’erli konvoy', arg: 'CyclicBarrier bariyer = new CyclicBarrier(3, Konvoy::yolaCik);', out: ['konvoy 1 yola çıktı', 'konvoy 2 yola çıktı', '6 kamyon birbirini hiç tanımadı'] },
    { label: '2’şerli konvoy', arg: 'CyclicBarrier bariyer = new CyclicBarrier(2, Konvoy::yolaCik);', out: ['konvoy 1 yola çıktı', 'konvoy 2 yola çıktı', 'konvoy 3 yola çıktı', '6 kamyon birbirini hiç tanımadı'] },
    { label: 'Tek konvoy', arg: 'CyclicBarrier bariyer = new CyclicBarrier(6, Konvoy::yolaCik);', out: ['konvoy 1 yola çıktı', '6 kamyon birbirini hiç tanımadı'] },
  ];

  // ================================================================== UML sınıf diyagramları
  const Mb = {
    degistiY: { id: 'degisti', text: '+ degisti(kaynak: FormOgesi)', generic: '+ changed(c: Colleague)', factory: true, abstract: true },
    ogeler: { id: 'ogeler', text: '- sehir, agirlik, soguk, …', generic: '- colleagues' },
    degistiF: { id: 'degisti', text: '+ degisti(kaynak)', generic: '+ changed(c)', factory: true },
    ucretHesapla: { id: 'ucretHesapla', text: '- ucretHesapla(): int', generic: '- rule()' },
    erisim: { id: 'erisim', text: '+ sehir() … teslimat()', generic: '+ colleagueA() …' },
    ozet: { id: 'ozet', text: '+ ozet(): String', generic: '+ result()' },
    yonetici: { id: 'yonetici', text: '- yonetici: FormYoneticisi', generic: '- mediator' },
    degistiO: { id: 'degisti', text: '# degisti()', generic: '# changed()', factory: true },
  };
  MD.members = Mb;
  const OGE_UYE = {
    SehirSecici: [{ id: 'sec', text: '+ sec(sehir)', generic: '+ operationA()' }, { id: 'secili', text: '+ secili()', generic: '+ getA()' }],
    AgirlikAlani: [{ id: 'yaz', text: '+ yaz(kg)', generic: '+ operationB()' }, { id: 'kg', text: '+ kg()', generic: '+ getB()' }],
    SogukZincirKutusu: [{ id: 'isaretle', text: '+ isaretle(b)', generic: '+ operationC()' }, { id: 'isaretli', text: '+ isaretli()', generic: '+ getC()' }],
    SigortaKutusu: [{ id: 'isaretle', text: '+ isaretle(b)', generic: '+ operationE()' }, { id: 'isaretli', text: '+ isaretli()', generic: '+ getE()' }],
    TeslimatSecici: [{ id: 'sec', text: '+ sec(secenek)', generic: '+ operationD()' }, { id: 'ayarla', text: '+ ayarla(h, d)', generic: '+ adjust()' }],
    UcretEtiketi: [{ id: 'goster', text: '+ goster(tl)', generic: '+ show()' }, { id: 'tl', text: '+ tl()', generic: '+ getF()' }],
  };
  const OGE_HARF = ['SehirSecici', 'AgirlikAlani', 'SogukZincirKutusu', 'TeslimatSecici', 'UcretEtiketi', 'SigortaKutusu'];
  const OGE_W = { SehirSecici: 150, AgirlikAlani: 150, SogukZincirKutusu: 176, SigortaKutusu: 156, TeslimatSecici: 150, UcretEtiketi: 150 };
  const box = {
    Main: (x, y) => ({ id: 'Main', name: 'Main', generic: 'Client', kind: 'class', role: 'client', x, y, w: 190, members: [{ id: 'main', text: '+ main(args)', generic: '+ main()' }] }),
    Yonetici: (x, y) => ({ id: 'FormYoneticisi', name: 'FormYoneticisi', generic: 'Mediator', kind: 'interface', role: 'mediator', x, y, w: 300, members: [Mb.degistiY] }),
    Form: (x, y) => ({ id: 'GonderiFormu', name: 'GonderiFormu', generic: 'ConcreteMediator', kind: 'class', role: 'concreteMediator', x, y, w: 300, members: [Mb.ogeler, Mb.degistiF, Mb.ucretHesapla, Mb.erisim, Mb.ozet] }),
    Oge: (x, y) => ({ id: 'FormOgesi', name: 'FormOgesi', generic: 'Colleague', kind: 'abstract', role: 'colleague', x, y, w: 290, members: [Mb.yonetici, Mb.degistiO] }),
    oge: (sinif, x, y, o) => ({ id: sinif, name: sinif, generic: 'Colleague' + 'ABCDEF'[OGE_HARF.indexOf(sinif)], kind: 'class', role: 'concreteColleague', x, y, w: OGE_W[sinif], noTag: !!(o && o.noTag), members: OGE_UYE[sinif] }),
  };
  MD.box = box;
  const OGE_DIZI = ['SehirSecici', 'AgirlikAlani', 'SogukZincirKutusu', 'TeslimatSecici', 'UcretEtiketi'];

  /** GoF yapısı (Yapı sahnesi, Canlı Akış, özet). o.notes: kural ve haber notları */
  MD.gofDiagram = function (o) {
    o = o || {};
    const classes = [box.Yonetici(20, 40), box.Form(20, 210), box.Oge(560, 40), box.Main(20, 470)];
    let x = 360;
    const xs = {};
    OGE_DIZI.forEach((s, k) => {
      xs[s] = x;
      classes.push(box.oge(s, x, 300, { noTag: k > 0 }));
      x += OGE_W[s] + 14;
    });
    const relations = [
      { id: 'r-form', from: 'GonderiFormu', to: 'FormYoneticisi', type: 'realization', fromSide: 'top', fromAt: 170, toSide: 'bottom', toAt: 170 },
      { id: 'yonetici', from: 'FormOgesi', to: 'FormYoneticisi', type: 'association', label: 'yonetici', genericLabel: 'mediator', fromSide: 'left', fromAt: 80, toSide: 'right', toAt: 80 },
      { id: 'c-main', from: 'Main', to: 'GonderiFormu', type: 'dependency', label: '«create»', fromSide: 'top', fromAt: 110, toSide: 'bottom', toAt: 110 },
    ];
    OGE_DIZI.forEach((s) => {
      const cx = xs[s] + OGE_W[s] / 2;
      relations.push({ id: 'g-' + s, from: s, to: 'FormOgesi', type: 'generalization', fromSide: 'top', fromAt: cx, toSide: 'bottom', toAt: 705, mid: 262 });
      relations.push({ id: 'o-' + s, from: 'GonderiFormu', to: s, type: 'association', label: s === 'UcretEtiketi' ? 'öğeler' : '', genericLabel: s === 'UcretEtiketi' ? 'colleagues' : '', fromSide: 'right', fromAt: 330, toSide: 'bottom', toAt: cx, points: [[338, 330], [338, 430], [cx, 430]] });
    });
    const notes = o.notes
      ? [
          { id: 'n-kural', x: 360, y: 452, text: 'degisti(kaynak):\ndolap = Malatya && !soğuk && kg ≤ 20\nteslimat.ayarla(…); ucret.goster(…)', genericText: 'changed(c):\nall interaction rules here\ncolleagueB.adjust(…)', target: 'GonderiFormu', from: 'left', to: 'right', toAt: 255 },
          { id: 'n-oge', x: 900, y: 452, text: 'öğe ötekileri tanımaz:\nyonetici.degisti(this);', genericText: 'colleague knows only\nmediator.changed(this);', target: 'TeslimatSecici', from: 'top', to: 'bottom', toAt: 1000 },
        ]
      : [];
    return { width: 1210, height: 580, title: 'Mediator sınıf diyagramı', classes, relations, notes };
  };

  // ------------------------------------------------------------------ UML sıralama diyagramı (Canlı Akış)
  /**
   * Her kullanıcı işlemi kendi küçük diyagramıdır (bölüm): Main, form ve beş öğe.
   * Dönüş: {bolumler: [{spec, msgOf, baslik}], run}
   */
  MD.seqSpec = function (p) {
    const prog = p.prog;
    const r = MD.run(prog);
    const bolumler = [];
    const W = 940;
    const rowH = 30;
    const ogeler = ['sehir', 'agirlik', 'soguk'].concat(prog.sigorta ? ['sigorta'] : [], ['teslimat', 'ucret']);
    const parts = () => {
      const ps = [{ id: 'main', label: 'Main', role: 'client' }, { id: 'form', label: 'form\n: GonderiFormu', role: 'concreteMediator', object: true }];
      ogeler.forEach((o) => ps.push({ id: o, label: `${o}\n: ${MD.OGE[o].sinif}`, role: 'concreteColleague', object: true }));
      ps.forEach((pp, i) => (pp.x = 60 + (i * (W - 120)) / Math.max(1, ps.length - 1)));
      return ps;
    };
    const yap = (messages, msgOf, baslik) => {
      const h = 118 + messages.length * rowH + 40;
      return { spec: { width: W, height: Math.max(h, 300), top: 118, margin: 60, rowH, participants: parts(), messages, initialActive: ['main'] }, msgOf, baslik };
    };
    // kurulum: form öğelerini kendisi yaratır
    {
      const messages = [{ from: 'main', to: 'form', kind: 'create', label: '«create»' }];
      const msgOf = { form: 0 };
      ogeler.forEach((o) => {
        msgOf['yeni:' + o] = messages.length;
        messages.push({ from: 'form', to: o, kind: 'create', label: '«create» (this)' });
      });
      bolumler.push(yap(messages, msgOf, 'Kurulum'));
    }
    const ETIKET = { sehir: (v) => `sec("${v}")`, agirlik: (v) => `yaz(${v})`, soguk: (v) => `isaretle(${v})`, sigorta: (v) => `isaretle(${v})`, teslimat: (v) => `sec("${v}")` };
    prog.ops.forEach((op, k) => {
      const O = r.olaylar.filter((x) => x.i === k);
      const messages = [];
      const msgOf = {};
      const add = (key, m) => {
        msgOf[key] = messages.length;
        messages.push(m);
      };
      add('istek', { from: 'main', to: op.t, kind: 'call', label: ETIKET[op.t](op.v) });
      const red = O.find((x) => x.e === 'red');
      if (!red) {
        const kural = O.find((x) => x.e === 'kural');
        const s = kural ? kural.s : O[O.length - 1].s;
        add('bildir', { from: op.t, to: 'form', kind: 'call', label: 'degisti(this)' });
        add('oku:agirlik', { from: 'form', to: 'agirlik', kind: 'call', short: true, label: `kg() → ${s.kg}` });
        add('oku:sehir', { from: 'form', to: 'sehir', kind: 'call', short: true, label: `secili() → ${s.sehir == null ? 'null' : '"' + s.sehir + '"'}` });
        add('oku:soguk', { from: 'form', to: 'soguk', kind: 'call', short: true, label: `isaretli() → ${s.soguk}` });
        if (prog.sigorta) add('oku:sigorta', { from: 'form', to: 'sigorta', kind: 'call', short: true, label: `isaretli() → ${s.sigorta}` });
        add('ayarla', { from: 'form', to: 'teslimat', kind: 'call', label: `ayarla(${kural.hizli}, ${kural.dolap})` });
        const son = O[O.length - 1].s;
        add('goster', { from: 'form', to: 'ucret', kind: 'call', label: `goster(${son.tl})` });
        add('ret', { from: 'form', to: op.t, kind: 'return', label: '' });
        add('retm', { from: op.t, to: 'main', kind: 'return', label: '' });
      } else add('red', { from: op.t, to: 'main', kind: 'return', label: 'kapalı: seçilmedi, haber yok' });
      bolumler.push(yap(messages, msgOf, `${k + 1}. işlem · ${MD.istekSatiri(op).replace(/^form\./, '').replace(/;$/, '')}`));
    });
    bolumler.push(yap([{ from: 'main', to: 'form', kind: 'call', label: 'ozet()' }, { from: 'form', to: 'main', kind: 'return', label: '"Gönderi: …"' }], { ozet: 0, ret: 1 }, 'Sonuç · ozet()'));
    return { bolumler, run: r };
  };
})();
