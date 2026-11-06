// Bu dosya tools/export-java.js ile js/patterns/decorator/data.js içinden üretildi.
package decorator.cozum;

/**
 * «ConcreteDecorator» — Kurumsal müşteri: içteki toplamın %10 eksiği.
 */
public class KurumsalIndirim extends EkHizmet {

    public KurumsalIndirim(KargoHizmeti icteki) {
        super(icteki);
    }

    @Override
    public String aciklama() {
        return icteki.aciklama() + " + %10 kurumsal indirim";
    }

    @Override
    public int ucret() {
        return icteki.ucret() * 9 / 10;             // içteki toplamın %10 eksiği
    }
}
