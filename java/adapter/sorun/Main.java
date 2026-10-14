// Bu dosya tools/export-java.js ile js/patterns/adapter/data.js içinden üretildi.
package adapter.sorun;

public class Main {

    public static void main(String[] args) {
        KargoFirmasi yurtici = new HizliKargo();
        GlobalShipApi globalShip = new GlobalShipApi();

        new GonderiServisi(yurtici, globalShip).gonder("Malatya", "Ankara", 20, false);
        new GonderiServisi(yurtici, globalShip).gonder("İstanbul", "Berlin", 12, true);
        new IadeServisi(yurtici, globalShip).iadeAl("Berlin", "İstanbul", 12, true);
    }
}
