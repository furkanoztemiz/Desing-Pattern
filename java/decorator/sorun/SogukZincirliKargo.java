// Bu dosya tools/export-java.js ile js/patterns/decorator/data.js içinden üretildi.
package decorator.sorun;

public class SogukZincirliKargo extends StandartKargo {

    @Override
    public String aciklama() {
        return super.aciklama() + " + soğuk zincir";
    }

    @Override
    public int ucret() {
        return super.ucret() + 60;
    }
}
