// Bu dosya tools/export-java.js ile js/patterns/bridge/data.js içinden üretildi.
package bridge.genislet;

/**
 * «RefinedAbstraction» — İade etiketi: gönderiyi Malatya deposuna geri yönlendirir.
 */
public class IadeEtiketi extends Etiket {

    public IadeEtiketi(Yazici yazici) {
        super(yazici);
    }

    @Override
    public void yazdir(Gonderi g) {
        yazici.basla();
        yazici.yazi(5, 5, "İADE: Malatya depo");
        adresVeBarkod(g, 12);
        yazici.bitir();
    }
}
