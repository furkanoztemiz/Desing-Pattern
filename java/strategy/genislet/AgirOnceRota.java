// Bu dosya tools/export-java.js ile js/patterns/strategy/data.js içinden üretildi.
package strategy.genislet;

import java.util.List;

/**
 * Ağır önce: kamyoneti hafifletmek için önce en ağır koli.
 */
public class AgirOnceRota implements RotaStratejisi {

    @Override
    public Durak sec(Konum konum, List<Durak> kalan) {
        Durak secilen = kalan.get(0);
        for (Durak d : kalan) {
            if (d.kg() > secilen.kg()) {
                secilen = d;
            }
        }
        return secilen;
    }
}
