// Bu dosya tools/export-java.js ile js/patterns/observer/data.js içinden üretildi.
package observer.tezgah.sabit;

import java.util.Map;
import java.util.StringJoiner;
import java.util.TreeMap;

/**
 * «ConcreteObserver» — Satıcı paneli: mağazanın bütün gönderilerini tek listede gösterir.
 */
public class SaticiPaneli implements GonderiGozlemcisi {

    private final Map<String, String> satirlar = new TreeMap<>();

    @Override
    public void guncelle(Gonderi gonderi) {
        String takipNo = gonderi.getTakipNo();
        String durum = gonderi.getDurum();
        satirlar.put(takipNo, durum);
        System.out.println("  Panel: " + takipNo + " = " + durum);
    }

    public String ekran() {
        StringJoiner ekran = new StringJoiner(" · ", "Satıcı paneli: ", "");
        ekran.setEmptyValue("Satıcı paneli: boş");
        satirlar.forEach((takipNo, durum) -> ekran.add(takipNo + " " + durum));
        return ekran.toString();
    }
}
