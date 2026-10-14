// Bu dosya tools/export-java.js ile js/patterns/adapter/data.js içinden üretildi.
package adapter.bicim.finalnesne;

public class Main {

    public static void main(String[] args) {
        KargoFirmasi adaptor = new GlobalShipAdaptoru(new GlobalShipApi()); // iki nesne: adaptör + uyarlanan
        new GonderiServisi(adaptor).gonder("İstanbul", "Berlin", 12);
    }
}
