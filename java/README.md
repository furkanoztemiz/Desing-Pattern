# Java örnekleri

Bu klasördeki kodlar, uygulamada gösterilen Java örnekleriyle **birebir aynıdır**.
Kaynaklar `js/patterns/<kalıp>/data.js` dosyalarıdır; `.java` dosyaları `tools/export-java.js` ile üretilir.

| Klasör | İçerik |
| --- | --- |
| `factorymethod/cozum` | Factory Method ile çözüm: Kara, Deniz ve Hava lojistiği |
| `factorymethod/sorun` | Kalıpsız sürüm 3.0: `if / else` ile araç seçimi (“Sorun” sahnesi) |
| `abstractfactory/cozum` | Abstract Factory ile çözüm: Kara, Deniz, Hava aileleri + testlerdeki sahte aile (`TestFabrikasi`) |
| `abstractfactory/sorun` | Kalıpsız sürüm 2.0: aile iki ayrı `switch` ile seçiliyor — **bilerek çöker** (“Sorun” sahnesi) |
| `singleton/sorun` | Kalıpsız sürüm 2.0: iki masa, iki üretici — **aynı takip numarası iki kez** verilir |
| `singleton/cozum` | Tembel (lazy) Singleton + elle yazılmış test koşucusu `UreticiTesti` (“Eleştiri” sahnesi) |
| `singleton/di` | Aynı program, bağımlılık enjeksiyonuyla (DI): tekliği sınıf değil `Main` sağlar |
| `singleton/yaris/*` | Altı yazım (`korumasiz`, `senkron`, `ciftkontrol`, `erken`, `tutucu`, `enumile`), iki thread’li deney |
| `singleton/kirmak/*` | Yansıma ve serileştirme saldırıları: `acik` (korumasız), `korumali`, `enumile` |
| `builder/sorun/teleskop` | Kalıpsız sürüm 2.0: teleskop kurucular — yeri karışan `boolean`’lar yüzünden yanlış gönderi |
| `builder/sorun/javabeans` | Kalıpsız sürüm 3.0: set metotları — kırılgan ama sigortasız, yarım nesne |
| `builder/cozum` | Akıcı Builder (Effective Java): `Gonderi.Builder` + Canlı Akış’taki üç program (`HataliGonderi` **bilerek çöker**) |
| `builder/yonetici` | GoF Builder: `GonderiYoneticisi` (Director) + dört hazırlayıcı: paket, etiket, fiyat, JSON |
| `prototype/sorun` | Kalıpsız sürüm 2.0: `instanceof` zinciriyle kopyalama — yeni `PaletGonderisi`’nde **bilerek çöker** |
| `prototype/cozum` | Prototype ile çözüm: her gönderi kendini kopyalar (`kopyala()` + kopya kurucular) |
| `prototype/kopya/sig` · `kopya/derin` | Kopya kurucudaki tek satır farklı: sığ kopyada şablon “zımba” ile kirlenir |
| `prototype/klon/*` | Java’nın `clone()`’u: `tuzak` (kurucu çalışmaz + sığ), `unutulan` (`Cloneable` yok → istisna), `duzeltme` (final’sız elle düzeltme), `kurucu` (önerilen kopya kurucu) |
| `prototype/katalog` | Prototip yöneticisi: şablonları adlarıyla saklayan `SablonKatalogu` |
| `adapter/sorun` | Kalıpsız sürüm 3.0: servisler GlobalShip’i doğrudan kullanır — iade **12 lb** bildirilir |
| `adapter/cozum` | Adapter ile çözüm: `GlobalShipAdaptoru` (nesne adaptörü), iki servis yalnızca `KargoFirmasi`’yı tanır |
| `adapter/akis` | Canlı Akış’taki tek gönderi |
| `adapter/bicim/*` | `nesne` · `sinif` (kalıtımla) · `sizinti` (sınıf adaptöründe yabancı metot dışarı sızar) · `finalnesne` (final kütüphane + nesne adaptörü) |
| `adapter/genislet` | İkinci yabancı ortak EuroCargo için `EuroCargoAdaptoru` |
| `bridge/sorun` | Kalıpsız sürüm 3.1: her (etiket × yazıcı) eşleşmesi bir sınıf (9 sınıf) — `^CI28` bir sınıfta unutuldu |
| `bridge/cozum` | Bridge ile çözüm: `Etiket` (soyutlama) ↔ `Yazici` (gerçekleştirici), köprü bir alan |
| `bridge/akis/*` | Canlı Akış'taki iki eşleşme: `kirilacakzebra` · `iadetermal` |
| `bridge/tezgah` | Aynı etiket başka yazıcıda, aynı yazıcı başka etikette, çalışma anında `yaziciDegistir` |
| `bridge/genislet` | Yeni gerçekleştirici `HtmlYazici`: etiket sınıflarına dokunmadan |
| `composite/sorun` | Kalıpsız sürüm 3.1: iki listeli koli, `Kantar`’ın iç içe döngüleri — saat kutusu (3. kat) sayılmıyor: **3100 g** |
| `composite/cozum` | Composite ile çözüm: `Parca` (bileşen), `Urun` (yaprak), `Koli` (bileşik); özyineleme her kata iner |
| `composite/akis/*` | Canlı Akış’taki iki tarif: `agirlik` (son sıra) · `listele` (ön sıra) |
| `composite/tezgah` | Paketleme tezgâhındaki yeni dal: hediye kutusu, balonlu poşet — yalnızca `Main` değişir |
| `composite/seffaf` | Şeffaf tasarım: `ekle` `Parca`’da; ürünün içine ekleme **bilerek çöker** (`UnsupportedOperationException`) |
| `composite/genislet` | Yeni bileşik `Palet`: sipariş kolisi ve kolisiz bisiklet aynı palette, hiçbir sınıfa dokunmadan |
| `decorator/sorun` | Kalıpsız sürüm 3.1: her kombinasyon bir alt sınıf (8 sınıf) — zamda bir sınıf unutuldu, fiyat listesi **tutarsız** |
| `decorator/cozum` | Decorator ile çözüm: ek hizmetler çekirdeği saran katmanlar, `new Sigorta(new Ekspres(new StandartKargo()))` |
| `decorator/akis/*` | Canlı Akış’taki iki tarif: `ekspressigorta` · `zarfsms` |
| `decorator/tezgah` | Katman sırası (indirim dışta 112 TL, içte 120 TL) ve aynı katmanın iki kez kullanılması |
| `decorator/genislet` | Yeni katman `HediyePaketi`: hiçbir sınıfa dokunmadan |
| `facade/sorun` | Kalıpsız sürüm 2.1: iş akışı istemcilerde — web sitesinde kart limiti unutuldu, **hayalet gönderi** |
| `facade/cozum` | Facade ile çözüm: `GonderiCephesi` yedi alt sistemi doğru sırayla çalıştırır; istemciler tek çağrı yapar |
| `facade/akis/*` | Canlı Akış’taki iki tarif: `ali` (başarılı) · `can` (kart limiti: akış durur) |
| `facade/tezgah/*` | Üç değişiklik isteği, üç istemci: `kalipsiz` (4 dosya değişti) · `cepheli` (2 dosya) |
| `facade/genislet` | Yeni istemci `KurumsalApi`: alt sistemlerin hiçbirini tanımadan, tek bağımlılıkla |
| `flyweight/sorun` | Kalıpsız sürüm 2.0: her nokta kendi ikonunu yükler — 10.000 noktada 160.000 KB, kurye tabletinde (`-Xmx64m`) **bilerek çöker** (`OutOfMemoryError`) |
| `flyweight/kestirme` | Kestirme sürüm 2.1: bütün nokta türe göre paylaşılır — 3 ikon, ama noktalar üç yere yığılır (KRG-1001 kayıp) |
| `flyweight/cozum` | Flyweight ile çözüm: `IsaretTuru` (paylaşılan, değişmez), `IsaretFabrikasi` (havuz), `HaritaNoktasi` (dışsal durum) — 10.000 nokta, 3 ikon |
| `flyweight/akis` | Canlı Akış’taki üç gönderi |
| `flyweight/genislet` | Paylaşılmayan `DepoIsareti`: aynı arayüz, fabrikadan geçmez, hiçbir sınıfa dokunmadan |
| `proxy/sorun` | Kalıpsız sürüm 3.1: denetim istemcilerin içinde — mobilde KVKK unutuldu, Ali’nin adresi **sızar** |
| `proxy/cozum` | Proxy ile çözüm: `TakipVekili` araya girer (koruma, önbellek, sanal); istemcilerde denetim kodu yok |
| `proxy/akis/*` | Canlı Akış’taki iki tarif: `ali` (önbellek) · `ayse` (kapıda kalan istek) |
| `proxy/tezgah/*` | Aynı meraklı müşteri trafiği: `vekilsiz` (iki sızıntı) · `vekilli` |
| `proxy/genislet` | Yeni istemci `SmsBildirim`: sıfır denetim kodu, yine de korunuyor |
| `chainofresponsibility/sorun` | Kalıpsız sürüm 2.1: kararlar kuryelerin `if/else` merdiveninde — İstanbul kopyasında dolap dalı yukarı taşındı, **ilaç dolaba girer** |
| `chainofresponsibility/cozum` | Chain of Responsibility ile çözüm: `TeslimatAdimi` halkaları; `Main` aynı sınıflarla Malatya ve İstanbul zincirini kurar |
| `chainofresponsibility/akis/*` | Canlı Akış’taki iki tarif: `ayse` (Malatya) · `zeynep` (İstanbul, ilaç) |
| `chainofresponsibility/tezgah/*` | Aynı halkalar, üç zincir: `dolaponce` · `subeonce` (sıra = öncelik) · `iadesiz` (**KAYIP**) |
| `chainofresponsibility/genislet` | Yeni halka `MarketeTeslim`: kurye ve öbür halkalar değişmeden |
| `command/sorun` | Kalıpsız sürüm 2.1: dizgi + `switch`; ikinci “geri al” boşa gider, gece işi `"YÜKLE"` yüzünden **02:00’de çöker** |
| `command/cozum` | Command ile çözüm: `TasiKomutu`, `YukleKomutu`; panel geçmiş/ileri yığını, gece işi komut kuyruğu tutar |
| `command/akis/*` | Canlı Akış’taki iki tarif: `gun` (iki hata, iki geri al) · `gece` (komut kuyruğu) |
| `command/tezgah/*` | Aynı oturum, iki tasarım: `kalipsiz` (tek kayıt) · `komutlu` (geçmiş yığını) |
| `command/genislet` | `MakroKomut`: üç yükleme tek komut, tek “geri al” hepsini ters sırayla geri alır |
| `mediator/sorun` | Kalıpsız sürüm 2.0: öğeler birbirini tanıyor (13 bağ); dolap kuralının iki kopyası soğuk zinciri bilmiyor — **ilaç dolaba** |
| `mediator/cozum` | Mediator ile çözüm: `FormYoneticisi`, `FormOgesi`; kuralların hepsi `GonderiFormu.degisti()` içinde |
| `mediator/akis/*` | Canlı Akış’taki iki tarif: `ilac` (önce soğuk zincir, sonra şehir) · `agir` (25 kg: zincirleme değişiklik) |
| `mediator/tezgah/*` | Aynı tıklamalar, üç tasarım: `daginik` · `kopyali` · `mediator` |
| `mediator/tuzak` | Teslimat seçici yöneticinin ayarını yeniden bildirir: gerçek `StackOverflowError` (bilerek çöker) |
| `mediator/genislet` | Yeni öğe `SigortaKutusu`: öteki öğeler değişmeden, yalnızca yönetici değişir |
| `memento/sorun` | Kalıpsız sürüm 2.0: yedeği defter alıyor (get/set); depoya eklenen kamyon yedeklenmiyor — **koliler iki yerde** |
| `memento/cozum` | Memento ile çözüm: `Depo.Hatira` (alanları özel); depo kendi hatırasını oluşturur, defter yalnızca saklar |
| `memento/akis/*` | Canlı Akış’taki iki tarif: `gece` (plan iptal, geri dönüş) · `noktalar` (iki kayıt noktası) |
| `memento/tezgah/*` | Aynı oturum, üç yöntem: `referans` · `kopya` · `hatira` |
| `memento/genislet` | `DepoGecmisi`: hatıralarla geri al / yinele; Depo ve defter değişmeden |
| `observer/sorun` | Kalıpsız sürüm 2.0: Gonderi ekranları adıyla çağırıyor; `teslimEt` tableti unutuyor — **panel “teslim edildi”, tablet “rotada”** |
| `observer/cozum` | Observer ile çözüm: `GonderiGozlemcisi` arayüzü, abone listesi ve tek `bildir()`; ekranları Main abone eder |
| `observer/akis/*` | Canlı Akış’taki iki tarif: `gun` (üç abone, teslimata kadar) · `iki` (iki gönderi, tek panel, abonelikten çıkma) |
| `observer/tezgah/*` | Aynı oturum, üç tasarım: `dogrudan` · `sabit` · `observer` |
| `observer/tuzak` | Telefon bildirim sırasında kendini listeden çıkarır: gerçek `ConcurrentModificationException` (bilerek çöker) |
| `observer/genislet` | Yeni gözlemci `CagriMerkezi`: Gonderi ve öteki ekranlar değişmeden |
| `state/sorun` | Kalıpsız sürüm 2.0: durum bir dizgi, her metotta `if/else`; `paketKoy`’un `else` dalı KİLİTLİ’yi de BOŞ sanır — **kilitli dolaba paket konur** |
| `state/cozum` | State ile çözüm: `BosDurum`, `DoluDurum`, `KilitliDurum`; `KargoDolabi` isteği o anki durum nesnesine devreder |
| `state/akis/*` | Canlı Akış’taki iki tarif: `kilit` (üç hatalı kod, kilit, görevli) · `teslim` (dolu dolaba ikinci paket) |
| `state/tezgah/*` | Aynı oturum, iki tasarım: `kalipsiz` (if/else) · `durumlu` (durum nesneleri) |
| `state/genislet` | Yeni durum `HizmetDisiDurum`: `BosDurum`’da tek satır değişir, öbür sınıflar aynı kalır |
| `strategy/sorun` | Kalıpsız sürüm 2.0: rota algoritmaları `Kurye`’nin içinde (String + if/else); `SOGUK_ONCE` dalı ortak listeyi sıralıyor — **randevu sırası 1, 4, 3, 2** |
| `strategy/cozum` | Strategy ile çözüm: `RotaStratejisi` ve üç strateji; `Kurye` stratejiye listenin salt okunur görünümünü verir |
| `strategy/akis/*` | Canlı Akış’taki iki tarif: `gun` (soğuk zincir önce, sonra randevu) · `yakin` (randevusuz gün: en yakın durak) |
| `strategy/tezgah/*` | Aynı istekler, üç tasarım: `ifelse` · `kalitim` (strateji değiştirilemez) · `strateji` |
| `strategy/tuzak` | Durum tutan `PlanliRota` iki kuryeye birden verilir: gerçek `IllegalStateException` (bilerek çöker) |
| `strategy/genislet` | Yeni strateji `AgirOnceRota`: `Kurye` ve öteki stratejiler değişmeden |

