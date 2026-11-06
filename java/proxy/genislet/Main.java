// Bu dosya tools/export-java.js ile js/patterns/proxy/data.js içinden üretildi.
package proxy.genislet;

import java.util.List;

public class Main {

    public static void main(String[] args) {
        Musteri zeynep = new Musteri("Zeynep", List.of("KRG-1003"));
        TakipServisi servis = new TakipVekili(zeynep);
        SmsBildirim sms = new SmsBildirim(zeynep, servis);

        sms.gonder("KRG-1003");
        sms.gonder("KRG-1003");                     // iş tekrar çalıştı
        sms.gonder("KRG-1001");                     // yanlış alıcı!
        System.out.println(GlobalShipTakip.ozet());
    }
}
