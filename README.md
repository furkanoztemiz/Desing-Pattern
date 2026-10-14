# Tasarım Kalıpları Atölyesi

*Yazılım Tasarımı ve Mimarisi* dersi için tasarım kalıplarını **animasyonlar** ve **Java örnekleriyle**
anlatan interaktif ders materyali. Hazır modüller: yaratımsal kalıpların beşi — **Factory Method (Fabrika Metodu)**,
**Abstract Factory (Soyut Fabrika)**, **Singleton (Tekil Nesne)**, **Builder (Yapıcı)**, **Prototype (Prototip)** — ve
ilk yapısal kalıp **Adapter (Adaptör)**. Hepsi aynı lojistik dünyasında geçer, her biri bir öncekinin devamıdır.

- Kurulum yok, internet gerekmez: saf HTML + CSS + JavaScript.
- Her animasyon adımında ilgili Java satırı eşzamanlı vurgulanır.
- Projeksiyon için tasarlandı: klavyeyle/sunum kumandasıyla adım adım ilerler, yazı boyutu büyütülebilir.

## Çalıştırma

`index.html` dosyasına çift tıklayın (Chrome, Edge veya Firefox). Hepsi bu.

İsterseniz yerel bir sunucuyla da açabilirsiniz:

```bash
python -m http.server 8765
```

Ardından tarayıcıda `http://localhost:8765` adresine gidin.

## Factory Method modülü — 9 sahne

| # | Sahne | Ne gösterir? |
| --- | --- | --- |
| 1 | Giriş | Amaç (GoF tanımı), günlük hayattan benzetme, ders hedefleri |
| 2 | Sorun | Kalıpsız kodun sürüm sürüm bozulması: kod farkları (diff), bağımlılık grafiği, OCP/SRP teşhisi |
| 3 | Çözüm | Kalıpsız koddan Factory Method’a 4 adımlık yeniden düzenleme; UML adım adım oluşur |
| 4 | Yapı (UML) | Rollerin turu, “Somut örnek ↔ Genel yapı (GoF)” geçişi, tıklanabilir rol kartları |
| 5 | Canlı Akış ★ | Çalışma zamanının adım adım animasyonu: fabrika binası, sıralama diyagramı, sınıf diyagramı; Java kodu, çağrı yığını ve konsol eşzamanlı |
| 6 | Genişlet | Boşluk doldurma alıştırması: Hava lojistiğini **mevcut kodu değiştirmeden** ekleme (Açık/Kapalı İlkesi) |
| 7 | Gerçek Dünya | JDK’dan örnekler: `Collection.iterator()`, JDBC `createStatement()`, `URLStreamHandler`; sık karıştırılan kavramlar |
| 8 | Quiz | 8 soru (kodda satır seçme dahil) + sürükle-bırak rol eşleştirme |
| 9 | Özet | Tek sayfalık özet; yazdırılabilir (PDF) |

Önerilen akış: 1 → 9 sırayla, toplam 35–45 dakika. “Canlı Akış”ta önce **Kara**, sonra **Deniz** ile
aynı akışı izletin; “Genişlet” sahnesinden sonra **Hava** da Canlı Akış’ta seçilebilir hâle gelir.

## Abstract Factory modülü — 10 sahne

Senaryo: her gönderi artık bir **ürün ailesi** gerektiriyor — araç + taşıma belgesi
(Kara: Kamyon + CMR · Deniz: Gemi + Konşimento · Hava: Uçak + AWB). Araçla belge aynı aileden
değilse gümrük gönderiyi durdurur.

