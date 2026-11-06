// Bu dosya tools/export-java.js ile js/patterns/command/data.js içinden üretildi.
package command.genislet;

/**
 * «ConcreteCommand» — Koliyi raftan alıp kamyona yükler; geri alınca aynı rafa koyar.
 */
public class YukleKomutu implements Komut {

    private final Depo depo;
    private final Kamyon kamyon;
    private final String koli;
    private String raf;                                     // geri al için: koli hangi raftan alındı

    public YukleKomutu(Depo depo, Kamyon kamyon, String koli) {
        this.depo = depo;
        this.kamyon = kamyon;
        this.koli = koli;
    }

    @Override
    public void calistir() {
        raf = depo.cikar(koli);
        kamyon.yukle(koli);
    }

    @Override
    public void geriAl() {
        kamyon.indir(koli);
        depo.koy(koli, raf);
    }

    @Override
    public String ad() {
        return "YÜKLE " + koli;
    }
}
