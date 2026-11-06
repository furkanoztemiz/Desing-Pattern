// Bu dosya tools/export-java.js ile js/patterns/strategy/data.js içinden üretildi.
package strategy.tuzak;

import java.util.ArrayList;
import java.util.List;

/**
 * Planlı rota: planı ilk çağrıda bir kez çıkarır, sonra sırayla verir. Durum tutar!
 */
public class PlanliRota implements RotaStratejisi {

    private final List<Durak> plan = new ArrayList<>();  // durum!
    private final RotaStratejisi enYakin = new EnYakinRota();

    @Override
    public Durak sec(Konum konum, List<Durak> kalan) {
        if (plan.isEmpty()) {
            List<Durak> aday = new ArrayList<>(kalan);
            Konum k = konum;
            while (!aday.isEmpty()) {
                Durak d = enYakin.sec(k, aday);
                plan.add(d);
                aday.remove(d);
                k = d.konum();
            }
        }
        return plan.remove(0);
    }
}
