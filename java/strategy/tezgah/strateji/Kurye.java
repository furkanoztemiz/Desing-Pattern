// Bu dosya tools/export-java.js ile js/patterns/strategy/data.js içinden üretildi.
package strategy.tezgah.strateji;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Bağlam: durakları ve konumu tutar; sıradaki durağı strateji seçer.
 */
public class Kurye {

    private final List<Durak> kalan;    // randevu sırasında
    private final List<Durak> okunur;   // stratejinin gördüğü
    private final int toplam;
    private Konum konum = Konum.DEPO;
    private int km;
    private RotaStratejisi strateji;

    public Kurye(List<Durak> duraklar, RotaStratejisi strateji) {
        this.kalan = new ArrayList<>(duraklar);
        this.okunur = Collections.unmodifiableList(kalan);
        this.toplam = duraklar.size();
        this.strateji = strateji;
    }

    public void setStrateji(RotaStratejisi strateji) {
        this.strateji = strateji;
    }

    public void teslimEt() {
        Durak d = strateji.sec(konum, okunur);
        if (!kalan.remove(d)) {
            throw new IllegalStateException(d.no() + " bu kuryenin listesinde yok");
        }
        int yol = konum.mesafe(d.konum());
        km += yol;
        konum = d.konum();
        System.out.println("→ " + d + " · " + yol + " km");
    }

    public String ozet() {
        int teslim = toplam - kalan.size();
        return "Gün sonu: " + teslim + "/" + toplam + " teslimat · " + km + " km";
    }
}