## Derleme (Java 17 veya üstü)

Bu klasörde (`java/`) bir terminal açın ve **tüm** örnekleri tek komutla derleyin.

Git Bash, macOS ya da Linux:

```bash
javac -encoding UTF-8 -d out $(find . -name "*.java")
```

Windows PowerShell:

```powershell
javac -encoding UTF-8 -d out (Get-ChildItem -Recurse -Filter *.java).FullName
```

> `-encoding UTF-8`: kaynaklardaki Türkçe karakterlerin Java 17’de de doğru okunması için.
> Windows terminalinde çıktıdaki Türkçe karakterler bozuk görünürse `java` komutlarına
> `-Dstdout.encoding=UTF-8 -Dstderr.encoding=UTF-8` ekleyin ya da önce `chcp 65001` çalıştırın.
> IDE konsollarında sorun olmaz.

## Factory Method

```bash
java -cp out factorymethod.cozum.Main
```

Beklenen çıktı:

```text
[Plan] 20 ton kayısı için araç hazırlanıyor...
[Kamyon] 20 ton kayısı karayoluyla teslim edildi.
[Plan] 300 konteyner fındık için araç hazırlanıyor...
[Gemi] 300 konteyner fındık denizyoluyla teslim edildi.
[Plan] acil ilaç kolisi için araç hazırlanıyor...
[Uçak] acil ilaç kolisi havayoluyla teslim edildi.
```

Kalıpsız sürümü çalıştırmak için:

```bash
java -cp out factorymethod.sorun.Main
```

## Abstract Factory

```bash
java -cp out abstractfactory.cozum.Main
```

Beklenen çıktı:

```text
[CMR] 20 ton kayısı için karayolu taşıma senedi düzenlendi.
[Gümrük] CMR onaylandı.
[Kamyon] 20 ton kayısı karayoluyla teslim edildi.
[Konşimento] 300 konteyner fındık için deniz yolu taşıma senedi düzenlendi.
[Gümrük] Konşimento onaylandı.
[Gemi] 300 konteyner fındık denizyoluyla teslim edildi.
[AWB] acil ilaç kolisi için hava yolu taşıma senedi düzenlendi.
[Gümrük] AWB onaylandı.
[Uçak] acil ilaç kolisi havayoluyla teslim edildi.
```

Sahte aileyle (testteki gibi) çalıştırmak için:

```bash
java -cp out abstractfactory.cozum.TestFabrikasi
```

Kalıpsız sürüm 2.0 hava gönderisinde **bilerek** çöker — derste gösterilecek hata budur:

```bash
java -cp out abstractfactory.sorun.Main
```

```text
...
[CMR] acil ilaç kolisi için karayolu taşıma senedi düzenlendi.
Exception in thread "main" java.lang.IllegalStateException: Gümrük: AWB bekleniyordu, CMR geldi!
```

## Singleton

### Sorun: iki nesne, aynı numara

```bash
java -cp out singleton.sorun.Main
```

```text
[Üretici] yeni nesne oluşturuldu (sayaç: 1000)
[Üretici] yeni nesne oluşturuldu (sayaç: 1000)
[Sipariş] 20 ton kayısı için takip no: KRG-1001
[Sipariş] 300 konteyner fındık için takip no: KRG-1002
[İade] hasarlı koli için takip no: KRG-1001
```

### Çözüm: tek nesne

```bash
java -cp out singleton.cozum.Main
```

```text
[Üretici] yeni nesne oluşturuldu (sayaç: 1000)
[Sipariş] 20 ton kayısı için takip no: KRG-1001
[Sipariş] 300 konteyner fındık için takip no: KRG-1002
[İade] hasarlı koli için takip no: KRG-1003
Aynı nesne mi? true
```

### Test sorunu ve bağımlılık enjeksiyonu

Testleri istediğiniz sırayla çalıştırın (`A`, `B`, `A B`, `B A`). Singleton sürümünde testler
**tek başına geçer, birlikte kalır**; DI sürümünde her sırada geçer:

```bash
java -cp out singleton.cozum.UreticiTesti A B
```

```text
[Üretici] yeni nesne oluşturuldu (sayaç: 1000)
[Sipariş] test kolisi için takip no: KRG-1001
[GEÇTİ] Test A (sipariş)
[İade] test iadesi için takip no: KRG-1002
[KALDI] Test B (iade): KRG-1001 bekleniyordu, KRG-1002 geldi
```

```bash
java -cp out singleton.di.UreticiTesti B A
```

```text
[Üretici] yeni nesne oluşturuldu (sayaç: 1000)
[İade] test iadesi için takip no: KRG-1001
[GEÇTİ] Test B (iade)
[Üretici] yeni nesne oluşturuldu (sayaç: 1000)
[Sipariş] test kolisi için takip no: KRG-1001
[GEÇTİ] Test A (sipariş)
```

### Thread yarışı: altı yazım

Her yazımın kendi paketi var; aynı `YarisDeneyi` iki thread’i neredeyse aynı anda başlatır.
Kurucu, son numarayı “veritabanından” ~100 ms’de okur — yarış penceresi bu yüzden geniştir.

```bash
java -cp out singleton.yaris.korumasiz.YarisDeneyi
```

```text
[Üretici] yeni nesne oluşturuldu (T1)
[Üretici] yeni nesne oluşturuldu (T2)
T1 aldı: KRG-1001
T2 aldı: KRG-1001
```

Korumasız yazım denemelerimizde her seferinde **iki nesne** üretti. Diğer beş yazımda
(`senkron`, `ciftkontrol`, `erken`, `tutucu`, `enumile`) tek nesne oluşur:

```bash
java -cp out singleton.yaris.tutucu.YarisDeneyi
```

```text
[Üretici] yeni nesne oluşturuldu (T1)
T1 aldı: KRG-1001
T2 aldı: KRG-1002
```

> Satırların sırası ve hangi thread’in önce geldiği çalıştırmadan çalıştırmaya değişebilir.

### Singleton’ı kırmak

```bash
java -cp out singleton.kirmak.acik.YansimaSaldirisi
java -cp out singleton.kirmak.acik.SerilestirmeSaldirisi
```

| Paket | `YansimaSaldirisi` | `SerilestirmeSaldirisi` |
| --- | --- | --- |
| `acik` (korumasız) | iki nesne → `Aynı nesne mi? false` | kurucusuz kopya → `Aynı nesne mi? false` |
| `korumali` (kurucu kontrolü + `readResolve`) | `Saldırı engellendi: İkinci nesne oluşturulamaz!` | `Aynı nesne mi? true` |
| `enumile` | `Saldırı engellendi: Cannot reflectively create enum objects` | `Aynı nesne mi? true` |

## Builder

### Sorun: teleskop kurucular ve set metotları

```bash
java -cp out builder.sorun.teleskop.Main
```

```text
Gönderi[Malatya > Ankara, 20 kg]
Gönderi[İstanbul > Van, 4 kg, SOĞUK ZİNCİR, EKSPRES, sigorta 20000 TL]
Gönderi[Kütahya > İzmir, 12 kg, SOĞUK ZİNCİR, sigorta 5000 TL]
```

Son satır hatalı: cam vazo **kırılgan** olacaktı ama `true` yanlış parametreye (`sogukZincir`) gitti ve derleyici bir şey demedi.

```bash
java -cp out builder.sorun.javabeans.Main
```

```text
Gönderi[Kütahya > İzmir, 12 kg, KIRILGAN]
```

Kırılgan ama sigortasız: `setSigorta(...)` unutuldu ve kuralı denetleyecek bir “bitti” anı yok.

### Çözüm: akıcı Builder

```bash
java -cp out builder.cozum.Main
```

```text
Gönderi[Malatya > Ankara, 20 kg]
Gönderi[İstanbul > Van, 4 kg, SOĞUK ZİNCİR, EKSPRES, sigorta 20000 TL]
Gönderi[Kütahya > İzmir, 12 kg, KIRILGAN, sigorta 5000 TL]
```

Canlı Akış’taki programlar: `builder.cozum.VazoGonderisi`, `builder.cozum.AsiGonderisi` ve
**bilerek çöken** `builder.cozum.HataliGonderi` (sigortası unutulmuş kırılgan gönderi `build()`’de reddedilir):

```text
Exception in thread "main" java.lang.IllegalStateException: Gönderi: kırılgan eşya sigortasız gönderilemez!
	at builder.cozum.Gonderi$Builder.build(Gonderi.java:91)
	at builder.cozum.HataliGonderi.main(HataliGonderi.java:12)
```

> Dışa aktarılan dosyaların başına iki satırlık açıklama ve `package` satırı eklenir; bu yüzden
> yığın izindeki satır numaraları uygulamada gösterilenlerden 3 fazladır.

### GoF Builder: aynı tarif, dört temsil

```bash
java -cp out builder.yonetici.Main
```

```text
Gönderi[İstanbul > Van, 4 kg, SOĞUK ZİNCİR, EKSPRES, sigorta 20000 TL]
KARGO ETİKETİ
Gönderen : İstanbul
Alıcı    : Van
Ağırlık  : 4 kg
** SOĞUK ZİNCİR: 2-8 C **
>> EKSPRES >>
Sigorta  : 20000 TL
Fiyat: 579 TL
{"nereden": "İstanbul", "nereye": "Van", "agirlik": 4, "sogukZincir": true, "ekspres": true, "sigorta": 20000}
```

## Prototype

### Sorun: instanceof zinciri

```bash
java -cp out prototype.sorun.Main
```

```text
  [AdresServisi] Ayşe Kırtasiye doğrulanıyor... (~2 sn)
  [AdresServisi] Noter Ofisi doğrulanıyor... (~2 sn)
  [AdresServisi] Demir Fabrikası doğrulanıyor... (~2 sn)
--- Geçen haftakini tekrarla ---
  [AdresServisi] Ayşe Kırtasiye doğrulanıyor... (~2 sn)
Koli[Ayşe Kırtasiye: A4 kağıt, toner | 12 kg]
  [AdresServisi] Noter Ofisi doğrulanıyor... (~2 sn)
Zarf[Noter Ofisi: sözleşme | iadeli]
Exception in thread "main" java.lang.IllegalArgumentException: Bilinmeyen gönderi türü: PaletGonderisi
	at prototype.sorun.SiparisEkrani.tekrarla(SiparisEkrani.java:16)
	at prototype.sorun.Main.main(Main.java:16)
```

Kopyalar sıfırdan kurulduğu için adres servisi **yeniden** çağrılıyor; `SiparisEkrani` yeni türü tanımadığı için de program çöküyor.

### Çözüm: her gönderi kendini kopyalar

```bash
java -cp out prototype.cozum.Main
```

```text
  [AdresServisi] Ayşe Kırtasiye doğrulanıyor... (~2 sn)
  [AdresServisi] Noter Ofisi doğrulanıyor... (~2 sn)
  [AdresServisi] Demir Fabrikası doğrulanıyor... (~2 sn)
--- Geçen haftakini tekrarla ---
Koli[Ayşe Kırtasiye: A4 kağıt, toner | 12 kg]
Zarf[Noter Ofisi: sözleşme | iadeli]
Palet[Demir Fabrikası: cıvata, somun | 2 palet]
Adres sorgusu: 3
```

### Sığ ↔ derin kopya

```bash
java -cp out prototype.kopya.sig.Main
java -cp out prototype.kopya.derin.Main
```

| Satır | `kopya.sig` | `kopya.derin` |
| --- | --- | --- |
| `şablon` | `Koli[Ayşe Kırtasiye: A4 kağıt, toner, zımba \| 12 kg]` | `Koli[Ayşe Kırtasiye: A4 kağıt, toner \| 12 kg]` |
| `bu hafta` | `Koli[Ayşe Kırtasiye: A4 kağıt, toner, zımba \| 12 kg]` | `Koli[Ayşe Kırtasiye: A4 kağıt, toner, zımba \| 12 kg]` |
| `gelecek hafta` | `Koli[Ayşe Kırtasiye: A4 kağıt, toner, zımba \| 12 kg]` | `Koli[Ayşe Kırtasiye: A4 kağıt, toner \| 12 kg]` |

İki paket arasındaki tek fark `Gonderi` kopya kurucusundaki satırdır:
`this.icerik = kaynak.icerik;` (sığ) ↔ `this.icerik = new ArrayList<>(kaynak.icerik);` (derin).

### Java’da clone(): tuzaklar

```bash
java -cp out prototype.klon.tuzak.Main
```

```text
  kurucu çalıştı: KRG-1001
şablon: KRG-1001 Ayşe Kırtasiye: A4 kağıt, toner, zımba
kopya : KRG-1001 Ayşe Kırtasiye: A4 kağıt, toner, zımba
```

Üç sürpriz birden: kurucu **bir kez** çalıştı, iki kolinin takip numarası **aynı**, liste **paylaşıldı**.
`prototype.klon.unutulan` (`implements Cloneable` yok) derlenir ama çalışırken çöker:

```text
Exception in thread "main" java.lang.AssertionError: java.lang.CloneNotSupportedException: prototype.klon.unutulan.Koli
	at prototype.klon.unutulan.Koli.clone(Koli.java:27)
	at prototype.klon.unutulan.Main.main(Main.java:10)
Caused by: java.lang.CloneNotSupportedException: prototype.klon.unutulan.Koli
	at java.base/java.lang.Object.clone(Native Method)
	at prototype.klon.unutulan.Koli.clone(Koli.java:25)
	... 1 more
```

`prototype.klon.duzeltme` (final’sız, elle derin kopya) ve önerilen `prototype.klon.kurucu` (kopya kurucu) doğru sonucu verir:

```text
  kurucu çalıştı: KRG-1001
  kopya kurucu çalıştı: KRG-1002
şablon: KRG-1001 Ayşe Kırtasiye: A4 kağıt, toner
kopya : KRG-1002 Ayşe Kırtasiye: A4 kağıt, toner, zımba
```

(İkinci satır yalnızca `kurucu` sürümünde vardır.) Uygulamadaki “final alanlar” adımı **derlenmeyen** bir sürümdür;
bu yüzden dışa aktarılmadı: `klon/duzeltme/Koli.java` içindeki `takipNo` ve `icerik` alanlarını `final` yapıp
derleyerek o hatayı kendiniz görebilirsiniz.

### Şablon kataloğu (Prototype Manager)

```bash
java -cp out prototype.katalog.Main
```

