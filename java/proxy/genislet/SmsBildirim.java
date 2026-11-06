// Bu dosya tools/export-java.js ile js/patterns/proxy/data.js içinden üretildi.
package proxy.genislet;

/**
 * Yeni istemci: gece SMS işi. Bağlantı, önbellek, KVKK… hiçbirini bilmez.
 */
public class SmsBildirim {

    private final Musteri musteri;
    private final TakipServisi servis;

    public SmsBildirim(Musteri musteri, TakipServisi servis) {
        this.musteri = musteri;
        this.servis = servis;
    }

    public void gonder(String takipNo) {
        String metin;
        try {
            metin = servis.sorgula(takipNo);
        } catch (SecurityException e) {
            metin = e.getMessage();
        }
        System.out.println("[SMS/" + musteri.ad() + "] " + takipNo + ": " + metin);
    }
}
