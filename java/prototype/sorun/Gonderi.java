// Bu dosya tools/export-java.js ile js/patterns/prototype/data.js içinden üretildi.
package prototype.sorun;

import java.util.ArrayList;
import java.util.List;

public abstract class Gonderi {

    protected final String alici;
    protected final List<String> icerik;

    protected Gonderi(String alici, List<String> icerik) {
        AdresServisi.dogrula(alici);                    // pahalı: dış servise sorgu
        this.alici = alici;
        this.icerik = new ArrayList<>(icerik);
    }

    public String getAlici() { return alici; }

    public List<String> getIcerik() { return icerik; }

    public void ekle(String urun) {
        icerik.add(urun);
    }
}
