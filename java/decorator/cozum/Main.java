// Bu dosya tools/export-java.js ile js/patterns/decorator/data.js içinden üretildi.
package decorator.cozum;

public class Main {

    public static void main(String[] args) {
        KargoHizmeti[] fiyatListesi = {
            new StandartKargo(),
            new Ekspres(new StandartKargo()),
            new Sigorta(new StandartKargo()),
            new Sigorta(new Ekspres(new StandartKargo())),
            new SogukZincir(new StandartKargo()),
            new SogukZincir(new Ekspres(new StandartKargo())),
            new Sigorta(new SogukZincir(new StandartKargo())),
            new Sigorta(new SogukZincir(new Ekspres(new StandartKargo()))),
            new SmsBildirim(new Sigorta(new ZarfKargo())),      // yeni: hiç sınıf yazmadan
        };
        for (KargoHizmeti h : fiyatListesi) {
            System.out.println(h.aciklama() + " = " + h.ucret() + " TL");
        }
    }
}
