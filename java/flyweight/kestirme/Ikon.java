// Bu dosya tools/export-java.js ile js/patterns/flyweight/data.js içinden üretildi.
package flyweight.kestirme;

/**
 * Diskten okunan 64×64 ikon (RGBA): 16 KB piksel verisi.
 */
public class Ikon {

    public static final int BOYUT = 64 * 64 * 4;        // 16 KB
    static int yuklenen;                                // ölçüm: kaç ikon yüklendi?

    private final String dosya;
    private final int no;
    private final byte[] pikseller = new byte[BOYUT];   // gerçekte PNG dosyasından okunur

    public Ikon(String dosya) {
        this.dosya = dosya;
        this.no = ++yuklenen;
    }

    @Override
    public String toString() {
        return dosya + "#" + no;
    }
}
