// Bu dosya tools/export-java.js ile js/patterns/mediator/data.js içinden üretildi.
package mediator.cozum;

/**
 * «ConcreteColleague» — Teslimat seçici: seçimi bildirir; hangi seçenek açık, yönetici söyler.
 */
public class TeslimatSecici extends FormOgesi {

    private String secili = "Standart";
    private boolean hizliAcik = true;
    private boolean dolapAcik = false;

    public TeslimatSecici(FormYoneticisi yonetici) {
        super(yonetici);
    }

    public void sec(String secenek) {
        if (!acik(secenek)) {
            System.out.println("> teslimat: " + secenek + " seçilemez (kapalı)");
            return;
        }
        secili = secenek;
        System.out.println("> teslimat: " + secenek);
        degisti();
    }

    public void ayarla(boolean hizli, boolean dolap) {      // yönetici çağırır
        if (hizli != hizliAcik) {
            hizliAcik = hizli;
            System.out.println("  hızlı: " + (hizli ? "açık" : "kapalı"));
        }
        if (dolap != dolapAcik) {
            dolapAcik = dolap;
            System.out.println("  dolap: " + (dolap ? "açık" : "kapalı"));
        }
        if (!acik(secili)) {
            secili = "Standart";
            System.out.println("  teslimat: Standart");
        }
    }

    private boolean acik(String secenek) {
        return switch (secenek) {
            case "Hızlı" -> hizliAcik;
            case "Dolap" -> dolapAcik;
            default -> true;
        };
    }

    public String secili() {
        return secili;
    }
}
