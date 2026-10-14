// Bu dosya tools/export-java.js ile js/patterns/prototype/data.js içinden üretildi.
package prototype.cozum;

/**
 * Yavaş bir dış servis: alıcının adresini doğrular (gerçekte bir ağ çağrısı, ~2 sn).
 */
public class AdresServisi {

    static int sorguSayisi = 0;

    public static void dogrula(String alici) {
        sorguSayisi++;
        System.out.println("  [AdresServisi] " + alici + " doğrulanıyor... (~2 sn)");
    }
}
