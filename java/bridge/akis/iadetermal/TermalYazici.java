// Bu dosya tools/export-java.js ile js/patterns/bridge/data.js içinden üretildi.
package bridge.akis.iadetermal;

/**
 * «ConcreteImplementor» — Kuryenin el terminali: ESC/POS fiş yazıcısı; konum bilmez, satır satır basar.
 */
public class TermalYazici implements Yazici {

    @Override
    public void basla() {
        System.out.println("[Termal] ESC @");
    }

    @Override
    public void yazi(int x, int y, String metin) {
        System.out.println("[Termal] " + metin);    // konum kullanılmaz
    }

    @Override
    public void barkod(int x, int y, String veri) {
        System.out.println("[Termal] GS k " + veri);
    }

    @Override
    public void cerceve(int x, int y, int en, int boy) {
        System.out.println("[Termal] ------------------------");    // çerçeve yerine çizgi
    }

    @Override
    public void bitir() {
        System.out.println("[Termal] GS V (kes)");
    }
}
