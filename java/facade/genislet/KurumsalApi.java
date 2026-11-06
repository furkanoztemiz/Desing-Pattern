// Bu dosya tools/export-java.js ile js/patterns/facade/data.js içinden üretildi.
package facade.genislet;

import java.util.List;
import java.util.Optional;

/**
 * Yeni istemci: e-ticaret ortağının toplu siparişleri. Alt sistemleri hiç tanımaz.
 */
public class KurumsalApi {

    private final GonderiCephesi cephe;

    public KurumsalApi(GonderiCephesi cephe) {
        this.cephe = cephe;
    }

    public void topluGonder(List<Talep> talepler) {
        System.out.println("[API] " + talepler.size() + " talep geldi");
        for (Talep t : talepler) {
            Optional<String> no = cephe.gonder(t);
            System.out.println("[API] " + t.musteri() + " → " + (no.isPresent() ? no.get() : "oluşturulmadı"));
        }
    }
}
