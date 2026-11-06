// Bu dosya tools/export-java.js ile js/patterns/proxy/data.js içinden üretildi.
package proxy.tezgah.vekilli;

import java.util.HashMap;
import java.util.Map;

/**
 * «Proxy» — GlobalShip'in vekili: aynı arayüz; erişimi denetler, gerçek nesneyi kendisi yönetir.
 */
public class TakipVekili implements TakipServisi {

    private final Musteri oturum;                   // koruma: kim soruyor?
    private final Map<String, String> onbellek = new HashMap<>();
    private GlobalShipTakip gercek;                 // sanal: ilk sorguda yaratılır

    public TakipVekili(Musteri oturum) {
        this.oturum = oturum;
    }

    @Override
    public String sorgula(String takipNo) {
        if (!oturum.sahibi(takipNo)) {          // koruma (KVKK)
            throw new SecurityException("size ait değil (KVKK)");
        }
        String kayit = onbellek.get(takipNo);   // önbellek
        if (kayit == null) {
            if (gercek == null) {                   // sanal
                gercek = new GlobalShipTakip();
            }
            kayit = gercek.sorgula(takipNo);
            onbellek.put(takipNo, kayit);
        }
        return kayit;
    }
}
