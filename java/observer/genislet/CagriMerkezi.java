// Bu dosya tools/export-java.js ile js/patterns/observer/data.js içinden üretildi.
package observer.genislet;

import java.util.Map;
import java.util.TreeMap;

/**
 * «ConcreteObserver» — Çağrı merkezi: müşteri arayınca gönderinin son durumunu söyler.
 */
public class CagriMerkezi implements GonderiGozlemcisi {

    private final Map<String, String> kayitlar = new TreeMap<>();

    @Override
    public void guncelle(Gonderi gonderi) {
        String takipNo = gonderi.getTakipNo();
        String durum = gonderi.getDurum();
        kayitlar.put(takipNo, durum);
        System.out.println("  Çağrı merkezi: " + takipNo + " kaydı → " + durum);
    }

    public String sorgula(String takipNo) {
        String durum = kayitlar.getOrDefault(takipNo, "kayıt yok");
        return "Çağrı merkezi: " + takipNo + " → " + durum;
    }
}
