// Bu dosya tools/export-java.js ile js/patterns/adapter/data.js içinden üretildi.
package adapter.sorun;

/**
 * İade servisi — başka bir geliştirici yazdı; GlobalShip kodunu kopyaladı.
 */
public class IadeServisi {

    private final KargoFirmasi firma;
    private final GlobalShipApi globalShip;

    public IadeServisi(KargoFirmasi firma, GlobalShipApi globalShip) {
        this.firma = firma;
        this.globalShip = globalShip;
    }

    public void iadeAl(String musteriSehri, String depoSehri, int kg, boolean yurtdisi) {
        if (yurtdisi) {
            long id = globalShip.createShipment(new ShipmentRequest(musteriSehri, depoSehri, kg));
            System.out.println("İade takip no: GS-" + id);
        } else {
            System.out.println("İade takip no: " + firma.gonderiOlustur(musteriSehri, depoSehri, kg));
        }
    }
}
