// Bu dosya tools/export-java.js ile js/patterns/abstract-factory/data.js içinden üretildi.
package abstractfactory.sorun;

/**
 * Gümrük: araç ile belge aynı aileden değilse gönderiyi durdurur.
 */
public class Gumruk {

    public static void kontrolEt(TasimaAraci arac, TasimaBelgesi belge) {
        if (!arac.gerekenBelge().equals(belge.ad())) {
            throw new IllegalStateException(
                "Gümrük: " + arac.gerekenBelge() + " bekleniyordu, " + belge.ad() + " geldi!");
        }
        System.out.println("[Gümrük] " + belge.ad() + " onaylandı.");
    }
}
