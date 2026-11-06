// Bu dosya tools/export-java.js ile js/patterns/decorator/data.js içinden üretildi.
package decorator.cozum;

/**
 * «ConcreteComponent» — Çekirdek hizmet: standart koli taşıma.
 */
public class StandartKargo implements KargoHizmeti {

    @Override
    public String aciklama() {
        return "Standart kargo";
    }

    @Override
    public int ucret() {
        return 50;
    }
}
