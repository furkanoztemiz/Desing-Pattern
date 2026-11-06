// Bu dosya tools/export-java.js ile js/patterns/chain-of-responsibility/data.js içinden üretildi.
package chainofresponsibility.tezgah.subeonce;

/**
 * «ConcreteHandler» — Şube: soğuk dolabı var; 20 kg üstünü almaz.
 */
public class SubeyeTeslim extends TeslimatAdimi {

    public SubeyeTeslim() {
        super("Şube");
    }

    @Override
    protected boolean dene(Gonderi g) {
        return g.kg() <= 20;
    }
}