```text
  [AdresServisi] Ayşe Kırtasiye doğrulanıyor... (~2 sn)
  [AdresServisi] Noter Ofisi doğrulanıyor... (~2 sn)
  [AdresServisi] Demir Fabrikası doğrulanıyor... (~2 sn)
  [AdresServisi] Şifa Eczanesi doğrulanıyor... (~2 sn)
Koli[Ayşe Kırtasiye: A4 kağıt, toner, zımba | 12 kg]
Koli[Ayşe Kırtasiye: A4 kağıt, toner | 12 kg]
Koli[Şifa Eczanesi: aşı, serum | 3 kg]
Adres sorgusu: 4
```

## Adapter

### Sorun: istemciler yabancı API’yi öğreniyor

```bash
java -cp out adapter.sorun.Main
```

```text
[HızlıKargo] HK-1001: Malatya > Ankara, 20 kg
Takip no: HK-1001 | durum: Dağıtımda
[GlobalShip] #48213 created: İstanbul -> Berlin, 26.46 lb
Takip no: GS-48213 | durum: Yolda
[GlobalShip] #48214 created: Berlin -> İstanbul, 12.00 lb
İade takip no: GS-48214
```

Aynı 12 kg’lık koli gidişte 26.46 lb, iadede 12.00 lb bildirildi: `IadeServisi` çeviri kodunu kopyalarken
`* 2.20462`’yi unuttu ve `int` → `double` genişlemesi yüzünden derleyici bir şey demedi.

### Çözüm: nesne adaptörü

```bash
java -cp out adapter.cozum.Main
```

```text
[HızlıKargo] HK-1001: Malatya > Ankara, 20 kg
Takip no: HK-1001 | durum: Dağıtımda
[GlobalShip] #48213 created: İstanbul -> Berlin, 26.46 lb
Takip no: GS-48213 | durum: Yolda
[GlobalShip] #48214 created: Berlin -> İstanbul, 26.46 lb
İade takip no: GS-48214
```

`adapter.akis.Main` yalnızca Canlı Akış’taki tek gönderiyi (ilk iki GlobalShip satırı) çalıştırır.

### Nesne ↔ sınıf adaptörü

`adapter.bicim.nesne`, `adapter.bicim.sinif` ve `adapter.bicim.finalnesne` aynı çıktıyı verir:

```text
[GlobalShip] #48213 created: İstanbul -> Berlin, 26.46 lb
Takip no: GS-48213 | durum: Yolda
```

`adapter.bicim.sizinti` ise sınıf adaptörünün miras aldığı `createShipment`’ın doğrudan çağrılabildiğini gösterir:
üçüncü satır yine `12.00 lb`’dir. Uygulamadaki iki derleme hatası bilerek dışa aktarılmadı; kendiniz deneyin:

- `bicim/nesne/Main.java` içine `adaptor.createShipment(...)` satırını ekleyin (değişken tipi `GlobalShipAdaptoru`): *cannot find symbol*.
- `bicim/sinif/GlobalShipApi.java` sınıfını `final` yapın: *cannot inherit from final GlobalShipApi*.

### Genişlet: ikinci yabancı ortak

```bash
java -cp out adapter.genislet.Main
```

```text
[HızlıKargo] HK-1001: Malatya > Ankara, 20 kg
Takip no: HK-1001 | durum: Dağıtımda
[GlobalShip] #48213 created: İstanbul -> Berlin, 26.46 lb
Takip no: GS-48213 | durum: Yolda
[EuroCargo] EC/7731 booked: İzmir > Roma, 3000 g
Takip no: EC/7731 | durum: Yolda
```

> GlobalShip kütüphanesi ondalıkları `Locale.US` ile yazdırır (`26.46`); bilgisayarınızın dil ayarı ne olursa olsun çıktı aynıdır.

## Bridge

### Sorun: her eşleşme bir sınıf

```bash
java -cp out bridge.sorun.Main
```

```text
[Zebra] ^XA^CI28
[Zebra] ^FO40,40^A0N,30^FDAli Şahin^FS
[Zebra] ^FO40,96^BCN,80^FDKRG-1001^FS
[Zebra] ^XZ
[Zebra] ^XA
[Zebra] ^FO16,16^GB768,448,4^FS
[Zebra] ^FO40,40^A0N,30^FDKIRILACAK^FS
[Zebra] ^FO40,96^A0N,30^FDAyşe Yılmaz^FS
[Zebra] ^FO40,152^BCN,80^FDKRG-1002^FS
[Zebra] ^XZ
```

Dokuz sınıf (3 etiket türü × 3 yazıcı). Türkçe karakterler için `^CI28` Zebra kodunun yazılı olduğu üç sınıftan ikisine
eklendi; `ZebraKirilacakEtiket` unutuldu. İkinci etiketin ilk satırı yalnızca `^XA`: yazıcı UTF-8 baytlarını varsayılan
kod sayfasıyla okur ve cam vazonun etiketine "Ay┼ƒe Y─▒lmaz" basar.

### Çözüm: Etiket ↔ Yazici köprüsü

```bash
java -cp out bridge.cozum.Main
```

```text
[Zebra] ^XA^CI28
[Zebra] ^FO40,40^A0N,30^FDAli Şahin^FS
[Zebra] ^FO40,96^BCN,80^FDKRG-1001^FS
[Zebra] ^XZ
[Zebra] ^XA^CI28
[Zebra] ^FO16,16^GB768,448,4^FS
[Zebra] ^FO40,40^A0N,30^FDKIRILACAK^FS
[Zebra] ^FO40,96^A0N,30^FDAyşe Yılmaz^FS
[Zebra] ^FO40,152^BCN,80^FDKRG-1002^FS
[Zebra] ^XZ
```

`^CI28` artık yalnızca `ZebraYazici.basla()` içinde: bütün etiket türleri düzeldi. `bridge.akis.kirilacakzebra.Main`
ve `bridge.akis.iadetermal.Main` Canlı Akış'taki iki eşleşmeyi tek tek basar.

### Eşleştirme tezgâhı: çalışma anında birleştirme

```bash
java -cp out bridge.tezgah.Main
```

```text
[Termal] ESC @
[Termal] ------------------------
[Termal] KIRILACAK
[Termal] Ayşe Yılmaz
[Termal] GS k KRG-1002
[Termal] GS V (kes)
[Termal] ESC @
[Termal] İADE: Malatya depo
[Termal] Zeynep Güneş
[Termal] GS k KRG-1003
[Termal] GS V (kes)
[PDF] yeni sayfa: 100 x 60 mm
[PDF] dikdörtgen (2, 2) 96 x 56 mm
[PDF] yazı (5, 5) "KIRILACAK"
[PDF] yazı (5, 12) "Ayşe Yılmaz"
[PDF] barkod (5, 19) Code128: KRG-1002
[PDF] sayfa kaydedildi
```

Aynı etiket başka bir yazıcıda (termal: çerçeve yerine çizgi), aynı yazıcı başka bir etikette ve son olarak Zebra'ya
bağlı bir etiket nesnesinin `yaziciDegistir(new PdfYazici())` ile çalışma anında PDF'e geçmesi.

### Genişlet: yeni gerçekleştirici

```bash
java -cp out bridge.genislet.Main
```

```text
[HTML] <div class="etiket">
[HTML] <div class="cerceve"></div>
[HTML] <p style="left:5mm; top:5mm">KIRILACAK</p>
[HTML] <p style="left:5mm; top:12mm">Ayşe Yılmaz</p>
[HTML] <svg class="barkod">KRG-1002</svg>
[HTML] </div>
[HTML] <div class="etiket">
[HTML] <p style="left:5mm; top:5mm">İADE: Malatya depo</p>
[HTML] <p style="left:5mm; top:12mm">Zeynep Güneş</p>
[HTML] <svg class="barkod">KRG-1003</svg>
[HTML] </div>
```

`HtmlYazici` eklendi; hiçbir etiket sınıfı değişmedi ve yeni yazıcı iki etiket türüyle de çalışıyor.

## Composite

### Sorun: iç içe döngüler

```bash
java -cp out composite.sorun.Main
```

```text
+ Sipariş KRG-2001 [3100 g]
   - Laptop (2000 g)
   - Kılıf (200 g)
   + Aksesuar kutusu [900 g]
      - Mouse (100 g)
      - Şarj aleti (400 g)
- Bisiklet (12000 g)
Sevkiyat: 15100 g
```

`Kantar` kolinin içine iki kat iniyor (“koli içinde koli: bir kat yeter herhalde”). Saat kutusu üçüncü katta: listede
yok, ağırlığı toplama girmedi. Sayıları toplayın: 300 + 2000 + 200 + 900 = 3400, ama sipariş 3100 diyor. Aynı aksesuar
kutusu tek başına 900 g, siparişin içinde 600 g sayılıyor. Kod derlendi, uyarı da yok.

### Çözüm: ürün de koli de bir Parca

```bash
java -cp out composite.cozum.Main
```

```text
+ Sipariş KRG-2001 [3400 g]
   - Laptop (2000 g)
   + Aksesuar kutusu [900 g]
      - Mouse (100 g)
      - Şarj aleti (400 g)
      + Saat kutusu [300 g]
         - Saat (200 g)
   - Kılıf (200 g)
- Bisiklet (12000 g)
Sevkiyat: 15400 g
```

`Koli.agirlik()` kendi darasına her parçanın ağırlığını ekliyor: `toplam += p.agirlik();` — parça bir koliyse soru onun
içine iner. Kantar silindi; `Main` koliyi ve bisikleti aynı listede geziyor: `for (Parca p : sevkiyat)`. Sıra da korunuyor.
`composite.akis.agirlik.Main` (`Toplam: 3400 g`) ve `composite.akis.listele.Main` Canlı Akış’taki iki tarifi çalıştırır.

### Paketleme tezgâhı: yeni bir dal

```bash
java -cp out composite.tezgah.Main
```

```text
+ Sipariş KRG-2001 [4300 g]
   - Laptop (2000 g)
   + Aksesuar kutusu [900 g]
      - Mouse (100 g)
      - Şarj aleti (400 g)
      + Saat kutusu [300 g]
         - Saat (200 g)
   - Kılıf (200 g)
   + Hediye kutusu [900 g]
      - Kupa (300 g)
      + Balonlu poşet [450 g]
         - Parfüm (400 g)
Toplam: 4300 g
```

Hediye kutusu ve balonlu poşet eklendi; yalnızca `Main`’deki `ekle` satırları değişti.

### Şeffaf tasarım: ürünün içine ekleme (bilerek çöker)

```bash
java -cp out composite.seffaf.Main
```

```text
Exception in thread "main" java.lang.UnsupportedOperationException: Ürünün içine parça konamaz
	at composite.seffaf.Parca.ekle(Parca.java:14)
	at composite.seffaf.Main.main(Main.java:30)
```

Bu pakette `ekle` arayüzde (`Parca`) tanımlı ve varsayılanı istisna fırlatıyor (GoF’un şeması). `laptop.ekle(…)` derlenir,
hata çalışma anına kalır. Güvenli tasarımda (`ekle` yalnızca `Koli`’de, `composite.cozum`’daki gibi) aynı satır
**derlenmez**; uygulamadaki Paketleme Tezgâhı programının `javac` çıktısı:

```text
Main.java:27: error: cannot find symbol
        laptop.ekle(new Urun("Kitap", 500));    // ürünün içine?
              ^
  symbol:   method ekle(Urun)
  location: variable laptop of type Parca
1 error
```

### Genişlet: yeni bileşik

```bash
java -cp out composite.genislet.Main
```

```text
# Palet: Malatya [35400 g]
   + Sipariş KRG-2001 [3400 g]
      - Laptop (2000 g)
      + Aksesuar kutusu [900 g]
         - Mouse (100 g)
         - Şarj aleti (400 g)
         + Saat kutusu [300 g]
            - Saat (200 g)
      - Kılıf (200 g)
   - Bisiklet (12000 g)
```

`Palet` eklendi; `Parca`, `Urun` ve `Koli` değişmedi. Sipariş ağacının tamamı bir kat içeriden listelendi.

## Decorator

### Sorun: her kombinasyon bir alt sınıf

```bash
java -cp out decorator.sorun.Main
```

```text
Standart kargo = 50 TL
Standart kargo + ekspres = 90 TL
Standart kargo + sigorta = 85 TL
Standart kargo + ekspres + sigorta = 125 TL
Standart kargo + soğuk zincir = 110 TL
Standart kargo + ekspres + soğuk zincir = 150 TL
Standart kargo + soğuk zincir + sigorta = 145 TL
Standart kargo + ekspres + soğuk zincir + sigorta = 180 TL
```

Üç seçenek, sekiz sınıf. Sigortaya zam geldi (30 → 35); kural dört sınıfta yazılıydı, `SigortaliSogukZincirliEkspresKargo`
unutuldu: son satır **185** olmalıydı. Derleyici bir şey demedi.

### Çözüm: katmanlar

```bash
java -cp out decorator.cozum.Main
```

```text
Standart kargo = 50 TL
Standart kargo + ekspres = 90 TL
Standart kargo + sigorta = 85 TL
Standart kargo + ekspres + sigorta = 125 TL
Standart kargo + soğuk zincir = 110 TL
Standart kargo + ekspres + soğuk zincir = 150 TL
Standart kargo + soğuk zincir + sigorta = 145 TL
Standart kargo + ekspres + soğuk zincir + sigorta = 185 TL
Zarf + sigorta + SMS = 60 TL
```

Sigorta kuralı artık yalnızca `Sigorta` sınıfında; son satırdaki kombinasyon için hiç sınıf yazılmadı.
`decorator.akis.ekspressigorta.Main` (125 TL) ve `decorator.akis.zarfsms.Main` (65 TL) Canlı Akış’taki iki tarifi
katman katman kurar.

### Sipariş tezgâhı: sıra önemli

```bash
java -cp out decorator.tezgah.Main
```

```text
Standart kargo + ekspres + sigorta + %10 kurumsal indirim = 112 TL
Standart kargo + %10 kurumsal indirim + ekspres + sigorta = 120 TL
Standart kargo + sigorta + SMS + SMS = 95 TL
```

Aynı üç katman, farklı sıra: indirim en dışta toplama (125 × 9 / 10 = 112, tam sayı bölmesi), en içte yalnızca
çekirdeğe uygulanır. Son satırda aynı katman iki kez sarıldı.

### Genişlet: yeni katman

```bash
java -cp out decorator.genislet.Main
```

```text
Standart kargo + ekspres + hediye paketi = 105 TL
Zarf + hediye paketi + SMS = 40 TL
```

`HediyePaketi` eklendi; var olan hiçbir sınıf değişmedi ve yeni katman zarfla da çalışıyor.

## Facade

### Sorun: iş akışı istemcilerin içinde

```bash
java -cp out facade.sorun.Main
```

