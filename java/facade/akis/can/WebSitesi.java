// Bu dosya tools/export-java.js ile js/patterns/facade/data.js içinden üretildi.
package facade.akis.can;

import java.util.Optional;

/**
 * «Client» — Web sitesi: kasayla aynı, yalnızca cepheyi tanır.
 */
public class WebSitesi {

    private final GonderiCephesi cephe;

    public WebSitesi(GonderiCephesi cephe) {
        this.cephe = cephe;
    }

    public void gonder(Talep t) {
        System.out.println("[Web] " + t.musteri() + ": " + t.kg() + " kg, " + t.adres() + "/" + t.il());
        Optional<String> no = cephe.gonder(t);
        System.out.println("[Web] " + (no.isPresent() ? "fiş: " + no.get() : "gönderi oluşturulmadı"));
    }
}
