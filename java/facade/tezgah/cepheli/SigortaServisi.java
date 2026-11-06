// Bu dosya tools/export-java.js ile js/patterns/facade/data.js içinden üretildi.
package facade.tezgah.cepheli;

/**
 * «Subsystem» — Yeni alt sistem: her gönderiye sigorta poliçesi.
 */
public class SigortaServisi {

    public void police(String no, int tutar) {
        System.out.println("[Sigorta] " + no + ": " + tutar + " TL değerinde poliçe");
    }
}
