// Bu dosya tools/export-java.js ile js/patterns/abstract-factory/data.js içinden üretildi.
package abstractfactory.sorun;

/**
 * «ConcreteProduct» — Kara ailesinin aracı
 */
public class Kamyon implements TasimaAraci {

    @Override
    public String gerekenBelge() {
        return "CMR";
    }

    @Override
    public void teslimEt(String yuk) {
        System.out.println("[Kamyon] " + yuk + " karayoluyla teslim edildi.");
    }
}
