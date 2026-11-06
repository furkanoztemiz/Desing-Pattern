# Tasarım Kalıpları Atölyesi

> Bu program Doç. Dr. Furkan ÖZTEMİZ tarafından Yazılım Tasarımı ve Mimarisi dersi için geliştirilmiştir.

*Yazılım Tasarımı ve Mimarisi* dersi için tasarım kalıplarını **animasyonlar** ve **Java örnekleriyle**
anlatan interaktif ders materyali. Hazır modüller — yaratımsal kalıpların beşi: **Factory Method (Fabrika Metodu)**,
**Abstract Factory (Soyut Fabrika)**, **Singleton (Tekil Nesne)**, **Builder (Yapıcı)**, **Prototype (Prototip)**;
yapısal kalıpların yedisi: **Adapter (Adaptör)**, **Bridge (Köprü)**, **Composite (Bileşik)**, **Decorator (Dekoratör)**,
**Facade (Cephe)**, **Flyweight (Sinek Sıklet)**, **Proxy (Vekil)**; davranışsal kalıplardan: **Chain of Responsibility
(Sorumluluk Zinciri)**, **Command (Komut)**, **Mediator (Arabulucu)**,
**Memento (Hatıra)**, **Observer (Gözlemci)**, **State (Durum)** ve
**Strategy (Strateji)**. Hepsi aynı lojistik dünyasında geçer, her biri bir öncekinin devamıdır.

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

## Bridge modülü — 10 sahne

Senaryo: gönderi etiketleri üç ayrı cihazda basılıyor — depoda **Zebra** (ZPL), müşteriye e-postayla **PDF**, kuryenin el
terminalinde **termal** fiş yazıcısı (ESC/POS). Kalıpsız çözüm her (etiket türü × yazıcı) eşleşmesine bir sınıf yazıyor:
3 × 3 = 9 sınıf. Zebra'da Türkçe karakterler için gereken `^CI28` düzeltmesi üç Zebra sınıfından birinde unutuluyor ve
cam vazonun etiketinde alıcının adı bozuk basılıyor ("Ay┼ƒe Y─▒lmaz"). Çözüm: etiketler (soyutlama) ve yazıcılar
(gerçekleştirici) iki ayrı hiyerarşi; aralarındaki köprü tek bir alan — `protected Yazici yazici;` — ve 3 + 3 sınıf yeter.

| # | Sahne | Ne gösterir? |
| --- | --- | --- |
| 1 | Giriş | Amaç (GoF), yazıcı sürücüsü ve evrensel kumanda benzetmesi; etiketler ile yazıcılar arasında bir köprü |
| 2 | Sorun | Eşleşme matrisi sürüm sürüm büyür (2 → 4 → 9 sınıf); kopya kod iki eksende; `^CI28` bir hücrede unutulur |
| 3 | Çözüm | 4 adım: gerçekleştirici arayüzü (`Yazici`) → soyutlama + köprü (`Etiket`) → özelleşmiş etiketler → istemci birleştirir; dokuz sınıf silinir |
| 4 | Canlı Akış ★ | Yazıcı ve etiket nesneleri kurulur, köprü bağlanır; her ilkel çağrı köprüden geçip cihazın diline çevrilir, etiket adım adım basılır. İki eşleşme; sahne, sıralama ve sınıf diyagramı görünümleri |
| 5 | Eşleştirme Tezgâhı ★ | Matristen bir hücre seçilir; o eşleşme için sınıf yok, nesneler çalışma anında birleşir. Aynı etiket başka yazıcıda, aynı yazıcı başka etikette, `yaziciDegistir` ile çalışma anında yazıcı değiştirme |
| 6 | Yapı (UML) | Dört rol iki hiyerarşide; ◇ köprü (kompozisyon); ilkel ve üst düzey arayüz farkı |
| 7 | Genişlet | Yeni gerçekleştirici `HtmlYazici` (boşluk doldurma); etiket sınıflarına dokunulmaz; kalıtımla +3, köprüyle +1 sınıf. Çözülünce tezgâhta da açılır |
| 8 | Gerçek Dünya | `Collections.newSetFromMap` (Set → Map), Swing `JButton` ↔ `ButtonUI`, JDBC sürücüleri, Adapter/Strategy/Abstract Factory ile farkı |
| 9 | Quiz | 8 soru (kodda satır seçme dahil) + sürükle-bırak rol eşleştirme |
| 10 | Özet | Tek sayfalık özet; yazdırılabilir (PDF) |

Önerilen akış: Adapter'dan sonra, 1 → 10 sırayla, toplam 45–55 dakika. Canlı Akış'ta `^CI28` satırının nereden
geldiğini sorun; tezgâhta öğrencilere bir hücre seçtirip "bu eşleşme için kaç sınıf yazdık?" diye sorun.

## Composite modülü — 10 sahne

Senaryo: sipariş kolisinin içinde bir aksesuar kutusu, onun içinde bir saat kutusu… Kalıpsız çözümde koli iki ayrı liste
tutuyor (`urunler`, `koliler`) ve bir `Kantar` sınıfı içeriği **iç içe döngülerle** geziyor: kodun şekli ağacın şeklini
kopyalıyor. Depo saati kendi kutusuyla aksesuar kutusuna koyunca (üçüncü kat) döngüler oraya inmiyor: program sipariş için
**3100 g** diyor, kantar **3400 g** gösteriyor; aynı aksesuar kutusu tek başına 900 g, siparişin içinde 600 g sayılıyor.
Çözüm: ürün de koli de aynı arayüzü uygular (`Parca`); koli her soruyu **içindekilere** sorup cevapları birleştirir.
Özyineleme her derinliğe iner; istemci ürün mü koli mi diye sormaz.

| # | Sahne | Ne gösterir? |
| --- | --- | --- |
| 1 | Giriş | Amaç (GoF), klasör boyutu ve ordu benzetmesi; soru kolilerin içine iner, cevaplar çağrı yığınından dışarı toplanır |
| 2 | Sorun | İç içe koliler sürüm sürüm derinleşir; her satırda Kantar’ın hangi döngüsünün oraya eriştiği; program ↔ kantar karşılaştırması; üçüncü kat **kayıp** |
| 3 | Çözüm | 4 adım: ortak arayüz (`Parca`) → yaprak (`Urun`) → bileşik (`Koli`, tek liste, özyineleme; Kantar silinir) → istemci tek tip (`List<Parca>`) |
| 4 | Canlı Akış ★ | İki tarif: `agirlik()` (çağrı iner, ara toplamlar yukarı birikir — son sıra) ve `listele("")` (önce kendisi, sonra içindekiler; girinti her katta büyür — ön sıra). Çağrı yığınında aynı metodun birden çok çerçevesi; sahne, sıralama ve sınıf diyagramı görünümleri |
| 5 | Paketleme Tezgâhı ★ | Koliye eşya, koliye koli konur, ✕ ile çıkarılır; Main canlı üretilir, `Koli` ve `Urun` hiç değişmez. Ürünün içine eşya koymaya kalkınca **güvenli** tasarımda derleme hatası, **şeffaf** tasarımda çalışma anında istisna. **▶ Tart** özyinelemeyi oynatır |
| 6 | Yapı (UML) | Üç rol; bileşiğin imzası: bileşeni hem **uygular** hem **içerir** (◇ `icindekiler 0..*`); güvenli ↔ şeffaf (GoF) şema geçişi |
| 7 | Genişlet | Yeni bileşik `Palet` (boşluk doldurma): sipariş kolisi ve kolisiz bisiklet aynı palete; hiçbir sınıf değişmez. Çözülünce tezgâhta **Palete yükle** açılır |
| 8 | Gerçek Dünya | AWT/Swing `Container` (güvenli), `DefaultMutableTreeNode` (`getLeafCount`, `getDepth`), DOM `Node` (şeffaf: metne ekleme `DOMException`), Decorator/Iterator/Visitor ile farkı |
| 9 | Quiz | 8 soru (kodda satır seçme dahil) + sürükle-bırak rol eşleştirme |
| 10 | Özet | Tek sayfalık özet; yazdırılabilir (PDF) |

