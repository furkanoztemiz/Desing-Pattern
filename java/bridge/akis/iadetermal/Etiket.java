// Bu dosya tools/export-java.js ile js/patterns/bridge/data.js içinden üretildi.
package bridge.akis.iadetermal;

/**
 * «Abstraction» — Etiket NE basılacağını bilir; NASIL basılacağını köprünün öbür ucundaki yazıcıya bırakır.
 */
public class Etiket {

    protected Yazici yazici;                // köprü: işi yapacak cihaz

    public Etiket(Yazici yazici) {
        this.yazici = yazici;
    }

    /** Çalışma anında başka bir yazıcıya geçmek için (ör. Zebra'da kâğıt bitti). */
    public void yaziciDegistir(Yazici yeni) {
        this.yazici = yeni;
    }

    public void yazdir(Gonderi g) {
        yazici.basla();
        adresVeBarkod(g, 5);
        yazici.bitir();
    }

    /** Üst düzey işlem: yazıcının ilkel işlemlerinden kurulur. */
    protected void adresVeBarkod(Gonderi g, int y) {
        yazici.yazi(5, y, g.alici());
        yazici.barkod(5, y + 7, g.takipNo());
    }
}
