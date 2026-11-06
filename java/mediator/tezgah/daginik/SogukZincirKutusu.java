// Bu dosya tools/export-java.js ile js/patterns/mediator/data.js içinden üretildi.
package mediator.tezgah.daginik;

/**
 * Soğuk zincir kutusu: ilaç dolaba konmaz; işaretlenince dolabı kapatır, ücrete ek koyar.
 */
public class SogukZincirKutusu {

    private boolean isaretli;
    private SehirSecici sehir;
    private AgirlikAlani agirlik;
    private TeslimatSecici teslimat;
    private UcretEtiketi ucret;

    public void baglan(SehirSecici sehir, AgirlikAlani agirlik,
            TeslimatSecici teslimat, UcretEtiketi ucret) {
        this.sehir = sehir;
        this.agirlik = agirlik;
        this.teslimat = teslimat;
        this.ucret = ucret;
    }

    public void isaretle(boolean isaretli) {
        this.isaretli = isaretli;
        System.out.println("> soğuk zincir: " + (isaretli ? "açık" : "kapalı"));
        boolean dolap = !isaretli && "Malatya".equals(sehir.secili())
                && agirlik.kg() <= 20;
        teslimat.setDolapAcik(dolap);
        ucret.hesapla(agirlik.kg(), teslimat.secili(), isaretli);
    }

    public boolean isaretli() {
        return isaretli;
    }
}
