// Bu dosya tools/export-java.js ile js/patterns/observer/data.js içinden üretildi.
package observer.cozum;

import java.util.ArrayList;
import java.util.List;

/**
 * «Subject» — Gönderi: durumu değişince abonelerine haber verir; sınıflarını bilmez.
 */
public class Gonderi {

    private final String takipNo;
    private String durum = "Hazırlanıyor";
    private final List<GonderiGozlemcisi> aboneler = new ArrayList<>();

    public Gonderi(String takipNo) {
        this.takipNo = takipNo;
    }

    public void aboneEkle(GonderiGozlemcisi abone) {
        aboneler.add(abone);
    }

    public void aboneCikar(GonderiGozlemcisi abone) {
        aboneler.remove(abone);
    }

    private void bildir() {
        for (GonderiGozlemcisi abone : aboneler) {
            abone.guncelle(this);
        }
    }

    public void setDurum(String durum) {
        this.durum = durum;
        System.out.println("[" + takipNo + "] " + durum);
        bildir();
    }

    public void teslimEt(String teslimAlan) {
        durum = "Teslim edildi";
        System.out.println("[" + takipNo + "] " + durum + " · " + teslimAlan);
        bildir();
    }

    public String getTakipNo() {
        return takipNo;
    }

    public String getDurum() {
        return durum;
    }
}
