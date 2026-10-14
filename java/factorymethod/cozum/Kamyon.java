// Bu dosya tools/export-java.js ile js/patterns/factory-method/data.js içinden üretildi.
package factorymethod.cozum;

/**
 * «ConcreteProduct» — Somut Ürün
 */
public class Kamyon implements TasimaAraci {

    @Override
    public void teslimEt(String yuk) {
        System.out.println("[Kamyon] " + yuk + " karayoluyla teslim edildi.");
    }
}
