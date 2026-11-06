// Bu dosya tools/export-java.js ile js/patterns/proxy/data.js içinden üretildi.
package proxy.akis.ali;

import java.util.List;

public class Main {

    public static void main(String[] args) {
        Musteri ali = new Musteri("Ali", List.of("KRG-1001"));
        TakipServisi servis = new TakipVekili(ali);
        MusteriPaneli panel = new MusteriPaneli(ali, servis);

        panel.goster("KRG-1001");
        panel.goster("KRG-1001");                   // sayfa yenilendi
        System.out.println(GlobalShipTakip.ozet());
    }
}
