// Bu dosya tools/export-java.js ile js/patterns/observer/data.js içinden üretildi.
package observer.sorun;

import java.util.Map;
import java.util.StringJoiner;
import java.util.TreeMap;

/**
 * Satıcı paneli: mağazanın bütün gönderilerini tek listede gösterir.
 */
public class SaticiPaneli {

    private final Map<String, String> satirlar = new TreeMap<>();

    public void satirGuncelle(String takipNo, String durum) {
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
