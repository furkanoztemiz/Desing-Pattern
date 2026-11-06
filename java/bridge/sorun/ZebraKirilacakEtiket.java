// Bu dosya tools/export-java.js ile js/patterns/bridge/data.js içinden üretildi.
package bridge.sorun;

public class ZebraKirilacakEtiket {

    public void yazdir(Gonderi g) {
        System.out.println("[Zebra] ^XA");
        System.out.println("[Zebra] ^FO16,16^GB768,448,4^FS");
        System.out.println("[Zebra] ^FO40,40^A0N,30^FDKIRILACAK^FS");
        System.out.println("[Zebra] ^FO40,96^A0N,30^FD" + g.alici() + "^FS");
        System.out.println("[Zebra] ^FO40,152^BCN,80^FD" + g.takipNo() + "^FS");
        System.out.println("[Zebra] ^XZ");
    }
}
