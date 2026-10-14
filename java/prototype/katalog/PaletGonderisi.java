// Bu dosya tools/export-java.js ile js/patterns/prototype/data.js içinden üretildi.
package prototype.katalog;

import java.util.List;

/**
 * «ConcretePrototype» — Palet gönderisi (toplu yük).
 */
public class PaletGonderisi extends Gonderi {

    private final int paletSayisi;

    public PaletGonderisi(String alici, List<String> icerik, int paletSayisi) {
        super(alici, icerik);
        this.paletSayisi = paletSayisi;
    }

    private PaletGonderisi(PaletGonderisi kaynak) {     // kopya kurucu
        super(kaynak);
        this.paletSayisi = kaynak.paletSayisi;          // private alana kendi sınıfı erişir
    }

    @Override
    public PaletGonderisi kopyala() {
        return new PaletGonderisi(this);
    }

    @Override
    public String toString() {
        return "Palet[" + alici + ": " + String.join(", ", icerik) + " | " + paletSayisi + " palet]";
    }
}
