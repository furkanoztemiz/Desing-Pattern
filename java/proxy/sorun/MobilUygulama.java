// Bu dosya tools/export-java.js ile js/patterns/proxy/data.js içinden üretildi.
package proxy.sorun;

import java.util.HashMap;
import java.util.Map;

/**
 * Mobil uygulama: bağlantı ve önbellek kodu panelden kopyalandı.
 */
public class MobilUygulama {

    private final Musteri musteri;
    private GlobalShipTakip servis;             // ilk sorguda açılır
    private final Map<String, String> onbellek = new HashMap<>();

    public MobilUygulama(Musteri musteri) {
        this.musteri = musteri;
    }

    public void goster(String takipNo) {
        String durum = onbellek.get(takipNo);
        if (durum == null) {
            if (servis == null) {
                servis = new GlobalShipTakip();
            }
            durum = servis.sorgula(takipNo);
            onbellek.put(takipNo, durum);
        }
        System.out.println("[Mobil/" + musteri.ad() + "] " + takipNo + ": " + durum);
    }
}
