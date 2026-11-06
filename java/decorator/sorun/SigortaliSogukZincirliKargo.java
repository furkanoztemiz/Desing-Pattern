// Bu dosya tools/export-java.js ile js/patterns/decorator/data.js içinden üretildi.
package decorator.sorun;

public class SigortaliSogukZincirliKargo extends SogukZincirliKargo {

    @Override
    public String aciklama() {
        return super.aciklama() + " + sigorta";
    }

    @Override
    public int ucret() {
        return super.ucret() + 35;              // zam: 30 → 35
    }
}
