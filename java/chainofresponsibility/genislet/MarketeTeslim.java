// Bu dosya tools/export-java.js ile js/patterns/chain-of-responsibility/data.js içinden üretildi.
package chainofresponsibility.genislet;

/**
 * «ConcreteHandler» — Yeni halka: anlaşmalı mahalle marketi.
 */
public class MarketeTeslim extends TeslimatAdimi {

    public MarketeTeslim() {
        super("Market");
    }

    @Override
    protected boolean dene(Gonderi g) {
        return !g.sogukZincir() && g.kg() <= 15;
    }
}
