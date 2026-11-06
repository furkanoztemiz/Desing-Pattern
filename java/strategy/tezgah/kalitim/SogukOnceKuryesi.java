// Bu dosya tools/export-java.js ile js/patterns/strategy/data.js içinden üretildi.
package strategy.tezgah.kalitim;

import java.util.List;

public class SogukOnceKuryesi extends Kurye {

    public SogukOnceKuryesi(List<Durak> duraklar) {
        super(duraklar);
    }

    @Override
    protected Durak sec() {
        List<Durak> soguklar = kalan.stream().filter(Durak::soguk).toList();
        return enYakin(soguklar.isEmpty() ? kalan : soguklar);
    }
}
