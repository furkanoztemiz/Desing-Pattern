// Bu dosya tools/export-java.js ile js/patterns/mediator/data.js içinden üretildi.
package mediator.tezgah.mediator;

/**
 * «Mediator» — Form öğelerinin tek muhatabı: öğeler birbirini değil, yöneticiyi tanır.
 */
public interface FormYoneticisi {

    void degisti(FormOgesi kaynak);
}
