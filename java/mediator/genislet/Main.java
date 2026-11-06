// Bu dosya tools/export-java.js ile js/patterns/mediator/data.js içinden üretildi.
package mediator.genislet;

public class Main {

    public static void main(String[] args) {
        GonderiFormu form = new GonderiFormu();
        form.sehir().sec("Malatya");
        form.agirlik().yaz(2);
        form.teslimat().sec("Dolap");
        form.sigorta().isaretle(true);
        System.out.println(form.ozet());
    }
}
