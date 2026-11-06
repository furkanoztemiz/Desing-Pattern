// Bu dosya tools/export-java.js ile js/patterns/composite/data.js içinden üretildi.
package composite.sorun;

/**
 * Ağırlık ve içerik listesi (manifesto): kolinin içine kendisi bakar, ürünü ve koliyi ayrı ele alır.
 */
public class Kantar {

    public static int agirlik(Urun u) {                     // kolisiz ürün için ayrı metot
        return u.getGram();
    }

    public static int agirlik(Koli koli) {
        int toplam = koli.getDara();
        for (Urun u : koli.getUrunler()) {
            toplam += u.getGram();
        }
        // koli içinde koli: bir kat yeter herhalde
        for (Koli ic : koli.getKoliler()) {
            toplam += ic.getDara();
            for (Urun u : ic.getUrunler()) {
                toplam += u.getGram();
            }
        }
        return toplam;
    }

    public static void listele(Urun u) {
        System.out.println("- " + u.getAd() + " (" + u.getGram() + " g)");
    }

    public static void listele(Koli koli) {
        System.out.println("+ " + koli.getAd() + " [" + agirlik(koli) + " g]");
        for (Urun u : koli.getUrunler()) {
            System.out.println("   - " + u.getAd() + " (" + u.getGram() + " g)");
        }
        for (Koli ic : koli.getKoliler()) {
            System.out.println("   + " + ic.getAd() + " [" + agirlik(ic) + " g]");
            for (Urun u : ic.getUrunler()) {
                System.out.println("      - " + u.getAd() + " (" + u.getGram() + " g)");
            }
        }
    }
}
