// Bu dosya tools/export-java.js ile js/patterns/strategy/data.js içinden üretildi.
package strategy.sorun;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Sürüm 2.0: SOGUK_ONCE eklendi. Algoritmaların hepsi aynı listeyi kullanıyor.
 */
public class Kurye {

    private final List<Durak> kalan;    // randevu sırasında
    private final int toplam;
    private Konum konum = Konum.DEPO;
    private int km;
    private String yontem = "RANDEVU";

    public Kurye(List<Durak> duraklar) {
        this.kalan = new ArrayList<>(duraklar);
        this.toplam = duraklar.size();
    }

    public void yontemSec(String yontem) {
        this.yontem = yontem;
    }

    public void teslimEt() {
        Durak d = sec();
        kalan.remove(d);
        int yol = konum.mesafe(d.konum());
        km += yol;
        konum = d.konum();
        System.out.println("→ " + d + " · " + yol + " km");
    }

    private Durak sec() {
        if (yontem.equals("RANDEVU")) {
            return kalan.get(0);  // liste randevu sırasında
        } else if (yontem.equals("EN_YAKIN")) {
            Durak secilen = kalan.get(0);
            for (Durak d : kalan) {
                if (konum.mesafe(d.konum()) < konum.mesafe(secilen.konum())) {
                    secilen = d;
                }
            }
            return secilen;
        } else if (yontem.equals("SOGUK_ONCE")) {
            // soğuk zincirliler başa, sonra yakından uzağa
            kalan.sort(Comparator.comparing(Durak::soguk).reversed()
                    .thenComparingInt(d -> konum.mesafe(d.konum())));
            return kalan.get(0);
        }
        throw new IllegalArgumentException("bilinmeyen yöntem: " + yontem);
    }

    public String ozet() {
        int teslim = toplam - kalan.size();
        return "Gün sonu: " + teslim + "/" + toplam + " teslimat · " + km + " km";
    }
}
