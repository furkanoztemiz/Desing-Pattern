// Bu dosya tools/export-java.js ile js/patterns/prototype/data.js içinden üretildi.
package prototype.sorun;

import java.util.List;

public class ZarfGonderisi extends Gonderi {

    private final boolean iadeli;

    public ZarfGonderisi(String alici, List<String> icerik, boolean iadeli) {
        super(alici, icerik);
        this.iadeli = iadeli;
    }

    public boolean isIadeli() { return iadeli; }

    @Override
    public String toString() {
        return "Zarf[" + alici + ": " + String.join(", ", icerik) + (iadeli ? " | iadeli" : "") + "]";
    }
}
