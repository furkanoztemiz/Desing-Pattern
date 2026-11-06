// Bu dosya tools/export-java.js ile js/patterns/bridge/data.js içinden üretildi.
package bridge.sorun;

public class TermalIadeEtiketi {

    public void yazdir(Gonderi g) {
        System.out.println("[Termal] ESC @");
        System.out.println("[Termal] İADE: Malatya depo");
        System.out.println("[Termal] " + g.alici());
        System.out.println("[Termal] GS k " + g.takipNo());
        System.out.println("[Termal] GS V (kes)");
    }
}
