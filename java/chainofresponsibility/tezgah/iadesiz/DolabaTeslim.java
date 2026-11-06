// Bu dosya tools/export-java.js ile js/patterns/chain-of-responsibility/data.js içinden üretildi.
package chainofresponsibility.tezgah.iadesiz;

/**
 * «ConcreteHandler» — Akıllı dolap: küçük ve soğuk zincir olmayan gönderiler.
 */
public class DolabaTeslim extends TeslimatAdimi {

    public DolabaTeslim() {
        super("Dolap");
    }

    @Override
    protected boolean dene(Gonderi g) {
        return !g.sogukZincir() && g.kg() <= 5;
    }
}
