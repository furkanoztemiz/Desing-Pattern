// Bu dosya tools/export-java.js ile js/patterns/adapter/data.js içinden üretildi.
package adapter.akis;

public class Main {

    public static void main(String[] args) {
        GlobalShipApi api = new GlobalShipApi();                // uyarlanan: dokunamayız
        KargoFirmasi firma = new GlobalShipAdaptoru(api);       // adaptör onu sarmalar
        GonderiServisi servis = new GonderiServisi(firma);      // istemci yalnızca arayüzü bilir

        servis.gonder("İstanbul", "Berlin", 12);
    }
}
