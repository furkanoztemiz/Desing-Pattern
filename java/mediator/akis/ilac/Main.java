// Bu dosya tools/export-java.js ile js/patterns/mediator/data.js içinden üretildi.
package mediator.akis.ilac;

public class Main {

    public static void main(String[] args) {
        GonderiFormu form = new GonderiFormu();
        form.soguk().isaretle(true);
        form.sehir().sec("Malatya");
        form.agirlik().yaz(2);
        form.teslimat().sec("Dolap");
        System.out.println(form.ozet());
    }
}
