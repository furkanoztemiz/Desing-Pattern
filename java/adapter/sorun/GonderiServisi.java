// Bu dosya tools/export-java.js ile js/patterns/adapter/data.js içinden üretildi.
package adapter.sorun;

/**
 * Gönderi servisi — yurt dışı için GlobalShip'i DOĞRUDAN kullanıyor.
 */
public class GonderiServisi {

    private final KargoFirmasi firma;
    private final GlobalShipApi globalShip;

    public GonderiServisi(KargoFirmasi firma, GlobalShipApi globalShip) {
        this.firma = firma;
        this.globalShip = globalShip;
    }

    public void gonder(String nereden, String nereye, int kg, boolean yurtdisi) {
        if (yurtdisi) {
            double lb = kg * 2.20462;                                       // birim çevirisi istemcide
            long id = globalShip.createShipment(new ShipmentRequest(nereden, nereye, lb));
            String durum = globalShip.trackStatus(id) == 2 ? "Yolda" : "Bilinmiyor";
            System.out.println("Takip no: GS-" + id + " | durum: " + durum);
        } else {
            String takipNo = firma.gonderiOlustur(nereden, nereye, kg);
            System.out.println("Takip no: " + takipNo + " | durum: " + firma.durumSorgula(takipNo));
        }
    }
}
