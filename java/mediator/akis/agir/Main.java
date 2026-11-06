// Bu dosya tools/export-java.js ile js/patterns/mediator/data.js içinden üretildi.
package mediator.akis.agir;

public class Main {

    public static void main(String[] args) {
        GonderiFormu form = new GonderiFormu();
        form.sehir().sec("Malatya");
        form.agirlik().yaz(9);
        form.teslimat().sec("Hızlı");
        form.agirlik().yaz(25);
        System.out.println(form.ozet());
    }
}
