// Bu dosya tools/export-java.js ile js/patterns/singleton/data.js içinden üretildi.
package singleton.kirmak.acik;

import java.io.Serializable;

public class TakipNoUretici implements Serializable {

    private static final long serialVersionUID = 1L;

    private static TakipNoUretici ornek;

    private int sayac = 1000;

    private TakipNoUretici() {
        System.out.println("[Üretici] yeni nesne oluşturuldu");
    }

    public static TakipNoUretici getInstance() {
        if (ornek == null) {
            ornek = new TakipNoUretici();
        }
        return ornek;
    }

    public String yeniNumara() {
        sayac++;
        return "KRG-" + sayac;
    }
}
