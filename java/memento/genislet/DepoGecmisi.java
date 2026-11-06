// Bu dosya tools/export-java.js ile js/patterns/memento/data.js içinden üretildi.
package memento.genislet;

import java.util.ArrayDeque;
import java.util.Deque;

/**
 * «Caretaker» — Her işlemden önce deponun hatırasını alır; geri al ve yinele hatıralarla çalışır.
 */
public class DepoGecmisi {

    private final Depo depo;
    private final Deque<Depo.Hatira> geri = new ArrayDeque<>();
    private final Deque<Depo.Hatira> ileri = new ArrayDeque<>();

    public DepoGecmisi(Depo depo) {
        this.depo = depo;
    }

    public void islemOncesi() {
        geri.push(depo.hatiraOlustur());
        ileri.clear();
    }

    public void geriAl() {
        if (geri.isEmpty()) {
            System.out.println("[Geçmiş] geri alınacak işlem yok");
            return;
        }
        ileri.push(depo.hatiraOlustur());
        depo.hatirayaDon(geri.pop());
        System.out.println("[Geçmiş] geri alındı");
    }

    public void yinele() {
        if (ileri.isEmpty()) {
            System.out.println("[Geçmiş] yinelenecek işlem yok");
            return;
        }
        geri.push(depo.hatiraOlustur());
        depo.hatirayaDon(ileri.pop());
        System.out.println("[Geçmiş] yinelendi");
    }
}
