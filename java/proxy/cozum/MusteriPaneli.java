// Bu dosya tools/export-java.js ile js/patterns/proxy/data.js içinden üretildi.
package proxy.cozum;

/**
 * İstemci: yalnızca TakipServisi'ni tanır; karşısındakinin vekil olduğunu bilmez.
 */
public class MusteriPaneli {

    private final Musteri musteri;
    private final TakipServisi servis;

    public MusteriPaneli(Musteri musteri, TakipServisi servis) {
        this.musteri = musteri;
        this.servis = servis;
    }

    public void goster(String takipNo) {
        String durum;
        try {
            durum = servis.sorgula(takipNo);
        } catch (SecurityException e) {
            durum = e.getMessage();
        }
        System.out.println("[Panel/" + musteri.ad() + "] " + takipNo + ": " + durum);
    }
}
