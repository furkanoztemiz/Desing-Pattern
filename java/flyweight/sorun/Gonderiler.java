// Bu dosya tools/export-java.js ile js/patterns/flyweight/data.js içinden üretildi.
package flyweight.sorun;

/**
 * Örnek veri: bütün Türkiye'den gönderiler, 12 ilin çevresine dağılmış (her çalıştırmada aynı).
 */
public class Gonderiler {

    private static final int[][] ILLER = {
        { 521, 215 }, { 306, 135 }, { 81, 212 }, { 153, 80 },         // Malatya, Ankara, İzmir, İstanbul
        { 221, 289 }, { 721, 208 }, { 576, 81 }, { 403, 284 },        // Antalya, Van, Trabzon, Adana
        { 637, 137 }, { 291, 240 }, { 443, 66 }, { 596, 238 },        // Erzurum, Konya, Samsun, Diyarbakır
    };
    private static final String[] TURLER = { "koli", "zarf", "koli", "palet", "koli" };

    public static void ekle(Harita harita, int adet) {
        for (int i = 0; i < adet; i++) {
            int[] il = ILLER[i % ILLER.length];
            int x = il[0] + (i * 37) % 29 + (i * 13) % 19 + (i * 7) % 11 - 28;  // ilin çevresine dağıt
            int y = il[1] + (i * 53) % 19 + (i * 11) % 13 + (i * 5) % 9 - 19;   // her çalıştırmada aynı
            harita.ekle("KRG-" + (1004 + i), x, y, TURLER[i % TURLER.length]);
        }
    }
}
