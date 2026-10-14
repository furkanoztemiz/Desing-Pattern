// Bu dosya tools/export-java.js ile js/patterns/prototype/data.js içinden üretildi.
package prototype.katalog;

import java.util.List;

public class Main {

    public static void main(String[] args) {
        SablonKatalogu katalog = new SablonKatalogu();
        katalog.ekle("kirtasiye", new KoliGonderisi("Ayşe Kırtasiye", List.of("A4 kağıt", "toner"), 12));
        katalog.ekle("noter", new ZarfGonderisi("Noter Ofisi", List.of("sözleşme"), true));
        katalog.ekle("fabrika", new PaletGonderisi("Demir Fabrikası", List.of("cıvata", "somun"), 2));

        // çalışma anında YENİ bir şablon: yeni sınıf yok, yalnızca yeni bir nesne
        katalog.ekle("eczane", new KoliGonderisi("Şifa Eczanesi", List.of("aşı", "serum"), 3));

        Gonderi siparis = katalog.olustur("kirtasiye");
        siparis.ekle("zımba");
        System.out.println(siparis);
        System.out.println(katalog.olustur("kirtasiye"));   // şablon temiz mi?
        System.out.println(katalog.olustur("eczane"));
        System.out.println("Adres sorgusu: " + AdresServisi.sorguSayisi);
    }
}
