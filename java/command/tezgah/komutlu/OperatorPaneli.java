// Bu dosya tools/export-java.js ile js/patterns/command/data.js içinden üretildi.
package command.tezgah.komutlu;

import java.util.ArrayDeque;
import java.util.Deque;

/**
 * «Invoker» — Komutu çalıştırır ve geçmişe koyar. Komutun ne yaptığını, depoyu ya da kamyonu bilmez.
 */
public class OperatorPaneli {

    private final Deque<Komut> gecmis = new ArrayDeque<>();  // geri al yığını
    private final Deque<Komut> ileri = new ArrayDeque<>();  // yinele yığını

    public void yap(Komut k) {
        System.out.println("[Panel] " + k.ad());
        k.calistir();
        gecmis.push(k);
        ileri.clear();
    }

    public void geriAl() {
        if (gecmis.isEmpty()) {
            System.out.println("[Panel] geri alınacak işlem yok");
            return;
        }
        Komut k = gecmis.pop();
        System.out.println("[Panel] geri al: " + k.ad());
        k.geriAl();
        ileri.push(k);
    }

    public void yinele() {
        if (ileri.isEmpty()) {
            System.out.println("[Panel] yinelenecek işlem yok");
            return;
        }
        Komut k = ileri.pop();
        System.out.println("[Panel] yinele: " + k.ad());
        k.calistir();
        gecmis.push(k);
    }
}
