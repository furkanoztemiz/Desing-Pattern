// Bu dosya tools/export-java.js ile js/patterns/adapter/data.js içinden üretildi.
package adapter.cozum;

public class Main {

    public static void main(String[] args) {
        KargoFirmasi yurtici = new HizliKargo();
        KargoFirmasi yurtdisi = new GlobalShipAdaptoru(new GlobalShipApi());    // yabancı kütüphane, sarmalanmış

        new GonderiServisi(yurtici).gonder("Malatya", "Ankara", 20);
        new GonderiServisi(yurtdisi).gonder("İstanbul", "Berlin", 12);
        new IadeServisi(yurtdisi).iadeAl("Berlin", "İstanbul", 12);
    }
}
