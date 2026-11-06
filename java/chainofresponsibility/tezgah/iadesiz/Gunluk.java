// Bu dosya tools/export-java.js ile js/patterns/chain-of-responsibility/data.js içinden üretildi.
package chainofresponsibility.tezgah.iadesiz;

import java.util.List;

/**
 * Günün gönderileri (örnek veri).
 */
public class Gunluk {

    public static List<Gonderi> gonderiler() {
        return List.of(
                Gonderi.koli("KRG-1001", "Ali Şahin", 3, Kapi.ALICI_EVDE),
                Gonderi.koli("KRG-1002", "Ayşe Yılmaz", 2, Kapi.KOMSU_EVDE),
                Gonderi.ilac("KRG-1003", "Zeynep Güneş", 1, Kapi.KOMSU_EVDE),
                Gonderi.koli("KRG-1004", "Can Demir", 4, Kapi.KIMSE_YOK),
                Gonderi.koli("KRG-1005", "Selin Aydın", 9, Kapi.KIMSE_YOK),
                Gonderi.koli("KRG-1006", "Mert Kaya", 25, Kapi.KIMSE_YOK));
    }
}