| # | Sahne | Ne gösterir? |
| --- | --- | --- |
| 1 | Giriş | Amaç (GoF), “takım” benzetmesi, Factory Method’dan farkı |
| 2 | Sorun | Aileyi iki ayrı `switch` seçiyor; yeni aile yarım eklenince program gerçekten `IllegalStateException` ile çöküyor. Gümrük kaydı ve araç × belge uyumluluk tablosu |
| 3 | Çözüm | 4 adımlık yeniden düzenleme: aile arayüzü → somut fabrikalar → kompozisyon → tek satırda aile seçimi |
| 4 | Yapı (UML) | Beş rolün turu; **UML ↔ aile matrisi** (satır = aile, sütun = ürün türü) geçişi |
| 5 | Canlı Akış ★ | İki hatlı fabrika (araç hattı + belge yazıcısı), belgenin araca takılması, gümrük kontrolü; sıralama ve sınıf diyagramı görünümleri |
| 6 | Genişlet | Yeni **aile** eklemek kolay (boşluk doldurma alıştırması); yeni **ürün türü** eklemek zor (gerçek `javac` hatalarıyla) ve Java 8 `default` metot ipucu |
| 7 | FM ↔ AF | İki kalıp yan yana: kalıtım ↔ kompozisyon, kararın yeri, ürün sayısı; sınav tablosu |
| 8 | Gerçek Dünya | Swing Look-and-Feel, JDBC sürücü ailesi, testte sahte aile (bağımlılık enjeksiyonu), Builder/Prototype ile farkı |
| 9 | Quiz | 8 soru + sürükle-bırak rol eşleştirme |
| 10 | Özet | Tek sayfalık özet; yazdırılabilir (PDF) |

Önerilen akış: Factory Method’dan hemen sonra, 1 → 10 sırayla, toplam 40–50 dakika.

## Singleton modülü — 11 sahne

Senaryo: her gönderiye bir **takip numarası** verilir (KRG-1001, KRG-1002…). Sipariş ve İade masaları
kendi `TakipNoUretici` nesnelerini oluşturunca aynı numara iki gönderiye verilir. Çözüm: üreticiden
programda **yalnızca bir** nesne olsun ve herkes ona `getInstance()` ile ulaşsın.

| # | Sahne | Ne gösterir? |
| --- | --- | --- |
| 1 | Giriş | Amaç (GoF), sıramatik benzetmesi, kalıbın iki sözü: tek örnek + global erişim noktası |
| 2 | Sorun | İki masa, iki numara makinesi: takip panosunda **ÇAKIŞMA**; bellekte iki nesne, iki sayaç; “sayaç static olsa?” tartışması |
| 3 | Çözüm | 4 adım: private kurucu (gerçek `javac` hatasıyla) → static alan → `getInstance()` → istemciler; UML adım adım oluşur |
| 4 | Yapı (UML) | Tek sınıfın üç parçası (static üyeler altı çizili, öz-ilişki, GoF notu); **UML ↔ bellek** görünümü: beş referans, tek nesne |
| 5 | Canlı Akış ★ | Tembel oluşturma adım adım: makine ilk çağrıda “doğar”, sonra hep aynısı döner; sahne, bellek (yığın/static/heap), sıralama ve sınıf diyagramı görünümleri |
| 6 | Thread Yarışı ★ | İki thread aynı anda `getInstance()` çağırıyor: kodda T1/T2 imleçleri, zaman çizelgesi, bellek ve kilit. Altı yazım (korumasız, `synchronized`, çift kontrol + `volatile`, erken, Holder, `enum`) ve karşılaştırma tablosu |
| 7 | Kırmak | Yansıma ve serileştirme saldırıları, kurucu kontrolü ve `readResolve()` savunmaları, `enum` kalkanı |
| 8 | Eleştiri | Gizli bağımlılık; tek başına geçen ama birlikte kalan testler; bağımlılık enjeksiyonu (DI) çözümü; ne zaman kullanılmalı |
| 9 | Gerçek Dünya | `Runtime.getRuntime()`, `Calendar.getInstance()` (Singleton **değil**!), loglama, Spring “singleton” kapsamı, static sınıf farkı |
| 10 | Quiz | 8 soru (kodda satır seçme dahil) + yazımları gruplara sürükle-bırak |
| 11 | Özet | Tek sayfalık özet; yazdırılabilir (PDF) |

