// Bu dosya tools/export-java.js ile js/patterns/mediator/data.js içinden üretildi.
package mediator.tezgah.kopyali;

/**
 * Gönderi formu: öğeleri yaratır ve birbirine bağlar; kuralları öğeler kendileri uygular.
 */
public class GonderiFormu {

    private final SehirSecici sehir = new SehirSecici();
    private final AgirlikAlani agirlik = new AgirlikAlani();
    private final SogukZincirKutusu soguk = new SogukZincirKutusu();
    private final TeslimatSecici teslimat = new TeslimatSecici();
    private final UcretEtiketi ucret = new UcretEtiketi();

    public GonderiFormu() {
        sehir.baglan(agirlik, soguk, teslimat);
        agirlik.baglan(sehir, soguk, teslimat, ucret);
        soguk.baglan(sehir, agirlik, teslimat, ucret);
        teslimat.baglan(agirlik, soguk, ucret);
    }

    public SehirSecici sehir() {
        return sehir;
    }

    public AgirlikAlani agirlik() {
        return agirlik;
    }

    public SogukZincirKutusu soguk() {
        return soguk;
    }

    public TeslimatSecici teslimat() {
        return teslimat;
    }

    public String ozet() {
        String yer = sehir.secili() == null ? "şehir seçilmedi" : sehir.secili();
        return "Gönderi: " + yer + " · " + agirlik.kg() + " kg"
                + (soguk.isaretli() ? " · soğuk zincir" : "")
                + " · " + teslimat.secili() + " · " + ucret.tl() + " TL";
    }
}
