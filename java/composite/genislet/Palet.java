// Bu dosya tools/export-java.js ile js/patterns/composite/data.js içinden üretildi.
package composite.genislet;

import java.util.ArrayList;
import java.util.List;

/**
 * «Composite» — Palet: koliler ve kolisiz büyük ürünler üzerine dizilir.
 */
public class Palet implements Parca {

    private final String hedef;
    private final List<Parca> icindekiler = new ArrayList<>();

    public Palet(String hedef) {
        this.hedef = hedef;
    }

    public void ekle(Parca p) {
        icindekiler.add(p);
    }

    @Override
    public int agirlik() {
        int toplam = 20000;                                 // ahşap palet
        for (Parca p : icindekiler) {
            toplam += p.agirlik();
        }
        return toplam;
    }

    @Override
    public void listele(String girinti) {
        System.out.println(girinti + "# Palet: " + hedef + " [" + agirlik() + " g]");
        for (Parca p : icindekiler) {
            p.listele(girinti + "   ");
        }
    }
}
