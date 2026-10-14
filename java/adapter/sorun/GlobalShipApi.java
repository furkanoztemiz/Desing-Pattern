// Bu dosya tools/export-java.js ile js/patterns/adapter/data.js içinden üretildi.
package adapter.sorun;

import java.util.Locale;

/**
 * GlobalShip'in Java kütüphanesi (üçüncü parti .jar: kaynak kodunu DEĞİŞTİREMEYİZ).
 * Ağırlık POUND (lb) cinsinden; gönderi numarası bir sayı; durum bir kod.
 */
public class GlobalShipApi {

    private long sonId = 48212;

    public long createShipment(ShipmentRequest request) {
        long id = ++sonId;
        System.out.printf(Locale.US, "[GlobalShip] #%d created: %s -> %s, %.2f lb%n",
                id, request.from(), request.to(), request.weightLb());
        return id;
    }

    /** 0: CREATED · 1: AT_HUB · 2: IN_TRANSIT · 3: DELIVERED */
    public int trackStatus(long shipmentId) {
        return 2;                                   // örnekte her gönderi yolda
    }
}