```text
[Kasa] Ali Şahin: 3 kg, Battalgazi/Malatya
[Adres] Battalgazi/Malatya doğrulandı
[Tarife] 3 kg → 85 TL
[Ödeme] Ali Şahin: 85 TL çekildi
[Takip] KRG-1001 verildi
[Etiket] KRG-1001 basıldı → Battalgazi/Malatya
[Kurye] KRG-1001 → Mehmet (Malatya)
[SMS] Ali Şahin: KRG-1001 gönderiniz alındı
[Kasa] fiş: KRG-1001
[Web] Ayşe Yılmaz: 2 kg, Çankaya/Ankara
[Adres] Çankaya/Ankara doğrulandı
[Tarife] 2 kg → 70 TL
[Ödeme] Ayşe Yılmaz: 70 TL çekildi
[Takip] KRG-1002 verildi
[Etiket] KRG-1002 basıldı → Çankaya/Ankara
[Kurye] KRG-1002 → Elif (Ankara)
[SMS] Ayşe Yılmaz: KRG-1002 gönderiniz alındı
[Web] fiş: KRG-1002
[Web] Can Demir: 1 kg, Kadıköy/İstanbul
[Adres] Kadıköy/İstanbul doğrulandı
[Tarife] 1 kg → 55 TL
[Ödeme] Can Demir: 55 TL REDDEDİLDİ (limit 50 TL)
[Takip] KRG-1003 verildi
[Etiket] KRG-1003 basıldı → Kadıköy/İstanbul
[Kurye] KRG-1003 → Burak (İstanbul)
[SMS] Can Demir: KRG-1003 gönderiniz alındı
[Web] fiş: KRG-1003
Gün sonu: 3 etiket, 155 TL tahsilat
```

Şube kasası ve web sitesi yedi alt sistemi kendileri çağırıyor. Kart limiti kuralı (`OdemeServisi.cek` artık `boolean`)
kasaya eklendi, web sitesinde **unutuldu**: Can’ın ödemesi reddedildi ama gönderi oluşturuldu. Üç etiket, iki ödeme.

### Çözüm: GonderiCephesi

```bash
java -cp out facade.cozum.Main
```

```text
…
[Web] Can Demir: 1 kg, Kadıköy/İstanbul
[Adres] Kadıköy/İstanbul doğrulandı
[Tarife] 1 kg → 55 TL
[Ödeme] Can Demir: 55 TL REDDEDİLDİ (limit 50 TL)
[SMS] Can Demir: ödeme alınamadı, gönderi oluşturulmadı
[Web] gönderi oluşturulmadı
Gün sonu: 2 etiket, 155 TL tahsilat
```

Çıktının ilk 18 satırı sorun sürümündekiyle aynı (Ali KRG-1001, Ayşe KRG-1002). İstemciler yalnızca
`cephe.gonder(t)` diyor; iş akışı ve kart limiti kuralı `GonderiCephesi`’nde. Alt sistem sınıfları değişmedi.

### Canlı Akış

```bash
java -cp out facade.akis.ali.Main
java -cp out facade.akis.can.Main
```

```text
[Kasa] Ali Şahin: 3 kg, Battalgazi/Malatya
[Adres] Battalgazi/Malatya doğrulandı
[Tarife] 3 kg → 85 TL
[Ödeme] Ali Şahin: 85 TL çekildi
[Takip] KRG-1001 verildi
[Etiket] KRG-1001 basıldı → Battalgazi/Malatya
[Kurye] KRG-1001 → Mehmet (Malatya)
[SMS] Ali Şahin: KRG-1001 gönderiniz alındı
[Kasa] fiş: KRG-1001
Gün sonu: 1 etiket, 85 TL tahsilat
```

```text
[Web] Can Demir: 1 kg, Kadıköy/İstanbul
[Adres] Kadıköy/İstanbul doğrulandı
[Tarife] 1 kg → 55 TL
[Ödeme] Can Demir: 55 TL REDDEDİLDİ (limit 50 TL)
[SMS] Can Demir: ödeme alınamadı, gönderi oluşturulmadı
[Web] gönderi oluşturulmadı
Gün sonu: 0 etiket, 0 TL tahsilat
```

### Cephe tezgâhı: üç değişiklik isteği

```bash
java -cp out facade.tezgah.kalipsiz.Main
java -cp out facade.tezgah.cepheli.Main
```

```text
…
[Mobil] Zeynep Güneş: 1 kg, Konak/İzmir
[Adres] Konak/İzmir doğrulandı
[Tarife] 1 kg → 55 TL
[Ödeme] Zeynep Güneş: 55 TL çekildi
[Takip] KRG-1003 verildi
[Sigorta] KRG-1003: 55 TL değerinde poliçe
[Etiket] KRG-1003 basıldı → Konak/İzmir
[Kurye] KRG-1003 → Deniz (İzmir, motosiklet)
[SMS] Zeynep Güneş: KRG-1003 gönderiniz alındı
[Mobil] fiş: KRG-1003
Gün sonu: 3 etiket, 210 TL tahsilat
```

```text
…
[Mobil] Zeynep Güneş: 1 kg, Konak/İzmir
[Adres] Konak/İzmir doğrulandı
[Tarife] 1 kg → 55 TL
[Ödeme] Zeynep Güneş: 55 TL çekildi
[Takip] KRG-1003 verildi
[Sigorta] KRG-1003: 55 TL değerinde poliçe
[Etiket] KRG-1003 basıldı → Konak/İzmir
[Kurye] KRG-1003 → Deniz (İzmir, motosiklet)
[SMS] Zeynep Güneş: KRG-1003 gönderiniz alındı
[Mobil] fiş: KRG-1003
Gün sonu: 3 etiket, 210 TL tahsilat
```

Üç istemci (kasa, web, mobil) ve üç değişiklik: kart limiti, yeni alt sistem `SigortaServisi`, kuryenin yeni imzası
`planla(no, il, kg)`. İki programın çıktısı **aynı**; fark kodda: kalıpsız sürümde dört dosya (üç istemci ve `Main`),
cepheli sürümde iki dosya (`GonderiCephesi` ve `Main`) değişti.

### Genişlet: yeni istemci

```bash
java -cp out facade.genislet.Main
```

```text
…
[API] 2 talep geldi
[Adres] Çankaya/Ankara doğrulandı
[Tarife] 5 kg → 115 TL
[Ödeme] Ayşe Yılmaz: 115 TL çekildi
[Takip] KRG-1003 verildi
[Etiket] KRG-1003 basıldı → Çankaya/Ankara
[Kurye] KRG-1003 → Elif (Ankara)
[SMS] Ayşe Yılmaz: KRG-1003 gönderiniz alındı
[API] Ayşe Yılmaz → KRG-1003
[Adres] Kadıköy/İstanbul doğrulandı
[Tarife] 2 kg → 70 TL
[Ödeme] Can Demir: 70 TL REDDEDİLDİ (limit 50 TL)
[SMS] Can Demir: ödeme alınamadı, gönderi oluşturulmadı
[API] Can Demir → oluşturulmadı
Gün sonu: 3 etiket, 270 TL tahsilat
```

`KurumsalApi` alt sistemlerin hiçbirini tanımıyor; tek alanı `cephe`. Kart limiti kuralını yazmadı ama ondan
yararlandı. Hiçbir sınıf değişmedi.

## Flyweight

Programlar kuryenin tabletini taklit eder: `-Xmx64m` ile en fazla 64 MB bellek.

### Sorun: her nokta kendi ikonunu taşıyor

```bash
java -Xmx512m -cp out flyweight.sorun.Main
java -Xmx64m -cp out flyweight.sorun.Main
```

```text
[koli] KRG-1001 → (521, 215) · koli.png#1
[zarf] KRG-1002 → (306, 135) · zarf.png#2
[koli] KRG-1003 → (81, 212) · koli.png#3
[koli] KRG-1004 → (493, 196) · koli.png#4
[zarf] KRG-1005 → (306, 147) · zarf.png#5
… ve 9995 nokta daha
Harita: 10000 nokta, 10000 ikon, 160000 KB
```

```text
Exception in thread "main" java.lang.OutOfMemoryError: Java heap space
	at flyweight.sorun.Ikon.<init>(Ikon.java:14)
	at flyweight.sorun.HaritaNoktasi.<init>(HaritaNoktasi.java:17)
	at flyweight.sorun.Harita.ekle(Harita.java:17)
	at flyweight.sorun.Gonderiler.ekle(Gonderiler.java:21)
	at flyweight.sorun.Main.main(Main.java:11)
```

Geliştiricinin bilgisayarında (512 MB) harita açılıyor ama üç farklı resim için 10.000 ikon tutuyor (`koli.png#1` ile
`koli.png#3` aynı resmin iki ayrı nesnesi). Kurye tabletinde (64 MB) bellek ≈ 3.950. noktada bitiyor. Yığın izi her
çalıştırmada aynıdır; çökülen nokta sayısı JVM’e göre biraz değişebilir.

### Kestirme: bütün noktayı paylaşmak

```bash
java -Xmx64m -cp out flyweight.kestirme.Main
```

```text
[koli] KRG-10999 → (593, 245) · koli.png#1
[zarf] KRG-11000 → (516, 212) · zarf.png#2
[koli] KRG-10999 → (593, 245) · koli.png#1
[koli] KRG-10999 → (593, 245) · koli.png#1
[zarf] KRG-11000 → (516, 212) · zarf.png#2
… ve 9995 nokta daha
Harita: 10000 nokta, 3 ikon, 48 KB
```

Bellek düzeldi, harita bozuldu: `HaritaNoktasi.al(…)` aynı türden noktalar için tek nesneyi döndürüyor ve etiketiyle
konumunu **üstüne yazıyor**. İlk satır KRG-1001 olmalıydı; son yazan kazandı.

### Çözüm: içsel durum paylaşılır, dışsal durum noktada kalır

```bash
java -Xmx64m -cp out flyweight.cozum.Main
```

```text
[Fabrika] yeni tür: koli (koli.png#1)
[Fabrika] yeni tür: zarf (zarf.png#2)
[Fabrika] yeni tür: palet (palet.png#3)
[koli] KRG-1001 → (521, 215) · koli.png#1
[zarf] KRG-1002 → (306, 135) · zarf.png#2
[koli] KRG-1003 → (81, 212) · koli.png#1
[koli] KRG-1004 → (493, 196) · koli.png#1
[zarf] KRG-1005 → (306, 147) · zarf.png#2
… ve 9995 nokta daha
Harita: 10000 nokta, 3 ikon, 48 KB
```

`IsaretTuru` yalnızca içsel durumu (ad, ikon) tutar ve değişmez; `IsaretFabrikasi` her tür için tek nesne verir.
`HaritaNoktasi` etiketini ve konumunu kendisi tutar, çizerken işarete verir: `isaret.ciz(x, y, etiket)`. `Main` sorun
sürümündekiyle aynı. `Main`’deki `9_997` sayısını değiştirerek Harita Tezgâhı’ndaki deneyleri tekrarlayabilirsiniz:
`99_997` ile 100.000 nokta, yine 3 ikon.

### Canlı Akış

```bash
java -Xmx64m -cp out flyweight.akis.Main
```

```text
[Fabrika] yeni tür: koli (koli.png#1)
[Fabrika] yeni tür: zarf (zarf.png#2)
[koli] KRG-1001 → (521, 215) · koli.png#1
[zarf] KRG-1002 → (306, 135) · zarf.png#2
[koli] KRG-1003 → (81, 212) · koli.png#1
Harita: 3 nokta, 2 ikon, 32 KB
```

Üç nokta, iki işaret: KRG-1003 için fabrika havuzdaki `koli.png#1` nesnesini olduğu gibi verdi.

### Genişlet: paylaşılmayan işaret

```bash
java -Xmx64m -cp out flyweight.genislet.Main
```

```text
[Fabrika] yeni tür: koli (koli.png#1)
[koli] KRG-1001 → (521, 215) · koli.png#1
[depo] Malatya Aktarma → (548, 236) · depo-Malatya.png#2 · doluluk %87
[koli] KRG-1003 → (81, 212) · koli.png#1
Harita: 3 nokta, 2 ikon, 32 KB
```

`DepoIsareti` de bir `Isaret` ama paylaşılmaz: kendi fotoğrafını ve doluluğunu taşır, `Main` onu fabrikadan almadan
`new` ile yaratır. Hiçbir sınıf değişmedi.

## Proxy

### Sorun: denetim istemcilerin içinde

```bash
java -cp out proxy.sorun.Main
```

```text
[GlobalShip] oturum açıldı (1200 ms)
[GlobalShip] KRG-1001 sorgulandı (800 ms, 25 kuruş)
[Panel/Ali] KRG-1001: Dağıtımda (Ali Şahin, Battalgazi)
[Panel/Ali] KRG-1001: Dağıtımda (Ali Şahin, Battalgazi)
[Panel/Ali] KRG-1003: size ait değil (KVKK)
[GlobalShip] oturum açıldı (1200 ms)
[GlobalShip] KRG-1002 sorgulandı (800 ms, 25 kuruş)
[Mobil/Ayşe] KRG-1002: Transfer merkezinde (Ayşe Yılmaz, Çankaya)
[GlobalShip] KRG-1001 sorgulandı (800 ms, 25 kuruş)
[Mobil/Ayşe] KRG-1001: Dağıtımda (Ali Şahin, Battalgazi)
GlobalShip: 2 oturum, 3 sorgu, 4800 ms, 75 kuruş
```

Panel ve mobil uygulama bağlantıyı ve önbelleği kendileri yönetiyor. KVKK denetimi panele eklendi (Ali, Zeynep’in
gönderisini göremiyor) ama mobil uygulamaya **eklenmedi**: Ayşe, Ali’nin adını ve semtini görüyor.

### Çözüm: TakipVekili araya girer

```bash
java -cp out proxy.cozum.Main
```

```text
[GlobalShip] oturum açıldı (1200 ms)
[GlobalShip] KRG-1001 sorgulandı (800 ms, 25 kuruş)
[Panel/Ali] KRG-1001: Dağıtımda (Ali Şahin, Battalgazi)
[Panel/Ali] KRG-1001: Dağıtımda (Ali Şahin, Battalgazi)
[Panel/Ali] KRG-1003: size ait değil (KVKK)
[GlobalShip] oturum açıldı (1200 ms)
[GlobalShip] KRG-1002 sorgulandı (800 ms, 25 kuruş)
[Mobil/Ayşe] KRG-1002: Transfer merkezinde (Ayşe Yılmaz, Çankaya)
[Mobil/Ayşe] KRG-1001: size ait değil (KVKK)
GlobalShip: 2 oturum, 2 sorgu, 4000 ms, 50 kuruş
```

İstemcilerde denetim kodu yok; `Main` onlara `TakipServisi aliServisi = new TakipVekili(ali);` veriyor. Vekil önce
kimin sorduğuna bakar (koruma), sonra önbelleğe (akıllı başvuru), gerçek nesneyi ancak gerekince yaratır (sanal).
`proxy.akis.ali.Main` ve `proxy.akis.ayse.Main` Canlı Akış’taki iki tarifi çalıştırır; Ayşe’nin tarifinde ilk istek
kapıda kaldığı için oturum ancak ikinci istekte açılır.

