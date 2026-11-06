// Bu dosya tools/export-java.js ile js/patterns/decorator/data.js içinden üretildi.
package decorator.cozum;

/**
 * «ConcreteComponent» — Çekirdek hizmet: evrak zarfı.
 */
public class ZarfKargo implements KargoHizmeti {

    @Override
    public String aciklama() {
        return "Zarf";
    }

    @Override
    public int ucret() {
        return 20;
    }
}
