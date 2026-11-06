// Bu dosya tools/export-java.js ile js/patterns/mediator/data.js içinden üretildi.
package mediator.akis.agir;

/**
 * «ConcreteColleague» — Ücret etiketi: yöneticinin hesapladığı ücreti gösterir.
 */
public class UcretEtiketi extends FormOgesi {

    private int tl = 40;

    public UcretEtiketi(FormYoneticisi yonetici) {
        super(yonetici);
    }

    public void goster(int yeni) {
        if (yeni != tl) {
            tl = yeni;
            System.out.println("  ücret: " + tl + " TL");
        }
    }

    public int tl() {
        return tl;
    }
}
