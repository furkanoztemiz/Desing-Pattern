/*
 * GoF tasarım kalıpları kataloğu (ana sayfa).
 * `ready: true` olanların interaktif modülü vardır; diğerleri "yakında" olarak görünür.
 * Yeni bir kalıp eklendiğinde buradaki `ready` alanını true yapmanız yeterli.
 */
(function () {
  'use strict';

  DP.categories = [
    {
      id: 'creational',
      title: 'Yaratımsal Kalıplar',
      en: 'Creational',
      desc: 'Nesnelerin nasıl oluşturulacağını soyutlar; kodu somut sınıflardan bağımsızlaştırır.',
    },
    {
      id: 'structural',
      title: 'Yapısal Kalıplar',
      en: 'Structural',
      desc: 'Sınıf ve nesnelerin daha büyük yapılar oluşturacak şekilde nasıl birleştirileceğini anlatır.',
    },
    {
      id: 'behavioral',
      title: 'Davranışsal Kalıplar',
      en: 'Behavioral',
      desc: 'Nesneler arasındaki iletişimi ve sorumlulukların dağılımını düzenler.',
    },
  ];

  DP.catalog = [
    // Yaratımsal
    { id: 'factory-method', cat: 'creational', name: 'Factory Method', tr: 'Fabrika Metodu', ready: true,
      intent: 'Nesne oluşturmayı alt sınıflara bırakır; hangi sınıfın örnekleneceğine alt sınıf karar verir.' },
    { id: 'abstract-factory', cat: 'creational', name: 'Abstract Factory', tr: 'Soyut Fabrika', ready: true,
      intent: 'Birbiriyle ilişkili nesne ailelerini, somut sınıflarını belirtmeden oluşturur.' },
    { id: 'builder', cat: 'creational', name: 'Builder', tr: 'Yapıcı', ready: true,
      intent: 'Karmaşık bir nesneyi adım adım inşa eder; aynı süreçle farklı temsiller üretir.' },
    { id: 'prototype', cat: 'creational', name: 'Prototype', tr: 'Prototip', ready: true,
      intent: 'Yeni nesneleri, mevcut bir örneği kopyalayarak (klonlayarak) üretir.' },
    { id: 'singleton', cat: 'creational', name: 'Singleton', tr: 'Tekil Nesne', ready: true,
      intent: 'Bir sınıfın yalnızca tek örneği olmasını ve ona global erişimi garanti eder.' },
    // Yapısal
    { id: 'adapter', cat: 'structural', name: 'Adapter', tr: 'Adaptör', ready: true,
      intent: 'Uyumsuz bir arayüzü, istemcinin beklediği arayüze dönüştürür.' },
    { id: 'bridge', cat: 'structural', name: 'Bridge', tr: 'Köprü',
      intent: 'Soyutlamayı gerçekleştirimden ayırır; ikisi bağımsız olarak değişebilir.' },
    { id: 'composite', cat: 'structural', name: 'Composite', tr: 'Bileşik',
      intent: 'Nesneleri ağaç yapısında birleştirir; tekil ve bileşik nesnelere aynı şekilde davranılır.' },
    { id: 'decorator', cat: 'structural', name: 'Decorator', tr: 'Dekoratör',
      intent: 'Bir nesneye, alt sınıf oluşturmadan çalışma zamanında yeni sorumluluklar ekler.' },
    { id: 'facade', cat: 'structural', name: 'Facade', tr: 'Cephe',
      intent: 'Karmaşık bir alt sisteme sade ve tek bir giriş noktası sunar.' },
    { id: 'flyweight', cat: 'structural', name: 'Flyweight', tr: 'Sinek Sıklet',
      intent: 'Çok sayıdaki benzer nesnenin ortak durumunu paylaştırarak bellekten tasarruf eder.' },
    { id: 'proxy', cat: 'structural', name: 'Proxy', tr: 'Vekil',
      intent: 'Bir nesneye erişimi denetlemek için onun yerine geçen bir vekil sağlar.' },
    // Davranışsal
    { id: 'chain-of-responsibility', cat: 'behavioral', name: 'Chain of Responsibility', tr: 'Sorumluluk Zinciri',
      intent: 'Bir isteği, onu işleyebilecek nesneler zinciri boyunca iletir.' },
    { id: 'command', cat: 'behavioral', name: 'Command', tr: 'Komut',
      intent: 'Bir isteği nesne olarak paketler; kuyruğa alma, geri alma ve kayıt mümkün olur.' },
    { id: 'interpreter', cat: 'behavioral', name: 'Interpreter', tr: 'Yorumlayıcı',
      intent: 'Bir dilin gramerini sınıflarla temsil eder ve cümlelerini yorumlar.' },
    { id: 'iterator', cat: 'behavioral', name: 'Iterator', tr: 'Yineleyici',
      intent: 'Bir koleksiyonun elemanlarını, iç yapısını açığa çıkarmadan sırayla dolaşır.' },
    { id: 'mediator', cat: 'behavioral', name: 'Mediator', tr: 'Arabulucu',
      intent: 'Nesneler arasındaki karmaşık iletişimi tek bir arabulucu nesnede toplar.' },
    { id: 'memento', cat: 'behavioral', name: 'Memento', tr: 'Hatıra',
      intent: 'Bir nesnenin iç durumunu, kapsüllemeyi bozmadan kaydedip geri yükler.' },
    { id: 'observer', cat: 'behavioral', name: 'Observer', tr: 'Gözlemci',
      intent: 'Bir nesnedeki değişikliği, ona abone olan tüm nesnelere otomatik bildirir.' },
    { id: 'state', cat: 'behavioral', name: 'State', tr: 'Durum',
      intent: 'İç durumu değiştikçe nesnenin davranışını da değiştirir; sanki sınıfı değişmiş gibi.' },
    { id: 'strategy', cat: 'behavioral', name: 'Strategy', tr: 'Strateji',
      intent: 'Bir algoritma ailesini kapsüller; algoritmalar çalışma zamanında değiştirilebilir.' },
    { id: 'template-method', cat: 'behavioral', name: 'Template Method', tr: 'Şablon Metot',
      intent: 'Bir algoritmanın iskeletini tanımlar; bazı adımları alt sınıflara bırakır.' },
    { id: 'visitor', cat: 'behavioral', name: 'Visitor', tr: 'Ziyaretçi',
      intent: 'Nesne yapısındaki sınıfları değiştirmeden onlara yeni işlemler ekler.' },
  ];
})();
