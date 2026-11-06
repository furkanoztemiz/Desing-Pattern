// Bu dosya tools/export-java.js ile js/patterns/proxy/data.js içinden üretildi.
package proxy.sorun;

import java.util.HashMap;
import java.util.Map;

/**
 * Müşteri paneli: bağlantı, önbellek ve KVKK denetimi panelin içinde.
 */
public class MusteriPaneli {

    private final Musteri musteri;
    private GlobalShipTakip servis;             // ilk sorguda açılır
    private final Map<String, String> onbellek = new HashMap<>();

    public MusteriPaneli(Musteri musteri) {
        this.musteri = musteri;
    }

    public void goster(String takipNo) {
        if (!musteri.sahibi(takipNo)) {         // KVKK
            System.out.println("[Panel/" + musteri.ad() + "] " + takipNo + ": size ait değil (KVKK)");
            return;
        }
        String durum = onbellek.get(takipNo);
        if (durum == null) {
            if (servis == null) {
                servis = new GlobalShipTakip();
            }
            durum = servis.sorgula(takipNo);
            onbellek.put(takipNo, durum);
        }
        System.out.println("[Panel/" + musteri.ad() + "] " + takipNo + ": " + durum);
    }
}
