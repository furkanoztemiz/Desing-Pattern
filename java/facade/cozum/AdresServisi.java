// Bu dosya tools/export-java.js ile js/patterns/facade/data.js içinden üretildi.
package facade.cozum;

/**
 * «Subsystem» — Adres doğrulama. Cepheden habersizdir.
 */
public class AdresServisi {

    public String dogrula(String adres, String il) {
        String tam = adres + "/" + il;
        System.out.println("[Adres] " + tam + " doğrulandı");
        return tam;
    }
}
