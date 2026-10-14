// Bu dosya tools/export-java.js ile js/patterns/prototype/data.js içinden üretildi.
package prototype.sorun;

import java.util.List;

public class PaletGonderisi extends Gonderi {

    private final int paletSayisi;

    public PaletGonderisi(String alici, List<String> icerik, int paletSayisi) {
        super(alici, icerik);
        this.paletSayisi = paletSayisi;
    }

    public int getPaletSayisi() { return paletSayisi; }

    @Override
    public String toString() {
        return "Palet[" + alici + ": " + String.join(", ", icerik) + " | " + paletSayisi + " palet]";
    }
}
