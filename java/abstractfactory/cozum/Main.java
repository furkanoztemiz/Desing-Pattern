// Bu dosya tools/export-java.js ile js/patterns/abstract-factory/data.js içinden üretildi.
package abstractfactory.cozum;

public class Main {

    public static void main(String[] args) {
        new TeslimatServisi(new KaraFabrikasi()).gonder("20 ton kayısı");
        new TeslimatServisi(new DenizFabrikasi()).gonder("300 konteyner fındık");
        new TeslimatServisi(new HavaFabrikasi()).gonder("acil ilaç kolisi");   // genişletme: yeni aile
    }
}
