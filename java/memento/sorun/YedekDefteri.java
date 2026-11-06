// Bu dosya tools/export-java.js ile js/patterns/memento/data.js içinden üretildi.
package memento.sorun;

import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

/**
 * Yedek defteri: deponun raflarının kopyasını adıyla saklar, istenince geri yükler.
 */
public class YedekDefteri {

    private final Depo depo;
    private final Map<String, Map<String, String>> yedekler = new HashMap<>();

    public YedekDefteri(Depo depo) {
        this.depo = depo;
    }

    public void kaydet(String ad) {
        yedekler.put(ad, new TreeMap<>(depo.getRaflar()));  // kopya
        System.out.println("[Defter] kaydedildi: " + ad);
    }

    public void geriYukle(String ad) {
        depo.setRaflar(yedekler.get(ad));
        System.out.println("[Defter] geri yüklendi: " + ad);
    }
}
