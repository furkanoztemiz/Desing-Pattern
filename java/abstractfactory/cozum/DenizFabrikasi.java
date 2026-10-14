// Bu dosya tools/export-java.js ile js/patterns/abstract-factory/data.js içinden üretildi.
package abstractfactory.cozum;

/**
 * «ConcreteFactory» — Deniz ailesi: Gemi + Konşimento
 */
public class DenizFabrikasi implements LojistikFabrikasi {

    @Override
    public TasimaAraci aracOlustur() {
        return new Gemi();
    }

    @Override
    public TasimaBelgesi belgeOlustur() {
        return new Konsimento();
    }
}
