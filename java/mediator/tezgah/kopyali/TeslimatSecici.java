// Bu dosya tools/export-java.js ile js/patterns/mediator/data.js içinden üretildi.
package mediator.tezgah.kopyali;

/**
 * Teslimat seçici: Standart, Hızlı, Dolap; kapanan seçenek seçiliyse Standart’a döner.
 */
public class TeslimatSecici {

    private String secili = "Standart";
    private boolean hizliAcik = true;
    private boolean dolapAcik = false;
    private AgirlikAlani agirlik;
    private SogukZincirKutusu soguk;
    private UcretEtiketi ucret;

    public void baglan(AgirlikAlani agirlik, SogukZincirKutusu soguk,
            UcretEtiketi ucret) {
        this.agirlik = agirlik;
        this.soguk = soguk;
        this.ucret = ucret;
    }

    public void sec(String secenek) {
        if (!acik(secenek)) {
            System.out.println("> teslimat: " + secenek + " seçilemez (kapalı)");
            return;
        }
        secili = secenek;
        System.out.println("> teslimat: " + secenek);
        ucret.hesapla(agirlik.kg(), secili, soguk.isaretli());
    }

    public void setHizliAcik(boolean acik) {
        if (acik != hizliAcik) {
            hizliAcik = acik;
            System.out.println("  hızlı: " + (acik ? "açık" : "kapalı"));
            standartaDon();
        }
    }

    public void setDolapAcik(boolean acik) {
        if (acik != dolapAcik) {
            dolapAcik = acik;
            System.out.println("  dolap: " + (acik ? "açık" : "kapalı"));
            standartaDon();
        }
    }

    private void standartaDon() {
        if (!acik(secili)) {
            secili = "Standart";
            System.out.println("  teslimat: Standart");
            ucret.hesapla(agirlik.kg(), secili, soguk.isaretli());
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
