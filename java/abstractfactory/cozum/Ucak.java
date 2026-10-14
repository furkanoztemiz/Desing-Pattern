// Bu dosya tools/export-java.js ile js/patterns/abstract-factory/data.js içinden üretildi.
package abstractfactory.cozum;

/**
 * «ConcreteProduct» — Hava ailesinin aracı
 */
public class Ucak implements TasimaAraci {

    @Override
    public String gerekenBelge() {
        return "AWB";
    }

    @Override
    public void teslimEt(String yuk) {
        System.out.println("[Uçak] " + yuk + " havayoluyla teslim edildi.");
    }
}
