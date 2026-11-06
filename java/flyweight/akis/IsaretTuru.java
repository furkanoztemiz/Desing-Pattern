// Bu dosya tools/export-java.js ile js/patterns/flyweight/data.js içinden üretildi.
package flyweight.akis;

/**
 * «ConcreteFlyweight» — Bir gönderi türünün işareti: yalnızca İÇSEL durum. Paylaşılır, değişmez.
 */
public final class IsaretTuru implements Isaret {

    private final String ad;
    private final Ikon ikon;                    // 16 KB: paylaşılan ağır kısım

    IsaretTuru(String ad) {                     // yalnızca fabrika yaratır
        this.ad = ad;
        this.ikon = new Ikon(ad + ".png");
    }

    @Override
    public void ciz(int x, int y, String etiket) {
        System.out.println("[" + ad + "] " + etiket + " → (" + x + ", " + y + ") · " + ikon);
    }

    @Override
    public String toString() {
        return ad + " (" + ikon + ")";
    }
}
