// Bu dosya tools/export-java.js ile js/patterns/strategy/data.js içinden üretildi.
package strategy.tezgah.kalitim;

import java.util.ArrayList;
import java.util.List;

/**
 * Kalıtımla: her algoritma bir alt sınıf; sınıf, kurye yaratılırken seçilir.
 */
public abstract class Kurye {

    protected final List<Durak> kalan;  // randevu sırasında
    protected Konum konum = Konum.DEPO;
    private final int toplam;
    private int km;

    protected Kurye(List<Durak> duraklar) {
        this.kalan = new ArrayList<>(duraklar);
        this.toplam = duraklar.size();
    }

    protected abstract Durak sec();

    protected Durak enYakin(List<Durak> adaylar) {
        Durak secilen = adaylar.get(0);
        for (Durak d : adaylar) {
            if (konum.mesafe(d.konum()) < konum.mesafe(secilen.konum())) {
                secilen = d;
            }
        }
        return secilen;
    }

    public void teslimEt() {
        Durak d = sec();
        kalan.remove(d);
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
