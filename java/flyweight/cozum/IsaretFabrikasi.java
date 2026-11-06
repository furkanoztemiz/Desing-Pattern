// Bu dosya tools/export-java.js ile js/patterns/flyweight/data.js içinden üretildi.
package flyweight.cozum;

import java.util.HashMap;
import java.util.Map;

/**
 * «FlyweightFactory» — İşaretleri üretir ve paylaştırır: her tür için TEK nesne.
 */
public class IsaretFabrikasi {

    private final Map<String, IsaretTuru> havuz = new HashMap<>();

    public Isaret al(String tur) {
        IsaretTuru isaret = havuz.get(tur);
        if (isaret == null) {                   // havuzda yok: bir kez yarat
            isaret = new IsaretTuru(tur);
            havuz.put(tur, isaret);
            System.out.println("[Fabrika] yeni tür: " + isaret);
        }
        return isaret;                          // varsa hep AYNI nesne
    }
}
