// Bu dosya tools/export-java.js ile js/patterns/facade/data.js içinden üretildi.
package facade.akis.ali;

import java.util.Optional;

/**
 * «Client» — Şube kasası: alt sistemleri tanımaz; gönderiyi cepheye verir.
 */
public class SubeKasasi {

    private final GonderiCephesi cephe;

    public SubeKasasi(GonderiCephesi cephe) {
        this.cephe = cephe;
    }

    public void gonder(Talep t) {
        System.out.println("[Kasa] " + t.musteri() + ": " + t.kg() + " kg, " + t.adres() + "/" + t.il());
        Optional<String> no = cephe.gonder(t);
        System.out.println("[Kasa] " + (no.isPresent() ? "fiş: " + no.get() : "gönderi oluşturulmadı"));
    }
}
