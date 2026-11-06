// Bu dosya tools/export-java.js ile js/patterns/decorator/data.js içinden üretildi.
package decorator.sorun;

public class EkspresKargo extends StandartKargo {

    @Override
    public String aciklama() {
        return super.aciklama() + " + ekspres";
    }

    @Override
    public int ucret() {
        return super.ucret() + 40;
    }
}
