// Bu dosya tools/export-java.js ile js/patterns/abstract-factory/data.js içinden üretildi.
package abstractfactory.cozum;

/**
 * «ConcreteFactory» — Hava ailesi: Uçak + AWB
 */
public class HavaFabrikasi implements LojistikFabrikasi {

    @Override
    public TasimaAraci aracOlustur() {
        return new Ucak();
    }

    @Override
    public TasimaBelgesi belgeOlustur() {
        return new HavaKonsimentosu();
    }
}
