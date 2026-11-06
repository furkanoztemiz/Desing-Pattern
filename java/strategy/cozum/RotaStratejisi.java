// Bu dosya tools/export-java.js ile js/patterns/strategy/data.js içinden üretildi.
package strategy.cozum;

import java.util.List;

/**
 * Strateji: kalan duraklardan sıradakini seçer. Liste salt okunurdur.
 */
public interface RotaStratejisi {

    Durak sec(Konum konum, List<Durak> kalan);
}
