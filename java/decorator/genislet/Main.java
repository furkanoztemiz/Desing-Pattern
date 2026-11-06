// Bu dosya tools/export-java.js ile js/patterns/decorator/data.js içinden üretildi.
package decorator.genislet;

public class Main {

    public static void main(String[] args) {
        KargoHizmeti hediye = new HediyePaketi(new Ekspres(new StandartKargo()));// YENİ katman
        KargoHizmeti dogumGunu = new SmsBildirim(new HediyePaketi(new ZarfKargo()));// her şeyle birleşir

        System.out.println(hediye.aciklama() + " = " + hediye.ucret() + " TL");
        System.out.println(dogumGunu.aciklama() + " = " + dogumGunu.ucret() + " TL");
    }
}
