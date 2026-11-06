// Bu dosya tools/export-java.js ile js/patterns/memento/data.js içinden üretildi.
package memento.cozum;

import java.util.HashMap;
import java.util.Map;

/**
 * «Caretaker» — Hatıraları adıyla saklar; içlerine bakmaz, yalnızca depoya geri verir.
 */
public class YedekDefteri {

    private final Depo depo;
    private final Map<String, Depo.Hatira> yedekler = new HashMap<>();

    public YedekDefteri(Depo depo) {
        this.depo = depo;
    }

    public void kaydet(String ad) {
        yedekler.put(ad, depo.hatiraOlustur());
        System.out.println("[Defter] kaydedildi: " + ad);
    }

    public void geriYukle(String ad) {
        depo.hatirayaDon(yedekler.get(ad));
        System.out.println("[Defter] geri yüklendi: " + ad);
    }
}
