// Bu dosya tools/export-java.js ile js/patterns/prototype/data.js içinden üretildi.
package prototype.cozum;

import java.util.List;

public class Main {

    public static void main(String[] args) {
        Gonderi kirtasiye = new KoliGonderisi("Ayşe Kırtasiye", List.of("A4 kağıt", "toner"), 12);
        Gonderi noter = new ZarfGonderisi("Noter Ofisi", List.of("sözleşme"), true);
        Gonderi fabrika = new PaletGonderisi("Demir Fabrikası", List.of("cıvata", "somun"), 2);

        System.out.println("--- Geçen haftakini tekrarla ---");
        System.out.println(SiparisEkrani.tekrarla(kirtasiye));
        System.out.println(SiparisEkrani.tekrarla(noter));
        System.out.println(SiparisEkrani.tekrarla(fabrika));    // yeni tür!
        System.out.println("Adres sorgusu: " + AdresServisi.sorguSayisi);
    }
}
