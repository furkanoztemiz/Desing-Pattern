// Bu dosya tools/export-java.js ile js/patterns/composite/data.js içinden üretildi.
package composite.akis.agirlik;

import java.util.ArrayList;
import java.util.List;

/**
 * «Composite» — Koli: parçaları tutar; her soruyu içindekilere sorup cevapları birleştirir.
 */
public class Koli implements Parca {

    private final String ad;
    private final int dara;                                 // boş kolinin ağırlığı
    private final List<Parca> icindekiler = new ArrayList<>();  // ürün de olur, koli de

    public Koli(String ad, int dara) {
        this.ad = ad;
        this.dara = dara;
    }

    public void ekle(Parca p) {
        icindekiler.add(p);
    }

    public void cikar(Parca p) {
        icindekiler.remove(p);
    }

    @Override
    public int agirlik() {
        int toplam = dara;
        for (Parca p : icindekiler) {
            toplam += p.agirlik();                          // ürün mü koli mi, sormadan
        }
        return toplam;
    }

    @Override
    public void listele(String girinti) {
        System.out.println(girinti + "+ " + ad + " [" + agirlik() + " g]");
        for (Parca p : icindekiler) {
            p.listele(girinti + "   ");                     // bir kat içeriden
        }
    }
}
