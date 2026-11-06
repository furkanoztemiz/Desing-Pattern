// Bu dosya tools/export-java.js ile js/patterns/proxy/data.js içinden üretildi.
package proxy.akis.ayse;

import java.util.List;

public class Main {

    public static void main(String[] args) {
        Musteri ayse = new Musteri("Ayşe", List.of("KRG-1002"));
        TakipServisi servis = new TakipVekili(ayse);
        MobilUygulama mobil = new MobilUygulama(ayse, servis);

        mobil.goster("KRG-1001");                   // Ali'nin gönderisi
        mobil.goster("KRG-1002");
        System.out.println(GlobalShipTakip.ozet());
    }
}
