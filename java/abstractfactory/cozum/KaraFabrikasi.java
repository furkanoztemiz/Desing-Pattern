// Bu dosya tools/export-java.js ile js/patterns/abstract-factory/data.js içinden üretildi.
package abstractfactory.cozum;

/**
 * «ConcreteFactory» — Kara ailesi: Kamyon + CMR
 */
public class KaraFabrikasi implements LojistikFabrikasi {

    @Override
    public TasimaAraci aracOlustur() {
        return new Kamyon();
    }

    @Override
    public TasimaBelgesi belgeOlustur() {
        return new CmrBelgesi();
    }
}