Önerilen akış: Abstract Factory’den sonra, 1 → 11 sırayla, toplam 45–55 dakika. Zaman darsa
“Kırmak” ve “Gerçek Dünya” sahneleri ödev olarak bırakılabilir; **Thread Yarışı** sahnesini atlamayın.
Gösterilen tüm çıktılar (yarış dahil) gerçek Java 21 çalıştırmalarıyla doğrulanmıştır.

## Builder modülü — 10 sahne

Senaryo: gönderilerin seçenekleri çoğaldı (kırılgan, soğuk zincir, ekspres, sigorta). Teleskop kurucularda
yeri karışan iki `boolean` yüzünden cam vazo soğuk zincirle ve KIRILACAK etiketi olmadan yola çıkıyor.
Modül Builder’ın iki yüzünü de anlatır: **akıcı Builder** (Effective Java) ve **GoF Builder** (Director).

| # | Sahne | Ne gösterir? |
| --- | --- | --- |
| 1 | Giriş | Amaç (GoF), sandviççi benzetmesi, Builder’ın iki yüzü |
| 2 | Sorun | Teleskop kurucular; argüman şeridinde yeri karışan `boolean`’lar ve kırılan vazo; set metotlarıyla yarım kalan, sigortasız gönderi |
| 3 | Çözüm | 4 adım: iç sınıf → akıcı adımlar (`return this`) → `build()` (gerçek `javac` hatasıyla) → istemci zinciri |
| 4 | Canlı Akış ★ | Paketleme atölyesi: Builder formu adım adım dolar, paket yalnızca **plandır**; `build()` kontrol kapısından geçince değişmez nesne doğar. Üç tarif (biri bilerek hatalı); sıralama ve sınıf diyagramı görünümleri |
| 5 | Yönetici ★ | GoF Director: aynı tarif üç hazırlayıcıya uygulanır → paket nesnesi, etiket metni, fiyat. Her adımın her hazırlayıcıdaki gövdesi yan yana |
| 6 | Yapı (UML) | Dört rolün turu; getResult’ın neden arayüzde olmadığı; **GoF ↔ akıcı Builder** diyagram geçişi |
| 7 | Genişlet | Yeni **temsil** eklemek kolay (JSON hazırlayıcısı, boşluk doldurma); yeni **adım** eklemek zor (gerçek `javac` hatalarıyla) ve `default` metot |
| 8 | Gerçek Dünya | `StringBuilder`, `HttpRequest.newBuilder()`, `Locale.Builder` (adımda doğrulama), Lombok `@Builder`, diğer yaratımsal kalıplarla farkı |
| 9 | Quiz | 8 soru (kodda satır seçme dahil) + sürükle-bırak rol eşleştirme |
| 10 | Özet | Tek sayfalık özet; yazdırılabilir (PDF) |

Önerilen akış: Singleton’dan sonra, 1 → 10 sırayla, toplam 45–55 dakika. Canlı Akış’ta önce **Cam vazo**, sonra
**Eksik tarif**i izletin; Genişlet’teki JSON alıştırması çözülünce JSON hazırlayıcısı Yönetici sahnesinde de görünür.

## Prototype modülü — 10 sahne

Senaryo: bazı müşteriler her hafta **aynı** gönderiyi veriyor; sipariş ekranına “Geçen haftakini tekrarla”
düğmesi eklendi. Kalıpsız çözüm gönderinin türünü `instanceof` ile tanıyıp kopyayı sıfırdan kuruyor
(yavaş adres servisi her kopyada yeniden çağrılıyor) ve yeni `PaletGonderisi` gelince çöküyor.
Çözüm: her gönderi **kendi kopyasını** üretir — `son.kopyala()`.

