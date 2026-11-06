// Bu dosya tools/export-java.js ile js/patterns/chain-of-responsibility/data.js içinden üretildi.
package chainofresponsibility.genislet;

/**
 * Kapıdaki durum: kim evde?
 */
public enum Kapi {

    ALICI_EVDE("alıcı evde"),
    KOMSU_EVDE("komşu evde"),
    KIMSE_YOK("kimse yok");

    private final String aciklama;

    Kapi(String aciklama) {
        this.aciklama = aciklama;
    }

    @Override
    public String toString() {
        return aciklama;
    }
}
