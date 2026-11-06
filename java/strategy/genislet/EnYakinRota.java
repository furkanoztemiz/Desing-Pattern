// Bu dosya tools/export-java.js ile js/patterns/strategy/data.js içinden üretildi.
package strategy.genislet;

import java.util.List;

/**
 * En yakın durak; eşitlikte randevusu önce olan.
 */
public class EnYakinRota implements RotaStratejisi {

    @Override
    public Durak sec(Konum konum, List<Durak> kalan) {
        Durak secilen = kalan.get(0);
        for (Durak d : kalan) {
            if (konum.mesafe(d.konum()) < konum.mesafe(secilen.konum())) {
                secilen = d;
            }
        }
        return secilen;
    }
}
