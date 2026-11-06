// Bu dosya tools/export-java.js ile js/patterns/proxy/data.js içinden üretildi.
package proxy.tezgah.vekilsiz;

import java.util.List;

public class Main {

    public static void main(String[] args) {
        Musteri ayse = new Musteri("Ayşe", List.of("KRG-1002"));
        TakipServisi servis = new GlobalShipTakip();
        MobilUygulama mobil = new MobilUygulama(ayse, servis);

        mobil.goster("KRG-1001");                   // Ali'nin gönderisi
        mobil.goster("KRG-1003");                   // Zeynep'in gönderisi
        mobil.goster("KRG-1002");
        mobil.goster("KRG-1002");                   // uygulama yenilendi
        System.out.println(GlobalShipTakip.ozet());
    }
}
