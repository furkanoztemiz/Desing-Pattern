// Bu dosya tools/export-java.js ile js/patterns/decorator/data.js içinden üretildi.
package decorator.cozum;

/**
 * «ConcreteDecorator» — Soğuk zincir (2-8 °C): +60 TL.
 */
public class SogukZincir extends EkHizmet {

    public SogukZincir(KargoHizmeti icteki) {
        super(icteki);
    }

    @Override
    public String aciklama() {
        return icteki.aciklama() + " + soğuk zincir";
    }

    @Override
    public int ucret() {
        return icteki.ucret() + 60;                 // içtekine sor, üstüne ekle
    }
}
