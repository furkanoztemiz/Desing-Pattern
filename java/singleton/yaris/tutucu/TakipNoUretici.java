// Bu dosya tools/export-java.js ile js/patterns/singleton/data.js içinden üretildi.
package singleton.yaris.tutucu;

public class TakipNoUretici {

    private static class Tutucu {   // ilk kullanımda başlatılır
        static final TakipNoUretici ORNEK = new TakipNoUretici();
    }

    private int sayac;

    private TakipNoUretici() {
        sayac = Veritabani.sonNumarayiOku();   // yavaş: ~100 ms
        String t = Thread.currentThread().getName();
        System.out.println("[Üretici] yeni nesne oluşturuldu (" + t + ")");
    }

    public static TakipNoUretici getInstance() {
        return Tutucu.ORNEK;
    }

    public synchronized String yeniNumara() {   // sayac++ de korunmalı
        sayac++;
        return "KRG-" + sayac;
    }
}
