// Bu dosya tools/export-java.js ile js/patterns/strategy/data.js içinden üretildi.
package strategy.tezgah.kalitim;

import java.util.List;

public class RandevuKuryesi extends Kurye {

    public RandevuKuryesi(List<Durak> duraklar) {
        super(duraklar);
    }

    @Override
    protected Durak sec() {
        return kalan.get(0);
    }
}
