// Bu dosya tools/export-java.js ile js/patterns/singleton/data.js içinden üretildi.
package singleton.sorun;

public class TakipNoUretici {

    private int sayac = 1000;   // son verilen numara

    public TakipNoUretici() {
        System.out.println("[Üretici] yeni nesne oluşturuldu (sayaç: " + sayac + ")");
    }

    public String yeniNumara() {
        sayac++;
        return "KRG-" + sayac;
    }
}
