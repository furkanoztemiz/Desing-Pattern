// Bu dosya tools/export-java.js ile js/patterns/bridge/data.js içinden üretildi.
package bridge.genislet;

/**
 * «ConcreteImplementor» — Müşteri panelinde HTML önizleme.
 */
public class HtmlYazici implements Yazici {

    @Override
    public void basla() {
        System.out.println("[HTML] <div class=\"etiket\">");
    }

    @Override
    public void yazi(int x, int y, String metin) {
        System.out.println("[HTML] <p style=\"left:" + x + "mm; top:" + y + "mm\">" + metin + "</p>");
    }

    @Override
    public void barkod(int x, int y, String veri) {
        System.out.println("[HTML] <svg class=\"barkod\">" + veri + "</svg>");
    }

    @Override
    public void cerceve(int x, int y, int en, int boy) {
        System.out.println("[HTML] <div class=\"cerceve\"></div>");
    }

    @Override
    public void bitir() {
        System.out.println("[HTML] </div>");
    }
}
