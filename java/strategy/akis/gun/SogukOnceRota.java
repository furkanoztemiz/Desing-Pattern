// Bu dosya tools/export-java.js ile js/patterns/strategy/data.js içinden üretildi.
package strategy.akis.gun;

import java.util.List;

/**
 * Soğuk zincir önce: önce soğuk zincirlilerin en yakını, sonra en yakın durak.
 */
public class SogukOnceRota implements RotaStratejisi {

    private final RotaStratejisi enYakin = new EnYakinRota();

    @Override
    public Durak sec(Konum konum, List<Durak> kalan) {
        List<Durak> soguklar = kalan.stream().filter(Durak::soguk).toList();
        return enYakin.sec(konum, soguklar.isEmpty() ? kalan : soguklar);
    }
}
