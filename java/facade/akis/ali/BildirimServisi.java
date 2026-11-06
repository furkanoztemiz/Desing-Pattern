// Bu dosya tools/export-java.js ile js/patterns/facade/data.js içinden üretildi.
package facade.akis.ali;

/**
 * «Subsystem» — Müşteriye SMS.
 */
public class BildirimServisi {

    public void gonder(String musteri, String mesaj) {
        System.out.println("[SMS] " + musteri + ": " + mesaj);
    }
}