Önerilen akış: Bridge’den sonra, 1 → 10 sırayla, toplam 45–55 dakika. Sorun sahnesinde konsoldaki sayıları topladırın
(300 + 2000 + 200 + 900 ≠ 3100); Canlı Akış’ta dönüş adımlarında durup yığında kaç çerçeve olduğunu sorun. Tezgâhın kod
üreticisi, rastgele kurulmuş 3000’i aşkın ağaç (6 kata kadar) ve ürüne ekleme denemeleri için gerçek `javac`/`java`
çıktısıyla karşılaştırılmıştır.

## Decorator modülü — 10 sahne

Senaryo: gönderilere ek hizmetler satılıyor — ekspres, sigorta, soğuk zincir, SMS… Kalıpsız çözüm her
**kombinasyon** için bir alt sınıf yazıyor (`SigortaliSogukZincirliEkspresKargo`…): üç seçenek 8 sınıf eder, her yeni
seçenek sayıyı ikiye katlar. Sigortaya zam gelince kural dört sınıfta yazılı olduğu için biri unutulur ve fiyat
listesi tutarsızlaşır (180 TL, 185 olmalıydı). Çözüm: her ek hizmet çekirdek gönderiyi **saran bir katman**dır —
`new Sigorta(new Ekspres(new StandartKargo()))`; ücret katman katman hesaplanır.

| # | Sahne | Ne gösterir? |
| --- | --- | --- |
| 1 | Giriş | Amaç (GoF), hediye paketi ve kahve benzetmesi; katman katman büyüyen fiyat |
| 2 | Sorun | Kombinasyon sınıfları ağacı sürüm sürüm büyür (2 → 4 → 8; 2ⁿ grafiği); zamda bir sınıf unutulur |
| 3 | Çözüm | 4 adım: ortak arayüz → dekoratör atası (`icteki`) → her seçenek bir katman → istemci katmanları kurar; yedi kombinasyon sınıfı silinir |
| 4 | Canlı Akış ★ | Katmanlar tek tek sarılır; `ucret()` çağrısı katman katman **içeri** iner, değer **dışarı** çıkarken her katman payını ekler. İki tarif; sahne, sıralama ve sınıf diyagramı görünümleri |
| 5 | Sipariş Tezgâhı ★ | Sıra önemli: indirim en dışta 112 TL, en içte 120 TL; aynı katman iki kez (iki SMS); **serbest kip**te çekirdek seçip katman ekleme/geri alma, canlı Java kodu ve ara toplamlar |
| 6 | Yapı (UML) | Rollerin turu; dekoratörün imzası: arayüzü hem **uygular** hem **içinde tutar** (◇ toplama); saydamlık ve nesne kimliği |
| 7 | Genişlet | Yeni katman `HediyePaketi` (boşluk doldurma); hiçbir sınıf değişmez; kalıtımla +8, dekoratörle +1 sınıf. Çözülünce tezgâhta da açılır |
| 8 | Gerçek Dünya | `Collections.unmodifiableList`, `LineNumberReader`, Java I/O akışları (`DataOutputStream` + `GZIPOutputStream`: 10000 → 1823 bayt), sık karıştırılan kalıplar |
| 9 | Quiz | 8 soru (kodda satır seçme dahil) + sürükle-bırak rol eşleştirme |
| 10 | Özet | Tek sayfalık özet; yazdırılabilir (PDF) |

Önerilen akış: Adapter’dan sonra, 1 → 10 sırayla, toplam 45–55 dakika. Canlı Akış’ta dönüş adımlarında durup
ara toplamları sorun; Sipariş Tezgâhı’nda öğrencilerden bir sipariş isteyip **serbest kip**te birlikte kurun.
Tezgâhın fiyat hesabı, 5 katmana kadar bütün diziler (18.662 kombinasyon) için gerçek Java çıktısıyla karşılaştırılmıştır.

## Facade modülü — 10 sahne

Senaryo: bir gönderi oluşturmak yedi alt sistemi doğru sırayla çalıştırmayı gerektiriyor: adres, tarife, ödeme,
takip numarası, etiket, kurye, SMS. Kalıpsız çözümde her istemci (şube kasası, web sitesi) bu iş akışını **kendisi**
yazıyor; yedi alt sistemi tanıyor, kurucusu yedi parametre alıyor. Ödeme ekibi kart limiti getirince (`cek()` artık
`boolean` döndürüyor) kasa kontrolü ekliyor, web sitesi unutuyor: Can’ın ödemesi reddediliyor ama takip numarası
veriliyor, etiket basılıyor, kurye yola çıkıyor (**hayalet gönderi**). Derleyici bir şey demiyor. Çözüm: iş akışı ve
kurallar `GonderiCephesi`’nde toplanır; istemciler tek bir sade işlem çağırır: `cephe.gonder(talep)`. Alt sistem
sınıfları değişmez ve cepheden habersizdir.

| # | Sahne | Ne gösterir? |
| --- | --- | --- |
| 1 | Giriş | Amaç (GoF), e-Devlet / tek pencere benzetmesi; üç istemci ile yedi alt sistem arasında 21 kablo, cepheyle 3 + 7 |
| 2 | Sorun | Gönderi merkezi: istemci kartlarında içlerindeki iş akışı, her ofise giden kablolar; web sitesinde unutulan kart limiti ve hayalet gönderi |
| 3 | Çözüm | 3 adım: cephe yazılır (iş akışı ve kural tek yerde) → kasa devreder → web sitesi devreder; alt sistemlere dokunulmaz |
| 4 | Canlı Akış ★ | İstemcinin tek çağrısı, cephenin yedi alt sistemi sırayla çağırması; ödeme reddedilince akışın durması. İki tarif: Ali’nin kolisi · Can’ın kartı. Sahne, sıralama ve sınıf diyagramı görünümleri |
| 5 | Cephe Tezgâhı ★ | Tasarım (kalıpsız · cephe) × istemci sayısı × üç değişiklik isteği (kart limiti, sigorta, kurye API’si): kablolar, değişen dosya rozetleri, kodun farkı ve karşılaştırma tablosu |
| 6 | Yapı (UML) | Roller; alt sistem cepheyi tanımaz; cephe bir duvar değil (doğrudan erişim serbest); N × M yerine N + M |
| 7 | Genişlet | Yeni istemci `KurumsalApi` (boşluk doldurma): tek bağımlılık, kart limiti kuralı hazır. Çözülünce tezgâhta dördüncü istemci açılır |
| 8 | Gerçek Dünya | `Files.readAllLines` (cephe ↔ elle akışlar, aynı çıktı), `JavaCompiler.run` (derleyicinin cephesi), SLF4J; Adapter, Mediator ve Proxy ile farkı |
| 9 | Quiz | 8 soru (kodda satır seçme dahil) + sürükle-bırak rol eşleştirme |
| 10 | Özet | Tek sayfalık özet; yazdırılabilir (PDF) |

