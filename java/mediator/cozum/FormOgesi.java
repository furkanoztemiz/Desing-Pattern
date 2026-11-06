// Bu dosya tools/export-java.js ile js/patterns/mediator/data.js içinden üretildi.
package mediator.cozum;

/**
 * «Colleague» — Formun her öğesi: değişince yöneticiye haber verir; ötekilerden habersizdir.
 */
public abstract class FormOgesi {

    private final FormYoneticisi yonetici;

    protected FormOgesi(FormYoneticisi yonetici) {
        this.yonetici = yonetici;
    }

    protected void degisti() {
        yonetici.degisti(this);
    }
}
