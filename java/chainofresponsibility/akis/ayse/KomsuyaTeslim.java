// Bu dosya tools/export-java.js ile js/patterns/chain-of-responsibility/data.js içinden üretildi.
package chainofresponsibility.akis.ayse;

/**
 * «ConcreteHandler» — Komşuya teslim: soğuk zincir ve ağır gönderi bırakılmaz.
 */
public class KomsuyaTeslim extends TeslimatAdimi {

    public KomsuyaTeslim() {
        super("Komşu");
    }

    @Override
    protected boolean dene(Gonderi g) {
        return g.kapi() == Kapi.KOMSU_EVDE && !g.sogukZincir() && g.kg() <= 10;
    }
}