| # | Sahne | Ne gösterir? |
| --- | --- | --- |
| 1 | Giriş | Amaç (GoF), fotokopi benzetmesi, kopyalamanın asıl tuzağı: derinlik |
| 2 | Sorun | Sipariş masası: `instanceof` panosu türleri tek tek sorar, kopya sıfırdan kurulur, adres servisi gereksiz yere çağrılır; Palet’te gerçek `IllegalArgumentException` |
| 3 | Çözüm | 3 adım: soyut `kopyala()` (gerçek `javac` hatasıyla) → kopya kurucular → istemci tek satır; getter’lar da gereksizleşir |
| 4 | Sığ ↔ Derin ★ | Kopya kurucudaki **tek satır** değişir: depo görünümünde kutular, içerik panoları ve ipler; bellek görünümünde referans okları. Sığ kopyada “zımba” şablonu ve gelecek haftayı kirletir |
| 5 | Java’da clone() ★ | `Cloneable` + `super.clone()` ve dört tuzağı: kurucu çalışmaz (aynı takip no), sığlık, unutulan `Cloneable` (çalışma anında istisna), `final` alanlar (gerçek `javac` hatası); kopya kurucu ile karşılaştırma |
| 6 | Yapı (UML) | Rollerin turu, kovaryant dönüş tipi, **GoF ↔ katalog** diyagram geçişi, Factory Method ile fark |
| 7 | Katalog | Prototip yöneticisi (boşluk doldurma alıştırması); çalışma anında **yeni sınıf yazmadan** yeni şablon; `return sablon;` hatası |
| 8 | Gerçek Dünya | `new ArrayList<>(liste)` (sığ), `dizi.clone()` (tek/iki boyut), `List.copyOf` (değişmez kopya), sık karıştırılanlar (Spring “prototype” kapsamı) |
| 9 | Quiz | 8 soru (kodda satır seçme dahil) + sürükle-bırak rol eşleştirme |
| 10 | Özet | Tek sayfalık özet; yazdırılabilir (PDF) |

Önerilen akış: Builder’dan sonra, 1 → 10 sırayla, toplam 45–55 dakika. Sığ ↔ Derin sahnesinde “buHafta.ekle”
adımında durup üstteki **Sığ / Derin** düğmesiyle iki kipi karşılaştırın; **Bellek** görünümü aynı anı oklarla gösterir.
Gösterilen tüm çıktılar ve derleyici hataları gerçek Java 21 çalıştırmalarıyla doğrulanmıştır.

## Adapter modülü — 10 sahne

Senaryo: şirket yurt dışına açılıyor; ortak firma GlobalShip’in Java kütüphanesi bizim `KargoFirmasi` arayüzümüze
uymuyor: ağırlığı **pound** ister, gönderi numarası bir **sayı**, durum bir **kod**. Kütüphane üçüncü parti olduğu için
değiştirilemez. Kalıpsız çözümde servisler yabancı API’yi doğrudan öğrenir; çeviri kodu kopyalanır ve iade servisinde
kg → lb dönüşümü unutulur (aynı koli 12 lb bildirilir). Sahnelerde her arayüz bir **yapboz bağlantısıdır**
(yuvarlak = `KargoFirmasi`, kare = GlobalShip, üçgen = EuroCargo); adaptör iki şekli birleştiren ara parçadır.

