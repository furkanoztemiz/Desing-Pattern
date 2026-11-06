// Bu dosya tools/export-java.js ile js/patterns/bridge/data.js içinden üretildi.
package bridge.sorun;

public class TermalKirilacakEtiket {

    public void yazdir(Gonderi g) {
        System.out.println("[Termal] ESC @");
        System.out.println("[Termal] ------------------------");
        System.out.println("[Termal] KIRILACAK");
        System.out.println("[Termal] " + g.alici());
        System.out.println("[Termal] GS k " + g.takipNo());
        System.out.println("[Termal] GS V (kes)");
    }
}
