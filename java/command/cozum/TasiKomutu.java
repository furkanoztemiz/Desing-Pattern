// Bu dosya tools/export-java.js ile js/patterns/command/data.js içinden üretildi.
package command.cozum;

/**
 * «ConcreteCommand» — Koliyi başka bir rafa taşır; geri almak için nereden geldiğini kendisi hatırlar.
 */
public class TasiKomutu implements Komut {

    private final Depo depo;
    private final String koli;
    private final String hedef;
    private String onceki;                                  // geri al için: bu komutun kendi kaydı

    public TasiKomutu(Depo depo, String koli, String hedef) {
        this.depo = depo;
        this.koli = koli;
        this.hedef = hedef;
    }

    @Override
    public void calistir() {
        onceki = depo.yeri(koli);
        depo.tasi(koli, hedef);
    }

    @Override
    public void geriAl() {
        depo.tasi(koli, onceki);
    }

    @Override
    public String ad() {
        return "TAŞI " + koli + " → " + hedef;
    }
}
