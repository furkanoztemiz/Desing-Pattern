// Bu dosya tools/export-java.js ile js/patterns/observer/data.js içinden üretildi.
package observer.tezgah.sabit;

import java.util.ArrayList;
import java.util.List;

/**
 * Gönderi: abone listesindeki herkese haber verir; liste kurucuda sabitlenir.
 */
public class Gonderi {

    private final String takipNo;
    private String durum = "Hazırlanıyor";
    private final List<GonderiGozlemcisi> aboneler = new ArrayList<>();

    public Gonderi(String takipNo, AliciTelefonu telefon, SaticiPaneli panel,
            KuryeTableti tablet) {
        this.takipNo = takipNo;
        aboneler.add(telefon);
        aboneler.add(panel);
        aboneler.add(tablet);
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
