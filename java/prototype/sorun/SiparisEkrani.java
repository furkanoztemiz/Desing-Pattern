// Bu dosya tools/export-java.js ile js/patterns/prototype/data.js içinden üretildi.
package prototype.sorun;

/**
 * "Geçen haftakini tekrarla" düğmesi: son gönderinin aynısını yeniden oluşturur.
 */
public class SiparisEkrani {

    public static Gonderi tekrarla(Gonderi son) {
        if (son instanceof KoliGonderisi k) {
            return new KoliGonderisi(k.getAlici(), k.getIcerik(), k.getAgirlik());
        }
        if (son instanceof ZarfGonderisi z) {
            return new ZarfGonderisi(z.getAlici(), z.getIcerik(), z.isIadeli());
        }
        throw new IllegalArgumentException("Bilinmeyen gönderi türü: " + son.getClass().getSimpleName());
    }
}
