// Bu dosya tools/export-java.js ile js/patterns/mediator/data.js içinden üretildi.
package mediator.akis.agir;

/**
 * «ConcreteColleague» — Ağırlık alanı: yazılan ağırlığı yöneticiye bildirir.
 */
public class AgirlikAlani extends FormOgesi {

    private int kg;

    public AgirlikAlani(FormYoneticisi yonetici) {
        super(yonetici);
    }

    public void yaz(int kg) {
        this.kg = kg;
        System.out.println("> ağırlık: " + kg + " kg");
        degisti();
    }

    public int kg() {
        return kg;
    }
}
