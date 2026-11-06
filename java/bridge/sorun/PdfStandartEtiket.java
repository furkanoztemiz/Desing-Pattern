// Bu dosya tools/export-java.js ile js/patterns/bridge/data.js içinden üretildi.
package bridge.sorun;

public class PdfStandartEtiket {

    public void yazdir(Gonderi g) {
        System.out.println("[PDF] yeni sayfa: 100 x 60 mm");
        System.out.println("[PDF] yazı (5, 5) \"" + g.alici() + "\"");
        System.out.println("[PDF] barkod (5, 12) Code128: " + g.takipNo());
        System.out.println("[PDF] sayfa kaydedildi");
    }
}
