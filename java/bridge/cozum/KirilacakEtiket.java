// Bu dosya tools/export-java.js ile js/patterns/bridge/data.js içinden üretildi.
package bridge.cozum;

/**
 * «RefinedAbstraction» — Kırılacak eşya: çerçeve ve uyarı ekler; hangi yazıcıda basılacağını bilmez.
 */
public class KirilacakEtiket extends Etiket {

    public KirilacakEtiket(Yazici yazici) {
        super(yazici);
    }

    @Override
    public void yazdir(Gonderi g) {
        yazici.basla();
        yazici.cerceve(2, 2, 96, 56);
        yazici.yazi(5, 5, "KIRILACAK");
        adresVeBarkod(g, 12);
        yazici.bitir();
    }
}
