// Bu dosya tools/export-java.js ile js/patterns/singleton/data.js içinden üretildi.
package singleton.cozum;

/**
 * «Singleton» — Takip numarası üretici.
 * Programda bu sınıftan YALNIZCA BİR nesne olabilir.
 */
public class TakipNoUretici {

    private static TakipNoUretici ornek;   // tek örnek burada saklanır

    private int sayac = 1000;   // son verilen numara

    private TakipNoUretici() {   // dışarıdan new yasak!
        System.out.println("[Üretici] yeni nesne oluşturuldu (sayaç: " + sayac + ")");
    }

    public static TakipNoUretici getInstance() {   // global erişim noktası
        if (ornek == null) {
            ornek = new TakipNoUretici();   // ilk çağrıda oluştur (tembel)
        }
        return ornek;
    }

    public String yeniNumara() {
        sayac++;
        return "KRG-" + sayac;
    }
}
