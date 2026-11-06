// Bu dosya tools/export-java.js ile js/patterns/decorator/data.js içinden üretildi.
package decorator.akis.zarfsms;

public class Main {

    public static void main(String[] args) {
        KargoHizmeti hizmet = new ZarfKargo();              // çekirdek
        hizmet = new SmsBildirim(hizmet);                   // 1. katman
        hizmet = new Ekspres(hizmet);                       // 2. katman

        System.out.println(hizmet.aciklama() + " = " + hizmet.ucret() + " TL");
    }
}
