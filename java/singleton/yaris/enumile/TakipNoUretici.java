// Bu dosya tools/export-java.js ile js/patterns/singleton/data.js içinden üretildi.
package singleton.yaris.enumile;

public enum TakipNoUretici {

    INSTANCE;   // JVM tek örneği garanti eder

    private int sayac;

    TakipNoUretici() {   // enum kurucusu zaten private
        sayac = Veritabani.sonNumarayiOku();
        String t = Thread.currentThread().getName();
        System.out.println("[Üretici] yeni nesne oluşturuldu (" + t + ")");
    }

    public synchronized String yeniNumara() {   // sayac++ de korunmalı
        sayac++;
        return "KRG-" + sayac;
    }
}
