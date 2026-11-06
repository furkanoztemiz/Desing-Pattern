// Bu dosya tools/export-java.js ile js/patterns/facade/data.js içinden üretildi.
package facade.tezgah.cepheli;

/**
 * «Subsystem» — Ücret hesabı: 40 TL + kilo başına 15 TL.
 */
public class TarifeServisi {

    public int hesapla(int kg) {
        int tutar = 40 + 15 * kg;
        System.out.println("[Tarife] " + kg + " kg → " + tutar + " TL");
        return tutar;
    }
}