### Vekil tezgâhı: aynı trafik, vekilsiz ve vekilli

```bash
java -cp out proxy.tezgah.vekilsiz.Main
java -cp out proxy.tezgah.vekilli.Main
```

```text
[GlobalShip] oturum açıldı (1200 ms)
[GlobalShip] KRG-1001 sorgulandı (800 ms, 25 kuruş)
[Mobil/Ayşe] KRG-1001: Dağıtımda (Ali Şahin, Battalgazi)
[GlobalShip] KRG-1003 sorgulandı (800 ms, 25 kuruş)
[Mobil/Ayşe] KRG-1003: Teslim edildi (Zeynep Güneş, Konak)
[GlobalShip] KRG-1002 sorgulandı (800 ms, 25 kuruş)
[Mobil/Ayşe] KRG-1002: Transfer merkezinde (Ayşe Yılmaz, Çankaya)
[GlobalShip] KRG-1002 sorgulandı (800 ms, 25 kuruş)
[Mobil/Ayşe] KRG-1002: Transfer merkezinde (Ayşe Yılmaz, Çankaya)
GlobalShip: 1 oturum, 4 sorgu, 4400 ms, 100 kuruş
```

```text
[Mobil/Ayşe] KRG-1001: size ait değil (KVKK)
[Mobil/Ayşe] KRG-1003: size ait değil (KVKK)
[GlobalShip] oturum açıldı (1200 ms)
[GlobalShip] KRG-1002 sorgulandı (800 ms, 25 kuruş)
[Mobil/Ayşe] KRG-1002: Transfer merkezinde (Ayşe Yılmaz, Çankaya)
[Mobil/Ayşe] KRG-1002: Transfer merkezinde (Ayşe Yılmaz, Çankaya)
GlobalShip: 1 oturum, 1 sorgu, 2000 ms, 25 kuruş
```

Aynı `MobilUygulama`, aynı dört istek: vekilsiz iki sızıntı ve dört sorgu; vekille iki istek kapıda kalır, bir sorgu.

### Genişlet: yeni istemci, sıfır denetim kodu

```bash
java -cp out proxy.genislet.Main
```

```text
[GlobalShip] oturum açıldı (1200 ms)
[GlobalShip] KRG-1003 sorgulandı (800 ms, 25 kuruş)
[SMS/Zeynep] KRG-1003: Teslim edildi (Zeynep Güneş, Konak)
[SMS/Zeynep] KRG-1003: Teslim edildi (Zeynep Güneş, Konak)
[SMS/Zeynep] KRG-1001: size ait değil (KVKK)
GlobalShip: 1 oturum, 1 sorgu, 2000 ms, 25 kuruş
```

`SmsBildirim` bağlantı, önbellek ya da KVKK kodu içermiyor; üçünü de vekilden alıyor. Hiçbir sınıf değişmedi.

## Chain of Responsibility

### Sorun: kararlar kuryenin if/else merdiveninde

```bash
java -cp out chainofresponsibility.sorun.Main
```

```text
…
[İstanbul] KRG-1003 Zeynep Güneş · 1 kg · soğuk zincir · komşu evde: Dolap
[İstanbul] KRG-1004 Can Demir · 4 kg · kimse yok: Dolap
[İstanbul] KRG-1005 Selin Aydın · 9 kg · kimse yok: Şube
[İstanbul] KRG-1006 Mert Kaya · 25 kg · kimse yok: İade
```

`Kurye` bütün seçenekleri, sıralarını ve kurallarını tek bir `if/else` merdiveninde tutuyor. Soğuk zincir dalı erken
geldiği için aşağıdaki dolap dalı gönderinin “soğuk değil” olduğunu **varsayıyor**. `IstanbulKuryesi` bu merdivenin
kopyası; dolap dalı yukarı taşınınca varsayım bozuldu: Zeynep’in ilacı İstanbul’da akıllı dolaba bırakılıyor
(Malatya’da şubede).

### Çözüm: TeslimatAdimi zinciri

```bash
java -cp out chainofresponsibility.cozum.Main
```

```text
…
[İstanbul] KRG-1003 Zeynep Güneş · 1 kg · soğuk zincir · komşu evde: Alıcı ✗ → Dolap ✗ → Komşu ✗ → Şube ✓
[İstanbul] KRG-1004 Can Demir · 4 kg · kimse yok: Alıcı ✗ → Dolap ✓
[İstanbul] KRG-1005 Selin Aydın · 9 kg · kimse yok: Alıcı ✗ → Dolap ✗ → Komşu ✗ → Şube ✓
[İstanbul] KRG-1006 Mert Kaya · 25 kg · kimse yok: Alıcı ✗ → Dolap ✗ → Komşu ✗ → Şube ✗ → İade ✓
```

Her seçenek `TeslimatAdimi`’nden türeyen bir halka ve kuralını eksiksiz biliyor (`DolabaTeslim`:
`!g.sogukZincir() && g.kg() <= 5`). Halka işleyemediği gönderiyi `sonraki.teslimEt(g)` ile ileri veriyor; konsoldaki
her satır, gönderinin zincirdeki yolu. `Main` aynı sınıflarla iki zincir kuruyor: Malatya (alıcı → komşu → dolap →
şube → iade) ve İstanbul (dolap önce). İlaç İstanbul’da da dolabı denedi, reddedildi ve şubeye ulaştı.
`chainofresponsibility.akis.ayse.Main` ve `chainofresponsibility.akis.zeynep.Main` Canlı Akış’taki iki tarifi çalıştırır.

### Zincir tezgâhı: sıra = öncelik, sonda kimse yoksa KAYIP

```bash
java -cp out chainofresponsibility.tezgah.subeonce.Main
java -cp out chainofresponsibility.tezgah.iadesiz.Main
```

```text
[Malatya] KRG-1001 Ali Şahin · 3 kg · alıcı evde: Şube ✓
[Malatya] KRG-1002 Ayşe Yılmaz · 2 kg · komşu evde: Şube ✓
[Malatya] KRG-1003 Zeynep Güneş · 1 kg · soğuk zincir · komşu evde: Şube ✓
[Malatya] KRG-1004 Can Demir · 4 kg · kimse yok: Şube ✓
[Malatya] KRG-1005 Selin Aydın · 9 kg · kimse yok: Şube ✓
[Malatya] KRG-1006 Mert Kaya · 25 kg · kimse yok: Şube ✗ → Alıcı ✗ → Komşu ✗ → Dolap ✗ → İade ✓
```

```text
…
[Malatya] KRG-1006 Mert Kaya · 25 kg · kimse yok: Alıcı ✗ → Komşu ✗ → Dolap ✗ → Şube ✗ → KAYIP: kimse teslim almadı!
```

Halka sınıfları aynı; yalnızca `Main` değişiyor. Şube en başta olunca 20 kg’a kadar her gönderiyi ilk o alıyor (Ali
evdeyken bile). İade halkası çıkarılınca Mert’in kolisini kimse almıyor: zincirde teslim **garanti değildir**.
`chainofresponsibility.tezgah.dolaponce.Main` İstanbul sırasını Malatya kuryesiyle çalıştırır.

### Genişlet: yeni halka MarketeTeslim

```bash
java -cp out chainofresponsibility.genislet.Main
```

```text
[Malatya] KRG-1001 Ali Şahin · 3 kg · alıcı evde: Alıcı ✓
[Malatya] KRG-1002 Ayşe Yılmaz · 2 kg · komşu evde: Alıcı ✗ → Komşu ✓
[Malatya] KRG-1003 Zeynep Güneş · 1 kg · soğuk zincir · komşu evde: Alıcı ✗ → Komşu ✗ → Dolap ✗ → Market ✗ → Şube ✓
[Malatya] KRG-1004 Can Demir · 4 kg · kimse yok: Alıcı ✗ → Komşu ✗ → Dolap ✓
[Malatya] KRG-1005 Selin Aydın · 9 kg · kimse yok: Alıcı ✗ → Komşu ✗ → Dolap ✗ → Market ✓
[Malatya] KRG-1006 Mert Kaya · 25 kg · kimse yok: Alıcı ✗ → Komşu ✗ → Dolap ✗ → Market ✗ → Şube ✗ → İade ✓
```

`MarketeTeslim` yalnızca `dene(g)`’yi yazıyor; `Main`’de dolaptan sonra tek satır: `.sonra(new MarketeTeslim())`.
Kurye, `TeslimatAdimi` ve öbür beş halka değişmedi. Selin’in 9 kg’lık kolisi artık markette; ilaç yine şubede.

## Command

### Sorun: dizgi + switch, tek kayıtlık geri al, gece çöküşü

```bash
java -cp out command.sorun.Main
```

```text
…
[Panel] geri alınacak işlem yok
[Gece] 02:00, 3 iş
[Gece] YUKLE KRG-1001
  depo: KRG-1001 B3 rafından alındı
  kamyon: KRG-1001 yüklendi
[Gece] TASI KRG-1004 C2
  depo: KRG-1004 B1 → C2
[Gece] YÜKLE KRG-1005
Exception in thread "main" java.lang.IllegalArgumentException: bilinmeyen işlem: YÜKLE
	at command.sorun.GeceIsi.calistir(GeceIsi.java:36)
	at command.sorun.Main.main(Main.java:20)
```

`OperatorPaneli` isteği bir dizgiyle (`"TASI"`, `"YUKLE"`) alıyor ve `switch` ile kendisi yapıyor. “Geri al” için yalnızca
son işlemi üç alanda hatırlıyor: iki işlemden sonra ikinci geri al **“geri alınacak işlem yok”** diyor, Ali’nin kolisi
B3’te kalıyor. `GeceIsi` panelin `switch`’ini kopyalamış; gece vardiyası son satırı `"YÜKLE"` diye yazınca program
02:00’de çöküyor (yığın izindeki satır numaraları dışa aktarılan dosyalara göredir).

### Çözüm: komut nesneleri

```bash
java -cp out command.cozum.Main
```

```text
…
[Panel] geri al: YÜKLE KRG-1003
  kamyon: KRG-1003 indirildi
  depo: KRG-1003 → A3
[Panel] geri al: TAŞI KRG-1001 → B3
  depo: KRG-1001 B3 → A1
[Gece] 02:00, 3 iş
[Gece] YÜKLE KRG-1001
  depo: KRG-1001 A1 rafından alındı
  kamyon: KRG-1001 yüklendi
[Gece] TAŞI KRG-1004 → C2
  depo: KRG-1004 B1 → C2
[Gece] YÜKLE KRG-1005
  depo: KRG-1005 B2 rafından alındı
  kamyon: KRG-1005 yüklendi
Raflar: 1002:A2 1003:A3 1004:C2 1006:C1 · Kamyon: 1001 1005
```

Her istek bir `Komut` nesnesi (`TasiKomutu`, `YukleKomutu`): alıcısını (`Depo`, `Kamyon`) ve geri almak için gereken
bilgiyi (`onceki`, `raf`) kendisi tutuyor. `OperatorPaneli` komutu çalıştırıp **geçmiş yığınına** koyuyor; iki geri al da
çalıştı. `GeceIsi` dizgi değil komut kuyruğu tutuyor: yanlış yazılmış bir komut adı artık derlenmez.
`command.akis.gun.Main` ve `command.akis.gece.Main` Canlı Akış’taki iki tarifi çalıştırır.

### Komut tezgâhı: aynı oturum, iki tasarım

```bash
java -cp out command.tezgah.kalipsiz.Main
java -cp out command.tezgah.komutlu.Main
```

```text
…
[Panel] geri al: YUKLE KRG-1003
  kamyon: KRG-1003 indirildi
  depo: KRG-1003 → A3
[Panel] geri alınacak işlem yok
Raflar: 1001:B3 1002:A2 1003:A3 1004:B1 1005:B2 1006:C1 · Kamyon: boş
```

```text
…
[Panel] geri al: YÜKLE KRG-1003
  kamyon: KRG-1003 indirildi
  depo: KRG-1003 → A3
[Panel] geri al: TAŞI KRG-1001 → B3
  depo: KRG-1001 B3 → A1
Raflar: 1001:A1 1002:A2 1003:A3 1004:B1 1005:B2 1006:C1 · Kamyon: boş
```

Aynı dört istek (taşı, yükle, iki kez geri al): kalıpsız panel ikinci geri alda kaydı çoktan silmiş; komutlu panelde
yığında hâlâ `TAŞI KRG-1001 → B3` var.

### Genişlet: MakroKomut

```bash
java -cp out command.genislet.Main
```

```text
[Panel] MAKRO Malatya kamyonu (3 komut)
  depo: KRG-1001 A1 rafından alındı
  kamyon: KRG-1001 yüklendi
  depo: KRG-1005 B2 rafından alındı
  kamyon: KRG-1005 yüklendi
  depo: KRG-1006 C1 rafından alındı
  kamyon: KRG-1006 yüklendi
[Panel] geri al: MAKRO Malatya kamyonu (3 komut)
  kamyon: KRG-1006 indirildi
  depo: KRG-1006 → C1
  kamyon: KRG-1005 indirildi
  depo: KRG-1005 → B2
  kamyon: KRG-1001 indirildi
  depo: KRG-1001 → A1
Raflar: 1001:A1 1002:A2 1003:A3 1004:B1 1005:B2 1006:C1 · Kamyon: boş
```

`MakroKomut` da bir `Komut`: içindeki üç `YukleKomutu`’nu sırayla çalıştırıyor, tek “geri al”da **ters sırayla** geri
alıyor (1006, 1005, 1001). Panel, depo ve kamyon değişmedi.

## Mediator

### Sorun: öğeler birbirini tanıyor

```bash
java -cp out mediator.sorun.Main
```

```text
> soğuk zincir: açık
  ücret: 65 TL
> şehir: Malatya
  dolap: açık
> ağırlık: 2 kg
  ücret: 69 TL
> teslimat: Dolap
  ücret: 59 TL
Gönderi: Malatya · 2 kg · soğuk zincir · Dolap · 59 TL
```

Formun beş öğesi (şehir, ağırlık, soğuk zincir, teslimat, ücret) birbirini alan olarak tutuyor ve birbirini çağırıyor:
13 bağ. “Dolap açık mı?” kuralı üç öğede kopya; soğuk zincir kutusu eklenirken şehir seçicideki ve ağırlık alanındaki
kopyalar güncellenmedi. Önce soğuk zincir, sonra şehir seçilince şehir seçici dolabı yeniden açıyor ve soğuk zincirli
ilaç **dolaba** gidiyor. Aynı değerler başka sırayla girilseydi (önce şehir) sonuç doğru olurdu.

### Çözüm: FormYoneticisi

```bash
java -cp out mediator.cozum.Main
```

