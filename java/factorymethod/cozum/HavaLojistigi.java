// Bu dosya tools/export-java.js ile js/patterns/factory-method/data.js içinden üretildi.
package factorymethod.cozum;

/**
 * «ConcreteCreator» — Somut Yaratıcı
 */
public class HavaLojistigi extends Lojistik {

    @Override
    protected TasimaAraci aracOlustur() {
        return new Ucak();
    }
}
