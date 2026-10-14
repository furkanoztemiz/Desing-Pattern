// Bu dosya tools/export-java.js ile js/patterns/factory-method/data.js içinden üretildi.
package factorymethod.cozum;

/**
 * «ConcreteCreator» — Somut Yaratıcı
 */
public class KaraLojistigi extends Lojistik {

    @Override
    protected TasimaAraci aracOlustur() {
        return new Kamyon();
    }
}