```text
> soğuk zincir: açık
  ücret: 65 TL
> şehir: Malatya
> ağırlık: 2 kg
  ücret: 69 TL
> teslimat: Dolap seçilemez (kapalı)
Gönderi: Malatya · 2 kg · soğuk zincir · Standart · 69 TL
```

Öğeler `FormOgesi`’nden türüyor ve yalnızca yöneticisini tanıyor; değişince `yonetici.degisti(this)` diyor.
`GonderiFormu` (`FormYoneticisi`) öğeleri kendisi yaratıyor ve kuralların hepsini `degisti` içinde, tek yerde uyguluyor:
aynı tıklama sırasında dolap kapalı kalıyor, Dolap seçilemiyor. Öğeler arası bağ 13 → 0. `mediator.akis.ilac.Main` ve
`mediator.akis.agir.Main` Canlı Akış’taki iki tarifi çalıştırır.

### Form tezgâhı: aynı tıklamalar, üç tasarım

```bash
java -cp out mediator.tezgah.daginik.Main
java -cp out mediator.tezgah.kopyali.Main
java -cp out mediator.tezgah.mediator.Main
```

```text
> soğuk zincir: açık
  ücret: 65 TL
> şehir: Malatya
  dolap: açık
> ağırlık: 2 kg
  ücret: 69 TL
> teslimat: Dolap
  ücret: 59 TL
Gönderi: Malatya · 2 kg · soğuk zincir · Dolap · 59 TL
```

```text
> soğuk zincir: açık
  ücret: 65 TL
> şehir: Malatya
> ağırlık: 2 kg
  ücret: 69 TL
> teslimat: Dolap seçilemez (kapalı)
Gönderi: Malatya · 2 kg · soğuk zincir · Standart · 69 TL
```

```text
> soğuk zincir: açık
  ücret: 65 TL
> şehir: Malatya
> ağırlık: 2 kg
  ücret: 69 TL
> teslimat: Dolap seçilemez (kapalı)
Gönderi: Malatya · 2 kg · soğuk zincir · Standart · 69 TL
```

Aynı tıklamalar (soğuk zincir, Malatya, 2 kg, Dolap): dağınık kurallar ilacı dolaba gönderiyor; kopyaların hepsi tam
olunca sonuç doğru ama kural yine üç yerde ve bağ sayısı 14; Mediator’da kural tek yerde.

### Tuzak: yöneticinin ayarını yeniden bildirmek (bilerek çöker)

`mediator.tuzak` paketinde teslimat seçici, yönetici onu `ayarla(…)` ile ayarlarken kendisi de `degisti()` diyor. Yönetici
kuralları yeniden uyguluyor, yine `ayarla` diyor… Program `> şehir: Malatya` ve `dolap: açık` satırlarından sonra
`java.lang.StackOverflowError` ile çöker; ardından gelen 1024 satırlık iz `TeslimatSecici.ayarla` → `FormOgesi.degisti` →
`GonderiFormu.degisti` döngüsünü tekrarlar (izin ilk satırı çalıştırmadan çalıştırmaya değişebilir). Çalıştırmak için:
`java -cp out mediator.tuzak.Main`. Düzeltme: yalnızca kullanıcının yaptığı değişiklik bildirilir, yöneticinin ayarı bildirilmez.

### Genişlet: SigortaKutusu

```bash
java -cp out mediator.genislet.Main
```

```text
> şehir: Malatya
  dolap: açık
> ağırlık: 2 kg
  ücret: 44 TL
> teslimat: Dolap
  ücret: 34 TL
> sigorta: açık
  dolap: kapalı
  teslimat: Standart
  ücret: 59 TL
Gönderi: Malatya · 2 kg · sigortalı · Standart · 59 TL
```

Yeni bir öğe: `SigortaKutusu` da `FormOgesi`’nden türüyor ve yalnızca `degisti()` diyor. Değişen tek sınıf yönetici
(`GonderiFormu`: yeni alan, kurala bir koşul, ücrete +15 TL); öteki beş öğe aynen kaldı.

## Memento

### Sorun: yedek dışarıdan alınıyor

```bash
java -cp out memento.sorun.Main
```

```text
…
[Gece] HATA: C2 dolu
[Defter] geri yüklendi: 02:00
Raflar: 1001:A1 1002:A2 1003:A3 1004:B1 1005:B2 1006:C1 · Kamyon: 1001 1005
```

Gece planı “ya hep ya hiç” uygulanmalı: hata olursa depo plandan önceki hâline dönmeli. Yedeği `YedekDefteri` alıyor;
bunun için `Depo` iç durumunu get/set ile dışarı açtı. Sürüm 1.0’da `yedek = depo.getRaflar()` deponun **kendi**
haritasıydı (referans), geri yükleme hiçbir şey değiştirmedi; sürüm 1.1 kopya aldı. Sürüm 2.0’da depoya kamyon eklendi
ama defter güncellenmedi: geri yüklemeden sonra 1001 ve 1005 **hem rafta hem kamyonda**.

### Çözüm: Depo.Hatira

```bash
java -cp out memento.cozum.Main
```

```text
…
[Gece] HATA: C2 dolu
[Defter] geri yüklendi: 02:00
Raflar: 1001:A1 1002:A2 1003:A3 1004:B1 1005:B2 1006:C1 · Kamyon: boş
```

`Depo` kendi hatırasını kendisi oluşturuyor (`hatiraOlustur()`: raflar ve kamyonun kopyası) ve ona kendisi dönüyor
(`hatirayaDon(h)`). `Depo.Hatira` bir iç sınıf; alanları ve kurucusu `private`: defter onu saklayabilir ama içine
bakamaz. Get/set yöntemleri silindi, depo yeniden kapalı. `memento.akis.gece.Main` ve `memento.akis.noktalar.Main`
Canlı Akış’taki iki tarifi çalıştırır.

### Yedek tezgâhı: aynı oturum, üç yöntem

```bash
java -cp out memento.tezgah.referans.Main
java -cp out memento.tezgah.kopya.Main
java -cp out memento.tezgah.hatira.Main
```

```text
…
[Defter] geri yüklendi: 09:00
Raflar: 1002:A2 1003:A3 1004:C2 1006:C1 · Kamyon: 1001 1005
```

```text
…
[Defter] geri yüklendi: 09:00
Raflar: 1001:A1 1002:A2 1003:A3 1004:B1 1005:B2 1006:C1 · Kamyon: 1001 1005
```

```text
…
[Defter] geri yüklendi: 09:00
Raflar: 1001:A1 1002:A2 1003:A3 1004:B1 1005:B2 1006:C1 · Kamyon: boş
```

Aynı oturum (kaydet, iki yükleme, bir taşıma, geri yükle): referans hiçbir şeyi geri getirmiyor, kopya kamyonu
unutuyor, hatıra depoyu tam olarak 09:00 hâline döndürüyor.

### Genişlet: DepoGecmisi

```bash
java -cp out memento.genislet.Main
```

```text
  depo: KRG-1001 A1 → B3
  kamyon: KRG-1003 yüklendi (A3 boşaldı)
[Geçmiş] geri alındı
[Geçmiş] geri alındı
[Geçmiş] yinelendi
Raflar: 1001:B3 1002:A2 1003:A3 1004:B1 1005:B2 1006:C1 · Kamyon: boş
```

Yeni bir emanetçi: her işlemden önce depodan bir hatıra alıyor; “geri al” son hatıraya, “yinele” geri alınana dönüyor.
`Depo` ve `YedekDefteri` değişmedi. Command’dan farkı: ters işlem yok, önceki hâlin kopyası var.

## Observer

### Sorun: ekranlar adıyla çağrılıyor

```bash
java -cp out observer.sorun.Main
```

```text
…
[KRG-1001] Teslim edildi · Ali Şahin
  SMS → Ali: KRG-1001 Teslim edildi
  Panel: KRG-1001 = Teslim edildi
Satıcı paneli: KRG-1001 Teslim edildi
Kurye rotası: KRG-1001
```

`Gonderi` üç ekranı (telefon, satıcı paneli, kurye tableti) **sınıf adıyla** tanıyor ve her birinin kendine özgü yöntemini
çağırıyor. Teslimde imza için yazılan `teslimEt()` bildirimleri `setDurum`’dan kopyaladı ama tableti unuttu: panel
“Teslim edildi” derken kuryenin rotasında KRG-1001 hâlâ duruyor. Yeni bir ekran ya da durumu değiştiren yeni bir yöntem,
her seferinde Gonderi’yi değiştirmek demek.

### Çözüm: abone listesi ve bildir()

```bash
java -cp out observer.cozum.Main
```

```text
…
[KRG-1001] Teslim edildi · Ali Şahin
  SMS → Ali: KRG-1001 Teslim edildi
  Panel: KRG-1001 = Teslim edildi
  Tablet: KRG-1001 rotadan çıktı
Satıcı paneli: KRG-1001 Teslim edildi
Kurye rotası: boş
```

Ekranlar tek bir arayüzü uyguluyor (`GonderiGozlemcisi.guncelle(Gonderi gonderi)`) ve yeni durumu gönderiden kendileri
okuyor (pull). `Gonderi` yalnızca bir `List<GonderiGozlemcisi>` tutuyor; `setDurum` ve `teslimEt` yalnızca `bildir()`
diyor. Kimin abone olacağına Main karar veriyor (`aboneEkle`, `aboneCikar`); Gonderi hiçbir ekran sınıfını tanımıyor.
`observer.akis.gun.Main` ve `observer.akis.iki.Main` Canlı Akış’taki iki tarifi çalıştırır.

### Abonelik tezgâhı: aynı oturum, üç tasarım

```bash
java -cp out observer.tezgah.dogrudan.Main
java -cp out observer.tezgah.sabit.Main
java -cp out observer.tezgah.observer.Main
```

```text
…
[KRG-1001] Teslim edildi · Ali Şahin
  SMS → Ali: KRG-1001 Teslim edildi
  Panel: KRG-1001 = Teslim edildi
Satıcı paneli: KRG-1001 Teslim edildi · KRG-1003 Yolda
Kurye rotası: KRG-1001
```

```text
…
[KRG-1001] Teslim edildi · Ali Şahin
  SMS → Ali: KRG-1001 Teslim edildi
  Panel: KRG-1001 = Teslim edildi
  Tablet: KRG-1001 rotadan çıktı
Satıcı paneli: KRG-1001 Teslim edildi · KRG-1003 Yolda
Kurye rotası: boş
```

```text
…
[KRG-1001] Teslim edildi · Ali Şahin
  Panel: KRG-1001 = Teslim edildi
  Tablet: KRG-1001 rotadan çıktı
Satıcı paneli: KRG-1001 Teslim edildi · KRG-1003 Yolda
Kurye rotası: boş
```

Aynı oturum (iki gönderi yola çıkar, Ali SMS’leri kapatır, KRG-1001 teslim edilir): doğrudan çağrıda Ali istemediği
SMS’leri alıyor ve tablet teslimi kaçırıyor; sabit listede tablet düzeliyor ama Ali’nin ayrılma isteğinin kodda karşılığı
yok (Main’deki yorum satırı); Observer’da her bildirim yalnızca o anda abone olanlara gidiyor.

### Tuzak: bildirim sırasında abonelikten çıkmak (bilerek çöker)

```bash
java -cp out observer.tuzak.Main
```

```text
…
[KRG-1001] Teslim edildi · Ali Şahin
  SMS → Ali: KRG-1001 Teslim edildi
Exception in thread "main" java.util.ConcurrentModificationException
	at java.base/java.util.ArrayList$Itr.checkForComodification(ArrayList.java:1095)
	at java.base/java.util.ArrayList$Itr.next(ArrayList.java:1049)
	at observer.tuzak.Gonderi.bildir(Gonderi.java:29)
	at observer.tuzak.Gonderi.teslimEt(Gonderi.java:43)
	at observer.tuzak.Main.main(Main.java:17)
```

Telefon teslimden sonra `guncelle` içinden kendini listeden çıkarıyor (`gonderi.aboneCikar(this)`); Gonderi o sırada aynı
`ArrayList`’i dolaşıyor. Telefon listenin başında olduğu için yineleyici değişikliği fark edip istisna fırlatıyor. Telefon
ortada olsaydı istisna bile çıkmazdı: döngü erken biter, tablet sessizce atlanırdı. Düzeltme: `bildir()` içinde
`List.copyOf(aboneler)` üzerinde dolaşmak.

### Genişlet: CagriMerkezi

```bash
java -cp out observer.genislet.Main
```

```text
…
[KRG-1001] Teslim edildi · Ali Şahin
  SMS → Ali: KRG-1001 Teslim edildi
  Panel: KRG-1001 = Teslim edildi
  Tablet: KRG-1001 rotadan çıktı
  Çağrı merkezi: KRG-1001 kaydı → Teslim edildi
Kurye rotası: boş
Çağrı merkezi: KRG-1001 → Teslim edildi
```

Yeni bir somut gözlemci: `CagriMerkezi` arayüzü uyguluyor, Main onu bir kez abone ediyor. `Gonderi`’ye ve öteki ekranlara
tek satır eklenmedi; doğrudan çağrıda aynı istek Gonderi’de dört yeri (alan, kurucu, `setDurum`, `teslimEt`) değiştirirdi.

## State

### Sorun: durum bir dizgi, her metotta if/else

```bash
java -cp out state.sorun.Main
```

```text
…
[DOLU] kodGir(3333)
  hatalı kod (3/3)
  durum: DOLU → KİLİTLİ
[KİLİTLİ] paketKoy(KRG-1005)
  KRG-1005 kondu · kod SMS ile gönderildi
  durum: KİLİTLİ → DOLU
[DOLU] gorevliAc()
  dolap kilitli değil
[DOLU] kodGir(4821)
  hatalı kod (4/3)
Dolap: DOLU · paket: KRG-1005
```

`KargoDolabi` durumu bir dizgide tutuyor (`"BOŞ"`, `"DOLU"`, `"KİLİTLİ"`) ve her metot durumu `if/else` ile kendisi
soruyor. KİLİTLİ, `kodGir` ve yeni `gorevliAc` yazılırken eklendi; `paketKoy`’a kimse dokunmadı. “BOŞ ise” diye yazılmış
`else` dalı KİLİTLİ’yi de karşıladı: kilitli dolaba Selin’in paketi kondu, kilit kalktı, `kod` alanı değişti. Ali’nin kodu
artık “hatalı” (**4/3**); Ali’nin paketi dolapta ama sistemde kaydı yok.

### Çözüm: durum nesneleri

```bash
java -cp out state.cozum.Main
```

```text
…
[DOLU] kodGir(3333)
  hatalı kod (3/3)
  durum: DOLU → KİLİTLİ
[KİLİTLİ] paketKoy(KRG-1005)
  kilitli: KRG-1005 konamadı
[KİLİTLİ] gorevliAc()
  görevli kilidi açtı
  durum: KİLİTLİ → DOLU
[DOLU] kodGir(4821)
  kapak açıldı: KRG-1001 teslim edildi
  durum: DOLU → BOŞ
Dolap: BOŞ · paket: yok
```

