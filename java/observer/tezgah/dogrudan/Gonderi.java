// Bu dosya tools/export-java.js ile js/patterns/observer/data.js içinden üretildi.
package observer.tezgah.dogrudan;

/**
 * Gönderi: durumu değişince telefona, satıcı paneline ve kurye tabletine haber verir.
 */
public class Gonderi {

    private final String takipNo;
    private String durum = "Hazırlanıyor";
    private final AliciTelefonu telefon;
    private final SaticiPaneli panel;
    private final KuryeTableti tablet;

    public Gonderi(String takipNo, AliciTelefonu telefon, SaticiPaneli panel,
            KuryeTableti tablet) {
        this.takipNo = takipNo;
        this.telefon = telefon;
        this.panel = panel;
        this.tablet = tablet;
    }

    public void setDurum(String durum) {
        this.durum = durum;
        System.out.println("[" + takipNo + "] " + durum);
        telefon.smsGonder(takipNo, durum);
        panel.satirGuncelle(takipNo, durum);
        tablet.rotaGuncelle(takipNo, durum);
    }

    public void teslimEt(String teslimAlan) {
        durum = "Teslim edildi";
        System.out.println("[" + takipNo + "] " + durum + " · " + teslimAlan);
        telefon.smsGonder(takipNo, durum);
        panel.satirGuncelle(takipNo, durum);
    }
}
