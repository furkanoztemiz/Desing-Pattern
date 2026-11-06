// Bu dosya tools/export-java.js ile js/patterns/chain-of-responsibility/data.js içinden üretildi.
package chainofresponsibility.tezgah.iadesiz;

/**
 * «Handler» — Zincirin bir halkası: işleyebiliyorsa işler, işleyemiyorsa isteği SONRAKİNE iletir.
 */
public abstract class TeslimatAdimi {

    private final String ad;
    private TeslimatAdimi sonraki;                  // zincirdeki bir sonraki halka

    protected TeslimatAdimi(String ad) {
        this.ad = ad;
    }

    public TeslimatAdimi sonra(TeslimatAdimi s) {   // zinciri kurar; s’yi döndürür
        this.sonraki = s;
        return s;
    }

    public final void teslimEt(Gonderi g) {
        if (dene(g)) {
            System.out.println(ad + " ✓");
        } else if (sonraki != null) {
            System.out.print(ad + " ✗ → ");
            sonraki.teslimEt(g);                    // isteği ilet
        } else {
            System.out.println(ad + " ✗ → KAYIP: kimse teslim almadı!");
        }
    }

    protected abstract boolean dene(Gonderi g);     // halkanın kendi kuralı
}
