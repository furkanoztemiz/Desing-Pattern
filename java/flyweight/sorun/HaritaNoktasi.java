// Bu dosya tools/export-java.js ile js/patterns/flyweight/data.js içinden üretildi.
package flyweight.sorun;

/**
 * Haritadaki bir gönderi noktası: türü, ikonu, etiketi ve konumu.
 */
public class HaritaNoktasi {

    private final String tur;
    private final Ikon ikon;
    private final String etiket;
    private final int x;
    private final int y;

    public HaritaNoktasi(String etiket, int x, int y, String tur) {
        this.tur = tur;
        this.ikon = new Ikon(tur + ".png");         // her nokta kendi kopyasını yükler
        this.etiket = etiket;
        this.x = x;
        this.y = y;
    }

    public void ciz() {
        System.out.println("[" + tur + "] " + etiket + " → (" + x + ", " + y + ") · " + ikon);
    }
}
