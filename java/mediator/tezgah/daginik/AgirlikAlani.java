// Bu dosya tools/export-java.js ile js/patterns/mediator/data.js içinden üretildi.
package mediator.tezgah.daginik;

/**
 * Ağırlık alanı: 20 kg üstünde hızlı teslimat ve dolap kapanır; ücreti de kendisi günceller.
 */
public class AgirlikAlani {

    private int kg;
    private SehirSecici sehir;
    private SogukZincirKutusu soguk;
    private TeslimatSecici teslimat;
    private UcretEtiketi ucret;

    public void baglan(SehirSecici sehir, SogukZincirKutusu soguk,
            TeslimatSecici teslimat, UcretEtiketi ucret) {
        this.sehir = sehir;
        this.soguk = soguk;
        this.teslimat = teslimat;
        this.ucret = ucret;
    }

    public void yaz(int kg) {
        this.kg = kg;
        System.out.println("> ağırlık: " + kg + " kg");
        teslimat.setHizliAcik(kg <= 20);
        boolean dolap = "Malatya".equals(sehir.secili()) && kg <= 20;
        teslimat.setDolapAcik(dolap);
        ucret.hesapla(kg, teslimat.secili(), soguk.isaretli());
    }

    public int kg() {
        return kg;
    }
}
