// Bu dosya tools/export-java.js ile js/patterns/composite/data.js içinden üretildi.
package composite.sorun;

import java.util.ArrayList;
import java.util.List;

public class Koli {

    private final String ad;
    private final int dara;                                 // boş kolinin ağırlığı (g)
    private final List<Urun> urunler = new ArrayList<>();
    private final List<Koli> koliler = new ArrayList<>();   // koli içinde koli

    public Koli(String ad, int dara) {
        this.ad = ad;
        this.dara = dara;
    }

    public void ekle(Urun u) {
        urunler.add(u);
    }

    public void ekle(Koli k) {
        koliler.add(k);
    }

    public String getAd() {
        return ad;
    }

    public int getDara() {
        return dara;
    }

    public List<Urun> getUrunler() {
        return urunler;
    }

    public List<Koli> getKoliler() {
        return koliler;
    }
}
