// Bu dosya tools/export-java.js ile js/patterns/chain-of-responsibility/data.js içinden üretildi.
package chainofresponsibility.tezgah.subeonce;

/**
 * «ConcreteHandler» — Zincirin sonu: kimse almadıysa gönderi göndericiye döner.
 */
public class GondericiyeIade extends TeslimatAdimi {

    public GondericiyeIade() {
        super("İade");
    }

    @Override
    protected boolean dene(Gonderi g) {
        return true;
    }
}
