// Bu dosya tools/export-java.js ile js/patterns/abstract-factory/data.js içinden üretildi.
package abstractfactory.sorun;

public class TeslimatServisi {

    public void gonder(String yuk, String tur) {
        TasimaAraci arac = aracSec(tur);
        TasimaBelgesi belge = belgeSec(tur);
        belge.hazirla(yuk);
        Gumruk.kontrolEt(arac, belge);
        arac.teslimEt(yuk);
    }

    private TasimaAraci aracSec(String tur) {
        switch (tur) {
            case "kara":  return new Kamyon();
            case "deniz": return new Gemi();
            case "hava":  return new Ucak();
            default: throw new IllegalArgumentException("Bilinmeyen tür: " + tur);
        }
    }

    private TasimaBelgesi belgeSec(String tur) {
        switch (tur) {
            case "deniz": return new Konsimento();
            default:      return new CmrBelgesi();   // varsayılan: kara
        }
    }
}
