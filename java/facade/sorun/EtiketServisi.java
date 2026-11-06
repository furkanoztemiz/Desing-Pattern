// Bu dosya tools/export-java.js ile js/patterns/facade/data.js içinden üretildi.
package facade.sorun;

/**
 * «Subsystem» — Etiket yazıcısı.
 */
public class EtiketServisi {

    static int basilan;                             // gün sonu raporu için

    public void bas(String no, String adres) {
        basilan++;
        System.out.println("[Etiket] " + no + " basıldı → " + adres);
    }
}
