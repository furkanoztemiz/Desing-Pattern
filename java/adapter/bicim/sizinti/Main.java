// Bu dosya tools/export-java.js ile js/patterns/adapter/data.js içinden üretildi.
package adapter.bicim.sizinti;

public class Main {

    public static void main(String[] args) {
        GlobalShipSinifAdaptoru adaptor = new GlobalShipSinifAdaptoru();    // tek nesne: hem adaptör hem uyarlanan
        new GonderiServisi(adaptor).gonder("İstanbul", "Berlin", 12);

        // aceleci bir geliştirici çeviriyi atlayıp yabancı metodu DOĞRUDAN çağırıyor:
        adaptor.createShipment(new ShipmentRequest("Berlin", "İstanbul", 12));
    }
}
