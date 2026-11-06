// Bu dosya tools/export-java.js ile js/patterns/observer/data.js içinden üretildi.
package observer.tuzak;

/**
 * «ConcreteObserver» — Alıcının telefonu: gönderinin her yeni durumunu SMS olarak alır.
 */
public class AliciTelefonu implements GonderiGozlemcisi {

    private final String ad;

    public AliciTelefonu(String ad) {
        this.ad = ad;
    }

    @Override
    public void guncelle(Gonderi gonderi) {
        String takipNo = gonderi.getTakipNo();
        String durum = gonderi.getDurum();
        System.out.println("  SMS → " + ad + ": " + takipNo + " " + durum);
        if (durum.equals("Teslim edildi")) {        // teslimden sonra SMS gerekmez
            gonderi.aboneCikar(this);
        }
    }
}
