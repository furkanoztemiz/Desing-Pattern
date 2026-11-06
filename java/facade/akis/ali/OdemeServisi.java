// Bu dosya tools/export-java.js ile js/patterns/facade/data.js içinden üretildi.
package facade.akis.ali;

import java.util.Map;

/**
 * «Subsystem» — Kartlı ödeme. Kart limiti aşılırsa ödeme REDDEDİLİR.
 */
public class OdemeServisi {

    private static final Map<String, Integer> LIMIT = Map.of(
            "Ali Şahin", 500, "Ayşe Yılmaz", 300, "Zeynep Güneş", 300, "Can Demir", 50);
    static int tahsilat;                            // gün sonu raporu için

    public boolean cek(String musteri, int tutar) {     // yeni: sonucu kontrol edin!
        int limit = LIMIT.get(musteri);
        if (tutar > limit) {
            System.out.println("[Ödeme] " + musteri + ": " + tutar + " TL REDDEDİLDİ (limit " + limit + " TL)");
            return false;
        }
        tahsilat += tutar;
        System.out.println("[Ödeme] " + musteri + ": " + tutar + " TL çekildi");
        return true;
    }
}
