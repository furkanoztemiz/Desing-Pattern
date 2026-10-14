// Bu dosya tools/export-java.js ile js/patterns/singleton/data.js içinden üretildi.
package singleton.yaris.ciftkontrol;

public class TakipNoUretici {

    private static volatile TakipNoUretici ornek;   // volatile!

    private int sayac;

    private TakipNoUretici() {
        sayac = Veritabani.sonNumarayiOku();   // yavaş: ~100 ms
        String t = Thread.currentThread().getName();
        System.out.println("[Üretici] yeni nesne oluşturuldu (" + t + ")");
    }

    public static TakipNoUretici getInstance() {
        if (ornek == null) {               // 1. kontrol (kilitsiz)
            synchronized (TakipNoUretici.class) {
                if (ornek == null) {       // 2. kontrol (kilitli)
                    ornek = new TakipNoUretici();
                }
            }
        }
        return ornek;
    }

    public synchronized String yeniNumara() {   // sayac++ de korunmalı
        sayac++;
        return "KRG-" + sayac;
    }
}
