// Bu dosya tools/export-java.js ile js/patterns/mediator/data.js içinden üretildi.
package mediator.genislet;

/**
 * «ConcreteColleague» — Sigorta kutusu: sigortalı gönderi imzayla teslim edilir, dolaba konmaz.
 */
public class SigortaKutusu extends FormOgesi {

    private boolean isaretli;

    public SigortaKutusu(FormYoneticisi yonetici) {
        super(yonetici);
    }

    public void isaretle(boolean isaretli) {
        this.isaretli = isaretli;
        System.out.println("> sigorta: " + (isaretli ? "açık" : "kapalı"));
        degisti();
    }

    public boolean isaretli() {
        return isaretli;
    }
}
