// Bu dosya tools/export-java.js ile js/patterns/singleton/data.js içinden üretildi.
package singleton.yaris.erken;

public class TakipNoUretici {

    // sınıf başlatılırken (bir kez) oluşturulur
    private static final TakipNoUretici ORNEK = new TakipNoUretici();

    private int sayac;

    private TakipNoUretici() {
        sayac = Veritabani.sonNumarayiOku();   // yavaş: ~100 ms
        String t = Thread.currentThread().getName();
        System.out.println("[Üretici] yeni nesne oluşturuldu (" + t + ")");
    }

    public static TakipNoUretici getInstance() {
        return ORNEK;
    }

    public synchronized String yeniNumara() {   // sayac++ de korunmalı
        sayac++;
        return "KRG-" + sayac;
    }
}
