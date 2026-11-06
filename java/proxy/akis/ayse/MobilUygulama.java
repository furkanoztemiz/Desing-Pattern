// Bu dosya tools/export-java.js ile js/patterns/proxy/data.js içinden üretildi.
package proxy.akis.ayse;

/**
 * İstemci: panelle aynı; bağlantı, önbellek ya da KVKK kodu yok.
 */
public class MobilUygulama {

    private final Musteri musteri;
    private final TakipServisi servis;

    public MobilUygulama(Musteri musteri, TakipServisi servis) {
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
        System.out.println("[Mobil/" + musteri.ad() + "] " + takipNo + ": " + durum);
    }
}
