// Bu dosya tools/export-java.js ile js/patterns/abstract-factory/data.js içinden üretildi.
package abstractfactory.cozum;

/**
 * «ConcreteProduct» — Hava ailesinin belgesi
 */
public class HavaKonsimentosu implements TasimaBelgesi {

    @Override
    public String ad() {
        return "AWB";
    }

    @Override
    public void hazirla(String yuk) {
        System.out.println("[AWB] " + yuk + " için hava yolu taşıma senedi düzenlendi.");
    }
}
