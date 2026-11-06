// Bu dosya tools/export-java.js ile js/patterns/facade/data.js içinden üretildi.
package facade.tezgah.cepheli;

import java.util.Optional;

/**
 * «Client» — Mobil uygulama: yalnızca cepheyi tanır.
 */
public class MobilUygulama {

    private final GonderiCephesi cephe;

    public MobilUygulama(GonderiCephesi cephe) {
        this.cephe = cephe;
    }

    public void gonder(Talep t) {
        System.out.println("[Mobil] " + t.musteri() + ": " + t.kg() + " kg, " + t.adres() + "/" + t.il());
        Optional<String> no = cephe.gonder(t);
        System.out.println("[Mobil] " + (no.isPresent() ? "fiş: " + no.get() : "gönderi oluşturulmadı"));
    }
}
