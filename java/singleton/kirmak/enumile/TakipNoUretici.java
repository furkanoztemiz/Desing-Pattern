// Bu dosya tools/export-java.js ile js/patterns/singleton/data.js içinden üretildi.
package singleton.kirmak.enumile;

public enum TakipNoUretici {

    INSTANCE;

    private int sayac = 1000;

    TakipNoUretici() {
        System.out.println("[Üretici] yeni nesne oluşturuldu");
    }

    public String yeniNumara() {
        sayac++;
        return "KRG-" + sayac;
    }
}
