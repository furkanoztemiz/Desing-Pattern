// Bu dosya tools/export-java.js ile js/patterns/prototype/data.js içinden üretildi.
package prototype.klon.kurucu;

import java.util.ArrayList;
import java.util.List;

public class Koli {

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

    private Koli(Koli kaynak) {                 // kopya kurucu: final alanlarla uyumlu
        this.takipNo = "KRG-" + (++sayac);      // kurucu çalışır → yeni numara
        this.alici = kaynak.alici;
        this.icerik = new ArrayList<>(kaynak.icerik);
        System.out.println("  kopya kurucu çalıştı: " + takipNo);
    }

    public Koli kopyala() {                     // Cloneable yok, cast yok, istisna yok
        return new Koli(this);
    }

    public void ekle(String urun) {
        icerik.add(urun);
    }

    @Override
    public String toString() {
        return takipNo + " " + alici + ": " + String.join(", ", icerik);
    }
}
