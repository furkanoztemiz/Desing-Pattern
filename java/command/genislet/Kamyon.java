// Bu dosya tools/export-java.js ile js/patterns/command/data.js içinden üretildi.
package command.genislet;

import java.util.ArrayList;
import java.util.List;

/**
 * Malatya kamyonu: yüklenen koliler, yükleme sırasıyla.
 */
public class Kamyon {

    private final List<String> yuk = new ArrayList<>();

    public void yukle(String koli) {
        yuk.add(koli);
        System.out.println("  kamyon: " + koli + " yüklendi");
    }

    public void indir(String koli) {
        yuk.remove(koli);
        System.out.println("  kamyon: " + koli + " indirildi");
    }

    public String durum() {
        if (yuk.isEmpty()) {
            return "Kamyon: boş";
        }
        StringBuilder sb = new StringBuilder("Kamyon:");
        for (String koli : yuk) {
            sb.append(' ').append(koli.substring(4));
        }
        return sb.toString();
    }
}
