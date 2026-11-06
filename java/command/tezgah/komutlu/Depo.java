// Bu dosya tools/export-java.js ile js/patterns/command/data.js içinden üretildi.
package command.tezgah.komutlu;

import java.util.Map;
import java.util.TreeMap;

/**
 * Depodaki raflar: hangi koli hangi rafta? Taşımayı, rafa koymayı ve raftan almayı bilen nesne.
 */
public class Depo {

    private final Map<String, String> raflar = new TreeMap<>();

    /** Sabahki raf düzeni */
    public static Depo sabah() {
        Depo d = new Depo();
        d.raflar.put("KRG-1001", "A1");
        d.raflar.put("KRG-1002", "A2");
        d.raflar.put("KRG-1003", "A3");
        d.raflar.put("KRG-1004", "B1");
        d.raflar.put("KRG-1005", "B2");
        d.raflar.put("KRG-1006", "C1");
        return d;
    }

    public String yeri(String koli) {
        return raflar.get(koli);
    }

    public void tasi(String koli, String raf) {
        String eski = raflar.put(koli, raf);
        System.out.println("  depo: " + koli + " " + eski + " → " + raf);
    }

    public String cikar(String koli) {
        String raf = raflar.remove(koli);
        System.out.println("  depo: " + koli + " " + raf + " rafından alındı");
        return raf;
    }

    public void koy(String koli, String raf) {
        raflar.put(koli, raf);
        System.out.println("  depo: " + koli + " → " + raf);
    }

    public String durum() {
        StringBuilder sb = new StringBuilder("Raflar:");
        raflar.forEach((koli, raf) -> sb.append(' ').append(koli.substring(4)).append(':').append(raf));
        return sb.toString();
    }
}