Her durum bir sınıf (`BosDurum`, `DoluDurum`, `KilitliDurum`) ve hepsi `DolapDurumu` arayüzünün **bütün** isteklerine
cevap vermek zorunda. `KargoDolabi` isteği o anki durum nesnesine devrediyor (`durum.kodGir(this, girilen)`); geçişleri
durumlar yapıyor (`dolap.durumDegistir(new KilitliDurum())`). Kilitli dolap paketi reddetti, görevli kilidi açtı, Ali
paketini aldı. `state.akis.kilit.Main` ve `state.akis.teslim.Main` Canlı Akış’taki iki tarifi çalıştırır.

### Dolap tezgâhı: aynı oturum, iki tasarım

```bash
java -cp out state.tezgah.kalipsiz.Main
java -cp out state.tezgah.durumlu.Main
```

```text
…
[KİLİTLİ] paketKoy(KRG-1005)
  KRG-1005 kondu · kod SMS ile gönderildi
  durum: KİLİTLİ → DOLU
[DOLU] gorevliAc()
  dolap kilitli değil
[DOLU] kodGir(4821)
  hatalı kod (4/3)
Dolap: DOLU · paket: KRG-1005
```

```text
…
[KİLİTLİ] paketKoy(KRG-1005)
  kilitli: KRG-1005 konamadı
[KİLİTLİ] gorevliAc()
  görevli kilidi açtı
  durum: KİLİTLİ → DOLU
[DOLU] kodGir(4821)
  kapak açıldı: KRG-1001 teslim edildi
  durum: DOLU → BOŞ
Dolap: BOŞ · paket: yok
```

Aynı yedi istek: kalıpsız dolapta KİLİTLİ durum `paketKoy`’un `else` dalına düşüyor; durum nesneleriyle `KilitliDurum`
kendi cevabını veriyor.

### Genişlet: HizmetDisiDurum

```bash
java -cp out state.genislet.Main
```

```text
[BOŞ] gorevliAc()
  bakım için hizmet dışı bırakıldı
  durum: BOŞ → HİZMET DIŞI
[HİZMET DIŞI] paketKoy(KRG-1006)
  hizmet dışı: KRG-1006 konamadı
[HİZMET DIŞI] gorevliAc()
  bakım bitti · dolap hizmette
  durum: HİZMET DIŞI → BOŞ
[BOŞ] paketKoy(KRG-1006)
  KRG-1006 kondu · kod SMS ile gönderildi
  durum: BOŞ → DOLU
[DOLU] kodGir(2694)
  kapak açıldı: KRG-1006 teslim edildi
  durum: DOLU → BOŞ
Dolap: BOŞ · paket: yok
```

Yeni durum yeni bir sınıf: `HizmetDisiDurum` üç isteğin hepsine cevap veriyor (birini unutursanız kod derlenmez). Ona
geçiren tek yer `BosDurum.gorevliAc`; `KargoDolabi`, `DoluDurum` ve `KilitliDurum` değişmedi.

## Strategy

### Sorun: algoritmalar Kurye’nin içinde

```bash
java -cp out strategy.sorun.Main
```

```text
~ soğuk zincir önce
→ KRG-1007 Elif Arslan (Kernek, soğuk zincir) · 5 km
→ KRG-1008 Emre Koç (Bostanbaşı, soğuk zincir) · 6 km
~ randevu sırası
→ KRG-1001 Ali Şahin (Çarşı) · 3 km
→ KRG-1006 Mert Kaya (Yeşilyurt) · 7 km
→ KRG-1005 Selin Aydın (Üniversite) · 12 km
→ KRG-1004 Can Demir (Battalgazi) · 5 km
Gün sonu: 6/6 teslimat · 38 km
```

Rota algoritmaları `Kurye`’nin içinde; hangisinin çalışacağını bir `String` seçiyor (`yontemSec("SOGUK_ONCE")`). Sabah
soğuk zincirliler önce dağıtıldı, ama `SOGUK_ONCE` dalı kuryenin `kalan` listesini **yerinde sıraladı**. Öğleden sonra
randevu dalı hâlâ `kalan.get(0)` diyor (“liste randevu sırasında” varsayımıyla): sıra 1, 4, 3, 2 oldu ve Can Demir’in ikinci
randevusu en sona kaldı. Randevu dalının koduna kimse dokunmadı.

### Çözüm: RotaStratejisi

```bash
java -cp out strategy.cozum.Main
```

```text
~ soğuk zincir önce
→ KRG-1007 Elif Arslan (Kernek, soğuk zincir) · 5 km
→ KRG-1008 Emre Koç (Bostanbaşı, soğuk zincir) · 6 km
~ randevu sırası
→ KRG-1001 Ali Şahin (Çarşı) · 3 km
→ KRG-1004 Can Demir (Battalgazi) · 6 km
→ KRG-1005 Selin Aydın (Üniversite) · 5 km
→ KRG-1006 Mert Kaya (Yeşilyurt) · 12 km
Gün sonu: 6/6 teslimat · 37 km
```

Her algoritma `RotaStratejisi`’ni uygulayan ayrı bir sınıf: `RandevuRota`, `EnYakinRota`, `SogukOnceRota`. `Kurye` yalnızca
arayüzü tanır ve stratejiye listenin **salt okunur görünümünü** verir (`Collections.unmodifiableList`). `SogukOnceRota`
listeyi sıralamak yerine soğuk zincirlileri süzüyor ve seçimi bir `EnYakinRota`’ya soruyor. Main stratejiyi öğleden sonra
`setStrateji(new RandevuRota())` ile değiştiriyor: randevu sırası 1, 2, 3, 4. `strategy.akis.gun.Main` ve
`strategy.akis.yakin.Main` Canlı Akış’taki iki tarifi çalıştırır.

### Rota tezgâhı: aynı istekler, üç tasarım

```bash
java -cp out strategy.tezgah.ifelse.Main
java -cp out strategy.tezgah.kalitim.Main
java -cp out strategy.tezgah.strateji.Main
```

```text
~ soğuk zincir önce
→ KRG-1007 Elif Arslan (Kernek, soğuk zincir) · 5 km
→ KRG-1008 Emre Koç (Bostanbaşı, soğuk zincir) · 6 km
~ randevu sırası
→ KRG-1001 Ali Şahin (Çarşı) · 3 km
→ KRG-1006 Mert Kaya (Yeşilyurt) · 7 km
→ KRG-1005 Selin Aydın (Üniversite) · 12 km
→ KRG-1004 Can Demir (Battalgazi) · 5 km
Gün sonu: 6/6 teslimat · 38 km
```

```text
~ soğuk zincir önce
→ KRG-1007 Elif Arslan (Kernek, soğuk zincir) · 5 km
→ KRG-1008 Emre Koç (Bostanbaşı, soğuk zincir) · 6 km
→ KRG-1001 Ali Şahin (Çarşı) · 3 km
→ KRG-1005 Selin Aydın (Üniversite) · 5 km
→ KRG-1004 Can Demir (Battalgazi) · 5 km
→ KRG-1006 Mert Kaya (Yeşilyurt) · 13 km
Gün sonu: 6/6 teslimat · 37 km
```

```text
~ soğuk zincir önce
→ KRG-1007 Elif Arslan (Kernek, soğuk zincir) · 5 km
→ KRG-1008 Emre Koç (Bostanbaşı, soğuk zincir) · 6 km
~ randevu sırası
→ KRG-1001 Ali Şahin (Çarşı) · 3 km
→ KRG-1004 Can Demir (Battalgazi) · 6 km
→ KRG-1005 Selin Aydın (Üniversite) · 5 km
→ KRG-1006 Mert Kaya (Yeşilyurt) · 12 km
Gün sonu: 6/6 teslimat · 37 km
```

Aynı istekler (soğuk zincir önce, iki teslimat, randevu sırası, dört teslimat). if/else sürümünde randevu sırası bozuluyor.
Kalıtımda kuryenin sınıfı (`SogukOnceKuryesi`) sonradan değişemediği için randevu isteğinin karşılığı yok (`Main`’de yalnızca
bir yorum satırı) ve kurye bütün gün soğuk önce gidiyor. Strategy’de sıra doğru.

### Tuzak: durum tutan strateji paylaşılırsa (bilerek çöker)

```bash
java -cp out strategy.tuzak.Main
```

```text
— 1. kurye —
→ KRG-1001 Ali Şahin (Çarşı) · 8 km
— 2. kurye —
Exception in thread "main" java.lang.IllegalStateException: KRG-1005 bu kuryenin listesinde yok
	at strategy.tuzak.Kurye.teslimEt(Kurye.java:34)
	at strategy.tuzak.Main.main(Main.java:16)
```

`PlanliRota` planı ilk çağrıda bir kez hesaplayıp kendi içinde tutuyor. İki kuryeye aynı nesne verilince ikinci kurye,
birincinin planındaki durağı aldı; `Kurye.teslimEt` listesinde olmayan durağı reddetti. Düzeltme: her kuryeye kendi
`new PlanliRota()` nesnesi ya da durumsuz bir strateji. (Paketli dosyalarda satır numaraları uygulamadakinden 3 fazladır.)

### Genişlet: AgirOnceRota

```bash
java -cp out strategy.genislet.Main
```

```text
~ soğuk zincir önce
→ KRG-1007 Elif Arslan (Kernek, soğuk zincir) · 5 km
→ KRG-1008 Emre Koç (Bostanbaşı, soğuk zincir) · 6 km
~ ağır önce
→ KRG-1006 Mert Kaya (Yeşilyurt) · 4 km
→ KRG-1005 Selin Aydın (Üniversite) · 12 km
→ KRG-1004 Can Demir (Battalgazi) · 5 km
→ KRG-1001 Ali Şahin (Çarşı) · 6 km
Gün sonu: 6/6 teslimat · 38 km
```

Yeni bir algoritma, yeni bir sınıf: `AgirOnceRota` da `RotaStratejisi`’ni uyguluyor; Main’de tek satır değişti. `Kurye` ve
öteki üç strateji aynen kaldı.

## IDE ile açmak

- **IntelliJ IDEA:** *File → Open* ile bu `java` klasörünü açın, klasöre sağ tıklayıp
  *Mark Directory as → Sources Root* deyin, ardından ilgili `Main.java` dosyasını çalıştırın.
- **Eclipse / VS Code:** Klasörü bir Java projesi olarak açın; kaynak klasörü `java` olacak şekilde ayarlayın.

## Derste deneyebileceğiniz küçük alıştırmalar

**Factory Method**

1. `factorymethod/cozum` içine `DemiryoluLojistigi` ve `Tren` sınıflarını ekleyin. Kaç mevcut dosyayı değiştirmeniz gerekti?
2. Aynı isteği `factorymethod/sorun` sürümünde yapın ve iki deneyimi karşılaştırın.
3. Testler için `TestLojistigi` adında, sahte (mock) bir araç üreten bir alt sınıf yazın.

**Abstract Factory**

1. `abstractfactory/cozum` içine Demiryolu ailesini ekleyin (`DemiryoluFabrikasi`, `Tren`, demiryolu belgesi). Hangi dosyalar değişti?
2. `LojistikFabrikasi` arayüzüne `sigortaOlustur()` ekleyin ve derleyicinin hangi sınıfları reddettiğini görün. Sonra `default` metotla çözün.
3. `abstractfactory/sorun` sürümünü Abstract Factory’ye dönüştürün ve çöküşün neden ortadan kalktığını açıklayın.

**Singleton**

1. `singleton/sorun` sürümünü Singleton’a kendiniz dönüştürün: önce kurucuyu `private` yapın ve derleyicinin size yol göstermesine izin verin.
2. `singleton/yaris/korumasiz/Veritabani.java` içindeki gecikmeyi `0` yapıp deneyi defalarca çalıştırın. Yarış kayboldu mu, yoksa yalnızca seyrekleşti mi?
3. `singleton/cozum/TakipNoUretici` sınıfını önce Holder, sonra `enum` yazımına dönüştürün. İstemci kodunda ne değişti?
4. `singleton/kirmak/acik` sürümüne önce kurucu kontrolünü, sonra `readResolve()`’u ekleyin; saldırıları her adımda yeniden çalıştırın.
5. `UreticiTesti`’ni geçirmek için Singleton’a `reset()` metodu eklemek neden kötü bir fikir? DI sürümüyle karşılaştırın.

**Builder**

1. `builder/sorun/teleskop` sürümüne bir seçenek daha (ör. `kapidaOdeme`) ekleyin. Kaç kurucu yazmanız gerekti?
2. `builder/cozum/Gonderi.Builder`’a yeni bir kural ekleyin: “soğuk zincir gönderisi ekspres olmalı”. `AsiGonderisi` geçiyor mu?
3. `builder/yonetici` içine bir `DesiHazirlayici` (hacim ağırlığı hesaplayan) yazın. Yöneticiye dokunmanız gerekti mi?
4. `GonderiHazirlayici` arayüzüne `kapidaOdeme(int tutar)` ekleyin; derleyicinin hangi sınıfları reddettiğini görün, sonra `default` metotla çözün.

**Prototype**

1. `prototype/sorun` sürümünü kendiniz Prototype’a dönüştürün: önce `Gonderi`’ye soyut `kopyala()` ekleyip derleyicinin yol göstermesine izin verin.
2. `prototype/cozum` içine `SogukKoliGonderisi` (ör. `int derece` alanlı) ekleyin. `SiparisEkrani`’ne dokunmanız gerekti mi?
3. `Gonderi`’ye değişebilir bir `Adres` nesnesi ekleyin. Derin kopya için kopya kurucuda ne yapmalısınız? `String` alanlar için neden gerekmiyor?
4. `prototype/katalog` içindeki `olustur()` metodunu `return sablon;` yapın ve çıktının nasıl bozulduğunu gözlemleyin.
5. `klon/duzeltme/Koli` sınıfına yeni bir değişebilir alan (`List<String> notlar`) ekleyin ve `clone()`’u güncellemeyi “unutun”. Hata nerede ortaya çıkıyor?

**Adapter**

1. `adapter/sorun` sürümünü kendiniz Adapter’a dönüştürün: önce boş bir `GlobalShipAdaptoru implements KargoFirmasi` yazın ve derleyicinin yol göstermesine izin verin.
2. GlobalShip yarın ağırlığı **ons** (oz) cinsinden istemeye başlasa `adapter/cozum` içinde kaç dosya değişir? `adapter/sorun` içinde kaç?
3. `adapter/cozum` için GlobalShip’in sahte bir alt sınıfını (`SahteGlobalShip extends GlobalShipApi`) yazın ve adaptöre verin. İstemcileri değiştirmeden test edebildiniz mi?
4. İki yönlü bir adaptör tasarlayın: GlobalShip’in kendi sistemi de bizim `HizliKargo`’muzu kullanmak isteseydi hangi arayüzü uygulamanız gerekirdi?

