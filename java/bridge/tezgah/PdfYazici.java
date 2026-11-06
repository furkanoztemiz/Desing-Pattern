// Bu dosya tools/export-java.js ile js/patterns/bridge/data.js içinden üretildi.
package bridge.tezgah;

/**
 * «ConcreteImplementor» — Müşteriye e-postayla giden PDF etiket (konumlar milimetre).
 */
public class PdfYazici implements Yazici {

    @Override
    public void basla() {
        System.out.println("[PDF] yeni sayfa: 100 x 60 mm");
    }

    @Override
    public void yazi(int x, int y, String metin) {
        System.out.println("[PDF] yazı (" + x + ", " + y + ") \"" + metin + "\"");
    }

    @Override
    public void barkod(int x, int y, String veri) {
        System.out.println("[PDF] barkod (" + x + ", " + y + ") Code128: " + veri);
    }

    @Override
    public void cerceve(int x, int y, int en, int boy) {
        System.out.println("[PDF] dikdörtgen (" + x + ", " + y + ") " + en + " x " + boy + " mm");
    }

    @Override
    public void bitir() {
        System.out.println("[PDF] sayfa kaydedildi");
    }
}
