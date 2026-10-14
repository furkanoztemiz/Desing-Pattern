// Bu dosya tools/export-java.js ile js/patterns/singleton/data.js içinden üretildi.
package singleton.yaris.erken;

/**
 * Sahte veritabanı: son verilen numarayı okumak zaman alır (ağ + disk).
 */
public class Veritabani {

    public static int sonNumarayiOku() {
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return 1000;
    }
}
