// Bu dosya tools/export-java.js ile js/patterns/proxy/data.js içinden üretildi.
package proxy.akis.ali;

import java.util.List;

/**
 * Oturumdaki müşteri ve ona ait gönderiler.
 */
public record Musteri(String ad, List<String> gonderiler) {

    /** KVKK: gönderi bu müşterinin mi? */
    public boolean sahibi(String takipNo) {
        return gonderiler.contains(takipNo);
    }
}
