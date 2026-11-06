// Bu dosya tools/export-java.js ile js/patterns/decorator/data.js içinden üretildi.
package decorator.tezgah;

/**
 * «ConcreteDecorator» — Ekspres teslimat: +40 TL.
 */
public class Ekspres extends EkHizmet {

    public Ekspres(KargoHizmeti icteki) {
        super(icteki);
    }

    @Override
    public String aciklama() {
        return icteki.aciklama() + " + ekspres";
    }

    @Override
    public int ucret() {
        return icteki.ucret() + 40;                 // içtekine sor, üstüne ekle
    }
}
