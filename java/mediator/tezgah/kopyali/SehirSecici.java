// Bu dosya tools/export-java.js ile js/patterns/mediator/data.js içinden üretildi.
package mediator.tezgah.kopyali;

/**
 * Şehir seçici: dolap yalnızca Malatya’da; seçim değişince dolabı kendisi açıp kapatır.
 */
public class SehirSecici {

    private String secili;
    private AgirlikAlani agirlik;
    private SogukZincirKutusu soguk;
    private TeslimatSecici teslimat;

    public void baglan(AgirlikAlani agirlik, SogukZincirKutusu soguk,
            TeslimatSecici teslimat) {
        this.agirlik = agirlik;
        this.soguk = soguk;
        this.teslimat = teslimat;
    }

    public void sec(String sehir) {
        secili = sehir;
        System.out.println("> şehir: " + sehir);
        boolean dolap = sehir.equals("Malatya") && !soguk.isaretli()
                && agirlik.kg() <= 20;
        teslimat.setDolapAcik(dolap);
    }

    public String secili() {
        return secili;
    }
}
