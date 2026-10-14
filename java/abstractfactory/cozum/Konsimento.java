// Bu dosya tools/export-java.js ile js/patterns/abstract-factory/data.js içinden üretildi.
package abstractfactory.cozum;

/**
 * «ConcreteProduct» — Deniz ailesinin belgesi
 */
public class Konsimento implements TasimaBelgesi {

    @Override
    public String ad() {
        return "Konşimento";
    }

    @Override
    public void hazirla(String yuk) {
        System.out.println("[Konşimento] " + yuk + " için deniz yolu taşıma senedi düzenlendi.");
    }
}
