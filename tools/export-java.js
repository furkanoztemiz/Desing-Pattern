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
['factory-method', 'abstract-factory', 'singleton', 'builder', 'prototype', 'adapter'].forEach((p) => {
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

console.log(written.length + ' dosya yazıldı:');
written.forEach((f) => console.log('  ' + f));
