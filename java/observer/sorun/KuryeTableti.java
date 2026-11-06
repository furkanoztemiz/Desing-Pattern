// Bu dosya tools/export-java.js ile js/patterns/observer/data.js içinden üretildi.
package observer.sorun;

import java.util.Set;
import java.util.TreeSet;

/**
 * Kurye tableti: dağıtımdakiler rotaya girer, teslim edilenler çıkar.
 */
public class KuryeTableti {

    private final Set<String> duraklar = new TreeSet<>();

    public void rotaGuncelle(String takipNo, String durum) {
        if (durum.equals("Dağıtımda")) {
            duraklar.add(takipNo);
            System.out.println("  Tablet: " + takipNo + " rotaya eklendi");
        } else if (durum.equals("Teslim edildi")) {
            duraklar.remove(takipNo);
            System.out.println("  Tablet: " + takipNo + " rotadan çıktı");
        } else {
            System.out.println("  Tablet: " + takipNo + " " + durum);
        }
    }

    public String rota() {
        if (duraklar.isEmpty()) {
            return "Kurye rotası: boş";
        }
        return "Kurye rotası: " + String.join(" ", duraklar);
    }
}
