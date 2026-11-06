// Bu dosya tools/export-java.js ile js/patterns/decorator/data.js içinden üretildi.
package decorator.akis.ekspressigorta;

public class Main {

    public static void main(String[] args) {
        KargoHizmeti hizmet = new StandartKargo();          // çekirdek
        hizmet = new Ekspres(hizmet);                       // 1. katman
        hizmet = new Sigorta(hizmet);                       // 2. katman

        System.out.println(hizmet.aciklama() + " = " + hizmet.ucret() + " TL");
    }
}
