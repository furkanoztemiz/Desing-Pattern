// Bu dosya tools/export-java.js ile js/patterns/strategy/data.js içinden üretildi.
package strategy.tezgah.kalitim;

import java.util.List;

public class EnYakinKuryesi extends Kurye {

    public EnYakinKuryesi(List<Durak> duraklar) {
        super(duraklar);
    }

    @Override
    protected Durak sec() {
        return enYakin(kalan);
    }
}
