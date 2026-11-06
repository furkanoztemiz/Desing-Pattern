// Bu dosya tools/export-java.js ile js/patterns/memento/data.js içinden üretildi.
package memento.akis.gece;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * «Originator» — Depo: kendi durumunun hatırasını oluşturur ve istenince o hatıraya döner.
 */
public class Depo {

    private final Map<String, String> raflar = new TreeMap<>();
    private final List<String> kamyon = new ArrayList<>();

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

    public void tasi(String koli, String raf) {
        if (raflar.containsValue(raf)) {
            throw new IllegalStateException(raf + " dolu");
        }
        String eski = raflar.put(koli, raf);
        System.out.println("  depo: " + koli + " " + eski + " → " + raf);
    }

    public void yukle(String koli) {
        String raf = raflar.remove(koli);
        kamyon.add(koli);
        System.out.println("  kamyon: " + koli + " yüklendi (" + raf + " boşaldı)");
    }

    public Hatira hatiraOlustur() {
        return new Hatira(raflar, kamyon);
    }

    public void hatirayaDon(Hatira h) {
        raflar.clear();
        raflar.putAll(h.raflar);
        kamyon.clear();
        kamyon.addAll(h.kamyon);
    }

    public String durum() {
        StringBuilder sb = new StringBuilder("Raflar:");
        raflar.forEach((koli, raf) -> sb.append(' ').append(koli.substring(4)).append(':').append(raf));
        sb.append(" · Kamyon:");
        if (kamyon.isEmpty()) {
            sb.append(" boş");
        }
        for (String koli : kamyon) {
            sb.append(' ').append(koli.substring(4));
        }
        return sb.toString();
    }

    /**
     * «Memento» — Deponun bir anki durumu. Alanları ve kurucusu özel: içini yalnızca Depo görür.
     */
    public static final class Hatira {

        private final Map<String, String> raflar;
        private final List<String> kamyon;

        private Hatira(Map<String, String> raflar, List<String> kamyon) {
            this.raflar = new TreeMap<>(raflar);
            this.kamyon = new ArrayList<>(kamyon);
        }
    }
}
