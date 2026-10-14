// Bu dosya tools/export-java.js ile js/patterns/prototype/data.js içinden üretildi.
package prototype.sorun;

import java.util.List;

public class KoliGonderisi extends Gonderi {

    private final int agirlik;

    public KoliGonderisi(String alici, List<String> icerik, int agirlik) {
        super(alici, icerik);
        this.agirlik = agirlik;
    }

    public int getAgirlik() { return agirlik; }

    @Override
    public String toString() {
        return "Koli[" + alici + ": " + String.join(", ", icerik) + " | " + agirlik + " kg]";
    }
}
