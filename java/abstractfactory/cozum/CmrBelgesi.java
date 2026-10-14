// Bu dosya tools/export-java.js ile js/patterns/abstract-factory/data.js içinden üretildi.
package abstractfactory.cozum;

/**
 * «ConcreteProduct» — Kara ailesinin belgesi
 */
public class CmrBelgesi implements TasimaBelgesi {

    @Override
    public String ad() {
        return "CMR";
    }

    @Override
    public void hazirla(String yuk) {
        System.out.println("[CMR] " + yuk + " için karayolu taşıma senedi düzenlendi.");
    }
}
