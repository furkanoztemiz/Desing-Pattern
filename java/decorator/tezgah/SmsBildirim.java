// Bu dosya tools/export-java.js ile js/patterns/decorator/data.js içinden üretildi.
package decorator.tezgah;

/**
 * «ConcreteDecorator» — SMS bildirimi: +5 TL.
 */
public class SmsBildirim extends EkHizmet {

    public SmsBildirim(KargoHizmeti icteki) {
        super(icteki);
    }

    @Override
    public String aciklama() {
        return icteki.aciklama() + " + SMS";
    }

    @Override
    public int ucret() {
        return icteki.ucret() + 5;                  // içtekine sor, üstüne ekle
    }
}
