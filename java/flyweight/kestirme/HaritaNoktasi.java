// Bu dosya tools/export-java.js ile js/patterns/flyweight/data.js içinden üretildi.
package flyweight.kestirme;

import java.util.HashMap;
import java.util.Map;

/**
 * Haritadaki bir gönderi noktası: türü, ikonu, etiketi ve konumu.
 */
public class HaritaNoktasi {

    // kestirme: aynı türden noktalar TEK nesneyi paylaşsın (ikon bir kez yüklensin)
    private static final Map<String, HaritaNoktasi> HAVUZ = new HashMap<>();

    private final String tur;
    private final Ikon ikon;
    private String etiket;
    private int x;
    private int y;

    private HaritaNoktasi(String tur) {
        this.tur = tur;
        this.ikon = new Ikon(tur + ".png");
    }

    public static HaritaNoktasi al(String etiket, int x, int y, String tur) {
        HaritaNoktasi nokta = HAVUZ.get(tur);
        if (nokta == null) {
            nokta = new HaritaNoktasi(tur);
            HAVUZ.put(tur, nokta);
        }
        nokta.etiket = etiket;              // paylaşılan nesnenin üstüne yazılır!
        nokta.x = x;
        nokta.y = y;
        return nokta;
    }

    public void ciz() {
        System.out.println("[" + tur + "] " + etiket + " → (" + x + ", " + y + ") · " + ikon);
    }
}
