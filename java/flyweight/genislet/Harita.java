// Bu dosya tools/export-java.js ile js/patterns/flyweight/data.js içinden üretildi.
package flyweight.genislet;

import java.util.ArrayList;
import java.util.List;

/**
 * «Client» — Canlı gönderi haritası: dışsal durumu (noktaları) tutar, işaretleri fabrikadan alır.
 */
public class Harita {

    private static final int ORNEK = 5;             // konsola çizilen nokta sayısı

    private final List<HaritaNoktasi> noktalar = new ArrayList<>();
    private final IsaretFabrikasi fabrika = new IsaretFabrikasi();

    public void ekle(String etiket, int x, int y, String tur) {
        ekle(etiket, x, y, fabrika.al(tur));        // paylaşılan işaret: fabrikadan
    }

    public void ekle(String etiket, int x, int y, Isaret isaret) {
        noktalar.add(new HaritaNoktasi(etiket, x, y, isaret));
    }

    public void ciz() {
        for (int i = 0; i < Math.min(ORNEK, noktalar.size()); i++) {
            noktalar.get(i).ciz();
        }
        if (noktalar.size() > ORNEK) {
            System.out.println("… ve " + (noktalar.size() - ORNEK) + " nokta daha");
        }
    }

    public String ozet() {
        return "Harita: " + noktalar.size() + " nokta, " + Ikon.yuklenen + " ikon, "
                + Ikon.yuklenen * Ikon.BOYUT / 1024 + " KB";
    }
}
