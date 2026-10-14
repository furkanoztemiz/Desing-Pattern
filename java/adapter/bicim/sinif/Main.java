// Bu dosya tools/export-java.js ile js/patterns/adapter/data.js içinden üretildi.
package adapter.bicim.sinif;

public class Main {

    public static void main(String[] args) {
        KargoFirmasi adaptor = new GlobalShipSinifAdaptoru();               // tek nesne: hem adaptör hem uyarlanan
        new GonderiServisi(adaptor).gonder("İstanbul", "Berlin", 12);
    }
}
