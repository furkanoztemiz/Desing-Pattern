// Bu dosya tools/export-java.js ile js/patterns/decorator/data.js içinden üretildi.
package decorator.genislet;

/**
 * «ConcreteDecorator» — Hediye paketi: +15 TL.
 */
public class HediyePaketi extends EkHizmet {

    public HediyePaketi(KargoHizmeti icteki) {
        super(icteki);
    }

    @Override
    public String aciklama() {
        return icteki.aciklama() + " + hediye paketi";
    }

    @Override
    public int ucret() {
        return icteki.ucret() + 15;                 // içtekine sor, üstüne ekle
    }
}
