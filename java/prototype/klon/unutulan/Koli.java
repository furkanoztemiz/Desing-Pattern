// Bu dosya tools/export-java.js ile js/patterns/prototype/data.js içinden üretildi.
package prototype.klon.unutulan;

import java.util.ArrayList;
import java.util.List;

public class Koli {                         // "implements Cloneable" unutuldu

    private static int sayac = 1000;

    private final String takipNo;
    private final String alici;
    private final List<String> icerik;

    public Koli(String alici, List<String> icerik) {
        this.takipNo = "KRG-" + (++sayac);
        this.alici = alici;
        this.icerik = new ArrayList<>(icerik);
        System.out.println("  kurucu çalıştı: " + takipNo);
    }

    @Override
    public Koli clone() {
        try {
            return (Koli) super.clone();        // alan alan kopya; kurucu ÇALIŞMAZ
        } catch (CloneNotSupportedException e) {
            throw new AssertionError(e);        // Cloneable uyguladık: olamaz
        }
    }

    public void ekle(String urun) {
        icerik.add(urun);
    }

    @Override
    public String toString() {
        return takipNo + " " + alici + ": " + String.join(", ", icerik);
    }
}
