// Bu dosya tools/export-java.js ile js/patterns/adapter/data.js içinden üretildi.
package adapter.cozum;

/**
 * «Adapter» — GlobalShip'i, sistemimizin beklediği KargoFirmasi arayüzüne uyarlar.
 * Bütün çeviri (ad, birim, numara, durum) YALNIZCA burada.
 */
public class GlobalShipAdaptoru implements KargoFirmasi {

    private static final double LB_PER_KG = 2.20462;
    private static final String[] DURUMLAR = {"Hazırlanıyor", "Aktarma merkezinde", "Yolda", "Teslim edildi"};

    private final GlobalShipApi api;                                    // uyarlanan nesne (kompozisyon)

    public GlobalShipAdaptoru(GlobalShipApi api) {
        this.api = api;
    }

    @Override
    public String gonderiOlustur(String nereden, String nereye, int kg) {
        double lb = kg * LB_PER_KG;                                     // birim: kg → lb
        long id = api.createShipment(new ShipmentRequest(nereden, nereye, lb));
        return "GS-" + id;                                              // numara: 48213 → "GS-48213"
    }

    @Override
    public String durumSorgula(String takipNo) {
        long id = Long.parseLong(takipNo.substring(3));                 // "GS-48213" → 48213
        return DURUMLAR[api.trackStatus(id)];                           // kod: 2 → "Yolda"
    }
}