Önerilen akış: Decorator’dan sonra, 1 → 10 sırayla, toplam 45–55 dakika. Sorun sahnesinde “kart limiti kuralı başka
hangi istemcide unutulabilir?” diye sorun; Cephe Tezgâhı’nda istemci sayısını artırıp değişen dosya sayısını
karşılaştırın (tek istemcide cephe kazandırmaz). Tezgâhtaki 2 tasarım × 4 istemci sayısı × 8 değişiklik birleşiminin
(64 program) hepsi gerçek `javac`/`java` çıktısıyla karşılaştırılmıştır.

## Flyweight modülü — 10 sahne

Senaryo: kuryelerin tabletinde canlı bir gönderi haritası var. Kalıpsız çözümde her `HaritaNoktasi` kendi ikonunu
(64×64 resim, 16 KB) diskten yüklüyor. Üç gönderide sorun yok; bütün Türkiye (10.000 gönderi) gelince harita
**10.000 ikon, 160.000 KB** tutuyor ve kurye tabletinde (`java -Xmx64m`) ≈ 3.950. noktada gerçek bir
**`OutOfMemoryError`** veriyor. Kestirme bir çözüm bütün noktayı türe göre paylaşıyor: bellek düzeliyor (3 ikon) ama
etiket ve konum paylaşılan nesnenin üstüne yazıldığı için 10.000 nokta üç yere yığılıyor; Ali’nin KRG-1001’i
KRG-10999 olarak başka bir yerde çiziliyor. Çözüm: durum ikiye ayrılır. **İçsel** durum (tür adı, ikon) değişmez
`IsaretTuru` nesnelerinde paylaşılır ve `IsaretFabrikasi` her tür için tek nesne verir. **Dışsal** durum (etiket,
konum) `HaritaNoktasi`’nda kalır ve çizerken parametreyle gider: `isaret.ciz(x, y, etiket)`. `Main` hiç değişmez.

| # | Sahne | Ne gösterir? |
| --- | --- | --- |
| 1 | Giriş | Amaç (GoF), kaşe ve yazı tipi benzetmesi; üç paylaşılan işaret haritaya farklı konumlarla basılır |
| 2 | Sorun | Türkiye haritası, noktalar listesi, ikon nesneleri ve 64 MB bellek göstergesi: üç gönderide `koli.png` iki kez, bilgisayarda 10.000 ikon, tablette `OutOfMemoryError`, kestirmede üç yere yığılan noktalar; içsel/dışsal teşhisi |
| 3 | Çözüm | 4 adım: arayüz (dışsal durum parametrede) → içsel durum (değişmez `IsaretTuru`) → fabrika (havuz) → nokta yalnızca dışsal durumu tutar; `Main` değişmez |
| 4 | Canlı Akış ★ | Fabrika havuza bakar: yoksa bir kez yaratır (ikon diskten yüklenir), varsa **aynı** nesneyi verir; çizerken her nokta konumunu işarete verir. İki tarif: Üç gönderi · Depolu harita (Genişlet’ten sonra açılır). Sahne, sıralama ve sınıf diyagramı görünümleri |
| 5 | Harita Tezgâhı ★ | Tasarım (paylaşım yok · kestirme · Flyweight) × nokta sayısı (3 … 100.000): harita, ikon duvarı ya da havuz, bellek göstergesi ve üç tasarımın karşılaştırma tablosu; kalıpsız tasarım tablette çöker |
| 6 | Yapı (UML) | Beş rol (paylaşılmayan flyweight dahil); içsel ↔ dışsal durum tablosu; GoF adlarıyla görünüm |
| 7 | Genişlet | Paylaşılmayan `DepoIsareti` (boşluk doldurma): aynı arayüz, fabrikadan geçmez, hiçbir sınıf değişmez |
| 8 | Gerçek Dünya | `Integer.valueOf` önbelleği (127 → `true`, 128 → `false`), `String` havuzu ve `intern()`, Swing `JTable`’ın tek hücre çizicisi; Singleton, nesne havuzu ve Prototype ile farkı |
| 9 | Quiz | 8 soru (kodda satır seçme dahil) + sürükle-bırak rol eşleştirme |
| 10 | Özet | Tek sayfalık özet; yazdırılabilir (PDF) |

Önerilen akış: Decorator’dan sonra, 1 → 10 sırayla, toplam 45–55 dakika. Sorun sahnesinde çökmeden önce “ekranda kaç
farklı resim var?” diye sorun; Harita Tezgâhı’nda nokta sayısını adım adım artırıp göstergenin dolmasını izletin.
Tezgâhtaki 3 tasarım × 5 nokta sayısının (15 program) hepsi gerçek `javac`/`java` çıktısıyla karşılaştırılmıştır;
`OutOfMemoryError` izi 64 MB’lık bellekte her çalıştırmada aynıdır.

## Proxy modülü — 10 sahne

Senaryo: gönderi takibi GlobalShip’in uzaktaki servisine soruluyor; oturum açmak 1200 ms, her sorgu 800 ms ve 25 kuruş.
Kalıpsız çözümde her istemci (müşteri paneli, mobil uygulama) bağlantıyı, önbelleği ve KVKK denetimini **kendisi**
yazıyor. Mobil uygulama, panelden kopyalanan kodda KVKK satırını almamış: Ayşe, Ali’nin gönderisini sorunca adını ve
semtini görüyor. Çözüm: istemcilerle aynı arayüzü (`TakipServisi`) uygulayan bir vekil (`TakipVekili`) araya girer;
koruma, önbellek ve gerçek nesnenin ihtiyaç anında yaratılması (sanal vekil) tek yerde toplanır. İstemcilerde tek satır
değişmez; `Main`’de yalnızca sağ taraf değişir: `TakipServisi aliServisi = new TakipVekili(ali);`

| # | Sahne | Ne gösterir? |
| --- | --- | --- |
| 1 | Giriş | Amaç (GoF), vekâletname ve danışma masası benzetmesi; istek vekilden geçer: geçir, defterden cevapla ya da engelle |
| 2 | Sorun | İstemci kartlarında içlerindeki denetim kodu (bağlantı, önbellek, KVKK); mobilde kopya kod ve eksik KVKK; GlobalShip’in oturum, sorgu, süre, ücret sayaçları |
| 3 | Çözüm | 4 adım: ortak arayüz → vekil yazılır → istemciler sadeleşir (henüz vekil yok: iki sızıntı, 5 sorgu) → araya vekil girer (yalnızca `Main` değişir) |
| 4 | Canlı Akış ★ | İstek vekilin kapılarından geçer: koruma, önbellek, sanal (`gercek` ilk ihtiyaçta yaratılır), GlobalShip. İki tarif: Ali yeniliyor (ikinci istek önbellekten) · Ayşe merak ediyor (ilk istek kapıda kalır, oturum bile açılmaz). Sahne, sıralama ve sınıf diyagramı görünümleri |
| 5 | Vekil Tezgâhı ★ | Trafik senaryosu seçilir (yenile, meraklı müşteri, bakıp çıkan, SMS); vekil açılıp kapanır, koruma · önbellek · sanal tek tek seçilir. Vekilin kodu ve sayaçlar (oturum, sorgu, süre, ücret, engel, sızıntı) vekilsiz duruma göre karşılaştırmalı |
| 6 | Yapı (UML) | Üç rol; vekil gerçek **sınıfa** bağlı ve onu kendisi yaratır (Decorator’dan farkı); GoF’un dört vekil türü: uzak, sanal, koruma, akıllı başvuru |
| 7 | Genişlet | Yeni istemci `SmsBildirim` (boşluk doldurma): sıfır denetim kodu, yine de korunuyor. Çözülünce tezgâhta **SMS gece işi** açılır |
| 8 | Gerçek Dünya | `java.lang.reflect.Proxy` (çalışma anında üretilen `$Proxy0` ve önbellekli işleyici), RMI stub (uzak vekil), JPA `getReference` (sanal vekil), Decorator/Adapter/Facade ile farkı |
| 9 | Quiz | 8 soru (kodda satır seçme dahil) + sürükle-bırak rol eşleştirme |
| 10 | Özet | Tek sayfalık özet; yazdırılabilir (PDF) |