**Bridge**

1. `bridge/sorun` sürümüne dördüncü bir yazıcı ekleyin. Kaç sınıf yazmanız gerekti? Aynısını `bridge/cozum`'da yapın.
2. `bridge/cozum` içine `SogukZincirEtiketi` (ör. "2-8 °C" uyarısı) ekleyin. Hangi yazıcı sınıflarına dokundunuz?
3. `TermalYazici` çerçeve çizemiyor. `Yazici` arayüzüne çerçeveyi destekleyip desteklemediğini söyleyen bir metot eklemek mi, yoksa termal yazıcının çizgiyle idare etmesi mi daha iyi? Tartışın.
4. Hangi yazıcının seçileceğini (depo → Zebra, e-posta → PDF) bir fabrikaya taşıyın. Bu, GoF'un "Abstract Factory bir köprüyü kurup yapılandırabilir" önerisidir.

**Composite**

1. `composite/sorun` içinde `Kantar`’a üçüncü bir döngü katı ekleyip saat kutusunu saydırın. Sonra saat kutusuna bir kutu daha koyun. Kaç kez daha değiştirmeniz gerekir?
2. `composite/cozum` içine yeni bir yaprak ekleyin: `Zarf` (irsaliye zarfı, 50 g). Hangi sınıflara dokundunuz? `composite/sorun`’da kaç metot değişirdi?
3. `Parca` arayüzüne `int urunSayisi()` işlemini ekleyin. Kaç sınıf değişti? Bu, Composite’in hangi zayıflığı ve hangi kalıbın (Visitor) çıkış noktasıdır?
4. `Koli.listele` her başlık için `agirlik()` çağırıyor; derin bir ağaçta aynı alt ağaç kaç kez toplanır? Ağırlığı önbelleğe almak neden zor (ipucu: `ekle`, `cikar`)?
5. `composite/seffaf` paketinde `Parca` tipindeki her şeye `ekle` diyebiliyoruz. Paleti yalnızca kolilerin üzerine konabilecek şekilde kısıtlamak isteseydiniz bunu tiplerle mi, çalışma anı kontrolüyle mi yapardınız? Tartışın.

**Decorator**

1. `decorator/sorun` sürümüne dördüncü bir seçenek (ör. SMS) ekleyin. Kaç yeni sınıf yazmanız gerekti? Aynısını `decorator/cozum`’da yapın.
2. `decorator/cozum` içinde sigortaya yeni bir zam yapın. Kaç dosya değişti? `decorator/sorun` sürümünde kaç dosya değişirdi?
3. `decorator/tezgah` içine `HaftaSonuTeslimat` (+25 TL) katmanını ekleyin ve indirimin içinde ve dışında deneyin. Fiyat neden değişiyor?
4. `EkHizmet` sınıfına `icteki`’yi döndüren bir `getIcteki()` ekleyip bir katmanı **çıkaran** yardımcı metot yazın (ör. SMS’i iptal etmek). Zincirin ortasındaki bir katmanı çıkarmak neden zor?
5. `KargoHizmeti hizmet = new Sigorta(new Ekspres(cekirdek));` dedikten sonra `hizmet == cekirdek` ve `hizmet instanceof StandartKargo` ifadelerini yazdırın. Sonuç, dekoratörlerin hangi bedelini gösteriyor?

**Facade**

1. `facade/sorun` içinde web sitesine kart limiti kontrolünü siz ekleyin. Üçüncü bir istemci (mobil) gelse kaç yere daha eklemeniz gerekir?
2. `facade/cozum`’da `GonderiCephesi`’ne `fiyatSor(Talep t)` işlemi ekleyin (yalnızca adres + tarife). Web sitesindeki “fiyat hesapla” düğmesi hangi alt sistemleri tanımak zorunda kaldı?
3. Kurye ataması bazen başarısız olsun (`ata` null dönsün). Etiket basılmış ama kurye bulunamamış gönderiyi cephe nasıl ele almalı? Kaç dosya değişti?
4. Depo görevlisi için yalnızca `EtiketServisi`’ni kullanan küçük bir program yazın (etiketi yeniden basmak). Cepheyi atlamak neden serbest?
5. `GonderiCephesi`’ni bir arayüz (`GonderiServisi`) arkasına alın ve testler için ödemeyi hep reddeden sahte bir cephe yazın. İstemcilerde ne değişti?

**Flyweight**

1. `flyweight/sorun` programını `-Xmx64m` ile `9_997` yerine `997`, `1_997`, `2_997`… gönderiyle çalıştırın. Tablet kaçıncı noktada çöküyor? Aynı denemeyi `flyweight/cozum` ile yapın.
2. `flyweight/cozum`’da `Harita.ekle` içindeki `fabrika.al(tur)` yerine `new IsaretTuru(tur)` yazın. Program yine derlenir mi? Kaç ikon yüklenir? Fabrikanın görevi neydi?
3. `IsaretTuru`’ya bir `setAd(String)` metodu ekleyip bir noktanın işaretinin adını değiştirin. Haritadaki başka hangi noktalar etkilendi? Paylaşılan nesne neden değişmez olmalı?
4. Bir “soğuk zincir” türü ekleyin: `Gonderiler`’deki `TURLER` dizisine `"soguk"` koyun. Kaç sınıf değişti, kaç ikon yüklendi?
5. İki ayrı `Harita` nesnesi yaratın (ör. kurye tableti ve merkez ekranı). `koli.png` kaç kez yüklendi? Fabrikayı bütün haritaların paylaşmasını nasıl sağlarsınız (ipucu: Singleton)?

**Proxy**

1. `proxy/sorun` içinde mobil uygulamaya KVKK denetimini siz ekleyin. Üçüncü bir istemci (çağrı merkezi) gelse kaç yere daha eklemeniz gerekir?
2. `proxy/cozum` içindeki `TakipVekili`’ne bir **kayıt** (log) denetimi ekleyin: kim, hangi takip numarasını sordu? İstemcilerde bir şey değişti mi?
3. Önbellek sonsuza dek tutuluyor; gönderi teslim edilince ekran yine “Dağıtımda” der. Kayda bir zaman damgası ekleyip 5 dakikadan eski kaydı yeniden soran bir önbellek yazın.
4. `TakipVekili` yerine `java.lang.reflect.Proxy` ile aynı denetimleri yapan bir dinamik vekil yazın (Gerçek Dünya sahnesindeki `DinamikVekil`’den başlayın).
5. Vekil ile Decorator’ın yapısı neden bu kadar benziyor? `TakipVekili`’ni bir dekoratöre dönüştürmek için neyi değiştirmeniz gerekirdi (ipucu: `gercek` nereden geliyor)?

**Chain of Responsibility**

1. `chainofresponsibility/sorun` içindeki `IstanbulKuryesi`’nde dolap dalının koşuluna `!g.sogukZincir()` ekleyin. Hata düzeldi mi? Aynı varsayım başka hangi dalda duruyor?
2. `chainofresponsibility/cozum`’a yeni bir halka yazın: `KilitliKutuyaTeslim` (kapıdaki kilitli kutu, yalnızca 2 kg’a kadar ve soğuk zincir olmayan). Hangi dosyalar değişti?
3. `TeslimatAdimi.teslimEt` içindeki son `else` dalında “KAYIP” yazmak yerine bir istisna fırlatın. `chainofresponsibility/tezgah/iadesiz` şimdi ne yapıyor? Hangisi daha iyi?
4. Zinciri bir metinden kurun: `"alici,dolap,komsu,sube,iade"` gibi bir dizgiyi okuyup halkaları sırayla bağlayan bir `ZincirKurucu` yazın. Bölgeye göre sıra artık nerede tanımlanıyor?
5. Her halkanın, gönderiyi teslim aldıktan sonra da iletmesini isteseydiniz (örneğin hepsi bir günlüğe yazsın) `teslimEt` nasıl değişirdi? Bu artık hangi yapıya (Decorator, filtre zinciri) benziyor?

**Command**

1. `command/sorun` içindeki `OperatorPaneli`’ne iki seviyeli geri al ekleyin (alanları dizilere çevirerek). Üçüncü bir işlem türü gelince kaç yeri değiştirmeniz gerekir?
2. `command/cozum`’a yeni bir komut yazın: `AyirKomutu` (hasarlı koliyi `C4`’teki karantina rafına alır, geri alınca eski rafına koyar). Panel ya da gece işi değişti mi?
3. `OperatorPaneli`’ne bir **kayıt** (log) ekleyin: her `yap` çağrısında komutun `ad()`’ını bir listeye yazsın. Program çökerse bu listeden işleri yeniden oynatabilir misiniz?
4. Etiket yazdırmak geri alınamaz. `EtiketKomutu`’nun `geriAl()`’ı ne yapmalı: hata mı fırlatmalı, “iptal” damgası mı basmalı, geçmişe hiç girmemeli mi? Tartışın.
5. `GeceIsi`’ni, komutları bir `ExecutorService`’e `Runnable` olarak veren bir sürüme çevirin. Komut sınıflarında bir şey değişti mi?

**Mediator**

1. `mediator/sorun`’daki hatayı yalnızca kural kopyalarını düzelterek giderin. Kaç sınıfı değiştirdiniz? Aynı kurala “20 kg” yerine “25 kg” sınırı gelse kaç sınıf daha değişir?
2. `mediator/cozum`’da `Main`’deki tıklamaların sırasını değiştirin (ör. önce Dolap, sonra soğuk zincir). Çıktı nasıl değişiyor, gönderi yine kurala uygun mu?
3. `GonderiFormu.degisti`’de `kaynak` parametresini kullanın: teslimat seçiciden gelen bildirimde yalnızca ücreti hesaplayın. Neler kazanılır, hangi hata riski doğar?
4. `mediator/tuzak`’ı düzeltin: `ayarla` hiç bildirmesin. Bir de şöyle deneyin: `ayarla` yalnızca seçim değiştiyse bildirsin. Program yine döngüye girer mi? Neden?
5. Forma bir “kapıda ödeme” kutusu ekleyin (+10 TL; kapıda ödemeli gönderi dolaba konamaz). Mediator’da hangi dosyalar değişti, kalıpsız sürümde hangileri değişirdi?

**Memento**

1. `memento/sorun` içindeki `YedekDefteri`’ni kamyonu da kopyalayacak şekilde düzeltin. Depoya üçüncü bir alan (ör. ayrılmış raflar) eklenince kaç dosyayı değiştirmeniz gerekir?
2. `memento/cozum`’daki `YedekDefteri`’ne `yedekler.get(ad).raflar` yazdıran bir satır ekleyin ve derleyin. Derleyici ne diyor? `Hatira` bir `record` olsaydı ne olurdu?
3. `Depo.Hatira`’nın kurucusundaki `new TreeMap<>(raflar)` kopyasını kaldırıp yalnızca referansı saklayın. `memento.akis.noktalar` çıktısı nasıl değişir? Neden?
4. Depoya yeni bir alan ekleyin: ayrılmış raflar (`Set<String>`). Memento çözümünde hangi dosyalar değişti? `YedekDefteri` değişti mi?
5. `DepoGecmisi`’ne en çok 10 hatıra tutan bir sınır koyun (en eski hatıra silinsin). Bellek ile geri alınabilecek adım sayısı arasındaki ilişkiyi tartışın.

**Observer**

1. `observer/sorun`’a bir mobil uygulama ekranı ekleyin. Gonderi’de kaç yeri değiştirmeniz gerekti? Aynı işi `observer/cozum`’da yapın.
2. `observer/cozum`’da `bildir()`’i `public` yapıp `setDurum`’daki çağrıyı silin; Main iki değişiklikten sonra bir kez `bildir()` desin. Ekranlar ne gösterir? “Bildirimi kim tetikler?” sorusunu tartışın.
3. `guncelle`’yi *push* modeline çevirin: `guncelle(String takipNo, String durum)`. Hangi dosyalar değişti? Panele teslim alanın adı da gerekseydi ne olurdu?
4. `observer/tuzak`’ta abone sırasını değiştirin (telefon ikinci). Program çöküyor mu, kurye rotası ne diyor? Sonra `bildir()`’de `List.copyOf(aboneler)` kullanın.
5. `aboneEkle` aynı ekranı iki kez eklemesin. `List` yerine `LinkedHashSet` kullansaydınız bildirim sırası nasıl olurdu?

**State**

1. `state/sorun` içindeki `KargoDolabi`’nde `paketKoy`’u düzeltin: `else` yerine her durumu açıkça sorun. Dördüncü bir durum (HİZMET DIŞI) eklemek için kaç metoda dokunmanız gerekir?
2. `state/cozum`’da `KilitliDurum`’dan `paketKoy`’u silin ve derleyin. Derleyici ne diyor? Kalıpsız sürümde aynı unutkanlık ne zaman ortaya çıkmıştı?
3. Durum sınıflarının hiç alanı yok. Her geçişte `new` yerine her durumdan tek bir nesne kullanın (ör. `DolapDurumu`’nun yanında `static final` sabitler ya da bir `enum`). Çıktı değişti mi?
4. Geçişleri durumlardan alıp `KargoDolabi`’nde toplayın (durumlar yalnızca “ne oldu”yu döndürsün). Yeni bir durum eklemek kolaylaştı mı, zorlaştı mı?
5. Arayüze yeni bir istek ekleyin: `gunSonu()` (üç gün alınmayan paket iadeye ayrılır). Kaç sınıf değişti? State’in kolaylaştırdığı ile zorlaştırdığını karşılaştırın.

**Strategy**

1. `strategy/sorun`’daki hatayı yalnızca `SOGUK_ONCE` dalını düzelterek giderin (listeyi sıralamadan). Dördüncü bir algoritma eklemek için hangi sınıfa, kaç yere dokunmanız gerekir?
2. `strategy/cozum`’da `Kurye` stratejiye `okunur` yerine `kalan`’ı versin ve `SogukOnceRota`’ya `kalan.sort(…)` geri konsun. Hata geri geldi mi? `List.copyOf(kalan)` vermek de korur mu? İkisinin farkı nedir?
3. “Son randevu önce” stratejisini sınıf yazmadan, lambda ile takın: `kurye.setStrateji((konum, kalan) -> …)`. Ne zaman ayrı bir sınıf, ne zaman lambda tercih edilir?
4. `strategy/tuzak`’ı iki yoldan düzeltin: (a) her kuryeye kendi `PlanliRota` nesnesi, (b) planı strateji yerine `Kurye`’de tutmak. Hangisi Strategy’nin fikrine daha uygun?
5. Kalıtım tasarımına (`strategy/tezgah/kalitim`) gün ortasında algoritma değiştirmeyi ekleyin: yeni bir kurye nesnesi yaratıp listeyi, konumu ve kilometreyi taşıyın. Kuryeyi tanıyan başka nesneler olsaydı ne olurdu?
