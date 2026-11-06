// Bu dosya tools/export-java.js ile js/patterns/bridge/data.js içinden üretildi.
package bridge.cozum;

/**
 * «ConcreteImplementor» — Depodaki Zebra termal etiket yazıcısı: ZPL komutları (1 mm = 8 nokta).
 */
public class ZebraYazici implements Yazici {

    @Override
    public void basla() {
        System.out.println("[Zebra] ^XA^CI28");     // ^CI28: UTF-8, Türkçe karakterler
    }

    @Override
    public void yazi(int x, int y, String metin) {
        System.out.println("[Zebra] ^FO" + x * 8 + "," + y * 8 + "^A0N,30^FD" + metin + "^FS");
    }

    @Override
    public void barkod(int x, int y, String veri) {
        System.out.println("[Zebra] ^FO" + x * 8 + "," + y * 8 + "^BCN,80^FD" + veri + "^FS");
    }

    @Override
    public void cerceve(int x, int y, int en, int boy) {
        System.out.println("[Zebra] ^FO" + x * 8 + "," + y * 8 + "^GB" + en * 8 + "," + boy * 8 + ",4^FS");
    }

    @Override
    public void bitir() {
        System.out.println("[Zebra] ^XZ");
    }
}
