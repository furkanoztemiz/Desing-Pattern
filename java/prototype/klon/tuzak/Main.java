// Bu dosya tools/export-java.js ile js/patterns/prototype/data.js içinden üretildi.
package prototype.klon.tuzak;

import java.util.List;

public class Main {

    public static void main(String[] args) {
        Koli sablon = new Koli("Ayşe Kırtasiye", List.of("A4 kağıt", "toner"));
        Koli kopya = sablon.clone();
        kopya.ekle("zımba");

        System.out.println("şablon: " + sablon);
        System.out.println("kopya : " + kopya);
    }
}