| # | Sahne | Ne gösterir? |
| --- | --- | --- |
| 1 | Giriş | Amaç (GoF), seyahat adaptörü ve tercüman benzetmesi, Mars Climate Orbiter’ın birim hatası |
| 2 | Sorun | Uyan parça oturur, uymayan geri seker (gerçek `javac` hatası: *incompatible types*); istemciler yamalanır, iade servisi 12 lb gönderir |
| 3 | Çözüm | 3 adım: `implements KargoFirmasi` (gerçek `javac` hatasıyla) → çeviri metotları → istemciler sürüm 1.0’a döner |
| 4 | Canlı Akış ★ | Tek gönderinin yolculuğu: çağrı adaptörün çeviri tablosundan geçer (ad, kg → lb, 48213 → "GS-48213", 2 → "Yolda"); sahne, sıralama ve sınıf diyagramı görünümleri |
| 5 | Nesne ↔ Sınıf ★ | Kompozisyon ve kalıtımla adaptör; sınıf adaptöründe yabancı metodun sızması (12 lb), nesne adaptöründe derlenmemesi, `final` kütüphane (gerçek `javac` hataları), karşılaştırma tablosu |
| 6 | Yapı (UML) | Dört rolün turu, **nesne ↔ sınıf adaptörü** diyagram geçişi, “ne kadar uyarlama?” |
| 7 | Genişlet | İkinci yabancı ortak EuroCargo (gram, tek rota metni) için adaptör yazma alıştırması; istemciler değişmez |
| 8 | Gerçek Dünya | `Arrays.asList` (dizinin List görünümü), `InputStreamReader` (bayt → karakter; yanlış charset), `Executors.callable` (JDK’daki `RunnableAdapter`), yapısal kalıplarla farkı |
| 9 | Quiz | 8 soru (kodda satır seçme dahil) + sürükle-bırak rol eşleştirme |
| 10 | Özet | Tek sayfalık özet; yazdırılabilir (PDF) |

Önerilen akış: yaratımsal kalıplardan sonra, 1 → 10 sırayla, toplam 45–55 dakika. Canlı Akış’ta “Birim çevirisi”
adımında durup çeviri tablosunu gösterin; Sorun sahnesindeki 12 lb hatasının neden artık oluşamayacağını sorun.

## Klavye kısayolları

| Tuş | İşlev |
| --- | --- |
| `→` `Boşluk` `PgDn` | Sonraki adım (adımlar bitince sonraki sahne) |
| `←` `PgUp` | Önceki adım / önceki sahne |
| `Home` / `End` | Sahnenin ilk / son adımı |
| `P` | Otomatik oynat / durdur |
| `1`–`9` | Sahneye atla (10. ve 11. sahnelere ok tuşlarıyla ya da sekmeden) |
| `F` | Tam ekran |
| `T` | Açık / koyu tema |
| `+` `−` `0` | Yazı boyutu |
| `K` / `X` | Ekrana çizim kalemi / çizimleri temizle |
| `?` | Kısayol penceresi |

Sunum kumandaları (clicker) genellikle `PgDn`/`PgUp` gönderir; doğrudan çalışır.

## Java kodları

Derlenebilir örnekler `java/` klasöründedir; ayrıntılar için [java/README.md](java/README.md).
Uygulamadaki kodu değiştirirseniz Java dosyalarını yeniden üretmek için:

```bash
node tools/export-java.js
```

## Proje yapısı

