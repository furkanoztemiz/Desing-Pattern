// Bu dosya tools/export-java.js ile js/patterns/facade/data.js içinden üretildi.
package facade.cozum;

/**
 * «Subsystem» — Takip numarası verir (sıra numarası).
 */
public class TakipNoServisi {

    private int sayac = 1000;

    public String yeni() {
        String no = "KRG-" + (++sayac);
        System.out.println("[Takip] " + no + " verildi");
        return no;
    }
}
