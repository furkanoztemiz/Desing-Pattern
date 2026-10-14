// Bu dosya tools/export-java.js ile js/patterns/prototype/data.js içinden üretildi.
package prototype.kopya.sig;

import java.util.List;

public class Main {

    public static void main(String[] args) {
        Gonderi sablon = new KoliGonderisi("Ayşe Kırtasiye", List.of("A4 kağıt", "toner"), 12);

        Gonderi buHafta = sablon.kopyala();
        buHafta.ekle("zımba");                      // yalnızca bu haftaya ek

        Gonderi gelecekHafta = sablon.kopyala();

        System.out.println("şablon       : " + sablon);
        System.out.println("bu hafta     : " + buHafta);
        System.out.println("gelecek hafta: " + gelecekHafta);
    }
}
