// Bu dosya tools/export-java.js ile js/patterns/mediator/data.js içinden üretildi.
package mediator.tezgah.kopyali;

/**
 * Ücret etiketi: ücreti ağırlığa, seçeneğe ve soğuk zincire göre hesaplayıp gösterir.
 */
public class UcretEtiketi {

    private int tl = 40;

    public void hesapla(int kg, String secenek, boolean soguk) {
        int yeni = taban(secenek) + kg * 2 + (soguk ? 25 : 0);
        if (yeni != tl) {
            tl = yeni;
            System.out.println("  ücret: " + tl + " TL");
        }
    }

    private static int taban(String secenek) {
        return switch (secenek) {
            case "Hızlı" -> 70;
            case "Dolap" -> 30;
            default -> 40;
        };
    }

    public int tl() {
        return tl;
    }
}
