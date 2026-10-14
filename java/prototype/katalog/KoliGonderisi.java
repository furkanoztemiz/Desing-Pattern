// Bu dosya tools/export-java.js ile js/patterns/prototype/data.js içinden üretildi.
package prototype.katalog;

import java.util.List;

/**
 * «ConcretePrototype» — Koli gönderisi (ağırlığı olan paket).
 */
public class KoliGonderisi extends Gonderi {

    private final int agirlik;

    public KoliGonderisi(String alici, List<String> icerik, int agirlik) {
        super(alici, icerik);
        this.agirlik = agirlik;
    }

    private KoliGonderisi(KoliGonderisi kaynak) {       // kopya kurucu
        super(kaynak);
        this.agirlik = kaynak.agirlik;                  // private alana kendi sınıfı erişir
    }

    @Override
    public KoliGonderisi kopyala() {
        return new KoliGonderisi(this);
    }

    @Override
    public String toString() {
        return "Koli[" + alici + ": " + String.join(", ", icerik) + " | " + agirlik + " kg]";
    }
}
