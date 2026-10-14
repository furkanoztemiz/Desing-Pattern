// Bu dosya tools/export-java.js ile js/patterns/adapter/data.js içinden üretildi.
package adapter.bicim.sinif;

/**
 * «Adapter» (SINIF adaptörü) — GlobalShipApi'den KALITIR, KargoFirmasi'nı uygular.
 */
public class GlobalShipSinifAdaptoru extends GlobalShipApi implements KargoFirmasi {

    private static final double LB_PER_KG = 2.20462;
    private static final String[] DURUMLAR = {"Hazırlanıyor", "Aktarma merkezinde", "Yolda", "Teslim edildi"};

    @Override
    public String gonderiOlustur(String nereden, String nereye, int kg) {
        long id = createShipment(new ShipmentRequest(nereden, nereye, kg * LB_PER_KG));     // miras alınan metot
        return "GS-" + id;
    }

    @Override
    public String durumSorgula(String takipNo) {
        return DURUMLAR[trackStatus(Long.parseLong(takipNo.substring(3)))];
    }
}