Önerilen akış: Decorator’dan sonra, 1 → 10 sırayla, toplam 45–55 dakika. Sorun sahnesinde “KVKK satırı başka hangi
istemcide unutulabilir?” diye sorun; Vekil Tezgâhı’nda korumayı kapatıp sızıntıyı, sanalı kapatıp boşa açılan oturumu
gösterin. Tezgâhtaki 4 trafik × 9 vekil ayarının (36 program) hepsi gerçek `javac`/`java` çıktısıyla karşılaştırılmıştır.

## Chain of Responsibility modülü — 10 sahne

Senaryo: kurye kapıda. Alıcı evde değilse gönderiyi komşuya, olmazsa akıllı dolaba, o da olmazsa şubeye bırakır;
şube de almazsa gönderi göndericiye döner. Kalıpsız çözümde bütün seçenekler, sıraları ve kuralları kuryenin içindeki
tek bir `if/else` merdiveninde; her dal, üstündeki dalların tutmadığını **varsayıyor** (soğuk zincir dalı erken geldiği
için dolap dalı “soğuk değil” sayıyor). İstanbul dolabı önce denemek isteyince merdiven kopyalanıp yeniden dizildi:
Zeynep’in ilacı akıllı dolaba girdi. Çözüm: her seçenek kendi kuralını eksiksiz bilen bir halka (`TeslimatAdimi`’nden
türeyen `AliciyaTeslim`, `KomsuyaTeslim`, `DolabaTeslim`, `SubeyeTeslim`, `GondericiyeIade`); halka işleyemediği
gönderiyi `sonraki.teslimEt(g)` ile ileri verir. Kurye yalnızca zincirin başını tanır; `Main` aynı sınıflarla Malatya
ve İstanbul zincirlerini farklı sırayla kurar.

| # | Sahne | Ne gösterir? |
| --- | --- | --- |
| 1 | Giriş | Amaç (GoF), kapıdaki kurye ve çağrı merkezi benzetmesi; dört gönderi zincirden geçer, biri teslim alınca zincir durur |
| 2 | Sorun | Kuryenin `if/else` merdiveni ve dalların gizli varsayımları: sürüm 1’de ilaç komşuda, sürüm 2’de kural dalların sırasına bağlı, İstanbul kopyasında ilaç dolapta; günün altı gönderisinin panosu |
| 3 | Çözüm | 3 adım: soyut halka (`sonraki` + `teslimEt` şablonu) → her dal kendi kuralıyla bir halka → kurye zincirin başını tanır, sırayı `Main` kurar (iki bölge, aynı sınıflar) |
| 4 | Canlı Akış ★ | Gönderi halkadan halkaya ilerler: her halkanın kuralı parça parça denetlenir (✓/✗), tutmazsa `sonraki.teslimEt(g)`; çağrı yığını halka halka büyür, konsol satırı `System.out.print` parçalarıyla yazılır. İki tarif: Ayşe’nin kolisi (Malatya) · Zeynep’in ilacı (İstanbul). Sahne, sıralama ve sınıf diyagramı görünümleri |
| 5 | Zincir Tezgâhı ★ | Halkalar taşınır, çıkarılır, eklenir; ▶ Çalıştır günün altı gönderisini zincirden tek tek geçirir. Halka başına teslim sayısı, KAYIP, gönderi başına halka, “evdeyken başka yere” ve soğuk zincir ihlali; değişen tek dosya `Main.java` (kod farkı) |
| 6 | Yapı (UML) | Üç rol; kendine dönen `sonraki` ilişkisi; zinciri kimin kurduğu (çalışırken); “kimse işlemezse?” (alındı garantisi yok) |
| 7 | Genişlet | Yeni halka `MarketeTeslim` (boşluk doldurma): Selin’in 9 kg’lık kolisi markette, ilaç yine şubede; kurye ve öbür halkalar değişmez. Çözülünce tezgâhta **Market** halkası açılır |
| 8 | Gerçek Dünya | `java.util.logging` (kayıt ebeveyn günlükçüye iletilir; zinciri kes, seviye süzgeci), istisnaların çağrı yığınında yukarı iletilmesi (kimse yakalamazsa gerçek yığın izi), Servlet `FilterChain`; Decorator, Composite ve Observer ile farkı |
| 9 | Quiz | 8 soru (kodda satır seçme dahil) + sürükle-bırak rol eşleştirme |
| 10 | Özet | Tek sayfalık özet; yazdırılabilir (PDF) |

Önerilen akış: Proxy’den sonra, 1 → 10 sırayla, toplam 45–55 dakika. Sorun sahnesinde “dolap dalını yukarı taşırsak
ne olur?” diye sorun; Zincir Tezgâhı’nda şubeyi en başa alıp önceliği, İade halkasını çıkarıp KAYIP’ı gösterin.
Tezgâhtaki altı halkanın bütün sıralı alt kümeleri (1956 zincir) tek bir Java koşum programıyla gerçek `javac`/`java`
çıktısına karşı denetlenmiştir; hiçbir sırada soğuk zincir kuralı bozulmuyor.

## Command modülü — 10 sahne

Senaryo: Malatya şubesinin deposu. Operatör panelden kolileri raftan rafa taşıyor, kamyona yüklüyor. Kalıpsız çözümde
panel isteği bir dizgiyle (`"TASI"`, `"YUKLE"`) alıp `switch` ile kendisi yapıyor. “Geri al” için yalnızca son işlemi üç
alanda hatırlıyor: iki hata yapan operatörün ikinci geri alı **boşa** gidiyor (Ali’nin kolisi yanlış rafta kalıyor). Gece
işi de işleri metin olarak biriktirip `switch`’i kopyalıyor; gece vardiyası `"YÜKLE"` yazınca program 02:00’de çöküyor,
kamyon Selin’in kolisi olmadan yola çıkıyor. Çözüm: her istek bir **komut nesnesi** (`TasiKomutu`, `YukleKomutu`): alıcısını
ve geri alma kaydını kendisi tutar. Panel komutları geçmiş ve ileri yığınlarında, gece işi bir kuyrukta tutar.

