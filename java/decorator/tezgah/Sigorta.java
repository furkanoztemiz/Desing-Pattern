// Bu dosya tools/export-java.js ile js/patterns/decorator/data.js içinden üretildi.
package decorator.tezgah;

/**
 * «ConcreteDecorator» — Sigorta: +35 TL.
 */
public class Sigorta extends EkHizmet {

    public Sigorta(KargoHizmeti icteki) {
        super(icteki);
    }

    @Override
    public String aciklama() {
        return icteki.aciklama() + " + sigorta";
    }

    @Override
    public int ucret() {
        return icteki.ucret() + 35;                 // içtekine sor, üstüne ekle
    }
}
