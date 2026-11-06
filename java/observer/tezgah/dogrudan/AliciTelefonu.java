// Bu dosya tools/export-java.js ile js/patterns/observer/data.js içinden üretildi.
package observer.tezgah.dogrudan;

/**
 * Alıcının telefonu: gönderinin her yeni durumunu SMS olarak alır.
 */
public class AliciTelefonu {

    private final String ad;

    public AliciTelefonu(String ad) {
        this.ad = ad;
    }

    public void smsGonder(String takipNo, String durum) {
        System.out.println("  SMS → " + ad + ": " + takipNo + " " + durum);
    }
}