| # | Sahne | Ne gösterir? |
| --- | --- | --- |
| 1 | Giriş | Amaç (GoF), restoran fişi benzetmesi; düğme bir komut nesnesi yaratır, komut rafı değiştirip geçmişe girer, geri al onu çıkarır |
| 2 | Sorun | Panelin `switch`’i ve “son işlem kaydı” (tek kayıt); boşa giden ikinci geri al (olması gereken yer kesikli kutu); gece işinin metin planı ve 02:00’deki gerçek çöküş |
| 3 | Çözüm | 4 adım: `Komut` arayüzü → her işlem bir komut sınıfı → panel komutu çalıştırır, geçmişe koyar (geri al düzelir, gece hâlâ çöker) → gece işi komut kuyruğu tutar |
| 4 | Canlı Akış ★ | Komut nesnesinin alanları adım adım dolar (`onceki`, `raf`); geçmiş ve ileri yığınları, raflar ve kamyon birlikte değişir. İki tarif: Gündüz (iki hata, iki geri al) · Gece kuyruğu. Sahne, sıralama ve sınıf diyagramı görünümleri |
| 5 | Komut Tezgâhı ★ | Koli seçip taşıyın, yükleyin, geri alın, yineleyin; aynı oturumu kalıpsız (tek kayıt) ve komutlu (geçmiş yığını) tasarımda karşılaştırın. Ölçüler: geçmiş, ileri, boşa giden geri al, yanlış yerde koli. ▶ Oynat oturumu baştan oynatır |
| 6 | Yapı (UML) | Beş rol; çağıran alıcıyı tanımaz; komut ne kadar akıllı olmalı, geri alınamayan işlemler, Memento ile ilişkisi |
| 7 | Genişlet | `MakroKomut` (boşluk doldurma): üç yükleme tek komut, tek geri al hepsini **ters sırayla** geri alır. Çözülünce tezgâhta **Makro** açılır |
| 8 | Gerçek Dünya | `Runnable` (yaratmak ≠ çalıştırmak; main ya da başka iş parçacığı), Swing `Action` (bir komut, düğme + menü), `javax.swing.undo.UndoManager` (JDK’nın geri al yığını); Strategy, Memento ve Chain of Responsibility ile farkı |
| 9 | Quiz | 8 soru (kodda satır seçme dahil) + sürükle-bırak rol eşleştirme (beş rol) |
| 10 | Özet | Tek sayfalık özet; yazdırılabilir (PDF) |

Önerilen akış: Chain of Responsibility’den sonra, 1 → 10 sırayla, toplam 45–55 dakika. Sorun sahnesinde “üç işlem geri
almak için panele kaç alan daha gerekir?” diye sorun; Komut Tezgâhı’nda aynı oturumu iki tasarımda çalıştırıp boşa giden
geri alı gösterin. Tezgâhın iki tasarımında 3000 rastgele oturum tek bir Java koşum programıyla gerçek `javac`/`java`
çıktısına karşı denetlenmiştir.

## Mediator modülü — 10 sahne

Senaryo: şubedeki gönderi oluşturma formu. Öğeler: şehir, ağırlık, soğuk zincir, teslimat seçenekleri (Standart, Hızlı,
Dolap) ve ücret. Kural: Dolap yalnızca Malatya’da (akıllı dolap orada), soğuk zincirli gönderi dolaba konmaz, 20 kg üstü
dolaba ve hızlı teslimata sığmaz; kapanan seçenek seçiliyse Standart’a dönülür. Kalıpsız çözümde öğeler birbirini **tanıyor**
ve kuralın birer kopyasını uyguluyor. Sürüm 2.0’da soğuk zincir kutusu eklenirken iki kopya güncellenmiyor: önce soğuk
zincir, sonra şehir seçilince şehir seçici dolabı yeniden açıyor ve soğuk zincirli ilaç **dolaba** gidiyor (Chain of
Responsibility’deki hatanın bir formdaki karşılığı). Sonuç tıklama sırasına bağlı. Çözüm: öğeler yalnızca yöneticiyi tanır
(`FormOgesi` → `FormYoneticisi`), değişince `degisti(this)` der; kuralların hepsi `GonderiFormu.degisti()` içinde, tek
yerdedir. Ağ yıldıza döner: öğeler arası bağ 13 → 0.

| # | Sahne | Ne gösterir? |
| --- | --- | --- |
| 1 | Giriş | Amaç (GoF), kontrol kulesi benzetmesi; önce ağ (herkes herkesi tanır), sonra yıldız (herkes arabulucuyla konuşur) |
| 2 | Sorun | Form ve “kim kimi tanıyor?” grafiği (bağlar koddaki alanlardan çıkarılır, kural kopyaları rozet): 1.0 çalışır, 2.0’da aynı değerler başka sırayla girilince ilaç dolaba gider |
| 3 | Çözüm | 3 adım: `FormYoneticisi` ve `FormOgesi` (hata sürer) → kurallar `degisti()` içinde (düzelir) → öğeler birbirini unutur (bağ 13 → 0) |
| 4 | Canlı Akış ★ | Öğe değişir, yöneticiye haber verir, yönetici öteki öğeleri okur ve kuralları uygular. İki tarif: Soğuk zincirli ilaç · Ağır koli (zincirleme değişiklik). Sahne, işlem başına sıralama diyagramı ve sınıf diyagramı görünümleri |
| 5 | Form Tezgâhı ★ | Formu istediğiniz sırayla doldurun; aynı tıklamaları üç tasarımla karşılaştırın: dağınık kurallar, kopyalı ama tam kurallar, Mediator. Ölçüler: yanlış an, kurala aykırı gönderi, öğeler arası bağ, kuralın kaç yerde yazılı olduğu. ▶ Oynat çağrıları bağlar boyunca gösterir |
| 6 | Yapı (UML) | Beş rol; bağ sayısı n(n−1) ↔ 2n; tuzak: yöneticinin ayarını yeniden bildirmek (gerçek `StackOverflowError`); bedeli (“her şeyi bilen” yönetici), `kaynak` parametresi, Observer ile birlikte |
| 7 | Genişlet | `SigortaKutusu` (boşluk doldurma): yeni öğe; öteki öğeler değişmez, yalnızca yönetici değişir. Çözülünce tezgâhta **sigorta** açılır |
| 8 | Gerçek Dünya | `javax.swing.ButtonGroup` (radyo düğmelerinin arabulucusu), Swing formu (pencere = yönetici, `ItemListener`), `java.util.concurrent.CyclicBarrier` (kamyonlar bariyerde buluşur); Facade ve Observer ile farkı |
| 9 | Quiz | 9 soru (kodda satır seçme dahil) + sürükle-bırak rol eşleştirme (beş rol) |
| 10 | Özet | Tek sayfalık özet; yazdırılabilir (PDF) |

Önerilen akış: Command’dan sonra, 1 → 10 sırayla, toplam 45–55 dakika. Sorun sahnesinin 2. ve 3. adımlarında “aynı
değerler, neden farklı sonuç?” diye sorun; Çözüm’de grafiğin ağdan yıldıza dönüşmesini izleyin. Tezgâhın dört tasarımında
(sigorta açıkken dahil) 4000 rastgele oturum tek bir Java koşum programıyla gerçek `javac`/`java` çıktısına karşı
denetlenmiştir.

## Memento modülü — 10 sahne

Senaryo: Command modülündeki Malatya deposu. Gece 02:00 planı “ya hep ya hiç” uygulanmalı: plan yarıda hata verirse
(aynı raf iki kez kullanılmış: “C2 dolu”) depo plandan önceki hâline dönmeli. Kalıpsız çözümde yedeği depo değil bir
yedek defteri alıyor; bunun için depo içini get/set ile dışarı açıyor. Sürüm 1.0’da `yedek = depo.getRaflar()` deponun
**kendi** haritası (referans ≠ kopya): geri yükleme hiçbir şey değiştirmiyor. Sürüm 1.1 kopya alıyor. Sürüm 2.0’da depoya
kamyon ekleniyor ama defter güncellenmiyor: geri yüklemeden sonra koliler **hem rafta hem kamyonda**. Çözüm: depo kendi
hatırasını kendisi oluşturur (`Depo.Hatira`, alanları ve kurucusu `private`) ve ona kendisi döner; defter hatırayı saklar
ama içine bakamaz. Depo’nun içi yeniden kapanır.

