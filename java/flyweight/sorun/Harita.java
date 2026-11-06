// Bu dosya tools/export-java.js ile js/patterns/flyweight/data.js içinden üretildi.
package flyweight.sorun;

import java.util.ArrayList;
import java.util.List;

/**
 * Canlı gönderi haritası: kuryelerin tabletinde çalışır.
 */
public class Harita {

    private static final int ORNEK = 5;             // konsola çizilen nokta sayısı

    private final List<HaritaNoktasi> noktalar = new ArrayList<>();

    public void ekle(String etiket, int x, int y, String tur) {
        noktalar.add(new HaritaNoktasi(etiket, x, y, tur));
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
