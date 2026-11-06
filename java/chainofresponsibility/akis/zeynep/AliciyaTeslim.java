// Bu dosya tools/export-java.js ile js/patterns/chain-of-responsibility/data.js içinden üretildi.
package chainofresponsibility.akis.zeynep;

/**
 * «ConcreteHandler» — Alıcı evdeyse kendisine teslim.
 */
public class AliciyaTeslim extends TeslimatAdimi {

    public AliciyaTeslim() {
        super("Alıcı");
    }

    @Override
    protected boolean dene(Gonderi g) {
        return g.kapi() == Kapi.ALICI_EVDE;
    }
}
