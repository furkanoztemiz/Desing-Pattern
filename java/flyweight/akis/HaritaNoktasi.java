// Bu dosya tools/export-java.js ile js/patterns/flyweight/data.js içinden üretildi.
package flyweight.akis;

/**
 * Haritadaki bir nokta: yalnızca DIŞSAL durum (etiket, konum) ve paylaşılan işarete başvuru.
 */
public class HaritaNoktasi {

    private final Isaret isaret;                // paylaşılan: içsel durum orada
    private final String etiket;
    private final int x;
    private final int y;

    public HaritaNoktasi(String etiket, int x, int y, Isaret isaret) {
        this.isaret = isaret;
        this.etiket = etiket;
        this.x = x;
        this.y = y;
    }

    public void ciz() {
        isaret.ciz(x, y, etiket);               // dışsal durum çağrıyla gider
    }
}
