// Bu dosya tools/export-java.js ile js/patterns/bridge/data.js içinden üretildi.
package bridge.sorun;

public class ZebraStandartEtiket {

    public void yazdir(Gonderi g) {
        System.out.println("[Zebra] ^XA^CI28");     // ^CI28: Türkçe karakterler
        System.out.println("[Zebra] ^FO40,40^A0N,30^FD" + g.alici() + "^FS");
        System.out.println("[Zebra] ^FO40,96^BCN,80^FD" + g.takipNo() + "^FS");
        System.out.println("[Zebra] ^XZ");
    }
}
