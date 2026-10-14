// Bu dosya tools/export-java.js ile js/patterns/abstract-factory/data.js içinden üretildi.
package abstractfactory.sorun;

/**
 * «ConcreteProduct» — Deniz ailesinin aracı
 */
public class Gemi implements TasimaAraci {

    @Override
    public String gerekenBelge() {
        return "Konşimento";
    }

    @Override
    public void teslimEt(String yuk) {
        System.out.println("[Gemi] " + yuk + " denizyoluyla teslim edildi.");
    }
}
