// Bu dosya tools/export-java.js ile js/patterns/singleton/data.js içinden üretildi.
package singleton.yaris.senkron;

public class TakipNoUretici {

    private static TakipNoUretici ornek;

    private int sayac;

    private TakipNoUretici() {
        sayac = Veritabani.sonNumarayiOku();   // yavaş: ~100 ms
        String t = Thread.currentThread().getName();
        System.out.println("[Üretici] yeni nesne oluşturuldu (" + t + ")");
    }

    // aynı anda yalnızca BİR thread girebilir
    public static synchronized TakipNoUretici getInstance() {
        if (ornek == null) {
            ornek = new TakipNoUretici();
        }
        return ornek;
    }

    public synchronized String yeniNumara() {   // sayac++ de korunmalı
        sayac++;
        return "KRG-" + sayac;
    }
}
