// Bu dosya tools/export-java.js ile js/patterns/strategy/data.js içinden üretildi.
package strategy.tezgah.strateji;

import java.util.List;

/**
 * Randevu sırası: müşterilere söz verilen sıra. Kurye listeyi bu sırada tutar.
 */
public class RandevuRota implements RotaStratejisi {

    @Override
    public Durak sec(Konum konum, List<Durak> kalan) {
        return kalan.get(0);
    }
}