```text
index.html                     giriş noktası (betikler sırayla yüklenir)
css/app.css                    tüm stiller (açık/koyu tema belirteçleri dahil)
js/core/                       kalıptan bağımsız, yeniden kullanılabilir bileşenler
  dp.js                        DOM yardımcıları, mini-markdown, animasyon, depolama, olay yolu
  java-highlight.js            Java sözdizimi renklendirici
  code-view.js                 sekmeli kod görüntüleyici (satır vurgusu, diff, tıklanabilir satır)
  stepper.js                   adım oynatıcı (oynat/durdur/hız)
  class-diagram.js             UML sınıf diyagramı (SVG; kesişen çizgilerde atlama kavisi)
  sequence-diagram.js          UML sıralama diyagramı (SVG)
  memory-view.js               bellek görünümü (yığın · static · heap, referans okları, kilit)
  quiz.js                      çoktan seçmeli, satır seçme, sürükle-bırak eşleştirme
  fx.js                        bildirim, konfeti, çizim kalemi
  kit.js                       sahne kiti: anlatım çubuğu, panel, boşluk doldurma, Gerçek Dünya ve Quiz şablonları
js/catalog.js                  23 GoF kalıbının listesi (ana sayfa)
js/shared/lojistik.js          ortak lojistik dünyası (araçlar, yollar, binalar, hareket yolları)
js/patterns/factory-method/    Factory Method modülü
  data.js                      Java kodları, roller, diyagram tanımları (tek kaynak)
  stage.js                     animasyon sahnesi
  scenes-1/2/3.js              sahneler ve kalıp kaydı
js/patterns/abstract-factory/  Abstract Factory modülü
  data.js                      Java kodları, aileler, roller, diyagram tanımları (tek kaynak)
  matrix.js                    aile matrisi ve uyumluluk tablosu
  stage.js                     animasyon sahnesi
  scenes-1/2/3.js              sahneler ve kalıp kaydı
js/patterns/singleton/         Singleton modülü
  data.js                      Java kodları, çıktılar, thread yarışı senaryoları, diyagramlar (tek kaynak)
  memory.js                    bellek görünümünün Singleton düzenleri
  stage.js                     takip ofisi animasyonu (masalar, numara makinesi, takip panosu)
  scenes-1/2/3.js              sahneler ve kalıp kaydı
js/patterns/builder/           Builder modülü
  data.js                      Java kodları, tarifler, temsillerin hesabı, diyagramlar (tek kaynak)
  stage.js                     paketleme atölyesi (argüman şeridi, Builder formu, paket, kontrol kapısı)
  director.js                  Yönetici sahnesi: tarif şeridi + hazırlayıcı istasyonları
  scenes-1/2/3.js              sahneler ve kalıp kaydı
js/patterns/prototype/         Prototype modülü
  data.js                      Java kodları (tüm sürümler), çıktılar, gerçek dünya örnekleri, diyagramlar (tek kaynak)
  stage.js                     sipariş masası, depo (kutu · pano · ip), bellek düzenleri, şablon kataloğu
  scenes-1/2/3.js              sahneler ve kalıp kaydı
js/patterns/adapter/           Adapter modülü
  data.js                      Java kodları (tüm sürümler), çıktılar, gerçek dünya örnekleri, diyagramlar (tek kaynak)
  stage.js                     bağlantı tezgâhı: yapboz parçaları, adaptörün çeviri tablosu, mesaj kartları
  scenes-1/2/3.js              sahneler ve kalıp kaydı
java/                          derlenebilir Java örnekleri (data.js dosyalarından üretilir)
tools/export-java.js           Java dosyalarını üreten betik
```

## Yeni bir kalıp eklemek

1. `js/patterns/<kalip-adi>/` klasörü oluşturun; kodları ve diyagram tanımlarını bir `data.js` dosyasına koyun.
2. Sahneleri yazın ve kalıbı kaydedin:

   ```js
   DP.register({
     id: 'observer',
     name: 'Observer',
     tr: 'Gözlemci',
     initialState: () => ({}),
     scenes: [
       { id: 'giris', title: 'Giriş', mount: (root, ctx) => { /* ... */ return { destroy() {} }; } },
       // ...
     ],
   });
   ```

   `mount` bir nesne döndürür; adım adım ilerleyen sahneler `next()`, `prev()`, `first()`, `last()`,
   `play()` ve `destroy()` sağlar (`DP.kit.stepApi` bunları bir `DP.Stepper`’dan hazır üretir).
3. Betikleri `index.html` içine ekleyin ve `js/catalog.js` içinde kalıbın `ready` alanını `true` yapın.

Hazır bileşenler: `DP.CodeView`, `DP.ClassDiagram`, `DP.SequenceDiagram`, `DP.MemoryView`, `DP.Stepper`,
`DP.ui.MCQ`, `DP.ui.LinePick`, `DP.ui.Match`, `DP.fx.confetti`, `DP.fx.toast` ve sahne kiti
`DP.kit` (`foot`, `panel`, `seg`, `blankExercise`, `realWorldScene`, `quizScene` …).
