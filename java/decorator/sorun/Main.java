// Bu dosya tools/export-java.js ile js/patterns/decorator/data.js içinden üretildi.
package decorator.sorun;

public class Main {

    public static void main(String[] args) {
        StandartKargo[] fiyatListesi = {
            new StandartKargo(),
            new EkspresKargo(),
            new SigortaliKargo(),
            new SigortaliEkspresKargo(),
            new SogukZincirliKargo(),
            new SogukZincirliEkspresKargo(),
            new SigortaliSogukZincirliKargo(),
            new SigortaliSogukZincirliEkspresKargo(),
        };
        for (StandartKargo k : fiyatListesi) {
            System.out.println(k.aciklama() + " = " + k.ucret() + " TL");
        }
    }
}
