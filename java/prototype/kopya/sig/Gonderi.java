// Bu dosya tools/export-java.js ile js/patterns/prototype/data.js içinden üretildi.
package prototype.kopya.sig;

import java.util.ArrayList;
import java.util.List;

/**
 * «Prototype» — Gönderi. Her gönderi KENDİ kopyasını üretmeyi bilir.
 */
public abstract class Gonderi {

    protected final String alici;
    protected final List<String> icerik;

    protected Gonderi(String alici, List<String> icerik) {
        AdresServisi.dogrula(alici);                    // pahalı: dış servise sorgu
        this.alici = alici;
        this.icerik = new ArrayList<>(icerik);
    }

    protected Gonderi(Gonderi kaynak) {                 // kopya kurucu: doğrulanmış nesneden
        this.alici = kaynak.alici;                      // String değişmez → paylaşmak güvenli
        this.icerik = kaynak.icerik;                    // SIĞ: aynı liste paylaşılır!
    }

    public abstract Gonderi kopyala();                  // «clone»: kendinin kopyasını döndür

    public void ekle(String urun) {
        icerik.add(urun);
    }
}
