// Bu dosya tools/export-java.js ile js/patterns/prototype/data.js içinden üretildi.
package prototype.klon.duzeltme;

import java.util.ArrayList;
import java.util.List;

public class Koli implements Cloneable {

    private static int sayac = 1000;

    private String takipNo;                 // final OLAMAZ: clone() içinde atanıyor
    private final String alici;
    private List<String> icerik;            // final OLAMAZ: clone() içinde atanıyor

    public Koli(String alici, List<String> icerik) {
        this.takipNo = "KRG-" + (++sayac);
        this.alici = alici;
        this.icerik = new ArrayList<>(icerik);
        System.out.println("  kurucu çalıştı: " + takipNo);
    }

    @Override
    public Koli clone() {
        try {
            Koli kopya = (Koli) super.clone();
            kopya.takipNo = "KRG-" + (++sayac);         // yeni numara: elle
            kopya.icerik = new ArrayList<>(icerik);     // derin kopya: elle
            return kopya;
        } catch (CloneNotSupportedException e) {
            throw new AssertionError(e);
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
