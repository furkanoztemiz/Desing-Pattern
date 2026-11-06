// Bu dosya tools/export-java.js ile js/patterns/proxy/data.js içinden üretildi.
package proxy.cozum;

import java.util.List;

public class Main {

    public static void main(String[] args) {
        Musteri ali = new Musteri("Ali", List.of("KRG-1001"));
        Musteri ayse = new Musteri("Ayşe", List.of("KRG-1002"));
        TakipServisi aliServisi = new TakipVekili(ali);
        TakipServisi ayseServisi = new TakipVekili(ayse);
        MusteriPaneli panel = new MusteriPaneli(ali, aliServisi);
        MobilUygulama mobil = new MobilUygulama(ayse, ayseServisi);

        panel.goster("KRG-1001");
        panel.goster("KRG-1001");                   // sayfa yenilendi
        panel.goster("KRG-1003");                   // Zeynep'in gönderisi
        mobil.goster("KRG-1002");
        mobil.goster("KRG-1001");                   // Ali'nin gönderisi!
        System.out.println(GlobalShipTakip.ozet());
    }
}
