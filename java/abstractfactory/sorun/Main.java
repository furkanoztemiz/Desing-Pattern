// Bu dosya tools/export-java.js ile js/patterns/abstract-factory/data.js içinden üretildi.
package abstractfactory.sorun;

public class Main {

    public static void main(String[] args) {
        TeslimatServisi servis = new TeslimatServisi();
        servis.gonder("20 ton kayısı", "kara");
        servis.gonder("300 konteyner fındık", "deniz");
        servis.gonder("acil ilaç kolisi", "hava");
    }
}
