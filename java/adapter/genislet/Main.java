// Bu dosya tools/export-java.js ile js/patterns/adapter/data.js içinden üretildi.
package adapter.genislet;

public class Main {

    public static void main(String[] args) {
        KargoFirmasi yurtici = new HizliKargo();
        KargoFirmasi yurtdisi = new GlobalShipAdaptoru(new GlobalShipApi());
        KargoFirmasi avrupa = new EuroCargoAdaptoru(new EuroCargoClient());     // YENİ

        new GonderiServisi(yurtici).gonder("Malatya", "Ankara", 20);
        new GonderiServisi(yurtdisi).gonder("İstanbul", "Berlin", 12);
        new GonderiServisi(avrupa).gonder("İzmir", "Roma", 3);
    }
}
