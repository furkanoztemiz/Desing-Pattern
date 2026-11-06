// Bu dosya tools/export-java.js ile js/patterns/mediator/data.js içinden üretildi.
package mediator.tezgah.mediator;

/**
 * «ConcreteColleague» — Soğuk zincir kutusu: işaretlenince yöneticiye bildirir.
 */
public class SogukZincirKutusu extends FormOgesi {

    private boolean isaretli;

    public SogukZincirKutusu(FormYoneticisi yonetici) {
        super(yonetici);
    }

    public void isaretle(boolean isaretli) {
        this.isaretli = isaretli;
        System.out.println("> soğuk zincir: " + (isaretli ? "açık" : "kapalı"));
        degisti();
    }

    public boolean isaretli() {
        return isaretli;
    }
}
