// Bu dosya tools/export-java.js ile js/patterns/prototype/data.js içinden üretildi.
package prototype.katalog;

import java.util.List;

/**
 * «ConcretePrototype» — Zarf gönderisi (evrak; iadeli olabilir).
 */
public class ZarfGonderisi extends Gonderi {

    private final boolean iadeli;

    public ZarfGonderisi(String alici, List<String> icerik, boolean iadeli) {
        super(alici, icerik);
        this.iadeli = iadeli;
    }

    private ZarfGonderisi(ZarfGonderisi kaynak) {       // kopya kurucu
        super(kaynak);
        this.iadeli = kaynak.iadeli;                    // private alana kendi sınıfı erişir
    }

    @Override
    public ZarfGonderisi kopyala() {
        return new ZarfGonderisi(this);
    }

    @Override
    public String toString() {
        return "Zarf[" + alici + ": " + String.join(", ", icerik) + (iadeli ? " | iadeli" : "") + "]";
    }
}
