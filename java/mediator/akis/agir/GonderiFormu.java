// Bu dosya tools/export-java.js ile js/patterns/mediator/data.js içinden üretildi.
package mediator.akis.agir;

/**
 * «ConcreteMediator» — Gönderi formu: öğeleri kurar; kim kimi nasıl etkiler, yalnızca burada yazılı.
 */
public final class GonderiFormu implements FormYoneticisi {

    private final SehirSecici sehir = new SehirSecici(this);
    private final AgirlikAlani agirlik = new AgirlikAlani(this);
    private final SogukZincirKutusu soguk = new SogukZincirKutusu(this);
    private final TeslimatSecici teslimat = new TeslimatSecici(this);
    private final UcretEtiketi ucret = new UcretEtiketi(this);

    @Override
    public void degisti(FormOgesi kaynak) {
        int kg = agirlik.kg();
        boolean hizli = kg <= 20;
        boolean dolap = "Malatya".equals(sehir.secili()) && !soguk.isaretli()
                && kg <= 20;
        teslimat.ayarla(hizli, dolap);
        ucret.goster(ucretHesapla());
    }

    private int ucretHesapla() {
        int taban = switch (teslimat.secili()) {
            case "Hızlı" -> 70;
            case "Dolap" -> 30;
            default -> 40;
        };
        return taban + agirlik.kg() * 2 + (soguk.isaretli() ? 25 : 0);
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
