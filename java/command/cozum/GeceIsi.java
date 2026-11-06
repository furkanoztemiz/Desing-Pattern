// Bu dosya tools/export-java.js ile js/patterns/command/data.js içinden üretildi.
package command.cozum;

import java.util.ArrayList;
import java.util.List;

/**
 * «Invoker» — Komutları sıraya koyar, gece 02:00’de sırayla çalıştırır.
 */
public class GeceIsi {

    private final List<Komut> kuyruk = new ArrayList<>();

    public void ekle(Komut k) {
        kuyruk.add(k);
    }

    public void calistir() {
        System.out.println("[Gece] 02:00, " + kuyruk.size() + " iş");
        for (Komut k : kuyruk) {
            System.out.println("[Gece] " + k.ad());
            k.calistir();
        }
        kuyruk.clear();
    }
}
