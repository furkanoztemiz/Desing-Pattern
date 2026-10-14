// Bu dosya tools/export-java.js ile js/patterns/prototype/data.js içinden üretildi.
package prototype.katalog;

import java.util.HashMap;
import java.util.Map;

/**
 * «Prototype Manager» — Hazır şablonları adlarıyla saklar; istenince KOPYASINI verir.
 */
public class SablonKatalogu {

    private final Map<String, Gonderi> sablonlar = new HashMap<>();

    public void ekle(String ad, Gonderi sablon) {
        sablonlar.put(ad, sablon);
    }

    public Gonderi olustur(String ad) {
        Gonderi sablon = sablonlar.get(ad);
        if (sablon == null) {
            throw new IllegalArgumentException("Böyle bir şablon yok: " + ad);
        }
        return sablon.kopyala();                // şablonun kendisi DEĞİL, kopyası!
    }
}