| # | Sahne | Ne gösterir? |
| --- | --- | --- |
| 1 | Giriş | Amaç (GoF), mühürlü zarf (noter) benzetmesi; depo hatırasını oluşturur, mühürlenen zarf deftere gider, hata olunca geri gelir ve depo ona döner |
| 2 | Sorun | Nesne kimlikleri (Map #1 …): referans yedek depoyla birlikte değişir, geri yükleme etkisiz; kopya çalışır; kamyon eklenince koliler iki yerde |
| 3 | Çözüm | 3 adım: `Depo.Hatira` (hata sürer) → defter hatıra saklar (düzelir) → get/set silinir, alanlar `final` |
| 4 | Canlı Akış ★ | Hatıra masası (geniş arayüz: Depo içini görür) ve defterdeki mühürlü zarf (dar arayüz). İki tarif: Gece planı (iptal ve geri dönüş) · İki kayıt noktası. Sahne, sıralama ve sınıf diyagramı görünümleri |
| 5 | Yedek Tezgâhı ★ | Taşıyın, yükleyin, kaydedin, geri yükleyin; aynı oturumu üç yöntemle karşılaştırın: referans, kopya, Memento. Ölçüler: kopyalanan kayıt, hatalı geri yükleme, iki yerde koli. Kopyanın gizli tuzağı: aynı kayda iki kez dönmek |
| 6 | Yapı (UML) | Dört rol; iç sınıf (⊕) ile dar ve geniş arayüz, emanetçi içine bakarsa gerçek `javac` hatası; hatıraların bedeli, artımlı hatıra, Command + Memento |
| 7 | Genişlet | `DepoGecmisi` (boşluk doldurma): hatıralarla geri al / yinele; Depo ve defter değişmez. Çözülünce tezgâhta **geri al / yinele** açılır |
| 8 | Gerçek Dünya | `Serializable` (bayt dizisine hatıra, `transient`), `javax.swing.undo.StateEdit` (JDK’nın hazır hatırası), `record` (değişmez ama sığ: `List.copyOf`); Command ve Prototype ile farkı |
| 9 | Quiz | 9 soru (kodda satır seçme dahil) + sürükle-bırak rol eşleştirme (dört rol) |
| 10 | Özet | Tek sayfalık özet; yazdırılabilir (PDF) |

Önerilen akış: Mediator’dan sonra, 1 → 10 sırayla, toplam 45–55 dakika. Sorun sahnesinin ilk adımında “yedek neden
değişti?” diye sorun; Yedek Tezgâhı’nın 4. adımında kopyanın bile yetmediğini gösterin. Tezgâhın dört tasarımında
(geri al / yinele açıkken dahil) 4000 rastgele oturum tek bir Java koşum programıyla gerçek `javac`/`java` çıktısına karşı
denetlenmiştir.

## Observer modülü — 10 sahne

Senaryo: gönderi takibi. KRG-1001’in (Ali Şahin, Malatya) durumu değiştikçe (Hazırlanıyor → Yolda → Dağıtımda → Teslim
edildi) üç ekran haberdar olmalı: Ali’nin telefonu (SMS), satıcı paneli ve kurye tableti (dağıtımdaki gönderiler kuryenin
rotasında). Kalıpsız çözümde `Gonderi` ekranları **adıyla** tanıyor ve her birinin kendine özgü yöntemini çağırıyor; yeni
ekran (tablet) Gonderi’yi değiştiriyor. Sürüm 2.0’da teslimde imza için `teslimEt()` yazılıyor; bildirimler kopyalanıyor ama
tablet unutuluyor: panel “Teslim edildi” derken tablet gönderiyi hâlâ rotada gösteriyor, kurye kapıya **yeniden** gidecek.
Çözüm: ekranlar tek bir arayüzü uygular (`GonderiGozlemcisi.guncelle`), Gonderi yalnızca bir **abone listesi** tutar ve her
değişiklikte `bildir()` ile hepsine haber verir; kimin abone olacağını Main çalışma anında belirler (`aboneEkle`, `aboneCikar`).

| # | Sahne | Ne gösterir? |
| --- | --- | --- |
| 1 | Giriş | Amaç (GoF), kanal aboneliği benzetmesi; durum değişir, abonelerin hepsi haber alır; çağrı merkezi abone olur, Ali ayrılır |
| 2 | Sorun | Gönderi kartında kodda sabit alanlar ve “kim kimi çağırır” tablosu: tablet eklenince Gonderi değişir; `teslimEt` tableti unutur, panel ile tablet çelişir |
| 3 | Çözüm | 3 adım: ortak arayüz `guncelle(gonderi)` (hata sürer) → abone listesi ve tek `bildir()` (düzelir) → ekranları Main abone eder; Gonderi’nin tanıdığı ekran sınıfı 3 → 0 |
| 4 | Canlı Akış ★ | `bildir()` listeyi dolaşır, her ekran `guncelle(this)` ile uyanır ve durumu kendisi okur (pull). İki tarif: Teslimat günü · İki gönderi, tek panel (abonelikten çıkma). Sahne, satır başına sıralama diyagramı ve sınıf diyagramı görünümleri |
| 5 | Abonelik Tezgâhı ★ | İki gönderinin durumunu ilerletin, ekranları abone edin ya da çıkarın; aynı oturumu üç tasarımla karşılaştırın: doğrudan çağrı, sabit liste, Observer. Ölçüler: bildirim, istenmeyen, kaçan, Gonderi’nin tanıdığı ekran sınıfı; “bayat” ve “geç abone” işaretleri. ▶ Oynat oturumu baştan oynatır |
| 6 | Yapı (UML) | Dört rol; push ↔ pull, bildirimi kim tetikler; tuzak: bildirim sırasında abonelikten çıkmak (gerçek `ConcurrentModificationException`, sessizce atlanan abone, `List.copyOf` düzeltmesi); bedeli |
| 7 | Genişlet | `CagriMerkezi` (boşluk doldurma): yeni gözlemci; Gonderi ve öteki ekranlar değişmez. Çözülünce tezgâhta **Çağrı merkezi** açılır |
| 8 | Gerçek Dünya | `java.beans.PropertyChangeSupport` (hazır abone listesi; aynı değer bildirilmez), Swing `ActionListener` (son eklenen önce çağrılır), `java.util.concurrent.Flow` (`request(n)` ile geri basınç); Mediator ve olay yolu ile farkı |
| 9 | Quiz | 9 soru (kodda satır seçme dahil) + sürükle-bırak rol eşleştirme (dört rol) |
| 10 | Özet | Tek sayfalık özet; yazdırılabilir (PDF) |

Önerilen akış: Memento’dan sonra, 1 → 10 sırayla, toplam 45–55 dakika. Sorun sahnesinde “yeni bir ekran için Gonderi’de
kaç yere dokunmak gerekiyor?” diye sorun; Abonelik Tezgâhı’nda aynı oturumu üç tasarımla oynatın. Tezgâhın dört
tasarımında (çağrı merkezi açıkken dahil) 4000 rastgele oturum tek bir Java koşum programıyla gerçek `javac`/`java`
çıktısına karşı denetlenmiştir.

## State modülü — 10 sahne

Senaryo: Malatya şubesinin akıllı kargo dolabı (Chain of Responsibility’deki “Dolap” halkası). Kurye paketi koyar, alıcıya
SMS ile kod gider; alıcı kodu girince kapak açılır. Kalıpsız çözümde dolabın durumu bir dizgi (`"BOŞ"`, `"DOLU"`) ve her
metot durumu `if/else` ile kendisi soruyor. Güvenlik ekibi “üç hatalı kodda dolap kilitlensin” diyor: geliştirici `kodGir`’i
ve yeni `gorevliAc`’ı yazıyor ama `paketKoy`’a dokunmuyor. “BOŞ ise” diye yazılmış `else` dalı KİLİTLİ’yi de karşılıyor:
kilitli dolaba Selin’in paketi konuyor, Ali’nin kodu artık çalışmıyor (**4/3**), Ali’nin paketi dolapta ama kayıtsız.
Çözüm: her durum bir **sınıf** (`BosDurum`, `DoluDurum`, `KilitliDurum`); dolap isteği o anki durum nesnesine devreder,
geçişleri durumlar yapar. Yeni bir durum her isteğe cevap vermek zorundadır: derleyici unutmaya izin vermez.

| # | Sahne | Ne gösterir? |
| --- | --- | --- |
| 1 | Giriş | Amaç (GoF), trafik ışığı benzetmesi; aynı istek (`kodGir`) üç durumda üç farklı cevap alır, bağlamın `durum` oku durum kartları arasında gezer |
| 2 | Sorun | Durum × istek ızgarası (her satır bir metot, içinde if/else dalları); kilidin çalışması, `else` dalına düşen KİLİTLİ, dolapta kayıtsız kalan paket ve 4/3 sayacı |
| 3 | Çözüm | 4 adım: durumlar nesne olur (hata sürer!) → `paketKoy` durumlara taşınır (derleyici KİLİTLİ’ye de yazdırır, hata düzelir) → `kodGir` → `gorevliAc`; bağlamdaki `if (durum…)` sayısı 5 → 0 |
| 4 | Canlı Akış ★ | İstek dolaba gelir, o anki durum nesnesine devredilir, durum işini yapar ve bir sonraki durumu yaratır: `durum` oku sütunlar arasında kayar. İki tarif: Kilit ve görevli · Dolu dolaba ikinci paket. Sahne, istek başına sıralama diyagramı ve sınıf diyagramı görünümleri |
| 5 | Dolap Tezgâhı ★ | Kurye, alıcı, yabancı ya da görevli olun; aynı oturumu kalıpsız (if/else) ve durum nesneleriyle karşılaştırın. Ölçüler: geçiş, durum nesnesi, `if (durum…)`, kilitli dolaba konan paket, kayıtsız paket. ▶ Oynat oturumu baştan oynatır |
| 6 | Yapı (UML) | Dört rol; UML durum diyagramı ↔ sınıflar; geçişi kim yapar (durumlar, bağlam, tablo); alansız durum nesnelerinin paylaşılması (Flyweight, Singleton, `enum`) |
| 7 | Genişlet | `HizmetDisiDurum` (boşluk doldurma): yeni durum sınıfı + `BosDurum`’da tek satır; bir metot unutulunca gerçek `javac` hatası. Çözülünce tezgâhta **HİZMET DIŞI** açılır |
| 8 | Gerçek Dünya | `java.net.Socket` (GoF’un TCP bağlantısı örneği: aynı yazma isteği bağlı değil / bağlı / kapalı durumlarda), `enum` ile durumlar (sabite özel gövdeler, paylaşılan nesneler), `Thread` yaşam döngüsü (`start()` iki kez); State, Strategy ve `enum` + `switch` farkı |
| 9 | Quiz | 9 soru (kodda satır seçme dahil) + sürükle-bırak rol eşleştirme (dört rol) |
| 10 | Özet | Tek sayfalık özet; yazdırılabilir (PDF) |

Önerilen akış: Observer’dan sonra, 1 → 10 sırayla, toplam 45–55 dakika. Sorun sahnesinde “KİLİTLİ’yi eklerken hangi
metotlara dokunmak gerekirdi?” diye sorun; Çözüm’ün 2. adımında konsolun düzeldiğini, 1. adımda düzelmediğini gösterin.
Tezgâhın iki tasarımında (ve HİZMET DIŞI açıkken) 3000 rastgele oturum tek bir Java koşum programıyla gerçek
`javac`/`java` çıktısına karşı denetlenmiştir.

## Strategy modülü — 10 sahne

Senaryo: Malatya kuryesinin günü (temsili harita; sokaklar ızgara gibi, mesafe |dx| + |dy| km). Depodan çıkan kurye altı
durağı dolaşır; sıradaki durağı bir rota algoritması seçer: randevu sırası, en yakın durak, soğuk zincir önce. Kalıpsız
çözümde algoritmalar `Kurye`’nin içinde ve bir `String` ile seçiliyor. Sürüm 2.0’da eklenen `SOGUK_ONCE` dalı kuryenin
listesini **yerinde sıralıyor**; kurye öğleden sonra randevu sırasına dönünce sıra 1, 4, 3, 2 oluyor ve Can Demir’in ikinci
randevusu en sona kalıyor. Randevu dalının koduna kimse dokunmadı; onu bozan, aynı sınıftaki yeni dal. Çözüm: her
algoritma `RotaStratejisi`’ni uygulayan ayrı bir sınıf; `Kurye` yalnızca arayüzü tanır ve stratejiye listenin salt okunur
görünümünü verir. Main stratejiyi çalışırken değiştirir.

| # | Sahne | Ne gösterir? |
| --- | --- | --- |
| 1 | Giriş | Amaç (GoF), navigasyon benzetmesi; aynı altı durak, üç strateji: haritada üç farklı rota |
| 2 | Sorun | Harita ve kurye nesnesi (if/else dalları, `kalan` listesi randevu numaralarıyla): 1.0 ve 1.1 çalışır; 2.0’da soğuk zincir dalı listeyi sıralar, öğleden sonra randevu sırası bozulur (2 yanlış adım) |
| 3 | Çözüm | 3 adım: `RotaStratejisi` ve üç sınıf (hata sürer) → salt okunur görünüm (gerçek `UnsupportedOperationException`: hata yerinde yakalanır) → strateji yalnızca seçer (düzelir). Kurye nesnesinin büyük görünümü: algoritmanın yeri, geçiş anındaki liste, gün sonu teslim sırası |
| 4 | Canlı Akış ★ | Kurye stratejisine sorar, strateji yalnızca seçer, kurye listeyi günceller; Main stratejiyi çalışırken değiştirir. İki tarif: Soğuk zincir, sonra randevu · Randevusuz gün (en yakın durak; uzaklıklar haritada). Sahne, istek başına sıralama diyagramı ve sınıf diyagramı görünümleri |
| 5 | Rota Tezgâhı ★ | Strateji seçip teslimat yaptırın; aynı oturumu üç tasarımla karşılaştırın: if/else (2.0), kalıtım (her algoritma bir Kurye alt sınıfı, sonradan değiştirilemez), Strategy. Ölçüler: teslimat, km, yanlış adım, değiştirilemeyen seçim. ▶ Oynat kamyoneti bacak bacak yürütür |
| 6 | Yapı (UML) | Dört rol; bağlam ↔ strateji veri alışverişi (parametre mi, bağlamın kendisi mi); tuzak: durum tutan stratejiyi iki kuryenin paylaşması (gerçek `IllegalStateException`); lambda ile strateji; bedeli ve akrabaları |
| 7 | Genişlet | `AgirOnceRota` (boşluk doldurma): yeni strateji, Kurye değişmez. Çözülünce tezgâhta **Ağır önce** açılır |
| 8 | Gerçek Dünya | `Comparator` (`List.sort`; Türkçe `Collator` ile Çağla, Zeynep’ten önce gelir), `ThreadPoolExecutor` ret politikaları (`AbortPolicy`, `CallerRunsPolicy` …), Swing `LayoutManager` (GoF’un kendi örneği); State ve Template Method ile farkı |
| 9 | Quiz | 9 soru (kodda satır seçme dahil) + sürükle-bırak rol eşleştirme (dört rol) |
| 10 | Özet | Tek sayfalık özet; yazdırılabilir (PDF) |

Önerilen akış: State’ten sonra, 1 → 10 sırayla, toplam 45–55 dakika. Sorun sahnesinin 3. adımında sağdaki listeye dikkat
çekin: “randevu dalına kimse dokunmadı, neden bozuldu?” Çözüm’ün 1. adımında hatanın sürdüğünü, 2. adımda gerçek bir
istisnayla yakalandığını gösterin. Tezgâhın dört tasarımında (Ağır önce açıkken dahil) 4000 rastgele oturum tek bir Java
koşum programıyla gerçek `javac`/`java` çıktısına karşı denetlenmiştir.

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
  class-diagram.js             UML sınıf diyagramı (SVG; kalıtım, gerçekleme, toplama ◇; kesişen çizgilerde atlama kavisi)
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
js/patterns/bridge/            Bridge modülü
  data.js                      Java kodları (tüm sürümler), cihaz komutları, çıktılar, gerçek dünya örnekleri, diyagramlar (tek kaynak)
  stage.js                     eşleşme matrisi; köprü sahnesi (etiket nesnesi, köprü, yazıcı, basılan etiket)
  scenes-1/2/3.js              sahneler ve kalıp kaydı
js/patterns/composite/         Composite modülü
  data.js                      Java kodları (tüm sürümler), ağaç hesabı, Main üreticisi (güvenli/şeffaf), çıktılar, diyagramlar (tek kaynak)
  stage.js                     iç içe koliler: döngülerin eriştiği kat, çağrı ve dönüş jetonları, ara toplamlar, tıklanabilir tezgâh
  scenes-1/2/3.js              sahneler ve kalıp kaydı
js/patterns/decorator/         Decorator modülü
  data.js                      Java kodları (tüm sürümler), fiyat hesabı, çıktılar, gerçek dünya örnekleri, diyagramlar (tek kaynak)
  stage.js                     kombinasyon sınıfları ağacı; çekirdek + katmanlar (matruşka), çağrı ve dönüş jetonları
  scenes-1/2/3.js              sahneler ve kalıp kaydı
js/patterns/facade/            Facade modülü
  data.js                      Java kodları (tüm sürümler), istemci/cephe/Main üreticileri, çalıştırma benzetimi, değişiklik ölçüleri, diyagramlar (tek kaynak)
  stage.js                     gönderi merkezi: istemci kartları (içlerindeki iş akışı), cephe masası, alt sistem ofisleri, bağımlılık kabloları
  scenes-1/2/3.js              sahneler ve kalıp kaydı
js/patterns/flyweight/         Flyweight modülü
  data.js                      Java kodları (tüm sürümler), çalıştırma benzetimi (OutOfMemoryError dahil), örnek gönderiler, diyagramlar (tek kaynak)
  stage.js                     kurye tableti: Türkiye haritası, noktalar listesi, fabrikanın havuzu ya da ikon duvarı, 64 MB bellek göstergesi
  scenes-1/2/3.js              sahneler ve kalıp kaydı
js/patterns/proxy/             Proxy modülü
  data.js                      Java kodları (tüm sürümler), çalıştırma benzetimi, vekil ve Main üreticileri, çıktılar, diyagramlar (tek kaynak)
  stage.js                     istek hattı: istemci (içindeki denetim kodu), vekilin kapıları, GlobalShip sayaçları, istek jetonları
  scenes-1/2/3.js              sahneler ve kalıp kaydı
js/patterns/chain-of-responsibility/  Chain of Responsibility modülü
  data.js                      Java kodları (tüm sürümler), halka kuralları, zincir ve Main üreticileri, çalıştırma benzetimi, diyagramlar (tek kaynak)
  stage.js                     teslimat hattı: kurye, kapıdaki gönderi, halkalar (kural denetimi), sonraki okları, gönderi panosu; if/else merdivenleri
  scenes-1/2/3.js              sahneler ve kalıp kaydı
js/patterns/command/          Command modülü
  data.js                      Java kodları (tüm sürümler), Main üreticisi, çalıştırma benzetimi (olaylarıyla), tezgâh ölçüleri, diyagramlar (tek kaynak)
  stage.js                     depo: operatör paneli (geçmiş/ileri yığını ya da tek kayıt), raflar, kamyon, komut nesneleri ya da gece kuyruğu
  scenes-1/2/3.js              sahneler ve kalıp kaydı
js/patterns/mediator/         Mediator modülü
  data.js                      Java kodları (tüm sürümler ve ara adımlar), Main üreticisi, çalıştırma benzetimi (çağrılarıyla), bağların ve kural kopyalarının koddan çıkarılması, tezgâh ölçüleri, diyagramlar (tek kaynak)
  stage.js                     gönderi formu (kullanıcının gördüğü) ve “kim kimi tanıyor?” grafiği (ağ ya da yöneticiyle yıldız)
  scenes-1/2/3.js              sahneler ve kalıp kaydı
js/patterns/memento/          Memento modülü
  data.js                      Java kodları (tüm sürümler), Main üreticileri, nesne kimliklerini izleyen çalıştırma benzetimi, tezgâh ölçüleri, diyagramlar (tek kaynak)
  stage.js                     depo: raflar, kamyon, kaynak nesne ve hatıra masası, yedek defteri (açık sayfalar ya da mühürlü zarflar)
  scenes-1/2/3.js              sahneler ve kalıp kaydı
js/patterns/observer/         Observer modülü
  data.js                      Java kodları (tüm sürümler), Main üreticisi, abonelik niyetini de izleyen çalıştırma benzetimi, tezgâh ölçüleri, diyagramlar (tek kaynak)
  stage.js                     gönderi takibi: gönderi kartları (kodda sabit alanlar ya da abone listesi ve bildir()), teller ve ekranlar (telefon, panel, tablet, çağrı merkezi)
  scenes-1/2/3.js              sahneler ve kalıp kaydı
js/patterns/state/            State modülü
  data.js                      Java kodları (tüm sürümler ve adım adım taşıma), Main üreticisi, çalıştırma benzetimi (olaylarıyla, dolabın içiyle), tezgâh ölçüleri, diyagramlar (tek kaynak)
  stage.js                     akıllı dolap: ekran, kapak, tuş takımı; bağlam kartı ve durum oku; istekte bulunanlar; durum × istek ızgarası
  scenes-1/2/3.js              sahneler ve kalıp kaydı
js/patterns/strategy/         Strategy modülü
  data.js                      Java kodları (tüm sürümler, ara adımlar ve kalıtım tasarımı), Main üreticisi, rota benzetimi (olaylarıyla, listenin sırası dahil), tezgâh ölçüleri, gerçek dünya örnekleri, diyagramlar (tek kaynak)
  stage.js                     temsili Malatya haritası (duraklar, bacaklar, kamyonet) ve kurye nesnesi (if/else dalları, kalıtım sınıfı ya da strateji yuvası; kalan listesi; teslim sırası)
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
