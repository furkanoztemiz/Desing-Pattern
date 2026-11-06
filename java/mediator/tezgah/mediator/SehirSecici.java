// Bu dosya tools/export-java.js ile js/patterns/mediator/data.js içinden üretildi.
package mediator.tezgah.mediator;

/**
 * «ConcreteColleague» — Şehir seçici: seçimini yöneticiye bildirir; dolaptan habersizdir.
 */
public class SehirSecici extends FormOgesi {

    private String secili;

    public SehirSecici(FormYoneticisi yonetici) {
        super(yonetici);
    }

    public void sec(String sehir) {
        secili = sehir;
        System.out.println("> şehir: " + sehir);
        degisti();
    }

    public String secili() {
        return secili;
    }
}
