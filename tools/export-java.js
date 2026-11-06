#!/usr/bin/env node
/*
 * Uygulamadaki Java kodlarını derlenebilir .java dosyalarına aktarır.
 * Kodların tek kaynağı: js/patterns/<kalip>/data.js  →  çıktı: java/<paket>/...
 *
 * Kullanım (proje klasöründe):   node tools/export-java.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'java');

// data.js dosyaları tarayıcı için yazıldı; sahte bir `window` ile yükleyelim.
const sandbox = { window: { DP: {} } };
vm.createContext(sandbox);
['factory-method', 'abstract-factory', 'singleton', 'builder', 'prototype', 'adapter', 'bridge', 'composite', 'decorator', 'facade', 'flyweight', 'proxy', 'chain-of-responsibility', 'command', 'mediator', 'memento', 'observer', 'state', 'strategy'].forEach((p) => {
  vm.runInContext(fs.readFileSync(path.join(ROOT, `js/patterns/${p}/data.js`), 'utf8'), sandbox);
});
const DP = sandbox.window.DP;

const written = [];
function write(pkg, name, code, source) {
  const dir = path.join(OUT, ...pkg.split('.'));
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, name + '.java');
  const header = `// Bu dosya tools/export-java.js ile ${source} içinden üretildi.\n`;
  fs.writeFileSync(file, `${header}package ${pkg};\n\n${code}\n`, 'utf8');
  written.push(path.relative(ROOT, file));
}

// ================================================================== Factory Method
(function () {
  const FM = DP.fm;
  const src = 'js/patterns/factory-method/data.js';
  const V = FM.variantOrder.map((k) => FM.variants[k]);

  // Kalıplı çözüm: üç somut yaratıcı + üç somut ürün
  const cozum = 'factorymethod.cozum';
  write(cozum, 'TasimaAraci', FM.code.TasimaAraci, src);
  write(cozum, 'Lojistik', FM.code.Lojistik, src);
  V.forEach((v) => {
    write(cozum, v.product, FM.code.product(v), src);
    write(cozum, v.creator, FM.code.creator(v), src);
  });
  write(cozum, 'Main', FM.code.mainAll, src);

  // Kalıpsız sürüm 3.0 ("Sorun" sahnesi): if/else ile Kamyon, Gemi, Uçak
  const sorun = 'factorymethod.sorun';
  const naive = FM.naive[2];
  write(sorun, 'Lojistik', naive.lojistik, src);
  write(sorun, 'Main', naive.main, src);
  V.forEach((v) => write(sorun, v.product, FM.code.plain(v), src));
})();

// ================================================================== Abstract Factory
(function () {
  const AF = DP.af;
  const src = 'js/patterns/abstract-factory/data.js';
  const Fam = AF.familyOrder.map((k) => AF.families[k]);

  // Kalıplı çözüm: üç aile (Kara, Deniz, Hava) + testlerdeki sahte aile
  const cozum = 'abstractfactory.cozum';
  write(cozum, 'TasimaAraci', AF.code.TasimaAraci, src);
  write(cozum, 'TasimaBelgesi', AF.code.TasimaBelgesi, src);
  write(cozum, 'LojistikFabrikasi', AF.code.LojistikFabrikasi, src);
  Fam.forEach((f) => {
    write(cozum, f.factory, AF.code.factory(f), src);
    write(cozum, f.vehicle, AF.code.vehicle(f), src);
    write(cozum, f.doc, AF.code.doc(f), src);
  });
  write(cozum, 'Gumruk', AF.code.Gumruk, src);
  write(cozum, 'TeslimatServisi', AF.code.TeslimatServisi, src);
  write(cozum, 'Main', AF.code.mainAll, src);
  write(cozum, 'TestFabrikasi', AF.code.TestFabrikasi, src);

  // Kalıpsız sürüm 2.0 ("Sorun" sahnesi): iki ayrı switch — Hava için belge unutuldu, gümrükte patlar
  const sorun = 'abstractfactory.sorun';
  const naive = AF.naive[1];
  write(sorun, 'TasimaAraci', AF.code.TasimaAraci, src);
  write(sorun, 'TasimaBelgesi', AF.code.TasimaBelgesi, src);
  Fam.forEach((f) => write(sorun, f.vehicle, AF.code.vehicle(f), src));
  Fam.filter((f) => !f.extension).forEach((f) => write(sorun, f.doc, AF.code.doc(f), src));
  write(sorun, 'Gumruk', AF.code.Gumruk, src);
  write(sorun, 'TeslimatServisi', naive.servis, src);
  write(sorun, 'Main', naive.main, src);
})();

// ================================================================== Singleton
(function () {
  const SG = DP.sg;
  const src = 'js/patterns/singleton/data.js';

  // Kalıpsız sürüm 2.0 ("Sorun" sahnesi): iki masa, iki üretici → aynı numara iki kez
  const naive = SG.naive[1].files;
  Object.keys(naive).forEach((name) => write('singleton.sorun', name, naive[name], src));

  // Kalıplı çözüm (tembel Singleton) + test koşucusu ("Eleştiri" sahnesi)
  const cozum = 'singleton.cozum';
  ['TakipNoUretici', 'SiparisServisi', 'IadeServisi', 'Main', 'UreticiTesti'].forEach((name) => write(cozum, name, SG.code[name], src));

  // Bağımlılık enjeksiyonu sürümü ("Eleştiri" sahnesi)
  Object.keys(SG.di).forEach((name) => write('singleton.di', name, SG.di[name], src));

  // Thread yarışı: altı gerçekleştirim, her biri kendi paketinde ("Thread Yarışı" sahnesi)
  SG.race.order.forEach((k) => {
    const v = SG.race.variants[k];
    const pkg = 'singleton.yaris.' + k;
    write(pkg, 'TakipNoUretici', v.code, src);
    write(pkg, 'Veritabani', SG.code.Veritabani, src);
    write(pkg, 'YarisDeneyi', SG.race.yarisDeneyi(v.access), src);
  });

  // Yansıma ve serileştirme saldırıları ("Kırmak" sahnesi)
  ['acik', 'korumali', 'enumile'].forEach((k) => {
    const a = SG.attack[k];
    const pkg = 'singleton.kirmak.' + k;
    write(pkg, 'TakipNoUretici', a.uretici, src);
    write(pkg, 'YansimaSaldirisi', a.yansima, src);
    write(pkg, 'SerilestirmeSaldirisi', a.serilestirme, src);
  });
})();

// ================================================================== Builder
(function () {
  const BL = DP.bl;
  const src = 'js/patterns/builder/data.js';

  // Kalıpsız sürüm 2.0: teleskop kurucular — cam vazo yanlış seçeneklerle oluşur ("Sorun" sahnesi)
  write('builder.sorun.teleskop', 'Gonderi', BL.naive.v2.Gonderi, src);
  write('builder.sorun.teleskop', 'Main', BL.naive.v2.Main, src);
  // Kalıpsız sürüm 3.0: set metotları (JavaBeans) — sigortasız kırılgan gönderi
  write('builder.sorun.javabeans', 'Gonderi', BL.naive.v3.Gonderi, src);
  write('builder.sorun.javabeans', 'Main', BL.naive.v3.Main, src);

  // Bölüm A: akıcı Builder (Effective Java) + Canlı Akış'taki üç program
  const cozum = 'builder.cozum';
  write(cozum, 'Gonderi', BL.code.Gonderi, src);
  write(cozum, 'Main', BL.code.Main, src);
  BL.presetOrder.forEach((k) => write(cozum, BL.presets[k].cls, BL.code.preset(BL.presets[k]), src));

  // Bölüm B: GoF Builder — Yönetici + dört hazırlayıcı (JSON "Genişlet" sahnesinde eklenir)
  const gof = 'builder.yonetici';
  ['GonderiHazirlayici', 'Gonderi', 'EtiketHazirlayici', 'FiyatHazirlayici', 'JsonHazirlayici', 'GonderiYoneticisi'].forEach((name) => write(gof, name, BL.gof[name], src));
  write(gof, 'Main', BL.gof.main('asi', true), src);
})();

// ================================================================== Prototype
(function () {
  const PT = DP.pt;
  const src = 'js/patterns/prototype/data.js';

  // Kalıpsız sürüm 2.0 ("Sorun" sahnesi): instanceof zinciri — yeni PaletGonderisi'nde çöker
  const naive = PT.naive(2);
  Object.keys(naive).forEach((name) => write('prototype.sorun', name, naive[name], src));

  // Kalıplı çözüm: her gönderi kendini kopyalar (kopyala() + kopya kurucular)
  const cozum = 'prototype.cozum';
  ['AdresServisi', 'Gonderi', 'SiparisEkrani', 'Main'].forEach((name) => write(cozum, name, PT.code[name], src));
  PT.altOrder.forEach((k) => write(cozum, PT.ALT[k].cls, PT.code[PT.ALT[k].cls], src));

  // Sığ ↔ Derin: kopya kurucudaki tek satır farklı ("Sığ ↔ Derin" sahnesi)
  ['sig', 'derin'].forEach((m) => PT.kopya.files(m).forEach((f) => write('prototype.kopya.' + m, f.name.replace('.java', ''), f.code, src)));

  // Java'da clone(): yerleşik yolun tuzakları ve önerilen kopya kurucu (derlenmeyen "final" sürümü hariç)
  ['tuzak', 'unutulan', 'duzeltme', 'kurucu'].forEach((v) => {
    const pkg = 'prototype.klon.' + v;
    write(pkg, 'Koli', PT.klon.variants[v], src);
    write(pkg, 'Main', PT.klon.mainOf(v), src);
  });

  // Prototip yöneticisi: şablon kataloğu ("Katalog" sahnesi)
  const katalog = 'prototype.katalog';
  ['AdresServisi', 'Gonderi'].forEach((name) => write(katalog, name, PT.code[name], src));
  PT.altOrder.forEach((k) => write(katalog, PT.ALT[k].cls, PT.code[PT.ALT[k].cls], src));
  write(katalog, 'SablonKatalogu', PT.katalog.SablonKatalogu, src);
  write(katalog, 'Main', PT.katalog.Main, src);
})();

// ================================================================== Adapter
(function () {
  const AD = DP.ad;
  const src = 'js/patterns/adapter/data.js';
  const C = AD.code;

  // Kalıpsız sürüm 3.0 ("Sorun" sahnesi): servisler GlobalShip'i doğrudan kullanır — iade 12 lb bildirilir
  const naive = AD.naive('v3');
  Object.keys(naive).forEach((name) => write('adapter.sorun', name, naive[name], src));

  // Kalıplı çözüm: nesne adaptörü (GlobalShipAdaptoru)
  const cozum = 'adapter.cozum';
  ['KargoFirmasi', 'HizliKargo', 'GlobalShipApi', 'ShipmentRequest', 'GlobalShipAdaptoru', 'GonderiServisi', 'IadeServisi', 'Main'].forEach((name) => write(cozum, name, C[name], src));

  // Canlı Akış'taki tek gönderi
  AD.akis.files().forEach((f) => write('adapter.akis', f.name.replace('.java', ''), f.code, src));

  // Nesne ↔ sınıf adaptörü (derlenmeyen iki varyant hariç: sizintiNesne, finalSinif)
  [
    ['nesne', 'nesne'],
    ['sinif', 'sinif'],
    ['sizintiSinif', 'sizinti'],
    ['finalNesne', 'finalnesne'],
  ].forEach(([k, pkg]) => {
    const files = AD.sinif.filesOf(k);
    Object.keys(files).forEach((name) => write('adapter.bicim.' + pkg, name, files[name], src));
  });

  // Genişlet: ikinci yabancı ortak EuroCargo için ikinci adaptör
  const gen = 'adapter.genislet';
  ['KargoFirmasi', 'HizliKargo', 'GlobalShipApi', 'ShipmentRequest', 'GlobalShipAdaptoru', 'GonderiServisi'].forEach((name) => write(gen, name, C[name], src));
  write(gen, 'EuroCargoClient', AD.euro.client, src);
  write(gen, 'EuroCargoAdaptoru', AD.euro.adaptor, src);
  write(gen, 'Main', AD.euro.Main, src);
})();

// ================================================================== Bridge
(function () {
  const BR = DP.br;
  const src = 'js/patterns/bridge/data.js';
  const C = BR.code;
  const base = ['Gonderi', 'Yazici', 'ZebraYazici', 'PdfYazici', 'TermalYazici', 'Etiket', 'KirilacakEtiket', 'IadeEtiketi'];

  // Kalıpsız sürüm 3.1 ("Sorun" sahnesi): her (etiket × yazıcı) eşleşmesi bir sınıf — ^CI28 bir sınıfta unutuldu
  const naive = BR.naive('v4');
  Object.keys(naive).forEach((name) => write('bridge.sorun', name, naive[name], src));

  // Kalıplı çözüm: Etiket (soyutlama) ↔ Yazici (gerçekleştirici) köprüsü
  base.forEach((name) => write('bridge.cozum', name, C[name], src));
  write('bridge.cozum', 'Main', C.Main, src);

  // Canlı Akış'taki iki eşleşme
  BR.presetOrder.forEach((k) => BR.akisFiles(BR.presets[k]).forEach((f) => write('bridge.akis.' + k.toLowerCase(), f.name.replace('.java', ''), f.code, src)));

  // Eşleştirme tezgâhı: aynı etiket başka yazıcıda, aynı yazıcı başka etikette, çalışma anında yazıcı değiştirme
  base.forEach((name) => write('bridge.tezgah', name, C[name], src));
  write('bridge.tezgah', 'Main', C.TezgahMain, src);

  // Genişlet: yeni gerçekleştirici HtmlYazici, etiket sınıflarına dokunmadan
  base.concat('HtmlYazici').forEach((name) => write('bridge.genislet', name, C[name], src));
  write('bridge.genislet', 'Main', BR.ext.Main, src);
})();

// ================================================================== Composite
(function () {
  const CP = DP.cp;
  const src = 'js/patterns/composite/data.js';
  const C = CP.code;
  const base = ['Parca', 'Urun', 'Koli'];

  // Kalıpsız sürüm 3.1 ("Sorun" sahnesi): iki listeli koli, iç içe döngüler — saat kutusu sayılmıyor (3100 g)
  const naive = CP.naive('v4');
  Object.keys(naive).forEach((name) => write('composite.sorun', name, naive[name], src));

  // Kalıplı çözüm: ürün de koli de Parca; koli içindekilere sorar (özyineleme)
  base.forEach((name) => write('composite.cozum', name, C[name], src));
  write('composite.cozum', 'Main', C.Main, src);

  // Canlı Akış'taki iki tarif: agirlik (son sıra) · listele (ön sıra)
  CP.presetOrder.forEach((k) => CP.akisFiles(CP.presets[k]).forEach((f) => write('composite.akis.' + k.toLowerCase(), f.name.replace('.java', ''), f.code, src)));

  // Paketleme tezgâhı: yeni dal (hediye kutusu, balonlu poşet) — Koli ve Urun değişmeden
  base.forEach((name) => write('composite.tezgah', name, C[name], src));
  write('composite.tezgah', 'Main', C.TezgahMain, src);

  // Şeffaf tasarım: ekle() Parca'da; ürünün içine ekleme çalışma anında istisna (bilerek çöker)
  write('composite.seffaf', 'Parca', C.ParcaSeffaf, src);
  write('composite.seffaf', 'Urun', C.Urun, src);
  write('composite.seffaf', 'Koli', C.KoliSeffaf, src);
  write('composite.seffaf', 'Main', CP.mainFor(CP.TEZGAH_DAL, { mode: 'seffaf', action: 'ikisi', bad: CP.TEZGAH_BAD }), src);

  // Genişlet: yeni bileşik Palet, hiçbir sınıfa dokunmadan
  base.concat('Palet').forEach((name) => write('composite.genislet', name, C[name], src));
  write('composite.genislet', 'Main', CP.ext.Main, src);
})();

// ================================================================== Decorator
(function () {
  const DC = DP.dc;
  const src = 'js/patterns/decorator/data.js';
  const C = DC.code;
  const base = ['KargoHizmeti', 'StandartKargo', 'ZarfKargo', 'EkHizmet', 'Ekspres', 'Sigorta', 'SogukZincir', 'SmsBildirim', 'KurumsalIndirim'];

  // Kalıpsız sürüm 3.1 ("Sorun" sahnesi): her kombinasyon bir alt sınıf — zamda bir sınıf unutuldu (180 TL)
  const naive = DC.naive('v4');
  Object.keys(naive).forEach((name) => write('decorator.sorun', name, naive[name], src));

  // Kalıplı çözüm: ek hizmetler çekirdeği saran katmanlar
  base.forEach((name) => write('decorator.cozum', name, C[name], src));
  write('decorator.cozum', 'Main', C.Main, src);

  // Canlı Akış'taki iki tarif
  DC.presetOrder.forEach((k) => DC.akisFiles(DC.presets[k]).forEach((f) => write('decorator.akis.' + k.toLowerCase(), f.name.replace('.java', ''), f.code, src)));

  // Sipariş tezgâhı: katman sırası (112 ≠ 120) ve aynı katman iki kez
  base.forEach((name) => write('decorator.tezgah', name, C[name], src));
  write('decorator.tezgah', 'Main', DC.tezgahDemo, src);

  // Genişlet: yeni katman HediyePaketi, hiçbir sınıfa dokunmadan
  base.concat('HediyePaketi').forEach((name) => write('decorator.genislet', name, C[name], src));
  write('decorator.genislet', 'Main', DC.ext.Main, src);
})();

// ================================================================== Facade
(function () {
  const FC = DP.fc;
  const src = 'js/patterns/facade/data.js';
  const put = (pkg, F) => Object.keys(F).forEach((name) => write(pkg, name, F[name], src));

  // Kalıpsız sürüm 2.1 ("Sorun" sahnesi): iş akışı istemcilerde — web sitesinde kart limiti unutuldu, hayalet gönderi
  put('facade.sorun', FC.naiveFiles('v3'));

  // Facade ile çözüm: GonderiCephesi iş akışını ve kuralları toplar; istemciler tek çağrı yapar
  put('facade.cozum', FC.filesFor(FC.COZUM));

  // Canlı Akış'taki iki tarif
  FC.presetOrder.forEach((k) => FC.akisFiles(FC.presets[k]).forEach((f) => write('facade.akis.' + k, f.name.replace('.java', ''), f.code, src)));

  // Cephe tezgâhı: üç istemci, üç değişiklik isteği (kart limiti, sigorta, kurye API'si) — kalıpsız ve cepheli
  [
    ['kalipsiz', 'naive'],
    ['cepheli', 'cephe'],
  ].forEach(([pkg, design]) => put('facade.tezgah.' + pkg, FC.tezgahFiles({ design, n: 3, limit: true, sigorta: true, kurye: true })));

  // Genişlet: yeni istemci KurumsalApi, alt sistemlerin hiçbirini tanımadan
  put('facade.genislet', FC.filesFor(FC.ext.prog));
})();

// ================================================================== Flyweight
(function () {
  const FL = DP.fl;
  const src = 'js/patterns/flyweight/data.js';
  const put = (pkg, F) => Object.keys(F).forEach((name) => write(pkg, name, F[name], src));

  // Kalıpsız sürüm 2.0 ("Sorun" sahnesi): her nokta kendi ikonunu yükler — kurye tabletinde (-Xmx64m) OutOfMemoryError
  put('flyweight.sorun', FL.naiveFiles('v2'));

  // Kestirme sürüm 2.1: bütün nokta türe göre paylaşılır — bellek düzelir, harita yanlış çizilir
  put('flyweight.kestirme', FL.naiveFiles('v3'));

  // Flyweight ile çözüm: IsaretTuru (paylaşılan, değişmez), IsaretFabrikasi (havuz), HaritaNoktasi (dışsal durum)
  put('flyweight.cozum', FL.filesFor('flyweight', FL.COZUM));

  // Canlı Akış'taki üç gönderi
  FL.akisFiles(FL.presets.uc).forEach((f) => write('flyweight.akis', f.name.replace('.java', ''), f.code, src));

  // Genişlet: paylaşılmayan DepoIsareti, hiçbir sınıfa dokunmadan (Canlı Akış'taki "Depolu harita" tarifi)
  put('flyweight.genislet', FL.filesFor('flyweight', FL.ext.prog));
})();

// ================================================================== Proxy
(function () {
  const PX = DP.px;
  const src = 'js/patterns/proxy/data.js';
  const C = PX.code;
  const base = ['TakipServisi', 'GlobalShipTakip', 'TakipVekili', 'Musteri'];

  // Kalıpsız sürüm 3.1 ("Sorun" sahnesi): denetim istemcilerin içinde — mobilde KVKK unutuldu, Ali'nin adresi sızar
  const naive = PX.naive('v4');
  Object.keys(naive).forEach((name) => write('proxy.sorun', name, naive[name], src));

  // Kalıplı çözüm: TakipVekili araya girer (koruma, önbellek, sanal); istemcilerde tek satır denetim yok
  base.concat(['MusteriPaneli', 'MobilUygulama']).forEach((name) => write('proxy.cozum', name, C[name], src));
  write('proxy.cozum', 'Main', C.Main, src);

  // Canlı Akış'taki iki tarif
  PX.presetOrder.forEach((k) => PX.akisFiles(PX.presets[k]).forEach((f) => write('proxy.akis.' + k, f.name.replace('.java', ''), f.code, src)));

  // Vekil tezgâhı: aynı meraklı müşteri trafiği — vekilsiz (iki sızıntı) ve tam vekilli
  [
    ['vekilsiz', PX.TZ_VEKILSIZ],
    ['vekilli', PX.TZ_VEKILLI],
  ].forEach(([pkg, cfg]) => {
    const F = PX.tezgahFiles(cfg);
    Object.keys(F).forEach((name) => write('proxy.tezgah.' + pkg, name, F[name], src));
  });

  // Genişlet: yeni istemci SmsBildirim, sıfır denetim kodu
  base.concat('SmsBildirim').forEach((name) => write('proxy.genislet', name, C[name], src));
  write('proxy.genislet', 'Main', PX.ext.Main, src);
})();

// ================================================================== Chain of Responsibility
(function () {
  const CR = DP.cr;
  const src = 'js/patterns/chain-of-responsibility/data.js';
  const put = (pkg, F) => Object.keys(F).forEach((name) => write(pkg, name, F[name], src));

  // Kalıpsız sürüm 2.1 ("Sorun" sahnesi): kararlar kuryelerin if/else merdiveninde — İstanbul kopyasında ilaç dolaba girer
  put('chainofresponsibility.sorun', CR.naiveFiles('v3'));

  // Chain of Responsibility ile çözüm: TeslimatAdimi halkaları; Main aynı sınıflarla Malatya ve İstanbul zincirini kurar
  put('chainofresponsibility.cozum', CR.filesFor(CR.COZUM));

  // Canlı Akış'taki iki tarif
  CR.presetOrder.forEach((k) => CR.akisFiles(CR.presets[k]).forEach((f) => write('chainofresponsibility.akis.' + k, f.name.replace('.java', ''), f.code, src)));

  // Zincir tezgâhı: aynı halkalar, üç zincir — dolap önce, şube önce (sıra = öncelik), iadesiz (KAYIP)
  [
    ['dolaponce', CR.ISTANBUL],
    ['subeonce', CR.SUBE_ONCE],
    ['iadesiz', CR.IADESIZ],
  ].forEach(([pkg, keys]) => put('chainofresponsibility.tezgah.' + pkg, CR.tezgahFiles(keys)));

  // Genişlet: yeni halka MarketeTeslim; kurye ve öbür halkalar değişmeden
  put('chainofresponsibility.genislet', CR.filesFor(CR.ext.prog));
})();

// ================================================================== Command
(function () {
  const CM = DP.cmd;
  const src = 'js/patterns/command/data.js';
  const put = (pkg, F) => Object.keys(F).forEach((name) => write(pkg, name, F[name], src));

  // Kalıpsız sürüm 2.1 ("Sorun" sahnesi): dizgi + switch; ikinci "geri al" boşa gider, gece 02:00'de "YÜKLE" yüzünden çöker
  put('command.sorun', CM.naiveFiles('v3'));

  // Command ile çözüm: TasiKomutu, YukleKomutu; panel geçmiş/ileri yığını, gece işi komut kuyruğu tutar
  put('command.cozum', CM.filesFor(CM.COZUM));

  // Canlı Akış'taki iki tarif
  CM.presetOrder.forEach((k) => CM.akisFiles(CM.presets[k]).forEach((f) => write('command.akis.' + k, f.name.replace('.java', ''), f.code, src)));

  // Komut tezgâhı: aynı oturum (iki hata, iki geri al) — kalıpsız ve komutlu
  [
    ['kalipsiz', 'naive'],
    ['komutlu', 'komut'],
  ].forEach(([pkg, design]) => put('command.tezgah.' + pkg, CM.tezgahFiles({ design, ops: CM.GUN })));

  // Genişlet: MakroKomut — üç yükleme tek komut, tek "geri al" hepsini ters sırayla geri alır
  put('command.genislet', CM.filesFor(CM.ext.prog));
})();

// ================================================================== Mediator
(function () {
  const MD = DP.med;
  const src = 'js/patterns/mediator/data.js';
  const put = (pkg, F) => Object.keys(F).forEach((name) => write(pkg, name, F[name], src));

  // Kalıpsız sürüm 2.0 ("Sorun" sahnesi): öğeler birbirini tanıyor; dolap kuralının iki kopyası soğuk zinciri bilmiyor —
  // önce soğuk zincir, sonra şehir seçilince soğuk zincirli ilaç dolaba gidiyor
  put('mediator.sorun', MD.naiveFiles('v2b'));

  // Mediator ile çözüm: FormYoneticisi, FormOgesi; kuralların hepsi GonderiFormu.degisti() içinde
  put('mediator.cozum', MD.filesFor(MD.COZUM));

  // Canlı Akış'taki iki tarif
  MD.presetOrder.forEach((k) => MD.akisFiles(MD.presets[k]).forEach((f) => write('mediator.akis.' + k, f.name.replace('.java', ''), f.code, src)));

  // Form tezgâhı: aynı tıklamalar (soğuk zincir, Malatya, 2 kg, Dolap) — dağınık, kopyalı, Mediator
  [
    ['daginik', 'v2'],
    ['kopyali', 'kopyali'],
    ['mediator', 'mediator'],
  ].forEach(([pkg, design]) => put('mediator.tezgah.' + pkg, MD.tezgahFiles({ design, ops: MD.TEZGAH_ANA })));

  // Yapı sahnesindeki tuzak: teslimat seçici yöneticinin ayarını yeniden bildirir → StackOverflowError
  put('mediator.tuzak', MD.filesFor(MD.tuzak('dongu')));

  // Genişlet: SigortaKutusu — yeni öğe; öteki öğeler değişmeden, yalnızca yönetici değişir
  put('mediator.genislet', MD.filesFor(MD.ext.prog));
})();

// ================================================================== Memento
(function () {
  const MN = DP.mnt;
  const src = 'js/patterns/memento/data.js';
  const put = (pkg, F) => Object.keys(F).forEach((name) => write(pkg, name, F[name], src));

  // Kalıpsız sürüm 2.0 ("Sorun" sahnesi): yedeği defter alıyor (get/set); depoya eklenen kamyon yedeklenmiyor —
  // geri yüklemeden sonra koliler hem rafta hem kamyonda
  put('memento.sorun', MN.naiveFiles('v2'));

  // Memento ile çözüm: Depo kendi hatırasını oluşturur (Depo.Hatira, alanları özel), defter yalnızca saklar
  put('memento.cozum', MN.filesFor(MN.COZUM));

  // Canlı Akış'taki iki tarif
  MN.presetOrder.forEach((k) => MN.akisFiles(MN.presets[k]).forEach((f) => write('memento.akis.' + k, f.name.replace('.java', ''), f.code, src)));

  // Yedek tezgâhı: aynı oturum (kaydet, iki yükleme, bir taşıma, geri yükle) — referans, kopya ve hatıra
  ['referans', 'kopya', 'hatira'].forEach((design) => put('memento.tezgah.' + design, MN.tezgahFiles({ design, ops: MN.TEZGAH_ANA })));

  // Genişlet: DepoGecmisi — her işlemden önce hatıra; geri al / yinele (Depo ve defter değişmeden)
  put('memento.genislet', MN.filesFor(MN.ext.prog));
})();

// ================================================================== Observer
(function () {
  const OB = DP.obs;
  const src = 'js/patterns/observer/data.js';
  const put = (pkg, F) => Object.keys(F).forEach((name) => write(pkg, name, F[name], src));

  // Kalıpsız sürüm 2.0 ("Sorun" sahnesi): Gonderi ekranları adıyla çağırıyor; teslimEt tableti unutuyor —
  // panel "Teslim edildi" derken kurye tableti gönderiyi hâlâ rotada gösteriyor
  put('observer.sorun', OB.naiveFiles('v2'));

  // Observer ile çözüm: GonderiGozlemcisi arayüzü, abone listesi ve tek bildir(); Main abone eder
  put('observer.cozum', OB.filesFor(OB.COZUM));

  // Canlı Akış'taki iki tarif
  OB.presetOrder.forEach((k) => OB.akisFiles(OB.presets[k]).forEach((f) => write('observer.akis.' + k, f.name.replace('.java', ''), f.code, src)));

  // Abonelik tezgâhı: aynı oturum (iki gönderi, Ali SMS'leri kapatır, 1001 teslim edilir) — doğrudan çağrı, sabit liste, Observer
  ['dogrudan', 'sabit', 'observer'].forEach((design) => put('observer.tezgah.' + design, OB.tezgahFiles({ design, ops: OB.TEZGAH_ANA })));

  // Yapı sahnesindeki tuzak: telefon bildirim sırasında kendini listeden çıkarır → ConcurrentModificationException
  put('observer.tuzak', OB.filesFor(OB.tuzak('bas')));

  // Genişlet: CagriMerkezi — yeni gözlemci; Gonderi ve öteki ekranlar değişmeden
  put('observer.genislet', OB.filesFor(OB.ext.prog));
})();

// ================================================================== State
(function () {
  const ST = DP.sta;
  const src = 'js/patterns/state/data.js';
  const put = (pkg, F) => Object.keys(F).forEach((name) => write(pkg, name, F[name], src));

  // Kalıpsız sürüm 2.0 ("Sorun" sahnesi): durum bir dizgi, her metotta if/else — paketKoy'un else dalı KİLİTLİ'yi de
  // BOŞ sanır: kilitli dolaba Selin'in paketi konur, Ali'nin kodu artık çalışmaz
  put('state.sorun', ST.naiveFiles('v2'));

  // State ile çözüm: BosDurum, DoluDurum, KilitliDurum; KargoDolabi isteği o anki durum nesnesine devreder
  put('state.cozum', ST.filesFor(ST.COZUM));

  // Canlı Akış'taki iki tarif
  ST.presetOrder.forEach((k) => ST.akisFiles(ST.presets[k]).forEach((f) => write('state.akis.' + k, f.name.replace('.java', ''), f.code, src)));

  // Dolap tezgâhı: aynı oturum (kilit, ikinci paket, görevli, Ali) — kalıpsız ve durum nesneleriyle
  [
    ['kalipsiz', 'naive'],
    ['durumlu', 'durum'],
  ].forEach(([pkg, design]) => put('state.tezgah.' + pkg, ST.tezgahFiles({ design, ops: ST.SENARYO })));

  // Genişlet: HizmetDisiDurum — yeni durum sınıfı; BosDurum'da yalnızca gorevliAc'ın gövdesi değişir
  put('state.genislet', ST.filesFor(ST.ext.prog));
})();

// ================================================================== Strategy
(function () {
  const SG = DP.stg;
  const src = 'js/patterns/strategy/data.js';
  const put = (pkg, F) => Object.keys(F).forEach((name) => write(pkg, name, F[name], src));

  // Kalıpsız sürüm 2.0 ("Sorun" sahnesi): rota algoritmaları Kurye'nin içinde (String + if/else); SOGUK_ONCE dalı
  // ortak listeyi yerinde sıralıyor — öğleden sonra randevu sırası 1, 4, 3, 2 oluyor
  put('strategy.sorun', SG.naiveFiles('v2'));

  // Strategy ile çözüm: RotaStratejisi ve üç strateji; Kurye stratejiye listenin salt okunur görünümünü veriyor
  put('strategy.cozum', SG.filesFor(SG.COZUM));

  // Canlı Akış'taki iki tarif
  SG.presetOrder.forEach((k) => SG.akisFiles(SG.presets[k]).forEach((f) => write('strategy.akis.' + k, f.name.replace('.java', ''), f.code, src)));

  // Rota tezgâhı: aynı istekler (soğuk zincir önce, iki teslimat, randevu sırası, dört teslimat) — üç tasarım
  [
    ['ifelse', 'v2'],
    ['kalitim', 'kalitim'],
    ['strateji', 'strateji'],
  ].forEach(([pkg, design]) => put('strategy.tezgah.' + pkg, SG.tezgahFiles({ design, ops: SG.TEZGAH_ANA })));

  // Yapı sahnesindeki tuzak: durum tutan PlanliRota iki kuryeye birden verilir → IllegalStateException
  put('strategy.tuzak', SG.tuzakFiles('paylasim'));

  // Genişlet: AgirOnceRota — yeni strateji; Kurye ve öteki stratejiler değişmeden
  put('strategy.genislet', SG.filesFor(SG.ext.prog));
})();

console.log(written.length + ' dosya yazıldı:');
written.forEach((f) => console.log('  ' + f));
