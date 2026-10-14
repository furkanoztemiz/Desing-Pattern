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
